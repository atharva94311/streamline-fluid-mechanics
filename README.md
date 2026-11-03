# Streamline — CH21207 Fluid Mechanics Study Studio

An interactive study platform built from the course PDFs:

| Source | Used for |
|---|---|
| Lecture 9 – 13 slides (CH21207, A. Atta) | Unit A (differential analysis), Unit B (potential flow), Unit C (dimensional analysis) — primary |
| Fox & McDonald's excerpt (§6.6, Ch. 7, Ch. 8 pp. 275–277, 293–296) | Irrotational flow, similitude & model studies, internal-flow basics; cross-references only for turbulence |
| Wilkes, *Fluid Mechanics for Chemical Engineers*, Ch. 9 (pp. 480–541) | Unit D turbulent flow — primary source |

**Live site:** https://atharva94311.github.io/streamline-fluid-mechanics/ (rebuilt automatically on every push to `main`).

The course PDFs are copyrighted, so they are **not** in this repository or on the live site — source chips there show the
exact slide/page to look up in your own copy. Locally, put the PDFs in `public/sources/` (see the README there) and the
chips open them at the cited page.

## Run it

Requirements: Node.js 18+ (tested with Node 24).

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Offline / no server

```bash
npm run build
```

This produces `dist/index.html` — a single self-contained file (all code, styles, fonts and math inlined) plus
`dist/sources/` with the PDFs. Double-click `dist/index.html` to study without any server; source chips open the PDFs
at the cited page.

### Checks

```bash
npm run typecheck   # TypeScript
npm test            # renders every topic fully expanded; fails on any TeX error, React warning,
                    # broken source reference or orphaned example / practice / formula
```

## What's inside

**23 topics · 80 concepts · 508 formulas · 170 solved examples · 404 practice problems (incl. all Fox Ch. 7 and
Wilkes Ch. 9 end-of-chapter problems with worked solutions) · 386 quiz questions · 269 flashcards.** Every content page
of all seven PDFs is used — see [`SYLLABUS.md`](SYLLABUS.md) for the topic-wise syllabus and page-by-page coverage
checklist. Each topic was written from audited page-by-page notes of the PDFs and then independently re-checked
against the PDFs, with every worked number re-solved.

* **Learning path** — 4 units, 23 topics; every concept follows the same 8-step flow: concept → physical intuition →
  visual → equations & assumptions → solved example → interactive demo → practice → key takeaways.
* **Source transparency** — green chips cite the PDF and page (click to open it there); `✦ Supplementary` marks
  explanations, examples and models added by the platform.
* **Formula sheet** (searchable, starrable, printable), **practice bank** (filters by unit / source / status),
  **revision mode** (spaced-repetition flashcards, rapid quiz, formula drill, summaries, weak spots),
  **syllabus & coverage map** (every PDF page → the topics that use it), global search (⌘K or `/`).
* **Progress tracking** saved in the browser (export / import / reset from the ⚙ menu).

## Project layout

```
src/
  kit/            authoring components (Concept, Step, FormulaCard, ExampleCard, PracticeCard, Quiz, Plot, FlowField…)
  content/
    units.ts      learning path
    topics/       one module per topic (auto-discovered)
    sims/         topic-specific simulations and diagrams
    problemsets/  end-of-chapter problems attached to topics
  pages/          dashboard, topic page, syllabus, formula sheet, practice bank, revision
public/sources/   the course PDFs
```

See `AUTHORING.md` for the content conventions.
