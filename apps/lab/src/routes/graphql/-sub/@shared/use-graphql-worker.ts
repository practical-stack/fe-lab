import { useState, useEffect } from 'react'

let workerPromise: Promise<void> | null = null

async function startWorker() {
  const { worker } = await import('./msw/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

/**
 * Hook to ensure MSW worker is started before rendering GraphQL demos.
 * Returns `ready` when the worker is active.
 */
export function useGraphQLWorker() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!workerPromise) {
      workerPromise = startWorker()
    }
    workerPromise.then(() => setReady(true))
  }, [])

  return ready
}
