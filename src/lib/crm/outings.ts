/**
 * Sessions planifiées (« outings » en base, « Sessions » dans l'interface) et participants.
 * Cocher une session « faite » fige son montant : c'est ce que le tableau de bord compte comme encaissé.
 */
import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { OUTING_STATUSES, type OutingStatus } from '../db/schema';

const now = () => Date.now();

export function isOutingStatus(s: unknown): s is OutingStatus {
  return typeof s === 'string' && (OUTING_STATUSES as readonly string[]).includes(s);
}

export interface OutingListItem {
  id: string;
  offerLabel: string;
  startsAt: number;
  durationMin: number | null;
  place: string | null;
  status: OutingStatus;
  amountCents: number;
  people: number;
  participants: number;
}

const peopleSql = sql<number>`coalesce((select sum(p.people) from participants p where p.outing_id = outings.id), 0)`;
const participantsSql = sql<number>`(select count(*) from participants p where p.outing_id = outings.id)`;

export async function listOutings(scope: 'a-venir' | 'passees' | 'toutes' = 'a-venir'): Promise<OutingListItem[]> {
  const db = await getDb();
  const t = now();
  const where =
    scope === 'a-venir'
      ? and(eq(schema.outings.status, 'prevue'), gte(schema.outings.startsAt, t - 12 * 3600_000))
      : scope === 'passees'
        ? sql`(${schema.outings.status} != 'prevue' or ${schema.outings.startsAt} < ${t - 12 * 3600_000})`
        : undefined;
  const rows = await db
    .select({
      id: schema.outings.id,
      offerLabel: schema.outings.offerLabel,
      startsAt: schema.outings.startsAt,
      durationMin: schema.outings.durationMin,
      place: schema.outings.place,
      status: schema.outings.status,
      amountCents: schema.outings.amountCents,
      people: peopleSql,
      participants: participantsSql,
    })
    .from(schema.outings)
    .where(where)
    .orderBy(scope === 'a-venir' ? asc(schema.outings.startsAt) : desc(schema.outings.startsAt))
    .limit(500);
  return rows.map((r) => ({ ...r, people: Number(r.people), participants: Number(r.participants) }));
}

export async function upcomingBrief(): Promise<{ id: string; label: string }[]> {
  const rows = await listOutings('a-venir');
  return rows.map((r) => ({ id: r.id, label: `${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(r.startsAt)} · ${r.offerLabel}` }));
}

export async function getOuting(id: string) {
  const db = await getDb();
  const outing = await db.query.outings.findFirst({ where: eq(schema.outings.id, id) });
  if (!outing) return null;
  const participants = await db
    .select({ participant: schema.participants, contact: schema.contacts })
    .from(schema.participants)
    .innerJoin(schema.contacts, eq(schema.contacts.id, schema.participants.contactId))
    .where(eq(schema.participants.outingId, id))
    .orderBy(asc(schema.participants.createdAt));
  const people = participants.reduce((n, p) => n + p.participant.people, 0);
  return { outing, participants, people };
}

export interface OutingInput {
  offerSlug: string;
  offerLabel: string;
  startsAt: number;
  durationMin: number | null;
  place: string;
  notes: string;
  amountCents: number;
  /** Session groupée publiée sur le site. */
  isPublic?: boolean;
  capacity?: number | null;
  publicArea?: string;
}

export async function createOuting(input: OutingInput): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const t = now();
  await db.insert(schema.outings).values({
    id,
    offerSlug: input.offerSlug,
    offerLabel: input.offerLabel,
    startsAt: input.startsAt,
    durationMin: input.durationMin,
    place: input.place.trim() || null,
    notes: input.notes.trim() || null,
    amountCents: input.amountCents,
    isPublic: input.isPublic ? 1 : 0,
    capacity: input.capacity ?? null,
    publicArea: input.publicArea?.trim() || null,
    status: 'prevue',
    createdAt: t,
    updatedAt: t,
  });
  return id;
}

