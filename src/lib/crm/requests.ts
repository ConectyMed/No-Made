/**
 * Demandes de session (mini CRM) : enregistrement depuis le formulaire public, liste, détail,
 * statut et notes, suppression (RGPD). Chaque demande est rattachée à un contact, créé ou
 * retrouvé par son email.
 */
import { and, count, desc, eq, like, or, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { REQUEST_STATUSES, type RequestStatus } from '../db/schema';
import type { SessionRequest } from '../types';

const now = () => Date.now();

export async function upsertContact(input: { name: string; email: string; phone?: string }): Promise<string> {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  const existing = await db.query.contacts.findFirst({ where: eq(schema.contacts.email, email) });
  const t = now();
  if (existing) {
    await db
      .update(schema.contacts)
      .set({ name: input.name.trim() || existing.name, phone: input.phone?.trim() || existing.phone, updatedAt: t })
      .where(eq(schema.contacts.id, existing.id));
    return existing.id;
  }
  const id = crypto.randomUUID();
  await db.insert(schema.contacts).values({ id, email, name: input.name.trim(), phone: input.phone?.trim() || null, createdAt: t, updatedAt: t });
  return id;
}

export async function createRequest(req: SessionRequest, offerLabel: string): Promise<string> {
  const db = await getDb();
  const contactId = await upsertContact({ name: req.name, email: req.email, phone: req.phone });
  const id = crypto.randomUUID();
  const t = now();
  await db.insert(schema.requests).values({
    id,
    contactId,
    offerSlug: req.offerSlug,
    offerLabel,
    groupSize: req.groupSize,
    preferredPeriod: req.preferredPeriod,
    message: req.message ?? null,
    status: 'nouvelle',
    createdAt: t,
    updatedAt: t,
  });
  return id;
}

export interface RequestListItem {
  id: string;
  status: RequestStatus;
  offerLabel: string;
  groupSize: number;
  preferredPeriod: string;
  createdAt: number;
  contactName: string;
  contactEmail: string;
}

export async function listRequests(opts: { status?: RequestStatus | 'toutes'; q?: string } = {}): Promise<RequestListItem[]> {
  const db = await getDb();
  const filters = [];
  if (opts.status && opts.status !== 'toutes') filters.push(eq(schema.requests.status, opts.status));
  if (opts.q?.trim()) {
    const term = `%${opts.q.trim().toLowerCase()}%`;
    filters.push(
      or(
        like(sql`lower(${schema.contacts.name})`, term),
        like(sql`lower(${schema.contacts.email})`, term),
        like(sql`lower(${schema.requests.preferredPeriod})`, term),
        like(sql`lower(${schema.requests.offerLabel})`, term),
      ),
    );
  }
  const rows = await db
    .select({
      id: schema.requests.id,
      status: schema.requests.status,
      offerLabel: schema.requests.offerLabel,
      groupSize: schema.requests.groupSize,
      preferredPeriod: schema.requests.preferredPeriod,
      createdAt: schema.requests.createdAt,
      contactName: schema.contacts.name,
      contactEmail: schema.contacts.email,
    })
    .from(schema.requests)
    .innerJoin(schema.contacts, eq(schema.contacts.id, schema.requests.contactId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(schema.requests.createdAt))
    .limit(500);
  return rows;
}

export async function countRequestsByStatus(): Promise<Record<RequestStatus | 'toutes', number>> {
  const db = await getDb();
  const rows = await db.select({ status: schema.requests.status, n: count() }).from(schema.requests).groupBy(schema.requests.status);
  const out = { toutes: 0, nouvelle: 0, repondue: 0, confirmee: 0, annulee: 0 } as Record<RequestStatus | 'toutes', number>;
  for (const r of rows) {
    out[r.status] = r.n;
    out.toutes += r.n;
  }
  return out;
}

export async function getRequest(id: string) {
  const db = await getDb();
  const row = await db
    .select({ request: schema.requests, contact: schema.contacts })
    .from(schema.requests)
    .innerJoin(schema.contacts, eq(schema.contacts.id, schema.requests.contactId))
    .where(eq(schema.requests.id, id))
    .get();
  if (!row) return null;
  const others = await db
    .select({ id: schema.requests.id, offerLabel: schema.requests.offerLabel, status: schema.requests.status, createdAt: schema.requests.createdAt })
    .from(schema.requests)
    .where(and(eq(schema.requests.contactId, row.contact.id), sql`${schema.requests.id} != ${id}`))
    .orderBy(desc(schema.requests.createdAt));
  return { ...row, others };
}

export function isRequestStatus(s: unknown): s is RequestStatus {
  return typeof s === 'string' && (REQUEST_STATUSES as readonly string[]).includes(s);
}

export async function updateRequest(id: string, patch: { status?: RequestStatus; notes?: string }): Promise<void> {
  const db = await getDb();
  const set: Partial<typeof schema.requests.$inferInsert> = { updatedAt: now() };
  if (patch.status) {
    set.status = patch.status;
    if (patch.status === 'repondue') set.repliedAt = now();
  }
  if (patch.notes !== undefined) set.notes = patch.notes.trim() || null;
  await db.update(schema.requests).set(set).where(eq(schema.requests.id, id));
}

/** Marque « répondue » seulement si la demande est encore « nouvelle » (clic sur Répondre). */
export async function markRepliedIfNew(id: string): Promise<void> {
  const db = await getDb();
  await db
    .update(schema.requests)
    .set({ status: 'repondue', repliedAt: now(), updatedAt: now() })
    .where(and(eq(schema.requests.id, id), eq(schema.requests.status, 'nouvelle')));
}

export async function updateContactNotes(contactId: string, notes: string): Promise<void> {
  const db = await getDb();
  await db.update(schema.contacts).set({ notes: notes.trim() || null, updatedAt: now() }).where(eq(schema.contacts.id, contactId));
}

/** Supprime la demande, et le contact s'il n'a plus rien (RGPD : droit à l'effacement). */
export async function deleteRequest(id: string): Promise<void> {
  const db = await getDb();
  const row = await db.query.requests.findFirst({ where: eq(schema.requests.id, id) });
  if (!row) return;
  await db.delete(schema.requests).where(eq(schema.requests.id, id));
  const left = await db.select({ n: count() }).from(schema.requests).where(eq(schema.requests.contactId, row.contactId)).get();
  const part = await db.select({ n: count() }).from(schema.participants).where(eq(schema.participants.contactId, row.contactId)).get();
  if ((left?.n ?? 0) === 0 && (part?.n ?? 0) === 0) {
    await db.delete(schema.contacts).where(eq(schema.contacts.id, row.contactId));
  }
}
