import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowChart, FlowSteps, FormulaCard, Md, PracticeList, QuickCheck,
  SourceChips, Step, Supplement, Takeaways, md,
} from '@/kit'
import { CubeFluxDiagram } from '../sims/continuity/CubeFluxDiagram'
import { MassBalanceSim } from '../sims/continuity/MassBalanceSim'
import { PistonSim } from '../sims/continuity/PistonSim'
import { ElementAreaDemo } from '../sims/continuity/ElementAreaDemo'
import { DivergenceChecker } from '../sims/continuity/DivergenceChecker'
import { MissingComponentFinder } from '../sims/continuity/MissingComponentFinder'
import { CylCoordsFigure } from '../sims/continuity/CylCoordsFigure'
import { PolarElementDiagram } from '../sims/continuity/PolarElementDiagram'
import { CylindricalChecker } from '../sims/continuity/CylindricalChecker'

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export const meta: TopicMeta = {
  id: 'continuity',
  unit: 'A',
  title: 'Conservation of Mass — Differential Continuity Equation',
  subtitle:
    'From a mass balance on an infinitesimal box to ∂ρ/∂t + ∇·(ρV) = 0, and its steady-compressible, incompressible and cylindrical forms — plus how to test a velocity field and find a missing component.',
  minutes: 85,
  sources: [{ doc: 'lec9', pages: '10–11' }],
  concepts: [
    {
      id: 'general-continuity',
      title: 'The continuity equation — general and steady compressible forms',
      src: { doc: 'lec9', pages: '10' },
      summary: 'Mass balance at a point: ∂ρ/∂t + ∇·(ρV) = 0 for any flow; ∇·(ρV) = 0 when the flow is steady.',
    },
    {
      id: 'incompressible-continuity',
      title: 'Incompressible flow: ∇·V = 0',
      src: { doc: 'lec9', pages: '11' },
      summary: 'Constant density ⇒ ∂u/∂x + ∂v/∂y + ∂w/∂z = 0 for steady and unsteady flow; testing fields and finding missing components.',
    },
    {
      id: 'cylindrical-continuity',
      title: 'Continuity in cylindrical polar coordinates (r, θ, z)',
      src: { doc: 'lec9', pages: '11' },
      summary: 'General, steady and incompressible forms with V = v_r ê_r + v_θ ê_θ + v_z ê_z; why the extra r factors appear.',
    },
  ],
  sourceNote: md`**Primary source: Lecture 9, slides 10–11.** The slides state the equations and their ranges of validity; the step-by-step mass balance on the differential box, all solved examples, the practice problems (except one taken from Lec 10 slide 2) and the simulations are written for this platform and marked ✦ Supplementary. The deck prints **no equation numbers**, so none are quoted. The meaning of $\nabla\cdot\mathbf V$ as the *volumetric dilatation rate* (Lec 9 slide 5) is taught in the **Fluid element kinematics** topic and only referred to here.`,
}

const L9_10 = { doc: 'lec9', pages: '10' } as const
const L9_11 = { doc: 'lec9', pages: '11' } as const

/* ------------------------------------------------------------------ */
/* Formulas                                                            */
/* ------------------------------------------------------------------ */

