import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryScreen } from './HistoryScreen';
import type { HistoryEntry } from '../../logic/types';

const OLDER: HistoryEntry = {
  gameId: 'g1',
  templateName: 'Catan',
  playerNames: ['Alice'],
  finishedAt: '2026-08-01T00:00:00.000Z',
  standings: [
    {
      playerId: 'p1',
      playerName: 'Alice',
      categoryTotals: [],
      total: 10,
      rank: 1,
    },
  ],
};

const NEWER: HistoryEntry = {
  ...OLDER,
  gameId: 'g2',
  templateName: 'Golf (card game)',
  finishedAt: '2026-08-21T00:00:00.000Z',
};

describe('HistoryScreen', () => {
  it('shows an empty-state message when there are no finished games', () => {
    render(<HistoryScreen history={[]} onSelect={() => {}} />);
    expect(screen.getByText(/no finished games/i)).toBeInTheDocument();
  });

  it('lists finished games newest first', () => {
    render(<HistoryScreen history={[OLDER, NEWER]} onSelect={() => {}} />);
    const items = screen.getAllByRole('button');
    expect(items[0]).toHaveTextContent('Golf (card game)');
    expect(items[1]).toHaveTextContent('Catan');
  });

  it('shows the winner for each entry', () => {
    render(<HistoryScreen history={[OLDER]} onSelect={() => {}} />);
    expect(screen.getByText(/Winner: Alice/)).toBeInTheDocument();
  });

  it('calls onSelect with the chosen entry', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<HistoryScreen history={[OLDER]} onSelect={onSelect} />);
    await user.click(screen.getByText(/Catan/));
    expect(onSelect).toHaveBeenCalledWith(OLDER);
  });
});
