/**
 * Concept "phi-vs-psi": which flows have a stream function, which have a velocity potential, which have both?
 * ψ (single, plane) ⇐ mass conservation: plane incompressible flow. φ ⇐ irrotationality: any irrotational flow, 2-D or 3-D.
 * Click an example to see where it falls and why.
 */
import { useState } from 'react'
import { Md, cx, md } from '@/kit'
import { Tx } from './svg'

type Region = 'psi' | 'phi' | 'both' | 'none'
interface Ex {
  id: string
  short: string
  field: string
  region: Region
  at: [number, number]
  why: string
}

const EXAMPLES: Ex[] = [
  {
    id: 'lec10', short: '1', field: md`$u = 2y,\ v = 4x$ (Lecture 10, slide 2)`, region: 'psi', at: [150, 165],
    why: md`$\nabla\cdot\vb V = 0 + 0 = 0$ → a stream function exists, $\psi = y^2 - 2x^2$. But $\omega_z = \tfrac12(4 - 2) = 1\ \mathrm{s^{-1}} \ne 0$ → rotational, so **no** $\phi$.`,
  },
  {
    id: 'rigid', short: '2', field: md`rigid rotation $u = -\Omega y,\ v = \Omega x$`, region: 'psi', at: [120, 215],
    why: md`Incompressible ($\nabla\cdot\vb V = 0$), so $\psi = -\tfrac{\Omega}{2}(x^2 + y^2)$; but every particle spins at $\omega_z = \Omega$ → no velocity potential.`,
  },
  {
    id: 'expand', short: '3', field: md`radial expansion $u = kx,\ v = ky$`, region: 'phi', at: [490, 168],
    why: md`$\pd{v}{x} - \pd{u}{y} = 0$ → irrotational, $\phi = \tfrac{k}{2}(x^2 + y^2)$. But $\nabla\cdot\vb V = 2k \ne 0$: volume is created, so **no** stream function (and $\nabla^2\phi = 2k \ne 0$).`,
  },
  {
    id: '3d', short: '4', field: md`3-D field $\vb V = k(yz,\ xz,\ xy)$`, region: 'phi', at: [470, 222],
    why: md`All three rotation components vanish → $\phi = kxyz$ exists. The flow is genuinely three-dimensional, so **no single** $\psi$ can describe it — the velocity potential is the more general tool.`,
  },
  {
    id: 'lec11', short: '5', field: md`$\psi = 5x^2y - \tfrac53 y^3$ (Lecture 11, slide 2)`, region: 'both', at: [300, 138],
    why: md`$\psi$ is given (plane, incompressible) and $\nabla^2\psi = 10y - 10y = 0$ → irrotational, so $\phi = \tfrac53x^3 - 5xy^2$ also exists: a **plane potential flow**.`,
  },
  {
    id: 'fox', short: '6', field: md`$\psi = ax^2 - ay^2$ (Fox, Example 6.10)`, region: 'both', at: [282, 192],
    why: md`$\nabla^2\psi = 2a - 2a = 0$ → irrotational, so both $\psi$ and $\phi$ exist; their contour families are orthogonal hyperbolas (a flow net).`,
  },
  {
    id: 'uniform', short: '7', field: md`uniform flow $u = U,\ v = 0$`, region: 'both', at: [318, 238],
    why: md`No gradients at all: incompressible **and** irrotational. $\psi = Uy$, $\phi = Ux$.`,
  },
  {
    id: 'neither', short: '8', field: md`$u = xy,\ v = x$`, region: 'none', at: [560, 60],
    why: md`$\nabla\cdot\vb V = y \ne 0$ (not incompressible) and $\omega_z = \tfrac12(1 - x) \ne 0$ (rotational), so **neither** function exists.`,
  },
]

const REGION_TEXT: Record<Region, string> = {
  psi: 'ψ only — plane, incompressible but rotational',
  phi: 'φ only — irrotational but compressible, or three-dimensional',
  both: 'both — plane, incompressible AND irrotational (plane potential flow)',
  none: 'neither — rotational and not plane-incompressible',
}

export function ExistenceVenn() {
  const [sel, setSel] = useState<string>('lec11')
  const ex = EXAMPLES.find((e) => e.id === sel)!
  const tone = (r: Region) =>
    r === 'both' ? 'var(--plot-5)' : r === 'psi' ? 'var(--streamline)' : r === 'phi' ? 'var(--equipotential)' : 'var(--ink-3)'
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 620 300" className="mx-auto block h-auto w-full max-w-3xl" role="img" aria-label="Venn diagram of flows with a stream function and flows with a velocity potential">
        <rect x={6} y={6} width={608} height={288} rx={14} fill="var(--surface-2)" stroke="var(--line)" />
        <Tx x={20} y={28} size={12.5} math={false} cls="fill-ink-3" weight={600}>
          all flow fields
        </Tx>
        <ellipse cx={225} cy={172} rx={185} ry={108} fill="var(--streamline)" fillOpacity={0.1} stroke="var(--streamline)" strokeWidth={2} />
        <ellipse cx={395} cy={172} rx={185} ry={108} fill="var(--equipotential)" fillOpacity={0.12} stroke="var(--equipotential)" strokeWidth={2} />
        <Tx x={100} y={112} size={13} math={false} weight={700} cls="fill-blue-700 dark:fill-blue-300">
          ψ exists
        </Tx>
        <Tx x={78} y={128} size={11} math={false} cls="fill-ink-2">
          plane + incompressible
        </Tx>
        <Tx x={84} y={142} size={10.5} math={false} cls="fill-ink-3">
          (mass conservation)
        </Tx>
        <Tx x={440} y={112} size={13} math={false} weight={700} cls="fill-amber-700 dark:fill-amber-300">
          φ exists
        </Tx>
        <Tx x={422} y={128} size={11} math={false} cls="fill-ink-2">
          irrotational, 2-D or 3-D
        </Tx>
        <Tx x={446} y={142} size={10.5} math={false} cls="fill-ink-3">
          (∇ × V = 0)
        </Tx>
        <Tx x={310} y={92} size={11.5} anchor="middle" math={false} weight={700} cls="fill-emerald-700 dark:fill-emerald-300">
          both
        </Tx>
        <Tx x={310} y={106} size={10} anchor="middle" math={false} cls="fill-ink-2">
          ∇²ψ = ∇²φ = 0
        </Tx>
        {EXAMPLES.map((e) => {
          const on = e.id === sel
          return (
            <g key={e.id} onClick={() => setSel(e.id)} className="cursor-pointer">
              <circle cx={e.at[0]} cy={e.at[1]} r={on ? 13 : 11} fill={on ? tone(e.region) : 'var(--surface)'} stroke={tone(e.region)} strokeWidth={2.2} />
              <Tx x={e.at[0]} y={e.at[1] + 4.5} size={12.5} anchor="middle" math={false} weight={700} cls={on ? 'fill-white' : 'fill-ink'}>
                {e.short}
              </Tx>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-1.5">
        {EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setSel(e.id)}
            className={cx(
              'rounded-lg border px-2 py-1 text-xs transition',
              e.id === sel ? 'border-teal-500 bg-teal-50 font-semibold text-ink dark:bg-teal-500/15' : 'border-line bg-surface text-ink-2 hover:text-ink',
            )}
          >
            <span className="mr-1 font-bold">{e.short}</span>
            <Md inline>{e.field}</Md>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-3">{REGION_TEXT[ex.region]}</div>
        <Md className="md-tight text-ink-2">{ex.why}</Md>
      </div>
    </div>
  )
}
