import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowChart, FlowSteps, FormulaCard, Md, PracticeList, QuickCheck, Step,
  Supplement, Takeaways, md,
} from '@/kit'
import { ElementForcesFigure } from '../sims/equations-of-motion/ElementCube'
import { ElementForceSim } from '../sims/equations-of-motion/ElementForceSim'
import { TaylorFaceSim } from '../sims/equations-of-motion/TaylorFaceSim'
import { CauchyTermMap, StressTensorMap } from '../sims/equations-of-motion/CauchyVisuals'
import { CauchyBalanceSim } from '../sims/equations-of-motion/CauchyBalanceSim'
import { PascalPlaneDemo, PressureCubeFigure } from '../sims/equations-of-motion/EulerVisuals'
import { EulerGradientSim } from '../sims/equations-of-motion/EulerGradientSim'

/* ----------------------------------------------------------------------------------------------- sources */

const S3: Src = { doc: 'lec10', pages: '3' }
const S4: Src = { doc: 'lec10', pages: '4' }
const S5: Src = { doc: 'lec10', pages: '5' }
const L9S4: Src = { doc: 'lec9', pages: '4', note: 'acceleration of a fluid particle' }
const FOX221: Src = { doc: 'fox', pages: '221', note: 'inviscid = zero shear stress' }
const FOX247: Src = { doc: 'fox', pages: '247', note: 'high-Re limit → Euler' }

export const meta: TopicMeta = {
  id: 'equations-of-motion',
  unit: 'A',
  title: 'Equations of Motion: Cauchy & Euler',
  subtitle:
    "Newton's second law for a fluid particle — body and surface forces on a differential element, the Cauchy equations that hold for any continuum, and their inviscid limit: Pascal's law, pressure and Euler's equations.",
  minutes: 85,
  sources: [{ doc: 'lec10', pages: '3–5' }, L9S4, FOX221, FOX247],
  concepts: [
    {
      id: 'forces',
      title: 'Body and surface forces on a differential element',
      src: S3,
      summary: 'Gravity acts on the mass of the element, stresses act on its six faces; Taylor-expanding the stresses shows that only their gradients give a net force.',
    },
    {
      id: 'cauchy',
      title: 'Cauchy equations of motion',
      src: S4,
      summary: "Newton's second law per unit volume: ρg + stress gradients = ρ DV/Dt — valid for any continuum, solid or fluid, moving or at rest.",
    },
    {
      id: 'euler',
      title: "Inviscid flow: pressure, Pascal's law & Euler's equations",
      src: S5,
      summary: 'No shear ⇒ the normal stress is the same in every direction (Pascal), −p = σxx = σyy = σzz, and Cauchy becomes Euler: ρg − ∇p = ρ DV/Dt.',
    },
  ],
  sourceNote: md`**Primary source: Lecture 10, slides 3–5** (forces on the element → Cauchy equations → inviscid flow and Euler's equations). Supporting references: Lecture 9 slide 4 for the acceleration of a fluid particle (the right-hand side of every equation here), and Fox & McDonald pp. 221 and 247 for what "inviscid" means and when it is a good model. These slides contain **no worked examples**, so every solved example, practice problem and simulation below is marked ✦ Supplementary. Watch the axes: on slide 3 the $y$-axis points up, on slide 5 the $z$-axis points up — each recreated figure keeps its slide's orientation.`,
}

/* ----------------------------------------------------------------------------------------------- formulas */

