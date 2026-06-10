// helpers.ts — Shared Zustand store utilities to reduce boilerplate

/** Standard async state fields every store should include. */
export interface AsyncState {
  loading: boolean;
  error: string | null;
}

/** Mixin returning base async state with a clearError action. */
export function asyncStateSlice<
  T extends { loading: boolean; error: string | null },
>(set: (partial: Partial<T>) => void) {
  return {
    loading: false,
    error: null as string | null,
    clearError: () => set({ error: null } as unknown as Partial<T>),
  };
}

/**
 * Wraps an async operation with loading/error management.
 * Returns the result so callers can chain or throw.
 */
export async function runAsync<T, S>(
  set: (partial: Partial<S>) => void,
  fn: () => Promise<T>,
  opts: {
    onOk: (result: T) => Partial<S>;
    onErr?: (e: unknown) => Partial<S>;
  },
): Promise<T> {
  set({ loading: true, error: null } as unknown as Partial<S>);
  try {
    const result = await fn();
    set({ ...opts.onOk(result), loading: false } as unknown as Partial<S>);
    return result;
  } catch (e) {
    set({
      ...(opts.onErr?.(e) ?? {}),
      error: String(e),
      loading: false,
    } as unknown as Partial<S>);
    return undefined as unknown as T;
  }
}
