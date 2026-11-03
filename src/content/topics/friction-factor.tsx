import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout,
  Compare,
  Concept,
  Derivation,
  ExampleCard,
  Figure,
  FlowRow,
  FlowSteps,
  FormulaCard,
  Md,
  PracticeList,
  QuickCheck,
  SourceChips,
  Step,
  Supplement,
  Takeaways,
  md,
} from '@/kit'
import { AnnulusIntegration } from '../sims/friction-factor/AnnulusIntegration'
import { SmoothFrictionLab } from '../sims/friction-factor/SmoothFrictionLab'
import { RoughnessSublayerDemo } from '../sims/friction-factor/WallCloseUp'
import { RoughProfilesPlot } from '../sims/friction-factor/RoughProfilesPlot'
import { MoodyChart } from '../sims/friction-factor/MoodyChart'
import { PipeCalculator } from '../sims/friction-factor/PipeCalculator'
import { PipeProfiles, SeventhLawFigure } from '../sims/friction-factor/SeventhLawFigure'
import { PowerLawExplorer } from '../sims/friction-factor/PowerLawExplorer'
import { PitotWallStress } from '../sims/friction-factor/PitotWallStress'

/** Wilkes, Ch. 9 — printed page numbers. */
const wk = (pages: string, note?: string): Src => (note ? { doc: 'wilkes', pages, note } : { doc: 'wilkes', pages })
/** Fox & McDonald's — printed page numbers (cross-reference only). */
const fox = (pages: string, note?: string): Src => (note ? { doc: 'fox', pages, note } : { doc: 'fox', pages })

const DIMLESS = md`\text{—}`

/* ------------------------------------------------------------------------------------------------ */
/* meta                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

export const meta: TopicMeta = {
  id: 'friction-factor',
  unit: 'D',
  title: 'Friction Factor: Smooth & Rough Pipes, Blasius & Power Law',
  subtitle:
    'Integrate the universal velocity profile to get the smooth-pipe friction law, classify wall roughness with εv*/ν, use Colebrook–White, and connect the Blasius law to the one-seventh power profile.',
  minutes: 95,
  sources: [
    { doc: 'wilkes', pages: '497–503', note: '§9.7, §9.9, §9.10 — primary' },
    { doc: 'fox', pages: '295–296', note: '§8.5 — cross-reference only' },
  ],
  concepts: [
    {
      id: 'smooth-pipe-friction',
      title: 'Friction factor for smooth pipes',
      src: wk('497–498', '§9.7'),
      summary: 'Averaging the log law over the pipe (Example 9.3) gives the mean velocity and the smooth-pipe friction law √(1/f_F) = 1.74 ln(Re√f_F) − 0.391.',
    },
    {
      id: 'rough-pipe',
      title: 'Rough pipes: velocity profiles & friction factor',
      src: wk('501', '§9.9'),
      summary: 'Roughness regimes set by εv̄z*/ν (5 and 70), the rough-wall log law with B = 8.5, and the Colebrook–White equation.',
    },
    {
      id: 'blasius-power-law',
      title: 'Blasius law & the power-law velocity profile',
      src: wk('502–503', '§9.10'),
      summary: 'f_F = 0.0790 Re^(−1/4) for Re ≤ 10⁵ implies a power-law profile with m = 1/(2n − 1) = 1/7, and τw from one velocity reading (9.80).',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 497–503). Fox & McDonald's is cited only as a secondary cross-reference.** The course designates Wilkes Ch. 9 for turbulent flow (there is no lecture deck on turbulence), so every explanation, equation and example here is built on Wilkes: §9.7 friction factor for smooth pipes (pp. 497–498, with Example 9.3), §9.9 rough pipes (p. 501) and §9.10 Blasius-type law and power-law profile (pp. 502–503, Fig. 9.11); the Blasius law and the centreline form of the 1/7 law also appear on p. 500 as Eqs. (9.59) and (9.61). Fox & McDonald's §8.5 (pp. 295–296) appears only in boxes labelled *cross-reference*. Notation is Wilkes's: overbars are time averages, $\overline{v}_z$ is the local axial velocity, $\overline{v}_{zm}$ the mean (bulk) velocity, $\overline{v}_{zc}$ the centreline velocity, $\overline{v}_z^{*} = \sqrt{\tau_w/\rho}$ the friction velocity, $y = a - r$ the distance from the wall and $f_{\mathrm F}$ the **Fanning** friction factor. Fox writes $\bar u$, $u_*$, $U$ and $\bar V$ for the same velocities, and Moody charts use the Darcy factor $f_{\mathrm D} = 4f_{\mathrm F}$.`,
}

