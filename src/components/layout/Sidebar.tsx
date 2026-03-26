import { Star, X } from 'lucide-react';
import type { CategoryInfo, FilterState, Lang, PoinGroupInfo } from '@/types';
import { cn } from '@/lib/utils';
import { MAX_RATING, RATING_LABELS, RATING_OPTIONS } from '@/lib/ratings';
import { SearchInput } from '@/components/ui/SearchInput';

interface SidebarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  categories: CategoryInfo[];
  poinGroups: PoinGroupInfo[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'performance-assessment': '#3b82f6',
  'core-value-assessment':  '#10b981',
  'leadership-assessment':  '#8b5cf6',
};

export function Sidebar({ filters, onChange, categories, poinGroups }: SidebarProps) {
  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.poinGroup !== 'all' ||
    filters.rating !== null;

  return (
    <aside className="sidebar">
      {/* Search */}
      <div className="sidebar-section sidebar-search-block">
        <p className="sidebar-section-title pb-1!">Cari Kriteria</p>
        <SearchInput
          value={filters.search}
          onChange={v => onChange({ search: v })}
        />
      </div>

      {/* Language */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Bahasa</p>
        <div className="lang-toggle">
          {(['id', 'en'] as Lang[]).map(lang => (
            <button
              key={lang}
              onClick={() => onChange({ lang })}
              className={cn('lang-btn', { active: filters.lang === lang })}
            >
              {lang === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Kategori</p>
        <button
          onClick={() => onChange({ category: 'all', poinGroup: 'all' })}
          className={cn('filter-option', { active: filters.category === 'all' })}
        >
          <span className="filter-dot" style={{ background: '#9ca3af' }} />
          Semua Kategori
        </button>
        {categories.map(cat => (
          <button
            key={cat.code}
            onClick={() => onChange({ category: cat.code, poinGroup: 'all' })}
            className={cn('filter-option', { active: filters.category === cat.code })}
          >
            <span
              className="filter-dot"
              style={{ background: CATEGORY_COLORS[cat.code] ?? '#9ca3af' }}
            />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Poin Group — only relevant for core-value */}
      {(filters.category === 'core-value-assessment' || filters.category === 'all') && poinGroups.length > 0 && (
        <div className="sidebar-section">
          <p className="sidebar-section-title">Poin Group</p>
          <button
            onClick={() => onChange({ poinGroup: 'all' })}
            className={cn('filter-option', { active: filters.poinGroup === 'all' })}
          >
            <span className="filter-dot" style={{ background: '#d1d5db' }} />
            Semua
          </button>
          {poinGroups.map(pg => (
            <button
              key={pg.code}
              onClick={() => onChange({ poinGroup: pg.code })}
              className={cn('filter-option', { active: filters.poinGroup === pg.code })}
            >
              <span className="filter-dot" style={{ background: '#10b981' }} />
              {pg.label}
            </button>
          ))}
        </div>
      )}

      {/* Rating */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Rating</p>
        <button
          onClick={() => onChange({ rating: null })}
          className={cn('rating-filter-btn', { active: filters.rating === null })}
        >
          Semua Rating
        </button>
        {RATING_OPTIONS.map(r => (
          <button
            key={r}
            onClick={() => onChange({ rating: r })}
            className={cn('rating-filter-btn', { active: filters.rating === r })}
          >
            <span className="flex gap-0.5">
              {Array.from({ length: MAX_RATING }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < r ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </span>
            <span className="text-xs">{RATING_LABELS[r]}</span>
          </button>
        ))}
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ category: 'all', poinGroup: 'all', rating: null })}
          className="flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors mt-auto px-3 py-2 rounded-xl border border-red-100 bg-red-50/70"
        >
          <X size={13} /> Reset filter
        </button>
      )}
    </aside>
  );
}
