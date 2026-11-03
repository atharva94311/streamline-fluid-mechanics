/**
 * Concept "velocity-potential": does a potential exist?
 * Linear plane field u = a x + b y, v = c x + d y. A potential φ exists iff the flow is irrotational (c = b):
 * then ∫ V·ds from A to B is the same along every path and equals φ(B) − φ(A).
 * For c ≠ b the two paths differ by the circulation of the rectangle, Γ = (c − b)·Δx·Δy = 2ω_z·area (Stokes),
 * and a paddle wheel carried by the flow spins at ω_z = ½(c − b).
 */
import { useMemo, useRef, useState } from 'react'
import { FlowField, Readout, Segmented, SimPanel, Slider, Toggle, md, useAnimationFrame, useInView, usePrefersReducedMotion } from '@/kit'
import { PaddleWheel } from './svg'

type Key = 'corner' | 'expand' | 'shear' | 'rotate' | 'custom'
const PRESETS: Record<Exclude<Key, 'custom'>, { label: string; abcd: [number, number, number, number] }> = {
  corner: { label: 'stagnation corner', abcd: [1, 0, 0, -1] },
  expand: { label: 'uniform expansion', abcd: [0.6, 0, 0, 0.6] },
  shear: { label: 'simple shear', abcd: [0, 1, 0, 0] },
  rotate: { label: 'rigid rotation', abcd: [0, -1, 1, 0] },
}

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-1.5, 1.5]
const XA = -1.2
const YA = -0.9
const EPS = 1e-9

