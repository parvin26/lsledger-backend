/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    { pattern: /(bg|text|border|divide|ring|placeholder|focus:ring|hover:bg|hover:text)-(lighthouse-navy|deep-slate|ledger-crimson|beacon-red|signal-blue|sand-background|app-bg|info-tint|divider|muted-text)/ },
    { pattern: /(bg|text|border)-(lighthouse-navy|deep-slate|ledger-crimson|beacon-red|signal-blue|sand-background|app-bg|info-tint|divider|muted-text)\/(\d+|20|30|40|50)/ },
  ],
  theme: {
    extend: {
      colors: {
        'lighthouse-navy': '#1A2740',
        'deep-slate': '#2E3A4D',
        'ledger-crimson': '#B71C2A',
        'beacon-red': '#C4322D',
        'signal-blue': '#205B9F',
        'sand-background': '#F6F1E8',
        'app-bg': '#F6F7FB',
        'info-tint': '#E8EEF7',
        'card-shell': '#FFFFFF',
        'divider': '#E5E7EB',
        'muted-text': '#717478',
        'success': '#179E6A',
        'warning': '#E0A400',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'label': ['0.75rem', { letterSpacing: '0.05em', lineHeight: '1.2' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'h1': ['1.875rem', { fontWeight: '600', letterSpacing: '-0.02em', lineHeight: '1.2' }],
        'h2': ['1.25rem', { fontWeight: '600', lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
}
