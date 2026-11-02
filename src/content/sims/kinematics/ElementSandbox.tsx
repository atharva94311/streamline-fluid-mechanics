import { useMemo, useRef, useState } from 'react'
import { PlayPause, Readout, Segmented, SimPanel, Slider, md, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'
import { Arrow, Chip, PresetRow, arcPath, deg, fin, flowMap, kin, partGrad, type Grad, type P2, type Part } from './shared'

/**
 * Fluid-element sandbox: a square material element carried by the linear velocity field
 *   u = u0 + (∂u/∂x)(x − x_c) + (∂u/∂y)(y − y_c),   v = v0 + (∂v/∂x)(x − x_c) + (∂v/∂y)(y − y_c)
 * (x_c, y_c = initial centre). Corners are moved with the EXACT flow map of this field, and the motion can be
 * split into translation / linear deformation / rotation / angular deformation.
 */

const X0 = -2
const X1 = 2
const Y0 = -1.5
const Y1 = 1.5
const VW = 480
const VH = 360
const sx = (x: number) => ((x - X0) / (X1 - X0)) * VW
const sy = (y: number) => VH - ((y - Y0) / (Y1 - Y0)) * VH
const C0: P2 = [-0.75, -0.5]
const SIDE = 0.7
const T_END = 1.2

type PresetKey = 'translation' | 'rotation' | 'linear' | 'angular' | 'shear' | 'general'
const PRESETS: { key: PresetKey; label: string; g: Grad; V0: P2 }[] = [
  { key: 'translation', label: 'Translation', g: { a: 0, b: 0, c: 0, d: 0 }, V0: [0.9, 0.55] },
  { key: 'rotation', label: 'Rigid rotation', g: { a: 0, b: -0.8, c: 0.8, d: 0 }, V0: [0.35, 0.25] },
  { key: 'linear', label: 'Linear deformation', g: { a: 0.6, b: 0, c: 0, d: -0.6 }, V0: [0.3, 0.2] },
  { key: 'angular', label: 'Angular deformation', g: { a: 0, b: 0.55, c: 0.55, d: 0 }, V0: [0.3, 0.2] },
  { key: 'shear', label: 'Simple shear', g: { a: 0, b: 0.9, c: 0, d: 0 }, V0: [0.2, 0.25] },
  { key: 'general', label: 'General (slide 2)', g: { a: 0.35, b: -0.6, c: 0.9, d: -0.25 }, V0: [0.6, 0.45] },
]

const PARTS: { value: Part; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'translation', label: 'Translation' },
  { value: 'linear', label: 'Linear def.' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'shear', label: 'Angular def.' },
]

const H = SIDE / 2
const O0: P2 = [C0[0] - H, C0[1] - H]
const A0: P2 = [C0[0] + H, C0[1] - H]
const Cc0: P2 = [C0[0] + H, C0[1] + H]
const B0: P2 = [C0[0] - H, C0[1] + H]
const FR = [0.25, 0.5, 0.75]

