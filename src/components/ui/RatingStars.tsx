import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_RATING } from '@/lib/ratings';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

export function RatingStars({ rating, max = MAX_RATING, size = 14, className }: RatingStarsProps) {
  return (
    <span className={cn('inline-flex gap-0.5 items-center', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1 font-medium">{rating}/{max}</span>
    </span>
  );
}
