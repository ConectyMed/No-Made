/**
 * Envoi d'email via l'API HTTP de Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Un simple fetch : pas de dépendance supplémentaire.
 *
 * Variables : RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL.
 * Sans domaine vérifié chez Resend, CONTACT_FROM_EMAIL doit être "onboarding@resend.dev"
 * et seuls les envois vers l'adresse du compte Resend passent (suffisant pour tester).
 */
import { env, isDev } from './env';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export type MailResult = { ok: true; id?: string; dev?: boolean } | { ok: false; error: string };

export function mailConfig() {
  return {
    apiKey: env('RESEND_API_KEY'),
    to: env('CONTACT_TO_EMAIL'),
    from: env('CONTACT_FROM_EMAIL'),
  };
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const { apiKey, from } = mailConfig();

  // En développement sans clé : on affiche l'email dans la console au lieu de l'envoyer.
  if (!apiKey || !from) {
    if (isDev) {
      console.info('\n[mail:dev] Email non envoyé (RESEND_API_KEY ou CONTACT_FROM_EMAIL absent)\n' +
        `À : ${message.to}\nRépondre à : ${message.replyTo ?? '-'}\nSujet : ${message.subject}\n\n${message.text}\n`);
      return { ok: true, dev: true };
    }
    return { ok: false, error: 'Configuration email manquante (RESEND_API_KEY / CONTACT_FROM_EMAIL).' };
  }

  const fromName = env('CONTACT_FROM_NAME') ?? "No'Made";

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${fromName} <${from}>`,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
      reply_to: message.replyTo,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 300)}` };
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id };
}

/** Échappe le HTML d'une valeur saisie par l'utilisateur. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}
