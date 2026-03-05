'use client'

import Link from 'next/link'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all min-h-[44px] px-5 py-2.5 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ledger-crimson text-white hover:brightness-110 active:brightness-95 focus-visible:outline-ledger-crimson',
  secondary: 'bg-transparent border-2 border-lighthouse-navy text-lighthouse-navy hover:bg-lighthouse-navy/5 focus-visible:outline-lighthouse-navy',
  tertiary: 'bg-transparent text-deep-slate hover:text-lighthouse-navy focus-visible:outline-lighthouse-navy',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', href, children, className = '', disabled, ...props }, ref) => {
    const styles = `${baseStyles} ${variantStyles[variant]} ${variant === 'tertiary' ? 'border-0 min-h-[44px]' : ''}`

    if (href && !disabled) {
      return (
        <Link href={href} className={`${styles} no-underline ${className}`}>
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`${styles} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
