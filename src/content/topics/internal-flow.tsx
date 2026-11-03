/**
 * Topic D1 — Internal Flow Basics: Laminar vs Turbulent & Wall Shear.
 * Source: Fox & McDonald, Ch. 8 — pp. 275–277 (chapter opener, Lab-on-a-chip case study, §8.1, Fig. 8.1, Eq. 8.1,
 * Part A intro, start of §8.2) and pp. 293–294 (end of the Part B introduction, §8.4, Fig. 8.8).
 * Fox §8.5 (pp. 294–296) belongs to the velocity-profiles / friction-factor topics.
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, md, PracticeList, QuickCheck, Step,
  Supplement, Takeaways,
} from '@/kit'
import { CylinderFBD, Fig81Entrance, Fig88Plot, ReRegimeLine, ReynoldsExperimentFig } from '../sims/internal-flow/figures'
import { ReynoldsDye } from '../sims/internal-flow/ReynoldsDye'
import { LabOnChip } from '../sims/internal-flow/LabOnChip'
import { EntranceExplorer } from '../sims/internal-flow/EntranceExplorer'
import { ShearStressExplorer } from '../sims/internal-flow/ShearStressExplorer'

const F275: Src = { doc: 'fox', pages: '275' }
const F276: Src = { doc: 'fox', pages: '276' }
const F277: Src = { doc: 'fox', pages: '277' }
const F293: Src = { doc: 'fox', pages: '293' }
const F294: Src = { doc: 'fox', pages: '294' }
const F81: Src = { doc: 'fox', pages: '277', note: 'Fig. 8.1' }
const F88: Src = { doc: 'fox', pages: '294', note: 'Fig. 8.8' }

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'internal-flow',
  unit: 'D',
  title: 'Internal Flow Basics: Laminar vs Turbulent & Wall Shear',
  subtitle:
    'Pipe flow is laminar or turbulent depending on Re; it needs an entrance length to become fully developed; and once it is, a simple force balance fixes a linear shear-stress profile — carried by viscosity near the wall and by Reynolds stress in the core.',
  minutes: 80,
  sources: [
    { doc: 'fox', pages: '275–277' },
    { doc: 'fox', pages: '293–294' },
  ],
  concepts: [
    {
      id: 'laminar-turbulent',
      title: 'Laminar vs turbulent internal flow',
      src: F276,
      summary: 'Internal flows are bounded by walls; Re = ρV̄D/μ sets the regime; Reynolds’ dye experiment; transition benchmark Re ≈ 2300.',
    },
    {
      id: 'entrance-length',
      title: 'Entrance region & entrance length',
      src: F277,
      summary: 'Wall boundary layers grow until they meet on the axis; laminar L/D ≃ 0.06 Re (Eq. 8.1, up to ≈ 138 D); turbulent 25–40 D.',
    },
    {
      id: 'shear-stress-distribution',
      title: 'Shear-stress distribution in fully developed pipe flow',
      src: { doc: 'fox', pages: '293–294' },
      summary: 'Force balance → τ_rx = (r/2)∂p/∂x, linear for laminar and turbulent flow; τ_w = −(R/2)∂p/∂x; τ = μ dū/dy − ρ u′v′ (Fig. 8.8).',
    },
  ],
  sourceNote: md`**Source.** Fox & McDonald, Ch. 8, pp. 275–277 and 293–294. Fox Ch. 8 introduces internal flow; turbulence proper (next topics) follows Wilkes Ch. 9 per course focus. Fox prints **no worked examples** on these pages, so every example and practice problem here is written for this platform (✦ or *solution written here*); the animated models of the dye filament, the developing profile and the viscous/turbulent split are supplementary schematics. Fox §8.5 (turbulent velocity profiles, pp. 294–296) is covered in the velocity-profile topic.`,
}

/* -------------------------------------------------------------------------------------------- formulas */

