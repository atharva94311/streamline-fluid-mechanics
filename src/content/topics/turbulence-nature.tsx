import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, PracticeList, QuickCheck, SourceChips, Step,
  Supplement, Takeaways, md,
} from '@/kit'
import { ReMap } from '../sims/turbulence-nature/ReMap'
import { RegimeSignals } from '../sims/turbulence-nature/RegimeSignals'
import { WakeLab } from '../sims/turbulence-nature/WakeLab'
import { CascadeFig91 } from '../sims/turbulence-nature/CascadeFig91'
import { CascadeAnimation } from '../sims/turbulence-nature/CascadeAnimation'
import { CascadeExplorer } from '../sims/turbulence-nature/CascadeExplorer'
import { Fig92Velocity } from '../sims/turbulence-nature/Fig92Velocity'
import { Fig93Magnifier } from '../sims/turbulence-nature/Fig93Magnifier'
import { DecompositionLab } from '../sims/turbulence-nature/DecompositionLab'
import { RmsConstruction } from '../sims/turbulence-nature/RmsConstruction'
import { IntensityLab } from '../sims/turbulence-nature/IntensityLab'

// ───────────────────────────────────────────────────────────────────────────────
// Meta
// ───────────────────────────────────────────────────────────────────────────────

export const meta: TopicMeta = {
  id: 'turbulence-nature',
  unit: 'D',
  title: 'The Nature of Turbulence & Time Averaging',
  subtitle:
    'What turbulence is (and is not), how eddies hand energy down to the Kolmogorov limit, and how a chaotic velocity signal is split into a steady mean plus a zero-mean fluctuation whose RMS measures the turbulence intensity.',
  minutes: 80,
  sources: [
    { doc: 'wilkes', pages: '480–484', note: '§9.1 up to Eq. (9.5)' },
    { doc: 'fox', pages: '293', note: 'cross-reference only' },
  ],
  concepts: [
    {
      id: 'what-is-turbulence',
      title: 'What turbulence is (and is not)',
      src: { doc: 'wilkes', pages: '480–482' },
      summary: 'Random in time and space but with well-defined averages; high Re amplifies disturbances; an unstable but regular flow (Kármán street) is not turbulence.',
    },
    {
      id: 'energy-cascade',
      title: 'Eddies and the energy cascade',
      src: { doc: 'wilkes', pages: '481–482', note: 'Fig. 9.1' },
      summary: 'Large eddies fed by pressure energy break into ever smaller ones; the energy passed down stays constant until viscosity turns it into heat at the Kolmogorov limit.',
    },
    {
      id: 'time-averaging',
      title: 'Time averaging & Reynolds decomposition',
      src: { doc: 'wilkes', pages: '482–483', note: 'Figs. 9.2–9.3, Eqs. (9.1)–(9.3)' },
      summary: 'v = v̄ + v′ for every component and for p; averages over T ≫ fluctuation time; fluctuations average to zero; flows steady in the mean.',
    },
    {
      id: 'intensity',
      title: 'Turbulence intensity',
      src: { doc: 'wilkes', pages: '484', note: 'Eqs. (9.4)–(9.5)' },
      summary: 'Strength of turbulence = RMS fluctuation ṽ′ = √(mean of v′²) divided by the mean velocity; typically 0.01 to 0.1.',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 480–484).** Fox & McDonald's is cited only as a secondary cross-reference. This topic follows Wilkes §9.1 from the opening definition up to Eq. (9.5); the time-averaged continuity and momentum equations that begin at Eq. (9.6) continue in *Reynolds stresses*. Wilkes's notation is used throughout — an overbar for a time average ($\overline{v}_x$), a prime for a fluctuation ($v_x'$) and a wide tilde for an RMS value ($\widetilde{v'}$) — with the Fox equivalents ($\bar u$, $u'$) noted where they help. Blocks marked ✦ Supplementary (Kolmogorov estimates, cylinder-wake regimes, typical property values, all simulations) are added explanation, not taken from the PDFs.`,
}

// ───────────────────────────────────────────────────────────────────────────────
// Formulas
// ───────────────────────────────────────────────────────────────────────────────

export const formulas: FormulaDef[] = [
  {
    id: 're-def',
    name: 'Reynolds number — inertial versus viscous effects',
    tex: md`\Rey = \frac{\rho\,\overline{v}\,D}{\mu} = \frac{\overline{v}\,D}{\nu} \;\sim\; \frac{\text{inertial effects}}{\text{viscous effects}}`,
    vars: [
      { sym: md`\Rey`, desc: 'Reynolds number', units: md`[-]` },
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\overline{v}`, desc: md`mean velocity — for a pipe, the cross-sectional mean $Q/A$ (Wilkes later writes $\overline{v}_{zm}$; Fox writes $\bar V$)`, units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'characteristic length: pipe diameter, or e.g. the cylinder diameter for a wake', units: md`\mathrm{m}` },
      { sym: md`\mu`, desc: 'dynamic viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`\nu = \mu/\rho`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      'State which velocity and length are used — Re is meaningless without them.',
      md`Pipe flow (supplementary benchmark): laminar for $\Rey \lesssim 2000$–$2300$, turbulent for $\Rey \gtrsim 4000$ in ordinary installations, transitional in between.`,
      md`Other geometries have other thresholds — e.g. a cylinder wake sheds regular vortices from $\Rey \approx 47$ but becomes turbulent only at $\Rey$ of order $10^3$ (supplementary values).`,
    ],
    use: md`Wilkes (p. 481) uses Re in words: at **low Re** viscous effects dominate and *dampen* small perturbations; at **high Re** the nonlinear inertial terms of the Navier–Stokes equations dominate and *amplify* them into eddies. Compute Re first whenever you must decide whether a flow is laminar or turbulent, then choose the matching correlations.`,
  },
  {
    id: 'eps-estimate',
    name: 'Energy flux down the cascade (large-eddy estimate)',
    tex: md`\varepsilon \sim \frac{\widetilde{v'}^{\,3}}{L}`,
    vars: [
      {
        sym: md`\varepsilon`,
        desc: md`rate at which kinetic energy is passed down the cascade — and finally dissipated into heat — per unit mass; the same symbol and meaning as in the $k$–$\varepsilon$ method (Wilkes p. 506)`,
        units: md`\mathrm{W/kg} = \mathrm{m^2/s^3}`,
      },
      { sym: md`\widetilde{v'}`, desc: 'RMS velocity fluctuation — the velocity scale of the largest eddies', units: md`\mathrm{m/s}` },
      { sym: md`L`, desc: 'size of the largest eddies; of the order of the pipe diameter in pipe flow (Wilkes p. 481)', units: md`\mathrm{m}` },
    ],
    conditions: [
      'High Reynolds number (a well-developed cascade). Order-of-magnitude estimate: a constant of order one is dropped.',
      'Independent of viscosity: the large eddies set the rate; viscosity only decides *where* the energy is finally turned into heat.',
      md`For a whole pipe an average can also be found from the pumping power: $\varepsilon_{\text{avg}} = (-\mathrm{d}p/\mathrm{d}z)\,\overline{v}/\rho = 2f_F\,\overline{v}^{3}/D$ ($f_F$ = Fanning friction factor; in Fox's notation, with the Darcy factor $f = 4f_F$, this is $f\,\overline{V}^{3}/2D$).`,
    ],
    use: md`A large eddy holds kinetic energy $\sim \widetilde{v'}^{2}$ per unit mass and hands it on within about one turnover time $L/\widetilde{v'}$, so $\varepsilon \sim \widetilde{v'}^{2}/(L/\widetilde{v'}) = \widetilde{v'}^{3}/L$. Because the flux is the same at every stage of the cascade (Wilkes p. 481), this single number fixes the whole cascade, including the Kolmogorov scales. *Supplementary (G. I. Taylor's estimate).*`,
  },
  {
    id: 'eddy-scaling',
    name: 'Eddy velocity, turnover time and Reynolds number versus eddy size',
    tex: md`u_\ell \sim (\varepsilon\,\ell)^{1/3},\qquad \tau_\ell \sim \frac{\ell}{u_\ell} \sim \left(\frac{\ell^{2}}{\varepsilon}\right)^{1/3},\qquad \Rey_\ell = \frac{u_\ell\,\ell}{\nu} \sim \Rey_L\left(\frac{\ell}{L}\right)^{4/3}`,
    vars: [
      { sym: md`\ell`, desc: md`size of an eddy somewhere in the cascade, $\eta < \ell < L$`, units: md`\mathrm{m}` },
      { sym: md`u_\ell`, desc: md`velocity difference across an eddy of size $\ell$`, units: md`\mathrm{m/s}` },
      { sym: md`\tau_\ell`, desc: 'turnover (lifetime) time of that eddy', units: md`\mathrm{s}` },
      { sym: md`\Rey_\ell`, desc: md`Reynolds number of an eddy of size $\ell$`, units: md`[-]` },
      { sym: md`\Rey_L = \widetilde{v'}L/\nu`, desc: 'Reynolds number of the largest eddies', units: md`[-]` },
      { sym: md`\varepsilon`, desc: 'energy flux per unit mass (constant along the cascade)', units: md`\mathrm{m^2/s^3}` },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [
      md`Inertial range only, $\eta \ll \ell \ll L$ — Kolmogorov (1941), *supplementary*.`,
      'Assumes a constant energy flux through every eddy size, i.e. Wilkes’s “essentially constant” cascade.',
    ],
    use: md`Each halving of $\ell$ lowers $u_\ell$ by $2^{1/3} \approx 1.26$ and the turnover time by $2^{2/3} \approx 1.59$: small eddies are weaker but much faster — the origin of millisecond fluctuations. $\Rey_\ell$ falls like $\ell^{4/3}$ until it is about 1, where viscosity takes over.`,
  },
  {
    id: 'kolmogorov',
    name: 'Kolmogorov scales — where the cascade ends',
    tex: md`\begin{gathered} \eta = \left(\frac{\nu^{3}}{\varepsilon}\right)^{1/4},\qquad \tau_\eta = \left(\frac{\nu}{\varepsilon}\right)^{1/2},\qquad u_\eta = (\nu\,\varepsilon)^{1/4} \\ \frac{u_\eta\,\eta}{\nu} = 1,\qquad \frac{L}{\eta} \sim \Rey_L^{3/4} \end{gathered}`,
    vars: [
      { sym: md`\eta`, desc: 'Kolmogorov length — size of the smallest eddies', units: md`\mathrm{m}` },
      { sym: md`\tau_\eta`, desc: 'Kolmogorov time — time scale of the fastest fluctuations', units: md`\mathrm{s}` },
      { sym: md`u_\eta`, desc: 'Kolmogorov velocity — velocity scale of the smallest eddies', units: md`\mathrm{m/s}` },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: md`\varepsilon`, desc: 'dissipation rate per unit mass', units: md`\mathrm{m^2/s^3}` },
      { sym: md`L,\ \Rey_L`, desc: md`largest-eddy size and its Reynolds number $\widetilde{v'}L/\nu$`, units: md`\mathrm{m},\ [-]` },
    ],
    conditions: [
      'Order-of-magnitude scales of the end of the cascade (Kolmogorov 1941) — supplementary; Wilkes describes the “Kolmogorov limit” only in words (pp. 481, 483).',
      md`The smallest eddies are still far larger than molecules, so the continuum description holds there.`,
    ],
    use: md`Wilkes: the cascade stops when velocity variations occur over such short distances that the steep gradients let viscosity convert the mechanical energy into heat. Quantitatively, that is where the eddy Reynolds number has fallen to about one. Get $\varepsilon$ (e.g. from $\widetilde{v'}^{3}/L$ or from the pumping power), then evaluate $\eta$, $\tau_\eta$, $u_\eta$. The ratio $L/\eta$ tells how many halvings separate the largest and the smallest eddies.`,
  },
  {
    id: 'time-avg',
    name: 'Time average (definition of the overbar)',
    tex: md`\overline{v}_x = \frac{1}{T}\int_{t_0}^{t_0+T} v_x\,\dd t \qquad\Bigl(\text{from samples: } \overline{v}_x = \frac{1}{N}\sum_{i=1}^{N} v_{x,i}\Bigr)`,
    vars: [
      { sym: md`\overline{v}_x`, desc: 'time-averaged (mean) $x$-velocity at the point considered', units: md`\mathrm{m/s}` },
      { sym: md`v_x`, desc: 'instantaneous $x$-velocity', units: md`\mathrm{m/s}` },
      { sym: md`T`, desc: 'averaging period, very large compared with the time scale of the fluctuations', units: md`\mathrm{s}` },
      { sym: md`t_0`, desc: 'start of the averaging period', units: md`\mathrm{s}` },
      { sym: md`t`, desc: 'time', units: md`\mathrm{s}` },
      { sym: md`N,\ v_{x,i}`, desc: 'number of equally spaced samples taken during $T$; the $i$-th sample', units: md`[-],\ \mathrm{m/s}` },
    ],
    conditions: [
      md`$T$ much longer than the time scale of the fluctuations — milliseconds in Fig. 9.3, so $T$ of a few seconds (Wilkes p. 483).`,
      md`For a flow **steady in the mean** the result does not depend on $t_0$ (nor on $T$, once $T$ is long enough).`,
      'If the mean drifts slowly, T must also be short compared with the time scale of the drift.',
      md`The same operation defines $\overline{v}_y$, $\overline{v}_z$ and $\overline{p}$.`,
    ],
    use: md`Wilkes defines the overbar in words (p. 483) — the mean value over a period $T$ that is very large compared with the time scale of the individual fluctuations; the integral is the standard way of writing that definition (supplementary form). With digital data, average the samples.`,
  },
  {
    id: 'reynolds-decomp',
    name: 'Instantaneous value = time average + fluctuation',
    tex: md`\begin{aligned} v_x &= \overline{v}_x + v_x', & v_y &= \overline{v}_y + v_y', \\ v_z &= \overline{v}_z + v_z', & p &= \overline{p} + p' \end{aligned}`,
    tag: '9.1',
    key: true,
    vars: [
      { sym: md`v_x,\ v_y,\ v_z`, desc: 'instantaneous velocity components at a point', units: md`\mathrm{m/s}` },
      { sym: md`\overline{v}_x,\ \overline{v}_y,\ \overline{v}_z`, desc: 'their time averages (means)', units: md`\mathrm{m/s}` },
      { sym: md`v_x',\ v_y',\ v_z'`, desc: 'fluctuations about those means', units: md`\mathrm{m/s}` },
      { sym: md`p,\ \overline{p},\ p'`, desc: 'instantaneous, mean and fluctuating pressure', units: md`\mathrm{Pa}` },
    ],
    conditions: [
      'Holds at **any point** in space and at **any instant** of time.',
      md`Means taken over $T \gg$ the fluctuation time scale; for a flow steady in the mean they are constant in time.`,
      'All three velocity components fluctuate (turbulence is three-dimensional, Fig. 9.2), even where a mean component is zero.',
      'Usually called the **Reynolds decomposition** — the name is common terminology, not used by Wilkes on this page.',
    ],
    use: md`Substitute (9.1) into an equation and time-average it with (9.2) and (9.3). Terms that are linear in the velocity keep their form, with means in place of instantaneous values; averages of **products of fluctuations** survive — the origin of the Reynolds stresses in the next topic.`,
    src: { doc: 'wilkes', pages: '483', note: 'Eq. (9.1)' },
  },
  {
    id: 'zero-mean',
    name: 'Fluctuations average to zero',
    tex: md`\overline{v_x'} = \overline{v_y'} = \overline{v_z'} = \overline{p'} = 0`,
    tag: '9.2',
    vars: [
      { sym: md`\overline{v_x'},\ \overline{v_y'},\ \overline{v_z'}`, desc: 'time averages of the velocity fluctuations', units: md`\mathrm{m/s}` },
      { sym: md`\overline{p'}`, desc: 'time average of the pressure fluctuation', units: md`\mathrm{Pa}` },
    ],
    conditions: [
      'True **by definition**: a fluctuation is measured from the mean taken over the same period.',
      'Wilkes’s reading: on the average the fluctuations are equally likely to lie above or below the mean (strictly, the positive and negative areas balance).',
      md`It does **not** make averages of squares or products vanish: $\overline{v_x'^{2}} > 0$, and $\overline{v_x'v_y'}$ is generally non-zero.`,
    ],
    use: md`Whenever a single fluctuation appears linearly inside an average, drop it: e.g. $\overline{\overline{v}_x v_y'} = \overline{v}_x\,\overline{v_y'} = 0$.`,
    src: { doc: 'wilkes', pages: '483', note: 'Eq. (9.2)' },
  },
  {
    id: 'mean-of-mean',
    name: 'The time average of a mean is the mean itself',
    tex: md`\overline{\overline{v}_x} = \overline{v}_x`,
    tag: '9.3',
    vars: [
      { sym: md`\overline{v}_x`, desc: 'time-averaged $x$-velocity (a constant for a flow steady in the mean)', units: md`\mathrm{m/s}` },
      { sym: md`\overline{\overline{v}_x}`, desc: 'its time average', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`Holds likewise for $\overline{v}_y$, $\overline{v}_z$ and $\overline{p}$ (“for example”, says Wilkes).`,
      'Requires the mean to be constant over the averaging period — automatic for a flow steady in the mean.',
    ],
    use: md`Lets you pull means through the averaging bar: $\overline{\overline{v}_x\,f} = \overline{v}_x\,\overline{f}$. Together with (9.2) it is all you need to time-average the conservation equations.`,
    src: { doc: 'wilkes', pages: '483', note: 'Eq. (9.3)' },
  },
  {
    id: 'avg-uncertainty',
    name: 'How long is long enough? Scatter of a finite time average',
    tex: md`\frac{\sigma_{\overline{v}}}{\overline{v}} \approx \frac{\widetilde{v'}}{\overline{v}}\sqrt{\frac{2\,T_I}{T}} \qquad\Longleftrightarrow\qquad T \approx 2\,T_I\left(\frac{\widetilde{v'}/\overline{v}}{\sigma_{\overline{v}}/\overline{v}}\right)^{2}`,
    vars: [
      { sym: md`\sigma_{\overline{v}}`, desc: 'standard deviation (scatter) of the measured mean if the measurement were repeated', units: md`\mathrm{m/s}` },
      { sym: md`\widetilde{v'}/\overline{v}`, desc: 'turbulence intensity, Eq. (9.4)', units: md`[-]` },
      { sym: md`T_I`, desc: 'integral time scale — roughly how long the fluctuation “remembers” its value', units: md`\mathrm{s}` },
      { sym: md`T`, desc: 'averaging time', units: md`\mathrm{s}` },
    ],
    conditions: [
      'Flow steady in the mean (statistically stationary).',
      md`$T \gg T_I$; the record then contains about $T/(2T_I)$ independent samples.`,
      'Standard result for stationary random signals — supplementary, not in Wilkes.',
    ],
    use: md`Pick the accuracy you need and solve for $T$. Because the error falls only as $1/\sqrt{T}$, halving it costs four times the averaging time — which is why “a few seconds” (Wilkes p. 483) is a sensible compromise for millisecond fluctuations.`,
  },
  {
    id: 'intensity',
    name: 'Turbulence intensity',
    tex: md`\frac{\widetilde{v'}}{\overline{v}} \sim 0.01 \text{ to } 0.1`,
    tag: '9.4',
    key: true,
    vars: [
      { sym: md`\widetilde{v'}`, desc: 'root-mean-square (RMS) value of the fluctuating velocity component, Eq. (9.5)', units: md`\mathrm{m/s}` },
      { sym: md`\overline{v}`, desc: 'time-averaged velocity', units: md`\mathrm{m/s}` },
      { sym: md`\widetilde{v'}/\overline{v}`, desc: 'turbulence intensity — typically 1 % to 10 %', units: md`[-]` },
    ],
    conditions: [
      'A typical range (“typically”, says Wilkes), not a law: values outside it occur — e.g. very quiet wind tunnels, or near walls where the mean velocity is small (supplementary examples).',
      md`Each component has its own RMS ($\widetilde{v_x'}$, $\widetilde{v_y'}$, $\widetilde{v_z'}$); they are usually unequal in shear flows (supplementary).`,
    ],
    use: md`Measures how violent the turbulence is relative to the mean motion. Note the order of operations: RMS first, then divide by the mean.`,
    src: { doc: 'wilkes', pages: '484', note: 'Eq. (9.4)' },
  },
  {
    id: 'rms',
    name: 'Root-mean-square (RMS) of the fluctuation',
    tex: md`\widetilde{v'} = \sqrt{\overline{v'^{2}}}`,
    tag: '9.5',
    key: true,
    vars: [
      { sym: md`\widetilde{v'}`, desc: 'RMS value of the velocity fluctuation (wide-tilde notation of Wilkes)', units: md`\mathrm{m/s}` },
      { sym: md`\overline{v'^{2}}`, desc: 'time average of the *square* of the fluctuation', units: md`\mathrm{m^2/s^2}` },
      { sym: md`v'`, desc: md`velocity fluctuation, $v - \overline{v}$`, units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`Square **before** averaging: the plain average $\overline{v'}$ is always zero by (9.2) and carries no information about the size of the fluctuations.`,
      'Equivalent to the standard deviation of the instantaneous velocity about its mean.',
    ],
    use: md`Subtract the mean → square → average → square root. The result is the “typical size” of the fluctuation.`,
    src: { doc: 'wilkes', pages: '484', note: 'Eq. (9.5)' },
  },
  {
    id: 'rms-samples',
    name: 'Mean and RMS from N equally spaced samples',
    tex: md`\overline{v} = \frac{1}{N}\sum_{i=1}^{N} v_i, \qquad \widetilde{v'} = \sqrt{\frac{1}{N}\sum_{i=1}^{N}\left(v_i - \overline{v}\right)^{2}}`,
    vars: [
      { sym: md`v_i`, desc: 'the $i$-th velocity sample', units: md`\mathrm{m/s}` },
      { sym: md`N`, desc: 'number of samples', units: md`[-]` },
      { sym: md`\overline{v},\ \widetilde{v'}`, desc: 'sample mean and sample RMS fluctuation', units: md`\mathrm{m/s}` },
    ],
    conditions: ['Equally spaced samples covering a period long compared with the fluctuations.', 'Discrete form of the time averages in (9.5) — supplementary.'],
    use: md`The form you use with hot-wire or CFD data and in exam problems that give a list of readings.`,
  },
  {
    id: 'mean-square',
    name: 'Mean of the square = square of the mean + mean square fluctuation',
    tex: md`\overline{v^{2}} = \overline{v}^{\,2} + \overline{v'^{2}} = \overline{v}^{\,2} + \widetilde{v'}^{\,2}`,
    vars: [
      { sym: md`\overline{v^{2}}`, desc: 'time average of the squared instantaneous velocity', units: md`\mathrm{m^2/s^2}` },
      { sym: md`\overline{v}^{\,2}`, desc: 'square of the mean velocity', units: md`\mathrm{m^2/s^2}` },
      { sym: md`\widetilde{v'}^{\,2} = \overline{v'^{2}}`, desc: 'mean square fluctuation', units: md`\mathrm{m^2/s^2}` },
    ],
    conditions: ['Follows from (9.1), (9.2), (9.3) and (9.5) — supplementary derivation below.'],
    use: md`Shows that averaging a nonlinear quantity produces an extra fluctuation term — the seed of the Reynolds stresses. Rearranged, $\widetilde{v'}^{\,2} = \overline{v^{2}} - \overline{v}^{\,2}$ gives a quick way to compute an RMS from running sums.`,
  },
  {
    id: 'tke',
    name: 'Turbulent kinetic energy per unit mass, k (looking ahead to k–ε)',
    tex: md`k = \frac{v_x'^{\,2} + v_y'^{\,2} + v_z'^{\,2}}{2}`,
    vars: [
      { sym: md`k`, desc: 'turbulent kinetic energy of the fluctuations per unit mass', units: md`\mathrm{m^2/s^2} = \mathrm{J/kg}` },
      { sym: md`v_x',\ v_y',\ v_z'`, desc: 'velocity fluctuations; their squares are understood as time averages', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`Printed by Wilkes in §9.12 without overbars; it is a mean quantity, $k = \tfrac12\bigl(\overline{v_x'^{2}} + \overline{v_y'^{2}} + \overline{v_z'^{2}}\bigr)$.`,
      md`Isotropic turbulence ($\widetilde{v_x'} = \widetilde{v_y'} = \widetilde{v_z'} = \widetilde{v'}$): $k = \tfrac32\,\widetilde{v'}^{2}$.`,
    ],
    use: md`By (9.5), $k = \tfrac12\bigl(\widetilde{v_x'}^{2} + \widetilde{v_y'}^{2} + \widetilde{v_z'}^{2}\bigr)$: the three RMS values bundled into one energy. This is the $k$ of the $k$–$\varepsilon$ method that Wilkes previews on p. 481.`,
    src: { doc: 'wilkes', pages: '506', note: 'definition of k (§9.12)' },
  },
]

// ───────────────────────────────────────────────────────────────────────────────
// Solved examples
// ───────────────────────────────────────────────────────────────────────────────

export const examples: ExampleDef[] = [
  {
    id: 'ex-re-applications',
    concept: 'what-is-turbulence',
    title: 'Laminar or turbulent? Wilkes’s examples in numbers',
    difficulty: 1,
    given: md`Three duct flows with typical (illustrative) properties:

| case | $\rho$ (kg/m³) | $\mu$ (Pa·s) | $D$ | $\overline{v}$ |
|---|---|---|---|---|
| (a) polymer melt in an extrusion die | 950 | 1000 | 5 mm | 5 cm/s |
| (b) water in a microfluidic channel | 1000 | $1.0\times10^{-3}$ | 100 µm | 1 cm/s |
| (c) natural gas in a pipeline (≈ 70 bar) | 50 | $1.2\times10^{-5}$ | 0.9 m | 8 m/s |

Pipe benchmark: laminar if $\Rey \lesssim 2000$.`,
    find: md`$\Rey$ for each case and the expected flow regime.`,
    assumptions: 'Round ducts, fully developed flow; the polymer melt is treated as Newtonian with a constant viscosity (a rough approximation).',
    steps: [
      { title: 'Formula and units', md: md`$\Rey = \rho\,\overline{v}\,D/\mu$ — convert every length to metres and every velocity to m/s first.` },
      { title: '(a) Polymer melt', md: md`$\Rey = \dfrac{950 \times 0.05 \times 0.005}{1000} = 2.4\times10^{-4}$ — laminar by about seven orders of magnitude: the huge viscosity crushes every disturbance.` },
      { title: '(b) Microfluidic channel', md: md`$\Rey = \dfrac{1000 \times 0.01 \times 1.0\times10^{-4}}{1.0\times10^{-3}} = 1.0$ — laminar: the channel is simply too small.` },
      { title: '(c) Gas pipeline', md: md`$\Rey = \dfrac{50 \times 8 \times 0.9}{1.2\times10^{-5}} = 3.0\times10^{7}$ — far above any transition value: turbulent.` },
    ],
    answer: md`(a) $\Rey \approx 2.4\times10^{-4}$, laminar; (b) $\Rey \approx 1.0$, laminar; (c) $\Rey \approx 3.0\times10^{7}$, turbulent.`,
    insight: 'High viscosity (polymers) and tiny size (microfluidics) are the two ways to keep Re small — exactly the two laminar fields Wilkes names on p. 480. Almost everything else in a process plant is turbulent.',
  },
  {
    id: 'ex-karman-period',
    concept: 'what-is-turbulence',
    title: 'Unsteady but not turbulent: the Re = 100 cylinder wake',
    difficulty: 2,
    given: md`Water ($\nu = 1.0\times10^{-6}$ m²/s) flows past a cylinder of diameter $D = 1.0$ cm at $\Rey = UD/\nu = 100$ — the Reynolds number of the CFD example Wilkes cites on p. 482. For laminar vortex shedding the Strouhal number is approximately $\St = fD/U = 0.212\,(1 - 21.2/\Rey)$ (Roshko's correlation, supplementary).`,
    find: md`The approach velocity $U$, the shedding frequency $f$ and its period; is the wake turbulent?`,
    steps: [
      { title: 'Approach velocity', md: md`$U = \Rey\,\nu/D = 100 \times 1.0\times10^{-6}/0.010 = 0.010$ m/s, i.e. 1 cm/s.` },
      { title: 'Strouhal number', md: md`$\St = 0.212\,(1 - 21.2/100) = 0.212 \times 0.788 = 0.167$.` },
      { title: 'Frequency and period', md: md`$f = \St\,U/D = 0.167 \times 0.010/0.010 = 0.167$ Hz; one full cycle (a vortex from each side) takes $1/f \approx 6.0$ s.` },
      {
        title: 'Turbulent or not?',
        md: md`The velocity behind the cylinder oscillates — but at one sharp frequency, cycle after cycle. Predictable and regular, it fails the randomness test of Hinze's definition: an **unstable laminar** flow (Wilkes p. 482), not turbulence.`,
      },
    ],
    answer: md`$U = 1.0$ cm/s, $\St \approx 0.167$, $f \approx 0.17$ Hz (period ≈ 6 s): a regular Kármán vortex street — unsteady but **not** turbulent.`,
    insight: 'Ask “is it random?”, not “is it unsteady?”. A clock-like oscillation is laminar however wavy it looks.',
  },
  {
    id: 'ex-kolmogorov-pipe',
    concept: 'energy-cascade',
    title: 'How small are the smallest eddies in a water pipe?',
    difficulty: 2,
    given: md`Water ($\nu = 1.0\times10^{-6}$ m²/s) in a pipe of diameter $D = 5.0$ cm, mean velocity $\overline{v} = 2.0$ m/s, turbulence intensity 5 %. Take the largest eddies to be about the pipe diameter, $L \approx D$ (Wilkes p. 481), with velocity scale $\widetilde{v'}$. For the whole-pipe comparison, the Fanning friction factor at this Re is $f_F = 0.0790\,\Rey^{-1/4} \approx 0.0044$ (Blasius law, from the friction-factor topic; Fox's Darcy factor is $f = 4f_F \approx 0.0178$).`,
    find: md`(a) the pipe Re; (b) $\varepsilon$ from the large eddies; (c) the Kolmogorov length, time and velocity; (d) the number of halvings from $L$ to $\eta$; (e) $\varepsilon$ and $\eta$ from the pumping power instead.`,
    assumptions: 'Order-of-magnitude (Kolmogorov) estimates — supplementary to Wilkes’s qualitative description.',
    steps: [
      { title: '(a) Pipe Reynolds number', md: md`$\Rey = \overline{v}D/\nu = 2.0 \times 0.050/1.0\times10^{-6} = 1.0\times10^{5}$ — fully turbulent.` },
      {
        title: '(b) Large eddies and energy flux',
        md: md`$\widetilde{v'} = 0.05 \times 2.0 = 0.10$ m/s and $L \approx 0.050$ m, so $\Rey_L = \widetilde{v'}L/\nu = 0.10 \times 0.050/10^{-6} = 5000$ and $\varepsilon \sim \widetilde{v'}^{3}/L = 0.10^{3}/0.050 = 0.020$ W/kg.`,
      },
      {
        title: '(c) Kolmogorov scales',
        md: md`$\eta = (\nu^{3}/\varepsilon)^{1/4} = (10^{-18}/0.020)^{1/4} = 8.4\times10^{-5}$ m ≈ 84 µm; $\tau_\eta = (\nu/\varepsilon)^{1/2} = (5.0\times10^{-5})^{1/2} = 7.1\times10^{-3}$ s ≈ 7 ms; $u_\eta = (\nu\varepsilon)^{1/4} = (2.0\times10^{-8})^{1/4} = 0.012$ m/s. Check: $u_\eta\eta/\nu = 0.0119 \times 8.41\times10^{-5}/10^{-6} = 1.0$ ✓.`,
      },
      {
        title: '(d) Size range',
        md: md`$L/\eta = 0.050/8.41\times10^{-5} = 595$, the same as $\Rey_L^{3/4} = 5000^{3/4} = 595$ ✓. $\log_2 595 \approx 9.2$: about nine halvings — Fig. 9.1's “large → medium → small” is really a ladder of about nine rungs here.`,
      },
      {
        title: '(e) Whole-pipe average from the pumping power',
        md: md`In steady flow all pumping work ends up as heat, so $\varepsilon_{\text{avg}} = (-\mathrm{d}p/\mathrm{d}z)\,\overline{v}/\rho = 2f_F\overline{v}^{3}/D = 2 \times 0.00444 \times 2.0^{3}/0.050 = 1.4$ W/kg, giving $\eta = (10^{-18}/1.42)^{1/4} = 2.9\times10^{-5}$ m ≈ 29 µm and $\tau_\eta = (10^{-6}/1.42)^{1/2} = 0.84$ ms.`,
      },
      {
        title: 'Compare',
        md: md`The two values of $\varepsilon$ differ by a factor of about 70 (the region near the wall dissipates far more than the core), yet $\eta$ differs only by $70^{1/4} \approx 2.9$. Either way the smallest eddies are tens of micrometres across and live for about a millisecond — Wilkes's fluctuations “in a matter of milliseconds” (p. 483).`,
      },
    ],
    answer: md`$\Rey = 1.0\times10^{5}$; $\varepsilon \approx 0.02$ W/kg (core estimate) to 1.4 W/kg (pipe average); $\eta \approx 30$–$80$ µm; $\tau_\eta \approx 1$–$7$ ms; $L/\eta \approx 600$ (≈ 9 halvings).`,
    insight: 'Because η ∝ ε^(−1/4), even a crude estimate of ε fixes the size of the smallest eddies to within a factor of 2–3.',
  },
  {
    id: 'ex-cascade-bookkeeping',
    concept: 'energy-cascade',
    title: 'Energy bookkeeping down the cascade',
    difficulty: 1,
    given: md`Model Fig. 9.1 in three dimensions: every eddy breaks into 8 eddies of half its diameter that fill the same volume. A large eddy in the pipe of the previous example is a ball of water of diameter $L = 5.0$ cm ($\rho = 1000$ kg/m³) through which energy flows at $\varepsilon = 0.020$ W/kg.`,
    find: md`The power handled by one eddy, and by all eddies together, in generations $n = 0$ (large) to $n = 3$.`,
    steps: [
      { title: 'Power entering the large eddy', md: md`Mass $m_0 = \rho\,\pi L^{3}/6 = 1000 \times \pi \times 0.050^{3}/6 = 0.0654$ kg, so $P_0 = \varepsilon\,m_0 = 0.020 \times 0.0654 = 1.31\times10^{-3}$ W $= 1.31$ mW.` },
      {
        title: 'Power per eddy',
        md: md`Generation $n$ holds $8^{n}$ eddies, each with $1/8^{n}$ of the mass and therefore (same $\varepsilon$) $1/8^{n}$ of the power: $P_n = P_0/8^{n}$ = 1.31 mW, 0.164 mW, 20.5 µW and 2.56 µW for $n = 0, 1, 2, 3$.`,
      },
      { title: 'Power per generation', md: md`$8^{n} \times P_0/8^{n} = P_0 = 1.31$ mW — the same for every generation.` },
      {
        title: 'Link to Wilkes',
        md: md`This is the statement on p. 481: the energy per eddy is highest for the large eddies, but there are so many more small eddies that the total passed down the chain stays essentially constant — until viscosity converts it into heat at the Kolmogorov limit.`,
      },
    ],
    answer: md`Per eddy: 1.31 mW → 0.164 mW → 20.5 µW → 2.56 µW; per generation: 1.31 mW at every level.`,
    insight: 'A bucket brigade: the buckets get smaller and more numerous, but the litres per second passed along never change.',
  },
  {
    id: 'ex-decompose',
    concept: 'time-averaging',
    title: 'Splitting a sampled signal into mean and fluctuation',
    difficulty: 1,
    given: md`Eight equally spaced samples of $v_x$ (m/s) from a hot-wire probe in a flow that is steady in the mean: 3.12, 2.95, 3.05, 2.88, 3.20, 2.97, 2.84, 2.99.`,
    find: md`$\overline{v}_x$, the fluctuations $v_x'$, and a check of Eqs. (9.2) and (9.3) on these data.`,
    assumptions: 'The samples span a period long compared with the fluctuations (a real record would hold thousands of samples).',
    steps: [
      { title: 'Time average', md: md`$\overline{v}_x = \tfrac18\,(3.12 + 2.95 + 3.05 + 2.88 + 3.20 + 2.97 + 2.84 + 2.99) = 24.00/8 = 3.00$ m/s.` },
      { title: 'Fluctuations from (9.1)', md: md`$v_x' = v_x - \overline{v}_x$: +0.12, −0.05, +0.05, −0.12, +0.20, −0.03, −0.16, −0.01 m/s.` },
      {
        title: 'Check (9.2)',
        md: md`Sum of the fluctuations $= 0.12 - 0.05 + 0.05 - 0.12 + 0.20 - 0.03 - 0.16 - 0.01 = 0.00$, so $\overline{v_x'} = 0$ ✓ — even though only 3 of the 8 samples lie above the mean.`,
      },
      { title: 'Check (9.3)', md: md`Averaging the mean itself: $\overline{\overline{v}_x} = \tfrac18\,(8 \times 3.00) = 3.00$ m/s $= \overline{v}_x$ ✓.` },
    ],
    answer: md`$\overline{v}_x = 3.00$ m/s; $v_x'$ = +0.12, −0.05, +0.05, −0.12, +0.20, −0.03, −0.16, −0.01 m/s, whose average is exactly zero.`,
    insight: '(9.2) balances areas, not counts: a few large positive excursions can balance many small negative ones.',
  },
  {
    id: 'ex-averaging-time',
    concept: 'time-averaging',
    title: 'How long must we average?',
    difficulty: 2,
    given: md`A hot-film probe in a pipe reads $\overline{v}_x \approx 1.5$ m/s with intensity $\widetilde{v'}/\overline{v} = 0.06$. The fluctuations lose their memory after about $T_I = 8$ ms (integral time scale).`,
    find: md`(a) the averaging time for the mean to be known to ±0.25 % (one standard deviation); (b) the uncertainty if only $T = 2$ s is used.`,
    assumptions: 'Flow steady in the mean; scatter formula for stationary random signals (supplementary).',
    steps: [
      { title: 'Formula', md: md`$\dfrac{\sigma_{\overline{v}}}{\overline{v}} \approx I\sqrt{\dfrac{2T_I}{T}}$ ⟹ $T = 2T_I\left(\dfrac{I}{e}\right)^{2}$, with intensity $I = 0.06$ and target $e = 0.0025$.` },
      { title: '(a) Required averaging time', md: md`$T = 2 \times 0.008 \times (0.06/0.0025)^{2} = 0.016 \times 576 = 9.2$ s.` },
      { title: '(b) With T = 2 s', md: md`$\sigma_{\overline{v}}/\overline{v} \approx 0.06\sqrt{2 \times 0.008/2} = 0.06 \times 0.0894 = 0.0054$, i.e. ±0.54 %.` },
      {
        title: 'Compare with Wilkes',
        md: md`Two seconds of millisecond-scale turbulence contain about $T/(2T_I) = 2/0.016 \approx 125$ independent “looks” at the flow — enough for an error near 0.5 %. That is the logic behind Wilkes's choice of “a few seconds” for $T$ (p. 483).`,
      },
    ],
    answer: md`(a) $T \approx 9$ s; (b) about ±0.5 % with $T = 2$ s.`,
    insight: 'The error of a time average shrinks only like 1/√T: halving it costs four times the averaging time.',
  },
  {
    id: 'ex-rms-intensity',
    concept: 'intensity',
    title: 'RMS and intensity from five readings',
    difficulty: 1,
    given: md`Five equally spaced samples of $v_x$ (m/s): 2.10, 1.95, 2.05, 1.90, 2.00.`,
    find: md`$\overline{v}_x$, the fluctuations, $\overline{v_x'^{2}}$, the RMS $\widetilde{v_x'}$ and the turbulence intensity.`,
    steps: [
      { title: 'Mean', md: md`$\overline{v}_x = (2.10 + 1.95 + 2.05 + 1.90 + 2.00)/5 = 10.00/5 = 2.00$ m/s.` },
      { title: 'Fluctuations', md: md`$v_x'$ = +0.10, −0.05, +0.05, −0.10, 0.00 m/s; they sum to zero, as (9.2) requires.` },
      { title: 'Mean square', md: md`Squares: 0.0100, 0.0025, 0.0025, 0.0100, 0 → $\overline{v_x'^{2}} = 0.0250/5 = 0.0050$ m²/s².` },
      { title: 'RMS, Eq. (9.5)', md: md`$\widetilde{v_x'} = \sqrt{0.0050} = 0.0707$ m/s.` },
      { title: 'Intensity, Eq. (9.4)', md: md`$\widetilde{v_x'}/\overline{v}_x = 0.0707/2.00 = 0.035$, i.e. 3.5 % — inside the typical range 0.01–0.1.` },
    ],
    answer: md`$\overline{v}_x = 2.00$ m/s, $\overline{v_x'^{2}} = 0.0050$ m²/s², $\widetilde{v_x'} = 0.0707$ m/s, intensity $= 0.035$ (3.5 %).`,
    insight: 'Order matters: subtract the mean, square, average, take the root — and only then divide by the mean.',
  },
  {
    id: 'ex-tke',
    concept: 'intensity',
    title: 'From three RMS values to k',
    difficulty: 2,
    given: md`A three-component probe in an air duct gives $\overline{v}_x = 10.0$ m/s ($\overline{v}_y = \overline{v}_z = 0$) and RMS fluctuations $\widetilde{v_x'} = 0.80$, $\widetilde{v_y'} = 0.55$, $\widetilde{v_z'} = 0.60$ m/s.`,
    find: md`(a) the intensity of each component relative to $\overline{v}_x$; (b) the turbulent kinetic energy $k$ (definition in Wilkes §9.12, p. 506); (c) the single “isotropic-equivalent” RMS $\sqrt{2k/3}$ and its intensity.`,
    steps: [
      { title: '(a) Component intensities', md: md`$0.80/10.0 = 0.080$, $\;0.55/10.0 = 0.055$, $\;0.60/10.0 = 0.060$ — all within 0.01–0.1, with the streamwise component the largest (the turbulence is *anisotropic*).` },
      { title: '(b) Turbulent kinetic energy', md: md`$k = \tfrac12\left(0.80^{2} + 0.55^{2} + 0.60^{2}\right) = \tfrac12\,(0.640 + 0.3025 + 0.360) = \tfrac12 \times 1.3025 = 0.651$ m²/s² (J/kg).` },
      { title: '(c) Isotropic equivalent', md: md`$\sqrt{2k/3} = \sqrt{2 \times 0.651/3} = \sqrt{0.434} = 0.659$ m/s, an intensity of $0.659/10.0 = 0.066$ (6.6 %).` },
    ],
    answer: md`(a) 0.080, 0.055, 0.060; (b) $k = 0.651$ m²/s²; (c) $\sqrt{2k/3} = 0.659$ m/s (6.6 %).`,
    insight: 'k bundles the three RMS values into a single energy — the “k” of the k–ε method that Wilkes previews on p. 481.',
  },
]

// ───────────────────────────────────────────────────────────────────────────────
// Practice problems
// ───────────────────────────────────────────────────────────────────────────────

export const practice: PracticeDef[] = [
  // what-is-turbulence
  {
    id: 'pr-heat-exchanger',
    concept: 'what-is-turbulence',
    difficulty: 1,
    q: md`Cooling water ($\nu = 0.80\times10^{-6}$ m²/s at about 30 °C) flows at a mean velocity of 1.2 m/s through the 19-mm-bore tubes of a shell-and-tube heat exchanger. Calculate the Reynolds number and state the expected flow regime.`,
    hint: md`$\Rey = \overline{v}D/\nu$; convert 19 mm to metres.`,
    answer: md`$\Rey \approx 2.85\times10^{4}$ — turbulent.`,
    solution: md`$\Rey = \dfrac{\overline{v}D}{\nu} = \dfrac{1.2 \times 0.019}{0.80\times10^{-6}} = \dfrac{0.0228}{0.80\times10^{-6}} = 28\,500$.

This is far above the pipe transition range (about 2000–4000), so the flow is turbulent — consistent with Wilkes (p. 480), who lists liquid flow in heat exchangers among the standard turbulent situations.`,
    check: [{ label: 'Re', value: 28500 }],
  },
  {
    id: 'pr-microchannel',
    concept: 'what-is-turbulence',
    difficulty: 2,
    q: md`A microfluidic chip has a channel of hydraulic diameter 200 µm carrying water ($\mu = 1.0\times10^{-3}$ Pa·s, $\nu = 1.0\times10^{-6}$ m²/s).

(a) What mean velocity would be needed to reach $\Rey = 2000$?
(b) Treating the channel as a round tube in laminar flow, $-\Delta p/L = 32\mu\overline{v}/D^{2}$ (Hagen–Poiseuille), estimate the pressure drop per centimetre at that velocity, in bar. Comment.`,
    hint: md`Rearrange $\Rey = \overline{v}D/\nu$. For (b) work in SI units and multiply by $L = 0.01$ m; 1 bar = $10^{5}$ Pa.`,
    answer: md`(a) $\overline{v} = 10$ m/s; (b) $\approx 0.8$ bar per cm — impractical, so microchannels run at mm/s to cm/s and stay laminar.`,
    solution: md`(a) $\overline{v} = \Rey\,\nu/D = 2000 \times 1.0\times10^{-6}/2.0\times10^{-4} = 10$ m/s.

(b) $-\Delta p/L = 32\mu\overline{v}/D^{2} = 32 \times 1.0\times10^{-3} \times 10/(2.0\times10^{-4})^{2} = 0.32/4.0\times10^{-8} = 8.0\times10^{6}$ Pa/m, i.e. $8.0\times10^{4}$ Pa = 0.80 bar for every centimetre of channel.

A few centimetres would need several bar — more than a typical bonded polymer chip can tolerate. Real microchannels run at mm/s to cm/s, where $\Rey \sim 0.1$–$1$. That is why Wilkes names microfluidics as a field in which the flow really is laminar.`,
    check: [
      { label: 'v̄ (m/s)', value: 10 },
      { label: 'Δp per cm (bar)', value: 0.8 },
    ],
  },
  {
    id: 'pr-blood',
    concept: 'what-is-turbulence',
    difficulty: 1,
    q: md`Blood ($\rho = 1060$ kg/m³, $\mu = 3.5\times10^{-3}$ Pa·s) leaves the heart through the aorta (diameter 25 mm) at a peak velocity of about 1.0 m/s. Estimate the peak Reynolds number. Is it plausible that Wilkes lists blood flow in the heart among turbulent flows?`,
    hint: md`$\Rey = \rho\overline{v}D/\mu$.`,
    answer: md`$\Rey \approx 7.6\times10^{3}$ — above the pipe transition range, so turbulence at peak flow is plausible.`,
    solution: md`$\Rey = \dfrac{1060 \times 1.0 \times 0.025}{3.5\times10^{-3}} = \dfrac{26.5}{3.5\times10^{-3}} = 7570$.

This exceeds the transition range for pipes (≈ 2000–4000), so turbulent — or at least strongly disturbed — flow at peak systole is plausible. The flow is pulsatile and the aorta is not a long straight pipe, so this is only an estimate.`,
    check: [{ label: 'Re', value: 7571 }],
  },
  {
    id: 'pr-karman-concept',
    concept: 'what-is-turbulence',
    difficulty: 2,
    q: md`A CFD simulation of flow past a cylinder at $\Rey = 100$ shows vortices shed alternately from the top and the bottom, and the velocity at a probe behind the cylinder oscillates for ever. A classmate argues: “The flow is unsteady and full of vortices, so it is turbulent.” Using Wilkes's discussion and Hinze's definition, explain whether this is right, and say what would have to change for the wake to become turbulent.`,
    hint: 'Look for the word “random” in the definition, and at what Wilkes says about the pattern of the shed vortices.',
    answer: md`Not turbulent: it is an **unstable laminar** flow — the vortices form a regular, periodic Kármán street, so the randomness criterion fails. The wake becomes turbulent only at substantially higher Re, when the velocity varies randomly in time and space.`,
    solution: md`Hinze's definition (Wilkes p. 480) requires an irregular flow whose quantities vary **randomly** with time and position, while still having well-defined averages.

At $\Rey = 100$ the laminar flow is unstable (p. 482): vortices are shed alternately from opposite sides and form a Kármán vortex street, but they are generated in a **regular pattern** — the probe signal repeats at a single frequency, cycle after cycle. It is predictable, not random, so Wilkes classes it as unstable but laminar.

For turbulence the Reynolds number must rise substantially (for a cylinder wake, to the order of $10^{3}$ and beyond — a supplementary value) until the nonlinear inertial terms amplify disturbances into eddies of many sizes and the signal becomes random. Unsteadiness, or the presence of vortices, is not the test; randomness is.`,
  },
  // energy-cascade
  {
    id: 'pr-eta-air',
    concept: 'energy-cascade',
    difficulty: 2,
    q: md`Air ($\nu = 1.5\times10^{-5}$ m²/s) flows at $\overline{v} = 6.0$ m/s in a ventilation duct of diameter 0.40 m with turbulence intensity 8 %. Taking $L \approx D$ and $\widetilde{v'} = 0.08\,\overline{v}$, estimate (a) $\varepsilon$ in W/kg, (b) the Kolmogorov length $\eta$ in mm, (c) the Kolmogorov time $\tau_\eta$ in ms.`,
    hint: md`$\varepsilon \sim \widetilde{v'}^{3}/L$, $\eta = (\nu^{3}/\varepsilon)^{1/4}$, $\tau_\eta = (\nu/\varepsilon)^{1/2}$.`,
    answer: md`(a) $\varepsilon \approx 0.28$ W/kg; (b) $\eta \approx 0.33$ mm; (c) $\tau_\eta \approx 7.4$ ms.`,
    solution: md`$\widetilde{v'} = 0.08 \times 6.0 = 0.48$ m/s.

(a) $\varepsilon \sim \widetilde{v'}^{3}/L = 0.48^{3}/0.40 = 0.1106/0.40 = 0.276$ W/kg.

(b) $\eta = (\nu^{3}/\varepsilon)^{1/4} = \left((1.5\times10^{-5})^{3}/0.276\right)^{1/4} = (3.375\times10^{-15}/0.276)^{1/4} = (1.22\times10^{-14})^{1/4} = 3.32\times10^{-4}$ m ≈ 0.33 mm.

(c) $\tau_\eta = (\nu/\varepsilon)^{1/2} = (1.5\times10^{-5}/0.276)^{1/2} = (5.43\times10^{-5})^{1/2} = 7.37\times10^{-3}$ s ≈ 7.4 ms.

Check: $\Rey_L = 0.48 \times 0.40/1.5\times10^{-5} = 12\,800$ and $L/\eta = 0.40/3.32\times10^{-4} = 1200 \approx 12\,800^{3/4}$ ✓. Air's larger $\nu$ makes its smallest eddies bigger than water's in a comparable flow.`,
    check: [
      { label: 'ε (W/kg)', value: 0.276 },
      { label: 'η (mm)', value: 0.332 },
      { label: 'τ_η (ms)', value: 7.37 },
    ],
  },
  {
    id: 'pr-re-tenfold',
    concept: 'energy-cascade',
    difficulty: 2,
    q: md`In a given pipe (same $L$, same fluid) the large-eddy Reynolds number $\Rey_L$ is increased ten-fold. By what factor does the Kolmogorov length $\eta$ shrink, and how many extra halving generations does the cascade gain?`,
    hint: md`$L/\eta \sim \Rey_L^{3/4}$; the number of halvings is $\log_2(L/\eta)$.`,
    answer: md`$\eta$ shrinks by $10^{3/4} \approx 5.6$; about 2.5 extra halvings.`,
    solution: md`With $L$ fixed, $\eta \propto \Rey_L^{-3/4}$, so $\eta_{\text{new}}/\eta_{\text{old}} = 10^{-3/4} = 1/5.62$: the smallest eddies become 5.6 times smaller.

The number of halvings $n = \log_2(L/\eta)$ grows by $\log_2 5.62 = 2.49$. A higher Re does not change the idea of Fig. 9.1 — it lengthens the ladder between the largest and the smallest eddies.`,
    check: [
      { label: 'shrink factor', value: 5.62 },
      { label: 'extra halvings', value: 2.49 },
    ],
  },
  {
    id: 'pr-fig91',
    concept: 'energy-cascade',
    difficulty: 1,
    q: md`Using Fig. 9.1 and Wilkes's text, answer briefly: (a) where do the large eddies in pipe flow get their energy, and how big are they? (b) where are they formed? (c) what is the fate of the small eddies, and why does the cascade stop there? (d) what stays “essentially constant” down the cascade?`,
    hint: 'Read Fig. 9.1 column by column, then the paragraphs around it (pp. 481–482).',
    answer: md`(a) From the pressure energy of the flow; of the order of the pipe diameter. (b) In the high-shear region near the wall. (c) Annihilated by viscous action: at the Kolmogorov limit the velocity varies over such short distances that the steep gradients let viscosity turn the mechanical energy into heat. (d) The total mechanical energy passed down the chain.`,
    solution: md`(a) Fig. 9.1 and p. 481: the first, large eddies form at the expense of the **pressure energy** of the flow and have a size of the same order as the **pipe diameter**.

(b) p. 482: relatively large rotational eddies form in the **high-shear region near the wall**.

(c) The large eddies are unstable and decompose into medium and then small eddies; the small ones are **annihilated by viscous action**. The cascade ends at the **Kolmogorov limit**: the eddies are so small that their velocity variations occur over very short distances, and the resulting high velocity gradients make viscosity effective, converting the mechanical energy into **heat**.

(d) Although each large eddy carries the most energy, there are so many more small eddies that the **total mechanical energy passed down the chain remains essentially constant** (p. 481).`,
  },
  {
    id: 'pr-cascade-power',
    concept: 'energy-cascade',
    difficulty: 1,
    q: md`A large eddy receives energy from the mean flow at 2.0 mW. Assume each eddy breaks into 8 eddies of half its diameter (3-D model of Fig. 9.1) and no energy is lost before the Kolmogorov limit. Find (a) the number of eddies in generation 3, (b) the power handled by each of them in µW, (c) their total power, and (d) how many times faster a generation-3 eddy turns over than the original one, using $\tau_\ell \propto \ell^{2/3}$.`,
    hint: md`Generation $n$: $8^{n}$ eddies of size $L/2^{n}$, sharing the same total power.`,
    answer: md`(a) 512; (b) 3.9 µW; (c) 2.0 mW; (d) 4 times faster.`,
    solution: md`(a) $8^{3} = 512$ eddies.

(b) The flux is the same at every level, so each eddy carries $2.0\ \text{mW}/512 = 3.9\times10^{-3}$ mW $= 3.9$ µW.

(c) $512 \times 3.9$ µW $= 2.0$ mW — the same as the large eddy: the total passed down stays constant (Wilkes p. 481).

(d) Size ratio $1/2^{3} = 1/8$; with $\tau \propto \ell^{2/3}$, $\tau_3/\tau_0 = (1/8)^{2/3} = 1/4$: the small eddies turn over 4 times faster. Smaller eddies are weaker but quicker — which is why the finest wiggles of Fig. 9.3 last only milliseconds.`,
    check: [
      { label: 'power per eddy (µW)', value: 3.906 },
      { label: 'speed-up factor', value: 4 },
    ],
  },
  // time-averaging
  {
    id: 'pr-vy-samples',
    concept: 'time-averaging',
    difficulty: 1,
    q: md`Six equally spaced samples of the radial velocity component $v_y$ (m/s) at one point in fully developed pipe flow are 0.04, −0.06, 0.02, −0.01, 0.05, −0.04. (a) Find $\overline{v}_y$. (b) Write down $v_y'$ for each sample. (c) Find $\overline{v_y'^{2}}$. What does this say about a component whose mean is zero?`,
    hint: md`Use (9.1): $v_y' = v_y - \overline{v}_y$. Square before averaging.`,
    answer: md`(a) $\overline{v}_y = 0$; (b) $v_y' = v_y$ (the same six numbers); (c) $\overline{v_y'^{2}} = 1.63\times10^{-3}$ m²/s² — zero mean does not mean zero fluctuation.`,
    solution: md`(a) Sum $= 0.04 - 0.06 + 0.02 - 0.01 + 0.05 - 0.04 = 0.00$, so $\overline{v}_y = 0$ — as expected, with no net radial flow in fully developed pipe flow.

(b) $v_y' = v_y - 0$: 0.04, −0.06, 0.02, −0.01, 0.05, −0.04 m/s; their average is zero, as (9.2) requires.

(c) Squares: 0.0016, 0.0036, 0.0004, 0.0001, 0.0025, 0.0016 (m²/s²); sum $= 0.0098$; $\overline{v_y'^{2}} = 0.0098/6 = 1.63\times10^{-3}$ m²/s² (RMS ≈ 0.040 m/s).

A component can have **zero mean but vigorous fluctuations**: turbulence is three-dimensional (Fig. 9.2), and these cross-stream fluctuations are what carry momentum and heat across the pipe.`,
    check: [
      { label: 'v̄_y (m/s)', value: 0, tol: 0.005 },
      { label: 'mean of v_y′² (m²/s²)', value: 0.001633 },
    ],
  },
  {
    id: 'pr-averaging-time',
    concept: 'time-averaging',
    difficulty: 2,
    q: md`In an air duct the turbulence intensity is 10 % and the integral time scale of the fluctuations is 20 ms. How long must the signal be averaged for the scatter of the measured mean to be ±0.5 % (one standard deviation)? How long for ±0.25 %?`,
    hint: md`$T = 2T_I\,(I/e)^{2}$.`,
    answer: md`16 s for ±0.5 %; 64 s for ±0.25 %.`,
    solution: md`$T = 2T_I\,(I/e)^{2} = 2 \times 0.020 \times (0.10/0.005)^{2} = 0.040 \times 400 = 16$ s.

Halving the target error to 0.25 % multiplies $T$ by 4: 64 s. Here “a few seconds” would not be enough, because the fluctuations are stronger and slower than in Wilkes's millisecond example — the rule is always $T \gg$ the fluctuation time scale.`,
    check: [
      { label: 'T for ±0.5 % (s)', value: 16 },
      { label: 'T for ±0.25 % (s)', value: 64 },
    ],
  },
  {
    id: 'pr-steady-mean',
    concept: 'time-averaging',
    difficulty: 2,
    q: md`Which of these flows are *steady in the mean*? For those that are not, how would you choose the averaging time $T$?

(a) fully developed turbulent flow in a pipe fed by a pump at constant speed;
(b) the same pipe while a valve is closed slowly over 10 minutes;
(c) a turbulent jet issuing from a nozzle supplied at a constant rate;
(d) turbulent tidal flow in an estuary (tidal period about 12.4 h).`,
    hint: 'Steady in the mean = the time-averaged quantities do not change with time. Compare the fluctuation time scale with the time scale of the slow changes.',
    answer: md`(a) and (c) are steady in the mean (Wilkes's pipes and jets). (b) and (d) are not: choose $T$ long compared with the turbulent fluctuations but short compared with the slow change — a few seconds in (b), minutes in (d).`,
    solution: md`(a) **Steady in the mean.** The pump holds the flow rate constant, so $\overline{v}_z$ and $\overline{p}$ do not change with time although the instantaneous values fluctuate on millisecond scales — the type of flow Wilkes generally treats (p. 483).

(b) **Not steady in the mean**: the mean velocity falls over minutes. Average over a $T$ that is long compared with the fluctuations (≫ ms — a few seconds) but short compared with 10 minutes, and treat the result as a slowly varying mean $\overline{v}(t)$: Wilkes's case where the time averages “fluctuate slowly with time”.

(c) **Steady in the mean**: a jet fed at a constant rate (Wilkes's other example).

(d) **Not steady in the mean** on the tidal scale: average over minutes (many turbulent fluctuations, yet much less than 12.4 h) and follow how the mean changes through the tide.`,
  },
  // intensity
  {
    id: 'pr-skewed',
    concept: 'intensity',
    difficulty: 2,
    q: md`A velocity fluctuation is −0.10 m/s for 80 % of the time and +0.40 m/s for the remaining 20 %. (a) Show that it is a legitimate fluctuation, i.e. its time average is zero. (b) Find its RMS. (c) If the mean velocity is 2.5 m/s, what is the turbulence intensity?`,
    hint: md`Time averages of a two-level signal are time-weighted averages. For the RMS, average $v'^{2}$ first.`,
    answer: md`(a) $\overline{v'} = 0$; (b) $\widetilde{v'} = 0.20$ m/s; (c) 0.08 (8 %).`,
    solution: md`(a) $\overline{v'} = 0.8\,(-0.10) + 0.2\,(+0.40) = -0.08 + 0.08 = 0$ ✓ — even though $v'$ is negative 80 % of the time.

(b) $\overline{v'^{2}} = 0.8\,(0.10)^{2} + 0.2\,(0.40)^{2} = 0.008 + 0.032 = 0.040$ m²/s², so $\widetilde{v'} = \sqrt{0.040} = 0.20$ m/s (9.5).

(c) $\widetilde{v'}/\overline{v} = 0.20/2.5 = 0.08$, inside Wilkes's typical range 0.01–0.1 (9.4).

Wilkes's “equally likely to be above or below the mean” is the intuitive reading of (9.2); strictly, what balances is the *area* (size × duration) of the excursions.`,
    check: [
      { label: 'mean (m/s)', value: 0, tol: 0.005 },
      { label: 'RMS (m/s)', value: 0.2 },
      { label: 'intensity', value: 0.08 },
    ],
  },
  {
    id: 'pr-rms-data',
    concept: 'intensity',
    difficulty: 1,
    q: md`Return to the eight readings of the time-averaging example (3.12, 2.95, 3.05, 2.88, 3.20, 2.97, 2.84, 2.99 m/s; mean 3.00 m/s). Find $\overline{v_x'^{2}}$, the RMS $\widetilde{v_x'}$ and the turbulence intensity.`,
    hint: 'Square the eight fluctuations (+0.12, −0.05, …), average them, then take the square root.',
    answer: md`$\overline{v_x'^{2}} = 0.01255$ m²/s², $\widetilde{v_x'} = 0.112$ m/s, intensity $= 0.037$ (3.7 %).`,
    solution: md`Fluctuations: +0.12, −0.05, +0.05, −0.12, +0.20, −0.03, −0.16, −0.01 m/s.

Squares: 0.0144, 0.0025, 0.0025, 0.0144, 0.0400, 0.0009, 0.0256, 0.0001 (m²/s²); sum $= 0.1004$.

$\overline{v_x'^{2}} = 0.1004/8 = 0.01255$ m²/s²; $\widetilde{v_x'} = \sqrt{0.01255} = 0.112$ m/s; intensity $= 0.112/3.00 = 0.037$ (3.7 %), within the typical 0.01–0.1.`,
    check: [
      { label: 'RMS (m/s)', value: 0.112 },
      { label: 'intensity', value: 0.0373 },
    ],
  },
  {
    id: 'pr-mean-square',
    concept: 'intensity',
    difficulty: 2,
    q: md`At a point in a turbulent flow $\overline{v}_x = 3.0$ m/s and $\widetilde{v_x'} = 0.30$ m/s. (a) Find $\overline{v_x^{2}}$ and compare it with $\overline{v}_x^{\,2}$. (b) What is the time-averaged kinetic energy per unit mass of this component, $\tfrac12\overline{v_x^{2}}$?`,
    hint: md`Expand $(\overline{v}_x + v_x')^{2}$, average term by term, then use (9.2), (9.3) and (9.5).`,
    answer: md`(a) $\overline{v_x^{2}} = 9.09$ m²/s², 1 % more than $\overline{v}_x^{\,2} = 9.00$ m²/s²; (b) 4.545 J/kg.`,
    solution: md`$(\overline{v}_x + v_x')^{2} = \overline{v}_x^{\,2} + 2\overline{v}_x v_x' + v_x'^{2}$. Averaging: $\overline{\overline{v}_x^{\,2}} = \overline{v}_x^{\,2}$ (9.3); $\overline{2\overline{v}_x v_x'} = 2\overline{v}_x\,\overline{v_x'} = 0$ (9.2); $\overline{v_x'^{2}} = \widetilde{v_x'}^{\,2}$ (9.5). Hence

$$
\overline{v_x^{2}} = \overline{v}_x^{\,2} + \widetilde{v_x'}^{\,2} = 3.0^{2} + 0.30^{2} = 9.00 + 0.09 = 9.09\ \mathrm{m^2/s^2}.
$$

(b) $\tfrac12\overline{v_x^{2}} = 4.545$ J/kg, of which 0.045 J/kg is carried by the fluctuations. The average of a square — or of any product — is **not** the product of the averages: the seed of the Reynolds stresses in the next topic.`,
    check: [
      { label: 'mean of v_x² (m²/s²)', value: 9.09 },
      { label: 'KE (J/kg)', value: 4.545 },
    ],
  },
  {
    id: 'pr-k-iso',
    concept: 'intensity',
    difficulty: 1,
    q: md`Near the centre of a pipe the mean velocity is 5.0 m/s and the turbulence intensity is 4 % in every direction (isotropic). Find the RMS fluctuation $\widetilde{v'}$ and the turbulent kinetic energy $k$.`,
    hint: md`$\widetilde{v'} = (\text{intensity}) \times \overline{v}$; for isotropic turbulence $k = \tfrac32\widetilde{v'}^{2}$.`,
    answer: md`$\widetilde{v'} = 0.20$ m/s; $k = 0.060$ m²/s².`,
    solution: md`$\widetilde{v'} = 0.04 \times 5.0 = 0.20$ m/s (9.4). With $\widetilde{v_x'} = \widetilde{v_y'} = \widetilde{v_z'} = 0.20$ m/s, $k = \tfrac12\,(3 \times 0.20^{2}) = \tfrac32 \times 0.040 = 0.060$ m²/s² (J/kg).`,
    check: [
      { label: 'RMS (m/s)', value: 0.2 },
      { label: 'k (m²/s²)', value: 0.06 },
    ],
  },
]

// ───────────────────────────────────────────────────────────────────────────────
// Quiz
// ───────────────────────────────────────────────────────────────────────────────

export const quiz: QuizQ[] = [
  {
    id: 'q-hinze',
    concept: 'what-is-turbulence',
    difficulty: 1,
    src: { doc: 'wilkes', pages: '480' },
    q: 'Which description matches the definition of turbulence that Wilkes quotes from Hinze?',
    options: [
      'An irregular flow whose quantities vary randomly with time and position, yet statistically distinct average values can still be identified',
      'Any unsteady flow, i.e. one in which the velocity at a fixed point changes with time',
      'A flow containing vortices that are shed in a regular, periodic pattern',
      'A flow so chaotic that no meaningful average velocity or pressure exists',
    ],
    answer: 0,
    explain:
      'Hinze’s definition has two halves: random variation in time and space, and well-defined averages. “Unsteady” is not enough (a periodic flow is unsteady but predictable), and the claim that no averages exist contradicts the second half — the one that makes engineering calculations possible.',
  },
  {
    id: 'q-karman',
    concept: 'what-is-turbulence',
    difficulty: 2,
    src: { doc: 'wilkes', pages: '482' },
    q: 'At Re = 100 the flow past a cylinder sheds vortices alternately, forming a Kármán vortex street. How does Wilkes classify it?',
    options: [
      'Unstable but laminar — the vortices form a regular pattern, so the randomness criterion of turbulence is not met',
      'Turbulent — any vortex shedding is turbulence',
      'Turbulent — Re = 100 is above the transition Reynolds number of every flow',
      'Steady laminar — the vortices are only a numerical artefact of the CFD',
    ],
    answer: 0,
    explain:
      'Wilkes (p. 482) uses this case to show that laminar flow can be unstable without being turbulent: the shedding is regular, not random or chaotic. Vortices alone do not make a flow turbulent, and the street is a real, well-documented flow pattern, not an artefact.',
  },
  {
    id: 'q-re-role',
    concept: 'what-is-turbulence',
    difficulty: 2,
    src: { doc: 'wilkes', pages: '481' },
    q: 'According to Wilkes, why does turbulence become likely at high Reynolds numbers?',
    options: [
      'The nonlinear inertial terms of the Navier–Stokes equations dominate and amplify small perturbations instead of viscosity damping them',
      'The viscosity of the fluid increases with velocity and destabilises the flow',
      'At high Re the fluid becomes compressible, which creates random density waves',
      'High Re means the pipe wall is rough, and roughness alone makes every flow turbulent',
    ],
    answer: 0,
    explain:
      'Re compares inertial with viscous effects. At low Re viscosity dampens perturbations; at high Re the nonlinear inertial terms amplify them, and eddies appear on top of the general flow. Viscosity does not grow with velocity for a Newtonian fluid, and compressibility or roughness is not the mechanism Wilkes describes.',
  },
  {
    id: 'q-laminar-fields',
    concept: 'what-is-turbulence',
    difficulty: 1,
    src: { doc: 'wilkes', pages: '480' },
    q: 'Which two fields does Wilkes name as important cases in which the flow really is laminar?',
    options: ['Polymer processing and microfluidics', 'Gas pipelines and heat exchangers', 'Combustion of gases and industrial reactors', 'Blood flow in the heart and turbulent jets'],
    answer: 0,
    explain:
      'Polymer processing (high viscosities) and microfluidics (very tiny channels) both keep Re small. The other pairs are exactly the examples Wilkes gives of turbulent situations.',
  },
  {
    id: 'q-cascade-source',
    concept: 'energy-cascade',
    difficulty: 1,
    src: { doc: 'wilkes', pages: '481', note: 'Fig. 9.1' },
    q: 'In Fig. 9.1, the large eddies in pipe flow obtain their energy from…',
    options: ['the pressure energy of the flow', 'the medium eddies', 'viscous heating of the fluid near the wall', 'the small eddies that merge back together'],
    answer: 0,
    explain:
      'The cascade runs one way: pressure energy of the mean flow → large eddies → medium → small → heat. Medium eddies receive energy from the large ones (not the other way round), and viscous heating is where the energy ends, not where it starts.',
  },
  {
    id: 'q-cascade-constant',
    concept: 'energy-cascade',
    difficulty: 2,
    src: { doc: 'wilkes', pages: '481' },
    q: 'The energy per eddy is highest for the large eddies. According to Wilkes, what remains essentially constant down the cascade?',
    options: [
      'The total amount of mechanical energy passed down the chain, because there are so many more small eddies',
      'The energy of each individual eddy',
      'The size of the eddies at every stage',
      'The number of eddies at every stage',
    ],
    answer: 0,
    explain:
      'Each smaller eddy carries less energy, but their number grows so fast that the total handed down the chain stays essentially constant until viscosity takes over. Neither the size nor the number of eddies is constant — both change at every stage.',
  },
  {
    id: 'q-kolmogorov',
    concept: 'energy-cascade',
    difficulty: 2,
    src: [
      { doc: 'wilkes', pages: '481' },
      { doc: 'wilkes', pages: '483' },
    ],
    q: 'What happens at the Kolmogorov limit?',
    options: [
      'The eddies are so small that velocity varies over very short distances; the high gradients let viscosity convert the mechanical energy into heat',
      'The eddies become smaller than the molecules, so the continuum assumption fails',
      'The smallest eddies merge back into one large eddy and the cascade restarts',
      'The whole pipe flow becomes laminar again',
    ],
    answer: 0,
    explain:
      'Wilkes: the cascade terminates when velocity variations occur over such short distances that the resulting high velocity gradients make viscosity effective, turning mechanical energy into heat — and a magnified trace finally looks smooth (p. 483). Kolmogorov eddies are tens of micrometres in water, far larger than molecules, and the bulk flow stays turbulent.',
  },
  {
    id: 'q-richardson',
    concept: 'energy-cascade',
    difficulty: 1,
    src: [
      { doc: 'wilkes', pages: '481' },
      { doc: 'wilkes', pages: '482' },
    ],
    q: 'According to Mathieu and Scott, as cited by Wilkes, who first postulated the energy cascade from large to small eddies?',
    options: ['Lewis F. Richardson', 'Horace Lamb', 'J. O. Hinze', 'Osborne Reynolds'],
    answer: 0,
    explain:
      'Richardson (Weather Prediction by Numerical Process, 1922) summed it up in the verse beginning “Big whorls have little whorls”. Lamb appears in the anecdote about turbulence being hard to understand, and Hinze supplied the definition of turbulence.',
  },
  {
    id: 'q-T-choice',
    concept: 'time-averaging',
    difficulty: 1,
    src: { doc: 'wilkes', pages: '483' },
    q: 'The velocity fluctuations in Fig. 9.3 change within a few milliseconds. Which averaging period T does Wilkes consider appropriate?',
    options: ['A few seconds', 'A few microseconds', 'A few milliseconds', 'Exactly one fluctuation period'],
    answer: 0,
    explain:
      'T must be very large compared with the time scale of the individual fluctuations, so for millisecond fluctuations a few seconds is appropriate. A T of milliseconds (or one period) would follow the fluctuations instead of averaging them out; microseconds would be even worse.',
  },
  {
    id: 'q-zero-mean',
    concept: 'time-averaging',
    difficulty: 2,
    src: { doc: 'wilkes', pages: '483' },
    q: md`For a flow that is steady in the mean, which set of statements is correct?`,
    options: [
      md`$\overline{v_x'} = 0$ and $\overline{\overline{v}_x} = \overline{v}_x$, but $\overline{v_x'^{2}} > 0$`,
      md`$\overline{v_x'} = 0$, which means $v_x' = 0$ at every instant`,
      md`$\overline{v_x'^{2}} = 0$, because positive and negative fluctuations cancel`,
      md`$\overline{v}_x$ itself fluctuates on the millisecond scale`,
    ],
    answer: 0,
    explain: md`(9.2) and (9.3) hold, but squares never cancel: $v_x'^{2} \ge 0$, so its average is positive whenever the flow fluctuates. A zero *average* says nothing about the instantaneous values, and the mean of a flow steady in the mean is constant in time.`,
  },
  {
    id: 'q-steady-mean',
    concept: 'time-averaging',
    difficulty: 1,
    src: { doc: 'wilkes', pages: '483' },
    q: 'What does “steady in the mean” mean?',
    options: [
      'The time-averaged quantities do not vary with time, although the instantaneous values keep fluctuating',
      'The instantaneous velocity is constant in time',
      'The fluctuations have zero RMS value',
      'The flow is laminar',
    ],
    answer: 0,
    explain:
      'Pipe and jet flows of this chapter are steady in the mean: v̄ and p̄ are constant, while v′ and p′ fluctuate on millisecond scales. A constant instantaneous velocity or zero RMS would mean there is no turbulence at all.',
  },
  {
    id: 'q-3d',
    concept: 'time-averaging',
    difficulty: 2,
    src: { doc: 'wilkes', pages: '482', note: 'Fig. 9.2' },
    q: 'Which statement about the velocity fluctuations at a point P (Fig. 9.2) is correct?',
    options: [
      'All three components fluctuate, because turbulence is inherently three-dimensional',
      'Only the component along the mean flow fluctuates',
      'In pipe flow only the axial component fluctuates, because the mean flow is axial',
      'Because pipe flow can be analysed in r and z, the fluctuations there are two-dimensional',
    ],
    answer: 0,
    explain:
      'Wilkes stresses that turbulence is inherently 3-D: at any point all three components fluctuate in time. His footnote 4 only says that useful information can still be obtained when just two coordinates (r and z in pipe flow) are of primary interest — it does not say the fluctuations become two-dimensional. Cross-stream fluctuations exist even where the mean flow is purely axial.',
  },
  {
    id: 'q-intensity-range',
    concept: 'intensity',
    difficulty: 1,
    src: { doc: 'wilkes', pages: '484', note: 'Eq. (9.4)' },
    q: md`According to Eq. (9.4), the turbulence intensity $\widetilde{v'}/\overline{v}$ typically lies in the range…`,
    options: ['0.01 to 0.1', '1 to 10', '10⁻⁵ to 10⁻⁴', 'exactly zero, because the fluctuations average to zero'],
    answer: 0,
    explain:
      'Typical intensities are 1 % to 10 % of the mean velocity. “1 to 10” confuses a fraction with a percentage, and zero would follow only if one (wrongly) used the plain average of v′ instead of its RMS.',
  },
  {
    id: 'q-why-rms',
    concept: 'intensity',
    difficulty: 2,
    src: { doc: 'wilkes', pages: '484', note: 'Eq. (9.5)' },
    q: md`Why is the intensity defined with the RMS $\widetilde{v'}$ rather than with the time average of $v'$?`,
    options: [
      md`Because $\overline{v'} = 0$ by definition (9.2), so it says nothing about the size of the fluctuations; squaring before averaging makes every excursion count positively`,
      md`Because the RMS is always smaller than $\overline{v'}$`,
      md`Because $v'$ is always positive, so its average would overestimate the turbulence`,
      md`Because taking the RMS removes the mean velocity from $v$`,
    ],
    answer: 0,
    explain: md`The plain average of any fluctuation is zero, whatever its size. Squaring makes positive and negative excursions both contribute; the square root restores velocity units. $v'$ is not always positive, and removing the mean is done by (9.1), not by the RMS.`,
  },
  {
    id: 'q-intensity-calc',
    concept: 'intensity',
    difficulty: 2,
    q: md`A hot-wire gives $\overline{v} = 8.0$ m/s and $\overline{v'^{2}} = 0.16$ m²/s². What is the turbulence intensity?`,
    options: ['0.05', '0.02', '0.0025', '0.4'],
    answer: 0,
    explain: md`$\widetilde{v'} = \sqrt{0.16} = 0.40$ m/s, and $0.40/8.0 = 0.05$. 0.02 forgets the square root ($0.16/8$), 0.0025 divides the mean square by $\overline{v}^{2}$ ($0.16/64$) — which is the square of the intensity — and 0.4 is the RMS itself, not divided by the mean.`,
  },
]

// ───────────────────────────────────────────────────────────────────────────────
// Flashcards
// ───────────────────────────────────────────────────────────────────────────────

export const flashcards: Flashcard[] = [
  {
    id: 'fc-hinze',
    front: 'Hinze’s definition of turbulence (quoted by Wilkes)',
    back: 'Irregular flow: velocity, pressure etc. change randomly in time and from point to point — yet well-defined (statistically distinct) averages still exist. Both halves matter: random detail, reproducible means.',
    src: { doc: 'wilkes', pages: '480' },
  },
  {
    id: 'fc-laminar-fields',
    front: 'Two fields where flow is genuinely laminar (Wilkes)',
    back: 'Polymer processing (high viscosity) and microfluidics (very tiny channels) — both keep Re small. Elsewhere turbulence is the normal state.',
    src: { doc: 'wilkes', pages: '480' },
  },
  {
    id: 'fc-re-role',
    front: 'Low Re versus high Re (Wilkes p. 481)',
    back: 'Low Re: viscous effects dominate and damp small perturbations. High Re: nonlinear inertial terms dominate and amplify them, so eddies appear on top of the general flow.',
    src: { doc: 'wilkes', pages: '481' },
  },
  {
    id: 'fc-karman',
    front: 'Is a Kármán vortex street at Re = 100 turbulent?',
    back: 'No. The laminar flow is unstable and sheds vortices alternately, but in a regular pattern — it fails the randomness/chaos criterion of turbulence.',
    src: { doc: 'wilkes', pages: '482' },
  },
  {
    id: 'fc-fig91',
    front: 'Fig. 9.1 in one line',
    back: 'Large eddies (high energy, from the pressure energy of the flow) → medium (from large) → small (from medium) → annihilated by viscous action.',
    src: { doc: 'wilkes', pages: '481', note: 'Fig. 9.1' },
  },
  {
    id: 'fc-kolmogorov',
    front: 'The Kolmogorov limit',
    back: 'End of the cascade: velocity varies over such short distances that the high gradients let viscosity turn mechanical energy into heat. Magnified, the velocity trace finally looks smooth.',
    src: [
      { doc: 'wilkes', pages: '481' },
      { doc: 'wilkes', pages: '483' },
    ],
  },
  {
    id: 'fc-eta',
    front: md`Kolmogorov scales (supplementary estimate)`,
    back: md`$\eta = (\nu^{3}/\varepsilon)^{1/4}$, $\tau_\eta = (\nu/\varepsilon)^{1/2}$, $u_\eta = (\nu\varepsilon)^{1/4}$ with $\varepsilon \sim \widetilde{v'}^{3}/L$; $L/\eta \sim \Rey_L^{3/4}$.`,
  },
  {
    id: 'fc-decomp',
    front: md`Eq. (9.1)`,
    back: md`$v_x = \overline{v}_x + v_x'$, $v_y = \overline{v}_y + v_y'$, $v_z = \overline{v}_z + v_z'$, $p = \overline{p} + p'$ — at any point and any instant.`,
    src: { doc: 'wilkes', pages: '483', note: 'Eq. (9.1)' },
  },
  {
    id: 'fc-T',
    front: 'How long must the averaging time T be?',
    back: 'Very large compared with the time scale of the fluctuations: for millisecond fluctuations, a T of a few seconds.',
    src: { doc: 'wilkes', pages: '483' },
  },
  {
    id: 'fc-rules',
    front: md`Eqs. (9.2) and (9.3)`,
    back: md`$\overline{v_x'} = \overline{v_y'} = \overline{v_z'} = \overline{p'} = 0$ (by definition) and $\overline{\overline{v}_x} = \overline{v}_x$ — but $\overline{v'^{2}} > 0$ and $\overline{v_x'v_y'} \ne 0$ in general.`,
    src: { doc: 'wilkes', pages: '483' },
  },
  {
    id: 'fc-intensity',
    front: md`Eq. (9.4) — turbulence intensity`,
    back: md`$\widetilde{v'}/\overline{v} \sim 0.01$ to $0.1$ (1 % to 10 %).`,
    src: { doc: 'wilkes', pages: '484', note: 'Eq. (9.4)' },
  },
  {
    id: 'fc-rms',
    front: md`Eq. (9.5) — RMS`,
    back: md`$\widetilde{v'} = \sqrt{\overline{v'^{2}}}$: subtract the mean, square, average, take the root.`,
    src: { doc: 'wilkes', pages: '484', note: 'Eq. (9.5)' },
  },
  {
    id: 'fc-k',
    front: md`$k$ from the RMS fluctuations`,
    back: md`$k = \tfrac12\bigl(\widetilde{v_x'}^{2} + \widetilde{v_y'}^{2} + \widetilde{v_z'}^{2}\bigr)$; isotropic: $k = \tfrac32\widetilde{v'}^{2}$ (definition of $k$: Wilkes §9.12).`,
    src: { doc: 'wilkes', pages: '506' },
  },
]

// ───────────────────────────────────────────────────────────────────────────────
// Topic takeaways
// ───────────────────────────────────────────────────────────────────────────────

export const takeaways: string[] = [
  md`**Definition (Hinze, quoted by Wilkes):** turbulence is irregular flow whose quantities vary *randomly* in time and space, yet with statistically distinct *averages* — randomness makes it hard, the averages make engineering possible.`,
  md`**Turbulence is the normal state** of process flows (pipelines, heat exchangers, reactors, combustion, blood in the heart); genuinely laminar exceptions keep Re small — high-viscosity polymer processing and microfluidics.`,
  md`**Reynolds number = inertial vs viscous effects:** at low Re viscosity damps perturbations; at high Re the nonlinear inertial terms amplify them into eddies. Wall shear and wakes also promote turbulence.`,
  md`**Unsteady ≠ turbulent:** the Re = 100 Kármán vortex street is unstable but *regular*, hence laminar. The test is randomness.`,
  md`**Energy cascade (Fig. 9.1):** large eddies (≈ pipe diameter, fed by the pressure energy of the flow, formed near the wall) → medium → small → annihilated by viscosity. Energy per eddy falls, but the total passed down stays essentially constant (Richardson's “big whorls have little whorls”).`,
  md`**Kolmogorov limit:** the cascade ends where velocity varies over very short distances and viscosity turns the energy into heat; supplementary estimates $\eta = (\nu^{3}/\varepsilon)^{1/4}$, $\tau_\eta = (\nu/\varepsilon)^{1/2}$ give tens of micrometres and about 1–7 ms in a typical water pipe.`,
  md`**Time average:** overbar = mean over $T \gg$ fluctuation time scale (millisecond fluctuations → $T$ of a few seconds). Turbulence is 3-D, so every component fluctuates.`,
  md`**Eqs. (9.1)–(9.3):** $v = \overline{v} + v'$ (also for $p$); $\overline{v'} = 0$; $\overline{\overline{v}} = \overline{v}$. Flows such as pipes and jets are *steady in the mean*.`,
  md`**Trap:** averages of products of fluctuations do **not** vanish — $\overline{v'^{2}} > 0$, $\overline{v_x'v_y'} \ne 0$, and $\overline{v^{2}} = \overline{v}^{2} + \widetilde{v'}^{2}$. This is where the Reynolds stresses (next topic) come from.`,
  md`**Intensity (9.4)–(9.5):** $\widetilde{v'}/\overline{v} \sim 0.01$–$0.1$ with $\widetilde{v'} = \sqrt{\overline{v'^{2}}}$ — square, average, root, then divide by the mean; never use $\overline{v'}$.`,
  md`**Notation:** Wilkes $\overline{v}_x$, $v_x'$, $\widetilde{v'}$ ↔ Fox $\bar u$, $u'$; $k = \tfrac12(\widetilde{v_x'}^{2} + \widetilde{v_y'}^{2} + \widetilde{v_z'}^{2})$ links the RMS values to the $k$–$\varepsilon$ model.`,
]

// ───────────────────────────────────────────────────────────────────────────────
// Content
// ───────────────────────────────────────────────────────────────────────────────

export default function Content() {
  return (
    <>
      {/* ═════════════════════════ Concept 1 ═════════════════════════ */}
      <Concept id="what-is-turbulence">
        <Step kind="intro" src={{ doc: 'wilkes', pages: '480–482' }}>
          <Md>{md`
            Wilkes opens Chapter 9 with a definition he attributes to **J. O. Hinze** (1959): turbulent motion is an **irregular condition of flow** in which the various quantities **vary randomly with time and with the space coordinates**, yet **statistically distinct average values can still be discerned**. Both halves matter:

            - *random in time and space* — you cannot predict the velocity at a point even a moment ahead;
            - *with well-defined averages* — the mean velocity, the pressure drop or a heat-transfer coefficient is nevertheless perfectly reproducible, and that is what engineers design with. Everything in this topic's time averaging rests on this second half.

            A thorough understanding of turbulence has not been achieved and may not be in the foreseeable future, which is why it is sometimes skipped in introductory courses. Wilkes argues against that: however neat the laminar solutions are, **turbulence is the more normal state of affairs in fluid flow**.
          `}</Md>
          <Compare
            items={[
              {
                title: 'Genuinely laminar — “at least two fields” (p. 480)',
                md: md`- **Polymer processing** — typically very high viscosities.
- **Microfluidics** — very tiny channel dimensions.

These are examples Wilkes gives, not a complete list. Both keep the Reynolds number small.`,
                tone: 'emerald',
              },
              {
                title: 'Turbulent — the everyday case (p. 480)',
                md: md`- gas flow in long-distance pipelines
- liquid flow in heat exchangers
- blood flow in the heart
- combustion of gases
- many industrial reactors, and so on.`,
                tone: 'rose',
              },
            ]}
          />
          <Callout kind="note" title="Why turbulence has a reputation (p. 480)">
            <Md>{md`Wilkes recalls an anecdote told by Parviz Moin and John Kim: in a 1932 address to the British Association for the Advancement of Science, **Horace Lamb** reportedly said that when he died and went to heaven he hoped to be enlightened on two matters — quantum electrodynamics and the turbulent motion of fluids — and that he was rather optimistic only about the first.`}</Md>
          </Callout>
          <Md>{md`
            **When does turbulence appear?** (pp. 481–482)

            - The **Reynolds number** measures the relative importance of *inertial* to *viscous* effects. At **low Re** viscous effects dominate and *dampen* any small perturbation. At **higher Re** the *nonlinear inertial terms* of the Navier–Stokes equations predominate and *amplify* small perturbations — eddies then appear on top of the general trend of the flow (next concept).
            - Turbulence is also **promoted by the shearing action of a solid surface**, and tends to be **enhanced in the wake** downstream of an object such as an airplane wing or a golf ball.
            - **Unstable is not the same as turbulent.** At moderate Re a *laminar* flow can be *unstable* without being turbulent. Wilkes points to the last example of his Chapter 13, where CFD simulates — with considerable accuracy — flow past a cylinder at **Re = 100**: the instability sheds vortices alternately from opposite sides, forming a **Kármán vortex street**. Those vortices are generated in a **regular pattern**, so they do not satisfy the criterion of randomness or chaotic behaviour that characterises turbulence.
            - In general, **turbulent flow occurs at sufficiently high Re**, where laminar flow has become unstable and the velocities and pressure no longer have constant or smoothly varying values.
          `}</Md>
          <FlowSteps
            tone="violet"
            steps={[
              { title: 'Goal 1 — turbulent flow in pipes, channels and jets', md: md`Velocity profiles, friction factors and jets (later topics of this unit).` },
              { title: 'Goal 2 — analogies between turbulent transport of momentum and of thermal energy', md: md`The same eddies carry momentum and heat.` },
              {
                title: 'Goal 3 — CFD for complicated geometries',
                md: md`In particular the **k–ε method**, which deals with the production and dissipation of turbulent kinetic energy. Despite some limitations, its relatively easy implementation (e.g. in Fluent and COMSOL) gives plausible and useful results in many instances (pp. 480–481).`,
              },
            ]}
          />
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Watch a rising plume of incense smoke.** Near the stick it climbs as a smooth, glassy ribbon — laminar. A little higher it suddenly breaks into swirls of every size that never repeat. You cannot predict where any one swirl will be next second, yet if you photograph the plume a hundred times and average the pictures, you get the same smooth cone every time. That is Hinze's definition in one picture: random in detail, reproducible on average.

            **Reynolds number as a tug-of-war.** Inertia tries to carry a disturbance along and, through the nonlinear convective term, to feed it energy from the mean flow; viscosity tries to smear it out. Their ratio is Re. When viscosity wins (low Re) a disturbance dies away like a ripple in honey; when inertia wins (high Re) it grows and spawns eddies.

            **Unsteady versus random.** A metronome is unsteady — it never stops moving — but perfectly predictable. The noise of a stadium crowd is random, yet its average loudness is steady. Turbulence is the crowd, not the metronome; the Kármán street behind a cylinder at Re = 100 is a metronome.
          `}</Md>
          <Callout kind="warning">
            <Md>{md`“The flow is unsteady”, “it has vortices” or “it is wavy” does **not** make a flow turbulent. Ask whether the fluctuations are **random** (and whether well-defined averages still exist). A periodic, repeatable oscillation is an *unstable laminar* flow.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[{ doc: 'wilkes', pages: '480' }, { doc: 'wilkes', pages: '482' }]}>
          <Figure caption="Velocity at one fixed point in three regimes (schematic). Only the bottom trace is turbulent: random, multi-scale fluctuations about a steady mean.">
            <RegimeSignals />
          </Figure>
          <Figure caption="Wilkes’s laminar and turbulent examples (p. 480) placed on the Reynolds-number axis, using typical property values (supplementary). The two laminar fields sit many decades below the pipe transition range.">
            <ReMap />
          </Figure>
        </Step>

        <Step kind="equations" src={{ doc: 'wilkes', pages: '481' }}>
          <Md>{md`Wilkes characterises the Reynolds number in words only — a measure of the relative importance of inertial to viscous effects that decides whether turbulence is likely (p. 481). In the form used later in Chapter 9 for pipes it reads:`}</Md>
          <FormulaCard id="re-def" />
          <Supplement title="Typical transition values (not in Wilkes)">
            <Md>{md`
              | flow | laminar | in between | turbulent |
              |---|---|---|---|
              | round pipe, $\Rey = \overline{v}D/\nu$ | $\lesssim 2000$–$2300$ | transitional, intermittent | $\gtrsim 4000$ |
              | cylinder wake, $\Rey = UD/\nu$ | steady below $\approx 47$; regular Kármán street $\approx 47$–$190$ | 3-D and increasingly irregular $\approx 190$–$1000$ | turbulent wake beyond $\sim 10^{3}$ |

              Thresholds depend on geometry and on how disturbed the incoming flow is — hence Wilkes's careful phrase “*sufficiently* high values of the Reynolds number”. Note that the cylinder wake is already *unsteady* at Re ≈ 50 but becomes *turbulent* only at Re of order $10^{3}$.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-re-applications" />
          <ExampleCard id="ex-karman-period" />
        </Step>

        <Step kind="interactive">
          <WakeLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="what-is-turbulence" />
          <QuickCheck ids={['q-hinze', 'q-karman']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Turbulence (Hinze, via Wilkes p. 480): quantities vary **randomly** in time and space, yet statistically distinct **averages** exist.`,
              md`Turbulence is the normal state; laminar exceptions — polymer processing (high viscosity) and microfluidics (tiny channels) — are low-Re flows.`,
              md`Low Re: viscosity **damps** perturbations. High Re: nonlinear inertial terms **amplify** them. Wall shear and wakes promote turbulence.`,
              md`**Exam trap:** unsteady ≠ turbulent. The Re = 100 Kármán street is regular, hence an *unstable laminar* flow.`,
              md`Always quote Re with its velocity and length; pipe flow is turbulent above roughly 4000 (supplementary benchmark).`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 2 ═════════════════════════ */}
      <Concept id="energy-cascade">
        <Step kind="intro" src={{ doc: 'wilkes', pages: '481–482' }}>
          <Md>{md`
            Because perturbations are amplified at high Re, **eddies** are superimposed on the general trend of the flow: regions that are typically **rotating**, and hence possess **vorticity**, behaving like little whirlpools (p. 481).

            **How the eddies are born and die — pipe flow.**

            - The eddies first formed draw their energy from the **pressure energy** of the flow, and their size is of the **same order of magnitude as the pipe diameter**.
            - They form in the **high-shear region near the wall** (p. 482).
            - These large eddies are themselves **unstable** and break down into progressively **smaller eddies** — the scheme of Fig. 9.1.
            - Although the **energy per eddy** is highest for the large eddies, there are so many more small eddies that the **total mechanical energy passed down the chain — the cascade — remains essentially constant**.
            - The process terminates when the eddies are so small that their velocity variations occur over very short distances — the **Kolmogorov limit**. The resulting **high velocity gradients** let viscosity kick in and convert the mechanical energy into **heat**.

            **History.** Mathieu and Scott, whose introduction to turbulence Wilkes calls excellent and comprehensive, credit **Lewis F. Richardson** with first postulating the cascade from large to small eddies. Richardson (*Weather Prediction by Numerical Process*, 1922) summed it up in a famous four-line verse that opens “Big whorls have little whorls” — the little whorls feed on the velocity of the big ones, have lesser whorls in turn, and so on down to viscosity (pp. 481–482).
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **A bucket brigade.** The mean flow pours energy into the first, biggest bucket (the large eddy). Each bucket empties into several smaller buckets, which empty into still smaller ones. The buckets shrink and multiply, but the litres per second passed along stay the same — until the smallest buckets are so tiny that they leak everything onto the floor as heat. That leak is viscosity.

            **Why viscosity only matters at the bottom.** For a big eddy the velocity difference is spread over centimetres, so the velocity *gradient* — and the viscous stress $\mu\,\partial v/\partial y$ — is small. A tiny eddy has a smaller velocity difference but squeezes it into a distance thousands of times shorter, so its gradients are huge. Viscous dissipation grows with the square of the gradient, so it is at the smallest scales that the mechanical energy is finally turned into heat.

            **Stir your coffee.** The spoon makes one big swirl (the large eddy, fed by your work — the analogue of the pressure energy). Within seconds it breaks into smaller swirls, the surface becomes calm, and the coffee is a tiny bit warmer. You have just run Fig. 9.1.
          `}</Md>
          <Callout kind="tip">
            <Md>{md`Smaller eddies are not just smaller — they are **faster**. Their turnover time shrinks with size, which is why the finest fluctuations in a velocity record last only milliseconds while the large eddies take much longer.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={{ doc: 'wilkes', pages: '481', note: 'Fig. 9.1' }}>
          <Figure caption="Fig. 9.1 — simplified overall picture of the cascade process (recreated). Read each column top to bottom." src={{ doc: 'wilkes', pages: '481', note: 'Fig. 9.1' }}>
            <CascadeFig91 />
          </Figure>
          <Figure caption="The cascade in motion (supplementary illustration): each generation halves the eddy size; orange energy packets enter from the mean flow and pass every level at the same rate before turning into heat.">
            <CascadeAnimation />
          </Figure>
        </Step>

        <Step kind="equations">
          <Callout kind="note" title="Beyond Wilkes's text">
            <Md>{md`Wilkes describes the cascade qualitatively — there are **no equations** for it on pp. 481–482. The scaling estimates below (G. I. Taylor's estimate of the energy flux and A. N. Kolmogorov's 1941 scales) are standard supplementary results that put numbers on Fig. 9.1 and on the “Kolmogorov limit”. Use them for order-of-magnitude estimates.`}</Md>
          </Callout>
          <FormulaCard id="eps-estimate" />
          <FormulaCard id="eddy-scaling" />
          <FormulaCard id="kolmogorov" />
          <Derivation
            title="Why the cascade ends at η = (ν³/ε)^(1/4) — supplementary derivation"
            steps={[
              { md: md`Constant energy flux through an eddy of size $\ell$: $\dfrac{u_\ell^{2}}{\tau_\ell} = \dfrac{u_\ell^{3}}{\ell} = \varepsilon \;\Rightarrow\; u_\ell \sim (\varepsilon\,\ell)^{1/3}$`, why: 'energy per unit mass handed on once per turnover time' },
              { md: md`Eddy Reynolds number: $\Rey_\ell = \dfrac{u_\ell\,\ell}{\nu} \sim \dfrac{\varepsilon^{1/3}\,\ell^{4/3}}{\nu}$`, why: 'falls as the eddies shrink' },
              { md: md`Viscosity takes over when $\Rey_\ell \approx 1$: $\;\varepsilon^{1/3}\eta^{4/3} = \nu$`, why: 'Wilkes: steep gradients let viscosity kick in' },
              { md: md`$\eta = \left(\dfrac{\nu^{3}}{\varepsilon}\right)^{1/4}$, $\;u_\eta = (\varepsilon\eta)^{1/3} = (\nu\varepsilon)^{1/4}$, $\;\tau_\eta = \dfrac{\eta}{u_\eta} = \left(\dfrac{\nu}{\varepsilon}\right)^{1/2}$`, why: 'raise to the power 3/4' },
              { md: md`With $\varepsilon \sim \widetilde{v'}^{3}/L$: $\;\dfrac{L}{\eta} = L\left(\dfrac{\varepsilon}{\nu^{3}}\right)^{1/4} = \left(\dfrac{\widetilde{v'}\,L}{\nu}\right)^{3/4} = \Rey_L^{3/4}$`, why: 'the size range widens with Re' },
            ]}
          />
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-kolmogorov-pipe" />
          <ExampleCard id="ex-cascade-bookkeeping" />
        </Step>

        <Step kind="interactive">
          <CascadeExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="energy-cascade" />
          <QuickCheck ids={['q-cascade-source', 'q-kolmogorov']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Eddies are rotating regions with vorticity — little whirlpools superimposed on the mean flow.`,
              md`In pipes the first eddies are about the **pipe diameter**, fed by the **pressure energy** of the flow and formed in the high-shear region **near the wall**.`,
              md`Fig. 9.1: large → medium → small → annihilated by viscous action. Energy *per eddy* falls, but the **total passed down stays essentially constant**.`,
              md`**Kolmogorov limit:** very short distances → steep gradients → viscosity converts mechanical energy into heat. Supplementary scale: $\eta = (\nu^{3}/\varepsilon)^{1/4}$, tens of µm in water pipes.`,
              md`**Exam trap:** viscosity does not destroy the big eddies directly; it acts at the bottom of the cascade, but it decides where the cascade ends. Higher Re lengthens the ladder ($L/\eta \sim \Rey_L^{3/4}$).`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 3 ═════════════════════════ */}
      <Concept id="time-averaging">
        <Step kind="intro" src={[{ doc: 'wilkes', pages: '482', note: 'Fig. 9.2' }, { doc: 'wilkes', pages: '483', note: 'Eqs. (9.1)–(9.3), Fig. 9.3' }]}>
          <Md>{md`
            **Turbulence is inherently three-dimensional.** At any point P all three velocity components fluctuate in time (Fig. 9.2). Even so, useful information can be obtained in situations with just two coordinates of primary interest, such as $r$ and $z$ in pipe flow (Wilkes's footnote 4).

            To handle these fluctuations Wilkes introduces the **time-averaged** quantity, denoted by an **overbar**: the mean value of the quantity over a time period $T$ that is **very large compared with the time scale of the individual fluctuations**. Thus $\overline{v}_x$ is the time-averaged value of $v_x$. Then, at any point in space and any *instant of time*, each velocity component and the pressure can be written as a mean plus a fluctuation — Eq. (9.1).

            - **Time scales.** The fluctuations such as $v_x'$ may change very rapidly — in a matter of **milliseconds** (Fig. 9.3) — and then a $T$ of **a few seconds** is appropriate.
            - **Steady in the mean.** The chapter generally deals with flows such as those in **pipes and jets** whose time-averaged quantities do not vary with time; in other situations the averages may themselves fluctuate *slowly* with time.
            - **The magnifying-glass experiment.** Examined under increasingly powerful magnifying glasses, the fluctuations of Fig. 9.3 would not look smooth: a certain “fuzziness” would appear, corresponding to the ever smaller eddies of the cascade — until, at the **Kolmogorov limit**, the length scale is so small that the fluctuations *do* finally look smooth.
            - **By definition**, the time averages of the fluctuations are zero, since on the average they are equally likely to lie above or below the mean — Eq. (9.2). **Therefore** the time averages of the mean quantities are the mean quantities themselves — Eq. (9.3).
          `}</Md>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's (secondary)">
            <Md>{md`Fox §8.4 writes the same split for pipe flow: at each point a time-mean velocity $\bar u$ plus randomly fluctuating components $u'$ and $v'$ in the $x$ and $y$ directions, with the overbar again meaning a time average. Dictionary: Wilkes $\overline{v}_x \leftrightarrow$ Fox $\bar u$, Wilkes $v_x' \leftrightarrow$ Fox $u'$. The name “Reynolds decomposition” is common usage; Wilkes does not use it on p. 483.`}</Md>
            <div className="mt-2">
              <SourceChips src={{ doc: 'fox', pages: '293', note: '§8.4' }} />
            </div>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **The slow instrument and the fast instrument.** A manometer connected to a Pitot tube responds over seconds: it reads $\overline{v}$. A hot-wire probe responds in microseconds: it reads $v = \overline{v} + v'$. Eq. (9.1) simply says both instruments are right — the fast one sees the slow one's reading plus the jitter.

            **Sea level.** Waves come and go every few seconds (the fluctuations); mean sea level, averaged over a few minutes, is steady (steady in the mean); the tide changes that mean over hours (a mean that “fluctuates slowly with time”). To measure mean sea level you average over many waves but over much less than a tide — exactly Wilkes's rule for $T$.

            **What (9.2) really says.** Fluctuations are measured *from* the mean, so their average is zero by construction. Wilkes's “equally likely to be above or below” is the intuitive reading; strictly, the *areas* above and below balance — a signal may sit slightly below its mean most of the time and make rare big excursions above it.
          `}</Md>
          <Callout kind="warning">
            <Md>{md`$\overline{v'} = 0$ does **not** mean $v' = 0$, and it does **not** make averages of products vanish: $\overline{v'^{2}} > 0$, and $\overline{v_x'v_y'}$ is generally non-zero. Forgetting this is the classic error when time-averaging equations.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={[{ doc: 'wilkes', pages: '482', note: 'Fig. 9.2' }, { doc: 'wilkes', pages: '483', note: 'Fig. 9.3' }]}>
          <Figure caption="Fig. 9.2 — fluctuating velocity components at a point P, animated (recreated). Each instantaneous component = time-mean (dashed) + fluctuation." src={{ doc: 'wilkes', pages: '482', note: 'Fig. 9.2' }}>
            <Fig92Velocity />
          </Figure>
          <Figure caption="Fig. 9.3 — instantaneous v_x(t) about its mean, with a working magnifying glass (recreated; numerical values illustrative). Drag along the trace and raise the magnification to reach the Kolmogorov limit." src={{ doc: 'wilkes', pages: '483', note: 'Fig. 9.3' }}>
            <Fig93Magnifier />
          </Figure>
        </Step>

        <Step kind="equations" src={{ doc: 'wilkes', pages: '483' }}>
          <FormulaCard id="time-avg" />
          <FormulaCard id="reynolds-decomp" />
          <FormulaCard id="zero-mean" />
          <FormulaCard id="mean-of-mean" />
          <Derivation
            title="Averaging rules behind (9.2) and (9.3) — supplementary"
            steps={[
              { md: md`$\overline{f} = \dfrac{1}{T}\displaystyle\int_{t_0}^{t_0+T} f\,\dd t$ is **linear**: $\overline{f + g} = \overline{f} + \overline{g}$, $\;\overline{c\,f} = c\,\overline{f}$ for any constant $c$.`, why: 'the integral of a sum is the sum of the integrals' },
              { md: md`A mean is constant over $T$ (flow steady in the mean), so $\overline{\overline{v}_x} = \dfrac{1}{T}\displaystyle\int \overline{v}_x\,\dd t = \overline{v}_x$ — Eq. (9.3).`, why: 'the average of a constant is that constant' },
              { md: md`Average (9.1): $\overline{v_x} = \overline{\overline{v}_x} + \overline{v_x'}$, i.e. $\overline{v}_x = \overline{v}_x + \overline{v_x'}$, hence $\overline{v_x'} = 0$ — Eq. (9.2).`, why: 'fluctuations are measured from the mean' },
              { md: md`Mean × fluctuation: $\overline{\overline{v}_x\,v_y'} = \overline{v}_x\,\overline{v_y'} = 0$.`, why: 'a mean can be taken outside the bar' },
              { md: md`Fluctuation × fluctuation: $\overline{v_x'v_x'} = \overline{v_x'^{2}} > 0$, and $\overline{v_x'v_y'}$ is generally **not** zero.`, why: 'squares cannot cancel; correlated components survive (next topic)' },
            ]}
          />
          <FormulaCard id="avg-uncertainty" />
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-decompose" />
          <ExampleCard id="ex-averaging-time" />
        </Step>

        <Step kind="interactive">
          <DecompositionLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="time-averaging" />
          <QuickCheck ids={['q-T-choice', 'q-zero-mean']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Overbar = time average over $T$ **very large compared with the fluctuations** (milliseconds → $T$ of a few seconds).`,
              md`(9.1): $v_x = \overline{v}_x + v_x'$ (likewise $v_y$, $v_z$, $p$) at **any point and any instant**; all three components fluctuate (Fig. 9.2).`,
              md`(9.2) $\overline{v'} = 0$ by definition; (9.3) $\overline{\overline{v}} = \overline{v}$. Pipes and jets are **steady in the mean**.`,
              md`**Exam trap:** $\overline{v'^{2}}$ and $\overline{v_x'v_y'}$ do **not** vanish — they become the Reynolds stresses when the momentum equations are averaged.`,
              md`Magnify a turbulent trace and it stays fuzzy until the Kolmogorov limit; a finite average carries a scatter that shrinks only as $1/\sqrt{T}$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ═════════════════════════ Concept 4 ═════════════════════════ */}
      <Concept id="intensity">
        <Step kind="intro" src={{ doc: 'wilkes', pages: '484', note: 'Eqs. (9.4)–(9.5)' }}>
          <Md>{md`
            How strong is the turbulence? The plain time average of a fluctuation is useless as a measure — it is zero by (9.2). Wilkes therefore uses the **root-mean-square (RMS)** of the fluctuating velocity component, written with a wide tilde,

            $$
            \widetilde{v'} = \sqrt{\overline{v'^{2}}},
            $$

            and defines the **intensity of the turbulence** as $\widetilde{v'}/\overline{v}$, which is **typically in the range 0.01 to 0.1** — fluctuations of about 1 % to 10 % of the mean velocity.
          `}</Md>
          <Supplement title="Reading the definition">
            <Md>{md`
              - Each component has its own RMS: $\widetilde{v_x'}$, $\widetilde{v_y'}$, $\widetilde{v_z'}$. In shear flows they are usually unequal (*anisotropic*), the streamwise one being largest; if they are equal the turbulence is *isotropic*.
              - The RMS of the fluctuation is the same thing as the **standard deviation** of the instantaneous velocity about its mean.
              - 1 % is a quiet flow (e.g. the core of a good wind tunnel is quieter still); 10 % is vigorous. Near walls, where $\overline{v}$ itself becomes small, local intensities can exceed this range.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            **Mains electricity.** The voltage at a wall socket swings positive and negative fifty times a second; its time average is zero, yet the kettle boils. What heats the kettle is the **RMS** voltage (230 V), because power depends on the *square* of the voltage. A turbulent fluctuation is the same: $\overline{v'} = 0$, but the momentum and energy it carries depend on $v'^{2}$, so the RMS is the meaningful “size”.

            **Jitter relative to the mean.** Intensity is a ratio. A breeze of 2 m/s that wobbles by ±0.2 m/s and a pipeline at 20 m/s that wobbles by ±2 m/s have the same 10 % intensity: zoom out on the second and it looks just like the first.
          `}</Md>
          <Callout kind="exam">
            <Md>{md`Typical exam steps: list the readings → mean → fluctuations (check they sum to zero) → squares → mean square → square root → divide by the mean. Quote the answer as a fraction (0.035) or a percentage (3.5 %) and check it against 0.01–0.1.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual">
          <Figure caption="Building the RMS of Eq. (9.5) step by step from a synthetic fluctuation record (illustrative data).">
            <RmsConstruction />
          </Figure>
        </Step>

        <Step kind="equations" src={{ doc: 'wilkes', pages: '484' }}>
          <FormulaCard id="intensity" />
          <FormulaCard id="rms" />
          <FormulaCard id="rms-samples" />
          <Derivation
            title="Mean of a square — supplementary derivation"
            steps={[
              { md: md`Square (9.1): $v^{2} = (\overline{v} + v')^{2} = \overline{v}^{\,2} + 2\,\overline{v}\,v' + v'^{2}$` },
              { md: md`Average each term: $\overline{v^{2}} = \overline{v}^{\,2} + 2\,\overline{v}\,\overline{v'} + \overline{v'^{2}}$`, why: 'averaging is linear; (9.3) for the constant terms' },
              { md: md`$\overline{v'} = 0$: $\;\overline{v^{2}} = \overline{v}^{\,2} + \overline{v'^{2}} = \overline{v}^{\,2} + \widetilde{v'}^{\,2}$`, why: '(9.2), then (9.5)' },
              { md: md`Rearranged: $\widetilde{v'}^{\,2} = \overline{v^{2}} - \overline{v}^{\,2}$ — “mean of the square minus square of the mean”.`, why: 'handy for running sums' },
            ]}
          />
          <FormulaCard id="mean-square" />
          <Callout kind="note" title="Looking ahead — the k in k–ε">
            <Md>{md`Wilkes previews the $k$–$\varepsilon$ method on p. 481 and defines $k$ in §9.12. Written with the RMS values of this concept, $k$ is simply half the sum of the three mean-square fluctuations.`}</Md>
          </Callout>
          <FormulaCard id="tke" />
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-rms-intensity" />
          <ExampleCard id="ex-tke" />
        </Step>

        <Step kind="interactive">
          <IntensityLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="intensity" />
          <QuickCheck ids={['q-why-rms', 'q-intensity-calc']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`(9.4) Intensity $\widetilde{v'}/\overline{v} \sim 0.01$ to $0.1$; (9.5) $\widetilde{v'} = \sqrt{\overline{v'^{2}}}$.`,
              md`Order of operations: subtract the mean → square → average → square root → divide by the mean.`,
              md`**Exam trap:** never use $\overline{v'}$ to measure turbulence — it is always zero. Forgetting the square root gives $\overline{v'^{2}}/\overline{v}^{2}$, the *square* of the intensity.`,
              md`$\overline{v^{2}} = \overline{v}^{\,2} + \widetilde{v'}^{\,2}$: averaging a nonlinear quantity creates an extra fluctuation term — the root of the Reynolds stresses.`,
              md`$k = \tfrac12(\widetilde{v_x'}^{2} + \widetilde{v_y'}^{2} + \widetilde{v_z'}^{2})$ links intensity to the $k$–$\varepsilon$ model (isotropic: $k = \tfrac32\widetilde{v'}^{2}$).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
