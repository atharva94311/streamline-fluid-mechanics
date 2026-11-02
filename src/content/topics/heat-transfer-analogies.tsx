import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowChart, FlowRow, FlowSteps, FormulaCard, Md, PracticeList,
  QuickCheck, SourceChips, Step, Supplement, Takeaways, md,
} from '@/kit'
import { EddyFigure } from '../sims/heat-transfer-analogies/EddyFigure'
import { EddyLab } from '../sims/heat-transfer-analogies/EddyLab'
import { TwoLayerLab, TwoLayerProfiles } from '../sims/heat-transfer-analogies/TwoLayer'
import { TableE96Chart } from '../sims/heat-transfer-analogies/TableE96Chart'
import { AnalogyTester } from '../sims/heat-transfer-analogies/AnalogyTester'

/** Wilkes, Ch. 9 — printed page numbers. */
const wil = (pages: string, note?: string): Src => (note ? { doc: 'wilkes', pages, note } : { doc: 'wilkes', pages })

// ---------------------------------------------------------------------------------------------------------------------
// meta
// ---------------------------------------------------------------------------------------------------------------------

export const meta: TopicMeta = {
  id: 'heat-transfer-analogies',
  unit: 'D',
  title: 'Momentum–Heat Transfer Analogies',
  subtitle:
    'Predicting heat transfer from friction: the Reynolds analogy, the Prandtl–Taylor analogy with its laminar sublayer, and how both compare with experiment (Wilkes §9.13 and Example 9.6).',
  minutes: 75,
  sources: [
    { doc: 'wilkes', pages: '520–524', note: '§9.13, Example 9.6' },
    { doc: 'wilkes', pages: '498–500', note: 'Eqs. (9.51), (9.56)–(9.62) used in §9.13' },
    { doc: 'fox', pages: '294, 296', note: 'cross-reference only' },
  ],
  concepts: [
    {
      id: 'reynolds-analogy',
      title: 'The Reynolds analogy: one set of eddies, two fluxes',
      src: wil('520–521', 'Eqs. (9.95)–(9.99), Fig. 9.13'),
      summary: 'Eddies exchanging mass flux m between mainstream and wall carry both momentum and heat, so half the Fanning friction factor equals the Stanton number.',
    },
    {
      id: 'prandtl-taylor',
      title: 'The Prandtl–Taylor analogy: adding a laminar sublayer',
      src: wil('521–522', 'Eqs. (9.100)–(9.103), Fig. 9.14'),
      summary: 'A viscous/conductive sublayer in series with the eddy core brings in the Prandtl number: St = (f_F/2)/[1 + (v_zδ/v_zm)(Pr − 1)], with v_zδ/v_zm = 2.44/Re^(1/8).',
    },
    {
      id: 'analogy-evaluation',
      title: 'Evaluating the analogies (Example 9.6)',
      src: wil('522–524', 'Example 9.6, Table E9.6'),
      summary: 'Nusselt numbers from both analogies against the Dittus–Boelter correlation at Re = 50 000 (Table E9.6), and why the Reynolds analogy works only near Pr = ν/α ≈ 1.',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 520–524 — §9.13 and Example 9.6; supporting equations from pp. 490 and 495–500). Fox & McDonald's is cited only as a secondary cross-reference.** There is no lecture deck on turbulence, so, as the course instruction for this unit asks, every explanation, equation and worked example here is built from Wilkes and uses Wilkes's notation ($\overline{v}_{zm}$, $\tau_w$, $\overline{v}_z^{*}$, Fanning $f_\mathrm{F}$ …); Fox-notation equivalents ($\bar V$, $u_*$, Darcy $f = 4f_\mathrm{F}$) appear only in clearly labelled cross-reference boxes.`,
}

// ---------------------------------------------------------------------------------------------------------------------
// formulas
// ---------------------------------------------------------------------------------------------------------------------

const U = {
  Pa: md`\mathrm{Pa}`,
  vel: md`\mathrm{m\,s^{-1}}`,
  rho: md`\mathrm{kg\,m^{-3}}`,
  flux: md`\mathrm{kg\,m^{-2}\,s^{-1}}`,
  q: md`\mathrm{W\,m^{-2}}`,
  h: md`\mathrm{W\,m^{-2}\,K^{-1}}`,
  cp: md`\mathrm{J\,kg^{-1}\,K^{-1}}`,
  k: md`\mathrm{W\,m^{-1}\,K^{-1}}`,
  K: md`\mathrm{K}`,
  m: md`\mathrm{m}`,
  mu: md`\mathrm{Pa\,s}`,
  diff: md`\mathrm{m^{2}\,s^{-1}}`,
}

export const formulas: FormulaDef[] = [
  // ---- Concept 1: Reynolds analogy -----------------------------------------------------------------------------------
  {
    id: 'fanning-def',
    name: 'Fanning friction factor (definition)',
    tex: md`f_\mathrm{F} = \frac{\tau_w}{\tfrac12\,\rho\,\overline{v}_{zm}^{2}}`,
    tag: '9.51',
    vars: [
      { sym: md`f_\mathrm{F}`, desc: 'Fanning friction factor (dimensionless)' },
      { sym: md`\tau_w`, desc: 'wall shear stress exerted by the fluid on the wall', units: U.Pa },
      { sym: md`\rho`, desc: 'fluid density', units: U.rho },
      { sym: md`\overline{v}_{zm}`, desc: md`mean (bulk) velocity — Wilkes notes it is the same as the $u_m$ of his Ch. 3; Fox writes $\bar V$`, units: U.vel },
    ],
    conditions: [
      'a **definition** — valid for laminar and turbulent flow alike',
      md`Wilkes uses the **Fanning** factor throughout Ch. 9; the Darcy (Moody-chart) factor used by Fox is $f = 4f_\mathrm{F}$ (supplementary)`,
    ],
    use: md`In the analogies the group $\tau_w/(\rho\overline{v}_{zm}^2)$ appears — recognise it as $f_\mathrm{F}/2$.`,
    src: wil('498', 'Eq. (9.51)'),
  },
  {
    id: 'h-def',
    name: 'Heat-transfer coefficient (definition)',
    tex: md`q = h\,(\overline{T}_m - \overline{T}_w)`,
    vars: [
      { sym: 'q', desc: 'heat flux from the mainstream to the wall', units: U.q },
      { sym: 'h', desc: 'heat-transfer coefficient', units: U.h },
      { sym: md`\overline{T}_m`, desc: 'mean temperature of the turbulent mainstream', units: U.K },
      { sym: md`\overline{T}_w`, desc: 'wall temperature', units: U.K },
    ],
    conditions: [
      'a definition: it introduces $h$, it does not predict it',
      md`sign convention of Fig. 9.13: $q > 0$ when heat flows from the mainstream to the wall ($\overline{T}_m > \overline{T}_w$)`,
    ],
    use: md`Substituted into (9.98) to form the Stanton number. $h$ is the quantity the analogies set out to predict.`,
    src: wil('521', 'definition used to obtain Eq. (9.99)'),
  },
  {
    id: 'ra-momentum',
    name: 'Net momentum transport by eddies (Reynolds model)',
    tex: md`\tau_w = m\overline{v}_{zm} - m\overline{v}_{zw} = m\overline{v}_{zm}`,
    tag: '9.95',
    vars: [
      { sym: md`\tau_w`, desc: 'wall shear stress = net rate of $z$-momentum delivered to unit area of wall', units: md`\mathrm{Pa} = \mathrm{N\,m^{-2}}` },
      { sym: 'm', desc: 'eddy mass flux in **either** direction (mass per unit time per unit area)', units: U.flux },
      { sym: md`\overline{v}_{zm}`, desc: 'mean velocity of the mainstream; $z$ is the flow direction, $y$ is normal to the wall', units: U.vel },
      { sym: md`\overline{v}_{zw}`, desc: 'velocity at the wall, equal to 0 (no slip)', units: U.vel },
    ],
    conditions: [
      'idealized eddies move continually in **both** directions between mainstream and wall, with the same mass flux $m$ each way',
      'the eddies reach the wall itself (no laminar sublayer) and arrive with the full mainstream velocity',
      md`returning eddies leave with the wall velocity $\overline{v}_{zw} = 0$`,
    ],
    use: md`Read it as "momentum in − momentum out". It turns a friction measurement into the eddy flux: $m = \tau_w/\overline{v}_{zm}$.`,
    src: wil('520', 'Eq. (9.95)'),
  },
  {
    id: 'ra-heat',
    name: 'Net heat transport by eddies (Reynolds model)',
    tex: md`q = mc_p\overline{T}_m - mc_p\overline{T}_w = mc_p\,(\overline{T}_m - \overline{T}_w)`,
    tag: '9.96',
    vars: [
      { sym: 'q', desc: 'net heat flux from mainstream to wall', units: U.q },
      { sym: 'm', desc: 'the same eddy mass flux as in (9.95)', units: U.flux },
      { sym: 'c_p', desc: 'specific heat of the fluid', units: U.cp },
      { sym: md`\overline{T}_m,\ \overline{T}_w`, desc: 'mean mainstream temperature and wall temperature', units: U.K },
    ],
    conditions: [
      'the **same** eddies (same $m$) carry heat as carry momentum',
      md`eddies arrive at $\overline{T}_m$ and leave at $\overline{T}_w$ (complete exchange at the wall)`,
      md`constant $c_p$`,
    ],
    use: md`Comparing with $q = h(\overline{T}_m - \overline{T}_w)$ shows that, in this model, $h = mc_p$.`,
    src: wil('520', 'Eq. (9.96)'),
  },
  {
    id: 'ra-eliminate',
    name: 'Eliminating the eddy mass flux',
    tex: md`\frac{\tau_w}{\overline{v}_{zm}}\ \ [=m]\ =\ \frac{q}{c_p\,(\overline{T}_m - \overline{T}_w)}`,
    tag: '9.97',
    vars: [
      { sym: md`[=m]`, desc: 'printed in the book to show that **both** sides equal the eddy mass flux' },
      { sym: md`\tau_w,\ q`, desc: 'wall shear stress and wall heat flux', units: md`\mathrm{Pa},\ \mathrm{W\,m^{-2}}` },
    ],
    conditions: ['the assumptions of (9.95) and (9.96) together'],
    use: md`The unknown $m$ drops out: a momentum measurement ($\tau_w$) now predicts a heat flux ($q$), and vice versa.`,
    src: wil('520', 'Eq. (9.97)'),
  },
  {
    id: 'ra-divide',
    name: 'Dimensionless form: (9.97) divided by ρ·v_zm',
    tex: md`\frac{\tau_w}{\rho\,\overline{v}_{zm}^{2}} = \frac{q}{\rho\,\overline{v}_{zm}\,c_p\,(\overline{T}_m - \overline{T}_w)}`,
    tag: '9.98',
    vars: [
      { sym: md`\rho`, desc: 'fluid density', units: U.rho },
      { sym: md`\overline{v}_{zm},\ c_p`, desc: 'mean velocity and specific heat', units: md`\mathrm{m\,s^{-1}},\ \mathrm{J\,kg^{-1}\,K^{-1}}` },
    ],
    conditions: [md`(9.97) divided by $\rho\overline{v}_{zm}$ — both sides are now dimensionless`],
    use: md`Left side $= f_\mathrm{F}/2$ by (9.51); right side becomes $h/(\rho\overline{v}_{zm}c_p)$ once $q = h(\overline{T}_m - \overline{T}_w)$ is substituted.`,
    src: wil('521', 'Eq. (9.98)'),
  },
  {
    id: 'reynolds-analogy',
    name: 'Reynolds analogy',
    key: true,
    tex: md`\frac12\,f_\mathrm{F} = \frac{h}{\rho\,\overline{v}_{zm}\,c_p} = \St`,
    tag: '9.99',
    vars: [
      { sym: md`f_\mathrm{F}`, desc: 'Fanning friction factor, (9.51) (dimensionless)' },
      { sym: 'h', desc: md`heat-transfer coefficient, defined by $q = h(\overline{T}_m - \overline{T}_w)$`, units: U.h },
      { sym: md`\St`, desc: md`**Stanton number** $h/(\rho\overline{v}_{zm}c_p)$ (dimensionless): heat transport to the wall relative to convective effects in the mainstream` },
      { sym: md`\rho,\ c_p`, desc: 'density and specific heat', units: md`\mathrm{kg\,m^{-3}},\ \mathrm{J\,kg^{-1}\,K^{-1}}` },
      { sym: md`\overline{v}_{zm}`, desc: 'mean mainstream velocity', units: U.vel },
    ],
    conditions: [
      'eddy-exchange model of Fig. 9.13: no laminar sublayer; one eddy flux $m$ for momentum and heat',
      md`no viscosity or conductivity appears, so the result cannot depend on the Prandtl number — Example 9.6 shows it agrees with experiment only near $\Pran \approx 1$`,
      'turbulent flow (smooth pipe in Example 9.6)',
    ],
    use: md`Get $f_\mathrm{F}$ (measured, or from Blasius (E9.6.2)), then $h = \tfrac12 f_\mathrm{F}\,\rho\,\overline{v}_{zm}c_p$. With Blasius it becomes $\Nu = 0.0395\,\Rey^{3/4}\Pran$ (E9.6.5).`,
    src: wil('521', 'Eq. (9.99)'),
  },
  {
    id: 'ra-alt-forms',
    name: 'Reynolds analogy in other notations',
    tex: md`\St = \frac{f_\mathrm{F}}{2} = \frac{f}{8} = \left(\frac{\overline{v}_z^{*}}{\overline{v}_{zm}}\right)^{2} = \frac{m}{\rho\,\overline{v}_{zm}}`,
    vars: [
      { sym: 'f', desc: md`Darcy friction factor (Moody chart, Fox), $f = 4f_\mathrm{F}$ (dimensionless)` },
      { sym: md`\overline{v}_z^{*}`, desc: md`friction velocity $\sqrt{\tau_w/\rho}$ (Wilkes p. 496); Fox writes $u_*$ (Fox p. 294)`, units: U.vel },
      { sym: 'm', desc: 'eddy mass flux of (9.95)', units: U.flux },
    ],
    conditions: [
      'identical content to (9.99) — only the notation changes',
      'check which friction factor (Fanning or Darcy) a chart or formula uses before substituting',
    ],
    use: md`The last form is a physical reading of (9.99): $\St = f_\mathrm{F}/2$ is the eddy mass flux to the wall as a **fraction of the axial mass flux** $\rho\overline{v}_{zm}$ — only about 0.26 % at $\Rey = 50\,000$.`,
  },

  // ---- Concept 2: Prandtl–Taylor analogy -----------------------------------------------------------------------------
  {
    id: 'pt-momentum',
    name: 'Momentum transport through sublayer and core (Prandtl–Taylor)',
    tex: md`\tau_w = \mu\,\frac{\overline{v}_{z\delta} - 0}{\delta} = m\,(\overline{v}_{zm} - \overline{v}_{z\delta})`,
    tag: '9.100',
    vars: [
      { sym: md`\mu`, desc: 'fluid viscosity', units: U.mu },
      { sym: md`\delta`, desc: 'thickness of the laminar sublayer', units: U.m },
      { sym: md`\overline{v}_{z\delta}`, desc: 'mean velocity at the outer edge of the sublayer ($y = \delta$); the "− 0" is the wall velocity', units: U.vel },
      { sym: 'm', desc: 'eddy mass flux between the sublayer edge and the mainstream', units: U.flux },
      { sym: md`\tau_w,\ \overline{v}_{zm}`, desc: 'wall shear stress and mean mainstream velocity', units: md`\mathrm{Pa},\ \mathrm{m\,s^{-1}}` },
    ],
    conditions: [
      'laminar sublayer: turbulent effects negligible, momentum carried by **viscous action**',
      md`linear velocity profile across the very thin sublayer, so the viscous stress is $\mu\,\overline{v}_{z\delta}/\delta$`,
      'beyond the sublayer: eddy exchange with mass flux $m$, as in the Reynolds model',
      md`steady: the same $\tau_w$ passes through the sublayer and through the turbulent region`,
    ],
    use: 'Each equality describes one layer of a two-layer series path. Dividing by (9.101) removes the unknowns δ and m.',
    src: wil('522', 'Eq. (9.100)'),
  },
  {
    id: 'pt-heat',
    name: 'Heat transport through sublayer and core (Prandtl–Taylor)',
    tex: md`q = k\,\frac{\overline{T}_\delta - \overline{T}_w}{\delta} = mc_p\,(\overline{T}_m - \overline{T}_\delta)`,
    tag: '9.101',
    vars: [
      { sym: 'k', desc: 'thermal conductivity of the fluid', units: U.k },
      { sym: md`\overline{T}_\delta`, desc: 'mean temperature at the outer edge of the sublayer', units: U.K },
      { sym: md`q,\ m,\ c_p,\ \delta`, desc: 'as in (9.96) and (9.100)' },
    ],
    conditions: [
      'heat crosses the sublayer by **thermal conduction** only, with a linear temperature profile',
      md`the same $\delta$ and the same eddy flux $m$ as for momentum`,
      md`the same $q$ passes through both layers`,
    ],
    use: md`Little is known about $\overline{T}_\delta$, so it is the quantity Wilkes eliminates when deriving (9.102).`,
    src: wil('522', 'Eq. (9.101)'),
  },
  {
    id: 'prandtl-taylor',
    name: 'Prandtl–Taylor analogy',
    key: true,
    tex: md`\St = \frac{f_\mathrm{F}/2}{1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}\,(\Pran - 1)}`,
    tag: '9.102',
    vars: [
      { sym: md`\St`, desc: md`Stanton number $h/(\rho\overline{v}_{zm}c_p)$ (dimensionless)` },
      { sym: md`f_\mathrm{F}`, desc: 'Fanning friction factor (dimensionless)' },
      { sym: md`\overline{v}_{z\delta}/\overline{v}_{zm}`, desc: 'fraction of the mean velocity already reached at the sublayer edge, from (9.103) (dimensionless, < 1)' },
      { sym: md`\Pran`, desc: md`Prandtl number $\mu c_p/k = \nu/\alpha$, (E9.6.7) (dimensionless)` },
    ],
    conditions: [
      'two-layer model of Fig. 9.14 (laminar sublayer + eddy core) with the assumptions of (9.100)–(9.101)',
      md`reduces **exactly** to the Reynolds analogy (9.99) when $\Pran = 1$`,
      'no buffer region (adding one is a further refinement)',
    ],
    use: md`Find $f_\mathrm{F}$ (e.g. Blasius), the velocity ratio from (9.103), then $\St$ and $h = \St\,\rho\overline{v}_{zm}c_p$. For $\Pran > 1$ the denominator exceeds 1, so $\St < f_\mathrm{F}/2$; for $\Pran < 1$, $\St > f_\mathrm{F}/2$.`,
    src: wil('522', 'Eq. (9.102)'),
  },
  {
    id: 'velocity-ratio',
    name: 'Velocity at the edge of the laminar sublayer',
    key: true,
    tex: md`\frac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \frac{2.44}{\Rey^{1/8}}`,
    tag: '9.103',
    vars: [
      { sym: md`\overline{v}_{z\delta}`, desc: 'mean velocity at the outer edge of the laminar sublayer', units: U.vel },
      { sym: md`\overline{v}_{zm}`, desc: 'mean (bulk) velocity', units: U.vel },
      { sym: md`\Rey`, desc: md`pipe Reynolds number $\rho\overline{v}_{zm}D/\mu$ (dimensionless)` },
    ],
    conditions: [
      'smooth pipe, fully developed turbulent flow',
      md`follows from the one-seventh power law (9.61) and the sublayer thickness (9.62), which rest on the Blasius law — use it for $\Rey \lesssim 10^5$`,
    ],
    use: md`At $\Rey = 50\,000$: $2.44/50\,000^{1/8} = 2.44/3.867 = 0.631$ — the velocity reaches 63 % of its mean value across a sublayer only about 0.5 % of $D$ thick.`,
    src: wil('522', 'Eq. (9.103)'),
  },
  {
    id: 'seventh-law',
    name: 'One-seventh power law (used to obtain 9.103)',
    tex: md`\frac{\overline{v}_z}{\overline{v}_{zc}} = \left(\frac{y}{a}\right)^{1/7}`,
    tag: '9.61',
    vars: [
      { sym: md`\overline{v}_z`, desc: 'local time-averaged velocity', units: U.vel },
      { sym: md`\overline{v}_{zc}`, desc: 'centreline velocity', units: U.vel },
      { sym: 'y', desc: 'distance from the wall', units: U.m },
      { sym: 'a', desc: 'pipe radius, $a = D/2$', units: U.m },
    ],
    conditions: ['smooth pipe; turbulent core (not inside the laminar sublayer)', md`consistent with the Blasius law, so roughly $\Rey < 10^5$`],
    use: md`Evaluated at $y = \delta$ it gives $\overline{v}_{z\delta}/\overline{v}_{zc}$; dividing by the mean-to-centreline ratio $49/60$ leads to (9.103).`,
    src: wil('500', 'Eq. (9.61)'),
  },
  {
    id: 'sublayer-thickness',
    name: 'Laminar-sublayer thickness (one-seventh law version)',
    tex: md`\frac{\delta}{D} = \frac{61.7}{\Rey^{7/8}}`,
    tag: '9.62',
    vars: [
      { sym: md`\delta`, desc: 'laminar-sublayer thickness', units: U.m },
      { sym: 'D', desc: 'pipe diameter', units: U.m },
      { sym: md`\Rey`, desc: 'pipe Reynolds number (dimensionless)' },
    ],
    conditions: ['linear sublayer profile joined to the one-seventh power law, with the Blasius friction factor', 'smooth pipe'],
    use: md`At $\Rey = 50\,000$: $\delta/D = 61.7/50\,000^{7/8} = 0.0048$ — an extremely thin layer, as Wilkes stresses on p. 500.`,
    src: wil('500', 'Eq. (9.62)'),
  },
  {
    id: 'sublayer-share',
    name: 'Share of the temperature difference dropped across the sublayer',
    tex: md`\frac{\overline{T}_\delta - \overline{T}_w}{\overline{T}_m - \overline{T}_w} = \frac{\Pran\,(\overline{v}_{z\delta}/\overline{v}_{zm})}{1 + (\overline{v}_{z\delta}/\overline{v}_{zm})\,(\Pran - 1)}`,
    vars: [
      { sym: md`\overline{T}_\delta,\ \overline{T}_w,\ \overline{T}_m`, desc: 'sublayer-edge, wall and mainstream temperatures', units: U.K },
      { sym: md`\overline{v}_{z\delta}/\overline{v}_{zm}`, desc: 'share of the velocity change that occurs across the sublayer, (9.103)' },
      { sym: md`\Pran`, desc: 'Prandtl number (dimensionless)' },
    ],
    conditions: ['same two-layer model as (9.100)–(9.101)', md`at $\Pran = 1$ it equals the velocity share $\overline{v}_{z\delta}/\overline{v}_{zm}$`],
    use: md`Obtained by eliminating $\delta$ and $m$ from (9.100)–(9.101). At $\Rey = 50\,000$ it is 0.46, 0.63, 0.77 and 0.90 for $\Pran$ = 0.5, 1, 2 and 5 — the larger $\Pran$, the more of the temperature drop sits in the thin sublayer.`,
  },
  {
    id: 'ratio-wall-units',
    name: 'Velocity ratio from the two-piece wall-unit profile (consistency check)',
    tex: md`\frac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \frac{11.6\,\overline{v}_z^{*}}{\overline{v}_{zm}} = 11.6\sqrt{\frac{f_\mathrm{F}}{2}} \;\xrightarrow{\ \text{Blasius}\ }\; \frac{2.31}{\Rey^{1/8}}`,
    vars: [
      { sym: md`11.6`, desc: md`value of $y^+ = v_z^+$ at the sublayer edge of Wilkes's two-piece profile, Eqs. (9.56)–(9.57), p. 499` },
      { sym: md`\overline{v}_z^{*}`, desc: md`friction velocity $\sqrt{\tau_w/\rho}$ (Wilkes p. 496)`, units: U.vel },
    ],
    conditions: [
      md`two-piece profile $v_z^+ = y^+$ / $v_z^+ = 5.5 + 2.5\ln y^+$, (9.54)–(9.55), instead of the one-seventh law`,
      md`uses $\overline{v}_z^{*}/\overline{v}_{zm} = \sqrt{f_\mathrm{F}/2}$, which follows from (9.51)`,
    ],
    use: md`Gives 2.31 instead of 2.44 — about 5 % lower. The constant depends on which profile locates the sublayer edge; in an exam, use the book's (9.103).`,
  },

  // ---- Concept 3: Example 9.6 ----------------------------------------------------------------------------------------
  {
    id: 'nusselt-def',
    name: 'Nusselt number',
    tex: md`\Nu = \frac{hD}{k}`,
    vars: [
      { sym: 'h', desc: 'heat-transfer coefficient', units: U.h },
      { sym: 'D', desc: 'pipe diameter', units: U.m },
      { sym: 'k', desc: 'thermal conductivity of the fluid', units: U.k },
    ],
    conditions: ['dimensionless heat-transfer coefficient for a pipe of diameter $D$'],
    use: md`Because $\St = h/(\rho\overline{v}_{zm}c_p)$, the identity $\Nu = \St\cdot\Rey\cdot\Pran$ converts any Stanton-number result into a Nusselt number.`,
    src: wil('522', 'Example 9.6'),
  },
  {
    id: 'reynolds-number',
    name: 'Pipe Reynolds number',
    tex: md`\Rey = \frac{\rho\,\overline{v}_{zm}\,D}{\mu}`,
    vars: [
      { sym: md`\rho,\ \mu`, desc: 'density and viscosity', units: md`\mathrm{kg\,m^{-3}},\ \mathrm{Pa\,s}` },
      { sym: md`\overline{v}_{zm}`, desc: 'mean velocity', units: U.vel },
      { sym: 'D', desc: 'pipe diameter', units: U.m },
    ],
    conditions: ['based on the mean velocity and the pipe diameter'],
    use: md`Written out in full inside (E9.6.3) and (E9.6.4).`,
    src: wil('523', 'written out in Eq. (E9.6.3)'),
  },
  {
    id: 'dittus-boelter',
    name: 'Dittus–Boelter correlation (the experimental benchmark)',
    key: true,
    tex: md`\Nu = 0.023\,\Rey^{0.8}\,\Pran^{0.4}`,
    tag: 'E9.6.1',
    vars: [
      { sym: md`\Nu`, desc: md`Nusselt number $hD/k$ (dimensionless)` },
      { sym: md`\Rey`, desc: md`$\rho\overline{v}_{zm}D/\mu$ (dimensionless)` },
      { sym: md`\Pran`, desc: md`$\mu c_p/k$ (dimensionless)` },
    ],
    conditions: [
      'a correlation of **experimentally determined** heat-transfer coefficients in **smooth pipe** — used in Example 9.6 as essentially experimental data',
      md`fully turbulent flow; heat-transfer texts usually quote $\Rey \gtrsim 10^4$ and $0.6 \lesssim \Pran \lesssim 160$ (supplementary)`,
      md`Example 9.6 uses the exponent 0.4 throughout; many heat-transfer texts use 0.4 when the fluid is heated and 0.3 when it is cooled (supplementary)`,
    ],
    use: md`Printed twice in Example 9.6 — as (E9.6.1) and again as (E9.6.6). It is the yardstick against which both analogies are judged.`,
    src: [wil('522', 'Eq. (E9.6.1)'), wil('523', 'repeated as Eq. (E9.6.6)')],
  },
  {
    id: 'blasius',
    name: 'Blasius friction law',
    tex: md`f_\mathrm{F} = 0.0790\,\Rey^{-1/4}`,
    tag: 'E9.6.2',
    vars: [
      { sym: md`f_\mathrm{F}`, desc: 'Fanning friction factor (dimensionless)' },
      { sym: md`\Rey`, desc: 'pipe Reynolds number (dimensionless)' },
    ],
    conditions: [
      'smooth pipe, turbulent flow',
      md`on p. 500 (as Eq. 9.59) Wilkes gives its range as $\Rey < 10^5$; Example 9.6 describes it as holding over a fairly wide range of Reynolds numbers`,
    ],
    use: md`Halve it for the analogies: $f_\mathrm{F}/2 = 0.0395\,\Rey^{-1/4}$.`,
    src: [wil('522', 'Eq. (E9.6.2)'), wil('500', 'same law as Eq. (9.59)')],
  },
  {
    id: 'e963',
    name: 'Reynolds analogy combined with Blasius',
    tex: md`\frac{h}{\rho\,\overline{v}_{zm}\,c_p} = \frac12 f_\mathrm{F} = 0.0395\left(\frac{\rho\,\overline{v}_{zm}D}{\mu}\right)^{-1/4}`,
    tag: 'E9.6.3',
    vars: [
      { sym: md`0.0395`, desc: md`$\tfrac12\times0.0790$ from (E9.6.2)` },
      { sym: md`\rho\overline{v}_{zm}D/\mu`, desc: md`the Reynolds number $\Rey$, written out` },
    ],
    conditions: ['Reynolds analogy (9.99) with the Blasius law (E9.6.2)'],
    use: md`Next step: multiply both sides by $\rho\overline{v}_{zm}c_pD/k = \Rey\,\Pran$.`,
    src: wil('523', 'Eq. (E9.6.3)'),
  },
  {
    id: 'e964',
    name: 'Rearranged for hD/k',
    tex: md`\frac{hD}{k} = 0.0395\left(\frac{\rho\,\overline{v}_{zm}D}{\mu}\right)^{3/4}\frac{\mu c_p}{k}`,
    tag: 'E9.6.4',
    vars: [
      { sym: md`hD/k`, desc: 'the Nusselt number' },
      { sym: md`\mu c_p/k`, desc: 'the Prandtl number' },
    ],
    conditions: ['as (E9.6.3)'],
    use: md`The exponent: $\Rey^{-1/4}\times\Rey = \Rey^{3/4}$; the extra factor $\mu c_p/k$ is the Prandtl number.`,
    src: wil('523', 'Eq. (E9.6.4)'),
  },
  {
    id: 'nu-ra',
    name: 'Nusselt number from the Reynolds analogy',
    key: true,
    tex: md`\Nu = 0.0395\,\Rey^{3/4}\,\Pran`,
    tag: 'E9.6.5',
    vars: [
      { sym: md`\Nu,\ \Rey,\ \Pran`, desc: md`Nusselt $hD/k$, Reynolds $\rho\overline{v}_{zm}D/\mu$ and Prandtl $\mu c_p/k$ numbers (dimensionless)` },
    ],
    conditions: [
      md`Reynolds analogy + Blasius: smooth pipe, turbulent flow, $\Rey \lesssim 10^5$`,
      md`proportional to $\Pran^{1}$ — much stronger than the experimental $\Pran^{0.4}$, so it over-predicts for $\Pran > 1$ and under-predicts for $\Pran < 1$`,
    ],
    use: md`At $\Rey = 50\,000$: $0.0395\times3343.7 = 132.1$, so $\Nu_\mathrm{RA} = 132.1\,\Pran$.`,
    src: wil('523', 'Eq. (E9.6.5)'),
  },
  {
    id: 'prandtl-diffusivities',
    name: 'Prandtl number as a ratio of diffusivities',
    key: true,
    tex: md`\Pran = \frac{\mu c_p}{k} = \frac{\mu/\rho}{k/(\rho c_p)} = \frac{\nu}{\alpha}`,
    tag: 'E9.6.7',
    vars: [
      { sym: md`\nu = \mu/\rho`, desc: 'kinematic viscosity — the molecular diffusivity of momentum', units: U.diff },
      { sym: md`\alpha = k/(\rho c_p)`, desc: 'thermal diffusivity — the molecular diffusivity of heat (not the jet constant α of §9.14)', units: U.diff },
      { sym: md`\mu,\ c_p,\ k,\ \rho`, desc: 'viscosity, specific heat, thermal conductivity, density' },
    ],
    conditions: ['a fluid property: it depends on the fluid and its temperature, not on the flow'],
    use: md`$\nu$ and $\alpha$ measure how fast momentum and heat diffuse by **molecular action** — exactly what the Reynolds analogy leaves out. $\Pran = 1$ means they diffuse equally fast, which is why the analogy works there.`,
    src: wil('523', 'Eq. (E9.6.7)'),
  },
  {
    id: 'nu-pta',
    name: 'Nusselt number from the Prandtl–Taylor analogy',
    key: true,
    tex: md`\Nu = \frac{0.0395\,\Rey^{3/4}\,\Pran}{1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}\,(\Pran - 1)}`,
    tag: 'E9.6.8',
    vars: [
      { sym: md`\overline{v}_{z\delta}/\overline{v}_{zm}`, desc: md`velocity ratio $2.44/\Rey^{1/8}$, (9.103)` },
      { sym: md`\Nu,\ \Rey,\ \Pran`, desc: 'Nusselt, Reynolds and Prandtl numbers (dimensionless)' },
    ],
    conditions: [
      'Prandtl–Taylor analogy (9.102) + Blasius (E9.6.2); smooth pipe, turbulent flow',
      md`supplementary remark: for $\Pran \to \infty$ it levels off at $0.0395\,\Rey^{3/4}/(\overline{v}_{z\delta}/\overline{v}_{zm})$, whereas experiment keeps rising — the model is best for moderate $\Pran$`,
    ],
    use: md`Evaluate $\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44\,\Rey^{-1/8}$ first, then divide the Reynolds-analogy value (E9.6.5) by the bracket.`,
    src: wil('524', 'Eq. (E9.6.8)'),
  },
]

