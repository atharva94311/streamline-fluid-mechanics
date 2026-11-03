/**
 * Topic B1 — Flow Nets: Streamlines & Equipotentials.
 * Sources: Lecture 12 slides 2–7 (primary) and Fox & McDonald p. 224 (Eqs. 6.34–6.35, Table 6.1, Example 6.10 start);
 * Fox p. 222 Eq. 6.26 (Bernoulli between any two points of an irrotational flow) is quoted for pressure reading.
 * Course sign convention throughout: V = +∇φ (u = ∂φ/∂x), u = ∂ψ/∂y, v = −∂ψ/∂x. Fox uses V = −∇φ.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowField, FlowSteps, FormulaCard, Md, md, PracticeList,
  QuickCheck, Step, Supplement, Takeaways, num, type FlowMarker,
} from '@/kit'
import { FlowRateFigure, SlopeTriangleFigure, UniformFlowFigure, VelocityComponentsFigure } from '../sims/flow-nets/figures'
import { BendNetFigure, BendSpeedPlot, bendNumbers } from '../sims/flow-nets/BendNet'
import { VelocityRoutes } from '../sims/flow-nets/VelocityRoutes'
import { FlowNetLab } from '../sims/flow-nets/FlowNetLab'
import { FlowRateProbe } from '../sims/flow-nets/FlowRateProbe'
import { fox610, levelsFor } from '../sims/flow-nets/fields'

const S2: Src = { doc: 'lec12', pages: '2' }
const S3: Src = { doc: 'lec12', pages: '3' }
const S4: Src = { doc: 'lec12', pages: '4' }
const S5: Src = { doc: 'lec12', pages: '5' }
const S6: Src = { doc: 'lec12', pages: '6' }
const S7: Src = { doc: 'lec12', pages: '7' }
const F224: Src = { doc: 'fox', pages: '224' }
const F222: Src = { doc: 'fox', pages: '222', note: 'Eq. (6.26)' }

/* Module constants → stable identities for FlowField (contours are memoised on them). */
const FOX_PSI_LEVELS = levelsFor([-12, 12], 1.5)
const FOX_PHI_LEVELS = levelsFor([-24, 24], 1.5)
const FOX_HL = [{ level: 0, color: 'var(--plot-4)', label: 'ψ = 0: the lines y = ±x' }]
const ORIGIN_STAG: FlowMarker[] = [{ x: 0, y: 0, kind: 'stagnation', label: 'stagnation point' }]

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'flow-nets',
  unit: 'B',
  title: 'Flow Nets: Streamlines & Equipotentials',
  subtitle:
    'Put φ and ψ to work: read velocities in Cartesian and polar form, see why streamlines and equipotentials cross at right angles, and read speed, flow rate and pressure straight off a flow net.',
  minutes: 85,
  sources: [
    { doc: 'lec12', pages: '2–7' },
    { doc: 'fox', pages: '224' },
    { doc: 'fox', pages: '222', note: 'Eq. (6.26), for pressure' },
  ],
  concepts: [
    {
      id: 'phi-psi-velocities',
      title: 'Velocities from φ and ψ — Cartesian & polar form',
      src: { doc: 'lec12', pages: '2–4' },
      summary:
        'u = ∂φ/∂x = ∂ψ/∂y, v = ∂φ/∂y = −∂ψ/∂x; v_r = ∂φ/∂r = (1/r)∂ψ/∂θ, v_θ = (1/r)∂φ/∂θ = −∂ψ/∂r. φ exists because the flow is irrotational (V = ∇φ), ψ because it is plane and incompressible; Laplace’s equation governs potential flow.',
    },
    {
      id: 'orthogonality',
      title: 'Equipotentials are orthogonal to streamlines',
      src: [S5, { doc: 'fox', pages: '224', note: 'Eqs. (6.34)–(6.35)' }],
      summary:
        'Streamline slope v/u, equipotential slope −u/v: the product is −1, so the families cross at right angles everywhere except at stagnation points. In irrotational plane flow ψ also satisfies Laplace’s equation.',
    },
    {
      id: 'flow-net',
      title: 'Flow nets: spacing, speed & flow rate',
      src: { doc: 'lec12', pages: '6–7' },
      summary:
        'dq = u dy − v dx = dψ, so q = ψ₂ − ψ₁ between two streamlines. In a flow net every stream tube carries the same Δψ, so V ≈ Δψ/Δn: speed is inversely proportional to streamline spacing (fast at the inner wall of a bend, slow at the outer wall).',
    },
  ],
  sourceNote: md`**Sources.** Lecture 12, slides 2–7 (primary) and Fox & McDonald p. 224 (slopes of the $\psi$- and $\phi$-lines, Eqs. 6.34–6.35, Table 6.1 and the start of Example 6.10). Bernoulli's equation for irrotational flow is quoted from Fox p. 222 (Eq. 6.26) when pressures are read off a net. Lecture 12 prints **no equation numbers**. **Sign convention:** the course writes $\vb V = +\nabla\phi$; Fox writes $\vb V = -\nabla\phi$, so Fox's $\phi$ is the negative of ours — streamlines, slopes, orthogonality and flow nets are unaffected. Everything without a source chip (✦) — extra examples, problems, simulations and the computed bend flow net — was written for this platform.`,
}

/* -------------------------------------------------------------------------------------------- formulas */

