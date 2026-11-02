import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, PracticeList, QuickCheck,
  SourceChips, Step, Supplement, Takeaways, md,
} from '@/kit'
import { AccelerationProbe } from '../sims/kinematics/AccelerationProbe'
import { AngularElementFigure } from '../sims/kinematics/AngularElementFigure'
import { DilatationLab } from '../sims/kinematics/DilatationLab'
import { ElementSandbox } from '../sims/kinematics/ElementSandbox'
import { FourMotionsFigure } from '../sims/kinematics/FourMotionsFigure'
import { PaddleWheel } from '../sims/kinematics/PaddleWheel'
import { ShearDecompositionFigure } from '../sims/kinematics/ShearDecompositionFigure'
import { ShearRotationMap } from '../sims/kinematics/ShearRotationMap'
import { Slide5Figure } from '../sims/kinematics/Slide5Figure'
import { VelocityTriad } from '../sims/kinematics/VelocityTriad'

/** Lecture 9 reference helper (slide numbers = PDF pages). */
const L9 = (pages: string, note?: string): Src => (note ? { doc: 'lec9', pages, note } : { doc: 'lec9', pages })

// ───────────────────────────────────────────────────────────── meta ──

export const meta: TopicMeta = {
  id: 'kinematics',
  unit: 'A',
  title: 'Fluid Element Kinematics',
  subtitle:
    'How an infinitesimal fluid element translates, rotates, stretches and shears — and how each motion is read off the velocity field and its gradients.',
  minutes: 95,
  sources: [L9('2–9')],
  concepts: [
    {
      id: 'motion-types',
      title: 'Velocity & acceleration fields; the four kinds of element motion',
      src: L9('2–4'),
      summary: 'Velocity field, particle acceleration a = DV/Dt (local + convective), and the four kinds of fluid-element motion.',
    },
    {
      id: 'linear-deformation',
      title: 'Translation, linear deformation & volumetric dilatation rate',
      src: L9('5'),
      summary: 'Translation by u δt, v δt; stretching by the normal velocity gradients; volumetric dilatation rate = ∇·V.',
    },
    {
      id: 'rotation-vorticity',
      title: 'Rotation, vorticity & irrotational flow',
      src: L9('6–8'),
      summary: 'Angular velocities of two perpendicular lines, rotation ω = ½∇×V, vorticity ζ = 2ω = ∇×V, undeformed block, irrotational flow.',
    },
    {
      id: 'angular-deformation',
      title: 'Angular deformation: rate of shearing strain',
      src: L9('9'),
      summary: 'Shearing strain δγ = δα + δβ and its rate γ̇ = ∂v/∂x + ∂u/∂y; rotation versus shear.',
    },
  ],
  sourceNote: md`**Primary source: Lecture 9, slides 2–9** (fluid element kinematics). The slides print **no equation numbers and no worked examples**, so every solved example, practice problem and simulation on this page is supplementary (marked ✦) — all their numbers have been re-computed. Continuity (slides 10–11) and the stream function (slides 12–14) are covered in the next topics. Slide sign convention kept throughout: **counter-clockwise rotation is positive**.`,
}

// ───────────────────────────────────────────────────────── formulas ──

const ms = md`\mathrm{m/s}`
const ms2 = md`\mathrm{m/s^2}`
const s1 = md`\mathrm{s^{-1}}`
const rads = md`\mathrm{rad/s}`

