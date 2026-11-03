/**
 * Topic D — Reynolds-stress correlation & the k–ε model.
 * Primary source: Wilkes, Ch. 9: §9.11 (pp. 503–505), §9.12 (pp. 506–507), Examples 9.4 (pp. 508–514) and 9.5 (pp. 514–519).
 * Fox & McDonald's §8.4 (pp. 293–294) appears only as a clearly-labelled secondary cross-reference.
 * Notation follows Wilkes: v̄z (time-averaged axial velocity), v'z, v'r (fluctuations), τw, v* = √(τw/ρ), y⁺, a⁺, f_F (Fanning).
 */
import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowChart, FlowSteps, FormulaCard, Md, md, Plot,
  PracticeList, QuickCheck, Step, Supplement, Takeaways,
} from '@/kit'
import { StressPartitionFigure, StressPartitionLab, UsagiBlendDemo } from '../sims/turbulence-modeling/StressPartition'
import { HomogeneousKELab, KEpsCalculator } from '../sims/turbulence-modeling/KEps'
import { OrificeExplorer, OrificeFieldMaps, OrificeGeometryFigure } from '../sims/turbulence-modeling/Orifice'
import { BoundaryLayerMeshLab, UDuctExplorer, UDuctGeometryFigure } from '../sims/turbulence-modeling/UDuct'

const wk = (pages: string, note?: string): Src => (note ? { doc: 'wilkes', pages, note } : { doc: 'wilkes', pages })
const W503 = wk('503')
const W504 = wk('504')
const W505 = wk('505')
const W506 = wk('506')
const W507 = wk('507')
const FOX = (pages: string, note?: string): Src => (note ? { doc: 'fox', pages, note } : { doc: 'fox', pages })

/* ------------------------------------------------------------------------------------------------ meta */

