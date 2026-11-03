/**
 * Topic C2 — Buckingham Pi Theorem & Method of Repeating Variables.
 * Primary source: Lecture 13 slides 5–20 (theorem, the 9 steps, pipe example slides 12–16, paint-can example 18–20).
 * Supporting source: Fox & McDonald §7.3, pp. 249–255 (theorem with n − m, six-step procedure, Examples 7.1–7.3,
 * dimensional matrix & rank, non-uniqueness, groups by inspection, n − m = 1).
 * Dimensions use the sans-serif macros \dimM \dimL \dimT \dimF; the lecture writes T for time, Fox writes t.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, md, PracticeList, QuickCheck, Step,
  Supplement, Takeaways,
} from '@/kit'
import { CapillaryFigure, PiLedgerFigure, PipeFigure } from '../sims/buckingham-pi/figures'
import { PiCounter } from '../sims/buckingham-pi/PiCounter'
import { PiBuilder } from '../sims/buckingham-pi/PiBuilder'
import { ExponentBars, ExponentTuner } from '../sims/buckingham-pi/ExponentTuner'
import { PaintCanFigure, PaintCanLab } from '../sims/buckingham-pi/PaintCan'
import { RankLab } from '../sims/buckingham-pi/RankLab'
import { MatrixTable } from '../sims/buckingham-pi/MatrixTable'
import { DIM_TEX, V, dimMatrix } from '../sims/buckingham-pi/dimlib'

const L2: Src = { doc: 'lec13', pages: '2' }
const L3: Src = { doc: 'lec13', pages: '3' }
const L5: Src = { doc: 'lec13', pages: '5' }
const L6: Src = { doc: 'lec13', pages: '6' }
const L7: Src = { doc: 'lec13', pages: '7' }
const L8: Src = { doc: 'lec13', pages: '8' }
const L9: Src = { doc: 'lec13', pages: '9' }
const L10: Src = { doc: 'lec13', pages: '10' }
const L11: Src = { doc: 'lec13', pages: '11' }
const L12: Src = { doc: 'lec13', pages: '12' }
const L13: Src = { doc: 'lec13', pages: '13' }
const L14: Src = { doc: 'lec13', pages: '14' }
const L15: Src = { doc: 'lec13', pages: '15' }
const L16: Src = { doc: 'lec13', pages: '16' }
const L17: Src = { doc: 'lec13', pages: '17' }
const L18: Src = { doc: 'lec13', pages: '18' }
const L19: Src = { doc: 'lec13', pages: '19' }
const L20: Src = { doc: 'lec13', pages: '20' }
const F249: Src = { doc: 'fox', pages: '249' }
const F250: Src = { doc: 'fox', pages: '250' }
const F251: Src = { doc: 'fox', pages: '251' }
const F252: Src = { doc: 'fox', pages: '252' }
const F253: Src = { doc: 'fox', pages: '253' }
const F254: Src = { doc: 'fox', pages: '254' }
const F255: Src = { doc: 'fox', pages: '255' }

/* Static matrices for the dimensional-matrix visual (module constants). */
const CAP_VARS = [V.dh, V.D, V.gamma, V.sigma]
const CAP_MLT = dimMatrix(CAP_VARS, 'MLT')
const CAP_FLT = dimMatrix(CAP_VARS, 'FLT')
const PIPE_BAR_VARS = [V.dpl, V.D, V.V, V.rho]
const PIPE_BAR_EXPS = [1, 1, -2, -1]

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'buckingham-pi',
  unit: 'C',
  title: 'Buckingham Pi Theorem & Method of Repeating Variables',
  subtitle:
    'k variables, r reference dimensions, k − r dimensionless pi terms: the theorem, the 9-step recipe, the two lecture examples (pipe pressure drop, paint-can bottom) and the dimensional-matrix rank that settles r for certain.',
  minutes: 95,
  sources: [
    { doc: 'lec13', pages: '5–20' },
    { doc: 'fox', pages: '249–255' },
  ],
  concepts: [
    {
      id: 'pi-theorem',
      title: 'The Buckingham pi theorem: k − r dimensionless products',
      src: [
        { doc: 'lec13', pages: '5–6' },
        { doc: 'fox', pages: '249' },
      ],
      summary:
        'A dimensionally homogeneous relation among k variables can be rewritten as a relation among k − r independent pi terms, r = minimum number of reference dimensions.',
    },
    {
      id: 'repeating-variables',
      title: 'Method of repeating variables (the 9 steps)',
      src: [
        { doc: 'lec13', pages: '7–12, 17' },
        { doc: 'fox', pages: '250' },
      ],
      summary:
        'List variables → dimensions → k − r → choose r independent repeating variables (never the dependent one) → form each Π → check → rearrange → final relation.',
    },
    {
      id: 'pipe-example',
      title: 'Worked: pressure drop per unit length in a pipe',
      src: { doc: 'lec13', pages: '12–16' },
      summary: 'Δpℓ = f(D, ρ, μ, V): k = 5, r = 3, repeating D, V, ρ → ΔpℓD/(ρV²) = φ̃(ρVD/μ), checked in FLT and MLT.',
    },
    {
      id: 'paint-can-example',
      title: 'Worked: deflection of a paint-can bottom',
      src: { doc: 'lec13', pages: '18–20' },
      summary: 'δ = f(D, h, d, γ, E): six variables but only two reference dimensions (L and MT⁻²) → δ/D = φ(h/D, d/D, E/(Dγ)).',
    },
    {
      id: 'dimensional-matrix',
      title: 'Dimensional matrix, rank & Fox Examples 7.1–7.3',
      src: { doc: 'fox', pages: '250–255' },
      summary:
        'n − m groups with m = rank of the dimensional matrix (largest non-zero determinant); sphere drag, rough-pipe Δp and capillary rise (m ≠ r in MLt); groups are independent but not unique; n − m = 1 ⇒ Π = constant.',
    },
  ],
  sourceNote: md`**Sources.** Lecture 13 slides 5–20 are primary (theorem, the nine steps and both worked examples, reproduced exactly). Fox & McDonald §7.3, pp. 249–255, supplies the $n - m$ form of the theorem, Examples 7.1–7.3 and the dimensional-matrix rank. Slides 2–4 (motivation) are taught in *Dimensions, Homogeneity & Nondimensional Equations*, and the slide 21 table of common groups (Re, Fr, Eu, Ca, Ma, St, We) together with Fox's §7.4 force-ratio scheme (p. 255 onward) in *Common Dimensionless Groups*. Notation: the lecture writes $k$ and $r$ and uses $\doteq$ for "has the dimensions of"; Fox writes $n$, $m$ and square brackets. Fox prints time as $t$; this page writes $\dimT$ throughout.`,
}

/* -------------------------------------------------------------------------------------------- formulas */

