import { useState } from 'react'

type TypeDef = {
  name: string
  kind: 'type' | 'input' | 'connection'
  fields: Array<{
    name: string
    type: string
    isRelation?: boolean
    relationTo?: string
  }>
  description: string
}

const SCHEMA_TYPES: TypeDef[] = [
  {
    name: 'User',
    kind: 'type',
    description: '사용자 정보를 나타냅니다. posts 필드를 통해 작성한 게시글에 접근할 수 있습니다.',
    fields: [
      { name: 'id', type: 'ID!' },
      { name: 'name', type: 'String!' },
      { name: 'email', type: 'String!' },
      { name: 'avatar', type: 'String' },
      { name: 'posts', type: '[Post!]!', isRelation: true, relationTo: 'Post' },
    ],
  },
  {
    name: 'Post',
    kind: 'type',
    description: '게시글 정보를 나타냅니다. author와 comments를 통해 관련 데이터에 접근합니다.',
    fields: [
      { name: 'id', type: 'ID!' },
      { name: 'title', type: 'String!' },
      { name: 'body', type: 'String!' },
      { name: 'author', type: 'User!', isRelation: true, relationTo: 'User' },
      { name: 'comments', type: '[Comment!]!', isRelation: true, relationTo: 'Comment' },
      { name: 'createdAt', type: 'String!' },
    ],
  },
  {
    name: 'Comment',
    kind: 'type',
    description: '댓글 정보를 나타냅니다. author와 post를 통해 양방향 관계를 탐색할 수 있습니다.',
    fields: [
      { name: 'id', type: 'ID!' },
      { name: 'body', type: 'String!' },
      { name: 'author', type: 'User!', isRelation: true, relationTo: 'User' },
      { name: 'post', type: 'Post!', isRelation: true, relationTo: 'Post' },
      { name: 'createdAt', type: 'String!' },
    ],
  },
  {
    name: 'Query',
    kind: 'type',
    description: 'GraphQL의 진입점(entry point). 모든 데이터 조회는 Query 타입의 필드로 시작합니다.',
    fields: [
      { name: 'user', type: 'User', isRelation: true, relationTo: 'User' },
      { name: 'users', type: 'UserConnection!', isRelation: true, relationTo: 'UserConnection' },
      { name: 'post', type: 'Post', isRelation: true, relationTo: 'Post' },
      { name: 'posts', type: 'PostConnection!', isRelation: true, relationTo: 'PostConnection' },
    ],
  },
  {
    name: 'Mutation',
    kind: 'type',
    description: '데이터 변경(생성, 수정, 삭제)을 위한 진입점. 각 필드가 하나의 변경 작업을 나타냅니다.',
    fields: [
      { name: 'createPost', type: 'CreatePostPayload!' },
      { name: 'updatePost', type: 'UpdatePostPayload!' },
      { name: 'deletePost', type: 'DeletePostPayload!' },
      { name: 'addComment', type: 'AddCommentPayload!' },
    ],
  },
  {
    name: 'UserConnection',
    kind: 'connection',
    description: 'Relay 스타일의 커서 기반 페이지네이션을 위한 Connection 타입. edges와 pageInfo를 포함합니다.',
    fields: [
      { name: 'edges', type: '[UserEdge!]!' },
      { name: 'pageInfo', type: 'PageInfo!' },
      { name: 'totalCount', type: 'Int!' },
    ],
  },
  {
    name: 'PostConnection',
    kind: 'connection',
    description: 'Post 목록의 커서 기반 페이지네이션. Relay Connection Specification을 따릅니다.',
    fields: [
      { name: 'edges', type: '[PostEdge!]!' },
      { name: 'pageInfo', type: 'PageInfo!' },
      { name: 'totalCount', type: 'Int!' },
    ],
  },
]

const KIND_COLORS = {
  type: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', ring: 'ring-blue-400' },
  input: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', ring: 'ring-amber-400' },
  connection: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', ring: 'ring-violet-400' },
}

export function SchemaExplorerDemo() {
  const [selected, setSelected] = useState<string>('User')
  const selectedType = SCHEMA_TYPES.find((t) => t.name === selected)

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {SCHEMA_TYPES.map((type) => {
          const colors = KIND_COLORS[type.kind]
          const isSelected = selected === type.name
          return (
            <button
              key={type.name}
              onClick={() => setSelected(type.name)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? `${colors.bg} ${colors.border} ring-2 ${colors.ring}`
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {type.name}
            </button>
          )
        })}
      </div>

      {/* Type detail */}
      {selectedType && (
        <div className={`rounded-lg border ${KIND_COLORS[selectedType.kind].border} ${KIND_COLORS[selectedType.kind].bg} p-4`}>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${KIND_COLORS[selectedType.kind].badge}`}>
              {selectedType.kind}
            </span>
            <span className="font-mono text-sm font-bold text-gray-900">{selectedType.name}</span>
          </div>
          <p className="mb-3 text-xs text-gray-600">{selectedType.description}</p>

          <div className="rounded-md border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">Field</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">Type</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-500">Relation</th>
                </tr>
              </thead>
              <tbody>
                {selectedType.fields.map((field) => (
                  <tr key={field.name} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-1.5 font-mono text-gray-800">{field.name}</td>
                    <td className="px-3 py-1.5 font-mono text-purple-600">{field.type}</td>
                    <td className="px-3 py-1.5">
                      {field.isRelation && field.relationTo ? (
                        <button
                          onClick={() => setSelected(field.relationTo!)}
                          className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-blue-600 transition-colors hover:bg-blue-100"
                        >
                          → {field.relationTo}
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Relationship diagram */}
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium text-gray-500">Type Relationships</p>
        <div className="flex items-center justify-center gap-4 py-2">
          <TypeNode name="User" selected={selected === 'User'} onClick={() => setSelected('User')} />
          <Arrow label="posts" />
          <TypeNode name="Post" selected={selected === 'Post'} onClick={() => setSelected('Post')} />
          <Arrow label="comments" />
          <TypeNode name="Comment" selected={selected === 'Comment'} onClick={() => setSelected('Comment')} />
        </div>
        <div className="mt-1 flex justify-center">
          <span className="text-[10px] text-gray-400">
            ← author ← author
          </span>
        </div>
      </div>
    </div>
  )
}

function TypeNode({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-4 py-2 text-xs font-bold transition-all ${
        selected
          ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
      }`}
    >
      {name}
    </button>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-gray-300">→</span>
    </div>
  )
}
