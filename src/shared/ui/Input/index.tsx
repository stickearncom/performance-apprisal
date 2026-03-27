import * as React from 'react';

import { cn } from '@/shared/lib';
import './StyleSheet.scss';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn('ui-input', className)}
      {...props}
    />
  );
}

export { Input };