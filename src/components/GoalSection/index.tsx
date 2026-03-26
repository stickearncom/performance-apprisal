import type { AppraisalItem, CategoryInfo, Lang, PoinGroupInfo } from '@/types';
import { AppraisalCard } from '@/components/AppraisalCard';
import { Badge } from '@/components/ui/Badge';
import { categoryVariant } from '@/components/ui/Badge/variants';
import './styles.scss';

interface GoalSectionProps {
  title: string;
  category: CategoryInfo;
  poinGroup: PoinGroupInfo | null;
  items: AppraisalItem[];
  lang: Lang;
  onSelect: (item: AppraisalItem) => void;
}

export function GoalSection({ title, category, poinGroup, items, lang, onSelect }: GoalSectionProps) {
  return (
    <section className="goal-section">
      <div className="goal-section-header">
        <div className="goal-section-copy">
          <div className="goal-section-badges">
            <Badge label={category.label} variant={categoryVariant(category.code)} />
            {poinGroup && <Badge label={poinGroup.label} variant="poinGroup" />}
            <Badge label={`${items.length} rating`} variant="neutral" />
          </div>

          <h3 className="goal-section-title">{title}</h3>
        </div>
      </div>

      <div className="goal-cards-grid">
        {items.map(item => (
          <AppraisalCard
            key={item.id}
            item={item}
            lang={lang}
            onClick={() => onSelect(item)}
            hideMeta
          />
        ))}
      </div>
    </section>
  );
}