import { test, expect } from '@playwright/test';

test('build a custom template, play a preset game, and see it in history', async ({ page }) => {
  await page.goto('/');

  // Play a game with a preset template first.
  await page.getByLabel('Template').click();
  await page.getByRole('option', { name: 'Golf (card game)' }).click();
  await page.getByLabel('New Player').fill('Alice');
  await page.getByRole('button', { name: 'Add Player' }).click();
  await page.getByLabel('New Player').fill('Bob');
  await page.getByRole('button', { name: 'Add Player' }).click();
  await page.getByRole('button', { name: 'Start Game' }).click();

  await expect(page.getByRole('heading', { name: 'Golf (card game)' })).toBeVisible();
  const aliceCard = page.locator('.MuiCard-root', { hasText: 'Alice' });
  await aliceCard.getByLabel('Add to Points').fill('5');
  await aliceCard.getByRole('button', { name: 'Add' }).click();
  const bobCard = page.locator('.MuiCard-root', { hasText: 'Bob' });
  await bobCard.getByLabel('Add to Points').fill('9');
  await bobCard.getByRole('button', { name: 'Add' }).click();

  await page.getByRole('button', { name: 'End Game' }).click();
  await expect(
    page.getByRole('heading', { name: 'Golf (card game) — Final Standings' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).click();

  // Build a custom template.
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('button', { name: 'New Template' }).click();
  await page.getByLabel('Template Name').fill('Custom Dice Game');
  await page.getByRole('button', { name: 'Add Category' }).click();
  await page.getByLabel('Category Name').fill('Rolls');
  await page.getByRole('button', { name: 'Save Template' }).click();
  await expect(page.getByText('Custom Dice Game')).toBeVisible();

  // Confirm the finished game shows up in history.
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByText('Golf (card game)')).toBeVisible();
  await expect(page.getByText(/Winner: Alice/)).toBeVisible();
});
