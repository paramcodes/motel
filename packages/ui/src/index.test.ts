import { describe, it, expect } from 'bun:test';
import { cn, motelTailwindPreset } from './index';

describe('UI Package & Design Tokens', () => {
  it('should merge tailwind classes properly using cn helper', () => {
    const result = cn('bg-red-500', 'p-4', 'bg-blue-500');
    expect(result).toBe('p-4 bg-blue-500');
  });

  it('should export Airbnb DLS color tokens and elevation shadows', () => {
    const colors = motelTailwindPreset.theme.extend.colors;
    expect(colors.rausch).toBe('#ff385c');
    expect(colors['deep-rausch']).toBe('#e00b41');
    expect(colors.ink).toBe('#222222');
    expect(colors.canvas).toBe('#ffffff');

    const shadows = motelTailwindPreset.theme.extend.boxShadow;
    expect(shadows['airbnb-rest']).toContain('rgba(0,0,0,0.02)');
    expect(shadows['airbnb-rest']).toContain('rgba(0,0,0,0.04)');
    expect(shadows['airbnb-rest']).toContain('rgba(0,0,0,0.10)');

    const radii = motelTailwindPreset.theme.extend.borderRadius;
    expect(radii.card).toBe('20px');
  });
});