export const formulas: FormulaDef[] = [
  // concept 1 — slide 4
  {
    id: 'velocity-field',
    name: 'Velocity field in Cartesian components',
    tex: md`\mathbf{V} = u\,\hat{\mathbf{i}} + v\,\hat{\mathbf{j}} + w\,\hat{\mathbf{k}}`,
    vars: [
      { sym: md`\mathbf{V}`, desc: 'velocity vector at a point — the velocity of the fluid particle that is there at that instant', units: ms },
      { sym: md`u,\ v,\ w`, desc: md`components of $\mathbf V$ along $x$, $y$, $z$; in the field (Eulerian) description each is a function of $(x, y, z, t)$`, units: ms },
      { sym: md`\hat{\mathbf{i}},\ \hat{\mathbf{j}},\ \hat{\mathbf{k}}`, desc: md`unit vectors along $x$, $y$, $z$`, units: md`\text{dimensionless}` },
    ],
    conditions: ['any flow — a purely kinematic description (steady or unsteady, compressible or incompressible)'],
    use: md`Read off $u$, $v$, $w$ as functions of position (and time). Every quantity in this topic — acceleration, dilatation, rotation, shear rate — is built from their derivatives.`,
    src: L9('4'),
  },
  {
    id: 'gradient-operator',
    name: 'Gradient operator',
    tex: md`\nabla(\;) = \pd{(\;)}{x}\,\hat{\mathbf{i}} + \pd{(\;)}{y}\,\hat{\mathbf{j}} + \pd{(\;)}{z}\,\hat{\mathbf{k}}`,
    vars: [
      { sym: md`\nabla`, desc: 'vector differential operator ("del")', units: md`\mathrm{m^{-1}}` },
      { sym: md`(\;)`, desc: 'placeholder for the quantity being differentiated', units: md`\text{any}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: ['Cartesian coordinates; the quantity must be differentiable'],
    use: md`Dotted with $\mathbf V$ it gives the convective operator $\mathbf V\cdot\nabla = u\,\partial/\partial x + v\,\partial/\partial y + w\,\partial/\partial z$; later in this topic $\nabla\cdot\mathbf V$ is the dilatation rate and $\nabla\times\mathbf V$ the vorticity.`,
    src: L9('4'),
  },
  {
    id: 'acceleration-field',
    name: 'Acceleration of a fluid particle',
    key: true,
    tex: md`\mathbf{a} = \pd{\mathbf V}{t} + u\pd{\mathbf V}{x} + v\pd{\mathbf V}{y} + w\pd{\mathbf V}{z}`,
    vars: [
      { sym: md`\mathbf a`, desc: 'acceleration of the fluid particle at $(x, y, z)$ at time $t$', units: ms2 },
      { sym: md`\partial\mathbf V/\partial t`, desc: md`**local** (unsteady) acceleration: rate of change of $\mathbf V$ at a fixed point`, units: ms2 },
      {
        sym: md`u\,\partial\mathbf V/\partial x + \dots`,
        desc: md`**convective** acceleration: change of velocity because the particle moves to where $\mathbf V$ is different`,
        units: ms2,
      },
      { sym: md`u,\ v,\ w`, desc: 'velocity components at the point', units: ms },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
    ],
    conditions: [
      'purely kinematic — valid for any flow (steady or unsteady, compressible or incompressible, viscous or not)',
      md`the names *local* and *convective* are standard terminology, not printed on the slide`,
    ],
    use: md`Differentiate the velocity field, evaluate at the point and instant of interest, and add. In **steady** flow drop $\partial\mathbf V/\partial t$ — but never the convective terms.`,
    src: L9('4'),
  },
  {
    id: 'acceleration-components',
    name: 'Acceleration components',
    tex: md`\begin{aligned}
a_x &= \pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}\\
a_y &= \pd{v}{t} + u\pd{v}{x} + v\pd{v}{y} + w\pd{v}{z}\\
a_z &= \pd{w}{t} + u\pd{w}{x} + v\pd{w}{y} + w\pd{w}{z}
\end{aligned}`,
    vars: [
      { sym: md`a_x,\ a_y,\ a_z`, desc: 'Cartesian components of the particle acceleration', units: ms2 },
      { sym: md`\partial u/\partial t,\ \dots`, desc: 'time derivatives at a fixed point (local terms)', units: ms2 },
      { sym: md`\partial u/\partial x,\ \dots`, desc: 'velocity gradients', units: s1 },
      { sym: md`u,\ v,\ w`, desc: 'velocity components (the multipliers of the convective terms)', units: ms },
    ],
    conditions: ['any flow; Cartesian coordinates'],
    use: md`Pattern for each row: local term + $u$, $v$, $w$ times the $x$-, $y$-, $z$-derivative of **the component being accelerated**. Only $u$ is differentiated in $a_x$.`,
    src: L9('4'),
  },
  {
    id: 'material-derivative',
    name: 'Material derivative operator',
    key: true,
    tex: md`\begin{aligned}
\mathbf a &= \frac{D\mathbf V}{Dt}\\[4pt]
\frac{D(\;)}{Dt} &= \pd{(\;)}{t} + u\pd{(\;)}{x} + v\pd{(\;)}{y} + w\pd{(\;)}{z}\\[4pt]
&= \pd{(\;)}{t} + (\mathbf V\cdot\nabla)(\;)
\end{aligned}`,
    vars: [
      { sym: md`D(\;)/Dt`, desc: 'rate of change **following a fluid particle** (usually called the material or substantial derivative)', units: md`[\;]\,\mathrm{s^{-1}}` },
      { sym: md`\partial(\;)/\partial t`, desc: 'rate of change at a fixed point (local part)', units: md`[\;]\,\mathrm{s^{-1}}` },
      { sym: md`\mathbf V\cdot\nabla`, desc: md`$u\,\partial/\partial x + v\,\partial/\partial y + w\,\partial/\partial z$ — the convective part`, units: s1 },
      { sym: md`(\;)`, desc: 'any field quantity: velocity, density, temperature, …', units: md`\text{any}` },
    ],
    conditions: ['kinematic identity — holds for every flow and every differentiable field quantity'],
    use: md`Apply it to $\mathbf V$ to get the acceleration, or to a scalar such as $T$ or $\rho$ to get the change experienced by a particle. A probe fixed in space measures only $\partial/\partial t$; a probe drifting with the fluid measures $D/Dt$.`,
    src: L9('4'),
  },
  // concept 2 — slide 5
  {
    id: 'translation',
    name: 'Translation of the element (O → O′)',
    tex: md`x_{O'} - x_O = u\,\delta t, \qquad y_{O'} - y_O = v\,\delta t`,
    vars: [
      { sym: md`u,\ v`, desc: 'velocity shared by every point of the element', units: ms },
      { sym: md`\delta t`, desc: 'short time interval', units: md`\mathrm{s}` },
      { sym: md`O,\ O'`, desc: md`a corner of the element before and after $\delta t$`, units: md`\text{(points)}` },
    ],
    conditions: ['pure translation: no velocity gradients across the element (all points move alike)', md`displacements to first order in $\delta t$`],
    use: md`The element keeps its size, shape and orientation; only its position changes.`,
    src: L9('5', 'translation figure'),
  },
  {
    id: 'volume-change-x',
    name: 'Volume change produced by ∂u/∂x',
    tex: md`\text{Change in }\delta\forall = \left(\pd{u}{x}\,\delta x\right)(\delta y\,\delta z)(\delta t)`,
    vars: [
      { sym: md`\delta\forall`, desc: md`element volume, $\delta\forall = \delta x\,\delta y\,\delta z$ (the slide's volume symbol)`, units: md`\mathrm{m^3}` },
      { sym: md`\delta x,\ \delta y,\ \delta z`, desc: 'edge lengths of the element', units: md`\mathrm{m}` },
      { sym: md`(\partial u/\partial x)\,\delta x`, desc: 'velocity of face AC relative to face OB', units: ms },
      { sym: md`(\partial u/\partial x\,\delta x)\,\delta t`, desc: md`extra length AA′ gained in $\delta t$`, units: md`\mathrm{m}` },
      { sym: md`\delta t`, desc: 'time interval', units: md`\mathrm{s}` },
    ],
    conditions: [md`only the gradient $\partial u/\partial x$ acting`, md`small $\delta t$ (first order); the corner pieces of order $\delta t^2$ are neglected`],
    use: md`Volume of the shaded strip AA′C′C: (extra length) × (face area $\delta y\,\delta z$).`,
    src: L9('5'),
  },
  {
    id: 'dilatation-x',
    name: 'Rate of volume change per unit volume (x-gradient only)',
    tex: md`\frac{1}{\delta\forall}\frac{d(\delta\forall)}{dt} = \lim_{\delta t\to 0}\left[\frac{(\partial u/\partial x)\,\delta t}{\delta t}\right] = \pd{u}{x}`,
    vars: [
      { sym: md`\frac{1}{\delta\forall}\frac{d(\delta\forall)}{dt}`, desc: 'fractional rate of change of the element volume', units: s1 },
      { sym: md`\partial u/\partial x`, desc: 'normal velocity gradient in $x$', units: s1 },
    ],
    conditions: [md`contribution of $\partial u/\partial x$ alone`, md`exact in the limit $\delta t \to 0$`],
    use: md`Divide the slide-5 volume change by $\delta\forall = \delta x\,\delta y\,\delta z$ and by $\delta t$, then let $\delta t \to 0$.`,
    src: L9('5'),
  },
  {
    id: 'dilatation-rate',
    name: 'Volumetric dilatation rate',
    key: true,
    tex: md`\frac{1}{\delta\forall}\frac{d(\delta\forall)}{dt} = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = \nabla\cdot\mathbf V`,
    vars: [
      { sym: md`\frac{1}{\delta\forall}\frac{d(\delta\forall)}{dt}`, desc: 'rate of volume change per unit volume of a fluid element', units: s1 },
      { sym: md`\partial u/\partial x,\ \partial v/\partial y,\ \partial w/\partial z`, desc: '**normal** velocity gradients', units: s1 },
      { sym: md`\nabla\cdot\mathbf V`, desc: 'divergence of the velocity field', units: s1 },
    ],
    conditions: [
      md`general kinematics — any flow; exact for an infinitesimal element as $\delta t \to 0$`,
      md`$\nabla\cdot\mathbf V > 0$: expansion; $< 0$: compression; $= 0$: volume-preserving (incompressible)`,
    ],
    use: md`Add the three normal gradients at the point. Cross-gradients such as $\partial u/\partial y$ do **not** appear: they rotate or shear the element without changing its volume.`,
    src: L9('5', 'boxed result'),
  },
  {
    id: 'volume-growth',
    name: 'Volume of an element over a finite time',
    tex: md`\delta\forall(t) = \delta\forall_0\,e^{(\nabla\cdot\mathbf V)\,t} \;\approx\; \delta\forall_0\left[1 + (\nabla\cdot\mathbf V)\,t\right]`,
    vars: [
      { sym: md`\delta\forall_0`, desc: 'element volume at $t = 0$', units: md`\mathrm{m^3}` },
      { sym: md`\nabla\cdot\mathbf V`, desc: 'dilatation rate following the element', units: s1 },
      { sym: md`t`, desc: 'time elapsed, following the element', units: md`\mathrm{s}` },
    ],
    conditions: [md`$\nabla\cdot\mathbf V$ constant along the element's path (e.g. a linear velocity field)`, md`the bracket is the first-order form, accurate only while $|(\nabla\cdot\mathbf V)\,t| \ll 1$`],
    use: md`Integrate $d(\delta\forall)/dt = (\nabla\cdot\mathbf V)\,\delta\forall$. Shows why the slide's linear expressions need $\delta t \to 0$.`,
  },
  // concept 3 — slides 6–8
  {
    id: 'omega-OA',
    name: 'Angular velocity of line OA',
    tex: md`\begin{aligned}
\omega_{OA} &= \lim_{\delta t\to 0}\frac{\delta\alpha}{\delta t}\\[2pt]
\tan\delta\alpha \approx \delta\alpha &= \frac{(\partial v/\partial x)\,\delta x\,\delta t}{\delta x} = \pd{v}{x}\,\delta t\\[2pt]
\omega_{OA} &= \lim_{\delta t\to 0}\left[\frac{(\partial v/\partial x)\,\delta t}{\delta t}\right] = \pd{v}{x}
\end{aligned}`,
    vars: [
      { sym: md`\omega_{OA}`, desc: 'angular velocity of the material line OA (along $x$), **counter-clockwise positive**', units: rads },
      { sym: md`\delta\alpha`, desc: md`angle OA turns through in $\delta t$`, units: md`\mathrm{rad}` },
      { sym: md`\delta x`, desc: 'length of OA (lever arm)', units: md`\mathrm{m}` },
      { sym: md`(\partial v/\partial x)\,\delta x\,\delta t`, desc: 'vertical displacement of A relative to O (AA′)', units: md`\mathrm{m}` },
    ],
    conditions: [md`small $\delta t$, so $\tan\delta\alpha \approx \delta\alpha$; exact in the limit`],
    use: md`A line along $x$ turns because the point at its far end moves sideways faster than its origin.`,
    src: L9('6'),
  },
  {
    id: 'omega-OB',
    name: 'Angular velocity of line OB',
    tex: md`\begin{aligned}
\omega_{OB} &= \lim_{\delta t\to 0}\frac{\delta\beta}{\delta t}\\[2pt]
\tan\delta\beta \approx \delta\beta &= \frac{(\partial u/\partial y)\,\delta y\,\delta t}{\delta y} = \pd{u}{y}\,\delta t\\[2pt]
\omega_{OB} &= \lim_{\delta t\to 0}\left[\frac{(\partial u/\partial y)\,\delta t}{\delta t}\right] = \pd{u}{y}
\end{aligned}`,
    vars: [
      { sym: md`\omega_{OB}`, desc: md`angular velocity of the material line OB (along $y$), **clockwise positive** (as $\delta\beta$ is drawn)`, units: rads },
      { sym: md`\delta\beta`, desc: md`angle OB turns through in $\delta t$, measured clockwise`, units: md`\mathrm{rad}` },
      { sym: md`\delta y`, desc: 'length of OB', units: md`\mathrm{m}` },
      { sym: md`(\partial u/\partial y)\,\delta y\,\delta t`, desc: 'horizontal displacement of B relative to O (BB′)', units: md`\mathrm{m}` },
    ],
    conditions: [md`small $\delta t$ ($\tan\delta\beta \approx \delta\beta$)`, md`note the sense: a positive $\partial u/\partial y$ turns OB **clockwise**`],
    use: md`A line along $y$ turns because its top end moves in $x$ faster than its origin. Keep track of the clockwise sense when combining with OA.`,
    src: L9('6'),
  },
  {
    id: 'omega-z',
    name: 'Rotation of the element about z',
    key: true,
    tex: md`\omega_z = \frac12\left(\pd{v}{x} - \pd{u}{y}\right)`,
    vars: [
      { sym: md`\omega_z`, desc: 'rotation (angular velocity) of the element about $z$: the average angular velocity of the perpendicular lines OA and OB, **counter-clockwise positive**', units: rads },
      { sym: md`\partial v/\partial x`, desc: 'turning rate of OA (ccw +)', units: s1 },
      { sym: md`\partial u/\partial y`, desc: 'turning rate of OB (cw +), hence the minus sign', units: s1 },
    ],
    conditions: ['definition: average of the angular velocities of two mutually perpendicular lines; counter-clockwise positive', 'valid at every point of any flow'],
    use: md`Evaluate the two cross-gradients and take half their **difference**. $\omega_z = 0$ means no net spin about $z$ (the element may still deform).`,
    src: L9('7'),
  },
  {
    id: 'omega-xy',
    name: 'Rotation about x and y',
    tex: md`\omega_x = \frac12\left(\pd{w}{y} - \pd{v}{z}\right), \qquad \omega_y = \frac12\left(\pd{u}{z} - \pd{w}{x}\right)`,
    vars: [
      { sym: md`\omega_x,\ \omega_y`, desc: 'rotation of the element about the $x$ and $y$ axes (right-hand rule)', units: rads },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: ms },
    ],
    conditions: [md`same argument as for $\omega_z$, applied to line pairs in the $y$–$z$ and $z$–$x$ planes (cyclic $x\to y\to z$, $u\to v\to w$)`],
    use: md`Needed only for 3-D fields; in plane flow ($w = 0$, no $z$-dependence) both vanish.`,
    src: L9('7'),
  },
  {
    id: 'rotation-vector',
    name: 'Rotation vector',
    key: true,
    tex: md`\boldsymbol{\omega} = \omega_x\,\hat{\mathbf i} + \omega_y\,\hat{\mathbf j} + \omega_z\,\hat{\mathbf k} = \tfrac12\,\mathrm{curl}\,\mathbf V = \tfrac12\,\nabla\times\mathbf V`,
    vars: [
      { sym: md`\boldsymbol\omega`, desc: 'rotation vector (local angular velocity) of the fluid element', units: rads },
      { sym: md`\mathrm{curl}\,\mathbf V = \nabla\times\mathbf V`, desc: 'curl of the velocity field', units: s1 },
    ],
    conditions: ['any flow; components counter-clockwise positive about each axis'],
    use: md`Compute $\nabla\times\mathbf V$ (determinant below) and halve it.`,
    src: L9('7'),
  },
  {
    id: 'curl-determinant',
    name: 'Half the curl as a determinant',
    tex: md`\begin{aligned}
\tfrac12\nabla\times\mathbf V &= \tfrac12\begin{vmatrix} \hat{\mathbf i} & \hat{\mathbf j} & \hat{\mathbf k}\\[2pt] \dfrac{\partial}{\partial x} & \dfrac{\partial}{\partial y} & \dfrac{\partial}{\partial z}\\[6pt] u & v & w \end{vmatrix}\\[4pt]
&= \tfrac12\left(\pd{w}{y} - \pd{v}{z}\right)\hat{\mathbf i} + \tfrac12\left(\pd{u}{z} - \pd{w}{x}\right)\hat{\mathbf j} + \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right)\hat{\mathbf k}
\end{aligned}`,
    vars: [
      { sym: md`\hat{\mathbf i},\ \hat{\mathbf j},\ \hat{\mathbf k}`, desc: 'unit vectors (first row)', units: md`\text{dimensionless}` },
      { sym: md`\partial/\partial x,\ \dots`, desc: 'derivative operators (second row)', units: md`\mathrm{m^{-1}}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components (third row)', units: ms },
    ],
    conditions: ['Cartesian coordinates'],
    use: md`Expand along the first row; the three brackets are exactly $\omega_x$, $\omega_y$, $\omega_z$ — confirming $\boldsymbol\omega = \tfrac12\nabla\times\mathbf V$.`,
    src: L9('8'),
  },
  {
    id: 'vorticity',
    name: 'Vorticity',
    key: true,
    tex: md`\boldsymbol{\zeta} = 2\,\boldsymbol{\omega} = \nabla\times\mathbf V`,
    vars: [
      { sym: md`\boldsymbol\zeta`, desc: 'vorticity vector — twice the fluid-particle rotation', units: s1 },
      { sym: md`\boldsymbol\omega`, desc: 'rotation vector of the element', units: rads },
    ],
    conditions: ['any flow'],
    use: md`No factor ½: $\zeta_z = \partial v/\partial x - \partial u/\partial y$. Non-zero vorticity anywhere ⇒ the flow is rotational there.`,
    src: L9('8', 'boxed result'),
  },
  {
    id: 'undeformed-block',
    name: 'Undeformed block (rigid-body rotation) condition',
    tex: md`\pd{u}{y} = -\pd{v}{x}`,
    vars: [
      { sym: md`\partial u/\partial y`, desc: 'turning rate of OB (clockwise +)', units: s1 },
      { sym: md`\partial v/\partial x`, desc: 'turning rate of OA (counter-clockwise +)', units: s1 },
    ],
    conditions: [md`printed on slide 8 with the label "undeformed block"`, md`then OA and OB turn the same way at the same rate: $\omega_z = \partial v/\partial x$ and the right angle is kept`],
    use: md`Check it to decide whether an element rotates **without** angular deformation (e.g. a forced vortex, $u = -\Omega y$, $v = \Omega x$).`,
    src: L9('8'),
  },
  {
    id: 'zero-rotation',
    name: 'Equal cross-gradients: no rotation about z',
    tex: md`\pd{u}{y} = \pd{v}{x}`,
    vars: [
      { sym: md`\partial u/\partial y,\ \partial v/\partial x`, desc: 'the two cross-gradients', units: s1 },
    ],
    conditions: [md`printed without a label on slide 8; it is the condition for $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y) = 0$`, 'OA and OB then turn by equal amounts in opposite senses — the element still shears'],
    use: md`In plane flow this is the irrotationality test; the shear rate is then $\dot\gamma = 2\,\partial v/\partial x$.`,
    src: L9('8'),
  },
  {
    id: 'irrotational',
    name: 'Irrotational flow',
    key: true,
    tex: md`\nabla\times\mathbf V = 0`,
    vars: [{ sym: md`\nabla\times\mathbf V`, desc: md`curl of the velocity (vorticity $\boldsymbol\zeta$)`, units: s1 }],
    conditions: ['all three components must vanish', md`a flow with $\nabla\times\mathbf V \ne 0$ is **rotational**`],
    use: md`Evaluate every component of the curl. One non-zero component, at one point, is enough to make the flow rotational there.`,
    src: L9('8'),
  },
  // concept 4 — slide 9
  {
    id: 'shearing-strain',
    name: 'Shearing strain',
    tex: md`\delta\gamma = \delta\alpha + \delta\beta`,
    vars: [
      { sym: md`\delta\gamma`, desc: md`shearing strain: decrease, during $\delta t$, of the originally right angle between OA and OB`, units: md`\mathrm{rad}` },
      { sym: md`\delta\alpha`, desc: 'counter-clockwise turn of OA (toward OB)', units: md`\mathrm{rad}` },
      { sym: md`\delta\beta`, desc: 'clockwise turn of OB (toward OA)', units: md`\mathrm{rad}` },
    ],
    conditions: [md`small angles; $\delta\alpha \approx (\partial v/\partial x)\,\delta t$ and $\delta\beta \approx (\partial u/\partial y)\,\delta t$`],
    use: md`Both turns close the corner, so they **add**. A negative $\delta\gamma$ means the angle opens.`,
    src: L9('9'),
  },
  {
    id: 'shear-strain-rate',
    name: 'Rate of shearing strain (rate of angular deformation)',
    key: true,
    tex: md`\begin{aligned}
\dot\gamma &= \lim_{\delta t\to 0}\frac{\delta\gamma}{\delta t} = \lim_{\delta t\to 0}\left[\frac{(\partial v/\partial x)\,\delta t + (\partial u/\partial y)\,\delta t}{\delta t}\right]\\[4pt]
\dot\gamma &= \pd{v}{x} + \pd{u}{y}
\end{aligned}`,
    vars: [
      { sym: md`\dot\gamma`, desc: 'rate of shearing strain = rate of angular deformation in the $x$–$y$ plane', units: s1 },
      { sym: md`\partial v/\partial x,\ \partial u/\partial y`, desc: 'cross velocity gradients', units: s1 },
    ],
    conditions: [md`any flow; exact in the limit $\delta t \to 0$`],
    use: md`The **sum** of the cross-gradients with **no ½**. Zero for an undeformed block; equal to $2\,\partial v/\partial x$ when $\partial u/\partial y = \partial v/\partial x$.`,
    src: L9('9', 'boxed result'),
  },
  {
    id: 'shear-rates-3d',
    name: 'Shear-strain rates in the other planes',
    tex: md`\dot\gamma_{yz} = \pd{w}{y} + \pd{v}{z}, \qquad \dot\gamma_{zx} = \pd{u}{z} + \pd{w}{x}`,
    vars: [
      { sym: md`\dot\gamma_{yz},\ \dot\gamma_{zx}`, desc: 'rates of angular deformation in the $y$–$z$ and $z$–$x$ planes', units: s1 },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: ms },
    ],
    conditions: ['same construction as slide 9, applied to line pairs in the other coordinate planes'],
    use: md`Needed for 3-D fields; with $\dot\gamma$ (the $x$–$y$ value) they give the three independent shear rates.`,
  },
  {
    id: 'local-decomposition',
    name: 'Four motions from four gradients (plane flow)',
    tex: md`\begin{bmatrix} u\\ v \end{bmatrix} \approx \begin{bmatrix} u_O\\ v_O \end{bmatrix}
+ \underbrace{\begin{bmatrix} \partial u/\partial x & 0\\ 0 & \partial v/\partial y \end{bmatrix}\begin{bmatrix} x\\ y \end{bmatrix}}_{\text{linear deformation}}
+ \underbrace{\frac{\dot\gamma}{2}\begin{bmatrix} 0 & 1\\ 1 & 0 \end{bmatrix}\begin{bmatrix} x\\ y \end{bmatrix}}_{\text{angular deformation}}
+ \underbrace{\omega_z\begin{bmatrix} 0 & -1\\ 1 & 0 \end{bmatrix}\begin{bmatrix} x\\ y \end{bmatrix}}_{\text{rotation}}`,
    vars: [
      { sym: md`u_O,\ v_O`, desc: 'velocity of the reference point O — the **translation**', units: ms },
      { sym: md`x,\ y`, desc: 'position relative to O (small)', units: md`\mathrm{m}` },
      { sym: md`\dot\gamma`, desc: md`$\partial v/\partial x + \partial u/\partial y$`, units: s1 },
      { sym: md`\omega_z`, desc: md`$\tfrac12(\partial v/\partial x - \partial u/\partial y)$`, units: rads },
    ],
    conditions: ['first-order Taylor expansion of the velocity about O — exact for a linear field', 'plane flow; the 3-D version adds the other normal, shear and rotation terms'],
    use: md`Check: the angular-deformation and rotation matrices add up to $\begin{bmatrix} 0 & \partial u/\partial y\\ \partial v/\partial x & 0\end{bmatrix}$. Each slide-3 motion is carried by its own part of the velocity gradient — this is what the sandbox in concept 1 animates.`,
  },
  {
    id: 'newtonian-shear',
    name: 'Why shear rate matters: Newtonian shear stress',
    tex: md`\tau_{xy} = \mu\left(\pd{u}{y} + \pd{v}{x}\right) = \mu\,\dot\gamma`,
    vars: [
      { sym: md`\tau_{xy}`, desc: 'viscous shear stress on the element faces', units: md`\mathrm{Pa}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`\dot\gamma`, desc: 'rate of angular deformation', units: s1 },
    ],
    conditions: ['Newtonian fluid; previewed here — the full stress relations come with the equations of motion'],
    use: md`Viscous friction responds to the **rate of angular deformation**, not to rotation: a rigidly rotating fluid ($\dot\gamma = 0$) carries no viscous shear stress.`,
  },
]

// ───────────────────────────────────────────────────────── examples ──

