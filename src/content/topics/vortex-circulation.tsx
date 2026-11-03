import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FormulaCard, Md, PracticeList, Plot, QuickCheck, Step,
  Supplement, Takeaways, md,
} from '@/kit'
import { VortexAnatomy } from '../sims/vortex-circulation/VortexAnatomy'
import { FreeVortexExplorer } from '../sims/vortex-circulation/FreeVortexExplorer'
import { ElementOrbits } from '../sims/vortex-circulation/ElementOrbits'
import { VortexProfiles } from '../sims/vortex-circulation/VortexProfiles'
import { ArbitraryCurveFig, SectorPathFig } from '../sims/vortex-circulation/CirculationFigs'
import { CirculationLab } from '../sims/vortex-circulation/CirculationLab'
import { PotentialStaircase } from '../sims/vortex-circulation/PotentialStaircase'
import { DrainingTankSim, TankFigure } from '../sims/vortex-circulation/DrainingTank'

const lec12 = (pages: string, note?: string): Src => (note ? { doc: 'lec12', pages, note } : { doc: 'lec12', pages })

/* ================================================================== */
/* Meta                                                                */
/* ================================================================== */

export const meta: TopicMeta = {
  id: 'vortex-circulation',
  unit: 'B',
  title: 'Vortex, Circulation & Free vs Forced Vortex',
  subtitle:
    'Fluid that swirls round a point without rotating, the rigid-body vortex that does rotate, circulation Γ as the measure of vortex strength — and the dip in the free surface above a draining tank.',
  minutes: 85,
  sources: [lec12('11–15'), lec12('19')],
  concepts: [
    {
      id: 'free-vortex',
      title: 'The free vortex: concentric streamlines, irrotational motion',
      src: lec12('11–12'),
      summary: 'φ = Kθ, ψ = −K ln r, v_θ = K/r: particles travel on circles but do not rotate (except at r = 0).',
    },
    {
      id: 'free-vs-forced',
      title: 'Free (irrotational) vs forced (rotational) vortex',
      src: lec12('12–13'),
      summary: 'v_θ = K/r keeps every element’s orientation; v_θ = K₁r turns elements like a rigid body (ω_z = K₁).',
    },
    {
      id: 'circulation',
      title: 'Circulation and vortex strength Γ',
      src: lec12('14–15'),
      summary: 'Γ = ∮V·ds is zero for irrotational flow unless a singularity is enclosed; the free vortex has Γ = 2πK on every loop round it.',
    },
    {
      id: 'draining-tank',
      title: 'Application: free-surface shape of a draining-tank vortex',
      src: lec12('19'),
      summary: 'Bernoulli between two free-surface points of the free vortex gives z_s = −Γ²/(8π²r²g).',
    },
  ],
  sourceNote: md`**Primary source: Lecture 12, slides 11–15 and 19.** Lecture 12 prints no equation numbers, so its equations are cited by slide. Slide 19 only *states* the draining-tank problem — the full solution here is written for this platform. Supplementary material (marked ✦) includes the vorticity checks, the forced-vortex stream function, the Rankine combined vortex, Stokes' theorem and all numerical examples. Sign convention, as drawn on the slides: $K>0$ and $\Gamma>0$ mean counter-clockwise swirl; the lecture uses $\vb{V} = +\nabla\phi$ (Fox uses $\vb{V} = -\nabla\phi$).`,
}

/* ================================================================== */
/* Formulas                                                            */
/* ================================================================== */

