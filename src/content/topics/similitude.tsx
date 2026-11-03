/**
 * Topic C4 — Flow Similarity & Model Studies.
 * Source: Fox & McDonald §7.5 (printed pp. 257–268) and the §7.6 summary (pp. 268–269). No lecture slides cover
 * similitude, so Fox is the only primary source. Subscripts: m = model, p = prototype; 1, 2 = two operating conditions.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, md, Plot, PracticeList, QuickCheck,
  Step, Supplement, Takeaways,
} from '@/kit'
import { DistortedRiverFigure, PumpCurvesFigure, SimilarityLadder, SonarSketch, TunnelSchematic } from '../sims/similitude/figures'
import { ModelMatcher } from '../sims/similitude/ModelMatcher'
import { ShipResistance } from '../sims/similitude/ShipResistance'
import { FroudeReynolds } from '../sims/similitude/FroudeReynolds'
import { BusPlateau } from '../sims/similitude/BusPlateau'
import { SmokeStreak } from '../sims/similitude/SmokeStreak'
import { PumpLaws } from '../sims/similitude/PumpLaws'
import { TunnelLab } from '../sims/similitude/TunnelLab'
import { EX75_POINTS, NU_LADDER } from '../sims/similitude/data'

const F245: Src = { doc: 'fox', pages: '245' }
const F256: Src = { doc: 'fox', pages: '256' }
const F257: Src = { doc: 'fox', pages: '257' }
const F258: Src = { doc: 'fox', pages: '258' }
const F259: Src = { doc: 'fox', pages: '259' }
const F260: Src = { doc: 'fox', pages: '260' }
const F261: Src = { doc: 'fox', pages: '261' }
const F262: Src = { doc: 'fox', pages: '262' }
const F263: Src = { doc: 'fox', pages: '263' }
const F264: Src = { doc: 'fox', pages: '264' }
const F265: Src = { doc: 'fox', pages: '265' }
const F266: Src = { doc: 'fox', pages: '266' }
const F267: Src = { doc: 'fox', pages: '267' }
const F268: Src = { doc: 'fox', pages: '268' }
const F269: Src = { doc: 'fox', pages: '269' }

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'similitude',
  unit: 'C',
  title: 'Flow Similarity & Model Studies',
  subtitle:
    'How a small model in a tunnel or towing tank predicts the forces on a ship, a bus or a pump — and what to do when not every Π group can be matched.',
  minutes: 110,
  sources: [{ doc: 'fox', pages: '257–269' }],
  concepts: [
    {
      id: 'similarity-types',
      title: 'Geometric, kinematic & dynamic similarity',
      src: { doc: 'fox', pages: '257–259' },
      summary: 'Match every independent Π group in a geometrically similar model and the dependent Π group (e.g. F/ρV²D²) matches too.',
    },
    {
      id: 'incomplete-similarity',
      title: 'Incomplete similarity: ships, rivers, vehicles',
      src: { doc: 'fox', pages: '259–264' },
      summary: 'When Re and Fr cannot both be matched: split ship resistance, distort river models, exploit Re-independent bluff-body drag.',
    },
    {
      id: 'pump-scaling',
      title: 'Scaling with multiple dependent parameters: pumps & fans',
      src: { doc: 'fox', pages: '264–267' },
      summary: 'Head and power coefficients vs flow coefficient give the pump/fan "laws" Q ∝ ωD³, h ∝ ω²D², P ∝ ρω³D⁵ and the specific speed.',
    },
    {
      id: 'model-testing',
      title: 'Comments on model testing & special facilities',
      src: { doc: 'fox', pages: '267–268' },
      summary: 'Accurate models, aligned balances, non-interfering mounts and documented tunnel flow quality; national facilities for very high Re.',
    },
  ],
  sourceNote: md`**Primary source: Fox & McDonald §7.5 (pp. 257–268) and the §7.6 summary (pp. 268–269).** No lecture slides cover similitude. Two printing slips are flagged where they occur: Example 7.4 prints the model speed as "157 ft/s" although its own SI arithmetic gives 47.2 m/s, and the Fig. 7.2/7.3 captions say "Navel" for *Naval*. The definitions of Re, Eu, Ca, Fr, We and M (Eqs. 7.11–7.16) are treated in the dimensionless-groups topic.`,
}

/* ------------------------------------------------------------------------------------------------ formulas */