export const examples: ExampleDef[] = [
  {
    id: 'ex-stagnation-accel',
    concept: 'motion-types',
    title: 'Acceleration in a steady stagnation-point flow',
    difficulty: 1,
    given: md`Steady plane flow toward a stagnation point: $u = Ax$, $v = -Ay$, $w = 0$, with $A = 2\ \mathrm{s^{-1}}$ ($x, y$ in m; velocities in m/s).`,
    find: md`The acceleration of the fluid particle at $(x, y) = (1.5, 0.5)$ m, split into local and convective parts.`,
    assumptions: 'Steady flow: the velocity at a fixed point does not change with time.',
    steps: [
      { title: 'Velocity at the point', md: md`$u = 2(1.5) = 3$ m/s, $\quad v = -2(0.5) = -1$ m/s.` },
      { title: 'Local part', md: md`The field does not contain $t$, so $\partial u/\partial t = \partial v/\partial t = 0$.` },
      { title: 'Velocity gradients', md: md`$\pd{u}{x} = A = 2\ \mathrm{s^{-1}}$, $\pd{u}{y} = 0$, $\pd{v}{x} = 0$, $\pd{v}{y} = -A = -2\ \mathrm{s^{-1}}$.` },
      {
        title: 'Convective part',
        md: md`$a_x = u\pd{u}{x} + v\pd{u}{y} = (3)(2) + (-1)(0) = 6\ \mathrm{m/s^2}$

$a_y = u\pd{v}{x} + v\pd{v}{y} = (3)(0) + (-1)(-2) = 2\ \mathrm{m/s^2}$`,
      },
      { title: 'Magnitude and direction', md: md`$|\mathbf a| = \sqrt{6^2 + 2^2} = 6.32\ \mathrm{m/s^2}$, pointing $\arctan(2/6) = 18.4^\circ$ above the $+x$ axis.` },
    ],
    answer: md`$\mathbf a = 6\,\hat{\mathbf i} + 2\,\hat{\mathbf j}\ \mathrm{m/s^2}$ ($|\mathbf a| = 6.32\ \mathrm{m/s^2}$) — entirely convective; the local part is zero.`,
    insight: md`A steady flow can still accelerate its particles: this one is being carried to where the velocity is larger. (In general $\mathbf a = A^2x\,\hat{\mathbf i} + A^2y\,\hat{\mathbf j}$ here.)`,
  },
  {
    id: 'ex-nozzle-accel',
    concept: 'motion-types',
    title: 'Local versus convective acceleration in a nozzle being ramped up',
    difficulty: 2,
    given: md`On the centreline of a converging nozzle whose supply is being increased, $u(x, t) = (U_0 + \beta t)(1 + x/L)$ with $U_0 = 2$ m/s, $\beta = 0.5\ \mathrm{m/s^2}$ and $L = 0.5$ m.`,
    find: md`The local, convective and total acceleration of the particle at $x = 0.25$ m when $t = 2$ s.`,
    assumptions: md`On the centreline $v = w = 0$ by symmetry, so the $v\,\partial u/\partial y$ and $w\,\partial u/\partial z$ terms vanish and only $a_x$ survives.`,
    steps: [
      { title: 'Velocity', md: md`$U_0 + \beta t = 2 + 0.5(2) = 3$ m/s and $1 + x/L = 1 + 0.25/0.5 = 1.5$, so $u = 3 \times 1.5 = 4.5$ m/s.` },
      { title: 'Local acceleration', md: md`$\pd{u}{t} = \beta\,(1 + x/L) = 0.5 \times 1.5 = 0.75\ \mathrm{m/s^2}$ — what a probe fixed at $x = 0.25$ m would record.` },
      { title: 'Convective acceleration', md: md`$\pd{u}{x} = (U_0 + \beta t)/L = 3/0.5 = 6\ \mathrm{s^{-1}}$, so $u\pd{u}{x} = 4.5 \times 6 = 27\ \mathrm{m/s^2}$.` },
      { title: 'Total', md: md`$a_x = \pd{u}{t} + u\pd{u}{x} = 0.75 + 27 = 27.75\ \mathrm{m/s^2}$.` },
    ],
    answer: md`$a_x = 27.75\ \mathrm{m/s^2}$ (local $0.75$ + convective $27$); $a_y = a_z = 0$ on the centreline.`,
    insight: md`The fixed probe sees the velocity rising at only 0.75 m/s², but the particle feels 37 times that, because it is swept into the faster, narrower part of the nozzle.`,
  },
  {
    id: 'ex-element-stretch',
    concept: 'linear-deformation',
    title: 'Translating and stretching a small element',
    difficulty: 2,
    given: md`Plane flow $u = 2 + 4x$, $v = 1 - 3y$, $w = 0$ (m/s; $x, y$ in m). A cubic element with $\delta x = \delta y = \delta z = 1$ mm has its corner O at the origin. Time interval $\delta t = 1$ ms.`,
    find: md`(a) the translation of corner O; (b) the extra length AA′; (c) the volume changes produced by $\partial u/\partial x$ and by $\partial v/\partial y$; (d) the volumetric dilatation rate.`,
    steps: [
      { title: '(a) Translation', md: md`At O, $u = 2$ m/s and $v = 1$ m/s, so in $\delta t = 10^{-3}$ s the corner moves $u\,\delta t = 2$ mm in $x$ and $v\,\delta t = 1$ mm in $y$.` },
      {
        title: '(b) Stretching strip',
        md: md`$\pd{u}{x} = 4\ \mathrm{s^{-1}}$: face AC moves faster than OB by $(\partial u/\partial x)\,\delta x = 4\times10^{-3}$ m/s, so AA′ $= (\partial u/\partial x\,\delta x)\,\delta t = 4\times10^{-3} \times 10^{-3} = 4\times10^{-6}$ m $= 4\ \mu$m.`,
      },
      {
        title: '(c) Volume changes',
        md: md`From $\partial u/\partial x$: $(4\times10^{-3}\ \mathrm{m/s})(10^{-6}\ \mathrm{m^2})(10^{-3}\ \mathrm{s}) = +4\times10^{-12}\ \mathrm{m^3}$.

From $\partial v/\partial y = -3\ \mathrm{s^{-1}}$: $(-3\times10^{-3})(10^{-6})(10^{-3}) = -3\times10^{-12}\ \mathrm{m^3}$ — the top face moves up more slowly than the bottom face, squeezing the element in $y$.

Net change: $+1\times10^{-12}\ \mathrm{m^3}$.`,
      },
      {
        title: '(d) Dilatation rate',
        md: md`$\delta\forall = 10^{-9}\ \mathrm{m^3}$, so $\dfrac{1}{\delta\forall}\dfrac{\Delta(\delta\forall)}{\delta t} = \dfrac{10^{-12}}{10^{-9} \times 10^{-3}} = 1\ \mathrm{s^{-1}}$ — equal to $\pd{u}{x} + \pd{v}{y} = 4 - 3 = 1\ \mathrm{s^{-1}}$.`,
      },
    ],
    answer: md`(a) 2 mm in $x$, 1 mm in $y$; (b) AA′ = 4 μm; (c) $+4\times10^{-12}$ and $-3\times10^{-12}\ \mathrm{m^3}$, net $+1\times10^{-12}\ \mathrm{m^3}$; (d) $\nabla\cdot\mathbf V = 1\ \mathrm{s^{-1}}$ (expanding).`,
    insight: 'Only the normal gradients change the volume; the constant parts of the field (2 m/s and 1 m/s) merely carry the element along.',
  },
  {
    id: 'ex-rotation-2d',
    concept: 'rotation-vorticity',
    title: 'Line rotations, element rotation and vorticity',
    difficulty: 2,
    given: md`Plane flow $u = x - 4y$, $v = 2x - y$, $w = 0$ (m/s; $x, y$ in m).`,
    find: md`The angular velocities of OA and OB, the rotation $\omega_z$, the vorticity, and whether the element rotates as an undeformed block.`,
    steps: [
      { title: 'Gradients', md: md`$\pd{u}{x} = 1$, $\pd{u}{y} = -4$, $\pd{v}{x} = 2$, $\pd{v}{y} = -1$ (all in s⁻¹, the same at every point).` },
      { title: 'Line OA', md: md`$\omega_{OA} = \pd{v}{x} = 2$ rad/s — counter-clockwise.` },
      {
        title: 'Line OB',
        md: md`$\omega_{OB} = \pd{u}{y} = -4$ rad/s. Since $\delta\beta$ is measured **clockwise**, the negative value means OB actually turns **counter-clockwise** at 4 rad/s.`,
      },
      {
        title: 'Rotation of the element',
        md: md`$\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12\left(2 - (-4)\right) = 3$ rad/s (counter-clockwise). Check: the average of the two counter-clockwise rates is $(2 + 4)/2 = 3$ rad/s.`,
      },
      { title: 'Vorticity', md: md`$w = 0$ and nothing depends on $z$, so $\omega_x = \omega_y = 0$ and $\boldsymbol\zeta = 2\boldsymbol\omega = 6\,\hat{\mathbf k}\ \mathrm{s^{-1}}$: the flow is rotational.` },
      {
        title: 'Undeformed block?',
        md: md`That needs $\pd{u}{y} = -\pd{v}{x}$, i.e. $-4 = -2$ — false. The lines turn at different rates (2 and 4 rad/s), so the corner angle changes as well (it opens, since $\partial v/\partial x + \partial u/\partial y = -2\ \mathrm{s^{-1}}$).`,
      },
    ],
    answer: md`$\omega_{OA} = 2$ rad/s (ccw), $\omega_{OB} = -4$ rad/s (i.e. 4 rad/s ccw), $\omega_z = 3$ rad/s, $\boldsymbol\zeta = 6\,\hat{\mathbf k}\ \mathrm{s^{-1}}$; rotational, not an undeformed block.`,
    insight: md`Keep the slide's bookkeeping: $\delta\beta$ is measured clockwise, so $\partial u/\partial y$ enters $\omega_z$ with a minus sign.`,
  },
  {
    id: 'ex-vortex-compare',
    concept: 'rotation-vorticity',
    title: 'Forced vortex versus free vortex: circling is not rotating',
    difficulty: 3,
    given: md`Two flows with circular streamlines: a **forced vortex** (rigid-body rotation) $u = -\Omega y$, $v = \Omega x$ with $\Omega = 0.8$ rad/s; and a **free vortex** $u = -\dfrac{Ky}{x^2 + y^2}$, $v = \dfrac{Kx}{x^2 + y^2}$ with $K = 2\ \mathrm{m^2/s}$.`,
    find: md`At $(1, 0)$ m for each flow: the speed, $\omega_z$, $\zeta_z$, and whether the element is an undeformed block.`,
    steps: [
      { title: 'Forced vortex — gradients and speed', md: md`$\pd{v}{x} = \Omega = 0.8\ \mathrm{s^{-1}}$, $\pd{u}{y} = -\Omega = -0.8\ \mathrm{s^{-1}}$; speed $\Omega r = 0.8$ m/s.` },
      {
        title: 'Forced vortex — rotation',
        md: md`$\omega_z = \tfrac12\left(0.8 - (-0.8)\right) = 0.8$ rad/s $= \Omega$ and $\zeta_z = 1.6\ \mathrm{s^{-1}}$. Because $\pd{u}{y} = -\pd{v}{x}$, this is the **undeformed block**: each element turns like a rigid body, once per revolution.`,
      },
      {
        title: 'Free vortex — gradients and speed',
        md: md`$\pd{v}{x} = \dfrac{K(y^2 - x^2)}{(x^2 + y^2)^2} = \dfrac{2(0 - 1)}{1} = -2\ \mathrm{s^{-1}}$ and $\pd{u}{y} = -\dfrac{K(x^2 - y^2)}{(x^2 + y^2)^2} = -\dfrac{2(1 - 0)}{1} = -2\ \mathrm{s^{-1}}$; speed $K/r = 2$ m/s.`,
      },
      {
        title: 'Free vortex — rotation',
        md: md`$\omega_z = \tfrac12\left(-2 - (-2)\right) = 0$, so $\zeta_z = 0$: **irrotational** (the same algebra gives zero at every $r > 0$). Here $\partial u/\partial y = \partial v/\partial x$: OA turns clockwise at 2 rad/s and OB counter-clockwise at 2 rad/s, so the element deforms without net rotation.`,
      },
    ],
    answer: md`Forced: 0.8 m/s, $\omega_z = 0.8$ rad/s, $\zeta_z = 1.6\ \mathrm{s^{-1}}$, undeformed block. Free: 2 m/s, $\omega_z = \zeta_z = 0$ (irrotational) but deforming.`,
    insight: 'Moving along a circle is not the same as spinning: in a free vortex the elements orbit like the cabins of a Ferris wheel, always staying upright.',
  },
  {
    id: 'ex-curl-3d',
    concept: 'rotation-vorticity',
    title: 'Rotation vector of a 3-D field from the determinant',
    difficulty: 2,
    given: md`$\mathbf V = (yz)\,\hat{\mathbf i} + (2xz)\,\hat{\mathbf j} + (3xy)\,\hat{\mathbf k}$ (m/s, coordinates in m; each coefficient carries units of $\mathrm{m^{-1}\,s^{-1}}$).`,
    find: md`The rotation vector $\boldsymbol\omega$ and the vorticity $\boldsymbol\zeta$ at $(2, 1, 4)$ m.`,
    steps: [
      {
        title: 'Set up half the curl',
        md: md`$$
\tfrac12\nabla\times\mathbf V = \tfrac12\begin{vmatrix} \hat{\mathbf i} & \hat{\mathbf j} & \hat{\mathbf k}\\ \partial/\partial x & \partial/\partial y & \partial/\partial z\\ yz & 2xz & 3xy \end{vmatrix}
$$`,
      },
      {
        title: 'Expand component by component',
        md: md`$\omega_x = \tfrac12\left(\pd{w}{y} - \pd{v}{z}\right) = \tfrac12(3x - 2x) = \tfrac{x}{2}$

$\omega_y = \tfrac12\left(\pd{u}{z} - \pd{w}{x}\right) = \tfrac12(y - 3y) = -y$

$\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(2z - z) = \tfrac{z}{2}$`,
      },
      { title: 'Evaluate at (2, 1, 4)', md: md`$\boldsymbol\omega = 1\,\hat{\mathbf i} - 1\,\hat{\mathbf j} + 2\,\hat{\mathbf k}$ rad/s, $\quad |\boldsymbol\omega| = \sqrt{1 + 1 + 4} = 2.45$ rad/s.` },
      { title: 'Vorticity', md: md`$\boldsymbol\zeta = 2\boldsymbol\omega = 2\,\hat{\mathbf i} - 2\,\hat{\mathbf j} + 4\,\hat{\mathbf k}\ \mathrm{s^{-1}}$, $\quad |\boldsymbol\zeta| = 4.90\ \mathrm{s^{-1}}$ — rotational.` },
    ],
    answer: md`$\boldsymbol\omega = (1, -1, 2)$ rad/s ($|\boldsymbol\omega| = 2.45$ rad/s); $\boldsymbol\zeta = (2, -2, 4)\ \mathrm{s^{-1}}$ ($|\boldsymbol\zeta| = 4.90\ \mathrm{s^{-1}}$).`,
    insight: md`Expanding the slide-8 determinant row by row reproduces the three $\omega$-components of slide 7 and avoids sign slips. (This field also has $\nabla\cdot\mathbf V = 0$ — rotation and volume change are independent.)`,
  },
  {
    id: 'ex-couette-shear',
    concept: 'angular-deformation',
    title: 'Shearing strain in Couette flow',
    difficulty: 1,
    given: md`Water between parallel plates: the lower plate is fixed, the upper one slides at $U = 0.5$ m/s, and the gap is $h = 2$ mm, so $u = Uy/h$, $v = 0$.`,
    find: md`For a small square element: $\delta\alpha$, $\delta\beta$ and $\delta\gamma$ after $\delta t = 0.1$ ms; the rate of shearing strain $\dot\gamma$; the rotation $\omega_z$.`,
    steps: [
      { title: 'Gradients', md: md`$\pd{u}{y} = U/h = 0.5/0.002 = 250\ \mathrm{s^{-1}}$, $\quad \pd{v}{x} = 0$.` },
      {
        title: 'Angles after δt',
        md: md`$\delta\alpha = (\partial v/\partial x)\,\delta t = 0$ (OA stays horizontal); $\delta\beta = (\partial u/\partial y)\,\delta t = 250 \times 10^{-4} = 0.025$ rad $= 1.43^\circ$ (OB leans clockwise, toward OA).`,
      },
      { title: 'Shearing strain', md: md`$\delta\gamma = \delta\alpha + \delta\beta = 0.025$ rad: the right angle has closed to $88.57^\circ$.` },
      {
        title: 'Rates',
        md: md`$\dot\gamma = \pd{v}{x} + \pd{u}{y} = 0 + 250 = 250\ \mathrm{s^{-1}}$; $\quad \omega_z = \tfrac12(0 - 250) = -125$ rad/s (clockwise), so $\zeta_z = -250\ \mathrm{s^{-1}}$.`,
      },
      {
        title: 'Why it matters (preview)',
        md: md`For a Newtonian fluid the shear stress is $\tau = \mu\dot\gamma$. With $\mu = 1.0\times10^{-3}$ Pa·s for water, $\tau = 10^{-3} \times 250 = 0.25$ Pa on the plates.`,
      },
    ],
    answer: md`$\delta\alpha = 0$, $\delta\beta = \delta\gamma = 0.025$ rad (1.43°); $\dot\gamma = 250\ \mathrm{s^{-1}}$; $\omega_z = -125$ rad/s (clockwise).`,
    insight: 'Straight, parallel streamlines do not mean irrotational: simple shear is part rotation and part angular deformation.',
  },
  {
    id: 'ex-corner-shear',
    concept: 'angular-deformation',
    title: 'Irrotational but shearing: flow around a corner',
    difficulty: 2,
    given: md`Plane flow $u = A(x^2 - y^2)$, $v = -2Axy$ with $A = 0.5\ \mathrm{m^{-1}\,s^{-1}}$.`,
    find: md`At $P(2, 1)$ m: $\omega_z$, $\dot\gamma$, $\nabla\cdot\mathbf V$, and the angle between two short fluid lines (initially along $x$ and $y$) after $\delta t = 0.01$ s.`,
    steps: [
      { title: 'Velocity at P', md: md`$u = 0.5(4 - 1) = 1.5$ m/s, $\quad v = -2(0.5)(2)(1) = -2$ m/s.` },
      { title: 'Gradients at P', md: md`$\pd{u}{x} = 2Ax = 2$, $\pd{u}{y} = -2Ay = -1$, $\pd{v}{x} = -2Ay = -1$, $\pd{v}{y} = -2Ax = -2$ (s⁻¹).` },
      { title: 'Rotation', md: md`$\omega_z = \tfrac12\left(-1 - (-1)\right) = 0$ — irrotational. In fact $\partial u/\partial y = \partial v/\partial x = -2Ay$ everywhere.` },
      { title: 'Shear and dilatation', md: md`$\dot\gamma = -1 + (-1) = -2\ \mathrm{s^{-1}}$; $\quad \nabla\cdot\mathbf V = 2 + (-2) = 0$.` },
      {
        title: 'Angles after δt',
        md: md`$\delta\alpha = (-1)(0.01) = -0.01$ rad (OA turns clockwise); $\delta\beta = (-1)(0.01) = -0.01$ rad (OB turns counter-clockwise); $\delta\gamma = -0.02$ rad, so the angle **opens** from $90^\circ$ to $90^\circ + 1.15^\circ = 91.15^\circ$.`,
      },
    ],
    answer: md`$\omega_z = 0$ (irrotational), $\dot\gamma = -2\ \mathrm{s^{-1}}$, $\nabla\cdot\mathbf V = 0$; the corner angle opens to about $91.15^\circ$.`,
    insight: md`Irrotational does not mean undeformed: here the element shears (and stretches, $\partial u/\partial x = 2\ \mathrm{s^{-1}}$ against $\partial v/\partial y = -2\ \mathrm{s^{-1}}$) without turning.`,
  },
]

