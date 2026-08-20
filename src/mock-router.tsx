import React from 'react';

export function useNavigate() {
  return ({ to, params }: any) => {
    let path = to;
    if (params) {
      for (const key in params) {
        path = path.replace(`$${key}`, params[key]);
      }
    }
    window.location.hash = path;
  };
}

export function Link({ to, children, className, params }: any) {
  let path = to;
  if (params) {
    for (const key in params) {
      path = path.replace(`$${key}`, params[key]);
    }
  }
  return (
    <a href={`#${path}`} className={className}>
      {children}
    </a>
  );
}

export function createFileRoute(path: string) {
  return (config: any) => {
    return {
      component: config.component || null,
      ...config
    };
  };
}

export function useMatchRoute() {
  return () => false;
}

export function isRedirect() { return false; }
export function useRouter() { return { navigate: useNavigate() }; }
export function ErrorComponent() { return null; }
export function CatchBoundary() { return null; }
export function DefaultCatchBoundary() { return null; }
export function useMatch() { return { params: {} }; }
export function createRouteMask() { return {}; }
export function CatchNotFound() { return null; }
export function retainSearchParams() { return null; }
export function rootRouteId() { return null; }
export function getRouteApi() { return { useMatch: () => ({ params: {} }) }; }
export function useRouteContext() { return {}; }
export function Outlet() { return null; }
export function ScrollRestoration() { return null; }
export function RouterProvider() { return null; }
export function createRouter() { return {}; }
