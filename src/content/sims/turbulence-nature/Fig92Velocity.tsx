import { useEffect, useRef, useState } from 'react'
import { PlayPause, Segmented, md, useElementSize, useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { makeTurbSignal } from './signal'
import { TeXLabel } from './TeXLabel'

/**
 * Wilkes Fig. 9.2 "Fluctuating velocity components" (p. 482), recreated and animated:
 * at a fixed point P each instantaneous component = time-mean (dashed) + fluctuation.
 * Animation is slowed down enormously — real fluctuations take milliseconds.
 */

type Mode = 'general' | 'axial'
const RMS = 0.15 // m/s, each component
const SIGS = [41, 42, 43].map((seed) => makeTurbSignal({ seed, f0: 0.35, fEta: 3.5, fMin: 0.02, modes: 90 }))

export function Fig92Velocity() {
  const [ref, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(true)
  const [mode, setMode] = useState<Mode>('general')
  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])
  const uid = useUid('f92')

  const W = Math.max(300, Math.round(size.width || 560))
  const H = 290
  const k = Math.min(1, W / 560)
  const cx = W * 0.56
  const cy = 150
  const means = mode === 'general' ? [2.0, 0.9, 0.8] : [2.0, 0, 0]
  const pxPer = (150 * k) / 2.0
  const dirs: [number, number][] = [
    [1, 0],
    [0, -1],
    [-0.766, 0.643],
  ]
  const colors = ['var(--plot-1)', 'var(--plot-5)', 'var(--plot-4)']
  const comp = ['x', 'y', 'z']

  const lineRefs = useRef<(SVGLineElement | null)[]>([])
  const textRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const set = (t: number) => {
      for (let c = 0; c < 3; c++) {
        const v = means[c] + RMS * SIGS[c].at(t)
        const L = v * pxPer
        const el = lineRefs.current[c]
        if (el) {
          el.setAttribute('x2', (cx + dirs[c][0] * L).toFixed(1))
          el.setAttribute('y2', (cy + dirs[c][1] * L).toFixed(1))
        }
        const tx = textRefs.current[c]
        if (tx) {
          const f = v - means[c]
          tx.textContent = `v${comp[c]} = ${means[c].toFixed(2)} ${f >= 0 ? '+' : '−'} ${Math.abs(f).toFixed(2)} = ${v.toFixed(2)} m/s`
        }
      }
    }
    set(1.3)
    if (!playing || !inView || typeof requestAnimationFrame === 'undefined') return
    let raf = 0
    let last = performance.now()
    let t = 1.3
    let acc = 0
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      acc += dt
      if (acc > 1 / 50) {
        acc = 0
        set(t)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView, mode, W]) // eslint-disable-line react-hooks/exhaustive-deps

  const meanTip = (c: number): [number, number] => [cx + dirs[c][0] * means[c] * pxPer, cy + dirs[c][1] * means[c] * pxPer]
  const labelPos: [number, number, 'start' | 'middle' | 'end'][] = [
    [cx + 150 * k * 0.6, cy - 22, 'middle'],
    [cx + 14, cy - 90 * k, 'start'],
    [cx - 52 * k, cy + 58 * k, 'end'],
  ]
  const tex = [md`v_x=\overline{v}_x+v_x'`, md`v_y=\overline{v}_y+v_y'`, md`v_z=\overline{v}_z+v_z'`]

  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} className="block max-w-full" role="img" aria-label="Instantaneous velocity components at point P fluctuating about their means">
        <defs>
          {colors.map((c, i) => (
            <marker key={i} id={`${uid}-m${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill={c} />
            </marker>
          ))}
          <marker id={`${uid}-g`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="var(--ink-3)" />
          </marker>
        </defs>
        {[0, 1, 2].map((c) =>
          means[c] > 0 ? (
            <line
              key={`m${c}`}
              x1={cx}
              y1={cy}
              x2={meanTip(c)[0]}
              y2={meanTip(c)[1]}
              stroke="var(--ink-3)"
              strokeWidth={1.4}
              strokeDasharray="5 4"
              markerEnd={`url(#${uid}-g)`}
            />
          ) : null,
        )}
        {[0, 1, 2].map((c) => (
          <line
            key={`i${c}`}
            ref={(el) => {
              lineRefs.current[c] = el
            }}
            x1={cx}
            y1={cy}
            x2={meanTip(c)[0] + dirs[c][0] * 10}
            y2={meanTip(c)[1] + dirs[c][1] * 10}
            stroke={colors[c]}
            strokeWidth={2.6}
            strokeLinecap="round"
            markerEnd={`url(#${uid}-m${c})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={4.5} fill="var(--ink)" />
        <text x={cx + 6} y={cy + 17} className="fill-ink text-[13px] font-bold">
          P
        </text>
        {[0, 1, 2].map((c) => (
          <TeXLabel key={`l${c}`} x={labelPos[c][0]} y={labelPos[c][1]} tex={tex[c]} anchor={labelPos[c][2]} w={150} />
        ))}
        <g transform={`translate(34, ${H - 34})`} stroke="var(--ink-2)" strokeWidth={1.4}>
          <line x1={0} y1={0} x2={34} y2={0} markerEnd={`url(#${uid}-g)`} />
          <line x1={0} y1={0} x2={0} y2={-34} markerEnd={`url(#${uid}-g)`} />
          <line x1={0} y1={0} x2={-22} y2={18} markerEnd={`url(#${uid}-g)`} />
        </g>
        <text x={34 + 38} y={H - 30} className="fill-ink-2 text-[12px] italic">x</text>
        <text x={30} y={H - 72} className="fill-ink-2 text-[12px] italic">y</text>
        <text x={4} y={H - 10} className="fill-ink-2 text-[12px] italic">z</text>
        <text x={W - 8} y={H - 10} textAnchor="end" className="fill-ink-3 text-[10.5px]">
          dashed: time-mean · solid: instantaneous
        </text>
      </svg>
      <div className="mt-2 grid gap-1 font-mono text-[12px] text-ink-2 sm:grid-cols-3">
        {[0, 1, 2].map((c) => (
          <span
            key={c}
            ref={(el) => {
              textRefs.current[c] = el
            }}
            className="rounded-lg bg-surface-2 px-2 py-1"
          >
            …
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <Segmented<Mode>
            label="mean flow"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'general', label: 'general 3-D (as drawn in Fig. 9.2)' },
              { value: 'axial', label: 'along x only (e.g. pipe axis)' },
            ]}
          />
        </div>
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
      </div>
      <p className="mt-2 text-[12.5px] text-ink-3">
        Motion slowed down by a factor of roughly a thousand — real turbulent fluctuations change within milliseconds. With the mean flow along x
        only, the y and z arrows have zero mean, yet they still flicker: all three components fluctuate.
      </p>
    </div>
  )
}
