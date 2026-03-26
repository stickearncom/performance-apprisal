import { LayoutDashboard } from 'lucide-react';

export function Header() {
  return (
    <header className="app-header sticky top-0 z-10 shrink-0 border-b border-white/70 bg-white/70 backdrop-blur-md shadow-[0_1px_0_rgba(229,231,235,0.8)]">
      <div className="app-header-inner flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900 leading-tight">Performance Appraisal</h1>
          <p className="text-xs text-gray-400 leading-tight">Internal Tool</p>
        </div>
      </div>
    </header>
  );
}
