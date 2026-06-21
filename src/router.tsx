import { createBrowserRouter, Outlet } from 'react-router-dom';
import { RouteErrorBoundary } from './components/ErrorBoundary';

const RootLayout = () => (
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./pages/marketing/LandingPage')).default }),
      },
      {
        path: 'methodology',
        lazy: async () => ({ Component: (await import('./pages/marketing/MethodologyPage')).default }),
      },
      {
        path: 'auth/sign-in',
        lazy: async () => ({ Component: (await import('./pages/auth/SignInPage')).default }),
      },
      {
        path: 'auth/sign-up',
        lazy: async () => ({ Component: (await import('./pages/auth/SignUpPage')).default }),
      },
      {
        path: 'auth/reset-password',
        lazy: async () => ({ Component: (await import('./pages/auth/ResetPasswordPage')).default }),
      },
      {
        lazy: async () => {
          const { default: Component } = await import('./pages/app/AppLayout');
          return { Component: () => <Component><Outlet /></Component> };
        },
        children: [
          {
            path: 'dashboard',
            lazy: async () => ({ Component: (await import('./pages/app/DashboardPage')).default }),
          },
          {
            path: 'assessment',
            lazy: async () => ({ Component: (await import('./pages/app/AssessmentPage')).default }),
          },
          {
            path: 'log',
            lazy: async () => ({ Component: (await import('./pages/app/ActivityLogPage')).default }),
          },
          {
            path: 'activities',
            lazy: async () => ({ Component: (await import('./pages/app/ActivityLogPage')).default }),
          },
          {
            path: 'ledger',
            lazy: async () => ({ Component: (await import('./pages/app/LedgerPage')).default }),
          },
          {
            path: 'recommendations',
            lazy: async () => ({ Component: (await import('./pages/app/RecommendationsPage')).default }),
          },
          {
            path: 'settings',
            lazy: async () => ({ Component: (await import('./pages/app/SettingsPage')).default }),
          },
        ],
      },
      {
        path: '*',
        element: <div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Not Found</h1></div>,
      },
    ],
  },
]);
