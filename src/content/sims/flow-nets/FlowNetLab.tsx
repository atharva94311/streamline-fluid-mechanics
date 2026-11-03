/**
 * Flow-net laboratory (concepts 2 and 3). Streamlines and equipotentials are drawn at equal increments
 * Δψ = Δφ for several plane potential flows (uniform, 90° corner, source, Fox Ex. 6.10, computed 90° bend).
 *  - mode 'orthogonality': at the probe, the two tangents are drawn with slope triangles; the slopes
 *    −(∂ψ/∂x)/(∂ψ/∂y) = v/u (Fox Eq. 6.34) and −(∂φ/∂x)/(∂φ/∂y) = −u/v (Eq. 6.35) are evaluated from
 *    ψ and φ independently, and their product is shown.
 *  - mode 'spacing': the gap Δn between the two drawn streamlines on either side of the probe is measured
 *    along the normal, giving V ≈ Δψ/Δn (slide 7: speed ∝ 1/spacing), compared with the exact |V|; the gap Δs
 *    between neighbouring equipotentials gives a second estimate V ≈ Δφ/Δs.
 */
import { useMemo, useState } from 'react'
import { FlowField, Md, Segmented, SimPanel, Slider, Toggle, md, type Vec } from '@/kit'
import { distanceToLevel, getNetPreset, gradient, levelsFor, type NetId, type NetPreset } from './fields'
import { Arrow, RightAngle, Tx, polyPath } from './svg'
import { DragLayer, TeXReadout, type OverlayCtx, type ReadoutItemT } from './ui'

type Mode = 'orthogonality' | 'spacing'

const fmtSlope = (s: number) => (!Number.isFinite(s) || Math.abs(s) > 1e4 ? '∞ (vertical)' : s)

interface Measure {
  u: number
  v: number
  V: number
  stagnant: boolean
  // orthogonality
  sPsi: number
  sPhi: number
  angle: number
  // spacing
  psiP: number
  nLo: number | null
  nHi: number | null
  sLo: number | null
  sHi: number | null
}

function measure(P: NetPreset, p: Vec, h: number): Measure {
  const span = Math.max(P.x[1] - P.x[0], P.y[1] - P.y[0])
  const [u, v] = P.vel(p[0], p[1])
  const V = Math.hypot(u, v)
  const stagnant = !(V > 1e-3 * P.Uref)
  const fd = 1e-5 * span
  const gPsi = P.gradPsi ? P.gradPsi(p[0], p[1]) : gradient(P.psi, p[0], p[1], fd, P.psiPeriod)
  const gPhi = P.gradPhi ? P.gradPhi(p[0], p[1]) : gradient(P.phi, p[0], p[1], fd, P.phiPeriod)
  const sPsi = -gPsi[0] / gPsi[1]
  const sPhi = -gPhi[0] / gPhi[1]
  const tPsi: Vec = [gPsi[1], -gPsi[0]]
  const tPhi: Vec = [gPhi[1], -gPhi[0]]
  const cos = Math.abs(tPsi[0] * tPhi[0] + tPsi[1] * tPhi[1]) / (Math.hypot(...tPsi) * Math.hypot(...tPhi))
  const angle = (Math.acos(Math.min(1, cos)) * 180) / Math.PI
  const psiP = P.psi(p[0], p[1])
  let nLo: number | null = null
  let nHi: number | null = null
  let sLo: number | null = null
  let sHi: number | null = null
  if (!stagnant && Number.isFinite(psiP)) {
    const nh: Vec = [-v / V, u / V] // unit normal, direction of increasing ψ
    const th: Vec = [u / V, v / V] // unit tangent, direction of increasing φ (course convention)
    const kψ = Math.floor(psiP / h + 1e-9)
    const maxD = 0.9 * span
    nHi = distanceToLevel(P.psi, p, nh, (kψ + 1) * h, maxD, P.psiPeriod)
    nLo = distanceToLevel(P.psi, p, [-nh[0], -nh[1]], kψ * h, maxD, P.psiPeriod)
    const phiP = P.phi(p[0], p[1])
    const kφ = Math.floor(phiP / h + 1e-9)
    sHi = distanceToLevel(P.phi, p, th, (kφ + 1) * h, maxD, P.phiPeriod)
    sLo = distanceToLevel(P.phi, p, [-th[0], -th[1]], kφ * h, maxD, P.phiPeriod)
  }
  return { u, v, V, stagnant, sPsi, sPhi, angle, psiP, nLo, nHi, sLo, sHi }
}

