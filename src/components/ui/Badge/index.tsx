import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { badgeVariants } from './variants';
import './styles.scss';

interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, variant = 'neutral', className }: BadgeProps & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {label}
    </span>
  );
}