import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateBuilder } from './TemplateBuilder';
import type { Template } from '../../logic/types';

describe('TemplateBuilder', () => {
  it('auto-derives a category key from its name', async () => {
    const user = userEvent.setup();
    render(<TemplateBuilder initialTemplate={null} onSave={() => {}} onCancel={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Add Category' }));
    await user.type(screen.getByLabelText('Category Name'), 'Longest Road');
    expect(screen.getByLabelText('Key')).toHaveValue('longestRoad');
  });

  it('stops auto-deriving the key once it has been edited directly', async () => {
    const user = userEvent.setup();
    render(<TemplateBuilder initialTemplate={null} onSave={() => {}} onCancel={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Add Category' }));
    await user.type(screen.getByLabelText('Category Name'), 'Points');
    await user.clear(screen.getByLabelText('Key'));
    await user.type(screen.getByLabelText('Key'), 'customKey');
    await user.type(screen.getByLabelText('Category Name'), ' Extra');
    expect(screen.getByLabelText('Key')).toHaveValue('customKey');
  });

  it('shows the no-formula message when the formula is blank', () => {
    render(<TemplateBuilder initialTemplate={null} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/no formula/i)).toBeInTheDocument();
  });

  it('shows a formula error for an unknown category key', async () => {
    const user = userEvent.setup();
    render(<TemplateBuilder initialTemplate={null} onSave={() => {}} onCancel={() => {}} />);
    await user.type(screen.getByLabelText('Formula (optional)'), 'unknownKey + 1');
    expect(screen.getByText(/formula error/i)).toBeInTheDocument();
  });

  it('shows a numeric preview for a valid formula', async () => {
    const user = userEvent.setup();
    render(<TemplateBuilder initialTemplate={null} onSave={() => {}} onCancel={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Add Category' }));
    await user.type(screen.getByLabelText('Category Name'), 'Points');
    await user.type(screen.getByLabelText('Formula (optional)'), 'points + 5');
    expect(screen.getByText(/preview.*: 5/i)).toBeInTheDocument();
  });

  it('shows a validation error and does not save when there are no categories', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<TemplateBuilder initialTemplate={null} onSave={onSave} onCancel={() => {}} />);
    await user.type(screen.getByLabelText('Template Name'), 'My Game');
    await user.click(screen.getByRole('button', { name: 'Save Template' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a valid new template', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<TemplateBuilder initialTemplate={null} onSave={onSave} onCancel={() => {}} />);
    await user.type(screen.getByLabelText('Template Name'), 'My Game');
    await user.click(screen.getByRole('button', { name: 'Add Category' }));
    await user.type(screen.getByLabelText('Category Name'), 'Points');
    await user.click(screen.getByRole('button', { name: 'Save Template' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Game',
        categories: [expect.objectContaining({ name: 'Points', key: 'points' })],
        formula: null,
        winDirection: 'high',
        builtIn: false,
      }),
    );
  });

  it('pre-fills the form when editing an existing template and preserves its id', async () => {
    const user = userEvent.setup();
    const existing: Template = {
      id: 'tmpl-1',
      name: 'Existing',
      categories: [{ id: 'c1', name: 'Points', key: 'points' }],
      formula: null,
      winDirection: 'low',
      builtIn: false,
    };
    const onSave = vi.fn();
    render(<TemplateBuilder initialTemplate={existing} onSave={onSave} onCancel={() => {}} />);
    expect(screen.getByLabelText('Template Name')).toHaveValue('Existing');
    await user.click(screen.getByRole('button', { name: 'Save Template' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'tmpl-1' }));
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TemplateBuilder initialTemplate={null} onSave={() => {}} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