export const meta: TopicMeta = {
  id: 'turbulence-modeling',
  unit: 'D',
  title: 'Reynolds-Stress Correlation & the k–ε Model',
  subtitle:
    'How the shear in a turbulent pipe is shared between viscosity and eddies (Churchill), how CFD closes the Reynolds stresses with two transported quantities k and ε, and what two COMSOL k–ε simulations reveal.',
  minutes: 120,
  sources: [
    { doc: 'wilkes', pages: '503–519' },
    { doc: 'fox', pages: '293–294' },
  ],
  concepts: [
    {
      id: 'stress-partition',
      title: 'Viscous vs Reynolds stress: the Churchill correlation',
      src: wk('503–505'),
      summary:
        'Total stress τw r/a = μ dv̄z/dy + ρ v′z v′r (9.85); Churchill’s f(y⁺, a⁺) gives the Reynolds fraction (9.86), built by Churchill–Usagi blending (9.87), and integrating (9.88) yields the profile and f_F.',
    },
    {
      id: 'k-epsilon',
      title: 'The k–ε model',
      src: wk('506–507'),
      summary:
        'Mixing length is local; k–ε transports turbulence. ν_T = Cμ k²/ε (9.91) enters the mean momentum equation (9.90a); k and ε obey (9.92)–(9.93) with five constants (9.94); wall functions use the log law.',
    },
    {
      id: 'cfd-orifice',
      title: 'CFD example: flow through an orifice plate (Example 9.4)',
      src: wk('508–514', 'Example 9.4'),
      summary:
        'Axisymmetric COMSOL k–ε solution at Re = 9,285: contraction, recirculating eddy, a turbulent plume with ν_T ≈ 550 ν, ε concentrated at the plate tip, and a centreline pressure that drops to the vena contracta then partly recovers.',
    },
    {
      id: 'cfd-u-duct',
      title: 'CFD example: obstructed U-duct (Example 9.5)',
      src: wk('514–519', 'Example 9.5'),
      summary:
        'Two gas jets (30 and 10 m/s) in a 2-D U-duct, Re ≈ 2.2 × 10⁵: jet entrainment, four recirculation zones, ν_T up to ≈ 9,290 ν, ε peaks at sharp corners, stagnation and Bernoulli pressure features.',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 503–519)** — §9.11 *A Correlation for the Reynolds Stresses* (pp. 503–505), §9.12 *Computation of Turbulence by the k–ε Method* (pp. 506–507) and the COMSOL Examples 9.4 (pp. 508–514) and 9.5 (pp. 514–519). As requested for the turbulence unit, every explanation, equation and example here is built from Wilkes and uses Wilkes notation ($\overline{v}_z$, $v_z'$, $\tau_w$, $v^*$, $y^+$, Fanning $f_F$). Fox & McDonald's is cited only as a secondary cross-reference (§8.4, pp. 293–294), where Fox writes $\bar u$, $u^*$ and the Darcy factor $f = 4f_F$.`,
}

/* ------------------------------------------------------------------------------------------------ formulas */

export const formulas: FormulaDef[] = [
  /* ---- stress partition ---- */
  {
    id: 'zmom-turb',
    name: 'Time-averaged z-momentum, fully developed pipe flow',
    tag: '9.81',
    tex: md`\frac{d\overline{p}}{dz}=\frac{1}{r}\frac{d}{dr}\Big[r\left(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'}\right)\Big]`,
    vars: [
      { sym: md`\overline{p}`, desc: 'time-averaged pressure', units: md`\mathrm{Pa}` },
      { sym: md`z`, desc: 'axial coordinate along the pipe', units: md`\mathrm{m}` },
      { sym: md`r`, desc: 'radial distance from the centreline', units: md`\mathrm{m}` },
      { sym: md`\overline{\tau}_{rz}`, desc: md`time-averaged viscous shear stress, $\mu\,d\overline{v}_z/dr$`, units: md`\mathrm{Pa}` },
      { sym: md`\rho\overline{v_z'v_r'}`, desc: 'Reynolds-stress term: density × time-averaged product of the axial and radial velocity fluctuations', units: md`\mathrm{Pa}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: [
      'steady in the mean, incompressible, **fully developed** turbulent flow in a straight circular pipe',
      md`axisymmetric: $\overline{v}_z = \overline{v}_z(r)$ only, no mean radial or swirl velocity`,
      'obtained from the general time-averaged momentum equation (Wilkes Eq. 9.13) with these simplifications',
    ],
    use: md`The starting point of §9.11. The pressure gradient (constant along the pipe) balances the radial divergence of the **combined** viscous + Reynolds shear. Integrate it once in $r$ to get (9.83)–(9.85).`,
    src: wk('504', 'Eq. (9.81)'),
  },
  {
    id: 'tauw-dpdz',
    name: 'Wall shear stress and pressure gradient',
    tag: '9.82',
    tex: md`-\tau_w=\frac{a}{2}\,\frac{d\overline{p}}{dz}`,
    vars: [
      { sym: md`\tau_w`, desc: 'wall shear stress, traditionally taken **positive**', units: md`\mathrm{Pa}` },
      { sym: md`a`, desc: 'pipe radius', units: md`\mathrm{m}` },
      { sym: md`d\overline{p}/dz`, desc: 'mean pressure gradient (negative for flow in $+z$)', units: md`\mathrm{Pa/m}` },
    ],
    conditions: ['fully developed flow in a circular pipe (force balance on the whole cross-section, Eq. 9.27)', 'laminar or turbulent — it is a pure force balance'],
    use: md`Converts a measured pressure drop into $\tau_w$: $\tau_w = (a/2)(-d\overline{p}/dz) = (D/4)(\Delta p/L)$. Substituted into (9.81) to produce (9.83).`,
    src: wk('504', 'Eq. (9.82), from (9.27)'),
  },
  {
    id: 'int-983',
    name: 'Separated and integrated momentum balance',
    tag: '9.83',
    tex: md`-2\,\frac{\tau_w}{a}\int_0^r r\,dr=\int_0^r d\Big[r\left(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'}\right)\Big]`,
    vars: [
      { sym: md`\tau_w,\ a`, desc: 'wall shear stress and pipe radius', units: md`\mathrm{Pa},\ \mathrm{m}` },
      { sym: md`r`, desc: 'radial position (dummy variable of integration on the left)', units: md`\mathrm{m}` },
      { sym: md`\overline{\tau}_{rz},\ \rho\overline{v_z'v_r'}`, desc: 'viscous and Reynolds stress terms', units: md`\mathrm{Pa}` },
    ],
    conditions: [md`same as (9.81); $d\overline{p}/dz$ replaced by $-2\tau_w/a$ from (9.82)`],
    use: md`Multiply (9.81) by $r\,dr$ and integrate from the centreline. Both integrands vanish at $r = 0$, which fixes the integration constant.`,
    src: wk('504', 'Eq. (9.83)'),
  },
  {
    id: 'stress-984',
    name: 'Stress balance at radius r',
    tag: '9.84',
    tex: md`\tau_w\,\frac{r}{a}=-\overline{\tau}_{rz}+\rho\overline{v_z'v_r'}`,
    vars: [
      { sym: md`\tau_w\,r/a`, desc: 'local total shear stress (magnitude), linear in $r$', units: md`\mathrm{Pa}` },
      { sym: md`\overline{\tau}_{rz}`, desc: md`viscous stress $\mu\,d\overline{v}_z/dr$ (negative in pipe flow because $\overline{v}_z$ falls towards the wall)`, units: md`\mathrm{Pa}` },
      { sym: md`\rho\overline{v_z'v_r'}`, desc: 'Reynolds stress (positive in pipe flow)', units: md`\mathrm{Pa}` },
    ],
    conditions: ['fully developed turbulent pipe flow', md`valid at every radius $0 \le r \le a$`],
    use: md`Result of (9.83): left side $= -\tau_w r^2/a$, right side $= r(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'})$; divide by $-r$.`,
    src: wk('504', 'Eq. (9.84)'),
  },
  {
    id: 'stress-sum',
    name: 'Total = viscous + Reynolds stress',
    tag: '9.85',
    key: true,
    tex: md`\underbrace{\tau_w\,\frac{r}{a}}_{\text{total}}=\underbrace{\mu\,\frac{d\overline{v}_z}{dy}}_{\text{viscous}}+\underbrace{\rho\overline{v_z'v_r'}}_{\text{Reynolds}},\qquad y=a-r`,
    vars: [
      { sym: md`y`, desc: 'distance from the wall, $y = a - r$', units: md`\mathrm{m}` },
      { sym: md`\mu`, desc: 'dynamic (molecular) viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`\overline{v}_z`, desc: 'time-averaged axial velocity', units: md`\mathrm{m/s}` },
      { sym: md`\rho\overline{v_z'v_r'}`, desc: 'Reynolds (turbulent) shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`r,\ a`, desc: 'radial position and pipe radius', units: md`\mathrm{m}` },
    ],
    conditions: [
      'fully developed turbulent flow in a smooth or rough circular pipe',
      'all three terms are **positive** in pipe flow (Fig. 9.12)',
      md`uses $\overline{\tau}_{rz} = \mu\,d\overline{v}_z/dr = -\mu\,d\overline{v}_z/dy$`,
    ],
    use: md`At any radius the **total** shear is known exactly (straight line from 0 on the axis to $\tau_w$ at the wall). If you know one of the two parts you know the other: e.g. $\mu\,d\overline{v}_z/dy = \tau_w r/a - \rho\overline{v_z'v_r'}$.`,
    src: wk('504', 'Eq. (9.85), Fig. 9.12'),
  },
  {
    id: 'churchill',
    name: 'Churchill correlation for the Reynolds-stress fraction',
    tag: '9.86',
    key: true,
    tex: md`\begin{aligned}(\overline{v_z'v_r'})^{++}&\equiv\frac{\rho\overline{v_z'v_r'}}{\tau_w(r/a)}=f(y^+,a^+)\\ &=\left(\left[0.7\left(\frac{y^+}{10}\right)^{3}\right]^{-8/7}+\left\lvert\exp\!\left(\frac{-1}{0.436\,y^+}\right)-\frac{1}{0.436\,a^+}\left(1+\frac{6.95\,y^+}{a^+}\right)\right\rvert^{-8/7}\right)^{-7/8}\end{aligned}`,
    vars: [
      { sym: md`(\overline{v_z'v_r'})^{++},\ f`, desc: 'fraction of the local total stress carried by the Reynolds stress', units: md`-` },
      { sym: md`y^+`, desc: md`distance from the wall in wall units, $y\sqrt{\tau_w/\rho}/\nu$ (Eq. 9.38)`, units: md`-` },
      { sym: md`a^+`, desc: md`pipe radius in wall units, $a\sqrt{\tau_w/\rho}/\nu$ (not defined in the text; standard meaning)`, units: md`-` },
      { sym: md`\lvert\cdot\rvert`, desc: 'absolute value', units: md`-` },
      { sym: md`0.7,\ 10,\ 0.436,\ 6.95,\ -8/7,\ -7/8`, desc: 'fitted constants and exponents', units: md`-` },
    ],
    conditions: [
      'fully developed turbulent flow in a round tube (Churchill & Zajic, *AIChE J.* 2002)',
      'form and coefficients chosen to give the best fit to the available evidence',
      'has the Churchill–Usagi form (9.87) with $p = -8/7$: near-wall asymptote $0.7(y^+/10)^3$, outer asymptote = the absolute-value term',
    ],
    use: md`Evaluate $f$ at the required $y^+$ and $a^+$; then Reynolds stress $= f\,\tau_w(1-y/a)$ and viscous stress $= (1-f)\,\tau_w(1-y/a)$. Its main purpose (Churchill) is **almost exact predictions of $\overline{v}_z$ and $\overline{v}_{zm}$** via (9.88).`,
    src: wk('505', 'Eq. (9.86)'),
  },
  {
    id: 'usagi',
    name: 'Churchill–Usagi asymptotic interpolation',
    tag: '9.87',
    tex: md`[y(x)]^{p}\doteq[y_0(x)]^{p}+[y_\infty(x)]^{p}`,
    vars: [
      { sym: md`y(x)`, desc: 'the quantity being correlated (generic symbol — **not** the wall distance)', units: md`-` },
      { sym: md`y_0(x)`, desc: 'limiting form that dominates at one extreme of $x$', units: md`-` },
      { sym: md`y_\infty(x)`, desc: 'limiting form that dominates at the other extreme of $x$', units: md`-` },
      { sym: md`p`, desc: 'blending exponent chosen to fit data between the limits (not pressure)', units: md`-` },
    ],
    conditions: [
      'needs two asymptotes, each correct at one end of the range',
      '$p < 0$: the **smaller** asymptote dominates; $p > 0$: the larger dominates',
    ],
    use: md`Solve for $y = (y_0^{\,p}+y_\infty^{\,p})^{1/p}$. In (9.86) $p=-8/7$, which is why the bracket is raised to $-8/7$ and the whole sum to $(-8/7)^{-1} = -7/8$.`,
    src: wk('505', 'Eq. (9.87)'),
  },
  {
    id: 'vel-ode',
    name: 'Velocity-profile ODE from the Churchill correlation',
    tag: '9.88',
    tex: md`\tau_w\left(1-\frac{y}{a}\right)\Big(1-f(y^+,a^+)\Big)=\mu\,\frac{d\overline{v}_z}{dy}`,
    vars: [
      { sym: md`\tau_w(1-y/a)`, desc: md`local total stress, $\tau_w r/a$ written with $r = a - y$`, units: md`\mathrm{Pa}` },
      { sym: md`1-f`, desc: 'viscous fraction of the total stress', units: md`-` },
      { sym: md`\mu\,d\overline{v}_z/dy`, desc: 'viscous stress', units: md`\mathrm{Pa}` },
    ],
    conditions: ['fully developed turbulent pipe flow', 'obtained by substituting (9.86) into (9.85) with $y = a - r$'],
    use: md`Make it dimensionless and integrate from the wall ($\overline{v}_z = 0$ at $y = 0$) to get the velocity profile, then the mean velocity, then the friction factor — as in §9.7.`,
    src: wk('505', 'Eq. (9.88)'),
  },
  {
    id: 'wall-units',
    name: 'Wall variables',
    tex: md`v^*=\sqrt{\tau_w/\rho},\qquad y^+=\frac{y\,v^*}{\nu},\qquad v_z^+=\frac{\overline{v}_z}{v^*},\qquad a^+=\frac{a\,v^*}{\nu}`,
    vars: [
      { sym: md`v^*`, desc: md`friction velocity ($\overline{v}_z^*$ in Wilkes, $u^*$ in Fox)`, units: md`\mathrm{m/s}` },
      { sym: md`\nu`, desc: md`kinematic viscosity $\mu/\rho$`, units: md`\mathrm{m^2/s}` },
      { sym: md`y^+,\ v_z^+`, desc: 'dimensionless wall distance and velocity (Eqs. 9.38–9.39)', units: md`-` },
      { sym: md`a^+`, desc: 'pipe radius in wall units (the centreline is at $y^+ = a^+$); used but not defined in §9.11', units: md`-` },
    ],
    conditions: ['smooth or rough pipe; wall units scale the near-wall region'],
    use: md`Convert a physical position into $y^+$ before using (9.86); $a^+$ grows roughly in proportion to Re (it is about $\mathrm{Re}\sqrt{f_F/2}/2$).`,
    src: wk('495–496', 'Eqs. (9.38)–(9.39); a⁺ inferred'),
  },
  {
    id: 'ode-dimless',
    name: 'Dimensionless form of (9.88) and its integrals',
    tex: md`\frac{dv_z^+}{dy^+}=\left(1-\frac{y^+}{a^+}\right)\big(1-f\big),\qquad v_{zm}^+=\frac{2}{a^{+2}}\int_0^{a^+}v_z^+\,(a^+-y^+)\,dy^+,\qquad f_F=\frac{2}{(v_{zm}^+)^2},\qquad \mathrm{Re}=2a^+v_{zm}^+`,
    vars: [
      { sym: md`v_{zm}^+`, desc: md`mean (bulk) velocity in wall units, $\overline{v}_{zm}/v^*$`, units: md`-` },
      { sym: md`f_F`, desc: 'Fanning friction factor (Darcy $f = 4f_F$)', units: md`-` },
      { sym: md`\mathrm{Re}`, desc: md`pipe Reynolds number $D\overline{v}_{zm}/\nu$`, units: md`-` },
    ],
    conditions: [md`divide (9.88) by $\tau_w$ and use the wall variables`, 'boundary condition $v_z^+ = 0$ at $y^+ = 0$', 'numerical integration required (no closed form)'],
    use: md`The route Wilkes describes in words on p. 505 ("integrated successively"), written out. The friction-factor relation is $\tau_w = \tfrac12 f_F\rho\overline{v}_{zm}^2$ in wall units.`,
  },
  {
    id: 'fox-817',
    name: 'Fox & McDonald’s form (secondary cross-reference)',
    tex: md`\tau=\tau_\text{lam}+\tau_\text{turb}=\mu\frac{d\bar u}{dy}-\rho\overline{u'v'}`,
    vars: [
      { sym: md`\bar u`, desc: md`mean axial velocity (Wilkes $\overline{v}_z$)`, units: md`\mathrm{m/s}` },
      { sym: md`u',\ v'`, desc: md`axial and wall-normal fluctuations, $v$ measured **away from the wall** (Wilkes $v_r'$ points towards the wall, so $v' = -v_r'$)`, units: md`\mathrm{m/s}` },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
    ],
    conditions: [md`same physics as Wilkes (9.85); $-\rho\overline{u'v'} = \rho\overline{v_z'v_r'} > 0$`],
    use: md`Only for translating between textbooks: Fox's $-\rho\overline{u'v'}$ is Wilkes's $\rho\overline{v_z'v_r'}$.`,
    src: FOX('293', 'Eq. (8.17)'),
  },

  /* ---- k–ε ---- */
  {
    id: 'k-def',
    name: 'Turbulent kinetic energy per unit mass',
    tex: md`k=\frac{v_x'^{\,2}+v_y'^{\,2}+v_z'^{\,2}}{2}=\frac{v_i'v_i'}{2}`,
    vars: [
      { sym: md`k`, desc: 'kinetic energy of the fluctuating motion per unit mass (time-averaged)', units: md`\mathrm{m^2/s^2}=\mathrm{J/kg}` },
      { sym: md`v_x',\ v_y',\ v_z'`, desc: 'turbulent velocity fluctuations', units: md`\mathrm{m/s}` },
      { sym: md`v_i'v_i'`, desc: 'index notation: repeated $i$ means sum over $x, y, z$', units: md`\mathrm{m^2/s^2}` },
    ],
    conditions: ['dimensions L²/T²', 'the squares are understood as time averages (the book prints them without the overbar)'],
    use: md`A property of the turbulence itself (not of the mean-velocity gradient). Its dissipation rate is $\varepsilon$, dimensions L²/T³ (m²/s³ = W/kg).`,
    src: wk('506', 'definition of k and ε'),
  },
  {
    id: 'mom-989',
    name: 'Momentum balance, constant density, variable viscosity',
    tag: '9.89',
    tex: md`\rho\frac{\partial \mathbf{v}}{\partial t}+\rho\,\mathbf{v}\cdot\nabla\mathbf{v}=-\nabla p+\nabla\cdot\mu\left(\nabla\mathbf{v}+(\nabla\mathbf{v})^{T}\right)+\mathbf{F}`,
    vars: [
      { sym: md`\mathbf{v}`, desc: 'instantaneous velocity vector', units: md`\mathrm{m/s}` },
      { sym: md`p`, desc: 'pressure', units: md`\mathrm{Pa}` },
      { sym: md`\mu`, desc: 'dynamic viscosity — may vary with position, hence inside the divergence', units: md`\mathrm{Pa\,s}` },
      { sym: md`\nabla\mathbf{v}+(\nabla\mathbf{v})^T`, desc: 'velocity-gradient tensor plus its transpose (twice the rate-of-strain tensor)', units: md`\mathrm{s^{-1}}` },
      { sym: md`\mathbf{F}`, desc: md`body force per unit volume (e.g. $\rho\mathbf{g}$)`, units: md`\mathrm{N/m^3}` },
      { sym: md`t,\ \rho`, desc: 'time and (constant) density', units: md`\mathrm{s},\ \mathrm{kg/m^3}` },
    ],
    conditions: ['constant density, Newtonian fluid, viscosity allowed to vary (Wilkes Example 5.9)'],
    use: md`The three component momentum equations in vector form; the template into which turbulence is inserted.`,
    src: wk('506', 'Eq. (9.89)'),
  },
  {
    id: 'mom-990a',
    name: 'Time-averaged momentum with eddy viscosity',
    tag: '9.90a',
    key: true,
    tex: md`\rho\frac{\partial \overline{\mathbf{v}}}{\partial t}+\rho\,\overline{\mathbf{v}}\cdot\nabla\overline{\mathbf{v}}=-\nabla\overline{p}+\nabla\cdot(\mu+\rho\nu_T)\left(\nabla\overline{\mathbf{v}}+(\nabla\overline{\mathbf{v}})^{T}\right)+\mathbf{F}`,
    vars: [
      { sym: md`\overline{\mathbf{v}},\ \overline{p}`, desc: 'time-averaged velocity and pressure', units: md`\mathrm{m/s},\ \mathrm{Pa}` },
      { sym: md`\nu_T`, desc: 'turbulent (eddy) kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: md`\rho\nu_T`, desc: md`eddy viscosity in dynamic units (often written $\mu_T$)`, units: md`\mathrm{Pa\,s}` },
      { sym: md`\mu+\rho\nu_T`, desc: 'molecular + eddy viscosity ("effective" viscosity)', units: md`\mathrm{Pa\,s}` },
    ],
    conditions: [
      md`eddy-viscosity (Boussinesq) idea: the Reynolds stresses act like extra viscosity $\rho\nu_T$`,
      md`$\nu_T$ varies from point to point — it is a property of the flow, not of the fluid`,
    ],
    use: md`Obtained from (9.89) by $\mathbf{v}\to\overline{\mathbf{v}}$, $p\to\overline{p}$, $\mu\to\mu+\rho\nu_T$. Needs a recipe for $\nu_T$: (9.91).`,
    src: wk('506', 'Eq. (9.90a)'),
  },
  {
    id: 'cont-990b',
    name: 'Continuity for the mean flow',
    tag: '9.90b',
    tex: md`\nabla\cdot\overline{\mathbf{v}}=0`,
    vars: [{ sym: md`\overline{\mathbf{v}}`, desc: 'time-averaged velocity', units: md`\mathrm{m/s}` }],
    conditions: ['constant density'],
    use: md`Added "for completeness" — solved together with (9.90a), (9.92) and (9.93).`,
    src: wk('506', 'Eq. (9.90b)'),
  },
  {
    id: 'nut-ke',
    name: 'Eddy viscosity from k and ε',
    tag: '9.91',
    key: true,
    tex: md`\nu_T=C_\mu\,\frac{k^2}{\varepsilon}`,
    vars: [
      { sym: md`\nu_T`, desc: 'eddy kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: md`C_\mu`, desc: 'dimensionless constant, 0.09 (the first of five model constants)', units: md`-` },
      { sym: md`k`, desc: 'turbulent kinetic energy per unit mass', units: md`\mathrm{m^2/s^2}` },
      { sym: md`\varepsilon`, desc: 'dissipation rate of $k$', units: md`\mathrm{m^2/s^3}` },
    ],
    conditions: [md`k–ε hypothesis: $\nu_T$ at a point depends **only** on the local $k$ and $\varepsilon$`, md`form fixed by dimensions: $k^2/\varepsilon$ is the only combination with units L²/T`],
    use: md`Plug in local $k$ and $\varepsilon$ from the transport equations. $\nu_T \propto k^2$ (doubling $k$ quadruples it) and $\propto 1/\varepsilon$.`,
    src: wk('506', 'Eq. (9.91)'),
  },
  {
    id: 'k-eq',
    name: 'Transport equation for k',
    tag: '9.92',
    key: true,
    tex: md`\rho\frac{\partial k}{\partial t}+\rho\,\overline{\mathbf{v}}\cdot\nabla k=\nabla\cdot\left[\left(\mu+\rho\frac{C_\mu k^2}{\sigma_k\varepsilon}\right)\nabla k\right]+\rho C_\mu\frac{k^2}{\varepsilon}\left(\nabla\overline{\mathbf{v}}+(\nabla\overline{\mathbf{v}})^T\right)^2-\rho\varepsilon`,
    vars: [
      { sym: md`\rho\,\partial k/\partial t`, desc: 'accumulation (unsteady change)', units: md`\mathrm{W/m^3}` },
      { sym: md`\rho\,\overline{\mathbf{v}}\cdot\nabla k`, desc: 'convection of $k$ by the mean flow — lets upstream/recirculated turbulence reach a point', units: md`\mathrm{W/m^3}` },
      { sym: md`\nabla\cdot[(\mu+\rho\nu_T/\sigma_k)\nabla k]`, desc: md`molecular + turbulent diffusion of $k$ (note $\rho C_\mu k^2/(\sigma_k\varepsilon) = \rho\nu_T/\sigma_k$)`, units: md`\mathrm{W/m^3}` },
      { sym: md`\rho\nu_T(\nabla\overline{\mathbf{v}}+(\nabla\overline{\mathbf{v}})^T)^2`, desc: 'production of $k$ by mean velocity gradients (book shorthand for a scalar "square" of the tensor)', units: md`\mathrm{W/m^3}` },
      { sym: md`\rho\varepsilon`, desc: 'dissipation (destruction) of $k$', units: md`\mathrm{W/m^3}` },
      { sym: md`\sigma_k`, desc: 'turbulent Prandtl number for $k$, 1.0', units: md`-` },
    ],
    conditions: [
      'derived from the time-averaged equations of motion by considering viscous dissipation — long and involved, with "a small amount of empiricism"',
      md`production term: for simple shear $\overline{v}_x(y)$ it reduces to $\rho\nu_T(d\overline{v}_x/dy)^2$ (standard reading of the shorthand)`,
    ],
    use: md`Solved simultaneously with (9.90a), (9.90b), (9.93) by computer. Read it as a **budget**: change following the flow = diffusion + production − dissipation.`,
    src: wk('507', 'Eq. (9.92)'),
  },
  {
    id: 'eps-eq',
    name: 'Transport equation for ε',
    tag: '9.93',
    key: true,
    tex: md`\rho\frac{\partial \varepsilon}{\partial t}+\rho\,\overline{\mathbf{v}}\cdot\nabla\varepsilon=\nabla\cdot\left[\left(\mu+\rho\frac{C_\mu k^2}{\sigma_\varepsilon\varepsilon}\right)\nabla\varepsilon\right]+\rho C_{\varepsilon1}C_\mu k\left(\nabla\overline{\mathbf{v}}+(\nabla\overline{\mathbf{v}})^T\right)^2-\rho C_{\varepsilon2}\frac{\varepsilon^2}{k}`,
    vars: [
      { sym: md`\sigma_\varepsilon`, desc: md`turbulent Prandtl number for $\varepsilon$, 1.3`, units: md`-` },
      { sym: md`C_{\varepsilon1}`, desc: 'production constant, 1.44', units: md`-` },
      { sym: md`C_{\varepsilon2}`, desc: 'destruction constant, 1.92', units: md`-` },
      { sym: md`\rho C_{\varepsilon1}C_\mu k(\ldots)^2`, desc: md`production of $\varepsilon$ $= C_{\varepsilon1}(\varepsilon/k)\times$ production of $k$`, units: md`\mathrm{W/(m^3\,s)}` },
      { sym: md`\rho C_{\varepsilon2}\varepsilon^2/k`, desc: md`destruction of $\varepsilon$`, units: md`\mathrm{W/(m^3\,s)}` },
    ],
    conditions: ['obtained "largely by analogy" with the $k$ equation — less rigorous than (9.92)', 'same structure: accumulation + convection = diffusion + production − destruction'],
    use: md`Each source term of the $k$ equation is multiplied by $\varepsilon/k$ (an inverse time scale) and a constant.`,
    src: wk('507', 'Eq. (9.93)'),
  },
  {
    id: 'ke-const',
    name: 'The five k–ε constants',
    tag: '9.94',
    key: true,
    tex: md`C_\mu=0.09,\qquad C_{\varepsilon1}=1.44,\qquad C_{\varepsilon2}=1.92,\qquad \sigma_k=1.0,\qquad \sigma_\varepsilon=1.3`,
    vars: [
      { sym: md`C_\mu`, desc: 'eddy-viscosity constant in (9.91)', units: md`-` },
      { sym: md`C_{\varepsilon1},\ C_{\varepsilon2}`, desc: md`production and destruction constants of the $\varepsilon$ equation`, units: md`-` },
      { sym: md`\sigma_k,\ \sigma_\varepsilon`, desc: md`divide the turbulent diffusivity of $k$ and $\varepsilon$`, units: md`-` },
    ],
    conditions: ['chosen so that k–ε predictions agree reasonably well with experiments — empirical, not universal'],
    use: md`Memorise the set. (They are also the standard default values in COMSOL's Turbulent Flow k–ε interface used in Examples 9.4 and 9.5 — a platform remark; Wilkes does not list COMSOL's settings.)`,
    src: wk('507', 'Eq. (9.94)'),
  },
  {
    id: 'ke-scales',
    name: 'Turbulence scales built from k and ε',
    tex: md`u_t\sim\sqrt{k},\qquad \ell\sim\frac{k^{3/2}}{\varepsilon},\qquad t_t\sim\frac{k}{\varepsilon},\qquad \nu_T=C_\mu\,\sqrt{k}\;\frac{k^{3/2}}{\varepsilon}`,
    vars: [
      { sym: md`u_t`, desc: 'velocity scale of the energetic eddies', units: md`\mathrm{m/s}` },
      { sym: md`\ell`, desc: 'length scale of the energetic eddies', units: md`\mathrm{m}` },
      { sym: md`t_t`, desc: 'eddy turnover (lifetime) time scale', units: md`\mathrm{s}` },
    ],
    conditions: ['order-of-magnitude scales (dimensional reasoning), not exact sizes'],
    use: md`Shows that (9.91) is a "velocity × length" eddy viscosity, just like mixing length — but with both scales carried by transport equations instead of being prescribed.`,
  },
  {
    id: 'ke-decay',
    name: 'Decaying homogeneous turbulence (k–ε)',
    tex: md`\frac{dk}{dt}=-\varepsilon,\quad \frac{d\varepsilon}{dt}=-C_{\varepsilon2}\frac{\varepsilon^2}{k}\quad\Rightarrow\quad k=k_0\left(1+\frac{t}{\tau}\right)^{-n},\ \ n=\frac{1}{C_{\varepsilon2}-1},\ \ \tau=\frac{k_0}{(C_{\varepsilon2}-1)\,\varepsilon_0}`,
    vars: [
      { sym: md`k_0,\ \varepsilon_0`, desc: 'initial values', units: md`\mathrm{m^2/s^2},\ \mathrm{m^2/s^3}` },
      { sym: md`n`, desc: md`decay exponent (1.087 with $C_{\varepsilon2} = 1.92$)`, units: md`-` },
      { sym: md`\tau`, desc: 'decay time constant', units: md`\mathrm{s}` },
    ],
    conditions: ['no mean velocity gradient (no production), spatially uniform turbulence (no convection or diffusion)', 'supplementary reduction of (9.92)–(9.93)'],
    use: md`A one-line check of how the constants behave; also $\varepsilon = \varepsilon_0(1+t/\tau)^{-C_{\varepsilon2}/(C_{\varepsilon2}-1)}$.`,
  },
  {
    id: 'log-law-wf',
    name: 'Universal log law used by wall functions',
    tag: '9.42',
    tex: md`v_z^+=5.5+2.5\ln y^+\qquad(\text{sublayer: } v_z^+=y^+,\ \text{Eq. 9.43})`,
    vars: [
      { sym: md`v_z^+,\ y^+`, desc: 'velocity and wall distance in wall units', units: md`-` },
    ],
    conditions: ['smooth wall, fully turbulent region outside the viscous sublayer', 'COMSOL assumes the velocity **parallel to the wall** follows a logarithmic law of distance from the wall'],
    use: md`A wall function imposes this relation between the first computational point and the wall, so the k–ε equations need not be solved through the viscous layer where they break down or need an impossibly fine mesh.`,
    src: [wk('496', 'Eqs. (9.42)–(9.43)'), wk('507', 'wall functions')],
  },

  /* ---- Example 9.4 ---- */
  {
    id: 're-pipe',
    name: 'Pipe Reynolds number',
    tex: md`\mathrm{Re}=\frac{v\,D}{\nu}`,
    vars: [
      { sym: md`v`, desc: 'mean (here: uniform inlet) velocity', units: md`\mathrm{m/s}` },
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['dimensionless — any consistent units (ft and ft²/s work as well as SI)'],
    use: md`Example 9.4: $(1.0)(0.1)/(1.077\times10^{-5}) = 9{,}285$, turbulent "even upstream of the orifice plate".`,
  },
  {
    id: 'orifice-cont',
    name: 'Continuity through an orifice and its vena contracta',
    tex: md`v_o=v_\text{inlet}\left(\frac{D}{d}\right)^2=\frac{v_\text{inlet}}{\beta^2},\qquad v_{vc}=\frac{v_o}{C_c},\qquad \beta=\frac{d}{D}`,
    vars: [
      { sym: md`v_o`, desc: 'mean velocity in the orifice opening', units: md`\mathrm{m/s}` },
      { sym: md`d,\ \beta`, desc: 'orifice diameter and diameter ratio', units: md`\mathrm{m},\ -` },
      { sym: md`C_c`, desc: 'contraction coefficient: jet area at the vena contracta / orifice area (≈ 0.6–0.9)', units: md`-` },
      { sym: md`v_{vc}`, desc: 'mean jet velocity at the vena contracta', units: md`\mathrm{m/s}` },
    ],
    conditions: ['incompressible, uniform velocities over each cross-section (1-D estimate)'],
    use: md`Example 9.4 geometry gives $d = 0.05$ ft, $\beta = 0.5$, so $v_o = 4v_\text{inlet}$.`,
  },
  {
    id: 'bernoulli-vc',
    name: 'Bernoulli drop from inlet to vena contracta',
    tex: md`p_\text{inlet}-p_{vc}\approx\tfrac12\rho\left(v_{vc}^2-v_\text{inlet}^2\right)`,
    vars: [
      { sym: md`p_\text{inlet},\ p_{vc}`, desc: 'centreline pressures at the inlet and at the vena contracta', units: md`\mathrm{Pa}` },
      { sym: md`v_{vc},\ v_\text{inlet}`, desc: 'velocities at the two stations (use the centreline values when comparing with a centreline plot)', units: md`\mathrm{m/s}` },
    ],
    conditions: ['accelerating flow along a streamline — losses small up to the vena contracta', 'steady, incompressible; elevation changes negligible'],
    use: md`Wilkes explains the "sharp but smooth fall in pressure" of Fig. E9.4.4 with Bernoulli's equation; this is the quantitative version.`,
  },
  {
    id: 'borda-carnot',
    name: 'Expansion (Borda–Carnot) loss after the vena contracta',
    tex: md`\Delta p_\text{loss}\approx\tfrac12\rho\left(v_{vc}-v\right)^2,\qquad \Delta p_\text{recovered}=\tfrac12\rho\left(v_{vc}^2-v^2\right)-\Delta p_\text{loss}=\rho\,v\,(v_{vc}-v)`,
    vars: [
      { sym: md`v`, desc: 'mean velocity in the full pipe downstream', units: md`\mathrm{m/s}` },
      { sym: md`\Delta p_\text{loss}`, desc: 'irrecoverable pressure loss caused by the eddying re-expansion', units: md`\mathrm{Pa}` },
    ],
    conditions: ['sudden-expansion momentum balance from the jet to the full pipe; wall friction neglected'],
    use: md`Explains why the pressure only **partly** recovers: the mixing in the recirculation zone turns kinetic energy into turbulence (and finally heat) instead of pressure.`,
  },

  /* ---- Example 9.5 ---- */
  {
    id: 'mix-mean',
    name: 'Mean velocity after the two jets have mixed',
    tex: md`\bar V=\frac{V_1w_1+V_2w_2}{W}`,
    vars: [
      { sym: md`V_1,\ V_2`, desc: 'inlet velocities (30 and 10 m/s)', units: md`\mathrm{m/s}` },
      { sym: md`w_1,\ w_2`, desc: 'inlet widths (0.1 m each)', units: md`\mathrm{m}` },
      { sym: md`W`, desc: 'channel width after mixing (0.4 m)', units: md`\mathrm{m}` },
    ],
    conditions: ['2-D planar flow (flow rate per unit depth), constant density'],
    use: md`Continuity per unit depth: $(30\times0.1+10\times0.1)/0.4 = 10$ m/s.`,
    src: wk('515', 'Example 9.5(a)'),
  },
  {
    id: 're-channel',
    name: 'Reynolds number of the mixed channel flow',
    tex: md`\mathrm{Re}=\frac{\bar V\,W}{\nu}`,
    vars: [
      { sym: md`\bar V`, desc: 'mean velocity after mixing', units: md`\mathrm{m/s}` },
      { sym: md`W`, desc: 'channel width', units: md`\mathrm{m}` },
      { sym: md`\nu`, desc: 'kinematic viscosity of the gases', units: md`\mathrm{m^2/s}` },
    ],
    conditions: ['Wilkes uses "Re > 5,000, say" as the check that turbulence is likely'],
    use: md`Example 9.5: $10\times0.4/1.83\times10^{-5}$ — printed as 218,530 (direct arithmetic 218,579): highly turbulent.`,
    src: wk('515', 'Example 9.5(a)'),
  },
  {
    id: 'gap-speed',
    name: 'Mean speed in a constriction (per unit depth)',
    tex: md`V_\text{gap}=\frac{Q'}{h_\text{gap}},\qquad Q'=V_1w_1+V_2w_2`,
    vars: [
      { sym: md`Q'`, desc: 'volume flow rate per unit depth', units: md`\mathrm{m^2/s}` },
      { sym: md`h_\text{gap}`, desc: 'open height of the constriction (0.2 m over r5 and under r4)', units: md`\mathrm{m}` },
    ],
    conditions: ['2-D, incompressible, uniform velocity over the gap (1-D estimate)'],
    use: md`$4.0/0.2 = 20$ m/s — twice the mean speed, which is why B and C are "very high" on the velocity plot.`,
  },
  {
    id: 'dyn-pressure',
    name: 'Dynamic pressure (stagnation rise / Bernoulli change)',
    tex: md`p_\text{stag}-p=\tfrac12\rho V^2,\qquad p_1-p_2=\tfrac12\rho\left(V_2^2-V_1^2\right)`,
    vars: [
      { sym: md`V`, desc: 'approach speed of the stream that is brought to rest', units: md`\mathrm{m/s}` },
      { sym: md`p_\text{stag}`, desc: 'stagnation pressure', units: md`\mathrm{Pa}` },
    ],
    conditions: ['along a streamline, steady, incompressible, losses neglected'],
    use: md`Order-of-magnitude scales for Fig. E9.5.8: corners A (stagnation), constrictions B and C (Bernoulli low).`,
  },
  {
    id: 'bl-series',
    name: 'Total thickness of a geometrically stretched boundary-layer mesh',
    tex: md`h_i=h_1r^{\,i-1},\qquad H_N=\sum_{i=1}^{N}h_1r^{\,i-1}=h_1\,\frac{r^N-1}{r-1}`,
    vars: [
      { sym: md`h_1`, desc: 'first-layer (wall-adjacent) thickness', units: md`\mathrm{m}` },
      { sym: md`r`, desc: 'stretching factor (1.1 in Fig. E9.5.2)', units: md`-` },
      { sym: md`N`, desc: 'number of boundary layers (8 in Fig. E9.5.2)', units: md`-` },
    ],
    conditions: [md`geometric growth of layer thickness, $r \ne 1$ (for $r = 1$, $H_N = N h_1$)`],
    use: md`With $N = 8$, $r = 1.1$: $H_8 = 11.44\,h_1$.`,
  },
]

/* ------------------------------------------------------------------------------------------------ examples */

export const examples: ExampleDef[] = [
  /* ---- stress partition ---- */
  {
    id: 'ex-partition-water',
    concept: 'stress-partition',
    title: 'Splitting the shear stress near the wall of a water pipe',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\mu = 1.0\times10^{-3}$ Pa·s, $\nu = 1.0\times10^{-6}$ m²/s) in a smooth pipe of diameter $D = 0.05$ m with wall shear stress $\tau_w = 2.0$ Pa.`,
    find: md`At $y = 0.2$ mm and $y = 2$ mm from the wall: $y^+$, the Reynolds fraction $f$ from (9.86), the Reynolds and viscous stresses, and the mean velocity gradient.`,
    assumptions: 'Fully developed turbulent flow; Churchill correlation (9.86) with the stresses from (9.85).',
    steps: [
      { title: 'Wall variables', md: md`$v^* = \sqrt{\tau_w/\rho} = \sqrt{2.0/1000} = 0.04472$ m/s; $a = 0.025$ m, so $a^+ = a v^*/\nu = 0.025\times0.04472/10^{-6} = 1118$.` },
      { title: 'Position in wall units', md: md`$y = 0.2$ mm: $y^+ = 0.0002\times0.04472/10^{-6} = 8.94$. $\quad y = 2$ mm: $y^+ = 89.4$.` },
      { title: 'Reynolds fraction from (9.86)', md: md`At $y^+ = 8.94$: $y_0 = 0.7(0.894)^3 = 0.500$ and the outer term is $0.772$, so $f = (0.500^{-8/7}+0.772^{-8/7})^{-7/8} = 0.330$. At $y^+ = 89.4$: $f = 0.971$.` },
      { title: 'Total stress at each point (9.85)', md: md`$\tau_w r/a = \tau_w(1 - y/a)$: $2.0(1-0.008) = 1.984$ Pa and $2.0(1-0.08) = 1.840$ Pa.` },
      {
        title: 'Split into Reynolds and viscous parts',
        md: md`$y = 0.2$ mm: Reynolds $= 0.330\times1.984 = 0.655$ Pa, viscous $= 1.984-0.655 = 1.329$ Pa.

$y = 2$ mm: Reynolds $= 0.971\times1.840 = 1.786$ Pa, viscous $= 0.054$ Pa.`,
      },
      { title: 'Velocity gradient', md: md`$d\overline{v}_z/dy = \text{viscous}/\mu$: $1.329/10^{-3} = 1329$ s⁻¹ at 0.2 mm but only $0.054/10^{-3} = 54$ s⁻¹ at 2 mm.` },
    ],
    answer: md`$y^+ = 8.94$: $f = 0.33$, Reynolds 0.655 Pa, viscous 1.33 Pa, $d\overline{v}_z/dy \approx 1330$ s⁻¹. $\quad y^+ = 89.4$: $f = 0.971$, Reynolds 1.79 Pa, viscous 0.054 Pa, $d\overline{v}_z/dy \approx 54$ s⁻¹.`,
    insight: 'Moving 1.8 mm away from the wall the eddies take over 97 % of the shear and the velocity gradient collapses by a factor of 25 — the flat turbulent core.',
  },
  {
    id: 'ex-asymptotes',
    concept: 'stress-partition',
    title: 'Which asymptote wins? Reading (9.86) as a Churchill–Usagi blend',
    difficulty: 2,
    given: md`Correlation (9.86) with $a^+ = 2000$; asymptotes $y_0 = 0.7(y^+/10)^3$ and $y_\infty = \lvert\exp(-1/0.436y^+) - (1/0.436a^+)(1+6.95y^+/a^+)\rvert$; exponent $p = -8/7$.`,
    find: md`$y_0$, $y_\infty$ and $f$ at $y^+ = 2$, 10 and 200, and explain the pattern.`,
    steps: [
      { title: 'y⁺ = 2 (deep in the sublayer)', md: md`$y_0 = 0.7(0.2)^3 = 0.0056$; $y_\infty = \lvert e^{-1.147} - 0.00115(1.007)\rvert = 0.3165$. Blend: $f = (0.0056^{-8/7}+0.3165^{-8/7})^{-7/8} = 0.00555$ — almost exactly $y_0$.` },
      { title: 'y⁺ = 200 (turbulent core)', md: md`$y_0 = 0.7(20)^3 = 5600$ (absurdly large); $y_\infty = \lvert e^{-0.01147} - 0.00115(1.695)\rvert = 0.9867$. Blend: $f = 0.9866$ — the outer asymptote.` },
      { title: 'y⁺ = 10 (overlap region)', md: md`$y_0 = 0.700$, $y_\infty = 0.794$ — comparable. Blend: $f = (0.700^{-8/7}+0.794^{-8/7})^{-7/8} = 0.406$, **well below either asymptote**.` },
      { title: 'Why', md: md`With $p<0$, $y^p$ is largest for the smaller $y$, so the smaller asymptote dominates the sum; where both are equal the blend is $2^{1/p} = 2^{-7/8} = 0.545$ times the common value. The value of $p$ sets how sharply the curve turns the corner.` },
    ],
    answer: md`$y^+ = 2$: $f \approx y_0 = 0.0056$; $y^+ = 200$: $f \approx y_\infty = 0.987$; $y^+ = 10$: $f = 0.406$ (smaller than both asymptotes).`,
    insight: 'Negative p makes a smooth "minimum" function: each asymptote is exact at its own end, and p fits the corner in between.',
  },
  {
    id: 'ex-friction-from-988',
    concept: 'stress-partition',
    title: 'From the Reynolds-stress fraction to a friction factor',
    difficulty: 3,
    given: md`A smooth pipe with $a^+ = 2000$; the dimensionless form of (9.88), $dv_z^+/dy^+ = (1-y^+/a^+)(1-f)$, with $v_z^+ = 0$ at the wall.`,
    find: md`The centreline and mean velocities in wall units, $f_F$ and Re; compare with the experimental law (9.53).`,
    assumptions: 'Numerical integration (trapezoidal rule on a logarithmic grid in y⁺, done for this platform).',
    steps: [
      { title: 'Integrate the profile', md: md`Integrating from $y^+ = 0$ to $a^+ = 2000$ gives the centreline velocity $v_{zc}^+ = 24.9$. Near the wall $v_z^+ \approx y^+$ (because $f \approx 0$); beyond $y^+\approx30$ the profile follows $5.5+2.5\ln y^+$ closely.` },
      { title: 'Mean velocity', md: md`$v_{zm}^+ = \dfrac{2}{a^{+2}}\displaystyle\int_0^{a^+} v_z^+(a^+-y^+)\,dy^+ = 20.52$ (area-weighted: the factor $a^+ - y^+$ is the radius $r^+$).` },
      { title: 'Friction factor and Re', md: md`$f_F = 2/(v_{zm}^+)^2 = 2/20.52^2 = 0.00475$; $\mathrm{Re} = 2a^+v_{zm}^+ = 2(2000)(20.52) = 8.21\times10^4$.` },
      { title: 'Check against (9.53)', md: md`$\sqrt{1/f_F} = 1.74\ln(\mathrm{Re}\sqrt{f_F}) - 0.391$ at $\mathrm{Re} = 8.21\times10^4$ gives $f_F = 0.00467$. The two differ by about 1.7 %.` },
    ],
    answer: md`$v_{zc}^+ \approx 24.9$, $v_{zm}^+ \approx 20.5$, $f_F \approx 0.00475$ (Darcy 0.0190) at $\mathrm{Re} \approx 8.2\times10^4$ — within ≈ 2 % of (9.53).`,
    insight: 'Churchill’s point: get the Reynolds stress right and the velocity profile, mean velocity and friction factor follow almost exactly.',
  },

  /* ---- k–ε ---- */
  {
    id: 'ex-nut-calc',
    concept: 'k-epsilon',
    title: 'Eddy viscosity and turbulence scales from k and ε',
    difficulty: 1,
    given: md`At a point in a turbulent water flow ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s): $k = 0.05$ m²/s², $\varepsilon = 0.5$ m²/s³.`,
    find: md`$\nu_T$, $\mu_T$, $\nu_T/\nu$, and the velocity, length and time scales of the energetic eddies.`,
    steps: [
      { title: 'Eddy viscosity (9.91)', md: md`$\nu_T = C_\mu k^2/\varepsilon = 0.09\times0.05^2/0.5 = 0.09\times0.0025/0.5 = 4.5\times10^{-4}$ m²/s.` },
      { title: 'Dynamic form and ratio', md: md`$\mu_T = \rho\nu_T = 1000\times4.5\times10^{-4} = 0.45$ Pa·s; $\nu_T/\nu = 4.5\times10^{-4}/10^{-6} = 450$.` },
      { title: 'Scales', md: md`$\sqrt{k} = 0.224$ m/s; $\ell = k^{3/2}/\varepsilon = 0.01118/0.5 = 0.0224$ m; $t_t = k/\varepsilon = 0.05/0.5 = 0.10$ s. Check: $C_\mu\sqrt{k}\,\ell = 0.09\times0.224\times0.0224 = 4.5\times10^{-4}$ m²/s ✓.` },
    ],
    answer: md`$\nu_T = 4.5\times10^{-4}$ m²/s ($\mu_T = 0.45$ Pa·s), 450 times the molecular value; eddies ≈ 0.22 m/s, ≈ 22 mm, turnover ≈ 0.1 s.`,
    insight: 'The "turbulent viscosity" of water here is 450× its real viscosity — and it is a property of the flow, not of water.',
  },
  {
    id: 'ex-k-from-fluct',
    concept: 'k-epsilon',
    title: 'k from measured velocity fluctuations',
    difficulty: 1,
    given: md`Hot-wire measurements give rms fluctuations $\sqrt{\overline{v_x'^2}} = 0.30$ m/s, $\sqrt{\overline{v_y'^2}} = 0.20$ m/s, $\sqrt{\overline{v_z'^2}} = 0.20$ m/s.`,
    find: md`The turbulent kinetic energy $k$; and $\varepsilon$ if the local eddy viscosity is known to be $\nu_T = 2.0\times10^{-3}$ m²/s.`,
    steps: [
      { title: 'Definition of k', md: md`$k = \tfrac12(\overline{v_x'^2}+\overline{v_y'^2}+\overline{v_z'^2}) = \tfrac12(0.09+0.04+0.04) = 0.085$ m²/s².` },
      { title: 'Invert (9.91)', md: md`$\varepsilon = C_\mu k^2/\nu_T = 0.09\times0.085^2/(2.0\times10^{-3}) = 0.09\times0.007225/0.002 = 0.325$ m²/s³.` },
    ],
    answer: md`$k = 0.085$ m²/s² (J/kg); $\varepsilon \approx 0.325$ m²/s³ (W/kg).`,
    insight: 'k sums all three components: turbulence is never one-dimensional even when the mean flow is.',
  },
  {
    id: 'ex-decay',
    concept: 'k-epsilon',
    title: 'How fast does grid turbulence die away (k–ε prediction)?',
    difficulty: 3,
    given: md`Uniform turbulence with no mean shear: $k_0 = 0.1$ m²/s², $\varepsilon_0 = 1.0$ m²/s³ at $t = 0$; standard $C_{\varepsilon2} = 1.92$.`,
    find: md`$k$, $\varepsilon$ and $\nu_T$ after 1 s.`,
    assumptions: 'Homogeneous turbulence: convection, diffusion and production drop out of (9.92)–(9.93).',
    steps: [
      { title: 'Reduced equations', md: md`$dk/dt = -\varepsilon$ and $d\varepsilon/dt = -C_{\varepsilon2}\varepsilon^2/k$. Try $k = k_0(1+t/\tau)^{-n}$: consistency requires $n = 1/(C_{\varepsilon2}-1) = 1/0.92 = 1.087$ and $\tau = k_0/[(C_{\varepsilon2}-1)\varepsilon_0] = 0.1/0.92 = 0.1087$ s.` },
      { title: 'Evaluate at t = 1 s', md: md`$1 + t/\tau = 1 + 9.2 = 10.2$. $k = 0.1\times10.2^{-1.087} = 8.01\times10^{-3}$ m²/s²; $\varepsilon = 1.0\times10.2^{-1.92/0.92} = 7.85\times10^{-3}$ m²/s³.` },
      { title: 'Eddy viscosity', md: md`$\nu_{T0} = 0.09\times0.1^2/1 = 9.0\times10^{-4}$ m²/s; $\nu_T(1\,\text{s}) = 0.09\times(8.01\times10^{-3})^2/(7.85\times10^{-3}) = 7.35\times10^{-4}$ m²/s.` },
    ],
    answer: md`After 1 s: $k \approx 8.0\times10^{-3}$ m²/s² (−92 %), $\varepsilon \approx 7.9\times10^{-3}$ m²/s³ (−99 %), but $\nu_T \approx 7.4\times10^{-4}$ m²/s (only −18 %).`,
    insight: 'k and ε fall together, so k²/ε — and hence νT — changes slowly: the eddies get weaker but also bigger.',
  },

  /* ---- Example 9.4 ---- */
  {
    id: 'ex-94',
    concept: 'cfd-orifice',
    title: 'Example 9.4 — Flow through an orifice plate (COMSOL, k–ε)',
    src: wk('508–514', 'Example 9.4'),
    difficulty: 2,
    given: md`Water, $\rho = 62.4$ lbm/ft³, $\nu = 1.077\times10^{-5}$ ft²/s; pipe $L = 0.5$ ft, $D = 0.1$ ft; orifice plate starting $b = 0.1$ ft from the inlet (Fig. E9.4.1); uniform axial inlet velocity $v_\text{inlet} = 1.0$ ft/s; zero exit pressure.`,
    find: md`The finite-element mesh, (time-averaged) streamlines and surface plots of velocity magnitude, $\nu_T$, $k$ and $\ln\varepsilon$; the centreline pressure.`,
    assumptions: 'Steady (time-averaged), axisymmetric, incompressible; standard k–ε model with wall functions.',
    steps: [
      { title: 'Is the flow turbulent?', md: md`$\mathrm{Re} = v_\text{inlet}D/\nu = (1.0)(0.1)/(1.077\times10^{-5}) = 9{,}285$ — well into the turbulent region even upstream of the plate.` },
      { title: 'Physics and geometry', md: md`COMSOL **2-D axisymmetric** Turbulent Flow k–ε, stationary study. Half-section rectangle 0.05 ft ($r$) × 0.5 ft ($z$); subtract the plate rectangle 0.02 × 0.01 ft at $(r, z) = (0.03, 0.1)$ ft and a circle of radius 0.005 ft at $(0.03, 0.105)$ ft — a plate 0.01 ft thick with a rounded tip reaching $r = 0.025$ ft.` },
      { title: 'Fluid and boundary conditions', md: md`Density rho1, dynamic viscosity nu1·rho1. Walls: **wall functions** (default); $r = 0$: axial symmetry; $z = 0$: inlet with $U_0$ = Vinlet; $z = 0.5$ ft: pressure outlet, reference pressure zero.` },
      { title: 'Mesh and convergence aid', md: md`"Normal" mesh: 18,078 elements. A parametric sweep on viscosity, nu1 = 1.077e-3 → 1.077e-4 → 1.077e-5 ft²/s, starts at 100× the true value to damp instabilities and steps down to the true value.` },
      { title: 'Solve', md: md`51,820 degrees of freedom (the number of unknowns in the simultaneous nonlinear equations, including any Dirichlet boundary conditions), about 5 min. A "Coarse" mesh (9,702 elements, 29,585 DOF) takes about 1 min and gives a similar solution.` },
      { title: 'Results: mesh and streamlines', md: md`Elements concentrate near the walls and especially at the plate, where velocity gradients are highest (an extra-coarse 3,281-element mesh is drawn for clarity). Streamlines (time-averaged motion, not actual water paths) show the **contraction** through the orifice and a **very substantial recirculating eddy** in the backwater downstream of the plate.` },
      { title: 'Results: velocity and turbulence', md: md`Maximum velocity on the centreline a little downstream of the orifice, ≈ 0.05 m (0.16 ft) from the inlet: **≈ 1.48 m/s = 4.85 ft/s**. A plume of strongly enhanced turbulence spreads from the orifice: $\nu_T$ keeps increasing to the exit, maximum ≈ $5.9\times10^{-3}$ — **almost 550 times** the molecular value; $k$ rises along the plume then subsides by the exit; $\varepsilon$ is extremely high at the plate tip (hence the $\ln\varepsilon$ plot) and decays somewhat faster than $k$.` },
      { title: 'Results: centreline pressure (Fig. E9.4.4)', md: md`From ≈ 720 Pa at the inlet the pressure falls sharply but smoothly (Bernoulli: the velocity rises from 1.0 to ≈ 4.85 ft/s) to a minimum at the **vena contracta**, then partly recovers towards zero at the outlet — consistent with the macroscopic orifice analysis of Wilkes p. 87.` },
    ],
    answer: md`Re = 9,285 (turbulent). Contraction + large recirculating eddy; $v_\text{max} \approx 1.48$ m/s on the axis ≈ 0.05 m from the inlet; $\nu_{T,\max} \approx 550\,\nu$ in the plume; $\varepsilon$ concentrated at the orifice tip; centreline pressure 720 Pa → minimum at the vena contracta → partial recovery to 0.`,
    insight: 'A k–ε solution gives far more than a pressure drop: it shows where turbulence is made (the tip), where it is carried (the plume) and where energy is lost (the eddy).',
  },
  {
    id: 'ex-94-check',
    concept: 'cfd-orifice',
    title: 'Checking Fig. E9.4.4 with continuity, Bernoulli and Borda–Carnot',
    difficulty: 2,
    given: md`Example 9.4 in SI: $\rho = 62.4\times16.018 = 999.6$ kg/m³, $v_\text{inlet} = 0.3048$ m/s, $\beta = d/D = 0.05/0.1 = 0.5$; CFD centreline maximum 1.48 m/s; Fig. E9.4.4: inlet ≈ 716 Pa, minimum ≈ −331 Pa, outlet ≈ 0.`,
    find: md`(a) Orifice mean velocity; (b) Bernoulli drop inlet → vena contracta; (c) the Borda–Carnot loss and recovery; compare with the figure.`,
    steps: [
      { title: '(a) Continuity', md: md`$v_o = v_\text{inlet}/\beta^2 = 0.3048/0.25 = 1.219$ m/s. The CFD maximum (1.48 m/s) is higher because the jet keeps contracting: effective $C_c = 1.219/1.48 = 0.82$.` },
      { title: '(b) Bernoulli', md: md`$\Delta p = \tfrac12\rho(v_{vc}^2 - v_\text{inlet}^2) = \tfrac12(999.6)(1.48^2 - 0.3048^2) = 1048$ Pa. Figure: $716 - (-331) = 1047$ Pa — excellent agreement.` },
      { title: '(c) Loss and recovery', md: md`$\Delta p_\text{loss} \approx \tfrac12\rho(v_{vc}-v)^2 = \tfrac12(999.6)(1.48-0.3048)^2 = 690$ Pa, against ≈ 716 Pa net inlet-to-outlet drop in the figure (which also contains some wall friction). Predicted recovery $= \rho v(v_{vc}-v) = 999.6(0.3048)(1.175) = 358$ Pa vs ≈ 331 Pa in the figure.` },
    ],
    answer: md`$v_o = 1.22$ m/s; Bernoulli drop ≈ 1048 Pa (CFD 1047 Pa); permanent loss ≈ 690 Pa (CFD ≈ 716 Pa); recovery ≈ 358 Pa (CFD ≈ 331 Pa).`,
    insight: 'Simple 1-D balances reproduce the CFD pressure numbers to within ≈ 10 % — the CFD adds where and why, the balances check how much.',
  },

  /* ---- Example 9.5 ---- */
  {
    id: 'ex-95',
    concept: 'cfd-u-duct',
    title: 'Example 9.5 — Turbulent flow in an obstructed U-duct (COMSOL, k–ε)',
    src: wk('514–519', 'Example 9.5'),
    difficulty: 2,
    given: md`The 2-D duct of Fig. E9.5.1 (extends indefinitely normal to the plane). Two reacting gases, each $\rho = 1.18$ kg/m³, $\nu = 1.83\times10^{-5}$ m²/s, enter at the top left with $V_1 = 30$ m/s and $V_2 = 10$ m/s (inlets 0.1 m wide) and leave at the bottom left at zero pressure.`,
    find: md`(a) Re based on the 0.4 m channel after mixing — is the flow turbulent (Re > 5,000)? (b) A k–ε solution. (c) Plots of velocity magnitude, $\nu_T$, pressure, $\log k$, $\log\varepsilon$, velocity arrows and streamlines, with comments.`,
    steps: [
      { title: '(a) Mean velocity after mixing', md: md`$\bar V = (30\times0.1 + 10\times0.1)/0.4 = 10$ m/s.` },
      { title: '(a) Reynolds number', md: md`$\mathrm{Re} = \bar V W/\nu = 10\times0.4/1.83\times10^{-5} = 218{,}530$ (as printed; direct arithmetic 218,579) — highly turbulent.` },
      { title: '(b) Model set-up', md: md`COMSOL **2-D** (planar) Turbulent Flow k–ε, stationary. Parameters rho1, nu1, V1, V2, mu1 = nu1·rho1. Geometry: r1 (4 × 1 m) minus r2 (3.5 × 0.2 at (0, 0.4)), r3 (0.5 × 0.2 at (0, 0.7)), r4 (0.5 × 0.2 at (1.5, 0.2)), r5 (0.5 × 0.2 at (2.5, 0)). Walls: wall functions; Inlet 1 (edge #7) $U_0$ = V1; Inlet 2 (edge #4) $U_0$ = V2; Outlet (edge #1) pressure 0, backflow suppression off, normal flow.` },
      { title: '(b) Mesh and solve', md: md`"Fine" mesh: 36,886 elements, 137,685 degrees of freedom; then a user-controlled boundary-layer mesh with 8 layers, stretching factor 1.1, thickness adjustment 1 (Fig. E9.5.2) for a reasonable wall lift-off in viscous units. Solution time 466 s; inspect the convergence plot and the default Wall Resolution plots.` },
      { title: '(c) Streamlines and arrows', md: md`The faster upper jet **entrains** the slower lower jet, creating two clockwise vortices C in the upper channel; in the bottom channel a slower vortex sits just after each step — A (counter-clockwise, behind r5) and B (clockwise, behind r4). The arrow plot shows the upper jet spreading and decelerating as turbulence transfers its momentum transversely; high speeds at the incoming jet and in the two constrictions.` },
      { title: '(c) Velocity, ν_T and ε', md: md`Velocity magnitude is very high at the upper-jet entry and in the constricted areas. $\nu_T$ is largest well downstream of the inlet and of the two lower constrictions: max ≈ **0.170 m²/s ≈ 9,290 ν**. $\varepsilon$ (plotted as its logarithm) is very low in the slow lower entrance jet and rises very rapidly where the flow impinges on the sharp corners of the obstructions. ($\log k$ was computed but is not shown in the book.)` },
      { title: '(c) Pressure', md: md`High at the inlet, low at the exit; very high where the stream **stagnates** on the two outer corners of the bend; lowered by the **Bernoulli effect** where the reduced flow area at the two constrictions accelerates the gas; some recovery near the exit as the flow decelerates.` },
    ],
    answer: md`$\bar V = 10$ m/s, Re ≈ 2.19 × 10⁵ (turbulent). The k–ε solution shows jet entrainment, four recirculation zones (two clockwise C, A counter-clockwise, B clockwise), $\nu_{T,\max} \approx 0.170$ m²/s ≈ 9,290 ν, ε peaks at sharp corners, stagnation highs and Bernoulli lows in the pressure.`,
    insight: 'Every bluff step makes its own eddy and its own burst of dissipation — exactly the "turbulence convected from upstream and recirculated from downstream" that mixing length cannot handle.',
  },
  {
    id: 'ex-95-scales',
    concept: 'cfd-u-duct',
    title: 'Pressure scales behind Fig. E9.5.8',
    difficulty: 2,
    given: md`Example 9.5: $\rho = 1.18$ kg/m³, $V_1 = 30$ m/s, $V_2 = 10$ m/s, inlets 0.1 m, channel 0.4 m, constrictions 0.2 m.`,
    find: md`(a) Flow rate and mass flow per unit depth; (b) stagnation rise at the bend corners A for the fast jet; (c) mean speed and Bernoulli pressure drop from the 0.4 m channel into a 0.2 m gap.`,
    steps: [
      { title: '(a) Flow rates', md: md`$Q' = 30(0.1)+10(0.1) = 4.0$ m²/s; $\dot m' = \rho Q' = 1.18\times4.0 = 4.72$ kg/(s·m).` },
      { title: '(b) Stagnation', md: md`$\tfrac12\rho V_1^2 = \tfrac12(1.18)(30^2) = 531$ Pa — the order of the "very high" pressure at corners A (the mixed mean flow carries only $\tfrac12\rho\bar V^2 = 59$ Pa).` },
      { title: '(c) Constriction', md: md`$V_\text{gap} = 4.0/0.2 = 20$ m/s. Bernoulli from 10 to 20 m/s: $\Delta p = \tfrac12(1.18)(20^2-10^2) = 177$ Pa lower in the gap — the lows at B and C.` },
    ],
    answer: md`$Q' = 4.0$ m²/s, $\dot m' = 4.72$ kg/(s·m); stagnation scale ≈ 531 Pa; gap speed 20 m/s with a Bernoulli drop ≈ 177 Pa (gap dynamic pressure 236 Pa).`,
    insight: 'Hand estimates tell you the size of the features a CFD plot shows only qualitatively — and help you judge whether the plot is "reasonable", as Wilkes insists.',
  },
]

/* ------------------------------------------------------------------------------------------------ practice */

export const practice: PracticeDef[] = [
  /* ---- stress partition ---- */
  {
    id: 'pr-sp-midradius',
    concept: 'stress-partition',
    difficulty: 1,
    q: md`In fully developed turbulent water flow ($\mu = 1.0\times10^{-3}$ Pa·s) the wall shear stress is $\tau_w = 5.0$ Pa. At mid-radius ($r/a = 0.5$) the Reynolds stress is measured as 2.45 Pa. Find the viscous stress and the mean velocity gradient $d\overline{v}_z/dy$ there.`,
    hint: 'The total stress at radius r is known exactly from (9.85).',
    answer: md`Viscous stress 0.050 Pa; $d\overline{v}_z/dy = 50$ s⁻¹.`,
    solution: md`Total stress (9.85): $\tau_w r/a = 5.0\times0.5 = 2.50$ Pa.

Viscous $= 2.50 - 2.45 = 0.050$ Pa, so $d\overline{v}_z/dy = 0.050/(1.0\times10^{-3}) = 50$ s⁻¹.

The eddies carry 98 % of the shear at mid-radius.`,
    check: [{ label: 'velocity gradient', value: 50, units: 's⁻¹' }],
  },
  {
    id: 'pr-sp-dpdz',
    concept: 'stress-partition',
    difficulty: 1,
    q: md`A pipe of radius $a = 0.04$ m carries turbulent flow with wall shear stress $\tau_w = 3.0$ Pa. (a) Use (9.82) to find $d\overline{p}/dz$. (b) What is the total shear stress at $r = 0.01$ m, and does it depend on whether the flow is laminar or turbulent?`,
    hint: 'Equation (9.82) is a force balance; (9.85) gives the total stress.',
    answer: md`(a) $d\overline{p}/dz = -150$ Pa/m; (b) 0.75 Pa, the same for laminar or turbulent flow.`,
    solution: md`(a) $-\tau_w = (a/2)\,d\overline{p}/dz \Rightarrow d\overline{p}/dz = -2\tau_w/a = -2(3.0)/0.04 = -150$ Pa/m.

(b) Total stress $= \tau_w r/a = 3.0\times0.01/0.04 = 0.75$ Pa. The linear distribution comes only from the force balance, so it holds for any fully developed pipe flow; turbulence changes only *how* it is split between viscous and Reynolds parts.`,
    check: [
      { label: 'dp/dz', value: -150, units: 'Pa/m' },
      { label: 'total stress at r = 0.01 m', value: 0.75, units: 'Pa' },
    ],
  },
  {
    id: 'pr-sp-usagi',
    concept: 'stress-partition',
    difficulty: 2,
    q: md`Two asymptotes have the values $y_0 = 2$ and $y_\infty = 5$ at some $x$. Using the Churchill–Usagi formula (9.87), find the blended value $y$ for (a) $p = -8/7$ and (b) $p = -4$. Which asymptote does the blend approach as $p\to-\infty$?`,
    hint: 'y = (y₀ᵖ + y∞ᵖ)^(1/p).',
    answer: md`(a) $y = 1.537$; (b) $y = 1.987$; as $p\to-\infty$, $y\to\min(y_0, y_\infty) = 2$.`,
    solution: md`(a) $y = (2^{-8/7} + 5^{-8/7})^{-7/8} = (0.4529 + 0.1589)^{-7/8} = 0.6118^{-0.875} = 1.537$.

(b) $y = (2^{-4}+5^{-4})^{-1/4} = (0.0625+0.0016)^{-1/4} = 1.987$.

A more negative $p$ gives a sharper "corner": the blend clings to the smaller asymptote and the transition region shrinks. With $p = -8/7$ the transition is gentle, which is what turbulent-stress data require.`,
    check: [
      { label: 'y for p = −8/7', value: 1.537 },
      { label: 'y for p = −4', value: 1.987 },
    ],
  },
  {
    id: 'pr-sp-f5',
    concept: 'stress-partition',
    difficulty: 2,
    q: md`Using (9.86) with $a^+ = 2000$, evaluate the Reynolds-stress fraction at $y^+ = 5$. What percentage of the local shear is carried by viscosity there?`,
    hint: 'Compute y₀ = 0.7(y⁺/10)³ and the absolute-value term, then blend with p = −8/7.',
    answer: md`$f \approx 0.080$; viscosity carries about 92 %.`,
    solution: md`$y_0 = 0.7(0.5)^3 = 0.0875$.

Outer term: $\exp(-1/(0.436\times5)) = \exp(-0.4587) = 0.6321$; minus $(1/872)(1+6.95\times5/2000) = 0.00115\times1.0174 = 0.00117$; so $y_\infty = 0.6309$.

$f = (0.0875^{-8/7} + 0.6309^{-8/7})^{-7/8} = (16.18 + 1.693)^{-0.875} = 0.0802$.

Viscous fraction $1 - f = 0.920$, i.e. ≈ 92 % — at the edge of the viscous sublayer the eddies carry only 8 %.`,
    check: [{ label: 'f at y⁺ = 5', value: 0.0802, tol: 0.03 }],
  },

  /* ---- k–ε ---- */
  {
    id: 'pr-ke-nut',
    concept: 'k-epsilon',
    difficulty: 1,
    q: md`In an air flow ($\nu = 1.5\times10^{-5}$ m²/s) a k–ε solution gives $k = 0.02$ m²/s² and $\varepsilon = 0.10$ m²/s³ at a point. Find $\nu_T$ and $\nu_T/\nu$.`,
    hint: 'Equation (9.91) with C_μ = 0.09.',
    answer: md`$\nu_T = 3.6\times10^{-4}$ m²/s, i.e. 24 times the molecular value.`,
    solution: md`$\nu_T = C_\mu k^2/\varepsilon = 0.09\times(0.02)^2/0.10 = 0.09\times4\times10^{-4}/0.10 = 3.6\times10^{-4}$ m²/s.

$\nu_T/\nu = 3.6\times10^{-4}/1.5\times10^{-5} = 24$.`,
    check: [
      { label: 'ν_T', value: 3.6e-4, units: 'm²/s' },
      { label: 'ν_T/ν', value: 24 },
    ],
  },
  {
    id: 'pr-ke-ex95',
    concept: 'k-epsilon',
    difficulty: 2,
    q: md`Example 9.5 reports a maximum eddy viscosity of 0.170 m²/s for a gas with $\nu = 1.83\times10^{-5}$ m²/s. (a) Verify the quoted ratio $\nu_T/\nu$. (b) If $k = 10$ m²/s² at that point, what dissipation rate does (9.91) imply?`,
    src: wk('519', 'Fig. E9.5.6'),
    hint: 'Invert ν_T = C_μ k²/ε for ε.',
    answer: md`(a) ≈ 9,290; (b) $\varepsilon \approx 52.9$ m²/s³.`,
    solution: md`(a) $0.170/1.83\times10^{-5} = 9{,}290$ — matching the caption of Fig. E9.5.6.

(b) $\varepsilon = C_\mu k^2/\nu_T = 0.09\times100/0.170 = 52.9$ m²/s³.`,
    check: [
      { label: 'ratio', value: 9290 },
      { label: 'ε', value: 52.9, units: 'm²/s³' },
    ],
  },
  {
    id: 'pr-ke-budget',
    concept: 'k-epsilon',
    difficulty: 3,
    q: md`In a region of uniform simple shear $d\overline{v}_x/dy = S = 50$ s⁻¹ with $k = 0.1$ m²/s² and $\varepsilon = 1.0$ m²/s³, evaluate per unit mass: (a) $\nu_T$; (b) the production of $k$, $P_k/\rho = \nu_T S^2$; (c) the production and destruction terms of the $\varepsilon$ equation; (d) $dk/dt$ and $d\varepsilon/dt$ if convection and diffusion are negligible.`,
    hint: 'For simple shear the production term of (9.92) is ρν_T S²; the ε production is C_ε1 (ε/k) × that.',
    answer: md`(a) $9.0\times10^{-4}$ m²/s; (b) 2.25 m²/s³; (c) production 32.4, destruction 19.2 m²/s⁴; (d) $dk/dt = 1.25$ m²/s³, $d\varepsilon/dt = 13.2$ m²/s⁴.`,
    solution: md`(a) $\nu_T = 0.09\times0.1^2/1.0 = 9.0\times10^{-4}$ m²/s.

(b) $P_k/\rho = \nu_T S^2 = 9.0\times10^{-4}\times2500 = 2.25$ m²/s³.

(c) $\varepsilon$ production $= C_{\varepsilon1}C_\mu k S^2 = 1.44\times0.09\times0.1\times2500 = 32.4$ m²/s⁴ (check: $C_{\varepsilon1}(\varepsilon/k)P_k/\rho = 1.44\times10\times2.25 = 32.4$ ✓). Destruction $= C_{\varepsilon2}\varepsilon^2/k = 1.92\times1/0.1 = 19.2$ m²/s⁴.

(d) $dk/dt = 2.25 - 1.0 = 1.25$ m²/s³; $d\varepsilon/dt = 32.4 - 19.2 = 13.2$ m²/s⁴. Production exceeds dissipation, so the turbulence grows.`,
    check: [
      { label: 'P_k/ρ', value: 2.25, units: 'm²/s³' },
      { label: 'dk/dt', value: 1.25, units: 'm²/s³' },
      { label: 'dε/dt', value: 13.2, units: 'm²/s⁴' },
    ],
  },

  /* ---- Example 9.4 ---- */
  {
    id: 'pr-94-re',
    concept: 'cfd-orifice',
    difficulty: 1,
    q: md`For the pipe of Example 9.4 ($D = 0.1$ ft, $\nu = 1.077\times10^{-5}$ ft²/s): (a) what is Re if the inlet velocity is doubled to 2.0 ft/s? (b) What Reynolds numbers correspond to the first two steps of the viscosity sweep, nu1 = 1.077e-3 and 1.077e-4 ft²/s, at 1.0 ft/s?`,
    hint: 'Re = vD/ν works directly in ft units.',
    answer: md`(a) 18,570; (b) ≈ 92.9 and ≈ 929.`,
    solution: md`(a) $\mathrm{Re} = 2.0\times0.1/1.077\times10^{-5} = 18{,}570$.

(b) $1.0\times0.1/1.077\times10^{-3} = 92.9$ and $1.0\times0.1/1.077\times10^{-4} = 929$. The sweep therefore starts from easy, laminar-like problems and uses each converged solution as the starting guess for the next — which is how it damps instabilities.`,
    check: [
      { label: 'Re at 2 ft/s', value: 18570 },
      { label: 'Re for nu1 = 1.077e-3', value: 92.9 },
    ],
  },
  {
    id: 'pr-94-orifice-mean',
    concept: 'cfd-orifice',
    difficulty: 2,
    q: md`In Example 9.4 the orifice diameter is $d = 0.05$ ft in a $D = 0.1$ ft pipe; water ($\rho = 999.6$ kg/m³) enters at 0.3048 m/s. (a) Find the mean velocity in the orifice. (b) Estimate with Bernoulli the pressure drop from the inlet to the orifice plane. (c) Why is the CFD minimum pressure lower still?`,
    hint: 'Continuity with area ratio (d/D)².',
    answer: md`(a) 1.219 m/s; (b) ≈ 696 Pa; (c) the jet keeps contracting to a vena contracta downstream (CFD max 1.48 m/s), so the pressure keeps falling to ≈ 1,047 Pa below the inlet value.`,
    solution: md`(a) $v_o = 0.3048/(0.05/0.1)^2 = 0.3048/0.25 = 1.219$ m/s.

(b) $\Delta p = \tfrac12(999.6)(1.219^2 - 0.3048^2) = \tfrac12(999.6)(1.4864-0.0929) = 696$ Pa.

(c) The streamlines cannot turn sharply at the plate edge, so the jet narrows further downstream; its centreline speed reaches ≈ 1.48 m/s at the vena contracta (≈ 0.05 m from the inlet). Bernoulli with 1.48 m/s gives ≈ 1,048 Pa, matching the plotted minimum (716 → −331 Pa).`,
    check: [
      { label: 'v_o', value: 1.219, units: 'm/s' },
      { label: 'Δp to orifice', value: 696, units: 'Pa' },
    ],
  },
  {
    id: 'pr-94-nut',
    concept: 'cfd-orifice',
    difficulty: 2,
    q: md`Wilkes quotes $\nu_{T,\max} \approx 5.9\times10^{-3}$ for Example 9.4, "almost 550 times" the molecular viscosity $1.077\times10^{-5}$ ft²/s. (a) Check the ratio and deduce the units of 5.9e-3. (b) Convert to m²/s. (c) Using (9.91), what $\varepsilon$ would give this $\nu_T$ where $k = 0.1$ m²/s²?`,
    src: wk('513', 'discussion of Fig. E9.4.3'),
    hint: '1 ft² = 0.09290 m².',
    answer: md`(a) 548 — the value must be in ft²/s; (b) $5.48\times10^{-4}$ m²/s; (c) $\varepsilon \approx 1.64$ m²/s³.`,
    solution: md`(a) $5.9\times10^{-3}/1.077\times10^{-5} = 548$ ✓ — consistent only if 5.9e-3 is in ft²/s.

(b) $5.9\times10^{-3}\times0.3048^2 = 5.48\times10^{-4}$ m²/s.

(c) $\varepsilon = C_\mu k^2/\nu_T = 0.09\times0.01/5.48\times10^{-4} = 1.64$ m²/s³.

(Note: the colour bar of Fig. E9.4.3(a) tops out near $3.2\times10^{-4}$, apparently in m²/s, i.e. ≈ 320 ν; the printed maximum and the figure seem to come from slightly different runs.)`,
    check: [
      { label: 'ratio', value: 548 },
      { label: 'ν_T in SI', value: 5.48e-4, units: 'm²/s' },
      { label: 'ε', value: 1.64, units: 'm²/s³' },
    ],
  },

  /* ---- Example 9.5 ---- */
  {
    id: 'pr-95-re',
    concept: 'cfd-u-duct',
    difficulty: 1,
    q: md`Repeat Example 9.5(a) with $V_1 = 40$ m/s (all else unchanged: $V_2 = 10$ m/s, inlets 0.1 m, $W = 0.4$ m, $\nu = 1.83\times10^{-5}$ m²/s). Is the k–ε approach justified?`,
    hint: 'Continuity per unit depth first, then Re = V̄W/ν.',
    answer: md`$\bar V = 12.5$ m/s, Re ≈ 2.73 × 10⁵ ≫ 5,000 — yes, turbulent.`,
    solution: md`$\bar V = (40\times0.1 + 10\times0.1)/0.4 = 5.0/0.4 = 12.5$ m/s.

$\mathrm{Re} = 12.5\times0.4/1.83\times10^{-5} = 273{,}200$, far above Wilkes's threshold of about 5,000, so a turbulence model is needed.`,
    check: [
      { label: 'V̄', value: 12.5, units: 'm/s' },
      { label: 'Re', value: 273200 },
    ],
  },
  {
    id: 'pr-95-bl',
    concept: 'cfd-u-duct',
    difficulty: 2,
    q: md`The boundary-layer mesh of Example 9.5 uses 8 layers with stretching factor 1.1 (Fig. E9.5.2). If the first layer is 0.5 mm thick, find (a) the thickness of the 8th layer and (b) the total thickness of the stack.`,
    hint: 'Geometric series: hᵢ = h₁ r^(i−1).',
    answer: md`(a) 0.974 mm; (b) 5.72 mm.`,
    solution: md`(a) $h_8 = 0.5\times1.1^7 = 0.5\times1.949 = 0.974$ mm.

(b) $H_8 = h_1(r^8-1)/(r-1) = 0.5\times(2.1436-1)/0.1 = 0.5\times11.436 = 5.72$ mm.

The outermost layer is only about twice the first, so the prism layers merge smoothly into the triangular mesh.`,
    check: [
      { label: 'h₈', value: 0.974, units: 'mm' },
      { label: 'total', value: 5.72, units: 'mm' },
    ],
  },
  {
    id: 'pr-95-gap',
    concept: 'cfd-u-duct',
    difficulty: 2,
    q: md`For Example 9.5 ($\rho = 1.18$ kg/m³, $Q' = 4.0$ m²/s): estimate (a) the mean speed in the 0.2 m gap above r5, (b) the Bernoulli pressure drop from the 0.4 m channel (mean 10 m/s) into the gap, and (c) explain in one sentence why the pressure "recovers somewhat" near the exit.`,
    hint: 'Continuity, then Bernoulli between mean speeds.',
    answer: md`(a) 20 m/s; (b) ≈ 177 Pa; (c) after the last constriction the flow widens and decelerates, converting part of its kinetic energy back into pressure.`,
    solution: md`(a) $V_\text{gap} = 4.0/0.2 = 20$ m/s.

(b) $\Delta p = \tfrac12\rho(20^2 - 10^2) = \tfrac12(1.18)(300) = 177$ Pa.

(c) Beyond r4 the channel opens back to 0.4 m; the decelerating flow regains some pressure (partial recovery), the rest being lost to the eddy B and turbulence dissipation.`,
    check: [
      { label: 'V_gap', value: 20, units: 'm/s' },
      { label: 'Δp', value: 177, units: 'Pa' },
    ],
  },
]

/* ------------------------------------------------------------------------------------------------ quiz */

export const quiz: QuizQ[] = [
  {
    id: 'q-sp-nearwall',
    concept: 'stress-partition',
    difficulty: 1,
    q: 'Very close to the wall of a turbulent pipe (y⁺ < 5), which part of (9.85) carries almost all of the total shear stress?',
    options: ['The viscous stress μ dv̄z/dy', 'The Reynolds stress ρ v′z v′r', 'Both carry about half each', 'Neither — the total stress is zero at the wall'],
    answer: 0,
    explain: 'Fluctuations must vanish at a no-slip wall, so the Reynolds stress falls to zero there and viscosity carries τw (Fig. 9.12). The total stress is maximum (τw), not zero, at the wall — it is zero on the centreline.',
    src: W504,
  },
  {
    id: 'q-sp-linear',
    concept: 'stress-partition',
    difficulty: 2,
    q: 'How does the total shear stress vary across a pipe in fully developed turbulent flow?',
    options: [
      'Linearly, from zero on the axis to τw at the wall — exactly as in laminar flow',
      'It is nearly constant across the turbulent core and drops only near the axis',
      'It follows the velocity profile, being largest on the centreline',
      'It is concentrated in the viscous sublayer and negligible elsewhere',
    ],
    answer: 0,
    explain: 'Integrating the momentum balance (9.81)–(9.84) gives total = τw r/a, a pure force balance independent of laminar or turbulent flow. Turbulence only changes the split between viscous and Reynolds parts.',
    src: W504,
  },
  {
    id: 'q-sp-usagi',
    concept: 'stress-partition',
    difficulty: 2,
    q: 'In the Churchill–Usagi blend [y]ᵖ = [y₀]ᵖ + [y∞]ᵖ used in (9.86), the exponent p = −8/7 is negative. What does that mean?',
    options: [
      'Over each part of the range the smaller asymptote dominates the blend',
      'Over each part of the range the larger asymptote dominates the blend',
      'The blend is the arithmetic mean of the two asymptotes',
      'The correlation predicts a negative Reynolds stress near the wall',
    ],
    answer: 0,
    explain: 'For p < 0, yᵖ is huge when y is small, so the smaller asymptote controls the sum; e.g. near the wall 0.7(y⁺/10)³ ≪ y∞ and f ≈ 0.7(y⁺/10)³. A positive p would select the larger asymptote.',
    src: W505,
  },
  {
    id: 'q-sp-purpose',
    concept: 'stress-partition',
    difficulty: 1,
    q: 'According to Churchill (quoted by Wilkes), what is the primary purpose of correlation (9.86)?',
    options: [
      'To give almost exact predictions of the velocity v̄z and the mean velocity v̄zm',
      'To replace the k–ε model in complex geometries',
      'To predict the onset of turbulence at Re ≈ 2000',
      'To measure the Reynolds stress directly from pressure-drop data',
    ],
    answer: 0,
    explain: 'Substituted into (9.85) it gives the ODE (9.88), whose integration yields the profile, the mean velocity and the friction factor. It applies to simple geometries (pipes), not to the complex flows k–ε handles.',
    src: W505,
  },
  {
    id: 'q-ke-local',
    concept: 'k-epsilon',
    difficulty: 1,
    q: 'Why does Wilkes say mixing-length theory has an "insurmountable" drawback for general turbulent flows?',
    options: [
      'It is local: it cannot account for turbulence convected from upstream (or, in recirculating flow, from downstream)',
      'It cannot reproduce the logarithmic velocity profile in a pipe',
      'It requires solving two extra partial differential equations',
      'It is only valid for laminar flow',
    ],
    answer: 0,
    explain: 'Mixing length ties the fluctuations to the local mean gradient (v′x ∝ dv̄x/dy), so turbulence generated elsewhere — e.g. behind an orifice plate — cannot be carried to a point. It works well in pipes (it gives the log law); it is k–ε that needs two extra PDEs.',
    src: W506,
  },
  {
    id: 'q-ke-scaling',
    concept: 'k-epsilon',
    difficulty: 2,
    q: 'At a point, k doubles while ε stays the same. By what factor does the eddy viscosity νT change?',
    options: ['×4', '×2', '×√2', '×1/2'],
    answer: 0,
    explain: 'νT = Cμk²/ε (9.91) is quadratic in k, so doubling k quadruples νT. ×2 would be the answer if νT were linear in k; ×1/2 is what doubling ε (not k) does.',
    src: W506,
  },
  {
    id: 'q-ke-analogy',
    concept: 'k-epsilon',
    difficulty: 2,
    q: 'Which statement about the two transport equations of the k–ε model is correct?',
    options: [
      'The k equation follows from the equations of motion with a little empiricism; the ε equation is obtained largely by analogy',
      'Both are derived exactly from the Navier–Stokes equations with no adjustable constants',
      'The ε equation is exact, while the k equation is purely empirical',
      'Neither contains a convection term, so turbulence cannot be transported',
    ],
    answer: 0,
    explain: 'Wilkes (p. 507): the k equation comes from a long derivation with "a small amount of empiricism"; the ε equation is "largely by analogy" (less rigour). Both contain convection by the mean flow — the key improvement over mixing length — and five fitted constants (9.94).',
    src: W507,
  },
  {
    id: 'q-ke-wallfn',
    concept: 'k-epsilon',
    difficulty: 2,
    q: 'What does COMSOL’s default “wall functions” boundary condition assume near a wall?',
    options: [
      'The velocity component parallel to the wall varies logarithmically with distance from the wall',
      'The velocity is zero at the first mesh node away from the wall',
      'The flow is laminar everywhere within one pipe radius of the wall',
      'k and ε are both zero at every mesh node next to the wall',
    ],
    answer: 0,
    explain: 'Near walls the k–ε equations break down in the viscous layer or would need an impossibly fine mesh, so COMSOL bridges that region with the log law of the universal velocity profile.',
    src: W507,
  },
  {
    id: 'q-94-streamlines',
    concept: 'cfd-orifice',
    difficulty: 1,
    q: 'In Example 9.4 the streamline plot shows a closed recirculating eddy behind the orifice plate. What do those streamlines represent?',
    options: [
      'The time-averaged motion — not the actual (fluctuating) paths of water particles',
      'The instantaneous paths of individual water particles',
      'Lines of constant turbulent kinetic energy',
      'Lines of constant pressure',
    ],
    answer: 0,
    explain: 'A k–ε (RANS) solution computes mean quantities only; Wilkes stresses the streamlines are time-averaged. Real particles wander randomly through and out of the eddy.',
    src: wk('513'),
  },
  {
    id: 'q-94-log',
    concept: 'cfd-orifice',
    difficulty: 2,
    q: 'Why does Wilkes plot ln ε (log(ep)) rather than ε for the orifice-plate flow?',
    options: [
      'ε is extremely high at the orifice tip, so on a linear scale everything else looks uniformly low',
      'COMSOL cannot plot ε directly',
      'ε is negative in the recirculation zone and the logarithm removes the sign',
      'The logarithm of ε equals the turbulent kinetic energy',
    ],
    answer: 0,
    explain: 'The value at the plate tip overshadows the rest; the logarithm reveals the lower values in the plume (which decay somewhat faster than k). ε is never negative.',
    src: wk('511, 513'),
  },
  {
    id: 'q-94-pressure',
    concept: 'cfd-orifice',
    difficulty: 2,
    q: 'Where is the centreline pressure lowest in Example 9.4, and what happens after that point?',
    options: [
      'At the vena contracta just downstream of the plate; the pressure then partly recovers',
      'Exactly at the plate; it then stays constant to the outlet',
      'At the outlet; it decreases monotonically along the whole pipe',
      'At the inlet; it rises through the orifice',
    ],
    answer: 0,
    explain: 'The jet keeps contracting after the plate, so the speed peaks (≈ 1.48 m/s) and the pressure bottoms out at the vena contracta (Bernoulli); afterwards kinetic energy partly turns back into pressure. The recovery is only partial because the eddy dissipates energy.',
    src: wk('513–514'),
  },
  {
    id: 'q-94-sweep',
    concept: 'cfd-orifice',
    difficulty: 3,
    q: 'Why does Example 9.4 solve the problem first with nu1 = 100× and 10× the true viscosity?',
    options: [
      'Artificially high viscosity damps out instabilities; each solution is the starting guess for the next, lower viscosity',
      'The true viscosity of water is uncertain, so three values bracket it',
      'To show that the result is independent of viscosity',
      'Because COMSOL requires three parameter values for any sweep',
    ],
    answer: 0,
    explain: 'A parametric sweep is a convergence aid: at Re ≈ 93 and ≈ 929 the nonlinear problem is easy; the converged answer seeds the next step until the true viscosity (Re = 9,285) is reached.',
    src: wk('510'),
  },
  {
    id: 'q-95-pressure',
    concept: 'cfd-u-duct',
    difficulty: 2,
    q: 'In Example 9.5 the pressure is very high at the two outer corners of the U-bend. Why?',
    options: [
      'The stream stagnates there, converting its kinetic energy into pressure',
      'Turbulent dissipation is largest there',
      'The flow area is smallest there, so the gas accelerates',
      'It is an artefact of the zero-pressure outlet condition',
    ],
    answer: 0,
    explain: 'Fluid driven into the outer corners comes to rest (stagnation), giving the very high pressure at A. Acceleration through reduced area (B and C) gives the opposite — low pressure by the Bernoulli effect.',
    src: wk('519', 'Fig. E9.5.8'),
  },
  {
    id: 'q-95-entrain',
    concept: 'cfd-u-duct',
    difficulty: 2,
    q: 'What causes the fast upper jet in Example 9.5 to spread out and slow down along the upper channel?',
    options: [
      'Turbulence transfers its momentum in the transverse direction (and it entrains the slower lower jet)',
      'Molecular viscosity of the gas, since ν = 1.83 × 10⁻⁵ m²/s is large',
      'The zero-pressure outlet pulls the jet towards the divider',
      'Compressibility of the reacting gases',
    ],
    answer: 0,
    explain: 'With νT up to ≈ 9,290 ν, turbulent (Reynolds) stresses dominate momentum transfer; Wilkes attributes the spreading to transverse turbulent momentum transfer, which also drags the slow jet along and drives the clockwise vortices C.',
    src: wk('518', 'Figs. E9.5.3–E9.5.4'),
  },
  {
    id: 'q-95-2d',
    concept: 'cfd-u-duct',
    difficulty: 1,
    q: 'Why is Example 9.5 modelled with COMSOL’s 2-D (planar) interface rather than 2-D axisymmetric as in Example 9.4?',
    options: [
      'The duct extends indefinitely normal to the plane of the figure — there is no axis of symmetry',
      'Gases cannot be modelled in axisymmetric geometry',
      'The Reynolds number is too high for axisymmetric models',
      'Planar models do not need wall functions',
    ],
    answer: 0,
    explain: 'A pipe with an orifice is a body of revolution (axisymmetric); a duct that is infinitely deep normal to the page is a planar 2-D flow, with flow rates per unit depth.',
    src: wk('514'),
  },
]

/* ------------------------------------------------------------------------------------------------ flashcards */

export const flashcards: Flashcard[] = [
  { id: 'fc-sp-985', front: md`Write Wilkes (9.85) and name the three terms.`, back: md`$\tau_w\,r/a = \mu\,d\overline{v}_z/dy + \rho\overline{v_z'v_r'}$: total (linear in $r$) = viscous + Reynolds stress; $y = a - r$. All positive in pipe flow.`, src: W504 },
  { id: 'fc-sp-f', front: md`What is $(\overline{v_z'v_r'})^{++}$ in the Churchill correlation?`, back: md`$\rho\overline{v_z'v_r'}/[\tau_w(r/a)]$ — the **fraction** of the local total stress carried by the Reynolds stress, $f(y^+, a^+)$ (9.86). Near the wall $\approx 0.7(y^+/10)^3$; in the core just under 1.`, src: W505 },
  { id: 'fc-sp-usagi', front: 'What is the Churchill–Usagi interpolation (9.87)?', back: md`$[y]^p \doteq [y_0]^p + [y_\infty]^p$: two asymptotes, each dominant at one end of the range; $p$ is fitted to the data in between ($p = -8/7$ in 9.86).`, src: W505 },
  { id: 'fc-ke-nut', front: md`Eddy viscosity in the k–ε model, and why that form?`, back: md`$\nu_T = C_\mu k^2/\varepsilon$, $C_\mu = 0.09$ (9.91). $\nu_T$ depends only on local $k$ (L²/T²) and $\varepsilon$ (L²/T³); $k^2/\varepsilon$ is the only combination with units L²/T.`, src: W506 },
  { id: 'fc-ke-const', front: 'The five k–ε constants (9.94)?', back: md`$C_\mu = 0.09$, $C_{\varepsilon1} = 1.44$, $C_{\varepsilon2} = 1.92$, $\sigma_k = 1.0$, $\sigma_\varepsilon = 1.3$ — chosen to fit experiments.`, src: W507 },
  { id: 'fc-ke-wall', front: 'What are wall functions and why are they needed?', back: 'Near walls the k–ε equations break down in the viscous layer or need an impossibly fine mesh; COMSOL instead assumes the wall-parallel velocity follows the logarithmic law of the universal velocity profile.', src: W507 },
  { id: 'fc-94-results', front: 'Example 9.4 (orifice, Re = 9,285): four headline results?', back: 'Contraction + large recirculating eddy behind the plate; v_max ≈ 1.48 m/s on the axis ≈ 0.05 m from the inlet; νT,max ≈ 550 ν, growing along the plume; centreline pressure 720 Pa → minimum at the vena contracta → partial recovery to 0.', src: wk('513–514') },
  { id: 'fc-94-eps', front: 'Example 9.4: where is ε largest, and how is it plotted?', back: 'Extremely high at the tip of the orifice plate; plotted as ln ε (log(ep)) so the lower values in the plume (which decay faster than k) remain visible.', src: wk('511, 513') },
  { id: 'fc-94-mesh', front: 'Example 9.4 mesh statistics?', back: 'Normal: 18,078 elements, 51,820 DOF, ≈ 5 min. Coarse: 9,702 elements, 29,585 DOF, ≈ 1 min. Figure shows an extra-coarse 3,281-element mesh. Elements crowd at walls and the plate tip.', src: wk('509–510, 513') },
  { id: 'fc-95-re', front: 'Example 9.5: mixed mean velocity and Re?', back: md`$\bar V = (30\times0.1+10\times0.1)/0.4 = 10$ m/s; $\mathrm{Re} = \bar V W/\nu = 10(0.4)/1.83\times10^{-5} \approx 2.19\times10^5$ (printed 218,530) ≫ 5,000 → turbulent.`, src: wk('515') },
  { id: 'fc-95-vortices', front: 'Example 9.5: the four recirculation zones and their sense?', back: 'Upper channel: two clockwise vortices C (upper jet entrains the lower jet). Lower channel: A counter-clockwise just behind r5; B clockwise just behind r4.', src: wk('518', 'Fig. E9.5.3') },
  { id: 'fc-95-nut', front: 'Example 9.5: maximum νT and where?', back: 'About 0.170 m²/s ≈ 9,290 × ν, well downstream of the inlet and of the two lower constrictions.', src: wk('519', 'Fig. E9.5.6') },
]

/* ------------------------------------------------------------------------------------------------ takeaways */

export const takeaways: string[] = [
  md`In fully developed pipe flow the **total** shear stress is exactly linear, $\tau_w r/a$ — a force balance (9.81)–(9.84). Turbulence only decides how it is **split** between viscous and Reynolds stress (9.85).`,
  md`The Reynolds stress vanishes at the wall and the viscous stress vanishes in the core; they are equal at $y^+ \approx 11$, right at the edge of the classical laminar sublayer.`,
  md`Churchill's correlation (9.86) gives the Reynolds-stress fraction $f(y^+, a^+)$ as a Churchill–Usagi blend (9.87) of a near-wall asymptote $0.7(y^+/10)^3$ and an outer asymptote, with $p = -8/7$.`,
  md`Substituting (9.86) into (9.85) gives the ODE (9.88); integrating it yields $\overline{v}_z$, $\overline{v}_{zm}$ and $f_F$ almost exactly (our integration: within ≈ 2–3 % of the experimental law 9.53).`,
  md`Mixing length is **local** and cannot handle complex geometry or turbulence carried from elsewhere; the k–ε model **transports** two turbulence properties, $k$ (L²/T²) and $\varepsilon$ (L²/T³).`,
  md`Reynolds stresses enter the mean momentum equation as an extra viscosity $\rho\nu_T$ (9.90a), with $\nu_T = C_\mu k^2/\varepsilon$ (9.91) — a flow property, often hundreds to thousands of times $\nu$.`,
  md`Know the five constants: $C_\mu = 0.09$, $C_{\varepsilon1} = 1.44$, $C_{\varepsilon2} = 1.92$, $\sigma_k = 1.0$, $\sigma_\varepsilon = 1.3$ (9.94). Walls are handled by log-law **wall functions**.`,
  md`Example 9.4 (orifice, Re = 9,285): contraction, a large recirculating eddy, a turbulent plume ($\nu_T \approx 550\nu$), $\varepsilon$ concentrated at the plate tip, and a centreline pressure that falls to the vena contracta and only partly recovers.`,
  md`Example 9.5 (U-duct, Re ≈ 2.2 × 10⁵): jet entrainment, four recirculation zones, $\nu_T \approx 9{,}290\nu$, $\varepsilon$ peaks at sharp corners, stagnation highs and Bernoulli lows in the pressure.`,
  md`**Exam trap:** CFD streamlines from k–ε are time-averaged, not particle paths — and k–ε "cannot completely solve all turbulent-flow problems": always check that results look reasonable, e.g. with continuity and Bernoulli estimates.`,
]

/* ------------------------------------------------------------------------------------------------ content */

export default function Content() {
  return (
    <>
      {/* =============================================================== 1. stress partition */}
      <Concept id="stress-partition">
        <Step kind="intro" src={[W503, W504]}>
          <Md>{md`Section 9.11 of Wilkes asks a deceptively simple question: **in a turbulent pipe, who carries the shear stress — the fluid's molecular viscosity, or the turbulent eddies?** The answer (Fig. 9.12) is "both, in very different places": the **turbulent (Reynolds) stress dominates over most of the cross-section** but falls sharply to zero at the wall, while the **viscous stress is the main effect very close to the wall**.

Mixing-length and eddy-viscosity correlations (earlier in Ch. 9) model the Reynolds stress indirectly through $\ell$ or $\nu_T$. S. W. Churchill and S. C. Zajic proposed a valuable alternative for simple geometries that **concentrates on the Reynolds-stress term itself**: a correlation for the fraction of the total stress it carries. That fraction, fed back into the momentum balance, reproduces the velocity profile, the mean velocity and the friction factor almost exactly.`}</Md>
          <Callout kind="note" title="Where this sits">
            <Md>{md`This closes the "pipe-flow" part of Chapter 9 (universal velocity profile, friction factor, Blasius) and sets up §9.12: once we stop prescribing the Reynolds stress and start **computing** it, we arrive at the k–ε model.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture the total shear at a given radius as a **load** that must be carried across that cylindrical surface. Two "porters" share it:

- **Viscosity** passes momentum molecule-to-molecule. It needs a steep velocity gradient to carry much load.
- **Eddies** carry momentum in bulk: a fast lump of fluid lurches towards the wall ($v_r' > 0$) while carrying extra axial velocity ($v_z' > 0$), so $\overline{v_z'v_r'}$ is positive and transports axial momentum outward.

At the wall itself eddies cannot move (no slip, no penetration) — viscosity carries everything, so the gradient there is steep. A few wall units out, eddies have room to work and quickly take over; the gradient relaxes and the velocity profile flattens. The total load, however, is fixed by the pressure gradient alone.`}</Md>
          <Callout kind="tip" title="Sign check without tears">
            <Md>{md`$v_r'$ points **away from the axis, towards the wall**. Fluid moving towards the wall comes from the fast core, so it carries $v_z' > 0$: positive correlation, positive Reynolds stress. Fox writes the same stress as $-\rho\overline{u'v'}$ because his $v$ points *away from* the wall.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={wk('504', 'Fig. 9.12')}>
          <Figure
            caption="Fig. 9.12 recreated: total stress τw r/a (straight line) = viscous + Reynolds stress, centreline at the bottom, wall at the top. Curves computed from (9.85)–(9.86) for a low a⁺ = 300 (Re ≈ 9,300 from integrating 9.88) so the wall layer is visible on a linear scale (the book's sketch is 'not to scale'; at higher Re the wall layer is thinner still)."
            src={wk('504', 'Fig. 9.12')}
          >
            <StressPartitionFigure aPlus={300} />
          </Figure>
          <Md>{md`Read the figure from top to bottom: at the wall the viscous curve reaches $\tau_w$ and the turbulent curve is zero; within a few per cent of the radius they cross; below that the turbulent curve hugs the straight total line all the way to the centreline, where everything is zero.`}</Md>
        </Step>

        <Step kind="equations" src={wk('504–505')}>
          <Md>{md`**Derivation (Wilkes p. 504).** Start from the time-averaged $z$-momentum equation for fully developed pipe flow and integrate once in $r$:`}</Md>
          <FormulaCard id="zmom-turb" />
          <FormulaCard id="tauw-dpdz" />
          <Derivation
            title="From (9.81) to (9.85)"
            steps={[
              { md: md`$\dfrac{d\overline{p}}{dz}=\dfrac{1}{r}\dfrac{d}{dr}\Big[r(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'})\Big]$`, why: '(9.81): mean momentum balance' },
              { md: md`$-2\dfrac{\tau_w}{a}\,r\,dr = d\Big[r(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'})\Big]$`, why: 'substitute dp̄/dz = −2τw/a from (9.82); multiply by r dr' },
              { md: md`$-2\dfrac{\tau_w}{a}\displaystyle\int_0^r r\,dr=\int_0^r d\Big[r(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'})\Big]\;\Rightarrow\; -\dfrac{\tau_w r^2}{a} = r(\overline{\tau}_{rz}-\rho\overline{v_z'v_r'})$`, why: '(9.83); both sides vanish at r = 0' },
              { md: md`$\tau_w\dfrac{r}{a}=-\overline{\tau}_{rz}+\rho\overline{v_z'v_r'}$`, why: '(9.84): divide by −r' },
              { md: md`$\overline{\tau}_{rz}=\mu\dfrac{d\overline{v}_z}{dr}=-\mu\dfrac{d\overline{v}_z}{dy}\;\Rightarrow\;\tau_w\dfrac{r}{a}=\mu\dfrac{d\overline{v}_z}{dy}+\rho\overline{v_z'v_r'}$`, why: '(9.85): y = a − r is distance from the wall' },
            ]}
          />
          <FormulaCard id="int-983" />
          <FormulaCard id="stress-984" />
          <FormulaCard id="stress-sum" />
          <Md>{md`**The Churchill correlation (p. 505).** Churchill and co-workers correlated the *fraction* of the total stress carried by the Reynolds stress. The odd-looking exponents come from the Churchill–Usagi way of interpolating between two asymptotes:`}</Md>
          <FormulaCard id="churchill" />
          <FormulaCard id="usagi" />
          <FormulaCard id="wall-units" />
          <Md>{md`The Churchill–Usagi method comes from S. W. Churchill and R. Usagi (*AIChE J.*, 1972); a further article by Churchill, Shinoda and Arai (2002) gives an excellent historical review of correlation strategies for turbulent pipe flow. Substituting (9.86) into (9.85) with $y = a - r$ and rearranging gives a first-order ODE for the velocity profile:`}</Md>
          <FormulaCard id="vel-ode" />
          <Supplement title="Integrating (9.88) — the route Wilkes describes in words">
            <FormulaCard id="ode-dimless" />
            <Md>{md`Wilkes only states that, once $\overline{v}_z$ and $y$ are made dimensionless, (9.88) can be integrated step by step — first the velocity profile, then the mean velocity, then (as in Section 9.7) the friction factor. The formulas above write that route out (our working, not printed in the book). Numerically: $a^+ = 500 \to f_F = 0.00692$ at Re $= 1.70\times10^4$ (3.0 % above 9.53); $a^+ = 2000 \to 0.00475$ at $8.21\times10^4$ (1.7 % above); $a^+ = 10^4 \to 0.00339$ at $4.86\times10^5$ (2.8 % above).`}</Md>
          </Supplement>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's §8.4 (secondary)">
            <Md>{md`Fox writes the same stress split as Eq. (8.17), with mean velocity $\bar u$ and $y$ from the wall. His Fig. 8.8 (Laufer's data) shows the Reynolds stress following the straight total-stress line $1 - y/R$ over most of the radius, with no data closer than $y/R \approx 0.08$ — so the drop to zero at the wall (Wilkes Fig. 9.12) is not visible there. Fox's friction velocity $u^*$ is Wilkes's $v^*$, and his Darcy factor is $f = 4f_F$.`}</Md>
            <FormulaCard id="fox-817" />
          </Callout>
          <Callout kind="warning" title="Common mistakes">
            <Md>{md`(1) Thinking the total stress profile changes shape in turbulent flow — it is linear in **both** regimes. (2) Using $r$ instead of $y = a - r$ in (9.86): $y^+$ is measured **from the wall**. (3) Reading $p$ in (9.87) as pressure or $y$ as wall distance — they are generic symbols there. (4) Forgetting the absolute value in (9.86).`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-partition-water" />
          <ExampleCard id="ex-asymptotes" />
          <ExampleCard id="ex-friction-from-988" />
        </Step>

        <Step kind="interactive">
          <StressPartitionLab />
          <UsagiBlendDemo />
        </Step>

        <Step kind="practice">
          <PracticeList concept="stress-partition" />
          <QuickCheck ids={['q-sp-nearwall', 'q-sp-usagi']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Total stress $\tau_w r/a$ is linear in $r$ — a force balance, the same for laminar and turbulent flow (9.81)–(9.85).`,
              md`Viscous stress rules at the wall, Reynolds stress in the core; they cross near $y^+ \approx 11$ at any Re.`,
              md`Churchill's $f(y^+, a^+)$ (9.86) = Churchill–Usagi blend (9.87) of $0.7(y^+/10)^3$ and an outer asymptote with $p = -8/7$ (smaller asymptote wins).`,
              md`(9.88) turns $f$ into the velocity profile → $\overline{v}_{zm}$ → $f_F$; Churchill's aim was near-exact $\overline{v}_z$ and $\overline{v}_{zm}$.`,
              md`**Trap:** $y^+$ is from the wall; $a^+$ is the centreline value of $y^+$; Fox's $-\rho\overline{u'v'}$ is Wilkes's $+\rho\overline{v_z'v_r'}$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* =============================================================== 2. k–ε */}
      <Concept id="k-epsilon">
        <Step kind="intro" src={[W506, W507]}>
          <Md>{md`Mixing-length theory explains turbulent pipe velocities well, but as a basis for turbulent flow in general Wilkes lists two **insurmountable** drawbacks:

1. **It is local.** Turbulence at a point can be affected by turbulence convected from upstream — and in recirculating flows even from *downstream*, as in the eddies behind an orifice plate (Fig. 2.19) or a sudden expansion (Fig. 2.21).
2. **It cannot predict turbulent flow patterns for a new situation with complex geometry.**

Mixing length made a fluctuation such as $v_x'$ proportional to a mean gradient such as $d\overline{v}_x/dy$ (Eq. 9.21). **Prandtl and Kolmogorov** argued instead that fluctuations and Reynolds stresses should depend on properties of **the turbulence itself** — its kinetic energy $k$ and the rate $\varepsilon$ at which that energy is dissipated. Section 9.12 builds the k–ε model on that idea; it underlies the COMSOL computations of Examples 9.4 and 9.5 (and Fluent in Wilkes Ch. 13).`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of turbulence as a **bank account of energy**, $k$:

- **Deposits (production):** the mean flow's velocity gradients stretch eddies and feed them energy — strongest in shear layers such as the edge of a jet.
- **Withdrawals (dissipation, $\varepsilon$):** big eddies break into smaller ones until viscosity turns their energy into heat.
- **Transfers:** the account is **carried along** with the mean flow (convection) and spreads out (diffusion). This is exactly what mixing length lacks: an eddy born at an orifice tip can be felt one pipe diameter downstream, where the local gradient may be tiny.

$k$ sets the eddies' **velocity** ($\sqrt{k}$); $k$ and $\varepsilon$ together set their **size** ($k^{3/2}/\varepsilon$) and **lifetime** ($k/\varepsilon$). An eddy viscosity is "velocity × size", so $\nu_T \propto \sqrt{k}\cdot k^{3/2}/\varepsilon = k^2/\varepsilon$.`}</Md>
          <Compare
            items={[
              { title: 'Mixing length', md: md`$\nu_T = \ell^2\lvert d\overline{v}/dy\rvert$: $\ell$ prescribed by a formula; turbulence exists only where there is a local gradient. Algebraic — cheap, but blind to history.`, tone: 'amber' },
              { title: 'k–ε', md: md`$\nu_T = C_\mu k^2/\varepsilon$: $k$ and $\varepsilon$ obey transport PDEs with convection, diffusion, production and dissipation. Turbulence remembers where it came from.`, tone: 'cyan' },
            ]}
          />
        </Step>

        <Step kind="visual">
          <FlowChart
            rows={[
              [{ title: 'Mean-flow kinetic energy', md: md`velocity gradients $\nabla\overline{\mathbf{v}}$`, tone: 'indigo' }],
              [
                { title: 'Turbulent kinetic energy k', md: md`energetic eddies, velocity $\sqrt{k}$, size $k^{3/2}/\varepsilon$`, tone: 'cyan' },
                { title: 'Transport of k (and ε)', md: md`convection $\rho\overline{\mathbf{v}}\cdot\nabla k$ + diffusion $\nabla\cdot[(\mu+\rho\nu_T/\sigma_k)\nabla k]$`, tone: 'violet' },
              ],
              [{ title: 'Internal energy (heat)', md: md`small eddies destroyed by viscosity`, tone: 'rose' }],
            ]}
            arrowLabels={['production  ρνT(∇v̄ + ∇v̄ᵀ)²', 'dissipation  ρε']}
          />
          <Md>{md`The $k$ budget (9.92) in one picture. The $\varepsilon$ equation (9.93) has the same structure, with each source term multiplied by $\varepsilon/k$ and a constant.`}</Md>
          <Figure caption="What a wall function bridges: the universal velocity profile (Eqs. 9.42–9.43). Wilkes: COMSOL assumes the wall-parallel velocity is logarithmic in wall distance. In typical practice (not detailed by Wilkes) the first computational point sits in the log region, so the viscous sublayer and buffer zone (shaded) are never resolved." src={wk('496', 'Eqs. (9.42)–(9.43)')}>
            <Plot
              height={260}
              x={{ label: '$y^+$ (log scale)', domain: [0.5, 1000], log: true }}
              y={{ label: '$v_z^+$', domain: [0, 25] }}
              bands={[{ x0: 0.5, x1: 30, label: 'not resolved (typically)', color: 'color-mix(in srgb, var(--plot-4) 12%, transparent)' }]}
              series={[
                { label: 'sublayer $v_z^+=y^+$ (9.43)', fn: (y) => y, range: [0.5, 14], color: 'var(--plot-4)', width: 2.2 },
                { label: md`log law $5.5+2.5\ln y^+$ (9.42)`, fn: (y) => 5.5 + 2.5 * Math.log(y), range: [5, 1000], color: 'var(--plot-1)', width: 2.4 },
              ]}
              marks={[{ x: 30, y: 5.5 + 2.5 * Math.log(30), label: 'first node', color: 'var(--plot-6)' }]}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={[W506, W507]}>
          <Md>{md`**Definitions.** $k$ is the kinetic energy per unit mass of the fluctuating components; $\varepsilon$ is its rate of dissipation (L²/T³).`}</Md>
          <FormulaCard id="k-def" />
          <Md>{md`**Mean-flow equations.** Start from the momentum balance for constant density and variable viscosity (Wilkes Example 5.9). Include the Reynolds stresses by **adding the eddy viscosity $\rho\nu_T$ to $\mu$** and switching to time-averaged $\overline{\mathbf{v}}$, $\overline{p}$:`}</Md>
          <FormulaCard id="mom-989" />
          <FormulaCard id="mom-990a" />
          <FormulaCard id="cont-990b" />
          <Md>{md`**Closure.** The k–ε hypothesis: $\nu_T$ at a point depends only on $k$ and $\varepsilon$ there. Dimensions then fix the form:`}</Md>
          <Derivation
            title="Dimensional reasoning for (9.91)"
            steps={[
              { md: md`$\nu_T \propto k^a\varepsilon^b,\quad [\nu_T] = \mathrm{L^2T^{-1}},\ [k] = \mathrm{L^2T^{-2}},\ [\varepsilon] = \mathrm{L^2T^{-3}}$`, why: 'assume a power law' },
              { md: md`$\mathrm{L}:\ 2a+2b=2,\qquad \mathrm{T}:\ -2a-3b=-1$`, why: 'match exponents' },
              { md: md`$a = 2,\ b = -1\ \Rightarrow\ \nu_T = C_\mu\,k^2/\varepsilon$`, why: 'unique solution; Cμ is the first adjustable constant' },
            ]}
          />
          <FormulaCard id="nut-ke" />
          <FormulaCard id="ke-scales" />
          <Md>{md`**Transport equations.** $k$ and $\varepsilon$ vary with time and position. The $k$ equation follows from the time-averaged equations of motion by considering viscous dissipation — a long derivation with a small amount of empiricism (Launder & Spalding; Tennekes & Lumley; Libby; Durbin & Petterson Reif; Mathieu & Scott). The $\varepsilon$ equation is obtained largely by **analogy**. Only the final forms are needed:`}</Md>
          <FormulaCard id="k-eq" />
          <FormulaCard id="eps-eq" />
          <FormulaCard id="ke-const" />
          <Callout kind="key" title="Implementation (Wilkes p. 507)">
            <Md>{md`Solve (9.90a), (9.90b), (9.92) and (9.93) **simultaneously** — in 3-D that is six scalar unknowns ($\overline{\mathbf{v}}$, $\overline{p}$, $k$, $\varepsilon$; our count) — "a daunting task" that needs a digital computer. Near walls the equations either break down in the viscous layer or need an impossibly fine mesh, so COMSOL uses **wall functions**: the wall-parallel velocity is assumed to be a logarithmic function of wall distance, as in the universal velocity profile (full details in the COMSOL documentation). Wilkes uses COMSOL (finite-element method) in this chapter and Fluent (finite-volume method) in Chapter 13.`}</Md>
          </Callout>
          <FormulaCard id="log-law-wf" />
          <Supplement title="A homogeneous-turbulence check of the constants">
            <FormulaCard id="ke-decay" />
          </Supplement>
          <Callout kind="warning" title="Caveats Wilkes insists on">
            <Md>{md`Ask whether the results look **reasonable**. The k–ε method gives reasonably good results in many circumstances, but "we should have no illusion" that it can completely solve all turbulent-flow problems — the constants are fitted, the ε equation is largely analogy, and walls are bridged by an assumed log law.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-nut-calc" />
          <ExampleCard id="ex-k-from-fluct" />
          <ExampleCard id="ex-decay" />
        </Step>

        <Step kind="interactive">
          <KEpsCalculator />
          <HomogeneousKELab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="k-epsilon" />
          <QuickCheck ids={['q-ke-scaling', 'q-ke-local']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Mixing length: local, gradient-based, blind to history → fails for recirculation and new complex geometries.`,
              md`k–ε: Reynolds stresses as eddy viscosity $\rho\nu_T$ added to $\mu$ (9.90a), $\nu_T = C_\mu k^2/\varepsilon$ (9.91).`,
              md`$k$ and $\varepsilon$ are **transported**: accumulation + convection = diffusion + production − dissipation (9.92)–(9.93).`,
              md`Constants (9.94): 0.09, 1.44, 1.92, 1.0, 1.3. The $\varepsilon$ equation is the least rigorous part.`,
              md`**Trap:** $\nu_T$ scales with $k^2$, not $k$; and $\nu_T$ is a property of the flow, not the fluid. Walls use log-law wall functions.`,
            ]}
          />
        </Step>
      </Concept>

      {/* =============================================================== 3. orifice */}
      <Concept id="cfd-orifice">
        <Step kind="intro" src={wk('508', 'Example 9.4')}>
          <Md>{md`**Example 9.4** applies COMSOL's k–ε solver to a short length of pipe containing an **orifice plate** — the situation of Wilkes Fig. 2.19, which Chapter 2 treated with a macroscopic analysis (book p. 87). CFD now shows the **inside** of the flow.

**Data:** water, $\rho = 62.4$ lbm/ft³, $\nu = 1.077\times10^{-5}$ ft²/s; pipe $L = 0.5$ ft, $D = 0.1$ ft; plate face $b = 0.1$ ft from the inlet; uniform axial inlet velocity $v_\text{inlet} = 1.0$ ft/s (zero radial velocity); zero exit pressure. $\mathrm{Re} = 9{,}285$ — "well in the turbulent-flow region even upstream of the orifice plate".

**Asked:** the finite-element mesh, (time-averaged) streamlines, and surface plots of velocity magnitude, turbulent kinematic viscosity, turbulent kinetic energy and the logarithm of the dissipation rate; plus the centreline pressure.`}</Md>
          <Callout kind="tip" title="Units">
            <Md>{md`In SI: $\rho = 999.6$ kg/m³, $\nu = 1.0006\times10^{-6}$ m²/s, $v_\text{inlet} = 0.3048$ m/s, $D = 0.03048$ m, $L = 0.1524$ m. COMSOL converts the ft inputs automatically, so the result plots have axes in metres.`}</Md>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Water approaching the plate must squeeze through an opening of half the pipe diameter — one quarter of the area — so it speeds up roughly fourfold. It cannot turn the sharp corner at the plate tip instantly, so the jet keeps **narrowing** for a short distance downstream: the **vena contracta**, where the speed is highest and the pressure lowest (Bernoulli).

Behind the plate the jet is surrounded by slow "backwater" that it drags along; near the wall this fluid turns back upstream, forming a **ring-shaped recirculating eddy**. The thin, violently sheared layer between jet and eddy is a turbulence factory: $k$ is produced there and **convected downstream** as a widening plume — precisely the non-local effect that §9.12 says mixing length cannot capture. Once the jet re-fills the pipe, some kinetic energy turns back into pressure, but the energy fed into the eddies is gone for good: a **permanent pressure loss**.`}</Md>
        </Step>

        <Step kind="visual" src={wk('508–514')}>
          <Figure caption="Fig. E9.4.1 recreated to the COMSOL geometry of Steps 4–8 (true proportions: the plate halves project 0.025 ft each, so d = 0.05 ft and β = 0.5; the book's sketch is not to scale)." src={wk('508', 'Fig. E9.4.1')}>
            <OrificeGeometryFigure />
          </Figure>
          <Figure
            caption="Example 9.4 results, schematic recreation of Figs. E9.4.2–E9.4.3 (flow drawn left→right; the book shows the axisymmetric half with flow upward). Shading is qualitative, built to match the book's Low/Medium/High labels — not CFD output."
            src={wk('511–513', 'Figs. E9.4.2–E9.4.3')}
          >
            <OrificeFieldMaps />
          </Figure>
          <Figure caption="Fig. E9.4.4 re-plotted from the printed curve: centreline pressure from ≈ 720 Pa at the inlet to zero at the outlet. Steep fall through the plate (0.0305–0.0335 m), minimum ≈ −331 Pa at the vena contracta (≈ 0.05 m), S-shaped partial recovery." src={wk('514', 'Fig. E9.4.4')}>
            <Plot
              height={260}
              x={{ label: 'distance from inlet along the axis (m)', domain: [0, 0.1524] }}
              y={{ label: 'pressure (Pa)', domain: [-400, 800] }}
              bands={[{ x0: 0.0305, x1: 0.0335, label: 'orifice plate', color: 'color-mix(in srgb, var(--ink-3) 25%, transparent)' }]}
              vlines={[{ x: 0.051, label: 'vena contracta', color: 'var(--plot-4)', dash: '4 3' }]}
              hlines={[{ y: 0, color: 'var(--ink-3)', dash: '2 3' }]}
              series={[
                {
                  label: 'Fig. E9.4.4 (digitised)',
                  points: [
                    [0, 716], [0.01, 715], [0.015, 709], [0.02, 691], [0.023, 659], [0.025, 614], [0.0267, 550], [0.0284, 450], [0.0297, 350],
                    [0.0308, 250], [0.0319, 150], [0.033, 50], [0.0342, -50], [0.0357, -150], [0.0383, -250], [0.043, -315], [0.051, -331],
                    [0.06, -321], [0.07, -282], [0.08, -225], [0.09, -168], [0.1, -117], [0.11, -74], [0.12, -42], [0.13, -22], [0.14, -9],
                    [0.147, -5], [0.152, -8],
                  ],
                  color: 'var(--plot-1)',
                  width: 2.4,
                },
              ]}
              marks={[{ x: 0.051, y: -331, label: '−331 Pa', color: 'var(--plot-4)' }]}
            />
          </Figure>
          <Callout kind="note" title="Two printed positions for the vena contracta">
            <Md>{md`The text (p. 514) puts the vena contracta at $z \doteq 0.13$ ft (≈ 0.040 m), while the velocity discussion (p. 513) puts the maximum centreline velocity at ≈ 0.05 m (0.16 ft) and the "vena contracta" arrow in Fig. E9.4.4 points at ≈ 0.050 m, where the pressure minimum actually is. Use the figure value (≈ 0.05 m) and mention the discrepancy if asked.`}</Md>
          </Callout>
        </Step>

        <Step kind="equations">
          <Md>{md`The CFD solves (9.90a), (9.90b), (9.92)–(9.94) in axisymmetric form. Hand estimates that let you **check** its answers:`}</Md>
          <FormulaCard id="re-pipe" />
          <FormulaCard id="orifice-cont" />
          <FormulaCard id="bernoulli-vc" />
          <FormulaCard id="borda-carnot" />
          <Callout kind="exam" title="Exam angle">
            <Md>{md`Be able to (i) check Re, (ii) explain each result plot physically (contraction, eddy, plume, ε at the tip, pressure dip and partial recovery), (iii) do a continuity + Bernoulli estimate of the pressure dip, and (iv) explain why the mesh is refined at walls and the plate tip, and why a viscosity sweep is used.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-94" />
          <Md>{md`**COMSOL workflow at a glance** (click-level detail is in the book, pp. 508–512):`}</Md>
          <FlowSteps
            steps={[
              { title: 'Physics & study', md: md`Model Wizard → **2D Axisymmetric** → Turbulent Flow **k–ε**; Stationary study. COMSOL symbols: $u, v, w$ velocity components, **k**, **ep** (= ε).`, tone: 'indigo' },
              { title: 'Parameters', md: md`rho1 = 62.4 lb/ft³, nu1 = 1.077e-5 ft²/s, Vinlet = 1.0 ft/s (converted to SI automatically).`, tone: 'indigo' },
              { title: 'Geometry', md: md`Rectangle 0.05 × 0.5 ft at (0, 0) − plate rectangle 0.02 × 0.01 ft at (0.03, 0.1) − circle $R = 0.005$ ft at (0.03, 0.105).`, tone: 'cyan' },
              { title: 'Material', md: md`Blank material: density rho1, dynamic viscosity nu1·rho1.`, tone: 'cyan' },
              { title: 'Boundary conditions', md: md`Walls: **wall functions** (default); axis: axial symmetry; bottom edge $z = 0$: inlet $U_0$ = Vinlet; top edge $z = 0.5$ ft: pressure outlet, $p_\text{ref} = 0$.`, tone: 'amber' },
              { title: 'Mesh', md: md`Normal: **18,078** elements (Coarse: 9,702).`, tone: 'amber' },
              { title: 'Viscosity sweep & solve', md: md`Parametric sweep nu1 = 1.077e-3, 1.077e-4, 1.077e-5 ft²/s (100×, 10×, true) to damp instabilities; **51,820 DOF**, ≈ 5 min (Coarse: 29,585 DOF, ≈ 1 min).`, tone: 'rose' },
              { title: 'Post-processing', md: md`Mesh plot; streamlines ($u$, $w$; start-point controlled); surfaces of spf.nuT, k, log(ep); Cut Line 2D along the axis (0,0)→(0,0.5) ft, parameter = Last → line graph of $p$ (Fig. E9.4.4).`, tone: 'emerald' },
            ]}
          />
          <Md>{md`| Mesh setting | Elements | Degrees of freedom | Solve time |
|---|---|---|---|
| Normal (used) | 18,078 | 51,820 | ≈ 5 min |
| Coarse | 9,702 | 29,585 | ≈ 1 min |
| Extra coarse (figure only) | 3,281 | — | — |`}</Md>
          <ExampleCard id="ex-94-check" />
        </Step>

        <Step kind="interactive">
          <OrificeExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="cfd-orifice" />
          <QuickCheck ids={['q-94-pressure', 'q-94-log']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Example 9.4: water, $D = 0.1$ ft, $\beta = 0.5$, Re = 9,285; COMSOL 2-D axisymmetric k–ε with wall functions; normal mesh 18,078 elements / 51,820 DOF; viscosity sweep for convergence.`,
              md`Contraction through the orifice, a large recirculating eddy behind the plate; $v_\text{max} \approx 1.48$ m/s on the axis ≈ 0.05 m from the inlet.`,
              md`Turbulence lives in a plume from the orifice: $\nu_T$ grows to the exit (≈ 550 ν), $k$ rises then subsides, $\varepsilon$ is extreme at the tip (plot ln ε).`,
              md`Centreline pressure: Bernoulli dip to the vena contracta (≈ 1,047 Pa below the inlet), then only partial recovery — the rest is the orifice's permanent loss.`,
              md`**Trap:** streamlines are time-averaged, not particle paths; the minimum pressure is at the vena contracta, not at the plate.`,
            ]}
          />
        </Step>
      </Concept>

      {/* =============================================================== 4. U-duct */}
      <Concept id="cfd-u-duct">
        <Step kind="intro" src={wk('514–515', 'Example 9.5')}>
          <Md>{md`**Example 9.5** is a deliberately awkward geometry: a **2-D duct** (it extends indefinitely normal to the page) shaped like a U by a long divider, with two inlets at the top left, two rectangular obstructions in the return leg, and the outlet at the bottom left (Fig. E9.5.1).

**Data:** two reacting gases, each with $\rho = 1.18$ kg/m³ and $\nu = 1.83\times10^{-5}$ m²/s, enter through 0.1 m-wide inlets with $V_1 = 30$ m/s (top) and $V_2 = 10$ m/s (lower), and leave at zero pressure.

**Asked:** (a) Re based on the 0.4 m channel after mixing — is it turbulent (Re > 5,000, say)? (b) If so, a COMSOL k–ε solution. (c) Plots of velocity magnitude, $\nu_T$, pressure, $\log k$, $\log\varepsilon$, velocity arrows and streamlines, with comments.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Expect **jets, steps and corners** — each with a signature:

- A fast jet next to a slow one acts like a conveyor belt dragging its neighbour: **entrainment**, with recirculating fluid trapped in the gaps (vortices C).
- Flow over a step cannot follow the sharp downstream corner: it **separates**, leaving a slowly turning eddy in the lee of the step (A behind r5, B behind r4).
- A stream aimed at a wall **stagnates**: pressure rises by about $\tfrac12\rho V^2$ (the outer corners of the bend).
- A stream forced through half the area doubles its speed and its pressure falls (Bernoulli) — the 0.2 m constrictions.
- Sharp corners and strong shear are where turbulence is born and dissipated fastest: $\varepsilon$ spikes there.`}</Md>
        </Step>

        <Step kind="visual" src={wk('514', 'Fig. E9.5.1')}>
          <Figure caption="Fig. E9.5.1 recreated from Steps 3–5: fluid = r1 (4 m × 1 m) minus r2 (divider), r3 (inlet separator), r4 (block under the divider) and r5 (block on the floor)." src={wk('514–516', 'Fig. E9.5.1')}>
            <UDuctGeometryFigure />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'Physics & parameters', md: md`Model Wizard → **2D** (planar) → Turbulent Flow k–ε; Stationary. rho1 = 1.18 kg/m³, nu1 = 1.83e-5 m²/s, V1 = 30 m/s, V2 = 10 m/s, mu1 = nu1·rho1.`, tone: 'indigo' },
              { title: 'Geometry', md: md`r1 4 × 1 m at (0, 0); r2 (3.5 × 0.2) at (0, 0.4); r3 (0.5 × 0.2) at (0, 0.7); r4 (0.5 × 0.2) at (1.5, 0.2); r5 (0.5 × 0.2) at (2.5, 0); Difference r1 − (r2…r5).`, tone: 'cyan' },
              { title: 'Material & BCs', md: md`Blank material (rho1, mu1). Walls: wall functions. Inlet 1 = edge #7, $U_0$ = V1; Inlet 2 = edge #4, $U_0$ = V2. Outlet = edge #1, pressure 0, suppress backflow **off**, normal flow.`, tone: 'amber' },
              { title: 'Mesh', md: md`Fine: **36,886** elements, **137,685** DOF. Then user-controlled boundary-layer mesh: 8 layers, stretching 1.1, thickness adjustment 1 → reasonable wall lift-off in viscous units (Fig. E9.5.2).`, tone: 'amber' },
              { title: 'Solve', md: md`Compute (≈ **466 s**); watch the Convergence Plot; inspect the default Wall Resolution plots.`, tone: 'rose' },
              { title: 'Plots', md: md`Surfaces: spf.nuT, p, log(k) (not shown in the book), log(ep); Arrow Surface with 40 × 40 grid points; Streamlines with uniform density, separating distance 0.01.`, tone: 'emerald' },
            ]}
          />
        </Step>

        <Step kind="equations" src={wk('515')}>
          <Md>{md`Part (a) is pure continuity plus a Reynolds number; the other relations are hand checks for the result plots.`}</Md>
          <FormulaCard id="mix-mean" />
          <FormulaCard id="re-channel" />
          <FormulaCard id="gap-speed" />
          <FormulaCard id="dyn-pressure" />
          <FormulaCard id="bl-series" />
          <Callout kind="note" title="Printed Re">
            <Md>{md`Wilkes prints Re = 218,530; $10\times0.4/1.83\times10^{-5}$ is actually 218,579. The 0.02 % slip changes nothing — the flow is highly turbulent either way.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-95" />
          <Callout kind="warning" title="Letters change meaning between figures">
            <Md>{md`In the book's Example 9.5 figures, A, B and C are reused: in the **streamlines** (E9.5.3) A and B are the vortices behind r5 and r4 and C the upper-channel vortices; in the **arrow and velocity** plots (E9.5.4–5) A is the incoming jet and B, C the constrictions above r5 and under r4; in **ln ε** (E9.5.7) A is the slow lower jet and B, C the sharp corners; in **pressure** (E9.5.8) A marks the outer bend corners and B, C the constrictions.`}</Md>
          </Callout>
          <Md>{md`**Fig. E9.5.2 — Boundary Layer Properties entered in Step 10:**

| Field | Entry |
|---|---|
| Number of boundary layers | 8 |
| Boundary layer stretching factor | 1.1 |
| Thickness of first layer | Automatic |
| Thickness adjustment factor | 1 |`}</Md>
          <ExampleCard id="ex-95-scales" />
        </Step>

        <Step kind="interactive">
          <UDuctExplorer />
          <BoundaryLayerMeshLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="cfd-u-duct" />
          <QuickCheck ids={['q-95-pressure', 'q-95-entrain']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`$\bar V = (30\times0.1+10\times0.1)/0.4 = 10$ m/s; Re ≈ 2.19 × 10⁵ ≫ 5,000 → k–ε is appropriate.`,
              md`2-D planar model (infinite depth); fine mesh 36,886 elements / 137,685 DOF plus an 8-layer, 1.1-stretch boundary-layer mesh; 466 s.`,
              md`Upper jet entrains the lower jet → two clockwise vortices C; behind the steps: A counter-clockwise (after r5), B clockwise (after r4).`,
              md`$\nu_{T,\max} \approx 0.170$ m²/s ≈ 9,290 ν well downstream; $\varepsilon$ peaks at the sharp corners of the obstructions (plot its log).`,
              md`Pressure: stagnation highs at the outer bend corners, Bernoulli lows in the 0.2 m gaps (≈ 20 m/s), partial recovery near the exit.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
