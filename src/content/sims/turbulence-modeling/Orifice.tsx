import { useMemo, useRef, useState } from 'react'
import {
  Md, md, num, PlayPause, Plot, Readout, Segmented, SimPanel, Slider, Toggle, useAnimationFrame, useInView,
  usePrefersReducedMotion,
} from '@/kit'
import { EX94, FIG_E944, orificeEstimate, orificeJet, orificePressure, smooth, type OrificeJet } from './models'
import { Arrow, Dim, Head, Label, Tag, heat } from './svg'

/* Common drawing frame: z (axial, m) → x px, r (radial, m, signed: + upper half) → y px. */
const ZX0 = 34
const ZX1 = 606
const SCALE = (ZX1 - ZX0) / EX94.L // px per metre
const zx = (z: number) => ZX0 + z * SCALE

function frame(cy: number) {
  return { X: zx, Y: (r: number) => cy - r * SCALE }
}

/** One plate half as an SVG path (top: sign = +1, bottom: −1), with the rounded tip of radius tipR. */
function platePath(cy: number, rTip: number, sign: 1 | -1, g = EX94) {
  const { X, Y } = frame(cy)
  const R = g.D / 2
  const rc = rTip + g.tipR // centre of the rounded tip
  const x1 = X(g.b)
  const x2 = X(g.b + g.plateT)
  const yW = Y(sign * R)
  const yc = Y(sign * rc)
  const rad = g.tipR * SCALE
  return `M ${x1} ${yW} L ${x1} ${yc} A ${rad} ${rad} 0 0 ${sign === 1 ? 0 : 1} ${x2} ${yc} L ${x2} ${yW} Z`
}

function PipeWalls({ cy, rTip }: { cy: number; rTip: number }) {
  const { Y } = frame(cy)
  const R = EX94.D / 2
  return (
    <g>
      <rect x={ZX0} y={Y(R) - 8} width={ZX1 - ZX0} height={8} fill="var(--body-fill)" stroke="var(--ink-3)" strokeWidth={0.8} />
      <rect x={ZX0} y={Y(-R)} width={ZX1 - ZX0} height={8} fill="var(--body-fill)" stroke="var(--ink-3)" strokeWidth={0.8} />
      <path d={platePath(cy, rTip, 1)} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1} />
      <path d={platePath(cy, rTip, -1)} fill="var(--body-fill)" stroke="var(--ink-2)" strokeWidth={1} />
    </g>
  )
}

/** Recreation of Fig. E9.4.1 drawn to the COMSOL geometry of Steps 4–8 (true proportions). */
export function OrificeGeometryFigure() {
  const cy = 110
  const { X, Y } = frame(cy)
  const R = EX94.D / 2
  const rTip = EX94.dOrifice / 2
  return (
    <svg viewBox="0 0 640 240" className="h-auto w-full" role="img" aria-label="Geometry of the orifice plate in the pipe of Example 9.4">
      <PipeWalls cy={cy} rTip={rTip} />
      <line x1={ZX0} x2={ZX1} y1={cy} y2={cy} stroke="var(--ink-3)" strokeDasharray="12 4 3 4" strokeWidth={0.9} />
      {/* inlet arrows (upper half), z and r axes */}
      {[0.2, 0.42, 0.64, 0.86].map((f) => (
        <Arrow key={f} x1={ZX0 + 2} y1={Y(f * R)} x2={ZX0 + 44} y2={Y(f * R)} color="var(--plot-1)" width={2} />
      ))}
      <Label x={ZX0 + 50} y={Y(0.95 * R) + 4} anchor="start" size={14} cls="fill-[var(--plot-1)]" italic>v inlet</Label>
      <Arrow x1={ZX0} y1={cy} x2={ZX0 + 32} y2={cy} color="var(--ink)" width={1.4} />
      <Label x={ZX0 + 34} y={cy + 15} anchor="start" size={14} italic>z</Label>
      <Arrow x1={ZX0} y1={cy} x2={ZX0} y2={cy + 34} color="var(--ink)" width={1.4} />
      <Label x={ZX0 - 6} y={cy + 34} anchor="end" size={14} italic>r</Label>
      {/* dimensions */}
      <Dim x1={X(0.135)} y1={Y(R)} x2={X(0.135)} y2={Y(-R)} label="D = 0.1 ft" />
      <Dim x1={ZX0} y1={Y(-R) + 36} x2={ZX1} y2={Y(-R) + 36} label="L = 0.5 ft" offset={16} />
      <Dim x1={ZX0} y1={Y(-R) + 16} x2={X(EX94.b)} y2={Y(-R) + 16} label="b = 0.1 ft" offset={14} />
      <Dim x1={X(EX94.b) + 30} y1={Y(rTip)} x2={X(EX94.b) + 30} y2={Y(-rTip)} label="d = 0.05 ft" />
      <Label x={X(EX94.b + EX94.plateT) + 6} y={Y(R) - 14} anchor="start" size={12} cls="fill-ink-2">plate 0.01 ft thick, tip radius 0.005 ft</Label>
      <Label x={X(0.07)} y={cy - 6} size={12} cls="fill-ink-3">axis of symmetry (r = 0)</Label>
      <Label x={ZX1 - 2} y={Y(R) - 14} anchor="end" size={12} cls="fill-ink-2">outlet, p = 0</Label>
    </svg>
  )
}

