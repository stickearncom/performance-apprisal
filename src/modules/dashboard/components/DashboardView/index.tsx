import { AlertTriangle, ArrowRightLeft, CheckCircle2, Clock3, ExternalLink, Layers3, RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAppraisalApp } from '@/app/useAppraisalApp';
import { buildPathWithSearch, getPersonaForAssignmentType } from '@/shared/lib';
import { Button } from '@/shared/ui';
import './StyleSheet.scss';

export function DashboardView() {
  const { state, reopenAssignment, reassignAssignment } = useAppraisalApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCycle = state.cycles.find((cycle) => cycle.uuid === state.activeCycleUuid);
  const activeAssignments = state.assignments.filter((assignment) => assignment.cycleUuid === state.activeCycleUuid);
  const employeeById = new Map(state.employees.map((employee) => [employee.uuid, employee]));

  const summary = {
    completed: activeAssignments.filter((assignment) => assignment.status === 'completed').length,
    submitted: activeAssignments.filter((assignment) => assignment.status === 'submitted').length,
    draft: activeAssignments.filter((assignment) => assignment.status === 'draft').length,
    pending: activeAssignments.filter((assignment) => assignment.status === 'pending').length,
  };

  const divisionProgress = Array.from(
    activeAssignments.reduce((map, assignment) => {
      const employee = employeeById.get(assignment.revieweeUuid);
      if (!employee) return map;

      const current = map.get(employee.division) ?? { total: 0, completed: 0 };
      current.total += 1;
      if (assignment.status === 'completed' || assignment.status === 'submitted') {
        current.completed += 1;
      }
      map.set(employee.division, current);
      return map;
    }, new Map<string, { total: number; completed: number }>()),
  );

  const overdueAssignments = activeAssignments.filter(
    (assignment) => assignment.status !== 'completed' && assignment.status !== 'submitted',
  );

  const metricCards = [
    { label: 'Completed', value: summary.completed, icon: CheckCircle2, tone: 'sky' },
    { label: 'Submitted', value: summary.submitted, icon: Layers3, tone: 'emerald' },
    { label: 'Draft', value: summary.draft, icon: Clock3, tone: 'amber' },
    { label: 'Pending', value: summary.pending, icon: AlertTriangle, tone: 'rose' },
  ];

  return (
    <section className="dashboard-view">
      <div className="dashboard-view__hero-card">
        <div className="dashboard-view__hero-content">
          <div>
            <p className="dashboard-view__eyebrow">Cycle command center</p>
            <h2 className="dashboard-view__title">{activeCycle?.name}</h2>
            <p className="dashboard-view__description">
              Fokus implementasi awal ada pada visibilitas progress, monitoring exception, dan admin actions minimum
              untuk menjaga cycle tetap berjalan.
            </p>
          </div>

          <div className="dashboard-view__window-card">
            <div className="dashboard-view__window-label">Active cycle window</div>
            <div className="dashboard-view__window-value">{activeCycle?.startDate} sampai {activeCycle?.endDate}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-view__metrics-grid">
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.label} className={`dashboard-view__metric-card dashboard-view__metric-card--${card.tone}`}>
              <div className="dashboard-view__metric-header">
                <span className="dashboard-view__metric-label">{card.label}</span>
                <Icon className="dashboard-view__metric-icon" />
              </div>
              <div className="dashboard-view__metric-value">{card.value}</div>
            </article>
          );
        })}
      </div>

      <div className="dashboard-view__content-grid">
        <section className="dashboard-view__panel">
          <div className="dashboard-view__panel-header">
            <div>
              <h3 className="dashboard-view__panel-title">Progress by division</h3>
              <p className="dashboard-view__panel-description">Ringkasan completion untuk divisi pilot.</p>
            </div>
            <span className="dashboard-view__badge">{divisionProgress.length} divisions</span>
          </div>

          <div className="dashboard-view__progress-list">
            {divisionProgress.map(([division, progress]) => {
              const completion = progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100);
              return (
                <div key={division} className="dashboard-view__progress-card">
                  <div className="dashboard-view__progress-header">
                    <span className="dashboard-view__progress-title">{division}</span>
                    <span className="dashboard-view__progress-copy">{progress.completed}/{progress.total} done</span>
                  </div>
                  <div className="dashboard-view__progress-track">
                    <div className="dashboard-view__progress-fill" style={{ width: `${completion}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-view__panel">
          <div>
            <h3 className="dashboard-view__panel-title">Admin actions</h3>
            <p className="dashboard-view__panel-description">Aksi minimum untuk unblock cycle dengan cepat.</p>
          </div>

          <div className="dashboard-view__admin-list">
            {overdueAssignments.slice(0, 3).map((assignment) => {
              const employee = employeeById.get(assignment.revieweeUuid);

              return (
                <article key={assignment.uuid} className="dashboard-view__admin-card">
                  <div className="dashboard-view__admin-header">
                    <div>
                      <div className="dashboard-view__admin-name">{employee?.fullName}</div>
                      <div className="dashboard-view__admin-type">{assignment.assignmentType.replace('_', ' ')}</div>
                      <div className="dashboard-view__admin-reviewer">
                        Reviewer: <span>{assignment.reviewerName}</span>
                      </div>
                    </div>

                    <span className="dashboard-view__status-pill">{assignment.status}</span>
                  </div>

                  <div className="dashboard-view__admin-actions">
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(
                          buildPathWithSearch(`/assignments/${assignment.uuid}`, searchParams, {
                            cycle: state.activeCycleUuid,
                            persona: getPersonaForAssignmentType(assignment.assignmentType),
                            type: assignment.assignmentType,
                            search: null,
                          }),
                        )
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open detail
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reassignAssignment(assignment.uuid, 'Backup Manager')}>
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Reassign
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => reopenAssignment(assignment.uuid)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reopen
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}