// ───────────────────────────────────────────────────────── practice ──

const mps2 = md`\mathrm{m/s^2}`

export const practice: PracticeDef[] = [
  // motion-types
  {
    id: 'pr-accel-2d',
    concept: 'motion-types',
    difficulty: 1,
    q: md`A steady plane flow has $u = 2x + y$ and $v = x - 2y$ (m/s, $x$ and $y$ in m). Find the acceleration components and the magnitude of the acceleration of the particle at $(1, 2)$ m.`,
    hint: md`Steady, so only the convective terms: $a_x = u\,\partial u/\partial x + v\,\partial u/\partial y$ and $a_y = u\,\partial v/\partial x + v\,\partial v/\partial y$.`,
    answer: md`$a_x = 5\ \mathrm{m/s^2}$, $a_y = 10\ \mathrm{m/s^2}$, $|\mathbf a| = 11.2\ \mathrm{m/s^2}$.`,
    solution: md`At $(1, 2)$: $u = 2(1) + 2 = 4$ m/s and $v = 1 - 2(2) = -3$ m/s.

Gradients: $\partial u/\partial x = 2$, $\partial u/\partial y = 1$, $\partial v/\partial x = 1$, $\partial v/\partial y = -2$ (s⁻¹). The local terms vanish because the flow is steady.

$a_x = (4)(2) + (-3)(1) = 5\ \mathrm{m/s^2}$

$a_y = (4)(1) + (-3)(-2) = 10\ \mathrm{m/s^2}$

$|\mathbf a| = \sqrt{5^2 + 10^2} = 11.18\ \mathrm{m/s^2}$.`,
    check: [
      { label: md`$a_x$`, value: 5, units: mps2 },
      { label: md`$a_y$`, value: 10, units: mps2 },
      { label: md`$|\mathbf a|$`, value: 11.18, units: mps2 },
    ],
  },
  {
    id: 'pr-material-temp',
    concept: 'motion-types',
    difficulty: 2,
    q: md`Air moves along a heated duct with a uniform velocity $u = 4$ m/s ($v = w = 0$). The temperature field is $T(x, t) = 300 + 2x - 0.5t$ (K, with $x$ in m and $t$ in s). (a) At what rate does a thermometer fixed in the duct see the temperature change? (b) At what rate does the temperature of a fluid particle change?`,
    hint: md`Apply the slide-4 operator to $T$: $DT/Dt = \partial T/\partial t + u\,\partial T/\partial x + v\,\partial T/\partial y + w\,\partial T/\partial z$.`,
    answer: md`(a) $\partial T/\partial t = -0.5$ K/s; (b) $DT/Dt = +7.5$ K/s.`,
    solution: md`(a) A fixed thermometer records only the local rate: $\partial T/\partial t = -0.5$ K/s (the duct is slowly cooling).

(b) Following a particle: $\dfrac{DT}{Dt} = \pd{T}{t} + u\pd{T}{x} = -0.5 + (4)(2) = 7.5$ K/s. The particle warms up because it is carried toward hotter parts of the duct faster than the duct cools.`,
    check: [
      { label: '(a) fixed thermometer', value: -0.5, units: md`\mathrm{K/s}` },
      { label: '(b) fluid particle', value: 7.5, units: md`\mathrm{K/s}` },
    ],
  },
  {
    id: 'pr-accel-3d',
    concept: 'motion-types',
    difficulty: 3,
    q: md`$\mathbf V = (xt)\,\hat{\mathbf i} - (yt)\,\hat{\mathbf j} + (2z)\,\hat{\mathbf k}$ (m/s; $x, y, z$ in m, $t$ in s). Find the local, convective and total acceleration of the particle at $(1, 1, 1)$ m when $t = 2$ s.`,
    hint: md`$\partial\mathbf V/\partial t = x\,\hat{\mathbf i} - y\,\hat{\mathbf j}$. For the convective part note that each component depends on only one coordinate.`,
    answer: md`Local $(1, -1, 0)$, convective $(4, 4, 4)$, total $\mathbf a = (5, 3, 4)\ \mathrm{m/s^2}$, $|\mathbf a| = 7.07\ \mathrm{m/s^2}$.`,
    solution: md`At the point: $u = 2$, $v = -2$, $w = 2$ m/s.

Local: $\pd{u}{t} = x = 1$, $\pd{v}{t} = -y = -1$, $\pd{w}{t} = 0$.

Convective (all other derivatives are zero): $u\pd{u}{x} = (xt)(t) = xt^2 = 4$; $\quad v\pd{v}{y} = (-yt)(-t) = yt^2 = 4$; $\quad w\pd{w}{z} = (2z)(2) = 4z = 4$.

Total: $a_x = 1 + 4 = 5$, $a_y = -1 + 4 = 3$, $a_z = 0 + 4 = 4\ \mathrm{m/s^2}$, so $|\mathbf a| = \sqrt{25 + 9 + 16} = \sqrt{50} = 7.07\ \mathrm{m/s^2}$.`,
    check: [
      { label: md`$a_x$`, value: 5, units: mps2 },
      { label: md`$a_y$`, value: 3, units: mps2 },
      { label: md`$a_z$`, value: 4, units: mps2 },
      { label: md`$|\mathbf a|$`, value: 7.07, units: mps2 },
    ],
  },
  // linear-deformation
  {
    id: 'pr-dilatation-rate',
    concept: 'linear-deformation',
    difficulty: 1,
    q: md`A fluid element of volume $\delta\forall = 2.0\ \mathrm{mm^3}$ is in a region where $\partial u/\partial x = 6\ \mathrm{s^{-1}}$, $\partial v/\partial y = -2\ \mathrm{s^{-1}}$ and $\partial w/\partial z = -1\ \mathrm{s^{-1}}$. Find (a) the volumetric dilatation rate, (b) the rate of change of the element's volume, (c) the approximate change of volume in $\delta t = 5$ ms.`,
    hint: md`$(1/\delta\forall)\,d(\delta\forall)/dt = \nabla\cdot\mathbf V$; multiply by $\delta\forall$, then by $\delta t$.`,
    answer: md`(a) $3\ \mathrm{s^{-1}}$; (b) $6\ \mathrm{mm^3/s}$; (c) $+0.03\ \mathrm{mm^3}$ (a 1.5 % increase).`,
    solution: md`(a) $\nabla\cdot\mathbf V = 6 - 2 - 1 = 3\ \mathrm{s^{-1}}$ — positive, so the element expands.

(b) $d(\delta\forall)/dt = (\nabla\cdot\mathbf V)\,\delta\forall = 3 \times 2.0 = 6\ \mathrm{mm^3/s}$.

(c) $\Delta(\delta\forall) \approx 6 \times 0.005 = 0.03\ \mathrm{mm^3}$, i.e. $0.03/2.0 = 1.5\,\%$ — small enough for the first-order estimate to be accurate.`,
    check: [
      { label: md`$\nabla\cdot\mathbf V$`, value: 3, units: s1 },
      { label: md`$d(\delta\forall)/dt$`, value: 6, units: md`\mathrm{mm^3/s}` },
      { label: md`$\Delta(\delta\forall)$`, value: 0.03, units: md`\mathrm{mm^3}` },
    ],
  },
  {
    id: 'pr-volume-preserving',
    concept: 'linear-deformation',
    difficulty: 2,
    q: md`For $\mathbf V = (5x + y)\,\hat{\mathbf i} + (ky + 2x)\,\hat{\mathbf j} - 3z\,\hat{\mathbf k}$ (coefficients in s⁻¹), find $k$ such that every fluid element keeps its volume. Is the resulting flow irrotational?`,
    hint: md`Volume preserved ⇔ $\nabla\cdot\mathbf V = 0$. Then evaluate $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y)$.`,
    answer: md`$k = -2\ \mathrm{s^{-1}}$; not irrotational — $\omega_z = 0.5$ rad/s.`,
    solution: md`$\nabla\cdot\mathbf V = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 5 + k - 3 = 0 \;\Rightarrow\; k = -2\ \mathrm{s^{-1}}$.

Rotation: $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(2 - 1) = 0.5$ rad/s, while $\omega_x = \omega_y = 0$ (no cross-dependence involving $z$). The elements keep their volume yet still rotate — volume change and rotation are independent.`,
    check: [
      { label: md`$k$`, value: -2, units: s1 },
      { label: md`$\omega_z$`, value: 0.5, units: rads },
    ],
  },
  {
    id: 'pr-strip-width',
    concept: 'linear-deformation',
    difficulty: 2,
    q: md`In the flow $u = 0.8 + 50x$ (m/s, $x$ in m) an element has $\delta x = 2$ mm and $\delta y = \delta z = 1$ mm, with face OB at $x = 0$. For $\delta t = 0.2$ ms find (a) how far face OB moves, (b) the extra length AA′ by which face AC gets ahead, (c) the change in the element's volume.`,
    hint: md`Slide 5: OB moves $u\,\delta t$; AA′ $= (\partial u/\partial x\,\delta x)\,\delta t$; change in $\delta\forall$ = AA′ × $\delta y\,\delta z$.`,
    answer: md`(a) 0.16 mm; (b) 0.02 mm; (c) $0.02\ \mathrm{mm^3}$ (1 % of $\delta\forall$).`,
    solution: md`(a) $u(0) = 0.8$ m/s, so OB moves $0.8 \times 2\times10^{-4} = 1.6\times10^{-4}$ m $= 0.16$ mm.

(b) $\pd{u}{x} = 50\ \mathrm{s^{-1}}$, so AA′ $= (50 \times 0.002) \times 2\times10^{-4} = 2\times10^{-5}$ m $= 0.02$ mm.

(c) Change in $\delta\forall$ $= 0.02\ \mathrm{mm} \times (1 \times 1)\ \mathrm{mm^2} = 0.02\ \mathrm{mm^3}$. As a fraction of $\delta\forall = 2\ \mathrm{mm^3}$ this is $1\,\%$, equal to $(\partial u/\partial x)\,\delta t = 50 \times 2\times10^{-4} = 0.01$.`,
    check: [
      { label: '(a) OB moves', value: 0.16, units: md`\mathrm{mm}` },
      { label: '(b) AA′', value: 0.02, units: md`\mathrm{mm}` },
      { label: '(c) volume change', value: 0.02, units: md`\mathrm{mm^3}` },
    ],
  },
  {
    id: 'pr-volume-growth',
    concept: 'linear-deformation',
    difficulty: 3,
    q: md`A gas element is compressed with a constant dilatation rate $\nabla\cdot\mathbf V = -0.4\ \mathrm{s^{-1}}$ (following the element). How long does its volume take to halve? Compare with the time obtained by (wrongly) using the first-order estimate $\Delta(\delta\forall) = (\nabla\cdot\mathbf V)\,\delta\forall_0\,t$ over the whole interval.`,
    hint: md`Integrate $\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt} = \nabla\cdot\mathbf V$ from $\delta\forall_0$ to $\delta\forall_0/2$.`,
    answer: md`$t = \ln 2/0.4 = 1.73$ s (the linear estimate would give 1.25 s).`,
    solution: md`$\dfrac{d(\delta\forall)}{\delta\forall} = (\nabla\cdot\mathbf V)\,dt \;\Rightarrow\; \ln\dfrac{\delta\forall}{\delta\forall_0} = -0.4\,t$. Setting $\delta\forall/\delta\forall_0 = 1/2$ gives $t = \ln 2/0.4 = 1.733$ s.

The first-order estimate $1 - 0.4\,t = 0.5$ gives $t = 1.25$ s — too short, because the rate of volume loss, $0.4\,\delta\forall$, shrinks as the element gets smaller. The slide's linear expressions are exact only in the limit $\delta t \to 0$.`,
    check: [{ label: 'halving time', value: 1.733, units: md`\mathrm{s}` }],
  },
  // rotation-vorticity
  {
    id: 'pr-omega-2d',
    concept: 'rotation-vorticity',
    difficulty: 1,
    q: md`For $u = 3x - 4y$ and $v = 6x - 3y$ (m/s; $x, y$ in m) find $\omega_{OA}$, $\omega_{OB}$, $\omega_z$ and $\zeta_z$, and state the sense in which each line turns.`,
    hint: md`$\omega_{OA} = \partial v/\partial x$ (ccw +), $\omega_{OB} = \partial u/\partial y$ (cw +), $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y)$.`,
    answer: md`$\omega_{OA} = 6$ rad/s (ccw), $\omega_{OB} = -4$ rad/s (i.e. 4 rad/s ccw), $\omega_z = 5$ rad/s, $\zeta_z = 10\ \mathrm{s^{-1}}$.`,
    solution: md`$\pd{v}{x} = 6\ \mathrm{s^{-1}}$ and $\pd{u}{y} = -4\ \mathrm{s^{-1}}$.

OA: $\omega_{OA} = 6$ rad/s, counter-clockwise. OB: $\omega_{OB} = -4$ rad/s in the clockwise-positive sense of $\delta\beta$, so OB turns counter-clockwise at 4 rad/s.

$\omega_z = \tfrac12\left(6 - (-4)\right) = 5$ rad/s — the average of the two counter-clockwise rates 6 and 4 — and $\zeta_z = 2\omega_z = 10\ \mathrm{s^{-1}}$.`,
    check: [
      { label: md`$\omega_z$`, value: 5, units: rads },
      { label: md`$\zeta_z$`, value: 10, units: s1 },
    ],
  },
  {
    id: 'pr-irrotational-c',
    concept: 'rotation-vorticity',
    difficulty: 2,
    q: md`$\mathbf V = (x^2 - y^2)\,\hat{\mathbf i} + (c\,xy)\,\hat{\mathbf j}$ (m/s; coordinates in m). Find the constant $c$ that makes the flow irrotational, then check whether the elements keep their volume.`,
    hint: md`In plane flow, irrotational means $\partial v/\partial x = \partial u/\partial y$ at every point.`,
    answer: md`$c = -2$; then $\nabla\cdot\mathbf V = 2x - 2x = 0$, so the volume is preserved too.`,
    solution: md`$\pd{v}{x} = cy$ and $\pd{u}{y} = -2y$, so $\omega_z = \tfrac12(cy + 2y) = \tfrac12(c + 2)\,y$. This vanishes for every $y$ only if $c = -2$. ($\omega_x = \omega_y = 0$ automatically, because $w = 0$ and nothing depends on $z$.)

With $c = -2$: $\nabla\cdot\mathbf V = \pd{u}{x} + \pd{v}{y} = 2x + (-2x) = 0$ — the elements also keep their volume.`,
    check: [{ label: md`$c$`, value: -2 }],
  },
  {
    id: 'pr-curl-3d',
    concept: 'rotation-vorticity',
    difficulty: 2,
    q: md`For $\mathbf V = (2yz)\,\hat{\mathbf i} + (xz)\,\hat{\mathbf j} + (xy)\,\hat{\mathbf k}$ (m/s; coordinates in m), find $\boldsymbol\omega$ and $|\boldsymbol\zeta|$ at $(1, 2, 3)$ m.`,
    hint: md`Expand $\tfrac12\nabla\times\mathbf V$ as the slide-8 determinant, one component at a time.`,
    answer: md`$\boldsymbol\omega = 0\,\hat{\mathbf i} + 1\,\hat{\mathbf j} - 1.5\,\hat{\mathbf k}$ rad/s; $|\boldsymbol\zeta| = 3.61\ \mathrm{s^{-1}}$.`,
    solution: md`$\omega_x = \tfrac12\left(\pd{w}{y} - \pd{v}{z}\right) = \tfrac12(x - x) = 0$

$\omega_y = \tfrac12\left(\pd{u}{z} - \pd{w}{x}\right) = \tfrac12(2y - y) = \tfrac{y}{2} = 1$ rad/s

$\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(z - 2z) = -\tfrac{z}{2} = -1.5$ rad/s

$|\boldsymbol\omega| = \sqrt{0 + 1 + 2.25} = 1.80$ rad/s, so $|\boldsymbol\zeta| = 2|\boldsymbol\omega| = 3.61\ \mathrm{s^{-1}}$. (Without the factor 2, $yz\,\hat{\mathbf i} + xz\,\hat{\mathbf j} + xy\,\hat{\mathbf k}$ is irrotational: every bracket cancels.)`,
    check: [
      { label: md`$\omega_y$`, value: 1, units: rads },
      { label: md`$\omega_z$`, value: -1.5, units: rads },
      { label: md`$|\boldsymbol\zeta|$`, value: 3.606, units: s1 },
    ],
  },
  {
    id: 'pr-tank-rotation',
    concept: 'rotation-vorticity',
    difficulty: 1,
    q: md`Water in a cylindrical tank spinning at 30 rpm has reached rigid-body rotation, $u = -\Omega y$, $v = \Omega x$. Find $\Omega$, the rotation $\omega_z$ and the vorticity $\zeta_z$ of a fluid element, and verify the "undeformed block" condition.`,
    hint: md`$\Omega = 2\pi N/60$; then $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y)$.`,
    answer: md`$\Omega = \omega_z = 3.14$ rad/s, $\zeta_z = 6.28\ \mathrm{s^{-1}}$; $\partial u/\partial y = -\Omega = -\partial v/\partial x$ ✓.`,
    solution: md`$\Omega = 2\pi(30)/60 = \pi = 3.142$ rad/s.

$\pd{v}{x} = \Omega$ and $\pd{u}{y} = -\Omega$, so $\omega_z = \tfrac12(\Omega + \Omega) = \Omega = 3.142$ rad/s and $\zeta_z = 2\Omega = 6.283\ \mathrm{s^{-1}}$.

Undeformed block: $\pd{u}{y} = -\Omega = -\pd{v}{x}$ ✓ — every element turns once per revolution of the tank without distortion ($\dot\gamma = \Omega - \Omega = 0$).`,
    check: [
      { label: md`$\omega_z$`, value: 3.142, units: rads },
      { label: md`$\zeta_z$`, value: 6.283, units: s1 },
    ],
  },
  // angular-deformation
  {
    id: 'pr-couette-rate',
    concept: 'angular-deformation',
    difficulty: 1,
    q: md`Oil fills a 4 mm gap between a fixed plate and a plate sliding at 2 m/s ($u = Uy/h$, $v = 0$). Find the rate of shearing strain, the rotation $\omega_z$ and the shearing strain $\delta\gamma$ accumulated in 0.1 ms.`,
    hint: md`$\dot\gamma = \partial v/\partial x + \partial u/\partial y$ with $\partial u/\partial y = U/h$.`,
    answer: md`$\dot\gamma = 500\ \mathrm{s^{-1}}$; $\omega_z = -250$ rad/s (clockwise); $\delta\gamma = 0.05$ rad (2.86°).`,
    solution: md`$\pd{u}{y} = U/h = 2/0.004 = 500\ \mathrm{s^{-1}}$ and $\pd{v}{x} = 0$, so $\dot\gamma = 500\ \mathrm{s^{-1}}$.

$\omega_z = \tfrac12(0 - 500) = -250$ rad/s — clockwise.

$\delta\gamma = \dot\gamma\,\delta t = 500 \times 10^{-4} = 0.05$ rad $= 2.86^\circ$ (all of it from $\delta\beta$; $\delta\alpha = 0$).`,
    check: [
      { label: md`$\dot\gamma$`, value: 500, units: s1 },
      { label: md`$\omega_z$`, value: -250, units: rads },
      { label: md`$\delta\gamma$`, value: 0.05, units: md`\mathrm{rad}` },
    ],
  },
  {
    id: 'pr-classify',
    concept: 'angular-deformation',
    difficulty: 2,
    q: md`Classify the motion of the fluid elements in $u = x + 2y$, $v = 4x - y$ (m/s; $x, y$ in m): find $\dot\gamma$, $\omega_z$ and $\nabla\cdot\mathbf V$.`,
    hint: md`Four gradients give three numbers here: the sum $\partial v/\partial x + \partial u/\partial y$, half the difference $\tfrac12(\partial v/\partial x - \partial u/\partial y)$ and the normal sum $\partial u/\partial x + \partial v/\partial y$.`,
    answer: md`$\dot\gamma = 6\ \mathrm{s^{-1}}$, $\omega_z = 1$ rad/s, $\nabla\cdot\mathbf V = 0$: the elements rotate and shear but keep their area.`,
    solution: md`$\pd{u}{x} = 1$, $\pd{u}{y} = 2$, $\pd{v}{x} = 4$, $\pd{v}{y} = -1$ (s⁻¹).

Angular deformation: $\dot\gamma = 4 + 2 = 6\ \mathrm{s^{-1}}$. Rotation: $\omega_z = \tfrac12(4 - 2) = 1$ rad/s (counter-clockwise). Dilatation: $\nabla\cdot\mathbf V = 1 - 1 = 0$ — no volume change, although the element is stretched in $x$ and shortened in $y$ at 1 s⁻¹. Translation is present everywhere except at the origin, where $\mathbf V = 0$.`,
    check: [
      { label: md`$\dot\gamma$`, value: 6, units: s1 },
      { label: md`$\omega_z$`, value: 1, units: rads },
    ],
  },
  {
    id: 'pr-undeformed-condition',
    concept: 'angular-deformation',
    difficulty: 2,
    q: md`At a point $\partial v/\partial x = 3\ \mathrm{s^{-1}}$. (a) Which value of $\partial u/\partial y$ makes the element rotate as an undeformed block, and what is $\omega_z$ then? (b) Which value of $\partial u/\partial y$ gives no rotation, and what is $\dot\gamma$ then?`,
    hint: md`Slide 8: undeformed block $\partial u/\partial y = -\partial v/\partial x$; no rotation $\partial u/\partial y = \partial v/\partial x$.`,
    answer: md`(a) $\partial u/\partial y = -3\ \mathrm{s^{-1}}$, $\omega_z = 3$ rad/s ($\dot\gamma = 0$); (b) $\partial u/\partial y = 3\ \mathrm{s^{-1}}$, $\dot\gamma = 6\ \mathrm{s^{-1}}$ ($\omega_z = 0$).`,
    solution: md`(a) $\pd{u}{y} = -3\ \mathrm{s^{-1}}$: then $\omega_z = \tfrac12\left(3 - (-3)\right) = 3$ rad/s and $\dot\gamma = 3 + (-3) = 0$ — OA and OB both turn counter-clockwise at 3 rad/s, so the right angle survives.

(b) $\pd{u}{y} = +3\ \mathrm{s^{-1}}$: then $\omega_z = \tfrac12(3 - 3) = 0$ and $\dot\gamma = 3 + 3 = 6\ \mathrm{s^{-1}}$ — the two lines turn toward each other at 3 rad/s each.`,
    check: [
      { label: md`(a) $\partial u/\partial y$`, value: -3, units: s1 },
      { label: md`(a) $\omega_z$`, value: 3, units: rads },
      { label: md`(b) $\dot\gamma$`, value: 6, units: s1 },
    ],
  },
  {
    id: 'pr-angle-after',
    concept: 'angular-deformation',
    difficulty: 2,
    q: md`A small square element sits where $\partial v/\partial x = 0.6\ \mathrm{s^{-1}}$ and $\partial u/\partial y = 0.2\ \mathrm{s^{-1}}$. After $\delta t = 0.05$ s find $\delta\alpha$, $\delta\beta$, the shearing strain and the angle between the two originally perpendicular sides. Through what angle has the element as a whole (its diagonal) turned?`,
    hint: md`$\delta\alpha \approx (\partial v/\partial x)\,\delta t$, $\delta\beta \approx (\partial u/\partial y)\,\delta t$, $\delta\gamma = \delta\alpha + \delta\beta$; the diagonal turns by $\omega_z\,\delta t$.`,
    answer: md`$\delta\alpha = 0.03$ rad, $\delta\beta = 0.01$ rad, $\delta\gamma = 0.04$ rad (2.29°), angle $= 87.71^\circ$; the element turns 0.01 rad (0.57°) counter-clockwise.`,
    solution: md`$\delta\alpha = 0.6 \times 0.05 = 0.03$ rad (OA, counter-clockwise); $\delta\beta = 0.2 \times 0.05 = 0.01$ rad (OB, clockwise).

$\delta\gamma = 0.03 + 0.01 = 0.04$ rad $= 2.29^\circ$, so the corner angle is $90^\circ - 2.29^\circ = 87.71^\circ$.

Rotation: $\omega_z = \tfrac12(0.6 - 0.2) = 0.2$ rad/s, so the diagonal turns $\omega_z\,\delta t = 0.01$ rad $= 0.57^\circ$ counter-clockwise — the same as $\tfrac12(\delta\alpha - \delta\beta)$.`,
    check: [
      { label: md`$\delta\gamma$`, value: 0.04, units: md`\mathrm{rad}` },
      { label: 'corner angle', value: 87.71, units: md`^\circ` },
    ],
  },
]

