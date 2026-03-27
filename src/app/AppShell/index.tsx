import { useEffect, useMemo } from 'react';
import { BookOpenText, ClipboardCheck, LayoutDashboard, Settings2, Trophy } from 'lucide-react';
import { NavLink, Outlet, matchPath, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useAppraisalApp } from '@/app/useAppraisalApp';
import { buildPathWithSearch, cn, getCycleParam, patchSearchParams } from '@/shared/lib';
import { Button, Tabs } from '@/shared/ui';
import './StyleSheet.scss';

type AppView = 'dashboard' | 'dictionary' | 'setup' | 'assignments' | 'results';

const views: Array<{ value: AppView; label: string; icon: typeof LayoutDashboard; path: string }> = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { value: 'dictionary', label: 'Dictionary', icon: BookOpenText, path: '/dictionary' },
  { value: 'setup', label: 'Setup', icon: Settings2, path: '/setup' },
  { value: 'assignments', label: 'Assignments', icon: ClipboardCheck, path: '/assignments' },
  { value: 'results', label: 'Results', icon: Trophy, path: '/results' },
];

export function AppShell() {
  const { state, setActiveCycle } = useAppraisalApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCycle = state.cycles.find((cycle) => cycle.uuid === state.activeCycleUuid);
  const activeView = (views.find((view) => location.pathname.startsWith(view.path))?.value ?? 'dashboard') as AppView;
  const cycleParam = getCycleParam(searchParams);
  const currentAssignmentUuid = matchPath('/assignments/:assignmentUuid', location.pathname)?.params.assignmentUuid ?? null;
  const currentEmployeeUuid = matchPath('/results/:employeeUuid', location.pathname)?.params.employeeUuid ?? null;
  const currentAssignment = state.assignments.find((assignment) => assignment.uuid === currentAssignmentUuid) ?? null;
  const currentResult = state.results.find((result) => result.employeeUuid === currentEmployeeUuid) ?? null;
  const currentAssignmentEmployee = currentAssignment
    ? state.employees.find((employee) => employee.uuid === currentAssignment.revieweeUuid) ?? null
    : null;
  const currentResultEmployee = currentResult
    ? state.employees.find((employee) => employee.uuid === currentResult.employeeUuid) ?? null
    : null;

  const cycleOptions = useMemo(
    () => state.cycles.map((cycle) => ({ value: cycle.uuid, label: cycle.name })),
    [state.cycles],
  );

  useEffect(() => {
    const fallbackCycle = state.cycles[0]?.uuid;

    if (!fallbackCycle) {
      return;
    }

    if (!cycleParam) {
      setSearchParams(patchSearchParams(searchParams, { cycle: state.activeCycleUuid || fallbackCycle }), {
        replace: true,
      });
      return;
    }

    const cycleExists = state.cycles.some((cycle) => cycle.uuid === cycleParam);
    if (!cycleExists) {
      setSearchParams(patchSearchParams(searchParams, { cycle: state.activeCycleUuid || fallbackCycle }), {
        replace: true,
      });
      return;
    }

    if (cycleParam !== state.activeCycleUuid) {
      setActiveCycle(cycleParam);
    }
  }, [cycleParam, searchParams, setActiveCycle, setSearchParams, state.activeCycleUuid, state.cycles]);

  const headerContent = useMemo(() => {
    if (activeView === 'assignments' && currentAssignment && currentAssignmentEmployee) {
      return {
        eyebrow: 'Review workspace',
        title: `${currentAssignmentEmployee.fullName} review detail`,
        description: `${currentAssignmentEmployee.division} · ${currentAssignment.assignmentType.replace('_', ' ')} · Reviewer ${currentAssignment.reviewerName}`,
        breadcrumb: ['Appraisal workspace', 'Assignments', currentAssignmentEmployee.fullName],
      };
    }

    if (activeView === 'results' && currentResult && currentResultEmployee) {
      return {
        eyebrow: 'Outcome visibility',
        title: `${currentResultEmployee.fullName} result summary`,
        description: `${currentResultEmployee.division} · Final score ${currentResult.finalScore.toFixed(1)} · Status ${currentResult.status}`,
        breadcrumb: ['Appraisal workspace', 'Results', currentResultEmployee.fullName],
      };
    }

    const defaults: Record<AppView, { eyebrow: string; title: string; description: string; breadcrumb: string[] }> = {
      dashboard: {
        eyebrow: 'Frontend prototype',
        title: 'Modular appraisal MVP with mock state',
        description: 'Struktur sudah dipisah per domain bisnis supaya lebih dekat ke arsitektur production dibanding satu folder prototype.',
        breadcrumb: ['Appraisal workspace', 'Dashboard'],
      },
      dictionary: {
        eyebrow: 'Dictionary explorer',
        title: 'Appraisal criteria dictionary',
        description: 'Dictionary tetap tersedia sebagai explorer terpisah, kini membaca payload yang sudah mengikuti contract API envelope.',
        breadcrumb: ['Appraisal workspace', 'Dictionary'],
      },
      setup: {
        eyebrow: 'Cycle setup',
        title: activeCycle ? `${activeCycle.name} setup workspace` : 'Cycle setup workspace',
        description: 'Kelola competency, template summary, assignment generation, dan exception mapping dalam satu alur setup.',
        breadcrumb: ['Appraisal workspace', 'Setup'],
      },
      assignments: {
        eyebrow: 'Reviewer workspace',
        title: activeCycle ? `${activeCycle.name} assignment inbox` : 'Assignment inbox',
        description: 'Gunakan filter URL untuk menjaga context reviewer, tipe assignment, dan pencarian tetap shareable.',
        breadcrumb: ['Appraisal workspace', 'Assignments'],
      },
      results: {
        eyebrow: 'Outcome visibility',
        title: activeCycle ? `${activeCycle.name} result summaries` : 'Result summaries',
        description: 'Summary hasil akhir dan detail per employee sekarang bisa diakses langsung lewat URL.',
        breadcrumb: ['Appraisal workspace', 'Results'],
      },
    };

    return defaults[activeView];
  }, [activeCycle, activeView, currentAssignment, currentAssignmentEmployee, currentResult, currentResultEmployee]);

  return (
    <div className="app-shell">
      <div className="app-shell__layout">
        <aside className="app-shell__sidebar">
          <div className="app-shell__sidebar-panel">
            <div className="app-shell__sidebar-header">
              <p className="app-shell__sidebar-eyebrow">Performance appraisal</p>
              <h1 className="app-shell__sidebar-title">Appraisal workspace</h1>
              <p className="app-shell__sidebar-description">
                Frontend modular untuk setup cycle, execution workspace, dan result visibility dengan mock data.
              </p>
            </div>

            <nav className="app-shell__nav" aria-label="Primary navigation">
              {views.map((view) => {
                const Icon = view.icon;

                return (
                  <NavLink
                    key={view.value}
                    to={buildPathWithSearch(view.path, searchParams, { cycle: cycleParam ?? state.activeCycleUuid })}
                    className={cn('app-shell__nav-link', activeView === view.value && 'is-active')}
                  >
                    <Icon className="app-shell__nav-icon" />
                    <span className="app-shell__nav-label">{view.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="app-shell__cycle-card">
              <div className="app-shell__cycle-label">Active cycle</div>
              <div className="app-shell__cycle-name">{activeCycle?.name}</div>
              <div className="app-shell__cycle-status">{activeCycle?.status}</div>
            </div>
          </div>
        </aside>

        <main className="app-shell__main">
          <div className="app-shell__content">
            <section className="app-shell__hero">
              <div className="app-shell__hero-body">
                <div className="app-shell__hero-copy">
                  <div className="app-shell__breadcrumb" aria-label="Breadcrumb">
                    {headerContent.breadcrumb.map((item, index) => (
                      <span key={`${item}-${index}`} className="app-shell__breadcrumb-item">
                        {index > 0 ? <span className="app-shell__breadcrumb-separator">/</span> : null}
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                  <p className="app-shell__hero-eyebrow">{headerContent.eyebrow}</p>
                  <h2 className="app-shell__hero-title">{headerContent.title}</h2>
                  <p className="app-shell__hero-description">{headerContent.description}</p>
                </div>

                <div className="app-shell__hero-controls">
                  {activeView !== 'dictionary' ? (
                    <select
                      value={cycleParam ?? state.activeCycleUuid}
                      onChange={(event) => setSearchParams(patchSearchParams(searchParams, { cycle: event.target.value }))}
                      className="app-shell__cycle-select"
                    >
                      {cycleOptions.map((cycleOption) => (
                        <option key={cycleOption.value} value={cycleOption.value}>
                          {cycleOption.label}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  <div className="app-shell__mobile-tabs">
                    <Tabs
                      tabs={views.map((view) => ({ value: view.value, label: view.label }))}
                      active={activeView}
                      onChange={(nextView) =>
                        navigate(
                          buildPathWithSearch(
                            views.find((view) => view.value === nextView)?.path ?? '/dashboard',
                            searchParams,
                            { cycle: cycleParam ?? state.activeCycleUuid },
                          ),
                        )
                      }
                    />
                  </div>

                  <Button variant="outline">{activeView === 'dictionary' ? 'Using API contract shape' : 'Using mock data'}</Button>
                </div>
              </div>
            </section>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}