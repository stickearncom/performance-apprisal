import { cn } from '@/shared/lib';
import './StyleSheet.scss';

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
    <div className={cn('ui-tabs', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn('ui-tabs__button', active === tab.value && 'is-active')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}