// ───────────────────────────────────────────────────────────── quiz ──

export const quiz: QuizQ[] = [
  {
    id: 'q-steady-accel',
    concept: 'motion-types',
    difficulty: 1,
    src: L9('4'),
    q: md`A flow is **steady**. What can you say about the acceleration of its fluid particles?`,
    options: [
      md`It can still be non-zero, because the convective terms $u\,\partial\mathbf V/\partial x + v\,\partial\mathbf V/\partial y + w\,\partial\mathbf V/\partial z$ remain`,
      md`It is always zero, because $\partial\mathbf V/\partial t = 0$`,
      'It is zero only if the flow is also incompressible',
      md`It equals $\partial\mathbf V/\partial t$`,
    ],
    answer: 0,
    explain: md`Steady means $\partial\mathbf V/\partial t = 0$ — the local part vanishes — but a particle can still move to where the velocity is different, so $(\mathbf V\cdot\nabla)\mathbf V$ survives (think of flow speeding up through a nozzle). "Always zero" confuses a field that is constant in time with a particle whose velocity is constant.`,
  },
  {
    id: 'q-local-term',
    concept: 'motion-types',
    difficulty: 1,
    q: md`In $a_x = \partial u/\partial t + u\,\partial u/\partial x + v\,\partial u/\partial y + w\,\partial u/\partial z$, which part would a velocity probe **fixed in space** detect on its own?`,
    options: [md`$\partial u/\partial t$ — the local (unsteady) term`, md`$u\,\partial u/\partial x$`, md`$v\,\partial u/\partial y$`, 'the sum of all four terms'],
    answer: 0,
    explain: md`A fixed probe only registers how the velocity at its own location changes with time, $\partial u/\partial t$. The other three terms (the convective acceleration) exist because a fluid particle moves through a non-uniform field; the full sum is what the particle itself feels.`,
  },
  {
    id: 'q-four-motions',
    concept: 'motion-types',
    difficulty: 1,
    src: L9('2–3'),
    q: 'Which list gives the four basic kinds of motion of a fluid element in Lecture 9?',
    options: [
      'Translation, rotation, linear deformation, angular deformation',
      'Translation, rotation, compression, diffusion',
      'Translation, vorticity, dilatation, turbulence',
      'Rotation, shear, expansion, convection',
    ],
    answer: 0,
    explain: 'Slide 2 lists translation, rotation, linear deformation and angular deformation, and slide 3 draws each one separately. Vorticity and dilatation are measures of rotation and linear deformation, not separate motions.',
  },
  {
    id: 'q-convective-x',
    concept: 'motion-types',
    difficulty: 2,
    src: L9('4'),
    q: md`For a plane flow, the $x$-component of $(\mathbf V\cdot\nabla)\mathbf V$ is…`,
    options: [
      md`$u\,\partial u/\partial x + v\,\partial u/\partial y$`,
      md`$u\,\partial u/\partial x + u\,\partial v/\partial y$`,
      md`$u\,(\partial u/\partial x + \partial v/\partial y)$`,
      md`$u\,\partial u/\partial x + v\,\partial v/\partial x$`,
    ],
    answer: 0,
    explain: md`$\mathbf V\cdot\nabla = u\,\partial/\partial x + v\,\partial/\partial y$ acts on the component being accelerated, here $u$. The option $u(\partial u/\partial x + \partial v/\partial y)$ is $u\,\nabla\cdot\mathbf V$ — a different quantity that vanishes in incompressible flow, whereas the convective acceleration usually does not.`,
  },
  {
    id: 'q-dilatation-def',
    concept: 'linear-deformation',
    difficulty: 1,
    src: L9('5'),
    q: md`The rate of volume change per unit volume of a fluid element, $\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt}$, equals…`,
    options: [
      md`$\nabla\cdot\mathbf V = \partial u/\partial x + \partial v/\partial y + \partial w/\partial z$`,
      md`$\nabla\times\mathbf V$`,
      md`$\tfrac12\nabla\times\mathbf V$`,
      md`$\partial v/\partial x + \partial u/\partial y$`,
    ],
    answer: 0,
    explain: md`Slide 5's boxed result: only the normal gradients change the volume, and their sum is the divergence (the volumetric dilatation rate). The curl measures rotation (slides 7–8) and $\partial v/\partial x + \partial u/\partial y$ is the rate of shearing strain (slide 9).`,
  },
  {
    id: 'q-area-constant',
    concept: 'linear-deformation',
    difficulty: 2,
    q: md`In a plane flow $\partial u/\partial x = 3\ \mathrm{s^{-1}}$ and $\partial v/\partial y = -3\ \mathrm{s^{-1}}$, and there are no other gradients. What happens to a small square fluid element?`,
    options: [
      'It is stretched in x and shortened in y, but its area (volume) does not change',
      'It keeps both its shape and its size',
      md`Its area grows at $6\ \mathrm{s^{-1}}$`,
      'It rotates counter-clockwise at 3 rad/s',
    ],
    answer: 0,
    explain: md`The dilatation rate is $3 + (-3) = 0$, so the volume is preserved while the shape changes (pure linear deformation). With no cross-gradients there is no rotation. "Grows at 6 s⁻¹" adds magnitudes and ignores that the $y$-gradient is a contraction.`,
  },
  {
    id: 'q-strip-width',
    concept: 'linear-deformation',
    difficulty: 2,
    src: L9('5'),
    q: 'In the slide-5 stretching figure, the width AA′ of the shaded strip is…',
    options: [
      md`$(\partial u/\partial x\;\delta x)\,\delta t$`,
      md`$(\partial u/\partial x)\,\delta t$`,
      md`$u\,\delta t$`,
      md`$(\partial u/\partial y\;\delta y)\,\delta t$`,
    ],
    answer: 0,
    explain: md`Face AC moves faster than face OB by $(\partial u/\partial x)\,\delta x$, so in $\delta t$ it gets ahead by $(\partial u/\partial x\,\delta x)\,\delta t$ — a length. $(\partial u/\partial x)\,\delta t$ is dimensionless (the fractional stretch), and $u\,\delta t$ is the translation of the whole element.`,
  },
  {
    id: 'q-zeta-omega',
    concept: 'rotation-vorticity',
    difficulty: 1,
    src: L9('8'),
    q: md`The vorticity $\boldsymbol\zeta$ and the rotation vector $\boldsymbol\omega$ are related by…`,
    options: [
      md`$\boldsymbol\zeta = 2\boldsymbol\omega = \nabla\times\mathbf V$`,
      md`$\boldsymbol\zeta = \boldsymbol\omega = \tfrac12\nabla\times\mathbf V$`,
      md`$\boldsymbol\zeta = \tfrac12\boldsymbol\omega$`,
      md`$\boldsymbol\zeta = \nabla\cdot\mathbf V$`,
    ],
    answer: 0,
    explain: md`Slide 8 (boxed): vorticity is twice the fluid-particle rotation and equals the curl of $\mathbf V$ itself. The factor ½ belongs to $\boldsymbol\omega$, not to $\boldsymbol\zeta$; $\nabla\cdot\mathbf V$ is the dilatation rate.`,
  },
  {
    id: 'q-rigid-omega',
    concept: 'rotation-vorticity',
    difficulty: 1,
    q: md`For rigid-body rotation $u = -\Omega y$, $v = \Omega x$, the rotation of a fluid element is $\omega_z = \;?$`,
    options: [md`$\Omega$`, md`$2\Omega$`, md`$0$`, md`$-\Omega$`],
    answer: 0,
    explain: md`$\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y) = \tfrac12(\Omega + \Omega) = \Omega$: every element spins at the rate of the whole body. $2\Omega$ is the vorticity $\zeta_z$, not the rotation.`,
  },
  {
    id: 'q-free-vortex',
    concept: 'rotation-vorticity',
    difficulty: 3,
    q: md`In a free vortex ($v_\theta = K/r$) every particle travels on a circle. Away from the centre the flow is…`,
    options: [
      'irrotational — the elements orbit the centre without spinning',
      md`rotational, with $\omega_z = K/r^2$`,
      'rotational, because the streamlines are curved',
      'a rigid-body rotation (undeformed block)',
    ],
    answer: 0,
    explain: md`For $u = -Ky/r^2$, $v = Kx/r^2$ one finds $\partial v/\partial x = \partial u/\partial y$, so $\omega_z = 0$ for $r > 0$. Curved paths are not rotation: the two perpendicular lines of an element turn equally in opposite senses, so it deforms without spinning. $K/r^2$ is the angular speed of the *orbit*, not of the element.`,
  },
  {
    id: 'q-minus-sign',
    concept: 'rotation-vorticity',
    difficulty: 2,
    src: L9('6–7'),
    q: md`Line OB turns **clockwise** through $\delta\beta = (\partial u/\partial y)\,\delta t$. Why does $\partial u/\partial y$ enter $\omega_z$ with a minus sign?`,
    options: [
      'Because counter-clockwise rotation is taken as positive, so the clockwise turn of OB counts negatively',
      md`Because $\partial u/\partial y$ is always negative`,
      'Because OB is shorter than OA',
      'Because rotation is defined as linear deformation minus angular deformation',
    ],
    answer: 0,
    explain: md`Slide 7 defines $\omega_z$ as the average angular velocity of OA and OB with counter-clockwise positive. OA contributes $+\partial v/\partial x$; OB, whose $\delta\beta$ is measured clockwise, contributes $-\partial u/\partial y$. Hence $\tfrac12(\partial v/\partial x - \partial u/\partial y)$. The sign of $\partial u/\partial y$ itself can be anything.`,
  },
  {
    id: 'q-undeformed-block',
    concept: 'rotation-vorticity',
    difficulty: 2,
    src: L9('8'),
    q: md`On slide 8 the condition $\partial u/\partial y = -\partial v/\partial x$ is labelled "undeformed block". It describes…`,
    options: [
      'an element that rotates like a rigid body, keeping its right angles',
      'irrotational flow',
      'pure angular deformation with no rotation',
      'incompressible flow',
    ],
    answer: 0,
    explain: md`With $\partial u/\partial y = -\partial v/\partial x$, OB turns counter-clockwise exactly as fast as OA, so the angle between them stays 90° ($\dot\gamma = 0$) while $\omega_z = \partial v/\partial x \ne 0$. Pure angular deformation without rotation is the opposite case, $\partial u/\partial y = +\partial v/\partial x$.`,
  },
  {
    id: 'q-gamma-def',
    concept: 'angular-deformation',
    difficulty: 1,
    src: L9('9'),
    q: md`The rate of angular deformation (rate of shearing strain) in the $x$–$y$ plane is…`,
    options: [
      md`$\dot\gamma = \partial v/\partial x + \partial u/\partial y$`,
      md`$\dot\gamma = \tfrac12(\partial v/\partial x - \partial u/\partial y)$`,
      md`$\dot\gamma = \partial u/\partial x + \partial v/\partial y$`,
      md`$\dot\gamma = \partial v/\partial x - \partial u/\partial y$`,
    ],
    answer: 0,
    explain: md`Slide 9 (boxed): $\delta\gamma = \delta\alpha + \delta\beta$, so the *sum* of the cross-gradients, with no ½. Half the *difference* is the rotation $\omega_z$, the full difference is the vorticity, and $\partial u/\partial x + \partial v/\partial y$ is the plane-flow dilatation rate.`,
  },
  {
    id: 'q-couette-class',
    concept: 'angular-deformation',
    difficulty: 2,
    q: md`Plane Couette flow, $u = Uy/h$ and $v = 0$, is…`,
    options: [
      'rotational and angularly deforming',
      'irrotational, because its streamlines are straight',
      'a pure rotation with no deformation',
      'a pure angular deformation with no rotation',
    ],
    answer: 0,
    explain: md`$\partial u/\partial y = U/h \ne 0$ and $\partial v/\partial x = 0$, so $\omega_z = -U/(2h) \ne 0$ (rotational, clockwise) and $\dot\gamma = U/h \ne 0$ (shearing). Straight streamlines say nothing about whether the elements spin.`,
  },
  {
    id: 'q-equal-gradients',
    concept: 'angular-deformation',
    difficulty: 2,
    src: L9('8–9'),
    q: md`At a point $\partial u/\partial y = \partial v/\partial x \ne 0$. Then…`,
    options: [
      md`$\omega_z = 0$ but $\dot\gamma \ne 0$: the element shears without rotating`,
      md`$\dot\gamma = 0$ but $\omega_z \ne 0$: the element rotates without shearing`,
      md`both $\omega_z$ and $\dot\gamma$ are zero`,
      'the element must change its volume',
    ],
    answer: 0,
    explain: md`$\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y) = 0$, while $\dot\gamma = \partial v/\partial x + \partial u/\partial y = 2\,\partial v/\partial x \ne 0$. The volume depends only on the normal gradients, which are not involved. Rotating without shearing is the undeformed block, $\partial u/\partial y = -\partial v/\partial x$.`,
  },
]

