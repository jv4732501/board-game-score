import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatesScreen } from './TemplatesScreen';
import type { Template } from '../../logic/types';

const PRESET: Template = {
  id: 'preset-1',
  name: 'Catan',
  categories: [{ id: 'c1', name: 'Settlements', key: 'settlements' }],
  formula: null,
  winDirection: 'high',
  builtIn: true,
};

const CUSTOM: Template = {
  id: 'custom-1',
  name: 'My Game',
  categories: [{ id: 'c2', name: 'Points', key: 'points' }],
  formula: null,
  winDirection: 'low',
  builtIn: false,
};

function renderScreen(overrides: Partial<React.ComponentProps<typeof TemplatesScreen>> = {}) {
  return render(
    <TemplatesScreen
      templates={[PRESET, CUSTOM]}
      onNew={() => {}}
      onEdit={() => {}}
      onDuplicate={() => {}}
      dispatch={() => {}}
      {...overrides}
    />,
  );
}

describe('TemplatesScreen', () => {
  it('renders both preset and custom templates', () => {
    renderScreen();
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('My Game')).toBeInTheDocument();
  });

  it('calls onNew when "New Template" is clicked', async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    renderScreen({ onNew });
    await user.click(screen.getByRole('button', { name: 'New Template' }));
    expect(onNew).toHaveBeenCalled();
  });

  it('calls onDuplicate for a built-in template', async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();
    renderScreen({ templates: [PRESET], onDuplicate });
    await user.click(screen.getByLabelText('Duplicate Catan'));
    expect(onDuplicate).toHaveBeenCalledWith(PRESET);
  });

  it('calls onEdit for a custom template', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    renderScreen({ templates: [CUSTOM], onEdit });
    await user.click(screen.getByLabelText('Edit My Game'));
    expect(onEdit).toHaveBeenCalledWith(CUSTOM);
  });

  it('dispatches REMOVE_TEMPLATE for a custom template', async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    renderScreen({ templates: [CUSTOM], dispatch });
    await user.click(screen.getByLabelText('Delete My Game'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'REMOVE_TEMPLATE', id: 'custom-1' });
  });

  it('does not show Edit/Delete for a built-in template', () => {
    renderScreen({ templates: [PRESET] });
    expect(screen.queryByLabelText('Edit Catan')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete Catan')).not.toBeInTheDocument();
  });
});
