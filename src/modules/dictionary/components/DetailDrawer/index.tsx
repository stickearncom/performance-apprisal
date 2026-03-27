import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

import { cn, getDictionaryGoalPresentation, getLocalizedText, groupCriterionContextsByDivision, RATING_LABELS } from '@/shared/lib';
import { Button, Badge, Dialog, DialogContent, RatingStars, Tabs, categoryVariant } from '@/shared/ui';
import type { AppraisalCriterion, AppraisalDictionaryItem, Lang } from '@/shared/types';
import './StyleSheet.scss';

interface DetailDrawerProps {
  item: AppraisalDictionaryItem;
  selectedCriterion: AppraisalCriterion;
  criteria: AppraisalCriterion[];
  lang: Lang;
  previousGroup: { item: AppraisalDictionaryItem; title: string; categoryLabel: string } | null;
  nextGroup: { item: AppraisalDictionaryItem; title: string; categoryLabel: string } | null;
  onSelectCriterion: (criterion: AppraisalCriterion) => void;
  onSelectItem: (item: AppraisalDictionaryItem) => void;
  onClose: () => void;
}

function buildContextGroups(selectedCriterion: AppraisalCriterion, lang: Lang) {
  return groupCriterionContextsByDivision(selectedCriterion.contexts).map((group) => ({
    value: group.key,
    label: group.label,
    roles: group.roles.map((role) => ({
      value: role.key,
      label: role.label,
      contexts: role.contexts.map((context) => ({
        ...context,
        content: {
          introText: getLocalizedText(context.expectation.info, lang).trim(),
          bulletItems: context.expectation.examples
            .slice()
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((example) => getLocalizedText(example.text, lang).trim())
            .filter(Boolean),
        },
      })),
    })),
  }));
}

function renderExampleText(introText: string, bulletItems: string[], expanded: boolean) {

  if (bulletItems.length === 0) {
    return <p>{introText}</p>;
  }

  const visibleItems = expanded ? bulletItems : bulletItems.slice(0, 2);

  return (
    <div className="detail-drawer__example-stack">
      {introText ? <p>{introText}</p> : null}
      <ul className="detail-drawer__example-list">
        {visibleItems.map((exampleItem) => (
          <li key={exampleItem}>{exampleItem}</li>
        ))}
      </ul>
    </div>
  );
}

