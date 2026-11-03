/**
 * Topic C1 — Dimensions, Homogeneity & Nondimensional Equations.
 * Primary source: Lecture 13 slides 2–4 (pipe pressure drop, MLT/FLT, checking dimensionless groups).
 * Supporting source: Fox & McDonald Ch. 7 opener, §7.1 (Eqs. 7.1–7.10) and §7.2 incl. Fig. 7.1, pp. 245–249.
 * Dimensions are written with the sans-serif macros \dimM \dimL \dimT \dimF so they never clash with the
 * reference length L or a force F; the slides print them in italic.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, md, PracticeList, QuickCheck, Step,
  Supplement, Takeaways,
} from '@/kit'
import { MltFltDiagram, PipeSlideFigure, TermScalingFigure } from '../sims/dimensional-basics/figures'
import { CollapseLab } from '../sims/dimensional-basics/CollapseLab'
import { SphereDragFigure, SphereDragLab } from '../sims/dimensional-basics/SphereDrag'
import { BudgetCalc } from '../sims/dimensional-basics/BudgetCalc'
import { DimensionBuilder, Slide4Walks } from '../sims/dimensional-basics/DimensionBuilder'
import { NSTermExplorer } from '../sims/dimensional-basics/NSTermExplorer'
import { BoundaryLayerSketch } from '../sims/dimensional-basics/BoundaryLayerSketch'
import { ModelMatch } from '../sims/dimensional-basics/ModelMatch'

const L2: Src = { doc: 'lec13', pages: '2' }
const L3: Src = { doc: 'lec13', pages: '3' }
const L4: Src = { doc: 'lec13', pages: '4' }
const L5: Src = { doc: 'lec13', pages: '5' }
const L6: Src = { doc: 'lec13', pages: '6' }
const L16: Src = { doc: 'lec13', pages: '16' }
const F245: Src = { doc: 'fox', pages: '245' }
const F246: Src = { doc: 'fox', pages: '246' }
const F247: Src = { doc: 'fox', pages: '247' }
const F248: Src = { doc: 'fox', pages: '248' }
const F249: Src = { doc: 'fox', pages: '249' }

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'dimensional-basics',
  unit: 'C',
  title: 'Dimensions, Homogeneity & Nondimensional Equations',
  subtitle:
    'Why a five-variable pipe problem collapses onto one curve: basic dimensions (MLT or FLT), dimensional homogeneity, and what the nondimensional Navier–Stokes equations reveal through 1/Re and gL/V∞².',
  minutes: 80,
  sources: [
    { doc: 'lec13', pages: '2–4' },
    { doc: 'fox', pages: '245–249' },
  ],
  concepts: [
    {
      id: 'motivation',
      title: 'Why dimensional analysis? The pipe pressure-drop problem',
      src: [
        { doc: 'lec13', pages: '2–3' },
        { doc: 'fox', pages: '245, 247–249' },
      ],
      summary:
        'Δpℓ = f(D, ρ, μ, V) needs whole families of curves; written as DΔpℓ/(ρV²) = φ(ρVD/μ) every measurement falls on one curve — the same idea turns Fox’s 10⁴ sphere-drag tests into about 10.',
    },
    {
      id: 'dimensions',
      title: 'Basic dimensions (MLT or FLT) and dimensional homogeneity',
      src: { doc: 'lec13', pages: '3–4' },
      summary:
        'Every variable is a product of powers of M, L, T — or F, L, T, since F ≐ MLT⁻². A product is dimensionless when every exponent is zero, and every term of a valid equation has the same dimensions.',
    },
    {
      id: 'nondimensional-equations',
      title: 'Nondimensionalizing the governing equations',
      src: { doc: 'fox', pages: '246–247' },
      summary:
        'Scaling lengths by L, velocities by V∞ and pressure by ρV∞² turns the 2-D Navier–Stokes equations into Eqs. (7.8)–(7.10), whose only parameters are μ/(ρV∞L) = 1/Re and gL/V∞² = 1/Fr².',
    },
  ],
  sourceNote: md`Primary source: **Lecture 13, slides 2–4** — the pipe pressure-drop problem, the MLT/FLT systems and the check that the groups are dimensionless. Supporting source: **Fox & McDonald, Chapter 7, pp. 245–249** — the chapter opener and case study, §7.1 (nondimensional Navier–Stokes equations, Eqs. 7.1–7.10) and §7.2 (the sphere-drag experiment and Fig. 7.1). The systematic Buckingham Pi procedure (slides 5–21, Fox §7.3) is the next topic.`,
}

/* ------------------------------------------------------------------------------------------------ formulas */

const DL = md`\text{—}`

