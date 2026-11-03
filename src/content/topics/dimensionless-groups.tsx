/**
 * Topic C3 — Significant Dimensionless Groups.
 * Sources: Fox & McDonald §7.4 (pp. 255–257, Eqs. 7.11–7.16) with the §7.6 summary table (pp. 268–269),
 * and Lecture 13 slide 21 (table of common dimensionless groups). Fox p. 245 supplies the Ma < 0.3 rule.
 * All numerical examples are supplementary (the PDFs give no numbers for §7.4).
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FormulaCard, Md, md, PracticeList, QuickCheck, Step,
  Supplement, Takeaways,
} from '@/kit'
import { ForceCubeFigure, RegimeLines } from '../sims/dimensionless-groups/figures'
import { ForceScaling } from '../sims/dimensionless-groups/ForceScaling'
import { GroupDashboard } from '../sims/dimensionless-groups/GroupDashboard'
import { GroupMatcher } from '../sims/dimensionless-groups/GroupMatcher'
import { WaveFront } from '../sims/dimensionless-groups/WaveFront'

const F245: Src = { doc: 'fox', pages: '245' }
const F247: Src = { doc: 'fox', pages: '247' }
const F254: Src = { doc: 'fox', pages: '254' }
const F255: Src = { doc: 'fox', pages: '255' }
const F256: Src = { doc: 'fox', pages: '256' }
const F257: Src = { doc: 'fox', pages: '257' }
const F268: Src = { doc: 'fox', pages: '268–269', note: '§7.6 Useful Equations table' }
const L21: Src = { doc: 'lec13', pages: '21' }

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'dimensionless-groups',
  unit: 'C',
  title: 'Significant Dimensionless Groups',
  subtitle:
    'Reynolds, Euler, cavitation, Froude, Weber, Mach, Cauchy and Strouhal numbers — each one a ratio of two forces that tells you, before any analysis, which physics controls a flow.',
  minutes: 75,
  sources: [
    { doc: 'fox', pages: '255–257' },
    { doc: 'fox', pages: '268–269' },
    { doc: 'lec13', pages: '21' },
  ],
  concepts: [
    {
      id: 'force-ratios',
      title: 'Dimensionless groups as force ratios',
      src: F255,
      summary:
        'Inertia force ~ ρV²L²; dividing the viscous, pressure, gravity, surface-tension and compressibility force estimates by it gives the classic groups.',
    },
    {
      id: 'common-groups',
      title: 'Reynolds, Euler, cavitation, Froude, Weber & Mach numbers',
      src: [{ doc: 'fox', pages: '255–257' }, L21],
      summary:
        'Definitions (Eqs. 7.11–7.16), force-ratio meanings and uses of Re, Eu (C_p), Ca, Fr, We and Ma, plus the Cauchy and Strouhal numbers of the lecture table.',
    },
  ],
  sourceNote: md`Primary source: **Fox & McDonald §7.4** (pp. 255–257) and its §7.6 summary table (pp. 268–269); the **Lecture 13 slide 21** table adds the Cauchy and Strouhal numbers and uses slightly different conventions (Euler number without the ½, "Ca" = Cauchy number). All numerical examples, fluid property values and simulations are supplementary.`,
}

/* ------------------------------------------------------------------------------------------------ formulas */

const V_RHO = { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` }
const V_V = { sym: md`V`, desc: 'characteristic (e.g. free-stream or mean) velocity', units: md`\mathrm{m/s}` }
const V_L = { sym: md`L`, desc: 'characteristic length of the flow geometry', units: md`\mathrm{m}` }
const V_MU = { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s = kg/(m\,s)}` }