// ─────────────────────────────────────────────────────── flashcards ──

export const flashcards: Flashcard[] = [
  { id: 'fc-four-motions', src: L9('2–3'), front: 'The four basic motions of a fluid element?', back: 'Translation, rotation, linear deformation and angular deformation — in general all four happen at once.' },
  {
    id: 'fc-material-derivative',
    src: L9('4'),
    front: md`$\dfrac{D(\;)}{Dt} = \;?$`,
    back: md`$\pd{(\;)}{t} + u\pd{(\;)}{x} + v\pd{(\;)}{y} + w\pd{(\;)}{z} = \pd{(\;)}{t} + (\mathbf V\cdot\nabla)(\;)$ — the rate of change following a particle (local + convective); $\mathbf a = D\mathbf V/Dt$.`,
  },
  {
    id: 'fc-steady-accel',
    front: 'Can a steady flow accelerate its particles?',
    back: md`Yes. $\partial\mathbf V/\partial t = 0$, but the convective acceleration $(\mathbf V\cdot\nabla)\mathbf V$ is non-zero wherever the velocity varies in space (e.g. through a nozzle).`,
  },
  {
    id: 'fc-dilatation',
    src: L9('5'),
    front: 'Volumetric dilatation rate?',
    back: md`$\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt} = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = \nabla\cdot\mathbf V$ (s⁻¹): the rate of volume change per unit volume.`,
  },
  {
    id: 'fc-normal-gradients',
    src: L9('5'),
    front: 'Which velocity gradients change the volume of a fluid element?',
    back: md`Only the normal gradients $\partial u/\partial x$, $\partial v/\partial y$, $\partial w/\partial z$. Cross-gradients ($\partial u/\partial y$, $\partial v/\partial x$, …) rotate and shear it.`,
  },
  {
    id: 'fc-omega-z',
    src: L9('7'),
    front: md`Definition of $\omega_z$?`,
    back: md`The average angular velocity of two mutually perpendicular lines (OA, OB), counter-clockwise positive: $\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right)$.`,
  },
  { id: 'fc-vorticity', src: L9('8'), front: 'Vorticity?', back: md`$\boldsymbol\zeta = 2\boldsymbol\omega = \nabla\times\mathbf V$ — twice the fluid-particle rotation (units s⁻¹).` },
  {
    id: 'fc-irrotational',
    src: L9('8'),
    front: 'Irrotational flow?',
    back: md`$\nabla\times\mathbf V = 0$ everywhere — every component of $\boldsymbol\omega$ and $\boldsymbol\zeta$ vanishes. In plane flow: $\partial v/\partial x = \partial u/\partial y$.`,
  },
  {
    id: 'fc-undeformed',
    src: L9('8'),
    front: '"Undeformed block" condition?',
    back: md`$\partial u/\partial y = -\partial v/\partial x$: OA and OB turn the same way at the same rate — rigid-body rotation with $\dot\gamma = 0$.`,
  },
  {
    id: 'fc-shear-strain',
    src: L9('9'),
    front: md`Shearing strain $\delta\gamma$?`,
    back: md`$\delta\gamma = \delta\alpha + \delta\beta$ — the decrease, during $\delta t$, of the originally right angle between OA and OB.`,
  },
  {
    id: 'fc-gamma-dot',
    src: L9('9'),
    front: 'Rate of shearing strain (rate of angular deformation)?',
    back: md`$\dot\gamma = \pd{v}{x} + \pd{u}{y}$ (s⁻¹) — a sum, with no ½.`,
  },
  {
    id: 'fc-sum-difference',
    front: 'Rotation vs. angular deformation: which uses the sum and which the difference of the cross-gradients?',
    back: md`Rotation: half the **difference**, $\tfrac12(\partial v/\partial x - \partial u/\partial y)$. Shear rate: the **sum**, $\partial v/\partial x + \partial u/\partial y$. Vorticity: the difference without the ½.`,
  },
]

// ──────────────────────────────────────────────────────── takeaways ──

export const takeaways: string[] = [
  md`A fluid element can **translate, rotate, deform linearly and deform angularly** — usually all at once (slides 2–3). Each motion is produced by its own combination of velocity gradients.`,
  md`**Acceleration follows the particle:** $\mathbf a = D\mathbf V/Dt = \partial\mathbf V/\partial t + (\mathbf V\cdot\nabla)\mathbf V$. Steady flow removes only the local term; the convective term remains wherever $\mathbf V$ varies in space.`,
  md`**Volumetric dilatation rate** $\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt} = \nabla\cdot\mathbf V$: only the normal gradients change volume; $\nabla\cdot\mathbf V = 0$ lets the shape change but not the volume.`,
  md`**Rotation** $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y)$ is the average angular velocity of two perpendicular lines, counter-clockwise positive; in 3-D $\boldsymbol\omega = \tfrac12\nabla\times\mathbf V$.`,
  md`**Vorticity** $\boldsymbol\zeta = 2\boldsymbol\omega = \nabla\times\mathbf V$; a flow is **irrotational** where $\nabla\times\mathbf V = 0$.`,
  md`**Rate of angular deformation** $\dot\gamma = \partial v/\partial x + \partial u/\partial y$ — the *sum* of the cross-gradients with no ½ — is the rate at which a right angle closes ($\delta\gamma = \delta\alpha + \delta\beta$).`,
  md`Slide-8 special cases: $\partial u/\partial y = -\partial v/\partial x$ → **undeformed block** (rigid rotation, $\dot\gamma = 0$); $\partial u/\partial y = \partial v/\partial x$ → **no rotation** but shear.`,
  md`Path shape is not rotation: a **free vortex** has circular streamlines yet is irrotational; **Couette flow** has straight streamlines yet is rotational ($\omega_z = -U/2h$).`,
  md`Four plane-flow gradients ↔ four kinematic numbers: dilatation $\partial u/\partial x + \partial v/\partial y$, stretching difference $\partial u/\partial x - \partial v/\partial y$, shear rate $\partial v/\partial x + \partial u/\partial y$, vorticity $\partial v/\partial x - \partial u/\partial y$ — plus the translation $\mathbf V$ itself.`,
  md`**Exam traps:** the ½ belongs to $\omega_z$ only (not to $\zeta$ or $\dot\gamma$); OB's clockwise $\delta\beta$ creates the minus sign; $(\mathbf V\cdot\nabla)u \ne u\,\nabla\cdot\mathbf V$; the small-angle results $\delta\alpha \approx (\partial v/\partial x)\,\delta t$ hold only as $\delta t \to 0$.`,
]

