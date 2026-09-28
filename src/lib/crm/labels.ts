import type { RequestStatus, OutingStatus } from '../db/schema';

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  nouvelle: 'Nouvelle',
  repondue: 'Répondue',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
};

export const OUTING_STATUS_LABEL: Record<OutingStatus, string> = {
  prevue: 'Prévue',
  faite: 'Faite',
  annulee: 'Annulée',
};