export function FlowNetLab({ mode, presets, initial }: { mode: Mode; presets: NetId[]; initial: NetId }) {
  const [id, setId] = useState<NetId>(initial)
  const P = getNetPreset(id)
  const [hs, setHs] = useState<Partial<Record<NetId, number>>>({})
  const [probes, setProbes] = useState<Partial<Record<NetId, Vec>>>({})
  const [heat, setHeat] = useState(false)
  const h = hs[id] ?? P.h.def
  const probe = probes[id] ?? P.probe
  const psiLevels = useMemo(() => levelsFor(P.psiRange, h, !!P.dropWallLevels), [P, h])
  const phiLevels = useMemo(() => levelsFor(P.phiRange, h), [P, h])
  const m = measure(P, probe, h)

  const setProbe = (p: Vec) => {
    if (!Number.isFinite(P.psi(p[0], p[1])) || P.body?.(p[0], p[1])) return
    setProbes((o) => ({ ...o, [id]: p }))
  }

  const dn = m.nLo != null && m.nHi != null ? m.nLo + m.nHi : null
  const dsv = m.sLo != null && m.sHi != null ? m.sLo + m.sHi : null
  const Vn = dn ? h / dn : NaN
  const Vs = dsv ? h / dsv : NaN

  const overlay = (ctx: OverlayCtx) => {
    const { sx, sy } = ctx
    const p0 = [sx(probe[0]), sy(probe[1])] as const
    const els: React.ReactNode[] = []
    if (m.stagnant) {
      els.push(<circle key="st" cx={p0[0]} cy={p0[1]} r={12} fill="none" stroke="var(--plot-4)" strokeWidth={2} strokeDasharray="3 3" />)
      els.push(
        <Tx key="stt" x={p0[0] + 14} y={p0[1] - 12} size={11.5} math={false} fill="var(--plot-4)" halo>
          V = 0: slopes undefined
        </Tx>,
      )
    } else if (mode === 'orthogonality') {
      // screen unit tangents (screen y points down)
      const ts: [number, number] = [m.u / m.V, -m.v / m.V]
      const te: [number, number] = [-m.v / m.V, -m.u / m.V]
      const L = 62
      // orient the triangles: streamline tangent pointing right, equipotential tangent pointing up
      const t1: [number, number] = ts[0] >= 0 ? ts : [-ts[0], -ts[1]]
      const t2: [number, number] = te[1] <= 0 ? te : [-te[0], -te[1]]
      const H0 = [p0[0] + 16 * t1[0], p0[1] + 16 * t1[1]]
      const H1 = [p0[0] + 56 * t1[0], p0[1] + 56 * t1[1]]
      const G0 = [p0[0] + 16 * t2[0], p0[1] + 16 * t2[1]]
      const G1 = [p0[0] + 56 * t2[0], p0[1] + 56 * t2[1]]
      els.push(
        <line key="lsh" x1={p0[0] - L * ts[0]} y1={p0[1] - L * ts[1]} x2={p0[0] + L * ts[0]} y2={p0[1] + L * ts[1]} stroke="var(--surface)" strokeWidth={7} strokeLinecap="round" />,
        <line key="leh" x1={p0[0] - L * te[0]} y1={p0[1] - L * te[1]} x2={p0[0] + L * te[0]} y2={p0[1] + L * te[1]} stroke="var(--surface)" strokeWidth={7} strokeLinecap="round" />,
        <line key="ls" x1={p0[0] - L * ts[0]} y1={p0[1] - L * ts[1]} x2={p0[0] + L * ts[0]} y2={p0[1] + L * ts[1]} stroke="var(--streamline)" strokeWidth={3.4} strokeLinecap="round" />,
        <line key="le" x1={p0[0] - L * te[0]} y1={p0[1] - L * te[1]} x2={p0[0] + L * te[0]} y2={p0[1] + L * te[1]} stroke="var(--equipotential)" strokeWidth={3.4} strokeDasharray="8 5" strokeLinecap="round" />,
        <path key="tr1" d={polyPath([[H0[0], H0[1]], [H1[0], H0[1]], [H1[0], H1[1]]])} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />,
        <path key="tr2" d={polyPath([[G0[0], G0[1]], [G1[0], G0[1]], [G1[0], G1[1]]])} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />,
        <RightAngle key="ra" x={p0[0]} y={p0[1]} d1={t1} d2={t2} size={10} color="var(--ink)" />,
        <Arrow key="v" x1={p0[0]} y1={p0[1]} x2={p0[0] + 40 * ts[0]} y2={p0[1] + 40 * ts[1]} color="var(--ink)" width={2} head={8} />,
      )
    } else {
      const nh: Vec = [-m.v / m.V, m.u / m.V]
      const th: Vec = [m.u / m.V, m.v / m.V]
      const at = (d: Vec, t: number) => [sx(probe[0] + d[0] * t), sy(probe[1] + d[1] * t)] as const
      if (m.nLo != null && m.nHi != null) {
        const a = at(nh, -m.nLo)
        const b = at(nh, m.nHi)
        els.push(
          <Arrow key="dn" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} color="var(--plot-4)" width={2} head={7} both />,
          <circle key="dna" cx={a[0]} cy={a[1]} r={3} fill="var(--plot-4)" />,
          <circle key="dnb" cx={b[0]} cy={b[1]} r={3} fill="var(--plot-4)" />,
          <Tx key="dnl" x={b[0] + 6} y={b[1] + (nh[1] > 0 ? -6 : 14)} size={13} fill="var(--plot-4)" weight={700} halo>
            Δn
          </Tx>,
        )
      }
      if (m.sLo != null && m.sHi != null) {
        const a = at(th, -m.sLo)
        const b = at(th, m.sHi)
        els.push(
          <Arrow key="ds" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} color="var(--plot-5)" width={2} head={7} both />,
          <Tx key="dsl" x={b[0] + 6} y={b[1] + 14} size={13} fill="var(--plot-5)" weight={700} halo>
            Δs
          </Tx>,
        )
      }
    }
    els.push(<circle key="p" cx={p0[0]} cy={p0[1]} r={4.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />)
    return (
      <g>
        {els}
        <DragLayer ctx={ctx} x={P.x} y={P.y} onPoint={setProbe} />
      </g>
    )
  }

  const orthoItems: ReadoutItemT[] = m.stagnant
    ? [
        { label: md`$u,\ v$`, value: 'both ≈ 0' },
        { label: 'slopes', value: 'undefined', tone: 'bad' },
      ]
    : [
        { label: md`$u$`, value: m.u, unit: 'm/s' },
        { label: md`$v$`, value: m.v, unit: 'm/s' },
        { label: md`streamline: $-\frac{\partial\psi/\partial x}{\partial\psi/\partial y}$`, value: fmtSlope(m.sPsi), tone: 'accent' },
        { label: md`equipotential: $-\frac{\partial\phi/\partial x}{\partial\phi/\partial y}$`, value: fmtSlope(m.sPhi), tone: 'accent' },
        { label: md`check $v/u$`, value: fmtSlope(m.v / m.u) },
        { label: md`check $-u/v$`, value: fmtSlope(-m.u / m.v) },
        {
          label: 'product of slopes',
          value: Number.isFinite(m.sPsi * m.sPhi) && Math.abs(m.sPsi) < 1e4 && Math.abs(m.sPhi) < 1e4 ? m.sPsi * m.sPhi : '— (one tangent vertical)',
          digits: 4,
          tone: 'good',
        },
        { label: 'angle between tangents', value: m.angle, unit: '°', digits: 4, tone: 'good' },
      ]

  const err = Number.isFinite(Vn) && m.V > 0 ? (100 * (Vn - m.V)) / m.V : NaN
  const spacingItems: ReadoutItemT[] = m.stagnant
    ? [{ label: md`$\vert\vb V\vert$`, value: 0, unit: 'm/s' }, { label: 'spacing', value: '∞ (stagnation)', tone: 'bad' }]
    : [
        { label: md`$\Delta\psi = \Delta\phi$`, value: h, unit: 'm²/s' },
        { label: md`streamline gap $\Delta n$`, value: dn ?? '—', unit: dn ? 'm' : undefined },
        { label: md`$V \approx \Delta\psi/\Delta n$`, value: Number.isFinite(Vn) ? Vn : '—', unit: 'm/s', tone: 'accent' },
        { label: md`exact $\vert\vb V\vert$`, value: m.V, unit: 'm/s', tone: 'good' },
        { label: md`equipotential gap $\Delta s$`, value: dsv ?? '—', unit: dsv ? 'm' : undefined },
        { label: md`$V \approx \Delta\phi/\Delta s$`, value: Number.isFinite(Vs) ? Vs : '—', unit: 'm/s', tone: 'accent' },
        { label: md`cell shape $\Delta s/\Delta n$`, value: dn && dsv ? dsv / dn : '—' },
        { label: 'error of Δψ/Δn', value: Number.isFinite(err) ? `${err >= 0 ? '+' : '−'}${Math.abs(err).toFixed(2)} %` : '—' },
        ...(P.Vin
          ? [{ label: md`$C_p = 1 - (V/V_\text{in})^2$`, value: 1 - (m.V / P.Vin) ** 2, tone: 'default' as const }]
          : []),
      ]

  return (
    <SimPanel
      title={mode === 'orthogonality' ? 'Orthogonality checker' : 'Flow-net viewer: speed from spacing'}
      subtitle={mode === 'orthogonality' ? 'slopes of the ψ- and φ-lines through a point' : 'measure Δn between neighbouring streamlines'}
      wide
      controls={
        <>
          <Segmented label="flow" value={id} onChange={setId} options={presets.map((k) => ({ value: k, label: getNetPreset(k).label }))} />
          <Slider
            label={md`level spacing $\Delta\psi = \Delta\phi$`}
            value={h}
            min={P.h.min}
            max={P.h.max}
            onChange={(v) => setHs((o) => ({ ...o, [id]: v }))}
            unit="m²/s"
            digits={3}
          />
          <Slider label={md`probe $x$`} value={probe[0]} min={P.x[0]} max={P.x[1]} onChange={(v) => setProbe([v, probe[1]])} unit="m" />
          <Slider label={md`probe $y$`} value={probe[1]} min={P.y[0]} max={P.y[1]} onChange={(v) => setProbe([probe[0], v])} unit="m" />
          {mode === 'spacing' ? <Toggle label="colour by speed" checked={heat} onChange={setHeat} /> : null}
        </>
      }
      readout={<TeXReadout cols={2} items={mode === 'orthogonality' ? orthoItems : spacingItems} />}
      footer={
        <Md>
          {mode === 'orthogonality'
            ? md`**Try this:** drag the probe anywhere — the two slopes change, but their product stays $-1$ and the angle stays $90^\circ$, because both are computed from $\phi$ and $\psi$ separately. Now pick **90° corner** or **Fox Ex. 6.10** and creep up on the stagnation point: $u$ and $v$ both vanish there, the slopes become $0/0$, and orthogonality is no longer guaranteed.`
            : md`**Try this:** on the **90° bend**, move the probe from the outer wall to the inner wall: the streamline gap $\Delta n$ shrinks and $V \approx \Delta\psi/\Delta n$ grows (slide 7: $d_2 < d \Rightarrow V_2 > V$). Halve the level spacing and watch the estimate converge on the exact $\vert\vb V\vert$, while $\Delta s/\Delta n$ stays close to 1 — the cells are curvilinear squares.`}
        </Md>
      }
    >
      <FlowField
        x={P.x}
        y={P.y}
        psi={P.psi}
        phi={P.phi}
        vel={P.vel}
        body={P.body}
        psiLevels={psiLevels}
        phiLevels={phiLevels}
        equipotentials
        particles={mode === 'spacing' ? 90 : 0}
        heatmap={mode === 'spacing' && heat}
        Uref={P.Uref}
        markers={P.markers}
        hover={false}
        maxHeight={440}
        overlay={overlay}
      />
      <div className="mt-2 text-sm text-ink-2">
        <Md>{P.blurb}</Md>
        <p className="mt-1 text-xs text-ink-3">Click or drag on the plot (or use the probe sliders) to move the probe.</p>
      </div>
    </SimPanel>
  )
}