export const formulas: FormulaDef[] = [
  /* ---- motivation ---- */
  {
    id: 'pipe-dp-function',
    name: 'Pipe pressure drop — the dimensional statement',
    tex: md`\Delta p_\ell = f(D,\ \rho,\ \mu,\ V)`,
    vars: [
      { sym: md`\Delta p_\ell`, desc: 'pressure drop per unit length of pipe produced by wall friction (the dependent variable)', units: md`\mathrm{Pa/m} = \mathrm{N/m^3}` },
      { sym: 'D', desc: 'pipe (inside) diameter', units: md`\mathrm{m}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'fluid dynamic viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: 'V', desc: 'mean flow velocity in the pipe', units: md`\mathrm{m/s}` },
      { sym: 'f', desc: 'unknown function — dimensional analysis alone cannot find it', units: DL },
    ],
    conditions: [
      '**steady** flow of an **incompressible Newtonian** fluid',
      'a **long** pipe, so the pressure drop *per unit length* is the same everywhere and the pipe length does not enter',
      '**smooth-walled** (no roughness), **horizontal** (no elevation change), **circular** (one length, $D$, fixes the cross-section)',
    ],
    use: md`The variable list is the starting point of every dimensional analysis. Here there are $k = 5$ variables — count $\Delta p_\ell$ itself. Exploring $f$ directly means varying one variable at a time with the other three fixed (slide 2), and repeating each sweep for many values of the fixed ones.`,
    src: L2,
  },
  {
    id: 'pipe-pi-relation',
    name: 'Pipe pressure drop — dimensionless form',
    key: true,
    tex: md`\frac{D\,\Delta p_\ell}{\rho V^2} = \phi\!\left(\frac{\rho V D}{\mu}\right)`,
    vars: [
      { sym: md`D\,\Delta p_\ell/\rho V^2`, desc: md`dimensionless pressure drop: the friction pressure drop over one diameter divided by $\rho V^2$`, units: DL },
      { sym: md`\rho V D/\mu`, desc: 'the Reynolds number based on pipe diameter', units: DL },
      { sym: md`\phi`, desc: md`unknown function of the single variable $\rho VD/\mu$, found from experiment (or theory)`, units: DL },
      { sym: md`\Delta p_\ell`, desc: 'pressure drop per unit length due to friction', units: md`\mathrm{Pa/m}` },
      { sym: 'D', desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'fluid dynamic viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: 'V', desc: 'mean velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'same assumptions as the dimensional statement (steady, incompressible Newtonian, long, smooth, horizontal, circular pipe)',
      md`dimensional analysis fixes the **form** — one group as a function of one group; the shape of $\phi$ must still be measured`,
    ],
    use: md`Plot $D\Delta p_\ell/\rho V^2$ against $\rho VD/\mu$: **one curve** replaces all the families of slide 2. An experiment only has to vary $\rho VD/\mu$ (for example by changing $V$ in one pipe with one fluid), and the curve then applies to *every* fluid and pipe at the same $\rho VD/\mu$. Slide 16 writes the same result as $\Delta p_\ell D/\rho V^2 = \tilde\phi(\rho VD/\mu)$; the tilde only marks a different, still unknown function.`,
    src: [L3, { doc: 'lec13', pages: '16', note: 'same relation written with φ̃' }],
  },
  {
    id: 'chapter-groups',
    name: 'Dimensionless groups already met (Fox chapter opener)',
    tex: md`\begin{aligned}
M &= \frac{V}{c} \lesssim 0.3 &&\Rightarrow\ \text{flow essentially incompressible}\\
Re &= \frac{\rho V L}{\mu}\ \text{“large”} &&\Rightarrow\ \text{viscous effects negligible in most of the flow}\\
Re &= \frac{\rho V D}{\mu}\ \text{(pipe)} &&\Rightarrow\ \text{laminar or turbulent?}\\
Bi &= \frac{hL}{k} &&\Rightarrow\ \text{cools at the surface first, or uniformly?}
\end{aligned}`,
    vars: [
      { sym: 'M', desc: 'Mach number', units: DL },
      { sym: 'V', desc: 'typical flow speed', units: md`\mathrm{m/s}` },
      { sym: 'c', desc: 'speed of sound', units: md`\mathrm{m/s}` },
      { sym: 'Re', desc: 'Reynolds number', units: DL },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'fluid dynamic viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: 'L', desc: 'typical ("characteristic") size of the flow — or of the hot body, in $Bi$', units: md`\mathrm{m}` },
      { sym: 'D', desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: 'Bi', desc: 'Biot number (heat transfer)', units: DL },
      { sym: 'h', desc: 'convection coefficient of the cool fluid around the body', units: md`\mathrm{W/(m^2\,K)}` },
      { sym: 'k', desc: 'thermal conductivity of the body', units: md`\mathrm{W/(m\,K)}` },
    ],
    conditions: [
      'the thresholds ("about 0.3", "large") are the rules of thumb quoted by Fox, not sharp limits',
      'each statement depends only on the **value** of a pure number, never on the units used',
    ],
    use: md`These are the "simplified-flow" claims of earlier chapters. Fox's opening question — how do we obtain such groupings, and why do their values predict so well? — is exactly what dimensional analysis answers.`,
    src: F245,
  },
  {
    id: 'trex-groups',
    name: 'Case study “T. Rex”: how to plot running data',
    tex: md`\frac{V^2}{g\,l}\quad\text{plotted against}\quad\frac{s}{l}`,
    vars: [
      { sym: 'V', desc: 'measured running speed of the animal', units: md`\mathrm{m/s}` },
      { sym: 'g', desc: 'acceleration of gravity', units: md`\mathrm{m/s^2}` },
      { sym: 'l', desc: 'average leg length (from the fossil record for dinosaurs)', units: md`\mathrm{m}` },
      { sym: 's', desc: 'stride length', units: md`\mathrm{m}` },
    ],
    conditions: [
      'raw data on $l$, $s$ and $V$ for horses, dogs, humans… show **no pattern**; plotted this way most animals fall approximately on **one curve**',
      'the book gives no numbers or curve for this correlation',
    ],
    use: md`From fossils take $s/l$, read $V^2/gl$ off the curve, and solve for $V$ (since $l$ and $g$ are known). Fox's conclusion: humans could probably easily outrun *T. rex*. Note that $V^2/gl$ has the form of a Froude number squared based on leg length.`,
    src: F245,
  },
  {
    id: 'sphere-drag-function',
    name: 'Drag on a smooth sphere — the dimensional statement',
    tex: md`F = f(D,\ V,\ \rho,\ \mu)`,
    vars: [
      { sym: 'F', desc: 'drag force on the stationary sphere', units: md`\mathrm{N}` },
      { sym: 'D', desc: 'sphere diameter (its size)', units: md`\mathrm{m}` },
      { sym: 'V', desc: 'speed of the uniform stream', units: md`\mathrm{m/s}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'fluid viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: 'f', desc: 'unknown function', units: DL },
    ],
    conditions: [
      'stationary **smooth** sphere immersed in a **uniform** stream',
      'the list might leave out a parameter that matters (e.g. surface roughness) or include one that does not — but every entry is controllable and measurable in the laboratory',
    ],
    use: md`Measured brute force, this needs about $10^4$ tests (10 values each of $V$, $D$, $\rho$, $\mu$).`,
    src: F247,
  },
  {
    id: 'sphere-drag-pi',
    name: 'Drag on a smooth sphere — dimensionless form',
    key: true,
    tex: md`\frac{F}{\rho V^2 D^2} = f\!\left(\frac{\rho V D}{\mu}\right)`,
    vars: [
      { sym: md`F/\rho V^2 D^2`, desc: md`dimensionless drag: the force divided by the inertia-force scale $\rho V^2D^2$`, units: DL },
      { sym: md`\rho V D/\mu`, desc: 'Reynolds number based on sphere diameter', units: DL },
      { sym: 'f', desc: 'unknown function, determined experimentally', units: DL },
    ],
    conditions: [
      'smooth sphere; all spheres in all fluids fall on the same curve "for most velocities" (Fox) — the very high speeds where compressibility would matter are presumably excluded (supplementary reading of that phrase)',
    ],
    use: md`Only $\rho VD/\mu$ needs to be varied: about **10 tests** establish $f$ as well as $10^4$ would — e.g. **one** 25 mm sphere in **one** fluid (air), changing only the speed. The result is derived formally in Fox's Example 7.1 (next topic).`,
    src: F248,
  },
  {
    id: 'drag-coefficient',
    name: 'Drag coefficient of a sphere (ordinate of Fig. 7.1)',
    key: true,
    tex: md`C_D = \frac{F}{\tfrac12\,\rho V^2\,\pi\dfrac{D^2}{4}}`,
    vars: [
      { sym: 'C_D', desc: 'drag coefficient', units: DL },
      { sym: 'F', desc: 'drag force', units: md`\mathrm{N}` },
      { sym: md`\tfrac12\rho V^2`, desc: 'dynamic pressure of the stream', units: md`\mathrm{Pa}` },
      { sym: md`\pi D^2/4`, desc: 'frontal (projected) area of the sphere', units: md`\mathrm{m^2}` },
    ],
    conditions: [
      md`the factors $\tfrac12$ and $\pi/4$ were added to $F/\rho V^2D^2$ only to reach this commonly used form: they change the number, not the dimensions or the information`,
      md`Fig. 7.1 covers $10^{-1} \le \rho VD/\mu \le 10^{6}$`,
    ],
    use: md`Recipe (Fox p. 249): from $\rho$, $\mu$, $V$ and $D$ compute $\rho VD/\mu$, read $C_D$ from Fig. 7.1, then $F = C_D\cdot\tfrac12\rho V^2\cdot\pi D^2/4$. Conversion: $F/\rho V^2D^2 = (\pi/8)\,C_D \approx 0.393\,C_D$.`,
    src: { doc: 'fox', pages: '248', note: 'Fig. 7.1' },
  },
  {
    id: 'pi-theorem-preview',
    name: 'Buckingham Pi theorem — statement (preview)',
    tex: md`\begin{aligned}
g(q_1, q_2, \ldots, q_n) = 0 \;&\longrightarrow\; G(\Pi_1, \Pi_2, \ldots, \Pi_{n-m}) = 0 \quad\text{or}\quad \Pi_1 = G_1(\Pi_2, \ldots, \Pi_{n-m})\\
\text{sphere:}\quad g(F, D, \rho, \mu, V) = 0 \;&\longrightarrow\; \frac{F}{\rho V^2 D^2} = G_1\!\left(\frac{\mu}{\rho V D}\right)
\end{aligned}`,
    vars: [
      { sym: md`q_1,\ldots,q_n`, desc: 'the $n$ dimensional parameters of the problem', units: md`\text{various}` },
      { sym: 'm', desc: md`*usually* the minimum number $r$ of independent dimensions (e.g. mass, length, time) needed to express all the $q_i$; sometimes $m \ne r$`, units: DL },
      { sym: md`\Pi_1,\ldots,\Pi_{n-m}`, desc: 'independent dimensionless groups', units: DL },
      { sym: md`g,\ G,\ G_1`, desc: 'unspecified functions ($g$ differs from $f$)', units: DL },
    ],
    conditions: [
      'the theorem does **not** predict the functional form of $G$ or $G_1$ — that must be found experimentally',
      md`the $n-m$ groups are **independent**: a group that can be formed from others, such as $\Pi_5 = 2\Pi_1/(\Pi_2\Pi_3)$ or $\Pi_6 = \Pi_1^{3/4}/\Pi_3^2$, is not`,
    ],
    use: md`Why exactly **two** groups for the pipe and the sphere: $n = 5$ parameters, $m = 3$ dimensions, $5 - 3 = 2$. Lecture 13 (slide 5) states the same theorem with $k$ variables and $r$ reference dimensions: $k - r$ pi terms. The procedure for finding the groups is the next topic.`,
    src: [F249, L5],
  },
  {
    id: 'pipe-model-correlations',
    name: 'Smooth-pipe correlations used for the demo data',
    tex: md`\frac{D\,\Delta p_\ell}{\rho V^2} = \begin{cases} \dfrac{32}{Re}, & Re \lesssim 2300\ \ \text{(laminar)}\\[8pt] 0.158\,Re^{-1/4}, & 4000 \lesssim Re \lesssim 10^5\ \ \text{(turbulent, Blasius)}\end{cases}`,
    vars: [
      { sym: md`Re = \rho V D/\mu`, desc: 'Reynolds number based on diameter', units: DL },
      { sym: md`D\,\Delta p_\ell/\rho V^2`, desc: 'the dimensionless pressure drop of slide 3; it equals half the Darcy friction factor', units: DL },
    ],
    conditions: [
      md`smooth, fully developed pipe flow; the transition band $2300 \lesssim Re \lesssim 4000$ has no single curve`,
      'standard results (Hagen–Poiseuille and Blasius) treated in the pipe-flow topics — not part of Lecture 13',
    ],
    use: md`They give the function $\phi$ of slide 3 explicitly, and they generate the synthetic data of the collapse lab. The laminar branch is just Hagen–Poiseuille, $\Delta p_\ell = 32\mu V/D^2$, rewritten with the two groups.`,
  },
  {
    id: 'stokes-cd',
    name: 'Creeping-flow (Stokes) drag of a sphere',
    tex: md`C_D \approx \frac{24}{Re} \quad\Longleftrightarrow\quad F \approx 3\pi\mu V D \qquad (Re \lesssim 1)`,
    vars: [
      { sym: 'C_D', desc: 'drag coefficient', units: DL },
      { sym: md`Re = \rho V D/\mu`, desc: 'Reynolds number', units: DL },
      { sym: 'F', desc: 'drag force', units: md`\mathrm{N}` },
      { sym: md`\mu`, desc: 'fluid viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: 'V', desc: 'stream speed', units: md`\mathrm{m/s}` },
      { sym: 'D', desc: 'sphere diameter', units: md`\mathrm{m}` },
    ],
    conditions: [md`creeping flow, $Re \lesssim 1$; at $Re = 0.1$ the printed Fig. 7.1 curve runs a few per cent above $24/Re$`],
    use: md`Explains the straight slope-$(-1)$ start of Fig. 7.1 and extends it below $Re = 0.1$. Here the drag is independent of $\rho$, so $F/\mu VD$ is the natural group.`,
  },

  /* ---- dimensions ---- */
  {
    id: 'force-mass',
    name: 'Force and mass dimensions are linked',
    key: true,
    tex: md`\dimF \doteq \dimM\dimL\dimT^{-2} \qquad\Longleftrightarrow\qquad \dimM \doteq \dimF\dimL^{-1}\dimT^{2}`,
    vars: [
      { sym: md`\doteq`, desc: 'read "has the dimensions of"', units: DL },
      { sym: md`\dimF`, desc: 'force', units: md`\mathrm{N} = \mathrm{kg\,m/s^2}` },
      { sym: md`\dimM`, desc: 'mass', units: md`\mathrm{kg}` },
      { sym: md`\dimL`, desc: 'length', units: md`\mathrm{m}` },
      { sym: md`\dimT`, desc: 'time (Fox writes lower-case $t$)', units: md`\mathrm{s}` },
    ],
    conditions: [
      md`follows from Newton's second law $F = ma$ with acceleration $\doteq \dimL\dimT^{-2}$`,
      md`choose **either** $\dimM\dimL\dimT$ **or** $\dimF\dimL\dimT$ as the basic set — never all four as independent`,
    ],
    use: md`To switch systems, replace every $\dimM$ by $\dimF\dimL^{-1}\dimT^{2}$ (or every $\dimF$ by $\dimM\dimL\dimT^{-2}$). Example: $\rho \doteq \dimM\dimL^{-3} \doteq \dimF\dimL^{-4}\dimT^{2}$.`,
    src: L3,
  },
  {
    id: 'pipe-flt-dims',
    name: 'FLT dimensions of the pipe variables',
    tex: md`\begin{aligned}
&\Delta p_\ell \doteq \dimF\dimL^{-3},\quad D \doteq \dimL,\quad \rho \doteq \dimF\dimL^{-4}\dimT^{2},\quad \mu \doteq \dimF\dimL^{-2}\dimT,\quad V \doteq \dimL\dimT^{-1}\\
&\text{since}\quad \Delta p_\ell = \frac{\text{pressure}}{\text{length}}:\qquad (\dimF/\dimL^2)/\dimL = \dimF\dimL^{-3}
\end{aligned}`,
    vars: [
      { sym: md`\Delta p_\ell`, desc: 'pressure drop per unit length', units: md`\mathrm{Pa/m}` },
      { sym: 'D', desc: 'diameter', units: md`\mathrm{m}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3} = \mathrm{N\,s^2/m^4}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\cdot s} = \mathrm{N\,s/m^2}` },
      { sym: 'V', desc: 'mean velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: [md`FLT system ($\dimF$, $\dimL$, $\dimT$ basic)`],
    use: md`These five dimension "vectors" are the raw material of the analysis. All three of $\dimF$, $\dimL$, $\dimT$ are needed to describe them — the fact the pi theorem uses next topic ($5 - 3 = 2$ groups).`,
    src: L3,
  },
  {
    id: 'pipe-mlt-dims',
    name: 'MLT dimensions of the pipe variables',
    tex: md`\Delta p_\ell \doteq \dimM\dimL^{-2}\dimT^{-2},\qquad \rho \doteq \dimM\dimL^{-3},\qquad \mu \doteq \dimM\dimL^{-1}\dimT^{-1}\qquad (D \doteq \dimL,\ \ V \doteq \dimL\dimT^{-1})`,
    vars: [
      { sym: md`\Delta p_\ell`, desc: 'pressure drop per unit length', units: md`\mathrm{kg/(m^2\,s^2)}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{kg/(m\,s)}` },
      { sym: md`D,\ V`, desc: 'diameter (m) and velocity (m/s) contain no force or mass, so they are the same in both systems', units: DL },
    ],
    conditions: [md`MLT system; obtained from the FLT forms by $\dimF \doteq \dimM\dimL\dimT^{-2}$`],
    use: md`Used on slide 16 to repeat the dimensionless check in MLT — the verdict must not depend on the system.`,
    src: L16,
  },
  {
    id: 'pi1-check',
    name: 'Check: D Δpℓ/(ρV²) is dimensionless',
    tex: md`\frac{D\,\Delta p_\ell}{\rho V^2} \doteq \frac{\dimL\,(\dimF/\dimL^3)}{(\dimF\dimL^{-4}\dimT^{2})(\dimL\dimT^{-1})^{2}} \doteq \dimF^{0}\dimL^{0}\dimT^{0}`,
    vars: [
      { sym: 'D', desc: 'diameter', units: md`\mathrm{m}` },
      { sym: md`\Delta p_\ell`, desc: 'pressure drop per unit length', units: md`\mathrm{Pa/m}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: 'V', desc: 'mean velocity', units: md`\mathrm{m/s}` },
      { sym: md`\dimF^{0}\dimL^{0}\dimT^{0}`, desc: 'zero net exponent of every basic dimension — a pure number', units: DL },
    ],
    conditions: ['FLT dimensions from slide 3'],
    use: md`Numerator $\dimL\cdot\dimF\dimL^{-3} = \dimF\dimL^{-2}$; denominator $\dimF\dimL^{-4}\dimT^{2}\cdot\dimL^{2}\dimT^{-2} = \dimF\dimL^{-2}$; they cancel exactly.`,
    src: L4,
  },
  {
    id: 're-check',
    name: 'Check: ρVD/μ is dimensionless',
    tex: md`\frac{\rho V D}{\mu} \doteq \frac{(\dimF\dimL^{-4}\dimT^{2})(\dimL\dimT^{-1})(\dimL)}{(\dimF\dimL^{-2}\dimT)} \doteq \dimF^{0}\dimL^{0}\dimT^{0}`,
    vars: [
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: 'V', desc: 'mean velocity', units: md`\mathrm{m/s}` },
      { sym: 'D', desc: 'diameter', units: md`\mathrm{m}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: md`\dimF^{0}\dimL^{0}\dimT^{0}`, desc: 'zero net exponent of every basic dimension', units: DL },
    ],
    conditions: ['FLT dimensions from slide 3'],
    use: md`Numerator: $\dimF\,\dimL^{-4+1+1}\,\dimT^{2-1} = \dimF\dimL^{-2}\dimT$, which is exactly the dimension of $\mu$.`,
    src: L4,
  },
  {
    id: 'homogeneity',
    name: 'Dimensional homogeneity',
    key: true,
    tex: md`u_1 = f(u_2, u_3, \ldots, u_k)\qquad [\,u_1\,] = [\,\text{every term that stands by itself on the right}\,]`,
    vars: [
      { sym: md`u_1`, desc: 'the dependent variable', units: md`\text{any}` },
      { sym: md`u_2,\ldots,u_k`, desc: 'the $k-1$ independent variables', units: md`\text{any}` },
      { sym: 'k', desc: 'total number of variables, counting $u_1$', units: DL },
      { sym: md`[\ \cdot\ ]`, desc: md`"the dimensions of" (Fox's notation; the slides use $\doteq$)`, units: DL },
    ],
    conditions: [
      'holds for every equation that follows from physical laws',
      'an empirical formula with *dimensional* constants is valid only in the units its constants were fitted in',
    ],
    use: md`Check every derived equation term by term — a mismatch proves an algebra error. Homogeneity is also the precondition for the Buckingham pi theorem (slides 5–6, next topic).`,
    src: L6,
  },

  /* ---- nondimensional equations ---- */
  {
    id: 'fox-7-1',
    name: 'Continuity: steady incompressible 2-D flow',
    tag: '7.1',
    tex: md`\pd{u}{x} + \pd{v}{y} = 0`,
    vars: [
      { sym: md`u,\ v`, desc: 'velocity components in $x$ and $y$ (Fox prints $v$ as an italic upsilon)', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: ['incompressible, two-dimensional (from Fox Eq. 5.1c)', 'each term has dimensions of 1/time'],
    use: md`One of the three coupled equations for $u$, $v$, $p$.`,
    src: F246,
  },
  {
    id: 'fox-7-2',
    name: 'x-momentum (Navier–Stokes)',
    tag: '7.2',
    tex: md`\rho\left(u\pd{u}{x} + v\pd{u}{y}\right) = -\pd{p}{x} + \mu\left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right)`,
    vars: [
      { sym: md`\rho`, desc: 'density (constant)', units: md`\mathrm{kg/m^3}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: 'p', desc: 'pressure', units: md`\mathrm{Pa}` },
      { sym: md`\mu`, desc: 'dynamic viscosity (constant)', units: md`\mathrm{Pa\cdot s}` },
      { sym: md`x,\ y`, desc: 'coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      'steady, incompressible, two-dimensional flow of a Newtonian fluid with constant viscosity ("already quite a list of assumptions!")',
      'reduced from the Navier–Stokes equations (Fox Eqs. 5.27); every term is a force per unit volume',
    ],
    use: md`Left side: inertia (density × convective acceleration). Right side: net pressure force and net viscous force per unit volume. No gravity term in $x$.`,
    src: F246,
  },
  {
    id: 'fox-7-3',
    name: 'y-momentum (Navier–Stokes) with gravity',
    tag: '7.3',
    tex: md`\rho\left(u\pd{v}{x} + v\pd{v}{y}\right) = -\rho g - \pd{p}{y} + \mu\left(\frac{\partial^2 v}{\partial x^2} + \frac{\partial^2 v}{\partial y^2}\right)`,
    vars: [
      { sym: 'g', desc: 'acceleration of gravity, acting in the $-y$ direction', units: md`\mathrm{m/s^2}` },
      { sym: md`\rho`, desc: 'density (constant)', units: md`\mathrm{kg/m^3}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: 'p', desc: 'pressure', units: md`\mathrm{Pa}` },
      { sym: md`\mu`, desc: 'dynamic viscosity (constant)', units: md`\mathrm{Pa\cdot s}` },
      { sym: md`x,\ y`, desc: 'coordinates ($y$ vertical)', units: md`\mathrm{m}` },
    ],
    conditions: [md`same as Eq. (7.2); $y$ points vertically upward (implied by the $-\rho g$ term)`, 'every term is a force per unit volume'],
    use: md`Eqs. (7.1)–(7.3) form a set of coupled, nonlinear partial differential equations for $u$, $v$ and $p$ — difficult to solve for most flows.`,
    src: F246,
  },
  {
    id: 'fox-7-4',
    name: 'Nondimensional variables',
    tag: '7.4',
    key: true,
    tex: md`x^* = \frac{x}{L},\qquad y^* = \frac{y}{L},\qquad u^* = \frac{u}{V_\infty},\qquad v^* = \frac{v}{V_\infty},\qquad p^* = \frac{p}{\rho V_\infty^2}`,
    vars: [
      { sym: 'L', desc: 'reference length (e.g. body length)', units: md`\mathrm{m}` },
      { sym: md`V_\infty`, desc: 'reference speed, usually the freestream velocity', units: md`\mathrm{m/s}` },
      { sym: md`\rho V_\infty^2`, desc: md`pressure scale: **twice** the freestream dynamic pressure $\tfrac12\rho V_\infty^2$`, units: md`\mathrm{Pa}` },
      { sym: md`x^*,\ y^*,\ u^*,\ v^*,\ p^*`, desc: 'nondimensional (starred) variables', units: DL },
    ],
    conditions: [md`$L$, $V_\infty$ and $\rho$ are constants`],
    use: md`Invert to substitute: $x = x^*L$, $y = y^*L$, $u = u^*V_\infty$, $v = v^*V_\infty$, $p = \rho V_\infty^2 p^*$.`,
    src: F246,
  },
  {
    id: 'derivative-scaling',
    name: 'Two representative substitutions',
    tex: md`\begin{aligned}
u\pd{u}{x} &= u^*V_\infty\,\frac{\partial(u^*V_\infty)}{\partial(x^*L)} = \frac{V_\infty^2}{L}\,u^*\pd{u^*}{x^*}\\[4pt]
\frac{\partial^2 u}{\partial x^2} &= \frac{\partial^2(u^*V_\infty)}{\partial(x^*L)^2} = \frac{V_\infty}{L^2}\,\frac{\partial^2 u^*}{\partial x^{*2}}
\end{aligned}`,
    vars: [
      { sym: md`V_\infty`, desc: 'constant velocity scale — factors out of the derivatives', units: md`\mathrm{m/s}` },
      { sym: 'L', desc: 'constant length scale — each derivative contributes 1/L', units: md`\mathrm{m}` },
      { sym: md`u^*,\ x^*`, desc: 'nondimensional velocity and coordinate', units: DL },
    ],
    conditions: [md`each $\partial/\partial x$ contributes a factor $1/L$; each velocity a factor $V_\infty$`],
    use: md`Fox prints the middle of the second line as $\partial(u^*V_\infty)/\partial(x^*L)^2$ — the numerator should read $\partial^2(u^*V_\infty)$ (a typesetting slip; the result is unaffected).`,
    src: F246,
  },
  {
    id: 'fox-7-5',
    name: 'Continuity after substitution',
    tag: '7.5',
    tex: md`\frac{V_\infty}{L}\pd{u^*}{x^*} + \frac{V_\infty}{L}\pd{v^*}{y^*} = 0`,
    vars: [
      { sym: md`V_\infty/L`, desc: 'common scale of both velocity gradients', units: md`\mathrm{s^{-1}}` },
      { sym: md`u^*,\ v^*,\ x^*,\ y^*`, desc: 'nondimensional variables of Eq. (7.4)', units: DL },
    ],
    conditions: ['Eq. (7.1) with Eq. (7.4) substituted'],
    use: md`Divide by $V_\infty/L$ to get Eq. (7.8).`,
    src: F246,
  },
  {
    id: 'fox-7-6',
    name: 'x-momentum after substitution',
    tag: '7.6',
    tex: md`\frac{\rho V_\infty^2}{L}\left(u^*\pd{u^*}{x^*} + v^*\pd{u^*}{y^*}\right) = -\frac{\rho V_\infty^2}{L}\pd{p^*}{x^*} + \frac{\mu V_\infty}{L^2}\left(\frac{\partial^2 u^*}{\partial x^{*2}} + \frac{\partial^2 u^*}{\partial y^{*2}}\right)`,
    vars: [
      { sym: md`\rho V_\infty^2/L`, desc: 'size of the inertia and pressure terms', units: md`\mathrm{N/m^3}` },
      { sym: md`\mu V_\infty/L^2`, desc: 'size of the viscous terms', units: md`\mathrm{N/m^3}` },
    ],
    conditions: ['Eq. (7.2) with Eq. (7.4) substituted; still dimensional (force per volume)'],
    use: md`Every bracket is now $O(1)$ if $L$ and $V_\infty$ are well chosen, so the dimensional coefficients show the relative size of each force. Divide by $\rho V_\infty^2/L$ to get Eq. (7.9).`,
    src: F246,
  },
  {
    id: 'fox-7-7',
    name: 'y-momentum after substitution',
    tag: '7.7',
    tex: md`\frac{\rho V_\infty^2}{L}\left(u^*\pd{v^*}{x^*} + v^*\pd{v^*}{y^*}\right) = -\rho g - \frac{\rho V_\infty^2}{L}\pd{p^*}{y^*} + \frac{\mu V_\infty}{L^2}\left(\frac{\partial^2 v^*}{\partial x^{*2}} + \frac{\partial^2 v^*}{\partial y^{*2}}\right)`,
    vars: [
      { sym: md`\rho g`, desc: 'gravity force per unit volume — unchanged by the substitution', units: md`\mathrm{N/m^3}` },
      { sym: md`\rho V_\infty^2/L,\ \mu V_\infty/L^2`, desc: 'inertia/pressure and viscous scales', units: md`\mathrm{N/m^3}` },
    ],
    conditions: ['Eq. (7.3) with Eq. (7.4) substituted'],
    use: md`Divide by $\rho V_\infty^2/L$ to get Eq. (7.10).`,
    src: F246,
  },
  {
    id: 'fox-7-8',
    name: 'Nondimensional continuity',
    tag: '7.8',
    tex: md`\pd{u^*}{x^*} + \pd{v^*}{y^*} = 0`,
    vars: [{ sym: md`u^*,\ v^*,\ x^*,\ y^*`, desc: 'nondimensional velocities and coordinates', units: DL }],
    conditions: ['incompressible 2-D flow'],
    use: md`Identical in form to Eq. (7.1): continuity contains no parameter at all.`,
    src: F246,
  },
  {
    id: 'fox-7-9',
    name: 'Nondimensional x-momentum',
    tag: '7.9',
    key: true,
    tex: md`u^*\pd{u^*}{x^*} + v^*\pd{u^*}{y^*} = -\pd{p^*}{x^*} + \frac{\mu}{\rho V_\infty L}\left(\frac{\partial^2 u^*}{\partial x^{*2}} + \frac{\partial^2 u^*}{\partial y^{*2}}\right)`,
    vars: [
      { sym: md`\mu/\rho V_\infty L`, desc: 'the only parameter: the **inverse of the Reynolds number**, multiplying the second-order (viscous) terms', units: DL },
      { sym: md`u^*,\ v^*,\ p^*,\ x^*,\ y^*`, desc: 'nondimensional variables of Eq. (7.4)', units: DL },
    ],
    conditions: [md`steady, incompressible, 2-D, Newtonian, constant $\mu$`],
    use: md`If $\mu/\rho V_\infty L$ is very small (high $Re$) the viscous terms can be neglected in most of the flow, leaving a form of Euler's equations; if it is large, viscous forces are significant.`,
    src: F247,
  },
  {
    id: 'fox-7-10',
    name: 'Nondimensional y-momentum',
    tag: '7.10',
    key: true,
    tex: md`u^*\pd{v^*}{x^*} + v^*\pd{v^*}{y^*} = -\frac{gL}{V_\infty^2} - \pd{p^*}{y^*} + \frac{\mu}{\rho V_\infty L}\left(\frac{\partial^2 v^*}{\partial x^{*2}} + \frac{\partial^2 v^*}{\partial y^{*2}}\right)`,
    vars: [
      { sym: md`gL/V_\infty^2`, desc: 'second parameter, multiplying the gravity term ($= 1/Fr^2$)', units: DL },
      { sym: md`\mu/\rho V_\infty L`, desc: 'inverse Reynolds number', units: DL },
    ],
    conditions: ['same as Eq. (7.9); gravity along $-y$'],
    use: md`If $gL/V_\infty^2$ is large, gravity forces are significant; if small, they are not. Together with (7.8) and (7.9) the flow depends only on the two coefficients (plus geometry and boundary conditions).`,
    src: F247,
  },
  {
    id: 'coefficients-re-fr',
    name: 'The two coefficients: 1/Re and 1/Fr²',
    key: true,
    tex: md`\frac{\mu V_\infty/L^2}{\rho V_\infty^2/L} = \frac{\mu}{\rho V_\infty L} = \frac{1}{Re},\qquad \frac{\rho g}{\rho V_\infty^2/L} = \frac{gL}{V_\infty^2} = \frac{1}{Fr^2}`,
    vars: [
      { sym: md`Re = \rho V_\infty L/\mu`, desc: 'Reynolds number — inertia force ÷ viscous force', units: DL },
      { sym: md`Fr = V_\infty/\sqrt{gL}`, desc: 'Froude number — $Fr^2$ is inertia force ÷ gravity force', units: DL },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\cdot s}` },
      { sym: 'g', desc: 'acceleration of gravity', units: md`\mathrm{m/s^2}` },
      { sym: md`V_\infty`, desc: 'reference (freestream) speed', units: md`\mathrm{m/s}` },
      { sym: 'L', desc: 'reference length', units: md`\mathrm{m}` },
    ],
    conditions: [md`each coefficient is (scale of a force term) ÷ (scale of the inertia term $\rho V_\infty^2/L$)`],
    use: md`Their **values** tell you which forces dominate before solving anything. Fox prints the gravity group once as "$gLV_\infty^2$" — a typo for $gL/V_\infty^2$, as Eq. (7.10) shows. The names come from Fox Eqs. (7.11) and (7.14).`,
    src: [F247, { doc: 'fox', pages: '255–256', note: 'Eqs. (7.11), (7.14)' }],
  },
  {
    id: 'modified-pressure',
    name: 'Modified (piezometric) pressure absorbs gravity',
    tex: md`p_{\text{mod}} = p + \rho g y \quad\Longrightarrow\quad -\rho g - \pd{p}{y} = -\pd{p_{\text{mod}}}{y},\qquad \pd{p}{x} = \pd{p_{\text{mod}}}{x}`,
    vars: [
      { sym: md`p_{\text{mod}}`, desc: 'modified pressure (pressure minus its hydrostatic part)', units: md`\mathrm{Pa}` },
      { sym: 'y', desc: 'vertical coordinate, upward', units: md`\mathrm{m}` },
      { sym: md`\rho`, desc: 'constant density', units: md`\mathrm{kg/m^3}` },
      { sym: 'g', desc: 'acceleration of gravity', units: md`\mathrm{m/s^2}` },
    ],
    conditions: ['constant density', 'no boundary condition involves $p$ itself — i.e. **no free surface**'],
    use: md`With $p_{\text{mod}}$ the gravity term disappears from Eq. (7.3), so $gL/V_\infty^2$ drops out of the velocity field: gravity only adds a hydrostatic pressure. With a free surface ($p = p_{\text{atm}}$ on a moving boundary) this trick fails and $Fr$ matters — waves.`,
  },
]

/* ------------------------------------------------------------------------------------------------ examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-budget',
    concept: 'motivation',
    title: 'The cost of the brute-force sphere-drag programme',
    src: F248,
    solutionBy: 'platform',
    difficulty: 1,
    given: md`Fox's thought experiment for $F = f(D, V, \rho, \mu)$: 10 speeds $V$, 10 sphere diameters $D$, and 10 values each of $\rho$ and $\mu$ (other fluids). Each run takes $\tfrac12$ h; a working week is 40 h.`,
    find: md`(a) data points and time for one fluid; (b) total tests and time in years; (c) the cost once the data are organised as $F/\rho V^2D^2 = f(\rho VD/\mu)$.`,
    steps: [
      { title: 'One fluid', md: md`$10 \times 10 = 100$ data points; $100 \times 0.5\ \text{h} = 50\ \text{h}$ of work — and only one value of $\rho$ and $\mu$ covered.` },
      { title: 'All four variables', md: md`$10 \times 10 \times 10 \times 10 = 10^4$ tests.` },
      {
        title: 'Time',
        md: md`$10^4 \times 0.5\ \text{h} = 5000\ \text{h}$; $\;5000/40 = 125$ weeks; $\;125/52 = 2.4$ years — Fox's "about $2\tfrac12$ years of 40-h weeks". And the data still have to be interpreted: how do you plot $F$ vs. $V$ with $D$, $\rho$, $\mu$ all as parameters?`,
      },
      {
        title: 'With the dimensionless groups',
        md: md`Only $\rho VD/\mu$ has to be varied: about 10 tests, $10 \times 0.5 = 5$ h. No need for 10 fluids or 10 spheres — one sphere in one fluid, changing the speed.`,
      },
    ],
    answer: md`(a) 100 points, 50 h; (b) $10^4$ tests $\approx 5000$ h $\approx 2.4$ years; (c) about 10 tests ($\approx 5$ h).`,
    insight: 'The number of tests grows like n^k; dimensional analysis lowers the exponent k from 4 variables to 1 group.',
  },
  {
    id: 'ex-pipe-reuse',
    concept: 'motivation',
    title: 'One water test predicts an oil pipeline',
    difficulty: 2,
    given: md`Water ($\rho = 1000\ \mathrm{kg/m^3}$, $\mu = 1.0\times10^{-3}\ \mathrm{Pa\,s}$) flows at $V = 0.50$ m/s in a smooth horizontal pipe of $D = 20$ mm; the measured friction drop is $\Delta p_\ell = 198$ Pa/m. A light oil ($\rho = 900\ \mathrm{kg/m^3}$, $\mu = 0.018\ \mathrm{Pa\,s}$) is to flow in a smooth pipe of $D = 100$ mm.`,
    find: md`The oil velocity at which the water test applies directly, and the predicted $\Delta p_\ell$ for the oil.`,
    assumptions: md`Slide 2 conditions (steady, incompressible Newtonian, long, smooth, horizontal, circular), so $D\Delta p_\ell/\rho V^2 = \phi(\rho VD/\mu)$ holds for both.`,
    steps: [
      { title: 'Reynolds number of the test', md: md`$Re = \dfrac{\rho VD}{\mu} = \dfrac{1000 \times 0.50 \times 0.020}{1.0\times10^{-3}} = 10\,000$` },
      { title: 'Dimensionless pressure drop of the test', md: md`$\dfrac{D\,\Delta p_\ell}{\rho V^2} = \dfrac{0.020 \times 198}{1000 \times 0.50^2} = \dfrac{3.96}{250} = 0.01584$` },
      {
        title: 'Match the Reynolds number',
        md: md`Same $\rho VD/\mu$ means the same point on the one curve. $V_{\text{oil}} = \dfrac{Re\,\mu}{\rho D} = \dfrac{10\,000 \times 0.018}{900 \times 0.10} = 2.0$ m/s`,
      },
      {
        title: 'Read back the pressure drop',
        md: md`$\Delta p_{\ell,\text{oil}} = 0.01584\,\dfrac{\rho V^2}{D} = 0.01584 \times \dfrac{900 \times 2.0^2}{0.10} = 570$ Pa/m`,
      },
    ],
    answer: md`$V_{\text{oil}} = 2.0$ m/s; $\Delta p_\ell \approx 570$ Pa/m (about 2.9 times the water value).`,
    insight: 'We never needed the formula for φ — one measurement at the matching ρVD/μ was enough.',
  },
  {
    id: 'ex-sphere-air',
    concept: 'motivation',
    title: 'Reading Fig. 7.1: a 25 mm sphere in air',
    difficulty: 2,
    given: md`A smooth sphere, $D = 25$ mm, in air ($\rho = 1.20\ \mathrm{kg/m^3}$, $\mu = 1.81\times10^{-5}\ \mathrm{Pa\,s}$) at $V = 10$ m/s.`,
    find: md`(a) the drag force using Fig. 7.1; (b) the speed range that sweeps $10^3 \le \rho VD/\mu \le 10^5$ with this one sphere.`,
    steps: [
      { title: 'Reynolds number', md: md`$\dfrac{\rho VD}{\mu} = \dfrac{1.20 \times 10 \times 0.025}{1.81\times10^{-5}} = 1.66\times10^{4}$` },
      { title: 'Read the curve', md: md`At $1.7\times10^4$ Fig. 7.1 is on its plateau: $C_D \approx 0.42$ (reading accuracy roughly ±10 %).` },
      { title: 'Dynamic pressure and area', md: md`$\tfrac12\rho V^2 = 0.5 \times 1.20 \times 10^2 = 60$ Pa; $\;\dfrac{\pi D^2}{4} = \dfrac{\pi (0.025)^2}{4} = 4.91\times10^{-4}\ \mathrm{m^2}$` },
      { title: 'Drag', md: md`$F = C_D\,\tfrac12\rho V^2\,\dfrac{\pi D^2}{4} = 0.42 \times 60 \times 4.91\times10^{-4} = 0.0124$ N; equivalently $F/\rho V^2D^2 = (\pi/8)(0.42) = 0.165$.` },
      {
        title: 'Speed range',
        md: md`$V = \dfrac{(\rho VD/\mu)\,\mu}{\rho D}$: for $10^3$, $V = \dfrac{10^3 \times 1.81\times10^{-5}}{1.20 \times 0.025} = 0.60$ m/s; for $10^5$, $V = 60$ m/s.`,
      },
    ],
    answer: md`(a) $F \approx 0.012$ N (12 mN); (b) about 0.6 to 60 m/s — one wind tunnel, one sphere, two decades of $\rho VD/\mu$.`,
    insight: 'Low ρVD/μ (≲ 10) would need absurdly slow air — that part of the curve is easier with a viscous liquid such as glycerin.',
  },
  {
    id: 'ex-slide4',
    concept: 'dimensions',
    title: 'Both pipe groups are dimensionless — in FLT and MLT',
    src: [L4, L16],
    difficulty: 1,
    given: md`The groups of slide 3, $D\Delta p_\ell/\rho V^2$ and $\rho VD/\mu$, with $\Delta p_\ell \doteq \dimF\dimL^{-3}$, $D \doteq \dimL$, $\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\mu \doteq \dimF\dimL^{-2}\dimT$, $V \doteq \dimL\dimT^{-1}$.`,
    find: md`Show that both are dimensionless (slide 4), then repeat the check in MLT (slide 16).`,
    steps: [
      {
        title: 'First group, FLT',
        md: md`$\dfrac{D\,\Delta p_\ell}{\rho V^2} \doteq \dfrac{\dimL\,(\dimF/\dimL^3)}{(\dimF\dimL^{-4}\dimT^{2})(\dimL\dimT^{-1})^{2}} = \dfrac{\dimF\dimL^{-2}}{\dimF\dimL^{-2}} \doteq \dimF^0\dimL^0\dimT^0$`,
      },
      {
        title: 'Second group, FLT',
        md: md`$\dfrac{\rho VD}{\mu} \doteq \dfrac{(\dimF\dimL^{-4}\dimT^{2})(\dimL\dimT^{-1})(\dimL)}{\dimF\dimL^{-2}\dimT} = \dfrac{\dimF\dimL^{-2}\dimT}{\dimF\dimL^{-2}\dimT} \doteq \dimF^0\dimL^0\dimT^0$`,
      },
      {
        title: 'Same check in MLT (slide 16)',
        md: md`With $\Delta p_\ell \doteq \dimM\dimL^{-2}\dimT^{-2}$, $\rho \doteq \dimM\dimL^{-3}$, $\mu \doteq \dimM\dimL^{-1}\dimT^{-1}$: $\dfrac{(\dimM\dimL^{-2}\dimT^{-2})(\dimL)}{(\dimM\dimL^{-3})(\dimL\dimT^{-1})^2} \doteq \dimM^0\dimL^0\dimT^0$ and $\dfrac{\mu}{DV\rho} \doteq \dfrac{\dimM\dimL^{-1}\dimT^{-1}}{(\dimL)(\dimL\dimT^{-1})(\dimM\dimL^{-3})} \doteq \dimM^0\dimL^0\dimT^0$. (Slide 16 checks $\mu/DV\rho$, the reciprocal of $\rho VD/\mu$ — equally dimensionless.)`,
      },
    ],
    answer: md`Both groups are $\dimF^0\dimL^0\dimT^0 \doteq \dimM^0\dimL^0\dimT^0$: pure numbers.`,
    insight: 'A product is dimensionless in every system or in none — the check may be done in whichever system is quicker.',
  },
  {
    id: 'ex-flt-conversion',
    concept: 'dimensions',
    title: 'From MLT to FLT: density, viscosity and surface tension',
    difficulty: 1,
    given: md`$\rho \doteq \dimM\dimL^{-3}$, $\mu \doteq \dimM\dimL^{-1}\dimT^{-1}$, surface tension $\sigma \doteq \dimM\dimT^{-2}$, and $\dimF \doteq \dimM\dimL\dimT^{-2}$.`,
    find: md`The FLT dimensions of $\rho$, $\mu$ and $\sigma$, with a physical check for $\mu$ and $\sigma$.`,
    steps: [
      { title: 'Invert the link', md: md`$\dimF \doteq \dimM\dimL\dimT^{-2} \;\Rightarrow\; \dimM \doteq \dimF\dimL^{-1}\dimT^{2}$` },
      { title: 'Density', md: md`$\rho \doteq (\dimF\dimL^{-1}\dimT^{2})\,\dimL^{-3} = \dimF\dimL^{-4}\dimT^{2}$ — slide 3's value.` },
      { title: 'Viscosity', md: md`$\mu \doteq (\dimF\dimL^{-1}\dimT^{2})\,\dimL^{-1}\dimT^{-1} = \dimF\dimL^{-2}\dimT$. Check: $\mu = \tau/(du/dy) \doteq \dimF\dimL^{-2}/\dimT^{-1} = \dimF\dimL^{-2}\dimT$ ✓` },
      { title: 'Surface tension', md: md`$\sigma \doteq (\dimF\dimL^{-1}\dimT^{2})\,\dimT^{-2} = \dimF\dimL^{-1}$ — a force per unit length (N/m) ✓` },
    ],
    answer: md`$\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\;\mu \doteq \dimF\dimL^{-2}\dimT$, $\;\sigma \doteq \dimF\dimL^{-1}$.`,
    insight: 'Replace every M by FL⁻¹T² and collect exponents — then sanity-check with the defining physical relation.',
  },
  {
    id: 'ex-homog-ns',
    concept: 'dimensions',
    title: 'Every term of the Navier–Stokes equations has the same dimensions',
    src: F246,
    solutionBy: 'platform',
    difficulty: 2,
    given: md`Eqs. (7.1)–(7.3). Fox states that Eq. (7.1) has dimensions of 1/time and Eqs. (7.2)–(7.3) of force/volume.`,
    find: md`Verify both statements in MLT.`,
    steps: [
      { title: 'Continuity (7.1)', md: md`$\pd{u}{x} \doteq \dfrac{\dimL\dimT^{-1}}{\dimL} = \dimT^{-1}$, and the same for $\pd{v}{y}$.` },
      { title: 'Inertia term', md: md`$\rho\,u\pd{u}{x} \doteq (\dimM\dimL^{-3})(\dimL\dimT^{-1})(\dimT^{-1}) = \dimM\dimL^{-2}\dimT^{-2}$` },
      { title: 'Pressure term', md: md`$\pd{p}{x} \doteq \dfrac{\dimM\dimL^{-1}\dimT^{-2}}{\dimL} = \dimM\dimL^{-2}\dimT^{-2}$` },
      { title: 'Viscous term', md: md`$\mu\dfrac{\partial^2 u}{\partial x^2} \doteq (\dimM\dimL^{-1}\dimT^{-1})\dfrac{\dimL\dimT^{-1}}{\dimL^2} = \dimM\dimL^{-2}\dimT^{-2}$` },
      { title: 'Gravity term (7.3)', md: md`$\rho g \doteq (\dimM\dimL^{-3})(\dimL\dimT^{-2}) = \dimM\dimL^{-2}\dimT^{-2}$` },
      { title: 'Force per volume', md: md`$\dfrac{\dimM\dimL\dimT^{-2}}{\dimL^3} = \dimM\dimL^{-2}\dimT^{-2} \doteq \dimF\dimL^{-3}$ (N/m³) — every term matches.` },
    ],
    answer: md`Continuity terms $\doteq \dimT^{-1}$; every momentum term $\doteq \dimM\dimL^{-2}\dimT^{-2} \doteq \dimF\dimL^{-3}$ — the equations are dimensionally homogeneous.`,
    insight: 'Homogeneity is what lets us divide every term by one common scale — exactly the next step, §7.1.',
  },
  {
    id: 'ex-nondim-xmom',
    concept: 'nondimensional-equations',
    title: 'From Eq. (7.2) to Eq. (7.9)',
    src: [F246, F247],
    difficulty: 2,
    given: md`The $x$-momentum equation (7.2); reference length $L$, reference speed $V_\infty$, pressure scale $\rho V_\infty^2$ (Eq. 7.4).`,
    find: md`The nondimensional form and its single coefficient.`,
    steps: [
      { title: 'Substitute', md: md`$x = x^*L$, $y = y^*L$, $u = u^*V_\infty$, $v = v^*V_\infty$, $p = \rho V_\infty^2 p^*$.` },
      {
        title: 'Inertia terms',
        md: md`$u\pd{u}{x} = u^*V_\infty\,\dfrac{\partial(u^*V_\infty)}{\partial(x^*L)} = \dfrac{V_\infty^2}{L}\,u^*\pd{u^*}{x^*}$ and likewise $v\pd{u}{y}$, so the left side becomes $\dfrac{\rho V_\infty^2}{L}\left(u^*\pd{u^*}{x^*} + v^*\pd{u^*}{y^*}\right)$.`,
      },
      { title: 'Pressure term', md: md`$\pd{p}{x} = \dfrac{\partial(\rho V_\infty^2 p^*)}{\partial(x^*L)} = \dfrac{\rho V_\infty^2}{L}\pd{p^*}{x^*}$` },
      {
        title: 'Viscous terms',
        md: md`$\dfrac{\partial^2 u}{\partial x^2} = \dfrac{V_\infty}{L^2}\dfrac{\partial^2 u^*}{\partial x^{*2}}$, so $\mu(\cdots)$ becomes $\dfrac{\mu V_\infty}{L^2}\left(\dfrac{\partial^2 u^*}{\partial x^{*2}} + \dfrac{\partial^2 u^*}{\partial y^{*2}}\right)$ — this is Eq. (7.6).`,
      },
      {
        title: 'Divide by the inertia scale',
        md: md`Dividing by $\rho V_\infty^2/L$ leaves coefficient 1 on the inertia and pressure terms and $\dfrac{\mu V_\infty/L^2}{\rho V_\infty^2/L} = \dfrac{\mu}{\rho V_\infty L}$ on the viscous terms — Eq. (7.9).`,
      },
      { title: 'Recognise the group', md: md`$\dfrac{\mu}{\rho V_\infty L} = \dfrac{1}{Re}$, the inverse of the Reynolds number.` },
    ],
    answer: md`$u^*\pd{u^*}{x^*} + v^*\pd{u^*}{y^*} = -\pd{p^*}{x^*} + \dfrac{1}{Re}\left(\dfrac{\partial^2 u^*}{\partial x^{*2}} + \dfrac{\partial^2 u^*}{\partial y^{*2}}\right)$ — Eq. (7.9).`,
    insight: 'After scaling, the whole x-momentum balance contains one number: 1/Re.',
  },
  {
    id: 'ex-which-forces',
    concept: 'nondimensional-equations',
    title: 'Which forces matter? A car and a ship model',
    difficulty: 2,
    given: md`(a) Car in air: $L = 4.0$ m, $V_\infty = 30$ m/s, $\rho = 1.20\ \mathrm{kg/m^3}$, $\mu = 1.81\times10^{-5}\ \mathrm{Pa\,s}$. (b) Ship model in a towing tank: $L = 2.0$ m, $V_\infty = 1.5$ m/s, water $\rho = 998\ \mathrm{kg/m^3}$, $\mu = 1.00\times10^{-3}\ \mathrm{Pa\,s}$. $g = 9.81\ \mathrm{m/s^2}$.`,
    find: md`The two coefficients of Eqs. (7.9)–(7.10) for each, and what they predict.`,
    steps: [
      { title: '(a) viscous coefficient', md: md`$Re = \dfrac{1.20 \times 30 \times 4.0}{1.81\times10^{-5}} = 7.96\times10^{6}$, so $\dfrac{1}{Re} = 1.26\times10^{-7}$` },
      { title: '(a) gravity coefficient', md: md`$\dfrac{gL}{V_\infty^2} = \dfrac{9.81 \times 4.0}{30^2} = 0.0436$` },
      { title: '(b) viscous coefficient', md: md`$Re = \dfrac{998 \times 1.5 \times 2.0}{1.00\times10^{-3}} = 2.99\times10^{6}$, so $\dfrac{1}{Re} = 3.34\times10^{-7}$` },
      { title: '(b) gravity coefficient', md: md`$\dfrac{gL}{V_\infty^2} = \dfrac{9.81 \times 2.0}{1.5^2} = 8.72$ $\;(Fr = 1/\sqrt{8.72} = 0.339)$` },
      {
        title: 'Interpretation',
        md: md`Both $1/Re$ values are tiny: viscous terms are negligible in most of each flow, but thin boundary layers remain (skin friction). For the car $gL/V_\infty^2$ is small — and with no free surface gravity only adds hydrostatic pressure. For the ship it is about 9: with a free surface, gravity (wave making) is as important as inertia, so $Fr$ governs the wave pattern.`,
      },
    ],
    answer: md`(a) $1/Re \approx 1.3\times10^{-7}$, $gL/V_\infty^2 \approx 0.044$; (b) $1/Re \approx 3.3\times10^{-7}$, $gL/V_\infty^2 \approx 8.7$.`,
    insight: 'Same 1/Re regime, opposite gravity regimes — the free surface makes the difference.',
  },
]

/* ------------------------------------------------------------------------------------------------ practice */

export const practice: PracticeDef[] = [
  /* motivation */
  {
    id: 'pr-budget-5',
    concept: 'motivation',
    difficulty: 1,
    q: md`Redo Fox's sphere-drag budget with only **5** values of each of $V$, $D$, $\rho$ and $\mu$, at $\tfrac12$ h per run. How many tests and how many hours does the one-variable-at-a-time programme need? How many tests once the data are organised as $F/\rho V^2D^2 = f(\rho VD/\mu)$ (5 values of the group)?`,
    hint: 'The count is (values per variable)^(number of variables varied).',
    answer: md`$5^4 = 625$ tests, 312.5 h ($\approx 7.8$ weeks of 40 h); with the group: 5 tests (2.5 h).`,
    solution: md`Brute force: $5 \times 5 \times 5 \times 5 = 625$ tests; $625 \times 0.5 = 312.5$ h $= 7.8$ forty-hour weeks.

With dimensional analysis only $\rho VD/\mu$ is varied: $5^1 = 5$ tests, $5 \times 0.5 = 2.5$ h — a factor of 125 fewer.`,
    check: [
      { label: 'brute-force tests', value: 625 },
      { label: 'brute-force hours', value: 312.5, units: 'h' },
    ],
  },
  {
    id: 'pr-same-re-water',
    concept: 'motivation',
    difficulty: 2,
    q: md`A 25 mm sphere is tested in air ($\rho = 1.20\ \mathrm{kg/m^3}$, $\mu = 1.81\times10^{-5}\ \mathrm{Pa\,s}$) at 10 m/s. (a) At what speed in water ($\rho = 998\ \mathrm{kg/m^3}$, $\mu = 1.00\times10^{-3}\ \mathrm{Pa\,s}$) does the **same** sphere have the same $\rho VD/\mu$? (b) By what factor is the drag force in water larger?`,
    hint: 'Same ρVD/μ ⇒ same C_D (one curve). Then F ∝ ρV² for a fixed sphere.',
    answer: md`(a) $V_w \approx 0.664$ m/s; (b) $F_w/F_a \approx 3.67$.`,
    solution: md`(a) With $D$ fixed, equal $\rho VD/\mu$ means equal $V/\nu$, where $\nu = \mu/\rho$: $\nu_a = 1.81\times10^{-5}/1.20 = 1.508\times10^{-5}\ \mathrm{m^2/s}$, $\nu_w = 1.00\times10^{-3}/998 = 1.002\times10^{-6}\ \mathrm{m^2/s}$.

$$
V_w = V_a\,\frac{\nu_w}{\nu_a} = 10 \times \frac{1.002\times10^{-6}}{1.508\times10^{-5}} = 0.664\ \text{m/s}
$$

(b) Same $\rho VD/\mu$ gives the same $F/\rho V^2D^2$ (and the same $C_D$), so with $D$ unchanged

$$
\frac{F_w}{F_a} = \frac{\rho_w V_w^2}{\rho_a V_a^2} = \frac{998 \times 0.664^2}{1.20 \times 10^2} = 3.67
$$

A much slower water test gives a *larger*, easier-to-measure force.`,
    check: [
      { label: 'water speed', value: 0.664, units: 'm/s' },
      { label: 'force ratio', value: 3.67 },
    ],
  },
  {
    id: 'pr-beach-ball',
    concept: 'motivation',
    difficulty: 2,
    q: md`Use Fig. 7.1 to estimate the drag on a smooth beach ball, $D = 0.40$ m, held still in a 3.0 m/s breeze (air: $\rho = 1.20\ \mathrm{kg/m^3}$, $\mu = 1.81\times10^{-5}\ \mathrm{Pa\,s}$).`,
    hint: 'Follow Fox p. 249: compute ρVD/μ, read C_D, then F = C_D · ½ρV² · πD²/4.',
    answer: md`$\rho VD/\mu \approx 8.0\times10^4$, $C_D \approx 0.46$, $F \approx 0.31$ N.`,
    solution: md`$\dfrac{\rho VD}{\mu} = \dfrac{1.20 \times 3.0 \times 0.40}{1.81\times10^{-5}} = 7.96\times10^{4}$ — on the plateau, just before the gentle hump: $C_D \approx 0.46$.

$\tfrac12\rho V^2 = 0.5 \times 1.20 \times 3.0^2 = 5.4$ Pa; $\;\pi D^2/4 = \pi(0.40)^2/4 = 0.1257\ \mathrm{m^2}$.

$$
F = 0.46 \times 5.4 \times 0.1257 = 0.31\ \text{N}
$$

(Reading $C_D$ off a log axis is only good to about ±10 %, and so is $F$.)`,
    check: [{ label: 'drag force', value: 0.31, units: 'N', tol: 0.1 }],
  },
  {
    id: 'pr-trex',
    concept: 'motivation',
    difficulty: 2,
    q: md`The T. Rex case study (Fox p. 245) says running data collapse when $V^2/gl$ is plotted against $s/l$. Two animals use the **same** relative stride $s/l$, so they sit at the same point of that curve. The first, with leg length $l = 1.0$ m, runs at 4.0 m/s. Estimate the speed of the second, with $l = 3.0$ m. (Illustrative numbers.)`,
    hint: 'Same s/l ⇒ same V²/(gl).',
    answer: md`$V_2 = V_1\sqrt{l_2/l_1} = 6.93$ m/s (both have $V^2/gl \approx 1.63$).`,
    solution: md`Same $s/l$ means the same value of $V^2/gl$:

$$
\frac{V_1^2}{g\,l_1} = \frac{V_2^2}{g\,l_2} \;\Rightarrow\; V_2 = V_1\sqrt{\frac{l_2}{l_1}} = 4.0\sqrt{3.0} = 6.93\ \text{m/s}
$$

Check: $V_1^2/(g l_1) = 16/9.81 = 1.63$ and $6.93^2/(9.81 \times 3.0) = 1.63$. The group is a Froude number squared based on leg length.`,
    check: [{ label: 'speed of the larger animal', value: 6.93, units: 'm/s' }],
  },
  {
    id: 'pr-pipe-assumptions',
    concept: 'motivation',
    src: L2,
    difficulty: 1,
    q: md`Slide 2 assumes **steady** flow of an **incompressible Newtonian** fluid in a **long, smooth-walled, horizontal, circular** pipe. For each word in bold, name a variable that would otherwise have to be added to $\Delta p_\ell = f(D, \rho, \mu, V)$.`,
    hint: 'Ask what each assumption lets you leave out.',
    answer: md`time; a compressibility property ($E_v$ or $c$); extra rheological constants; pipe length/entrance length; roughness height; $g$ (elevation change); a second cross-section length.`,
    solution: md`- **steady** → no time $t$ (or frequency);
- **incompressible** → no bulk modulus $E_v$ or speed of sound $c$;
- **Newtonian** → the single property $\mu$ describes the viscous behaviour, no further rheological constants;
- **long** → fully developed flow: the pressure drop *per unit length* is constant, so pipe length and entrance effects drop out;
- **smooth-walled** → no roughness height;
- **horizontal** → no gravity/elevation term ($g$, $\Delta z$) in the pressure change;
- **circular** → one length, $D$, describes the cross-section (no aspect ratio).

Each assumption removes a variable — and with it, potentially, a dimensionless group.`,
  },

  /* dimensions */
  {
    id: 'pr-dims-table',
    concept: 'dimensions',
    difficulty: 1,
    q: md`Give the MLT **and** FLT dimensions of (a) kinematic viscosity $\nu = \mu/\rho$, (b) surface tension $\sigma$, (c) power $\mathcal{P}$, (d) volume flow rate $Q$.`,
    hint: 'Start from MLT and replace M by FL⁻¹T².',
    answer: md`(a) $\dimL^2\dimT^{-1}$ in both; (b) $\dimM\dimT^{-2} \doteq \dimF\dimL^{-1}$; (c) $\dimM\dimL^2\dimT^{-3} \doteq \dimF\dimL\dimT^{-1}$; (d) $\dimL^3\dimT^{-1}$ in both.`,
    solution: md`(a) $\nu \doteq \dfrac{\dimM\dimL^{-1}\dimT^{-1}}{\dimM\dimL^{-3}} = \dimL^{2}\dimT^{-1}$ — no mass or force, identical in both systems.

(b) $\sigma$ = force per length $\doteq \dimF\dimL^{-1} \doteq \dimM\dimL\dimT^{-2}\cdot\dimL^{-1} = \dimM\dimT^{-2}$.

(c) power = force × velocity $\doteq \dimF\dimL\dimT^{-1} \doteq \dimM\dimL^{2}\dimT^{-3}$.

(d) $Q \doteq \dimL^{3}\dimT^{-1}$ in both systems.`,
  },
  {
    id: 'pr-re-units',
    concept: 'dimensions',
    difficulty: 1,
    q: md`Water ($\rho = 998\ \mathrm{kg/m^3}$, $\mu = 1.00\times10^{-3}\ \mathrm{Pa\,s}$) flows at 0.20 m/s in a 5.0 cm pipe. Compute $\rho VD/\mu$ in SI units, then again in cgs units ($\rho = 0.998\ \mathrm{g/cm^3}$, $\mu = 0.0100\ \mathrm{g/(cm\,s)}$, $V = 20$ cm/s, $D = 5.0$ cm).`,
    hint: 'A dimensionless group must come out the same in any consistent unit system.',
    answer: md`$9980$ in both systems.`,
    solution: md`SI: $\dfrac{998 \times 0.20 \times 0.050}{1.00\times10^{-3}} = 9980$.

cgs: $\dfrac{0.998 \times 20 \times 5.0}{0.0100} = 9980$.

Identical, as it must be for a group with zero net exponent of every dimension — the unit conversion factors cancel exactly as the dimensions do.`,
    check: [{ label: 'ρVD/μ', value: 9980 }],
  },
  {
    id: 'pr-exponent-n',
    concept: 'dimensions',
    difficulty: 2,
    q: md`A proposed turbulent-pipe law reads $\Delta p_\ell = C\,\rho V^{n}/D$, with $C$ a pure number. Use FLT dimensions to find the exponent $n$ that makes it dimensionally homogeneous. What does the resulting law imply for $D\Delta p_\ell/\rho V^2$?`,
    hint: 'Equate the exponents of F, L and T on both sides.',
    answer: md`$n = 2$; then $D\Delta p_\ell/\rho V^2 = C$ — a constant, independent of $\rho VD/\mu$.`,
    solution: md`Left: $\Delta p_\ell \doteq \dimF\dimL^{-3}$. Right: $(\dimF\dimL^{-4}\dimT^{2})(\dimL\dimT^{-1})^{n}\dimL^{-1} = \dimF\,\dimL^{n-5}\,\dimT^{2-n}$.

- $\dimF$: $1 = 1$ ✓
- $\dimL$: $-3 = n - 5 \Rightarrow n = 2$
- $\dimT$: $0 = 2 - n \Rightarrow n = 2$ ✓ (consistent)

With $n = 2$, $D\Delta p_\ell/\rho V^2 = C$: the special case of $\phi(\rho VD/\mu)$ = constant. (Supplementary: fully rough pipes behave almost like this at very high $Re$.)`,
    check: [{ label: 'exponent n', value: 2 }],
  },
  {
    id: 'pr-vd-nu',
    concept: 'dimensions',
    difficulty: 2,
    q: md`Find the exponents $a$ and $b$ that make $V\,D^{a}\,\nu^{b}$ dimensionless ($\nu$ = kinematic viscosity). Which familiar group results?`,
    hint: 'ν ≐ L²T⁻¹; only L and T appear, so you get two equations.',
    answer: md`$a = 1$, $b = -1$: $VD/\nu = \rho VD/\mu$, the Reynolds number.`,
    solution: md`$(\dimL\dimT^{-1})(\dimL)^{a}(\dimL^{2}\dimT^{-1})^{b} \doteq \dimL^{0}\dimT^{0}$

- $\dimT$: $-1 - b = 0 \Rightarrow b = -1$
- $\dimL$: $1 + a + 2b = 0 \Rightarrow a = 1$

So $VD/\nu$, and since $\nu = \mu/\rho$ this is $\rho VD/\mu$.`,
    check: [
      { label: 'a', value: 1 },
      { label: 'b', value: -1 },
    ],
  },
  {
    id: 'pr-homog-which',
    concept: 'dimensions',
    difficulty: 2,
    q: md`Which of these laminar-pipe formulas are dimensionally homogeneous? (a) $\Delta p_\ell = 32\mu V/D^2$; (b) $\Delta p_\ell = 32\mu V/D$; (c) $Q = \pi D^4 \Delta p_\ell/(128\,\mu)$.`,
    hint: 'Use FLT: μ ≐ FL⁻²T, Δpℓ ≐ FL⁻³, Q ≐ L³T⁻¹.',
    answer: md`(a) yes; (b) no — it has dimensions $\dimF\dimL^{-2}$, a pressure; (c) yes.`,
    solution: md`(a) $\dfrac{\mu V}{D^2} \doteq \dfrac{(\dimF\dimL^{-2}\dimT)(\dimL\dimT^{-1})}{\dimL^{2}} = \dimF\dimL^{-3}$ ✓ — matches $\Delta p_\ell$.

(b) $\dfrac{\mu V}{D} \doteq \dimF\dimL^{-2}$ ✗ — a pressure, not a pressure per length.

(c) $\dfrac{D^4\Delta p_\ell}{\mu} \doteq \dfrac{\dimL^{4}\,\dimF\dimL^{-3}}{\dimF\dimL^{-2}\dimT} = \dimL^{3}\dimT^{-1}$ ✓ — a volume flow rate.

Numbers such as 32 and $\pi/128$ are dimensionless and cannot rescue (b). (Supplementary: (a) and (c) are the Hagen–Poiseuille results, and (a) is $D\Delta p_\ell/\rho V^2 = 32/Re$.)`,
  },

  /* nondimensional equations */
  {
    id: 'pr-river',
    concept: 'nondimensional-equations',
    difficulty: 1,
    q: md`A river is 2.0 m deep and flows at 1.0 m/s (water: $\rho = 998\ \mathrm{kg/m^3}$, $\mu = 1.00\times10^{-3}\ \mathrm{Pa\,s}$). Taking $L$ = depth, evaluate the two coefficients of Eqs. (7.9)–(7.10) and $Fr$. Which forces matter?`,
    hint: '1/Re = μ/(ρV∞L); gL/V∞² = 1/Fr².',
    answer: md`$1/Re = 5.0\times10^{-7}$, $gL/V_\infty^2 = 19.6$, $Fr = 0.23$: viscosity negligible away from the bed; gravity dominant (free surface).`,
    solution: md`$Re = \dfrac{998 \times 1.0 \times 2.0}{1.00\times10^{-3}} = 2.00\times10^{6}$, so $1/Re = 5.0\times10^{-7}$ — viscous terms matter only in a thin layer near the bed.

$\dfrac{gL}{V_\infty^2} = \dfrac{9.81 \times 2.0}{1.0^2} = 19.6$, so $Fr = 1/\sqrt{19.6} = 0.23$.

Gravity is about twenty times the inertia scale and there is a free surface: gravity controls the flow (supplementary: in open channels, $Fr < 1$ is called subcritical).`,
    check: [
      { label: '1/Re', value: 5.01e-7 },
      { label: 'gL/V∞²', value: 19.62 },
    ],
  },
  {
    id: 'pr-derive-710',
    concept: 'nondimensional-equations',
    src: [F246, F247],
    difficulty: 2,
    q: md`Starting from Eq. (7.3), substitute Eq. (7.4) and divide by $\rho V_\infty^2/L$ to obtain Eq. (7.10). Show where the coefficient of the gravity term comes from.`,
    hint: 'ρg is a constant: it is not touched by the substitution, only by the division.',
    answer: md`Eq. (7.10), with gravity coefficient $\rho g/(\rho V_\infty^2/L) = gL/V_\infty^2$ and viscous coefficient $\mu/\rho V_\infty L$.`,
    solution: md`Substituting (as for $x$-momentum) gives Eq. (7.7):

$$
\frac{\rho V_\infty^2}{L}\left(u^*\pd{v^*}{x^*} + v^*\pd{v^*}{y^*}\right) = -\rho g - \frac{\rho V_\infty^2}{L}\pd{p^*}{y^*} + \frac{\mu V_\infty}{L^2}\left(\frac{\partial^2 v^*}{\partial x^{*2}} + \frac{\partial^2 v^*}{\partial y^{*2}}\right)
$$

Divide every term by $\rho V_\infty^2/L$:

- inertia and pressure terms → coefficient 1;
- gravity: $\dfrac{\rho g}{\rho V_\infty^2/L} = \dfrac{gL}{V_\infty^2}$;
- viscous: $\dfrac{\mu V_\infty/L^2}{\rho V_\infty^2/L} = \dfrac{\mu}{\rho V_\infty L}$.

$$
u^*\pd{v^*}{x^*} + v^*\pd{v^*}{y^*} = -\frac{gL}{V_\infty^2} - \pd{p^*}{y^*} + \frac{\mu}{\rho V_\infty L}\left(\frac{\partial^2 v^*}{\partial x^{*2}} + \frac{\partial^2 v^*}{\partial y^{*2}}\right)
$$

which is Eq. (7.10); $gL/V_\infty^2 = 1/Fr^2$.`,
  },
  {
    id: 'pr-model-25',
    concept: 'nondimensional-equations',
    difficulty: 3,
    q: md`A ship moves at $V_p = 5.0$ m/s. A 1:25 model ($L_m/L_p = 1/25$) is tested in water, like the prototype. (a) What model speed matches $gL/V_\infty^2$ (i.e. $Fr$)? (b) What model speed would match $Re$? (c) What ratio $\nu_m/\nu_p$ would let both match at once?`,
    hint: 'Fr: V/√(gL) equal. Re: VL/ν equal.',
    answer: md`(a) 1.0 m/s; (b) 125 m/s; (c) $\nu_m/\nu_p = (1/25)^{3/2} = 0.008$.`,
    solution: md`(a) $\dfrac{V_m}{\sqrt{gL_m}} = \dfrac{V_p}{\sqrt{gL_p}} \Rightarrow V_m = V_p\sqrt{L_m/L_p} = 5.0/\sqrt{25} = 1.0$ m/s.

(b) $\dfrac{V_mL_m}{\nu} = \dfrac{V_pL_p}{\nu} \Rightarrow V_m = V_p\,\dfrac{L_p}{L_m} = 5.0 \times 25 = 125$ m/s — absurd (and it would wreck $Fr$).

(c) Both: $V_m/V_p = \sqrt{\lambda}$ and $V_m/V_p = (\nu_m/\nu_p)/\lambda$ with $\lambda = 1/25$, so $\nu_m/\nu_p = \lambda^{3/2} = 0.008$ — a liquid 125 times less viscous (kinematically) than water. Fox p. 247: the two flows give identical solutions only if *both* coefficients match; in practice ship models match $Fr$ and correct for $Re$ (supplementary; see the similitude topic).`,
    check: [
      { label: 'model speed for Fr', value: 1.0, units: 'm/s' },
      { label: 'model speed for Re', value: 125, units: 'm/s' },
      { label: 'ν ratio', value: 0.008 },
    ],
  },
  {
    id: 'pr-glycerin',
    concept: 'nondimensional-equations',
    difficulty: 2,
    q: md`Glycerin ($\rho = 1260\ \mathrm{kg/m^3}$, $\mu = 1.41\ \mathrm{Pa\,s}$) is pushed at 1.0 cm/s through a closed 1.0 cm gap ($L = 0.010$ m). Evaluate $Re$ and $gL/V_\infty^2$. Which term dominates Eq. (7.9)? The gravity coefficient is huge — does gravity shape the velocity field?`,
    hint: 'A closed channel has no free surface.',
    answer: md`$Re = 0.089$ ($1/Re = 11.2$): viscous forces dominate. $gL/V_\infty^2 = 981$, yet with no free surface gravity only adds hydrostatic pressure.`,
    solution: md`$Re = \dfrac{1260 \times 0.010 \times 0.010}{1.41} = 0.0894$, so $1/Re = 11.2$: the viscous term is about ten times the inertia term — creeping flow.

$\dfrac{gL}{V_\infty^2} = \dfrac{9.81 \times 0.010}{0.010^2} = 981$. Taken at face value (Fox p. 247) gravity is "significant" — and as a *force* it is: it is balanced by a large vertical pressure gradient. But in a closed channel of constant density the modified pressure $p + \rho g y$ absorbs it completely (supplementary), so gravity changes $p$ but not the velocities.`,
    check: [{ label: 'Re', value: 0.0894 }],
  },
  {
    id: 'pr-no-slip',
    concept: 'nondimensional-equations',
    src: F247,
    difficulty: 2,
    q: md`At very high $Re$, why may the viscous terms of Eq. (7.9) be dropped only "in most of the flow", and what is lost mathematically if they are dropped everywhere?`,
    hint: 'Think about the order of the derivatives and the boundary conditions each order can satisfy.',
    answer: md`Near walls a thin boundary layer remains where viscosity matters; dropping the second-order terms lowers the order of the equations, so one boundary condition — no-slip — can no longer be imposed.`,
    solution: md`With $\mu/\rho V_\infty L \ll 1$ the viscous terms are negligible wherever the starred derivatives are $O(1)$, and Eqs. (7.9)–(7.10) reduce to a form of Euler's equations (Fox Eqs. 6.2).

Near a wall, however, the velocity must fall to zero over a very thin layer, so the second derivatives become huge and the product (small coefficient) × (huge derivative) is no longer small: a **boundary layer** survives.

Mathematically, dropping the highest (second-order) derivatives reduces the order of the equations; a lower-order equation accepts fewer boundary conditions, and the one lost is **no-slip** (the Euler solution only enforces no flow *through* the wall). Fox: it is always dangerous to neglect higher-order derivatives, even when their coefficients are small.`,
  },
]

/* ------------------------------------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-mot-curves',
    concept: 'motivation',
    src: L3,
    difficulty: 1,
    q: md`After dimensional analysis, the pipe problem $\Delta p_\ell = f(D,\rho,\mu,V)$ has how many **independent** variables on the right-hand side?`,
    options: [
      md`One: $\rho VD/\mu$`,
      md`Four: one for each of $D$, $\rho$, $\mu$, $V$`,
      md`Two: $\rho VD/\mu$ and $D\Delta p_\ell/\rho V^2$`,
      md`None — dimensional analysis gives $\Delta p_\ell$ exactly`,
    ],
    answer: 0,
    explain: md`Slide 3: $D\Delta p_\ell/\rho V^2 = \phi(\rho VD/\mu)$ — one dependent group as a function of **one** independent group. $D\Delta p_\ell/\rho V^2$ contains the dependent variable, so it sits on the left, not among the independent variables; and $\phi$ itself is still unknown.`,
  },
  {
    id: 'q-mot-phi',
    concept: 'motivation',
    src: [L3, F249],
    difficulty: 1,
    q: 'What does dimensional analysis **not** provide?',
    options: [
      'The actual form of the function relating the groups',
      'Which combinations of variables should be plotted against each other',
      'A large reduction in the number of experiments',
      'A way to organise data from different fluids onto one curve',
    ],
    answer: 0,
    explain: md`The groups and the *form* $\Pi_1 = \phi(\Pi_2)$ come from dimensional analysis, but the shape of $\phi$ (or $G_1$) must be found by experiment or theory — Fox p. 249: "the theorem does not predict the functional form". The other options are exactly what it is good for.`,
  },
  {
    id: 'q-mot-budget',
    concept: 'motivation',
    src: F248,
    difficulty: 1,
    q: 'In Fox’s estimate for sphere drag (10 values of each parameter), roughly how many tests does a brute-force programme need, and how many with dimensional analysis?',
    options: ['About 10⁴ versus about 10', 'About 100 versus about 10', 'About 10⁴ versus about 100', 'About 40 versus about 4'],
    answer: 0,
    explain: md`Four parameters at 10 values each give $10^4$ tests (about $2\tfrac12$ years at ½ h per run); organised as $F/\rho V^2D^2 = f(\rho VD/\mu)$ only one group varies, so about 10 tests. "100" is the count for just $V$ and $D$ in one fluid.`,
  },
  {
    id: 'q-mot-vary',
    concept: 'motivation',
    src: F248,
    difficulty: 2,
    q: md`To map $F/\rho V^2D^2 = f(\rho VD/\mu)$ for a smooth sphere, the most convenient experiment is to…`,
    options: [
      'use one sphere in one fluid and vary only the speed',
      'test ten spheres in ten fluids, each at a single speed',
      'vary ρ and μ independently while keeping ρVD/μ fixed',
      'measure at one ρVD/μ and scale the result to all others',
    ],
    answer: 0,
    explain: md`Only $\rho VD/\mu$ must be varied, and changing $V$ does that (Fox: one 25 mm sphere in air). Holding $\rho VD/\mu$ fixed while changing $\rho$, $\mu$ just reproduces the same point; a single point cannot give the shape of $f$.`,
  },
  {
    id: 'q-mot-fig71',
    concept: 'motivation',
    src: F248,
    difficulty: 2,
    q: md`On the log–log axes of Fig. 7.1, how does $C_D$ behave as $\rho VD/\mu$ rises from about $2.5\times10^5$ to $3.3\times10^5$?`,
    options: [
      'It drops abruptly, from about 0.4 to about 0.1',
      'It stays on the 0.4–0.5 plateau',
      'It falls along a straight line of slope −1',
      'It rises steadily toward 1',
    ],
    answer: 0,
    explain: md`Between about $2.5\times10^5$ and $3.3\times10^5$ the curve falls almost vertically from ≈ 0.4 to ≈ 0.1, reaching a minimum ≈ 0.08–0.09 near $4\times10^5$. The slope −1 belongs to low $\rho VD/\mu$; the plateau to $10^3$–$2\times10^5$.`,
  },
  {
    id: 'q-dim-mu',
    concept: 'dimensions',
    src: L3,
    difficulty: 1,
    q: md`In the **FLT** system, dynamic viscosity $\mu$ has dimensions…`,
    options: [md`$\dimF\dimL^{-2}\dimT$`, md`$\dimM\dimL^{-1}\dimT^{-1}$`, md`$\dimF\dimL^{-4}\dimT^{2}$`, md`$\dimL^{2}\dimT^{-1}$`],
    answer: 0,
    explain: md`$\mu$ = shear stress ÷ velocity gradient $\doteq \dimF\dimL^{-2}/\dimT^{-1} = \dimF\dimL^{-2}\dimT$ (slide 3). $\dimM\dimL^{-1}\dimT^{-1}$ is correct but in MLT; $\dimF\dimL^{-4}\dimT^{2}$ is density; $\dimL^2\dimT^{-1}$ is kinematic viscosity.`,
  },
  {
    id: 'q-dim-f',
    concept: 'dimensions',
    src: L3,
    difficulty: 1,
    q: md`Why can't $\dimM$, $\dimF$, $\dimL$ and $\dimT$ all be used together as independent basic dimensions?`,
    options: [
      md`Newton's second law links them: $\dimF \doteq \dimM\dimL\dimT^{-2}$`,
      'Force is itself dimensionless',
      'Time is not a physical dimension',
      'The FLT system is only used with US customary units',
    ],
    answer: 0,
    explain: md`Slide 3: the basic dimensions are $\dimM\dimL\dimT$ **or** $\dimF\dimL\dimT$, because $F = ma$ makes force a combination of mass, length and time. Both systems work with any unit system, SI included.`,
  },
  {
    id: 'q-dim-dpl',
    concept: 'dimensions',
    src: L3,
    difficulty: 1,
    q: md`The pressure drop per unit length $\Delta p_\ell$ has FLT dimensions…`,
    options: [md`$\dimF\dimL^{-3}$`, md`$\dimF\dimL^{-2}$`, md`$\dimF\dimL^{-1}$`, md`$\dimM\dimL^{-1}\dimT^{-2}$`],
    answer: 0,
    explain: md`A pressure ($\dimF/\dimL^2$) divided by a length: $(\dimF/\dimL^2)/\dimL = \dimF\dimL^{-3}$ (slide 3). $\dimF\dimL^{-2}$ forgets the "per unit length"; $\dimM\dimL^{-1}\dimT^{-2}$ is a plain pressure in MLT.`,
  },
  {
    id: 'q-dim-homog',
    concept: 'dimensions',
    src: L6,
    difficulty: 1,
    q: md`An equation $u_1 = f(u_2, \ldots, u_k)$ is dimensionally homogeneous when…`,
    options: [
      'every term that stands by itself on the right has the same dimensions as the left-hand side',
      'it contains only dimensionless groups',
      'it is written in SI units',
      'all its numerical constants equal 1',
    ],
    answer: 0,
    explain: md`Slide 6: the left side must have the same dimensions as any term standing by itself on the right. An equation can be homogeneous without being dimensionless, in any consistent unit system, and with any pure-number constants (such as 32 in $32\mu V/D^2$).`,
  },
  {
    id: 'q-dim-trap',
    concept: 'dimensions',
    difficulty: 2,
    q: md`Is $\rho V^2/\mu$ dimensionless?`,
    options: [
      md`No — it has dimensions $\dimT^{-1}$; a length is missing`,
      'Yes — it is the Reynolds number',
      'No — it has the dimensions of a pressure',
      'Yes, but only in SI units',
    ],
    answer: 0,
    explain: md`$\dfrac{(\dimM\dimL^{-3})(\dimL^2\dimT^{-2})}{\dimM\dimL^{-1}\dimT^{-1}} = \dimT^{-1}$, a rate. Multiplying by a length and dividing by a velocity gives $\rho VL/\mu$, the real Reynolds number. Dimensionlessness never depends on the unit system.`,
  },
  {
    id: 'q-nd-coef',
    concept: 'nondimensional-equations',
    src: F247,
    difficulty: 1,
    q: 'In the nondimensional x-momentum equation (7.9), the coefficient of the viscous (second-derivative) terms is…',
    options: [md`$\mu/\rho V_\infty L = 1/Re$`, md`$\rho V_\infty L/\mu = Re$`, md`$gL/V_\infty^2$`, '1'],
    answer: 0,
    explain: md`Dividing the viscous scale $\mu V_\infty/L^2$ by the inertia scale $\rho V_\infty^2/L$ gives $\mu/\rho V_\infty L$, the **inverse** Reynolds number. $gL/V_\infty^2$ multiplies the gravity term and appears only in (7.10); the inertia and pressure terms carry the coefficient 1.`,
  },
  {
    id: 'q-nd-pstar',
    concept: 'nondimensional-equations',
    src: F246,
    difficulty: 1,
    q: md`In Eq. (7.4) pressure is made dimensionless with $\rho V_\infty^2$, which equals…`,
    options: ['twice the freestream dynamic pressure', 'the freestream dynamic pressure', 'the stagnation pressure', md`the hydrostatic pressure $\rho gL$`],
    answer: 0,
    explain: md`The dynamic pressure is $\tfrac12\rho V_\infty^2$, so $\rho V_\infty^2$ is **twice** it (Fox p. 246). The factor ½ is a matter of convention — it reappears in $C_D$ and in the pressure coefficient.`,
  },
  {
    id: 'q-nd-noslip',
    concept: 'nondimensional-equations',
    src: F247,
    difficulty: 2,
    q: md`Dropping the viscous terms of (7.9) when $1/Re$ is very small is mathematically "dangerous" because…`,
    options: [
      'the equations drop to lower order and can no longer satisfy the no-slip condition',
      'the equations become linear and lose the pressure term',
      'the continuity equation is then violated',
      'the gravity coefficient becomes infinite',
    ],
    answer: 0,
    explain: md`Neglecting the highest derivatives reduces the order of the equations, so a boundary condition is lost — specifically no-slip (Fox p. 247). That is why a boundary layer always remains near walls. The Euler equations are still nonlinear, still contain $p$, and continuity is unchanged.`,
  },
  {
    id: 'q-nd-similar',
    concept: 'nondimensional-equations',
    src: F247,
    difficulty: 2,
    q: 'Two geometrically similar flows of different size (a model and a prototype) obey Eqs. (7.8)–(7.10). They give identical nondimensional solutions only if…',
    options: [
      md`both $\mu/\rho V_\infty L$ and $gL/V_\infty^2$ are the same in the two flows`,
      md`only $\mu/\rho V_\infty L$ is the same`,
      'they use the same fluid',
      'they run at the same speed',
    ],
    answer: 0,
    explain: md`Fox p. 247: the equations yield the same mathematical results only if both coefficients match — i.e. gravity, viscous and inertia forces have the same relative importance (plus similar boundary conditions). Same fluid or same speed is neither necessary nor sufficient.`,
  },
  {
    id: 'q-nd-gravity',
    concept: 'nondimensional-equations',
    difficulty: 3,
    q: md`For air flowing past a car (no free surface, constant density), $gL/V_\infty^2 \approx 0.04$. What does gravity do to the **velocity** field?`,
    options: [
      'Essentially nothing — it only adds a hydrostatic part to the pressure',
      'It dominates the flow, since its coefficient is not zero',
      'It roughly doubles the drag',
      'It makes the flow compressible',
    ],
    answer: 0,
    explain: md`With constant density and no free surface, the modified pressure $p + \rho g y$ absorbs the $-\rho g$ term, so gravity changes $p$ but not $u$ and $v$ (supplementary). That is why the Froude number matters for flows *with a free surface* (Lecture 13's table, slide 21). A small coefficient never means "dominant".`,
  },
]

/* ------------------------------------------------------------------------------------------------ flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-da-purpose',
    front: 'What is dimensional analysis good for?',
    back: md`Insight **before** extensive theory or experiments, and organising data into trends: combine the variables into dimensionless groups so that one curve replaces many — key to planning, running and interpreting experiments.`,
    src: [F245, L3],
  },
  {
    id: 'fc-pipe-groups',
    front: md`Dimensionless form of $\Delta p_\ell = f(D, \rho, \mu, V)$?`,
    back: md`$\dfrac{D\,\Delta p_\ell}{\rho V^2} = \phi\!\left(\dfrac{\rho VD}{\mu}\right)$ — one curve; $\phi$ from experiment.`,
    src: L3,
  },
  {
    id: 'fc-cd',
    front: 'Drag coefficient of a sphere, and how to use Fig. 7.1?',
    back: md`$C_D = F\big/\left(\tfrac12\rho V^2\,\pi D^2/4\right)$. Compute $\rho VD/\mu$ → read $C_D$ → $F = C_D\,\tfrac12\rho V^2\,\pi D^2/4$.`,
    src: [F248, F249],
  },
  {
    id: 'fc-budget',
    front: 'Brute force vs. dimensional analysis for sphere drag (Fox)?',
    back: md`10 values each of $V, D, \rho, \mu$ → $10^4$ tests ≈ 2½ years at ½ h per run. With $F/\rho V^2D^2 = f(\rho VD/\mu)$: ≈ 10 tests, one sphere, one fluid, vary the speed.`,
    src: F248,
  },
  {
    id: 'fc-F-MLT',
    front: 'How are the MLT and FLT systems linked?',
    back: md`$\dimF \doteq \dimM\dimL\dimT^{-2}$ (Newton's 2nd law), so $\dimM \doteq \dimF\dimL^{-1}\dimT^{2}$. Use either system — never both as independent.`,
    src: L3,
  },
  {
    id: 'fc-rho-mu',
    front: md`FLT dimensions of $\rho$, $\mu$ and $\Delta p_\ell$?`,
    back: md`$\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\;\mu \doteq \dimF\dimL^{-2}\dimT$, $\;\Delta p_\ell \doteq \dimF\dimL^{-3}$.`,
    src: L3,
  },
  {
    id: 'fc-homog',
    front: 'Dimensional homogeneity?',
    back: md`The left side has the same dimensions as every term standing by itself on the right. A product is **dimensionless** when the net exponent of every basic dimension is zero — then its value is the same in any consistent units.`,
    src: [L6, L4],
  },
  {
    id: 'fc-doteq',
    front: md`What does $\doteq$ mean in Lecture 13?`,
    back: md`"Has the dimensions of", e.g. $\mu \doteq \dimF\dimL^{-2}\dimT$. Fox writes square brackets, $[\mu] = \dimF\dimL^{-2}\dimT$, and uses lower-case $t$ for time.`,
  },
  {
    id: 'fc-scales',
    front: 'Scales used to nondimensionalize Eqs. (7.1)–(7.3)?',
    back: md`Lengths by $L$, velocities by $V_\infty$, pressure by $\rho V_\infty^2$ (twice the dynamic pressure) — Eq. (7.4).`,
    src: F246,
  },
  {
    id: 'fc-coefs',
    front: 'The two coefficients of Eqs. (7.9)–(7.10) and their meaning?',
    back: md`$\mu/\rho V_\infty L = 1/Re$ (viscous ÷ inertia) on the viscous terms; $gL/V_\infty^2 = 1/Fr^2$ (gravity ÷ inertia) on the gravity term.`,
    src: F247,
  },
  {
    id: 'fc-euler',
    front: md`What happens as $1/Re \to 0$?`,
    back: md`Viscous terms negligible in **most** of the flow → Euler's equations; but a boundary layer remains, and dropping the 2nd-order terms everywhere loses the no-slip condition.`,
    src: F247,
  },
  {
    id: 'fc-similar',
    front: 'When do a model and its prototype share the same nondimensional solution?',
    back: md`When they are geometrically similar and **both** coefficients ($Re$ and $gL/V_\infty^2$) — and the nondimensional boundary conditions — are equal.`,
    src: F247,
  },
]

/* ------------------------------------------------------------------------------------------------ takeaways */

export const takeaways: string[] = [
  md`A law among $k$ dimensional variables can be rewritten among fewer **dimensionless groups**: $\Delta p_\ell = f(D,\rho,\mu,V)$ becomes $D\Delta p_\ell/\rho V^2 = \phi(\rho VD/\mu)$ — one curve instead of families of curves (Lecture 13, slides 2–3).`,
  md`Dimensional analysis gives the **form** of the relation, never the function $\phi$ itself — that comes from experiment (e.g. Fig. 7.1) or theory.`,
  md`The experimental payoff is enormous: $n$ values of 4 variables need $n^4$ tests, one group needs $n$ (Fox: $10^4$ tests ≈ 2½ years → about 10 tests, one sphere in one fluid at different speeds).`,
  md`Basic dimensions are $\dimM\dimL\dimT$ **or** $\dimF\dimL\dimT$, linked by $\dimF \doteq \dimM\dimL\dimT^{-2}$; in FLT $\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\mu \doteq \dimF\dimL^{-2}\dimT$, $\Delta p_\ell \doteq \dimF\dimL^{-3}$.`,
  md`A product is dimensionless when the net exponent of **every** basic dimension is zero ($\dimF^0\dimL^0\dimT^0$); then its value is identical in SI, cgs or any consistent units.`,
  md`**Dimensional homogeneity** — every additive term has the dimensions of the left side — catches algebra errors and is the precondition of the Buckingham pi theorem.`,
  md`Scaling lengths by $L$, velocities by $V_\infty$ and pressure by $\rho V_\infty^2$ turns Eqs. (7.1)–(7.3) into (7.8)–(7.10), which contain only $\mu/\rho V_\infty L = 1/Re$ and $gL/V_\infty^2 = 1/Fr^2$.`,
  md`Large $1/Re$ → viscous forces significant; tiny $1/Re$ → Euler's equations in most of the flow, but a boundary layer remains because no-slip cannot be dropped. Large $gL/V_\infty^2$ → gravity significant (decisive with a free surface).`,
  md`Model and prototype give the same nondimensional solution only when **both** coefficients match — the seed of similitude, and why Re and Fr can rarely be matched together with the same fluid.`,
  md`Exam traps: count the dependent variable in $k$; check groups exponent by exponent; slide 3's abscissa $\rho VD/\mu$ is $1/\Pi_2$ in the slide-15 notation; $\rho V_\infty^2$ is *twice* the dynamic pressure.`,
]

/* ------------------------------------------------------------------------------------------------ content */

export default function Content() {
  return (
    <>
      {/* ============================================================== Concept 1 — motivation */}
      <Concept id="motivation">
        <Step kind="intro" src={[L2, F245]}>
          <Md>{md`Unit C opens with a deceptively plain question (**Lecture 13, slide 2**). Fluid flows **steadily** through a
          **long, smooth-walled, horizontal, circular** pipe; the fluid is **incompressible** and **Newtonian**. How large is the
          **pressure drop per unit length**, $\Delta p_\ell$, that develops along the pipe *as a result of friction*? Experience says
          it depends on the pipe diameter $D$, the fluid density $\rho$, the fluid viscosity $\mu$ and the mean velocity $V$:

          $$
          \Delta p_\ell = f(D,\ \rho,\ \mu,\ V)
          $$

          Five variables and an unknown function $f$. Finding $f$ by experiment, one variable at a time, means four families of
          curves — and every family repeated for many values of the variables held fixed. This topic shows how grouping the
          variables into **dimensionless products** collapses all of that onto a *single* curve, and why the governing equations
          themselves point to the same groups.`}</Md>
          <Callout kind="def" title="Dimensional analysis">
            <Md>{md`A technique for gaining insight into a flow — in fact into many engineering and scientific phenomena — **before**
            any extensive theoretical analysis or experimentation, and for extracting trends from data that would otherwise remain
            disorganized and incoherent (Fox, p. 245). Its tool is the dimensionless group: a product of powers of the variables in
            which every dimension cancels.`}</Md>
          </Callout>
          <Md>{md`You have already been using such groups. Fox's Chapter 7 opener (p. 245) recalls four of them:

          - a flow with typical speed $V$ is essentially **incompressible** if the Mach number $M = V/c$ is below about 0.3 ($c$ =
            speed of sound);
          - **viscous effects** can be neglected in most of a flow if the Reynolds number $Re = \rho VL/\mu$ is "large" ($L$ = a
            characteristic size of the flow);
          - $Re = \rho VD/\mu$ predicts, with high accuracy, whether a **pipe flow** is laminar or turbulent;
          - in heat transfer, the **Biot number** $Bi = hL/k$ of a hot body (size $L$, conductivity $k$) plunged into a cool fluid
            (convection coefficient $h$) tells whether it cools on the outside surface first or basically uniformly.

          How do we obtain such groupings, and why do their *values* have such strong predictive power? Answering that is the job of
          this chapter. (Fox also lists the chapter's sections: 7.1 nondimensionalizing the basic differential equations, 7.2 nature
          of dimensional analysis, 7.3 Buckingham Pi theorem, 7.4 significant dimensionless groups, 7.5 flow similarity and model
          studies, 7.6 summary — this topic covers 7.1–7.2.)`}</Md>
          <Supplement title="What each pipe assumption removes from the variable list">
            <Md>{md`Each word on slide 2 earns its place by deleting a variable: **steady** — no time; **incompressible** — no
            compressibility property such as $E_v$; **Newtonian** — the single property $\mu$ describes the viscous behaviour;
            **long** — fully developed flow, so the pressure drop *per unit length* is constant and pipe length does not appear;
            **smooth-walled** — no roughness; **horizontal** — no elevation (gravity) effect on the pressure change; **circular** —
            one length, $D$, describes the cross-section. Fewer variables means fewer groups.`}</Md>
          </Supplement>
          <Supplement title="Fox's open question: what does a high Biot number predict?">
            <Md>{md`$Bi = hL/k$ compares the resistance to conduction *inside* the body ($L/k$) with the resistance to convection at its
            surface ($1/h$). At high $Bi$ the inside cannot keep up: the **surface cools first** and large internal temperature
            gradients form. At low $Bi$ (commonly below about 0.1) the body cools nearly **uniformly** ("lumped" behaviour).
            Standard heat-transfer result, not from the course PDFs.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`**Nature does not know our units.** Whether you measure $D$ in metres or inches, the pipe produces the same pressure
          drop. So any correct physical law must survive a change of units — and the only quantities whose numerical value survives
          *every* change of units are the **dimensionless** ones. A law among $D, \rho, \mu, V, \Delta p_\ell$ can therefore always be
          rewritten as a law among dimensionless combinations of them.

          How many combinations? Fewer than the variables. Five variables built from three dimensions (force, length, time) leave
          room for only $5 - 3 = 2$ independent groups — one containing $\Delta p_\ell$, one not. The pipe "feels" the four
          parameters only through a single combination: $\rho VD/\mu$, a ratio of inertial to viscous effects. Two pipes with
          different fluids, sizes and speeds but the same $\rho VD/\mu$ are, dimensionlessly, *the same experiment*.`}</Md>
          <Callout kind="tip" title="An everyday analogy">
            <Md>{md`A map is useful at any size because only *ratios* of distances matter. A dimensionless group is a scale-free
            description of a flow: once you know the curve in group form, every pipe and every fluid is just a "reprint at a
            different scale".`}</Md>
          </Callout>
          <Md>{md`The calculator below uses Fox's numbers (p. 248) to show what is at stake for the drag on a sphere: the number of
          tests grows like $n^k$ for $n$ values of each of $k$ quantities, and dimensional analysis shrinks $k$.`}</Md>
          <BudgetCalc />
        </Step>

        <Step kind="visual" src={[{ doc: 'lec13', pages: '2–3' }, F245, F248]}>
          <Figure
            caption="Slide 2: four one-variable-at-a-time experiments, each holding three variables fixed. Slide 3: the same data, plotted as DΔpℓ/(ρV²) against ρVD/μ, fall on one curve. Qualitative — the slides carry no scales."
            src={{ doc: 'lec13', pages: '2–3' }}
          >
            <PipeSlideFigure />
          </Figure>
          <Figure
            caption="Fig. 7.1: drag coefficient of smooth spheres against ρVD/μ (log–log). Results from several workers, fluids and spheres fall on one curve. Curve digitised approximately (±10 %); the dashed Stokes line is supplementary."
            src={{ doc: 'fox', pages: '248', note: 'Fig. 7.1' }}
          >
            <SphereDragFigure />
          </Figure>
          <Md>{md`Read Fig. 7.1 from left to right: at low $\rho VD/\mu$ a nearly straight line of slope ≈ −1 (from ≈ 250–260 at
          $\rho VD/\mu = 0.1$); $C_D \approx 1$ near $\rho VD/\mu \approx 100$; a plateau of ≈ 0.4–0.5 from about $10^3$ to
          $2\times10^5$ (shallow minimum ≈ 0.40, gentle hump ≈ 0.47); an **abrupt drop** between about $2.5\times10^5$ and
          $3.3\times10^5$ to a minimum of ≈ 0.08–0.09 near $4\times10^5$; and a rise to ≈ 0.15 at $10^6$. In the printed figure the
          points (open and filled circles, from different sources) lie on the curve within experimental error.`}</Md>
          <Callout kind="note" title="The same trick, far from fluids — Case Study “T. Rex” (Fox p. 245)">
            <FlowSteps
              tone="emerald"
              steps={[
                { title: 'The puzzle', md: md`How fast could dinosaurs run? The fossil record gives only average **leg length** $l$ and **stride** $s$. (The book credits Professor Alexander McNeil, Heriot-Watt University.)` },
                { title: 'Raw data fail', md: md`Comparing $l$, $s$ and speed $V$ directly for quadrupeds (horses, dogs) and bipeds (humans) shows **no pattern**.` },
                { title: 'Plot the groups', md: md`Plot $V^2/gl$ against $s/l$: the data for most animals fall approximately on **one curve**.` },
                { title: 'Predict', md: md`Take $s/l$ from fossils, interpolate $V^2/gl$, solve for $V$. Verdict: unlike in the *Jurassic Park* movies, humans could probably easily outrun *T. rex*.` },
              ]}
            />
          </Callout>
        </Step>

        <Step kind="equations" src={[L2, L3, F245, F247, F248, F249]}>
          <FormulaCard id="pipe-dp-function" />
          <FormulaCard id="pipe-pi-relation" />
          <Callout kind="key" title="Slide 3's two messages">
            <Md>{md`(1) $\Delta p_\ell = f(D,\rho,\mu,V)$ is replaced by a relation in which $D\Delta p_\ell/\rho V^2$ depends on **only
            one** variable, $\rho VD/\mu$. (2) Dimensionless products are important and useful in the **planning, execution and
            interpretation of experiments**.`}</Md>
          </Callout>
          <FormulaCard id="chapter-groups" />
          <FormulaCard id="trex-groups" />
          <FormulaCard id="sphere-drag-function" />
          <FormulaCard id="sphere-drag-pi" />
          <FormulaCard id="drag-coefficient" />
          <Callout kind="warning" title="Dimensional analysis does not give the function">
            <Md>{md`Both $\phi$ (pipe) and $f$ (sphere) are **unknown** until measured — Fox p. 249: "the theorem does not predict the
            functional form". What you gain is *which* quantities to plot and the guarantee that one curve suffices. Using the curve
            (p. 249): given the fluid ($\rho$, $\mu$), the speed $V$ and the diameter $D$ — of a hot-air balloon in a crosswind, or a
            red blood cell (modelled as a sphere) moving through the aorta — compute $\rho VD/\mu$, read $C_D$, compute $F$.`}</Md>
          </Callout>
          <FormulaCard id="pi-theorem-preview" />
          <Callout kind="exam" title="Notation trap">
            <Md>{md`In the next topic's worked solution (slide 15) the second pi term is defined as $\Pi_2 = \mu/DV\rho$, so the abscissa
            of slide 3, $\rho VD/\mu$, is $1/\Pi_2$ — do not label it "$\Pi_2$". Inverting a group is always allowed; the unknown
            function just changes name ($\phi \to \tilde\phi$ on slide 16).`}</Md>
          </Callout>
          <Supplement title="Where φ comes from in practice — two classical results">
            <Md>{md`Theory or experiment eventually supplies the curve of slide 3. For smooth pipes two standard results (from the
            pipe-flow topics, not Lecture 13) give it explicitly; they also generate the synthetic data of the collapse lab. For the
            sphere, creeping-flow theory gives the slope −1 start of Fig. 7.1.`}</Md>
            <FormulaCard id="pipe-model-correlations" />
            <FormulaCard id="stokes-cd" />
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-budget" />
          <ExampleCard id="ex-pipe-reuse" />
          <ExampleCard id="ex-sphere-air" />
        </Step>

        <Step kind="interactive">
          <CollapseLab />
          <SphereDragLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="motivation" />
          <QuickCheck ids={['q-mot-curves', 'q-mot-phi', 'q-mot-vary']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\Delta p_\ell = f(D,\rho,\mu,V)$ (five variables) becomes $D\Delta p_\ell/\rho V^2 = \phi(\rho VD/\mu)$ — one curve for every fluid and every smooth pipe.`,
              md`Experiments then vary only $\rho VD/\mu$; Fox's sphere: about 10 tests instead of $10^4$, one sphere in one fluid at different speeds.`,
              md`$C_D = F/(\tfrac12\rho V^2\,\pi D^2/4)$ is just $F/\rho V^2D^2$ times $8/\pi$; Fig. 7.1 covers $0.1 \le \rho VD/\mu \le 10^6$.`,
              md`**Trap:** dimensional analysis never gives $\phi$ — it must be measured (or found from theory).`,
              md`**Trap:** count $\Delta p_\ell$ among the variables — $k = 5$, not 4.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== Concept 2 — dimensions */}
      <Concept id="dimensions">
        <Step kind="intro" src={L3}>
          <Md>{md`To group variables into dimensionless products we must first describe each variable by its **dimensions**. Slide 3:
          the **basic dimensions** can be mass $\dimM$, length $\dimL$ and time $\dimT$ — **or** force $\dimF$, length $\dimL$ and time
          $\dimT$. The two choices are tied together by Newton's second law:

          $$
          \dimF \doteq \dimM\dimL\dimT^{-2}
          $$

          where $\doteq$ reads "has the dimensions of". Every other quantity is then a product of powers of the basic dimensions.
          For the pipe problem slide 3 lists, in FLT, $\Delta p_\ell \doteq \dimF\dimL^{-3}$ (a pressure, $\dimF/\dimL^2$, per unit
          length), $D \doteq \dimL$, $\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\mu \doteq \dimF\dimL^{-2}\dimT$ and $V \doteq \dimL\dimT^{-1}$.
          Slide 4 then checks, exponent by exponent, that the two groups really are dimensionless.`}</Md>
          <Callout kind="note" title="Notation used here">
            <Md>{md`We write dimensions in sans-serif ($\dimM$, $\dimL$, $\dimT$, $\dimF$) so they never clash with a reference length
            $L$ or a force $F$; the slides print them in italic. Fox writes "has dimensions of" as square brackets, $[\mu]$, and uses
            lower-case $t$ for time.`}</Md>
          </Callout>
          <Callout kind="def" title="Dimensions vs. units">
            <Md>{md`A **dimension** is the *kind* of quantity (length); a **unit** is the yardstick used to measure it (m, ft, cm). A
            dimensionless group has no dimensions, so its numerical value does not depend on the units — provided they are
            consistent.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of the exponents as a **ledger**. Each variable carries a small vector of exponents — $\rho$ in MLT is
          $(1, -3, 0)$, $V$ is $(0, 1, -1)$. Raising a variable to a power multiplies its vector; multiplying variables adds the
          vectors. A product is dimensionless when the ledger **balances to zero** in every column.

          Why may we pick either $\dimM$ or $\dimF$ as basic, but not both? Because $F = ma$ already *defines* force in terms of mass,
          length and time — adding $\dimF$ as a fourth independent dimension would double-count. Switching systems is just a change of
          basis: wherever $\dimM$ appears, write $\dimF\dimL^{-1}\dimT^{2}$.

          **Homogeneity** is the grammar of physics: you cannot add a pressure to a velocity any more than metres to seconds. If one
          term of a derived equation has different dimensions from the others, the derivation is wrong — no experiment needed.`}</Md>
          <Callout kind="tip" title="Unit-invariance in one line">
            <Md>{md`Water at 0.20 m/s in a 5 cm pipe: $\rho VD/\mu = 998 \times 0.20 \times 0.05/(1.00\times10^{-3}) = 9980$. In cgs units,
            $0.998 \times 20 \times 5/0.0100 = 9980$ again — the conversion factors cancel exactly as the dimensions do.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[L3, L4]}>
          <Figure caption="The two systems of basic dimensions and the conversion rule F ≐ MLT⁻² (equivalently M ≐ FL⁻¹T²), applied to the pipe variables." src={L3}>
            <MltFltDiagram />
          </Figure>
          <Figure
            caption="Slide 4 as an exponent walk: each arrow is one factor's contribution (its power × its own exponent). Both groups walk back to 0 in F, L and T — they are dimensionless."
            src={L4}
          >
            <Slide4Walks />
          </Figure>
        </Step>

        <Step kind="equations" src={[L3, L4, L6, L16]}>
          <FormulaCard id="force-mass" />
          <FormulaCard id="pipe-flt-dims" />
          <Derivation
            title="Where the FLT forms of ρ and μ come from"
            steps={[
              { md: md`$\dimF \doteq \dimM\dimL\dimT^{-2} \;\Rightarrow\; \dimM \doteq \dimF\dimL^{-1}\dimT^{2}$`, why: "invert Newton's second law" },
              { md: md`$\rho \doteq \dimM\dimL^{-3} \doteq (\dimF\dimL^{-1}\dimT^{2})\,\dimL^{-3} = \dimF\dimL^{-4}\dimT^{2}$`, why: 'mass per volume' },
              { md: md`$\mu = \dfrac{\tau}{du/dy} \doteq \dfrac{\dimF\dimL^{-2}}{\dimT^{-1}} = \dimF\dimL^{-2}\dimT$`, why: 'shear stress ÷ velocity gradient' },
              { md: md`$\Delta p_\ell \doteq \dfrac{\dimF/\dimL^{2}}{\dimL} = \dimF\dimL^{-3}$`, why: 'pressure per unit length (slide 3)' },
            ]}
          />
          <FormulaCard id="pipe-mlt-dims" />
          <FormulaCard id="pi1-check" />
          <FormulaCard id="re-check" />
          <FormulaCard id="homogeneity" />
          <Callout kind="exam" title="How to check a group quickly">
            <Md>{md`Write the exponent vector of each factor, multiply by its power, add column by column. Zero in every column ⇒
            dimensionless. Do it in whichever system is shorter — the verdict is the same in MLT and FLT (slides 4 and 16).`}</Md>
          </Callout>
          <Callout kind="warning" title="Common mistakes">
            <Md>{md`- Forgetting the square in $V^2$: $(\dimL\dimT^{-1})^2 = \dimL^2\dimT^{-2}$.
            - Mixing systems inside one check (an MLT $\rho$ with an FLT $\mu$).
            - Treating $\Delta p_\ell$ (pressure per length, $\dimF\dimL^{-3}$) as a pressure ($\dimF\dimL^{-2}$).
            - Believing a numerical constant (32, $\pi$) can fix a dimensional mismatch — it cannot.`}</Md>
          </Callout>
          <Supplement title="Dimensions of common variables (MLT and FLT)">
            <Md>{md`Rows for $D$, $V$, $\rho$, $\mu$ and $\Delta p_\ell$ match slides 3 and 16; the rest follow from $\dimF \doteq \dimM\dimL\dimT^{-2}$.

            | Quantity | Symbol | MLT | FLT | SI unit |
            |---|---|---|---|---|
            | length, diameter | $L$, $D$ | $\dimL$ | $\dimL$ | m |
            | area | $A$ | $\dimL^{2}$ | $\dimL^{2}$ | m² |
            | volume | $\mathcal{V}$ | $\dimL^{3}$ | $\dimL^{3}$ | m³ |
            | time | $t$ | $\dimT$ | $\dimT$ | s |
            | velocity | $V$ | $\dimL\dimT^{-1}$ | $\dimL\dimT^{-1}$ | m/s |
            | acceleration, gravity | $a$, $g$ | $\dimL\dimT^{-2}$ | $\dimL\dimT^{-2}$ | m/s² |
            | angular velocity, frequency | $\omega$ | $\dimT^{-1}$ | $\dimT^{-1}$ | s⁻¹ |
            | volume flow rate | $Q$ | $\dimL^{3}\dimT^{-1}$ | $\dimL^{3}\dimT^{-1}$ | m³/s |
            | kinematic viscosity | $\nu$ | $\dimL^{2}\dimT^{-1}$ | $\dimL^{2}\dimT^{-1}$ | m²/s |
            | mass | $m$ | $\dimM$ | $\dimF\dimL^{-1}\dimT^{2}$ | kg |
            | force | $F$ | $\dimM\dimL\dimT^{-2}$ | $\dimF$ | N |
            | pressure, stress, bulk modulus | $p$, $\tau$, $E_v$ | $\dimM\dimL^{-1}\dimT^{-2}$ | $\dimF\dimL^{-2}$ | Pa |
            | pressure drop per length, specific weight | $\Delta p_\ell$, $\gamma$ | $\dimM\dimL^{-2}\dimT^{-2}$ | $\dimF\dimL^{-3}$ | N/m³ |
            | density | $\rho$ | $\dimM\dimL^{-3}$ | $\dimF\dimL^{-4}\dimT^{2}$ | kg/m³ |
            | dynamic viscosity | $\mu$ | $\dimM\dimL^{-1}\dimT^{-1}$ | $\dimF\dimL^{-2}\dimT$ | Pa·s |
            | surface tension | $\sigma$ | $\dimM\dimT^{-2}$ | $\dimF\dimL^{-1}$ | N/m |
            | mass flow rate | $\dot m$ | $\dimM\dimT^{-1}$ | $\dimF\dimL^{-1}\dimT$ | kg/s |
            | work, energy, torque | $W$ | $\dimM\dimL^{2}\dimT^{-2}$ | $\dimF\dimL$ | J |
            | power | $\mathcal{P}$ | $\dimM\dimL^{2}\dimT^{-3}$ | $\dimF\dimL\dimT^{-1}$ | W |
            | angle, strain, any ratio | $\theta$ | $\dimM^{0}\dimL^{0}\dimT^{0}$ | $\dimF^{0}\dimL^{0}\dimT^{0}$ | — |`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-slide4" />
          <ExampleCard id="ex-flt-conversion" />
          <ExampleCard id="ex-homog-ns" />
        </Step>

        <Step kind="interactive">
          <DimensionBuilder />
        </Step>

        <Step kind="practice">
          <PracticeList concept="dimensions" />
          <QuickCheck ids={['q-dim-mu', 'q-dim-trap']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Basic dimensions: $\dimM\dimL\dimT$ **or** $\dimF\dimL\dimT$, linked by $\dimF \doteq \dimM\dimL\dimT^{-2}$ (so $\dimM \doteq \dimF\dimL^{-1}\dimT^{2}$).`,
              md`Pipe variables in FLT: $\Delta p_\ell \doteq \dimF\dimL^{-3}$, $D \doteq \dimL$, $\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\mu \doteq \dimF\dimL^{-2}\dimT$, $V \doteq \dimL\dimT^{-1}$.`,
              md`A group is dimensionless when every exponent sums to zero; the check gives the same verdict in MLT and FLT.`,
              md`Homogeneity: each term standing alone has the dimensions of the left side — use it to catch errors before plugging numbers.`,
              md`**Trap:** $\rho V^2/\mu$ is *not* dimensionless ($\dimT^{-1}$); a missing length is the most common slip.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== Concept 3 — nondimensional equations */}
      <Concept id="nondimensional-equations">
        <Step kind="intro" src={F246}>
          <Md>{md`Chapter 7 will also answer modelling questions such as: how do we correctly test the drag on a **3/8-scale model of
          an automobile** in a wind tunnel to predict the drag on the full-size car *at the same speed*? *Must* model and full-size car
          be tested at the same speed? How do we scale the measured model drag up? (Fox, p. 246; the answers come in the similitude
          topic.)

          Before any dimensional analysis, §7.1 asks what the **governing equations** already tell us. Take a **steady,
          incompressible, two-dimensional** flow of a **Newtonian fluid with constant viscosity** — "already quite a list of
          assumptions!". Mass conservation becomes Eq. (7.1) and the Navier–Stokes equations reduce to Eqs. (7.2) and (7.3): a set of
          **coupled, nonlinear partial differential equations** for $u$, $v$ and $p$, difficult to solve for most flows. Eq. (7.1) has
          dimensions of 1/time; Eqs. (7.2) and (7.3) have dimensions of force/volume.

          The idea: measure every quantity in the flow's own natural units — lengths in $L$, speeds in $V_\infty$, pressures in
          $\rho V_\infty^2$ — and see what is left.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`After scaling, every starred quantity ($x^*$, $u^*$, $\partial u^*/\partial x^*$…) is of order one in the bulk of the
          flow. The *dimensional* sizes of the terms are then carried entirely by their coefficients: inertia $\sim \rho V_\infty^2/L$,
          viscous $\sim \mu V_\infty/L^2$, gravity $\sim \rho g$. Dividing by the inertia scale turns those coefficients into a
          **scoreboard**: each remaining number says how strong a force is *compared with inertia*.

          - $1/Re = \mu/\rho V_\infty L$: viscous ÷ inertia. Honey in a teaspoon — large; air past an aircraft — tiny.
          - $1/Fr^2 = gL/V_\infty^2$: gravity ÷ inertia. A slow, deep river — large; a fast jet — small.

          Two flows with the same scoreboard are the same flow, mathematically — whatever their size.`}</Md>
          <Callout kind="tip" title="Why ρV∞² for pressure?">
            <Md>{md`Bernoulli tells us that pressure changes in a moving fluid are of order $\tfrac12\rho V_\infty^2$, so $\rho V_\infty^2$ is
            the natural yardstick when inertia drives the flow. (In creeping flow, where viscosity drives it, the natural pressure
            scale is $\mu V_\infty/L$ instead — supplementary.)`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[F246, F247]}>
          <Figure
            caption="Each term of Eqs. (7.2)–(7.3), its size after substituting Eq. (7.4), and what remains after dividing by the inertia scale ρV∞²/L: 1, 1, 1/Re and gL/V∞²."
            src={[F246, F247]}
          >
            <TermScalingFigure />
          </Figure>
          <Compare
            items={[
              { title: '1/Re ≫ 1', tone: 'rose', md: md`Viscous forces dominate everywhere (creeping flow); inertia is a small correction.` },
              { title: '1/Re ≪ 1', tone: 'indigo', md: md`Viscous terms negligible **in most of the flow** → Euler's equations; a thin boundary layer remains at walls.` },
              { title: 'gL/V∞² large', tone: 'emerald', md: md`Gravity significant — with a free surface it shapes the flow (waves); $Fr$ must be matched.` },
              { title: 'gL/V∞² small', tone: 'slate', md: md`Gravity insignificant compared with inertia.` },
            ]}
          />
        </Step>

        <Step kind="equations" src={[F246, F247]}>
          <FormulaCard id="fox-7-1" />
          <FormulaCard id="fox-7-2" />
          <FormulaCard id="fox-7-3" />
          <FlowSteps
            tone="indigo"
            steps={[
              { title: 'Choose scales', md: md`Reference length $L$, reference speed $V_\infty$ (usually the freestream velocity), pressure scale $\rho V_\infty^2$ (twice the freestream dynamic pressure).` },
              { title: 'Define starred variables', md: md`Eq. (7.4): $x^* = x/L$, $u^* = u/V_\infty$, $p^* = p/\rho V_\infty^2$, … so that $x = x^*L$, $u = u^*V_\infty$, and so on.` },
              { title: 'Substitute', md: md`Every derivative picks up $1/L$, every velocity $V_\infty$ (the representative substitutions) — Eqs. (7.5)–(7.7).` },
              { title: 'Divide', md: md`Eq. (7.5) by $V_\infty/L$; Eqs. (7.6)–(7.7) by $\rho V_\infty^2/L$ — Eqs. (7.8)–(7.10).` },
            ]}
          />
          <FormulaCard id="fox-7-4" />
          <FormulaCard id="derivative-scaling" />
          <FormulaCard id="fox-7-5" />
          <FormulaCard id="fox-7-6" />
          <FormulaCard id="fox-7-7" />
          <FormulaCard id="fox-7-8" />
          <FormulaCard id="fox-7-9" />
          <FormulaCard id="fox-7-10" />
          <Derivation
            title="Where the two coefficients come from"
            steps={[
              { md: md`$\dfrac{\text{viscous scale}}{\text{inertia scale}} = \dfrac{\mu V_\infty/L^2}{\rho V_\infty^2/L} = \dfrac{\mu}{\rho V_\infty L}$`, why: 'Eq. (7.6) ÷ ρV∞²/L' },
              { md: md`$\dfrac{\mu}{\rho V_\infty L} = \dfrac{1}{Re}$`, why: 'inverse Reynolds number (Fox p. 247)' },
              { md: md`$\dfrac{\text{gravity}}{\text{inertia scale}} = \dfrac{\rho g}{\rho V_\infty^2/L} = \dfrac{gL}{V_\infty^2}$`, why: 'Eq. (7.7) ÷ ρV∞²/L' },
              { md: md`$\dfrac{gL}{V_\infty^2} = \dfrac{1}{Fr^2}$`, why: 'Fr = V∞/√(gL), Fox Eq. (7.14)' },
            ]}
          />
          <FormulaCard id="coefficients-re-fr" />
          <Callout kind="key" title="What the coefficients tell us before solving anything (Fox p. 247)">
            <Md>{md`- Eqs. (7.8)–(7.10) are the nondimensional forms of (7.1)–(7.3); solving them with appropriate boundary conditions is an
            exercise in applied mathematics — and the **form of the solution is very sensitive to the coefficient values** (certain
            second-order PDEs are elliptic, parabolic or hyperbolic depending on their coefficients). So the solution, and the actual
            flow pattern, depends on the values of the two coefficients.
            - If $\mu/\rho V_\infty L$ is very small (high $Re$), the viscous terms can be neglected **at least in most of the flow**,
            leaving a form of **Euler's equations** (Fox Eqs. 6.2). "Most", because a real flow keeps a **boundary layer** where
            viscosity is significant; and mathematically it is always dangerous to neglect the highest derivatives, even with small
            coefficients — the lower-order equation **loses a boundary condition, the no-slip condition**.
            - If $\mu/\rho V_\infty L$ is large or small, viscous forces are significant or not; if $gL/V_\infty^2$ is large or small,
            gravity forces are significant or not.
            - For completeness the **boundary conditions** must be nondimensionalized the same way; they often introduce further
            dimensionless coefficients.`}</Md>
          </Callout>
          <Callout kind="note" title="Similarity, numerics — and the bridge to dimensional analysis">
            <Md>{md`Two geometrically similar flows of different scale (a model and a prototype) that satisfy Eqs. (7.8)–(7.10) give the
            same mathematical results **only if both coefficients have the same values** — i.e. the same relative importance of gravity,
            viscous and inertia forces. The nondimensional form is also the starting point of **numerical methods**, very often the only
            way to solve these equations. (Fox cites Kline [1] and Hansen [2] for similitude derived from governing equations.) Finally,
            dimensional analysis can find the same groupings **without** the governing equations — the subject of the next two
            sections, and very useful for experimental measurements.`}</Md>
          </Callout>
          <Callout kind="warning" title="Two printing slips in Fox">
            <Md>{md`p. 246: the second representative substitution prints the numerator as $\partial(u^*V_\infty)$; it should be
            $\partial^2(u^*V_\infty)$. p. 247: the gravity group is printed once as "$gLV_\infty^2$"; it is $gL/V_\infty^2$, as Eq. (7.10)
            shows.`}</Md>
          </Callout>
          <Supplement title="When does gravity really matter? The modified pressure">
            <Md>{md`In a constant-density flow without a free surface, gravity can be folded into the pressure. Then the coefficient
            $gL/V_\infty^2$ disappears from the velocity problem — which is why Lecture 13's table of groups (slide 21) lists the Froude
            number's application as "flow with a free surface".`}</Md>
            <FormulaCard id="modified-pressure" />
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-nondim-xmom" />
          <ExampleCard id="ex-which-forces" />
        </Step>

        <Step kind="interactive">
          <NSTermExplorer />
          <BoundaryLayerSketch />
          <ModelMatch />
        </Step>

        <Step kind="practice">
          <PracticeList concept="nondimensional-equations" />
          <QuickCheck ids={['q-nd-coef', 'q-nd-noslip']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Scales: $x, y$ by $L$; $u, v$ by $V_\infty$; $p$ by $\rho V_\infty^2$ (twice the dynamic pressure) — Eq. (7.4).`,
              md`Eqs. (7.8)–(7.10) contain only $\mu/\rho V_\infty L = 1/Re$ (viscous terms) and $gL/V_\infty^2 = 1/Fr^2$ (gravity term); continuity has no parameter.`,
              md`Tiny $1/Re$ → Euler's equations in most of the flow, but never at the wall: dropping the 2nd-order terms loses no-slip.`,
              md`Model and prototype give the same solution only if **both** coefficients match (plus geometry and boundary conditions).`,
              md`**Trap:** the gravity coefficient is $gL/V_\infty^2$ (Fox's "$gLV_\infty^2$" is a misprint); without a free surface it only sets hydrostatic pressure.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
