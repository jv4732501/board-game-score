import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { evaluateFormula, parseFormula } from '../../logic/formula';
import { slugifyKey, validateTemplate } from '../../logic/template';
import type { Category, Template } from '../../logic/types';

interface DraftCategory {
  id: string;
  name: string;
  key: string;
  keyTouched: boolean;
  pointValue: string;
}

function toDraftCategories(categories: Category[]): DraftCategory[] {
  return categories.map((c) => ({
    ...c,
    keyTouched: true,
    pointValue: c.pointValue !== undefined ? String(c.pointValue) : '',
  }));
}

export function TemplateBuilder({
  initialTemplate,
  onSave,
  onCancel,
}: {
  initialTemplate: Template | null;
  onSave: (template: Template) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialTemplate?.name ?? '');
  const [categories, setCategories] = useState<DraftCategory[]>(
    toDraftCategories(initialTemplate?.categories ?? []),
  );
  const [formula, setFormula] = useState(initialTemplate?.formula ?? '');
  const [winDirection, setWinDirection] = useState<'high' | 'low'>(
    initialTemplate?.winDirection ?? 'high',
  );
  const [error, setError] = useState<string | null>(null);

  function addCategory() {
    setCategories((cs) => [
      ...cs,
      { id: crypto.randomUUID(), name: '', key: '', keyTouched: false, pointValue: '' },
    ]);
  }

  function removeCategory(id: string) {
    setCategories((cs) => cs.filter((c) => c.id !== id));
  }

  function updateCategoryName(id: string, newName: string) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, name: newName, key: c.keyTouched ? c.key : slugifyKey(newName) } : c,
      ),
    );
  }

  function updateCategoryKey(id: string, newKey: string) {
    setCategories((cs) =>
      cs.map((c) => (c.id === id ? { ...c, key: newKey, keyTouched: true } : c)),
    );
  }

  function updateCategoryPointValue(id: string, newPointValue: string) {
    setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, pointValue: newPointValue } : c)));
  }

  const knownKeys = categories.map((c) => c.key);
  const trimmedFormula = formula.trim();
  let formulaPreview: string;
  if (!trimmedFormula) {
    formulaPreview = 'No formula — total is the sum of all categories.';
  } else {
    const parsed = parseFormula(trimmedFormula, knownKeys);
    if (!parsed.ok) {
      formulaPreview = `Formula error: ${parsed.error}`;
    } else {
      const zeroValues = Object.fromEntries(knownKeys.map((k) => [k, 0]));
      formulaPreview = `Preview (with all categories at 0): ${evaluateFormula(parsed.ast, zeroValues)}`;
    }
  }

  function handleSave() {
    const finalCategories: Category[] = categories.map((c) => {
      const trimmedPointValue = c.pointValue.trim();
      const pointValue = trimmedPointValue === '' ? undefined : Number(trimmedPointValue);
      return {
        id: c.id,
        name: c.name.trim(),
        key: c.key,
        ...(pointValue !== undefined ? { pointValue } : {}),
      };
    });
    const result = validateTemplate({
      name,
      categories: finalCategories,
      formula: trimmedFormula || null,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSave({
      id: initialTemplate?.id ?? crypto.randomUUID(),
      name: name.trim(),
      categories: finalCategories,
      formula: trimmedFormula || null,
      winDirection,
      builtIn: false,
      ...(initialTemplate?.scoringReference
        ? { scoringReference: initialTemplate.scoringReference }
        : {}),
    });
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {initialTemplate ? 'Edit Template' : 'New Template'}
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField label="Template Name" value={name} onChange={(e) => setName(e.target.value)} />

        <Typography variant="subtitle1">Categories</Typography>
        {categories.map((category) => (
          <Stack key={category.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              label="Category Name"
              value={category.name}
              onChange={(e) => updateCategoryName(category.id, e.target.value)}
            />
            <TextField
              label="Key"
              value={category.key}
              onChange={(e) => updateCategoryKey(category.id, e.target.value)}
              sx={{ width: 140 }}
            />
            <TextField
              type="number"
              label="Point Value (optional)"
              value={category.pointValue}
              onChange={(e) => updateCategoryPointValue(category.id, e.target.value)}
              sx={{ width: 140 }}
            />
            <IconButton
              aria-label={`Remove category ${category.name || category.id}`}
              onClick={() => removeCategory(category.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button onClick={addCategory}>Add Category</Button>

        <TextField
          label="Formula (optional)"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          helperText={formulaPreview}
        />

        <Typography variant="subtitle1">Win Direction</Typography>
        <ToggleButtonGroup
          value={winDirection}
          exclusive
          onChange={(_, value: 'high' | 'low' | null) => value && setWinDirection(value)}
        >
          <ToggleButton value="high">Highest wins</ToggleButton>
          <ToggleButton value="low">Lowest wins</ToggleButton>
        </ToggleButtonGroup>

        {error && (
          <Typography color="error" role="alert">
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleSave}>
            Save Template
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
