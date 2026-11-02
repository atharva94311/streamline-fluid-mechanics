/**
 * Topic A3 — The Stream Function.
 * Sources: Lecture 9 slides 12–14 (definition, streamlines, flow rate) and Lecture 10 slide 2
 * (polar form, scope, in-class problem). Sign convention throughout: u = ∂ψ/∂y, v = −∂ψ/∂x.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowChart, FlowField, FlowSteps, FormulaCard, Md, md, Plot,
  PracticeList, QuickCheck, Step, Supplement, Takeaways, type FlowMarker,
} from '@/kit'
import {
  CornerBoxFigure, FlowRateFigure, PolarFigure, PsiGradientFigure, TangencyFigure, VelocityTriangleFigure,
} from '../sims/stream-function/figures'
import { ContinuityLab } from '../sims/stream-function/ContinuityLab'
import { StreamlineTracer } from '../sims/stream-function/StreamlineTracer'
import { FlowRateMeter } from '../sims/stream-function/FlowRateMeter'
import { LinearFieldBuilder } from '../sims/stream-function/LinearFieldBuilder'
import { PolarExplorer } from '../sims/stream-function/PolarExplorer'

const S12: Src = { doc: 'lec9', pages: '12' }
const S13: Src = { doc: 'lec9', pages: '13' }
const S14: Src = { doc: 'lec9', pages: '14' }
const L10: Src = { doc: 'lec10', pages: '2' }

/* Fields drawn inside steps and examples (module constants → stable identities for FlowField). */
const cornerPsi = (x: number, y: number) => x * y
const inclassPsi = (x: number, y: number) => y * y - 2 * x * x
const INCLASS_HL = [{ level: 0, color: 'var(--plot-4)', label: 'ψ = 0: the lines y = ±√2 x' }]
const ORIGIN_STAG: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation' }]
const CORNER_LEVELS = Array.from({ length: 14 }, (_, i) => 0.25 * (i + 1))

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'stream-function',
  unit: 'A',
  title: 'The Stream Function',
  subtitle:
    'One scalar ψ(x, y) that builds mass conservation into plane flow: its contour lines are the streamlines and its differences are flow rates.',
  minutes: 80,
  sources: [
    { doc: 'lec9', pages: '12–14' },
    { doc: 'lec10', pages: '2' },
  ],
  concepts: [
    {
      id: 'definition',
      title: 'Defining ψ: continuity satisfied identically',
      src: S12,
      summary: 'u = ∂ψ/∂y, v = −∂ψ/∂x turns the plane incompressible continuity equation into an identity — the mixed derivatives cancel.',
    },
    {
      id: 'streamlines',
      title: 'Lines of constant ψ are streamlines',
      src: S13,
      summary: 'dψ = −v dx + u dy, so dψ = 0 is exactly the streamline condition dy/dx = v/u.',
    },
    {
      id: 'flow-rate',
      title: 'Δψ equals the volume flow rate between streamlines',
      src: S14,
      summary: 'dq = u dy − v dx = dψ, so q = ψ₂ − ψ₁ per unit depth; the sign tells which way the flow crosses.',
    },
    {
      id: 'polar-scope',
      title: 'ψ in polar coordinates & where a stream function exists',
      src: L10,
      summary:
        'v_r = (1/r)∂ψ/∂θ, v_θ = −∂ψ/∂r; ψ extends to axisymmetric and 2-D compressible flow, but no single ψ describes general 3-D flow. In-class problem u = 2y, v = 4x.',
    },
  ],
  sourceNote: md`**Sources.** Lecture 9, slides 12–14 (definition, streamlines, flow rate) and Lecture 10, slide 2 (polar form, scope and an in-class problem). The slides print **no equation numbers** and show **no worked solutions**: the Lecture 10 problem is solved here (marked *solution written here*), and all other examples, problems and simulations are supplementary (✦). Sign convention throughout — the course's: $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$.`,
}

/* -------------------------------------------------------------------------------------------- formulas */

