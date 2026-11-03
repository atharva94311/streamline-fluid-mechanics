/**
 * Topic A5 — Velocity Potential & Laplace's Equation.
 * Sources: Lecture 10 slides 6–8 (φ, φ vs ψ, Laplace's equation, cylindrical forms), Lecture 11 slide 2 (problem 1, solved
 * here — the slide states it only), Fox & McDonald §6.6 pp. 222–224 (Eqs. 6.27–6.35, Table 6.1, start of Example 6.10).
 * Lecture 12 slides 2–4 repeat the material and are cross-cited.
 * Sign convention throughout: the course's V = +∇φ (u = ∂φ/∂x …). Fox uses V = −∇φ — flagged wherever Fox is quoted.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowField, FlowSteps, FormulaCard, Md, md, PracticeList,
  QuickCheck, Step, Supplement, Takeaways, type FlowMarker,
} from '@/kit'
import {
  CauchyRiemannFigure, SignConventionFigure, StencilFigure, Table61, UniformFlowFigure,
} from '../sims/potential-laplace/figures'
import { IrrotationalityLab } from '../sims/potential-laplace/IrrotationalityLab'
import { ExistenceVenn } from '../sims/potential-laplace/ExistenceVenn'
import { Table61Lab } from '../sims/potential-laplace/Table61Lab'
import { LaplaceRelaxation } from '../sims/potential-laplace/LaplaceRelaxation'
import { LaplaceExplorer } from '../sims/potential-laplace/LaplaceExplorer'
import { PsiPhiIntegrator } from '../sims/potential-laplace/PsiPhiIntegrator'

const L6: Src = { doc: 'lec10', pages: '6' }
const L7: Src = { doc: 'lec10', pages: '7' }
const L8: Src = { doc: 'lec10', pages: '8' }
const L2: Src = { doc: 'lec10', pages: '2' }
const L11: Src = { doc: 'lec11', pages: '2' }
const L9S12: Src = { doc: 'lec9', pages: '12' }
const L12S2: Src = { doc: 'lec12', pages: '2' }
const L12S3: Src = { doc: 'lec12', pages: '3' }
const L12S4: Src = { doc: 'lec12', pages: '4' }
const F221: Src = { doc: 'fox', pages: '221' }
const F222: Src = { doc: 'fox', pages: '222' }
const F223: Src = { doc: 'fox', pages: '223' }
const F224: Src = { doc: 'fox', pages: '224' }

/* Fields drawn inside steps (module constants → stable identities for FlowField). */
const foxPsi = (x: number, y: number) => 3 * x * x - 3 * y * y
const foxPhi = (x: number, y: number) => -6 * x * y
const lec11Psi = (x: number, y: number) => 5 * x * x * y - (5 / 3) * y ** 3
const lec11Phi = (x: number, y: number) => (5 / 3) * x ** 3 - 5 * x * y * y
const range = (a: number, b: number, d: number) => Array.from({ length: Math.round((b - a) / d) + 1 }, (_, k) => +(a + k * d).toFixed(6))
const FOX_PSI_LEVELS = range(-6, 12, 1.5)
const FOX_PHI_LEVELS = range(-18, 18, 1.5)
const LEC11_LEVELS = range(-14, 14, 1)
const ORIGIN: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation' }]
const LEC11_HL = [{ level: 0, color: 'var(--plot-4)', label: 'ψ = 0' }]

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'potential-laplace',
  unit: 'A',
  title: "Velocity Potential & Laplace's Equation",
  subtitle:
    "In irrotational flow one scalar φ generates the whole velocity field, V = ∇φ. Add incompressibility and φ must satisfy Laplace's equation — the doorway to potential-flow theory.",
  minutes: 85,
  sources: [
    { doc: 'lec10', pages: '6–8' },
    { doc: 'lec11', pages: '2' },
    { doc: 'fox', pages: '222–224' },
    { doc: 'lec12', pages: '2–4' },
  ],
  concepts: [
    {
      id: 'velocity-potential',
      title: 'Velocity potential for irrotational flow',
      src: [L6, { doc: 'fox', pages: '222–223' }],
      summary:
        'If ∇×V = 0 the velocity is the gradient of one scalar: u = ∂φ/∂x, v = ∂φ/∂y, w = ∂φ/∂z (V = ∇φ), because the curl of a gradient is identically zero. Cylindrical form v_r = ∂φ/∂r, v_θ = (1/r)∂φ/∂θ.',
    },
    {
      id: 'phi-vs-psi',
      title: 'Velocity potential vs stream function',
      src: [L7, { doc: 'fox', pages: '223–224' }],
      summary:
        'φ follows from irrotationality and exists in 3-D; ψ follows from mass conservation and (singly) only in 2-D. Fox Table 6.1: what each always satisfies and when each obeys Laplace.',
    },
    {
      id: 'laplace',
      title: "Laplace's equation & potential flow",
      src: [{ doc: 'lec10', pages: '7–8' }, F223],
      summary:
        "Incompressible + irrotational ⇒ ∇·∇φ = ∇²φ = 0 (Cartesian and cylindrical forms). Inviscid, incompressible, irrotational flows are potential flows; in plane potential flow ψ is harmonic too.",
    },
    {
      id: 'finding-phi-psi',
      title: 'Finding φ from ψ (and ψ from φ)',
      src: [L11, F224],
      summary:
        'Integrate u = ∂φ/∂x = ∂ψ/∂y and fix the integration function from v = ∂φ/∂y = −∂ψ/∂x. Lecture 11 problem 1 and Fox Example 6.10.',
    },
  ],
  sourceNote: md`**Sources.** Lecture 10, slides 6–8 (velocity potential, φ vs ψ, Laplace's equation, cylindrical forms) and Lecture 11, slide 2 (problem 1 — the slide states it without a solution, so the solution here is marked *written for this platform*), supported by Fox & McDonald §6.6, pp. 222–224 (Eqs. 6.27–6.35, Table 6.1 and the start of Example 6.10, whose solution continues on p. 225, outside the excerpt). Lecture 12, slides 2–4 repeat this material. **Sign convention:** the lectures use $\vb V = +\nabla\phi$; Fox uses $\vb V = -\nabla\phi$ (Eq. 6.27), so every Fox potential has the opposite sign — flagged wherever Fox is quoted. Content without a source chip is supplementary (✦).`,
}

/* -------------------------------------------------------------------------------------------- formulas */

