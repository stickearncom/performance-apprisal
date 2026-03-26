import { DetailDrawer } from '@/components/DetailDrawer';
import { GoalSection } from '@/components/GoalSection';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import '@/styles/app.scss';
import type { AppraisalItem, FilterState } from '@/types';
import { startTransition, useEffect, useMemo, useState } from 'react';

const defaultFilters: FilterState = {
  search:    '',
  category:  'all',
  poinGroup: 'all',
  rating:    null,
  lang:      'id',
};

export default function App() {
  const [items, setItems] = useState<AppraisalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters,  setFilters]  = useState<FilterState>(defaultFilters);
  const [selected, setSelected] = useState<AppraisalItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);

      const module = await import('@/data/appraisal.json');

      if (cancelled) return;

      startTransition(() => {
        setItems((module.default as { items: AppraisalItem[] }).items);
        setIsLoading(false);
      });
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => Array.from(
    new Map(items.map(i => [i.category.code, i.category])).values(),
  ), [items]);

  const poinGroups = useMemo(() => Array.from(
    new Map(
      items
        .filter(i => i.poinGroup !== null)
        .map(i => [i.poinGroup!.code, i.poinGroup!]),
    ).values(),
  ), [items]);

  const updateFilter = (patch: Partial<FilterState>) =>
    setFilters(prev => ({ ...prev, ...patch }));

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return items.filter(item => {
      if (filters.category !== 'all' && item.category.code !== filters.category) return false;
      if (filters.poinGroup !== 'all' && item.poinGroup?.code !== filters.poinGroup) return false;
      if (filters.rating    && item.rating             !== filters.rating)    return false;
      if (q) {
        const haystack = [
          item.goal.label,
          item.criteria.id, item.criteria.en,
          item.poinGroup?.label ?? '',
          item.poinGroup?.code ?? '',
          item.category.label,
          item.goal.code,
          ...Object.values(item.examples).flatMap((roleExamples) =>
            Object.values(roleExamples).flatMap((detail) => [detail.info, ...detail.example]),
          ),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filters, items]);

  const grouped = useMemo(() => {
    const groupMap = new Map<string, {
      key: string;
      title: string;
      category: AppraisalItem['category'];
      poinGroup: AppraisalItem['poinGroup'];
      items: AppraisalItem[];
    }>();

    for (const item of filtered) {
      const key = [item.category.code, item.poinGroup?.code ?? 'none', item.goal.code].join('::');
      const existing = groupMap.get(key);

      if (existing) {
        existing.items.push(item);
        continue;
      }

      groupMap.set(key, {
        key,
        title: item.goal.label,
        category: item.category,
        poinGroup: item.poinGroup,
        items: [item],
      });
    }

    return Array.from(groupMap.values())
      .map(section => ({
        ...section,
        items: section.items.slice().sort((left, right) => left.rating - right.rating),
      }))
      .sort((left, right) => {
        const categoryCompare = left.category.label.localeCompare(right.category.label);
        if (categoryCompare !== 0) return categoryCompare;
        const poinGroupCompare = (left.poinGroup?.label ?? '').localeCompare(right.poinGroup?.label ?? '');
        if (poinGroupCompare !== 0) return poinGroupCompare;
        return left.title.localeCompare(right.title);
      });
  }, [filtered]);

  const selectedGroupItems = useMemo(() => {
    if (!selected) return [];

    const selectedGroup = grouped.find((section) =>
      section.items.some((groupItem) => groupItem.id === selected.id),
    );

    return selectedGroup?.items ?? [];
  }, [grouped, selected]);

  const drawerNavigation = useMemo(() => {
    if (!selected) {
      return {
        previous: null,
        next: null,
      };
    }

    const selectedGroupIndex = grouped.findIndex((section) =>
      section.items.some((groupItem) => groupItem.id === selected.id),
    );

    if (selectedGroupIndex === -1) {
      return {
        previous: null,
        next: null,
      };
    }

    const pickNavigationTarget = (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= grouped.length) return null;

      const targetSection = grouped[sectionIndex];
      const ratingOneItem = targetSection.items.find((candidate) => candidate.rating === 1);
      const targetItem = ratingOneItem ?? targetSection.items[0] ?? null;

      if (!targetItem) return null;

      return {
        item: targetItem,
        title: targetSection.title,
        poinGroup: targetSection.poinGroup,
      };
    };

    return {
      previous: pickNavigationTarget(selectedGroupIndex - 1),
      next: pickNavigationTarget(selectedGroupIndex + 1),
    };
  }, [grouped, selected]);

  return (
    <div className="app-layout">
      <Header />

      <div className="app-body">
        <Sidebar
          filters={filters}
          onChange={updateFilter}
          categories={categories}
          poinGroups={poinGroups}
        />

        <main className="app-main">
          <section className="content-shell results-toolbar">
            <div className="results-meta">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-semibold mb-2">
                  Internal Review Library
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
                  Performance Appraisal Criteria Explorer
                </h2>
                <div className="results-summary-row">
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-2xl">
                    Kriteria ditampilkan per goal agar rating 1-6 untuk tema yang sama bisa dibandingkan dalam satu kelompok.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                  {isLoading ? (
                    <>Memuat library appraisal...</>
                  ) : (
                    <>
                  Menampilkan{' '}
                  <strong className="text-gray-800 font-semibold">{grouped.length}</strong>
                  {' '}goal group dan{' '}
                  <strong className="text-gray-800 font-semibold">{filtered.length}</strong>
                  {' '}dari{' '}
                  <strong className="text-gray-800 font-semibold">{items.length}</strong>
                  {' '}kriteria
                    </>
                  )}
              </p>
            </div>
          </section>

          {isLoading ? (
            <section className="content-shell results-grid-shell">
              <div className="goal-sections loading-goal-sections" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, sectionIndex) => (
                  <section key={sectionIndex} className="goal-section goal-section-skeleton">
                    <div className="goal-section-header">
                      <div className="goal-section-copy w-full">
                        <div className="goal-section-badges">
                          <span className="skeleton skeleton-badge" />
                          <span className="skeleton skeleton-badge" />
                          <span className="skeleton skeleton-badge short" />
                        </div>
                        <div className="skeleton skeleton-title" />
                      </div>
                    </div>

                    <div className="goal-cards-grid">
                      {Array.from({ length: 3 }).map((_, cardIndex) => (
                        <article key={cardIndex} className="appraisal-card appraisal-card-skeleton">
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex gap-2">
                              <span className="skeleton skeleton-badge" />
                              <span className="skeleton skeleton-badge short" />
                            </div>
                            <span className="skeleton skeleton-rating" />
                          </div>

                          <div className="skeleton skeleton-card-title" />
                          <div className="skeleton skeleton-line" />
                          <div className="skeleton skeleton-line" />
                          <div className="skeleton skeleton-line short" />

                          <div className="appraisal-card-footer flex items-center justify-between mt-auto border-t border-gray-100">
                            <div className="flex gap-2 flex-wrap pr-3">
                              <span className="skeleton skeleton-pill" />
                              <span className="skeleton skeleton-pill" />
                              <span className="skeleton skeleton-pill" />
                            </div>
                            <span className="skeleton skeleton-chevron" />
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>Tidak ada hasil untuk filter ini.</p>
            </div>
          ) : (
            <section className="content-shell results-grid-shell">
              <div className="goal-sections">
                {grouped.map(section => (
                  <GoalSection
                    key={section.key}
                    title={section.title}
                    category={section.category}
                    poinGroup={section.poinGroup}
                    items={section.items}
                    lang={filters.lang}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {selected && (
        <DetailDrawer
          item={selected}
          siblingItems={selectedGroupItems}
          lang={filters.lang}
          previousGroup={drawerNavigation.previous}
          nextGroup={drawerNavigation.next}
          onSelectItem={setSelected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
