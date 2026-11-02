import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, TopicMeta } from '@/lib/types'
import {
  Callout,
  Compare,
  Concept,
  Derivation,
  ExampleCard,
  Figure,
  FlowChart,
  FlowRow,
  FormulaCard,
  Md,
  Plot,
  PracticeList,
  QuickCheck,
  Step,
  Supplement,
  Takeaways,
  md,
} from '@/kit'
import { EddyModelDiagram } from '../sims/mixing-length/EddyModelDiagram'
import { EddyJumpSim } from '../sims/mixing-length/EddyJumpSim'
import { MixingLengthCalculator } from '../sims/mixing-length/MixingLengthCalculator'
import { EddyCargoDiagram } from '../sims/mixing-length/EddyCargoDiagram'
import { TransportAnalogySim } from '../sims/mixing-length/TransportAnalogySim'
import { StressBalanceDiagram } from '../sims/mixing-length/StressBalanceDiagram'
import { NikuradseExplorer } from '../sims/mixing-length/NikuradseExplorer'
import { MeasurementLab } from '../sims/mixing-length/MeasurementLab'
import { ellOverA, nuT31 } from '../sims/mixing-length/correlations'

/* ------------------------------------------------------------------------------------------------ */
/*  Meta                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

export const meta: TopicMeta = {
  id: 'mixing-length',
  unit: 'D',
  title: 'Mixing-Length Theory & Eddy Viscosity',
  subtitle:
    "Prandtl's eddy model turns the unknown Reynolds stress into a gradient law, τᵗ = ρℓ²|dv̄/dy| dv̄/dy — and pressure-drop and velocity measurements in pipes tell us how large ℓ and the eddy viscosity really are.",
  minutes: 85,
  sources: [
    { doc: 'wilkes', pages: '488–493', note: '§9.3–9.4' },
    { doc: 'fox', pages: '293–294', note: 'cross-reference only' },
  ],
  concepts: [
    {
      id: 'eddy-viscosity',
      title: 'Eddy kinematic viscosity',
      src: { doc: 'wilkes', pages: '488–489' },
      summary:
        'Eddies that jump a distance λ across a plane carry x momentum down the mean gradient; time-averaging gives the flux −ν_T d(ρv̄x)/dy with the eddy kinematic viscosity ν_T = mean(v′y λ).',
    },
    {
      id: 'prandtl-mixing-length',
      title: "Prandtl's mixing-length model",
      src: { doc: 'wilkes', pages: '489–490' },
      summary:
        'Relating the fluctuations to the velocity deficiency (R, α, β) gives Prandtl’s 1925 result ν_T = ℓ²|dv̄x/dy| with mixing length ℓ = λ̃√(Rαβ).',
    },
    {
      id: 'transport-analogies',
      title: 'Eddy transport of heat & mass (Table 9.1)',
      src: { doc: 'wilkes', pages: '490' },
      summary:
        'The same eddies carry heat and species: q^t = −ρc_p ν_T ∂T̄/∂y and N^t = −ν_T ∂c̄/∂y, assuming α_T = D_T = ν_T (a first approximation).',
    },
    {
      id: 'determination',
      title: 'Determining eddy viscosity and mixing length in pipes (Nikuradse data)',
      src: { doc: 'wilkes', pages: '491–493' },
      summary:
        'A pressure drop gives the linear stress distribution, a velocity traverse gives the gradient; together they yield ν_T and ℓ. Nikuradse’s correlations (9.29)–(9.31) and Figs. 9.7–9.8.',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 488–493)** — §9.3 *Mixing-Length Theory* and §9.4 *Determination of Eddy Kinematic
  Viscosity and Mixing Length*; a few definitions are borrowed from Wilkes pp. 487, 495–498 and 504. **Fox & McDonald's is cited only as a
  secondary cross-reference.** There is no lecture deck on turbulence, so — as instructed for this unit — every explanation, equation and example
  here is built on Wilkes and uses Wilkes' notation ($\overline{v}_x$, $v_y'$, $\tau^t_{yx}$, $\tau_w$, friction velocity $\sqrt{\tau_w/\rho}$, Fanning
  $f_F$); Fox's $u$, $u'$, $u_*$ and the Darcy factor $f=4f_F$ appear only in clearly labelled side notes.`,
}

/* ------------------------------------------------------------------------------------------------ */
/*  Formulas                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

const W = (pages: string, note?: string) => ({ doc: 'wilkes' as const, pages, note })

export const formulas: FormulaDef[] = [
  // ---------- Concept 1: eddy viscosity ----------
  {
    id: 'reynolds-stress-recall',
    name: 'Turbulent (Reynolds) shear stress — recall',
    tex: md`\tau^{t}_{yx} = -\rho\,\overline{v_y' v_x'}`,
    tag: '9.16',
    vars: [
      { sym: md`\tau^{t}_{yx}`, desc: 'turbulent (Reynolds) shear stress: x-direction stress on a surface of constant $y$', units: md`\mathrm{Pa}` },
      { sym: md`\rho`, desc: 'density (constant)', units: md`\mathrm{kg/m^3}` },
      { sym: md`v_x',\ v_y'`, desc: 'velocity fluctuations about the time-averaged velocity', units: md`\mathrm{m/s}` },
      { sym: md`\overline{(\ )}`, desc: 'time average over a period long compared with the fluctuations' },
    ],
    conditions: ['time-averaged ("steady in the mean") turbulent flow, constant density', md`2-D picture of §9.2 with no mean motion in $y$ ($\overline{v}_y=0$)`],
    use: md`This is the unknown that mixing-length theory has to model. It is non-zero only when $v_x'$ and $v_y'$ are correlated (Example 9.1); the
    minus sign makes $\tau^t_{yx}>0$ when $v_x'v_y'$ is mostly negative.`,
    src: W('487', 'Eq. (9.16)'),
  },
  {
    id: 'm-inst',
    name: 'Instantaneous eddy transport of x momentum across X–X',
    tex: md`\dot{\mathcal{M}} = v_y'\left(\rho\overline{v}_x - \lambda\,\frac{d(\rho\overline{v}_x)}{dy}\right)\qquad\text{(upward)}`,
    tag: '9.17',
    vars: [
      { sym: md`\dot{\mathcal{M}}`, desc: 'rate of x-momentum transport across unit area of plane X–X, counted positive upward ($+y$)', units: md`\mathrm{N/m^2 = Pa}` },
      { sym: md`v_y'`, desc: 'velocity of the eddy normal to X–X (positive for an eddy from B–B below)', units: md`\mathrm{m/s}` },
      { sym: md`\rho\overline{v}_x`, desc: 'time-averaged x momentum per unit volume at X–X', units: md`\mathrm{kg/(m^2\,s)}` },
      { sym: md`\lambda`, desc: 'distance the eddy travels in $y$ before it mixes: positive from B–B, negative from A–A', units: md`\mathrm{m}` },
      { sym: md`d(\rho\overline{v}_x)/dy`, desc: md`gradient of the mean momentum (taken constant over $\lambda$)`, units: md`\mathrm{kg/(m^3\,s)}` },
    ],
    conditions: [
      md`each eddy moves a distance $\lambda$, then **loses its identity and mixes completely** with the surrounding fluid`,
      md`the gradient $d(\rho\overline{v}_x)/dy$ is approximately **constant** over the distance $\lambda$`,
      md`the time-averaged velocity profile is **fully established**, so a total derivative $d/dy$ is used`,
      md`valid for eddies in **either** direction, because $v_y'$ and $\lambda$ always have the same sign`,
    ],
    use: md`The bracket is the momentum per unit volume the eddy brings from its plane of origin — less than at X–X by the deficiency
    $\lambda\,d(\rho\overline{v}_x)/dy$ for an eddy from below. Multiplying by the volume flux $v_y'$ gives the momentum flux.`,
    src: W('488', 'Eq. (9.17)'),
  },
  {
    id: 'm-avg',
    name: 'Time-averaged net upward momentum transport',
    tex: md`\overline{\dot{\mathcal{M}}} = \overline{v_y'\left(\rho\overline{v}_x - \lambda\frac{d(\rho\overline{v}_x)}{dy}\right)} = \overline{v_y'}\,\rho\overline{v}_x - \overline{v_y'\lambda\,\frac{d(\rho\overline{v}_x)}{dy}}`,
    tag: '9.18',
    vars: [
      { sym: md`\overline{\dot{\mathcal{M}}}`, desc: 'time-averaged net upward ($+y$) rate of x-momentum transport per unit area', units: md`\mathrm{Pa}` },
      { sym: md`\overline{v_y'}`, desc: 'time average of the y-fluctuation — zero by definition', units: md`\mathrm{m/s}` },
      { sym: md`\lambda,\ \rho\overline{v}_x`, desc: 'as in (9.17)' },
    ],
    conditions: ['averaging time long compared with the eddy time scale', md`$\rho\overline{v}_x$ at X–X is constant during the averaging`],
    use: md`The first term vanishes because $\overline{v_y'}=0$; only the **correlation** between $v_y'$ and $\lambda$ survives.`,
    src: W('489', 'Eq. (9.18)'),
  },
  {
    id: 'nut-def',
    name: 'Eddy kinematic viscosity (definition)',
    key: true,
    tex: md`\overline{\dot{\mathcal{M}}} = -\overline{v_y'\lambda}\,\frac{d(\rho\overline{v}_x)}{dy} = -\nu_{\mathrm T}\,\frac{d(\rho\overline{v}_x)}{dy},\qquad \nu_{\mathrm T}\equiv\overline{v_y'\lambda}`,
    tag: '9.19',
    vars: [
      { sym: md`\nu_{\mathrm T}`, desc: 'eddy kinematic viscosity — a time-averaged property of the turbulence (subscript T = turbulent)', units: md`\mathrm{m^2/s}` },
      { sym: md`\overline{v_y'\lambda}`, desc: md`time average of (eddy velocity × travel distance); every product is $\ge 0$ because $v_y'$ and $\lambda$ share a sign`, units: md`\mathrm{m^2/s}` },
      { sym: md`\overline{\dot{\mathcal{M}}}`, desc: 'time-averaged upward momentum flux', units: md`\mathrm{Pa}` },
      { sym: md`d(\rho\overline{v}_x)/dy`, desc: 'mean momentum gradient', units: md`\mathrm{kg/(m^3\,s)}` },
    ],
    conditions: [
      md`eddy model of (9.17); $\overline{v_y'}=0$ (no net mean flow across X–X)`,
      md`gradient assumed constant over the region, so it can be taken outside the average`,
    ],
    use: md`A **gradient-transport law**: x momentum flows *down* its mean gradient, exactly like molecular transport but with $\nu_{\mathrm T}$ in place of
    $\nu$. Unlike $\nu$, $\nu_{\mathrm T}$ is not a fluid property — it depends on the eddies, i.e. on position and on the flow.`,
    src: W('489', 'Eq. (9.19)'),
  },
  {
    id: 'tau-nut',
    name: 'Turbulent shear stress in eddy-viscosity form',
    tex: md`\tau^{t}_{yx} = \rho\,\nu_{\mathrm T}\,\frac{d\overline{v}_x}{dy}\qquad\Bigl(\text{upward momentum flux } \overline{N}^{\,t} = -\rho\,\nu_{\mathrm T}\frac{d\overline{v}_x}{dy} = -\tau^{t}_{yx}\Bigr)`,
    vars: [
      { sym: md`\tau^{t}_{yx}`, desc: 'turbulent shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\overline{N}^{\,t}`, desc: 'time-averaged rate of turbulent transport in $+y$ per unit area (Table 9.1 header)', units: md`\mathrm{Pa}` },
      { sym: md`\nu_{\mathrm T}`, desc: 'eddy kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: md`d\overline{v}_x/dy`, desc: 'mean velocity gradient', units: md`\mathrm{s^{-1}}` },
      { sym: md`\rho`, desc: 'density (constant, so it can leave the derivative)', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: [
      'constant density',
      md`sign convention of §9.2: a positive shear stress means x momentum is transferred toward $-y$, hence $\overline{N}^{\,t}=-\tau^t_{yx}$`,
    ],
    use: md`Compare Newton's law $\tau_{yx}=\mu\,d\overline{v}_x/dy=\rho\nu\,d\overline{v}_x/dy$: turbulence simply replaces $\nu$ by $\nu_{\mathrm T}$. Use it forwards
    (stress from $\nu_{\mathrm T}$) or backwards ($\nu_{\mathrm T}$ from a measured stress).`,
    src: W('490', 'Table 9.1, momentum row'),
  },

  // ---------- Concept 2: Prandtl's mixing length ----------
  {
    id: 'r-def',
    name: 'Correlation coefficient R',
    tex: md`\overline{v_y'\lambda} = R\,\widetilde{v_y'}\,\widetilde{\lambda}`,
    tag: '9.20',
    vars: [
      { sym: md`R`, desc: md`correlation coefficient between $v_y'$ and $\lambda$ (positive, at most 1)`, units: md`-` },
      { sym: md`\widetilde{v_y'}`, desc: md`RMS value of $v_y'$, $\sqrt{\overline{v_y'^2}}$`, units: md`\mathrm{m/s}` },
      { sym: md`\widetilde{\lambda}`, desc: md`RMS value of the eddy travel distance $\lambda$`, units: md`\mathrm{m}` },
    ],
    conditions: ['a definition of $R$ — always true'],
    use: md`Splits $\overline{v_y'\lambda}$ into "how large" (the two RMS values) and "how well correlated" ($R$). Since $v_y'$ and $\lambda$ never have
    opposite signs, $R>0$.`,
    src: W('489', 'Eq. (9.20)'),
  },
  {
    id: 'kick',
    name: 'Velocity fluctuation produced by an arriving eddy',
    tex: md`v_x' = -\alpha\,\lambda\,\frac{d\overline{v}_x}{dy}`,
    tag: '9.21',
    vars: [
      { sym: md`v_x'`, desc: 'x-velocity fluctuation ("kick") at plane X–X', units: md`\mathrm{m/s}` },
      { sym: md`\alpha`, desc: 'approximately constant proportionality factor — **not** the thermal diffusivity', units: md`-` },
      { sym: md`\lambda\,d\overline{v}_x/dy`, desc: 'velocity deficiency: how much slower the origin plane B–B is than X–X', units: md`\mathrm{m/s}` },
    ],
    conditions: ['approximate; $\\alpha$ treated as a constant'.replace('\\\\', '\\'), 'mean gradient constant over $\\lambda$'.replace('\\\\', '\\')],
    use: md`Eddy from below ($\lambda>0$) into faster fluid ($d\overline{v}_x/dy>0$): negative kick. Eddy from above ($\lambda<0$): positive fluctuation. With
    $d\overline{v}_x/dy>0$, $v_x'$ always has the opposite sign to $v_y'$.`,
    src: W('489', 'Eq. (9.21)'),
  },
  {
    id: 'kick-rms',
    name: 'RMS x-fluctuation',
    tex: md`\widetilde{v_x'} = \alpha\,\widetilde{\lambda}\,\left|\frac{d\overline{v}_x}{dy}\right|`,
    tag: '9.22',
    vars: [
      { sym: md`\widetilde{v_x'}`, desc: md`RMS value of $v_x'$`, units: md`\mathrm{m/s}` },
      { sym: md`\widetilde{\lambda}`, desc: 'RMS eddy travel distance', units: md`\mathrm{m}` },
      { sym: md`\left|d\overline{v}_x/dy\right|`, desc: 'magnitude of the mean velocity gradient', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [md`follows from (9.21) with $\alpha$ and the gradient treated as constants`],
    use: md`Square (9.21), time-average, take the root: $\overline{v_x'^2}=\alpha^2\,\overline{\lambda^2}\,(d\overline{v}_x/dy)^2$. An RMS value is never negative — hence the absolute value.`,
    src: W('489', 'Eq. (9.22)'),
  },
  {
    id: 'beta',
    name: 'Correlated fluctuations: y-RMS from x-RMS',
    tex: md`\widetilde{v_y'} = \beta\,\widetilde{v_x'} = \alpha\beta\,\widetilde{\lambda}\,\left|\frac{d\overline{v}_x}{dy}\right|`,
    tag: '9.23',
    vars: [
      { sym: md`\beta`, desc: md`ratio of RMS y- to x-fluctuations; $\beta=1$ for **isotropic** turbulence`, units: md`-` },
      { sym: md`\widetilde{v_y'},\ \widetilde{v_x'}`, desc: 'RMS fluctuations', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`experimental observation: $\widetilde{v_y'}$ tends to be proportional to $\widetilde{v_x'}$ (the fluctuations are correlated)`,
      md`isotropic turbulence (same intensity in all directions): $\beta=1$`,
    ],
    use: md`The key closing step: the eddy speed $\widetilde{v_y'}$, which we cannot predict directly, is tied to the **mean** velocity gradient.`,
    src: W('489', 'Eq. (9.23)'),
  },
  {
    id: 'prandtl-1925',
    name: "Prandtl's result (1925)",
    tex: md`\begin{aligned}\overline{\dot{\mathcal{M}}} &= -R\,\widetilde{v_y'}\,\widetilde{\lambda}\,\frac{d(\rho\overline{v}_x)}{dy} = -R\alpha\beta\,\widetilde{\lambda}\,\widetilde{\lambda}\,\frac{d(\rho\overline{v}_x)}{dy}\left|\frac{d\overline{v}_x}{dy}\right| \\ &= -\ell^2\left|\frac{d\overline{v}_x}{dy}\right|\frac{d(\rho\overline{v}_x)}{dy}\end{aligned}`,
    tag: '9.24',
    vars: [
      { sym: md`\overline{\dot{\mathcal{M}}}`, desc: 'time-averaged upward momentum flux', units: md`\mathrm{Pa}` },
      { sym: md`R,\ \alpha,\ \beta`, desc: 'correlation coefficient, kick factor, RMS ratio', units: md`-` },
      { sym: md`\ell`, desc: md`Prandtl mixing length, $\ell^2=R\alpha\beta\,\widetilde{\lambda}^2$`, units: md`\mathrm{m}` },
    ],
    conditions: [md`combination of (9.19), (9.20) and (9.23)`],
    use: md`The flux now depends only on the **mean** profile and one length $\ell$ — no fluctuation statistics are needed any more.`,
    src: W('490', 'Eq. (9.24)'),
  },
  {
    id: 'ell-def',
    name: 'Prandtl mixing length',
    key: true,
    tex: md`\ell = \widetilde{\lambda}\,\sqrt{R\alpha\beta}`,
    tag: '9.25',
    vars: [
      { sym: md`\ell`, desc: 'Prandtl mixing length', units: md`\mathrm{m}` },
      { sym: md`\widetilde{\lambda}`, desc: 'RMS eddy travel distance', units: md`\mathrm{m}` },
      { sym: md`R,\ \alpha,\ \beta`, desc: 'constants of (9.20), (9.21), (9.23)', units: md`-` },
    ],
    conditions: ['lumps quantities that are not known separately', md`must be found from experiment (§9.4) or from a hypothesis such as $\ell=ky$ (§9.5)`],
    use: md`Think of $\ell$ as the effective "mean free path" of the eddies. Equation (9.25) explains what $\ell$ *means*; it is not used to *compute* $\ell$.`,
    src: W('490', 'Eq. (9.25)'),
  },
  {
    id: 'nut-ell',
    name: 'Eddy viscosity from the mixing length',
    key: true,
    tex: md`\nu_{\mathrm T} = \ell^2\left|\frac{d\overline{v}_x}{dy}\right|`,
    tag: '9.26',
    vars: [
      { sym: md`\nu_{\mathrm T}`, desc: 'eddy kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: md`\ell`, desc: 'Prandtl mixing length', units: md`\mathrm{m}` },
      { sym: md`\left|d\overline{v}_x/dy\right|`, desc: 'magnitude of the local mean velocity gradient', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: ['mixing-length model', 'local: depends only on the gradient at the same point'],
    use: md`A velocity scale $\ell\,\lvert d\overline{v}_x/dy\rvert$ times a length scale $\ell$. The absolute value keeps $\nu_{\mathrm T}\ge0$ for either sign of the gradient.`,
    src: W('490', 'Eq. (9.26)'),
  },
  {
    id: 'tau-ml',
    name: 'Mixing-length stress law',
    key: true,
    tex: md`\tau^{t}_{yx} = \rho\,\ell^2\left|\frac{d\overline{v}_x}{dy}\right|\frac{d\overline{v}_x}{dy}`,
    vars: [
      { sym: md`\tau^{t}_{yx}`, desc: 'turbulent shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\ell`, desc: 'mixing length', units: md`\mathrm{m}` },
      { sym: md`d\overline{v}_x/dy`, desc: 'mean velocity gradient', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: ['constant density; mixing-length model', 'viscous stress neglected (fully turbulent region)'],
    use: md`Quadratic in the gradient (double $d\overline{v}_x/dy$ ⇒ four times the stress) and odd in its sign (the stress follows the sign of the gradient).
    For plates and pipes it is written as Eq. (9.28).`,
    src: W('490', 'Table 9.1, momentum row'),
  },

  // ---------- Concept 3: heat and mass ----------
  {
    id: 'heat-flux-turb',
    name: 'Turbulent heat flux (Table 9.1, heat row)',
    key: true,
    tex: md`q^{t} = -\rho c_p\,\nu_{\mathrm T}\,\frac{\partial\overline{T}}{\partial y} = -\rho c_p\,\ell^2\,\frac{\partial\overline{T}}{\partial y}\left|\frac{d\overline{v}_x}{dy}\right|`,
    vars: [
      { sym: md`q^{t}`, desc: 'turbulent heat flux, positive in $+y$', units: md`\mathrm{W/m^2}` },
      { sym: md`\rho c_p\overline{T}`, desc: 'quantity carried: enthalpy per unit volume ($c_p$ = specific heat)', units: md`\mathrm{J/m^3}` },
      { sym: md`c_p`, desc: 'specific heat', units: md`\mathrm{J/(kg\,K)}` },
      { sym: md`\overline{T}`, desc: 'time-averaged temperature', units: md`\mathrm{K}` },
      { sym: md`\partial\overline{T}/\partial y`, desc: 'transverse temperature gradient', units: md`\mathrm{K/m}` },
      { sym: md`\nu_{\mathrm T},\ \ell`, desc: 'eddy viscosity and mixing length of the velocity field', units: md`\mathrm{m^2/s},\ \mathrm{m}` },
    ],
    conditions: [
      md`eddy thermal diffusivity $\alpha_T$ set equal to $\nu_{\mathrm T}$ — **a first approximation only**`,
      md`heat flux counted positive in **$+y$** (no minus sign in front of $q^t$)`,
      md`partial derivative: $\overline{T}$ varies across **and** along the flow (e.g. in a heat exchanger)`,
    ],
    use: md`Same eddies, different cargo: $\rho c_p\overline{T}$ replaces $\rho\overline{v}_x$. Heat runs down the temperature gradient: $\partial\overline{T}/\partial y<0$ gives $q^t>0$ (upward).`,
    src: W('490', 'Table 9.1'),
  },
  {
    id: 'mass-flux-turb',
    name: 'Turbulent species flux (Table 9.1, mass row)',
    tex: md`N^{t} = -\nu_{\mathrm T}\,\frac{\partial\overline{c}}{\partial y} = -\ell^2\,\frac{\partial\overline{c}}{\partial y}\left|\frac{d\overline{v}_x}{dy}\right|`,
    vars: [
      { sym: md`N^{t}`, desc: 'turbulent molar flux of one species, positive in $+y$', units: md`\mathrm{kmol/(m^2\,s)}` },
      { sym: md`\overline{c}`, desc: 'time-averaged species concentration', units: md`\mathrm{kmol/m^3}` },
      { sym: md`\partial\overline{c}/\partial y`, desc: 'transverse concentration gradient', units: md`\mathrm{kmol/m^4}` },
      { sym: md`\nu_{\mathrm T},\ \ell`, desc: 'eddy viscosity and mixing length', units: md`\mathrm{m^2/s},\ \mathrm{m}` },
    ],
    conditions: [
      md`eddy diffusivity $\mathcal{D}_T$ set equal to $\nu_{\mathrm T}$ (first approximation)`,
      'typically one chemical species in the presence of others; flux positive in $+y$'.replace('\\\\', '\\'),
    ],
    use: md`Concentration plays the role of $\rho\overline{v}_x$. With a mass concentration (kg/m³) instead, $N^t$ comes out in kg/(m²·s).`,
    src: W('490', 'Table 9.1'),
  },
  {
    id: 'eddy-diff-assump',
    name: 'Eddy diffusivities assumed equal to the eddy viscosity',
    tex: md`\alpha_T \approx \mathcal{D}_T \approx \nu_{\mathrm T}`,
    vars: [
      { sym: md`\alpha_T`, desc: 'eddy thermal diffusivity', units: md`\mathrm{m^2/s}` },
      { sym: md`\mathcal{D}_T`, desc: 'eddy diffusivity (mass)', units: md`\mathrm{m^2/s}` },
      { sym: md`\nu_{\mathrm T}`, desc: 'eddy kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['true only as a first approximation', 'the relation between turbulent heat and momentum transport is examined further in §9.13'],
    use: md`This is what lets one value of $\nu_{\mathrm T}$ (or $\ell$) serve all three rows of Table 9.1.`,
    src: W('490'),
  },
  {
    id: 'eddy-diff-general',
    name: 'General eddy-diffusivity forms (before the assumption)',
    tex: md`q^{t} = -\rho c_p\,\alpha_T\,\frac{\partial\overline{T}}{\partial y},\qquad N^{t} = -\mathcal{D}_T\,\frac{\partial\overline{c}}{\partial y},\qquad \Pran_T = \frac{\nu_{\mathrm T}}{\alpha_T},\quad \mathrm{Sc}_T = \frac{\nu_{\mathrm T}}{\mathcal{D}_T}`,
    vars: [
      { sym: md`\alpha_T,\ \mathcal{D}_T`, desc: 'eddy thermal diffusivity and eddy mass diffusivity', units: md`\mathrm{m^2/s}` },
      { sym: md`\Pran_T`, desc: 'turbulent Prandtl number', units: md`-` },
      { sym: md`\mathrm{Sc}_T`, desc: 'turbulent Schmidt number', units: md`-` },
    ],
    conditions: ['definitions (supplementary)', md`Table 9.1 corresponds to $\Pran_T=\mathrm{Sc}_T=1$`],
    use: md`Molecular analogues: Fourier $q=-k\,\partial T/\partial y=-\rho c_p\alpha\,\partial T/\partial y$ and Fick $N=-\mathcal{D}\,\partial c/\partial y$. Molecular $\Pran=\nu/\alpha$ and
    $\mathrm{Sc}=\nu/\mathcal{D}$ differ enormously between fluids; their turbulent counterparts stay close to 1 because one mechanism — eddies — carries everything.`,
  },

  // ---------- Concept 4: determination in pipes ----------
  {
    id: 'stress-linear',
    name: 'Linear shear-stress distribution from a momentum balance',
    key: true,
    tex: md`\text{plates: } \tau^{\ell}_{yx}+\tau^{t}_{yx} \doteq \tau^{t}_{yx} = y\left(\frac{dp}{dx}\right),\qquad \text{pipe: } \tau^{\ell}_{rz}+\tau^{t}_{rz} \doteq \tau^{t}_{rz} = \frac{r}{2}\left(\frac{dp}{dz}\right)`,
    tag: '9.27',
    vars: [
      { sym: md`\tau^{\ell}_{yx},\ \tau^{\ell}_{rz}`, desc: 'laminar (viscous) shear stress — neglected here', units: md`\mathrm{Pa}` },
      { sym: md`\tau^{t}_{yx},\ \tau^{t}_{rz}`, desc: 'turbulent shear stress', units: md`\mathrm{Pa}` },
      { sym: md`y`, desc: 'plates: distance measured from the **centreline**', units: md`\mathrm{m}` },
      { sym: md`r`, desc: 'pipe: radial distance from the axis', units: md`\mathrm{m}` },
      { sym: md`dp/dx,\ dp/dz`, desc: 'axial pressure gradient (negative for flow in $+x$, $+z$)', units: md`\mathrm{Pa/m}` },
    ],
    conditions: [
      'momentum (force) balance on the elements of Fig. 9.6 — steady, fully developed flow',
      md`the typically very small viscous stress is ignored ($\doteq$); keep it if high accuracy is needed, especially near the walls`,
    ],
    use: md`One pressure-drop measurement gives the stress **everywhere**: zero on the centreline, growing linearly to its largest value at the wall.`,
    src: W('491', 'Eq. (9.27)'),
  },
  {
    id: 'wall-stress',
    name: 'Wall shear stress from the pressure gradient',
    tex: md`-\tau_w = \frac{a}{2}\,\frac{d\overline{p}}{dz}\quad\Longrightarrow\quad \tau_w = \frac{a}{2}\left(-\frac{dp}{dz}\right) = \frac{a\,\Delta p}{2L}`,
    tag: '9.82',
    vars: [
      { sym: md`\tau_w`, desc: 'wall shear stress, traditionally taken positive', units: md`\mathrm{Pa}` },
      { sym: md`a`, desc: 'pipe radius', units: md`\mathrm{m}` },
      { sym: md`d\overline{p}/dz`, desc: 'mean axial pressure gradient', units: md`\mathrm{Pa/m}` },
      { sym: md`\Delta p,\ L`, desc: 'pressure drop over a pipe length $L$', units: md`\mathrm{Pa},\ \mathrm{m}` },
    ],
    conditions: ['(9.27) evaluated at the wall, $r=a$'.replace('\\\\', '\\'), md`the total stress magnitude is then $\tau_w\,r/a=\tau_w(1-y/a)$`],
    use: md`Gives $\tau_w$ — and the friction velocity $\sqrt{\tau_w/\rho}$ that scales $\nu_{\mathrm T}$ in (9.30)–(9.31) — from one pressure-drop measurement.`,
    src: W('504', 'Eq. (9.82)'),
  },
  {
    id: 'ml-from-data',
    name: 'Mixing length and eddy viscosity from measurements',
    tex: md`\text{plates: } \tau^{t}_{yx} = \rho\,\underbrace{\ell^2\left|\frac{d\overline{v}_x}{dy}\right|}_{\nu_{\mathrm T}}\frac{d\overline{v}_x}{dy},\qquad \text{pipe: } \tau^{t}_{rz} = \rho\,\underbrace{\ell^2\left|\frac{d\overline{v}_z}{dr}\right|}_{\nu_{\mathrm T}}\frac{d\overline{v}_z}{dr}`,
    tag: '9.28',
    vars: [
      { sym: md`\overline{v}_x,\ \overline{v}_z`, desc: 'time-averaged axial velocity (plates, pipe)', units: md`\mathrm{m/s}` },
      { sym: md`d\overline{v}_z/dr`, desc: 'radial velocity gradient — negative in a pipe', units: md`\mathrm{s^{-1}}` },
      { sym: md`\ell,\ \nu_{\mathrm T}`, desc: 'mixing length and eddy viscosity (the unknowns)', units: md`\mathrm{m},\ \mathrm{m^2/s}` },
    ],
    conditions: [
      md`stress from (9.27); velocity gradient measured with a **Pitot tube** or **laser-Doppler velocimetry**`,
      'fully turbulent region (viscous stress neglected)',
    ],
    use: md`Solve for the unknowns: $\nu_{\mathrm T}=\tau^t/(\rho\,d\overline{v}/dy)$ and $\ell=\sqrt{\nu_{\mathrm T}/\lvert d\overline{v}/dy\rvert}$. In a pipe $\tau^t_{rz}$ and
    $d\overline{v}_z/dr$ are both negative, so $\nu_{\mathrm T}>0$.`,
    src: W('491', 'Eq. (9.28)'),
  },
  {
    id: 'nikuradse-ell',
    name: 'Mixing-length distribution in pipes (smooth and rough)',
    key: true,
    tex: md`\frac{\ell}{a} = 0.14 - 0.08\left(1-\frac{y}{a}\right)^{2} - 0.06\left(1-\frac{y}{a}\right)^{4}`,
    tag: '9.29',
    vars: [
      { sym: md`\ell`, desc: 'mixing length (printed as an italic $l$ in the book)', units: md`\mathrm{m}` },
      { sym: md`a`, desc: 'pipe radius', units: md`\mathrm{m}` },
      { sym: md`y`, desc: 'distance from the **wall**, $y=a-r$', units: md`\mathrm{m}` },
    ],
    conditions: [
      'experiments show it holds very accurately for **both smooth and rough** pipes (Schlichting, Eq. 20.18)',
      'fully developed turbulent pipe flow; $y$ measured from the wall'.replace('\\\\', '\\'),
    ],
    use: md`$\ell/a$ rises from 0 at the wall with slope 0.4 to a maximum of 0.14 on the centreline (Fig. 9.7). Multiply by $a$ to get $\ell$ in metres.`,
    src: W('491', 'Eq. (9.29)'),
  },
  {
    id: 'ell-wall',
    name: 'Near-wall limit of the mixing length',
    tex: md`\ell \to 0.4\,y\qquad (y \ll a)`,
    vars: [
      { sym: md`\ell`, desc: 'mixing length', units: md`\mathrm{m}` },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
    ],
    conditions: ['as the wall is approached (tangent of (9.29) at $y=0$)'.replace('\\\\', '\\')],
    use: md`The simplified result used in the **Prandtl hypothesis** $\ell=ky$ with $k\approx0.4$ (§9.5, next topic). Farther out the eddies have more freedom and $\ell$ falls below $0.4y$.`,
    src: W('492', 'text with Fig. 9.7'),
  },
  {
    id: 'nut-approx',
    name: 'Dimensionless eddy viscosity — approximate (Nikuradse, smooth pipes)',
    key: true,
    tex: md`\frac{\nu_{\mathrm T}}{a\sqrt{\tau_w/\rho}} \doteq 0.32\,\frac{y}{a}\left(1-\frac{y}{a}\right)`,
    tag: '9.30',
    vars: [
      { sym: md`\nu_{\mathrm T}`, desc: 'eddy kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: md`a\sqrt{\tau_w/\rho}`, desc: md`pipe radius × friction velocity — the scale that makes $\nu_{\mathrm T}$ dimensionless`, units: md`\mathrm{m^2/s}` },
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`y/a`, desc: 'dimensionless distance from the wall', units: md`-` },
    ],
    conditions: ['Nikuradse’s experiments in **smooth** pipes', 'approximate: a symmetric parabola, zero at the wall and on the centreline'],
    use: md`Quick estimate: the maximum is $0.32\times\tfrac12\times\tfrac12=0.08$ at mid-radius, so $\nu_{\mathrm{T,max}}\approx0.08\,a\sqrt{\tau_w/\rho}$.`,
    src: W('492', 'Eq. (9.30)'),
  },
  {
    id: 'nut-accurate',
    name: 'Dimensionless eddy viscosity — accurate (Nikuradse, smooth pipes)',
    tex: md`\frac{\nu_{\mathrm T}}{a\sqrt{\tau_w/\rho}} = 0.4070\,\frac{y}{a} - 0.7012\left(\frac{y}{a}\right)^{2} + 0.4505\left(\frac{y}{a}\right)^{3} - 0.1437\left(\frac{y}{a}\right)^{5}`,
    tag: '9.31',
    vars: [
      { sym: md`\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})`, desc: 'dimensionless eddy kinematic viscosity', units: md`-` },
      { sym: md`y/a`, desc: 'dimensionless distance from the wall', units: md`-` },
    ],
    conditions: ['smooth pipes (Nikuradse)', md`note: **no** $(y/a)^4$ term`, 'plotted in Fig. 9.8'],
    use: md`Initial slope 0.407 ≈ 0.4; maximum ≈ 0.080 near $y/a\approx0.5$; still ≈ 0.013 on the centreline — "not quite zero".`,
    src: W('492', 'Eq. (9.31)'),
  },
  {
    id: 'nut-pipe',
    name: 'Eddy viscosity in a pipe',
    tex: md`\nu_{\mathrm T} = \ell^{2}\left|\frac{d\overline{v}_z}{dr}\right| = \ell^{2}\left|\frac{d\overline{v}_z}{dy}\right|`,
    tag: '9.32',
    vars: [
      { sym: md`\ell`, desc: 'mixing length', units: md`\mathrm{m}` },
      { sym: md`d\overline{v}_z/dr,\ d\overline{v}_z/dy`, desc: 'mean velocity gradient in $r$ or in $y=a-r$ (equal magnitudes, since $dy=-dr$)', units: md`\mathrm{s^{-1}}` },
    ],
    conditions: ['mixing-length model, (9.28)'],
    use: md`Explains Fig. 9.8: moving away from the wall $\ell$ grows, so $\nu_{\mathrm T}$ grows; beyond mid-radius the falling velocity gradient dominates and $\nu_{\mathrm T}$ drops toward the centreline.`,
    src: W('492', 'Eq. (9.32)'),
  },
  {
    id: 'friction-velocity',
    name: 'Friction velocity and distances in wall units',
    tex: md`\overline{v}_z^{\,*} = \sqrt{\frac{\tau_w}{\rho}},\qquad y^{+} = \frac{y\sqrt{\tau_w/\rho}}{\nu},\qquad a^{+} = \frac{a\,\overline{v}_z^{\,*}}{\nu}`,
    vars: [
      { sym: md`\overline{v}_z^{\,*}`, desc: 'friction velocity (Fox writes $u_*$)', units: md`\mathrm{m/s}` },
      { sym: md`y^{+}`, desc: 'dimensionless distance from the wall', units: md`-` },
      { sym: md`a^{+}`, desc: 'pipe radius in wall units (used here for convenience)', units: md`-` },
      { sym: md`\nu`, desc: 'molecular kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['definitions'],
    use: md`The scale in (9.30)–(9.31) is $a\overline{v}_z^{\,*}$, so $\nu_{\mathrm T}/\nu=a^{+}\times\big[\nu_{\mathrm T}/(a\overline{v}_z^{\,*})\big]$: the eddy-to-molecular ratio grows in proportion to $a^+$, i.e. with Re.`,
    src: [W('495', 'Eq. (9.38)'), W('496', 'friction velocity')],
  },
  {
    id: 'fanning',
    name: 'Fanning friction factor and the smooth-pipe law',
    tex: md`f_F = \frac{\tau_w}{\tfrac12\rho\,\overline{v}_{zm}^{\,2}},\qquad \sqrt{\frac{1}{f_F}} = 1.74\,\ln\!\left(\Rey\sqrt{f_F}\right) - 0.391`,
    vars: [
      { sym: md`f_F`, desc: 'Fanning friction factor (Fox uses the Darcy factor $f=4f_F$)', units: md`-` },
      { sym: md`\overline{v}_{zm}`, desc: 'mean (bulk) velocity, the same as $u_m$', units: md`\mathrm{m/s}` },
      { sym: md`\Rey`, desc: md`Reynolds number $\rho\overline{v}_{zm}D/\mu$`, units: md`-` },
    ],
    conditions: [md`second relation: smooth pipes, $5\times10^3\le\Rey\le3.4\times10^6$ (and probably beyond); solve iteratively`],
    use: md`Iterate on $x=1/\sqrt{f_F}$: $x\leftarrow1.74\ln(\Rey/x)-0.391$. Then $\tau_w=\tfrac12f_F\rho\overline{v}_{zm}^2$ and $\overline{v}_z^{\,*}=\overline{v}_{zm}\sqrt{f_F/2}$.`,
    src: W('498', 'Eqs. (9.51), (9.53)'),
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Solved examples                                                                                 */
/* ------------------------------------------------------------------------------------------------ */

