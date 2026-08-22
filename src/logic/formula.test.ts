import { describe, it, expect } from 'vitest';
import { parseFormula, evaluateFormula } from './formula';

function evalSource(source: string, keys: string[], values: Record<string, number>): number {
  const parsed = parseFormula(source, keys);
  if (!parsed.ok) throw new Error(parsed.error);
  return evaluateFormula(parsed.ast, values);
}

describe('parseFormula / evaluateFormula', () => {
  it('evaluates a simple sum', () => {
    expect(evalSource('a + b', ['a', 'b'], { a: 2, b: 3 })).toBe(5);
  });

  it('respects operator precedence', () => {
    expect(evalSource('a + b * 2', ['a', 'b'], { a: 1, b: 2 })).toBe(5);
  });

  it('respects parentheses', () => {
    expect(evalSource('(a + b) * 2', ['a', 'b'], { a: 1, b: 2 })).toBe(6);
  });

  it('handles unary minus', () => {
    expect(evalSource('-a + b', ['a', 'b'], { a: 1, b: 5 })).toBe(4);
  });

  it('handles subtraction and division', () => {
    expect(evalSource('a - b / 2', ['a', 'b'], { a: 10, b: 4 })).toBe(8);
  });

  it('treats division by zero as zero', () => {
    expect(evalSource('a / b', ['a', 'b'], { a: 5, b: 0 })).toBe(0);
  });

  it('rejects an unknown identifier', () => {
    const result = parseFormula('a + c', ['a', 'b']);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('c');
  });

  it('rejects unbalanced parentheses', () => {
    const result = parseFormula('(a + b', ['a', 'b']);
    expect(result.ok).toBe(false);
  });

  it('rejects an empty formula', () => {
    const result = parseFormula('', ['a']);
    expect(result.ok).toBe(false);
  });

  it('rejects trailing garbage after a valid expression', () => {
    const result = parseFormula('a + b )', ['a', 'b']);
    expect(result.ok).toBe(false);
  });
});