export function IrrotationalityLab() {
  const [key, setKey] = useState<Key>('shear')
  const [[a, b, c, d], setABCD] = useState<[number, number, number, number]>(PRESETS.shear.abcd)
  const [xB, setXB] = useState(1.1)
  const [yB, setYB] = useState(0.9)
  const [showPhi, setShowPhi] = useState(true)
  const [angle, setAngle] = useState(0)

  const setOne = (k: 0 | 1 | 2 | 3) => (val: number) => {
    setKey('custom')
    setABCD((p) => {
      const q: [number, number, number, number] = [...p]
      q[k] = Math.round(val * 100) / 100
      return q
    })
  }

  const vel = useMemo(() => (x: number, y: number): [number, number] => [a * x + b * y, c * x + d * y], [a, b, c, d])
  const irrot = Math.abs(c - b) < EPS
  const incomp = Math.abs(a + d) < EPS
  const phi = useMemo(() => (irrot ? (x: number, y: number) => 0.5 * a * x * x + b * x * y + 0.5 * d * y * y : undefined), [irrot, a, b, d])
  const psi = useMemo(() => (incomp ? (x: number, y: number) => a * x * y + 0.5 * b * y * y - 0.5 * c * x * x : undefined), [incomp, a, b, c])

  const dX = xB - XA
  const dY = yB - YA
  // path 1: A → (xB, yA) → B ;  path 2: A → (xA, yB) → B   (exact integrals of the linear field)
  const I1 = 0.5 * a * (xB * xB - XA * XA) + b * YA * dX + c * xB * dY + 0.5 * d * (yB * yB - YA * YA)
  const I2 = c * XA * dY + 0.5 * d * (yB * yB - YA * YA) + 0.5 * a * (xB * xB - XA * XA) + b * yB * dX
  const gamma = I1 - I2 // = (c − b) Δx Δy, counter-clockwise round the rectangle
  const omega = 0.5 * (c - b)
  const div = a + d

  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const reduced = usePrefersReducedMotion()
  useAnimationFrame((dt) => setAngle((th) => (th + omega * dt) % (2 * Math.PI)), inView && !reduced && Math.abs(omega) > EPS)

  const cxm = 0.5 * (XA + xB)
  const cym = 0.5 * (YA + yB)
  const z = (v: number) => (Math.abs(v) < 5e-10 ? 0 : v)

  return (
    <SimPanel
      title="Does a velocity potential exist? — path test & paddle wheel"
      subtitle={md`$u = ax + by,\ v = cx + dy$; a potential needs $\partial v/\partial x = \partial u/\partial y$, i.e. $c = b$`}
      wide
      controls={
        <>
          <Segmented
            label="Preset field"
            options={[
              ...(Object.keys(PRESETS) as Exclude<Key, 'custom'>[]).map((k) => ({ value: k as Key, label: PRESETS[k].label })),
              { value: 'custom' as Key, label: 'custom' },
            ]}
            value={key}
            onChange={(k) => {
              setKey(k)
              if (k !== 'custom') setABCD(PRESETS[k].abcd)
            }}
          />
          <Slider label={md`$a = \partial u/\partial x$`} value={a} min={-1.5} max={1.5} step={0.1} onChange={setOne(0)} unit="s⁻¹" digits={2} />
          <Slider label={md`$b = \partial u/\partial y$`} value={b} min={-1.5} max={1.5} step={0.1} onChange={setOne(1)} unit="s⁻¹" digits={2} />
          <Slider label={md`$c = \partial v/\partial x$`} value={c} min={-1.5} max={1.5} step={0.1} onChange={setOne(2)} unit="s⁻¹" digits={2} />
          <Slider label={md`$d = \partial v/\partial y$`} value={d} min={-1.5} max={1.5} step={0.1} onChange={setOne(3)} unit="s⁻¹" digits={2} />
          <Slider label="corner $B$: $x_B$" value={xB} min={-0.7} max={1.8} step={0.05} onChange={setXB} unit="m" digits={2} />
          <Slider label="corner $B$: $y_B$" value={yB} min={-0.4} max={1.3} step={0.05} onChange={setYB} unit="m" digits={2} />
          <Toggle label={md`draw equipotentials (when $\phi$ exists)`} checked={showPhi} onChange={setShowPhi} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\omega_z = \tfrac12(c - b)$`, value: z(omega), unit: 's⁻¹', tone: irrot ? 'good' : 'bad' },
            { label: md`$\nabla\cdot\mathbf V = a + d$`, value: z(div), unit: 's⁻¹', tone: incomp ? 'good' : 'default' },
            { label: md`$\int_A^B \mathbf V\cdot d\mathbf s$, path 1`, value: z(I1), unit: 'm²/s' },
            { label: md`$\int_A^B \mathbf V\cdot d\mathbf s$, path 2`, value: z(I2), unit: 'm²/s' },
            { label: md`difference $=\oint \mathbf V\cdot d\mathbf s$`, value: z(gamma), unit: 'm²/s', tone: irrot ? 'good' : 'bad' },
            {
              label: md`$\phi(B) - \phi(A)$`,
              value: irrot ? z(I1) : 'no φ',
              unit: irrot ? 'm²/s' : undefined,
              tone: irrot ? 'good' : 'bad',
            },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> on <i>simple shear</i> the two routes from A to B give different answers and the paddle wheel turns — so no
          single-valued φ(B) − φ(A) can exist. Now drag <i>c</i> until it equals <i>b</i>: the difference (the circulation 2ω<sub>z</sub>×area)
          drops to zero, the wheel stops and dashed equipotentials appear, crossed at right angles by the tracers. Try <i>uniform expansion</i>{' '}
          too: φ exists even though ∇·V ≠ 0 — a potential needs irrotationality, not incompressibility.
        </span>
      }
    >
      <div ref={box}>
        <FlowField
          x={X}
          y={Y}
          vel={vel}
          psi={psi}
          phi={showPhi ? phi : undefined}
          equipotentials={showPhi && !!phi}
          particles={70}
          maxHeight={400}
          overlay={({ sx, sy }) => (
            <g>
              <rect
                x={sx(XA)}
                y={sy(yB)}
                width={sx(xB) - sx(XA)}
                height={sy(YA) - sy(yB)}
                fill={irrot ? 'var(--plot-5)' : 'var(--plot-4)'}
                fillOpacity={0.06}
                stroke="none"
              />
              <path d={`M${sx(XA)} ${sy(YA)} H${sx(xB)} V${sy(yB)}`} fill="none" stroke="var(--plot-1)" strokeWidth={3} strokeLinejoin="round" />
              <path
                d={`M${sx(XA)} ${sy(YA)} V${sy(yB)} H${sx(xB)}`}
                fill="none"
                stroke="var(--plot-4)"
                strokeWidth={3}
                strokeDasharray="7 5"
                strokeLinejoin="round"
              />
              <text x={sx(0.5 * (XA + xB))} y={sy(YA) + 16} textAnchor="middle" className="fill-indigo-700 text-[11px] font-semibold dark:fill-indigo-300" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                path 1
              </text>
              <text x={sx(XA) - 6} y={sy(0.5 * (YA + yB))} textAnchor="end" className="fill-rose-700 text-[11px] font-semibold dark:fill-rose-300" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                path 2
              </text>
              {[
                [XA, YA, 'A'],
                [xB, yB, 'B'],
              ].map(([px, py, lab]) => (
                <g key={lab as string}>
                  <circle cx={sx(px as number)} cy={sy(py as number)} r={5} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1.5} />
                  <text x={sx(px as number) + 8} y={sy(py as number) - 7} className="fill-ink text-[12px] font-bold" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3}>
                    {lab}
                  </text>
                </g>
              ))}
              <PaddleWheel cx={sx(cxm)} cy={sy(cym)} angle={angle} r={15} color={irrot ? 'var(--plot-5)' : 'var(--plot-6)'} />
            </g>
          )}
        />
      </div>
    </SimPanel>
  )
}
