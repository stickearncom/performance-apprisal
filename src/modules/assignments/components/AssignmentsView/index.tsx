import { useDeferredValue, useEffect, useMemo } from 'react';
import { Clock3, FileText, Send, UserRound } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAppraisalApp } from '@/app/useAppraisalApp';
import {
  buildPathWithSearch,
  cn,
  getAssignmentUrlState,
  patchSearchParams,
  type AssignmentFilter,
  type AssignmentPersona,
} from '@/shared/lib';
import { Button, Input, Tabs } from '@/shared/ui';
import './StyleSheet.scss';

const badgeStyles = {
  blocked: 'is-blocked',
  pending: 'is-pending',
  draft: 'is-draft',
  submitted: 'is-submitted',
  completed: 'is-completed',
} as const;

export function AssignmentsView() {
  const { state, saveDraft, submitAssignment, reopenAssignment } = useAppraisalApp();
  const navigate = useNavigate();
  const { assignmentUuid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { persona, assignmentFilter, search } = getAssignmentUrlState(searchParams);
  const deferredSearch = useDeferredValue(search);

  const employeeById = useMemo(
    () => new Map(state.employees.map((employee) => [employee.uuid, employee])),
    [state.employees],
  );
  const activeAssignments = state.assignments.filter((assignment) => assignment.cycleUuid === state.activeCycleUuid);

  const filteredAssignments = useMemo(() => {
    return activeAssignments.filter((assignment) => {
      if (persona === 'employee' && assignment.assignmentType !== 'self_review') return false;
      if (persona === 'manager' && assignment.assignmentType !== 'manager_review') return false;
      if (assignmentFilter !== 'all' && assignment.assignmentType !== assignmentFilter) return false;

      const employee = employeeById.get(assignment.revieweeUuid);
      const query = deferredSearch.toLowerCase().trim();
      if (!query) return true;

      return [employee?.fullName, employee?.division, assignment.reviewerName, assignment.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [activeAssignments, assignmentFilter, deferredSearch, employeeById, persona]);

  const selectedAssignment = activeAssignments.find((assignment) => assignment.uuid === assignmentUuid) ?? null;
  const selectedEmployee = selectedAssignment ? employeeById.get(selectedAssignment.revieweeUuid) : null;
  const relatedSelfReview = selectedEmployee
    ? activeAssignments.find(
        (assignment) =>
          assignment.revieweeUuid === selectedEmployee.uuid && assignment.assignmentType === 'self_review',
      )
    : null;

  const updateSearchParams = (patch: Record<string, string | null | undefined>) => {
    setSearchParams(patchSearchParams(searchParams, patch));
  };

  const openAssignmentDetail = (nextAssignmentUuid: string) => {
    navigate(buildPathWithSearch(`/assignments/${nextAssignmentUuid}`, searchParams));
  };

  useEffect(() => {
    if (filteredAssignments.length === 0) {
      return;
    }

    if (!assignmentUuid) {
      navigate(buildPathWithSearch(`/assignments/${filteredAssignments[0].uuid}`, searchParams), { replace: true });
      return;
    }

    const assignmentExists = activeAssignments.some((assignment) => assignment.uuid === assignmentUuid);

    if (!assignmentExists) {
      navigate(buildPathWithSearch(`/assignments/${filteredAssignments[0].uuid}`, searchParams), { replace: true });
    }
  }, [activeAssignments, assignmentUuid, filteredAssignments, navigate, searchParams]);

  return (
    <section className="assignments-view">
      <section className="assignments-view__list-panel">
        <div className="assignments-view__filters">
          <div>
            <p className="assignments-view__eyebrow">Reviewer workspace</p>
            <h2 className="assignments-view__title">Assignment inbox</h2>
          </div>
          <Tabs
            tabs={[
              { value: 'employee', label: 'Employee' },
              { value: 'manager', label: 'Manager' },
            ]}
            active={persona as AssignmentPersona}
            onChange={(nextPersona) => updateSearchParams({ persona: nextPersona })}
          />
          <Tabs
            tabs={[
              { value: 'all', label: 'All' },
              { value: 'self_review', label: 'Self Review' },
              { value: 'manager_review', label: 'Manager Review' },
            ]}
            active={assignmentFilter as AssignmentFilter}
            onChange={(value) => updateSearchParams({ type: value === 'all' ? null : value })}
          />
          <Input
            value={search}
            onChange={(event) => updateSearchParams({ search: event.target.value || null })}
            placeholder="Cari reviewee, division, reviewer"
          />
        </div>

        <div className="assignments-view__list">
          {filteredAssignments.map((assignment) => {
            const employee = employeeById.get(assignment.revieweeUuid);

            return (
              <button
                key={assignment.uuid}
                onClick={() => openAssignmentDetail(assignment.uuid)}
                className={cn('assignments-view__list-item', assignmentUuid === assignment.uuid && 'is-active')}
              >
                <div className="assignments-view__list-item-header">
                  <div>
                    <div className="assignments-view__list-item-name">{employee?.fullName}</div>
                    <div className="assignments-view__list-item-meta">
                      {employee?.division} · {assignment.assignmentType.replace('_', ' ')}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'assignments-view__status-pill',
                      badgeStyles[assignment.status],
                      assignmentUuid === assignment.uuid && 'is-active',
                    )}
                  >
                    {assignment.status}
                  </span>
                </div>
                <div className="assignments-view__list-item-due">Due {assignment.dueDate}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="assignments-view__detail-panel">
        {selectedAssignment && selectedEmployee ? (
          <div className="assignments-view__detail-layout">
            <div className="assignments-view__detail-header">
              <div>
                <div className="assignments-view__detail-pill">
                  <UserRound className="assignments-view__detail-pill-icon" />
                  {selectedAssignment.assignmentType.replace('_', ' ')}
                </div>
                <h3 className="assignments-view__detail-title">{selectedEmployee.fullName}</h3>
                <p className="assignments-view__detail-meta">
                  {selectedEmployee.division} · {selectedEmployee.jobTitle} · Reviewer {selectedAssignment.reviewerName}
                </p>
              </div>
              <div className="assignments-view__detail-state-card">
                <div className="assignments-view__detail-state-label">Review state</div>
                <div className="assignments-view__detail-state-value">Last updated {selectedAssignment.updatedAt}</div>
              </div>
            </div>

            <div className="assignments-view__detail-grid">
              <article className="assignments-view__content-card">
                <div className="assignments-view__card-heading">
                  <FileText className="assignments-view__card-heading-icon" />
                  Review content
                </div>
                <div className="assignments-view__content-stack">
                  <div>
                    <div className="assignments-view__content-label">Current note</div>
                    <p className="assignments-view__content-copy">
                      {selectedAssignment.note || 'Belum ada draft content. Reviewer bisa mulai dari section goals dan competency.'}
                    </p>
                  </div>
                  <div>
                    <div className="assignments-view__content-label">Score preview</div>
                    <div className="assignments-view__score-value">{selectedAssignment.score ?? '--'}</div>
                  </div>
                  {selectedAssignment.assignmentType === 'manager_review' && relatedSelfReview ? (
                    <div className="assignments-view__self-review-card">
                      <div className="assignments-view__content-label">Employee self review</div>
                      <p className="assignments-view__content-copy">{relatedSelfReview.note || 'Self review belum diisi.'}</p>
                    </div>
                  ) : null}
                </div>
              </article>

              <article className="assignments-view__action-card">
                <div className="assignments-view__card-heading">
                  <Clock3 className="assignments-view__card-heading-icon" />
                  Review actions
                </div>
                <div className="assignments-view__action-stack">
                  <div className="assignments-view__due-card">Due date {selectedAssignment.dueDate}</div>
                  <Button onClick={() => saveDraft(selectedAssignment.uuid)} disabled={selectedAssignment.status === 'blocked'}>
                    Save draft
                  </Button>
                  <Button
                    onClick={() => submitAssignment(selectedAssignment.uuid)}
                    disabled={selectedAssignment.status === 'blocked' || selectedAssignment.status === 'completed'}
                  >
                    <Send className="h-4 w-4" />
                    Submit review
                  </Button>
                  <Button variant="outline" onClick={() => reopenAssignment(selectedAssignment.uuid)}>
                    Reopen review
                  </Button>
                  {selectedAssignment.status === 'blocked' ? (
                    <p className="assignments-view__warning-card">
                      Manager review masih menunggu self review dikirim.
                    </p>
                  ) : null}
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className="assignments-view__empty-state">Belum ada assignment pada cycle aktif.</div>
        )}
      </section>
    </section>
  );
}