import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib';
import { badgeVariants } from './variants';
import './StyleSheet.scss';

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