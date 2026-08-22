import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { createAppTheme } from '../theme';
import { useAppState } from '../hooks/useAppState';
import { getAllTemplates } from '../logic/template';
import type { HistoryEntry, Template } from '../logic/types';
import { Nav, type Screen } from './Nav';
import { HomeScreen } from './Home/HomeScreen';
import { PlayersScreen } from './Players/PlayersScreen';
import { TemplatesScreen } from './Templates/TemplatesScreen';
import { TemplateBuilder } from './Templates/TemplateBuilder';
import { GameScreen } from './Game/GameScreen';
import { SummaryScreen } from './Summary/SummaryScreen';
import { HistoryScreen } from './History/HistoryScreen';
import { SettingsScreen } from './Settings/SettingsScreen';

export default function App() {
  const { state, dispatch } = useAppState();
  const [screen, setScreen] = useState<Screen>('home');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingHistoryEntry, setViewingHistoryEntry] = useState<HistoryEntry | null>(null);

  const allTemplates = getAllTemplates(state.templates);
  const activeTemplate = state.game
    ? allTemplates.find((t) => t.id === state.game!.templateId)
    : undefined;

  return (
    <ThemeProvider theme={createAppTheme('light')}>
      <CssBaseline />
      <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
        <Nav screen={screen} onNavigate={setScreen} />

        {screen === 'home' && (
          <HomeScreen
            templates={allTemplates}
            players={state.players}
            game={state.game}
            dispatch={dispatch}
            onStartGame={(game) => {
              dispatch({ type: 'START_GAME', game });
              setScreen('game');
            }}
            onResume={() => setScreen('game')}
          />
        )}

        {screen === 'players' && <PlayersScreen players={state.players} dispatch={dispatch} />}

        {screen === 'templates' && (
          <TemplatesScreen
            templates={allTemplates}
            dispatch={dispatch}
            onNew={() => {
              setEditingTemplate(null);
              setScreen('templateBuilder');
            }}
            onEdit={(template) => {
              setEditingTemplate(template);
              setScreen('templateBuilder');
            }}
            onDuplicate={(template) => {
              setEditingTemplate({
                ...template,
                id: crypto.randomUUID(),
                name: `${template.name} (copy)`,
                builtIn: false,
              });
              setScreen('templateBuilder');
            }}
          />
        )}

        {screen === 'templateBuilder' && (
          <TemplateBuilder
            initialTemplate={editingTemplate}
            onSave={(template) => {
              dispatch({ type: 'UPSERT_TEMPLATE', template });
              setScreen('templates');
            }}
            onCancel={() => setScreen('templates')}
          />
        )}

        {screen === 'game' && state.game && activeTemplate && (
          <GameScreen
            game={state.game}
            template={activeTemplate}
            players={state.players}
            dispatch={dispatch}
            onFinish={(entry) => {
              setViewingHistoryEntry(entry);
              setScreen('summary');
            }}
          />
        )}

        {screen === 'summary' && viewingHistoryEntry && (
          <SummaryScreen entry={viewingHistoryEntry} onDone={() => setScreen('home')} />
        )}

        {screen === 'history' && (
          <HistoryScreen
            history={state.history}
            onSelect={(entry) => {
              setViewingHistoryEntry(entry);
              setScreen('summary');
            }}
          />
        )}

        {screen === 'settings' && <SettingsScreen state={state} dispatch={dispatch} />}
      </Box>
    </ThemeProvider>
  );
}
