/**
 * Concept "finding-phi-psi": step-through integrator ψ → φ and φ → ψ with exact rational arithmetic.
 * Course convention: u = ∂φ/∂x = ∂ψ/∂y, v = ∂φ/∂y = −∂ψ/∂x.  Fox convention (Eq. 6.29): u = −∂φ/∂x, v = −∂φ/∂y.
 * When the flow is rotational (ψ → φ) or compressible (φ → ψ) the "constant" of integration comes out depending on
 * the wrong variable — the method itself detects that the companion function does not exist.
 */
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsDown, RotateCcw } from 'lucide-react'
import { FlowField, Md, Readout, Segmented, SimPanel, Slider, cx, md, type FlowMarker } from '@/kit'
import { fr, pAdd, pDx, pDy, pFn, pHasX, pHasY, pIntX, pIntY, pIsZero, pLap, pNeg, pScale, pSub, pTeX, poly, type Poly } from './poly'

type Dir = 'psi2phi' | 'phi2psi'
type Conv = 'course' | 'fox'
interface Case {
  id: string
  label: string
  dir: Dir
  given: Poly
  note: string
}

const CASES: Case[] = [
  {
    id: 'lec11', label: 'Lec 11, problem 1', dir: 'psi2phi', given: poly([5, 2, 1], [fr(-5, 3), 0, 3]),
    note: md`Lecture 11, slide 2 (problem 1): find the velocity potential for $\psi = 5x^2y - \tfrac53y^3$.`,
  },
  {
    id: 'fox', label: 'Fox Ex. 6.10', dir: 'psi2phi', given: poly([3, 2, 0], [-3, 0, 2]),
    note: md`Fox Example 6.10 (p. 224): $\psi = ax^2 - ay^2$ with $a = 3\ \mathrm{s^{-1}}$ — show the flow is irrotational and find $\phi$.`,
  },
  {
    id: 'lec11b', label: 'Lec 11, problem 2 (ψ)', dir: 'phi2psi', given: poly([8, 1, 1]),
    note: md`Lecture 11, slide 2 (problem 2, first part): find the stream function for $\phi = 8xy$ (m²/s).`,
  },
  {
    id: 'lec10', label: 'u = 2y, v = 4x', dir: 'psi2phi', given: poly([1, 0, 2], [-2, 2, 0]),
    note: md`The Lecture 10 (slide 2) field $u = 2y,\ v = 4x$ has $\psi = y^2 - 2x^2$. Can we also find a $\phi$?`,
  },
  {
    id: 'expand', label: 'φ = x² + y²', dir: 'phi2psi', given: poly([1, 2, 0], [1, 0, 2]),
    note: md`A radial expansion $\phi = x^2 + y^2$. Can we find a stream function?`,
  },
  { id: 'custom', label: 'custom', dir: 'psi2phi', given: [], note: md`Your own quadratic $a x^2 + b xy + c y^2$.` },
]

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-1.5, 1.5]
const ORIGIN: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation' }]

interface StepOut {
  title: string
  body: string
  tone?: 'good' | 'bad'
}

