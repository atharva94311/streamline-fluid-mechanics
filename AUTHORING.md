# Authoring guide — Streamline study platform

Audience: a CH21207 (Fluid Mechanics) student preparing for an exam. Goal: **deep conceptual understanding + exam
readiness**, not a summary. Every topic must be technically exact, beginner-friendly, visually rich and interactive.

---

## 1. What you own (and must not touch)

| You write | Never edit |
|---|---|
| `src/content/topics/<topic-id>.tsx` (one topic module) | `src/kit/**`, `src/lib/**`, `src/pages/**`, `src/components/**` |
| `src/content/sims/<topic-id>/*.tsx` (any number of sim / diagram components) | other agents' topic, sims or problem-set files |
| `src/content/problemsets/<set-file>.tsx` (only if you are a problem-set author) | `src/content/units.ts`, `src/content/registry.ts`, tests |

Need a generic helper that the kit lacks? Write it inside your own `sims/<topic-id>/` folder.
Topic and problem-set files are auto-discovered (`import.meta.glob`) — no registration needed.

## 2. Sources (single source of truth)

* Audited extraction notes (read these fully for your page ranges):
  `/private/tmp/claude-501/-Users-atharvaanand-Desktop-STUDYFLUIDSFORTEST/e91ae5a7-bf1f-4f54-a1d9-336f9ea60838/scratchpad/extract/*.md`
  (`lec09.md`, `lec10_11.md`, `lec12.md`, `lec13.md`, `fox_a.md`…`fox_d.md`, `wilkes_a.md`…`wilkes_e.md`).
* The PDFs themselves are in `public/sources/` — open a page with the Read tool (`pages: "N"`, PDF page index) when a
  detail in the notes is unclear. Lecture slide N = PDF page N. Fox: book p.221–224 = PDF 1–4, p.245–277 = PDF 5–37,
  p.293–296 = PDF 38–41. Wilkes: book page = PDF page + 479.
* Lines in the notes prefixed `[NOTE]` are the extractor's own additions, **not** source content — treat as supplementary.

### Citing (`src`)
* `{ doc: 'lec9' | 'lec10' | 'lec11' | 'lec12' | 'lec13', pages: '<slide numbers>' }`
* `{ doc: 'fox' | 'wilkes', pages: '<PRINTED book pages>' }` — e.g. `{ doc: 'wilkes', pages: '495–496', note: 'Eq. (9.38)' }`
* Page strings: `'5'`, `'6–8'`, `'251, 253–254'`. Use `note` for "Eq. (9.16)", "Fig. 9.7", "Example 7.2", "Problem 9.12".
* Every claim taken from a PDF gets a `src` on its Step / FormulaCard / example / practice / quiz item. **Never invent or
  guess a page** — if unsure, look it up in the notes/PDF. Omitting `src` means "supplementary" and the UI marks it
  `✦ Supplementary`. That is the required way to distinguish your own explanations from the source material.
* A PDF example whose full solution is printed → `src` + (default) solution from source. A problem the PDF only *states*
  (e.g. Lecture 11 slide 2, end-of-chapter problems) → `src` on the problem and `solutionBy: 'platform'` on examples
  (practice cards automatically say "solution written for this platform").

## 3. Topic module shape

```tsx
import { useState } from 'react'
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, TopicMeta } from '@/lib/types'
import { Concept, Step, Md, md, M, FormulaCard, ExampleCard, PracticeList, QuickCheck, Takeaways, Callout,
         Supplement, SimPanel, Slider, Readout, Plot, FlowField, Figure, FlowSteps, Derivation, Compare, Tabs } from '@/kit'
import { MySim } from '../sims/<topic-id>/MySim'

export const meta: TopicMeta = {
  id: '<topic-id>', unit: 'A', title: '…', subtitle: '…', minutes: 60,
  sources: [{ doc: 'lec9', pages: '2–9' }],
  concepts: [ { id: '<given id>', title: '…', src: { doc: 'lec9', pages: '5' }, summary: 'one line' }, … ],
  sourceNote: md`optional banner (markdown)`,
}
export const formulas: FormulaDef[] = [ … ]      // every equation shown in the topic
export const examples: ExampleDef[] = [ … ]      // ≥ 1 per concept
export const practice: PracticeDef[] = [ … ]     // ≥ 2 per concept
export const quiz: QuizQ[] = [ … ]               // ≥ 2 per concept (≥ 8 per topic)
export const flashcards: Flashcard[] = [ … ]     // ≥ 2 per concept
export const takeaways: string[] = [ … ]         // 6–12 topic-level points (markdown)

export default function Content() {
  return (
    <>
      <Concept id="…"> …8 steps… </Concept>
      <Concept id="…"> … </Concept>
    </>
  )
}
```

