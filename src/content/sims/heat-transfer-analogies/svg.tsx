import { useMemo } from 'react'
import { cx, renderTeX, useElementSize } from '@/kit'

/** Mixed plain text + $TeX$ → HTML string. Plain text is escaped and '\n' becomes a line break. */
export function mixedHTML(label: string): string {
  return label
    .split('$')
    .map((seg, i) =>
      i % 2
        ? renderTeX(seg)
        : seg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>'),
    )
    .join('')
}

/**
 * Adaptive SVG width: measures the container and returns a design width W (clamped) that the figure
 * lays itself out in, so text stays a readable pixel size from phones (≈300 px) to desktops.
 */
export function useDesignWidth(min = 340, max = 720, fallback = 640) {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const W = size.width > 0 ? Math.min(max, Math.max(min, Math.round(size.width))) : fallback
  return [ref, W] as const
}

type HAlign = 'start' | 'middle' | 'end'
type VAlign = 'top' | 'middle' | 'bottom'

/**
 * HTML label (plain text + $TeX$) positioned in SVG user units. (x, y) is the anchor point.
 * `box` draws the bordered label used in Wilkes's figures.
 */
export function SvgLabel({
  x, y, label, align = 'start', vAlign = 'middle', w = 200, h = 44, box = false, size = 12, color, className,
}: {
  x: number
  y: number
  label: string
  align?: HAlign
  vAlign?: VAlign
  w?: number
  h?: number
  box?: boolean
  size?: number
  color?: string
  className?: string
}) {
  const html = useMemo(() => mixedHTML(label), [label])
  const left = align === 'start' ? x : align === 'middle' ? x - w / 2 : x - w
  const top = vAlign === 'top' ? y : vAlign === 'middle' ? y - h / 2 : y - h
  return (
    <foreignObject x={left} y={top} width={w} height={h} style={{ overflow: 'visible', pointerEvents: 'none' }}>
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: vAlign === 'top' ? 'flex-start' : vAlign === 'middle' ? 'center' : 'flex-end',
          justifyContent: align === 'start' ? 'flex-start' : align === 'middle' ? 'center' : 'flex-end',
        }}
      >
        <div
          className={cx(
            'svg-label whitespace-nowrap leading-tight',
            box && 'rounded-md border border-line bg-surface px-1.5 py-0.5 shadow-sm',
            !color && !/\btext-ink/.test(className ?? '') && 'text-ink',
            className,
          )}
          style={{ fontSize: size, textAlign: align === 'start' ? 'left' : align === 'middle' ? 'center' : 'right', color }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </foreignObject>
  )
}

/** Arrow-head markers (one per colour) for a figure; ids are prefixed by `uid`. */
export function ArrowDefs({ uid, colors }: { uid: string; colors: Record<string, string> }) {
  return (
    <>
      {Object.entries(colors).map(([name, c]) => (
        <marker
          key={name}
          id={`${uid}-${name}`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={c} />
        </marker>
      ))}
    </>
  )
}

/** Diagonal hatch pattern for a solid wall. */
export function HatchDef({ id }: { id: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="var(--surface-2)" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink-3)" strokeWidth="1.3" />
    </pattern>
  )
}

/** Smooth fade-in/out factor for a parcel at phase t ∈ [0, 1). */
export const edgeFade = (t: number, w = 0.12) => Math.max(0, Math.min(1, t / w, (1 - t) / w))
