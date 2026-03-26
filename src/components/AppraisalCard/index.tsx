import type { AppraisalItem, Lang } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { categoryVariant } from '@/components/ui/Badge/variants';
import { RatingStars } from '@/components/ui/RatingStars';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import './styles.scss';

interface AppraisalCardProps {
  item: AppraisalItem;
  lang: Lang;
  onClick: () => void;
  hideMeta?: boolean;
}

export function AppraisalCard({ item, lang, onClick, hideMeta = false }: AppraisalCardProps) {
  const goalText = item.goal.label;
  const criteriaText = item.criteria[lang];

  return (
    <article
      onClick={onClick}
      className={cn(
        'appraisal-card group bg-white rounded-3xl border border-gray-100 cursor-pointer',
        'hover:shadow-lg hover:shadow-blue-50 hover:border-blue-200/60',
        'transition-all duration-200 flex flex-col gap-4 sm:gap-5',
      )}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {!hideMeta ? (
          <div className="flex flex-wrap gap-2 pr-3">
            <Badge label={item.category.label} variant={categoryVariant(item.category.code)} />
            {item.poinGroup && (
              <Badge label={item.poinGroup.label} variant="poinGroup" />
            )}
          </div>
        ) : <div />}
        <RatingStars rating={item.rating} size={13} />
      </div>

      <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-800 leading-snug line-clamp-2">
        {goalText}
      </h3>

      <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3">
        {criteriaText}
      </p>

      <div className="appraisal-card-footer flex items-center justify-between mt-auto border-t border-gray-100">
        <div className="flex gap-2 flex-wrap pr-3">
          {(['qa', 'frontend', 'backend'] as const).map(role => (
            <span
              key={role}
              className="text-[11px] bg-gray-100 text-gray-500 rounded-full capitalize font-medium"
              style={{ padding: '2px 8px' }}
            >
              {role}
            </span>
          ))}
        </div>
        <ChevronRight
          size={15}
          className="text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </article>
  );
}