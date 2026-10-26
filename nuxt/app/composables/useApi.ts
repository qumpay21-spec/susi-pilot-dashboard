/** Thin wrapper around $fetch that points at the configured API base URL. */
export function useApi() {
  const { apiBase } = useRuntimeConfig().public;
  return <T>(path: string, query?: Record<string, string | undefined>) =>
    $fetch<T>(path, { baseURL: apiBase as string, query, retry: 1 });
}

/** Turns any fetch error into a short message for the UI. */
export function errorMessage(err: unknown): string {
  const e = err as { data?: { message?: string | string[] }; message?: string };
  const msg = e?.data?.message ?? e?.message ?? 'Something went wrong';
  return Array.isArray(msg) ? msg.join(', ') : msg;
}
