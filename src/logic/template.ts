import { evaluateFormula, parseFormula } from './formula';
import { PRESET_TEMPLATES } from './presetTemplates';
import type { Category, GameSession, Player, ScoreEntry, StandingRow, Template } from './types';

export function slugifyKey(name: string): string {
  const words = name
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function categorySubtotal(entries: ScoreEntry[] | undefined): number {
  if (!entries) return 0;
  return entries.reduce((sum, entry) => sum + entry.value, 0);
}

export function computeCategoryTotalsById(
  template: Template,
  game: GameSession,
  playerId: string,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const category of template.categories) {
    result[category.id] = categorySubtotal(game.entries[playerId]?.[category.id]);
  }
  return result;
}

export function computePlayerTotal(
  template: Template,
  categoryTotalsById: Record<string, number>,
): number {
  if (!template.formula) {
    return Object.values(categoryTotalsById).reduce((sum, value) => sum + value, 0);
  }
  const keys = template.categories.map((c) => c.key);
  const parsed = parseFormula(template.formula, keys);
  if (!parsed.ok) return 0;
  const values: Record<string, number> = {};
  for (const category of template.categories) {
    values[category.key] = categoryTotalsById[category.id] ?? 0;
  }
  return evaluateFormula(parsed.ast, values);
}

export function computeStandings(
  template: Template,
  game: GameSession,
  players: Player[],
): StandingRow[] {
  const rows = game.playerIds.map((playerId) => {
    const player = players.find((p) => p.id === playerId);
    const categoryTotalsById = computeCategoryTotalsById(template, game, playerId);
    const categoryTotals = template.categories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      total: categoryTotalsById[category.id],
    }));
    return {
      playerId,
      playerName: player?.name ?? 'Unknown Player',
      categoryTotals,
      total: computePlayerTotal(template, categoryTotalsById),
      rank: 0,
    };
  });

  const sorted = rows.slice().sort((a, b) => {
    return template.winDirection === 'high' ? b.total - a.total : a.total - b.total;
  });

  let rank = 0;
  let prevTotal: number | null = null;
  return sorted.map((row, index) => {
    if (prevTotal === null || row.total !== prevTotal) {
      rank = index + 1;
      prevTotal = row.total;
    }
    return { ...row, rank };
  });
}

export interface ValidateTemplateInput {
  name: string;
  categories: Category[];
  formula: string | null;
}

export type ValidateTemplateResult = { ok: true } | { ok: false; error: string };

export function validateTemplate(input: ValidateTemplateInput): ValidateTemplateResult {
  if (!input.name.trim()) return { ok: false, error: 'Template name is required.' };
  if (input.categories.length === 0) {
    return { ok: false, error: 'At least one category is required.' };
  }
  const keys = new Set<string>();
  for (const category of input.categories) {
    if (!category.name.trim()) return { ok: false, error: 'Every category needs a name.' };
    if (!category.key) return { ok: false, error: `Category "${category.name}" has no valid key.` };
    if (keys.has(category.key)) {
      return { ok: false, error: `Duplicate category key "${category.key}".` };
    }
    keys.add(category.key);
  }
  if (input.formula) {
    const parsed = parseFormula(
      input.formula,
      input.categories.map((c) => c.key),
    );
    if (!parsed.ok) return { ok: false, error: parsed.error };
  }
  return { ok: true };
}

export function getAllTemplates(customTemplates: Template[]): Template[] {
  return [...PRESET_TEMPLATES, ...customTemplates];
}
