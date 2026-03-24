import {
  Environment,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
} from 'relay-runtime'

const fetchFn: FetchFunction = async (request, variables) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  })

  return response.json()
}

export function createRelayEnvironment() {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  })
}

// Singleton for the app
let relayEnvironment: Environment | null = null

export function getRelayEnvironment() {
  if (!relayEnvironment) {
    relayEnvironment = createRelayEnvironment()
  }
  return relayEnvironment
}
