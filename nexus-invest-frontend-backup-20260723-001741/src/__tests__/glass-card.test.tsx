import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlassCard from '@/components/ui/glass-card';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello World</GlassCard>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('rounded-2xl');
    expect(div.className).toContain('backdrop-blur-xl');
  });

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Content</GlassCard>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('custom-class');
  });
});
