/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Outlet, HeadContent, Scripts, createRootRoute, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OverlayProvider } from 'overlay-kit'
import appCss from '~/styles/app.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FE Lab' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <OverlayProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="border-b border-gray-200 bg-white">
              <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
                <Link to="/" className="text-lg font-bold text-gray-900">
                  FE Lab
                </Link>
                <Link
                  to="/optimistic-actions"
                  className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-blue-600"
                >
                  Optimistic Actions
                </Link>
                <Link
                  to="/prefetch-overlay"
                  className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-blue-600"
                >
                  Prefetch Overlay
                </Link>
                <Link
                  to="/month-selector-pagination"
                  className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-blue-600"
                >
                  Pagination
                </Link>
                <Link
                  to="/sticky-header"
                  className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-blue-600"
                >
                  Sticky Header
                </Link>
              </div>
            </nav>
            <main className="mx-auto max-w-4xl px-4 py-8">
              <Outlet />
            </main>
          </div>
          <TanStackRouterDevtools />
        </OverlayProvider>
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
