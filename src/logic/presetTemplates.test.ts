import { describe, it, expect } from 'vitest';
import {
  FARKLE_TEMPLATE,
  MONOPOLY_TEMPLATE,
  PRESET_TEMPLATES,
  YAHTZEE_TEMPLATE,
} from './presetTemplates';
import { validateTemplate } from './template';

describe('MONOPOLY_TEMPLATE', () => {
  it('is a high-wins net-worth tracker with a formula', () => {
    expect(MONOPOLY_TEMPLATE.name).toBe('Monopoly');
    expect(MONOPOLY_TEMPLATE.winDirection).toBe('high');
    expect(MONOPOLY_TEMPLATE.formula).toBe('cash + propertyValue + buildings - mortgagesPenalty');
    expect(MONOPOLY_TEMPLATE.categories.map((c) => c.key)).toEqual([
      'cash',
      'propertyValue',
      'buildings',
      'mortgagesPenalty',
    ]);
  });
});

describe('YAHTZEE_TEMPLATE', () => {
  it('is a high-wins, no-formula template with the 13 scoresheet categories plus the two bonus boxes', () => {
    expect(YAHTZEE_TEMPLATE.name).toBe('Yahtzee');
    expect(YAHTZEE_TEMPLATE.winDirection).toBe('high');
    expect(YAHTZEE_TEMPLATE.formula).toBeNull();
    expect(YAHTZEE_TEMPLATE.categories.map((c) => c.key)).toEqual([
      'aces',
      'twos',
      'threes',
      'fours',
      'fives',
      'sixes',
      'upperBonus',
      'threeOfAKind',
      'fourOfAKind',
      'fullHouse',
      'smallStraight',
      'largeStraight',
      'yahtzee',
      'chance',
      'yahtzeeBonus',
    ]);
  });

  it('gives fixed-value categories a quick-add point value, and leaves variable ones freeform', () => {
    const pointValueByKey = Object.fromEntries(
      YAHTZEE_TEMPLATE.categories.map((c) => [c.key, c.pointValue]),
    );
    expect(pointValueByKey.upperBonus).toBe(35);
    expect(pointValueByKey.fullHouse).toBe(25);
    expect(pointValueByKey.smallStraight).toBe(30);
    expect(pointValueByKey.largeStraight).toBe(40);
    expect(pointValueByKey.yahtzee).toBe(50);
    expect(pointValueByKey.yahtzeeBonus).toBe(100);
    // Dice-total categories vary every roll — no fixed value to quick-add.
    for (const key of [
      'aces',
      'twos',
      'threes',
      'fours',
      'fives',
      'sixes',
      'threeOfAKind',
      'fourOfAKind',
      'chance',
    ]) {
      expect(pointValueByKey[key]).toBeUndefined();
    }
  });

  it('has a scoring reference covering every fixed-value category', () => {
    const labels = YAHTZEE_TEMPLATE.scoringReference?.map((r) => r.label) ?? [];
    expect(labels).toEqual(
      expect.arrayContaining([
        'Full House',
        'Small Straight',
        'Large Straight',
        'Yahtzee',
        'Yahtzee Bonus',
        'Upper Section Bonus',
      ]),
    );
  });
});

describe('FARKLE_TEMPLATE', () => {
  it('is a high-wins single-category turn-points tracker', () => {
    expect(FARKLE_TEMPLATE.name).toBe('Farkle');
    expect(FARKLE_TEMPLATE.winDirection).toBe('high');
    expect(FARKLE_TEMPLATE.formula).toBeNull();
    expect(FARKLE_TEMPLATE.categories.map((c) => c.key)).toEqual(['turnPoints']);
  });

  it('has a scoring reference covering the standard combos', () => {
    const labels = FARKLE_TEMPLATE.scoringReference?.map((r) => r.label) ?? [];
    expect(labels).toEqual(
      expect.arrayContaining([
        'Single 1',
        'Single 5',
        'Three 1s',
        'Straight (1-6)',
        'Three Pairs',
        'Two Triplets',
      ]),
    );
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
