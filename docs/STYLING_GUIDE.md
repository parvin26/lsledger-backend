# Lighthouse Ledger Styling Guide

## Purpose
This document ensures consistent, reliable styling across the app and prevents the "broken/unstyled" page issue that occurred when Tailwind classes failed to apply.

## Styling Strategy: Defense in Depth

### 1. CSS Variables (Primary Source of Truth)
All brand colors are defined in `app/globals.css` under `:root`:
- `--color-lighthouse-navy`: #1A2740
- `--color-deep-slate`: #2E3A4D
- `--color-ledger-crimson`: #B71C2A
- `--color-beacon-red`: #C4322D
- `--color-signal-blue`: #205B9F
- `--color-sand-background`: #F6F1E8
- `--color-divider`: #E5E7EB
- `--color-muted-text`: #717478

### 2. Inline Styles for Critical Colors (Required)
**Always use inline styles** for colors and backgrounds on marketing/landing components:
```tsx
style={{ color: 'var(--color-lighthouse-navy)' }}
style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
style={{ borderColor: 'var(--color-divider)' }}
```
This ensures styles work even if Tailwind fails.

### 3. Tailwind for Layout Only (Optional)
Use Tailwind for layout, spacing, typography scale:
- `flex`, `grid`, `gap-4`, `p-8`, `rounded-xl`
- `text-4xl`, `font-semibold`, `leading-relaxed`
Avoid Tailwind for colors: prefer `style={{ color: 'var(--color-*)' }}` instead of `text-lighthouse-navy`.

### 4. Fallback Utilities (Backup)
`globals.css` includes `.ll-*` classes as backup:
- `.ll-text-navy`, `.ll-bg-crimson`, `.ll-bg-sand`, etc.
- `.ll-hover-bg-sand:hover`, `.ll-hover-text-navy:hover` for hover states
- `.ll-input-landing` for footer/newsletter input (placeholder + focus ring)

## Configuration Checklist

- [x] `postcss.config.js` (CommonJS, NOT .mjs) with tailwindcss + autoprefixer
- [x] `tailwind.config.js` with content paths and safelist for custom colors
- [x] `app/globals.css` imports `@tailwind base/components/utilities` and defines `:root` variables
- [x] `app/layout.tsx` body has inline `style={{ backgroundColor, color }}` as fallback

## Layout & Responsive (Prevent Screen Breaking)

### Header Breakpoint
- **Desktop nav** shows at viewport ≥ 1024px (not 768px)
- **Mobile menu** shows at viewport < 1024px
- Uses JS `window.innerWidth` instead of Tailwind `md:` to avoid Tailwind-dependent breakpoints
- Prevents cramped nav and overlap on fold/tablet devices (e.g. 853px width)

### Mobile Menu
- Full overlay with semi-transparent backdrop when open
- Inline styles for `backgroundColor`, `borderColor`, `boxShadow` so it works if Tailwind fails
- Backdrop closes menu on tap

### Layout Safeguards (globals.css)
- `html`, `body`: `overflow-x: hidden`, `width: 100%`
- `main`: `width: 100%`, `max-width: 100%`
- Flex children: `min-w-0` to prevent overflow

## When Adding New Components
1. Use `style={{ color: 'var(--color-*)' }}` for text/background/border colors
2. Use Tailwind only for layout (flex, grid, padding, etc.)
3. Never rely solely on Tailwind color classes like `text-lighthouse-navy` for critical UI
4. For responsive behavior, prefer JS `window.innerWidth` if Tailwind breakpoints have been unreliable
