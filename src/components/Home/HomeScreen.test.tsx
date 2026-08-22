import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeScreen } from './HomeScreen';
import type { GameSession, Player, Template } from '../../logic/types';

const TEMPLATE: Template = {
  id: 't1',
  name: 'Catan',
  categories: [{ id: 'c1', name: 'Points', key: 'points' }],
  formula: null,
  winDirection: 'high',
  builtIn: true,
};

const ALICE: Player = { id: 'p1', name: 'Alice', color: '#ff0000' };

const IN_PROGRESS: GameSession = {
  id: 'g1',
  templateId: 't1',
  playerIds: ['p1'],
  entries: {},
  moveLog: [],
  startedAt: '2026-08-21T00:00:00.000Z',
  finishedAt: null,
};

function renderScreen(overrides: Partial<React.ComponentProps<typeof HomeScreen>> = {}) {
  return render(
    <HomeScreen
      templates={[TEMPLATE]}
      players={[ALICE]}
      game={null}
      dispatch={() => {}}
      onStartGame={() => {}}
      onResume={() => {}}
      {...overrides}
    />,
  );
}

describe('HomeScreen', () => {
  it('shows a resume banner for an in-progress game', () => {
    renderScreen({ game: IN_PROGRESS });
    expect(screen.getByText(/game in progress/i)).toBeInTheDocument();
  });

  it('does not show a resume banner when there is no game', () => {
    renderScreen({ game: null });
    expect(screen.queryByText(/game in progress/i)).not.toBeInTheDocument();
  });

  it('calls onResume when Resume is clicked', async () => {
    const user = userEvent.setup();
    const onResume = vi.fn();
    renderScreen({ game: IN_PROGRESS, onResume });
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onResume).toHaveBeenCalled();
  });

  it('disables Start Game until a template and a player are selected', async () => {
    const user = userEvent.setup();
    renderScreen();
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled();
    await user.click(screen.getByLabelText('Template'));
    await user.click(await screen.findByRole('option', { name: 'Catan' }));
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled();
    await user.click(screen.getByLabelText('Alice'));
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled();
  });

  it('starts a game with the selected template and players', async () => {
    const user = userEvent.setup();
    const onStartGame = vi.fn();
    renderScreen({ onStartGame });
    await user.click(screen.getByLabelText('Template'));
    await user.click(await screen.findByRole('option', { name: 'Catan' }));
    await user.click(screen.getByLabelText('Alice'));
    await user.click(screen.getByRole('button', { name: 'Start Game' }));
    expect(onStartGame).toHaveBeenCalledWith(
      expect.objectContaining({ templateId: 't1', playerIds: ['p1'] }),
    );
  });

  it('adding a new player registers it via dispatch', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    renderScreen({ players: [], dispatch });
    await user.type(screen.getByLabelText('New Player'), 'Bob');
    await user.click(screen.getByRole('button', { name: 'Add Player' }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPSERT_PLAYER',
        player: expect.objectContaining({ name: 'Bob' }),
      }),
    );
  });
});