// ---------------------------------------------------------------------------------------------------------------------
// worked examples
// ---------------------------------------------------------------------------------------------------------------------

export const examples: ExampleDef[] = [
  {
    id: 'e96-part1',
    concept: 'reynolds-analogy',
    title: 'Example 9.6, part 1 — Nusselt number from the Reynolds analogy',
    difficulty: 2,
    src: wil('522–523', 'Example 9.6, Eqs. (E9.6.2)–(E9.6.5)'),
    given: md`Turbulent flow in a **smooth pipe**. Friction from the Blasius law $f_\mathrm{F} = 0.0790\,\Rey^{-1/4}$ (E9.6.2). Representative $\Rey = 50\,000$; Prandtl numbers $\Pran$ = 0.5, 1.0 and 2.0.`,
    find: md`A formula for the Nusselt number $\Nu = hD/k$ predicted by the Reynolds analogy, and its values at $\Rey = 50\,000$ (column RA of Table E9.6).`,
    assumptions: md`Reynolds analogy (9.99): no sublayer, one eddy flux for momentum and heat.`,
    steps: [
      {
        title: 'Combine (9.99) with the Blasius law',
        md: md`Halve (E9.6.2) and write $\Rey$ out in full:

$$
\frac{h}{\rho\overline{v}_{zm}c_p} = \frac12 f_\mathrm{F} = 0.0395\left(\frac{\rho\overline{v}_{zm}D}{\mu}\right)^{-1/4} \tag{E9.6.3}
$$`,
      },
      {
        title: 'Multiply both sides by Re·Pr',
        md: md`The multiplier is $\dfrac{\rho\overline{v}_{zm}c_pD}{k} = \dfrac{\rho\overline{v}_{zm}D}{\mu}\cdot\dfrac{\mu c_p}{k}$. The left side becomes $hD/k$ and the Reynolds-number powers combine, $\Rey^{-1/4}\cdot\Rey = \Rey^{3/4}$:

$$
\frac{hD}{k} = 0.0395\left(\frac{\rho\overline{v}_{zm}D}{\mu}\right)^{3/4}\frac{\mu c_p}{k} \tag{E9.6.4}
$$`,
      },
      {
        title: 'Recognise the Nusselt and Prandtl numbers',
        md: md`$$
\Nu = 0.0395\,\Rey^{3/4}\,\Pran \tag{E9.6.5}
$$

This predicts $h$ (through Nu) from friction information alone.`,
      },
      {
        title: 'Evaluate at Re = 50 000',
        md: md`$\Rey^{3/4} = 50\,000^{0.75} = 3343.7$, so $0.0395\times3343.7 = 132.1$ and $\Nu_\mathrm{RA} = 132.1\,\Pran$:

| $\Pran$ | 0.5 | 1.0 | 2.0 |
|---|---|---|---|
| $\Nu_\mathrm{RA}$, computed | 66.0 | 132.1 | 264.2 |
| Table E9.6, column RA (printed) | 67 | 130 | 264 |

The printed values differ from the recomputed ones by at most about 2 % (the author's rounding).`,
      },
    ],
    answer: md`$\Nu = 0.0395\,\Rey^{3/4}\Pran$ (E9.6.5). At $\Rey = 50\,000$: $\Nu_\mathrm{RA} \approx$ 66, 132, 264 for $\Pran$ = 0.5, 1, 2 (printed: 67, 130, 264).`,
    insight: 'In the Reynolds analogy Nu is simply proportional to Pr — doubling Pr doubles the predicted heat transfer. Concept 3 shows that real data grow only as Pr^0.4.',
  },
  {
    id: 'ra-air',
    concept: 'reynolds-analogy',
    title: 'From a pressure-drop reading to a heat-transfer coefficient (air)',
    difficulty: 2,
    given: md`Air flows through a smooth tube of diameter $D = 50$ mm at mean velocity $\overline{v}_{zm} = 12$ m/s ($\rho = 1.18$ kg/m³, $\mu = 1.85\times10^{-5}$ Pa·s, $c_p = 1005$ J/(kg·K)). The measured pressure gradient is $-\dd p/\dd z = 38$ Pa/m, and the mainstream is 40 K hotter than the wall.`,
    find: md`$\tau_w$, the eddy mass flux $m$, $f_\mathrm{F}$, St, $h$ and the wall heat flux $q$ predicted by the Reynolds analogy.`,
    assumptions: md`Steady, fully developed flow. Reynolds-analogy model (9.95)–(9.99); air has $\Pran \approx 0.7$, close enough to 1 for a first estimate.`,
    steps: [
      {
        title: 'Wall shear stress from a force balance',
        md: md`Pressure force on the cross-section balances wall friction (Wilkes's Eq. 9.27 evaluated at the wall, $r = a$): $\tau_w = \dfrac{D}{4}\left(-\dfrac{\dd p}{\dd z}\right) = \dfrac{0.050}{4}\times38 = 0.475$ Pa.`,
      },
      {
        title: 'Eddy mass flux, from (9.95)',
        md: md`$m = \tau_w/\overline{v}_{zm} = 0.475/12 = 0.0396$ kg/(m²·s). The axial mass flux is $\rho\overline{v}_{zm} = 1.18\times12 = 14.16$ kg/(m²·s), so the eddies exchange only $0.0396/14.16 = 0.28$ % of it with each square metre of wall.`,
      },
      {
        title: 'Friction factor, (9.51)',
        md: md`$\tfrac12\rho\overline{v}_{zm}^2 = 0.5\times1.18\times12^2 = 84.96$ Pa, so $f_\mathrm{F} = 0.475/84.96 = 0.00559$ and $f_\mathrm{F}/2 = 0.00280$. (Check: $\Rey = \rho\overline{v}_{zm}D/\mu = 3.83\times10^4$, and Blasius gives $f_\mathrm{F} = 0.0790\,\Rey^{-1/4} = 0.00565$ — consistent.)`,
      },
      {
        title: 'Reynolds analogy, (9.99)',
        md: md`$\St = f_\mathrm{F}/2 = 0.00280$, hence $h = \St\,\rho\overline{v}_{zm}c_p = 0.002795\times1.18\times12\times1005 = 39.8$ W/(m²·K). Check with (9.96): $h = mc_p = 0.0396\times1005 = 39.8$ W/(m²·K) ✓.`,
      },
      {
        title: 'Heat flux, (9.96)',
        md: md`$q = h(\overline{T}_m - \overline{T}_w) = 39.8\times40 = 1.59\times10^3$ W/m², about 1.6 kW/m².`,
      },
    ],
    answer: md`$\tau_w = 0.475$ Pa, $m = 0.0396$ kg/(m²·s), $f_\mathrm{F} = 0.00559$, $\St = 0.00280$, $h \approx 39.8$ W/(m²·K), $q \approx 1.59$ kW/m².`,
    insight: 'In the Reynolds analogy h = m·c_p: the heat-transfer coefficient is just the eddy mass flux times the specific heat, so measuring friction measures m.',
  },
  {
    id: 'e96-part2',
    concept: 'prandtl-taylor',
    title: 'Example 9.6, part 2 — Nusselt number from the Prandtl–Taylor analogy',
    difficulty: 2,
    src: [wil('524', 'Example 9.6, Eq. (E9.6.8)'), wil('522', 'Eqs. (9.102)–(9.103)')],
    given: md`As in part 1: smooth pipe, Blasius $f_\mathrm{F} = 0.0790\,\Rey^{-1/4}$, $\Rey = 50\,000$, $\Pran$ = 0.5, 1.0, 2.0; velocity ratio from (9.103).`,
    find: md`The Prandtl–Taylor Nusselt-number formula (E9.6.8) and its values at $\Rey = 50\,000$ (column PTA of Table E9.6).`,
    steps: [
      {
        title: 'Same manipulation as for the Reynolds analogy',
        md: md`(9.102) is (9.99) divided by the bracket $1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)$. Multiplying by $\Rey\,\Pran$ (so that St becomes Nu) and using Blasius exactly as in part 1 gives

$$
\Nu = \frac{0.0395\,\Rey^{3/4}\,\Pran}{1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}\,(\Pran - 1)} \tag{E9.6.8}
$$`,
      },
      {
        title: 'Velocity ratio, (9.103)',
        md: md`$\Rey^{1/8} = 50\,000^{0.125} = 3.867$, so $\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/3.867 = 0.631$.`,
      },
      {
        title: 'The brackets',
        md: md`$1 + 0.631\,(\Pran - 1)$ equals $1 - 0.3155 = 0.6845$ for $\Pran = 0.5$; exactly 1 for $\Pran = 1$; $1 + 0.631 = 1.631$ for $\Pran = 2$.`,
      },
      {
        title: 'Nusselt numbers',
        md: md`Divide the Reynolds-analogy values of part 1 (66.0, 132.1, 264.2) by the brackets:

| $\Pran$ | 0.5 | 1.0 | 2.0 |
|---|---|---|---|
| $\Nu_\mathrm{PTA}$, computed | 66.0/0.6845 = 96.5 | 132.1 | 264.2/1.631 = 162.0 |
| Table E9.6, column PTA (printed) | 95 | 130 | 162 |`,
      },
    ],
    answer: md`(E9.6.8) with $\overline{v}_{z\delta}/\overline{v}_{zm} = 0.631$: $\Nu_\mathrm{PTA} \approx$ 96, 132, 162 for $\Pran$ = 0.5, 1, 2 (printed: 95, 130, 162).`,
    insight: 'The sublayer bracket pulls the Pr = 2 value down (264 → 162) and pushes the Pr = 0.5 value up (66 → 96); at Pr = 1 it changes nothing.',
  },
  {
    id: 'pt-sublayer',
    concept: 'prandtl-taylor',
    title: 'Where does the temperature drop happen? (Pr = 5)',
    difficulty: 3,
    given: md`Turbulent pipe flow at $\Rey = 50\,000$ of a liquid with $\Pran = 5$ (roughly water at 35 °C). The mainstream is 20 K hotter than the wall: $\overline{T}_m - \overline{T}_w = 20$ K.`,
    find: md`The sublayer-edge temperature excess $\overline{T}_\delta - \overline{T}_w$, the ratio $\St/(f_\mathrm{F}/2)$, and a comparison with $\Pran = 1$.`,
    assumptions: md`Prandtl–Taylor two-layer model, (9.100)–(9.103); constant properties.`,
    steps: [
      {
        title: 'Velocity share across the sublayer',
        md: md`From (9.103): $r = \overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/50\,000^{1/8} = 0.631$.`,
      },
      {
        title: 'Eliminate δ and m, keep the edge temperature',
        md: md`Dividing the sublayer forms of (9.101) and (9.100), and then the core forms, gives $\overline{T}_\delta - \overline{T}_w = \dfrac{q}{\tau_w}\dfrac{\mu}{k}\,\overline{v}_{z\delta}$ and $\overline{T}_m - \overline{T}_\delta = \dfrac{q}{\tau_w}\dfrac{\overline{v}_{zm} - \overline{v}_{z\delta}}{c_p}$. The first divided by the sum of both is

$$
\frac{\overline{T}_\delta - \overline{T}_w}{\overline{T}_m - \overline{T}_w} = \frac{\Pran\,r}{1 + r(\Pran - 1)}
$$`,
      },
      {
        title: 'Numbers for Pr = 5',
        md: md`$\dfrac{5\times0.631}{1 + 0.631\times4} = \dfrac{3.155}{3.524} = 0.895$, so $\overline{T}_\delta - \overline{T}_w = 0.895\times20 = 17.9$ K. Only 2.1 K is left for the entire turbulent core.`,
      },
      {
        title: 'Heat transfer relative to friction, (9.102)',
        md: md`$\St/(f_\mathrm{F}/2) = 1/3.524 = 0.284$ — heat transfer is less than a third of what the Reynolds analogy would predict.`,
      },
      {
        title: 'Compare with Pr = 1',
        md: md`For $\Pran = 1$ the share is just $r = 0.631$ (12.6 K across the sublayer) and $\St = f_\mathrm{F}/2$. The sublayer has the same thickness in both cases (about 0.48 % of $D$, from (9.62)); what changes is how hard it is for **heat** to cross it.`,
      },
    ],
    answer: md`$\overline{T}_\delta - \overline{T}_w \approx 17.9$ K (about 90 % of the total) and $\St/(f_\mathrm{F}/2) \approx 0.28$. For $\Pran = 1$: 12.6 K (63 %) and a ratio of 1.`,
    insight: 'For Pr > 1 the thin laminar sublayer, not the turbulent core, controls heat transfer — the root of the Reynolds analogy’s failure for liquids.',
  },
  {
    id: 'e96-complete',
    concept: 'analogy-evaluation',
    title: 'Example 9.6 — Evaluation of the momentum/heat-transfer analogies',
    difficulty: 2,
    src: wil('522–524', 'Example 9.6, Table E9.6'),
    given: md`Smooth pipe, turbulent flow, $\Rey = 50\,000$; $\Pran$ = 0.5, 1.0, 2.0. Friction from Blasius (E9.6.2). Benchmark: the Dittus–Boelter correlation $\Nu = 0.023\,\Rey^{0.8}\Pran^{0.4}$ (E9.6.1), based on experimentally measured heat-transfer coefficients.`,
    find: md`The merits of the Reynolds (RA) and Prandtl–Taylor (PTA) analogies: compare their $\Nu = hD/k$ with Dittus–Boelter (DB) — i.e. reproduce Table E9.6 and explain the differences.`,
    steps: [
      {
        title: 'The two predictions (parts 1 and 2)',
        md: md`RA: $\Nu = 0.0395\,\Rey^{3/4}\Pran$ (E9.6.5). PTA: the same divided by $1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)$ (E9.6.8), with $\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/\Rey^{1/8} = 0.631$ (9.103).`,
      },
      {
        title: 'The benchmark, (E9.6.1) = (E9.6.6)',
        md: md`$\Rey^{0.8} = 50\,000^{0.8} = 5743.5$, so $0.023\times5743.5 = 132.1$ and $\Nu_\mathrm{DB} = 132.1\,\Pran^{0.4}$. With $0.5^{0.4} = 0.758$ and $2^{0.4} = 1.320$: $\Nu_\mathrm{DB}$ = 100.1, 132.1 and 174.3.`,
      },
      {
        title: 'Assemble Table E9.6',
        md: md`| $\Pran$ | RA | DB | PTA |
|---|---|---|---|
| 0.5 | 67 (66.0) | 100 (100.1) | 95 (96.5) |
| 1.0 | 130 (132.1) | 130 (132.1) | 130 (132.1) |
| 2.0 | 264 (264.2) | 173 (174.3) | 162 (162.0) |

Printed values first, recomputed values in brackets — they agree to within about 2 %. (On p. 524 the text refers to "Table E9.4"; it means this table.)`,
      },
      {
        title: 'Compare',
        md: md`At $\Pran = 1$ the RA agrees outstandingly with the essentially experimental DB value. At $\Pran = 0.5$ and 2 it is significantly off: from the printed values, $67/100 \to -33$ % and $264/173 \to +53$ %. The PTA values are within about 5–6 % (95 vs 100, 162 vs 173).`,
      },
      {
        title: 'Why: rewrite the Prandtl number, (E9.6.7)',
        md: md`$$
\Pran = \frac{\mu c_p}{k} = \frac{\mu/\rho}{k/(\rho c_p)} = \frac{\nu}{\alpha} \tag{E9.6.7}
$$

$\nu$ and $\alpha$ are the rates at which momentum and heat diffuse by **molecular action** — and the RA ignores them completely. The PTA brings them in through the laminar sublayer, where molecular transport is all there is.`,
      },
      {
        title: 'Conclusion',
        md: 'Agreement with Dittus–Boelter is much better with the PTA at both Pr = 0.5 and Pr = 2, illustrating the success of the more realistic model.',
      },
    ],
    answer: md`Table E9.6 ($\Rey = 50\,000$): RA/DB/PTA = 67/100/95 ($\Pran$ 0.5), 130/130/130 ($\Pran$ 1), 264/173/162 ($\Pran$ 2). The RA is excellent only at $\Pran = 1$; the PTA stays within about 6 % for $0.5 \le \Pran \le 2$.`,
    insight: 'A model that leaves out a mechanism (molecular diffusion near the wall) can still look perfect where that mechanism happens to cancel (Pr = 1) — always test a model away from its sweet spot.',
  },
  {
    id: 'eval-water',
    concept: 'analogy-evaluation',
    title: 'Water in a heat-exchanger tube: which estimate do you trust?',
    difficulty: 2,
    given: md`Water ($\Pran = 5.0$, $k = 0.62$ W/(m·K)) flows in a smooth tube of $D = 25$ mm at $\Rey = 40\,000$.`,
    find: md`$h$ from the Reynolds analogy, the Prandtl–Taylor analogy and Dittus–Boelter, and the error of each analogy.`,
    assumptions: md`Fully developed turbulent flow, constant properties; Blasius friction, as in Example 9.6.`,
    steps: [
      { title: 'Powers of Re', md: md`$\Rey^{3/4} = 40\,000^{0.75} = 2828.4$; $\Rey^{0.8} = 4804.5$; $\Rey^{1/8} = 3.761$.` },
      { title: 'Reynolds analogy, (E9.6.5)', md: md`$\Nu_\mathrm{RA} = 0.0395\times2828.4\times5.0 = 558.6$.` },
      {
        title: 'Prandtl–Taylor, (E9.6.8)',
        md: md`$\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/3.761 = 0.649$; bracket $= 1 + 0.649\times4 = 3.595$; $\Nu_\mathrm{PTA} = 558.6/3.595 = 155.4$.`,
      },
      { title: 'Dittus–Boelter, (E9.6.1)', md: md`$5^{0.4} = 1.904$; $\Nu_\mathrm{DB} = 0.023\times4804.5\times1.904 = 210.4$.` },
      {
        title: 'Heat-transfer coefficients',
        md: md`$h = \Nu\,k/D = \Nu\times0.62/0.025 = 24.8\,\Nu$ W/(m²·K): $h_\mathrm{RA} \approx 13\,850$, $h_\mathrm{PTA} \approx 3\,850$, $h_\mathrm{DB} \approx 5\,220$ W/(m²·K).`,
      },
      { title: 'Errors relative to DB', md: md`RA: $558.6/210.4 - 1 = +166$ %. PTA: $155.4/210.4 - 1 = -26$ %.` },
    ],
    answer: md`$h_\mathrm{DB} \approx 5.2$ kW/(m²·K). The RA over-predicts by about 166 % (≈ 13.9 kW/(m²·K)); the PTA under-predicts by about 26 % (≈ 3.9 kW/(m²·K)).`,
    insight: 'For liquids (Pr well above 1) never use the Reynolds analogy; even the Prandtl–Taylor analogy needs the buffer-region refinement Wilkes mentions. Use the experimental correlation.',
  },
]