/* ------------------------------------------------------------------------------------------------ */
/* formulas                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

const RE_VAR = { sym: md`\Rey = \rho\overline{v}_{zm}D/\mu = D\overline{v}_{zm}/\nu`, desc: 'Reynolds number based on the mean velocity and the diameter', units: DIMLESS }
const FF_VAR = { sym: md`f_{\mathrm F}`, desc: 'Fanning friction factor', units: DIMLESS }

export const formulas: FormulaDef[] = [
  /* ---------- concept 1: smooth pipes ---------- */
  {
    id: 'wall-variables',
    name: 'Wall variables and the logarithmic (universal) profile — recap',
    tex: md`v_z^{+} = A + B\ln y^{+},\qquad y^{+} = \frac{y\,\overline{v}_z^{*}}{\nu},\qquad v_z^{+} = \frac{\overline{v}_z}{\overline{v}_z^{*}},\qquad \overline{v}_z^{*} = \sqrt{\frac{\tau_w}{\rho}}`,
    vars: [
      { sym: md`v_z^{+}`, desc: 'dimensionless velocity: local mean velocity in friction-velocity units', units: DIMLESS },
      { sym: md`y^{+}`, desc: 'dimensionless distance from the wall ("wall units")', units: DIMLESS },
      { sym: md`y = a - r`, desc: md`distance from the wall; $a$ = pipe radius, $r$ = radial position`, units: md`\mathrm{m}` },
      { sym: md`\overline{v}_z`, desc: md`time-averaged axial velocity at distance $y$`, units: md`\mathrm{m/s}` },
      { sym: md`\overline{v}_z^{*}`, desc: 'friction velocity', units: md`\mathrm{m/s}` },
      { sym: md`\tau_w`, desc: 'wall shear stress (taken positive)', units: md`\mathrm{Pa}` },
      { sym: md`\rho,\ \nu`, desc: md`density and kinematic viscosity $\nu = \mu/\rho$`, units: md`\mathrm{kg/m^3},\ \mathrm{m^2/s}` },
      { sym: md`A,\ B`, desc: md`constants; experimentally $A = 5.5$ and $B = 2.5 = 1/k$ with $k \approx 0.4$`, units: DIMLESS },
    ],
    conditions: [
      'smooth pipe, fully developed turbulent flow, time-averaged quantities',
      md`strictly valid in the turbulent core ($y^+ > 30$ in the three-region model); next to the wall $v_z^+ = y^+$ instead`,
    ],
    use: md`The starting point of §9.7 (the profile itself is derived in §9.5–9.6). Wilkes assumes it over the **whole** cross-section when computing the flow rate, because the laminar sublayer is so thin that it contributes virtually nothing to the flow (p. 497).`,
    src: [wk('495–496', 'Eqs. (9.38)–(9.42)'), wk('497', 'Eq. (9.46)')],
  },
  {
    id: 'vzm-integral',
    name: 'Mean (bulk) velocity as an area average',
    tag: '9.48',
    tex: md`\overline{v}_{zm} = \frac{1}{\pi a^{2}}\int_{0}^{a} 2\pi r\,\overline{v}_z\,\dd r`,
    vars: [
      { sym: md`\overline{v}_{zm}`, desc: md`mean (bulk) axial velocity — the same as $u_m$ in Wilkes Ch. 3`, units: md`\mathrm{m/s}` },
      { sym: md`a`, desc: md`pipe radius ($D = 2a$)`, units: md`\mathrm{m}` },
      { sym: md`r`, desc: 'radial distance from the centreline', units: md`\mathrm{m}` },
      { sym: md`2\pi r\,\dd r`, desc: md`area of a thin annulus of radius $r$ and width $\dd r$`, units: md`\mathrm{m^2}` },
      { sym: md`\overline{v}_z(r)`, desc: 'time-averaged axial velocity profile', units: md`\mathrm{m/s}` },
    ],
    conditions: ['a definition: holds for any axisymmetric profile, laminar or turbulent', 'circular pipe'],
    use: md`Flow rate $Q = \pi a^2\,\overline{v}_{zm}$. To integrate a wall law, change the variable to $y = a - r$: $\overline{v}_{zm} = \frac{2}{a^2}\int_0^a \overline{v}_z\,(a-y)\,\dd y$ (Example 9.3).`,
    src: wk('497', 'Eq. (9.48)'),
  },
  {
    id: 'vzm-log',
    name: 'Mean velocity for the logarithmic profile',
    tag: '9.49',
    key: true,
    tex: md`\overline{v}_{zm} = \sqrt{\frac{\tau_w}{\rho}}\left[B\ln\frac{a\sqrt{\tau_w/\rho}}{\nu} + A - \frac{3}{2}B\right]`,
    vars: [
      { sym: md`\sqrt{\tau_w/\rho}`, desc: md`friction velocity $\overline{v}_z^{*}$`, units: md`\mathrm{m/s}` },
      { sym: md`a\sqrt{\tau_w/\rho}/\nu`, desc: md`pipe radius in wall units, often written $a^+$`, units: DIMLESS },
      { sym: md`A,\ B`, desc: md`log-law constants of $v_z^+ = A + B\ln y^+$`, units: DIMLESS },
      { sym: md`\overline{v}_{zm}`, desc: 'mean (bulk) velocity', units: md`\mathrm{m/s}` },
      { sym: md`a,\ \nu`, desc: 'pipe radius and kinematic viscosity', units: md`\mathrm{m},\ \mathrm{m^2/s}` },
    ],
    conditions: [
      'log profile assumed over the **whole** cross-section (laminar sublayer and buffer region neglected)',
      'smooth pipe, fully developed turbulent flow',
    ],
    use: md`Proved in Example 9.3. If $\tau_w$ is known (e.g. from a measured pressure gradient) it gives $\overline{v}_{zm}$ **explicitly — no iteration**. The log law evaluated at the centreline ($y = a$) exceeds this mean by exactly $\tfrac32 B\,\overline{v}_z^{*} = 3.75\,\overline{v}_z^{*}$.`,
    src: [wk('497', 'Eq. (9.49)'), wk('498', 'Example 9.3')],
  },
  {
    id: 'vzm-log-num',
    name: 'Mean velocity with A = 5.5 and B = 2.5',
    tag: '9.50',
    tex: md`\overline{v}_{zm} = \sqrt{\frac{\tau_w}{\rho}}\left[2.5\ln\left(\frac{D\overline{v}_{zm}}{2\nu}\sqrt{\frac{\tau_w}{\rho\overline{v}_{zm}^{2}}}\right) + 1.75\right]`,
    vars: [
      { sym: md`D`, desc: md`pipe diameter, $D = 2a$`, units: md`\mathrm{m}` },
      { sym: md`1.75`, desc: md`$A - \tfrac32 B = 5.5 - 3.75$`, units: DIMLESS },
      {
        sym: md`\frac{D\overline{v}_{zm}}{2\nu}\sqrt{\frac{\tau_w}{\rho\overline{v}_{zm}^{2}}}`,
        desc: md`the same $a^+ = a\overline{v}_z^{*}/\nu$, rewritten so that $\Rey$ and $f_{\mathrm F}$ can appear`,
        units: DIMLESS,
      },
      { sym: md`\tau_w,\ \rho,\ \nu`, desc: 'wall shear stress, density, kinematic viscosity', units: md`\mathrm{Pa},\ \mathrm{kg/m^3},\ \mathrm{m^2/s}` },
    ],
    conditions: [md`universal profile (9.46), $v_z^+ = 5.5 + 2.5\ln y^+$, over the whole pipe`, 'smooth pipe, turbulent flow'],
    use: md`The bridge to the friction law: the bracket hides $\Rey/2$ and $\sqrt{f_{\mathrm F}/2}$. Divided by $\overline{v}_z^{*}$ it reads $\overline{v}_{zm}/\overline{v}_z^{*} = 2.5\ln a^+ + 1.75$.`,
    src: wk('497', 'Eq. (9.50)'),
  },
  {
    id: 'fanning',
    name: 'Fanning friction factor (definition)',
    tag: '9.51',
    key: true,
    tex: md`f_{\mathrm F} = \frac{\tau_w}{\tfrac{1}{2}\rho\overline{v}_{zm}^{2}}`,
    vars: [
      FF_VAR,
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\tfrac12\rho\overline{v}_{zm}^{2}`, desc: 'dynamic pressure based on the mean velocity', units: md`\mathrm{Pa}` },
    ],
    conditions: [
      'a definition: any fully developed pipe flow, laminar or turbulent',
      md`$\overline{v}_{zm}$ is the **mean** velocity ($u_m$ of Wilkes Ch. 3), not the centreline velocity`,
    ],
    use: md`With $\tau_w = \rho(\overline{v}_z^{*})^2$ (9.73): $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$ and $\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$. **Darcy (Moody) factor:** $f_{\mathrm D} = 4f_{\mathrm F}$ — always check which one a chart or formula uses.`,
    src: wk('498', 'Eq. (9.51)'),
  },
  {
    id: 'fanning-dp',
    name: 'Pressure drop from the friction factor (Fanning and Darcy forms)',
    tex: md`\frac{\Delta p}{L} = \frac{4\tau_w}{D} = \frac{4f_{\mathrm F}}{D}\,\frac{\rho\overline{v}_{zm}^{2}}{2}\qquad\Longleftrightarrow\qquad \Delta p = f_{\mathrm D}\,\frac{L}{D}\,\frac{\rho\overline{v}_{zm}^{2}}{2},\quad f_{\mathrm D} = 4f_{\mathrm F}`,
    vars: [
      { sym: md`\Delta p`, desc: md`pressure drop over the length $L$ (drop of piezometric pressure if the pipe is not horizontal)`, units: md`\mathrm{Pa}` },
      { sym: md`L,\ D`, desc: 'pipe length and diameter', units: md`\mathrm{m}` },
      { sym: md`f_{\mathrm D}`, desc: 'Darcy (Moody) friction factor', units: DIMLESS },
      { sym: md`\tau_w,\ \rho,\ \overline{v}_{zm}`, desc: 'wall shear stress, density, mean velocity', units: md`\mathrm{Pa},\ \mathrm{kg/m^3},\ \mathrm{m/s}` },
    ],
    conditions: [
      'fully developed flow in a straight pipe of constant diameter',
      md`force balance on the fluid, Wilkes Eq. (9.82): $-\tau_w = \tfrac{a}{2}\,\dd\overline{p}/\dd z$ (p. 504)`,
    ],
    use: md`Turns a friction factor into a pressure drop; head loss $h_f = \Delta p/(\rho g)$ and pumping power $Q\,\Delta p$. This is a supplementary combination of (9.51) with the force balance (9.82).`,
  },
  {
    id: 'smooth-theory',
    name: 'Smooth-pipe friction law from the universal profile',
    tag: '9.52',
    tex: md`\sqrt{\frac{1}{f_{\mathrm F}}} = 1.77\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 0.601`,
    vars: [FF_VAR, RE_VAR],
    conditions: [
      md`follows from (9.50) and (9.51): universal profile with $A = 5.5$, $B = 2.5$ used over the whole pipe`,
      'smooth pipe, fully developed turbulent flow',
    ],
    use: md`Implicit in $f_{\mathrm F}$: with $x = 1/\sqrt{f_{\mathrm F}}$ iterate $x_{k+1} = 1.77\ln(\Rey/x_k) - 0.601$. The constants are $2.5/\sqrt2 = 1.768$ and $[1.75 - 2.5\ln(2\sqrt2)]/\sqrt2 = -0.6005$ (derivation below).`,
    src: wk('498', 'Eq. (9.52)'),
  },
  {
    id: 'smooth-exp',
    name: 'Smooth-pipe friction law (experimental)',
    tag: '9.53',
    key: true,
    tex: md`\sqrt{\frac{1}{f_{\mathrm F}}} = 1.74\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 0.391`,
    vars: [FF_VAR, RE_VAR],
    conditions: [
      md`smooth pipes; agrees with experiment from $\Rey = 5\times10^3$ up to at least $3.4\times10^6$ (and probably beyond)`,
      'turbulent flow only',
    ],
    use: md`The smooth-pipe law to use. Implicit: iterate $x_{k+1} = 1.74\ln(\Rey/x_k) - 0.391$ with $x = 1/\sqrt{f_{\mathrm F}}$ — from $f_0 = 0.005$ it converges to four figures in 3–4 steps. It stays within about 1.5 % of (9.52) over its whole range.`,
    src: wk('498', 'Eq. (9.53)'),
  },
  {
    id: 'laminar-ff',
    name: 'Laminar friction factor (for comparison)',
    tex: md`f_{\mathrm F} = \frac{16}{\Rey}\qquad\left(f_{\mathrm D} = \frac{64}{\Rey}\right)`,
    vars: [FF_VAR, RE_VAR],
    conditions: [md`fully developed **laminar** flow of a Newtonian fluid in a circular pipe (Hagen–Poiseuille), $\Rey \lesssim 2300$`, 'independent of wall roughness'],
    use: md`Supplementary — not part of Wilkes Ch. 9. It shows how much larger turbulent friction is: at $\Rey = 10^4$ the turbulent $f_{\mathrm F}$ from (9.53), 0.0077, is almost five times the laminar formula's 0.0016.`,
  },

  /* ---------- concept 2: rough pipes ---------- */
  {
    id: 'rough-regimes',
    name: 'Roughness regimes: hydraulically smooth, transition, completely rough',
    key: true,
    tex: md`\begin{aligned}
&0 < \frac{\varepsilon\overline{v}_z^{*}}{\nu} < 5: && f_{\mathrm F} = f_{\mathrm F}(\Rey) && \text{hydraulically smooth (9.64)}\\
&5 < \frac{\varepsilon\overline{v}_z^{*}}{\nu} < 70: && f_{\mathrm F} = f_{\mathrm F}\!\left(\Rey,\ \frac{\varepsilon}{a}\right) && \text{transition (9.65)}\\
&70 < \frac{\varepsilon\overline{v}_z^{*}}{\nu}: && f_{\mathrm F} = f_{\mathrm F}\!\left(\frac{\varepsilon}{a}\right) && \text{completely rough (9.66)}
\end{aligned}`,
    vars: [
      { sym: md`\varepsilon`, desc: 'wall roughness height (Wilkes §3.4)', units: md`\mathrm{m}` },
      { sym: md`\varepsilon\overline{v}_z^{*}/\nu`, desc: md`roughness Reynolds number = roughness height in wall units, often written $\varepsilon^+$`, units: DIMLESS },
      { sym: md`\varepsilon/a`, desc: md`relative roughness based on the radius ($\varepsilon/D = \tfrac12\,\varepsilon/a$)`, units: DIMLESS },
      { sym: md`\overline{v}_z^{*},\ \nu`, desc: 'friction velocity and kinematic viscosity', units: md`\mathrm{m/s},\ \mathrm{m^2/s}` },
    ],
    conditions: ['turbulent flow; each regime is supported by experiment', 'the limits 5 and 70 are empirical markers, not sharp switches'],
    use: md`Estimate $f_{\mathrm F}$, get $\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$, compute $\varepsilon^+$ and decide which law applies. Compare $\varepsilon^+$ with the sublayer edge at $y^+ = 5$: below 5 the roughness is buried in the sublayer.`,
    src: wk('501', 'Eqs. (9.64)–(9.66)'),
  },
  {
    id: 'eps-plus',
    name: 'Roughness Reynolds number from Re, ε/D and f_F',
    tex: md`\varepsilon^{+} \equiv \frac{\varepsilon\overline{v}_z^{*}}{\nu} = \frac{\varepsilon}{D}\,\Rey\,\sqrt{\frac{f_{\mathrm F}}{2}}`,
    vars: [
      { sym: md`\varepsilon^{+}`, desc: 'roughness height in wall units', units: DIMLESS },
      { sym: md`\varepsilon/D`, desc: 'relative roughness', units: DIMLESS },
      RE_VAR,
      FF_VAR,
    ],
    conditions: ['turbulent pipe flow', md`uses $\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$ from (9.51)/(9.73)`],
    use: md`Supplementary rearrangement that lets you read the regime straight off a friction-factor chart. For a given pipe ($\varepsilon/D$ fixed), $\varepsilon^+$ grows almost in proportion to $\Rey$ — the same pipe can be hydraulically smooth at low flow and rough at high flow.`,
  },
  {
    id: 'rough-profile',
    name: 'Rough-wall velocity profile (general form)',
    tag: '9.67',
    tex: md`\frac{\overline{v}_z}{\overline{v}_z^{*}} = 2.5\ln\frac{y}{\varepsilon} + B`,
    vars: [
      { sym: md`\overline{v}_z/\overline{v}_z^{*}`, desc: md`local mean velocity in friction-velocity units ($= v_z^+$)`, units: DIMLESS },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
      { sym: md`\varepsilon`, desc: 'roughness height', units: md`\mathrm{m}` },
      { sym: md`B`, desc: 'regime-dependent constant: (9.68) hydraulically smooth, (9.69) completely rough; not given for the transition region', units: DIMLESS },
    ],
    conditions: ['turbulent core of a smooth or rough pipe, in all three regimes', md`the slope $2.5 = 1/k$ is the same as in the smooth log law`],
    use: md`Roughness does not change the **slope** of the log law, only its **intercept** — everything about the wall is packed into $B$.`,
    src: wk('501', 'Eq. (9.67)'),
  },
  {
    id: 'rough-B-smooth',
    name: 'Hydraulically smooth pipe: B and the profile',
    tag: '9.68',
    tex: md`B = 5.5 + 2.5\ln\frac{\varepsilon\overline{v}_z^{*}}{\nu},\qquad \frac{\overline{v}_z}{\overline{v}_z^{*}} = 5.5 + 2.5\ln\frac{y\sqrt{\tau_w/\rho}}{\nu}`,
    vars: [
      { sym: md`B`, desc: 'intercept of (9.67) for a hydraulically smooth wall', units: DIMLESS },
      { sym: md`\varepsilon\overline{v}_z^{*}/\nu`, desc: md`roughness Reynolds number (here $< 5$)`, units: DIMLESS },
      { sym: md`y\sqrt{\tau_w/\rho}/\nu`, desc: md`$y^+$`, units: DIMLESS },
    ],
    conditions: [md`hydraulically smooth: $\varepsilon\overline{v}_z^{*}/\nu < 5$`],
    use: md`Put this $B$ into (9.67) and $\varepsilon$ cancels: $2.5\ln(y/\varepsilon) + 2.5\ln(\varepsilon\overline{v}_z^{*}/\nu) = 2.5\ln y^+$ — the universal velocity profile. The roughness is invisible to the flow.`,
    src: wk('501', 'Eq. (9.68)'),
  },
  {
    id: 'rough-B-rough',
    name: 'Completely rough pipe: B = 8.5',
    tag: '9.69',
    key: true,
    tex: md`B = 8.5,\qquad \frac{\overline{v}_z}{\overline{v}_z^{*}} = 8.5 + 2.5\ln\frac{y}{\varepsilon}`,
    vars: [
      { sym: md`y/\varepsilon`, desc: 'distance from the wall measured in roughness heights', units: DIMLESS },
      { sym: md`\overline{v}_z^{*}`, desc: 'friction velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`completely rough: $\varepsilon\overline{v}_z^{*}/\nu > 70$`,
      md`turbulent core, $y \gg \varepsilon$`,
      md`substantiated by experiments over a very wide range of $\varepsilon/D$ (Wilkes cites Schlichting)`,
    ],
    use: md`Independent of the pipe radius — and viscosity does not appear: the roughness height $\varepsilon$ replaces the viscous length $\nu/\overline{v}_z^{*}$. Averaged over the pipe it gives an $f_{\mathrm F}$ that depends on $\varepsilon/a$ only (see the example).`,
    src: wk('501', 'Eq. (9.69)'),
  },
  {
    id: 'colebrook',
    name: 'Colebrook–White equation',
    tag: '9.70',
    key: true,
    tex: md`\frac{1}{\sqrt{f_{\mathrm F}}} = -1.737\ln\left(0.269\,\frac{\varepsilon}{D} + \frac{1.257}{\Rey\sqrt{f_{\mathrm F}}}\right)`,
    vars: [FF_VAR, { sym: md`\varepsilon/D`, desc: 'relative roughness, here based on the **diameter**', units: DIMLESS }, RE_VAR],
    conditions: [
      'turbulent flow only (it does not describe laminar flow)',
      'a very wide range of roughnesses and Reynolds numbers: hydraulically smooth, transition and completely rough',
      'natural logarithm',
    ],
    use: md`Implicit: with $x = 1/\sqrt{f_{\mathrm F}}$ iterate $x_{k+1} = -1.737\ln(0.269\,\varepsilon/D + 1.257\,x_k/\Rey)$, starting from the completely rough value. The first term inside the logarithm is the roughness effect, the second the viscous (smooth-pipe) effect — whichever is larger controls $f_{\mathrm F}$.`,
    src: wk('501', 'Eq. (9.70)'),
  },
  {
    id: 'colebrook-limits',
    name: 'The two limits of Colebrook–White',
    tex: md`\begin{aligned}
\varepsilon \to 0:&\quad \frac{1}{\sqrt{f_{\mathrm F}}} = 1.737\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 0.397\\
\Rey \to \infty:&\quad \frac{1}{\sqrt{f_{\mathrm F}}} = -1.737\ln\left(0.269\,\frac{\varepsilon}{D}\right)
\end{aligned}`,
    vars: [FF_VAR, RE_VAR, { sym: md`\varepsilon/D`, desc: 'relative roughness', units: DIMLESS }],
    conditions: ['turbulent flow', 'first line: smooth limit; second line: completely rough limit'],
    use: md`Supplementary check. The smooth limit ($-1.737\ln 1.257 = -0.397$) is practically Wilkes's experimental law (9.53), 1.74 and −0.391. The rough limit depends on $\varepsilon/D$ alone, exactly as (9.66) requires — use it as the starting guess for the iteration.`,
  },
  {
    id: 'fully-rough-integrated',
    name: 'Mean velocity and friction factor of a completely rough pipe',
    tex: md`\frac{\overline{v}_{zm}}{\overline{v}_z^{*}} = 4.75 + 2.5\ln\frac{a}{\varepsilon}\qquad\Longrightarrow\qquad \frac{1}{\sqrt{f_{\mathrm F}}} = \frac{4.75 + 2.5\ln(a/\varepsilon)}{\sqrt2} = 3.36 + 1.77\ln\frac{a}{\varepsilon}`,
    vars: [
      { sym: md`a/\varepsilon`, desc: 'pipe radius in roughness heights', units: DIMLESS },
      { sym: md`4.75`, desc: md`$8.5 - \tfrac32(2.5)$: the same $-\tfrac32 B$ shift as in (9.49)`, units: DIMLESS },
      FF_VAR,
    ],
    conditions: ['completely rough regime; profile (9.69) used over the whole cross-section, as in Example 9.3'],
    use: md`Supplementary derivation (worked in the example). It agrees with the $\Rey \to \infty$ limit of Colebrook–White to about 1 % for $10^{-3} \le \varepsilon/D \le 10^{-2}$.`,
  },

  /* ---------- concept 3: Blasius & power law ---------- */
  {
    id: 'blasius',
    name: 'Blasius law (smooth pipe)',
    tag: '9.71',
    key: true,
    tex: md`f_{\mathrm F} = 0.0790\left(\frac{2a\overline{v}_{zm}}{\nu}\right)^{-1/4} = 0.0790\,\Rey^{-1/4}`,
    vars: [
      FF_VAR,
      { sym: md`2a\overline{v}_{zm}/\nu`, desc: md`Reynolds number based on the diameter $D = 2a$`, units: DIMLESS },
      { sym: md`0.0790,\ -1/4`, desc: 'empirical coefficient and exponent', units: DIMLESS },
    ],
    conditions: ['smooth pipe, turbulent flow', md`$\Rey$ no larger than $10^5$ ("of admittedly more limited range", p. 500)`],
    use: md`Explicit — no iteration. Because $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 \propto \overline{v}_{zm}^{2-1/4}$, the pressure drop in a smooth pipe grows as $\overline{v}_{zm}^{1.75}$. The same law is Eq. (9.59) on p. 500.`,
    src: [wk('502', 'Eq. (9.71)'), wk('500', 'Eq. (9.59)')],
  },
  {
    id: 'blasius-general',
    name: 'Generalised Blasius-type law',
    tag: '9.72',
    tex: md`f_{\mathrm F} = A\left(\frac{a\overline{v}_{zm}}{\nu}\right)^{-1/n}`,
    vars: [
      FF_VAR,
      { sym: md`A`, desc: md`coefficient — **not** the log-law constant $A = 5.5$`, units: DIMLESS },
      { sym: md`n`, desc: md`exponent; $n = 4$ for the Blasius law`, units: DIMLESS },
      { sym: md`a\overline{v}_{zm}/\nu`, desc: md`Reynolds number based on the **radius** ($= \Rey/2$)`, units: DIMLESS },
    ],
    conditions: ['smooth pipe', md`each pair $(A, n)$ fits a limited range of Reynolds number`],
    use: md`With $n = 4$ and $A = 0.0790\times2^{-1/4} = 0.0664$ it reproduces (9.71). Its exponent $n$ fixes the exponent $m$ of the matching power-law profile through (9.77).`,
    src: wk('502', 'Eq. (9.72)'),
  },
  {
    id: 'tauw-vstar',
    name: 'Wall shear stress, friction factor and friction velocity',
    tag: '9.73',
    key: true,
    tex: md`\tau_w = \frac{1}{2}f_{\mathrm F}\rho\overline{v}_{zm}^{2} = \rho\left(\overline{v}_z^{*}\right)^{2}`,
    vars: [
      { sym: md`\overline{v}_z^{*}`, desc: 'friction velocity', units: md`\mathrm{m/s}` },
      { sym: md`\tau_w,\ \rho,\ \overline{v}_{zm}`, desc: 'wall shear stress, density, mean velocity', units: md`\mathrm{Pa},\ \mathrm{kg/m^3},\ \mathrm{m/s}` },
      FF_VAR,
    ],
    conditions: [md`definition of $f_{\mathrm F}$ (9.51) combined with the definition of the friction velocity`],
    use: md`Gives $\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$ — the link between friction laws and wall-unit velocity profiles.`,
    src: wk('502', 'Eq. (9.73)'),
  },
  {
    id: 'vzm-vstar-power',
    name: 'Mean velocity implied by a Blasius-type law',
    tag: '9.74',
    tex: md`\frac{\overline{v}_{zm}}{\overline{v}_z^{*}} = \left(\frac{2}{A}\right)^{n/(2n-1)}\left(\frac{\overline{v}_z^{*}a}{\nu}\right)^{1/(2n-1)}`,
    vars: [
      { sym: md`\overline{v}_z^{*}a/\nu`, desc: md`pipe radius in wall units ($a^+$)`, units: DIMLESS },
      { sym: md`A,\ n`, desc: 'coefficient and exponent of (9.72)', units: DIMLESS },
      { sym: md`\overline{v}_{zm}/\overline{v}_z^{*}`, desc: md`mean velocity in friction-velocity units ($=\sqrt{2/f_{\mathrm F}}$)`, units: DIMLESS },
    ],
    conditions: [md`smooth pipe, inside the range of validity of the chosen $(A, n)$`],
    use: md`Obtained by eliminating $f_{\mathrm F}$ with the help of (9.73) (derivation below). For $n = 4$, $A = 0.0664$: $\overline{v}_{zm}/\overline{v}_z^{*} = 7.00\,(a^+)^{1/7}$.`,
    src: wk('502', 'Eq. (9.74)'),
  },
  {
    id: 'power-profile',
    name: 'Power-law velocity profile (general form)',
    tag: '9.75',
    tex: md`\frac{\overline{v}_z}{\overline{v}_z^{*}} = c\left(\frac{y}{y^{*}}\right)^{m}`,
    vars: [
      { sym: md`c`, desc: 'coefficient', units: DIMLESS },
      { sym: md`m`, desc: 'exponent', units: DIMLESS },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
      {
        sym: md`y^{*}`,
        desc: md`reference length — not defined in the text; comparison with (9.78) shows $y^{*} = \nu/\overline{v}_z^{*}$, so $y/y^{*} = y^+$`,
        units: md`\mathrm{m}` ,
      },
    ],
    conditions: ['turbulent core of a smooth pipe', md`not usable right at the wall: its slope is infinite at $y = 0$`],
    use: md`A one-term stand-in for the log law that is easy to integrate (flow rate, momentum and energy fluxes).`,
    src: wk('502', 'Eq. (9.75)'),
  },
  {
    id: 'power-mean',
    name: 'Mean velocity of the power-law profile',
    tag: '9.76',
    tex: md`\frac{\overline{v}_{zm}}{\overline{v}_z^{*}} = \left(\frac{\overline{v}_z^{*}a}{\nu}\right)^{m}\frac{2c}{(m+1)(m+2)}`,
    vars: [
      { sym: md`m,\ c`, desc: 'exponent and coefficient of (9.75)', units: DIMLESS },
      { sym: md`\overline{v}_z^{*}a/\nu`, desc: md`$a^+$`, units: DIMLESS },
    ],
    conditions: ['power law (9.75) assumed from the wall to the centreline (the near-wall error carries little flow)'],
    use: md`From (9.48) with $y = a - r$ and $\int_0^a (a-y)\,y^m\,\dd y = a^{m+2}/[(m+1)(m+2)]$.`,
    src: wk('502', 'Eq. (9.76)'),
  },
  {
    id: 'm-n',
    name: 'Profile exponent from the friction-law exponent',
    tag: '9.77',
    key: true,
    tex: md`m = \frac{1}{2n-1}`,
    vars: [
      { sym: md`m`, desc: 'power-law profile exponent in (9.75)', units: DIMLESS },
      { sym: md`n`, desc: 'Blasius-type exponent in (9.72)', units: DIMLESS },
    ],
    conditions: [md`obtained by equating the exponents of $\overline{v}_z^{*}a/\nu$ in (9.74) and (9.76)`],
    use: md`$n = 4$ (Blasius) $\Rightarrow m = 1/7$: the familiar **one-seventh power law** of Fig. 9.11.`,
    src: wk('502', 'Eq. (9.77)'),
  },
  {
    id: 'seventh-wall',
    name: 'One-seventh power law in wall variables',
    tag: '9.78',
    tex: md`\frac{\overline{v}_z}{\overline{v}_z^{*}} = 8.74\left(\frac{y\overline{v}_z^{*}}{\nu}\right)^{1/7}`,
    vars: [
      { sym: md`8.74`, desc: md`the value of $c$ found experimentally`, units: DIMLESS },
      { sym: md`y\overline{v}_z^{*}/\nu`, desc: md`$y^+$`, units: DIMLESS },
    ],
    conditions: ['smooth pipe, turbulent core', md`consistent with the Blasius law, hence $\Rey \lesssim 10^5$`],
    use: md`Within 3 % of the log law for roughly $20 < y^+ < 1000$; further out it climbs above it (see the explorer).`,
    src: wk('502', 'Eq. (9.78)'),
  },
  {
    id: 'seventh-centre',
    name: 'One-seventh power law in centreline form',
    tag: '9.61',
    tex: md`\frac{\overline{v}_z}{\overline{v}_{zc}} = \left(\frac{y}{a}\right)^{1/7}`,
    vars: [
      { sym: md`\overline{v}_{zc}`, desc: 'centreline velocity', units: md`\mathrm{m/s}` },
      { sym: md`y/a`, desc: 'distance from the wall as a fraction of the radius', units: DIMLESS },
    ],
    conditions: ['smooth pipe, turbulent flow', md`poor very near the wall (infinite slope at $y = 0$) and not flat at the centreline`],
    use: md`The form plotted in Fig. 9.11. Averaging it with (9.48) gives $\overline{v}_{zm} = \tfrac{49}{60}\,\overline{v}_{zc}$.`,
    src: [wk('500', 'Eq. (9.61)'), wk('503', 'Fig. 9.11')],
  },
  {
    id: 'mean-centre-ratio',
    name: 'Mean-to-centreline velocity ratio of a power-law profile',
    tex: md`\frac{\overline{v}_{zm}}{\overline{v}_{zc}} = \frac{2}{(m+1)(m+2)}\qquad\xrightarrow{\;m\,=\,1/7\;}\qquad \frac{49}{60} \approx 0.817`,
    vars: [
      { sym: md`\overline{v}_{zm},\ \overline{v}_{zc}`, desc: 'mean and centreline velocities', units: md`\mathrm{m/s}` },
      { sym: md`m`, desc: 'power-law exponent', units: DIMLESS },
    ],
    conditions: [md`power law $\overline{v}_z/\overline{v}_{zc} = (y/a)^m$ from the wall to the centreline`],
    use: md`Supplementary. For laminar flow the ratio is $1/2$ — the turbulent profile is much fuller. Fox & McDonald's prints the same result in its own notation (Eq. 8.24, p. 296).`,
  },
  {
    id: 'vstar-seventh',
    name: 'Friction velocity from the 1/7 law',
    tag: '9.79',
    tex: md`\overline{v}_z^{*} = 0.150\,\overline{v}_z^{7/8}\left(\frac{\nu}{y}\right)^{1/8}`,
    vars: [
      { sym: md`\overline{v}_z`, desc: md`time-averaged velocity measured at distance $y$ from the wall`, units: md`\mathrm{m/s}` },
      { sym: md`y`, desc: 'distance of the measuring point from the wall', units: md`\mathrm{m}` },
      { sym: md`0.150`, desc: md`$(1/8.74)^{7/8}$`, units: DIMLESS },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [md`measuring point in the turbulent core (check $y^+ > 30$)`, 'smooth pipe, Blasius range'],
    use: md`(9.78) solved for $\overline{v}_z^{*}$. Units check: $(\mathrm{m/s})^{7/8}(\mathrm{m^2\,s^{-1}/m})^{1/8} = \mathrm{m/s}$.`,
    src: wk('503', 'Eq. (9.79)'),
  },
  {
    id: 'tauw-seventh',
    name: 'Wall shear stress from the velocity at a distance y',
    tag: '9.80',
    key: true,
    tex: md`\tau_w = \rho\left(\overline{v}_z^{*}\right)^{2} = 0.0225\,\rho\overline{v}_z^{2}\left(\frac{\nu}{\overline{v}_z y}\right)^{1/4}`,
    vars: [
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\overline{v}_z,\ y`, desc: 'velocity measured at distance $y$ from the wall, and that distance', units: md`\mathrm{m/s},\ \mathrm{m}` },
      { sym: md`0.0225`, desc: md`$0.150^2$`, units: DIMLESS },
      { sym: md`\rho,\ \nu`, desc: 'density and kinematic viscosity', units: md`\mathrm{kg/m^3},\ \mathrm{m^2/s}` },
    ],
    conditions: ['smooth wall, measuring point in the turbulent core', 'range of validity of the 1/7 law (Blasius range)'],
    use: md`A "local Blasius law": like (9.71), but with the velocity at a **definite distance** $y$ instead of the mean velocity. Wilkes uses it to find the thickness of the turbulent boundary layer (his §8.5).`,
    src: wk('503', 'Eq. (9.80)'),
  },
]

/* ------------------------------------------------------------------------------------------------ */
/* worked examples                                                                                  */
/* ------------------------------------------------------------------------------------------------ */

export const examples: ExampleDef[] = [
  {
    id: 'ex-mean-velocity',
    concept: 'smooth-pipe-friction',
    title: 'Example 9.3 — Expression for the mean velocity',
    src: wk('498', 'Example 9.3'),
    difficulty: 2,
    given: md`The logarithmic profile $v_z^+ = A + B\ln y^+$, assumed to hold across the whole pipe of radius $a$; $y = a - r$ is the distance from the wall, $v_z^+ = \overline{v}_z/\sqrt{\tau_w/\rho}$ and $y^+ = y\sqrt{\tau_w/\rho}/\nu$.`,
    find: md`Prove the mean-velocity formula (9.49): $\overline{v}_{zm} = \sqrt{\tau_w/\rho}\,\big[B\ln(a\sqrt{\tau_w/\rho}/\nu) + A - \tfrac32 B\big]$.`,
    assumptions: md`Smooth pipe, fully developed turbulent flow; the sublayer and buffer region are ignored because they carry almost no flow.`,
    steps: [
      {
        title: 'Write the profile in dimensional form',
        md: md`Using the definitions of $v_z^+$ and $y^+$:

          $$
          \overline{v}_z = \sqrt{\frac{\tau_w}{\rho}}\left[A + B\ln\frac{y\sqrt{\tau_w/\rho}}{\nu}\right] \tag{E9.3.1}
          $$`,
      },
      {
        title: 'Mean velocity as an integral over y',
        md: md`In (9.48) put $r = a - y$, so $\dd r = -\dd y$ and the limits $r = 0 \to a$ become $y = a \to 0$:

          $$
          \overline{v}_{zm} = \frac{1}{\pi a^2}\int_{r=0}^{r=a} 2\pi r\,\overline{v}_z\,\dd r = \frac{1}{\pi a^2}\int_{y=0}^{y=a} 2\pi\,\overline{v}_z\,(a-y)\,\dd y \tag{E9.3.2}
          $$`,
      },
      {
        title: 'Split the logarithm',
        md: md`Because $\ln\dfrac{y\sqrt{\tau_w/\rho}}{\nu} = \ln y + \ln\dfrac{\sqrt{\tau_w/\rho}}{\nu}$, the integral becomes

          $$
          \frac{2}{a^2}\sqrt{\frac{\tau_w}{\rho}}\left[\int_0^a\left(A + B\ln\frac{\sqrt{\tau_w/\rho}}{\nu}\right)(a-y)\,\dd y + \int_0^a Ba\ln y\,\dd y - \int_0^a By\ln y\,\dd y\right]
          $$

          (the "units inside a logarithm" of $\ln y$ cancel once the pieces are recombined).`,
      },
      {
        title: 'Standard integrals',
        md: md`$\displaystyle\int \ln y\,\dd y = y\ln y - y \qquad\text{and}\qquad \int y\ln y\,\dd y = \frac{y^2}{2}\ln y - \frac{y^2}{4}$`,
      },
      {
        title: 'Insert the limits (details filled in here — the book only says "insertion of limits")',
        md: md`$\int_0^a (a-y)\,\dd y = \tfrac{a^2}{2}$; $\;\int_0^a \ln y\,\dd y = a\ln a - a$ (because $y\ln y \to 0$ as $y \to 0$); $\;\int_0^a y\ln y\,\dd y = \tfrac{a^2}{2}\ln a - \tfrac{a^2}{4}$. Hence the two logarithmic integrals give

          $$
          Ba\,(a\ln a - a) - B\left(\frac{a^2}{2}\ln a - \frac{a^2}{4}\right) = \frac{a^2}{2}\left(B\ln a - \frac32 B\right)
          $$`,
      },
      {
        title: 'Collect terms',
        md: md`The bracket equals $\dfrac{a^2}{2}\left[A + B\ln\dfrac{\sqrt{\tau_w/\rho}}{\nu} + B\ln a - \dfrac32 B\right]$; multiplying by $\dfrac{2}{a^2}\sqrt{\tau_w/\rho}$:

          $$
          \overline{v}_{zm} = \sqrt{\frac{\tau_w}{\rho}}\left[B\ln\frac{a\sqrt{\tau_w/\rho}}{\nu} + A - \frac32 B\right] \tag{9.49}
          $$

          which is the desired result.`,
      },
    ],
    answer: md`$\overline{v}_{zm} = \sqrt{\tau_w/\rho}\,\big[B\ln(a\sqrt{\tau_w/\rho}/\nu) + A - \tfrac32 B\big]$ — Eq. (9.49). With $A = 5.5$, $B = 2.5$: $\overline{v}_{zm}/\overline{v}_z^{*} = 2.5\ln a^+ + 1.75$, Eq. (9.50).`,
    insight: md`The $-\tfrac32 B$ term is the price of averaging a logarithm over a circle: the mean velocity lies $3.75$ friction velocities below the log-law value at the centreline.`,
  },
  {
    id: 'ex-smooth-water',
    concept: 'smooth-pipe-friction',
    title: 'Friction factor and pressure gradient for water in a smooth tube',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\mu = 1.0\times10^{-3}$ Pa·s, so $\nu = 1.0\times10^{-6}$ m²/s) flows at $\overline{v}_{zm} = 2.0$ m/s through a smooth tube of diameter $D = 50$ mm.`,
    find: md`$\Rey$; $f_{\mathrm F}$ from (9.53) by iteration, compared with (9.52) and Blasius; $\tau_w$, $\overline{v}_z^{*}$ and the pressure gradient; the Darcy factor.`,
    assumptions: md`Fully developed, isothermal flow in a horizontal smooth tube.`,
    steps: [
      { title: 'Reynolds number', md: md`$\Rey = \overline{v}_{zm}D/\nu = (2.0)(0.050)/(1.0\times10^{-6}) = 1.0\times10^5$ — turbulent and inside the range of (9.53).` },
      {
        title: 'Iterate (9.53)',
        md: md`With $x = 1/\sqrt{f_{\mathrm F}}$, $x_{k+1} = 1.74\ln(\Rey/x_k) - 0.391$. Start from $f_0 = 0.005$, $x_0 = 14.142$:

          | $k$ | $x_k$ | $f_k$ |
          |---|---|---|
          | 1 | 15.032 | 0.004426 |
          | 2 | 14.926 | 0.004489 |
          | 3 | 14.938 | 0.004481 |
          | 4 | 14.937 | 0.004482 |

          e.g. $x_1 = 1.74\ln(10^5/14.142) - 0.391 = 1.74(8.864) - 0.391 = 15.032$. Converged: $f_{\mathrm F} = 0.00448$.`,
      },
      {
        title: 'Compare the other smooth-pipe laws',
        md: md`(9.52) gives $0.00445$ (0.6 % lower). Blasius (9.59)/(9.71): $0.0790\,(10^5)^{-1/4} = 0.0790/17.78 = 0.00444$ (0.9 % lower) — fine here, because $\Rey = 10^5$ is the upper limit of its range.`,
      },
      {
        title: 'Wall shear stress and friction velocity',
        md: md`$\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 = 0.5(0.00448)(1000)(2.0)^2 = 8.96$ Pa; $\;\overline{v}_z^{*} = \sqrt{8.96/1000} = 0.0947$ m/s.`,
      },
      {
        title: 'Pressure gradient',
        md: md`Force balance (Wilkes 9.82): $\Delta p/L = 4\tau_w/D = 4(8.96)/0.050 = 717$ Pa/m, i.e. about 0.72 kPa per metre of tube.`,
      },
      {
        title: 'Darcy factor and wall-unit check',
        md: md`$f_{\mathrm D} = 4f_{\mathrm F} = 0.0179$. Also $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}} = 21.1$ and $a^+ = a\overline{v}_z^{*}/\nu = (0.025)(0.0947)/10^{-6} = 2.37\times10^3$; the three-region sublayer ($y^+ < 5$) is only $5\nu/\overline{v}_z^{*} = 0.053$ mm thick.`,
      },
    ],
    answer: md`$\Rey = 1.0\times10^5$; $f_{\mathrm F} = 0.00448$ ($f_{\mathrm D} = 0.0179$); $\tau_w = 8.96$ Pa; $\overline{v}_z^{*} = 0.0947$ m/s; $\Delta p/L \approx 717$ Pa/m.`,
    insight: 'At Re = 10⁵ the three smooth-pipe laws agree within 1 % — but only (9.52)/(9.53) stay accurate at higher Re.',
  },
  {
    id: 'ex-rough-regime',
    concept: 'rough-pipe',
    title: 'Commercial-steel water main: which roughness regime?',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) at $\overline{v}_{zm} = 3.0$ m/s in a commercial-steel pipe, $D = 0.10$ m, roughness $\varepsilon = 0.045$ mm (a typical handbook value).`,
    find: md`$\Rey$, $f_{\mathrm F}$ from Colebrook–White (9.70), $\overline{v}_z^{*}$, $\varepsilon\overline{v}_z^{*}/\nu$ and the regime; the pressure drop per 100 m; comparison with a smooth pipe.`,
    steps: [
      { title: 'Reynolds number and relative roughness', md: md`$\Rey = (3.0)(0.10)/(1.0\times10^{-6}) = 3.0\times10^5$; $\;\varepsilon/D = 0.045\times10^{-3}/0.10 = 4.5\times10^{-4}$.` },
      {
        title: 'Starting guess: completely rough limit',
        md: md`$x_0 = -1.737\ln(0.269\times4.5\times10^{-4}) = -1.737\ln(1.211\times10^{-4}) = 15.667$, i.e. $f = 0.00407$.`,
      },
      {
        title: 'Iterate (9.70)',
        md: md`$x_{k+1} = -1.737\ln\left(1.211\times10^{-4} + 1.257\,x_k/\Rey\right)$:
          $x_1 = -1.737\ln(1.211\times10^{-4} + 6.56\times10^{-5}) = 14.914$; $\;x_2 = 14.944$; $\;x_3 = 14.942$.
          So $f_{\mathrm F} = 1/14.942^2 = 0.00448$ (Darcy $0.0179$).`,
      },
      {
        title: 'Friction velocity and roughness Reynolds number',
        md: md`$\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2} = 3.0\sqrt{0.00224} = 0.142$ m/s ($\tau_w = \rho(\overline{v}_z^{*})^2 = 20.2$ Pa).
          $\varepsilon\overline{v}_z^{*}/\nu = (0.045\times10^{-3})(0.142)/10^{-6} = 6.4$ — between 5 and 70: **transition** (9.65), so $f_{\mathrm F}$ depends on both $\Rey$ and $\varepsilon/a$.`,
      },
      {
        title: 'Pressure drop',
        md: md`$\Delta p/L = 4\tau_w/D = 4(20.2)/0.10 = 806$ Pa/m, so about 81 kPa per 100 m (a head loss of 8.2 m of water).`,
      },
      {
        title: 'Compare with a smooth pipe',
        md: md`(9.53) at $\Rey = 3.0\times10^5$ gives $f_{\mathrm F} = 0.00360$: the roughness adds about 24 %. Physically, the sublayer edge $5\nu/\overline{v}_z^{*} = 0.035$ mm is thinner than the 0.045 mm bumps — they just poke out.`,
      },
    ],
    answer: md`$\Rey = 3.0\times10^5$; $f_{\mathrm F} = 0.00448$; $\overline{v}_z^{*} = 0.142$ m/s; $\varepsilon^+ \approx 6.4$ (transition); $\Delta p \approx 81$ kPa per 100 m.`,
    insight: 'The regime belongs to the flow, not just the pipe: at 2 m/s the same steel pipe gives ε⁺ ≈ 4.3 — hydraulically smooth.',
  },
  {
    id: 'ex-fully-rough',
    concept: 'rough-pipe',
    title: 'Fully rough friction law from the rough-wall profile',
    difficulty: 3,
    given: md`The completely rough profile (9.69), $\overline{v}_z/\overline{v}_z^{*} = 8.5 + 2.5\ln(y/\varepsilon)$, assumed over the whole cross-section; relative roughness $\varepsilon/D = 0.01$ ($a/\varepsilon = 50$).`,
    find: md`$\overline{v}_{zm}/\overline{v}_z^{*}$ and $f_{\mathrm F}$ in general and for $a/\varepsilon = 50$; compare with the $\Rey \to \infty$ limit of Colebrook–White.`,
    steps: [
      {
        title: 'Recognise the Example 9.3 form',
        md: md`$8.5 + 2.5\ln(y/\varepsilon) = (8.5 - 2.5\ln\varepsilon) + 2.5\ln y$: a constant plus $B\ln y$ with $B = 2.5$ — exactly the structure integrated in Example 9.3.`,
      },
      {
        title: 'Average over the cross-section',
        md: md`Example 9.3 showed that the area average equals the value at $y = a$ minus $\tfrac32 B$:

          $$
          \frac{\overline{v}_{zm}}{\overline{v}_z^{*}} = 8.5 + 2.5\ln\frac{a}{\varepsilon} - 3.75 = 4.75 + 2.5\ln\frac{a}{\varepsilon}
          $$`,
      },
      {
        title: 'Friction factor',
        md: md`With (9.73), $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$, so

          $$
          \frac{1}{\sqrt{f_{\mathrm F}}} = \frac{4.75 + 2.5\ln(a/\varepsilon)}{\sqrt2} = 3.36 + 1.77\ln\frac{a}{\varepsilon}
          $$

          — a function of $\varepsilon/a$ only, exactly what (9.66) states for the completely rough regime.`,
      },
      { title: 'Numbers for a/ε = 50', md: md`$\overline{v}_{zm}/\overline{v}_z^{*} = 4.75 + 2.5\ln 50 = 4.75 + 9.78 = 14.53$, so $f_{\mathrm F} = 2/14.53^2 = 0.00947$.` },
      {
        title: 'Compare with Colebrook–White',
        md: md`$\Rey \to \infty$ in (9.70): $1/\sqrt{f_{\mathrm F}} = -1.737\ln(0.269\times0.01) = 10.28$, so $f_{\mathrm F} = 0.00946$ — within 0.1 %.`,
      },
    ],
    answer: md`$\overline{v}_{zm}/\overline{v}_z^{*} = 4.75 + 2.5\ln(a/\varepsilon) = 14.53$ and $f_{\mathrm F} \approx 0.00947$ for $a/\varepsilon = 50$ (Colebrook limit 0.00946).`,
    insight: 'In the completely rough regime viscosity drops out entirely: the profile, and therefore f_F, are set by ε/a alone.',
  },
  {
    id: 'ex-blasius-seventh',
    concept: 'blasius-power-law',
    title: 'Blasius law and the one-seventh profile in a 25 mm water line',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) flows at $\overline{v}_{zm} = 1.2$ m/s through a smooth tube of $D = 25$ mm ($a = 12.5$ mm).`,
    find: md`$\Rey$; $f_{\mathrm F}$ from Blasius and from (9.53); $\tau_w$, $\overline{v}_z^{*}$, $\Delta p/L$; the centreline velocity from the 1/7 law; the velocity 1 mm from the wall and its $y^+$.`,
    steps: [
      { title: 'Check the Blasius range', md: md`$\Rey = (1.2)(0.025)/(1.0\times10^{-6}) = 3.0\times10^4 < 10^5$ — smooth tube, so (9.71) applies.` },
      {
        title: 'Friction factor',
        md: md`$\Rey^{1/4} = 13.16$, so $f_{\mathrm F} = 0.0790/13.16 = 0.00600$. The implicit law (9.53) gives $0.00585$; Blasius is 2.6 % high — acceptable.`,
      },
      {
        title: 'Wall stress, friction velocity, pressure gradient',
        md: md`$\tau_w = \tfrac12(0.00600)(1000)(1.2)^2 = 4.32$ Pa; $\;\overline{v}_z^{*} = \sqrt{4.32/1000} = 0.0657$ m/s; $\;\Delta p/L = 4\tau_w/D = 691$ Pa/m.`,
      },
      {
        title: 'Centreline velocity',
        md: md`For $(y/a)^{1/7}$ the mean is $\tfrac{49}{60}$ of the centreline value, so $\overline{v}_{zc} = \tfrac{60}{49}(1.2) = 1.47$ m/s. Cross-check with (9.78) at $y = a$: $a^+ = (0.0125)(0.0657)/10^{-6} = 822$ and $\overline{v}_{zc} = 0.0657 \times 8.74 \times 822^{1/7} = 0.0657 \times 8.74 \times 2.609 = 1.50$ m/s (2 % higher).`,
      },
      {
        title: 'Velocity 1 mm from the wall',
        md: md`(9.61): $\overline{v}_z = 1.47\,(1/12.5)^{1/7} = 1.47 \times 0.697 = 1.02$ m/s. There $y^+ = (0.001)(0.0657)/10^{-6} = 66$ — in the turbulent core, where the power law is a fair approximation (the log law gives $5.5 + 2.5\ln 66 = 15.96$, i.e. 1.05 m/s).`,
      },
    ],
    answer: md`$\Rey = 3.0\times10^4$; $f_{\mathrm F} = 0.00600$ (Blasius) vs $0.00585$ (9.53); $\tau_w = 4.32$ Pa; $\Delta p/L \approx 690$ Pa/m; $\overline{v}_{zc} \approx 1.47$ m/s; $\overline{v}_z(1\ \text{mm}) \approx 1.02$ m/s at $y^+ \approx 66$.`,
    insight: 'About 70 % of the centreline speed is reached within 8 % of the radius from the wall — the blunt turbulent profile.',
  },
  {
    id: 'ex-tau-from-point',
    concept: 'blasius-power-law',
    title: 'Wall shear stress from a single velocity reading',
    difficulty: 2,
    given: md`Air ($\rho = 1.20$ kg/m³, $\nu = 1.5\times10^{-5}$ m²/s) in a smooth duct; a Pitot tube reads $\overline{v}_z = 12$ m/s at $y = 15$ mm from the wall.`,
    find: md`$\overline{v}_z^{*}$ and $\tau_w$ from (9.79)–(9.80); check $y^+$; compare with the log law.`,
    steps: [
      {
        title: 'Friction velocity (9.79)',
        md: md`$12^{7/8} = 8.796$ and $(\nu/y)^{1/8} = (1.5\times10^{-5}/0.015)^{1/8} = (10^{-3})^{1/8} = 0.4217$, so $\overline{v}_z^{*} = 0.150 \times 8.796 \times 0.4217 = 0.556$ m/s.`,
      },
      {
        title: 'Wall shear stress (9.80)',
        md: md`$\nu/(\overline{v}_z y) = 1.5\times10^{-5}/(12 \times 0.015) = 8.33\times10^{-5}$, whose fourth root is $0.0955$:
          $\tau_w = 0.0225 \times 1.20 \times 12^2 \times 0.0955 = 0.371$ Pa $\;(= \rho(\overline{v}_z^{*})^2$ ✓).`,
      },
      {
        title: 'Is the probe in the right place?',
        md: md`$y^+ = y\overline{v}_z^{*}/\nu = (0.015)(0.556)/(1.5\times10^{-5}) = 556$ — in the turbulent core ($> 30$) and below about 1000, where the 1/7 law tracks the log law.`,
      },
      {
        title: 'Cross-check with the log law',
        md: md`Solve $12/\overline{v}_z^{*} = 5.5 + 2.5\ln(0.015\,\overline{v}_z^{*}/1.5\times10^{-5})$ by iteration ($\overline{v}_z^{*} \to 0.5633 \to 0.5625 \to 0.5626$): $\overline{v}_z^{*} = 0.563$ m/s and $\tau_w = 0.380$ Pa — (9.80) is about 2 % lower.`,
      },
    ],
    answer: md`$\overline{v}_z^{*} \approx 0.556$ m/s, $\tau_w \approx 0.37$ Pa, $y^+ \approx 560$ (log law: 0.38 Pa).`,
    insight: '(9.80) needs the velocity at a known y, not the wall gradient — the 1/7 law has infinite slope at the wall.',
  },
]

/* ------------------------------------------------------------------------------------------------ */
/* practice                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

export const practice: PracticeDef[] = [
  /* ---------- concept 1 ---------- */
  {
    id: 'pr-smooth-water-40mm',
    concept: 'smooth-pipe-friction',
    difficulty: 1,
    q: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) flows at $\overline{v}_{zm} = 0.50$ m/s through a smooth tube of diameter $D = 40$ mm. (a) Find $\Rey$ and the Fanning friction factor from (9.53). (b) How far off is the Blasius law? (c) Find $\tau_w$ and the pressure drop over 10 m of tube.`,
    hint: md`Iterate $x_{k+1} = 1.74\ln(\Rey/x_k) - 0.391$ with $x = 1/\sqrt{f_{\mathrm F}}$; the Blasius value is a good starting guess. Then $\Delta p = 4\tau_w L/D$.`,
    answer: md`$\Rey = 2.0\times10^4$; $f_{\mathrm F} = 0.00645$ (Blasius 0.00664, about 3 % high); $\tau_w = 0.806$ Pa; $\Delta p \approx 806$ Pa over 10 m.`,
    solution: md`**(a)** $\Rey = \overline{v}_{zm}D/\nu = (0.50)(0.040)/(1.0\times10^{-6}) = 2.0\times10^4$ — turbulent and inside the range of (9.53).

      Start from Blasius, $f_0 = 0.0790\,(2.0\times10^4)^{-1/4} = 0.00664$, i.e. $x_0 = 12.269$, and iterate $x_{k+1} = 1.74\ln(\Rey/x_k) - 0.391$:

      | $k$ | $x_k$ | $f_k = 1/x_k^2$ |
      |---|---|---|
      | 1 | 12.479 | 0.006422 |
      | 2 | 12.449 | 0.006452 |
      | 3 | 12.453 | 0.006448 |

      So $f_{\mathrm F} = 0.00645$.

      **(b)** Blasius gives 0.00664, 3.0 % above (9.53) — acceptable because $\Rey < 10^5$.

      **(c)** $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 = 0.5(0.00645)(1000)(0.50)^2 = 0.806$ Pa. Force balance (Wilkes 9.82): $\Delta p/L = 4\tau_w/D = 4(0.806)/0.040 = 80.6$ Pa/m, so $\Delta p \approx 806$ Pa over 10 m.`,
    check: [
      { label: md`$f_{\mathrm F}$ from (9.53)`, value: 0.00645 },
      { label: md`$\Delta p$ over 10 m`, value: 806, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'pr-smooth-inverse',
    concept: 'smooth-pipe-friction',
    difficulty: 2,
    q: md`A smooth water pipe ($D = 80$ mm, $\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) shows a measured pressure gradient $-\dd\overline{p}/\dd z = 400$ Pa/m. Find the mean velocity and the volumetric flow rate **without iterating**, then confirm $\Rey$ and $f_{\mathrm F}$.`,
    hint: md`Force balance (Wilkes 9.82): $\tau_w = \tfrac{a}{2}(-\dd\overline{p}/\dd z)$. Then $\overline{v}_z^{*} = \sqrt{\tau_w/\rho}$ and (9.50) as $\overline{v}_{zm}/\overline{v}_z^{*} = 2.5\ln(a\overline{v}_z^{*}/\nu) + 1.75$.`,
    answer: md`$\tau_w = 8.0$ Pa, $\overline{v}_z^{*} = 0.0894$ m/s, $a^+ = 3578$, $\overline{v}_{zm} \approx 1.99$ m/s, $Q \approx 9.98\times10^{-3}$ m³/s (≈ 10.0 L/s), $\Rey \approx 1.59\times10^5$, $f_{\mathrm F} \approx 0.00406$.`,
    solution: md`1. $\tau_w = \dfrac{a}{2}\left(-\dfrac{\dd\overline{p}}{\dd z}\right) = \dfrac{0.040}{2}(400) = 8.0$ Pa.
      2. $\overline{v}_z^{*} = \sqrt{8.0/1000} = 0.0894$ m/s and $a^+ = a\overline{v}_z^{*}/\nu = (0.040)(0.0894)/10^{-6} = 3578$.
      3. (9.49)/(9.50): $\overline{v}_{zm}/\overline{v}_z^{*} = 2.5\ln 3578 + 1.75 = 2.5(8.183) + 1.75 = 22.21$, so $\overline{v}_{zm} = 22.21 \times 0.0894 = 1.99$ m/s.
      4. $Q = \tfrac{\pi}{4}D^2\,\overline{v}_{zm} = \tfrac{\pi}{4}(0.080)^2(1.986) = 9.98\times10^{-3}$ m³/s ≈ 10.0 L/s.
      5. Check: $\Rey = (1.986)(0.080)/10^{-6} = 1.59\times10^5$ and $f_{\mathrm F} = 2/(\overline{v}_{zm}/\overline{v}_z^{*})^2 = 2/22.21^2 = 0.00406$, which satisfies (9.52) at this $\Rey$ (0.00405 — the tiny difference is the rounding of 1.77 and 0.601).

      When the pressure gradient is known, (9.50) is explicit; iteration of (9.52)/(9.53) is only needed when $\overline{v}_{zm}$ (or $Q$) is the given quantity.`,
    check: [
      { label: md`$\overline{v}_{zm}$`, value: 1.986, units: md`\mathrm{m/s}` },
      { label: md`$Q$`, value: 9.98, units: md`\mathrm{L/s}`, tol: 0.03 },
    ],
  },
  {
    id: 'pr-derive-952',
    concept: 'smooth-pipe-friction',
    difficulty: 3,
    q: md`Starting from (9.50) and the definition (9.51), derive the theoretical smooth-pipe law (9.52). Where do the numbers 1.77 and −0.601 come from?`,
    hint: md`Show that $\overline{v}_{zm}/\sqrt{\tau_w/\rho} = \sqrt{2/f_{\mathrm F}}$ and that the argument of the logarithm in (9.50) equals $\Rey\sqrt{f_{\mathrm F}}/(2\sqrt2)$.`,
    answer: md`$1/\sqrt{f_{\mathrm F}} = (2.5/\sqrt2)\ln(\Rey\sqrt{f_{\mathrm F}}) + [1.75 - 2.5\ln(2\sqrt2)]/\sqrt2 = 1.768\ln(\Rey\sqrt{f_{\mathrm F}}) - 0.6005$.`,
    solution: md`From (9.51), $\tau_w/(\rho\overline{v}_{zm}^2) = f_{\mathrm F}/2$. Dividing (9.50) by $\sqrt{\tau_w/\rho}$, with $\Rey = D\overline{v}_{zm}/\nu$:

      $$
      \sqrt{\frac{2}{f_{\mathrm F}}} = 2.5\ln\left(\frac{\Rey}{2}\sqrt{\frac{f_{\mathrm F}}{2}}\right) + 1.75 = 2.5\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 2.5\ln\left(2\sqrt2\right) + 1.75
      $$

      Since $\ln(2\sqrt2) = 1.0397$, the constant is $1.75 - 2.5993 = -0.8493$. Dividing everything by $\sqrt2$:

      $$
      \frac{1}{\sqrt{f_{\mathrm F}}} = 1.7678\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 0.6005
      $$

      which Wilkes rounds to $1.77$ and $-0.601$ — Eq. (9.52).`,
    check: [
      { label: 'coefficient of the logarithm', value: 1.768, tol: 0.005 },
      { label: 'constant term', value: -0.6005, tol: 0.01 },
    ],
  },
  {
    id: 'pr-darcy-form',
    concept: 'smooth-pipe-friction',
    difficulty: 2,
    q: md`Moody charts and many other books use the **Darcy** factor $f_{\mathrm D} = 4f_{\mathrm F}$ and base-10 logarithms. Rewrite Wilkes's experimental law (9.53) as $1/\sqrt{f_{\mathrm D}} = \alpha\log_{10}(\Rey\sqrt{f_{\mathrm D}}) + \beta$ and find $\alpha$ and $\beta$.`,
    hint: md`Substitute $f_{\mathrm F} = f_{\mathrm D}/4$ on both sides and use $\ln x = 2.3026\log_{10}x$.`,
    answer: md`$\alpha = 2.00$, $\beta = -0.80$: $1/\sqrt{f_{\mathrm D}} = 2.00\log_{10}(\Rey\sqrt{f_{\mathrm D}}) - 0.80$ — the classical Prandtl form.`,
    solution: md`With $f_{\mathrm F} = f_{\mathrm D}/4$: $1/\sqrt{f_{\mathrm F}} = 2/\sqrt{f_{\mathrm D}}$ and $\Rey\sqrt{f_{\mathrm F}} = \Rey\sqrt{f_{\mathrm D}}/2$. So (9.53) becomes

      $$
      \frac{2}{\sqrt{f_{\mathrm D}}} = 1.74\ln\left(\Rey\sqrt{f_{\mathrm D}}\right) - 1.74\ln 2 - 0.391
      $$

      Divide by 2 and convert to $\log_{10}$:

      $$
      \frac{1}{\sqrt{f_{\mathrm D}}} = 0.87(2.3026)\log_{10}\left(\Rey\sqrt{f_{\mathrm D}}\right) - \frac{1.206 + 0.391}{2} = 2.003\log_{10}\left(\Rey\sqrt{f_{\mathrm D}}\right) - 0.799
      $$

      So $\alpha \approx 2.00$ and $\beta \approx -0.80$ — the familiar Prandtl smooth-pipe law in Darcy form. Same physics, different bookkeeping: always check which friction factor a formula expects.`,
    check: [
      { label: md`$\alpha$`, value: 2.003, tol: 0.01 },
      { label: md`$\beta$`, value: -0.799, tol: 0.02 },
    ],
  },

  /* ---------- concept 2 ---------- */
  {
    id: 'pr-cast-iron-regime',
    concept: 'rough-pipe',
    difficulty: 1,
    q: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) flows through a cast-iron pipe with roughness $\varepsilon = 0.26$ mm, and the wall shear stress is $\tau_w = 20$ Pa. (a) Calculate $\varepsilon\overline{v}_z^{*}/\nu$ and name the regime. (b) Compare $\varepsilon$ with the three-region sublayer thickness $5\nu/\overline{v}_z^{*}$.`,
    hint: md`$\overline{v}_z^{*} = \sqrt{\tau_w/\rho}$. The regime limits are 5 and 70 (Eqs. 9.64–9.66).`,
    answer: md`$\overline{v}_z^{*} = 0.141$ m/s; $\varepsilon^+ = 36.8$ → transition, $f_{\mathrm F} = f_{\mathrm F}(\Rey, \varepsilon/a)$. Sublayer edge $5\nu/\overline{v}_z^{*} = 0.035$ mm, about 7 times smaller than $\varepsilon$.`,
    solution: md`**(a)** $\overline{v}_z^{*} = \sqrt{20/1000} = 0.1414$ m/s, so $\varepsilon\overline{v}_z^{*}/\nu = (0.26\times10^{-3})(0.1414)/(1.0\times10^{-6}) = 36.8$. Since $5 < 36.8 < 70$ this is the **transition** regime (9.65): $f_{\mathrm F}$ depends on both $\Rey$ and $\varepsilon/a$.

      **(b)** $5\nu/\overline{v}_z^{*} = 5(10^{-6})/0.1414 = 3.5\times10^{-5}$ m $= 0.035$ mm. The 0.26 mm bumps are about 7 times taller than the sublayer: they reach well into the buffer region (which ends at $y^+ = 30$, i.e. $0.21$ mm) and just beyond it, but not the $y^+ = 70$ needed for completely rough behaviour.`,
    check: [{ label: md`$\varepsilon\overline{v}_z^{*}/\nu$`, value: 36.8 }],
  },
  {
    id: 'pr-colebrook-galvanized',
    concept: 'rough-pipe',
    difficulty: 2,
    q: md`A galvanized-iron pipe ($\varepsilon = 0.15$ mm, $D = 50$ mm) carries water at $\Rey = 1.0\times10^5$. (a) Solve Colebrook–White (9.70) for $f_{\mathrm F}$. (b) Compare with the smooth-pipe value (9.53) and with the completely rough limit. (c) Which regime is it?`,
    hint: md`$\varepsilon/D = 0.003$. Start from $x_0 = -1.737\ln(0.269\,\varepsilon/D)$ and iterate $x_{k+1} = -1.737\ln(0.269\,\varepsilon/D + 1.257x_k/\Rey)$. For (c), $\varepsilon^+ = (\varepsilon/D)\,\Rey\,\sqrt{f_{\mathrm F}/2}$.`,
    answer: md`$f_{\mathrm F} = 0.00686$ (Darcy 0.0274); smooth 0.00448 (roughness adds ≈ 53 %); completely rough limit 0.00653; $\varepsilon^+ = 17.6$ → transition.`,
    solution: md`**(a)** $\varepsilon/D = 0.15/50 = 0.003$, so $0.269\,\varepsilon/D = 8.07\times10^{-4}$. Start: $x_0 = -1.737\ln(8.07\times10^{-4}) = 12.371$ ($f = 0.006534$). Iterate:

      | $k$ | $x_k$ | $f_k$ |
      |---|---|---|
      | 1 | 12.065 | 0.006870 |
      | 2 | 12.072 | 0.006862 |
      | 3 | 12.072 | 0.006862 |

      So $f_{\mathrm F} = 0.00686$ (Darcy $f_{\mathrm D} = 0.0274$).

      **(b)** The smooth law (9.53) at $\Rey = 10^5$ gives 0.00448, so the roughness raises $f_{\mathrm F}$ by about 53 %. The completely rough limit is 0.00653; the actual value is still 5 % above it because the viscous term $1.257/(\Rey\sqrt{f_{\mathrm F}})$ has not yet become negligible.

      **(c)** $\varepsilon^+ = (0.003)(1.0\times10^5)\sqrt{0.00686/2} = 300 \times 0.0586 = 17.6$: **transition** ($5 < \varepsilon^+ < 70$).`,
    check: [
      { label: md`$f_{\mathrm F}$`, value: 0.00686 },
      { label: md`$\varepsilon^+$`, value: 17.6 },
    ],
  },
  {
    id: 'pr-concrete-onset',
    concept: 'rough-pipe',
    difficulty: 2,
    q: md`A concrete culvert ($\varepsilon = 1.0$ mm, $D = 0.50$ m) carries water ($\nu = 1.0\times10^{-6}$ m²/s). (a) What is $f_{\mathrm F}$ once the flow is completely rough? (b) Above roughly what mean velocity is $\varepsilon\overline{v}_z^{*}/\nu > 70$?`,
    hint: md`Use the $\Rey \to \infty$ limit of (9.70). Then $\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$, so $\varepsilon^+ = 70$ gives $\overline{v}_{zm} = 70\nu/(\varepsilon\sqrt{f_{\mathrm F}/2})$.`,
    answer: md`$f_{\mathrm F} = 0.00585$; completely rough for $\overline{v}_{zm} \gtrsim 1.29$ m/s ($\Rey \approx 6.5\times10^5$).`,
    solution: md`**(a)** $\varepsilon/D = 0.002$, so $1/\sqrt{f_{\mathrm F}} = -1.737\ln(0.269\times0.002) = -1.737\ln(5.38\times10^{-4}) = 13.076$ and $f_{\mathrm F} = 1/13.076^2 = 0.00585$.

      **(b)** $\sqrt{f_{\mathrm F}/2} = 0.0541$. Setting $\varepsilon\overline{v}_{zm}\sqrt{f_{\mathrm F}/2}/\nu = 70$:

      $$
      \overline{v}_{zm} = \frac{70\nu}{\varepsilon\sqrt{f_{\mathrm F}/2}} = \frac{70(1.0\times10^{-6})}{(1.0\times10^{-3})(0.0541)} = 1.29\ \text{m/s}
      $$

      ($\Rey = 1.29 \times 0.50/10^{-6} = 6.5\times10^5$.) Check with the full Colebrook equation at this $\Rey$: $f_{\mathrm F} = 0.00592$, which gives $\varepsilon^+ = 70.4$ — consistent. Above about 1.3 m/s the friction factor stays near 0.0059 whatever the velocity.`,
    check: [
      { label: md`$f_{\mathrm F}$ (completely rough)`, value: 0.00585 },
      { label: md`minimum $\overline{v}_{zm}$`, value: 1.29, units: md`\mathrm{m/s}`, tol: 0.03 },
    ],
  },
  {
    id: 'pr-rough-profile-velocities',
    concept: 'rough-pipe',
    difficulty: 3,
    q: md`In a pipe of radius $a = 0.10$ m with roughness $\varepsilon = 0.50$ mm, water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) flows with $\tau_w = 30$ Pa. Using the rough-wall profile (9.69) over the whole cross-section, find (a) $\varepsilon\overline{v}_z^{*}/\nu$ (confirm the regime), (b) the centreline velocity, (c) the mean velocity and $f_{\mathrm F}$.`,
    hint: md`The centreline is at $y = a$. For the mean, reuse Example 9.3: averaging "constant $+\,2.5\ln y$" over the pipe gives the value at $y = a$ minus $\tfrac32(2.5) = 3.75$.`,
    answer: md`$\overline{v}_z^{*} = 0.173$ m/s, $\varepsilon^+ = 86.6$ (completely rough); $\overline{v}_{zc} = 3.77$ m/s; $\overline{v}_{zm} = 3.12$ m/s; $f_{\mathrm F} = 0.00618$.`,
    solution: md`**(a)** $\overline{v}_z^{*} = \sqrt{30/1000} = 0.1732$ m/s; $\varepsilon^+ = (0.50\times10^{-3})(0.1732)/10^{-6} = 86.6 > 70$ — completely rough, so (9.69) applies.

      **(b)** At $y = a$: $a/\varepsilon = 0.10/0.0005 = 200$, $\ln 200 = 5.298$, so $\overline{v}_{zc} = \overline{v}_z^{*}(8.5 + 2.5\times5.298) = 0.1732 \times 21.75 = 3.77$ m/s.

      **(c)** Example 9.3 shows that the area average of "constant $+\,B\ln y$" equals its value at $y = a$ minus $\tfrac32 B$: $\overline{v}_{zm} = \overline{v}_z^{*}(21.75 - 3.75) = 0.1732 \times 18.00 = 3.12$ m/s. Then $f_{\mathrm F} = 2(\overline{v}_z^{*}/\overline{v}_{zm})^2 = 2/18.00^2 = 0.00618$ — compare the completely rough limit of Colebrook–White for $\varepsilon/D = 0.0025$, 0.00621. The ratio $\overline{v}_{zm}/\overline{v}_{zc} = 0.83$ shows how flat the turbulent profile is.`,
    check: [
      { label: md`$\overline{v}_{zc}$`, value: 3.77, units: md`\mathrm{m/s}` },
      { label: md`$\overline{v}_{zm}$`, value: 3.12, units: md`\mathrm{m/s}` },
    ],
  },

  /* ---------- concept 3 ---------- */
  {
    id: 'pr-blasius-air-duct',
    concept: 'blasius-power-law',
    difficulty: 1,
    q: md`Air ($\rho = 1.2$ kg/m³, $\nu = 1.6\times10^{-5}$ m²/s) flows at $\overline{v}_{zm} = 4.0$ m/s through a smooth duct of $D = 0.20$ m. (a) Check that the Blasius law applies and find $f_{\mathrm F}$. (b) Compare with (9.53). (c) Find the pressure gradient.`,
    hint: md`$\Rey = \overline{v}_{zm}D/\nu$; Blasius needs a smooth wall and $\Rey \lesssim 10^5$. Then $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2$ and $\Delta p/L = 4\tau_w/D$.`,
    answer: md`$\Rey = 5.0\times10^4$ (below $10^5$ ✓); $f_{\mathrm F} = 0.00528$ (9.53: 0.00521 — Blasius 1.5 % high); $\Delta p/L \approx 1.01$ Pa/m.`,
    solution: md`**(a)** $\Rey = (4.0)(0.20)/(1.6\times10^{-5}) = 5.0\times10^4 < 10^5$ and the duct is smooth, so Blasius applies. $\Rey^{1/4} = 14.95$, so $f_{\mathrm F} = 0.0790/14.95 = 0.00528$.

      **(b)** Iterating (9.53) gives $f_{\mathrm F} = 0.00521$: Blasius is 1.5 % higher — well within engineering accuracy.

      **(c)** $\tau_w = \tfrac12(0.00528)(1.2)(4.0)^2 = 0.0507$ Pa, so $\Delta p/L = 4\tau_w/D = 4(0.0507)/0.20 = 1.01$ Pa/m.`,
    check: [
      { label: md`$f_{\mathrm F}$ (Blasius)`, value: 0.00528 },
      { label: md`$\Delta p/L$`, value: 1.01, units: md`\mathrm{Pa/m}` },
    ],
  },
  {
    id: 'pr-n5-profile',
    concept: 'blasius-power-law',
    difficulty: 2,
    q: md`At higher Reynolds numbers a Blasius-type law with $n = 5$ fits smooth-pipe data better than $n = 4$. (a) What profile exponent $m$ does (9.77) give? (b) What is $\overline{v}_{zm}/\overline{v}_{zc}$ for that profile? (c) What is the exponent in Fox & McDonald's notation $\bar u/U = (y/R)^{1/n_{\text{Fox}}}$?`,
    hint: md`$m = 1/(2n-1)$, and averaging $(y/a)^m$ with (9.48) gives $\overline{v}_{zm}/\overline{v}_{zc} = 2/[(m+1)(m+2)]$.`,
    answer: md`$m = 1/9 = 0.111$; $\overline{v}_{zm}/\overline{v}_{zc} = 81/95 = 0.853$; $n_{\text{Fox}} = 1/m = 9$.`,
    solution: md`**(a)** $m = 1/(2\times5 - 1) = 1/9 = 0.111$ — a blunter profile than the 1/7 law.

      **(b)** With $\overline{v}_z = \overline{v}_{zc}(y/a)^m$ and $r = a - y$ in (9.48):

      $$
      \overline{v}_{zm} = \frac{2\overline{v}_{zc}}{a^2}\int_0^a (a-y)\left(\frac{y}{a}\right)^m\dd y = \frac{2\overline{v}_{zc}}{(m+1)(m+2)}
      $$

      For $m = 1/9$: $\dfrac{2}{(10/9)(19/9)} = \dfrac{162}{190} = 0.853$ (compare 0.817 for $m = 1/7$).

      **(c)** Fox's exponent is the reciprocal: $n_{\text{Fox}} = 1/m = 2n - 1 = 9$. Fox's Eq. 8.24, $\bar V/U = 2n^2/[(n+1)(2n+1)]$, gives $2(81)/(10\times19) = 0.853$ — the same number.`,
    check: [
      { label: md`$m$`, value: 0.1111 },
      { label: md`$\overline{v}_{zm}/\overline{v}_{zc}$`, value: 0.853 },
    ],
  },
  {
    id: 'pr-pitot-water',
    concept: 'blasius-power-law',
    difficulty: 2,
    q: md`A Pitot tube in a smooth water pipe ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) reads $\overline{v}_z = 2.0$ m/s at $y = 10$ mm from the wall. Use (9.79)–(9.80) to estimate $\overline{v}_z^{*}$ and $\tau_w$, and check that the probe is in the turbulent core.`,
    hint: md`$\tau_w = 0.0225\,\rho\overline{v}_z^2\,(\nu/(\overline{v}_z y))^{1/4}$; then $y^+ = y\overline{v}_z^{*}/\nu$ should exceed about 30.`,
    answer: md`$\tau_w = 7.57$ Pa, $\overline{v}_z^{*} = 0.0870$ m/s, $y^+ \approx 870$ (turbulent core ✓).`,
    solution: md`$\nu/(\overline{v}_z y) = 10^{-6}/(2.0\times0.010) = 5.0\times10^{-5}$ and $(5.0\times10^{-5})^{1/4} = 0.0841$.

      $\tau_w = 0.0225(1000)(2.0)^2(0.0841) = 7.57$ Pa, so $\overline{v}_z^{*} = \sqrt{7.57/1000} = 0.0870$ m/s — the same as (9.79): $0.150(2.0)^{7/8}(10^{-6}/0.010)^{1/8} = 0.150 \times 1.834 \times 0.316 = 0.0870$ m/s.

      $y^+ = (0.010)(0.0870)/10^{-6} = 870$: inside the turbulent core and below about 1000, where the 1/7 law still follows the log law closely — so the estimate is sensible.`,
    check: [{ label: md`$\tau_w$`, value: 7.57, units: md`\mathrm{Pa}` }],
  },
  {
    id: 'pr-local-blasius',
    concept: 'blasius-power-law',
    difficulty: 3,
    q: md`Apply the wall-stress formula (9.80) at the **centreline** ($y = a$, $\overline{v}_z = \overline{v}_{zc}$) and use $\overline{v}_{zc} = \tfrac{60}{49}\overline{v}_{zm}$ for the 1/7 law. Show that the result has the Blasius form $f_{\mathrm F} = C\,\Rey^{-1/4}$ and find $C$. How does it compare with 0.0790?`,
    hint: md`Write $f_{\mathrm F} = 2\tau_w/(\rho\overline{v}_{zm}^2)$, express everything through $\overline{v}_{zm}$, and use $a = D/2$, $\Rey = D\overline{v}_{zm}/\nu$.`,
    answer: md`$f_{\mathrm F} = 0.045\,(60/49)^{7/4}\,2^{1/4}\,\Rey^{-1/4} = 0.0763\,\Rey^{-1/4}$ — about 3.4 % below the Blasius coefficient 0.0790.`,
    solution: md`$f_{\mathrm F} = \dfrac{2\tau_w}{\rho\overline{v}_{zm}^2} = 0.045\left(\dfrac{\overline{v}_{zc}}{\overline{v}_{zm}}\right)^2\left(\dfrac{\nu}{\overline{v}_{zc}\,a}\right)^{1/4}$.

      Put $\overline{v}_{zc} = \lambda\overline{v}_{zm}$ with $\lambda = 60/49$, and $a = D/2$:

      $$
      f_{\mathrm F} = 0.045\,\lambda^{2}\lambda^{-1/4}\left(\frac{2\nu}{\overline{v}_{zm}D}\right)^{1/4} = 0.045\,\lambda^{7/4}\,2^{1/4}\,\Rey^{-1/4}
      $$

      Numbers: $\lambda^{7/4} = 1.2245^{1.75} = 1.4254$ and $2^{1/4} = 1.1892$, so $C = 0.045 \times 1.4254 \times 1.1892 = 0.0763$.

      The 1/7 profile reproduces the Blasius **exponent** exactly (that is what $m = 1/(2n-1)$ guarantees), and the coefficient is within 3.4 % of 0.0790 — consistent with Wilkes's remark that $c$ and $A$ are linked and that measuring either gives $c = 8.74$.`,
    check: [{ label: md`$C$`, value: 0.0763 }],
  },
]

