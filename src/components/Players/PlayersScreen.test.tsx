import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayersScreen } from './PlayersScreen';
import type { Player } from '../../logic/types';

const ALICE: Player = { id: 'p1', name: 'Alice', color: '#ff0000' };

describe('PlayersScreen', () => {
  it('renders existing players', () => {
    render(<PlayersScreen players={[ALICE]} dispatch={() => {}} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no players', () => {
    render(<PlayersScreen players={[]} dispatch={() => {}} />);
    expect(screen.getByText(/no players yet/i)).toBeInTheDocument();
  });

  it('adds a new player and clears the form', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    render(<PlayersScreen players={[]} dispatch={dispatch} />);
    await user.type(screen.getByLabelText('Name'), 'Bob');
    await user.click(screen.getByRole('button', { name: 'Add Player' }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPSERT_PLAYER',
        player: expect.objectContaining({ name: 'Bob' }),
      }),
    );
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('disables Add Player while the name field is empty', () => {
    render(<PlayersScreen players={[]} dispatch={() => {}} />);
    expect(screen.getByRole('button', { name: 'Add Player' })).toBeDisabled();
  });

  it('edits an existing player, preserving its id', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    render(<PlayersScreen players={[ALICE]} dispatch={dispatch} />);
    await user.click(screen.getByLabelText('Edit Alice'));
    expect(screen.getByLabelText('Name')).toHaveValue('Alice');
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Alice Updated');
    await user.click(screen.getByRole('button', { name: 'Update Player' }));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPSERT_PLAYER',
      player: { id: 'p1', name: 'Alice Updated', color: '#ff0000' },
    });
  });

  it('deletes a player', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    render(<PlayersScreen players={[ALICE]} dispatch={dispatch} />);
    await user.click(screen.getByLabelText('Delete Alice'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'REMOVE_PLAYER', id: 'p1' });
  });
});
