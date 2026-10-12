export const motelTailwindPreset = {
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        rausch: '#ff385c',
        'deep-rausch': '#e00b41',
        ink: '#222222',
        'body-ink': '#3f3f3f',
        secondary: '#6a6a6a',
        fog: '#717171',
        hairline: '#dddddd',
        'hairline-soft': '#ebebeb',
        'surface-soft': '#f7f7f7',
        'surface-strong': '#f2f2f2',
      },
      boxShadow: {
        'airbnb-rest':
          '0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px 0 rgba(0,0,0,0.04), 0 4px 8px 0 rgba(0,0,0,0.10)',
        'airbnb-hover': '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px 0 rgba(0,0,0,0.08)',
        'airbnb-expanded': '0 12px 28px 0 rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        'airbnb-dialog': '0 16px 40px rgba(0,0,0,0.22)',
      },
      borderRadius: {
        card: '20px',
        pill: '32px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-out-smooth': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'spring-tactile': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(0.7)' },
          '60%': { transform: 'scale(1.3)' },
          '80%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'heart-pop': 'heart-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
};