/* ------------------------------------------------------------------------------------------------ */
/* quiz                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

export const quiz: QuizQ[] = [
  {
    id: 'q-fanning-darcy',
    concept: 'smooth-pipe-friction',
    difficulty: 1,
    q: md`A Moody chart gives a **Darcy** friction factor of 0.020 for your pipe. Which value must you use in Wilkes's equations such as (9.51)–(9.53)?`,
    options: [md`$f_{\mathrm F} = 0.005$`, md`$f_{\mathrm F} = 0.020$`, md`$f_{\mathrm F} = 0.080$`, md`$f_{\mathrm F} = 0.010$`],
    answer: 0,
    explain: md`Wilkes uses the Fanning factor $f_{\mathrm F} = \tau_w/(\tfrac12\rho\overline{v}_{zm}^2)$, and the Darcy factor is four times larger, so $f_{\mathrm F} = 0.020/4 = 0.005$. Using 0.020 directly overestimates $\tau_w$ and $\Delta p$ four-fold; 0.080 multiplies instead of dividing; 0.010 confuses the factor 4 with the ½ in the definition.`,
  },
  {
    id: 'q-sublayer-negligible',
    concept: 'smooth-pipe-friction',
    difficulty: 1,
    src: wk('497'),
    q: md`Why may the logarithmic profile $v_z^+ = A + B\ln y^+$ be used over the **whole** cross-section when computing $\overline{v}_{zm}$, although it is wrong very close to the wall?`,
    options: [
      'The laminar sublayer is so thin that it contributes virtually nothing to the flow rate',
      'The velocity inside the laminar sublayer is exactly zero',
      md`The log law becomes exact again at the wall because $\ln y^+ \to 0$ there`,
      'The errors in the buffer region exactly cancel those in the sublayer',
    ],
    answer: 0,
    explain: md`Wilkes's justification (p. 497) is that the sublayer is so thin it contributes virtually nothing to the flow — about 0.05 % of $Q$ at $\Rey = 10^5$. The velocity there is not zero (it rises linearly, $v_z^+ = y^+$, to $5\,\overline{v}_z^{*}$ at the three-region sublayer edge, or $11.6\,\overline{v}_z^{*}$ in the two-region model), $\ln y^+ \to -\infty$ (not 0) as $y \to 0$, and no exact cancellation is involved — the error is simply negligible.`,
  },
  {
    id: 'q-implicit',
    concept: 'smooth-pipe-friction',
    difficulty: 2,
    q: md`Equation (9.53) contains $f_{\mathrm F}$ on both sides. What is the practical way to find $f_{\mathrm F}$ for a given $\Rey$?`,
    options: [
      md`Guess $f_{\mathrm F}$, evaluate the right-hand side, update and repeat until it stops changing`,
      md`Solve it as a quadratic in $\sqrt{f_{\mathrm F}}$`,
      md`Set $\sqrt{f_{\mathrm F}} = 1$ inside the logarithm and solve directly`,
      md`Use the laminar value $16/\Rey$`,
    ],
    answer: 0,
    explain: md`With $x = 1/\sqrt{f_{\mathrm F}}$, (9.53) reads $x = 1.74\ln(\Rey/x) - 0.391$; fixed-point iteration converges in 3–4 steps because the right side depends only weakly (logarithmically) on $x$. It is not a quadratic — the unknown sits inside a logarithm; setting $\sqrt{f_{\mathrm F}} = 1$ gives a grossly wrong answer; $16/\Rey$ is the laminar law.`,
  },
  {
    id: 'q-953-range',
    concept: 'smooth-pipe-friction',
    difficulty: 1,
    src: wk('498'),
    q: md`According to Wilkes, over what range has the experimental smooth-pipe law (9.53) been confirmed?`,
    options: [
      md`From $\Rey = 5\times10^3$ up to at least $3.4\times10^6$, and probably beyond`,
      md`Only for $\Rey < 10^5$`,
      'For laminar and turbulent flow alike',
      md`Only above $\Rey = 10^6$`,
    ],
    answer: 0,
    explain: md`p. 498: (9.53) agrees with experiment for smooth pipes from $5\times10^3$ up to at least $3.4\times10^6$ and probably beyond. The $\Rey < 10^5$ restriction belongs to the Blasius law, and the law is for turbulent flow only.`,
  },
  {
    id: 'q-centre-mean',
    concept: 'smooth-pipe-friction',
    difficulty: 3,
    q: md`For the log profile used across the whole pipe, how do the centreline velocity (log law at $y = a$) and the mean velocity (9.49) compare?`,
    options: [
      md`$\overline{v}_{zc} - \overline{v}_{zm} = \tfrac32 B\,\overline{v}_z^{*} = 3.75\,\overline{v}_z^{*}$`,
      md`$\overline{v}_{zc} = 2\,\overline{v}_{zm}$`,
      md`$\overline{v}_{zc} = \overline{v}_{zm}$, because the turbulent profile is flat`,
      md`$\overline{v}_{zc} - \overline{v}_{zm} = A\,\overline{v}_z^{*} = 5.5\,\overline{v}_z^{*}$`,
    ],
    answer: 0,
    explain: md`At $y = a$ the log law gives $\overline{v}_{zc}/\overline{v}_z^{*} = A + B\ln a^+$, while (9.49) gives $A + B\ln a^+ - \tfrac32 B$: the difference is $\tfrac32 B = 3.75$ friction velocities, e.g. $\overline{v}_{zm}/\overline{v}_{zc} \approx 21.2/24.9 = 0.85$ at $\Rey = 10^5$. "Twice" is the laminar result; the turbulent profile is blunt but not uniform; $A$ cancels in the difference.`,
  },
  {
    id: 'q-regime-40',
    concept: 'rough-pipe',
    difficulty: 1,
    src: wk('501'),
    q: md`For turbulent flow in a pipe with $\varepsilon\overline{v}_z^{*}/\nu = 40$, the Fanning friction factor depends on…`,
    options: [md`both $\Rey$ and the relative roughness $\varepsilon/a$`, md`$\Rey$ only`, md`$\varepsilon/a$ only`, 'neither — it is a universal constant of about 0.005'],
    answer: 0,
    explain: md`$5 < 40 < 70$ is Wilkes's **transition** state (9.65), $f_{\mathrm F} = f_{\mathrm F}(\Rey, \varepsilon/a)$. "$\Rey$ only" is the hydraulically smooth regime (below 5); "$\varepsilon/a$ only" is the completely rough regime (above 70).`,
  },
  {
    id: 'q-fully-rough-velocity',
    concept: 'rough-pipe',
    difficulty: 2,
    q: md`Water flows through a completely rough pipe ($\varepsilon\overline{v}_z^{*}/\nu \gg 70$). The flow rate is doubled. What happens?`,
    options: [
      md`$f_{\mathrm F}$ stays the same and the pressure drop increases about four-fold`,
      md`$f_{\mathrm F}$ halves and the pressure drop doubles`,
      md`$f_{\mathrm F}$ stays the same and the pressure drop doubles`,
      md`$f_{\mathrm F}$ falls as $\Rey^{-1/4}$ and the pressure drop rises as $\overline{v}_{zm}^{1.75}$`,
    ],
    answer: 0,
    explain: md`Completely rough: $f_{\mathrm F} = f_{\mathrm F}(\varepsilon/a)$ only (9.66), so it does not change, and $\Delta p = 4f_{\mathrm F}(L/D)\tfrac12\rho\overline{v}_{zm}^2 \propto \overline{v}_{zm}^2$ → four times larger. The $\overline{v}_{zm}^{1.75}$ behaviour belongs to a **smooth** pipe in the Blasius range; "doubles" forgets that $\Delta p$ scales with the dynamic pressure.`,
  },
  {
    id: 'q-colebrook-scope',
    concept: 'rough-pipe',
    difficulty: 2,
    src: wk('501'),
    q: md`Which statement about the Colebrook–White equation (9.70) is correct?`,
    options: [
      'It covers turbulent flow in hydraulically smooth, transitional and completely rough pipes, and must be solved iteratively',
      md`It also gives the laminar result $f_{\mathrm F} = 16/\Rey$ when $\Rey < 2000$`,
      'It applies only to completely rough pipes',
      md`It gives $f_{\mathrm F}$ explicitly, so no iteration is needed`,
    ],
    answer: 0,
    explain: md`Wilkes presents (9.70) as representing $f_{\mathrm F}$ over a very wide range of roughnesses and **(turbulent)** Reynolds numbers: its $\varepsilon \to 0$ limit is the smooth law, its $\Rey \to \infty$ limit the completely rough law. $f_{\mathrm F}$ appears on both sides, so it must be iterated, and it does not reproduce laminar flow.`,
  },
  {
    id: 'q-rough-profile',
    concept: 'rough-pipe',
    difficulty: 2,
    src: wk('501'),
    q: md`What is special about the completely rough profile $\overline{v}_z/\overline{v}_z^{*} = 8.5 + 2.5\ln(y/\varepsilon)$ (9.69)?`,
    options: [
      md`Viscosity does not appear: the roughness height $\varepsilon$ replaces the viscous length $\nu/\overline{v}_z^{*}$`,
      'It is valid right down into the laminar sublayer',
      md`Its constant $B$ depends on the pipe radius`,
      md`It turns into the laminar parabola as $\varepsilon \to 0$`,
    ],
    answer: 0,
    explain: md`Compared with the smooth law $5.5 + 2.5\ln(y\overline{v}_z^{*}/\nu)$, the length that scales $y$ is now $\varepsilon$ instead of $\nu/\overline{v}_z^{*}$, so $\nu$ has disappeared — and Wilkes stresses that (9.69) is independent of the pipe radius. It describes the turbulent core (the elements stick out far beyond any sublayer), not laminar flow.`,
  },
  {
    id: 'q-m-from-n',
    concept: 'blasius-power-law',
    difficulty: 1,
    src: wk('502'),
    q: md`A Blasius-type friction law $f_{\mathrm F} = A(a\overline{v}_{zm}/\nu)^{-1/n}$ with $n = 4$ implies a power-law velocity profile with exponent…`,
    options: [md`$m = 1/7$`, md`$m = 1/4$`, md`$m = 1/8$`, md`$m = 4$`],
    answer: 0,
    explain: md`Equating the exponents of $\overline{v}_z^{*}a/\nu$ in (9.74) and (9.76) gives $m = 1/(2n-1) = 1/7$ — the one-seventh law. $1/4$ just copies the friction-law exponent; $1/8$ mistakes $2n - 1$ for $2n$.`,
  },
  {
    id: 'q-blasius-range',
    concept: 'blasius-power-law',
    difficulty: 1,
    src: wk('502'),
    q: md`The Blasius law $f_{\mathrm F} = 0.0790\,\Rey^{-1/4}$ should be used for…`,
    options: [
      md`smooth pipes with $\Rey$ up to about $10^5$`,
      'rough pipes at any Reynolds number',
      'laminar flow in smooth pipes',
      md`smooth pipes at very high $\Rey$ (above $10^6$), where it is most accurate`,
    ],
    answer: 0,
    explain: md`Wilkes restricts (9.71) to smooth pipe with $\Rey$ no larger than $10^5$ (and calls (9.59) "of more limited range" than (9.53)). At $\Rey = 10^6$ it is already about 14 % below (9.53); it knows nothing about roughness; laminar flow has $f_{\mathrm F} = 16/\Rey$.`,
  },
  {
    id: 'q-wall-slope',
    concept: 'blasius-power-law',
    difficulty: 2,
    q: md`Why does Eq. (9.80) obtain $\tau_w$ from the velocity at a definite distance $y$ instead of from $\mu\,\dd\overline{v}_z/\dd y$ at the wall?`,
    options: [
      md`The power-law profile has an infinite velocity gradient at $y = 0$, so its wall slope is meaningless`,
      'The one-seventh law gives zero slope at the wall',
      'Viscosity plays no role anywhere in turbulent pipe flow',
      'The wall shear stress is zero in turbulent flow',
    ],
    answer: 0,
    explain: md`$\dd(y^{1/7})/\dd y = \tfrac17 y^{-6/7} \to \infty$ as $y \to 0$, so the 1/7 law cannot be differentiated at the wall (Fox & McDonald's p. 295 makes the same point). Instead (9.78) is solved for $\overline{v}_z^{*}$ with one core velocity (9.79), and $\tau_w = \rho(\overline{v}_z^{*})^2$. Viscosity still matters — it appears in (9.80) as $\nu^{1/4}$.`,
  },
  {
    id: 'q-seventh-mean',
    concept: 'blasius-power-law',
    difficulty: 2,
    q: md`For the one-seventh power-law profile (9.61), the mean velocity is about what fraction of the centreline velocity?`,
    options: ['0.82 (exactly 49/60)', '0.50', '1.00', '0.875 (= 7/8)'],
    answer: 0,
    explain: md`Averaging $(y/a)^{1/7}$ over the **area** with (9.48) gives $2/[(m+1)(m+2)] = 2/[(8/7)(15/7)] = 49/60 = 0.817$. 0.50 is the laminar parabola; 1.00 would be a perfectly flat plug profile; 7/8 comes from averaging $y^{1/7}$ along the radius without the $2\pi r$ area weighting.`,
  },
]

/* ------------------------------------------------------------------------------------------------ */
/* flashcards & takeaways                                                                           */
/* ------------------------------------------------------------------------------------------------ */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-fanning',
    front: 'Define the Fanning friction factor. How is it related to the Darcy factor?',
    back: md`$f_{\mathrm F} = \tau_w/(\tfrac12\rho\overline{v}_{zm}^2)$ (Wilkes 9.51). Darcy (Moody) factor $f_{\mathrm D} = 4f_{\mathrm F}$; pressure drop $\Delta p = 4f_{\mathrm F}(L/D)\,\tfrac12\rho\overline{v}_{zm}^2$.`,
    src: wk('498', 'Eq. (9.51)'),
  },
  {
    id: 'fc-vzm-log',
    front: 'Mean velocity when the log profile is used over the whole pipe (9.49)–(9.50)?',
    back: md`$\overline{v}_{zm} = \overline{v}_z^{*}\,[B\ln(a\overline{v}_z^{*}/\nu) + A - \tfrac32B]$; with $A = 5.5$, $B = 2.5$: $\overline{v}_{zm}/\overline{v}_z^{*} = 2.5\ln a^+ + 1.75$ (proved in Example 9.3).`,
    src: wk('497–498'),
  },
  {
    id: 'fc-smooth-law',
    front: 'Experimental smooth-pipe friction law (9.53) and its range',
    back: md`$\sqrt{1/f_{\mathrm F}} = 1.74\ln(\Rey\sqrt{f_{\mathrm F}}) - 0.391$, verified for $5\times10^3 \le \Rey \le 3.4\times10^6$ (probably beyond). Theory from the universal profile: $1.77$ and $-0.601$ (9.52). Both implicit — iterate.`,
    src: wk('498'),
  },
  {
    id: 'fc-vstar-f',
    front: 'Link between friction velocity, mean velocity and the friction factor',
    back: md`$\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 = \rho(\overline{v}_z^{*})^2$ (9.73), so $\overline{v}_z^{*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$ and $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$.`,
    src: wk('502', 'Eq. (9.73)'),
  },
  {
    id: 'fc-regimes',
    front: 'The three roughness regimes and their criteria',
    back: md`$\varepsilon\overline{v}_z^{*}/\nu < 5$: hydraulically smooth, $f_{\mathrm F}(\Rey)$. Between 5 and 70: transition, $f_{\mathrm F}(\Rey, \varepsilon/a)$. Above 70: completely rough, $f_{\mathrm F}(\varepsilon/a)$ only (9.64)–(9.66).`,
    src: wk('501'),
  },
  {
    id: 'fc-rough-profile',
    front: 'Rough-wall velocity profile and the two known values of B',
    back: md`$\overline{v}_z/\overline{v}_z^{*} = 2.5\ln(y/\varepsilon) + B$ (9.67). Hydraulically smooth: $B = 5.5 + 2.5\ln(\varepsilon\overline{v}_z^{*}/\nu)$ — recovers the universal profile. Completely rough: $B = 8.5$ — no viscosity, no pipe radius.`,
    src: wk('501'),
  },
  {
    id: 'fc-colebrook',
    front: 'Colebrook–White equation (Wilkes form) and its two limits',
    back: md`$1/\sqrt{f_{\mathrm F}} = -1.737\ln(0.269\,\varepsilon/D + 1.257/(\Rey\sqrt{f_{\mathrm F}}))$ (9.70), turbulent flow only. $\varepsilon \to 0$: ≈ the smooth law (9.53). $\Rey \to \infty$: $1/\sqrt{f_{\mathrm F}} = -1.737\ln(0.269\,\varepsilon/D)$.`,
    src: wk('501', 'Eq. (9.70)'),
  },
  {
    id: 'fc-epsplus',
    front: md`How do you get $\varepsilon^+$ from $\Rey$, $\varepsilon/D$ and the friction factor?`,
    back: md`$\varepsilon^+ = \varepsilon\overline{v}_z^{*}/\nu = (\varepsilon/D)\,\Rey\,\sqrt{f_{\mathrm F}/2}$ — for a given pipe it grows almost in proportion to $\Rey$.`,
  },
  {
    id: 'fc-blasius',
    front: 'Blasius law: formula, range, consequence for the pressure drop',
    back: md`$f_{\mathrm F} = 0.0790\,\Rey^{-1/4}$ (9.59)/(9.71); smooth pipe, $\Rey \lesssim 10^5$; explicit. It gives $\Delta p \propto \overline{v}_{zm}^{1.75}$.`,
    src: wk('502', 'Eq. (9.71)'),
  },
  {
    id: 'fc-mn',
    front: md`How is the power-law profile exponent $m$ linked to the Blasius-type exponent $n$?`,
    back: md`$m = 1/(2n-1)$ (9.77), from equating the exponents of $\overline{v}_z^{*}a/\nu$ in (9.74) and (9.76). $n = 4 \Rightarrow m = 1/7$.`,
    src: wk('502', 'Eq. (9.77)'),
  },
  {
    id: 'fc-seventh',
    front: 'The one-seventh power law: wall form and centreline form',
    back: md`$\overline{v}_z/\overline{v}_z^{*} = 8.74\,(y\overline{v}_z^{*}/\nu)^{1/7}$ (9.78); $\overline{v}_z/\overline{v}_{zc} = (y/a)^{1/7}$ (9.61, Fig. 9.11). Averaging with (9.48) gives $\overline{v}_{zm} = \tfrac{49}{60}\overline{v}_{zc} \approx 0.817\,\overline{v}_{zc}$.`,
    src: [wk('502', 'Eq. (9.78)'), wk('500', 'Eq. (9.61)')],
  },
  {
    id: 'fc-tau80',
    front: 'Wall shear stress from one velocity reading (9.80)',
    back: md`$\tau_w = 0.0225\,\rho\overline{v}_z^2\,(\nu/(\overline{v}_z y))^{1/4}$, from $\overline{v}_z^{*} = 0.150\,\overline{v}_z^{7/8}(\nu/y)^{1/8}$ (9.79). The point must lie in the turbulent core — a "local Blasius law".`,
    src: wk('503'),
  },
]