// ---------------------------------------------------------------------------------------------------------------------
// practice
// ---------------------------------------------------------------------------------------------------------------------

export const practice: PracticeDef[] = [
  // ---- Reynolds analogy ------------------------------------------------------------------------------------------------
  {
    id: 'ra-p1',
    concept: 'reynolds-analogy',
    difficulty: 1,
    q: md`A friction measurement for air flowing in a smooth duct gives a Fanning friction factor $f_\mathrm{F} = 0.0060$. The mean velocity is $\overline{v}_{zm} = 10$ m/s, $\rho = 1.20$ kg/m³ and $c_p = 1005$ J/(kg·K). Use the Reynolds analogy to estimate the Stanton number and the heat-transfer coefficient $h$.`,
    hint: md`(9.99): $\St = f_\mathrm{F}/2$, and $\St = h/(\rho\overline{v}_{zm}c_p)$.`,
    answer: md`$\St = 0.0030$; $h \approx 36.2$ W/(m²·K).`,
    solution: md`1. Reynolds analogy (9.99): $\St = \tfrac12 f_\mathrm{F} = 0.0030$.
2. Definition of St: $h = \St\,\rho\overline{v}_{zm}c_p = 0.0030\times1.20\times10\times1005 = 36.18$ W/(m²·K).
3. Air has $\Pran \approx 0.7 < 1$, so by Example 9.6 the Reynolds analogy probably under-predicts somewhat — by roughly 20 % at $\Pran = 0.7$, $\Rey = 50\,000$.`,
    check: [{ label: '$h$', value: 36.18, units: U.h }],
  },
  {
    id: 'ra-p2',
    concept: 'reynolds-analogy',
    difficulty: 2,
    q: md`Water ($\rho = 998$ kg/m³, $c_p = 4180$ J/(kg·K)) flows in a pipe with mean velocity 1.0 m/s; the wall shear stress is $\tau_w = 2.8$ Pa and the mainstream is 15 K hotter than the wall. Using the eddy-exchange model (9.95)–(9.96), find (a) the eddy mass flux $m$, (b) $h$ and the heat flux $q$, (c) $f_\mathrm{F}/2$ and St. Comment on the result.`,
    hint: md`$m = \tau_w/\overline{v}_{zm}$; in this model $h = mc_p$.`,
    answer: md`(a) $m = 2.8$ kg/(m²·s); (b) $h = 1.17\times10^4$ W/(m²·K), $q = 1.76\times10^5$ W/m²; (c) $f_\mathrm{F}/2 = \St = 2.81\times10^{-3}$.`,
    solution: md`(a) From (9.95): $m = \tau_w/\overline{v}_{zm} = 2.8/1.0 = 2.8$ kg/(m²·s).

(b) (9.96) gives $q = mc_p(\overline{T}_m - \overline{T}_w)$, so $h = mc_p = 2.8\times4180 = 11\,704$ W/(m²·K) and $q = 11\,704\times15 = 1.76\times10^5$ W/m².

(c) $f_\mathrm{F}/2 = \tau_w/(\rho\overline{v}_{zm}^2) = 2.8/(998\times1.0^2) = 2.81\times10^{-3}$, and $\St = h/(\rho\overline{v}_{zm}c_p) = 11\,704/(998\times1.0\times4180) = 2.81\times10^{-3}$ — identical, as (9.99) demands.

**Comment:** water has $\Pran \approx 7$, far from 1, so this $h$ is not trustworthy. For $\Pran > 1$ the Reynolds analogy over-predicts heat transfer; at $\Pran \approx 7$ Concept 3 shows the over-estimate is a factor of about 3.`,
    check: [
      { label: '$m$', value: 2.8, units: U.flux },
      { label: '$h$', value: 11704, units: U.h },
    ],
  },
  {
    id: 'ra-p3',
    concept: 'reynolds-analogy',
    difficulty: 2,
    q: md`In a heat-transfer test, air ($\rho = 1.10$ kg/m³, $c_p = 1010$ J/(kg·K)) flowing at $\overline{v}_{zm} = 15$ m/s through a smooth 40 mm tube gives $h = 50$ W/(m²·K). Use the Reynolds analogy backwards to estimate the Fanning friction factor and the pressure gradient $-\dd p/\dd z$.`,
    hint: md`St from $h$; then $f_\mathrm{F} = 2\St$; then $\tau_w = \tfrac12 f_\mathrm{F}\rho\overline{v}_{zm}^2$ and $-\dd p/\dd z = 4\tau_w/D$.`,
    answer: md`$f_\mathrm{F} \approx 0.0060$; $\tau_w \approx 0.743$ Pa; $-\dd p/\dd z \approx 74$ Pa/m.`,
    solution: md`1. $\St = h/(\rho\overline{v}_{zm}c_p) = 50/(1.10\times15\times1010) = 50/16\,665 = 3.00\times10^{-3}$.
2. (9.99): $f_\mathrm{F} = 2\St = 6.00\times10^{-3}$.
3. (9.51): $\tau_w = \tfrac12 f_\mathrm{F}\rho\overline{v}_{zm}^2 = 3.00\times10^{-3}\times1.10\times15^2 = 0.743$ Pa. (Equivalently $m = h/c_p = 0.0495$ kg/(m²·s) and $\tau_w = m\overline{v}_{zm} = 0.743$ Pa.)
4. Force balance on the pipe (Wilkes Eq. 9.27 at the wall): $-\dd p/\dd z = 4\tau_w/D = 4\times0.743/0.040 = 74.3$ Pa/m.`,
    check: [
      { label: md`$f_\mathrm{F}$`, value: 0.006 },
      { label: md`$-\mathrm{d}p/\mathrm{d}z$`, value: 74.26, units: md`\mathrm{Pa\,m^{-1}}` },
    ],
  },

  // ---- Prandtl–Taylor ----------------------------------------------------------------------------------------------
  {
    id: 'pt-p1',
    concept: 'prandtl-taylor',
    difficulty: 1,
    q: md`For turbulent flow in a smooth pipe at $\Rey = 20\,000$ and $\Pran = 3$, use (9.103), the Blasius law and the Prandtl–Taylor analogy (9.102) to find $\overline{v}_{z\delta}/\overline{v}_{zm}$, the ratio $\St/(f_\mathrm{F}/2)$ and St.`,
    hint: md`$\Rey^{1/8} = 20\,000^{0.125}$; Blasius gives $f_\mathrm{F}/2 = 0.0395\,\Rey^{-1/4}$.`,
    answer: md`$\overline{v}_{z\delta}/\overline{v}_{zm} = 0.708$; $\St/(f_\mathrm{F}/2) = 0.414$; $\St = 1.38\times10^{-3}$.`,
    solution: md`1. $\Rey^{1/8} = 20\,000^{0.125} = 3.448$, so $\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/3.448 = 0.708$.
2. Bracket of (9.102): $1 + 0.708\times(3 - 1) = 2.415$, hence $\St/(f_\mathrm{F}/2) = 1/2.415 = 0.414$.
3. Blasius: $f_\mathrm{F}/2 = 0.0395/20\,000^{0.25} = 0.0395/11.89 = 3.32\times10^{-3}$.
4. $\St = 0.414\times3.32\times10^{-3} = 1.38\times10^{-3}$ — less than half the Reynolds-analogy value, because $\Pran > 1$.`,
    check: [
      { label: 'velocity ratio', value: 0.7076 },
      { label: md`$\St$`, value: 0.0013753 },
    ],
  },
  {
    id: 'pt-p2',
    concept: 'prandtl-taylor',
    difficulty: 2,
    q: md`A liquid with $\Pran = 7$ (take the properties as constant) flows at $\Rey = 50\,000$. The mainstream is at 60 °C and the wall at 20 °C. Estimate the temperature $\overline{T}_\delta$ at the edge of the laminar sublayer with the Prandtl–Taylor model, and say what fraction of the overall temperature difference lies across the sublayer.`,
    hint: md`Eliminate $\delta$ and $m$ from (9.100)–(9.101): $(\overline{T}_\delta - \overline{T}_w)/(\overline{T}_m - \overline{T}_w) = \Pran\,r/[1 + r(\Pran - 1)]$ with $r = 2.44/\Rey^{1/8}$.`,
    answer: md`$\overline{T}_\delta \approx 56.9$ °C; about 92 % of the 40 K difference lies across the sublayer.`,
    solution: md`1. (9.103): $r = 2.44/50\,000^{1/8} = 2.44/3.867 = 0.631$.
2. From (9.100)–(9.101): $\overline{T}_\delta - \overline{T}_w = (q/\tau_w)(\mu/k)\,\overline{v}_{z\delta}$ and $\overline{T}_m - \overline{T}_w = (q/\tau_w)(\overline{v}_{zm}/c_p)[1 + r(\Pran - 1)]$. Their ratio is $\Pran\,r/[1 + r(\Pran - 1)]$.
3. Numbers: $\dfrac{7\times0.631}{1 + 0.631\times6} = \dfrac{4.417}{4.786} = 0.923$.
4. $\overline{T}_\delta = 20 + 0.923\times40 = 56.9$ °C. Only about 3 K of the 40 K is left for the turbulent core.`,
    check: [{ label: md`$\overline{T}_\delta$ (°C)`, value: 56.92 }],
  },
  {
    id: 'pt-p3',
    concept: 'prandtl-taylor',
    difficulty: 3,
    q: md`Show where the constant 2.44 in (9.103) comes from. Use the one-seventh power law (9.61) at the sublayer edge $y = \delta$, the sublayer thickness (9.62), and the fact that for a one-seventh-power profile the mean velocity is $49/60$ of the centreline velocity. Give the constant to three or four significant figures.`,
    hint: md`At $y = \delta$: $\overline{v}_{z\delta}/\overline{v}_{zc} = (\delta/a)^{1/7} = (2\delta/D)^{1/7}$, and (9.62) gives $2\delta/D = 123.4\,\Rey^{-7/8}$.`,
    answer: md`$\overline{v}_{z\delta}/\overline{v}_{zm} = \dfrac{123.4^{1/7}}{49/60}\,\Rey^{-1/8} = \dfrac{1.990}{0.8167}\,\Rey^{-1/8} = 2.436\,\Rey^{-1/8} \approx 2.44\,\Rey^{-1/8}$.`,
    solution: md`1. (9.61) at $y = \delta$, with $a = D/2$: $\dfrac{\overline{v}_{z\delta}}{\overline{v}_{zc}} = \left(\dfrac{2\delta}{D}\right)^{1/7}$.
2. (9.62): $2\delta/D = 2\times61.7\,\Rey^{-7/8} = 123.4\,\Rey^{-7/8}$, so $\dfrac{\overline{v}_{z\delta}}{\overline{v}_{zc}} = 123.4^{1/7}\,\Rey^{-1/8} = 1.990\,\Rey^{-1/8}$ (exponent: $-\tfrac78\times\tfrac17 = -\tfrac18$).
3. Mean velocity of the one-seventh profile: $\overline{v}_{zm}/\overline{v}_{zc} = 2n^2/[(n+1)(2n+1)]$ with $n = 7$, i.e. $98/120 = 49/60 = 0.8167$ (Fox's Eq. 8.24 is this general result; it also follows from integrating (9.61) over the cross-section).
4. Divide: $\dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \dfrac{1.990}{0.8167}\,\Rey^{-1/8} = 2.436\,\Rey^{-1/8} \approx 2.44\,\Rey^{-1/8}$ ✓.`,
    check: [{ label: 'constant', value: 2.436, tol: 0.01 }],
  },
  {
    id: 'pt-p4',
    concept: 'prandtl-taylor',
    difficulty: 3,
    q: md`(a) Show that the Prandtl–Taylor result (E9.6.8) tends to a constant Nusselt number as $\Pran \to \infty$ at fixed $\Rey$, and evaluate that limit for $\Rey = 50\,000$. (b) What does Dittus–Boelter predict for $\Pran = 100$ at the same $\Rey$? What does the comparison tell you?`,
    hint: md`Divide numerator and denominator of (E9.6.8) by $\Pran$ and let $\Pran \to \infty$.`,
    answer: md`(a) $\Nu \to 0.0395\,\Rey^{3/4}/(\overline{v}_{z\delta}/\overline{v}_{zm}) = 132.1/0.631 \approx 209$. (b) $\Nu_\mathrm{DB} \approx 834$: the PTA saturates while experiment keeps rising as $\Pran^{0.4}$.`,
    solution: md`(a) With $r = \overline{v}_{z\delta}/\overline{v}_{zm}$: $\Nu = \dfrac{0.0395\,\Rey^{3/4}}{1/\Pran + r(1 - 1/\Pran)} \to \dfrac{0.0395\,\Rey^{3/4}}{r}$ as $\Pran \to \infty$. At $\Rey = 50\,000$: $0.0395\times3343.7 = 132.1$ and $r = 0.631$, so $\Nu_\infty = 132.1/0.631 = 209$.

(b) $\Nu_\mathrm{DB} = 0.023\times5743.5\times100^{0.4} = 132.1\times6.310 = 834$.

The PTA puts all the extra resistance of a high-$\Pran$ fluid into a sublayer of fixed thickness; once conduction across it dominates, Nu stops growing with $\Pran$. Real data keep rising, so the PTA should not be pushed to $\Pran \gg 1$ either — this is where Wilkes's suggested refinement (a buffer region between the sublayer and the core) is needed.`,
    check: [
      { label: md`$\Nu_\infty$`, value: 209.3 },
      { label: md`$\Nu_\mathrm{DB}$ at Pr = 100`, value: 833.5 },
    ],
  },

  // ---- Evaluation ------------------------------------------------------------------------------------------------
  {
    id: 'ev-p1',
    concept: 'analogy-evaluation',
    difficulty: 1,
    q: md`Air ($\Pran = 0.70$) flows through a smooth pipe at $\Rey = 50\,000$. Compute $\Nu$ from the Reynolds analogy (E9.6.5), the Prandtl–Taylor analogy (E9.6.8) and Dittus–Boelter (E9.6.1), and the percentage error of each analogy.`,
    hint: md`At this $\Rey$: $\Rey^{3/4} = 3343.7$, $\Rey^{0.8} = 5743.5$, $\overline{v}_{z\delta}/\overline{v}_{zm} = 0.631$.`,
    answer: md`$\Nu_\mathrm{RA} = 92.5$ (−19 %), $\Nu_\mathrm{PTA} = 114.0$ (−0.4 %), $\Nu_\mathrm{DB} = 114.5$.`,
    solution: md`1. RA: $0.0395\times3343.7\times0.70 = 92.5$.
2. PTA: bracket $= 1 + 0.631\times(0.70 - 1) = 1 - 0.189 = 0.811$; $\Nu = 92.5/0.811 = 114.0$.
3. DB: $0.70^{0.4} = 0.867$; $\Nu = 0.023\times5743.5\times0.867 = 114.5$.
4. Errors: RA $92.5/114.5 - 1 = -19$ %; PTA $114.0/114.5 - 1 = -0.4$ %. Even for a gas, the departure of $\Pran$ from 1 matters for the RA, while the PTA is essentially exact here.`,
    check: [
      { label: md`$\Nu_\mathrm{RA}$`, value: 92.45 },
      { label: md`$\Nu_\mathrm{PTA}$`, value: 114.04 },
      { label: md`$\Nu_\mathrm{DB}$`, value: 114.54 },
    ],
  },
  {
    id: 'ev-p2',
    concept: 'analogy-evaluation',
    difficulty: 2,
    q: md`At $\Rey = 50\,000$, for what Prandtl number does the Reynolds analogy over-predict the Dittus–Boelter Nusselt number by 50 %? Compare with Table E9.6.`,
    hint: md`Form $\Nu_\mathrm{RA}/\Nu_\mathrm{DB} = (0.0395/0.023)\,\Rey^{-0.05}\,\Pran^{0.6}$ and set it equal to 1.5.`,
    answer: md`$\Pran \approx 1.97$ — consistent with Table E9.6, where $\Pran = 2$ gives $264/173 = 1.53$.`,
    solution: md`1. $\dfrac{\Nu_\mathrm{RA}}{\Nu_\mathrm{DB}} = \dfrac{0.0395\,\Rey^{0.75}\Pran}{0.023\,\Rey^{0.8}\Pran^{0.4}} = 1.717\,\Rey^{-0.05}\,\Pran^{0.6}$.
2. At $\Rey = 50\,000$: $\Rey^{-0.05} = 0.5822$, so the prefactor is $1.717\times0.5822 = 1.000$ — which is exactly why the two agree so well at $\Pran = 1$.
3. Set $\Pran^{0.6} = 1.5$: $\Pran = 1.5^{1/0.6} = 1.5^{1.667} = 1.97$.
4. Table E9.6 at $\Pran = 2$: $264/173 = 1.53$ ✓.`,
    check: [{ label: md`$\Pran$`, value: 1.966 }],
  },
  {
    id: 'ev-p3',
    concept: 'analogy-evaluation',
    difficulty: 1,
    q: md`Using (E9.6.7), compute the Prandtl number of (a) air with $\nu = 1.57\times10^{-5}$ m²/s and $\alpha = 2.22\times10^{-5}$ m²/s, and (b) water with $\nu = 1.00\times10^{-6}$ m²/s and $\alpha = 1.43\times10^{-7}$ m²/s. For which fluid could the Reynolds analogy give a reasonable first estimate, and why?`,
    hint: md`$\Pran = \nu/\alpha$.`,
    answer: md`(a) $\Pran = 0.707$; (b) $\Pran = 6.99$. Only air, whose $\Pran$ is close to 1.`,
    solution: md`(a) $\Pran = 1.57\times10^{-5}/(2.22\times10^{-5}) = 0.707$. (b) $\Pran = 1.00\times10^{-6}/(1.43\times10^{-7}) = 6.99$.

In air, momentum and heat diffuse by molecular action at similar rates ($\nu \approx \alpha$), the situation in which the Reynolds analogy's neglect of molecular diffusion matters least (Example 9.6: RA = DB at $\Pran = 1$; about −20 % at $\Pran = 0.7$). In water, momentum diffuses about seven times faster than heat; the sublayer then dominates heat transfer and the RA over-predicts badly (about +220 % at $\Pran = 7$, $\Rey = 50\,000$).`,
    check: [
      { label: 'Pr (air)', value: 0.707 },
      { label: 'Pr (water)', value: 6.99 },
    ],
  },
  {
    id: 'ev-p4',
    concept: 'analogy-evaluation',
    difficulty: 3,
    q: md`Wilkes calls the agreement between the Reynolds analogy and Dittus–Boelter at $\Pran = 1$ outstanding — but he checks it only at $\Rey = 50\,000$. How good is it at the ends of the Blasius range, $\Rey = 10^4$ and $\Rey = 10^5$? Give $\Nu_\mathrm{RA}/\Nu_\mathrm{DB}$ at each.`,
    hint: md`At $\Pran = 1$, $\Nu_\mathrm{RA}/\Nu_\mathrm{DB} = 1.717\,\Rey^{-0.05}$.`,
    answer: md`1.084 at $\Rey = 10^4$ (+8 %) and 0.966 at $\Rey = 10^5$ (−3 %).`,
    solution: md`1. At $\Pran = 1$: $\Nu_\mathrm{RA}/\Nu_\mathrm{DB} = (0.0395/0.023)\,\Rey^{0.75 - 0.8} = 1.717\,\Rey^{-0.05}$.
2. $\Rey = 10^4$: $10^{-0.2} = 0.631$, ratio $= 1.717\times0.631 = 1.084$ ($\Nu_\mathrm{RA} = 39.5$ against $\Nu_\mathrm{DB} = 36.5$).
3. $\Rey = 10^5$: $10^{-0.25} = 0.562$, ratio $= 1.717\times0.562 = 0.966$ ($\Nu_\mathrm{RA} = 222$ against $\Nu_\mathrm{DB} = 230$).
4. So at $\Pran = 1$ the Reynolds analogy (with Blasius) stays within about ±8 % over $10^4 \le \Rey \le 10^5$. The mismatch in the Reynolds-number exponent (0.75 vs 0.8) is small; the mismatch in the Prandtl-number exponent (1 vs 0.4) is the real problem.`,
    check: [
      { label: md`ratio at $\Rey = 10^4$`, value: 1.0836 },
      { label: md`ratio at $\Rey = 10^5$`, value: 0.9658 },
    ],
  },
]