export const formulas: FormulaDef[] = [
  {
    id: 'polar-velocity',
    name: 'Polar velocity components from φ and ψ (recap)',
    tex: md`v_r = \pd{\phi}{r} = \frac{1}{r}\pd{\psi}{\theta}, \qquad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r}`,
    vars: [
      { sym: md`v_r`, desc: 'radial velocity component, positive away from the origin', units: md`\mathrm{m/s}` },
      { sym: md`v_\theta`, desc: md`tangential velocity component, positive towards increasing $\theta$ (counter-clockwise)`, units: md`\mathrm{m/s}` },
      { sym: md`\phi`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi`, desc: 'stream function (volume flow rate per unit depth)', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: md`polar coordinates: distance from the origin, and angle measured counter-clockwise from the $+x$ axis`, units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      'plane (two-dimensional) flow',
      md`$\phi$ exists only if the flow is **irrotational**; $\psi$ exists for any plane **incompressible** flow — both exist together in plane potential flow`,
    ],
    use: md`Given $\phi(r,\theta)$ or $\psi(r,\theta)$, differentiate to obtain $v_r$ and $v_\theta$. When both functions are known, the two routes must give the same velocity — a built-in check on signs.`,
    src: lec12('3'),
  },
  {
    id: 'vortex-phi-psi',
    name: 'Free vortex: velocity potential and stream function',
    key: true,
    tex: md`\phi = K\theta, \qquad \psi = -K\ln r`,
    vars: [
      { sym: md`\phi`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi`, desc: 'stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`K`, desc: md`vortex strength (constant); $K>0$ counter-clockwise, $K<0$ clockwise`, units: md`\mathrm{m^2/s}` },
      { sym: md`r`, desc: 'distance from the vortex centre (the origin)', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: md`polar angle, counter-clockwise from $+x$`, units: md`\mathrm{rad}` },
    ],
    conditions: [
      md`plane, incompressible, **irrotational** flow everywhere except the singular point $r = 0$`,
      md`obtained by **interchanging** $\phi$ and $\psi$ of the source (slides 10–11)`,
      md`$\phi$ is multi-valued: it grows by $2\pi K$ each time you go once round the origin`,
    ],
    use: md`Streamlines: $\psi = $ const $\Rightarrow r = $ const (concentric circles). Equipotentials: $\phi = $ const $\Rightarrow \theta = $ const (radial lines). Differentiate with the polar relations to get the velocity. Adding a constant to either function changes nothing physical.`,
    src: lec12('11'),
  },
  {
    id: 'vortex-velocity',
    name: 'Free vortex: tangential velocity',
    key: true,
    tex: md`v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r} = \frac{K}{r}`,
    vars: [
      { sym: md`v_\theta`, desc: md`tangential velocity, positive counter-clockwise`, units: md`\mathrm{m/s}` },
      { sym: md`\phi = K\theta`, desc: 'velocity potential of the vortex', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi = -K\ln r`, desc: 'stream function of the vortex', units: md`\mathrm{m^2/s}` },
      { sym: md`K`, desc: 'vortex strength', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'distance from the centre and polar angle', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      md`$v_r = \partial\phi/\partial r = 0$: purely circular motion`,
      md`valid for $r > 0$ only; $v_\theta \to \infty$ as $r \to 0$ (singular point — real vortices have a core there)`,
    ],
    use: md`The speed varies inversely with radius: halve $r$, double $v_\theta$. The product $r v_\theta = K$ is the same on every streamline, so one measured speed fixes the whole field.`,
    src: lec12('11'),
  },
  {
    id: 'vortex-cartesian',
    name: 'Free vortex in Cartesian form',
    tex: md`u = -\frac{K y}{x^2+y^2}, \qquad v = \frac{K x}{x^2+y^2}`,
    vars: [
      { sym: md`u,\ v`, desc: md`velocity components in $x$ and $y$`, units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates of the point (vortex at the origin)', units: md`\mathrm{m}` },
      { sym: md`K`, desc: 'vortex strength', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      md`same flow as $v_\theta = K/r$, $v_r = 0$; valid for $(x, y) \neq (0, 0)$`,
      md`from $u = v_r\cos\theta - v_\theta\sin\theta$ and $v = v_r\sin\theta + v_\theta\cos\theta$ with $\sin\theta = y/r$, $\cos\theta = x/r$`,
    ],
    use: md`Use when a point is given as $(x, y)$, or to test irrotationality with the Cartesian $\omega_z$ formula. The velocity is always perpendicular to the radius: $xu + yv = 0$.`,
  },
  {
    id: 'rotation-z',
    name: 'Rotation and vorticity of a fluid element (plane flow)',
    tex: md`\omega_z = \frac{1}{2}\left(\pd{v}{x} - \pd{u}{y}\right), \qquad \zeta_z = 2\,\omega_z`,
    vars: [
      { sym: md`\omega_z`, desc: md`rotation of the element about $z$ — the **average angular velocity of two mutually perpendicular line segments** through it; counter-clockwise positive`, units: md`\mathrm{rad/s}` },
      { sym: md`\zeta_z`, desc: md`vorticity, the $z$-component of $\nabla\times\vb{V}$ ("twice the fluid particle rotation")`, units: md`\mathrm{s^{-1}}` },
      { sym: md`u,\ v`, desc: 'velocity components', units: md`\mathrm{m/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      'kinematic definition — holds for any flow',
      md`**irrotational** flow: $\omega_z = 0$, i.e. $\partial v/\partial x = \partial u/\partial y$ (Lec 12, slide 4)`,
    ],
    use: md`Evaluate both cross-derivatives at a point. If they are equal, the element there does not rotate. Rotation is about the element's orientation — the shape of its path does not enter.`,
    src: [{ doc: 'lec9', pages: '7–8' }, lec12('4')],
  },
  {
    id: 'irrot-polar',
    name: 'Irrotationality condition in polar coordinates',
    tex: md`\frac{1}{r}\pd{(r v_\theta)}{r} - \frac{1}{r}\pd{v_r}{\theta} = 0`,
    vars: [
      { sym: md`v_r,\ v_\theta`, desc: md`radial and tangential velocity components (Fox writes $V_r$, $V_\theta$)`, units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      md`the $z$-component of $\nabla\times\vb{V} = 0$ in cylindrical coordinates — one of the three conditions of Fox Eq. (6.24)`,
      md`for purely swirling flow ($v_r = 0$, $v_\theta = v_\theta(r)$) it reduces to $d(rv_\theta)/dr = 0$, i.e. $rv_\theta = $ const`,
    ],
    use: md`Free vortex: $rv_\theta = K$ is constant and $v_r = 0$, so both terms vanish — irrotational for every $r > 0$. Forced vortex: $rv_\theta = K_1r^2$, the first term is $2K_1 \neq 0$ — rotational.`,
    src: { doc: 'fox', pages: '221', note: 'Eq. (6.24)' },
  },
  {
    id: 'forced-vortex',
    name: 'Forced (rotational) vortex',
    key: true,
    tex: md`v_\theta = K_1 r`,
    vars: [
      { sym: md`v_\theta`, desc: 'tangential velocity', units: md`\mathrm{m/s}` },
      { sym: md`K_1`, desc: 'constant — the angular velocity of the rigid-body rotation', units: md`\mathrm{s^{-1}}\ (\mathrm{rad/s})` },
      { sym: md`r`, desc: 'distance from the axis', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`circular streamlines ($v_r = 0$) with speed **proportional** to $r$`,
      md`**rotational** — so no velocity potential exists (a potential requires $\nabla\times\vb{V} = 0$, slide 4)`,
      'models liquid in a container spinning as a solid body, or the core of a real vortex',
    ],
    use: md`Every particle completes a lap in the same time $2\pi/K_1$, so the fluid turns like a solid body and every element turns with it at $\omega_z = K_1$.`,
    src: lec12('12–13'),
  },
  {
    id: 'forced-vortex-props',
    name: 'Forced vortex: rotation, vorticity and stream function',
    tex: md`\omega_z = K_1, \qquad \zeta_z = 2K_1, \qquad \psi = -\tfrac{1}{2}K_1 r^2`,
    vars: [
      { sym: md`\omega_z`, desc: 'rotation of every fluid element', units: md`\mathrm{rad/s}` },
      { sym: md`\zeta_z`, desc: 'vorticity (uniform)', units: md`\mathrm{s^{-1}}` },
      { sym: md`\psi`, desc: 'stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`K_1`, desc: 'angular velocity of the rigid rotation', units: md`\mathrm{s^{-1}}` },
      { sym: md`r`, desc: 'distance from the axis', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`$\psi$ exists because the flow is plane and incompressible; $\phi$ does **not** exist`,
      md`$\omega_z$ is the same at every point — uniform vorticity`,
    ],
    use: md`Check: $-\partial\psi/\partial r = K_1 r = v_\theta$, and $\omega_z = \frac{1}{2r}\frac{d(K_1r^2)}{dr} = K_1$.`,
  },
  {
    id: 'rotation-polar',
    name: 'Rotation of an element in a purely swirling flow vθ(r)',
    tex: md`\omega_z = \frac{1}{2}\Big(\underbrace{\frac{dv_\theta}{dr}}_{\text{radial arm}} + \underbrace{\frac{v_\theta}{r}}_{\text{tangential arm}}\Big) = \frac{1}{2r}\,\frac{d(r v_\theta)}{dr}`,
    vars: [
      { sym: md`\omega_z`, desc: 'rotation of the element, counter-clockwise positive', units: md`\mathrm{rad/s}` },
      { sym: md`v_\theta(r)`, desc: md`tangential velocity, a function of $r$ only`, units: md`\mathrm{m/s}` },
      { sym: md`r`, desc: 'distance from the axis', units: md`\mathrm{m}` },
      { sym: md`dv_\theta/dr`, desc: 'angular velocity of a short **radial** segment — it is sheared because its two ends move at different speeds', units: md`\mathrm{rad/s}` },
      { sym: md`v_\theta/r`, desc: 'angular velocity of a short **tangential** segment — it turns as it is carried round the circle', units: md`\mathrm{rad/s}` },
    ],
    conditions: [
      md`purely swirling flow: $v_r = 0$ and $v_\theta$ depends on $r$ only`,
      md`follows from the definition of $\omega_z$ as the average angular velocity of two perpendicular segments (Lec 9, slide 7)`,
    ],
    use: md`Free vortex: $\tfrac12(-K/r^2 + K/r^2) = 0$. Forced vortex: $\tfrac12(K_1 + K_1) = K_1$.`,
  },
  {
    id: 'rankine',
    name: 'Rankine (combined) vortex — forced core + free outer flow',
    tex: md`v_\theta(r) = \begin{cases} \dfrac{K r}{R^2}, & r \le R \quad \text{(forced core)}\\[2mm] \dfrac{K}{r}, & r \ge R \quad \text{(free vortex outside)} \end{cases}`,
    vars: [
      { sym: md`v_\theta(r)`, desc: 'tangential velocity', units: md`\mathrm{m/s}` },
      { sym: md`K`, desc: 'strength of the outer free vortex', units: md`\mathrm{m^2/s}` },
      { sym: md`R`, desc: 'core radius', units: md`\mathrm{m}` },
      { sym: md`r`, desc: 'distance from the axis', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`the two pieces match at $r = R$, where the speed peaks at $K/R$`,
      md`core rotates rigidly at $\Omega = K/R^2$; outside the core the flow is irrotational`,
    ],
    use: md`A realistic model of bathtub, tornado and wing-tip vortices: it removes the infinite speed at $r = 0$. Letting $R \to 0$ recovers the ideal free vortex.`,
  },
  {
    id: 'circulation-def',
    name: 'Circulation',
    key: true,
    tex: md`\Gamma = \oint_C \vb{V}\cdot d\vb{s}`,
    vars: [
      { sym: md`\Gamma`, desc: md`circulation round the curve $C$`, units: md`\mathrm{m^2/s}` },
      { sym: md`C`, desc: 'any closed curve in the flow field' },
      { sym: md`\vb{V}`, desc: 'local velocity vector', units: md`\mathrm{m/s}` },
      { sym: md`d\vb{s}`, desc: md`line element of $C$: tangent to the curve, pointing in the direction of travel`, units: md`\mathrm{m}` },
    ],
    conditions: [
      md`traverse $C$ **counter-clockwise** (the slide's integral sign carries a counter-clockwise arrow): $\Gamma>0$ means net counter-clockwise swirl`,
      md`only the tangential component counts: $\vb{V}\cdot d\vb{s} = V\cos\alpha\,ds$, with $\alpha$ the angle between $\vb{V}$ and the curve`,
    ],
    use: md`Parametrise the curve, dot the local velocity with each tangent step and add round the loop (leg by leg for polygons). On a circle centred on a swirl, $\vb{V}\cdot d\vb{s} = v_\theta\,r\,d\theta$.`,
    src: lec12('14'),
  },
  {
    id: 'circulation-irrot',
    name: 'Circulation in irrotational flow',
    key: true,
    tex: md`\vb{V} = \nabla\phi \;\Rightarrow\; \vb{V}\cdot d\vb{s} = \nabla\phi\cdot d\vb{s} = d\phi \;\Rightarrow\; \Gamma = \oint_C d\phi = 0`,
    vars: [
      { sym: md`\vb{V}`, desc: 'local velocity vector', units: md`\mathrm{m/s}` },
      { sym: md`\phi`, desc: 'velocity potential', units: md`\mathrm{m^2/s}` },
      { sym: md`d\vb{s}`, desc: md`line element of the closed curve $C$, pointing in the direction of travel`, units: md`\mathrm{m}` },
      { sym: md`d\phi`, desc: md`change of $\phi$ along the step $d\vb{s}$`, units: md`\mathrm{m^2/s}` },
      { sym: md`\Gamma`, desc: md`circulation round $C$`, units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      md`irrotational flow with a **single-valued** $\phi$ inside and on $C$`,
      md`if a singularity is enclosed by $C$ the circulation **may not be zero** (slide 14) — e.g. the free vortex, whose $\phi = K\theta$ does not return to its starting value`,
    ],
    use: md`Going once round a closed curve returns you to the same point and hence the same value of $\phi$, so the total change of $\phi$ — the circulation — is zero.`,
    src: lec12('14'),
  },
  {
    id: 'circulation-free-vortex',
    name: 'Circulation of the free vortex',
    key: true,
    tex: md`\Gamma = \int_0^{2\pi} \frac{K}{r}\,(r\,d\theta) = 2\pi K`,
    vars: [
      { sym: md`\Gamma`, desc: 'circulation', units: md`\mathrm{m^2/s}` },
      { sym: md`K`, desc: 'vortex strength', units: md`\mathrm{m^2/s}` },
      { sym: md`r`, desc: 'radius of the circular path (it cancels)', units: md`\mathrm{m}` },
      { sym: md`r\,d\theta`, desc: md`arc length $ds$ along the circle`, units: md`\mathrm{m}` },
    ],
    conditions: [
      'path: a circle of any radius centred on the vortex, traversed counter-clockwise',
      md`the same $\Gamma$ results for **every** loop that encloses the origin once counter-clockwise; loops that do not enclose it give $0$`,
    ],
    use: md`Gives the vortex strength a physical meaning: $K = \Gamma/2\pi$.`,
    src: lec12('15'),
  },
  {
    id: 'vortex-gamma',
    name: 'Free vortex in terms of the circulation',
    key: true,
    tex: md`\phi = \frac{\Gamma}{2\pi}\,\theta, \qquad \psi = -\frac{\Gamma}{2\pi}\ln r`,
    vars: [
      { sym: md`\Gamma`, desc: md`circulation (vortex strength); $\Gamma>0$ counter-clockwise`, units: md`\mathrm{m^2/s}` },
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`r,\ \theta`, desc: 'polar coordinates centred on the vortex', units: md`\mathrm{m},\ \mathrm{rad}` },
    ],
    conditions: [
      md`identical to $\phi = K\theta$, $\psi = -K\ln r$ with $K = \Gamma/2\pi$`,
      md`irrotational everywhere except $r = 0$`,
    ],
    use: md`The standard way to specify a vortex — slide 19 states its problem this way. Differentiate for the velocity: $v_\theta = \Gamma/(2\pi r)$, $v_r = 0$.`,
    src: lec12('15'),
  },
  {
    id: 'vtheta-gamma',
    name: 'Free-vortex speed from the circulation',
    tex: md`v_\theta = \frac{\Gamma}{2\pi r}, \qquad v_r = 0`,
    vars: [
      { sym: md`v_\theta`, desc: 'tangential velocity', units: md`\mathrm{m/s}` },
      { sym: md`v_r`, desc: 'radial velocity (zero: no flow crosses the circular streamlines)', units: md`\mathrm{m/s}` },
      { sym: md`\Gamma`, desc: 'circulation', units: md`\mathrm{m^2/s}` },
      { sym: md`r`, desc: 'distance from the centre', units: md`\mathrm{m}` },
    ],
    conditions: [md`free vortex, $r > 0$`],
    use: md`Circulation divided by the circumference of the streamline: $\Gamma = v_\theta \times 2\pi r$ on every circle. Measure one speed at one radius and you know $\Gamma$.`,
  },
  {
    id: 'stokes-circulation',
    name: 'Circulation = enclosed vorticity (Stokes theorem)',
    tex: md`\Gamma = \oint_C \vb{V}\cdot d\vb{s} = \iint_A \zeta_z\,dA`,
    vars: [
      { sym: md`\Gamma`, desc: 'circulation', units: md`\mathrm{m^2/s}` },
      { sym: md`C`, desc: 'closed curve, traversed counter-clockwise' },
      { sym: md`\vb{V},\ d\vb{s}`, desc: md`local velocity and line element of $C$ — as in the definition of $\Gamma$`, units: md`\mathrm{m/s},\ \mathrm{m}` },
      { sym: md`A`, desc: md`area enclosed by $C$`, units: md`\mathrm{m^2}` },
      { sym: md`dA`, desc: md`element of that area`, units: md`\mathrm{m^2}` },
      { sym: md`\zeta_z = \pd{v}{x} - \pd{u}{y}`, desc: 'vorticity (twice the rotation)', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      md`plane flow; $C$ traversed counter-clockwise`,
      md`a point vortex concentrates all its vorticity at a single point, which is why every loop round it collects the same $\Gamma$ and every loop beside it collects none`,
    ],
    use: md`Forced vortex: $\zeta_z = 2K_1$ everywhere, so $\Gamma = 2K_1A$ for **any** loop — on a centred circle of radius $R$, $\Gamma = 2\pi K_1R^2$. Irrotational region ($\zeta_z = 0$): $\Gamma = 0$.`,
  },
  {
    id: 'bernoulli-irrot',
    name: 'Bernoulli equation between two points (head form)',
    tex: md`\frac{p_1}{\gamma} + \frac{V_1^2}{2g} + z_1 = \frac{p_2}{\gamma} + \frac{V_2^2}{2g} + z_2`,
    vars: [
      { sym: md`p`, desc: 'pressure (gauge or absolute — the same on both sides)', units: md`\mathrm{Pa}` },
      { sym: md`\gamma = \rho g`, desc: 'specific weight of the liquid', units: md`\mathrm{N/m^3}` },
      { sym: md`V`, desc: 'flow speed', units: md`\mathrm{m/s}` },
      { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`z`, desc: 'elevation above a datum, positive upward', units: md`\mathrm{m}` },
      { sym: md`1,\ 2`, desc: 'subscripts marking the two points' },
    ],
    conditions: [
      md`steady, inviscid, incompressible flow, points on the **same streamline** (Lec 10, slide 11)`,
      md`if the flow is also **irrotational**: between **any two points** — the constant is the same on every streamline (Fox Eq. 6.26)`,
    ],
    use: md`On a free surface $p = p_{atm}$ (zero gauge) at every point, so the equation links the surface height directly to the speed: faster fluid, lower surface.`,
    src: [{ doc: 'lec10', pages: '11' }, { doc: 'fox', pages: '221–222', note: 'Eq. (6.26)' }],
  },
  {
    id: 'surface-profile',
    name: 'Free-surface shape of a free vortex (draining tank)',
    key: true,
    tex: md`z_s = -\frac{\Gamma^2}{8\pi^2 r^2 g}`,
    vars: [
      { sym: md`z_s`, desc: 'elevation of the free surface relative to the undisturbed far-field level (negative = below it)', units: md`\mathrm{m}` },
      { sym: md`\Gamma`, desc: 'circulation of the vortex', units: md`\mathrm{m^2/s}` },
      { sym: md`r`, desc: 'distance from the vortex axis', units: md`\mathrm{m}` },
      { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
    ],
    conditions: [
      md`free-vortex velocity $v_\theta = \Gamma/2\pi r$ (slide 19), valid away from the tank opening and the core`,
      md`steady, inviscid, incompressible, irrotational — Bernoulli applied between two **surface** points (both at $p_{atm}$)`,
      md`datum $z = 0$: the surface far away ($r \to \infty$, $V \to 0$)`,
    ],
    use: md`Equivalent to $z_s = -v_\theta^2/2g$: the dip at any radius equals the local velocity head. The depth scales as $\Gamma^2$ and as $1/r^2$; the formula fails as $r \to 0$.`,
  },
  {
    id: 'radial-equilibrium',
    name: 'Radial equilibrium of a swirling free surface',
    tex: md`\frac{dz_s}{dr} = \frac{v_\theta^2}{g\,r}`,
    vars: [
      { sym: md`z_s`, desc: 'free-surface elevation', units: md`\mathrm{m}` },
      { sym: md`v_\theta`, desc: 'swirl velocity at radius $r$', units: md`\mathrm{m/s}` },
      { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`r`, desc: 'radius', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`steady swirl with negligible radial and vertical velocities; hydrostatic pressure in the vertical`,
      md`valid for **rotational or irrotational** swirl — it never crosses streamlines with Bernoulli`,
    ],
    use: md`The surface slope supplies the centripetal force $\rho v_\theta^2/r$. Free vortex: integrating $\Gamma^2/(4\pi^2gr^3)$ recovers $z_s = -\Gamma^2/(8\pi^2r^2g)$. Forced vortex: $K_1^2r/g$ integrates to the paraboloid $z_s = z_0 + K_1^2r^2/(2g)$.`,
  },
  {
    id: 'rankine-surface',
    name: 'Free surface with a Rankine core (finite dip)',
    tex: md`z_s(r) = \begin{cases} -\dfrac{\Gamma^2}{8\pi^2 R^2 g}\left(2 - \dfrac{r^2}{R^2}\right), & r \le R \\[2mm] -\dfrac{\Gamma^2}{8\pi^2 r^2 g}, & r \ge R \end{cases}`,
    vars: [
      { sym: md`R`, desc: 'radius of the rotating core', units: md`\mathrm{m}` },
      { sym: md`\Gamma`, desc: 'circulation of the outer free vortex', units: md`\mathrm{m^2/s}` },
      { sym: md`z_s,\ r,\ g`, desc: 'as above', units: md`\mathrm{m},\ \mathrm{m},\ \mathrm{m/s^2}` },
    ],
    conditions: [
      md`forced core $v_\theta = \Gamma r/(2\pi R^2)$ inside $r = R$, free vortex outside`,
      md`inside the core Bernoulli cannot be used across streamlines — the core profile comes from radial equilibrium`,
    ],
    use: md`The deepest point (on the axis) is at $-\Gamma^2/(4\pi^2R^2g)$, exactly twice the depth at $r = R$.`,
  },
]

/* ================================================================== */
/* Solved examples                                                     */
/* ================================================================== */

export const examples: ExampleDef[] = [
  {
    id: 'fv-numbers',
    concept: 'free-vortex',
    title: 'Velocities, rotation and lap times in a free vortex',
    difficulty: 1,
    given: md`A free vortex $\phi = K\theta$, $\psi = -K\ln r$ with $K = 0.5\ \mathrm{m^2/s}$ (counter-clockwise).`,
    find: md`(a) $v_\theta$ at $r = 0.1$, $0.25$ and $1$ m; (b) $u$, $v$ and the speed at $(x, y) = (0.3,\ 0.4)$ m; (c) the rotation $\omega_z$ there; (d) the time for one lap at $r = 0.1$ m and at $r = 1$ m.`,
    assumptions: md`plane, steady, incompressible, irrotational flow; all points away from the singular point $r = 0$.`,
    steps: [
      {
        title: 'Tangential speed',
        md: md`$v_\theta = K/r$:

$$
v_\theta(0.1) = \frac{0.5}{0.1} = 5.0\ \mathrm{m/s}, \quad v_\theta(0.25) = \frac{0.5}{0.25} = 2.0\ \mathrm{m/s}, \quad v_\theta(1) = \frac{0.5}{1} = 0.50\ \mathrm{m/s}
$$

Ten times closer to the centre means ten times faster.`,
      },
      {
        title: 'Cartesian components at (0.3, 0.4) m',
        md: md`$x^2 + y^2 = 0.09 + 0.16 = 0.25\ \mathrm{m^2}$, so $r = 0.5$ m.

$$
u = -\frac{Ky}{x^2+y^2} = -\frac{0.5(0.4)}{0.25} = -0.80\ \mathrm{m/s}, \qquad v = \frac{Kx}{x^2+y^2} = \frac{0.5(0.3)}{0.25} = 0.60\ \mathrm{m/s}
$$

Speed $\sqrt{0.80^2 + 0.60^2} = 1.0$ m/s $= K/r = 0.5/0.5$ ✓, and $xu + yv = 0.3(-0.80) + 0.4(0.60) = 0$: the velocity is perpendicular to the radius, as it must be for circular streamlines.`,
      },
      {
        title: 'Rotation',
        md: md`$$
\pd{v}{x} = \frac{K(y^2 - x^2)}{(x^2+y^2)^2} = \frac{0.5(0.16 - 0.09)}{0.0625} = 0.56\ \mathrm{s^{-1}}, \qquad \pd{u}{y} = \frac{K(y^2 - x^2)}{(x^2+y^2)^2} = 0.56\ \mathrm{s^{-1}}
$$

so $\omega_z = \tfrac12(0.56 - 0.56) = 0$. The velocity gradients are not zero — the element is being sheared — but it does not rotate.`,
      },
      {
        title: 'Lap times',
        md: md`$T = 2\pi r / v_\theta = 2\pi r^2/K$:

- $r = 0.1$ m: $T = 2\pi(0.01)/0.5 = 0.126$ s
- $r = 1$ m: $T = 2\pi(1)/0.5 = 12.6$ s — a hundred times longer`,
      },
    ],
    answer: md`(a) $5.0$, $2.0$ and $0.50$ m/s; (b) $u = -0.80$ m/s, $v = 0.60$ m/s, speed $1.0$ m/s; (c) $\omega_z = 0$; (d) $0.126$ s and $12.6$ s.`,
    insight: 'Lap time grows as r², so inner fluid overtakes outer fluid — the flow is strongly sheared, yet no element rotates.',
  },
  {
    id: 'fv-psi-to-phi',
    concept: 'free-vortex',
    title: 'From a given stream function to the velocity potential',
    difficulty: 2,
    given: md`A plane flow has the stream function $\psi = -3\ln r$ ($\psi$ in m²/s, $r$ in m).`,
    find: md`(a) $v_r$ and $v_\theta$; (b) show that the flow is irrotational for $r \neq 0$; (c) the velocity potential $\phi$; (d) the speed at $r = 0.5$ m.`,
    steps: [
      {
        title: 'Velocity from ψ',
        md: md`Polar relations (Lec 12, slide 3):

$$
v_r = \frac{1}{r}\pd{\psi}{\theta} = 0, \qquad v_\theta = -\pd{\psi}{r} = -\left(-\frac{3}{r}\right) = \frac{3}{r}
$$

Circular streamlines, counter-clockwise: a free vortex with $K = 3\ \mathrm{m^2/s}$.`,
      },
      {
        title: 'Irrotational?',
        md: md`For purely swirling flow $\omega_z = \dfrac{1}{2r}\dfrac{d(rv_\theta)}{dr} = \dfrac{1}{2r}\dfrac{d(3)}{dr} = 0$ for every $r \neq 0$ — so a velocity potential exists.`,
      },
      {
        title: 'Integrate for φ',
        md: md`$\pd{\phi}{r} = v_r = 0 \Rightarrow \phi = f(\theta)$ only. Then $\dfrac{1}{r}\pd{\phi}{\theta} = v_\theta = \dfrac{3}{r} \Rightarrow \dfrac{df}{d\theta} = 3$, so

$$
\phi = 3\theta + C
$$

Check: $\phi$ and $\psi$ are the vortex pair $K\theta$, $-K\ln r$ with $K = 3\ \mathrm{m^2/s}$.`,
      },
      { title: 'Speed at r = 0.5 m', md: md`$v_\theta = 3/0.5 = 6.0$ m/s.` },
    ],
    answer: md`$v_r = 0$, $v_\theta = 3/r$; $\omega_z = 0$ for $r \neq 0$; $\phi = 3\theta$ (+ const); $6.0$ m/s at $r = 0.5$ m.`,
    insight: 'ψ ∝ ln r goes with φ ∝ θ: the vortex is the source with φ and ψ interchanged — recognise it on sight.',
  },
  {
    id: 'ff-turntable',
    concept: 'free-vs-forced',
    title: 'Rotating tank (forced vortex) vs a free vortex with the same speed at one radius',
    difficulty: 2,
    given: md`Water in a cylindrical tank has spun up to rigid-body rotation at $N = 60$ rpm. A free vortex is chosen to have the same speed at $r = 0.1$ m.`,
    find: md`(a) $K_1$, $v_\theta(0.1\ \mathrm{m})$, $\omega_z$ and $\zeta_z$ of the forced vortex; (b) $K$ of the free vortex; (c) both speeds at $r = 0.2$ m; (d) lap times at $r = 0.05$, $0.1$ and $0.2$ m.`,
    steps: [
      {
        title: 'Forced vortex',
        md: md`$K_1 = \Omega = \dfrac{2\pi N}{60} = \dfrac{2\pi(60)}{60} = 6.283$ rad/s, so $v_\theta = K_1r = 6.283(0.1) = 0.628$ m/s. Every element turns with the tank: $\omega_z = K_1 = 6.28$ rad/s and $\zeta_z = 2K_1 = 12.6\ \mathrm{s^{-1}}$.`,
      },
      { title: 'Matching free vortex', md: md`$K = r v_\theta = 0.1(0.6283) = 0.0628\ \mathrm{m^2/s}$.` },
      {
        title: 'Speeds at r = 0.2 m',
        md: md`Forced: $v_\theta = 6.283(0.2) = 1.257$ m/s (doubles). Free: $v_\theta = 0.0628/0.2 = 0.314$ m/s (halves).`,
      },
      {
        title: 'Lap times',
        md: md`Forced: $T = 2\pi/K_1 = 1.00$ s at **every** radius. Free: $T = 2\pi r^2/K$ gives $0.25$ s, $1.00$ s and $4.00$ s at $r = 0.05$, $0.1$ and $0.2$ m.`,
      },
    ],
    answer: md`(a) $K_1 = 6.28$ rad/s, $v_\theta = 0.628$ m/s, $\omega_z = 6.28$ rad/s, $\zeta_z = 12.6\ \mathrm{s^{-1}}$; (b) $K = 0.0628\ \mathrm{m^2/s}$; (c) forced $1.26$ m/s, free $0.314$ m/s; (d) forced $1.00$ s everywhere; free $0.25$, $1.00$, $4.00$ s.`,
    insight: 'Forced: one lap time everywhere (solid body). Free: lap time ∝ r² (strong shear) — yet it is the forced vortex that rotates.',
  },
  {
    id: 'ff-arms',
    concept: 'free-vs-forced',
    title: 'Same speed, same path — opposite verdict on rotation',
    difficulty: 2,
    given: md`At $r = 0.2$ m a free vortex with $K = 0.4\ \mathrm{m^2/s}$ and a forced vortex with $K_1 = 10\ \mathrm{s^{-1}}$ both carry fluid round the same circle. A tiny cross sits there with one arm radial and one arm tangential.`,
    find: md`The angular velocity of each arm, and $\omega_z$, in each vortex.`,
    assumptions: md`purely swirling flow; arm rates $dv_\theta/dr$ (radial arm) and $v_\theta/r$ (tangential arm), counter-clockwise positive.`,
    steps: [
      {
        title: 'Same speed, same centripetal acceleration',
        md: md`Free: $0.4/0.2 = 2.0$ m/s. Forced: $10(0.2) = 2.0$ m/s. Both have $v_\theta^2/r = 20\ \mathrm{m/s^2}$ — the particles' motions are indistinguishable at this radius.`,
      },
      {
        title: 'Free vortex',
        md: md`$\dfrac{dv_\theta}{dr} = -\dfrac{K}{r^2} = -\dfrac{0.4}{0.04} = -10$ rad/s (radial arm swings clockwise); $\dfrac{v_\theta}{r} = \dfrac{2.0}{0.2} = +10$ rad/s (tangential arm turns counter-clockwise). $\omega_z = \tfrac12(-10 + 10) = 0$.`,
      },
      {
        title: 'Forced vortex',
        md: md`$\dfrac{dv_\theta}{dr} = K_1 = +10$ rad/s and $\dfrac{v_\theta}{r} = +10$ rad/s. $\omega_z = \tfrac12(10 + 10) = 10$ rad/s $= K_1$.`,
      },
    ],
    answer: md`Free: arms at $-10$ and $+10$ rad/s, $\omega_z = 0$. Forced: both arms at $+10$ rad/s, $\omega_z = 10$ rad/s.`,
    insight: 'Rotation is decided by how v_θ changes across the streamlines (dv_θ/dr), not by the speed or the curvature of the path.',
  },
  {
    id: 'circ-free-vortex',
    concept: 'circulation',
    title: 'Circulation of the free vortex round a circle',
    difficulty: 1,
    src: lec12('15'),
    given: md`Free vortex $v_\theta = K/r$, $v_r = 0$ (slide 11); a circle of radius $r$ centred on the vortex, traversed counter-clockwise.`,
    find: md`The circulation $\Gamma$, and $\phi$, $\psi$ written in terms of $\Gamma$.`,
    steps: [
      {
        title: 'Line element on the circle',
        md: md`$d\vb{s}$ points along the circle with length $ds = r\,d\theta$, so $\vb{V}\cdot d\vb{s} = v_\theta\,r\,d\theta$ (the radial velocity, zero anyway, would be perpendicular to $d\vb{s}$).`,
      },
      {
        title: 'Integrate once round',
        md: md`$$
\Gamma = \int_0^{2\pi} \frac{K}{r}\,(r\,d\theta) = K\int_0^{2\pi} d\theta = 2\pi K
$$`,
      },
      {
        title: 'Interpret',
        md: md`The radius cancelled: every centred circle has the same $\Gamma$. It is non-zero, although the flow is irrotational, because each circle encloses the singular point $r = 0$ (slide 14).`,
      },
      {
        title: 'Rewrite the vortex with Γ',
        md: md`$K = \Gamma/2\pi$, hence $\phi = \dfrac{\Gamma}{2\pi}\theta$ and $\psi = -\dfrac{\Gamma}{2\pi}\ln r$ (and $v_\theta = \Gamma/2\pi r$).`,
      },
    ],
    answer: md`$\Gamma = 2\pi K$, independent of $r$; $\phi = \Gamma\theta/2\pi$, $\psi = -(\Gamma/2\pi)\ln r$.`,
    insight: 'Speed falls as 1/r while the path grows as r — their product, the circulation, is the same on every circle.',
  },
  {
    id: 'circ-abcd',
    concept: 'circulation',
    title: 'Circulation round the path ABCD of slide 15',
    difficulty: 2,
    src: lec12('15', 'path ABCD'),
    solutionBy: 'platform',
    given: md`Free vortex $v_\theta = K/r$. Path ABCD of slide 15: A and D on a circle of radius $r_A$, B and C on a circle of radius $r_B > r_A$; AB and DC are radial lines separated by the angle $d\theta$. For numbers take $K = 1\ \mathrm{m^2/s}$ and a finite opening $\Delta\theta = 30^\circ$.`,
    find: md`The contribution of each leg and the total circulation $\Gamma_{ABCD}$ (counter-clockwise: A → B → C → D → A).`,
    steps: [
      { title: 'Radial legs', md: md`A → B and C → D are radial: $\vb{V} = v_\theta\,\hat{\vb{e}}_\theta$ is perpendicular to $d\vb{s}$, so both contribute $0$.` },
      {
        title: 'Outer arc B → C (with the flow)',
        md: md`$\displaystyle\int v_\theta\,r_B\,d\theta = \frac{K}{r_B}\,r_B\,\Delta\theta = K\Delta\theta = 1(0.5236) = +0.524\ \mathrm{m^2/s}$`,
      },
      {
        title: 'Inner arc D → A (against the flow)',
        md: md`$-\dfrac{K}{r_A}\,r_A\,\Delta\theta = -K\Delta\theta = -0.524\ \mathrm{m^2/s}$`,
      },
      {
        title: 'Total',
        md: md`$\Gamma_{ABCD} = 0 + 0.524 + 0 - 0.524 = 0$ — for **any** $r_A$, $r_B$ and opening. The path does not enclose the singular point, so the irrotational result of slide 14 applies.`,
      },
    ],
    answer: md`Legs: $0$, $+K\Delta\theta$, $0$, $-K\Delta\theta$ ($\pm 0.524\ \mathrm{m^2/s}$ here); $\Gamma_{ABCD} = 0$.`,
    insight: 'The inner arc is faster but shorter, the outer arc slower but longer — v_θ·r = K on both, so their contributions cancel exactly.',
  },
  {
    id: 'circ-forced',
    concept: 'circulation',
    title: 'Circulation in a forced vortex depends on the area enclosed',
    difficulty: 2,
    given: md`Forced vortex $v_\theta = K_1 r$ (Cartesian: $u = -K_1y$, $v = K_1x$) with $K_1 = 2\ \mathrm{s^{-1}}$.`,
    find: md`$\Gamma$ round (a) a circle of radius $0.5$ m centred on the axis; (b) a circle of radius $0.5$ m centred at $(1.5,\ 0)$ m, which does not contain the axis.`,
    steps: [
      {
        title: '(a) Direct integration',
        md: md`On the circle $v_\theta = K_1R$ is constant and parallel to $d\vb{s}$: $\Gamma = (K_1R)(2\pi R) = 2\pi K_1R^2 = 2\pi(2)(0.25) = 3.14\ \mathrm{m^2/s}$.`,
      },
      {
        title: '(a) Check with Stokes',
        md: md`$\zeta_z = \pd{v}{x} - \pd{u}{y} = K_1 + K_1 = 4\ \mathrm{s^{-1}}$ everywhere; area $\pi R^2 = 0.785\ \mathrm{m^2}$; $\Gamma = \zeta_zA = 4(0.785) = 3.14\ \mathrm{m^2/s}$ ✓.`,
      },
      {
        title: '(b) Off-axis circle',
        md: md`It encloses the same area of the same uniform vorticity: $\Gamma = 4(0.785) = 3.14\ \mathrm{m^2/s}$ — **not** zero, although the axis is outside. (Try it in the circulation calculator below.)`,
      },
    ],
    answer: md`$\Gamma = 3.14\ \mathrm{m^2/s}$ round both circles.`,
    insight: 'Rotational flow: Γ measures vorticity spread over the enclosed area. Free vortex: all the vorticity sits at r = 0, so only loops that enclose it pick up Γ.',
  },
  {
    id: 'tank-slide19',
    concept: 'draining-tank',
    title: 'Free-surface shape of the draining-tank vortex (slide 19)',
    difficulty: 2,
    src: lec12('19'),
    solutionBy: 'platform',
    given: md`A liquid drains from a large tank through a small opening. Away from the opening the swirl is a free vortex with velocity potential $\phi = \dfrac{\Gamma}{2\pi}\theta$.`,
    find: md`An expression relating the shape of the free surface, $z_s(r)$, to the vortex strength $\Gamma$.`,
    assumptions: md`steady, inviscid, incompressible; the free vortex is irrotational; radial and vertical velocities negligible away from the opening; free surface at atmospheric pressure; datum $z = 0$ at the undisturbed level far from the vortex.`,
    steps: [
      {
        title: 'Velocity field',
        md: md`$v_r = \pd{\phi}{r} = 0$ and $v_\theta = \dfrac{1}{r}\pd{\phi}{\theta} = \dfrac{\Gamma}{2\pi r}$, so the speed is $V = \Gamma/(2\pi r)$.`,
      },
      {
        title: 'Which Bernoulli?',
        md: md`The two surface points we want lie on **different** streamlines (different circles). Because the free vortex is irrotational, Bernoulli holds between any two points:

$$
\frac{p_1}{\gamma} + \frac{V_1^2}{2g} + z_1 = \frac{p_2}{\gamma} + \frac{V_2^2}{2g} + z_2
$$`,
      },
      {
        title: 'Choose the points',
        md: md`Both on the free surface, so $p_1 = p_2 = 0$ (gauge). Point 1 far away: $r \to \infty$, $V_1 \to 0$, $z_1 = 0$. Point 2 at radius $r$: $V_2 = \Gamma/2\pi r$, $z_2 = z_s$.`,
      },
      {
        title: 'Substitute and solve',
        md: md`$$
0 + 0 + 0 = 0 + \frac{1}{2g}\left(\frac{\Gamma}{2\pi r}\right)^2 + z_s
\quad\Longrightarrow\quad
z_s = -\frac{\Gamma^2}{8\pi^2 r^2 g}
$$`,
      },
      {
        title: 'Interpret',
        md: md`The surface lies below the far-field level everywhere, by one velocity head $V^2/2g$. The depth grows as $\Gamma^2$ and as $1/r^2$ and tends to $-\infty$ as $r \to 0$: near the axis the free-vortex model fails — the real flow has a rotational core and, as in the slide's photograph, an air core.`,
      },
    ],
    answer: md`$z_s = -\dfrac{\Gamma^2}{8\pi^2 r^2 g}$ — the surface is depressed by the local velocity head $v_\theta^2/2g$.`,
    insight: 'On a free surface the pressure is fixed, so Bernoulli trades velocity head directly for elevation: fast swirl means a low surface.',
  },
  {
    id: 'tank-numbers',
    concept: 'draining-tank',
    title: 'How deep is the dimple? Numbers for a sink vortex',
    difficulty: 2,
    given: md`Water swirling into a drain; measured $v_\theta = 0.25$ m/s at $r = 8$ cm; $g = 9.81\ \mathrm{m/s^2}$.`,
    find: md`(a) $\Gamma$; (b) the surface depression at $r = 8$, $4$ and $2$ cm; (c) the radius at which the dip reaches $5$ cm.`,
    steps: [
      { title: 'Circulation', md: md`$\Gamma = 2\pi r v_\theta = 2\pi(0.08)(0.25) = 0.1257\ \mathrm{m^2/s}$.` },
      {
        title: 'Depressions',
        md: md`$z_s = -v_\theta^2/2g$ with $v_\theta = \Gamma/2\pi r$:

| $r$ (cm) | $v_\theta$ (m/s) | $z_s$ (mm) |
|---|---|---|
| 8 | 0.25 | $-0.25^2/19.62 \times 1000 = -3.19$ |
| 4 | 0.50 | $-12.7$ |
| 2 | 1.00 | $-51.0$ |

Each halving of $r$ makes the dip four times deeper.`,
      },
      {
        title: 'Where is the dip 5 cm?',
        md: md`$V = \sqrt{2g(0.05)} = \sqrt{0.981} = 0.990$ m/s, so $r = \dfrac{\Gamma}{2\pi V} = \dfrac{0.1257}{2\pi(0.990)} = 0.0202$ m $= 2.02$ cm.`,
      },
    ],
    answer: md`(a) $\Gamma = 0.126\ \mathrm{m^2/s}$; (b) $-3.19$, $-12.7$ and $-51.0$ mm; (c) $r = 2.02$ cm.`,
    insight: 'The dip is negligible a few centimetres out but plunges near the axis — which is why a draining vortex looks like a narrow funnel with an air core.',
  },
]

/* ================================================================== */
/* Practice                                                            */
/* ================================================================== */

export const practice: PracticeDef[] = [
  {
    id: 'fv-p1',
    concept: 'free-vortex',
    difficulty: 1,
    q: md`A free vortex has the stream function $\psi = -2\ln r$ (m²/s, $r$ in m). Find $v_\theta$ at $r = 0.5$ m and at $r = 4$ m, and the ratio of the two speeds.`,
    hint: md`Compare with $\psi = -K\ln r$ and use $v_\theta = -\partial\psi/\partial r$.`,
    answer: md`$K = 2\ \mathrm{m^2/s}$: $v_\theta(0.5) = 4.0$ m/s, $v_\theta(4) = 0.50$ m/s; ratio $8$.`,
    solution: md`$v_\theta = -\pd{\psi}{r} = -\left(-\dfrac{2}{r}\right) = \dfrac{2}{r}$, so $K = 2\ \mathrm{m^2/s}$ (counter-clockwise).

- $r = 0.5$ m: $v_\theta = 2/0.5 = 4.0$ m/s
- $r = 4$ m: $v_\theta = 2/4 = 0.50$ m/s

Ratio $4.0/0.50 = 8 = 4/0.5$: the speed ratio is the inverse of the radius ratio, as $v_\theta \propto 1/r$ requires.`,
    check: [
      { label: md`$v_\theta$ at $0.5$ m`, value: 4, units: md`\mathrm{m/s}` },
      { label: md`$v_\theta$ at $4$ m`, value: 0.5, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'fv-p2',
    concept: 'free-vortex',
    difficulty: 2,
    q: md`For a free vortex with $K = 0.4\ \mathrm{m^2/s}$, find the volume flow rate per unit depth that circulates between the streamlines through $r = 0.1$ m and $r = 0.2$ m. Check your answer by integrating the velocity across the gap.`,
    hint: md`The flow rate between two streamlines is the difference of their $\psi$ values (Lec 12, slide 6).`,
    answer: md`$q = K\ln 2 = 0.277\ \mathrm{m^2/s}$ per metre of depth.`,
    solution: md`With $\psi = -K\ln r$:

$$
q = \psi(0.1) - \psi(0.2) = -K\ln 0.1 + K\ln 0.2 = K\ln\frac{0.2}{0.1} = 0.4\ln 2 = 0.277\ \mathrm{m^2/s}
$$

Check — the fluid crosses a radial line between the two circles at speed $v_\theta = K/r$:

$$
q = \int_{0.1}^{0.2} \frac{K}{r}\,dr = K\ln 2 = 0.277\ \mathrm{m^2/s}
$$

Equal steps in $\ln r$ carry equal flow, so streamline circles drawn at equal $\Delta\psi$ crowd together near the centre, where the fluid is fastest.`,
    check: [{ label: md`$q$`, value: 0.2773, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'fv-p3',
    concept: 'free-vortex',
    difficulty: 2,
    q: md`The free vortex $u = -\dfrac{Ky}{x^2+y^2}$, $v = \dfrac{Kx}{x^2+y^2}$ has $K = 1\ \mathrm{m^2/s}$. At $(x, y) = (1, 2)$ m evaluate $\partial v/\partial x$, $\partial u/\partial y$, the rotation $\omega_z$ and the speed.`,
    hint: md`Quotient rule; both derivatives turn out to be $K(y^2-x^2)/(x^2+y^2)^2$.`,
    answer: md`$\partial v/\partial x = \partial u/\partial y = 0.12\ \mathrm{s^{-1}}$, so $\omega_z = 0$; speed $= K/r = 1/\sqrt5 = 0.447$ m/s.`,
    solution: md`Quotient rule:

$$
\pd{v}{x} = K\frac{(x^2+y^2) - 2x^2}{(x^2+y^2)^2} = \frac{K(y^2-x^2)}{(x^2+y^2)^2}, \qquad
\pd{u}{y} = -K\frac{(x^2+y^2) - 2y^2}{(x^2+y^2)^2} = \frac{K(y^2-x^2)}{(x^2+y^2)^2}
$$

At $(1, 2)$: $x^2 + y^2 = 5$, so both equal $1(4 - 1)/25 = 0.12\ \mathrm{s^{-1}}$ and

$$
\omega_z = \tfrac12\left(\pd{v}{x} - \pd{u}{y}\right) = \tfrac12(0.12 - 0.12) = 0
$$

Speed: $u = -2/5 = -0.40$ m/s, $v = 1/5 = 0.20$ m/s, $\vert\vb{V}\vert = \sqrt{0.16 + 0.04} = 0.447$ m/s $= K/\sqrt5$ ✓. The element is strained (non-zero gradients) but does not rotate.`,
    check: [
      { label: md`$\partial v/\partial x$`, value: 0.12, units: md`\mathrm{s^{-1}}` },
      { label: 'speed', value: 0.4472, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'fv-p4',
    concept: 'free-vortex',
    difficulty: 1,
    q: md`In a free vortex the tangential velocity is $2$ m/s at $r = 0.3$ m. Find (a) $K$, (b) $v_\theta$ at $r = 5$ cm and (c) the radius at which the speed reaches $10$ m/s.`,
    hint: md`In a free vortex $rv_\theta = K$ is the same on every circle. Convert 5 cm to metres first.`,
    answer: md`(a) $K = 0.60\ \mathrm{m^2/s}$; (b) $12$ m/s; (c) $r = 0.060$ m.`,
    solution: md`(a) $K = rv_\theta = 0.3(2) = 0.60\ \mathrm{m^2/s}$.

(b) $v_\theta = K/r = 0.60/0.05 = 12$ m/s.

(c) $r = K/v_\theta = 0.60/10 = 0.060$ m $= 6$ cm.

The product $rv_\theta$ is the same on every streamline — the quickest way to move between radii.`,
    check: [
      { label: md`$K$`, value: 0.6, units: md`\mathrm{m^2/s}` },
      { label: md`$v_\theta$ at 5 cm`, value: 12, units: md`\mathrm{m/s}` },
      { label: md`$r$ for 10 m/s`, value: 0.06, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'ff-p1',
    concept: 'free-vs-forced',
    difficulty: 1,
    q: md`A cylindrical tank of liquid rotates as a rigid body at $30$ rpm. Find the speed at $r = 0.2$ m, the rotation $\omega_z$ and the vorticity $\zeta_z$ of the fluid elements.`,
    hint: md`Convert to rad/s with $K_1 = 2\pi N/60$; rigid-body rotation is the forced vortex $v_\theta = K_1r$, and $\zeta_z = 2\omega_z$.`,
    answer: md`$K_1 = \pi = 3.14$ rad/s; $v_\theta = 0.628$ m/s; $\omega_z = 3.14$ rad/s; $\zeta_z = 6.28\ \mathrm{s^{-1}}$.`,
    solution: md`Rigid-body rotation is the forced vortex $v_\theta = K_1r$, with $K_1$ the angular velocity of the tank:

$$
K_1 = \frac{2\pi N}{60} = \frac{2\pi(30)}{60} = 3.14\ \mathrm{rad/s}
$$

- $v_\theta = K_1r = 3.14(0.2) = 0.628$ m/s
- $\omega_z = \dfrac{1}{2r}\dfrac{d(r\cdot K_1r)}{dr} = K_1 = 3.14$ rad/s — every element turns with the tank
- $\zeta_z = 2\omega_z = 6.28\ \mathrm{s^{-1}}$

Common slip: quoting $\zeta_z = K_1$ — the vorticity is **twice** the rotation.`,
    check: [
      { label: md`$v_\theta$`, value: 0.6283, units: md`\mathrm{m/s}` },
      { label: md`$\zeta_z$`, value: 6.283, units: md`\mathrm{s^{-1}}` },
    ],
  },
  {
    id: 'ff-p2',
    concept: 'free-vs-forced',
    difficulty: 2,
    q: md`A Rankine vortex has free-vortex strength $K = 0.1\ \mathrm{m^2/s}$ outside a forced core of radius $R = 5$ cm. Find the maximum speed and where it occurs, the speed at $r = 2$ cm and at $r = 20$ cm, and the angular velocity of the core.`,
    hint: md`Inside the core $v_\theta = Kr/R^2$; outside $v_\theta = K/r$.`,
    answer: md`$v_{max} = K/R = 2.0$ m/s at $r = R$; $v_\theta(2\ \mathrm{cm}) = 0.80$ m/s; $v_\theta(20\ \mathrm{cm}) = 0.50$ m/s; $\Omega = K/R^2 = 40$ rad/s.`,
    solution: md`The two pieces match at $r = R$, where the speed peaks:

- $\Omega = K/R^2 = 0.1/0.05^2 = 40$ rad/s (core angular velocity)
- $v_{max} = K/R = 0.1/0.05 = 2.0$ m/s at $r = 5$ cm
- $r = 2$ cm (inside the core): $v_\theta = \Omega r = 40(0.02) = 0.80$ m/s
- $r = 20$ cm (outside): $v_\theta = K/r = 0.1/0.2 = 0.50$ m/s

The core rotates with $\omega_z = 40$ rad/s; the outer flow does not rotate. The total circulation is $2\pi K = 0.628\ \mathrm{m^2/s}$.`,
    check: [
      { label: md`$v_{max}$`, value: 2, units: md`\mathrm{m/s}` },
      { label: md`$v_\theta$ at 2 cm`, value: 0.8, units: md`\mathrm{m/s}` },
      { label: md`$v_\theta$ at 20 cm`, value: 0.5, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'ff-p3',
    concept: 'free-vs-forced',
    difficulty: 3,
    q: md`A swirling flow has $v_r = 0$ and $v_\theta = Cr^n$. (a) For which exponent $n$ is it irrotational for all $r \neq 0$? (b) Which $n$ gives rigid-body rotation? (c) For a constant-speed swirl $v_\theta = 2$ m/s ($n = 0$), find $\omega_z$ at $r = 0.5$ m.`,
    hint: md`Use $\omega_z = \dfrac{1}{2r}\dfrac{d(rv_\theta)}{dr}$.`,
    answer: md`(a) $n = -1$ (free vortex); (b) $n = 1$ (forced vortex); (c) $\omega_z = C/(2r) = 2.0$ rad/s — a constant-speed swirl is rotational.`,
    solution: md`For purely swirling flow

$$
\omega_z = \frac{1}{2r}\frac{d(rv_\theta)}{dr} = \frac{1}{2r}\frac{d(Cr^{n+1})}{dr} = \frac{C(n+1)}{2}\,r^{n-1}
$$

(a) $\omega_z = 0$ for all $r \neq 0$ only if $n + 1 = 0$, i.e. $n = -1$: $v_\theta = C/r$, the free vortex.

(b) Rigid-body rotation needs the same $\omega_z$ everywhere, so $r^{n-1}$ must be constant: $n = 1$, $v_\theta = Cr$ with $\omega_z = C$.

(c) $n = 0$: $\omega_z = \dfrac{C}{2r} = \dfrac{2}{2(0.5)} = 2.0$ rad/s.

Fluid moving at constant speed on circles **does** rotate. Curved paths are neither necessary nor sufficient for rotation: only the free-vortex distribution makes the two arm rates cancel.`,
    check: [{ label: md`$\omega_z$ in (c)`, value: 2, units: md`\mathrm{rad/s}` }],
  },
  {
    id: 'circ-p1',
    concept: 'circulation',
    difficulty: 1,
    q: md`A free vortex has circulation $\Gamma = 3\ \mathrm{m^2/s}$ (counter-clockwise). Find (a) $K$ and $v_\theta$ at $r = 0.25$ m; (b) the circulation round a circle of radius $2$ m centred on the vortex; (c) the circulation round a circle of radius $0.5$ m centred at $(2,\ 0)$ m.`,
    hint: md`$K = \Gamma/2\pi$. For (b) and (c), ask only whether the loop encloses the singular point $r = 0$.`,
    answer: md`(a) $K = 0.477\ \mathrm{m^2/s}$, $v_\theta = 1.91$ m/s; (b) $3\ \mathrm{m^2/s}$; (c) $0$.`,
    solution: md`(a) $K = \Gamma/2\pi = 3/2\pi = 0.477\ \mathrm{m^2/s}$, and $v_\theta = \Gamma/(2\pi r) = 3/(2\pi \times 0.25) = 1.91$ m/s.

(b) Every loop that encloses the vortex once counter-clockwise has $\Gamma = 2\pi K = 3\ \mathrm{m^2/s}$ — the radius does not matter.

(c) That circle spans $x = 1.5$ to $2.5$ m and does not contain the origin. Inside it the flow is irrotational with a single-valued $\phi$, so $\Gamma = \oint d\phi = 0$ (slide 14).`,
    check: [
      { label: md`$K$`, value: 0.4775, units: md`\mathrm{m^2/s}` },
      { label: md`$v_\theta$ at 0.25 m`, value: 1.91, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'circ-p2',
    concept: 'circulation',
    difficulty: 2,
    q: md`For the forced vortex $u = -K_1y$, $v = K_1x$ with $K_1 = 4\ \mathrm{s^{-1}}$, find the circulation round (a) a circle of radius $0.3$ m centred on the axis — by direct integration and by Stokes' theorem; (b) a square of side $0.2$ m centred at $(1,\ 0)$ m, edge by edge.`,
    hint: md`On a centred circle $v_\theta = K_1R$ is constant. For the square, only $u$ matters on horizontal edges and only $v$ on vertical edges.`,
    answer: md`(a) $\Gamma = 2\pi K_1R^2 = 2.26\ \mathrm{m^2/s}$; (b) $\Gamma = 0.32\ \mathrm{m^2/s}$ ($= 2K_1 \times 0.04\ \mathrm{m^2}$).`,
    solution: md`(a) $\Gamma = (K_1R)(2\pi R) = 2\pi(4)(0.09) = 2.26\ \mathrm{m^2/s}$. Stokes: $\zeta_z = \pd{v}{x} - \pd{u}{y} = K_1 + K_1 = 8\ \mathrm{s^{-1}}$ and $\Gamma = \zeta_z\pi R^2 = 8(0.2827) = 2.26\ \mathrm{m^2/s}$ ✓.

(b) Corners $(0.9, -0.1)$, $(1.1, -0.1)$, $(1.1, 0.1)$, $(0.9, 0.1)$, counter-clockwise:

| edge | velocity along it | contribution (m²/s) |
|---|---|---|
| bottom, $y = -0.1$, $x$: $0.9 \to 1.1$ | $u = -K_1y = 0.4$ m/s | $0.4 \times 0.2 = 0.08$ |
| right, $x = 1.1$, $y$: $-0.1 \to 0.1$ | $v = K_1x = 4.4$ m/s | $4.4 \times 0.2 = 0.88$ |
| top, $y = 0.1$, $x$: $1.1 \to 0.9$ | $u = -0.4$ m/s | $(-0.4)(-0.2) = 0.08$ |
| left, $x = 0.9$, $y$: $0.1 \to -0.1$ | $v = 3.6$ m/s | $3.6 \times (-0.2) = -0.72$ |

Sum: $0.08 + 0.88 + 0.08 - 0.72 = 0.32\ \mathrm{m^2/s}$, equal to $\zeta_zA = 8(0.04)$ ✓ — although the square is nowhere near the axis.`,
    check: [
      { label: md`$\Gamma$ (circle)`, value: 2.262, units: md`\mathrm{m^2/s}` },
      { label: md`$\Gamma$ (square)`, value: 0.32, units: md`\mathrm{m^2/s}` },
    ],
  },
  {
    id: 'circ-p3',
    concept: 'circulation',
    difficulty: 2,
    q: md`A free vortex with $\Gamma = 2\ \mathrm{m^2/s}$ at the origin is superposed on a uniform stream $U = 3$ m/s in the $+x$ direction. What is the circulation round (a) a circle of radius $1$ m centred at the origin and (b) a circle of radius $1$ m centred at $(3,\ 0)$ m?`,
    hint: md`The circulation integral is linear in $\vb{V}$. What is the circulation of a uniform stream round any closed curve?`,
    answer: md`(a) $2\ \mathrm{m^2/s}$; (b) $0$.`,
    solution: md`Circulation is linear in the velocity: $\Gamma = \oint(\vb{V}_{\text{stream}} + \vb{V}_{\text{vortex}})\cdot d\vb{s} = \Gamma_{\text{stream}} + \Gamma_{\text{vortex}}$.

- Uniform stream: $\phi = Ux$ is single-valued everywhere, so $\oint d\phi = 0$ round **any** closed curve.
- Vortex: $\Gamma$ round loops that enclose the origin, $0$ round loops that miss it.

(a) $\Gamma = 0 + 2 = 2\ \mathrm{m^2/s}$. (b) The circle spans $x = 2$ to $4$ m and misses the origin: $\Gamma = 0 + 0 = 0$.

Adding the stream changed the velocity everywhere but not the circulation — the vortex alone carries it.`,
    check: [{ label: md`$\Gamma$ in (a)`, value: 2, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'circ-p4',
    concept: 'circulation',
    difficulty: 3,
    q: md`The shear flow $u = cy$, $v = 0$ ($c = 2\ \mathrm{s^{-1}}$) has perfectly straight, parallel streamlines. Compute the circulation round the unit square with corners $(0,0)$, $(1,0)$, $(1,1)$, $(0,1)$ m (counter-clockwise) and the rotation $\omega_z$. Is the flow irrotational?`,
    hint: md`Go edge by edge: on the vertical edges $v = 0$, on the horizontal edges only $u$ counts — and the top edge is travelled in the $-x$ direction.`,
    answer: md`$\Gamma = -2\ \mathrm{m^2/s}$ and $\omega_z = -1$ rad/s (clockwise): the flow is **rotational** despite its straight streamlines.`,
    solution: md`Edges, counter-clockwise:

- bottom ($y = 0$): $u = 0$, contribution $0$
- right ($x = 1$) and left ($x = 0$): $v = 0$ and $d\vb{s}$ is vertical, contribution $0$
- top ($y = 1$, travelled from $x = 1$ to $x = 0$): $u = c = 2$ m/s, $\int u\,dx = 2(0 - 1) = -2\ \mathrm{m^2/s}$

So $\Gamma = -2\ \mathrm{m^2/s}$. Rotation: $\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y) = \tfrac12(0 - 2) = -1$ rad/s; vorticity $\zeta_z = -2\ \mathrm{s^{-1}}$, and $\zeta_z \times$ area $= -2\ \mathrm{m^2/s}$ ✓ (Stokes).

Straight paths **with** rotation here, circular paths **without** rotation in the free vortex: rotation is about the orientation of elements, not the shape of their paths.`,
    check: [{ label: md`$\Gamma$`, value: -2, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'tank-p1',
    concept: 'draining-tank',
    difficulty: 1,
    q: md`A draining-tank vortex has $\Gamma = 0.2\ \mathrm{m^2/s}$. Find the swirl speed and the depression of the free surface below the far-field level at $r = 5$ cm and at $r = 10$ cm ($g = 9.81\ \mathrm{m/s^2}$).`,
    hint: md`$v_\theta = \Gamma/(2\pi r)$, and the surface sits one velocity head $v_\theta^2/2g$ below the far-field level.`,
    answer: md`$r = 5$ cm: $v_\theta = 0.637$ m/s, $z_s = -20.7$ mm. $r = 10$ cm: $v_\theta = 0.318$ m/s, $z_s = -5.16$ mm.`,
    solution: md`$v_\theta = \Gamma/(2\pi r)$ and $z_s = -v_\theta^2/(2g) = -\Gamma^2/(8\pi^2r^2g)$:

- $r = 0.05$ m: $v_\theta = 0.2/(2\pi \times 0.05) = 0.637$ m/s; $z_s = -0.637^2/19.62 = -0.0207$ m $= -20.7$ mm
- $r = 0.10$ m: $v_\theta = 0.318$ m/s; $z_s = -0.318^2/19.62 = -0.00516$ m $= -5.16$ mm

Doubling the radius cuts the depth by a factor of $4$.`,
    check: [
      { label: 'depression at 5 cm (mm, positive)', value: 20.66, units: md`\mathrm{mm}` },
      { label: 'depression at 10 cm (mm, positive)', value: 5.164, units: md`\mathrm{mm}` },
    ],
  },
  {
    id: 'tank-p2',
    concept: 'draining-tank',
    difficulty: 2,
    q: md`In a draining tank the free surface at $r = 6$ cm is measured to be $8$ mm below the far-field level. Estimate the circulation $\Gamma$, and predict the depression at $r = 3$ cm.`,
    hint: md`Invert $z_s = -\Gamma^2/(8\pi^2r^2g)$ for $\Gamma$; then use the $1/r^2$ scaling.`,
    answer: md`$\Gamma = 0.149\ \mathrm{m^2/s}$; depression at $3$ cm $= 32$ mm.`,
    solution: md`From $\vert z_s\vert = \Gamma^2/(8\pi^2r^2g)$:

$$
\Gamma = 2\pi r\sqrt{2g\vert z_s\vert} = 2\pi(0.06)\sqrt{2(9.81)(0.008)} = 0.377 \times 0.396 = 0.149\ \mathrm{m^2/s}
$$

At $r = 3$ cm the radius is halved, so the depression is $2^2 = 4$ times larger: $4 \times 8 = 32$ mm. (Directly: $\Gamma^2/(8\pi^2(0.03)^2(9.81)) = 0.032$ m.)`,
    check: [
      { label: md`$\Gamma$`, value: 0.1494, units: md`\mathrm{m^2/s}` },
      { label: 'depression at 3 cm (mm)', value: 32, units: md`\mathrm{mm}` },
    ],
  },
  {
    id: 'tank-p3',
    concept: 'draining-tank',
    difficulty: 2,
    q: md`(a) Show that the radial-equilibrium relation $dz_s/dr = v_\theta^2/(gr)$ reproduces the free-vortex surface $z_s = -\Gamma^2/(8\pi^2r^2g)$. (b) For contrast, a bucket of water spins as a rigid body at $\Omega = 10$ rad/s. How much higher is the surface at the wall, $r = 0.15$ m, than on the axis?`,
    hint: md`(a) Substitute $v_\theta = \Gamma/2\pi r$, integrate in $r$ and fix the constant with $z_s \to 0$ as $r \to \infty$. (b) Use $v_\theta = \Omega r$ in the same relation.`,
    answer: md`(a) Integrating $\Gamma^2/(4\pi^2gr^3)$ gives $-\Gamma^2/(8\pi^2gr^2) + C$ with $C = 0$. (b) $\Delta z = \Omega^2R^2/(2g) = 0.115$ m.`,
    solution: md`(a) For the free vortex $v_\theta^2/(gr) = \Gamma^2/(4\pi^2gr^3)$. Integrating,

$$
z_s = \int \frac{\Gamma^2}{4\pi^2 g\,r^3}\,dr = -\frac{\Gamma^2}{8\pi^2 g\,r^2} + C
$$

and $z_s \to 0$ as $r \to \infty$ gives $C = 0$ — the Bernoulli result, obtained without crossing streamlines.

(b) Forced vortex: $v_\theta = \Omega r$, so $dz_s/dr = \Omega^2r/g$ and $z_s = z_0 + \Omega^2r^2/(2g)$ — a paraboloid that **rises** towards the wall:

$$
\Delta z = \frac{\Omega^2R^2}{2g} = \frac{10^2(0.15)^2}{2(9.81)} = 0.115\ \mathrm{m}
$$

Applying Bernoulli between two surface points here would wrongly predict the surface *falling* towards the wall: in rotational flow the Bernoulli constant changes from streamline to streamline.`,
    check: [{ label: md`$\Delta z$`, value: 0.1147, units: md`\mathrm{m}` }],
  },
  {
    id: 'tank-p4',
    concept: 'draining-tank',
    difficulty: 3,
    q: md`For the vortex of the first problem ($\Gamma = 0.2\ \mathrm{m^2/s}$, water, $\rho = 1000\ \mathrm{kg/m^3}$), find the gauge pressure at a point $0.2$ m below the far-field surface level, at $r = 5$ cm. Compare it with the still-water value $\rho g(0.2\ \mathrm{m})$.`,
    hint: md`Apply Bernoulli from the far-field surface to the submerged point — or use hydrostatics below the local surface.`,
    answer: md`$p = 1759$ Pa (gauge) — about $203$ Pa below the $1962$ Pa of still water.`,
    solution: md`Bernoulli (valid between any two points) from the far-field surface ($p = 0$, $V = 0$, $z = 0$) to the point ($z = -0.2$ m, $V = 0.637$ m/s):

$$
p = \rho g(0.2) - \tfrac12\rho V^2 = 1000(9.81)(0.2) - \tfrac12(1000)(0.637)^2 = 1962 - 203 = 1759\ \mathrm{Pa}
$$

Equivalently, the pressure is hydrostatic below the **local** surface: $p = \rho g(z_s - z) = 9810(-0.0207 + 0.2) = 1759$ Pa. The swirl lowers the pressure at a given depth by $\tfrac12\rho v_\theta^2$ — the same deficit that pulls the surface down.`,
    check: [{ label: md`$p$ (gauge)`, value: 1759, units: md`\mathrm{Pa}` }],
  },
  {
    id: 'tank-p5',
    concept: 'draining-tank',
    difficulty: 3,
    q: md`Real draining vortices have a rotating core. Model one as a Rankine vortex with $\Gamma = 0.1\ \mathrm{m^2/s}$ and core radius $R = 2$ cm. Find the surface depression at $r = R$ and on the axis.`,
    hint: md`Outside the core use the free-vortex result; inside, the forced core gives a paraboloid $z_c + \Omega^2r^2/2g$ with $\Omega = \Gamma/2\pi R^2$.`,
    answer: md`$z_s(R) = -32.3$ mm; on the axis $-64.6$ mm (twice as deep).`,
    solution: md`Outside the core the free-vortex result holds; at $r = R$:

$$
z_s(R) = -\frac{\Gamma^2}{8\pi^2R^2g} = -\frac{0.1^2}{8\pi^2(0.02)^2(9.81)} = -0.0323\ \mathrm{m}
$$

Inside the core (forced vortex, $\Omega = \Gamma/2\pi R^2$) Bernoulli may not be used across streamlines; radial equilibrium gives $z_s = z_c + \Omega^2r^2/2g$. At $r = R$, $\Omega^2R^2/2g = \Gamma^2/(8\pi^2R^2g)$, so matching gives

$$
z_c = z_s(R) - \frac{\Gamma^2}{8\pi^2R^2g} = -2\,\frac{\Gamma^2}{8\pi^2R^2g} = -0.0646\ \mathrm{m}
$$

A finite dimple — the core removes the bottomless funnel of the ideal free vortex.`,
    check: [
      { label: 'depression at r = R (mm)', value: 32.28, units: md`\mathrm{mm}` },
      { label: 'depression on the axis (mm)', value: 64.55, units: md`\mathrm{mm}` },
    ],
  },
]

/* ================================================================== */
/* Quiz                                                                */
/* ================================================================== */

export const quiz: QuizQ[] = [
  {
    id: 'q-fv-1',
    concept: 'free-vortex',
    difficulty: 1,
    src: lec12('11'),
    q: md`For the vortex $\phi = K\theta$, $\psi = -K\ln r$ of Lecture 12, the streamlines are:`,
    options: [md`concentric circles, $r = $ const`, md`radial lines, $\theta = $ const`, 'logarithmic spirals', 'straight parallel lines'],
    answer: 0,
    explain: md`$\psi$ depends only on $r$, so $\psi = $ const means $r = $ const — circles. The radial lines are the **equipotentials** ($\phi = K\theta = $ const). For the source it is the other way round, which is exactly what "interchanging $\phi$ and $\psi$" means.`,
  },
  {
    id: 'q-fv-2',
    concept: 'free-vortex',
    difficulty: 1,
    q: md`In a free vortex $v_\theta = 3$ m/s at $r = 0.2$ m. What is $v_\theta$ at $r = 0.6$ m?`,
    options: ['1 m/s', '9 m/s', '3 m/s', '0.33 m/s'],
    answer: 0,
    explain: md`$v_\theta = K/r$ with $K = 0.2 \times 3 = 0.6\ \mathrm{m^2/s}$, so $v_\theta(0.6) = 1$ m/s. $9$ m/s is what a **forced** vortex ($v_\theta \propto r$) would give; $0.33$ m/s wrongly assumes $v_\theta \propto 1/r^2$.`,
  },
  {
    id: 'q-fv-3',
    concept: 'free-vortex',
    difficulty: 2,
    src: lec12('11–12'),
    q: 'Fluid particles in a free vortex travel on circles. Which statement is correct?',
    options: [
      md`Their rotation $\omega_z$ is zero everywhere except at $r = 0$ — rotation refers to the orientation of an element, not to its path`,
      'They must rotate, because any particle moving on a curved path rotates',
      md`They rotate at their orbital angular speed $v_\theta/r$`,
      md`They rotate only if $K>0$`,
    ],
    answer: 0,
    explain: md`Slide 12: "vortex motion is irrotational". A small element is carried round the circle, but its radial arm turns at $-K/r^2$ while its tangential arm turns at $+K/r^2$, so their average — $\omega_z$ — is zero. $v_\theta/r$ is only the tangential arm's rate (and the orbital rate), not the element's rotation; the sign of $K$ only sets the swirl direction.`,
  },
  {
    id: 'q-fv-4',
    concept: 'free-vortex',
    difficulty: 2,
    q: md`Why does the vortex stream function carry a minus sign, $\psi = -K\ln r$?`,
    options: [
      md`So that $-\partial\psi/\partial r$ gives the same $v_\theta = K/r$ as $(1/r)\,\partial\phi/\partial\theta$`,
      md`Because $\ln r$ is negative for $r < 1$ m`,
      'To make the vortex turn clockwise',
      'Because the vortex is rotational',
    ],
    answer: 0,
    explain: md`With $\phi = K\theta$, $v_\theta = (1/r)\partial\phi/\partial\theta = K/r$. The stream-function relation is $v_\theta = -\partial\psi/\partial r$, which equals $K/r$ only if $\psi = -K\ln r$; without the sign, $\phi$ and $\psi$ would describe opposite swirl directions. The sign of $\ln r$ is irrelevant (any constant may be added to $\psi$).`,
  },
  {
    id: 'q-ff-1',
    concept: 'free-vs-forced',
    difficulty: 1,
    src: lec12('12–13'),
    q: 'Which velocity distribution describes the rotational (forced) vortex of slides 12–13?',
    options: [md`$v_\theta = K_1 r$`, md`$v_\theta = K/r$`, md`$v_r = m/(2\pi r)$`, md`$v_\theta = $ constant`],
    answer: 0,
    explain: md`The forced vortex has $v_\theta \propto r$: every particle completes a lap in the same time, like a solid body. $K/r$ is the irrotational (free) vortex, $m/(2\pi r)$ the radial velocity of a source, and a constant-speed swirl is rotational but is not the forced vortex.`,
  },
  {
    id: 'q-ff-2',
    concept: 'free-vs-forced',
    difficulty: 2,
    q: 'A tiny cork floats on water in a tank that rotates as a rigid body at 2 rad/s. How fast does the cork spin about its own vertical axis?',
    options: ['2 rad/s — once per revolution of the tank', '0 rad/s — fluid particles never spin', '4 rad/s — equal to the vorticity', 'It depends on how far the cork is from the axis'],
    answer: 0,
    explain: md`In a forced vortex $\omega_z = K_1 = 2$ rad/s at every radius, so a small float turns with the fluid — once per revolution. The vorticity is $2\omega_z = 4\ \mathrm{s^{-1}}$, but a small body spins at the rotation $\omega_z$, not at the vorticity. Zero would be the answer in a **free** vortex.`,
  },
  {
    id: 'q-ff-3',
    concept: 'free-vs-forced',
    difficulty: 2,
    src: lec12('4, 12–13'),
    q: 'Why can no velocity potential be written for the forced vortex?',
    options: [
      md`It is rotational ($\omega_z = K_1 \neq 0$), and a potential exists only for irrotational flow`,
      'Its streamlines are circles',
      md`$v_\theta$ grows with $r$, so $\phi$ would become infinite`,
      'It is compressible',
    ],
    answer: 0,
    explain: md`$\vb{V} = \nabla\phi$ forces $\nabla\times\vb{V} = 0$ (slide 4), but the forced vortex has $\omega_z = K_1$ everywhere. Circular streamlines are not the issue — the free vortex has them too and does have $\phi = K\theta$. The forced vortex still has a stream function, $\psi = -\tfrac12K_1r^2$, because it is plane and incompressible.`,
  },
  {
    id: 'q-ff-4',
    concept: 'free-vs-forced',
    difficulty: 3,
    q: 'At r = 0.2 m a free vortex and a forced vortex both move fluid at 2 m/s on the same circle. Which quantity is different for the two?',
    options: [
      md`The radial gradient $dv_\theta/dr$ ($-10$ vs $+10\ \mathrm{s^{-1}}$), and hence $\omega_z$`,
      'The curvature of the particle paths',
      md`The centripetal acceleration $v_\theta^2/r$`,
      'The direction of the velocity',
    ],
    answer: 0,
    explain: md`Same circle and same speed means the same path curvature, direction and centripetal acceleration ($20\ \mathrm{m/s^2}$). What differs is how the speed changes **across** the streamlines: $dv_\theta/dr = -K/r^2 = -10\ \mathrm{s^{-1}}$ (free) versus $K_1 = +10\ \mathrm{s^{-1}}$ (forced), giving $\omega_z = 0$ versus $10$ rad/s.`,
  },
  {
    id: 'q-c-1',
    concept: 'circulation',
    difficulty: 1,
    src: lec12('14'),
    q: 'For an irrotational flow, the circulation around a closed curve that encloses no singular point is:',
    options: ['zero', md`$2\pi K$`, 'the perimeter times the mean speed', 'positive whenever the flow is counter-clockwise'],
    answer: 0,
    explain: md`$\vb{V}\cdot d\vb{s} = d\phi$, so $\Gamma = \oint d\phi = 0$ for a single-valued $\phi$ (slide 14). $2\pi K$ arises only if the curve encloses the free vortex's singular point; perimeter × mean speed ignores the direction of $\vb{V}$ relative to the curve.`,
  },
  {
    id: 'q-c-2',
    concept: 'circulation',
    difficulty: 2,
    src: lec12('15'),
    q: md`For a free vortex of strength $K$, $\Gamma_1$ is the circulation round a circle of radius $1$ m and $\Gamma_2$ round a circle of radius $2$ m, both centred on the vortex. Then:`,
    options: [md`$\Gamma_2 = \Gamma_1 = 2\pi K$`, md`$\Gamma_2 = 2\Gamma_1$`, md`$\Gamma_2 = \Gamma_1/2$`, md`$\Gamma_2 = 4\Gamma_1$`],
    answer: 0,
    explain: md`$\Gamma = \int_0^{2\pi}(K/r)(r\,d\theta) = 2\pi K$: $v_\theta$ halves while the path length doubles. $\Gamma_2 = 4\Gamma_1$ would be the forced vortex ($\Gamma = 2\pi K_1R^2$).`,
  },
  {
    id: 'q-c-3',
    concept: 'circulation',
    difficulty: 2,
    src: lec12('14–15', 'path ABCD drawn on slide 15; zero by the slide-14 result'),
    q: 'In the free vortex, a closed path like ABCD on slide 15 does not enclose the origin. Its circulation is:',
    options: ['zero', md`$2\pi K$`, md`$K\,d\theta$`, md`$-K\,d\theta$`],
    answer: 0,
    explain: md`The radial legs contribute nothing ($\vb{V}\perp d\vb{s}$); the outer arc gives $+K\,d\theta$ and the inner arc, travelled against the flow, $-K\,d\theta$. They cancel exactly — $\pm K\,d\theta$ are the individual arc contributions, not the total.`,
  },
  {
    id: 'q-c-4',
    concept: 'circulation',
    difficulty: 2,
    q: md`The circulation of the forced vortex $v_\theta = K_1 r$ round a circle of radius $R$ centred on the axis is:`,
    options: [md`$2\pi K_1R^2$`, md`$2\pi K_1$`, '0', md`$\pi K_1R^2$`],
    answer: 0,
    explain: md`$\Gamma = (K_1R)(2\pi R) = 2\pi K_1R^2$ — the uniform vorticity $2K_1$ times the area $\pi R^2$. It is not zero because the flow is rotational; $\pi K_1R^2$ forgets that the vorticity is twice the rotation.`,
  },
  {
    id: 'q-t-1',
    concept: 'draining-tank',
    difficulty: 1,
    q: md`According to $z_s = -\Gamma^2/(8\pi^2r^2g)$, doubling the circulation $\Gamma$ makes the surface depression at a fixed radius:`,
    options: ['4 times larger', '2 times larger', md`$\sqrt2$ times larger`, 'unchanged'],
    answer: 0,
    explain: md`$z_s \propto \Gamma^2$: doubling $\Gamma$ doubles the speed, and the velocity head $V^2/2g$ — the depth — goes up by a factor of 4. "2 times" confuses the depth with the speed.`,
  },
  {
    id: 'q-t-2',
    concept: 'draining-tank',
    difficulty: 2,
    src: { doc: 'fox', pages: '222', note: 'Eq. (6.26)' },
    q: 'In the slide-19 problem, why may Bernoulli be applied between a surface point far from the vortex and a surface point near it, although they lie on different streamlines?',
    options: [
      'The free vortex is irrotational, so the Bernoulli constant is the same throughout the flow',
      'Both points are at atmospheric pressure',
      'The flow is two-dimensional',
      'The velocity far away is zero',
    ],
    answer: 0,
    explain: md`Along a streamline Bernoulli needs only steady, inviscid, incompressible flow; across streamlines it also needs **irrotational** flow (Fox Eq. 6.26). The equal (atmospheric) pressures and the zero far-field speed are used *after* choosing the equation — they do not justify it.`,
  },
  {
    id: 'q-t-3',
    concept: 'draining-tank',
    difficulty: 1,
    q: 'The surface of a draining-tank free vortex is 10 mm below the far-field level at r = 4 cm. At r = 2 cm it is:',
    options: ['40 mm below', '20 mm below', '5 mm below', '2.5 mm below'],
    answer: 0,
    explain: md`$z_s \propto 1/r^2$: halving $r$ multiplies the depth by $4$. $20$ mm assumes $1/r$, which is how the *speed* scales.`,
  },
  {
    id: 'q-t-4',
    concept: 'draining-tank',
    difficulty: 2,
    q: 'What does the free-vortex result predict as r → 0, and how do real draining vortices avoid it?',
    options: [
      md`$z_s \to -\infty$ and $v_\theta \to \infty$; real vortices have a rotational core (and often an air core) where the free-vortex model no longer applies`,
      'The surface rises to a peak on the axis because the speed vanishes there',
      'The depth tends to a finite limit set by the tank depth, as the formula shows',
      'The formula stays valid right down to r = 0',
    ],
    answer: 0,
    explain: md`$1/r^2$ blows up on the axis — the ideal free vortex has infinite speed at $r = 0$. Viscosity creates a rotating core (Rankine model) with a finite paraboloidal dip, or the funnel reaches the outlet as an air core. The formula itself contains no tank depth.`,
  },
]

/* ================================================================== */
/* Flashcards & takeaways                                              */
/* ================================================================== */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-fv-1',
    front: md`Free vortex: $\phi$, $\psi$ and velocity?`,
    back: md`$\phi = K\theta$, $\psi = -K\ln r$, $v_\theta = K/r$, $v_r = 0$. Streamlines: circles; equipotentials: radial lines.`,
    src: lec12('11'),
  },
  {
    id: 'fc-fv-2',
    front: 'How is the vortex obtained from the source?',
    back: md`Interchange $\phi$ and $\psi$: source $\phi = \frac{m}{2\pi}\ln r$, $\psi = \frac{m}{2\pi}\theta$ → vortex $\phi = K\theta$, $\psi = -K\ln r$. Circles and rays swap roles.`,
    src: lec12('10–11'),
  },
  {
    id: 'fc-fv-3',
    front: 'Is the free vortex rotational?',
    back: md`No — "vortex motion is irrotational" for every $r \neq 0$: $rv_\theta = K$ is constant, so $\omega_z = \frac{1}{2r}\frac{d(rv_\theta)}{dr} = 0$. Rotation is about orientation, not the path.`,
    src: lec12('12'),
  },
  {
    id: 'fc-ff-1',
    front: 'Forced vortex: velocity distribution and character?',
    back: md`$v_\theta = K_1r$ ($v_\theta \sim r$) — the **rotational (forced) vortex**. Being rotational, it has **no** velocity potential (a potential exists only for irrotational flow).`,
    src: [lec12('12–13'), lec12('4')],
  },
  {
    id: 'fc-ff-4',
    front: 'Forced vortex: rotation, vorticity, stream function?',
    back: md`Rigid-body rotation at angular velocity $K_1$: $\omega_z = \frac{1}{2r}\frac{d(K_1r^2)}{dr} = K_1$ at every point, $\zeta_z = 2K_1$; being plane and incompressible it still has $\psi = -\tfrac12K_1r^2$.`,
  },
  {
    id: 'fc-ff-2',
    front: 'A small cross carried by a free vs a forced vortex?',
    back: md`Free: radial arm turns at $-K/r^2$, tangential arm at $+K/r^2$ — deformed, zero net rotation. Forced: both arms turn at $K_1$ — rotated rigidly, not deformed.`,
  },
  {
    id: 'fc-ff-3',
    front: 'Rankine (combined) vortex?',
    back: md`Forced core $v_\theta = Kr/R^2$ for $r \le R$, free vortex $K/r$ outside; peak speed $K/R$ at $r = R$. Removes the $1/r$ singularity.`,
  },
  {
    id: 'fc-c-1',
    front: 'Define circulation.',
    back: md`$\Gamma = \oint_C\vb{V}\cdot d\vb{s}$ — the line integral of the tangential velocity round a closed curve, counter-clockwise positive (m²/s).`,
    src: lec12('14'),
  },
  {
    id: 'fc-c-2',
    front: 'Circulation of a free vortex?',
    back: md`$\Gamma = \int_0^{2\pi}(K/r)\,r\,d\theta = 2\pi K$ round any loop enclosing the centre once (independent of $r$); $0$ round loops that miss it. So $\phi = \Gamma\theta/2\pi$, $\psi = -(\Gamma/2\pi)\ln r$.`,
    src: lec12('14–15'),
  },
  {
    id: 'fc-c-3',
    front: 'Why is Γ = 0 in irrotational flow — and when is it not?',
    back: md`$\vb{V} = \nabla\phi \Rightarrow \vb{V}\cdot d\vb{s} = d\phi \Rightarrow \Gamma = \oint d\phi = 0$ for a single-valued $\phi$. If a singularity is enclosed (e.g. the vortex centre) the circulation may not be zero.`,
    src: lec12('14'),
  },
  {
    id: 'fc-t-1',
    front: 'Free-surface shape of a draining-tank vortex?',
    back: md`$z_s = -\dfrac{\Gamma^2}{8\pi^2r^2g}$ — the surface sits one velocity head $v_\theta^2/2g$ below the far-field level.`,
  },
  {
    id: 'fc-t-2',
    front: 'Assumptions behind the draining-tank result?',
    back: md`Steady, inviscid, incompressible, **irrotational** (Bernoulli between any two points); $p = p_{atm}$ on the surface; $V \to 0$ far away; valid away from the core and the opening.`,
  },
  {
    id: 'fc-t-3',
    front: 'How does the surface dip scale?',
    back: md`$\propto \Gamma^2$, $\propto 1/r^2$, $\propto 1/g$: double $\Gamma$ → 4× deeper; halve $r$ → 4× deeper.`,
  },
]

export const takeaways: string[] = [
  md`**Free vortex** = the source with $\phi$ and $\psi$ interchanged: $\phi = K\theta$, $\psi = -K\ln r$, $v_\theta = K/r$, $v_r = 0$ — circular streamlines, radial equipotentials.`,
  md`It is **irrotational for every $r \neq 0$** ($rv_\theta = K$ ⇒ $\omega_z = 0$): rotation refers to the *orientation* of an element, not to the path it follows.`,
  md`**Forced vortex** $v_\theta = K_1r$ is rigid-body rotation: $\omega_z = K_1$, $\zeta_z = 2K_1$, rotational — it has a stream function but **no velocity potential**.`,
  md`Same circle and same speed can still give opposite verdicts: $\omega_z = \frac{1}{2r}\frac{d(rv_\theta)}{dr}$ is set by how $v_\theta$ varies **across** the streamlines.`,
  md`**Circulation** $\Gamma = \oint_C\vb{V}\cdot d\vb{s}$ (counter-clockwise positive, m²/s) measures the net swirl along a closed curve.`,
  md`Irrotational flow: $\vb{V}\cdot d\vb{s} = d\phi$, so $\Gamma = \oint d\phi = 0$ — **unless a singularity is enclosed**.`,
  md`Free vortex: $\Gamma = 2\pi K$ round every loop that encloses the centre and $0$ round loops that miss it, so $\phi = \frac{\Gamma}{2\pi}\theta$, $\psi = -\frac{\Gamma}{2\pi}\ln r$, $v_\theta = \frac{\Gamma}{2\pi r}$.`,
  md`Rotational flow: $\Gamma$ = enclosed vorticity — for the forced vortex $2K_1 \times$ area, wherever the loop sits.`,
  md`**Draining tank:** Bernoulli between two free-surface points (allowed across streamlines only because the free vortex is irrotational) gives $z_s = -\Gamma^2/(8\pi^2r^2g)$ — depth $\propto \Gamma^2/r^2$.`,
  md`The ideal free vortex fails as $r \to 0$ (speed and depth $\to \infty$); real vortices have a rotating core — the **Rankine** model.`,
]

/* ================================================================== */
/* Content                                                             */
/* ================================================================== */

function FreeVortexConcept() {
  return (
    <Concept id="free-vortex">
      <Step kind="intro" src={[lec12('11–12'), lec12('10', 'source, for the interchange')]}>
        <Md>{md`
          The third elementary plane potential flow of Lecture 12 is the **vortex**: fluid swirling round a point so that the **streamlines are concentric circles** (slide 11). Its mathematics comes almost for free — take the **source** of slide 10 and **interchange the velocity potential and the stream function**. What was a streamline of the source becomes an equipotential of the vortex, and vice versa:

          $$
          \phi = K\theta, \qquad \psi = -K\ln r, \qquad v_\theta = \frac{1}{r}\pd{\phi}{\theta} = -\pd{\psi}{r} = \frac{K}{r}
          $$

          The tangential speed varies **inversely with the distance** from the centre. Two short statements on slides 11–12 carry the physics:

          - **Vortex motion is irrotational!** Its flow field is described by a velocity potential $\phi$.
          - **Rotation refers to the orientation of a fluid element and not the path followed by the element.** The particles travel on circles, yet (away from $r = 0$) they do not spin.

          The vortex is built on the polar velocity relations of slide 3 and the irrotationality condition of slide 4, and it leads straight to circulation (concept 3) and to superposition (next topic).
        `}</Md>
        <Compare
          items={[
            {
              title: 'Source (slide 10)',
              tone: 'emerald',
              md: md`$\phi = \dfrac{m}{2\pi}\ln r$, $\quad\psi = \dfrac{m}{2\pi}\theta$

$v_r = \dfrac{m}{2\pi r}$, $\quad v_\theta = 0$

Streamlines: **radial lines**. Equipotentials: **circles**.`,
            },
            {
              title: 'Vortex (slide 11)',
              tone: 'violet',
              md: md`$\phi = K\theta$, $\quad\psi = -K\ln r$

$v_r = 0$, $\quad v_\theta = \dfrac{K}{r}$

Streamlines: **circles**. Equipotentials: **radial lines**.`,
            },
          ]}
        />
        <Callout kind="def" title="Free (irrotational) vortex">
          <Md>{md`A plane flow with circular streamlines and $v_\theta = K/r$. The constant $K$ (m²/s) is the vortex strength: $K>0$ swirls counter-clockwise, as drawn on the slides, $K<0$ clockwise. The centre $r = 0$ is a **singular point** where $v_\theta \to \infty$.`}</Md>
        </Callout>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          Picture the swirl above a bathtub drain. Far out the water drifts slowly; close to the drain it whips round. In the free vortex the product $r\,v_\theta$ — the angular momentum per unit mass — is the **same on every circle** ($= K$), just as a figure skater spins faster when she pulls her arms in.

          Now float a tiny matchstick cross on that swirl, one arm along the circle and one along the radius. Two things happen at once:

          - the **tangential arm** is carried round the circle with the flow, so it turns counter-clockwise at the orbital rate $v_\theta/r = +K/r^2$;
          - the inner end of the **radial arm** moves **faster** than its outer end (because $v_\theta \propto 1/r$), which swings that arm clockwise at $dv_\theta/dr = -K/r^2$.

          For $v_\theta = K/r$ the two arms turn **equally fast in opposite directions**, so their average — the rotation $\omega_z$ of the element — is zero: the cross is sheared but, as a whole, does not turn. Picture a gondola on a Ferris wheel that travels round a circle yet stays upright.
        `}</Md>
        <Callout kind="tip" title="Path is not rotation">
          <Md>{md`Curved paths do not imply rotation, and straight paths do not rule it out: the shear flow $u = cy$ has straight streamlines but $\omega_z = -c/2$. Test rotation with velocity **gradients**, never with the shape of the streamlines.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual" src={lec12('11')}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Figure caption={md`Streamlines $\psi = $ const are circles, equipotentials $\phi = $ const are radial lines, and $v_\theta$ is tangent to the circles (counter-clockwise for $K>0$).`} src={lec12('11')}>
            <VortexAnatomy />
          </Figure>
          <Figure caption={md`$v_\theta \sim 1/r$ (drawn for $K = 0.5\ \mathrm{m^2/s}$): the speed grows without bound as $r \to 0$ — the singular point.`} src={lec12('11')}>
            <Plot
              x={{ label: md`radius $r$ (m)`, domain: [0, 2] }}
              y={{ label: md`$v_\theta$ (m/s)`, domain: [0, 5] }}
              series={[{ label: md`$v_\theta = K/r$`, fn: (r) => 0.5 / r, range: [0.06, 2], color: 'var(--plot-4)', width: 2.6 }]}
              marks={[
                { x: 0.25, y: 2, label: '2.0 m/s at 0.25 m' },
                { x: 1, y: 0.5, label: '0.5 m/s at 1 m' },
              ]}
              height={290}
            />
          </Figure>
        </div>
      </Step>

      <Step kind="equations" src={[lec12('11'), lec12('3')]}>
        <Md>{md`Everything follows from the polar velocity relations of slide 3:`}</Md>
        <FormulaCard id="polar-velocity" />
        <Derivation
          title="Building the vortex from the source (slides 10–11)"
          steps={[
            { md: md`Source: $\phi_s = \dfrac{m}{2\pi}\ln r$, $\ \psi_s = \dfrac{m}{2\pi}\theta$ — rays are streamlines, circles are equipotentials.`, why: 'slide 10' },
            { md: md`Interchange the roles — the potential now depends on $\theta$, the stream function on $\ln r$: $\phi = K\theta$, $\ \psi = -K\ln r$.`, why: 'slide 11' },
            { md: md`$v_\theta = \dfrac{1}{r}\pd{\phi}{\theta} = \dfrac{K}{r}$ and $v_\theta = -\pd{\psi}{r} = -\left(-\dfrac{K}{r}\right) = \dfrac{K}{r}$ — the two routes agree.`, why: 'the minus sign in ψ makes them agree' },
            { md: md`$v_r = \pd{\phi}{r} = 0 = \dfrac{1}{r}\pd{\psi}{\theta}$: the motion is purely tangential.`, why: 'no flow crosses a circle' },
            { md: md`$\psi = $ const $\Rightarrow r = $ const (circles); $\phi = $ const $\Rightarrow \theta = $ const (rays) — an orthogonal flow net.`, why: 'shape of the flow net' },
          ]}
        />
        <FormulaCard id="vortex-phi-psi" />
        <FormulaCard id="vortex-velocity" />
        <Supplement title="Checking slide 12's claim: the vortex really is irrotational">
          <Md>{md`Rotation is measured by $\omega_z$ (Lec 9, slides 7–8; Lec 12, slide 4). Write the vortex in Cartesian form and differentiate:`}</Md>
          <div className="mt-3 space-y-3">
            <FormulaCard id="rotation-z" />
            <FormulaCard id="vortex-cartesian" />
          </div>
          <Md className="mt-3">{md`
            The quotient rule gives $\pd{v}{x} = \pd{u}{y} = \dfrac{K(y^2-x^2)}{(x^2+y^2)^2}$, so $\omega_z = 0$ wherever $(x, y) \neq (0, 0)$. The polar route is quicker — Fox's cylindrical form of the irrotationality condition:
          `}</Md>
          <div className="mt-3">
            <FormulaCard id="irrot-polar" />
          </div>
          <Md className="mt-3">{md`
            With $v_r = 0$ and $rv_\theta = K$ (a constant) both terms vanish. Laplace's equation holds as well: $\nabla^2\phi = \dfrac{1}{r^2}\pd{^2(K\theta)}{\theta^2} = 0$ and $\nabla^2\psi = \dfrac{1}{r}\dfrac{d}{dr}\left(r\cdot\dfrac{-K}{r}\right) = 0$.
          `}</Md>
        </Supplement>
        <Callout kind="warning" title="The singular point">
          <Md>{md`At $r = 0$ the speed is infinite and the formulas break down; "irrotational" means $\omega_z = 0$ for every $r \neq 0$. All of the vortex's spin is concentrated at the centre — concept 3 shows how the circulation detects it.`}</Md>
        </Callout>
        <Callout kind="exam">
          <Md>{md`Typical questions: (i) given $\psi = -K\ln r$ (or $\phi = K\theta$), find the velocity and the other function; (ii) show that the flow is irrotational; (iii) find the flow rate between two streamlines, $q = K\ln(r_2/r_1)$. Watch the sign of $\psi$ and the swirl direction set by the sign of $K$.`}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="fv-numbers" />
        <ExampleCard id="fv-psi-to-phi" />
      </Step>

      <Step kind="interactive">
        <FreeVortexExplorer />
      </Step>

      <Step kind="practice">
        <PracticeList concept="free-vortex" />
        <QuickCheck ids={['q-fv-3']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`$\phi = K\theta$, $\psi = -K\ln r$, $v_\theta = K/r$, $v_r = 0$: circular streamlines, radial equipotentials.`,
            md`The vortex is the source with $\phi$ and $\psi$ **interchanged** — the minus sign in $\psi$ keeps both routes to $v_\theta$ consistent.`,
            md`$rv_\theta = K$ on every streamline ⇒ $\omega_z = 0$ for $r \neq 0$: **vortex motion is irrotational**.`,
            md`**Trap:** circular paths do not mean rotation — rotation is the turning of the element, not of its path.`,
            md`The model is singular at $r = 0$ ($v_\theta \to \infty$); real vortices have a core there.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

function FreeVsForcedConcept() {
  return (
    <Concept id="free-vs-forced">
      <Step kind="intro" src={lec12('12–13')}>
        <Md>{md`
          Slides 12–13 put two vortices side by side. Both have **concentric circular streamlines** and swirl counter-clockwise, but their speed distributions are opposite:

          - **left — irrotational (free) vortex:** $v_\theta \sim 1/r$;
          - **right — rotational (forced) vortex:** $v_\theta \sim r$, written $v_\theta = K_1 r$.

          The sketches follow a small cross-shaped fluid element from **A** to **B**. In the free vortex the cross arrives distorted — its two arms have turned in opposite directions — while the element as a whole has not rotated. In the forced vortex the cross arrives with its arms still perpendicular, turned through roughly the angle it travelled round the centre: it has rotated like a piece of a solid body. This is the bullet of slide 12 made visible: **rotation refers to the orientation of a fluid element and not the path followed by the element.**
        `}</Md>
        <Supplement title="What “forced” means">
          <Md>{md`In the forced vortex every particle completes a lap in the same time $2\pi/K_1$ — the fluid turns as a **rigid body** with angular velocity $K_1$ (rad/s), so every element rotates with $\omega_z = K_1$. Because it is rotational, the forced vortex has **no velocity potential** (a potential exists only when $\nabla\times\vb{V} = 0$, Lec 12 slide 4), although, being plane and incompressible, it does have a stream function.`}</Md>
        </Supplement>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          **Forced vortex — the spinning bucket.** Put a cup of coffee on a turntable and wait: friction with the walls eventually drags all of the liquid into **solid-body rotation**. Every particle completes a lap in the same time, so a small cork floating anywhere turns once per revolution and always faces the axis the same way — like a horse on a merry-go-round. The fluid rotates.

          **Free vortex — the Ferris wheel.** In the free vortex inner fluid laps outer fluid (lap time $\propto r^2$) and the shear stretches every element. Yet a tiny float keeps pointing in the same compass direction as it orbits, like a gondola that stays upright on a Ferris wheel. The fluid does not rotate.

          **Real vortices** — a bathtub drain, a tornado, a wing-tip vortex — are both at once: a rotating, forced **core** surrounded by a free, irrotational outer region (the Rankine model below).
        `}</Md>
        <Callout kind="tip" title="Same circle, same speed, opposite verdict">
          <Md>{md`At $r = 0.2$ m a free vortex with $K = 0.4\ \mathrm{m^2/s}$ and a forced vortex with $K_1 = 10\ \mathrm{s^{-1}}$ both move the fluid at $2$ m/s, with the same centripetal acceleration. Only $dv_\theta/dr$ — how the speed changes **across** the streamlines — tells them apart.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual" src={lec12('12–13')}>
        <Figure
          caption={md`Animated recreation of the A → B sketches of slides 12–13. Element A orbits at the same rate in both panels; the floats' arrows show orientation, the dyed cross shows deformation. Switch modes to compare.`}
          src={lec12('12–13')}
        >
          <ElementOrbits />
        </Figure>
      </Step>

      <Step kind="equations" src={lec12('12–13')}>
        <FormulaCard id="forced-vortex" />
        <Supplement title="Why one vortex rotates and the other does not">
          <Md>{md`By definition (Lec 9, slide 7) $\omega_z$ is the **average angular velocity of two mutually perpendicular line segments**. In a purely swirling flow take one segment radial and one tangential:`}</Md>
          <div className="mt-3">
            <FormulaCard id="rotation-polar" />
          </div>
          <div className="mt-3">
            <Derivation
              steps={[
                { md: md`Radial segment from $r$ to $r + \delta r$: its outer end moves sideways at $v_\theta + \dfrac{dv_\theta}{dr}\delta r$, its inner end at $v_\theta$, so it swings round at $\dfrac{dv_\theta}{dr}$.`, why: 'sheared by the speed difference' },
                { md: md`Tangential segment: its ends are carried round the centre, so it turns with the radius vector at $\dfrac{v_\theta}{r}$.`, why: 'turned by the orbit' },
                { md: md`Average: $\omega_z = \dfrac{1}{2}\left(\dfrac{dv_\theta}{dr} + \dfrac{v_\theta}{r}\right) = \dfrac{1}{2r}\dfrac{d(rv_\theta)}{dr}$.`, why: md`definition of $\omega_z$` },
                { md: md`Free, $v_\theta = K/r$: $\ \tfrac12\left(-\dfrac{K}{r^2} + \dfrac{K}{r^2}\right) = 0$ — the arms turn in **opposite** directions at equal rates.`, why: 'left sketch: distorted, not rotated' },
                { md: md`Forced, $v_\theta = K_1r$: $\ \tfrac12(K_1 + K_1) = K_1$ — both arms turn **together**.`, why: 'right sketch: rotated, not distorted' },
              ]}
            />
          </div>
          <div className="mt-3">
            <FormulaCard id="forced-vortex-props" />
          </div>
          <Md className="mt-3">{md`
            | | Free (irrotational) vortex | Forced (rotational) vortex |
            |---|---|---|
            | speed | $v_\theta = K/r$ | $v_\theta = K_1r$ |
            | $rv_\theta$ | $K$ on every circle | $K_1r^2$ |
            | lap time $2\pi r/v_\theta$ | $2\pi r^2/K$ — inner fluid laps outer | $2\pi/K_1$ — all together |
            | rotation $\omega_z$ | $0$ (for $r \neq 0$) | $K_1$ |
            | vorticity $\zeta_z$ | $0$ | $2K_1$ |
            | velocity potential | $\phi = K\theta$ | none |
            | stream function | $\psi = -K\ln r$ | $\psi = -\tfrac12K_1r^2$ |
            | small element | sheared, not rotated | rotated, not sheared |
            | Bernoulli constant | the same everywhere | changes from circle to circle |
          `}</Md>
        </Supplement>
        <Supplement title="Real vortices: the Rankine model">
          <Md>{md`Neither ideal vortex is realistic on its own: the free vortex has infinite speed at the centre, the forced vortex infinite speed far away. Nature splices them together — viscosity forces solid-body rotation in a core of radius $R$, and outside it the flow is a free vortex:`}</Md>
          <div className="mt-3">
            <FormulaCard id="rankine" />
          </div>
        </Supplement>
        <Callout kind="exam">
          <Md>{md`Classify a swirl by computing $\omega_z = \frac{1}{2r}\frac{d(rv_\theta)}{dr}$ — never by looking at the streamlines. Remember $\zeta_z = 2\omega_z$, and that only the irrotational (free) vortex has a velocity potential.`}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="ff-turntable" />
        <ExampleCard id="ff-arms" />
      </Step>

      <Step kind="interactive">
        <VortexProfiles />
      </Step>

      <Step kind="practice">
        <PracticeList concept="free-vs-forced" />
        <QuickCheck ids={['q-ff-2']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`Free: $v_\theta = K/r$, irrotational, has $\phi$. Forced: $v_\theta = K_1r$, rigid-body rotation, $\omega_z = K_1$, no $\phi$.`,
            md`$\omega_z = \frac{1}{2r}\frac{d(rv_\theta)}{dr}$ — the average of the radial-arm rate $dv_\theta/dr$ and the tangential-arm rate $v_\theta/r$.`,
            md`Free vortex: elements are **sheared** (arms at $\mp K/r^2$) but not rotated; forced vortex: **rotated** but not sheared.`,
            md`**Trap:** vorticity is twice the rotation — a forced vortex has $\zeta_z = 2K_1$, while a small float spins at $K_1$.`,
            md`Real vortices ≈ Rankine: forced core inside $r = R$, free vortex outside, peak speed $K/R$ at $r = R$.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

function CirculationConcept() {
  return (
    <Concept id="circulation">
      <Step kind="intro" src={lec12('14–15')}>
        <Md>{md`
          Slide 14 defines the **circulation** $\Gamma$ of a closed curve $C$ as the **line integral of the tangential component of the velocity taken around the curve**, traversed counter-clockwise:

          $$
          \Gamma = \oint_C \vb{V}\cdot d\vb{s}
          $$

          For an **irrotational** flow $\vb{V} = \nabla\phi$, so $\vb{V}\cdot d\vb{s} = \nabla\phi\cdot d\vb{s} = d\phi$ and

          $$
          \Gamma = \oint_C d\phi = 0
          $$

          The slide's two bullets: **for an irrotational flow the circulation will generally be zero** — but **if there are singularities enclosed within the curve, the circulation may not be zero**.

          The free vortex is exactly that case (slide 15). Round a circle of radius $r$, $\Gamma = \int_0^{2\pi}\frac{K}{r}(r\,d\theta) = 2\pi K$ — non-zero, because the circle encloses the singular point $r = 0$. The vortex strength therefore *is* a circulation, $K = \Gamma/2\pi$, and the **velocity potential and stream function for the free vortex** become $\phi = \frac{\Gamma}{2\pi}\theta$ and $\psi = -\frac{\Gamma}{2\pi}\ln r$.
        `}</Md>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          Walk once round the loop carrying a vane that reads the wind **along your path**, and add up (reading × distance walked). Tail-wind stretches add, head-wind stretches subtract; the total is $\Gamma$ — the net amount by which the flow "goes round" the loop.

          Why does irrotational flow give zero? Think of $\phi$ as **altitude on a hill**: $\vb{V}\cdot d\vb{s} = d\phi$ is the height gained on each step, and any closed walk ends at the altitude it started from. The free vortex is different because $\phi = K\theta$ is a **spiral staircase** (a car-park ramp): every lap round the centre climbs $2\pi K$, and you never return to the same floor. A loop that does not go round the centre climbs, descends and comes back to where it started.
        `}</Md>
        <Figure caption={md`$\phi = K\theta$ followed along two loops, with $K = 1/2\pi\ \mathrm{m^2/s}$ so that $\Gamma = 1\ \mathrm{m^2/s}$: round the vortex $\phi$ climbs $\Gamma$ per lap; beside the vortex it returns to its starting value.`}>
          <PotentialStaircase />
        </Figure>
        <Callout kind="key" title="Circulation counts enclosed vorticity">
          <Md>{md`Stokes' theorem: $\Gamma = \iint_A \zeta_z\,dA$. An irrotational region contributes nothing. The free vortex hides all of its vorticity at the single point $r = 0$ — which is why *every* loop round it, big or small, round or square, collects the same $\Gamma$, and every loop beside it collects none.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual" src={lec12('14–15')}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Figure caption={md`Slide 14: an arbitrary closed curve $C$, the line element $d\vb{s}$ (tangent to $C$) and the local velocity $\vb{V}$. Only the component $V\cos\alpha$ along $d\vb{s}$ contributes to $\Gamma$.`} src={lec12('14')}>
            <ArbitraryCurveFig />
          </Figure>
          <Figure caption={md`Slide 15: free-vortex streamlines, an arc $ds = r\,d\theta$ and the closed path ABCD, which does not enclose the centre. Leg colours and contributions are added here.`} src={lec12('15')}>
            <SectorPathFig />
          </Figure>
        </div>
      </Step>

      <Step kind="equations" src={lec12('14–15')}>
        <FormulaCard id="circulation-def" />
        <FormulaCard id="circulation-irrot" />
        <FormulaCard id="circulation-free-vortex" />
        <FormulaCard id="vortex-gamma" />
        <Supplement title="Two results you will use constantly">
          <div className="space-y-3">
            <FormulaCard id="vtheta-gamma" />
            <FormulaCard id="stokes-circulation" />
          </div>
          <Md className="mt-3">{md`The contrast in one line: free vortex — $\Gamma$ is the same for every loop round the centre and zero otherwise; forced vortex — $\Gamma = 2K_1 \times$ (area enclosed), wherever the loop is.`}</Md>
        </Supplement>
        <Callout kind="warning">
          <Md>{md`Direction matters: a clockwise traverse flips the sign of $\Gamma$, and a loop that winds twice round the vortex collects $2\Gamma$. The integrand is $\vb{V}\cdot d\vb{s}$ — the **tangential** component — not the speed $\vert\vb{V}\vert$.`}</Md>
        </Callout>
        <Callout kind="exam">
          <Md>{md`Expect to (i) evaluate $\Gamma$ round a given path (circle, rectangle, sector) leg by leg; (ii) argue $\Gamma = 0$ from irrotationality unless a singular point is enclosed; (iii) convert between $K$ and $\Gamma$ ($\Gamma = 2\pi K$) and write $\phi$, $\psi$, $v_\theta$ in terms of $\Gamma$.`}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="circ-free-vortex" />
        <ExampleCard id="circ-abcd" />
        <ExampleCard id="circ-forced" />
      </Step>

      <Step kind="interactive">
        <CirculationLab />
      </Step>

      <Step kind="practice">
        <PracticeList concept="circulation" />
        <QuickCheck ids={['q-c-3']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`$\Gamma = \oint_C\vb{V}\cdot d\vb{s}$, counter-clockwise positive; only the tangential velocity counts.`,
            md`Irrotational flow with single-valued $\phi$: $\Gamma = \oint d\phi = 0$.`,
            md`Free vortex: $\Gamma = 2\pi K$ for every loop round the centre, $0$ for loops that miss it (path ABCD).`,
            md`In terms of $\Gamma$: $\phi = \frac{\Gamma}{2\pi}\theta$, $\psi = -\frac{\Gamma}{2\pi}\ln r$, $v_\theta = \frac{\Gamma}{2\pi r}$.`,
            md`Rotational flow: $\Gamma = \iint\zeta_z\,dA$ — for the forced vortex $2K_1 \times$ area, wherever the loop sits.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

function DrainingTankConcept() {
  return (
    <Concept id="draining-tank">
      <Step kind="intro" src={lec12('19')}>
        <Md>{md`
          Slide 19 closes the lecture with an application: **a liquid drains from a large tank through a small opening, and a vortex forms.** Away from the opening its velocity distribution can be approximated by a **free vortex** with velocity potential

          $$
          \phi = \frac{\Gamma}{2\pi}\theta
          $$

          The task: **determine an expression relating the shape of the free surface to the strength of the vortex, as specified by the circulation $\Gamma$.** The slide's photograph shows the answer qualitatively — a wide, shallow dip at the top that narrows into a twisting air core running down towards the drain.

          The slide states the problem only; the solution in this concept is written for this platform. It combines the free-vortex velocity (concepts 1 and 3) with the Bernoulli equation.
        `}</Md>
      </Step>

      <Step kind="intuition">
        <Md>{md`
          On a free surface the pressure is fixed (atmospheric), so **the height of the surface plays the role of the pressure**. Bernoulli says fast-moving fluid has low pressure — at a free surface that can only show up as a **lower surface**. In the free vortex the speed grows as $1/r$, so the surface sags gently far out and plunges near the axis: a funnel.

          Another view: water moving on a circle needs an inward (centripetal) force $\rho v_\theta^2/r$ per unit volume. It is supplied by a pressure that increases outward — that is, by a surface that slopes **up** away from the axis. The faster the swirl, the steeper the slope.
        `}</Md>
        <Callout kind="note" title="Contrast: the rotating bucket">
          <Md>{md`In **both** vortices the surface rises away from the axis — the outward pressure rise must supply the centripetal force. What differs is *where* it is steep. Free vortex: the slope $dz_s/dr \propto v_\theta^2/r \propto 1/r^3$ is steepest near the axis, giving a narrow funnel. Forced vortex (a spinning bucket): the speed *increases* outward, the slope $\propto r$ is zero on the axis and steepest at the wall — a paraboloid.`}</Md>
        </Callout>
      </Step>

      <Step kind="visual">
        <Figure
          caption={md`Vertical section through a draining-tank vortex, computed to true scale from the platform solution below ($\Gamma = 0.12\ \mathrm{m^2/s}$, water) — compare it with the photograph on Lec 12, slide 19. Far out (point 1) the surface is practically at the undisturbed level; closer in it is depressed and plunges near the axis into an air core that runs down the drain; point 2 is a surface point at radius $r$.`}
        >
          <TankFigure />
        </Figure>
      </Step>

      <Step kind="equations">
        <Md>{md`Two ingredients: the free-vortex speed $v_\theta = \Gamma/2\pi r$ (concept 3) and the Bernoulli equation — used between points on **different** streamlines, which is legitimate only because the free vortex is irrotational.`}</Md>
        <FormulaCard id="bernoulli-irrot" />
        <Derivation
          title="Solution of the slide-19 problem"
          steps={[
            { md: md`Velocity from the given potential: $v_r = \pd{\phi}{r} = 0$, $\ v_\theta = \dfrac{1}{r}\pd{\phi}{\theta} = \dfrac{\Gamma}{2\pi r}$, so $V = \dfrac{\Gamma}{2\pi r}$.`, why: 'polar relations (Lec 12, slide 3)' },
            { md: md`The flow is irrotational, so $\dfrac{p_1}{\gamma} + \dfrac{V_1^2}{2g} + z_1 = \dfrac{p_2}{\gamma} + \dfrac{V_2^2}{2g} + z_2$ holds between **any** two points.`, why: 'Fox Eq. (6.26)' },
            { md: md`Put both points on the free surface: $p_1 = p_2 = 0$ (gauge).`, why: 'atmospheric pressure on the surface' },
            { md: md`Point 1 far away: $r \to \infty$, $V_1 \to 0$, $z_1 = 0$ (datum). Point 2 at radius $r$: $V_2 = \Gamma/2\pi r$, $z_2 = z_s$.`, why: 'choice of points' },
            { md: md`$0 = \dfrac{1}{2g}\left(\dfrac{\Gamma}{2\pi r}\right)^2 + z_s \;\Rightarrow\; z_s = -\dfrac{\Gamma^2}{8\pi^2 r^2 g}$`, why: 'solve for the surface elevation' },
          ]}
        />
        <FormulaCard id="surface-profile" />
        <Supplement title="Cross-check without Bernoulli — and what happens in the core">
          <Md>{md`Radial force balance gives the surface slope directly, for any swirl. It reproduces the free-vortex profile and also handles the rotating core, where Bernoulli across streamlines is not allowed:`}</Md>
          <div className="mt-3 space-y-3">
            <FormulaCard id="radial-equilibrium" />
            <FormulaCard id="rankine-surface" />
          </div>
        </Supplement>
        <Callout kind="warning">
          <Md>{md`The free-vortex result fails near the axis ($z_s \to -\infty$) and near the opening, where radial and vertical velocities are no longer small. And never apply Bernoulli **across** streamlines in a rotational region (the forced core): it would even get the direction of the surface slope wrong there.`}</Md>
        </Callout>
        <Callout kind="exam">
          <Md>{md`State the assumptions (steady, inviscid, incompressible, **irrotational**), choose both points on the free surface ($p = p_{atm}$), put the datum at the far-field level, and finish with $z_s = -v_\theta^2/2g = -\Gamma^2/(8\pi^2r^2g)$. Scaling questions: depth $\propto \Gamma^2$, $\propto 1/r^2$.`}</Md>
        </Callout>
      </Step>

      <Step kind="example">
        <ExampleCard id="tank-slide19" />
        <ExampleCard id="tank-numbers" />
      </Step>

      <Step kind="interactive">
        <DrainingTankSim />
      </Step>

      <Step kind="practice">
        <PracticeList concept="draining-tank" />
        <QuickCheck ids={['q-t-2']} />
      </Step>

      <Step kind="takeaways">
        <Takeaways
          items={[
            md`Free-surface points share $p = p_{atm}$, so Bernoulli turns the velocity head into a surface depression: $z_s = -v_\theta^2/2g$.`,
            md`With $v_\theta = \Gamma/2\pi r$: $z_s = -\Gamma^2/(8\pi^2r^2g)$ — depth $\propto \Gamma^2$, $\propto 1/r^2$, $\propto 1/g$.`,
            md`Crossing streamlines with Bernoulli is legitimate **only** because the free vortex is irrotational.`,
            md`The ideal result is bottomless at $r = 0$; a rotating (Rankine) core gives a finite dip, twice the free-vortex depth at $r = R$.`,
          ]}
        />
      </Step>
    </Concept>
  )
}

export default function Content() {
  return (
    <>
      <FreeVortexConcept />
      <FreeVsForcedConcept />
      <CirculationConcept />
      <DrainingTankConcept />
    </>
  )
}
