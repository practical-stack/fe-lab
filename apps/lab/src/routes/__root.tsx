/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Outlet, HeadContent, Scripts, createRootRoute, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import appCss from '~/styles/app.css?url'

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
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link to="/" className="text-lg font-bold text-gray-900">
              FE Lab
            </Link>
            <Link
              to="/action-props"
              className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-blue-600"
            >
              Action Props
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
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
