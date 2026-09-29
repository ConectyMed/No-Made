/**
 * Schéma de la base (SQLite / Turso). Tables :
 *  - users, auth_sessions, password_tokens : les comptes de l'admin (deux personnes).
 *  - contacts : une fiche par personne qui a écrit.
 *  - requests : les demandes du formulaire, avec statut et notes (mini CRM).
 *  - outings, participants : les sessions planifiées et qui y participe (étape 2).
 *  - articles : les textes de la page « Ma philosophie », écrits depuis l'admin.
 *  - media : les photos des articles, réduites dans le navigateur avant l'envoi, servies par /photos/<id>.
 * Dates en millisecondes depuis l'epoch, montants en centimes.
 */
import { sqliteTable, text, integer, index, blob } from 'drizzle-orm/sqlite-core';

export const REQUEST_STATUSES = ['nouvelle', 'repondue', 'confirmee', 'annulee'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const OUTING_STATUSES = ['prevue', 'faite', 'annulee'] as const;
export type OutingStatus = (typeof OUTING_STATUSES)[number];

export const ARTICLE_STATUSES = ['brouillon', 'publie'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role', { enum: ['admin'] }).notNull().default('admin'),
  failedLogins: integer('failed_logins').notNull().default(0),
  lockedUntil: integer('locked_until'),
  lastLoginAt: integer('last_login_at'),
  /** 1 pour le compte de démarrage tant que son mot de passe n'a pas été changé. */
  mustChangePassword: integer('must_change_password').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    /** SHA-256 du jeton porté par le cookie : le jeton lui-même n'est jamais stocké. */
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('auth_sessions_user_idx').on(t.userId)],
);

export const passwordTokens = sqliteTable('password_tokens', {
  /** SHA-256 du jeton du lien envoyé par email. */
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  expiresAt: integer('expires_at').notNull(),
  usedAt: integer('used_at'),
  createdAt: integer('created_at').notNull(),
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const requests = sqliteTable(
  'requests',
  {
    id: text('id').primaryKey(),
    contactId: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    offerSlug: text('offer_slug').notNull(),
    offerLabel: text('offer_label').notNull(),
    groupSize: integer('group_size').notNull(),
    preferredPeriod: text('preferred_period').notNull(),
    message: text('message'),
    status: text('status', { enum: REQUEST_STATUSES }).notNull().default('nouvelle'),
    notes: text('notes'),
    outingId: text('outing_id'),
    repliedAt: integer('replied_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [index('requests_status_idx').on(t.status), index('requests_contact_idx').on(t.contactId)],
);

export const outings = sqliteTable(
  'outings',
  {
    id: text('id').primaryKey(),
    offerSlug: text('offer_slug').notNull(),
    offerLabel: text('offer_label').notNull(),
    startsAt: integer('starts_at').notNull(),
    durationMin: integer('duration_min'),
    place: text('place'),
    status: text('status', { enum: OUTING_STATUSES }).notNull().default('prevue'),
    /** Montant encaissé pour la session, prérempli d'après l'offre, modifiable. */
    amountCents: integer('amount_cents').notNull().default(0),
    notes: text('notes'),
    /** 1 : session groupée affichée sur le site (« Prochaines sorties »), on peut y demander une place. */
    isPublic: integer('is_public').notNull().default(0),
    /** Places au total pour une session publiée (participants compris). */
    capacity: integer('capacity'),
    /** Zone affichée publiquement (ex. « Calanques, Marseille ») ; le lieu exact reste privé, envoyé par email. */
    publicArea: text('public_area'),
    doneAt: integer('done_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [index('outings_starts_idx').on(t.startsAt), index('outings_status_idx').on(t.status)],
);

export const participants = sqliteTable(
  'participants',
  {
    id: text('id').primaryKey(),
    outingId: text('outing_id')
      .notNull()
      .references(() => outings.id, { onDelete: 'cascade' }),
    contactId: text('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    requestId: text('request_id'),
    /** Nombre de personnes couvertes par ce contact (un parent + un enfant = 2). */
    people: integer('people').notNull().default(1),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('participants_outing_idx').on(t.outingId), index('participants_contact_idx').on(t.contactId)],
);

export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    /** Adresse publique : /philosophie/<slug>/. ASCII, unique. */
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    /** Chapô : affiché dans la liste, sous le titre, et comme description pour les moteurs de recherche. */
    excerpt: text('excerpt'),
    /** Texte en Markdown simple (titres, listes, gras, italique, liens, citations), voir src/lib/markdown.ts. */
    body: text('body').notNull().default(''),
    status: text('status', { enum: ARTICLE_STATUSES }).notNull().default('brouillon'),
    /** Photo de couverture (table media) : en tête d'article, dans la liste et pour les partages. */
    coverId: text('cover_id'),
    coverAlt: text('cover_alt'),
    /** Fixée à la première publication ; sert à l'ordre et à la date affichée. */
    publishedAt: integer('published_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [index('articles_status_idx').on(t.status, t.publishedAt)],
);

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  mime: text('mime').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  bytes: integer('bytes').notNull(),
  data: blob('data', { mode: 'buffer' }).notNull(),
  createdAt: integer('created_at').notNull(),
});

export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type RequestRow = typeof requests.$inferSelect;
export type Outing = typeof outings.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Article = typeof articles.$inferSelect;
