import { type ReactNode } from 'react'
import { RelayEnvironmentProvider as Provider } from 'react-relay'
import { getRelayEnvironment } from './environment'

export function RelayEnvironmentWrapper({ children }: { children: ReactNode }) {
  const environment = getRelayEnvironment()
  return <Provider environment={environment}>{children}</Provider>
}
