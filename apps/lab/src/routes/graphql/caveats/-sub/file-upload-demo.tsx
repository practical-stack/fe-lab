export function FileUploadDemo() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* REST approach */}
        <div className="rounded-lg border border-green-200 bg-green-50/30 p-4">
          <h4 className="mb-2 text-xs font-bold text-green-800">REST — 표준 multipart/form-data</h4>
          <div className="rounded-md border border-green-100 bg-gray-900 p-3">
            <pre className="text-xs text-green-400">{`// REST: 브라우저 기본 기능으로 바로 가능
const formData = new FormData()
formData.append('file', selectedFile)
formData.append('title', 'My Photo')

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  // Content-Type은 브라우저가 자동 설정
  // boundary도 자동 생성
})

// 진행률 표시도 자연스러움
const xhr = new XMLHttpRequest()
xhr.upload.onprogress = (e) => {
  console.log(\`\${e.loaded / e.total * 100}%\`)
}`}</pre>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-green-700">
            <p>✓ HTTP 표준 — 모든 브라우저/서버가 기본 지원</p>
            <p>✓ 스트리밍 업로드 — 대용량 파일도 메모리 효율적</p>
            <p>✓ 업로드 진행률 — XMLHttpRequest.upload.onprogress</p>
            <p>✓ CDN/프록시 호환 — 추가 설정 없이 동작</p>
          </div>
        </div>

        {/* GraphQL approach */}
        <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
          <h4 className="mb-2 text-xs font-bold text-red-800">GraphQL — 비표준 확장 필요</h4>
          <div className="rounded-md border border-red-100 bg-gray-900 p-3">
            <pre className="text-xs text-yellow-400">{`// GraphQL: 스펙에 파일 업로드가 없음!

// 방법 1: graphql-upload (multipart request spec)
// 비표준 확장. 서버/클라이언트 모두 별도 설정 필요
const formData = new FormData()
formData.append('operations', JSON.stringify({
  query: \`mutation($file: Upload!) {
    uploadFile(file: $file) { url }
  }\`,
  variables: { file: null }
}))
formData.append('map', '{"0":["variables.file"]}')
formData.append('0', selectedFile)

// 방법 2: 하이브리드 (권장)
// 파일은 REST로 업로드, URL을 GraphQL mutation에 전달
const { url } = await uploadViaRest(file)
await gqlFetch(\`
  mutation { createPost(imageUrl: "\${url}") { id } }
\`)`}</pre>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-red-700">
            <p>✗ 비표준 — graphql-multipart-request-spec은 커뮤니티 스펙</p>
            <p>✗ 복잡한 매핑 — operations/map/files 구조가 직관적이지 않음</p>
            <p>✗ 서버 의존 — Apollo Server, Yoga 등 각각 다른 방식으로 지원</p>
            <p>✗ 진행률 추적 — 별도 구현 필요</p>
          </div>
        </div>
      </div>

      {/* Decision guide */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-2 text-xs font-bold text-gray-700">실무 권장 패턴</h4>
        <div className="space-y-2 text-[11px] text-gray-600">
          <div className="rounded border border-blue-100 bg-blue-50/50 p-2.5">
            <p className="font-semibold text-blue-800">하이브리드 패턴 (가장 많이 사용)</p>
            <p className="mt-0.5">
              파일 업로드는 REST (또는 S3 presigned URL)로 처리하고, 업로드된 파일의 URL을 GraphQL
              mutation의 인자로 전달합니다. 각 프로토콜의 장점을 살리는 실용적인 접근입니다.
            </p>
            <div className="mt-1.5 rounded bg-white px-2 py-1.5 font-mono text-[10px] text-gray-700">
              1. POST /upload → {'{'} url: "https://cdn.example.com/abc.jpg" {'}'}<br/>
              2. mutation createPost(imageUrl: $url) → {'{'} post: {'{'} id: "1" {'}'} {'}'}
            </div>
          </div>
          <div className="rounded border border-gray-100 p-2.5">
            <p className="font-semibold text-gray-800">S3 Presigned URL 패턴</p>
            <p className="mt-0.5">
              GraphQL mutation으로 presigned URL을 발급받고, 클라이언트가 S3에 직접 업로드합니다.
              서버 부하가 없고 대용량 파일에 적합합니다.
            </p>
          </div>
          <div className="rounded border border-gray-100 p-2.5">
            <p className="font-semibold text-gray-800">tus 프로토콜</p>
            <p className="mt-0.5">
              대용량 파일의 중단/재개 가능한 업로드가 필요할 때. GraphQL과는 별도 채널로 운영합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
