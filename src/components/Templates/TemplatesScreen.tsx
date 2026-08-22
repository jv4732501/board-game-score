import type { Dispatch } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { AppAction } from '../../hooks/useAppState';
import type { Template } from '../../logic/types';

export function TemplatesScreen({
  templates,
  onNew,
  onEdit,
  onDuplicate,
  dispatch,
}: {
  templates: Template[];
  onNew: () => void;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  dispatch: Dispatch<AppAction>;
}) {
  return (
    <Box>
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Templates</Typography>
        <Button variant="contained" onClick={onNew}>
          New Template
        </Button>
      </Stack>
      <List>
        {templates.map((template) => (
          <ListItem
            key={template.id}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                {template.builtIn ? (
                  <IconButton
                    aria-label={`Duplicate ${template.name}`}
                    onClick={() => onDuplicate(template)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <>
                    <IconButton
                      aria-label={`Edit ${template.name}`}
                      onClick={() => onEdit(template)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label={`Delete ${template.name}`}
                      onClick={() => dispatch({ type: 'REMOVE_TEMPLATE', id: template.id })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            }
          >
            <ListItemText
              primary={template.name}
              slotProps={{ secondary: { component: 'div' } }}
              secondary={
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                  <Chip label={`${template.categories.length} categories`} />
                  <Chip label={template.winDirection === 'high' ? 'Highest wins' : 'Lowest wins'} />
                  {template.builtIn && <Chip label="Built-in" color="primary" />}
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
