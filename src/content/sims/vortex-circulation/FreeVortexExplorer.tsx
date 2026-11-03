import { useMemo, useState } from 'react'
import { FlowField, Readout, Segmented, SimPanel, Slider, Toggle, md, useUid, type Vec } from '@/kit'

const RADII = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]
const DEG = Math.PI / 180

/** Free vortex φ = Kθ, ψ = −K ln r with tracers, equipotential rays and a probe circle. */
export function FreeVortexExplorer() {
  const [Kmag, setKmag] = useState(0.8)
  const [dir, setDir] = useState<1 | -1>(1)
  const [rp, setRp] = useState(0.6)
  const [showPhi, setShowPhi] = useState(true)
  const [arrows, setArrows] = useState(false)
  const uid = useUid('fvx')
  const K = dir * Kmag

  const vel = useMemo(
    () =>
      (x: number, y: number): Vec => {
        const r2 = x * x + y * y
        return [(-K * y) / r2, (K * x) / r2]
      },
    [K],
  )
  const psi = useMemo(() => (x: number, y: number) => -0.5 * K * Math.log(x * x + y * y), [K])
  const phi = useMemo(() => (x: number, y: number) => K * Math.atan2(y, x), [K])
  const psiLevels = useMemo(() => RADII.map((r) => -K * Math.log(r)), [K])
  // rays every 30°, offset by 15° so that none sits on the branch cut of atan2 (θ = ±180°)
  const phiLevels = useMemo(() => Array.from({ length: 12 }, (_, k) => K * (-165 + 30 * k) * DEG), [K])
  const highlight = useMemo(() => [{ level: -K * Math.log(rp), color: 'var(--plot-3)', width: 2.6, label: `probe circle r = ${rp.toFixed(2)} m` }], [K, rp])

  const vth = K / rp // signed: negative for a clockwise vortex
  const lap = (2 * Math.PI * rp * rp) / Kmag
  const probeAngle = 45 * DEG
  const arrowPx = Math.min(64, 16 + 9 * Math.abs(vth))

  return (
    <SimPanel
      title="Free-vortex explorer"
      subtitle={md`$\phi = K\theta$, $\ \psi = -K\ln r$, $\ v_\theta = K/r$ (axes $x$, $y$ in m)`}
      controls={
        <>
          <Segmented<1 | -1>
            label="swirl direction"
            value={dir}
            onChange={setDir}
            options={[
              { value: 1, label: md`counter-clockwise ($K>0$)` },
              { value: -1, label: md`clockwise ($K<0$)` },
            ]}
          />
          <Slider label={md`strength $\vert K\vert$`} value={Kmag} min={0.2} max={2} step={0.05} onChange={setKmag} unit="m²/s" digits={2} />
          <Slider label={md`probe radius $r_p$`} value={rp} min={0.2} max={1.9} step={0.05} onChange={setRp} unit="m" digits={2} />
          <Toggle label={md`equipotentials $\phi = $ const`} checked={showPhi} onChange={setShowPhi} />
          <Toggle label="velocity arrows" checked={arrows} onChange={setArrows} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$v_\theta$ at $r_p$`, value: vth, unit: 'm/s' },
            { label: md`lap time $2\pi r_p^2/\vert K\vert$`, value: lap, unit: 's' },
            { label: md`$r\,v_\theta = K$ (any circle)`, value: K, unit: 'm²/s', tone: 'accent' },
            { label: md`rotation $\omega_z$ ($r \neq 0$)`, value: '0', unit: 'rad/s', tone: 'good' },
          ]}
        />
      }
      footer="Try this: slide the probe from r = 0.4 m out to r = 1.6 m. The speed drops 4× and the lap time grows 16× — inner fluid overtakes outer fluid — yet r·vθ stays equal to K on every circle and the equipotential rays always cross the circles at right angles. Flip the swirl direction: only the signs of K and vθ change (vθ < 0 means clockwise); the pattern of circles and rays is the same."
    >
      <FlowField
        x={[-2, 2]}
        y={[-2, 2]}
        psi={psi}
        phi={phi}
        vel={vel}
        psiLevels={psiLevels}
        phiLevels={phiLevels}
        equipotentials={showPhi}
        particles={110}
        Uref={0.5}
        quiver={arrows ? 13 : false}
        highlight={highlight}
        markers={[{ x: 0, y: 0, kind: 'vortex', label: 'r = 0 (singular)' }]}
        overlay={({ sx, sy }) => {
          const px = sx(rp * Math.cos(probeAngle))
          const py = sy(rp * Math.sin(probeAngle))
          // screen direction of v_θ at 45°: counter-clockwise tangent is (−sin, cos) in math axes → (−sin, −cos) on screen
          const dx = -Math.sin(probeAngle) * dir
          const dy = -Math.cos(probeAngle) * dir
          return (
            <g>
              <defs>
                <marker id={uid} viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                  <path d="M0 0L10 5L0 10z" fill="var(--plot-3)" />
                </marker>
              </defs>
              <line x1={px} y1={py} x2={px + arrowPx * dx} y2={py + arrowPx * dy} stroke="var(--plot-3)" strokeWidth={3} markerEnd={`url(#${uid})`} />
              <circle cx={px} cy={py} r={4} fill="var(--plot-3)" stroke="var(--surface)" strokeWidth={1.5} />
              <text x={px + 8} y={py + 16} className="text-[11px] font-semibold" fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                vθ = {vth.toFixed(2)} m/s
              </text>
            </g>
          )
        }}
      />
    </SimPanel>
  )
}