// ---------------------------------------------------------------------------------------------------------------------
// quiz
// ---------------------------------------------------------------------------------------------------------------------

export const quiz: QuizQ[] = [
  {
    id: 'q-ra-1',
    concept: 'reynolds-analogy',
    difficulty: 1,
    q: 'In the Reynolds-analogy model of Fig. 9.13, why do the eddies returning from the wall carry no z-momentum?',
    options: [
      'They leave the wall with the wall velocity, which is zero (no slip)',
      'Eddies only move toward the wall, never away from it',
      'The eddy mass flux away from the wall is zero',
      'Viscous stresses remove their momentum on the way up',
    ],
    answer: 0,
    explain: md`Eddies move in **both** directions with the same mass flux $m$; what differs is what they carry. Fluid leaving the wall has $\overline{v}_{zw} = 0$, so the return flux $m\overline{v}_{zw}$ vanishes and the net momentum delivered is $m\overline{v}_{zm} = \tau_w$ (9.95). A zero return mass flux would break mass conservation at the wall.`,
    src: wil('520', 'Eq. (9.95)'),
  },
  {
    id: 'q-ra-2',
    concept: 'reynolds-analogy',
    difficulty: 2,
    q: 'A Moody chart gives a Darcy friction factor f = 0.024 for a turbulent pipe flow. What Stanton number does the Reynolds analogy predict?',
    options: ['0.0030', '0.012', '0.024', '0.0060'],
    answer: 0,
    explain: md`Wilkes's (9.99) uses the **Fanning** factor: $f_\mathrm{F} = f/4 = 0.006$, so $\St = f_\mathrm{F}/2 = 0.0030$ (equivalently $\St = f/8$). 0.012 comes from halving the Darcy factor without converting it; 0.0060 forgets the ½.`,
  },
  {
    id: 'q-ra-3',
    concept: 'reynolds-analogy',
    difficulty: 2,
    q: md`According to Wilkes, what does the Stanton number $\St = h/(\rho\overline{v}_{zm}c_p)$ measure?`,
    options: [
      'The overall heat transport to the wall relative to convective effects in the mainstream',
      'The ratio of the molecular diffusivity of momentum to that of heat',
      'The ratio of inertial to viscous forces',
      'The temperature difference across the laminar sublayer',
    ],
    answer: 0,
    explain: md`On p. 521 the friction factor compares momentum transport to the wall with inertial effects in the mainstream, and the Stanton number compares heat transport to the wall with convective effects in the mainstream. The diffusivity ratio $\nu/\alpha$ is the Prandtl number (E9.6.7); inertia/viscous is the Reynolds number.`,
    src: wil('521'),
  },
  {
    id: 'q-ra-4',
    concept: 'reynolds-analogy',
    difficulty: 2,
    q: 'Within the Reynolds-analogy model, doubling the eddy mass flux m would…',
    options: [
      md`double both $\tau_w$ and $q$, leaving $\St/(f_\mathrm{F}/2) = 1$`,
      md`double $\tau_w$ but leave $q$ unchanged`,
      md`double St but leave $f_\mathrm{F}$ unchanged`,
      md`halve the heat-transfer coefficient $h$`,
    ],
    answer: 0,
    explain: md`Both fluxes are proportional to $m$: $\tau_w = m\overline{v}_{zm}$ and $q = mc_p(\overline{T}_m - \overline{T}_w)$, so $f_\mathrm{F}/2 = \St = m/(\rho\overline{v}_{zm})$ both double and stay equal (and $h = mc_p$ doubles). The prediction St = $f_\mathrm{F}/2$ does not depend on how vigorous the eddies are — nor on the fluid's $\mu$ and $k$.`,
  },
  {
    id: 'q-pt-1',
    concept: 'prandtl-taylor',
    difficulty: 1,
    q: 'What does the Prandtl–Taylor analogy add to the Reynolds analogy?',
    options: [
      'A laminar sublayer next to the wall in which momentum moves by viscosity and heat by conduction, with linear profiles',
      'A buffer region between the laminar sublayer and the turbulent core',
      'Mass transfer alongside heat transfer',
      'Different eddy mass fluxes for momentum and for heat',
    ],
    answer: 0,
    explain: md`A laminar sublayer of thickness $\delta$ is inserted between the wall and the eddies (p. 521). A buffer region and mass transfer are the **further** refinements mentioned after (9.103), and the core still uses one eddy flux $m$ for both momentum and heat.`,
    src: wil('521–522'),
  },
  {
    id: 'q-pt-2',
    concept: 'prandtl-taylor',
    difficulty: 2,
    q: 'For a fluid with Pr > 1, the Prandtl–Taylor analogy predicts that the Stanton number is…',
    options: [md`smaller than $f_\mathrm{F}/2$`, md`larger than $f_\mathrm{F}/2$`, md`equal to $f_\mathrm{F}/2$, as in the Reynolds analogy`],
    answer: 0,
    explain: md`The bracket $1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)$ in (9.102) exceeds 1 when $\Pran > 1$. Physically, the sublayer resists heat (conduction) more than momentum (viscosity) by the factor $\Pran$; equality holds only at $\Pran = 1$.`,
    src: wil('522', 'Eq. (9.102)'),
  },
  {
    id: 'q-pt-3',
    concept: 'prandtl-taylor',
    difficulty: 2,
    q: md`In deriving (9.102), why does Wilkes eliminate $\overline{T}_\delta$ rather than $\overline{v}_{z\delta}$?`,
    options: [
      md`Little is known about $\overline{T}_\delta$, whereas $\overline{v}_{z\delta}/\overline{v}_{zm}$ can be found from velocity-profile results, (9.103)`,
      md`$\overline{T}_\delta$ always equals $\overline{T}_w$`,
      md`$\overline{v}_{z\delta}$ is zero by the no-slip condition`,
      md`Eliminating $\overline{v}_{z\delta}$ would leave $\delta$ in the result`,
    ],
    answer: 0,
    explain: md`Either could be eliminated, but $\overline{T}_\delta$ is preferred because little is known about it (p. 522); the velocity ratio follows from (9.61)–(9.62) as $2.44/\Rey^{1/8}$. $\overline{v}_{z\delta}$ is the velocity at $y = \delta$, not at the wall, so it is not zero, and $\delta$ is removed in either case by dividing the two pairs of equations.`,
    src: wil('522'),
  },
  {
    id: 'q-pt-4',
    concept: 'prandtl-taylor',
    difficulty: 1,
    q: 'According to (9.103), at Re = 50 000 the velocity at the outer edge of the laminar sublayer is about what fraction of the mean velocity?',
    options: ['0.63', '0.005', '0.82', '1.0'],
    answer: 0,
    explain: md`$2.44/50\,000^{1/8} = 2.44/3.867 = 0.631$. The value 0.005 is the sublayer *thickness* ratio $\delta/D$ from (9.62); 0.82 is the mean-to-centreline velocity ratio $49/60$ of the one-seventh law; 1.0 would mean the core carries no velocity change at all.`,
    src: wil('522', 'Eq. (9.103)'),
  },
  {
    id: 'q-pt-5',
    concept: 'prandtl-taylor',
    difficulty: 1,
    q: 'True or false: at Pr = 1 the Prandtl–Taylor analogy gives exactly the same Stanton (and Nusselt) number as the Reynolds analogy.',
    options: ['True', 'False'],
    answer: 0,
    explain: md`With $\Pran = 1$ the bracket $1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)$ equals 1, so (9.102) becomes (9.99) — the book points this out on p. 522, and Table E9.6 shows identical values (130) at $\Pran = 1$.`,
    src: wil('522'),
  },
  {
    id: 'q-ev-1',
    concept: 'analogy-evaluation',
    difficulty: 1,
    q: 'At Re = 50 000 and Pr = 2, Table E9.6 shows that the Reynolds analogy…',
    options: [
      'over-predicts the Dittus–Boelter Nusselt number by about 50 % (264 vs 173)',
      'under-predicts it by about 50 %',
      'agrees with it to within a few per cent',
      'under-predicts it by about 6 % (162 vs 173)',
    ],
    answer: 0,
    explain: md`RA gives 264 against DB's 173 (+53 %). The "about 6 % low" figure belongs to the Prandtl–Taylor analogy (162). Under-prediction by the RA happens for $\Pran < 1$ (67 vs 100 at $\Pran = 0.5$).`,
    src: wil('523', 'Table E9.6'),
  },
  {
    id: 'q-ev-2',
    concept: 'analogy-evaluation',
    difficulty: 2,
    q: 'Why does the Reynolds analogy fail when Pr is far from 1?',
    options: [
      md`It ignores the molecular diffusivities $\nu$ and $\alpha$, whose ratio is $\Pran$, which control transport near the wall`,
      'The Blasius friction law is inaccurate at Re = 50 000',
      'The Dittus–Boelter correlation applies only to rough pipes',
      'The eddy mass flux m depends on the Prandtl number',
    ],
    answer: 0,
    explain: md`(E9.6.7): $\Pran = \nu/\alpha$, the ratio of the molecular diffusion rates of momentum and heat, which the Reynolds analogy leaves out entirely (p. 523). Blasius is fine at $\Rey = 50\,000$ ($< 10^5$), Dittus–Boelter is for **smooth** pipe, and $m$ is a property of the turbulence, the same for momentum and heat.`,
    src: wil('523', 'Eq. (E9.6.7)'),
  },
  {
    id: 'q-ev-3',
    concept: 'analogy-evaluation',
    difficulty: 1,
    q: 'Which expression equals the Prandtl number?',
    options: [md`$\nu/\alpha$`, md`$\alpha/\nu$`, md`$hD/k$`, md`$k/(\mu c_p)$`],
    answer: 0,
    explain: md`$\Pran = \mu c_p/k = (\mu/\rho)/(k/\rho c_p) = \nu/\alpha$ (E9.6.7). $\alpha/\nu$ and $k/(\mu c_p)$ are its reciprocal; $hD/k$ is the Nusselt number.`,
    src: wil('523', 'Eq. (E9.6.7)'),
  },
  {
    id: 'q-ev-4',
    concept: 'analogy-evaluation',
    difficulty: 2,
    q: 'In Example 9.6, what role does the Dittus–Boelter equation play?',
    options: [
      'It is the benchmark: a correlation of experimentally determined heat-transfer coefficients in smooth pipe',
      'It is derived from the Prandtl–Taylor analogy by adding a buffer region',
      'It supplies the friction factor used in both analogies',
      'It is an exact theoretical solution for turbulent pipe flow',
    ],
    answer: 0,
    explain: md`Dittus–Boelter is based on **experimentally determined** heat-transfer coefficients in smooth pipe (p. 522) and stands in for experiment in Table E9.6. The friction factor in both analogies comes from the Blasius law (E9.6.2), not from Dittus–Boelter.`,
    src: wil('522–523'),
  },
]

