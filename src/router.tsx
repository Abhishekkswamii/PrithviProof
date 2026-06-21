import { createBrowserRouter, Outlet } from 'react-router-dom';
import LandingPage from './pages/page';
import MethodologyPage from './pages/methodology/page';
import SignInPage from './pages/auth/sign-in/page';
import SignUpPage from './pages/auth/sign-up/page';
import ResetPasswordPage from './pages/auth/reset-password/page';

import { RouteErrorBoundary } from './components/ErrorBoundary';

const RootLayout = () => {
  return (
    <div className="antialiased min-h-screen bg-canvas text-text-primary flex flex-col font-sans">
      <nav aria-label="Skip links">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-surface focus:z-50 focus:rounded-card"
        >
          Skip to main content
        </a>
      </nav>
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'methodology',
        element: <MethodologyPage />,
      },
      {
        path: 'auth/sign-in',
        element: <SignInPage />,
      },
      {
        path: 'auth/sign-up',
        element: <SignUpPage />,
      },
      {
        path: 'auth/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        lazy: async () => {
          const { default: Component } = await import('./pages/(app)/layout');
          return { Component: () => <Component><Outlet /></Component> };
        },
        children: [
          {
            path: 'dashboard',
            lazy: async () => ({ Component: (await import('./pages/(app)/dashboard/page')).default }),
          },
          {
            path: 'assessment',
            lazy: async () => ({ Component: (await import('./pages/(app)/assessment/page')).default }),
          },
          {
            path: 'log',
            lazy: async () => ({ Component: (await import('./pages/(app)/log/page')).default }),
          },
          {
            path: 'activities', // Map activities to log
            lazy: async () => ({ Component: (await import('./pages/(app)/log/page')).default }),
          },
          {
            path: 'ledger',
            lazy: async () => ({ Component: (await import('./pages/(app)/ledger/page')).default }),
          },
          {
            path: 'recommendations',
            lazy: async () => ({ Component: (await import('./pages/(app)/recommendations/page')).default }),
          },
          {
            path: 'settings',
            lazy: async () => ({ Component: (await import('./pages/(app)/settings/page')).default }),
          },
        ]
      },
      {
        path: '*',
        element: <div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Not Found</h1></div>
      }
    ]
  }
]);
