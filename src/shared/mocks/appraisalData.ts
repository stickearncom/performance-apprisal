import type {
  AppraisalState,
  Assignment,
  Competency,
  Cycle,
  Employee,
  PerformanceResult,
  SetupException,
  Template,
} from '@/shared/types';

export const mockEmployees: Employee[] = [
  {
    uuid: 'emp_001',
    fullName: 'Rina Prameswari',
    division: 'Engineering',
    jobTitle: 'Frontend Engineer',
    managerName: 'Budi Santoso',
  },
  {
    uuid: 'emp_002',
    fullName: 'Dimas Kurniawan',
    division: 'Sales',
    jobTitle: 'Account Executive',
    managerName: 'Sinta Maharani',
  },
  {
    uuid: 'emp_003',
    fullName: 'Maya Lestari',
    division: 'Operations',
    jobTitle: 'Operations Analyst',
    managerName: 'Reza Akbar',
  },
  {
    uuid: 'emp_004',
    fullName: 'Tari Anindya',
    division: 'Finance',
    jobTitle: 'Finance Analyst',
    managerName: null,
  },
];

export const mockCompetencies: Competency[] = [
  {
    uuid: 'cmp_001',
    name: 'Ownership',
    category: 'core_competency',
    description: 'Takes responsibility for outcomes and follows through.',
    status: 'active',
  },
  {
    uuid: 'cmp_002',
    name: 'Collaboration',
    category: 'core_competency',
    description: 'Works well across functions and resolves blockers quickly.',
    status: 'active',
  },
  {
    uuid: 'cmp_003',
    name: 'Functional Depth',
    category: 'functional_competency',
    description: 'Demonstrates strong execution in role-specific work.',
    status: 'active',
  },
];

export const mockTemplates: Template[] = [
  {
    uuid: 'tpl_001',
    name: 'Annual Pilot - Engineering',
    division: 'Engineering',
    jobFamily: 'Software Engineering',
    status: 'active',
    sections: [
      { uuid: 'sec_001', name: 'Goals', weight: 40 },
      { uuid: 'sec_002', name: 'Core Competencies', weight: 30 },
      { uuid: 'sec_003', name: 'Functional Competencies', weight: 30 },
    ],
  },
  {
    uuid: 'tpl_002',
    name: 'Annual Pilot - Cross Division',
    division: 'Company Pilot',
    jobFamily: 'General',
    status: 'draft',
    sections: [
      { uuid: 'sec_011', name: 'Goals', weight: 50 },
      { uuid: 'sec_012', name: 'Core Competencies', weight: 25 },
      { uuid: 'sec_013', name: 'Functional Competencies', weight: 25 },
    ],
  },
];

export const mockCycles: Cycle[] = [
  {
    uuid: 'cyc_001',
    name: 'FY26 Annual Pilot',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    selfReviewDeadline: '2026-06-15',
    managerReviewDeadline: '2026-06-25',
    status: 'published',
    templateUuid: 'tpl_001',
  },
  {
    uuid: 'cyc_002',
    name: 'FY26 Mid-Year Pilot',
    startDate: '2026-09-01',
    endDate: '2026-09-20',
    selfReviewDeadline: '2026-09-08',
    managerReviewDeadline: '2026-09-15',
    status: 'draft',
    templateUuid: 'tpl_002',
  },
];