// ---------------------------------------------------------------------------------------------------------------------
// flashcards
// ---------------------------------------------------------------------------------------------------------------------

export const flashcards: Flashcard[] = [
  {
    id: 'fc-ra-1',
    front: 'Reynolds analogy — the equation and what it says?',
    back: md`$\tfrac12 f_\mathrm{F} = h/(\rho\overline{v}_{zm}c_p) = \St$ (9.99): half the Fanning friction factor equals the Stanton number, because one eddy flux $m$ carries both momentum and heat.`,
    src: wil('521', 'Eq. (9.99)'),
  },
  {
    id: 'fc-ra-2',
    front: md`Two expressions for the eddy mass flux $m$ in the Reynolds model?`,
    back: md`$m = \tau_w/\overline{v}_{zm} = q/[c_p(\overline{T}_m - \overline{T}_w)]$ (9.97), from $\tau_w = m\overline{v}_{zm}$ (9.95) and $q = mc_p(\overline{T}_m - \overline{T}_w)$ (9.96).`,
    src: wil('520', 'Eqs. (9.95)–(9.97)'),
  },
  {
    id: 'fc-ra-3',
    front: md`Physical meaning of $f_\mathrm{F}$ and St (Wilkes p. 521)?`,
    back: md`$f_\mathrm{F}$: momentum transport to the wall relative to inertial effects in the mainstream. St: heat transport to the wall relative to convective effects in the mainstream. The RA says the two ratios are equal.`,
    src: wil('521'),
  },
  {
    id: 'fc-pt-1',
    front: 'Prandtl–Taylor analogy — the equation?',
    back: md`$\St = \dfrac{f_\mathrm{F}/2}{1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)}$ (9.102); it reduces to the Reynolds analogy at $\Pran = 1$.`,
    src: wil('522', 'Eq. (9.102)'),
  },
  {
    id: 'fc-pt-2',
    front: 'Velocity ratio at the sublayer edge, (9.103)?',
    back: md`$\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/\Rey^{1/8}$ — about 0.631 at $\Rey = 50\,000$ — from the one-seventh law (9.61) and $\delta/D = 61.7/\Rey^{7/8}$ (9.62).`,
    src: wil('522', 'Eq. (9.103)'),
  },
  {
    id: 'fc-pt-3',
    front: 'The laminar-sublayer assumptions of the Prandtl–Taylor model?',
    back: 'Turbulence is negligible inside the sublayer: momentum moves by viscous action and heat by thermal conduction, and both velocity and temperature vary linearly across the very thin layer of thickness δ.',
    src: wil('521'),
  },
  {
    id: 'fc-ev-1',
    front: 'Table E9.6 (Re = 50 000): RA / DB / PTA?',
    back: 'Pr = 0.5: 67 / 100 / 95.   Pr = 1: 130 / 130 / 130.   Pr = 2: 264 / 173 / 162.',
    src: wil('523', 'Table E9.6'),
  },
  {
    id: 'fc-ev-2',
    front: 'Dittus–Boelter (E9.6.1) and the Reynolds-analogy Nusselt number (E9.6.5)?',
    back: md`DB: $\Nu = 0.023\,\Rey^{0.8}\Pran^{0.4}$ (experiment-based, smooth pipe). RA + Blasius: $\Nu = 0.0395\,\Rey^{3/4}\Pran$.`,
    src: [wil('522', 'Eq. (E9.6.1)'), wil('523', 'Eq. (E9.6.5)')],
  },
  {
    id: 'fc-ev-3',
    front: md`Why does the Reynolds analogy work only near $\Pran \approx 1$?`,
    back: md`$\Pran = \nu/\alpha$ (E9.6.7) compares the molecular diffusion of momentum and of heat. The RA ignores both, which is harmless only when they are equal.`,
    src: wil('523', 'Eq. (E9.6.7)'),
  },
]

