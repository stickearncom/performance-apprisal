import { cn } from '@/lib/utils';

interface Tab<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-1 p-1 bg-gray-100 rounded-xl', className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
            active === tab.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
