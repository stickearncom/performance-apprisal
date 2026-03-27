import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Badge, Tabs, categoryVariant } from '@/shared/ui/index';
import { RatingStars } from '@/shared/ui';
import { cn, getDictionaryGoalPresentation, getLocalizedText, groupCriterionContextsByDivision, RATING_LABELS } from '@/shared/lib';
import type { AppraisalCriterion, AppraisalDictionaryItem, Lang } from '@/shared/types';
import './StyleSheet.scss';

interface DictionaryDetailPanelProps {
  item: AppraisalDictionaryItem;
  selectedCriterion: AppraisalCriterion;
  criteria: AppraisalCriterion[];
  lang: Lang;
  previousGroup: { item: AppraisalDictionaryItem; title: string; categoryLabel: string } | null;
  nextGroup: { item: AppraisalDictionaryItem; title: string; categoryLabel: string } | null;
  onSelectCriterion: (criterion: AppraisalCriterion) => void;
  onSelectItem: (item: AppraisalDictionaryItem) => void;
}

function parseExampleDetail(selectedCriterion: AppraisalCriterion, lang: Lang) {
  const contextGroups = groupCriterionContextsByDivision(selectedCriterion.contexts);

  return contextGroups.map((group) => ({
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

function renderContextSummary(roleName: string, divisionName: string, levelName: string) {
  return {
    summary: `${roleName} · ${divisionName} · ${levelName}`,
  };
}

export function DictionaryDetailPanel({
  item,
  selectedCriterion,
  criteria,
  lang,
  previousGroup,
  nextGroup,
  onSelectCriterion,
  onSelectItem,
}: DictionaryDetailPanelProps) {
  const contextGroups = useMemo(() => parseExampleDetail(selectedCriterion, lang), [lang, selectedCriterion]);
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
  const contextSummary = selectedContext
    ? renderContextSummary(selectedContext.role.name, selectedContext.division.name, selectedContext.level.name)
    : null;

  return (
    <article className="dictionary-detail-panel">
      <div className="dictionary-detail-panel__header">
        <div className="dictionary-detail-panel__badge-row">
          <Badge label={getLocalizedText(item.category.name, lang)} variant={categoryVariant(item.category.code)} />
        </div>
        <div className="dictionary-detail-panel__rating-summary">
          <RatingStars rating={selectedCriterion.rating} size={15} />
          <span className="dictionary-detail-panel__rating-label">{RATING_LABELS[selectedCriterion.rating]}</span>
        </div>
      </div>

      <div className="dictionary-detail-panel__title-block">
        <div className="dictionary-detail-panel__breadcrumb" aria-label="Dictionary breadcrumb">
          {breadcrumbItems.map((breadcrumbItem, index) => (
            <span key={`${breadcrumbItem}-${index}`} className="dictionary-detail-panel__breadcrumb-item">
              {index > 0 ? <span className="dictionary-detail-panel__breadcrumb-separator">/</span> : null}
              <span>{breadcrumbItem}</span>
            </span>
          ))}
        </div>
        <p className="dictionary-detail-panel__eyebrow">Selected goal</p>
        <h3 className="dictionary-detail-panel__title">{goalPresentation.title}</h3>
        {goalPresentation.subtitle ? <p className="dictionary-detail-panel__subtitle">{goalPresentation.subtitle}</p> : null}
      </div>

      {criteria.length > 1 ? (
        <div className="dictionary-detail-panel__section">
          <p className="dictionary-detail-panel__section-label">Rating variants</p>
          <div className="dictionary-detail-panel__rating-switcher">
            {criteria.map((candidate) => (
              <button
                key={candidate.uuid}
                type="button"
                onClick={() => onSelectCriterion(candidate)}
                className={cn('dictionary-detail-panel__rating-option', candidate.uuid === selectedCriterion.uuid && 'is-active')}
              >
                <span className="dictionary-detail-panel__rating-option-value">Rating {candidate.rating}</span>
                <span className="dictionary-detail-panel__rating-option-label">{RATING_LABELS[candidate.rating]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="dictionary-detail-panel__section">
        <p className="dictionary-detail-panel__section-label">Criteria</p>
        <p className="dictionary-detail-panel__copy">{getLocalizedText(selectedCriterion.name, lang)}</p>
      </div>

      <div className="dictionary-detail-panel__section">
        <p className="dictionary-detail-panel__section-label">Example contexts</p>
        <p className="dictionary-detail-panel__context-intro">
          Context sekarang dibaca bertahap: pilih division dulu, lalu role, lalu level yang tersedia pada `contexts[]` criterion aktif.
        </p>

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
              className="dictionary-detail-panel__tabs"
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
                className="dictionary-detail-panel__tabs dictionary-detail-panel__tabs--secondary"
              />
            ) : null}

            {selectedRoleGroup && selectedRoleGroup.contexts.length > 1 ? (
              <Tabs
                tabs={selectedRoleGroup.contexts.map((context) => ({ value: context.uuid, label: context.level.name }))}
                active={selectedContext?.uuid ?? ''}
                onChange={setActiveContextId}
                className="dictionary-detail-panel__tabs dictionary-detail-panel__tabs--tertiary"
              />
            ) : null}

            <div className="dictionary-detail-panel__example-card">
              {contextSummary ? <p className="dictionary-detail-panel__context-summary">{contextSummary.summary}</p> : null}
              {selectedContext?.content.introText ? <p className="dictionary-detail-panel__copy">{selectedContext.content.introText}</p> : null}
              {selectedContext && selectedContext.content.bulletItems.length > 0 ? (
                <ul className="dictionary-detail-panel__example-list">
                  {selectedContext.content.bulletItems.map((exampleItem) => (
                    <li key={exampleItem}>{exampleItem}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </>
        ) : (
          <div className="dictionary-detail-panel__example-card">
            <p className="dictionary-detail-panel__copy">Belum ada context example untuk rating ini.</p>
          </div>
        )}
      </div>

      {previousGroup || nextGroup ? (
        <div className="dictionary-detail-panel__section dictionary-detail-panel__section--navigation">
          <p className="dictionary-detail-panel__section-label">Move between goals</p>
          <div className="dictionary-detail-panel__goal-navigation-grid">
            {previousGroup ? (
              <button type="button" onClick={() => onSelectItem(previousGroup.item)} className="dictionary-detail-panel__goal-navigation-button">
                <span className="dictionary-detail-panel__goal-navigation-icon"><ArrowLeft size={14} /></span>
                <span className="dictionary-detail-panel__goal-navigation-title">{previousGroup.title}</span>
                <span className="dictionary-detail-panel__goal-navigation-subtitle">{previousGroup.categoryLabel}</span>
              </button>
            ) : <div className="dictionary-detail-panel__goal-navigation-spacer" />}

            {nextGroup ? (
              <button type="button" onClick={() => onSelectItem(nextGroup.item)} className="dictionary-detail-panel__goal-navigation-button dictionary-detail-panel__goal-navigation-button--align-end">
                <span className="dictionary-detail-panel__goal-navigation-icon"><ArrowRight size={14} /></span>
                <span className="dictionary-detail-panel__goal-navigation-title">{nextGroup.title}</span>
                <span className="dictionary-detail-panel__goal-navigation-subtitle">{nextGroup.categoryLabel}</span>
              </button>
            ) : <div className="dictionary-detail-panel__goal-navigation-spacer" />}
          </div>
        </div>
      ) : null}
    </article>
  );
}