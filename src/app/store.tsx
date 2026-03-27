import { useMemo, useReducer, type PropsWithChildren } from 'react';

import { AppraisalAppContext, type AppraisalContextValue } from '@/app/AppraisalAppContext';
import { initialAppraisalState } from '@/shared/mocks/appraisalData';
import type {
  AppraisalState,
  Assignment,
  AssignmentStatus,
  Cycle,
  Employee,
  PerformanceResult,
  SetupException,
} from '@/shared/types';

type Action =
  | { type: 'set-active-cycle'; cycleUuid: string }
  | { type: 'publish-cycle'; cycleUuid: string }
  | { type: 'save-draft'; assignmentUuid: string }
  | { type: 'submit-assignment'; assignmentUuid: string }
  | { type: 'reopen-assignment'; assignmentUuid: string }
  | { type: 'reassign-assignment'; assignmentUuid: string; reviewerName: string };

function createAssignmentsForCycle(cycle: Cycle, employees: Employee[]): Assignment[] {
  return employees.flatMap((employee, index) => {
    const selfAssignment: Assignment = {
      uuid: `asn_${cycle.uuid}_self_${index + 1}`,
      cycleUuid: cycle.uuid,
      revieweeUuid: employee.uuid,
      reviewerName: employee.fullName,
      assignmentType: 'self_review',
      status: 'pending',
      dueDate: cycle.selfReviewDeadline,
      updatedAt: cycle.startDate,
      score: null,
      note: '',
    };

    if (!employee.managerName) {
      return [selfAssignment];
    }

    return [
      selfAssignment,
      {
        uuid: `asn_${cycle.uuid}_mgr_${index + 1}`,
        cycleUuid: cycle.uuid,
        revieweeUuid: employee.uuid,
        reviewerName: employee.managerName,
        assignmentType: 'manager_review',
        status: 'blocked',
        dueDate: cycle.managerReviewDeadline,
        updatedAt: cycle.startDate,
        score: null,
        note: '',
      },
    ];
  });
}

function createResultsForCycle(cycle: Cycle, employees: Employee[]): PerformanceResult[] {
  return employees.map((employee, index) => ({
    uuid: `res_${cycle.uuid}_${index + 1}`,
    cycleUuid: cycle.uuid,
    employeeUuid: employee.uuid,
    finalScore: 3.7 + index * 0.2,
    managerSummary: 'Result will be available after manager review is completed.',
    sectionScores: [
      { sectionName: 'Goals', score: 3.8 + index * 0.1 },
      { sectionName: 'Core Competencies', score: 3.6 + index * 0.1 },
      { sectionName: 'Functional Competencies', score: 3.7 + index * 0.1 },
    ],
    status: 'pending',
  }));
}

function createExceptionsForCycle(cycle: Cycle, employees: Employee[]): SetupException[] {
  return employees
    .filter((employee) => !employee.managerName)
    .map((employee, index) => ({
      uuid: `exc_${cycle.uuid}_${index + 1}`,
      cycleUuid: cycle.uuid,
      employeeUuid: employee.uuid,
      employeeName: employee.fullName,
      division: employee.division,
      reason: 'missing_manager_mapping',
    }));
}

function updateAssignmentStatus(assignments: Assignment[], assignmentUuid: string, status: AssignmentStatus) {
  return assignments.map((assignment) =>
    assignment.uuid === assignmentUuid
      ? { ...assignment, status, updatedAt: new Date().toISOString().slice(0, 10) }
      : assignment,
  );
}

