export const MAX_RATING = 6;

export const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Kurang',
  2: 'Kurang',
  3: 'Cukup',
  4: 'Baik',
  5: 'Sangat Baik',
  6: 'Istimewa',
};

export const RATING_OPTIONS = Array.from({ length: MAX_RATING }, (_, index) => index + 1);