function solve(dir: Dir, given: Poly, s: 1 | -1) {
  const T = pTeX
  const steps: StepOut[] = []
  const minus = s < 0 ? '-' : ''
  if (dir === 'psi2phi') {
    const u = pDy(given)
    const v = pNeg(pDx(given))
    steps.push({
      title: 'Velocity from ψ',
      body: md`$u = \pd{\psi}{y} = ${T(u)}, \qquad v = -\pd{\psi}{x} = ${T(v)}$`,
    })
    const curl = pSub(pDx(v), pDy(u))
    const irrot = pIsZero(curl)
    steps.push({
      title: 'Is a potential possible? (irrotationality)',
      body: md`$\pd{v}{x} - \pd{u}{y} = (${T(pDx(v))}) - (${T(pDy(u))}) = ${T(curl)}$ ${irrot ? md`→ irrotational, so $\phi$ exists (equivalently $\nabla^2\psi = 0$).` : md`$\ne 0$ → **rotational**: no $\phi$ can exist. Carry on and watch the method break.`}`,
      tone: irrot ? 'good' : 'bad',
    })
    const su = pScale(u, s)
    const P = pIntX(su)
    steps.push({
      title: 'Integrate the x-relation',
      body: md`$\pd{\phi}{x} = ${minus}u = ${T(su)} \;\Rightarrow\; \phi = \int (${T(su)})\,dx = ${T(P)} + f(y)$ — the "constant" may depend on $y$.`,
    })
    const sv = pScale(v, s)
    const R = pSub(sv, pDy(P))
    steps.push({
      title: 'Differentiate in y and match the y-relation',
      body: md`$\pd{\phi}{y} = ${T(pDy(P))} + f'(y)$ must equal $${minus}v = ${T(sv)}$ $\;\Rightarrow\; f'(y) = ${T(R)}$`,
    })
    const ok = !pHasX(R)
    if (!ok) {
      steps.push({
        title: 'Contradiction',
        body: md`$f'(y) = ${T(R)}$ depends on $x$ — impossible for a function of $y$ alone. **No velocity potential exists**: the flow is rotational.`,
        tone: 'bad',
      })
      return { steps, found: undefined as Poly | undefined, check: curl }
    }
    const f = pIntY(R)
    steps.push({ title: 'Integrate for f(y)', body: md`$f(y) = \int (${T(R)})\,dy = ${pIsZero(f) ? 'C' : `${T(f)} + C`}$` })
    const phi = pAdd(P, f)
    steps.push({
      title: 'Result and check',
      body: md`$\phi = ${T(phi)} + C$. Check: $${minus}\pd{\phi}{x} = ${T(pScale(pDx(phi), s))} = u$ ✓, $\ ${minus}\pd{\phi}{y} = ${T(pScale(pDy(phi), s))} = v$ ✓, and $\nabla^2\phi = ${T(pLap(phi))}$.`,
      tone: 'good',
    })
    return { steps, found: phi, check: curl }
  }
  // φ → ψ
  const u = pScale(pDx(given), s)
  const v = pScale(pDy(given), s)
  steps.push({
    title: 'Velocity from φ',
    body: md`$u = ${minus}\pd{\phi}{x} = ${T(u)}, \qquad v = ${minus}\pd{\phi}{y} = ${T(v)}$`,
  })
  const div = pAdd(pDx(u), pDy(v))
  const inc = pIsZero(div)
  steps.push({
    title: 'Is a stream function possible? (continuity)',
    body: md`$\pd{u}{x} + \pd{v}{y} = ${T(div)}$ ${inc ? md`→ incompressible, so $\psi$ exists (equivalently $\nabla^2\phi = 0$).` : md`$\ne 0$ → the flow **creates volume**: no $\psi$ can exist. Carry on and watch the method break.`}`,
    tone: inc ? 'good' : 'bad',
  })
  const P = pIntY(u)
  steps.push({
    title: 'Integrate the u-relation in y',
    body: md`$\pd{\psi}{y} = u = ${T(u)} \;\Rightarrow\; \psi = \int (${T(u)})\,dy = ${T(P)} + g(x)$ — the "constant" may depend on $x$.`,
  })
  const R = pSub(pNeg(v), pDx(P))
  steps.push({
    title: 'Differentiate in x and match v',
    body: md`$-\pd{\psi}{x} = ${T(pNeg(pDx(P)))} - g'(x)$ must equal $v = ${T(v)}$ $\;\Rightarrow\; g'(x) = ${T(R)}$`,
  })
  if (pHasY(R)) {
    steps.push({
      title: 'Contradiction',
      body: md`$g'(x) = ${T(R)}$ depends on $y$ — impossible. **No stream function exists**: the flow is not incompressible.`,
      tone: 'bad',
    })
    return { steps, found: undefined as Poly | undefined, check: div }
  }
  const g = pIntX(R)
  steps.push({ title: 'Integrate for g(x)', body: md`$g(x) = \int (${T(R)})\,dx = ${pIsZero(g) ? 'C' : `${T(g)} + C`}$` })
  const psi = pAdd(P, g)
  steps.push({
    title: 'Result and check',
    body: md`$\psi = ${T(psi)} + C$. Check: $\pd{\psi}{y} = ${T(pDy(psi))} = u$ ✓, $\ -\pd{\psi}{x} = ${T(pNeg(pDx(psi)))} = v$ ✓, and $\nabla^2\psi = ${T(pLap(psi))}$.`,
    tone: 'good',
  })
  return { steps, found: psi, check: div }
}