export const examples: ExampleDef[] = [
  {
    id: 'ex-four-eddies',
    concept: 'eddy-viscosity',
    title: 'Four eddies, one plane: building ν_T from Eqs. (9.17)–(9.19)',
    difficulty: 2,
    given: md`Water, $\rho=1000$ kg/m³. At plane X–X the mean velocity is $\overline{v}_x=2.0$ m/s and $d\overline{v}_x/dy=15$ s⁻¹ (constant). During one
    averaging period four equally weighted eddies cross unit area of X–X:

    | eddy | comes from | $\lambda$ (mm) | $v_y'$ (m/s) |
    |---|---|---|---|
    | 1 | B–B (below) | +6 | +0.10 |
    | 2 | A–A (above) | −6 | −0.10 |
    | 3 | B–B (below) | +10 | +0.20 |
    | 4 | A–A (above) | −10 | −0.20 |`,
    find: md`$\dot{\mathcal{M}}$ of each eddy (9.17), the average $\overline{\dot{\mathcal{M}}}$, the eddy viscosity $\nu_{\mathrm T}=\overline{v_y'\lambda}$, a check of (9.19)
    and the turbulent shear stress.`,
    assumptions: md`gradient constant over the jump distances; constant $\rho$; every eddy mixes completely on arrival.`,
    steps: [
      {
        title: 'Momentum each eddy brings',
        md: md`An eddy carries the mean velocity of its origin plane, $\overline{v}_x-\lambda\,d\overline{v}_x/dy$:

        - eddy 1: $2.0-(0.006)(15)=1.91$ m/s, i.e. $\rho(\cdot)=1910$ kg/(m²·s)
        - eddy 2: $2.0-(-0.006)(15)=2.09$ m/s → $2090$ kg/(m²·s)
        - eddy 3: $2.0-(0.010)(15)=1.85$ m/s → $1850$ kg/(m²·s)
        - eddy 4: $2.0+(0.010)(15)=2.15$ m/s → $2150$ kg/(m²·s)`,
      },
      {
        title: 'Instantaneous fluxes, Eq. (9.17)',
        md: md`$\dot{\mathcal{M}}=v_y'\times(\text{momentum per unit volume})$:
        $\dot{\mathcal{M}}_1=(0.10)(1910)=+191.0$ Pa, $\dot{\mathcal{M}}_2=(-0.10)(2090)=-209.0$ Pa,
        $\dot{\mathcal{M}}_3=(0.20)(1850)=+370.0$ Pa, $\dot{\mathcal{M}}_4=(-0.20)(2150)=-430.0$ Pa.`,
      },
      {
        title: 'Time average, Eq. (9.18)',
        md: md`$\overline{\dot{\mathcal{M}}}=(191.0-209.0+370.0-430.0)/4=-78.0/4=-19.5$ Pa. Here $\overline{v_y'}=(0.10-0.10+0.20-0.20)/4=0$, so the large
        "carry-along" part $\overline{v_y'}\,\rho\overline{v}_x$ cancels exactly — only the velocity deficiencies survive.`,
      },
      {
        title: 'Eddy viscosity, Eq. (9.19)',
        md: md`$\nu_{\mathrm T}=\overline{v_y'\lambda}=\big[(0.10)(0.006)+(-0.10)(-0.006)+(0.20)(0.010)+(-0.20)(-0.010)\big]/4=0.0052/4=1.30\times10^{-3}$ m²/s.
        Every product is positive because $v_y'$ and $\lambda$ share a sign.`,
      },
      {
        title: 'Check (9.19) and find the stress',
        md: md`$-\nu_{\mathrm T}\,\rho\,d\overline{v}_x/dy=-(1.30\times10^{-3})(1000)(15)=-19.5$ Pa ✓ — identical to step 3. The upward momentum flux equals
        $-\tau^t_{yx}$ (Table 9.1), so $\tau^t_{yx}=+19.5$ Pa. With $\nu=1.0\times10^{-6}$ m²/s for water, $\nu_{\mathrm T}/\nu=1300$.`,
      },
    ],
    answer: md`$\overline{\dot{\mathcal{M}}}=-19.5$ Pa (net transport of x momentum **downward**), $\nu_{\mathrm T}=1.30\times10^{-3}$ m²/s $\approx1300\,\nu$,
    $\tau^t_{yx}=+19.5$ Pa.`,
    insight:
      'Individual eddies move hundreds of pascals of momentum flux up and down; the net transport is the small, systematic difference caused by the velocity deficiency — and it always points from fast to slow fluid.',
  },
  {
    id: 'ex-sign-upper-half',
    concept: 'eddy-viscosity',
    title: 'Which way does the momentum go? Upper half of a channel',
    difficulty: 1,
    given: md`In the upper half of a channel the mean velocity *decreases* upward: $d\overline{v}_x/dy=-25$ s⁻¹. There $\nu_{\mathrm T}=8.0\times10^{-4}$ m²/s; water,
    $\rho=1000$ kg/m³.`,
    find: md`The time-averaged upward momentum flux $\overline{\dot{\mathcal{M}}}$ from (9.19) and the turbulent shear stress $\tau^t_{yx}$; interpret the signs.`,
    steps: [
      { title: 'Momentum flux, Eq. (9.19)', md: md`$\overline{\dot{\mathcal{M}}}=-\nu_{\mathrm T}\,\rho\,\dfrac{d\overline{v}_x}{dy}=-(8.0\times10^{-4})(1000)(-25)=+20$ Pa.` },
      { title: 'Shear stress', md: md`$\tau^t_{yx}=-\overline{\dot{\mathcal{M}}}=\rho\,\nu_{\mathrm T}\,d\overline{v}_x/dy=-20$ Pa.` },
      {
        title: 'Interpret',
        md: md`The fast fluid is *below* (toward the channel centre), so x momentum is carried **upward**, toward the slow fluid near the top wall:
        $\overline{\dot{\mathcal{M}}}>0$. The stress takes the sign of the gradient (negative), exactly as Newton's law would; $\nu_{\mathrm T}$ itself stays positive.`,
      },
    ],
    answer: md`$\overline{\dot{\mathcal{M}}}=+20$ Pa (upward), $\tau^t_{yx}=-20$ Pa.`,
    insight: 'Momentum always diffuses from fast to slow fluid; a positive ν_T guarantees it, whatever the sign of the gradient.',
  },
  {
    id: 'ex-chain',
    concept: 'prandtl-mixing-length',
    title: "Following Prandtl's chain with numbers",
    difficulty: 2,
    given: md`Eddy statistics at a point in turbulent water flow ($\rho=1000$ kg/m³, $\nu=1.0\times10^{-6}$ m²/s): $\widetilde{\lambda}=10$ mm, $R=0.6$,
    $\alpha=1.0$, $\beta=0.8$; mean gradient $d\overline{v}_x/dy=25$ s⁻¹.`,
    find: md`$\widetilde{v_x'}$, $\widetilde{v_y'}$, $\nu_{\mathrm T}$ via (9.20), $\ell$ from (9.25), a check with (9.26), and $\tau^t_{yx}$.`,
    steps: [
      { title: 'RMS x-fluctuation, Eq. (9.22)', md: md`$\widetilde{v_x'}=\alpha\widetilde{\lambda}\,\lvert d\overline{v}_x/dy\rvert=(1.0)(0.010)(25)=0.25$ m/s.` },
      { title: 'RMS y-fluctuation, Eq. (9.23)', md: md`$\widetilde{v_y'}=\beta\widetilde{v_x'}=(0.8)(0.25)=0.20$ m/s (not isotropic, since $\beta\ne1$).` },
      { title: 'Eddy viscosity, Eqs. (9.19)–(9.20)', md: md`$\nu_{\mathrm T}=R\,\widetilde{v_y'}\,\widetilde{\lambda}=(0.6)(0.20)(0.010)=1.2\times10^{-3}$ m²/s.` },
      { title: 'Mixing length, Eq. (9.25)', md: md`$\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}=10\sqrt{(0.6)(1.0)(0.8)}=10\sqrt{0.48}=6.93$ mm.` },
      {
        title: 'Check with (9.26) and find the stress',
        md: md`$\ell^2\lvert d\overline{v}_x/dy\rvert=(6.93\times10^{-3})^2(25)=1.2\times10^{-3}$ m²/s ✓ (same as step 3). Then
        $\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy=(1000)(1.2\times10^{-3})(25)=30$ Pa, and $\nu_{\mathrm T}/\nu=1200$.`,
      },
    ],
    answer: md`$\widetilde{v_x'}=0.25$ m/s, $\widetilde{v_y'}=0.20$ m/s, $\nu_{\mathrm T}=1.2\times10^{-3}$ m²/s, $\ell=6.93$ mm, $\tau^t_{yx}=30$ Pa.`,
    insight: md`Both routes give the same $\nu_{\mathrm T}$ — that is all (9.25)–(9.26) do: they package $R$, $\alpha$, $\beta$ and $\widetilde{\lambda}$ into the single length $\ell$.`,
  },
  {
    id: 'ex-ell-from-stress',
    concept: 'prandtl-mixing-length',
    title: 'Backing out ℓ from a measured stress',
    difficulty: 2,
    given: md`Water ($\rho=1000$ kg/m³). At a point $y=4$ mm from a wall the turbulent shear stress is $\tau^t_{yx}=9.0$ Pa and the measured mean gradient
    is $d\overline{v}_x/dy=60$ s⁻¹.`,
    find: md`$\nu_{\mathrm T}$ and the mixing length $\ell$; compare $\ell$ with the distance from the wall.`,
    steps: [
      { title: 'Eddy viscosity', md: md`$\nu_{\mathrm T}=\dfrac{\tau^t_{yx}}{\rho\,d\overline{v}_x/dy}=\dfrac{9.0}{(1000)(60)}=1.5\times10^{-4}$ m²/s $\;(150\,\nu)$.` },
      {
        title: 'Mixing length from (9.26)',
        md: md`$\ell=\sqrt{\nu_{\mathrm T}/\lvert d\overline{v}_x/dy\rvert}=\sqrt{1.5\times10^{-4}/60}=\sqrt{2.5\times10^{-6}}=1.58\times10^{-3}$ m $=1.58$ mm.`,
      },
      {
        title: 'Interpret',
        md: md`$\ell/y=1.58/4=0.395$ — very close to the near-wall behaviour $\ell\approx0.4y$ that pipe measurements reveal (Wilkes p. 492, next concept).`,
      },
    ],
    answer: md`$\nu_{\mathrm T}=1.5\times10^{-4}$ m²/s, $\ell=1.58$ mm $\approx0.4\,y$.`,
    insight: 'Because ℓ cannot be predicted from (9.25), this inversion — stress and gradient in, ℓ out — is how mixing lengths are actually obtained.',
  },
  {
    id: 'ex-air-duct',
    concept: 'transport-analogies',
    title: 'One ν_T, three fluxes: air over a heated, wet floor',
    difficulty: 2,
    given: md`Turbulent air layer ($\rho=1.2$ kg/m³, $c_p=1005$ J/(kg·K), $\mu=1.8\times10^{-5}$ Pa·s, $k=0.026$ W/(m·K)). At one point: $\ell=4$ mm,
    $d\overline{v}_x/dy=50$ s⁻¹, $\partial\overline{T}/\partial y=-200$ K/m and, for water vapour, $\partial\overline{c}/\partial y=-0.02$ kmol/m⁴
    (molecular diffusivity $\mathcal{D}=2.5\times10^{-5}$ m²/s). $y$ points upward.`,
    find: md`$\nu_{\mathrm T}$, $\tau^t_{yx}$, $q^t$ and $N^t$ from Table 9.1, and how each compares with its molecular counterpart.`,
    assumptions: md`$\alpha_T=\mathcal{D}_T=\nu_{\mathrm T}$ (Table 9.1, first approximation). Property values are typical for air near 20 °C.`,
    steps: [
      { title: 'Eddy viscosity, Eq. (9.26)', md: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert=(0.004)^2(50)=8.0\times10^{-4}$ m²/s.` },
      {
        title: 'Momentum row',
        md: md`$\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy=(1.2)(8.0\times10^{-4})(50)=0.048$ Pa. Viscous: $\mu\,d\overline{v}_x/dy=(1.8\times10^{-5})(50)=9.0\times10^{-4}$ Pa,
        so the ratio is $53$ ($=\nu_{\mathrm T}/\nu$ with $\nu=1.5\times10^{-5}$ m²/s). The momentum flux $-\tau^t_{yx}=-0.048$ Pa points **down**.`,
      },
      {
        title: 'Heat row',
        md: md`$q^t=-\rho c_p\nu_{\mathrm T}\,\partial\overline{T}/\partial y=-(1.2)(1005)(8.0\times10^{-4})(-200)=+193$ W/m² (upward). Molecular (Fourier):
        $-k\,\partial T/\partial y=-(0.026)(-200)=5.2$ W/m², a ratio of $37$ ($=\nu_{\mathrm T}/\alpha$ with $\alpha=k/\rho c_p=2.16\times10^{-5}$ m²/s).`,
      },
      {
        title: 'Mass row',
        md: md`$N^t=-\nu_{\mathrm T}\,\partial\overline{c}/\partial y=-(8.0\times10^{-4})(-0.02)=1.6\times10^{-5}$ kmol/(m²·s) (upward). Molecular (Fick):
        $(2.5\times10^{-5})(0.02)=5.0\times10^{-7}$ kmol/(m²·s), a ratio of $32$.`,
      },
      {
        title: 'Directions',
        md: md`Heat and vapour move **up**, down their own gradients (warm, wet floor below); x momentum moves **down**, toward the slow fluid near the floor.
        All three use the same $\nu_{\mathrm T}$.`,
      },
    ],
    answer: md`$\nu_{\mathrm T}=8.0\times10^{-4}$ m²/s; $\tau^t_{yx}=0.048$ Pa; $q^t=193$ W/m²; $N^t=1.6\times10^{-5}$ kmol/(m²·s) — each 30–55 times its molecular counterpart.`,
    insight: 'One eddy field, one ν_T; the enhancement factors differ only because the molecular diffusivities ν, α and 𝒟 differ.',
  },
  {
    id: 'ex-pipe-measure',
    concept: 'determination',
    title: 'The §9.4 recipe: ν_T and ℓ from a pressure drop and a Pitot traverse',
    difficulty: 2,
    given: md`Water ($\rho=1000$ kg/m³, $\nu=1.0\times10^{-6}$ m²/s) in a pipe of diameter $D=0.10$ m ($a=0.05$ m). The measured pressure drop is
    $2.0$ kPa over $L=5.0$ m. A Pitot traverse gives $d\overline{v}_z/dr=-12.0$ s⁻¹ at $r=0.025$ m.`,
    find: md`$\tau^t_{rz}$ there and $\tau_w$ (9.27, 9.82); $\nu_{\mathrm T}$ and $\ell$ at that radius (9.28); compare with Nikuradse's (9.29) and (9.31).`,
    assumptions: md`steady, fully developed turbulent flow; viscous stress neglected at $r=0.025$ m (there $y^+=2500$).`,
    steps: [
      { title: 'Pressure gradient', md: md`$dp/dz=-\Delta p/L=-2000/5.0=-400$ Pa/m.` },
      {
        title: 'Stresses, Eqs. (9.27) and (9.82)',
        md: md`$\tau^t_{rz}=\dfrac{r}{2}\dfrac{dp}{dz}=\dfrac{0.025}{2}(-400)=-5.0$ Pa. At the wall, $\tau_w=\dfrac{a}{2}\Big(-\dfrac{dp}{dz}\Big)=\dfrac{0.05}{2}(400)=10.0$ Pa,
        so $\sqrt{\tau_w/\rho}=\sqrt{10.0/1000}=0.100$ m/s.`,
      },
      {
        title: 'Eddy viscosity, Eq. (9.28)',
        md: md`$\tau^t_{rz}=\rho\,\nu_{\mathrm T}\,\dfrac{d\overline{v}_z}{dr}\ \Rightarrow\ \nu_{\mathrm T}=\dfrac{-5.0}{(1000)(-12.0)}=4.17\times10^{-4}$ m²/s $\;(\approx417\,\nu)$.`,
      },
      {
        title: 'Mixing length, Eq. (9.28)',
        md: md`$\ell=\sqrt{\nu_{\mathrm T}/\lvert d\overline{v}_z/dr\rvert}=\sqrt{4.17\times10^{-4}/12.0}=\sqrt{3.47\times10^{-5}}=5.89\times10^{-3}$ m, so $\ell/a=0.118$.`,
      },
      {
        title: 'Compare with Nikuradse',
        md: md`Here $y/a=(a-r)/a=0.5$. Eq. (9.29): $\ell/a=0.14-0.08(0.5)^2-0.06(0.5)^4=0.1163$ — the measurement is 1.4 % higher. Eq. (9.31):
        $\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})=0.0800$, while the measurement gives $4.17\times10^{-4}/[(0.05)(0.100)]=0.0833$ — 4 % higher.`,
      },
    ],
    answer: md`$\tau_w=10.0$ Pa, $\tau^t_{rz}=-5.0$ Pa; $\nu_{\mathrm T}=4.17\times10^{-4}$ m²/s, $\ell=5.89$ mm ($\ell/a=0.118$) — within a few per cent of (9.29) and (9.31).`,
    insight: 'The pressure drop alone fixes the stress everywhere; one velocity-gradient reading then pins down both ν_T and ℓ at that radius.',
  },
  {
    id: 'ex-near-wall',
    concept: 'determination',
    title: 'Close to the wall: ℓ, ν_T and a stress check at y/a = 0.1',
    difficulty: 3,
    given: md`Same pipe and flow as the previous example: $a=0.05$ m, $\tau_w=10.0$ Pa, $\sqrt{\tau_w/\rho}=0.100$ m/s, water ($\nu=1.0\times10^{-6}$ m²/s).
    Point at $y=5$ mm from the wall ($y/a=0.1$).`,
    find: md`$\ell$ from (9.29) and from $\ell=0.4y$; $\nu_{\mathrm T}$ from (9.31); the velocity gradient implied by (9.32); a check of the turbulent stress against (9.27).`,
    steps: [
      {
        title: 'Mixing length',
        md: md`$1-y/a=0.9$: $\ell/a=0.14-0.08(0.81)-0.06(0.6561)=0.14-0.0648-0.0394=0.0358$, so $\ell=1.792$ mm. The tangent estimate $0.4y=2.0$ mm is
        already about 12 % too high at $y/a=0.1$.`,
      },
      {
        title: 'Eddy viscosity, Eq. (9.31)',
        md: md`$\dfrac{\nu_{\mathrm T}}{a\sqrt{\tau_w/\rho}}=0.4070(0.1)-0.7012(0.01)+0.4505(0.001)-0.1437(10^{-5})=0.03414$, so
        $\nu_{\mathrm T}=0.03414(0.05)(0.100)=1.707\times10^{-4}$ m²/s $\approx171\,\nu$.`,
      },
      { title: 'Velocity gradient from (9.32)', md: md`$\lvert d\overline{v}_z/dy\rvert=\nu_{\mathrm T}/\ell^2=1.707\times10^{-4}/(1.792\times10^{-3})^2=53.2$ s⁻¹.` },
      {
        title: 'Stress check',
        md: md`$\tau^t=\rho\,\nu_{\mathrm T}\lvert d\overline{v}_z/dy\rvert=(1000)(1.707\times10^{-4})(53.2)=9.08$ Pa, versus $\tau_w(1-y/a)=10.0(0.9)=9.0$ Pa from (9.27) —
        agreement within 1 %.`,
      },
      {
        title: 'Is the mixing-length picture valid here?',
        md: md`$y^+=y\sqrt{\tau_w/\rho}/\nu=(0.005)(0.100)/(1.0\times10^{-6})=500$ — far beyond the laminar sublayer and buffer region ($y^+<30$, Wilkes p. 497),
        so neglecting the viscous stress is justified.`,
      },
    ],
    answer: md`$\ell=1.79$ mm (vs 2.0 mm from $0.4y$), $\nu_{\mathrm T}=1.71\times10^{-4}$ m²/s, $\lvert d\overline{v}_z/dy\rvert\approx53$ s⁻¹, $\tau^t\approx9.1$ Pa
    $\approx\tau_w(1-y/a)=9.0$ Pa.`,
    insight: 'Nikuradse’s two correlations and the linear stress law are mutually consistent; ℓ = 0.4y is a good approximation only very close to the wall.',
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Practice                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

const M2S = md`\mathrm{m^2/s}`

export const practice: PracticeDef[] = [
  // ---------- eddy-viscosity ----------
  {
    id: 'pr-nut-from-stress',
    concept: 'eddy-viscosity',
    difficulty: 1,
    q: md`At a point in turbulent water flow ($\rho=1000$ kg/m³, $\mu=1.0\times10^{-3}$ Pa·s) the Reynolds stress is $\tau^t_{yx}=12$ Pa where
    $d\overline{v}_x/dy=30$ s⁻¹. Find (a) the eddy kinematic viscosity, (b) $\nu_{\mathrm T}/\nu$, (c) the viscous stress at the same point.`,
    hint: md`Invert $\tau^t_{yx}=\rho\,\nu_{\mathrm T}\,d\overline{v}_x/dy$ (Table 9.1, momentum row).`,
    answer: md`(a) $\nu_{\mathrm T}=4.0\times10^{-4}$ m²/s; (b) 400; (c) $\tau^\ell_{yx}=0.030$ Pa.`,
    solution: md`(a) $\nu_{\mathrm T}=\dfrac{\tau^t_{yx}}{\rho\,d\overline{v}_x/dy}=\dfrac{12}{(1000)(30)}=4.0\times10^{-4}$ m²/s.

    (b) $\nu=\mu/\rho=1.0\times10^{-6}$ m²/s, so $\nu_{\mathrm T}/\nu=4.0\times10^{-4}/1.0\times10^{-6}=400$.

    (c) $\tau^\ell_{yx}=\mu\,d\overline{v}_x/dy=(1.0\times10^{-3})(30)=0.030$ Pa — 400 times smaller than the turbulent stress, which is why the viscous
    stress can be neglected away from walls.`,
    check: [
      { label: md`$\nu_{\mathrm T}$`, value: 4.0e-4, units: M2S },
      { label: md`$\nu_{\mathrm T}/\nu$`, value: 400 },
    ],
  },
  {
    id: 'pr-six-eddies',
    concept: 'eddy-viscosity',
    difficulty: 2,
    q: md`Six equally weighted eddies cross plane X–X in water ($\rho=1000$ kg/m³) where $\overline{v}_x=1.5$ m/s and $d\overline{v}_x/dy=10$ s⁻¹. Three come
    up from below with $(\lambda,\ v_y')=(4\text{ mm},\ 0.05\text{ m/s})$, $(8\text{ mm},\ 0.12\text{ m/s})$ and $(12\text{ mm},\ 0.09\text{ m/s})$; the other
    three are their mirror images coming down from above (both signs reversed). Find $\nu_{\mathrm T}$, the averaged momentum flux $\overline{\dot{\mathcal{M}}}$
    and $\tau^t_{yx}$.`,
    hint: md`A mirror-image pair has the same product $v_y'\lambda$, and the pairs make $\overline{v_y'}=0$.`,
    answer: md`$\nu_{\mathrm T}=7.47\times10^{-4}$ m²/s, $\overline{\dot{\mathcal{M}}}=-7.47$ Pa, $\tau^t_{yx}=+7.47$ Pa.`,
    solution: md`Products $v_y'\lambda$ (equal for both members of a pair): $(0.05)(0.004)=2.0\times10^{-4}$, $(0.12)(0.008)=9.6\times10^{-4}$,
    $(0.09)(0.012)=1.08\times10^{-3}$ m²/s. Each value appears twice among the six eddies:

    $$\nu_{\mathrm T}=\frac{2\,(2.0\times10^{-4}+9.6\times10^{-4}+1.08\times10^{-3})}{6}=7.47\times10^{-4}\ \mathrm{m^2/s}$$

    With $\overline{v_y'}=0$, (9.19) gives $\overline{\dot{\mathcal{M}}}=-\nu_{\mathrm T}\rho\,d\overline{v}_x/dy=-(7.47\times10^{-4})(1000)(10)=-7.47$ Pa.

    Brute-force check with (9.17): the first pair gives $(0.05)(1000)(1.5-0.04)+(-0.05)(1000)(1.5+0.04)=73.0-77.0=-4.0$ Pa, the second
    $170.4-189.6=-19.2$ Pa, the third $124.2-145.8=-21.6$ Pa. Sum $-44.8$ Pa, and $-44.8/6=-7.47$ Pa ✓. Finally $\tau^t_{yx}=-\overline{\dot{\mathcal{M}}}=+7.47$ Pa.`,
    check: [
      { label: md`$\nu_{\mathrm T}$`, value: 7.4667e-4, units: M2S },
      { label: md`$\overline{\dot{\mathcal{M}}}$`, value: -7.4667, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'pr-downward-eddy',
    concept: 'eddy-viscosity',
    difficulty: 2,
    q: md`An eddy comes **down** from plane A–A to X–X: $\lambda=-5$ mm, $v_y'=-0.08$ m/s. At X–X, $\overline{v}_x=1.2$ m/s and $d\overline{v}_x/dy=20$ s⁻¹;
    $\rho=1000$ kg/m³. (a) What x-velocity does the eddy bring? (b) Evaluate its $\dot{\mathcal{M}}$ from (9.17). (c) Evaluate $v_y'\lambda$ and comment on its sign.`,
    hint: md`Use $\overline{v}_x-\lambda\,d\overline{v}_x/dy$ with the negative $\lambda$ — do not drop the sign.`,
    answer: md`(a) 1.30 m/s; (b) $\dot{\mathcal{M}}=-104$ Pa; (c) $v_y'\lambda=+4.0\times10^{-4}$ m²/s (positive).`,
    solution: md`(a) $\overline{v}_x-\lambda\,d\overline{v}_x/dy=1.2-(-0.005)(20)=1.2+0.10=1.30$ m/s — faster than the local mean, as expected for fluid from above.

    (b) $\dot{\mathcal{M}}=v_y'\,\rho\big(\overline{v}_x-\lambda\,d\overline{v}_x/dy\big)=(-0.08)(1000)(1.30)=-104$ Pa: x momentum is carried **downward**.

    (c) $v_y'\lambda=(-0.08)(-0.005)=+4.0\times10^{-4}$ m²/s. The product is positive for *every* eddy because $v_y'$ and $\lambda$ always share a sign —
    so $\nu_{\mathrm T}=\overline{v_y'\lambda}$ can only be positive.`,
    check: [
      { label: md`$\dot{\mathcal{M}}$`, value: -104, units: md`\mathrm{Pa}` },
      { label: md`$v_y'\lambda$`, value: 4.0e-4, units: M2S },
    ],
  },

  // ---------- prandtl-mixing-length ----------
  {
    id: 'pr-ell-constants',
    concept: 'prandtl-mixing-length',
    difficulty: 1,
    q: md`The eddy statistics at a point are $\widetilde{\lambda}=8$ mm, $R=0.5$, $\alpha=1.0$, $\beta=0.8$. (a) Find the Prandtl mixing length.
    (b) Find $\nu_{\mathrm T}$ where $d\overline{v}_x/dy=20$ s⁻¹.`,
    hint: md`Eq. (9.25), then Eq. (9.26).`,
    answer: md`(a) $\ell=5.06$ mm; (b) $\nu_{\mathrm T}=5.12\times10^{-4}$ m²/s.`,
    solution: md`(a) $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}=8\sqrt{(0.5)(1.0)(0.8)}=8\sqrt{0.40}=8(0.6325)=5.06$ mm.

    (b) $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert=(5.06\times10^{-3})^2(20)=(2.56\times10^{-5})(20)=5.12\times10^{-4}$ m²/s.

    Note that $\ell<\widetilde{\lambda}$ here because $R\alpha\beta<1$.`,
    check: [
      { label: md`$\ell$`, value: 5.06, units: md`\mathrm{mm}` },
      { label: md`$\nu_{\mathrm T}$`, value: 5.12e-4, units: M2S },
    ],
  },
  {
    id: 'pr-double-gradient',
    concept: 'prandtl-mixing-length',
    difficulty: 1,
    q: md`With a mixing length $\ell=5$ mm in water ($\rho=1000$ kg/m³, $\mu=1.0\times10^{-3}$ Pa·s), compute $\nu_{\mathrm T}$, $\tau^t_{yx}$ and the viscous
    stress for $d\overline{v}_x/dy=20$ s⁻¹ and for $40$ s⁻¹. By what factor does each change?`,
    hint: md`$\nu_{\mathrm T}\propto\lvert d\overline{v}_x/dy\rvert$, $\tau^t_{yx}\propto\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$.`,
    answer: md`At 20 s⁻¹: $5.0\times10^{-4}$ m²/s, 10 Pa, 0.020 Pa. At 40 s⁻¹: $1.0\times10^{-3}$ m²/s, 40 Pa, 0.040 Pa. Factors ×2, ×4, ×2.`,
    solution: md`At 20 s⁻¹: $\nu_{\mathrm T}=(0.005)^2(20)=5.0\times10^{-4}$ m²/s; $\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy=(1000)(5.0\times10^{-4})(20)=10$ Pa;
    $\tau^\ell_{yx}=\mu\,d\overline{v}_x/dy=0.020$ Pa.

    At 40 s⁻¹: $\nu_{\mathrm T}=(0.005)^2(40)=1.0\times10^{-3}$ m²/s; $\tau^t_{yx}=(1000)(1.0\times10^{-3})(40)=40$ Pa; $\tau^\ell_{yx}=0.040$ Pa.

    So $\nu_{\mathrm T}$ doubles, the turbulent stress **quadruples** and the viscous stress doubles — the ratio $\tau^t/\tau^\ell=\nu_{\mathrm T}/\nu$ grows from 500 to 1000.`,
    check: [
      { label: md`$\tau^t_{yx}$ at 40 s⁻¹`, value: 40, units: md`\mathrm{Pa}` },
      { label: md`$\nu_{\mathrm T}$ at 40 s⁻¹`, value: 1.0e-3, units: M2S },
    ],
  },
  {
    id: 'pr-isotropic',
    concept: 'prandtl-mixing-length',
    difficulty: 2,
    q: md`In a region of **isotropic** turbulence a hot-wire probe gives $\widetilde{v_x'}=0.12$ m/s where $d\overline{v}_x/dy=15$ s⁻¹. Take $\alpha=1$ and
    $R=0.6$. Find (a) the RMS travel distance $\widetilde{\lambda}$, (b) $\widetilde{v_y'}$, (c) $\nu_{\mathrm T}$ from (9.20), (d) $\ell$, and check (9.26).`,
    hint: md`Isotropic means $\beta=1$. Start from (9.22).`,
    answer: md`(a) 8.0 mm; (b) 0.12 m/s; (c) $5.76\times10^{-4}$ m²/s; (d) $\ell=6.20$ mm and $\ell^2\lvert d\overline{v}_x/dy\rvert=5.76\times10^{-4}$ m²/s ✓.`,
    solution: md`(a) From (9.22): $\widetilde{\lambda}=\widetilde{v_x'}/(\alpha\lvert d\overline{v}_x/dy\rvert)=0.12/[(1)(15)]=0.0080$ m $=8.0$ mm.

    (b) Isotropic turbulence: $\beta=1$, so $\widetilde{v_y'}=\widetilde{v_x'}=0.12$ m/s (9.23).

    (c) $\nu_{\mathrm T}=R\,\widetilde{v_y'}\,\widetilde{\lambda}=(0.6)(0.12)(0.0080)=5.76\times10^{-4}$ m²/s.

    (d) $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}=8.0\sqrt{0.6}=8.0(0.7746)=6.20$ mm. Check: $\ell^2\lvert d\overline{v}_x/dy\rvert=(6.197\times10^{-3})^2(15)=5.76\times10^{-4}$ m²/s ✓.`,
    check: [
      { label: md`$\widetilde{\lambda}$`, value: 8.0, units: md`\mathrm{mm}` },
      { label: md`$\ell$`, value: 6.197, units: md`\mathrm{mm}` },
      { label: md`$\nu_{\mathrm T}$`, value: 5.76e-4, units: M2S },
    ],
  },

  // ---------- transport-analogies ----------
  {
    id: 'pr-heat-air',
    concept: 'transport-analogies',
    difficulty: 1,
    q: md`Air ($\rho=1.2$ kg/m³, $c_p=1005$ J/(kg·K)) flows over a heated floor. At a point in the turbulent layer $\nu_{\mathrm T}=5\times10^{-3}$ m²/s and
    $\partial\overline{T}/\partial y=-50$ K/m ($y$ upward). Find the turbulent heat flux and its direction.`,
    hint: md`Table 9.1, heat row — heat flux is counted positive in $+y$.`,
    answer: md`$q^t=+301.5$ W/m² (about 0.30 kW/m²), upward.`,
    solution: md`$q^t=-\rho c_p\nu_{\mathrm T}\,\dfrac{\partial\overline{T}}{\partial y}=-(1.2)(1005)(5\times10^{-3})(-50)=+301.5$ W/m².

    Positive means $+y$, i.e. upward — down the temperature gradient, from the warm floor into the cooler air. No extra minus sign is needed because heat
    transfer is conventionally counted in the $+y$ direction (unlike the shear stress).`,
    check: [{ label: md`$q^t$`, value: 301.5, units: md`\mathrm{W/m^2}` }],
  },
  {
    id: 'pr-mass-water',
    concept: 'transport-analogies',
    difficulty: 2,
    q: md`In a turbulent water stream the mixing length is $\ell=3$ mm and $\lvert d\overline{v}_x/dy\rvert=40$ s⁻¹. A dissolved species has
    $\partial\overline{c}/\partial y=+0.8$ kmol/m⁴ and molecular diffusivity $\mathcal{D}=1.0\times10^{-9}$ m²/s. Find (a) $\nu_{\mathrm T}$, (b) the turbulent flux
    $N^t$ (sign and direction), (c) the ratio of turbulent to molecular flux.`,
    hint: md`$N^t=-\ell^2\,\dfrac{\partial\overline{c}}{\partial y}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$; molecular flux $-\mathcal{D}\,\partial c/\partial y$.`,
    answer: md`(a) $3.6\times10^{-4}$ m²/s; (b) $N^t=-2.88\times10^{-4}$ kmol/(m²·s), i.e. downward; (c) $3.6\times10^{5}$.`,
    solution: md`(a) $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert=(0.003)^2(40)=9.0\times10^{-6}(40)=3.6\times10^{-4}$ m²/s.

    (b) $N^t=-\nu_{\mathrm T}\,\partial\overline{c}/\partial y=-(3.6\times10^{-4})(0.8)=-2.88\times10^{-4}$ kmol/(m²·s). Negative means $-y$: the species moves
    downward, toward lower concentration.

    (c) Molecular flux $-\mathcal{D}\,\partial c/\partial y=-(1.0\times10^{-9})(0.8)=-8.0\times10^{-10}$ kmol/(m²·s); ratio $=\nu_{\mathrm T}/\mathcal{D}=3.6\times10^{5}$ (with
    $\mathcal{D}_T=\nu_{\mathrm T}$, the first approximation of Table 9.1). In liquids, turbulence dominates mass transfer overwhelmingly.`,
    check: [
      { label: md`$N^t$`, value: -2.88e-4, units: md`\mathrm{kmol/(m^2\,s)}` },
      { label: 'turbulent / molecular', value: 3.6e5 },
    ],
  },
  {
    id: 'pr-heat-water-sign',
    concept: 'transport-analogies',
    difficulty: 2,
    q: md`Near the top wall of a channel the water velocity *decreases* upward, $d\overline{v}_x/dy=-20$ s⁻¹, and $\ell=5$ mm. The temperature *increases*
    upward with $\partial\overline{T}/\partial y=+100$ K/m. Take $\rho=1000$ kg/m³ and $c_p=4180$ J/(kg·K). Find $\nu_{\mathrm T}$, $\tau^t_{yx}$, the direction of
    turbulent x-momentum transport, and $q^t$.`,
    hint: md`$\nu_{\mathrm T}$ uses $\lvert d\overline{v}_x/dy\rvert$; the stress uses the signed gradient.`,
    answer: md`$\nu_{\mathrm T}=5.0\times10^{-4}$ m²/s; $\tau^t_{yx}=-10$ Pa, so the momentum flux $-\tau^t_{yx}=+10$ Pa is **upward**; $q^t=-2.09\times10^{5}$ W/m² (downward).`,
    solution: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert=(0.005)^2(20)=5.0\times10^{-4}$ m²/s — positive whatever the sign of the gradient.

    $\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy=(1000)(5.0\times10^{-4})(-20)=-10$ Pa. The upward momentum flux is $\overline{N}^{\,t}=-\tau^t_{yx}=+10$ Pa: x momentum
    moves up, from the fast fluid below toward the slow wall region.

    $q^t=-\rho c_p\nu_{\mathrm T}\,\partial\overline{T}/\partial y=-(1000)(4180)(5.0\times10^{-4})(100)=-2.09\times10^{5}$ W/m²: heat moves down, from the warm wall into
    the cooler core. The velocity gradient's sign changes $\tau^t_{yx}$ but not $q^t$.`,
    check: [
      { label: md`$\tau^t_{yx}$`, value: -10, units: md`\mathrm{Pa}` },
      { label: md`$q^t$`, value: -2.09e5, units: md`\mathrm{W/m^2}` },
    ],
  },

  // ---------- determination ----------
  {
    id: 'pr-wall-stress',
    concept: 'determination',
    difficulty: 1,
    q: md`Water ($\rho=1000$ kg/m³) flows through a pipe of diameter $D=0.06$ m; the pressure falls by $1.2$ kPa over $2.0$ m. Find (a) $dp/dz$,
    (b) $\tau_w$, (c) the friction velocity $\sqrt{\tau_w/\rho}$, (d) the magnitude of the turbulent shear stress at $r=0.01$ m (viscous stress neglected).`,
    hint: md`Apply (9.27) at $r$ and at the wall $r=a$.`,
    answer: md`(a) $-600$ Pa/m; (b) 9.0 Pa; (c) 0.0949 m/s; (d) 3.0 Pa.`,
    solution: md`(a) $dp/dz=-\Delta p/L=-1200/2.0=-600$ Pa/m.

    (b) $\tau_w=\dfrac{a}{2}\Big(-\dfrac{dp}{dz}\Big)=\dfrac{0.03}{2}(600)=9.0$ Pa (Eq. 9.82).

    (c) $\sqrt{\tau_w/\rho}=\sqrt{9.0/1000}=0.0949$ m/s.

    (d) $\tau^t_{rz}=\dfrac{r}{2}\dfrac{dp}{dz}=\dfrac{0.01}{2}(-600)=-3.0$ Pa, magnitude 3.0 Pa — equal to $\tau_w\,r/a=9.0\times\tfrac13$ ✓.`,
    check: [
      { label: md`$\tau_w$`, value: 9.0, units: md`\mathrm{Pa}` },
      { label: md`$\sqrt{\tau_w/\rho}$`, value: 0.09487, units: md`\mathrm{m/s}` },
      { label: md`$\lvert\tau^t_{rz}\rvert$`, value: 3.0, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'pr-ell-quarter',
    concept: 'determination',
    difficulty: 1,
    q: md`A pipe has radius $a=50$ mm. Using Nikuradse's correlation (9.29), find the mixing length at $y/a=0.25$ and on the centreline, and compare the first
    value with the near-wall estimate $\ell=0.4y$.`,
    hint: md`$1-y/a=0.75$; $(0.75)^2=0.5625$, $(0.75)^4=0.3164$.`,
    answer: md`$\ell=3.80$ mm at $y/a=0.25$ (vs $0.4y=5.0$ mm, about 24 % lower); $\ell=7.0$ mm on the centreline.`,
    solution: md`$\ell/a=0.14-0.08(0.5625)-0.06(0.3164)=0.14-0.0450-0.0190=0.0760$, so $\ell=0.0760\times50=3.80$ mm.

    With $y=12.5$ mm the tangent line gives $0.4y=5.0$ mm: (9.29) is 24 % lower — $\ell=0.4y$ holds only very close to the wall.

    On the centreline ($y/a=1$) both brackets vanish: $\ell/a=0.14$, so $\ell=7.0$ mm, the largest value anywhere in the pipe.`,
    check: [
      { label: md`$\ell$ at $y/a=0.25$`, value: 3.80, units: md`\mathrm{mm}` },
      { label: md`$\ell$ on the centreline`, value: 7.0, units: md`\mathrm{mm}` },
    ],
  },
  {
    id: 'pr-nut-re1e5',
    concept: 'determination',
    difficulty: 3,
    q: md`Water ($\rho=1000$ kg/m³, $\nu=1.0\times10^{-6}$ m²/s) flows at $\Rey=10^5$ through a smooth pipe of diameter $D=0.05$ m. (a) Find $f_F$ from (9.53).
    (b) Find $\overline{v}_{zm}$, $\tau_w$ and $\sqrt{\tau_w/\rho}$. (c) Using (9.31), find the maximum eddy viscosity and the centreline eddy viscosity, each
    also as a multiple of $\nu$.`,
    hint: md`Iterate $x\leftarrow1.74\ln(\Rey/x)-0.391$ with $x=1/\sqrt{f_F}$, starting from $x=15$. The maximum of (9.31) is 0.0800 near $y/a=0.5$; its centreline value is 0.0126.`,
    answer: md`(a) $f_F=0.00448$; (b) $\overline{v}_{zm}=2.0$ m/s, $\tau_w=8.96$ Pa, $\sqrt{\tau_w/\rho}=0.0947$ m/s; (c) $\nu_{\mathrm{T,max}}=1.89\times10^{-4}$ m²/s
    $\approx189\,\nu$; centreline $2.98\times10^{-5}$ m²/s $\approx30\,\nu$.`,
    solution: md`(a) $x_0=15\to x_1=1.74\ln(10^5/15)-0.391=14.929\to x_2=14.938\to x_3=14.937$; $f_F=1/14.937^2=0.00448$.

    (b) $\overline{v}_{zm}=\Rey\,\nu/D=(10^5)(1.0\times10^{-6})/0.05=2.0$ m/s; $\tau_w=\tfrac12 f_F\rho\overline{v}_{zm}^2=\tfrac12(0.00448)(1000)(2.0)^2=8.96$ Pa;
    $\sqrt{\tau_w/\rho}=\sqrt{8.96\times10^{-3}}=0.0947$ m/s.

    (c) $a=0.025$ m, so $a\sqrt{\tau_w/\rho}=(0.025)(0.0947)=2.37\times10^{-3}$ m²/s.
    $\nu_{\mathrm{T,max}}=0.0800(2.37\times10^{-3})=1.89\times10^{-4}$ m²/s $=189\,\nu$. Centreline: $0.0126(2.37\times10^{-3})=2.98\times10^{-5}$ m²/s $\approx30\,\nu$.`,
    check: [
      { label: md`$f_F$`, value: 0.00448 },
      { label: md`$\tau_w$`, value: 8.96, units: md`\mathrm{Pa}` },
      { label: md`$\nu_{\mathrm{T,max}}$`, value: 1.89e-4, units: M2S },
    ],
  },
  {
    id: 'pr-consistency',
    concept: 'determination',
    difficulty: 3,
    q: md`At mid-radius ($y/a=0.5$) of a smooth pipe, take $\ell$ from (9.29) and $\nu_{\mathrm T}$ from (9.31). (a) Use (9.32) to find the mean velocity gradient in
    units of $\sqrt{\tau_w/\rho}/a$. (b) Then find $\tau^t/\tau_w$ from (9.28) and compare it with the linear stress distribution (9.27).`,
    hint: md`$\ell/a=0.11625$ and $\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})=0.08002$ at $y/a=0.5$.`,
    answer: md`(a) $\lvert d\overline{v}_z/dy\rvert=5.92\,\sqrt{\tau_w/\rho}/a$; (b) $\tau^t/\tau_w=0.474$, versus 0.5 from (9.27) — about 5 % apart.`,
    solution: md`(a) From (9.32), $\lvert d\overline{v}_z/dy\rvert=\nu_{\mathrm T}/\ell^2=\dfrac{0.08002\,a\sqrt{\tau_w/\rho}}{(0.11625)^2a^2}=\dfrac{0.08002}{0.013514}\,\dfrac{\sqrt{\tau_w/\rho}}{a}=5.92\,\dfrac{\sqrt{\tau_w/\rho}}{a}$.

    (b) $\tau^t=\rho\,\nu_{\mathrm T}\lvert d\overline{v}_z/dy\rvert=\rho\,(0.08002\,a\sqrt{\tau_w/\rho})\Big(5.92\dfrac{\sqrt{\tau_w/\rho}}{a}\Big)=0.474\,\rho\,\dfrac{\tau_w}{\rho}=0.474\,\tau_w$.

    The linear distribution gives $\tau/\tau_w=r/a=1-y/a=0.5$. Two independently fitted correlations reproduce the force balance to within about 5 % — a good
    consistency check on Nikuradse's data.`,
    check: [
      { label: md`gradient in units of $\sqrt{\tau_w/\rho}/a$`, value: 5.92 },
      { label: md`$\tau^t/\tau_w$`, value: 0.474 },
    ],
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Quiz                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

export const quiz: QuizQ[] = [
  // eddy-viscosity
  {
    id: 'q-ev-1',
    concept: 'eddy-viscosity',
    difficulty: 1,
    src: W('488'),
    q: md`In Wilkes' eddy model (Fig. 9.5), what are the signs of $\lambda$ and $v_y'$ for an eddy that reaches X–X from plane B–B below?`,
    options: [md`$\lambda>0$ and $v_y'>0$`, md`$\lambda>0$ and $v_y'<0$`, md`$\lambda<0$ and $v_y'>0$`, md`both zero, because $\overline{v}_y=0$`],
    answer: 0,
    explain: md`Both are positive for an eddy coming up from B–B and both negative for one coming down from A–A — they always share a sign, which is why
    one equation (9.17) covers both directions and why $v_y'\lambda\ge0$. $\overline{v}_y=0$ is a statement about the *mean*, not about individual eddies.`,
  },
  {
    id: 'q-ev-2',
    concept: 'eddy-viscosity',
    difficulty: 1,
    src: W('489'),
    q: md`Why does the first term on the right of (9.18), $\overline{v_y'}\,\rho\overline{v}_x$, drop out?`,
    options: [
      md`$\overline{v_y'}=0$ by the definition of a fluctuation`,
      md`$\overline{v}_x=0$ on the plane X–X`,
      md`the gradient $d(\rho\overline{v}_x)/dy$ is constant`,
      md`$\rho$ is constant in incompressible flow`,
    ],
    answer: 0,
    explain: md`The time average of any fluctuation is zero (Eq. 9.2). $\overline{v}_x$ is the mean velocity at X–X and is not zero; the constant-gradient
    assumption is a *different* step — it lets the gradient leave the average in the second term.`,
  },
  {
    id: 'q-ev-3',
    concept: 'eddy-viscosity',
    difficulty: 2,
    q: md`Which statement about the eddy kinematic viscosity $\nu_{\mathrm T}$ is correct?`,
    options: [
      md`It describes the turbulence, so it varies with position and flow conditions — it is not a fluid property`,
      md`It is a fluid property, like $\nu$, that can be read from property tables`,
      md`It equals the molecular $\nu$ once the flow becomes turbulent`,
      md`It is negative wherever $d\overline{v}_x/dy<0$`,
    ],
    answer: 0,
    explain: md`$\nu_{\mathrm T}=\overline{v_y'\lambda}$ is built from eddy motions, so it changes from point to point (Fig. 9.8 shows it across a pipe) and is
    usually much larger than $\nu$. It is never negative, because $v_y'$ and $\lambda$ always have the same sign; it is the *stress* that takes the sign of the gradient.`,
  },
  {
    id: 'q-ev-4',
    concept: 'eddy-viscosity',
    difficulty: 2,
    q: md`At a point in turbulent water flow ($\rho=1000$ kg/m³) $\tau^t_{yx}=6$ Pa and $d\overline{v}_x/dy=20$ s⁻¹. What is $\nu_{\mathrm T}$?`,
    options: [md`$3.0\times10^{-4}$ m²/s`, md`$0.30$ m²/s`, md`$120$ m²/s`, md`$3.0\times10^{-7}$ m²/s`],
    answer: 0,
    explain: md`$\nu_{\mathrm T}=\tau^t_{yx}/(\rho\,d\overline{v}_x/dy)=6/[(1000)(20)]=3.0\times10^{-4}$ m²/s. Forgetting $\rho$ gives 0.30 m²/s (that would be a
    *dynamic* eddy viscosity in Pa·s); multiplying instead of dividing gives 120.`,
  },
  // prandtl-mixing-length
  {
    id: 'q-pm-1',
    concept: 'prandtl-mixing-length',
    difficulty: 1,
    src: W('489'),
    q: md`What is the value of $\beta$ in (9.23) for isotropic turbulence?`,
    options: ['1', '0', md`$\sqrt{R\alpha}$`, '0.4'],
    answer: 0,
    explain: md`Isotropic turbulence has the same intensity in all directions, so $\widetilde{v_y'}=\widetilde{v_x'}$ and $\beta=1$. The number 0.4 belongs to
    the near-wall mixing length $\ell=0.4y$, which is unrelated.`,
  },
  {
    id: 'q-pm-2',
    concept: 'prandtl-mixing-length',
    difficulty: 2,
    src: W('490'),
    q: md`What is the physical consequence of the absolute value in $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$ (9.26)?`,
    options: [
      md`$\nu_{\mathrm T}$ is never negative, so $\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy$ always has the sign of the gradient — momentum flows from fast to slow fluid`,
      md`the turbulent stress is always positive, whatever the gradient`,
      md`$\nu_{\mathrm T}$ changes sign where the velocity profile has a maximum`,
      md`it makes $\nu_{\mathrm T}$ twice as large as in laminar flow`,
    ],
    answer: 0,
    explain: md`The absolute value comes from the RMS step (9.22)–(9.23): RMS values are never negative. As a result $\nu_{\mathrm T}\ge0$ and
    $\tau^t_{yx}=\rho\ell^2\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$ changes sign *with* the gradient — the stress is not always positive.`,
  },
  {
    id: 'q-pm-3',
    concept: 'prandtl-mixing-length',
    difficulty: 1,
    q: md`At a fixed mixing length, the mean velocity gradient doubles. The turbulent shear stress…`,
    options: ['quadruples', 'doubles', 'stays the same', 'halves'],
    answer: 0,
    explain: md`$\tau^t_{yx}=\rho\ell^2\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$ is quadratic in the gradient: one factor from $\nu_{\mathrm T}$ (which doubles) and one
    from the gradient itself. "Doubles" is what happens to $\nu_{\mathrm T}$ — and to a *laminar* stress.`,
  },
  {
    id: 'q-pm-4',
    concept: 'prandtl-mixing-length',
    difficulty: 2,
    src: W('490'),
    q: md`Which statement about the Prandtl mixing length $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$ is correct?`,
    options: [
      md`It lumps the RMS eddy travel distance and the constants $R$, $\alpha$, $\beta$ into one length that has to be found from experiment`,
      md`It is the exact distance that every eddy travels before mixing`,
      md`It is a property of the fluid, like the mean free path of its molecules`,
      md`It has the same value at every point of a pipe`,
    ],
    answer: 0,
    explain: md`Individual eddies travel different distances ($\widetilde{\lambda}$ is only an RMS value) and $R$, $\alpha$, $\beta$ are not known separately, so $\ell$
    is measured. It varies with position — from $0.4y$ near a pipe wall to $0.14a$ on the centreline (Fig. 9.7).`,
  },
  // transport-analogies
  {
    id: 'q-ta-1',
    concept: 'transport-analogies',
    difficulty: 2,
    src: W('490'),
    q: md`In Table 9.1 a minus sign precedes $\tau^t_{yx}$, but not $q^t$ or $N^t$. Why?`,
    options: [
      md`Shear stress conventionally denotes momentum transfer toward $-y$, whereas heat and mass fluxes are counted positive toward $+y$`,
      md`Momentum flows up its gradient while heat and mass flow down theirs`,
      md`$\tau^t_{yx}$ is always negative in turbulent flow`,
      md`Heat and mass are carried by molecules, momentum by eddies`,
    ],
    answer: 0,
    explain: md`It is purely a sign convention (§9.2): a positive $\tau^t_{yx}$ means x momentum moving toward $-y$, so the $+y$ flux is $-\tau^t_{yx}$.
    Physically all three quantities move *down* their gradients, carried by the same eddies.`,
  },
  {
    id: 'q-ta-2',
    concept: 'transport-analogies',
    difficulty: 1,
    src: W('490'),
    q: md`Table 9.1 assumes $\alpha_T=\mathcal{D}_T=\nu_{\mathrm T}$. This assumption is…`,
    options: [
      'only a first approximation (examined further in Section 9.13)',
      'exact for every fluid, because the same eddies are involved',
      'exact for gases but wrong for liquids',
      'required by the continuity equation',
    ],
    answer: 0,
    explain: md`Wilkes states it is true only as a first approximation. The same eddies do carry everything, but heat and species are not transported in
    exactly the same way as momentum (pressure fluctuations act on momentum only), so the turbulent Prandtl and Schmidt numbers are close to, not exactly, 1.`,
  },
  {
    id: 'q-ta-3',
    concept: 'transport-analogies',
    difficulty: 2,
    src: [W('490'), W('488')],
    q: md`Why are partial derivatives used for $\overline{T}$ and $\overline{c}$ in Table 9.1, while the velocity gradient is a total derivative?`,
    options: [
      md`$\overline{T}$ and $\overline{c}$ usually vary both across ($y$) and along the flow (heat exchangers, tubular reactors), whereas the velocity profile is assumed fully established`,
      'temperature and concentration are scalars while velocity is a vector',
      md`because $c_p$ varies with temperature`,
      md`a total derivative of $\overline{T}$ would include the eddy velocity $v_y'$`,
    ],
    answer: 0,
    explain: md`A fully established velocity profile depends on $y$ only, so $d\overline{v}_x/dy$ is a total derivative (p. 488). Temperature and concentration keep
    changing along a heat exchanger or reactor as well as across it, so only the $y$-part of their variation, $\partial/\partial y$, drives the transverse flux (p. 490).`,
  },
  {
    id: 'q-ta-4',
    concept: 'transport-analogies',
    difficulty: 2,
    q: md`In a turbulent layer $\partial\overline{T}/\partial y<0$ and $d\overline{v}_x/dy<0$. The turbulent heat flux $q^t$ is…`,
    options: [
      md`positive (toward $+y$): it runs down the temperature gradient, and the sign of $d\overline{v}_x/dy$ does not matter`,
      md`negative, because both gradients are negative`,
      'zero, because the two gradients cancel',
      md`positive only if $d\overline{v}_x/dy>0$`,
    ],
    answer: 0,
    explain: md`$q^t=-\rho c_p\ell^2\,\dfrac{\partial\overline{T}}{\partial y}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$: the velocity gradient enters only through its magnitude, so
    $\partial\overline{T}/\partial y<0$ gives $q^t>0$ regardless of the velocity gradient's sign.`,
  },
  // determination
  {
    id: 'q-det-1',
    concept: 'determination',
    difficulty: 1,
    src: W('492'),
    q: md`Close to a pipe wall, Nikuradse's mixing length (9.29) reduces to…`,
    options: [md`$\ell=0.4\,y$`, md`$\ell=0.14\,a$`, md`$\ell=0.4\,a$`, md`$\ell=0.14\,y$`],
    answer: 0,
    explain: md`Expanding (9.29) for small $y/a$ gives $\ell/a\approx0.40\,y/a$, the tangent line of Fig. 9.7 used in the Prandtl hypothesis. $0.14a$ is
    the *centreline* value, where $\ell$ is largest.`,
  },
  {
    id: 'q-det-2',
    concept: 'determination',
    difficulty: 2,
    src: [W('492'), W('493', 'Fig. 9.8')],
    q: md`According to (9.31) and Fig. 9.8, where is the eddy viscosity largest in a smooth pipe?`,
    options: [
      'about halfway between the wall and the centreline',
      'at the wall',
      'on the centreline, where the mixing length is largest',
      'it is uniform across the turbulent core',
    ],
    answer: 0,
    explain: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_z/dy\rvert$: $\ell$ grows away from the wall but the velocity gradient keeps falling, and past mid-radius the gradient
    wins. So $\nu_{\mathrm T}$ peaks (≈0.08 $a\sqrt{\tau_w/\rho}$) halfway to the centreline and falls — though not quite to zero — on the axis, even though $\ell$ is
    largest there.`,
  },
  {
    id: 'q-det-3',
    concept: 'determination',
    difficulty: 1,
    src: W('491'),
    q: md`In the §9.4 method, how is the turbulent shear stress at a given radius obtained?`,
    options: [
      md`From the measured pressure gradient, through the force balance $\tau^t_{rz}\doteq(r/2)(dp/dz)$`,
      'from the Pitot-tube velocity reading alone',
      'from the Hagen–Poiseuille law',
      md`from the mixing length given by (9.29)`,
    ],
    answer: 0,
    explain: md`A momentum balance on a coaxial cylinder (Fig. 9.6b) gives a linear stress distribution, so one pressure-drop measurement yields the stress at
    every radius. The Pitot tube supplies the *velocity gradient*; using (9.29) would be circular, since $\ell$ is what we want to measure.`,
  },
  {
    id: 'q-det-4',
    concept: 'determination',
    difficulty: 2,
    src: W('491'),
    q: md`The mixing-length correlation (9.29) was found to hold for…`,
    options: ['both smooth and rough pipes', 'smooth pipes only', 'rough pipes only', 'flow between parallel plates only'],
    answer: 0,
    explain: md`Wilkes stresses that (9.29) describes **both** smooth and rough pipes. It is the eddy-viscosity correlations (9.30)–(9.31) that come from
    Nikuradse's experiments in *smooth* pipes.`,
  },
  {
    id: 'q-det-5',
    concept: 'determination',
    difficulty: 3,
    src: W('491'),
    q: md`For flow between parallel plates, (9.27) reads $\tau^t_{yx}\doteq y\,(dp/dx)$. Where is $y$ measured from, and where is the stress largest?`,
    options: [
      'from the centreline; the stress is largest at the plates',
      'from the lower plate; the stress is largest on the centreline',
      'from the centreline; the stress is largest on the centreline',
      'from the lower plate; the stress is uniform',
    ],
    answer: 0,
    explain: md`In (9.27) $y$ is measured from the centreline, so the stress grows linearly from zero there to its maximum at the plates. Do not confuse this
    with the pipe correlations (9.29)–(9.31), where $y$ is the distance from the wall.`,
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Flashcards                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

export const flashcards: Flashcard[] = [
  {
    id: 'fc-nut-def',
    front: md`Define the eddy kinematic viscosity $\nu_{\mathrm T}$ (Wilkes Eq. 9.19).`,
    back: md`$\nu_{\mathrm T}\equiv\overline{v_y'\lambda}$ — the time average of (eddy y-velocity × distance travelled before mixing). Then
    $\overline{\dot{\mathcal{M}}}=-\nu_{\mathrm T}\,d(\rho\overline{v}_x)/dy$. Units m²/s.`,
    src: W('489'),
  },
  {
    id: 'fc-deficiency',
    front: 'What is the "velocity deficiency" in Fig. 9.5, and what does it cause?',
    back: md`$\lambda\,d\overline{v}_x/dy$: how much slower the fluid at B–B is than at X–X. An eddy jumping up carries it and gives a negative kick
    $v_x'=-\alpha\lambda\,d\overline{v}_x/dy$ at X–X.`,
    src: W('488–489'),
  },
  {
    id: 'fc-same-sign',
    front: md`Why do $v_y'$ and $\lambda$ always have the same sign, and why does it matter?`,
    back: md`An eddy from below ($\lambda>0$) must move up ($v_y'>0$); one from above has both negative. So $v_y'\lambda\ge0$ for every eddy, one equation
    covers both directions, and $\nu_{\mathrm T}>0$.`,
    src: W('488'),
  },
  {
    id: 'fc-prandtl',
    front: 'Prandtl mixing length: definition, author, year.',
    back: md`$\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$ (Eq. 9.25), from Prandtl's 1925 result (9.24). It lumps the RMS travel distance with $R$, $\alpha$, $\beta$.`,
    src: W('490'),
  },
  {
    id: 'fc-nut-ell',
    front: md`$\nu_{\mathrm T}$ and $\tau^t_{yx}$ in terms of $\ell$`,
    back: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$ (9.26); $\tau^t_{yx}=\rho\ell^2\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$ (Table 9.1) — quadratic in the gradient.`,
    src: W('490'),
  },
  {
    id: 'fc-r-alpha-beta',
    front: md`What do $R$, $\alpha$ and $\beta$ stand for in mixing-length theory?`,
    back: md`$R$: correlation coefficient in $\overline{v_y'\lambda}=R\widetilde{v_y'}\widetilde{\lambda}$ (9.20). $\alpha$: kick factor in $v_x'=-\alpha\lambda\,d\overline{v}_x/dy$ (9.21).
    $\beta=\widetilde{v_y'}/\widetilde{v_x'}$ (9.23), equal to 1 for isotropic turbulence.`,
    src: W('489'),
  },
  {
    id: 'fc-table-signs',
    front: 'Table 9.1: why is the momentum flux written as −τᵗ_yx but the heat flux as +qᵗ?',
    back: md`A shear stress denotes momentum transfer toward $-y$, so the $+y$ momentum flux is $-\tau^t_{yx}$. Heat and mass fluxes are counted toward $+y$, so $q^t$ and
    $N^t$ carry no minus sign.`,
    src: W('490'),
  },
  {
    id: 'fc-heat-mass',
    front: 'Table 9.1: heat and mass rows',
    back: md`$q^t=-\rho c_p\nu_{\mathrm T}\,\partial\overline{T}/\partial y$, $\;N^t=-\nu_{\mathrm T}\,\partial\overline{c}/\partial y$ — assuming $\alpha_T=\mathcal{D}_T=\nu_{\mathrm T}$, which is only a first approximation.`,
    src: W('490'),
  },
  {
    id: 'fc-stress-linear',
    front: 'Eq. (9.27): shear stress from a momentum balance',
    back: md`Plates: $\tau^t_{yx}\doteq y\,(dp/dx)$ with $y$ from the centreline. Pipe: $\tau^t_{rz}\doteq(r/2)(dp/dz)$. Linear in position; viscous stress neglected.
    At the wall, $\tau_w=(a/2)(-dp/dz)$.`,
    src: W('491'),
  },
  {
    id: 'fc-nikuradse-ell',
    front: 'Nikuradse mixing length (9.29): formula and limits',
    back: md`$\ell/a=0.14-0.08(1-y/a)^2-0.06(1-y/a)^4$, for smooth **and** rough pipes; $\ell\to0.4y$ at the wall, $\ell=0.14a$ on the centreline.`,
    src: W('491–492'),
  },
  {
    id: 'fc-fig98',
    front: md`Shape of $\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})$ across a smooth pipe (Fig. 9.8)`,
    back: md`Zero at the wall, maximum ≈ 0.08 about halfway to the centreline, then falling to ≈ 0.013 — not quite zero — on the axis. Approximately $0.32(y/a)(1-y/a)$ (9.30).`,
    src: W('492–493'),
  },
  {
    id: 'fc-measure',
    front: 'How are ν_T and ℓ measured in a pipe (§9.4)?',
    back: md`Pressure drop → stress at any radius (9.27). Pitot tube or laser-Doppler velocimetry → $d\overline{v}_z/dr$. Then (9.28):
    $\nu_{\mathrm T}=\tau^t/(\rho\,d\overline{v}_z/dr)$ and $\ell=\sqrt{\nu_{\mathrm T}/\lvert d\overline{v}_z/dr\rvert}$.`,
    src: W('491'),
  },
]

/* ------------------------------------------------------------------------------------------------ */
/*  Topic takeaways                                                                                 */
/* ------------------------------------------------------------------------------------------------ */

export const takeaways: string[] = [
  md`**Why a model?** No universal law predicts the Reynolds stress $\tau^t_{yx}=-\rho\overline{v_y'v_x'}$, so Wilkes (§9.3) uses a semi-theoretical eddy model calibrated by experiment.`,
  md`**Eddy picture:** eddies jump a distance $\lambda$ across X–X carrying the mean momentum of their origin plane, then mix. Averaging gives
  $\overline{\dot{\mathcal{M}}}=-\nu_{\mathrm T}\,d(\rho\overline{v}_x)/dy$ with $\nu_{\mathrm T}=\overline{v_y'\lambda}$ (9.19), i.e. $\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy$.`,
  md`**$\nu_{\mathrm T}$ is a flow property**, not a fluid property: always $\ge0$, it varies with position and is typically tens to thousands of times $\nu$ in pipe flow.`,
  md`**Prandtl (1925):** $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$, $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$ and $\tau^t_{yx}=\rho\ell^2\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$ — quadratic in the gradient, with its sign.`,
  md`**Sign rules:** $v_y'$ and $\lambda$ share a sign; the kick $v_x'=-\alpha\lambda\,d\overline{v}_x/dy$ makes $v_x'v_y'<0$ when $d\overline{v}_x/dy>0$; momentum flows from fast to slow fluid.`,
  md`**Table 9.1:** the same eddies carry heat and species — $q^t=-\rho c_p\nu_{\mathrm T}\,\partial\overline{T}/\partial y$, $N^t=-\nu_{\mathrm T}\,\partial\overline{c}/\partial y$ — assuming
  $\alpha_T=\mathcal{D}_T=\nu_{\mathrm T}$, which is only a first approximation.`,
  md`**Measuring (§9.4):** a pressure drop fixes the linear stress (9.27); a Pitot tube or LDV gives $d\overline{v}/dy$; (9.28) then yields $\nu_{\mathrm T}$ and $\ell$ at each position.`,
  md`**Nikuradse:** $\ell/a=0.14-0.08(1-y/a)^2-0.06(1-y/a)^4$ (smooth and rough pipes), $\ell\to0.4y$ at the wall — the basis of the Prandtl hypothesis $\ell=ky$ in the next topic.`,
  md`**Eddy viscosity in pipes:** $\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})\approx0.32(y/a)(1-y/a)$; the accurate fit (9.31) peaks at ≈0.08 near mid-radius and is still ≈0.013 on the axis.`,
  md`**Exam traps:** total vs partial derivatives; the absolute value in $\nu_{\mathrm T}$; $y$ from the centreline in (9.27) but from the wall in (9.29)–(9.31); $\ell\ne\lambda$; the $\alpha$ of (9.21) is not the thermal diffusivity.`,
]

/* ------------------------------------------------------------------------------------------------ */
/*  Static figures (recreated from the book)                                                        */
/* ------------------------------------------------------------------------------------------------ */

const ELL_MID = ellOverA(0.5)
const NU_MID = nuT31(0.5)
const GRAD_MID = NU_MID / (ELL_MID * ELL_MID)

function StressLawPlot() {
  return (
    <Plot
      height={260}
      x={{ label: md`$d\overline{v}_x/dy$ (s⁻¹)`, domain: [-40, 40] }}
      y={{ label: md`$\tau_{yx}/\rho$ (m²/s²)`, domain: [-0.11, 0.11] }}
      series={[
        { label: md`$\ell=2$ mm`, fn: (g) => 0.002 ** 2 * Math.abs(g) * g, color: 'var(--plot-2)' },
        { label: md`$\ell=5$ mm`, fn: (g) => 0.005 ** 2 * Math.abs(g) * g, color: 'var(--plot-1)' },
        { label: md`$\ell=8$ mm`, fn: (g) => 0.008 ** 2 * Math.abs(g) * g, color: 'var(--plot-6)' },
        { label: md`viscous, water: $\nu\,d\overline{v}_x/dy$`, fn: (g) => 1.0e-6 * g, color: 'var(--plot-3)', dash: '6 4' },
      ]}
      hlines={[{ y: 0, color: 'var(--axis)', dash: '2 3' }]}
    />
  )
}

function Fig97() {
  return (
    <Plot
      height={260}
      x={{ label: md`dimensionless distance from the wall, $y/a$`, domain: [0, 1] }}
      y={{ label: md`$\ell/a$`, domain: [0, 0.15] }}
      series={[
        { label: 'Eq. (9.29)', fn: ellOverA, color: 'var(--plot-1)', width: 2.6 },
        { label: md`$\ell=0.4y$`, fn: (x) => 0.4 * x, range: [0, 0.2], color: 'var(--plot-3)', dash: '6 4' },
      ]}
    />
  )
}

function Fig98() {
  return (
    <Plot
      height={260}
      x={{ label: md`dimensionless distance from the wall, $y/a$`, domain: [0, 1] }}
      y={{ label: md`$\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})$`, domain: [0, 0.085] }}
      series={[{ label: 'Eq. (9.31)', fn: nuT31, color: 'var(--plot-2)', width: 2.6 }]}
      marks={[
        { x: 0.497, y: nuT31(0.497), label: 'max ≈ 0.080', color: 'var(--plot-4)' },
        { x: 1, y: nuT31(1), label: '≈ 0.013', color: 'var(--plot-4)' },
      ]}
    />
  )
}

function WhyPeakPlot() {
  return (
    <Plot
      height={260}
      x={{ label: md`$y/a$`, domain: [0.05, 1] }}
      y={{ label: 'relative to the value at y/a = 0.5', domain: [0, 3] }}
      series={[
        { label: md`$\ell^2$ (from 9.29)`, fn: (x) => (ellOverA(x) / ELL_MID) ** 2, color: 'var(--plot-1)' },
        { label: md`$\lvert d\overline{v}_z/dy\rvert=\nu_{\mathrm T}/\ell^2$`, fn: (x) => nuT31(x) / ellOverA(x) ** 2 / GRAD_MID, color: 'var(--plot-3)', dash: '6 4' },
        { label: md`$\nu_{\mathrm T}$ (9.31) = product`, fn: (x) => nuT31(x) / NU_MID, color: 'var(--plot-2)', width: 2.8 },
      ]}
      hlines={[{ y: 1, color: 'var(--axis)', dash: '2 3' }]}
    />
  )
}

/* ------------------------------------------------------------------------------------------------ */
/*  Content                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

export default function Content() {
  return (
    <>
      {/* ============================== Concept 1 ============================== */}
      <Concept id="eddy-viscosity">
        <Step kind="intro" src={[W('487', 'Eq. (9.16)'), W('488–489')]}>
          <Md>{md`
          Time-averaging the momentum equation (previous topic) left behind a new, unknown stress — the **Reynolds (turbulent) shear stress**
          $\tau^t_{yx}=-\rho\,\overline{v_y'v_x'}$, Eq. (9.16). Wilkes opens §9.3 with an uncomfortable fact: **there is no universal law** that predicts it.
          We must resort to a **semi-theoretical approach combined with experimental observations**.

          That approach is *mixing-length theory*. Its first product is a single number that measures how vigorously the turbulence mixes momentum —
          the **eddy kinematic viscosity** $\nu_{\mathrm T}$. With it, the turbulent momentum flux takes the familiar "flux = − diffusivity × gradient" form of
          molecular transport, and the unknown stress is expressed through the *mean* velocity profile, which we can measure and calculate.
          `}</Md>
          <Callout kind="def" title="Eddy kinematic viscosity">
            <Md>{md`$\nu_{\mathrm T}\equiv\overline{v_y'\lambda}$ (Eq. 9.19): the time average of an eddy's y-velocity times the distance $\lambda$ it travels before
            mixing. The subscript T marks a turbulent quantity; the units are m²/s, the same as $\nu=\mu/\rho$.`}</Md>
          </Callout>
          <Supplement title="Where this sits in Unit D">
            <FlowRow
              nodes={[
                { title: 'Nature of turbulence' },
                { title: 'Reynolds stresses (9.13–9.16)' },
                { title: 'Mixing length — this topic', tone: 'indigo' },
                { title: 'Velocity profiles (ℓ = ky, log law)' },
                { title: 'Friction factor' },
              ]}
            />
            <Md className="mt-2">{md`Expressing the unknown stress through the mean profile is called a **closure** (a word Wilkes does not use here). Mixing-length
            theory is the simplest closure; the $k$–$\varepsilon$ model later in the unit is a more elaborate one.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`
          **Two conveyor belts.** Picture two parallel belts — the upper one fast, the lower one slow — and workers who keep jumping from one to the other.
          A worker who jumps *up* arrives with the slow belt's speed and has to be accelerated, so the fast belt is held back. A worker who jumps *down*
          arrives too fast and shoves the slow belt forward. Nobody touches across the gap, yet the belts feel a **friction-like force** that tries to equalise
          their speeds.

          In turbulent shear flow the "workers" are **eddies**: lumps of fluid that leave one layer, travel a distance $\lambda$ and then blend into a new layer —
          in Wilkes' words they "lose their identity and mix completely". Molecular viscosity works the same way, but its carriers are molecules that travel only
          a mean free path (of order 0.1 μm in air). Eddies travel millimetres to centimetres, which is why $\nu_{\mathrm T}$ can exceed $\nu$ by orders of magnitude.
          `}</Md>
          <Compare
            items={[
              {
                title: 'Molecular (laminar) transport',
                md: md`carriers: **molecules**; step length: mean free path; $\tau^\ell_{yx}=\rho\,\nu\,d\overline{v}_x/dy$; $\nu$ is a **fluid property** (a table value).`,
                tone: 'slate',
              },
              {
                title: 'Eddy (turbulent) transport',
                md: md`carriers: **eddies**; step length: $\lambda$ (mm–cm); $\tau^t_{yx}=\rho\,\nu_{\mathrm T}\,d\overline{v}_x/dy$; $\nu_{\mathrm T}$ is a **flow property** that changes from point to point.`,
                tone: 'indigo',
              },
            ]}
          />
          <Callout kind="tip" title="The sign logic in one line">
            <Md>{md`Rising eddy ⇒ comes from slower fluid ⇒ arrives **too slow** ($v_x'<0$ while $v_y'>0$). Sinking eddy ⇒ arrives **too fast** ($v_x'>0$ while
            $v_y'<0$). Either way $v_x'v_y'<0$, so $\tau^t_{yx}=-\rho\overline{v_x'v_y'}>0$ when $d\overline{v}_x/dy>0$ — the same sign as Newton's law.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('488', 'Fig. 9.5')}>
          <Figure caption="Transport of x momentum across the plane X–X. Arrow lengths are the local mean velocity; the eddies from B–B and A–A travel a distance λ (negative for the upper eddy) and arrive with a velocity mismatch." src={W('488', 'Fig. 9.5')}>
            <EddyModelDiagram />
          </Figure>
          <Md>{md`
          **How to read Fig. 9.5**
          - Three planes: **X–X** in the middle, **A–A** a distance $\lambda$ above and **B–B** a distance $\lambda$ below. Each horizontal arrow ends on the curved
            mean-velocity profile, so its length is $\overline{v}_x$ at that level — shortest at B, longest at A ($d\overline{v}_x/dy>0$).
          - The **lower eddy** leaves B–B with $\overline{v}_x-\lambda\,d\overline{v}_x/dy$ and crosses X–X with $v_y'>0$. The **upper eddy** leaves A–A with
            $\overline{v}_x+(-\lambda)\,d\overline{v}_x/dy$ — for it, $\lambda$ and $v_y'$ are both negative.
          - The dashed line and double arrow at X–X mark the **velocity deficiency** $\lambda\,d\overline{v}_x/dy$ carried by the lower eddy; the short left-pointing
            arrow $v_x'$ is the resulting **negative kick** at X–X.
          - $\dot{M}$ is the momentum flux per unit area across X–X.
          `}</Md>
        </Step>

        <Step kind="equations" src={W('487–490')}>
          <FormulaCard id="reynolds-stress-recall" />
          <FormulaCard id="m-inst" />
          <FormulaCard id="m-avg" />
          <FormulaCard id="nut-def" />
          <FormulaCard id="tau-nut" />
          <Callout kind="warning" title="Common mistakes">
            <Md>{md`
            - Writing $\partial/\partial y$ in (9.17)–(9.19): Wilkes uses a **total** derivative because the mean profile is fully established ($\overline{v}_x$ depends on $y$ only).
            - Dropping the first term of (9.18) "because $\overline{v}_x=0$": it vanishes because $\overline{v_y'}=0$.
            - Treating $\nu_{\mathrm T}$ as a fluid property — it changes with position and with the flow.
            `}</Md>
          </Callout>
          <Callout kind="note" title="Cross-reference — Fox & McDonald (secondary)">
            <Md>{md`Fox & McDonald §8.4 (p. 293) writes the total stress in a pipe as $\tau=\mu\,d\bar{u}/dy-\rho\overline{u'v'}$ (Fox Eq. 8.17): the same split
            $\tau^\ell+\tau^t$, with $\bar{u}\equiv\overline{v}_x$, $u'\equiv v_x'$, $v'\equiv v_y'$ and $y$ measured from the wall. In that excerpt Fox stops at the Reynolds
            stress and experimental data; the eddy-viscosity model developed here is Wilkes'.`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" title="Derivation: from one eddy to ν_T" src={W('488–490', 'Eqs. (9.17)–(9.19), Table 9.1')}>
          <Derivation
            steps={[
              {
                md: md`An eddy from B–B carries the mean momentum of its **origin** plane. With a constant gradient over $\lambda$:
                $\;\rho\overline{v}_x\big|_{B}=\rho\overline{v}_x-\lambda\,\dfrac{d(\rho\overline{v}_x)}{dy}$`,
                why: 'first-order step from X–X down to B–B',
              },
              {
                md: md`It crosses unit area of X–X at the volumetric rate $v_y'$, so $\dot{\mathcal{M}}=v_y'\Big(\rho\overline{v}_x-\lambda\,\dfrac{d(\rho\overline{v}_x)}{dy}\Big)$ — Eq. (9.17).`,
                why: md`also valid for an eddy from A–A: $\lambda$ and $v_y'$ both negative`,
              },
              {
                md: md`Time-average: $\overline{\dot{\mathcal{M}}}=\overline{v_y'}\,\rho\overline{v}_x-\overline{v_y'\lambda\,\dfrac{d(\rho\overline{v}_x)}{dy}}$ — Eq. (9.18).`,
                why: md`$\rho\overline{v}_x$ at X–X is constant during the averaging`,
              },
              {
                md: md`$\overline{v_y'}=0$ by definition, and the gradient is assumed constant over the region, so it leaves the average:
                $\overline{\dot{\mathcal{M}}}=-\overline{v_y'\lambda}\,\dfrac{d(\rho\overline{v}_x)}{dy}$.`,
                why: 'the two assumptions Wilkes states',
              },
              {
                md: md`Name the remaining average $\nu_{\mathrm T}\equiv\overline{v_y'\lambda}$: $\;\overline{\dot{\mathcal{M}}}=-\nu_{\mathrm T}\,\dfrac{d(\rho\overline{v}_x)}{dy}$ — Eq. (9.19).`,
                why: 'units (m/s)(m) = m²/s',
              },
              {
                md: md`A shear stress is the flux of x momentum toward $-y$, so $\tau^t_{yx}=-\overline{\dot{\mathcal{M}}}=\rho\,\nu_{\mathrm T}\,\dfrac{d\overline{v}_x}{dy}$ (constant $\rho$).`,
                why: 'momentum row of Table 9.1',
              },
            ]}
          />
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-four-eddies" />
          <ExampleCard id="ex-sign-upper-half" />
        </Step>

        <Step kind="interactive">
          <EddyJumpSim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="eddy-viscosity" />
          <QuickCheck ids={['q-ev-1', 'q-ev-4']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Eddies carry the mean momentum of their origin plane a distance $\lambda$; the **velocity deficiency** $\lambda\,d\overline{v}_x/dy$ is what produces net transport (Fig. 9.5).`,
              md`$\overline{\dot{\mathcal{M}}}=-\nu_{\mathrm T}\,d(\rho\overline{v}_x)/dy$ with $\nu_{\mathrm T}=\overline{v_y'\lambda}$ (9.19), so $\tau^t_{yx}=\rho\nu_{\mathrm T}\,d\overline{v}_x/dy$.`,
              md`$\nu_{\mathrm T}\ge0$ always, because $v_y'$ and $\lambda$ share a sign; momentum flows from fast to slow fluid.`,
              md`**Trap:** $\nu_{\mathrm T}$ is not a fluid property — never look it up in a table.`,
              md`**Trap:** the first term of (9.18) vanishes because $\overline{v_y'}=0$, not because $\overline{v}_x=0$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================== Concept 2 ============================== */}
      <Concept id="prandtl-mixing-length">
        <Step kind="intro" src={W('489–490')}>
          <Md>{md`
          Equation (9.19) is exact within the eddy model, but $\nu_{\mathrm T}=\overline{v_y'\lambda}$ involves eddy motions that nobody can track. Wilkes therefore
          transforms $\overline{v_y'\lambda}$ "into something more tractable" in three moves:

          1. write it as RMS values times a **correlation coefficient** $R$ (9.20);
          2. relate the x-fluctuation to the **velocity deficiency** through a constant $\alpha$ (9.21)–(9.22);
          3. use the experimental fact that the fluctuations in different directions are **correlated**, $\widetilde{v_y'}=\beta\widetilde{v_x'}$ (9.23).

          Combining them gives a result **obtained by Prandtl in 1925** (9.24): all the unknown constants collapse into one length, the **Prandtl mixing length**
          $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$ (9.25), and the eddy viscosity becomes $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$ (9.26).

          Why it matters: the turbulent stress is now written entirely in terms of the **mean** velocity profile and $\ell$ — the starting point for the
          universal velocity profile and the friction-factor laws in the next topics.
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
          **ℓ is the eddies' "mean free path".** In the kinetic theory of gases, viscosity ≈ (molecular speed) × (mean free path). Prandtl's idea is the
          turbulent version: diffusivity = (eddy velocity scale) × (eddy length scale).

          - **Length scale:** $\ell$ — roughly how far an eddy travels before it mixes.
          - **Velocity scale:** an eddy that crosses a distance $\ell$ meets a velocity mismatch $\ell\,\lvert d\overline{v}_x/dy\rvert$, and because the
            fluctuations are correlated ($\beta\approx1$) its own transverse speed is of the same order.
          - **Product:** $\nu_{\mathrm T}\sim(\ell\lvert d\overline{v}_x/dy\rvert)\,\ell=\ell^2\lvert d\overline{v}_x/dy\rvert$.

          **Why the stress is quadratic.** A steeper profile makes each eddy carry a bigger momentum mismatch *and* makes the eddies move faster — two
          factors of the gradient. A laminar stress has only the first.
          `}</Md>
          <Callout kind="tip">
            <Md>{md`If $R=\alpha=\beta=1$, then $\ell=\widetilde{\lambda}$: the mixing length *is* the RMS jump. In reality these constants are below or near 1 and are not known
            separately — which is exactly why they are lumped into $\ell$ and $\ell$ is measured.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('489–490', 'Eqs. (9.19)–(9.26)')}>
          <Figure caption="Map of Wilkes' derivation: three modelling steps turn the eddy average into Prandtl's mixing-length law." src={W('489–490')}>
            <FlowChart
              rows={[
                [{ title: 'Eq. (9.19)', md: md`$\overline{\dot{\mathcal{M}}}=-\overline{v_y'\lambda}\,d(\rho\overline{v}_x)/dy$`, tone: 'indigo' }],
                [
                  { title: '(9.20) correlation', md: md`$\overline{v_y'\lambda}=R\,\widetilde{v_y'}\,\widetilde{\lambda}$`, tone: 'cyan' },
                  { title: '(9.21)–(9.22) kick', md: md`$\widetilde{v_x'}=\alpha\widetilde{\lambda}\lvert d\overline{v}_x/dy\rvert$`, tone: 'cyan' },
                  { title: '(9.23) correlated', md: md`$\widetilde{v_y'}=\beta\widetilde{v_x'}$`, tone: 'cyan' },
                ],
                [{ title: 'Eq. (9.24) — Prandtl, 1925', md: md`$\overline{\dot{\mathcal{M}}}=-\ell^2\lvert d\overline{v}_x/dy\rvert\,d(\rho\overline{v}_x)/dy$`, tone: 'violet' }],
                [
                  { title: '(9.25) mixing length', md: md`$\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$`, tone: 'emerald' },
                  { title: '(9.26) eddy viscosity', md: md`$\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$`, tone: 'emerald' },
                ],
              ]}
              arrowLabels={['make it tractable', 'substitute and lump', 'compare with (9.19)']}
            />
          </Figure>
          <Figure caption="Supplementary: the mixing-length stress law τ/ρ = ℓ²|dv̄/dy| dv̄/dy is quadratic and odd in the gradient; the viscous stress of water (dashed) is invisibly small on this scale.">
            <StressLawPlot />
          </Figure>
        </Step>

        <Step kind="equations" src={W('489–490')}>
          <FormulaCard id="r-def" />
          <FormulaCard id="kick" />
          <FormulaCard id="kick-rms" />
          <FormulaCard id="beta" />
          <FormulaCard id="prandtl-1925" />
          <FormulaCard id="ell-def" />
          <FormulaCard id="nut-ell" />
          <FormulaCard id="tau-ml" />
          <Callout kind="warning" title="Common mistakes">
            <Md>{md`
            - Confusing $\ell$ with $\lambda$: $\lambda$ is each eddy's (signed) jump, $\widetilde{\lambda}$ its RMS, and $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$.
            - Reading $\alpha$ in (9.21) as the thermal diffusivity — here it is a dimensionless kick factor.
            - Writing $\tau^t_{yx}=\rho\ell^2(d\overline{v}_x/dy)^2$ in a region where the gradient is negative: the sign is lost. The general form keeps $\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$.
            `}</Md>
          </Callout>
          <Callout kind="exam">
            <Md>{md`Be ready to reproduce the chain (9.19) → (9.20) → (9.23) → (9.24) → (9.25)–(9.26) and to explain where the absolute value comes from (the RMS step).`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" title="Derivation: Prandtl's result (1925)" src={W('489–490', 'Eqs. (9.19)–(9.26)')}>
          <Derivation
            steps={[
              { md: md`Start from (9.19): $\overline{\dot{\mathcal{M}}}=-\overline{v_y'\lambda}\,\dfrac{d(\rho\overline{v}_x)}{dy}$.`, why: 'exact within the eddy model' },
              { md: md`Correlation in RMS terms (9.20): $\overline{v_y'\lambda}=R\,\widetilde{v_y'}\,\widetilde{\lambda}$.`, why: md`$R$ = correlation coefficient` },
              {
                md: md`Kick from the velocity deficiency (9.21): $v_x'=-\alpha\lambda\,\dfrac{d\overline{v}_x}{dy}$, so in RMS form (9.22): $\widetilde{v_x'}=\alpha\widetilde{\lambda}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$.`,
                why: 'squaring and averaging removes the signs ⇒ absolute value',
              },
              {
                md: md`Correlated fluctuations (9.23): $\widetilde{v_y'}=\beta\widetilde{v_x'}=\alpha\beta\widetilde{\lambda}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$.`,
                why: md`$\beta=1$ for isotropic turbulence`,
              },
              {
                md: md`Substitute into the first line: $\overline{\dot{\mathcal{M}}}=-R\alpha\beta\,\widetilde{\lambda}\,\widetilde{\lambda}\,\dfrac{d(\rho\overline{v}_x)}{dy}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$.`,
                why: 'first line of (9.24)',
              },
              {
                md: md`Lump the unknowns, $\ell^2=R\alpha\beta\,\widetilde{\lambda}^{\,2}$, i.e. $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$ (9.25):
                $\;\overline{\dot{\mathcal{M}}}=-\ell^2\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert\dfrac{d(\rho\overline{v}_x)}{dy}$ (9.24).`,
                why: 'Prandtl, 1925',
              },
              {
                md: md`Compare with (9.19): $\nu_{\mathrm T}=\ell^2\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$ (9.26), and therefore $\tau^t_{yx}=\rho\ell^2\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert\dfrac{d\overline{v}_x}{dy}$.`,
                why: 'momentum row of Table 9.1',
              },
            ]}
          />
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-chain" />
          <ExampleCard id="ex-ell-from-stress" />
        </Step>

        <Step kind="interactive">
          <MixingLengthCalculator />
        </Step>

        <Step kind="practice">
          <PracticeList concept="prandtl-mixing-length" />
          <QuickCheck ids={['q-pm-2', 'q-pm-3']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\widetilde{v_x'}=\alpha\widetilde{\lambda}\lvert d\overline{v}_x/dy\rvert$, $\;\widetilde{v_y'}=\beta\widetilde{v_x'}$ ($\beta=1$ isotropic), $\;\overline{v_y'\lambda}=R\widetilde{v_y'}\widetilde{\lambda}$.`,
              md`Prandtl (1925): $\ell=\widetilde{\lambda}\sqrt{R\alpha\beta}$ and $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_x/dy\rvert$ — one length replaces all the eddy statistics.`,
              md`$\tau^t_{yx}=\rho\ell^2\lvert d\overline{v}_x/dy\rvert\,d\overline{v}_x/dy$: quadratic in the gradient, with the gradient's sign.`,
              md`The theory does not predict $\ell$; it comes from experiment (§9.4) or a hypothesis such as $\ell=ky$ (§9.5).`,
              md`**Trap:** $\alpha$ here is a dimensionless kick factor, not the thermal diffusivity; $\ell\ne\lambda$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================== Concept 3 ============================== */}
      <Concept id="transport-analogies">
        <Step kind="intro" src={W('490')}>
          <Md>{md`
          An eddy that jumps across X–X carries *everything* that its parcel of fluid contains — not only x momentum but also enthalpy and dissolved species.
          Wilkes notes that **similar analyses** give the rates of turbulent transport of **heat** and of **mass** (the latter typically for one chemical species among
          others), and collects all three in **Table 9.1**, where $c_p$ is the specific heat and $\overline{T}$, $\overline{c}$ are the time-averaged temperature and
          species concentration.

          Two details of the table matter:

          - **Signs.** A shear stress conventionally denotes transfer of momentum in the *negative* $y$ direction (§9.2), so a minus sign precedes $\tau^t_{yx}$.
            Heat and mass transfer are conventionally taken in the *positive* $y$ direction, so no minus sign is needed for $q^t$ and $N^t$.
          - **Derivatives.** In a heat exchanger or tubular reactor $\overline{T}$ and $\overline{c}$ almost certainly vary both across the flow ($y$) **and** along it,
            so partial derivatives are used for their gradients.

          The table assumes that the **eddy thermal diffusivity** $\alpha_T$ and the **eddy diffusivity** $\mathcal{D}_T$ equal the eddy kinematic viscosity
          $\nu_{\mathrm T}$ — true **only as a first approximation**; §9.13 looks at turbulent heat and momentum transport in more detail.
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
          **An eddy does not know what you are tracking.** Follow one parcel rising from B–B: it brings along its slower velocity, its cooler (or warmer) temperature
          and its lower (or higher) concentration — all over the *same* distance $\lambda$ and at the *same* speed $v_y'$. So the same average
          $\overline{v_y'\lambda}$ governs all three fluxes, and one $\nu_{\mathrm T}$ serves momentum, heat and mass.

          Molecular transport is different: momentum, heat and species diffuse by different molecular mechanisms, so $\nu$, $\alpha=k/\rho c_p$ and $\mathcal{D}$ can differ
          enormously. For water, $\Pran=\nu/\alpha\approx7$ and $\mathrm{Sc}=\nu/\mathcal{D}\sim10^3$; for air both are below 1 (typical values). Turbulence wipes out these
          differences — which is why the enhancement over molecular transport is most spectacular for mass transfer in liquids.
          `}</Md>
          <Compare
            items={[
              { title: 'Momentum', md: md`molecular: $\tau=\mu\,\dfrac{d\overline{v}_x}{dy}$; turbulent: $\tau^t_{yx}=\rho\nu_{\mathrm T}\,\dfrac{d\overline{v}_x}{dy}$`, tone: 'indigo' },
              { title: 'Heat', md: md`molecular (Fourier): $q=-k\,\dfrac{\partial T}{\partial y}$; turbulent: $q^t=-\rho c_p\nu_{\mathrm T}\,\dfrac{\partial\overline{T}}{\partial y}$`, tone: 'rose' },
              { title: 'Mass', md: md`molecular (Fick): $N=-\mathcal{D}\,\dfrac{\partial c}{\partial y}$; turbulent: $N^t=-\nu_{\mathrm T}\,\dfrac{\partial\overline{c}}{\partial y}$`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="visual" src={W('490', 'Table 9.1')}>
          <Figure caption="Table 9.1 — Summary of relations for turbulent transport (rates in the +y direction)." src={W('490', 'Table 9.1')}>
            <Md>{md`
            | Property transported | quantity carried (per unit volume)* | $\overline{N}^{\,t}$ in terms of $\nu_{\mathrm T}$ | in terms of $\ell$ | equals |
            |---|---|---|---|---|
            | Momentum | $\rho\overline{v}_x$ | $-\rho\nu_{\mathrm T}\dfrac{d\overline{v}_x}{dy}$ | $-\rho\ell^2\dfrac{d\overline{v}_x}{dy}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$ | $-\tau^t_{yx}$ |
            | Heat | $\rho c_p\overline{T}$ | $-\rho c_p\nu_{\mathrm T}\dfrac{\partial\overline{T}}{\partial y}$ | $-\rho c_p\ell^2\dfrac{\partial\overline{T}}{\partial y}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$ | $q^t$ |
            | Mass | $\overline{c}$ | $-\nu_{\mathrm T}\dfrac{\partial\overline{c}}{\partial y}$ | $-\ell^2\dfrac{\partial\overline{c}}{\partial y}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$ | $N^t$ |

            *This column has no heading in the book; it lists what is being transported.
            `}</Md>
          </Figure>
          <Figure caption="Supplementary illustration of the “similar analyses”: the eddy from B–B brings the momentum, enthalpy and concentration of its origin plane — the same v′y and λ for all three.">
            <EddyCargoDiagram />
          </Figure>
        </Step>

        <Step kind="equations" src={W('490')}>
          <FormulaCard id="heat-flux-turb" />
          <FormulaCard id="mass-flux-turb" />
          <FormulaCard id="eddy-diff-assump" />
          <FormulaCard id="eddy-diff-general" />
          <Derivation
            title="Supplementary: the heat row by the same argument as (9.17)–(9.19)"
            steps={[
              {
                md: md`An eddy from B–B carries enthalpy per unit volume $\rho c_p\big(\overline{T}-\lambda\,\partial\overline{T}/\partial y\big)$ — the value at its origin plane.`,
                why: 'same constant-gradient step as for momentum',
              },
              { md: md`Its upward enthalpy flux: $v_y'\,\rho c_p\big(\overline{T}-\lambda\,\partial\overline{T}/\partial y\big)$.`, why: 'volume flux × enthalpy per volume' },
              { md: md`Time-average with $\overline{v_y'}=0$: $q^t=-\rho c_p\,\overline{v_y'\lambda}\,\dfrac{\partial\overline{T}}{\partial y}$.`, why: md`$+y$ counted positive: no extra sign` },
              {
                md: md`If heat travels exactly like momentum, the same average appears: $\alpha_T=\nu_{\mathrm T}$, so $q^t=-\rho c_p\nu_{\mathrm T}\,\dfrac{\partial\overline{T}}{\partial y}=-\rho c_p\ell^2\dfrac{\partial\overline{T}}{\partial y}\left\lvert\dfrac{d\overline{v}_x}{dy}\right\rvert$.`,
                why: 'first approximation only',
              },
            ]}
          />
          <Callout kind="warning" title="Sign traps">
            <Md>{md`
            - The momentum row's flux is $-\tau^t_{yx}$; the heat and mass rows have **no** minus sign in front of $q^t$, $N^t$ — conventions, not physics.
            - The velocity gradient appears in $q^t$ and $N^t$ only as $\lvert d\overline{v}_x/dy\rvert$: reversing the flow profile does **not** reverse the heat flux.
            `}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-air-duct" />
        </Step>

        <Step kind="interactive">
          <TransportAnalogySim />
        </Step>

        <Step kind="practice">
          <PracticeList concept="transport-analogies" />
          <QuickCheck ids={['q-ta-1']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Table 9.1: $-\tau^t_{yx}=-\rho\nu_{\mathrm T}\,d\overline{v}_x/dy$, $\;q^t=-\rho c_p\nu_{\mathrm T}\,\partial\overline{T}/\partial y$, $\;N^t=-\nu_{\mathrm T}\,\partial\overline{c}/\partial y$.`,
              md`Each flux runs **down its own gradient**; the velocity gradient enters $q^t$ and $N^t$ only through $\lvert d\overline{v}_x/dy\rvert$ in $\nu_{\mathrm T}$.`,
              md`Sign convention: a shear stress is momentum transfer toward $-y$ (hence the minus sign); heat and mass are counted toward $+y$.`,
              md`$\alpha_T=\mathcal{D}_T=\nu_{\mathrm T}$ is only a **first approximation** (refined in §9.13).`,
              md`Partial derivatives for $\overline{T}$ and $\overline{c}$ (they vary along the flow too); a total derivative for the fully established velocity profile.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================== Concept 4 ============================== */}
      <Concept id="determination">
        <Step kind="intro" src={W('491–493')}>
          <Md>{md`
          Mixing-length theory leaves one thing open: the value of $\ell$ (or $\nu_{\mathrm T}$) at each point. §9.4 shows that the eddy kinematic viscosity can be
          determined **fairly readily as a function of position**:

          1. A **momentum balance** on the elements of Fig. 9.6 gives the shear stress as a **linear** function of position, Eq. (9.27). Because pressure drops are
             easy to measure, the turbulent stress follows **at any location**.
          2. **Velocity profiles**, and hence gradients such as $d\overline{v}_x/dy$, are measured with a **Pitot tube** or **laser-Doppler velocimetry**.
          3. Stress and gradient together give $\ell$ and $\nu_{\mathrm T}$ from Eq. (9.28).

          Applied to pipe flow, this programme produced **Nikuradse's** classic results: a mixing-length correlation (9.29) valid for smooth *and* rough pipes
          (Fig. 9.7) and eddy-viscosity correlations (9.30)–(9.31) for smooth pipes (Fig. 9.8).
          `}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`
          **The pipe as a measuring instrument.** Think of Ohm's law: stress is the *flux*, the velocity gradient is the *driving force*, and $\nu_{\mathrm T}$ is the
          *conductance*. To find a conductance you measure a current and a voltage. Here the "current" comes almost for free: a slug of fluid in steady, fully
          developed flow is not accelerating, so the pressure difference pushing it must be balanced exactly by the shear on its surface — no knowledge of turbulence
          is needed to get the stress. The "voltage" is the slope of a measured velocity profile.

          **What to expect.** Near the wall the eddies are cramped: they cannot travel farther than the wall allows, so $\ell$ grows roughly in proportion to the
          distance $y$. Farther out they have more freedom, and $\ell$ levels off at the centre. The eddy viscosity, $\ell^2$ times a gradient that falls toward the
          centre, must therefore peak somewhere in between.
          `}</Md>
        </Step>

        <Step kind="visual" src={W('491–493', 'Figs. 9.6–9.8')}>
          <Figure
            caption="Shear stresses for (a) parallel plates and (b) a pipe. Here the shear arrows are drawn in the direction the surrounding fluid actually drags on the element (against the flow); the book marks the same faces with τᵗ."
            src={W('491', 'Fig. 9.6')}
          >
            <StressBalanceDiagram />
          </Figure>
          <Figure caption="Variation of dimensionless mixing length with location, Eq. (9.29). The straight line ℓ = 0.4y is its tangent at the wall." src={W('492', 'Fig. 9.7')}>
            <Fig97 />
          </Figure>
          <Figure caption="Variation of dimensionless eddy viscosity with location, Eq. (9.31): zero at the wall, a broad maximum near mid-radius, and a small non-zero value on the centreline." src={W('493', 'Fig. 9.8')}>
            <Fig98 />
          </Figure>
          <Figure caption="Supplementary: why Fig. 9.8 peaks (Wilkes' explanation on p. 492, plotted). Relative to their mid-radius values, ℓ² keeps rising toward the centre while the velocity gradient keeps falling; their product ν_T is largest near y/a ≈ 0.5.">
            <WhyPeakPlot />
          </Figure>
        </Step>

        <Step kind="equations" src={W('491–498')}>
          <FormulaCard id="stress-linear" />
          <FormulaCard id="wall-stress" />
          <FormulaCard id="ml-from-data" />
          <FormulaCard id="nikuradse-ell" />
          <FormulaCard id="ell-wall" />
          <FormulaCard id="nut-approx" />
          <FormulaCard id="nut-accurate" />
          <FormulaCard id="nut-pipe" />
          <FormulaCard id="friction-velocity" />
          <FormulaCard id="fanning" />
          <Callout kind="warning" title="Two different y's">
            <Md>{md`In (9.27) for parallel plates, $y$ is measured **from the centreline**. In the pipe correlations (9.29)–(9.32), $y$ is the distance **from the wall**,
            $y=a-r$. Mixing them up flips the shape of every curve.`}</Md>
          </Callout>
          <Callout kind="exam" title="Exam shortcut">
            <Md>{md`$\nu_{\mathrm T}/\nu=a^+\times\big[\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})\big]$ with $a^+=a\sqrt{\tau_w/\rho}/\nu$. With the peak value 0.08: $\nu_{\mathrm{T,max}}\approx0.08\,a^+\,\nu$ —
            about $25\nu$ at $\Rey=10^4$, $190\nu$ at $10^5$ and $1500\nu$ at $10^6$ (using $f_F$ from 9.53).`}</Md>
          </Callout>
          <Supplement title="Limits of the correlations">
            <Md>{md`
            - **At the wall** the eddies are damped and the viscous stress takes over (laminar sublayer and buffer region, $y^+<30$ in von Kármán's three-region profile,
              Wilkes p. 497). The neglected $\tau^\ell$ in (9.27) matters there.
            - **On the centreline** symmetry forces $d\overline{v}_z/dy=0$, so a strictly local law $\nu_{\mathrm T}=\ell^2\lvert d\overline{v}_z/dy\rvert$ would give zero there — yet the
              measured $\nu_{\mathrm T}$ stays finite (≈0.013 $a\sqrt{\tau_w/\rho}$). Turbulence at the axis is fed by eddies from elsewhere: a known shortcoming of the purely
              local mixing-length idea.
            `}</Md>
          </Supplement>
          <Callout kind="note" title="Cross-reference — Fox & McDonald (secondary)">
            <Md>{md`Fox §8.4 derives the same linear stress, $\tau_{rx}=\tfrac{r}{2}\,\partial p/\partial x$ (Fox Eq. 8.15), and $\tau_w=-\tfrac{R}{2}\,\partial p/\partial x$ (8.16), with
            $x$ the pipe axis and $R$ the radius. His Fig. 8.8 (Laufer's measurements, p. 294) shows the Reynolds stress following the linear total-stress line across
            almost the whole pipe and dropping to zero only very close to the wall — the experimental reason why (9.27) may neglect $\tau^\ell$ away from walls. Fox's
            friction velocity is $u_*=\sqrt{\tau_w/\rho}$.`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" title="Where (9.27) and ℓ → 0.4y come from">
          <Derivation
            steps={[
              {
                md: md`**Plates.** Element from $-y$ to $+y$ about the centreline, length $L$, unit depth. Net pressure force in $+x$:
                $\big[p-(p+\tfrac{dp}{dx}L)\big](2y)=-\tfrac{dp}{dx}\,2yL$.`,
                why: 'steady, fully developed: no net momentum change',
              },
              {
                md: md`Shear on the two faces: $2\,\tau_{yx}(y)\,L$ (the stress is odd in $y$, so both faces act the same way). Balance:
                $2\tau_{yx}L-\tfrac{dp}{dx}\,2yL=0\ \Rightarrow\ \tau_{yx}=y\,\dfrac{dp}{dx}$.`,
                why: 'Eq. (9.27), plates',
              },
              {
                md: md`**Pipe.** Coaxial cylinder of radius $r$, length $L$: pressure force $-\tfrac{dp}{dz}\pi r^2L$, shear force $\tau_{rz}\,2\pi rL$. Balance ⇒
                $\tau_{rz}=\dfrac{r}{2}\dfrac{dp}{dz}$.`,
                why: 'Eq. (9.27), pipe',
              },
              {
                md: md`At the wall, $r=a$: $\tau_{rz}=\tfrac{a}{2}\tfrac{dp}{dz}=-\tau_w$ (9.82), so $\lvert\tau\rvert=\tau_w\,r/a=\tau_w(1-y/a)$.`,
                why: 'linear; zero on the axis',
              },
              {
                md: md`**Near-wall limit of (9.29).** With $\eta=y/a\ll1$: $(1-\eta)^2\approx1-2\eta$ and $(1-\eta)^4\approx1-4\eta$, so
                $\ell/a\approx0.14-0.08+0.16\eta-0.06+0.24\eta=0.40\,\eta$, i.e. $\ell\approx0.4y$.`,
                why: 'the tangent line of Fig. 9.7',
              },
              {
                md: md`On the centreline ($\eta=1$) both brackets vanish, $\ell/a=0.14$, and $\dfrac{d(\ell/a)}{d\eta}=0.16(1-\eta)+0.24(1-\eta)^3=0$ — a smooth maximum.`,
                why: 'Fig. 9.7 levels off',
              },
            ]}
          />
          <Md className="text-sm text-ink-2">{md`Results: Eq. (9.27) is printed on Wilkes p. 491 and Eq. (9.82) on p. 504; the algebra above is supplementary.`}</Md>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-pipe-measure" />
          <ExampleCard id="ex-near-wall" />
        </Step>

        <Step kind="interactive">
          <NikuradseExplorer />
          <MeasurementLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="determination" />
          <QuickCheck ids={['q-det-2', 'q-det-5']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Momentum balance ⇒ linear stress: $\tau^t_{yx}\doteq y\,dp/dx$ (plates, $y$ from the centreline), $\tau^t_{rz}\doteq(r/2)\,dp/dz$ (pipe); $\tau_w=(a/2)(-dp/dz)$.`,
              md`Measure $d\overline{v}/dy$ (Pitot tube, LDV) ⇒ $\nu_{\mathrm T}=\tau^t/(\rho\,d\overline{v}/dy)$ and $\ell=\sqrt{\nu_{\mathrm T}/\lvert d\overline{v}/dy\rvert}$ (9.28).`,
              md`$\ell/a=0.14-0.08(1-y/a)^2-0.06(1-y/a)^4$ for smooth and rough pipes: $0.4y$ at the wall, $0.14a$ on the centreline.`,
              md`$\nu_{\mathrm T}/(a\sqrt{\tau_w/\rho})\approx0.32(y/a)(1-y/a)$; accurate (9.31): maximum ≈0.08 at mid-radius, ≈0.013 on the centreline.`,
              md`$\nu_{\mathrm T}/\nu$ grows with Re: about 25 at $\Rey=10^4$, 190 at $10^5$ and 1500 at $10^6$ (mid-radius).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
