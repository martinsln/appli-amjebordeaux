import { Etude } from '@/lib/etudes';
import { normalizeStatus, StudyStatus } from '@/types/study';

export type KPIStats = {
  totalCount: number;
  byStatus: Record<StudyStatus, number>;
  totalAmount: number;
  averageAmount: number;
  createdThisMonth: number;
};

export type ChartPoint = { x: string | number; y: number };

const monthsBack = (count: number) => {
  const base = new Date();
  base.setDate(1);
  return Array.from({ length: count }, (_, idx) => {
    const d = new Date(base);
    d.setMonth(base.getMonth() - (count - 1 - idx));
    return d;
  });
};

const labelMonth = (date: Date) =>
  date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

export const computeKpis = (rows: Etude[]): KPIStats => {
  const totalCount = rows.length;
  const byStatus: Record<StudyStatus, number> = {
    en_cours: 0,
    livre: 0,
    facture: 0,
    clos: 0,
  };

  let totalAmount = 0;
  let createdThisMonth = 0;
  const now = new Date();

  rows.forEach((row) => {
    const status = normalizeStatus(row.statut);
    byStatus[status] += 1;
    totalAmount += row.montant ?? 0;

    if (row.created_at) {
      const created = new Date(row.created_at);
      if (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      ) {
        createdThisMonth += 1;
      }
    }
  });

  const averageAmount = totalCount === 0 ? 0 : totalAmount / totalCount;

  return {
    totalCount,
    byStatus,
    totalAmount,
    averageAmount,
    createdThisMonth,
  };
};

export const buildStatusPieData = (byStatus: Record<StudyStatus, number>) =>
  (Object.entries(byStatus) as [StudyStatus, number][])
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({ x: status, y: value }));

export const buildMonthlyAmountData = (rows: Etude[]): ChartPoint[] => {
  const months = monthsBack(6);
  const buckets = months.map((d) => ({
    key: `${d.getFullYear()}-${d.getMonth()}`,
    date: d,
    total: 0,
  }));

  rows.forEach((row) => {
    if (!row.created_at) return;
    const created = new Date(row.created_at);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) {
      bucket.total += row.montant ?? 0;
    }
  });

  return buckets.map((b) => ({
    x: labelMonth(b.date),
    y: b.total,
  }));
};

export const buildMonthlyCountData = (rows: Etude[]): ChartPoint[] => {
  const months = monthsBack(6);
  const buckets = months.map((d) => ({
    key: `${d.getFullYear()}-${d.getMonth()}`,
    date: d,
    total: 0,
  }));

  rows.forEach((row) => {
    if (!row.created_at) return;
    const created = new Date(row.created_at);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) {
      bucket.total += 1;
    }
  });

  return buckets.map((b) => ({
    x: labelMonth(b.date),
    y: b.total,
  }));
};
