import { useMemo } from 'react'
import { CheckCircle2, CircleHelp, RotateCcw, XCircle } from 'lucide-react'
import type { QuizQ } from '@/lib/types'
import { progress, useProgress } from '@/lib/store'
import { lookup, useRevealAll, useTopic } from './context'
import { Md } from './Md'
import { Origin } from './SourceChip'
import { cx } from './cx'

/** Deterministic option order per question id, so the correct answer is not always in the same slot. */
export function shuffledOrder(id: string, n: number): number[] {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  const idx = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    const j = Math.abs(h) % (i + 1)
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

export function QuizItem({ q, n, topicId, onAnswered }: { q: QuizQ; n?: number; topicId: string; onAnswered?: (ok: boolean) => void }) {
  const revealAll = useRevealAll()
  const store = useProgress()
  const rec = store.quiz[progress.key(topicId, q.id)]
  const order = useMemo(() => shuffledOrder(q.id, q.options.length), [q.id, q.options.length])
  const answered = !!rec || revealAll
  const choose = (i: number) => {
    if (rec) return
    const ok = i === q.answer
    progress.recordQuiz(topicId, q.id, i, ok)
    onAnswered?.(ok)
  }
  return (
    <div className="quiz-item rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          {n ?? <CircleHelp className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <Md className="md-tight font-medium">{q.q}</Md>
        </div>
        {q.src ? <Origin src={q.src} size="xs" /> : null}
      </div>
      <div className="grid gap-2">
        {order.map((oi, k) => {
          const isAns = oi === q.answer
          const picked = rec?.choice === oi
          return (
            <button
              key={oi}
              type="button"
              disabled={answered}
              onClick={() => choose(oi)}
              className={cx(
                'flex items-start gap-3 rounded-xl border px-3 py-2 text-left text-[0.95rem] transition',
                !answered && 'border-line bg-surface hover:border-violet-400 hover:bg-violet-50/60 dark:hover:bg-violet-500/10',
                answered && isAns && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
                answered && picked && !isAns && 'border-red-400 bg-red-50 dark:bg-red-500/10',
                answered && !isAns && !picked && 'border-line opacity-70',
              )}
            >
              <span className="mt-0.5 font-mono text-xs font-bold text-ink-3">{String.fromCharCode(65 + k)}</span>
              <span className="min-w-0 flex-1">
                <Md inline>{q.options[oi]}</Md>
              </span>
              {answered && isAns ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : null}
              {answered && picked && !isAns ? <XCircle className="h-5 w-5 shrink-0 text-red-500" /> : null}
            </button>
          )
        })}
      </div>
      {answered ? (
        <div className={cx('mt-3 rounded-xl px-3 py-2 text-sm', rec && !rec.ok ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10')}>
          <span className="font-semibold">{rec ? (rec.ok ? 'Correct. ' : 'Not quite. ') : 'Explanation. '}</span>
          <Md inline>{q.explain}</Md>
        </div>
      ) : null}
    </div>
  )
}

/** A scored set of MCQs; answers persist and count toward progress. */
export function QuizBlock({ questions, topicId, title = 'Check your understanding' }: { questions: QuizQ[]; topicId?: string; title?: string }) {
  const topic = useTopic()
  const tId = topicId ?? topic?.meta.id ?? 'global'
  const store = useProgress()
  const answered = questions.filter((q) => store.quiz[progress.key(tId, q.id)])
  const correct = answered.filter((q) => store.quiz[progress.key(tId, q.id)]?.ok)
  return (
    <div className="quiz-block space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="font-display text-lg font-bold text-ink">{title}</h4>
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          {correct.length}/{questions.length} correct · {answered.length} answered
        </span>
        {answered.length ? (
          <button type="button" onClick={() => progress.clearQuiz(tId, questions.map((q) => q.id))} className="btn-ghost ml-auto text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        ) : null}
      </div>
      {questions.map((q, i) => (
        <QuizItem key={q.id} q={q} n={i + 1} topicId={tId} />
      ))}
    </div>
  )
}

/** Inline concept check: <QuickCheck ids={['q-rot-1']} /> pulls questions from the topic's `quiz`. */
export function QuickCheck({ ids, title = 'Quick check' }: { ids: string[]; title?: string }) {
  const topic = useTopic()
  const qs = ids.map((i) => lookup(topic?.quiz, i, 'Quiz question'))
  return <QuizBlock questions={qs} title={title} />
}