export const formulas: FormulaDef[] = [
  {
    id: 'body-force',
    name: 'Body (gravity) force on the element',
    tex: md`\delta F_{bx} = \delta m\, g_x,\qquad \delta F_{by} = \delta m\, g_y,\qquad \delta F_{bz} = \delta m\, g_z`,
    vars: [
      { sym: md`\delta F_{bx},\ \delta F_{by},\ \delta F_{bz}`, desc: 'components of the body force on the element', units: md`\mathrm{N}` },
      { sym: md`\delta m = \rho\,\delta x\,\delta y\,\delta z`, desc: 'mass of the element (density × volume)', units: md`\mathrm{kg}` },
      { sym: md`g_x,\ g_y,\ g_z`, desc: md`components of the gravitational acceleration $\vb{g}$ (e.g. $g_y = -9.81$ m/s² when $y$ points up)`, units: md`\mathrm{m/s^2}` },
      { sym: md`\rho`, desc: 'density of the material', units: md`\mathrm{kg/m^3}` },
      { sym: md`\delta x,\ \delta y,\ \delta z`, desc: 'edge lengths of the element', units: md`\mathrm{m}` },
    ],
    conditions: [
      'gravity is the only body force considered in this course',
      'it acts on every particle inside the element, so it is proportional to the element **volume**',
    ],
    use: md`Resolve $\vb{g}$ along your axes first (with $y$ vertical and upward: $g_x = 0$, $g_y = -g$, $g_z = 0$), then multiply by $\delta m$. Per unit volume the body force is $\rho g_x$, $\rho g_y$, $\rho g_z$ — the first term of each Cauchy equation.`,
    src: S3,
  },
  {
    id: 'face-forces-x',
    name: 'x-direction surface forces on the six faces',
    tex: md`\begin{aligned}
&\text{right }(+x): && \Big(\sigma_{xx}+\pd{\sigma_{xx}}{x}\frac{\delta x}{2}\Big)\,\delta y\,\delta z && \text{drawn in } +x\\
&\text{left }(-x): && \Big(\sigma_{xx}-\pd{\sigma_{xx}}{x}\frac{\delta x}{2}\Big)\,\delta y\,\delta z && \text{drawn in } -x\\
&\text{top }(+y): && \Big(\tau_{yx}+\pd{\tau_{yx}}{y}\frac{\delta y}{2}\Big)\,\delta x\,\delta z && \text{drawn in } +x\\
&\text{bottom }(-y): && \Big(\tau_{yx}-\pd{\tau_{yx}}{y}\frac{\delta y}{2}\Big)\,\delta x\,\delta z && \text{drawn in } -x\\
&\text{front }(+z): && \Big(\tau_{zx}+\pd{\tau_{zx}}{z}\frac{\delta z}{2}\Big)\,\delta x\,\delta y && \text{drawn in } +x\\
&\text{back }(-z): && \Big(\tau_{zx}-\pd{\tau_{zx}}{z}\frac{\delta z}{2}\Big)\,\delta x\,\delta y && \text{drawn in } -x
\end{aligned}`,
    vars: [
      { sym: md`\sigma_{xx}`, desc: md`normal stress at the element centre on planes perpendicular to $x$ (positive in tension)`, units: md`\mathrm{Pa}` },
      { sym: md`\tau_{yx}`, desc: md`shear stress at the centre on planes perpendicular to $y$, acting in $x$`, units: md`\mathrm{Pa}` },
      { sym: md`\tau_{zx}`, desc: md`shear stress at the centre on planes perpendicular to $z$, acting in $x$`, units: md`\mathrm{Pa}` },
      { sym: md`\pd{\sigma_{xx}}{x},\ \pd{\tau_{yx}}{y},\ \pd{\tau_{zx}}{z}`, desc: 'rates of change of those stresses across the element', units: md`\mathrm{Pa/m}` },
      { sym: md`\delta y\,\delta z,\ \delta x\,\delta z,\ \delta x\,\delta y`, desc: md`areas of the faces normal to $x$, $y$ and $z$`, units: md`\mathrm{m^2}` },
    ],
    conditions: [
      md`stresses are quoted at the **centre**; each face lies $\delta x/2$ ($\delta y/2$, $\delta z/2$) away, hence the first-order Taylor correction`,
      'the element is small, so higher-order Taylor terms are dropped',
      md`arrows are drawn for **positive** stresses: $+x$ on the positive faces, $-x$ on the negative faces; a negative bracket reverses the arrow`,
      md`only the $x$-direction forces are drawn on the slide; the $y$ and $z$ directions follow the same pattern`,
    ],
    use: md`Multiply each face stress by **that face's** area, give it the sign of its direction, and add. Opposite faces cancel except for the gradient term, leaving $\big(\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}\big)\delta x\,\delta y\,\delta z$.`,
    src: S3,
  },
  {
    id: 'taylor-face',
    name: 'First-order Taylor estimate of a face stress',
    tex: md`\sigma\Big(x \pm \frac{\delta x}{2}\Big) \approx \sigma(x) \pm \pd{\sigma}{x}\,\frac{\delta x}{2}`,
    vars: [
      { sym: md`\sigma(x)`, desc: md`any stress component, as a function of position along $x$`, units: md`\mathrm{Pa}` },
      { sym: md`x`, desc: 'position of the element centre', units: md`\mathrm{m}` },
      { sym: md`\delta x/2`, desc: 'distance from the centre to a face', units: md`\mathrm{m}` },
      { sym: md`\pd{\sigma}{x}`, desc: 'gradient of the stress at the centre', units: md`\mathrm{Pa/m}` },
    ],
    conditions: [
      'the stress field is smooth (differentiable)',
      md`each face value is in error by terms of order $(\delta x)^2$; in the right-minus-left difference those cancel, leaving an error of order $(\delta x)^3$`,
    ],
    use: md`Start from the centre value and **add** (positive face) or **subtract** (negative face) gradient × half-width. The zoom figure above shows the error disappearing as $\delta x \to 0$.`,
  },
  {
    id: 'net-surface-force',
    name: 'Net surface force on the element (all three directions)',
    tex: md`\begin{aligned}
\delta F_{sx} &= \Big(\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}\Big)\,\delta x\,\delta y\,\delta z\\
\delta F_{sy} &= \Big(\pd{\tau_{xy}}{x}+\pd{\sigma_{yy}}{y}+\pd{\tau_{zy}}{z}\Big)\,\delta x\,\delta y\,\delta z\\
\delta F_{sz} &= \Big(\pd{\tau_{xz}}{x}+\pd{\tau_{yz}}{y}+\pd{\sigma_{zz}}{z}\Big)\,\delta x\,\delta y\,\delta z
\end{aligned}`,
    vars: [
      { sym: md`\delta F_{sx},\ \delta F_{sy},\ \delta F_{sz}`, desc: 'net surface force on the element in each direction', units: md`\mathrm{N}` },
      { sym: md`\sigma_{ii}`, desc: md`normal stresses ($\sigma_{xx}, \sigma_{yy}, \sigma_{zz}$)`, units: md`\mathrm{Pa}` },
      { sym: md`\tau_{ij}`, desc: md`shear stress on the plane normal to $i$, acting in direction $j$`, units: md`\mathrm{Pa}` },
      { sym: md`\delta x\,\delta y\,\delta z`, desc: 'volume of the element', units: md`\mathrm{m^3}` },
    ],
    conditions: [
      'obtained by adding the forces on opposite faces — the centre values cancel in pairs',
      md`each direction collects the three stresses whose **second** subscript is that direction, each differentiated with respect to its **first** subscript`,
    ],
    use: md`Divide by $\delta x\,\delta y\,\delta z$ to get the surface force **per unit volume**, e.g. $\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}$ in $\mathrm{N/m^3}$ — the stress part of the Cauchy equations.`,
  },
  {
    id: 'newton-element',
    name: "Newton's second law for the element",
    tex: md`\delta F_x = \delta F_{bx} + \delta F_{sx} = \delta m\, a_x \qquad (\text{and likewise in } y,\ z)`,
    vars: [
      { sym: md`\delta F_x`, desc: md`total force on the element in $x$`, units: md`\mathrm{N}` },
      { sym: md`\delta F_{bx},\ \delta F_{sx}`, desc: 'body and net surface force in $x$', units: md`\mathrm{N}` },
      { sym: md`\delta m`, desc: md`mass of the element, $\rho\,\delta x\,\delta y\,\delta z$`, units: md`\mathrm{kg}` },
      { sym: md`a_x`, desc: md`$x$-acceleration of the fluid particle, $Du/Dt$`, units: md`\mathrm{m/s^2}` },
    ],
    conditions: [
      'the element is a fixed mass that moves with the flow (a fluid particle)',
      'inertial (non-accelerating) reference frame',
    ],
    use: md`Insert the body force, the net surface force and $a_x = Du/Dt$, then divide by $\delta x\,\delta y\,\delta z$: the result is the $x$-Cauchy equation.`,
  },
  {
    id: 'particle-acceleration',
    name: 'Acceleration of a fluid particle (recap)',
    tex: md`\vb{a} = \frac{D\vb{V}}{Dt} = \pd{\vb{V}}{t} + u\pd{\vb{V}}{x} + v\pd{\vb{V}}{y} + w\pd{\vb{V}}{z}`,
    vars: [
      { sym: md`\vb{a}`, desc: 'acceleration of the fluid particle', units: md`\mathrm{m/s^2}` },
      { sym: md`\vb{V} = u\hat{\mathbf{i}} + v\hat{\mathbf{j}} + w\hat{\mathbf{k}}`, desc: 'velocity field', units: md`\mathrm{m/s}` },
      { sym: md`u,\ v,\ w`, desc: md`velocity components along $x$, $y$, $z$`, units: md`\mathrm{m/s}` },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
      { sym: md`D/Dt`, desc: 'material derivative (rate of change following the particle)', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: ['purely kinematic: holds for any flow, steady or unsteady, compressible or incompressible'],
    use: md`Take components: $a_x = \pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}$ — exactly the bracket on the right of the $x$-Cauchy and $x$-Euler equations. The $\partial/\partial t$ term (local part) vanishes in steady flow; the other three (convective part) remain wherever the velocity varies in space.`,
    src: L9S4,
  },
  {
    id: 'cauchy',
    name: 'Cauchy equations of motion',
    key: true,
    tex: md`\begin{aligned}
\rho g_x+\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z} &= \rho\Big(\pd{u}{t}+u\pd{u}{x}+v\pd{u}{y}+w\pd{u}{z}\Big)\\
\rho g_y+\pd{\tau_{xy}}{x}+\pd{\sigma_{yy}}{y}+\pd{\tau_{zy}}{z} &= \rho\Big(\pd{v}{t}+u\pd{v}{x}+v\pd{v}{y}+w\pd{v}{z}\Big)\\
\rho g_z+\pd{\tau_{xz}}{x}+\pd{\tau_{yz}}{y}+\pd{\sigma_{zz}}{z} &= \rho\Big(\pd{w}{t}+u\pd{w}{x}+v\pd{w}{y}+w\pd{w}{z}\Big)
\end{aligned}`,
    vars: [
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: md`g_x,\ g_y,\ g_z`, desc: 'components of the gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`\sigma_{xx},\ \sigma_{yy},\ \sigma_{zz}`, desc: 'normal stresses (positive in tension)', units: md`\mathrm{Pa}` },
      { sym: md`\tau_{ij}`, desc: md`shear stress on the plane normal to $i$, acting in direction $j$`, units: md`\mathrm{Pa}` },
      { sym: md`u,\ v,\ w`, desc: md`velocity components in $x$, $y$, $z$`, units: md`\mathrm{m/s}` },
      { sym: md`t;\ x,\ y,\ z`, desc: 'time; Cartesian coordinates', units: md`\mathrm{s;\ m}` },
    ],
    conditions: [
      '**any continuum — solid or fluid — in motion or at rest** (slide 4)',
      'no relation between stress and deformation (constitutive law) has been assumed — the source of that generality',
      'inertial reference frame; gravity is the only body force',
    ],
    use: md`Every term is a force per unit volume ($\mathrm{N/m^3}$). Use the equations to find the net stress gradient that a **known motion** requires, or — once a constitutive law is chosen — to find the motion. They cannot be solved alone: the stresses are extra unknowns.`,
    src: S4,
  },
  {
    id: 'cauchy-index',
    name: 'Cauchy equations — compact memory form',
    tex: md`\rho g_j+\pd{\tau_{xj}}{x}+\pd{\tau_{yj}}{y}+\pd{\tau_{zj}}{z}=\rho\,\frac{DV_j}{Dt},\qquad j = x,\ y,\ z`,
    vars: [
      { sym: md`j`, desc: 'direction of the equation (x, y or z)' },
      { sym: md`\tau_{xj},\ \tau_{yj},\ \tau_{zj}`, desc: md`the three stresses that act in direction $j$ on the $x$-, $y$- and $z$-faces (with $\tau_{jj}$ read as the normal stress $\sigma_{jj}$)`, units: md`\mathrm{Pa}` },
      { sym: md`V_j`, desc: md`velocity component in direction $j$ ($V_x = u$, $V_y = v$, $V_z = w$)`, units: md`\mathrm{m/s}` },
      { sym: md`\frac{DV_j}{Dt}`, desc: md`acceleration component $\pd{V_j}{t} + u\pd{V_j}{x} + v\pd{V_j}{y} + w\pd{V_j}{z}$`, units: md`\mathrm{m/s^2}` },
    ],
    conditions: ['identical content to the three Cauchy equations — a memory aid only'],
    use: md`To write the $j$-equation: take the column of stresses whose **second** subscript is $j$ and differentiate each with respect to its **first** subscript.`,
  },
  {
    id: 'pressure-def',
    name: 'Pressure in a fluid without shear',
    key: true,
    tex: md`-p = \sigma_{xx} = \sigma_{yy} = \sigma_{zz}`,
    vars: [
      { sym: md`p`, desc: 'pressure (positive in compression)', units: md`\mathrm{Pa}` },
      { sym: md`\sigma_{xx},\ \sigma_{yy},\ \sigma_{zz}`, desc: 'normal stresses at the point (positive in tension)', units: md`\mathrm{Pa}` },
    ],
    conditions: [
      "no shearing stresses present (inviscid flow, or a fluid at rest) — then by Pascal's law the normal stress is the same in every direction",
      md`the negative sign makes the compressive normal stress expected in a fluid a **positive** $p$`,
    ],
    use: md`In the Cauchy equations replace every normal stress by $-p$ and every shear stress by $0$; for example $\pd{\sigma_{xx}}{x} \to -\pd{p}{x}$.`,
    src: S5,
  },
  {
    id: 'euler-components',
    name: "Euler's equations of motion (components)",
    key: true,
    tex: md`\begin{aligned}
\rho g_x-\pd{p}{x} &= \rho\Big(\pd{u}{t}+u\pd{u}{x}+v\pd{u}{y}+w\pd{u}{z}\Big)\\
\rho g_y-\pd{p}{y} &= \rho\Big(\pd{v}{t}+u\pd{v}{x}+v\pd{v}{y}+w\pd{v}{z}\Big)\\
\rho g_z-\pd{p}{z} &= \rho\Big(\pd{w}{t}+u\pd{w}{x}+v\pd{w}{y}+w\pd{w}{z}\Big)
\end{aligned}`,
    vars: [
      { sym: md`p`, desc: 'pressure', units: md`\mathrm{Pa}` },
      { sym: md`\pd{p}{x},\ \pd{p}{y},\ \pd{p}{z}`, desc: 'pressure gradient components', units: md`\mathrm{Pa/m}` },
      { sym: md`\rho`, desc: 'density (may vary — it stays inside the equations)', units: md`\mathrm{kg/m^3}` },
      { sym: md`g_x,\ g_y,\ g_z`, desc: 'components of the gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
    ],
    conditions: [
      md`**inviscid**: all shear stresses zero and $\sigma_{xx} = \sigma_{yy} = \sigma_{zz} = -p$ (slide 5)`,
      'steady or unsteady, compressible or incompressible, rotational or irrotational — none of these is assumed',
      'exact also for a viscous fluid in rigid-body motion (no deformation ⇒ no shear)',
    ],
    use: md`Typical task: given $\vb{V}(x, y, z, t)$, evaluate the right-hand sides, then $\pd{p}{x} = \rho(g_x - a_x)$ etc., and integrate to get $p$. Conversely, a known pressure field gives the acceleration.`,
    src: S5,
  },
  {
    id: 'euler-vector',
    name: "Euler's equation (vector form)",
    key: true,
    tex: md`\rho\vb{g}-\nabla p=\rho\left[\pd{\vb{V}}{t}+(\vb{V}\cdot\nabla)\vb{V}\right]`,
    vars: [
      { sym: md`\vb{g}`, desc: 'gravitational acceleration vector', units: md`\mathrm{m/s^2}` },
      { sym: md`\nabla p`, desc: md`pressure gradient $\big(\pd{p}{x}, \pd{p}{y}, \pd{p}{z}\big)$`, units: md`\mathrm{Pa/m}` },
      { sym: md`\vb{V}`, desc: 'velocity vector', units: md`\mathrm{m/s}` },
      { sym: md`(\vb{V}\cdot\nabla)`, desc: md`$u\pd{}{x} + v\pd{}{y} + w\pd{}{z}$`, units: md`\mathrm{s^{-1}}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: ['same as the component form: zero shear stress (inviscid)', md`the bracket is the particle acceleration $D\vb{V}/Dt$`],
    use: md`$-\nabla p$ is the net pressure force per unit volume and points from high to low pressure. Rearranged, $\nabla p = \rho\,(\vb{g} - D\vb{V}/Dt)$: the pressure gradient that gravity and the motion require.`,
    src: S5,
  },
  {
    id: 'rigid-body',
    name: 'Rigid-body motion of a fluid',
    tex: md`\nabla p = \rho\,(\vb{g} - \vb{a})`,
    vars: [
      { sym: md`\vb{a}`, desc: md`acceleration of the fluid — the same as that of its container (e.g. $\vb{a} = -\Omega^2 r\,\hat{\mathbf{e}}_r$ in steady rotation)`, units: md`\mathrm{m/s^2}` },
      { sym: md`\nabla p`, desc: 'pressure gradient', units: md`\mathrm{Pa/m}` },
      { sym: md`\vb{g}`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: [
      'the whole fluid moves like a solid body: uniform linear acceleration, or steady rotation about a fixed axis',
      'no relative motion between particles ⇒ no deformation ⇒ no shear stress, even in a viscous fluid — so Euler holds exactly',
    ],
    use: md`Surfaces of constant pressure (including a free surface, $p = p_a$) are perpendicular to $\vb{g} - \vb{a}$. Examples: lift accelerating upward, $\pd{p}{z} = -\rho(g + a_z)$; rotating cup, $\pd{p}{r} = \rho\Omega^2 r$.`,
  },
  {
    id: 'plane-stress',
    name: 'Stress on an inclined plane (2-D)',
    tex: md`\begin{aligned}
\sigma_n(\theta) &= \sigma_{xx}\cos^2\theta+\sigma_{yy}\sin^2\theta+2\tau_{xy}\sin\theta\cos\theta\\
\tau_n(\theta) &= (\sigma_{yy}-\sigma_{xx})\sin\theta\cos\theta+\tau_{xy}\big(\cos^2\theta-\sin^2\theta\big)
\end{aligned}`,
    vars: [
      { sym: md`\theta`, desc: md`angle from the $x$-axis to the plane's unit normal`, units: md`\mathrm{rad}` },
      { sym: md`\sigma_n,\ \tau_n`, desc: 'normal and shear stress acting on that plane', units: md`\mathrm{Pa}` },
      { sym: md`\sigma_{xx},\ \sigma_{yy}`, desc: 'normal stresses on the x- and y-faces', units: md`\mathrm{Pa}` },
      { sym: md`\tau_{xy} = \tau_{yx}`, desc: 'shear stress (symmetric)', units: md`\mathrm{Pa}` },
    ],
    conditions: ['plane (two-dimensional) state of stress at a point', md`symmetric stress tensor, $\tau_{xy} = \tau_{yx}$`],
    use: md`Put $\tau_{xy} = 0$ and $\sigma_{xx} = \sigma_{yy} = -p$: then $\sigma_n = -p$ and $\tau_n = 0$ for **every** $\theta$ — Pascal's law. Any shear, or unequal normal stresses, makes $\sigma_n$ depend on direction.`,
  },
]

/* ----------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  {
    id: 'forces-six-faces',
    concept: 'forces',
    title: 'Six face forces on a 20 mm cube',
    difficulty: 2,
    given: md`A cubic fluid element with $\delta x = \delta y = \delta z = 20$ mm. At its centre: $\sigma_{xx} = -1500$ Pa, $\pd{\sigma_{xx}}{x} = -4000$ Pa/m; $\tau_{yx} = 30$ Pa, $\pd{\tau_{yx}}{y} = 1000$ Pa/m; $\tau_{zx} = 0$ everywhere. Density $\rho = 1000$ kg/m³; the $x$-axis is horizontal, so $g_x = 0$.`,
    find: md`The $x$-force on each of the six faces, the net surface force $\delta F_{sx}$ and the acceleration $a_x$ of the element.`,
    assumptions: md`First-order Taylor expansion about the centre (the slide-3 labels). A positive stress acts in $+x$ on a positive face and in $-x$ on a negative face.`,
    steps: [
      {
        title: 'Geometry',
        md: md`Half-width $\delta x/2 = 0.010$ m. Every face has area $(0.020)^2 = 4.0\times10^{-4}$ m²; the volume is $\delta V = (0.020)^3 = 8.0\times10^{-6}$ m³.`,
      },
      {
        title: 'Normal stress on the two x-faces',
        md: md`Right face: $\sigma_{xx} + \pd{\sigma_{xx}}{x}\frac{\delta x}{2} = -1500 + (-4000)(0.010) = -1540$ Pa, so its $x$-force is $(-1540)(4.0\times10^{-4}) = -0.616$ N — it points in $-x$, a **push** into the element.

Left face: $\sigma_{xx} - \pd{\sigma_{xx}}{x}\frac{\delta x}{2} = -1500 + 40 = -1460$ Pa; on a negative face the $x$-force is $-(-1460)(4.0\times10^{-4}) = +0.584$ N, again a push into the element.

Pair: $-0.616 + 0.584 = -0.032$ N.`,
      },
      {
        title: 'Shear stress on the two y-faces',
        md: md`Top: $30 + (1000)(0.010) = 40$ Pa, giving $+(40)(4.0\times10^{-4}) = +0.016$ N. Bottom: $30 - 10 = 20$ Pa, giving $-(20)(4.0\times10^{-4}) = -0.008$ N. Pair: $+0.008$ N.`,
      },
      { title: 'z-faces', md: md`$\tau_{zx} = 0$, so the front and back faces carry no $x$-force.` },
      {
        title: 'Net surface force',
        md: md`$\delta F_{sx} = -0.032 + 0.008 + 0 = -0.024$ N.

Shortcut check: $\big(\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}\big)\delta V = (-4000 + 1000 + 0)(8.0\times10^{-6}) = -0.024$ N ✓`,
      },
      {
        title: 'Acceleration',
        md: md`$\delta m = \rho\,\delta V = 1000 \times 8.0\times10^{-6} = 8.0\times10^{-3}$ kg and $\delta F_{bx} = \delta m\,g_x = 0$, so $a_x = \delta F_{sx}/\delta m = -0.024/0.008 = -3.0$ m/s².`,
      },
    ],
    answer: md`Face forces ($x$-components): right $-0.616$ N, left $+0.584$ N, top $+0.016$ N, bottom $-0.008$ N, front and back $0$. Net $\delta F_{sx} = -0.024$ N, so $a_x = -3.0$ m/s².`,
    insight: 'The individual face forces (about 0.6 N) are some 25 times larger than the net force (0.024 N): the net is a small difference of large numbers, which is exactly what the gradient terms capture.',
  },
  {
    id: 'forces-rest-balance',
    concept: 'forces',
    title: 'Why a fluid at rest does not move',
    difficulty: 1,
    given: md`Water ($\rho = 1000$ kg/m³) at rest, with $y$ vertical and upward ($g_x = g_z = 0$, $g_y = -9.81$ m/s²). A fluid at rest carries no shear stress, and its normal stress is $\sigma_{yy} = -p$ (the sign is explained in Concept 3) with the hydrostatic pressure $p = p_a + \rho g\,(h - y)$. Consider a cube with 10 mm edges.`,
    find: md`The $y$-direction body force and net surface force on the cube. Does it accelerate?`,
    steps: [
      {
        title: 'Body force',
        md: md`$\delta m = \rho\,\delta V = 1000 \times (0.010)^3 = 1.0\times10^{-3}$ kg, so $\delta F_{by} = \delta m\,g_y = (1.0\times10^{-3})(-9.81) = -9.81\times10^{-3}$ N (downward).`,
      },
      {
        title: 'Stress gradient',
        md: md`$\sigma_{yy} = -p = -p_a - \rho g\,(h - y)$, so $\pd{\sigma_{yy}}{y} = +\rho g = +9810$ Pa/m. With no shear, $\sigma_{yy}$ is the only stress that acts in $y$.`,
      },
      {
        title: 'Net surface force — the y-version of slide 3',
        md: md`Top face: $\big(\sigma_{yy} + \pd{\sigma_{yy}}{y}\frac{\delta y}{2}\big)\delta x\,\delta z$ acting in $+y$; bottom face: $\big(\sigma_{yy} - \pd{\sigma_{yy}}{y}\frac{\delta y}{2}\big)\delta x\,\delta z$ acting in $-y$. Their sum is $\pd{\sigma_{yy}}{y}\,\delta V = 9810 \times 1.0\times10^{-6} = +9.81\times10^{-3}$ N (upward).

Physically: the pressure on the bottom face is higher by $\rho g\,\delta y = 1000 \times 9.81 \times 0.010 = 98.1$ Pa, which pushes up with $98.1 \times 1.0\times10^{-4} = 9.81\times10^{-3}$ N.`,
      },
      {
        title: 'Balance',
        md: md`$\delta F_y = \delta F_{by} + \delta F_{sy} = -9.81\times10^{-3} + 9.81\times10^{-3} = 0$, so $a_y = 0$: the cube stays at rest.`,
      },
    ],
    answer: md`$\delta F_{by} = -9.81\times10^{-3}$ N and $\delta F_{sy} = +9.81\times10^{-3}$ N cancel, so $a_y = 0$ — the hydrostatic pressure gradient exactly carries the weight.`,
    insight: 'Hydrostatics is the special case "acceleration = 0" of the force balance on the element.',
  },
  {
    id: 'cauchy-stagnation',
    concept: 'cauchy',
    title: 'What must the stresses supply? Stagnation flow in a vertical plane',
    difficulty: 2,
    given: md`Steady plane flow $u = ax$, $v = -ay$, $w = 0$ with $a = 2\ \mathrm{s^{-1}}$; water, $\rho = 1000$ kg/m³; the $x$–$y$ plane is vertical with $y$ up ($g_x = 0$, $g_y = -9.81$ m/s²). Point $(x, y) = (1.0\ \mathrm{m},\ 0.5\ \mathrm{m})$.`,
    find: md`The acceleration $(a_x, a_y)$ and the net surface force per unit volume the stresses must supply in $x$, $f_{s,x} = \pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}$, and in $y$, $f_{s,y}$.`,
    steps: [
      {
        title: 'Velocity gradients',
        md: md`$\pd{u}{x} = a$, $\pd{u}{y} = 0$, $\pd{v}{x} = 0$, $\pd{v}{y} = -a$; steady, so the local terms vanish. (Continuity: $\pd{u}{x} + \pd{v}{y} = a - a = 0$ ✓.)`,
      },
      {
        title: 'Acceleration (Lecture 9, slide 4)',
        md: md`$a_x = u\pd{u}{x} + v\pd{u}{y} = (ax)(a) + 0 = a^2x = 4 \times 1.0 = 4.0$ m/s²

$a_y = u\pd{v}{x} + v\pd{v}{y} = 0 + (-ay)(-a) = a^2y = 4 \times 0.5 = 2.0$ m/s²

A steady flow, yet every particle accelerates — purely convectively.`,
      },
      { title: 'Cauchy, x-equation', md: md`$\rho g_x + f_{s,x} = \rho a_x \Rightarrow f_{s,x} = \rho a_x - \rho g_x = 1000 \times 4.0 - 0 = 4000$ N/m³.` },
      {
        title: 'Cauchy, y-equation',
        md: md`$f_{s,y} = \rho a_y - \rho g_y = 1000 \times 2.0 - 1000 \times (-9.81) = 2000 + 9810 = 11\,810$ N/m³.`,
      },
      {
        title: 'Interpretation',
        md: md`The stresses must push each cubic metre with 4000 N in $+x$ and 11 810 N upward: 9810 N of that just holds up the weight, the rest accelerates it. Magnitude $\sqrt{4000^2 + 11\,810^2} \approx 1.25\times10^4$ N/m³. Cauchy fixes the **net** stress gradient but not how it splits between normal and shear stresses — that needs a constitutive law (Concept 3 sets the shear to zero).`,
      },
    ],
    answer: md`$a_x = 4.0$ m/s², $a_y = 2.0$ m/s²; $f_{s,x} = 4000$ N/m³ and $f_{s,y} = 11\,810$ N/m³ (magnitude $\approx 1.25\times10^4$ N/m³).`,
    insight: 'Read Cauchy backwards: a known motion tells you what the stresses must do.',
  },
  {
    id: 'cauchy-solid-column',
    concept: 'cauchy',
    title: 'Any continuum: a steel column under its own weight',
    difficulty: 2,
    given: md`A vertical steel column ($\rho = 7850$ kg/m³) of height $H = 10$ m stands at rest; $y$ is measured upward from the base and the top $y = H$ is free, so $\sigma_{yy}(H) = 0$. The sides are free, so take $\sigma_{yy}(y)$ as the only non-zero stress.`,
    find: md`$\sigma_{yy}(y)$ and its value at the base; compare with a 10 m column of water.`,
    steps: [
      {
        title: 'Which equation?',
        md: md`Slide 4: the Cauchy equations hold for any continuum, solid or fluid, at rest or moving. At rest the right-hand sides are zero. The $x$- and $z$-equations reduce to $0 = 0$ ($g_x = g_z = 0$ and no stress varies in those directions).`,
      },
      {
        title: 'y-equation',
        md: md`$\rho g_y + \pd{\tau_{xy}}{x} + \pd{\sigma_{yy}}{y} + \pd{\tau_{zy}}{z} = 0$ with $g_y = -g$ and no shear: $\frac{d\sigma_{yy}}{dy} = \rho g$.`,
      },
      { title: 'Integrate', md: md`With $\sigma_{yy}(H) = 0$: $\sigma_{yy} = \rho g\,(y - H)$ — negative (compressive) everywhere below the top.` },
      {
        title: 'At the base',
        md: md`$\sigma_{yy}(0) = -\rho g H = -7850 \times 9.81 \times 10 = -7.70\times10^5$ Pa $= -0.770$ MPa (compression).`,
      },
      {
        title: 'Same equation, water',
        md: md`For water $\sigma_{yy}(0) = -1000 \times 9.81 \times 10 = -9.81\times10^4$ Pa, i.e. $p = 98.1$ kPa gauge — the familiar hydrostatic result. Only the density changed.`,
      },
    ],
    answer: md`$\sigma_{yy} = \rho g\,(y - H)$; at the base $\sigma_{yy} = -0.770$ MPa (compressive). A 10 m water column gives $-98.1$ kPa, i.e. $p = 98.1$ kPa gauge.`,
    insight: 'The Cauchy equations do not care whether the continuum is steel or water — only the stresses (and, later, their constitutive law) differ.',
  },
  {
    id: 'euler-nozzle',
    concept: 'euler',
    title: 'Pressure gradient needed to accelerate water through a nozzle',
    difficulty: 2,
    given: md`Steady, inviscid flow of water ($\rho = 1000$ kg/m³) along the horizontal centreline of a converging nozzle: $u = U_0(1 + x/L)$ with $U_0 = 2$ m/s and $L = 0.5$ m, from $x = 0$ (inlet) to $x = L$ (exit). On the centreline $v = w = 0$.`,
    find: md`$a_x$ and $\pd{p}{x}$ at $x = 0$, $0.25$ m and $0.5$ m, and the pressure drop $p(0) - p(L)$.`,
    steps: [
      {
        title: 'Euler, x-component',
        md: md`Steady ($\pd{u}{t} = 0$), horizontal ($g_x = 0$) and $v = w = 0$ on the centreline, so $\rho g_x - \pd{p}{x} = \rho\big(\pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}\big)$ reduces to $-\pd{p}{x} = \rho\,u\pd{u}{x}$.`,
      },
      {
        title: 'Acceleration',
        md: md`$\pd{u}{x} = U_0/L = 2/0.5 = 4\ \mathrm{s^{-1}}$, so $a_x = u\pd{u}{x} = \frac{U_0^2}{L}\big(1 + \frac{x}{L}\big) = 8\big(1 + \frac{x}{L}\big)$: $8.0$, $12.0$ and $16.0$ m/s² at $x = 0$, $0.25$ and $0.5$ m.`,
      },
      {
        title: 'Pressure gradient',
        md: md`$\pd{p}{x} = -\rho a_x = -8000$, $-12\,000$ and $-16\,000$ Pa/m. Negative everywhere: the pressure falls in the flow direction and pushes each particle forward.`,
      },
      {
        title: 'Integrate',
        md: md`$p(0) - p(L) = \int_0^L \rho a_x\,dx = \frac{\rho U_0^2}{L}\Big[x + \frac{x^2}{2L}\Big]_0^L = 1.5\,\rho U_0^2 = 1.5 \times 1000 \times 2^2 = 6000$ Pa.`,
      },
      {
        title: 'Cross-check (preview of Bernoulli)',
        md: md`$\tfrac12\rho\,(u_L^2 - u_0^2) = \tfrac12(1000)(4^2 - 2^2) = 6000$ Pa ✓ — as expected for steady, inviscid, incompressible flow along a streamline (developed in the Bernoulli topic from Lecture 10, slides 9–11).`,
      },
    ],
    answer: md`$a_x = 8.0,\ 12.0,\ 16.0$ m/s²; $\pd{p}{x} = -8.0,\ -12.0,\ -16.0$ kPa/m; $p(0) - p(L) = 6.0$ kPa.`,
    insight: 'A fluid particle speeds up only if the pressure behind it exceeds the pressure ahead of it: −∂p/∂x = ρ a_x.',
  },
  {
    id: 'euler-rotation',
    concept: 'euler',
    title: 'Rigid-body rotation: pressure field and free surface of a spinning cup',
    difficulty: 3,
    given: md`Water ($\rho = 1000$ kg/m³) in a cylindrical cup of radius $R = 0.10$ m rotates with the cup at $\Omega = 10$ rad/s about the vertical $z$-axis ($z$ up, $g_z = -9.81$ m/s²). After start-up the water moves as a rigid body: $u = -\Omega y$, $v = \Omega x$, $w = 0$.`,
    find: md`(a) $p(x, y, z)$; (b) $\pd{p}{x}$ at the wall point $(R, 0)$; (c) how much higher the free surface stands at the wall than on the axis.`,
    steps: [
      {
        title: 'Why Euler applies to a viscous liquid here',
        md: md`In rigid-body motion the particles do not move relative to one another, so there is no deformation and no viscous shear stress. With zero shear the normal stresses equal $-p$ and Euler's equations hold **exactly**.`,
      },
      {
        title: 'Accelerations',
        md: md`Steady. $a_x = u\pd{u}{x} + v\pd{u}{y} = (-\Omega y)(0) + (\Omega x)(-\Omega) = -\Omega^2 x$; $a_y = u\pd{v}{x} + v\pd{v}{y} = (-\Omega y)(\Omega) + 0 = -\Omega^2 y$; $a_z = 0$. A centripetal acceleration of magnitude $\Omega^2 r$ pointing at the axis.`,
      },
      {
        title: 'Euler components',
        md: md`$x$: $-\pd{p}{x} = \rho(-\Omega^2 x) \Rightarrow \pd{p}{x} = \rho\Omega^2 x$. $\ y$: $\pd{p}{y} = \rho\Omega^2 y$. $\ z$: $\rho g_z - \pd{p}{z} = 0 \Rightarrow \pd{p}{z} = -\rho g$.`,
      },
      {
        title: 'Integrate',
        md: md`$p = p_0 + \tfrac12\rho\Omega^2(x^2 + y^2) - \rho g z = p_0 + \tfrac12\rho\Omega^2 r^2 - \rho g z$, where $p_0$ is the pressure on the axis at $z = 0$. (The mixed derivatives agree, so a single-valued $p$ exists.)`,
      },
      { title: '(b) Gradient at the wall', md: md`$\pd{p}{x} = \rho\Omega^2 x = 1000 \times 10^2 \times 0.10 = 1.0\times10^4$ Pa/m.` },
      {
        title: '(c) Free surface',
        md: md`On the free surface $p = p_a$ is constant, so $\tfrac12\rho\Omega^2 r^2 - \rho g z_s = $ const and $z_s = z_s(0) + \frac{\Omega^2 r^2}{2g}$ — a paraboloid. The rise at the wall is $\frac{\Omega^2 R^2}{2g} = \frac{10^2 \times 0.10^2}{2 \times 9.81} = \frac{1}{19.62} = 0.0510$ m $= 5.10$ cm.`,
      },
    ],
    answer: md`(a) $p = p_0 + \tfrac12\rho\Omega^2 r^2 - \rho g z$; (b) $\pd{p}{x} = 1.0\times10^4$ Pa/m at the wall; (c) the surface is $\Omega^2R^2/2g = 5.10$ cm higher at the wall.`,
    insight: 'Rigid rotation is rotational (vorticity 2Ω), yet Euler applies exactly: Euler needs zero shear, not zero vorticity.',
  },
]

/* ----------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  {
    id: 'forces-p1',
    concept: 'forces',
    difficulty: 2,
    q: md`A fluid element has edges $\delta x = 4$ mm, $\delta y = 2$ mm, $\delta z = 3$ mm. At its centre $\sigma_{xx} = -500$ Pa, $\pd{\sigma_{xx}}{x} = -2.5\times10^4$ Pa/m, $\pd{\tau_{yx}}{y} = 6.0\times10^3$ Pa/m and $\pd{\tau_{zx}}{z} = -1.0\times10^3$ Pa/m; $\rho = 1200$ kg/m³ and $g_x = 0$.

(a) Find the $x$-force on the right ($+x$) face. (b) Find the net $x$ surface force $\delta F_{sx}$. (c) Find $a_x$.`,
    hint: md`The faces normal to $x$ have area $\delta y\,\delta z$ — not $\delta x\,\delta y$. For (b), every opposite-face pair contributes gradient × volume.`,
    answer: md`(a) $-3.3\times10^{-3}$ N; (b) $\delta F_{sx} = -4.8\times10^{-4}$ N; (c) $a_x = -16.7$ m/s².`,
    solution: md`**(a)** Right-face stress: $\sigma_{xx} + \pd{\sigma_{xx}}{x}\frac{\delta x}{2} = -500 + (-2.5\times10^4)(0.002) = -550$ Pa. Area $\delta y\,\delta z = (0.002)(0.003) = 6.0\times10^{-6}$ m². Force $= (-550)(6.0\times10^{-6}) = -3.3\times10^{-3}$ N, pointing in $-x$ (a push).

For comparison, the left face carries $-500 + 50 = -450$ Pa, so its $x$-force is $-(-450)(6.0\times10^{-6}) = +2.7\times10^{-3}$ N. The pair sums to $-6.0\times10^{-4}$ N $= \pd{\sigma_{xx}}{x}\,\delta V$.

**(b)** $\delta V = (0.004)(0.002)(0.003) = 2.4\times10^{-8}$ m³, and

$$
\delta F_{sx} = \Big(\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}\Big)\delta V = (-2.5\times10^4 + 6.0\times10^3 - 1.0\times10^3)(2.4\times10^{-8}) = -4.8\times10^{-4}\ \mathrm{N}
$$

**(c)** $\delta m = \rho\,\delta V = 1200 \times 2.4\times10^{-8} = 2.88\times10^{-5}$ kg, so $a_x = \delta F_{sx}/\delta m = -4.8\times10^{-4}/2.88\times10^{-5} = -16.7$ m/s². (Shortcut: $a_x = (-2.0\times10^4\ \mathrm{N/m^3})/(1200\ \mathrm{kg/m^3})$.)`,
    check: [
      { label: '(a) right-face force', value: -3.3e-3, units: md`\mathrm{N}` },
      { label: md`(b) $\delta F_{sx}$`, value: -4.8e-4, units: md`\mathrm{N}` },
      { label: md`(c) $a_x$`, value: -16.67, units: md`\mathrm{m/s^2}` },
    ],
  },
  {
    id: 'forces-p2',
    concept: 'forces',
    difficulty: 1,
    q: md`A cube of mercury ($\rho = 13\,600$ kg/m³) with 5 mm edges is part of a larger body of mercury at rest; $y$ points up. (a) By how much does the pressure on its bottom face exceed that on its top face? (b) What net vertical surface force acts on the cube, and how does it compare with the cube's weight?`,
    hint: md`At rest $\pd{p}{y} = -\rho g$, so across a height $\delta y$ the pressure changes by $\rho g\,\delta y$. The net force is that difference times the face area.`,
    answer: md`(a) $\Delta p = 667$ Pa; (b) $1.67\times10^{-2}$ N upward — exactly the weight $\delta m\,g$.`,
    solution: md`**(a)** $\Delta p = \rho g\,\delta y = 13\,600 \times 9.81 \times 0.005 = 667.1$ Pa.

**(b)** Face area $\delta x\,\delta z = (0.005)^2 = 2.5\times10^{-5}$ m², so the net upward surface force is $667.1 \times 2.5\times10^{-5} = 1.668\times10^{-2}$ N. In slide-3 form: $\delta F_{sy} = \pd{\sigma_{yy}}{y}\,\delta V$ with $\sigma_{yy} = -p$, $\pd{\sigma_{yy}}{y} = +\rho g = 1.334\times10^5$ Pa/m and $\delta V = 1.25\times10^{-7}$ m³ — the same $1.668\times10^{-2}$ N.

Weight: $\delta m\,g = (13\,600 \times 1.25\times10^{-7})(9.81) = (1.70\times10^{-3})(9.81) = 1.668\times10^{-2}$ N, i.e. a body force $\delta F_{by} = -1.668\times10^{-2}$ N. The two cancel, so $a_y = 0$ — consistent with rest.`,
    check: [
      { label: '(a) pressure difference', value: 667.08, units: md`\mathrm{Pa}` },
      { label: '(b) net surface force', value: 0.016677, units: md`\mathrm{N}` },
    ],
  },
  {
    id: 'forces-p3',
    concept: 'forces',
    difficulty: 2,
    q: md`Slide 3 draws only the $x$-direction surface forces. Write the six **$y$-direction** surface forces on the element (stress × area, with the Taylor terms) and add them to obtain the net $y$ surface force $\delta F_{sy}$.`,
    hint: md`The stresses that act in $y$ have second subscript $y$: $\tau_{xy}$ (on the $x$-faces), $\sigma_{yy}$ (on the $y$-faces) and $\tau_{zy}$ (on the $z$-faces).`,
    answer: md`$\delta F_{sy} = \Big(\pd{\tau_{xy}}{x} + \pd{\sigma_{yy}}{y} + \pd{\tau_{zy}}{z}\Big)\delta x\,\delta y\,\delta z$`,
    solution: md`Faces normal to $x$ (area $\delta y\,\delta z$): $\Big(\tau_{xy} \pm \pd{\tau_{xy}}{x}\frac{\delta x}{2}\Big)\delta y\,\delta z$, acting in $\pm y$.

Faces normal to $y$ (area $\delta x\,\delta z$): $\Big(\sigma_{yy} \pm \pd{\sigma_{yy}}{y}\frac{\delta y}{2}\Big)\delta x\,\delta z$, acting in $\pm y$.

Faces normal to $z$ (area $\delta x\,\delta y$): $\Big(\tau_{zy} \pm \pd{\tau_{zy}}{z}\frac{\delta z}{2}\Big)\delta x\,\delta y$, acting in $\pm y$.

Upper signs: the positive face, force in $+y$; lower signs: the negative face, force in $-y$. Adding each pair, the centre values cancel and each pair leaves gradient × volume:

$$
\delta F_{sy} = \Big(\pd{\tau_{xy}}{x} + \pd{\sigma_{yy}}{y} + \pd{\tau_{zy}}{z}\Big)\delta x\,\delta y\,\delta z
$$

Divided by the volume, this is exactly the stress part of the $y$-Cauchy equation on slide 4.`,
  },
  {
    id: 'cauchy-p1',
    concept: 'cauchy',
    difficulty: 2,
    q: md`The unsteady plane flow $u = 2xt$, $v = -2yt$, $w = 0$ ($u, v$ in m/s, $x, y$ in m, $t$ in s) carries water ($\rho = 1000$ kg/m³) in a horizontal plane ($g_x = g_y = 0$). At $(1\ \mathrm{m}, 1\ \mathrm{m})$ and $t = 1$ s find (a) the local and convective parts of $a_x$, and (b) the net surface force per unit volume that the stresses must supply in $x$ and in $y$.`,
    hint: md`Local part: $\pd{u}{t}$. Convective part: $u\pd{u}{x} + v\pd{u}{y}$. Then Cauchy: $f_{s,x} = \rho a_x - \rho g_x$.`,
    answer: md`(a) local $2$ m/s², convective $4$ m/s², so $a_x = 6$ m/s² (and $a_y = 2$ m/s²); (b) $f_{s,x} = 6000$ N/m³, $f_{s,y} = 2000$ N/m³.`,
    solution: md`**Continuity check:** $\pd{u}{x} + \pd{v}{y} = 2t - 2t = 0$ — a valid incompressible flow.

**(a)** Local: $\pd{u}{t} = 2x = 2$ m/s². Convective: $u\pd{u}{x} + v\pd{u}{y} = (2xt)(2t) + (-2yt)(0) = 4xt^2 = 4$ m/s². So $a_x = 2 + 4 = 6$ m/s².

For $y$: $\pd{v}{t} = -2y = -2$ m/s² and $u\pd{v}{x} + v\pd{v}{y} = 0 + (-2yt)(-2t) = 4yt^2 = 4$ m/s², so $a_y = -2 + 4 = 2$ m/s².

**(b)** Cauchy with $g_x = g_y = 0$: the stress-derivative sums must equal $\rho a$.
$f_{s,x} = \rho a_x = 1000 \times 6 = 6000$ N/m³ and $f_{s,y} = \rho a_y = 1000 \times 2 = 2000$ N/m³.

Notice that in $y$ the local and convective parts partly cancel — they are separate physical effects that simply add.`,
    check: [
      { label: md`$a_x$`, value: 6, units: md`\mathrm{m/s^2}` },
      { label: md`$f_{s,x}$`, value: 6000, units: md`\mathrm{N/m^3}` },
      { label: md`$f_{s,y}$`, value: 2000, units: md`\mathrm{N/m^3}` },
    ],
  },
  {
    id: 'cauchy-p2',
    concept: 'cauchy',
    difficulty: 3,
    q: md`Water flows steadily between two horizontal parallel plates. The flow is fully developed: $u = u(y)$ only, and $v = w = 0$. Take $\sigma_{xx} = -p$ with a uniform pressure gradient $\pd{p}{x} = -1200$ Pa/m, nothing varies with $z$, and $\tau_{yx} = 0$ on the centre-plane $y = 0$. Use the $x$-Cauchy equation to find $\tau_{yx}$ at $y = +5$ mm and at $y = -5$ mm.`,
    hint: md`First show that every acceleration term on the right of the $x$-Cauchy equation is zero. Then only $\pd{\sigma_{xx}}{x}$ and $\pd{\tau_{yx}}{y}$ survive on the left.`,
    answer: md`$\tau_{yx} = \pd{p}{x}\,y$: $-6.0$ Pa at $y = +5$ mm and $+6.0$ Pa at $y = -5$ mm.`,
    solution: md`**Acceleration:** steady, so $\pd{u}{t} = 0$; $u\pd{u}{x} = 0$ because $u$ does not change with $x$; $v\pd{u}{y} = w\pd{u}{z} = 0$ because $v = w = 0$. So $a_x = 0$ — the fluid moves but does not accelerate.

**Cauchy, x:** $\rho g_x + \pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z} = 0$, with $g_x = 0$ (horizontal), $\pd{\tau_{zx}}{z} = 0$ and $\pd{\sigma_{xx}}{x} = -\pd{p}{x}$:

$$
\frac{d\tau_{yx}}{dy} = \pd{p}{x} = -1200\ \mathrm{Pa/m}
$$

**Integrate** with $\tau_{yx}(0) = 0$: $\tau_{yx} = \pd{p}{x}\,y$. At $y = 0.005$ m, $\tau_{yx} = (-1200)(0.005) = -6.0$ Pa; at $y = -0.005$ m, $+6.0$ Pa.

**Meaning:** the pressure drop pushes the fluid forward and the shear stresses on the top and bottom faces pull back with exactly the same force, so nothing accelerates. Motion with zero acceleration still needs a force balance — Cauchy supplies it.`,
    check: [{ label: md`$\tau_{yx}$ at $y = +5$ mm`, value: -6, units: md`\mathrm{Pa}` }],
  },
  {
    id: 'cauchy-p3',
    concept: 'cauchy',
    difficulty: 1,
    q: md`Simplify the $x$-Cauchy equation for each case and say what it means physically: (a) any continuum at rest; (b) a uniform stream moving at constant velocity $\vb{V} = U\hat{\mathbf{i}}$; (c) a uniform stream whose speed changes in time, $u = U(t)$, $v = w = 0$.`,
    hint: md`Decide which right-hand-side terms survive: the local part needs variation in time, the convective part needs variation in space.`,
    answer: md`(a) and (b): $\rho g_x + \pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z} = 0$ (forces balance); (c) the same left-hand side $= \rho\,\dfrac{dU}{dt}$.`,
    solution: md`**(a) At rest:** $u = v = w = 0$ everywhere and always, so the whole right-hand side vanishes: $\rho g_x + \pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z} = 0$. The stress gradients balance the weight — hydrostatics for a fluid, the stresses in a loaded structure for a solid.

**(b) Uniform, steady stream:** $\pd{u}{t} = 0$ and every spatial derivative of $u$ vanishes, so the right-hand side is again $0$. Moving at constant velocity needs **no** net force (Newton's first law): the equation is the same as at rest.

**(c) Uniform but unsteady:** the spatial derivatives still vanish (no convective part) but $\pd{u}{t} = dU/dt$, so $\rho g_x + \pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z} = \rho\,\frac{dU}{dt}$: the stresses must supply the force that changes the speed of every particle equally.`,
  },
  {
    id: 'euler-p1',
    concept: 'euler',
    difficulty: 2,
    q: md`Air ($\rho = 1.2$ kg/m³) flows steadily towards a wall in a horizontal plane with $u = ax$, $v = -ay$ and $a = 3\ \mathrm{s^{-1}}$. Treat it as inviscid. Find (a) $\pd{p}{x}$ and $\pd{p}{y}$ at $(2\ \mathrm{m}, 1\ \mathrm{m})$; (b) $p(x, y)$ and the pressure difference $p(0, 0) - p(2, 1)$.`,
    hint: md`Find $a_x = u\pd{u}{x} + v\pd{u}{y}$ and $a_y$ first. Euler in a horizontal plane gives $\pd{p}{x} = -\rho a_x$ and $\pd{p}{y} = -\rho a_y$.`,
    answer: md`(a) $\pd{p}{x} = -21.6$ Pa/m, $\pd{p}{y} = -10.8$ Pa/m; (b) $p = p_0 - \tfrac12\rho a^2(x^2 + y^2)$, so $p(0,0) - p(2,1) = 27.0$ Pa.`,
    solution: md`**Accelerations:** $a_x = (ax)(a) + (-ay)(0) = a^2x$ and $a_y = (ax)(0) + (-ay)(-a) = a^2y$.

**(a)** $\pd{p}{x} = -\rho a^2 x = -(1.2)(9)(2) = -21.6$ Pa/m; $\pd{p}{y} = -\rho a^2 y = -(1.2)(9)(1) = -10.8$ Pa/m.

**(b)** Integrating $\pd{p}{x} = -\rho a^2 x$ gives $p = -\tfrac12\rho a^2 x^2 + f(y)$. Then $\pd{p}{y} = f'(y) = -\rho a^2 y$, so $f = -\tfrac12\rho a^2 y^2 + p_0$ and

$$
p = p_0 - \tfrac12\rho a^2\,(x^2 + y^2)
$$

The pressure is highest at the stagnation point (the origin). $p(0,0) - p(2,1) = \tfrac12(1.2)(9)(4 + 1) = 27.0$ Pa.`,
    check: [
      { label: md`$\pd{p}{x}$ at (2, 1)`, value: -21.6, units: md`\mathrm{Pa/m}` },
      { label: md`$p(0,0) - p(2,1)$`, value: 27, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'euler-p2',
    concept: 'euler',
    difficulty: 1,
    q: md`An open tank of water stands in a lift that accelerates **upward** at $3.0$ m/s². Using Euler's $z$-equation ($z$ up), find the gauge pressure at a depth of $0.80$ m and compare it with the value when the lift is at rest.`,
    hint: md`The water moves as a rigid body: $a_z = +3.0$ m/s² and there is no shear. Use $\rho g_z - \pd{p}{z} = \rho a_z$ with $g_z = -9.81$ m/s².`,
    answer: md`$\pd{p}{z} = -\rho(g + a_z)$, so $p - p_a = \rho(g + a_z)h = 10.2$ kPa (vs. $7.85$ kPa at rest — about 31 % higher).`,
    solution: md`**Euler, z:** $\rho g_z - \pd{p}{z} = \rho a_z \Rightarrow \pd{p}{z} = \rho(g_z - a_z) = -\rho(g + a_z) = -1000(9.81 + 3.0) = -12\,810$ Pa/m.

Horizontally $a_x = a_y = 0$ and $g_x = g_y = 0$, so $p$ depends on $z$ only.

**Integrate** from the free surface ($p = p_a$) down a depth $h$: $p - p_a = \rho(g + a_z)\,h = 1000 \times 12.81 \times 0.80 = 10\,248$ Pa $\approx 10.2$ kPa.

At rest: $\rho g h = 1000 \times 9.81 \times 0.80 = 7848$ Pa $\approx 7.85$ kPa. The upward acceleration acts like extra gravity: $12.81/9.81 = 1.31$.`,
    check: [{ label: 'gauge pressure at 0.80 m', value: 10248, units: md`\mathrm{Pa}` }],
  },
  {
    id: 'euler-p3',
    concept: 'euler',
    difficulty: 2,
    q: md`Water ($\rho = 1000$ kg/m³) slows down along the horizontal centreline of a diffuser: $u = U_0/(1 + x/L)$ with $U_0 = 3$ m/s and $L = 0.6$ m. Treat the flow as steady and inviscid. (a) Find $\pd{p}{x}$ at the inlet ($x = 0$) and at the exit ($x = L$). (b) Find the pressure rise $p(L) - p(0)$.`,
    hint: md`$\pd{u}{x} = -\dfrac{U_0}{L(1 + x/L)^2}$, so $a_x = u\pd{u}{x} = -\dfrac{U_0^2}{L(1 + x/L)^3}$.`,
    answer: md`(a) $+15\,000$ Pa/m at the inlet and $+1875$ Pa/m at the exit (an adverse gradient); (b) $p(L) - p(0) = \tfrac38\rho U_0^2 = 3375$ Pa.`,
    solution: md`**Acceleration:** $a_x = u\pd{u}{x} = \frac{U_0}{1 + x/L}\Big(-\frac{U_0}{L(1 + x/L)^2}\Big) = -\frac{U_0^2}{L(1 + x/L)^3}$ — negative: the fluid decelerates.

**(a)** Euler ($g_x = 0$, steady, $v = w = 0$ on the centreline): $\pd{p}{x} = -\rho a_x = \frac{\rho U_0^2}{L(1 + x/L)^3}$. Inlet: $\frac{1000 \times 9}{0.6} = 15\,000$ Pa/m. Exit: $\frac{15\,000}{2^3} = 1875$ Pa/m. Both positive — the pressure **rises** in the flow direction (an adverse pressure gradient).

**(b)** With $s = x/L$:

$$
p(L) - p(0) = \int_0^L \frac{\rho U_0^2}{L(1 + x/L)^3}\,dx = \rho U_0^2\int_0^1 \frac{ds}{(1 + s)^3} = \rho U_0^2\Big(\tfrac12 - \tfrac18\Big) = \tfrac38(1000)(9) = 3375\ \mathrm{Pa}
$$

Check: $\tfrac12\rho\,(u_0^2 - u_L^2) = \tfrac12(1000)(9 - 2.25) = 3375$ Pa ✓.`,
    check: [
      { label: md`$\pd{p}{x}$ at the inlet`, value: 15000, units: md`\mathrm{Pa/m}` },
      { label: md`$p(L) - p(0)$`, value: 3375, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'euler-p4',
    concept: 'euler',
    difficulty: 2,
    q: md`An open rectangular tank, 2.0 m long and partly filled with water, accelerates horizontally at $a_x = 2.5$ m/s². Use Euler's equations to find the slope of the free surface and the difference in surface height between the rear and the front walls.`,
    hint: md`Rigid-body motion: $\pd{p}{x} = -\rho a_x$ and $\pd{p}{z} = -\rho g$. Along the free surface $dp = \pd{p}{x}dx + \pd{p}{z}dz = 0$.`,
    answer: md`$dz_s/dx = -a_x/g = -0.255$ (the surface tilts down towards the front at $14.3°$); height difference $0.51$ m, higher at the rear.`,
    solution: md`**Euler** (no shear in rigid-body motion; $x$ forward, $z$ up). $x$: $-\pd{p}{x} = \rho a_x \Rightarrow \pd{p}{x} = -\rho a_x$. $z$: $\rho g_z - \pd{p}{z} = 0 \Rightarrow \pd{p}{z} = -\rho g$.

**Free surface** ($p = p_a$): $dp = -\rho a_x\,dx - \rho g\,dz = 0$, so $\frac{dz_s}{dx} = -\frac{a_x}{g} = -\frac{2.5}{9.81} = -0.255$.

Angle: $\arctan(0.255) = 14.3°$. Over the 2.0 m length the surface falls by $2.0 \times 0.255 = 0.51$ m from the rear wall to the front wall. The isobars are perpendicular to $\vb{g} - \vb{a}$, which here points backwards and down.`,
    check: [
      { label: md`slope magnitude $\vert dz_s/dx\vert$`, value: 0.2548 },
      { label: 'height difference', value: 0.5097, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'euler-p5',
    concept: 'euler',
    difficulty: 3,
    q: md`Someone proposes the steady plane velocity field $u = xy$, $v = -\tfrac12 y^2$ (SI units) for an inviscid, incompressible fluid in a horizontal plane. (a) Check that it satisfies continuity. (b) Find the pressure gradient that Euler's equations would require. (c) Show that no pressure field $p(x, y)$ can produce it, so it cannot be an inviscid flow.`,
    hint: md`A pressure field exists only if $\frac{\partial}{\partial y}\Big(\pd{p}{x}\Big) = \frac{\partial}{\partial x}\Big(\pd{p}{y}\Big)$.`,
    answer: md`(a) $\pd{u}{x} + \pd{v}{y} = y - y = 0$ ✓; (b) $\pd{p}{x} = -\tfrac12\rho xy^2$, $\pd{p}{y} = -\tfrac12\rho y^3$; (c) the mixed derivatives are $-\rho xy$ and $0$ — unequal, so no $p(x, y)$ exists.`,
    solution: md`**(a)** $\pd{u}{x} = y$ and $\pd{v}{y} = -y$; their sum is $0$, so mass is conserved.

**(b)** $a_x = u\pd{u}{x} + v\pd{u}{y} = (xy)(y) + \big(-\tfrac12y^2\big)(x) = \tfrac12xy^2$ and $a_y = u\pd{v}{x} + v\pd{v}{y} = 0 + \big(-\tfrac12y^2\big)(-y) = \tfrac12y^3$. Euler (horizontal, $g_x = g_y = 0$): $\pd{p}{x} = -\rho a_x = -\tfrac12\rho xy^2$ and $\pd{p}{y} = -\rho a_y = -\tfrac12\rho y^3$.

**(c)** $\frac{\partial}{\partial y}\Big(\pd{p}{x}\Big) = -\rho xy$, but $\frac{\partial}{\partial x}\Big(\pd{p}{y}\Big) = 0$. For a smooth scalar $p$ the two must be equal (mixed partial derivatives commute), so no $p(x, y)$ has the required gradient. At $(1, 2)$, for instance: $-2\rho$ versus $0$.

**Conclusion:** the field conserves mass, but pressure and gravity alone cannot drive it — it would need viscous (shear) stresses, so it is not a solution of Euler's equations. Putting the plane vertical only adds a constant $\rho g_y$ to $\pd{p}{y}$ and does not change the conclusion.`,
  },
]

/* ----------------------------------------------------------------------------------------------- quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-forces-notation',
    concept: 'forces',
    difficulty: 1,
    src: S3,
    q: md`On the slide-3 element the stress $\tau_{yx}$ labels the forces on the top and bottom faces. What does the symbol mean?`,
    options: [
      md`a shear stress on a plane whose normal is the $y$-direction, acting in the $x$-direction`,
      md`a shear stress on a plane whose normal is the $x$-direction, acting in the $y$-direction`,
      md`a normal stress acting in the $y$-direction on the faces perpendicular to $x$`,
      md`the rate at which the $x$-stress changes with $y$`,
    ],
    answer: 0,
    explain: md`First subscript = normal of the plane ($y$ → top and bottom faces), second = direction of the stress ($x$). The swapped reading describes $\tau_{xy}$, which acts on the $x$-faces in $y$. The rate of change is a different quantity, $\partial\tau_{yx}/\partial y$.`,
  },
  {
    id: 'q-forces-uniform',
    concept: 'forces',
    difficulty: 2,
    q: md`Suppose $\sigma_{xx}$ has the same value everywhere (no gradient). What is the net $x$-force from the two faces perpendicular to $x$?`,
    options: [
      'zero — the force on one face is cancelled by the force on the opposite face',
      md`$2\sigma_{xx}\,\delta y\,\delta z$, because both faces carry the stress`,
      md`$\sigma_{xx}\,\delta y\,\delta z$, from the right face only`,
      md`it depends on whether $\sigma_{xx}$ is tensile or compressive`,
    ],
    answer: 0,
    explain: md`The two face forces have equal magnitude $\sigma_{xx}\,\delta y\,\delta z$ but act in opposite directions ($+x$ on the positive face, $-x$ on the negative face), so they cancel whatever the sign of $\sigma_{xx}$. "$2\sigma_{xx}\,\delta y\,\delta z$" forgets that the direction reverses on the negative face. Only a **gradient** gives a net force.`,
  },
  {
    id: 'q-forces-scaling',
    concept: 'forces',
    difficulty: 2,
    q: md`Halve all three edges of the element. By what factor does the **net** $x$ surface force change (same stress field)?`,
    options: [
      md`it becomes $1/8$ as large — it scales with the volume $\delta x\,\delta y\,\delta z$`,
      md`it becomes $1/4$ as large, because surface forces scale with area`,
      md`it becomes $1/2$ as large, because the Taylor correction scales with $\delta x$`,
      'it stays the same, because the stresses do not depend on the element size',
    ],
    answer: 0,
    explain: md`Each face force scales with area (1/4), but the **net** force is the difference between opposite faces, gradient × $\delta x$ × area, i.e. gradient × volume (1/8). That is why dividing by $\delta x\,\delta y\,\delta z$ gives a finite force per unit volume.`,
  },
  {
    id: 'q-forces-body',
    concept: 'forces',
    difficulty: 1,
    src: S3,
    q: 'Which of these is a **body** force on the fluid element in the slide-3 analysis?',
    options: [
      md`the weight $\delta m\,\vb{g}$ of the element`,
      'the pressure exerted on its faces by the neighbouring fluid',
      'the viscous shear stress on its top face',
      md`the normal stress $\sigma_{xx}$ on its right face`,
    ],
    answer: 0,
    explain: md`Body forces act on the mass throughout the volume: $\delta F_{bx} = \delta m\,g_x$ etc. Pressure, shear and normal stresses act through the faces — they are **surface** forces, however large they are.`,
  },
  {
    id: 'q-cauchy-continuum',
    concept: 'cauchy',
    difficulty: 1,
    src: S4,
    q: 'According to Lecture 10, the Cauchy equations of motion apply to…',
    options: [
      'any continuum — solid or fluid — in motion or at rest',
      'Newtonian fluids only',
      'inviscid fluids only',
      'incompressible flows only',
    ],
    answer: 0,
    explain: md`No stress–strain (constitutive) law is used in deriving them, so they hold for steel, water or air, moving or not (slide 4). Assuming a Newtonian fluid would lead on to the Navier–Stokes equations; assuming zero shear gives Euler's equations — both are special cases, not restrictions of Cauchy.`,
  },
  {
    id: 'q-cauchy-steady',
    concept: 'cauchy',
    difficulty: 2,
    q: md`A flow is steady ($\partial/\partial t = 0$ everywhere). What can you say about the right-hand side $\rho\,D\vb{V}/Dt$ of the Cauchy equations?`,
    options: [
      md`it can still be non-zero, because the convective terms $u\,\partial u/\partial x + \dots$ remain wherever the velocity varies in space`,
      'it is zero, because steady flow means no acceleration',
      'it is zero only if the flow is also incompressible',
      md`it reduces to $\rho\,\partial\vb{V}/\partial t$`,
    ],
    answer: 0,
    explain: md`Steady means the velocity at a **fixed point** does not change; a particle can still move to a place where the velocity is different (a nozzle, a bend). That convective acceleration survives. The tempting "steady ⇒ no acceleration" confuses the grid point with the particle.`,
  },
  {
    id: 'q-cauchy-closure',
    concept: 'cauchy',
    difficulty: 2,
    q: 'Why cannot the three Cauchy equations be solved for the flow as they stand?',
    options: [
      'they contain more unknowns (the stress components) than equations, so a constitutive law linking stress to motion is needed',
      'they are valid only for a continuum at rest',
      'they do not contain the gravitational body force',
      'they apply only to solids',
    ],
    answer: 0,
    explain: md`Besides $\rho$ and $u, v, w$ the stresses are unknown, but there are only three momentum equations (plus continuity). A constitutive relation closes the system — e.g. zero shear gives Euler. The other options contradict slide 4, which includes $\rho\vb{g}$ and says the equations hold for any continuum, moving or at rest.`,
  },
  {
    id: 'q-cauchy-pattern',
    concept: 'cauchy',
    difficulty: 2,
    src: S4,
    q: md`Which stress derivative appears in the **$y$**-component Cauchy equation?`,
    options: [md`$\partial\tau_{zy}/\partial z$`, md`$\partial\tau_{yz}/\partial z$`, md`$\partial\tau_{yx}/\partial y$`, md`$\partial\sigma_{yy}/\partial x$`],
    answer: 0,
    explain: md`The $y$-equation uses the stresses that act **in** $y$ (second subscript $y$): $\tau_{xy}$, $\sigma_{yy}$, $\tau_{zy}$, each differentiated with respect to its first subscript. $\tau_{yz}$ acts in $z$ (it belongs to the $z$-equation) and $\partial\tau_{yx}/\partial y$ belongs to the $x$-equation.`,
  },
  {
    id: 'q-euler-sign',
    concept: 'euler',
    difficulty: 1,
    src: S5,
    q: md`Why is pressure defined with a minus sign, $-p = \sigma_{xx} = \sigma_{yy} = \sigma_{zz}$?`,
    options: [
      'so that a compressive normal stress — the usual state in a fluid — gives a positive pressure',
      'because pressure acts along the outward normal of a surface',
      'because fluids normally carry tensile normal stresses',
      "to make Euler's equation dimensionally consistent",
    ],
    answer: 0,
    explain: md`Normal stresses are positive in tension; a fluid is normally squeezed, so $\sigma < 0$ and $p = -\sigma > 0$ (slide 5). Pressure pushes **against** the outward normal, and the sign has nothing to do with units.`,
  },
  {
    id: 'q-euler-pascal',
    concept: 'euler',
    difficulty: 1,
    src: S5,
    q: "Pascal's law — the pressure at a point is independent of direction — holds…",
    options: [
      'in a fluid at rest or in motion, as long as there are no shearing stresses',
      'only in a fluid at rest',
      'only in incompressible fluids',
      'in any fluid, whatever stresses act in it',
    ],
    answer: 0,
    explain: md`Slide 5: at rest **or in motion**, provided no shearing stresses are present. With shear, the normal stress on a plane depends on the plane's orientation (try the cutting-plane demo), so "the pressure" is no longer direction-independent. Compressibility is irrelevant.`,
  },
  {
    id: 'q-euler-nozzle',
    concept: 'euler',
    difficulty: 2,
    q: md`Water accelerates steadily in $+x$ along the centreline of a horizontal nozzle. Treating the flow as inviscid, the pressure gradient $\partial p/\partial x$ there is…`,
    options: [
      'negative — the pressure falls in the flow direction',
      'positive — the pressure must rise to push the fluid',
      'zero, because the flow is steady',
      'impossible to determine without the viscosity',
    ],
    answer: 0,
    explain: md`Euler: $-\partial p/\partial x = \rho a_x > 0$, so $\partial p/\partial x < 0$. The net pressure force $-\nabla p$ points from high to low pressure, i.e. forward. "Steady ⇒ zero" ignores the convective acceleration, and an inviscid model needs no viscosity.`,
  },
  {
    id: 'q-euler-rigid',
    concept: 'euler',
    difficulty: 3,
    q: "A viscous liquid rotates as a rigid body in a spinning container. Can Euler's equations be used to find its pressure field?",
    options: [
      'yes, exactly — with no relative motion between particles there is no shear stress',
      "no — Euler's equations require a fluid with zero viscosity",
      "no — Euler's equations require irrotational flow, and rigid rotation is rotational",
      'only if the container is not accelerating',
    ],
    answer: 0,
    explain: md`Euler needs **zero shear stress**, not zero viscosity: in rigid-body motion nothing deforms, so viscous stresses vanish. Irrotationality is not required by Euler (it matters only for applying Bernoulli between any two points), and a rotating container is accelerating — the centripetal acceleration is exactly what produces $\partial p/\partial r = \rho\Omega^2 r$.`,
  },
]

/* ----------------------------------------------------------------------------------------------- flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-body-surface',
    front: 'Body force vs surface force on a fluid element?',
    back: md`**Body force** acts on the mass inside the volume: $\delta F_{bx} = \delta m\,g_x$ (∝ volume). **Surface force** = stress × face area, exerted by the surrounding material through the faces (∝ area).`,
    src: S3,
  },
  {
    id: 'fc-subscripts',
    front: md`What do the subscripts in $\tau_{ij}$ mean?`,
    back: md`$i$ = direction of the **normal** to the plane it acts on; $j$ = **direction** in which it acts. $\tau_{yx}$ acts on the $y$-faces (top/bottom) and points in $x$.`,
  },
  {
    id: 'fc-face-force',
    front: md`$x$-force on the right ($+x$) face of the slide-3 element?`,
    back: md`$\Big(\sigma_{xx} + \pd{\sigma_{xx}}{x}\dfrac{\delta x}{2}\Big)\delta y\,\delta z$, drawn in $+x$ for a positive (tensile) stress.`,
    src: S3,
  },
  {
    id: 'fc-net-x',
    front: md`Net $x$ surface force on the element?`,
    back: md`$\Big(\pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z}\Big)\delta x\,\delta y\,\delta z$ — the centre values cancel in pairs, only gradients survive.`,
  },
  {
    id: 'fc-cauchy-x',
    front: md`Write the $x$-component Cauchy equation.`,
    back: md`$\rho g_x + \pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z} = \rho\Big(\pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}\Big)$`,
    src: S4,
  },
  {
    id: 'fc-cauchy-valid',
    front: 'Where do the Cauchy equations apply?',
    back: 'Any continuum — solid or fluid — in motion or at rest (slide 4). No stress–strain law has been assumed, which is also why they are not yet solvable on their own.',
    src: S4,
  },
  {
    id: 'fc-cauchy-memory',
    front: md`Memory rule for the stress terms in the $j$-th Cauchy equation?`,
    back: md`Take the three stresses that act **in** direction $j$ (second subscript $j$) and differentiate each with respect to its **first** subscript.`,
  },
  {
    id: 'fc-pascal',
    front: "State Pascal's law.",
    back: 'The pressure at a point in a fluid, at rest or in motion, is independent of direction as long as there are no shearing stresses (slide 5).',
    src: S5,
  },
  {
    id: 'fc-minus',
    front: md`Why the minus sign in $-p = \sigma_{xx} = \sigma_{yy} = \sigma_{zz}$?`,
    back: 'Normal stress is positive in tension; a fluid is normally compressed, so the minus sign makes that compressive stress a positive pressure.',
    src: S5,
  },
  {
    id: 'fc-euler-vector',
    front: "Euler's equation in vector form?",
    back: md`$\rho\vb{g} - \nabla p = \rho\Big[\pd{\vb{V}}{t} + (\vb{V}\cdot\nabla)\vb{V}\Big]$`,
    src: S5,
  },
  {
    id: 'fc-euler-assumptions',
    front: "What does Euler's equation assume — and what does it NOT assume?",
    back: 'It assumes zero shear stress (inviscid flow, or rigid-body motion). It does not assume steady, incompressible or irrotational flow.',
  },
  {
    id: 'fc-rigid',
    front: 'Pressure gradient in a fluid moving as a rigid body?',
    back: md`$\nabla p = \rho(\vb{g} - \vb{a})$ — exact even for a viscous fluid. Rotation: $\pd{p}{r} = \rho\Omega^2 r$; upward acceleration: $\pd{p}{z} = -\rho(g + a_z)$.`,
  },
]

/* ----------------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`The differential momentum balance is **Newton's second law for a fluid particle**: body force (gravity, ∝ volume) + surface force (stress × face area) = mass × acceleration.`,
  md`Stress notation: $\tau_{ij}$ acts on the plane normal to $i$ in direction $j$; positive stresses act in $+$ directions on positive faces and in $-$ directions on negative faces — tension is positive.`,
  md`Face stress = centre value ± (gradient × half-width). Opposite faces cancel except for the gradient, so the net $x$ surface force per unit volume is $\pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z}$.`,
  md`**Cauchy equations:** $\rho g_j$ + (stress derivatives) $= \rho\,DV_j/Dt$ — valid for **any continuum, solid or fluid, moving or at rest**, because no constitutive law has been assumed.`,
  md`The right-hand side is the particle acceleration, local + convective: **steady does not mean unaccelerated**.`,
  md`Cauchy is not closed (the stresses are unknown): add a constitutive law — zero shear gives Euler; a Newtonian fluid gives Navier–Stokes.`,
  md`**Inviscid = no shear.** Then (Pascal's law) the normal stress is the same in every direction and $-p = \sigma_{xx} = \sigma_{yy} = \sigma_{zz}$; the minus sign makes compression a positive pressure.`,
  md`**Euler:** $\rho\vb{g} - \nabla p = \rho\big[\pd{\vb{V}}{t} + (\vb{V}\cdot\nabla)\vb{V}\big]$ — for steady or unsteady, compressible or incompressible, rotational or irrotational flow, as long as shear is absent.`,
  md`Exam recipe: $\vb{V} \to \vb{a} \to \nabla p = \rho(\vb{g} - \vb{a}) \to$ integrate $\to \Delta p$. Pressure falls where fluid speeds up; rigid-body motion obeys $\nabla p = \rho(\vb{g} - \vb{a})$ exactly.`,
  md`The inviscid model is good at high Reynolds number away from walls; thin boundary layers remain viscous and the no-slip condition is lost (Fox & McDonald p. 247).`,
]

/* ----------------------------------------------------------------------------------------------- content */

export default function Content() {
  return (
    <>
      {/* ======================================================================= Concept 1 */}
      <Concept id="forces">
        <Step kind="intro" src={S3}>
          <Md>{md`
            Lecture 9 described *how* a fluid element moves and deforms (kinematics). Slide 3 of Lecture 10 starts asking *why*: which forces act on a small fluid element, and how do they set its acceleration? The answer will be the **differential form of Newton's second law**, valid at every point of a flow.

            Take a small rectangular element with edges $\delta x$, $\delta y$, $\delta z$ and mass $\delta m$. Two kinds of force act on it:

            - **Body forces** act on the mass of the element itself. Here the body force is gravity, written component by component as $\delta F_{bx} = \delta m\,g_x$, $\delta F_{by} = \delta m\,g_y$, $\delta F_{bz} = \delta m\,g_z$, where $g_x$, $g_y$, $g_z$ are the components of the gravitational acceleration $\vb{g}$.
            - **Surface forces** act on the six faces of the element, exerted by the surrounding material. Each is a **stress** (force per unit area) times the **area** of the face.

            The slide draws the surface forces in the **$x$-direction** only. Three stresses act in $x$: the normal stress $\sigma_{xx}$ on the two faces perpendicular to $x$, the shear stress $\tau_{yx}$ on the two faces perpendicular to $y$, and the shear stress $\tau_{zx}$ on the two faces perpendicular to $z$. Their values are given at the **centre** of the element. A face lies $\delta x/2$ (or $\delta y/2$, $\delta z/2$) from the centre, so the stress there is the centre value **plus or minus a first-order Taylor correction** — on the right face $\sigma_{xx} + \pd{\sigma_{xx}}{x}\frac{\delta x}{2}$, on the left face $\sigma_{xx} - \pd{\sigma_{xx}}{x}\frac{\delta x}{2}$ — and the force is that stress times the face area ($\delta y\,\delta z$ for the $x$-faces).
          `}</Md>
          <Supplement title="Reading the stress symbols">
            <Md>{md`
              - $\sigma$ is a **normal** stress (perpendicular to the face); $\tau$ is a **shear** stress (tangential to the face).
              - **First subscript** = direction of the **normal** to the plane on which the stress acts; **second subscript** = **direction** in which the stress acts. So $\tau_{yx}$ acts on a plane whose normal points along $y$ (the top and bottom faces) and pushes along $x$.
              - **Sign convention:** a stress is positive when it acts in the positive coordinate direction on a face whose outward normal points in a positive direction ($+x$, $+y$, $+z$ faces), and in the negative direction on the opposite faces — exactly how the arrows on slide 3 are drawn. A positive normal stress therefore *pulls* on both of its faces: **tension is positive**.
              - **Face areas:** normal to $x$ → $\delta y\,\delta z$; normal to $y$ → $\delta x\,\delta z$; normal to $z$ → $\delta x\,\delta y$.
              - **Mass:** $\delta m = \rho\,\delta x\,\delta y\,\delta z$.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Body force grows with volume, surface force with area.** Gravity pulls on every bit of mass inside the element, so $\delta F_b \propto \delta x\,\delta y\,\delta z$. The surroundings can touch the element only through its faces, so each face force grows like an area.

            **Only differences across the element matter.** Squeeze a sugar cube between two fingers with exactly equal force and it does not move; a net push appears only if one finger presses harder. In the same way the centre value $\sigma_{xx}$ appears on both $x$-faces, in opposite directions, and cancels. What survives is the *difference* between the two faces, $\pd{\sigma_{xx}}{x}\,\delta x$, acting on the area $\delta y\,\delta z$.

            **So the net surface force scales with volume too.** $\pd{\sigma_{xx}}{x}\,\delta x \times \delta y\,\delta z$ is proportional to $\delta x\,\delta y\,\delta z$ — just like gravity. Divide by the volume and you get a finite **force per unit volume** that survives as the element shrinks to a point. This is the step that turns a force balance on a box into a differential equation valid at every point.
          `}</Md>
          <Callout kind="tip" title="Three pairs of faces">
            <Md>{md`For the $x$-force: the $x$-faces contribute through $\sigma_{xx}$ (a normal push or pull), the $y$-faces through $\tau_{yx}$ (a sliding drag on top and bottom), the $z$-faces through $\tau_{zx}$ (a sliding drag on front and back). Each pair contributes "gradient × volume".`}</Md>
          </Callout>
          <Callout kind="warning">
            <Md>{md`A shear stress on the top face drags the element **along** the face (in $x$); it does not push into it. The stress pushing into the top face is the normal stress $\sigma_{yy}$, which acts in $y$ and belongs to the $y$-balance.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={S3}>
          <Figure
            caption="The differential element of slide 3 with its six x-direction surface forces (tags 1–6, see the table). Solid arrows act on visible faces, dashed arrows on hidden faces; the body-force components are printed at the upper left. y up, x right, z towards the viewer."
            src={S3}
          >
            <ElementForcesFigure />
          </Figure>
          <Md>{md`
            | # | Face | Position from centre | Area | $x$-force (label on the slide) | Arrow for a positive stress |
            |---|---|---|---|---|---|
            | 1 | right ($+x$) | $x + \delta x/2$ | $\delta y\,\delta z$ | $\big(\sigma_{xx} + \pd{\sigma_{xx}}{x}\frac{\delta x}{2}\big)\delta y\,\delta z$ | $+x$, solid |
            | 2 | left ($-x$) | $x - \delta x/2$ | $\delta y\,\delta z$ | $\big(\sigma_{xx} - \pd{\sigma_{xx}}{x}\frac{\delta x}{2}\big)\delta y\,\delta z$ | $-x$, dashed inside the box, solid outside |
            | 3 | top ($+y$) | $y + \delta y/2$ | $\delta x\,\delta z$ | $\big(\tau_{yx} + \pd{\tau_{yx}}{y}\frac{\delta y}{2}\big)\delta x\,\delta z$ | $+x$, solid |
            | 4 | bottom ($-y$) | $y - \delta y/2$ | $\delta x\,\delta z$ | $\big(\tau_{yx} - \pd{\tau_{yx}}{y}\frac{\delta y}{2}\big)\delta x\,\delta z$ | $-x$, dashed (hidden) |
            | 5 | front ($+z$) | $z + \delta z/2$ | $\delta x\,\delta y$ | $\big(\tau_{zx} + \pd{\tau_{zx}}{z}\frac{\delta z}{2}\big)\delta x\,\delta y$ | $+x$, solid |
            | 6 | back ($-z$) | $z - \delta z/2$ | $\delta x\,\delta y$ | $\big(\tau_{zx} - \pd{\tau_{zx}}{z}\frac{\delta z}{2}\big)\delta x\,\delta y$ | $-x$, dashed (hidden) |
          `}</Md>
          <Supplement title="Where the ± (gradient × half-width) terms come from">
            <TaylorFaceSim />
          </Supplement>
        </Step>

        <Step kind="equations" src={S3}>
          <FormulaCard id="body-force" />
          <FormulaCard id="face-forces-x" />
          <Supplement title="Adding opposite faces: the net surface force">
            <FormulaCard id="taylor-face" />
            <Derivation
              title="Pairing the faces"
              steps={[
                {
                  md: md`Right face: $\Big(\sigma_{xx}+\pd{\sigma_{xx}}{x}\frac{\delta x}{2}\Big)\delta y\,\delta z$ in $+x$; left face: $\Big(\sigma_{xx}-\pd{\sigma_{xx}}{x}\frac{\delta x}{2}\Big)\delta y\,\delta z$ in $-x$.`,
                  why: 'a positive stress points in +x on a positive face and in −x on a negative face',
                },
                {
                  md: md`$\Big[\Big(\sigma_{xx}+\pd{\sigma_{xx}}{x}\frac{\delta x}{2}\Big)-\Big(\sigma_{xx}-\pd{\sigma_{xx}}{x}\frac{\delta x}{2}\Big)\Big]\delta y\,\delta z = \pd{\sigma_{xx}}{x}\,\delta x\,\delta y\,\delta z$`,
                  why: 'the centre values cancel',
                },
                {
                  md: md`Top − bottom: $\pd{\tau_{yx}}{y}\,\delta x\,\delta y\,\delta z$; $\quad$ front − back: $\pd{\tau_{zx}}{z}\,\delta x\,\delta y\,\delta z$`,
                  why: 'same pattern for the shear pairs',
                },
                {
                  md: md`$\delta F_{sx} = \Big(\pd{\sigma_{xx}}{x}+\pd{\tau_{yx}}{y}+\pd{\tau_{zx}}{z}\Big)\delta x\,\delta y\,\delta z$`,
                  why: 'every pair gives gradient × volume',
                },
                {
                  md: md`The $y$- and $z$-directions work the same way with the stresses that act in $y$ ($\tau_{xy}, \sigma_{yy}, \tau_{zy}$) and in $z$ ($\tau_{xz}, \tau_{yz}, \sigma_{zz}$).`,
                  why: 'not drawn on the slide',
                },
              ]}
            />
            <FormulaCard id="net-surface-force" />
          </Supplement>
          <Callout kind="exam" title="Face-force checklist">
            <Md>{md`Given stresses at the centre and asked for a face force: (1) find the face's distance from the centre; (2) add or subtract gradient × half-width; (3) multiply by **that face's** area; (4) fix the direction from the face's sign and the sign of the bracket.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="forces-six-faces" />
          <ExampleCard id="forces-rest-balance" />
        </Step>

        <Step kind="interactive">
          <ElementForceSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="forces" />
          <QuickCheck ids={['q-forces-uniform', 'q-forces-scaling']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Two kinds of force: **body** forces act on the mass ($\delta F_{bx} = \delta m\,g_x$, …); **surface** forces act on the faces (stress × face area).`,
              md`$\tau_{ij}$: plane normal to $i$, acting in $j$. Positive stresses act in $+$ directions on positive faces and in $-$ directions on negative faces — tension is positive.`,
              md`Face stress = centre value ± gradient × half-width; each opposite-face pair leaves only **gradient × volume**.`,
              md`Net $x$ surface force per unit volume: $\pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z}$ — the gradients of the stresses that act in $x$.`,
              md`**Traps:** the wrong face area ($x$-faces have $\delta y\,\delta z$), and forgetting that a positive stress points in $-x$ on a negative face.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ======================================================================= Concept 2 */}
      <Concept id="cauchy">
        <Step kind="intro" src={[S4, L9S4]}>
          <Md>{md`
            Now apply **Newton's second law** to the element of slide 3: body force plus net surface force equals mass times acceleration, $\delta F_x = \delta m\,a_x$. Write the mass as $\rho\,\delta x\,\delta y\,\delta z$, use the acceleration of a fluid particle from Lecture 9 (slide 4), $a_x = Du/Dt = \pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}$, and divide everything by the volume $\delta x\,\delta y\,\delta z$. Doing this for all three directions gives the three **Cauchy equations** of motion printed on slide 4.

            Every term is now a force — or mass × acceleration — **per unit volume**. On the left: the body force $\rho g_x$ plus the net surface force (the three stress derivatives). On the right: density times the acceleration of the particle.
          `}</Md>
          <Callout kind="key" title="Slide 4: where they apply">
            <Md>{md`The Cauchy equations are **applicable to any continuum — solid or fluid — in motion or at rest**.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            Read the equation as **force per volume = density × acceleration**, term by term (every term in N/m³):

            - $\rho g_x$ — the weight of one cubic metre of material, resolved in $x$ (for water, 9810 N/m³ vertically).
            - $\pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z}$ — the net push and drag of the neighbours on that cubic metre.
            - $\rho\,\pd{u}{t}$ — the **local** acceleration: the velocity at a fixed point changes in time (a valve opening, a pump starting).
            - $\rho\big(u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}\big)$ — the **convective** acceleration: the particle moves to a place where the velocity is different (through a nozzle, round a bend), even if nothing changes in time.

            Newton's law applies to the **particle**, not to the fixed point it happens to be passing — that is why the right-hand side contains the material derivative $D/Dt$ and not just $\partial/\partial t$.
          `}</Md>
          <Callout kind="exam" title="Steady does not mean unaccelerated">
            <Md>{md`In steady flow $\partial/\partial t = 0$, but the convective terms remain wherever the velocity changes in space. Every particle in a steady nozzle flow accelerates; only a uniform, steady stream has zero acceleration.`}</Md>
          </Callout>
          <Supplement title="Why “any continuum” — and why the equations cannot be solved yet">
            <Md>{md`
              Nothing in the derivation said *how* the stresses depend on the motion — no viscosity, no elasticity, no material property except density. That is why the same three equations describe steel, water, honey or air, at rest or moving.

              The price of that generality: the equations are **not closed**. Besides $\rho$ and $u, v, w$ they contain the stress components — nine of them in the table below, six independent ones once the angular-momentum balance makes the stress tensor symmetric ($\tau_{xy} = \tau_{yx}$, …) — but there are only three momentum equations plus continuity. A **constitutive relation** linking stress to motion closes the system:

              - **inviscid fluid** — shear stresses zero, normal stresses $-p$ → **Euler's equations** (Concept 3);
              - **Newtonian fluid** — stresses proportional to rates of deformation → the Navier–Stokes equations (beyond these slides);
              - **elastic solid** — stresses proportional to strains → the equations of elasticity.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="visual">
          <CauchyTermMap />
          <StressTensorMap />
          <FlowChart
            rows={[
              [{ title: "Newton's second law on the element", md: md`$\delta m\,\vb{a} = \delta\vb{F}_b + \delta\vb{F}_s$`, tone: 'slate' }],
              [{ title: 'Cauchy equations (slide 4)', md: 'any continuum, moving or at rest — the stresses are still unknown', tone: 'indigo' }],
              [
                { title: 'Inviscid fluid', md: md`$\tau_{ij} = 0$, $\sigma_{ii} = -p$ → **Euler** (slide 5)`, tone: 'emerald' },
                { title: 'Newtonian fluid', md: 'stress ∝ rate of strain → Navier–Stokes (later courses)', tone: 'amber' },
                { title: 'Elastic solid', md: 'stress ∝ strain → elasticity', tone: 'violet' },
              ],
            ]}
            arrowLabels={[md`divide by $\delta x\,\delta y\,\delta z$ and let the element shrink`, 'add a constitutive law']}
          />
        </Step>

        <Step kind="equations" src={S4}>
          <Derivation
            title="From Newton's second law to Cauchy"
            steps={[
              { md: md`$\delta F_x = \delta m\,a_x$`, why: "Newton's second law for the element (a fixed mass moving with the flow)" },
              {
                md: md`$\delta F_x = \delta m\,g_x + \Big(\pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z}\Big)\delta x\,\delta y\,\delta z$`,
                why: 'body force + net surface force (Concept 1)',
              },
              {
                md: md`$\delta m = \rho\,\delta x\,\delta y\,\delta z, \qquad a_x = \pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}$`,
                why: 'mass; particle acceleration (Lecture 9, slide 4)',
              },
              {
                md: md`$\rho g_x + \pd{\sigma_{xx}}{x} + \pd{\tau_{yx}}{y} + \pd{\tau_{zx}}{z} = \rho\Big(\pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}\Big)$`,
                why: 'divide by δx δy δz; as the element shrinks the equation holds at a point',
              },
              {
                md: md`Repeat with the stresses that act in $y$ ($\tau_{xy}, \sigma_{yy}, \tau_{zy}$) and in $z$ ($\tau_{xz}, \tau_{yz}, \sigma_{zz}$).`,
                why: 'gives the other two equations on slide 4',
              },
            ]}
          />
          <FormulaCard id="newton-element" />
          <FormulaCard id="particle-acceleration" />
          <FormulaCard id="cauchy" />
          <FormulaCard id="cauchy-index" />
          <Callout kind="warning">
            <Md>{md`Don't swap $\tau_{yx}$ and $\tau_{xy}$. In the $x$-equation the shear terms are $\tau_{yx}$ (differentiated with respect to $y$) and $\tau_{zx}$ (with respect to $z$) — the stresses that act **in** $x$. The derivative variable always matches the **first** subscript.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="cauchy-stagnation" />
          <ExampleCard id="cauchy-solid-column" />
        </Step>

        <Step kind="interactive">
          <CauchyBalanceSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="cauchy" />
          <QuickCheck ids={['q-cauchy-steady']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Cauchy = Newton's second law **per unit volume**: $\rho g_x$ + stress derivatives $= \rho\,Du/Dt$ (and likewise in $y$, $z$).`,
              md`Valid for **any continuum, solid or fluid, in motion or at rest** — no stress–strain law is built in.`,
              md`The right-hand side is the particle acceleration: local $\pd{u}{t}$ + convective $u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}$.`,
              md`Memory rule: the $j$-equation uses the stresses acting **in** $j$, each differentiated with respect to its **first** subscript.`,
              md`Not closed: the stresses are extra unknowns. Zero shear → Euler; Newtonian fluid → Navier–Stokes.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ======================================================================= Concept 3 */}
      <Concept id="euler">
        <Step kind="intro" src={[S5, FOX221, FOX247]}>
          <Md>{md`
            Slide 5 specialises the Cauchy equations to **inviscid flow** — flow with **no shearing stresses** (Fox & McDonald, p. 221, describe inviscid flows as those with zero shear stress).

            - **Pascal's law** (slide 5): the pressure at a point in a fluid, at rest or in motion, is independent of direction as long as there are no shearing stresses.
            - The three normal stresses at a point are therefore equal, and the **pressure** is defined as their negative: $-p = \sigma_{xx} = \sigma_{yy} = \sigma_{zz}$.
            - **The negative sign** is used so that a **compressive** normal stress — what we expect in a fluid — gives a **positive** value of $p$.
            - With $\tau_{ij} = 0$ and $\sigma_{xx} = \sigma_{yy} = \sigma_{zz} = -p$, the Cauchy equations become **Euler's equations of motion**, written in component form and in the vector form $\rho\vb{g} - \nabla p = \rho\big[\partial\vb{V}/\partial t + (\vb{V}\cdot\nabla)\vb{V}\big]$.

            **When is "inviscid" a good model?** Fox & McDonald (p. 247): at high Reynolds number the viscous terms can be neglected *in most of the flow*, which leaves a form of Euler's equations; but a thin **boundary layer** near walls still feels viscosity, and dropping the viscous terms loses the **no-slip** condition there.
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Pressure is a squeeze.** A fluid that carries no shear can only push *perpendicular* to any surface — and, by Pascal's law, it pushes equally hard whatever the orientation of the surface. A small balloon deep under water is squeezed uniformly from all sides, not stretched or twisted.

            **Pressure differences, not pressure, push the fluid.** Exactly as in Concept 1, a uniform pressure cancels on opposite faces. The net pressure force per unit volume is $-\nabla p$, pointing from high to low pressure. A particle accelerates towards lower pressure (a nozzle) and must climb a pressure hill when it slows down (a diffuser — an *adverse* pressure gradient).

            **Euler is F = ma with only two forces:** weight $\rho\vb{g}$ and the pressure push $-\nabla p$. You can read it either way: given the pressure, predict the motion; or — the usual exam task — given the motion, find the pressure gradient needed to produce it.
          `}</Md>
          <Compare
            items={[
              { title: 'Cauchy (slide 4)', md: md`$\rho\vb{g}$ + stress derivatives $= \rho\,D\vb{V}/Dt$. Any continuum; the stresses are unknown, so the system is not closed.`, tone: 'indigo' },
              { title: 'Euler (slide 5)', md: md`$\rho\vb{g} - \nabla p = \rho\,D\vb{V}/Dt$. Zero shear, one unknown stress $p$; steady or unsteady, compressible or not, rotational or not.`, tone: 'emerald' },
              { title: 'Bernoulli (next topics)', md: md`$p/\rho + V^2/2 + gz = $ const. Euler **integrated** along a streamline for steady, incompressible flow (Lecture 10, slides 9–11).`, tone: 'amber' },
            ]}
          />
          <Callout kind="warning" title="Euler is not Bernoulli">
            <Md>{md`Euler's equation holds at every point of any inviscid flow. Bernoulli's equation is a special integral of it that needs extra assumptions (steady, incompressible, along a streamline — or irrotational to link any two points). Don't use Bernoulli where only Euler is justified, e.g. in an unsteady flow.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={S5}>
          <Figure
            caption="Slide 5 sketch: with no shear the pressure pushes into every face, p = −σxx = −σyy = −σzz. Here z points up, y right and x towards the viewer — a different orientation from slide 3."
            src={S5}
          >
            <PressureCubeFigure />
          </Figure>
          <Supplement title="Pascal's law, tested: rotate a plane through a point">
            <PascalPlaneDemo />
            <FormulaCard id="plane-stress" />
            <Md>{md`
              **Why zero shear forces the normal stresses to be equal (the classical wedge argument).** Cut a tiny triangular wedge out of the fluid, with one face inclined. With no shear, each face carries only a normal force: (normal stress) × (face area). Apply $\sum \vb{F} = m\vb{a}$ to the wedge: its weight and its mass × acceleration scale with the wedge's **volume**, the face forces with its **areas**. Shrink the wedge and the volume terms vanish faster, so the face forces alone must balance — and the geometry of the inclined face then forces the normal stresses on all faces to be equal, whatever the angle. That is Pascal's law, at rest or in motion, as long as there is no shear.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={S5}>
          <FormulaCard id="pressure-def" />
          <Derivation
            title="From Cauchy to Euler"
            steps={[
              { md: md`$\tau_{xy} = \tau_{yx} = \tau_{xz} = \tau_{zx} = \tau_{yz} = \tau_{zy} = 0$`, why: 'inviscid: no shearing stresses' },
              {
                md: md`$\sigma_{xx} = \sigma_{yy} = \sigma_{zz} = -p \;\Rightarrow\; \pd{\sigma_{xx}}{x} = -\pd{p}{x},\ \ \pd{\sigma_{yy}}{y} = -\pd{p}{y},\ \ \pd{\sigma_{zz}}{z} = -\pd{p}{z}$`,
                why: "Pascal's law (slide 5)",
              },
              {
                md: md`$\rho g_x - \pd{p}{x} = \rho\Big(\pd{u}{t} + u\pd{u}{x} + v\pd{u}{y} + w\pd{u}{z}\Big)$, and likewise for $y$ and $z$`,
                why: 'substitute into each Cauchy equation',
              },
              {
                md: md`With $\nabla p = \pd{p}{x}\hat{\mathbf{i}} + \pd{p}{y}\hat{\mathbf{j}} + \pd{p}{z}\hat{\mathbf{k}}$ and $\vb{V}\cdot\nabla = u\pd{}{x} + v\pd{}{y} + w\pd{}{z}$: $\ \rho\vb{g} - \nabla p = \rho\Big[\pd{\vb{V}}{t} + (\vb{V}\cdot\nabla)\vb{V}\Big]$`,
                why: 'collect the three components',
              },
            ]}
          />
          <FormulaCard id="euler-components" />
          <FormulaCard id="euler-vector" />
          <Supplement title="A special case worth knowing: rigid-body motion">
            <Md>{md`If a fluid moves like a solid body — a tank accelerating in a straight line, a cup spinning at constant speed — no particle moves relative to its neighbours, nothing deforms, and the viscous shear stresses vanish **even though the fluid is viscous**. Euler's equation then holds exactly, with the acceleration known from the container's motion:`}</Md>
            <FormulaCard id="rigid-body" />
          </Supplement>
        </Step>

        <Step kind="example">
          <FlowSteps
            tone="emerald"
            steps={[
              { title: 'Check the field', md: md`Is it a possible flow (e.g. $\nabla\cdot\vb{V} = 0$ if incompressible)? Steady or unsteady? Which way does gravity point?` },
              { title: 'Acceleration', md: md`$\vb{a} = \pd{\vb{V}}{t} + (\vb{V}\cdot\nabla)\vb{V}$, component by component.` },
              { title: 'Pressure gradient', md: md`$\nabla p = \rho(\vb{g} - \vb{a})$, i.e. $\pd{p}{x} = \rho(g_x - a_x)$, and so on.` },
              { title: 'Integrate', md: md`Integrate $\pd{p}{x}$ in $x$ (the "constant" is a function of $y, z$), then match $\pd{p}{y}$ and $\pd{p}{z}$. If the mixed derivatives disagree, no pressure field can drive this motion.` },
              { title: 'Evaluate', md: 'Pressure differences between points, isobars, free surfaces (where p equals the atmospheric pressure).' },
            ]}
          />
          <ExampleCard id="euler-nozzle" />
          <ExampleCard id="euler-rotation" />
        </Step>

        <Step kind="interactive">
          <EulerGradientSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="euler" />
          <QuickCheck ids={['q-euler-rigid']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Inviscid ⇔ no shear stress. Then (Pascal's law) the normal stress is the same in every direction and $-p = \sigma_{xx} = \sigma_{yy} = \sigma_{zz}$.`,
              md`The minus sign makes the usual **compressive** state of a fluid a **positive** pressure.`,
              md`Euler: $\rho\vb{g} - \nabla p = \rho\big[\pd{\vb{V}}{t} + (\vb{V}\cdot\nabla)\vb{V}\big]$ — steady or unsteady, compressible or not, rotational or not, as long as shear is absent.`,
              md`$-\nabla p$ is the pressure force per unit volume: fluid accelerates towards low pressure; slowing down needs an adverse gradient ($\pd{p}{x} > 0$ in the flow direction).`,
              md`Rigid-body motion has no shear even in a viscous fluid: $\nabla p = \rho(\vb{g} - \vb{a})$ holds exactly (spinning cup, accelerating tank).`,
              md`**Trap:** Euler is not Bernoulli — Bernoulli needs extra assumptions (steady, incompressible, along a streamline).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