// ---------------------------------------------------------------------------------------------------------------------
// topic takeaways
// ---------------------------------------------------------------------------------------------------------------------

export const takeaways: string[] = [
  md`**Same eddies, two fluxes.** Eddies exchanging mass flux $m$ between mainstream and wall deliver momentum $\tau_w = m\overline{v}_{zm}$ (9.95) and heat $q = mc_p(\overline{T}_m - \overline{T}_w)$ (9.96).`,
  md`**Reynolds analogy:** eliminating $m$ gives $\tfrac12 f_\mathrm{F} = h/(\rho\overline{v}_{zm}c_p) = \St$ (9.99) — friction data predict a heat-transfer coefficient, and in this model $h = mc_p$.`,
  md`With Blasius, $f_\mathrm{F} = 0.0790\,\Rey^{-1/4}$, the RA becomes $\Nu = 0.0395\,\Rey^{3/4}\Pran$ (E9.6.5) — proportional to $\Pran$, whereas experiment (Dittus–Boelter) grows only as $\Pran^{0.4}$.`,
  md`**Prandtl–Taylor:** a laminar sublayer (viscosity, conduction, linear profiles) in series with the eddy core gives $\St = (f_\mathrm{F}/2)/[1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)]$ (9.102), with $\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44\,\Rey^{-1/8}$ (9.103).`,
  md`At $\Pran = 1$ the PTA collapses to the RA. For $\Pran > 1$ the sublayer is a bigger barrier to heat than to momentum, so $\St < f_\mathrm{F}/2$; for $\Pran < 1$, $\St > f_\mathrm{F}/2$.`,
  md`**Table E9.6** ($\Rey = 50\,000$): RA/DB/PTA = 67/100/95 ($\Pran$ = 0.5), 130/130/130 (1), 264/173/162 (2). The RA is excellent only at $\Pran = 1$; the PTA stays within about 6 %.`,
  md`$\Pran = \mu c_p/k = \nu/\alpha$ (E9.6.7) is the ratio of the molecular diffusivities of momentum and heat — exactly what the RA ignores. Gases ($\Pran \approx 0.7$) sit near the RA's sweet spot; water and oils do not.`,
  md`**Notation traps:** Wilkes's $f_\mathrm{F}$ is the Fanning factor (Darcy $f = 4f_\mathrm{F}$, so $\St = f/8$); $\overline{v}_{zm}$ is the mean velocity (Fox's $\bar V$); $\overline{v}_z^{*} = \sqrt{\tau_w/\rho}$ is Fox's $u_*$, and $f_\mathrm{F}/2 = (\overline{v}_z^{*}/\overline{v}_{zm})^2$.`,
  md`**Limits:** Blasius and (9.103) are for smooth pipes with $\Rey \lesssim 10^5$; for $\Pran \gg 1$ even the PTA drifts low. Wilkes's further refinements: a buffer region between sublayer and core, and extension of the analogies to mass transfer.`,
]

// ---------------------------------------------------------------------------------------------------------------------
// content
// ---------------------------------------------------------------------------------------------------------------------