export const formulas: FormulaDef[] = [
  {
    id: 're-pipe',
    name: 'Reynolds number for pipe flow',
    key: true,
    tex: md`\Rey = \frac{\rho\,\bar V D}{\mu} = \frac{\bar V D}{\nu}`,
    vars: [
      { sym: md`\Rey`, desc: 'Reynolds number — ratio of inertia forces to viscous forces', units: md`-` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\bar V`, desc: md`**average** velocity, $\bar V \equiv Q/A$ (not the centreline velocity)`, units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'pipe (inside) diameter', units: md`\mathrm{m}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s = N\,s/m^2}` },
      { sym: md`\nu = \mu/\rho`, desc: 'kinematic viscosity (the second form is a supplementary rewrite)', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'internal flow in a (circular) pipe; for internal flows the regime is **primarily a function of Re**',
      md`incompressible flow: liquids, or gases with negligible heat transfer and Mach number $M < 0.3$ ($\approx 100$ m/s in air)`,
      md`velocity scale is the **average** velocity $\bar V$ — do not confuse with $Re_U = UD/\nu$ of Fig. 8.8, which uses the centreline velocity $U$`,
    ],
    use: md`Compute $\Rey$ first in every pipe problem and compare with $\approx 2300$ to decide laminar or turbulent; this choice decides which formulas (entrance length, pressure drop, velocity profile) apply. Watch units: $D$ in metres, $\mu$ in Pa·s.`,
    src: F276,
  },
  {
    id: 're-transition',
    name: 'Transition benchmark for pipe flow',
    key: true,
    tex: md`\Rey_{\text{crit}} \approx 2300 \qquad (\text{laminar for } \Rey \lesssim 2300 \text{ under normal conditions})`,
    vars: [{ sym: md`\Rey_{\text{crit}}`, desc: md`Reynolds number (based on $\bar V$ and $D$) at which pipe flow normally becomes turbulent`, units: md`-` }],
    conditions: [
      'normal engineering conditions (ordinary disturbances, ordinary wall roughness)',
      md`with great care (disturbance-free inflow, smooth walls) pipe flow has been kept laminar up to $\Rey \approx 100\,000$ — transition is not a sharp physical constant`,
      md`example from Fox: water in a 25 mm pipe reaches $\Rey \approx 2300$ at $\bar V \approx 0.091$ m/s`,
    ],
    use: md`Use 2300 as **the** benchmark in exam problems. Treat flows just above 2300 with caution: in practice there is an intermittent band (often quoted as roughly 2300–4000, supplementary) before the flow is fully turbulent.`,
    src: F276,
  },
  {
    id: 'vbar',
    name: 'Average velocity',
    tex: md`\bar V \equiv \frac{Q}{A} = U_0, \qquad A = \frac{\pi D^2}{4}`,
    vars: [
      { sym: md`\bar V`, desc: 'average (bulk) velocity', units: md`\mathrm{m/s}` },
      { sym: md`Q`, desc: 'volume flow rate', units: md`\mathrm{m^3/s}` },
      { sym: md`A`, desc: md`cross-sectional area ($\pi D^2/4$ for a circular pipe — supplementary)`, units: md`\mathrm{m^2}` },
      { sym: md`U_0`, desc: 'uniform velocity at the pipe entrance (Fig. 8.1)', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      'incompressible flow, so the same Q passes every cross-section',
      md`$\bar V = U_0$ because $Q = A\bar V = AU_0$ with a uniform inlet profile`,
    ],
    use: md`Convert a flow rate into the velocity that goes into $\Rey$ and Eq. 8.1. A litre per second is $10^{-3}$ m³/s.`,
    src: F277,
  },
  {
    id: 'entrance-laminar',
    name: 'Laminar entrance length',
    key: true,
    tag: '8.1',
    tex: md`\frac{L}{D} \simeq 0.06\,\frac{\rho\,\bar V D}{\mu} = 0.06\,\Rey`,
    vars: [
      { sym: md`L`, desc: 'entrance length — distance from the entrance to where fully developed flow begins', units: md`\mathrm{m}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: md`\rho,\ \mu`, desc: 'density and dynamic viscosity', units: md`\mathrm{kg/m^3},\ \mathrm{Pa\,s}` },
      { sym: md`\bar V`, desc: md`average velocity $Q/A$ ($= U_0$)`, units: md`\mathrm{m/s}` },
    ],
    conditions: ['**laminar** pipe flow only (Re < 2300)', 'uniform inlet profile (Fig. 8.1)', 'incompressible, Newtonian fluid'],
    use: md`Multiply: $L = 0.06\,\Rey\,D$. Check that a test section, a sensor or an analysis that assumes "fully developed" sits farther than $L$ from the inlet.`,
    src: { doc: 'fox', pages: '277', note: 'Eq. (8.1)' },
  },
  {
    id: 'entrance-max',
    name: 'Longest laminar entrance length',
    tex: md`L \simeq 0.06\,\Rey\,D \le (0.06)(2300)\,D = 138\,D`,
    vars: [
      { sym: md`L`, desc: 'laminar entrance length', units: md`\mathrm{m}` },
      { sym: md`\Rey\,D`, desc: md`Reynolds number times the diameter (printed "0.06 ReD" in the book)`, units: md`\mathrm{m}` },
    ],
    conditions: ['laminar flow, so Re is at most about 2300'],
    use: md`Quick bound: a laminar pipe flow needs **up to about 140 diameters** to become fully developed.`,
    src: F277,
  },
  {
    id: 'entrance-turb',
    name: 'Turbulent entrance length (experimental)',
    tex: md`\frac{L}{D} \approx 25 \text{ to } 40 \ \ (\text{mean velocity profile}), \qquad \frac{L}{D} \gtrsim 80 \ \ (\text{details of the turbulence})`,
    vars: [
      { sym: md`L/D`, desc: 'entrance length in pipe diameters', units: md`-` },
    ],
    conditions: [
      'turbulent pipe flow (Re above about 2300)',
      'experimental observation — there is no formula in Re here',
      'enhanced mixing makes the boundary layer grow faster than in laminar flow',
    ],
    use: md`For measurements of the **mean** velocity or pressure gradient, place them beyond 25–40 $D$; for turbulence statistics (fluctuations, Reynolds stresses) allow 80 $D$ or more.`,
    src: F277,
  },
  {
    id: 'dp-laminar',
    name: 'Laminar pressure drop (Hagen–Poiseuille)',
    tex: md`\Delta p = \frac{128\,\mu L Q}{\pi D^4}`,
    vars: [
      { sym: md`\Delta p`, desc: md`pressure drop over the length $L$ ($p_1 - p_2 > 0$)`, units: md`\mathrm{Pa}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`L`, desc: 'pipe length', units: md`\mathrm{m}` },
      { sym: md`Q`, desc: 'volume flow rate', units: md`\mathrm{m^3/s}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
    ],
    conditions: [
      'fully developed **laminar** flow of a Newtonian fluid',
      'horizontal pipe of constant (circular) area — friction is the only pressure-reducing factor',
      'no analytical counterpart exists for turbulent flow',
    ],
    use: md`Note the $D^4$: halving the diameter at fixed Q multiplies $\Delta p$ by 16. Always confirm $\Rey < 2300$ first.`,
    src: { doc: 'fox', pages: '293', note: 'rearranged from Eq. (8.13c)' },
  },
  {
    id: 'cyl-balance',
    name: 'Force balance on a fluid cylinder (direct route)',
    tex: md`\Big[p - \Big(p + \pd{p}{x}dx\Big)\Big]\pi r^2 + \tau_{rx}\,2\pi r\,dx = 0 \;\;\Longrightarrow\;\; \tau_{rx} = \frac{r}{2}\,\pd{p}{x}`,
    vars: [
      { sym: md`p`, desc: 'pressure on the upstream end face', units: md`\mathrm{Pa}` },
      { sym: md`\pd{p}{x}`, desc: 'axial pressure gradient (constant in fully developed flow)', units: md`\mathrm{Pa/m}` },
      { sym: md`r`, desc: 'radius of the fluid cylinder', units: md`\mathrm{m}` },
      { sym: md`dx`, desc: 'length of the cylinder', units: md`\mathrm{m}` },
      { sym: md`\tau_{rx}`, desc: md`shear stress on the cylinder's side (normal $+r$), positive in $+x$`, units: md`\mathrm{Pa}` },
    ],
    conditions: [
      'fully developed (no change of momentum flux between the end faces) and steady',
      'horizontal pipe (no weight component along x)',
      'no assumption about the fluid or the regime — valid for laminar and turbulent (time-mean) flow',
    ],
    use: md`A one-line way to reach Eq. 8.15 without the integration constant: the cylinder includes the axis, so nothing singular can appear. Supplementary derivation (Fox derives it in §8.3, not in this excerpt).`,
  },
  {
    id: 'tau-general',
    name: 'Shear stress from the friction–pressure balance',
    tag: '8.10',
    tex: md`\tau_{rx} = \frac{r}{2}\left(\pd{p}{x}\right) + \frac{c_1}{r}`,
    vars: [
      { sym: md`\tau_{rx}`, desc: md`shear stress on a surface whose normal points in $r$, acting in $x$`, units: md`\mathrm{Pa}` },
      { sym: md`r`, desc: 'radial coordinate from the centreline', units: md`\mathrm{m}` },
      { sym: md`\pd{p}{x}`, desc: 'axial pressure gradient, constant in fully developed flow', units: md`\mathrm{Pa/m}` },
      { sym: md`c_1`, desc: 'constant of integration', units: md`\mathrm{N/m}` },
    ],
    conditions: ['fully developed flow in a horizontal circular pipe', 'obtained in §8.3 from a balance between friction and pressure forces on an annular element'],
    use: md`Start here, then remove $c_1$: the stress cannot be infinite on the centreline, so $c_1 = 0$.`,
    src: { doc: 'fox', pages: '293', note: 'Eq. (8.10)' },
  },
  {
    id: 'tau-linear',
    name: 'Linear shear-stress distribution',
    key: true,
    tag: '8.15',
    tex: md`\tau_{rx} = \frac{r}{2}\,\pd{p}{x}`,
    vars: [
      { sym: md`\tau_{rx}`, desc: 'shear stress at radius r (time-mean total stress in turbulent flow)', units: md`\mathrm{Pa}` },
      { sym: md`r`, desc: 'radial position, 0 on the axis, R at the wall', units: md`\mathrm{m}` },
      { sym: md`\pd{p}{x}`, desc: 'axial pressure gradient (negative for flow in +x)', units: md`\mathrm{Pa/m}` },
    ],
    conditions: [
      'fully developed flow in a horizontal circular pipe',
      '**both laminar and turbulent** flow — no stress–strain law was used',
      md`$c_1 = 0$ because $\tau_{rx}$ must stay finite at $r = 0$`,
    ],
    use: md`The stress is **zero on the centreline and maximum at the wall**, varying linearly in between. For flow in $+x$, $\pd{p}{x} < 0$, so $\tau_{rx} < 0$: the slower outer fluid drags the inner core backwards.`,
    src: { doc: 'fox', pages: '293', note: 'Eq. (8.15)' },
  },
  {
    id: 'tau-wall',
    name: 'Wall shear stress',
    key: true,
    tag: '8.16',
    tex: md`\tau_w = -\big[\tau_{rx}\big]_{r=R} = -\frac{R}{2}\,\pd{p}{x}`,
    vars: [
      { sym: md`\tau_w`, desc: 'shear stress exerted by the fluid on the wall (equal and opposite to the fluid stress at the wall)', units: md`\mathrm{Pa}` },
      { sym: md`R`, desc: 'pipe radius, D/2', units: md`\mathrm{m}` },
      { sym: md`\pd{p}{x}`, desc: 'axial pressure gradient', units: md`\mathrm{Pa/m}` },
    ],
    conditions: ['fully developed, horizontal, circular pipe; laminar or turbulent'],
    use: md`Measure the pressure gradient → get the wall stress (or the reverse). With $\pd{p}{x} < 0$, $\tau_w > 0$: the fluid pulls the wall downstream.`,
    src: { doc: 'fox', pages: '293', note: 'Eq. (8.16)' },
  },
  {
    id: 'tau-wall-dp',
    name: 'Wall stress from a measured pressure drop',
    tex: md`\tau_w = \frac{R\,\Delta p}{2L} = \frac{D\,\Delta p}{4L}, \qquad \frac{\lvert\tau_{rx}\rvert}{\tau_w} = \frac{r}{R} = 1 - \frac{y}{R}`,
    vars: [
      { sym: md`\Delta p`, desc: md`pressure drop over length $L$, so $\pd{p}{x} = -\Delta p/L$`, units: md`\mathrm{Pa}` },
      { sym: md`L`, desc: 'length over which the drop is measured', units: md`\mathrm{m}` },
      { sym: md`y = R - r`, desc: 'distance from the wall', units: md`\mathrm{m}` },
    ],
    conditions: ['same as Eqs. 8.15–8.16 (fully developed, horizontal, constant area)', 'supplementary rearrangement — not printed in the excerpt'],
    use: md`The form most used in calculations. Also the bridge to Fig. 8.8, which plots stresses against $y/R$ and divides by $\tau_w$.`,
  },
  {
    id: 'tau-total',
    name: 'Total shear stress in turbulent flow',
    key: true,
    tag: '8.17',
    tex: md`\tau = \tau_{\text{lam}} + \tau_{\text{turb}} = \mu\,\frac{d\bar u}{dy} - \rho\,\overline{u'v'}`,
    vars: [
      { sym: md`\tau`, desc: 'total (time-mean) shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\tau_{\text{lam}} = \mu\,d\bar u/dy`, desc: 'viscous ("laminar") stress from the mean velocity gradient', units: md`\mathrm{Pa}` },
      { sym: md`\tau_{\text{turb}} = -\rho\,\overline{u'v'}`, desc: 'turbulent or **Reynolds stress** — apparent stress from momentum carried by fluctuations', units: md`\mathrm{Pa}` },
      { sym: md`\bar u`, desc: 'time-mean axial velocity', units: md`\mathrm{m/s}` },
      { sym: md`y`, desc: md`distance from the wall, $y = R - r$`, units: md`\mathrm{m}` },
      { sym: md`u',\ v'`, desc: 'fluctuating velocity components in x (axial) and y (wall-normal)', units: md`\mathrm{m/s}` },
      { sym: md`\overline{u'v'}`, desc: 'time average of the product of the fluctuations (negative in pipe flow)', units: md`\mathrm{m^2/s^2}` },
      { sym: md`\mu,\ \rho`, desc: 'dynamic viscosity and density', units: md`\mathrm{Pa\,s},\ \mathrm{kg/m^3}` },
    ],
    conditions: [
      md`turbulent flow written as mean plus fluctuation, $u = \bar u + u'$ (Reynolds decomposition)`,
      md`the sum $\tau$ still obeys the linear law of Eq. 8.15; only the **split** between the two parts changes across the pipe`,
      md`$u'$ and $v'$ are negatively correlated, so $-\rho\,\overline{u'v'} > 0$ — do not misread the minus sign`,
    ],
    use: md`Near the wall the Reynolds stress vanishes and $\tau \approx \mu\,d\bar u/dy$; in the core almost all of $\tau$ is Reynolds stress (Fig. 8.8). There is **no** universal law linking $-\rho\,\overline{u'v'}$ to $\bar u$, which is why turbulent results are semi-empirical.`,
    src: { doc: 'fox', pages: '293', note: 'Eq. (8.17)' },
  },
  {
    id: 'tau-wall-visc',
    name: 'Wall shear stress from the velocity gradient at the wall',
    tex: md`\tau_w = \mu\left(\frac{d\bar u}{dy}\right)_{y=0}`,
    vars: [
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`(d\bar u/dy)_{y=0}`, desc: 'slope of the mean velocity profile at the wall', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [
      md`at the wall the no-slip condition kills $\bar u$, $u'$ and $v'$, so $\tau_{\text{turb}} = 0$ there`,
      'laminar or turbulent flow',
    ],
    use: md`Even in fully turbulent flow, friction is transmitted to the wall by **viscosity**, through the steep mean-velocity gradient in the thin wall layer.`,
    src: F294,
  },
  {
    id: 're-u',
    name: 'Centreline Reynolds number used in Fig. 8.8',
    tex: md`Re_U = \frac{U D}{\nu}`,
    vars: [
      { sym: md`U`, desc: '**centreline** velocity (not the average velocity)', units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['labels the experimental data of Laufer in Fig. 8.8 (Re_U = 50 000 and 500 000)'],
    use: md`Because $U > \bar V$ in pipe flow, $Re_U$ is larger than $\Rey = \bar VD/\nu$ for the same flow — never compare $Re_U$ directly with 2300.`,
    src: { doc: 'fox', pages: '294', note: 'Fig. 8.8' },
  },
]

/* -------------------------------------------------------------------------------------------- examples */

export const examples: ExampleDef[] = [
  {
    id: 'ex-transition-25mm',
    concept: 'laminar-turbulent',
    title: 'Transition speed for water in a 25 mm pipe',
    src: F276,
    solutionBy: 'platform',
    difficulty: 1,
    given: md`Water flows in a pipe of diameter $D = 25$ mm. Take $\nu = 1.0\times10^{-6}$ m²/s (about 20 °C). Fox states that transition occurs at $\Rey \approx 2300$, i.e. at $\bar V \approx 0.091$ m/s.`,
    find: md`The average velocity and the flow rate at which the flow reaches $\Rey = 2300$.`,
    assumptions: md`Normal (not disturbance-free) conditions; incompressible flow.`,
    steps: [
      { title: 'Solve Re for the velocity', md: md`$\Rey = \bar VD/\nu \;\Rightarrow\; \bar V = \Rey\,\nu/D$` },
      { title: 'Substitute (SI units)', md: md`$\bar V = \dfrac{2300 \times 1.0\times10^{-6}\ \text{m}^2/\text{s}}{0.025\ \text{m}} = 0.092$ m/s` },
      { title: 'Compare with the book', md: md`Fox quotes 0.091 m/s, which corresponds to $\nu \approx 0.99\times10^{-6}$ m²/s — the difference is only the property value used.` },
      {
        title: 'Flow rate',
        md: md`$A = \pi D^2/4 = \pi(0.025)^2/4 = 4.91\times10^{-4}$ m², so $Q = \bar VA = 0.092 \times 4.91\times10^{-4} = 4.5\times10^{-5}$ m³/s $= 0.045$ L/s (about 2.7 L/min).`,
      },
    ],
    answer: md`$\bar V \approx 0.092$ m/s (book: 0.091 m/s); $Q \approx 0.045$ L/s.`,
    insight: 'A gently running kitchen tap already exceeds this: almost all water-pipe flows are turbulent.',
  },
  {
    id: 'ex-same-pipe',
    concept: 'laminar-turbulent',
    title: 'Same pipe, same speed, three fluids',
    difficulty: 2,
    given: md`A 25 mm pipe carries $\bar V = 0.5$ m/s of (i) water, $\rho = 998$ kg/m³, $\mu = 1.0\times10^{-3}$ Pa·s; (ii) SAE 30 motor oil, $\rho = 891$ kg/m³, $\mu = 0.29$ Pa·s; (iii) air, $\rho = 1.20$ kg/m³, $\mu = 1.81\times10^{-5}$ Pa·s (typical 20 °C values).`,
    find: md`$\Rey$ and the regime for each fluid.`,
    steps: [
      { title: 'Water', md: md`$\Rey = \dfrac{998 \times 0.5 \times 0.025}{1.0\times10^{-3}} = 12\,475 \approx 1.25\times10^4$ → **turbulent**` },
      { title: 'Motor oil', md: md`$\Rey = \dfrac{891 \times 0.5 \times 0.025}{0.29} = 38.4$ → **laminar** (by a wide margin)` },
      { title: 'Air', md: md`$\Rey = \dfrac{1.20 \times 0.5 \times 0.025}{1.81\times10^{-5}} = 829$ → **laminar**` },
      {
        title: 'Interpret',
        md: md`Oil is laminar because its high viscosity damps fluctuations. Air is laminar even though its viscosity is 55 times smaller than water's, because its **density** is about 830 times smaller — the inertia forces that feed fluctuations are tiny. What matters is the ratio $\nu = \mu/\rho$: $1.0\times10^{-6}$ (water), $3.3\times10^{-4}$ (oil), $1.5\times10^{-5}$ m²/s (air).`,
      },
    ],
    answer: md`Water $\Rey \approx 12\,500$ (turbulent); oil $\Rey \approx 38$ (laminar); air $\Rey \approx 830$ (laminar).`,
    insight: 'High viscosity keeps a flow laminar; high density pushes it towards turbulence — Re combines both.',
  },
  {
    id: 'ex-lab-chip',
    concept: 'laminar-turbulent',
    title: 'Reynolds number in a lab-on-a-chip mixer',
    src: { doc: 'fox', pages: '275', note: 'Case Study data' },
    solutionBy: 'platform',
    difficulty: 1,
    given: md`From the Fox case study (p. 275): average velocity less than 2 mm/s in ducts about 200 μm wide, flow rate about 25 nL/s. Treat the liquid as water, $\nu \approx 1.0\times10^{-6}$ m²/s, and use the duct width as the length scale.`,
    find: md`An order-of-magnitude $\Rey$, and whether a square $200\ \mu$m duct is consistent with the quoted speed.`,
    steps: [
      { title: 'Reynolds number (upper bound)', md: md`$\Rey \approx \dfrac{\bar V D}{\nu} = \dfrac{(2\times10^{-3})(200\times10^{-6})}{1.0\times10^{-6}} = 0.4$` },
      { title: 'Check the speed', md: md`For a $200 \times 200\ \mu$m duct: $\bar V = Q/A = \dfrac{25\times10^{-12}\ \text{m}^3/\text{s}}{(200\times10^{-6}\ \text{m})^2} = 6.3\times10^{-4}$ m/s $= 0.63$ mm/s $< 2$ mm/s ✓` },
      { title: 'Conclusion', md: md`$\Rey \sim 0.1$–$0.4$: about four orders of magnitude below 2300. Such flows are inherently laminar; mixing must come from geometry, long channels (molecular diffusion), moving parts, or **pulsing** the inflow.` },
    ],
    answer: md`$\Rey \lesssim 0.4$ — deeply laminar, so turbulence cannot be relied on to mix.`,
    insight: 'At micro scales viscosity wins completely; mixing has to be engineered.',
  },
  {
    id: 'ex-entrance-max',
    concept: 'entrance-length',
    title: 'How long can a laminar entrance region be?',
    src: F277,
    difficulty: 1,
    given: md`Laminar pipe flow, Eq. 8.1: $L/D \simeq 0.06\,\Rey$; laminar flow is expected only for $\Rey < 2300$.`,
    find: md`The largest laminar entrance length, in diameters.`,
    steps: [
      { title: 'Write Eq. 8.1 for L', md: md`$L \simeq 0.06\,\Rey\,D$` },
      { title: 'Insert the largest laminar Re', md: md`$L \le (0.06)(2300)\,D = 138\,D$` },
    ],
    answer: md`$L_{\max} \approx 138\,D$ — nearly 140 pipe diameters.`,
    insight: 'Laminar flows need very long pipes to "forget" their inlet; many short laboratory tubes never become fully developed.',
  },
  {
    id: 'ex-entrance-oil',
    concept: 'entrance-length',
    title: 'Is the oil flow fully developed at the gauge?',
    difficulty: 2,
    given: md`Oil flows at $\Rey = 1500$ in a tube of $D = 10$ mm. A pressure gauge that assumes fully developed flow is mounted 2.0 m downstream of a smooth inlet.`,
    find: md`The entrance length and whether the gauge location is acceptable.`,
    steps: [
      { title: 'Regime', md: md`$\Rey = 1500 < 2300$ → laminar, so Eq. 8.1 applies.` },
      { title: 'Entrance length', md: md`$L/D = 0.06 \times 1500 = 90$, so $L = 90 \times 0.010 = 0.90$ m.` },
      { title: 'Compare', md: md`$2.0\ \text{m} > 0.90$ m: the gauge is about 200 diameters downstream, well inside the fully developed region.` },
    ],
    answer: md`$L \approx 0.90$ m (90 $D$); the gauge at 2.0 m sees fully developed flow.`,
    insight: 'Always compare the distance from the inlet with L before using fully-developed formulas.',
  },
  {
    id: 'ex-entrance-turb',
    concept: 'entrance-length',
    title: 'Entrance length in a turbulent water line',
    difficulty: 2,
    given: md`Water ($\nu = 1.0\times10^{-6}$ m²/s) flows at $\bar V = 2$ m/s in a pipe of $D = 50$ mm.`,
    find: md`The regime and the distances needed for (a) a fully developed mean profile, (b) fully developed turbulence.`,
    steps: [
      { title: 'Regime', md: md`$\Rey = \dfrac{2 \times 0.05}{1.0\times10^{-6}} = 1.0\times10^5 \gg 2300$ → turbulent.` },
      { title: 'Why Eq. 8.1 is not used', md: md`Eq. 8.1 is laminar only; blindly using it would give $L = 0.06 \times 10^5 \times 0.05 = 300$ m — absurd.` },
      { title: '(a) Mean profile', md: md`$L \approx 25$–$40\,D = 25 \times 0.05$ to $40 \times 0.05 = 1.25$–$2.0$ m.` },
      { title: '(b) Turbulence details', md: md`$\gtrsim 80\,D = 80 \times 0.05 = 4.0$ m or more.` },
    ],
    answer: md`Turbulent ($\Rey = 10^5$); mean profile developed after about 1.25–2.0 m; turbulence structure after 4 m or more.`,
    insight: 'Turbulent mixing thickens the boundary layer fast, so turbulent entrance lengths are much shorter than the laminar maximum of 138 D.',
  },
  {
    id: 'ex-wall-shear',
    concept: 'shear-stress-distribution',
    title: 'Wall and interior shear stress from a pressure drop',
    difficulty: 2,
    given: md`Fully developed water flow ($\rho = 998$ kg/m³) in a horizontal pipe of $D = 50$ mm. The pressure falls by $\Delta p = 2.4$ kPa over $L = 10$ m.`,
    find: md`$\pd{p}{x}$, $\tau_w$, the stress at $r = R/2$, and $u_* = \sqrt{\tau_w/\rho}$.`,
    steps: [
      { title: 'Pressure gradient', md: md`$\pd{p}{x} = -\Delta p/L = -2400/10 = -240$ Pa/m (constant along a fully developed pipe).` },
      { title: 'Wall shear stress, Eq. 8.16', md: md`$\tau_w = -\dfrac{R}{2}\pd{p}{x} = -\dfrac{0.025}{2}(-240) = 3.0$ Pa. Check: $D\Delta p/(4L) = 0.05 \times 2400/40 = 3.0$ Pa ✓` },
      { title: 'Stress at r = R/2, Eq. 8.15', md: md`$\tau_{rx} = \dfrac{r}{2}\pd{p}{x} = \dfrac{0.0125}{2}(-240) = -1.5$ Pa, i.e. magnitude $\tau_w/2$ (linear law). The minus sign: the outer fluid pulls the inner core in $-x$.` },
      { title: 'Friction velocity (used in the next topics)', md: md`$u_* = \sqrt{3.0/998} = 0.055$ m/s.` },
    ],
    answer: md`$\pd{p}{x} = -240$ Pa/m; $\tau_w = 3.0$ Pa; $\tau_{rx}(R/2) = -1.5$ Pa; $u_* \approx 0.055$ m/s.`,
    insight: 'None of this needed to know whether the flow is laminar or turbulent — the linear stress law is a pure force balance.',
  },
  {
    id: 'ex-laminar-dp',
    concept: 'shear-stress-distribution',
    title: 'Laminar pressure drop and wall stress for an oil line',
    difficulty: 2,
    given: md`Oil, $\mu = 0.10$ Pa·s, $\rho = 900$ kg/m³, flows at $Q = 0.10$ L/s through a horizontal tube, $D = 20$ mm, $L = 5$ m (fully developed).`,
    find: md`$\Rey$, $\Delta p$ and $\tau_w$.`,
    steps: [
      { title: 'Velocity and Re', md: md`$A = \pi(0.02)^2/4 = 3.14\times10^{-4}$ m², $\bar V = 1.0\times10^{-4}/3.14\times10^{-4} = 0.318$ m/s; $\Rey = \dfrac{900 \times 0.318 \times 0.02}{0.10} = 57$ → laminar ✓` },
      { title: 'Pressure drop', md: md`$\Delta p = \dfrac{128\,\mu LQ}{\pi D^4} = \dfrac{128 \times 0.10 \times 5 \times 1.0\times10^{-4}}{\pi (0.02)^4} = \dfrac{6.4\times10^{-3}}{5.03\times10^{-7}} = 1.27\times10^4$ Pa $= 12.7$ kPa` },
      { title: 'Wall stress from the force balance', md: md`$\tau_w = \dfrac{D\,\Delta p}{4L} = \dfrac{0.02 \times 12\,732}{4 \times 5} = 12.7$ Pa` },
      { title: 'Cross-check (supplementary)', md: md`For laminar flow $\tau_w = 8\mu\bar V/D = 8 \times 0.10 \times 0.318/0.02 = 12.7$ Pa ✓ — the stress law and the force balance agree.` },
    ],
    answer: md`$\Rey \approx 57$; $\Delta p \approx 12.7$ kPa; $\tau_w \approx 12.7$ Pa.`,
    insight: 'For laminar flow, Δp is predicted from theory; the force balance then converts it into a wall stress.',
  },
  {
    id: 'ex-fig88-read',
    concept: 'shear-stress-distribution',
    title: 'Reading Fig. 8.8: who carries the stress at mid-radius?',
    src: F88,
    solutionBy: 'platform',
    difficulty: 3,
    given: md`Fully developed turbulent pipe flow with $\tau_w = 3.0$ Pa. Fig. 8.8 (Laufer's data) gives, at $y/R \approx 0.49$, $-\rho\overline{u'v'}/\tau_w \approx 0.47$ ($Re_U = 500\,000$) and $\approx 0.55$ ($Re_U = 50\,000$) — values digitised from the figure, about ±0.01.`,
    find: md`The total stress, the Reynolds stress and the viscous stress at $y/R = 0.49$.`,
    steps: [
      { title: 'Total stress from Eq. 8.15', md: md`$\lvert\tau\rvert/\tau_w = r/R = 1 - y/R = 0.51$, so $\lvert\tau\rvert = 0.51 \times 3.0 = 1.53$ Pa.` },
      { title: 'Reynolds stress from the data', md: md`$0.47$–$0.55 \times 3.0 = 1.41$–$1.65$ Pa — scattered around the total line.` },
      { title: 'Viscous part by difference (Eq. 8.17)', md: md`$\mu\,d\bar u/dy = \tau - \tau_{\text{turb}} \approx 0$ within the scatter of the data: at mid-radius essentially **all** the stress is Reynolds stress.` },
    ],
    answer: md`$\lvert\tau\rvert \approx 1.5$ Pa, practically all of it Reynolds stress; the viscous stress is negligible there.`,
    insight: 'In the core of a turbulent pipe the friction is almost entirely turbulent momentum transport; viscosity matters only in the thin wall layer.',
  },
]

/* -------------------------------------------------------------------------------------------- practice */

export const practice: PracticeDef[] = [
  {
    id: 'pr-lt-air-duct',
    concept: 'laminar-turbulent',
    difficulty: 1,
    q: md`Air ($\nu = 1.5\times10^{-5}$ m²/s) flows in a 100 mm diameter duct. Above what average velocity would you expect the flow to be turbulent under normal conditions?`,
    hint: md`Set $\Rey = \bar VD/\nu = 2300$ and solve for $\bar V$.`,
    answer: md`$\bar V \approx 0.35$ m/s`,
    solution: md`$\bar V = \Rey\,\nu/D = 2300 \times 1.5\times10^{-5}/0.10 = 0.345$ m/s. Typical air-conditioning ducts run at several m/s, so — as Fox notes — they are turbulent even though laminar flow would be cheaper to pump.`,
    check: [{ label: 'V̄', value: 0.345, units: 'm/s' }],
  },
  {
    id: 'pr-lt-oil-water',
    concept: 'laminar-turbulent',
    difficulty: 2,
    q: md`SAE 30 motor oil ($\rho = 891$ kg/m³, $\mu = 0.29$ Pa·s) and water ($\rho = 998$ kg/m³, $\mu = 1.0\times10^{-3}$ Pa·s) each flow at $\bar V = 2$ m/s in a 25 mm pipe. Find $\Rey$ for the oil and state both regimes.`,
    hint: md`$\Rey = \rho\bar VD/\mu$; compare with 2300.`,
    answer: md`Oil: $\Rey \approx 154$ (laminar). Water: $\Rey \approx 49\,900$ (turbulent).`,
    solution: md`Oil: $\Rey = 891 \times 2 \times 0.025/0.29 = 153.6$ → laminar. Water: $\Rey = 998 \times 2 \times 0.025/1.0\times10^{-3} = 49\,900$ → turbulent. Same pipe and speed, but the oil's viscosity is 290 times larger, so viscous forces damp out fluctuations — exactly Fox's motor-oil vs water comparison.`,
    check: [{ label: 'Re (oil)', value: 153.6 }],
  },
  {
    id: 'pr-lt-max-q',
    concept: 'laminar-turbulent',
    difficulty: 2,
    q: md`What is the largest volume flow rate (in L/s) of water ($\nu = 1.0\times10^{-6}$ m²/s) that a 25 mm pipe can carry while staying laminar under normal conditions?`,
    hint: md`Find $\bar V$ at $\Rey = 2300$, then $Q = \bar V\,\pi D^2/4$.`,
    answer: md`$Q \approx 0.045$ L/s (about 2.7 L/min)`,
    solution: md`$\bar V = 2300 \times 1.0\times10^{-6}/0.025 = 0.092$ m/s; $A = \pi(0.025)^2/4 = 4.909\times10^{-4}$ m²; $Q = 0.092 \times 4.909\times10^{-4} = 4.52\times10^{-5}$ m³/s $= 0.0452$ L/s ≈ 2.7 L/min.`,
    check: [{ label: 'Q', value: 0.0452, units: 'L/s' }],
  },
  {
    id: 'pr-lt-mach',
    concept: 'laminar-turbulent',
    difficulty: 2,
    q: md`The analysis of Fox Ch. 8 assumes incompressible flow, which for gases requires $M < 0.3$. Air at 20 °C ($c = 343$ m/s) flows in a duct at 80 m/s. Compute the Mach number and decide whether the incompressible pipe-flow results may be used. What about 120 m/s?`,
    hint: md`$M = \bar V/c$ (supplementary definition).`,
    answer: md`$M = 0.23$ at 80 m/s (incompressible OK); $M = 0.35$ at 120 m/s (not OK).`,
    solution: md`$M = 80/343 = 0.233 < 0.3$ → treat as incompressible. $M = 120/343 = 0.350 > 0.3$ → compressibility matters; this is beyond the scope of the chapter. Consistent with Fox's rule of thumb that $M = 0.3$ in air is about 100 m/s.`,
    check: [{ label: 'M at 80 m/s', value: 0.233 }],
  },
  {
    id: 'pr-el-oil',
    concept: 'entrance-length',
    difficulty: 1,
    q: md`Oil flows at $\Rey = 800$ in a 15 mm tube. How far from the inlet does the flow become fully developed?`,
    hint: md`Laminar → Eq. 8.1.`,
    answer: md`$L \approx 0.72$ m`,
    solution: md`$\Rey = 800 < 2300$ → laminar. $L = 0.06\,\Rey\,D = 0.06 \times 800 \times 0.015 = 0.72$ m (48 $D$).`,
    check: [{ label: 'L', value: 0.72, units: 'm' }],
  },
  {
    id: 'pr-el-water-q',
    concept: 'entrance-length',
    difficulty: 2,
    q: md`Water ($\nu = 1.0\times10^{-6}$ m²/s) flows at $Q = 0.020$ L/s through a 20 mm tube. Find $\Rey$ and the entrance length.`,
    hint: md`$\bar V = Q/A$ first; remember 1 L = $10^{-3}$ m³.`,
    answer: md`$\Rey \approx 1270$ (laminar); $L \approx 1.53$ m (≈ 76 $D$)`,
    solution: md`$A = \pi(0.02)^2/4 = 3.142\times10^{-4}$ m²; $\bar V = 2.0\times10^{-5}/3.142\times10^{-4} = 0.0637$ m/s. $\Rey = 0.0637 \times 0.02/1.0\times10^{-6} = 1273$ → laminar. $L/D = 0.06 \times 1273 = 76.4$, $L = 76.4 \times 0.02 = 1.53$ m.`,
    check: [
      { label: 'Re', value: 1273 },
      { label: 'L', value: 1.528, units: 'm' },
    ],
  },
  {
    id: 'pr-el-turb-rig',
    concept: 'entrance-length',
    difficulty: 2,
    q: md`A test rig must measure turbulence statistics (velocity fluctuations) in fully developed pipe flow at $\Rey = 5\times10^4$ in a 40 mm pipe. What is the minimum straight length upstream of the measuring station? Where would the mean profile already be developed?`,
    hint: md`Turbulent: 25–40 $D$ for the mean profile, 80 $D$ or more for the turbulence details.`,
    answer: md`At least about 3.2 m (80 $D$); the mean profile is developed after 1.0–1.6 m.`,
    solution: md`Turbulent flow, so Eq. 8.1 does not apply. Mean profile: $25$–$40\,D = 1.0$–$1.6$ m. Turbulence details: $\gtrsim 80\,D = 80 \times 0.04 = 3.2$ m — use at least this (more is safer).`,
    check: [{ label: 'minimum length', value: 3.2, units: 'm' }],
  },
  {
    id: 'pr-el-design',
    concept: 'entrance-length',
    difficulty: 3,
    q: md`A laminar-flow viscometer uses a 2.0 m long tube of 10 mm diameter. The designer wants the entrance region to occupy at most 10 % of the tube. What is the largest Reynolds number allowed?`,
    hint: md`Require $0.06\,\Rey\,D \le 0.1 \times 2.0$ m.`,
    answer: md`$\Rey \le 333$`,
    solution: md`$0.06\,\Rey \times 0.010 \le 0.20$ → $\Rey \le 0.20/(0.06 \times 0.010) = 333$. Above this the developing region (where the pressure drop is larger than in fully developed flow) would spoil more than 10 % of the measurement length.`,
    check: [{ label: 'Re max', value: 333 }],
  },
  {
    id: 'pr-ss-wall',
    concept: 'shear-stress-distribution',
    difficulty: 1,
    q: md`In a horizontal 100 mm pipe the pressure drops by 500 Pa over 20 m of fully developed flow. Find the wall shear stress and the shear-stress magnitude at $r = 25$ mm.`,
    hint: md`$\tau_w = D\Delta p/(4L)$, then the linear law $\lvert\tau\rvert = \tau_w\,r/R$.`,
    answer: md`$\tau_w = 0.625$ Pa; $\lvert\tau\rvert(25\ \text{mm}) = 0.3125$ Pa`,
    solution: md`$\tau_w = D\Delta p/(4L) = 0.10 \times 500/(4 \times 20) = 0.625$ Pa. At $r = 25$ mm $= R/2$: $\lvert\tau\rvert = (r/2)\lvert\partial p/\partial x\rvert = (0.025/2)(500/20) = 0.3125$ Pa $= \tau_w/2$. Valid for laminar or turbulent flow.`,
    check: [
      { label: 'τ_w', value: 0.625, units: 'Pa' },
      { label: '|τ| at 25 mm', value: 0.3125, units: 'Pa' },
    ],
  },
  {
    id: 'pr-ss-gradient',
    concept: 'shear-stress-distribution',
    difficulty: 2,
    q: md`A wall-shear sensor reads $\tau_w = 2.0$ Pa in fully developed flow in a horizontal 80 mm pipe. What pressure gradient drives the flow, and what pressure drop would you measure over 50 m?`,
    hint: md`Invert Eq. 8.16: $\pd{p}{x} = -2\tau_w/R$.`,
    answer: md`$\pd{p}{x} = -100$ Pa/m; $\Delta p = 5.0$ kPa over 50 m`,
    solution: md`$\pd{p}{x} = -2\tau_w/R = -2 \times 2.0/0.040 = -100$ Pa/m. Over 50 m: $\Delta p = 100 \times 50 = 5000$ Pa $= 5.0$ kPa.`,
    check: [{ label: '|∂p/∂x|', value: 100, units: 'Pa/m' }],
  },
  {
    id: 'pr-ss-laminar-dp',
    concept: 'shear-stress-distribution',
    difficulty: 2,
    q: md`Water ($\mu = 1.0\times10^{-3}$ Pa·s, $\rho = 998$ kg/m³) flows at $Q = 1.0$ mL/s through a horizontal tube with $D = 5$ mm and $L = 2$ m. Check the regime, then compute $\Delta p$ and $\tau_w$.`,
    hint: md`Laminar → $\Delta p = 128\mu LQ/(\pi D^4)$; then $\tau_w = D\Delta p/(4L)$.`,
    answer: md`$\Rey \approx 254$ (laminar); $\Delta p \approx 130$ Pa; $\tau_w \approx 0.081$ Pa`,
    solution: md`$\bar V = 1.0\times10^{-6}/[\pi(0.005)^2/4] = 0.0509$ m/s; $\Rey = 998 \times 0.0509 \times 0.005/1.0\times10^{-3} = 254$ → laminar. $\Delta p = \dfrac{128 \times 1.0\times10^{-3} \times 2 \times 1.0\times10^{-6}}{\pi(0.005)^4} = \dfrac{2.56\times10^{-7}}{1.963\times10^{-9}} = 130.4$ Pa. $\tau_w = 0.005 \times 130.4/(4 \times 2) = 0.0815$ Pa.`,
    check: [
      { label: 'Δp', value: 130.4, units: 'Pa' },
      { label: 'τ_w', value: 0.0815, units: 'Pa' },
    ],
  },
  {
    id: 'pr-ss-fig88',
    concept: 'shear-stress-distribution',
    difficulty: 3,
    q: md`In fully developed turbulent pipe flow $\tau_w = 3.0$ Pa. At $y/R = 0.28$ Fig. 8.8 shows $-\rho\overline{u'v'}/\tau_w \approx 0.71$–$0.725$. Compute the total shear stress there and estimate the viscous share.`,
    hint: md`Total stress: $\lvert\tau\rvert = \tau_w(1 - y/R)$. Viscous part by difference (Eq. 8.17).`,
    answer: md`$\lvert\tau\rvert = 2.16$ Pa; Reynolds stress ≈ 2.13–2.18 Pa, so the viscous part is ≈ 0 (within the data scatter)`,
    solution: md`$\lvert\tau\rvert = 3.0 \times (1 - 0.28) = 2.16$ Pa. Reynolds stress $= (0.71$–$0.725) \times 3.0 = 2.13$–$2.18$ Pa. Viscous stress $= \tau - \tau_{\text{turb}} \approx 0 \pm 0.03$ Pa: away from the wall layer, the friction is almost entirely Reynolds stress. Only very close to the wall ($y/R \to 0$, not resolved in Fig. 8.8) does the viscous term take over.`,
    check: [{ label: 'total |τ|', value: 2.16, units: 'Pa' }],
  },
  {
    id: 'pr-ss-sign',
    concept: 'shear-stress-distribution',
    difficulty: 3,
    q: md`Explain physically why $\overline{u'v'}$ is negative in pipe flow (with $y$ measured from the wall toward the axis), so that the Reynolds stress $-\rho\overline{u'v'}$ is positive. Why must it vanish at the wall?`,
    hint: 'Think of a fluid lump moving toward the axis (v′ > 0): does it arrive faster or slower than its new neighbours?',
    answer: md`Lumps moving away from the wall ($v' > 0$) come from slower fluid and arrive with $u' < 0$; lumps moving toward the wall ($v' < 0$) bring faster fluid, $u' > 0$. The product is mostly negative. At the wall no-slip forces $u' = v' = 0$, so the Reynolds stress is zero there.`,
    solution: md`The mean velocity $\bar u$ increases with $y$ (from 0 at the wall to $U$ on the axis). A lump displaced toward the axis ($v' > 0$) carries the lower momentum of its origin, so locally $u' < 0$; one displaced toward the wall ($v' < 0$) carries higher momentum, $u' > 0$. Either way $u'v' < 0$, so the time average $\overline{u'v'} < 0$ and $\tau_{\text{turb}} = -\rho\overline{u'v'} > 0$, adding to the viscous stress (both transfer momentum toward the wall). At the wall the no-slip condition holds for the instantaneous velocity, so $\bar u$, $u'$ and $v'$ all vanish; the wall suppresses the fluctuations and $\tau_{\text{turb}} \to 0$, leaving $\tau_w = \mu(d\bar u/dy)_{y=0}$.`,
  },
]

/* -------------------------------------------------------------------------------------------- quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-lt-viscous',
    concept: 'laminar-turbulent',
    difficulty: 1,
    src: F276,
    q: 'At the same average velocity and pipe diameter, which change makes the flow most likely to stay laminar?',
    options: [
      'Replacing water by a much more viscous liquid such as motor oil',
      'Replacing water by a denser liquid of the same viscosity',
      'Doubling the pipe diameter',
      'Roughening the pipe wall',
    ],
    answer: 0,
    explain:
      'Higher μ lowers Re = ρV̄D/μ: viscous forces damp out random fluctuations, so motor oil stays laminar even at relatively high flow rates. A denser fluid raises Re (larger inertia forces from the fluctuations), and a larger D also raises Re; wall roughness generates fluctuations rather than suppressing them.',
  },
  {
    id: 'q-lt-benchmark',
    concept: 'laminar-turbulent',
    difficulty: 1,
    src: F276,
    q: 'Under normal engineering conditions, at about what Reynolds number (based on average velocity and diameter) does pipe flow become turbulent?',
    options: ['2300', '100 000', '0.3', '500 000'],
    answer: 0,
    explain:
      'Re ≈ 2300 is the benchmark. Re ≈ 100 000 is what very carefully controlled, disturbance-free experiments achieved — not a design value. 0.3 is the Mach-number limit for incompressibility, not a Reynolds number.',
  },
  {
    id: 'q-lt-dye',
    concept: 'laminar-turbulent',
    difficulty: 2,
    src: F276,
    q: "In Reynolds' experiment, why does the dye filament disperse across the whole tube at high flow rates?",
    options: [
      'Small, high-frequency velocity fluctuations superimposed on the mean motion mix fluid particles of adjacent layers',
      'Molecular diffusion of the dye becomes faster at higher speeds',
      'The higher pressure drop pushes the dye toward the walls',
      'The no-slip condition stops holding at high flow rates',
    ],
    answer: 0,
    explain:
      'Turbulent flow carries random fluctuations on top of the mean motion; they cause macroscopic mixing between layers, so the dye is stretched, twisted and dispersed. Molecular diffusion is far too slow to explain this, and no-slip holds in turbulent flow too.',
  },
  {
    id: 'q-lt-chip',
    concept: 'laminar-turbulent',
    difficulty: 2,
    src: F275,
    q: 'True or false: in a lab-on-a-chip device the tiny channels make the flow turbulent, which is why the two fluids mix quickly.',
    options: ['True', 'False'],
    answer: 1,
    explain:
      'False. The extremely small geometry gives very low Re, so these flows are laminar (and surface tension matters). Two streams meeting steadily in a T junction do not mix; mixing must be engineered, for example by pulsing the inflow so that the interface stretches and folds.',
  },
  {
    id: 'q-el-fd',
    concept: 'entrance-length',
    difficulty: 1,
    src: F277,
    q: 'What does "fully developed" pipe flow mean?',
    options: [
      'The shape of the velocity profile no longer changes with distance x along the pipe',
      'The velocity is uniform across the pipe',
      'The pressure no longer changes along the pipe',
      'The boundary layer has just started to grow',
    ],
    answer: 0,
    explain:
      'Fully developed = the velocity-profile shape is independent of x. The pressure still falls (linearly) in fully developed flow — friction must be overcome — and the profile is far from uniform (parabolic in laminar flow).',
  },
  {
    id: 'q-el-core',
    concept: 'entrance-length',
    difficulty: 2,
    src: F277,
    q: 'In the entrance region, what happens to the velocity and pressure in the inviscid central core as the boundary layers grow?',
    options: [
      'The core velocity increases slightly and its pressure drops',
      'The core velocity decreases and its pressure rises',
      'The core velocity stays exactly U₀ and the pressure is constant',
      'The core velocity increases and its pressure rises',
    ],
    answer: 0,
    explain:
      'Mass conservation: fluid near the wall is slowed, so the core must speed up to carry the same Q. In the frictionless core Bernoulli applies, so higher speed means lower pressure. Velocity up with pressure up would violate Bernoulli in the core.',
  },
  {
    id: 'q-el-compare',
    concept: 'entrance-length',
    difficulty: 2,
    src: F277,
    q: 'Which flow needs the longer entrance length (in pipe diameters) for its mean velocity profile to develop?',
    options: [
      'Laminar flow at Re = 2000',
      'Turbulent flow at Re = 100 000',
      'Both need the same number of diameters',
      'Neither — entrance length depends only on the pipe length',
    ],
    answer: 0,
    explain:
      'Laminar: L/D ≃ 0.06 × 2000 = 120. Turbulent: the mean profile develops within 25–40 D because enhanced mixing makes the boundary layer grow faster. Higher Re does not mean longer entrance once the flow is turbulent; Eq. 8.1 is laminar-only.',
  },
  {
    id: 'q-el-max',
    concept: 'entrance-length',
    difficulty: 1,
    src: F277,
    q: 'Using Eq. 8.1, what is the longest entrance length expected for laminar pipe flow?',
    options: ['About 138 D', 'About 25 D', 'About 2300 D', 'About 6 D'],
    answer: 0,
    explain: 'L ≃ 0.06 Re D ≤ (0.06)(2300) D = 138 D, i.e. nearly 140 diameters. 25 D is the lower end of the turbulent range; 2300 D forgets the factor 0.06.',
  },
  {
    id: 'q-el-meet',
    concept: 'entrance-length',
    difficulty: 3,
    src: F277,
    q: 'In laminar entrance flow, the boundary layers growing from the wall have just met on the centreline. Is the flow fully developed at that station?',
    options: [
      'Not quite — the profile shape still changes slightly after the inviscid core disappears',
      'Yes — fully developed flow begins exactly where the boundary layers meet',
      'No — the flow is fully developed only once the pressure stops falling',
      'Yes, because the flow has become entirely viscous and the core velocity is now uniform',
    ],
    answer: 0,
    explain:
      'Fox notes that once the boundary layer reaches the centreline the flow is entirely viscous, but the velocity-profile shape still changes slightly afterwards; it is fully developed only when the shape no longer changes with x (in Fig. 8.1 the dashed edges meet before the end of the entrance length). The pressure keeps falling in fully developed flow, so "pressure stops falling" is never the criterion; and once the core is gone there is no uniform core velocity left.',
  },
  {
    id: 'q-ss-linear',
    concept: 'shear-stress-distribution',
    difficulty: 1,
    src: F293,
    q: 'In fully developed flow in a horizontal pipe, how does the shear stress vary across the pipe?',
    options: [
      'Linearly with r, from zero on the centreline to a maximum at the wall — for laminar and turbulent flow',
      'Linearly with r for laminar flow only; turbulent flow has a different shape',
      'Parabolically, like the laminar velocity profile',
      'It is uniform across the section and equal to τ_w',
    ],
    answer: 0,
    explain:
      'τ_rx = (r/2)∂p/∂x comes from a force balance alone, with no stress–strain law, so it holds for both regimes. The tempting distractor confuses the stress (linear) with the laminar velocity profile (parabolic).',
  },
  {
    id: 'q-ss-c1',
    concept: 'shear-stress-distribution',
    difficulty: 2,
    src: F293,
    q: 'Why is the integration constant c₁ in Eq. 8.10 set to zero?',
    options: [
      'Otherwise the term c₁/r would make the stress infinite on the centreline',
      'Because of the no-slip condition at the wall',
      'Because the wall shear stress must be zero',
      'Because the pressure gradient is constant',
    ],
    answer: 0,
    explain:
      'c₁/r blows up at r = 0, and the stress in the fluid cannot be infinite there; hence c₁ = 0 and Eq. 8.15 follows. No-slip is a velocity condition (used later for the velocity profile), and the wall stress is the maximum, not zero.',
  },
  {
    id: 'q-ss-wall',
    concept: 'shear-stress-distribution',
    difficulty: 2,
    src: F294,
    q: 'What is the Reynolds stress −ρ u′v′ (time-averaged) right at the pipe wall?',
    options: [
      'Zero, because no-slip forces u′ and v′ (as well as ū) to vanish at the wall',
      'Its maximum value, equal to τ_w',
      'Negative, opposing the viscous stress',
      'Equal to half of τ_w',
    ],
    answer: 0,
    explain:
      'The wall suppresses the fluctuations, so τ_turb → 0 as y → 0 and the wall stress is purely viscous: τ_w = μ(dū/dy) at y = 0. Fig. 8.8 does not resolve this because its data stop at y/R ≈ 0.08 — reading its trend to the wall gives the tempting wrong answer τ_w.',
  },
  {
    id: 'q-ss-sign',
    concept: 'shear-stress-distribution',
    difficulty: 2,
    src: F294,
    q: 'The turbulent stress is written τ_turb = −ρ u′v′ (overbar = time average). What is its sign in pipe flow, and why?',
    options: [
      'Positive, because u′ and v′ are negatively correlated',
      'Negative, because of the explicit minus sign',
      'Zero on average, because fluctuations average to zero',
      'Positive, because u′ and v′ are always both positive',
    ],
    answer: 0,
    explain:
      'Each fluctuation averages to zero, but their product does not: u′ and v′ are negatively correlated, so the average of u′v′ is negative and −ρ u′v′ > 0. Fluctuations take both signs, so "always positive" is wrong.',
  },
  {
    id: 'q-ss-reu',
    concept: 'shear-stress-distribution',
    difficulty: 3,
    src: F294,
    q: 'The data of Fig. 8.8 are labelled Re_U = 50 000 and 500 000. Which velocity defines Re_U?',
    options: ['The centreline velocity U', 'The average velocity V̄', 'The friction velocity u*', 'The inlet velocity U₀'],
    answer: 0,
    explain: 'Re_U = UD/ν uses the centreline velocity. Since U > V̄, Re_U exceeds the usual Re = V̄D/ν — do not compare it directly with 2300.',
  },
  {
    id: 'q-ss-factors',
    concept: 'shear-stress-distribution',
    difficulty: 1,
    src: F293,
    q: 'Fox lists three factors that tend to reduce the pressure in a pipe flow. Which of these is NOT one of them?',
    options: ['An increase in pipe diameter', 'A decrease in pipe area', 'An upward slope', 'Friction'],
    answer: 0,
    explain:
      'The three factors are a decrease in area (the fluid speeds up), an upward slope (it gains elevation) and friction. An increase in diameter slows the flow and tends to raise the pressure. Part B then isolates friction by considering horizontal, constant-area pipes.',
  },
]

/* -------------------------------------------------------------------------------------------- flashcards */

export const flashcards: Flashcard[] = [
  { id: 'fc-internal', front: 'What is an internal flow? Give examples.', back: 'A flow completely bounded by solid surfaces: pipes, ducts, nozzles, diffusers, sudden contractions and expansions, valves, fittings.', src: F276 },
  { id: 'fc-re', front: md`Reynolds number for pipe flow and the transition benchmark`, back: md`$\Rey = \rho\bar VD/\mu$ with the **average** velocity; turbulent above about $\Rey \approx 2300$ (laminar up to ≈ 100 000 only with great care).`, src: F276 },
  { id: 'fc-mechanism', front: 'Physical cause of turbulence in a pipe (Fox)', back: 'Viscous forces can no longer damp out random fluctuations (e.g. generated by wall roughness). High viscosity (oil) damps them; high density produces large inertia forces from them.', src: F276 },
  { id: 'fc-fd', front: 'Define fully developed flow and entrance length', back: 'Fully developed: the velocity-profile shape no longer changes with x. Entrance length: the distance from the entrance to where fully developed flow begins.', src: F277 },
  { id: 'fc-eq81', front: md`Entrance length — laminar and turbulent`, back: md`Laminar: $L/D \simeq 0.06\,\Rey$ (Eq. 8.1), at most $\approx 138\,D$. Turbulent: mean profile within 25–40 $D$; turbulence details 80 $D$ or more.`, src: F277 },
  { id: 'fc-core', front: 'Why does the core speed up in the entrance region?', back: 'No-slip slows the fluid in the growing boundary layers; with incompressible flow the same Q must pass, so the inviscid core accelerates and (Bernoulli) its pressure drops.', src: F277 },
  { id: 'fc-tau', front: md`Shear-stress distribution in fully developed pipe flow`, back: md`$\tau_{rx} = \tfrac{r}{2}\pd{p}{x}$ (Eq. 8.15): linear, zero on the axis, maximum at the wall — laminar **and** turbulent. $\tau_w = -\tfrac{R}{2}\pd{p}{x} = D\Delta p/(4L)$.`, src: F293 },
  { id: 'fc-total', front: md`Total stress in turbulent flow (Eq. 8.17)`, back: md`$\tau = \mu\,d\bar u/dy - \rho\overline{u'v'}$; the Reynolds stress is positive ($u'$, $v'$ negatively correlated) and dominates in the core.`, src: F293 },
  { id: 'fc-factors', front: 'Three factors that tend to reduce the pressure in a pipe flow', back: 'A decrease in pipe area, an upward slope, and friction. To isolate friction, Part B analyses horizontal, constant-area pipes; friction losses are split into major (constant-area sections) and minor (valves, elbows…) losses.', src: F293 },
  { id: 'fc-c1', front: md`Why is $c_1 = 0$ in Eq. 8.10, and what results?`, back: md`$c_1/r$ would make the stress infinite on the centreline, so $c_1 = 0$ and $\tau_{rx} = \tfrac{r}{2}\pd{p}{x}$ (Eq. 8.15) — linear in $r$ for laminar **and** turbulent fully developed flow.`, src: F293 },
  { id: 'fc-wall-layer', front: 'What is the wall layer?', back: md`The region very close to the wall where viscous shear dominates; the Reynolds stress falls to zero at the wall, so $\tau_w = \mu(d\bar u/dy)_{y=0}$. Between the wall layer and the core both stresses matter.`, src: F294 },
]

/* -------------------------------------------------------------------------------------------- takeaways */

export const takeaways: string[] = [
  md`**Internal flows** are completely bounded by walls (pipes, ducts, nozzles, valves…). Fox Ch. 8 treats them as **incompressible** — liquids, or gases with $M < 0.3$ (≈ 100 m/s in air).`,
  md`The regime depends primarily on $\Rey = \rho\bar VD/\mu$ (average velocity). **Benchmark: turbulent above $\Rey \approx 2300$**; disturbance-free experiments have stayed laminar to ≈ 100 000.`,
  md`Reynolds' dye experiment: laminar = one filament, flow in layers with no macroscopic mixing; turbulent = fluctuations on the mean motion disperse the dye through the whole tube.`,
  md`Viscosity damps fluctuations (oil stays laminar), density feeds them with inertia — $\Rey$ is the ratio of the two effects. Laminar flows can be solved analytically; turbulent ones need semi-empirical results and experiments.`,
  md`In the **entrance region** the wall boundary layers grow, the core speeds up (mass conservation) and its pressure drops (Bernoulli), until the layers meet on the axis; afterwards the profile shape still changes slightly.`,
  md`**Entrance length:** laminar $L/D \simeq 0.06\,\Rey$ (Eq. 8.1), up to ≈ 138 $D$; turbulent mean profile within 25–40 $D$, turbulence details 80 $D$ or more. Never use Eq. 8.1 for turbulent flow.`,
  md`A force balance on a fluid cylinder gives $\tau_{rx} = \tfrac{r}{2}\pd{p}{x}$ (Eq. 8.15): **linear**, zero on the axis, maximum at the wall, for **both** laminar and turbulent fully developed flow; $\tau_w = -\tfrac{R}{2}\pd{p}{x} = D\Delta p/(4L)$.`,
  md`Pressure in a pipe falls because of area decrease, upward slope and **friction**; friction losses are split into **major** (constant-area pipe) and **minor** (valves, elbows — sometimes larger!) losses.`,
  md`Turbulent total stress: $\tau = \mu\,d\bar u/dy - \rho\overline{u'v'}$ (Eq. 8.17). The Reynolds stress is positive and carries almost all of the friction in the core (Fig. 8.8), but it vanishes at the wall, where the **wall layer** is dominated by viscous shear.`,
  md`Exam traps: $Re_U$ (centreline $U$) ≠ $\Rey$ (average $\bar V$); $\tau_{rx} < 0$ but $\tau_w > 0$ for flow in $+x$; the laminar $\Delta p = 128\mu LQ/(\pi D^4)$ has no analytical turbulent counterpart.`,
]

/* -------------------------------------------------------------------------------------------- content */

export default function Content() {
  return (
    <>
      {/* ============================================================== Concept 1 */}
      <Concept id="laminar-turbulent">
        <Step kind="intro" src={[F275, F276]}>
          <Md>{md`**Internal flows** are flows that are **completely bounded by solid surfaces** — pipes, ducts, nozzles, diffusers, sudden contractions and expansions, valves and fittings. They are among the most practical flows in engineering, and they can be **laminar or turbulent**:

- some **laminar** cases can be solved **analytically** from the equations of motion;
- for **turbulent** flow no analytical solution is possible, so we rely on **semi-empirical theories and experimental data**.

For internal flows the regime is **primarily a function of the Reynolds number**. Fox's Chapter 8 deals only with **incompressible** flow: liquids, and gases with negligible heat transfer and Mach number $M < 0.3$ (in air $M = 0.3$ is about **100 m/s**).`}</Md>
          <Compare
            items={[
              { title: 'Part A — fully developed laminar flow', md: md`§8.2 between infinite parallel plates, §8.3 in a pipe (Newtonian fluid). Both can be solved **analytically**.`, tone: 'emerald' },
              { title: 'Part B — flow in pipes and ducts', md: md`§8.4 shear-stress distribution, §8.5 turbulent velocity profiles, §8.6 energy, §8.7 head loss, §8.8 pipe-flow problems. Laminar results follow from Part A; turbulent flow — the most common case — uses **experimental data**.`, tone: 'amber' },
              { title: 'Part C — flow measurement', md: md`§8.9 restriction flow meters for internal flows; §8.10 summary and useful equations.`, tone: 'cyan' },
            ]}
          />
          <Callout kind="note" title="Case study — Lab-on-a-chip (Fox p. 275)">
            <Md>{md`**Microfluidics** applies fluid mechanics to MEMS (devices roughly a micrometre to a millimetre in size). "Lab-on-a-chip" devices promise point-of-care medical diagnosis (real-time detection of bacteria, viruses, cancers) and always-on security sensors that sample air or water for biochemical toxins and pathogens. Their tiny geometry means **very low Reynolds numbers, so the flow is laminar**, and **surface tension is significant**.

Turbulence is a mixed blessing: in water pipes and air-conditioning ducts we would prefer laminar flow, because **a turbulent flow costs more to pump**; but turbulence is a powerful **mixing mechanism** — without it, cream would need a lot of stirring to blend into coffee, and our organs would not get enough oxygen from the blood. On a chip the goal is often to **mix** minute amounts of fluids, so options are complex geometries, long channels (molecular diffusion) or MEM paddles. Goullet, Glasgow and Aubry (NJIT) proposed **pulsing** the two inflows: with about 25 nL/s, $\bar V < 2$ mm/s and ≈ 200 μm ducts, steady streams meeting in a T junction **do not mix**, while pulsed streams stretch and fold their interface and mix well — without turbulence — within about 2 mm (≈ 1 s of contact), as a CFD model confirms.`}</Md>
          </Callout>
          <Supplement title="Where this topic sits">
            <Md>{md`This is the bridge into Unit D. Here we learn the vocabulary of pipe flow (Re, transition, entrance length, fully developed flow, wall shear, Reynolds stress) from Fox Ch. 8; the following topics treat turbulence itself — fluctuations, Reynolds stresses, mixing length, velocity profiles and friction factors — mainly from Wilkes Ch. 9.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition" src={F276}>
          <Md>{md`Turn on a kitchen tap **gently**: the water leaves in a smooth, glassy column — the flow in the pipe is **laminar**. Open it further and the stream becomes churned and rough — **turbulent**.

What decides? Every flow is constantly being disturbed (by wall roughness, vibrations, inlet irregularities). **Viscous forces try to damp those random fluctuations; inertia forces amplify them.** If viscosity wins, disturbances die out and the fluid slides along in layers. If inertia wins, the fluctuations grow into chaotic eddies.

- A **high-viscosity** fluid such as motor oil damps fluctuations very effectively — it stays laminar even at relatively high flow rates.
- A **high-density** fluid produces large inertia forces from the same fluctuations — it becomes turbulent at a relatively low flow rate.`}</Md>
          <Callout kind="tip" title="Re is a tug-of-war score">
            <Md>{md`$\Rey = \rho\bar VD/\mu$ puts density, speed and size (which feed inertia) on top and viscosity (which damps) underneath. Large Re: inertia wins → turbulence. Small Re: viscosity wins → laminar.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[F275, F276]}>
          <Figure caption="Reynolds' experiment: water from a large reservoir flows through a clear tube; dye is injected at the entrance. At low flow rates it stays a single filament; at higher flow rates it becomes unstable, is stretched and twisted into entangled threads and quickly disperses through the whole tube." src={F276}>
            <ReynoldsExperimentFig />
          </Figure>
          <Md>{md`**Laminar flow** = flow in **laminae (layers)** with **no macroscopic mixing** of adjacent layers. **Turbulent flow** carries small, high-frequency velocity fluctuations superimposed on the mean motion; they mix particles of adjacent layers, so the dye spreads rapidly.`}</Md>
          <Figure caption="Where flows sit on the Reynolds-number axis: micro-devices (Re ≈ 0.4) are deeply laminar; Re ≈ 2300 is the engineering benchmark for transition; disturbance-free laboratory pipes have stayed laminar up to Re ≈ 100 000.">
            <ReRegimeLine />
          </Figure>
          <LabOnChip />
        </Step>

        <Step kind="equations" src={F276}>
          <FormulaCard id="re-pipe" />
          <FormulaCard id="re-transition" />
          <Callout kind="warning" title="Common mistakes">
            <Md>{md`- Use the **average** velocity $\bar V = Q/A$ in $\Rey$, not the centreline velocity.
- Diameter in **metres** and $\mu$ in **Pa·s** (1 cP = $10^{-3}$ Pa·s).
- 2300 is a *benchmark*, not a law of nature: with great care the flow can stay laminar far above it, and just above it the flow is often intermittent.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-transition-25mm" />
          <ExampleCard id="ex-same-pipe" />
          <ExampleCard id="ex-lab-chip" />
        </Step>

        <Step kind="interactive">
          <ReynoldsDye />
        </Step>

        <Step kind="practice">
          <PracticeList concept="laminar-turbulent" />
          <QuickCheck ids={['q-lt-viscous', 'q-lt-chip']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Internal flow = completely wall-bounded; regime set mainly by $\Rey = \rho\bar VD/\mu$.`,
              md`Benchmark **Re ≈ 2300** for pipes (water, 25 mm pipe: $\bar V \approx 0.091$ m/s); careful lab pipes stay laminar to ≈ 100 000.`,
              'Laminar: layers, no macroscopic mixing, often analytically solvable. Turbulent: fluctuations on the mean motion, strong mixing, needs experiments.',
              'Viscosity damps fluctuations; density (inertia) feeds them. Turbulence costs pumping power but is an excellent mixer.',
              md`Trap: the incompressible analysis needs $M < 0.3$ for gases (≈ 100 m/s in air).`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== Concept 2 */}
      <Concept id="entrance-length">
        <Step kind="intro" src={F277}>
          <Md>{md`Fluid entering a pipe from a reservoir arrives with an essentially **uniform** velocity $U_0$. It cannot stay that way: the **no-slip condition** makes the velocity zero at the wall along the entire pipe. A **boundary layer** therefore grows on the wall; the wall's retarding shear force slows the nearby fluid, and at each section the wall's influence reaches farther into the flow.

- **Fully developed flow:** the velocity-profile shape **no longer changes** with distance $x$.
- **Entrance length $L$:** the distance from the entrance to where fully developed flow begins.

The fully developed profile's shape depends on whether the flow is laminar or turbulent. Some fully developed **laminar** profiles can be obtained by simplifying the equations of motion (Ch. 5); turbulent ones cannot. Everything in Parts A and B of Fox Ch. 8 concerns what happens **after** the entrance region.`}</Md>
          <Callout kind="note" title="What comes next in Fox (Part A, p. 277)">
            <Md>{md`Part A studies classic fully developed laminar flows to get **detailed velocity fields** — from which shear stress, pressure drop and flow rate follow. The first case, flow between infinite parallel plates (§8.2), is chosen because its geometry is the simplest possible; such a flow can be driven by a **pressure gradient** parallel to the plates, by **moving one plate** parallel to the other, or by a **body force** (the excerpt ends mid-sentence here).`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture a crowd entering a long corridor whose walls are sticky. The people brushing the walls are slowed almost to a stop, their neighbours are slowed a bit less, and the slowed zone widens as the crowd moves on. Because **the same number of people per second must get through** (mass conservation, incompressible), those in the middle must **walk faster**. Eventually the slowed zone fills the corridor and the speed pattern stops changing — "fully developed".

In the still-frictionless middle (the **inviscid core**) the Bernoulli equation holds, so a faster core means a **lower pressure** — the entrance region costs a little extra pressure drop.`}</Md>
          <Callout kind="tip" title="Why turbulent flow develops faster">
            <Md>{md`Turbulent eddies carry slow fluid from the wall outward and fast fluid inward, so the boundary layer **thickens much faster**: the mean profile settles within 25–40 diameters instead of up to ~140.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F81}>
          <Figure
            caption="Fox Fig. 8.1 — flow in the entrance region of a pipe (laminar, qualitative). Uniform U₀ at the inlet; dashed boundary-layer edges grow from the walls and meet on the centreline (small mark) a little before the end of the entrance length; the intermediate profile has a flat, faster core; the fully developed profile u is parabolic. Profiles drawn with the platform's schematic boundary-layer model."
            src={F81}
          >
            <Fig81Entrance />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'Uniform inflow', md: md`$u = U_0$ across the inlet; $\bar V = Q/A = U_0$.`, tone: 'cyan' },
              { title: 'No-slip at the wall', md: 'u = 0 at the wall along the entire length → a boundary layer forms.', tone: 'indigo' },
              { title: 'Boundary layer grows', md: 'Wall shear retards nearby fluid; the slowed region spreads toward the axis.', tone: 'violet' },
              { title: 'Core accelerates, pressure falls', md: 'Mass conservation speeds up the inviscid core; Bernoulli → its pressure drops somewhat.', tone: 'amber' },
              { title: 'Layers meet on the axis', md: 'The flow becomes entirely viscous; the profile still changes slightly afterwards.', tone: 'rose' },
              { title: 'Fully developed', md: md`Profile shape independent of $x$ (parabolic if laminar) — reached at $x = L$.`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="equations" src={F277}>
          <FormulaCard id="vbar" />
          <FormulaCard id="entrance-laminar" />
          <FormulaCard id="entrance-max" />
          <FormulaCard id="entrance-turb" />
          <Callout kind="exam" title="Exam tip">
            <Md>{md`First compute $\Rey$. If $\Rey < 2300$ use $L = 0.06\,\Rey\,D$; otherwise quote **25–40 $D$** for the mean profile (80 $D$+ for turbulence statistics). Plugging a turbulent Re into Eq. 8.1 gives absurd lengths (hundreds of metres).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-entrance-max" />
          <ExampleCard id="ex-entrance-oil" />
          <ExampleCard id="ex-entrance-turb" />
        </Step>

        <Step kind="interactive">
          <EntranceExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="entrance-length" />
          <QuickCheck ids={['q-el-core', 'q-el-compare']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              'No-slip + incompressibility: boundary layers grow inward, the core speeds up and its pressure drops (Bernoulli).',
              'Fully developed = profile shape no longer changes with x; entrance length = distance to that point.',
              md`Laminar: $L/D \simeq 0.06\,\Rey$ (Eq. 8.1), at most ≈ 138 $D$ (nearly 140 diameters).`,
              md`Turbulent: mean profile developed in 25–40 $D$; turbulence details need 80 $D$ or more.`,
              md`Trap: $\bar V = Q/A = U_0$ — use the average velocity in Re; Eq. 8.1 is **laminar only**.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================================== Concept 3 */}
      <Concept id="shear-stress-distribution">
        <Step kind="intro" src={F293}>
          <Md>{md`Three factors tend to **reduce the pressure** in a pipe flow:`}</Md>
          <Compare
            items={[
              { title: '1 · Decrease in pipe area', md: 'The fluid speeds up, trading pressure for kinetic energy.', tone: 'cyan' },
              { title: '2 · Upward slope', md: 'The fluid gains elevation, trading pressure for potential energy.', tone: 'amber' },
              { title: '3 · Friction', md: 'Wall shear dissipates mechanical energy — the focus here, studied in **horizontal, constant-area** pipes.', tone: 'rose' },
            ]}
          />
          <Md>{md`For **laminar** flow the friction pressure drop follows from theory (§8.3): $\Delta p = 128\mu LQ/(\pi D^4)$. A similar expression for **turbulent** flow **cannot be derived analytically**; it is built from theory plus experiment. By convention friction losses are split into **major losses** (friction in constant-area sections) and **minor losses** (valves, elbows, …), which — despite the name — are sometimes larger than the "major" ones. The analysis is done for circular pipes and extended to other shapes with the **hydraulic diameter** (§8.7); open channels (Ch. 11) and compressible duct flow (Ch. 13) are treated elsewhere.

§8.4 then asks: in **fully developed** flow in a horizontal circular pipe — **laminar or turbulent** — how is the shear stress distributed across the pipe?`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Cut out an imaginary cylinder of fluid of radius $r$, centred on the axis. In fully developed flow it is not accelerating, so the forces on it must balance:

- the **pressure difference** across its two end faces pushes it forward with a force proportional to the end area, $\pi r^2$;
- the **shear stress** on its curved side holds it back with a force proportional to the side area, $2\pi r\,dx$.

Area $\propto r^2$ against area $\propto r$: the stress needed grows **in proportion to $r$**. Nothing in this argument cares whether the fluid is honey or air, laminar or turbulent — the linear stress law is pure **statics of forces**.`}</Md>
          <Callout kind="key" title="Stress is linear, velocity is not">
            <Md>{md`The **stress** is linear in $r$ for every fully developed pipe flow. What differs between laminar and turbulent flow is *how* the fluid carries that stress — by viscosity alone (laminar) or mostly by turbulent momentum exchange (turbulent) — and therefore the **velocity profile**.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={F88}>
          <Figure caption="Force balance on a cylinder of fluid of radius r and length dx in fully developed, horizontal pipe flow. τ_rx is drawn in its positive sense (+x on a surface whose normal is +r); the solution gives τ_rx < 0 when ∂p/∂x < 0, i.e. the outer fluid actually pulls the core backwards.">
            <CylinderFBD />
          </Figure>
          <Figure
            caption="Fox Fig. 8.8 — turbulent shear stress (Reynolds stress) for fully developed turbulent pipe flow, Laufer's data at Re_U = 50 000 and 500 000 (points digitised, ±0.01). The dashed line is the total stress 1 − y/R from Eq. 8.15: the Reynolds stress follows it almost exactly, so the friction is almost all Reynolds stress. Not shown: very near the wall (y/R → 0) the Reynolds stress drops to zero."
            src={F88}
          >
            <Fig88Plot />
          </Figure>
          <Md>{md`**What Fig. 8.8 doesn't show** (Fox p. 294): no data lie closer to the wall than $y/R \approx 0.08$. At the wall the no-slip condition makes not only $\bar u \to 0$ but also $u' \to 0$ and $v' \to 0$ — the wall suppresses the fluctuations — so $-\rho\overline{u'v'} \to 0$. The region very close to the wall where **viscous shear dominates** is the **wall layer**; between it and the central portion of the pipe **both** viscous and turbulent shear are important. The interactive below zooms into this region.`}</Md>
        </Step>

        <Step kind="equations" src={[F293, F294]}>
          <Derivation
            title="From the force balance to the wall shear stress"
            steps={[
              {
                md: md`Cylinder of radius $r$, length $dx$ (supplementary direct route): $\Big[p - \Big(p + \pd{p}{x}dx\Big)\Big]\pi r^2 + \tau_{rx}\,2\pi r\,dx = 0$`,
                why: 'Fully developed and steady: no net momentum flux, so the net force is zero; horizontal: no weight component along x.',
              },
              { md: md`Divide by $2\pi r\,dx$: $\;\tau_{rx} = \dfrac{r}{2}\pd{p}{x}$`, why: 'Already Eq. 8.15; the cylinder contains the axis, so no integration constant appears.' },
              {
                md: md`Fox's route (§8.3, annular element): $\tau_{rx} = \dfrac{r}{2}\left(\pd{p}{x}\right) + \dfrac{c_1}{r}$ — Eq. 8.10`,
                why: 'Integrating the balance on a thin ring between r and r + dr leaves a constant c₁.',
              },
              { md: md`$\tau_{rx}$ cannot be infinite at $r = 0$ $\Rightarrow c_1 = 0 \Rightarrow \tau_{rx} = \dfrac{r}{2}\pd{p}{x}$ — Eq. 8.15`, why: 'Same result: linear, zero on the centreline, maximum at the wall — for laminar and turbulent flow.' },
              { md: md`Wall: $\tau_w = -\big[\tau_{rx}\big]_{r=R} = -\dfrac{R}{2}\pd{p}{x}$ — Eq. 8.16`, why: 'The stress on the wall is equal and opposite to the stress in the fluid at the wall.' },
              { md: md`With $\pd{p}{x} = -\Delta p/L$: $\;\tau_w = \dfrac{D\,\Delta p}{4L}$, and $\dfrac{\lvert\tau\rvert}{\tau_w} = \dfrac{r}{R} = 1 - \dfrac{y}{R}$`, why: 'Supplementary rearrangement; y = R − r is the distance from the wall used in Fig. 8.8.' },
            ]}
          />
          <FormulaCard id="cyl-balance" />
          <FormulaCard id="tau-general" />
          <FormulaCard id="tau-linear" />
          <FormulaCard id="tau-wall" />
          <FormulaCard id="tau-wall-dp" />
          <FormulaCard id="dp-laminar" />
          <Md>{md`**Laminar flow.** Substituting the stress law $\tau_{rx} = \mu\,du/dr$ into Eq. 8.15 gives the laminar velocity distribution and the set of Eqs. 8.13 (in §8.3, not in this excerpt) — among them the flow-rate relation behind $\Delta p = 128\mu LQ/(\pi D^4)$, found experimentally by the French physician Jean Louis Poiseuille and independently by the German engineer Gotthilf H. L. Hagen (the book places this "in the 1850s"). (The book prints the stress law as "$\tau_{rw} = \mu\,du/dr$"; the subscript is a typo for $\tau_{rx}$.)

**Turbulent flow.** There is **no equivalent stress equation** for turbulent flow, so the laminar analysis cannot be repeated; only semi-empirical results are available. Turbulent flow is represented at each point by the **time-mean velocity $\bar u$** plus **random fluctuations $u'$ and $v'$** (in $x$ and $y$). The fluctuations continuously transfer momentum between adjacent layers, which tends to reduce any velocity gradient — an **apparent stress**, first introduced by Osborne Reynolds and called the **Reynolds stress**, $-\rho\overline{u'v'}$ (it arises from the full equations of motion for turbulent flow). Hence:`}</Md>
          <FormulaCard id="tau-total" />
          <FormulaCard id="tau-wall-visc" />
          <FormulaCard id="re-u" />
          <Callout kind="warning" title="Don't misread the minus sign">
            <Md>{md`$u'$ and $v'$ are **negatively correlated**, so $\overline{u'v'} < 0$ and $\tau_{\text{turb}} = -\rho\overline{u'v'}$ is **positive** — it adds to the viscous stress. Likewise $\tau_{rx} < 0$ in the fluid while $\tau_w > 0$ on the wall: they are action and reaction.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-wall-shear" />
          <ExampleCard id="ex-laminar-dp" />
          <ExampleCard id="ex-fig88-read" />
        </Step>

        <Step kind="interactive">
          <ShearStressExplorer />
          <Supplement title="About the viscous / turbulent split in the sim">
            <Md>{md`The total stress line is exact (Eq. 8.15). The split uses van Driest's mixing-length model with a Blasius friction factor to estimate $R^+ = Ru_*/\nu$ — a standard engineering model, **not** from Fox, used here only to make the wall layer visible. It places the point where viscous and turbulent stresses are equal at $y^+ = yu_*/\nu \approx 10$; in physical units the wall layer becomes thinner as Re rises.`}</Md>
          </Supplement>
        </Step>

        <Step kind="practice">
          <PracticeList concept="shear-stress-distribution" />
          <QuickCheck ids={['q-ss-linear', 'q-ss-wall']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Three pressure-reducing factors: area decrease, upward slope, friction. Major losses = constant-area friction; minor losses = valves, elbows (sometimes larger).`,
              md`$\tau_{rx} = \tfrac{r}{2}\pd{p}{x}$ (Eq. 8.15; $c_1 = 0$ for finite stress on the axis): **linear**, for laminar **and** turbulent fully developed flow.`,
              md`$\tau_w = -\tfrac{R}{2}\pd{p}{x} = D\Delta p/(4L)$ (Eq. 8.16): a pressure-drop measurement gives the wall stress directly.`,
              md`$\tau = \mu\,d\bar u/dy - \rho\overline{u'v'}$ (Eq. 8.17); the Reynolds stress is positive and dominates the core (Fig. 8.8), but is zero at the wall: $\tau_w = \mu(d\bar u/dy)_{y=0}$.`,
              md`Traps: $Re_U$ uses the centreline velocity; laminar $\Delta p = 128\mu LQ/(\pi D^4)$ has no analytical turbulent twin; Fig. 8.8 stops at $y/R \approx 0.08$ — it does not show the wall layer.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
