import type { ComponentType, ReactNode } from 'react'

/** Source documents shipped in public/sources (see lib/sources.ts). */
export type DocId = 'lec9' | 'lec10' | 'lec11' | 'lec12' | 'lec13' | 'fox' | 'wilkes'

/**
 * A reference into a source PDF.
 * - Lecture decks: `pages` are SLIDE numbers (= PDF page numbers), e.g. '5' or '6–8'.
 * - Books (fox, wilkes): `pages` are PRINTED book page numbers, e.g. '493' or '251, 253–254'.
 *   The PDF page is computed automatically for the "open source" link.
 */
export interface Src {
  doc: DocId
  pages: string
  /** Optional pointer such as 'Eq. (9.16)', 'Fig. 9.7', 'Example 7.2'. */
  note?: string
}
export type SrcLike = Src | Src[]

export type UnitId = 'A' | 'B' | 'C' | 'D'
export type Difficulty = 1 | 2 | 3

/** One symbol in a formula's "where" table. `sym` and `units` are TeX; `desc` is markdown. */
export interface VarDef {
  sym: string
  desc: string
  units?: string
}

export interface FormulaDef {
  id: string
  name: string
  /** Display TeX (no surrounding $$). */
  tex: string
  vars?: VarDef[]
  /** Markdown bullet texts: assumptions / conditions under which the formula is valid. */
  conditions?: string[]
  /** Markdown: when and how to use it. */
  use?: string
  /** Omit ONLY for supplementary formulas that are not in the PDFs. */
  src?: SrcLike
  /** Printed equation number, e.g. '9.16'. */
  tag?: string
  /** Core exam formula (highlighted on the formula sheet). */
  key?: boolean
}

export interface ExampleStep {
  title?: string
  /** Markdown with $math$. */
  md: string
  /** Optional visual for this step. */
  fig?: ReactNode
}

export interface ExampleDef {
  id: string
  /** Concept id (from meta.concepts) this example belongs to. */
  concept: string
  title: string
  /** Omit for supplementary (self-made) examples. */
  src?: SrcLike
  difficulty?: Difficulty
  given: string
  find: string
  assumptions?: string
  steps: ExampleStep[]
  /** Final answer(s), markdown. */
  answer: string
  /** One-line lesson learned. */
  insight?: string
  /**
   * Who wrote the solution steps. Default: 'source' when `src` is set (the PDF shows the solution),
   * use 'platform' when the PDF only states the problem (e.g. Lecture 11 slides) and the steps were written here.
   */
  solutionBy?: 'source' | 'platform'
}

export interface NumericCheck {
  label?: string
  value: number
  /** Relative tolerance, default 0.02 (2 %). */
  tol?: number
  units?: string
}

export interface PracticeDef {
  id: string
  concept: string
  q: string
  difficulty?: Difficulty
  /** Set when the problem comes from a PDF (e.g. an end-of-chapter problem). */
  src?: SrcLike
  hint?: string
  /** Short final answer (markdown). */
  answer: string
  /** Complete worked solution (markdown). */
  solution: string
  /** Optional numeric self-check boxes. */
  check?: NumericCheck[]
}

export interface QuizQ {
  id: string
  q: string
  options: string[]
  /** Index into options. */
  answer: number
  explain: string
  concept?: string
  src?: SrcLike
  difficulty?: Difficulty
}

export interface Flashcard {
  id: string
  front: string
  back: string
  src?: SrcLike
}

export interface ConceptMeta {
  id: string
  title: string
  /** Where this concept lives in the PDFs. Omit only for purely supplementary concepts. */
  src?: SrcLike
  /** One-line summary used in the syllabus / search. */
  summary?: string
}

export interface TopicMeta {
  id: string
  unit: UnitId
  title: string
  subtitle: string
  /** Estimated study time in minutes. */
  minutes: number
  sources: Src[]
  concepts: ConceptMeta[]
  /** Optional banner text about which source is primary for this topic. */
  sourceNote?: string
}

/**
 * End-of-chapter problems attached to a topic (files in src/content/problemsets/).
 * They are appended to the topic's practice/quiz lists and rendered after the topic content.
 */
export interface ProblemSet {
  id: string
  /** Topic id the set belongs to. Every problem's `concept` must be one of that topic's concept ids. */
  topic: string
  title: string
  src?: SrcLike
  intro?: string
  problems: PracticeDef[]
  /** Extra quiz items (e.g. true/false statements from the book). */
  quiz?: QuizQ[]
}

export interface TopicModule {
  meta: TopicMeta
  formulas: FormulaDef[]
  examples: ExampleDef[]
  practice: PracticeDef[]
  quiz: QuizQ[]
  flashcards: Flashcard[]
  takeaways: string[]
  problemSets: ProblemSet[]
  Content: ComponentType
}

export interface UnitDef {
  id: UnitId
  title: string
  short: string
  blurb: string
  topics: string[]
}
