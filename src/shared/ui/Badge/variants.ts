import { cva } from 'class-variance-authority';

export type BadgeVariant = 'performance' | 'core' | 'leadership' | 'rating' | 'neutral' | 'poinGroup';

export const badgeVariants = cva('ui-badge', {
  variants: {
    variant: {
      performance: 'ui-badge--performance',
      core: 'ui-badge--core',
      leadership: 'ui-badge--leadership',
      rating: 'ui-badge--rating',
      poinGroup: 'ui-badge--poin-group',
      neutral: 'ui-badge--neutral',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export function categoryVariant(code: string): BadgeVariant {
  if (code === 'performance-assessment') return 'performance';
  if (code === 'core-value-assessment') return 'core';
  if (code === 'leadership-assessment') return 'leadership';
  return 'neutral';
}