export function ElementSandbox() {
  const [g, setG] = useState<Grad>(PRESETS[5].g)
  const [V0, setV0] = useState<P2>(PRESETS[5].V0)
  const [part, setPart] = useState<Part>('all')
  const [preset, setPreset] = useState<PresetKey | null>('general')
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  useAnimationFrame((dt) => setT((x) => (x + dt * 0.6 > T_END + 0.8 ? 0 : x + dt * 0.6)), playing && inView && !reduced)
  const tt = reduced && playing ? T_END : Math.min(t, T_END)

  const ge = partGrad(g, part)
  const Ve: P2 = part === 'all' || part === 'translation' ? V0 : [0, 0]
  const map = useMemo(() => flowMap(ge, Ve, tt, C0), [ge.a, ge.b, ge.c, ge.d, Ve[0], Ve[1], tt]) // eslint-disable-line react-hooks/exhaustive-deps

  const Om = map(O0)
  const Am = map(A0)
  const Bm = map(B0)
  const Cm = map(Cc0)
  const ea: P2 = [Am[0] - Om[0], Am[1] - Om[1]]
  const eb: P2 = [Bm[0] - Om[0], Bm[1] - Om[1]]
  const la = Math.hypot(ea[0], ea[1])
  const lb = Math.hypot(eb[0], eb[1])
  const cosAOB = Math.max(-1, Math.min(1, (ea[0] * eb[0] + ea[1] * eb[1]) / (la * lb || 1)))
  const angAOB = deg(Math.acos(cosAOB))
  const alpha = Math.atan2(ea[1], ea[0])
  const area = Math.exp((ge.a + ge.d) * tt)

  // centre path
  const path = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 24; i++) {
      const p = flowMap(ge, Ve, (tt * i) / 24, C0)(C0)
      pts.push(`${fin(sx(p[0])).toFixed(1)},${fin(sy(p[1])).toFixed(1)}`)
    }
    return pts.join(' ')
  }, [ge.a, ge.b, ge.c, ge.d, Ve[0], Ve[1], tt]) // eslint-disable-line react-hooks/exhaustive-deps

  // quiver of the velocity field of the motion shown
  const quiver = useMemo(() => {
    const out: { x: number; y: number; u: number; v: number }[] = []
    let vmax = 0
    for (let j = 0; j < 7; j++)
      for (let i = 0; i < 10; i++) {
        const x = X0 + 0.2 + (i * (X1 - X0 - 0.4)) / 9
        const y = Y0 + 0.2 + (j * (Y1 - Y0 - 0.4)) / 6
        const u = Ve[0] + ge.a * (x - C0[0]) + ge.b * (y - C0[1])
        const v = Ve[1] + ge.c * (x - C0[0]) + ge.d * (y - C0[1])
        vmax = Math.max(vmax, Math.hypot(u, v))
        out.push({ x, y, u, v })
      }
    const k = 0.34 / Math.max(vmax, 0.3)
    return out.map((q) => ({ ...q, u: q.u * k, v: q.v * k }))
  }, [ge.a, ge.b, ge.c, ge.d, Ve[0], Ve[1]]) // eslint-disable-line react-hooks/exhaustive-deps

  const kk = kin(ge)
  const full = kin(g)
  const tol = 1e-9

  const pick = (k: PresetKey) => {
    const p = PRESETS.find((q) => q.key === k)!
    setG(p.g)
    setV0(p.V0)
    setPreset(k)
    setT(0)
    setPlaying(true)
  }
  const setGrad = (key: keyof Grad) => (v: number) => {
    setG((old) => ({ ...old, [key]: +v.toFixed(2) }))
    setPreset(null)
  }

  const poly = (pts: P2[]) => pts.map((p) => `${fin(sx(p[0])).toFixed(1)},${fin(sy(p[1])).toFixed(1)}`).join(' ')
  const oScr: P2 = [sx(Om[0]), sy(Om[1])]

  return (
    <SimPanel
      wide
      title="Fluid-element sandbox"
      subtitle={md`linear field $u = u_0 + \pd{u}{x}x + \pd{u}{y}y,\;\; v = v_0 + \pd{v}{x}x + \pd{v}{y}y$ (x, y from the element's start)`}
      controls={
        <>
          <Segmented label="Show only this part of the motion" options={PARTS} value={part} onChange={setPart} />
          <PresetRow presets={PRESETS} onPick={pick} active={preset} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <Slider label={md`$\partial u/\partial x$`} value={g.a} min={-1} max={1} step={0.05} onChange={setGrad('a')} unit="s⁻¹" digits={2} />
            <Slider label={md`$\partial u/\partial y$`} value={g.b} min={-1} max={1} step={0.05} onChange={setGrad('b')} unit="s⁻¹" digits={2} />
            <Slider label={md`$\partial v/\partial x$`} value={g.c} min={-1} max={1} step={0.05} onChange={setGrad('c')} unit="s⁻¹" digits={2} />
            <Slider label={md`$\partial v/\partial y$`} value={g.d} min={-1} max={1} step={0.05} onChange={setGrad('d')} unit="s⁻¹" digits={2} />
            <Slider label={md`$u_0$`} value={V0[0]} min={-1} max={1} step={0.05} onChange={(v) => { setV0([v, V0[1]]); setPreset(null) }} unit="m/s" digits={2} />
            <Slider label={md`$v_0$`} value={V0[1]} min={-1} max={1} step={0.05} onChange={(v) => { setV0([V0[0], v]); setPreset(null) }} unit="m/s" digits={2} />
          </div>
          <Slider
            label={md`time since start $t$`}
            value={tt}
            min={0}
            max={T_END}
            step={0.01}
            unit="s"
            digits={2}
            onChange={(v) => {
              setPlaying(false)
              setT(v)
            }}
          />
          <PlayPause playing={playing && !reduced} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(0)} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\omega_z$ (shown)`, value: kk.omegaZ, unit: 'rad/s', digits: 3 },
            { label: md`$\dot\gamma$ (shown)`, value: kk.gammaDot, unit: 's⁻¹', digits: 3 },
            { label: md`$\nabla\cdot\mathbf V$ (shown)`, value: kk.dil, unit: 's⁻¹', digits: 3 },
            { label: md`$\zeta_z = 2\omega_z$`, value: kk.zeta, unit: 's⁻¹', digits: 3 },
            { label: 'angle AOB now', value: `${angAOB.toFixed(1)}°`, tone: Math.abs(angAOB - 90) < 0.05 ? 'good' : 'default' },
            { label: 'area / initial area', value: area, digits: 4, tone: Math.abs(area - 1) < 1e-6 ? 'good' : 'default' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> choose <i>Simple shear</i> and switch the view between <i>Rotation</i> and <i>Angular def.</i> — a simple
          shear is half rotation (clockwise) and half angular deformation. Then set ∂u/∂y = −∂v/∂x: the corner angle stays 90° (an
          undeformed block). Make ∂u/∂x = −∂v/∂y and the area stays exactly constant.
        </span>
      }
    >
      <div ref={ref}>
        <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full rounded-xl border border-line" role="img" aria-label="fluid element in a linear velocity field">
          <rect x={0} y={0} width={VW} height={VH} fill="var(--field-bg)" />
          {[-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map((x) => (
            <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={0} y2={VH} stroke="var(--grid)" strokeWidth={0.8} />
          ))}
          {[-1, -0.5, 0, 0.5, 1].map((y) => (
            <line key={`gy${y}`} y1={sy(y)} y2={sy(y)} x1={0} x2={VW} stroke="var(--grid)" strokeWidth={0.8} />
          ))}
          {quiver.map((q, i) => (
            <Arrow
              key={i}
              x1={sx(q.x - q.u / 2)}
              y1={sy(q.y - q.v / 2)}
              x2={sx(q.x + q.u / 2)}
              y2={sy(q.y + q.v / 2)}
              color="var(--quiver)"
              width={1.1}
              head={5}
              opacity={0.5}
            />
          ))}
          {/* initial element */}
          <polygon points={poly([O0, A0, Cc0, B0])} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="5 4" />
          <polyline points={path} fill="none" stroke="var(--ink-3)" strokeWidth={1.2} strokeDasharray="2 3" />
          {/* current element with material grid */}
          <polygon points={poly([Om, Am, Cm, Bm])} fill="var(--plot-2)" fillOpacity={0.13} stroke="var(--plot-2)" strokeWidth={1.4} />
          {FR.map((f) => {
            const p1 = map([O0[0] + f * SIDE, O0[1]])
            const p2 = map([O0[0] + f * SIDE, O0[1] + SIDE])
            const q1 = map([O0[0], O0[1] + f * SIDE])
            const q2 = map([O0[0] + SIDE, O0[1] + f * SIDE])
            return (
              <g key={f} stroke="var(--plot-2)" strokeOpacity={0.4} strokeWidth={0.9}>
                <line x1={sx(p1[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p2[1])} />
                <line x1={sx(q1[0])} y1={sy(q1[1])} x2={sx(q2[0])} y2={sy(q2[1])} />
              </g>
            )
          })}
          <line x1={oScr[0]} y1={oScr[1]} x2={sx(Am[0])} y2={sy(Am[1])} stroke="var(--plot-1)" strokeWidth={3.2} strokeLinecap="round" />
          <line x1={oScr[0]} y1={oScr[1]} x2={sx(Bm[0])} y2={sy(Bm[1])} stroke="var(--plot-4)" strokeWidth={3.2} strokeLinecap="round" />
          <path d={arcPath(oScr[0], oScr[1], 20, alpha, alpha + Math.acos(cosAOB))} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
          <circle cx={oScr[0]} cy={oScr[1]} r={3.2} fill="var(--ink)" />
          <g fontSize={13} fontWeight={700} fontStyle="italic" className="fill-ink" paintOrder="stroke" stroke="var(--field-bg)" strokeWidth={3}>
            <text x={oScr[0] - 14} y={oScr[1] + 14}>O</text>
            <text x={sx(Am[0]) + 6} y={sy(Am[1]) + 14}>A</text>
            <text x={sx(Bm[0]) - 14} y={sy(Bm[1]) - 4}>B</text>
          </g>
          <text x={8} y={18} fontSize={12} className="fill-ink-3">
            t = {tt.toFixed(2)} s
          </text>
          <text x={VW - 8} y={VH - 8} textAnchor="end" fontSize={11} className="fill-ink-3">
            grid: 0.5 m
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-1)' }} /> line OA
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1 w-5 rounded" style={{ background: 'var(--plot-4)' }} /> line OB
          </span>
          <span>dashed square: element at t = 0 · dotted: path of its centre · arrows: velocity of the motion shown</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-3">This velocity field is:</span>
          <Chip on={Math.abs(full.zeta) < tol}>
            irrotational (ω<sub>z</sub> = 0)
          </Chip>
          <Chip on={Math.abs(full.gammaDot) < tol} tone="sky">
            free of angular deformation (γ̇ = 0)
          </Chip>
          <Chip on={Math.abs(full.dil) < tol} tone="amber">
            volume-preserving (∇·V = 0)
          </Chip>
        </div>
      </div>
    </SimPanel>
  )
}
