import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsScreen } from './SettingsScreen';
import type { AppState } from '../../logic/persistence';

const EMPTY_STATE: AppState = { players: [], templates: [], game: null, history: [] };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SettingsScreen', () => {
  it('exports a backup by creating and clicking a download link', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<SettingsScreen state={EMPTY_STATE} dispatch={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Export Backup' }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });

  it('imports a valid backup file and dispatches IMPORT_MERGE', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const backup = {
      app: 'boardgamescore',
      formatVersion: 1,
      exportedAt: '2026-08-21T00:00:00.000Z',
      players: [{ id: 'p1', name: 'Alice', color: '#ff0000' }],
      templates: [],
      game: null,
      history: [],
    };
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });

    render(<SettingsScreen state={EMPTY_STATE} dispatch={dispatch} />);
    await user.upload(screen.getByLabelText('Import Backup File'), file);

    expect(await screen.findByText(/imported/i)).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirm Import' }));

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'IMPORT_MERGE',
        state: expect.objectContaining({
          players: [expect.objectContaining({ name: 'Alice' })],
        }),
      }),
    );
  });

  it('does not dispatch when import is cancelled', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const backup = {
      app: 'boardgamescore',
      formatVersion: 1,
      exportedAt: '2026-08-21T00:00:00.000Z',
      players: [{ id: 'p1', name: 'Alice', color: '#ff0000' }],
      templates: [],
      game: null,
      history: [],
    };
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });

    render(<SettingsScreen state={EMPTY_STATE} dispatch={dispatch} />);
    await user.upload(screen.getByLabelText('Import Backup File'), file);

    expect(await screen.findByText(/imported/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows an error for an invalid backup file and does not dispatch', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    const file = new File(['not json'], 'backup.json', { type: 'application/json' });

    render(<SettingsScreen state={EMPTY_STATE} dispatch={dispatch} />);
    await user.upload(screen.getByLabelText('Import Backup File'), file);

    expect(await screen.findByText(/not valid json/i)).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
