/**
 * Concept 1 interactive: one velocity vector, four routes. At a probe point (r, θ) the velocity is obtained by
 * differentiating φ and ψ numerically, in Cartesian and in polar form (Lecture 12, slide 3), and drawn as its
 * (u, v) and (v_r, v_θ) components.
 */
import { useState } from 'react'
import { FlowField, Md, Segmented, SimPanel, Slider, md, type Vec } from '@/kit'
import { ROUTES, gradient, polarDerivs, type RouteId } from './fields'
import { Arrow, RightAngle, Sub, Tx } from './svg'
import { DragLayer, TeXReadout, type OverlayCtx } from './ui'

const XD: [number, number] = [-2, 2]
const YD: [number, number] = [-2, 2]
const RMIN = 0.25
const RMAX = 1.95
type View = 'cart' | 'polar' | 'both'

export function VelocityRoutes() {
  const [id, setId] = useState<RouteId>('corner')
  const [r, setR] = useState(1.25)
  const [thDeg, setThDeg] = useState(35)
  const [view, setView] = useState<View>('both')
  const P = ROUTES[id]
  const th = (thDeg * Math.PI) / 180
  const px = r * Math.cos(th)
  const py = r * Math.sin(th)
  const h = 1e-4
  const [phx, phy] = gradient(P.phi, px, py, h, P.phiPeriod)
  const [psx, psy] = gradient(P.psi, px, py, h, P.psiPeriod)
  const [phr, pht] = polarDerivs(P.phi, r, th, h, P.phiPeriod)
  const [psr, pst] = polarDerivs(P.psi, r, th, h, P.psiPeriod)
  const u = phx
  const v = phy
  const vr = phr
  const vt = pht
  const speed = Math.hypot(u, v)

  const onPoint = (p: Vec) => {
    const rr = Math.min(RMAX, Math.max(RMIN, Math.hypot(p[0], p[1])))
    let deg = (Math.atan2(p[1], p[0]) * 180) / Math.PI
    if (deg < 0) deg += 360
    setR(rr)
    setThDeg(deg)
  }

  const overlay = (ctx: OverlayCtx) => {
    const { sx, sy } = ctx
    const k = Math.min(0.85 / P.Uref, 1.3 / Math.max(speed, 1e-9))
    const O = [sx(0), sy(0)] as const
    const Pp = [sx(px), sy(py)] as const
    const tip = [sx(px + k * u), sy(py + k * v)] as const
    const uTip = [sx(px + k * u), Pp[1]] as const
    const rTip = [sx(px + k * vr * Math.cos(th)), sy(py + k * vr * Math.sin(th))] as const
    const R = 24
    const arc = `M${O[0] + R} ${O[1]}A${R} ${R} 0 ${th > Math.PI ? 1 : 0} 0 ${O[0] + R * Math.cos(th)} ${O[1] - R * Math.sin(th)}`
    const showC = view !== 'polar'
    const showP = view !== 'cart'
    const er: [number, number] = [Math.cos(th), -Math.sin(th)]
    const et: [number, number] = [-Math.sin(th), -Math.cos(th)]
    return (
      <g>
        <line x1={O[0]} y1={O[1]} x2={Pp[0]} y2={Pp[1]} stroke="var(--ink-2)" strokeWidth={1.3} strokeDasharray="6 4" />
        <path d={arc} fill="none" stroke="var(--ink-2)" strokeWidth={1.2} />
        <Tx x={O[0] + (R + 9) * Math.cos(th / 2)} y={O[1] - (R + 9) * Math.sin(th / 2) + 4} size={12.5} halo>
          θ
        </Tx>
        <Tx x={(O[0] + Pp[0]) / 2 - 8 * Math.sin(th)} y={(O[1] + Pp[1]) / 2 - 8 * Math.cos(th) + 4} size={12.5} halo>
          r
        </Tx>
        {showC ? (
          <g>
            <Arrow x1={Pp[0]} y1={Pp[1]} x2={uTip[0]} y2={uTip[1]} color="var(--plot-1)" width={2.2} head={8} />
            <Arrow x1={uTip[0]} y1={uTip[1]} x2={tip[0]} y2={tip[1]} color="var(--plot-1)" width={2.2} head={8} />
            {Math.abs(k * u) > 0.08 && Math.abs(k * v) > 0.08 ? (
              <RightAngle x={uTip[0]} y={uTip[1]} d1={[u > 0 ? -1 : 1, 0]} d2={[0, v > 0 ? -1 : 1]} size={7} />
            ) : null}
            <Tx x={(Pp[0] + uTip[0]) / 2} y={Pp[1] + (v > 0 ? 15 : -7)} size={12.5} anchor="middle" fill="var(--plot-1)" halo>
              u
            </Tx>
            <Tx x={uTip[0] + (u > 0 ? 6 : -6)} y={(uTip[1] + tip[1]) / 2 + 4} size={12.5} anchor={u > 0 ? 'start' : 'end'} fill="var(--plot-1)" halo>
              v
            </Tx>
          </g>
        ) : null}
        {showP ? (
          <g>
            <Arrow x1={Pp[0]} y1={Pp[1]} x2={rTip[0]} y2={rTip[1]} color="var(--plot-6)" width={2.2} head={8} />
            <Arrow x1={rTip[0]} y1={rTip[1]} x2={tip[0]} y2={tip[1]} color="var(--plot-6)" width={2.2} head={8} />
            {Math.abs(k * vr) > 0.08 && Math.abs(k * vt) > 0.08 ? (
              <RightAngle
                x={rTip[0]}
                y={rTip[1]}
                d1={[-Math.sign(vr) * er[0], -Math.sign(vr) * er[1]]}
                d2={[Math.sign(vt) * et[0], Math.sign(vt) * et[1]]}
                size={7}
              />
            ) : null}
            <Tx x={(Pp[0] + rTip[0]) / 2 + 8 * et[0]} y={(Pp[1] + rTip[1]) / 2 + 8 * et[1] + 4} size={12.5} anchor="middle" fill="var(--plot-6)" halo>
              v<Sub>r</Sub>
            </Tx>
            <Tx x={(rTip[0] + tip[0]) / 2 + 9 * er[0]} y={(rTip[1] + tip[1]) / 2 + 9 * er[1] + 4} size={12.5} anchor="middle" fill="var(--plot-6)" halo>
              v<Sub>θ</Sub>
            </Tx>
          </g>
        ) : null}
        <Arrow x1={Pp[0]} y1={Pp[1]} x2={tip[0]} y2={tip[1]} color="var(--ink)" width={2.8} head={10} />
        <Tx x={tip[0] + 6} y={tip[1] - 6} size={14} weight={700} halo>
          V
        </Tx>
        <circle cx={Pp[0]} cy={Pp[1]} r={4.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
        <DragLayer ctx={ctx} x={XD} y={YD} onPoint={onPoint} label="Click or drag to move the point P" />
      </g>
    )
  }

  return (
    <SimPanel
      title="One velocity, four routes"
      subtitle="differentiate φ or ψ, in Cartesian or polar form"
      wide
      controls={
        <>
          <Segmented
            label="flow"
            value={id}
            onChange={setId}
            options={(Object.keys(ROUTES) as RouteId[]).map((k) => ({ value: k, label: ROUTES[k].label }))}
          />
          <Slider label={md`radius $r$ of P`} value={r} min={RMIN} max={RMAX} step={0.01} onChange={setR} unit="m" />
          <Slider label={md`angle $\theta$ of P`} value={thDeg} min={0} max={359} step={1} onChange={setThDeg} unit="°" digits={3} />
          <Segmented
            label="components drawn"
            value={view}
            onChange={setView}
            options={[
              { value: 'cart', label: md`$u,\ v$` },
              { value: 'polar', label: md`$v_r,\ v_\theta$` },
              { value: 'both', label: 'both' },
            ]}
          />
        </>
      }
      readout={
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            <span>from φ</span>
            <span>from ψ</span>
          </div>
          <TeXReadout
            cols={2}
            items={[
              { label: md`$u = \pd{\phi}{x}$`, value: u, unit: 'm/s', tone: 'accent' },
              { label: md`$u = \pd{\psi}{y}$`, value: psy, unit: 'm/s' },
              { label: md`$v = \pd{\phi}{y}$`, value: v, unit: 'm/s', tone: 'accent' },
              { label: md`$v = -\pd{\psi}{x}$`, value: -psx, unit: 'm/s' },
              { label: md`$v_r = \pd{\phi}{r}$`, value: vr, unit: 'm/s', tone: 'accent' },
              { label: md`$v_r = \frac{1}{r}\pd{\psi}{\theta}$`, value: pst, unit: 'm/s' },
              { label: md`$v_\theta = \frac{1}{r}\pd{\phi}{\theta}$`, value: vt, unit: 'm/s', tone: 'accent' },
              { label: md`$v_\theta = -\pd{\psi}{r}$`, value: -psr, unit: 'm/s' },
            ]}
          />
          <TeXReadout
            cols={2}
            items={[
              { label: md`$\vert\vb V\vert = \sqrt{u^2+v^2}$`, value: speed, unit: 'm/s' },
              { label: md`$\sqrt{v_r^2+v_\theta^2}$`, value: Math.hypot(vr, vt), unit: 'm/s' },
            ]}
          />
        </div>
      }
      footer={
        <Md>{md`**Try this:** choose the **source** and drag P around a circle — $v_r$ stays fixed at $m/2\pi r$ and $v_\theta = 0$ while $u$ and $v$ change all the time: polar components are the natural ones for radial flow. Then choose the **corner flow** and check that each teal tile (the φ route) always equals its partner (the ψ route) — that agreement is the Cauchy–Riemann pair.`}</Md>
      }
    >
      <FlowField
        x={XD}
        y={YD}
        psi={P.psi}
        phi={P.phi}
        vel={P.vel}
        psiLevels={P.psiLevels}
        phiLevels={P.phiLevels}
        equipotentials
        particles={45}
        Uref={P.Uref}
        markers={P.markers}
        hover={false}
        maxHeight={430}
        overlay={overlay}
      />
      <div className="mt-2 space-y-1 text-sm text-ink-2">
        <Md>{md`**Cartesian:** ${P.cart}`}</Md>
        <Md>{md`**Polar:** ${P.polar}`}</Md>
        <Md>{md`**Velocity:** ${P.comps}`}</Md>
        <p className="text-xs text-ink-3">
          P = ({px.toFixed(2)}, {py.toFixed(2)}) m. Derivatives are taken numerically (central differences), exactly as you would do by hand with the
          formulas of slide 3.
        </p>
      </div>
    </SimPanel>
  )
}
