import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Button, SearchInput } from '@/shared/ui';
import {
  cn,
  getDictionaryContextCount,
  getDictionaryGoalPresentation,
  getLocalizedText,
  normalizeAppraisalDictionaryResponse,
  patchSearchParams,
} from '@/shared/lib';
import type { AppraisalCriterion, AppraisalDictionaryItem, AppraisalDictionaryResponse, FilterState, Lang } from '@/shared/types';
import { DetailDrawer } from '../DetailDrawer';
import { DictionaryDetailPanel } from '../DictionaryDetailPanel';
import './StyleSheet.scss';

const EMPTY_FILTERS: FilterState = {
  search: '',
  category: 'all',
  goal: 'all',
  poinGroup: 'all',
  rating: null,
  lang: 'id',
};

export function DictionaryView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 960,
  );
  const [dictionaryResponse, setDictionaryResponse] = useState<AppraisalDictionaryResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategoryCode, setExpandedCategoryCode] = useState<string | null>(null);
  const [expandedGoalKeys, setExpandedGoalKeys] = useState<string[]>([]);
  const deferredSearch = useDeferredValue(searchParams.get('search') ?? '');

  useEffect(() => {
    const controller = new AbortController();

    async function loadDictionary() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch('/mock-api/appraisal.json', { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Failed to load appraisal dictionary (${response.status})`);
        }

        const payload = (await response.json()) as AppraisalDictionaryResponse;
        setDictionaryResponse(normalizeAppraisalDictionaryResponse(payload));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Failed to load dictionary data.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDictionary();

    return () => controller.abort();
  }, []);

  const items = useMemo(() => dictionaryResponse?.data.items ?? [], [dictionaryResponse]);

  const filters: FilterState = {
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? 'all',
    goal: searchParams.get('goal') ?? 'all',
    poinGroup: searchParams.get('poinGroup') ?? 'all',
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : null,
    lang: searchParams.get('lang') === 'en' ? 'en' : 'id',
  };

  const selectedItemId = searchParams.get('item');
  const selectedCriterionId = searchParams.get('criterion');

  const filteredItems = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return items.filter((item) => {
      if (!query) return true;

      const haystack = [
        item.goal.name.id,
        item.goal.name.en,
        item.goal.code,
        item.category.name.id,
        item.category.name.en,
        item.category.code,
        ...item.criteria.flatMap((criterion) => [
          criterion.name.id,
          criterion.name.en,
          String(criterion.rating),
          ...criterion.contexts.flatMap((context) => [
            context.division.name,
            context.role.name,
            context.level.name,
            context.expectation.info.id,
            context.expectation.info.en,
            ...context.expectation.examples.flatMap((example) => [example.text.id, example.text.en]),
          ]),
        ]),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearch, items]);

  const groupedSections = useMemo(() => {
    return filteredItems
      .map((item) => {
        const criteria = item.criteria.slice().sort((left, right) => left.rating - right.rating);
        const goalPresentation = getDictionaryGoalPresentation(item.goal, filters.lang);

        return {
          key: item.uuid,
          title: goalPresentation.title,
          subtitle: goalPresentation.subtitle,
          parentLabel: goalPresentation.parentLabel,
          childLabel: goalPresentation.childLabel,
          navigationTitle: goalPresentation.combinedLabel,
          category: item.category,
          item,
          criteria,
          contextCount: getDictionaryContextCount(criteria),
        };
      })
      .sort((left, right) => {
        const categoryCompare = getLocalizedText(left.category.name, filters.lang).localeCompare(
          getLocalizedText(right.category.name, filters.lang),
        );

        if (categoryCompare !== 0) return categoryCompare;

        return left.title.localeCompare(right.title);
      });
  }, [filteredItems, filters.lang]);

  const categorySections = useMemo(() => {
    const sections = new Map<
      string,
      {
        key: string;
        label: string;
        goals: Array<{
          key: string;
          title: string;
          items: typeof groupedSections;
        }>;
      }
    >();

    for (const section of groupedSections) {
      const key = section.category.code;
      const existing = sections.get(key);
      const titleKey = section.parentLabel;

      if (existing) {
        const existingGoal = existing.goals.find((goal) => goal.title === titleKey);

        if (existingGoal) {
          existingGoal.items.push(section);
        } else {
          existing.goals.push({
            key: `${key}::${titleKey}`,
            title: titleKey,
            items: [section],
          });
        }
        continue;
      }

      sections.set(key, {
        key,
        label: getLocalizedText(section.category.name, filters.lang),
        goals: [
          {
            key: `${key}::${titleKey}`,
            title: titleKey,
            items: [section],
          },
        ],
      });
    }

    return Array.from(sections.values())
      .map((section) => ({
        ...section,
        goals: section.goals
          .map((goal) => ({
            ...goal,
            items: goal.items.slice().sort((left, right) => {
              const leftLabel = left.childLabel;
              const rightLabel = right.childLabel;
              return leftLabel.localeCompare(rightLabel);
            }),
          }))
          .sort((left, right) => left.title.localeCompare(right.title)),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [filters.lang, groupedSections]);

  const selectedItem = filteredItems.find((item) => item.uuid === selectedItemId) ?? null;

  const selectedCriteria = useMemo(
    () => selectedItem?.criteria.slice().sort((left, right) => left.rating - right.rating) ?? [],
    [selectedItem],
  );

  const selectedCriterion = selectedCriteria.find((criterion) => criterion.uuid === selectedCriterionId) ?? selectedCriteria[0] ?? null;
  const selectedSection = groupedSections.find((section) =>
    selectedItem ? section.item.uuid === selectedItem.uuid : false,
  ) ?? groupedSections[0] ?? null;
  const selectedGoalGroupKey = selectedSection ? `${selectedSection.category.code}::${selectedSection.title}` : null;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 960);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (groupedSections.length === 0) {
      return;
    }

    if (!selectedItemId && isDesktop) {
      setSearchParams(
        patchSearchParams(searchParams, {
          item: groupedSections[0].item.uuid,
          criterion: groupedSections[0].criteria[0]?.uuid ?? null,
        }),
        { replace: true },
      );
      return;
    }

    const selectedStillExists = filteredItems.some((item) => item.uuid === selectedItemId);
    if (!selectedStillExists) {
      setSearchParams(
        patchSearchParams(searchParams, {
          item: isDesktop ? groupedSections[0].item.uuid : null,
          criterion: isDesktop ? groupedSections[0].criteria[0]?.uuid ?? null : null,
        }),
        { replace: true },
      );
    }
  }, [filteredItems, groupedSections, isDesktop, searchParams, selectedItemId, setSearchParams]);

  useEffect(() => {
    if (categorySections.length === 0) {
      setExpandedCategoryCode(null);
      return;
    }

    if (!expandedCategoryCode || !categorySections.some((section) => section.key === expandedCategoryCode)) {
      setExpandedCategoryCode(categorySections[0].key);
    }
  }, [categorySections, expandedCategoryCode]);

  useEffect(() => {
    if (!selectedSection) {
      return;
    }

    setExpandedCategoryCode(selectedSection.category.code);

    const selectedGoalKey = `${selectedSection.category.code}::${selectedSection.title}`;
    setExpandedGoalKeys((current) => (current.includes(selectedGoalKey) ? current : [...current, selectedGoalKey]));
  }, [selectedSection]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const criterionExists = selectedItem.criteria.some((criterion) => criterion.uuid === selectedCriterionId);

    if (!criterionExists) {
      setSearchParams(
        patchSearchParams(searchParams, { criterion: selectedItem.criteria[0]?.uuid ?? null }),
        { replace: true },
      );
    }
  }, [searchParams, selectedCriterionId, selectedItem, setSearchParams]);

  const selectedGroupItems = useMemo(() => {
    if (!selectedItem) return [];

    return groupedSections.find((section) => section.item.uuid === selectedItem.uuid)?.criteria ?? [];
  }, [groupedSections, selectedItem]);

  const drawerNavigation = useMemo(() => {
    if (!selectedItem) {
      return { previous: null, next: null };
    }

    const selectedGroupIndex = groupedSections.findIndex((section) => section.item.uuid === selectedItem.uuid);

    if (selectedGroupIndex === -1) {
      return { previous: null, next: null };
    }

    const pickNavigationTarget = (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= groupedSections.length) return null;

      const targetSection = groupedSections[sectionIndex];

      return {
        item: targetSection.item,
        title: targetSection.navigationTitle,
        categoryLabel: getLocalizedText(targetSection.category.name, filters.lang),
      };
    };

    return {
      previous: pickNavigationTarget(selectedGroupIndex - 1),
      next: pickNavigationTarget(selectedGroupIndex + 1),
    };
  }, [filters.lang, groupedSections, selectedItem]);

  const updateFilters = (
    patch: Partial<Record<'search' | 'category' | 'goal' | 'poinGroup' | 'rating' | 'lang' | 'item' | 'criterion', string | null>>,
  ) => {
    setSearchParams(patchSearchParams(searchParams, patch));
  };

  const openItem = (item: AppraisalDictionaryItem) => {
    updateFilters({ item: item.uuid, criterion: item.criteria[0]?.uuid ?? null });
  };

  const openCriterion = (criterion: AppraisalCriterion) => {
    updateFilters({ criterion: criterion.uuid });
  };

  const toggleExpandedGoal = (goalKey: string) => {
    setExpandedGoalKeys((current) =>
      current.includes(goalKey)
        ? current.filter((key) => key !== goalKey)
        : [...current, goalKey],
    );
  };

  if (isLoading) {
    return (
      <section className="dictionary-view">
        <div className="dictionary-view__empty-state">Loading dictionary data...</div>
      </section>
    );
  }

  if (loadError || !dictionaryResponse) {
    return (
      <section className="dictionary-view">
        <section className="dictionary-view__content">
          <div className="dictionary-view__empty-state">
            {loadError ?? 'Dictionary response is unavailable.'}
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="dictionary-view">
      <header className="dictionary-view__toolbar">
        <div className="dictionary-view__toolbar-search">
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilters({ search: value || null, item: null, criterion: null, category: null, goal: null })}
            placeholder="Cari goal, criteria, atau example"
          />
        </div>

        <div className="dictionary-view__toolbar-controls">
          <div className="dictionary-view__language-toggle">
            {(['id', 'en'] as Lang[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => updateFilters({ lang, item: null, criterion: null })}
                className={cn('dictionary-view__language-button', filters.lang === lang && 'is-active')}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setSearchParams(
                patchSearchParams(searchParams, {
                  search: EMPTY_FILTERS.search || null,
                  category: null,
                  goal: null,
                  lang: EMPTY_FILTERS.lang,
                  item: isDesktop ? groupedSections[0]?.item.uuid ?? null : null,
                  criterion: isDesktop ? groupedSections[0]?.criteria[0]?.uuid ?? null : null,
                }),
              )
            }
          >
            Reset
          </Button>
        </div>
      </header>

      {groupedSections.length === 0 ? (
        <div className="dictionary-view__empty-state">Tidak ada result untuk filter dictionary saat ini.</div>
      ) : (
        <div className="dictionary-view__workspace">
          <aside className="dictionary-view__list-panel">
            <div className="dictionary-view__list-header">
              <p className="dictionary-view__eyebrow">Dictionary goals</p>
              <h3 className="dictionary-view__list-title">{groupedSections.length} goals ditemukan</h3>
              <p className="dictionary-view__list-copy">Gunakan category sebagai pintu masuk. Setelah category dibuka, pilih goal yang ingin dibaca di panel detail kanan.</p>
            </div>

            <div className="dictionary-view__category-list">
              {categorySections.map((categorySection) => {
                const isExpanded = categorySection.key === expandedCategoryCode;

                return (
                  <section key={categorySection.key} className="dictionary-view__category-group">
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryCode((current) => current === categorySection.key ? null : categorySection.key)}
                      className={cn('dictionary-view__category-button', isExpanded && 'is-expanded')}
                    >
                      <div>
                        <div className="dictionary-view__category-title">{categorySection.label}</div>
                        <div className="dictionary-view__category-meta">{categorySection.goals.reduce((total, goal) => total + goal.items.length, 0)} items</div>
                      </div>
                      <ChevronDown className={cn('dictionary-view__category-chevron', isExpanded && 'is-expanded')} size={16} />
                    </button>

                    {isExpanded ? (
                      <div className="dictionary-view__goal-list">
                        {categorySection.goals.map((goalGroup) => {
                          const hasChildren = goalGroup.items.length > 1 || Boolean(goalGroup.items[0]?.subtitle);
                          const isGoalExpanded = expandedGoalKeys.includes(goalGroup.key);
                          const primaryItem = goalGroup.items[0];
                          const isGoalActive = selectedGoalGroupKey === goalGroup.key;

                          if (!primaryItem) {
                            return null;
                          }

                          return (
                            <div key={goalGroup.key} className="dictionary-view__goal-group">
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasChildren) {
                                    toggleExpandedGoal(goalGroup.key);
                                    return;
                                  }

                                  openItem(primaryItem.item);
                                }}
                                className={cn(
                                  'dictionary-view__goal-card',
                                  !hasChildren && selectedSection?.key === primaryItem.key && 'is-active',
                                  hasChildren && isGoalActive && 'is-active',
                                  hasChildren && isGoalExpanded && 'is-parent-expanded',
                                )}
                              >
                                <div className="dictionary-view__goal-card-copy">
                                  <div className="dictionary-view__goal-card-title">{goalGroup.title}</div>
                                  <div className="dictionary-view__goal-card-subtitle">
                                    {hasChildren ? `${goalGroup.items.length} child items` : 'Open detail'}
                                  </div>
                                </div>
                                {hasChildren ? <span className="dictionary-view__goal-card-count">{goalGroup.items.length}</span> : null}
                                {hasChildren ? (
                                  <ChevronDown className={cn('dictionary-view__goal-card-chevron', isGoalExpanded && 'is-expanded')} size={16} />
                                ) : (
                                  <ChevronRight className="dictionary-view__goal-card-chevron" size={16} />
                                )}
                              </button>

                              {hasChildren && isGoalExpanded ? (
                                <div className="dictionary-view__goal-children">
                                  {goalGroup.items.map((section) => (
                                    <button
                                      key={section.key}
                                      type="button"
                                      onClick={() => openItem(section.item)}
                                      className={cn('dictionary-view__goal-child', selectedSection?.key === section.key && 'is-active')}
                                    >
                                      <div className="dictionary-view__goal-child-title">{section.childLabel}</div>
                                      <ChevronRight className="dictionary-view__goal-child-chevron" size={14} />
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </aside>

          {selectedItem && selectedCriterion ? (
            <DictionaryDetailPanel
              item={selectedItem}
              selectedCriterion={selectedCriterion}
              criteria={selectedGroupItems}
              lang={filters.lang}
              previousGroup={drawerNavigation.previous}
              nextGroup={drawerNavigation.next}
              onSelectCriterion={openCriterion}
              onSelectItem={openItem}
            />
          ) : (
            <div className="dictionary-view__empty-state dictionary-view__empty-state--detail">
              Pilih goal untuk membuka detail appraisal.
            </div>
          )}
        </div>
      )}

      {selectedItem && selectedCriterion && !isDesktop ? (
        <DetailDrawer
          item={selectedItem}
          selectedCriterion={selectedCriterion}
          criteria={selectedGroupItems}
          lang={filters.lang}
          previousGroup={drawerNavigation.previous}
          nextGroup={drawerNavigation.next}
          onSelectCriterion={openCriterion}
          onSelectItem={openItem}
          onClose={() => updateFilters({ item: null, criterion: null })}
        />
      ) : null}
    </section>
  );
}