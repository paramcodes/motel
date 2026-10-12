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
        'airbnb-hover':
          '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px 0 rgba(0,0,0,0.08)',
        'airbnb-expanded':
          '0 12px 28px 0 rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        'airbnb-dialog': '0 16px 40px rgba(0,0,0,0.22)',
      },
      borderRadius: {
        card: '20px',
        pill: '32px',
      },
    },
  },
};