export function DetailDrawer({
  item,
  selectedCriterion,
  criteria,
  lang,
  previousGroup,
  nextGroup,
  onSelectCriterion,
  onSelectItem,
  onClose,
}: DetailDrawerProps) {
  const contextGroups = useMemo(() => buildContextGroups(selectedCriterion, lang), [lang, selectedCriterion]);
  const goalPresentation = useMemo(() => getDictionaryGoalPresentation(item.goal, lang), [item.goal, lang]);
  const breadcrumbItems = useMemo(
    () => [getLocalizedText(item.category.name, lang), ...goalPresentation.breadcrumbItems],
    [goalPresentation.breadcrumbItems, item.category.name, lang],
  );
  const [activeContextGroup, setActiveContextGroup] = useState('');
  const [activeRoleGroup, setActiveRoleGroup] = useState('');
  const [activeContextId, setActiveContextId] = useState('');

  const selectedContextGroup = contextGroups.find((group) => group.value === activeContextGroup) ?? contextGroups[0] ?? null;
  const selectedRoleGroup = selectedContextGroup?.roles.find((role) => role.value === activeRoleGroup)
    ?? selectedContextGroup?.roles[0]
    ?? null;
  const selectedContext = selectedRoleGroup?.contexts.find((context) => context.uuid === activeContextId)
    ?? selectedRoleGroup?.contexts[0]
    ?? null;
  const parsedExample = selectedContext?.content ?? { introText: '', bulletItems: [] };
  const shouldCollapse = parsedExample.bulletItems.length > 2 || parsedExample.introText.length > 260;
  const isExpanded = true;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent hideClose className="detail-drawer__dialog-content">
        <div className="detail-drawer__header">
          <div className="detail-drawer__badges">
            <Badge label={getLocalizedText(item.category.name, lang)} variant={categoryVariant(item.category.code)} />
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="detail-drawer__close-button">
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="detail-drawer__scroll-area">
          <div className="detail-drawer__section detail-drawer__section--bordered">
            <div className="detail-drawer__breadcrumb" aria-label="Dictionary breadcrumb">
              {breadcrumbItems.map((breadcrumbItem, index) => (
                <span key={`${breadcrumbItem}-${index}`} className="detail-drawer__breadcrumb-item">
                  {index > 0 ? <span className="detail-drawer__breadcrumb-separator">/</span> : null}
                  <span>{breadcrumbItem}</span>
                </span>
              ))}
            </div>
            <h2 className="detail-drawer__title">{goalPresentation.title}</h2>
            {goalPresentation.subtitle ? <p className="detail-drawer__subtitle">{goalPresentation.subtitle}</p> : null}
            <div className="detail-drawer__rating-row">
              <RatingStars rating={selectedCriterion.rating} size={15} />
              <span className="detail-drawer__rating-label">{RATING_LABELS[selectedCriterion.rating]}</span>
            </div>

            {criteria.length > 1 ? (
              <div className="detail-drawer__related-ratings">
                <p className="detail-drawer__section-label">Rating Dalam Goal Ini</p>
                <div className="detail-drawer__rating-switcher">
                  {criteria.map((candidate) => (
                    <button
                      key={candidate.uuid}
                      type="button"
                      onClick={() => onSelectCriterion(candidate)}
                      className={cn('detail-drawer__rating-option', candidate.uuid === selectedCriterion.uuid && 'is-active')}
                    >
                      <span className="detail-drawer__rating-option-value">Rating {candidate.rating}</span>
                      <span className="detail-drawer__rating-option-label">{RATING_LABELS[candidate.rating]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="detail-drawer__section detail-drawer__section--bordered">
            <p className="detail-drawer__section-label">Kriteria</p>
            <p className="detail-drawer__copy">{getLocalizedText(selectedCriterion.name, lang)}</p>
          </div>

          <div className="detail-drawer__section">
            <p className="detail-drawer__section-label">Contoh Context</p>
            <p className="detail-drawer__context-intro">Pilih division dulu, lalu role, lalu level dari `contexts[]` criterion aktif agar navigasi tetap ringkas.</p>

            {contextGroups.length > 0 ? (
              <>
                <Tabs
                  tabs={contextGroups.map((group) => ({ value: group.value, label: group.label }))}
                  active={selectedContextGroup?.value ?? ''}
                  onChange={(value) => {
                    const nextGroup = contextGroups.find((group) => group.value === value);
                    setActiveContextGroup(value);
                    setActiveRoleGroup(nextGroup?.roles[0]?.value ?? '');
                    setActiveContextId(nextGroup?.roles[0]?.contexts[0]?.uuid ?? '');
                  }}
                  className="detail-drawer__tabs"
                />

                {selectedRoleGroup || (selectedContextGroup && selectedContextGroup.roles.length > 0) ? (
                  <Tabs
                    tabs={(selectedContextGroup?.roles ?? []).map((role) => ({ value: role.value, label: role.label }))}
                    active={selectedRoleGroup?.value ?? ''}
                    onChange={(value) => {
                      const nextRoleGroup = selectedContextGroup?.roles.find((role) => role.value === value);
                      setActiveRoleGroup(value);
                      setActiveContextId(nextRoleGroup?.contexts[0]?.uuid ?? '');
                    }}
                    className="detail-drawer__tabs detail-drawer__tabs--secondary"
                  />
                ) : null}

                {selectedRoleGroup && selectedRoleGroup.contexts.length > 1 ? (
                  <Tabs
                    tabs={selectedRoleGroup.contexts.map((context) => ({ value: context.uuid, label: context.level.name }))}
                    active={selectedContext?.uuid ?? ''}
                    onChange={setActiveContextId}
                    className="detail-drawer__tabs detail-drawer__tabs--tertiary"
                  />
                ) : null}

                <div className="detail-drawer__example-card">
                  {selectedContext ? <p className="detail-drawer__context-summary">{`${selectedContext.role.name} · ${selectedContext.division.name} · ${selectedContext.level.name}`}</p> : null}
                  {selectedContext ? renderExampleText(parsedExample.introText, parsedExample.bulletItems, isExpanded || !shouldCollapse) : <span className="detail-drawer__empty-copy">Tidak ada contoh.</span>}
                </div>
              </>
            ) : (
              <div className="detail-drawer__example-card">
                <span className="detail-drawer__empty-copy">Tidak ada context example.</span>
              </div>
            )}

            {previousGroup || nextGroup ? (
              <div className="detail-drawer__group-navigation detail-drawer__group-navigation--bottom">
                <p className="detail-drawer__section-label">Pindah Kelompok</p>
                <div className="detail-drawer__group-grid">
                  {previousGroup ? (
                    <button type="button" onClick={() => onSelectItem(previousGroup.item)} className="detail-drawer__group-button">
                      <span className="detail-drawer__group-icon"><ArrowLeft size={14} /></span>
                      <span className="detail-drawer__group-title">{previousGroup.title}</span>
                      <span className="detail-drawer__group-subtitle">{previousGroup.categoryLabel}</span>
                    </button>
                  ) : <div className="detail-drawer__group-spacer" />}

                  {nextGroup ? (
                    <button type="button" onClick={() => onSelectItem(nextGroup.item)} className="detail-drawer__group-button detail-drawer__group-button--align-end">
                      <span className="detail-drawer__group-icon"><ArrowRight size={14} /></span>
                      <span className="detail-drawer__group-title">{nextGroup.title}</span>
                      <span className="detail-drawer__group-subtitle">{nextGroup.categoryLabel}</span>
                    </button>
                  ) : <div className="detail-drawer__group-spacer" />}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}