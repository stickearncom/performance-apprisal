import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { AppraisalItem, ExampleDetail, Lang, Role, RoleLevel } from '@/types';
import { RATING_LABELS } from '@/lib/ratings';
import { Badge } from '@/components/ui/Badge';
import { categoryVariant } from '@/components/ui/Badge/variants';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { RatingStars } from '@/components/ui/RatingStars';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

interface DetailDrawerProps {
  item: AppraisalItem;
  siblingItems: AppraisalItem[];
  lang: Lang;
  previousGroup: { item: AppraisalItem; title: string; poinGroup: AppraisalItem['poinGroup'] } | null;
  nextGroup: { item: AppraisalItem; title: string; poinGroup: AppraisalItem['poinGroup'] } | null;
  onSelectItem: (item: AppraisalItem) => void;
  onClose: () => void;
}

const ROLE_TABS: { value: Role; label: string }[] = [
  { value: 'qa',       label: 'QA' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend',  label: 'Backend' },
];

const LEVEL_TABS: { value: RoleLevel; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead',   label: 'Lead' },
];

function parseExampleDetail(detail: ExampleDetail) {
  const introText = detail.info.trim();
  const bulletItems = detail.example
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    introText,
    bulletItems,
  };
}

function renderExampleText(detail: ExampleDetail, expanded: boolean) {
  const { introText, bulletItems } = parseExampleDetail(detail);

  if (bulletItems.length === 0) {
    return <p>{introText}</p>;
  }

  const visibleItems = expanded ? bulletItems : bulletItems.slice(0, 2);

  return (
    <div className="space-y-3">
      {introText && <p>{introText}</p>}
      <ul className="list-disc space-y-2 pl-5">
        {visibleItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}


export function DetailDrawer({
  item,
  siblingItems,
  lang,
  previousGroup,
  nextGroup,
  onSelectItem,
  onClose,
}: DetailDrawerProps) {
  const [activeRole,  setActiveRole]  = useState<Role>('qa');
  const [activeLevel, setActiveLevel] = useState<RoleLevel>('junior');

  const exampleDetail = item.examples[activeRole][activeLevel];
  const parsedExample = useMemo(() => parseExampleDetail(exampleDetail), [exampleDetail]);
  const shouldCollapse = parsedExample.bulletItems.length > 2 || parsedExample.introText.length > 260;
  const isExpanded = true;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent hideClose className="p-0 overflow-hidden">
        {/* Header */}
        <div className="drawer-header flex items-start justify-between border-b border-gray-100 shrink-0 bg-white">
          <div className="drawer-header-badges flex flex-wrap gap-2 items-center pr-3">
            <Badge label={item.category.label} variant={categoryVariant(item.category.code)} />
            {item.poinGroup && (
              <Badge label={item.poinGroup.label} variant="poinGroup" />
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Goal + Rating */}
          <div className="drawer-section border-b border-gray-50">
            <h2 className="drawer-title text-base font-semibold text-gray-900 leading-snug">
              {item.goal.label}
            </h2>
            <div className="drawer-rating-row flex items-center gap-3">
              <RatingStars rating={item.rating} size={15} />
              <span className="text-xs text-gray-400">{RATING_LABELS[item.rating]}</span>
            </div>

            {siblingItems.length > 1 && (
              <div className="drawer-related-ratings">
                <p className="drawer-section-label text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Rating Dalam Goal Ini
                </p>
                <div className="drawer-rating-switcher">
                  {siblingItems.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => onSelectItem(candidate)}
                      className={cn('drawer-rating-option', {
                        active: candidate.id === item.id,
                      })}
                    >
                      <span className="drawer-rating-option-value">Rating {candidate.rating}</span>
                      <span className="drawer-rating-option-label">{RATING_LABELS[candidate.rating]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Criteria */}
          <div className="drawer-section border-b border-gray-50">
            <p className="drawer-section-label text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Kriteria
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {item.criteria[lang]}
            </p>
          </div>

          {/* Examples */}
          <div className="drawer-section">
            <p className="drawer-section-label text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Contoh Kasus
            </p>

            {/* Role tabs */}
            <Tabs
              tabs={ROLE_TABS}
              active={activeRole}
              onChange={r => setActiveRole(r)}
              className="drawer-tabs"
            />

            {/* Level tabs */}
            <Tabs
              tabs={LEVEL_TABS}
              active={activeLevel}
              onChange={l => setActiveLevel(l)}
              className="drawer-tabs drawer-tabs-secondary"
            />

            {/* Example text */}
            <div className={cn(
              'drawer-example rounded-2xl text-sm text-gray-700 leading-relaxed',
              'bg-gray-50 border border-gray-100 min-h-28',
            )}>
              {exampleDetail
                ? renderExampleText(exampleDetail, isExpanded || !shouldCollapse)
                : <span className="text-gray-400 italic">Tidak ada contoh.</span>}
            </div>

            {(previousGroup || nextGroup) && (
              <div className="drawer-group-navigation drawer-group-navigation-bottom">
                <p className="drawer-section-label text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Pindah Kelompok
                </p>
                <div className="drawer-group-navigation-grid">
                  {previousGroup ? (
                    <button
                      type="button"
                      onClick={() => onSelectItem(previousGroup.item)}
                      className="drawer-group-navigation-button"
                    >
                      <span className="drawer-group-navigation-icon">
                        <ArrowLeft size={14} />
                      </span>
                      <span className="drawer-group-navigation-title">{previousGroup.title}</span>
                      {previousGroup.poinGroup && (
                        <span className="drawer-group-navigation-subtitle">{previousGroup.poinGroup.label}</span>
                      )}
                    </button>
                  ) : (
                    <div className="drawer-group-navigation-spacer" />
                  )}

                  {nextGroup ? (
                    <button
                      type="button"
                      onClick={() => onSelectItem(nextGroup.item)}
                      className="drawer-group-navigation-button align-end"
                    >
                      <span className="drawer-group-navigation-icon">
                        <ArrowRight size={14} />
                      </span>
                      <span className="drawer-group-navigation-title">{nextGroup.title}</span>
                      {nextGroup.poinGroup && (
                        <span className="drawer-group-navigation-subtitle">{nextGroup.poinGroup.label}</span>
                      )}
                    </button>
                  ) : (
                    <div className="drawer-group-navigation-spacer" />
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