export const mockAssignments: Assignment[] = [
  {
    uuid: 'asn_001',
    cycleUuid: 'cyc_001',
    revieweeUuid: 'emp_001',
    reviewerName: 'Rina Prameswari',
    assignmentType: 'self_review',
    status: 'submitted',
    dueDate: '2026-06-15',
    updatedAt: '2026-06-12',
    score: 4.2,
    note: 'Shipped onboarding revamp and improved design system quality.',
  },
  {
    uuid: 'asn_002',
    cycleUuid: 'cyc_001',
    revieweeUuid: 'emp_001',
    reviewerName: 'Budi Santoso',
    assignmentType: 'manager_review',
    status: 'completed',
    dueDate: '2026-06-25',
    updatedAt: '2026-06-18',
    score: 4.4,
    note: 'Consistent delivery and thoughtful collaboration across product and QA.',
  },
  {
    uuid: 'asn_003',
    cycleUuid: 'cyc_001',
    revieweeUuid: 'emp_002',
    reviewerName: 'Dimas Kurniawan',
    assignmentType: 'self_review',
    status: 'draft',
    dueDate: '2026-06-15',
    updatedAt: '2026-06-10',
    score: 3.8,
    note: 'Exceeded pipeline target in two key accounts and improved follow-up hygiene.',
  },
  {
    uuid: 'asn_004',
    cycleUuid: 'cyc_001',
    revieweeUuid: 'emp_002',
    reviewerName: 'Sinta Maharani',
    assignmentType: 'manager_review',
    status: 'blocked',
    dueDate: '2026-06-25',
    updatedAt: '2026-06-10',
    score: null,
    note: '',
  },
  {
    uuid: 'asn_005',
    cycleUuid: 'cyc_001',
    revieweeUuid: 'emp_003',
    reviewerName: 'Maya Lestari',
    assignmentType: 'self_review',
    status: 'pending',
    dueDate: '2026-06-15',
    updatedAt: '2026-06-08',
    score: null,
    note: '',
  },
  {
    uuid: 'asn_006',
    cycleUuid: 'cyc_001',
    revieweeUuid: 'emp_003',
    reviewerName: 'Reza Akbar',
    assignmentType: 'manager_review',
    status: 'blocked',
    dueDate: '2026-06-25',
    updatedAt: '2026-06-08',
    score: null,
    note: '',
  },
];

export const mockResults: PerformanceResult[] = [
  {
    uuid: 'res_001',
    cycleUuid: 'cyc_001',
    employeeUuid: 'emp_001',
    finalScore: 4.3,
    managerSummary: 'Strong ownership, calm execution, and high collaboration quality.',
    sectionScores: [
      { sectionName: 'Goals', score: 4.5 },
      { sectionName: 'Core Competencies', score: 4.2 },
      { sectionName: 'Functional Competencies', score: 4.2 },
    ],
    status: 'ready',
  },
  {
    uuid: 'res_002',
    cycleUuid: 'cyc_001',
    employeeUuid: 'emp_002',
    finalScore: 4.0,
    managerSummary: 'Promising commercial momentum with room to sharpen account planning.',
    sectionScores: [
      { sectionName: 'Goals', score: 4.1 },
      { sectionName: 'Core Competencies', score: 3.9 },
      { sectionName: 'Functional Competencies', score: 4.0 },
    ],
    status: 'pending',
  },
  {
    uuid: 'res_003',
    cycleUuid: 'cyc_001',
    employeeUuid: 'emp_003',
    finalScore: 3.9,
    managerSummary: 'Reliable operator with clear opportunity to improve prioritization.',
    sectionScores: [
      { sectionName: 'Goals', score: 4.0 },
      { sectionName: 'Core Competencies', score: 3.8 },
      { sectionName: 'Functional Competencies', score: 3.9 },
    ],
    status: 'pending',
  },
];

export const mockSetupExceptions: SetupException[] = [
  {
    uuid: 'exc_001',
    cycleUuid: 'cyc_002',
    employeeUuid: 'emp_004',
    employeeName: 'Tari Anindya',
    division: 'Finance',
    reason: 'missing_manager_mapping',
  },
];

export const initialAppraisalState: AppraisalState = {
  activeCycleUuid: 'cyc_001',
  employees: mockEmployees,
  competencies: mockCompetencies,
  templates: mockTemplates,
  cycles: mockCycles,
  assignments: mockAssignments,
  results: mockResults,
  setupExceptions: mockSetupExceptions,
};
