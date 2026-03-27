import { useContext } from 'react';

import { AppraisalAppContext } from '@/app/AppraisalAppContext';

export function useAppraisalApp() {
  const context = useContext(AppraisalAppContext);

  if (!context) {
    throw new Error('useAppraisalApp must be used within AppraisalAppProvider');
  }

  return context;
}