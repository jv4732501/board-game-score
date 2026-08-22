import { describe, it, expect } from 'vitest';
import {
  slugifyKey,
  categorySubtotal,
  computeCategoryTotalsById,
  computePlayerTotal,
  computeStandings,
  validateTemplate,
  getAllTemplates,
} from './template';
import type { Category, GameSession, Player, Template } from './types';

const CATEGORIES: Category[] = [
  { id: 'cat-a', name: 'Category A', key: 'a' },
  { id: 'cat-b', name: 'Category B', key: 'b' },
];

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 'tmpl-1',
    name: 'Test Template',
    categories: CATEGORIES,
    formula: null,
    winDirection: 'high',
    builtIn: false,
    ...overrides,
  };
}

function makeGame(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: 'game-1',
    templateId: 'tmpl-1',
    playerIds: ['p1', 'p2'],
    entries: {},
    moveLog: [],
    startedAt: '2026-08-21T00:00:00.000Z',
    finishedAt: null,
    ...overrides,
  };
}

const PLAYERS: Player[] = [
  { id: 'p1', name: 'Alice', color: '#ff0000' },
  { id: 'p2', name: 'Bob', color: '#00ff00' },
];

describe('slugifyKey', () => {
  it('camelCases a multi-word name', () => {
    expect(slugifyKey('Longest Road')).toBe('longestRoad');
  });

  it('lowercases a single word', () => {
    expect(slugifyKey('Points')).toBe('points');
  });

  it('strips punctuation', () => {
    expect(slugifyKey('Incomplete Tickets (Penalty)')).toBe('incompleteTicketsPenalty');
  });

  it('returns empty string for blank input', () => {
    expect(slugifyKey('   ')).toBe('');
  });
});

describe('categorySubtotal', () => {
  it('sums entry values', () => {
    expect(
      categorySubtotal([
        { id: 'e1', value: 3 },
        { id: 'e2', value: 4 },
      ]),
    ).toBe(7);
  });

  it('returns 0 for undefined', () => {
    expect(categorySubtotal(undefined)).toBe(0);
  });
});

describe('computeCategoryTotalsById', () => {
  it('sums entries per category, defaulting missing categories to 0', () => {
    const template = makeTemplate();
    const game = makeGame({
      entries: { p1: { 'cat-a': [{ id: 'e1', value: 5 }] } },
    });
    expect(computeCategoryTotalsById(template, game, 'p1')).toEqual({ 'cat-a': 5, 'cat-b': 0 });
  });
});

describe('computePlayerTotal', () => {
  it('sums all categories when there is no formula', () => {
    const template = makeTemplate({ formula: null });
    expect(computePlayerTotal(template, { 'cat-a': 2, 'cat-b': 3 })).toBe(5);
  });

  it('evaluates the formula when one is set', () => {
    const template = makeTemplate({ formula: 'a - b' });
    expect(computePlayerTotal(template, { 'cat-a': 10, 'cat-b': 4 })).toBe(6);
  });
});

describe('computeStandings', () => {
  it('ranks players highest-total-first for winDirection "high"', () => {
    const template = makeTemplate({ winDirection: 'high' });
    const game = makeGame({
      entries: {
        p1: { 'cat-a': [{ id: 'e1', value: 10 }] },
        p2: { 'cat-a': [{ id: 'e2', value: 20 }] },
      },
    });
    const standings = computeStandings(template, game, PLAYERS);
    expect(standings[0].playerId).toBe('p2');
    expect(standings[0].rank).toBe(1);
    expect(standings[1].playerId).toBe('p1');
    expect(standings[1].rank).toBe(2);
  });

  it('ranks players lowest-total-first for winDirection "low"', () => {
    const template = makeTemplate({ winDirection: 'low' });
    const game = makeGame({
      entries: {
        p1: { 'cat-a': [{ id: 'e1', value: 10 }] },
        p2: { 'cat-a': [{ id: 'e2', value: 20 }] },
      },
    });
    const standings = computeStandings(template, game, PLAYERS);
    expect(standings[0].playerId).toBe('p1');
    expect(standings[1].playerId).toBe('p2');
  });

  it('gives tied players the same rank and skips the next rank', () => {
    const template = makeTemplate({ winDirection: 'high' });
    const game = makeGame({
      entries: {
        p1: { 'cat-a': [{ id: 'e1', value: 10 }] },
        p2: { 'cat-a': [{ id: 'e2', value: 10 }] },
      },
    });
    const standings = computeStandings(template, game, PLAYERS);
    expect(standings.map((s) => s.rank)).toEqual([1, 1]);
  });

  it('includes labeled per-category totals for each player', () => {
    const template = makeTemplate();
    const game = makeGame({
      entries: { p1: { 'cat-a': [{ id: 'e1', value: 5 }] } },
    });
    const standings = computeStandings(template, game, PLAYERS);
    const alice = standings.find((s) => s.playerId === 'p1')!;
    expect(alice.categoryTotals).toEqual([
      { categoryId: 'cat-a', categoryName: 'Category A', total: 5 },
      { categoryId: 'cat-b', categoryName: 'Category B', total: 0 },
    ]);
  });
});

describe('validateTemplate', () => {
  it('accepts a valid template', () => {
    expect(validateTemplate({ name: 'Foo', categories: CATEGORIES, formula: null })).toEqual({
      ok: true,
    });
  });

  it('rejects a blank name', () => {
    const result = validateTemplate({ name: '  ', categories: CATEGORIES, formula: null });
    expect(result.ok).toBe(false);
  });

  it('rejects an empty category list', () => {
    const result = validateTemplate({ name: 'Foo', categories: [], formula: null });
    expect(result.ok).toBe(false);
  });

  it('rejects duplicate category keys', () => {
    const dup: Category[] = [
      { id: 'c1', name: 'One', key: 'x' },
      { id: 'c2', name: 'Two', key: 'x' },
    ];
    const result = validateTemplate({ name: 'Foo', categories: dup, formula: null });
    expect(result.ok).toBe(false);
  });

  it('rejects an invalid formula', () => {
    const result = validateTemplate({ name: 'Foo', categories: CATEGORIES, formula: 'a + c' });
    expect(result.ok).toBe(false);
  });

  it('accepts a valid formula', () => {
    const result = validateTemplate({ name: 'Foo', categories: CATEGORIES, formula: 'a + b' });
    expect(result.ok).toBe(true);
  });
});

describe('getAllTemplates', () => {
  it('puts presets before custom templates', () => {
    const custom = makeTemplate({ id: 'custom-1' });
    const all = getAllTemplates([custom]);
    expect(all[all.length - 1]).toBe(custom);
    expect(all.length).toBeGreaterThan(1);
    expect(all.every((t) => t.id !== 'custom-1' || t === custom)).toBe(true);
  });
});
