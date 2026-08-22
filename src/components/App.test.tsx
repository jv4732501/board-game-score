import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('renders the Home screen by default', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('navigates between top-level screens via the nav tabs', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Players' }));
    expect(screen.getByRole('heading', { name: 'Players' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Templates' }));
    expect(screen.getByRole('heading', { name: 'Templates' })).toBeInTheDocument();
  });

  it('opens and cancels the template builder from the Templates screen', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Templates' }));
    await user.click(screen.getByRole('button', { name: 'New Template' }));
    expect(screen.getByRole('heading', { name: 'New Template' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Templates' })).toBeInTheDocument();
  });

  it('plays a full game end-to-end and records it in history', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByLabelText('Template'));
    await user.click(await screen.findByRole('option', { name: 'Catan' }));
    await user.type(screen.getByLabelText('New Player'), 'Bob');
    await user.click(screen.getByRole('button', { name: 'Add Player' }));
    await user.click(screen.getByRole('button', { name: 'Start Game' }));

    expect(screen.getByRole('heading', { name: 'Catan' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Add to Settlements'), '5');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);
    await user.click(screen.getByRole('button', { name: 'End Game' }));

    expect(screen.getByRole('heading', { name: 'Catan — Final Standings' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'History' }));
    expect(screen.getByText(/Catan/)).toBeInTheDocument();
  });
});
