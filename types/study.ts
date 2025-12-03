export type StudyStatus = 'en_cours' | 'livre' | 'facture' | 'clos';

export interface Study {
  id: string;
  name: string;
  client: string;
  amount: number;
  status: StudyStatus;
  createdAt: string;
}

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  en_cours: 'En cours ⏳',
  livre: 'Livré 📦',
  facture: 'Facturé 💰',
  clos: 'Clos ✅',
};

export const normalizeStatus = (status?: string | null): StudyStatus => {
  switch (status) {
    case 'livre':
    case 'facture':
    case 'clos':
    case 'en_cours':
      return status;
    default:
      return 'en_cours';
  }
};

export const getStatusLabel = (status: StudyStatus): string => STUDY_STATUS_LABELS[status];

export const STUDY_STATUS_ORDER: StudyStatus[] = ['en_cours', 'livre', 'facture', 'clos'];