function reducer(state: AppraisalState, action: Action): AppraisalState {
  switch (action.type) {
    case 'set-active-cycle':
      return { ...state, activeCycleUuid: action.cycleUuid };
    case 'publish-cycle': {
      const cycle = state.cycles.find((item) => item.uuid === action.cycleUuid);

      if (!cycle || cycle.status === 'published') {
        return state;
      }

      const publishedCycles = state.cycles.map((item) =>
        item.uuid === action.cycleUuid ? { ...item, status: 'published' as const } : item,
      );
      const generatedAssignments = createAssignmentsForCycle(cycle, state.employees);
      const generatedResults = createResultsForCycle(cycle, state.employees);
      const generatedExceptions = createExceptionsForCycle(cycle, state.employees);

      return {
        ...state,
        activeCycleUuid: cycle.uuid,
        cycles: publishedCycles,
        assignments: [...state.assignments, ...generatedAssignments],
        results: [...state.results, ...generatedResults],
        setupExceptions: [...state.setupExceptions, ...generatedExceptions],
      };
    }
    case 'save-draft':
      return {
        ...state,
        assignments: updateAssignmentStatus(state.assignments, action.assignmentUuid, 'draft'),
      };
    case 'submit-assignment': {
      const targetAssignment = state.assignments.find((item) => item.uuid === action.assignmentUuid);

      if (!targetAssignment) {
        return state;
      }

      let nextAssignments = updateAssignmentStatus(
        state.assignments,
        action.assignmentUuid,
        targetAssignment.assignmentType === 'manager_review' ? 'completed' : 'submitted',
      );

      if (targetAssignment.assignmentType === 'self_review') {
        nextAssignments = nextAssignments.map((assignment) =>
          assignment.cycleUuid === targetAssignment.cycleUuid &&
          assignment.revieweeUuid === targetAssignment.revieweeUuid &&
          assignment.assignmentType === 'manager_review' &&
          assignment.status === 'blocked'
            ? { ...assignment, status: 'pending', updatedAt: new Date().toISOString().slice(0, 10) }
            : assignment,
        );
      }

      const nextResults =
        targetAssignment.assignmentType === 'manager_review'
          ? state.results.map((result) =>
              result.cycleUuid === targetAssignment.cycleUuid && result.employeeUuid === targetAssignment.revieweeUuid
                ? {
                    ...result,
                    status: 'ready' as const,
                    finalScore: targetAssignment.score ?? result.finalScore,
                    managerSummary:
                      targetAssignment.note ||
                      'Manager review completed with a balanced view on goals and competencies.',
                  }
                : result,
            )
          : state.results;

      return {
        ...state,
        assignments: nextAssignments,
        results: nextResults,
      };
    }
    case 'reopen-assignment': {
      const targetAssignment = state.assignments.find((item) => item.uuid === action.assignmentUuid);

      if (!targetAssignment) {
        return state;
      }

      return {
        ...state,
        assignments: updateAssignmentStatus(state.assignments, action.assignmentUuid, 'draft'),
        results: state.results.map((result) =>
          result.cycleUuid === targetAssignment.cycleUuid && result.employeeUuid === targetAssignment.revieweeUuid
            ? { ...result, status: 'pending' as const }
            : result,
        ),
      };
    }
    case 'reassign-assignment':
      return {
        ...state,
        assignments: state.assignments.map((assignment) =>
          assignment.uuid === action.assignmentUuid
            ? {
                ...assignment,
                reviewerName: action.reviewerName,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : assignment,
        ),
      };
    default:
      return state;
  }
}

export function AppraisalAppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialAppraisalState);

  const value = useMemo<AppraisalContextValue>(
    () => ({
      state,
      setActiveCycle: (cycleUuid) => dispatch({ type: 'set-active-cycle', cycleUuid }),
      publishCycle: (cycleUuid) => dispatch({ type: 'publish-cycle', cycleUuid }),
      saveDraft: (assignmentUuid) => dispatch({ type: 'save-draft', assignmentUuid }),
      submitAssignment: (assignmentUuid) => dispatch({ type: 'submit-assignment', assignmentUuid }),
      reopenAssignment: (assignmentUuid) => dispatch({ type: 'reopen-assignment', assignmentUuid }),
      reassignAssignment: (assignmentUuid, reviewerName) =>
        dispatch({ type: 'reassign-assignment', assignmentUuid, reviewerName }),
    }),
    [state],
  );

  return <AppraisalAppContext.Provider value={value}>{children}</AppraisalAppContext.Provider>;
}