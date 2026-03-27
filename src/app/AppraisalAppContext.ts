import { createContext } from 'react';

import type { AppraisalState } from '@/shared/types';

export interface AppraisalContextValue {
  state: AppraisalState;
  setActiveCycle: (cycleUuid: string) => void;
  publishCycle: (cycleUuid: string) => void;
  saveDraft: (assignmentUuid: string) => void;
  submitAssignment: (assignmentUuid: string) => void;
  reopenAssignment: (assignmentUuid: string) => void;
  reassignAssignment: (assignmentUuid: string, reviewerName: string) => void;
}

export const AppraisalAppContext = createContext<AppraisalContextValue | null>(null);