type Layer = 'mesh' | 'stream' | 'speed' | 'nuT' | 'k' | 'eps'

interface Field {
  g: (z: number, r: number) => number
  base: string
  tags: { z: number; r: number; t: string }[]
  caption: string
}

function makeFields(jet: OrificeJet): Record<'speed' | 'nuT' | 'k' | 'eps', Field> {
  const { D, L, vIn, vMaxBook } = EX94
  const { R, zp1, zp2, zvc, rTip } = jet
  const za = zp1 - 0.6 * D
  const uc = (z: number) => {
    if (z <= za) return vIn
    if (z <= zvc) return vIn + (vMaxBook - vIn) * smooth((z - za) / (zvc - za))
    return vIn + (vMaxBook - vIn) * Math.exp(-(z - zvc) / (1.8 * D))
  }
  const wallDamp = (r: number) => 1 - Math.exp(-(R - Math.abs(r)) / 0.0006)
  const plume = (z: number, r: number, w0: number, spread: number) => {
    if (z <= zp2) return 0
    const w = w0 + spread * (z - zp2)
    return Math.exp(-(((Math.abs(r) - rTip) / w) ** 2))
  }
  const bump = (z: number, zPeak: number) => {
    if (z <= zp2) return 0
    const x = (z - zp2) / (zPeak - zp2)
    return x * Math.exp(1 - x)
  }
  return {
    speed: {
      base: 'var(--plot-1)',
      g: (z, r) => {
        const h = jet.h(z)
        const a = Math.abs(r)
        const u = a < h ? uc(z) * (1 - 0.3 * (a / h) ** 4) : 0.1 * uc(z)
        return (u / vMaxBook) * wallDamp(r)
      },
      tags: [
        { z: 0.008, r: 0.4, t: 'Low' },
        { z: 0.05, r: 0, t: 'High' },
        { z: 0.095, r: 0, t: 'Medium' },
        { z: 0.125, r: 0.72, t: 'Low' },
      ],
      caption: 'velocity magnitude (cf. Fig. E9.4.2c): maximum ≈ 1.48 m/s on the axis about 0.05 m from the inlet',
    },
    nuT: {
      base: 'var(--plot-2)',
      g: (z, r) => {
        const inlet = 0.42 * Math.exp(-z / (0.35 * D))
        const amp = Math.min(1, Math.max(0, (z - zp2) / (L - zp2))) ** 1.2
        return Math.max(inlet, amp * plume(z, r, 0.0012, 0.16)) * wallDamp(r)
      },
      tags: [
        { z: 0.006, r: 0.45, t: 'Medium' },
        { z: 0.022, r: 0.45, t: 'Low' },
        { z: 0.044, r: 0.0, t: 'Low' },
        { z: 0.067, r: 0.45, t: 'Medium' },
        { z: 0.108, r: 0.45, t: 'High' },
        { z: 0.14, r: 0.45, t: 'Very high' },
      ],
      caption: 'turbulent kinematic viscosity ν_T (cf. Fig. E9.4.3a): grows along the plume all the way to the exit',
    },
    k: {
      base: 'var(--plot-3)',
      g: (z, r) => (0.03 + 0.97 * bump(z, 0.087) * plume(z, r, 0.0009, 0.11)) * wallDamp(r),
      tags: [
        { z: 0.014, r: 0.45, t: 'Very low' },
        { z: 0.07, r: 0.0, t: 'High' },
        { z: 0.088, r: 0.5, t: 'Very high' },
        { z: 0.112, r: 0.0, t: 'High' },
        { z: 0.142, r: 0.5, t: 'Medium' },
      ],
      caption: 'turbulent kinetic energy k (cf. Fig. E9.4.3b): rises along the plume, then has subsided considerably by the exit',
    },
    eps: {
      base: 'var(--plot-4)',
      g: (z, r) => {
        const zt = 0.5 * (zp1 + zp2)
        const tip = Math.exp(-(((z - zt) ** 2 + (Math.abs(r) - rTip) ** 2) / 0.0018 ** 2))
        const pl = 0.7 * bump(z, 0.077) * plume(z, r, 0.0008, 0.12)
        const core = Math.abs(r) < jet.h(z) ? 0.35 * Math.exp(-(((z - 0.043) / 0.009) ** 2)) : 0
        return Math.max(0.08, tip, pl, core) * (0.25 + 0.75 * wallDamp(r))
      },
      tags: [
        { z: 0.01, r: 0.45, t: 'Very low' },
        { z: 0.024, r: 0.4, t: 'Very high →' },
        { z: 0.045, r: 0.0, t: 'Medium' },
        { z: 0.077, r: 0.5, t: 'High' },
        { z: 0.12, r: 0.5, t: 'High' },
        { z: 0.145, r: 0.62, t: 'Medium' },
      ],
      caption: 'ln ε (cf. Fig. E9.4.3c): ε is extremely high at the orifice tip; the logarithm reveals the rest of the plume',
    },
  }
}

