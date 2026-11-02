import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FormulaCard, Md, md, PracticeList, QuickCheck, Step, Supplement,
  Tabs, Takeaways,
} from '@/kit'
import { SlideSixteenSketch } from '../sims/superposition/SlideSixteenSketch'
import { SuperpositionTriptych } from '../sims/superposition/SuperpositionTriptych'
import { VectorAdditionSim } from '../sims/superposition/VectorAdditionSim'
import { GraphicalAddition } from '../sims/superposition/GraphicalAddition'
import { HalfBodyFigure } from '../sims/superposition/HalfBodyFigure'
import { IncreasingM } from '../sims/superposition/IncreasingM'
import { HalfBodyDesigner } from '../sims/superposition/HalfBodyDesigner'
import { AxisCpPlot, PressureArrows, SurfaceCpPlot, SurfaceExplorer } from '../sims/superposition/SurfacePressure'

const S2: Src = { doc: 'lec12', pages: '2' }
const S8: Src = { doc: 'lec12', pages: '8' }
const S10: Src = { doc: 'lec12', pages: '10' }
const S16: Src = { doc: 'lec12', pages: '16' }
const S17: Src = { doc: 'lec12', pages: '17' }
const S1617: Src = { doc: 'lec12', pages: '16–17' }
const S18: Src = { doc: 'lec12', pages: '18' }

/* ------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'superposition',
  unit: 'B',
  title: 'Superposition & the Half-Body',
  subtitle:
    'Add a uniform stream to a line source and a blunt-nosed body appears — its stagnation point, shape, speeds and pressures all follow from one summed stream function.',
  minutes: 80,
  sources: [{ doc: 'lec12', pages: '16–18' }],
  concepts: [
    {
      id: 'superposition-method',
      title: 'The method of superposition',
      src: S16,
      summary: 'Laplace’s equation is linear, so φ, ψ and velocities of elementary flows add: uniform flow + source gives ψ = Ur sinθ + (m/2π)θ.',
    },
    {
      id: 'half-body-shape',
      title: 'Half-body: stagnation point & dividing streamline',
      src: S1617,
      summary: 'Stagnation point at r = b = m/2πU, θ = π; dividing streamline ψ = m/2 = πbU gives r = b(π − θ)/sinθ, width → 2πb.',
    },
    {
      id: 'half-body-pressure',
      title: 'Velocity and pressure on the half-body',
      src: S18,
      summary: 'v_r = U cosθ + m/2πr, v_θ = −U sinθ, V² = U²(1 + 2(b/r)cosθ + b²/r²); pressure from p₀ + ½ρU² = p + ½ρV².',
    },
  ],
  sourceNote: md`**Primary source:** Lecture 12, slides 16–18 — the method of superposition, the stagnation point, the streamline through it and the
  velocity/pressure field of *uniform flow + source*. The two building blocks are recapped from slide 8 (uniform flow) and slide 10
  (source). Lecture 12 prints **no equation numbers**, and the name **half-body** (often *Rankine half-body*) is the standard textbook
  name for the shape on slide 17, not a word printed on the slides. The surface-speed extremes, the pressure coefficient, the
  graphical construction and all numerical examples are supplementary (marked ✦).`,
}

/* ------------------------------------------------------------------ formulas */

