import { describe, it, expect } from 'vitest';
import { MONOPOLY_TEMPLATE, PRESET_TEMPLATES } from './presetTemplates';
import { validateTemplate } from './template';

describe('MONOPOLY_TEMPLATE', () => {
  it('is a high-wins net-worth tracker with a formula', () => {
    expect(MONOPOLY_TEMPLATE.name).toBe('Monopoly');
    expect(MONOPOLY_TEMPLATE.winDirection).toBe('high');
    expect(MONOPOLY_TEMPLATE.formula).toBe(
      'cash + propertyValue + buildings - mortgagesPenalty',
    );
    expect(MONOPOLY_TEMPLATE.categories.map((c) => c.key)).toEqual([
      'cash',
      'propertyValue',
      'buildings',
      'mortgagesPenalty',
    ]);
  });
});

describe('PRESET_TEMPLATES', () => {
  it('every preset is builtIn and passes validation', () => {
    for (const template of PRESET_TEMPLATES) {
      expect(template.builtIn).toBe(true);
      expect(validateTemplate(template)).toEqual({ ok: true });
    }
  });

  it('has unique ids', () => {
    const ids = PRESET_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes at least one lowest-wins template', () => {
    expect(PRESET_TEMPLATES.some((t) => t.winDirection === 'low')).toBe(true);
  });

  it('includes at least one template with a formula', () => {
    expect(PRESET_TEMPLATES.some((t) => t.formula !== null)).toBe(true);
  });
});