export default function Content() {
  return (
    <>
      {/* ============================================ Concept 1 ============================================ */}
      <Concept id="reynolds-analogy">
        <Step kind="intro" src={wil('520–521', '§9.13')}>
          <Md>{md`Turbulent eddies carry more than momentum: the same eddies also transport **heat** and **mass** — a point Wilkes first made with mixing-length theory in §9.3. Section 9.13 asks a practical question: can an experimental observation on **momentum** transport — essentially a friction or pressure-drop measurement — be used to predict **heat** transfer? The book's answer is **yes, provided the model is realistic**.

          The simplest model is the **Reynolds analogy** (Fig. 9.13). Idealized eddies move continually in **both directions** between the turbulent core (the *mainstream*) and the duct wall, with the same mass flux $m$ each way. Book-keeping what they carry down and back up gives the wall shear stress and the wall heat flux in terms of the single unknown $m$; eliminating $m$ ties the **Fanning friction factor** to a heat-transfer group, the **Stanton number**.`}</Md>
          <Callout kind="note" title="Where this fits in Wilkes Ch. 9">
            <Md>{md`In Table 9.1 (§9.3) the eddy thermal diffusivity $\alpha_\mathrm{T}$ was simply set equal to the eddy kinematic viscosity $\nu_\mathrm{T}$, and the book flagged that this is only a first approximation, to be examined in §9.13. This topic is that examination.`}</Md>
            <div className="mt-2">
              <SourceChips src={wil('490', 'Table 9.1')} size="xs" />
            </div>
          </Callout>
          <Supplement title="Why engineers care">
            <Md>{md`Pressure drops are easy to measure and friction factors are well tabulated (Blasius, Moody chart); heat-transfer coefficients are harder to obtain. An analogy lets you estimate a heat-exchanger tube's $h$ from friction data — and §9.13 tells you when that shortcut is safe. The topic builds on the Fanning friction factor (9.51) and on the laminar sublayer of §9.8.`}</Md>
          </Supplement>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture a busy staircase between a fast, hot upper floor (the mainstream) and a cold floor that does not move (the wall). Everyone who comes **down** arrives moving with the mainstream velocity $\overline{v}_{zm}$ and at the mainstream temperature $\overline{T}_m$; at the wall they are stopped (no slip) and cooled to $\overline{T}_w$. Everyone who goes back **up** leaves with zero $z$-velocity and the wall temperature.

          Per unit wall area and per second, mass $m$ goes down and the same mass $m$ comes back up, so the wall receives

          - momentum $m\overline{v}_{zm} - m\cdot0$ — this *is* the wall shear stress $\tau_w$;
          - heat $mc_p\overline{T}_m - mc_p\overline{T}_w$ — this *is* the wall heat flux $q$.

          Both deliveries are made by the same traffic, so they are locked together: make the turbulence twice as vigorous and **both** double. That locking is the whole analogy.`}</Md>
          <Callout kind="key" title="A physical reading of St = f_F/2">
            <Md>{md`Dividing $\tau_w = m\overline{v}_{zm}$ by $\rho\overline{v}_{zm}^2$ gives $f_\mathrm{F}/2 = m/(\rho\overline{v}_{zm})$: half the friction factor — and, by the analogy, the Stanton number — is the eddy mass flux to the wall as a fraction of the axial mass flux. With Blasius at $\Rey = 50\,000$ it is only $0.0026$, about a quarter of a per cent.`}</Md>
          </Callout>
          <Callout kind="warning" title="What the model leaves out">
            <Md>{md`Real eddies are damped next to a solid wall; the last stretch is crossed by **molecular** transport — viscosity for momentum, conduction for heat — and molecules do not move momentum and heat equally fast unless $\Pran = 1$. The Reynolds model contains neither $\mu$ nor $k$. Concept 2 adds them.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={wil('520', 'Fig. 9.13')}>
          <Figure
            caption={md`Fig. 9.13 recreated — momentum and heat transport by turbulent eddies. Equal eddy mass flux $m$ moves toward and away from the wall; the results are a heat flux $q$ from mainstream to wall and a wall shear stress $\tau_w$ in the flow direction $z$.`}
            src={wil('520', 'Fig. 9.13')}
          >
            <EddyFigure />
          </Figure>
          <Md>{md`**The bookkeeping behind the figure** — what one square metre of wall receives each second:`}</Md>
          <FlowChart
            rows={[
              [
                { title: 'Eddies arriving from the mainstream', md: md`carry $z$-momentum $m\overline{v}_{zm}$ and enthalpy $mc_p\overline{T}_m$`, tone: 'amber' },
                { title: 'Eddies returning from the wall', md: md`carry $m\overline{v}_{zw} = 0$ and $mc_p\overline{T}_w$`, tone: 'cyan' },
              ],
              [{ title: 'Net delivery to the wall (in − out)', md: md`$\tau_w = m\overline{v}_{zm}$ (9.95) $\qquad q = mc_p(\overline{T}_m - \overline{T}_w)$ (9.96)`, tone: 'indigo' }],
              [{ title: 'Same eddies ⇒ same m', md: md`eliminate $m$ (9.97), divide by $\rho\overline{v}_{zm}$ (9.98) ⇒ $\tfrac12 f_\mathrm{F} = \St$ (9.99)`, tone: 'emerald' }],
            ]}
            arrowLabels={['subtract what goes back from what arrives', 'two expressions for one unknown']}
          />
        </Step>

        <Step kind="equations" src={[wil('520–521', 'Eqs. (9.95)–(9.99)'), wil('498', 'Eq. (9.51)')]}>
          <Md>{md`Two definitions come first: the Fanning friction factor (recalled in Wilkes §9.7) and the heat-transfer coefficient.`}</Md>
          <div className="grid gap-3 lg:grid-cols-2">
            <FormulaCard id="fanning-def" compact />
            <FormulaCard id="h-def" compact />
          </div>
          <Derivation
            title="From two balances to the Reynolds analogy"
            steps={[
              { md: md`$\tau_w = m\overline{v}_{zm} - m\overline{v}_{zw} = m\overline{v}_{zm}$`, why: md`momentum in − out; no slip makes $\overline{v}_{zw} = 0$ — (9.95)` },
              { md: md`$q = mc_p\overline{T}_m - mc_p\overline{T}_w = mc_p(\overline{T}_m - \overline{T}_w)$`, why: md`same eddies, same $m$, now carrying enthalpy — (9.96)` },
              { md: md`$\dfrac{\tau_w}{\overline{v}_{zm}} = m = \dfrac{q}{c_p(\overline{T}_m - \overline{T}_w)}$`, why: md`solve both for $m$ and equate — (9.97)` },
              { md: md`$\dfrac{\tau_w}{\rho\overline{v}_{zm}^2} = \dfrac{q}{\rho\overline{v}_{zm}c_p(\overline{T}_m - \overline{T}_w)}$`, why: md`divide by $\rho\overline{v}_{zm}$ — (9.98)` },
              { md: md`$\dfrac{f_\mathrm{F}}{2} = \dfrac{h}{\rho\overline{v}_{zm}c_p} = \St$`, why: md`(9.51) on the left, $q = h(\overline{T}_m - \overline{T}_w)$ on the right — (9.99)` },
            ]}
          />
          <div className="grid gap-3 lg:grid-cols-2">
            <FormulaCard id="ra-momentum" compact />
            <FormulaCard id="ra-heat" compact />
            <FormulaCard id="ra-eliminate" compact />
            <FormulaCard id="ra-divide" compact />
          </div>
          <FormulaCard id="reynolds-analogy" />
          <Md>{md`**What the two groups mean (p. 521).** The friction factor measures the overall momentum transport to the wall relative to inertial effects in the mainstream; the Stanton number measures the overall heat transport to the wall relative to convective effects in the mainstream. The Reynolds analogy says the two ratios are **identical** — simply because the same basic model was assumed for momentum and for heat.`}</Md>
          <Callout kind="exam">
            <Md>{md`- It is **half** the friction factor: $\St = f_\mathrm{F}/2$, not $f_\mathrm{F}$.
            - Wilkes's $f_\mathrm{F}$ is the **Fanning** factor $\tau_w/(\tfrac12\rho\overline{v}_{zm}^2)$; divide a Moody-chart (Darcy) value by 4 first.
            - Both groups use the **mean** velocity $\overline{v}_{zm}$, and the temperature difference is mainstream minus wall, $\overline{T}_m - \overline{T}_w$.`}</Md>
          </Callout>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's (secondary source)">
            <Md>{md`Fox defines the **friction velocity** $u_* = (\tau_w/\rho)^{1/2}$ (Fox p. 294) — the quantity Wilkes writes $\overline{v}_z^{*} = \sqrt{\tau_w/\rho}$ (p. 496). Because $f_\mathrm{F}/2 = \tau_w/(\rho\overline{v}_{zm}^2) = (\overline{v}_z^{*}/\overline{v}_{zm})^2$, the Reynolds analogy reads $\St = (u_*/\bar V)^2$ in Fox's notation, $\bar V$ being his average velocity (Fox p. 296). Fox's friction factor is the Darcy factor $f = 4f_\mathrm{F}$ (defined outside the course excerpt), so in Darcy form $\St = f/8$.`}</Md>
            <div className="mt-2">
              <SourceChips src={[{ doc: 'fox', pages: '294', note: 'friction velocity' }, { doc: 'fox', pages: '296', note: 'average velocity' }, wil('496', 'friction velocity')]} size="xs" />
            </div>
          </Callout>
          <FormulaCard id="ra-alt-forms" compact />
        </Step>

        <Step kind="example">
          <ExampleCard id="e96-part1" />
          <ExampleCard id="ra-air" />
        </Step>

        <Step kind="interactive">
          <EddyLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="reynolds-analogy" />
          <QuickCheck ids={['q-ra-2', 'q-ra-4']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Reynolds model: eddies shuttle with equal mass flux $m$ each way; down-going eddies bring $\overline{v}_{zm}$ and $\overline{T}_m$, returning ones leave with $0$ and $\overline{T}_w$.`,
              md`$\tau_w = m\overline{v}_{zm}$ and $q = mc_p(\overline{T}_m - \overline{T}_w)$ ⇒ $\tfrac12 f_\mathrm{F} = \St$ (9.99), and $h = mc_p$.`,
              md`St compares heat transport to the wall with convection in the mainstream; $f_\mathrm{F}$ compares momentum transport to the wall with inertia — the analogy says the two ratios are equal.`,
              md`**Exam trap:** it is **half** the **Fanning** factor. With a Darcy factor from a Moody chart, $\St = f/8$.`,
              md`**Built-in weakness:** no $\mu$ or $k$ appears, so the prediction cannot depend on $\Pran$ — trust it only for $\Pran \approx 1$.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================ Concept 2 ============================================ */}
      <Concept id="prandtl-taylor">
        <Step kind="intro" src={wil('521–522', 'Prandtl–Taylor analogy')}>
          <Md>{md`Real eddies cannot reach all the way to a solid wall. The **Prandtl–Taylor analogy** is the natural refinement of the Reynolds analogy: a **laminar sublayer** of thickness $\delta$ is inserted between the wall and the eddies (Fig. 9.14). Inside it, turbulent effects are negligible — momentum is transported by **viscous action** and heat by **thermal conduction** — and because the layer is very thin, velocity and temperature are taken to vary **linearly** across it.

          Each transport rate can now be written twice: across the sublayer (molecular, with $\mu$ or $k$) and across the turbulent region between the sublayer edge and the mainstream (eddy exchange with flux $m$). Eliminating the unknowns $\delta$, $m$ and the sublayer-edge temperature $\overline{T}_\delta$ gives a corrected analogy that contains the **Prandtl number** and reduces to the Reynolds analogy when $\Pran = 1$.`}</Md>
          <Callout kind="note" title="Link to the laminar-sublayer section">
            <Md>{md`Wilkes's §9.8 computes the sublayer thickness with exactly this two-piece picture (linear sublayer + turbulent core) and remarks that it is the model the Prandtl–Taylor analogy needs.`}</Md>
            <div className="mt-2">
              <SourceChips src={wil('499', '§9.8')} size="xs" />
            </div>
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of each flux as a current flowing through **two resistances in series** — the sublayer next to the wall, then the eddy core:`}</Md>
          <FlowRow
            nodes={[
              { title: 'Wall', md: md`$\overline{v}_{zw} = 0$, $\overline{T}_w$`, tone: 'slate' },
              { title: 'Laminar sublayer', md: md`momentum $\delta/\mu$; heat $\delta/k$`, tone: 'violet' },
              { title: 'Eddy core', md: md`momentum $1/m$; heat $1/(mc_p)$`, tone: 'amber' },
              { title: 'Mainstream', md: md`$\overline{v}_{zm}$, $\overline{T}_m$`, tone: 'rose' },
            ]}
          />
          <Md>{md`Rearranging (9.100)–(9.101): $\overline{v}_{zm} = \tau_w\left(\dfrac{\delta}{\mu} + \dfrac{1}{m}\right)$ and $\overline{T}_m - \overline{T}_w = q\left(\dfrac{\delta}{k} + \dfrac{1}{mc_p}\right)$. Multiply the heat resistances by $c_p$ to express them in "momentum units": the core term becomes $1/m$ — **the same** as for momentum — but the sublayer term becomes $c_p\delta/k = \Pran\,(\delta/\mu)$.

          So the sublayer is **$\Pran$ times harder for heat to cross than for momentum**, while the core treats both alike:

          - $\Pran = 1$: identical "circuits" — the Reynolds analogy is exact within the model;
          - $\Pran > 1$ (water, oils): heat is held up in the sublayer, so $\St < f_\mathrm{F}/2$;
          - $\Pran < 1$: heat slips through the sublayer more easily than momentum, so $\St > f_\mathrm{F}/2$.`}</Md>
          <Callout kind="tip" title="What you would see">
            <Md>{md`At $\Rey = 50\,000$ the sublayer is only about 0.5 % of the diameter thick, yet the velocity rises to 63 % of its mean value across it. For $\Pran = 5$ the temperature changes even more there — about 90 % of the whole wall-to-mainstream difference (second worked example below).`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={wil('521', 'Fig. 9.14')}>
          <Figure
            caption={md`Fig. 9.14 recreated — a laminar sublayer of thickness $\delta$ (shaded; thickness exaggerated) beneath the turbulent mainstream. The profiles are drawn from the model for $\Pran = 2$, $\Rey = 50\,000$ on a common 0-to-1 scale, so $\overline{v}_{z\delta}$ and $\overline{T}_\delta$ sit at their computed positions (0.63 and 0.77).`}
            src={wil('521', 'Fig. 9.14')}
          >
            <TwoLayerProfiles Pr={2} Re={50000} mode="figure" />
          </Figure>
          <Md>{md`Compared with Fig. 9.13, the book's figure drops the boxed mainstream and wall labels and instead lists the **velocities** ($\overline{v}_{zw} = 0$, $\overline{v}_{z\delta}$, $\overline{v}_{zm}$) and **temperatures** ($\overline{T}_w$, $\overline{T}_\delta$, $\overline{T}_m$) beneath the wall. Wilkes draws both curves as smooth schematic shapes; here they are straight inside the sublayer, exactly as the analysis assumes.`}</Md>
        </Step>

        <Step kind="equations" src={wil('522', 'Eqs. (9.100)–(9.103)')}>
          <Md>{md`With the notation of Fig. 9.14 and linear profiles in the sublayer, the two transport rates become:`}</Md>
          <FormulaCard id="pt-momentum" />
          <FormulaCard id="pt-heat" />
          <Md>{md`Either pair can be divided by the other to eliminate **both** $\delta$ and $m$; then either $\overline{T}_\delta$ or $\overline{v}_{z\delta}$ can be eliminated. Wilkes eliminates $\overline{T}_\delta$, because little is known about it. A few lines of algebra (written out in the next step) give:`}</Md>
          <FormulaCard id="prandtl-taylor" />
          <Md>{md`For $\Pran = 1$ the bracket equals 1 and the Reynolds analogy (9.99) is recovered. The velocity ratio follows from the one-seventh power law (9.61) and the sublayer thickness (9.62):`}</Md>
          <FormulaCard id="velocity-ratio" />
          <Callout kind="note" title="Further refinements (p. 522)">
            <Md>{md`Wilkes names two: insert a **buffer region** between the turbulent mainstream and the laminar sublayer, and include **mass transfer** in the analogies.`}</Md>
          </Callout>
          <Callout kind="warning">
            <Md>{md`- The ratio in the bracket is $\overline{v}_{z\delta}/\overline{v}_{zm}$ (less than 1), not its inverse.
            - $\Pran$ enters as $(\Pran - 1)$ in the **denominator**; do not simply multiply $f_\mathrm{F}/2$ by $\Pran$.
            - (9.103) rests on Blasius and one-seventh-law results: smooth walls, $\Rey \lesssim 10^5$.`}</Md>
          </Callout>
        </Step>

        <Step kind="derivation" src={wil('522', 'Eqs. (9.100)–(9.102)')} title="Derivation: from two layers to (9.102)">
          <Md>{md`Wilkes compresses this into "several lines of algebra". Here they are, following his recipe: divide to remove $\delta$ and $m$, then eliminate $\overline{T}_\delta$.`}</Md>
          <Derivation
            steps={[
              { md: md`$\dfrac{q}{\tau_w} = \dfrac{k(\overline{T}_\delta - \overline{T}_w)}{\mu\,\overline{v}_{z\delta}}$`, why: md`sublayer forms: (9.101) ÷ (9.100), $\delta$ cancels` },
              { md: md`$\dfrac{q}{\tau_w} = \dfrac{c_p(\overline{T}_m - \overline{T}_\delta)}{\overline{v}_{zm} - \overline{v}_{z\delta}}$`, why: md`core forms: (9.101) ÷ (9.100), $m$ cancels` },
              {
                md: md`$\overline{T}_\delta - \overline{T}_w = \dfrac{q}{\tau_w}\dfrac{\mu}{k}\,\overline{v}_{z\delta}, \qquad \overline{T}_m - \overline{T}_\delta = \dfrac{q}{\tau_w}\dfrac{\overline{v}_{zm} - \overline{v}_{z\delta}}{c_p}$`,
                why: 'rearrange each line',
              },
              { md: md`$\overline{T}_m - \overline{T}_w = \dfrac{q}{\tau_w c_p}\Big[\Pran\,\overline{v}_{z\delta} + \overline{v}_{zm} - \overline{v}_{z\delta}\Big]$`, why: md`add them: $\overline{T}_\delta$ disappears; $\mu c_p/k = \Pran$` },
              { md: md`$\overline{T}_m - \overline{T}_w = \dfrac{q\,\overline{v}_{zm}}{\tau_w c_p}\left[1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}(\Pran - 1)\right]$`, why: md`factor out $\overline{v}_{zm}$` },
              {
                md: md`$\St = \dfrac{q}{\rho\overline{v}_{zm}c_p(\overline{T}_m - \overline{T}_w)} = \dfrac{\tau_w/(\rho\overline{v}_{zm}^2)}{1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}(\Pran - 1)} = \dfrac{f_\mathrm{F}/2}{1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}(\Pran - 1)}$`,
                why: md`$\St = h/(\rho\overline{v}_{zm}c_p)$ with $h = q/(\overline{T}_m - \overline{T}_w)$ ⇒ (9.102)`,
              },
            ]}
          />
          <Supplement title="By-product: how the temperature difference is shared">
            <Md>{md`Dividing the first result of line 3 by line 5 gives the fraction of $\overline{T}_m - \overline{T}_w$ that is used up across the sublayer:`}</Md>
            <FormulaCard id="sublayer-share" />
          </Supplement>
          <Supplement title="Where does the 2.44 in (9.103) come from?">
            <Md>{md`Wilkes states only that (9.103) follows from (9.61) and (9.62), both on p. 500:`}</Md>
            <div className="grid gap-3 lg:grid-cols-2">
              <FormulaCard id="seventh-law" compact />
              <FormulaCard id="sublayer-thickness" compact />
            </div>
            <Derivation
              steps={[
                { md: md`$\dfrac{\overline{v}_{z\delta}}{\overline{v}_{zc}} = \left(\dfrac{\delta}{a}\right)^{1/7} = \left(\dfrac{2\delta}{D}\right)^{1/7}$`, why: md`(9.61) at $y = \delta$, with $a = D/2$` },
                { md: md`$= \left(123.4\,\Rey^{-7/8}\right)^{1/7} = 1.990\,\Rey^{-1/8}$`, why: md`(9.62): $2\delta/D = 2\times61.7\,\Rey^{-7/8}$` },
                { md: md`$\dfrac{\overline{v}_{zm}}{\overline{v}_{zc}} = \dfrac{2n^2}{(n+1)(2n+1)}\bigg|_{n=7} = \dfrac{98}{120} = \dfrac{49}{60} = 0.8167$`, why: 'mean ÷ centreline velocity of a one-seventh-power profile' },
                { md: md`$\dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \dfrac{1.990}{0.8167}\,\Rey^{-1/8} = 2.436\,\Rey^{-1/8} \approx \dfrac{2.44}{\Rey^{1/8}}$`, why: 'divide — this is (9.103)' },
              ]}
            />
            <Callout kind="note" title="Cross-reference — Fox & McDonald's (secondary source)">
              <Md>{md`The mean-to-centreline ratio used above is Fox's Eq. (8.24), $\bar V/U = 2n^2/[(n+1)(2n+1)]$, which gives 0.817 for $n = 7$ (Fox p. 296). Fox quotes the viscous sublayer $u^+ = y^+$ for $0 \le y^+ \le 5$–$7$ (Eq. 8.19, Fox p. 294) — thinner than the $y^+ = 11.6$ junction of Wilkes's two-piece profile. The constant in a Prandtl–Taylor-type analogy depends on where the sublayer edge is placed, so different texts may quote different constants.`}</Md>
              <div className="mt-2">
                <SourceChips src={[{ doc: 'fox', pages: '296', note: 'Eq. (8.24)' }, { doc: 'fox', pages: '294', note: 'Eq. (8.19)' }]} size="xs" />
              </div>
            </Callout>
            <Md>{md`A quick consistency check with Wilkes's own wall-unit profile (sublayer edge at $y^+ = 11.6$, Eqs. 9.56–9.57):`}</Md>
            <FormulaCard id="ratio-wall-units" compact />
          </Supplement>
        </Step>

        <Step kind="example">
          <ExampleCard id="e96-part2" />
          <ExampleCard id="pt-sublayer" />
        </Step>

        <Step kind="interactive">
          <TwoLayerLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="prandtl-taylor" />
          <QuickCheck ids={['q-pt-2', 'q-pt-5']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`PTA = Reynolds model + a laminar sublayer of thickness $\delta$ (viscous momentum transport, conductive heat transport, linear profiles): two resistances in series.`,
              md`(9.100)–(9.101) write each flux across the sublayer and across the core; divide to remove $\delta$ and $m$, then eliminate $\overline{T}_\delta$ ⇒ (9.102).`,
              md`$\St/(f_\mathrm{F}/2) = 1/[1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)]$: less than 1 for $\Pran > 1$, equal to 1 at $\Pran = 1$, greater than 1 for $\Pran < 1$.`,
              md`$\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44\,\Rey^{-1/8}$ (9.103), from the one-seventh law (9.61) and $\delta/D = 61.7\,\Rey^{-7/8}$ (9.62) — about 0.63 at $\Rey = 50\,000$.`,
              md`**Common mistakes:** putting $\Pran$ (or $\Pran - 1$) in the numerator, or using $\overline{v}_{zm}/\overline{v}_{z\delta}$ (> 1) instead of $\overline{v}_{z\delta}/\overline{v}_{zm}$ (< 1).`,
            ]}
          />
        </Step>
      </Concept>

      {/* ============================================ Concept 3 ============================================ */}
      <Concept id="analogy-evaluation">
        <Step kind="intro" src={wil('522–524', 'Example 9.6')}>
          <Md>{md`How good are the two analogies? **Example 9.6** tests them the way an engineer would: turn each into a formula for the **Nusselt number** $\Nu = hD/k$, evaluate it for a representative case, and compare with the **Dittus–Boelter** equation — a correlation of *experimentally determined* heat-transfer coefficients in smooth pipe, which the book treats as essentially experimental data. For simplicity, the friction factor in both analogies comes from the **Blasius law**.`}</Md>
          <FlowSteps
            steps={[
              { title: 'Pick a friction law', md: md`Blasius, $f_\mathrm{F} = 0.0790\,\Rey^{-1/4}$ (E9.6.2)` },
              {
                title: 'Turn each analogy into a Nusselt-number formula',
                md: md`RA ⇒ $\Nu = 0.0395\,\Rey^{3/4}\Pran$ (E9.6.5); PTA ⇒ the same divided by $1 + (\overline{v}_{z\delta}/\overline{v}_{zm})(\Pran - 1)$ (E9.6.8)`,
              },
              { title: 'Evaluate at a representative condition', md: md`$\Rey = 50\,000$; $\Pran$ = 0.5, 1.0 and 2.0` },
              { title: 'Compare with experiment', md: md`Dittus–Boelter, $\Nu = 0.023\,\Rey^{0.8}\Pran^{0.4}$ (E9.6.1) ⇒ Table E9.6` },
              { title: 'Explain the differences', md: md`rewrite $\Pran = \nu/\alpha$ (E9.6.7): molecular diffusion of momentum versus heat` },
            ]}
          />
        </Step>

        <Step kind="intuition">
          <Md>{md`The Prandtl number compares how quickly a fluid spreads **momentum** and **heat** by molecular motion alone: $\Pran = \nu/\alpha$. Near the wall, where the eddies die out, molecular motion is all there is — so $\Pran$ decides whether the wall region is a bigger obstacle for heat or for momentum.`}</Md>
          <Compare
            items={[
              { title: 'Pr ≪ 1 (liquid metals)', md: md`Heat diffuses far faster than momentum, so the wall region hardly resists heat ⇒ $\St > f_\mathrm{F}/2$; the RA **under**-predicts.`, tone: 'cyan' },
              { title: 'Pr ≈ 1 (most gases)', md: md`Momentum and heat diffuse alike; whatever the wall region does to one it does to the other ⇒ $\St \approx f_\mathrm{F}/2$. The RA works.`, tone: 'emerald' },
              { title: 'Pr ≫ 1 (water, oils)', md: md`Momentum diffuses faster than heat; the wall region holds heat back ⇒ $\St < f_\mathrm{F}/2$; the RA **over**-predicts, badly.`, tone: 'rose' },
            ]}
          />
          <Md>{md`Typical values near room temperature (supplementary data): air ≈ 0.7, water ≈ 7 (≈ 1.75 at 100 °C), light oils $10^2$–$10^3$, liquid metals ≈ 0.01. Example 9.6 uses 0.5, 1 and 2 — a deliberately gentle range — yet the RA is already about 50 % out at $\Pran = 2$.`}</Md>
        </Step>

        <Step kind="visual" src={wil('523', 'Table E9.6')}>
          <Md>{md`**Table E9.6 — Nusselt numbers at $\Rey = 50\,000$** (as printed):

          | $\Pran$ | RA (E9.6.5) | DB (E9.6.1) | PTA (E9.6.8) |
          |---|---|---|---|
          | 0.5 | 67 | 100 | 95 |
          | 1.0 | 130 | 130 | 130 |
          | 2.0 | 264 | 173 | 162 |`}</Md>
          <Figure
            caption={md`Table E9.6 as grouped bars. The Reynolds analogy (rose) brackets the experiment-based Dittus–Boelter value (green) — too low at $\Pran = 0.5$, too high at $\Pran = 2$ — while the Prandtl–Taylor analogy (indigo) follows it closely.`}
            src={wil('523', 'Table E9.6')}
          >
            <TableE96Chart />
          </Figure>
        </Step>

        <Step kind="equations" src={wil('522–524', 'Eqs. (E9.6.1)–(E9.6.8)')}>
          <div className="grid gap-3 lg:grid-cols-2">
            <FormulaCard id="nusselt-def" compact />
            <FormulaCard id="reynolds-number" compact />
          </div>
          <FormulaCard id="dittus-boelter" />
          <FormulaCard id="blasius" />
          <Md>{md`**Reynolds analogy → Nusselt number.** Combine (9.99) with (E9.6.2), multiply both sides by $\rho\overline{v}_{zm}c_pD/k$ and recognise the groups:`}</Md>
          <div className="grid gap-3 lg:grid-cols-2">
            <FormulaCard id="e963" compact />
            <FormulaCard id="e964" compact />
          </div>
          <FormulaCard id="nu-ra" />
          <Md>{md`**Prandtl–Taylor analogy → Nusselt number.** The same steps applied to (9.102), again with Blasius:`}</Md>
          <FormulaCard id="nu-pta" />
          <Md>{md`**The key to the discrepancy** — the Prandtl number rewritten as a ratio of diffusivities:`}</Md>
          <FormulaCard id="prandtl-diffusivities" />
          <Callout kind="exam">
            <Md>{md`- Learn the *pattern*: RA $\propto \Pran^{1}$, experiment $\propto \Pran^{0.4}$ ⇒ the RA is too high for $\Pran > 1$, too low for $\Pran < 1$, and right at $\Pran = 1$.
            - Useful powers at $\Rey = 50\,000$: $\Rey^{3/4} = 3343.7$, $\Rey^{0.8} = 5743.5$, $\Rey^{1/8} = 3.867$, $\Rey^{1/4} = 14.95$.
            - $\Nu = \St\,\Rey\,\Pran$ converts between the Stanton- and Nusselt-number forms of any analogy.`}</Md>
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="e96-complete" />
          <ExampleCard id="eval-water" />
        </Step>

        <Step kind="interactive">
          <AnalogyTester />
        </Step>

        <Step kind="practice">
          <PracticeList concept="analogy-evaluation" />
          <QuickCheck ids={['q-ev-1', 'q-ev-2']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Example 9.6 judges both analogies against Dittus–Boelter, $\Nu = 0.023\,\Rey^{0.8}\Pran^{0.4}$ — experiment-based data for smooth pipe.`,
              md`RA: $\Nu = 0.0395\,\Rey^{3/4}\Pran$; PTA: the same divided by $1 + 0.631(\Pran - 1)$ at $\Rey = 50\,000$.`,
              md`Table E9.6: the RA is 33 % low at $\Pran = 0.5$ and 53 % high at $\Pran = 2$; the PTA is within about 6 %.`,
              md`The reason is $\Pran = \nu/\alpha$: molecular diffusion of momentum and heat near the wall — ignored by the RA, included (crudely) by the PTA's sublayer.`,
              md`**Exam tip:** quote the printed table values, but show the computation — at $\Rey = 50\,000$, $\Rey^{3/4} = 3343.7$, $\Rey^{0.8} = 5743.5$, $\Rey^{1/8} = 3.867$.`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
