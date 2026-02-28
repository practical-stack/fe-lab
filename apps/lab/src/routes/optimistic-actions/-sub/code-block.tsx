import { useLayoutEffect, useState } from 'react'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import tsx from 'shiki/langs/tsx.mjs'
import githubLight from 'shiki/themes/github-light.mjs'

const highlighterPromise = createHighlighterCore({
  themes: [githubLight],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
})

type CodeBlockProps = {
  code: string
  lang?: string
}

export function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps) {
  const [html, setHtml] = useState('')

  useLayoutEffect(() => {
    highlighterPromise.then((highlighter) => {
      setHtml(highlighter.codeToHtml(code.trim(), { lang, theme: 'github-light' }))
    })
  }, [code, lang])

  return (
    <div
      className="overflow-auto rounded-md text-sm [&_pre]:!bg-transparent [&_pre]:p-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
