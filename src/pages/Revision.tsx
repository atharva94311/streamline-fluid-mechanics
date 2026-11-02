import { useMemo, useState } from 'react'
import { Brain, CheckCircle2, ChevronDown, FileStack, ListChecks, RotateCcw, Shuffle, Sigma, Target, XCircle } from 'lucide-react'
import { UNITS } from '@/content/units'
import { TOPICS } from '@/content/registry'
import { progress, useProgress } from '@/lib/store'
import type { Flashcard, FormulaDef, QuizQ, TopicModule, UnitId } from '@/lib/types'
import { UNIT_THEME } from '@/lib/theme'
import { navigate, topicHref } from '@/lib/router'
import { Md, MathBlock, M } from '@/kit/Md'
import { Origin } from '@/kit/SourceChip'
import { Segmented } from '@/kit/controls'
import { Takeaways } from '@/kit/Concept'
import { shuffledOrder } from '@/kit/Quiz'
import { cx } from '@/kit/cx'

const TABS = [
  { id: 'flashcards', label: 'Flashcards', icon: FileStack },
  { id: 'quiz', label: 'Rapid quiz', icon: Target },
  { id: 'formulas', label: 'Formula drill', icon: Sigma },
  { id: 'summaries', label: 'Topic summaries', icon: ListChecks },
  { id: 'weak', label: 'Weak spots', icon: Brain },
] as const

