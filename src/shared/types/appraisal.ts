export type CycleStatus = 'draft' | 'published';

export type AssignmentType = 'self_review' | 'manager_review';

export type AssignmentStatus = 'blocked' | 'pending' | 'draft' | 'submitted' | 'completed';

export interface Employee {
  uuid: string;
  fullName: string;
  division: string;
  jobTitle: string;
  managerName: string | null;
}

export interface Competency {
  uuid: string;
  name: string;
  category: 'core_competency' | 'functional_competency';
  description: string;
  status: 'active' | 'inactive';
}

export interface TemplateSection {
  uuid: string;
  name: string;
  weight: number;
}

export interface Template {
  uuid: string;
  name: string;
  division: string;
  jobFamily: string;
  status: 'draft' | 'active';
  sections: TemplateSection[];
}

export interface Cycle {
  uuid: string;
  name: string;
  startDate: string;
  endDate: string;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
  status: CycleStatus;
  templateUuid: string;
}

export interface Assignment {
  uuid: string;
  cycleUuid: string;
  revieweeUuid: string;
  reviewerName: string;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  dueDate: string;
  updatedAt: string;
  score: number | null;
  note: string;
}

export interface ResultSectionScore {
  sectionName: string;
  score: number;
}

export interface PerformanceResult {
  uuid: string;
  cycleUuid: string;
  employeeUuid: string;
  finalScore: number;
  managerSummary: string;
  sectionScores: ResultSectionScore[];
  status: 'pending' | 'ready';
}

export interface SetupException {
  uuid: string;
  cycleUuid: string;
  employeeUuid: string;
  employeeName: string;
  division: string;
  reason: 'missing_manager_mapping';
}

export interface AppraisalState {
  activeCycleUuid: string;
  employees: Employee[];
  competencies: Competency[];
  templates: Template[];
  cycles: Cycle[];
  assignments: Assignment[];
  results: PerformanceResult[];
  setupExceptions: SetupException[];
}