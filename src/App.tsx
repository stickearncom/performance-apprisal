import { lazy, Suspense } from 'react';

import { AppShell, AppraisalAppProvider } from '@/app/index';
import { AssignmentsView } from '@/modules/assignments';
import { DashboardView } from '@/modules/dashboard';
import { ResultsView } from '@/modules/results';
import { SetupView } from '@/modules/setup';
import { Navigate, Route, Routes } from 'react-router-dom';

const DictionaryView = lazy(async () => {
  const module = await import('@/modules/dictionary');
  return { default: module.DictionaryView };
});

export default function App() {
  return (
    <AppraisalAppProvider>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route
            path="dictionary"
            element={
              <Suspense fallback={<div />}> 
                <DictionaryView />
              </Suspense>
            }
          />
          <Route path="setup" element={<SetupView />} />
          <Route path="assignments" element={<AssignmentsView />}>
            <Route path=":assignmentUuid" element={null} />
          </Route>
          <Route path="results" element={<ResultsView />}>
            <Route path=":employeeUuid" element={null} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppraisalAppProvider>
  );
}