/**
 * Labelled schematic re-creation of the Example 9.4 result plots (Figs. E9.4.2–E9.4.3), drawn horizontally
 * (the book shows the axisymmetric half-domain with flow upward). Intensities are qualitative, built to match
 * the book's Low/Medium/High labels; they are not CFD output.
 */
export function OrificeFieldMaps() {
  const [layer, setLayer] = useState<Layer>('stream')
  const cy = 92
  const { X, Y } = frame(cy)
  const jet = useMemo(() => orificeJet(0.5, 0.82), [])
  const fields = useMemo(() => makeFields(jet), [jet])
  const R = jet.R
  const cells = useMemo(() => {
    if (layer === 'mesh' || layer === 'stream') return null
    const F = fields[layer]
    const nz = 84
    const nr = 10
    const out: { x: number; y: number; w: number; h: number; c: string }[] = []
    for (let i = 0; i < nz; i++) {
      const z = ((i + 0.5) / nz) * EX94.L
      for (let j = 0; j < nr; j++) {
        const r = ((j + 0.5) / nr) * R
        const c = heat(F.g(z, r), F.base)
        const w = SCALE * (EX94.L / nz) + 0.6
        const h = SCALE * (R / nr) + 0.6
        out.push({ x: X((i / nz) * EX94.L), y: Y(((j + 1) / nr) * R), w, h, c })
        out.push({ x: X((i / nz) * EX94.L), y: Y((-j / nr) * R), w, h, c })
      }
    }
    return out
  }, [layer, fields, R, X, Y])

  const streamlines = useMemo(() => {
    const lines: string[] = []
    for (const eta of [0.18, 0.42, 0.66, 0.9]) {
      for (const s of [1, -1]) {
        const pts: string[] = []
        for (let i = 0; i <= 200; i++) {
          const z = (i / 200) * EX94.L
          pts.push(`${i ? 'L' : 'M'}${X(z).toFixed(1)},${Y(s * eta * jet.h(z)).toFixed(1)}`)
        }
        lines.push(pts.join(' '))
      }
    }
    return lines
  }, [jet, X, Y])

  const eddy = { zc: 0.5 * (jet.zp2 + jet.zr), rc: 0.0115 }

  const mesh = useMemo(() => {
    // z nodes clustered at the plate, r nodes clustered at the wall (illustrative "extra coarse" density)
    const zs: number[] = [0]
    while (zs[zs.length - 1] < EX94.L) {
      const z = zs[zs.length - 1]
      const d = Math.min(Math.abs(z - jet.zp1), Math.abs(z - jet.zp2))
      zs.push(Math.min(EX94.L, z + 0.0011 + 0.0045 * (1 - Math.exp(-d / 0.008))))
    }
    const rs = Array.from({ length: 9 }, (_, j) => R * (1 - (1 - j / 8) ** 1.9))
    return { zs, rs }
  }, [jet, R])

  const F = layer === 'mesh' || layer === 'stream' ? null : fields[layer]
  return (
    <div>
      <div className="mb-2">
        <Segmented
          label="result plot"
          value={layer}
          onChange={setLayer}
          options={[
            { value: 'mesh', label: 'mesh' },
            { value: 'stream', label: 'streamlines' },
            { value: 'speed', label: '|v|' },
            { value: 'nuT', label: 'ν_T' },
            { value: 'k', label: 'k' },
            { value: 'eps', label: 'ln ε' },
          ]}
        />
      </div>
      <svg viewBox="0 0 640 196" className="h-auto w-full" role="img" aria-label="Schematic of the Example 9.4 result fields">
        <rect x={ZX0} y={Y(R)} width={ZX1 - ZX0} height={2 * R * SCALE} fill="var(--surface-2)" />
        {cells?.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.c} />)}
        {layer === 'mesh' ? (
          <g stroke="var(--ink-3)" strokeWidth={0.5} opacity={0.75}>
            {mesh.zs.map((z, i) => <line key={`z${i}`} x1={X(z)} x2={X(z)} y1={Y(R)} y2={Y(-R)} />)}
            {mesh.rs.map((r, j) => (
              <g key={`r${j}`}>
                <line x1={ZX0} x2={ZX1} y1={Y(r)} y2={Y(r)} />
                <line x1={ZX0} x2={ZX1} y1={Y(-r)} y2={Y(-r)} />
              </g>
            ))}
            {mesh.zs.slice(1).map((z, i) =>
              mesh.rs.slice(1).map((r, j) => (
                <g key={`d${i}-${j}`}>
                  <line x1={X(mesh.zs[i])} y1={Y(mesh.rs[j])} x2={X(z)} y2={Y(r)} />
                  <line x1={X(mesh.zs[i])} y1={Y(-mesh.rs[j])} x2={X(z)} y2={Y(-r)} />
                </g>
              )),
            )}
          </g>
        ) : null}
        {layer === 'stream' ? (
          <g>
            {streamlines.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--streamline)" strokeWidth={1.4} />)}
            {[0.18, 0.42, 0.66, 0.9].flatMap((eta) =>
              [1, -1].map((s) => {
                const z = 0.075
                return <Head key={`${eta}${s}`} x={X(z)} y={Y(s * eta * jet.h(z))} dx={1} dy={0} />
              }),
            )}
            {[0.9, 0.6, 0.3].flatMap((f) =>
              [1, -1].map((s) => {
                const len = jet.zr - jet.zp2
                const z0 = jet.zp2 + 0.5 * (1 - f) * len + 0.02 * len
                const z1 = jet.zr - 0.5 * (1 - f) * len - 0.02 * len
                const up: string[] = []
                const lo: string[] = []
                for (let i = 0; i <= 80; i++) {
                  const z = z0 + (i / 80) * (z1 - z0)
                  const t = (z - z0) / (z1 - z0)
                  const hz = Math.min(jet.h(z), R * 0.97)
                  const mid = (hz + R) / 2
                  const half = ((R - hz) / 2) * 0.85 * f * Math.sqrt(Math.sin(Math.PI * t))
                  up.push(`${X(z).toFixed(1)},${Y(s * (mid + half)).toFixed(1)}`)
                  lo.push(`${X(z).toFixed(1)},${Y(s * (mid - half)).toFixed(1)}`)
                }
                const zm = 0.5 * (z0 + z1)
                const hm = jet.h(zm)
                const midm = (hm + R) / 2
                const halfm = ((R - hm) / 2) * 0.85 * f
                return (
                  <g key={`${f}${s}`}>
                    <path d={`M ${lo.join(' L ')} L ${up.reverse().join(' L ')} Z`} fill="none" stroke="var(--plot-6)" strokeWidth={1.3} />
                    {/* jet side moves downstream, wall side moves upstream */}
                    <Head x={X(zm)} y={Y(s * (midm - halfm))} dx={1} dy={0} color="var(--plot-6)" />
                    <Head x={X(zm)} y={Y(s * (midm + halfm))} dx={-1} dy={0} color="var(--plot-6)" />
                  </g>
                )
              }),
            )}
            <Tag x={X(eddy.zc)} y={Y(-eddy.rc) + 2} text="recirculating eddy" tone="var(--plot-6)" />
            <Tag x={X(jet.zvc)} y={cy} text="contraction" tone="var(--streamline)" />
          </g>
        ) : null}
        <PipeWalls cy={cy} rTip={jet.rTip} />
        <line x1={ZX0} x2={ZX1} y1={cy} y2={cy} stroke="var(--ink-3)" strokeDasharray="10 4 2 4" strokeWidth={0.7} />
        {F ? F.tags.map((t, i) => <Tag key={i} x={X(t.z)} y={Y(t.r * R)} text={t.t} />) : null}
        <Arrow x1={ZX0 + 4} y1={Y(-R) + 26} x2={ZX0 + 60} y2={Y(-R) + 26} color="var(--ink-2)" />
        <Label x={ZX0 + 66} y={Y(-R) + 30} anchor="start" size={12} cls="fill-ink-2">flow</Label>
        {[0, 0.05, 0.1, 0.15].map((z) => (
          <g key={z}>
            <line x1={X(z)} x2={X(z)} y1={Y(-R) + 9} y2={Y(-R) + 15} stroke="var(--ink-3)" />
            <Label x={X(z)} y={Y(-R) + 28} size={11} cls="fill-ink-3" halo={false}>{z === 0 ? '0' : `${z} m`}</Label>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-sm text-ink-2">
        {layer === 'mesh'
          ? 'Mesh (cf. Fig. E9.4.2a): elements crowd along the wall and around the plate — especially its tip — where velocity gradients are largest; coarse near the axis.'
          : layer === 'stream'
            ? 'Time-averaged streamlines (cf. Fig. E9.4.2b): contraction through the orifice and a large recirculating eddy in the "backwater" behind the plate, reattaching ≈ 0.105–0.11 m from the inlet.'
            : F?.caption}
      </p>
    </div>
  )
}

interface Particle {
  z: number
  eta: number
}
interface EddyParticle {
  th: number
  f: number
  s: 1 | -1
}

/** Animated orifice explorer with continuity + Bernoulli + Borda–Carnot estimates and the centreline pressure. */
export function OrificeExplorer() {
  const [beta, setBeta] = useState(0.5)
  const [vIn, setVIn] = useState(EX94.vIn)
  const [Cc, setCc] = useState(0.82)
  const [book, setBook] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [, setTick] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const reduced = usePrefersReducedMotion()
  const jet = useMemo(() => orificeJet(beta, Cc), [beta, Cc])
  const est = orificeEstimate(vIn, beta, Cc, EX94.rho)
  const Re = (vIn * EX94.D) / EX94.nu
  const cy = 84
  const { X, Y } = frame(cy)
  const R = jet.R

  const rng = useRef(num.seededRandom(11))
  const parts = useRef<Particle[] | null>(null)
  const eddyParts = useRef<EddyParticle[] | null>(null)
  if (!parts.current) {
    const rnd = num.seededRandom(7)
    parts.current = Array.from({ length: 54 }, () => ({ z: rnd() * EX94.L, eta: (rnd() * 2 - 1) * 0.94 }))
    eddyParts.current = Array.from({ length: 24 }, (_, i) => ({ th: rnd() * 2 * Math.PI, f: 0.3 + 0.6 * rnd(), s: (i % 2 ? 1 : -1) as 1 | -1 }))
  }
  const eddyLen = Math.min(jet.zr, EX94.L) - jet.zp2
  const eddy = { zc: jet.zp2 + 0.5 * eddyLen, az: eddyLen * 0.47, rc: (R + jet.rVC) / 2 + 0.0005, ar: (R - jet.rVC) / 2.3 }

  useAnimationFrame(
    (dt) => {
      const h = Math.min(dt, 0.04)
      const VIS = 0.11
      const rnd = rng.current
      for (const p of parts.current!) {
        const hz = jet.h(p.z)
        const u = Math.min(0.16, VIS * vIn * (R / hz) ** 2)
        p.z += u * h
        if (p.z > EX94.L) {
          p.z = 0
          p.eta = (rnd() * 2 - 1) * 0.94
        }
      }
      const vVC = Math.min(0.16, VIS * est.vVC)
      const omega = (0.35 * vVC) / (Math.PI * eddy.az)
      for (const e of eddyParts.current!) e.th += (e.s === 1 ? -1 : 1) * omega * h
      setTick((t) => (t + 1) % 1e6)
    },
    playing && inView && !reduced,
  )

  const jetEdge = (s: 1 | -1) => {
    const pts: string[] = []
    for (let i = 0; i <= 160; i++) {
      const z = jet.zp2 + (i / 160) * (Math.min(jet.zr, EX94.L) - jet.zp2)
      pts.push(`${i ? 'L' : 'M'}${X(z).toFixed(1)},${Y(s * jet.h(z)).toFixed(1)}`)
    }
    return pts.join(' ')
  }

  const pIn = est.loss
  const pMin = pIn - est.dropToVC
  const yLo = Math.min(pMin, book ? -343 : pMin)
  const yHi = Math.max(pIn, book ? 726 : pIn)
  const pad = 0.12 * (yHi - yLo)
  const pFn = (z: number) => orificePressure(z, est, jet.zp1, jet.zvc, EX94.L, EX94.D)
  const isBookCase = Math.abs(beta - 0.5) < 0.01 && Math.abs(vIn - EX94.vIn) < 0.01

  return (
    <SimPanel
      title="Orifice-plate explorer"
      subtitle="continuity + Bernoulli to the vena contracta, Borda–Carnot expansion loss after it"
      wide
      controls={
        <>
          <Slider label="diameter ratio $\beta = d/D$" value={beta} min={0.3} max={0.8} step={0.01} onChange={setBeta} digits={2} />
          <Slider label="inlet velocity $v_\text{inlet}$" value={vIn} min={0.1} max={1.0} step={0.0024} onChange={setVIn} unit="m/s" digits={3} />
          <Slider label="contraction coefficient $C_c$" value={Cc} min={0.6} max={1} step={0.01} onChange={setCc} digits={2} />
          <Toggle label="overlay Wilkes Fig. E9.4.4 (β = 0.5, 0.3048 m/s)" checked={book} onChange={setBook} />
          <div className="flex flex-wrap items-center gap-2">
            <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
            <button type="button" className="btn-ghost text-sm" onClick={() => { setBeta(0.5); setVIn(EX94.vIn); setCc(0.82) }}>
              Example 9.4 settings
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: '$\\mathrm{Re} = v D/\\nu$', value: Math.round(Re).toLocaleString('en-US'), tone: Re > 4000 ? 'good' : 'bad' },
            { label: 'orifice mean $v_o = v/\\beta^2$', value: est.vOrifice, digits: 3, unit: 'm/s' },
            { label: 'vena contracta $v_o/C_c$', value: est.vVC, digits: 3, unit: 'm/s', tone: 'accent' },
            { label: 'drop inlet → v.c. (Bernoulli)', value: Math.round(est.dropToVC), unit: 'Pa' },
            { label: 'permanent loss (Borda–Carnot)', value: Math.round(est.loss), unit: 'Pa' },
            { label: 'recovered after v.c.', value: `${Math.round(est.recovery)} Pa (${Math.round((100 * est.recovery) / est.dropToVC)} %)` },
          ]}
        />
      }
      footer={
        <Md inline>{md`Try this: press **Example 9.4 settings** — the Bernoulli estimate of the inlet-to-vena-contracta drop (≈1,060 Pa) and of the permanent loss (≈700 Pa) sit close to the book's CFD curve (≈1,047 Pa and ≈716 Pa). Then shrink $\beta$: the drop grows roughly as $\beta^{-4}$ and a smaller fraction of it is recovered.${isBookCase ? '' : ' (The book curve stays fixed at its own β = 0.5, 0.3048 m/s case.)'}`}</Md>
      }
    >
      <div ref={wrap} className="space-y-2">
        <svg viewBox="0 0 640 176" className="h-auto w-full" role="img" aria-label="Animated flow through an orifice plate">
          <rect x={ZX0} y={Y(R)} width={ZX1 - ZX0} height={2 * R * SCALE} fill="var(--surface-2)" />
          {/* recirculation zones */}
          {[1, -1].map((s) => (
            <ellipse key={s} cx={X(eddy.zc)} cy={Y(s * eddy.rc)} rx={eddy.az * SCALE} ry={eddy.ar * SCALE * 1.15} fill="color-mix(in srgb, var(--plot-6) 13%, transparent)" />
          ))}
          <path d={jetEdge(1)} fill="none" stroke="var(--plot-1)" strokeDasharray="5 4" strokeWidth={1.3} />
          <path d={jetEdge(-1)} fill="none" stroke="var(--plot-1)" strokeDasharray="5 4" strokeWidth={1.3} />
          {parts.current!.map((p, i) => (
            <circle key={i} cx={X(p.z)} cy={Y(p.eta * jet.h(p.z))} r={2.2} fill="var(--streamline)" />
          ))}
          {eddyParts.current!.map((e, i) =>
            jet.zr > jet.zp2 ? (
              <circle
                key={`e${i}`}
                cx={X(eddy.zc + eddy.az * e.f * Math.cos(e.th))}
                cy={Y(e.s * eddy.rc) + eddy.ar * SCALE * e.f * Math.sin(e.th)}
                r={2}
                fill="var(--plot-6)"
              />
            ) : null,
          )}
          <PipeWalls cy={cy} rTip={jet.rTip} />
          <line x1={X(jet.zvc)} x2={X(jet.zvc)} y1={Y(R) + 2} y2={Y(-R) - 2} stroke="var(--plot-4)" strokeDasharray="4 3" strokeWidth={1.3} />
          <Label x={X(jet.zvc) + 4} y={Y(-R) + 24} anchor="start" size={12} cls="fill-[var(--plot-4)]">vena contracta</Label>
          {jet.zr < EX94.L ? (
            <>
              <line x1={X(jet.zr)} x2={X(jet.zr)} y1={Y(R)} y2={Y(R) + 10} stroke="var(--plot-6)" strokeWidth={2} />
              <Label x={X(jet.zr)} y={Y(R) - 6} size={11} cls="fill-[var(--plot-6)]">reattachment</Label>
            </>
          ) : null}
          <Label x={X(0.012)} y={Y(R) - 6} size={11} cls="fill-ink-3">inlet</Label>
          <Label x={X(0.148)} y={Y(-R) + 24} size={11} cls="fill-ink-3">outlet p = 0</Label>
        </svg>
        <Plot
          height={240}
          x={{ label: 'distance from inlet along the axis $z$ (m)', domain: [0, EX94.L] }}
          y={{ label: 'centreline pressure (Pa)', domain: [yLo - pad, yHi + pad] }}
          bands={[{ x0: jet.zp1, x1: jet.zp2, label: 'plate', color: 'color-mix(in srgb, var(--ink-3) 25%, transparent)' }]}
          vlines={[{ x: jet.zvc, label: 'v.c.', color: 'var(--plot-4)', dash: '4 3' }]}
          hlines={[{ y: 0, color: 'var(--ink-3)', dash: '2 3' }]}
          series={[
            { label: 'schematic model (this sim)', fn: pFn, color: 'var(--plot-1)', width: 2.4, samples: 300 },
            ...(book ? [{ label: 'Wilkes Fig. E9.4.4 (CFD, k–ε)', points: FIG_E944, color: 'var(--ink-2)', width: 1.6, dash: '5 3' }] : []),
          ]}
        />
      </div>
    </SimPanel>
  )
}