export async function updateOuting(id: string, input: Partial<OutingInput>): Promise<void> {
  const db = await getDb();
  const set: Partial<typeof schema.outings.$inferInsert> = { updatedAt: now() };
  if (input.offerSlug !== undefined) set.offerSlug = input.offerSlug;
  if (input.offerLabel !== undefined) set.offerLabel = input.offerLabel;
  if (input.startsAt !== undefined) set.startsAt = input.startsAt;
  if (input.durationMin !== undefined) set.durationMin = input.durationMin;
  if (input.place !== undefined) set.place = input.place.trim() || null;
  if (input.notes !== undefined) set.notes = input.notes.trim() || null;
  if (input.amountCents !== undefined) set.amountCents = input.amountCents;
  if (input.isPublic !== undefined) set.isPublic = input.isPublic ? 1 : 0;
  if (input.capacity !== undefined) set.capacity = input.capacity;
  if (input.publicArea !== undefined) set.publicArea = input.publicArea.trim() || null;
  await db.update(schema.outings).set(set).where(eq(schema.outings.id, id));
}

/** Changement de statut. « faite » fige la date de réalisation ; le montant compte alors comme encaissé. */
export async function setOutingStatus(id: string, status: OutingStatus): Promise<void> {
  const db = await getDb();
  await db
    .update(schema.outings)
    .set({ status, doneAt: status === 'faite' ? now() : null, updatedAt: now() })
    .where(eq(schema.outings.id, id));
}

export async function deleteOuting(id: string): Promise<void> {
  const db = await getDb();
  await db.update(schema.requests).set({ outingId: null, updatedAt: now() }).where(eq(schema.requests.outingId, id));
  await db.delete(schema.participants).where(eq(schema.participants.outingId, id));
  await db.delete(schema.outings).where(eq(schema.outings.id, id));
}

// ---------- Sessions publiées (site public) ----------

/** Lit les champs « Publier sur le site » d'un formulaire de l'admin (composant PublishFields). */
export function readPublishFields(form: FormData): Pick<OutingInput, 'isPublic' | 'capacity' | 'publicArea'> {
  const cap = Number(form.get('capacity') ?? '');
  return {
    isPublic: form.get('isPublic') === '1',
    capacity: Number.isInteger(cap) && cap > 0 ? Math.min(cap, 20) : null,
    publicArea: String(form.get('publicArea') ?? ''),
  };
}

/** Ce que le site public montre d'une session : jamais le lieu exact, les notes ni les participants. */
export interface PublicOuting {
  id: string;
  offerSlug: string;
  offerLabel: string;
  startsAt: number;
  durationMin: number | null;
  area: string | null;
  capacity: number | null;
  /** null quand aucune capacité n'est fixée. */
  seatsLeft: number | null;
}

const toPublic = (r: { id: string; offerSlug: string; offerLabel: string; startsAt: number; durationMin: number | null; publicArea: string | null; capacity: number | null; people: number }): PublicOuting => ({
  id: r.id,
  offerSlug: r.offerSlug,
  offerLabel: r.offerLabel,
  startsAt: r.startsAt,
  durationMin: r.durationMin,
  area: r.publicArea,
  capacity: r.capacity,
  seatsLeft: r.capacity === null ? null : Math.max(0, r.capacity - Number(r.people)),
});

const publicColumns = {
  id: schema.outings.id,
  offerSlug: schema.outings.offerSlug,
  offerLabel: schema.outings.offerLabel,
  startsAt: schema.outings.startsAt,
  durationMin: schema.outings.durationMin,
  publicArea: schema.outings.publicArea,
  capacity: schema.outings.capacity,
  people: peopleSql,
};

/** Sessions groupées publiées, à venir (à partir de maintenant), les plus proches d'abord. */
export async function listPublicOutings(limit = 6): Promise<PublicOuting[]> {
  const db = await getDb();
  const rows = await db
    .select(publicColumns)
    .from(schema.outings)
    .where(and(eq(schema.outings.isPublic, 1), eq(schema.outings.status, 'prevue'), gte(schema.outings.startsAt, now())))
    .orderBy(asc(schema.outings.startsAt))
    .limit(limit);
  return rows.map(toPublic);
}

/** Une session publiée et à venir, ou null (inexistante, privée, passée ou annulée). */
export async function getPublicOuting(id: string): Promise<PublicOuting | null> {
  const db = await getDb();
  const row = await db
    .select(publicColumns)
    .from(schema.outings)
    .where(and(eq(schema.outings.id, id), eq(schema.outings.isPublic, 1), eq(schema.outings.status, 'prevue'), gte(schema.outings.startsAt, now())))
    .get();
  return row ? toPublic(row) : null;
}

