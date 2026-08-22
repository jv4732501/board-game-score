import { Tab, Tabs } from '@mui/material';

export type Screen =
  | 'home'
  | 'players'
  | 'templates'
  | 'templateBuilder'
  | 'game'
  | 'summary'
  | 'history'
  | 'settings';

interface NavTab {
  value: Screen;
  label: string;
}

const NAV_TABS: NavTab[] = [
  { value: 'home', label: 'Home' },
  { value: 'templates', label: 'Templates' },
  { value: 'players', label: 'Players' },
  { value: 'history', label: 'History' },
  { value: 'settings', label: 'Settings' },
];

export function Nav({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  const value = NAV_TABS.some((tab) => tab.value === screen) ? screen : false;
  return (
    <Tabs
      value={value}
      onChange={(_, next: Screen) => onNavigate(next)}
      variant="scrollable"
      sx={{ mb: 2 }}
    >
      {NAV_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );
}