export const formulas: FormulaDef[] = [
  {
    id: 'sphere-drag-function',
    name: 'Sphere drag: dimensional statement',
    tex: md`F = f(D,\ V,\ \rho,\ \mu)`,
    vars: [
      { sym: md`F`, desc: 'drag force on the sphere', units: md`\mathrm{N}` },
      { sym: md`D`, desc: 'sphere diameter', units: md`\mathrm{m}` },
      { sym: md`V`, desc: 'free-stream speed', units: md`\mathrm{m/s}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{N\cdot s/m^2}` },
      { sym: md`f`, desc: 'unknown function (found by experiment)' },
    ],
    conditions: ['smooth sphere, steady free stream', 'no compressibility, cavitation or free-surface effects (otherwise more variables enter)'],
    use: md`The starting list of physical variables for the Buckingham Pi theorem: $n = 5$ variables, $r = 3$ dimensions → $2$ Π groups.`,
    src: { ...F258, note: 'from Example 7.1' },
  },
  {
    id: 'sphere-drag-pi',
    name: 'Sphere drag in dimensionless form',
    tex: md`\frac{F}{\rho V^2D^2} = f_1\!\left(\frac{\rho VD}{\mu}\right)`,
    vars: [
      { sym: md`F/\rho V^2D^2`, desc: 'dependent Π group (dimensionless force)' },
      { sym: md`\rho VD/\mu`, desc: 'independent Π group — the Reynolds number $Re$' },
      { sym: md`f_1`, desc: 'one universal function for all geometrically similar spheres' },
    ],
    conditions: ['geometric similarity (including relative roughness)', 'same flow regime in model and prototype'],
    use: md`Because only one independent group exists, fixing $Re$ fixes the dimensionless force. This is the logic of every Reynolds-matched model test.`,
    src: F258,
  },
  {
    id: 're-matching',
    name: 'Dynamic-similarity condition (Reynolds matching)',
    key: true,
    tex: md`\left(\frac{\rho VD}{\mu}\right)_{\text{model}} = \left(\frac{\rho VD}{\mu}\right)_{\text{prototype}} \iff Re_m = Re_p`,
    vars: [
      { sym: md`\rho,\ \mu`, desc: 'density and viscosity of the fluid used in each test (they may differ)', units: md`\mathrm{kg/m^3},\ \mathrm{N\cdot s/m^2}` },
      { sym: md`V`, desc: 'flow speed in each test', units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'corresponding length (diameter)', units: md`\mathrm{m}` },
      { sym: md`\nu = \mu/\rho`, desc: 'kinematic viscosity; $Re = VD/\nu$', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'geometrically similar model and prototype',
      '$Re$ is the **only** independent Π group (no free surface, compressibility or cavitation)',
      'model and prototype fluids may differ — only the value of $Re$ must agree',
    ],
    use: md`Solve for the required model speed: $V_m = V_p \dfrac{D_p}{D_m}\dfrac{\nu_m}{\nu_p}$. Then check that the model flow stays in the prototype's regime (e.g. $M \lesssim 0.3$ in a gas).`,
    src: F258,
  },
  {
    id: 'force-scaling',
    name: 'Scaling the measured force to the prototype',
    key: true,
    tex: md`\left.\frac{F}{\rho V^2D^2}\right)_m = \left.\frac{F}{\rho V^2D^2}\right)_p \;\Rightarrow\; F_p = F_m\,\frac{\rho_p}{\rho_m}\,\frac{V_p^2}{V_m^2}\,\frac{D_p^2}{D_m^2}`,
    vars: [
      { sym: md`F_m,\ F_p`, desc: 'model (measured) and prototype (predicted) force', units: md`\mathrm{N}` },
      { sym: md`\rho_m,\ \rho_p`, desc: 'model and prototype fluid densities', units: md`\mathrm{kg/m^3}` },
      { sym: md`V_m,\ V_p`, desc: 'model and prototype speeds', units: md`\mathrm{m/s}` },
      { sym: md`D_m,\ D_p`, desc: 'model and prototype lengths', units: md`\mathrm{m}` },
    ],
    conditions: ['valid **only** at dynamically similar conditions (all independent Π groups matched)'],
    use: md`The forces themselves are **not** equal — only the dimensionless force is. With $Re$ matched, this is equivalent to $F_p/F_m = (\rho_p\nu_p^2)/(\rho_m\nu_m^2)$.`,
    src: [F258, { ...F259, note: 'Example 7.4' }],
  },
  {
    id: 'mach-number',
    name: 'Mach number (compressibility check)',
    tag: '7.16',
    tex: md`M = \frac{V}{c} = \frac{V}{\sqrt{dp/d\rho}} = \frac{V}{\sqrt{E_v/\rho}}, \qquad M^2 = \frac{\rho V^2}{E_v}`,
    vars: [
      { sym: md`V`, desc: 'flow speed', units: md`\mathrm{m/s}` },
      { sym: md`c`, desc: 'local speed of sound (≈ 340 m/s in air at room temperature)', units: md`\mathrm{m/s}` },
      { sym: md`E_v`, desc: 'bulk modulus of the fluid', units: md`\mathrm{Pa}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: ['$M^2$ = inertia force / compressibility force', md`truly incompressible flow: $c = \infty$, $M = 0$`, md`flow is essentially incompressible for $M \lesssim 0.3$ (Fox p.245)`],
    use: md`Whenever a Reynolds-matched model is run in air at high speed, compute $M$: if compressibility appears in the model but not in the prototype, the flows are no longer kinematically similar.`,
    src: [{ ...F256, note: 'Eq. (7.16)' }, F257, F245],
  },
  {
    id: 'fr-matching',
    name: 'Froude matching fixes the speed ratio',
    key: true,
    tex: md`Fr_m = \frac{V_m}{(gL_m)^{1/2}} = Fr_p = \frac{V_p}{(gL_p)^{1/2}} \;\Rightarrow\; \frac{V_m}{V_p} = \left(\frac{L_m}{L_p}\right)^{1/2}`,
    vars: [
      { sym: md`Fr`, desc: 'Froude number (inertia / gravity)' },
      { sym: md`V`, desc: 'ship or model speed', units: md`\mathrm{m/s}` },
      { sym: md`g`, desc: 'gravitational acceleration — the same for model and prototype, so it cancels', units: md`\mathrm{m/s^2}` },
      { sym: md`L`, desc: 'characteristic length (ship length)', units: md`\mathrm{m}` },
    ],
    conditions: ['free-surface flows in which gravity waves matter (ships, rivers, harbours)', 'model tested on Earth (same $g$)'],
    use: md`Gives dynamically similar **wave patterns**. A 1:100 model must run at $1/10$ of the ship speed.`,
    src: F260,
  },
  {
    id: 'nu-ratio',
    name: 'Viscosity needed to match Re as well as Fr',
    key: true,
    tex: md`\frac{\nu_m}{\nu_p} = \frac{V_m}{V_p}\,\frac{L_m}{L_p} = \left(\frac{L_m}{L_p}\right)^{1/2}\frac{L_m}{L_p} = \left(\frac{L_m}{L_p}\right)^{3/2}`,
    vars: [
      { sym: md`\nu_m,\ \nu_p`, desc: 'kinematic viscosities of model and prototype fluids', units: md`\mathrm{m^2/s}` },
      { sym: md`L_m/L_p`, desc: 'length scale of the model' },
      { sym: md`V_m/V_p`, desc: 'speed ratio already fixed by Froude matching' },
    ],
    conditions: ['Fr matched first (fixes $V_m/V_p$)', 'then $Re_m = Re_p$ is demanded too'],
    use: md`For $L_m/L_p = 1/100$ this demands $\nu_m/\nu_p = 1/1000$ — no practical liquid exists (mercury is only about one order of magnitude below water). Same-fluid models therefore run at $Re_m/Re_p = (L_m/L_p)^{3/2}$.`,
    src: F260,
  },
  {
    id: 'ship-resistance-split',
    name: 'Ship resistance = wave part (Fr) + viscous part (Re)',
    tex: md`C_{T}(Fr, Re) = C_{\text{wave}}(Fr) + C_{\text{visc}}(Re), \qquad C_{T,p} = C_{T,m} - C_{\text{visc},m}(Re_m) + C_{\text{visc},p}(Re_p)\;[+\ \text{roughness correction}]`,
    vars: [
      { sym: md`C_T`, desc: 'total resistance coefficient (measured on the model)' },
      { sym: md`C_{\text{wave}}`, desc: 'surface-wave resistance coefficient — a function of $Fr$ only, identical for model and ship' },
      { sym: md`C_{\text{visc}}`, desc: 'viscous (skin-friction) coefficient from boundary-layer theory, evaluated at each $Re$' },
      { sym: md`Re_m,\ Re_p`, desc: 'model and prototype Reynolds numbers' },
    ],
    conditions: ['model and ship at the **same Froude number**', 'model boundary layer tripped to turbulence where it is on the ship', 'accuracy of the overall method ≈ ±5 % (Fox ref. [5])'],
    use: md`The book states this procedure in words; the symbols are added here. Subtract theoretical model friction from the measured total, keep the wave part, add theoretical full-scale friction.`,
    src: { ...F261, note: 'procedure stated in words; symbols added' },
  },
  {
    id: 'bus-cd-re',
    name: 'Drag coefficient and Reynolds number (Example 7.5)',
    key: true,
    tex: md`C_D = \frac{F_D}{\tfrac12\rho V^2A}, \qquad Re = \frac{\rho V w}{\mu} = \frac{V w}{\nu}`,
    vars: [
      { sym: md`C_D`, desc: 'drag coefficient (dependent Π group)' },
      { sym: md`F_D`, desc: 'aerodynamic drag force', units: md`\mathrm{N}` },
      { sym: md`\rho`, desc: 'air density (1.23 kg/m³ for standard air)', units: md`\mathrm{kg/m^3}` },
      { sym: md`V`, desc: 'air speed', units: md`\mathrm{m/s}` },
      { sym: md`A`, desc: 'frontal area', units: md`\mathrm{m^2}` },
      { sym: md`w`, desc: 'vehicle width — the length used in $Re$', units: md`\mathrm{m}` },
      { sym: md`\mu,\ \nu`, desc: md`dynamic and kinematic viscosity ($\nu = 1.46\times10^{-5}$ m²/s for standard air)`, units: md`\mathrm{N\cdot s/m^2},\ \mathrm{m^2/s}` },
    ],
    conditions: ['bluff body: above a threshold $Re$, $C_D$ becomes independent of $Re$', md`SAE recommends $Re \ge 2\times10^6$ for truck and bus testing`],
    use: md`Plot $C_D$ against $Re$ for the model runs; once $C_D$ is flat, the plateau value applies to the prototype if its $Re$ is also above the threshold.`,
    src: [F263, F264],
  },
  {
    id: 'drag-power',
    name: 'Power to overcome aerodynamic drag',
    tex: md`\mathcal{P} = F_D\,V = \tfrac12\,C_D\,\rho\,A\,V^3`,
    vars: [
      { sym: md`\mathcal{P}`, desc: 'power absorbed by drag', units: md`\mathrm{W}` },
      { sym: md`F_D`, desc: 'drag force', units: md`\mathrm{N}` },
      { sym: md`V`, desc: 'vehicle speed', units: md`\mathrm{m/s}` },
    ],
    conditions: ['steady speed in still air', 'second form assumes constant $C_D$ (plateau region)'],
    use: md`Power grows with the **cube** of speed: +10 % speed costs ≈ +33 % power.`,
    src: { ...F264, note: 'first form printed; cubic form added here' },
  },
  {
    id: 'distorted-froude',
    name: 'Distorted (two-scale) river model with Froude scaling',
    tex: md`\frac{V_m}{V_p} = \left(\frac{y_m}{y_p}\right)^{1/2}, \qquad \frac{Q_m}{Q_p} = \frac{V_m}{V_p}\,\frac{x_m}{x_p}\,\frac{y_m}{y_p}, \qquad \frac{t_m}{t_p} = \frac{x_m/x_p}{V_m/V_p}`,
    vars: [
      { sym: md`x_m/x_p`, desc: 'horizontal length scale (e.g. 1:1000)' },
      { sym: md`y_m/y_p`, desc: 'vertical (depth) scale (e.g. 1:100)' },
      { sym: md`V,\ Q,\ t`, desc: 'velocity, discharge and time', units: md`\mathrm{m/s},\ \mathrm{m^3/s},\ \mathrm{s}` },
    ],
    conditions: ['Froude number based on depth is matched', 'artificial roughness is added to restore the correct friction'],
    use: md`Supplementary scaling rules for the river/harbour models described qualitatively on Fox p.262 (e.g. the San Francisco Bay model, 1:1000 horizontal, 1:100 vertical).`,
  },
  {
    id: 'pump-efficiency',
    name: 'Pump efficiency and power delivered to the fluid',
    tex: md`\eta = \frac{\mathcal{P}}{\mathcal{P}_{\text{in}}}, \qquad \mathcal{P} = \rho Q h = \rho g Q H`,
    vars: [
      { sym: md`\eta`, desc: 'pump efficiency' },
      { sym: md`\mathcal{P}`, desc: 'power delivered to the fluid', units: md`\mathrm{W}` },
      { sym: md`\mathcal{P}_{\text{in}}`, desc: 'input (shaft) power', units: md`\mathrm{W}` },
      { sym: md`Q`, desc: 'volume flow rate', units: md`\mathrm{m^3/s}` },
      { sym: md`h`, desc: 'head as energy per unit mass', units: md`\mathrm{J/kg = m^2/s^2}` },
      { sym: md`H`, desc: 'head as energy per unit weight ($h = gH$)', units: md`\mathrm{m}` },
    ],
    conditions: ['incompressible flow (energy equation of Chapter 8)'],
    use: md`Convert $Q$ to m³/s before multiplying! Then $\mathcal{P}_{\text{in}} = \mathcal{P}/\eta$ sizes the motor.`,
    src: { ...F264, note: 'footnote 3' },
  },
  {
    id: 'pump-functional',
    name: 'Pump head and power: dimensional statement',
    tex: md`h = g_1(Q,\ \rho,\ \omega,\ D,\ \mu), \qquad \mathcal{P} = g_2(Q,\ \rho,\ \omega,\ D,\ \mu)`,
    vars: [
      { sym: md`h`, desc: 'head (energy per unit mass)', units: md`\mathrm{m^2/s^2}` },
      { sym: md`\mathcal{P}`, desc: 'power', units: md`\mathrm{W}` },
      { sym: md`Q`, desc: 'volume flow rate', units: md`\mathrm{m^3/s}` },
      { sym: md`\omega`, desc: 'impeller angular speed', units: md`\mathrm{rad/s}` },
      { sym: md`D`, desc: 'impeller diameter', units: md`\mathrm{m}` },
      { sym: md`\rho,\ \mu`, desc: 'fluid density and viscosity', units: md`\mathrm{kg/m^3},\ \mathrm{N\cdot s/m^2}` },
    ],
    conditions: ['two **dependent** parameters → one Π analysis (one dependent group) for each', md`$n = 6$, $r = 3$ → 3 Π groups per relation (repeating variables $\rho, \omega, D$)`],
    use: md`The independent variables are the flow rate, speed, size and fluid properties; head, power and efficiency are the dependent performance quantities.`,
    src: F265,
  },
  {
    id: 'head-coefficient',
    name: 'Head coefficient',
    tag: '7.17',
    key: true,
    tex: md`\frac{h}{\omega^2D^2} = f_1\!\left(\frac{Q}{\omega D^3},\ \frac{\rho\omega D^2}{\mu}\right)`,
    vars: [
      { sym: md`h/\omega^2D^2`, desc: 'head coefficient' },
      { sym: md`Q/\omega D^3`, desc: '**flow coefficient**' },
      { sym: md`\rho\omega D^2/\mu`, desc: md`a form of the Reynolds number ($\omega D \propto$ tip speed)` },
    ],
    conditions: ['geometrically similar machines', 'incompressible flow'],
    use: md`At fixed flow coefficient (and negligible viscous effects) the head coefficient is fixed — this yields Eq. (7.20).`,
    src: F265,
  },
  {
    id: 'power-coefficient',
    name: 'Power coefficient',
    tag: '7.18',
    key: true,
    tex: md`\frac{\mathcal{P}}{\rho\omega^3D^5} = f_2\!\left(\frac{Q}{\omega D^3},\ \frac{\rho\omega D^2}{\mu}\right)`,
    vars: [
      { sym: md`\mathcal{P}/\rho\omega^3D^5`, desc: 'power coefficient' },
      { sym: md`\mathcal{P}`, desc: 'power', units: md`\mathrm{W}` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: ['geometrically similar machines', 'incompressible flow'],
    use: md`At fixed flow coefficient the power coefficient is fixed — this yields Eq. (7.21).`,
    src: F265,
  },
  {
    id: 'pump-law-flow',
    name: 'Pump law 1 — similar flow conditions',
    tag: '7.19',
    key: true,
    tex: md`\frac{Q_1}{\omega_1D_1^3} = \frac{Q_2}{\omega_2D_2^3}`,
    vars: [
      { sym: md`Q_1,\ Q_2`, desc: 'flow rates at conditions 1 and 2 (any consistent unit, e.g. m³/h)', units: md`\mathrm{m^3/s}` },
      { sym: md`\omega_1,\ \omega_2`, desc: 'speeds (rpm is fine — only ratios appear)', units: md`\mathrm{rad/s}` },
      { sym: md`D_1,\ D_2`, desc: 'impeller diameters', units: md`\mathrm{m}` },
    ],
    conditions: ['1 and 2 = two conditions of one machine, or two geometrically similar machines', 'viscous (Re) effects negligible'],
    use: md`Defines "similar" (equivalent) operating points: $Q_2 = Q_1(\omega_2/\omega_1)(D_2/D_1)^3$.`,
    src: F265,
  },
  {
    id: 'pump-law-head',
    name: 'Pump law 2 — head',
    tag: '7.20',
    key: true,
    tex: md`\frac{h_1}{\omega_1^2D_1^2} = \frac{h_2}{\omega_2^2D_2^2}`,
    vars: [
      { sym: md`h_1,\ h_2`, desc: 'head per unit mass (the same ratio holds for $H$ in m, since $h = gH$)', units: md`\mathrm{m^2/s^2}` },
      { sym: md`\omega,\ D`, desc: 'speed and diameter', units: md`\mathrm{rad/s},\ \mathrm{m}` },
    ],
    conditions: ['valid only between points that satisfy Eq. (7.19)', 'Re effects negligible'],
    use: md`$H_2 = H_1(\omega_2/\omega_1)^2(D_2/D_1)^2$.`,
    src: F265,
  },
  {
    id: 'pump-law-power',
    name: 'Pump law 3 — power',
    tag: '7.21',
    key: true,
    tex: md`\frac{\mathcal{P}_1}{\rho_1\omega_1^3D_1^5} = \frac{\mathcal{P}_2}{\rho_2\omega_2^3D_2^5}`,
    vars: [
      { sym: md`\mathcal{P}_1,\ \mathcal{P}_2`, desc: 'power at the two conditions', units: md`\mathrm{W}` },
      { sym: md`\rho_1,\ \rho_2`, desc: 'fluid densities', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: ['valid only between points that satisfy Eq. (7.19)', 'Re effects negligible'],
    use: md`$\mathcal{P}_2 = \mathcal{P}_1(\rho_2/\rho_1)(\omega_2/\omega_1)^3(D_2/D_1)^5$ — the steepest of the three laws.`,
    src: F265,
  },
  {
    id: 'pump-laws-solved',
    name: 'Pump/fan "laws" in solved (scaling) form',
    tex: md`Q_2 = Q_1\frac{\omega_2}{\omega_1}\left(\frac{D_2}{D_1}\right)^3,\quad H_2 = H_1\left(\frac{\omega_2}{\omega_1}\right)^2\left(\frac{D_2}{D_1}\right)^2,\quad \mathcal{P}_2 = \mathcal{P}_1\frac{\rho_2}{\rho_1}\left(\frac{\omega_2}{\omega_1}\right)^3\left(\frac{D_2}{D_1}\right)^5`,
    vars: [
      { sym: md`1,\ 2`, desc: 'known and new condition' },
      { sym: md`H`, desc: 'head per unit weight', units: md`\mathrm{m}` },
    ],
    conditions: ['geometrically similar machines at similar flow conditions', 'efficiency taken as unchanged between similar points'],
    use: md`Industry uses these to scale a whole family of machines from one measured performance curve and to pick drive speed and motor power.`,
    src: [F266, { ...F267, note: 'as used in Example 7.6' }],
  },
  {
    id: 'specific-speed',
    name: 'Specific speed (dimensionless)',
    tag: '7.22a',
    key: true,
    tex: md`N_s = \frac{\Pi_1^{1/2}}{\Pi_2^{3/4}} = \frac{\omega Q^{1/2}}{h^{3/4}}, \qquad \Pi_1 = \frac{Q}{\omega D^3},\ \ \Pi_2 = \frac{h}{\omega^2D^2}`,
    vars: [
      { sym: md`N_s`, desc: 'specific speed (dimensionless)' },
      { sym: md`\omega`, desc: 'angular speed', units: md`\mathrm{rad/s}` },
      { sym: md`Q`, desc: 'volume flow rate', units: md`\mathrm{m^3/s}` },
      { sym: md`h`, desc: 'head as energy per **unit mass**', units: md`\mathrm{J/kg}` },
    ],
    conditions: ['dimensionless only if $h$ is energy per unit mass and consistent SI units are used', 'normally evaluated at the design (best-efficiency) point'],
    use: md`Eliminates $D$; one value of $N_s$ describes all similar operating conditions of a family of geometrically similar machines. Read it as the speed needed for unit head at unit flow.`,
    src: F266,
  },
  {
    id: 'specific-speed-cu',
    name: 'Specific speed in customary units',
    tag: '7.22b',
    tex: md`N_{s_{cu}} = \frac{\omega\,Q^{1/2}}{H^{3/4}} \qquad (\omega\ \text{in rpm},\ Q\ \text{in m}^3/\text{h},\ H\ \text{in m})`,
    vars: [
      { sym: md`N_{s_{cu}}`, desc: '"customary-unit" specific speed — **not** unitless; its value depends on the units chosen' },
      { sym: md`\omega`, desc: 'speed', units: md`\mathrm{rpm}` },
      { sym: md`Q`, desc: 'flow rate', units: md`\mathrm{m^3/h}` },
      { sym: md`H`, desc: 'head per unit weight', units: md`\mathrm{m}` },
    ],
    conditions: ['metric pump practice: rpm, m³/h, m', md`"low" specific speed $580 < N_{s_{cu}} < 4645$; "high" $11\,615 < N_{s_{cu}} < 17\,420$`],
    use: md`Classify pumps and find a missing design-point head: $H = (\omega Q^{1/2}/N_{s_{cu}})^{4/3}$. Conversion to Eq. (7.22a): $N_s \approx 3.15\times10^{-4}\,N_{s_{cu}}$ (with $g = 9.81$ m/s²; supplementary).`,
    src: F266,
  },
  {
    id: 'horizontal-buoyancy',
    name: 'Horizontal buoyancy from an axial pressure gradient',
    tex: md`F_{\text{buoy}} = -\frac{dp}{dx}\,\mathcal{V}`,
    vars: [
      { sym: md`F_{\text{buoy}}`, desc: 'spurious streamwise force on the model (positive = reads as extra drag)', units: md`\mathrm{N}` },
      { sym: md`dp/dx`, desc: 'static-pressure gradient along the test section', units: md`\mathrm{Pa/m}` },
      { sym: md`\mathcal{V}`, desc: 'model volume', units: md`\mathrm{m^3}` },
    ],
    conditions: ['gradient roughly uniform over the model length', 'supplementary — quantifies the warning on Fox p.267'],
    use: md`Growing wall boundary layers make the pressure fall downstream ($dp/dx < 0$), which pushes the model downstream and inflates the drag reading. Remove the gradient (suction/blowing) or subtract this correction.`,
  },
  {
    id: 'balance-misalignment',
    name: 'Lift leaking into a misaligned drag balance',
    tex: md`D_{\text{read}} = D\cos\varepsilon + L\sin\varepsilon \approx D + L\,\varepsilon`,
    vars: [
      { sym: md`D,\ L`, desc: 'true drag and lift', units: md`\mathrm{N}` },
      { sym: md`\varepsilon`, desc: 'misalignment angle of the balance axes', units: md`\mathrm{rad}` },
      { sym: md`D_{\text{read}}`, desc: 'force the "drag" channel reports', units: md`\mathrm{N}` },
    ],
    conditions: [md`small angle: $\sin\varepsilon \approx \varepsilon$ (radians)`, 'supplementary — quantifies "balances must be carefully aligned"'],
    use: md`For high-lift, low-drag models even a fraction of a degree matters: the error is $L\varepsilon/D$.`,
  },
]

/* ------------------------------------------------------------------------------------------------ examples */

const ex75Table = EX75_POINTS.map(([re, cd], i) => `| ${[18.0, 21.8, 26.0, 30.1, 35.0, 38.5, 40.9, 44.1, 46.7][i].toFixed(1)} | ${[3.1, 4.41, 6.09, 7.97, 10.7, 12.9, 14.7, 16.9, 18.9][i]} | ${(re / 1e5).toFixed(2)} | ${cd.toFixed(3)} |`).join('\n')

export const examples: ExampleDef[] = [
  {
    id: 'ex74-sonar',
    concept: 'similarity-types',
    title: 'Example 7.4 — Drag of a sonar transducer from a wind-tunnel test',
    src: [{ ...F258, note: 'Example 7.4' }, F259],
    difficulty: 2,
    given: md`Prototype: sphere, $D_p = 0.3$ m, towed at $V_p = 2.57$ m/s through seawater at 4.5 °C ($\rho = 1000$ kg/m³, $\nu = 1.57\times10^{-6}$ m²/s). Model: $D_m = 152$ mm, tested in air at STP ($\rho = 1.227$ kg/m³, $\nu = 1.46\times10^{-5}$ m²/s). Measured model drag at the test conditions $F_m = 2.7$ N.`,
    find: md`(a) The required air speed $V_m$; (b) the prototype drag $F_p$.`,
    assumptions: md`No cavitation in the prototype flow; no compressibility in the model flow; geometric similarity (same relative roughness).`,
    steps: [
      { title: 'Governing Π relation', md: md`With only $F, D, V, \rho, \mu$ involved, $\dfrac{F}{\rho V^2D^2} = f\!\left(\dfrac{\rho VD}{\mu}\right)$. Dynamic similarity therefore needs $Re_m = Re_p$.` },
      { title: 'Prototype Reynolds number', md: md`$$Re_p = \frac{V_pD_p}{\nu_p} = \frac{2.57 \times 0.3}{1.57\times10^{-6}} = 4.91\times10^5$$` },
      {
        title: 'Required wind-tunnel speed',
        md: md`$$V_m = Re_m\frac{\nu_m}{D_m} = 4.91\times10^5 \times \frac{1.46\times10^{-5}\ \text{m}^2/\text{s}}{0.152\ \text{m}} = 47.2\ \text{m/s}$$

        (The book's boxed answer is printed as "157 ft/s" — a leftover from the US-unit edition; its own SI arithmetic, and its next step, use 47.16 m/s ≈ 155 ft/s.)`,
      },
      { title: 'Compressibility check', md: md`The book notes this speed is low enough to neglect compressibility: $M = 47.2/340 \approx 0.14$ (well below ≈ 0.3).` },
      {
        title: 'Scale the force',
        md: md`Dynamic similarity ⇒ $\left.\dfrac{F}{\rho V^2D^2}\right)_m = \left.\dfrac{F}{\rho V^2D^2}\right)_p$, so

        $$F_p = F_m\frac{\rho_p}{\rho_m}\frac{V_p^2}{V_m^2}\frac{D_p^2}{D_m^2} = 2.7\ \text{N}\times\frac{1000}{1.227}\times\frac{(2.57)^2}{(47.16)^2}\times\frac{(0.3)^2}{(0.152)^2}$$

        $$F_p = 2.7 \times 815.0 \times 2.970\times10^{-3} \times 3.895 = 25.5\ \text{N}$$`,
      },
      {
        title: 'Caveat and cross-check',
        md: md`If cavitation were expected in the prototype (e.g. a probe run fast near the free surface), an air test could not give useful results. The book also remarks that this test "reinvented the wheel": smooth-sphere drag is well known — reading $C_D \approx 0.1$ from Fig. 7.1 at $Re = 4.91\times10^5$ gives $F_p = C_D\,\tfrac12\rho V_p^2\,\tfrac{\pi}{4}D_p^2 \approx 23.3$ N directly (the model result corresponds to $C_D \approx 0.109$).`,
      },
    ],
    answer: md`$V_m \approx 47.2$ m/s (Re matched at $4.91\times10^5$); $F_p \approx 25.5$ N.`,
    insight: 'Model and prototype feel very different forces (2.7 N vs 25.5 N) — only F/ρV²D² is the same.',
  },
  {
    id: 'ex-water-tunnel',
    concept: 'similarity-types',
    title: 'Same transducer, tested in a water tunnel instead',
    difficulty: 2,
    given: md`The prototype of Example 7.4 ($Re_p = 4.91\times10^5$, $F_p \approx 25.5$ N). Model $D_m = 0.152$ m in fresh water, $\rho = 1000$ kg/m³, $\nu \approx 1.0\times10^{-6}$ m²/s (round handbook value).`,
    find: md`The required water speed and the drag force the model should register.`,
    steps: [
      { title: 'Match Re', md: md`$V_m = Re_p\,\nu_m/D_m = 4.91\times10^5 \times 1.0\times10^{-6}/0.152 = 3.23$ m/s — a gentle, easily achieved water-tunnel speed.` },
      {
        title: 'Expected model force',
        md: md`$F_m = F_p\dfrac{\rho_m}{\rho_p}\dfrac{V_m^2}{V_p^2}\dfrac{D_m^2}{D_p^2} = 25.5 \times 1 \times \left(\dfrac{3.23}{2.57}\right)^2\left(\dfrac{0.152}{0.3}\right)^2 = 25.5 \times 1.580 \times 0.2567 = 10.3$ N.`,
      },
      {
        title: 'Shortcut',
        md: md`With $Re$ matched, $\dfrac{F}{\rho V^2D^2} = \dfrac{F}{\rho\nu^2Re^2}$, so $F \propto \rho\nu^2 = \mu^2/\rho$ at equal $Re$: $F_m/F_p = (1.0/1.57)^2 = 0.406$ → $F_m = 10.3$ N ✓.`,
      },
    ],
    answer: md`$V_m \approx 3.2$ m/s; the model would register $F_m \approx 10.3$ N.`,
    insight: 'At matched Re the force ratio depends only on the fluids (μ²/ρ), not on the size or speed separately.',
  },
  {
    id: 'ex75-bus',
    concept: 'incomplete-similarity',
    title: 'Example 7.5 — Aerodynamic drag on a bus (incomplete similarity)',
    src: [{ ...F263, note: 'Example 7.5' }, F264],
    difficulty: 2,
    given: md`Wind-tunnel data for a 1:16 model bus in standard air ($\rho = 1.23$ kg/m³, $\nu = 1.46\times10^{-5}$ m²/s):

    | Air speed (m/s) | 18.0 | 21.8 | 26.0 | 30.1 | 35.0 | 38.5 | 40.9 | 44.1 | 46.7 |
    |---|---|---|---|---|---|---|---|---|---|
    | Drag force (N) | 3.10 | 4.41 | 6.09 | 7.97 | 10.7 | 12.9 | 14.7 | 16.9 | 18.9 |

    Prototype width 2.44 m, frontal area 7.8 m².`,
    find: md`(a) $C_D = F_D/\tfrac12\rho V^2A$ versus $Re = \rho Vw/\mu$ ($w$ = model width) and plot it; (b) the speed above which $C_D$ is constant; (c) prototype drag and power at 100 km/h.`,
    steps: [
      { title: 'Model dimensions', md: md`$w_m = \tfrac{1}{16}\times2.44 = 0.152$ m; $\quad A_m = \left(\tfrac{1}{16}\right)^2\times7.8 = 0.0305$ m² (areas scale with the square of the length scale).` },
      { title: 'Working formula for C_D', md: md`$C_D = \dfrac{F_D}{\tfrac12\rho V^2A} = \dfrac{2F_D}{1.23 \times 0.0305\,V^2} = \dfrac{53.3\,F_D(\text{N})}{[V(\text{m/s})]^2}$` },
      { title: 'Working formula for Re', md: md`$Re = \dfrac{Vw}{\nu} = \dfrac{V \times 0.152}{1.46\times10^{-5}} = 1.04\times10^4\,V(\text{m/s})$` },
      {
        title: 'Evaluate every run (computed here; the book only plots them)',
        md: ['| V (m/s) | F_D (N) | Re_m (×10⁵) | C_D |', '|---|---|---|---|', ex75Table].join('\n'),
        fig: (
          <Plot
            x={{ label: 'Model Reynolds number $Re_m$ (×10⁵)', domain: [0, 5.2] }}
            y={{ label: 'Model drag coefficient $C_{D_m}$', domain: [0.4, 0.6] }}
            series={[
              { label: 'computed points', points: EX75_POINTS.map(([r, c]) => [r / 1e5, c]), kind: 'scatter', color: 'var(--plot-1)' },
              { label: 'plateau ≈ 0.46', fn: () => 0.46, range: [4, 5.2], color: 'var(--plot-4)', width: 2 },
            ]}
            height={220}
          />
        ),
      },
      { title: '(b) Plateau', md: md`$C_{D_m}$ levels off at **≈ 0.46 above $Re_m \approx 4\times10^5$**, i.e. above an air speed of about **40 m/s** ($4\times10^5/1.04\times10^4 = 38.5$ m/s).` },
      { title: 'Transfer to the prototype', md: md`Prototype: $Re_p \approx 4.5\times10^6$ (recomputing $27.78 \times 2.44/1.46\times10^{-5}$ gives $4.6\times10^6$) — far above the threshold, so $C_{D_p} \approx 0.46$ as well.` },
      {
        title: '(c) Drag and power at 100 km/h',
        md: md`$V_p = 100 \times 1000/3600 = 27.8$ m/s

        $$F_{D_p} = C_D\,\tfrac12\rho V_p^2A_p = \frac{0.46}{2}\times1.23\times(27.8)^2\times7.8 = 1.71\ \text{kN}$$

        $$\mathcal{P}_p = F_{D_p}V_p = 1.71\times10^3 \times 27.8 = 47.5\ \text{kW}$$

        (Exact arithmetic with $C_D = 0.46$ gives 1.70 kN and 47.3 kW — a rounding difference only.)`,
      },
      { title: 'Side note', md: md`Above some minimum $Re$ an object's $C_D$ usually becomes constant, so model and prototype $Re$ **need not be matched**. Even so, the SAE Recommended Practice [8] suggests $Re \ge 2\times10^6$ for truck and bus testing.` },
    ],
    answer: md`$C_D \approx 0.46$ (constant) above $Re_m \approx 4\times10^5$ (≈ 40 m/s); prototype at 100 km/h: $F_D \approx 1.71$ kN, $\mathcal{P} \approx 47.5$ kW.`,
    insight: 'Incomplete similarity is rescued by a plateau: once C_D stops depending on Re, matching Re is unnecessary.',
  },
  {
    id: 'ex-ship-froude',
    concept: 'incomplete-similarity',
    title: 'Froude-scaling a ship model — and how far Re falls short',
    difficulty: 1,
    given: md`A ship $L_p = 120$ m long sails at $V_p = 10$ m/s. A 1:80 model is towed in the same water ($\nu \approx 1.0\times10^{-6}$ m²/s, round value).`,
    find: md`Model length and towing speed for Froude similarity; the ratio $Re_m/Re_p$; the viscosity a model fluid would need to match $Re$ too.`,
    steps: [
      { title: 'Model length', md: md`$L_m = 120/80 = 1.5$ m.` },
      { title: 'Froude number and model speed', md: md`$Fr_p = \dfrac{10}{\sqrt{9.81\times120}} = 0.291$; $\quad V_m = V_p\left(\dfrac{L_m}{L_p}\right)^{1/2} = 10\times\sqrt{1/80} = 1.12$ m/s.` },
      { title: 'Reynolds numbers', md: md`$Re_p = \dfrac{10\times120}{1.0\times10^{-6}} = 1.2\times10^9$; $\quad Re_m = \dfrac{1.118\times1.5}{1.0\times10^{-6}} = 1.68\times10^6$; $\quad \dfrac{Re_m}{Re_p} = \left(\dfrac{1}{80}\right)^{3/2} = 1.40\times10^{-3}$.` },
      { title: 'Viscosity needed for both', md: md`$\nu_m = \nu_p(L_m/L_p)^{3/2} = 1.40\times10^{-9}$ m²/s — about 80 times below mercury's ≈ $1.15\times10^{-7}$ m²/s. Impossible.` },
    ],
    answer: md`$L_m = 1.5$ m, $V_m = 1.12$ m/s; $Re_m/Re_p = 1.4\times10^{-3}$; a fluid with $\nu \approx 1.4\times10^{-9}$ m²/s would be needed.`,
    insight: 'Froude matching makes the model slow; slow and small together make its Reynolds number ~700 times too low.',
  },
  {
    id: 'ex-resistance-split',
    concept: 'incomplete-similarity',
    title: 'Reading Figs. 7.2–7.3 at Fr = 0.5: model to full-scale resistance',
    difficulty: 2,
    given: md`Values read from the digitised Figs. 7.2–7.3 near $Fr = 0.50$: model total (two runs) 0.00694 and 0.00712; model viscous (theory) 0.00367; full-scale viscous (theory) 0.00136; book's full-scale total 0.00527.`,
    find: md`The wave-resistance coefficient, the predicted full-scale total, and the error of using the model total directly.`,
    steps: [
      { title: 'Average the repeated runs', md: md`$C_{T,m} = (0.00694 + 0.00712)/2 = 0.00703$.` },
      { title: 'Wave part', md: md`$C_{\text{wave}} = C_{T,m} - C_{\text{visc},m} = 0.00703 - 0.00367 = 0.00336$ (the book's circles at this $Fr$ are 0.00328 and 0.00341 ✓).` },
      { title: 'Full scale', md: md`$C_{T,p} = C_{\text{wave}} + C_{\text{visc},p} = 0.00336 + 0.00136 = 0.00472$.` },
      { title: 'Compare with Fig. 7.3', md: md`The book's full-scale total is 0.00527, i.e. 0.00055 higher. Across all of Fig. 7.3 the totals sit ≈ 0.0005 above wave + viscous — consistent with the roughness/waviness correction the text mentions (our inference; the book does not state it).` },
      { title: 'Naive error', md: md`Using the model total directly: $0.00703/0.00527 = 1.33$ → a **33 % over-prediction**, because the model's skin friction (low $Re$) is far larger than the ship's.` },
    ],
    answer: md`$C_{\text{wave}} \approx 0.0034$; predicted $C_{T,p} \approx 0.0047$ (≈ 0.0053 with the correction); copying the model total would over-predict by ≈ 33 %.`,
    insight: 'Only the wave part transfers at equal Fr; the viscous part must be recomputed at the ship’s own Re.',
  },
  {
    id: 'ex76-pump',
    concept: 'pump-scaling',
    title: 'Example 7.6 — Pump "laws": changing the motor speed',
    src: [{ ...F266, note: 'Example 7.6' }, F267],
    difficulty: 2,
    given: md`Centrifugal pump, $\eta = 80\%$ at its design-point specific speed $N_{s_{cu}} = 2323$ (rpm, m³/h, m). Impeller $D = 200$ mm. At the design point it delivers $Q_1 = 68$ m³/h of water at $\omega_1 = 1170$ rpm. A 1750-rpm motor is to be fitted.`,
    find: md`(a) Design-point performance at 1750 rpm; (b) the specific speed at 1750 rpm; (c) the motor size for similar flow conditions.`,
    assumptions: md`Similar flow conditions; viscous effects negligible; efficiency unchanged (80 %) at the similar point; same impeller ($D_2/D_1 = 1$) and fluid.`,
    steps: [
      { title: 'Flow rate (Eq. 7.19)', md: md`$$Q_2 = Q_1\frac{\omega_2}{\omega_1}\left(\frac{D_2}{D_1}\right)^3 = 68\left(\frac{1750}{1170}\right)(1)^3 = 101.7\ \text{m}^3/\text{h}$$` },
      { title: 'Head at 1170 rpm from the specific speed', md: md`$$H_1 = \left(\frac{\omega_1Q_1^{1/2}}{N_{s_{cu}}}\right)^{4/3} = \left(\frac{1170\times68^{1/2}}{2323}\right)^{4/3} = (4.153)^{4/3} = 6.68\ \text{m}$$` },
      { title: 'Head at 1750 rpm (Eq. 7.20)', md: md`$$H_2 = H_1\left(\frac{\omega_2}{\omega_1}\right)^2\left(\frac{D_2}{D_1}\right)^2 = 6.68\left(\frac{1750}{1170}\right)^2 = 14.94\ \text{m}$$` },
      { title: 'Output power at 1170 rpm', md: md`$$\mathcal{P}_1 = \rho gQ_1H_1 = 1000\times9.81\times\frac{68}{3600}\times6.68 = 1.24\ \text{kW}$$` },
      { title: 'Output power at 1750 rpm (Eq. 7.21)', md: md`$$\mathcal{P}_2 = \mathcal{P}_1\frac{\rho_2}{\rho_1}\left(\frac{\omega_2}{\omega_1}\right)^3\left(\frac{D_2}{D_1}\right)^5 = 1.24\,(1)\left(\frac{1750}{1170}\right)^3(1)^5 = 4.15\ \text{kW}$$` },
      { title: '(c) Motor', md: md`$\mathcal{P}_{\text{in}} = \mathcal{P}_2/\eta = 4.15/0.80 = 5.19$ kW → the next larger standard size, a **7.5-hp** motor (≈ 5.6 kW), would probably be specified.` },
      { title: '(b) Specific speed at 1750 rpm', md: md`$$N_{s_{cu}} = \frac{1750\,(101.7)^{1/2}}{(14.94)^{3/4}} = 2323$$

        Unchanged, as it must be for similar flow conditions (unrounded 2322.4).` },
    ],
    answer: md`(a) $Q_2 = 101.7$ m³/h, $H_2 = 14.94$ m, $\mathcal{P}_2 = 4.15$ kW; (b) $N_{s_{cu}} = 2323$ (unchanged); (c) $\mathcal{P}_{\text{in}} = 5.19$ kW → 7.5-hp motor.`,
    insight: '+50 % speed gives +50 % flow, +124 % head and +235 % power — the cube law dominates motor sizing.',
  },
  {
    id: 'ex-pump-diameter',
    concept: 'pump-scaling',
    title: 'Scaling the same pump family to a 250 mm impeller',
    difficulty: 1,
    given: md`The pump of Example 7.6 at 1170 rpm: $Q_1 = 68$ m³/h, $H_1 = 6.68$ m, $\mathcal{P}_1 = 1.24$ kW (to the fluid), $D_1 = 200$ mm. A geometrically similar pump with $D_2 = 250$ mm runs at the same speed.`,
    find: md`$Q_2$, $H_2$, $\mathcal{P}_2$ and $N_{s_{cu}}$ at the similar operating point.`,
    steps: [
      { title: 'Diameter ratio', md: md`$D_2/D_1 = 1.25$, $\omega_2/\omega_1 = 1$.` },
      { title: 'Apply the laws', md: md`$Q_2 = 68\times1.25^3 = 132.8$ m³/h; $\quad H_2 = 6.68\times1.25^2 = 10.44$ m; $\quad \mathcal{P}_2 = 1.24\times1.25^5 = 3.78$ kW.` },
      { title: 'Specific speed', md: md`$N_{s_{cu}} = \dfrac{1170\sqrt{132.8}}{10.44^{3/4}} = 2322$ — the same as before: $D$ cancels out of $N_s$ by construction.` },
    ],
    answer: md`$Q_2 \approx 133$ m³/h, $H_2 \approx 10.4$ m, $\mathcal{P}_2 \approx 3.78$ kW, $N_{s_{cu}} \approx 2322$ — the design value 2323 within rounding.`,
    insight: 'A 25 % larger impeller roughly doubles flow (×1.95) but triples power (×3.05).',
  },
  {
    id: 'ex-sae-speed',
    concept: 'model-testing',
    title: 'Which facility can reach the SAE Reynolds number for a bus?',
    difficulty: 2,
    given: md`Bus width $w_p = 2.44$ m (Example 7.5). SAE recommends $Re \ge 2\times10^6$ for truck/bus testing (Fox p.264); take $Re = Vw/\nu$ with $\nu = 1.46\times10^{-5}$ m²/s (width as the length, as in Example 7.5 — an assumption). Speed of sound ≈ 340 m/s. Facilities from Fox p.268.`,
    find: md`The tunnel speed needed for a 1:16 and a 1:8 model, and the $Re$ reached by the full-size bus in the NASA Ames 24 × 36 m section (70.5 m/s).`,
    steps: [
      { title: '1:16 model', md: md`$w_m = 0.1525$ m → $V = \dfrac{2\times10^6\times1.46\times10^{-5}}{0.1525} = 191$ m/s, $M = 0.56$ — compressibility would spoil kinematic similarity.` },
      { title: '1:8 model', md: md`$w_m = 0.305$ m → $V = 95.7$ m/s, $M = 0.28$ — just inside the incompressible range, but needs a large, fast tunnel (and tunnel blockage limits model size).` },
      { title: 'Full size at NASA Ames', md: md`$Re = \dfrac{70.5\times2.44}{1.46\times10^{-5}} = 1.18\times10^7$ in the 24 × 36 m section (and $2.57\times10^7$ at 154 m/s in the 12 × 24 m section).` },
    ],
    answer: md`1:16 needs ≈ 191 m/s (infeasible, $M \approx 0.56$); 1:8 needs ≈ 96 m/s ($M \approx 0.28$); a full-size bus at 70.5 m/s reaches $Re \approx 1.2\times10^7$.`,
    insight: 'High-Re requirements are why national full-scale facilities exist.',
  },
]

/* ------------------------------------------------------------------------------------------------ practice */

export const practice: PracticeDef[] = [
  {
    id: 'pr-air-vs-water',
    concept: 'similarity-types',
    difficulty: 2,
    q: md`An underwater body 2.5 m long moves at 3 m/s in water ($\nu = 1.0\times10^{-6}$ m²/s). A 1:5 model is to be tested at matched $Re$. (a) What air speed would a wind-tunnel test need ($\nu_{\text{air}} = 1.46\times10^{-5}$ m²/s)? Is it acceptable? (b) What speed would a water-tunnel test need?`,
    hint: md`$V_m = V_p\,(L_p/L_m)\,(\nu_m/\nu_p)$. Check $M = V_m/340$.`,
    answer: md`(a) 219 m/s — $M \approx 0.64$, compressibility would destroy similarity; (b) 15 m/s.`,
    solution: md`$Re$ matching: $V_m = V_p\dfrac{L_p}{L_m}\dfrac{\nu_m}{\nu_p}$.

    (a) $V_m = 3\times5\times\dfrac{1.46\times10^{-5}}{1.0\times10^{-6}} = 3\times5\times14.6 = 219$ m/s. $M = 219/340 = 0.64 > 0.3$: the model flow would be compressible while the prototype flow is not, so the flows would not be kinematically similar — unacceptable.

    (b) Same fluid: $V_m = 3\times5\times1 = 15$ m/s — feasible in a water tunnel (check that the tunnel pressure is high enough to avoid cavitation, which the prototype does not have).`,
    check: [
      { label: 'air speed', value: 219, units: 'm/s' },
      { label: 'water speed', value: 15, units: 'm/s' },
    ],
  },
  {
    id: 'pr-same-fluid-force',
    concept: 'similarity-types',
    difficulty: 2,
    q: md`A 1:4 model is tested in the **same** water as its prototype at matched Reynolds number and registers a drag of 40 N. What is the prototype drag, and how fast does the model have to move compared with the prototype?`,
    hint: md`Write $V_m/V_p$ from $Re_m = Re_p$, then substitute into $F_p = F_m(\rho_p/\rho_m)(V_p/V_m)^2(L_p/L_m)^2$.`,
    answer: md`$F_p = 40$ N; $V_m = 4V_p$.`,
    solution: md`Same fluid ⇒ $V_mL_m = V_pL_p$ ⇒ $V_m/V_p = L_p/L_m = 4$.

    $F_p = F_m\cdot1\cdot\left(\dfrac{V_p}{V_m}\right)^2\left(\dfrac{L_p}{L_m}\right)^2 = 40\times\left(\dfrac14\right)^2\times4^2 = 40$ N.

    In the same fluid at equal $Re$ the forces are **equal** ($F \propto \mu^2/\rho$), but the model must run four times faster — often impractical, which is one reason other fluids or incomplete similarity are used.`,
    check: [{ label: 'prototype drag', value: 40, units: 'N' }],
  },
  {
    id: 'pr-force-ratio',
    concept: 'similarity-types',
    difficulty: 3,
    q: md`Show that for Reynolds-matched tests $F_p/F_m = (\rho_p\nu_p^2)/(\rho_m\nu_m^2)$, and use it to re-check Example 7.4 (seawater $\rho = 1000$ kg/m³, $\nu = 1.57\times10^{-6}$ m²/s; air $\rho = 1.227$ kg/m³, $\nu = 1.46\times10^{-5}$ m²/s; $F_m = 2.7$ N). Give the ratio $F_p/F_m$.`,
    hint: md`Replace $V$ by $Re\,\nu/D$ in $\rho V^2D^2$.`,
    answer: md`$F_p/F_m \approx 9.42$, so $F_p \approx 25.4$ N (matches 25.5 N).`,
    solution: md`$\rho V^2D^2 = \rho\left(\dfrac{Re\,\nu}{D}\right)^2D^2 = \rho\nu^2Re^2$. Equal dimensionless force and equal $Re$ give

    $$\frac{F_p}{\rho_p\nu_p^2Re^2} = \frac{F_m}{\rho_m\nu_m^2Re^2} \Rightarrow \frac{F_p}{F_m} = \frac{\rho_p\nu_p^2}{\rho_m\nu_m^2}$$

    $\dfrac{F_p}{F_m} = \dfrac{1000\times(1.57\times10^{-6})^2}{1.227\times(1.46\times10^{-5})^2} = \dfrac{2.465\times10^{-9}}{2.616\times10^{-10}} = 9.42$ → $F_p = 9.42\times2.7 = 25.4$ N, agreeing with the book's 25.5 N (rounding of $Re$ and $V_m$). Size and speed drop out completely.`,
    check: [{ label: 'F_p/F_m', value: 9.42 }],
  },
  {
    id: 'pr-ship-25',
    concept: 'incomplete-similarity',
    difficulty: 1,
    q: md`A 100 m ship cruises at 8 m/s. A 1:25 model is towed in a tank. (a) Model speed for Froude similarity? (b) What kinematic viscosity would the model fluid need for Reynolds similarity as well, if the ship sails in water with $\nu_p = 1.0\times10^{-6}$ m²/s?`,
    hint: md`$V_m/V_p = (L_m/L_p)^{1/2}$; $\nu_m/\nu_p = (L_m/L_p)^{3/2}$.`,
    answer: md`(a) 1.6 m/s; (b) $8\times10^{-9}$ m²/s (impossible).`,
    solution: md`(a) $V_m = 8\times(1/25)^{1/2} = 8/5 = 1.6$ m/s.

    (b) $\nu_m = \nu_p(1/25)^{3/2} = 1.0\times10^{-6}\times0.008 = 8\times10^{-9}$ m²/s — more than an order of magnitude below mercury (≈ $1.15\times10^{-7}$ m²/s). So only $Fr$ is matched; viscous resistance is handled by boundary-layer theory.`,
    check: [
      { label: 'model speed', value: 1.6, units: 'm/s' },
      { label: 'required ν_m', value: 8e-9, units: 'm²/s' },
    ],
  },
  {
    id: 'pr-bus-80',
    concept: 'incomplete-similarity',
    difficulty: 1,
    q: md`Using the plateau value $C_D = 0.46$ from Example 7.5 ($\rho = 1.23$ kg/m³, $A_p = 7.8$ m²), find the bus's aerodynamic drag and drag power at 80 km/h. By what factor is the power lower than at 100 km/h?`,
    hint: md`$V = 80/3.6$ m/s; $\mathcal{P} \propto V^3$.`,
    answer: md`$F_D \approx 1.09$ kN, $\mathcal{P} \approx 24.2$ kW; power factor $0.8^3 = 0.512$.`,
    solution: md`$V = 80/3.6 = 22.22$ m/s.

    $F_D = \tfrac12\times0.46\times1.23\times22.22^2\times7.8 = 1090$ N $= 1.09$ kN.

    $\mathcal{P} = F_DV = 1090\times22.22 = 24.2$ kW. Ratio to 100 km/h: $(80/100)^3 = 0.512$ (47.3 kW × 0.512 = 24.2 kW ✓).`,
    check: [
      { label: 'drag', value: 1.09, units: 'kN' },
      { label: 'power', value: 24.2, units: 'kW' },
    ],
  },
  {
    id: 'pr-truck-700',
    concept: 'incomplete-similarity',
    difficulty: 2,
    q: md`A 1:8 truck model is tested in air. What tunnel speed would match the Reynolds number of the full-size truck at 90 km/h? Why is that test not acceptable, and what makes model testing of trucks possible anyway?`,
    hint: md`Same fluid: $V_m = V_p(L_p/L_m)$. Compare with the speed of sound.`,
    answer: md`720 km/h (200 m/s, $M \approx 0.59$); compressibility would destroy kinematic similarity; bluff-body $C_D$ is independent of $Re$ above a threshold.`,
    solution: md`$V_m = 90\times8 = 720$ km/h $= 200$ m/s (the book quotes ≈ 700 km/h for a 1:8 model). $M = 200/340 \approx 0.59$, so compressibility effects absent in the prototype would appear in the model — the flows would not be kinematically similar.

    Trucks and buses are **bluff** bodies: above a certain $Re$ their dimensionless drag stops depending on $Re$, so tests at a lower $Re$ on the plateau can still be scaled (Example 7.5).`,
    check: [{ label: 'model speed', value: 720, units: 'km/h' }],
  },
  {
    id: 'pr-river',
    concept: 'incomplete-similarity',
    difficulty: 3,
    q: md`A tidal estuary model uses a horizontal scale 1:1000 and a vertical scale 1:100 (like the San Francisco Bay model). With Froude similarity based on depth, find (a) the velocity ratio, (b) the model discharge for a prototype river flow of 1000 m³/s, and (c) how long a 12.42-hour tide lasts in the model.`,
    hint: md`$V_r = y_r^{1/2}$, $Q_r = V_r\,x_r\,y_r$, $t_r = x_r/V_r$.`,
    answer: md`(a) 0.1; (b) $1.0\times10^{-3}$ m³/s (1 L/s); (c) ≈ 7.45 min.`,
    solution: md`(a) $V_m/V_p = (1/100)^{1/2} = 0.1$.

    (b) $Q_m/Q_p = 0.1\times\dfrac{1}{1000}\times\dfrac{1}{100} = 10^{-6}$ → $Q_m = 1000\times10^{-6} = 1.0\times10^{-3}$ m³/s.

    (c) $t_m/t_p = \dfrac{1/1000}{0.1} = 0.01$ → $12.42\times60\times0.01 = 7.45$ min. The distortion keeps model depths large enough that viscosity and surface tension do not dominate; roughness elements restore the friction that the exaggerated depth would otherwise reduce.`,
    check: [
      { label: 'model discharge', value: 0.001, units: 'm³/s' },
      { label: 'model tide period', value: 7.45, units: 'min' },
    ],
  },
  {
    id: 'pr-fan',
    concept: 'pump-scaling',
    difficulty: 1,
    q: md`A fan running at 1200 rpm delivers 2.0 m³/s and absorbs 3.0 kW. Estimate the flow and power at 1500 rpm (same fan, same air, similar operating point). By what factor does the pressure rise change?`,
    hint: md`$Q \propto \omega$, $\mathcal{P} \propto \omega^3$, head (and $\Delta p = \rho gH$) $\propto \omega^2$.`,
    answer: md`$Q = 2.5$ m³/s, $\mathcal{P} \approx 5.86$ kW, pressure rise × 1.5625.`,
    solution: md`$r = 1500/1200 = 1.25$.

    $Q_2 = 2.0\times1.25 = 2.5$ m³/s; $\quad\mathcal{P}_2 = 3.0\times1.25^3 = 5.86$ kW; $\quad\Delta p_2/\Delta p_1 = 1.25^2 = 1.5625$.`,
    check: [
      { label: 'flow', value: 2.5, units: 'm³/s' },
      { label: 'power', value: 5.86, units: 'kW' },
    ],
  },
  {
    id: 'pr-model-pump',
    concept: 'pump-scaling',
    difficulty: 2,
    q: md`A model pump ($D = 0.1$ m) at 3000 rpm delivers 0.01 m³/s against a head of 20 m and absorbs 2.5 kW. A geometrically similar prototype ($D = 0.4$ m) pumps the same liquid at 750 rpm. Predict its flow, head and power at the similar operating point.`,
    hint: md`$r_\omega = 0.25$, $r_D = 4$.`,
    answer: md`$Q = 0.16$ m³/s, $H = 20$ m, $\mathcal{P} = 40$ kW.`,
    solution: md`$r_\omega = 750/3000 = 0.25$, $r_D = 4$.

    $Q_p = 0.01\times0.25\times4^3 = 0.16$ m³/s

    $H_p = 20\times0.25^2\times4^2 = 20$ m

    $\mathcal{P}_p = 2.5\times0.25^3\times4^5 = 2.5\times16 = 40$ kW.`,
    check: [
      { label: 'Q', value: 0.16, units: 'm³/s' },
      { label: 'H', value: 20, units: 'm' },
      { label: 'P', value: 40, units: 'kW' },
    ],
  },
  {
    id: 'pr-ns-si',
    concept: 'pump-scaling',
    difficulty: 3,
    q: md`Express the Example 7.6 design point ($1170$ rpm, $68$ m³/h, $H = 6.68$ m) in SI units and compute the truly dimensionless specific speed $N_s = \omega Q^{1/2}/h^{3/4}$ of Eq. (7.22a).`,
    hint: md`$\omega$ in rad/s, $Q$ in m³/s, $h = gH$ in J/kg.`,
    answer: md`$N_s \approx 0.731$.`,
    solution: md`$\omega = 1170\times2\pi/60 = 122.5$ rad/s; $\quad Q = 68/3600 = 0.01889$ m³/s; $\quad h = 9.81\times6.68 = 65.53$ J/kg.

    $$N_s = \frac{122.5\times(0.01889)^{1/2}}{(65.53)^{3/4}} = \frac{122.5\times0.1374}{23.03} = 0.731$$

    Generally $N_s = N_{s_{cu}}\times\dfrac{2\pi/60}{\sqrt{3600}\,g^{3/4}} = 3.15\times10^{-4}N_{s_{cu}}$, and $2323\times3.15\times10^{-4} = 0.731$ ✓.`,
    check: [{ label: 'N_s', value: 0.731 }],
  },
  {
    id: 'pr-ns-class',
    concept: 'pump-scaling',
    difficulty: 1,
    q: md`A pump delivers 200 m³/h against 20 m at 1750 rpm at its best-efficiency point. Compute $N_{s_{cu}}$ and classify it using the ranges printed in Fox.`,
    hint: md`$N_{s_{cu}} = \omega Q^{1/2}/H^{3/4}$ with rpm, m³/h, m.`,
    answer: md`$N_{s_{cu}} \approx 2617$ — in the "low" range (580–4645).`,
    solution: md`$N_{s_{cu}} = \dfrac{1750\times\sqrt{200}}{20^{3/4}} = \dfrac{1750\times14.14}{9.457} = 2617$. Since $580 < 2617 < 4645$ it is a **low** specific-speed machine (typical of radial-flow centrifugal pumps).`,
    check: [{ label: 'N_s,cu', value: 2617 }],
  },
  {
    id: 'pr-buoyancy',
    concept: 'model-testing',
    difficulty: 2,
    q: md`The static pressure in a test section falls by 15 Pa per metre in the flow direction. A model of volume 0.04 m³ has a true drag of 12 N. What spurious force does the gradient add, and what percentage error does it cause in the drag reading?`,
    hint: md`$F_{\text{buoy}} = -(dp/dx)\mathcal{V}$.`,
    answer: md`0.6 N downstream → +5 % error.`,
    solution: md`$F_{\text{buoy}} = -(-15\ \text{Pa/m})\times0.04\ \text{m}^3 = 0.6$ N, acting downstream (higher pressure on the upstream face), so it reads as extra drag: $0.6/12 = 5\%$ error. This is why the text insists that pressure gradients be documented and that wall boundary layers (which cause them) be removed by suction or energised by blowing.`,
    check: [
      { label: 'spurious force', value: 0.6, units: 'N' },
      { label: 'error', value: 5, units: '%' },
    ],
  },
  {
    id: 'pr-misalign',
    concept: 'model-testing',
    difficulty: 2,
    q: md`A wing model produces lift 200 N and drag 20 N. Its balance is misaligned by 0.5°. What does the drag channel read, and what is the percentage error?`,
    hint: md`$D_{\text{read}} = D\cos\varepsilon + L\sin\varepsilon$.`,
    answer: md`≈ 21.74 N, an error of ≈ 8.7 %.`,
    solution: md`$\varepsilon = 0.5° = 8.727\times10^{-3}$ rad.

    $D_{\text{read}} = 20\cos0.5° + 200\sin0.5° = 19.999 + 1.745 = 21.74$ N → error $1.74/20 = 8.7\%$. High-lift, low-drag models are the most sensitive, hence "balances must be carefully aligned and correctly calibrated".`,
    check: [
      { label: 'reading', value: 21.74, units: 'N' },
      { label: 'error', value: 8.7, units: '%' },
    ],
  },
  {
    id: 'pr-ames',
    concept: 'model-testing',
    difficulty: 1,
    q: md`A full-size bus (width 2.44 m) is tested in the NASA Ames National Full-Scale Aerodynamics Complex. Using $\nu = 1.46\times10^{-5}$ m²/s, find the width-based Reynolds number at the maximum speed of each test section (12 × 24 m: 154 m/s; 24 × 36 m: 70.5 m/s) and the Mach number in the faster section ($c \approx 340$ m/s).`,
    hint: md`$Re = Vw/\nu$.`,
    answer: md`$Re \approx 2.57\times10^7$ and $1.18\times10^7$; $M \approx 0.45$.`,
    solution: md`$Re_{12\times24} = 154\times2.44/1.46\times10^{-5} = 2.57\times10^7$; $\quad Re_{24\times36} = 70.5\times2.44/1.46\times10^{-5} = 1.18\times10^7$.

    Both exceed the SAE recommendation $2\times10^6$ by a wide margin. In the faster section $M = 154/340 = 0.45$ — fine for an aircraft test, but far faster than a bus travels, so the slower, larger section is the natural choice for a road vehicle.`,
    check: [
      { label: 'Re (12×24)', value: 2.57e7 },
      { label: 'Re (24×36)', value: 1.18e7 },
      { label: 'Mach', value: 0.45 },
    ],
  },
]

/* ------------------------------------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-hierarchy',
    concept: 'similarity-types',
    difficulty: 1,
    q: 'Which statement about the three levels of similarity is correct?',
    options: [
      'Kinematic similarity is necessary but not sufficient for dynamic similarity.',
      'Geometric similarity guarantees kinematic similarity.',
      'Kinematic similarity is sufficient for dynamic similarity.',
      'Dynamic similarity can exist without geometric similarity.',
    ],
    answer: 0,
    explain: 'Dynamic ⊂ kinematic ⊂ geometric. Same shape alone does not fix the streamline pattern (the regime could differ), and parallel velocities do not guarantee that every force type is in the same ratio — that needs every independent Π group matched.',
    src: F257,
  },
  {
    id: 'q-what-matches',
    concept: 'similarity-types',
    difficulty: 1,
    q: 'Two geometrically similar spheres are tested at the same Reynolds number in different fluids. Which quantity is then the same for model and prototype?',
    options: ['F/ρV²D²', 'the drag force F', 'the free-stream speed V', 'the dynamic pressure ½ρV²'],
    answer: 0,
    explain: 'Matching the only independent group (Re) forces the dependent group F/ρV²D² to match. The actual forces differ (2.7 N vs 25.5 N in Example 7.4).',
    src: F258,
  },
  {
    id: 'q-air-for-water',
    concept: 'similarity-types',
    difficulty: 2,
    q: 'True or false: a wind-tunnel test of a sphere can predict its drag in seawater, provided Re is matched, the prototype does not cavitate and the model flow is not compressible.',
    options: ['True', 'False'],
    answer: 0,
    explain: 'Different fluids are allowed — only the Π values must agree, and both flows must be in the same regime (Example 7.4). If the prototype cavitated, an air test could not reproduce it.',
    src: [F258, F259],
  },
  {
    id: 'q-nu-ratio',
    concept: 'incomplete-similarity',
    difficulty: 2,
    q: 'A 1:100 ship model is run at the prototype Froude number. What ratio νₘ/νₚ would also match the Reynolds number?',
    options: ['1/1000', '1/100', '1/10', '1/10 000'],
    answer: 0,
    explain: 'Fr matching gives Vₘ/Vₚ = (1/100)^½ = 1/10; Re matching then needs νₘ/νₚ = (Vₘ/Vₚ)(Lₘ/Lₚ) = (1/100)^{3/2} = 1/1000. Using only the length ratio (1/100) forgets that the model also moves slower.',
    src: F260,
  },
  {
    id: 'q-wave-transfer',
    concept: 'incomplete-similarity',
    difficulty: 2,
    q: 'In Fox’s ship-testing procedure, which coefficient is carried over unchanged from the model to the full-size ship?',
    options: [
      'the wave-resistance coefficient at the same Froude number',
      'the total-resistance coefficient at the same Froude number',
      'the viscous-resistance coefficient at the same Froude number',
      'the viscous-resistance coefficient at the same Reynolds number',
    ],
    answer: 0,
    explain: 'Wave resistance depends only on Fr, so it transfers. The total cannot be copied because its viscous part depends on Re, which is ~10³ times too low on the model; full-scale friction is recomputed from boundary-layer theory.',
    src: F261,
  },
  {
    id: 'q-trip',
    concept: 'incomplete-similarity',
    difficulty: 2,
    q: 'Why were “studs” fitted to the 1:80 ship model whose data appear in Fig. 7.2?',
    options: [
      'to trip the boundary layer so that it becomes turbulent where it does on the full-size ship',
      'to add the roughness correction to the measured total resistance',
      'to raise the model Froude number to the prototype value',
      'to suppress the bow wave so that only friction is measured',
    ],
    answer: 0,
    explain: 'With Re only (Lₘ/Lₚ)^{3/2} of the prototype value, the model’s laminar region would be far too long; tripping makes boundary-layer behaviour scalable. The roughness correction is a separate, later adjustment to full-scale coefficients.',
    src: F261,
  },
  {
    id: 'q-bluff',
    concept: 'incomplete-similarity',
    difficulty: 1,
    q: 'Why can wind-tunnel data from a 1:16 bus model be used even though its Reynolds number is far below the prototype’s?',
    options: [
      'Above a threshold Re, the drag coefficient of a bluff body is independent of Re.',
      'The Froude numbers of model and prototype are equal.',
      'Compressibility makes C_D the same at all speeds.',
      'Bus drag is almost entirely skin friction, which scales exactly.',
    ],
    answer: 0,
    explain: 'Example 7.5 shows C_D flattening at ≈ 0.46 above Reₘ ≈ 4×10⁵; the prototype (≈ 4.5×10⁶) is also on the plateau. Bluff-body drag is mostly pressure (form) drag, not skin friction.',
    src: [F263, F264],
  },
  {
    id: 'q-double-speed',
    concept: 'pump-scaling',
    difficulty: 1,
    q: 'The speed of a pump is doubled (same impeller, same fluid, similar operating point). Flow, head and power change by:',
    options: ['×2, ×4, ×8', '×2, ×2, ×4', '×4, ×8, ×16', '×2, ×4, ×4'],
    answer: 0,
    explain: 'Q ∝ ω, h ∝ ω², P ∝ ω³ at fixed D (Eqs. 7.19–7.21). Power also equals ρgQH ∝ ω·ω² = ω³, consistent.',
    src: F265,
  },
  {
    id: 'q-ns-eliminates',
    concept: 'pump-scaling',
    difficulty: 2,
    q: 'Specific speed N_s = ωQ^{1/2}/h^{3/4} is obtained by combining the flow and head coefficients so as to eliminate which quantity?',
    options: ['the impeller diameter D', 'the angular speed ω', 'the flow rate Q', 'the fluid density ρ'],
    answer: 0,
    explain: 'Π₁^{1/2}/Π₂^{3/4} makes D^{3/2} cancel. That is why one N_s value describes a whole family of geometrically similar machines of any size.',
    src: F266,
  },
  {
    id: 'q-drop-re',
    concept: 'pump-scaling',
    difficulty: 2,
    q: 'Complete similarity of two pumps would require equal flow coefficients and equal Reynolds numbers. Why do the pump "laws" ignore the Reynolds number?',
    options: [
      'Viscous effects are relatively unimportant for geometrically similar machines operating under similar flow conditions.',
      'Equal speeds automatically give equal Reynolds numbers.',
      'Flow inside pumps is laminar, so Re does not matter.',
      'Water has negligible viscosity at pump speeds.',
    ],
    answer: 0,
    explain: 'Head and power are developed by inertia forces, and experience shows viscous effects are small at similar flow conditions (high Re). Re is not automatically matched — it changes with ωD².',
    src: F265,
  },
  {
    id: 'q-wall-bl',
    concept: 'model-testing',
    difficulty: 1,
    q: 'What does Fox recommend when boundary layers on the tunnel walls interfere with measurements?',
    options: [
      'remove them by suction or energise them by blowing',
      'paint the walls with roughness to thicken them',
      'raise the tunnel speed until they become laminar',
      'nothing — they do not affect drag readings',
    ],
    answer: 0,
    explain: 'Growing wall boundary layers shrink the effective area, accelerate the core flow and create an axial pressure gradient that gives erroneous drag readings. Suction or blowing controls them.',
    src: F267,
  },
  {
    id: 'q-ntf',
    concept: 'model-testing',
    difficulty: 2,
    q: 'How does NASA Langley’s National Transonic Facility reach high Reynolds numbers?',
    options: [
      'by cooling the test gas cryogenically (down to −184 °C) to reduce its viscosity',
      'by testing full-size aircraft at low speed',
      'by replacing air with water',
      'by running at a higher Mach number than flight',
    ],
    answer: 0,
    explain: 'Cold gas has lower viscosity (and higher density), so Re = ρVL/μ rises — by a factor of 6 while halving drive power. Changing Mach would break similarity.',
    src: F268,
  },
]

/* ------------------------------------------------------------------------------------------------ flashcards */

export const flashcards: Flashcard[] = [
  { id: 'fc-three-levels', front: 'Define geometric, kinematic and dynamic similarity.', back: md`**Geometric:** same shape, one length scale. **Kinematic:** velocities at corresponding points parallel with one ratio (scaled streamlines; same regime). **Dynamic:** each type of force parallel and in one ratio at all corresponding points.`, src: F257 },
  { id: 'fc-criterion', front: 'Practical criterion for dynamic similarity?', back: md`In geometrically similar flows, give **every independent Π group** the same value in model and prototype; the dependent Π group (e.g. $F/\rho V^2D^2$) then matches automatically.`, src: F257 },
  { id: 'fc-force-scale', front: 'Prototype force from a Re-matched model test?', back: md`$F_p = F_m\dfrac{\rho_p}{\rho_m}\dfrac{V_p^2}{V_m^2}\dfrac{D_p^2}{D_m^2}$ — the forces differ, the dimensionless force is equal.`, src: [F258, F259] },
  { id: 'fc-fr-re-conflict', front: 'Why can a ship model not match both Fr and Re?', back: md`$Fr$ fixes $V_m/V_p = (L_m/L_p)^{1/2}$; then $Re$ needs $\nu_m/\nu_p = (L_m/L_p)^{3/2}$ — $10^{-3}$ at 1:100. No practical liquid is that much less viscous than water.`, src: F260 },
  { id: 'fc-ship-procedure', front: 'Fox’s 4-step ship-resistance procedure?', back: md`1 measure model total; 2 compute model viscous (BL theory); 3 wave = total − viscous (depends on $Fr$ only → valid at full scale); 4 add full-scale viscous (BL theory) [+ roughness correction]. Accuracy ≈ ±5 %.`, src: F261 },
  { id: 'fc-bluff', front: 'How is incomplete similarity rescued for buses and trucks?', back: md`Bluff bodies: above a threshold $Re$ the drag coefficient is constant (Example 7.5: $C_D \approx 0.46$ above $Re_m \approx 4\times10^5$), so $Re$ need not be matched. SAE suggests $Re \ge 2\times10^6$.`, src: [F263, F264] },
  { id: 'fc-pump-laws', front: 'The three pump/fan "laws"?', back: md`At equal flow coefficient $Q/\omega D^3$: $h/\omega^2D^2$ and $\mathcal{P}/\rho\omega^3D^5$ are equal → $Q \propto \omega D^3$, $H \propto \omega^2D^2$, $\mathcal{P} \propto \rho\omega^3D^5$.`, src: F265 },
  { id: 'fc-specific-speed', front: 'Specific speed: definition and meaning?', back: md`$N_s = \omega Q^{1/2}/h^{3/4}$ (7.22a), $D$ eliminated; dimensionless with $h$ per unit mass. Constant for all similar operating points of a family. Customary $N_{s_{cu}}$ (rpm, m³/h, m) is not unitless: low 580–4645, high 11 615–17 420.`, src: F266 },
  { id: 'fc-eff', front: 'Pump efficiency and fluid power?', back: md`$\eta = \mathcal{P}/\mathcal{P}_{\text{in}}$, $\mathcal{P} = \rho Qh = \rho gQH$. Maximum efficiency usually at the design point.`, src: [F264, F265] },
  { id: 'fc-rivers', front: 'Why are river and harbour models distorted?', back: md`One reasonable horizontal scale would make depths so small that viscous and surface-tension forces dominate. A larger vertical scale is used, with artificial roughness to raise friction (e.g. SF Bay model: 1:1000 horizontal, 1:100 vertical).`, src: [F262, F268] },
  { id: 'fc-testing', front: 'Main requirements for valid model tests (Fox)?', back: md`Accurate, detailed models; aligned, calibrated balances; rigid, non-interfering mounts; documented tunnel flow (uniform, no angularity, little swirl); wall BLs removed by suction/blowing; beware axial pressure gradients.`, src: F267 },
  { id: 'fc-facilities', front: 'Why do national test facilities exist?', back: md`To reach very large $Re$ or special conditions: NASA Ames NFAC (93 255 kW; 12×24 m at 154 m/s, 24×36 m at 70.5 m/s), David Taylor towing basin & water tunnel, SF Bay model, NASA Langley NTF (cryogenic, $Re$ ×6 at half power).`, src: F268 },
]

/* ------------------------------------------------------------------------------------------------ takeaways */

export const takeaways: string[] = [
  md`A model test is useful only if its data **scale** to the prototype; that requires geometric ⊃ kinematic ⊃ dynamic similarity, with the **same flow regime** (no compressibility or cavitation in one flow but not the other).`,
  md`**Dynamic similarity = equal independent Π groups.** The dependent group then matches automatically, e.g. $F/\rho V^2D^2$ — the forces themselves differ.`,
  md`Fluids may differ between tests: Example 7.4 predicts seawater drag (25.5 N) from an air test at 47.2 m/s by matching $Re = 4.91\times10^5$.`,
  md`Free-surface models suffer **incomplete similarity**: matching $Fr$ forces $\nu_m/\nu_p = (L_m/L_p)^{3/2}$ for $Re$ too — impossible for realistic scales.`,
  md`Ships: measure total, subtract theoretical model friction, keep the $Fr$-only **wave** part, add full-scale friction; trip the model boundary layer; ≈ ±5 % accuracy.`,
  md`Bluff vehicles: above a threshold $Re$, $C_D$ is constant (bus: 0.46 above $Re_m \approx 4\times10^5$), so the plateau value scales directly; drag power $\propto V^3$.`,
  md`Rivers and harbours use **different vertical and horizontal scales** plus artificial roughness.`,
  md`With several dependent parameters, form one Π group per dependent variable: head coefficient $h/\omega^2D^2$ and power coefficient $\mathcal{P}/\rho\omega^3D^5$, both functions of the flow coefficient $Q/\omega D^3$ (and $Re$, usually negligible).`,
  md`Pump/fan laws: $Q \propto \omega D^3$, $H \propto \omega^2D^2$, $\mathcal{P} \propto \rho\omega^3D^5$; the specific speed $N_s = \omega Q^{1/2}/h^{3/4}$ is invariant across a similar family.`,
  md`Model testing is an experiment like any other: careful models, aligned balances, non-interfering mounts and documented tunnel flow quality; very high $Re$ needs special national facilities.`,
]

/* ------------------------------------------------------------------------------------------------ content */

export default function Content() {
  return (
    <>
      {/* ============================================================== 1. similarity-types */}
      <Concept id="similarity-types">
        <Step kind="intro" src={[F257, F258]}>
          <Md>{md`Most fluid-dynamic design data — drag of a car, resistance of a ship, head of a pump — comes from **model tests**. A model test is only worth doing if its data can be **scaled** to give the forces, moments and dynamic loads on the full-size **prototype**. The central question of §7.5 is therefore: *what conditions guarantee that the model flow and the prototype flow are similar?*

          Before any test, the named groups of §7.4 (Eqs. 7.11–7.16) already tell us which forces — inertia, viscosity, pressure, gravity, surface tension, compressibility — matter in a given flow, and therefore which groups a model must reproduce.

          The answer comes in three levels — **geometric**, **kinematic** and **dynamic** similarity — and the Buckingham Pi theorem of the previous topics turns the most demanding one (dynamic similarity) into a simple, checkable rule: *make every independent Π group equal*.`}</Md>
          <Callout kind="key" title="The rule in one line">
            <Md>{md`For geometrically similar flows, if **each independent dimensionless group** has the same value in model and prototype, the forces have the same relative importance and the **dependent** dimensionless group takes the same value too.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of photographing the two flows with dye streaks and enlarging the model photo by $L_p/L_m$:

          - **Geometric:** the two *bodies* in the photos coincide exactly — every length, every fillet, even the surface roughness, scaled by one factor.
          - **Kinematic:** the *streamline patterns* also coincide; only the "speed labels" on the arrows differ by one factor. Nothing new may appear in one flow only — a cavitation bubble or a shock wave would change the pattern itself.
          - **Dynamic:** if you could draw every little force arrow (pressure, viscous, gravity, surface tension…) the two pictures would again coincide, with one scale factor for *forces*. Then the **tug-of-war** between the forces is balanced in the same proportions — and that proportion is exactly what a Π group like $Re$ = inertia/viscous measures.`}</Md>
          <Callout kind="tip" title="Why equal forces are not required">
            <Md>{md`Similarity is about **ratios**. A 152 mm sphere in air and a 0.3 m sphere in seawater feel very different forces (2.7 N vs 25.5 N in Example 7.4), yet they are "the same flow" because the force *ratios* — measured by $Re$ — are equal.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F257}>
          <Figure caption="The three levels of similarity for a model at roughly 0.45 scale: same shape → same streamlines → same force ratios. Each level contains the next." src={F257}>
            <SimilarityLadder />
          </Figure>
          <Compare
            items={[
              { title: 'Geometric', md: md`Same shape; all linear dimensions related by a **constant scale factor**. The most obvious requirement.`, tone: 'indigo' },
              { title: 'Kinematic', md: md`Velocities at corresponding points have the **same direction** and differ by a **constant factor** → scaled streamlines. Boundaries are bounding streamlines, so it **requires geometric similarity**. Needs the **same flow regime**.`, tone: 'cyan' },
              { title: 'Dynamic', md: md`Identical **types** of forces are **parallel** and related in magnitude by a **constant factor** at all corresponding points. The most restrictive level.`, tone: 'amber' },
            ]}
          />
          <Callout kind="note" title="Two practical relaxations and one strict rule (Fox p.257)">
            <Md>{md`- In principle, reproducing an *infinite* flow field would need a wind tunnel of **infinite cross-section**; in practice this can be relaxed a great deal, so tunnels of reasonable size work.
            - **Same regime:** compressibility or cavitation can change even the *qualitative* pattern. If they are absent in the prototype, they **must be avoided in the model**.
            - Kinematic similarity is **necessary but not sufficient** for dynamic similarity. Complete dynamic similarity requires *all* important forces (viscous, pressure, surface tension, …) to be in the same ratio.`}</Md>
          </Callout>
        </Step>

        <Step kind="equations" src={F258}>
          <Md>{md`**Sphere drag as the worked illustration.** Example 7.1 listed the variables; the Pi theorem collapses them to one dependent and one independent group.`}</Md>
          <FormulaCard id="sphere-drag-function" />
          <FormulaCard id="sphere-drag-pi" />
          <FormulaCard id="re-matching" />
          <FormulaCard id="force-scaling" />
          <Derivation
            title="From equal Π groups to a prototype prediction"
            steps={[
              { md: md`$\dfrac{F}{\rho V^2D^2} = f_1\!\left(\dfrac{\rho VD}{\mu}\right)$ holds for **every** geometrically similar sphere.`, why: 'Pi theorem (one curve)' },
              { md: md`Choose test conditions so that $\left(\dfrac{\rho VD}{\mu}\right)_m = \left(\dfrac{\rho VD}{\mu}\right)_p$.`, why: 'match the independent group' },
              { md: md`Same argument of $f_1$ ⇒ same value: $\left(\dfrac{F}{\rho V^2D^2}\right)_m = \left(\dfrac{F}{\rho V^2D^2}\right)_p$.`, why: 'dependent group follows' },
              { md: md`Solve for the unknown: $F_p = F_m\,\dfrac{\rho_p}{\rho_m}\,\dfrac{V_p^2}{V_m^2}\,\dfrac{D_p^2}{D_m^2}$.`, why: 'rearrange' },
            ]}
          />
          <Supplement title="A neat consequence: F ∝ μ²/ρ at equal Re">
            <Md>{md`Writing $V = Re\,\nu/D$ gives $\rho V^2D^2 = \rho\nu^2Re^2 = (\mu^2/\rho)Re^2$. So at matched $Re$ the force ratio depends only on the two fluids: $F_p/F_m = (\rho_p\nu_p^2)/(\rho_m\nu_m^2)$. In the **same** fluid, Re-matched model and prototype feel **equal** forces (but the model must move $L_p/L_m$ times faster).`}</Md>
          </Supplement>
          <FormulaCard id="mach-number" />
          <Callout kind="warning" title="Different fluids are allowed — different regimes are not">
            <Md>{md`Data measured in air in a wind tunnel may predict drag in water, **if** $Re$ is matched, the prototype does not cavitate and the model flow stays incompressible ($M \lesssim 0.3$).`}</Md>
          </Callout>
        </Step>

        <Step kind="example" src={[F258, F259]}>
          <Figure caption="Example 7.4 set-up: prototype sonar transducer in seawater (left) and a 152 mm model in air (right)." src={{ ...F258, note: 'Example 7.4 sketch' }}>
            <SonarSketch />
          </Figure>
          <ExampleCard id="ex74-sonar" />
          <Callout kind="exam" title="Exam pattern">
            <Md>{md`(1) write the Π relation; (2) compute $Re_p$; (3) $V_m = Re_p\,\nu_m/D_m$; (4) **check the regime** (Mach, cavitation); (5) scale the force with the dependent group. Marks are often lost at step 4.`}</Md>
          </Callout>
          <ExampleCard id="ex-water-tunnel" />
        </Step>

        <Step kind="interactive">
          <ModelMatcher />
        </Step>

        <Step kind="practice">
          <PracticeList concept="similarity-types" />
          <QuickCheck ids={['q-hierarchy', 'q-what-matches']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Dynamic ⊂ kinematic ⊂ geometric; kinematic similarity is **necessary, not sufficient**.`,
              md`Criterion: equal **independent** Π groups ⇒ equal **dependent** Π group.`,
              md`Prototype force: $F_p = F_m(\rho_p/\rho_m)(V_p/V_m)^2(D_p/D_m)^2$ — never assume $F_p = F_m$ unless the fluids are the same.`,
              md`Trap: forgetting the regime check — a Re-matched air model at $M > 0.3$, or a model that cavitates when the prototype does not, is **not** similar.`,
              md`Example 7.4's printed "157 ft/s" is a slip: the SI answer is 47.2 m/s.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== 2. incomplete-similarity */}
      <Concept id="incomplete-similarity">
        <Step kind="intro" src={[F259, F260]}>
          <Md>{md`Complete dynamic similarity needs **every** independent group duplicated. In Example 7.4 that was just $Re$ — the air test matched it exactly, and a water tunnel could have done so too. Even there, strictly, the sphere's drag depends on its boundary layer, so the **relative surface roughness** is another group to match — a carefully built model handles it.

          Many model studies need *several* groups matched, and sometimes complete similarity **cannot be attained**. The classic case is a **surface ship**: its resistance has a **skin-friction** part (viscous forces → $Re$) and a **surface-wave** part (gravity forces → $Fr$), so both $Re$ and $Fr$ would have to be duplicated. This concept shows why that is impossible and how engineers still get useful, ±5 %-accurate answers — and how the same idea applies to rivers, harbours, cars, trucks and buses.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`You have only three "knobs" for a model test: its **size**, its **speed** and the **fluid**. On Earth $g$ is fixed, so once you choose the size, Froude matching *dictates* the speed (small model → slow model). Reynolds matching would then need a fluid whose viscosity is smaller in proportion to *both* the smaller size and the lower speed — a factor $(L_m/L_p)^{3/2}$. At 1:100 that is a liquid 1000 times "thinner" than water. None exists.

          The way out is to **give up one group and replace it by knowledge**: let theory (boundary-layer theory for friction) supply the part of the physics you cannot model, or exploit a range where the result **stops depending** on the unmatched group (bluff-body drag plateau).`}</Md>
          <Callout kind="tip">
            <Md>{md`Incomplete similarity is not failure — it is *partial* modelling plus **analysis** or a known **insensitivity**.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[F260, F261, F262, F263]}>
          <Figure caption="Required model/prototype kinematic-viscosity ratio for matching Re as well as Fr, versus model scale. Real liquids stop about one decade below water." src={F260}>
            <Plot
              x={{ label: 'Model scale $L_m/L_p$', domain: [0.004, 1], log: true }}
              y={{ label: md`Required $\nu_m/\nu_p$`, domain: [1e-4, 1], log: true }}
              series={[{ label: '$(L_m/L_p)^{3/2}$', fn: (s) => s ** 1.5, color: 'var(--plot-4)', width: 2.4 }]}
              hlines={[
                { y: 1, label: 'water', color: 'var(--plot-2)' },
                { y: NU_LADDER.find((f) => f.name === 'mercury')!.nu / 1e-6, label: 'mercury (≈ 0.1)', color: 'var(--plot-5)', dash: '5 4' },
              ]}
              marks={[
                { x: 0.01, y: 0.001, label: '1:100 → 1/1000', color: 'var(--plot-4)' },
                { x: 1 / 80, y: (1 / 80) ** 1.5, label: '1:80', color: 'var(--plot-3)' },
              ]}
              height={270}
            />
          </Figure>
          <Md>{md`**Fig. 7.2** shows tank-test data for a **1:80 model** of the U.S. Navy guided-missile frigate *Oliver Hazard Perry* (FFG-7), from the U.S. Naval Academy Hydromechanics Laboratory: total, viscous and wave resistance coefficients against $Fr$. **Fig. 7.3** shows the resulting full-scale prediction. The sim below re-plots both from digitised marker positions (the book does not tabulate them).`}</Md>
          <ShipResistance />
          <Callout kind="note" title="Boundary-layer tripping and corrections (Fox p.261)">
            <Md>{md`- Because $Re_m$ is only $(L_m/L_p)^{3/2}$ of $Re_p$, the laminar part of the model's boundary layer would be far too long. The model boundary layer is **"tripped" or "stimulated"** to become turbulent where it does on the ship — **studs** were used in the Fig. 7.2 tests.
            - A further correction is sometimes added to the full-scale coefficients for **roughness, waviness and unevenness**, which are inevitably larger on a real hull.
            - Model-based predictions agree with full-scale trials to about **±5 %** (ref. [5], Todd).`}</Md>
          </Callout>
          <Md>{md`**Rivers and harbours.** The Froude number again governs, and complete similarity is impractical: at a single reasonable scale the model depths become tiny, so viscous and surface-tension forces would matter far more than in the prototype. Different **vertical and horizontal length scales** are used, and **artificial roughness elements** raise the viscous forces in the (relatively deeper) model flow.`}</Md>
          <Figure caption="Why rivers are modelled with two scales: an undistorted 1:1000 model would be millimetres deep." src={F262}>
            <DistortedRiverFigure />
          </Figure>
          <Md>{md`**Automobiles.** Fuel economy made drag reduction important; most low-drag development uses model tests. Car models were traditionally built at **3/8 scale** — a full-size car model then has a frontal area of about **0.3 m²**, so a tunnel with a test section of **6 m² or more** suffices. Modelling a car at the legal speed limit then needs about **240 km/h** of wind (our arithmetic: Re matching in air corresponds to a prototype at $240\times3/8 = 90$ km/h). Compressibility is not a problem, but scale models are expensive and slow to build. **General Motors'** full-scale tunnel (test section **5.4 m high × 10.4 m wide × 21.3 m long**, up to **250 km/h** empty) takes production cars or clay mock-ups, and the low speed allows flow visualisation with **tufts or smoke** — so stylists and engineers can work together. Many manufacturers have similar facilities; Fig. 7.4 shows a sedan in the Volvo tunnel.`}</Md>
          <Figure caption="Recreation of the idea of Fig. 7.4: a smoke streakline traces the flow over a full-size car in a wind tunnel." src={{ ...F262, note: 'Fig. 7.4 (photograph) — schematic recreation' }}>
            <SmokeStreak />
          </Figure>
          <Supplement title="Footnotes on p.262">
            <Md>{md`1. "Smoke" streaklines can be made from a **liquid-nitrogen/steam** mixture: it evaporates and does not clog the fine-mesh turbulence screens; a lens filter makes the streaks look "coloured" in photographs (refs. [6], [7]).
            2. Vehicle **length** matters in tests at large **yaw angles** (crosswinds), and **tunnel blockage** limits model size (SAE practice, ref. [8]).`}</Md>
          </Supplement>
          <Md>{md`**Trucks and buses.** Models must be smaller (a large scale is **1:8**), and Re matching at 1:8 would require about **700 km/h** — compressibility effects would appear and the flows would **not be kinematically similar**. Fortunately trucks and buses are **bluff** bodies: above a certain $Re$ their dimensionless drag becomes **independent of Re** (just as a sphere's $C_D$ is nearly constant for $2000 < Re < 2\times10^5$, Fig. 7.1). Test data can then be scaled even though similarity is incomplete — Example 7.5.`}</Md>
        </Step>

        <Step kind="equations" src={[F260, F261, F263, F264]}>
          <FormulaCard id="fr-matching" />
          <Derivation
            title="Why Fr + Re cannot both be matched (Fox p.260)"
            steps={[
              { md: md`$Fr_m = Fr_p$: $\dfrac{V_m}{\sqrt{gL_m}} = \dfrac{V_p}{\sqrt{gL_p}} \Rightarrow \dfrac{V_m}{V_p} = \left(\dfrac{L_m}{L_p}\right)^{1/2}$`, why: 'g cancels' },
              { md: md`$Re_m = Re_p$: $\dfrac{V_mL_m}{\nu_m} = \dfrac{V_pL_p}{\nu_p} \Rightarrow \dfrac{\nu_m}{\nu_p} = \dfrac{V_m}{V_p}\dfrac{L_m}{L_p}$`, why: 'only ν is left free' },
              { md: md`Substitute: $\dfrac{\nu_m}{\nu_p} = \left(\dfrac{L_m}{L_p}\right)^{1/2}\dfrac{L_m}{L_p} = \left(\dfrac{L_m}{L_p}\right)^{3/2}$`, why: 'combine' },
              { md: md`$L_m/L_p = 1/100$ ⇒ $\nu_m/\nu_p = 1/1000$. Mercury, the only liquid less viscous (kinematically) than water, is only ~10× lower.`, why: 'impossible' },
            ]}
          />
          <FormulaCard id="nu-ratio" />
          <Callout kind="note">
            <Md>{md`Water is also the only practical fluid for most free-surface tests, so complete similarity would need a **full-scale test**. (The book prints the last subscript of $\nu_m/\nu_p = (V_m/V_p)(L_m/L_P)$ as a capital P — a typo.)`}</Md>
          </Callout>
          <FormulaCard id="ship-resistance-split" />
          <FormulaCard id="bus-cd-re" />
          <FormulaCard id="drag-power" />
          <FormulaCard id="distorted-froude" />
        </Step>

        <Step kind="example" src={[F263, F264]}>
          <ExampleCard id="ex75-bus" />
          <Callout kind="note">
            <Md>{md`Fox points to refs. [9–12] (Sedov; Birkhoff; Ipsen; Yalin) for more techniques and applications of dimensional analysis.`}</Md>
          </Callout>
          <ExampleCard id="ex-ship-froude" />
          <ExampleCard id="ex-resistance-split" />
        </Step>

        <Step kind="interactive">
          <FroudeReynolds />
          <BusPlateau />
        </Step>

        <Step kind="practice">
          <PracticeList concept="incomplete-similarity" />
          <QuickCheck ids={['q-nu-ratio', 'q-wave-transfer']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Ships: match $Fr$ ($V_m/V_p = (L_m/L_p)^{1/2}$); $Re$ then falls short by $(L_m/L_p)^{3/2}$ in the same water.`,
              md`Only **wave** resistance transfers at equal $Fr$; recompute friction at each $Re$ with boundary-layer theory; trip the model boundary layer.`,
              md`Trap: copying the model's **total** coefficient to the ship over-predicts resistance (≈ 33 % at $Fr = 0.5$ in Figs. 7.2–7.3).`,
              md`River models: two length scales + artificial roughness. Vehicles: full-scale tunnels or the **Re-independent plateau** of bluff-body $C_D$.`,
              md`Example 7.5: $C_D \approx 0.46$ above $Re_m \approx 4\times10^5$ → 1.71 kN and 47.5 kW at 100 km/h.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== 3. pump-scaling */}
      <Concept id="pump-scaling">
        <Step kind="intro" src={[F264, F265]}>
          <Md>{md`So far each problem had **one** dependent variable (a force). Some practical situations have **several** — then a dimensionless group must be formed **separately for each dependent parameter**.

          The book's example is a **centrifugal pump**. Its internal flow pattern changes with **volume flow rate** and **speed**, and so does its performance. The quantities of interest are the **pressure rise (head)**, the **power input** and the **efficiency**, each measured at given operating conditions; **performance curves** are produced by varying one independent parameter, usually the flow rate. Independent: flow rate, angular speed, impeller diameter, fluid properties. Dependent: the performance quantities.`}</Md>
          <FormulaCard id="pump-efficiency" />
        </Step>

        <Step kind="intuition">
          <Md>{md`A pump family is like a set of photographic enlargements of one impeller. What decides whether two pumps (or one pump at two speeds) "behave the same"? The **angle at which the fluid meets the blades**. That angle is set by the ratio of the through-flow velocity ($\propto Q/D^2$) to the blade speed ($\propto \omega D$) — i.e. by $Q/\omega D^3$, the **flow coefficient**. Same flow coefficient → same velocity triangles → same flow pattern.

          Once the pattern is the same, everything scales with the blade speed $\omega D$: head (an energy per unit mass, like a velocity squared) $\propto (\omega D)^2$, and power $\propto \rho \times$ (flow) × (head) $\propto \rho\,(\omega D^3)(\omega D)^2 = \rho\omega^3D^5$.`}</Md>
          <Callout kind="tip">
            <Md>{md`Memory hook: **1-2-3** in speed ($Q \propto \omega$, $H \propto \omega^2$, $\mathcal{P} \propto \omega^3$) and **3-2-5** in diameter ($Q \propto D^3$, $H \propto D^2$, $\mathcal{P} \propto D^5$).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F265}>
          <Figure caption="Fig. 7.5 recreated: typical head, power-input and efficiency curves of a centrifugal pump at constant speed (qualitative scales). Maximum efficiency usually occurs at the design point." src={{ ...F265, note: 'Fig. 7.5' }}>
            <PumpCurvesFigure />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'List variables', md: md`$h = g_1(Q,\rho,\omega,D,\mu)$ and $\mathcal{P} = g_2(Q,\rho,\omega,D,\mu)$: $n = 6$, $r = 3$ → 3 groups each.`, tone: 'indigo' },
              { title: 'Repeating variables ρ, ω, D', md: md`Independent groups: flow coefficient $Q/\omega D^3$ and a Reynolds number $\rho\omega D^2/\mu$.`, tone: 'cyan' },
              { title: 'One dependent group per output', md: md`Head coefficient $h/\omega^2D^2$ (7.17) and power coefficient $\mathcal{P}/\rho\omega^3D^5$ (7.18).`, tone: 'amber' },
              { title: 'Drop Re (viscous effects small)', md: md`Equal flow coefficients ⇒ equal head and power coefficients: the pump "laws" (7.19)–(7.21).`, tone: 'emerald' },
            ]}
          />
          <Md>{md`Head and power are developed by **inertia** forces. Performance is hard to predict analytically except at the design point, so it is **measured**; the curves of Fig. 7.5 are smoothed through points computed from measured data.`}</Md>
        </Step>

        <Step kind="equations" src={[F265, F266]}>
          <FormulaCard id="pump-functional" />
          <FormulaCard id="head-coefficient" />
          <FormulaCard id="power-coefficient" />
          <Callout kind="key" title="Similarity conditions">
            <Md>{md`Complete similarity would need identical flow coefficients **and** identical Reynolds numbers. In practice viscous effects are relatively unimportant when geometrically similar machines operate under "similar" flow conditions, so from (7.17)–(7.18):`}</Md>
          </Callout>
          <FormulaCard id="pump-law-flow" />
          <FormulaCard id="pump-law-head" />
          <FormulaCard id="pump-law-power" />
          <FormulaCard id="pump-laws-solved" />
          <Md>{md`These scaling relations are called the **pump (or fan) "laws"**: knowing one machine's operating conditions, those of **any geometrically similar machine** follow by changing $D$ and $\omega$. (Chapter 10 develops fluid-machinery performance further.)`}</Md>
          <Derivation
            title="Specific speed: eliminate the diameter (Fox p.266)"
            steps={[
              { md: md`$\Pi_1 = \dfrac{Q}{\omega D^3}$, $\quad \Pi_2 = \dfrac{h}{\omega^2D^2}$`, why: 'flow & head coefficients' },
              { md: md`$\Pi_1^{1/2} = \dfrac{Q^{1/2}}{\omega^{1/2}D^{3/2}}$, $\quad \Pi_2^{3/4} = \dfrac{h^{3/4}}{\omega^{3/2}D^{3/2}}$`, why: 'choose powers so D matches' },
              { md: md`$\dfrac{\Pi_1^{1/2}}{\Pi_2^{3/4}} = \dfrac{Q^{1/2}}{\omega^{1/2}}\cdot\dfrac{\omega^{3/2}}{h^{3/4}} = \dfrac{\omega Q^{1/2}}{h^{3/4}} \equiv N_s$`, why: 'D^{3/2} cancels' },
              { md: md`Dimensions: $[\omega Q^{1/2}] = \mathrm{T^{-1}L^{3/2}T^{-1/2}}$, $[h^{3/4}] = \mathrm{L^{3/2}T^{-3/2}}$ → dimensionless.`, why: 'check (h per unit mass)' },
            ]}
          />
          <FormulaCard id="specific-speed" />
          <FormulaCard id="specific-speed-cu" />
          <Callout kind="warning" title="Units trap">
            <Md>{md`$N_{s_{cu}}$ uses inconsistent units (rpm, m³/h, m with $H$ per unit **weight**) and is **not** dimensionless; its number changes with the unit system. Always state the units. Printed ranges: "low" $580 < N_{s_{cu}} < 4645$, "high" $11\,615 < N_{s_{cu}} < 17\,420$ (the book does not name the range in between).`}</Md>
          </Callout>
        </Step>

        <Step kind="example" src={[F266, F267]}>
          <ExampleCard id="ex76-pump" />
          <Callout kind="note">
            <Md>{md`Industry uses the pump/fan laws widely to scale performance curves for **families of machines from a single performance curve**, and to specify drive speed and power.`}</Md>
          </Callout>
          <ExampleCard id="ex-pump-diameter" />
        </Step>

        <Step kind="interactive">
          <PumpLaws />
        </Step>

        <Step kind="practice">
          <PracticeList concept="pump-scaling" />
          <QuickCheck ids={['q-double-speed', 'q-ns-eliminates']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Several dependent variables → one Π group each: head coefficient (7.17) and power coefficient (7.18) vs the flow coefficient $Q/\omega D^3$.`,
              md`Pump laws (7.19)–(7.21): $Q \propto \omega D^3$, $H \propto \omega^2D^2$, $\mathcal{P} \propto \rho\omega^3D^5$ — valid only between **similar** operating points.`,
              md`Specific speed eliminates $D$ and is invariant for a similar family; Example 7.6 keeps $N_{s_{cu}} = 2323$ at both speeds.`,
              md`Trap: $\mathcal{P} = \rho gQH$ needs $Q$ in **m³/s**, not m³/h; motor size = fluid power ÷ efficiency.`,
              md`Trap: applying the laws between *non*-similar points (e.g. same flow at a new speed) is wrong.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== 4. model-testing */}
      <Concept id="model-testing">
        <Step kind="intro" src={[F267, F268, F269]}>
          <Md>{md`Model testing is **not** simple, and it does not automatically deliver results that are easy to interpret, accurate and complete. As with all experimental work, valid results need careful **planning and execution**. Fox closes §7.5 with practical advice and a tour of the special facilities that exist for conditions a university or company laboratory cannot reach — above all, very large Reynolds numbers.

          The chapter summary (§7.6) recalls what the whole chapter did: nondimensionalising governing equations, the Buckingham Pi theorem, the named groups (Re, Eu, Ca, Fr, We, M) and their physical meaning, and the ideas of modelling — **geometric, kinematic and dynamic similarity, incomplete modelling, and predicting prototype results from model tests**. Its useful-equations table also lists the specific speed in both forms, (7.22a) and (7.22b).`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Treat a wind tunnel or towing tank as a **measuring instrument**, not as "the real flow made small". Every instrument has bias errors: a balance that is a fraction of a degree off mixes lift into drag; walls that grow boundary layers change the pressure along the test section; a sting or strut disturbs the very flow it supports. Similarity theory tells you *what* to match — good experimental practice makes sure you *actually* matched it.`}</Md>
          <Callout kind="tip">
            <Md>{md`Ask of every test: Is the model faithful where it matters? Is the force measurement aligned and calibrated? Does the mount interfere? Is the free stream uniform, swirl-free and documented? Is there an axial pressure gradient?`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[F267, F268]}>
          <Figure caption="Where model-test errors come from in a wind tunnel (schematic). Items 3–6 are the requirements Fox lists on p.267; items 1–2 (screens, contraction) and the tunnel layout are general background added here." src={{ ...F267, note: 'items 3–6 listed in the text' }}>
            <TunnelSchematic />
          </Figure>
          <Md>{md`**Fox's checklist (p.267):**
          - **Models** built carefully and accurately, with enough detail in the regions critical to the phenomenon measured.
          - **Aerodynamic balances** and other force-measuring systems carefully **aligned** and correctly **calibrated**.
          - **Mounting** methods that give adequate rigidity and model motion **without interfering** with the phenomenon.
          - **Facilities** designed and built carefully, with the **flow quality documented**: test-section flow as uniform as possible (unless a special profile such as an **atmospheric boundary layer** is being simulated), free of angularity, with little swirl.
          - Wall boundary layers that interfere with measurements are **removed by suction or energised by blowing**.
          - **Pressure gradients** along the test section cause **erroneous drag readings**.

          Standard references for wind-tunnel technique are [13–15] (Pankhurst & Holder; Rae & Pope; Pope & Goin); Waugh and Stubstad [16] cover water-impact testing.`}</Md>
          <Md>{md`**Special facilities (p.268, refs. [17–19])**

          | Facility | Key data |
          |---|---|
          | National Full-Scale Aerodynamics Complex, NASA Ames (Moffett Field, CA) | two wind-tunnel test sections, 93 255 kW drive: 12 m × 24 m up to 154 m/s; 24 m × 36 m up to 70.5 m/s |
          | High-Speed Towing Basin, David Taylor Research Center (Carderock, MD) | 905 m long, 6.4 m wide, 4.9 m deep; carriage to 100 knots; drag loads to 35 600 N, side loads to 8900 N |
          | 0.91 m variable-pressure water tunnel (same centre) | up to 25.7 m/s at pressures 13.8–413.4 kPa |
          | Anechoic Flow Facility (same centre) | quiet, low-turbulence air in a 0.75 m² × 6.4 m open-jet section; at 61 m/s quieter than conversational speech |
          | San Francisco Bay and Delta Model, US Army Corps of Engineers (Sausalito, CA) | slightly over 4047 m²; 1:1000 horizontal, 1:100 vertical; 0.85 m³/s pumping; fresh and salt water; tides |
          | National Transonic Facility, NASA Langley (Hampton, VA) | cryogenic gas down to −184 °C lowers viscosity: Re × 6 at half the drive power |`}</Md>
          <Callout kind="note" title="Reading the table with similarity eyes">
            <Md>{md`The variable-pressure water tunnel lets the cavitation number be set independently of speed; the Bay model is a distorted Froude model (two scales); the NTF raises $Re = \rho VL/\mu$ by lowering $\mu$ (and raising $\rho$) instead of raising $V$ — which would change the Mach number.`}</Md>
          </Callout>
        </Step>

        <Step kind="equations">
          <Md>{md`The text states these error sources in words; the two formulas below (supplementary) let you put numbers on them.`}</Md>
          <FormulaCard id="horizontal-buoyancy" />
          <FormulaCard id="balance-misalignment" />
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-sae-speed" />
        </Step>

        <Step kind="interactive">
          <TunnelLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="model-testing" />
          <QuickCheck ids={['q-wall-bl', 'q-ntf']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Model testing is careful experimental work: faithful models, aligned/calibrated balances, rigid non-interfering mounts.`,
              md`Tunnel flow quality must be **documented**: uniform, no angularity, little swirl; wall BLs removed by suction or energised by blowing.`,
              md`An axial pressure gradient gives a spurious drag $-(dp/dx)\mathcal{V}$; a misaligned balance leaks $L\varepsilon$ into drag.`,
              md`Very high $Re$ needs national facilities — full-scale tunnels, long towing basins, pressurised water tunnels, cryogenic tunnels (NTF: $Re$ × 6 at half power).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