export const formulas: FormulaDef[] = [
  {
    id: 'sp-principle',
    name: 'Superposition principle for plane potential flows',
    tex: md`\phi = \phi_1 + \phi_2,\qquad \psi = \psi_1 + \psi_2,\qquad u = u_1 + u_2,\quad v = v_1 + v_2`,
    vars: [
      { sym: md`\phi_1,\ \phi_2`, desc: md`velocity potentials of two elementary potential flows (each satisfies $\nabla^2\phi_i = 0$)`, units: md`\mathrm{m^2/s}` },
      { sym: md`\psi_1,\ \psi_2`, desc: md`their stream functions (each satisfies $\nabla^2\psi_i = 0$ in plane irrotational flow)`, units: md`\mathrm{m^2/s}` },
      { sym: md`u_i,\ v_i`, desc: md`$x$- and $y$-velocity components of flow $i$`, units: md`\mathrm{m/s}` },
      { sym: md`\phi,\ \psi,\ u,\ v`, desc: 'potential, stream function and velocity components of the combined flow', units: md`\mathrm{m^2/s},\ \mathrm{m/s}` },
    ],
    conditions: [
      md`every ingredient is a **potential flow**: inviscid, incompressible and irrotational, so it obeys the **linear** Laplace equation`,
      md`plane (2-D) flow whenever $\psi$ is used; all flows written in the same coordinate system`,
      md`**not valid for pressure** — $p$ comes afterwards from Bernoulli, which contains $V^2$`,
    ],
    use: md`Add the $\phi$'s (or the $\psi$'s) term by term, differentiate the sum for the velocity, then locate stagnation points
    ($\vb{V} = 0$), draw streamlines ($\psi$ = const) and finally get $p$ from Bernoulli. The sum is an **exact** potential flow — no
    small-parameter approximation is involved.`,
  },
  {
    id: 'sp-uniform',
    name: 'Ingredient 1 — uniform flow along +x (polar form)',
    tex: md`\phi = Ux = Ur\cos\theta,\qquad \psi = Uy = Ur\sin\theta`,
    vars: [
      { sym: 'U', desc: md`uniform free-stream speed, directed along $+x$`, units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: md`polar coordinates about the origin: $x = r\cos\theta$, $y = r\sin\theta$, $\theta$ counter-clockwise from $+x$`, units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function of the uniform stream', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [md`straight, parallel streamlines and the same speed $U$ everywhere (slide 8)`, md`integration constants set to zero`],
    use: md`Rewrite $Ux$ and $Uy$ in polar form so they can be added directly to the source terms, which are naturally polar.`,
    src: [S8, S16],
  },
  {
    id: 'sp-source',
    name: 'Ingredient 2 — line source at the origin',
    tex: md`\phi = \frac{m}{2\pi}\ln r,\qquad \psi = \frac{m}{2\pi}\theta,\qquad v_r = \frac{m}{2\pi r},\quad v_\theta = 0`,
    vars: [
      { sym: 'm', desc: 'source strength: volume flow rate leaving the line source per unit length of the line', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'distance from the source line and polar angle', units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`v_r,\ v_\theta`, desc: 'radial and tangential velocity components', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`purely radial flow from continuity $(2\pi r)v_r = m$ (slide 10)`,
      md`$m > 0$ is a source, $m < 0$ a sink (standard convention)`,
      md`singular at $r = 0$ ($v_r \to \infty$): valid only away from the source line`,
    ],
    use: md`The second building block of the half-body. Near the origin this term dominates, so streamlines of the sum leave the source almost radially.`,
    src: S10,
  },
  {
    id: 'hb-psi',
    name: 'Stream function of uniform flow + source',
    key: true,
    tex: md`\psi = \psi_{\text{uniform flow}} + \psi_{\text{source}} = Ur\sin\theta + \frac{m}{2\pi}\theta`,
    vars: [
      { sym: md`\psi`, desc: 'stream function of the combined flow', units: md`\mathrm{m^2/s}` },
      { sym: 'U', desc: md`free-stream speed (along $+x$)`, units: md`\mathrm{m/s}` },
      { sym: 'm', desc: 'source strength (volume flow per unit length)', units: md`\mathrm{m^2/s}` },
      { sym: 'r', desc: 'distance from the source', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: md`polar angle from $+x$, counter-clockwise; take $0 \le \theta < 2\pi$ so that its $2\pi$ jump lies on the $+x$ axis inside the body`, units: md`\mathrm{rad}` },
    ],
    conditions: [
      'steady, inviscid, incompressible, irrotational plane flow',
      md`source at the origin, uniform stream along $+x$`,
    ],
    use: md`Contours $\psi$ = const are the streamlines. Differentiate to get $v_r = \frac{1}{r}\pd{\psi}{\theta}$ and $v_\theta = -\pd{\psi}{r}$ (slide 18).`,
    src: S16,
  },
  {
    id: 'hb-phi',
    name: 'Velocity potential of uniform flow + source',
    tex: md`\phi = Ur\cos\theta + \frac{m}{2\pi}\ln r`,
    vars: [
      { sym: md`\phi`, desc: 'velocity potential of the combined flow', units: md`\mathrm{m^2/s}` },
      { sym: md`U,\ m`, desc: 'free-stream speed and source strength', units: md`\mathrm{m/s},\ \mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates about the source', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: ['same as for ψ; φ exists because the flow is irrotational', md`singular at $r = 0$`],
    use: md`Equipotentials $\phi$ = const cut the streamlines at right angles (flow net). $v_r = \pd{\phi}{r}$ and $v_\theta = \frac{1}{r}\pd{\phi}{\theta}$ give the same velocities as $\psi$.`,
    src: S16,
  },
  {
    id: 'sp-cartesian',
    name: 'Cartesian velocity of uniform flow + source',
    tex: md`u = U + \frac{m}{2\pi}\,\frac{x}{x^2 + y^2},\qquad v = \frac{m}{2\pi}\,\frac{y}{x^2 + y^2}`,
    vars: [
      { sym: md`u,\ v`, desc: md`velocity components along $x$ and $y$`, units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates with the source at the origin', units: md`\mathrm{m}` },
      { sym: md`U,\ m`, desc: 'free-stream speed and source strength', units: md`\mathrm{m/s},\ \mathrm{m^2/s}` },
    ],
    conditions: ['same assumptions as the polar form', md`not defined at the origin $x = y = 0$`],
    use: md`The uniform part adds $U$ to $u$ only; the source part is $\frac{m}{2\pi r}$ pointing radially outward, resolved into $x$ and $y$.
    Convenient when a point is given in $(x, y)$, or for coding a flow plot.`,
  },
  {
    id: 'hb-stag',
    name: 'Stagnation point of uniform flow + source',
    key: true,
    tex: md`v_r = \frac{m}{2\pi r},\qquad U = \frac{m}{2\pi b}\quad\Rightarrow\quad b = \frac{m}{2\pi U},\qquad \text{located at } r = b,\ \theta = \pi`,
    vars: [
      { sym: 'b', desc: 'distance from the source (origin) to the stagnation point, which lies upstream on the negative $x$-axis', units: md`\mathrm{m}` },
      { sym: md`v_r`, desc: 'radial velocity induced by the source at radius $r$', units: md`\mathrm{m/s}` },
      { sym: md`U,\ m`, desc: 'free-stream speed and source strength', units: md`\mathrm{m/s},\ \mathrm{m^2/s}` },
    ],
    conditions: [
      md`on the negative $x$-axis ($\theta = \pi$) the stream's radial component is $U\cos\pi = -U$, i.e. towards the source`,
      md`the stagnation point is where the source outflow $m/2\pi r$ has decayed to exactly $U$`,
    ],
    use: md`Find $b$ first — every length of the half-body (nose position, widths, shape) scales with it.`,
    src: S16,
  },
  {
    id: 'hb-psistag',
    name: 'Stream-function value through the stagnation point',
    tex: md`\psi_{\text{stagnation}} = \frac{m}{2} = \pi bU`,
    vars: [
      { sym: md`\psi_{\text{stagnation}}`, desc: 'value of ψ on every streamline that passes through the stagnation point', units: md`\mathrm{m^2/s}` },
      { sym: md`m,\ b,\ U`, desc: 'source strength, source–stagnation distance, free-stream speed', units: md`\mathrm{m^2/s},\ \mathrm{m},\ \mathrm{m/s}` },
    ],
    conditions: [md`evaluate $\psi = Ur\sin\theta + \frac{m}{2\pi}\theta$ at $r = b$, $\theta = \pi$ (with $0 \le \theta < 2\pi$)`, md`$m = 2\pi bU$ turns $m/2$ into $\pi bU$`],
    use: md`This number labels the **dividing streamline** (the body surface). The flow carried between it and any other streamline is the difference of the two $\psi$ values.`,
    src: S1617,
  },
  {
    id: 'hb-dividing',
    name: 'Equation of the streamline through the stagnation point',
    key: true,
    tex: md`\pi bU = Ur\sin\theta + bU\theta`,
    vars: [
      { sym: md`r,\ \theta`, desc: 'polar coordinates of points on the dividing streamline', units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`b,\ U`, desc: md`source–stagnation distance and free-stream speed; the source term $\frac{m}{2\pi}$ has been written as $bU$`, units: md`\mathrm{m},\ \mathrm{m/s}` },
    ],
    conditions: [md`follows from $\psi = \psi_{\text{stagnation}}$ with $\frac{m}{2\pi} = bU$`],
    use: md`Divide by $U$ and solve for $r$ — that gives the body shape (next card).`,
    src: S17,
  },
  {
    id: 'hb-body',
    name: 'Shape of the half-body (dividing streamline)',
    key: true,
    tex: md`r = \frac{b(\pi - \theta)}{\sin\theta}\qquad\Longleftrightarrow\qquad y = b(\pi - \theta)`,
    vars: [
      { sym: 'r', desc: 'distance from the source to the body surface along the ray at angle θ', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: md`polar angle, $0 < \theta < 2\pi$: $\theta < \pi$ upper surface, $\theta > \pi$ lower surface ($y < 0$)`, units: md`\mathrm{rad}` },
      { sym: md`y = r\sin\theta`, desc: 'height of the surface point above the axis', units: md`\mathrm{m}` },
      { sym: 'b', desc: md`$m/2\pi U$`, units: md`\mathrm{m}` },
    ],
    conditions: [md`as $\theta \to \pi$, $\sin\theta \approx \pi - \theta$ so $r \to b$: the nose (stagnation point)`, md`$x = r\cos\theta$ gives the abscissa`],
    use: md`Pick a ray $\theta$, compute $r$ (or $y$ directly), then $x = r\cos\theta$. The $y$ form is the quickest way to the body thickness.`,
    src: S17,
  },
  {
    id: 'hb-width',
    name: 'Asymptotic width of the half-body',
    tex: md`y \to \pm\pi b\quad(\theta \to 0^{+},\ \theta \to 2\pi^{-}),\qquad \text{total width} \to 2\pi b = \frac{m}{U}`,
    vars: [
      { sym: md`\pi b`, desc: 'half-width of the body far downstream (dimensioned on the slide-17 figure)', units: md`\mathrm{m}` },
      { sym: md`2\pi b`, desc: 'total thickness far downstream', units: md`\mathrm{m}` },
      { sym: md`m/U`, desc: 'same thickness written with the source strength', units: md`\mathrm{m}` },
    ],
    conditions: [md`limit of $y = b(\pi - \theta)$ far downstream`, md`the body is open (semi-infinite): it only approaches $\pm\pi b$, reaching 90 % at $x \approx 8.7b$`],
    use: md`Design rule: a required final thickness $W$ in a stream $U$ needs $m = UW$, and the nose sits $b = W/2\pi$ ahead of the source.`,
    src: { doc: 'lec12', pages: '17', note: 'figure: πb above and below the axis' },
  },
  {
    id: 'hb-vel',
    name: 'Velocity components of the half-body flow',
    key: true,
    tex: md`v_r = \frac{1}{r}\pd{\psi}{\theta} = U\cos\theta + \frac{m}{2\pi r},\qquad v_\theta = -\pd{\psi}{r} = -U\sin\theta`,
    vars: [
      { sym: md`v_r`, desc: 'radial velocity (positive away from the source)', units: md`\mathrm{m/s}` },
      { sym: md`v_\theta`, desc: 'tangential velocity (positive counter-clockwise)', units: md`\mathrm{m/s}` },
      { sym: md`U,\ m,\ r,\ \theta`, desc: 'free-stream speed, source strength, polar coordinates', units: md`\mathrm{m/s},\ \mathrm{m^2/s},\ \mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: ['polar stream-function relations for plane flow', md`$r \neq 0$`],
    use: md`The uniform stream contributes $(U\cos\theta, -U\sin\theta)$; only $v_r$ feels the source. Setting both to zero recovers the stagnation point.`,
    src: S18,
  },
  {
    id: 'hb-V2',
    name: 'Speed squared',
    tex: md`V^2 = v_r^2 + v_\theta^2 = U^2 + \frac{Um\cos\theta}{\pi r} + \left(\frac{m}{2\pi r}\right)^2`,
    vars: [
      { sym: 'V', desc: 'local speed', units: md`\mathrm{m/s}` },
      { sym: md`v_r,\ v_\theta`, desc: 'polar velocity components', units: md`\mathrm{m/s}` },
      { sym: md`U,\ m,\ r,\ \theta`, desc: 'as before', units: md`\mathrm{m/s},\ \mathrm{m^2/s},\ \mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [md`$\cos^2\theta + \sin^2\theta = 1$ collapses the $U^2$ terms`],
    use: md`The middle term is the **cross term** $2(U\cos\theta)\frac{m}{2\pi r}$ — it is why speeds of the two ingredients do not simply add.`,
    src: S18,
  },
  {
    id: 'hb-V2b',
    name: 'Speed squared in terms of b/r',
    key: true,
    tex: md`V^2 = U^2\left(1 + 2\,\frac{b}{r}\cos\theta + \frac{b^2}{r^2}\right)`,
    vars: [
      { sym: 'V', desc: 'local speed', units: md`\mathrm{m/s}` },
      { sym: md`b/r`, desc: md`dimensionless distance ($b = m/2\pi U$)`, units: '-' },
      { sym: md`U,\ \theta`, desc: 'free-stream speed and polar angle', units: md`\mathrm{m/s},\ \mathrm{rad}` },
    ],
    conditions: [md`obtained by substituting $m = 2\pi bU$`, md`check: $r = b$, $\theta = \pi$ gives $V^2 = U^2(1 - 2 + 1) = 0$ (the stagnation point)`],
    use: md`$V/U$ depends only on $b/r$ and $\theta$ — the whole flow is self-similar in $b$. On the body put $b/r = \sin\theta/(\pi - \theta)$.`,
    src: S18,
  },
  {
    id: 'hb-bern',
    name: 'Bernoulli equation for the pressure field',
    key: true,
    tex: md`p_0 + \tfrac{1}{2}\rho U^2 = p + \tfrac{1}{2}\rho V^2`,
    vars: [
      { sym: md`p_0`, desc: 'pressure far from the body, in the free stream where the speed is $U$', units: md`\mathrm{Pa}` },
      { sym: 'p', desc: 'pressure at the point of interest', units: md`\mathrm{Pa}` },
      { sym: md`V`, desc: 'speed at that point (from the previous card)', units: md`\mathrm{m/s}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: [
      'steady, inviscid, incompressible flow',
      md`**irrotational** — so the Bernoulli constant is the same on every streamline and the equation links *any* two points`,
      md`elevation terms omitted (horizontal plane, or gravity ignored), as printed on slide 18`,
    ],
    use: md`$p = p_0 + \tfrac12\rho(U^2 - V^2)$. Maximum pressure $p_0 + \tfrac12\rho U^2$ at the stagnation point; lowest pressure where $V$ is largest.`,
    src: S18,
  },
  {
    id: 'hb-cp',
    name: 'Pressure coefficient of the half-body flow',
    tex: md`C_p = \frac{p - p_0}{\tfrac12\rho U^2} = 1 - \frac{V^2}{U^2} = -\left(2\,\frac{b}{r}\cos\theta + \frac{b^2}{r^2}\right) = -\frac{b\,(2x + b)}{x^2 + y^2}`,
    vars: [
      { sym: md`C_p`, desc: 'pressure coefficient (dimensionless pressure rise above the free stream)', units: '-' },
      { sym: md`x,\ y`, desc: 'Cartesian position, source at the origin', units: md`\mathrm{m}` },
      { sym: md`p,\ p_0,\ \rho,\ U,\ V`, desc: 'as in Bernoulli', units: md`\mathrm{Pa},\ \mathrm{kg/m^3},\ \mathrm{m/s}` },
    ],
    conditions: ['same assumptions as Bernoulli', md`$2\frac{b}{r}\cos\theta = \frac{2bx}{r^2}$ gives the Cartesian form`],
    use: md`$C_p = 1$ at the stagnation point. $C_p > 0$ (slower than $U$) exactly where $x < -b/2$ and $C_p < 0$ (faster than $U$) where $x > -b/2$ — everywhere in the field.`,
  },
  {
    id: 'hb-surface',
    name: 'Speed on the body surface',
    tex: md`\left.\frac{V^2}{U^2}\right|_{\text{body}} = 1 + \frac{\sin 2\theta}{\pi - \theta} + \frac{\sin^2\theta}{(\pi - \theta)^2},\qquad \frac{V_{\max}}{U} \approx 1.26\ \ \text{at}\ \ \theta \approx 63^\circ`,
    vars: [
      { sym: md`\theta`, desc: md`polar angle of the surface point ($\pi$ = nose, $\to 0$ far downstream)`, units: md`\mathrm{rad}` },
      { sym: md`V_{\max}`, desc: 'largest speed on the surface (numerical maximum: 1.2596U at θ = 62.96°)', units: md`\mathrm{m/s}` },
    ],
    conditions: [md`substitute $b/r = \sin\theta/(\pi - \theta)$ (the body equation) into $V^2/U^2$`],
    use: md`Surface landmarks: $V = 0$ at the nose ($\theta = 180^\circ$); $V = U$ at $\theta \approx 113.2^\circ$ ($x = -b/2$); $V = 1.185U$ above the source ($\theta = 90^\circ$); $V_{\max} \approx 1.26U$, $C_{p,\min} \approx -0.59$ at $\theta \approx 63^\circ$; $V \to U$ far downstream.`,
  },
]

/* ------------------------------------------------------------------ worked examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-sp-velocity',
    concept: 'superposition-method',
    title: 'Velocity, ψ and φ at a point by superposition',
    difficulty: 1,
    given: md`Uniform flow $U = 4$ m/s along $+x$ plus a line source of strength $m = 8$ m²/s at the origin.`,
    find: md`At $P = (1, 1)$ m: the velocity due to each flow, the total velocity, and the values of $\psi$ and $\phi$.`,
    assumptions: md`steady, incompressible, inviscid, irrotational plane flow; constants in $\phi$, $\psi$ set to zero; $\theta$ counter-clockwise from $+x$.`,
    steps: [
      {
        title: 'Polar coordinates of P',
        md: md`$r = \sqrt{1^2 + 1^2} = 1.414$ m, $\ \theta = \tan^{-1}(1/1) = 45^\circ = \pi/4$. Source constant $\dfrac{m}{2\pi} = \dfrac{8}{2\pi} = 1.273$ m²/s.`,
      },
      { title: 'Uniform-flow contribution', md: md`$\vb{V}_U = (U,\ 0) = (4,\ 0)$ m/s — the same at every point.` },
      {
        title: 'Source contribution',
        md: md`Radially outward with $v_r = \dfrac{m}{2\pi r} = \dfrac{1.273}{1.414} = 0.900$ m/s along $45^\circ$:
        $u_s = 0.900\cos 45^\circ = 0.637$ m/s, $\ v_s = 0.900\sin 45^\circ = 0.637$ m/s.
        Cartesian check: $u_s = \dfrac{m}{2\pi}\dfrac{x}{x^2 + y^2} = 1.273 \times \tfrac12 = 0.637$ m/s ✓`,
      },
      {
        title: 'Add the vectors component by component',
        md: md`$u = 4 + 0.637 = 4.637$ m/s, $\quad v = 0 + 0.637 = 0.637$ m/s

        $$
        \lvert\vb{V}\rvert = \sqrt{4.637^2 + 0.637^2} = 4.680\ \text{m/s},\qquad \alpha = \tan^{-1}\frac{0.637}{4.637} = 7.8^\circ
        $$

        Note that $4.680 \neq 4 + 0.900 = 4.900$: the magnitudes do not add.`,
      },
      {
        title: 'Same answer from the summed ψ (polar form, slide 18)',
        md: md`$v_r = U\cos\theta + \dfrac{m}{2\pi r} = 4(0.7071) + 0.900 = 3.729$ m/s, $\quad v_\theta = -U\sin\theta = -2.828$ m/s,
        so $V = \sqrt{3.729^2 + 2.828^2} = 4.680$ m/s ✓`,
      },
      {
        title: 'Stream function and velocity potential',
        md: md`$\psi = Ur\sin\theta + \dfrac{m}{2\pi}\theta = 4(1.414)(0.7071) + 1.273\left(\dfrac{\pi}{4}\right) = 4.000 + 1.000 = 5.00$ m²/s

        $\phi = Ur\cos\theta + \dfrac{m}{2\pi}\ln r = 4.000 + 1.273\ln 1.414 = 4.000 + 0.441 = 4.44$ m²/s`,
      },
    ],
    answer: md`$\vb{V}_U = (4,\ 0)$, $\vb{V}_s = (0.637,\ 0.637)$, $\vb{V} = (4.637,\ 0.637)$ m/s; $\lvert\vb{V}\rvert = 4.68$ m/s at $7.8^\circ$ above $+x$; $\psi = 5.00$ m²/s, $\phi = 4.44$ m²/s.`,
    insight: 'Velocities superpose as vectors (component by component), speeds do not — and differentiating the summed ψ gives exactly the same answer.',
  },
  {
    id: 'ex-hb-geometry',
    concept: 'half-body-shape',
    title: 'Sizing a half-body: stagnation point, surface value of ψ and widths',
    difficulty: 2,
    given: md`A line source $m = 3.0$ m²/s at the origin in a uniform stream $U = 2.0$ m/s along $+x$.`,
    find: md`(a) the stagnation point; (b) $\psi$ on the body; (c) the half-width directly above the source and far downstream; (d) the surface point on the ray $\theta = 45^\circ$.`,
    assumptions: 'plane potential flow; θ on [0, 2π) measured from +x.',
    steps: [
      { title: 'Length scale (slide 16)', md: md`$b = \dfrac{m}{2\pi U} = \dfrac{3.0}{2\pi(2.0)} = 0.2387$ m` },
      { title: 'Stagnation point', md: md`At $r = b$, $\theta = \pi$: $(x, y) = (-0.239,\ 0)$ m — 0.239 m upstream of the source.` },
      { title: 'Dividing streamline', md: md`$\psi_{\text{stag}} = \dfrac{m}{2} = 1.50$ m²/s. Check: $\pi bU = \pi(0.2387)(2.0) = 1.50$ m²/s ✓` },
      {
        title: 'Widths from y = b(π − θ) (slide 17)',
        md: md`Above the source ($\theta = 90^\circ$): $y = \dfrac{\pi b}{2} = 0.375$ m.
        Far downstream ($\theta \to 0$): $y \to \pi b = 0.750$ m, so the total width $\to 2\pi b = 1.50$ m.
        Mass check: $m/U = 3.0/2.0 = 1.50$ m ✓`,
      },
      {
        title: 'Surface point at θ = 45°',
        md: md`$r = \dfrac{b(\pi - \pi/4)}{\sin 45^\circ} = \dfrac{0.2387 \times 2.356}{0.7071} = 0.795$ m, so $x = r\cos 45^\circ = 0.5625$ m and $y = b\cdot\dfrac{3\pi}{4} = 0.5625$ m.`,
      },
      {
        title: 'Verify it lies on ψ = m/2',
        md: md`$\psi = Uy + \dfrac{m}{2\pi}\theta = 2.0(0.5625) + \dfrac{3.0}{2\pi}\cdot\dfrac{\pi}{4} = 1.125 + 0.375 = 1.50$ m²/s ✓`,
      },
    ],
    answer: md`$b = 0.239$ m; stagnation point at $x = -0.239$ m; $\psi_{\text{body}} = 1.50$ m²/s; half-width $0.375$ m above the source and $\to 0.750$ m downstream (total $1.50$ m $= m/U$); at $\theta = 45^\circ$: $r = 0.795$ m, $(x, y) = (0.5625,\ 0.5625)$ m.`,
    insight: 'Once b is known every geometric feature follows; far downstream the source fluid occupies exactly m/U of width.',
  },
  {
    id: 'ex-hb-design',
    concept: 'half-body-shape',
    title: 'Designing the source for a required body thickness',
    difficulty: 2,
    given: md`A 2-D strut is to have the half-body shape with a total thickness far downstream of $W = 0.40$ m in a stream $U = 5.0$ m/s.`,
    find: md`the source strength $m$, the length $b$ (nose-to-source distance) and $\psi$ on the surface.`,
    steps: [
      { title: 'Thickness gives b', md: md`$2\pi b = W \Rightarrow b = \dfrac{0.40}{2\pi} = 0.0637$ m` },
      { title: 'b gives m', md: md`$m = 2\pi bU = WU = 0.40 \times 5.0 = 2.0$ m²/s` },
      { title: 'Nose position', md: md`The stagnation point is at $x = -b = -63.7$ mm: the source sits 63.7 mm behind the nose.` },
      { title: 'Surface streamline', md: md`$\psi_{\text{body}} = \dfrac{m}{2} = 1.0$ m²/s $\ (= \pi bU = \pi \times 0.0637 \times 5.0 = 1.0$ ✓$)$` },
    ],
    answer: md`$m = 2.0$ m²/s, $b = 63.7$ mm (nose 63.7 mm ahead of the source), $\psi_{\text{body}} = 1.0$ m²/s.`,
    insight: 'Design rule: m = U × (final thickness); the nose stands (final thickness)/2π ahead of the source.',
  },
  {
    id: 'ex-hp-water',
    concept: 'half-body-pressure',
    title: 'Speed and pressure on a half-body in water',
    difficulty: 2,
    given: md`The half-body of the sizing example: $U = 2.0$ m/s, $m = 3.0$ m²/s ($b = 0.2387$ m); water $\rho = 1000$ kg/m³; free-stream pressure $p_0 = 101.3$ kPa.`,
    find: md`$V$ and $p$ (a) at the stagnation point, (b) on the surface directly above the source, (c) at the fastest point of the surface ($\theta \approx 63^\circ$).`,
    assumptions: 'steady, inviscid, incompressible, irrotational; horizontal plane (no elevation terms).',
    steps: [
      {
        title: 'Stagnation point (V = 0)',
        md: md`Bernoulli with $V = 0$: $p_s = p_0 + \tfrac12\rho U^2 = 101\,300 + \tfrac12(1000)(2.0)^2 = 101\,300 + 2000 = 103\,300$ Pa $= 103.3$ kPa ($C_p = +1$).`,
      },
      {
        title: 'Surface point above the source: velocity components',
        md: md`$\theta = 90^\circ$, $r = y = \pi b/2 = 0.375$ m, so $b/r = 2/\pi = 0.637$.
        $v_r = U\cos 90^\circ + \dfrac{m}{2\pi r} = 0 + \dfrac{3.0}{2\pi(0.375)} = 1.273$ m/s, $\quad v_\theta = -U\sin 90^\circ = -2.000$ m/s.`,
      },
      {
        title: 'Speed there (slide 18)',
        md: md`$V^2 = U^2\left(1 + 2\dfrac{b}{r}\cos\theta + \dfrac{b^2}{r^2}\right) = 4.0\,(1 + 0 + 0.405) = 5.621$ m²/s², so $V = 2.371$ m/s $= 1.185U$.
        Check: $\sqrt{1.273^2 + 2.000^2} = 2.371$ m/s ✓`,
      },
      {
        title: 'Pressure there',
        md: md`$p = p_0 + \tfrac12\rho(U^2 - V^2) = 101\,300 + 500\,(4.000 - 5.621) = 101\,300 - 811 = 100\,489$ Pa $\approx 100.49$ kPa; $\ C_p = 1 - 5.621/4.000 = -0.405$.`,
      },
      {
        title: 'Fastest surface point, θ ≈ 62.96° (supplementary result)',
        md: md`$r = \dfrac{b(\pi - \theta)}{\sin\theta} = \dfrac{0.2387 \times 2.0428}{0.8907} = 0.5475$ m;
        $v_r = 2.0(0.4547) + \dfrac{3.0}{2\pi(0.5475)} = 0.909 + 0.872 = 1.781$ m/s, $\ v_\theta = -2.0(0.8907) = -1.781$ m/s;
        $V = 2.519$ m/s $= 1.26U$ and $p = 101\,300 + 500\,(4.000 - 6.346) = 100\,127$ Pa $\approx 100.13$ kPa ($C_p = -0.587$).`,
      },
    ],
    answer: md`Nose: $V = 0$, $p = 103.3$ kPa (the maximum). Above the source: $V = 2.37$ m/s, $p = 100.49$ kPa. Shoulder ($\theta \approx 63^\circ$): $V = 2.52$ m/s (fastest), $p = 100.13$ kPa (lowest on the body).`,
    insight: 'The whole pressure swing on the body is set by ½ρU² = 2.0 kPa: Cp runs from +1 at the nose to about −0.59 on the shoulder, whatever U and m are.',
  },
  {
    id: 'ex-hp-ridge',
    concept: 'half-body-pressure',
    title: 'Wind over a long ridge modelled by the upper half of a half-body',
    difficulty: 3,
    given: md`A long 2-D ridge rises from flat ground and levels off at height $H = 50$ m. Wind far upstream $U = 12$ m/s; air $\rho = 1.2$ kg/m³. Model: the upper half of a half-body, with the ground as the symmetry streamline $y = 0$.`,
    find: md`$b$ and $m$; the position and value of the largest wind speed on the ridge surface and the pressure there; the wind speed and direction at the surface point above the source.`,
    assumptions: 'inviscid, irrotational, steady 2-D flow (no atmospheric boundary layer); the x-axis is a streamline, so it can be replaced by the ground.',
    steps: [
      {
        title: 'Size the half-body',
        md: md`Final height = far-downstream half-width: $\pi b = 50$ m $\Rightarrow b = 15.92$ m; $\ m = 2\pi bU = 2\pi(15.92)(12) = 1200$ m²/s (equivalently $m = U \times 2H = 12 \times 100$).`,
      },
      { title: 'Foot of the ridge', md: md`The stagnation point — the foot of the slope — is at $x = -b = -15.9$ m. The source at the origin is a mathematical device buried inside the hill.` },
      {
        title: 'Fastest wind on the slope (supplementary result θ ≈ 62.96°)',
        md: md`There $b/r = \dfrac{\sin\theta}{\pi - \theta} = \dfrac{0.8907}{2.0428} = 0.4360$, so $r = 36.5$ m, $x = r\cos\theta = 16.6$ m, $y = r\sin\theta = 32.5$ m (65 % of the final height).
        $V_{\max} = 1.2596\,U = 15.1$ m/s.`,
      },
      { title: 'Pressure there', md: md`$p - p_0 = \tfrac12\rho(U^2 - V^2) = 0.6\,(144 - 228.5) = -50.7$ Pa` },
      {
        title: 'Wind above the source (θ = 90°)',
        md: md`$y = \pi b/2 = 25.0$ m. $\ u = v_r\cos\theta - v_\theta\sin\theta = U = 12.0$ m/s and $v = v_r\sin\theta + v_\theta\cos\theta = \dfrac{m}{2\pi r} = \dfrac{1200}{2\pi(25.0)} = 7.64$ m/s,
        so $V = 14.2$ m/s inclined at $\tan^{-1}(7.64/12.0) = 32.5^\circ$ — parallel to the ground slope there, as it must be on a streamline.`,
      },
    ],
    answer: md`$b = 15.9$ m, $m = 1200$ m²/s; fastest wind $15.1$ m/s at about $(16.6,\ 32.5)$ m where $p - p_0 = -51$ Pa; above the source point the wind is $14.2$ m/s blowing $32.5^\circ$ upward along the slope.`,
    insight: 'Any streamline can be a wall: the symmetry line becomes the ground, so half of the half-body models a ridge — the wind speeds up by about 26 % near the brow.',
  },
]

/* ------------------------------------------------------------------ practice */

export const practice: PracticeDef[] = [
  {
    id: 'pr-sp-point',
    concept: 'superposition-method',
    difficulty: 1,
    q: md`A uniform flow $U = 3$ m/s along $+x$ is superposed on a line source $m = 6$ m²/s at the origin. Find $u$, $v$ and $\lvert\vb{V}\rvert$ at the point $(0, 1)$ m, and the values of $\psi$ and $\phi$ there.`,
    hint: md`Directly above the source the source velocity is purely vertical, and $r = 1$ m makes $\ln r = 0$.`,
    answer: md`$u = 3$ m/s, $v = 0.955$ m/s, $\lvert\vb{V}\rvert = 3.15$ m/s; $\psi = 4.50$ m²/s, $\phi = 0$.`,
    solution: md`At $(0, 1)$: $r = 1$ m, $\theta = 90^\circ$.

    - Uniform flow: $(u, v) = (3,\ 0)$ m/s.
    - Source: $v_r = \dfrac{m}{2\pi r} = \dfrac{6}{2\pi(1)} = 0.955$ m/s, radially outward = straight up: $(u, v) = (0,\ 0.955)$ m/s.
    - Sum: $u = 3$ m/s, $v = 0.955$ m/s, $\lvert\vb{V}\rvert = \sqrt{3^2 + 0.955^2} = \sqrt{9.912} = 3.148$ m/s, at $17.7^\circ$ above $+x$.
    - $\psi = Ur\sin\theta + \dfrac{m}{2\pi}\theta = 3(1)(1) + \dfrac{6}{2\pi}\cdot\dfrac{\pi}{2} = 3 + 1.5 = 4.50$ m²/s.
    - $\phi = Ur\cos\theta + \dfrac{m}{2\pi}\ln r = 0 + 0.955\ln 1 = 0$.`,
    check: [
      { label: md`$\lvert\vb{V}\rvert$`, value: 3.148, units: md`\mathrm{m/s}` },
      { label: md`$\psi$`, value: 4.5, units: md`\mathrm{m^2/s}` },
    ],
  },
  {
    id: 'pr-sp-laplace',
    concept: 'superposition-method',
    difficulty: 2,
    q: md`Show that $\psi = Ur\sin\theta + \dfrac{m}{2\pi}\theta$ satisfies Laplace's equation, and explain why the result was guaranteed before doing any algebra.`,
    hint: md`In polar coordinates $\nabla^2\psi = \dfrac{1}{r}\pd{}{r}\left(r\pd{\psi}{r}\right) + \dfrac{1}{r^2}\pd{^2\psi}{\theta^2}$.`,
    answer: md`$\nabla^2\psi = \dfrac{U\sin\theta}{r} - \dfrac{U\sin\theta}{r} = 0$ for $r \neq 0$ — guaranteed because each term is itself harmonic and the Laplacian is linear.`,
    solution: md`- $\pd{\psi}{r} = U\sin\theta$, so $\dfrac{1}{r}\pd{}{r}\left(rU\sin\theta\right) = \dfrac{U\sin\theta}{r}$.
    - $\pd{\psi}{\theta} = Ur\cos\theta + \dfrac{m}{2\pi}$ and $\pd{^2\psi}{\theta^2} = -Ur\sin\theta$, so $\dfrac{1}{r^2}\pd{^2\psi}{\theta^2} = -\dfrac{U\sin\theta}{r}$.
    - Adding: $\nabla^2\psi = 0$ for every $r \neq 0$ ✓

    **Why it had to work:** $Ur\sin\theta = Uy$ satisfies Laplace's equation (uniform flow), and so does $\frac{m}{2\pi}\theta$ (the source; its
    contribution to the Laplacian is identically zero away from $r = 0$). The Laplacian is a *linear* operator, so
    $\nabla^2(\psi_1 + \psi_2) = \nabla^2\psi_1 + \nabla^2\psi_2 = 0$. This is the whole basis of the method of superposition.`,
  },
  {
    id: 'pr-sp-sink',
    concept: 'superposition-method',
    difficulty: 2,
    q: md`Superpose a uniform flow $U = 2$ m/s along $+x$ and a line **sink** $m = -4$ m²/s at the origin. (a) Where is the stagnation point? (b) How wide (far upstream, per unit depth) is the band of oncoming fluid that ends up in the sink?`,
    hint: md`On the $x$-axis $v = 0$ and $u = U + \dfrac{m}{2\pi x}$. With $m < 0$ the sink pulls fluid towards the origin — on which side can that oppose the stream?`,
    answer: md`(a) $x_s = +\dfrac{\lvert m\rvert}{2\pi U} = +0.318$ m, **downstream** of the sink; (b) $w = \lvert m\rvert/U = 2.0$ m.`,
    solution: md`On the $x$-axis $v = 0$ and

    $$
    u = U + \frac{m}{2\pi}\frac{x}{x^2} = U + \frac{m}{2\pi x} = 2 - \frac{4}{2\pi x} = 2 - \frac{0.637}{x}
    $$

    - Upstream ($x < 0$): $-0.637/x > 0$, so $u > 2$ m/s — there the sink pulls fluid *with* the stream; no stagnation point.
    - Downstream ($x > 0$): $u = 0$ at $x = 0.637/2 = 0.318$ m, where the sink pulls fluid back against $U$.

    So $x_s = +\lvert m\rvert/(2\pi U) = 0.318$ m — the mirror image of the source case.

    (b) All the sink's intake $\lvert m\rvert = 4$ m²/s comes from a band that approaches at speed $U$: $Uw = \lvert m\rvert \Rightarrow w = 4/2 = 2.0$ m. The dividing streamline through the stagnation point now encloses the fluid that is *swallowed*.`,
    check: [
      { label: md`stagnation point $x_s$`, value: 0.3183, units: md`\mathrm{m}` },
      { label: 'captured width', value: 2.0, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-hb-basic',
    concept: 'half-body-shape',
    difficulty: 1,
    q: md`A uniform stream $U = 10$ m/s flows past a line source $m = 5$ m²/s. Find $b$, the location of the stagnation point, $\psi$ on the body surface, the half-width directly above the source and the total width far downstream.`,
    answer: md`$b = 79.6$ mm; stagnation point at $x = -79.6$ mm; $\psi_{\text{body}} = 2.5$ m²/s; half-width $0.125$ m above the source; total width $0.50$ m far downstream.`,
    solution: md`- $b = \dfrac{m}{2\pi U} = \dfrac{5}{2\pi(10)} = 0.0796$ m.
    - Stagnation point: $r = b$, $\theta = \pi$, i.e. $(x, y) = (-0.0796,\ 0)$ m.
    - $\psi_{\text{body}} = m/2 = 2.5$ m²/s $\ (= \pi bU = \pi \times 0.0796 \times 10 = 2.5$ ✓$)$.
    - Above the source ($\theta = 90^\circ$): $y = b(\pi - \pi/2) = \pi b/2 = 0.125$ m.
    - Far downstream: half-width $\pi b = 0.250$ m, total $2\pi b = 0.50$ m $= m/U = 5/10$ ✓`,
    check: [
      { label: md`$b$`, value: 0.0796, units: md`\mathrm{m}` },
      { label: 'total width far downstream', value: 0.5, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-hb-point',
    concept: 'half-body-shape',
    difficulty: 2,
    q: md`For a half-body with $b = 0.10$ m, find the coordinates $(x, y)$ of the body surface on the ray $\theta = 120^\circ$ (source at the origin, $\theta$ from $+x$).`,
    hint: md`$r = b(\pi - \theta)/\sin\theta$, or go straight to $y = b(\pi - \theta)$ and then $x = y\cot\theta$.`,
    answer: md`$r = 0.121$ m; $(x, y) = (-0.0605,\ 0.1047)$ m — still on the nose, ahead of the source.`,
    solution: md`$\theta = 120^\circ = 2\pi/3$, so $\pi - \theta = \pi/3 = 1.0472$.

    - $r = \dfrac{b(\pi - \theta)}{\sin\theta} = \dfrac{0.10 \times 1.0472}{0.8660} = 0.1209$ m
    - $x = r\cos 120^\circ = 0.1209 \times (-0.5) = -0.0605$ m
    - $y = b(\pi - \theta) = 0.10 \times 1.0472 = 0.1047$ m

    The point lies between the nose ($x = -0.10$ m) and the source — the body is already 1.05$b$ thick there.`,
    check: [
      { label: md`$x$`, value: -0.0605, units: md`\mathrm{m}` },
      { label: md`$y$`, value: 0.1047, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-hb-design',
    concept: 'half-body-shape',
    difficulty: 2,
    q: md`A wind-tunnel model must have the half-body shape and be $1.2$ m thick far downstream in an airstream of $U = 15$ m/s. What source strength $m$ is needed, and how far behind the nose must the source sit?`,
    answer: md`$m = UW = 18$ m²/s; the source sits $b = W/2\pi = 0.191$ m behind the nose.`,
    solution: md`- Far-downstream thickness: $2\pi b = W = 1.2$ m $\Rightarrow b = 1.2/(2\pi) = 0.191$ m.
    - $m = 2\pi bU = WU = 1.2 \times 15 = 18$ m²/s.
    - The stagnation point (nose) is at $x = -b$, so the source is $0.191$ m behind it.`,
    check: [
      { label: md`$m$`, value: 18, units: md`\mathrm{m^2/s}` },
      { label: md`$b$`, value: 0.191, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-hb-flow',
    concept: 'half-body-shape',
    difficulty: 3,
    q: md`For a half-body with $U = 2$ m/s and $b = 0.5$ m: (a) what volume flow rate per unit depth passes between the upper body surface and the streamline $\psi = 2\pi bU$? (b) At what height does that streamline travel far upstream, and far downstream?`,
    hint: md`$q = \psi_2 - \psi_1$ (Lec 12 slide 6). On the upper side $\psi = Uy + bU\theta$, with $\theta \to \pi$ far upstream and $\theta \to 0$ far downstream.`,
    answer: md`(a) $q = \pi bU = 3.14$ m²/s; (b) height $\pi b = 1.571$ m far upstream and $2\pi b = 3.142$ m far downstream — displaced outward by exactly $\pi b$.`,
    solution: md`(a) $q = \psi_2 - \psi_1 = 2\pi bU - \pi bU = \pi bU = \pi(0.5)(2) = 3.14$ m²/s.

    (b) On the upper side $\psi = Uy + bU\theta \Rightarrow y = \psi/U - b\theta = 2\pi b - b\theta$.

    - Far upstream ($\theta \to \pi$): $y \to \pi b = 1.571$ m.
    - Far downstream ($\theta \to 0$): $y \to 2\pi b = 3.142$ m.

    Check with $q = $ speed × gap: upstream the gap to the stagnation streamline ($y = 0$) is $\pi b$, downstream the gap to the body ($y = \pi b$) is also $\pi b$; both carry $U\pi b = 3.14$ m²/s ✓. Every outer streamline is pushed outward by exactly the body half-width $\pi b$.`,
    check: [
      { label: md`$q$`, value: 3.1416, units: md`\mathrm{m^2/s}` },
      { label: 'height far downstream', value: 3.1416, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-hb-approach',
    concept: 'half-body-shape',
    difficulty: 3,
    q: md`How far downstream of the source has the half-body reached 90 % of its final half-width $\pi b$? Give $x$ in units of $b$.`,
    hint: md`Set $y = 0.9\pi b$ in $y = b(\pi - \theta)$, then $x = y\cot\theta$.`,
    answer: md`$x \approx 8.70\,b$ (on the ray $\theta = 18^\circ$).`,
    solution: md`- $0.9\pi b = b(\pi - \theta) \Rightarrow \theta = 0.1\pi = 18^\circ$.
    - $x = y\cot\theta = 0.9\pi b \cot 18^\circ = 2.827b \times 3.078 = 8.70\,b$.

    The same calculation gives $18.8b$ for 95 % and about $99b$ for 99 %: the body thickens very slowly — it is genuinely semi-infinite ("half" a body).`,
    check: [{ label: md`$x/b$`, value: 8.7 }],
  },
  {
    id: 'pr-hp-air',
    concept: 'half-body-pressure',
    difficulty: 2,
    q: md`Air ($\rho = 1.2$ kg/m³) flows at $U = 20$ m/s past a half-body. Find $V$, $C_p$ and $p - p_0$ at the surface point on the ray $\theta = 60^\circ$.`,
    hint: md`On the body $b/r = \sin\theta/(\pi - \theta)$; you never need the actual size of the body.`,
    answer: md`$V = 25.2$ m/s $(1.259U)$, $C_p = -0.584$, $p - p_0 = -140$ Pa.`,
    solution: md`- On the body: $\dfrac{b}{r} = \dfrac{\sin 60^\circ}{\pi - \pi/3} = \dfrac{0.8660}{2.0944} = 0.4135$.
    - $\dfrac{V^2}{U^2} = 1 + 2(0.4135)(0.5) + 0.4135^2 = 1 + 0.4135 + 0.1710 = 1.5845$, so $V = 20\sqrt{1.5845} = 25.18$ m/s.
    - $C_p = 1 - 1.5845 = -0.5845$.
    - $p - p_0 = \tfrac12\rho U^2 C_p = \tfrac12(1.2)(20^2)(-0.5845) = 240 \times (-0.5845) = -140.3$ Pa.`,
    check: [
      { label: md`$V$`, value: 25.18, units: md`\mathrm{m/s}` },
      { label: md`$p - p_0$`, value: -140.3, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'pr-hp-axis',
    concept: 'half-body-pressure',
    difficulty: 2,
    q: md`Along the stagnation streamline (the negative $x$-axis, $\theta = \pi$) of a half-body in water ($\rho = 1000$ kg/m³, $U = 2$ m/s): (a) find $V$, $C_p$ and $p - p_0$ at $x = -2b$; (b) how far upstream has the flow slowed by only 10 % ($V = 0.9U$)?`,
    hint: md`At $\theta = \pi$: $v_\theta = 0$ and $v_r = -U + \dfrac{m}{2\pi r} = -U\left(1 - \dfrac{b}{r}\right)$.`,
    answer: md`(a) $V = U/2 = 1.0$ m/s, $C_p = 0.75$, $p - p_0 = 1.5$ kPa; (b) at $r = 10b$.`,
    solution: md`On the axis $V^2 = U^2\left(1 - 2\dfrac{b}{r} + \dfrac{b^2}{r^2}\right) = U^2\left(1 - \dfrac{b}{r}\right)^2$, so $V = U\left(1 - \dfrac{b}{r}\right)$ for $r > b$.

    (a) $r = 2b$: $V = 0.5U = 1.0$ m/s; $C_p = 1 - 0.5^2 = 0.75$; $p - p_0 = \tfrac12(1000)(2^2)(0.75) = 1500$ Pa.

    (b) $1 - b/r = 0.9 \Rightarrow r = 10b$. The body "announces itself" about ten nose-distances upstream.`,
    check: [
      { label: md`$p - p_0$ at $x = -2b$`, value: 1500, units: md`\mathrm{Pa}` },
      { label: md`$r/b$ where $V = 0.9U$`, value: 10 },
    ],
  },
  {
    id: 'pr-hp-cavitation',
    concept: 'half-body-pressure',
    difficulty: 3,
    q: md`Water ($\rho = 1000$ kg/m³) at $U = 3$ m/s and $p_0 = 120$ kPa (absolute) flows past a half-body. Using $V_{\max} = 1.26U$ on the surface, find the minimum surface pressure. Is there any risk of cavitation (vapour pressure $\approx 2.34$ kPa at 20 °C)? Roughly what $U$ would be needed?`,
    hint: md`$p_{\min} = p_0 + \tfrac12\rho U^2\left[1 - (V_{\max}/U)^2\right]$.`,
    answer: md`$p_{\min} \approx 117.4$ kPa $\gg 2.34$ kPa — no cavitation; it would need $U \approx 20$ m/s.`,
    solution: md`- $(V_{\max}/U)^2 = 1.2596^2 = 1.5866$, so $C_{p,\min} = -0.5866$.
    - $p_{\min} = 120\,000 + \tfrac12(1000)(3^2)(-0.5866) = 120\,000 - 2640 = 117\,360$ Pa $\approx 117.4$ kPa.
    - Far above the vapour pressure: no cavitation.
    - Cavitation onset: $\tfrac12\rho U^2(0.5866) = 120\,000 - 2340 \Rightarrow U^2 = \dfrac{2(117\,660)}{1000 \times 0.5866} = 401 \Rightarrow U \approx 20$ m/s.`,
    check: [{ label: md`$p_{\min}$`, value: 117.36, units: md`\mathrm{kPa}` }],
  },
  {
    id: 'pr-hp-cpline',
    concept: 'half-body-pressure',
    difficulty: 3,
    q: md`Show that the pressure coefficient anywhere in the half-body flow can be written $C_p = -\dfrac{b(2x + b)}{x^2 + y^2}$. Hence find the polar angle $\theta$ of the surface point where $V = U$, and state which part of the body carries $p > p_0$.`,
    hint: md`Use $r\cos\theta = x$ in $C_p = -\left(2\frac{b}{r}\cos\theta + \frac{b^2}{r^2}\right)$. Then intersect $x = -b/2$ with $y = b(\pi - \theta)$.`,
    answer: md`$V = U$ wherever $x = -b/2$; on the body that is $\theta \approx 113.2^\circ$ ($y = 1.166b$). Only the nose cap $-b \le x < -b/2$ has $p > p_0$.`,
    solution: md`$C_p = 1 - \dfrac{V^2}{U^2} = -\left(\dfrac{2b\,r\cos\theta}{r^2} + \dfrac{b^2}{r^2}\right) = -\dfrac{b(2x + b)}{r^2}$ with $r^2 = x^2 + y^2$.

    - $C_p = 0$ ($V = U$) on the whole vertical line $x = -b/2$; $C_p > 0$ for $x < -b/2$ and $C_p < 0$ for $x > -b/2$.
    - On the body $x = b(\pi - \theta)\cot\theta$, so $x = -b/2$ requires $\tan\theta = -2(\pi - \theta)$. Solving numerically: $\theta = 113.2^\circ$, $y = b(\pi - \theta) = 1.166b$.
    - Therefore $p > p_0$ only on the nose cap between the stagnation point ($x = -b$) and $x = -b/2$; the rest of the body is under suction, tending to $p_0$ far downstream.`,
    check: [{ label: md`$\theta$ (degrees)`, value: 113.2 }],
  },
]

/* ------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-sp-why',
    concept: 'superposition-method',
    difficulty: 1,
    q: 'Why is it legitimate to build the half-body flow by simply adding the stream functions (or potentials) of a uniform flow and a source?',
    options: [
      md`$\phi$ and $\psi$ obey Laplace's equation, which is linear, so any sum of solutions is again a solution`,
      'Bernoulli’s equation is linear in velocity, so the pressure fields of the two flows add',
      'Both flows are steady, and any two steady flows of the same fluid can be added',
      'The source is weak compared with the stream, so adding them is a small-perturbation approximation',
    ],
    answer: 0,
    explain: md`Linearity of $\nabla^2\phi = 0$ (and $\nabla^2\psi = 0$) makes superposition **exact** — no restriction on $m/U$. Bernoulli is *quadratic* in $V$, so pressures do **not** add; steadiness alone is not enough because the general equations of motion are nonlinear.`,
  },
  {
    id: 'q-sp-pressure',
    concept: 'superposition-method',
    difficulty: 2,
    q: 'Two plane potential flows are superposed. Which property of the combined flow can NOT be obtained by adding the corresponding properties of the two separate flows?',
    options: ['The pressure p', 'The stream function ψ', 'The velocity potential φ', 'The x-component of velocity u'],
    answer: 0,
    explain: md`$u = \pd{\phi}{x}$ is linear in $\phi$, so velocity components add. Pressure comes from $p = p_0 + \tfrac12\rho(U^2 - V^2)$ and $V^2 = (\vb{V}_1 + \vb{V}_2)\cdot(\vb{V}_1 + \vb{V}_2)$ contains the cross term $2\vb{V}_1\cdot\vb{V}_2$ — so $p \neq p_1 + p_2$.`,
  },
  {
    id: 'q-sp-vector',
    concept: 'superposition-method',
    difficulty: 2,
    q: md`A uniform flow $U = 3$ m/s ($+x$) is combined with a line source $m = 6$ m²/s at the origin. What is the velocity at $(0, 2)$ m, directly above the source?`,
    options: [md`$u = 3$ m/s, $v \approx 0.48$ m/s`, md`$u \approx 3.48$ m/s, $v = 0$`, md`$u = 3$ m/s, $v = 3$ m/s`, md`$u = 0$, $v \approx 0.48$ m/s`],
    answer: 0,
    explain: md`Source part: $v_r = \dfrac{m}{2\pi r} = \dfrac{6}{2\pi(2)} = 0.477$ m/s, radially outward — here straight up. Uniform part: $(3, 0)$. Vector sum $(3,\ 0.48)$ m/s. Adding $0.48$ to $u$ treats a vertical vector as horizontal; dropping the uniform part forgets that the stream is present everywhere.`,
  },
  {
    id: 'q-sp-psi',
    concept: 'superposition-method',
    difficulty: 1,
    q: 'Which expression is the stream function of a uniform flow U (+x) plus a line source m at the origin (slide 16)?',
    options: [
      md`$\psi = Ur\sin\theta + \dfrac{m}{2\pi}\theta$`,
      md`$\psi = Ur\cos\theta + \dfrac{m}{2\pi}\ln r$`,
      md`$\psi = Ur\sin\theta - \dfrac{m}{2\pi}\ln r$`,
      md`$\psi = Ur\sin\theta \cdot \dfrac{m}{2\pi}\theta$`,
    ],
    answer: 0,
    explain: md`$Ur\sin\theta = Uy$ is the uniform stream's $\psi$ and $\frac{m}{2\pi}\theta$ the source's. $Ur\cos\theta + \frac{m}{2\pi}\ln r$ is the **velocity potential** $\phi$ — a classic mix-up — and superposition adds, it never multiplies.`,
    src: S16,
  },
  {
    id: 'q-hb-stag',
    concept: 'half-body-shape',
    difficulty: 1,
    q: 'Where is the stagnation point of a uniform flow U (+x) plus a line source m at the origin?',
    options: [
      md`On the negative $x$-axis, a distance $b = m/2\pi U$ upstream of the source`,
      md`On the positive $x$-axis, a distance $b = m/2\pi U$ downstream of the source`,
      'At the source itself, r = 0',
      md`On the negative $x$-axis, a distance $m/2U$ upstream of the source`,
    ],
    answer: 0,
    explain: md`Upstream ($\theta = \pi$) the source pushes against the stream: $v_r = -U + \dfrac{m}{2\pi r} = 0$ at $r = b = \dfrac{m}{2\pi U}$. Downstream both point the same way and never cancel. The $2\pi$ comes from the source's circumference $2\pi r$ — $m/2U$ is a slip.`,
    src: S16,
  },
  {
    id: 'q-hb-psival',
    concept: 'half-body-shape',
    difficulty: 1,
    q: 'What is the value of the stream function on the half-body surface?',
    options: [md`$\psi = m/2 = \pi bU$`, md`$\psi = 0$`, md`$\psi = m = 2\pi bU$`, md`$\psi = \pi b$`],
    answer: 0,
    explain: md`The surface is the streamline through the stagnation point $(r, \theta) = (b, \pi)$: $\psi = Ub\sin\pi + \frac{m}{2\pi}\pi = m/2$, and with $m = 2\pi bU$ that is $\pi bU$. $\psi = 0$ is the $+x$ axis just above the source (the branch cut); $\pi b$ has units of length, not m²/s.`,
    src: S1617,
  },
  {
    id: 'q-hb-width',
    concept: 'half-body-shape',
    difficulty: 2,
    q: 'Far downstream, what is the total thickness of the half-body?',
    options: [md`$2\pi b$, which equals $m/U$`, md`$\pi b$`, md`$2b$`, md`$\pi b/2$`],
    answer: 0,
    explain: md`From $y = b(\pi - \theta)$: $\theta \to 0$ gives $y \to \pi b$ and $\theta \to 2\pi$ gives $y \to -\pi b$, so the thickness is $2\pi b = m/U$. $\pi b$ is only the **half**-width and $\pi b/2$ is the half-width directly above the source.`,
    src: S17,
  },
  {
    id: 'q-hb-scale',
    concept: 'half-body-shape',
    difficulty: 2,
    q: 'The source strength m is doubled while U stays constant. What happens to the half-body?',
    options: [
      'Every length (nose distance b, the widths) doubles — the shape is the same, just scaled up',
      'The nose moves upstream but the far-downstream width is unchanged',
      'The body becomes twice as wide but the nose stays where it was',
      'The body becomes more slender',
    ],
    answer: 0,
    explain: md`$b = m/2\pi U$ doubles and $r = b(\pi - \theta)/\sin\theta$ scales with $b$, so the new body is geometrically similar — larger, and in a fixed field of view it looks blunter (slide 17: $U$ = constant, increasing $m$). Nose position $-b$ and width $2\pi b$ always change together.`,
    src: S17,
  },
  {
    id: 'q-hb-wall',
    concept: 'half-body-shape',
    difficulty: 3,
    q: 'Why may the dividing streamline ψ = πbU be replaced by a solid wall without changing the flow outside it?',
    options: [
      'No fluid crosses a streamline, so a wall along it imposes exactly the zero-normal-velocity condition the flow already satisfies',
      'Because the velocity is zero all along the dividing streamline',
      'Because the pressure is constant along the dividing streamline',
      'Because the source lies on the dividing streamline',
    ],
    answer: 0,
    explain: md`An inviscid flow only needs $\vb{V}\cdot\vb{n} = 0$ at a wall, and a streamline already has it. The velocity is zero only at the stagnation point (it reaches about $1.26U$ on the shoulder), the pressure varies along the surface, and the source sits a distance $b$ **inside** the body.`,
  },
  {
    id: 'q-hp-stagp',
    concept: 'half-body-pressure',
    difficulty: 1,
    q: 'What is the pressure at the stagnation point of the half-body?',
    options: [md`$p_0 + \tfrac12\rho U^2$`, md`$p_0$`, md`$p_0 - \tfrac12\rho U^2$`, 'zero (absolute)'],
    answer: 0,
    explain: md`$V = 0$ there, so $p_0 + \tfrac12\rho U^2 = p + 0$: the stagnation pressure, the highest pressure in the whole field ($C_p = 1$). $p_0$ is the far-field value; $p_0 - \tfrac12\rho U^2$ would need $V^2 = 2U^2$.`,
    src: S18,
  },
  {
    id: 'q-hp-vmax',
    concept: 'half-body-pressure',
    difficulty: 2,
    q: 'Where on the half-body surface is the speed greatest (and the pressure lowest)?',
    options: [
      md`On the shoulder, near $\theta \approx 63^\circ$, where $V \approx 1.26U$`,
      md`At the nose, $\theta = 180^\circ$`,
      md`Directly above the source, $\theta = 90^\circ$, where $V \approx 1.19U$`,
      'Far downstream, where the body is widest',
    ],
    answer: 0,
    explain: md`On the body $\frac{V^2}{U^2} = 1 + \frac{\sin 2\theta}{\pi - \theta} + \frac{\sin^2\theta}{(\pi - \theta)^2}$, maximal ($1.2596^2$) at $\theta = 62.96^\circ$ — slightly **downstream** of the point above the source, where $V = 1.185U$. The nose is a stagnation point and far downstream $V \to U$.`,
  },
  {
    id: 'q-hp-V2',
    concept: 'half-body-pressure',
    difficulty: 2,
    q: md`From $v_r = U\cos\theta + \dfrac{m}{2\pi r}$ and $v_\theta = -U\sin\theta$, with $b = m/2\pi U$, which is $V^2$?`,
    options: [
      md`$U^2\left(1 + 2\dfrac{b}{r}\cos\theta + \dfrac{b^2}{r^2}\right)$`,
      md`$U^2\left(1 + \dfrac{b}{r}\cos\theta + \dfrac{b^2}{r^2}\right)$`,
      md`$U^2\left(1 - 2\dfrac{b}{r}\cos\theta + \dfrac{b^2}{r^2}\right)$`,
      md`$U^2 + \left(\dfrac{m}{2\pi r}\right)^2$`,
    ],
    answer: 0,
    explain: md`$(U\cos\theta + Ub/r)^2 + U^2\sin^2\theta = U^2 + 2U^2\frac{b}{r}\cos\theta + U^2\frac{b^2}{r^2}$. Losing the factor 2 of the cross term, flipping its sign, or dropping it altogether (adding speeds as if they were perpendicular) are the classic slips. Check: at $r = b$, $\theta = \pi$ the correct form gives 0.`,
    src: S18,
  },
  {
    id: 'q-hp-bern',
    concept: 'half-body-pressure',
    difficulty: 3,
    q: md`On slide 18, Bernoulli $p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2$ links the far stream to **any** point of the half-body flow, not just points on one streamline. What justifies this?`,
    options: [
      'The flow is irrotational (as well as steady, inviscid and incompressible), so the Bernoulli constant is the same everywhere',
      'The flow is steady, which by itself makes the Bernoulli constant uniform',
      'The body is symmetric about the x-axis',
      'The pressure is uniform far upstream',
    ],
    answer: 0,
    explain: md`For a steady inviscid flow Bernoulli holds *along* a streamline; irrotationality removes that restriction and makes $p + \tfrac12\rho V^2$ the same across streamlines. Steadiness alone is not enough, and symmetry or a uniform upstream pressure do not make a rotational flow obey Bernoulli across streamlines.`,
  },
  {
    id: 'q-hp-cpsign',
    concept: 'half-body-pressure',
    difficulty: 2,
    q: md`True or false: on the half-body surface the pressure exceeds $p_0$ only on the small nose cap upstream of $x = -b/2$.`,
    options: ['True', 'False'],
    answer: 0,
    explain: md`$C_p = -\dfrac{b(2x + b)}{x^2 + y^2}$ is positive only for $x < -b/2$. On the body that is the cap between the nose ($x = -b$) and $\theta \approx 113^\circ$; the rest of the surface is under suction ($V > U$) and returns to $p_0$ only far downstream.`,
  },
]

/* ------------------------------------------------------------------ flashcards */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-why',
    front: 'Why does superposition work for potential flows — and what does NOT superpose?',
    back: md`Laplace's equation ($\nabla^2\phi = 0$, $\nabla^2\psi = 0$) is **linear**, so sums of solutions are solutions and velocities add as vectors. **Pressure does not add** — Bernoulli contains $V^2$.`,
  },
  {
    id: 'fc-psi',
    front: 'ψ and φ for uniform flow + source (slide 16)',
    back: md`$\psi = Ur\sin\theta + \dfrac{m}{2\pi}\theta$, $\quad \phi = Ur\cos\theta + \dfrac{m}{2\pi}\ln r$`,
    src: S16,
  },
  {
    id: 'fc-stag',
    front: 'Stagnation point of the half-body',
    back: md`On the upstream axis at $r = b$, $\theta = \pi$, with $b = \dfrac{m}{2\pi U}$ — where the source velocity $\dfrac{m}{2\pi r}$ equals $U$.`,
    src: S16,
  },
  {
    id: 'fc-psistag',
    front: 'Value of ψ on the dividing streamline (the body surface)',
    back: md`$\psi_{\text{stagnation}} = \dfrac{m}{2} = \pi bU$`,
    src: S1617,
  },
  {
    id: 'fc-shape',
    front: 'Equation of the half-body surface',
    back: md`$\pi bU = Ur\sin\theta + bU\theta \ \Rightarrow\ r = \dfrac{b(\pi - \theta)}{\sin\theta}$, i.e. $y = b(\pi - \theta)$`,
    src: S17,
  },
  {
    id: 'fc-width',
    front: 'Widths of the half-body',
    back: md`Half-width $\pi b/2$ directly above the source; $\to \pi b$ far downstream; total $2\pi b = m/U$ (all source fluid leaves at speed $U$).`,
    src: S17,
  },
  {
    id: 'fc-vel',
    front: 'Velocity components of the half-body flow',
    back: md`$v_r = \dfrac{1}{r}\pd{\psi}{\theta} = U\cos\theta + \dfrac{m}{2\pi r}$, $\quad v_\theta = -\pd{\psi}{r} = -U\sin\theta$`,
    src: S18,
  },
  {
    id: 'fc-V2',
    front: 'Speed squared in the half-body flow',
    back: md`$V^2 = U^2 + \dfrac{Um\cos\theta}{\pi r} + \left(\dfrac{m}{2\pi r}\right)^2 = U^2\left(1 + 2\dfrac{b}{r}\cos\theta + \dfrac{b^2}{r^2}\right)$`,
    src: S18,
  },
  {
    id: 'fc-bern',
    front: 'Pressure anywhere in the half-body flow',
    back: md`$p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2 \Rightarrow C_p = 1 - V^2/U^2$; maximum $p_0 + \tfrac12\rho U^2$ at the nose.`,
    src: S18,
  },
  {
    id: 'fc-landmarks',
    front: 'Surface speed landmarks on the half-body (supplementary)',
    back: md`Nose: $V = 0$, $C_p = 1$. $x = -b/2$ ($\theta \approx 113^\circ$): $V = U$. Above source: $V = 1.185U$. Shoulder $\theta \approx 63^\circ$: $V_{\max} \approx 1.26U$, $C_p \approx -0.59$. Far downstream: $V \to U$.`,
  },
]

/* ------------------------------------------------------------------ topic takeaways */

export const takeaways: string[] = [
  md`Potential flows obey the **linear** Laplace equation, so $\phi$, $\psi$ and the velocity components of elementary flows simply **add** — the sum is an exact potential flow. **Pressure does not superpose** (Bernoulli is quadratic in $V$).`,
  md`Uniform flow + source (slide 16): $\psi = Ur\sin\theta + \frac{m}{2\pi}\theta$ and $\phi = Ur\cos\theta + \frac{m}{2\pi}\ln r$.`,
  md`The **stagnation point** sits on the upstream axis at $r = b$, $\theta = \pi$, where the source outflow $m/2\pi r$ has decayed to $U$: $b = m/2\pi U$.`,
  md`The streamline through it has $\psi = m/2 = \pi bU$, giving the body $r = b(\pi - \theta)/\sin\theta$, i.e. $y = b(\pi - \theta)$ (slide 17).`,
  md`Widths: $\pi b/2$ above the source, $\to \pi b$ far downstream, total $2\pi b = m/U$ — the source discharge leaving at speed $U$. The body is open (semi-infinite): 90 % of the final width only at $x \approx 8.7b$.`,
  md`No fluid crosses a streamline, so the dividing streamline can be replaced by a **solid wall**: the superposition becomes the flow past a blunt-nosed body (and its upper half, flow over a ridge).`,
  md`The geometry depends only on $b$: increasing $m$ at constant $U$ gives a larger, geometrically similar body; $U$ alone sets the speed scale.`,
  md`Velocity (slide 18): $v_r = U\cos\theta + \frac{m}{2\pi r}$, $v_\theta = -U\sin\theta$, $V^2 = U^2\left(1 + 2\frac{b}{r}\cos\theta + \frac{b^2}{r^2}\right)$; pressure from $p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2$.`,
  md`Surface pressure: $C_p = +1$ at the nose, $0$ at $x = -b/2$, a suction peak $C_p \approx -0.59$ ($V \approx 1.26U$) on the shoulder near $\theta \approx 63^\circ$, then $\to 0$ downstream.`,
  md`Exam traps: the stagnation point is at $\theta = \pi$ (not 0); keep the factor 2 in the cross term of $V^2$; add velocity **components**, not magnitudes; measure $\theta$ on $[0, 2\pi)$ so the jump of $\psi$ is hidden inside the body.`,
]

/* ------------------------------------------------------------------ content */

export default function Content() {
  return (
    <>
      {/* ============================================================ concept 1 */}
      <Concept id="superposition-method">
        <Step kind="intro" src={[S2, S16]}>
          <Md>{md`Lecture 12 builds a toolbox of **elementary plane potential flows** — uniform flow, source and sink, free vortex. Each is
          *inviscid, incompressible and irrotational*, the class of flows governed by **Laplace's equation** $\nabla^2\phi = 0$ (slide 2);
          in plane flow the stream function obeys it too.

          The **method of superposition** (slide 16) builds new and far more interesting flows by **adding** the $\phi$'s and $\psi$'s of
          elementary flows. The slide's example — and the subject of this whole topic — is a **uniform stream $U$** along $+x$ combined with
          a **line source of strength $m$** at the origin:

          $$
          \psi = \psi_{\text{uniform flow}} + \psi_{\text{source}} = Ur\sin\theta + \frac{m}{2\pi}\theta,\qquad \phi = Ur\cos\theta + \frac{m}{2\pi}\ln r
          $$

          Out of this sum a **body shape** appears (concept 2), together with its velocity and pressure distribution (concept 3). The same
          idea later gives the flow past cylinders, ovals and lifting shapes — so this is where potential-flow theory starts paying off.`}</Md>
          <Supplement title="Why adding is allowed: linearity">
            <Md>{md`Laplace's operator is **linear**: if $\nabla^2\phi_1 = 0$ and $\nabla^2\phi_2 = 0$ then
            $\nabla^2(\phi_1 + \phi_2) = \nabla^2\phi_1 + \nabla^2\phi_2 = 0$ (and the same for $c_1\phi_1 + c_2\phi_2$). Velocities are first
            derivatives, also linear, so the **velocity vectors add** point by point: $\vb{V} = \vb{V}_1 + \vb{V}_2$. Nothing is approximated —
            the sum is an exact potential flow. What does **not** superpose is the **pressure**: Bernoulli contains $V^2$, and
            $\lvert\vb{V}_1 + \vb{V}_2\rvert^2 \neq V_1^2 + V_2^2$ unless the two velocities are perpendicular.`}</Md>
          </Supplement>
          <Callout kind="exam">
            <Md>{md`The recipe on slides 16–18 is the template for every superposition question: (1) add the $\psi$'s; (2) differentiate for
            $v_r$, $v_\theta$; (3) set both to zero to find stagnation points; (4) evaluate $\psi$ there to get the dividing streamline (body
            shape); (5) Bernoulli for the pressure.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture a garden hose lying on the bed of a river and spraying water equally in all directions (a source). **Downstream**
          of the hose, river and spray move the same way — the water simply goes faster. **Upstream**, the spray pushes against the river:
          close to the hose the spray wins, far away the river wins, and at exactly one point they cancel — a **stagnation point**.

          Every fluid particle "feels" both ingredients at once and moves with their **vector sum**, like a swimmer whose stroke and the
          river's drift combine. Superposition is just bookkeeping: each elementary flow contributes its own velocity at each point, and
          $\psi$ — a running total of volume flow — adds because the flow rates of the two ingredients add.`}</Md>
          <Compare
            items={[
              { title: 'What adds', md: md`$\phi$, $\psi$, and the velocity **components** $u$, $v$ (or $v_r$, $v_\theta$) — all linear in the solution.`, tone: 'emerald' },
              { title: 'What does not', md: md`Pressure, speed $\lvert\vb{V}\rvert$ and kinetic energy — all **quadratic** in velocity.`, tone: 'rose' },
              { title: 'What is new', md: 'Stagnation points and dividing streamlines appear only in the sum — neither ingredient has them on its own.', tone: 'indigo' },
            ]}
          />
          <Callout kind="warning">
            <Md>{md`$\lvert\vb{V}\rvert \neq \lvert\vb{V}_1\rvert + \lvert\vb{V}_2\rvert$. Add components, never magnitudes — the only
            exception is where the two vectors happen to be parallel (e.g. on the $x$-axis of this flow).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={S16}>
          <Figure caption="Slide 16: a uniform stream U meets a line source at the origin; the stagnation point lies a distance b upstream; a field point P is located by (r, θ). Schematic, not to scale." src={S16}>
            <SlideSixteenSketch />
          </Figure>
          <Supplement title="Superposition seen as streamline patterns">
            <SuperpositionTriptych />
            <Md className="mt-3 text-sm text-ink-2">{md`All three panels are drawn with the **same** spacing $\Delta\psi = m/16$. The ten uniform-flow
            lines above the axis become the ten outer streamlines of the sum (each pushed outward); the source rays become the streamlines of
            source fluid inside the body, still leaving the source at their original angles; the thick curve is the new dividing
            streamline $\psi = m/2$ through the stagnation point.`}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" title="Equations, assumptions & the addition" src={[S8, S10, S16]}>
          <FormulaCard id="sp-principle" />
          <Md>{md`The two ingredients, recapped from earlier in the lecture and written in polar coordinates about the source:`}</Md>
          <FormulaCard id="sp-uniform" />
          <FormulaCard id="sp-source" />
          <Derivation
            title="Adding the ingredients (slide 16)"
            steps={[
              { md: md`Uniform flow: $\psi_1 = Uy = Ur\sin\theta$, $\ \phi_1 = Ux = Ur\cos\theta$`, why: 'slide 8, rewritten with x = r cosθ, y = r sinθ' },
              { md: md`Source at the origin: $\psi_2 = \dfrac{m}{2\pi}\theta$, $\ \phi_2 = \dfrac{m}{2\pi}\ln r$`, why: 'slide 10' },
              { md: md`$\psi = \psi_1 + \psi_2 = Ur\sin\theta + \dfrac{m}{2\pi}\theta$`, why: 'superposition (slide 16)' },
              { md: md`$\phi = \phi_1 + \phi_2 = Ur\cos\theta + \dfrac{m}{2\pi}\ln r$`, why: 'same for the potential' },
            ]}
          />
          <FormulaCard id="hb-psi" />
          <FormulaCard id="hb-phi" />
          <FormulaCard id="sp-cartesian" />
          <Supplement title="Check: the sum really satisfies Laplace's equation">
            <Derivation
              steps={[
                { md: md`$\nabla^2\psi = \dfrac{1}{r}\pd{}{r}\left(r\pd{\psi}{r}\right) + \dfrac{1}{r^2}\pd{^2\psi}{\theta^2}$`, why: 'polar Laplacian' },
                { md: md`$\pd{\psi}{r} = U\sin\theta \ \Rightarrow\ \dfrac{1}{r}\pd{}{r}\left(rU\sin\theta\right) = \dfrac{U\sin\theta}{r}$` },
                { md: md`$\pd{^2\psi}{\theta^2} = -Ur\sin\theta \ \Rightarrow\ \dfrac{1}{r^2}\pd{^2\psi}{\theta^2} = -\dfrac{U\sin\theta}{r}$`, why: 'the source term θ is linear in θ' },
                { md: md`$\nabla^2\psi = 0$ for $r \neq 0$ ✓`, why: 'as linearity guaranteed' },
              ]}
            />
          </Supplement>
          <Callout kind="warning" title="Measure θ the right way">
            <Md>{md`$\theta$ must be measured counter-clockwise from $+x$ and kept continuous where you need $\psi$. A calculator's
            $\operatorname{atan2}$ returns $\theta \in (-\pi, \pi]$, which puts the $2\pi$ jump of $\theta$ — a jump of $m$ in $\psi$ — on the
            **negative** $x$-axis, right on the stagnation streamline, and gives $\psi_{\text{stag}} = \pm m/2$ depending on the side. Use
            $0 \le \theta < 2\pi$: the jump then lies on the $+x$ axis downstream of the source, **inside** the body, where it disturbs nothing
            outside.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-sp-velocity" />
        </Step>

        <Step kind="interactive">
          <VectorAdditionSim />
          <GraphicalAddition />
        </Step>

        <Step kind="practice">
          <PracticeList concept="superposition-method" />
          <QuickCheck ids={['q-sp-why', 'q-sp-pressure']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Potential flows obey **linear** equations ($\nabla^2\phi = 0$, $\nabla^2\psi = 0$), so $\phi$, $\psi$, $u$, $v$ of elementary flows simply **add** — exactly.`,
              md`Uniform flow + source (slide 16): $\psi = Ur\sin\theta + \frac{m}{2\pi}\theta$, $\ \phi = Ur\cos\theta + \frac{m}{2\pi}\ln r$.`,
              md`Add velocity **components** (vectors), never magnitudes: the speed of the sum is not the sum of the speeds.`,
              md`**Pressure never superposes** — get $\vb{V}$ from the summed field first, then use Bernoulli.`,
              md`Trap: keep $\theta$ counter-clockwise from $+x$ on $[0, 2\pi)$ so that the jump of $\psi$ by $m$ stays hidden inside the body.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================ concept 2 */}
      <Concept id="half-body-shape">
        <Step kind="intro" src={S1617}>
          <Md>{md`Adding a source to a uniform stream creates two features that neither ingredient has on its own:

          1. a **stagnation point** on the negative $x$-axis, a distance $b = m/2\pi U$ upstream of the source, where the source's outflow
             exactly cancels the oncoming stream (slide 16); its stream-function value is $\psi_{\text{stagnation}} = m/2$;
          2. the **streamline passing through the stagnation point**, $\psi = m/2 = \pi bU$, whose equation $\pi bU = Ur\sin\theta + bU\theta$
             gives $r = b(\pi - \theta)/\sin\theta$, or simply $y = b(\pi - \theta)$ (slide 17).

          This dividing streamline separates fluid that came out of the source (inside) from fluid of the oncoming stream (outside). It has a
          rounded nose at the stagnation point and opens downstream towards $y = \pm\pi b$ — total width $2\pi b$ — so it outlines a
          blunt-nosed body that extends to infinity. Textbooks call it the **half-body** (often the *Rankine half-body*); the name is not
          printed on the slides. Slide 17 also shows that, at constant $U$, increasing $m$ makes the body larger.`}</Md>
          <Supplement title="The key modelling idea: a streamline can become a wall">
            <Md>{md`No fluid crosses a streamline (slide 6: the flow between two streamlines is fixed), so a streamline can be replaced by a
            solid surface without changing the inviscid flow on either side. Replace $\psi = \pi bU$ by a wall and the superposition
            becomes the flow **past a solid half-body** — a model for the nose of a long strut, a bridge pier or an instrument probe. Take
            only the upper half, with the $x$-axis as the ground, and it models wind over a long ridge or cliff.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of the source as a steady supply of fluid being blown back by a wind. Its fluid cannot travel far upstream — the
          oncoming stream turns it around — so it is swept downstream into a **plume**. Far downstream all of the source discharge $m$ (per
          unit depth) moves at the free-stream speed $U$, so the plume must be exactly $m/U$ wide. That is the $2\pi b$ of the slide-17
          figure.

          The oncoming stream has to part to get around the plume. The streamline aimed straight at the source decelerates and stops at the
          **nose**, the place where the source's outward speed $m/2\pi r$ has weakened to exactly $U$. A stronger source pushes the balance
          point further upstream ($b \propto m$) and makes the plume wider ($\propto m$): the whole body scales up. A faster stream does the
          opposite ($\propto 1/U$).`}</Md>
          <Compare
            items={[
              { title: 'Inside: source fluid', md: md`$0 < \psi < m$ (with $0 \le \theta < 2\pi$). Leaves the source and is swept downstream inside the body.`, tone: 'amber' },
              { title: 'On the surface', md: md`$\psi = m/2 = \pi bU$: the dividing streamline through the stagnation point, which also runs along the axis upstream of the nose.`, tone: 'rose' },
              { title: 'Outside: stream fluid', md: md`$\psi > m/2$ above, $\psi < m/2$ below. Arrives from far upstream and leaves displaced outward by exactly $\pi b$.`, tone: 'cyan' },
            ]}
          />
        </Step>

        <Step kind="visual" src={S17}>
          <Figure caption="Slide 17 (left): the oncoming streamlines part at the stagnation point; the dividing streamline ψ = πbU is the body outline; four source streamlines fill the body; far downstream the half-width tends to πb. Drawn to scale in units of b." src={S17}>
            <HalfBodyFigure />
          </Figure>
          <Figure caption="Slide 17 (right): U = constant, increasing m — the same oncoming streamlines are pushed further out as the body grows. The zoom toggle (added here) shows the three bodies have exactly the same shape." src={S17}>
            <IncreasingM />
          </Figure>
        </Step>

        <Step kind="equations" title="Equations & derivation" src={S1617}>
          <Derivation
            title="From the stagnation point to the body shape (slides 16–17)"
            steps={[
              { md: md`On the negative $x$-axis ($\theta = \pi$) the source gives $v_r = \dfrac{m}{2\pi r}$ (outward, i.e. upstream) while the stream gives $U\cos\pi = -U$.`, why: 'v_θ = −U sin π = 0 there' },
              { md: md`They cancel at $r = b$: $\ U = \dfrac{m}{2\pi b} \ \Rightarrow\ b = \dfrac{m}{2\pi U}$; the stagnation point is $r = b$, $\theta = \pi$.`, why: 'slide 16' },
              { md: md`$\psi_{\text{stagnation}} = Ub\sin\pi + \dfrac{m}{2\pi}\,\pi = \dfrac{m}{2}$`, why: 'evaluate ψ at (b, π)' },
              { md: md`With $m = 2\pi bU$: $\ \dfrac{m}{2} = \pi bU$ and $\dfrac{m}{2\pi} = bU$, so the dividing streamline is $\ \pi bU = Ur\sin\theta + bU\theta$`, why: 'slide 17' },
              { md: md`Divide by $U$: $r\sin\theta = b(\pi - \theta)\ \Rightarrow\ r = \dfrac{b(\pi - \theta)}{\sin\theta}$, and since $y = r\sin\theta$: $\ y = b(\pi - \theta)$`, why: 'slide 17' },
              { md: md`Limits: $\theta \to \pi$: $r \to b$ (nose); $\theta = \pi/2$: $y = \pi b/2$; $\theta \to 0$: $y \to \pi b$; $\theta \to 2\pi$: $y \to -\pi b$.`, why: 'width → 2πb (slide-17 figure)' },
            ]}
          />
          <FormulaCard id="hb-stag" />
          <FormulaCard id="hb-psistag" />
          <FormulaCard id="hb-dividing" />
          <FormulaCard id="hb-body" />
          <FormulaCard id="hb-width" />
          <Supplement title="Three independent checks of the width">
            <Md>{md`- **Mass conservation.** All of the source discharge leaves far downstream at speed $U$ inside the body:
            $U \times (2\pi b) = U \times 2\pi\dfrac{m}{2\pi U} = m$ ✓
            - **Streamline displacement.** An outer streamline that is at height $a$ far upstream has $\psi = U(a + \pi b)$, and far
            downstream ($\theta \to 0$) $\psi = Uy$, so it ends at $y = a + \pi b$ — every outer streamline is pushed out by exactly the body
            half-width.
            - **Slow approach.** $y = 0.9\pi b$ is reached only at $x \approx 8.7b$ and $0.95\pi b$ at $x \approx 18.8b$: the half-body is
            genuinely semi-infinite.`}</Md>
          </Supplement>
          <Callout kind="warning">
            <Md>{md`Common slips: placing the stagnation point **downstream** ($\theta = 0$, where the two flows reinforce); taking
            $\psi_{\text{stag}} = 0$; quoting $\pi b$ as the **total** width (it is the half-width); forgetting the $2\pi$ in $b = m/2\pi U$.`}</Md>
          </Callout>
          <Callout kind="exam">
            <Md>{md`Typical questions: locate the stagnation point; give $\psi$ on the body; find the body thickness at a given $\theta$ or $x$;
            choose $m$ for a required width. The fastest route to a thickness is always $y = b(\pi - \theta)$.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-hb-geometry" />
          <ExampleCard id="ex-hb-design" />
        </Step>

        <Step kind="interactive">
          <HalfBodyDesigner />
        </Step>

        <Step kind="practice">
          <PracticeList concept="half-body-shape" />
          <QuickCheck ids={['q-hb-stag', 'q-hb-width']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Stagnation point at $r = b$, $\theta = \pi$ with $b = m/2\pi U$: the source's $m/2\pi r$ cancels the oncoming $U$ (slide 16).`,
              md`Dividing streamline $\psi = m/2 = \pi bU$: $\ \pi bU = Ur\sin\theta + bU\theta \Rightarrow r = b(\pi - \theta)/\sin\theta$, $y = b(\pi - \theta)$ (slide 17).`,
              md`Half-width $\pi b/2$ above the source, $\to \pi b$ far downstream; total width $2\pi b = m/U$.`,
              md`The shape depends only on $b$: increasing $m$ at fixed $U$ gives a larger, geometrically similar body.`,
              md`Any streamline can be a wall — the dividing streamline becomes the surface of a solid, blunt-nosed half-body.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================ concept 3 */}
      <Concept id="half-body-pressure">
        <Step kind="intro" src={S18}>
          <Md>{md`Once $\psi$ is known, the whole velocity field follows by differentiation (slide 18):

          $$
          v_r = \frac{1}{r}\pd{\psi}{\theta} = U\cos\theta + \frac{m}{2\pi r},\qquad v_\theta = -\pd{\psi}{r} = -U\sin\theta
          $$

          Squaring and adding, and using $b = m/2\pi U$, the speed is $V^2 = U^2\left(1 + 2\frac{b}{r}\cos\theta + \frac{b^2}{r^2}\right)$.
          The pressure then follows from the **Bernoulli equation** between the free stream (pressure $p_0$, speed $U$) and any point
          (pressure $p$, speed $V$): $p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2$.

          This is the payoff of potential-flow theory: kinematics first (from $\psi$ alone), pressures and loads second (from Bernoulli).`}</Md>
          <Callout kind="note">
            <Md>{md`Because $V/U$ depends only on $b/r$ and $\theta$, the speed pattern — and therefore $C_p = 1 - V^2/U^2$ — is the same for
            every half-body. $U$ and $\rho$ only scale the actual pressures through $\tfrac12\rho U^2$.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Where streamlines crowd together the fluid must speed up (the flow-net idea of slide 7: velocity is inversely proportional
          to streamline spacing), and by Bernoulli its pressure drops; where they spread apart the fluid slows and the pressure rises.

          Follow a particle heading for the nose: it decelerates all the way to zero at the stagnation point, where the pressure peaks at
          $p_0 + \tfrac12\rho U^2$. Fluid that slips around the rounded nose is squeezed between the body and the outer streamlines and runs
          **faster than the free stream** over the shoulder — that is suction. Further downstream the body's sides become almost parallel,
          the squeeze relaxes and $V \to U$, $p \to p_0$.`}</Md>
          <Compare
            items={[
              { title: 'Nose', md: md`$V = 0$, $C_p = +1$: stagnation pressure $p_0 + \tfrac12\rho U^2$, the maximum anywhere in the flow.`, tone: 'rose' },
              { title: 'Shoulder', md: md`Streamlines crowd: $V_{\max} \approx 1.26U$ near $\theta \approx 63^\circ$, $C_p \approx -0.59$ — the suction peak.`, tone: 'cyan' },
              { title: 'Far downstream', md: md`Sides nearly parallel: $V \to U$, $p \to p_0$, $C_p \to 0$ (from below).`, tone: 'slate' },
            ]}
          />
        </Step>

        <Step kind="visual">
          <Tabs
            tabs={[
              {
                label: 'Along the body surface',
                content: (
                  <div className="space-y-4">
                    <Figure caption="Speed ratio V/U and pressure coefficient Cp along the surface, from slide 18's V² evaluated on r = b(π − θ)/sin θ. Cp = +1 at the nose, 0 at x = −b/2, minimum −0.587 on the shoulder.">
                      <SurfaceCpPlot />
                    </Figure>
                    <Figure caption="The same distribution as pressure arrows normal to the body: compression on the nose cap, suction over the shoulders and flanks.">
                      <PressureArrows />
                    </Figure>
                  </div>
                ),
              },
              {
                label: 'Along the upstream axis',
                content: (
                  <Figure caption="On the stagnation streamline (θ = π) the velocity is purely radial, V = U(1 − b/r): the flow halves its speed at x = −2b and is still 10 % slow at x = −10b.">
                    <AxisCpPlot />
                  </Figure>
                ),
              },
            ]}
          />
        </Step>

        <Step kind="equations" title="Equations & derivation" src={S18}>
          <Derivation
            title="Velocity and pressure of the half-body flow (slide 18)"
            steps={[
              { md: md`$v_r = \dfrac{1}{r}\pd{\psi}{\theta} = \dfrac{1}{r}\left(Ur\cos\theta + \dfrac{m}{2\pi}\right) = U\cos\theta + \dfrac{m}{2\pi r}$`, why: 'ψ = Ur sinθ + (m/2π)θ' },
              { md: md`$v_\theta = -\pd{\psi}{r} = -U\sin\theta$`, why: 'the source term does not depend on r' },
              { md: md`$V^2 = v_r^2 + v_\theta^2 = U^2\cos^2\theta + \dfrac{Um\cos\theta}{\pi r} + \left(\dfrac{m}{2\pi r}\right)^2 + U^2\sin^2\theta = U^2 + \dfrac{Um\cos\theta}{\pi r} + \left(\dfrac{m}{2\pi r}\right)^2$`, why: 'cross term 2·U cosθ·m/2πr' },
              { md: md`With $m = 2\pi bU$: $\ \dfrac{Um\cos\theta}{\pi r} = 2U^2\dfrac{b}{r}\cos\theta$ and $\left(\dfrac{m}{2\pi r}\right)^2 = U^2\dfrac{b^2}{r^2}$, so $\ V^2 = U^2\left(1 + 2\dfrac{b}{r}\cos\theta + \dfrac{b^2}{r^2}\right)$`, why: 'since b = m/2πU' },
              { md: md`Bernoulli between the free stream and any point: $\ p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2$`, why: 'steady, inviscid, incompressible, irrotational' },
              { md: md`Check at the stagnation point $r = b$, $\theta = \pi$: $V^2 = U^2(1 - 2 + 1) = 0$, so $p = p_0 + \tfrac12\rho U^2$`, why: 'consistency check' },
            ]}
          />
          <FormulaCard id="hb-vel" />
          <FormulaCard id="hb-V2" />
          <FormulaCard id="hb-V2b" />
          <FormulaCard id="hb-bern" />
          <Supplement title="Pressure coefficient and the speed on the body">
            <Md>{md`Dividing Bernoulli by $\tfrac12\rho U^2$ gives a dimensionless pressure that is the same for every half-body. Putting
            $b/r = \sin\theta/(\pi - \theta)$ from the body equation into $V^2/U^2$ gives the surface speed as a function of $\theta$ alone;
            maximising it numerically gives $V_{\max} = 1.2596U$ at $\theta = 62.96^\circ$ (on the body at $x = 1.04b$, $y = 2.04b$).`}</Md>
            <div className="mt-3 space-y-4">
              <FormulaCard id="hb-cp" />
              <FormulaCard id="hb-surface" />
            </div>
          </Supplement>
          <Callout kind="warning">
            <Md>{md`Do not add the pressures of the uniform flow and the source — compute $V^2$ from the **combined** velocity first. And do
            not drop the cross term $\frac{Um\cos\theta}{\pi r}$: it is negative upstream ($\cos\theta < 0$, deceleration) and positive
            downstream (acceleration).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-hp-water" />
          <ExampleCard id="ex-hp-ridge" />
        </Step>

        <Step kind="interactive">
          <SurfaceExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="half-body-pressure" />
          <QuickCheck ids={['q-hp-stagp', 'q-hp-vmax']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`From $\psi$: $v_r = U\cos\theta + \frac{m}{2\pi r}$, $v_\theta = -U\sin\theta$ (slide 18).`,
              md`$V^2 = U^2 + \frac{Um\cos\theta}{\pi r} + \left(\frac{m}{2\pi r}\right)^2 = U^2\left(1 + 2\frac{b}{r}\cos\theta + \frac{b^2}{r^2}\right)$ — keep the cross term.`,
              md`Pressure: $p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2$, valid between **any** two points because the flow is irrotational.`,
              md`$C_p = 1 - V^2/U^2$ is universal: $+1$ at the nose, $0$ at $x = -b/2$, about $-0.59$ ($V \approx 1.26U$) on the shoulder, $\to 0$ downstream.`,
              md`Only the nose cap ($x < -b/2$) is above free-stream pressure; the rest of the body is under suction.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
