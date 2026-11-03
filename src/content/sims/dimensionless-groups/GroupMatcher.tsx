/**
 * Concept "common-groups": click-to-match game built on the Lecture 13 slide 21 table.
 * Pick a group on the left, then its force-ratio interpretation (or its type of application) on the right.
 * Cauchy and Mach share the same interpretation and application, exactly as on the slide.
 */
import { useMemo, useState } from 'react'
import { Md, Segmented, SimPanel, md, num } from '@/kit'

interface Group {
  id: string
  tex: string
  name: string
  ratio: string
  app: string
}

const GROUPS: Group[] = [
  { id: 'Re', tex: md`$\dfrac{\rho V\ell}{\mu}$`, name: 'Reynolds', ratio: 'inertia ÷ viscous force', app: 'Generally important in all types of fluid dynamics problems' },
  { id: 'Fr', tex: md`$\dfrac{V}{\sqrt{g\ell}}$`, name: 'Froude', ratio: 'inertia ÷ gravitational force', app: 'Flow with a free surface' },
  { id: 'Eu', tex: md`$\dfrac{p}{\rho V^2}$`, name: 'Euler', ratio: 'pressure force ÷ inertia', app: 'Problems where pressure, or pressure differences, are of interest' },
  { id: 'Ca', tex: md`$\dfrac{\rho V^2}{E_v}$`, name: 'Cauchy', ratio: 'inertia ÷ compressibility force', app: 'Flows in which fluid compressibility is important' },
  { id: 'Ma', tex: md`$\dfrac{V}{c}$`, name: 'Mach', ratio: 'inertia ÷ compressibility force', app: 'Flows in which fluid compressibility is important' },
  { id: 'St', tex: md`$\dfrac{\omega\ell}{V}$`, name: 'Strouhal', ratio: 'inertia (local) ÷ inertia (convective)', app: 'Unsteady flow with a characteristic oscillation frequency or a rotating boundary' },
  { id: 'We', tex: md`$\dfrac{\rho V^2\ell}{\sigma}$`, name: 'Weber', ratio: 'inertia ÷ surface-tension force', app: 'Problems in which surface tension is important' },
]

type Mode = 'ratio' | 'app'

function shuffled<T>(arr: T[], seed: number): T[] {
  const rnd = num.seededRandom(seed)
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function GroupMatcher() {
  const [mode, setMode] = useState<Mode>('ratio')
  const [round, setRound] = useState(1)
  const [sel, setSel] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [tries, setTries] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const key = (g: Group) => (mode === 'ratio' ? g.ratio : g.app)
  const left = useMemo(() => shuffled(GROUPS, 7 * round + 1), [round])
  const right = useMemo(() => shuffled(Array.from(new Set(GROUPS.map((g) => (mode === 'ratio' ? g.ratio : g.app)))), 13 * round + (mode === 'ratio' ? 3 : 5)), [mode, round])

  const reset = (m: Mode = mode) => {
    setMode(m)
    setSel(null)
    setDone(new Set())
    setTries(0)
    setMsg(null)
    setRound((r) => r + 1)
  }

  const pick = (answer: string) => {
    if (!sel) {
      setMsg({ ok: false, text: 'First pick a group on the left.' })
      return
    }
    const g = GROUPS.find((x) => x.id === sel)!
    setTries((t) => t + 1)
    if (key(g) === answer) {
      const nd = new Set(done)
      nd.add(g.id)
      setDone(nd)
      setSel(null)
      setMsg({ ok: true, text: `Correct — the ${g.name} number: ${answer.toLowerCase()}.` })
    } else {
      setMsg({ ok: false, text: `Not quite — the ${g.name} number is not "${answer}". Think about which two forces its definition compares.` })
    }
  }

  const answerFinished = (a: string) => GROUPS.filter((g) => key(g) === a).every((g) => done.has(g.id))
  const allDone = done.size === GROUPS.length

  return (
    <SimPanel
      title="Group ↔ meaning matcher"
      subtitle="Lecture 13, slide 21 table"
      src={{ doc: 'lec13', pages: '21' }}
      controls={
        <>
          <Segmented
            label="Match each group to its…"
            value={mode}
            onChange={(m) => reset(m)}
            options={[
              { value: 'ratio', label: 'force ratio' },
              { value: 'app', label: 'application' },
            ]}
          />
          <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink-2">
            Matched <b className="text-ink">{done.size}</b> / {GROUPS.length} in <b className="text-ink">{tries}</b> tries
            {allDone ? ` — accuracy ${Math.round((100 * GROUPS.length) / Math.max(tries, 1))} %` : ''}
          </div>
          <button type="button" className="btn-ghost" onClick={() => reset()}>
            Shuffle &amp; restart
          </button>
        </>
      }
      footer={<Md>{md`**Try this:** finish the force-ratio round, then switch to "application". Notice that Cauchy and Mach share one answer — because $\rho V^2/E_v = (V/c)^2$ when $c = \sqrt{E_v/\rho}$.`}</Md>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Group</div>
          {left.map((g) => {
            const isDone = done.has(g.id)
            const isSel = sel === g.id
            return (
              <button
                key={g.id}
                type="button"
                disabled={isDone}
                onClick={() => {
                  setSel(g.id)
                  setMsg(null)
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : isSel
                      ? 'border-teal-500 bg-teal-50 text-ink ring-2 ring-teal-400/40 dark:bg-teal-500/10'
                      : 'border-line bg-surface text-ink hover:bg-surface-2'
                }`}
              >
                <span className="font-semibold">{isDone || isSel ? g.name : '?'}</span>
                <span className="text-base">
                  <Md inline>{g.tex}</Md>
                </span>
              </button>
            )
          })}
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{mode === 'ratio' ? 'Force ratio indicated' : 'Type of application'}</div>
          {right.map((a) => {
            const fin = answerFinished(a)
            return (
              <button
                key={a}
                type="button"
                disabled={fin}
                onClick={() => pick(a)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  fin
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : 'border-line bg-surface text-ink hover:bg-surface-2'
                }`}
              >
                {a}
              </button>
            )
          })}
        </div>
      </div>
      {msg ? (
        <div
          role="status"
          className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
            msg.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
          }`}
        >
          {msg.text}
        </div>
      ) : null}
    </SimPanel>
  )
}
