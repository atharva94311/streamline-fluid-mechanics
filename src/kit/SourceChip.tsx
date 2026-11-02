import type { ReactNode } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import type { SrcLike } from '@/lib/types'
import { PDFS_AVAILABLE, pagesLabel, srcHref, srcList, srcTooltip } from '@/lib/sources'
import { cx } from './cx'

/** Clickable chips that open the source PDF at the referenced page. */
export function SourceChips({ src, className, size = 'sm' }: { src?: SrcLike; className?: string; size?: 'xs' | 'sm' }) {
  const list = srcList(src)
  if (!list.length) return null
  return (
    <span className={cx('inline-flex flex-wrap items-center gap-1.5', className)}>
      {list.map((s, i) => {
        const cls = cx(
          'inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-50 font-medium text-emerald-800 no-underline transition dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
          PDFS_AVAILABLE && 'hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
          size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        )
        const body = (
          <>
            <FileText className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
            <span>
              {pagesLabel(s)}
              {s.note ? <span className="opacity-75"> · {s.note}</span> : null}
            </span>
          </>
        )
        return PDFS_AVAILABLE ? (
          <a key={i} href={srcHref(s)} target="_blank" rel="noreferrer" title={srcTooltip(s)} className={cls}>
            {body}
          </a>
        ) : (
          <span key={i} title={srcTooltip(s)} className={cls}>
            {body}
          </span>
        )
      })}
    </span>
  )
}

/** Badge marking content that is NOT from the PDFs (added explanation / self-made problem). */
export function SupplementBadge({ label = 'Supplementary', size = 'sm' }: { label?: string; size?: 'xs' | 'sm' }) {
  return (
    <span
      title="Added by this study platform to aid understanding — not taken from the course PDFs."
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-fuchsia-300 bg-fuchsia-50 font-medium text-fuchsia-700 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
        size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
      )}
    >
      <Sparkles className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {label}
    </span>
  )
}

/** Source chips when `src` is given, otherwise the supplementary badge. */
export function Origin({ src, supplementLabel, size }: { src?: SrcLike; supplementLabel?: string; size?: 'xs' | 'sm' }) {
  return srcList(src).length ? <SourceChips src={src} size={size} /> : <SupplementBadge label={supplementLabel} size={size} />
}

/** A clearly-marked block of supplementary explanation inside source-based content. */
export function Supplement({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-dashed border-fuchsia-300/80 bg-fuchsia-50/50 p-4 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/5">
      <div className="mb-2 flex items-center gap-2">
        <SupplementBadge size="xs" />
        {title ? <span className="text-sm font-semibold text-ink">{title}</span> : null}
      </div>
      {children}
    </div>
  )
}
