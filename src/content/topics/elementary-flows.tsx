import { useState } from 'react'
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowRow, FlowSteps, FormulaCard, Md, Plot, PracticeList,
  QuickCheck, Step, Supplement, Takeaways, md,
} from '@/kit'
import { RotatedAxesSketch, UniformSketch } from '../sims/elementary-flows/UniformSketch'
import { SourceSketch } from '../sims/elementary-flows/SourceSketch'
import { RadialParticles } from '../sims/elementary-flows/RadialParticles'
import { UniformExplorer } from '../sims/elementary-flows/UniformExplorer'
import { RadialProfile, SourceExplorer } from '../sims/elementary-flows/SourceExplorer'
import { SuperpositionPreview } from '../sims/elementary-flows/SuperpositionPreview'

/* ────────────────────────────────────────────────────────────────────────────
 * Topic: Uniform flow, source & sink — Lecture 12 slides 8–10
 * ──────────────────────────────────────────────────────────────────────────── */

export const meta: TopicMeta = {
  id: 'elementary-flows',
  unit: 'B',
  title: 'Uniform Flow, Source & Sink',
  subtitle:
    'The first building blocks of plane potential flow — a straight uniform stream and a radial line source or sink: their φ, ψ, velocities, flow rates and pressures.',
  minutes: 75,
  sources: [
    { doc: 'lec12', pages: '8–10', note: 'primary' },
    { doc: 'lec12', pages: '2–3, 5–6', note: 'Laplace, φ/ψ relations, q = ψ₂ − ψ₁' },
    { doc: 'lec12', pages: '16–18', note: 'superposition preview, Bernoulli' },
    { doc: 'lec10', pages: '2, 8', note: 'polar velocity relations, polar Laplacian' },
    { doc: 'fox', pages: '222–223', note: 'Eqs. (6.26), (6.31)–(6.32)' },
  ],
  concepts: [
    {
      id: 'uniform-flow',
      title: 'Uniform flow — along x and at an angle α',
      src: { doc: 'lec12', pages: '8–9' },
      summary: 'Straight, parallel streamlines at constant speed U: φ = Ux, ψ = Uy, and φ = U(x cos α + y sin α), ψ = U(y cos α − x sin α) for a stream inclined at α.',
    },
    {
      id: 'source-sink',
      title: 'Line source and sink',
      src: { doc: 'lec12', pages: '10' },
      summary: 'Radial outflow (m > 0) or inflow (m < 0) from a line: (2πr)v_r = m, v_r = m/2πr, φ = (m/2π) ln r, ψ = (m/2π)θ.',
    },
  ],
  sourceNote: md`**Primary source:** Lecture 12, slides 8–10 (uniform flow; source and sink). Lecture 12 prints **no equation numbers**, so formulas are cited by slide. Tools borrowed from neighbouring slides — velocity from $\phi$ and $\psi$ (slide 3), $q = \psi_2 - \psi_1$ (slide 6), Bernoulli (slide 18 and Fox Eq. (6.26)) — are cited where they are used. The convention "$m > 0$ source, $m < 0$ sink" is standard but not printed, so it is marked supplementary. This course uses $\vb{V} = +\nabla\phi$; Fox & McDonald use $\vb{V} = -\nabla\phi$, which flips the sign of every $\phi$ (but never of $\psi$).`,
}

/* ─────────────────────────────── formulas ─────────────────────────────── */

