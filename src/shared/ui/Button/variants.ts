import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'ui-button',
  {
    variants: {
      variant: {
        default: 'ui-button--default',
        ghost: 'ui-button--ghost',
        outline: 'ui-button--outline',
        destructive: 'ui-button--destructive',
      },
      size: {
        default: 'ui-button--size-default',
        sm: 'ui-button--size-sm',
        icon: 'ui-button--size-icon',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);