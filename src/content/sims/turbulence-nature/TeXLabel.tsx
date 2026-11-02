import { useMemo } from 'react'
import { cx, renderTeX } from '@/kit'

/** KaTeX label placed inside an SVG (via foreignObject). (x, y) is the anchor point; y is the vertical centre. */
export function TeXLabel({
  x, y, tex, w = 170, h = 26, anchor = 'start', className,
}: {
  x: number
  y: number
  tex: string
  w?: number
  h?: number
  anchor?: 'start' | 'middle' | 'end'
  className?: string
}) {
  const html = useMemo(() => renderTeX(tex), [tex])
  const fx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  return (
    <foreignObject x={fx} y={y - h / 2} width={w} height={h} style={{ overflow: 'visible', pointerEvents: 'none' }}>
      <div
        className={cx(
          'flex h-full items-center whitespace-nowrap text-[12.5px] text-ink',
          anchor === 'middle' ? 'justify-center' : anchor === 'end' ? 'justify-end' : 'justify-start',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  )
}
