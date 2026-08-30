/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'monospace',
        ],
      },
      colors: {
        system: {
          bg: '#F2F2F7', // iOS Grouped Background
          card: '#FFFFFF', // Secondary / Card
          elevated: '#FFFFFF',
          separator: '#E5E5EA',
          border: 'rgba(0, 0, 0, 0.08)',
          label: '#000000',
          secondary: '#6E6E73',
          tertiary: '#8E8E93',
          quaternary: '#C7C7CC',
          blue: '#0071E3',
          teal: '#007A87',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          indigo: '#5856D6',
        }
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'apple': '0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'apple-lg': '0 12px 32px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'apple-sm': '10px',
        'apple': '14px',
        'apple-lg': '20px',
        'apple-xl': '26px',
      }
    },
  },
  plugins: [],
}