export const takeaways: string[] = [
  md`**Fanning friction factor** $f_{\mathrm F} = \tau_w/(\tfrac12\rho\overline{v}_{zm}^2)$ (9.51); Moody/Darcy charts plot $f_{\mathrm D} = 4f_{\mathrm F}$. With $\tau_w = \rho(\overline{v}_z^{*})^2$ (9.73), $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$.`,
  md`Averaging the log law over the cross-section (Example 9.3) gives $\overline{v}_{zm}/\overline{v}_z^{*} = B\ln a^+ + A - \tfrac32B = 2.5\ln a^+ + 1.75$ (9.49)–(9.50); the sublayer is ignored for the flow rate because it carries almost no flow.`,
  md`Smooth pipes: theory $\sqrt{1/f_{\mathrm F}} = 1.77\ln(\Rey\sqrt{f_{\mathrm F}}) - 0.601$ (9.52); experiment $1.74\ln(\Rey\sqrt{f_{\mathrm F}}) - 0.391$ (9.53), valid from $5\times10^3$ to at least $3.4\times10^6$. Both are implicit — iterate on $x = 1/\sqrt{f_{\mathrm F}}$.`,
  md`Roughness regime from $\varepsilon^+ = \varepsilon\overline{v}_z^{*}/\nu = (\varepsilon/D)\Rey\sqrt{f_{\mathrm F}/2}$: below 5 hydraulically smooth, $f_{\mathrm F}(\Rey)$; 5–70 transition, $f_{\mathrm F}(\Rey, \varepsilon/a)$; above 70 completely rough, $f_{\mathrm F}(\varepsilon/a)$ (9.64)–(9.66).`,
  md`Rough-wall log law $\overline{v}_z/\overline{v}_z^{*} = 2.5\ln(y/\varepsilon) + B$ (9.67): $B = 5.5 + 2.5\ln\varepsilon^+$ for a hydraulically smooth wall (the universal profile again) and $B = 8.5$ for a completely rough wall — no viscosity, no pipe radius.`,
  md`Colebrook–White $1/\sqrt{f_{\mathrm F}} = -1.737\ln(0.269\,\varepsilon/D + 1.257/(\Rey\sqrt{f_{\mathrm F}}))$ (9.70) spans all turbulent regimes; its limits are the smooth law and the completely rough value $-1.737\ln(0.269\,\varepsilon/D)$.`,
  md`Blasius $f_{\mathrm F} = 0.0790\,\Rey^{-1/4}$ (9.59)/(9.71) is explicit but limited to smooth pipes with $\Rey \lesssim 10^5$; it implies $\Delta p \propto \overline{v}_{zm}^{1.75}$, against $\overline{v}_{zm}^{2}$ in a completely rough pipe.`,
  md`A friction law $f_{\mathrm F} \propto \Rey^{-1/n}$ goes with a power-law profile $\propto y^m$, $m = 1/(2n-1)$ (9.77): $n = 4$ gives the one-seventh law $\overline{v}_z/\overline{v}_z^{*} = 8.74\,(y^+)^{1/7}$ (9.78), with $\overline{v}_{zm} = \tfrac{49}{60}\overline{v}_{zc}$.`,
  md`The 1/7 law has infinite slope at the wall, so $\tau_w$ comes from one core velocity: $\tau_w = 0.0225\,\rho\overline{v}_z^2(\nu/\overline{v}_z y)^{1/4}$ (9.80) — check that $y^+ > 30$.`,
  md`**Exam traps:** Fanning vs Darcy (factor 4); $\Rey$ based on $a$ in (9.72) but on $D$ in (9.71); the $A$ of (9.72) is not the log-law $A = 5.5$; $\varepsilon/a$ in (9.65)–(9.66) but $\varepsilon/D$ in (9.70); Colebrook–White is for turbulent flow only.`,
]