type Scope = UnitId | 'all'
const inScope = (m: TopicModule, s: Scope) => s === 'all' || m.meta.unit === s
const scopeOptions = [{ value: 'all' as Scope, label: 'All units' }, ...UNITS.map((u) => ({ value: u.id as Scope, label: `Unit ${u.id}` }))]

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed * 9301 + 49297
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Revision({ tab }: { tab?: string }) {
  const active = TABS.find((t) => t.id === tab)?.id ?? 'flashcards'
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Revision mode</h1>
        <p className="mt-1 text-ink-2">Spaced-repetition flashcards, rapid-fire quizzes, formula recall, one-page summaries and a list of your weak spots.</p>
      </header>
      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/revision/${t.id}`)}
              className={cx(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                active === t.id ? 'bg-indigo-600 text-white shadow' : 'text-ink-2 hover:bg-surface-2',
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>
      {active === 'flashcards' ? <Flashcards /> : null}
      {active === 'quiz' ? <RapidQuiz /> : null}
      {active === 'formulas' ? <FormulaDrill /> : null}
      {active === 'summaries' ? <Summaries /> : null}
      {active === 'weak' ? <WeakSpots /> : null}
    </div>
  )
}

function Flashcards() {
  const p = useProgress()
  const [scope, setScope] = useState<Scope>('all')
  const [flipped, setFlipped] = useState(false)
  const [skip, setSkip] = useState(0)
  const now = Date.now()
  const deck = useMemo(() => {
    const cards: { m: TopicModule; c: Flashcard; due: number; box: number; seen: number }[] = []
    for (const m of TOPICS) {
      if (!inScope(m, scope)) continue
      for (const c of m.flashcards) {
        const st = p.cards[`${m.meta.id}:${c.id}`]
        cards.push({ m, c, due: st?.due ?? 0, box: st?.box ?? 0, seen: st?.seen ?? 0 })
      }
    }
    return cards.sort((a, b) => a.due - b.due || a.seen - b.seen)
  }, [p.cards, scope])
  const due = deck.filter((d) => d.due <= now)
  const queue = due.length ? due : deck
  const card = queue.length ? queue[skip % queue.length] : null
  const boxes = [0, 1, 2, 3, 4].map((b) => deck.filter((d) => d.seen && d.box === b).length)

  const grade = (g: 'again' | 'good' | 'easy') => {
    if (!card) return
    progress.gradeCard(card.m.meta.id, card.c.id, g)
    setFlipped(false)
    setSkip(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-md"><Segmented value={scope} onChange={(v) => { setScope(v); setSkip(0); setFlipped(false) }} options={scopeOptions} /></div>
        <div className="flex gap-2 text-xs text-ink-3">
          <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{due.length} due</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1">{deck.length} cards</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1" title="Leitner boxes (seen cards): higher box = better known">boxes {boxes.join(' · ')}</span>
        </div>
      </div>
      {card ? (
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className={cx(
              'relative block min-h-[280px] w-full rounded-3xl border-2 p-8 text-left shadow-lg transition',
              flipped ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5' : cx('bg-surface', UNIT_THEME[card.m.meta.unit].border),
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-2 text-xs font-semibold text-ink-3">
              <span>{card.m.meta.unit} · {card.m.meta.title}</span>
              <span>{flipped ? 'Answer' : 'Question — click to flip'}</span>
            </div>
            <Md className="text-lg">{flipped ? card.c.back : card.c.front}</Md>
            {flipped && card.c.src ? <div className="mt-4"><Origin src={card.c.src} size="xs" /></div> : null}
          </button>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {flipped ? (
              <>
                <button type="button" onClick={() => grade('again')} className="btn-primary bg-red-500 hover:bg-red-600">Again</button>
                <button type="button" onClick={() => grade('good')} className="btn-primary bg-indigo-600 hover:bg-indigo-700">Good</button>
                <button type="button" onClick={() => grade('easy')} className="btn-primary bg-emerald-600 hover:bg-emerald-700">Easy</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setFlipped(true)} className="btn-primary bg-indigo-600 hover:bg-indigo-700">Show answer</button>
                <button type="button" onClick={() => { setSkip((s) => s + 1); setFlipped(false) }} className="btn-ghost">Skip</button>
              </>
            )}
          </div>
          {!due.length ? <p className="mt-3 text-center text-sm text-ink-3">Nothing due right now — reviewing ahead of schedule.</p> : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">No flashcards in this scope yet.</div>
      )}
    </div>
  )
}

function RapidQuiz() {
  const [scope, setScope] = useState<Scope>('all')
  const [count, setCount] = useState<number>(10)
  const [seed, setSeed] = useState(1)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const pool = useMemo(() => {
    const qs: { m: TopicModule; q: QuizQ }[] = []
    for (const m of TOPICS) if (inScope(m, scope)) m.quiz.forEach((q) => qs.push({ m, q }))
    return shuffle(qs, seed).slice(0, count)
  }, [scope, count, seed])
  const restart = () => {
    setSeed((s) => s + 1)
    setIdx(0)
    setAnswers({})
  }
  const finished = idx >= pool.length
  const score = pool.filter((x, i) => answers[i] === x.q.answer).length

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <Segmented value={scope} onChange={(v) => { setScope(v); setIdx(0); setAnswers({}) }} options={scopeOptions} />
        <Segmented value={count} onChange={(v) => { setCount(v); setIdx(0); setAnswers({}) }} options={[{ value: 10, label: '10 Qs' }, { value: 20, label: '20 Qs' }, { value: 1000, label: 'All' }]} />
        <button type="button" onClick={restart} className="btn-ghost"><Shuffle className="h-4 w-4" /> New quiz</button>
      </div>
      {!pool.length ? <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">No questions in this scope yet.</div> : null}
      {pool.length && !finished ? (
        <QuizCard
          key={`${seed}-${idx}`}
          item={pool[idx]}
          n={idx + 1}
          total={pool.length}
          picked={answers[idx]}
          onPick={(choice) => {
            setAnswers((a) => ({ ...a, [idx]: choice }))
            progress.recordQuiz(pool[idx].m.meta.id, pool[idx].q.id, choice, choice === pool[idx].q.answer)
          }}
          onNext={() => setIdx((i) => i + 1)}
        />
      ) : null}
      {pool.length && finished ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-surface p-6 text-center">
            <div className="font-display text-4xl font-bold">{score}/{pool.length}</div>
            <div className="mt-1 text-ink-3">{score === pool.length ? 'Perfect score!' : 'Review the misses below, then try a new quiz.'}</div>
            <button type="button" onClick={restart} className="btn-primary mt-4 bg-indigo-600 hover:bg-indigo-700"><RotateCcw className="h-4 w-4" /> New quiz</button>
          </div>
          {pool.map((x, i) =>
            answers[i] !== x.q.answer ? (
              <div key={i} className="rounded-2xl border border-red-200 bg-surface p-4 dark:border-red-500/30">
                <a href={topicHref(x.m.meta.id)} className="text-xs font-semibold text-ink-3 no-underline hover:underline">{x.m.meta.title}</a>
                <Md className="md-tight mt-1 font-medium">{x.q.q}</Md>
                <div className="mt-2 text-sm"><span className="font-semibold text-emerald-700 dark:text-emerald-300">Answer: </span><Md inline>{x.q.options[x.q.answer]}</Md></div>
                <div className="mt-1 text-sm text-ink-2"><Md inline>{x.q.explain}</Md></div>
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  )
}

function QuizCard({ item, n, total, picked, onPick, onNext }: { item: { m: TopicModule; q: QuizQ }; n: number; total: number; picked?: number; onPick: (i: number) => void; onNext: () => void }) {
  const order = shuffledOrder(item.q.id, item.q.options.length)
  const answered = picked != null
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-3">
        <span>Question {n} of {total}</span>
        <span>{item.m.meta.title}</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((n - 1) / total) * 100}%` }} /></div>
      <Md className="md-tight text-lg font-medium">{item.q.q}</Md>
      <div className="mt-4 grid gap-2">
        {order.map((oi, k) => (
          <button
            key={oi}
            type="button"
            disabled={answered}
            onClick={() => onPick(oi)}
            className={cx(
              'flex items-start gap-3 rounded-xl border px-4 py-2.5 text-left transition',
              !answered && 'border-line hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10',
              answered && oi === item.q.answer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
              answered && picked === oi && oi !== item.q.answer && 'border-red-400 bg-red-50 dark:bg-red-500/10',
              answered && oi !== item.q.answer && picked !== oi && 'border-line opacity-60',
            )}
          >
            <span className="font-mono text-xs font-bold text-ink-3">{String.fromCharCode(65 + k)}</span>
            <span className="flex-1"><Md inline>{item.q.options[oi]}</Md></span>
            {answered && oi === item.q.answer ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
            {answered && picked === oi && oi !== item.q.answer ? <XCircle className="h-5 w-5 text-red-500" /> : null}
          </button>
        ))}
      </div>
      {answered ? (
        <div className="mt-4 space-y-3">
          <div className={cx('rounded-xl px-4 py-3 text-sm', picked === item.q.answer ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10')}>
            <span className="font-semibold">{picked === item.q.answer ? 'Correct. ' : 'Not quite. '}</span>
            <Md inline>{item.q.explain}</Md>
          </div>
          <button type="button" onClick={onNext} className="btn-primary bg-indigo-600 hover:bg-indigo-700">{n < total ? 'Next question' : 'See results'}</button>
        </div>
      ) : null}
    </div>
  )
}

function FormulaDrill() {
  const [scope, setScope] = useState<Scope>('all')
  const [seed, setSeed] = useState(1)
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const [tally, setTally] = useState({ ok: 0, miss: 0 })
  const list = useMemo(() => {
    const fs: { m: TopicModule; f: FormulaDef }[] = []
    for (const m of TOPICS) if (inScope(m, scope)) m.formulas.forEach((f) => fs.push({ m, f }))
    return shuffle(fs, seed)
  }, [scope, seed])
  const cur = list.length ? list[i % list.length] : null
  const next = (ok: boolean) => {
    setTally((t) => ({ ok: t.ok + (ok ? 1 : 0), miss: t.miss + (ok ? 0 : 1) }))
    setShow(false)
    setI((x) => x + 1)
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-md"><Segmented value={scope} onChange={(v) => { setScope(v); setI(0); setShow(false) }} options={scopeOptions} /></div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{tally.ok} recalled</span>
          <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">{tally.miss} missed</span>
          <button type="button" onClick={() => { setSeed((s) => s + 1); setI(0); setShow(false); setTally({ ok: 0, miss: 0 }) }} className="btn-ghost"><Shuffle className="h-4 w-4" /> Reshuffle</button>
        </div>
      </div>
      {cur ? (
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <div className="text-xs font-semibold text-ink-3">{cur.m.meta.title} · {(i % list.length) + 1}/{list.length}</div>
          <div className="mt-2 font-display text-2xl font-bold">{cur.f.name}</div>
          <p className="mt-1 text-sm text-ink-3">Write the equation, name every symbol and state when it is valid — then reveal.</p>
          {show ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 dark:bg-indigo-500/10"><MathBlock tex={cur.f.tex} tag={cur.f.tag} /></div>
              {cur.f.vars?.length ? (
                <ul className="grid gap-1 text-sm text-ink-2 sm:grid-cols-2">
                  {cur.f.vars.map((v, k) => (
                    <li key={k}><M tex={v.sym} /> — <Md inline>{v.desc}</Md></li>
                  ))}
                </ul>
              ) : null}
              {cur.f.conditions?.length ? (
                <div className="text-sm text-ink-2"><span className="font-semibold">Valid when: </span>{cur.f.conditions.map((c, k) => <span key={k}><Md inline>{c}</Md>{k < cur.f.conditions!.length - 1 ? '; ' : ''}</span>)}</div>
              ) : null}
              <div className="flex gap-2">
                <button type="button" onClick={() => next(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-700">I had it</button>
                <button type="button" onClick={() => next(false)} className="btn-primary bg-red-500 hover:bg-red-600">I missed it</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShow(true)} className="btn-primary mt-4 bg-indigo-600 hover:bg-indigo-700">Reveal formula</button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ink-3">No formulas in this scope yet.</div>
      )}
    </div>
  )
}

function Summaries() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  return (
    <div className="space-y-8">
      {UNITS.map((u) => (
        <section key={u.id}>
          <h2 className={cx('mb-3 font-display text-xl font-bold', UNIT_THEME[u.id].text)}>Unit {u.id} · {u.title}</h2>
          <div className="space-y-2">
            {TOPICS.filter((m) => m.meta.unit === u.id).map((m) => {
              const isOpen = open[m.meta.id] ?? false
              return (
                <div key={m.meta.id} className="rounded-2xl border border-line bg-surface">
                  <button type="button" onClick={() => setOpen((o) => ({ ...o, [m.meta.id]: !isOpen }))} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <ChevronDown className={cx('h-4 w-4 text-ink-3 transition', isOpen && 'rotate-180')} />
                    <span className="flex-1 font-semibold text-ink">{m.meta.title}</span>
                    <span className="text-xs text-ink-3">{m.takeaways.length} points</span>
                  </button>
                  {isOpen ? <div className="px-4 pb-4"><Takeaways items={m.takeaways} /></div> : null}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function WeakSpots() {
  const p = useProgress()
  const wrongQuiz: { m: TopicModule; q: QuizQ }[] = []
  const reviewPractice: { m: TopicModule; id: string; q: string }[] = []
  const notUnderstood: { m: TopicModule; id: string; title: string }[] = []
  for (const m of TOPICS) {
    m.quiz.forEach((q) => { if (p.quiz[`${m.meta.id}:${q.id}`] && !p.quiz[`${m.meta.id}:${q.id}`].ok) wrongQuiz.push({ m, q }) })
    m.practice.forEach((x) => { if (p.practice[`${m.meta.id}:${x.id}`] && !p.practice[`${m.meta.id}:${x.id}`].ok) reviewPractice.push({ m, id: x.id, q: x.q }) })
    if (p.visited[m.meta.id]) m.meta.concepts.forEach((c) => { if (!p.concepts[`${m.meta.id}:${c.id}`]) notUnderstood.push({ m, id: c.id, title: c.title }) })
  }
  const Empty = ({ t }: { t: string }) => <div className="rounded-xl border border-dashed border-line p-4 text-sm text-ink-3">{t}</div>
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-2 font-display text-lg font-bold">Quiz questions you missed ({wrongQuiz.length})</h3>
        <div className="space-y-2">
          {wrongQuiz.length ? wrongQuiz.map(({ m, q }) => (
            <a key={`${m.meta.id}-${q.id}`} href={topicHref(m.meta.id)} className="block rounded-xl border border-line bg-surface px-4 py-3 no-underline hover:border-ink-3">
              <div className="text-xs font-semibold text-ink-3">{m.meta.title}</div>
              <Md className="md-tight text-sm text-ink">{q.q}</Md>
            </a>
          )) : <Empty t="No missed quiz questions recorded. Answer topic quizzes or a rapid quiz to populate this." />}
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-display text-lg font-bold">Practice marked “needs review” ({reviewPractice.length})</h3>
        <div className="space-y-2">
          {reviewPractice.length ? reviewPractice.map((x) => (
            <a key={`${x.m.meta.id}-${x.id}`} href={topicHref(x.m.meta.id, `pr-${x.id}`)} className="block rounded-xl border border-line bg-surface px-4 py-3 no-underline hover:border-ink-3">
              <div className="text-xs font-semibold text-ink-3">{x.m.meta.title}</div>
              <Md className="md-tight text-sm text-ink">{x.q}</Md>
            </a>
          )) : <Empty t="Nothing flagged for review." />}
        </div>
      </section>
      <section className="lg:col-span-2">
        <h3 className="mb-2 font-display text-lg font-bold">Concepts opened but not yet marked understood ({notUnderstood.length})</h3>
        <div className="flex flex-wrap gap-2">
          {notUnderstood.length ? notUnderstood.map((x) => (
            <a key={`${x.m.meta.id}-${x.id}`} href={topicHref(x.m.meta.id, x.id)} className={cx('rounded-full px-3 py-1 text-sm font-medium no-underline', UNIT_THEME[x.m.meta.unit].soft, UNIT_THEME[x.m.meta.unit].text)}>
              {x.title}
            </a>
          )) : <Empty t="All concepts in the topics you have opened are marked understood." />}
        </div>
      </section>
    </div>
  )
}
