import { useCallback } from 'react';

interface FetchOptions extends RequestInit {
  // Opções específicas do hook
}

export function useAuthenticatedFetch() {
  const authenticatedFetch = useCallback(async (url: string, options: FetchOptions = {}) => {
    const defaultOptions: RequestInit = {
      credentials: 'include', // Sempre incluir cookies para autenticação
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    return fetch(url, mergedOptions);
  }, []);

  return { authenticatedFetch };
}
