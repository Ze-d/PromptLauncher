// prompt.ts — Prompt-related TypeScript types
// Keep in sync with Rust models in src-tauri/src/models/

export type Prompt = {
  id: number;
  title: string;
  content: string;
  description?: string | null;
  groupId?: number | null;
  groupName?: string | null;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePromptInput = {
  title: string;
  content: string;
  description?: string | null;
  groupId?: number | null;
  tags?: string[];
  isFavorite?: boolean;
};

export type UpdatePromptInput = {
  id: number;
  title?: string;
  content?: string;
  description?: string | null;
  groupId?: number | null;
  tags?: string[];
  isFavorite?: boolean;
};

export type SearchPromptInput = {
  keyword: string;
  groupId?: number | null;
  onlyFavorite?: boolean;
  limit?: number;
};

export type Group = {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: number;
  name: string;
  createdAt: string;
};

export type UsageLog = {
  id: number;
  promptId: number;
  action: string;
  createdAt: string;
};
