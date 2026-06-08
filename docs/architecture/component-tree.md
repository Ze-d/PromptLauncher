# Component Tree

## Structure

```
App
├── MainPage
│   ├── Toolbar
│   ├── Sidebar
│   ├── PromptList
│   │   └── PromptCard[]
│   └── PromptEditor
│       ├── TagInput
│       └── GroupSelect
├── QuickSearchPage
│   ├── QuickSearchBox
│   └── QuickSearchResultList
│       └── QuickSearchResultItem[]
└── SettingsPage
    ├── ShortcutSetting
    ├── ThemeSetting
    └── DataSetting
```

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| App | Root routing between main/quick-search/settings windows |
| MainPage | Three-column layout for prompt management |
| Toolbar | Global search, add prompt, settings buttons |
| Sidebar | Group navigation (All, Favorites, Recent, custom) |
| PromptList | Scrollable list of filtered prompts |
| PromptEditor | Create/edit form for prompt fields |
| QuickSearchPage | Search input + results for quick copy flow |
| QuickSearchBox | Auto-focused search input with keyboard shortcuts |
| QuickSearchResultList | Keyboard-navigable result list |
| SettingsPage | Application configuration form |