// ---------- Participants ----------

export async function addParticipant(outingId: string, contactId: string, people: number, requestId: string | null = null): Promise<void> {
  const db = await getDb();
  const existing = await db.query.participants.findFirst({
    where: and(eq(schema.participants.outingId, outingId), eq(schema.participants.contactId, contactId)),
  });
  if (existing) {
    await db.update(schema.participants).set({ people, requestId: requestId ?? existing.requestId }).where(eq(schema.participants.id, existing.id));
  } else {
    await db.insert(schema.participants).values({ id: crypto.randomUUID(), outingId, contactId, people: Math.max(1, people), requestId, createdAt: now() });
  }
  if (requestId) {
    await db.update(schema.requests).set({ outingId, status: 'confirmee', updatedAt: now() }).where(eq(schema.requests.id, requestId));
  }
  await db.update(schema.outings).set({ updatedAt: now() }).where(eq(schema.outings.id, outingId));
}

export async function removeParticipant(participantId: string): Promise<void> {
  const db = await getDb();
  const p = await db.query.participants.findFirst({ where: eq(schema.participants.id, participantId) });
  if (!p) return;
  await db.delete(schema.participants).where(eq(schema.participants.id, participantId));
  if (p.requestId) await db.update(schema.requests).set({ outingId: null, updatedAt: now() }).where(eq(schema.requests.id, p.requestId));
}

/** Rattache une demande à une session : ajoute le contact comme participant et confirme la demande. */
export async function attachRequest(requestId: string, outingId: string): Promise<void> {
  const db = await getDb();
  const r = await db.query.requests.findFirst({ where: eq(schema.requests.id, requestId) });
  if (!r) return;
  await addParticipant(outingId, r.contactId, r.groupSize, requestId);
}

// ---------- Chiffres (tableau de bord) ----------

export interface Totals {
  revenueCents: number;
  done: number;
  people: number;
}

export async function totalsBetween(from: number, to: number): Promise<Totals> {
  const db = await getDb();
  const row = await db
    .select({
      revenueCents: sql<number>`coalesce(sum(${schema.outings.amountCents}), 0)`,
      done: sql<number>`count(*)`,
      people: sql<number>`coalesce(sum((select sum(p.people) from participants p where p.outing_id = outings.id)), 0)`,
    })
    .from(schema.outings)
    .where(and(eq(schema.outings.status, 'faite'), gte(schema.outings.startsAt, from), lt(schema.outings.startsAt, to)))
    .get();
  return { revenueCents: Number(row?.revenueCents ?? 0), done: Number(row?.done ?? 0), people: Number(row?.people ?? 0) };
}

export async function revenueByOffer(from: number, to: number): Promise<{ offerLabel: string; revenueCents: number; done: number }[]> {
  const db = await getDb();
  const rows = await db
    .select({ offerLabel: schema.outings.offerLabel, revenueCents: sql<number>`coalesce(sum(${schema.outings.amountCents}), 0)`, done: sql<number>`count(*)` })
    .from(schema.outings)
    .where(and(eq(schema.outings.status, 'faite'), gte(schema.outings.startsAt, from), lt(schema.outings.startsAt, to)))
    .groupBy(schema.outings.offerLabel)
    .orderBy(desc(sql`sum(${schema.outings.amountCents})`));
  return rows.map((r) => ({ ...r, revenueCents: Number(r.revenueCents), done: Number(r.done) }));
}

export async function monthlyRevenue(from: number): Promise<{ month: string; revenueCents: number; done: number }[]> {
  const db = await getDb();
  // Mois en heure de Paris, calculé côté SQL avec un décalage approximatif (+1h) : suffisant pour un histogramme.
  const rows = await db
    .select({
      month: sql<string>`strftime('%Y-%m', (${schema.outings.startsAt} / 1000) + 3600, 'unixepoch')`,
      revenueCents: sql<number>`coalesce(sum(${schema.outings.amountCents}), 0)`,
      done: sql<number>`count(*)`,
    })
    .from(schema.outings)
    .where(and(eq(schema.outings.status, 'faite'), gte(schema.outings.startsAt, from)))
    .groupBy(sql`1`)
    .orderBy(sql`1`);
  return rows.map((r) => ({ ...r, revenueCents: Number(r.revenueCents), done: Number(r.done) }));
}