export const formulas: FormulaDef[] = [
  {
    id: 'laplace-phi',
    name: "Laplace's equation for the velocity potential",
    key: true,
    tex: md`\nabla^2\phi = \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2} = 0`,
    vars: [
      { sym: md`\phi(x, y, z, t)`, desc: 'velocity potential (a scalar function)', units: md`\mathrm{m^2/s}` },
      { sym: md`\nabla^2`, desc: md`the **Laplacian operator** $\nabla\cdot\nabla$: the sum of the unmixed second derivatives`, units: md`\mathrm{m^{-2}}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`the flow is **incompressible** ($\nabla\cdot\vb V = 0$) **and irrotational** (so that $\vb V = \nabla\phi$ exists)`,
      md`flow fields that are also **inviscid** are governed entirely by this equation — the **potential flows** of this unit (slide 2)`,
      md`steady or unsteady; in plane flow the $z$-term drops out`,
    ],
    use: md`Test any candidate $\phi$ first: if $\nabla^2\phi \ne 0$ it cannot describe an incompressible potential flow. The equation is **linear**, so sums of solutions are solutions — the basis of superposition later in Unit B. The velocity comes from $\phi$ by differentiation; the pressure follows afterwards from Bernoulli.`,
    src: S2,
  },
  {
    id: 'irrotational',
    name: 'Irrotationality conditions',
    tex: md`\omega_z = \frac{1}{2}\left(\pd{v}{x} - \pd{u}{y}\right) = 0, \qquad \pd{v}{x} = \pd{u}{y}, \quad \pd{w}{y} = \pd{v}{z}, \quad \pd{u}{z} = \pd{w}{x}`,
    vars: [
      { sym: md`\omega_z`, desc: 'rate of rotation (angular velocity) of a fluid element about the $z$ axis', units: md`\mathrm{s^{-1}}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components along $x$, $y$, $z$', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      'all three rotation components vanish throughout the region considered',
      md`in plane flow ($w = 0$, nothing depends on $z$) only $\pd{v}{x} = \pd{u}{y}$ is non-trivial`,
    ],
    use: md`Check this **before** introducing a velocity potential: $\phi$ exists only where the flow is irrotational. For a given $(u, v)$ compute $\pd{v}{x} - \pd{u}{y}$; zero everywhere means $\phi$ exists.`,
    src: S4,
  },
  {
    id: 'phi-gradient',
    name: 'Velocity potential: V = ∇φ',
    key: true,
    tex: md`u = \pd{\phi}{x}, \qquad v = \pd{\phi}{y}, \qquad w = \pd{\phi}{z} \qquad\Longleftrightarrow\qquad \vb V = \nabla\phi`,
    vars: [
      { sym: md`\phi(x, y, z, t)`, desc: 'velocity potential — a scalar function of position and time', units: md`\mathrm{m^2/s}` },
      { sym: md`\vb V = (u, v, w)`, desc: 'velocity vector', units: md`\mathrm{m/s}` },
      { sym: md`\nabla`, desc: 'gradient operator', units: md`\mathrm{m^{-1}}` },
    ],
    conditions: [
      'irrotational flow — 2-D or 3-D, steady or unsteady',
      md`course sign convention ($+\nabla\phi$): $\phi$ **increases** in the flow direction. Fox & McDonald use $\vb V = -\nabla\phi$ (Table 6.1, p. 224), so their $\phi$ is the negative of ours`,
    ],
    use: md`For an irrotational flow the velocity can be written as the gradient of one scalar function, which replaces three velocity components. Any smooth $\phi$ automatically gives an irrotational field, because mixed partial derivatives are equal ($\pd{v}{x} = \frac{\partial^2\phi}{\partial x\,\partial y} = \pd{u}{y}$).`,
    src: [S4, { doc: 'fox', pages: '222', note: 'Eq. (6.27), Fox sign: V = −∇φ' }],
  },
  {
    id: 'vel-phi-plane',
    name: 'Plane potential flow: velocity from φ (Cartesian and polar)',
    key: true,
    tex: md`u = \pd{\phi}{x}, \quad v = \pd{\phi}{y} \qquad\qquad v_r = \pd{\phi}{r}, \quad v_\theta = \frac{1}{r}\pd{\phi}{\theta}`,
    vars: [
      { sym: md`u,\ v`, desc: 'Cartesian velocity components, along $+x$ and $+y$', units: md`\mathrm{m/s}` },
      { sym: md`v_r`, desc: 'radial component, positive away from the origin', units: md`\mathrm{m/s}` },
      { sym: md`v_\theta`, desc: 'tangential component, positive toward increasing $\theta$ (counter-clockwise)', units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates: distance from the origin, and angle measured counter-clockwise from $+x$', units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`\phi`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'plane (two-dimensional) irrotational flow',
      md`the factor $1/r$ in $v_\theta$ turns the angle step $d\theta$ into the arc length $r\,d\theta$ actually travelled`,
    ],
    use: md`Choose the coordinates that fit the flow — Cartesian for uniform and corner flows, polar for sources, sinks and vortices — differentiate, then evaluate at the point.`,
    src: S3,
  },
  {
    id: 'vel-psi-plane',
    name: 'Plane flow: velocity from ψ (Cartesian and polar)',
    key: true,
    tex: md`u = \pd{\psi}{y}, \quad v = -\pd{\psi}{x} \qquad\qquad v_r = \frac{1}{r}\pd{\psi}{\theta}, \quad v_\theta = -\pd{\psi}{r}`,
    vars: [
      { sym: md`\psi(x, y)`, desc: 'stream function: constant along each streamline; differences are flow rates per unit depth', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v,\ v_r,\ v_\theta`, desc: 'velocity components as defined above', units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      md`plane, **incompressible** flow — rotational or irrotational ($\psi$ satisfies continuity identically)`,
      md`the derivative is always taken **across** the component: $u$ from $\partial/\partial y$, $v$ from $-\partial/\partial x$, $v_r$ from $\frac{1}{r}\partial/\partial\theta$, $v_\theta$ from $-\partial/\partial r$`,
    ],
    use: md`Slide 3 notes that a stream function can also be defined for plane flow, so in a plane potential flow every component can be obtained from $\psi$ as well as from $\phi$ — compute both as a check on your algebra.`,
    src: S3,
  },
  {
    id: 'cauchy-riemann',
    name: 'Linking φ and ψ (Cauchy–Riemann relations)',
    tex: md`\pd{\phi}{x} = \pd{\psi}{y}, \quad \pd{\phi}{y} = -\pd{\psi}{x} \qquad\qquad \pd{\phi}{r} = \frac{1}{r}\pd{\psi}{\theta}, \quad \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r}`,
    vars: [
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function of the **same** plane flow', units: md`\mathrm{m^2/s}` },
      { sym: md`x,\ y,\ r,\ \theta`, desc: 'Cartesian and polar coordinates', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      'plane, incompressible **and** irrotational flow — the only case in which both functions exist',
      'obtained by equating the two expressions for each velocity component on slide 3 (not printed in the lecture)',
    ],
    use: md`Given one function, find the other: integrate e.g. $\pd{\phi}{x} = \pd{\psi}{y}$ with respect to $x$, add an unknown function of $y$, and fix it with the second relation. They also say that $\nabla\psi = (-v, u)$ is $\nabla\phi = (u, v)$ turned through $90^\circ$ with the **same magnitude** $\vert\vb V\vert$ — the seed of the orthogonality and equal-spacing results of this topic.`,
  },
  {
    id: 'polar-cartesian',
    name: 'Converting between (u, v) and (v_r, v_θ)',
    tex: md`\begin{aligned} u &= v_r\cos\theta - v_\theta\sin\theta, & v &= v_r\sin\theta + v_\theta\cos\theta \\ v_r &= u\cos\theta + v\sin\theta, & v_\theta &= -u\sin\theta + v\cos\theta \end{aligned}`,
    vars: [
      { sym: md`u,\ v`, desc: 'Cartesian components', units: md`\mathrm{m/s}` },
      { sym: md`v_r,\ v_\theta`, desc: 'polar components at the same point', units: md`\mathrm{m/s}` },
      { sym: md`\theta`, desc: 'polar angle of the point, counter-clockwise from $+x$', units: md`\mathrm{rad}` },
    ],
    conditions: ['pure geometry (rotation of the axes by θ) — valid for any plane velocity field', md`$v_\theta$ positive counter-clockwise; $x = r\cos\theta$, $y = r\sin\theta$`],
    use: md`Use it to cross-check answers obtained in the two coordinate systems, and remember $\vert\vb V\vert^2 = u^2 + v^2 = v_r^2 + v_\theta^2$.`,
  },
  {
    id: 'laplace-polar',
    name: "Laplace's equation in plane polar coordinates",
    tex: md`\nabla^2 f = \frac{1}{r}\pd{}{r}\left(r\pd{f}{r}\right) + \frac{1}{r^2}\frac{\partial^2 f}{\partial\theta^2} = 0, \qquad f = \phi \ \text{or}\ \psi`,
    vars: [
      { sym: md`f(r, \theta)`, desc: 'velocity potential or stream function written in polar form', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: ['same physics as the Cartesian form — only the coordinates differ', md`not valid at singular points such as $r = 0$ of a source or vortex`],
    use: md`The quickest test for polar potentials such as $Ar^n\cos n\theta$: the first term gives $n^2Ar^{n-2}\cos n\theta$, the second $-n^2Ar^{n-2}\cos n\theta$, so they cancel for every $n$.`,
  },
  {
    id: 'laplace-psi',
    name: "ψ also satisfies Laplace's equation (irrotational plane flow)",
    key: true,
    tex: md`\pd{u}{y} = \pd{v}{x} \;\Rightarrow\; \pd{}{y}\left(\pd{\psi}{y}\right) = \pd{}{x}\left(-\pd{\psi}{x}\right) \;\Rightarrow\; \frac{\partial^2\psi}{\partial x^2} + \frac{\partial^2\psi}{\partial y^2} = 0`,
    vars: [
      { sym: md`\psi(x, y)`, desc: 'stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`plane, incompressible flow (so that $\psi$ exists) **that is also irrotational**`,
      md`a rotational plane flow still has a $\psi$, but then $\nabla^2\psi = -2\omega_z \ne 0$ (Fox Table 6.1: ψ satisfies Laplace "only if irrotational")`,
    ],
    use: md`Quick irrotationality test when you are given $\psi$: compute $\nabla^2\psi$. If it is zero, a velocity potential exists and a flow net can be drawn (this is exactly the first step of Fox Example 6.10).`,
    src: [S5, { doc: 'fox', pages: '224', note: 'Table 6.1' }],
  },
  {
    id: 'slope-psi',
    name: 'Slope of a streamline (ψ = constant)',
    key: true,
    tag: '6.34',
    tex: md`d\psi = \pd{\psi}{x}dx + \pd{\psi}{y}dy = 0 \quad\Rightarrow\quad \left.\frac{dy}{dx}\right|_{\psi\,=\,\text{const}} = -\frac{\partial\psi/\partial x}{\partial\psi/\partial y} = \frac{v}{u}`,
    vars: [
      { sym: md`dy/dx`, desc: 'slope of the curve through the point', units: md`-` },
      { sym: md`\pd{\psi}{x} = -v,\ \pd{\psi}{y} = u`, desc: 'partial derivatives of the stream function', units: md`\mathrm{m/s}` },
    ],
    conditions: [md`$u \ne 0$ (where $u = 0$ the streamline is vertical)`, 'any plane incompressible flow — this result does not need irrotationality'],
    use: md`The streamline runs **along** the velocity: its slope is simply $v/u$. Slide 5 states the result; Fox derives it from $d\psi = 0$ along a line of constant $\psi$.`,
    src: [S5, { doc: 'fox', pages: '224', note: 'Eq. (6.34)' }],
  },
  {
    id: 'dphi',
    name: 'Total differential of φ',
    tex: md`d\phi = \pd{\phi}{x}dx + \pd{\phi}{y}dy = u\,dx + v\,dy`,
    vars: [
      { sym: md`d\phi`, desc: 'change of the velocity potential over a small step $(dx, dy)$', units: md`\mathrm{m^2/s}` },
      { sym: md`dx,\ dy`, desc: 'components of the step', units: md`\mathrm{m}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['plane irrotational flow, course convention u = ∂φ/∂x, v = ∂φ/∂y'],
    use: md`$d\phi = \vb V\cdot d\vb s$: the potential changes fastest along the velocity and **not at all** for a step perpendicular to it — which is the equipotential direction.`,
    src: S5,
  },
  {
    id: 'slope-phi',
    name: 'Slope of an equipotential line (φ = constant)',
    key: true,
    tag: '6.35',
    tex: md`d\phi = 0 \quad\Rightarrow\quad \left.\frac{dy}{dx}\right|_{\phi\,=\,\text{const}} = -\frac{\partial\phi/\partial x}{\partial\phi/\partial y} = -\frac{u}{v}`,
    vars: [
      { sym: md`dy/dx`, desc: 'slope of the equipotential through the point', units: md`-` },
      { sym: md`u,\ v`, desc: 'velocity components at the point', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`$v \ne 0$ (where $v = 0$ the equipotential is vertical)`,
      md`identical in Fox's convention: there $\pd{\phi}{x} = -u$, $\pd{\phi}{y} = -v$ and the two signs cancel`,
    ],
    use: md`The equipotential runs **across** the velocity. Combine with Eq. (6.34) to test orthogonality.`,
    src: [S5, { doc: 'fox', pages: '224', note: 'Eq. (6.35)' }],
  },
  {
    id: 'orthogonality',
    name: 'Orthogonality of streamlines and equipotentials',
    key: true,
    tex: md`\left.\frac{dy}{dx}\right|_{\psi} \times \left.\frac{dy}{dx}\right|_{\phi} = \frac{v}{u}\times\left(-\frac{u}{v}\right) = -1 \qquad\left(\text{as for }\ \frac{a}{b}\times\left(-\frac{b}{a}\right) = -1\right)`,
    vars: [
      { sym: md`a/b,\ -b/a`, desc: 'slopes of two perpendicular lines, from the slope triangles of the slide 5 sketch', units: md`-` },
      { sym: md`u,\ v`, desc: 'velocity components at the crossing point', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'plane potential flow (both ψ and φ exist)',
      md`$u$ and $v$ not both zero: at a **stagnation point** both slopes are $0/0$ and the lines may meet at other angles`,
    ],
    use: md`Slopes with product $-1$ belong to perpendicular lines, so equipotentials cut streamlines at right angles wherever they intersect. Fox notes that this property is useful in graphical analyses of flow fields — the flow nets of concept 3.`,
    src: [S5, { doc: 'fox', pages: '224' }],
  },
  {
    id: 'dq-dpsi',
    name: 'Flow between neighbouring streamlines: dq = dψ',
    tex: md`dq = u\,dy - v\,dx = \pd{\psi}{y}dy + \pd{\psi}{x}dx = d\psi`,
    vars: [
      { sym: md`dq`, desc: 'volume flow rate per unit depth crossing the small curve $AC$ joining the streamlines $\psi$ and $\psi + d\psi$', units: md`\mathrm{m^2/s}` },
      { sym: md`u\,dy`, desc: 'flow out through the vertical side $BC$ (length $dy$)', units: md`\mathrm{m^2/s}` },
      { sym: md`-v\,dx`, desc: 'flow out through the horizontal side $AB$ (length $dx$)', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['plane, incompressible flow (rotational or irrotational)', 'mass balance on the small triangle ABC of slide 6'],
    use: md`Because $dq$ is an exact differential, the flow between two streamlines does not depend on the path along which it is measured.`,
    src: S6,
  },
  {
    id: 'q-psi',
    name: 'Volume flow rate between two streamlines',
    key: true,
    tex: md`q = \int_{\psi_1}^{\psi_2} d\psi = \psi_2 - \psi_1`,
    vars: [
      { sym: md`q`, desc: 'volume flow rate between the two streamlines, per unit depth normal to the $x$–$y$ plane', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi_1,\ \psi_2`, desc: 'values of the stream function on the two bounding streamlines', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'plane, incompressible flow',
      md`sign (slide 6): with $\psi_2$ the upper streamline, $\psi_2 > \psi_1$ means flow **to the right** and $\psi_2 < \psi_1$ flow **to the left**`,
    ],
    use: md`The change in $\psi$ between two streamlines **is** the volume flow rate between them (per unit depth). Multiply by the depth $b$ for the actual volume flow, $Q = qb$ (m³/s).`,
    src: S6,
  },
  {
    id: 'net-speed',
    name: 'Flow net: speed from streamline spacing',
    key: true,
    tex: md`V \approx \frac{\Delta\psi}{\Delta n} \qquad\Longrightarrow\qquad V \propto \frac{1}{\Delta n}\quad(\Delta\psi \text{ fixed})`,
    vars: [
      { sym: md`V`, desc: 'local speed, averaged across the stream tube', units: md`\mathrm{m/s}` },
      { sym: md`\Delta\psi`, desc: 'flow carried by one stream tube (the constant increment between drawn streamlines)', units: md`\mathrm{m^2/s}` },
      { sym: md`\Delta n`, desc: 'local distance between the two streamlines bounding the tube, measured normal to the flow', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`streamlines drawn at **equal** increments $\Delta\psi$ (otherwise spacing means nothing)`,
      md`$\Delta n$ small compared with the radius of curvature of the streamlines (a fine net)`,
      'plane, incompressible flow',
    ],
    use: md`Slide 7 states it in words: **velocity is inversely proportional to the streamline spacing**. It is $q = \psi_2 - \psi_1$ (slide 6) applied to one tube: $\Delta\psi = V\,\Delta n$ is the same everywhere along the tube, so where the tube narrows the fluid must speed up.`,
    src: [S7, { doc: 'lec12', pages: '6', note: 'Δq = Δψ' }],
  },
  {
    id: 'net-squares',
    name: 'Equal increments make curvilinear squares',
    tex: md`\Delta\phi \approx V\,\Delta s, \qquad \Delta\psi \approx V\,\Delta n \qquad\Longrightarrow\qquad \frac{\Delta s}{\Delta n} \approx \frac{\Delta\phi}{\Delta\psi} = 1 \quad\text{when } \Delta\phi = \Delta\psi`,
    vars: [
      { sym: md`\Delta s`, desc: 'distance between neighbouring equipotentials, measured along the flow', units: md`\mathrm{m}` },
      { sym: md`\Delta n`, desc: 'distance between neighbouring streamlines, measured across the flow', units: md`\mathrm{m}` },
      { sym: md`\Delta\phi,\ \Delta\psi`, desc: 'increments between drawn equipotentials and streamlines', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['plane potential flow; small cells', 'fails at stagnation points (V = 0) and singular points'],
    use: md`A correctly drawn net has cells that are roughly square everywhere (inscribed circles touch all four sides); their **size** tells the speed: $V \approx \Delta\psi/\Delta n \approx \Delta\phi/\Delta s$.`,
  },
  {
    id: 'bernoulli-irrot',
    name: 'Bernoulli between any two points of an irrotational flow',
    tag: '6.26',
    tex: md`\frac{p}{\rho} + \frac{V^2}{2} + gz = \text{constant}`,
    vars: [
      { sym: md`p`, desc: 'pressure', units: md`\mathrm{Pa}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: md`V`, desc: 'flow speed', units: md`\mathrm{m/s}` },
      { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`z`, desc: 'elevation, measured upward', units: md`\mathrm{m}` },
    ],
    conditions: [
      'steady, incompressible, inviscid flow that is **also irrotational**',
      md`then the constant is the **same for every streamline**, so it links any two points of the net, across streamlines as well as along them`,
    ],
    use: md`Reading pressure off a flow net: in a horizontal plane, $p_1 - p_2 = \tfrac12\rho(V_2^2 - V_1^2)$ — crowded streamlines (high $V$) mean low pressure.`,
    src: F222,
  },
]

/* -------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  {
    id: 'corner-four-routes',
    concept: 'phi-psi-velocities',
    title: 'Four routes to one velocity: φ = 2(x² − y²)',
    difficulty: 2,
    given: md`A plane potential flow has $\phi = 2(x^2 - y^2)$ (m²/s, with $x, y$ in m). Course convention $\vb V = \nabla\phi$.`,
    find: md`(a) $u$ and $v$ from $\phi$; (b) the stream function $\psi$, and check $u$, $v$ from it; (c) $v_r$ and $v_\theta$ at $P(1, 2)$ m from the polar forms of $\phi$ and of $\psi$; (d) the speed at $P$.`,
    assumptions: md`Plane, incompressible, irrotational flow. Check: $\nabla^2\phi = 4 - 4 = 0$ ✓.`,
    steps: [
      { title: 'Cartesian components from φ', md: md`$u = \pd{\phi}{x} = 4x$, $\quad v = \pd{\phi}{y} = -4y$. At $P(1, 2)$: $u = 4$ m/s, $v = -8$ m/s.` },
      {
        title: 'Find ψ (Cauchy–Riemann)',
        md: md`$\pd{\psi}{y} = u = 4x \Rightarrow \psi = 4xy + f(x)$. Then $-\pd{\psi}{x} = -4y - f'(x)$ must equal $v = -4y$, so $f'(x) = 0$ and $\psi = 4xy$ (constant dropped). Check: $\pd{\psi}{y} = 4x = u$ ✓, $-\pd{\psi}{x} = -4y = v$ ✓.`,
      },
      {
        title: 'Go polar',
        md: md`With $x = r\cos\theta$, $y = r\sin\theta$: $\phi = 2r^2(\cos^2\theta - \sin^2\theta) = 2r^2\cos 2\theta$ and $\psi = 4r^2\sin\theta\cos\theta = 2r^2\sin 2\theta$. At $P$: $r = \sqrt5 = 2.236$ m, $\theta = \tan^{-1}2 = 63.43^\circ$, so $\cos 2\theta = -0.6$ and $\sin 2\theta = 0.8$.`,
      },
      {
        title: 'Polar components — the φ route',
        md: md`$v_r = \pd{\phi}{r} = 4r\cos 2\theta = 4(2.236)(-0.6) = -5.367$ m/s; $\quad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = \frac{1}{r}\left(-4r^2\sin 2\theta\right) = -4r\sin 2\theta = -7.155$ m/s.`,
      },
      {
        title: 'Polar components — the ψ route',
        md: md`$v_r = \frac{1}{r}\pd{\psi}{\theta} = \frac{1}{r}\left(4r^2\cos 2\theta\right) = 4r\cos 2\theta = -5.367$ m/s ✓; $\quad v_\theta = -\pd{\psi}{r} = -4r\sin 2\theta = -7.155$ m/s ✓.`,
      },
      {
        title: 'Cross-check with the conversion formulas',
        md: md`With $\cos\theta = 1/\sqrt5$ and $\sin\theta = 2/\sqrt5$: $v_r = u\cos\theta + v\sin\theta = (4 - 16)/\sqrt5 = -5.367$ m/s ✓ and $v_\theta = -u\sin\theta + v\cos\theta = (-8 - 8)/\sqrt5 = -7.155$ m/s ✓.`,
      },
      {
        title: 'Speed',
        md: md`$\vert\vb V\vert = \sqrt{u^2 + v^2} = \sqrt{16 + 64} = \sqrt{80} = 8.94$ m/s, and $\sqrt{v_r^2 + v_\theta^2} = \sqrt{28.8 + 51.2} = 8.94$ m/s ✓.`,
      },
    ],
    answer: md`$u = 4x$, $v = -4y$; $\psi = 4xy$; at $(1, 2)$ m: $u = 4$, $v = -8$, $v_r = -5.37$, $v_\theta = -7.16$ m/s; $\vert\vb V\vert = 8.94$ m/s.`,
    insight: 'Four formulas, one arrow: the components depend on the coordinate system, but φ and ψ always agree on the same vector.',
  },
  {
    id: 'wedge-polar',
    concept: 'phi-psi-velocities',
    title: 'Polar first: flow into a 60° corner',
    difficulty: 2,
    given: md`$\phi = Ar^3\cos 3\theta$ and $\psi = Ar^3\sin 3\theta$ with $A = 0.5\ \mathrm{m^{-1}s^{-1}}$ ($r$ in m; $\phi$, $\psi$ in m²/s).`,
    find: md`(a) Show that both satisfy Laplace's equation. (b) $v_r$ and $v_\theta$ at $r = 1$ m, $\theta = 20^\circ$ by both routes. (c) $u$ and $v$ there. (d) Which rays are the streamline $\psi = 0$?`,
    steps: [
      {
        title: 'Laplace check in polar form',
        md: md`$\frac{1}{r}\pd{}{r}\left(r\pd{\phi}{r}\right) = \frac{1}{r}\pd{}{r}\left(3Ar^3\cos 3\theta\right) = 9Ar\cos 3\theta$ and $\frac{1}{r^2}\frac{\partial^2\phi}{\partial\theta^2} = \frac{1}{r^2}\left(-9Ar^3\cos 3\theta\right) = -9Ar\cos 3\theta$: the sum is $0$ ✓. The same steps with $\sin 3\theta$ give $\nabla^2\psi = 0$.`,
      },
      {
        title: 'The φ route',
        md: md`$v_r = \pd{\phi}{r} = 3Ar^2\cos 3\theta = 1.5\cos 60^\circ = 0.750$ m/s; $\quad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -3Ar^2\sin 3\theta = -1.5\sin 60^\circ = -1.299$ m/s.`,
      },
      {
        title: 'The ψ route',
        md: md`$v_r = \frac{1}{r}\pd{\psi}{\theta} = \frac{1}{r}\,3Ar^3\cos 3\theta = 0.750$ m/s ✓; $\quad v_\theta = -\pd{\psi}{r} = -3Ar^2\sin 3\theta = -1.299$ m/s ✓.`,
      },
      {
        title: 'Cartesian components',
        md: md`$u = v_r\cos\theta - v_\theta\sin\theta = 0.750(0.9397) + 1.299(0.3420) = 1.149$ m/s; $\quad v = v_r\sin\theta + v_\theta\cos\theta = 0.750(0.3420) - 1.299(0.9397) = -0.964$ m/s. Speed: $\sqrt{1.149^2 + 0.964^2} = 1.50$ m/s $= 3Ar^2$ ✓.`,
      },
      {
        title: 'Walls',
        md: md`$\psi = 0$ where $\sin 3\theta = 0$: the rays $\theta = 0$ and $\theta = 60^\circ$. Either can be a solid wall, so this is the flow in a **60° corner**: on $\theta = 60^\circ$, $v_r = 3Ar^2\cos 180^\circ < 0$ (toward the corner); on $\theta = 0$, $v_r > 0$ (away from it).`,
      },
    ],
    answer: md`$\nabla^2\phi = \nabla^2\psi = 0$; at $(1\ \mathrm{m}, 20^\circ)$: $v_r = 0.750$ m/s, $v_\theta = -1.299$ m/s, $u = 1.149$ m/s, $v = -0.964$ m/s, $\vert\vb V\vert = 1.50$ m/s; walls at $\theta = 0$ and $60^\circ$.`,
    insight: 'In polar form a wedge flow is one line of algebra; the same field in Cartesian form, φ = A(x³ − 3xy²), is far messier.',
  },
  {
    id: 'fox-6-10',
    concept: 'orthogonality',
    title: 'Fox Example 6.10 — velocity potential from ψ = ax² − ay²',
    src: { doc: 'fox', pages: '224', note: 'Example 6.10' },
    solutionBy: 'platform',
    difficulty: 2,
    given: md`An incompressible flow field has the stream function $\psi = ax^2 - ay^2$, with $a = 3\ \mathrm{s^{-1}}$ ($x, y$ in m).`,
    find: md`(a) Is the flow irrotational? (b) Its velocity potential $\phi$. (c) Check that the streamline and the equipotential through $(1, 2)$ m cross at right angles.`,
    assumptions: md`Plane, incompressible flow. The course excerpt prints only the start of the solution (the irrotationality test in step 1); the rest is on p. 225, which is not in the excerpt, so steps 2–5 were written here.`,
    steps: [
      {
        title: 'Irrotational? (as printed, p. 224)',
        md: md`If the flow is irrotational, $\nabla^2\psi = 0$. Check: $\nabla^2\psi = \frac{\partial^2}{\partial x^2}\left(ax^2 - ay^2\right) + \frac{\partial^2}{\partial y^2}\left(ax^2 - ay^2\right) = 2a - 2a = 0$. The flow **is irrotational**.`,
      },
      {
        title: 'Velocity components',
        md: md`$u = \pd{\psi}{y} = -2ay = -6y$, $\quad v = -\pd{\psi}{x} = -2ax = -6x$ (m/s). Direct check: $\pd{v}{x} - \pd{u}{y} = -2a - (-2a) = 0$ ✓.`,
      },
      {
        title: 'Integrate for φ (course convention u = ∂φ/∂x)',
        md: md`$\pd{\phi}{x} = u = -2ay \Rightarrow \phi = -2axy + f(y)$. Then $\pd{\phi}{y} = -2ax + f'(y)$ must equal $v = -2ax$, so $f' = 0$: $\phi = -2axy + C = -6xy + C$ (m²/s).`,
      },
      {
        title: "In Fox's convention",
        md: md`Fox defines $\vb V = -\nabla\phi$ (Table 6.1: $u = -\pd{\phi}{x}$, $v = -\pd{\phi}{y}$), so the same steps give $\phi_\text{Fox} = +2axy + C = 6xy + C$. Only the sign changes; the equipotential **lines** $xy$ = const are the same.`,
      },
      {
        title: 'Orthogonality at (1, 2)',
        md: md`$u = -12$ m/s, $v = -6$ m/s. Streamline slope (Eq. 6.34): $v/u = 0.5$. Equipotential slope (Eq. 6.35): $-u/v = -2$. Product $= 0.5 \times (-2) = -1$ ✓. The curves are the streamline $x^2 - y^2 = -3$ ($\psi = -9$ m²/s) and the equipotential $xy = 2$ ($\phi = -12$ m²/s).`,
      },
    ],
    answer: md`(a) Irrotational, since $\nabla^2\psi = 2a - 2a = 0$. (b) $\phi = -2axy = -6xy$ (+ const) in the course convention, $+6xy$ in Fox's. (c) Slopes $0.5$ and $-2$: product $-1$.`,
    insight: 'The sign of φ depends on the convention; the flow net (the hyperbolas x² − y² = const and xy = const) does not.',
  },
  {
    id: 'stagnation-check',
    concept: 'orthogonality',
    title: 'Slopes at a point — and what happens at a stagnation point',
    difficulty: 2,
    given: md`A plane flow has $\psi = 2xy + 3y$ (m²/s; $x, y$ in m).`,
    find: md`(a) Is it a potential flow? If so, find $\phi$. (b) The slopes of the streamline and the equipotential through $(1, 1)$ m. (c) The stagnation point, and the angle at which the $\psi$- and $\phi$-lines through it meet.`,
    steps: [
      { title: 'Velocity and Laplace test', md: md`$u = \pd{\psi}{y} = 2x + 3$, $\ v = -\pd{\psi}{x} = -2y$. $\nabla^2\psi = 0 + 0 = 0$, so the flow is irrotational and $\phi$ exists.` },
      { title: 'Velocity potential', md: md`$\pd{\phi}{x} = 2x + 3 \Rightarrow \phi = x^2 + 3x + g(y)$; then $\pd{\phi}{y} = g'(y) = v = -2y$, so $g = -y^2$ and $\phi = x^2 + 3x - y^2$.` },
      {
        title: 'Slopes at (1, 1)',
        md: md`$u = 5$ m/s, $v = -2$ m/s. Streamline: $v/u = -0.4$. Equipotential: $-u/v = 2.5$. Product $= -1$ ✓. Implicit check: the streamline $\psi = 5$ is $y = 5/(2x + 3)$, slope $-10/(2x+3)^2 = -0.4$ ✓; the equipotential $x^2 + 3x - y^2 = 3$ has slope $(2x + 3)/(2y) = 2.5$ ✓.`,
      },
      {
        title: 'Stagnation point',
        md: md`$u = v = 0$ at $(-1.5, 0)$, where both slope formulas become $0/0$. The streamline through it is $\psi = y(2x + 3) = 0$: the lines $y = 0$ and $x = -1.5$, crossing each other at $90^\circ$. The equipotential through it, $\phi = -2.25$, is $(x + 1.5)^2 - y^2 = 0$: the lines $y = \pm(x + 1.5)$.`,
      },
      {
        title: 'Angle at the stagnation point',
        md: md`The $\phi$-lines $y = \pm(x + 1.5)$ make $45^\circ$ with the $\psi$-lines $y = 0$ and $x = -1.5$. **Orthogonality fails at the stagnation point** — exactly where the derivation divides by $u$ and $v$.`,
      },
    ],
    answer: md`$\phi = x^2 + 3x - y^2$; at $(1, 1)$ the slopes are $-0.4$ and $2.5$ (product $-1$); stagnation point $(-1.5, 0)$ m, where $\psi$- and $\phi$-lines meet at $45^\circ$, not $90^\circ$.`,
    insight: 'Eqs. (6.34)–(6.35) divide by u and v; wherever both vanish, the right-angle rule is no longer guaranteed.',
  },
  {
    id: 'bend-reading',
    concept: 'flow-net',
    title: 'Reading a flow net: speeds and pressures in a 90° bend',
    difficulty: 2,
    given: md`Water ($\rho = 1000\ \mathrm{kg/m^3}$) flows through a horizontal 2-D bend like that of slide 7. In the straight inlet the flow is uniform, $V = 2.0$ m/s, and the flow net divides the 100 mm wide channel into 4 stream tubes of width $d = 25$ mm. Across a section in the bend, the tube next to the inner wall is $d_2 = 15$ mm wide and the tube next to the outer wall is $d_1 = 40$ mm wide.`,
    find: md`(a) $\Delta\psi$ per tube and the total flow rate per metre of depth; (b) the mean speeds $V_2$ and $V_1$ in the two wall tubes; (c) the pressure differences $p_1 - p_2$, $p_\text{in} - p_2$ and $p_1 - p_\text{in}$.`,
    assumptions: md`Steady, inviscid, incompressible, irrotational plane flow (the conditions under which the net exists); horizontal, so the $gz$ terms cancel; speeds are tube averages.`,
    steps: [
      { title: 'Flow per tube', md: md`In the inlet each tube carries $\Delta\psi = Vd = 2.0 \times 0.025 = 0.050\ \mathrm{m^2/s}$. Total $q = 4\,\Delta\psi = 0.20\ \mathrm{m^2/s}$ per metre depth (check: $Vw = 2.0 \times 0.100$ ✓).` },
      { title: 'Same Δψ in the bend', md: md`No fluid crosses a streamline, so each tube still carries $0.050\ \mathrm{m^2/s}$: $V_2 = \Delta\psi/d_2 = 0.050/0.015 = 3.33$ m/s and $V_1 = \Delta\psi/d_1 = 0.050/0.040 = 1.25$ m/s.` },
      { title: 'Bernoulli across the streamlines', md: md`The flow is irrotational, so $p + \tfrac12\rho V^2$ is the same everywhere (Fox Eq. 6.26, horizontal): $p_1 - p_2 = \tfrac12\rho\left(V_2^2 - V_1^2\right) = 500(11.11 - 1.5625) = 4774$ Pa $\approx 4.77$ kPa.` },
      {
        title: 'Relative to the inlet',
        md: md`$p_\text{in} - p_2 = \tfrac12\rho\left(V_2^2 - V^2\right) = 500(11.11 - 4.00) = 3556$ Pa: the inner wall sits **below** the inlet pressure. $p_1 - p_\text{in} = \tfrac12\rho\left(V^2 - V_1^2\right) = 500(4.00 - 1.5625) = 1219$ Pa: the outer wall sits **above** it.`,
      },
      { title: 'Sanity check', md: md`The two middle tubes must share $100 - 15 - 40 = 45$ mm — on average 22.5 mm each, i.e. about $0.050/0.0225 = 2.2$ m/s: between $V_1$ and $V_2$, as a smooth net requires.` },
    ],
    answer: md`$\Delta\psi = 0.050\ \mathrm{m^2/s}$, $q = 0.20\ \mathrm{m^2/s}$ per metre; $V_2 = 3.33$ m/s, $V_1 = 1.25$ m/s; $p_1 - p_2 \approx 4.77$ kPa, $p_\text{in} - p_2 \approx 3.56$ kPa, $p_1 - p_\text{in} \approx 1.22$ kPa.`,
    insight: 'Crowded streamlines = fast flow = low pressure; the pressure rise toward the outer wall is what pushes the fluid round the bend.',
  },
  {
    id: 'corner-flowrate',
    concept: 'flow-net',
    title: 'Flow rate between two streamlines — with two path checks',
    difficulty: 1,
    given: md`Corner flow $\psi = 0.5xy$ (m²/s; $x, y$ in m), so $u = 0.5x$ and $v = -0.5y$. Points $A(1, 0.5)$ and $C(2, 1.5)$ m.`,
    find: md`The volume flow rate per metre of depth between the streamlines through $A$ and $C$ and its direction; check it by integrating $u\,dy - v\,dx$ along the straight line $AC$ and along the path $A \to B \to C$ with $B(2, 0.5)$.`,
    steps: [
      { title: 'Stream-function values', md: md`$\psi_1 = \psi_A = 0.5(1)(0.5) = 0.25\ \mathrm{m^2/s}$, $\quad \psi_2 = \psi_C = 0.5(2)(1.5) = 1.50\ \mathrm{m^2/s}$.` },
      {
        title: 'Flow rate and direction',
        md: md`$q = \psi_2 - \psi_1 = 1.50 - 0.25 = 1.25\ \mathrm{m^2/s}$ per metre depth. It is positive: seen walking from $A$ to $C$, the flow crosses from your left to your right — here toward the lower right (at the midpoint $(1.5, 1.0)$ the velocity is $(0.75, -0.50)$ m/s).`,
      },
      { title: 'Check 1: the straight path', md: md`On $x = 1 + t$, $y = 0.5 + t$ ($0 \le t \le 1$): $dx = dy = dt$ and $u\,dy - v\,dx = (0.5x + 0.5y)\,dt = (0.75 + t)\,dt$, so $\int_0^1 (0.75 + t)\,dt = 0.75 + 0.5 = 1.25$ ✓.` },
      {
        title: 'Check 2: the staircase A → B → C',
        md: md`Along $AB$ ($y = 0.5$, $dy = 0$): $\int -v\,dx = \int_1^2 0.25\,dx = 0.25$. Along $BC$ ($x = 2$, $dx = 0$): $\int u\,dy = \int_{0.5}^{1.5} 1.0\,dy = 1.00$. Sum $= 1.25$ ✓ — the finite version of the $-v\,dx$ and $u\,dy$ arrows of slide 6.`,
      },
    ],
    answer: md`$q = \psi_2 - \psi_1 = 1.25\ \mathrm{m^2/s}$ per metre depth, crossing $AC$ from left to right (seen from $A$ toward $C$); both path integrals give $1.25$.`,
    insight: 'The flow between two streamlines depends only on their ψ values — never on the path you choose to measure it along.',
  },
]

/* -------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  {
    id: 'pr-psi-to-phi',
    concept: 'phi-psi-velocities',
    difficulty: 2,
    q: md`A plane flow has $\psi = 3x^2y - y^3$ (m²/s; $x, y$ in m). (a) Find $u$ and $v$. (b) Is the flow irrotational? (c) If so, find $\phi$ (course convention $\vb V = \nabla\phi$). (d) What is the speed at $(1, 1)$ m?`,
    hint: md`Use $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$; test $\nabla^2\psi$; then integrate $\pd{\phi}{x} = u$ and fix the unknown function with $\pd{\phi}{y} = v$.`,
    answer: md`$u = 3x^2 - 3y^2$, $v = -6xy$; irrotational ($\nabla^2\psi = 6y - 6y = 0$); $\phi = x^3 - 3xy^2$; speed $6$ m/s at $(1, 1)$.`,
    solution: md`(a) $u = \pd{\psi}{y} = 3x^2 - 3y^2$ and $v = -\pd{\psi}{x} = -6xy$.

(b) $\nabla^2\psi = \frac{\partial^2}{\partial x^2}(3x^2y - y^3) + \frac{\partial^2}{\partial y^2}(3x^2y - y^3) = 6y - 6y = 0$, so the flow is irrotational. (Directly: $\pd{v}{x} - \pd{u}{y} = -6y - (-6y) = 0$.)

(c) $\pd{\phi}{x} = 3x^2 - 3y^2 \Rightarrow \phi = x^3 - 3xy^2 + f(y)$. Then $\pd{\phi}{y} = -6xy + f'(y)$ must equal $v = -6xy$, so $f' = 0$ and $\phi = x^3 - 3xy^2$ (+ const). Check: $\nabla^2\phi = 6x - 6x = 0$ ✓.

(d) At $(1, 1)$: $u = 3 - 3 = 0$ and $v = -6$ m/s, so $\vert\vb V\vert = 6$ m/s, straight down.`,
    check: [{ label: 'speed at (1, 1)', value: 6, units: 'm/s' }],
  },
  {
    id: 'pr-polar-psi',
    concept: 'phi-psi-velocities',
    difficulty: 2,
    q: md`For $\psi = 4r^2\sin 2\theta$ (m²/s), find $v_r$ and $v_\theta$ at $r = 0.5$ m, $\theta = 30^\circ$. Convert them to $u$ and $v$, and check your answer with the Cartesian form of $\psi$.`,
    hint: md`$v_r = \frac{1}{r}\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$; then $u = v_r\cos\theta - v_\theta\sin\theta$, $v = v_r\sin\theta + v_\theta\cos\theta$. Use $\sin 2\theta = 2\sin\theta\cos\theta$ for the check.`,
    answer: md`$v_r = 2.00$ m/s, $v_\theta = -3.46$ m/s; $u = 3.46$ m/s, $v = -2.00$ m/s; $\psi = 8xy$.`,
    solution: md`$v_r = \frac{1}{r}\pd{\psi}{\theta} = \frac{1}{r}\left(8r^2\cos 2\theta\right) = 8r\cos 2\theta = 8(0.5)(0.5) = 2.00$ m/s.

$v_\theta = -\pd{\psi}{r} = -8r\sin 2\theta = -8(0.5)(0.866) = -3.464$ m/s.

$u = v_r\cos\theta - v_\theta\sin\theta = 2(0.866) + 3.464(0.5) = 3.464$ m/s; $\quad v = v_r\sin\theta + v_\theta\cos\theta = 2(0.5) - 3.464(0.866) = -2.000$ m/s.

Check: $\psi = 4r^2(2\sin\theta\cos\theta) = 8(r\cos\theta)(r\sin\theta) = 8xy$, so $u = 8x = 8(0.433) = 3.464$ m/s ✓ and $v = -8y = -8(0.25) = -2.000$ m/s ✓.`,
    check: [
      { label: 'v_r', value: 2, units: 'm/s' },
      { label: 'v_θ', value: -3.464, units: 'm/s' },
    ],
  },
  {
    id: 'pr-uniform-polar',
    concept: 'phi-psi-velocities',
    difficulty: 1,
    q: md`A uniform flow of speed $U = 5$ m/s at $\alpha = 30^\circ$ to the $x$ axis has $\phi = U(x\cos\alpha + y\sin\alpha)$. (a) Write $\phi$ in polar form. (b) Find $v_r$ and $v_\theta$ at points on the positive $y$ axis ($\theta = 90^\circ$).`,
    hint: md`$x\cos\alpha + y\sin\alpha = r(\cos\theta\cos\alpha + \sin\theta\sin\alpha) = r\cos(\theta - \alpha)$.`,
    answer: md`$\phi = Ur\cos(\theta - \alpha)$; $v_r = U\cos(\theta - \alpha) = 2.50$ m/s and $v_\theta = -U\sin(\theta - \alpha) = -4.33$ m/s, at any $r$.`,
    solution: md`(a) $\phi = Ur\cos(\theta - \alpha)$.

(b) $v_r = \pd{\phi}{r} = U\cos(\theta - \alpha) = 5\cos 60^\circ = 2.50$ m/s; $\quad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -U\sin(\theta - \alpha) = -5\sin 60^\circ = -4.33$ m/s.

Check: $u = U\cos\alpha = 4.33$ m/s and $v = U\sin\alpha = 2.50$ m/s. On the $y$ axis the radial direction is $+y$ and the $+\theta$ direction is $-x$, so $v_r = v = 2.50$ m/s ✓ and $v_\theta = -u = -4.33$ m/s ✓. Neither depends on $r$ — in a uniform flow the polar components change only with direction.`,
    check: [
      { label: 'v_r', value: 2.5, units: 'm/s' },
      { label: 'v_θ', value: -4.33, units: 'm/s' },
    ],
  },
  {
    id: 'pr-slopes',
    concept: 'orthogonality',
    difficulty: 1,
    q: md`For the plane potential flow $\phi = x^2 - y^2 + 2x$ (course convention; m²/s, $x, y$ in m), find the slopes of the streamline and of the equipotential through $(2, 1)$ m, verify that they are perpendicular, and locate the stagnation point.`,
    hint: md`$u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$; then Eqs. (6.34) and (6.35).`,
    answer: md`$u = 6$ m/s, $v = -2$ m/s; streamline slope $v/u = -1/3$, equipotential slope $-u/v = 3$; product $-1$; stagnation point $(-1, 0)$ m.`,
    solution: md`$u = 2x + 2 = 6$ m/s and $v = -2y = -2$ m/s at $(2, 1)$.

Streamline (Eq. 6.34): $\left.\frac{dy}{dx}\right|_\psi = \frac{v}{u} = -\frac{1}{3}$. Equipotential (Eq. 6.35): $\left.\frac{dy}{dx}\right|_\phi = -\frac{u}{v} = 3$. Product $= -1$ ✓.

The stream function is $\psi = 2xy + 2y$ (from $\pd{\psi}{y} = u$, $-\pd{\psi}{x} = v$); implicit differentiation gives $-\psi_x/\psi_y = -2y/(2x + 2) = -1/3$ ✓.

Stagnation point: $2x + 2 = 0$ and $-2y = 0$, i.e. $(-1, 0)$ m. There both slopes are undefined.`,
    check: [
      { label: 'equipotential slope', value: 3 },
      { label: 'streamline slope', value: -0.3333 },
    ],
  },
  {
    id: 'pr-rotational',
    concept: 'orthogonality',
    difficulty: 2,
    q: md`Someone proposes to draw a flow net for the plane flow $\psi = x^2 + y^2$ (m²/s; $x, y$ in m). (a) Find $u$, $v$ and $\nabla^2\psi$. (b) Compute $\omega_z$. (c) Can a velocity potential — and hence a flow net — be constructed?`,
    hint: md`Slide 5: $\psi$ satisfies Laplace's equation only if the flow is irrotational. Slide 4: $\phi$ exists only if $\omega_z = 0$.`,
    answer: md`$u = 2y$, $v = -2x$; $\nabla^2\psi = 4\ \mathrm{s^{-1}} \ne 0$; $\omega_z = -2\ \mathrm{s^{-1}}$ (rigid clockwise rotation); no $\phi$ exists, so no flow net.`,
    solution: md`(a) $u = \pd{\psi}{y} = 2y$, $\ v = -\pd{\psi}{x} = -2x$; $\ \nabla^2\psi = 2 + 2 = 4\ \mathrm{s^{-1}}$.

(b) $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(-2 - 2) = -2\ \mathrm{s^{-1}}$: every element spins clockwise at 2 rad/s, like a rigid body (a forced vortex). Note that $\nabla^2\psi = -2\omega_z$.

(c) No. Since $\omega_z \ne 0$ there is no $\phi$ with $\vb V = \nabla\phi$: trying $\pd{\phi}{x} = 2y$ gives $\phi = 2xy + f(y)$, and then $\pd{\phi}{y} = 2x + f'(y)$ can never equal $v = -2x$. The circular streamlines are real, but there is no family of equipotentials, so the flow-net construction (which needs both families, with $\nabla^2\phi = \nabla^2\psi = 0$) does not apply.`,
    check: [
      { label: '∇²ψ', value: 4, units: '1/s' },
      { label: 'ω_z', value: -2, units: '1/s' },
    ],
  },
  {
    id: 'pr-angle',
    concept: 'orthogonality',
    difficulty: 1,
    q: md`At a point in a plane potential flow the streamline makes $35^\circ$ with the $x$ axis. What is the slope of the equipotential through that point, and what angle does it make with the $x$ axis?`,
    hint: md`Perpendicular lines have slopes that are negative reciprocals: $m_\phi = -1/m_\psi$.`,
    answer: md`$m_\psi = \tan 35^\circ = 0.7002$; $m_\phi = -1/0.7002 = -1.428$; the equipotential is at $125^\circ$ (equivalently $-55^\circ$) to the $x$ axis.`,
    solution: md`$m_\psi = \tan 35^\circ = 0.7002 = v/u$. From Eqs. (6.34)–(6.35), $m_\phi = -u/v = -1/m_\psi = -1.428$. Its inclination is $\tan^{-1}(-1.428) = -55^\circ$, i.e. $35^\circ + 90^\circ = 125^\circ$ measured the other way round. The velocity points along the streamline (at $35^\circ$ or $215^\circ$, depending on the sign of $u$) and therefore always straight across the equipotential.`,
    check: [{ label: 'equipotential slope', value: -1.428 }],
  },
  {
    id: 'pr-flowrate-direction',
    concept: 'flow-net',
    difficulty: 1,
    q: md`Two streamlines in a plane flow carry the values $\psi_1 = 0.8\ \mathrm{m^2/s}$ (the lower one) and $\psi_2 = 0.3\ \mathrm{m^2/s}$ (the upper one), as in the sketches of slide 6. (a) Find $q = \psi_2 - \psi_1$ and the direction of the flow between them. (b) What volume flow passes between them over a depth of 2 m normal to the plane?`,
    hint: md`Slide 6: $\psi_2 > \psi_1$ means flow to the right; $\psi_2 < \psi_1$ means flow to the left.`,
    answer: md`$q = -0.5\ \mathrm{m^2/s}$: $0.5\ \mathrm{m^2/s}$ per metre depth flowing **to the left**; $Q = 1.0\ \mathrm{m^3/s}$ over the 2 m depth.`,
    solution: md`(a) $q = \psi_2 - \psi_1 = 0.3 - 0.8 = -0.5\ \mathrm{m^2/s}$. The magnitude is the flow per metre depth; the negative sign (the upper streamline has the smaller $\psi$) means the flow goes **from right to left** — the third sketch on slide 6. Check with $u = \pd{\psi}{y}$: $\psi$ decreases upward, so $u < 0$.

(b) $Q = \vert q\vert\,b = 0.5 \times 2 = 1.0\ \mathrm{m^3/s}$.`,
    check: [
      { label: 'q = ψ₂ − ψ₁ (signed)', value: -0.5, units: 'm²/s' },
      { label: 'Q over 2 m depth', value: 1.0, units: 'm³/s' },
    ],
  },
  {
    id: 'pr-contraction',
    concept: 'flow-net',
    difficulty: 2,
    q: md`In the flow net of a horizontal 2-D contraction carrying air ($\rho = 1.2\ \mathrm{kg/m^3}$), one stream tube is 40 mm wide where the speed is 1.5 m/s and narrows to 16 mm further downstream. Find the downstream speed and the pressure drop along the tube (irrotational flow).`,
    hint: md`Each tube carries a fixed $\Delta\psi = V\,\Delta n$; then apply Bernoulli between the two sections.`,
    answer: md`$V_2 = 3.75$ m/s; $p_1 - p_2 = 7.09$ Pa.`,
    solution: md`$\Delta\psi = V_1\,\Delta n_1 = 1.5 \times 0.040 = 0.060\ \mathrm{m^2/s}$. Downstream: $V_2 = \Delta\psi/\Delta n_2 = 0.060/0.016 = 3.75$ m/s ($= 1.5 \times 40/16$).

Bernoulli (Fox Eq. 6.26, $z$ constant): $p_1 - p_2 = \tfrac12\rho\left(V_2^2 - V_1^2\right) = 0.6\,(14.0625 - 2.25) = 7.09$ Pa.`,
    check: [
      { label: 'V₂', value: 3.75, units: 'm/s' },
      { label: 'p₁ − p₂', value: 7.0875, units: 'Pa' },
    ],
  },
  {
    id: 'pr-spacing-estimate',
    concept: 'flow-net',
    difficulty: 3,
    q: md`For the corner flow $\psi = 2xy$ (m²/s; $x, y$ in m), the streamlines $\psi = 1.9$ and $\psi = 2.1$ pass on either side of the point $(1, 1)$ m. (a) Find the distance $\Delta n$ between them along the normal through $(1, 1)$. (b) Estimate the speed there from the flow net, $V \approx \Delta\psi/\Delta n$, and compare with the exact speed.`,
    hint: md`At $(1, 1)$, $\nabla\psi = (2y, 2x) = (2, 2)$, so the normal is along $(1, 1)/\sqrt2$: points $(1 + t, 1 + t)$ have $\psi = 2(1 + t)^2$.`,
    answer: md`$\Delta n = 0.07073$ m; $V \approx 0.2/0.07073 = 2.8275$ m/s versus the exact $2\sqrt2 = 2.8284$ m/s (about $0.03\%$ low).`,
    solution: md`(a) Along the normal, $\psi = 2(1 + t)^2$. For $\psi = 2.1$: $(1 + t)^2 = 1.05$, $t = 0.024695$. For $\psi = 1.9$: $(1 + t)^2 = 0.95$, $t = -0.025321$. Each unit of $t$ is a distance $\sqrt2$, so $\Delta n = \sqrt2\,(0.024695 + 0.025321) = 0.07073$ m.

(b) $V \approx \Delta\psi/\Delta n = 0.2/0.07073 = 2.8275$ m/s. Exact: $u = 2x = 2$, $v = -2y = -2$ m/s, $\vert\vb V\vert = 2\sqrt2 = 2.8284$ m/s. The difference is $-0.03\%$: in a fine net the spacing rule is very accurate (the residual error comes from the slight change of speed across the gap).`,
    check: [
      { label: 'Δn', value: 0.07073, units: 'm' },
      { label: 'V estimate', value: 2.8275, units: 'm/s' },
    ],
  },
]

/* -------------------------------------------------------------------------------------------- quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-polar-phi',
    concept: 'phi-psi-velocities',
    difficulty: 1,
    src: S3,
    q: md`In the course (Lecture 12) sign convention, which pair gives the polar velocity components from the velocity potential?`,
    options: [
      md`$v_r = \pd{\phi}{r}$, $\ v_\theta = \frac{1}{r}\pd{\phi}{\theta}$`,
      md`$v_r = \frac{1}{r}\pd{\phi}{\theta}$, $\ v_\theta = -\pd{\phi}{r}$`,
      md`$v_r = \pd{\phi}{r}$, $\ v_\theta = \pd{\phi}{\theta}$`,
      md`$v_r = -\pd{\phi}{r}$, $\ v_\theta = -\frac{1}{r}\pd{\phi}{\theta}$`,
    ],
    answer: 0,
    explain: md`$\vb V = \nabla\phi$, and the polar gradient is $\vb e_r\pd{}{r} + \vb e_\theta\frac{1}{r}\pd{}{\theta}$. The second pair is the **ψ pattern** applied to the wrong function; the third drops the $1/r$ (it would have units of m²/s, not m/s); the fourth is Fox's convention $\vb V = -\nabla\phi$ — correct in that book, wrong sign for this course.`,
  },
  {
    id: 'q-phi-step',
    concept: 'phi-psi-velocities',
    difficulty: 1,
    q: md`In a plane potential flow, $\phi$ rises by $0.30\ \mathrm{m^2/s}$ over a short step of $0.10$ m in the $+x$ direction and does not change for a short step in $y$. What is the velocity there (course convention)?`,
    options: [md`$u = 3$ m/s, $v = 0$`, md`$u = -3$ m/s, $v = 0$`, md`$u = 0.03$ m/s, $v = 0$`, md`$u = 0$, $v = 3$ m/s`],
    answer: 0,
    explain: md`$u = \pd{\phi}{x} \approx 0.30/0.10 = 3$ m/s and $v = \pd{\phi}{y} = 0$: in the course convention the fluid moves toward increasing $\phi$. The value $-3$ m/s follows from Fox's $\vb V = -\nabla\phi$; $0.03$ multiplies instead of dividing; and a change along $x$ tells you about $u$, not $v$.`,
  },
  {
    id: 'q-psi-exists',
    concept: 'phi-psi-velocities',
    difficulty: 2,
    q: md`A stream function $\psi$ can be defined for a plane flow that is…`,
    options: [
      'incompressible — whether rotational or not',
      'irrotational — whether incompressible or not',
      'both incompressible and irrotational, and no less',
      'inviscid',
    ],
    answer: 0,
    explain: md`$u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ satisfy plane continuity identically, so incompressibility is all $\psi$ needs. Irrotationality is what $\phi$ needs; both conditions together are needed only for **both** functions to exist (and for $\nabla^2\psi = 0$). Viscosity plays no part in whether either function exists.`,
  },
  {
    id: 'q-potential-flow',
    concept: 'phi-psi-velocities',
    difficulty: 1,
    src: S2,
    q: md`According to slide 2, which flow fields are governed by Laplace's equation (the "potential flows")?`,
    options: ['inviscid, incompressible, irrotational flows', 'viscous, incompressible flows', 'any steady flow', 'compressible, irrotational flows'],
    answer: 0,
    explain: md`$\nabla\cdot\vb V = 0$ (incompressible) together with $\vb V = \nabla\phi$ (irrotational) gives $\nabla^2\phi = 0$; the inviscid assumption is what keeps an initially irrotational flow irrotational. Viscous flows generate vorticity, steadiness alone gives no Laplace equation, and in a compressible flow $\nabla\cdot\vb V \ne 0$.`,
  },
  {
    id: 'q-slope-phi',
    concept: 'orthogonality',
    difficulty: 1,
    src: [S5, { doc: 'fox', pages: '224', note: 'Eq. (6.35)' }],
    q: md`What is the slope $dy/dx$ of an equipotential line at a point where the velocity is $(u, v)$?`,
    options: [md`$-u/v$`, md`$v/u$`, md`$u/v$`, md`$-v/u$`],
    answer: 0,
    explain: md`$d\phi = u\,dx + v\,dy = 0$ gives $dy/dx = -u/v$ (Eq. 6.35). $v/u$ is the **streamline** slope (Eq. 6.34): the velocity runs along a streamline but straight **across** an equipotential. $u/v$ and $-v/u$ come from losing a sign or inverting the fraction.`,
  },
  {
    id: 'q-laplace-psi',
    concept: 'orthogonality',
    difficulty: 2,
    src: S5,
    q: md`Why does $\psi$ satisfy $\nabla^2\psi = 0$ in the flows of this unit?`,
    options: [
      md`Substituting $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ into the irrotationality condition $\pd{u}{y} = \pd{v}{x}$ gives it`,
      md`Substituting $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ into the continuity equation gives it`,
      'It follows from the Bernoulli equation',
      'It holds because the flow is steady',
    ],
    answer: 0,
    explain: md`Slide 5: $\pd{}{y}\left(\pd{\psi}{y}\right) = \pd{}{x}\left(-\pd{\psi}{x}\right)$ rearranges to $\nabla^2\psi = 0$. Continuity is satisfied **identically** by any $\psi$ (it gives $0 = 0$, not Laplace) — which is why a rotational flow still has a $\psi$ but with $\nabla^2\psi \ne 0$. Bernoulli and steadiness play no role.`,
  },
  {
    id: 'q-stagnation',
    concept: 'orthogonality',
    difficulty: 2,
    q: md`At a stagnation point of a plane potential flow, the streamlines and equipotentials passing through that point…`,
    options: [
      md`need not cross at right angles, because $u = v = 0$ makes both slopes $0/0$`,
      'still cross at exactly 90°, as everywhere else',
      'coincide with each other',
      'cannot be drawn at all',
    ],
    answer: 0,
    explain: md`Eqs. (6.34)–(6.35) divide by $u$ and $v$. In corner flow $\psi = xy$, $\phi = \tfrac12(x^2 - y^2)$, the $\psi = 0$ lines (the axes) meet the $\phi = 0$ lines ($y = \pm x$) at $45^\circ$. The lines exist and are distinct — the right-angle rule just is not guaranteed there.`,
  },
  {
    id: 'q-fox-convention',
    concept: 'orthogonality',
    difficulty: 1,
    src: { doc: 'fox', pages: '224', note: 'Table 6.1, Eq. (6.35)' },
    q: md`True or false: using Fox's convention $\vb V = -\nabla\phi$ instead of the course's $\vb V = +\nabla\phi$ makes the equipotentials stop being perpendicular to the streamlines.`,
    options: ['True', 'False'],
    answer: 1,
    explain: md`False. Changing the sign of $\phi$ only relabels the equipotentials ($\phi \to -\phi$); every line stays where it was. Fox's Eq. (6.35) uses $\pd{\phi}{x} = -u$, $\pd{\phi}{y} = -v$, the signs cancel, and the slope is $-u/v$ in both conventions.`,
  },
  {
    id: 'q-q-between',
    concept: 'flow-net',
    difficulty: 1,
    src: S6,
    q: md`Two streamlines have $\psi_1 = 2\ \mathrm{m^2/s}$ and $\psi_2 = 5\ \mathrm{m^2/s}$. How much fluid flows between them?`,
    options: ['3 m²/s per metre of depth', '7 m²/s per metre of depth', '2.5 m²/s per metre of depth', 'It depends on the path along which it is measured'],
    answer: 0,
    explain: md`$q = \psi_2 - \psi_1 = 3\ \mathrm{m^2/s}$ per unit depth (slide 6). The values are subtracted, not added or averaged, and because $dq = d\psi$ is an exact differential, every path joining the two streamlines gives the same answer.`,
  },
  {
    id: 'q-crowding',
    concept: 'flow-net',
    difficulty: 1,
    src: [S7, F222],
    q: md`In a flow net, where the streamlines are closer together the speed is…`,
    options: [
      'higher, and (by Bernoulli) the pressure is lower',
      'lower, and the pressure is higher',
      'higher, and the pressure is higher too',
      'unchanged — the spacing only reflects how many lines were drawn',
    ],
    answer: 0,
    explain: md`Each tube carries the same $\Delta\psi = V\,\Delta n$, so $V \propto 1/\Delta n$ (slide 7). In irrotational flow $p + \tfrac12\rho V^2$ is the same everywhere (Fox Eq. 6.26), so a higher speed means a lower pressure. The spacing is meaningful precisely because the lines are drawn at **equal** increments of $\psi$.`,
  },
  {
    id: 'q-bend',
    concept: 'flow-net',
    difficulty: 1,
    src: S7,
    q: md`In the 90° bend of slide 7, compared with the inlet tubes (width $d$, speed $V$), the tube next to the **inner** wall of the bend has…`,
    options: [md`$d_2 < d$ and $V_2 > V$`, md`$d_2 > d$ and $V_2 < V$`, md`$d_2 = d$ and $V_2 = V$`, md`$d_2 < d$ and $V_2 < V$`],
    answer: 0,
    explain: md`The streamlines crowd toward the inside of the bend, so the inner tube narrows ($d_2 < d$) and, carrying the same $\Delta\psi$, speeds up ($V_2 > V$). The outer tube does the opposite ($d_1 > d$, $V_1 < V$). A narrower tube with a **lower** speed would lose fluid — impossible.`,
  },
  {
    id: 'q-squares',
    concept: 'flow-net',
    difficulty: 2,
    q: md`A flow net is drawn with equal increments $\Delta\phi = \Delta\psi$. Its cells are then approximately…`,
    options: [
      'squares (Δs ≈ Δn) everywhere away from stagnation points, large where the flow is slow',
      'rectangles with Δs = 2Δn',
      'all the same size everywhere',
      'squares only where the flow is uniform',
    ],
    answer: 0,
    explain: md`$\Delta\phi \approx V\,\Delta s$ and $\Delta\psi \approx V\,\Delta n$, so $\Delta s/\Delta n \approx \Delta\phi/\Delta\psi = 1$ at **every** point away from stagnation points — curvilinear squares whose size is $\propto 1/V$. Equal sizes everywhere would mean uniform flow, which is only one special case.`,
  },
]

/* -------------------------------------------------------------------------------------------- flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-cart',
    front: md`Cartesian velocity components from $\phi$ and from $\psi$ (course convention)?`,
    back: md`$u = \pd{\phi}{x} = \pd{\psi}{y}$, $\quad v = \pd{\phi}{y} = -\pd{\psi}{x}$.`,
    src: S3,
  },
  {
    id: 'fc-polar',
    front: md`Polar velocity components from $\phi$ and from $\psi$?`,
    back: md`$v_r = \pd{\phi}{r} = \frac{1}{r}\pd{\psi}{\theta}$, $\quad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r}$.`,
    src: S3,
  },
  {
    id: 'fc-potential-flow',
    front: 'What is a potential flow, and which equation governs it?',
    back: md`A flow field that is **inviscid, incompressible and irrotational**; it is governed by Laplace's equation, $\nabla^2\phi = 0$.`,
    src: S2,
  },
  {
    id: 'fc-exist',
    front: 'When do φ and ψ exist?',
    back: md`$\phi$: any **irrotational** flow (2-D or 3-D, steady or not). $\psi$: any **plane incompressible** flow (rotational or not). Both together, both harmonic: plane, incompressible, irrotational flow.`,
  },
  {
    id: 'fc-convention',
    front: 'Course vs Fox sign convention for φ?',
    back: md`Course: $\vb V = +\nabla\phi$ ($\phi$ rises downstream). Fox: $\vb V = -\nabla\phi$ ($\phi$ falls downstream, like temperature along a heat flow). Lines, slopes and flow nets are identical.`,
    src: [{ doc: 'fox', pages: '222' }, { doc: 'fox', pages: '224', note: 'Table 6.1' }],
  },
  {
    id: 'fc-slopes',
    front: 'Slopes of a streamline and of an equipotential (Fox Eqs. 6.34–6.35)?',
    back: md`$\left.\frac{dy}{dx}\right|_\psi = \frac{v}{u}$, $\quad\left.\frac{dy}{dx}\right|_\phi = -\frac{u}{v}$. Their product is $-1$, so the lines are orthogonal.`,
    src: [S5, F224],
  },
  {
    id: 'fc-laplace-psi',
    front: md`When does $\psi$ satisfy Laplace's equation?`,
    back: md`When the plane flow is also **irrotational**: substituting $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ into $\pd{u}{y} = \pd{v}{x}$ gives $\nabla^2\psi = 0$.`,
    src: S5,
  },
  {
    id: 'fc-stagnation',
    front: 'Where may streamlines and equipotentials fail to be orthogonal?',
    back: md`At **stagnation points** ($u = v = 0$), where both slopes are $0/0$. Example: at the corner of a corner flow they meet at $45^\circ$.`,
  },
  {
    id: 'fc-dq',
    front: 'Flow rate between two streamlines?',
    back: md`$dq = u\,dy - v\,dx = d\psi$, so $q = \psi_2 - \psi_1$ per unit depth. Upper streamline larger: flow to the right; smaller: flow to the left.`,
    src: S6,
  },
  {
    id: 'fc-spacing',
    front: 'How does the speed relate to the streamline spacing in a flow net?',
    back: md`$V \approx \Delta\psi/\Delta n$: velocity is inversely proportional to the streamline spacing. In a 90° bend $d_2 < d$, $V_2 > V$ at the inner wall and $d_1 > d$, $V_1 < V$ at the outer wall.`,
    src: S7,
  },
  {
    id: 'fc-squares',
    front: 'Why are flow-net cells "curvilinear squares"?',
    back: md`$\Delta\phi \approx V\,\Delta s$ and $\Delta\psi \approx V\,\Delta n$; with $\Delta\phi = \Delta\psi$ this forces $\Delta s \approx \Delta n$. Small squares mean fast flow, large squares slow flow.`,
  },
]

/* -------------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`In plane potential flow every velocity component can be read **two ways**: $u = \pd{\phi}{x} = \pd{\psi}{y}$, $v = \pd{\phi}{y} = -\pd{\psi}{x}$; in polar form $v_r = \pd{\phi}{r} = \frac{1}{r}\pd{\psi}{\theta}$ and $v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r}$.`,
  md`$\phi$ exists because the flow is **irrotational** ($\vb V = \nabla\phi$); $\psi$ exists because it is **plane and incompressible**. Inviscid, incompressible, irrotational ("potential") flow is governed by Laplace's equation, and then $\nabla^2\phi = \nabla^2\psi = 0$.`,
  md`The course writes $\vb V = +\nabla\phi$; Fox writes $\vb V = -\nabla\phi$. The sign of $\phi$ flips — nothing else does.`,
  md`Streamline slope $v/u$ (Eq. 6.34) times equipotential slope $-u/v$ (Eq. 6.35) $= -1$: the two families are **orthogonal**, except at stagnation points where both slopes are $0/0$.`,
  md`$dq = u\,dy - v\,dx = d\psi$: the flow between two streamlines is $q = \psi_2 - \psi_1$ per unit depth, for every path; it goes to the right when the upper streamline has the larger $\psi$.`,
  md`A **flow net** draws both families at equal increments. Each stream tube carries the same $\Delta\psi$, so $V \approx \Delta\psi/\Delta n$: **speed is inversely proportional to streamline spacing**.`,
  md`With $\Delta\phi = \Delta\psi$ the cells are curvilinear **squares**: small squares mean fast flow, large squares slow flow.`,
  md`To read pressure, use Bernoulli for irrotational flow: $p + \tfrac12\rho V^2$ (+ $\rho g z$) is the same everywhere, so crowded lines mean **low** pressure and spread lines **high** pressure.`,
  md`In a 90° bend the fluid speeds up at the inner wall ($d_2 < d$, $V_2 > V$) and slows at the outer wall ($d_1 > d$, $V_1 < V$); the outward pressure rise turns the flow.`,
  md`Exam checklist: state your sign convention, test $\nabla^2 = 0$ before drawing a net, keep the $1/r$ in polar derivatives, and never apply the right-angle rule at a stagnation point.`,
]

/* -------------------------------------------------------------------------------------------- content */

export default function Content() {
  const nb = bendNumbers()
  const f = (x: number) => num.fmt(x, 3)
  return (
    <>
      {/* ============================================================== Concept 1 */}
      <Concept id="phi-psi-velocities">
        <Step kind="intro" src={[{ doc: 'lec12', pages: '2–4' }, { doc: 'fox', pages: '222, 224', note: 'Eq. (6.27), Table 6.1 — sign convention' }]}>
          <Md>{md`Unit A ended with two scalar functions for a plane flow — the stream function $\psi$ and the velocity potential $\phi$. **Lecture 12 opens Unit B by putting them to work.**

          **Slide 2** restates the governing equation. If a flow is **incompressible and irrotational**, the velocity potential satisfies $\nabla^2\phi = 0$, where $\nabla^2$ is the **Laplacian operator**; written out in Cartesian coordinates this is **Laplace's equation**. Flow fields that are **inviscid, incompressible and irrotational** are governed by Laplace's equation, and the lecture calls them **potential flows** — the subject of this whole unit.

          **Slide 4** recalls why $\phi$ exists. In an irrotational flow every rotation component vanishes — for example $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = 0$ — which is the same as three equalities of cross-derivatives. Then the velocity can be written as the **gradient of a scalar function** $\phi(x, y, z, t)$: $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$, $w = \pd{\phi}{z}$, i.e. $\vb V = \nabla\phi$. The slide's sketch is the simplest example, a uniform stream $u = U$, $v = w = 0$.

          **Slide 3** spells out what this means for a **plane** flow, in both Cartesian $(x, y)$ and polar $(r, \theta)$ coordinates — and then adds, in red, that *we can define a stream function for plane flow*. So in a plane potential flow every velocity component can be found **two ways**: from $\phi$ or from $\psi$.`}</Md>
          <Callout kind="note" title="Sign convention used in this course">
            <Md>{md`Lecture 12 uses $\vb V = +\nabla\phi$, so $\phi$ **increases** in the flow direction. Fox & McDonald (Table 6.1, p. 224) use $\vb V = -\nabla\phi$, so their $\phi$ **decreases** downstream. Fox's $\phi$ is simply the negative of ours: every line, slope and flow net in this topic is the same in both books. Always state which convention you use in an exam answer.`}</Md>
          </Callout>
          <Supplement title="Why it matters">
            <Md>{md`These few relations are the toolkit for the rest of Unit B. Each elementary flow (uniform flow, source, sink, vortex) is specified by its $\phi$ or $\psi$; the velocity follows by differentiation, and the pressure then follows from Bernoulli. The fact that $\phi$ and $\psi$ give the **same** velocity is also what makes the flow net of this topic work.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`**φ as a landscape.** Picture $\phi(x, y)$ as the height of a smooth hill. With $\vb V = \nabla\phi$, the fluid at each point moves in the direction in which the hill climbs most steeply, at a speed equal to the steepness. Contour lines of the hill are the **equipotentials**; the velocity always cuts straight across them. Where the contours are crowded the slope is steep and the flow is fast.

          **ψ as a ledger.** The contour lines of $\psi$ are the **streamlines**, and the difference in $\psi$ between two of them is the flow squeezed between them. The velocity runs **along** these contours, and again crowded contours mean fast flow.

          **One arrow, two bookkeepers.** Both functions describe the same arrow $\vb V$. In fact $\nabla\psi = (-v, u)$ is exactly $\nabla\phi = (u, v)$ turned through $90^\circ$ — same length, perpendicular direction. Remember that sentence: it is the whole of the next two concepts in disguise.`}</Md>
          <Compare
            items={[
              {
                title: 'From φ (needs irrotational flow)',
                md: md`Take the derivative **along** the component: $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$, $v_r = \pd{\phi}{r}$, $v_\theta = \frac{1}{r}\pd{\phi}{\theta}$. No minus signs (course convention).`,
                tone: 'amber',
              },
              {
                title: 'From ψ (needs plane, incompressible flow)',
                md: md`Take the derivative **across** the component: $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$, $v_r = \frac{1}{r}\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$. The minus sits on $v$ and on $v_\theta$.`,
                tone: 'indigo',
              },
            ]}
          />
          <Callout kind="tip" title="Why the 1/r?">
            <Md>{md`A velocity is a change **per metre**. Stepping outward by $dr$ moves you $dr$ metres, so $v_r = \pd{\phi}{r}$. Stepping round by $d\theta$ moves you an arc length $r\,d\theta$, so the rate of change per metre is $\frac{1}{r}\pd{\phi}{\theta}$. Without the $1/r$ the "velocity" would have units of m²/s. The same logic gives $v_r = \frac{1}{r}\pd{\psi}{\theta}$: the flow $d\psi$ crossing an arc $r\,d\theta$ is $v_r\,r\,d\theta$.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[S3, S4]}>
          <Figure
            caption="Slide 3: the same velocity V split into Cartesian components u, v (left) and polar components v_r, v_θ (right). Dark labels are the φ route printed on the slide; grey labels give the matching ψ route."
            src={S3}
          >
            <VelocityComponentsFigure />
          </Figure>
          <Figure
            caption="Slide 4: the simplest irrotational flow, a uniform stream u = U, v = 0, w = 0. Its potential must satisfy ∂φ/∂x = U and ∂φ/∂y = ∂φ/∂z = 0 — this is worked out (φ = Ux) on slide 8 in the next topic."
            src={S4}
          >
            <UniformFlowFigure />
          </Figure>
          <Supplement title="Recipe: from a potential to the velocity at a point">
            <FlowSteps
              steps={[
                { title: 'Check the function', md: md`Plane potential flow needs $\nabla^2\phi = 0$ (or $\nabla^2\psi = 0$). A non-harmonic function is not a potential flow.`, tone: 'slate' },
                { title: 'Pick coordinates', md: md`Use the form the function is written in; polar for sources, sinks, vortices and wedges.`, tone: 'cyan' },
                { title: 'Differentiate', md: md`From $\phi$: along the component. From $\psi$: across it, with the minus on $v$ or $v_\theta$, and the $1/r$ on every $\theta$-derivative.`, tone: 'indigo' },
                { title: 'Evaluate and cross-check', md: md`Compute the other route, or convert with $u = v_r\cos\theta - v_\theta\sin\theta$, $v = v_r\sin\theta + v_\theta\cos\theta$. Both must give the same $\vert\vb V\vert$.`, tone: 'emerald' },
              ]}
            />
          </Supplement>
        </Step>

        <Step kind="equations" src={{ doc: 'lec12', pages: '2–4' }}>
          <FormulaCard id="laplace-phi" />
          <FormulaCard id="irrotational" />
          <FormulaCard id="phi-gradient" />
          <FormulaCard id="vel-phi-plane" />
          <FormulaCard id="vel-psi-plane" />
          <Supplement title="Where the polar forms come from">
            <Derivation
              steps={[
                { md: md`$\nabla = \vb e_r\pd{}{r} + \vb e_\theta\frac{1}{r}\pd{}{\theta}$ in plane polar coordinates.`, why: 'gradient operator (the same operator appears as Fox Eq. 3.19, p. 222)' },
                { md: md`$\vb V = \nabla\phi = \pd{\phi}{r}\vb e_r + \frac{1}{r}\pd{\phi}{\theta}\vb e_\theta \;\Rightarrow\; v_r = \pd{\phi}{r},\ v_\theta = \frac{1}{r}\pd{\phi}{\theta}$`, why: 'read off the components' },
                { md: md`Across an arc element $r\,d\theta$ (between two radial lines) the flow is $d\psi = v_r\,r\,d\theta \;\Rightarrow\; v_r = \frac{1}{r}\pd{\psi}{\theta}$`, why: 'Δψ = flow between streamlines' },
                { md: md`Across a radial element $dr$ the flow in the $+\theta$ direction is $v_\theta\,dr = -d\psi \;\Rightarrow\; v_\theta = -\pd{\psi}{r}$`, why: 'same sign rule as v = −∂ψ/∂x' },
              ]}
            />
          </Supplement>
          <FormulaCard id="cauchy-riemann" />
          <FormulaCard id="polar-cartesian" />
          <FormulaCard id="laplace-polar" />
          <Callout kind="exam" title="What each function needs">
            <Md>{md`| | exists when the flow is… | satisfies Laplace when the flow is also… |
            |---|---|---|
            | $\psi$ | plane and **incompressible** (rotational or not) | **irrotational** |
            | $\phi$ | **irrotational** (2-D or 3-D, steady or not) | **incompressible** |

            A typical exam twist gives a rotational $(u, v)$ — it has a $\psi$ but no $\phi$, so asking for "the velocity potential" has no answer.`}</Md>
          </Callout>
          <Callout kind="warning">
            <Md>{md`Three classic slips: (1) using the $\psi$ pattern on $\phi$ ($v = -\pd{\phi}{x}$ is wrong); (2) dropping the $1/r$ on a $\theta$-derivative; (3) mixing Fox's $\vb V = -\nabla\phi$ with the course's formulas in one answer, which flips the sign of every $\phi$-derived component.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="corner-four-routes" />
          <ExampleCard id="wedge-polar" />
        </Step>

        <Step kind="interactive">
          <VelocityRoutes />
        </Step>

        <Step kind="practice">
          <PracticeList concept="phi-psi-velocities" />
          <QuickCheck ids={['q-polar-phi', 'q-phi-step']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Inviscid, incompressible, irrotational flow = **potential flow**, governed by Laplace's equation $\nabla^2\phi = 0$ (slide 2).`,
              md`Irrotational ⇔ $\vb V = \nabla\phi$: $u = \pd{\phi}{x}$, $v = \pd{\phi}{y}$, $w = \pd{\phi}{z}$; plane polar form $v_r = \pd{\phi}{r}$, $v_\theta = \frac{1}{r}\pd{\phi}{\theta}$.`,
              md`The same plane flow also gives $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$, $v_r = \frac{1}{r}\pd{\psi}{\theta}$, $v_\theta = -\pd{\psi}{r}$ — compute both routes as a check.`,
              md`Exam traps: the $1/r$ on $\theta$-derivatives, the minus signs on $v$ and $v_\theta$ in the $\psi$ route, and Fox's opposite sign for $\phi$.`,
              md`A rotational plane flow has a $\psi$ but **no** $\phi$; test $\pd{v}{x} - \pd{u}{y}$ (or $\nabla^2\psi$) first.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== Concept 2 */}
      <Concept id="orthogonality">
        <Step kind="intro" src={[S5, { doc: 'fox', pages: '224', note: 'Eqs. (6.34)–(6.35)' }]}>
          <Md>{md`Slide 5 asks a geometric question: how do the two families of lines — **streamlines** ($\psi$ = const) and **equipotential lines** ($\phi$ = const) — sit relative to each other? Three results are derived on the slide:

          1. Along a streamline the slope is $dy/dx = v/u$.
          2. In irrotational plane flow, substituting $u = \pd{\psi}{y}$ and $v = -\pd{\psi}{x}$ into $\pd{u}{y} = \pd{v}{x}$ shows that **$\psi$ also satisfies Laplace's equation**.
          3. From $d\phi = u\,dx + v\,dy$, an equipotential (where $d\phi = 0$) has slope $dy/dx = -u/v$.

          Because $(v/u)(-u/v) = -1$, **equipotential lines are orthogonal to the streamlines at all points where they intersect**. The slide's small sketch makes the point with two slope triangles: $\frac{a}{b}\times\left(-\frac{b}{a}\right) = -1$.

          Fox & McDonald (p. 224) obtain the same two slopes, **Eqs. (6.34) and (6.35)**, by setting $d\psi = 0$ along a line of constant $\psi$ and $d\phi = 0$ along a line of constant $\phi$, and remark that this orthogonality is useful in **graphical analyses of flow fields** — the flow nets of the next concept. The same page summarises, in **Table 6.1**, what each function satisfies automatically and when it satisfies Laplace's equation.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`**One sentence proof.** The velocity is the gradient of $\phi$, and a gradient always points straight across the contour lines of its function — so $\vb V$ is perpendicular to the equipotentials. The velocity is also tangent to the streamlines. A line along $\vb V$ and a line across $\vb V$ must be perpendicular to each other. That is all slide 5 is saying, written with slopes.

          **Everyday versions.** On a map, water running downhill crosses the contour lines at right angles. In a heated plate, heat flows along lines that cut the isotherms at right angles (Fox uses exactly this analogy for $\phi$). Streamlines and equipotentials are the "flow lines" and "contour lines" of the same picture.

          **Where it breaks.** The argument needs a direction for $\vb V$. At a **stagnation point** the velocity is zero, there is no direction, and both slope formulas become $0/0$ — the lines through such a point need not meet at right angles (in corner flow they meet at $45^\circ$).`}</Md>
          <Callout kind="warning" title="Common mistake">
            <Md>{md`"$\psi$ always satisfies Laplace's equation." No: **continuity** is what $\psi$ satisfies automatically. $\nabla^2\psi = 0$ needs **irrotational** flow (in general $\nabla^2\psi = -2\omega_z$). A rotational flow has streamlines but no equipotentials, and no flow net.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[S5, { doc: 'fox', pages: '224' }]}>
          <Figure caption="Slide 5 sketch: the steep line has slope a/b, the perpendicular line has slope −b/a, and (a/b)(−b/a) = −1 for any angle. Drag the slider — the product never changes." src={S5}>
            <SlopeTriangleFigure />
          </Figure>
          <Figure caption="Fox Example 6.10's flow, ψ = 3(x² − y²), with φ = −6xy (course convention), at equal increments Δψ = Δφ = 1.5 m²/s: two families of rectangular hyperbolas meeting at right angles everywhere — except at the stagnation point, where the ψ = 0 lines (y = ±x, red) meet the φ = 0 lines (the axes) at 45°. Hover to probe u, v, ψ and φ.">
            <FlowField
              x={[-2, 2]}
              y={[-2, 2]}
              psi={fox610.psi}
              phi={fox610.phi}
              vel={fox610.vel}
              psiLevels={FOX_PSI_LEVELS}
              phiLevels={FOX_PHI_LEVELS}
              equipotentials
              highlight={FOX_HL}
              markers={ORIGIN_STAG}
              particles={70}
              Uref={6}
              maxHeight={420}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={[S5, { doc: 'fox', pages: '224' }]}>
          <Derivation
            title="Slide 5: ψ satisfies Laplace's equation in irrotational plane flow"
            steps={[
              { md: md`$\pd{u}{y} = \pd{v}{x}$`, why: 'irrotational plane flow (ω_z = 0, slide 4)' },
              { md: md`$\pd{}{y}\left(\pd{\psi}{y}\right) = \pd{}{x}\left(-\pd{\psi}{x}\right)$`, why: 'substitute u = ∂ψ/∂y, v = −∂ψ/∂x' },
              { md: md`$\frac{\partial^2\psi}{\partial x^2} + \frac{\partial^2\psi}{\partial y^2} = 0$`, why: 'rearrange' },
            ]}
          />
          <FormulaCard id="laplace-psi" />
          <Md>{md`**Fox Table 6.1** (p. 224) — what $\psi$ and $\phi$ satisfy (written in **Fox's** convention for $\phi$):

          | | definition | always satisfies… | satisfies Laplace's equation… |
          |---|---|---|---|
          | stream function $\psi$ | $u = \pd{\psi}{y}$, $v = -\pd{\psi}{x}$ | **incompressibility**: $\pd{u}{x} + \pd{v}{y} = \frac{\partial^2\psi}{\partial x\,\partial y} - \frac{\partial^2\psi}{\partial y\,\partial x} \equiv 0$ | **only if irrotational**: $\pd{v}{x} - \pd{u}{y} = -\frac{\partial^2\psi}{\partial x\,\partial x} - \frac{\partial^2\psi}{\partial y\,\partial y} = 0$ |
          | velocity potential $\phi$ | $u = -\pd{\phi}{x}$, $v = -\pd{\phi}{y}$ | **irrotationality**: $\pd{v}{x} - \pd{u}{y} = -\frac{\partial^2\phi}{\partial x\,\partial y} + \frac{\partial^2\phi}{\partial y\,\partial x} \equiv 0$ (see note) | **only if incompressible**: $\pd{u}{x} + \pd{v}{y} = -\frac{\partial^2\phi}{\partial x\,\partial x} - \frac{\partial^2\phi}{\partial y\,\partial y} = 0$ |`}</Md>
          <Callout kind="note" title="Two misprints on Fox p. 224">
            <Md>{md`(1) In Table 6.1 the $\phi$-row "irrotationality" cell is printed with a **minus** between the two mixed derivatives; since $\pd{v}{x} = -\frac{\partial^2\phi}{\partial x\,\partial y}$ and $-\pd{u}{y} = +\frac{\partial^2\phi}{\partial y\,\partial x}$, the correct sign is **plus** (as shown above), and the two terms cancel. (2) In Eq. (6.34) the middle term is printed as $-(\partial\psi/dx)/(\partial x/\partial y)$; the intended expression, from $d\psi = 0$, is $-(\partial\psi/\partial x)/(\partial\psi/\partial y)$. The final result $v/u$ is correct.`}</Md>
          </Callout>
          <FormulaCard id="slope-psi" />
          <FormulaCard id="dphi" />
          <FormulaCard id="slope-phi" />
          <FormulaCard id="orthogonality" />
          <Callout kind="exam">
            <Md>{md`To prove orthogonality in an exam: (i) slope of $\psi$ = const from $d\psi = -v\,dx + u\,dy = 0$ → $v/u$; (ii) slope of $\phi$ = const from $d\phi = u\,dx + v\,dy = 0$ → $-u/v$; (iii) product $-1$; (iv) add the caveat "except at stagnation points, where $u = v = 0$". Step (iv) is the one most answers forget.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="fox-6-10" />
          <ExampleCard id="stagnation-check" />
        </Step>

        <Step kind="interactive">
          <FlowNetLab mode="orthogonality" presets={['fox610', 'corner', 'uniform', 'source', 'bend']} initial="fox610" />
        </Step>

        <Step kind="practice">
          <PracticeList concept="orthogonality" />
          <QuickCheck ids={['q-slope-phi', 'q-stagnation']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Streamline slope $v/u$ (Eq. 6.34), equipotential slope $-u/v$ (Eq. 6.35); product $-1$, so the families are orthogonal wherever they intersect.`,
              md`The quick reason: $\vb V = \nabla\phi$ is perpendicular to the $\phi$-contours and tangent to the $\psi$-contours.`,
              md`$\psi$ satisfies continuity automatically, but Laplace's equation **only if the flow is irrotational**; $\phi$ satisfies irrotationality automatically, but Laplace **only if incompressible** (Table 6.1).`,
              md`Exception: at a **stagnation point** both slopes are $0/0$ and the lines may cross at other angles (e.g. $45^\circ$ in corner flow).`,
              md`The convention ($\pm\nabla\phi$) changes the sign of $\phi$, never the slopes or the right angles.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== Concept 3 */}
      <Concept id="flow-net">
        <Step kind="intro" src={[S6, S7]}>
          <Md>{md`**Slide 6** gives $\psi$ its physical meaning. Take two neighbouring streamlines, $\psi$ and $\psi + d\psi$, and let $dq$ be the volume flow (per unit depth) passing between them. Join them by any small curve $AC$, and complete the triangle with a horizontal step $AB$ ($dx$) and a vertical step $BC$ ($dy$). Mass conservation for $ABC$: what crosses $AC$ leaves through $BC$ ($u\,dy$) and $AB$ ($-v\,dx$), so $dq = u\,dy - v\,dx$. With $u = \pd{\psi}{y}$ and $v = -\pd{\psi}{x}$ this is exactly the total differential: **$dq = d\psi$** — the change in the value of the stream function measures the volume rate of flow. Between two streamlines, $q = \psi_2 - \psi_1$, flowing **to the right** if the upper streamline has the larger value and **to the left** if it has the smaller.

          **Slide 7** puts both families together. A **flow net** is the family of streamlines plus the family of equipotential lines — an orthogonal grid (concept 2). Its key reading rule, in red on the slide: **velocity is inversely proportional to the streamline spacing.** The slide's example is the flow net of a **90° bend**: in the straight inlet the streamlines divide the channel into equal passages of width $d$ with speed $V$; in the bend the passages widen near the outer wall ($d_1 > d$, so $V_1 < V$) and narrow near the inner wall ($d_2 < d$, so $V_2 > V$).`}</Md>
          <Supplement title="Why it matters">
            <Md>{md`A flow net is a picture you can measure: speeds from line spacing, flow rates from $\psi$ values, and — with Bernoulli — pressures, without solving any equation by hand. Before computers, sketching nets was a standard way to solve potential-flow problems; it is still the fastest way to **read** and sanity-check a computed flow field (the same idea is used for seepage under dams, which also obeys Laplace's equation).`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`**Lanes on a motorway.** Think of each stream tube (the strip between two adjacent streamlines) as a lane that carries a fixed amount of traffic, $\Delta\psi$. No car ever changes lane — fluid never crosses a streamline. Where a lane narrows, the cars must go faster to keep the same flow: $V\,\Delta n = \Delta\psi = $ const. So **crowded streamlines = fast flow**.

          **The other family agrees.** The potential changes by $\Delta\phi \approx V\,\Delta s$ between two equipotentials a distance $\Delta s$ apart, so crowded equipotentials also mean fast flow. Draw both families with the **same** increment and the two gaps must be equal: every cell is a little **curvilinear square**, big where the flow is slow and small where it is fast.

          **Reading pressure.** In an irrotational flow $p + \tfrac12\rho V^2$ is the same everywhere. Small squares (fast) mean low pressure; big squares (slow) mean high pressure. In the bend, the fluid near the outer wall is slow and at **high** pressure, the fluid near the inner wall fast and at **low** pressure — and that outward pressure rise is exactly the centripetal push that turns the stream round the corner.`}</Md>
          <Callout kind="tip">
            <Md>{md`The spacing rule only works if the streamlines are drawn at **equal** steps of $\psi$. Lines picked "wherever they look nice" carry no speed information.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[S6, S7]}>
          <Figure
            caption="Slide 6: the flow dq between the streamlines ψ and ψ + dψ crosses the arbitrary curve AC; mass balance on ABC gives dq = u dy − v dx = dψ. Below: q = ψ₂ − ψ₁, flowing right when ψ₂ > ψ₁ and left when ψ₂ < ψ₁."
            src={S6}
          >
            <FlowRateFigure />
          </Figure>
          <Figure
            caption={`Slide 7's 90° bend, computed: Laplace's equation solved for ψ and φ in a channel of width w with an inner-wall radius 0.3w, drawn at Δψ = Δφ = q/4 (four tubes, as on the slide). At the 45° section d₂ = ${f(nb.d2)}w < d = 0.25w and d₁ = ${f(nb.d1)}w > d, so the tube-average speeds are V₂ ≈ ${f(nb.V2)}V and V₁ ≈ ${f(nb.V1)}V. Hover to read local u, v, |V| and Cp = 1 − (V/V_in)².`}
            src={S7}
          >
            <BendNetFigure />
          </Figure>
          <Supplement title="How uneven is the bend? Speed across the 45° section">
            <BendSpeedPlot />
            <Md>{md`The computed speed falls from about ${f(nb.Vinner)}$V$ at the inner wall to ${f(nb.Vouter)}$V$ at the outer wall. A pure free vortex, $V = q/(r\ln(b/a))$ (dashed; vortices come in the next topics), exaggerates the contrast a little, because the straight legs upstream and downstream keep the real flow closer to uniform.`}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={[S6, S7]}>
          <Derivation
            title="Slide 6: the flow between two streamlines"
            steps={[
              { md: md`$dq = u\,dy - v\,dx$`, why: 'mass balance on ABC: out through BC (u dy) and AB (−v dx)' },
              { md: md`$dq = \pd{\psi}{y}dy + \pd{\psi}{x}dx$`, why: 'substitute u = ∂ψ/∂y, v = −∂ψ/∂x' },
              { md: md`$dq = d\psi$`, why: 'the total differential of ψ' },
              { md: md`$q = \int_{\psi_1}^{\psi_2} d\psi = \psi_2 - \psi_1$`, why: 'integrate across the gap' },
            ]}
          />
          <FormulaCard id="dq-dpsi" />
          <FormulaCard id="q-psi" />
          <FormulaCard id="net-speed" />
          <FormulaCard id="net-squares" />
          <FormulaCard id="bernoulli-irrot" />
          <Supplement title="Sketching and reading a flow net by hand">
            <FlowSteps
              steps={[
                { title: 'Boundaries first', md: md`Solid walls are streamlines. Far upstream/downstream, where the flow is uniform, the cross-sections are equipotentials.`, tone: 'slate' },
                { title: 'Choose the tubes', md: md`Split the inlet into $N$ equal tubes, $\Delta\psi = q/N$; sketch the streamlines smoothly, never crossing.`, tone: 'cyan' },
                { title: 'Add equipotentials', md: md`Draw them at right angles to every streamline, spaced so that each cell is roughly square ($\Delta s \approx \Delta n$).`, tone: 'indigo' },
                { title: 'Refine', md: md`Adjust until all cells are curvilinear squares (a circle fits snugly inside each).`, tone: 'violet' },
                { title: 'Read', md: md`$V \approx \Delta\psi/\Delta n$; flow between any two lines $= \psi_2 - \psi_1$; pressure from $p + \tfrac12\rho V^2 =$ const.`, tone: 'emerald' },
              ]}
            />
          </Supplement>
          <Callout kind="warning">
            <Md>{md`Do not apply the spacing rule near a stagnation point (cells grow without bound as $V \to 0$) or a sharp convex corner (cells shrink to zero as $V \to \infty$ in the ideal flow), and do not read pressures across streamlines with Bernoulli unless the flow is irrotational.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="bend-reading" />
          <ExampleCard id="corner-flowrate" />
        </Step>

        <Step kind="interactive">
          <FlowNetLab mode="spacing" presets={['bend', 'corner', 'source', 'uniform']} initial="bend" />
          <FlowRateProbe />
        </Step>

        <Step kind="practice">
          <PracticeList concept="flow-net" />
          <QuickCheck ids={['q-crowding', 'q-bend']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$dq = u\,dy - v\,dx = d\psi$ (slide 6): the flow between two streamlines is $q = \psi_2 - \psi_1$ per unit depth, independent of the path.`,
              md`Direction: with $\psi_2$ the upper streamline, $\psi_2 > \psi_1$ → flow to the right; $\psi_2 < \psi_1$ → flow to the left.`,
              md`A flow net = streamlines + equipotentials at equal increments; **velocity is inversely proportional to streamline spacing**, $V \approx \Delta\psi/\Delta n$ (slide 7).`,
              md`With $\Delta\phi = \Delta\psi$ the cells are curvilinear squares; their size is $\propto 1/V$.`,
              md`In a 90° bend: inner wall $d_2 < d$, $V_2 > V$, low pressure; outer wall $d_1 > d$, $V_1 < V$, high pressure (Bernoulli, irrotational flow).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
