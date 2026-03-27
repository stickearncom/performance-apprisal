import { Search, X } from 'lucide-react';

import { cn } from '@/shared/lib';
import { Input } from '../Input';
import './StyleSheet.scss';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Cari kriteria...', className }: SearchInputProps) {
  return (
    <div className={cn('search-input', className)}>
      <Search size={15} className="search-input__icon" />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="search-input__field"
      />
      {value ? (
        <button onClick={() => onChange('')} className="search-input__clear-button">
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}