// ─────────────────────────────────────────────────────────── content ──

function MotionTypes() {
  return (
    <Concept id="motion-types">
      <Step kind="intro" src={L9('2–4')}>
        <Md>{md`
          Lecture 9 begins the **differential analysis of fluid flow** with **fluid element kinematics** (slide 2). As a small fluid element — a *particle* — travels through a flow field, its motion can be broken into **four basic kinds**:

          1. **Translation** — it moves to a new place;
          2. **Rotation** — it turns;
          3. **Linear deformation** — its sides stretch or shorten;
          4. **Angular deformation** — the angles between its sides change.

          Slide 2 shows a square particle at time $t$ that has become a displaced, turned and distorted quadrilateral at $t + \delta t$; slide 3 draws the four motions one at a time. To connect them with the flow, slide 4 writes the **velocity field** $\mathbf V = u\,\hat{\mathbf i} + v\,\hat{\mathbf j} + w\,\hat{\mathbf k}$ and expresses the **acceleration** of a particle through that field, using the operator $D(\;)/Dt$.
        `}</Md>
        <Supplement title="Where this topic sits">
          <Md>{md`
            *Kinematics* describes motion — position, velocity, acceleration, deformation — without asking which forces cause it. Working with an element of size $\delta x\,\delta y\,\delta z$ and letting it shrink to a point turns every result into a **field** quantity defined at each point of the flow. The vocabulary built here runs through the rest of Unit A: the dilatation rate becomes the continuity equation, the rotation rate decides whether a velocity potential exists, and the strain rates set the viscous stresses in the equations of motion.
          `}</Md>
        </Supplement>
        <Callout kind="exam">
          <Md>{md`Typical questions: (i) given $\mathbf V(x, y, z, t)$, find the acceleration of a particle at a point and split it into local and convective parts; (ii) given a velocity field, decide whether its elements rotate, change volume or shear, by evaluating the velocity gradients.`}</Md>
        </Callout>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          Drop a tiny square of dye into a river and watch it for a moment. It drifts downstream (**translation**); it may spin like a leaf in an eddy (**rotation**); it gets longer and thinner where the river speeds up (**linear deformation**); and near the bank, where the water at the top of the square moves faster than at the bottom, its corners stop being right angles (**angular deformation**). Every one of these motions comes from *differences* in velocity across the square — which is why the whole topic is about velocity gradients.

          **Two thermometers.** Bolt one thermometer to a bridge pier and let another drift on a raft. The pier thermometer records how the water temperature changes *at a fixed place*, $\partial T/\partial t$. The raft thermometer records how the temperature of the water it travels with changes, $DT/Dt$: it notices the clock ticking **and** being carried into warmer or colder water. Acceleration works the same way: a particle's velocity changes because the field changes in time (local part) and because the particle moves to where the velocity is different (convective part).
        `}</Md>
        <Compare
          items={[
            {
              title: 'Local acceleration',
              tone: 'amber',
              md: md`$\partial\mathbf V/\partial t$ — change of velocity **at a fixed point**. Zero in steady flow. Example: all the water in a pipe speeding up while a valve is being opened.`,
            },
            {
              title: 'Convective acceleration',
              tone: 'cyan',
              md: md`$u\,\partial\mathbf V/\partial x + v\,\partial\mathbf V/\partial y + w\,\partial\mathbf V/\partial z$ — change because the particle **moves** through a non-uniform field. Non-zero even in steady flow, e.g. water speeding up through a nozzle.`,
            },
          ]}
        />
        <Callout kind="tip" title="Steady does not mean un-accelerated">
          <Md>{md`In steady flow through a garden-hose nozzle the velocity at every fixed point never changes, yet every water particle speeds up as it passes through — its acceleration is purely convective.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual" src={L9('2–4')}>
        <Figure
          caption={md`The four elementary motions, animated. Top: general motion of a particle between $t$ and $t + \delta t$ (slide 2). Bottom: each motion on its own (slide 3). The panels are schematic, as on the slides; the angular-deformation panel is drawn as a symmetric (pure) shear.`}
          src={L9('2–3')}
        >
          <FourMotionsFigure />
        </Figure>
        <Figure caption={md`The velocity vector and its Cartesian components $u$, $v$, $w$ along the unit vectors $\hat{\mathbf i}$, $\hat{\mathbf j}$, $\hat{\mathbf k}$ ($z$ up, $y$ to the right, $x$ toward the viewer).`} src={L9('4')}>
          <VelocityTriad />
        </Figure>
      </Step>

      <Step kind="equations" src={L9('4')}>
        <FormulaCard id="velocity-field" />
        <FormulaCard id="gradient-operator" />
        <FormulaCard id="acceleration-field" />
        <FormulaCard id="acceleration-components" />
        <FormulaCard id="material-derivative" />
        <Supplement title="Where the acceleration formula comes from (the slide states the result)">
          <Derivation
            steps={[
              {
                md: md`Follow particle A along its path $x_A(t),\ y_A(t),\ z_A(t)$. Its velocity is the field evaluated where it is: $\mathbf V_A(t) = \mathbf V\big(x_A(t), y_A(t), z_A(t), t\big)$.`,
                why: 'particle velocity from the field',
              },
              {
                md: md`Chain rule: $\mathbf a_A = \dfrac{d\mathbf V_A}{dt} = \pd{\mathbf V}{t} + \pd{\mathbf V}{x}\dfrac{dx_A}{dt} + \pd{\mathbf V}{y}\dfrac{dy_A}{dt} + \pd{\mathbf V}{z}\dfrac{dz_A}{dt}$`,
                why: md`$\mathbf V$ depends on $t$ directly and through $x, y, z$`,
              },
              { md: md`The particle moves with the local velocity: $dx_A/dt = u$, $\ dy_A/dt = v$, $\ dz_A/dt = w$.`, why: 'definition of a fluid particle' },
              {
                md: md`Hence $\mathbf a = \pd{\mathbf V}{t} + u\pd{\mathbf V}{x} + v\pd{\mathbf V}{y} + w\pd{\mathbf V}{z} \equiv \dfrac{D\mathbf V}{Dt}$ — the slide-4 result, valid at every point.`,
                why: 'drop the label A',
              },
            ]}
          />
        </Supplement>
        <Callout kind="warning">
          <Md>{md`
            - Dropping the convective terms because the flow is steady — only $\partial\mathbf V/\partial t$ vanishes.
            - Mixing components: $a_x$ contains derivatives of $u$ only ($u\,\partial u/\partial x$, $v\,\partial u/\partial y$, $w\,\partial u/\partial z$), never $\partial v/\partial x$.
            - Confusing $(\mathbf V\cdot\nabla)\mathbf V$ (convective acceleration) with $\mathbf V\,(\nabla\cdot\mathbf V)$ — the latter involves the dilatation rate and is zero in incompressible flow.
          `}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="ex-stagnation-accel" />
        <ExampleCard id="ex-nozzle-accel" />
      </Step>

      <Step kind="interactive">
        <Md>{md`**Fluid-element sandbox.** A square material element is carried by a linear velocity field whose four gradients you set. Its corners move with the *exact* motion of the field, so any combination of the four motions appears. Use the presets to rebuild the panels of slide 3, then pick a part of the motion to see translation, linear deformation, rotation and angular deformation separately (the read-out formulas are derived in concepts 2–4).`}</Md>
        <ElementSandbox />
        <Md>{md`**Material-derivative probe.** Now follow one particle through a chosen field and watch its acceleration split into the local and convective parts along its path.`}</Md>
        <AccelerationProbe />
      </Step>

      <Step kind="practice">
        <PracticeList concept="motion-types" />
        <QuickCheck ids={['q-steady-accel', 'q-convective-x']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`A fluid element can translate, rotate, deform linearly and deform angularly — usually all at the same time.`,
            md`$\mathbf a = D\mathbf V/Dt = \partial\mathbf V/\partial t + u\,\partial\mathbf V/\partial x + v\,\partial\mathbf V/\partial y + w\,\partial\mathbf V/\partial z$: local plus convective acceleration.`,
            md`Steady flow can still accelerate particles (convective term); a spatially uniform but time-varying flow accelerates them through the local term alone.`,
            md`$D(\;)/Dt$ acts on any field quantity — velocity, temperature, density — and always means "rate of change following the particle".`,
            md`**Trap:** in $a_x$ every derivative is of $u$; $u$, $v$, $w$ appear only as the multipliers.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

function LinearDeformation() {
  return (
    <Concept id="linear-deformation">
      <Step kind="intro" src={L9('5')}>
        <Md>{md`
          Slide 5 (*Linear Motion and Deformation*) treats the two simplest motions using an element of sides $\delta x$ and $\delta y$ (depth $\delta z$) with corners O, A, C and B.

          **Translation.** If every point of the element has the same velocity $(u, v)$, then in a short time $\delta t$ the element simply moves $u\,\delta t$ in $x$ and $v\,\delta t$ in $y$ — corner O goes to O′ — without changing its shape.

          **Linear deformation.** Now let $u$ change with $x$. Face OB moves with $u$, but face AC, a distance $\delta x$ further on, moves with $u + (\partial u/\partial x)\,\delta x$. In $\delta t$ face AC gets ahead of OB by $(\partial u/\partial x\,\delta x)\,\delta t$: the element is **stretched**, and the shaded strip AA′C′C is extra volume. Dividing this volume change by the element volume $\delta\forall$ and by $\delta t$, and letting $\delta t \to 0$, gives the rate of volume change per unit volume. Adding the matching contributions of $\partial v/\partial y$ and $\partial w/\partial z$ gives the **volumetric dilatation rate**, $\nabla\cdot\mathbf V$.

          > "The rate of volume change per unit volume is related to the velocity gradients." — slide 5
        `}</Md>
        <Callout kind="note">
          <Md>{md`$\delta\forall = \delta x\,\delta y\,\delta z$ is the element volume. The slide's symbol is a "V with a bar"; it is written $\forall$ here so that it cannot be confused with the velocity vector $\mathbf V$.`}</Md>
        </Callout>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          **A convoy of cars.** If each car on a motorway drives a little faster than the one behind it, the gaps grow: a "fluid element" made of two neighbouring cars stretches at a rate equal to their speed difference divided by their spacing — exactly $\partial u/\partial x$. If the cars ahead are slower ($\partial u/\partial x < 0$), the convoy bunches up.

          **Size versus shape.** Only gradients *along* a direction — $\partial u/\partial x$, $\partial v/\partial y$, $\partial w/\partial z$, the *normal* gradients — push opposite faces apart or together and so change the volume. Gradients *across* a direction ($\partial u/\partial y$, $\partial v/\partial x$, …) slide faces sideways: they rotate and shear the element but, to first order, leave its volume unchanged.

          **Reading the sign of** $\nabla\cdot\mathbf V$: positive → the element swells (a gas expanding); negative → it is compressed; zero → it may change shape but not volume, which is what every element of an incompressible fluid must do.
        `}</Md>
        <Callout kind="tip">
          <Md>{md`Squeeze a water balloon between your palms: it shortens in one direction and bulges in the others. For an incompressible fluid, stretching at a rate $\partial u/\partial x$ must be paid for by contraction elsewhere, e.g. $\partial v/\partial y = -\partial u/\partial x$ in plane flow.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual" src={L9('5')}>
        <Figure
          caption={md`Slide 5's three panels, animated: translation by $(u\,\delta t,\ v\,\delta t)$; the velocity difference across the element; and the strip AA′C′C, of width $(\partial u/\partial x\,\delta x)\,\delta t$, added by stretching.`}
          src={L9('5')}
        >
          <Slide5Figure />
        </Figure>
      </Step>

      <Step kind="equations" src={L9('5')}>
        <FormulaCard id="translation" />
        <Derivation
          title="From the stretching strip to the dilatation rate (slide 5)"
          steps={[
            { md: md`Face OB moves with $u$ and face AC with $u + (\partial u/\partial x)\,\delta x$, so AC moves away from OB at $(\partial u/\partial x)\,\delta x$.`, why: md`velocity difference across $\delta x$` },
            { md: md`In $\delta t$ the element lengthens by AA′ $= (\partial u/\partial x\,\delta x)\,\delta t$.`, why: 'distance = relative speed × time' },
            { md: md`Added volume = length × face area: $\text{Change in }\delta\forall = (\partial u/\partial x\,\delta x)(\delta y\,\delta z)(\delta t)$.`, why: md`strip AA′C′C times depth $\delta z$` },
            {
              md: md`Divide by $\delta\forall = \delta x\,\delta y\,\delta z$ and by $\delta t$: $\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt} = \lim_{\delta t\to0}\dfrac{(\partial u/\partial x)\,\delta t}{\delta t} = \pd{u}{x}$.`,
              why: md`limit $\delta t \to 0$`,
            },
            {
              md: md`$\partial v/\partial y$ and $\partial w/\partial z$ stretch the element in $y$ and $z$ in the same way, and the three contributions add: $\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt} = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = \nabla\cdot\mathbf V$.`,
              why: 'all three directions (boxed)',
            },
          ]}
        />
        <FormulaCard id="volume-change-x" />
        <FormulaCard id="dilatation-x" />
        <FormulaCard id="dilatation-rate" />
        <Supplement title="What the dilatation rate tells you">
          <Md>{md`
            - $\nabla\cdot\mathbf V > 0$: the element expands; $\nabla\cdot\mathbf V < 0$: it is compressed.
            - For an **incompressible** fluid the continuity equation reduces to $\nabla\cdot\mathbf V = 0$ — every element keeps its volume while it moves and deforms. That reduction is the subject of the next topic.
            - The slide's expressions are first order in $\delta t$. Over a finite time the volume grows or shrinks exponentially:
          `}</Md>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
            Incompressible continuity: <SourceChips src={L9('11')} size="xs" />
          </div>
          <FormulaCard id="volume-growth" />
        </Supplement>
        <Callout kind="warning">
          <Md>{md`
            - Cross-gradients ($\partial u/\partial y$, $\partial v/\partial x$, …) do **not** belong in $\nabla\cdot\mathbf V$.
            - $\nabla\cdot\mathbf V$ (a scalar: volume change) and $\nabla\times\mathbf V$ (a vector: rotation) are different things.
            - AA′ $= (\partial u/\partial x\,\delta x)\,\delta t$ is a **length**; $(\partial u/\partial x)\,\delta t$ alone is the fractional stretch.
          `}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="ex-element-stretch" />
      </Step>

      <Step kind="interactive">
        <DilatationLab />
      </Step>

      <Step kind="practice">
        <PracticeList concept="linear-deformation" />
        <QuickCheck ids={['q-dilatation-def', 'q-area-constant']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`Translation: with no velocity differences the element just moves $u\,\delta t$, $v\,\delta t$ — no change of shape or size.`,
            md`A normal gradient stretches the element: face AC gets ahead of OB by $(\partial u/\partial x\,\delta x)\,\delta t$.`,
            md`$\dfrac{1}{\delta\forall}\dfrac{d(\delta\forall)}{dt} = \partial u/\partial x + \partial v/\partial y + \partial w/\partial z = \nabla\cdot\mathbf V$ — the volumetric dilatation rate (s⁻¹).`,
            md`$\nabla\cdot\mathbf V = 0$ means volume-preserving: the element may still stretch in one direction and shorten in another.`,
            md`**Trap:** never include cross-gradients in $\nabla\cdot\mathbf V$, and remember the slide's linear formulas are exact only as $\delta t \to 0$.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

function RotationVorticity() {
  return (
    <Concept id="rotation-vorticity">
      <Step kind="intro" src={L9('6–8')}>
        <Md>{md`
          Rotation comes from velocity changes **across** the element: $v$ changing with $x$ and $u$ changing with $y$ (slide 6, *Angular Motion and Deformation*). Point A, a distance $\delta x$ from O, moves up faster than O by $(\partial v/\partial x)\,\delta x$, so line OA turns **counter-clockwise** through a small angle $\delta\alpha$. Point B, a distance $\delta y$ above O, moves to the right faster than O by $(\partial u/\partial y)\,\delta y$, so line OB turns **clockwise** through $\delta\beta$. Using $\tan\delta\alpha \approx \delta\alpha$, the angular velocities of the two lines are $\omega_{OA} = \partial v/\partial x$ and $\omega_{OB} = \partial u/\partial y$.

          > "Rotation of fluid particles is related to certain velocity gradients in the flow field." — slide 6

          Slide 7 then **defines** the rotation $\omega_z$ of the element about the $z$ axis as the *average of the angular velocities of the two mutually perpendicular lines*, with **counter-clockwise rotation positive**, giving $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y)$. The same reasoning about the other axes gives $\omega_x$ and $\omega_y$, and together they form the rotation vector $\boldsymbol\omega = \tfrac12\nabla\times\mathbf V$.

          Slide 8 writes $\tfrac12\nabla\times\mathbf V$ as a determinant, defines the **vorticity** $\boldsymbol\zeta = 2\boldsymbol\omega = \nabla\times\mathbf V$ — "vorticity in a flow field is twice the fluid particle rotation" — and lists three special relations: the **undeformed block** $\partial u/\partial y = -\partial v/\partial x$, the relation $\partial u/\partial y = \partial v/\partial x$, and **irrotational** flow, $\nabla\times\mathbf V = 0$.
        `}</Md>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          **The paddle wheel.** Imagine a tiny, weightless paddle wheel dropped into the flow. Wherever it spins, the flow is rotational, and its spin rate is $\omega_z$. It spins at the *average* rate of the fluid lines around it — exactly why slide 7 averages OA and OB: when the two lines turn at different rates (the element is also being sheared), the part they have in common is the rotation, which is also the turning rate of the element's diagonal.

          **Merry-go-round or Ferris wheel?** On a merry-go-round each wooden horse keeps facing the centre, so it turns once per revolution — that is a *forced vortex*, rotational everywhere. On a Ferris wheel each cabin hangs upright and never turns, although it travels on a circle — that is how the elements of a *free vortex* (e.g. water swirling down a drain, $v_\theta = K/r$) behave: circular paths, zero rotation.
        `}</Md>
        <Callout kind="warning" title="Common mistake">
          <Md>{md`"Curved streamlines ⇒ rotational" and "straight streamlines ⇒ irrotational" are both false. A free vortex is irrotational; Couette flow ($u = Uy/h$, straight streamlines) is rotational with $\omega_z = -U/(2h)$. Only the velocity gradients decide.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual" src={L9('6–8')}>
        <Figure
          caption={md`Slide 6's figures: the velocity variation across the element (left) and the deformed element with OA′, OB′, $\delta\alpha$ and $\delta\beta$ (right). The violet bisector (added here) turns by $\tfrac12(\delta\alpha - \delta\beta) = \omega_z\,\delta t$. Switch between the slide-8 cases to see when the right angle survives.`}
          src={L9('6–8')}
        >
          <AngularElementFigure mode="rotation" />
        </Figure>
      </Step>

      <Step kind="equations" src={L9('6–8')}>
        <FormulaCard id="omega-OA" />
        <FormulaCard id="omega-OB" />
        <Derivation
          title="From two line rotations to ω_z (slide 7)"
          steps={[
            { md: md`OA turns counter-clockwise at $\omega_{OA} = \partial v/\partial x$ — positive in the counter-clockwise convention.`, why: 'slide 6' },
            { md: md`$\delta\beta$ is measured clockwise, so in the counter-clockwise-positive convention OB turns at $-\omega_{OB} = -\partial u/\partial y$.`, why: 'sign convention of slide 7' },
            { md: md`Average of the two: $\omega_z = \tfrac12\left[\pd{v}{x} + \left(-\pd{u}{y}\right)\right] = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right)$.`, why: 'definition: average of two perpendicular lines' },
            { md: md`The same argument in the $y$–$z$ and $z$–$x$ planes (cyclic $x \to y \to z$, $u \to v \to w$) gives $\omega_x$ and $\omega_y$; together $\boldsymbol\omega = \tfrac12\nabla\times\mathbf V$.`, why: 'slide 7, confirmed by the determinant of slide 8' },
          ]}
        />
        <p className="text-xs text-ink-3">Slide 7 states the definition and the result; the sign bookkeeping of steps 1–3 is spelled out here.</p>
        <FormulaCard id="omega-z" />
        <FormulaCard id="omega-xy" />
        <FormulaCard id="rotation-vector" />
        <FormulaCard id="curl-determinant" />
        <FormulaCard id="vorticity" />
        <FormulaCard id="undeformed-block" />
        <FormulaCard id="zero-rotation" />
        <FormulaCard id="irrotational" />
        <Callout kind="exam">
          <Md>{md`To test a **plane** flow for rotation, compute $\partial v/\partial x - \partial u/\partial y$. For a **3-D** flow compute all three components of $\nabla\times\mathbf V$ — one non-zero component makes the flow rotational. Quote $\omega$ in rad/s and $\zeta$ in s⁻¹, and keep the factor 2 between them straight.`}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="ex-rotation-2d" />
        <ExampleCard id="ex-vortex-compare" />
        <ExampleCard id="ex-curl-3d" />
      </Step>

      <Step kind="interactive">
        <PaddleWheel />
      </Step>

      <Step kind="practice">
        <PracticeList concept="rotation-vorticity" />
        <QuickCheck ids={['q-zeta-omega', 'q-minus-sign']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`OA turns at $\partial v/\partial x$ (ccw +), OB at $\partial u/\partial y$ (cw +); $\omega_z$ is their average with counter-clockwise positive: $\tfrac12(\partial v/\partial x - \partial u/\partial y)$.`,
            md`$\boldsymbol\omega = \tfrac12\nabla\times\mathbf V$ (rad/s) and $\boldsymbol\zeta = 2\boldsymbol\omega = \nabla\times\mathbf V$ (s⁻¹).`,
            md`Irrotational ⇔ $\nabla\times\mathbf V = 0$ (in plane flow, $\partial v/\partial x = \partial u/\partial y$).`,
            md`Undeformed block $\partial u/\partial y = -\partial v/\partial x$: rigid rotation, $\omega_z = \partial v/\partial x$, right angles kept.`,
            md`**Trap:** circular paths are not rotation (free vortex), and straight paths do not guarantee irrotational flow (Couette).`,
          ]}
        />
      </Step>
    </Concept>
  )
}

