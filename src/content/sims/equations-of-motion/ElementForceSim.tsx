import { useState } from 'react'
import { Readout, Segmented, SimPanel, Slider, Toggle, md, num } from '@/kit'
import { CubeAnnotations, CubeOutline, FACES, FACE_ORDER, FAMILY_COLOR, FaceArrow, faceArrow, type FaceKey } from './ElementCube'
import { COL, SubText } from './svg'

export interface ElementParams {
  /** centre values (Pa) and gradients (Pa/m) */
  sxx: number
  dsxx: number
  tyx: number
  dtyx: number
  tzx: number
  dtzx: number
  /** cube edge δx = δy = δz (mm) */
  deltaMM: number
  rho: number
  gx: number
  on: { n: boolean; y: boolean; z: boolean }
}

/** All face forces of the slide-3 element (cube of side δ) and the resulting x-balance. SI units. */
export function elementForces(p: ElementParams) {
  const d = p.deltaMM / 1000
  const A = d * d
  const vol = d * d * d
  const sxx = p.on.n ? p.sxx : 0
  const dsxx = p.on.n ? p.dsxx : 0
  const tyx = p.on.y ? p.tyx : 0
  const dtyx = p.on.y ? p.dtyx : 0
  const tzx = p.on.z ? p.tzx : 0
  const dtzx = p.on.z ? p.dtzx : 0
  const stress: Record<FaceKey, number> = {
    R: sxx + (dsxx * d) / 2,
    L: sxx - (dsxx * d) / 2,
    T: tyx + (dtyx * d) / 2,
    B: tyx - (dtyx * d) / 2,
    F: tzx + (dtzx * d) / 2,
    K: tzx - (dtzx * d) / 2,
  }
  // x-component of the force: a positive stress acts in +x on a positive face and in −x on a negative face
  const fx = {} as Record<FaceKey, number>
  for (const k of FACE_ORDER) fx[k] = FACES[k].sign * stress[k] * A
  const pairN = fx.R + fx.L
  const pairY = fx.T + fx.B
  const pairZ = fx.F + fx.K
  const Fs = pairN + pairY + pairZ
  const dm = p.rho * vol
  const Fb = dm * p.gx
  const F = Fs + Fb
  const fsPerVol = dsxx + dtyx + dtzx
  return { d, A, vol, stress, fx, pairN, pairY, pairZ, Fs, dm, Fb, F, ax: F / dm, fsPerVol, fPerVol: fsPerVol + p.rho * p.gx }
}

const EXAMPLE: Omit<ElementParams, 'on'> = { sxx: -1500, dsxx: -4000, tyx: 30, dtyx: 1000, tzx: 0, dtzx: 0, deltaMM: 20, rho: 1000, gx: 0 }
const START: Omit<ElementParams, 'on'> = { sxx: -1500, dsxx: -40000, tyx: 600, dtyx: 30000, tzx: -300, dtzx: 20000, deltaMM: 20, rho: 1000, gx: 0 }

/** Reference stresses that map to a 90 px arrow (normal and shear drawn at different scales). */
const REF = { n: 3000, y: 1500, z: 1500 }
const mN = (f: number) => `${num.fmt(f * 1000, 3)} mN`

function labelPos(k: FaceKey, x1: number, x2: number, y: number): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const lo = Math.min(x1, x2)
  const hi = Math.max(x1, x2)
  switch (k) {
    case 'R':
      return { x: hi + 6, y: y + 4, anchor: 'start' }
    case 'L':
      return { x: lo - 6, y: y + 4, anchor: 'end' }
    case 'T':
      return { x: (lo + hi) / 2, y: y - 10, anchor: 'middle' }
    case 'B':
      return { x: (lo + hi) / 2, y: y + 20, anchor: 'middle' }
    case 'F':
      return { x: (lo + hi) / 2, y: y + 20, anchor: 'middle' }
    case 'K':
      return { x: hi + 4, y: y - 8, anchor: 'start' }
  }
}

