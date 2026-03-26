import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Cari kriteria...', className }: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-9"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