function AngularDeformation() {
  return (
    <Concept id="angular-deformation">
      <Step kind="intro" src={L9('9')}>
        <Md>{md`
          Slide 9 uses the same deformed-element picture to follow the **angle** between OA and OB. OA turns counter-clockwise by $\delta\alpha$ — toward OB — and OB turns clockwise by $\delta\beta$ — toward OA — so the originally right angle closes by the **shearing strain**

          $$
          \delta\gamma = \delta\alpha + \delta\beta .
          $$

          Its rate, the **rate of shearing strain** or **rate of angular deformation**, follows from the small-angle results of slide 6 in the limit $\delta t \to 0$: $\dot\gamma = \partial v/\partial x + \partial u/\partial y$ (boxed on the slide). Together with rotation (slides 6–8) and linear deformation (slide 5), this completes the description of how a fluid element moves.
        `}</Md>
        <Supplement title="Why angular deformation matters">
          <Md>{md`Viscous friction is a response to *angular deformation*, not to rotation: for a Newtonian fluid the shear stress is proportional to $\dot\gamma$ (formula below). A fluid in rigid-body rotation ($\dot\gamma = 0$) carries no viscous shear stress however fast it spins. You will meet this again when the equations of motion are derived.`}</Md>
        </Supplement>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          **A deck of cards.** Push the top of a deck sideways: every card slides a little more than the one below, and the rectangular side of the deck becomes a parallelogram. That is angular deformation — the corners are no longer 90°. Honey squeezed between two sliding glass plates deforms the same way.

          **Sum versus difference.** Both rotation and angular deformation use the cross-gradients $\partial v/\partial x$ and $\partial u/\partial y$, but in opposite ways. Rotation asks *how much the two lines turn together* — half the **difference** of their slide-convention rates. Angular deformation asks *how much they turn toward each other* — the **sum**. A simple shear such as Couette flow does both at once: half of its velocity gradient is rotation and half is pure angular deformation.
        `}</Md>
        <Compare
          items={[
            { title: 'Rotation', tone: 'violet', md: md`$\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right)$ — the lines turn **together**. Zero when $\partial u/\partial y = \partial v/\partial x$.` },
            { title: 'Angular deformation', tone: 'rose', md: md`$\dot\gamma = \pd{v}{x} + \pd{u}{y}$ — the lines turn **toward each other**. Zero for the undeformed block, $\partial u/\partial y = -\partial v/\partial x$.` },
            { title: 'Vorticity', tone: 'indigo', md: md`$\zeta_z = \pd{v}{x} - \pd{u}{y} = 2\omega_z$ — the same information as rotation, without the ½.` },
          ]}
        />
      </Step>

      <Step kind="visual" src={L9('9')}>
        <Figure
          caption={md`Slide 9's deformed element: the shaded wedges are $\delta\alpha$ (OA, counter-clockwise) and $\delta\beta$ (OB, clockwise); together they close the right angle by $\delta\gamma$. Try the "undeformed block" case: the wedges have opposite senses and $\delta\gamma = 0$.`}
          src={L9('9')}
        >
          <AngularElementFigure mode="shear" />
        </Figure>
        <Figure caption={md`Simple shear $u = ky$ = pure angular deformation + rigid clockwise rotation at $\omega_z = -k/2$. The velocity gradients add exactly; over a short time the two motions superpose (supplementary illustration).`}>
          <ShearDecompositionFigure />
        </Figure>
      </Step>

      <Step kind="equations" src={L9('9')}>
        <FormulaCard id="shearing-strain" />
        <Derivation
          title="Rate of shearing strain (slide 9)"
          steps={[
            { md: md`Shearing strain = decrease of the right angle: $\delta\gamma = \delta\alpha + \delta\beta$.`, why: 'both lines close the angle' },
            { md: md`Small angles (slide 6): $\tan\delta\alpha \approx \delta\alpha = (\partial v/\partial x)\,\delta t$ and $\tan\delta\beta \approx \delta\beta = (\partial u/\partial y)\,\delta t$.`, why: 'lever-arm geometry' },
            {
              md: md`$\dot\gamma = \lim_{\delta t\to0}\dfrac{\delta\gamma}{\delta t} = \lim_{\delta t\to0}\dfrac{(\partial v/\partial x)\,\delta t + (\partial u/\partial y)\,\delta t}{\delta t} = \pd{v}{x} + \pd{u}{y}$.`,
              why: md`divide by $\delta t$, take the limit (boxed)`,
            },
          ]}
        />
        <FormulaCard id="shear-strain-rate" />
        <Callout kind="warning">
          <Md>{md`
            - There is **no ½** in $\dot\gamma$ — the ½ belongs to $\omega_z$.
            - A **negative** $\dot\gamma$ (or $\delta\gamma$) means the right angle *opens* rather than closes.
            - $\dot\gamma$ uses the *cross*-gradients; $\partial u/\partial x + \partial v/\partial y$ is the dilatation rate, a different quantity.
          `}</Md>
        </Callout>
        <Supplement title="Putting the four motions together">
          <Md>{md`Near any point O the velocity can be expanded to first order in the distance from O. In plane flow the four gradients split cleanly into the four motions of slide 3 — this is exactly what the concept-1 sandbox animates:`}</Md>
          <FormulaCard id="local-decomposition" />
          <Md>{md`In 3-D there are two more rates of angular deformation, one for each remaining coordinate plane, and the viscous stresses are proportional to these rates:`}</Md>
          <FormulaCard id="shear-rates-3d" />
          <FormulaCard id="newtonian-shear" />
        </Supplement>
      </Step>

      <Step kind="example">
        <ExampleCard id="ex-couette-shear" />
        <ExampleCard id="ex-corner-shear" />
      </Step>

      <Step kind="interactive">
        <ShearRotationMap />
      </Step>

      <Step kind="practice">
        <PracticeList concept="angular-deformation" />
        <QuickCheck ids={['q-gamma-def', 'q-equal-gradients']} />
      </Step>

      <Step kind="takeaways">
        <FlowSteps
          tone="violet"
          steps={[
            { title: 'Write down u, v, w', md: md`Note whether $t$ appears (unsteady) and whether $w = 0$ with no $z$-dependence (plane flow).` },
            { title: 'Differentiate', md: md`All first derivatives: 4 in plane flow, 9 in 3-D (plus $\partial/\partial t$ if unsteady).` },
            { title: 'Volume change?', md: md`Normal gradients: $\nabla\cdot\mathbf V = \partial u/\partial x + \partial v/\partial y + \partial w/\partial z$.` },
            { title: 'Rotation?', md: md`Cross-gradient differences: $\boldsymbol\omega = \tfrac12\nabla\times\mathbf V$, $\boldsymbol\zeta = \nabla\times\mathbf V$.` },
            { title: 'Angular deformation?', md: md`Cross-gradient sums: $\dot\gamma = \partial v/\partial x + \partial u/\partial y$ (and the other planes in 3-D).` },
            { title: 'Acceleration?', md: md`$\mathbf a = \partial\mathbf V/\partial t + (\mathbf V\cdot\nabla)\mathbf V$ at the point of interest.` },
          ]}
        />
        <Takeaways
          items={[
            md`Shearing strain $\delta\gamma = \delta\alpha + \delta\beta$: the decrease of a right angle between two fluid lines.`,
            md`Rate of angular deformation $\dot\gamma = \partial v/\partial x + \partial u/\partial y$ (s⁻¹) — the sum of the cross-gradients, no ½.`,
            md`$\dot\gamma = 0$ for the undeformed block; $\omega_z = 0$ but $\dot\gamma = 2\,\partial v/\partial x$ when $\partial u/\partial y = \partial v/\partial x$.`,
            md`Simple shear (Couette) = half rotation + half pure angular deformation; irrotational flows (free vortex, corner flow) can still shear strongly.`,
            md`Viscous stress follows $\dot\gamma$, not $\omega_z$ — which is why this "rate of angular deformation" reappears in the equations of motion.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

export default function Content() {
  return (
    <>
      <MotionTypes />
      <LinearDeformation />
      <RotationVorticity />
      <AngularDeformation />
    </>
  )
}
