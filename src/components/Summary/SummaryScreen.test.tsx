import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryScreen } from './SummaryScreen';
import type { HistoryEntry } from '../../logic/types';

const ENTRY: HistoryEntry = {
  gameId: 'g1',
  templateName: 'Catan',
  playerNames: ['Alice', 'Bob'],
  finishedAt: '2026-08-21T01:00:00.000Z',
  standings: [
    {
      playerId: 'p1',
      playerName: 'Alice',
      categoryTotals: [{ categoryId: 'c1', categoryName: 'Settlements', total: 10 }],
      total: 10,
      rank: 1,
    },
    {
      playerId: 'p2',
      playerName: 'Bob',
      categoryTotals: [{ categoryId: 'c1', categoryName: 'Settlements', total: 6 }],
      total: 6,
      rank: 2,
    },
  ],
};

describe('SummaryScreen', () => {
  it('shows each player with their rank and total', () => {
    render(<SummaryScreen entry={ENTRY} onDone={() => {}} />);
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
    expect(screen.getAllByText('6').length).toBeGreaterThan(0);
  });

  it('shows the category breakdown', () => {
    render(<SummaryScreen entry={ENTRY} onDone={() => {}} />);
    expect(screen.getByText('Settlements')).toBeInTheDocument();
  });

  it('calls onDone when Done is clicked', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<SummaryScreen entry={ENTRY} onDone={onDone} />);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).toHaveBeenCalled();
  });
});