export const formulas: FormulaDef[] = [
  /* ---- concept 1 */
  {
    id: 'irrot',
    name: 'Irrotationality conditions',
    tex: md`\begin{gathered} \omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = 0 \\ \pd{v}{x} = \pd{u}{y}, \qquad \pd{w}{y} = \pd{v}{z}, \qquad \pd{u}{z} = \pd{w}{x} \end{gathered}`,
    vars: [
      { sym: md`\omega_z`, desc: 'rotation (angular velocity) of a fluid element about the $z$-axis', units: md`\mathrm{rad/s}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components along $x$, $y$, $z$', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
      { sym: md`\pd{v}{x},\ \pd{u}{y},\ \dots`, desc: 'velocity gradients (angular rates of the element edges)', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      md`the three equalities are $\omega_z = 0$, $\omega_x = 0$, $\omega_y = 0$ — together, $\nabla\times\vb V = 0$ (Fox Eqs. 6.22–6.23)`,
      md`for plane flow in the $xy$-plane ($w = 0$, nothing depends on $z$) only $\pd{v}{x} = \pd{u}{y}$ is non-trivial`,
      'a kinematic statement about the velocity field at one instant — it applies to steady and unsteady, compressible and incompressible flow',
    ],
    use: md`The **existence test** for a velocity potential: compute the cross-derivatives first. If they match (all three pairs in 3-D, one pair in plane flow), a $\phi$ exists; if not, stop — no potential can be found.`,
    src: [L6, { doc: 'fox', pages: '221', note: 'Eqs. (6.22)–(6.23)' }],
  },
  {
    id: 'phi-def',
    name: 'Velocity potential — definition (course sign convention)',
    key: true,
    tex: md`u = \pd{\phi}{x}, \qquad v = \pd{\phi}{y}, \qquad w = \pd{\phi}{z} \qquad\Longleftrightarrow\qquad \vb V = \nabla\phi`,
    vars: [
      { sym: md`\phi(x, y, z, t)`, desc: 'velocity potential — a scalar function of position (and time)', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: md`\vb V`, desc: md`velocity vector $u\hat{\vb i} + v\hat{\vb j} + w\hat{\vb k}$`, units: md`\mathrm{m/s}` },
      { sym: md`\nabla`, desc: md`gradient operator $\hat{\vb i}\,\partial/\partial x + \hat{\vb j}\,\partial/\partial y + \hat{\vb k}\,\partial/\partial z$`, units: md`\mathrm{m^{-1}}` },
    ],
    conditions: [
      md`the flow must be **irrotational**, $\nabla\times\vb V = 0$ — that is the only requirement`,
      'valid in three dimensions, for steady or unsteady flow (φ may depend on t), compressible or incompressible',
      md`$\phi$ is fixed only up to an additive constant — only differences of $\phi$ carry meaning`,
      md`this is the lecture's sign (Lecture 10, slide 6, boxed); Fox and many textbooks use $\vb V = -\nabla\phi$`,
    ],
    use: md`**φ → velocity:** differentiate along each axis — no minus signs. **Velocity → φ:** integrate $\pd{\phi}{x} = u$ partially in $x$, then fix the "constant" (a function of the other variables) from the $v$- and $w$-relations.`,
    src: [{ doc: 'lec10', pages: '6', note: 'boxed' }, L12S4],
  },
  {
    id: 'curl-grad',
    name: 'The curl of a gradient is identically zero',
    tex: md`\nabla\times(\nabla\phi) = \operatorname{curl}(\operatorname{grad}\phi) \equiv 0`,
    vars: [
      { sym: md`\phi`, desc: 'any scalar function with continuous second derivatives', units: md`\mathrm{m^2/s}` },
      { sym: md`\nabla\times`, desc: md`curl operator; for a velocity field it gives the vorticity $2\boldsymbol\omega$`, units: md`\mathrm{m^{-1}}` },
      { sym: md`\equiv`, desc: md`identically equal: true for every such $\phi$, not an equation to be solved` },
    ],
    conditions: [
      md`component form: $(\nabla\times\nabla\phi)_z = \frac{\partial^2\phi}{\partial x\,\partial y} - \frac{\partial^2\phi}{\partial y\,\partial x} = 0$ because mixed partial derivatives commute (Fox, footnote 3: expand into components)`,
      md`Fox prints it as $\nabla\times\vec V = -\nabla\times\nabla\phi = -\operatorname{curl}(\operatorname{grad}\phi) \equiv 0$ (Eq. 6.28) because of his minus sign; the identity itself is sign-free`,
    ],
    use: md`It is the reason **any** $\phi$ produces an irrotational velocity field — and, read backwards, the reason a velocity potential can exist **only** for irrotational flow (Fox p. 222).`,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.28) and footnote 3' },
  },
  {
    id: 'phi-fox',
    name: "Velocity potential — Fox's sign convention",
    tex: md`\vec V = -\nabla\phi \quad\Longrightarrow\quad u = -\pd{\phi}{x}, \qquad v = -\pd{\phi}{y}, \qquad w = -\pd{\phi}{z}`,
    tag: '6.27, 6.29',
    vars: [
      { sym: md`\phi`, desc: md`potential function in Fox's convention; for the same flow $\phi_{\text{Fox}} = -\phi_{\text{course}}$`, units: md`\mathrm{m^2/s}` },
      { sym: md`\vec V`, desc: "velocity vector (Fox's arrow notation)", units: md`\mathrm{m/s}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'irrotational flow — exactly the same requirement as in the course definition',
      'the minus sign is pure convention, inserted so that φ decreases in the flow direction — like temperature decreasing in the direction of heat flow (Fox p. 222)',
    ],
    use: md`When you read Fox or check an answer against it, **flip the sign of φ**: a course potential $\phi = 8xy$ is $\phi = -8xy$ in Fox. Velocities, streamlines, pressures — every physical result — are unchanged.`,
    src: { doc: 'fox', pages: '222', note: 'Eqs. (6.27), (6.29)' },
  },
  {
    id: 'grad-cyl',
    name: 'Gradient operator in cylindrical coordinates',
    tex: md`\nabla(\;) = \frac{\partial(\;)}{\partial r}\,\hat{\vb e}_r + \frac{1}{r}\frac{\partial(\;)}{\partial\theta}\,\hat{\vb e}_\theta + \frac{\partial(\;)}{\partial z}\,\hat{\vb e}_z`,
    tag: '3.19',
    vars: [
      { sym: md`r`, desc: 'radial distance from the $z$-axis', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: 'polar angle, measured anticlockwise from the $x$-axis', units: md`\mathrm{rad}` },
      { sym: md`z`, desc: 'axial coordinate', units: md`\mathrm{m}` },
      { sym: md`\hat{\vb e}_r,\ \hat{\vb e}_\theta,\ \hat{\vb e}_z`, desc: 'unit vectors in the radial, tangential and axial directions', units: md`\text{--}` },
      { sym: md`(\;)`, desc: 'placeholder for any scalar the operator acts on' },
    ],
    conditions: [
      md`cylindrical coordinates: $x = r\cos\theta$, $y = r\sin\theta$, $z = z$`,
      md`the $1/r$ converts an angle change into a distance — an arc of angle $d\theta$ is $r\,d\theta$ long`,
      md`slide 8 prints the last unit vector as "$\hat{\vb e}z$" in its first two lines — a typesetting slip for $\hat{\vb e}_z$`,
    ],
    use: md`Apply it to $\phi$ and match components with $\vb V = v_r\hat{\vb e}_r + v_\theta\hat{\vb e}_\theta + v_z\hat{\vb e}_z$ to get the cylindrical velocity components (next card).`,
    src: [L8, { doc: 'fox', pages: '222', note: 'Eq. (3.19)' }],
  },
  {
    id: 'phi-cyl',
    name: 'Velocity components from φ — cylindrical coordinates',
    key: true,
    tex: md`\begin{gathered} \vb V = v_r\hat{\vb e}_r + v_\theta\hat{\vb e}_\theta + v_z\hat{\vb e}_z = \nabla\phi \\ v_r = \pd{\phi}{r}, \qquad v_\theta = \frac{1}{r}\pd{\phi}{\theta}, \qquad v_z = \pd{\phi}{z} \end{gathered}`,
    vars: [
      { sym: md`v_r`, desc: 'radial velocity (positive outward)', units: md`\mathrm{m/s}` },
      { sym: md`v_\theta`, desc: md`tangential velocity (positive towards increasing $\theta$, i.e. anticlockwise)`, units: md`\mathrm{m/s}` },
      { sym: md`v_z`, desc: 'axial velocity', units: md`\mathrm{m/s}` },
      { sym: md`\phi(r, \theta, z, t)`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m,\ rad,\ m}` },
    ],
    conditions: [
      'irrotational flow',
      md`course convention $\vb V = +\nabla\phi$ (Lecture 10, slide 8); Fox's Eq. (6.30) has a minus sign on every component`,
      md`the $1/r$ sits on $v_\theta$ — for the stream function (Lecture 10, slide 2) it sits on $v_r$ instead`,
    ],
    use: md`Use for flows with a natural centre or axis (sources, vortices, flow round cylinders). Units check: $\phi$ [m²/s] ÷ $r$ [m] → m/s; forgetting the $1/r$ in $v_\theta$ leaves m²/s.`,
    src: [L8, L12S3],
  },
  {
    id: 'phi-cyl-fox',
    name: "Cylindrical components — Fox's sign convention",
    tex: md`V_r = -\pd{\phi}{r}, \qquad V_\theta = -\frac{1}{r}\pd{\phi}{\theta}, \qquad V_z = -\pd{\phi}{z}`,
    tag: '6.30',
    vars: [
      { sym: md`V_r,\ V_\theta,\ V_z`, desc: "Fox's notation for the radial, tangential and axial velocity components", units: md`\mathrm{m/s}` },
      { sym: md`\phi`, desc: md`potential in Fox's convention ($\vec V = -\nabla\phi$)`, units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'irrotational flow',
      md`Fox's sign; the plane-flow pair $V_r = -\pd{\phi}{r}$, $V_\theta = -\frac1r\pd{\phi}{\theta}$ is printed again as Eq. (6.33) on p. 223`,
    ],
    use: 'Same structure as Lecture 10, slide 8 with every sign reversed — useful when following Fox’s worked examples.',
    src: [
      { doc: 'fox', pages: '222', note: 'Eq. (6.30)' },
      { doc: 'fox', pages: '223', note: 'Eq. (6.33)' },
    ],
  },

  /* ---- concept 2 */
  {
    id: 'psi-def',
    name: 'Stream function (recap) — plane incompressible flow',
    tex: md`u = \pd{\psi}{y}, \qquad v = -\pd{\psi}{x}`,
    tag: '5.4',
    vars: [
      { sym: md`\psi(x, y)`, desc: 'stream function: constant along streamlines; differences = volume flow rate per unit depth', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'plane two-dimensional flow',
      'incompressible — ψ is built so that continuity holds identically',
      'the lectures (Lecture 9, slide 12) and Fox (Eq. 5.4) use the same sign here — only φ has a convention clash',
    ],
    use: md`The "crossed" rule: $u$ comes from the $y$-derivative, $v$ from the $x$-derivative with a minus sign. Contrast with φ's "straight" rule $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$.`,
    src: [L9S12, { doc: 'fox', pages: '223', note: 'Eq. (5.4)' }],
  },
  {
    id: 'psi-polar',
    name: 'Stream function in polar coordinates (recap)',
    tex: md`v_r = \frac{1}{r}\pd{\psi}{\theta}, \qquad v_\theta = -\pd{\psi}{r}`,
    tag: '5.8',
    vars: [
      { sym: md`v_r,\ v_\theta`, desc: 'radial and tangential velocity components', units: md`\mathrm{m/s}` },
      { sym: md`\psi(r, \theta)`, desc: 'stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m,\ rad}` },
    ],
    conditions: ['plane, incompressible flow', md`compare $\phi$: $v_r = \pd{\phi}{r}$, $v_\theta = \frac1r\pd{\phi}{\theta}$ — the $1/r$ and the minus sign move`],
    use: 'Fox p. 223: the same rules about when ψ and φ satisfy Laplace hold in cylindrical coordinates.',
    src: [L2, { doc: 'fox', pages: '223', note: 'Eq. (5.8)' }],
  },
  {
    id: 'psi-identity',
    name: 'ψ always satisfies continuity (Table 6.1)',
    tex: md`\pd{u}{x} + \pd{v}{y} = \frac{\partial^2\psi}{\partial x\,\partial y} - \frac{\partial^2\psi}{\partial y\,\partial x} \equiv 0`,
    vars: [
      { sym: md`\psi`, desc: 'any smooth stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`\frac{\partial^2\psi}{\partial x\,\partial y}`, desc: 'mixed second derivative — equal to the one taken in the other order', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: ['holds for every smooth ψ: incompressibility is built in', 'plane flow'],
    use: 'Why a stream function exists for every plane incompressible flow — rotational or not.',
    src: { doc: 'fox', pages: '224', note: 'Table 6.1' },
  },
  {
    id: 'phi-identity',
    name: 'φ always satisfies irrotationality (Table 6.1, course signs)',
    tex: md`\pd{v}{x} - \pd{u}{y} = \frac{\partial^2\phi}{\partial x\,\partial y} - \frac{\partial^2\phi}{\partial y\,\partial x} \equiv 0`,
    vars: [
      { sym: md`\phi`, desc: 'any smooth velocity potential', units: md`\mathrm{m^2/s}` },
      { sym: md`\pd{v}{x} - \pd{u}{y}`, desc: md`twice the rotation rate, $2\omega_z$`, units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      md`written with the course's $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$`,
      md`in Fox's convention both terms change sign: $-\frac{\partial^2\phi}{\partial x\,\partial y} + \frac{\partial^2\phi}{\partial y\,\partial x}$; the printed table shows "$-\dots-$", a sign typo (the cancellation needs opposite signs)`,
    ],
    use: md`Why every potential flow is irrotational. What can fail for a φ is only Laplace's equation — i.e. incompressibility.`,
    src: { doc: 'fox', pages: '224', note: 'Table 6.1 (sign typo corrected)' },
  },
  {
    id: 'how-far',
    name: 'How far from Laplace? Rotation and dilatation',
    tex: md`\nabla^2\psi = -\left(\pd{v}{x} - \pd{u}{y}\right) = -2\,\omega_z, \qquad \nabla^2\phi = \pd{u}{x} + \pd{v}{y} = \nabla\cdot\vb V`,
    vars: [
      { sym: md`\nabla^2\psi`, desc: 'Laplacian of the stream function', units: md`\mathrm{s^{-1}}` },
      { sym: md`\omega_z`, desc: 'particle rotation rate about $z$', units: md`\mathrm{s^{-1}}` },
      { sym: md`\nabla^2\phi`, desc: 'Laplacian of the velocity potential', units: md`\mathrm{s^{-1}}` },
      { sym: md`\nabla\cdot\vb V`, desc: 'volume dilatation rate (fractional rate of volume growth of an element)', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      md`plane flow; ψ with $u = \psi_y$, $v = -\psi_x$; φ with the course's $\vb V = +\nabla\phi$ (in Fox's convention $\nabla^2\phi = -\nabla\cdot\vb V$)`,
    ],
    use: md`Turns Table 6.1's yes/no into a number: a non-harmonic ψ tells you how fast particles spin; a non-harmonic φ tells you how fast volume is created.`,
  },
  {
    id: 'slopes',
    name: 'Slopes of streamlines and equipotentials',
    tex: md`\left.\frac{dy}{dx}\right)_{\psi} = -\frac{\partial\psi/\partial x}{\partial\psi/\partial y} = \frac{v}{u}, \qquad \left.\frac{dy}{dx}\right)_{\phi} = -\frac{\partial\phi/\partial x}{\partial\phi/\partial y} = -\frac{u}{v}`,
    tag: '6.34, 6.35',
    vars: [
      { sym: md`\left.\frac{dy}{dx}\right)_{\psi}`, desc: md`slope of a streamline (line of constant $\psi$, $d\psi = 0$)`, units: md`\text{--}` },
      { sym: md`\left.\frac{dy}{dx}\right)_{\phi}`, desc: md`slope of an equipotential (line of constant $\phi$, $d\phi = 0$)`, units: md`\text{--}` },
      { sym: md`u,\ v`, desc: 'velocity components at the point', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'plane flow in which both ψ and φ exist (incompressible and irrotational)',
      md`Eq. (6.34) is printed with a slip in the middle term; the intended form, from $d\psi = 0$, is shown`,
      md`the result $-u/v$ is convention-proof: with Fox's signs $-(-u)/(-v) = -u/v$`,
      'undefined at stagnation points, where u = v = 0',
    ],
    use: md`Product of the slopes $= (v/u)(-u/v) = -1$: streamlines and equipotentials cross at right angles — the basis of the **flow net** (developed in the flow-nets topic, Lecture 12).`,
    src: { doc: 'fox', pages: '224', note: 'Eqs. (6.34)–(6.35)' },
  },

  /* ---- concept 3 */
  {
    id: 'continuity',
    name: 'Continuity — incompressible flow',
    tex: md`\nabla\cdot\vb V = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0`,
    vars: [
      { sym: md`\nabla\cdot\vb V`, desc: 'divergence of the velocity = volume dilatation rate', units: md`\mathrm{s^{-1}}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['constant density (incompressible)', 'holds at every instant — steady or unsteady', md`plane flow: drop $\pd{w}{z}$ (Fox Eq. 5.3)`],
    use: md`The equation Laplace's equation for φ comes from: substitute $\vb V = \nabla\phi$.`,
    src: [L7, { doc: 'fox', pages: '223', note: 'Eq. (5.3), 2-D form' }],
  },
  {
    id: 'laplacian',
    name: 'Laplacian operator',
    tex: md`\nabla^2(\;) = \nabla\cdot\nabla(\;) = \frac{\partial^2(\;)}{\partial x^2} + \frac{\partial^2(\;)}{\partial y^2} + \frac{\partial^2(\;)}{\partial z^2}`,
    vars: [
      { sym: md`\nabla^2`, desc: 'Laplacian: the divergence of the gradient', units: md`\mathrm{m^{-2}}` },
      { sym: md`(\;)`, desc: 'placeholder for any scalar field' },
    ],
    conditions: ['Cartesian form shown; see the cylindrical card for (r, θ, z)'],
    use: md`Applied to $\phi$ it gives $\nabla\cdot\vb V$ (course signs). It measures how much a value differs from the average of its surroundings.`,
    src: L7,
  },
  {
    id: 'laplace-phi',
    name: "Laplace's equation for φ",
    key: true,
    tex: md`\nabla^2\phi = \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2} = 0`,
    vars: [
      { sym: md`\phi(x, y, z)`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
      { sym: md`\frac{\partial^2\phi}{\partial x^2},\ \dots`, desc: md`second derivatives (curvatures) of $\phi$`, units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      md`**incompressible** ($\nabla\cdot\vb V = 0$) **and irrotational** ($\phi$ exists)`,
      'inviscid, incompressible, irrotational flows are governed by it: potential flow (Lecture 10, slide 7)',
      md`linear: sums of solutions are solutions; plane flow: drop the $z$-term (Fox Eq. 6.32)`,
    ],
    use: md`Test a proposed potential: if $\nabla^2\phi \ne 0$ it cannot be an incompressible flow. To solve a flow, find the harmonic $\phi$ that satisfies the boundary conditions; the pressure follows afterwards from Bernoulli.`,
    src: [L7, L12S2, { doc: 'fox', pages: '223', note: 'Eq. (6.32), 2-D form' }],
  },
  {
    id: 'laplace-cyl',
    name: "Laplace's equation — cylindrical coordinates",
    key: true,
    tex: md`\frac{1}{r}\pd{}{r}\!\left(r\pd{\phi}{r}\right) + \frac{1}{r^2}\frac{\partial^2\phi}{\partial\theta^2} + \frac{\partial^2\phi}{\partial z^2} = 0`,
    vars: [
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m,\ rad,\ m}` },
      { sym: md`\phi(r, \theta, z)`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'incompressible and irrotational flow',
      md`plane flow: drop $\frac{\partial^2\phi}{\partial z^2}$`,
      md`the radial term is **not** simply $\frac{\partial^2\phi}{\partial r^2}$: it expands to $\frac{\partial^2\phi}{\partial r^2} + \frac1r\pd{\phi}{r}$`,
    ],
    use: md`Natural for sources, vortices and bodies of revolution: e.g. $\ln r$, $\theta$ and $r^{\pm n}\cos n\theta$ all satisfy it (for $r > 0$).`,
    src: L8,
  },
  {
    id: 'laplace-psi',
    name: "Laplace's equation for ψ — only if irrotational",
    tex: md`\frac{\partial^2\psi}{\partial x^2} + \frac{\partial^2\psi}{\partial y^2} = \nabla^2\psi = 0`,
    tag: '6.31',
    vars: [{ sym: md`\psi(x, y)`, desc: 'stream function of a plane flow', units: md`\mathrm{m^2/s}` }],
    conditions: [
      md`plane, incompressible flow that is also **irrotational**`,
      md`obtained by substituting $u = \psi_y$, $v = -\psi_x$ into the irrotationality condition $\pd{v}{x} - \pd{u}{y} = 0$ (Eq. 6.23)`,
    ],
    use: md`In plane potential flow **both** $\phi$ and $\psi$ are harmonic. A $\psi$ with $\nabla^2\psi \ne 0$ describes a rotational flow.`,
    src: { doc: 'fox', pages: '223', note: 'Eq. (6.31)' },
  },
  {
    id: 'laplace-fd',
    name: 'Laplacian on a grid (five-point stencil)',
    tex: md`\nabla^2\phi\big|_P \approx \frac{\phi_E + \phi_W + \phi_N + \phi_S - 4\phi_P}{h^2} = \frac{4}{h^2}\left(\bar\phi_{\mathrm{nb}} - \phi_P\right)`,
    vars: [
      { sym: md`\phi_P`, desc: 'value at the grid point $P$', units: md`\mathrm{m^2/s}` },
      { sym: md`\phi_E,\ \phi_W,\ \phi_N,\ \phi_S`, desc: 'values at the four neighbours a distance $h$ east, west, north and south', units: md`\mathrm{m^2/s}` },
      { sym: md`\bar\phi_{\mathrm{nb}}`, desc: 'mean of the four neighbour values', units: md`\mathrm{m^2/s}` },
      { sym: md`h`, desc: 'grid spacing', units: md`\mathrm{m}` },
    ],
    conditions: ['plane field, smooth on the scale h', md`error of order $h^2$ (exact for polynomials up to cubic)`],
    use: md`Laplace's equation on a grid says **every point equals the mean of its neighbours** — the idea behind relaxation solvers and the "no bumps, no dips" picture of harmonic functions.`,
  },

  /* ---- concept 4 */
  {
    id: 'cr',
    name: 'Plane potential flow: φ and ψ give the same velocity',
    key: true,
    tex: md`u = \pd{\phi}{x} = \pd{\psi}{y}, \qquad v = \pd{\phi}{y} = -\pd{\psi}{x}`,
    vars: [
      { sym: md`\phi(x, y)`, desc: 'velocity potential (course convention)', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi(x, y)`, desc: 'stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'plane flow that is incompressible AND irrotational, so that both functions exist',
      md`course convention; with Fox's signs (Eqs. 5.4 and 6.29 boxed together on p. 223): $\pd{\phi}{x} = -\pd{\psi}{y}$, $\pd{\phi}{y} = +\pd{\psi}{x}$`,
      'mathematicians know this pair as the Cauchy–Riemann equations',
    ],
    use: md`**ψ → φ:** integrate $\pd{\phi}{x} = u$ in $x$ (+ $f(y)$), fix $f$ from $\pd{\phi}{y} = v$. **φ → ψ:** integrate $\pd{\psi}{y} = u$ in $y$ (+ $g(x)$), fix $g$ from $-\pd{\psi}{x} = v$.`,
    src: [
      { doc: 'lec12', pages: '3', note: 'components from φ and from ψ' },
      { doc: 'fox', pages: '223', note: 'Eqs. (5.4), (6.29), Fox signs' },
    ],
  },
  {
    id: 'cr-polar',
    name: 'The same pair in polar coordinates',
    tex: md`v_r = \pd{\phi}{r} = \frac{1}{r}\pd{\psi}{\theta}, \qquad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r}`,
    vars: [
      { sym: md`v_r,\ v_\theta`, desc: 'radial and tangential velocity', units: md`\mathrm{m/s}` },
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m,\ rad}` },
    ],
    conditions: ['plane, incompressible, irrotational flow; course convention'],
    use: md`Same recipe in $(r, \theta)$: integrate $\pd{\phi}{r} = v_r$ in $r$ (+ $f(\theta)$), then fix $f$ from $\frac1r\pd{\phi}{\theta} = v_\theta$.`,
    src: [L12S3, L8, L2],
  },
]

/* -------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  /* ---- concept 1 */
  {
    id: 'ex-vp-3d',
    concept: 'velocity-potential',
    title: 'A three-dimensional velocity potential',
    difficulty: 2,
    given: md`A steady velocity field $\vb V = k\,(yz\,\hat{\vb i} + xz\,\hat{\vb j} + xy\,\hat{\vb k})$ with $k = 2\ \mathrm{m^{-1}s^{-1}}$; $x, y, z$ in metres.`,
    find: md`(a) Is the flow irrotational? (b) Its velocity potential $\phi$. (c) $\vb V$ and $|\vb V|$ at $(1, 2, 3)$ m, and $\phi(1, 2, 3) - \phi(0, 0, 0)$.`,
    assumptions: md`Course sign convention $\vb V = \nabla\phi$.`,
    steps: [
      {
        title: 'Test all three irrotationality conditions',
        md: md`$\pd{w}{y} - \pd{v}{z} = kx - kx = 0$, $\quad \pd{u}{z} - \pd{w}{x} = ky - ky = 0$, $\quad \pd{v}{x} - \pd{u}{y} = kz - kz = 0$. Every rotation component vanishes → irrotational, so a $\phi$ exists.`,
      },
      {
        title: 'Integrate the x-relation',
        md: md`$\pd{\phi}{x} = u = kyz \;\Rightarrow\; \phi = kxyz + f(y, z)$ — in 3-D the "constant" may depend on **both** other variables.`,
      },
      {
        title: 'Fix f with the y- and z-relations',
        md: md`$\pd{\phi}{y} = kxz + \pd{f}{y} = v = kxz \Rightarrow \pd{f}{y} = 0$, so $f = g(z)$. Then $\pd{\phi}{z} = kxy + g'(z) = w = kxy \Rightarrow g'(z) = 0$.`,
      },
      { title: 'Result', md: md`$\phi = kxyz + C = 2xyz + C$ (m²/s).` },
      {
        title: 'Evaluate at (1, 2, 3) m',
        md: md`$u = 2(2)(3) = 12$, $v = 2(1)(3) = 6$, $w = 2(1)(2) = 4$ m/s, so $|\vb V| = \sqrt{12^2 + 6^2 + 4^2} = \sqrt{196} = 14.0$ m/s. And $\phi(1,2,3) - \phi(0,0,0) = 2(1)(2)(3) = 12$ m²/s.`,
      },
    ],
    answer: md`Irrotational; $\phi = 2xyz + C$ m²/s; $\vb V = (12, 6, 4)$ m/s, $|\vb V| = 14.0$ m/s; $\Delta\phi = 12$ m²/s.`,
    insight: 'A velocity potential describes a genuinely three-dimensional flow with one scalar — something no single stream function can do.',
  },
  {
    id: 'ex-vp-cyl',
    concept: 'velocity-potential',
    title: 'Velocity components from φ in cylindrical coordinates',
    difficulty: 2,
    given: md`Plane potential $\phi = A r^2\cos2\theta$ with $A = 2\ \mathrm{s^{-1}}$ ($r$ in m). Point: $r = 1.5$ m, $\theta = 30^\circ$.`,
    find: md`$v_r$, $v_\theta$ and the speed there; check against Cartesian components.`,
    steps: [
      { title: 'Radial component', md: md`$v_r = \pd{\phi}{r} = 2Ar\cos2\theta = 2(2)(1.5)\cos60^\circ = 6(0.5) = 3.00$ m/s` },
      {
        title: 'Tangential component — remember the 1/r',
        md: md`$v_\theta = \dfrac1r\pd{\phi}{\theta} = \dfrac1r\left(-2Ar^2\sin2\theta\right) = -2Ar\sin2\theta = -6\sin60^\circ = -5.20$ m/s (negative: clockwise)`,
      },
      { title: 'Speed', md: md`$|\vb V| = \sqrt{3.00^2 + 5.20^2} = \sqrt{9 + 27} = 6.00$ m/s, which equals $2Ar$.` },
      {
        title: 'Cartesian cross-check',
        md: md`$r^2\cos2\theta = r^2(\cos^2\theta - \sin^2\theta) = x^2 - y^2$, so $\phi = A(x^2 - y^2)$: $u = 2Ax$, $v = -2Ay$. At $x = 1.5\cos30^\circ = 1.299$ m, $y = 0.750$ m: $u = 5.20$, $v = -3.00$ m/s. Then $v_r = u\cos\theta + v\sin\theta = 4.50 - 1.50 = 3.00$ ✓ and $v_\theta = -u\sin\theta + v\cos\theta = -2.60 - 2.60 = -5.20$ ✓.`,
      },
    ],
    answer: md`$v_r = 3.00$ m/s, $v_\theta = -5.20$ m/s, $|\vb V| = 6.00$ m/s.`,
    insight: 'Dropping the 1/r would give "v_θ = −7.79" — with units of m²/s, the tell-tale sign of the slip.',
  },

  /* ---- concept 2 */
  {
    id: 'ex-pp-same',
    concept: 'phi-vs-psi',
    title: 'One function, two meanings: f = x² + y²',
    difficulty: 2,
    given: md`$f(x, y) = x^2 + y^2$ (m²/s, with a coefficient of $1\ \mathrm{s^{-1}}$ understood; $x, y$ in m).`,
    find: md`Interpret $f$ (a) as a stream function and (b) as a velocity potential. In each case, which Table 6.1 conditions hold, and does the companion function exist?`,
    steps: [
      { title: '(a) f as ψ — velocities', md: md`$u = \pd{\psi}{y} = 2y$, $\ v = -\pd{\psi}{x} = -2x$: circles about the origin, clockwise (at $(1, 0)$, $v = -2$ m/s).` },
      {
        title: '(a) Table 6.1 checks',
        md: md`Continuity: $\pd{u}{x} + \pd{v}{y} = 0 + 0 = 0$ ✓ (always). Laplace: $\nabla^2\psi = 2 + 2 = 4 \ne 0$ → **not** irrotational; indeed $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(-2 - 2) = -2\ \mathrm{s^{-1}}$ — rigid-body rotation. **No φ exists.**`,
      },
      { title: '(b) f as φ — velocities', md: md`$u = \pd{\phi}{x} = 2x$, $\ v = \pd{\phi}{y} = 2y$: straight radial outflow from the origin.` },
      {
        title: '(b) Table 6.1 checks',
        md: md`Irrotationality: $\pd{v}{x} - \pd{u}{y} = 0 - 0 = 0$ ✓ (always). Laplace: $\nabla^2\phi = 4 \ne 0$ → **not** incompressible: $\nabla\cdot\vb V = 2 + 2 = 4\ \mathrm{s^{-1}}$, every element swells. **No ψ exists.**`,
      },
    ],
    answer: md`As $\psi$: incompressible rigid rotation, $\omega_z = -2\ \mathrm{s^{-1}}$, no $\phi$. As $\phi$: irrotational radial expansion, $\nabla\cdot\vb V = 4\ \mathrm{s^{-1}}$, no $\psi$.`,
    insight: "Each function guarantees its own condition; Laplace's equation tests the other one.",
  },
  {
    id: 'ex-pp-lec10',
    concept: 'phi-vs-psi',
    title: 'Does the Lecture 10 in-class flow have a velocity potential?',
    difficulty: 2,
    given: md`The plane, incompressible field of the in-class problem on Lecture 10, slide 2: $u = 2y$, $v = 4x$ (coefficients in s⁻¹).`,
    find: md`Its stream function, whether a velocity potential exists, and a Table 6.1 cross-check.`,
    steps: [
      {
        title: 'Stream function first',
        md: md`$\pd{u}{x} + \pd{v}{y} = 0$, so $\psi$ exists: $\pd{\psi}{y} = 2y \Rightarrow \psi = y^2 + f(x)$; $-f'(x) = 4x \Rightarrow f = -2x^2$. So $\psi = y^2 - 2x^2$.`,
      },
      { title: 'Irrotationality test', md: md`$\pd{v}{x} - \pd{u}{y} = 4 - 2 = 2 \ne 0$, so $\omega_z = 1\ \mathrm{s^{-1}}$: rotational. **No velocity potential.**` },
      { title: 'Table 6.1 cross-check', md: md`$\nabla^2\psi = -4 + 2 = -2 \ne 0$: ψ is not harmonic, as expected for a rotational flow (and $\nabla^2\psi = -2\omega_z$ ✓).` },
      {
        title: 'What happens if you try anyway',
        md: md`$\pd{\phi}{x} = u = 2y \Rightarrow \phi = 2xy + g(y)$; then $\pd{\phi}{y} = 2x + g'(y)$ must equal $v = 4x$, so $g'(y) = 2x$ — a function of $y$ alone cannot equal $2x$. Contradiction.`,
      },
    ],
    answer: md`$\psi = y^2 - 2x^2$ exists; $\omega_z = 1\ \mathrm{s^{-1}} \ne 0$, so there is no $\phi$.`,
    insight: 'Continuity guarantees ψ, not φ — check the rotation before hunting for a potential.',
  },

  /* ---- concept 3 */
  {
    id: 'ex-lap-test',
    concept: 'laplace',
    title: 'Which proposed potentials are incompressible flows?',
    difficulty: 1,
    given: md`Three proposed plane velocity potentials, $x, y$ in m (coefficients carry the units needed for φ in m²/s): (a) $\phi = 3xy + 2x$; (b) $\phi = x^2 + 2y^2$; (c) $\phi = e^{x}\cos y$.`,
    find: md`Which satisfy Laplace's equation, and what does a failure mean physically?`,
    steps: [
      { title: '(a)', md: md`$\frac{\partial^2\phi}{\partial x^2} = 0$, $\frac{\partial^2\phi}{\partial y^2} = 0$ → $\nabla^2\phi = 0$ ✓: a possible potential flow (a corner flow $3xy$ plus a uniform stream of 2 m/s along $x$).` },
      {
        title: '(b)',
        md: md`$\nabla^2\phi = 2 + 4 = 6\ \mathrm{s^{-1}} \ne 0$ ✗. The velocity $u = 2x$, $v = 4y$ is irrotational (as for any φ), but $\nabla\cdot\vb V = \nabla^2\phi = 6\ \mathrm{s^{-1}}$: each fluid element's volume grows at a fractional rate of 6 per second — impossible for a liquid.`,
      },
      { title: '(c)', md: md`$\frac{\partial^2\phi}{\partial x^2} = e^x\cos y$, $\frac{\partial^2\phi}{\partial y^2} = -e^x\cos y$ → $\nabla^2\phi = 0$ ✓: a possible flow.` },
    ],
    answer: md`(a) and (c) are possible incompressible potential flows; (b) is not ($\nabla\cdot\vb V = 6\ \mathrm{s^{-1}}$).`,
    insight: "For a velocity potential, Laplace's equation is simply the continuity equation in disguise.",
  },
  {
    id: 'ex-lap-cyl',
    concept: 'laplace',
    title: 'Laplace in cylindrical form: a family of corner flows',
    difficulty: 3,
    given: md`Proposed plane potential $\phi = A\,r^n\cos3\theta$, $A$ a constant.`,
    find: md`(a) The values of $n$ for which $\phi$ satisfies Laplace's equation. (b) For $n = 3$ and $A = \tfrac53\ \mathrm{m^{-1}s^{-1}}$: $v_r$, $v_\theta$ and $|\vb V|$ at $r = 1.2$ m, $\theta = 20^\circ$.`,
    steps: [
      { title: 'Radial term', md: md`$r\pd{\phi}{r} = nAr^n\cos3\theta \;\Rightarrow\; \dfrac1r\pd{}{r}\left(r\pd{\phi}{r}\right) = n^2Ar^{n-2}\cos3\theta$` },
      { title: 'Angular term', md: md`$\dfrac{1}{r^2}\dfrac{\partial^2\phi}{\partial\theta^2} = \dfrac{1}{r^2}\left(-9Ar^n\cos3\theta\right) = -9Ar^{n-2}\cos3\theta$ (and there is no $z$-dependence).` },
      { title: "Impose Laplace's equation", md: md`Sum $= (n^2 - 9)\,Ar^{n-2}\cos3\theta = 0$ for all $r, \theta$ $\;\Rightarrow\; n = \pm3$.` },
      {
        title: 'Velocity for n = 3',
        md: md`$v_r = \pd{\phi}{r} = 3Ar^2\cos3\theta = 3\left(\tfrac53\right)(1.44)\cos60^\circ = 7.2(0.5) = 3.60$ m/s; $\ v_\theta = \dfrac1r\pd{\phi}{\theta} = -3Ar^2\sin3\theta = -7.2\sin60^\circ = -6.24$ m/s; $\ |\vb V| = 3Ar^2 = 7.20$ m/s.`,
      },
      {
        title: 'Recognise it',
        md: md`$r^3\cos3\theta = x^3 - 3xy^2$, so this is $\phi = \tfrac53x^3 - 5xy^2$ — exactly the potential found for Lecture 11's problem 1 (concept 4): flow in a 60° corner.`,
      },
    ],
    answer: md`(a) $n = \pm3$. (b) $v_r = 3.60$ m/s, $v_\theta = -6.24$ m/s, $|\vb V| = 7.20$ m/s.`,
    insight: "In polar form, Laplace's equation turns the guess rⁿ cos mθ into the simple rule n = ±m.",
  },

  /* ---- concept 4 */
  {
    id: 'ex-find-lec11',
    concept: 'finding-phi-psi',
    title: 'Lecture 11, problem 1: from ψ to φ',
    src: { doc: 'lec11', pages: '2', note: 'Problem 1' },
    solutionBy: 'platform',
    difficulty: 2,
    given: md`A two-dimensional flow field has the stream function $\psi = 5x^2y - \tfrac53y^3$ (no units are given on the slide).`,
    find: md`The corresponding velocity potential $\phi$.`,
    assumptions: md`Course conventions: $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ and $\vb V = +\nabla\phi$.`,
    steps: [
      { title: 'Velocities', md: md`$u = \pd{\psi}{y} = 5x^2 - 5y^2, \qquad v = -\pd{\psi}{x} = -10xy$` },
      {
        title: 'Check that a potential exists',
        md: md`$\pd{v}{x} = -10y$ and $\pd{u}{y} = -10y$, so $\pd{v}{x} - \pd{u}{y} = 0$: irrotational. (Equivalently $\nabla^2\psi = 10y - 10y = 0$ — Table 6.1.)`,
      },
      { title: 'Integrate the x-relation', md: md`$\pd{\phi}{x} = u = 5x^2 - 5y^2 \;\Rightarrow\; \phi = \tfrac53x^3 - 5xy^2 + f(y)$` },
      { title: 'Match the y-relation', md: md`$\pd{\phi}{y} = -10xy + f'(y)$ must equal $v = -10xy$, so $f'(y) = 0$ and $f = C$.` },
      {
        title: 'Result and check',
        md: md`$\phi = \tfrac53x^3 - 5xy^2 + C$. Check: $\pd{\phi}{x} = 5x^2 - 5y^2 = u$ ✓, $\pd{\phi}{y} = -10xy = v$ ✓, and $\nabla^2\phi = 10x - 10x = 0$ — the flow is incompressible, as any flow with a ψ must be.`,
      },
      {
        title: "In Fox's convention",
        md: md`With $\vec V = -\nabla\phi$ (Fox Eq. 6.27) every sign flips: $\phi_{\text{Fox}} = -\tfrac53x^3 + 5xy^2 + C$ — same flow, same velocities.`,
      },
    ],
    answer: md`$\phi = \tfrac53x^3 - 5xy^2 + C$ (course convention; $-\tfrac53x^3 + 5xy^2 + C$ in Fox's).`,
    insight: 'The integration "constant" f(y) came out as a true constant — the algebraic signature of an irrotational flow.',
  },
  {
    id: 'ex-find-fox610',
    concept: 'finding-phi-psi',
    title: 'Fox Example 6.10: velocity potential from ψ = ax² − ay²',
    src: { doc: 'fox', pages: '224', note: 'Example 6.10' },
    solutionBy: 'platform',
    difficulty: 2,
    given: md`Incompressible flow field with $\psi = ax^2 - ay^2$, where $a = 3\ \mathrm{s^{-1}}$ ($x, y$ in m).`,
    find: md`(a) Whether or not the flow is irrotational. (b) The velocity potential for this flow.`,
    steps: [
      {
        title: '(a) Laplace test — as Fox begins',
        md: md`If the flow is irrotational, $\nabla^2\psi = 0$. Here $\nabla^2\psi = \dfrac{\partial^2}{\partial x^2}(ax^2 - ay^2) + \dfrac{\partial^2}{\partial y^2}(ax^2 - ay^2) = 2a - 2a = 0$, so the flow **is irrotational**. (The excerpt ends here, at the foot of p. 224; the remaining steps are written for this platform.)`,
      },
      {
        title: 'Velocities',
        md: md`$u = \pd{\psi}{y} = -2ay = -6y$, $\quad v = -\pd{\psi}{x} = -2ax = -6x$ (m/s). Cross-check: $\pd{v}{x} - \pd{u}{y} = -2a - (-2a) = 0$ ✓.`,
      },
      {
        title: '(b) Integrate — course convention',
        md: md`$\pd{\phi}{x} = u = -2ay \Rightarrow \phi = -2axy + f(y)$; $\ \pd{\phi}{y} = -2ax + f'(y)$ must equal $v = -2ax$, so $f' = 0$.`,
      },
      { title: 'Result', md: md`$\phi = -2axy + C = -6xy + C$ (m²/s), with $\vb V = +\nabla\phi$.` },
      {
        title: "In Fox's convention",
        md: md`With $u = -\pd{\phi}{x}$, $v = -\pd{\phi}{y}$ (Eq. 6.29) the same steps give $\phi = +2axy + C = 6xy + C$ — the form you obtain working in the book's convention.`,
      },
    ],
    answer: md`(a) Irrotational ($\nabla^2\psi = 0$). (b) $\phi = -6xy + C$ m²/s (course); $\phi = 6xy + C$ in Fox's $\vec V = -\nabla\phi$ convention.`,
    insight: 'Streamlines x² − y² = const and equipotentials xy = const are the same family of hyperbolas rotated by 45° — mutually orthogonal.',
  },
  {
    id: 'ex-find-phi2psi',
    concept: 'finding-phi-psi',
    title: 'The reverse direction: ψ from φ for a shifted stagnation flow',
    difficulty: 2,
    given: md`$\phi = 4x + 3(x^2 - y^2)$ m²/s, with $x, y$ in m.`,
    find: md`(a) Check that $\psi$ exists and find it. (b) The stagnation point. (c) The flow rate per unit depth between the stagnation streamline and the streamline through $(0, 1)$ m.`,
    steps: [
      { title: 'Velocities', md: md`$u = \pd{\phi}{x} = 4 + 6x, \qquad v = \pd{\phi}{y} = -6y$ (m/s)` },
      { title: 'Does ψ exist?', md: md`$\nabla^2\phi = 6 - 6 = 0$ → incompressible, so $\psi$ exists.` },
      { title: 'Integrate the u-relation in y', md: md`$\pd{\psi}{y} = u = 4 + 6x \;\Rightarrow\; \psi = 4y + 6xy + g(x)$` },
      { title: 'Match the v-relation', md: md`$-\pd{\psi}{x} = -6y - g'(x)$ must equal $v = -6y$, so $g' = 0$: $\psi = 4y + 6xy + C$; take $C = 0$.` },
      {
        title: 'Stagnation point',
        md: md`$u = 0 \Rightarrow x = -\tfrac23$ m and $v = 0 \Rightarrow y = 0$: stagnation point $(-0.667, 0)$ m, where $\psi = 0$. The streamline $\psi = 0$ is $y(4 + 6x) = 0$ — the $x$-axis and the line $x = -\tfrac23$ m. Fluid descends onto the $x$-axis (which can be a wall) and splits there: the uniform stream has shifted the stagnation point of the corner flow $3(x^2 - y^2)$ from the origin to $x = -\tfrac23$ m.`,
      },
      { title: 'Flow rate', md: md`$q = \psi(0, 1) - \psi_{\text{stag}} = 4(1) + 6(0)(1) - 0 = 4$ m²/s per metre of depth.` },
    ],
    answer: md`$\psi = 4y + 6xy + C$; stagnation point $(-\tfrac23, 0)$ m; $q = 4$ m²/s per unit depth.`,
    insight: 'For φ → ψ, integrate u with respect to y and use the minus-signed v-relation to fix g(x).',
  },
]

/* -------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  /* ---- concept 1 */
  {
    id: 'pr-vp-uniform',
    concept: 'velocity-potential',
    difficulty: 1,
    q: md`Lecture 10, slide 6 illustrates uniform flow $u = U$ (constant), $v = 0$, $w = 0$. Take $U = 5$ m/s. (a) Show it is irrotational. (b) Find its velocity potential. (c) What is the change in $\phi$ from the plane $x = 0$ to the plane $x = 3$ m? (d) What would it be in Fox's convention?`,
    hint: 'All velocity gradients are zero. Integrate ∂φ/∂x = U and fix the function of y and z.',
    answer: md`(a) all cross-derivatives are zero; (b) $\phi = 5x + C$; (c) $\Delta\phi = +15$ m²/s; (d) $-15$ m²/s.`,
    solution: md`(a) Every velocity gradient is zero, so the three conditions $\pd{v}{x} = \pd{u}{y}$, $\pd{w}{y} = \pd{v}{z}$, $\pd{u}{z} = \pd{w}{x}$ all read $0 = 0$: irrotational.

(b) $\pd{\phi}{x} = U \Rightarrow \phi = Ux + f(y, z)$; $\pd{f}{y} = v = 0$ and $\pd{f}{z} = w = 0$, so $f$ is a constant: $\phi = Ux + C = 5x + C$ m²/s. Equipotentials are the planes $x$ = const.

(c) $\phi(3) - \phi(0) = 5(3) = 15$ m²/s — $\phi$ increases in the flow direction.

(d) Fox's $\vec V = -\nabla\phi$ gives $\phi = -Ux + C$, so the change is $-15$ m²/s: his $\phi$ decreases along the flow.`,
    check: [
      { label: 'Δφ, course', value: 15, units: 'm²/s' },
      { label: 'Δφ, Fox', value: -15, units: 'm²/s' },
    ],
  },
  {
    id: 'pr-vp-which',
    concept: 'velocity-potential',
    difficulty: 2,
    q: md`Which of these plane velocity fields (m/s, $x, y$ in m) possess a velocity potential? Find $\phi$ where it exists. (a) $u = 3x^2 - 3y^2$, $v = -6xy$; (b) $u = y$, $v = -x$; (c) $u = x + y$, $v = x - y$. Report $\omega_z$ for (b) and $\phi(2, 1)$ for (c), taking $\phi(0, 0) = 0$.`,
    hint: 'Compare ∂v/∂x with ∂u/∂y for each field before integrating.',
    answer: md`(a) yes, $\phi = x^3 - 3xy^2$; (b) no, $\omega_z = -1\ \mathrm{s^{-1}}$; (c) yes, $\phi = \tfrac12x^2 + xy - \tfrac12y^2$, $\phi(2, 1) = 3.5$ m²/s.`,
    solution: md`**(a)** $\pd{v}{x} = -6y = \pd{u}{y}$ → irrotational. $\pd{\phi}{x} = 3x^2 - 3y^2 \Rightarrow \phi = x^3 - 3xy^2 + f(y)$; $\pd{\phi}{y} = -6xy + f' = v = -6xy \Rightarrow f' = 0$. So $\phi = x^3 - 3xy^2 + C$.

**(b)** $\pd{v}{x} = -1$ but $\pd{u}{y} = +1$: $\omega_z = \tfrac12(-1 - 1) = -1\ \mathrm{s^{-1}}$ (clockwise rigid rotation). No potential.

**(c)** $\pd{v}{x} = 1 = \pd{u}{y}$ → irrotational. $\pd{\phi}{x} = x + y \Rightarrow \phi = \tfrac12x^2 + xy + f(y)$; $\pd{\phi}{y} = x + f' = x - y \Rightarrow f' = -y$, $f = -\tfrac12y^2$. So $\phi = \tfrac12x^2 + xy - \tfrac12y^2$ and $\phi(2, 1) = 2 + 2 - 0.5 = 3.5$ m²/s.`,
    check: [
      { label: 'ω_z for (b)', value: -1, units: 's⁻¹' },
      { label: 'φ(2, 1) for (c)', value: 3.5, units: 'm²/s' },
    ],
  },
  {
    id: 'pr-vp-cyl',
    concept: 'velocity-potential',
    difficulty: 2,
    q: md`A plane flow has $\phi = U\left(r + \dfrac{a^2}{r}\right)\cos\theta$ with $U = 2$ m/s and $a = 1$ m (flow past a circular cylinder, met again in Unit B). (a) Find $v_r$ and $v_\theta$. (b) Show that no fluid crosses the circle $r = a$. (c) Evaluate $v_\theta$ at $r = 2$ m, $\theta = 90^\circ$.`,
    hint: 'v_r = ∂φ/∂r and v_θ = (1/r)∂φ/∂θ.',
    answer: md`$v_r = U(1 - a^2/r^2)\cos\theta$, $v_\theta = -U(1 + a^2/r^2)\sin\theta$; $v_r = 0$ on $r = a$; $v_\theta = -2.50$ m/s.`,
    solution: md`(a) $v_r = \pd{\phi}{r} = U\left(1 - \dfrac{a^2}{r^2}\right)\cos\theta$ and $v_\theta = \dfrac1r\pd{\phi}{\theta} = -\dfrac{U}{r}\left(r + \dfrac{a^2}{r}\right)\sin\theta = -U\left(1 + \dfrac{a^2}{r^2}\right)\sin\theta$.

(b) At $r = a$, $1 - a^2/r^2 = 0$, so $v_r = 0$ for every $\theta$: the circle is a streamline and can be replaced by a solid cylinder.

(c) At $r = 2$ m, $\theta = 90^\circ$: $v_r = 0$ and $v_\theta = -2(1 + 0.25)(1) = -2.50$ m/s. Directly above the cylinder ($\theta = 90^\circ$) $\hat{\vb e}_\theta$ points in $-x$, so the fluid moves in $+x$ at 2.50 m/s — faster than the 2 m/s free stream.`,
    check: [{ label: 'v_θ', value: -2.5, units: 'm/s' }],
  },
  {
    id: 'pr-vp-fox',
    concept: 'velocity-potential',
    difficulty: 1,
    q: md`A textbook using Fox's convention ($\vec V = -\nabla\phi$) gives $\phi = 3xy$ m²/s ($x, y$ in m). (a) Find $u$, $v$ and the speed at $(1, 2)$ m. (b) Write the potential of the same flow in this course's convention.`,
    hint: 'In Fox, u = −∂φ/∂x and v = −∂φ/∂y.',
    answer: md`$u = -6$ m/s, $v = -3$ m/s, $|\vb V| = 6.71$ m/s; course potential $\phi = -3xy + C$.`,
    solution: md`(a) $u = -\pd{\phi}{x} = -3y = -6$ m/s and $v = -\pd{\phi}{y} = -3x = -3$ m/s, so $|\vb V| = \sqrt{36 + 9} = \sqrt{45} = 6.71$ m/s.

(b) The course needs $\pd{\phi}{x} = u = -3y$ and $\pd{\phi}{y} = v = -3x$, so $\phi = -3xy + C$ — simply the negative of Fox's potential.`,
    check: [
      { label: 'u', value: -6, units: 'm/s' },
      { label: '|V|', value: 6.708, units: 'm/s' },
    ],
  },

  /* ---- concept 2 */
  {
    id: 'pr-pp-classify',
    concept: 'phi-vs-psi',
    difficulty: 2,
    q: md`For each plane flow (m/s, $x, y$ in m) decide whether a stream function, a velocity potential, both or neither exist: (a) $u = x,\ v = -y$; (b) $u = x,\ v = y$; (c) $u = -y,\ v = x$; (d) $u = y,\ v = 0$. Report $\nabla\cdot\vb V$ for (b) and $\omega_z$ for (c) and (d).`,
    hint: 'ψ needs ∇·V = 0; φ needs ω_z = 0.',
    answer: md`(a) both; (b) φ only, $\nabla\cdot\vb V = 2\ \mathrm{s^{-1}}$; (c) ψ only, $\omega_z = 1\ \mathrm{s^{-1}}$; (d) ψ only, $\omega_z = -0.5\ \mathrm{s^{-1}}$.`,
    solution: md`Use $\nabla\cdot\vb V = \pd{u}{x} + \pd{v}{y}$ (ψ needs zero) and $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right)$ (φ needs zero).

| field | $\nabla\cdot\vb V$ | $\omega_z$ | ψ | φ |
|---|---|---|---|---|
| (a) $u = x,\ v = -y$ | $1 - 1 = 0$ | $0$ | $xy$ | $\tfrac12(x^2 - y^2)$ |
| (b) $u = x,\ v = y$ | $2$ | $0$ | none | $\tfrac12(x^2 + y^2)$ |
| (c) $u = -y,\ v = x$ | $0$ | $\tfrac12(1 + 1) = 1$ | $-\tfrac12(x^2 + y^2)$ | none |
| (d) $u = y,\ v = 0$ | $0$ | $\tfrac12(0 - 1) = -0.5$ | $\tfrac12y^2$ | none |

Only (a), a stagnation-point flow, is a plane potential flow with both functions.`,
    check: [
      { label: '∇·V for (b)', value: 2, units: 's⁻¹' },
      { label: 'ω_z for (c)', value: 1, units: 's⁻¹' },
      { label: 'ω_z for (d)', value: -0.5, units: 's⁻¹' },
    ],
  },
  {
    id: 'pr-pp-table',
    concept: 'phi-vs-psi',
    difficulty: 2,
    q: md`A plane incompressible flow has $\psi = 3x^2y - y^3 + 2x^2$ (m²/s). Use Table 6.1 to decide whether a velocity potential exists, and find the particle rotation rate $\omega_z$.`,
    hint: 'Compute ∇²ψ, then use ∂v/∂x − ∂u/∂y = −∇²ψ.',
    answer: md`$\nabla^2\psi = 4\ \mathrm{s^{-1}} \ne 0$ → rotational, no φ; $\omega_z = -2\ \mathrm{s^{-1}}$.`,
    solution: md`$\frac{\partial^2\psi}{\partial x^2} = 6y + 4$ and $\frac{\partial^2\psi}{\partial y^2} = -6y$, so $\nabla^2\psi = 4 \ne 0$. By Table 6.1, ψ obeys Laplace's equation only if the flow is irrotational — so this flow is rotational and **no velocity potential exists**.

Quantitatively, $\pd{v}{x} - \pd{u}{y} = -\nabla^2\psi = -4\ \mathrm{s^{-1}}$, so $\omega_z = \tfrac12(-4) = -2\ \mathrm{s^{-1}}$ (clockwise). The cubic part $3x^2y - y^3$ is harmonic on its own; the $2x^2$ term supplies all the rotation.`,
    check: [{ label: 'ω_z', value: -2, units: 's⁻¹' }],
  },
  {
    id: 'pr-pp-orth',
    concept: 'phi-vs-psi',
    difficulty: 1,
    q: md`For Fox's Example 6.10 field, $\psi = 3x^2 - 3y^2$ (with $\phi = -6xy$ in the course convention), find the slopes of the streamline and of the equipotential through $(1, 2)$ m and show that they are perpendicular.`,
    hint: 'Eq. (6.34): (dy/dx)_ψ = v/u. Eq. (6.35): (dy/dx)_φ = −u/v.',
    answer: md`$(dy/dx)_\psi = 0.5$, $(dy/dx)_\phi = -2$; product $= -1$.`,
    solution: md`$u = \pd{\psi}{y} = -6y = -12$ m/s and $v = -\pd{\psi}{x} = -6x = -6$ m/s. Streamline slope (6.34): $v/u = (-6)/(-12) = 0.5$. Equipotential slope (6.35): $-u/v = -(-12)/(-6) = -2$. Product: $0.5 \times (-2) = -1$, so the curves are perpendicular. Direct check from $\phi = -6xy$: $d\phi = -6y\,dx - 6x\,dy = 0 \Rightarrow dy/dx = -y/x = -2$ ✓.`,
    check: [
      { label: 'streamline slope', value: 0.5 },
      { label: 'equipotential slope', value: -2 },
    ],
  },

  /* ---- concept 3 */
  {
    id: 'pr-lap-k',
    concept: 'laplace',
    difficulty: 2,
    q: md`$\phi = Ax^3 + Bxy^2$ is proposed as the velocity potential of a plane incompressible flow. (a) What ratio $B/A$ is required? (b) With $A = 1\ \mathrm{m^{-1}s^{-1}}$, find the speed at $(1, 1)$ m.`,
    hint: 'Set ∇²φ = 0 for every x.',
    answer: md`$B/A = -3$; $|\vb V| = 6$ m/s.`,
    solution: md`(a) $\frac{\partial^2\phi}{\partial x^2} = 6Ax$ and $\frac{\partial^2\phi}{\partial y^2} = 2Bx$, so $\nabla^2\phi = (6A + 2B)x = 0$ for all $x$ requires $B = -3A$.

(b) $\phi = x^3 - 3xy^2$: $u = \pd{\phi}{x} = 3x^2 - 3y^2 = 0$ and $v = \pd{\phi}{y} = -6xy = -6$ m/s at $(1, 1)$, so $|\vb V| = 6$ m/s, pointing in $-y$.`,
    check: [
      { label: 'B/A', value: -3 },
      { label: '|V|', value: 6, units: 'm/s' },
    ],
  },
  {
    id: 'pr-lap-cyl',
    concept: 'laplace',
    difficulty: 2,
    q: md`Use the cylindrical form of Laplace's equation (Lecture 10, slide 8) to show that (a) $\phi = K\theta$ and (b) $\phi = \dfrac{m}{2\pi}\ln r$ are possible plane potential flows. (c) For $\phi = K\theta$ with $K = 2$ m²/s, find $v_\theta$ at $r = 0.5$ m.`,
    hint: 'Work out r ∂φ/∂r and ∂²φ/∂θ² for each.',
    answer: md`Both satisfy Laplace's equation for $r > 0$; $v_\theta = K/r = 4$ m/s.`,
    solution: md`(a) $\pd{\phi}{r} = 0$ and $\frac{\partial^2\phi}{\partial\theta^2} = 0$, so every term vanishes: $\nabla^2\phi = 0$.

(b) $r\pd{\phi}{r} = \dfrac{m}{2\pi}$, a constant, so $\frac1r\pd{}{r}\left(r\pd{\phi}{r}\right) = 0$; there is no $\theta$- or $z$-dependence, hence $\nabla^2\phi = 0$ for $r > 0$.

(c) $v_r = \pd{\phi}{r} = 0$ and $v_\theta = \frac1r\pd{\phi}{\theta} = \frac{K}{r} = \frac{2}{0.5} = 4$ m/s. (These are the free vortex and the source of Unit B; the origin is a singular point excluded from the flow.)`,
    check: [{ label: 'v_θ', value: 4, units: 'm/s' }],
  },
  {
    id: 'pr-lap-3d',
    concept: 'laplace',
    difficulty: 2,
    q: md`Is $\phi = 2x^2 + y^2 - 3z^2$ (m²/s; $x, y, z$ in m) the potential of an incompressible flow? If so, find the velocity and the speed at $(1, 1, 1)$ m.`,
    hint: 'Add the three second derivatives.',
    answer: md`Yes, $\nabla^2\phi = 4 + 2 - 6 = 0$; $\vb V = (4, 2, -6)$ m/s, $|\vb V| = 7.48$ m/s.`,
    solution: md`$\nabla^2\phi = \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2} = 4 + 2 - 6 = 0$ ✓ — a valid three-dimensional potential flow (no single stream function could describe it). $u = 4x = 4$, $v = 2y = 2$, $w = -6z = -6$ m/s, so $|\vb V| = \sqrt{16 + 4 + 36} = \sqrt{56} = 7.48$ m/s.`,
    check: [{ label: '|V|', value: 7.483, units: 'm/s' }],
  },

  /* ---- concept 4 */
  {
    id: 'pr-find-lec11b',
    concept: 'finding-phi-psi',
    difficulty: 1,
    src: { doc: 'lec11', pages: '2', note: 'Problem 2 (first part)' },
    q: md`Lecture 11, slide 2, problem 2 (first part): the velocity potential of an inviscid flow is $\phi = 8xy$ m²/s ($x, y$ in m; the fluid is water). Determine the corresponding stream function. Then find the flow rate per unit depth between the streamlines through $(0, 0)$ and $(1, 2)$ m. (The problem's second part, a pressure difference, needs the Bernoulli equation and is not asked here.)`,
    hint: 'u = ∂φ/∂x = ∂ψ/∂y and v = ∂φ/∂y = −∂ψ/∂x.',
    answer: md`$\psi = 4(y^2 - x^2) + C$; $q = 12$ m²/s per metre of depth.`,
    solution: md`$u = \pd{\phi}{x} = 8y$ and $v = \pd{\phi}{y} = 8x$. Since $\nabla^2\phi = 0$, the flow is incompressible and ψ exists. $\pd{\psi}{y} = u = 8y \Rightarrow \psi = 4y^2 + g(x)$; $-\pd{\psi}{x} = -g'(x) = v = 8x \Rightarrow g = -4x^2$. So $\psi = 4(y^2 - x^2) + C$.

Flow rate: $q = \psi(1, 2) - \psi(0, 0) = 4(4 - 1) - 0 = 12$ m²/s per metre of depth. (Working in Fox's convention one gets $\psi = 4(x^2 - y^2)$ for $\phi = 8xy$, because his φ has the opposite sign; $|q|$ is unchanged.)`,
    check: [{ label: 'q', value: 12, units: 'm²/s' }],
  },
  {
    id: 'pr-find-cubic',
    concept: 'finding-phi-psi',
    difficulty: 2,
    q: md`Find the velocity potential for the plane flow with $\psi = x^3 - 3xy^2$ (m²/s), and evaluate $\phi(1, 1)$ taking $\phi(0, 0) = 0$.`,
    hint: 'Check ∇²ψ first; then integrate ∂φ/∂x = u in x.',
    answer: md`$\phi = y^3 - 3x^2y + C$; $\phi(1, 1) = -2$ m²/s.`,
    solution: md`$u = \pd{\psi}{y} = -6xy$ and $v = -\pd{\psi}{x} = -3x^2 + 3y^2$. Check: $\nabla^2\psi = 6x - 6x = 0$ → irrotational. $\pd{\phi}{x} = -6xy \Rightarrow \phi = -3x^2y + f(y)$; $\pd{\phi}{y} = -3x^2 + f'(y)$ must equal $-3x^2 + 3y^2$, so $f' = 3y^2$ and $f = y^3$. Hence $\phi = y^3 - 3x^2y + C$ and $\phi(1, 1) = 1 - 3 = -2$ m²/s.`,
    check: [{ label: 'φ(1, 1)', value: -2, units: 'm²/s' }],
  },
  {
    id: 'pr-find-rotational',
    concept: 'finding-phi-psi',
    difficulty: 2,
    q: md`A student is asked for the velocity potential of the flow $\psi = xy + y^2$. Carry out the integration method and explain what goes wrong. What is $\omega_z$?`,
    hint: 'Watch what f′(y) depends on.',
    answer: md`$f'(y) = -y - 2x$ depends on $x$ → no φ exists; $\omega_z = -1\ \mathrm{s^{-1}}$.`,
    solution: md`$u = \pd{\psi}{y} = x + 2y$ and $v = -\pd{\psi}{x} = -y$. Integrating, $\pd{\phi}{x} = x + 2y \Rightarrow \phi = \tfrac12x^2 + 2xy + f(y)$. Then $\pd{\phi}{y} = 2x + f'(y)$ must equal $v = -y$, giving $f'(y) = -y - 2x$ — but $f$ was supposed to depend on $y$ only. The contradiction means **no velocity potential exists**.

Indeed $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(0 - 2) = -1\ \mathrm{s^{-1}}$, consistent with $\nabla^2\psi = 2 = -2\omega_z$.`,
    check: [{ label: 'ω_z', value: -1, units: 's⁻¹' }],
  },
  {
    id: 'pr-find-fox',
    concept: 'finding-phi-psi',
    difficulty: 1,
    q: md`Redo Lecture 11's problem 1 ($\psi = 5x^2y - \tfrac53y^3$) using Fox's convention $u = -\pd{\phi}{x}$, $v = -\pd{\phi}{y}$. Evaluate the result at $(1, 1)$ with $C = 0$.`,
    hint: 'Same velocities as before; only the sign linking φ to them changes.',
    answer: md`$\phi_{\text{Fox}} = -\tfrac53x^3 + 5xy^2 + C$; $\phi_{\text{Fox}}(1, 1) = \tfrac{10}{3} \approx 3.33$.`,
    solution: md`$u = 5x^2 - 5y^2$ and $v = -10xy$ as before. $\pd{\phi}{x} = -u = -5x^2 + 5y^2 \Rightarrow \phi = -\tfrac53x^3 + 5xy^2 + f(y)$; $\pd{\phi}{y} = 10xy + f'(y)$ must equal $-v = 10xy$, so $f' = 0$. Hence $\phi_{\text{Fox}} = -\tfrac53x^3 + 5xy^2 + C$ — exactly $-1$ times the course answer — and $\phi_{\text{Fox}}(1, 1) = -\tfrac53 + 5 = \tfrac{10}{3} \approx 3.33$.`,
    check: [{ label: 'φ_Fox(1, 1)', value: 3.333 }],
  },
  {
    id: 'pr-find-polar',
    concept: 'finding-phi-psi',
    difficulty: 3,
    q: md`In polar coordinates the two definitions give $v_r = \pd{\phi}{r} = \dfrac1r\pd{\psi}{\theta}$ and $v_\theta = \dfrac1r\pd{\phi}{\theta} = -\pd{\psi}{r}$. Find $\phi$ for $\psi = U\left(r - \dfrac{a^2}{r}\right)\sin\theta$, and evaluate it at $r = 2$ m, $\theta = 0$ for $U = 2$ m/s, $a = 1$ m (with $C = 0$).`,
    hint: 'Integrate ∂φ/∂r = v_r in r, adding f(θ).',
    answer: md`$\phi = U\left(r + \dfrac{a^2}{r}\right)\cos\theta + C$; $\phi = 5$ m²/s.`,
    solution: md`$v_r = \frac1r\pd{\psi}{\theta} = U\left(1 - \frac{a^2}{r^2}\right)\cos\theta$. Integrating $\pd{\phi}{r} = v_r$ in $r$: $\phi = U\left(r + \frac{a^2}{r}\right)\cos\theta + f(\theta)$. Then $\frac1r\pd{\phi}{\theta} = -U\left(1 + \frac{a^2}{r^2}\right)\sin\theta + \frac{f'(\theta)}{r}$ must equal $v_\theta = -\pd{\psi}{r} = -U\left(1 + \frac{a^2}{r^2}\right)\sin\theta$, so $f' = 0$.

Result: $\phi = U\left(r + \frac{a^2}{r}\right)\cos\theta + C$ — the cylinder potential of the earlier practice problem. At $r = 2$ m, $\theta = 0$: $\phi = 2(2 + 0.5)(1) = 5$ m²/s.`,
    check: [{ label: 'φ', value: 5, units: 'm²/s' }],
  },
]

/* -------------------------------------------------------------------------------------------- quiz */

export const quiz: QuizQ[] = [
  /* ---- concept 1 */
  {
    id: 'q-vp-comp',
    concept: 'velocity-potential',
    difficulty: 1,
    src: L6,
    q: md`In this course's convention, how is the $y$-component of velocity obtained from the velocity potential?`,
    options: [md`$v = \pd{\phi}{y}$`, md`$v = -\pd{\phi}{x}$`, md`$v = \pd{\phi}{x}$`, md`$v = -\pd{\phi}{y}$`],
    answer: 0,
    explain: md`Lecture 10, slide 6 boxes $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$, $w = \pd{\phi}{z}$: each component is the derivative along its own direction, with no minus sign. $v = -\pd{\phi}{y}$ is Fox's convention, and the "crossed" rule with a minus belongs to the stream function ($v = -\pd{\psi}{x}$).`,
  },
  {
    id: 'q-vp-why',
    concept: 'velocity-potential',
    difficulty: 2,
    src: F222,
    q: md`Why is a velocity field of the form $\vb V = \nabla\phi$ automatically irrotational?`,
    options: [
      'Because the curl of a gradient is identically zero — the mixed second derivatives of φ are equal',
      "Because φ satisfies Laplace's equation",
      'Because the flow is assumed to be inviscid',
      'Because the stream function satisfies continuity',
    ],
    answer: 0,
    explain: md`$\nabla\times\nabla\phi \equiv 0$ (Fox Eq. 6.28): e.g. $\pd{v}{x} - \pd{u}{y} = \phi_{yx} - \phi_{xy} = 0$ for any smooth $\phi$. Laplace's equation is a separate, extra condition — it expresses incompressibility, not irrotationality. Inviscid flow is a physical reason particles may stay irrotational, not the mathematical reason a gradient has no curl.`,
  },
  {
    id: 'q-vp-cyl',
    concept: 'velocity-potential',
    difficulty: 2,
    src: L8,
    q: md`In cylindrical coordinates (Lecture 10, slide 8), which velocity component derived from $\phi$ carries a factor $1/r$?`,
    options: [md`$v_\theta = \dfrac1r\pd{\phi}{\theta}$`, md`$v_r = \dfrac1r\pd{\phi}{r}$`, md`$v_z = \dfrac1r\pd{\phi}{z}$`, md`$v_r = \dfrac1r\pd{\phi}{\theta}$`],
    answer: 0,
    explain: md`The cylindrical gradient is $\pd{}{r}\hat{\vb e}_r + \frac1r\pd{}{\theta}\hat{\vb e}_\theta + \pd{}{z}\hat{\vb e}_z$ — the $1/r$ turns an angle derivative into a derivative per metre of arc. "$v_r = \frac1r\partial(\,)/\partial\theta$" is the *stream-function* rule (slide 2), a frequent mix-up.`,
  },
  {
    id: 'q-vp-exist',
    concept: 'velocity-potential',
    difficulty: 1,
    src: F222,
    q: 'A velocity potential exists only if the flow is …',
    options: ['irrotational', 'incompressible', 'two-dimensional', 'steady'],
    answer: 0,
    explain: md`Because $\nabla\times\nabla\phi \equiv 0$, a flow described by a potential must have zero curl — and irrotationality is all that is required (Fox p. 222). φ can be defined for 3-D, unsteady and even compressible flows; incompressibility is what makes φ satisfy Laplace's equation, not what makes it exist.`,
  },
  {
    id: 'q-vp-fox',
    concept: 'velocity-potential',
    difficulty: 2,
    src: F222,
    q: md`A flow has $\phi = 2xy$ in this course's convention ($\vb V = \nabla\phi$). Which potential does Fox's convention ($\vec V = -\nabla\phi$, Eq. 6.27) assign to the same flow?`,
    options: [md`$\phi = -2xy$`, md`$\phi = 2xy$`, md`$\phi = x^2 - y^2$`, md`$\phi = y^2 - x^2$`],
    answer: 0,
    explain: md`The velocity must not change: $u = \partial(2xy)/\partial x = 2y$ requires Fox's $-\pd{\phi}{x} = 2y$, i.e. $\phi_{\text{Fox}} = -2xy$. Keeping $2xy$ would reverse the flow. $y^2 - x^2$ is this flow's *stream function* (and $x^2 - y^2$ its negative), not its potential.`,
  },

  /* ---- concept 2 */
  {
    id: 'q-pp-origin',
    concept: 'phi-vs-psi',
    difficulty: 1,
    src: L7,
    q: 'Which pairing is correct?',
    options: [
      'φ follows from irrotationality; ψ follows from conservation of mass',
      'φ follows from conservation of mass; ψ follows from irrotationality',
      'φ follows from conservation of momentum; ψ follows from conservation of mass',
      'φ follows from incompressibility; ψ follows from the no-slip condition',
    ],
    answer: 0,
    explain: md`Lecture 10, slide 7: the velocity potential is a consequence of the **irrotationality** of the flow field, the stream function a consequence of **conservation of mass**. Swapping them is the classic slip — φ guarantees zero curl, ψ guarantees zero divergence.`,
  },
  {
    id: 'q-pp-3d',
    concept: 'phi-vs-psi',
    difficulty: 1,
    src: L7,
    q: 'Which of these can describe a general three-dimensional flow?',
    options: [
      'A velocity potential, provided the flow is irrotational',
      'A single stream function, provided the flow is incompressible',
      'A single stream function, provided the flow is steady',
      'A velocity potential, provided the flow is two-dimensional',
    ],
    answer: 0,
    explain: md`Slide 7: a velocity potential can be defined for a general 3-D flow, whereas a single stream function is restricted to 2-D flows (slide 2 allows extensions only to axisymmetric and 2-D compressible flows). The gradient of one scalar has three components automatically; one ψ can only "pair up" two continuity terms.`,
  },
  {
    id: 'q-pp-table',
    concept: 'phi-vs-psi',
    difficulty: 2,
    src: F224,
    q: "According to Fox's Table 6.1, the stream function satisfies Laplace's equation …",
    options: ['only if the flow is irrotational', 'only if the flow is incompressible', 'always', 'only if the flow is steady'],
    answer: 0,
    explain: md`ψ satisfies continuity **always**, by construction; putting it into the irrotationality condition gives $-\nabla^2\psi = 0$, so it obeys Laplace only if the flow is irrotational. "Only if incompressible" is the φ row: φ is always irrotational and obeys Laplace only if the flow is incompressible.`,
  },
  {
    id: 'q-pp-tf',
    concept: 'phi-vs-psi',
    difficulty: 2,
    src: F223,
    q: 'True or false: every incompressible plane flow has both a stream function and a velocity potential.',
    options: ['True', 'False'],
    answer: 1,
    explain: md`False. Incompressibility guarantees ψ only; φ also needs irrotationality. The rigid rotation $u = -\Omega y$, $v = \Omega x$ has $\psi = -\tfrac{\Omega}{2}(x^2 + y^2)$ but no φ. Both functions exist together only for plane flow that is incompressible **and** irrotational (Fox p. 223).`,
  },

  /* ---- concept 3 */
  {
    id: 'q-lap-cond',
    concept: 'laplace',
    difficulty: 1,
    src: L7,
    q: md`$\nabla^2\phi = 0$ follows from combining which two conditions?`,
    options: [
      md`Incompressibility ($\nabla\cdot\vb V = 0$) and irrotationality ($\vb V = \nabla\phi$)`,
      'Inviscid flow and steady flow',
      'Irrotationality and steady flow',
      'Incompressibility and inviscid flow',
    ],
    answer: 0,
    explain: md`Slide 7: incompressible continuity $\nabla\cdot\vb V = 0$ with the irrotational $\vb V = \nabla\phi$ gives $\nabla\cdot\nabla\phi = \nabla^2\phi = 0$. Viscosity and steadiness do not enter this kinematic result; "inviscid" appears only in the slide's description of which physical flows are potential flows.`,
  },
  {
    id: 'q-lap-pot',
    concept: 'laplace',
    difficulty: 1,
    src: L7,
    q: 'On Lecture 10, slide 7, "potential flow" refers to flow fields that are …',
    options: ['inviscid, incompressible and irrotational', 'viscous, incompressible and irrotational', 'inviscid, compressible and rotational', 'steady, two-dimensional and incompressible'],
    answer: 0,
    explain: md`The slide states that inviscid, incompressible, irrotational flow fields are governed by Laplace's equation and names them potential flow. Viscous effects generally create vorticity, and a rotational flow has no φ at all; steadiness and two-dimensionality are not required.`,
  },
  {
    id: 'q-lap-cyl',
    concept: 'laplace',
    difficulty: 2,
    src: L8,
    q: "Which is Laplace's equation in cylindrical coordinates (Lecture 10, slide 8)?",
    options: [
      md`$\dfrac1r\pd{}{r}\left(r\pd{\phi}{r}\right) + \dfrac{1}{r^2}\dfrac{\partial^2\phi}{\partial\theta^2} + \dfrac{\partial^2\phi}{\partial z^2} = 0$`,
      md`$\dfrac{\partial^2\phi}{\partial r^2} + \dfrac{\partial^2\phi}{\partial\theta^2} + \dfrac{\partial^2\phi}{\partial z^2} = 0$`,
      md`$\dfrac1r\pd{}{r}\left(r\pd{\phi}{r}\right) + \dfrac1r\dfrac{\partial^2\phi}{\partial\theta^2} + \dfrac{\partial^2\phi}{\partial z^2} = 0$`,
      md`$\pd{}{r}\left(r\pd{\phi}{r}\right) + \dfrac{\partial^2\phi}{\partial\theta^2} + \dfrac{\partial^2\phi}{\partial z^2} = 0$`,
    ],
    answer: 0,
    explain: md`The θ-term needs $1/r^2$ (an angle derivative taken twice, each divided by $r$), and the radial term is $\frac1r\pd{}{r}\left(r\pd{\phi}{r}\right)$, not just $\frac{\partial^2\phi}{\partial r^2}$. Test with uniform flow $\phi = r\cos\theta$ $(= x)$: only the first form gives $\frac{\cos\theta}{r} - \frac{\cos\theta}{r} = 0$.`,
  },
  {
    id: 'q-lap-wiring',
    concept: 'laplace',
    difficulty: 2,
    src: F223,
    q: md`Fox obtains $\nabla^2\psi = 0$ (Eq. 6.31) by substituting the definition of ψ into which equation?`,
    options: [
      md`The irrotationality condition $\pd{v}{x} - \pd{u}{y} = 0$ (Eq. 6.23)`,
      md`The continuity equation $\pd{u}{x} + \pd{v}{y} = 0$ (Eq. 5.3)`,
      'The Bernoulli equation',
      "Euler's equation of motion",
    ],
    answer: 0,
    explain: md`ψ satisfies continuity identically, so substituting it there gives $0 = 0$ — no information. Putting ψ into the irrotationality condition gives Eq. 6.31. For φ it is the other way round: φ in continuity (5.3) gives Eq. 6.32.`,
  },
  {
    id: 'q-lap-tf',
    concept: 'laplace',
    difficulty: 1,
    src: F223,
    q: "True or false: any function φ that satisfies Laplace's equation represents a possible two-dimensional, incompressible, irrotational flow field.",
    options: ['True', 'False'],
    answer: 0,
    explain: md`True (Fox p. 223), in any region free of singular points. Any φ gives an irrotational velocity; Laplace's equation then makes that velocity divergence-free. This is why harmonic functions are the raw material of potential-flow theory.`,
  },

  /* ---- concept 4 */
  {
    id: 'q-find-first',
    concept: 'finding-phi-psi',
    difficulty: 1,
    q: md`To find $\phi$ from a given $\psi$ (course convention), a good first integration is …`,
    options: [
      md`$\pd{\phi}{x} = \pd{\psi}{y}$, integrated with respect to $x$, plus an unknown $f(y)$`,
      md`$\pd{\phi}{x} = -\pd{\psi}{y}$, integrated with respect to $x$, plus a constant`,
      md`$\phi = \int\psi\,dx$`,
      md`$\pd{\phi}{x} = \pd{\psi}{x}$, integrated with respect to $x$, plus an unknown $f(y)$`,
    ],
    answer: 0,
    explain: md`Both functions give the same $u$: $\pd{\phi}{x} = u = \pd{\psi}{y}$. A partial integration in $x$ leaves an unknown *function of y* (not just a constant), which the $v$-relation $\pd{\phi}{y} = -\pd{\psi}{x}$ then fixes. The minus-signed version is Fox's convention; integrating ψ itself has no meaning.`,
  },
  {
    id: 'q-find-fail',
    concept: 'finding-phi-psi',
    difficulty: 2,
    q: md`While finding $\phi$ from $\psi$ you obtain $f'(y) = 2x$. What does this tell you?`,
    options: [
      'The flow is rotational, so no velocity potential exists',
      'Set f(y) = 2xy and carry on',
      'The flow is compressible, so no stream function exists',
      'f(y) is simply the constant 2x',
    ],
    answer: 0,
    explain: md`$f$ was introduced as a function of $y$ only, so an $x$ in $f'(y)$ is a contradiction — it appears exactly when $\pd{v}{x} \ne \pd{u}{y}$, a rotational flow (e.g. $u = 2y$, $v = 4x$). Setting $f = 2xy$ would change $\pd{\phi}{x}$ and break the first relation. Compressibility shows up in the opposite direction (φ → ψ).`,
  },
  {
    id: 'q-find-const',
    concept: 'finding-phi-psi',
    difficulty: 1,
    q: md`The constant $C$ in Lecture 11's answer $\phi = \tfrac53x^3 - 5xy^2 + C$ …`,
    options: [
      'has no physical meaning: adding a constant to φ leaves every velocity unchanged',
      'equals the pressure at the origin',
      'equals the flow rate between two streamlines',
      'must be found from a boundary condition before any velocity can be computed',
    ],
    answer: 0,
    explain: md`Velocities are derivatives of φ, so a constant drops out; only differences of φ matter (just as only differences of ψ give flow rates). It is usually set to zero. Flow rates come from ψ, and pressures need the Bernoulli equation.`,
  },
  {
    id: 'q-find-cr',
    concept: 'finding-phi-psi',
    difficulty: 2,
    src: L12S3,
    q: 'In plane potential flow (course convention), which pair of relations links φ and ψ?',
    options: [
      md`$\pd{\phi}{x} = \pd{\psi}{y}$ and $\pd{\phi}{y} = -\pd{\psi}{x}$`,
      md`$\pd{\phi}{x} = -\pd{\psi}{y}$ and $\pd{\phi}{y} = \pd{\psi}{x}$`,
      md`$\pd{\phi}{x} = \pd{\psi}{x}$ and $\pd{\phi}{y} = \pd{\psi}{y}$`,
      md`$\pd{\phi}{x} = \pd{\psi}{y}$ and $\pd{\phi}{y} = \pd{\psi}{x}$`,
    ],
    answer: 0,
    explain: md`Lecture 12, slide 3 lists $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$ and $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$; equating gives the first pair. The second pair is what Fox's $\vec V = -\nabla\phi$ produces — right in his book, wrong in this course. Without the minus sign (last option) the two families would not even be orthogonal.`,
  },
]

/* -------------------------------------------------------------------------------------------- flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-vp-def',
    front: 'Velocity potential: definition and existence condition?',
    back: md`$u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$, $w = \pd{\phi}{z}$, i.e. $\vb V = \nabla\phi$ (Lecture 10, slide 6). Exists if and only if the flow is irrotational ($\nabla\times\vb V = 0$); works in 3-D and in unsteady flow. Units m²/s.`,
    src: L6,
  },
  {
    id: 'fc-vp-curl',
    front: 'Why does V = ∇φ guarantee irrotationality?',
    back: md`The curl of a gradient vanishes identically, $\nabla\times\nabla\phi \equiv 0$ (Fox Eq. 6.28): e.g. $\pd{v}{x} - \pd{u}{y} = \phi_{yx} - \phi_{xy} = 0$ because mixed partial derivatives are equal.`,
    src: F222,
  },
  {
    id: 'fc-vp-cyl',
    front: 'Velocity from φ in cylindrical coordinates?',
    back: md`$v_r = \pd{\phi}{r}$, $\ v_\theta = \dfrac1r\pd{\phi}{\theta}$, $\ v_z = \pd{\phi}{z}$ (Lecture 10, slide 8). For φ the $1/r$ is on $v_\theta$; for ψ it is on $v_r$.`,
    src: L8,
  },
  {
    id: 'fc-vp-fox',
    front: "Fox's sign convention for φ?",
    back: md`$\vec V = -\nabla\phi$ (Eq. 6.27), so $u = -\pd{\phi}{x}$ etc.: φ decreases along the flow, like temperature along a heat flow. For the same flow $\phi_{\text{Fox}} = -\phi_{\text{course}}$.`,
    src: F222,
  },
  {
    id: 'fc-pp-origin',
    front: 'φ vs ψ — where does each come from, and in how many dimensions does it work?',
    back: md`φ ← irrotationality; definable for general 3-D flow. ψ ← conservation of mass; a single ψ only for 2-D flow (Lecture 10, slide 7).`,
    src: L7,
  },
  {
    id: 'fc-pp-table',
    front: 'Fox Table 6.1 in two lines?',
    back: md`ψ always satisfies continuity; $\nabla^2\psi = 0$ only if irrotational. φ always satisfies irrotationality; $\nabla^2\phi = 0$ only if incompressible.`,
    src: F224,
  },
  {
    id: 'fc-pp-measure',
    front: 'What do ∇²ψ and ∇²φ measure when they are not zero?',
    back: md`$\nabla^2\psi = -2\omega_z$ (particle rotation); $\nabla^2\phi = \nabla\cdot\vb V$ (rate of volume dilatation, course signs).`,
  },
  {
    id: 'fc-lap-derive',
    front: "Derive Laplace's equation for φ in one line.",
    back: md`Incompressible: $\nabla\cdot\vb V = 0$; irrotational: $\vb V = \nabla\phi$. So $\nabla\cdot\nabla\phi = \nabla^2\phi = \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2} = 0$.`,
    src: L7,
  },
  {
    id: 'fc-lap-cyl',
    front: "Laplace's equation in cylindrical coordinates?",
    back: md`$\dfrac1r\pd{}{r}\left(r\pd{\phi}{r}\right) + \dfrac{1}{r^2}\dfrac{\partial^2\phi}{\partial\theta^2} + \dfrac{\partial^2\phi}{\partial z^2} = 0$ (Lecture 10, slide 8).`,
    src: L8,
  },
  {
    id: 'fc-lap-potential',
    front: 'What is "potential flow"?',
    back: md`Flow that is inviscid, incompressible and irrotational; its velocity potential obeys Laplace's equation (Lecture 10, slide 7). The equation is linear, so solutions can be superposed.`,
    src: L7,
  },
  {
    id: 'fc-find-method',
    front: 'Recipe: φ from a given ψ?',
    back: md`(1) $u = \psi_y$, $v = -\psi_x$. (2) Check $\pd{v}{x} = \pd{u}{y}$. (3) $\phi = \int u\,dx + f(y)$. (4) $\pd{\phi}{y} = v$ gives $f'(y)$ — it must not contain $x$. (5) Integrate, add $C$. (6) Check by differentiating.`,
  },
  {
    id: 'fc-find-lec11',
    front: 'Lecture 11, problem 1 — answer?',
    back: md`$\psi = 5x^2y - \tfrac53y^3 \Rightarrow u = 5x^2 - 5y^2$, $v = -10xy$, and $\phi = \tfrac53x^3 - 5xy^2 + C$ (course signs; Fox's convention gives the negative).`,
    src: L11,
  },
]

/* -------------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`Irrotational flow ($\nabla\times\vb V = 0$) ⇔ the velocity is the gradient of one scalar: $\vb V = \nabla\phi$, i.e. $u = \phi_x$, $v = \phi_y$, $w = \phi_z$ — three unknowns become one.`,
  md`Any φ gives an irrotational flow because $\nabla\times\nabla\phi \equiv 0$ (mixed derivatives commute); conversely a potential exists **only** for irrotational flow.`,
  md`Cylindrical: $v_r = \phi_r$, $v_\theta = \frac1r\phi_\theta$, $v_z = \phi_z$ — for φ the $1/r$ sits on $v_\theta$; for ψ it sits on $v_r$ (with the minus on $v_\theta$).`,
  md`**Sign convention:** the lectures use $\vb V = +\nabla\phi$; Fox uses $\vb V = -\nabla\phi$ (φ falls along the flow). Same flow ⇒ $\phi_{\text{Fox}} = -\phi_{\text{course}}$ — state your convention in an exam.`,
  md`φ comes from irrotationality and works in 3-D; ψ comes from mass conservation and, as a single function, only in 2-D.`,
  md`Fox Table 6.1: ψ always satisfies continuity and obeys Laplace only if irrotational; φ always satisfies irrotationality and obeys Laplace only if incompressible.`,
  md`Incompressible + irrotational ⇒ $\nabla^2\phi = 0$ (Laplace). Inviscid, incompressible, irrotational flows are **potential flows**; in plane potential flow $\nabla^2\phi = 0$ and $\nabla^2\psi = 0$.`,
  md`Laplace's equation is linear: harmonic functions superpose, and the solution inside a region is fixed by its boundary conditions alone.`,
  md`Between φ and ψ: integrate $u = \phi_x = \psi_y$, then fix the integration function from $v = \phi_y = -\psi_x$. If that "function" depends on the wrong variable, the companion does not exist.`,
  md`Lecture 11, problem 1: $\psi = 5x^2y - \tfrac53y^3 \Rightarrow \phi = \tfrac53x^3 - 5xy^2 + C$ — flow in a 60° corner.`,
]

/* -------------------------------------------------------------------------------------------- content */

export default function Content() {
  return (
    <>
      {/* ================================================================ 1. velocity potential */}
      <Concept id="velocity-potential">
        <Step kind="intro" src={[L6, F221, F222]}>
          <Md>{md`
            Lecture 10, slide 6 starts from what it means for a flow to be **irrotational**: fluid particles may translate and deform, but they do not spin. For rotation about the $z$-axis,

            $$
            \omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = 0 ,
            $$

            and demanding the same about all three axes gives three conditions on the velocity gradients: $\pd{v}{x} = \pd{u}{y}$, $\pd{w}{y} = \pd{v}{z}$ and $\pd{u}{z} = \pd{w}{x}$.

            The slide's key observation is that all three conditions hold **automatically** if each velocity component is a partial derivative of one **scalar function** $\phi(x, y, z, t)$, the **velocity potential**:

            $$
            u = \pd{\phi}{x}, \qquad v = \pd{\phi}{y}, \qquad w = \pd{\phi}{z} \qquad\Longleftrightarrow\qquad \vb V = \nabla\phi .
            $$

            So in an irrotational flow the velocity can always be written as the gradient of a scalar. Three unknown velocity fields collapse into a single unknown scalar field — the same economy the stream function gave plane flow, but now in three dimensions.
          `}</Md>
          <Callout kind="def" title="Velocity potential φ">
            <Md>{md`A scalar field whose gradient is the velocity of an irrotational flow: $\vb V = \nabla\phi$. Units m²/s (velocity × length — the same units as ψ). Adding a constant to $\phi$ changes no velocity, so only **differences** of $\phi$ matter. Surfaces (in plane flow, lines) of constant $\phi$ are called **equipotentials**.`}</Md>
          </Callout>
          <Callout kind="note" title="Why the definition works — Fox p. 222">
            <Md>{md`Fox gives the reason in one line: any continuous $\phi(x, y, z, t)$ automatically satisfies irrotationality because of a fundamental identity — **the curl of a gradient is zero**, $\nabla\times\nabla\phi \equiv 0$ (Eq. 6.28), which you can verify by expanding into components. Read in reverse, the same identity says that **a velocity potential exists only for irrotational flow**.`}</Md>
          </Callout>
          <Callout kind="key" title="Where is irrotational flow a good model?">
            <Md>{md`Only shear stresses can set a fluid particle spinning, so an inviscid flow stays irrotational unless its particles were rotating to begin with (Fox p. 221). In real flows irrotationality is a valid assumption wherever viscous forces are negligible — for example everywhere outside the thin boundary layer on a wing, a region that can be analysed to find the wing's **lift** (Fox p. 222).`}</Md>
          </Callout>
          <Callout kind="warning" title="Sign convention — read before you open Fox">
            <Md>{md`The lectures write $\vb V = +\nabla\phi$. Fox (and many textbooks) write $\vec V = -\nabla\phi$ (Eq. 6.27), so that $\phi$ decreases in the flow direction. Both describe the same physics; for a given flow the two potentials differ only in sign. This page uses the lecture convention and flags Fox's wherever it appears.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Picture 1 — a hillside.** Treat $\phi(x, y)$ as the height of a landscape on a contour map. The gradient $\nabla\phi$ points straight uphill, perpendicular to the contour lines, and its length is the steepness. In this course's convention the fluid moves *up* the $\phi$-hill: velocity is perpendicular to the equipotentials and fastest where they crowd together. (In Fox's convention it runs *down*hill, like heat flowing from hot to cold.)

            **Picture 2 — the round trip.** Walk around any closed loop on a hill and you come back to the height you started from. For the flow, that means $\oint \vb V\cdot d\vb s = \oint \nabla\phi\cdot d\vb s = 0$: the **circulation** round every loop is zero, so the average spin of the fluid inside every loop is zero. A tiny paddle wheel dropped anywhere in the flow does not turn.

            **Picture 3 — path independence.** Because $\vb V\cdot d\vb s = d\phi$, the integral $\int_A^B \vb V\cdot d\vb s = \phi(B) - \phi(A)$ is the same along every path from $A$ to $B$ — exactly like the work done by gravity, which depends only on the change in height. In a rotational flow two different paths give two different answers, so no single-valued $\phi$ can exist.
          `}</Md>
          <Callout kind="tip" title="Curved paths are allowed">
            <Md>{md`Irrotational does **not** mean straight. Fluid can swirl round a corner or even round a vortex centre on circular paths while each particle keeps the same orientation — like a Ferris-wheel gondola that circles without turning over. "Irrotational" is about the spin of each particle, not the curvature of its path.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={L6}>
          <Figure caption="Lecture 10, slide 6: uniform flow $u = U$ (constant), $v = 0$, $w = 0$ — the simplest irrotational flow. ✦ Added: its equipotentials (dashed), the planes $x$ = const." src={L6}>
            <UniformFlowFigure />
          </Figure>
          <Supplement title="The potential of the slide's uniform flow">
            <Md>{md`Integrating $\pd{\phi}{x} = U$ with $\pd{\phi}{y} = \pd{\phi}{z} = 0$ gives $\phi = Ux + C$: the equipotentials are the planes $x$ = const, perpendicular to the flow, and $\phi$ grows by $U$ for every metre travelled downstream. (The slide shows the flow, not this $\phi$.)`}</Md>
          </Supplement>
          <Figure
            caption={md`✦ The same uniform flow in both sign conventions: the lectures' $\mathbf V = +\nabla\phi$ (flow towards higher φ) and Fox's $\mathbf V = -\nabla\phi$ (flow towards lower φ — the heat-conduction analogy of Fox p. 222).`}
          >
            <SignConventionFigure />
          </Figure>
        </Step>

        <Step kind="equations" src={[L6, L8, F222]}>
          <FormulaCard id="irrot" />
          <FormulaCard id="phi-def" />
          <Derivation
            title="Why V = ∇φ is irrotational — component by component"
            steps={[
              { md: md`$\pd{v}{x} - \pd{u}{y} = \pd{}{x}\left(\pd{\phi}{y}\right) - \pd{}{y}\left(\pd{\phi}{x}\right)$`, why: md`substitute $u = \phi_x$, $v = \phi_y$` },
              { md: md`$= \dfrac{\partial^2\phi}{\partial x\,\partial y} - \dfrac{\partial^2\phi}{\partial y\,\partial x} = 0$`, why: 'mixed partial derivatives commute for smooth φ' },
              { md: md`likewise $\pd{w}{y} - \pd{v}{z} = \phi_{zy} - \phi_{yz} = 0$ and $\pd{u}{z} - \pd{w}{x} = \phi_{xz} - \phi_{zx} = 0$`, why: 'the other two rotation components' },
              { md: md`$\Rightarrow\ \nabla\times(\nabla\phi) \equiv 0$ for every $\phi$`, why: 'Fox Eq. (6.28), footnote 3' },
            ]}
          />
          <FormulaCard id="curl-grad" />
          <FormulaCard id="phi-fox" />
          <Callout kind="exam" title="Which convention in the exam?">
            <Md>{md`Use the lecture convention $\vb V = +\nabla\phi$ unless told otherwise, and say so in one line. If you use a result from Fox, flip the sign of his $\phi$ (not of his $\psi$ — the stream-function convention is the same in both).`}</Md>
          </Callout>
          <Md>{md`Slide 8 repeats the construction in **cylindrical coordinates** $(r, \theta, z)$: write the gradient operator, apply it to $\phi$, and match components with $\vb V = v_r\hat{\vb e}_r + v_\theta\hat{\vb e}_\theta + v_z\hat{\vb e}_z$.`}</Md>
          <FormulaCard id="grad-cyl" />
          <FormulaCard id="phi-cyl" />
          <FormulaCard id="phi-cyl-fox" />
          <Callout kind="warning" title="Where does the 1/r go?">
            <Md>{md`Velocity potential: $v_r = \pd{\phi}{r}$, $v_\theta = \dfrac1r\pd{\phi}{\theta}$ — the $1/r$ is on $v_\theta$, no minus sign. Stream function (Lecture 10, slide 2): $v_r = \dfrac1r\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$ — the $1/r$ is on $v_r$ and the minus on $v_\theta$. A units check catches most slips: every velocity must come out in m/s.`}</Md>
          </Callout>
          <Supplement title="The converse: building φ from an irrotational V">
            <Md>{md`If $\nabla\times\vb V = 0$ throughout a region without holes, the line integral $\phi(P) = \phi_0 + \int_{P_0}^{P} \vb V\cdot d\vb s$ is independent of the path, so it defines a single-valued $\phi$ with $\nabla\phi = \vb V$ — irrotationality is necessary **and** sufficient. Around a hole that contains a singularity (a vortex core, say) the integral can pick up a fixed amount on each circuit, and $\phi$ becomes multivalued (the free vortex $\phi = K\theta$ of Unit B).`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-vp-3d" />
          <ExampleCard id="ex-vp-cyl" />
        </Step>

        <Step kind="interactive">
          <IrrotationalityLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="velocity-potential" />
          <QuickCheck ids={['q-vp-why', 'q-vp-fox']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Irrotational ⇔ $\pd{v}{x} = \pd{u}{y}$, $\pd{w}{y} = \pd{v}{z}$, $\pd{u}{z} = \pd{w}{x}$ ⇔ $\vb V = \nabla\phi$ (Lecture 10, slide 6).`,
              md`The link is the identity $\nabla\times\nabla\phi \equiv 0$: every φ is irrotational, and only irrotational flows have a φ.`,
              md`φ works in 3-D and in unsteady or compressible flow; units m²/s; only differences of φ matter.`,
              md`Cylindrical: $v_r = \phi_r$, $v_\theta = \frac1r\phi_\theta$, $v_z = \phi_z$ (slide 8).`,
              md`**Exam trap:** Fox's $\vec V = -\nabla\phi$ flips the sign of every potential — and putting a minus sign on $v$ alone (ψ-style) gives a wrong flow.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 2. φ vs ψ */}
      <Concept id="phi-vs-psi">
        <Step kind="intro" src={[L7, L2, F223]}>
          <Md>{md`
            Slide 7 opens with four statements that set the two scalar functions side by side:

            - the **velocity potential** is a consequence of the **irrotationality** of the flow field;
            - the **stream function** is a consequence of **conservation of mass**;
            - a velocity potential can be defined for a **general three-dimensional** flow;
            - a **single** stream function is restricted to **two-dimensional** flows.

            Slide 2 adds the fine print for ψ: the idea extends to **axisymmetric** flows (pipes, bodies of revolution) and to **two-dimensional compressible** flows, but not to general 3-D flows with a single ψ.

            Fox (p. 223) then looks at the region where the two overlap. For a **two-dimensional, incompressible, irrotational** flow, $u$ and $v$ can be written in terms of **both** functions at once — the book boxes $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ (Eq. 5.4) next to $u = -\pd{\phi}{x}$, $v = -\pd{\phi}{y}$ (Eq. 6.29, his sign) — and Table 6.1 (p. 224) records what each function always guarantees and when it satisfies Laplace's equation.
          `}</Md>
          <Callout kind="key" title="Different parents, different guarantees">
            <Md>{md`ψ is born from a **conservation law** (continuity), so every ψ conserves mass — but the flow it describes may spin. φ is born from a **kinematic condition** (no spin), so every φ is irrotational — but the flow it describes may create or destroy volume. Only plane flows that are both incompressible and irrotational have both functions; there the two families of curves form a **flow net**.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Two kinds of bookkeeping.** The stream function counts **flux**: the difference $\psi_2 - \psi_1$ is the volume flow rate (per unit depth) passing between two streamlines. The velocity potential counts **"push"**: $\phi(B) - \phi(A)$ is the line integral of velocity from $A$ to $B$ — how much the flow carries you along that route.

            **Why ψ stops at two dimensions.** In plane flow continuity has two terms, $\pd{u}{x} + \pd{v}{y} = 0$, and one scalar can pair them off exactly ($\psi_{yx} - \psi_{xy} = 0$). In 3-D there are three terms; a single scalar cannot cancel them identically (you would need two stream functions or a vector potential). A gradient, by contrast, has three components automatically — so φ needs no such trick.

            **The heat-conduction analogy.** In steady conduction, isotherms play the role of equipotentials and heat-flow lines the role of streamlines; they always cross at right angles. Fox's minus sign is chosen to make this analogy exact: φ, like temperature, falls in the direction of flow.
          `}</Md>
        </Step>

        <Step kind="visual" src={L7}>
          <Figure caption="✦ Which flows have which function? Click an example: plane incompressible flows have a ψ, irrotational flows (2-D or 3-D) have a φ, and plane potential flows have both.">
            <ExistenceVenn />
          </Figure>
          <Compare
            items={[
              {
                title: 'Velocity potential φ',
                tone: 'amber',
                md: md`Consequence of **irrotationality** (slide 7). Defined for general **3-D** flow, steady or unsteady. $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$, $w = \pd{\phi}{z}$. Always irrotational; obeys Laplace **only if incompressible**. Lines φ = const: **equipotentials**, perpendicular to the velocity.`,
              },
              {
                title: 'Stream function ψ',
                tone: 'cyan',
                md: md`Consequence of **conservation of mass** (slide 7). A single ψ only for **2-D** flow (plus axisymmetric and 2-D compressible extensions, slide 2). $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$. Always conserves mass; obeys Laplace **only if irrotational**. Lines ψ = const: **streamlines**, along the velocity.`,
              },
            ]}
          />
          <Figure caption="✦ Where both exist they form a flow net: for Fox's Example 6.10 field, streamlines of ψ = 3x² − 3y² (solid) and equipotentials of φ = −6xy (dashed) are hyperbolas that cross at right angles (brief preview of the flow-nets topic).">
            <FlowField
              x={[-2, 2]}
              y={[-1.5, 1.5]}
              psi={foxPsi}
              phi={foxPhi}
              equipotentials
              psiLevels={FOX_PSI_LEVELS}
              phiLevels={FOX_PHI_LEVELS}
              markers={ORIGIN}
              particles={50}
              maxHeight={320}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={[F223, F224]}>
          <Md>{md`For a plane flow that is incompressible and irrotational, Fox (p. 223) boxes both definitions side by side — the stream function, which the course also uses unchanged,`}</Md>
          <FormulaCard id="psi-def" />
          <Md>{md`and the velocity potential in Fox's sign, Eq. (6.29) (the plane-flow case of the card shown in concept 1). In cylindrical coordinates the same pairing holds (Fox p. 223) — the stream function's polar form below, and φ's Eq. (6.33) as on Fox's cylindrical card above:`}</Md>
          <FormulaCard id="psi-polar" />
          <Figure caption="Fox Table 6.1 — definitions of ψ and φ, and the conditions under which each satisfies Laplace's equation (φ row in Fox's sign convention)." src={F224}>
            <Table61 />
          </Figure>
          <Callout kind="warning" title="A misprint in Table 6.1">
            <Md>{md`In the φ row, "always satisfies irrotationality" is printed as $-\frac{\partial^2\phi}{\partial x\,\partial y} - \frac{\partial^2\phi}{\partial y\,\partial x} \equiv 0$. With $u = -\phi_x$, $v = -\phi_y$ one gets $\pd{v}{x} = -\phi_{yx}$ and $-\pd{u}{y} = +\phi_{xy}$, so the terms have **opposite** signs and cancel — the corrected entry is shown above. The other three cells are correct as printed.`}</Md>
          </Callout>
          <FormulaCard id="psi-identity" />
          <FormulaCard id="phi-identity" />
          <Supplement title="From yes/no to a number">
            <Md>{md`Table 6.1's "only if" conditions can be made quantitative. Substituting the definitions gives $\pd{v}{x} - \pd{u}{y} = -\nabla^2\psi$ and $\pd{u}{x} + \pd{v}{y} = \nabla^2\phi$ (course signs), so a non-harmonic ψ measures rotation and a non-harmonic φ measures volume creation:`}</Md>
            <FormulaCard id="how-far" />
          </Supplement>
          <Md>{md`Fox closes the discussion (p. 224) with the geometry of the two families. Along a streamline $d\psi = \pd{\psi}{x}dx + \pd{\psi}{y}dy = 0$, and along an equipotential $d\phi = \pd{\phi}{x}dx + \pd{\phi}{y}dy = 0$, which gives their slopes:`}</Md>
          <FormulaCard id="slopes" />
          <Callout kind="note" title="Kept brief here">
            <Md>{md`The slopes are negative reciprocals, so lines of constant ψ and lines of constant φ are **orthogonal** — the property behind graphical flow nets. Their construction and use (Lecture 12) are covered in the flow-nets topic.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-pp-same" />
          <ExampleCard id="ex-pp-lec10" />
        </Step>

        <Step kind="interactive">
          <Table61Lab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="phi-vs-psi" />
          <QuickCheck ids={['q-pp-table', 'q-pp-tf']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`φ ← irrotationality, works in 3-D; ψ ← mass conservation, a single ψ only in 2-D (slide 7).`,
              md`Table 6.1: ψ always satisfies continuity and is harmonic only if irrotational; φ always satisfies irrotationality and is harmonic only if incompressible.`,
              md`Quantitatively $\nabla^2\psi = -2\omega_z$ and $\nabla^2\phi = \nabla\cdot\vb V$ — use them to classify a flow in one line.`,
              md`Both functions exist only for plane, incompressible, irrotational flow; then streamlines ⟂ equipotentials (Eqs. 6.34–6.35).`,
              md`**Exam trap:** "incompressible, so it has a velocity potential" is wrong — incompressibility gives ψ, irrotationality gives φ.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 3. Laplace */}
      <Concept id="laplace">
        <Step kind="intro" src={[L7, L8, F222, F223]}>
          <Md>{md`
            Now combine the two conditions. For an **incompressible** flow, conservation of mass reads $\nabla\cdot\vb V = 0$ (slide 7). If the flow is also **irrotational**, substitute $\vb V = \nabla\phi$:

            $$
            \nabla\cdot(\nabla\phi) = \nabla^2\phi = 0 .
            $$

            The operator $\nabla^2(\;) = \nabla\cdot\nabla(\;)$ is the **Laplacian**, and written out in Cartesian coordinates the result,

            $$
            \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2} = 0 ,
            $$

            is **Laplace's equation**. Slide 7's conclusion: **inviscid, incompressible, irrotational flow fields are governed by Laplace's equation**, and such flow is called **potential flow**. Slide 8 gives the same equation in cylindrical coordinates.

            Fox frames the same idea as a theory: irrotational-flow theory is built for an imaginary **ideal fluid** of exactly zero viscosity, and since its velocity field can be generated from the potential it goes by the name **potential flow theory** (pp. 222–223). Real fluids always have some viscosity, but neglecting it often makes the analysis far simpler while the answers stay useful; being comparatively simple and mathematically elegant, potential flow has been studied in great depth (p. 223).
          `}</Md>
          <Callout kind="key" title="One linear equation instead of four nonlinear ones">
            <Md>{md`In potential flow the whole velocity field comes from a single, **linear** equation for one scalar. The pressure is found afterwards from the Bernoulli equation — and because the flow is irrotational, Bernoulli's constant is the same between **any** two points, not just along one streamline (Fox p. 222, Eq. 6.26; developed in the Euler-to-Bernoulli topic).`}</Md>
          </Callout>
          <Callout kind="note" title="Any harmonic function is a flow (Fox p. 223)">
            <Md>{md`In plane potential flow both $\psi$ and $\phi$ satisfy Laplace's equation (Eqs. 6.31 and 6.32), and **any** function ψ or φ that satisfies it represents a possible two-dimensional, incompressible, irrotational flow field. Fox notes that the same equation arises in many areas of physical science and engineering (steady heat conduction, electrostatics and groundwater seepage are familiar examples).`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **The Laplacian compares a point with its neighbours.** On a grid, $\nabla^2\phi$ at a point is proportional to (average of the neighbouring values) − (value at the point). Laplace's equation therefore says: **every point equals the average of its surroundings.** A harmonic function has no local bumps or dips — no interior maxima or minima — and is as smooth as the boundaries allow.

            **What $\nabla^2\phi$ means physically.** With $\vb V = \nabla\phi$, $\nabla^2\phi = \nabla\cdot\vb V$ is the rate at which a small fluid element swells. Laplace's equation is simply "no swelling": the continuity equation, rewritten for φ.

            **The soap film.** Bend a wire loop and dip it in soap solution: the film's height obeys (very nearly) Laplace's equation, and its shape is fixed entirely by the wire. Likewise a potential flow is fixed by its boundaries — walls (no flow through them) and the conditions far away — and because the equation is linear, simple solutions can be **added** to build complicated flows (superposition, Unit B).
          `}</Md>
          <Callout kind="tip" title="Why this is such good news">
            <Md>{md`Euler's equations are nonlinear in $\vb V$; Laplace's equation is linear in $\phi$. That single change is what makes potential flow solvable by hand: a uniform stream plus a source is a half-body, a uniform stream plus a doublet is a cylinder — each just the sum of two known harmonic functions.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual">
          <Figure caption="✦ The five-point stencil, P = (1, 0.5) m with spacing h = 0.5 m. For the harmonic φ = x³ − 3xy² the neighbours average exactly to φ at P; for x² + y² they overshoot, and (mean − φ_P)·4/h² recovers ∇²φ = 4.">
            <StencilFigure />
          </Figure>
          <LaplaceRelaxation />
        </Step>

        <Step kind="equations" src={[L7, L8, F223]}>
          <FormulaCard id="continuity" />
          <FormulaCard id="laplacian" />
          <Derivation
            title="Slide 7: from continuity to Laplace's equation"
            steps={[
              { md: md`$\nabla\cdot\vb V = 0$`, why: 'incompressible flow' },
              { md: md`$\nabla\cdot(\nabla\phi) = 0$`, why: md`irrotational, so $\vb V = \nabla\phi$` },
              { md: md`$\nabla^2\phi = 0$`, why: md`definition $\nabla^2(\;) = \nabla\cdot\nabla(\;)$` },
              { md: md`$\dfrac{\partial^2\phi}{\partial x^2} + \dfrac{\partial^2\phi}{\partial y^2} + \dfrac{\partial^2\phi}{\partial z^2} = 0$`, why: 'Cartesian form: Laplace’s equation' },
            ]}
          />
          <FormulaCard id="laplace-phi" />
          <FormulaCard id="laplace-cyl" />
          <Supplement title="Where the cylindrical form comes from">
            <Md>{md`Start from incompressible continuity in cylindrical coordinates, $\dfrac1r\dfrac{\partial(rv_r)}{\partial r} + \dfrac1r\pd{v_\theta}{\theta} + \pd{v_z}{z} = 0$ (slide 2 prints the plane version, without the $v_z$ term), and substitute slide 8's $v_r = \phi_r$, $v_\theta = \frac1r\phi_\theta$, $v_z = \phi_z$. The middle term becomes $\frac1r\pd{}{\theta}\left(\frac1r\phi_\theta\right) = \frac{1}{r^2}\phi_{\theta\theta}$ — the source of the $1/r^2$.`}</Md>
          </Supplement>
          <Md>{md`Fox (p. 223) derives the plane-flow versions for **both** functions, and the pairing is crossed:`}</Md>
          <Derivation
            title="Fox p. 223: Laplace for ψ and for φ"
            steps={[
              { md: md`$\pd{v}{x} - \pd{u}{y} = 0$ with $u = \psi_y$, $v = -\psi_x$`, why: 'irrotationality, Eq. (6.23), and Eq. (5.4)' },
              { md: md`$-\dfrac{\partial^2\psi}{\partial x^2} - \dfrac{\partial^2\psi}{\partial y^2} = 0 \;\Rightarrow\; \nabla^2\psi = 0$`, why: 'Eq. (6.31)' },
              { md: md`$\pd{u}{x} + \pd{v}{y} = 0$ with $u = -\phi_x$, $v = -\phi_y$`, why: "continuity, Eq. (5.3), and Fox's Eq. (6.29)" },
              { md: md`$-\dfrac{\partial^2\phi}{\partial x^2} - \dfrac{\partial^2\phi}{\partial y^2} = 0 \;\Rightarrow\; \nabla^2\phi = 0$`, why: "Eq. (6.32) — identical in the course's sign" },
            ]}
          />
          <FormulaCard id="laplace-psi" />
          <Callout kind="exam" title="The crossed wiring">
            <Md>{md`ψ needs **irrotationality** to be harmonic; φ needs **incompressibility** to be harmonic. Substituting ψ into continuity, or φ into the irrotationality condition, only gives $0 = 0$ — no information.`}</Md>
          </Callout>
          <FormulaCard id="laplace-fd" />
          <Callout kind="warning" title="Laplace is a test, not a licence">
            <Md>{md`$\nabla^2\phi = 0$ only makes sense once a $\phi$ exists. A velocity field must first pass the irrotationality test; only then does Laplace's equation decide whether it is also incompressible. Note too that $\nabla^2\phi = 0$ in 3-D needs all three second derivatives — dropping $\partial^2\phi/\partial z^2$ is allowed only for plane flow.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-lap-test" />
          <ExampleCard id="ex-lap-cyl" />
        </Step>

        <Step kind="interactive">
          <LaplaceExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="laplace" />
          <QuickCheck ids={['q-lap-wiring', 'q-lap-cyl']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Incompressible ($\nabla\cdot\vb V = 0$) + irrotational ($\vb V = \nabla\phi$) ⇒ $\nabla^2\phi = 0$, with $\nabla^2(\;) = \nabla\cdot\nabla(\;)$ (slide 7).`,
              md`Cylindrical: $\frac1r\partial_r(r\,\partial_r\phi) + \frac{1}{r^2}\partial^2_\theta\phi + \partial^2_z\phi = 0$ (slide 8) — mind the $1/r^2$.`,
              md`Inviscid, incompressible, irrotational flow = **potential flow**; in plane potential flow ψ is harmonic as well (Fox Eq. 6.31).`,
              md`A harmonic function equals the mean of its neighbours: no interior extremes; the boundaries decide everything; solutions superpose.`,
              md`**Exam trap:** testing ψ with continuity (always satisfied) or φ with irrotationality (always satisfied) proves nothing — use Laplace's equation.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 4. finding φ and ψ */}
      <Concept id="finding-phi-psi">
        <Step kind="intro" src={[L11, L12S3, F224]}>
          <Md>{md`
            In a plane, incompressible, irrotational flow both functions exist and must give the **same** velocity. Lecture 12, slide 3 lists the two sets of components together; equating them (course convention) gives

            $$
            u = \pd{\phi}{x} = \pd{\psi}{y}, \qquad v = \pd{\phi}{y} = -\pd{\psi}{x} .
            $$

            So if you know one function you can find the other by **integration**. Lecture 11, slide 2 sets exactly this task as an in-class problem — the stream function $\psi = 5x^2y - \tfrac53y^3$ of a two-dimensional flow is given, and the corresponding velocity potential is asked for — and Fox ends §6.6 by pointing to Example 6.10 (p. 224), which shows how the velocity potential is computed from the stream function $\psi = ax^2 - ay^2$.
          `}</Md>
          <Callout kind="def" title="The method in one sentence">
            <Md>{md`Integrate one of the two relations **partially**, adding an unknown function of the other variable; then differentiate the result with respect to that other variable and match it to the second relation to pin the unknown function down.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Why an unknown function, not a constant?** A partial integration with respect to $x$ treats $y$ as fixed, so anything that does not change with $x$ — any $f(y)$ — disappears on differentiation and must be restored. The second relation is the extra information that fixes $f(y)$.

            **The built-in alarm.** If the flow is rotational, the two relations are mutually inconsistent, and the algebra tells you so: the "function of $y$" comes out containing $x$. In the reverse direction (φ → ψ), a compressible flow makes $g'(x)$ come out containing $y$. You never need to trust a solution blindly — the recipe checks itself.

            **The constant that doesn't matter.** After $f(y)$ is found, one genuine constant $C$ remains. It has no physical meaning: velocities are derivatives, and only differences of φ (or of ψ) are ever used.
          `}</Md>
        </Step>

        <Step kind="visual">
          <Figure caption="✦ The two definitions side by side in plane potential flow (course convention): φ differentiates 'straight', ψ 'crossed' with a minus sign on v.">
            <CauchyRiemannFigure />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'Differentiate the given function', md: md`ψ given: $u = \psi_y$, $v = -\psi_x$. φ given: $u = \phi_x$, $v = \phi_y$.` },
              { title: 'Check that the companion exists', md: md`ψ → φ: irrotational? $\pd{v}{x} = \pd{u}{y}$ (or $\nabla^2\psi = 0$). φ → ψ: incompressible? $\nabla^2\phi = 0$.`, tone: 'amber' },
              { title: 'Integrate one relation partially', md: md`$\phi = \int u\,dx + f(y)$, or $\psi = \int u\,dy + g(x)$.` },
              { title: 'Differentiate and match the other relation', md: md`$\pd{\phi}{y} = v \Rightarrow f'(y)$; or $-\pd{\psi}{x} = v \Rightarrow g'(x)$.` },
              { title: 'Integrate the unknown function, add C', md: md`$f'$ must depend on $y$ only ($g'$ on $x$ only) — otherwise stop: no companion exists.`, tone: 'rose' },
              { title: 'Check', md: md`Differentiate the answer and recover $u$ and $v$; in plane potential flow it is harmonic too.`, tone: 'emerald' },
            ]}
          />
          <Figure caption="✦ Lecture 11, problem 1 drawn: streamlines of ψ = 5x²y − (5/3)y³ (solid) and equipotentials of the φ = (5/3)x³ − 5xy² found below (dashed). The ψ = 0 streamline (red) consists of the lines y = 0 and y = ±√3x, 60° apart — any two neighbours can be taken as walls: flow in a 60° corner.">
            <FlowField
              x={[-1.6, 1.6]}
              y={[-1.2, 1.2]}
              psi={lec11Psi}
              phi={lec11Phi}
              equipotentials
              psiLevels={LEC11_LEVELS}
              phiLevels={LEC11_LEVELS}
              highlight={LEC11_HL}
              markers={ORIGIN}
              particles={50}
              maxHeight={320}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={[L12S3, F223]}>
          <FormulaCard id="cr" />
          <FormulaCard id="cr-polar" />
          <Callout kind="warning" title="Sign traps when integrating">
            <Md>{md`Going ψ → φ, match $\pd{\phi}{y}$ to $+v$; going φ → ψ, match $\pd{\psi}{x}$ to $-v$. Working from Fox, $u = -\pd{\phi}{x}$ and $v = -\pd{\phi}{y}$, so his φ comes out with the opposite sign — compare Lecture 11's answer with the Fox-convention result in the solved example below.`}</Md>
          </Callout>
          <Callout kind="exam" title="Write the check line">
            <Md>{md`Examiners reward the last step: differentiate your φ and show it returns the given $u$ and $v$ (and, in plane potential flow, that $\nabla^2\phi = 0$). It takes ten seconds and catches nearly every sign error.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-find-lec11" />
          <ExampleCard id="ex-find-fox610" />
          <ExampleCard id="ex-find-phi2psi" />
        </Step>

        <Step kind="interactive">
          <PsiPhiIntegrator />
        </Step>

        <Step kind="practice">
          <PracticeList concept="finding-phi-psi" />
          <QuickCheck ids={['q-find-fail', 'q-find-cr']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`In plane potential flow $u = \phi_x = \psi_y$ and $v = \phi_y = -\psi_x$ (course signs): one function determines the other.`,
              md`ψ → φ: integrate $u$ in $x$ + $f(y)$, match $\phi_y = v$. φ → ψ: integrate $u$ in $y$ + $g(x)$, match $-\psi_x = v$.`,
              md`If $f'(y)$ contains $x$ (or $g'(x)$ contains $y$) the companion does not exist — rotational (or compressible) flow.`,
              md`Lecture 11, problem 1: $\phi = \tfrac53x^3 - 5xy^2 + C$; Fox Example 6.10: $\phi = -6xy + C$ (course) $= 6xy + C$ in Fox's convention.`,
              md`**Exam trap:** forgetting the integration function — writing "+ C" instead of "+ f(y)" — silently loses terms such as the $y^3$ in $\phi = y^3 - 3x^2y$.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