export const formulas: FormulaDef[] = [
  {
    id: 'pi-count',
    name: 'Number of pi terms (Buckingham pi theorem)',
    key: true,
    tex: md`\#\,\Pi\ \text{terms} = k - r`,
    vars: [
      { sym: md`k`, desc: 'number of variables in the dimensionally homogeneous equation, **including the dependent variable** and any dimensional or nondimensional constants', units: md`\text{—}` },
      { sym: md`r`, desc: 'minimum number of **reference dimensions** needed to describe all $k$ variables (usually 3: $\dimM\dimL\dimT$ or $\dimF\dimL\dimT$; sometimes 2 or 1)', units: md`\text{—}` },
      { sym: md`\Pi`, desc: 'a dimensionless product of the variables ("pi term")', units: md`1` },
    ],
    conditions: [
      'the relation among the variables must be **dimensionally homogeneous**',
      'the variable list must be complete and its members independent (Step 1 rules)',
      md`$r$ is the **minimum** number of reference dimensions — it can be smaller than the number of basic dimensions that appear (paint can; Fox Example 7.3)`,
    ],
    use: md`Step 3 of the method: count $k$, find $r$, and you know how many pi terms to build before forming any of them. Slide 5 prints "$k$ & $r$" — a typo for $k - r$ (slides 6, 8 and 13 confirm the minus sign).`,
    src: [L5, { doc: 'lec13', pages: '8', note: 'Step 3' }],
  },
  {
    id: 'pi-general',
    name: 'From k variables to k − r pi terms (general form)',
    key: true,
    tex: md`u_1 = f(u_2, u_3, \ldots, u_k) \quad\Longrightarrow\quad \Pi_1 = \phi(\Pi_2, \Pi_3, \ldots, \Pi_{k-r})`,
    vars: [
      { sym: md`u_1`, desc: 'dependent variable (the quantity we want to predict)', units: md`\text{any}` },
      { sym: md`u_2,\ldots,u_k`, desc: 'the $k-1$ independent variables', units: md`\text{any}` },
      { sym: md`f`, desc: 'unknown dimensional function', units: md`\text{—}` },
      { sym: md`\Pi_1,\ldots,\Pi_{k-r}`, desc: 'independent dimensionless products; by convention $\Pi_1$ contains $u_1$', units: md`1` },
      { sym: md`\phi`, desc: 'unknown function of the remaining pi terms — found by experiment or theory, **not** by dimensional analysis', units: md`\text{—}` },
    ],
    conditions: [
      md`dimensional homogeneity: the left side has the same dimensions as any term standing by itself on the right`,
      md`the number of pi terms is *fewer* than the number of variables by $r$`,
    ],
    use: md`This is what the theorem guarantees. The payoff: an experiment needs to vary only $k - r - 1$ dimensionless parameters instead of $k-1$ dimensional ones.`,
    src: L6,
  },
  {
    id: 'pi-fox',
    name: 'Fox form of the theorem (n parameters, n − m groups)',
    tex: md`g(q_1, q_2, \ldots, q_n) = 0 \;\longrightarrow\; G(\Pi_1, \Pi_2, \ldots, \Pi_{n-m}) = 0 \quad\text{or}\quad \Pi_1 = G_1(\Pi_2, \ldots, \Pi_{n-m})`,
    vars: [
      { sym: md`q_1,\ldots,q_n`, desc: 'the $n$ dimensional parameters (Fox\'s $n$ = lecture\'s $k$)', units: md`\text{any}` },
      { sym: md`m`, desc: 'number of repeating parameters = rank of the dimensional matrix; **usually** equal to $r$, the minimum number of independent dimensions', units: md`\text{—}` },
      { sym: md`g,\ G,\ G_1`, desc: 'unspecified functions ($g \neq f$; $G$ and $G_1$ are not given by the theorem)', units: md`\text{—}` },
      { sym: md`\Pi_i`, desc: 'independent dimensionless groups', units: md`1` },
    ],
    conditions: [
      md`sometimes $m \neq r$ — Example 7.3 shows a case; the rank of the dimensional matrix settles $m$ with certainty`,
      'the theorem does **not** predict the functional form of $G$ or $G_1$; it must be determined experimentally',
    ],
    use: md`Same theorem, written implicitly. For the sphere, $g(F, D, \rho, \mu, V) = 0$ becomes $G\!\left(\frac{F}{\rho V^2 D^2}, \frac{\mu}{\rho V D}\right) = 0$, i.e. $\frac{F}{\rho V^2D^2} = G_1\!\left(\frac{\mu}{\rho VD}\right)$.`,
    src: F249,
  },
  {
    id: 'pi-dependent',
    name: 'Groups that are NOT independent',
    tex: md`\Pi_5 = \frac{2\,\Pi_1}{\Pi_2\,\Pi_3} \qquad\text{or}\qquad \Pi_6 = \frac{\Pi_1^{3/4}}{\Pi_3^{2}}`,
    vars: [
      { sym: md`\Pi_1,\ \Pi_2,\ \Pi_3`, desc: 'members of an independent set of pi terms', units: md`1` },
      { sym: md`\Pi_5,\ \Pi_6`, desc: 'products/powers of the others — dimensionless, but carrying no new information', units: md`1` },
    ],
    conditions: ['a Π is **not independent** if it can be formed from any combination of one or more of the other Π\'s'],
    use: md`Use it in reverse: any such combination may *replace* one member of the set (Step 8 — e.g. $1/\Pi_2$), but may never be *added* as an extra group.`,
    src: F249,
  },
  {
    id: 'gamma-rho-g',
    name: 'Specific weight (variables must be independent)',
    tex: md`\gamma = \rho g`,
    vars: [
      { sym: md`\gamma`, desc: 'specific weight (weight per unit volume); $\gamma \doteq \dimF\dimL^{-3}$', units: md`\mathrm{N/m^3}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: md`g`, desc: 'acceleration of gravity', units: md`\mathrm{m/s^2}` },
    ],
    conditions: [md`always true — which is exactly why $\gamma$, $\rho$ and $g$ are not three independent variables`],
    use: md`Slide 7 shows this equation beside the rule "all variables must be independent". Read it as: never list all three of $\gamma$, $\rho$, $g$; list any two if both density and weight matter, or $\gamma$ alone if only the weight matters (as in the paint-can example).`,
    src: L7,
  },
  {
    id: 'num-repeating',
    name: 'Number of repeating variables',
    tex: md`\#\ \text{repeating variables} = r \qquad (\text{usually the number of basic dimensions})`,
    vars: [
      { sym: md`r`, desc: 'number of reference dimensions found in Step 2', units: md`\text{—}` },
    ],
    conditions: [
      'repeating variables must be **dimensionally independent**: they cannot be combined into a dimensionless product',
      'never the dependent variable; avoid variables whose effect is questionable; prefer dimensionally pure ones',
    ],
    use: md`Step 4. With $r$ repeating variables and $k - r$ non-repeating ones, each non-repeating variable produces exactly one pi term — which is why the count of Step 3 must come out again in Step 6.`,
    src: [L8, L9, L10, { doc: 'lec13', pages: '17', note: 'Step 4 wording' }],
  },
  {
    id: 'pi-term-form',
    name: 'Forming a pi term (Step 5)',
    tex: md`\Pi_i = q_i\,R_1^{\,a}\,R_2^{\,b}\,R_3^{\,c} \doteq \dimF^0\dimL^0\dimT^0 \;\;\Longrightarrow\;\; \text{net exponent of each reference dimension} = 0`,
    vars: [
      { sym: md`q_i`, desc: 'the $i$-th non-repeating variable, raised to the power 1', units: md`\text{any}` },
      { sym: md`R_1, R_2, R_3`, desc: 'the $r$ repeating variables (three here)', units: md`\text{any}` },
      { sym: md`a,\ b,\ c`, desc: 'unknown exponents — one linear equation per reference dimension; new values for every pi term', units: md`1` },
    ],
    conditions: [
      'the linear system has a unique solution exactly when the repeating variables are dimensionally independent',
      'works identically in MLT or FLT; the resulting Π is the same',
    ],
    use: md`Write the dimensions of every factor, collect the exponent of each dimension, set each to zero and solve. The slide states the step in words; the symbolic form is the one used on slides 14–15 and in Fox Examples 7.1–7.2.`,
    src: [{ doc: 'lec13', pages: '11', note: 'Step 5 (in words)' }, { doc: 'lec13', pages: '14' }],
  },
  {
    id: 'force-mass',
    name: 'Force–mass link between FLT and MLT',
    tex: md`\dimF \doteq \dimM\dimL\dimT^{-2} \qquad\Longleftrightarrow\qquad \dimM \doteq \dimF\dimL^{-1}\dimT^{2}`,
    vars: [
      { sym: md`\dimF,\ \dimM,\ \dimL,\ \dimT`, desc: 'basic dimensions force, mass, length, time', units: md`\text{—}` },
      { sym: md`\doteq`, desc: '"has the dimensions of"', units: md`\text{—}` },
    ],
    conditions: [md`Newton's second law $F = ma$; the right-hand form is the same relation solved for $\dimM$`],
    use: md`Convert any MLT dimension to FLT (or back) — needed for the double check of Step 7 (slide 16) and recommended by Fox (Step 6: if you used mass, check with force).`,
    src: [L3, { doc: 'fox', pages: '250', note: 'Step 6' }],
  },
  {
    id: 'pipe-dims',
    name: 'Pipe example — variables and dimensions (Steps 1–2)',
    tex: md`\begin{aligned}&\Delta p_\ell = f(D, \rho, \mu, V)\\[2pt] &\Delta p_\ell \doteq \dimF\dimL^{-3} \doteq \dimM\dimL^{-2}\dimT^{-2},\quad D \doteq \dimL,\quad V \doteq \dimL\dimT^{-1}\\ &\rho \doteq \dimF\dimL^{-4}\dimT^{2} \doteq \dimM\dimL^{-3},\quad \mu \doteq \dimF\dimL^{-2}\dimT \doteq \dimM\dimL^{-1}\dimT^{-1}\end{aligned}`,
    vars: [
      { sym: md`\Delta p_\ell`, desc: 'pressure drop per unit length due to friction', units: md`\mathrm{Pa/m = N/m^3}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'fluid (dynamic) viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`V`, desc: 'mean flow velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: ['steady flow of an incompressible Newtonian fluid in a long, smooth-walled, horizontal, circular pipe'],
    use: md`The FLT forms are on slide 12 (and 3); the MLT forms of $\Delta p_\ell$, $\rho$ and $\mu$ are the ones used for the check on slide 16. $\Delta p_\ell \doteq (\dimF/\dimL^2)/\dimL = \dimF\dimL^{-3}$: a pressure per unit length.`,
    src: [L2, L12, { doc: 'lec13', pages: '16', note: 'MLT forms' }],
  },
  {
    id: 'pipe-pi1',
    name: 'Pipe example — Π₁ exponent equations (Step 5)',
    tex: md`\begin{aligned}&\Pi_1 = \Delta p_\ell\,D^{a}V^{b}\rho^{c}: \quad (\dimF\dimL^{-3})(\dimL)^{a}(\dimL\dimT^{-1})^{b}(\dimF\dimL^{-4}\dimT^{2})^{c} \doteq \dimF^0\dimL^0\dimT^0\\ &1 + c = 0\ (\dimF),\qquad -3 + a + b - 4c = 0\ (\dimL),\qquad -b + 2c = 0\ (\dimT)\\ &a = 1,\ b = -2,\ c = -1 \;\Rightarrow\; \Pi_1 = \frac{\Delta p_\ell D}{\rho V^{2}}\end{aligned}`,
    vars: [
      { sym: md`a,\ b,\ c`, desc: 'exponents of the repeating variables $D$, $V$, $\rho$', units: md`1` },
      { sym: md`\Pi_1`, desc: 'first pi term — contains the dependent variable $\Delta p_\ell$', units: md`1` },
    ],
    conditions: [md`repeating variables $D$, $V$, $\rho$ (FLT system)`],
    use: md`Solve in the order F → T → L: $c = -1$, then $b = 2c = -2$, then $a = 3 - b + 4c = 1$.`,
    src: L14,
  },
  {
    id: 'pipe-pi2',
    name: 'Pipe example — Π₂ exponent equations (Step 6)',
    tex: md`\begin{aligned}&\Pi_2 = \mu\,D^{a}V^{b}\rho^{c}: \quad (\dimF\dimL^{-2}\dimT)(\dimL)^{a}(\dimL\dimT^{-1})^{b}(\dimF\dimL^{-4}\dimT^{2})^{c} \doteq \dimF^0\dimL^0\dimT^0\\ &1 + c = 0\ (\dimF),\qquad -2 + a + b - 4c = 0\ (\dimL),\qquad 1 - b + 2c = 0\ (\dimT)\\ &a = -1,\ b = -1,\ c = -1 \;\Rightarrow\; \Pi_2 = \frac{\mu}{D V \rho}\end{aligned}`,
    vars: [
      { sym: md`a,\ b,\ c`, desc: 'new exponents of $D$, $V$, $\rho$ (not those of $\Pi_1$)', units: md`1` },
      { sym: md`\Pi_2`, desc: 'second pi term, formed with the remaining non-repeating variable $\mu$', units: md`1` },
    ],
    conditions: [md`same repeating variables $D$, $V$, $\rho$`],
    use: md`F: $c = -1$; T: $b = 1 + 2c = -1$; L: $a = 2 - b + 4c = -1$.`,
    src: L15,
  },
  {
    id: 'pipe-result',
    name: 'Pipe pressure drop — final dimensionless relation',
    key: true,
    tex: md`\frac{\Delta p_\ell\,D}{\rho V^{2}} = \tilde{\phi}\!\left(\frac{\rho V D}{\mu}\right)`,
    vars: [
      { sym: md`\Delta p_\ell D/(\rho V^2)`, desc: md`$\Pi_1$: dimensionless pressure drop per unit length`, units: md`1` },
      { sym: md`\rho V D/\mu`, desc: md`$1/\Pi_2$: the Reynolds number based on diameter (Step 8 inversion)`, units: md`1` },
      { sym: md`\tilde\phi`, desc: 'unknown function, to be found experimentally (the tilde marks that the argument was inverted)', units: md`\text{—}` },
    ],
    conditions: ['steady, incompressible, Newtonian, long, smooth, horizontal, circular pipe (no roughness, length or gravity variable)'],
    use: md`All data for any fluid and any pipe collapse onto one curve of $\Pi_1$ against $\rho VD/\mu$ (slide 3 writes the same relation with $\phi$). Match $\rho VD/\mu$ and you match $\Pi_1$.`,
    src: [L16, L3, L2],
  },
  {
    id: 'paint-dims',
    name: 'Paint-can example — variables and dimensions',
    tex: md`\begin{aligned}&\delta = f(D, h, d, \gamma, E)\\ &\delta \doteq \dimL,\ D \doteq \dimL,\ h \doteq \dimL,\ d \doteq \dimL\\ &\gamma \doteq \dimF\dimL^{-3} \doteq \dimM\dimL^{-2}\dimT^{-2},\qquad E \doteq \dimF\dimL^{-2} \doteq \dimM\dimL^{-1}\dimT^{-2}\end{aligned}`,
    vars: [
      { sym: md`\delta`, desc: 'vertical deflection of the centre of the can bottom', units: md`\mathrm{m}` },
      { sym: md`D`, desc: 'can diameter', units: md`\mathrm{m}` },
      { sym: md`h`, desc: 'depth of paint', units: md`\mathrm{m}` },
      { sym: md`d`, desc: 'thickness of the bottom', units: md`\mathrm{m}` },
      { sym: md`\gamma`, desc: 'specific weight of the paint', units: md`\mathrm{N/m^3}` },
      { sym: md`E`, desc: 'modulus of elasticity of the bottom material', units: md`\mathrm{Pa}` },
    ],
    conditions: [
      md`six variables and **two** reference dimensions: in FLT only $\dimF$ and $\dimL$ appear; in MLT, $\dimM$ and $\dimT$ only ever appear together as $\dimM\dimT^{-2}$`,
      md`$k - r = 6 - 2 = 4$ pi terms`,
    ],
    use: md`Steps 1–3 of the slide 18 problem. The point: $r$ is the minimum number of *reference* dimensions — here $\dimL$ and the combined dimension $\dimM\dimT^{-2}$ — not the count of basic letters.`,
    src: L18,
  },
  {
    id: 'paint-pi1',
    name: 'Paint-can example — Π₁ in FLT',
    tex: md`\begin{aligned}&\Pi_1 = \delta\,D^{a}\gamma^{b}: \quad (\dimL)(\dimL)^{a}(\dimF\dimL^{-3})^{b} \doteq \dimF^{0}\dimL^{0}\\ &1 + a - 3b = 0\ (\dimL),\qquad b = 0\ (\dimF)\\ &a = -1,\ b = 0 \;\Rightarrow\; \Pi_1 = \frac{\delta}{D}\end{aligned}`,
    vars: [
      { sym: md`a,\ b`, desc: 'exponents of the two repeating variables $D$ and $\gamma$', units: md`1` },
      { sym: md`\Pi_1`, desc: 'dimensionless deflection', units: md`1` },
    ],
    conditions: [md`repeating variables $D$ and $\gamma$ (inferred from the form of every Π on slide 19)`],
    use: md`$h$ and $d$ are also pure lengths, so the same equations give $\Pi_2 = h/D$ ($a = -1$, $b = 0$, printed on slide 19 without the equations) and $\Pi_3 = d/D$.`,
    src: L19,
  },
  {
    id: 'paint-pi4',
    name: 'Paint-can example — Π₄ with MT⁻² as one reference dimension',
    tex: md`\begin{aligned}&\Pi_4 = E\,D^{a}\gamma^{b}: \quad (\dimM\dimL^{-1}\dimT^{-2})(\dimL)^{a}(\dimM\dimL^{-2}\dimT^{-2})^{b} \doteq (\dimM\dimT^{-2})^{0}\dimL^{0}\\ &1 + b = 0\ (\dimM\dimT^{-2}),\qquad -1 + a - 2b = 0\ (\dimL)\\ &a = -1,\ b = -1 \;\Rightarrow\; \Pi_4 = \frac{E}{D\gamma}\end{aligned}`,
    vars: [
      { sym: md`\dimM\dimT^{-2}`, desc: md`combined reference dimension — $\dimM$ and $\dimT$ never appear separately in this problem`, units: md`\text{—}` },
      { sym: md`\Pi_4`, desc: 'ratio of bottom stiffness to the paint-weight scale over the can size', units: md`1` },
    ],
    conditions: [md`MLT system written with only two reference dimensions, $\dimL$ and $\dimM\dimT^{-2}$`],
    use: md`One exponent equation per **reference** dimension: here two equations, not three. Cross-check (not on the slide): in FLT the same result follows from $1 + b = 0$ ($\dimF$) and $-2 + a - 3b = 0$ ($\dimL$).`,
    src: L20,
  },
  {
    id: 'paint-result',
    name: 'Paint-can bottom — final relationship',
    key: true,
    tex: md`\frac{\delta}{D} = \phi\!\left(\frac{h}{D},\ \frac{d}{D},\ \frac{E}{D\gamma}\right)`,
    vars: [
      { sym: md`\delta/D`, desc: md`$\Pi_1$ — dimensionless deflection`, units: md`1` },
      { sym: md`h/D,\ d/D`, desc: md`$\Pi_2$, $\Pi_3$ — geometric ratios (fill level, bottom thickness)`, units: md`1` },
      { sym: md`E/(D\gamma)`, desc: md`$\Pi_4$ — elastic modulus relative to $\gamma D$`, units: md`1` },
      { sym: md`\phi`, desc: 'unknown function of three dimensionless groups', units: md`\text{—}` },
    ],
    conditions: ['valid for the variable list of slide 18 (any further parameter, e.g. Poisson\'s ratio, would enter as an extra dimensionless argument)'],
    use: md`A model can is similar to the real one when $h/D$, $d/D$ and $E/(D\gamma)$ all match; then $\delta_m/D_m = \delta/D$.`,
    src: L19,
  },
  {
    id: 'plate-model',
    name: 'Clamped circular plate under uniform load (model used in the explorer)',
    tex: md`\delta = \frac{q\,a^{4}}{64\,D_f},\quad D_f = \frac{E d^{3}}{12(1-\nu^{2})},\quad q = \gamma h,\ a = \tfrac{D}{2} \;\Longrightarrow\; \frac{\delta}{D} = \frac{3(1-\nu^{2})}{256}\,\frac{h}{D}\left(\frac{d}{D}\right)^{-3}\left(\frac{E}{D\gamma}\right)^{-1}`,
    vars: [
      { sym: md`q`, desc: md`uniform pressure on the bottom from the paint, $\gamma h$`, units: md`\mathrm{Pa}` },
      { sym: md`a`, desc: 'plate radius $D/2$', units: md`\mathrm{m}` },
      { sym: md`D_f`, desc: 'flexural rigidity of the bottom plate (not the diameter!)', units: md`\mathrm{N\,m}` },
      { sym: md`\nu`, desc: 'Poisson\'s ratio of the bottom material (≈ 0.3 for steel)', units: md`1` },
      { sym: md`E,\ d,\ h,\ \gamma,\ D,\ \delta`, desc: 'as in the paint-can problem', units: md`\text{SI}` },
    ],
    conditions: [
      md`linear small-deflection plate theory: $\delta$ small compared with $d$`,
      'edge fully clamped by the can wall, flat unbeaded bottom — a real can is stiffer',
    ],
    use: md`Standard plate theory, **not** in the lecture. It is one particular $\phi$ and has exactly the form dimensional analysis predicts, with $\nu$ as an extra (fixed) dimensionless parameter. Used only to put numbers into the explorer.`,
  },
  {
    id: 'sphere-result',
    name: 'Fox Example 7.1 — drag on a smooth sphere',
    tex: md`\Pi_1 = \frac{F}{\rho V^{2} D^{2}},\qquad \Pi_2 = \frac{\mu}{\rho V D},\qquad \frac{F}{\rho V^{2}D^{2}} = f\!\left(\frac{\mu}{\rho V D}\right)`,
    vars: [
      { sym: md`F`, desc: md`drag force on the sphere, $\dimM\dimL/\dimT^{2}$`, units: md`\mathrm{N}` },
      { sym: md`V`, desc: 'relative speed', units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'sphere diameter', units: md`\mathrm{m}` },
      { sym: md`\rho,\ \mu`, desc: 'fluid density and viscosity', units: md`\mathrm{kg/m^3},\ \mathrm{Pa\,s}` },
    ],
    conditions: [md`smooth sphere; $n = 5$, $m = r = 3$; repeating $\rho$, $V$, $D$ (MLt)`],
    use: md`The form of $f$ comes from experiment (Fox Fig. 7.1, drawn with $C_D$ and $\rho VD/\mu$). Since $\mu/(\rho VD) = 1/\mathrm{Re}$, $F/(\rho V^2D^2) = f_1(\rho VD/\mu)$ is equivalent.`,
    src: [F251, { doc: 'fox', pages: '250', note: 'Example 7.1' }],
  },
  {
    id: 'pipe72-result',
    name: 'Fox Example 7.2 — pressure drop in a rough pipe',
    tex: md`\frac{\Delta p}{\rho \overline{V}^{2}} = f\!\left(\frac{\mu}{\rho \overline{V} D},\ \frac{l}{D},\ \frac{e}{D}\right)`,
    vars: [
      { sym: md`\Delta p`, desc: md`pressure drop over the length $l$, $\dimM/(\dimL\dimT^2)$`, units: md`\mathrm{Pa}` },
      { sym: md`\overline{V}`, desc: 'average velocity', units: md`\mathrm{m/s}` },
      { sym: md`l`, desc: 'pipe length', units: md`\mathrm{m}` },
      { sym: md`e`, desc: 'average roughness height', units: md`\mathrm{m}` },
      { sym: md`D,\ \rho,\ \mu`, desc: 'diameter, density, viscosity', units: md`\mathrm{m},\ \mathrm{kg/m^3},\ \mathrm{Pa\,s}` },
    ],
    conditions: [md`steady, incompressible viscous flow in a straight horizontal pipe; $n = 7$, $m = r = 3$; repeating $\rho$, $\overline V$, $D$`],
    use: md`Compare with the lecture pipe: adding $l$ and $e$ (two lengths) adds two pure length ratios. Chapter 8 of Fox shows this relation correlates pipe data well.`,
    src: [F252, { doc: 'fox', pages: '251', note: 'Example 7.2' }],
  },
  {
    id: 'rank-m',
    name: 'm from the rank of the dimensional matrix',
    key: true,
    tex: md`m = \operatorname{rank}\,[\text{dimensional matrix}],\qquad \#\ \Pi\ \text{groups} = n - m`,
    vars: [
      { sym: md`\text{dimensional matrix}`, desc: 'rows = primary dimensions, columns = parameters, entries = exponents', units: md`\text{—}` },
      { sym: md`\operatorname{rank}`, desc: 'order of the **largest non-zero determinant** that can be formed from the matrix', units: md`\text{—}` },
      { sym: md`n,\ m`, desc: 'number of parameters; number of repeating parameters', units: md`\text{—}` },
    ],
    conditions: [
      md`taking $m = r$ almost always works; trouble arises when the number of primary dimensions differs between MLt and FLt`,
      md`the rank establishes $m$ with certainty; in Example 7.3 both MLt ($r = 3$) and FLt ($r = 2$) give rank 2`,
    ],
    use: md`Build the matrix, look for a non-zero determinant of the largest possible order. If every $r \times r$ determinant vanishes, $m < r$ (Example 7.3 in MLt).`,
    src: [F252, { doc: 'fox', pages: '253', note: 'Example 7.3' }],
  },
  {
    id: 'capillary-result',
    name: 'Fox Example 7.3 — capillary rise',
    tex: md`\Pi_1 = \frac{\Delta h}{D},\qquad \Pi_2 = \frac{\sigma}{D^{2}\gamma},\qquad \frac{\Delta h}{D} = f\!\left(\frac{\sigma}{D^{2}\gamma}\right)`,
    vars: [
      { sym: md`\Delta h`, desc: 'capillary rise (or depression) of the meniscus', units: md`\mathrm{m}` },
      { sym: md`D`, desc: 'tube diameter', units: md`\mathrm{m}` },
      { sym: md`\gamma`, desc: 'specific weight of the liquid', units: md`\mathrm{N/m^3}` },
      { sym: md`\sigma`, desc: md`surface tension, $\dimF/\dimL = \dimM/\dimT^{2}$`, units: md`\mathrm{N/m}` },
    ],
    conditions: [md`static liquid — time is not an important dimension; $n = 4$, $m = 2$ (in both MLt and FLt); repeating $D$, $\gamma$`],
    use: md`MLt has $r = 3$ letters but rank 2, FLt has $r = 2$ and rank 2: both give the same two groups.`,
    src: [F254, { doc: 'fox', pages: '253' }],
  },
  {
    id: 'capillary-exact',
    name: 'Capillary rise from a force balance (Fox Example 2.3, quoted)',
    tex: md`\Delta h = \frac{4\,\sigma\cos\theta}{\rho g D} \qquad\Longleftrightarrow\qquad \frac{\Delta h}{D} = 4\cos\theta\;\frac{\sigma}{D^{2}\gamma}`,
    vars: [
      { sym: md`\theta`, desc: 'contact angle (dimensionless)', units: md`\mathrm{rad}` },
      { sym: md`\rho g`, desc: md`$= \gamma$, specific weight`, units: md`\mathrm{N/m^3}` },
      { sym: md`\sigma,\ D,\ \Delta h`, desc: 'as above', units: md`\mathrm{N/m},\ \mathrm{m},\ \mathrm{m}` },
    ],
    conditions: [md`static equilibrium of the liquid column; the right-hand form uses $\gamma = \rho g$`],
    use: md`Theory confirms the dimensional result: $\Delta h/D$ is directly proportional to $\sigma/(D^2\gamma)$, i.e. $f(\Pi_2) = 4\cos\theta\,\Pi_2$. The dimensionless $\theta$ hides inside $f$.`,
    src: F254,
  },
  {
    id: 'single-pi',
    name: 'Only one group: n − m = 1',
    tex: md`n - m = 1 \quad\Longrightarrow\quad \Pi_1 = C\ \ (\text{a constant})`,
    vars: [
      { sym: md`\Pi_1`, desc: 'the single dimensionless group', units: md`1` },
      { sym: md`C`, desc: 'pure number, fixed by one experiment or by theory', units: md`1` },
    ],
    conditions: ['the variable list is complete'],
    use: md`A function of *nothing* is a constant, so the dependence on every variable is fixed by dimensions alone — one measurement then determines $C$.`,
    src: F255,
  },
  {
    id: 'inspection',
    name: 'Groups by inspection: inertia-force scale',
    tex: md`ma \sim \rho V^{2}L^{2} \;\Rightarrow\; \frac{\text{stress}}{\rho V^{2}},\quad \frac{\text{force}}{\rho V^{2}L^{2}},\quad \frac{A_f}{L^{2}}\ \ \text{are dimensionless}`,
    vars: [
      { sym: md`\rho,\ V,\ L`, desc: 'density, speed, characteristic length — the preferred repeating parameters', units: md`\mathrm{kg/m^3},\ \mathrm{m/s},\ \mathrm{m}` },
      { sym: md`\rho V^2`, desc: 'has the dimensions of a stress (pressure)', units: md`\mathrm{Pa}` },
      { sym: md`\rho V^2 L^2`, desc: md`the unique combination of $\rho$, $V$, $L$ with the dimensions of force $\dimM\dimL\dimT^{-2}$`, units: md`\mathrm{N}` },
      { sym: md`A_f`, desc: 'frontal area of an object', units: md`\mathrm{m^2}` },
    ],
    conditions: [md`repeating parameters $\rho$, $V$, $L$`],
    use: md`Only $\rho$ contains $\dimM$, only $V^2$ gives $\dimT^{-2}$, and $L^2$ then completes $\dimM\dimL\dimT^{-2}$. Divide any stress by $\rho V^2$ and any force by $\rho V^2L^2$ — no algebra needed.`,
    src: F255,
  },
]

/* -------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-count',
    concept: 'pi-theorem',
    title: 'How many pi terms? Five problems from this topic',
    src: [
      { doc: 'lec13', pages: '13, 18' },
      { doc: 'fox', pages: '250–253' },
    ],
    difficulty: 1,
    given: md`(a) Pipe: $\Delta p_\ell = f(D, \rho, \mu, V)$. (b) Paint can: $\delta = f(D, h, d, \gamma, E)$. (c) Sphere: $F = f(\rho, V, D, \mu)$. (d) Rough pipe: $\Delta p = f(\rho, \overline V, D, l, \mu, e)$. (e) Capillary: $\Delta h = f(D, \gamma, \sigma)$.`,
    find: md`The number of independent pi terms for each.`,
    steps: [
      { title: 'Count k — dependent variable included', md: md`(a) 5, (b) 6, (c) 5, (d) 7, (e) 4. Slide 13 stresses: do not forget the dependent variable.` },
      { title: 'Find r for (a), (c), (d)', md: md`All three of $\dimF$ (or $\dimM$), $\dimL$, $\dimT$ are needed and independent — e.g. in (a) $\dimT$ appears only in $\rho$, $\mu$, $V$ and the matrix has rank 3 — so $r = 3$.` },
      { title: 'Find r for (b) and (e)', md: md`Paint can: in FLT only $\dimF$ and $\dimL$ appear, so $r = 2$ (slide 18: "six variables and two reference dimensions"). Capillary: rank of the dimensional matrix is 2 (Fox p. 253), although MLt shows three letters.` },
      { title: 'Apply k − r', md: md`(a) $5 - 3 = 2$; (b) $6 - 2 = 4$; (c) $5 - 3 = 2$; (d) $7 - 3 = 4$; (e) $4 - 2 = 2$.` },
    ],
    answer: md`2, 4, 2, 4 and 2 pi terms respectively.`,
    insight: 'Count k honestly (dependent variable included) and treat r as the minimum number of reference dimensions, not the number of letters you happen to see.',
  },
  {
    id: 'ex-independent',
    concept: 'pi-theorem',
    title: 'Is F/(μVD) a new group for the sphere?',
    difficulty: 2,
    given: md`Sphere drag set $\Pi_1 = F/(\rho V^2 D^2)$, $\Pi_2 = \mu/(\rho V D)$. A student also proposes $\Pi_3 = F/(\mu V D)$.`,
    find: md`Is $\Pi_3$ independent? How many groups does the sphere problem really have?`,
    steps: [
      { title: 'Check it is dimensionless', md: md`$[F/(\mu VD)] = \dfrac{\dimF}{(\dimF\dimL^{-2}\dimT)(\dimL\dimT^{-1})(\dimL)} = 1$. Yes.` },
      { title: 'Try to build it from Π₁ and Π₂', md: md`$$\frac{\Pi_1}{\Pi_2} = \frac{F}{\rho V^2D^2}\cdot\frac{\rho V D}{\mu} = \frac{F}{\mu V D} = \Pi_3$$` },
      { title: 'Conclusion', md: md`$\Pi_3$ is a combination of the others, so it is **not** independent (Fox p. 249). The count stays $n - m = 2$. It may *replace* $\Pi_1$ (giving $F/(\mu VD) = \psi(\rho VD/\mu)$, natural for slow creeping flow), but cannot be added.` },
    ],
    answer: md`$\Pi_3 = \Pi_1/\Pi_2$ — not independent; the sphere still has exactly two groups.`,
    insight: 'A dimensionless product is not automatically a new pi term: test whether it is a product of powers of the ones you have.',
  },
  {
    id: 'ex-pump',
    concept: 'repeating-variables',
    title: 'All nine steps: pressure rise of a pump',
    difficulty: 2,
    given: md`The pressure rise $\Delta p$ of a centrifugal pump depends on impeller diameter $D$, angular speed $\omega$, fluid density $\rho$ and volume flow rate $Q$.`,
    find: md`The dimensionless relationship, following Steps 1–9.`,
    steps: [
      { title: 'Step 1 — list', md: md`$\Delta p = f(D, \omega, \rho, Q)$, $k = 5$.` },
      { title: 'Step 2 — dimensions (MLT)', md: md`$\Delta p \doteq \dimM\dimL^{-1}\dimT^{-2}$, $D \doteq \dimL$, $\omega \doteq \dimT^{-1}$, $\rho \doteq \dimM\dimL^{-3}$, $Q \doteq \dimL^{3}\dimT^{-1}$.` },
      { title: 'Step 3 — count', md: md`All of $\dimM$, $\dimL$, $\dimT$ appear, $r = 3$, so $5 - 3 = 2$ pi terms.` },
      { title: 'Step 4 — repeating variables', md: md`$D$ (pure length), $\omega$ (pure time), $\rho$ (almost pure mass): independent, none is the dependent variable.` },
      { title: 'Step 5 — Π₁', md: md`$\Pi_1 = \Delta p\,D^a\omega^b\rho^c$: $\dimM$: $1 + c = 0$; $\dimT$: $-2 - b = 0$; $\dimL$: $-1 + a - 3c = 0$. So $c = -1$, $b = -2$, $a = -2$: $\Pi_1 = \dfrac{\Delta p}{\rho\omega^2D^2}$.` },
      { title: 'Step 6 — Π₂', md: md`$\Pi_2 = Q\,D^a\omega^b\rho^c$: $\dimM$: $c = 0$; $\dimT$: $-1 - b = 0$; $\dimL$: $3 + a - 3c = 0$. So $\Pi_2 = \dfrac{Q}{\omega D^3}$. Two terms — matches Step 3.` },
      { title: 'Step 7 — check (FLT)', md: md`$\dfrac{\dimF\dimL^{-2}}{(\dimF\dimL^{-4}\dimT^2)(\dimT^{-2})(\dimL^2)} = 1$ and $\dfrac{\dimL^3\dimT^{-1}}{\dimT^{-1}\dimL^3} = 1$. ✓` },
      { title: 'Steps 8–9 — final form', md: md`Already in customary form (pressure coefficient and flow coefficient): $$\frac{\Delta p}{\rho\omega^2D^2} = \phi\!\left(\frac{Q}{\omega D^3}\right)$$ One measured pump curve then predicts every geometrically similar pump at any speed.` },
    ],
    answer: md`$\dfrac{\Delta p}{\rho\omega^2D^2} = \phi\!\left(\dfrac{Q}{\omega D^3}\right)$`,
    insight: 'Pure-dimension repeating variables (a length, a time, a near-pure mass) make the exponent equations almost trivially decoupled.',
  },
  {
    id: 'ex-screen',
    concept: 'repeating-variables',
    title: 'Screening candidate repeating sets for the rough-pipe problem',
    difficulty: 2,
    given: md`$\Delta p = f(\rho, \overline V, D, l, \mu, e)$ (Fox Example 7.2), $r = 3$. Candidate sets: (i) $\rho, \overline V, D$; (ii) $\Delta p, \rho, D$; (iii) $D, l, \rho$; (iv) $\rho, \overline V, \mu$; (v) $\rho, \overline V, e$.`,
    find: md`Which sets are allowed, and which is best?`,
    steps: [
      { title: '(i) ρ, V̄, D', md: md`Independent (only $\rho$ has $\dimM$, only $\overline V$ has $\dimT$, $D$ fixes $\dimL$), simple, all certainly important — Fox's choice. ✓` },
      { title: '(ii) contains Δp', md: md`✗ The dependent variable must appear in only one pi term, so it is never a repeating variable (slide 10).` },
      { title: '(iii) D, l, ρ', md: md`✗ $D$ and $l$ are both lengths: $l/D$ is dimensionless, so the set is not dimensionally independent (slide 9; Fox: no repeating parameter may have dimensions that are a power of another's). No time dimension either.` },
      { title: '(iv) ρ, V̄, μ', md: md`Mathematically independent, but Fox p. 254: viscosity should appear in only one group, so μ should not be repeating. Allowed, discouraged.` },
      { title: '(v) ρ, V̄, e', md: md`Independent, but the roughness effect is "important only part of the time" (smooth pipes, laminar flow) — slide 10 says avoid such variables. Allowed, discouraged.` },
    ],
    answer: md`Valid: (i), (iv), (v); invalid: (ii), (iii). Best: (i) $\rho, \overline V, D$.`,
    insight: 'Validity is a dimensional test; "best" is engineering judgement — simple, pure, always-relevant variables, never μ or the dependent variable.',
  },
  {
    id: 'ex-pipe',
    concept: 'pipe-example',
    title: 'Lecture 13 Example 1 — pressure drop per unit length in a pipe',
    src: { doc: 'lec13', pages: '2, 12–16' },
    difficulty: 2,
    given: md`Steady flow of an incompressible Newtonian fluid in a long, smooth-walled, horizontal, circular pipe (slide 2). The friction pressure drop per unit length depends on $D$, $\rho$, $\mu$, $V$.`,
    find: md`A dimensionless relationship for $\Delta p_\ell$.`,
    assumptions: md`Steady, incompressible, Newtonian fluid; long, smooth-walled, horizontal, circular pipe. (What each assumption removes from the list is explained in the concept intro.)`,
    steps: [
      { title: 'Steps 1–2 (slide 12)', md: md`$\Delta p_\ell = f(D, \rho, \mu, V)$ with $\Delta p_\ell \doteq \dimF\dimL^{-3}$, $D \doteq \dimL$, $\rho \doteq \dimF\dimL^{-4}\dimT^{2}$, $\mu \doteq \dimF\dimL^{-2}\dimT$, $V \doteq \dimL\dimT^{-1}$.` },
      { title: 'Step 3 (slide 13)', md: md`All three of $\dimF$, $\dimL$, $\dimT$ are needed: $k = 5$, $r = 3$, so $5 - 3 = 2$ pi terms.` },
      { title: 'Step 4 (slide 13)', md: md`Choose 3 repeating variables from $D$, $\rho$, $\mu$, $V$ (never $\Delta p_\ell$): $D$, $V$, $\rho$ — simplest, and no dimensionless product can be formed from them.` },
      {
        title: 'Step 5 — Π₁ (slide 14)',
        md: md`$\Pi_1 = \Delta p_\ell D^aV^b\rho^c$, $(\dimF\dimL^{-3})(\dimL)^a(\dimL\dimT^{-1})^b(\dimF\dimL^{-4}\dimT^2)^c \doteq \dimF^0\dimL^0\dimT^0$.

$\dimF$: $1 + c = 0$; $\dimL$: $-3 + a + b - 4c = 0$; $\dimT$: $-b + 2c = 0$ ⇒ $a = 1$, $b = -2$, $c = -1$, so $\Pi_1 = \dfrac{\Delta p_\ell D}{\rho V^2}$.`,
      },
      {
        title: 'Step 6 — Π₂ (slide 15)',
        md: md`$\Pi_2 = \mu D^aV^b\rho^c$, $(\dimF\dimL^{-2}\dimT)(\dimL)^a(\dimL\dimT^{-1})^b(\dimF\dimL^{-4}\dimT^2)^c \doteq \dimF^0\dimL^0\dimT^0$.

$\dimF$: $1 + c = 0$; $\dimL$: $-2 + a + b - 4c = 0$; $\dimT$: $1 - b + 2c = 0$ ⇒ $a = b = c = -1$, so $\Pi_2 = \dfrac{\mu}{DV\rho}$.`,
      },
      {
        title: 'Step 7 — check in FLT and MLT (slide 16)',
        md: md`$$\Pi_1 \doteq \frac{(\dimF\dimL^{-3})(\dimL)}{(\dimF\dimL^{-4}\dimT^{2})(\dimL\dimT^{-1})^{2}} \doteq \dimF^0\dimL^0\dimT^0, \qquad \Pi_2 \doteq \frac{\dimF\dimL^{-2}\dimT}{(\dimL)(\dimL\dimT^{-1})(\dimF\dimL^{-4}\dimT^{2})} \doteq \dimF^0\dimL^0\dimT^0$$

$$\Pi_1 \doteq \frac{(\dimM\dimL^{-2}\dimT^{-2})(\dimL)}{(\dimM\dimL^{-3})(\dimL\dimT^{-1})^{2}} \doteq \dimM^0\dimL^0\dimT^0, \qquad \Pi_2 \doteq \frac{\dimM\dimL^{-1}\dimT^{-1}}{(\dimL)(\dimL\dimT^{-1})(\dimM\dimL^{-3})} \doteq \dimM^0\dimL^0\dimT^0$$`,
      },
      { title: 'Steps 8–9 — customary form (slide 16)', md: md`Invert $\Pi_2$ to the Reynolds number $\rho VD/\mu$; the unknown function becomes $\tilde\phi$: $$\frac{\Delta p_\ell D}{\rho V^2} = \tilde\phi\!\left(\frac{\rho VD}{\mu}\right)$$` },
    ],
    answer: md`$\dfrac{\Delta p_\ell D}{\rho V^2} = \tilde\phi\!\left(\dfrac{\rho V D}{\mu}\right)$, with $\tilde\phi$ found experimentally.`,
    insight: 'Five dimensional variables collapse to one curve of Π₁ against Re — exactly the single curve of slide 3.',
  },
  {
    id: 'ex-pipe-alt',
    concept: 'pipe-example',
    title: 'Same pipe, different repeating set: D, V, μ',
    difficulty: 2,
    given: md`The pipe problem of slides 12–16, but with repeating variables $D$, $V$, $\mu$ (FLT).`,
    find: md`The pi terms and their relation to the lecture's.`,
    steps: [
      { title: 'Independence', md: md`$D$, $V$, $\mu$: only $\mu$ has $\dimF$, then $V$ fixes $\dimT$, $D$ fixes $\dimL$ — no dimensionless product possible. Valid (but Fox advises against repeating $\mu$).` },
      { title: "Π₁′ = Δpℓ D^a V^b μ^c", md: md`$\dimF$: $1 + c = 0 \Rightarrow c = -1$; $\dimT$: $-b + c = 0 \Rightarrow b = -1$; $\dimL$: $-3 + a + b - 2c = 0 \Rightarrow a = 2$. So $\Pi_1' = \dfrac{\Delta p_\ell D^2}{\mu V}$.` },
      { title: "Π₂′ = ρ D^a V^b μ^c", md: md`$\dimF$: $1 + c = 0 \Rightarrow c = -1$; $\dimT$: $2 - b + c = 0 \Rightarrow b = 1$; $\dimL$: $-4 + a + b - 2c = 0 \Rightarrow a = 1$. So $\Pi_2' = \dfrac{\rho V D}{\mu}$.` },
      { title: 'Relation to the lecture set', md: md`$\Pi_1' = \dfrac{\Delta p_\ell D}{\rho V^2}\cdot\dfrac{\rho VD}{\mu} = \Pi_1/\Pi_2$ and $\Pi_2' = 1/\Pi_2$: same information, different packaging.` },
    ],
    answer: md`$\dfrac{\Delta p_\ell D^2}{\mu V} = \phi'\!\left(\dfrac{\rho VD}{\mu}\right)$ — equally valid; still $k - r = 2$ terms.`,
    insight: 'Pi terms are independent but not unique; the number of them is fixed, the choice is yours.',
  },
  {
    id: 'ex-paint',
    concept: 'paint-can-example',
    title: 'Lecture 13 Example 2 — deflection of a paint-can bottom',
    src: { doc: 'lec13', pages: '18–20' },
    difficulty: 2,
    given: md`An open cylindrical paint can of diameter $D$ is filled to depth $h$ with paint of specific weight $\gamma$. The vertical deflection $\delta$ of the centre of the bottom depends on $D$, $h$, $d$, $\gamma$ and $E$ ($d$ = bottom thickness, $E$ = modulus of elasticity of the bottom).`,
    find: md`The functional relationship between $\delta$ and the independent variables.`,
    steps: [
      { title: 'Steps 1–2 (slide 18)', md: md`$\delta = f(D, h, d, \gamma, E)$; $\delta, D, h, d \doteq \dimL$; $\gamma \doteq \dimF\dimL^{-3} \doteq \dimM\dimL^{-2}\dimT^{-2}$; $E \doteq \dimF\dimL^{-2} \doteq \dimM\dimL^{-1}\dimT^{-2}$.` },
      { title: 'Step 3 (slide 18)', md: md`Six variables and **two** reference dimensions (FLT: only $\dimF$, $\dimL$; MLT: $\dimM$, $\dimT$ only as $\dimM\dimT^{-2}$) ⇒ $6 - 2 = 4$ pi terms.` },
      { title: 'Step 4', md: md`Two repeating variables: $D$ and $\gamma$ (every Π on slide 19 has the form $(\cdot)\,D^a\gamma^b$).` },
      { title: 'Step 5 — Π₁ in FLT (slide 19)', md: md`$\Pi_1 = \delta D^a\gamma^b$, $(\dimL)(\dimL)^a(\dimF\dimL^{-3})^b \doteq \dimF^0\dimL^0$: $\dimL$: $1 + a - 3b = 0$; $\dimF$: $b = 0$ ⇒ $a = -1$, $b = 0$, $\Pi_1 = \delta/D$.` },
      { title: 'Step 6 — Π₂, Π₃ (slide 19)', md: md`$\Pi_2 = hD^a\gamma^b$ gives $a = -1$, $b = 0$: $\Pi_2 = h/D$. Likewise $\Pi_3 = d/D$ (pure lengths need no $\gamma$).` },
      { title: 'Step 6 — Π₄ with MT⁻² (slide 20)', md: md`$\Pi_4 = ED^a\gamma^b$, $(\dimM\dimL^{-1}\dimT^{-2})(\dimL)^a(\dimM\dimL^{-2}\dimT^{-2})^b \doteq (\dimM\dimT^{-2})^0\dimL^0$: $\dimM\dimT^{-2}$: $1 + b = 0$; $\dimL$: $-1 + a - 2b = 0$ ⇒ $a = b = -1$, $\Pi_4 = \dfrac{E}{D\gamma}$.` },
      { title: 'Step 9 — final relation (slide 19)', md: md`$$\frac{\delta}{D} = \phi\!\left(\frac{h}{D},\ \frac{d}{D},\ \frac{E}{D\gamma}\right)$$` },
    ],
    answer: md`$\dfrac{\delta}{D} = \phi\!\left(\dfrac{h}{D}, \dfrac{d}{D}, \dfrac{E}{D\gamma}\right)$`,
    insight: 'When two basic dimensions always travel together (here M and T as MT⁻²), treat the pair as one reference dimension: r drops and one more Π appears.',
  },
  {
    id: 'ex-fox71',
    concept: 'dimensional-matrix',
    title: 'Fox Example 7.1 — drag force on a smooth sphere',
    src: [
      { doc: 'fox', pages: '250–251', note: 'Example 7.1' },
    ],
    difficulty: 2,
    given: md`$F = f(\rho, V, D, \mu)$ for a smooth sphere.`,
    find: md`A set of dimensionless groups to correlate experimental data.`,
    steps: [
      { title: 'Steps ①–③', md: md`$F, V, D, \rho, \mu$: $n = 5$. Primary dimensions $\dimM\dimL\dimT$: $F \doteq \dimM\dimL/\dimT^2$, $V \doteq \dimL/\dimT$, $D \doteq \dimL$, $\rho \doteq \dimM/\dimL^3$, $\mu \doteq \dimM/(\dimL\dimT)$; $r = 3$.` },
      { title: 'Step ④', md: md`Repeating $\rho$, $V$, $D$: $m = r = 3$, so $n - m = 2$ groups.` },
      { title: 'Step ⑤ — Π₁', md: md`$\Pi_1 = \rho^aV^bD^cF$: $\dimM$: $a + 1 = 0 \Rightarrow a = -1$; $\dimL$: $-3a + b + c + 1 = 0 \Rightarrow c = -2$; $\dimT$: $-b - 2 = 0 \Rightarrow b = -2$. $\Pi_1 = \dfrac{F}{\rho V^2D^2}$.` },
      { title: 'Step ⑤ — Π₂', md: md`$\Pi_2 = \rho^dV^eD^f\mu$: $\dimM$: $d + 1 = 0$; $\dimL$: $-3d + e + f - 1 = 0$; $\dimT$: $-e - 1 = 0$ ⇒ $d = e = f = -1$. $\Pi_2 = \dfrac{\mu}{\rho VD}$.` },
      { title: 'Step ⑥ — check in FLt', md: md`$\dimF\,\dfrac{\dimL^4}{\dimF\dimT^2}\left(\dfrac{\dimT}{\dimL}\right)^2\dfrac{1}{\dimL^2} = 1$ and $\dfrac{\dimF\dimT}{\dimL^2}\,\dfrac{\dimL^4}{\dimF\dimT^2}\,\dfrac{\dimT}{\dimL}\,\dfrac{1}{\dimL} = 1$ ✓` },
    ],
    answer: md`$\dfrac{F}{\rho V^2D^2} = f\!\left(\dfrac{\mu}{\rho VD}\right)$; the form of $f$ is found experimentally (Fig. 7.1).`,
    insight: 'Fox’s six steps cover the lecture’s Steps 1–7: Fox splits “choose primary dimensions” from “list the dimensions”, counts the groups (n − m) inside Step ⑤, and leaves rearranging/interpreting (lecture Steps 8–9) implicit.',
  },
  {
    id: 'ex-fox72',
    concept: 'dimensional-matrix',
    title: 'Fox Example 7.2 — pressure drop in pipe flow (with roughness)',
    src: { doc: 'fox', pages: '251–252', note: 'Example 7.2' },
    difficulty: 2,
    given: md`$\Delta p = f(\rho, \overline V, D, l, \mu, e)$: steady, incompressible viscous flow in a straight horizontal pipe of length $l$, roughness height $e$.`,
    find: md`A suitable set of dimensionless groups.`,
    steps: [
      { title: 'Steps ①–④', md: md`$n = 7$; $\Delta p \doteq \dimM/(\dimL\dimT^2)$, $\rho \doteq \dimM/\dimL^3$, $\mu \doteq \dimM/(\dimL\dimT)$, $\overline V \doteq \dimL/\dimT$, $l, D, e \doteq \dimL$; $r = 3$; repeating $\rho$, $\overline V$, $D$ ($m = 3$) ⇒ $n - m = 4$ groups.` },
      { title: 'Π₁', md: md`$\rho^a\overline V^bD^c\Delta p$: $\dimM$: $0 = a + 1$; $\dimL$: $0 = -3a + b + c - 1$; $\dimT$: $0 = -b - 2$ ⇒ $a = -1$, $b = -2$, $c = 0$: $\Pi_1 = \dfrac{\Delta p}{\rho\overline V^2}$.` },
      { title: 'Π₂', md: md`$\rho^d\overline V^eD^f\mu$: $d = -1$, $e = -1$, $f = -1$: $\Pi_2 = \dfrac{\mu}{\rho\overline VD}$. (The exponent letter $e$ is not the roughness.)` },
      { title: 'Π₃, Π₄', md: md`$\rho^g\overline V^hD^il$: $g = 0$, $h = 0$, $i = -1$ ⇒ $\Pi_3 = l/D$. $\rho^j\overline V^kD^le$: $j = k = 0$, $l = -1$ ⇒ $\Pi_4 = e/D$.` },
      { title: 'Step ⑥ — FLt check', md: md`$\dfrac{\dimF}{\dimL^2}\dfrac{\dimL^4}{\dimF\dimT^2}\dfrac{\dimT^2}{\dimL^2} = 1$; $\dfrac{\dimF\dimT}{\dimL^2}\dfrac{\dimL^4}{\dimF\dimT^2}\dfrac{\dimT}{\dimL}\dfrac{1}{\dimL} = 1$; $\dimL/\dimL = 1$ twice ✓` },
      { title: 'Notes', md: md`Each Π is unique for its parameters (only one dimensionless grouping of $\mu$, $\rho$, $\overline V$, $D$), and $l/D$, $e/D$ can be written **by inspection**. Fox's Chapter 8 shows this relation correlates pipe data well. (The book's problem statement prints "$\Delta\rho$" for the pressure drop — a typo for $\Delta p$.)` },
    ],
    answer: md`$\dfrac{\Delta p}{\rho\overline V^2} = f\!\left(\dfrac{\mu}{\rho\overline VD}, \dfrac{l}{D}, \dfrac{e}{D}\right)$`,
    insight: 'Every extra length adds a length ratio for free — no algebra needed.',
  },
  {
    id: 'ex-fox73',
    concept: 'dimensional-matrix',
    title: 'Fox Example 7.3 — capillary effect: use of the dimensional matrix',
    src: { doc: 'fox', pages: '253–254', note: 'Example 7.3' },
    difficulty: 3,
    given: md`$\Delta h = f(D, \gamma, \sigma)$ for the meniscus in a small tube dipped into a liquid.`,
    find: md`(a) The number of independent Π parameters; (b) one set of them.`,
    steps: [
      { title: 'Dimensions in two systems', md: md`MLt: $\Delta h, D \doteq \dimL$, $\gamma \doteq \dimM/(\dimL^2\dimT^2)$, $\sigma \doteq \dimM/\dimT^2$ — $r = 3$. FLt: $\gamma \doteq \dimF/\dimL^3$, $\sigma \doteq \dimF/\dimL$ — $r = 2$. Which is right?` },
      {
        title: 'Rank in MLt',
        md: md`$$\begin{vmatrix}0&1&1\\1&-2&0\\0&-2&-2\end{vmatrix} = 0 - (1)(-2) + (1)(-2) = 0, \qquad \begin{vmatrix}-2&0\\-2&-2\end{vmatrix} = 4 \neq 0$$
so $m = 2 \neq r$. (Every 3 × 3 minor vanishes: the $\dimT$ row is $-2\times$ the $\dimM$ row.)`,
      },
      { title: 'Rank in FLt', md: md`$\begin{vmatrix}1&1\\-3&-1\end{vmatrix} = -1 + 3 = 2 \neq 0$, so $m = 2 = r$. (a) $n - m = 4 - 2 = 2$ groups.` },
      { title: 'Π₁ (both systems)', md: md`Repeating $D$, $\gamma$. MLt: $\dimM$: $b = 0$; $\dimL$: $a - 2b + 1 = 0$; $\dimT$: $-2b = 0$ ⇒ $a = -1$. FLt: $\dimF$: $f = 0$; $\dimL$: $e - 3f + 1 = 0 \Rightarrow e = -1$. $\Pi_1 = \Delta h/D$.` },
      { title: 'Π₂ (both systems)', md: md`MLt: $\dimM$: $d + 1 = 0$; $\dimL$: $c - 2d = 0$; $\dimT$: $-2d - 2 = 0$ ⇒ $d = -1$, $c = -2$. FLt: $\dimF$: $h + 1 = 0$; $\dimL$: $g - 3h - 1 = 0$ ⇒ $g = -2$. $\Pi_2 = \dfrac{\sigma}{D^2\gamma}$ (printed as "$\sigma/(D^2\lambda)$" — a typo).` },
      { title: 'Interpretation', md: md`$\dfrac{\Delta h}{D} = f\!\left(\dfrac{\sigma}{D^2\gamma}\right)$ in both systems. Physically sensible: the fluid is static, so time should not matter. Example 2.3's force balance, $\Delta h = 4\sigma\cos\theta/(\rho gD)$, makes $\Delta h/D$ directly proportional to $\sigma/(D^2\gamma)$.` },
    ],
    answer: md`(a) 2 groups ($m = 2$; in MLt $m \neq r = 3$). (b) $\Pi_1 = \Delta h/D$, $\Pi_2 = \sigma/(D^2\gamma)$.`,
    insight: 'The rank of the dimensional matrix, not the number of letters, fixes m — and it is the same in every system of dimensions.',
  },
  {
    id: 'ex-wave',
    concept: 'dimensional-matrix',
    title: 'n − m = 1: speed of deep-water waves',
    difficulty: 2,
    given: md`Suppose the speed $c$ of waves on deep water depends on wavelength $\lambda$, gravity $g$ and water density $\rho$.`,
    find: md`The form of $c(\lambda, g, \rho)$, and $c$ for $\lambda = 10$ m given the theoretical constant $1/\sqrt{2\pi}$.`,
    steps: [
      { title: 'Matrix and rank', md: md`$c \doteq \dimL\dimT^{-1}$, $\lambda \doteq \dimL$, $g \doteq \dimL\dimT^{-2}$, $\rho \doteq \dimM\dimL^{-3}$. Rows $\dimM$: $[0, 0, 0, 1]$; $\dimL$: $[1, 1, 1, -3]$; $\dimT$: $[-1, 0, -2, 0]$ — rank 3, so $n - m = 4 - 3 = 1$.` },
      { title: 'The single group', md: md`$\Pi = c\,\lambda^a g^b\rho^{e}$: $\dimM$: $e = 0$; $\dimT$: $-1 - 2b = 0 \Rightarrow b = -\tfrac12$; $\dimL$: $1 + a + b - 3e = 0 \Rightarrow a = -\tfrac12$. So $\Pi = c/\sqrt{g\lambda}$.` },
      { title: 'n − m = 1 ⇒ constant', md: md`$c/\sqrt{g\lambda} = C$: $c \propto \sqrt{\lambda}$, independent of $\rho$ (the only variable carrying $\dimM$ is forced out). Linear wave theory gives $C = 1/\sqrt{2\pi} = 0.399$.` },
      { title: 'Number', md: md`$c = 0.399\sqrt{9.81 \times 10} = 3.95$ m/s.` },
    ],
    answer: md`$c = C\sqrt{g\lambda}$; with $C = 1/\sqrt{2\pi}$, $c = 3.95$ m/s for $\lambda = 10$ m.`,
    insight: 'One group means the whole functional form follows from dimensions; experiment (or theory) only supplies a number.',
  },
]

/* -------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  {
    id: 'p-count-car',
    concept: 'pi-theorem',
    difficulty: 1,
    q: md`The drag $F$ on a high-speed car depends on speed $V$, length $L$, air density $\rho$, viscosity $\mu$ and the speed of sound $c$. How many pi terms describe the problem?`,
    hint: 'Count the dependent variable too; check which basic dimensions appear.',
    answer: md`3`,
    solution: md`$k = 6$ ($F, V, L, \rho, \mu, c$). Dimensions: $\dimM$ (in $F$, $\rho$, $\mu$), $\dimL$, $\dimT$ — $r = 3$. So $k - r = 6 - 3 = 3$: e.g. $F/(\rho V^2L^2)$, $\rho VL/\mu$ and $V/c$ (a Mach number).`,
    check: [{ label: 'number of pi terms', value: 3, tol: 0.001 }],
  },
  {
    id: 'p-count-length',
    concept: 'pi-theorem',
    difficulty: 2,
    hint: 'Does adding a length add a new dimension? Count k again, dependent variable included.',
    q: md`In the lecture pipe problem the pipe is "long", so only $\Delta p_\ell$ per unit length matters. Suppose instead you measure the total drop $\Delta p$ over a short pipe of length $\ell$: $\Delta p = f(D, \rho, \mu, V, \ell)$. How many pi terms now?`,
    answer: md`3 — e.g. $\Delta p/(\rho V^2)$, $\rho VD/\mu$, $\ell/D$.`,
    solution: md`$k = 6$, still $r = 3$ (no new dimension), so $6 - 3 = 3$ pi terms. With repeating $D$, $V$, $\rho$: $\Pi_1 = \Delta p/(\rho V^2)$, $\Pi_2 = \mu/(\rho VD)$ (or Re), $\Pi_3 = \ell/D$. Only for a long, fully developed pipe does $\Delta p$ become proportional to $\ell$, which lets the two groups $\Delta p/(\rho V^2)$ and $\ell/D$ merge into $\Delta p_\ell D/(\rho V^2)$.`,
    check: [{ label: 'number of pi terms', value: 3, tol: 0.001 }],
  },
  {
    id: 'p-indep',
    concept: 'pi-theorem',
    difficulty: 2,
    q: md`A set has $\Pi_1 = \Delta p/(\rho V^2)$, $\Pi_2 = \rho VD/\mu$, $\Pi_3 = l/D$. Is $\Pi_4 = \Delta p\,D^2/(\mu V l)$ independent of them?`,
    hint: 'Try Π₁ · Π₂ / Π₃ and variants.',
    answer: md`No: $\Pi_4 = \Pi_1\Pi_2/\Pi_3$.`,
    solution: md`$\Pi_1\Pi_2 = \dfrac{\Delta p}{\rho V^2}\cdot\dfrac{\rho VD}{\mu} = \dfrac{\Delta p\,D}{\mu V}$; dividing by $\Pi_3 = l/D$ gives $\dfrac{\Delta p\,D^2}{\mu V l} = \Pi_4$. It is a combination of the others, so it is not independent (Fox p. 249) and adding it would not change the count $k - r$. It could replace $\Pi_1$ in the set.`,
  },
  {
    id: 'p-fan-power',
    concept: 'repeating-variables',
    difficulty: 2,
    q: md`The power $P$ absorbed by a fan depends on $\rho$, $\omega$, $D$ and $Q$. Using $D$, $\omega$, $\rho$ as repeating variables, find the pi term containing $P$. What is the exponent of $D$ in it?`,
    hint: 'P ≐ M L² T⁻³.',
    answer: md`$\Pi_1 = \dfrac{P}{\rho\,\omega^3 D^5}$ — exponent of $D$ is $-5$.`,
    solution: md`$\Pi_1 = P\,D^a\omega^b\rho^c$ with $P \doteq \dimM\dimL^2\dimT^{-3}$. $\dimM$: $1 + c = 0 \Rightarrow c = -1$. $\dimT$: $-3 - b = 0 \Rightarrow b = -3$. $\dimL$: $2 + a - 3c = 0 \Rightarrow a = -5$. So $\Pi_1 = P/(\rho\omega^3D^5)$; the other group is $Q/(\omega D^3)$ (k − r = 5 − 3 = 2).`,
    check: [{ label: 'exponent of D', value: -5, tol: 0.001 }],
  },
  {
    id: 'p-shedding',
    concept: 'repeating-variables',
    difficulty: 2,
    hint: 'f ≐ T⁻¹. Only ρ carries M, so its exponent is fixed first; then V fixes T.',
    q: md`The vortex-shedding frequency $f$ behind a cylinder depends on $D$, $V$, $\rho$, $\mu$. With repeating $D$, $V$, $\rho$, find the two pi terms. What is the exponent of $V$ in the term containing $f$?`,
    answer: md`$fD/V = \phi(\rho VD/\mu)$; exponent of $V$ is $-1$.`,
    solution: md`$k = 5$, $r = 3$ ⇒ 2 terms. $\Pi_1 = fD^aV^b\rho^c$ ($f \doteq \dimT^{-1}$): $\dimM$: $c = 0$; $\dimT$: $-1 - b = 0 \Rightarrow b = -1$; $\dimL$: $a + b - 3c = 0 \Rightarrow a = 1$. $\Pi_1 = fD/V$ (a Strouhal-type number). $\Pi_2 = \mu/(\rho VD)$, inverted in Step 8 to Re. Final: $fD/V = \phi(\rho VD/\mu)$.`,
    check: [{ label: 'exponent of V', value: -1, tol: 0.001 }],
  },
  {
    id: 'p-bad-sets',
    concept: 'repeating-variables',
    difficulty: 1,
    hint: 'Three tests: exactly r of them, no dependent variable, and no dimensionless product among them (check the 2 × 2 exponent determinant).',
    q: md`For the paint can, $\delta = f(D, h, d, \gamma, E)$ with $r = 2$, judge each repeating set: (a) $D$, $h$; (b) $\delta$, $\gamma$; (c) $D$, $E$; (d) $\gamma$, $E$.`,
    answer: md`(a) ✗ not independent ($h/D$ is dimensionless); (b) ✗ contains the dependent variable; (c) ✓; (d) ✓ — valid, though less convenient.`,
    solution: md`(a) Both are lengths: $h/D$ is dimensionless, so the set is not dimensionally independent (slide 9). (b) $\delta$ is the dependent variable — it must appear in only one Π (slide 10). (c) $D \doteq \dimL$, $E \doteq \dimF\dimL^{-2}$: sub-matrix columns $(0, 1)$ and $(1, -2)$ in rows $(\dimF, \dimL)$ have determinant $0\cdot(-2) - 1\cdot 1 = -1 \neq 0$ — valid; it gives $\gamma D/E$, the inverse of the lecture's $\Pi_4$. (d) $\gamma \doteq \dimF\dimL^{-3}$, $E \doteq \dimF\dimL^{-2}$: determinant $1\cdot(-2) - 1\cdot(-3) = 1 \neq 0$, so no product $\gamma^xE^y$ is dimensionless ($x + y = 0$ and $-3x - 2y = 0$ force $x = y = 0$) — valid, though neither variable is dimensionally pure. Lesson: judge independence with the exponent determinant, not by eye.`,
  },
  {
    id: 'p-pipe-alt',
    concept: 'pipe-example',
    difficulty: 2,
    hint: 'μ ≐ F L⁻² T is now the only repeating variable carrying F, so solve the F equation first.',
    q: md`Redo the lecture pipe problem with repeating variables $D$, $V$, $\mu$. Find $\Pi_1'$ (containing $\Delta p_\ell$). What is the exponent of $D$?`,
    answer: md`$\Pi_1' = \Delta p_\ell D^2/(\mu V)$; exponent $2$.`,
    solution: md`$\Pi_1' = \Delta p_\ell D^aV^b\mu^c$, $(\dimF\dimL^{-3})(\dimL)^a(\dimL\dimT^{-1})^b(\dimF\dimL^{-2}\dimT)^c$. $\dimF$: $1 + c = 0 \Rightarrow c = -1$. $\dimT$: $-b + c = 0 \Rightarrow b = -1$. $\dimL$: $-3 + a + b - 2c = 0 \Rightarrow a = 3 + 1 - 2 = 2$. So $\Pi_1' = \Delta p_\ell D^2/(\mu V) = \Pi_1/\Pi_2$ of the lecture set. For laminar flow this group turns out to be a constant (32), which is why it is the natural choice there.`,
    check: [{ label: 'exponent of D', value: 2, tol: 0.001 }],
  },
  {
    id: 'p-pipe-mlt',
    concept: 'pipe-example',
    difficulty: 2,
    hint: 'Use Δpℓ ≐ M L⁻² T⁻² and ρ ≐ M L⁻³ (slide 16); solve M, then T, then L.',
    q: md`Form $\Pi_1 = \Delta p_\ell D^aV^b\rho^c$ working in **MLT** instead of FLT. Write the three exponent equations and find $a$.`,
    answer: md`$\dimM$: $1 + c = 0$; $\dimL$: $-2 + a + b - 3c = 0$; $\dimT$: $-2 - b = 0$ ⇒ $a = 1$, $b = -2$, $c = -1$.`,
    solution: md`With $\Delta p_\ell \doteq \dimM\dimL^{-2}\dimT^{-2}$, $\rho \doteq \dimM\dimL^{-3}$: $\dimM$: $1 + c = 0 \Rightarrow c = -1$; $\dimT$: $-2 - b = 0 \Rightarrow b = -2$; $\dimL$: $-2 + a + b - 3c = 0 \Rightarrow a = 2 + 2 - 3 = 1$. Same $\Pi_1 = \Delta p_\ell D/(\rho V^2)$ as slide 14 — the system of dimensions changes the equations, never the result.`,
    check: [{ label: 'a', value: 1, tol: 0.001 }],
  },
  {
    id: 'p-pipe-scale',
    concept: 'pipe-example',
    difficulty: 3,
    q: md`A water test (ρ = 1000 kg/m³, μ = 1.0 × 10⁻³ Pa·s) in a smooth pipe of D = 25 mm at V = 2.0 m/s gives $\Delta p_\ell$ = 1.69 kPa/m. Predict $\Delta p_\ell$ for air (ρ = 1.2 kg/m³, μ = 1.8 × 10⁻⁵ Pa·s) in a smooth pipe of D = 0.10 m at the dynamically similar speed.`,
    hint: 'Match ρVD/μ, then Π₁ is the same.',
    answer: md`$V_{\text{air}} = 7.5$ m/s; $\Delta p_\ell \approx 7.13$ Pa/m.`,
    solution: md`Model: $\mathrm{Re} = \dfrac{1000(2.0)(0.025)}{1.0\times10^{-3}} = 50\,000$; $\Pi_1 = \dfrac{1690(0.025)}{1000(2.0)^2} = 0.01056$.

Air at the same Re: $V = \dfrac{50\,000(1.8\times10^{-5})}{1.2(0.10)} = 7.5$ m/s.

Same Re ⇒ same $\Pi_1$ (one curve $\tilde\phi$): $\Delta p_\ell = \Pi_1\dfrac{\rho V^2}{D} = 0.01056\cdot\dfrac{1.2(7.5)^2}{0.10} = 7.13$ Pa/m.`,
    check: [
      { label: 'air speed V', value: 7.5, units: 'm/s' },
      { label: 'Δpℓ for air', value: 7.13, units: 'Pa/m' },
    ],
  },
  {
    id: 'p-paint-flt',
    concept: 'paint-can-example',
    difficulty: 2,
    hint: 'γ ≐ F L⁻³ and E ≐ F L⁻²; only two equations (F and L) because T never appears.',
    q: md`Slide 20 forms $\Pi_4 = ED^a\gamma^b$ in MLT with $\dimM\dimT^{-2}$ as one reference dimension. Redo it in **FLT**. Give the exponent equations and $a$.`,
    answer: md`$\dimF$: $1 + b = 0$; $\dimL$: $-2 + a - 3b = 0$ ⇒ $a = -1$, $b = -1$.`,
    solution: md`$(\dimF\dimL^{-2})(\dimL)^a(\dimF\dimL^{-3})^b \doteq \dimF^0\dimL^0$. $\dimF$: $1 + b = 0 \Rightarrow b = -1$. $\dimL$: $-2 + a - 3b = 0 \Rightarrow a = 2 - 3 = -1$. So $\Pi_4 = E/(D\gamma)$, identical to the MLT result — FLT needs no trick because $\dimT$ simply never appears.`,
    check: [{ label: 'a', value: -1, tol: 0.001 }],
  },
  {
    id: 'p-paint-model',
    concept: 'paint-can-example',
    difficulty: 3,
    q: md`A half-scale model can (all lengths × 0.5) is tested with the same paint. The full-size bottom is steel with E = 200 GPa. (a) What modulus must the model bottom have for similarity? (b) The model bottom deflects 0.15 mm. Predict the prototype deflection.`,
    hint: 'Match all of h/D, d/D and E/(Dγ).',
    answer: md`(a) $E_m = 100$ GPa; (b) $\delta = 0.30$ mm.`,
    solution: md`(a) $h/D$ and $d/D$ match automatically for a geometrically scaled model. $\Pi_4$: $\dfrac{E_m}{D_m\gamma} = \dfrac{E}{D\gamma}$ with the same $\gamma$ ⇒ $E_m = E\dfrac{D_m}{D} = 200(0.5) = 100$ GPa.

(b) All arguments of $\phi$ match, so $\delta_m/D_m = \delta/D$ ⇒ $\delta = \delta_m\dfrac{D}{D_m} = 0.15/0.5 = 0.30$ mm.`,
    check: [
      { label: 'E_m', value: 100, units: 'GPa' },
      { label: 'prototype δ', value: 0.3, units: 'mm' },
    ],
  },
  {
    id: 'p-paint-rho-g',
    concept: 'paint-can-example',
    difficulty: 3,
    hint: 'Do M and T still appear only as M T⁻²? Check whether g breaks the pairing.',
    q: md`Instead of $\gamma$, a student lists $\rho$ and $g$ separately: $\delta = f(D, h, d, \rho, g, E)$. How many pi terms now, and what are they?`,
    answer: md`4: $\delta/D$, $h/D$, $d/D$, $E/(\rho gD)$.`,
    solution: md`$k = 7$. MLT: $\rho \doteq \dimM\dimL^{-3}$, $g \doteq \dimL\dimT^{-2}$, $E \doteq \dimM\dimL^{-1}\dimT^{-2}$ — now $\dimM$ and $\dimT$ no longer travel together, so $r = 3$ (rank 3). $k - r = 7 - 3 = 4$. With repeating $D$, $\rho$, $g$: $\delta/D$, $h/D$, $d/D$ and $E\,D^a\rho^bg^c$ → $\dimM$: $1 + b = 0$; $\dimT$: $-2 - 2c = 0$; $\dimL$: $-1 + a - 3b + c = 0$ ⇒ $b = -1$, $c = -1$, $a = -1$: $E/(\rho gD)$. Same physics: $\rho$ and $g$ enter only through $\gamma = \rho g$. Listing both is legal (two of the three), and the count still comes out 4.`,
    check: [{ label: 'number of pi terms', value: 4, tol: 0.001 }],
  },
  {
    id: 'p-pendulum',
    concept: 'dimensional-matrix',
    difficulty: 2,
    q: md`The period $t$ of a simple pendulum is assumed to depend on length $l$, gravity $g$ and bob mass $m$. (a) Show that $n - m = 1$ (careful: two different $m$'s!). (b) A 1.00 m pendulum has period 2.006 s with $g$ = 9.81 m/s². Predict the period of a 4.00 m pendulum.`,
    hint: 'Only one variable contains mass.',
    answer: md`(a) rank 3, one group $t\sqrt{g/l} = C$; (b) $t = 4.01$ s.`,
    solution: md`(a) Matrix rows $\dimM$: $[0, 0, 0, 1]$, $\dimL$: $[0, 1, 1, 0]$, $\dimT$: $[1, 0, -2, 0]$ for $(t, l, g, m)$ — rank 3, so $4 - 3 = 1$ group. Mass appears in only one variable, so its exponent is forced to zero: $\Pi = t\sqrt{g/l}$, and by Fox p. 255 it must be a constant $C$.

(b) $C = 2.006\sqrt{9.81/1.00} = 6.283$ (≈ $2\pi$). Then $t = C\sqrt{l/g} = 6.283\sqrt{4.00/9.81} = 4.01$ s — doubling as $\sqrt{l}$ predicts.`,
    check: [{ label: 'period for l = 4 m', value: 4.012, units: 's' }],
  },
  {
    id: 'p-drop',
    concept: 'dimensional-matrix',
    difficulty: 3,
    hint: 'σ ≐ M T⁻² is the only variable with T besides f, so solve the T equation first.',
    q: md`The natural oscillation frequency $f$ of a small liquid drop depends on its diameter $D$, density $\rho$ and surface tension $\sigma$. Show that only one group exists and use it to scale: a 1 mm water drop oscillates at 100 Hz (in a thought experiment) — what is $f$ for a 2 mm drop?`,
    answer: md`$f\sqrt{\rho D^3/\sigma} = C$ ⇒ $f \propto D^{-3/2}$; $f \approx 35.4$ Hz.`,
    solution: md`Rows $\dimM$: $[0, 0, 1, 1]$, $\dimL$: $[0, 1, -3, 0]$, $\dimT$: $[-1, 0, 0, -2]$ for $(f, D, \rho, \sigma)$: rank 3 ⇒ $n - m = 1$. $\Pi = f D^a\rho^b\sigma^c$: $\dimT$: $-1 - 2c = 0 \Rightarrow c = -\tfrac12$; $\dimM$: $b + c = 0 \Rightarrow b = \tfrac12$; $\dimL$: $a - 3b = 0 \Rightarrow a = \tfrac32$. So $f\sqrt{\rho D^3/\sigma} = C$ and, with the same liquid, $f \propto D^{-3/2}$: $f_2 = 100\,(2)^{-1.5} = 35.4$ Hz.`,
    check: [{ label: 'f for D = 2 mm', value: 35.36, units: 'Hz' }],
  },
  {
    id: 'p-cap-rho',
    concept: 'dimensional-matrix',
    difficulty: 3,
    q: md`Add the liquid density to Fox Example 7.3: $\Delta h = f(D, \gamma, \sigma, \rho)$. Find the rank of the MLt dimensional matrix, the number of groups, and the groups.`,
    hint: 'Does the t row still equal −2 × the M row?',
    answer: md`Rank 3; $5 - 3 = 2$ groups: $\Delta h/D$ and $\sigma/(D^2\gamma)$ — $\rho$ drops out.`,
    solution: md`Columns $(\Delta h, D, \gamma, \sigma, \rho)$: $\dimM$: $[0,0,1,1,1]$, $\dimL$: $[1,1,-2,0,-3]$, $\dimT$: $[0,0,-2,-2,0]$. The $\rho$ column breaks the proportionality of the $\dimM$ and $\dimT$ rows, so rank = 3 (e.g. columns $D$, $\gamma$, $\rho$ give a non-zero 3 × 3 determinant). $n - m = 5 - 3 = 2$. Repeating $D$, $\gamma$, $\rho$: $\Pi_1 = \Delta h/D$; $\Pi_2 = \sigma D^a\gamma^b\rho^c$ ⇒ $\dimT$: $-2 - 2b = 0$, $\dimM$: $1 + b + c = 0$, $\dimL$: $a - 2b - 3c = 0$ ⇒ $b = -1$, $c = 0$, $a = -2$. $\rho$ gets exponent zero: it cannot form a group with the others (it carries no $\dimT$), so it is irrelevant once $\gamma$ is listed — consistent with $\gamma = \rho g$.`,
    check: [
      { label: 'rank m', value: 3, tol: 0.001 },
      { label: 'number of groups', value: 2, tol: 0.001 },
    ],
  },
  {
    id: 'p-cap-number',
    concept: 'dimensional-matrix',
    difficulty: 1,
    hint: 'Compute Π₂ = σ/(D²γ) with D in metres, then Δh = 4 cos θ · Π₂ · D.',
    q: md`Using $\Delta h/D = 4\cos\theta\,\sigma/(D^2\gamma)$ (Fox p. 254), find the capillary rise of water (σ = 0.0728 N/m, γ = 9790 N/m³, θ ≈ 0) in a glass tube of D = 0.50 mm.`,
    answer: md`$\Pi_2 = 29.7$, $\Delta h \approx 59.5$ mm.`,
    solution: md`$\Pi_2 = \dfrac{0.0728}{(0.50\times10^{-3})^2(9790)} = 29.7$. $\Delta h/D = 4(1)(29.7) = 119$, so $\Delta h = 119 \times 0.50$ mm $= 59.5$ mm. Halving $D$ quadruples $\Pi_2$ and doubles $\Delta h$ (compare ≈ 29.7 mm for D = 1 mm).`,
    check: [{ label: 'Δh', value: 59.5, units: 'mm' }],
  },
]

/* ------------------------------------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-count',
    concept: 'pi-theorem',
    difficulty: 1,
    q: md`A dimensionally homogeneous relation involves 7 variables described by $\dimM$, $\dimL$, $\dimT$ (rank 3). How many independent pi terms?`,
    options: ['4', '3', '7', '10'],
    answer: 0,
    explain: md`$k - r = 7 - 3 = 4$. "3" confuses the number of pi terms with $r$, the number of repeating variables.`,
    src: L5,
  },
  {
    id: 'q-k-includes',
    concept: 'pi-theorem',
    difficulty: 1,
    q: md`In $k - r$, does $k$ include the dependent variable?`,
    options: ['Yes — all variables, dependent one included', 'No — only the independent variables', 'Only when it is a force', 'Only in the MLT system'],
    answer: 0,
    explain: md`Slide 13: $k = 5$ for $\Delta p_\ell = f(D, \rho, \mu, V)$ — "don't forget the dependent variable". Counting only the four independent variables would give one pi term too few.`,
    src: L13,
  },
  {
    id: 'q-form',
    concept: 'pi-theorem',
    difficulty: 2,
    q: md`What does the pi theorem tell you about the function $\phi$ in $\Pi_1 = \phi(\Pi_2, \ldots)$?`,
    options: [
      'Nothing about its form — it must come from experiment or theory',
      'It is always a power law',
      'It is linear in each Π',
      'It is fixed once the repeating variables are chosen',
    ],
    answer: 0,
    explain: md`The theorem only gives the number and form of the arguments (Fox p. 249: the functional relation must be determined experimentally). Power laws are common fits, not consequences of the theorem.`,
    src: F249,
  },
  {
    id: 'q-dep-rep',
    concept: 'repeating-variables',
    difficulty: 1,
    q: md`Why is the dependent variable never chosen as a repeating variable?`,
    options: [
      'Repeating variables generally appear in more than one Π, but we want the dependent variable in only one',
      'Because it is usually dimensionless',
      'Because it has the most dimensions',
      'Because the exponent equations would have no solution',
    ],
    answer: 0,
    explain: md`Slide 10: we want to see how one variable depends on the others, so it should sit in a single pi term. The equations themselves could still be solvable — the issue is interpretability.`,
    src: L10,
  },
  {
    id: 'q-indep',
    concept: 'repeating-variables',
    difficulty: 2,
    q: md`Which set can serve as the 3 repeating variables for a problem in $\dimM\dimL\dimT$?`,
    options: [
      md`$\rho$, $V$, $D$`,
      md`$D$, $l$, $\rho$`,
      md`$V$, $D$, $\omega$`,
      md`$\Delta p$, $\rho$, $V$ when $\Delta p$ is the dependent variable`,
    ],
    answer: 0,
    explain: md`$\rho, V, D$ are dimensionally independent. $D$, $l$ (both lengths) and $V$, $D$, $\omega$ ($VD^{-1}\omega^{-1}$ dimensionless, and no mass) can form a dimensionless product; $\Delta p$ is the dependent variable.`,
    src: [L9, L13],
  },
  {
    id: 'q-mu',
    concept: 'repeating-variables',
    difficulty: 2,
    q: md`Fox advises against using viscosity as a repeating parameter. Why?`,
    options: [
      'Experience shows μ should appear in only one dimensionless group',
      'μ is not dimensionally independent of ρ',
      'μ has no time dimension',
      'Including μ makes the exponent equations singular',
    ],
    answer: 0,
    explain: md`Fox p. 254: viscosity should appear in only one group, so it should not be repeating; ρ, V, L are preferred. A set like $D, V, \mu$ is still dimensionally independent — it is a matter of convenience, not validity.`,
    src: F254,
  },
  {
    id: 'q-step6',
    concept: 'repeating-variables',
    difficulty: 1,
    q: md`After Step 6 you have 3 pi terms but Step 3 predicted 2. What does slide 11 say?`,
    options: ['A mistake has been made — check your work', 'Keep all three; more is safer', 'Drop the one containing the dependent variable', 'Switch from FLT to MLT'],
    answer: 0,
    explain: md`The number of pi terms from Step 6 must equal Step 3's $k - r$; if not, something is wrong (e.g. a repeating variable counted as non-repeating, or a wrong $r$).`,
    src: L11,
  },
  {
    id: 'q-pipe-pi1',
    concept: 'pipe-example',
    difficulty: 2,
    q: md`For $\Pi_1 = \Delta p_\ell D^aV^b\rho^c$ (FLT), which equation comes from the exponent of $\dimT$?`,
    options: [md`$-b + 2c = 0$`, md`$1 + c = 0$`, md`$-3 + a + b - 4c = 0$`, md`$-2 - b = 0$`],
    answer: 0,
    explain: md`$\dimT$ appears in $V$ ($\dimT^{-1}$, giving $-b$) and $\rho$ ($\dimT^{2}$, giving $2c$); $\Delta p_\ell \doteq \dimF\dimL^{-3}$ has none. $-2 - b = 0$ is the $\dimT$ equation in **MLT**, where $\Delta p_\ell$ carries $\dimT^{-2}$.`,
    src: L14,
  },
  {
    id: 'q-pipe-result',
    concept: 'pipe-example',
    difficulty: 1,
    q: md`What is the final result of the lecture pipe example?`,
    options: [
      md`$\dfrac{\Delta p_\ell D}{\rho V^2} = \tilde\phi\!\left(\dfrac{\rho VD}{\mu}\right)$`,
      md`$\dfrac{\Delta p_\ell}{\rho V^2} = \tilde\phi\!\left(\dfrac{\rho VD}{\mu}\right)$`,
      md`$\Delta p_\ell = \dfrac{32\mu V}{D^2}$`,
      md`$\dfrac{\Delta p_\ell D}{\rho V^2} = \dfrac{\rho VD}{\mu}$`,
    ],
    answer: 0,
    explain: md`$\Delta p_\ell/(\rho V^2)$ still has dimensions $1/\dimL$ (it is per unit length); the laminar formula is one special form of $\tilde\phi$ from theory, not the dimensional-analysis result; and the function is unknown, not the identity.`,
    src: L16,
  },
  {
    id: 'q-paint-r',
    concept: 'paint-can-example',
    difficulty: 2,
    q: md`Why does the paint-can problem need only two reference dimensions although MLT shows $\dimM$, $\dimL$ and $\dimT$?`,
    options: [
      md`$\dimM$ and $\dimT$ only ever appear together as $\dimM\dimT^{-2}$`,
      'Because the paint is static, mass is irrelevant',
      'Because four of the variables are lengths',
      'Because E and γ have the same dimensions',
    ],
    answer: 0,
    explain: md`Both $\gamma \doteq \dimM\dimL^{-2}\dimT^{-2}$ and $E \doteq \dimM\dimL^{-1}\dimT^{-2}$ contain $\dimM\dimT^{-2}$, so it acts as one reference dimension (slide 20). $E$ and $\gamma$ differ by a length, and mass is not irrelevant — it just never appears without $\dimT^{-2}$.`,
    src: [L18, L20],
  },
  {
    id: 'q-paint-groups',
    concept: 'paint-can-example',
    difficulty: 1,
    q: md`Which group is $\Pi_4$ of the paint-can example?`,
    options: [md`$\dfrac{E}{D\gamma}$`, md`$\dfrac{E}{\gamma}$`, md`$\dfrac{ED}{\gamma}$`, md`$\dfrac{\gamma D}{E d}$`],
    answer: 0,
    explain: md`$E \doteq \dimF\dimL^{-2}$, $D\gamma \doteq \dimF\dimL^{-2}$, so $E/(D\gamma)$ is dimensionless. $E/\gamma$ has dimensions of length and $ED/\gamma$ of length squared.`,
    src: L20,
  },
  {
    id: 'q-rank',
    concept: 'dimensional-matrix',
    difficulty: 2,
    q: md`How does Fox establish the number of repeating parameters $m$ with certainty?`,
    options: [
      'm = rank of the dimensional matrix (order of the largest non-zero determinant)',
      'm = number of primary dimensions in the MLt system',
      'm = number of rows of the dimensional matrix',
      'm = n − 1',
    ],
    answer: 0,
    explain: md`Fox p. 252–253. The number of primary dimensions can differ between MLt and FLt (Example 7.3: 3 vs 2); the rank (2) does not.`,
    src: [F252, F253],
  },
  {
    id: 'q-n-m-1',
    concept: 'dimensional-matrix',
    difficulty: 2,
    q: md`If the procedure gives a single dimensionless group ($n - m = 1$), what follows?`,
    options: ['The group must be a constant', 'The problem has no solution', 'Another variable must be removed', 'The group equals 1'],
    answer: 0,
    explain: md`Fox p. 255: a single Π must be a constant — not necessarily 1 (e.g. $t\sqrt{g/l} = 2\pi$ for a pendulum).`,
    src: F255,
  },
  {
    id: 'q-unique',
    concept: 'dimensional-matrix',
    difficulty: 1,
    q: md`True or false: the $n - m$ groups from the method are unique — any correct solution must produce the same groups.`,
    options: ['True', 'False'],
    answer: 1,
    explain: md`False. Fox p. 254: they are independent but **not unique** — a different repeating set gives different (equivalent) groups. What *is* unique is the grouping of one given parameter with a given repeating set (Fox p. 252).`,
    src: F254,
  },
  {
    id: 'q-two-params',
    concept: 'repeating-variables',
    difficulty: 2,
    q: md`A student suspects the pipe-wall mass $m$ matters and lists $\Delta p_\ell = f(D, \rho, \mu, V, m)$ (repeating $D$, $V$, $\rho$, MLT). What happens?`,
    options: [
      md`3 pi terms; $m$ enters its own group $m/(\rho D^3)$, which experiments would show to be irrelevant`,
      md`2 pi terms; $m$ must be dropped because $\dimM$ may appear in only one variable`,
      md`3 pi terms, and $m$ must replace $\rho$ as a repeating variable`,
      md`The list is invalid because $m$ and $\rho$ are not independent variables`,
    ],
    answer: 0,
    explain: md`$k = 6$, $r = 3$ ⇒ 3 pi terms; $m D^a V^b \rho^c$ gives $c = -1$, $b = 0$, $a = -3$, i.e. $m/(\rho D^3)$. Fox p. 250: an extraneous parameter only adds a group that experiment later eliminates. Slide 7 requires each dimension in **at least** two variables (here $\dimM$ is in four), and sharing a dimension is not dependence — dependence means one variable is fixed by the others (area and diameter; $\gamma = \rho g$).`,
    src: [L7, F250],
  },
  {
    id: 'q-cap-m',
    concept: 'dimensional-matrix',
    difficulty: 2,
    q: md`Fox Example 7.3, $\Delta h = f(D, \gamma, \sigma)$: in $MLt$ three primary dimensions appear. How many independent Π groups are there?`,
    options: ['2', '1', '3', '4'],
    answer: 0,
    explain: md`Every 3 × 3 determinant of the $MLt$ matrix is zero (the $t$ row is $-2\times$ the $M$ row) but a 2 × 2 one is $4 \neq 0$, so $m = 2$ and $n - m = 4 - 2 = 2$: $\Delta h/D$ and $\sigma/(D^2\gamma)$. Answering 1 means taking $m = r = 3$ blindly.`,
    src: [F253, F254],
  },
]

/* ------------------------------------------------------------------------------------------ flashcards */

export const flashcards: Flashcard[] = [
  { id: 'f-theorem', front: md`State the Buckingham pi theorem.`, back: md`A dimensionally homogeneous equation in $k$ variables reduces to a relation among $k - r$ independent dimensionless products (pi terms), $r$ = minimum number of reference dimensions.`, src: L5 },
  { id: 'f-general', front: md`General form before and after the theorem?`, back: md`$u_1 = f(u_2, \ldots, u_k) \Rightarrow \Pi_1 = \phi(\Pi_2, \ldots, \Pi_{k-r})$; $\phi$ unknown.`, src: L6 },
  { id: 'f-nine', front: 'The 9 steps of the method of repeating variables?', back: md`1 list variables · 2 dimensions · 3 $k - r$ · 4 choose $r$ repeating · 5 form Π with one non-repeating · 6 repeat · 7 check dimensionless & independent · 8 rearrange · 9 final relation, interpret.`, src: L17 },
  { id: 'f-rules', front: 'Rules for repeating variables?', back: md`Exactly $r$ of them; dimensionally independent (no dimensionless product among them); never the dependent variable; not questionable/occasional; as dimensionally pure as possible; (Fox) not $\mu$, prefer $\rho, V, L$.`, src: [L9, L10, F254] },
  { id: 'f-step1', front: 'Step 1 rules for the variable list (slide 7)?', back: md`Include dimensional and nondimensional constants; each dimension must appear in at least two variables; variables must be independent (area **or** diameter; $\gamma = \rho g$).`, src: L7 },
  { id: 'f-pipe', front: 'Result of the Lecture 13 pipe example?', back: md`$\dfrac{\Delta p_\ell D}{\rho V^2} = \tilde\phi\!\left(\dfrac{\rho VD}{\mu}\right)$, from $k = 5$, $r = 3$, repeating $D, V, \rho$.`, src: L16 },
  { id: 'f-pipe-exp', front: md`Exponents for $\Pi_1 = \Delta p_\ell D^aV^b\rho^c$ and $\Pi_2 = \mu D^aV^b\rho^c$?`, back: md`$\Pi_1$: $a = 1$, $b = -2$, $c = -1$. $\Pi_2$: $a = b = c = -1$.`, src: [L14, L15] },
  { id: 'f-paint', front: 'Result of the paint-can example?', back: md`$\dfrac{\delta}{D} = \phi\!\left(\dfrac{h}{D}, \dfrac{d}{D}, \dfrac{E}{D\gamma}\right)$: $k = 6$, $r = 2$, repeating $D$, $\gamma$.`, src: L19 },
  { id: 'f-mt2', front: md`What is the "$\dimM\dimT^{-2}$ trick"?`, back: md`If two basic dimensions only ever occur in a fixed combination, treat that combination as a single reference dimension — one exponent equation for it (slide 20). Hence $r = 2$ for the paint can.`, src: L20 },
  { id: 'f-rank', front: md`How is $m$ found with certainty?`, back: md`$m$ = rank of the dimensional matrix = order of its largest non-zero determinant. Capillary rise: $m = 2$ although MLt shows 3 dimensions.`, src: [F252, F253] },
  { id: 'f-unique', front: 'Are pi groups unique?', back: md`Independent but not unique: a different repeating set gives an equivalent set (e.g. $\Delta p_\ell D^2/(\mu V)$ instead of $\Delta p_\ell D/(\rho V^2)$). Their **number** is fixed.`, src: F254 },
  { id: 'f-single', front: md`$n - m = 1$ means…?`, back: md`The single Π is a constant; the whole dependence follows from dimensions (one experiment fixes the constant).`, src: F255 },
]

/* ------------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`**Pi theorem:** a dimensionally homogeneous relation among $k$ variables becomes a relation among $k - r$ independent pi terms, $\Pi_1 = \phi(\Pi_2, \ldots, \Pi_{k-r})$; Fox writes $n - m$.`,
  md`$k$ counts **every** variable, the dependent one included; $r$ is the **minimum** number of reference dimensions — the rank of the dimensional matrix.`,
  md`**Nine steps:** list → dimensions → $k - r$ → $r$ repeating variables → form each Π with one non-repeating variable → check count, dimensionlessness and independence → rearrange → interpret.`,
  md`Repeating variables: exactly $r$, dimensionally independent (no dimensionless product among them), never the dependent variable, not questionable, as pure as possible; Fox: avoid $\mu$, prefer $\rho, V, L$.`,
  md`Pipe: $\dfrac{\Delta p_\ell D}{\rho V^2} = \tilde\phi\!\left(\dfrac{\rho VD}{\mu}\right)$ — exponents $(1, -2, -1)$ and $(-1, -1, -1)$; check in FLT **and** MLT.`,
  md`Paint can: $\dfrac{\delta}{D} = \phi\!\left(\dfrac{h}{D}, \dfrac{d}{D}, \dfrac{E}{D\gamma}\right)$ — only two reference dimensions because $\dimM\dimT^{-2}$ acts as one.`,
  md`When MLt and FLt suggest different $r$ (capillary rise), the rank decides: $m = 2$, giving $\Delta h/D = f(\sigma/(D^2\gamma))$.`,
  md`Groups are independent but **not unique**; any product/power of groups may replace one, never be added. Simple groups (length ratios, stress$/\rho V^2$, force$/\rho V^2L^2$) can be written by inspection.`,
  md`Dimensional analysis gives the **form**, never the function: $\phi$ comes from experiment or theory. If $n - m = 1$ the single Π is a constant.`,
]

/* --------------------------------------------------------------------------------------------- content */

export default function Content() {
  return (
    <>
      {/* ================================================================ pi-theorem */}
      <Concept id="pi-theorem">
        <Step kind="intro" src={[L5, L6, F249]}>
          <Md>{md`The previous topic showed that the five-variable pipe problem collapses onto a single curve once the variables are grouped into dimensionless products. Lecture 13 now asks two questions: *can* dimensional analysis always reduce the number of variables, and *how many* dimensionless products are needed to replace the original list?

The answer is the **Buckingham pi theorem**: if an equation involving $k$ variables is **dimensionally homogeneous**, it can be reduced to a relationship among $k - r$ independent dimensionless products, where $r$ is the minimum number of reference dimensions needed to describe the variables. The dimensionless products are called **pi terms**.

Fox states the same theorem implicitly: $g(q_1, \ldots, q_n) = 0$ can be transformed into $G(\Pi_1, \ldots, \Pi_{n-m}) = 0$, where $m$ is *usually* equal to the minimum number $r$ of independent dimensions — but not always (Example 7.3). The theorem gives the **number and form** of the groups; it does **not** give the function relating them.

Why it is worth the effort (Fox p. 249): once the sphere-drag data are plotted as one dimensionless curve, the same curve gives the drag on a hot-air balloon in a crosswind or on a red blood cell (modelled as a sphere) moving through the aorta — compute $\rho VD/\mu$, read the drag coefficient, compute the force. Fox warns the section may feel abstract at first: read it, study Examples 7.1–7.3, then reread.`}</Md>
          <Callout kind="note" title="Slide 5 typo">
            <Md>{md`The slide prints the theorem as "among $k$ & $r$ independent dimensionless products". It means $k - r$, as slide 6 ($\Pi_{k-r}$), slide 8 and slide 13 ($5 - 3$) confirm.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of each reference dimension as a **currency**. Every variable is "priced" in $\dimM$, $\dimL$, $\dimT$. A physical law cannot depend on the units you happen to use, so it can only involve combinations that are *price-free* — dimensionless. With $r$ independent currencies, you can use $r$ of the variables as "exchange rates" (the repeating variables) to cancel the units of every other variable. Each of the remaining $k - r$ variables then yields one unit-free number. That is all the theorem says.

Why the count is fixed: you cannot cancel more than $r$ independent unit types, and once they are cancelled nothing else can be removed — so exactly $k - r$ independent numbers survive.`}</Md>
          <Callout kind="tip">
            <Md>{md`The saving grows with $r$: Fox's sphere-drag program shrinks from about $10^4$ tests (four dimensional variables, 10 values each) to about $10$ (one dimensionless variable) — see the previous topic.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual">
          <Figure caption="Each worked example in this topic: k variables (squares) — r of them are 'used up' by the reference dimensions, the remaining k − r survive as pi terms.">
            <PiLedgerFigure />
          </Figure>
        </Step>

        <Step kind="equations" src={[L5, L6, L8, F249]}>
          <FormulaCard id="pi-count" />
          <FormulaCard id="pi-general" />
          <FormulaCard id="pi-fox" />
          <FormulaCard id="pi-dependent" />
          <Callout kind="def" title="Dimensional homogeneity (slide 6)">
            <Md>{md`The variable on the left of the equals sign must have the same dimensions as **any term that stands by itself** on the right. Only such equations can be rewritten in pi terms. In fluid mechanics the reference dimensions are usually $\dimM\dimL\dimT$ or $\dimF\dimL\dimT$; sometimes only two ($\dimL$, $\dimT$) or one ($\dimL$) are needed.`}</Md>
          </Callout>
          <Supplement title="Why the theorem works (linear algebra view)">
            <Md>{md`Write a product $u_1^{x_1}u_2^{x_2}\cdots u_k^{x_k}$. Its dimension exponents are $A\vb{x}$, where $A$ is the $3 \times k$ dimensional matrix. Dimensionless products are exactly the solutions of $A\vb{x} = \vb{0}$, and the number of independent solutions of a homogeneous linear system is $k - \operatorname{rank}(A)$. So the number of pi terms is $k - r$ with $r = \operatorname{rank}(A)$ — which is why Fox's rank test (last concept) is the rigorous way to find $r$.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-count" />
          <ExampleCard id="ex-independent" />
        </Step>

        <Step kind="interactive">
          <PiCounter />
        </Step>

        <Step kind="practice">
          <PracticeList concept="pi-theorem" />
          <QuickCheck ids={['q-count', 'q-k-includes']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\#\,\Pi = k - r$: $k$ includes the dependent variable, $r$ is the **minimum** number of reference dimensions.`,
              md`Only **dimensionally homogeneous** relations can be reduced; the theorem then *guarantees* the reduction.`,
              md`The theorem fixes the number and form of the arguments — never the function $\phi$ (that is experiment's job).`,
              md`A Π built from other Π's (e.g. $2\Pi_1/(\Pi_2\Pi_3)$) is **not** independent; it can replace a member of the set but never add to it.`,
              md`Exam trap: writing "$k - 1 - r$" (forgetting the dependent variable is counted) or taking $r$ = number of letters without checking.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ======================================================== repeating-variables */}
      <Concept id="repeating-variables">
        <Step kind="intro" src={[L7, L8, L9, L10, L11, L12, L17, F250]}>
          <Md>{md`Several methods produce the pi terms; Lecture 13 uses the **method of repeating variables**, a nine-step recipe (summarised on slide 17). The idea: pick $r$ variables that will "repeat" in every group, and combine each remaining variable with them, choosing exponents that cancel all dimensions. Fox §7.3 gives the same procedure in six steps.

**Step 1 — list all the variables.** A *variable* is any quantity that plays a role, **including dimensional and nondimensional constants**. Every dimension must appear in **at least two** variables (otherwise that variable is irrelevant, or a variable containing that dimension is missing). All variables must be **independent**: use the pipe area *or* the diameter, not both; $\gamma = \rho g$ links $\gamma$, $\rho$ and $g$. Fox adds: be generous — if you suspect a parameter matters, include it. Leaving out a pertinent parameter still gives a relation, but not the complete story; including one with no real effect either drops out of the analysis or produces a group that experiments later show to be extraneous.

**Steps 2–3** — express each variable in basic dimensions and compute $k - r$. **Step 4** — select as many repeating variables as there are reference dimensions. **Steps 5–6** — form a Π for each non-repeating variable. **Step 7** — check the Π's are dimensionless and independent. **Step 8** — rearrange to customary forms. **Step 9** — write the final relation and think about what it means.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`The repeating variables are your **measuring sticks**: $D$ is a ruler for length, $V$ a clock-and-ruler for time, $\rho$ a balance for mass. Every other quantity is then expressed "in units of" these sticks — $\Delta p_\ell$ in units of $\rho V^2/D$, $\mu$ in units of $\rho VD$. The resulting ratios are pure numbers that any lab, anywhere, with any fluid, would agree on.

That picture explains each rule. A good stick must measure *something new* (dimensional independence — two rulers $D$ and $l$ don't help with time). It must be simple and reliable (dimensionally pure, always relevant). And the thing you are trying to *predict* cannot be one of your sticks, or it would leak into every group.`}</Md>
          <Callout kind="warning" title="Common mistakes">
            <Md>{md`Choosing the dependent variable as repeating; choosing two variables with powers of the same dimension (an area $\dimL^2$ and a second moment $\dimL^4$ — Fox's example); picking fewer or more than $r$ repeating variables; forgetting to re-solve $a, b, c$ for every new pi term.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[L17, F250]}>
          <FlowSteps
            steps={[
              { title: 'Step 1 — List all variables', md: md`$u_1 = f(u_2, \ldots, u_k)$; include constants; each dimension in ≥ 2 variables; variables independent. Count $k$.` },
              { title: 'Step 2 — Basic dimensions', md: md`Write every variable in $\dimM\dimL\dimT$ or $\dimF\dimL\dimT$ (the dimensional matrix).`, tone: 'cyan' },
              { title: 'Step 3 — Number of pi terms', md: md`$k - r$, with $r$ = number of reference dimensions.`, tone: 'cyan' },
              { title: 'Step 4 — Repeating variables', md: md`Choose $r$ of them (usually = number of basic dimensions): independent, not the dependent variable, simple and pure.`, tone: 'amber' },
              { title: 'Step 5 — Form a pi term', md: md`$\Pi = q\,R_1^aR_2^bR_3^c$; set the net exponent of each dimension to zero; solve.`, tone: 'emerald' },
              { title: 'Step 6 — Repeat', md: md`One Π per non-repeating variable; the count must equal Step 3 — if not, there is a mistake.`, tone: 'emerald' },
              { title: 'Step 7 — Check', md: md`Each Π dimensionless (ideally in the other system too) and independent.`, tone: 'violet' },
              { title: 'Step 8 — Rearrange', md: md`Invert, raise to powers or combine to customary groups (e.g. $1/\Pi_2 = \rho VD/\mu$).`, tone: 'violet' },
              { title: 'Step 9 — Final relation', md: md`$\Pi_1 = \phi(\Pi_2, \ldots, \Pi_{k-r})$ — and think about what it means.`, tone: 'rose' },
            ]}
          />
          <Compare
            items={[
              {
                title: 'Lecture 13 — 9 steps (slides 7–12, 17)',
                md: md`Steps 1–3 list, dimension, count; Step 4 repeating variables; 5–6 form Π's; 7 check (dimensionless **and independent** on slide 17); 8 rearrange; 9 interpret.`,
                tone: 'indigo',
              },
              {
                title: 'Fox §7.3 — 6 steps (p. 250)',
                md: md`① list parameters ($n$); ② choose primary dimensions ($MLt$ or $FLt$; heat transfer may need temperature, electrical systems charge); ③ list dimensions ($r$); ④ choose $r$ repeating parameters that together include all primary dimensions; ⑤ dimensional equations → $n - m$ groups; ⑥ check (with force if you used mass, or vice versa).`,
                tone: 'cyan',
              },
            ]}
          />
        </Step>

        <Step kind="equations" src={[L7, L8, L11]}>
          <FormulaCard id="gamma-rho-g" />
          <FormulaCard id="num-repeating" />
          <FormulaCard id="pi-term-form" />
          <Callout kind="key" title="Choosing repeating variables (slides 9–10; Fox pp. 250, 254)">
            <Md>{md`- **Dimensionally independent:** the dimensions of one cannot be reproduced by a product of powers of the others; equivalently, they cannot form a dimensionless product (slide 9).
- **Never the dependent variable** — we want it in only one pi term (slide 10; Fox p. 250).
- Avoid variables whose effect is **questionable or important only part of the time** (slide 10).
- Prefer variables **as close to dimensionally pure as possible**: a diameter is a pure length, density is almost a pure mass (slide 10).
- Fox: no repeating parameter whose dimensions are a power of another's (not both $\dimL^2$ and $\dimL^4$); **do not repeat $\mu$** — viscosity should appear in only one group; when possible use $\rho$, $V$ and a length $L$: they are usually easy to measure, correlate a wide range of data well, and give groups that read as force ratios to inertia (p. 254).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-pump" />
          <ExampleCard id="ex-screen" />
        </Step>

        <Step kind="interactive">
          <PiBuilder initial="pipe" />
        </Step>

        <Step kind="practice">
          <PracticeList concept="repeating-variables" />
          <QuickCheck ids={['q-dep-rep', 'q-step6']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Nine steps: list, dimensions, $k - r$, repeating variables, form Π, repeat, check, rearrange, interpret.`,
              md`Number of repeating variables = $r$; each non-repeating variable gives exactly one Π, so Step 6 must reproduce Step 3's count.`,
              md`Repeating set: dimensionally independent, no dependent variable, no "sometimes" variables, as pure as possible — and (Fox) no $\mu$.`,
              md`Step 1 hygiene: include constants, every dimension in at least two variables, no redundant variables (area **or** diameter; not all of $\gamma, \rho, g$).`,
              md`Exam tip: solve the exponent equation for the dimension that appears in only one repeating variable first — the rest cascade.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== pipe-example */}
      <Concept id="pipe-example">
        <Step kind="intro" src={[L2, L12, L13]}>
          <Md>{md`The first worked example returns to the motivating problem of slide 2: **steady** flow of an **incompressible Newtonian** fluid through a **long, smooth-walled, horizontal, circular** pipe. We want the pressure drop per unit length caused by friction, $\Delta p_\ell = f(D, \rho, \mu, V)$.

Slide 13: $k = 5$ (don't forget the dependent variable), all three of $\dimF$, $\dimL$, $\dimT$ are needed, so $r = 3$ and $5 - 3 = 2$ pi terms. Repeating variables must come from $D$, $\rho$, $\mu$, $V$ — **not** $\Delta p_\ell$ — and the simplest independent choice is $D$, $V$, $\rho$. Start Step 5 with the dependent variable.`}</Md>
          <Supplement title="Why the list is so short">
            <Md>{md`Each adjective prunes the variable list: steady (no time), incompressible (no compressibility $E_v$), Newtonian (one viscosity $\mu$), long (fully developed — only the drop *per unit length* matters, so no pipe length), smooth (no roughness), horizontal (no gravity), circular (one length, $D$).`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`Measure the pressure gradient "in natural units". The natural pressure scale of a moving fluid is $\rho V^2$ (twice the dynamic pressure) and the natural length is $D$, so the natural pressure *gradient* is $\rho V^2/D$; $\Pi_1 = \Delta p_\ell D/(\rho V^2)$ is the friction gradient in those units. The only other independent number the four inputs can make is how viscous the flow is relative to its inertia: $\rho VD/\mu$, the Reynolds number. So whatever friction does, it can only depend on Re.`}</Md>
          <Callout kind="tip">
            <Md>{md`Fox's Example 7.2 is the same problem for a *rough pipe of length $l$*: the extra lengths $l$ and $e$ just add $l/D$ and $e/D$, and its $\Delta p/(\rho\overline V^2)$ is the total drop, not the drop per length.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual">
          <Figure caption="Variables of the pipe example: Δpℓ is the drop between two taps divided by their spacing ℓ. (Velocity profile schematic.)">
            <PipeFigure />
          </Figure>
          <Figure caption="Step 7 made visible: in Π₁ = Δpℓ D V⁻² ρ⁻¹ the F, L and T contributions of the four factors cancel exactly (FLT).">
            <ExponentBars vars={PIPE_BAR_VARS} exps={PIPE_BAR_EXPS} sys="FLT" />
          </Figure>
        </Step>

        <Step kind="equations" src={[L12, L14, L15, L16]}>
          <FormulaCard id="force-mass" />
          <FormulaCard id="pipe-dims" />
          <FormulaCard id="pipe-pi1" />
          <FormulaCard id="pipe-pi2" />
          <FormulaCard id="pipe-result" />
          <Derivation
            title="Solving the Π₁ system (slide 14) in a good order"
            steps={[
              { md: md`$\dimF$: $1 + c = 0 \Rightarrow c = -1$`, why: 'only ρ carries force among the repeating variables' },
              { md: md`$\dimT$: $-b + 2c = 0 \Rightarrow b = 2c = -2$`, why: 'time appears only in V and ρ' },
              { md: md`$\dimL$: $-3 + a + b - 4c = 0 \Rightarrow a = 3 - b + 4c = 3 + 2 - 4 = 1$` },
              { md: md`$\Pi_1 = \Delta p_\ell D^{1}V^{-2}\rho^{-1} = \dfrac{\Delta p_\ell D}{\rho V^2}$` },
            ]}
          />
          <Callout kind="exam">
            <Md>{md`Step 8 inverted $\Pi_2 = \mu/(DV\rho)$ to the customary $\rho VD/\mu$; slide 16 marks the new unknown function with a tilde, $\tilde\phi$, because its argument changed. Both $\phi$ and $\tilde\phi$ are unknown until measured. Always show the check (slide 16 does it in **both** FLT and MLT).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-pipe" />
          <ExampleCard id="ex-pipe-alt" />
        </Step>

        <Step kind="interactive">
          <ExponentTuner />
        </Step>

        <Step kind="practice">
          <PracticeList concept="pipe-example" />
          <QuickCheck ids={['q-pipe-pi1', 'q-pipe-result']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$k = 5$, $r = 3$, 2 pi terms; repeating $D$, $V$, $\rho$ (never $\Delta p_\ell$).`,
              md`$\Pi_1 = \Delta p_\ell D/(\rho V^2)$ from $(a, b, c) = (1, -2, -1)$; $\Pi_2 = \mu/(DV\rho)$ from $(-1, -1, -1)$.`,
              md`Final: $\dfrac{\Delta p_\ell D}{\rho V^2} = \tilde\phi\!\left(\dfrac{\rho VD}{\mu}\right)$ — one curve for all fluids and pipes.`,
              md`Equal Re ⇒ equal $\Pi_1$: the basis of model testing.`,
              md`Trap: exponent equations differ between FLT and MLT (e.g. $\dimT$: $-b + 2c = 0$ vs $-2 - b = 0$), but the pi terms are the same.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ========================================================= paint-can-example */}
      <Concept id="paint-can-example">
        <Step kind="intro" src={[L18, L19, L20]}>
          <Md>{md`The second lecture example is a solid-mechanics problem — proof that the method is not limited to fluids. An open cylindrical paint can of diameter $D$ is filled to depth $h$ with paint of specific weight $\gamma$. The vertical deflection $\delta$ at the centre of the bottom depends on $D$, $h$, $d$ (bottom thickness), $\gamma$ and $E$ (modulus of elasticity of the bottom material). Find the functional relationship.

The new feature: **six variables but only two reference dimensions**, so **four** pi terms. In FLT this is visible directly ($\dimT$ never appears). In MLT all three letters appear, but $\dimM$ and $\dimT$ occur only as the combination $\dimM\dimT^{-2}$, which slide 20 uses as **one** reference dimension. This is the "unusual" case flagged by slide 17's "*usually* the same as the number of basic dimensions".`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`The physics is static: paint weight pushes, the plate's stiffness resists. Nothing moves in time, and mass enters only as weight ($\gamma$) and stiffness ($E$), both force-like. So forces must cancel against forces — the only "currency" besides length. Three pure lengths ($\delta$, $h$, $d$) simply become ratios to $D$; the one remaining group compares stiffness $E$ with the hydrostatic pressure scale $\gamma D$. Only the ratio $E/(D\gamma)$ matters: at the same geometric ratios, a bottom ten times stiffer gives the same $\delta/D$ as paint ten times *lighter* — or as a can ten times *smaller* (all lengths scaled down) with the same paint and bottom material.`}</Md>
          <Callout kind="tip">
            <Md>{md`Listing $\gamma$ alone (not $\rho$ and $g$) follows slide 7: only the *weight* of the paint matters, and $\gamma = \rho g$ already contains both.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={L18}>
          <Figure caption="Paint can of slide 18: dashed free surface (γ), depth h, bottom (E, d) shown undeflected (solid) and deflected (dashed) by δ at the centre, diameter D." src={L18}>
            <PaintCanFigure />
          </Figure>
          <Figure caption="Dimensional matrix of the paint can in MLT — the T row is exactly −2 × the M row, so the rank is 2.">
            <MatrixTable vars={[V.delta, V.D, V.h, V.d, V.gamma, V.E]} rowLabels={DIM_TEX.MLT} A={dimMatrix([V.delta, V.D, V.h, V.d, V.gamma, V.E], 'MLT')} rows={[0, 1, 2]} dep={0} rep={[1, 4]} />
          </Figure>
        </Step>

        <Step kind="equations" src={[L18, L19, L20]}>
          <FormulaCard id="paint-dims" />
          <FormulaCard id="paint-pi1" />
          <FormulaCard id="paint-pi4" />
          <FormulaCard id="paint-result" />
          <Supplement title="A theory that has exactly this form">
            <Md>{md`Thin-plate theory (not in the lecture) gives one particular $\phi$. It contains Poisson's ratio $\nu$ — a nondimensional constant that slide 7 says belongs in the variable list; with $\nu$ held fixed it simply sits inside $\phi$.`}</Md>
            <FormulaCard id="plate-model" />
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-paint" />
        </Step>

        <Step kind="interactive">
          <PaintCanLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="paint-can-example" />
          <QuickCheck ids={['q-paint-r', 'q-paint-groups']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$k = 6$, $r = 2$ ⇒ 4 pi terms; repeating $D$ and $\gamma$.`,
              md`$\dfrac{\delta}{D} = \phi\!\left(\dfrac{h}{D}, \dfrac{d}{D}, \dfrac{E}{D\gamma}\right)$.`,
              md`$r$ is the number of **reference** dimensions: $\dimM\dimT^{-2}$ can serve as one, giving one exponent equation for it.`,
              md`Pure lengths need no algebra: $h/D$, $d/D$ follow at once (slide 19 prints them without equations).`,
              md`Trap: using 3 repeating variables here — with $r = 2$ any three variables can form a dimensionless product among themselves, so the set is never independent and the exponents are not uniquely determined.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ======================================================== dimensional-matrix */}
      <Concept id="dimensional-matrix">
        <Step kind="intro" src={[F250, F251, F252, F253, F254, F255]}>
          <Md>{md`Fox's §7.3 works three examples with the six-step procedure — sphere drag (7.1), pipe pressure drop with roughness (7.2) and capillary rise (7.3) — and then makes the count rigorous. Taking $m = r$ almost always gives the right number of groups, but in a few problems the number of primary dimensions depends on the system used ($MLt$ vs $FLt$). The cure: **$m$ is the rank of the dimensional matrix**, i.e. the order of its largest non-zero determinant (rows = dimensions, columns = parameters, entries = exponents).

The section closes with practical remarks (p. 254–255): the groups are **independent but not unique**; viscosity should not be repeating, and $\rho$, $V$, $L$ are the best repeating trio; with them, groups can often be written **by inspection** (stress/$\rho V^2$, force/$\rho V^2L^2$, $A_f/L^2$); and if $n - m = 1$, the single Π must be a **constant**.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`The rank asks: *how many genuinely different unit types do these variables use?* In the capillary problem everything with mass also carries $\dimT^{-2}$ — mass and time are welded together, like two currencies at a fixed exchange rate. Counting them as two would overcount by one. The matrix shows this as linearly dependent rows (the $t$ row is $-2\times$ the $M$ row), and the determinant test catches it automatically. FLt hides the problem because force already *is* that welded combination.`}</Md>
          <Callout kind="warning">
            <Md>{md`Only the **number** of groups is fixed. A different (valid) repeating set gives a different, equivalent set; what is unique is the single grouping of one parameter with a given repeating set (Fox p. 252: only one dimensionless grouping of $\mu$, $\rho$, $\overline V$, $D$).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F253}>
          <Figure caption="Example 7.3: liquid rises Δh (to the bottom of the meniscus) in a tube of diameter D; liquid of specific weight γ and surface tension σ." src={F253}>
            <CapillaryFigure />
          </Figure>
          <Figure caption="Example 7.3 dimensional matrices. MLt (left): 3 rows but every 3 × 3 determinant is zero — rank 2. FLt (right): 2 rows, rank 2." src={F253}>
            <div className="grid gap-4 sm:grid-cols-2">
              <MatrixTable vars={CAP_VARS} rowLabels={DIM_TEX.MLT} A={CAP_MLT} rows={[0, 1, 2]} dep={0} caption="M L t" />
              <MatrixTable vars={CAP_VARS} rowLabels={DIM_TEX.FLT} A={CAP_FLT} rows={[0, 1]} dep={0} caption="F L t" />
            </div>
          </Figure>
        </Step>

        <Step kind="equations" src={[F251, F252, F253, F254, F255]}>
          <FormulaCard id="sphere-result" />
          <FormulaCard id="pipe72-result" />
          <FormulaCard id="rank-m" />
          <FormulaCard id="capillary-result" />
          <FormulaCard id="capillary-exact" />
          <FormulaCard id="single-pi" />
          <FormulaCard id="inspection" />
          <Callout kind="exam">
            <Md>{md`If $\dimM$ is your primary dimension, check the groups with $\dimF$ (Fox Step 6), as Examples 7.1–7.3 do. And if a problem is static (no motion), suspect $m < 3$ in $MLt$ before solving.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-fox71" />
          <ExampleCard id="ex-fox72" />
          <ExampleCard id="ex-fox73" />
          <ExampleCard id="ex-wave" />
        </Step>

        <Step kind="interactive">
          <RankLab />
          <PiBuilder initial="capillary" />
        </Step>

        <Step kind="practice">
          <PracticeList concept="dimensional-matrix" />
          <QuickCheck ids={['q-rank', 'q-n-m-1', 'q-unique']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$m$ = rank of the dimensional matrix = order of its largest non-zero determinant; groups $= n - m$.`,
              md`Capillary rise: $r = 3$ letters in MLt but $m = 2$ ⇒ $\Delta h/D = f(\sigma/(D^2\gamma))$, the same in both systems; theory: $f = 4\cos\theta\,\Pi_2$.`,
              md`Sphere: $F/(\rho V^2D^2) = f(\mu/(\rho VD))$; rough pipe: $\Delta p/(\rho\overline V^2) = f(\mu/(\rho\overline VD), l/D, e/D)$.`,
              md`Groups are independent but not unique; prefer $\rho, V, L$ and write groups by inspection (stress/$\rho V^2$, force/$\rho V^2L^2$).`,
              md`$n - m = 1$ ⇒ the single Π is a constant (pendulum, deep-water waves).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
