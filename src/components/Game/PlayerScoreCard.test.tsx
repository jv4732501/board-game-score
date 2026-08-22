import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerScoreCard } from './PlayerScoreCard';
import type { Category, Player } from '../../logic/types';

const PLAYER: Player = { id: 'p1', name: 'Alice', color: '#ff0000' };
const CATEGORIES: Category[] = [{ id: 'c1', name: 'Points', key: 'points' }];

function renderCard(overrides: Partial<React.ComponentProps<typeof PlayerScoreCard>> = {}) {
  return render(
    <PlayerScoreCard
      player={PLAYER}
      categories={CATEGORIES}
      entriesByCategory={{ c1: [{ id: 'e1', value: 4 }] }}
      total={15}
      rank={1}
      onAddEntry={() => {}}
      onRemoveEntry={() => {}}
      {...overrides}
    />,
  );
}

describe('PlayerScoreCard', () => {
  it('shows the player name, total, and rank', () => {
    renderCard();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Rank 1')).toBeInTheDocument();
  });

  it('shows each logged entry as a chip with a remove button', () => {
    renderCard();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Points entry 4')).toBeInTheDocument();
  });

  it('adds a new entry and clears the input', async () => {
    const user = userEvent.setup();
    const onAddEntry = vi.fn();
    renderCard({ onAddEntry });
    const input = screen.getByLabelText('Add to Points');
    await user.type(input, '7');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAddEntry).toHaveBeenCalledWith('c1', 7);
    expect(input).toHaveValue(null);
  });

  it('removes an entry when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveEntry = vi.fn();
    renderCard({ onRemoveEntry });
    await user.click(screen.getByLabelText('Remove Points entry 4'));
    expect(onRemoveEntry).toHaveBeenCalledWith('c1', 'e1');
  });
});
