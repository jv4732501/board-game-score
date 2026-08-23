import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameScreen } from './GameScreen';
import type { GameSession, Player, Template } from '../../logic/types';

const TEMPLATE: Template = {
  id: 't1',
  name: 'Catan',
  categories: [{ id: 'c1', name: 'Points', key: 'points' }],
  formula: null,
  winDirection: 'high',
  builtIn: true,
};

const PLAYERS: Player[] = [{ id: 'p1', name: 'Alice', color: '#ff0000' }];

const GAME: GameSession = {
  id: 'g1',
  templateId: 't1',
  playerIds: ['p1'],
  entries: { p1: { c1: [{ id: 'e1', value: 5 }] } },
  moveLog: [{ playerId: 'p1', categoryId: 'c1', entryId: 'e1' }],
  startedAt: '2026-08-21T00:00:00.000Z',
  finishedAt: null,
};

function renderScreen(overrides: Partial<React.ComponentProps<typeof GameScreen>> = {}) {
  return render(
    <GameScreen
      game={GAME}
      template={TEMPLATE}
      players={PLAYERS}
      dispatch={() => {}}
      onFinish={() => {}}
      {...overrides}
    />,
  );
}

describe('GameScreen', () => {
  it('renders a score card for each player', () => {
    renderScreen();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('disables Undo when the move log is empty', () => {
    renderScreen({ game: { ...GAME, moveLog: [] } });
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('dispatches UNDO_LAST_ENTRY when Undo is clicked', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    renderScreen({ dispatch });
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'UNDO_LAST_ENTRY' });
  });

  it('dispatches ADD_ENTRY when a score is added', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    renderScreen({ dispatch });
    await user.type(screen.getByLabelText('Add to Points'), '3');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADD_ENTRY',
        playerId: 'p1',
        categoryId: 'c1',
        value: 3,
      }),
    );
  });

  it('finishes the game, dispatching FINISH_GAME and calling onFinish with the standings', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const onFinish = vi.fn();
    renderScreen({ dispatch, onFinish });
    await user.click(screen.getByRole('button', { name: 'End Game' }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'FINISH_GAME',
        historyEntry: expect.objectContaining({
          gameId: 'g1',
          templateName: 'Catan',
          playerNames: ['Alice'],
        }),
      }),
    );
    expect(onFinish).toHaveBeenCalled();
  });

  it('does not show a Scoring Reference button when the template has none', () => {
    renderScreen();
    expect(screen.queryByRole('button', { name: 'Scoring Reference' })).not.toBeInTheDocument();
  });

  it('shows a Scoring Reference button and opens a dialog listing it on click', async () => {
    const user = userEvent.setup();
    const templateWithReference: Template = {
      ...TEMPLATE,
      scoringReference: [
        { label: 'Full House', points: '25' },
        { label: 'Yahtzee', points: '50' },
      ],
    };
    renderScreen({ template: templateWithReference });
    await user.click(screen.getByRole('button', { name: 'Scoring Reference' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Full House')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Yahtzee')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