function NetBars({ rows }: { rows: { label: string; value: number; color: string; bold?: boolean }[] }) {
  const max = Math.max(1e-12, ...rows.map((r) => Math.abs(r.value)))
  const x0 = 330
  const half = 150
  const rowH = 26
  const H = rows.length * rowH + 22
  return (
    <svg viewBox={`0 0 520 ${H}`} className="block h-auto w-full" role="img" aria-label="Net x-force contributions">
      <line x1={x0} x2={x0} y1={4} y2={H - 16} stroke="var(--axis)" strokeWidth={1} />
      <text x={x0 - half} y={H - 4} fontSize={10.5} fill="var(--ink-3)">← −x</text>
      <text x={x0 + half} y={H - 4} fontSize={10.5} fill="var(--ink-3)" textAnchor="end">+x →</text>
      {rows.map((r, i) => {
        const y = 8 + i * rowH
        const w = (Math.abs(r.value) / max) * half
        const xs = r.value >= 0 ? x0 : x0 - w
        return (
          <g key={r.label}>
            <SubText x={4} y={y + 13} text={r.label} size={11.5} fill="var(--ink-2)" weight={r.bold ? 700 : undefined} />
            <rect x={xs} y={y + 2} width={Math.max(0.5, w)} height={16} rx={3} fill={r.color} opacity={r.bold ? 0.95 : 0.75} />
            <text
              x={r.value >= 0 ? x0 + w + 4 : x0 - w - 4}
              y={y + 14}
              fontSize={11}
              textAnchor={r.value >= 0 ? 'start' : 'end'}
              fill="var(--ink)"
              fontWeight={r.bold ? 700 : 500}
            >
              {mN(r.value)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Interactive slide-3 element: stresses at the centre + gradients → six face forces → net x-force → a_x. */
export function ElementForceSim() {
  const [v, setV] = useState(START)
  const [on, setOn] = useState({ n: true, y: true, z: true })
  const [tab, setTab] = useState<'n' | 'y' | 'z' | 'e'>('n')
  const set = (k: keyof typeof v) => (x: number) => setV((s) => ({ ...s, [k]: x }))
  const r = elementForces({ ...v, on })

  const famOn = (k: FaceKey) => on[FACES[k].family]

  return (
    <SimPanel
      title="Differential element: x-force balance"
      subtitle="cube of side δ, stresses given at the centre"
      wide
      controls={
        <>
          <Segmented
            label="Edit"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'n', label: md`$\sigma_{xx}$` },
              { value: 'y', label: md`$\tau_{yx}$` },
              { value: 'z', label: md`$\tau_{zx}$` },
              { value: 'e', label: 'element' },
            ]}
          />
          {tab === 'n' ? (
            <>
              <Toggle label="include normal stress $\sigma_{xx}$" checked={on.n} onChange={(b) => setOn((o) => ({ ...o, n: b }))} />
              <Slider label="$\sigma_{xx}$ at centre" value={v.sxx} min={-3000} max={3000} step={50} onChange={set('sxx')} unit="Pa" digits={4} />
              <Slider
                label="$\partial\sigma_{xx}/\partial x$"
                value={v.dsxx / 1000}
                min={-100}
                max={100}
                step={1}
                onChange={(x) => set('dsxx')(x * 1000)}
                unit="kPa/m"
              />
            </>
          ) : null}
          {tab === 'y' ? (
            <>
              <Toggle label="include shear $\tau_{yx}$ (y-faces)" checked={on.y} onChange={(b) => setOn((o) => ({ ...o, y: b }))} />
              <Slider label="$\tau_{yx}$ at centre" value={v.tyx} min={-1500} max={1500} step={25} onChange={set('tyx')} unit="Pa" digits={4} />
              <Slider
                label="$\partial\tau_{yx}/\partial y$"
                value={v.dtyx / 1000}
                min={-100}
                max={100}
                step={1}
                onChange={(x) => set('dtyx')(x * 1000)}
                unit="kPa/m"
              />
            </>
          ) : null}
          {tab === 'z' ? (
            <>
              <Toggle label="include shear $\tau_{zx}$ (z-faces)" checked={on.z} onChange={(b) => setOn((o) => ({ ...o, z: b }))} />
              <Slider label="$\tau_{zx}$ at centre" value={v.tzx} min={-1500} max={1500} step={25} onChange={set('tzx')} unit="Pa" digits={4} />
              <Slider
                label="$\partial\tau_{zx}/\partial z$"
                value={v.dtzx / 1000}
                min={-100}
                max={100}
                step={1}
                onChange={(x) => set('dtzx')(x * 1000)}
                unit="kPa/m"
              />
            </>
          ) : null}
          {tab === 'e' ? (
            <>
              <Slider label="edge $\delta = \delta x = \delta y = \delta z$" value={v.deltaMM} min={2} max={30} step={1} onChange={set('deltaMM')} unit="mm" />
              <Slider label="density $\rho$" value={v.rho} min={500} max={2000} step={10} onChange={set('rho')} unit="kg/m³" digits={4} />
              <Slider label="gravity component $g_x$" value={v.gx} min={-9.81} max={9.81} step={0.01} onChange={set('gx')} unit="m/s²" />
            </>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setV(EXAMPLE)
                setOn({ n: true, y: true, z: true })
              }}
            >
              Load Example 1 values
            </button>
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setV(START)
                setOn({ n: true, y: true, z: true })
              }}
            >
              Reset
            </button>
          </div>
        </>
      }
      readout={
        <Readout
          items={[
            { label: 'net surface force (x)', value: mN(r.Fs) },
            { label: 'body force (x)', value: mN(r.Fb) },
            { label: 'element mass', value: r.dm * 1000, unit: 'g' },
            { label: 'acceleration (x)', value: r.ax, unit: 'm/s²', tone: 'accent' },
            { label: 'surface force per volume', value: r.fsPerVol, unit: 'N/m³' },
            { label: 'total force per volume', value: r.fPerVol, unit: 'N/m³' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> change <i>σ</i>
          <sub>xx</sub> at the centre — both normal-stress arrows change, but the “x-faces” bar does not move: only the gradient
          ∂σ<sub>xx</sub>/∂x survives. Then shrink δ from 30 mm to 2 mm: every force shrinks like δ³, yet a<sub>x</sub> and the force per
          unit volume stay fixed — that is why we divide by δx δy δz.
        </span>
      }
    >
      <svg viewBox="0 0 520 300" className="block h-auto w-full" role="img" aria-label="Element with face forces">
        <CubeOutline />
        {(['B', 'K', 'L', 'R', 'T', 'F'] as FaceKey[]).map((k) => {
          if (!famOn(k)) return null
          const fam = FACES[k].family
          const len = Math.min(110, (90 * Math.abs(r.stress[k])) / REF[fam])
          return <FaceArrow key={k} face={k} fx={r.fx[k]} len={len} color={FAMILY_COLOR[fam]} />
        })}
        {FACE_ORDER.map((k) => {
          if (!famOn(k)) return null
          const fam = FACES[k].family
          const len = Math.min(110, (90 * Math.abs(r.stress[k])) / REF[fam])
          const g = faceArrow(k, r.fx[k], Math.max(len, 1.5)) ?? { x1: FACES[k].c[0], x2: FACES[k].c[0], y: FACES[k].c[1] }
          const lp = labelPos(k, g.x1, g.x2, g.y)
          return (
            <text
              key={k}
              x={lp.x}
              y={lp.y}
              textAnchor={lp.anchor}
              fontSize={11.5}
              fontWeight={600}
              fill={FAMILY_COLOR[fam]}
              paintOrder="stroke"
              stroke="var(--surface)"
              strokeWidth={3}
            >
              {mN(r.fx[k])}
            </text>
          )
        })}
        <CubeAnnotations axes={false} />
        <text x={8} y={18} fontSize={11} fill="var(--ink-3)">
          arrows ∝ face stress (normal and shear at different scales)
        </text>
        <text x={8} y={290} fontSize={11} fill="var(--ink-3)">
          numbers = x-component of each face force
        </text>
      </svg>
      <div className="mt-2 rounded-xl border border-line bg-surface-2/60 p-2">
        <div className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">Net x-force on the element</div>
        <NetBars
          rows={[
            { label: 'x-faces (σ_xx pair)', value: r.pairN, color: COL.normal },
            { label: 'y-faces (τ_yx pair)', value: r.pairY, color: COL.shearY },
            { label: 'z-faces (τ_zx pair)', value: r.pairZ, color: COL.shearZ },
            { label: 'body force δm g_x', value: r.Fb, color: COL.body },
            { label: 'total δF_x', value: r.F, color: COL.net, bold: true },
          ]}
        />
      </div>
    </SimPanel>
  )
}
