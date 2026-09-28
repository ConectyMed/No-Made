/** Formatage des prix : centimes → "30 €", "12,50 €". */
export function formatPrice(amountCents: number, locale = 'fr-FR', currency = 'EUR'): string {
  const hasCents = amountCents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amountCents / 100);
}
