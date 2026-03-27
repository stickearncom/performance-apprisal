import { useEffect } from 'react';
import { Medal, TrendingUp } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAppraisalApp } from '@/app/useAppraisalApp';
import { buildPathWithSearch, cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import './StyleSheet.scss';

export function ResultsView() {
  const { state } = useAppraisalApp();
  const navigate = useNavigate();
  const { employeeUuid } = useParams();
  const [searchParams] = useSearchParams();
  const employeeById = new Map(state.employees.map((employee) => [employee.uuid, employee]));
  const activeResults = state.results.filter((result) => result.cycleUuid === state.activeCycleUuid);
  const selectedResult = activeResults.find((result) => result.employeeUuid === employeeUuid) ?? null;
  const selectedEmployee = selectedResult ? employeeById.get(selectedResult.employeeUuid) : null;

  useEffect(() => {
    if (activeResults.length === 0) {
      return;
    }

    if (!employeeUuid) {
      navigate(buildPathWithSearch(`/results/${activeResults[0].employeeUuid}`, searchParams), { replace: true });
      return;
    }

    const resultExists = activeResults.some((result) => result.employeeUuid === employeeUuid);

    if (!resultExists) {
      navigate(buildPathWithSearch(`/results/${activeResults[0].employeeUuid}`, searchParams), { replace: true });
    }
  }, [activeResults, employeeUuid, navigate, searchParams]);

  return (
    <section className="results-view">
      <section className="results-view__list-panel">
        <div>
          <p className="results-view__eyebrow">Outcome visibility</p>
          <h2 className="results-view__title">Result summaries</h2>
        </div>

        <div className="results-view__list">
          {activeResults.map((result) => {
            const employee = employeeById.get(result.employeeUuid);
            return (
              <button
                key={result.uuid}
                onClick={() => navigate(buildPathWithSearch(`/results/${result.employeeUuid}`, searchParams))}
                className={cn('results-view__list-item', employeeUuid === result.employeeUuid && 'is-active')}
              >
                <div className="results-view__list-item-header">
                  <div>
                    <div className="results-view__list-item-name">{employee?.fullName}</div>
                    <div className="results-view__list-item-meta">{employee?.division}</div>
                  </div>
                  <span className={cn('results-view__status-pill', result.status === 'ready' ? 'is-ready' : 'is-pending', employeeUuid === result.employeeUuid && 'is-active')}>
                    {result.status}
                  </span>
                </div>
                <div className="results-view__score-copy">{result.finalScore.toFixed(1)}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="results-view__detail-panel">
        {selectedResult && selectedEmployee ? (
          <div className="results-view__detail-layout">
            <div className="results-view__detail-header">
              <div>
                <div className="results-view__detail-pill">
                  <Medal className="results-view__detail-pill-icon" />
                  Final result summary
                </div>
                <h3 className="results-view__detail-title">{selectedEmployee.fullName}</h3>
                <p className="results-view__detail-meta">{selectedEmployee.division} · {selectedEmployee.jobTitle}</p>
              </div>
              <div className="results-view__score-card">
                <div className="results-view__score-label">Final score</div>
                <div className="results-view__score-value">{selectedResult.finalScore.toFixed(1)}</div>
              </div>
            </div>

            <div className="results-view__detail-grid">
              <article className="results-view__section-card">
                <div className="results-view__card-heading">
                  <TrendingUp className="results-view__card-heading-icon" />
                  Section scores
                </div>

                <div className="results-view__section-list">
                  {selectedResult.sectionScores.map((section) => (
                    <div key={section.sectionName} className="results-view__section-item">
                      <div className="results-view__section-header">
                        <span className="results-view__section-name">{section.sectionName}</span>
                        <span className="results-view__section-score">{section.score.toFixed(1)}</span>
                      </div>
                      <div className="results-view__section-track">
                        <div className="results-view__section-fill" style={{ width: `${Math.min(section.score / 5, 1) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="results-view__summary-card">
                <div className="results-view__summary-heading">Manager summary</div>
                <p className="results-view__summary-copy">{selectedResult.managerSummary}</p>
                <div className="results-view__action-row">
                  <Button onClick={() => navigate(buildPathWithSearch('/assignments', searchParams))}>Open review workspace</Button>
                  <Button variant="outline" onClick={() => navigate(buildPathWithSearch('/dashboard', searchParams))}>Back to dashboard</Button>
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className="results-view__empty-state">Result summary akan muncul setelah manager review selesai.</div>
        )}
      </section>
    </section>
  );
}