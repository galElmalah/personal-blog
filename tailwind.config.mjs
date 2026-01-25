/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tag colors from original SCSS
        'tag-advent-of-code': '#0f0f23',
        'tag-tips': '#b4418e',
        'tag-clean-code': '#1184a7',
        'tag-go': '#29beb0',
        'tag-javascript': '#f0db4f',
        'tag-algorithms': '#d94a8c',
        'tag-html': '#f06529',
        'tag-typescript': '#007acc',
        'tag-tutorial': '#acacac',
        'tag-goals': '#18e2fd',
        'tag-coding-questions': '#4446bb',
        'tag-productivity': '#ff4d00',
        'tag-book-review': '#18acac',
        'tag-leadership': '#db07db',
        // Theme colors
        'accent': '#44bbbb',
        'toolbar-open': '#92ff16',
        'toolbar-close': '#ffaf2e',
        // Terminal theme colors (Tokyo Night)
        'term': {
          'bg': '#1a1b26',
          'bg-alt': '#24283b',
          'fg': '#a9b1d6',
          'fg-dark': '#565f89',
          'green': '#9ece6a',
          'blue': '#7aa2f7',
          'purple': '#bb9af7',
          'cyan': '#7dcfff',
          'yellow': '#e0af68',
          'red': '#f7768e',
          'orange': '#ff9e64',
          'magenta': '#f7768e',
          'selection': '#33467c',
          'comment': '#565f89',
          'cursor': '#c0caf5',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.accent'),
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              '&:hover': {
                color: theme('colors.accent'),
              },
            },
            code: {
              fontFamily: theme('fontFamily.mono'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
