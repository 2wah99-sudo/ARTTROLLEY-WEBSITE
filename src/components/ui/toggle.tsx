'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Adapted to the Arttrolley palette (gold / clay / ink / parchment) rather
// than the stock green/orange — everything else about the two components
// (markup, states, sizing) is unchanged from the source.

const MinimalToggle = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-block h-[1.8em] w-[3.7em] text-[17px]">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'group h-0 w-0',
            '[&:checked+span:before]:translate-x-[1.9em]',
            '[&:checked+span:before]:bg-gold',
            '[&:checked+span]:bg-gold/30',
            className
          )}
          {...props}
        />
        <span
          className={cn(
            'absolute inset-0 cursor-pointer rounded-[30px] bg-parchment/15 transition ease-in-out',
            "before:absolute before:bottom-[0.2em] before:left-[0.2em] before:h-[1.4em] before:w-[1.4em]",
            "before:rounded-[20px] before:bg-parchment/50 before:transition before:duration-300 before:content-['']"
          )}
        />
      </label>
    )
  }
)
MinimalToggle.displayName = 'MinimalToggle'

const ClayToggle = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          'ease before:ease relative h-6 w-12 appearance-none rounded-full bg-parchment/15',
          'transition duration-300',
          'before:absolute before:left-[calc(1.5em_-_1.6em)] before:top-[calc(1.5em_-_1.6em)]',
          'before:block before:h-[1.7em] before:w-[1.6em] before:cursor-pointer',
          'before:rounded-full before:border before:border-solid before:border-parchment/30',
          "before:bg-parchment before:transition-all before:duration-300 before:content-['']",
          'checked:bg-clay checked:before:translate-x-full checked:before:border-clay',
          'hover:before:shadow-[0_0_0px_8px_rgba(237,232,224,0.1)]',
          'checked:hover:before:shadow-[0_0_0px_8px_rgba(181,98,42,0.2)]',
          className
        )}
        {...props}
      />
    )
  }
)
ClayToggle.displayName = 'ClayToggle'

export { MinimalToggle, ClayToggle }
