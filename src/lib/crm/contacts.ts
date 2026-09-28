/** Contacts : une fiche par personne, avec ses demandes et ses sessions. */
import { and, count, desc, eq, like, or, sql, sum } from 'drizzle-orm';
import { getDb, schema } from '../db';

const now = () => Date.now();

export interface ContactListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  requests: number;
  outings: number;
  lastSeen: number;
}

export async function listContacts(q = ''): Promise<ContactListItem[]> {
  const db = await getDb();
  const term = q.trim() ? `%${q.trim().toLowerCase()}%` : null;
  const rows = await db
    .select({
      id: schema.contacts.id,
      name: schema.contacts.name,
      email: schema.contacts.email,
      phone: schema.contacts.phone,
      updatedAt: schema.contacts.updatedAt,
      requests: sql<number>`(select count(*) from requests r where r.contact_id = contacts.id)`,
      outings: sql<number>`(select count(*) from participants p where p.contact_id = contacts.id)`,
      lastRequest: sql<number | null>`(select max(created_at) from requests r where r.contact_id = contacts.id)`,
    })
    .from(schema.contacts)
    .where(
      term
        ? or(like(sql`lower(${schema.contacts.name})`, term), like(sql`lower(${schema.contacts.email})`, term), like(schema.contacts.phone, term))
        : undefined,
    )
    .orderBy(desc(schema.contacts.updatedAt))
    .limit(500);
  return rows.map((r) => ({ ...r, requests: Number(r.requests), outings: Number(r.outings), lastSeen: Math.max(r.updatedAt, Number(r.lastRequest ?? 0)) }));
}

export async function getContact(id: string) {
  const db = await getDb();
  const contact = await db.query.contacts.findFirst({ where: eq(schema.contacts.id, id) });
  if (!contact) return null;
  const requests = await db
    .select()
    .from(schema.requests)
    .where(eq(schema.requests.contactId, id))
    .orderBy(desc(schema.requests.createdAt));
  const participations = await db
    .select({ participant: schema.participants, outing: schema.outings })
    .from(schema.participants)
    .innerJoin(schema.outings, eq(schema.outings.id, schema.participants.outingId))
    .where(eq(schema.participants.contactId, id))
    .orderBy(desc(schema.outings.startsAt));
  return { contact, requests, participations };
}

export async function createContact(input: { name: string; email: string; phone?: string; notes?: string }): Promise<{ id: string } | { error: string }> {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim()) return { error: 'Le nom est nécessaire.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'L’adresse email ne semble pas valide.' };
  const existing = await db.query.contacts.findFirst({ where: eq(schema.contacts.email, email) });
  if (existing) return { error: 'Un contact existe déjà avec cette adresse.' };
  const id = crypto.randomUUID();
  const t = now();
  await db.insert(schema.contacts).values({ id, email, name: input.name.trim(), phone: input.phone?.trim() || null, notes: input.notes?.trim() || null, createdAt: t, updatedAt: t });
  return { id };
}

export async function updateContact(id: string, input: { name: string; email: string; phone?: string; notes?: string }): Promise<{ ok: true } | { error: string }> {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim()) return { error: 'Le nom est nécessaire.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'L’adresse email ne semble pas valide.' };
  const clash = await db.query.contacts.findFirst({ where: and(eq(schema.contacts.email, email), sql`${schema.contacts.id} != ${id}`) });
  if (clash) return { error: 'Un autre contact utilise déjà cette adresse.' };
  await db
    .update(schema.contacts)
    .set({ name: input.name.trim(), email, phone: input.phone?.trim() || null, notes: input.notes?.trim() || null, updatedAt: now() })
    .where(eq(schema.contacts.id, id));
  return { ok: true };
}

/** Supprime la personne, ses demandes et ses participations (droit à l'effacement). */
export async function deleteContact(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.participants).where(eq(schema.participants.contactId, id));
  await db.delete(schema.requests).where(eq(schema.requests.contactId, id));
  await db.delete(schema.contacts).where(eq(schema.contacts.id, id));
}

export async function allContactsBrief(): Promise<{ id: string; name: string; email: string }[]> {
  const db = await getDb();
  return db
    .select({ id: schema.contacts.id, name: schema.contacts.name, email: schema.contacts.email })
    .from(schema.contacts)
    .orderBy(sql`lower(${schema.contacts.name})`)
    .limit(1000);
}

export async function countContacts(): Promise<number> {
  const db = await getDb();
  return (await db.select({ n: count() }).from(schema.contacts).get())?.n ?? 0;
}

export { sum };
