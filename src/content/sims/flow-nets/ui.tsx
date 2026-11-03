/** UI helpers shared by the flow-net simulations (readouts with TeX labels, drag layer for FlowField overlays). */
import { useRef, type ComponentProps } from 'react'
import { Readout, type ReadoutItem, type Vec } from '@/kit'

export type ReadoutItemT = ReadoutItem

/**
 * The kit's Readout prints its labels in CSS upper case, which would also upper-case TeX symbols
 * (u → U, ψ → Ψ). This wrapper keeps KaTeX inside the labels in normal case.
 */
export function TeXReadout(props: ComponentProps<typeof Readout>) {
  return (
    <div className="[&_.katex]:normal-case">
      <Readout {...props} />
    </div>
  )
}

export interface OverlayCtx {
  sx: (v: number) => number
  sy: (v: number) => number
  width: number
  height: number
}

const clampTo = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * Transparent rectangle covering the plot area of a FlowField overlay. Pointer down/drag reports the
 * pointer position in data coordinates (works with mouse, pen and touch; touch-action none while dragging).
 */
export function DragLayer({
  ctx, x, y, onPoint, onRelease, label = 'Click or drag to move the probe',
}: {
  ctx: OverlayCtx
  x: [number, number]
  y: [number, number]
  onPoint: (p: Vec, phase: 'start' | 'move') => void
  onRelease?: () => void
  label?: string
}) {
  const dragging = useRef(false)
  const { sx, sy } = ctx
  const toData = (e: React.PointerEvent<SVGRectElement>): Vec | null => {
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return null
    const r = svg.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const X = x[0] + ((px - sx(x[0])) / (sx(x[1]) - sx(x[0]))) * (x[1] - x[0])
    const Y = y[0] + ((py - sy(y[0])) / (sy(y[1]) - sy(y[0]))) * (y[1] - y[0])
    if (!Number.isFinite(X) || !Number.isFinite(Y)) return null
    return [clampTo(X, x[0], x[1]), clampTo(Y, y[0], y[1])]
  }
  return (
    <rect
      x={sx(x[0])}
      y={sy(y[1])}
      width={Math.max(0, sx(x[1]) - sx(x[0]))}
      height={Math.max(0, sy(y[0]) - sy(y[1]))}
      fill="transparent"
      style={{ cursor: 'crosshair', touchAction: 'none' }}
      aria-label={label}
      onPointerDown={(e) => {
        const p = toData(e)
        if (!p) return
        dragging.current = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
        onPoint(p, 'start')
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        const p = toData(e)
        if (p) onPoint(p, 'move')
      }}
      onPointerUp={(e) => {
        dragging.current = false
        e.currentTarget.releasePointerCapture?.(e.pointerId)
        onRelease?.()
      }}
      onPointerCancel={() => {
        dragging.current = false
        onRelease?.()
      }}
    />
  )
}