export const formulas: FormulaDef[] = [
  {
    id: 'vel-cart',
    name: 'Velocity from φ and ψ — Cartesian (plane flow)',
    tex: md`u=\pd{\phi}{x},\quad v=\pd{\phi}{y}\qquad\qquad u=\pd{\psi}{y},\quad v=-\pd{\psi}{x}`,
    vars: [
      { sym: md`u,\ v`, desc: 'velocity components in the $+x$ and $+y$ directions', units: md`\mathrm{m/s}` },
      { sym: md`\phi(x,y)`, desc: md`velocity potential ($\vb{V} = \nabla\phi$, course convention)`, units: md`\mathrm{m^2/s}` },
      { sym: md`\psi(x,y)`, desc: 'stream function (volume flow per unit depth)', units: md`\mathrm{m^2/s}` },
      { sym: md`x,\ y`, desc: 'Cartesian coordinates in the plane of the flow', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`$\phi$ exists when the flow is **irrotational**`,
      md`$\psi$ exists for **plane, incompressible** flow`,
      md`both together: plane, incompressible, irrotational (= potential) flow`,
    ],
    use: md`Integrate these relations to build $\phi$ and $\psi$ from a known velocity field (slide 8 does exactly this for the uniform flow), or differentiate a given $\phi$ or $\psi$ to get $u$ and $v$. Watch the **minus sign** in $v = -\partial\psi/\partial x$.`,
    src: { doc: 'lec12', pages: '3' },
  },
  {
    id: 'uniform-x',
    name: 'Uniform flow along +x',
    key: true,
    tex: md`\phi = Ux \qquad \psi = Uy \qquad (u = U,\ v = 0)`,
    vars: [
      { sym: md`U`, desc: 'constant speed of the stream, directed along $+x$', units: md`\mathrm{m/s}` },
      { sym: md`\phi`, desc: 'velocity potential (integration constant $C$ dropped)', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi`, desc: 'stream function, chosen zero on the $x$-axis', units: md`\mathrm{m^2/s}` },
      { sym: md`x,\ y`, desc: 'coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`streamlines straight and parallel to $x$; the same speed $U$ everywhere`,
      md`plane, incompressible, irrotational (inviscid) flow`,
      md`additive constants are arbitrary — only derivatives of $\phi$ and differences of $\psi$ are physical`,
    ],
    use: md`Streamlines are the lines $y =$ const, equipotentials the lines $x =$ const. Flow between two streamlines: $\psi_2 - \psi_1 = U(y_2 - y_1)$ per metre depth.`,
    src: { doc: 'lec12', pages: '8' },
  },
  {
    id: 'uniform-alpha',
    name: 'Uniform flow at an angle α',
    key: true,
    tex: md`\phi = U(x\cos\alpha + y\sin\alpha) \qquad \psi = U(y\cos\alpha - x\sin\alpha)`,
    vars: [
      { sym: md`U`, desc: 'speed of the stream', units: md`\mathrm{m/s}` },
      { sym: md`\alpha`, desc: 'direction of the stream, measured counter-clockwise from the $+x$ axis', units: md`\mathrm{rad}\ \text{or}\ {}^\circ` },
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`x,\ y`, desc: 'coordinates', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`uniform stream: straight, parallel streamlines inclined at $\alpha$, constant speed`,
      md`plane, incompressible, irrotational flow`,
      md`$\alpha = 0$ recovers $\phi = Ux$, $\psi = Uy$ (slide 8)`,
    ],
    use: md`Streamlines are the lines $y\cos\alpha - x\sin\alpha =$ const (slope $\tan\alpha$); equipotentials are $x\cos\alpha + y\sin\alpha =$ const (slope $-\cot\alpha$), perpendicular to them. Always check the sign by differentiating: $v = -\partial\psi/\partial x = +U\sin\alpha$.`,
    src: { doc: 'lec12', pages: '9' },
  },
  {
    id: 'uniform-alpha-vel',
    name: 'Velocity components of an inclined uniform stream',
    tex: md`u = \pd{\phi}{x} = U\cos\alpha \qquad v = \pd{\phi}{y} = U\sin\alpha \qquad \sqrt{u^2+v^2} = U`,
    vars: [
      { sym: md`u,\ v`, desc: 'velocity components (the same at every point)', units: md`\mathrm{m/s}` },
      { sym: md`U,\ \alpha`, desc: 'speed and direction of the stream', units: md`\mathrm{m/s},\ \mathrm{rad}` },
    ],
    conditions: ['same as for the inclined uniform flow (obtained by differentiating the slide-9 potential)'],
    use: md`Reverse use: a field with constant $(u, v)$ is a uniform stream with $U = \sqrt{u^2+v^2}$ and $\alpha = \operatorname{atan2}(v, u)$ — use the two-argument arctangent (or a sketch) so the quadrant is right.`,
  },
  {
    id: 'uniform-polar',
    name: 'Uniform stream (+x) in polar coordinates',
    tex: md`\phi = Ur\cos\theta \quad \psi = Ur\sin\theta \qquad\qquad v_r = U\cos\theta \quad v_\theta = -U\sin\theta`,
    vars: [
      { sym: md`r,\ \theta`, desc: md`polar coordinates: $x = r\cos\theta$, $y = r\sin\theta$ ($\theta$ counter-clockwise from $+x$)`, units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`v_r,\ v_\theta`, desc: 'radial (outward) and tangential (counter-clockwise) velocity components', units: md`\mathrm{m/s}` },
      { sym: md`U`, desc: 'speed of the stream along $+x$', units: md`\mathrm{m/s}` },
    ],
    conditions: [md`the same uniform stream as $\phi = Ux$, $\psi = Uy$, just written in polar coordinates`],
    use: md`Use this form whenever the stream is combined with a source, sink or vortex at the origin, whose formulas are simplest in polar coordinates — slide 16 writes $\psi_{\text{uniform flow}} = Ur\sin\theta$. Note $v_\theta = -U\sin\theta$: above the axis the stream moves clockwise relative to the origin.`,
    src: [
      { doc: 'lec12', pages: '16', note: 'uniform-flow terms of φ and ψ' },
      { doc: 'lec12', pages: '18', note: 'U cos θ and −U sin θ terms' },
    ],
  },
  {
    id: 'q-psi',
    name: 'Volume flow rate between two streamlines',
    tex: md`q = \psi_2 - \psi_1`,
    vars: [
      { sym: md`q`, desc: 'volume flow rate passing between the two streamlines, **per unit depth** normal to the $x$–$y$ plane', units: md`\mathrm{m^2/s}` },
      { sym: md`\psi_1,\ \psi_2`, desc: 'values of the stream function on the two streamlines (or at two points)', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'plane, incompressible flow (ψ exists) — irrotationality is not needed',
      'per unit depth: multiply by the depth to get m³/s',
    ],
    use: md`Sign (slide 6): with $\psi_2$ on the upper streamline, $q > 0$ flows to the right, $q < 0$ to the left. Equivalently, $\psi_B - \psi_A$ is the flow crossing any curve from $A$ to $B$ from left to right as you walk from $A$ to $B$ — whatever the shape of the curve. For a uniform stream, $q = U \times$ (perpendicular distance between the two streamlines).`,
    src: { doc: 'lec12', pages: '6' },
  },
  {
    id: 'laplace-2d',
    name: "Laplace's equation for φ and ψ (plane potential flow)",
    tex: md`\nabla^2\phi = \pd{^2\phi}{x^2} + \pd{^2\phi}{y^2} = 0 \qquad\qquad \nabla^2\psi = \pd{^2\psi}{x^2} + \pd{^2\psi}{y^2} = 0`,
    vars: [
      { sym: md`\nabla^2`, desc: 'Laplacian operator', units: md`\mathrm{m^{-2}}` },
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      md`for $\phi$: incompressible (continuity) **and** irrotational (so that $\phi$ exists) — slide 2 prints the 3-D form with $\partial^2\phi/\partial z^2$`,
      md`for $\psi$: plane and **irrotational** ($\psi$ itself exists for any plane incompressible flow) — slide 5`,
      'inviscid + incompressible + irrotational = "potential flow"',
    ],
    use: md`Every elementary flow must satisfy it — check a candidate by taking second derivatives. The equation is **linear**, so sums of solutions are again solutions: the basis of the method of superposition (slide 16).`,
    src: [
      { doc: 'lec12', pages: '2' },
      { doc: 'lec12', pages: '5' },
      { doc: 'fox', pages: '223', note: 'Eqs. (6.31), (6.32)' },
    ],
  },
  {
    id: 'vel-polar',
    name: 'Velocity from φ and ψ — polar (plane flow)',
    tex: md`v_r=\pd{\phi}{r},\quad v_\theta=\frac{1}{r}\pd{\phi}{\theta}\qquad\qquad v_r=\frac{1}{r}\pd{\psi}{\theta},\quad v_\theta=-\pd{\psi}{r}`,
    vars: [
      { sym: md`v_r`, desc: 'radial velocity, positive **outward** (increasing $r$)', units: md`\mathrm{m/s}` },
      { sym: md`v_\theta`, desc: md`tangential velocity, positive **counter-clockwise** (increasing $\theta$)`, units: md`\mathrm{m/s}` },
      { sym: md`r,\ \theta`, desc: 'distance from the origin and polar angle from $+x$', units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['same existence conditions as the Cartesian relations (φ: irrotational; ψ: plane, incompressible)'],
    use: md`Memory aid: the factor $1/r$ always sits on the $\theta$-derivative (that turns an angle change into a distance $r\,d\theta$); the minus sign sits on $v_\theta$ from $\psi$. Convert to Cartesian with $u = v_r\cos\theta - v_\theta\sin\theta$, $v = v_r\sin\theta + v_\theta\cos\theta$.`,
    src: [
      { doc: 'lec12', pages: '3' },
      { doc: 'lec10', pages: '2, 8' },
    ],
  },
  {
    id: 'source-vr',
    name: 'Line source/sink: continuity gives the radial velocity',
    key: true,
    tex: md`(2\pi r)\,v_r = m \quad\Longrightarrow\quad v_r = \frac{m}{2\pi r}, \qquad v_\theta = 0`,
    vars: [
      { sym: md`m`, desc: 'source strength: **volume rate of flow per unit length** of the line', units: md`\mathrm{m^2/s}` },
      { sym: md`r`, desc: 'distance from the source line', units: md`\mathrm{m}` },
      { sym: md`2\pi r`, desc: 'surface area, per unit length, of a cylinder of radius $r$ around the line', units: md`\mathrm{m}` },
      { sym: md`v_r,\ v_\theta`, desc: 'radial and tangential velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'plane flow from a line perpendicular to the x–y plane, equal in all directions',
      'steady, incompressible',
      md`valid for $r > 0$ only — $r = 0$ is a singular point`,
      md`$m > 0$ source (outflow), $m < 0$ sink (inflow) — standard sign convention`,
    ],
    use: md`The speed halves when $r$ doubles. At a point $(x, y)$: $r = \sqrt{x^2+y^2}$, then $u = v_r\cos\theta$ and $v = v_r\sin\theta$ (purely radial flow).`,
    src: { doc: 'lec12', pages: '10' },
  },
  {
    id: 'source-phi-psi',
    name: 'Line source/sink: velocity potential and stream function',
    key: true,
    tex: md`\phi = \frac{m}{2\pi}\ln r \qquad\qquad \psi = \frac{m}{2\pi}\,\theta`,
    vars: [
      { sym: md`\phi,\ \psi`, desc: 'velocity potential and stream function', units: md`\mathrm{m^2/s}` },
      { sym: md`m`, desc: 'source strength (negative for a sink)', units: md`\mathrm{m^2/s}` },
      { sym: md`r`, desc: 'distance from the source', units: md`\mathrm{m}` },
      { sym: md`\theta`, desc: 'polar angle measured counter-clockwise from $+x$ — in **radians**', units: md`\mathrm{rad}` },
    ],
    conditions: [
      'incompressible and irrotational everywhere except at r = 0',
      'integration constants set to zero',
    ],
    use: md`Streamlines $\psi =$ const are the rays $\theta =$ const; equipotentials $\phi =$ const are the circles $r =$ const. Going once round the source increases $\psi$ by $m$ — the stream function is multi-valued, which is exactly why the flow between two rays is $(m/2\pi)\,\Delta\theta$.`,
    src: { doc: 'lec12', pages: '10' },
  },
  {
    id: 'source-cart',
    name: 'Source at (x₀, y₀) in Cartesian form',
    tex: md`u = \frac{m}{2\pi}\,\frac{x-x_0}{(x-x_0)^2+(y-y_0)^2} \qquad v = \frac{m}{2\pi}\,\frac{y-y_0}{(x-x_0)^2+(y-y_0)^2}`,
    vars: [
      { sym: md`(x_0,\ y_0)`, desc: 'position of the source (or sink) line', units: md`\mathrm{m}` },
      { sym: md`u,\ v`, desc: 'velocity components at the field point $(x, y)$', units: md`\mathrm{m/s}` },
      { sym: md`m`, desc: 'strength ($m < 0$ for a sink)', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [md`same as the polar form; follows from $u = v_r\cos\theta$, $v = v_r\sin\theta$ with $\cos\theta = (x-x_0)/r$, $\sin\theta = (y-y_0)/r$`],
    use: md`Handy for superposition: the velocities of several sources and sinks at different points simply add as vectors. The matching potential is $\phi = \frac{m}{4\pi}\ln\big[(x-x_0)^2+(y-y_0)^2\big]$.`,
  },
  {
    id: 'rays-q',
    name: 'Flow rate between two rays of a source/sink',
    tex: md`q_{12} = \psi_2 - \psi_1 = \frac{m}{2\pi}\,(\theta_2 - \theta_1)`,
    vars: [
      { sym: md`q_{12}`, desc: 'volume flow per unit depth crossing any curve joining the two rays', units: md`\mathrm{m^2/s}` },
      { sym: md`\theta_1,\ \theta_2`, desc: 'directions of the two rays (counter-clockwise, in **radians**)', units: md`\mathrm{rad}` },
      { sym: md`m`, desc: 'source strength', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'combines q = ψ₂ − ψ₁ (slide 6) with ψ = (m/2π)θ (slide 10)',
      'independent of the radius: no fluid crosses a ray (rays are streamlines)',
    ],
    use: md`The fraction of the source's output between the rays is $(\theta_2-\theta_1)/2\pi$. For a sink $q_{12} < 0$: the flow crosses inward.`,
  },
  {
    id: 'laplace-polar',
    name: "Laplace's equation in polar coordinates (plane flow)",
    tex: md`\nabla^2\phi = \frac{1}{r}\pd{}{r}\!\left(r\pd{\phi}{r}\right) + \frac{1}{r^2}\pd{^2\phi}{\theta^2} = 0`,
    vars: [
      { sym: md`r,\ \theta`, desc: 'polar coordinates', units: md`\mathrm{m},\ \mathrm{rad}` },
      { sym: md`\phi`, desc: md`velocity potential (the same operator applies to $\psi$ in plane irrotational flow)`, units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      md`plane flow: the $\partial^2\phi/\partial z^2$ term of the printed cylindrical form is zero`,
      'incompressible, irrotational',
    ],
    use: md`Quick test for radial flows: if $\phi = \phi(r)$ only, $\nabla^2\phi = \frac{1}{r}\frac{d}{dr}\!\left(r\frac{d\phi}{dr}\right)$, which vanishes exactly when $r\,d\phi/dr$ is constant — i.e. $\phi \propto \ln r$.`,
    src: { doc: 'lec10', pages: '8', note: 'cylindrical form, z-term dropped' },
  },
  {
    id: 'bernoulli-2pt',
    name: 'Bernoulli between any two points (irrotational flow)',
    tex: md`p_1 + \tfrac12\rho V_1^2 = p_2 + \tfrac12\rho V_2^2`,
    vars: [
      { sym: md`p_1,\ p_2`, desc: 'static pressure at points 1 and 2', units: md`\mathrm{Pa}` },
      { sym: md`V_1,\ V_2`, desc: 'local flow speed at the two points', units: md`\mathrm{m/s}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: [
      'steady, inviscid, incompressible flow',
      md`**irrotational** ⇒ valid between **any** two points, not only along one streamline`,
      md`points at the same elevation (horizontal plane); otherwise add $\rho g z$ to each side`,
    ],
    use: md`In potential flow: first get the speed from $\phi$ or $\psi$, then the pressure from Bernoulli. Slide 18 writes it with the free stream as point 1: $p_0 + \tfrac12\rho U^2 = p + \tfrac12\rho V^2$.`,
    src: [
      { doc: 'lec12', pages: '18', note: 'p₀ + ½ρU² = p + ½ρV²' },
      { doc: 'fox', pages: '222', note: 'Eq. (6.26), any two points' },
    ],
  },
  {
    id: 'source-pressure',
    name: 'Pressure field around a line source or sink',
    tex: md`p(r) = p_\infty - \frac{\rho\,m^2}{8\pi^2 r^2} \qquad\Longrightarrow\qquad p_2 - p_1 = \frac{\rho\,m^2}{8\pi^2}\left(\frac{1}{r_1^2} - \frac{1}{r_2^2}\right)`,
    vars: [
      { sym: md`p_\infty`, desc: md`pressure far from the source ($r \to \infty$, where $V \to 0$)`, units: md`\mathrm{Pa}` },
      { sym: md`r_1,\ r_2`, desc: 'two radii', units: md`\mathrm{m}` },
      { sym: md`\rho,\ m`, desc: 'density and source strength', units: md`\mathrm{kg/m^3},\ \mathrm{m^2/s}` },
    ],
    conditions: [
      'Bernoulli between r and r → ∞ (irrotational, same elevation)',
      md`identical for a source and a sink of the same $\lvert m\rvert$ (only $m^2$ appears)`,
      md`fails as $r \to 0$ (it predicts $p \to -\infty$)`,
    ],
    use: md`Substitute $V = \lvert m\rvert/(2\pi r)$ into Bernoulli. The pressure always **rises** with distance from a source or sink, because the fluid is slower there.`,
  },
]

/* ─────────────────────────────── examples ─────────────────────────────── */

export const examples: ExampleDef[] = [
  {
    id: 'ex-uniform-alpha',
    concept: 'uniform-flow',
    title: 'Inclined stream: φ, ψ, velocity and flow through a gap',
    difficulty: 1,
    given: md`A uniform stream of speed $U = 5$ m/s is inclined at $\alpha = 30^\circ$ to the $x$-axis. Points $A(0,\ 0)$ and $B(0,\ 2)$ m. Plane flow, per metre depth.`,
    find: md`(a) $\phi$ and $\psi$; (b) $u$ and $v$; (c) the volume flow rate crossing the straight segment $AB$ and its direction; (d) the slopes of the streamlines and equipotentials, and $p_B - p_A$.`,
    assumptions: md`steady, inviscid, incompressible, irrotational plane flow; $A$ and $B$ at the same elevation.`,
    steps: [
      {
        title: 'Write φ and ψ (slide 9)',
        md: md`With $\cos 30^\circ = 0.8660$ and $\sin 30^\circ = 0.5$:

$$
\phi = 5(0.8660\,x + 0.5\,y) = 4.330\,x + 2.5\,y, \qquad \psi = 5(0.8660\,y - 0.5\,x) = 4.330\,y - 2.5\,x \quad (\mathrm{m^2/s})
$$`,
      },
      {
        title: 'Velocity components',
        md: md`$u = \partial\phi/\partial x = 4.330$ m/s and $v = \partial\phi/\partial y = 2.500$ m/s. Check with $\psi$: $\partial\psi/\partial y = 4.330 = u$ ✓ and $-\partial\psi/\partial x = +2.5 = v$ ✓. Speed $\sqrt{4.330^2 + 2.5^2} = 5.00$ m/s $= U$ ✓.`,
      },
      {
        title: 'Flow rate through AB from ψ',
        md: md`$\psi_A = 0$, $\psi_B = 4.330(2) - 2.5(0) = 8.660$ m²/s, so $q = \psi_B - \psi_A = 8.660$ m²/s per metre depth. The **upper** point has the larger $\psi$, so the flow crosses $AB$ toward $+x$ (slide 6). Direct check: only $u$ crosses a vertical segment, $q = u \cdot \overline{AB} = 4.330 \times 2 = 8.660$ m²/s ✓.`,
      },
      {
        title: 'Slopes and pressure',
        md: md`Streamlines: $dy/dx = v/u = \tan 30^\circ = 0.5774$. Equipotentials: $dy/dx = -u/v = -1.732$. Product $= -1$ → perpendicular. The speed is $5$ m/s at both points, so Bernoulli gives $p_B - p_A = \tfrac12\rho(V_A^2 - V_B^2) = 0$.`,
      },
    ],
    answer: md`(a) $\phi = 4.330x + 2.5y$, $\psi = 4.330y - 2.5x$ (m²/s); (b) $u = 4.33$ m/s, $v = 2.50$ m/s; (c) $q = 8.66$ m²/s per metre depth, crossing $AB$ toward $+x$; (d) slopes $0.577$ and $-1.732$ (product $-1$); $p_B - p_A = 0$.`,
    insight: 'The flow through a gap depends only on ψ at its two ends — any curve from A to B, straight or wiggly, carries the same 8.66 m²/s.',
  },
  {
    id: 'ex-uniform-identify',
    concept: 'uniform-flow',
    title: 'Recognising a uniform flow from its stream function',
    difficulty: 2,
    given: md`$\psi = 3y - 4x$ (m²/s, with $x$ and $y$ in m).`,
    find: md`(a) Show the flow is uniform and find $U$ and $\alpha$; (b) find $\phi$ and check Laplace's equation; (c) the flow rate between the streamlines through $O(0,\ 0)$ and $P(1,\ 2)$ m, and their perpendicular spacing.`,
    steps: [
      {
        title: 'Velocity field',
        md: md`$u = \partial\psi/\partial y = 3$ m/s and $v = -\partial\psi/\partial x = +4$ m/s — the same at every point, so the streamlines are straight and parallel and the speed is constant: a **uniform flow**.`,
      },
      {
        title: 'Match with slide 9',
        md: md`$\psi = U(y\cos\alpha - x\sin\alpha)$ requires $U\cos\alpha = 3$ and $U\sin\alpha = 4$, so

$$
U = \sqrt{3^2 + 4^2} = 5\ \mathrm{m/s}, \qquad \alpha = \operatorname{atan2}(4,\ 3) = 53.13^\circ .
$$`,
      },
      {
        title: 'Velocity potential',
        md: md`$\partial\phi/\partial x = u = 3 \Rightarrow \phi = 3x + f(y)$; then $\partial\phi/\partial y = f'(y) = v = 4 \Rightarrow \phi = 3x + 4y$ (+ const). Check: $U(x\cos\alpha + y\sin\alpha) = 5(0.6x + 0.8y) = 3x + 4y$ ✓.`,
      },
      {
        title: "Laplace's equation",
        md: md`All second derivatives of $3x + 4y$ and of $3y - 4x$ are zero, so $\nabla^2\phi = \nabla^2\psi = 0$ ✓ (and $\partial v/\partial x - \partial u/\partial y = 0$: irrotational).`,
      },
      {
        title: 'Flow between the streamlines',
        md: md`$\psi_O = 0$ and $\psi_P = 3(2) - 4(1) = 2$ m²/s, so $q = 2$ m²/s per metre. Spacing: $d = q/U = 2/5 = 0.4$ m. Check: the streamline through $P$ is the line $3y - 4x = 2$, whose distance from $O$ is $\lvert -2\rvert/\sqrt{3^2+4^2} = 0.4$ m ✓.`,
      },
    ],
    answer: md`Uniform stream, $U = 5$ m/s at $\alpha = 53.1^\circ$; $\phi = 3x + 4y$ (Laplace satisfied); $q = 2$ m²/s between streamlines $0.4$ m apart.`,
    insight: 'For a uniform flow q = U × (perpendicular spacing): ψ is literally "U times distance across the stream".',
  },
  {
    id: 'ex-source-pipe',
    concept: 'source-sink',
    title: 'Perforated pipe as a line source: velocity, flow between rays, pressure',
    difficulty: 2,
    given: md`A long perforated pipe along the $z$-axis discharges $Q = 0.6$ m³/s of water ($\rho = 1000$ kg/m³) uniformly over a length $L = 1.5$ m, radially in all directions. Model it as a line source in a horizontal plane.`,
    find: md`(a) the strength $m$; (b) $v_r$, $u$, $v$, $\phi$ and $\psi$ at $P(0.12,\ 0.16)$ m; (c) the discharge between the rays $\theta = 0$ and $\theta = 60^\circ$; (d) $p_2 - p_1$ between $r_1 = 0.2$ m and $r_2 = 0.5$ m.`,
    assumptions: md`steady, inviscid, incompressible, irrotational plane flow away from the pipe; end effects ignored.`,
    steps: [
      {
        title: 'Strength = volume flow per unit length',
        md: md`$m = Q/L = 0.6/1.5 = 0.4$ m²/s, so $m/2\pi = 0.06366$ m²/s.`,
      },
      {
        title: 'Polar coordinates of P',
        md: md`$r = \sqrt{0.12^2 + 0.16^2} = 0.20$ m and $\theta = \operatorname{atan2}(0.16,\ 0.12) = 53.13^\circ = 0.9273$ rad.`,
      },
      {
        title: 'Velocity at P (slide 10)',
        md: md`$v_r = \dfrac{m}{2\pi r} = \dfrac{0.4}{2\pi(0.2)} = 0.3183$ m/s, $v_\theta = 0$. Cartesian: $u = v_r\cos\theta = 0.3183(0.6) = 0.1910$ m/s, $v = v_r\sin\theta = 0.3183(0.8) = 0.2546$ m/s.`,
      },
      {
        title: 'φ and ψ at P',
        md: md`$\phi = \frac{m}{2\pi}\ln r = 0.06366\,\ln 0.2 = 0.06366(-1.6094) = -0.1025$ m²/s; $\;\psi = \frac{m}{2\pi}\theta = 0.06366(0.9273) = 0.05903$ m²/s.`,
      },
      {
        title: 'Flow between two rays',
        md: md`$q = \psi_2 - \psi_1 = \frac{m}{2\pi}(\theta_2 - \theta_1) = 0.06366 \times \frac{\pi}{3} = 0.06667$ m²/s per metre; over $L = 1.5$ m that is $0.100$ m³/s $= Q/6$ — a $60^\circ$ wedge is one sixth of the circle ✓.`,
      },
      {
        title: 'Bernoulli between two radii',
        md: md`The flow is irrotational, so Bernoulli holds between any two points: $v_1 = 0.3183$ m/s at $r_1 = 0.2$ m and $v_2 = \frac{0.4}{2\pi(0.5)} = 0.1273$ m/s at $r_2 = 0.5$ m.

$$
p_2 - p_1 = \tfrac12\rho\,(v_1^2 - v_2^2) = 500\,(0.10132 - 0.01621) = 42.6\ \mathrm{Pa}
$$`,
      },
    ],
    answer: md`(a) $m = 0.4$ m²/s; (b) $v_r = 0.318$ m/s ($u = 0.191$, $v = 0.255$ m/s), $\phi = -0.102$ m²/s, $\psi = 0.0590$ m²/s; (c) $q = 0.0667$ m²/s per metre $= 0.100$ m³/s for the pipe; (d) $p_2 - p_1 = +42.6$ Pa — the pressure rises outward.`,
    insight: 'The standard exam chain: strength → velocity at a point → flow between rays → Bernoulli between radii. The pressure rises outward because the fluid decelerates.',
  },
  {
    id: 'ex-sink-potential',
    concept: 'source-sink',
    title: 'Identifying a sink from φ, and a particle’s travel time',
    difficulty: 3,
    given: md`A plane flow has $\phi = -4\ln r$ (m²/s, $r$ in m).`,
    find: md`(a) the type and strength of the flow; (b) $v_r$, $v_\theta$ and $(u, v)$ at $r = 2$ m, $\theta = 120^\circ$; (c) $\psi$; (d) the time a fluid particle takes to move from $r = 2$ m to $r = 1$ m.`,
    steps: [
      {
        title: 'Compare with slide 10',
        md: md`$\phi = \frac{m}{2\pi}\ln r$ with $\frac{m}{2\pi} = -4$, so $m = -8\pi = -25.1$ m²/s. Negative strength: a **sink** swallowing $25.1$ m²/s per metre of its length.`,
      },
      {
        title: 'Polar velocity',
        md: md`$v_r = \partial\phi/\partial r = -4/r = -2.0$ m/s at $r = 2$ m (inward); $v_\theta = \frac1r\,\partial\phi/\partial\theta = 0$.`,
      },
      {
        title: 'Cartesian components',
        md: md`$u = v_r\cos\theta = -2(-0.5) = +1.0$ m/s, $\;v = v_r\sin\theta = -2(0.8660) = -1.732$ m/s. The point lies up and to the left of the sink, so the velocity points down and to the right — toward the origin ✓.`,
      },
      {
        title: 'Stream function',
        md: md`$\psi = \frac{m}{2\pi}\theta = -4\theta$. Check: $v_r = \frac1r\,\partial\psi/\partial\theta = -4/r$ ✓, $v_\theta = -\partial\psi/\partial r = 0$ ✓.`,
      },
      {
        title: 'Travel time',
        md: md`Along a ray $dr/dt = v_r = -4/r$, so $r\,dr = -4\,dt$. Integrating from $r = 2$ to $r = 1$:

$$
\frac{1^2 - 2^2}{2} = -4t \quad\Longrightarrow\quad t = \frac{3}{8} = 0.375\ \mathrm{s}
$$`,
      },
    ],
    answer: md`(a) Sink with $m = -8\pi = -25.1$ m²/s; (b) $v_r = -2.0$ m/s, $v_\theta = 0$, $(u, v) = (1.00,\ -1.73)$ m/s; (c) $\psi = -4\theta$; (d) $t = 0.375$ s.`,
    insight: 'Area check: the fluid inside the circle shrinks from π·2² to π·1² m² per metre at the rate |m| = 8π m²/s, so t = 3π/8π = 0.375 s. A sink is simply a negative source.',
  },
]

/* ─────────────────────────────── practice ─────────────────────────────── */

export const practice: PracticeDef[] = [
  {
    id: 'pr-uniform-phi',
    concept: 'uniform-flow',
    difficulty: 1,
    q: md`A plane flow has velocity potential $\phi = 6x$ (m²/s, $x$ in m). (a) Describe the flow and give its speed. (b) Find $\psi$, taking $\psi = 0$ on the $x$-axis. (c) What volume flow rate per metre depth passes between the streamlines $y = 0.5$ m and $y = 2$ m?`,
    hint: md`Compare with slide 8 ($\phi = Ux$), then use $q = \psi_2 - \psi_1$.`,
    answer: md`A uniform stream along $+x$ with $U = 6$ m/s; $\psi = 6y$; $q = 9$ m²/s.`,
    solution: md`1. $u = \partial\phi/\partial x = 6$ m/s and $v = \partial\phi/\partial y = 0$: a uniform flow along $+x$ with $U = 6$ m/s.
2. $\partial\psi/\partial y = u = 6$ and $\partial\psi/\partial x = -v = 0$, so $\psi = 6y$ (the constant is zero because $\psi = 0$ on $y = 0$).
3. $q = \psi(y{=}2) - \psi(y{=}0.5) = 12 - 3 = 9$ m²/s per metre depth. It flows toward $+x$, because the upper streamline has the larger $\psi$.`,
    check: [{ label: md`$q$`, value: 9, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'pr-uniform-150',
    concept: 'uniform-flow',
    difficulty: 2,
    q: md`A uniform stream has $U = 2$ m/s and flows at $\alpha = 150^\circ$ (up and to the left). (a) Find $u$ and $v$. (b) Find $\psi$ at $B(1,\ 1)$ m, with $\psi = 0$ at the origin $O$. (c) What volume flow rate per metre depth crosses the straight segment $OB$, and in which direction?`,
    hint: md`$\cos 150^\circ = -0.8660$, $\sin 150^\circ = 0.5$. $\psi_B - \psi_O$ is the flow crossing $OB$ from left to right as you walk from $O$ to $B$.`,
    answer: md`$u = -1.732$ m/s, $v = 1.000$ m/s; $\psi_B = -2.732$ m²/s; $\lvert q\rvert = 2.73$ m²/s, crossing $OB$ from its lower-right side to its upper-left side.`,
    solution: md`1. $u = U\cos\alpha = 2(-0.8660) = -1.732$ m/s and $v = U\sin\alpha = 2(0.5) = 1.000$ m/s.
2. $\psi_B = U(y\cos\alpha - x\sin\alpha) = 2\left[(1)(-0.8660) - (1)(0.5)\right] = -2.732$ m²/s.
3. $q = \psi_B - \psi_O = -2.732$ m²/s. Walking from $O$ to $B$ (direction $45^\circ$) your right hand points down-right; a **negative** value means the net flow crosses from the right side to the left side, i.e. toward the upper-left — as expected for a stream heading at $150^\circ$.
4. Check with components: the unit normal pointing up-left is $\vb{n} = (-0.7071,\ 0.7071)$; $\vb{V}\cdot\vb{n} = (-1.732)(-0.7071) + (1)(0.7071) = 1.932$ m/s; times $\overline{OB} = \sqrt2 = 1.414$ m gives $2.732$ m²/s ✓.`,
    check: [
      { label: md`$u$`, value: -1.732, units: md`\mathrm{m/s}` },
      { label: md`$\lvert q\rvert$`, value: 2.732, units: md`\mathrm{m^2/s}` },
    ],
  },
  {
    id: 'pr-uniform-net',
    concept: 'uniform-flow',
    difficulty: 2,
    q: md`A flow net for a uniform stream ($U = 2.5$ m/s, $\alpha = 40^\circ$) is drawn with equal increments $\Delta\psi = \Delta\phi = 0.5$ m²/s. (a) How far apart are neighbouring streamlines, and neighbouring equipotentials? What shape are the cells? (b) Where does the streamline $\psi = 1.0$ m²/s cross the $x$-axis?`,
    hint: md`Across the stream $\psi = U \times$ distance; along it $\phi = U \times$ distance. On the $x$-axis, $y = 0$.`,
    answer: md`(a) both spacings are $\Delta\psi/U = 0.2$ m: the net is made of $0.2$ m squares; (b) at $x = -0.622$ m.`,
    solution: md`1. Write $\psi = Un$ and $\phi = Us$, where $n = y\cos\alpha - x\sin\alpha$ is the distance across the stream and $s = x\cos\alpha + y\sin\alpha$ the distance along it.
2. Neighbouring streamlines: $\Delta n = \Delta\psi/U = 0.5/2.5 = 0.2$ m. Neighbouring equipotentials: $\Delta s = \Delta\phi/U = 0.2$ m. The lines are perpendicular with equal spacing, so the cells are **squares**.
3. On $y = 0$: $\psi = -Ux\sin\alpha = 1.0 \Rightarrow x = -\dfrac{1.0}{2.5\sin 40^\circ} = -\dfrac{1.0}{2.5(0.6428)} = -0.622$ m.
4. Sense check: $\psi > 0$ lies to the left of the flow direction ($40^\circ$), which contains the negative $x$-axis, so a negative $x$ is expected.`,
    check: [
      { label: 'spacing', value: 0.2, units: md`\mathrm{m}` },
      { label: md`$x$`, value: -0.6223, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-uniform-superpose',
    concept: 'uniform-flow',
    difficulty: 2,
    q: md`Superpose two uniform streams: $U_1 = 3$ m/s along $+x$ and $U_2 = 4$ m/s along $+y$. (a) Write the combined $\phi$ and $\psi$. (b) Show that the result is again a uniform flow and find its speed and direction.`,
    hint: md`A stream along $+y$ is the case $\alpha = 90^\circ$ of slide 9: $\phi = U_2 y$, $\psi = -U_2 x$.`,
    answer: md`$\phi = 3x + 4y$, $\psi = 3y - 4x$: a uniform stream with $U = 5$ m/s at $\alpha = 53.1^\circ$.`,
    solution: md`1. Stream 1 ($\alpha = 0$): $\phi_1 = 3x$, $\psi_1 = 3y$. Stream 2 ($\alpha = 90^\circ$): $\phi_2 = 4(x\cos 90^\circ + y\sin 90^\circ) = 4y$, $\psi_2 = 4(y\cos 90^\circ - x\sin 90^\circ) = -4x$.
2. Laplace's equation is linear, so the sums are again potential flows: $\phi = 3x + 4y$ and $\psi = 3y - 4x$.
3. $u = \partial\phi/\partial x = 3$ and $v = \partial\phi/\partial y = 4$ are constants → uniform flow with $U = \sqrt{3^2 + 4^2} = 5$ m/s and $\alpha = \operatorname{atan2}(4,\ 3) = 53.13^\circ$.
4. Check with slide 9: $5(x\cos 53.13^\circ + y\sin 53.13^\circ) = 5(0.6x + 0.8y) = 3x + 4y$ ✓. Superposing velocity potentials is the same as adding velocity vectors.`,
    check: [
      { label: md`$U$`, value: 5, units: md`\mathrm{m/s}` },
      { label: md`$\alpha$`, value: 53.13, units: md`{}^\circ` },
    ],
  },
  {
    id: 'pr-source-speed',
    concept: 'source-sink',
    difficulty: 1,
    q: md`A line source has strength $m = 3$ m²/s. (a) Find the radial speed at $r = 0.5$ m and at $r = 1.5$ m. (b) At what radius has the speed fallen to $0.2$ m/s?`,
    hint: md`$v_r = m/(2\pi r)$ — the speed is inversely proportional to $r$.`,
    answer: md`(a) $0.955$ m/s and $0.318$ m/s (three times farther → one third of the speed); (b) $r = 2.39$ m.`,
    solution: md`1. $v_r(0.5) = \dfrac{3}{2\pi(0.5)} = 0.955$ m/s.
2. $v_r(1.5) = \dfrac{3}{2\pi(1.5)} = 0.318$ m/s — exactly one third, since $v_r \propto 1/r$.
3. $r = \dfrac{m}{2\pi v_r} = \dfrac{3}{2\pi(0.2)} = 2.39$ m.
4. Continuity check: $2\pi(2.387)(0.2) = 3.00$ m²/s $= m$ ✓.`,
    check: [
      { label: md`$v_r$ at $0.5$ m`, value: 0.9549, units: md`\mathrm{m/s}` },
      { label: md`$r$`, value: 2.387, units: md`\mathrm{m}` },
    ],
  },
  {
    id: 'pr-source-rays',
    concept: 'source-sink',
    difficulty: 1,
    q: md`A line source discharges $m = 12$ m²/s. (a) Evaluate $\psi$ on the rays $\theta = 20^\circ$ and $\theta = 80^\circ$. (b) How much flow (per metre) passes between these rays, and what fraction of the source's output is it? (c) Does the answer depend on the radius at which you measure it?`,
    hint: md`Convert the angles to radians before using $\psi = (m/2\pi)\theta$.`,
    answer: md`(a) $\psi = 0.667$ and $2.667$ m²/s; (b) $q = 2.0$ m²/s, one sixth of $m$; (c) no — the rays are streamlines, so the same flow passes at every radius.`,
    solution: md`1. $m/2\pi = 12/2\pi = 1.910$ m²/s per radian; $\theta_1 = 20^\circ = 0.3491$ rad, $\theta_2 = 80^\circ = 1.3963$ rad.
2. $\psi_1 = 1.910(0.3491) = 0.667$ m²/s and $\psi_2 = 1.910(1.3963) = 2.667$ m²/s.
3. $q = \psi_2 - \psi_1 = 2.0$ m²/s (positive: crossing outward); fraction $= 60^\circ/360^\circ = 1/6$.
4. No fluid crosses the bounding rays, so the wedge carries $2.0$ m²/s at every radius — the rays could even be replaced by solid walls, giving the flow in a $60^\circ$ diverging channel.`,
    check: [{ label: md`$q$`, value: 2, units: md`\mathrm{m^2/s}` }],
  },
  {
    id: 'pr-sink-bernoulli',
    concept: 'source-sink',
    difficulty: 2,
    q: md`Water ($\rho = 1000$ kg/m³) flows toward a line sink of strength $m = -0.8$ m²/s in a horizontal plane. The pressure at $r = 1$ m is $120$ kPa. Find the pressure at $r = 0.25$ m.`,
    hint: md`The flow is irrotational, so $p_1 + \tfrac12\rho v_1^2 = p_2 + \tfrac12\rho v_2^2$ between any two points. Only the speed $\lvert v_r\rvert$ matters.`,
    answer: md`$p \approx 119.88$ kPa at $r = 0.25$ m — about $122$ Pa lower than at $r = 1$ m.`,
    solution: md`1. $\lvert v_r\rvert = \lvert m\rvert/(2\pi r)$: at $r_1 = 1$ m, $v_1 = 0.8/2\pi = 0.1273$ m/s; at $r_2 = 0.25$ m, $v_2 = 0.8/(2\pi \cdot 0.25) = 0.5093$ m/s.
2. $p_2 = p_1 + \tfrac12\rho(v_1^2 - v_2^2) = 120\,000 + 500(0.01621 - 0.25938) = 120\,000 - 121.6 = 119\,878$ Pa.
3. $p_2 \approx 119.88$ kPa: the pressure falls as the fluid speeds up toward the sink. (A source of the same $\lvert m\rvert$ would give exactly the same answer.)`,
    check: [
      { label: md`$p_2$`, value: 119.878, units: md`\mathrm{kPa}`, tol: 0.0003 },
      { label: md`drop $p_1 - p_2$`, value: 121.6, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'pr-sink-identify',
    concept: 'source-sink',
    difficulty: 2,
    q: md`A plane flow has stream function $\psi = -5\theta$ (m²/s). (a) What flow is this and what is its strength $m$? (b) Find $v_r$, $u$ and $v$ at the point $(x,\ y) = (3,\ 4)$ m. (c) Write $\phi$.`,
    hint: md`Compare with $\psi = (m/2\pi)\theta$; then $v_r = \frac1r\,\partial\psi/\partial\theta$.`,
    answer: md`(a) A sink, $m = -10\pi = -31.4$ m²/s; (b) $v_r = -1.0$ m/s, $(u, v) = (-0.6,\ -0.8)$ m/s; (c) $\phi = -5\ln r$.`,
    solution: md`1. $m/2\pi = -5 \Rightarrow m = -10\pi = -31.4$ m²/s: a sink drawing in $31.4$ m²/s per metre of length.
2. $r = \sqrt{3^2 + 4^2} = 5$ m. $v_r = \frac1r\,\partial\psi/\partial\theta = -5/5 = -1.0$ m/s and $v_\theta = -\partial\psi/\partial r = 0$.
3. $\cos\theta = 3/5$, $\sin\theta = 4/5$: $u = v_r\cos\theta = -0.6$ m/s, $v = v_r\sin\theta = -0.8$ m/s — pointing straight at the origin ✓.
4. $\phi = \frac{m}{2\pi}\ln r = -5\ln r$ (check: $\partial\phi/\partial r = -5/r = v_r$ ✓).`,
    check: [
      { label: md`$m$`, value: -31.42, units: md`\mathrm{m^2/s}` },
      { label: md`$u$`, value: -0.6, units: md`\mathrm{m/s}` },
      { label: md`$v$`, value: -0.8, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'pr-sink-cavitation',
    concept: 'source-sink',
    difficulty: 3,
    q: md`A line sink of strength $\lvert m\rvert = 2$ m²/s draws water ($\rho = 1000$ kg/m³) through a horizontal layer where, far from the sink, $p_\infty = 101.3$ kPa. The vapour pressure is $p_v = 2.34$ kPa. According to the ideal model, inside what radius would the pressure fall below $p_v$ (cavitation)?`,
    hint: md`Bernoulli from $r \to \infty$ (where $V \approx 0$) to $r$: $p = p_\infty - \rho m^2/(8\pi^2 r^2)$. Set $p = p_v$.`,
    answer: md`$r_c \approx 0.0226$ m $\approx 22.6$ mm, where the speed is about $14.1$ m/s.`,
    solution: md`1. Far away the speed is negligible, so $p(r) = p_\infty - \tfrac12\rho\left(\dfrac{m}{2\pi r}\right)^2$.
2. Set $p = p_v$: $\tfrac12\rho v_c^2 = p_\infty - p_v = 98\,960$ Pa $\Rightarrow v_c = \sqrt{2(98\,960)/1000} = 14.07$ m/s.
3. $r_c = \dfrac{\lvert m\rvert}{2\pi v_c} = \dfrac{2}{2\pi(14.07)} = 0.0226$ m.
4. Interpretation: near the singular point the ideal model predicts unbounded speed and $p \to -\infty$. A real intake has a finite size, and the line-sink model only applies outside it.`,
    check: [{ label: md`$r_c$`, value: 0.02263, units: md`\mathrm{m}` }],
  },
  {
    id: 'pr-source-sink-pair',
    concept: 'source-sink',
    difficulty: 3,
    q: md`A source of strength $m = 6$ m²/s sits at $(-1,\ 0)$ m and a sink of equal strength ($m = -6$ m²/s) at $(1,\ 0)$ m. (a) Find the velocity at $P(0,\ 1)$ m and at the origin $O$. (b) For water ($\rho = 1000$ kg/m³), find $p_O - p_P$ (same elevation).`,
    hint: md`Superpose: each element contributes $\frac{m}{2\pi}\,\dfrac{(x - x_0,\ y - y_0)}{r^2}$ at the point; add the vectors. Then Bernoulli between any two points.`,
    answer: md`$\vb{V}_P = (0.955,\ 0)$ m/s and $\vb{V}_O = (1.910,\ 0)$ m/s; $p_O - p_P = -1.37$ kPa (lower pressure at $O$).`,
    solution: md`1. $m/2\pi = 6/2\pi = 0.9549$ m²/s.
2. At $P$: source (offset $(1, 1)$, $r^2 = 2$): $0.9549(1,\ 1)/2 = (0.4775,\ 0.4775)$; sink (offset $(-1, 1)$, $r^2 = 2$): $-0.9549(-1,\ 1)/2 = (0.4775,\ -0.4775)$. Sum: $\vb{V}_P = (0.955,\ 0)$ m/s.
3. At $O$: source (offset $(1, 0)$, $r^2 = 1$): $(0.9549,\ 0)$; sink (offset $(-1, 0)$): $-0.9549(-1,\ 0) = (0.9549,\ 0)$. Sum: $\vb{V}_O = (1.910,\ 0)$ m/s.
4. Bernoulli (irrotational, any two points): $p_O - p_P = \tfrac12\rho(V_P^2 - V_O^2) = 500(0.9119 - 3.6476) = -1368$ Pa.
5. Between the pair the source pushes and the sink pulls in the same direction, so their velocities add: the fastest flow and the lowest pressure lie on the line joining them.`,
    check: [
      { label: md`$u_P$`, value: 0.9549, units: md`\mathrm{m/s}` },
      { label: md`$u_O$`, value: 1.91, units: md`\mathrm{m/s}` },
      { label: md`$p_O - p_P$`, value: -1368, units: md`\mathrm{Pa}` },
    ],
  },
]

/* ─────────────────────────────── quiz ─────────────────────────────── */

export const quiz: QuizQ[] = [
  {
    id: 'q-uniform-def',
    concept: 'uniform-flow',
    difficulty: 1,
    src: { doc: 'lec12', pages: '8' },
    q: md`According to Lecture 12, what defines a **uniform flow**?`,
    options: [
      'All streamlines are straight and parallel, and the speed is the same everywhere',
      'The velocity at each point does not change with time',
      'All streamlines are straight, but the speed may change along them',
      'The speed is the same everywhere, but the streamlines may curve',
    ],
    answer: 0,
    explain: md`Slide 8: straight, parallel streamlines **and** a constant velocity magnitude. "Not changing with time" describes a *steady* flow — a steady flow can be strongly non-uniform (a source, for example). Changing speed along straight lines, or curved streamlines, are both excluded by the definition.`,
  },
  {
    id: 'q-uniform-sign',
    concept: 'uniform-flow',
    difficulty: 2,
    src: { doc: 'lec12', pages: '9' },
    q: md`Which stream function describes a uniform flow of speed $U$ directed at angle $\alpha$ above the $+x$ axis?`,
    options: [
      md`$\psi = U(y\cos\alpha - x\sin\alpha)$`,
      md`$\psi = U(y\cos\alpha + x\sin\alpha)$`,
      md`$\psi = U(x\cos\alpha + y\sin\alpha)$`,
      md`$\psi = U(x\sin\alpha - y\cos\alpha)$`,
    ],
    answer: 0,
    explain: md`Differentiate: $u = \partial\psi/\partial y = U\cos\alpha$ and $v = -\partial\psi/\partial x = +U\sin\alpha$ ✓. With $+x\sin\alpha$ you would get $v = -U\sin\alpha$ (a stream tilted downward). $U(x\cos\alpha + y\sin\alpha)$ is the **velocity potential**, not $\psi$, and $U(x\sin\alpha - y\cos\alpha)$ is $-\psi$, which reverses the flow.`,
  },
  {
    id: 'q-uniform-pressure',
    concept: 'uniform-flow',
    difficulty: 1,
    q: md`In a steady, uniform potential flow in a horizontal plane, how does the static pressure vary?`,
    options: [
      'It is the same everywhere',
      'It falls in the flow direction, to overcome friction',
      md`It increases across the stream as $\psi$ increases`,
      md`It falls along the stream in proportion to $\phi$`,
    ],
    answer: 0,
    explain: md`The speed is $U$ everywhere, so Bernoulli ($p + \tfrac12\rho V^2$ = const, valid between any two points of an irrotational flow) gives the same pressure everywhere. A pressure drop to overcome friction belongs to viscous pipe flow; potential flow is inviscid. $\phi$ and $\psi$ only label positions — they do not set the pressure.`,
  },
  {
    id: 'q-uniform-const',
    concept: 'uniform-flow',
    difficulty: 1,
    src: { doc: 'lec12', pages: '8' },
    q: md`On slide 8 the constant in $\phi = Ux + C$ is dropped to give $\phi = Ux$. Why is that allowed?`,
    options: [
      md`Only derivatives of $\phi$ give velocities, so a constant changes nothing physical`,
      md`Laplace's equation is satisfied only if $C = 0$`,
      md`$C$ must vanish because $\phi = 0$ on a wall`,
      md`$C$ equals $U$, and it cancels in $\partial\phi/\partial x$`,
    ],
    answer: 0,
    explain: md`$u = \partial\phi/\partial x$ and $v = \partial\phi/\partial y$ are unchanged by adding a constant, so $C$ is arbitrary and set to zero for convenience. A constant also satisfies Laplace's equation (its second derivatives are zero), so Laplace does not force $C = 0$; there is no wall in a uniform stream, and $C$ has nothing to do with $U$.`,
  },
  {
    id: 'q-uniform-q',
    concept: 'uniform-flow',
    difficulty: 2,
    q: md`A uniform flow has $\psi = 4y$ (m²/s, $y$ in m). What volume flow rate per metre depth passes between the streamline through $(0,\ 1)$ m and the one through $(3,\ 2.5)$ m?`,
    options: [md`$6$ m²/s`, md`$10$ m²/s`, md`$14$ m²/s`, md`$4$ m²/s`],
    answer: 0,
    explain: md`$q = \psi_2 - \psi_1 = 4(2.5) - 4(1) = 6$ m²/s. The $x$-coordinates do not matter because $\psi$ does not depend on $x$ (the streamlines are horizontal). $10$ m²/s is $\psi$ at the upper point only (forgetting to subtract $\psi_1$), $14$ m²/s adds the two values, and $4$ m²/s is the speed $U$, not a flow rate.`,
  },
  {
    id: 'q-source-units',
    concept: 'source-sink',
    difficulty: 1,
    src: { doc: 'lec12', pages: '10' },
    q: md`What is the source strength $m$ on slide 10, and what are its SI units?`,
    options: [
      'The volume flow rate per unit length of the line source, in m²/s',
      'The total volume flow rate of the source, in m³/s',
      'The mass flow rate per unit length, in kg/(m·s)',
      md`The radial speed at $r = 1$ m, in m/s`,
    ],
    answer: 0,
    explain: md`Slide 10 defines $m$ as the volume rate of flow spreading out from the line **per unit length**: (m³/s)/m = m²/s — the same units as $\phi$ and $\psi$. A source of length $L$ discharges $mL$ m³/s in total. The speed at $r = 1$ m is $m/2\pi$, not $m$.`,
  },
  {
    id: 'q-source-decay',
    concept: 'source-sink',
    difficulty: 1,
    src: { doc: 'lec12', pages: '10' },
    q: md`For a line source, if you move from radius $r$ to radius $2r$, the radial velocity…`,
    options: ['halves', 'falls to one quarter', 'doubles', 'stays the same, because the outflow is equal in every direction'],
    answer: 0,
    explain: md`Continuity $(2\pi r)v_r = m$ gives $v_r = m/2\pi r \propto 1/r$, so doubling $r$ halves $v_r$. A $1/r^2$ decay belongs to a **point** source in 3-D (sphere area $4\pi r^2$), not to a line source (cylinder area $2\pi r$ per unit length).`,
  },
  {
    id: 'q-source-lines',
    concept: 'source-sink',
    difficulty: 1,
    src: { doc: 'lec12', pages: '10' },
    q: md`What do the streamlines and the equipotential lines of a line source look like?`,
    options: [
      'Streamlines are radial lines; equipotentials are concentric circles',
      'Streamlines are concentric circles; equipotentials are radial lines',
      'Both families are radial lines',
      'Streamlines are parallel straight lines; equipotentials are circles',
    ],
    answer: 0,
    explain: md`$\psi = (m/2\pi)\theta$ is constant along a ray, and $\phi = (m/2\pi)\ln r$ is constant on a circle — exactly as slide 10's figure labels them. Circular streamlines with radial equipotentials describe the **vortex** (slide 11), obtained by interchanging $\phi$ and $\psi$ of the source.`,
  },
  {
    id: 'q-sink-sign',
    concept: 'source-sink',
    difficulty: 2,
    q: md`A sink at the origin draws in fluid at $2\pi$ m²/s per metre of its length. Which is its stream function?`,
    options: [md`$\psi = -\theta$`, md`$\psi = \theta$`, md`$\psi = -\ln r$`, md`$\psi = -2\pi\theta$`],
    answer: 0,
    explain: md`A sink is a source of negative strength: $m = -2\pi$ m²/s, so $\psi = (m/2\pi)\theta = -\theta$, giving $v_r = \frac1r\,\partial\psi/\partial\theta = -1/r$ (inward) ✓. $\psi = +\theta$ is the source; $-\ln r$ is this sink's **velocity potential** $\phi$, not $\psi$; and $-2\pi\theta$ forgets to divide $m$ by $2\pi$.`,
  },
  {
    id: 'q-source-pressure',
    concept: 'source-sink',
    difficulty: 2,
    q: md`In the steady flow from a line source in a horizontal plane, where is the static pressure lowest?`,
    options: [
      'Closest to the source, where the speed is highest',
      'Far from the source, where the fluid has slowed down',
      'Nowhere — it is the same everywhere because the flow is irrotational',
      'Closest to the source for a source, but farthest away for a sink',
    ],
    answer: 0,
    explain: md`Bernoulli between any two points: $p + \tfrac12\rho v_r^2$ = const, and $v_r = m/2\pi r$ is largest near $r = 0$, so $p = p_\infty - \rho m^2/(8\pi^2 r^2)$ is lowest there. Irrotationality makes the Bernoulli **constant** the same everywhere, not the pressure. A sink has exactly the same pressure field, since only $v_r^2$ enters.`,
  },
  {
    id: 'q-source-laplace',
    concept: 'source-sink',
    difficulty: 3,
    q: md`Where does the source potential $\phi = \frac{m}{2\pi}\ln r$ satisfy Laplace's equation?`,
    options: [
      md`Everywhere except at $r = 0$`,
      md`Everywhere, including $r = 0$`,
      md`Only where $r > 1$ m, so that $\ln r > 0$`,
      md`Only for a source ($m > 0$), not for a sink`,
    ],
    answer: 0,
    explain: md`$\nabla^2\phi = \frac1r\frac{d}{dr}\left(r\cdot\frac{m}{2\pi r}\right) = \frac1r\frac{d}{dr}\left(\frac{m}{2\pi}\right) = 0$ for every $r > 0$ and either sign of $m$. At $r = 0$ the speed is infinite and the whole discharge appears from a single point, so continuity (and Laplace) fail there — a **singularity**. The sign of $\ln r$ is irrelevant, because $\phi$ is only defined up to a constant.`,
  },
  {
    id: 'q-rays',
    concept: 'source-sink',
    difficulty: 2,
    q: md`What fraction of a line source's discharge passes between the rays $\theta = 30^\circ$ and $\theta = 120^\circ$?`,
    options: ['25 %', '33 %', '50 %', 'It depends on the radius at which it is measured'],
    answer: 0,
    explain: md`$q = \psi_2 - \psi_1 = \frac{m}{2\pi}(\theta_2 - \theta_1)$, so the fraction is $90^\circ/360^\circ = 1/4$. Rays are streamlines — no fluid crosses them — so the answer is the same at every radius. $33$ % would be $120^\circ/360^\circ$, i.e. using only one of the two angles.`,
  },
]

/* ─────────────────────────────── flashcards ─────────────────────────────── */

export const flashcards: Flashcard[] = [
  {
    id: 'f-uniform-def',
    front: md`What is a **uniform flow** (Lecture 12, slide 8)?`,
    back: md`The simplest plane flow: all streamlines straight and parallel, and the speed $U$ the same everywhere. Along $+x$: $\phi = Ux$, $\psi = Uy$ (so $u = U$, $v = 0$).`,
    src: { doc: 'lec12', pages: '8' },
  },
  {
    id: 'f-uniform-alpha',
    front: md`$\phi$ and $\psi$ for a uniform stream at angle $\alpha$?`,
    back: md`$\phi = U(x\cos\alpha + y\sin\alpha)$, $\;\psi = U(y\cos\alpha - x\sin\alpha)$, giving $u = U\cos\alpha$, $v = U\sin\alpha$. Check the sign with $v = -\partial\psi/\partial x$.`,
    src: { doc: 'lec12', pages: '9' },
  },
  {
    id: 'f-uniform-sn',
    front: 'A quick way to remember every uniform-flow formula?',
    back: md`With $s$ = distance along the stream and $n$ = distance across it (to its left): $\phi = Us$ and $\psi = Un$. The flow between two streamlines is $U \times$ their spacing.`,
  },
  {
    id: 'f-uniform-polar',
    front: md`The uniform stream along $+x$ in polar coordinates?`,
    back: md`$\phi = Ur\cos\theta$, $\psi = Ur\sin\theta$; $v_r = U\cos\theta$, $v_\theta = -U\sin\theta$ — the form used when it is superposed with a source at the origin (slide 16).`,
    src: { doc: 'lec12', pages: '16' },
  },
  {
    id: 'f-source-m',
    front: md`The source strength $m$: meaning and units?`,
    back: md`The volume rate of flow spreading out from the line **per unit length** of the line, in m²/s (slide 10). By the standard convention $m > 0$ is a source (outflow) and $m < 0$ a sink (inflow).`,
    src: { doc: 'lec12', pages: '10' },
  },
  {
    id: 'f-source-vr',
    front: 'The radial velocity of a line source — and where it comes from?',
    back: md`Continuity through a cylinder of radius $r$: $(2\pi r)v_r = m$, so $v_r = \dfrac{m}{2\pi r}$ and $v_\theta = 0$ — purely radial, decaying as $1/r$.`,
    src: { doc: 'lec12', pages: '10' },
  },
  {
    id: 'f-source-phipsi',
    front: md`$\phi$ and $\psi$ of a line source or sink?`,
    back: md`$\phi = \dfrac{m}{2\pi}\ln r$ (equipotentials: circles), $\;\psi = \dfrac{m}{2\pi}\theta$ (streamlines: rays).`,
    src: { doc: 'lec12', pages: '10' },
  },
  {
    id: 'f-source-rays',
    front: md`The flow rate between two rays $\theta_1$ and $\theta_2$ of a source?`,
    back: md`$q = \psi_2 - \psi_1 = \dfrac{m}{2\pi}(\theta_2 - \theta_1)$, with $\theta$ in radians — the same at every radius.`,
  },
  {
    id: 'f-source-singular',
    front: md`Why is $r = 0$ special for a source or sink?`,
    back: md`It is a singular point: $v_r \to \infty$ and the whole discharge $m$ appears from (or vanishes into) a point, so Laplace's equation fails there. Use the model only away from $r = 0$ — e.g. with the source hidden inside a body.`,
  },
  {
    id: 'f-source-pressure',
    front: 'The pressure field around a line source or sink?',
    back: md`Bernoulli from far away: $p = p_\infty - \dfrac{\rho m^2}{8\pi^2 r^2}$ — lowest near the centre, and identical for a source and a sink.`,
  },
  {
    id: 'f-superpose',
    front: 'Why can uniform streams, sources and sinks simply be added together?',
    back: md`Each satisfies Laplace's equation, which is **linear**: any sum $\phi = \phi_1 + \phi_2$, $\psi = \psi_1 + \psi_2$ is again a potential flow, and the velocities add as vectors — the method of superposition (slide 16).`,
    src: { doc: 'lec12', pages: '16' },
  },
]

/* ─────────────────────────────── takeaways ─────────────────────────────── */

export const takeaways: string[] = [
  md`**Uniform flow** = straight, parallel streamlines and constant speed. Along $+x$: $\phi = Ux$, $\psi = Uy$; at angle $\alpha$: $\phi = U(x\cos\alpha + y\sin\alpha)$, $\psi = U(y\cos\alpha - x\sin\alpha)$ (Lecture 12, slides 8–9).`,
  md`Remember them as $\phi = U\times$(distance along the stream) and $\psi = U\times$(distance across it); the flow between two streamlines is $U\times$ their spacing.`,
  md`**Line source/sink:** $m$ = volume flow per unit length (m²/s); continuity $(2\pi r)v_r = m$ gives $v_r = m/(2\pi r)$, $v_\theta = 0$ (slide 10).`,
  md`$\phi = \frac{m}{2\pi}\ln r$ (circles) and $\psi = \frac{m}{2\pi}\theta$ (rays); a sink is the same flow with $m < 0$.`,
  md`Flow between two rays: $q = \frac{m}{2\pi}(\theta_2 - \theta_1)$ with $\theta$ in **radians** — independent of the radius. In general $q = \psi_B - \psi_A$ for any curve from $A$ to $B$.`,
  md`Pressure: uniform in a uniform stream; around a source or sink $p = p_\infty - \rho m^2/(8\pi^2 r^2)$ — Bernoulli may be used between **any** two points because the flow is irrotational.`,
  md`$r = 0$ is a **singularity** ($v_r \to \infty$, Laplace fails there): use the model only away from it, e.g. with the source hidden inside a body.`,
  md`All these flows satisfy Laplace's equation, which is linear — so they can be **superposed** (slide 16): uniform stream + source = flow around a half-body; interchanging $\phi$ and $\psi$ of the source gives the vortex (slide 11).`,
  md`**Exam traps:** the minus signs in $v = -\partial\psi/\partial x$ and $v_\theta = -\partial\psi/\partial r$; the $1/r$ on the $\theta$-derivative; degrees vs radians; $m$ per unit length; $\operatorname{atan2}$ for the quadrant of $\alpha$.`,
]

/* ─────────────────────────────── content ─────────────────────────────── */

export default function Content() {
  const [mAbs, setMAbs] = useState(4)
  const [sink, setSink] = useState(false)
  const strength = { mAbs, sink, onMAbs: setMAbs, onSink: setSink }

  return (
    <>
      {/* ═════════════════════════ Concept 1: uniform flow ═════════════════════════ */}
      <Concept id="uniform-flow">
        <Step kind="intro" src={{ doc: 'lec12', pages: '8–9' }}>
          <Md>{md`
            After setting up Laplace's equation and the velocity potential, Lecture 12 starts a small **library of exact plane potential flows**. The first entry is the **uniform flow**, which slide 8 calls the simplest plane flow: every streamline is **straight and parallel** to the others, and the **magnitude of the velocity is the same everywhere**.

            For a stream of speed $U$ along $+x$ the lecture integrates the velocity relations to obtain

            $$
            \phi = Ux, \qquad \psi = Uy ,
            $$

            and slide 9 turns the same stream through an angle $\alpha$. These are exact solutions of Laplace's equation — the first two items in the toolbox you will later **add together** (slide 16) to model the flow around bodies.
          `}</Md>
          <Callout kind="def" title="Uniform flow (slide 8)">
            <Md>{md`Straight, parallel streamlines **and** the same speed $U$ at every point of the plane.`}</Md>
          </Callout>
          <FlowRow
            nodes={[
              { title: 'Potential flow', md: md`$\nabla^2\phi = 0$ — slides 2–7`, tone: 'slate' },
              { title: 'Uniform flow', md: md`slides 8–9 (here)`, tone: 'indigo' },
              { title: 'Source / sink', md: md`slide 10 (here)`, tone: 'cyan' },
              { title: 'Vortex', md: md`slides 11–15`, tone: 'violet' },
              { title: 'Superposition', md: md`half-body, slides 16–18`, tone: 'amber' },
            ]}
          />
          <Callout kind="note" title="Plane flow, per unit depth">
            <Md>{md`"Plane" means two-dimensional: nothing depends on $z$, and there is no $w$. Every $\phi$, $\psi$ and flow rate $q$ on this page is per metre of depth normal to the paper, which is why they carry the units m²/s.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            Picture the water in a wide, straight canal far from its banks, or the air in a wind-tunnel test section: every fluid particle moves with the **same velocity** — same speed, same direction. Nothing speeds up, nothing turns, and fluid elements neither spin nor deform. All velocity derivatives vanish, so the flow is automatically **irrotational** ($\omega_z = \tfrac12(\partial v/\partial x - \partial u/\partial y) = 0$) and **incompressible** ($\partial u/\partial x + \partial v/\partial y = 0$): both a velocity potential and a stream function exist.
          `}</Md>
          <Compare
            items={[
              {
                title: 'φ — distance along the stream',
                md: md`$\phi = U\times$(distance travelled in the flow direction). It grows **downstream**, because $\vb{V} = \nabla\phi$ points toward increasing $\phi$. Equipotentials are the "wavefronts" at right angles to the motion — like the ranks of a marching band.`,
                tone: 'amber',
              },
              {
                title: 'ψ — a flow counter across the stream',
                md: md`$\psi = U\times$(distance across the stream, measured to the **left** of the flow). Between two streamlines $d$ apart, a flow $q = Ud$ passes (m²/s per metre depth) — like counting the cars passing between two lane markings.`,
                tone: 'indigo',
              },
            ]}
          />
          <Callout kind="tip" title="One idea behind every formula">
            <Md>{md`Use coordinates aligned with the stream — $s$ along it, $n$ across it. Then $\phi = Us$ and $\psi = Un$, whatever the direction. Slide 9's formulas are exactly this statement written out in $x$ and $y$ (see the derivation below).`}</Md>
          </Callout>
          <Callout kind="note" title="What about the pressure?">
            <Md>{md`The speed is $U$ everywhere, so Bernoulli (valid between any two points of an irrotational flow) makes the pressure the same everywhere in a horizontal plane. A uniform stream on its own pushes on nothing; it becomes interesting only when combined with sources, sinks and vortices.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[{ doc: 'lec12', pages: '8' }, { doc: 'lec12', pages: '9' }]}>
          <Figure
            caption={md`First panel (slide 8): a stream along $x$ with horizontal streamlines $\psi = \psi_1 \dots \psi_4$ and vertical dashed equipotentials $\phi = \phi_1,\ \phi_2$. Second panel (slide 9): the same pattern turned through the angle $\alpha$.`}
            src={[{ doc: 'lec12', pages: '8' }, { doc: 'lec12', pages: '9' }]}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-center text-xs font-semibold tracking-wide text-ink-3">Along x — slide 8</div>
                <UniformSketch alphaDeg={0} title="Uniform flow along x" />
              </div>
              <div>
                <div className="mb-1 text-center text-xs font-semibold tracking-wide text-ink-3">At an angle α — slide 9</div>
                <UniformSketch alphaDeg={35} title="Uniform flow at an angle alpha" />
              </div>
            </div>
          </Figure>
          <Supplement title="Reading the figure">
            <Md>{md`
              - Because $\psi = Uy$ grows upward, $\psi_1 > \psi_2 > \psi_3 > \psi_4$; because $\phi = Ux$ grows downstream, $\phi_2 > \phi_1$.
              - Streamlines and equipotentials cross at right angles (slide 5). Drawn with equal increments $\Delta\psi = \Delta\phi$ they form a grid of **squares** of side $\Delta\psi/U$ — the flow net of a uniform stream.
              - The flow between $\psi_1$ and $\psi_4$ is $\psi_1 - \psi_4 = U \times$ (their spacing), the same at every station along the stream.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="equations" src={[{ doc: 'lec12', pages: '3' }, { doc: 'lec12', pages: '8–9' }]}>
          <Md>{md`Two relations from slide 3 do all the work; the results of slides 8 and 9 follow from them.`}</Md>
          <FormulaCard id="vel-cart" />
          <FormulaCard id="uniform-x" />
          <FormulaCard id="uniform-alpha" />
          <FormulaCard id="uniform-alpha-vel" />
          <Callout kind="warning" title="Sign trap in ψ">
            <Md>{md`It is $\psi = U(y\cos\alpha \;\mathbf{-}\; x\sin\alpha)$. Always check by differentiating: $v = -\partial\psi/\partial x = +U\sin\alpha$. With a plus sign you would describe a stream tilted *downward*.`}</Md>
          </Callout>
          <FormulaCard id="uniform-polar" />
          <FormulaCard id="q-psi" />
          <Callout kind="exam" title="Identifying a uniform flow">
            <Md>{md`Given $\phi$ or $\psi$: differentiate. If $u$ and $v$ come out **constant**, it is a uniform stream with $U = \sqrt{u^2+v^2}$ and $\alpha = \operatorname{atan2}(v, u)$ — then write the flow rate between any two points as $\psi_B - \psi_A$.`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" title="Derivation & Laplace check" src={{ doc: 'lec12', pages: '8' }}>
          <Derivation
            title="Slide 8: integrating the velocity relations for u = U, v = 0"
            steps={[
              { md: md`$u = U, \qquad v = 0 \qquad$ everywhere`, why: 'definition of a uniform stream along +x' },
              { md: md`$\pd{\phi}{x} = U, \qquad \pd{\phi}{y} = 0$`, why: md`$u = \partial\phi/\partial x$, $v = \partial\phi/\partial y$ (slide 3)` },
              { md: md`$\phi = Ux + C$`, why: md`integrate in $x$; $\partial\phi/\partial y = 0$ means no $y$-dependence` },
              { md: md`$\phi = Ux$`, why: md`$C$ is arbitrary — only derivatives of $\phi$ give velocities` },
              { md: md`$\pd{\psi}{y} = U, \qquad \pd{\psi}{x} = 0$`, why: md`$u = \partial\psi/\partial y$ and $v = -\partial\psi/\partial x = 0$` },
              { md: md`$\psi = Uy$`, why: md`integrate; constant chosen so that $\psi = 0$ on the $x$-axis` },
            ]}
          />
          <Supplement title="Slide 9's formulas, derived">
            <div className="space-y-4">
              <div className="mx-auto max-w-md">
                <RotatedAxesSketch alphaDeg={30} />
              </div>
              <Derivation
                steps={[
                  { md: md`$u = U\cos\alpha, \quad v = U\sin\alpha$`, why: 'resolve the stream into components' },
                  { md: md`$\phi = Ux\cos\alpha + f(y)$`, why: md`integrate $\partial\phi/\partial x = U\cos\alpha$` },
                  { md: md`$f'(y) = U\sin\alpha \;\Rightarrow\; \phi = U(x\cos\alpha + y\sin\alpha)$`, why: md`use $\partial\phi/\partial y = v$` },
                  { md: md`$\psi = Uy\cos\alpha + g(x)$`, why: md`integrate $\partial\psi/\partial y = u$` },
                  { md: md`$-g'(x) = U\sin\alpha \;\Rightarrow\; \psi = U(y\cos\alpha - x\sin\alpha)$`, why: md`use $-\partial\psi/\partial x = v$` },
                  { md: md`$\phi = Us,\quad \psi = Un$ with $s = x\cos\alpha + y\sin\alpha,\ n = y\cos\alpha - x\sin\alpha$`, why: 'the bracketed terms are just the rotated coordinates' },
                ]}
              />
            </div>
          </Supplement>
          <FormulaCard id="laplace-2d" />
          <Md>{md`
            **Check:** every second derivative of $Ux$, $Uy$, $U(x\cos\alpha + y\sin\alpha)$ and $U(y\cos\alpha - x\sin\alpha)$ is zero, so $\nabla^2\phi = \nabla^2\psi = 0$ identically — the uniform stream is an *exact* potential flow, valid everywhere (it has no singular point).
          `}</Md>
          <Supplement title="Why this matters: superposition">
            <Md>{md`Laplace's equation is **linear**: if $\phi_1$ and $\phi_2$ satisfy it, so does $\phi_1 + \phi_2$ (and likewise for $\psi$), and the velocities simply add as vectors. Two uniform streams add to another uniform stream (practice 4 below); a uniform stream plus a source gives the flow around a half-body — exactly the superposition $\psi = \psi_{\text{uniform flow}} + \psi_{\text{source}}$ written on slide 16.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-uniform-alpha" />
          <ExampleCard id="ex-uniform-identify" />
        </Step>

        <Step kind="interactive">
          <UniformExplorer />
          <Callout kind="tip" title="What the gate shows">
            <Md>{md`The gate $AB$ has length $L = 2$ m and direction $\beta$. Its flow rate is read straight from the stream function, $q = \psi_B - \psi_A$, and for a uniform stream equals $UL\sin(\beta - \alpha)$: only the component of the velocity **normal** to the gate carries fluid across it.`}</Md>
          </Callout>
        </Step>

        <Step kind="practice">
          <PracticeList concept="uniform-flow" />
          <QuickCheck ids={['q-uniform-sign', 'q-uniform-q']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`**Definition (slide 8):** straight, parallel streamlines and one speed everywhere. Along $+x$: $\phi = Ux$, $\psi = Uy$; at angle $\alpha$ (slide 9): $\phi = U(x\cos\alpha + y\sin\alpha)$, $\psi = U(y\cos\alpha - x\sin\alpha)$.`,
              md`$\phi = U\times$(distance along the stream) grows downstream; $\psi = U\times$(distance across it) grows to the **left** of the flow; equipotentials are perpendicular to streamlines.`,
              md`Flow rate between two points: $q = \psi_B - \psi_A$, independent of the path — for a uniform stream, $U\times$ the perpendicular spacing of the two streamlines.`,
              md`**Traps:** the minus sign in $\psi$ (check with $v = -\partial\psi/\partial x$); $\arctan(v/u)$ without checking the quadrant; constants in $\phi$ and $\psi$ are arbitrary.`,
              md`Uniform speed ⇒ uniform pressure. The stream matters as the **free stream** that is superposed with sources, sinks and vortices.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 2: source and sink ═════════════════════════ */}
      <Concept id="source-sink">
        <Step kind="intro" src={{ doc: 'lec12', pages: '10' }}>
          <Md>{md`
            Slide 10 introduces the second building block. Fluid issues from a **line** through the origin, perpendicular to the $x$–$y$ plane, and flows **radially outward**, equally in all directions. Its strength is

            > $m$ = the **volume rate of flow spreading out from the line, per unit length** of the line (m²/s).

            Because every plane $z =$ const looks the same, this is a *plane* flow: in the $x$–$y$ plane the line appears as a point — the **source** — and the flow is **purely radial** ($v_\theta = 0$). Mass conservation alone fixes the speed, $v_r = m/(2\pi r)$, and integrating the velocity relations gives $\phi = \frac{m}{2\pi}\ln r$ and $\psi = \frac{m}{2\pi}\theta$.
          `}</Md>
          <Callout kind="def" title="Source and sink (slide 10)">
            <Md>{md`**Source:** radial outflow from a line, strength $m$ = volume flow per unit length. **Sink:** the same flow reversed — fluid drawn *into* the line. By the standard convention a sink is simply a source with **negative** $m$.`}</Md>
          </Callout>
          <Supplement title="Where sources and sinks appear">
            <Md>{md`
              - **Real devices:** a long perforated pipe discharging into a tank (source); a slotted intake or a well pumping a confined aquifer (sink) — away from the device itself.
              - **Building block:** a source in a uniform stream produces the flow around a blunt-nosed half-body (slides 16–17); interchanging $\phi$ and $\psi$ of the source gives the free vortex (slide 11).
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <RadialParticles />
          <Md>{md`
            **Continuity is the whole story.** Whatever leaves the line must cross every cylinder drawn around it. Per unit length a cylinder of radius $r$ has area $2\pi r$, so the same discharge $m$ spread over a longer circumference means a **smaller speed**: twice as far, half as fast. Watch the dots: they slow down as they spread out, yet never bunch up or thin out — the fluid is incompressible.

            - $\phi = \frac{m}{2\pi}\ln r$ grows only logarithmically: for equal steps $\Delta\phi$ the equipotential circles are spaced *geometrically* (each radius is $e^{2\pi\Delta\phi/m}$ times the previous one), because the speed keeps falling.
            - $\psi = \frac{m}{2\pi}\theta$ simply measures angle: each radian of the circle carries $m/2\pi$ of flow. Go once round and $\psi$ has grown by $m$ — around a source $\psi$ is **multi-valued**, because the source keeps injecting fluid.
            - A sink is a source played backwards: the same lines, every arrow reversed.
          `}</Md>
          <Callout kind="warning" title="Line source ≠ point source">
            <Md>{md`A 3-D **point** source spreads over a sphere (area $4\pi r^2$), so its speed falls as $1/r^2$. The plane-flow **line** source spreads over a cylinder ($2\pi r$ per unit length), so $v_r \propto 1/r$. This course's source is the line source.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={{ doc: 'lec12', pages: '10' }}>
          <Figure
            caption={md`First panel (slide 10): a source with radial streamlines ($\psi =$ constant) and circular equipotentials ($\phi =$ constant); $v_r$ is radial at the point $(r, \theta)$. Second panel: the matching sink ($m < 0$), with every arrow reversed (supplementary companion).`}
            src={{ doc: 'lec12', pages: '10' }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SourceSketch />
              <SourceSketch sink />
            </div>
          </Figure>
          <Figure caption={md`Radial speed $v_r = m/2\pi r$ for three strengths: a hyperbola in $r$. Doubling $m$ doubles the speed at every radius; the shaded strip marks $r \to 0$, where the model breaks down (supplementary plot).`}>
            <Plot
              height={250}
              x={{ label: '$r$ (m)', domain: [0.05, 2] }}
              y={{ label: '$v_r$ (m/s)', domain: [0, 8] }}
              series={[
                { label: md`$m = 1\ \mathrm{m^2/s}$`, fn: (r) => 1 / (2 * Math.PI * r) },
                { label: md`$m = 2\ \mathrm{m^2/s}$`, fn: (r) => 2 / (2 * Math.PI * r) },
                { label: md`$m = 4\ \mathrm{m^2/s}$`, fn: (r) => 4 / (2 * Math.PI * r) },
              ]}
              bands={[{ x0: 0.05, x1: 0.15 }]}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={[{ doc: 'lec12', pages: '3' }, { doc: 'lec12', pages: '10' }]}>
          <Md>{md`The polar velocity relations (slide 3) turn the continuity result of slide 10 into $\phi$ and $\psi$.`}</Md>
          <FormulaCard id="vel-polar" />
          <FormulaCard id="source-vr" />
          <FormulaCard id="source-phi-psi" />
          <Callout kind="warning" title="Common slips">
            <Md>{md`
              - $\theta$ must be in **radians** in $\psi = \frac{m}{2\pi}\theta$ and in every flow-rate formula.
              - $m$ is per unit **length** (m²/s); a source of length $L$ discharges $mL$ m³/s.
              - A sink has $m < 0$: then $v_r < 0$ (inward) and $\psi$ decreases counter-clockwise.
            `}</Md>
          </Callout>
          <Callout kind="note" title="Why ln r is allowed for a dimensional r">
            <Md>{md`Strictly, $\phi = \frac{m}{2\pi}\ln(r/r_0)$ for some reference radius $r_0$. That only adds the constant $-\frac{m}{2\pi}\ln r_0$, which is dropped — exactly like the constant $C$ on slide 8.`}</Md>
          </Callout>
          <FormulaCard id="source-cart" />
          <FormulaCard id="rays-q" />
          <FormulaCard id="bernoulli-2pt" />
          <FormulaCard id="source-pressure" />
        </Step>

        <Step kind="derivation" title="Derivation, Laplace check & singularity" src={{ doc: 'lec12', pages: '10' }}>
          <Derivation
            title="Slide 10: from continuity to φ and ψ"
            steps={[
              { md: md`$(2\pi r)\,v_r = m$`, why: md`all of $m$ crosses a cylinder of radius $r$ and unit length` },
              { md: md`$v_r = \dfrac{m}{2\pi r}, \qquad v_\theta = 0$`, why: 'purely radial flow' },
              { md: md`$\pd{\phi}{r} = \dfrac{m}{2\pi r}, \qquad \dfrac{1}{r}\pd{\phi}{\theta} = 0$`, why: md`$v_r = \partial\phi/\partial r$, $v_\theta = \frac1r\partial\phi/\partial\theta$ (slide 3)` },
              { md: md`$\phi = \dfrac{m}{2\pi}\ln r$`, why: md`integrate in $r$; no $\theta$-dependence; constant dropped` },
              { md: md`$v_r = \dfrac{1}{r}\pd{\psi}{\theta} = \dfrac{m}{2\pi r}, \qquad v_\theta = -\pd{\psi}{r} = 0$`, why: md`the $\psi$ relations (slide 3)` },
              { md: md`$\pd{\psi}{\theta} = \dfrac{m}{2\pi} \;\Rightarrow\; \psi = \dfrac{m}{2\pi}\,\theta$`, why: md`integrate in $\theta$; $\psi$ does not depend on $r$` },
            ]}
          />
          <FormulaCard id="laplace-polar" />
          <Supplement title="Laplace check — and why r = 0 is excluded">
            <Md>{md`
              $\phi$ depends on $r$ only, so

              $$
              \nabla^2\phi = \frac{1}{r}\frac{d}{dr}\!\left(r\,\frac{m}{2\pi r}\right) = \frac{1}{r}\frac{d}{dr}\!\left(\frac{m}{2\pi}\right) = 0 \qquad (r > 0),
              $$

              and $\psi = \frac{m}{2\pi}\theta$ has $\partial\psi/\partial r = 0$ and $\partial^2\psi/\partial\theta^2 = 0$, so $\nabla^2\psi = 0$ too — for **either** sign of $m$, so the sink is just as good a solution. At $r = 0$, however, $v_r \to \infty$ and a finite discharge $m$ emerges from a point of zero area: continuity, and with it Laplace's equation, fail there. The source is a **singular point**. We only ever use it in regions that exclude it — in the half-body of slide 16 the source sits inside the body.
            `}</Md>
          </Supplement>
          <Supplement title="The building blocks side by side">
            <Md>{md`
              | Flow | $\phi$ | $\psi$ | Velocity | Slide |
              |---|---|---|---|---|
              | Uniform, along $+x$ | $Ux$ | $Uy$ | $u = U,\ v = 0$ | 8 |
              | Uniform, at angle $\alpha$ | $U(x\cos\alpha + y\sin\alpha)$ | $U(y\cos\alpha - x\sin\alpha)$ | $u = U\cos\alpha,\ v = U\sin\alpha$ | 9 |
              | Source ($m > 0$) / sink ($m < 0$) | $\frac{m}{2\pi}\ln r$ | $\frac{m}{2\pi}\theta$ | $v_r = \frac{m}{2\pi r},\ v_\theta = 0$ | 10 |
              | Free vortex (next topic) | $K\theta$ | $-K\ln r$ | $v_r = 0,\ v_\theta = \frac{K}{r}$ | 11 |

              Each entry satisfies Laplace's equation, so any combination does too: $\phi = \sum\phi_i$, $\psi = \sum\psi_i$, $\vb{V} = \sum\vb{V}_i$ — the method of superposition (slide 16).
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <Callout kind="exam" title="The standard exam chain for a source or sink">
            <FlowSteps
              tone="cyan"
              steps={[
                { title: 'Strength', md: md`$m = Q/L$ (volume flow per unit length); sign: $+$ source, $-$ sink.` },
                { title: 'Velocity at a point', md: md`$r = \sqrt{x^2+y^2}$, $v_r = m/2\pi r$; then $u = v_r\cos\theta$, $v = v_r\sin\theta$.` },
                { title: 'Flow between two rays', md: md`$q = \psi_2 - \psi_1 = \frac{m}{2\pi}(\theta_2-\theta_1)$ — radians!` },
                { title: 'Pressure', md: md`Bernoulli between any two points: $p_2 - p_1 = \tfrac12\rho(v_1^2 - v_2^2)$.` },
                { title: 'Sanity check', md: md`$2\pi r\,v_r = m$ at every radius; pressure rises with $r$.` },
              ]}
            />
          </Callout>
          <ExampleCard id="ex-source-pipe" />
          <ExampleCard id="ex-sink-potential" />
        </Step>

        <Step kind="interactive">
          <SourceExplorer {...strength} />
          <RadialProfile {...strength} />
          <SuperpositionPreview />
        </Step>

        <Step kind="practice">
          <PracticeList concept="source-sink" />
          <QuickCheck ids={['q-source-decay', 'q-source-pressure']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$m$ = volume flow per unit **length** of the line (m²/s); $m > 0$ source, $m < 0$ sink.`,
              md`Continuity $(2\pi r)v_r = m$ gives $v_r = m/(2\pi r)$, $v_\theta = 0$: purely radial and decaying as $1/r$ (not $1/r^2$ — that is the 3-D point source).`,
              md`$\phi = \frac{m}{2\pi}\ln r$ (equipotential circles), $\psi = \frac{m}{2\pi}\theta$ (radial streamlines); between two rays $q = \frac{m}{2\pi}(\theta_2 - \theta_1)$ — radians, any radius.`,
              md`Pressure from Bernoulli between any two points: $p = p_\infty - \rho m^2/(8\pi^2 r^2)$ — lowest near the centre, identical for a source and a sink.`,
              md`$r = 0$ is a **singularity** ($v_r \to \infty$, Laplace fails); elsewhere the source is an exact potential flow and a building block: + uniform stream = half-body (slide 16); $\phi \leftrightarrow \psi$ interchanged = vortex (slide 11).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