### Exemplar (shape and tone — real topics are much longer and richer)

```tsx
export const formulas: FormulaDef[] = [
  {
    id: 'psi-def', name: 'Stream function (plane, incompressible)', key: true,
    tex: md`u = \pd{\psi}{y}, \qquad v = -\pd{\psi}{x}`,
    vars: [
      { sym: md`\psi(x,y)`, desc: 'stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v`, desc: 'velocity components in $x$ and $y$', units: md`\mathrm{m/s}` },
    ],
    conditions: ['steady or unsteady, **incompressible**', 'plane two-dimensional flow ($w = 0$, no $z$-dependence)'],
    use: md`Differentiate $\psi$ to get the velocity; continuity $\pd{u}{x}+\pd{v}{y}=0$ is then satisfied automatically.`,
    src: { doc: 'lec9', pages: '12' },
  },
]
export const examples: ExampleDef[] = [
  {
    id: 'psi-corner', concept: 'definition', title: 'Velocity field from ψ = 2xy', difficulty: 1,
    given: md`$\psi = 2xy$ (m²/s), $x, y$ in metres.`,
    find: md`$u$, $v$ and the speed at $(1, 2)$ m.`,
    steps: [
      { title: 'Differentiate', md: md`$u = \pd{\psi}{y} = 2x$, $\quad v = -\pd{\psi}{x} = -2y$` },
      { title: 'Evaluate', md: md`At $(1,2)$: $u = 2$ m/s, $v = -4$ m/s, $|\vb{V}| = \sqrt{2^2+4^2} = 4.47$ m/s` },
    ],
    answer: md`$u = 2x$, $v = -2y$; $|\vb{V}| = 4.47$ m/s at $(1,2)$`,
    insight: 'Signs matter: v = −∂ψ/∂x, not +∂ψ/∂x.',
  },
]