/* ------------------------------------------------------------------------------------------------ */
/* content                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

export default function Content() {
  return (
    <>
      {/* =========================================================================================== */}
      <Concept id="smooth-pipe-friction">
        <Step kind="intro" src={wk('497–498', '§9.7')}>
          <Md>{md`
            How much pressure does it take to push a given flow through a pipe? For fully developed flow the answer is
            packed into one dimensionless number, the **friction factor**. Wilkes uses the **Fanning friction factor**,
            the wall shear stress divided by the dynamic pressure of the mean flow:

            $$
            f_{\mathrm F} = \frac{\tau_w}{\tfrac12\rho\overline{v}_{zm}^2} \tag{9.51}
            $$

            Section 9.7 obtains $f_{\mathrm F}$ for **smooth pipes** directly from the universal velocity profile of §9.6.
            Because the laminar sublayer is so thin that it contributes virtually nothing to the flow, the logarithmic
            profile $v_z^+ = A + B\ln y^+$ may be assumed over the **whole** cross-section. Averaging it over the pipe area
            (9.48) gives the mean velocity (9.49)–(9.50) — the integration is Example 9.3 — and combining that with the
            definition of $f_{\mathrm F}$ gives a friction law, (9.52). Experiment gives an almost identical law, (9.53),
            for smooth pipes from $\Rey = 5\times10^3$ up to at least $3.4\times10^6$.
          `}</Md>
          <Supplement title="Fanning or Darcy? Check before you calculate">
            <Md>{md`
              Moody charts and many textbooks use the **Darcy** friction factor $f_{\mathrm D} = 8\tau_w/(\rho\overline{v}_{zm}^2) = 4f_{\mathrm F}$,
              with $\Delta p = f_{\mathrm D}(L/D)\,\tfrac12\rho\overline{v}_{zm}^2$. Every equation in this topic uses Wilkes's
              Fanning factor. A friction factor near 0.02 is almost certainly Darcy; near 0.005, Fanning.
            `}</Md>
          </Supplement>
          <Callout kind="note" title="Where this sits">
            <Md>{md`
              Unit D builds the turbulent velocity profile step by step (time averaging → Reynolds stresses → mixing length →
              universal profile). This topic cashes it in: the friction factor is what you actually use to size pipes,
              pumps and heat exchangers, and it feeds the heat-transfer analogies later in the unit.
            `}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            Think of $f_{\mathrm F}$ as the "toll" the wall charges the flow, measured in units of the kinetic energy per
            unit volume of the mean motion.

            - **Why turbulent friction is large.** Eddies keep throwing fast core fluid towards the wall, so the velocity
              climbs to a large fraction of its centreline value inside a very thin sublayer. The wall gradient — and
              therefore $\tau_w$ — is far steeper than in laminar flow at the same $\Rey$: at $\Rey = 10^4$ the turbulent
              $f_{\mathrm F}$ is about five times the laminar formula's value.
            - **Why $f_{\mathrm F}$ still falls, slowly, with $\Rey$.** Measured in friction velocities the mean velocity is
              $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}} = 2.5\ln a^+ + 1.75$. A faster flow makes the pipe
              "bigger" in wall units ($a^+$ grows), but the mean velocity gains only $2.5\,\overline{v}_z^{*}$ for every
              factor $e$ in $a^+$, so $f_{\mathrm F} = 2/(2.5\ln a^+ + 1.75)^2$ falls only like $1/(\ln\Rey)^2$.
            - **Why the sublayer can be ignored for the flow rate — but not for the stress.** It is a fraction of a millimetre
              thick and slow, so it carries about 0.05 % of the flow at $\Rey = 10^5$ (see the visual below). Yet almost the
              whole velocity *gradient* sits inside it, which is where $\tau_w$ comes from.
          `}</Md>
          <Compare
            items={[
              {
                title: 'Laminar pipe flow',
                md: md`Parabolic profile, $\overline{v}_{zc} = 2\overline{v}_{zm}$. $f_{\mathrm F} = 16/\Rey$: halves when $\Rey$ doubles. Roughness irrelevant.`,
                tone: 'violet',
              },
              {
                title: 'Turbulent, smooth pipe',
                md: md`Blunt log-law profile, $\overline{v}_{zc} \approx 1.2\overline{v}_{zm}$. $f_{\mathrm F}$ falls only logarithmically, (9.52)–(9.53). Roughness buried in the sublayer.`,
                tone: 'indigo',
              },
            ]}
          />
          <Callout kind="tip">
            <Md>{md`Read $\sqrt{2/f_{\mathrm F}}$ as "the mean velocity in friction velocities": $f_{\mathrm F} = 0.0045$ means $\overline{v}_{zm} \approx 21\,\overline{v}_z^{*}$.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual">
          <Figure caption="Eq. (9.48) adds up thin annuli 2πr dr. Shading = local mean velocity (three-region universal profile); the flow-rate integrand 2(r/a)·v̄z/v̄zm has unit area. The laminar sublayer (amber, true scale) is a sliver at r/a ≈ 1 that carries almost none of the flow.">
            <AnnulusIntegration />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'Universal profile', md: md`$v_z^+ = 5.5 + 2.5\ln y^+$ (9.46), assumed over the whole pipe.` },
              { title: 'Area average (9.48)', md: md`$\overline{v}_{zm} = \dfrac{2}{a^2}\displaystyle\int_0^a \overline{v}_z\,(a-y)\,\dd y$ with $y = a - r$.` },
              { title: 'Integrate — Example 9.3 → (9.49)', md: md`$\overline{v}_{zm}/\overline{v}_z^{*} = B\ln a^+ + A - \tfrac32 B$.` },
              { title: 'Insert A = 5.5, B = 2.5 → (9.50)', md: md`$\overline{v}_{zm}/\overline{v}_z^{*} = 2.5\ln a^+ + 1.75$.` },
              { title: 'Use the definition (9.51) → (9.52)', md: md`$\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$ and $a^+ = \Rey\sqrt{f_{\mathrm F}}/(2\sqrt2)$ give $\sqrt{1/f_{\mathrm F}} = 1.77\ln(\Rey\sqrt{f_{\mathrm F}}) - 0.601$.`, tone: 'emerald' },
              { title: 'Experiment → (9.53)', md: md`$\sqrt{1/f_{\mathrm F}} = 1.74\ln(\Rey\sqrt{f_{\mathrm F}}) - 0.391$, valid $5\times10^3$ – $3.4\times10^6$.`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="equations" src={wk('497–498')}>
          <FormulaCard id="wall-variables" />
          <FormulaCard id="vzm-integral" />
          <FormulaCard id="vzm-log" />
          <FormulaCard id="vzm-log-num" />
          <FormulaCard id="fanning" />
          <FormulaCard id="smooth-theory" />
          <Supplement title="Filling in the algebra: (9.50) + (9.51) → (9.52)">
            <Derivation
              steps={[
                { md: md`$\dfrac{\overline{v}_{zm}}{\overline{v}_z^{*}} = \sqrt{\dfrac{\rho\overline{v}_{zm}^2}{\tau_w}} = \sqrt{\dfrac{2}{f_{\mathrm F}}}$`, why: 'definition (9.51)' },
                {
                  md: md`$a^+ = \dfrac{a\overline{v}_z^{*}}{\nu} = \dfrac{D\overline{v}_{zm}}{2\nu}\cdot\dfrac{\overline{v}_z^{*}}{\overline{v}_{zm}} = \dfrac{\Rey}{2}\sqrt{\dfrac{f_{\mathrm F}}{2}} = \dfrac{\Rey\sqrt{f_{\mathrm F}}}{2\sqrt2}$`,
                  why: md`$a = D/2$ and $\Rey = D\overline{v}_{zm}/\nu$`,
                },
                { md: md`$\sqrt{2/f_{\mathrm F}} = 2.5\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 2.5\ln\left(2\sqrt2\right) + 1.75$`, why: 'substitute both into (9.50)' },
                {
                  md: md`$\dfrac{1}{\sqrt{f_{\mathrm F}}} = \dfrac{2.5}{\sqrt2}\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) + \dfrac{1.75 - 2.5\ln(2\sqrt2)}{\sqrt2} = 1.768\ln\left(\Rey\sqrt{f_{\mathrm F}}\right) - 0.6005$`,
                  why: md`divide by $\sqrt2$: this is (9.52)`,
                },
              ]}
            />
            <Md className="mt-3 text-sm text-ink-2">{md`
              The experimental constants (9.53) differ slightly (1.74 and −0.391): the universal profile is only an
              approximation — it ignores the sublayer and buffer region and the small departures near the centreline — and
              the log-law constants themselves carry experimental scatter.
            `}</Md>
          </Supplement>
          <FormulaCard id="smooth-exp" />
          <FormulaCard id="fanning-dp" />
          <FormulaCard id="laminar-ff" />
          <Callout kind="exam" title="Implicit equations">
            <Md>{md`
              (9.52), (9.53) and Colebrook–White all have $f_{\mathrm F}$ on both sides. Iterate on $x = 1/\sqrt{f_{\mathrm F}}$ —
              write down two or three iterates in an exam to show the method. But if $\tau_w$ (i.e. the pressure gradient) is
              **given** and the flow rate is wanted, use (9.49)/(9.50): it is explicit.
            `}</Md>
          </Callout>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's §8.5 (secondary source)">
            <Md>{md`
              Fox writes the same log law as $\bar u/u_* = 2.5\ln(yu_*/\nu) + 5.0$ for $yu_*/\nu > 30$ (Eq. 8.20) — note the
              intercept **5.0** instead of Wilkes's 5.5. Fox stresses that there is considerable scatter in these constants
              (they are averages over many experiments). Never mix constants from the two books in one calculation.
            `}</Md>
            <div className="mt-2">
              <SourceChips src={fox('295', 'Eq. 8.20')} size="xs" />
            </div>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-mean-velocity" />
          <ExampleCard id="ex-smooth-water" />
        </Step>

        <Step kind="interactive">
          <SmoothFrictionLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="smooth-pipe-friction" />
          <QuickCheck ids={['q-fanning-darcy', 'q-sublayer-negligible']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$f_{\mathrm F} = \tau_w/(\tfrac12\rho\overline{v}_{zm}^2)$ (9.51); the Darcy factor is $4f_{\mathrm F}$ — mixing them up is a factor-4 error in $\Delta p$.`,
              md`Example 9.3: averaging $A + B\ln y^+$ over the area gives $\overline{v}_{zm}/\overline{v}_z^{*} = B\ln a^+ + A - \tfrac32 B$; with $\overline{v}_{zm}/\overline{v}_z^{*} = \sqrt{2/f_{\mathrm F}}$ this becomes the friction law (9.52).`,
              md`Use (9.53) for smooth pipes from $\Rey = 5\times10^3$ to at least $3.4\times10^6$; it is implicit — iterate, 3–4 steps suffice.`,
              md`Pressure gradient known → (9.50) gives $\overline{v}_{zm}$ directly; mean velocity known → iterate (9.53) for $f_{\mathrm F}$.`,
              md`**Trap:** the sublayer carries almost no *flow* but nearly all the velocity *gradient* — neglect it for $Q$, never for $\tau_w$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* =========================================================================================== */}
      <Concept id="rough-pipe">
        <Step kind="intro" src={wk('501', '§9.9')}>
          <Md>{md`
            In turbulent flow the wall irregularities may or may not **project through the laminar sublayer**. Wilkes
            measures this with the roughness height $\varepsilon$ expressed in wall units, $\varepsilon\overline{v}_z^{*}/\nu$,
            and distinguishes three regimes, each supported by experiment, with different dependencies of the friction factor
            (9.64)–(9.66): **hydraulically smooth** (below 5, $f_{\mathrm F}$ depends on $\Rey$ only), **transition**
            (5 to 70, on $\Rey$ and $\varepsilon/a$) and **completely rough** (above 70, on $\varepsilon/a$ only).

            The turbulent velocity profiles in all three regimes can be written as a log law measured from the roughness,
            $\overline{v}_z/\overline{v}_z^{*} = 2.5\ln(y/\varepsilon) + B$ (9.67). For a hydraulically smooth pipe
            $B = 5.5 + 2.5\ln(\varepsilon\overline{v}_z^{*}/\nu)$, which is just the universal velocity profile again (9.68);
            for a completely rough pipe $B = 8.5$ (9.69), a profile that is independent of the pipe radius and confirmed by
            experiments over a very wide range of $\varepsilon/D$. Wilkes gives no $B$ for the transition region. The
            **Colebrook and White** equation (9.70) is consistent with all of this and represents $f_{\mathrm F}$ against
            relative roughness and Reynolds number over a very wide range of roughnesses and turbulent $\Rey$.
          `}</Md>
          <Callout kind="def" title="How thick is the sublayer? (recall §9.8)">
            <Md>{md`
              In the two-region model the sublayer ends at $y^+ = 11.6$, i.e. $\delta = 11.6\,\nu/\sqrt{\tau_w/\rho}$ (9.57);
              in the three-region model of Fig. 9.9 its outer edge is at $y^+ = 5$ (p. 500, before Eq. 9.63). So
              "$\varepsilon\overline{v}_z^{*}/\nu < 5$" literally means the roughness elements fit inside the (three-region)
              sublayer.
            `}</Md>
            <div className="mt-2">
              <SourceChips src={wk('499–500', 'Eqs. (9.57), (9.63)')} size="xs" />
            </div>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`
            Picture sand grains glued to the inside of the pipe.

            - **Buried grains ($\varepsilon^+ < 5$).** The grains sit inside the slow, viscous sublayer. Fluid creeps over
              them as over a smooth floor; nothing separates, so the wall "looks" smooth and $f_{\mathrm F}$ follows the
              smooth-pipe law.
            - **Protruding grains ($\varepsilon^+ > 70$).** The grains stand far out into the turbulent region. Each one
              sheds a small wake, and the drag on it is mostly **pressure (form) drag**, proportional to $\rho\overline{v}^2$
              and independent of viscosity. Viscosity drops out, so $f_{\mathrm F}$ no longer depends on $\Rey$ — only on how
              big the grains are compared with the pipe, $\varepsilon/a$.
            - **In between.** Some viscous friction, some form drag: both $\Rey$ and $\varepsilon/a$ matter.

            "Smooth" is therefore **relative to the flow**, not a property of the pipe alone: raising the velocity raises
            $\overline{v}_z^{*}$, thins the sublayer ($\propto \nu/\overline{v}_z^{*}$), and the same pipe can move from
            hydraulically smooth to completely rough.
          `}</Md>
          <Compare
            items={[
              { title: 'Hydraulically smooth', md: md`$\varepsilon^+ < 5$: bumps inside the sublayer. $f_{\mathrm F}(\Rey)$, profile = universal log law.`, tone: 'emerald' },
              { title: 'Transition', md: md`$5 < \varepsilon^+ < 70$: bumps reach the buffer layer. $f_{\mathrm F}(\Rey, \varepsilon/a)$.`, tone: 'amber' },
              { title: 'Completely rough', md: md`$\varepsilon^+ > 70$: bumps shed wakes. $f_{\mathrm F}(\varepsilon/a)$, $B = 8.5$, no $\nu$.`, tone: 'rose' },
            ]}
          />
        </Step>

        <Step kind="visual">
          <Figure caption="Schematic close-up of the wall in wall units (y⁺ = y v*/ν). Drag the roughness height ε⁺: below 5 the bumps hide in the viscous sublayer; above 70 they tower over the buffer layer and shed wakes (curled arrows). Tracer dots move with the local mean velocity.">
            <RoughnessSublayerDemo />
          </Figure>
        </Step>

        <Step kind="equations" src={wk('501')}>
          <FormulaCard id="rough-regimes" />
          <FormulaCard id="eps-plus" />
          <FormulaCard id="rough-profile" />
          <FormulaCard id="rough-B-smooth" />
          <FormulaCard id="rough-B-rough" />
          <Figure caption="Eqs. (9.67)–(9.69): roughness only shifts the intercept B. Against y⁺ a completely rough profile lies ΔB = 2.5 ln ε⁺ − 3 below the smooth one; against y/ε all completely rough profiles collapse onto one line with intercept 8.5. The law that applies to the chosen ε⁺ is drawn thick.">
            <RoughProfilesPlot />
          </Figure>
          <FormulaCard id="colebrook" />
          <FormulaCard id="colebrook-limits" />
          <Supplement title="Integrating the completely rough profile">
            <Md>{md`
              Treat (9.69) exactly like Example 9.3 — it is "constant $+\;2.5\ln y$" — and the area average is the
              centreline value minus $\tfrac32(2.5)$. The result depends on $\varepsilon/a$ only, which is precisely the
              completely rough statement (9.66); the worked example below puts in numbers.
            `}</Md>
            <FormulaCard id="fully-rough-integrated" />
          </Supplement>
          <Callout kind="warning" title="ε/a or ε/D?">
            <Md>{md`
              Wilkes writes the regime laws with $\varepsilon/a$ (9.65)–(9.66) but Colebrook–White with $\varepsilon/D$ (9.70).
              Since $\varepsilon/D = \tfrac12\,\varepsilon/a$, plugging the wrong one into (9.70) doubles or halves the
              roughness term.
            `}</Md>
          </Callout>
          <Supplement title="The Darcy / log₁₀ form you will meet elsewhere">
            <Md>{md`
              Many textbooks and Moody charts write Colebrook–White for the Darcy factor with base-10 logarithms:

              $$
              \frac{1}{\sqrt{f_{\mathrm D}}} = -2.0\log_{10}\left(\frac{\varepsilon/D}{3.7} + \frac{2.51}{\Rey\sqrt{f_{\mathrm D}}}\right)
              $$

              With $f_{\mathrm D} = 4f_{\mathrm F}$ and $\log_{10}x = \ln x/2.3026$ this becomes
              $1/\sqrt{f_{\mathrm F}} = -1.737\ln(0.270\,\varepsilon/D + 1.255/(\Rey\sqrt{f_{\mathrm F}}))$ — Wilkes's (9.70)
              with 0.269 and 1.257 is the same equation to well under 1 % in $f_{\mathrm F}$.

              Colebrook–White blends the smooth and completely rough limits gradually, so near $\varepsilon^+ \approx 5$ it
              already sits noticeably above the smooth curve; treat 5 and 70 as approximate markers rather than sharp switches.
            `}</Md>
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-rough-regime" />
          <ExampleCard id="ex-fully-rough" />
        </Step>

        <Step kind="interactive">
          <MoodyChart />
          <PipeCalculator />
        </Step>

        <Step kind="practice">
          <PracticeList concept="rough-pipe" />
          <QuickCheck ids={['q-regime-40', 'q-fully-rough-velocity']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Regime from $\varepsilon\overline{v}_z^{*}/\nu$: below 5 hydraulically smooth ($f_{\mathrm F}(\Rey)$), 5–70 transition ($f_{\mathrm F}(\Rey, \varepsilon/a)$), above 70 completely rough ($f_{\mathrm F}(\varepsilon/a)$).`,
              md`Compute $\varepsilon^+ = (\varepsilon/D)\,\Rey\sqrt{f_{\mathrm F}/2}$ — it grows with the flow, so "smooth" is a property of pipe **and** flow.`,
              md`Rough-wall log law $2.5\ln(y/\varepsilon) + B$: same slope, different intercept; $B = 8.5$ when completely rough (no viscosity, no pipe radius).`,
              md`Colebrook–White (9.70) is implicit and turbulent-only; start the iteration from the completely rough limit $-1.737\ln(0.269\,\varepsilon/D)$.`,
              md`**Trap:** completely rough means $f_{\mathrm F}$ is constant, so $\Delta p \propto \overline{v}_{zm}^2$ — doubling the flow quadruples the pressure drop.`,
            ]}
          />
        </Step>
      </Concept>

      {/* =========================================================================================== */}
      <Concept id="blasius-power-law">
        <Step kind="intro" src={[wk('502–503', '§9.10'), wk('500', 'Eq. (9.59)')]}>
          <Md>{md`
            For **smooth pipe** with $\Rey$ no larger than $10^5$, experiments are fitted by the simple, explicit
            **Blasius law** $f_{\mathrm F} = 0.0790\,(2a\overline{v}_{zm}/\nu)^{-1/4}$ (9.71) — Wilkes already quoted it
            on p. 500 as $f_{\mathrm F} = 0.0790\,\Rey^{-1/4}$ (9.59), "somewhat simpler" than (9.53) but of more limited range.

            Section 9.10 asks which velocity profile is consistent with a friction law of this power-law type. Write it
            generally as $f_{\mathrm F} = A(a\overline{v}_{zm}/\nu)^{-1/n}$ (9.72) and use $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 = \rho(\overline{v}_z^{*})^2$
            (9.73): eliminating $f_{\mathrm F}$ shows that $\overline{v}_{zm}/\overline{v}_z^{*}$ must grow as
            $(\overline{v}_z^{*}a/\nu)^{1/(2n-1)}$ (9.74). A power-law profile $\overline{v}_z/\overline{v}_z^{*} = c(y/y^{*})^m$
            (9.75), integrated over the pipe, gives $\overline{v}_{zm}/\overline{v}_z^{*} \propto (\overline{v}_z^{*}a/\nu)^m$
            (9.76). Equating the exponents, $m = 1/(2n-1)$ (9.77): the Blasius exponent $n = 4$ gives the familiar
            **one-seventh power law** (Fig. 9.11), and experiment gives $c = 8.74$ (9.78). Solving (9.78) for
            $\overline{v}_z^{*}$ (9.79) yields the wall stress from **one velocity reading**,
            $\tau_w = 0.0225\,\rho\overline{v}_z^2(\nu/\overline{v}_z y)^{1/4}$ (9.80) — analogous to the Blasius law, and used
            in Wilkes §8.5 for the thickness of the turbulent boundary layer.
          `}</Md>
          <FlowRow
            nodes={[
              { title: 'Friction law (9.72)', md: md`$f_{\mathrm F} \propto (a\overline{v}_{zm}/\nu)^{-1/n}$`, tone: 'amber' },
              { title: '+ (9.73) → (9.74)', md: md`$\overline{v}_{zm}/\overline{v}_z^{*} \propto (a^+)^{1/(2n-1)}$`, tone: 'amber' },
              { title: 'Profile (9.75) → (9.76)', md: md`$\overline{v}_{zm}/\overline{v}_z^{*} \propto (a^+)^{m}$`, tone: 'indigo' },
              { title: 'Match (9.77)', md: md`$m = 1/(2n-1)$; $n = 4 \Rightarrow m = 1/7$`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="intuition">
          <Md>{md`
            - **A power law is a ruler held against a logarithm.** Over one or two decades of $y^+$ the curve
              $5.5 + 2.5\ln y^+$ is well approximated by $8.74\,(y^+)^{1/7}$ — within 3 % for roughly $20 < y^+ < 1000$.
              Further out the power law keeps climbing faster than the logarithm. That is the profile-side view of why the
              Blasius law, which goes hand in hand with the 1/7 profile, fails above $\Rey \approx 10^5$, where the
              centreline already sits beyond $y^+ \approx 2000$.
            - **Why the exponents are locked together.** $f_{\mathrm F} = 2(\overline{v}_z^{*}/\overline{v}_{zm})^2$. If
              $\overline{v}_{zm}/\overline{v}_z^{*} \propto (a^+)^m$ and $\Rey = 2a^+(\overline{v}_{zm}/\overline{v}_z^{*}) \propto (a^+)^{1+m}$,
              then $f_{\mathrm F} \propto \Rey^{-2m/(1+m)}$; with $m = 1/7$ that is $\Rey^{-1/4}$. A **blunter** profile
              (smaller $m$) means a friction factor that falls **more slowly** with $\Rey$.
            - **No wall slope.** $\dd(y^{1/7})/\dd y \to \infty$ at $y = 0$, so the power law cannot give $\tau_w$ from
              $\mu\,\dd\overline{v}_z/\dd y$. It gives $\tau_w$ indirectly, through the velocity at some point in the core — that
              is (9.80).
          `}</Md>
          <Callout kind="tip">
            <Md>{md`Exponent bookkeeping: Wilkes's $n$ (friction law) $= 4$ ↔ profile exponent $m = 1/7$ ↔ Fox's exponent $n_{\text{Fox}} = 1/m = 7$. In general $n_{\text{Fox}} = 2n - 1$.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={wk('503', 'Fig. 9.11')}>
          <Figure caption="Fig. 9.11 rebuilt: the one-seventh power-law profile (9.61) on linear axes. It rises almost vertically at the wall; the local velocity equals the mean (49/60 of the centreline value) at y/a ≈ 0.24." src={wk('503', 'Fig. 9.11')}>
            <SeventhLawFigure />
          </Figure>
          <Supplement title="Same flow rate, two very different profiles">
            <PipeProfiles />
          </Supplement>
        </Step>

        <Step kind="equations" src={[wk('502–503'), wk('500', 'Eqs. (9.59), (9.61)')]}>
          <FormulaCard id="blasius" />
          <FormulaCard id="blasius-general" />
          <FormulaCard id="tauw-vstar" />
          <FormulaCard id="vzm-vstar-power" />
          <Supplement title="Filling in the algebra: (9.72) + (9.73) → (9.74)">
            <Derivation
              steps={[
                { md: md`$\rho(\overline{v}_z^{*})^2 = \tfrac12 A\left(\dfrac{a\overline{v}_{zm}}{\nu}\right)^{-1/n}\rho\overline{v}_{zm}^2$`, why: 'insert (9.72) into (9.73)' },
                {
                  md: md`With $X = \overline{v}_{zm}/\overline{v}_z^{*}$ and $a\overline{v}_{zm}/\nu = X\,a\overline{v}_z^{*}/\nu$: $\;1 = \tfrac12 A\,X^{2-1/n}\left(\dfrac{a\overline{v}_z^{*}}{\nu}\right)^{-1/n}$`,
                  why: md`divide by $\rho(\overline{v}_z^{*})^2$`,
                },
                { md: md`$X^{(2n-1)/n} = \dfrac{2}{A}\left(\dfrac{a\overline{v}_z^{*}}{\nu}\right)^{1/n}$`, why: 'rearrange' },
                { md: md`$X = \left(\dfrac{2}{A}\right)^{n/(2n-1)}\left(\dfrac{\overline{v}_z^{*}a}{\nu}\right)^{1/(2n-1)}$ — Eq. (9.74)`, why: md`raise to the power $n/(2n-1)$` },
              ]}
            />
            <Md className="mt-2 text-sm text-ink-2">{md`(Wilkes introduces (9.74) as following "from Eqns. (9.71) and (9.72)"; the elimination also uses the definition (9.73).)`}</Md>
          </Supplement>
          <FormulaCard id="power-profile" />
          <FormulaCard id="power-mean" />
          <FormulaCard id="m-n" />
          <Supplement title="Filling in the algebra: (9.75) → (9.76) → (9.77)">
            <Derivation
              steps={[
                { md: md`With $y^{*} = \nu/\overline{v}_z^{*}$: $\;\overline{v}_z = c\,\overline{v}_z^{*}\left(\dfrac{\overline{v}_z^{*}}{\nu}\right)^{m} y^{m}$`, why: 'profile (9.75)' },
                {
                  md: md`$\overline{v}_{zm} = \dfrac{2}{a^2}\displaystyle\int_0^a \overline{v}_z\,(a-y)\,\dd y$, and $\displaystyle\int_0^a (a-y)\,y^m\,\dd y = \frac{a^{m+2}}{m+1} - \frac{a^{m+2}}{m+2} = \frac{a^{m+2}}{(m+1)(m+2)}$`,
                  why: md`(9.48) with $r = a - y$`,
                },
                { md: md`$\dfrac{\overline{v}_{zm}}{\overline{v}_z^{*}} = \left(\dfrac{\overline{v}_z^{*}a}{\nu}\right)^{m}\dfrac{2c}{(m+1)(m+2)}$ — Eq. (9.76)`, why: md`collect the powers of $a$` },
                { md: md`(9.74) says the same ratio varies as $(\overline{v}_z^{*}a/\nu)^{1/(2n-1)}$, so $m = \dfrac{1}{2n-1}$ — Eq. (9.77)`, why: 'equate exponents' },
                {
                  md: md`Equating the coefficients too: $(2/A)^{n/(2n-1)} = 2c/[(m+1)(m+2)]$. With $n = 4$ and the Blasius value $A = 0.0664$ this predicts $c = 8.57$, close to the measured $c = 8.74$ of (9.78).`,
                  why: md`the "other relation" between $c$ and $A$`,
                },
              ]}
            />
          </Supplement>
          <FormulaCard id="seventh-wall" />
          <FormulaCard id="seventh-centre" />
          <FormulaCard id="mean-centre-ratio" />
          <FormulaCard id="vstar-seventh" />
          <FormulaCard id="tauw-seventh" />
          <Supplement title="Filling in the algebra: (9.78) → (9.79) → (9.80)">
            <Derivation
              steps={[
                { md: md`$\overline{v}_z = 8.74\,(\overline{v}_z^{*})^{8/7}\left(\dfrac{y}{\nu}\right)^{1/7}$`, why: md`multiply (9.78) by $\overline{v}_z^{*}$` },
                {
                  md: md`$\overline{v}_z^{*} = \left(\dfrac{1}{8.74}\right)^{7/8}\overline{v}_z^{7/8}\left(\dfrac{\nu}{y}\right)^{1/8} = 0.150\,\overline{v}_z^{7/8}\left(\dfrac{\nu}{y}\right)^{1/8}$ — (9.79)`,
                  why: md`raise to the power $7/8$`,
                },
                {
                  md: md`$\tau_w = \rho(\overline{v}_z^{*})^2 = 0.0225\,\rho\,\overline{v}_z^{7/4}\left(\dfrac{\nu}{y}\right)^{1/4} = 0.0225\,\rho\overline{v}_z^{2}\left(\dfrac{\nu}{\overline{v}_z y}\right)^{1/4}$ — (9.80)`,
                  why: 'square and use (9.73)',
                },
              ]}
            />
          </Supplement>
          <Callout kind="warning" title="Two different A's and two different Reynolds numbers">
            <Md>{md`
              The coefficient $A$ in (9.72) has nothing to do with the log-law constant $A = 5.5$ of (9.41)/(9.49). And (9.72)
              uses the **radius-based** $a\overline{v}_{zm}/\nu = \Rey/2$, while (9.71) uses the diameter: that is why the
              Blasius coefficient changes from 0.0790 to $0.0790\times2^{-1/4} = 0.0664$.
            `}</Md>
          </Callout>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's §8.5 (secondary source)">
            <Md>{md`
              Fox writes the power law as $\bar u/U = (y/R)^{1/n} = (1 - r/R)^{1/n}$ (Eq. 8.22), where **Fox's $n$ equals $1/m$
              here** — Wilkes's Blasius exponent 4 corresponds to Fox's $n = 7$. Fox lets the exponent grow with the
              centreline-velocity Reynolds number, $n = -1.7 + 1.8\log Re_U$ for $Re_U > 2\times10^4$ (Eq. 8.23), and gives
              $\bar V/U = 2n^2/[(n+1)(2n+1)]$ (Eq. 8.24), i.e. 49/60 for $n = 7$ (0.79 for $n = 6$, 0.87 for $n = 10$:
              the profile gets fuller as $\Rey$ rises; Fig. 8.11 compares $n = 6$ and 10 with the laminar parabola). Fox also
              lists the limitations: not applicable very close to the wall ($y/R < 0.04$), an infinite velocity gradient at the
              wall (so it cannot be used to calculate the wall shear stress), and a non-zero slope at the centreline — yet
              adequate for integral quantities.
            `}</Md>
            <div className="mt-2">
              <SourceChips src={fox('295–296', 'Eqs. 8.22–8.24, Figs. 8.10–8.11')} size="xs" />
            </div>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-blasius-seventh" />
          <ExampleCard id="ex-tau-from-point" />
        </Step>

        <Step kind="interactive">
          <PowerLawExplorer />
          <PitotWallStress />
        </Step>

        <Step kind="practice">
          <PracticeList concept="blasius-power-law" />
          <QuickCheck ids={['q-m-from-n', 'q-blasius-range']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Blasius: $f_{\mathrm F} = 0.0790\,\Rey^{-1/4}$ (9.59)/(9.71) — smooth pipe, $\Rey \lesssim 10^5$, explicit; $\Delta p \propto \overline{v}_{zm}^{1.75}$.`,
              md`$f_{\mathrm F} \propto (a\overline{v}_{zm}/\nu)^{-1/n}$ ⇔ profile $\propto y^{m}$ with $m = 1/(2n-1)$ (9.77); $n = 4 \Rightarrow m = 1/7$.`,
              md`One-seventh law: $\overline{v}_z/\overline{v}_z^{*} = 8.74(y^+)^{1/7}$ (9.78), or $(y/a)^{1/7}$ in centreline form (9.61); $\overline{v}_{zm} = \tfrac{49}{60}\overline{v}_{zc}$.`,
              md`$\tau_w$ from one core velocity: $\tau_w = 0.0225\,\rho\overline{v}_z^2(\nu/\overline{v}_z y)^{1/4}$ (9.80) — check $y^+ > 30$.`,
              md`**Traps:** Fox's $n$ is $1/m$; the $A$ of (9.72) is not 5.5; (9.72) uses the radius-based Reynolds number.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
