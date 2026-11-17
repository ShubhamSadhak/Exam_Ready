import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type RouteMatch =
  | { page: 'landing' }
  | { page: 'check'; attemptIdParam: string | null }
  | { page: 'results'; attemptId: string }
  | { page: 'review'; attemptId: string }
  | { page: 'about' }
  | { page: 'login' }
  | { page: 'signup' }
  | { page: 'account' };

interface RouterContextValue {
  pathname: string;
  search: string;
  route: RouteMatch;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function matchRoute(pathname: string, search: string): RouteMatch {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { page: 'landing' };
  if (clean === '/check') {
    const params = new URLSearchParams(search);
    return { page: 'check', attemptIdParam: params.get('attemptId') };
  }
  if (clean === '/about') return { page: 'about' };
  if (clean === '/login') return { page: 'login' };
  if (clean === '/signup') return { page: 'signup' };
  if (clean === '/account') return { page: 'account' };

  const resultsMatch = clean.match(/^\/results\/([^/]+)$/);
  if (resultsMatch) {
    return { page: 'results', attemptId: decodeURIComponent(resultsMatch[1]) };
  }

  const reviewMatch = clean.match(/^\/review\/([^/]+)$/);
  if (reviewMatch) {
    return { page: 'review', attemptId: decodeURIComponent(reviewMatch[1]) };
  }

  return { page: 'landing' };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  useEffect(() => {
    const onPopState = () => {
      setLocationState({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin);
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
    setLocationState({ pathname: url.pathname, search: url.search });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const route = matchRoute(locationState.pathname, locationState.search);

  return (
    <RouterContext.Provider
      value={{
        pathname: locationState.pathname,
        search: locationState.search,
        route,
        navigate,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used inside RouterProvider');
  }
  return ctx;
}
