import { memo, useMemo, type ReactNode } from 'react'
import katex from 'katex'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { cx } from './cx'

/**
 * Tag for markdown/TeX strings: keeps backslashes literally.
 *   md`The vorticity $\boldsymbol\zeta = \nabla\times\mathbf V$`
 */
export const md = String.raw

/** Shared KaTeX macros (usable in every $...$). */
export const MACROS: Record<string, string> = {
  '\\pd': '\\frac{\\partial #1}{\\partial #2}',
  '\\dd': '\\mathrm{d}',
  '\\vb': '\\mathbf{#1}',
  '\\avg': '\\overline{#1}',
  '\\Rey': '\\mathrm{Re}',
  '\\Eu': '\\mathrm{Eu}',
  '\\Fr': '\\mathrm{Fr}',
  '\\We': '\\mathrm{We}',
  '\\Ma': '\\mathrm{Ma}',
  '\\Pran': '\\mathrm{Pr}',
  '\\Nu': '\\mathrm{Nu}',
  '\\St': '\\mathrm{St}',
  '\\dimM': '\\mathsf{M}',
  '\\dimL': '\\mathsf{L}',
  '\\dimT': '\\mathsf{T}',
  '\\dimF': '\\mathsf{F}',
}

const KATEX_OPTS = { throwOnError: false, strict: 'ignore' as const, macros: MACROS, trust: false }

/** Remove common indentation so template literals inside JSX don't turn into code blocks. */
export function dedent(input: string): string {
  const lines = input.replace(/\t/g, '  ').split('\n')
  while (lines.length && !lines[0].trim()) lines.shift()
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
  if (!lines.length) return ''
  const rest = lines.slice(1).filter((l) => l.trim())
  const firstIndent = lines[0].match(/^ */)![0].length
  const pool = firstIndent > 0 || !rest.length ? [lines[0], ...rest].filter((l) => l.trim()) : rest
  const min = Math.min(...pool.map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(Math.min(min, l.match(/^ */)![0].length))).join('\n')
}

function toText(children: ReactNode): string {
  if (children == null || children === false) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(toText).join('')
  return ''
}

const baseComponents: Components = {
  a: ({ node: _n, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
  table: ({ node: _n, children }) => (
    <div className="md-table">
      <table>{children}</table>
    </div>
  ),
}
const inlineComponents: Components = { ...baseComponents, p: ({ children }) => <>{children}</> }

const remarkPlugins = [remarkGfm, remarkMath]
const rehypePlugins: [typeof rehypeKatex, typeof KATEX_OPTS][] = [[rehypeKatex, KATEX_OPTS]]

/**
 * Markdown with $inline$ and $$display$$ math (GFM tables/lists supported).
 * Usage: <Md>{md`...`}</Md>   — or <Md inline>{md`...`}</Md> inside a sentence/label.
 */
export const Md = memo(function Md({ children, inline, className }: { children: ReactNode; inline?: boolean; className?: string }) {
  const text = dedent(toText(children))
  if (inline)
    return (
      <span className={cx('md md-inline', className)}>
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={inlineComponents}>
          {text}
        </ReactMarkdown>
      </span>
    )
  return (
    <div className={cx('md', className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={baseComponents}>
        {text}
      </ReactMarkdown>
    </div>
  )
})

export function renderTeX(tex: string, display = false): string {
  return katex.renderToString(tex, { ...KATEX_OPTS, displayMode: display })
}

/** Inline math: <M>{md`\omega_z`}</M> or <M tex={...} />. */
export function M({ children, tex, className }: { children?: ReactNode; tex?: string; className?: string }) {
  const src = tex ?? toText(children)
  const html = useMemo(() => renderTeX(src, false), [src])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Display math with optional printed equation number: <MathBlock tex={md`...`} tag="9.16" />. */
export function MathBlock({ tex, children, tag, className }: { tex?: string; children?: ReactNode; tag?: string; className?: string }) {
  const src = tex ?? toText(children)
  const full = tag ? `${src}\\tag{${tag.replace(/^\(|\)$/g, '')}}` : src
  const html = useMemo(() => renderTeX(full, true), [full])
  return <div className={cx('math-block', className)} dangerouslySetInnerHTML={{ __html: html }} />
}