export const formulas: FormulaDef[] = [
  {
    id: 'cont-general',
    name: 'The continuity equation (Cartesian, general)',
    key: true,
    tex: md`\pd{\rho}{t} + \pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z} = 0`,
    vars: [
      { sym: md`\rho(x,y,z,t)`, desc: 'fluid density — in general a function of position and time', units: md`\mathrm{kg/m^3}` },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates of the point', units: md`\mathrm{m}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components in $x$, $y$, $z$', units: md`\mathrm{m/s}` },
      { sym: md`\rho u,\ \rho v,\ \rho w`, desc: 'mass fluxes: kilograms crossing 1 m² of a face normal to $x$, $y$, $z$ per second', units: md`\mathrm{kg/(m^2\,s)}` },
    ],
    conditions: [
      '**any** flow: steady or unsteady, compressible or incompressible (Lec 9 slide 10)',
      'continuum fluid; no mass is created or destroyed inside the flow',
      'every term is a rate per unit volume, in kg/(m³·s)',
    ],
    use: md`The three flux derivatives add up to the **net rate of mass outflow per unit volume**; $\partial\rho/\partial t$ is minus that. Keep $\rho$ **inside** each derivative — by the product rule $\pd{(\rho u)}{x} = \rho\pd{u}{x} + u\pd{\rho}{x}$, and $\rho$ may vary in space.`,
    src: L9_10,
  },
  {
    id: 'cont-vector',
    name: 'The continuity equation (vector form)',
    key: true,
    tex: md`\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0`,
    vars: [
      { sym: md`\mathbf V = u\hat{\mathbf i} + v\hat{\mathbf j} + w\hat{\mathbf k}`, desc: 'velocity vector', units: md`\mathrm{m/s}` },
      { sym: md`\rho\mathbf V`, desc: 'mass-flux vector', units: md`\mathrm{kg/(m^2\,s)}` },
      { sym: md`\nabla\cdot(\;)`, desc: md`divergence of a vector field $\mathbf A$ (here $\mathbf A = \rho\mathbf V$); in Cartesian coordinates $\nabla\cdot\mathbf A = \partial A_x/\partial x + \partial A_y/\partial y + \partial A_z/\partial z$`, units: md`\mathrm{m^{-1}}` },
      { sym: md`\rho,\ t`, desc: 'density and time', units: md`\mathrm{kg/m^3},\ \mathrm{s}` },
    ],
    conditions: ['any flow, steady or unsteady, compressible or incompressible', 'coordinate-free: expand $\\nabla\\cdot$ in whichever coordinates suit the geometry (cylindrical in concept 3)'],
    use: md`Read $\nabla\cdot\rho\mathbf V$ as "net mass outflow per unit volume per unit time". The equation is restated at the top of slide 11 as the starting point for the incompressible and cylindrical forms.`,
    src: { doc: 'lec9', pages: '10–11' },
  },
  {
    id: 'cont-steady',
    name: 'Steady compressible flow',
    tex: md`\nabla\cdot\rho\mathbf V = 0 \qquad\Longleftrightarrow\qquad \pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z} = 0`,
    vars: [
      { sym: md`\rho(x,y,z)`, desc: 'density — may vary from point to point, but not in time', units: md`\mathrm{kg/m^3}` },
      { sym: md`u,\ v,\ w`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: ['**steady**: $\\partial\\rho/\\partial t = 0$ at every fixed point', 'compressible allowed: $\\rho$ may vary in space ($\\nabla\\rho \\neq 0$), so in general $\\nabla\\cdot\\mathbf V \\neq 0$'],
    use: md`The **mass flux** is divergence-free: whatever mass enters a small fixed region leaves it at the same rate. Typical use: steady gas flows (nozzles, ducts, radial diffusers), where you solve for $\rho$ or one mass-flux component.`,
    src: L9_10,
  },
  {
    id: 'face-flux',
    name: 'Mass flux on the faces of the element (first-order Taylor expansion)',
    tex: md`(\rho u)\Big|_{x \pm \delta x/2} = \rho u \pm \pd{(\rho u)}{x}\,\frac{\delta x}{2}`,
    vars: [
      { sym: md`\rho u`, desc: 'mass flux in $x$ at the centre $(x, y, z)$ of the element', units: md`\mathrm{kg/(m^2\,s)}` },
      { sym: md`\pd{(\rho u)}{x}`, desc: 'its gradient at the centre', units: md`\mathrm{kg/(m^3\,s)}` },
      { sym: md`\delta x`, desc: md`edge length of the element in $x$ (the faces sit at $x \pm \delta x/2$)`, units: md`\mathrm{m}` },
    ],
    conditions: ['element small: the neglected terms are of order $\\delta x^2$ and vanish in the limit', 'same form on the $y$-faces ($\\rho v$, $\\delta y$) and $z$-faces ($\\rho w$, $\\delta z$)'],
    use: md`Multiply by the face area ($\delta y\,\delta z$ for an $x$-face) to get the mass flow rate in kg/s through that face. Out − in for a pair of faces leaves only the gradient term.`,
  },
  {
    id: 'cont-material',
    name: 'Continuity in material-derivative form',
    tex: md`\frac{D\rho}{Dt} + \rho\,\nabla\cdot\mathbf V = 0 \qquad\Longleftrightarrow\qquad \nabla\cdot\mathbf V = -\frac{1}{\rho}\frac{D\rho}{Dt}`,
    vars: [
      { sym: md`\frac{D\rho}{Dt} = \pd{\rho}{t} + \mathbf V\cdot\nabla\rho`, desc: 'rate of change of density **following a fluid particle** (material derivative, Lec 9 slide 4)', units: md`\mathrm{kg/(m^3\,s)}` },
      { sym: md`\nabla\cdot\mathbf V`, desc: 'volumetric dilatation rate — fractional rate of volume growth of an element (Lec 9 slide 5)', units: md`\mathrm{s^{-1}}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: ['any flow — identical in content to $\\partial\\rho/\\partial t + \\nabla\\cdot\\rho\\mathbf V = 0$ (product rule $\\nabla\\cdot\\rho\\mathbf V = \\rho\\nabla\\cdot\\mathbf V + \\mathbf V\\cdot\\nabla\\rho$)'],
    use: md`The particle view: a fluid element's density falls at exactly the fractional rate at which its volume grows. **Incompressible** ($D\rho/Dt = 0$) is therefore the same statement as $\nabla\cdot\mathbf V = 0$.`,
  },
  {
    id: 'cont-incomp',
    name: 'Incompressible flow (steady or unsteady)',
    key: true,
    tex: md`\nabla\cdot\mathbf V = 0 \qquad\Longleftrightarrow\qquad \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0`,
    vars: [
      { sym: md`u,\ v,\ w`, desc: 'velocity components in $x$, $y$, $z$', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y,\ z`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
      { sym: md`\nabla\cdot\mathbf V`, desc: 'divergence of the velocity = volumetric dilatation rate', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      'incompressible: $\\rho$ constant (more generally $D\\rho/Dt = 0$)',
      '**steady and unsteady** flow — no time derivative appears (Lec 9 slide 11)',
      'must hold at **every point and every instant**, not just at one point',
    ],
    use: md`The test for "is this flow possible?": differentiate each component in its **own** direction, add, and check that the result is identically zero. It also gives the missing velocity component when the other two are known. Wilkes writes the same constant-density equation as $\partial v_x/\partial x + \partial v_y/\partial y + \partial v_z/\partial z = 0$.`,
    src: [L9_11, { doc: 'wilkes', pages: '484', note: 'Eq. (9.6), constant density' }],
  },
  {
    id: 'cont-2d',
    name: 'Plane two-dimensional incompressible flow',
    tex: md`\pd{u}{x} + \pd{v}{y} = 0`,
    vars: [
      { sym: md`u,\ v`, desc: 'velocity components in the plane of the flow', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates in that plane', units: md`\mathrm{m}` },
    ],
    conditions: ['incompressible', 'plane flow: $w = 0$ and nothing depends on $z$', 'printed for steady flow on Lec 9 slide 12 (stream function) and Fox Eq. 7.1; it holds instant by instant for unsteady flow too'],
    use: md`Starting point for the stream function (Lec 9 slide 12) and for most "find $v$ from $u$" problems. Each term has dimensions of 1/time (Fox, p. 246).`,
    src: [{ doc: 'lec9', pages: '12' }, { doc: 'fox', pages: '246', note: 'Eq. (7.1)' }],
  },
  {
    id: 'missing-comp',
    name: 'Finding a missing velocity component',
    tex: md`v = -\int \pd{u}{x}\,dy + f(x) \qquad\qquad w = -\int \Big(\pd{u}{x} + \pd{v}{y}\Big)\,dz + f(x, y)`,
    vars: [
      { sym: md`u,\ v,\ w`, desc: 'velocity components; the one being sought is integrated for', units: md`\mathrm{m/s}` },
      { sym: md`f(x),\ f(x,y)`, desc: 'arbitrary **function** of the variables held constant during the integration', units: md`\mathrm{m/s}` },
    ],
    conditions: ['incompressible flow: 2-D (left) or 3-D (right)', 'integrate with the other coordinates held fixed', '$f$ is fixed only by an extra condition (wall, symmetry plane, value on an axis)'],
    use: md`Write continuity for the unknown derivative, integrate, add $f$ of the remaining variables, then impose the given condition. Always check by substituting back.`,
  },
  {
    id: 'cyl-velocity',
    name: 'Velocity in cylindrical polar coordinates',
    tex: md`\mathbf V = v_r\,\hat{\mathbf e}_r + v_\theta\,\hat{\mathbf e}_\theta + v_z\,\hat{\mathbf e}_z`,
    vars: [
      { sym: md`r`, desc: 'radial distance from the $z$-axis', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: 'angle measured from the $x$-direction in the plane normal to $z$', units: md`\mathrm{rad}` },
      { sym: md`z`, desc: 'axial coordinate', units: md`\mathrm{m}` },
      { sym: md`v_r,\ v_\theta,\ v_z`, desc: 'radial, tangential (circumferential) and axial velocity components', units: md`\mathrm{m/s}` },
      { sym: md`\hat{\mathbf e}_r,\ \hat{\mathbf e}_\theta,\ \hat{\mathbf e}_z`, desc: md`unit vectors in the $r$, $\theta$, $z$ directions`, units: md`-` },
    ],
    conditions: ['$\\hat{\\mathbf e}_r$ and $\\hat{\\mathbf e}_\\theta$ change direction with $\\theta$; $\\hat{\\mathbf e}_z$ does not'],
    use: md`Use when the geometry has an axis: pipes, swirling flows, vortices, sources and sinks, flow around cylinders, radial flow between discs.`,
    src: L9_11,
  },
  {
    id: 'cyl-general',
    name: 'Continuity in cylindrical coordinates (general)',
    key: true,
    tex: md`\pd{\rho}{t} + \frac{1}{r}\pd{(r\rho v_r)}{r} + \frac{1}{r}\pd{(\rho v_\theta)}{\theta} + \pd{(\rho v_z)}{z} = 0`,
    vars: [
      { sym: md`\rho`, desc: md`density, a function of $(r, \theta, z, t)$`, units: md`\mathrm{kg/m^3}` },
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m},\ \mathrm{rad},\ \mathrm{m}` },
      { sym: md`v_r,\ v_\theta,\ v_z`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
    ],
    conditions: ['any flow (the cylindrical twin of the slide-10 equation)', '$r > 0$; on the axis the velocity must stay finite'],
    use: md`Each term is again a rate per unit volume in kg/(m³·s). Note the $r$ **inside** the radial derivative and the $1/r$ in front of the $\theta$-derivative.`,
    src: L9_11,
  },
  {
    id: 'cyl-steady',
    name: 'Cylindrical form without ∂ρ/∂t (steady flow)',
    tex: md`\frac{1}{r}\pd{(r\rho v_r)}{r} + \frac{1}{r}\pd{(\rho v_\theta)}{\theta} + \pd{(\rho v_z)}{z} = 0`,
    vars: [
      { sym: md`\rho`, desc: 'density — may vary with position', units: md`\mathrm{kg/m^3}` },
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m},\ \mathrm{rad},\ \mathrm{m}` },
      { sym: md`v_r,\ v_\theta,\ v_z`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['steady flow ($\\partial\\rho/\\partial t = 0$), compressible allowed', 'printed **unlabelled** on slide 11; "steady compressible" is read by analogy with slide 10'],
    use: md`For steady radial gas flow ($v_\theta = v_z = 0$, no $z$-dependence) it gives $r\rho v_r = $ constant $= \dot m/(2\pi h)$ for a passage of height $h$.`,
    src: L9_11,
  },
  {
    id: 'cyl-incomp',
    name: 'Incompressible flow in cylindrical coordinates',
    key: true,
    tex: md`\frac{1}{r}\pd{(r v_r)}{r} + \frac{1}{r}\pd{v_\theta}{\theta} + \pd{v_z}{z} = 0`,
    vars: [
      { sym: md`r,\ \theta,\ z`, desc: 'cylindrical coordinates', units: md`\mathrm{m},\ \mathrm{rad},\ \mathrm{m}` },
      { sym: md`v_r,\ v_\theta,\ v_z`, desc: 'velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['incompressible, steady or unsteady', 'printed **unlabelled** on slide 11 (the form with $\\rho$ removed)', 'valid where the fluid is ($r > 0$; singular lines such as a source at $r = 0$ are excluded)'],
    use: md`Product rule for the radial term: $\dfrac{1}{r}\pd{(r v_r)}{r} = \pd{v_r}{r} + \dfrac{v_r}{r}$ — the extra $v_r/r$ is the "spreading" of a radial flow over larger circles. Use it to test polar fields, or to find a missing component: integrate $\partial(r v_r)/\partial r$ in $r$ and add $f(\theta, z)$ to $r v_r$ (so $v_r$ gains $f(\theta, z)/r$), or integrate $\partial v_\theta/\partial\theta$ in $\theta$ and add $f(r, z)$ to $v_\theta$.`,
    src: L9_11,
  },
  {
    id: 'cyl-plane',
    name: 'Plane incompressible flow in polar coordinates (r, θ)',
    tex: md`\frac{1}{r}\pd{(r v_r)}{r} + \frac{1}{r}\pd{v_\theta}{\theta} = 0`,
    vars: [
      { sym: md`r,\ \theta`, desc: 'polar coordinates in the plane of the flow', units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`v_r,\ v_\theta`, desc: 'radial and tangential velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: ['incompressible, plane, two-dimensional flow: $v_z = 0$ and nothing depends on $z$ (blue label, Lec 10 slide 2)'],
    use: md`The cylindrical incompressible form with the $z$-term dropped. Lec 10 builds the polar stream function on it ($v_r = \frac{1}{r}\partial\psi/\partial\theta$, $v_\theta = -\partial\psi/\partial r$), and Lec 12 uses it for sources, sinks and vortices.`,
    src: { doc: 'lec10', pages: '2' },
  },
  {
    id: 'polar-transform',
    name: 'Converting between Cartesian and polar components',
    tex: md`\begin{aligned} x &= r\cos\theta,\qquad y = r\sin\theta \\ v_r &= u\cos\theta + v\sin\theta,\qquad v_\theta = -u\sin\theta + v\cos\theta \end{aligned}`,
    vars: [
      { sym: md`u,\ v`, desc: 'Cartesian velocity components', units: md`\mathrm{m/s}` },
      { sym: md`v_r,\ v_\theta`, desc: 'polar velocity components', units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates ($\\theta$ from the $x$-axis)', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: ['plane geometry; $z$ and $v_z = w$ are unchanged'],
    use: md`Project the velocity on $\hat{\mathbf e}_r = (\cos\theta, \sin\theta)$ and $\hat{\mathbf e}_\theta = (-\sin\theta, \cos\theta)$. Handy for checking that a field passes continuity in both coordinate systems.`,
  },
]

/* ------------------------------------------------------------------ */
/* Solved examples                                                     */
/* ------------------------------------------------------------------ */

export const examples: ExampleDef[] = [
  {
    id: 'ex-piston',
    concept: 'general-continuity',
    title: 'Gas compressed by a piston: how fast does the density rise?',
    difficulty: 2,
    given: md`A cylinder closed at $x = 0$ contains gas. The piston is at $x = L = 0.20$ m and moves toward the closed end at $V_p = 8$ m/s. At this instant the density is uniform, $\rho = 12$ kg/m³, and the gas velocity varies linearly from $0$ at the closed end to $-V_p$ at the piston: $u = -V_p\,x/L$, $v = w = 0$.`,
    find: md`The rate of change of density $\partial\rho/\partial t$ in the gas, and whether the flow could be treated as incompressible.`,
    assumptions: md`One-dimensional flow; piston speed far below the speed of sound, so the density stays uniform along the cylinder at each instant.`,
    steps: [
      {
        title: 'Choose the form of continuity',
        md: md`The density changes in time, so the flow is **unsteady** and **compressible** — only the general equation applies (Lec 9 slide 10). With $v = w = 0$:

$$
\pd{\rho}{t} + \pd{(\rho u)}{x} = 0
$$`,
      },
      {
        title: 'Evaluate the mass-flux gradient',
        md: md`$\rho$ is uniform in $x$, so $\pd{(\rho u)}{x} = \rho\pd{u}{x} = \rho\left(-\dfrac{V_p}{L}\right) = 12 \times \left(-\dfrac{8}{0.20}\right) = -480$ kg/(m³·s).`,
      },
      {
        title: 'Solve for ∂ρ/∂t',
        md: md`$\pd{\rho}{t} = -\pd{(\rho u)}{x} = +480$ kg/(m³·s). The density **rises** by about 0.48 kg/m³ — 4 % — every millisecond: more mass enters each fixed slice of the cylinder than leaves it.`,
      },
      {
        title: 'Cross-check with a global mass balance',
        md: md`The trapped mass $\rho A L$ is constant ($A$ = bore area), so $\rho L$ = const and $\dfrac{d\rho}{dt} = -\dfrac{\rho}{L}\dfrac{dL}{dt} = -\dfrac{12}{0.20} \times (-8) = 480$ kg/(m³·s) ✓. The differential and integral views agree.`,
      },
      {
        title: 'Could it be treated as incompressible?',
        md: md`$\nabla\cdot\mathbf V = \pd{u}{x} = -V_p/L = -40$ s⁻¹ $\neq 0$: every gas element shrinks by 4 % per millisecond. Setting $\nabla\cdot\mathbf V = 0$ would be badly wrong here.`,
      },
    ],
    answer: md`$\partial\rho/\partial t = +480$ kg/(m³·s) (density increasing); $\nabla\cdot\mathbf V = -40$ s⁻¹, so the flow is unsteady **and** compressible.`,
    insight: 'In unsteady compressible flow the ∂ρ/∂t term absorbs a non-zero net inflow — drop it and mass is no longer conserved.',
  },
  {
    id: 'ex-steady-gas',
    concept: 'general-continuity',
    title: 'Steady compressible flow: an accelerating gas stream',
    difficulty: 2,
    given: md`Steady flow of a gas along a duct axis with $u = U_0(1 + x/L)$, $v = w = 0$, where $U_0 = 50$ m/s and $L = 2$ m. At $x = 0$ the density is $\rho_0 = 1.2$ kg/m³.`,
    find: md`(a) The density distribution $\rho(x)$ demanded by continuity; (b) $u$, $\rho$ and $\rho u$ at $x = 1$ m; (c) $\nabla\cdot\mathbf V$ and the rate of change of density following a fluid particle there.`,
    steps: [
      {
        title: 'Choose the form',
        md: md`Steady ⇒ $\partial\rho/\partial t = 0$, so $\nabla\cdot\rho\mathbf V = 0$ (Lec 9 slide 10, steady compressible). With $v = w = 0$ and only $x$-dependence: $\dfrac{d(\rho u)}{dx} = 0$.`,
      },
      {
        title: 'Integrate',
        md: md`$\rho u$ = constant $= \rho_0 U_0 = 1.2 \times 50 = 60$ kg/(m²·s). Hence $\rho(x) = \dfrac{\rho_0 U_0}{u} = \dfrac{\rho_0}{1 + x/L}$.`,
      },
      {
        title: 'Evaluate at x = 1 m',
        md: md`$u = 50(1 + 0.5) = 75$ m/s, $\quad \rho = 1.2/1.5 = 0.80$ kg/m³, $\quad \rho u = 0.80 \times 75 = 60$ kg/(m²·s) ✓ — the same mass flux as at $x = 0$.`,
      },
      {
        title: 'Velocity divergence',
        md: md`$\nabla\cdot\mathbf V = \dfrac{du}{dx} = \dfrac{U_0}{L} = 25$ s⁻¹ $\neq 0$. The flow is steady but **not** incompressible: every element swells at 25 s⁻¹ while its density drops.`,
      },
      {
        title: 'Particle view (material form)',
        md: md`$\dfrac{d\rho}{dx} = -\dfrac{\rho_0}{L(1 + x/L)^2} = -\dfrac{1.2}{2 \times 1.5^2} = -0.267$ kg/m⁴, so $\dfrac{D\rho}{Dt} = u\dfrac{d\rho}{dx} = 75 \times (-0.267) = -20$ kg/(m³·s). Check: $-\rho\,\nabla\cdot\mathbf V = -0.80 \times 25 = -20$ kg/(m³·s) ✓.`,
      },
    ],
    answer: md`$\rho = \rho_0/(1 + x/L)$. At $x = 1$ m: $u = 75$ m/s, $\rho = 0.80$ kg/m³, $\rho u = 60$ kg/(m²·s); $\nabla\cdot\mathbf V = 25$ s⁻¹ and $D\rho/Dt = -20$ kg/(m³·s).`,
    insight: 'Steady ≠ incompressible: ∇·(ρV) = 0 can hold while ∇·V ≠ 0 — the density adjusts so that the mass flux stays divergence-free.',
  },
  {
    id: 'ex-check-3d',
    concept: 'incompressible-continuity',
    title: 'Is this 3-D velocity field a possible incompressible flow?',
    difficulty: 1,
    given: md`$u = 2x^2 - xy + z^2$, $\quad v = x^2 - 4xy + y^2$, $\quad w = -2xy - yz + y^2$ (m/s, with $x, y, z$ in m; the coefficients carry units of m⁻¹·s⁻¹).`,
    find: md`Whether the field satisfies continuity for an incompressible fluid, and the three normal gradients at $(2, 1, 1)$ m.`,
    steps: [
      {
        title: 'Write the test',
        md: md`For incompressible flow — steady **or** unsteady — the field must satisfy $\pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0$ at **every** point (Lec 9 slide 11).`,
      },
      {
        title: 'Differentiate each component in its own direction',
        md: md`$\pd{u}{x} = 4x - y, \qquad \pd{v}{y} = -4x + 2y, \qquad \pd{w}{z} = -y$ (all other coordinates held fixed).`,
      },
      {
        title: 'Add',
        md: md`$(4x - y) + (-4x + 2y) + (-y) = 0$ — identically, for all $x, y, z$ ✓.`,
      },
      {
        title: 'Spot values at (2, 1, 1)',
        md: md`$\pd{u}{x} = 8 - 1 = 7$ s⁻¹, $\ \pd{v}{y} = -8 + 2 = -6$ s⁻¹, $\ \pd{w}{z} = -1$ s⁻¹; sum $= 0$. The terms are not individually zero: the element is stretched in $x$ and squeezed in $y$ and $z$ with no net change of volume.`,
      },
    ],
    answer: md`Yes — $\nabla\cdot\mathbf V \equiv 0$, so it is a possible incompressible flow. At $(2, 1, 1)$: $7 - 6 - 1 = 0$ s⁻¹.`,
    insight: 'Differentiate u only with x, v only with y, w only with z; terms without that variable (like z² in u) drop out.',
  },
  {
    id: 'ex-missing-v',
    concept: 'incompressible-continuity',
    title: 'Find the missing v in a plane incompressible flow',
    difficulty: 2,
    given: md`Steady, incompressible, plane flow with $u = x^2 + 2xy - y^2$ (m/s; $x, y$ in m), and $v = 0$ everywhere on the $x$-axis ($y = 0$).`,
    find: md`$v(x, y)$, and the velocity at $(1, 2)$ m.`,
    steps: [
      {
        title: 'Continuity gives ∂v/∂y',
        md: md`Plane incompressible flow: $\pd{u}{x} + \pd{v}{y} = 0$, so $\pd{v}{y} = -\pd{u}{x} = -(2x + 2y)$.`,
      },
      {
        title: 'Integrate with respect to y (x held fixed)',
        md: md`$v = -2xy - y^2 + f(x)$. Because $x$ was held constant, the "constant" of integration may be any **function of $x$**.`,
      },
      {
        title: 'Use the condition to fix f(x)',
        md: md`On $y = 0$: $v(x, 0) = f(x) = 0$ for all $x$ ⇒ $f(x) = 0$, so $v = -2xy - y^2$.`,
      },
      {
        title: 'Check',
        md: md`$\pd{u}{x} + \pd{v}{y} = (2x + 2y) + (-2x - 2y) = 0$ ✓`,
      },
      {
        title: 'Evaluate at (1, 2)',
        md: md`$u = 1 + 4 - 4 = 1$ m/s, $\quad v = -4 - 4 = -8$ m/s, $\quad |\mathbf V| = \sqrt{1^2 + 8^2} = \sqrt{65} = 8.06$ m/s.`,
      },
    ],
    answer: md`$v = -2xy - y^2$ (without the condition: $-2xy - y^2 + f(x)$). At $(1, 2)$: $\mathbf V = (1, -8)$ m/s, $|\mathbf V| = 8.06$ m/s.`,
    insight: 'Writing "+ C" instead of "+ f(x)" is the classic lost mark in this exam question.',
  },
  {
    id: 'ex-missing-w',
    concept: 'incompressible-continuity',
    title: 'Find the missing w in a 3-D incompressible flow',
    difficulty: 3,
    given: md`Incompressible flow with $u = 2x^2 + yz$ and $v = -xy + z^2$ (m/s; coordinates in m), and $w = 0$ on the plane $z = 0$.`,
    find: md`$w(x, y, z)$ and the speed at $(1, 1, 2)$ m.`,
    steps: [
      {
        title: 'Continuity gives ∂w/∂z',
        md: md`$\pd{w}{z} = -\left(\pd{u}{x} + \pd{v}{y}\right) = -(4x - x) = -3x$.`,
      },
      {
        title: 'Integrate with respect to z',
        md: md`$w = -3xz + f(x, y)$ — in 3-D the arbitrary function may depend on **both** other coordinates.`,
      },
      {
        title: 'Apply the condition',
        md: md`$w(x, y, 0) = f(x, y) = 0$ ⇒ $w = -3xz$.`,
      },
      {
        title: 'Check',
        md: md`$\pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 4x - x - 3x = 0$ ✓`,
      },
      {
        title: 'Evaluate at (1, 1, 2)',
        md: md`$u = 2 + 2 = 4$ m/s, $\ v = -1 + 4 = 3$ m/s, $\ w = -6$ m/s; $\ |\mathbf V| = \sqrt{16 + 9 + 36} = \sqrt{61} = 7.81$ m/s.`,
      },
    ],
    answer: md`$w = -3xz$; at $(1, 1, 2)$: $\mathbf V = (4, 3, -6)$ m/s and $|\mathbf V| = 7.81$ m/s.`,
    insight: 'In 3-D the "constant" of integration is a function of the two coordinates you held fixed.',
  },
  {
    id: 'ex-source-vortex',
    concept: 'cylindrical-continuity',
    title: 'Line source and free vortex: do they satisfy continuity?',
    difficulty: 1,
    given: md`Two plane flows met again in Lec 12: a **line source** $v_r = \dfrac{m}{2\pi r}$, $v_\theta = 0$, and a **free vortex** $v_\theta = \dfrac{K}{r}$, $v_r = 0$; $v_z = 0$ in both. Take $m = 3$ m²/s and $K = 2$ m²/s.`,
    find: md`Whether each satisfies incompressible continuity, and the velocity and the volume flow rate (per unit depth) through a circle of radius $r = 0.5$ m.`,
    steps: [
      {
        title: 'Source — radial term',
        md: md`$r v_r = \dfrac{m}{2\pi}$ is a constant, so $\dfrac{1}{r}\pd{(r v_r)}{r} = 0$; the $\theta$- and $z$-terms vanish because $v_\theta = v_z = 0$. Continuity holds for every $r > 0$ ✓.`,
      },
      {
        title: 'Source — numbers',
        md: md`At $r = 0.5$ m: $v_r = \dfrac{3}{2\pi(0.5)} = 0.955$ m/s. Through the circle: $q = 2\pi r v_r = 2\pi(0.5)(0.955) = 3.00$ m²/s $= m$ — the same for every circle.`,
      },
      {
        title: 'Vortex',
        md: md`$v_r = v_z = 0$, and $v_\theta = K/r$ does not depend on $\theta$, so $\dfrac{1}{r}\pd{v_\theta}{\theta} = 0$ ✓. At $r = 0.5$ m: $v_\theta = 2/0.5 = 4$ m/s, while no fluid crosses any circle ($q = 0$).`,
      },
      {
        title: 'What about r = 0?',
        md: md`Both fields are singular on the axis. For the source all the fluid appears there: $r = 0$ is excluded from the flow region, and continuity is required only where fluid actually flows.`,
      },
    ],
    answer: md`Both satisfy continuity for $r > 0$. At $r = 0.5$ m: source $v_r = 0.955$ m/s with $q = 3.00$ m²/s; vortex $v_\theta = 4$ m/s with $q = 0$.`,
    insight: 'A purely radial plane flow must have v_r ∝ 1/r along every ray — exactly the source result (2πr)v_r = m used on Lec 12 slide 10.',
  },
  {
    id: 'ex-cylinder-vr',
    concept: 'cylindrical-continuity',
    title: 'Recover v_r for flow past a circular cylinder',
    difficulty: 2,
    given: md`Plane incompressible flow past a cylinder of radius $a = 0.5$ m in a stream $U = 2$ m/s has $v_\theta = -U\left(1 + \dfrac{a^2}{r^2}\right)\sin\theta$ and $v_z = 0$. No fluid crosses the cylinder surface: $v_r = 0$ at $r = a$.`,
    find: md`$v_r(r, \theta)$, and the velocity at $r = 1$ m, $\theta = 60^\circ$.`,
    steps: [
      {
        title: 'Continuity in polar form',
        md: md`With $v_z = 0$, multiply the incompressible form by $r$: $\pd{(r v_r)}{r} = -\pd{v_\theta}{\theta} = U\left(1 + \dfrac{a^2}{r^2}\right)\cos\theta$.`,
      },
      {
        title: 'Integrate in r (θ held fixed)',
        md: md`$r v_r = U\left(r - \dfrac{a^2}{r}\right)\cos\theta + f(\theta)$, so $v_r = U\left(1 - \dfrac{a^2}{r^2}\right)\cos\theta + \dfrac{f(\theta)}{r}$.`,
      },
      {
        title: 'Wall condition',
        md: md`$v_r(a, \theta) = 0 + f(\theta)/a = 0$ for every $\theta$ ⇒ $f(\theta) = 0$, so $v_r = U\left(1 - \dfrac{a^2}{r^2}\right)\cos\theta$.`,
      },
      {
        title: 'Numbers at r = 1 m, θ = 60°',
        md: md`$v_r = 2(1 - 0.25)(0.5) = 0.750$ m/s; $\ v_\theta = -2(1 + 0.25)(0.866) = -2.165$ m/s; $\ |\mathbf V| = \sqrt{0.750^2 + 2.165^2} = 2.29$ m/s.`,
      },
      {
        title: 'Check and interpret',
        md: md`$\dfrac{1}{r}\pd{(r v_r)}{r} = \dfrac{U}{r}\left(1 + \dfrac{a^2}{r^2}\right)\cos\theta$ and $\dfrac{1}{r}\pd{v_\theta}{\theta} = -\dfrac{U}{r}\left(1 + \dfrac{a^2}{r^2}\right)\cos\theta$ cancel ✓. Far away ($r \gg a$): $v_r \to U\cos\theta$, $v_\theta \to -U\sin\theta$ — a uniform stream in $+x$.`,
      },
    ],
    answer: md`$v_r = U\left(1 - a^2/r^2\right)\cos\theta$. At $(1\ \text{m}, 60^\circ)$: $v_r = 0.750$ m/s, $v_\theta = -2.165$ m/s, $|\mathbf V| = 2.29$ m/s.`,
    insight: 'In polar coordinates the function of integration appears as f(θ)/r — the no-flow condition on the body removes it.',
  },
  {
    id: 'ex-radial-gas',
    concept: 'cylindrical-continuity',
    title: 'Steady compressible radial outflow between two discs',
    difficulty: 2,
    given: md`Air flows steadily and radially outward between two parallel discs $h = 3$ mm apart, with $v_\theta = v_z = 0$. The mass flow rate is $\dot m = 0.02$ kg/s. Measured densities: $\rho = 1.15$ kg/m³ at $r = 0.08$ m and $\rho = 1.18$ kg/m³ at $r = 0.16$ m.`,
    find: md`The radial velocity $v_r$ at both radii.`,
    assumptions: md`Steady and axisymmetric; velocity and density uniform across the gap (no $z$-dependence).`,
    steps: [
      {
        title: 'Steady compressible cylindrical form',
        md: md`With $\partial\rho/\partial t = 0$, $v_\theta = v_z = 0$ and no $z$-dependence, slide 11's steady form leaves $\dfrac{1}{r}\pd{(r\rho v_r)}{r} = 0$ ⇒ $r\rho v_r = C$ (a constant).`,
      },
      {
        title: 'Fix the constant from the mass flow',
        md: md`All the mass crosses a cylinder of radius $r$ and height $h$: $\dot m = 2\pi r h\,\rho v_r = 2\pi h\,C$, so $C = \dfrac{\dot m}{2\pi h} = \dfrac{0.02}{2\pi(0.003)} = 1.061$ kg/(m·s).`,
      },
      {
        title: 'r = 0.08 m',
        md: md`$v_r = \dfrac{C}{r\rho} = \dfrac{1.061}{0.08 \times 1.15} = 11.5$ m/s.`,
      },
      {
        title: 'r = 0.16 m',
        md: md`$v_r = \dfrac{1.061}{0.16 \times 1.18} = 5.62$ m/s.`,
      },
      {
        title: 'Interpret',
        md: md`Doubling $r$ slightly more than halves $v_r$, because the density also rose a little as the decelerating flow recovered pressure. The product $r\rho v_r = 1.061$ kg/(m·s) is the same at both radii ✓.`,
      },
    ],
    answer: md`$v_r = 11.5$ m/s at $r = 0.08$ m and $5.62$ m/s at $r = 0.16$ m (with $r\rho v_r = 1.061$ kg/(m·s) at both).`,
    insight: 'Steady compressible: it is rρv_r — not rv_r — that stays constant, so keep ρ inside the r-derivative.',
  },
]

/* ------------------------------------------------------------------ */
/* Practice                                                            */
/* ------------------------------------------------------------------ */

const KGM3S = md`\mathrm{kg/(m^3\,s)}`
const MS = md`\mathrm{m/s}`
const PER_S = md`\mathrm{s^{-1}}`

export const practice: PracticeDef[] = [
  {
    id: 'pr-gc-1',
    concept: 'general-continuity',
    difficulty: 1,
    q: md`At a point in an unsteady compressible flow the mass-flux gradients are $\pd{(\rho u)}{x} = -3.2$, $\pd{(\rho v)}{y} = 1.5$ and $\pd{(\rho w)}{z} = 0.9$ kg/(m³·s). Is the density at that point increasing or decreasing, and at what rate?`,
    hint: md`Continuity: $\partial\rho/\partial t = -\nabla\cdot\rho\mathbf V$.`,
    answer: md`$\partial\rho/\partial t = +0.8$ kg/(m³·s) — increasing.`,
    solution: md`Net mass outflow per unit volume: $\nabla\cdot\rho\mathbf V = -3.2 + 1.5 + 0.9 = -0.8$ kg/(m³·s). It is negative, i.e. a net **inflow**. Continuity (Lec 9 slide 10) gives $\pd{\rho}{t} = -\nabla\cdot\rho\mathbf V = +0.8$ kg/(m³·s): mass accumulates and the density rises.`,
    check: [{ label: md`$\partial\rho/\partial t$`, value: 0.8, units: KGM3S }],
  },
  {
    id: 'pr-gc-2',
    concept: 'general-continuity',
    difficulty: 2,
    q: md`A compressible flow has $u = Ax$, $v = By$, $w = Cz$ with $A = 2$ s⁻¹, $B = -0.5$ s⁻¹ and $C = 1$ s⁻¹, and a density that is uniform in space but varies in time as $\rho = \rho_0 e^{-kt}$. (a) Find $k$ from continuity. (b) What is $\rho/\rho_0$ at $t = 0.4$ s?`,
    hint: md`$\rho$ has no spatial gradient, so $\nabla\cdot(\rho\mathbf V) = \rho\,\nabla\cdot\mathbf V$.`,
    answer: md`(a) $k = A + B + C = 2.5$ s⁻¹; (b) $\rho/\rho_0 = e^{-1} = 0.368$.`,
    solution: md`Continuity: $\pd{\rho}{t} + \nabla\cdot(\rho\mathbf V) = 0$. Since $\nabla\rho = 0$, $\nabla\cdot(\rho\mathbf V) = \rho\left(\pd{u}{x} + \pd{v}{y} + \pd{w}{z}\right) = \rho(A + B + C)$, and $\pd{\rho}{t} = -k\rho$. Therefore

$$
-k\rho + \rho(A + B + C) = 0 \quad\Rightarrow\quad k = A + B + C = 2 - 0.5 + 1 = 2.5\ \text{s}^{-1}.
$$

At $t = 0.4$ s: $\rho/\rho_0 = e^{-2.5 \times 0.4} = e^{-1} = 0.368$. Every element expands at 2.5 s⁻¹, so the density must fall at the same fractional rate.`,
    check: [
      { label: md`$k$`, value: 2.5, units: PER_S },
      { label: md`$\rho/\rho_0$ at 0.4 s`, value: 0.368 },
    ],
  },
  {
    id: 'pr-gc-3',
    concept: 'general-continuity',
    difficulty: 2,
    q: md`In a **steady** two-dimensional compressible flow the $x$-mass flux is $\rho u = A\,xy$ with $A = 4$ kg/(m⁴·s), and $\rho v = 0$ on the line $y = 0$. Find $\rho v(x, y)$, and $v$ at $(1, 0.5)$ m where $\rho = 2$ kg/m³.`,
    hint: md`Steady compressible: $\pd{(\rho u)}{x} + \pd{(\rho v)}{y} = 0$. Integrate in $y$ and keep the function of integration.`,
    answer: md`$\rho v = -Ay^2/2$; at $(1, 0.5)$: $\rho v = -0.5$ kg/(m²·s) and $v = -0.25$ m/s.`,
    solution: md`Steady ⇒ $\nabla\cdot\rho\mathbf V = 0$ (Lec 9 slide 10). In 2-D: $\pd{(\rho v)}{y} = -\pd{(\rho u)}{x} = -Ay$. Integrating in $y$: $\rho v = -\tfrac12 A y^2 + f(x)$. On $y = 0$, $\rho v = f(x) = 0$, so $\rho v = -\tfrac12 A y^2$. At $(1, 0.5)$: $\rho v = -\tfrac12(4)(0.25) = -0.5$ kg/(m²·s), hence $v = -0.5/2 = -0.25$ m/s. Continuity constrains the **mass flux** $\rho\mathbf V$; the local density is needed to get $v$ itself.`,
    check: [{ label: md`$v$ at (1, 0.5)`, value: -0.25, units: MS }],
  },
  {
    id: 'pr-gc-4',
    concept: 'general-continuity',
    difficulty: 1,
    q: md`The piston of the solved example is now pulled **outward** at 5 m/s. At the instant when $L = 0.10$ m the gas density is uniform at $1.6$ kg/m³ and $u = U_p\,x/L$ with $U_p = +5$ m/s. Find $\partial\rho/\partial t$.`,
    hint: md`For a uniform density, $\pd{(\rho u)}{x} = \rho\,U_p/L$.`,
    answer: md`$\partial\rho/\partial t = -80$ kg/(m³·s) (density falling).`,
    solution: md`$u = U_p x/L$ ⇒ $\pd{u}{x} = U_p/L = 5/0.10 = 50$ s⁻¹. With uniform $\rho$: $\pd{(\rho u)}{x} = \rho\pd{u}{x} = 1.6 \times 50 = 80$ kg/(m³·s). Continuity: $\pd{\rho}{t} = -80$ kg/(m³·s). Check with $\rho L$ = const: $\dfrac{d\rho}{dt} = -\dfrac{\rho}{L}\dfrac{dL}{dt} = -\dfrac{1.6}{0.10}(5) = -80$ kg/(m³·s) ✓.`,
    check: [{ label: md`$\partial\rho/\partial t$`, value: -80, units: KGM3S }],
  },
  {
    id: 'pr-gc-5',
    concept: 'general-continuity',
    difficulty: 3,
    q: md`(a) For the fixed box $\delta x\,\delta y\,\delta z$, show that the net rate of mass outflow through its two $z$-faces is $\pd{(\rho w)}{z}\,\delta x\,\delta y\,\delta z$. (b) Show that $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$ can be rewritten as $\dfrac{D\rho}{Dt} + \rho\,\nabla\cdot\mathbf V = 0$.`,
    hint: md`(a) Expand $\rho w$ to the faces at $z \pm \delta z/2$. (b) Use $\nabla\cdot(\rho\mathbf V) = \rho\nabla\cdot\mathbf V + \mathbf V\cdot\nabla\rho$ and the material derivative of Lec 9 slide 4.`,
    answer: md`(a) Out − in $= \pd{(\rho w)}{z}\,\delta x\,\delta y\,\delta z$. (b) $\partial\rho/\partial t + \mathbf V\cdot\nabla\rho + \rho\nabla\cdot\mathbf V = D\rho/Dt + \rho\nabla\cdot\mathbf V = 0$.`,
    solution: md`**(a)** The $z$-faces sit at $z \pm \delta z/2$ and have area $\delta x\,\delta y$. A first-order Taylor expansion about the centre gives the face mass fluxes $\rho w \pm \pd{(\rho w)}{z}\dfrac{\delta z}{2}$. Outflow through the upper face minus inflow through the lower face:

$$
\Big[\rho w + \pd{(\rho w)}{z}\frac{\delta z}{2}\Big]\delta x\,\delta y - \Big[\rho w - \pd{(\rho w)}{z}\frac{\delta z}{2}\Big]\delta x\,\delta y = \pd{(\rho w)}{z}\,\delta x\,\delta y\,\delta z
$$

**(b)** Product rule: $\nabla\cdot(\rho\mathbf V) = \rho\left(\pd{u}{x} + \pd{v}{y} + \pd{w}{z}\right) + u\pd{\rho}{x} + v\pd{\rho}{y} + w\pd{\rho}{z} = \rho\,\nabla\cdot\mathbf V + \mathbf V\cdot\nabla\rho$. Hence

$$
\pd{\rho}{t} + \mathbf V\cdot\nabla\rho + \rho\,\nabla\cdot\mathbf V = 0 \quad\Longrightarrow\quad \frac{D\rho}{Dt} + \rho\,\nabla\cdot\mathbf V = 0,
$$

since $D(\;)/Dt = \partial(\;)/\partial t + (\mathbf V\cdot\nabla)(\;)$ (Lec 9 slide 4). The volumetric dilatation rate therefore equals $-\dfrac{1}{\rho}\dfrac{D\rho}{Dt}$.`,
  },
  {
    id: 'pr-ic-1',
    concept: 'incompressible-continuity',
    difficulty: 1,
    q: md`Which of these plane velocity fields could describe an incompressible flow? (A) $u = 2xy$, $v = x^2 - y^2$; (B) $u = c\,xy$, $v = c\,xy$ with $c = 1$ m⁻¹·s⁻¹. For the one that fails, evaluate $\nabla\cdot\mathbf V$ at $(1, 2)$ m.`,
    hint: md`Compute $\partial u/\partial x + \partial v/\partial y$; it must vanish at every point, not just somewhere.`,
    answer: md`(A) is possible ($2y - 2y = 0$). (B) is not: $\nabla\cdot\mathbf V = c(x + y) = 3$ s⁻¹ at $(1, 2)$.`,
    solution: md`(A) $\pd{u}{x} = 2y$, $\pd{v}{y} = -2y$, sum $= 0$ everywhere ✓ — possible. (B) $\pd{u}{x} = cy$, $\pd{v}{y} = cx$, so $\nabla\cdot\mathbf V = c(x + y)$. It vanishes only on the line $y = -x$, so the field violates continuity almost everywhere and is impossible for an incompressible fluid. At $(1, 2)$: $\nabla\cdot\mathbf V = 1 \times (1 + 2) = 3$ s⁻¹ — an element there would grow at 3 s⁻¹.`,
    check: [{ label: md`$\nabla\cdot\mathbf V$ of (B) at (1, 2)`, value: 3, units: PER_S }],
  },
  {
    id: 'pr-ic-2',
    concept: 'incompressible-continuity',
    difficulty: 2,
    q: md`A plane incompressible flow has $u = a(x^2 - y^2)$ with $a = 0.5$ m⁻¹·s⁻¹, and $v = 0$ on the $x$-axis. Find $v(x, y)$ and evaluate it at $(2, 1.5)$ m.`,
    hint: md`$\partial v/\partial y = -\partial u/\partial x = -2ax$; integrate in $y$ and fix $f(x)$ from $v(x, 0) = 0$.`,
    answer: md`$v = -2axy$; $\ v(2, 1.5) = -3$ m/s.`,
    solution: md`$\pd{v}{y} = -\pd{u}{x} = -2ax$ ⇒ $v = -2axy + f(x)$. On $y = 0$: $f(x) = 0$, so $v = -2axy$. At $(2, 1.5)$: $v = -2(0.5)(2)(1.5) = -3$ m/s. Check: $\pd{u}{x} + \pd{v}{y} = 2ax - 2ax = 0$ ✓. (The field is also irrotational: $\partial v/\partial x - \partial u/\partial y = -2ay + 2ay = 0$.)`,
    check: [{ label: md`$v$ at (2, 1.5)`, value: -3, units: MS }],
  },
  {
    id: 'pr-ic-3',
    concept: 'incompressible-continuity',
    difficulty: 3,
    q: md`An incompressible flow has $u = 3x^2 + 2yz$ and $v = -4xy + z^2$ (m/s, coordinates in m). Find the most general $w$, then the particular $w$ that vanishes on the plane $z = 0$, and evaluate it at $(1, 2, 3)$ m.`,
    hint: md`$\partial w/\partial z = -(\partial u/\partial x + \partial v/\partial y)$; the function of integration depends on $x$ and $y$.`,
    answer: md`$w = -2xz + f(x, y)$; with $w(x, y, 0) = 0$: $w = -2xz$, so $w(1, 2, 3) = -6$ m/s.`,
    solution: md`$\pd{u}{x} = 6x$ and $\pd{v}{y} = -4x$ ⇒ $\pd{w}{z} = -(6x - 4x) = -2x$. Integrating with $x, y$ fixed: $w = -2xz + f(x, y)$ (the most general answer). The condition $w = 0$ at $z = 0$ gives $f = 0$, so $w = -2xz$. At $(1, 2, 3)$: $w = -2(1)(3) = -6$ m/s. Check: $6x - 4x - 2x = 0$ ✓.`,
    check: [{ label: md`$w$ at (1, 2, 3)`, value: -6, units: MS }],
  },
  {
    id: 'pr-ic-4',
    concept: 'incompressible-continuity',
    difficulty: 2,
    q: md`A student claims that the **unsteady** field $u = \dfrac{U_0}{L}\,x\sin\omega t$, $v = -\dfrac{U_0}{L}\,y\sin\omega t$ ($U_0 = 2$ m/s, $L = 0.5$ m, $\omega = 2\pi$ rad/s) cannot represent an incompressible flow "because it changes with time". Test the claim, and evaluate $\partial u/\partial x$ at $t = 0.25$ s.`,
    hint: md`$\nabla\cdot\mathbf V = 0$ contains no time derivative — check it at an arbitrary instant.`,
    answer: md`The claim is wrong: $\nabla\cdot\mathbf V = 0$ at every instant. At $t = 0.25$ s, $\partial u/\partial x = 4$ s⁻¹ (and $\partial v/\partial y = -4$ s⁻¹).`,
    solution: md`$\pd{u}{x} = \dfrac{U_0}{L}\sin\omega t$ and $\pd{v}{y} = -\dfrac{U_0}{L}\sin\omega t$, so $\nabla\cdot\mathbf V = 0$ for every $t$. The incompressible continuity equation is valid for **steady and unsteady** flow (Lec 9 slide 11); time enters only as a parameter. At $t = 0.25$ s, $\omega t = \pi/2$ and $\sin\omega t = 1$: $\pd{u}{x} = 2/0.5 = 4$ s⁻¹ and $\pd{v}{y} = -4$ s⁻¹.`,
    check: [{ label: md`$\partial u/\partial x$ at $t = 0.25$ s`, value: 4, units: PER_S }],
  },
  {
    id: 'pr-ic-5',
    concept: 'incompressible-continuity',
    difficulty: 1,
    q: md`The plane field $u = ax^2 + by$, $v = c\,xy$ has $a = 1.5$ m⁻¹·s⁻¹ and $b = 2$ s⁻¹. For what value of $c$ is it a possible incompressible flow?`,
    hint: md`$\nabla\cdot\mathbf V = (2a + c)\,x$ must vanish for all $x$.`,
    answer: md`$c = -2a = -3$ m⁻¹·s⁻¹ (any $b$ works).`,
    solution: md`$\pd{u}{x} = 2ax$ and $\pd{v}{y} = cx$, so $\nabla\cdot\mathbf V = (2a + c)\,x$. For this to vanish at **every** point the bracket must be zero: $c = -2a = -3$ m⁻¹·s⁻¹. The constant $b$ does not appear because $\partial(by)/\partial x = 0$.`,
    check: [{ label: md`$c$`, value: -3, units: md`\mathrm{m^{-1}\,s^{-1}}` }],
  },
  {
    id: 'pr-ic-6',
    concept: 'incompressible-continuity',
    difficulty: 1,
    src: { doc: 'lec10', pages: '2', note: 'in-class problem — continuity check before finding ψ' },
    q: md`The in-class problem on Lec 10 slide 2 says that $u = 2y$, $v = 4x$ is a steady, incompressible, two-dimensional flow and asks for its stream function. Before looking for $\psi$, verify that the field really satisfies continuity.`,
    hint: md`Does $u$ depend on $x$? Does $v$ depend on $y$?`,
    answer: md`$\partial u/\partial x + \partial v/\partial y = 0 + 0 = 0$ ✓ — continuity holds, so a stream function exists.`,
    solution: md`$u = 2y$ does not depend on $x$ and $v = 4x$ does not depend on $y$, so $\pd{u}{x} = 0$ and $\pd{v}{y} = 0$: $\nabla\cdot\mathbf V = 0$ everywhere ✓. A stream function exists for any plane incompressible flow (Lec 9 slide 12); it turns out to be $\psi = y^2 - 2x^2$ (check: $\partial\psi/\partial y = 2y = u$, $-\partial\psi/\partial x = 4x = v$), which is worked out in the stream-function topic.`,
  },
  {
    id: 'pr-cy-1',
    concept: 'cylindrical-continuity',
    difficulty: 1,
    q: md`A spiral vortex has $v_r = A/r$, $v_\theta = B/r$, $v_z = 0$ with $A = 0.8$ m²/s and $B = 1.5$ m²/s. (a) Does it satisfy incompressible continuity? (b) What volume flow rate per unit depth crosses a circle of radius $r$?`,
    hint: md`Compute $r v_r$ — and the flow through a circle is $\oint v_r\,r\,d\theta$.`,
    answer: md`(a) Yes, for $r > 0$. (b) $q = 2\pi A = 5.03$ m²/s, independent of $r$.`,
    solution: md`$r v_r = A$ is constant ⇒ $\dfrac{1}{r}\pd{(r v_r)}{r} = 0$; $v_\theta$ does not depend on $\theta$ ⇒ $\dfrac{1}{r}\pd{v_\theta}{\theta} = 0$; there is no $v_z$. The sum is zero for all $r > 0$ ✓. Through a circle of radius $r$: $q = \int_0^{2\pi} v_r\,r\,d\theta = 2\pi A = 2\pi(0.8) = 5.03$ m²/s — the same at every radius, as continuity demands. ($B$ carries fluid **around** the circles, not across them.)`,
    check: [{ label: md`$q$`, value: 5.0265, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'pr-cy-2',
    concept: 'cylindrical-continuity',
    difficulty: 2,
    q: md`A plane incompressible flow has $v_r = -\dfrac{K\cos\theta}{r^2}$ with $K = 0.5$ m³/s, $v_z = 0$, and $v_\theta = 0$ along the ray $\theta = 0$. Find $v_\theta(r, \theta)$ and evaluate it at $r = 0.5$ m, $\theta = 30^\circ$.`,
    hint: md`$\dfrac{\partial v_\theta}{\partial\theta} = -\dfrac{\partial(r v_r)}{\partial r}$; integrate in $\theta$, and the function of integration is $f(r)$.`,
    answer: md`$v_\theta = -\dfrac{K\sin\theta}{r^2}$; at $(0.5\ \text{m}, 30^\circ)$: $v_\theta = -1.00$ m/s.`,
    solution: md`$r v_r = -\dfrac{K\cos\theta}{r}$ ⇒ $\pd{(r v_r)}{r} = \dfrac{K\cos\theta}{r^2}$. Continuity multiplied by $r$: $\pd{v_\theta}{\theta} = -\pd{(r v_r)}{r} = -\dfrac{K\cos\theta}{r^2}$. Integrating in $\theta$: $v_\theta = -\dfrac{K\sin\theta}{r^2} + f(r)$, and $v_\theta = 0$ on $\theta = 0$ gives $f(r) = 0$. At $r = 0.5$ m, $\theta = 30^\circ$: $v_\theta = -\dfrac{0.5 \times 0.5}{0.25} = -1.00$ m/s. (This is the classical "doublet" field of potential-flow theory.)`,
    check: [{ label: md`$v_\theta$`, value: -1, units: MS }],
  },
  {
    id: 'pr-cy-3',
    concept: 'cylindrical-continuity',
    difficulty: 2,
    q: md`An axisymmetric jet impinges on a flat plate at $z = 0$: near the plate $v_z = -az$ with $a = 4$ s⁻¹, $v_\theta = 0$, and $v_r$ must stay finite on the axis $r = 0$. Find $v_r(r)$ and evaluate it at $r = 0.3$ m.`,
    hint: md`$\dfrac{1}{r}\dfrac{\partial(r v_r)}{\partial r} = -\dfrac{\partial v_z}{\partial z} = a$.`,
    answer: md`$v_r = ar/2$; $\ v_r(0.3\ \text{m}) = 0.6$ m/s.`,
    solution: md`Incompressible continuity with $v_\theta = 0$: $\dfrac{1}{r}\pd{(r v_r)}{r} = -\pd{v_z}{z} = a$ ⇒ $\pd{(r v_r)}{r} = ar$ ⇒ $r v_r = \dfrac{ar^2}{2} + f(z)$ ⇒ $v_r = \dfrac{ar}{2} + \dfrac{f(z)}{r}$. A finite velocity on the axis requires $f = 0$, so $v_r = ar/2 = 2r$. At $r = 0.3$ m: $v_r = 0.6$ m/s, outward along the plate. Check: $\dfrac{1}{r}\pd{(ar^2/2)}{r} + \pd{(-az)}{z} = a - a = 0$ ✓.`,
    check: [{ label: md`$v_r$ at $r = 0.3$ m`, value: 0.6, units: MS }],
  },
  {
    id: 'pr-cy-4',
    concept: 'cylindrical-continuity',
    difficulty: 1,
    q: md`Could $v_r = V_0$ (a constant), $v_\theta = \Omega r$, $v_z = 0$ be a plane incompressible flow? Evaluate the left-hand side of the cylindrical continuity equation at $r = 0.25$ m for $V_0 = 0.5$ m/s.`,
    hint: md`Do not forget the factor $r$ inside the radial derivative.`,
    answer: md`No: $\dfrac{1}{r}\dfrac{\partial(rV_0)}{\partial r} = \dfrac{V_0}{r} = 2$ s⁻¹ $\neq 0$ at $r = 0.25$ m.`,
    solution: md`Radial term: $\dfrac{1}{r}\pd{(rV_0)}{r} = \dfrac{V_0}{r}$. Angular term: $\dfrac{1}{r}\pd{(\Omega r)}{\theta} = 0$. Axial term: $0$. Sum $= V_0/r = 0.5/0.25 = 2$ s⁻¹ $\neq 0$ ⇒ **not** possible. Writing $\partial v_r/\partial r = 0$ (forgetting the $r$) would wrongly pass the field. Physically, the same outward speed through ever longer circles would require fluid to be created between them.`,
    check: [{ label: 'left-hand side at r = 0.25 m', value: 2, units: PER_S }],
  },
  {
    id: 'pr-cy-5',
    concept: 'cylindrical-continuity',
    difficulty: 3,
    q: md`The Cartesian stagnation flow $u = ax$, $v = -ay$ ($a = 2$ s⁻¹) satisfies $\partial u/\partial x + \partial v/\partial y = 0$. (a) Show that in polar form $v_r = ar\cos 2\theta$ and $v_\theta = -ar\sin 2\theta$. (b) Verify the polar continuity equation. (c) Evaluate $v_r$ and $v_\theta$ at $r = 1$ m, $\theta = 30^\circ$.`,
    hint: md`$v_r = u\cos\theta + v\sin\theta$ and $v_\theta = -u\sin\theta + v\cos\theta$, with $x = r\cos\theta$, $y = r\sin\theta$.`,
    answer: md`(b) $2a\cos 2\theta - 2a\cos 2\theta = 0$ ✓; (c) $v_r = 1.00$ m/s, $v_\theta = -1.73$ m/s.`,
    solution: md`**(a)** $v_r = ar\cos^2\theta - ar\sin^2\theta = ar\cos 2\theta$ and $v_\theta = -ar\cos\theta\sin\theta - ar\sin\theta\cos\theta = -ar\sin 2\theta$.

**(b)** $\dfrac{1}{r}\pd{(ar^2\cos 2\theta)}{r} = 2a\cos 2\theta$ and $\dfrac{1}{r}\pd{(-ar\sin 2\theta)}{\theta} = -2a\cos 2\theta$; the sum is zero ✓ — the same physics in different coordinates.

**(c)** $v_r = 2(1)\cos 60^\circ = 1.00$ m/s and $v_\theta = -2(1)\sin 60^\circ = -1.73$ m/s. Cartesian check: $(x, y) = (0.866, 0.5)$ m, $u = 1.732$ m/s, $v = -1.0$ m/s ⇒ $v_r = 1.732(0.866) - 1.0(0.5) = 1.00$ m/s ✓.`,
    check: [
      { label: md`$v_r$`, value: 1, units: MS },
      { label: md`$v_\theta$`, value: -1.732, units: MS },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */

export const quiz: QuizQ[] = [
  {
    id: 'q-gc-validity',
    concept: 'general-continuity',
    difficulty: 1,
    src: L9_10,
    q: md`The continuity equation $\partial\rho/\partial t + \nabla\cdot\rho\mathbf V = 0$ is valid for …`,
    options: ['steady or unsteady flow, compressible or incompressible', 'steady flow only', 'incompressible flow only', 'inviscid flow only'],
    answer: 0,
    explain: md`Slide 10: it is valid for steady or unsteady, compressible or incompressible flow — pure mass bookkeeping, with no assumption about viscosity or steadiness. The restricted forms come from *dropping* terms: steady removes $\partial\rho/\partial t$; incompressible gives $\nabla\cdot\mathbf V = 0$.`,
  },
  {
    id: 'q-gc-meaning',
    concept: 'general-continuity',
    difficulty: 2,
    q: md`Physically, $\nabla\cdot(\rho\mathbf V)$ at a point is …`,
    options: [
      'the net rate of mass outflow per unit volume',
      'the rate of change of density following a fluid particle',
      'the net rate of volume outflow per unit volume',
      'the mass flow rate through a unit area',
    ],
    answer: 0,
    explain: md`It is the "out − in" mass bookkeeping of the differential box per unit volume, in kg/(m³·s). The tempting "volume outflow per unit volume" is $\nabla\cdot\mathbf V$ (the dilatation rate, s⁻¹), and $D\rho/Dt$ follows a particle rather than a fixed point.`,
  },
  {
    id: 'q-gc-steady',
    concept: 'general-continuity',
    difficulty: 2,
    src: L9_10,
    q: md`For **steady compressible** flow, which statement is correct?`,
    options: [
      md`$\nabla\cdot\rho\mathbf V = 0$, but $\rho$ may still vary from point to point`,
      md`$\rho$ must be the same everywhere`,
      md`$\nabla\cdot\mathbf V = 0$`,
      md`$\partial(\rho u)/\partial x$ may be replaced by $\rho\,\partial u/\partial x$`,
    ],
    answer: 0,
    explain: md`Steady means $\partial\rho/\partial t = 0$ at each fixed point — not that $\rho$ is uniform. Because $\nabla\rho$ may be non-zero, $\nabla\cdot(\rho\mathbf V) = \rho\nabla\cdot\mathbf V + \mathbf V\cdot\nabla\rho$, and in general $\nabla\cdot\mathbf V \neq 0$ (e.g. the accelerating gas stream example, where $\nabla\cdot\mathbf V = 25$ s⁻¹).`,
  },
  {
    id: 'q-gc-sign',
    concept: 'general-continuity',
    difficulty: 1,
    q: md`At a point, $\partial(\rho u)/\partial x + \partial(\rho v)/\partial y + \partial(\rho w)/\partial z = -2$ kg/(m³·s). The density there is …`,
    options: ['increasing at 2 kg/(m³·s)', 'decreasing at 2 kg/(m³·s)', 'constant, because a net inflow is impossible', 'impossible to find without u, v and w individually'],
    answer: 0,
    explain: md`$\partial\rho/\partial t = -\nabla\cdot\rho\mathbf V = +2$ kg/(m³·s). A negative divergence means more mass enters the neighbourhood of the point than leaves, so mass accumulates; the sign is the usual trap.`,
  },
  {
    id: 'q-ic-unsteady',
    concept: 'incompressible-continuity',
    difficulty: 1,
    src: L9_11,
    q: md`$\nabla\cdot\mathbf V = 0$ applies to …`,
    options: ['incompressible flow, whether steady or unsteady', 'steady incompressible flow only', 'any steady flow', 'irrotational flow only'],
    answer: 0,
    explain: md`The blue label on slide 11 reads "steady and unsteady incompressible flow". Constant $\rho$ removes $\partial\rho/\partial t$ and lets $\rho$ leave the divergence; nothing requires steadiness. Steady *compressible* flow gives $\nabla\cdot\rho\mathbf V = 0$ instead.`,
  },
  {
    id: 'q-ic-possible',
    concept: 'incompressible-continuity',
    difficulty: 1,
    q: md`Which plane velocity field could represent an incompressible flow?`,
    options: [md`$u = 3x,\ v = -3y$`, md`$u = 3x,\ v = 3y$`, md`$u = x^2,\ v = 2xy$`, md`$u = xy,\ v = xy$`],
    answer: 0,
    explain: md`$3 - 3 = 0$. The others give $\nabla\cdot\mathbf V = 6$, $4x$ and $x + y$ — non-zero (at least somewhere), so they would create or destroy volume. Remember: zero at one point is not enough.`,
  },
  {
    id: 'q-ic-integration',
    concept: 'incompressible-continuity',
    difficulty: 2,
    q: md`For plane incompressible flow with $u = x^2 - y^2$, integrating $\partial v/\partial y = -2x$ gives …`,
    options: [md`$v = -2xy + f(x)$`, md`$v = -2xy + C$, with $C$ a constant`, md`$v = -2xy + f(y)$`, md`$v = -x^2 + f(y)$`],
    answer: 0,
    explain: md`The integration is in $y$ with $x$ held fixed, so the "constant" may be any function of $x$. Writing only $+C$ loses solutions; adding $f(y)$ is wrong because it would change $\partial v/\partial y$.`,
  },
  {
    id: 'q-ic-gradients',
    concept: 'incompressible-continuity',
    difficulty: 2,
    src: L9_11,
    q: md`Slide 11: for incompressible flow the continuity equation "reduces to a simple relationship involving certain velocity gradients". Which gradients?`,
    options: [
      md`the normal gradients $\partial u/\partial x,\ \partial v/\partial y,\ \partial w/\partial z$`,
      md`the cross gradients $\partial u/\partial y,\ \partial v/\partial x$`,
      md`the time derivatives $\partial u/\partial t,\ \partial v/\partial t,\ \partial w/\partial t$`,
      'the vorticity components',
    ],
    answer: 0,
    explain: md`$\nabla\cdot\mathbf V = \partial u/\partial x + \partial v/\partial y + \partial w/\partial z$ — the same normal gradients that make up the volumetric dilatation rate (slide 5). Cross gradients produce rotation and angular deformation: they change an element's shape, not its volume.`,
  },
  {
    id: 'q-ic-3d',
    concept: 'incompressible-continuity',
    difficulty: 2,
    q: md`In a 3-D flow, $\partial u/\partial x + \partial v/\partial y = 2$ s⁻¹ everywhere while $\partial w/\partial z = -2$ s⁻¹ everywhere. As an incompressible flow it is …`,
    options: [
      'possible: the full divergence is zero',
      'impossible, because the in-plane divergence is 2 s⁻¹',
      'possible only if the flow is steady',
      'possible only if the flow is irrotational',
    ],
    answer: 0,
    explain: md`All three terms count: $2 + (-2) = 0$, so $\nabla\cdot\mathbf V = 0$. Fluid spreading out in the $x$–$y$ plane is supplied along $z$. Judging a 3-D field from the in-plane terms alone is a common mistake.`,
  },
  {
    id: 'q-cy-term',
    concept: 'cylindrical-continuity',
    difficulty: 1,
    src: L9_11,
    q: md`The radial term of the incompressible continuity equation in cylindrical coordinates is …`,
    options: [md`$\dfrac{1}{r}\dfrac{\partial(r v_r)}{\partial r}$`, md`$\dfrac{\partial v_r}{\partial r}$`, md`$\dfrac{1}{r}\dfrac{\partial v_r}{\partial r}$`, md`$r\dfrac{\partial v_r}{\partial r}$`],
    answer: 0,
    explain: md`Slide 11 writes the radial term as $\frac{1}{r}\partial(r v_r)/\partial r$. By the product rule it equals $\partial v_r/\partial r + v_r/r$; the extra $v_r/r$ accounts for the outer face of a ring element being larger than the inner one. Dropping the $r$ gives the Cartesian-looking but wrong $\partial v_r/\partial r$, and $\frac{1}{r}\partial v_r/\partial r$ or $r\,\partial v_r/\partial r$ do not even have units of s⁻¹.`,
  },
  {
    id: 'q-cy-uniform',
    concept: 'cylindrical-continuity',
    difficulty: 2,
    q: md`A plane flow has $v_r = V_0$ (constant, non-zero) and $v_\theta = 0$. It …`,
    options: [
      md`violates continuity, because the radial term equals $V_0/r$`,
      md`satisfies continuity, because $v_r$ does not vary`,
      'satisfies continuity only if it is steady',
      md`violates continuity only at $r = 0$`,
    ],
    answer: 0,
    explain: md`$\frac{1}{r}\partial(rV_0)/\partial r = V_0/r \neq 0$ everywhere. The flow through a circle, $2\pi r V_0$, grows with $r$, so fluid would have to be created between the circles.`,
  },
  {
    id: 'q-cy-source',
    concept: 'cylindrical-continuity',
    difficulty: 1,
    src: { doc: 'lec12', pages: '10' },
    q: md`Why must $v_r \propto 1/r$ in a plane line source?`,
    options: [
      md`so that $r v_r$ — and the flow through every circle — stays constant`,
      'because the pressure falls as 1/r',
      'because the flow is irrotational',
      'so that the flow is steady',
    ],
    answer: 0,
    explain: md`Continuity requires $\partial(r v_r)/\partial r = 0$, i.e. $2\pi r v_r = m$ for every radius — exactly the statement $(2\pi r)v_r = m$ used for the source on Lec 12 slide 10. Irrotationality and steadiness are separate properties.`,
  },
  {
    id: 'q-cy-labels',
    concept: 'cylindrical-continuity',
    difficulty: 2,
    src: L9_11,
    q: md`On slide 11 the second cylindrical equation — without $\partial\rho/\partial t$ but with $\rho$ kept inside the derivatives — applies to …`,
    options: ['steady flow, in which the density may vary in space', 'unsteady incompressible flow only', 'any unsteady compressible flow', md`only flows with $v_z = 0$`],
    answer: 0,
    explain: md`It is unlabelled on the slide, but it is the general form with $\partial\rho/\partial t = 0$ — the cylindrical twin of slide 10's "steady compressible flow". Removing $\rho$ altogether gives the third (incompressible) form, which also covers unsteady flow.`,
  },
]

/* ------------------------------------------------------------------ */
/* Flashcards                                                          */
/* ------------------------------------------------------------------ */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-gc-1',
    src: L9_10,
    front: md`State the differential continuity equation (Cartesian) and its range of validity.`,
    back: md`$\pd{\rho}{t} + \pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z} = 0$, i.e. $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$ — valid for steady or unsteady, compressible or incompressible flow.`,
  },
  {
    id: 'fc-gc-2',
    front: md`Which two quantities balance in the differential mass balance on a fixed box?`,
    back: md`The rate of mass accumulation inside, $\pd{\rho}{t}\,\delta x\,\delta y\,\delta z$, plus the net rate of mass outflow through the six faces, $\nabla\cdot(\rho\mathbf V)\,\delta x\,\delta y\,\delta z$ — they add to zero.`,
  },
  {
    id: 'fc-gc-3',
    src: L9_10,
    front: md`Continuity for steady compressible flow?`,
    back: md`$\nabla\cdot\rho\mathbf V = 0$, i.e. $\pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z} = 0$. $\rho$ may vary in space — keep it inside the derivatives.`,
  },
  {
    id: 'fc-gc-4',
    front: md`Material (particle) form of continuity?`,
    back: md`$\dfrac{D\rho}{Dt} + \rho\,\nabla\cdot\mathbf V = 0$, so the dilatation rate is $\nabla\cdot\mathbf V = -\dfrac{1}{\rho}\dfrac{D\rho}{Dt}$.`,
  },
  {
    id: 'fc-ic-1',
    src: L9_11,
    front: md`Incompressible continuity — vector and Cartesian forms, and when is it valid?`,
    back: md`$\nabla\cdot\mathbf V = 0$; $\ \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0$ — for steady **and** unsteady incompressible flow.`,
  },
  {
    id: 'fc-ic-2',
    src: { doc: 'lec9', pages: '5, 11' },
    front: md`Physical meaning of $\nabla\cdot\mathbf V = 0$?`,
    back: md`$\nabla\cdot\mathbf V$ is the volumetric dilatation rate (slide 5), so every fluid element keeps its volume: its shape may change, its volume may not.`,
  },
  {
    id: 'fc-ic-3',
    front: md`Recipe for a missing velocity component?`,
    back: md`Use continuity for its derivative (e.g. $\partial v/\partial y = -\partial u/\partial x$), integrate with the other variables held fixed, add an arbitrary **function** of those variables, then fix it with a boundary condition — and check by substitution.`,
  },
  {
    id: 'fc-ic-4',
    front: md`Quick test: $u = 2x,\ v = -2y$ versus $u = 2x,\ v = 2y$ — which can be incompressible?`,
    back: md`The first ($2 - 2 = 0$). The second has $\nabla\cdot\mathbf V = 4$ s⁻¹ — every element would swell.`,
  },
  {
    id: 'fc-cy-1',
    src: L9_11,
    front: md`General continuity equation in cylindrical coordinates?`,
    back: md`$\pd{\rho}{t} + \dfrac{1}{r}\pd{(r\rho v_r)}{r} + \dfrac{1}{r}\pd{(\rho v_\theta)}{\theta} + \pd{(\rho v_z)}{z} = 0$`,
  },
  {
    id: 'fc-cy-2',
    src: L9_11,
    front: md`Incompressible continuity in cylindrical coordinates?`,
    back: md`$\dfrac{1}{r}\pd{(r v_r)}{r} + \dfrac{1}{r}\pd{v_\theta}{\theta} + \pd{v_z}{z} = 0$ (steady or unsteady).`,
  },
  {
    id: 'fc-cy-3',
    front: md`Why an $r$ inside the radial derivative and a $1/r$ before the $\theta$-derivative?`,
    back: md`The face area of a ring element grows with radius (outer $(r + \delta r)\,\delta\theta\,\delta z$ vs inner $r\,\delta\theta\,\delta z$), and an arc length is $r\,\delta\theta$, so a gradient along $\theta$ per unit length is $\frac{1}{r}\partial/\partial\theta$.`,
  },
  {
    id: 'fc-cy-4',
    front: md`Name three plane flows that satisfy cylindrical continuity for $r > 0$, and one that does not.`,
    back: md`Line source $v_r = m/(2\pi r)$, free vortex $v_\theta = K/r$, rigid rotation $v_\theta = \Omega r$ pass. A uniform radial flow $v_r = V_0$ fails: $\frac{1}{r}\partial(r V_0)/\partial r = V_0/r \neq 0$.`,
  },
]

/* ------------------------------------------------------------------ */
/* Topic takeaways                                                     */
/* ------------------------------------------------------------------ */

export const takeaways: string[] = [
  md`**Mass conservation at a point:** $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$ — accumulation plus net outflow is zero. Valid for steady or unsteady, compressible or incompressible flow (Lec 9 slide 10).`,
  md`It comes from a mass balance on a **fixed** box: each face flux is the centre value $\pm$ gradient $\times$ half the edge, so out − in through the two $x$-faces leaves $\partial(\rho u)/\partial x\;\delta x\,\delta y\,\delta z$ (likewise $\partial(\rho v)/\partial y$ and $\partial(\rho w)/\partial z$ for the other pairs).`,
  md`**Steady compressible:** $\nabla\cdot\rho\mathbf V = 0$. The density may still vary in space, so keep $\rho$ inside the derivatives; $\nabla\cdot\mathbf V$ is generally **not** zero.`,
  md`**Incompressible:** $\nabla\cdot\mathbf V = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0$ for **steady and unsteady** flow (Lec 9 slide 11) — zero volumetric dilatation rate.`,
  md`To test a field, differentiate each component in its own direction and add. The sum must vanish **identically** — at every point and every instant — and in 3-D it must include $\partial w/\partial z$.`,
  md`To find a missing component, integrate continuity with the other variables held fixed, add an arbitrary **function** of them ($f(x)$, $f(x, y)$, $f(\theta)$…), then fix it with a boundary condition.`,
  md`**Cylindrical:** $\frac{1}{r}\pd{(r v_r)}{r} + \frac{1}{r}\pd{v_\theta}{\theta} + \pd{v_z}{z} = 0$ (incompressible); the general and steady forms keep $\rho$ inside every derivative. The $r$ factors come from face areas that grow with $r$ and arc lengths $r\,\delta\theta$.`,
  md`Benchmarks: a line source ($v_r \propto 1/r$), a free vortex ($v_\theta \propto 1/r$) and rigid rotation satisfy continuity for $r > 0$; a uniform $v_r$ does not.`,
  md`Particle view (supplementary): $\dfrac{D\rho}{Dt} + \rho\,\nabla\cdot\mathbf V = 0$ — incompressible means each fluid particle keeps its density.`,
  md`Continuity underpins what follows: the stream function exists because plane incompressible flow satisfies $\pd{u}{x} + \pd{v}{y} = 0$ (Lec 9 slide 12), and Laplace's equation follows from $\nabla\cdot\mathbf V = 0$ with $\mathbf V = \nabla\phi$ (Lec 10).`,
]

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export default function Content() {
  return (
    <>
      {/* ============================ Concept 1 ============================ */}
      <Concept id="general-continuity">
        <Step kind="intro" src={L9_10}>
          <Md>{md`Lecture 9 first described *how* a fluid element moves and deforms (kinematics, slides 2–9). Slide 10, headed **Conservation of Mass**, applies the first physical law to the flow: **mass is neither created nor destroyed**. Written at a point, in differential form, this law is called **the continuity equation**:

$$
\pd{\rho}{t} + \pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z} = 0
$$

The slide stresses that it is *valid for steady or unsteady flow, and compressible or incompressible flow*. It is pure bookkeeping of mass: no assumption about viscosity, steadiness or density is needed. The slide also writes it compactly as $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$ and gives the special case of **steady compressible flow**, $\nabla\cdot\rho\mathbf V = 0$. Every other form in this topic is obtained by dropping terms that vanish under extra assumptions.`}</Md>
          <Callout kind="exam">
            <Md>{md`Typical exam tasks on continuity: (1) state the general equation and the assumption behind each simplified form; (2) decide whether a given velocity field is **physically possible**; (3) find a **missing velocity component**, including the arbitrary function of integration; (4) derive the equation from a mass balance on a differential element.`}</Md>
          </Callout>
          <Md>{md`Where it sits: continuity is the first of the differential conservation laws. The stream function (slide 12) exists *because* of it, and the equations of motion of Lecture 10 are always solved together with it.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture a tiny box **fixed in space** with fluid streaming through it — like a toll booth on a motorway that counts cars in and out. The mass inside can change for only one reason: more mass crosses the walls inward than outward (or vice versa). Nothing is created inside.

- **Rate of increase of mass inside = rate in − rate out.** Divide by the box volume and shrink it to a point, and you have the continuity equation.
- $\rho u$ is a **mass flux** — kilograms crossing one square metre of a face normal to $x$ each second. If $\rho u$ is the same on the left and right faces, as much mass leaves as enters: no $x$-contribution. Only the *change* of $\rho u$ across the box matters, hence $\partial(\rho u)/\partial x$.
- $\rho u$ can change because the fluid speeds up **or** because it becomes denser — that is why $\rho$ stays inside the derivative.`}</Md>
          <Compare
            items={[
              { title: 'Pumping a bicycle tyre', md: md`Net inflow into every small region of the tyre: $\nabla\cdot\rho\mathbf V < 0$, so $\partial\rho/\partial t > 0$ — the air gets denser.`, tone: 'indigo' },
              { title: 'Steady gas flow in a nozzle', md: md`At each fixed point the density never changes, yet it differs from inlet to outlet. What enters each region leaves it: $\nabla\cdot\rho\mathbf V = 0$.`, tone: 'cyan' },
              { title: 'Water in a pipe', md: md`Density essentially constant: whatever volume enters a region leaves it at the same instant, $\nabla\cdot\mathbf V = 0$ (concept 2).`, tone: 'amber' },
            ]}
          />
          <Callout kind="note" title="Fixed box vs moving element">
            <Md>{md`The kinematics topic followed a **material element** that moves with the fluid (its volume changes at the fractional rate $\frac{1}{\delta\forall}\frac{d(\delta\forall)}{dt} = \nabla\cdot\mathbf V$, Lec 9 slide 5). Here the box is **fixed in space** and fluid flows through it. Both views describe the same physics — they are linked by $D\rho/Dt + \rho\nabla\cdot\mathbf V = 0$ (equations step).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" title="Visual explanation — the differential control volume">
          <Figure caption="Mass fluxes through the six faces of a fixed box δx·δy·δz centred at (x, y, z). Each face value is the centre value ± gradient × half the edge length (supplementary figure — slide 10 has none).">
            <CubeFluxDiagram />
          </Figure>
          <Callout kind="tip">
            <Md>{md`Notice what cancels: the centre value $\rho u$ appears with **opposite signs** on the in- and out-faces, so uniform through-flow contributes nothing. Only the gradient survives, multiplied by the full edge $\delta x$ and the face area $\delta y\,\delta z$ — i.e. by the box volume.`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" title="Derivation — mass balance on the fixed box">
          <Derivation
            title="From a box of fluid to the continuity equation"
            steps={[
              { md: md`Take a box **fixed in space**, centred at $(x, y, z)$, with edges $\delta x, \delta y, \delta z$ and volume $\delta x\,\delta y\,\delta z$. Fluid flows through it.`, why: 'Eulerian control volume' },
              { md: md`Mass inside: $\rho\,\delta x\,\delta y\,\delta z$. The box neither moves nor changes size, so its mass changes at the rate $\pd{\rho}{t}\,\delta x\,\delta y\,\delta z$.`, why: 'accumulation term' },
              { md: md`Mass flux through the face at $x + \delta x/2$ (area $\delta y\,\delta z$): $\rho u + \pd{(\rho u)}{x}\dfrac{\delta x}{2}$; through the face at $x - \delta x/2$: $\rho u - \pd{(\rho u)}{x}\dfrac{\delta x}{2}$.`, why: 'first-order Taylor expansion about the centre' },
              { md: md`Net outflow through the $x$-faces $= \Big[\rho u + \pd{(\rho u)}{x}\dfrac{\delta x}{2}\Big]\delta y\,\delta z - \Big[\rho u - \pd{(\rho u)}{x}\dfrac{\delta x}{2}\Big]\delta y\,\delta z = \pd{(\rho u)}{x}\,\delta x\,\delta y\,\delta z$.`, why: 'out − in: the centre value ρu cancels' },
              { md: md`Likewise through the $y$-faces: $\pd{(\rho v)}{y}\,\delta x\,\delta y\,\delta z$, and through the $z$-faces: $\pd{(\rho w)}{z}\,\delta x\,\delta y\,\delta z$.`, why: 'same argument for the other two pairs' },
              {
                md: md`Conservation of mass — accumulation + net outflow $= 0$:

$$
\Big[\pd{\rho}{t} + \pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z}\Big]\,\delta x\,\delta y\,\delta z = 0
$$`,
                why: 'no mass is created inside',
              },
              { md: md`Divide by $\delta x\,\delta y\,\delta z$ and let the box shrink to the point: $\pd{\rho}{t} + \pd{(\rho u)}{x} + \pd{(\rho v)}{y} + \pd{(\rho w)}{z} = 0$ — the slide-10 equation, $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$.`, why: 'the limit makes the Taylor expansion exact' },
            ]}
          />
          <FormulaCard id="face-flux" />
        </Step>

        <Step kind="equations" src={L9_10}>
          <Md>{md`Slide 10 gives the equation in Cartesian and vector form and its steady compressible special case.`}</Md>
          <FormulaCard id="cont-general" />
          <FormulaCard id="cont-vector" />
          <FormulaCard id="cont-steady" />
          <Callout kind="warning">
            <Md>{md`**Keep $\rho$ inside the derivatives.** $\pd{(\rho u)}{x} = \rho\pd{u}{x} + u\pd{\rho}{x}$. Pulling $\rho$ out is allowed only if $\rho$ is uniform — and "steady" does **not** mean uniform: in steady compressible flow $\partial\rho/\partial t = 0$ but $\nabla\rho \neq 0$ in general.`}</Md>
          </Callout>
          <Supplement title="The same equation seen by a moving particle">
            <Md>{md`Expand the divergence with the product rule, $\nabla\cdot\rho\mathbf V = \rho\,\nabla\cdot\mathbf V + \mathbf V\cdot\nabla\rho$, and group $\pd{\rho}{t} + \mathbf V\cdot\nabla\rho$ into the material derivative $D\rho/Dt$ of Lec 9 slide 4:`}</Md>
            <FormulaCard id="cont-material" />
            <Md>{md`Read it as: *the fractional rate at which a particle's volume grows* ($\nabla\cdot\mathbf V$, the dilatation rate of slide 5) *equals the fractional rate at which its density falls.* Mass of the particle = density × volume stays fixed.`}</Md>
          </Supplement>
          <Callout kind="exam">
            <Md>{md`Units check: every term is kg/(m³·s). If one of your terms comes out in kg/(m²·s) or s⁻¹, a derivative or a factor $\rho$ is missing.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <Md>{md`Lecture 9 contains no worked examples, so both examples are written for this platform: one **unsteady compressible** flow (the $\partial\rho/\partial t$ term matters) and one **steady compressible** flow (it does not, but $\rho$ varies in space).`}</Md>
          <ExampleCard id="ex-piston" />
          <ExampleCard id="ex-steady-gas" />
        </Step>

        <Step kind="interactive">
          <MassBalanceSim />
          <PistonSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="general-continuity" />
          <QuickCheck ids={['q-gc-sign', 'q-gc-steady']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$ holds for **every** flow — steady or unsteady, compressible or incompressible (slide 10).`,
              md`$\nabla\cdot\rho\mathbf V$ = net mass **outflow** per unit volume; a negative value means mass is accumulating ($\partial\rho/\partial t > 0$).`,
              md`Steady compressible flow: $\nabla\cdot\rho\mathbf V = 0$ — the density can still vary in space and $\nabla\cdot\mathbf V$ need not vanish.`,
              md`Derivation in one line: face flux = centre value ± gradient × half edge; out − in per pair of faces = gradient × volume.`,
              md`Trap: writing $\rho\,\partial u/\partial x$ for $\partial(\rho u)/\partial x$ when the density varies in space.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================ Concept 2 ============================ */}
      <Concept id="incompressible-continuity">
        <Step kind="intro" src={L9_11}>
          <Md>{md`Slide 11 restates the general equation $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$ and specialises it to an **incompressible** fluid. With $\rho$ constant, $\partial\rho/\partial t = 0$ and $\rho$ comes out of the divergence, leaving

$$
\nabla\cdot\mathbf V = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0
$$

The blue label on the slide is the key point: this holds for **steady and unsteady** incompressible flow. In the slide's words, for incompressible flow the continuity equation reduces to *a simple relationship involving certain velocity gradients* — the three **normal** gradients $\partial u/\partial x$, $\partial v/\partial y$, $\partial w/\partial z$.`}</Md>
          <Callout kind="key">
            <Md>{md`These are exactly the gradients in the **volumetric dilatation rate** $\frac{1}{\delta\forall}\frac{d(\delta\forall)}{dt} = \nabla\cdot\mathbf V$ of Lec 9 slide 5 (see the Fluid element kinematics topic). Incompressible continuity therefore says: *no fluid element ever changes its volume.*`}</Md>
          </Callout>
          <Md>{md`It is by far the most used form in this course: liquids, and gases at low speed, are treated as incompressible, and every problem of the type "is this flow possible?" or "find the missing velocity component" starts here.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of a completely full, rigid syringe of water: push the plunger and water leaves the nozzle **at the same instant** — none can be stored by squeezing it. In an incompressible flow every small region behaves like that syringe:

- whatever **volume** flows in, flows out at the same moment, so $\nabla\cdot\mathbf V$ — the net volume outflow per unit volume — is zero;
- an element may be **stretched** in one direction, but then it must **shrink** in another ($\partial u/\partial x > 0$ forces $\partial v/\partial y + \partial w/\partial z < 0$): shape changes, volume does not;
- the flow may **change in time** — a pulsating pump, sloshing water — as long as at every instant inflow equals outflow. That is why the equation carries no time derivative.`}</Md>
          <Callout kind="tip" title="When is a flow 'incompressible'?">
            <Md>{md`Liquids: almost always. Gases: when the speed is well below the speed of sound — a common rule of thumb is a Mach number below about 0.3, where density changes stay below roughly 5 % ($\Delta\rho/\rho \approx \tfrac12\mathrm{Ma}^2 = 0.045$ at $\mathrm{Ma} = 0.3$). Strictly, incompressible means $D\rho/Dt = 0$: each particle keeps its density.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={{ doc: 'lec9', pages: '10–11' }}>
          <Figure caption="Which form of continuity? Each simplification drops the terms that vanish under one extra assumption." src={{ doc: 'lec9', pages: '10–11' }}>
            <FlowChart
              rows={[
                [{ title: 'General — any flow (slide 10)', md: md`$\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$`, tone: 'indigo' }],
                [
                  { title: 'Steady compressible (slide 10)', md: md`$\partial\rho/\partial t = 0$ ⇒ $\nabla\cdot\rho\mathbf V = 0$; $\rho$ may vary in space`, tone: 'cyan' },
                  { title: 'Incompressible, steady or unsteady (slide 11)', md: md`$\rho$ = const ⇒ $\nabla\cdot\mathbf V = 0$`, tone: 'emerald' },
                ],
              ]}
              arrowLabels={['drop the terms that vanish']}
            />
          </Figure>
          <Supplement title="Same stretch, different squeeze — watch the area">
            <ElementAreaDemo />
          </Supplement>
        </Step>

        <Step kind="equations" src={L9_11}>
          <Derivation
            title="From the general equation to ∇·V = 0 (slide 11)"
            steps={[
              { md: md`Start from $\pd{\rho}{t} + \nabla\cdot\rho\mathbf V = 0$, restated at the top of slide 11.`, why: 'valid for any flow' },
              { md: md`Incompressible: $\rho$ = constant, so $\pd{\rho}{t} = 0$ and $\nabla\cdot\rho\mathbf V = \rho\,\nabla\cdot\mathbf V$.`, why: 'ρ varies neither in time nor in space' },
              { md: md`$\rho\,\nabla\cdot\mathbf V = 0$ with $\rho \neq 0$ ⇒ $\nabla\cdot\mathbf V = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0$.`, why: 'divide by ρ' },
              { md: md`No $\partial/\partial t$ survives, so the result holds **at every instant** — steady and unsteady incompressible flow alike.`, why: 'blue label on slide 11' },
            ]}
          />
          <FormulaCard id="cont-incomp" />
          <FormulaCard id="cont-2d" />
          <FormulaCard id="missing-comp" />
          <Callout kind="warning">
            <Md>{md`**"Zero somewhere" is not enough.** A field with $\nabla\cdot\mathbf V = x + y$ vanishes on the line $y = -x$, but it is **not** a possible incompressible flow: continuity must hold identically, at every point and every instant. Also, in 3-D never forget $\partial w/\partial z$.`}</Md>
          </Callout>
          <FlowSteps
            tone="emerald"
            steps={[
              { title: 'Test: is the flow possible?', md: md`Differentiate $u$ with $x$, $v$ with $y$, $w$ with $z$ (others fixed); add; simplify. Identically zero ⇒ possible incompressible flow; otherwise impossible (state where it fails).` },
              { title: 'Missing component', md: md`Write continuity for the unknown derivative, integrate with the other variables held fixed, add $f(\ldots)$ of those variables.` },
              { title: 'Fix the function', md: md`Use the extra condition given (wall, axis, symmetry plane, a known value). With no condition, keep $f$ in the answer.` },
              { title: 'Check', md: md`Substitute back: the three normal gradients must add to zero.` },
            ]}
          />
          <Callout kind="note" title="Same equation in the other course books">
            <Md>{md`Fox quotes the plane, steady, incompressible form as Eq. 7.1 at the start of the dimensional-analysis chapter (Section 7.1) and nondimensionalises it on the same page; Wilkes uses the constant-density form (Eq. 9.6, with velocity components $v_x, v_y, v_z$) as the starting point for time-averaging in turbulent flow.`}</Md>
            <div className="mt-2">
              <SourceChips src={[{ doc: 'fox', pages: '246', note: 'Eq. (7.1)' }, { doc: 'wilkes', pages: '484', note: 'Eq. (9.6)' }]} size="xs" />
            </div>
          </Callout>
        </Step>

        <Step kind="example">
          <Md>{md`Three exam-style examples (written for this platform): a straight check of a 3-D field, then a missing component in 2-D and in 3-D.`}</Md>
          <ExampleCard id="ex-check-3d" />
          <ExampleCard id="ex-missing-v" />
          <ExampleCard id="ex-missing-w" />
        </Step>

        <Step kind="interactive">
          <DivergenceChecker />
          <MissingComponentFinder />
        </Step>

        <Step kind="practice">
          <PracticeList concept="incompressible-continuity" />
          <QuickCheck ids={['q-ic-3d', 'q-ic-integration']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Incompressible: $\nabla\cdot\mathbf V = \pd{u}{x} + \pd{v}{y} + \pd{w}{z} = 0$ — valid for **steady and unsteady** flow (slide 11).`,
              md`Only the **normal** gradients enter; cross gradients ($\partial u/\partial y$, $\partial v/\partial x$) shear and rotate elements without changing their volume.`,
              md`A possible flow must give zero **identically** — at every point, every instant, and including $\partial w/\partial z$ in 3-D.`,
              md`Missing component: integrate, add an arbitrary **function** of the variables held fixed ($f(x)$ in 2-D, $f(x, y)$ in 3-D), then use the boundary condition.`,
              md`Steady compressible flow obeys $\nabla\cdot\rho\mathbf V = 0$, **not** $\nabla\cdot\mathbf V = 0$ — don't mix the two up.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================ Concept 3 ============================ */}
      <Concept id="cylindrical-continuity">
        <Step kind="intro" src={L9_11}>
          <Md>{md`Many flows have an axis: flow in pipes, swirling flows, vortices, sources and sinks, flow around cylinders, radial flow between discs. For them Cartesian coordinates are clumsy, and slide 11 rewrites continuity in **cylindrical polar coordinates** $(r, \theta, z)$: $r$ is the distance from the $z$-axis, $\theta$ the angle measured from the $x$-direction, $z$ the axial coordinate, and

$$
\mathbf V = v_r\,\hat{\mathbf e}_r + v_\theta\,\hat{\mathbf e}_\theta + v_z\,\hat{\mathbf e}_z
$$

The slide stacks three forms: the **general** equation (with $\partial\rho/\partial t$), the same **without** $\partial\rho/\partial t$, and the form with $\rho$ **removed**. None of the three is labelled on the slide; by analogy with the labelled Cartesian equations (slide 10 and the top of slide 11) the second is the **steady (compressible)** form and the third the **incompressible** form (steady or unsteady).`}</Md>
          <Callout kind="note">
            <Md>{md`Lecture 10 (slide 2) reuses the plane version — no $z$-terms — to define the stream function in polar coordinates, and Lecture 12 applies it to sources, sinks and vortices.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Drop a stone in a pond: the ring of ripples gets **longer** as it spreads. If water flows radially outward, each larger circle has more "doorway" for the fluid to pass through, so the same flow rate needs a smaller speed — the speed of a source must fall like $1/r$.

That single geometric fact produces both extra factors in the cylindrical equation:

- **$r$ inside the radial derivative.** The outer face of a ring-shaped element is longer than the inner face, by the factor $(r + \delta r)/r$. A *uniform* outward velocity therefore carries more fluid out than in. Continuity compares the **flow** $r\,v_r$, not the speed $v_r$, across the element: $\frac{1}{r}\partial(r v_r)/\partial r$.
- **$1/r$ before the $\theta$-derivative.** A step $\delta\theta$ around the circle is a distance $r\,\delta\theta$, so the change of $v_\theta$ per metre along the circle is $\frac{1}{r}\partial v_\theta/\partial\theta$.
- **$z$ is plain Cartesian** — nothing changes along the axis.`}</Md>
        </Step>

        <Step kind="visual" src={L9_11}>
          <Figure caption="Cylindrical polar coordinates: P lies at radius r from the z-axis and angle θ from the x-direction; v_r, v_θ, v_z act along the unit vectors ê_r, ê_θ, ê_z (inset). Drag θ to see ê_r and ê_θ turn." src={L9_11}>
            <CylCoordsFigure />
          </Figure>
          <Supplement title="Why the r factors appear — flow through a ring element">
            <PolarElementDiagram />
          </Supplement>
        </Step>

        <Step kind="derivation" title="Derivation — mass balance on a ring element">
          <Derivation
            title="Cylindrical continuity from a sector element"
            steps={[
              { md: md`Element between $r$ and $r + \delta r$, $\theta$ and $\theta + \delta\theta$, $z$ and $z + \delta z$; its volume is $r\,\delta r\,\delta\theta\,\delta z$ (to first order).`, why: 'arc length r δθ' },
              { md: md`**Radial faces.** Inner face area $r\,\delta\theta\,\delta z$; outer face area $(r + \delta r)\,\delta\theta\,\delta z$. Mass in: $(r\rho v_r)\,\delta\theta\,\delta z$; out: $\Big[r\rho v_r + \pd{(r\rho v_r)}{r}\delta r\Big]\delta\theta\,\delta z$. Net outflow: $\pd{(r\rho v_r)}{r}\,\delta r\,\delta\theta\,\delta z$.`, why: 'r changes with the face, so it stays inside the derivative' },
              { md: md`**Angular faces** (area $\delta r\,\delta z$, normal along $\hat{\mathbf e}_\theta$): net outflow $\pd{(\rho v_\theta)}{\theta}\,\delta\theta\,\delta r\,\delta z$.`, why: 'face area independent of θ' },
              { md: md`**Axial faces** (area $r\,\delta\theta\,\delta r$): net outflow $\pd{(\rho v_z)}{z}\,\delta z\;r\,\delta\theta\,\delta r$.`, why: 'as in Cartesian coordinates' },
              {
                md: md`Accumulation $\pd{\rho}{t}\,r\,\delta r\,\delta\theta\,\delta z$ plus all net outflows $= 0$; divide by $r\,\delta r\,\delta\theta\,\delta z$:

$$
\pd{\rho}{t} + \frac{1}{r}\pd{(r\rho v_r)}{r} + \frac{1}{r}\pd{(\rho v_\theta)}{\theta} + \pd{(\rho v_z)}{z} = 0
$$`,
                why: 'the general form on slide 11',
              },
            ]}
          />
        </Step>

        <Step kind="equations" src={L9_11}>
          <FormulaCard id="cyl-velocity" />
          <FormulaCard id="cyl-general" />
          <FormulaCard id="cyl-steady" />
          <FormulaCard id="cyl-incomp" />
          <Callout kind="warning">
            <Md>{md`The cylindrical equation is **not** the Cartesian one with new letters: $\partial v_r/\partial r + \partial v_\theta/\partial\theta + \partial v_z/\partial z$ is wrong. Units give it away — $\partial v_\theta/\partial\theta$ is in m/s (θ is dimensionless), so it needs the $1/r$ to become s⁻¹.`}</Md>
          </Callout>
          <FormulaCard id="cyl-plane" />
          <FormulaCard id="polar-transform" />
          <Callout kind="exam">
            <Md>{md`Integrating in polar coordinates: from $\pd{(r v_r)}{r} = g(r, \theta)$ you get $v_r = \frac{1}{r}\int g\,dr + \frac{f(\theta)}{r}$ — the arbitrary function is divided by $r$. A body surface ($v_r = 0$ at $r = a$) or a finite velocity on the axis usually removes it.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <Md>{md`Three supplementary examples: the classic plane flows of Lec 12, a missing component around a body, and a steady **compressible** radial flow that uses the second (steady) form.`}</Md>
          <ExampleCard id="ex-source-vortex" />
          <ExampleCard id="ex-cylinder-vr" />
          <ExampleCard id="ex-radial-gas" />
        </Step>

        <Step kind="interactive">
          <CylindricalChecker />
        </Step>

        <Step kind="practice">
          <PracticeList concept="cylindrical-continuity" />
          <QuickCheck ids={['q-cy-uniform', 'q-cy-term']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`General: $\pd{\rho}{t} + \frac{1}{r}\pd{(r\rho v_r)}{r} + \frac{1}{r}\pd{(\rho v_\theta)}{\theta} + \pd{(\rho v_z)}{z} = 0$; drop $\partial\rho/\partial t$ for steady flow; remove $\rho$ for incompressible flow (slide 11).`,
              md`The $r$ inside $\partial(r v_r)/\partial r$ is the growing face area; the $1/r$ before $\partial/\partial\theta$ is the arc length $r\,\delta\theta$.`,
              md`$\frac{1}{r}\pd{(r v_r)}{r} = \pd{v_r}{r} + \frac{v_r}{r}$ — a uniform $v_r$ is **not** divergence-free.`,
              md`Sources ($v_r \propto 1/r$), free vortices ($v_\theta \propto 1/r$) and rigid rotation satisfy continuity for $r > 0$.`,
              md`When integrating, the arbitrary function appears as $f(\theta)/r$ or $f(r)$ — fix it with a wall or axis condition.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