export default function Content() {
  const [A, setA] = useState(1)
  return (
    <Concept id="definition">
      <Step kind="intro" src={{ doc: 'lec9', pages: '12' }}>
        <Md>{md`For **steady, incompressible, plane two-dimensional** flow the continuity equation
        $\pd{u}{x}+\pd{v}{y}=0$ lets us replace two unknowns ($u$, $v$) by one scalar function $\psi(x,y)$…`}</Md>
      </Step>
      <Step kind="intuition">
        <Md>{md`Think of $\psi$ as a "flow-rate bookkeeping" function…`}</Md>
        <Callout kind="tip">…</Callout>
      </Step>
      <Step kind="visual" src={{ doc: 'lec9', pages: '13' }}>
        <Figure caption="Streamlines are the contour lines of ψ." src={{ doc: 'lec9', pages: '13' }}>
          <FlowField x={[-2, 2]} y={[0, 2]} psi={(x, y) => 2 * x * y} />
        </Figure>
      </Step>
      <Step kind="equations" src={{ doc: 'lec9', pages: '12' }}>
        <FormulaCard id="psi-def" />
      </Step>
      <Step kind="example"><ExampleCard id="psi-corner" /></Step>
      <Step kind="interactive">
        <SimPanel title="Corner flow explorer" controls={<Slider label="strength $A$" value={A} min={0.2} max={3} onChange={setA} unit="s⁻¹" />}
          readout={<Readout items={[{ label: '$u$ at (1,1)', value: 2 * A, unit: 'm/s' }]} />}
          footer="Try this: double A and watch the streamline pattern stay the same while the speeds double.">
          <FlowField x={[-2, 2]} y={[0, 2]} psi={(x, y) => 2 * A * x * y} particles={80} />
        </SimPanel>
      </Step>
      <Step kind="practice"><PracticeList concept="definition" /></Step>
      <Step kind="takeaways"><Takeaways items={[md`$\psi$ exists because of **mass conservation**…`]} /></Step>
    </Concept>
  )
}
```

**Use exactly the concept ids you were assigned** (problem-set authors rely on them). The topic page automatically adds:
hero header, the topic quiz (all `quiz` items), the summary (`takeaways`), a formula recap and any end-of-chapter problem
sets. Don't duplicate those.

## 4. The teaching flow — every `<Concept>` has all 8 steps, in this order

| Step `kind` | Must contain |
|---|---|
| `intro` | What the concept is, why it matters, where it sits in the course. Source content → `src`. |
| `intuition` | Physical picture, analogy, "what would you feel/see". Usually supplementary (no `src`). |
| `visual` | A real visual: custom SVG diagram, animation, `Plot`, `FlowField` or a flowchart (`FlowSteps`/`FlowChart`). Recreate the figures described in the notes as SVG/interactive (do not embed images). |
| `equations` | `<FormulaCard id>` for every equation; each FormulaDef lists **every** symbol with meaning + units, the assumptions/validity conditions and how to use it. Use `<Derivation>` (or a separate `kind="derivation"` step) for derivations the source shows. |
| `example` | `<ExampleCard id>` — step-by-step solved numerical example(s). **Prefer the PDF's own examples** (cite them); add supplementary ones when the PDF has none for this concept. Show every intermediate number with units. |
| `interactive` | `<SimPanel>` with sliders/toggles driving a live simulation, interactive graph or calculator built for this concept. |
| `practice` | `<PracticeList concept="…">` — ≥ 2 problems with hints, numeric `check`s where there is a number, short answer and full worked solution. Optionally a `<QuickCheck ids=[…]>` of 1–2 quiz items. |
| `takeaways` | `<Takeaways items={[…]}>` — 3–6 crisp bullets incl. common mistakes / exam traps. |

Use `<Callout kind="exam|warning|tip|note|key|def">` liberally for exam focus and common mistakes, and
`<Supplement>` for an extra explanation inserted inside a source-based step.

## 5. Writing rules

* **Paraphrase** — never copy long passages from the books. Equations, numbers and symbols must be exact.
* **No fabrication.** Every source statement must actually be in the cited page. If you add standard textbook knowledge
  that is not in the PDFs, it goes in an un-cited (supplementary) block.
* Explain every variable on first use; state assumptions (steady? incompressible? inviscid? irrotational? 2-D? fully
  developed? smooth pipe?) and the validity range (e.g. Re limits, y⁺ ranges).
* Numbers: SI units, sensible significant figures, show unit conversions. **Verify every number you write** by running
  it (`python3 -I -c "…"` or `node -e "…"`). Numeric `check.value` must equal the solution's final number.
* Quiz: 3–5 options (true/false questions may use exactly `['True', 'False']`); options are shuffled at display time,
  so never write "all/none of the above", "both A and B" or refer to option letters. Distractors = real misconceptions.
  `explain` says why the right answer is right *and* why the tempting wrong one is wrong.
* Difficulty `1 | 2 | 3` on examples/practice/quiz to give a spread.

## 6. Markdown + math rules (most common source of bugs)

* Wrap every markdown/TeX string in the `md` tag: ``md`The rotation $\omega_z = \tfrac12(\pd{v}{x}-\pd{u}{y})$` `` —
  it is `String.raw`, so backslashes stay literal. A plain `'…'` string must contain no backslashes.
* Inline math `$…$`; display math `$$…$$` **on its own lines** (blank line before and after).
* Multi-line equations: `\begin{aligned} … \\ … \end{aligned}` inside `$$…$$`.
* Inside `md` strings do **not** use backticks, and do not start a line with 4+ spaces (code block). `Md` dedents
  template literals automatically, so normal JSX indentation is fine.
* `${…}` inside an `md` template is JS interpolation — handy for computed numbers (``md`$V = ${v.toFixed(2)}$ m/s` ``);
  write `\{` / `\}` for literal TeX braces only where needed and never write `${` unless you mean interpolation.
* GFM tables work (`| a | b |`). Avoid `|` inside math in tables — use `\vert`.
* KaTeX macros available: `\pd{f}{x}` (partial derivative), `\dd`, `\vb{V}` (bold vector), `\avg{v}` (overline),
  `\Rey \Eu \Fr \We \Ma \Pran \Nu \St` (upright group names), `\dimM \dimL \dimT \dimF` (sans-serif M L T F).
* `FormulaDef.tex`, `VarDef.sym` and `VarDef.units` are **pure TeX** (no `$`). `desc`, `conditions`, `use` are markdown.
* Unicode in plain prose is fine (ψ, φ, ρ, ν), but inside `$…$` use TeX commands.

## 7. Kit API (import from `@/kit`)

* `Concept({ id })`, `Step({ kind, src?, title? })`, `Takeaways({ items })`
* `Md({ children, inline? })`, `M({ tex })` / `<M>{md`…`}</M>`, `MathBlock({ tex, tag? })`, `md` tag
* `FormulaCard({ id })` (or `f={def}`) · `ExampleCard({ id })` · `PracticeList({ concept })` / `PracticeCard({ id })`
* `QuizBlock({ questions, title? })`, `QuickCheck({ ids })`
* `Callout({ kind, title? })`, `Supplement({ title? })`, `SourceChips({ src })`, `Origin({ src })`
* `FlowSteps({ steps: [{ title, md?, tone? }] })` vertical numbered flowchart; `FlowChart({ rows: FlowNode[][], arrowLabels? })`;
  `FlowRow({ nodes })`; `Derivation({ steps: [{ md, why? }], title? })`; `Tabs({ tabs: [{ label, content }] })`;
  `Compare({ items: [{ title, md, tone? }] })`. Tones: `indigo cyan amber rose emerald slate violet`.
* `SimPanel({ title, subtitle?, controls?, readout?, footer?, src?, wide? })` — viz left, controls right.
* `Slider({ label, value, min, max, step?, onChange, unit?, digits?, log?, format? })`, `Toggle`, `Segmented`,
  `Readout({ items: [{ label, value, unit?, digits?, tone? }], cols? })`, `PlayPause`, `Figure({ caption?, src? })`.
* `Plot({ x: { label, domain, log? }, y: {…}, series: [{ label, fn | points, kind?: 'line'|'scatter'|'area', color?, dash?, width?, range?, samples? }], vlines?, hlines?, bands?, marks?, height?, overlay? })`
  — responsive SVG with log axes and hover crosshair. Axis labels/series labels may contain `$TeX$`.
* `FlowField({ x:[x0,x1], y:[y0,y1], psi?, phi?, vel?, psiLevels?, phiLevels?, streamlines?, equipotentials?, particles?, speed?, quiver?, heatmap?, highlight?: [{ level, color?, label? }], body?, markers?: [{ x, y, label?, kind?: 'stagnation'|'source'|'sink'|'vortex'|'point' }], cut?, Uref?, overlay? })`
  — potential-flow visualiser: ψ contours = streamlines, φ contours = equipotentials, animated tracers, arrows, speed map,
  hover probe (u, v, |V|, ψ, φ, Cp). For multivalued θ (sources, vortices) choose the branch cut where it is hidden
  (e.g. inside a body) — `cut` (default 4 × level spacing) hides the jump.
* Hooks: `useAnimationFrame(cb(dt, t), running)`, `useElementSize()`, `useInView(ref)`, `usePrefersReducedMotion()`, `useUid()`.
* `num.*` helpers: `linspace logspace fmt fmtTeX solveLinear rank toFraction fracTeX bisect fixedPoint simpson rk4 seededRandom gaussian clamp lerp`.
* Libraries available: React 19, d3-scale, d3-shape, d3-array, d3-contour, lucide-react icons. Nothing else — do not add packages.

### Visual design rules for sims/diagrams
* Theme-aware colours only: CSS vars `var(--ink) var(--ink-2) var(--ink-3) var(--line) var(--surface) var(--surface-2)
  var(--plot-1)…var(--plot-8) var(--streamline) var(--equipotential) var(--quiver) var(--body-fill)` or Tailwind classes
  (`text-ink`, `bg-surface`, `fill-ink-3`, `border-line`, plus normal palette classes with `dark:` variants). Never hard-code
  black/white text.
* Responsive: use `useElementSize` or an SVG `viewBox` with `className="w-full h-auto"`. Must work at 360 px width.
* Animations: `useAnimationFrame`, pause when off-screen (`useInView`), respect reduced motion, keep per-frame work light.
  Deterministic randomness: `num.seededRandom(seed)`.
* Make sims *teach*: label axes with units, annotate key points, show live computed numbers in a `Readout`, add a one-line
  "Try this:" prompt in the `footer` telling the student what to change and what to notice.

## 8. Testing (required before you finish)

```bash
TOPIC=<topic-id> npx vitest run            # must pass: renders every concept, example, practice and formula,
                                           # no KaTeX errors, no React warnings, valid ids/sources
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "topics/<topic-id>|sims/<topic-id>"   # must print nothing
```
Topics are loaded one by one in the tests, so other agents' half-written files cannot break your run.
Problem-set authors: run `TOPIC=<target-topic-id> npx vitest run` for each topic your sets attach to (once that topic
file exists), plus the type-check filtered to your file. Do not start the dev server.

## 9. Final self-check
- [ ] Every page of your assigned source range is reflected (concepts, equations, figures, examples, remarks).
- [ ] Every concept has all 8 steps; ≥ 1 worked example, ≥ 2 practice, ≥ 2 quiz items, ≥ 2 flashcards.
- [ ] Every equation is in `formulas` and shown via `<FormulaCard>`, with all symbols defined and conditions stated.
- [ ] Every number re-computed; `check` values match solutions.
- [ ] Source vs supplementary is marked correctly; page numbers verified.
- [ ] Tests and type-check pass.
