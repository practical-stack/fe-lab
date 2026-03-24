import { Suspense, useState } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { RelayEnvironmentWrapper } from '../@shared/relay/RelayEnvironmentProvider'
import type { relaySetupDemoQuery } from './__generated__/relaySetupDemoQuery.graphql'

const UserQuery = graphql`
  query relaySetupDemoQuery($id: ID!) {
    user(id: $id) {
      id
      name
      email
      avatar
    }
  }
`

function UserCard({ userId }: { userId: string }) {
  const data = useLazyLoadQuery<relaySetupDemoQuery>(UserQuery, { id: userId })

  if (!data.user) return <p className="text-sm text-gray-400">User not found</p>

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <img
        src={data.user.avatar ?? ''}
        alt={data.user.name}
        className="h-10 w-10 rounded-full bg-gray-100"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900">{data.user.name}</p>
        <p className="text-xs text-gray-500">{data.user.email}</p>
        <p className="mt-0.5 font-mono text-[10px] text-gray-400">id: {data.user.id}</p>
      </div>
    </div>
  )
}

export function RelaySetupDemo() {
  const [userId, setUserId] = useState('1')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">User ID:</span>
        {['1', '2', '3', '4', '5'].map((id) => (
          <button
            key={id}
            onClick={() => setUserId(id)}
            className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
              userId === id
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      <RelayEnvironmentWrapper>
        <Suspense
          fallback={
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-400">
              <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-500" />
              Loading via Relay...
            </div>
          }
        >
          <UserCard userId={userId} />
        </Suspense>
      </RelayEnvironmentWrapper>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-600">
        <p>
          <strong>이 데모가 하는 일:</strong> Relay의{' '}
          <code className="rounded bg-gray-200 px-1">useLazyLoadQuery</code>가 MSW mock 서버에
          GraphQL 쿼리를 보내고, 응답을 Relay Store에 정규화하여 캐싱합니다. 같은 유저 ID를 다시
          클릭하면 네트워크 요청 없이 캐시에서 즉시 반환합니다.
        </p>
      </div>
    </div>
  )
}
