import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        gray: 'border-transparent bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200',
        ghost:
          'border-transparent bg-gray-50 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
        teal: 'border-transparent bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400',
        blue: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
        red: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
        yellow:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
        purple:
          'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
        orange:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400',
        plain: 'border-transparent bg-white/10 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
