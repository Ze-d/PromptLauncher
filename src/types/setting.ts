// setting.ts — Settings-related TypeScript types
// Types: AppSettings, Theme, DefaultAction, ShortcutConfig

export type Theme = 'system' | 'light' | 'dark';
export type DefaultAction = 'copy';

export type AppSettings = {
  globalShortcut: string;
  theme: Theme;
  defaultAction: DefaultAction;
  closeToTray: boolean;
  autoStart: boolean;
  quickWindowWidth: number;
  quickWindowHeight: number;
  sidebarRatio: number;
  listRatio: number;
  sidebarCollapsed: boolean;
};
