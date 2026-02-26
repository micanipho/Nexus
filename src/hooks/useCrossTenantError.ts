import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface CrossTenantErrorState {
  /** Whether the last operation resulted in a cross-tenant error. */
  isCrossTenantError: boolean;
  /** The original error object, if any. */
  error: AxiosError | null;
  /** Reset the error state so the page can be retried. */
  reset: () => void;
  /**
   * Wraps an async function. If it throws a cross-tenant error the state is
   * set automatically; other errors are re-thrown so callers can handle them
   * independently.
   */
  execute: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

export function useCrossTenantError(): CrossTenantErrorState {
  const [error, setError] = useState<AxiosError | null>(null);
  const [isCrossTenantError, setIsCrossTenantError] = useState(false);

  const reset = useCallback(() => {
    setError(null);
    setIsCrossTenantError(false);
  }, []);

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (err) {
      const axiosErr = err as AxiosError & { isCrossTenantError?: boolean };
      if (axiosErr.isCrossTenantError) {
        setError(axiosErr);
        setIsCrossTenantError(true);
        return undefined;
      }
      throw err;
    }
  }, []);

  return { isCrossTenantError, error, reset, execute };
}
