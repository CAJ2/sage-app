import { cva, type VariantProps } from 'class-variance-authority'

export const alertVariants = cva('rounded-lg p-4', {
  variants: {
    variant: {
      default: 'border border-base-content/20 bg-base-200 text-base-content',
      success: 'border-t-2 border-success bg-success/10 text-base-content',
      error: 'border-s-4 border-error bg-error/10 text-base-content',
      warning: 'border border-warning/30 bg-warning/10 text-warning',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AlertVariants = VariantProps<typeof alertVariants>