export const formulas: FormulaDef[] = [
  {
    id: 'inertia-force',
    name: 'Measure of the inertia force',
    key: true,
    tex: md`\begin{aligned}
F_{\text{inertia}} = ma &\sim (\rho L^3)\,\frac{V^2}{L} = \rho V^2 L^2\\
[ma] &= MLt^{-2}
\end{aligned}`,
    vars: [
      { sym: md`m \sim \rho L^3`, desc: 'mass of a fluid element of size $L$', units: md`\mathrm{kg}` },
      { sym: md`a \sim V^2/L`, desc: 'convective acceleration scale', units: md`\mathrm{m/s^2}` },
      V_RHO, V_V, V_L,
      { sym: md`M,\ L,\ t`, desc: 'basic dimensions mass, length, time', units: md`-` },
    ],
    conditions: [
      'order-of-magnitude estimate, not an exact force',
      md`the **unique** product of $\rho$, $V$, $L$ with the dimensions of force $MLt^{-2}$`,
    ],
    use: md`The common yardstick: divide any other force estimate by $\rho V^2L^2$ to get a dimensionless force ratio. Equivalently, divide any **stress** by $\rho V^2$ and any **force** by $\rho V^2L^2$.`,
    src: F255,
  },
  {
    id: 'force-estimates',
    name: 'Order-of-magnitude estimates of the other forces',
    tex: md`\begin{aligned}
\text{viscous} &\sim \tau A = \mu\frac{du}{dy}A\\
&\propto \mu\frac{V}{L}L^2 = \mu V L\\
\text{pressure} &\sim \Delta p\,A \propto \Delta p\,L^2\\
\text{gravity} &\sim mg \propto g\rho L^3\\
\text{surface tension} &\sim \sigma L\\
\text{compressibility} &\sim E_v A \propto E_v L^2
\end{aligned}`,
    vars: [
      { sym: md`\tau`, desc: 'shear stress', units: md`\mathrm{Pa}` },
      { sym: md`A \sim L^2`, desc: 'area on which a stress acts', units: md`\mathrm{m^2}` },
      { sym: md`du/dy \sim V/L`, desc: 'velocity gradient', units: md`\mathrm{s^{-1}}` },
      { sym: md`\Delta p`, desc: 'pressure difference', units: md`\mathrm{Pa}` },
      { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`\sigma`, desc: 'surface tension (force per unit length) acting along a line of length $\sim L$', units: md`\mathrm{N/m}` },
      { sym: md`E_v`, desc: md`bulk modulus of elasticity of the fluid ($E_v = \rho\,dp/d\rho$)`, units: md`\mathrm{Pa}` },
      V_MU, V_RHO, V_V, V_L,
    ],
    conditions: ['scaling estimates: numerical factors of order one are dropped', 'one length scale $L$ and one velocity scale $V$ describe the flow'],
    use: md`Estimate the size of each force for a given flow, then compare with $\rho V^2L^2$.`,
    src: F255,
  },
  {
    id: 'force-ratios',
    name: 'Force ratios to inertia (Fox §7.4 scheme)',
    key: true,
    tex: md`\begin{aligned}
\frac{\text{viscous}}{\text{inertia}} &\sim \frac{\mu VL}{\rho V^2L^2} = \frac{\mu}{\rho VL}\\[4pt]
\frac{\text{pressure}}{\text{inertia}} &\sim \frac{\Delta p\,L^2}{\rho V^2L^2} = \frac{\Delta p}{\rho V^2}\\[4pt]
\frac{\text{gravity}}{\text{inertia}} &\sim \frac{g\rho L^3}{\rho V^2L^2} = \frac{gL}{V^2}\\[4pt]
\frac{\text{surf. tension}}{\text{inertia}} &\sim \frac{\sigma L}{\rho V^2L^2} = \frac{\sigma}{\rho V^2L}\\[4pt]
\frac{\text{compressibility}}{\text{inertia}} &\sim \frac{E_vL^2}{\rho V^2L^2} = \frac{E_v}{\rho V^2}
\end{aligned}`,
    vars: [V_RHO, V_V, V_L, V_MU,
      { sym: md`\Delta p`, desc: 'pressure difference', units: md`\mathrm{Pa}` },
      { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` },
      { sym: md`\sigma`, desc: 'surface tension', units: md`\mathrm{N/m}` },
      { sym: md`E_v`, desc: 'bulk modulus of elasticity', units: md`\mathrm{Pa}` },
    ],
    conditions: ['each ratio is dimensionless', md`by tradition the **inverse** (inertia ÷ force) is usually the named group: $1/\Rey$, $1/\Fr^2$, $1/\We$, $1/\Ma^2$`],
    use: md`A ratio $\ll 1$ means that force is negligible compared with inertia; a ratio $\gg 1$ means it dominates. The five ratios are, respectively, $1/\Rey$, $\tfrac12\Eu$, $1/\Fr^2$, $1/\We$ and $1/\Ma^2$.`,
    src: F255,
  },
  {
    id: 'by-inspection',
    name: 'Π groups by inspection (repeating ρ, V, L)',
    tex: md`\begin{aligned}
\Pi_{\text{area}} &= \frac{A_f}{L^2}\\[2pt]
\Pi_{\text{stress}} &= \frac{\tau}{\rho V^2}\\[2pt]
\Pi_{\text{force}} &= \frac{F}{\rho V^2 L^2}
\end{aligned}`,
    vars: [
      { sym: md`A_f`, desc: 'frontal area of an object', units: md`\mathrm{m^2}` },
      { sym: md`\tau`, desc: 'any stress parameter (shear stress, pressure difference…)', units: md`\mathrm{Pa}` },
      { sym: md`F`, desc: 'any force parameter (e.g. drag)', units: md`\mathrm{N}` },
      V_RHO, V_V, V_L,
    ],
    conditions: [md`repeating parameters $\rho$, $V$, $L$`, md`$\rho V^2$ has the dimensions of stress; $\rho V^2L^2$ those of force`],
    use: md`Skip the exponent algebra: an area goes with $L^2$, a stress with $\rho V^2$, a force with $\rho V^2L^2$.`,
    src: F255,
  },
  {
    id: 're',
    name: 'Reynolds number',
    key: true,
    tag: '7.11',
    tex: md`\Rey = \frac{\rho V L}{\mu} = \frac{V L}{\nu}`,
    vars: [V_RHO, V_V, V_L, V_MU, { sym: md`\nu = \mu/\rho`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` }],
    conditions: [
      'ratio of **inertia forces to viscous forces**',
      '"large" Re: generally turbulent, and viscous effects negligible in most of the flow (Fox p. 245); small Re: characteristically laminar',
      'value depends on which $L$ and $V$ are chosen — always state them',
    ],
    use: md`Compute first for almost every problem (Lec 13: "generally of importance in all types of fluid dynamics problems"). For pipes use the mean velocity and the diameter.`,
    src: [{ ...F255, note: 'Eq. (7.11)' }, F268, L21],
  },
  {
    id: 're-pipe',
    name: "Reynolds' pipe (tube) form",
    tex: md`\Rey = \frac{\rho \overline{V} D}{\mu} = \frac{\overline{V} D}{\nu}`,
    vars: [
      { sym: md`\overline{V}`, desc: 'average velocity in the pipe', units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
      V_RHO, V_MU, { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['flow in a tube or pipe', 'criterion for the flow regime (laminar vs turbulent) found by Osborne Reynolds in the 1880s'],
    use: md`Classify a pipe flow. The commonly used transition value $\Rey \approx 2300$ comes from the internal-flow chapter, not from these pages.`,
    src: [F255, F245],
  },
  {
    id: 'eu',
    name: 'Euler number (pressure coefficient)',
    key: true,
    tag: '7.12',
    tex: md`\Eu = C_p = \frac{\Delta p}{\tfrac12 \rho V^2}`,
    vars: [
      { sym: md`\Delta p`, desc: 'local pressure minus free-stream pressure', units: md`\mathrm{Pa}` },
      { sym: md`\rho,\ V`, desc: 'free-stream density and velocity', units: md`\mathrm{kg/m^3},\ \mathrm{m/s}` },
      { sym: md`\tfrac12\rho V^2`, desc: 'dynamic pressure', units: md`\mathrm{Pa}` },
    ],
    conditions: ['ratio of **pressure forces to inertia forces**', 'the ½ (used in aerodynamic and model testing) makes the denominator the dynamic pressure; it does not change the dimensions'],
    use: md`Use when pressures or pressure differences are of interest (pressure distributions on bodies, pressure drops). $C_p > 0$: above free-stream pressure; $C_p < 0$: suction.`,
    src: [{ ...F256, note: 'Eq. (7.12)' }, F268],
  },
  {
    id: 'eu-lec13',
    name: 'Euler number — lecture-table form',
    tex: md`\Eu = \frac{p}{\rho V^2}`,
    vars: [{ sym: md`p`, desc: 'pressure, or a pressure difference', units: md`\mathrm{Pa}` }, V_RHO, V_V],
    conditions: ['index of pressure force ÷ inertia force', 'differs from Fox Eq. 7.12 by a factor of 2 (no ½ in the denominator)'],
    use: md`Problems in which pressure, or pressure differences, are of interest. Convert: $\left(\Delta p/\rho V^2\right) = \tfrac12\left(\Delta p/\tfrac12\rho V^2\right)$ — always check which convention an exam question uses.`,
    src: L21,
  },
  {
    id: 'cav',
    name: 'Cavitation number',
    key: true,
    tag: '7.13',
    tex: md`\mathrm{Ca} = \frac{p - p_v}{\tfrac12 \rho V^2}`,
    vars: [
      { sym: md`p`, desc: 'pressure in the liquid stream', units: md`\mathrm{Pa}` },
      { sym: md`p_v`, desc: 'liquid vapour pressure at the test temperature', units: md`\mathrm{Pa}` },
      { sym: md`\rho,\ V`, desc: 'density and velocity of the stream', units: md`\mathrm{kg/m^3},\ \mathrm{m/s}` },
    ],
    conditions: ['liquids only (a gas has no vapour pressure)', md`an Euler number with $\Delta p = p - p_v$`, '**the smaller Ca, the more likely cavitation** — usually unwanted'],
    use: md`Cavitation studies: pumps, propellers, valves, hydrofoils. Use absolute pressures for $p$ and $p_v$.`,
    src: [{ ...F256, note: 'Eq. (7.13)' }, F268],
  },
  {
    id: 'cav-inception',
    name: 'Cavitation inception criterion',
    tex: md`\begin{aligned}
p_{\min} = p + C_{p,\min}\,\tfrac12\rho V^2 &\le p_v\\
\iff\quad C_{p,\min} &\le -\mathrm{Ca}
\end{aligned}`,
    vars: [
      { sym: md`p_{\min}`, desc: 'lowest local pressure on the body', units: md`\mathrm{Pa}` },
      { sym: md`C_{p,\min}`, desc: 'most negative pressure coefficient on the body', units: md`-` },
      { sym: md`\mathrm{Ca}`, desc: 'cavitation number of the free stream (Eq. 7.13)', units: md`-` },
      { sym: md`p,\ p_v`, desc: 'free-stream pressure and vapour pressure', units: md`\mathrm{Pa}` },
    ],
    conditions: [md`$C_{p,\min}$ depends only on shape (and Re) — so the criterion is speed-independent in terms of Ca`, 'onset estimate; real inception also depends on dissolved gas and nuclei'],
    use: md`Combine Eqs. 7.12 and 7.13: cavitation begins once Ca has fallen to $-C_{p,\min}$.`,
  },
  {
    id: 'fr',
    name: 'Froude number',
    key: true,
    tag: '7.14',
    tex: md`\Fr = \frac{V}{\sqrt{gL}}, \qquad \Fr^2 = \frac{V^2}{gL}`,
    vars: [V_V, { sym: md`g`, desc: 'gravitational acceleration', units: md`\mathrm{m/s^2}` }, { ...V_L, desc: 'characteristic length; in open-channel flow, the **water depth**' }],
    conditions: [
      md`$\Fr^2$ is the ratio of **inertia forces to gravity forces** (inverse of $gL/V^2$)`,
      'significant for flows with **free-surface effects**',
      md`open channel ($L$ = depth): $\Fr < 1$ subcritical, $\Fr > 1$ supercritical`,
    ],
    use: md`Ship waves, open channels, spillways, river models. Named after William Froude and his son Robert Edmund Froude.`,
    src: [{ ...F256, note: 'Eq. (7.14)' }, F268, L21],
  },
  {
    id: 'we',
    name: 'Weber number',
    key: true,
    tag: '7.15',
    tex: md`\We = \frac{\rho V^2 L}{\sigma}`,
    vars: [V_RHO, V_V, V_L, { sym: md`\sigma`, desc: 'surface tension', units: md`\mathrm{N/m}` }],
    conditions: [md`ratio of **inertia forces to surface-tension forces** (inverse of $\sigma/\rho V^2L$)`, 'matters only when an interface (free surface, droplet, bubble) exists'],
    use: md`Its value indicates the existence and frequency of **capillary waves** at a free surface; also droplets, sprays, bubbles and thin films.`,
    src: [{ ...F256, note: 'Eq. (7.15)' }, F268, L21],
  },
  {
    id: 'ma',
    name: 'Mach number',
    key: true,
    tag: '7.16',
    tex: md`\Ma = \frac{V}{c}`,
    vars: [{ sym: md`V`, desc: 'flow speed', units: md`\mathrm{m/s}` }, { sym: md`c`, desc: 'local speed of sound', units: md`\mathrm{m/s}` }],
    conditions: [
      md`Fox writes $M$; the lecture writes $\mathrm{Ma}$`,
      'key parameter for **compressibility** effects',
      md`flow essentially incompressible when $\Ma \lesssim 0.3$ (Fox p. 245); truly incompressible ⇔ $c = \infty$, $\Ma = 0$`,
    ],
    use: md`Decide whether density changes matter (aircraft, high-speed gas flow, water hammer). Introduced by Ernst Mach in the 1870s.`,
    src: [{ ...F256, note: 'Eq. (7.16)' }, F245, F268, L21],
  },
  {
    id: 'ma-compress',
    name: 'Mach number as inertia ÷ compressibility',
    tex: md`\begin{aligned}
\Ma &= \frac{V}{c} = \frac{V}{\sqrt{dp/d\rho}} = \frac{V}{\sqrt{E_v/\rho}}\\[4pt]
\text{or}\quad \Ma^2 &= \frac{\rho V^2 L^2}{E_v L^2} = \frac{\rho V^2}{E_v}
\end{aligned}`,
    vars: [
      { sym: md`c = \sqrt{dp/d\rho} = \sqrt{E_v/\rho}`, desc: 'speed of sound', units: md`\mathrm{m/s}` },
      { sym: md`E_v`, desc: 'bulk modulus of elasticity', units: md`\mathrm{Pa}` },
      V_RHO, V_V, V_L,
    ],
    conditions: [md`$\Ma^2$ is the inverse of the last force ratio $E_v/(\rho V^2)$`, md`$dp/d\rho$ is strictly taken at constant entropy (standard background)`],
    use: md`Shows why Ma measures compressibility: $\Ma^2$ = inertia force ÷ compressibility force. Under some conditions even liquids are quite compressible.`,
    src: F257,
  },
  {
    id: 'cauchy',
    name: 'Cauchy number',
    tex: md`\mathrm{Ca}_{\text{Cauchy}} = \frac{\rho V^2}{E_v} \;(=\Ma^2)`,
    vars: [V_RHO, V_V, { sym: md`E_v`, desc: 'bulk modulus of elasticity', units: md`\mathrm{Pa}` }],
    conditions: ['index of inertia force ÷ compressibility force', md`equals $\Ma^2$ because $c^2 = E_v/\rho$ (the identity is supplementary)`],
    use: md`Flows in which the compressibility of the fluid is important. **Not** the cavitation number — Lecture 13 and Fox use the same symbol "Ca" for different groups.`,
    src: L21,
  },
  {
    id: 'strouhal',
    name: 'Strouhal number',
    tex: md`\St = \frac{\omega \ell}{V}`,
    vars: [
      { sym: md`\omega`, desc: 'characteristic frequency of oscillation (or rotation)', units: md`\mathrm{s^{-1}}` },
      { sym: md`\ell`, desc: 'characteristic length', units: md`\mathrm{m}` },
      V_V,
    ],
    conditions: ['index of inertia (local) force ÷ inertia (convective) force', md`the slide does not say whether ω is in rad/s or Hz — with $f$ in Hz, vortex shedding behind a cylinder gives $fD/V \approx 0.2$ (supplementary)`],
    use: md`Unsteady flow with a characteristic frequency of oscillation or a rotating boundary (vortex shedding, flapping, rotating machinery).`,
    src: L21,
  },
  {
    id: 'mach-wedge',
    name: 'Mach (wave) angle',
    tex: md`\sin\alpha = \frac{1}{\Ma}\quad(\Ma > 1)`,
    vars: [
      { sym: md`\alpha`, desc: 'half-angle of the wedge (Mach cone) that contains all the waves', units: md`\mathrm{rad}` },
      { sym: md`\Ma`, desc: 'Mach number (or Froude number for shallow-water waves)', units: md`-` },
    ],
    conditions: ['source moving faster than the waves it emits', 'small-amplitude waves of constant speed'],
    use: md`Geometry of the wavefront animation: in time $t$ the source moves $Vt$ while a wave travels $ct$, so $\sin\alpha = ct/Vt$.`,
  },
]

/* ------------------------------------------------------------------------------------------------ examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-force-budget',
    concept: 'force-ratios',
    title: 'Force budget for a 10 cm object in a water stream',
    difficulty: 1,
    given: md`Water at 20 °C ($\rho = 998$ kg/m³, $\mu = 1.00\times10^{-3}$ Pa·s, $\sigma = 0.0728$ N/m, $E_v = 2.19\times10^{9}$ Pa) flows at $V = 2$ m/s past an object of size $L = 0.1$ m. A typical pressure difference is $\Delta p = 2$ kPa.`,
    find: md`The order-of-magnitude size of each force and its ratio to the inertia force.`,
    assumptions: md`Order-of-magnitude estimates of Fox p. 255; factors of order one dropped.`,
    steps: [
      { title: 'Inertia force', md: md`$\rho V^2L^2 = 998 \times 2^2 \times 0.1^2 = 39.9$ N` },
      {
        title: 'Viscous and pressure forces',
        md: md`Viscous: $\mu VL = 10^{-3}\times 2\times 0.1 = 2.0\times10^{-4}$ N → ratio $= 2.0\times10^{-4}/39.9 = 5.0\times10^{-6}$ (so $\Rey = 2.0\times10^5$).

Pressure: $\Delta p L^2 = 2000\times 0.01 = 20$ N → ratio $= 0.50$.`,
      },
      {
        title: 'Gravity and surface tension',
        md: md`Gravity: $g\rho L^3 = 9.81\times 998\times 0.001 = 9.79$ N → ratio $= 0.245$ $(= gL/V^2 = 9.81\times0.1/4)$.

Surface tension: $\sigma L = 0.0728\times 0.1 = 7.28\times10^{-3}$ N → ratio $= 1.82\times10^{-4}$ (so $\We = 5.5\times10^3$).`,
      },
      {
        title: 'Compressibility',
        md: md`$E_vL^2 = 2.19\times10^9\times 0.01 = 2.19\times10^7$ N → ratio $= 5.49\times10^5$. Its inverse is $\Ma^2 = 1.82\times10^{-6}$, i.e. $\Ma = 1.35\times10^{-3}$ ($c = \sqrt{E_v/\rho} = 1481$ m/s).`,
      },
    ],
    answer: md`Inertia ≈ 40 N; pressure (0.5×) and gravity (0.25×) are comparable to it; viscous ($5\times10^{-6}$×) and surface tension ($1.8\times10^{-4}$×) are negligible in the bulk; compressibility "force" is $5.5\times10^5$ times inertia, so density changes are negligible ($\Ma \approx 0.001$).`,
    insight: 'A huge compressibility ratio means the fluid is effectively rigid in volume — small Ma means incompressible.',
  },
  {
    id: 'ex-by-inspection',
    concept: 'force-ratios',
    title: 'Groups by inspection for car aerodynamics',
    difficulty: 1,
    given: md`Variables for a car: drag $F_D$, frontal area $A_f$, wall shear stress $\tau_w$, pressure difference $\Delta p$, air density $\rho$, speed $V$, length $L$. Numbers: $F_D = 400$ N at $V = 30$ m/s, $\rho = 1.2$ kg/m³, $A_f = 2.2$ m².`,
    find: md`Dimensionless groups by inspection with repeating parameters $\rho$, $V$, $L$; the value of the drag group if $A_f$ is used as the area scale.`,
    steps: [
      { title: 'Area', md: md`An area needs only $L^2$: $\Pi_1 = A_f/L^2$.` },
      { title: 'Stresses', md: md`$\rho V^2$ has dimensions of stress, so $\Pi_2 = \tau_w/(\rho V^2)$ and $\Pi_3 = \Delta p/(\rho V^2)$.` },
      { title: 'Force', md: md`$\rho V^2L^2$ has dimensions of force, so $\Pi_4 = F_D/(\rho V^2L^2)$.` },
      { title: 'Number', md: md`With $L^2 \to A_f$: $F_D/(\rho V^2A_f) = 400/(1.2\times 30^2\times 2.2) = 400/2376 = 0.168$.` },
    ],
    answer: md`$A_f/L^2$, $\tau_w/\rho V^2$, $\Delta p/\rho V^2$, $F_D/\rho V^2L^2$; drag group $= 0.168$ (half of a drag coefficient defined with $\tfrac12\rho V^2A$, i.e. $C_D = 0.34$).`,
    insight: 'Each group is a force (or stress) measured in units of inertia — no exponent algebra needed.',
  },
  {
    id: 'ex-re-pipe',
    concept: 'common-groups',
    title: 'Reynolds number of water in a pipe',
    difficulty: 1,
    given: md`Water at 20 °C ($\rho = 998$ kg/m³, $\mu = 1.00\times10^{-3}$ Pa·s) flows with mean velocity $\overline{V} = 1.5$ m/s in a pipe of diameter $D = 50$ mm.`,
    find: md`$\Rey$ and the flow regime.`,
    steps: [
      { title: 'Choose the scales', md: md`Pipe: $L = D = 0.05$ m, $V = \overline{V} = 1.5$ m/s.` },
      { title: 'Compute', md: md`$\Rey = \dfrac{\rho\overline{V}D}{\mu} = \dfrac{998\times1.5\times0.05}{1.00\times10^{-3}} = 7.49\times10^4$` },
      { title: 'Check with ν', md: md`$\nu = \mu/\rho = 1.002\times10^{-6}$ m²/s; $\overline{V}D/\nu = 0.075/1.002\times10^{-6} = 7.49\times10^4$ ✓` },
      { title: 'Interpret', md: md`"Large" Re (far above the usual pipe transition value ≈ 2300): inertia dominates viscous forces and the flow is **turbulent**.` },
    ],
    answer: md`$\Rey \approx 7.5\times10^4$ — turbulent.`,
    insight: 'Use the mean velocity and the diameter for pipes; Re ∝ V·D, so even modest pipes are usually turbulent with water.',
  },
  {
    id: 'ex-froude',
    concept: 'common-groups',
    title: 'Froude number of a channel and of a ship',
    difficulty: 1,
    given: md`(a) Water flows at $V = 3$ m/s in an open channel of depth $y = 0.5$ m. (b) A ship of length $L = 150$ m sails at $V = 10$ m/s. $g = 9.81$ m/s².`,
    find: md`$\Fr$ in each case and the channel regime.`,
    steps: [
      { title: 'Channel (L = depth)', md: md`$\Fr = \dfrac{V}{\sqrt{gy}} = \dfrac{3}{\sqrt{9.81\times0.5}} = \dfrac{3}{2.215} = 1.35$` },
      { title: 'Regime', md: md`$\Fr > 1$ → **supercritical** flow (Fox p. 256).` },
      { title: 'Ship (L = hull length)', md: md`$\Fr = \dfrac{10}{\sqrt{9.81\times150}} = \dfrac{10}{38.36} = 0.261$` },
      { title: 'Force ratio', md: md`$\Fr^2 = 0.068$ for the ship: inertia is only ≈ 7 % of the gravity-force scale — gravity (wave making) is significant.` },
    ],
    answer: md`(a) $\Fr = 1.35$, supercritical; (b) $\Fr = 0.261$.`,
    insight: 'The characteristic length changes meaning: depth for channels, hull length for ships.',
  },
  {
    id: 'ex-cavitation',
    concept: 'common-groups',
    title: 'Cavitation number in a water tunnel',
    difficulty: 2,
    given: md`Water at 20 °C ($\rho = 998$ kg/m³, $p_v = 2.34$ kPa) flows at $V = 12$ m/s past a hydrofoil. The tunnel pressure is first $p = 120$ kPa (abs), then lowered to 40 kPa. The hydrofoil's minimum pressure coefficient is $C_{p,\min} = -1.2$.`,
    find: md`(a) Ca at both pressures; (b) the speed at which cavitation starts when $p = 120$ kPa.`,
    steps: [
      { title: 'Dynamic pressure', md: md`$\tfrac12\rho V^2 = 0.5\times998\times12^2 = 71\,856$ Pa` },
      {
        title: 'Cavitation numbers',
        md: md`$p = 120$ kPa: $\mathrm{Ca} = (120\,000 - 2340)/71\,856 = 1.64$

$p = 40$ kPa: $\mathrm{Ca} = (40\,000 - 2340)/71\,856 = 0.524$ — smaller, so cavitation is more likely.`,
      },
      {
        title: 'Inception condition',
        md: md`Cavitation begins when $p_{\min} = p + C_{p,\min}\tfrac12\rho V^2 = p_v$, i.e. $\mathrm{Ca} = -C_{p,\min} = 1.2$.`,
      },
      {
        title: 'Speed',
        md: md`$\tfrac12\rho V^2 = (p - p_v)/1.2$ ⇒ $V = \sqrt{\dfrac{2(120\,000-2340)}{1.2\times998}} = \sqrt{196.5} = 14.0$ m/s`,
      },
    ],
    answer: md`(a) Ca = 1.64 and 0.524; (b) cavitation starts at about $V = 14.0$ m/s.`,
    insight: 'Lowering the pressure or raising the speed both reduce Ca; cavitation appears once Ca drops to −C_p,min.',
  },
  {
    id: 'ex-weber',
    concept: 'common-groups',
    title: 'Weber number of an impacting droplet',
    difficulty: 1,
    given: md`A water droplet ($\rho = 998$ kg/m³, $\sigma = 0.0728$ N/m) of diameter $D = 2$ mm hits a floor at $V = 3$ m/s.`,
    find: md`$\We$ based on $D$ and its meaning.`,
    steps: [
      { title: 'Compute', md: md`$\We = \dfrac{\rho V^2 D}{\sigma} = \dfrac{998\times3^2\times0.002}{0.0728} = \dfrac{17.96}{0.0728} = 247$` },
      { title: 'Interpret', md: md`Inertia is ~250 times the surface-tension force: the drop flattens strongly and may splash. At $\We \lesssim 1$ it would stay nearly spherical.` },
    ],
    answer: md`$\We \approx 247$ — inertia dominates surface tension.`,
    insight: 'Surface tension wins only for small, slow drops (We ∝ V²D).',
  },
  {
    id: 'ex-mach',
    concept: 'common-groups',
    title: 'Mach number of an airliner and of a car',
    difficulty: 2,
    given: md`Air: $c = \sqrt{kRT}$ with $k = 1.4$, $R = 287$ J/(kg·K). Airliner: $V = 250$ m/s at $T = 223.15$ K (−50 °C). Car: $V = 30$ m/s at $T = 293.15$ K.`,
    find: md`$\Ma$ for each, whether compressibility matters, and the Cauchy number of the airliner.`,
    steps: [
      { title: 'Sound speeds', md: md`$c_{-50} = \sqrt{1.4\times287\times223.15} = 299.4$ m/s; $\;c_{20} = \sqrt{1.4\times287\times293.15} = 343.2$ m/s` },
      { title: 'Mach numbers', md: md`Airliner: $\Ma = 250/299.4 = 0.835$. Car: $\Ma = 30/343.2 = 0.0874$.` },
      { title: 'Compressibility', md: md`Car: $\Ma < 0.3$ → essentially incompressible. Airliner: $\Ma > 0.3$ → compressibility must be included.` },
      { title: 'Cauchy number', md: md`$\rho V^2/E_v = \Ma^2 = 0.835^2 = 0.697$.` },
    ],
    answer: md`Airliner $\Ma = 0.835$ (compressible, Cauchy number 0.70); car $\Ma = 0.087$ (incompressible).`,
    insight: 'c depends on temperature, so the same speed gives a higher Mach number in cold air.',
  },
  {
    id: 'ex-strouhal',
    concept: 'common-groups',
    title: 'Strouhal number of vortex shedding',
    difficulty: 1,
    given: md`Wind at $V = 10$ m/s blows across a pole of diameter $D = 0.1$ m; vortices are shed at $f = 20$ Hz.`,
    find: md`The Strouhal number $fD/V$.`,
    steps: [
      { title: 'Compute', md: md`$\St = \dfrac{fD}{V} = \dfrac{20\times0.1}{10} = 0.20$` },
      { title: 'Interpret', md: md`Local (unsteady) inertia is about 0.2 of the convective inertia. The value ≈ 0.2 is typical of circular cylinders over a wide Re range.` },
    ],
    answer: md`$\St = 0.20$ (with $f$ in Hz; with angular frequency $2\pi f$ it would be $1.26$).`,
    insight: 'State whether the frequency is in Hz or rad/s — the slide only says "characteristic frequency".',
  },
]

/* ------------------------------------------------------------------------------------------------ practice */

export const practice: PracticeDef[] = [
  {
    id: 'pr-inertia-exponents',
    concept: 'force-ratios',
    difficulty: 1,
    q: md`Show by exponent matching that $\rho^aV^bL^c$ has the dimensions of force ($MLt^{-2}$) only for one set of exponents. Which?`,
    hint: md`Write $[\rho] = ML^{-3}$, $[V] = Lt^{-1}$, $[L] = L$ and equate powers of $M$, $t$, $L$.`,
    answer: md`$a = 1$, $b = 2$, $c = 2$: $\rho V^2L^2$.`,
    solution: md`$(ML^{-3})^a(Lt^{-1})^b L^c = MLt^{-2}$.

- $M$: $a = 1$ (only $\rho$ contains mass)
- $t$: $-b = -2$ ⇒ $b = 2$ (only $V$ contains time)
- $L$: $-3a + b + c = 1$ ⇒ $-3 + 2 + c = 1$ ⇒ $c = 2$

So the unique combination is $\rho V^2L^2$ — Fox's measure of inertia force.`,
  },
  {
    id: 'pr-wave-speed',
    concept: 'force-ratios',
    difficulty: 2,
    q: md`The speed $c$ of deep-water gravity waves depends only on $g$, the wavelength $\lambda$ and the density $\rho$. (a) How many Π groups are there and what do you conclude? (b) A wave of $\lambda = 1$ m travels at 1.25 m/s. Predict $c$ for $\lambda = 4$ m.`,
    hint: md`Four variables, three dimensions — but can $\rho$ combine with anything? If only one Π exists it must be a constant.`,
    answer: md`One group, $c/\sqrt{g\lambda} = $ const; $c = 2.50$ m/s.`,
    solution: md`(a) Variables $c, g, \lambda, \rho$: $n = 4$, $m = 3$ ⇒ $n - m = 1$. $\rho$ is the only variable with mass, so it cannot appear: $\Pi = c/\sqrt{g\lambda}$. With a single Π, the Buckingham Pi theorem says it **must be a constant** (Fox p. 255): $c = K\sqrt{g\lambda}$. (Theory gives $K = 1/\sqrt{2\pi}$.)

(b) $c \propto \sqrt{\lambda}$: $c_2 = 1.25\sqrt{4/1} = 2.50$ m/s.`,
    check: [{ label: 'c at λ = 4 m', value: 2.5, units: 'm/s' }],
  },
  {
    id: 'pr-glycerin',
    concept: 'force-ratios',
    difficulty: 1,
    q: md`Glycerin ($\rho = 1260$ kg/m³, $\mu = 1.49$ Pa·s) moves at $V = 0.05$ m/s past an object of size $L = 1$ cm. Estimate the ratio viscous/inertia and $\Rey$. Which force dominates?`,
    answer: md`viscous/inertia ≈ 2.37, $\Rey \approx 0.42$: viscous forces dominate.`,
    solution: md`$\dfrac{\text{viscous}}{\text{inertia}} \sim \dfrac{\mu}{\rho VL} = \dfrac{1.49}{1260\times0.05\times0.01} = \dfrac{1.49}{0.63} = 2.37$.

$\Rey = 1/2.37 = 0.423$. Viscous forces exceed inertia — a creeping, laminar flow.`,
    check: [{ label: 'Re', value: 0.423, units: '' }],
  },
  {
    id: 'pr-capillary-length',
    concept: 'force-ratios',
    difficulty: 2,
    q: md`Using Fox's estimates, find the size $L$ at which the gravity force on a water element ($\rho = 998$ kg/m³) equals its surface-tension force ($\sigma = 0.0728$ N/m). What happens to much smaller and much larger elements?`,
    hint: md`Set $\rho g L^3 = \sigma L$.`,
    answer: md`$L = \sqrt{\sigma/\rho g} \approx 2.7$ mm.`,
    solution: md`$\rho gL^3 = \sigma L$ ⇒ $L = \sqrt{\dfrac{\sigma}{\rho g}} = \sqrt{\dfrac{0.0728}{998\times9.81}} = \sqrt{7.44\times10^{-6}} = 2.73\times10^{-3}$ m.

Since gravity ∝ $L^3$ and surface tension ∝ $L$, elements much smaller than ≈ 3 mm are surface-tension dominated (drops stay round, capillary rise) and much larger ones are gravity dominated (puddles flatten).`,
    check: [{ label: 'L', value: 2.73, units: 'mm' }],
  },
  {
    id: 'pr-tunnel',
    concept: 'common-groups',
    difficulty: 1,
    q: md`A wind-tunnel model of length $L = 0.5$ m is tested in air at 20 °C ($\rho = 1.204$ kg/m³, $\mu = 1.81\times10^{-5}$ Pa·s, $c = 343.2$ m/s) at $V = 60$ m/s. Find $\Rey$ and $\Ma$. Can the flow be treated as incompressible?`,
    answer: md`$\Rey = 2.0\times10^6$, $\Ma = 0.175$ — yes, incompressible.`,
    solution: md`$\Rey = \dfrac{1.204\times60\times0.5}{1.81\times10^{-5}} = 2.00\times10^6$.

$\Ma = 60/343.2 = 0.175 < 0.3$ ⇒ essentially incompressible (Fox p. 245).`,
    check: [
      { label: 'Re', value: 1.996e6, units: '' },
      { label: 'Ma', value: 0.1748, units: '' },
    ],
  },
  {
    id: 'pr-river',
    concept: 'common-groups',
    difficulty: 1,
    q: md`A river flows at $V = 1.2$ m/s with depth 2 m. Compute $\Fr$ and classify the flow.`,
    answer: md`$\Fr = 0.271$, subcritical.`,
    solution: md`Open channel: $L$ = depth. $\Fr = \dfrac{1.2}{\sqrt{9.81\times2}} = \dfrac{1.2}{4.43} = 0.271 < 1$ ⇒ **subcritical** (Fox p. 256).`,
    check: [{ label: 'Fr', value: 0.271, units: '' }],
  },
  {
    id: 'pr-pump-cav',
    concept: 'common-groups',
    difficulty: 2,
    q: md`At a pump inlet, water at 20 °C ($\rho = 998$ kg/m³, $p_v = 2.34$ kPa) has $p = 25$ kPa (abs) and $V = 6$ m/s. (a) Find the cavitation number. (b) At what inlet velocity would Ca fall to 0.5 (same $p$)?`,
    hint: md`Ca ∝ 1/V² at fixed $p - p_v$.`,
    answer: md`(a) Ca = 1.26; (b) $V \approx 9.53$ m/s.`,
    solution: md`(a) $\tfrac12\rho V^2 = 0.5\times998\times36 = 17\,964$ Pa; $\mathrm{Ca} = (25\,000 - 2340)/17\,964 = 1.26$.

(b) $0.5 = \dfrac{22\,660}{\tfrac12\times998\,V^2}$ ⇒ $V^2 = \dfrac{2\times22\,660}{0.5\times998} = 90.8$ ⇒ $V = 9.53$ m/s. Higher speed → smaller Ca → cavitation more likely.`,
    check: [
      { label: 'Ca', value: 1.261, units: '' },
      { label: 'V', value: 9.53, units: 'm/s' },
    ],
  },
  {
    id: 'pr-euler-convert',
    concept: 'common-groups',
    difficulty: 1,
    q: md`On a car model in air ($\rho = 1.2$ kg/m³, $V = 40$ m/s) a pressure tap reads $\Delta p = 1.5$ kPa above free stream. Compute the Euler number using Fox's Eq. 7.12 and using the Lecture 13 table form.`,
    answer: md`Fox: $\Eu = 1.56$; lecture: $\Eu = 0.781$.`,
    solution: md`Fox: $\Eu = \dfrac{\Delta p}{\tfrac12\rho V^2} = \dfrac{1500}{0.5\times1.2\times1600} = \dfrac{1500}{960} = 1.5625$.

Lecture: $\dfrac{p}{\rho V^2} = \dfrac{1500}{1920} = 0.781$ — exactly half. Always state the convention.

(A $C_p$ above 1 at a single tap would be unusual in incompressible flow — the stagnation value is 1 — so in practice recheck such a reading.)`,
    check: [
      { label: 'Eu (Fox)', value: 1.5625, units: '' },
      { label: 'Eu (lecture)', value: 0.78125, units: '' },
    ],
  },
  {
    id: 'pr-inkjet',
    concept: 'common-groups',
    difficulty: 2,
    q: md`An ink-jet droplet ($D = 30$ μm, $V = 8$ m/s, $\rho = 1050$ kg/m³, $\sigma = 0.035$ N/m, $\mu = 3\times10^{-3}$ Pa·s). Compute $\We$ and $\Rey$ based on $D$.`,
    answer: md`$\We = 57.6$, $\Rey = 84$.`,
    solution: md`$\We = \dfrac{\rho V^2D}{\sigma} = \dfrac{1050\times64\times30\times10^{-6}}{0.035} = 57.6$.

$\Rey = \dfrac{\rho VD}{\mu} = \dfrac{1050\times8\times30\times10^{-6}}{3\times10^{-3}} = 84$.

Both inertia and the other forces matter: the jet breaks up into drops (We ≫ 1) but viscosity still damps satellites (Re only ~10²).`,
    check: [
      { label: 'We', value: 57.6, units: '' },
      { label: 'Re', value: 84, units: '' },
    ],
  },
  {
    id: 'pr-torpedo',
    concept: 'common-groups',
    difficulty: 2,
    q: md`Water has $E_v = 2.19\times10^9$ Pa and $\rho = 998$ kg/m³. (a) Find the speed of sound. (b) Find $\Ma$ and the Cauchy number for a torpedo at 25 m/s.`,
    answer: md`$c = 1481$ m/s; $\Ma = 0.0169$; Cauchy $= 2.85\times10^{-4}$.`,
    solution: md`(a) $c = \sqrt{E_v/\rho} = \sqrt{2.19\times10^9/998} = 1481$ m/s (Fox p. 257).

(b) $\Ma = 25/1481 = 0.0169$; $\rho V^2/E_v = \Ma^2 = 2.85\times10^{-4}$ — compressibility is negligible.`,
    check: [
      { label: 'c', value: 1481, units: 'm/s' },
      { label: 'Ma', value: 0.01688, units: '' },
    ],
  },
  {
    id: 'pr-aeolian',
    concept: 'common-groups',
    difficulty: 1,
    q: md`A power line of diameter 2 cm "sings" in an 8 m/s wind. Taking $fD/V \approx 0.2$ for a cylinder, estimate the shedding frequency.`,
    answer: md`$f \approx 80$ Hz.`,
    solution: md`$f = \St\,V/D = 0.2\times8/0.02 = 80$ Hz — an audible hum (an "aeolian tone").`,
    check: [{ label: 'f', value: 80, units: 'Hz' }],
  },
]

/* ------------------------------------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-inertia',
    concept: 'force-ratios',
    difficulty: 1,
    q: 'Which combination of ρ, V and L Fox uses as the measure of the inertia force?',
    options: [md`$\rho V^2L^2$`, md`$\rho V L$`, md`$\rho V^2$`, md`$\rho V L^3$`],
    answer: 0,
    explain: md`$ma \sim \rho L^3\cdot V^2/L = \rho V^2L^2$, the unique product with dimensions $MLt^{-2}$. $\rho V^2$ is a **stress**, not a force — the most common slip.`,
    src: F255,
  },
  {
    id: 'q-gravity-ratio',
    concept: 'force-ratios',
    difficulty: 1,
    q: 'The ratio gravity force / inertia force is of order:',
    options: [md`$gL/V^2$`, md`$V^2/(gL)$`, md`$V/\sqrt{gL}$`, md`$g/(V L)$`],
    answer: 0,
    explain: md`$g\rho L^3/(\rho V^2L^2) = gL/V^2$. Its inverse $V^2/gL$ is $\Fr^2$ (inertia/gravity), and $V/\sqrt{gL}$ is $\Fr$ itself — not a force ratio until squared.`,
    src: F255,
  },
  {
    id: 'q-single-pi',
    concept: 'force-ratios',
    difficulty: 2,
    q: 'If the Buckingham procedure leaves only one dimensionless group (n − m = 1), that group must be a constant.',
    options: ['True', 'False'],
    answer: 0,
    explain: md`With one Π there is nothing for it to depend on, so $\Pi = $ const (Fox p. 255). Only the constant must come from experiment or theory.`,
    src: F255,
  },
  {
    id: 'q-size-scaling',
    concept: 'force-ratios',
    difficulty: 2,
    q: 'Same fluid, same speed, but the object is made 10 times larger. Which ratio to the inertia force INCREASES?',
    options: ['gravity / inertia', 'viscous / inertia', 'surface tension / inertia', 'compressibility / inertia'],
    answer: 0,
    explain: md`gravity/inertia $= gL/V^2 \propto L$ grows. viscous/inertia $\propto 1/L$ and surface tension/inertia $\propto 1/L$ shrink; compressibility/inertia $= E_v/\rho V^2$ is independent of $L$.`,
  },
  {
    id: 'q-six-forces',
    concept: 'force-ratios',
    difficulty: 1,
    q: 'Which of these is NOT one of the six forces Fox lists for flowing fluids?',
    options: ['magnetic (Lorentz) force', 'surface tension', 'compressibility', 'viscosity', 'gravity'],
    answer: 0,
    explain: md`Fox's list: inertia, viscosity, pressure, gravity, surface tension and compressibility. Electromagnetic forces need extra groups (not covered here).`,
    src: F255,
  },
  {
    id: 'q-re-meaning',
    concept: 'common-groups',
    difficulty: 1,
    q: 'The Reynolds number is the ratio of…',
    options: ['inertia forces to viscous forces', 'viscous forces to inertia forces', 'inertia forces to gravity forces', 'pressure forces to viscous forces'],
    answer: 0,
    explain: md`$\Rey = \rho VL/\mu$ = inertia/viscous; Fox's raw ratio $\mu/(\rho VL)$ is viscous/inertia, which was inverted by tradition.`,
    src: F255,
  },
  {
    id: 'q-cavitation',
    concept: 'common-groups',
    difficulty: 1,
    q: 'For a given liquid stream, cavitation becomes MORE likely when the cavitation number…',
    options: ['decreases', 'increases', 'equals 1 exactly', 'becomes independent of speed'],
    answer: 0,
    explain: md`Fox p. 256: the smaller Ca $= (p-p_v)/\tfrac12\rho V^2$, the more likely cavitation — low pressure or high speed. A large Ca means a big margin above vapour pressure.`,
    src: F256,
  },
  {
    id: 'q-froude-channel',
    concept: 'common-groups',
    difficulty: 1,
    q: 'In open-channel flow (L = water depth), Fr < 1 indicates:',
    options: ['subcritical flow', 'supercritical flow', 'turbulent flow', 'compressible flow'],
    answer: 0,
    explain: md`Fox p. 256: $\Fr < 1$ subcritical, $\Fr > 1$ supercritical. Fr says nothing about laminar/turbulent — that is Re's job.`,
    src: F256,
  },
  {
    id: 'q-mach-03',
    concept: 'common-groups',
    difficulty: 1,
    q: 'A gas flow can usually be treated as essentially incompressible when the Mach number is below about…',
    options: ['0.3', '1.0', '0.03', '3'],
    answer: 0,
    explain: md`Fox p. 245: incompressible if $\Ma \lesssim 0.3$ (density changes then stay within a few per cent). $\Ma = 1$ is the sonic point, far beyond that.`,
    src: F245,
  },
  {
    id: 'q-cp',
    concept: 'common-groups',
    difficulty: 1,
    q: 'Fox notes that the Euler number Δp/(½ρV²) is often called the…',
    options: ['pressure coefficient C_p', 'drag coefficient C_D', 'cavitation number', 'Cauchy number'],
    answer: 0,
    explain: md`Eq. 7.12: $\Eu = C_p$. The cavitation number is the special case $\Delta p = p - p_v$, but it is not the general name.`,
    src: F256,
  },
  {
    id: 'q-ca-clash',
    concept: 'common-groups',
    difficulty: 2,
    q: 'In the Lecture 13 table, the symbol "Ca" stands for ρV²/E_v. This group equals…',
    options: [md`$\Ma^2$`, md`the cavitation number $(p-p_v)/\tfrac12\rho V^2$`, md`$\We/\Rey$`, md`$1/\Fr^2$`],
    answer: 0,
    explain: md`The lecture's Ca is the **Cauchy** number; with $c^2 = E_v/\rho$ it equals $\Ma^2$ — that is why the slide gives Ca and Ma the same interpretation. Fox's Ca (Eq. 7.13) is the cavitation number — same symbol, different group.`,
    src: [L21, F257],
  },
  {
    id: 'q-weber',
    concept: 'common-groups',
    difficulty: 2,
    q: 'According to Fox, the value of the Weber number indicates…',
    options: ['the existence and frequency of capillary waves at a free surface', 'whether a pipe flow is laminar', 'whether a gas flow is compressible', 'the onset of cavitation'],
    answer: 0,
    explain: md`$\We = \rho V^2L/\sigma$ = inertia/surface tension, so it governs capillary waves (and droplets, bubbles). The others belong to Re, Ma and Ca.`,
    src: F256,
  },
  {
    id: 'q-strouhal',
    concept: 'common-groups',
    difficulty: 2,
    q: 'The Strouhal number ωℓ/V is the index of which force ratio (Lecture 13)?',
    options: ['local inertia ÷ convective inertia', 'inertia ÷ viscous', 'inertia ÷ surface tension', 'pressure ÷ inertia'],
    answer: 0,
    explain: md`Unsteady (local) acceleration $\sim V\omega$ vs convective acceleration $\sim V^2/\ell$: ratio $\omega\ell/V$. Used for oscillating flows and rotating boundaries.`,
    src: L21,
  },
]

/* ------------------------------------------------------------------------------------------------ flashcards */

export const flashcards: Flashcard[] = [
  { id: 'fc-inertia', front: 'Measure of the inertia force?', back: md`$\rho V^2L^2$ (from $ma \sim \rho L^3\cdot V^2/L$); a stress scales with $\rho V^2$.`, src: F255 },
  { id: 'fc-six', front: 'The six forces met in flowing fluids (Fox §7.4)?', back: 'Inertia, viscosity, pressure, gravity, surface tension, compressibility.', src: F255 },
  { id: 'fc-ratios', front: 'Viscous, gravity, surface-tension and compressibility forces ÷ inertia?', back: md`$\mu/\rho VL$, $\;gL/V^2$, $\;\sigma/\rho V^2L$, $\;E_v/\rho V^2$`, src: F255 },
  { id: 'fc-single', front: 'Only one Π group (n − m = 1)?', back: 'It must be a constant.', src: F255 },
  { id: 'fc-re', front: 'Reynolds number (Eq. 7.11) and meaning?', back: md`$\Rey = \rho VL/\mu = VL/\nu$ — inertia/viscous; large → generally turbulent.`, src: F255 },
  { id: 'fc-eu', front: 'Euler number (Eq. 7.12)?', back: md`$\Eu = \Delta p/\tfrac12\rho V^2 = C_p$ — pressure/inertia. Lecture form: $p/\rho V^2$ (no ½).`, src: [F256, L21] },
  { id: 'fc-ca', front: 'Cavitation number (Eq. 7.13)?', back: md`$\mathrm{Ca} = (p-p_v)/\tfrac12\rho V^2$; smaller Ca → cavitation more likely.`, src: F256 },
  { id: 'fc-fr', front: 'Froude number (Eq. 7.14) and open-channel regimes?', back: md`$\Fr = V/\sqrt{gL}$; $\Fr^2$ = inertia/gravity; $L$ = depth: $\Fr<1$ subcritical, $\Fr>1$ supercritical.`, src: F256 },
  { id: 'fc-we', front: 'Weber number (Eq. 7.15)?', back: md`$\We = \rho V^2L/\sigma$ — inertia/surface tension; capillary waves.`, src: F256 },
  { id: 'fc-ma', front: 'Mach number (Eq. 7.16) and incompressibility rule?', back: md`$\Ma = V/c$, $\Ma^2 = \rho V^2/E_v$ = inertia/compressibility; incompressible if $\Ma \lesssim 0.3$.`, src: [F256, F257, F245] },
  { id: 'fc-cauchy', front: 'Cauchy number (Lecture 13)?', back: md`$\rho V^2/E_v$ (= $\Ma^2$) — inertia/compressibility. Not the cavitation number!`, src: L21 },
  { id: 'fc-st', front: 'Strouhal number (Lecture 13)?', back: md`$\St = \omega\ell/V$ — local/convective inertia; unsteady flows with a characteristic frequency.`, src: L21 },
]

/* ------------------------------------------------------------------------------------------------ takeaways */

export const takeaways: string[] = [
  md`Every classic group is a **ratio of two forces**; inertia, estimated as $\rho V^2L^2$, is the common yardstick (Fox p. 255).`,
  md`By inspection: divide a stress by $\rho V^2$, a force by $\rho V^2L^2$, an area by $L^2$. If only one Π is left, it is a constant.`,
  md`$\Rey = \rho VL/\mu$ (7.11): inertia/viscous — large Re generally turbulent, small Re laminar; pipes use $\overline{V}$ and $D$.`,
  md`$\Eu = C_p = \Delta p/\tfrac12\rho V^2$ (7.12): pressure/inertia. The lecture table writes $p/\rho V^2$ — a factor 2 different.`,
  md`Cavitation number $(p-p_v)/\tfrac12\rho V^2$ (7.13): the **smaller** it is, the more likely cavitation.`,
  md`$\Fr = V/\sqrt{gL}$ (7.14): $\Fr^2$ = inertia/gravity; free-surface flows; channel ($L$ = depth) subcritical below 1, supercritical above.`,
  md`$\We = \rho V^2L/\sigma$ (7.15): inertia/surface tension — droplets, bubbles, capillary waves.`,
  md`$\Ma = V/c$ (7.16), $\Ma^2 = \rho V^2/E_v$ = inertia/compressibility = the lecture's **Cauchy number**; incompressible if $\Ma \lesssim 0.3$.`,
  md`Strouhal $\omega\ell/V$ (lecture table): local vs convective inertia, for oscillating or rotating flows.`,
  md`Exam traps: "Ca" means **cavitation** in Fox but **Cauchy** in the lecture; Fr and Ma are force ratios only when **squared**; always state which $L$ and $V$ you used.`,
]

/* ------------------------------------------------------------------------------------------------ content */

export default function Content() {
  return (
    <>
      {/* ============================================================== force-ratios */}
      <Concept id="force-ratios">
        <Step kind="intro" src={[F254, F255]}>
          <Md>{md`Over the years **several hundred** dimensionless groups have been identified in engineering. By tradition each carries the name of a prominent scientist or engineer — usually the one who first used it. A handful appear so often in fluid mechanics that you should know them **by definition** — and, more importantly, by **physical meaning**.

Fox's key observation (§7.4): the forces met in flowing fluids come from just six sources —

**inertia · viscosity · pressure · gravity · surface tension · compressibility**

The ratio of any two forces is dimensionless. So if we choose **inertia** as the reference and estimate every force in terms of a size $L$, a speed $V$ and the fluid properties, each ratio *is* a Π group. This is exactly why Fox recommends $\rho$, $V$, $L$ as repeating parameters: the resulting groups read directly as "some force ÷ inertia".`}</Md>
          <Callout kind="key" title="Why this matters">
            <Md>{md`The value of a force ratio tells you — **before any experiment or analysis** — which physics you may neglect and which you must keep (Fox p. 257). It is the basis of model testing (next topic: similitude).`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture a cube of fluid of side $L$ being pushed around at speed $V$. To change its velocity by about $V$ over a distance $L$ you need a force of order "mass × acceleration" $= \rho L^3 \times V^2/L$. That is the fluid's **stubbornness** — its inertia.

Every other force is a competitor in a tug-of-war against inertia:

- **viscosity** smears out velocity differences (honey, tiny organisms);
- **gravity** pulls the free surface flat and makes waves (ships, rivers);
- **surface tension** holds drops round (rain, sprays);
- **compressibility** resists squeezing (supersonic jets, water hammer);
- **pressure differences** push the fluid along (and are usually *produced* by inertia).

If a competitor's ratio is tiny, drop it from the analysis. If it is huge, it dominates and inertia is the one to drop.`}</Md>
          <Callout kind="tip" title="Size changes everything">
            <Md>{md`Different forces grow with different powers of $L$: viscous and surface-tension forces $\propto L$, inertia and pressure $\propto L^2$, gravity $\propto L^3$. Shrink an object and viscosity and surface tension take over; enlarge it and gravity and inertia rule. That's why a water strider walks on water but you can't.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F255}>
          <Figure caption="Order-of-magnitude force estimates on a fluid element of size L, each compared with the inertia force ρV²L²." src={F255}>
            <ForceCubeFigure />
          </Figure>
        </Step>

        <Step kind="equations" src={[F255, F247]}>
          <FormulaCard id="inertia-force" />
          <Derivation
            title="Why ρV²L² is the only inertia scale (Fox p. 255)"
            steps={[
              { md: md`Newton's second law: $F = ma$, so $[F] = MLt^{-2}$.`, why: 'dimensions of any force' },
              { md: md`Among $\rho$ ($ML^{-3}$), $V$ ($Lt^{-1}$), $L$ ($L$), only $\rho$ contains $M$ → $\rho^1$.`, why: 'match mass' },
              { md: md`Only $V$ contains time → $V^2$ gives $t^{-2}$.`, why: 'match time' },
              { md: md`$\rho V^2 = ML^{-1}t^{-2}$; multiplying by $L^2$ leaves $MLt^{-2}$ ⇒ $F_{\text{inertia}} \propto \rho V^2L^2$.`, why: 'match length' },
            ]}
          />
          <FormulaCard id="force-estimates" />
          <FormulaCard id="force-ratios" />
          <Callout kind="note" title="Names go to the inverses">
            <Md>{md`These ratios appear so often that slightly modified versions — **usually the inverse** — were given names: $\rho VL/\mu$ is the Reynolds number, $V^2/gL$ the square of the Froude number, $\rho V^2L/\sigma$ the Weber number, $\rho V^2/E_v$ the square of the Mach number. The pressure ratio keeps its orientation but gains a ½ (Euler number).`}</Md>
          </Callout>
          <FormulaCard id="by-inspection" />
          <Callout kind="def" title="One group ⇒ constant (Fox p. 255)">
            <Md>{md`If the procedure gives $n - m = 1$, i.e. a **single** Π, then the Buckingham Pi theorem says that Π must be a **constant** — only its value is left to experiment.`}</Md>
          </Callout>
          <Supplement title="The same ratios inside the equations of motion (Fox p. 247)">
            <Md>{md`When the Navier–Stokes equations are nondimensionalized with $\rho V_\infty^2/L$ (Fox Eqs. 7.9–7.10), the viscous terms are multiplied by $\mu/(\rho V_\infty L) = 1/\Rey$ and the gravity term by $gL/V_\infty^2 = 1/\Fr^2$. So the force ratios are not just estimates — they are the actual coefficients of the governing equations.`}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-force-budget" />
          <ExampleCard id="ex-by-inspection" />
        </Step>

        <Step kind="interactive">
          <ForceScaling />
        </Step>

        <Step kind="practice">
          <PracticeList concept="force-ratios" />
          <QuickCheck ids={['q-inertia', 'q-size-scaling']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Inertia force $\sim \rho V^2L^2$ — the unique force built from $\rho$, $V$, $L$.`,
              md`Five competitors ÷ inertia: $\mu/\rho VL$, $\Delta p/\rho V^2$, $gL/V^2$, $\sigma/\rho V^2L$, $E_v/\rho V^2$.`,
              md`Named groups are usually the **inverses**: Re, Fr², We, Ma².`,
              md`Forces scale differently with $L$ ($L$, $L^2$, $L^3$) — the reason small and large flows behave differently.`,
              md`Trap: $\rho V^2$ is a stress, $\rho V^2L^2$ a force — don't mix them when forming groups by inspection.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== common-groups */}
      <Concept id="common-groups">
        <Step kind="intro" src={[F255, F256, F257, L21, F268]}>
          <Md>{md`Fox §7.4 names six groups — **Reynolds, Euler, cavitation, Froude, Weber and Mach** (Eqs. 7.11–7.16) — and his §7.6 summary lists them as the chapter's "useful equations". Lecture 13 closes with a table of seven groups (slide 21): Reynolds, Froude, Euler, **Cauchy**, Mach, **Strouhal** and Weber, each with its force-ratio interpretation and the type of problem where it matters.

These groups are among the most commonly used in fluid mechanics: for any flow pattern they immediately indicate the relative importance of inertia, viscosity, pressure, gravity, surface tension and compressibility (Fox p. 257).`}</Md>
          <Md>{md`**Lecture 13, slide 21 — some common dimensionless groups**

| Group | Name | Interpretation (index of force ratio) | Types of applications |
|---|---|---|---|
| $\rho V\ell/\mu$ | Reynolds, Re | inertia / viscous | generally important in all types of fluid dynamics problems |
| $V/\sqrt{g\ell}$ | Froude, Fr | inertia / gravitational | flow with a free surface |
| $p/\rho V^2$ | Euler, Eu | pressure / inertia | problems where pressure or pressure differences are of interest |
| $\rho V^2/E_v$ | Cauchy, Ca | inertia / compressibility | flows where fluid compressibility is important |
| $V/c$ | Mach, Ma | inertia / compressibility | flows where fluid compressibility is important |
| $\omega\ell/V$ | Strouhal, St | inertia (local) / inertia (convective) | unsteady flow with a characteristic oscillation frequency or a rotating boundary |
| $\rho V^2\ell/\sigma$ | Weber, We | inertia / surface tension | problems in which surface tension is important |`}</Md>
          <Callout kind="note">
            <Md>{md`The slide marks the Cauchy and Mach numbers with a footnote "a" whose text is not shown in the PDF. The slide also does not define its symbols; standard meanings are used here ($\ell$ length, $E_v$ bulk modulus, $c$ speed of sound, $\omega$ frequency, $\sigma$ surface tension).`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of each group as a **dial** that answers one yes/no question about your flow:

- **Re** — "Is the fluid sticky at this scale?" Small: syrup-like, laminar, orderly. Large: inertia rules, turbulence, viscosity confined to thin layers.
- **Eu / $C_p$** — "How big are pressure changes compared with the dynamic pressure $\tfrac12\rho V^2$?" Stagnation point: $C_p = 1$.
- **Cavitation number** — "How much pressure margin is left before the liquid boils?" Small margin → vapour bubbles.
- **Fr** — "Can surface waves keep up with the flow?" Shallow-water waves move at $\sqrt{gy}$, so $\Fr = V/\sqrt{gy}$ compares the flow with the waves.
- **We** — "Can surface tension hold the interface together?"
- **Ma** — "Can sound (pressure signals) keep up with the flow?" — same idea as Fr, with sound waves.
- **St** — "Is the flow's own unsteadiness fast compared with the time to travel past the body?"`}</Md>
          <Compare
            items={[
              { title: 'Fr: free-surface waves', md: md`$\Fr = V/\sqrt{gy}$. $\Fr<1$: waves can travel upstream (subcritical). $\Fr>1$: they are swept downstream (supercritical).`, tone: 'cyan' },
              { title: 'Ma: sound waves', md: md`$\Ma = V/c$. $\Ma<1$: pressure signals run ahead. $\Ma>1$: shock waves and a Mach cone form.`, tone: 'amber' },
            ]}
          />
        </Step>

        <Step kind="visual">
          <Figure caption="Regime maps: where typical flows fall on the Re (pipe), Fr (channel) and Ma number lines. Markers are the worked examples of this topic.">
            <RegimeLines />
          </Figure>
          <WaveFront />
          <FormulaCard id="mach-wedge" />
        </Step>

        <Step kind="equations" src={[F255, F256, F257, F245, L21, F268]}>
          <Md>{md`#### Reynolds number — inertia ÷ viscous`}</Md>
          <FormulaCard id="re" />
          <FormulaCard id="re-pipe" />
          <Md>{md`Osborne Reynolds explored this group in the **1880s**, independently of dimensional analysis, while studying the transition from laminar to turbulent flow in a tube: $\rho\overline{V}D/\mu$ turned out to be the criterion for the flow regime. Later experiments showed Re is a key parameter for many other flows. Flows with "large" Re are generally **turbulent**; flows where inertia is "small" compared with viscous forces are characteristically **laminar**. Large Re also means viscous effects can be neglected in **most** of the flow (Fox p. 245) — but not inside the thin boundary layers.`}</Md>

          <Md>{md`#### Euler number — pressure ÷ inertia`}</Md>
          <FormulaCard id="eu" />
          <FormulaCard id="eu-lec13" />
          <Md>{md`Named after **Leonhard Euler**, the Swiss mathematician credited with first recognizing the role of pressure in fluid motion (the Euler equations of Chapter 6).`}</Md>
          <Callout kind="warning" title="Factor-of-two trap">
            <Md>{md`Fox: $\Eu = \Delta p/(\tfrac12\rho V^2)$. Lecture table: $\Eu = p/(\rho V^2)$. Same name, values differ by **2**. Write the definition you use next to your answer.`}</Md>
          </Callout>

          <Md>{md`#### Cavitation number — pressure margin above vapour pressure ÷ inertia`}</Md>
          <FormulaCard id="cav" />
          <FormulaCard id="cav-inception" />
          <Callout kind="exam" title="Same symbol, different group">
            <Md>{md`"Ca" in Fox (Eq. 7.13) = **cavitation** number $(p-p_v)/\tfrac12\rho V^2$. "Ca" in the Lecture 13 table = **Cauchy** number $\rho V^2/E_v$. Read the definition, not the symbol.`}</Md>
          </Callout>

          <Md>{md`#### Froude number — inertia ÷ gravity (squared)`}</Md>
          <FormulaCard id="fr" />
          <Md>{md`William Froude, a British naval architect, and his son Robert Edmund Froude found this parameter significant for flows with **free-surface effects**. It is $\Fr^2 = V^2/gL$, not $\Fr$, that equals the inertia/gravity ratio — the inverse of $gL/V^2$ from the force table. In open-channel flow ($L$ = depth), $\Fr<1$ is **subcritical** and $\Fr>1$ **supercritical** (Fox Ch. 11 treats this in depth).`}</Md>

          <Md>{md`#### Weber number — inertia ÷ surface tension`}</Md>
          <FormulaCard id="we" />

          <Md>{md`#### Mach and Cauchy numbers — inertia ÷ compressibility`}</Md>
          <FormulaCard id="ma" />
          <FormulaCard id="ma-compress" />
          <FormulaCard id="cauchy" />
          <Callout kind="key" title="Incompressibility rule">
            <Md>{md`A flow is essentially incompressible if $\Ma \lesssim 0.3$ (Fox p. 245). For truly incompressible flow $c = \infty$ and $\Ma = 0$ — but under some conditions even liquids are quite compressible (Fox p. 257).`}</Md>
          </Callout>

          <Md>{md`#### Strouhal number — local ÷ convective inertia`}</Md>
          <FormulaCard id="strouhal" />

          <Md>{md`#### Fox §7.6 summary ("Useful Equations", pp. 268–269)

| Name (force ratio) | Equation | Eq. | Page |
|---|---|---|---|
| Reynolds (inertia to viscous) | $\Rey = \rho VL/\mu = VL/\nu$ | 7.11 | 255 |
| Euler (pressure to inertia) | $\Eu = \Delta p/\tfrac12\rho V^2$ | 7.12 | 256 |
| Cavitation number | $\mathrm{Ca} = (p-p_v)/\tfrac12\rho V^2$ | 7.13 | 256 |
| Froude (inertia to gravity) | $\Fr = V/\sqrt{gL}$ | 7.14 | 256 |
| Weber (inertia to surface tension) | $\We = \rho V^2L/\sigma$ | 7.15 | 256 |
| Mach (inertia to compressibility) | $M = V/c$ | 7.16 | 256 |

The chapter summary lists "defined important dimensionless groups (Reynolds, Euler, cavitation, Froude, Weber and Mach numbers) and discussed their physical significance" as one of its outcomes, and warns that most tabulated equations carry constraints — check the cited pages.`}</Md>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-re-pipe" />
          <ExampleCard id="ex-froude" />
          <ExampleCard id="ex-cavitation" />
          <ExampleCard id="ex-weber" />
          <ExampleCard id="ex-mach" />
          <ExampleCard id="ex-strouhal" />
        </Step>

        <Step kind="interactive">
          <GroupDashboard />
          <GroupMatcher />
        </Step>

        <Step kind="practice">
          <PracticeList concept="common-groups" />
          <QuickCheck ids={['q-ca-clash', 'q-froude-channel']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Re (7.11) inertia/viscous · Eu = $C_p$ (7.12) pressure/inertia · Ca (7.13) cavitation · Fr (7.14) inertia/gravity · We (7.15) inertia/surface tension · Ma (7.16) inertia/compressibility.`,
              md`Regime rules from the book: large Re → turbulent; $\Fr \lessgtr 1$ → sub/supercritical; $\Ma < 0.3$ → incompressible; smaller cavitation number → cavitation more likely.`,
              md`Lecture extras: Cauchy $\rho V^2/E_v = \Ma^2$ and Strouhal $\omega\ell/V$ (local/convective inertia).`,
              md`Fr and Ma are force ratios only when squared; Eu differs by a factor 2 between Fox and the lecture.`,
              md`Always state the characteristic $L$ and $V$: diameter and mean velocity for pipes, depth for channels, hull length for ships.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
