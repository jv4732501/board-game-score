import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Nav } from './Nav';

describe('Nav', () => {
  it('renders a tab for each top-level screen', () => {
    render(<Nav screen="home" onNavigate={() => {}} />);
    for (const label of ['Home', 'Templates', 'Players', 'History', 'Settings']) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    }
  });

  it('calls onNavigate with the clicked screen', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Nav screen="home" onNavigate={onNavigate} />);
    await user.click(screen.getByRole('tab', { name: 'History' }));
    expect(onNavigate).toHaveBeenCalledWith('history');
  });

  it('selects no tab when on a non-nav screen like the game screen', () => {
    render(<Nav screen="game" onNavigate={() => {}} />);
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveAttribute('aria-selected', 'false');
    }
  });
});
