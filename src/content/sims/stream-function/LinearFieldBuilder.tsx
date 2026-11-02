/**
 * Concept "polar-scope" (where a stream function exists): for any linear field u = ax + by, v = cx + dy
 * the "integrate u, then fix f(x) with v" recipe of the Lecture 10 in-class problem is carried out live.
 * It succeeds exactly when continuity holds (a + d = 0) — rotation (ω_z) is irrelevant.
 */
import { useMemo, useState } from 'react'
import { FlowField, Md, Readout, Segmented, SimPanel, Slider, Toggle, md, type FlowMarker } from '@/kit'
import { texNum, texPoly, type VelFn } from './fields'

type PresetKey = 'lec10' | 'corner' | 'rotation' | 'shear' | 'expansion'
const PRESETS: Record<PresetKey, { label: string; c: [number, number, number, number] }> = {
  lec10: { label: md`Lec 10: $u = 2y,\ v = 4x$`, c: [0, 2, 4, 0] },
  corner: { label: 'corner', c: [1, 0, 0, -1] },
  rotation: { label: 'rotation', c: [0, -1, 1, 0] },
  shear: { label: 'shear', c: [0, 1, 0, 0] },
  expansion: { label: 'expansion', c: [1, 0, 0, 1] },
}

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-1.5, 1.5]
const MARKERS: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation' }]

export function LinearFieldBuilder() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(2)
  const [c, setC] = useState(4)
  const [d, setD] = useState(0)
  const [lock, setLock] = useState(false)
  const dd = lock ? -a : d
  const div = a + dd
  const has = Math.abs(div) < 1e-9
  const omega = 0.5 * (c - b)
  const zero = a === 0 && b === 0 && c === 0 && dd === 0

  const vel = useMemo<VelFn>(() => (x, y) => [a * x + b * y, c * x + dd * y], [a, b, c, dd])
  const psi = useMemo(() => (has && !zero ? (x: number, y: number) => a * x * y + 0.5 * b * y * y - 0.5 * c * x * x : undefined), [has, zero, a, b, c])

  const preset = (Object.keys(PRESETS) as PresetKey[]).find((kk) => {
    const p = PRESETS[kk].c
    return p[0] === a && p[1] === b && p[2] === c && p[3] === dd
  })
  const load = (kk: PresetKey) => {
    const [pa, pb, pc, pd] = PRESETS[kk].c
    setA(pa)
    setB(pb)
    setC(pc)
    setD(pd)
    setLock(false)
  }

  const uTeX = texPoly([[a, 'x'], [b, 'y']])
  const vTeX = texPoly([[c, 'x'], [dd, 'y']])
  const step1 = texPoly([[a, 'xy'], [b / 2, 'y^2'], [1, 'f(x)']])
  const step2 = texPoly([[-a, 'y'], [-1, "f'(x)"]])
  const fprime = texPoly([[-c, 'x'], [-(a + dd), 'y']])
  const psiTeX = texPoly([[a, 'xy'], [b / 2, 'y^2'], [-c / 2, 'x^2']])
  const fTeX = Math.abs(c) < 1e-12 ? 'C' : `${texPoly([[-c / 2, 'x^2']])} + C`

  const recipe = md`
    **The Lecture 10 recipe, live:**

    1. $\pd{\psi}{y} = u = ${uTeX}$ $\;\Rightarrow\;$ $\psi = ${step1}$
    2. $-\pd{\psi}{x} = ${step2}$ must equal $v = ${vTeX}$ $\;\Rightarrow\;$ $f'(x) = ${fprime}$
    3. ${
      has
        ? md`$f'$ depends on $x$ only, so $f = ${fTeX}$ and **$\psi = ${psiTeX} + C$**.`
        : md`$f'(x)$ would have to depend on $y$ — impossible. The obstruction is exactly $\pd{u}{x} + \pd{v}{y} = a + d = ${texNum(div)} \ne 0$: **no stream function exists.**`
    }
  `

  return (
    <SimPanel
      title="Stream-function builder for u = ax + by, v = cx + dy"
      subtitle={md`does a $\psi$ exist, and what is it?`}
      wide
      controls={
        <>
          <Segmented
            label="Load a field"
            options={(Object.keys(PRESETS) as PresetKey[]).map((kk) => ({ value: kk, label: PRESETS[kk].label }))}
            value={preset ?? ('custom' as PresetKey)}
            onChange={load}
          />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <Slider label="$a$" value={a} min={-3} max={3} step={0.5} onChange={setA} unit="s⁻¹" digits={2} />
            <Slider label="$b$" value={b} min={-4} max={4} step={0.5} onChange={setB} unit="s⁻¹" digits={2} />
            <Slider label="$c$" value={c} min={-4} max={4} step={0.5} onChange={setC} unit="s⁻¹" digits={2} />
            {lock ? (
              <div className="self-end pb-1 text-sm text-ink-2">
                <Md inline>{md`$d = -a = ${texNum(-a)}$`}</Md>
              </div>
            ) : (
              <Slider label="$d$" value={d} min={-3} max={3} step={0.5} onChange={setD} unit="s⁻¹" digits={2} />
            )}
          </div>
          <Toggle label={md`enforce continuity ($d = -a$)`} checked={lock} onChange={setLock} />
        </>
      }
      readout={
        <Readout
          items={[
            { label: md`$\pd{u}{x} + \pd{v}{y} = a + d$`, value: div, unit: 's⁻¹', tone: has ? 'good' : 'bad' },
            { label: md`$\omega_z = \tfrac12(c - b)$`, value: omega, unit: 's⁻¹' },
            { label: 'stream function?', value: zero ? 'trivial (V = 0)' : has ? 'exists' : 'none', tone: has ? 'good' : 'bad' },
            { label: 'flow is', value: Math.abs(omega) < 1e-9 ? 'irrotational' : 'rotational' },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> load the Lecture 10 field — the recipe gives ψ = y² − 2x² and the flow is rotational (ω_z = 1 s⁻¹), so
          rotation is no obstacle. Now move <i>d</i> away from 0: the moment ∂u/∂x + ∂v/∂y ≠ 0, step 2 asks for an f′(x) that
          depends on y, the streamlines disappear and only velocity arrows remain. Turn on “enforce continuity” and every
          combination of a, b, c has a stream function.
        </span>
      }
    >
      <FlowField
        x={X}
        y={Y}
        psi={psi}
        vel={vel}
        quiver={has && !zero ? false : 15}
        particles={zero ? 0 : 55}
        markers={MARKERS}
        maxHeight={360}
      />
      <div className={`mt-3 rounded-xl border px-4 py-3 text-sm ${has ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'border-red-300 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/10'}`}>
        <Md className="md-tight">{recipe}</Md>
      </div>
    </SimPanel>
  )
}