export function PsiPhiIntegrator() {
  const [caseId, setCaseId] = useState('lec11')
  const [conv, setConv] = useState<Conv>('course')
  const [cdir, setCdir] = useState<Dir>('psi2phi')
  const [ca, setCa] = useState(1)
  const [cb, setCb] = useState(2)
  const [cc, setCc] = useState(-1)
  const [shown, setShown] = useState(1)

  const base = CASES.find((c) => c.id === caseId)!
  const isCustom = caseId === 'custom'
  const dir: Dir = isCustom ? cdir : base.dir
  const given = useMemo(() => (isCustom ? poly([ca, 2, 0], [cb, 1, 1], [cc, 0, 2]) : base.given), [isCustom, base, ca, cb, cc])
  const s: 1 | -1 = conv === 'course' ? 1 : -1
  const { steps, found } = useMemo(() => solve(dir, given, s), [dir, given, s])
  const n = steps.length
  const k = Math.min(shown, n)
  const done = k >= n

  const reset = () => setShown(1)
  const pick = (id: string) => {
    setCaseId(id)
    setShown(1)
  }

  // fields for the picture
  const gFn = useMemo(() => pFn(given), [given])
  const vel = useMemo(() => {
    if (dir === 'psi2phi') {
      const u = pFn(pDy(given))
      const v = pFn(pNeg(pDx(given)))
      return (x: number, y: number): [number, number] => [u(x, y), v(x, y)]
    }
    const u = pFn(pScale(pDx(given), s))
    const v = pFn(pScale(pDy(given), s))
    return (x: number, y: number): [number, number] => [u(x, y), v(x, y)]
  }, [dir, given, s])
  const fFn = useMemo(() => (found && !pIsZero(found) ? pFn(found) : undefined), [found])
  const showFound = done && !!fFn
  const psi = dir === 'psi2phi' ? gFn : showFound ? fFn : undefined
  const phi = dir === 'phi2psi' ? gFn : showFound ? fFn : undefined
  const nonzero = !pIsZero(given)
  const highlight = useMemo(() => [{ level: 0, color: 'var(--plot-4)', label: 'ψ = 0' }], [])

  const givenName = dir === 'psi2phi' ? '\\psi' : '\\phi'
  const findName = dir === 'psi2phi' ? '\\phi' : '\\psi'

  return (
    <SimPanel
      title={dir === 'psi2phi' ? 'Step-through integrator — from ψ to φ' : 'Step-through integrator — from φ to ψ'}
      subtitle={md`given $${givenName} = ${pTeX(given)}$ → find $${findName}$`}
      wide
      controls={
        <>
          <div>
            <div className="mb-1 text-sm text-ink-2">Problem</div>
            <div className="flex flex-wrap gap-1">
              {CASES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c.id)}
                  className={cx(
                    'rounded-lg border px-2 py-1 text-xs font-semibold transition',
                    c.id === caseId ? 'border-teal-500 bg-teal-600 text-white' : 'border-line bg-surface text-ink-3 hover:text-ink',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          {isCustom ? (
            <>
              <Segmented
                label="Direction"
                options={[
                  { value: 'psi2phi' as Dir, label: 'given ψ → φ' },
                  { value: 'phi2psi' as Dir, label: 'given φ → ψ' },
                ]}
                value={cdir}
                onChange={(d) => {
                  setCdir(d)
                  reset()
                }}
              />
              <Slider label="$a$ (coefficient of $x^2$)" value={ca} min={-3} max={3} step={1} onChange={(v) => { setCa(Math.round(v)); reset() }} format={(v) => String(Math.round(v))} />
              <Slider label="$b$ (coefficient of $xy$)" value={cb} min={-3} max={3} step={1} onChange={(v) => { setCb(Math.round(v)); reset() }} format={(v) => String(Math.round(v))} />
              <Slider label="$c$ (coefficient of $y^2$)" value={cc} min={-3} max={3} step={1} onChange={(v) => { setCc(Math.round(v)); reset() }} format={(v) => String(Math.round(v))} />
            </>
          ) : null}
          <Segmented
            label="Sign convention for φ"
            options={[
              { value: 'course' as Conv, label: md`course $\mathbf V = \nabla\phi$` },
              { value: 'fox' as Conv, label: md`Fox $\mathbf V = -\nabla\phi$` },
            ]}
            value={conv}
            onChange={(c) => {
              setConv(c)
              reset()
            }}
          />
        </>
      }
      readout={
        <Readout
          cols={1}
          items={[
            { label: 'step', value: `${k} of ${n}` },
            {
              label: `result: ${dir === 'psi2phi' ? 'φ' : 'ψ'}`,
              value: done ? (found ? 'found ✓' : 'does not exist ✗') : '…',
              tone: done ? (found ? 'good' : 'bad') : 'default',
            },
          ]}
        />
      }
      footer={
        <span>
          <b>Try this:</b> step through Lecture 11's problem and watch f′(y) come out as zero. Then pick the u = 2y, v = 4x field: the
          same recipe produces f′(y) = 2x — a "constant" that depends on x — which is the algebra telling you the flow is rotational. For a
          given ψ, switch to Fox's convention: the φ you find changes sign while the picture (the flow) stays exactly the same. For a
          given φ (Lec 11, problem 2) the switch instead reverses the flow, so the ψ you find changes sign.
        </span>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
          <Md inline>{base.note}</Md>
        </div>
        <ol className="space-y-2">
          {steps.slice(0, k).map((st, i) => (
            <li
              key={i}
              className={cx(
                'rounded-xl border px-3 py-2',
                st.tone === 'good'
                  ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                  : st.tone === 'bad'
                    ? 'border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
                    : 'border-line bg-surface',
                i === k - 1 && 'ring-2 ring-teal-400/60',
              )}
            >
              <div className="mb-0.5 text-xs font-bold uppercase tracking-wider text-ink-3">
                {i + 1}. {st.title}
              </div>
              <Md className="md-tight overflow-x-auto text-sm text-ink">{st.body}</Md>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={() => setShown((v) => Math.max(1, v - 1))} disabled={k <= 1}>
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button type="button" className="btn-primary bg-teal-600 hover:bg-teal-700" onClick={() => setShown((v) => Math.min(n, v + 1))} disabled={done}>
            Next step <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className="btn-ghost" onClick={() => setShown(n)} disabled={done}>
            <ChevronsDown className="h-4 w-4" /> Show all
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Restart
          </button>
        </div>
        {nonzero ? (
          <FlowField
            x={X}
            y={Y}
            vel={vel}
            psi={psi}
            phi={phi}
            equipotentials={!!phi}
            highlight={psi ? highlight : undefined}
            particles={50}
            markers={ORIGIN}
            maxHeight={300}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-ink-3">All coefficients are zero — no flow.</div>
        )}
        <div className="text-center text-[11px] text-ink-3">
          {dir === 'psi2phi'
            ? showFound
              ? 'Solid: given streamlines · dashed: the φ you just found — they cross at right angles.'
              : 'Solid: streamlines of the given ψ. The equipotentials appear once φ has been found.'
            : showFound
              ? 'Dashed: given equipotentials · solid: the ψ you just found — they cross at right angles.'
              : 'Dashed: equipotentials of the given φ. The streamlines appear once ψ has been found.'}
        </div>
      </div>
    </SimPanel>
  )
}
