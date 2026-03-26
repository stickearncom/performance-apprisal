import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-xs transition-[color,box-shadow,border-color] outline-none placeholder:text-gray-400 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-200',
        className,
      )}
      {...props}
    />
  );
}

export { Input };