export const formulas: FormulaDef[] = [
  {
    id: 'continuity-2d',
    name: 'Continuity — plane, incompressible flow',
    tex: md`\pd{u}{x} + \pd{v}{y} = 0`,
    vars: [
      { sym: md`u,\ v`, desc: 'velocity components in the $x$ and $y$ directions', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates in the plane of the flow', units: md`\mathrm{m}` },
      {
        sym: md`\pd{u}{x},\ \pd{v}{y}`,
        desc: 'normal velocity gradients (stretching rates); their sum is the area (volume) dilatation rate of a fluid element',
        units: md`\mathrm{s^{-1}}`,
      },
    ],
    conditions: [
      md`incompressible: $\rho$ = constant, so continuity reads $\nabla\cdot\vb V = 0$ (Lecture 9, slide 11)`,
      md`plane two-dimensional: $w = 0$ and nothing depends on $z$`,
      'holds at every instant, so it applies to steady and unsteady flow alike',
    ],
    use: md`The one constraint every plane incompressible velocity field must meet. Check it **first** whenever you are given $(u, v)$: if $\pd{u}{x} + \pd{v}{y} \ne 0$, no stream function exists.`,
    src: S12,
  },
  {
    id: 'psi-def',
    name: 'Stream function — definition (course sign convention)',
    key: true,
    tex: md`u = \pd{\psi}{y}, \qquad v = -\pd{\psi}{x}`,
    vars: [
      {
        sym: md`\psi(x, y)`,
        desc: 'stream function: constant along each streamline; differences give the flow rate per unit depth',
        units: md`\mathrm{m^2/s}`,
      },
      { sym: md`u,\ v`, desc: 'velocity components along $x$ and $y$', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      'plane (two-dimensional), incompressible flow',
      md`$\psi$ smooth (continuous second derivatives), so its mixed partial derivatives are equal`,
      md`fixed only up to an additive constant: $\psi$ and $\psi + C$ give the same velocity field`,
      md`this course's sign convention (boxed on Lecture 9, slides 12 and 14); some textbooks use $u = -\pd{\psi}{y}$, $v = \pd{\psi}{x}$, which reverses the sign of $\psi$`,
    ],
    use: md`**ψ → velocity:** differentiate. **Velocity → ψ:** integrate $u = \pd{\psi}{y}$ with respect to $y$, add an unknown $f(x)$, then fix $f$ from $v = -\pd{\psi}{x}$. The minus sign sits on $v$, the component obtained from the $x$-derivative.`,
    src: [S12, { doc: 'lec9', pages: '14', note: 'boxed again' }],
  },
  {
    id: 'psi-identity',
    name: 'Continuity satisfied identically',
    tex: md`\pd{}{x}\left(\pd{\psi}{y}\right) + \pd{}{y}\left(-\pd{\psi}{x}\right) = \frac{\partial^2\psi}{\partial x\,\partial y} - \frac{\partial^2\psi}{\partial y\,\partial x} = 0`,
    vars: [
      { sym: md`\psi`, desc: 'any smooth stream function', units: md`\mathrm{m^2/s}` },
      {
        sym: md`\frac{\partial^2\psi}{\partial x\,\partial y}`,
        desc: md`mixed second derivative; equal to $\frac{\partial^2\psi}{\partial y\,\partial x}$ for a smooth function (Schwarz–Clairaut theorem)`,
        units: md`\mathrm{s^{-1}}`,
      },
    ],
    conditions: [
      md`true for **every** $\psi$ with continuous second derivatives — this is what "satisfied identically" means`,
      'the equation being tested is plane, incompressible continuity',
    ],
    use: md`Any smooth $\psi$ you can write down describes a mass-conserving plane flow, with nothing left to check. Conversely, a velocity field that violates continuity can never be written in terms of a $\psi$.`,
    src: S12,
  },
  {
    id: 'streamline-slope',
    name: 'Streamline equation',
    tex: md`\frac{dy}{dx} = \frac{v}{u} \qquad \text{(along a streamline)}`,
    vars: [
      { sym: md`dx,\ dy`, desc: 'components of a small step along the streamline', units: md`\mathrm{m}` },
      { sym: md`u,\ v`, desc: 'local velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'a streamline is everywhere tangent to the velocity (Lecture 9, slide 13)',
      'in unsteady flow it gives the streamlines at one instant',
      md`needs $\vb V \ne 0$: at a stagnation point $v/u = 0/0$ is undefined; where $u = 0$ use $dx/dy = u/v$`,
    ],
    use: md`Integrate it to find streamline shapes, or use it to test whether a curve is a streamline. With a stream function the integration can be skipped: the streamlines are simply the curves $\psi = \text{const}$.`,
    src: S13,
  },
  {
    id: 'dpsi',
    name: 'Total differential of ψ',
    tex: md`d\psi = \pd{\psi}{x}\,dx + \pd{\psi}{y}\,dy = -v\,dx + u\,dy`,
    vars: [
      { sym: md`d\psi`, desc: 'change in $\psi$ between two neighbouring points', units: md`\mathrm{m^2/s}` },
      { sym: md`dx,\ dy`, desc: 'separation of the two points', units: md`\mathrm{m}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`a stream function $\psi(x, y)$ exists (plane, incompressible flow)`,
      md`first form: chain rule for a function of two variables; second form: substitute $\pd{\psi}{x} = -v$, $\pd{\psi}{y} = u$`,
    ],
    use: md`The workhorse identity of this topic: set $d\psi = 0$ to get the streamlines (slide 13), or read $d\psi$ as the flow rate between neighbouring streamlines (slide 14).`,
    src: S13,
  },
  {
    id: 'psi-const',
    name: 'Lines of constant ψ are streamlines',
    tex: md`\psi = \text{const}: \quad -v\,dx + u\,dy = 0 \;\Longrightarrow\; \frac{dy}{dx} = \frac{v}{u}`,
    vars: [
      { sym: md`\psi`, desc: 'stream function, held constant along the curve', units: md`\mathrm{m^2/s}` },
      { sym: md`dx,\ dy`, desc: 'small step along the curve $\psi = \text{const}$', units: md`\mathrm{m}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['plane, incompressible flow (a ψ exists)', md`valid wherever $\vb V \ne 0$; contours may cross only at stagnation points`],
    use: md`To draw the streamline pattern, contour $\psi$. To find the streamline through $(x_0, y_0)$, solve $\psi(x, y) = \psi(x_0, y_0)$ — no differential equation needed.`,
    src: S13,
  },
  {
    id: 'dq',
    name: 'Flow between neighbouring streamlines',
    tex: md`dq = u\,dy - v\,dx = \pd{\psi}{y}\,dy + \pd{\psi}{x}\,dx = d\psi`,
    vars: [
      {
        sym: md`dq`,
        desc: 'volume flow rate per unit depth passing between the streamlines $\psi$ and $\psi + d\psi$',
        units: md`\mathrm{m^2/s}`,
      },
      { sym: md`u\,dy`, desc: 'flow crossing the vertical step $BC$ (length $dy$) in the $+x$ direction', units: md`\mathrm{m^2/s}` },
      { sym: md`-v\,dx`, desc: 'flow crossing the horizontal step $AB$ (length $dx$) in the $-y$ direction', units: md`\mathrm{m^2/s}` },
      { sym: md`dx,\ dy`, desc: 'horizontal and vertical extent of the path from $A$ (on $\psi$) to $C$ (on $\psi + d\psi$)', units: md`\mathrm{m}` },
    ],
    conditions: [
      'plane, incompressible flow; no fluid crosses a streamline',
      'measured per unit depth normal to the x–y plane',
      md`$dq$ counts the flow crossing the path from left to right for someone walking from $A$ to $C$`,
    ],
    use: md`It shows that the **change** in $\psi$ is a flow rate — the physical meaning of the stream function.`,
    src: S14,
  },
  {
    id: 'q-psi',
    name: 'Volume flow rate between two streamlines',
    key: true,
    tex: md`q = \int_{\psi_1}^{\psi_2} d\psi = \psi_2 - \psi_1`,
    vars: [
      { sym: md`q`, desc: 'volume flow rate per unit depth between the two streamlines (m³/s per metre of depth)', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi_1,\ \psi_2`, desc: 'values of $\psi$ on streamlines 1 and 2', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'plane, incompressible flow',
      md`independent of the curve used to join the two streamlines — only the end values of $\psi$ matter`,
      md`direction (slide 14, with $\psi_2$ drawn as the upper streamline): $\psi_2 > \psi_1$ ⇒ flow from left to right; $\psi_2 < \psi_1$ ⇒ from right to left`,
      md`per unit depth: multiply by the depth $b$ to get a volume flow rate in $\mathrm{m^3/s}$`,
    ],
    use: md`Label two streamlines and subtract. Equivalently, $q = \int (u\,dy - v\,dx)$ along **any** path from streamline 1 to streamline 2; the sign says which way the fluid crosses.`,
    src: S14,
  },
  {
    id: 'speed-spacing',
    name: 'Speed from streamline spacing',
    tex: md`|\vb V| = |\nabla\psi| = \pd{\psi}{n} \approx \frac{\Delta\psi}{\Delta n}`,
    vars: [
      { sym: md`|\vb V|`, desc: 'local flow speed', units: md`\mathrm{m/s}` },
      { sym: md`\nabla\psi`, desc: md`gradient of $\psi$: perpendicular to the streamlines, pointing to the **left** of the flow direction`, units: md`\mathrm{m/s}` },
      { sym: md`n`, desc: md`distance normal to the streamlines, measured towards increasing $\psi$`, units: md`\mathrm{m}` },
      { sym: md`\Delta\psi,\ \Delta n`, desc: 'difference in ψ, and spacing, between two neighbouring streamlines', units: md`\mathrm{m^2/s},\ \mathrm{m}` },
    ],
    conditions: [
      'plane, incompressible flow',
      md`$\Delta n$ small compared with the distance over which the speed changes (otherwise $\Delta\psi/\Delta n$ is a gap-averaged speed)`,
    ],
    use: md`Streamlines drawn at equal steps $\Delta\psi$ work as a speedometer: where they crowd together the flow is fast, where they spread apart it is slow.`,
  },
  {
    id: 'continuity-polar',
    name: 'Continuity in polar coordinates (plane, incompressible)',
    tex: md`\frac{1}{r}\pd{(r v_r)}{r} + \frac{1}{r}\pd{v_\theta}{\theta} = 0`,
    vars: [
      { sym: md`r`, desc: 'radial distance from the origin', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: md`polar angle, measured counter-clockwise from the $+x$ axis`, units: md`\mathrm{rad}` },
      { sym: md`v_r`, desc: 'radial velocity component (positive outward)', units: md`\mathrm{m/s}` },
      { sym: md`v_\theta`, desc: md`tangential velocity component (positive towards increasing $\theta$, i.e. counter-clockwise)`, units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'incompressible, plane, two-dimensional flow (Lecture 10, slide 2)',
      md`the plane form of the cylindrical continuity equation (Lecture 9, slide 11) — no $v_z$ term`,
      md`$r > 0$: the origin is excluded (sources and vortices are singular there)`,
    ],
    use: md`The polar existence test: if this sum is not zero, no stream function $\psi(r, \theta)$ exists.`,
    src: L10,
  },
  {
    id: 'psi-polar',
    name: 'Stream function in polar coordinates',
    key: true,
    tex: md`v_r = \frac{1}{r}\pd{\psi}{\theta}, \qquad v_\theta = -\pd{\psi}{r}`,
    vars: [
      { sym: md`\psi(r, \theta)`, desc: 'the same stream function, written in polar coordinates', units: md`\mathrm{m^2/s}` },
      { sym: md`v_r,\ v_\theta`, desc: 'radial and tangential velocity components', units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      'incompressible, plane, two-dimensional flow',
      md`identical to the Cartesian definition after substituting $x = r\cos\theta$, $y = r\sin\theta$`,
      'satisfies the polar continuity equation identically (the mixed derivatives cancel)',
    ],
    use: md`Use it for flows with a natural centre — sources, sinks, vortices, flow round a cylinder (Unit B). Exam trap: the $1/r$ goes with the $\theta$-derivative (on $v_r$) and the minus sign with the $r$-derivative (on $v_\theta$).`,
    src: L10,
  },
  {
    id: 'cart-polar',
    name: 'Cartesian ↔ polar velocity components',
    tex: md`\begin{aligned} v_r &= u\cos\theta + v\sin\theta, & v_\theta &= -u\sin\theta + v\cos\theta \\ u &= v_r\cos\theta - v_\theta\sin\theta, & v &= v_r\sin\theta + v_\theta\cos\theta \end{aligned}`,
    vars: [
      { sym: md`u,\ v`, desc: 'Cartesian velocity components', units: md`\mathrm{m/s}` },
      { sym: md`v_r,\ v_\theta`, desc: 'polar velocity components', units: md`\mathrm{m/s}` },
      { sym: md`\theta`, desc: 'polar angle of the point', units: md`\mathrm{rad}` },
    ],
    conditions: [
      'pure geometry — valid for any velocity field',
      md`unit vectors $\hat{\mathbf e}_r = (\cos\theta, \sin\theta)$ and $\hat{\mathbf e}_\theta = (-\sin\theta, \cos\theta)$`,
    ],
    use: md`Project the velocity onto $\hat{\mathbf e}_r$ and $\hat{\mathbf e}_\theta$ (or back again). Handy for checking a polar result against the Cartesian form of the same $\psi$.`,
  },
  {
    id: 'psi-axisym',
    name: 'Axisymmetric (Stokes) stream function',
    tex: md`v_r = -\frac{1}{r}\pd{\psi}{z}, \qquad v_z = \frac{1}{r}\pd{\psi}{r}, \qquad Q = 2\pi\,(\psi_2 - \psi_1)`,
    vars: [
      { sym: md`r,\ z`, desc: 'distance from the symmetry axis and axial coordinate (cylindrical coordinates)', units: md`\mathrm{m}` },
      { sym: md`v_r,\ v_z`, desc: md`radial and axial velocity components (no swirl, $v_\theta = 0$)`, units: md`\mathrm{m/s}` },
      { sym: md`\psi(r, z)`, desc: 'Stokes stream function', units: md`\mathrm{m^3/s}` },
      { sym: md`Q`, desc: md`volume flow rate between the stream surfaces $\psi_1$ and $\psi_2$`, units: md`\mathrm{m^3/s}` },
    ],
    conditions: [
      md`axisymmetric, incompressible flow: nothing depends on $\theta$`,
      md`satisfies $\frac{1}{r}\pd{(r v_r)}{r} + \pd{v_z}{z} = 0$ identically`,
      'sign conventions (and factors of 2π) differ between textbooks — always check which one is in use',
    ],
    use: md`Example: uniform flow $v_z = U$ along a pipe of radius $R$ gives $\psi = Ur^2/2$, so $Q = 2\pi[\psi(R) - \psi(0)] = \pi R^2 U$ — the familiar result.`,
  },
  {
    id: 'psi-compressible',
    name: 'Stream function for steady, compressible plane flow',
    tex: md`\rho u = \pd{\psi}{y}, \qquad \rho v = -\pd{\psi}{x}`,
    vars: [
      { sym: md`\rho`, desc: 'density, allowed to vary from point to point', units: md`\mathrm{kg/m^3}` },
      { sym: md`\rho u,\ \rho v`, desc: md`mass fluxes in the $x$ and $y$ directions`, units: md`\mathrm{kg/(m^2\,s)}` },
      { sym: md`\psi`, desc: md`mass-based stream function; $\Delta\psi$ is a mass flow rate per unit depth`, units: md`\mathrm{kg/(m\,s)}` },
    ],
    conditions: [
      md`steady ($\partial\rho/\partial t = 0$), plane flow`,
      md`satisfies $\pd{(\rho u)}{x} + \pd{(\rho v)}{y} = 0$ identically — the steady compressible continuity equation of Lecture 9, slide 10`,
      md`some texts divide by a reference density $\rho_0$ so that $\psi$ keeps the units $\mathrm{m^2/s}$`,
    ],
    use: md`Same algebra as the incompressible case with $\rho u$, $\rho v$ in place of $u$, $v$; lines of constant $\psi$ are still streamlines.`,
  },
  {
    id: 'psi-3d',
    name: 'General 3-D flow needs two stream functions',
    tex: md`\vb V = \nabla\chi_1 \times \nabla\chi_2 \qquad \left(\text{plane flow: } \chi_1 = \psi,\ \chi_2 = z \;\Rightarrow\; \vb V = \nabla\psi \times \hat{\mathbf k}\right)`,
    vars: [
      {
        sym: md`\chi_1,\ \chi_2`,
        desc: md`two independent scalar stream functions; each family of surfaces $\chi = \text{const}$ consists of stream surfaces, and streamlines are where they intersect`,
      },
      { sym: md`\hat{\mathbf k}`, desc: md`unit vector along $z$` },
    ],
    conditions: [
      md`incompressible flow: $\nabla\cdot(\nabla\chi_1 \times \nabla\chi_2) = 0$ for any smooth $\chi_1$, $\chi_2$`,
      md`with $\chi_1 = \psi(x, y)$, $\chi_2 = z$ it reduces to $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$`,
    ],
    use: md`Explains the word *single* on Lecture 10, slide 2: after continuity, a 3-D incompressible velocity field still has two free scalar "degrees of freedom", so one stream function cannot represent it.`,
  },
]

/* -------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-def-velocity',
    concept: 'definition',
    title: 'From ψ to the velocity field (with a continuity check)',
    difficulty: 1,
    given: md`A plane, incompressible flow has stream function $\psi = 2x^2y + y^2$ ($\psi$ in $\mathrm{m^2/s}$ when $x$ and $y$ are in metres).`,
    find: md`(a) $u(x, y)$ and $v(x, y)$; (b) show that continuity is satisfied; (c) the velocity, speed and flow direction at $(1, 2)$ m.`,
    steps: [
      {
        title: 'Differentiate with the course convention',
        md: md`
          $$
          u = \pd{\psi}{y} = 2x^2 + 2y, \qquad v = -\pd{\psi}{x} = -4xy
          $$

          The minus sign belongs to $v$: $\pd{\psi}{x} = 4xy$, so $v = -4xy$.
        `,
      },
      {
        title: 'Check continuity term by term',
        md: md`
          $$
          \pd{u}{x} = 4x, \qquad \pd{v}{y} = -4x \quad\Longrightarrow\quad \pd{u}{x} + \pd{v}{y} = 4x - 4x = 0
          $$

          It cancels at every point — not by luck: $\pd{u}{x} = \frac{\partial^2\psi}{\partial x\,\partial y} = 4x$ and $\pd{v}{y} = -\frac{\partial^2\psi}{\partial y\,\partial x} = -4x$ are the two mixed derivatives of the same smooth function.
        `,
      },
      {
        title: 'Evaluate at (1, 2) m',
        md: md`
          $u = 2(1)^2 + 2(2) = 6\ \mathrm{m/s}, \qquad v = -4(1)(2) = -8\ \mathrm{m/s}$

          $|\vb V| = \sqrt{6^2 + (-8)^2} = \sqrt{100} = 10\ \mathrm{m/s}$
        `,
      },
      {
        title: 'Direction',
        md: md`$\alpha = \tan^{-1}(v/u) = \tan^{-1}(-8/6) = -53.1^\circ$: the fluid moves to the right and downward, $53.1^\circ$ below the $+x$ axis. (The particle there is on the streamline $\psi(1, 2) = 2 + 4 = 8\ \mathrm{m^2/s}$.)`,
      },
    ],
    answer: md`$u = 2x^2 + 2y$, $v = -4xy$ (continuity: $4x - 4x = 0$). At $(1, 2)$ m: $\vb V = (6, -8)$ m/s, $|\vb V| = 10$ m/s, directed $53.1^\circ$ below the $+x$ axis.`,
    insight: 'A velocity field obtained from ψ never needs a continuity check — it is guaranteed. Doing the check anyway is a quick way to catch a sign slip.',
  },
  {
    id: 'ex-def-find-v',
    concept: 'definition',
    title: 'Using continuity to find the missing component, then ψ',
    difficulty: 2,
    given: md`In a plane, incompressible flow above an impermeable wall at $y = 0$, the $x$-component of velocity is $u = x^2 + 2xy$ (m/s, with $x, y$ in m). No fluid passes through the wall, so $v = 0$ on $y = 0$.`,
    find: md`(a) $v(x, y)$; (b) the stream function, taking $\psi = 0$ on the wall; (c) $u$, $v$ and $\psi$ at $(1, 1)$ m.`,
    steps: [
      {
        title: 'Continuity fixes ∂v/∂y',
        md: md`$\pd{v}{y} = -\pd{u}{x} = -(2x + 2y)$`,
      },
      {
        title: 'Integrate in y and apply the wall condition',
        md: md`$v = -2xy - y^2 + g(x)$. On the wall $v(x, 0) = g(x) = 0$, so $v = -2xy - y^2$.`,
      },
      {
        title: 'Integrate u to start ψ',
        md: md`$\pd{\psi}{y} = u = x^2 + 2xy \;\Rightarrow\; \psi = x^2y + xy^2 + f(x)$ — the "constant" of a partial integration in $y$ may depend on $x$.`,
      },
      {
        title: 'Fix f(x) from v',
        md: md`
          $-\pd{\psi}{x} = -\left(2xy + y^2 + f'(x)\right)$ must equal $v = -2xy - y^2$, so $f'(x) = 0$ and $f = C$. The wall condition $\psi(x, 0) = C = 0$ gives

          $$
          \psi = x^2y + xy^2 = xy\,(x + y)
          $$
        `,
      },
      {
        title: 'Evaluate at (1, 1) m and sanity-check',
        md: md`$u = 1 + 2 = 3$ m/s, $v = -2 - 1 = -3$ m/s, $|\vb V| = 4.24$ m/s, $\psi = 1 + 1 = 2\ \mathrm{m^2/s}$. The wall $y = 0$ has $\psi = 0$ along its whole length — it is a streamline, as an impermeable wall must be (next concept).`,
      },
    ],
    answer: md`$v = -2xy - y^2$; $\psi = x^2y + xy^2 = xy(x + y)$; at $(1, 1)$ m: $u = 3$ m/s, $v = -3$ m/s, $\psi = 2\ \mathrm{m^2/s}$.`,
    insight: 'Continuity is what lets you recover a missing velocity component; the stream function then follows from "integrate one component, fix the leftover function with the other".',
  },
  {
    id: 'ex-sl-corner',
    concept: 'streamlines',
    title: 'The streamline through a point in corner flow',
    difficulty: 1,
    given: md`Plane flow into a corner, $\psi = 3xy$ ($\mathrm{m^2/s}$; $x, y$ in m), so $u = 3x$ and $v = -3y$.`,
    find: md`(a) The streamline through $P(1, 2)$ m; (b) its slope at $P$, from the curve and from $v/u$; (c) where the particle at $P$ is heading.`,
    steps: [
      {
        title: 'The streamline is a ψ contour',
        md: md`$\psi(P) = 3(1)(2) = 6\ \mathrm{m^2/s}$, so the streamline is $3xy = 6$, i.e. $xy = 2$ or $y = 2/x$ — a hyperbola.`,
      },
      {
        title: 'Slope from the curve',
        md: md`$\dfrac{dy}{dx} = -\dfrac{2}{x^2} = -2$ at $x = 1$.`,
      },
      {
        title: 'Slope from the velocity',
        md: md`$u = 3(1) = 3$ m/s, $v = -3(2) = -6$ m/s, so $v/u = -2$ — the same. The $\psi$ contour is tangent to $\vb V$, which is exactly the streamline property of slide 13.`,
      },
      {
        title: 'Direction and speed-up',
        md: md`$u > 0$, $v < 0$: the particle moves down and to the right along $y = 2/x$, towards the wall $y = 0$. Speed at $P$: $\sqrt{9 + 36} = 6.71$ m/s; further along, at $x = 4$ m ($y = 0.5$ m): $u = 12$, $v = -1.5$, $|\vb V| = 12.1$ m/s. Both axes are the streamline $\psi = 0$, so they can be replaced by solid walls — this is flow into a $90^\circ$ corner.`,
      },
    ],
    answer: md`$xy = 2$ (i.e. $y = 2/x$); slope $-2$ by both methods; the particle moves down-right towards the wall $y = 0$, accelerating from $6.71$ m/s at $P$ to $12.1$ m/s at $(4, 0.5)$ m.`,
    insight: 'For a streamline through a given point, evaluate ψ there and set ψ(x, y) equal to that value — no differential equation to solve.',
  },
  {
    id: 'ex-sl-wavy',
    concept: 'streamlines',
    title: 'Two routes to the same streamlines: integrate dy/dx = v/u, or contour ψ',
    difficulty: 2,
    given: md`A plane flow has $u = U = 2$ m/s and $v = V_0\sin(kx)$ with $V_0 = 0.5$ m/s and $k = \pi/2\ \mathrm{m^{-1}}$ — a gentle wave of wavelength 4 m, like air lifted over a row of roofs.`,
    find: md`(a) Check that a stream function exists; (b) the streamline shapes from $dy/dx = v/u$; (c) $\psi$, and show its contours are the same curves; (d) for the streamline through $(0, 1)$ m, its height at $x = 2$ m and its crest-to-trough height.`,
    steps: [
      {
        title: 'Existence',
        md: md`$\pd{u}{x} + \pd{v}{y} = 0 + 0 = 0$ ($v$ does not depend on $y$), so a stream function exists.`,
      },
      {
        title: 'Integrate the streamline equation',
        md: md`
          $$
          \frac{dy}{dx} = \frac{v}{u} = \frac{V_0}{U}\sin kx \;\Longrightarrow\; y = -\frac{V_0}{kU}\cos kx + C
          $$

          with $\dfrac{V_0}{kU} = \dfrac{0.5}{(\pi/2)(2)} = \dfrac{1}{2\pi} = 0.159$ m.
        `,
      },
      {
        title: 'Build ψ',
        md: md`
          $\pd{\psi}{y} = U \Rightarrow \psi = Uy + f(x)$; then $v = -f'(x) = V_0\sin kx \Rightarrow f = \dfrac{V_0}{k}\cos kx$:

          $$
          \psi = Uy + \frac{V_0}{k}\cos kx = 2y + \frac{1}{\pi}\cos\frac{\pi x}{2}
          $$

          Setting $\psi = \text{const}$ and solving for $y$: $y = \psi/U - \dfrac{V_0}{kU}\cos kx$ — the same family as before, with $C = \psi/U$. Two independent routes, identical curves.
        `,
      },
      {
        title: 'The streamline through (0, 1) m',
        md: md`$C = 1 + 0.159 = 1.159$ m, i.e. $\psi = UC = 2.318\ \mathrm{m^2/s}$. At $x = 2$ m, $\cos\pi = -1$: $y = 1.159 + 0.159 = 1.318$ m. Crest-to-trough height $= 2(0.159) = 0.318$ m.`,
      },
    ],
    answer: md`$\psi = 2y + \tfrac{1}{\pi}\cos(\pi x/2)$; streamlines $y = C - 0.159\cos(\pi x/2)$ m. Through $(0, 1)$ m: $\psi = 2.318\ \mathrm{m^2/s}$, height $1.318$ m at $x = 2$ m, crest-to-trough $0.318$ m.`,
    insight: 'Contouring ψ and integrating dy/dx = v/u always give the same curves — that is the content of "lines of constant ψ are streamlines".',
  },
  {
    id: 'ex-fr-couette',
    concept: 'flow-rate',
    title: 'Flow rate in plane Couette flow from ψ',
    difficulty: 1,
    given: md`Plane Couette flow: the lower plate ($y = 0$) is fixed and the upper plate ($y = h$) slides at $U = 2$ m/s; gap $h = 10$ mm. The velocity is $u = Uy/h$, $v = 0$. The channel is $b = 0.5$ m deep (normal to the page).`,
    find: md`(a) $\psi(y)$ with $\psi = 0$ on the lower plate; (b) the flow rate per unit depth and the total flow rate; (c) the height below which half of the flow passes.`,
    steps: [
      {
        title: 'Stream function',
        md: md`$\pd{\psi}{y} = \dfrac{Uy}{h} \Rightarrow \psi = \dfrac{Uy^2}{2h} + f(x)$; $v = -f'(x) = 0 \Rightarrow f$ = const $= 0$ (since $\psi = 0$ at $y = 0$).`,
      },
      {
        title: 'Both plates are streamlines',
        md: md`$\psi(0) = 0$ and $\psi(h) = Uh/2$, so

          $$
          q = \psi(h) - \psi(0) = \frac{Uh}{2} = \frac{(2)(0.010)}{2} = 0.010\ \mathrm{m^2/s}
          $$
        `,
      },
      {
        title: 'Total flow rate and cross-check',
        md: md`$Q = qb = 0.010 \times 0.5 = 5.0\times10^{-3}\ \mathrm{m^3/s} = 5.0$ L/s. Check by integrating the profile directly: $\int_0^h u\,dy = Uh/2$ ✓.`,
      },
      {
        title: 'Half of the flow',
        md: md`$\psi(y_{1/2}) = q/2 \Rightarrow \dfrac{Uy_{1/2}^2}{2h} = \dfrac{Uh}{4} \Rightarrow y_{1/2} = \dfrac{h}{\sqrt2} = 7.07$ mm. The upper half of the gap carries $\psi(h) - \psi(h/2) = 3Uh/8$, i.e. 75 % of the flow.`,
        fig: (
          <Plot
            x={{ label: md`height $y/h$`, domain: [0, 1] }}
            y={{ label: 'fraction', domain: [0, 1] }}
            series={[
              { label: md`velocity $u/U$`, fn: (s) => s },
              { label: md`$\psi/q$ = share of the flow below $y$`, fn: (s) => s * s },
            ]}
            vlines={[{ x: Math.SQRT1_2, label: 'y = h/√2' }]}
            hlines={[{ y: 0.5, label: 'half the flow' }]}
            height={230}
          />
        ),
      },
    ],
    answer: md`$\psi = Uy^2/(2h)$; $q = Uh/2 = 0.010\ \mathrm{m^2/s}$, $Q = 5.0\times10^{-3}\ \mathrm{m^3/s}$ (5 L/s); half of the flow passes below $y = h/\sqrt2 = 7.07$ mm.`,
    insight: 'Walls are streamlines, so "flow rate through a channel" is just ψ(wall 2) − ψ(wall 1).',
  },
  {
    id: 'ex-fr-corner',
    concept: 'flow-rate',
    title: 'Flow between two streamlines, checked by direct integration',
    difficulty: 2,
    given: md`Corner flow $\psi = 2xy$ ($\mathrm{m^2/s}$; $x, y$ in m), so $u = 2x$ and $v = -2y$. Points $A(1, 1)$ m and $B(2, 2)$ m.`,
    find: md`(a) The flow rate per metre of depth between the streamlines through $A$ and $B$, and its direction; (b) verify by integrating $u\,dy - v\,dx$ along the straight segment $AB$.`,
    steps: [
      {
        title: 'Label the two streamlines',
        md: md`$\psi_A = 2(1)(1) = 2\ \mathrm{m^2/s}$ (streamline $xy = 1$); $\psi_B = 2(2)(2) = 8\ \mathrm{m^2/s}$ (streamline $xy = 4$).`,
      },
      {
        title: 'Subtract',
        md: md`$q = \psi_B - \psi_A = 8 - 2 = 6\ \mathrm{m^2/s}$ — that is $6\ \mathrm{m^3/s}$ for every metre of depth.`,
      },
      {
        title: 'Direction',
        md: md`$q > 0$, so for someone walking from $A$ to $B$ the flow crosses the path from left to right (the slide 14 rule, stated without "upper/lower"). Check at the midpoint $(1.5, 1.5)$: $\vb V = (3, -3)$ m/s points down-right, i.e. to the right of the direction $A \to B$ ✓.`,
      },
      {
        title: 'Direct integration along AB',
        md: md`
          Parametrise $x = y = 1 + t$, $0 \le t \le 1$, so $dx = dy = dt$:

          $$
          u\,dy - v\,dx = \left[2(1 + t) + 2(1 + t)\right]dt = 4(1 + t)\,dt, \qquad \int_0^1 4(1 + t)\,dt = 4\left(1 + \tfrac12\right) = 6\ \mathrm{m^2/s}\ ✓
          $$
        `,
      },
    ],
    answer: md`$q = \psi_B - \psi_A = 6\ \mathrm{m^2/s}$ (6 m³/s per metre of depth), crossing $AB$ from its left to its right (down-right). The line integral gives the same 6 m²/s.`,
    insight: 'Subtracting two ψ values replaces a line integral — and the answer does not depend on the path chosen between the streamlines.',
  },
  {
    id: 'ex-pol-inclass',
    concept: 'polar-scope',
    title: 'Lecture 10 in-class problem: velocity components → stream function',
    difficulty: 2,
    src: { doc: 'lec10', pages: '2', note: 'in-class problem' },
    solutionBy: 'platform',
    given: md`The velocity components in a steady, incompressible, two-dimensional flow field are $u = 2y$ and $v = 4x$. (No units are printed; with $x, y$ in m and the coefficients in $\mathrm{s^{-1}}$, $\psi$ comes out in $\mathrm{m^2/s}$.)`,
    find: md`The corresponding stream function $\psi(x, y)$ — then read off the streamline pattern.`,
    steps: [
      {
        title: 'Check that a stream function exists',
        md: md`$\pd{u}{x} + \pd{v}{y} = 0 + 0 = 0$: the field satisfies plane, incompressible continuity, so a $\psi$ exists.`,
      },
      {
        title: 'Integrate u with respect to y',
        md: md`$\pd{\psi}{y} = u = 2y \;\Rightarrow\; \psi = y^2 + f(x)$. The "constant" of integration may depend on $x$ — keep it.`,
      },
      {
        title: 'Use v to find f(x)',
        md: md`$v = -\pd{\psi}{x} = -f'(x) = 4x \;\Rightarrow\; f'(x) = -4x \;\Rightarrow\; f(x) = -2x^2 + C$.`,
      },
      {
        title: 'Assemble and verify',
        md: md`
          $$
          \psi = y^2 - 2x^2 + C
          $$

          Check: $\pd{\psi}{y} = 2y = u$ ✓ and $-\pd{\psi}{x} = -(-4x) = 4x = v$ ✓. The constant $C$ has no effect on the velocity; take $C = 0$.
        `,
      },
      {
        title: 'Read off the streamlines',
        md: md`$y^2 - 2x^2 = \text{const}$: a family of hyperbolas. The streamline $\psi = 0$ is the pair of straight lines $y = \pm\sqrt2\,x$, crossing at the stagnation point $(0, 0)$. Directions: at $(0, 1)$, $\vb V = (2, 0)$ — to the right; at $(1, 0)$, $\vb V = (0, 4)$ — upward.`,
        fig: (
          <FlowField x={[-2, 2]} y={[-1.5, 1.5]} psi={inclassPsi} highlight={INCLASS_HL} markers={ORIGIN_STAG} particles={50} maxHeight={300} />
        ),
      },
      {
        title: 'A note on rotation',
        md: md`$\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(4 - 2) = 1\ \mathrm{s^{-1}} \ne 0$: the flow is **rotational**, yet $\psi$ exists — a stream function needs only continuity. (Such a field has no velocity potential; see the next topic.)`,
      },
    ],
    answer: md`$\psi = y^2 - 2x^2 + C$ (take $C = 0$). Streamlines are the hyperbolas $y^2 - 2x^2 = \text{const}$; $\psi = 0$ along $y = \pm\sqrt2\,x$.`,
    insight: 'The recipe never changes: check continuity → integrate one component → fix the arbitrary function with the other → differentiate back to verify.',
  },
  {
    id: 'ex-pol-corner',
    concept: 'polar-scope',
    title: 'Polar components from ψ — and the Cartesian cross-check',
    difficulty: 2,
    given: md`A plane flow has $\psi = 3r^2\sin 2\theta$ ($\mathrm{m^2/s}$, $r$ in m).`,
    find: md`(a) $v_r$ and $v_\theta$; (b) their values and the speed at $r = 2$ m, $\theta = 30^\circ$; (c) convert to $u$, $v$ and compare with the Cartesian form of the same $\psi$.`,
    steps: [
      {
        title: 'Differentiate (polar box)',
        md: md`$v_r = \dfrac{1}{r}\pd{\psi}{\theta} = \dfrac{1}{r}\left(6r^2\cos 2\theta\right) = 6r\cos 2\theta, \qquad v_\theta = -\pd{\psi}{r} = -6r\sin 2\theta$`,
      },
      {
        title: 'Polar continuity check',
        md: md`$\dfrac{1}{r}\pd{(rv_r)}{r} = \dfrac{1}{r}\pd{(6r^2\cos 2\theta)}{r} = 12\cos 2\theta$ and $\dfrac{1}{r}\pd{v_\theta}{\theta} = \dfrac{1}{r}\left(-12r\cos 2\theta\right) = -12\cos 2\theta$; the sum is $0$ ✓.`,
      },
      {
        title: 'Evaluate at r = 2 m, θ = 30° (2θ = 60°)',
        md: md`$v_r = 12\cos 60^\circ = 6.00$ m/s, $\quad v_\theta = -12\sin 60^\circ = -10.39$ m/s, $\quad |\vb V| = \sqrt{36 + 108} = 12.0$ m/s. The negative $v_\theta$ means motion in the clockwise (decreasing-$\theta$) direction.`,
      },
      {
        title: 'Convert to Cartesian components',
        md: md`$u = v_r\cos\theta - v_\theta\sin\theta = 6(0.866) + 10.39(0.5) = 10.39$ m/s; $\quad v = v_r\sin\theta + v_\theta\cos\theta = 6(0.5) - 10.39(0.866) = -6.00$ m/s.`,
      },
      {
        title: 'Cartesian route',
        md: md`$\sin 2\theta = 2\sin\theta\cos\theta$, so $\psi = 6(r\cos\theta)(r\sin\theta) = 6xy$, giving $u = 6x$, $v = -6y$. At $x = 2\cos 30^\circ = 1.732$ m, $y = 1$ m: $u = 10.39$ m/s, $v = -6.00$ m/s ✓ — the polar box is the same $\psi$ in different coordinates.`,
      },
    ],
    answer: md`$v_r = 6r\cos 2\theta$, $v_\theta = -6r\sin 2\theta$; at $(2\ \mathrm{m}, 30^\circ)$: $v_r = 6.00$ m/s, $v_\theta = -10.39$ m/s, $|\vb V| = 12.0$ m/s, i.e. $(u, v) = (10.39, -6.00)$ m/s — identical to the result from $\psi = 6xy$.`,
    insight: 'Polar and Cartesian formulas are two views of one ψ; converting the components is the quickest check of a polar calculation.',
  },
  {
    id: 'ex-pol-source',
    concept: 'polar-scope',
    title: 'A line source: polar velocity → ψ, and a multivalued stream function',
    difficulty: 3,
    given: md`A line source at the origin discharges $m = 12\ \mathrm{m^2/s}$ (volume per unit time per metre of depth) equally in all directions: $v_r = \dfrac{m}{2\pi r}$, $v_\theta = 0$.`,
    find: md`(a) Check polar continuity for $r > 0$; (b) find $\psi$; (c) the flow rate through the quarter sector $0 \le \theta \le \pi/2$, and $v_r$ at $r = 2$ m; (d) what happens to $\psi$ after one full turn round the source?`,
    steps: [
      {
        title: 'Continuity',
        md: md`$rv_r = m/2\pi$ is constant, so $\dfrac{1}{r}\pd{(rv_r)}{r} = 0$; and $v_\theta = 0$. The sum is zero for every $r > 0$ ✓.`,
      },
      {
        title: 'Find ψ',
        md: md`$v_\theta = -\pd{\psi}{r} = 0 \Rightarrow \psi = \psi(\theta)$ only. Then $v_r = \dfrac{1}{r}\dfrac{d\psi}{d\theta} = \dfrac{m}{2\pi r} \Rightarrow \dfrac{d\psi}{d\theta} = \dfrac{m}{2\pi} \Rightarrow \psi = \dfrac{m\theta}{2\pi} + C$. The streamlines $\theta = \text{const}$ are radial rays.`,
      },
      {
        title: 'Flow through a quarter sector',
        md: md`$q = \psi(\pi/2) - \psi(0) = \dfrac{m}{2\pi}\cdot\dfrac{\pi}{2} = \dfrac{m}{4} = 3.0\ \mathrm{m^2/s}$. At $r = 2$ m: $v_r = \dfrac{12}{2\pi(2)} = 0.955$ m/s. Check across the arc $r = 2$ m: $v_r \times (r\,\Delta\theta) = 0.955 \times (2 \times \pi/2) = 3.0\ \mathrm{m^2/s}$ ✓ — the same at every radius.`,
      },
      {
        title: 'One turn round the source',
        md: md`As $\theta$ goes from $0$ to $2\pi$, $\psi$ rises by $m = 12\ \mathrm{m^2/s}$ and does not return to its starting value: $\psi$ is **multivalued**. No contradiction — the origin itself violates continuity (fluid is created there at rate $m$), so the region round it has a hole. In practice a branch cut (a ray along which $\psi$ jumps by $m$) is placed where it does no harm.`,
      },
    ],
    answer: md`$\psi = \dfrac{m\theta}{2\pi} + C$; quarter-sector flow $q = m/4 = 3.0\ \mathrm{m^2/s}$; $v_r = 0.955$ m/s at $r = 2$ m; once round the source $\psi$ increases by $m$.`,
    insight: 'A jump of ψ round a closed loop measures the net flow created inside it — zero for any loop that does not enclose a source or sink.',
  },
]

/* -------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  {
    id: 'p-def-velocity',
    concept: 'definition',
    difficulty: 1,
    q: md`A plane, incompressible flow has $\psi = 3x^2y - 2y$ ($\mathrm{m^2/s}$; $x, y$ in m). (a) Find $u$ and $v$. (b) Verify continuity. (c) Find the speed at $(2, 1)$ m. (d) Locate the stagnation points ($u = v = 0$).`,
    hint: md`$u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$. For (d), $v = 0$ needs $x = 0$ or $y = 0$ — test both.`,
    answer: md`$u = 3x^2 - 2$, $v = -6xy$; $|\vb V| = 15.6$ m/s at $(2, 1)$ m; stagnation points $(\pm 0.816, 0)$ m.`,
    solution: md`
      **(a)** $u = \pd{\psi}{y} = 3x^2 - 2$, $\quad v = -\pd{\psi}{x} = -6xy$.

      **(b)** $\pd{u}{x} + \pd{v}{y} = 6x - 6x = 0$ ✓ — automatic for any $\psi$.

      **(c)** At $(2, 1)$: $u = 3(4) - 2 = 10$ m/s, $v = -6(2)(1) = -12$ m/s, so $|\vb V| = \sqrt{10^2 + 12^2} = \sqrt{244} = 15.6$ m/s, directed $50.2^\circ$ below the $+x$ axis.

      **(d)** $v = -6xy = 0$ requires $x = 0$ or $y = 0$. With $x = 0$: $u = -2 \ne 0$ ✗. With $y = 0$: $u = 3x^2 - 2 = 0 \Rightarrow x = \pm\sqrt{2/3} = \pm 0.816$ m. Stagnation points: $(\pm 0.816, 0)$ m.
    `,
    check: [
      { label: md`$|\vb V|$ at $(2, 1)$`, value: 15.62, units: md`\mathrm{m/s}` },
      { label: 'positive stagnation-point x', value: 0.8165, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'p-def-find-psi',
    concept: 'definition',
    difficulty: 2,
    q: md`A plane flow has $u = x + y$ and $v = x - y$ (m/s; $x, y$ in m). Show that a stream function exists, find it (take $\psi = 0$ at the origin) and evaluate $\psi$ at $(1, 2)$ m. What does that value mean physically?`,
    hint: md`Check $\pd{u}{x} + \pd{v}{y}$ first. Then integrate $u$ with respect to $y$ and add an unknown $f(x)$.`,
    answer: md`$\psi = xy + \tfrac12(y^2 - x^2)$; $\psi(1, 2) = 3.5\ \mathrm{m^2/s}$ — the flow per metre of depth between the streamlines through the origin and through $(1, 2)$.`,
    solution: md`
      1. Continuity: $\pd{u}{x} + \pd{v}{y} = 1 + (-1) = 0$, so a stream function exists.
      2. $\pd{\psi}{y} = u = x + y \;\Rightarrow\; \psi = xy + \tfrac12 y^2 + f(x)$.
      3. $-\pd{\psi}{x} = -\left(y + f'(x)\right)$ must equal $v = x - y$, so $f'(x) = -x$ and $f = -\tfrac12 x^2 + C$. With $\psi(0, 0) = 0$, $C = 0$.
      4. $\psi = xy + \tfrac12(y^2 - x^2)$. Check: $\pd{\psi}{y} = x + y$ ✓, $-\pd{\psi}{x} = -(y - x) = x - y$ ✓.
      5. $\psi(1, 2) = 2 + \tfrac12(4 - 1) = 3.5\ \mathrm{m^2/s}$. Since $\psi = 0$ on the streamline through the origin, $3.5\ \mathrm{m^3/s}$ per metre of depth flows between that streamline and the one through $(1, 2)$.
    `,
    check: [{ label: md`$\psi(1, 2)$`, value: 3.5, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'p-def-sign-trap',
    concept: 'definition',
    difficulty: 3,
    q: md`A student writes the velocity of $\psi = 2xy$ ($\mathrm{m^2/s}$) as $u = \pd{\psi}{y}$, $v = +\pd{\psi}{x}$ — forgetting the minus sign. (a) Compute $\pd{u}{x} + \pd{v}{y}$ for the student's field and for the correct one. (b) Show that, for any $\psi$, the wrong sign gives $\nabla\cdot\vb V = 2\,\dfrac{\partial^2\psi}{\partial x\,\partial y}$. (c) For a plane element of area $\delta A$, the dilatation rate is $\dfrac{1}{\delta A}\dfrac{d(\delta A)}{dt} = \nabla\cdot\vb V$. By what factor would an element's area grow in $0.1$ s in the student's field?`,
    hint: md`In (c) the dilatation rate is the same everywhere, so $\delta A(t) = \delta A_0\,e^{(\nabla\cdot\vb V)\,t}$.`,
    answer: md`Student: $\nabla\cdot\vb V = 4\ \mathrm{s^{-1}}$ (correct field: $0$); in general $2\psi_{xy}$; area grows by $e^{0.4} = 1.49$ in $0.1$ s — impossible for an incompressible fluid.`,
    solution: md`
      **(a)** Student: $u = 2x$, $v = +2y$, so $\nabla\cdot\vb V = 2 + 2 = 4\ \mathrm{s^{-1}}$. Correct: $u = 2x$, $v = -2y$, so $2 - 2 = 0$.

      **(b)** With the wrong sign: $\pd{u}{x} + \pd{v}{y} = \pd{}{x}\left(\pd{\psi}{y}\right) + \pd{}{y}\left(\pd{\psi}{x}\right) = 2\,\dfrac{\partial^2\psi}{\partial x\,\partial y}$. The mixed derivatives now **add** instead of cancelling, so continuity fails unless $\psi_{xy}$ happens to vanish.

      **(c)** $\dfrac{1}{\delta A}\dfrac{d(\delta A)}{dt} = 4\ \mathrm{s^{-1}}$ everywhere, so $\delta A = \delta A_0\,e^{4t}$ and after $0.1$ s, $\delta A/\delta A_0 = e^{0.4} = 1.49$ — every element swelling by 49 % in a tenth of a second, which no incompressible fluid can do. (Even when $\psi_{xy} = 0$, as in rigid rotation, the wrong sign turns $\vb V$ away from the $\psi$ contours, so they would no longer be streamlines.)
    `,
    check: [
      { label: md`student's $\nabla\cdot\vb V$`, value: 4, units: md`\mathrm{s^{-1}}` },
      { label: md`area ratio after $0.1$ s`, value: 1.492 },
    ],
  },
  {
    id: 'p-sl-point',
    concept: 'streamlines',
    difficulty: 1,
    q: md`For the plane flow $\psi = 2xy$ ($\mathrm{m^2/s}$), find the equation of the streamline through $(2, 3)$ m and its slope $dy/dx$ there. Confirm the slope with $v/u$.`,
    hint: 'Evaluate ψ at the point to find which contour you are on.',
    answer: md`$xy = 6$ (i.e. $y = 6/x$); slope $= -1.5$ from the curve and from $v/u = -6/4$.`,
    solution: md`
      $\psi(2, 3) = 12$, so the streamline is $2xy = 12$, i.e. $xy = 6$ or $y = 6/x$.

      Slope of the curve: $\dfrac{dy}{dx} = -\dfrac{6}{x^2} = -\dfrac{6}{4} = -1.5$.

      Velocity: $u = \pd{\psi}{y} = 2x = 4$ m/s, $v = -\pd{\psi}{x} = -2y = -6$ m/s, so $v/u = -1.5$ ✓. The $\psi$ contour is tangent to $\vb V$ — it is the streamline.
    `,
    check: [{ label: md`slope $dy/dx$`, value: -1.5 }],
  },
  {
    id: 'p-sl-two-routes',
    concept: 'streamlines',
    difficulty: 2,
    q: md`A plane flow has $u = 3$ m/s and $v = 2x$ m/s ($x$ in m). (a) Find $\psi$, taking $\psi = 0$ at the origin. (b) Find the streamline through the origin in two ways: from $\psi$, and by integrating $dy/dx = v/u$. (c) How high is that streamline at $x = 3$ m?`,
    hint: md`$\pd{\psi}{y} = 3$ gives $\psi = 3y + f(x)$; then use $v = -\pd{\psi}{x}$.`,
    answer: md`$\psi = 3y - x^2$; the streamline through the origin is $y = x^2/3$; $y = 3$ m at $x = 3$ m.`,
    solution: md`
      **(a)** Continuity: $0 + 0 = 0$ ✓. $\psi = 3y + f(x)$ and $-f'(x) = 2x$ give $f = -x^2$, so $\psi = 3y - x^2$.

      **(b)** From $\psi$: $\psi(0, 0) = 0$, so $3y - x^2 = 0$, i.e. $y = x^2/3$. From the ODE: $\dfrac{dy}{dx} = \dfrac{2x}{3} \Rightarrow y = \dfrac{x^2}{3} + C$, and $C = 0$ through the origin. The same parabola either way.

      **(c)** $y(3) = 9/3 = 3$ m.
    `,
    check: [{ label: md`$y$ at $x = 3$ m`, value: 3, units: md`\mathrm{m}` }],
  },
  {
    id: 'p-sl-crossing',
    concept: 'streamlines',
    difficulty: 3,
    q: md`For $\psi = x^2 - 3y^2$ ($\mathrm{m^2/s}$): (a) find $u$, $v$ and the stagnation point; (b) show that the streamline $\psi = 0$ consists of two straight lines crossing at the stagnation point and find the angle they make with the $x$-axis; (c) explain why this does not contradict "streamlines cannot cross"; (d) in the first quadrant, does fluid move towards or away from the stagnation point along $\psi = 0$?`,
    hint: 'Tangency needs a velocity direction — what is the velocity at the crossing point?',
    answer: md`$u = -6y$, $v = -2x$, stagnation at the origin; $\psi = 0$ is $y = \pm x/\sqrt3$, lines at $\pm 30^\circ$; they meet only where $\vb V = 0$ and carry the same value $\psi = 0$; in the first quadrant fluid approaches the origin.`,
    solution: md`
      **(a)** $u = \pd{\psi}{y} = -6y$, $v = -\pd{\psi}{x} = -2x$; both vanish only at $(0, 0)$.

      **(b)** $x^2 - 3y^2 = 0 \Rightarrow y = \pm x/\sqrt3$, and $\tan\alpha = 1/\sqrt3 \Rightarrow \alpha = \pm 30^\circ$.

      **(c)** Tangency, $dy/dx = v/u$, fixes a unique direction only where $\vb V \ne 0$. At a stagnation point $v/u = 0/0$ is undefined, so several streamlines can meet there — and they carry the same $\psi$, so $\psi$ is still single-valued. Away from stagnation points two streamlines can never meet.

      **(d)** On $y = x/\sqrt3$, e.g. at $(\sqrt3, 1)$ m: $u = -6$ m/s, $v = -3.46$ m/s, pointing back along the line towards the origin — fluid **approaches**. (On $y = -x/\sqrt3$ in the fourth quadrant, at $(\sqrt3, -1)$ m: $u = 6$, $v = -3.46$ m/s — fluid leaves.)
    `,
    check: [{ label: 'angle of the dividing streamlines', value: 30, units: md`{}^\circ` }],
  },
  {
    id: 'p-fr-uniform',
    concept: 'flow-rate',
    difficulty: 1,
    q: md`Uniform flow $u = U = 3$ m/s, $v = 0$. (a) Find $\psi$ with $\psi = 0$ on $y = 0$. (b) What volume flow rate per metre of depth passes between the streamlines through $y = 1$ m and $y = 2.5$ m? (c) What is the total flow rate between them in a channel $2$ m deep?`,
    answer: md`$\psi = 3y$; $q = 4.5\ \mathrm{m^2/s}$; $Q = 9.0\ \mathrm{m^3/s}$.`,
    solution: md`
      **(a)** $\psi = Uy = 3y$ ($\pd{\psi}{y} = 3 = u$ ✓, $-\pd{\psi}{x} = 0 = v$ ✓).

      **(b)** $\psi_1 = 3(1) = 3\ \mathrm{m^2/s}$, $\psi_2 = 3(2.5) = 7.5\ \mathrm{m^2/s}$, so $q = 7.5 - 3 = 4.5\ \mathrm{m^2/s}$. Check: $U \times \text{gap} = 3 \times 1.5 = 4.5$ ✓. With $\psi_2$ the upper line and $\psi_2 > \psi_1$, the flow is left to right — consistent with $u > 0$.

      **(c)** $Q = qb = 4.5 \times 2 = 9.0\ \mathrm{m^3/s}$.
    `,
    check: [
      { label: 'q per metre of depth', value: 4.5, units: md`\mathrm{m^2/s}` },
      { label: 'Q for 2 m depth', value: 9, units: md`\mathrm{m^3/s}` },
    ],
  },
  {
    id: 'p-fr-segment',
    concept: 'flow-rate',
    difficulty: 2,
    q: md`For corner flow $\psi = 3xy$ ($\mathrm{m^2/s}$), find the volume flow rate per metre of depth crossing the straight segment from $P_1(0, 2)$ m to $P_2(2, 2)$ m, and state which way it crosses. Verify by integrating $u\,dy - v\,dx$ along the segment.`,
    hint: md`$q = \psi(P_2) - \psi(P_1)$. Along this segment $dy = 0$.`,
    answer: md`$q = 12\ \mathrm{m^2/s}$, crossing downward (from the left to the right of the direction $P_1 \to P_2$).`,
    solution: md`
      $\psi(P_1) = 0$ ($P_1$ lies on the axis streamline $x = 0$) and $\psi(P_2) = 3(2)(2) = 12\ \mathrm{m^2/s}$, so $q = 12 - 0 = 12\ \mathrm{m^2/s}$.

      Direction: $q > 0$, so walking from $P_1$ to $P_2$ (in the $+x$ direction) the flow crosses from your left ($+y$ side) to your right ($-y$ side): **downward**. Indeed $v = -3y = -6$ m/s $< 0$ on the segment.

      Integral: $dy = 0$, so $dq = -v\,dx = 3y\,dx = 6\,dx$ and $\int_0^2 6\,dx = 12\ \mathrm{m^2/s}$ ✓.
    `,
    check: [{ label: 'q', value: 12, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'p-fr-poiseuille',
    concept: 'flow-rate',
    difficulty: 2,
    q: md`Fully developed laminar flow between parallel plates at $y = \pm b$ has $u = u_{\max}\left(1 - y^2/b^2\right)$, $v = 0$, with $u_{\max} = 1.5$ m/s and $b = 20$ mm. (a) Find $\psi(y)$ with $\psi = 0$ on the centreline. (b) Find the flow rate per unit depth and the mean velocity. (c) What fraction of the flow passes through the central half of the channel, $|y| \le b/2$?`,
    hint: md`Integrate $u$ in $y$. The plates are the streamlines $\psi(\pm b)$.`,
    answer: md`$\psi = u_{\max}\left(y - \dfrac{y^3}{3b^2}\right)$; $q = \tfrac43 u_{\max}b = 0.040\ \mathrm{m^2/s}$; $\bar u = 1.0$ m/s; the central half carries $11/16 = 68.75\,\%$.`,
    solution: md`
      **(a)** $\pd{\psi}{y} = u_{\max}\left(1 - \dfrac{y^2}{b^2}\right) \Rightarrow \psi = u_{\max}\left(y - \dfrac{y^3}{3b^2}\right) + f(x)$; $v = 0$ makes $f$ a constant, and $\psi(0) = 0$ makes it zero.

      **(b)** $q = \psi(b) - \psi(-b) = 2u_{\max}\left(b - \dfrac{b}{3}\right) = \dfrac43 u_{\max}b = \dfrac43(1.5)(0.020) = 0.040\ \mathrm{m^2/s}$. Mean velocity: $\bar u = \dfrac{q}{2b} = \dfrac{0.040}{0.040} = 1.0$ m/s $= \tfrac23 u_{\max}$.

      **(c)** $\psi(b/2) - \psi(-b/2) = 2u_{\max}\left(\dfrac{b}{2} - \dfrac{b}{24}\right) = \dfrac{11}{12}u_{\max}b$, so the fraction is $\dfrac{11/12}{4/3} = \dfrac{11}{16} = 0.6875$.
    `,
    check: [
      { label: 'q', value: 0.04, units: md`\mathrm{m^2/s}` },
      { label: 'mean velocity', value: 1.0, units: md`\mathrm{m/s}` },
      { label: 'fraction in the central half', value: 0.6875 },
    ],
  },
  {
    id: 'p-fr-converging',
    concept: 'flow-rate',
    difficulty: 3,
    q: md`In a plane converging duct, the streamlines $\psi_1 = 0.6\ \mathrm{m^2/s}$ (lower) and $\psi_2 = 0.9\ \mathrm{m^2/s}$ (upper) are 15 cm apart at section 1 and 5 cm apart at section 2. (a) What flow rate per metre of depth passes between them, and in which direction? (b) Estimate the mean speed between the two streamlines at each section. (c) Why is this only an estimate?`,
    answer: md`$q = 0.30\ \mathrm{m^2/s}$, left to right; $\bar V_1 \approx 2.0$ m/s, $\bar V_2 \approx 6.0$ m/s.`,
    solution: md`
      **(a)** $q = \psi_2 - \psi_1 = 0.30\ \mathrm{m^2/s}$; $\psi_2$ is the upper line and $\psi_2 > \psi_1$, so the flow is left to right (slide 14).

      **(b)** No fluid crosses the streamlines, so the same $q$ passes every section of this "lane": $\bar V \approx q/\Delta n$. Section 1: $0.30/0.15 = 2.0$ m/s. Section 2: $0.30/0.05 = 6.0$ m/s — three times faster where the streamlines are three times closer.

      **(c)** $q/\Delta n$ is the *mean* normal velocity across the gap; it equals the local speed only if the speed is uniform across the gap and $\Delta n$ is measured perpendicular to the flow.
    `,
    check: [
      { label: md`$\bar V_1$`, value: 2.0, units: md`\mathrm{m/s}` },
      { label: md`$\bar V_2$`, value: 6.0, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'p-pol-spiral',
    concept: 'polar-scope',
    difficulty: 1,
    q: md`A plane flow has $\psi = 2\theta - 3\ln r$ ($\mathrm{m^2/s}$, $r$ in m). (a) Find $v_r$ and $v_\theta$. (b) Evaluate them, and the speed, at $r = 0.5$ m. (c) Describe the flow.`,
    hint: md`Use $v_r = \dfrac{1}{r}\pd{\psi}{\theta}$ and $v_\theta = -\pd{\psi}{r}$.`,
    answer: md`$v_r = 2/r$, $v_\theta = 3/r$; at $r = 0.5$ m: $v_r = 4$ m/s, $v_\theta = 6$ m/s, $|\vb V| = 7.21$ m/s — fluid spirals outward counter-clockwise (source + vortex).`,
    solution: md`
      **(a)** $v_r = \dfrac{1}{r}\pd{\psi}{\theta} = \dfrac{2}{r}$; $\quad v_\theta = -\pd{\psi}{r} = -\left(-\dfrac{3}{r}\right) = \dfrac{3}{r}$.

      **(b)** At $r = 0.5$ m: $v_r = 4.0$ m/s, $v_\theta = 6.0$ m/s, $|\vb V| = \sqrt{16 + 36} = \sqrt{52} = 7.21$ m/s.

      **(c)** $v_r > 0$ (outward) and $v_\theta > 0$ (counter-clockwise): fluid spirals outward. The angle between $\vb V$ and the radial direction is $\tan^{-1}(v_\theta/v_r) = \tan^{-1}1.5 = 56.3^\circ$ at every point, so the streamlines are logarithmic spirals. It is a line source ($\psi \propto \theta$) superposed on a vortex ($\psi \propto -\ln r$), both met again in Lecture 12. Polar continuity: $\frac1r\pd{(2)}{r} + \frac1r\pd{(3/r)}{\theta} = 0$ for $r > 0$ ✓.
    `,
    check: [
      { label: md`$v_r$`, value: 4, units: md`\mathrm{m/s}` },
      { label: md`$v_\theta$`, value: 6, units: md`\mathrm{m/s}` },
      { label: md`$|\vb V|$`, value: 7.211, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'p-pol-rotation',
    concept: 'polar-scope',
    difficulty: 2,
    q: md`A forced vortex (rigid-body rotation) has $v_r = 0$, $v_\theta = Kr$ with $K = 2\ \mathrm{s^{-1}}$. (a) Check polar continuity. (b) Find $\psi$ with $\psi = 0$ at $r = 0$. (c) Find $\psi_2 - \psi_1$ between the circles $r_1 = 1$ m and $r_2 = 2$ m, and interpret its sign by "walking from 1 to 2".`,
    hint: md`$v_\theta = -\pd{\psi}{r}$ fixes the $r$-dependence; $v_r = 0$ means $\psi$ cannot depend on $\theta$.`,
    answer: md`$\psi = -Kr^2/2 = -r^2$; $\psi_2 - \psi_1 = -3\ \mathrm{m^2/s}$: $3\ \mathrm{m^2/s}$ circulates between the circles, crossing an outward radial line from right to left (counter-clockwise).`,
    solution: md`
      **(a)** $\dfrac{1}{r}\pd{(r \cdot 0)}{r} + \dfrac{1}{r}\pd{(Kr)}{\theta} = 0 + 0 = 0$ ✓.

      **(b)** $-\pd{\psi}{r} = 2r \Rightarrow \psi = -r^2 + f(\theta)$; $v_r = \dfrac{1}{r}f'(\theta) = 0 \Rightarrow f = C = 0$. So $\psi = -r^2$ ($\mathrm{m^2/s}$).

      **(c)** $\psi_1 = -1$, $\psi_2 = -4$, so $q = \psi_2 - \psi_1 = -3\ \mathrm{m^2/s}$. Walking outward from circle 1 to circle 2 along the $+x$ axis, a negative $q$ means the flow crosses from your right ($-y$ side) to your left ($+y$ side) — counter-clockwise, consistent with $v_\theta = Kr > 0$. Magnitude check: $\int_1^2 v_\theta\,dr = \int_1^2 2r\,dr = \left[r^2\right]_1^2 = 3\ \mathrm{m^2/s}$ ✓.
    `,
    check: [{ label: md`$\psi_2 - \psi_1$`, value: -3, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'p-pol-inclass-polar',
    concept: 'polar-scope',
    difficulty: 2,
    q: md`Write the stream function of the Lecture 10 field, $\psi = y^2 - 2x^2$, in polar coordinates. Then find $v_r$ and $v_\theta$ at $r = 1$ m, $\theta = 45^\circ$, and check the result using $u = 2y$, $v = 4x$.`,
    hint: md`Substitute $x = r\cos\theta$, $y = r\sin\theta$. For the check use $v_r = u\cos\theta + v\sin\theta$ and $v_\theta = -u\sin\theta + v\cos\theta$.`,
    answer: md`$\psi = r^2(\sin^2\theta - 2\cos^2\theta)$; $v_r = 3r\sin 2\theta = 3$ m/s and $v_\theta = 2r(2\cos^2\theta - \sin^2\theta) = 1$ m/s at $(1\ \mathrm{m}, 45^\circ)$.`,
    solution: md`
      $\psi = r^2\sin^2\theta - 2r^2\cos^2\theta = r^2\left(\sin^2\theta - 2\cos^2\theta\right)$.

      $v_r = \dfrac{1}{r}\pd{\psi}{\theta} = \dfrac{1}{r}\,r^2\left(2\sin\theta\cos\theta + 4\cos\theta\sin\theta\right) = 6r\sin\theta\cos\theta = 3r\sin 2\theta$.

      $v_\theta = -\pd{\psi}{r} = -2r\left(\sin^2\theta - 2\cos^2\theta\right) = 2r\left(2\cos^2\theta - \sin^2\theta\right)$.

      At $r = 1$ m, $\theta = 45^\circ$: $v_r = 3\sin 90^\circ = 3.0$ m/s; $v_\theta = 2\left(2 \cdot \tfrac12 - \tfrac12\right) = 1.0$ m/s.

      Check: $x = y = 0.7071$ m, so $u = 2y = 1.414$ m/s and $v = 4x = 2.828$ m/s. Then $v_r = (1.414 + 2.828)(0.7071) = 3.0$ m/s ✓ and $v_\theta = (-1.414 + 2.828)(0.7071) = 1.0$ m/s ✓.
    `,
    check: [
      { label: md`$v_r$`, value: 3, units: md`\mathrm{m/s}` },
      { label: md`$v_\theta$`, value: 1, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'p-pol-scope',
    concept: 'polar-scope',
    difficulty: 3,
    q: md`Decide whether a **single** stream function can describe each flow, and say what kind of $\psi$ it would be. (a) $u = 2y$, $v = 4x$, $w = 0$. (b) $u = x$, $v = y$, $w = 0$, constant density. (c) Steady flow of a gas through a plane nozzle, with $\rho$ varying from point to point. (d) Incompressible flow in a pipe with $v_r(r, z)$, $v_z(r, z)$ and $v_\theta = 0$. (e) $u = yz$, $v = xz$, $w = xy$, constant density.`,
    hint: 'First write down what continuity looks like in each case, then count how many velocity components the stream function must generate.',
    answer: md`(a) yes — plane $\psi(x, y)$; (b) no — $\nabla\cdot\vb V = 2 \ne 0$; (c) yes — mass-based $\psi$; (d) yes — axisymmetric (Stokes) $\psi(r, z)$; (e) no single $\psi$: $\nabla\cdot\vb V = 0$, but the flow is genuinely three-dimensional.`,
    solution: md`
      **(a)** $\pd{u}{x} + \pd{v}{y} = 0$ and the flow is plane, so $\psi = y^2 - 2x^2$ (the Lecture 10 problem).

      **(b)** $\nabla\cdot\vb V = 1 + 1 = 2 \ne 0$: this is a uniform expansion, not an incompressible flow. No $\psi$ can produce it, because every velocity of the form $u = \psi_y$, $v = -\psi_x$ has zero divergence.

      **(c)** Steady compressible plane flow obeys $\pd{(\rho u)}{x} + \pd{(\rho v)}{y} = 0$ (Lecture 9, slide 10) — the same two-term structure, so $\rho u = \pd{\psi}{y}$, $\rho v = -\pd{\psi}{x}$ works and $\Delta\psi$ is a **mass** flow rate per unit depth. This is one of the extensions named on Lecture 10, slide 2.

      **(d)** Axisymmetric continuity $\frac1r\pd{(rv_r)}{r} + \pd{v_z}{z} = 0$ again has two terms, giving the Stokes stream function $\psi(r, z)$ — the other extension on slide 2.

      **(e)** $\nabla\cdot\vb V = 0 + 0 + 0 = 0$, so the flow is incompressible, but three components depend on all three coordinates. One scalar cannot generate them while satisfying continuity identically; a general 3-D flow needs two stream functions ($\vb V = \nabla\chi_1 \times \nabla\chi_2$). This is what slide 2 means by "not applicable to general three-dimensional flows using a single stream function".
    `,
  },
]

/* ------------------------------------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-def-sign',
    concept: 'definition',
    difficulty: 1,
    src: S12,
    q: 'Which pair defines the stream function ψ(x, y) in this course?',
    options: [
      md`$u = \pd{\psi}{y}$ and $v = -\pd{\psi}{x}$`,
      md`$u = \pd{\psi}{x}$ and $v = \pd{\psi}{y}$`,
      md`$u = \pd{\psi}{y}$ and $v = \pd{\psi}{x}$`,
      md`$u = -\pd{\psi}{x}$ and $v = \pd{\psi}{y}$`,
    ],
    answer: 0,
    explain: md`Slide 12 boxes $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$. Taking $u = \pd{\cdot}{x}$, $v = \pd{\cdot}{y}$ is how a velocity *potential* works, not $\psi$; and dropping the minus sign gives $\nabla\cdot\vb V = 2\psi_{xy} \ne 0$, violating continuity.`,
  },
  {
    id: 'q-def-why',
    concept: 'definition',
    difficulty: 2,
    src: S12,
    q: 'Why does every smooth ψ(x, y) automatically satisfy ∂u/∂x + ∂v/∂y = 0?',
    options: [
      'The two terms become ∂²ψ/∂x∂y and −∂²ψ/∂y∂x, and the mixed derivatives of a smooth function are equal',
      'Because the flow is assumed to be irrotational',
      'Because ψ is constant along streamlines',
      'Because the flow is steady, so the derivatives vanish',
    ],
    answer: 0,
    explain:
      'Substituting the definition gives ψ_xy − ψ_yx, which is zero for any function with continuous second derivatives. Irrotationality plays no part (rotational flows have a ψ too), and steadiness is not what makes the terms cancel.',
  },
  {
    id: 'q-def-units',
    concept: 'definition',
    difficulty: 1,
    q: 'In plane incompressible flow, what are the SI units of ψ?',
    options: ['m²/s', 'm³/s', 'm/s', 's⁻¹'],
    answer: 0,
    explain:
      'u = ∂ψ/∂y, so ψ has units (m/s)·m = m²/s — a volume flow rate per metre of depth. It becomes m³/s only after multiplying by a depth.',
  },
  {
    id: 'q-def-wrong-div',
    concept: 'definition',
    difficulty: 3,
    q: 'A student uses u = ∂ψ/∂y but forgets the minus sign (v = +∂ψ/∂x) for ψ = 3xy. What is ∂u/∂x + ∂v/∂y for the resulting field?',
    options: ['6 s⁻¹', '0', '3 s⁻¹', '−6 s⁻¹'],
    answer: 0,
    explain:
      'The student’s field is u = 3x, v = 3y, so the divergence is 3 + 3 = 6 s⁻¹ = 2∂²ψ/∂x∂y: volume would be created everywhere. With the correct v = −3y the sum is 3 − 3 = 0.',
  },
  {
    id: 'q-sl-dpsi',
    concept: 'streamlines',
    difficulty: 1,
    src: S13,
    q: 'Along a streamline, the change dψ is…',
    options: ['zero', 'equal to u dy', 'equal to the speed times the arc length', 'equal to v/u'],
    answer: 0,
    explain:
      'dψ = −v dx + u dy, and along a streamline dy/dx = v/u makes this zero — that is why ψ = const on streamlines. u dy alone is only part of dψ, and v/u is the slope, not a change in ψ.',
  },
  {
    id: 'q-sl-slope',
    concept: 'streamlines',
    difficulty: 2,
    q: 'For ψ = 3xy, what is the slope dy/dx of the streamline through (1, 2) m?',
    options: ['−2', '2', '−0.5', '0.5'],
    answer: 0,
    explain:
      'u = 3x = 3 and v = −3y = −6, so dy/dx = v/u = −2 (equivalently, xy = 2 ⇒ y = 2/x ⇒ dy/dx = −2/x² = −2). −0.5 is the inverted ratio u/v; +2 comes from losing the minus sign of v.',
  },
  {
    id: 'q-sl-cross',
    concept: 'streamlines',
    difficulty: 2,
    q: 'Can two streamlines with different values of ψ cross each other?',
    options: [
      'No — ψ is single-valued, so no point can lie on two different ψ contours; lines meet only at stagnation points, and those lines share one ψ value',
      'Yes, wherever the flow is rotational',
      'Yes, at every point where u = 0',
      'Yes, whenever the flow is unsteady',
    ],
    answer: 0,
    explain:
      'A point has one value of ψ, so it cannot sit on two contours with different values. Where V = 0 (a stagnation point) several branches of the same contour can meet. Rotation, u = 0 alone, or unsteadiness do not allow crossings.',
  },
  {
    id: 'q-sl-wall',
    concept: 'streamlines',
    difficulty: 2,
    q: 'A solid, impermeable wall in a plane flow is always…',
    options: [
      'a line of constant ψ (a streamline)',
      'a line on which ψ must equal zero',
      'a line along which ψ changes most rapidly',
      'a line on which the velocity is zero',
    ],
    answer: 0,
    explain:
      'No fluid crosses the wall, so dq = dψ = 0 along it and ψ is constant there — it is a streamline. The constant can be any value (0 is just a convenient choice), and in inviscid flow the fluid may still slide along the wall.',
  },
  {
    id: 'q-fr-value',
    concept: 'flow-rate',
    difficulty: 1,
    src: S14,
    q: 'Two streamlines have ψ₁ = 2.0 m²/s and ψ₂ = 3.5 m²/s. What volume flow rate per metre of depth passes between them?',
    options: ['1.5 m²/s', '5.5 m²/s', '1.75 m²/s', '7.0 m²/s'],
    answer: 0,
    explain: 'q = ψ₂ − ψ₁ = 1.5 m²/s (1.5 m³/s per metre of depth). The sum, ratio or product of the two values has no physical meaning.',
  },
  {
    id: 'q-fr-dir',
    concept: 'flow-rate',
    difficulty: 1,
    src: S14,
    q: 'On slide 14, ψ₂ is drawn as the upper streamline and ψ₁ as the lower one. If ψ₂ < ψ₁, the flow between them goes…',
    options: ['from right to left', 'from left to right', 'across the streamlines from 1 to 2', 'nowhere — q must be positive'],
    answer: 0,
    explain:
      'q = ψ₂ − ψ₁ < 0 means the flow runs the other way: right to left. Flow never crosses streamlines, and a negative q is perfectly meaningful — it is a direction.',
  },
  {
    id: 'q-fr-crowd',
    concept: 'flow-rate',
    difficulty: 2,
    q: 'Streamlines are drawn at equal intervals Δψ. Where they crowd together, the local speed is…',
    options: ['higher', 'lower', 'unchanged', 'zero'],
    answer: 0,
    explain:
      'The same flow Δψ squeezes through a narrower gap Δn, so the speed |V| ≈ Δψ/Δn rises. It is a common slip to think closely packed lines mean "slow, congested" flow — the opposite is true.',
  },
  {
    id: 'q-fr-path',
    concept: 'flow-rate',
    difficulty: 2,
    q: 'Fluid crosses a curve running from A (on ψ = 1 m²/s) to C (on ψ = 4 m²/s). The flow rate across the curve depends on…',
    options: [
      'only the end values: q = 3 m²/s whatever the shape of the curve',
      'the length of the curve — a longer curve collects more flow',
      'the shape of the curve between A and C',
      'the speeds at A and C',
    ],
    answer: 0,
    explain:
      'dq = dψ, so q = ψ_C − ψ_A = 3 m²/s for every curve joining the two streamlines. A longer or wigglier curve just collects inflow and outflow that cancel.',
  },
  {
    id: 'q-pol-comp',
    concept: 'polar-scope',
    difficulty: 1,
    src: L10,
    q: 'In polar coordinates (course convention), the stream function gives…',
    options: [
      md`$v_r = \dfrac{1}{r}\pd{\psi}{\theta}$, $\ v_\theta = -\pd{\psi}{r}$`,
      md`$v_r = \pd{\psi}{r}$, $\ v_\theta = \dfrac{1}{r}\pd{\psi}{\theta}$`,
      md`$v_r = -\pd{\psi}{r}$, $\ v_\theta = \dfrac{1}{r}\pd{\psi}{\theta}$`,
      md`$v_r = \pd{\psi}{\theta}$, $\ v_\theta = -r\pd{\psi}{r}$`,
    ],
    answer: 0,
    explain: md`Lecture 10, slide 2 boxes $v_r = \frac{1}{r}\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$. The form $v_r = \pd{\phi}{r}$, $v_\theta = \frac1r\pd{\phi}{\theta}$ belongs to the velocity potential (slide 8) — swapping them is the classic exam slip.`,
  },
  {
    id: 'q-pol-exists',
    concept: 'polar-scope',
    difficulty: 2,
    q: 'For which plane velocity field can a stream function ψ(x, y) be found?',
    options: [md`$u = 2y,\ v = 4x$`, md`$u = x,\ v = y$`, md`$u = 2xy,\ v = y^2$`, md`$u = x^2,\ v = -y^2$`],
    answer: 0,
    explain: md`Only $u = 2y$, $v = 4x$ satisfies $\pd{u}{x} + \pd{v}{y} = 0$. The others give $2$, $4y$ and $2x - 2y$ respectively — they violate continuity, so no $\psi$ exists for them.`,
  },
  {
    id: 'q-pol-3d',
    concept: 'polar-scope',
    difficulty: 2,
    src: L10,
    q: 'Lecture 10 says a single stream function cannot describe a general three-dimensional flow. The underlying reason is that…',
    options: [
      'after continuity, a 3-D velocity field still has two independent scalar "degrees of freedom", so two stream functions are needed',
      '3-D flows do not obey conservation of mass',
      '3-D flows are always rotational',
      'ψ would need units of m³/s, which is impossible',
    ],
    answer: 0,
    explain:
      'In plane flow one continuity equation links two components, leaving one degree of freedom — one ψ. In 3-D it links three, leaving two; the general form is V = ∇χ₁ × ∇χ₂. 3-D flows conserve mass perfectly well, and rotation is irrelevant.',
  },
  {
    id: 'q-pol-extend',
    concept: 'polar-scope',
    difficulty: 1,
    src: L10,
    q: 'Which extensions of the stream-function idea does Lecture 10 name?',
    options: [
      'Axisymmetric flows (pipes, bodies of revolution) and two-dimensional compressible flows',
      'General three-dimensional flows using a single ψ',
      'Only irrotational (potential) flows',
      'Only unsteady flows',
    ],
    answer: 0,
    explain:
      'Slide 2: the concept extends to axisymmetric flows such as pipe flow or flow round bodies of revolution, and to 2-D compressible flows — but not to general 3-D flow with a single ψ. Irrotationality is not required at all.',
  },
  {
    id: 'q-pol-rotational',
    concept: 'polar-scope',
    difficulty: 3,
    src: L10,
    q: 'The in-class field u = 2y, v = 4x has ω_z = 1 s⁻¹ (it is rotational). Does it have a stream function?',
    options: [
      'Yes — ψ needs only continuity, so ψ = y² − 2x² exists even though the flow is rotational',
      'No — a stream function exists only for irrotational flow',
      'Only if the flow is also inviscid',
      'Only after the rigid-body rotation is subtracted',
    ],
    answer: 0,
    explain:
      'The stream function comes from mass conservation, the velocity potential from irrotationality. This field satisfies continuity, so ψ = y² − 2x² exists; because it is rotational, it has no velocity potential.',
  },
]

/* ---------------------------------------------------------------------------------------- flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-def',
    front: 'Definition of the stream function (course sign convention)?',
    back: md`$u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ — for plane, incompressible flow. The minus sign is on $v$.`,
    src: S12,
  },
  {
    id: 'fc-identity',
    front: 'Why is continuity automatically satisfied once u and v come from ψ?',
    back: md`$\pd{}{x}(\psi_y) + \pd{}{y}(-\psi_x) = \psi_{xy} - \psi_{yx} = 0$: the mixed derivatives of a smooth function are equal.`,
    src: S12,
  },
  {
    id: 'fc-units',
    front: 'Units and physical meaning of ψ?',
    back: md`$\mathrm{m^2/s}$: differences of $\psi$ are volume flow rates per metre of depth. Only differences matter — $\psi$ is defined up to a constant.`,
  },
  {
    id: 'fc-streamline',
    front: 'Why are the lines ψ = const streamlines?',
    back: md`$d\psi = -v\,dx + u\,dy$; setting $d\psi = 0$ gives $dy/dx = v/u$ — exactly the streamline equation.`,
    src: S13,
  },
  {
    id: 'fc-wall',
    front: 'What is ψ on a solid wall?',
    back: 'A constant — no flow crosses the wall, so it is a streamline. The constant is often chosen as 0.',
  },
  {
    id: 'fc-q',
    front: 'Flow rate between the streamlines ψ₁ and ψ₂, and its direction?',
    back: md`$q = \psi_2 - \psi_1$ per unit depth. With $\psi_2$ the upper line: $\psi_2 > \psi_1$ ⇒ left to right; $\psi_2 < \psi_1$ ⇒ right to left.`,
    src: S14,
  },
  {
    id: 'fc-spacing',
    front: 'What does the spacing of equal-Δψ streamlines tell you?',
    back: md`The speed: $|\vb V| \approx \Delta\psi/\Delta n$. Crowded lines mean fast flow; widely spaced lines mean slow flow.`,
  },
  {
    id: 'fc-polar',
    front: 'Stream function in polar coordinates?',
    back: md`$v_r = \dfrac{1}{r}\pd{\psi}{\theta}$, $\quad v_\theta = -\pd{\psi}{r}$ (incompressible, plane flow).`,
    src: L10,
  },
  {
    id: 'fc-scope',
    front: 'Where does the stream-function concept apply, and where does it fail?',
    back: 'Plane incompressible flow; extendable to axisymmetric flows (pipes, bodies of revolution) and 2-D compressible flows. Not to general 3-D flow with a single ψ.',
    src: L10,
  },
  {
    id: 'fc-exist',
    front: 'Test for the existence of ψ for a given plane velocity field?',
    back: md`Continuity: $\pd{u}{x} + \pd{v}{y} = 0$. Irrotationality is **not** required.`,
  },
  {
    id: 'fc-inclass',
    front: 'Lecture 10 in-class problem: u = 2y, v = 4x. Stream function?',
    back: md`$\psi = y^2 - 2x^2 + C$ (hyperbolic streamlines; $\psi = 0$ on $y = \pm\sqrt2\,x$).`,
    src: L10,
  },
]

/* ---------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`For **plane, incompressible** flow the stream function is defined by $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ — the minus sign is on $v$.`,
  md`Continuity is then satisfied **identically** ($\psi_{xy} - \psi_{yx} = 0$): two unknown velocity components are replaced by one scalar, and mass conservation is built in.`,
  md`A $\psi$ exists **if and only if** $\pd{u}{x} + \pd{v}{y} = 0$ (in polar form, $\frac1r\pd{(rv_r)}{r} + \frac1r\pd{v_\theta}{\theta} = 0$). Rotational flows have one too.`,
  md`Lines of constant $\psi$ are streamlines: $d\psi = -v\,dx + u\,dy = 0 \Leftrightarrow dy/dx = v/u$. Solid walls and dividing streamlines are $\psi$ contours.`,
  md`$dq = u\,dy - v\,dx = d\psi$, so $q = \psi_2 - \psi_1$ (per unit depth, $\mathrm{m^2/s}$) between any two streamlines, whatever path joins them.`,
  md`Direction: with $\psi_2$ the upper streamline, $\psi_2 > \psi_1$ means flow from left to right; in general $\psi$ increases to the left of an observer moving with the flow.`,
  md`Streamlines drawn at equal $\Delta\psi$ show the speed: $|\vb V| = |\nabla\psi| \approx \Delta\psi/\Delta n$ — crowded lines mean fast flow.`,
  md`Velocity → $\psi$: check continuity, integrate $u$ in $y$, add $f(x)$, fix $f$ from $v$, verify. Lecture 10 problem: $u = 2y$, $v = 4x$ ⇒ $\psi = y^2 - 2x^2 + C$.`,
  md`Polar form: $v_r = \frac1r\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$. The idea extends to axisymmetric and 2-D compressible flows, but **no single** $\psi$ describes general 3-D flow.`,
  md`$\psi$ is fixed only up to an additive constant; only differences of $\psi$ are physical (and around a source, $\psi$ is multivalued).`,
]

/* ---------------------------------------------------------------------------------------------- content */

export default function Content() {
  return (
    <>
      {/* ================================================================ 1. definition */}
      <Concept id="definition">
        <Step kind="intro" src={S12}>
          <Md>{md`
            Slide 12 opens with a framing statement: **steady, incompressible, plane, two-dimensional** flow is one of the simplest types of flow. "Plane two-dimensional" means the velocity has no $z$-component ($w = 0$) and nothing varies with $z$, so the incompressible continuity equation $\nabla\cdot\vb V = 0$ (Lecture 9, slide 11) keeps just two terms:

            $$
            \pd{u}{x} + \pd{v}{y} = 0 .
            $$

            That is **one equation linking two unknown fields**, $u(x, y)$ and $v(x, y)$. The slide's idea is to trade the pair for a single scalar field $\psi(x, y)$ — the **stream function** — and to *define* the velocity from it:

            $$
            u = \pd{\psi}{y}, \qquad v = -\pd{\psi}{x}.
            $$

            Substituting into continuity leaves $\dfrac{\partial^2\psi}{\partial x\,\partial y} - \dfrac{\partial^2\psi}{\partial y\,\partial x}$, which is **zero for every smooth $\psi$**. Mass conservation stops being an equation you must solve and becomes a property built into the way the velocity is generated.
          `}</Md>
          <Callout kind="def" title="Stream function ψ(x, y)">
            <Md>{md`A scalar field whose derivatives give the velocity of a plane, incompressible flow: $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$. Units $\mathrm{m^2/s}$. It is fixed only up to an additive constant — adding $C$ changes no velocity — so only **differences** of $\psi$ carry physical meaning.`}</Md>
          </Callout>
          <Callout kind="note" title="Why it matters">
            <Md>{md`Everything in this topic grows from the definition: contours of $\psi$ are the **streamlines** (slide 13), differences of $\psi$ are **flow rates** (slide 14), and in Unit B every classic plane flow — uniform stream, source, vortex, flow round a cylinder — is described by writing down its $\psi$.`}</Md>
          </Callout>
          <Supplement title="Steady or unsteady?">
            <Md>{md`The slide frames the definition for steady flow, but the construction only uses $\pd{u}{x} + \pd{v}{y} = 0$, which also holds at every instant of an *unsteady* incompressible plane flow. Then $\psi = \psi(x, y, t)$, and its contours are the *instantaneous* streamlines (which need not coincide with particle paths).`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Picture 1 — a landscape.** Read $\psi(x, y)$ as the height of a terrain on a contour map. The definition says the velocity is the uphill direction $\nabla\psi = (\psi_x, \psi_y)$ **turned 90° clockwise**: $\vb V = (\psi_y, -\psi_x)$. So the fluid always walks *along* the contour lines — never up or down hill — and it moves faster where the terrain is steeper, $|\vb V| = |\nabla\psi|$. Walking with the flow, higher ground (larger $\psi$) is always on your left.

            **Picture 2 — a bookkeeping box.** Take any rectangle in the flow and label its corners with their $\psi$ values. The flow *out* through each face turns out to be simply the difference of $\psi$ between that face's two corners (for example, $\int u\,dy = \int \psi_y\,dy = \psi_3 - \psi_2$ through the right-hand face). Going round the box, every corner value is added once and subtracted once, so the net outflow is exactly zero — for any $\psi$, and for a box of any size. That is "continuity satisfied identically" in one picture.
          `}</Md>
          <Figure caption="✦ Face outflows of a rectangle are differences of the corner values of ψ; summed round the box they cancel exactly.">
            <CornerBoxFigure />
          </Figure>
          <Callout kind="tip" title="What you gain, and what it costs">
            <Md>{md`You gain: one unknown instead of two, and a velocity field that can never violate mass conservation. The cost: the trick works only when continuity has exactly two terms that can be "paired up" — plane flow (and, with modifications, axisymmetric or compressible plane flow; concept 4).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={S12}>
          <Figure caption="Slide 12's velocity triangle: V at a point is built from u = ∂ψ/∂y along x and v = −∂ψ/∂x along y." src={S12}>
            <VelocityTriangleFigure />
          </Figure>
          <Figure caption="✦ The same rule on a contour map of ψ = xy: V is ∇ψ turned 90° clockwise, so it runs along the contour through P and is exactly as long as the gradient.">
            <PsiGradientFigure />
          </Figure>
          <Md>{md`Reading the second figure: the amber arrow $\nabla\psi = (\psi_x, \psi_y)$ points uphill, across the contours. The definition rotates it by $90^\circ$ clockwise, $(\psi_x, \psi_y) \to (\psi_y, -\psi_x) = (u, v)$, so the velocity lies along the contour — which is why contours of $\psi$ will turn out to be streamlines (concept 2).`}</Md>
        </Step>

        <Step kind="equations" src={S12}>
          <FormulaCard id="continuity-2d" />
          <FormulaCard id="psi-def" />
          <Derivation
            title="Slide 12: why continuity is satisfied identically"
            steps={[
              { md: md`$\pd{u}{x} + \pd{v}{y} = 0$`, why: 'plane, incompressible continuity' },
              { md: md`$\pd{}{x}\left(\pd{\psi}{y}\right) + \pd{}{y}\left(-\pd{\psi}{x}\right)$`, why: md`substitute $u = \psi_y$, $v = -\psi_x$` },
              { md: md`$= \dfrac{\partial^2\psi}{\partial x\,\partial y} - \dfrac{\partial^2\psi}{\partial y\,\partial x}$`, why: 'carry out the differentiation' },
              { md: md`$= 0$ for every $\psi$ with continuous second derivatives`, why: 'mixed partial derivatives commute (Schwarz–Clairaut)' },
            ]}
          />
          <FormulaCard id="psi-identity" />
          <Callout kind="warning" title="Sign-convention trap">
            <Md>{md`The minus sign goes on $v$, the component that comes from the $x$-derivative. Some textbooks use the opposite pair, $u = -\pd{\psi}{y}$, $v = \pd{\psi}{x}$ — also valid, but it flips the sign of every $\psi$ and every "direction of flow" statement. In this course always use slide 12's box.`}</Md>
          </Callout>
          <Supplement title="The converse: when does a ψ exist?">
            <Md>{md`If $\pd{u}{x} + \pd{v}{y} = 0$ throughout a region without holes, then $u\,dy - v\,dx$ is an exact differential, and $\psi(x, y) = \psi_0 + \int_{(x_0, y_0)}^{(x, y)} (u\,dy - v\,dx)$ is the same along every path — that integral *is* the stream function. So **continuity is necessary and sufficient**. If the region has a hole containing a source or sink (concept 4), $\psi$ can come back to a different value after a full circuit.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-def-velocity" />
          <ExampleCard id="ex-def-find-v" />
        </Step>

        <Step kind="interactive">
          <ContinuityLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="definition" />
          <QuickCheck ids={['q-def-sign', 'q-def-why']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\psi$ is defined for **plane, incompressible** flow by $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ — the minus sign sits on $v$.`,
              md`Continuity becomes $\psi_{xy} - \psi_{yx} = 0$: satisfied **identically**, so any smooth $\psi$ is a valid incompressible plane flow.`,
              md`Two unknowns $(u, v)$ become one unknown $\psi$. Units $\mathrm{m^2/s}$; adding a constant to $\psi$ changes nothing.`,
              md`Conversely, a $\psi$ exists only if $\pd{u}{x} + \pd{v}{y} = 0$ — test this before you integrate.`,
              md`**Exam trap:** dropping the minus sign gives $\nabla\cdot\vb V = 2\psi_{xy}$ — a "flow" that creates or destroys volume.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 2. streamlines */}
      <Concept id="streamlines">
        <Step kind="intro" src={S13}>
          <Md>{md`
            Slide 13 recalls what a streamline is: a line in the flow field that is **everywhere tangent to the velocity**. Because the velocity is tangent, a small step $(dx, dy)$ along a streamline is parallel to $(u, v)$, which gives the streamline equation $dy/dx = v/u$.

            The slide then proves the key property of $\psi$: **lines along which $\psi$ is constant are streamlines.** The total differential of $\psi$, rewritten with the definition, is

            $$
            d\psi = \pd{\psi}{x}\,dx + \pd{\psi}{y}\,dy = -v\,dx + u\,dy .
            $$

            On a line of constant $\psi$, $d\psi = 0$, so $-v\,dx + u\,dy = 0$, i.e. $dy/dx = v/u$ — exactly the streamline equation.
          `}</Md>
          <Callout kind="key" title="Why this is so useful">
            <Md>{md`Finding streamlines normally means solving the differential equation $dy/dx = v/u$. With a stream function you skip that: **contour $\psi$** and the streamline pattern appears; to get the streamline through a point, set $\psi(x, y)$ equal to its value at that point.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            Go back to the terrain picture: a hiker who keeps to one contour line never changes altitude. The velocity always points along the contours of $\psi$, so a fluid particle in steady flow is exactly that hiker — it stays on its own $\psi$ "altitude" for ever. The contour lines are its tracks.

            Three consequences you can almost see:

            - **Streamlines cannot cross.** A point has one value of $\psi$, so it cannot lie on two contours with different values. Contours can only meet where $\vb V = 0$ (a stagnation point), and then they share the same value.
            - **Walls are streamlines.** No fluid crosses an impermeable wall, so $\psi$ is constant along it. Conversely, any streamline can be replaced by a thin solid wall without disturbing the flow — the basis for building flows round bodies in Unit B.
            - **The sign gives the sense of motion.** Walking with the flow, $\psi$ increases to your left.
          `}</Md>
          <Callout kind="tip">
            <Md>{md`$\nabla\psi$ is *perpendicular* to the streamlines; $\vb V$ is *tangent* to them. Mixing up "perpendicular" and "tangent" is the usual slip when this is first met.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={S13}>
          <Figure
            caption="Slide 13, recreated: streamlines rising over a house (left) and bending round a blunt nose (right, drawn as a Rankine half-body — Lecture 12). On each, V is tangent to a streamline and splits into u and v, so the streamline slope is dy/dx = v/u."
            src={S13}
          >
            <TangencyFigure />
          </Figure>
          <Figure caption={md`✦ Velocity arrows computed from $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ for $\psi = xy$ lie along the $\psi$ contours everywhere. The wall $y = 0$ is the contour $\psi = 0$.`}>
            <FlowField x={[-2, 2]} y={[0, 2]} psi={cornerPsi} quiver={13} maxHeight={260} />
          </Figure>
        </Step>

        <Step kind="equations" src={S13}>
          <FormulaCard id="streamline-slope" />
          <FormulaCard id="dpsi" />
          <Derivation
            title="Slide 13: lines of constant ψ are streamlines"
            steps={[
              { md: md`Streamline: $(dx, dy) \parallel (u, v) \;\Rightarrow\; \dfrac{dy}{dx} = \dfrac{v}{u}$`, why: 'velocity is tangent to the streamline' },
              { md: md`$d\psi = \pd{\psi}{x}\,dx + \pd{\psi}{y}\,dy$`, why: 'total differential of ψ(x, y)' },
              { md: md`$d\psi = -v\,dx + u\,dy$`, why: md`definition: $\psi_x = -v$, $\psi_y = u$` },
              { md: md`$\psi = \text{const} \Rightarrow d\psi = 0 \Rightarrow -v\,dx + u\,dy = 0$`, why: 'move along a contour' },
              { md: md`$\dfrac{dy}{dx} = \dfrac{v}{u}$ — the streamline equation`, why: 'rearrange' },
            ]}
          />
          <FormulaCard id="psi-const" />
          <Callout kind="exam">
            <Md>{md`Typical question: "Show that the curve … is a streamline" or "find the equation of the streamline through $(x_0, y_0)$". Answer: evaluate $\psi_0 = \psi(x_0, y_0)$ and write $\psi(x, y) = \psi_0$. If asked to *verify*, show the slope of the curve equals $v/u$.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-sl-corner" />
          <ExampleCard id="ex-sl-wavy" />
        </Step>

        <Step kind="interactive">
          <StreamlineTracer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="streamlines" />
          <QuickCheck ids={['q-sl-dpsi', 'q-sl-slope']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`A streamline is everywhere tangent to $\vb V$, so along it $dy/dx = v/u$.`,
              md`$d\psi = -v\,dx + u\,dy$; setting $d\psi = 0$ gives exactly $dy/dx = v/u$ — **lines of constant $\psi$ are streamlines**.`,
              md`Streamline through $(x_0, y_0)$: solve $\psi(x, y) = \psi(x_0, y_0)$ — no differential equation needed.`,
              md`Walls and dividing streamlines are $\psi$ contours; streamlines meet only where $\vb V = 0$, and then they share one $\psi$ value.`,
              md`**Exam trap:** the slope is $v/u$, not $u/v$ — and $\vb V$ is tangent to the $\psi$ contours, while $\nabla\psi$ is perpendicular to them.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 3. flow rate */}
      <Concept id="flow-rate">
        <Step kind="intro" src={S14}>
          <Md>{md`
            Slide 14 gives $\psi$ its physical meaning: **the change in the value of the stream function is related to the volume rate of flow.** Take two neighbouring streamlines, $\psi$ and $\psi + d\psi$, and let $dq$ be the volume flow rate (per unit depth) passing between them. Join a point $A$ on $\psi$ to a point $C$ on $\psi + d\psi$ by any curve. All of $dq$ must cross that curve, and continuity lets us replace the curve by the two straight steps $A \to B$ (horizontal, length $dx$) and $B \to C$ (vertical, length $dy$):

            $$
            dq = u\,dy - v\,dx = \pd{\psi}{y}\,dy + \pd{\psi}{x}\,dx = d\psi .
            $$

            Integrating from one streamline to another gives the headline result $q = \psi_2 - \psi_1$. Its sign carries the direction: with $\psi_2$ drawn as the upper streamline, $\psi_2 > \psi_1$ means the flow runs **left to right**, and $\psi_2 < \psi_1$ means **right to left**.
          `}</Md>
          <Callout kind="warning" title="Per unit depth">
            <Md>{md`$q$ is a flow rate per metre of depth normal to the $x$–$y$ plane: units $\mathrm{m^2/s}$, i.e. $\mathrm{m^3/s}$ per metre. For a channel of depth $b$, the volume flow rate is $Q = qb$.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            Think of the space between two streamlines as a **lane** of fluid. No fluid ever crosses a lane's edges (they are streamlines), so whatever enters the lane upstream must leave downstream: **the same flow rate passes along the whole lane**. The stream function simply numbers the lane edges so that the difference of the numbers *is* that flow rate.

            Two practical consequences:

            - Where a lane narrows, the same $q$ squeezes through a smaller gap, so the fluid speeds up ($|\vb V| \approx \Delta\psi/\Delta n$). A plot of equal-$\Delta\psi$ streamlines is therefore also a speed map.
            - The flow across a curve depends only on which two lanes' edges it starts and ends on — not on how it wiggles in between. Any extra crossing one way is undone by a crossing back.
          `}</Md>
          <Figure caption={md`✦ Equal steps $\Delta\psi = 0.25\ \mathrm{m^2/s}$ in corner flow $\psi = xy$; colour shows the speed. Lanes narrow exactly where the colour warms.`}>
            <FlowField x={[0, 2.4]} y={[0, 1.6]} psi={cornerPsi} psiLevels={CORNER_LEVELS} heatmap maxHeight={260} />
          </Figure>
        </Step>

        <Step kind="visual" src={S14}>
          <Figure
            caption="Slide 14, recreated. Top: streamlines ψ and ψ + dψ, an arbitrary curve from A to C and the steps A→B (crossed by −v dx) and B→C (crossed by u dy). Bottom: q = ψ₂ − ψ₁ with ψ₂ the upper line — ψ₂ > ψ₁ gives left-to-right flow, ψ₂ < ψ₁ right-to-left."
            src={S14}
          >
            <FlowRateFigure />
          </Figure>
          <Supplement title="The orientation-free version of the rule">
            <Md>{md`Stand on streamline 1 and face streamline 2. If $q = \psi_2 - \psi_1 > 0$, the fluid crosses your line of sight from **your left to your right**; if $q < 0$, from right to left. With streamline 2 above streamline 1 you are facing up the page, and this reduces to slide 14's "left to right". It is the same statement as "$\psi$ increases to the left of an observer moving with the flow".`}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={S14}>
          <Derivation
            title="Slide 14: dq = dψ"
            steps={[
              { md: md`No fluid crosses the streamlines $\psi$ and $\psi + d\psi$, so all of $dq$ crosses any curve $AC$ joining them.`, why: 'definition of a streamline' },
              { md: md`Mass balance on the region between curve $AC$ and the path $A \to B \to C$: flow across $AC$ = flow across $AB$ + flow across $BC$.`, why: 'incompressible continuity' },
              { md: md`Across $BC$ (vertical, length $dy$), in the $+x$ direction: $u\,dy$. Across $AB$ (horizontal, length $dx$), in the $-y$ direction: $-v\,dx$.`, why: 'flux = normal velocity × length' },
              { md: md`$dq = u\,dy - v\,dx$`, why: 'add the two' },
              { md: md`$dq = \pd{\psi}{y}\,dy + \pd{\psi}{x}\,dx = d\psi$`, why: md`substitute $u = \psi_y$, $v = -\psi_x$` },
              { md: md`$q = \displaystyle\int_{\psi_1}^{\psi_2} d\psi = \psi_2 - \psi_1$`, why: 'integrate across the gap' },
            ]}
          />
          <FormulaCard id="dq" />
          <FormulaCard id="q-psi" />
          <FormulaCard id="speed-spacing" />
          <Callout kind="exam">
            <Md>{md`Questions phrased "flow rate between the streamlines through points $P_1$ and $P_2$" are one-liners: $q = \psi(P_2) - \psi(P_1)$. State the units ($\mathrm{m^2/s}$, or $\mathrm{m^3/s}$ per metre) and the direction.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-fr-couette" />
          <ExampleCard id="ex-fr-corner" />
        </Step>

        <Step kind="interactive">
          <FlowRateMeter />
        </Step>

        <Step kind="practice">
          <PracticeList concept="flow-rate" />
          <QuickCheck ids={['q-fr-dir', 'q-fr-path']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$dq = u\,dy - v\,dx = d\psi$: the change in $\psi$ **is** the volume flow rate per unit depth between streamlines.`,
              md`$q = \psi_2 - \psi_1$ for any path joining the two streamlines; units $\mathrm{m^2/s}$ = $\mathrm{m^3/s}$ per metre of depth.`,
              md`Direction (slide 14, $\psi_2$ upper): $\psi_2 > \psi_1$ ⇒ left to right; $\psi_2 < \psi_1$ ⇒ right to left. In general $\psi$ increases to the left of the flow.`,
              md`Equal-$\Delta\psi$ streamlines double as a speedometer: crowding means faster flow, $|\vb V| \approx \Delta\psi/\Delta n$.`,
              md`**Exam trap:** forgetting the depth — multiply $q$ by $b$ to get $\mathrm{m^3/s}$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================================================ 4. polar form & scope */}
      <Concept id="polar-scope">
        <Step kind="intro" src={L10}>
          <Md>{md`
            Lecture 10 opens (slide 2) by finishing the stream-function story. For **incompressible, plane, two-dimensional flow** in polar coordinates $(r, \theta)$, continuity reads

            $$
            \frac{1}{r}\pd{(r v_r)}{r} + \frac{1}{r}\pd{v_\theta}{\theta} = 0
            $$

            — the plane version of the cylindrical continuity equation from Lecture 9, slide 11. The slide then boxes the polar definition of the stream function,

            $$
            v_r = \frac{1}{r}\pd{\psi}{\theta}, \qquad v_\theta = -\pd{\psi}{r},
            $$

            and states the **scope** of the idea: it can be extended to **axisymmetric flows** (flow in pipes, flow round bodies of revolution) and to **two-dimensional compressible flows**, but it is **not applicable to general three-dimensional flows using a single stream function**. Finally, an in-class problem asks for the stream function of the field $u = 2y$, $v = 4x$.
          `}</Md>
          <Callout kind="exam" title="The polar trap">
            <Md>{md`For $\psi$ the $1/r$ sits on $v_r$ and the minus sign on $v_\theta$. The velocity potential (Lecture 10, slide 8) does the opposite: $v_r = \pd{\phi}{r}$, $v_\theta = \frac{1}{r}\pd{\phi}{\theta}$. Learn them as a pair.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Why the $1/r$?** In polar coordinates a small change $d\theta$ moves you along an arc of length $r\,d\theta$, not $d\theta$. Apply slide 14's "$d\psi$ = flow crossing the step" to the two sides of a small polar element (figure below): walking along the arc (increasing $\theta$), the flow crossing it is $v_r\,(r\,d\theta) = d\psi$, so $v_r = \frac{1}{r}\pd{\psi}{\theta}$; walking outward along a radius, the flow crossing from your left to your right is $-v_\theta\,dr = d\psi$, so $v_\theta = -\pd{\psi}{r}$. The polar box is just "Δψ = flow rate" in round geometry.

            **Why only "single" stream functions fail in 3-D.** Count degrees of freedom. In plane flow, continuity is one equation linking two components ($u$, $v$): one free scalar remains — $\psi$. Axisymmetric flow ($v_r$, $v_z$) and steady compressible plane flow ($\rho u$, $\rho v$) again have one equation linking two quantities, so a single $\psi$ still works. A general 3-D flow has three components and still only one continuity equation: **two** free scalars remain, so it needs two stream functions.
          `}</Md>
        </Step>

        <Step kind="visual" src={L10}>
          <Figure caption="✦ Left: polar components at P — v_r along the radius, v_θ perpendicular to it. Right: a polar element; the arc has length r dθ, which is where the 1/r in v_r comes from.">
            <PolarFigure />
          </Figure>
          <Md>{md`Where does a (single) stream function exist? The chart below organises slide 2's scope statements together with the continuity test:`}</Md>
          <FlowChart
            rows={[
              [
                {
                  title: 'Does the field satisfy continuity?',
                  md: md`incompressible: $\nabla\cdot\vb V = 0$ · steady compressible: $\nabla\cdot(\rho\vb V) = 0$ — if **not**, no stream function of any kind exists`,
                  tone: 'slate',
                },
              ],
              [
                { title: 'Plane 2-D (x, y)', md: md`$u = \psi_y$, $v = -\psi_x$ (Lec 9, s. 12) or polar $v_r$, $v_\theta$ (Lec 10, s. 2)`, tone: 'emerald' },
                { title: 'Axisymmetric or 2-D compressible', md: 'extensions named on Lec 10, slide 2: Stokes ψ(r, z), or mass-based ψ', tone: 'cyan' },
                { title: 'General 3-D', md: md`no **single** $\psi$ (Lec 10, s. 2); needs two: $\vb V = \nabla\chi_1 \times \nabla\chi_2$`, tone: 'rose' },
              ],
            ]}
            arrowLabels={['yes — then how many coordinates does the flow depend on?']}
          />
        </Step>

        <Step kind="equations" src={L10}>
          <FormulaCard id="continuity-polar" />
          <FormulaCard id="psi-polar" />
          <Derivation
            title="✦ Why the polar box satisfies polar continuity"
            steps={[
              { md: md`$\dfrac{1}{r}\pd{}{r}\left(r \cdot \dfrac{1}{r}\pd{\psi}{\theta}\right) + \dfrac{1}{r}\pd{}{\theta}\left(-\pd{\psi}{r}\right)$`, why: 'substitute the box into polar continuity' },
              { md: md`$= \dfrac{1}{r}\left(\dfrac{\partial^2\psi}{\partial r\,\partial\theta} - \dfrac{\partial^2\psi}{\partial\theta\,\partial r}\right) = 0$`, why: 'the r inside cancels the 1/r; mixed partials commute' },
              { md: md`$\pd{\psi}{\theta} = \psi_x\pd{x}{\theta} + \psi_y\pd{y}{\theta} = r\left(-\psi_x\sin\theta + \psi_y\cos\theta\right) = r\,(u\cos\theta + v\sin\theta) = r\,v_r$`, why: md`chain rule with $x = r\cos\theta$, $y = r\sin\theta$` },
              { md: md`$-\pd{\psi}{r} = -\left(\psi_x\cos\theta + \psi_y\sin\theta\right) = -u\sin\theta + v\cos\theta = v_\theta$`, why: 'same ψ as the Cartesian definition' },
            ]}
          />
          <FormulaCard id="cart-polar" />
          <Supplement title="The extensions named on slide 2 — and what lies beyond">
            <Md>{md`Slide 2 only *names* the extensions. Their standard forms are given here for reference (sign conventions vary between textbooks).`}</Md>
            <div className="mt-3 space-y-3">
              <FormulaCard id="psi-axisym" />
              <FormulaCard id="psi-compressible" />
              <FormulaCard id="psi-3d" />
            </div>
          </Supplement>
        </Step>

        <Step kind="example" src={L10}>
          <FlowSteps
            steps={[
              { title: 'Check existence', md: md`$\pd{u}{x} + \pd{v}{y} = 0$? (polar: $\frac1r\pd{(rv_r)}{r} + \frac1r\pd{v_\theta}{\theta} = 0$?) If not, stop — no $\psi$.` },
              { title: 'Integrate one component', md: md`$\psi = \int u\,dy + f(x)$ — the "constant" may depend on the other variable.` },
              { title: 'Fix the unknown function with the other component', md: md`$-\pd{\psi}{x} = v$ gives $f'(x)$; integrate to get $f$ up to a constant $C$.` },
              { title: 'Verify', md: md`Differentiate back: $\pd{\psi}{y} = u$, $-\pd{\psi}{x} = v$. Choose $C$ (often $\psi = 0$ on a wall or through the origin).` },
            ]}
          />
          <ExampleCard id="ex-pol-inclass" />
          <ExampleCard id="ex-pol-corner" />
          <ExampleCard id="ex-pol-source" />
        </Step>

        <Step kind="interactive">
          <LinearFieldBuilder />
          <PolarExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="polar-scope" />
          <QuickCheck ids={['q-pol-comp', 'q-pol-rotational']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Polar form: $v_r = \frac1r\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$ — it satisfies $\frac1r\pd{(rv_r)}{r} + \frac1r\pd{v_\theta}{\theta} = 0$ identically.`,
              md`Same $\psi$, other coordinates: substitute $x = r\cos\theta$, $y = r\sin\theta$, and check with $v_r = u\cos\theta + v\sin\theta$.`,
              md`Velocity → $\psi$: check continuity, integrate $u$ in $y$, fix $f(x)$ from $v$, verify. Lecture 10 problem: $\psi = y^2 - 2x^2 + C$.`,
              md`A $\psi$ needs continuity only — rotational flows (like the Lecture 10 field, $\omega_z = 1\ \mathrm{s^{-1}}$) have one too.`,
              md`Scope: extends to axisymmetric and 2-D compressible flows; **no single** $\psi$ for general 3-D flow.`,
              md`**Exam trap:** the $1/r$ goes on $v_r$ for $\psi$, but on $v_\theta$ for the velocity potential $\phi$.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}

/* Compare is kept for the ψ-vs-φ summary below the polar concept (imported for future use in this module). */
void Compare
