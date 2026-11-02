import type { ExampleDef, Flashcard, FormulaDef, PracticeDef, QuizQ, Src, TopicMeta } from '@/lib/types'
import {
  Callout, Compare, Concept, Derivation, ExampleCard, Figure, FlowSteps, FormulaCard, Md, PracticeList, Plot, QuickCheck,
  SourceChips, Step, Supplement, Takeaways, md,
} from '@/kit'
import { EddySketch } from '../sims/velocity-profiles/EddySketch'
import { CancellationExplorer } from '../sims/velocity-profiles/CancellationExplorer'
import { UniversalProfileLab } from '../sims/velocity-profiles/UniversalProfileLab'
import { SublayerZoom } from '../sims/velocity-profiles/SublayerZoom'
import { SublayerVsRe } from '../sims/velocity-profiles/SublayerVsRe'
import { RealPipe } from '../sims/velocity-profiles/RealPipe'
import { Y_JUNCTION, aPlusOf, fFanning953, vBuffer, vLog } from '../sims/velocity-profiles/profiles'

/* ------------------------------------------------------------------------------------------------
 * Primary source: Wilkes, Fluid Mechanics for Chemical Engineers, Ch. 9 (printed pp. 493–501).
 * Fox & McDonald's §8.4–8.5 (pp. 294–295) appears only in clearly-labelled cross-reference callouts.
 * ---------------------------------------------------------------------------------------------- */

const W = (pages: string, note?: string): Src => (note ? { doc: 'wilkes', pages, note } : { doc: 'wilkes', pages })
const FOX = (pages: string, note?: string): Src => (note ? { doc: 'fox', pages, note } : { doc: 'fox', pages })

export const meta: TopicMeta = {
  id: 'velocity-profiles',
  unit: 'D',
  title: 'Universal Velocity Profile & the Laminar Sublayer',
  subtitle:
    'From Prandtl’s mixing-length hypothesis to the logarithmic law, the wall variables y⁺ and v⁺, the three-layer smooth-pipe profile and the thickness of the laminar sublayer.',
  minutes: 100,
  sources: [W('493–501', '§9.5, §9.6, §9.8 (+ p. 501 link)'), FOX('294–295', 'cross-reference only')],
  concepts: [
    {
      id: 'log-law',
      title: 'The log law from the Prandtl hypothesis',
      src: W('493–495', '§9.5, Eqs. (9.33)–(9.37), Example 9.2'),
      summary: 'ℓ = ky and τ ≐ τw near the wall integrate to the logarithmic law v̄z = (1/k)√(τw/ρ) ln y + c; von Kármán’s local hypothesis gives the same law.',
    },
    {
      id: 'universal-profile',
      title: 'Universal velocity profile for smooth pipes',
      src: W('495–497', '§9.6, Eqs. (9.38)–(9.47), Fig. 9.9'),
      summary: 'Friction velocity and wall variables y⁺, v⁺ collapse smooth-pipe data onto v⁺ = 5.5 + 2.5 ln y⁺, with v⁺ = y⁺ in the sublayer and a buffer region in between.',
    },
    {
      id: 'sublayer',
      title: 'Thickness of the laminar sublayer',
      src: [W('499–500', '§9.8, Eqs. (9.54)–(9.63)'), W('501', '§9.9: roughness vs. sublayer')],
      summary: 'δ = 11.6 ν/√(τw/ρ); δ/D = 58.3/Re^(7/8) (two-piece + Blasius), 61.7 (1/7 law), 25.2 (three-piece) — extremely thin and shrinking almost as 1/Re.',
    },
  ],
  sourceNote: md`**Primary source: Wilkes, Ch. 9 (pp. 493–501). Fox & McDonald's is cited only as a secondary cross-reference.** There is no lecture deck on turbulent flow, so this topic follows the course-designated text: §9.5 *Velocity profiles based on mixing-length theory*, §9.6 *The universal velocity profile for smooth pipes* and §9.8 *Thickness of the laminar sublayer* (plus the roughness link at the start of §9.9, p. 501). Explanations, equations and the worked Example 9.2 come from Wilkes and use his notation ($\overline{v}_z$, $\overline{v}_z^*$, $y^+$, $v_z^+$, Fanning $f_{\mathrm F}$). Fox & McDonald's §8.4–8.5 (pp. 294–295) appears only in labelled cross-reference boxes (Fox notation $\bar u$, $u_*$, $u^+$, Darcy $f = 4f_{\mathrm F}$, and Laufer's data from its Fig. 8.9). The friction-factor laws (§9.7, §9.9, §9.10) belong to the **Friction factor** topic and are only referenced here.`,
}

/* ===================================== FORMULAS ===================================== */

const VS = md`\sqrt{\tau_w/\rho}`

export const formulas: FormulaDef[] = [
  // ---------- concept 1: log law ----------
  {
    id: 'prandtl-ml',
    name: 'Prandtl hypothesis: mixing length ∝ distance from the wall',
    tag: '9.33',
    key: true,
    tex: md`\ell = k\,y`,
    vars: [
      { sym: md`\ell`, desc: 'Prandtl mixing length — how far an eddy carries momentum before it mixes', units: md`\mathrm{m}` },
      { sym: md`k`, desc: md`dimensionless constant, found experimentally to be $k \doteq 0.4$ (often called the von Kármán constant)`, units: md`\text{–}` },
      { sym: md`y`, desc: 'distance **from the wall** ($y = a - r$ in a pipe of radius $a$)', units: md`\mathrm{m}` },
    ],
    conditions: [
      md`turbulent flow next to a solid wall — eddies have more freedom of motion the further they are from it`,
      md`an **over-estimate** of $\ell$ away from the wall (the measured $\ell$ levels off towards the centreline, Eq. 9.29)`,
    ],
    use: md`Combine with the constant-stress assumption (9.34) and the mixing-length stress (9.35) to obtain the log law (9.37).`,
    src: W('493', 'Eq. (9.33)'),
  },
  {
    id: 'const-stress',
    name: 'Constant turbulent stress near the wall',
    tag: '9.34',
    tex: md`\tau^{t}_{yz} \doteq \tau_w`,
    vars: [
      { sym: md`\tau^{t}_{yz}`, desc: 'turbulent (Reynolds) shear stress on planes $y = $ const, acting in the $z$ direction', units: md`\mathrm{Pa}` },
      { sym: md`\tau_w`, desc: 'wall shear stress (taken positive)', units: md`\mathrm{Pa}` },
    ],
    conditions: [
      md`strictly true only in a **small interval near the wall**`,
      md`an **over-estimate** elsewhere: the total stress falls linearly to zero at the centreline (momentum balance, Eq. 9.27)`,
    ],
    use: md`Lets the local stress be replaced by the constant $\tau_w$, so $\sqrt{\tau/\rho}$ becomes the single velocity scale $\sqrt{\tau_w/\rho}$.`,
    src: W('493', 'Eq. (9.34)'),
  },
  {
    id: 'ml-stress',
    name: 'Mixing-length expression for the turbulent stress',
    tag: '9.35',
    tex: md`\tau^{t}_{yz} = \rho\,\ell^{2}\left(\frac{d\overline{v}_z}{dy}\right)^{2}`,
    vars: [
      { sym: md`\rho`, desc: 'fluid density', units: md`\mathrm{kg/m^3}` },
      { sym: md`\ell`, desc: 'mixing length', units: md`\mathrm{m}` },
      { sym: md`\overline{v}_z`, desc: 'time-averaged axial velocity (overline = time average, footnote 6)', units: md`\mathrm{m/s}` },
      { sym: md`d\overline{v}_z/dy`, desc: md`mean velocity gradient — **positive** near a wall, since $\overline{v}_z$ grows with distance from it`, units: md`\mathrm{s^{-1}}` },
    ],
    conditions: [md`mixing-length model of §9.3 (it is Eq. 9.28 with the absolute value dropped because $d\overline{v}_z/dy > 0$)`],
    use: md`The bridge between a model for $\ell$ and the velocity profile: given $\tau^t$ and $\ell$, solve for $d\overline{v}_z/dy = \sqrt{\tau^t/\rho}\,/\,\ell$.`,
    src: W('493–494', 'Eq. (9.35)'),
  },
  {
    id: 'tauw-k',
    name: 'Prandtl hypothesis inserted in the mixing-length stress',
    tag: '9.36',
    tex: md`\tau_w = \rho\,k^{2}y^{2}\left(\frac{d\overline{v}_z}{dy}\right)^{2}`,
    vars: [
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`k`, desc: md`mixing-length constant, $\doteq 0.4$`, units: md`\text{–}` },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
    ],
    conditions: [md`(9.33) and (9.34) substituted into (9.35); near-wall turbulent region`],
    use: md`Take the positive square root: $\dfrac{d\overline{v}_z}{dy} = \dfrac{1}{ky}\sqrt{\dfrac{\tau_w}{\rho}}$ — the gradient falls off as $1/y$.`,
    src: W('494', 'Eq. (9.36)'),
  },
  {
    id: 'log-law',
    name: 'Logarithmic velocity law',
    tag: '9.37',
    key: true,
    tex: md`\overline{v}_z = \frac{1}{k}\sqrt{\frac{\tau_w}{\rho}}\,\ln y + c`,
    vars: [
      { sym: md`\overline{v}_z`, desc: 'time-averaged axial velocity at distance $y$ from the wall', units: md`\mathrm{m/s}` },
      { sym: VS, desc: md`velocity scale built from the wall stress (named the *friction velocity* $\overline{v}_z^*$ in §9.6)`, units: md`\mathrm{m/s}` },
      { sym: md`k`, desc: md`constant, $k \doteq 0.4$ (experimental)`, units: md`\text{–}` },
      { sym: md`c`, desc: 'constant of integration — depends on the flow **and on the units of $y$**', units: md`\mathrm{m/s}` },
    ],
    conditions: [
      md`turbulent flow near a wall; experimentally it **also** holds in the central region of a pipe ($k \doteq 0.4$)`,
      md`**not** valid very close to the wall: as $y \to 0$ it gives $\overline{v}_z \to -\infty$ and an unbounded gradient`,
    ],
    use: md`Evaluate it at two points to eliminate $c$: $\overline{v}_{z2} - \overline{v}_{z1} = \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln(y_2/y_1)$ — two velocity readings in the log region give $\tau_w$.`,
    src: W('494', 'Eq. (9.37)'),
  },
  {
    id: 'vk-hyp',
    name: 'Von Kármán hypothesis for the mixing length',
    tag: 'E9.2.1',
    tex: md`\ell = -k\,\frac{d\overline{v}_z/dy}{d^{2}\overline{v}_z/dy^{2}}`,
    vars: [
      { sym: md`\ell`, desc: 'mixing length', units: md`\mathrm{m}` },
      { sym: md`k`, desc: 'dimensionless constant', units: md`\text{–}` },
      { sym: md`d\overline{v}_z/dy`, desc: 'first derivative of the mean velocity', units: md`\mathrm{s^{-1}}` },
      { sym: md`d^{2}\overline{v}_z/dy^{2}`, desc: 'second derivative (curvature) of the mean velocity', units: md`\mathrm{m^{-1}\,s^{-1}}` },
    ],
    conditions: [
      md`**local**: needs no wall — $\ell$ follows from the shape of the profile itself (free turbulence, e.g. the upper atmosphere)`,
      md`fails where $d^2\overline{v}_z/dy^2 = 0$, e.g. at the inflection points of turbulent-jet profiles`,
    ],
    use: md`Combined with $\tau^t \doteq \tau_w$ it integrates to the same log law as Prandtl's hypothesis (Example 9.2). The minus sign makes $\ell > 0$ near a wall, where the profile is concave.`,
    src: W('494', 'Example 9.2, Eq. (E9.2.1)'),
  },
  {
    id: 'vk-defect',
    name: 'Velocity-defect law for a linear stress distribution',
    tex: md`\overline{v}_z = (\overline{v}_z)_{r=0} + \frac{1}{k}\sqrt{\frac{\tau_w}{\rho}}\left[\sqrt{\frac{r}{a}} + \ln\left(1-\sqrt{\frac{r}{a}}\right)\right]`,
    vars: [
      { sym: md`(\overline{v}_z)_{r=0}`, desc: 'centreline velocity', units: md`\mathrm{m/s}` },
      { sym: md`r`, desc: 'radial distance from the centreline', units: md`\mathrm{m}` },
      { sym: md`a`, desc: 'pipe radius', units: md`\mathrm{m}` },
      { sym: md`k`, desc: md`constant, $\doteq 0.4$`, units: md`\text{–}` },
    ],
    conditions: [
      md`realistic stress distribution $\tau^t_{rz} = -\tau_w (r/a)$ instead of $\tau^t \doteq \tau_w$`,
      md`von Kármán's hypothesis (E9.2.1) for $\ell$; one constant fixed by an infinite velocity gradient at the wall`,
      md`Wilkes: "seemingly more sophisticated" but **not as accurate** as the simple log law, because Prandtl's two over-estimates cancel`,
    ],
    use: md`Gives the velocity *defect* $(\overline{v}_z)_{r=0} - \overline{v}_z$ across the whole radius; it is zero at the centreline and grows without bound at the wall ($r \to a$).`,
    src: W('495', 'unnumbered equation after Example 9.2'),
  },

  // ---------- concept 2: universal profile ----------
  {
    id: 'yplus',
    name: 'Dimensionless distance from the wall',
    tag: '9.38',
    key: true,
    tex: md`y^{+} = \frac{y\sqrt{\tau_w/\rho}}{\nu}`,
    vars: [
      { sym: md`y^{+}`, desc: 'distance from the wall in "wall units"', units: md`\text{–}` },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
      { sym: VS, desc: md`friction velocity $\overline{v}_z^*$`, units: md`\mathrm{m/s}` },
      { sym: md`\nu`, desc: md`kinematic viscosity $\mu/\rho$`, units: md`\mathrm{m^2/s}` },
    ],
    conditions: [md`any wall-bounded flow; the viscous length $\nu/\sqrt{\tau_w/\rho}$ is the natural length scale near the wall`],
    use: md`Convert a physical distance into wall units to decide which layer a point is in: sublayer $y^+ < 5$, buffer $5$–$30$, core $> 30$.`,
    src: W('495', 'Eq. (9.38)'),
  },
  {
    id: 'vplus',
    name: 'Dimensionless velocity',
    tag: '9.39',
    key: true,
    tex: md`v_z^{+} = \frac{\overline{v}_z}{\sqrt{\tau_w/\rho}}`,
    vars: [
      { sym: md`v_z^{+}`, desc: 'velocity in units of the friction velocity', units: md`\text{–}` },
      { sym: md`\overline{v}_z`, desc: 'time-averaged axial velocity', units: md`\mathrm{m/s}` },
      { sym: VS, desc: 'friction velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: [md`used together with $y^+$; Fox & McDonald's writes the same quantity as $u^+ = \bar u/u_*$`],
    use: md`Multiply a dimensionless profile value by $\sqrt{\tau_w/\rho}$ to get the velocity in m/s.`,
    src: W('496', 'Eq. (9.39)'),
  },
  {
    id: 'friction-velocity',
    name: 'Friction velocity',
    key: true,
    tex: md`\overline{v}_z^{\,*} = \sqrt{\frac{\tau_w}{\rho}}`,
    vars: [
      { sym: md`\overline{v}_z^{\,*}`, desc: 'friction velocity (Fox & McDonald’s: $u_*$)', units: md`\mathrm{m/s}` },
      { sym: md`\tau_w`, desc: 'wall shear stress', units: md`\mathrm{Pa}` },
      { sym: md`\rho`, desc: 'density', units: md`\mathrm{kg/m^3}` },
    ],
    conditions: [md`a constant for a given flow; not a velocity that any fluid particle actually has — a scale`],
    use: md`With $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2$ (Eq. 9.51): $\overline{v}_z^{\,*} = \overline{v}_{zm}\sqrt{f_{\mathrm F}/2}$ — typically only 4–7 % of the mean velocity.`,
    src: W('496', 'definition after Eq. (9.41)'),
  },
  {
    id: 'log-AB-dim',
    name: 'Log law rewritten with wall variables',
    tag: '9.40',
    tex: md`\frac{\overline{v}_z}{\sqrt{\tau_w/\rho}} = A + B\ln\frac{y\sqrt{\tau_w/\rho}}{\nu}`,
    vars: [
      { sym: md`A`, desc: 'constant of integration (absorbs $c$ and the units of $y$)', units: md`\text{–}` },
      { sym: md`B`, desc: '$= 1/k$', units: md`\text{–}` },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
    ],
    conditions: [md`same physics as (9.37); smooth wall, turbulent region`],
    use: md`The dimensional form to use when the data are in m and m/s.`,
    src: W('496', 'Eq. (9.40)'),
  },
  {
    id: 'log-AB',
    name: 'Log law in wall variables (general constants)',
    tag: '9.41',
    tex: md`v_z^{+} = A + B\ln y^{+}`,
    vars: [
      { sym: md`A`, desc: 'constant of integration (experimentally 5.5)', units: md`\text{–}` },
      { sym: md`B`, desc: '$1/k$ (experimentally 2.5)', units: md`\text{–}` },
    ],
    conditions: [md`smooth pipes; turbulent region (not the sublayer)`],
    use: md`Fit $A$ and $B$ to measured $(y^+, v_z^+)$ pairs; a straight line on semi-log axes.`,
    src: W('496', 'Eq. (9.41)'),
  },
  {
    id: 'upv',
    name: 'Universal velocity profile (turbulent core)',
    tag: '9.42',
    key: true,
    tex: md`v_z^{+} = 5.5 + 2.5\ln y^{+}`,
    vars: [
      { sym: md`v_z^{+}`, desc: 'dimensionless velocity (9.39)', units: md`\text{–}` },
      { sym: md`y^{+}`, desc: 'dimensionless wall distance (9.38)', units: md`\text{–}` },
    ],
    conditions: [
      md`**smooth** pipes; agrees exceptionally well with experiment over a very wide range of Reynolds number`,
      md`turbulent core: $y^+ > 30$ in the three-region model ($> 11.6$ in the two-piece model); not valid very close to the wall`,
    ],
    use: md`Velocity anywhere in the core: $\overline{v}_z = \sqrt{\tau_w/\rho}\,(5.5 + 2.5\ln y^+)$. Each factor of 10 in $y^+$ adds $2.5\ln 10 = 5.76$ to $v_z^+$.`,
    src: W('496', 'Eq. (9.42)'),
  },
  {
    id: 'sublayer-law',
    name: 'Laminar-sublayer profile',
    tag: '9.43',
    key: true,
    tex: md`v_z^{+} = y^{+}`,
    vars: [
      { sym: md`v_z^{+}`, desc: 'dimensionless velocity', units: md`\text{–}` },
      { sym: md`y^{+}`, desc: 'dimensionless wall distance', units: md`\text{–}` },
    ],
    conditions: [md`very close to the wall, where $\tau_{yz} = \mu\,d\overline{v}_z/dy$ (viscous stress) and $\tau \approx \tau_w$; $y^+ < 5$ (three-region) or $< 11.6$ (two-piece)`],
    use: md`In metres: $\overline{v}_z = \tau_w y/\mu$ — a linear profile, like plane Couette flow.`,
    src: W('496', 'Eq. (9.43)'),
  },
  {
    id: 'three-region',
    name: 'Von Kármán three-region profile',
    tag: '9.44–9.46',
    key: true,
    tex: md`v_z^{+} = \begin{cases} y^{+}, & 0 < y^{+} < 5 \quad \text{(laminar sublayer)}\\[2pt] -3.05 + 5\ln y^{+}, & 5 < y^{+} < 30 \quad \text{(buffer region)}\\[2pt] 5.5 + 2.5\ln y^{+}, & 30 < y^{+} \quad \text{(turbulent core)} \end{cases}`,
    vars: [
      { sym: md`y^{+}`, desc: 'dimensionless wall distance', units: md`\text{–}` },
      { sym: md`v_z^{+}`, desc: 'dimensionless velocity', units: md`\text{–}` },
    ],
    conditions: [
      md`smooth pipes; devised by von Kármán to represent Nikuradse's data better, especially in the buffer region`,
      md`the pieces join (almost) continuously: at $y^+ = 5$ the buffer law gives 4.997, at $y^+ = 30$ it gives 13.96 vs 14.00`,
    ],
    use: md`First compute $y^+$, pick the region, then evaluate that piece. Fig. 9.9 prints the buffer slope as "5.0".`,
    src: W('497', 'Eqs. (9.44)–(9.46)'),
  },
  {
    id: 'sleicher',
    name: 'Sleicher profile (sublayer + buffer)',
    tag: '9.47',
    tex: md`v_z^{+} = \frac{1}{0.088}\tan^{-1}\!\left(0.088\,y^{+}\right)`,
    vars: [
      { sym: md`\tan^{-1}`, desc: 'inverse tangent, in **radians**', units: md`\text{–}` },
      { sym: md`0.088`, desc: 'Sleicher constant', units: md`\text{–}` },
    ],
    conditions: [
      md`excellent fit in the **laminar sublayer and buffer regions** (theory discussed in Wilkes Problem 9.10)`,
      md`not for the core: it saturates at $\pi/(2 \times 0.088) = 17.85$ as $y^+ \to \infty$`,
    ],
    use: md`A single smooth curve from the wall to $y^+ \approx 30$; for small $y^+$, $\tan^{-1}x \approx x$ gives $v_z^+ \approx y^+$.`,
    src: W('497', 'Eq. (9.47)'),
  },

  // ---------- concept 3: sublayer ----------
  {
    id: 'two-piece',
    name: 'Two-piece profile (sublayer + turbulent core)',
    tag: '9.54–9.55',
    tex: md`v_z^{+} = \begin{cases} y^{+}, & 0 < y^{+} < 11.6 \quad \text{(laminar sublayer)}\\[2pt] 5.5 + 2.5\ln y^{+}, & 11.6 < y^{+} \quad \text{(turbulent core)} \end{cases}`,
    vars: [
      { sym: md`y^{+}`, desc: 'dimensionless wall distance', units: md`\text{–}` },
      { sym: md`v_z^{+}`, desc: 'dimensionless velocity', units: md`\text{–}` },
    ],
    conditions: [md`buffer region ignored "for simplicity"; also the model behind the Prandtl–Taylor analogy (§9.13)`],
    use: md`The simplest piecewise profile; its corner at $y^+ = 11.6$ defines the sublayer thickness.`,
    src: W('499', 'Eqs. (9.54)–(9.55)'),
  },
  {
    id: 'junction',
    name: 'Junction condition',
    tag: '9.56',
    tex: md`v_z^{+} = y^{+} = 5.5 + 2.5\ln y^{+} \quad\Longrightarrow\quad y^{+} = 11.6`,
    vars: [{ sym: md`y^{+}`, desc: 'wall distance at which the two profiles have the same velocity', units: md`\text{–}` }],
    conditions: [md`velocities of the two regions must match at their junction`],
    use: md`Transcendental — solve by iteration $y^+ \leftarrow 5.5 + 2.5\ln y^+$ (gives 11.635; Wilkes: $11.63$, rounded to 11.6).`,
    src: W('499', 'Eq. (9.56)'),
  },
  {
    id: 'delta',
    name: 'Sublayer thickness and edge velocity',
    tag: '9.57',
    key: true,
    tex: md`\delta = 11.6\,\frac{\nu}{\sqrt{\tau_w/\rho}}, \qquad \overline{v}_{z\delta} = 11.6\sqrt{\frac{\tau_w}{\rho}}`,
    vars: [
      { sym: md`\delta`, desc: 'thickness of the laminar sublayer', units: md`\mathrm{m}` },
      { sym: md`\overline{v}_{z\delta}`, desc: 'velocity at the sublayer/turbulent-core junction', units: md`\mathrm{m/s}` },
      { sym: md`\nu`, desc: 'kinematic viscosity', units: md`\mathrm{m^2/s}` },
      { sym: VS, desc: 'friction velocity', units: md`\mathrm{m/s}` },
    ],
    conditions: [md`two-piece model (edge at $y^+ = 11.6$); smooth pipe, turbulent flow`],
    use: md`Set $y^+ = 11.6$ in (9.38) and $v_z^+ = 11.6$ in (9.39). Get $\sqrt{\tau_w/\rho}$ first (from $f_{\mathrm F}$ or the pressure drop).`,
    src: W('499', 'Eq. (9.57)'),
  },
  {
    id: 'delta-D',
    name: 'Sublayer thickness relative to the diameter',
    tag: '9.58',
    tex: md`\frac{\delta}{D} = 11.6\,\frac{\mu}{\rho\overline{v}_{zm}D}\sqrt{\frac{\rho\overline{v}_{zm}^{2}}{\tau_w}} = \frac{16.4}{\mathrm{Re}\sqrt{f_{\mathrm F}}}`,
    vars: [
      { sym: md`D`, desc: 'pipe diameter', units: md`\mathrm{m}` },
      { sym: md`\overline{v}_{zm}`, desc: 'mean (bulk) velocity ($u_m$ of Wilkes Ch. 3)', units: md`\mathrm{m/s}` },
      { sym: md`\mu`, desc: 'viscosity', units: md`\mathrm{Pa\,s}` },
      { sym: md`\mathrm{Re}`, desc: md`Reynolds number $\rho\overline{v}_{zm}D/\mu$`, units: md`\text{–}` },
      { sym: md`f_{\mathrm F}`, desc: md`Fanning friction factor $\tau_w/(\tfrac12\rho\overline{v}_{zm}^2)$, Eq. (9.51)`, units: md`\text{–}` },
    ],
    conditions: [md`two-piece model; any smooth-pipe $f_{\mathrm F}$ may be used (e.g. Eq. 9.53, valid for $5\times10^3 < \mathrm{Re} < 3.4\times10^6$)`],
    use: md`$\sqrt{\rho\overline{v}_{zm}^2/\tau_w} = \sqrt{2/f_{\mathrm F}}$ and $11.6\sqrt2 = 16.4$.`,
    src: W('500', 'Eq. (9.58)'),
  },
  {
    id: 'blasius',
    name: 'Blasius friction law',
    tag: '9.59',
    tex: md`f_{\mathrm F} = 0.0790\,\mathrm{Re}^{-1/4}`,
    vars: [
      { sym: md`f_{\mathrm F}`, desc: md`Fanning friction factor (Darcy $f = 4f_{\mathrm F}$)`, units: md`\text{–}` },
      { sym: md`\mathrm{Re}`, desc: md`Reynolds number based on $D$ and $\overline{v}_{zm}$`, units: md`\text{–}` },
    ],
    conditions: [md`smooth pipes, **Re < 10⁵** (simpler than Eq. 9.53 but of more limited range)`],
    use: md`Explicit, so it makes $\delta/D$ explicit in Re; the friction-factor topic treats it fully (§9.10).`,
    src: W('500', 'Eq. (9.59)'),
  },
  {
    id: 'delta-blasius',
    name: 'Sublayer thickness: two-piece model + Blasius',
    tag: '9.60',
    key: true,
    tex: md`\frac{\delta}{D} = \frac{58.3}{\mathrm{Re}^{7/8}}`,
    vars: [
      { sym: md`\delta/D`, desc: 'sublayer thickness ÷ pipe diameter', units: md`\text{–}` },
      { sym: md`\mathrm{Re}`, desc: 'Reynolds number', units: md`\text{–}` },
    ],
    conditions: [md`two-piece profile (edge $y^+ = 11.6$) with the Blasius law, so $\mathrm{Re} < 10^5$ strictly`],
    use: md`$58.3 = 16.4/\sqrt{0.0790}$; the exponent $7/8 = 1 - 1/8$ comes from $\sqrt{f_{\mathrm F}} \propto \mathrm{Re}^{-1/8}$.`,
    src: W('500', 'Eq. (9.60)'),
  },
  {
    id: 'seventh',
    name: 'One-seventh power-law profile',
    tag: '9.61',
    tex: md`\frac{\overline{v}_z}{\overline{v}_{zc}} = \left(\frac{y}{a}\right)^{1/7}`,
    vars: [
      { sym: md`\overline{v}_{zc}`, desc: 'centreline velocity', units: md`\mathrm{m/s}` },
      { sym: md`y`, desc: 'distance from the wall', units: md`\mathrm{m}` },
      { sym: md`a`, desc: 'pipe radius', units: md`\mathrm{m}` },
    ],
    conditions: [md`smooth pipes, roughly the Blasius range; empirical (developed in §9.10)`],
    use: md`An alternative outer profile; matched to the linear sublayer it gives Eq. (9.62).`,
    src: W('500', 'Eq. (9.61)'),
  },
  {
    id: 'delta-seventh',
    name: 'Sublayer thickness with the one-seventh power law',
    tag: '9.62',
    tex: md`\frac{\delta}{D} = \frac{61.7}{\mathrm{Re}^{7/8}}`,
    vars: [
      { sym: md`\delta/D`, desc: 'sublayer thickness ÷ pipe diameter', units: md`\text{–}` },
      { sym: md`\mathrm{Re}`, desc: 'Reynolds number', units: md`\text{–}` },
    ],
    conditions: [md`one-seventh power law (9.61) instead of the log law; Blasius range`],
    use: md`Only marginally different from (9.60): $61.7/58.3 = 1.06$.`,
    src: W('500', 'Eq. (9.62)'),
  },
  {
    id: 'delta-three',
    name: 'Sublayer thickness with the three-piece profile',
    tag: '9.63',
    tex: md`\frac{\delta}{D} = \frac{25.2}{\mathrm{Re}^{7/8}}`,
    vars: [
      { sym: md`\delta/D`, desc: 'sublayer thickness ÷ pipe diameter', units: md`\text{–}` },
      { sym: md`\mathrm{Re}`, desc: 'Reynolds number', units: md`\text{–}` },
    ],
    conditions: [md`three-piece profile of Fig. 9.9: outer edge of the sublayer at $y^+ = 5$; Blasius range`],
    use: md`$25.2 = 5\sqrt2/\sqrt{0.0790}$ — i.e. (9.60) scaled by $5/11.6 \approx 0.43$.`,
    src: W('500', 'Eq. (9.63)'),
  },
]

/* ===================================== EXAMPLES ===================================== */

export const examples: ExampleDef[] = [
  {
    id: 'ex-vonkarman',
    concept: 'log-law',
    title: 'Example 9.2 — Investigation of the von Kármán hypothesis',
    src: W('494–495', 'Example 9.2'),
    difficulty: 3,
    given: md`Von Kármán proposed that the mixing length be proportional to the ratio of the first two derivatives of the velocity:

$$
\ell = -k\,\frac{d\overline{v}_z/dy}{d^2\overline{v}_z/dy^2} \qquad \text{(E9.2.1)}
$$

with $k$ a dimensionless constant.`,
    find: md`The merits of this hypothesis, and the velocity profile it predicts near a wall compared with Prandtl's.`,
    assumptions: md`Pipe flow near the wall with $\tau^t_{yz} \doteq \tau_w$ (as in Prandtl's model); the velocity gradient becomes infinite at the wall, $y = 0$.`,
    steps: [
      {
        title: 'Why look for another hypothesis?',
        md: md`Prandtl's $\ell = ky$ needs a **wall** to measure $y$ from. Turbulence also occurs far from walls — the upper atmosphere is an extreme example — where there is no obvious length scale on which to base $\ell$. The ratio in (E9.2.1) has the right dimensions: $\dfrac{\mathrm{m/s}\,/\,\mathrm{m}}{\mathrm{m/s}\,/\,\mathrm{m^2}} = \mathrm{m}$. **Advantage:** $\ell$ comes from the *local* behaviour of the velocity profile, not from the presence of a wall.`,
      },
      {
        title: 'Combine with the mixing-length stress',
        md: md`From (9.32), $\nu_{\mathrm T} = \ell^2|d\overline{v}_z/dy|$, the turbulent stress is $\rho\ell^2(d\overline{v}_z/dy)^2$. With $\tau^t_{yz} \doteq \tau_w$ near the wall, take the square root and insert (E9.2.1):

$$
\sqrt{\frac{\tau_w}{\rho}} = \ell\,\frac{d\overline{v}_z}{dy} = -k\,\frac{(d\overline{v}_z/dy)^2}{d^2\overline{v}_z/dy^2} \qquad \text{(E9.2.2)}
$$`,
      },
      {
        title: 'Separate variables and integrate once',
        md: md`Treat $g = d\overline{v}_z/dy$ as the unknown ($d^2\overline{v}_z/dy^2 = dg/dy$):

$$
\int \frac{d\!\left(\dfrac{d\overline{v}_z}{dy}\right)}{\left(\dfrac{d\overline{v}_z}{dy}\right)^2} = -\frac{k}{\sqrt{\tau_w/\rho}}\int dy
\quad\Longrightarrow\quad
\frac{1}{d\overline{v}_z/dy} = \frac{k\,y}{\sqrt{\tau_w/\rho}} + c_1 \qquad \text{(E9.2.3)}
$$`,
      },
      {
        title: 'Fix the constant at the wall',
        md: md`Assume the velocity gradient becomes very steep at the wall: $d\overline{v}_z/dy \to \infty$ at $y = 0$. Then $1/(d\overline{v}_z/dy) \to 0$ there, so $c_1 = 0$ and

$$
\frac{d\overline{v}_z}{dy} = \frac{1}{k\,y}\sqrt{\frac{\tau_w}{\rho}}
$$

— exactly the gradient Prandtl's hypothesis gives.`,
      },
      {
        title: 'Integrate a second time',
        md: md`$$
\overline{v}_z = \frac{1}{k}\sqrt{\frac{\tau_w}{\rho}}\,\ln y + c \qquad \text{(E9.2.4)}
$$

which is **identical** with the result of Prandtl's hypothesis, Eq. (9.37).`,
      },
      {
        title: 'Consistency check (added here)',
        md: md`Put the log profile back into (E9.2.1): $d\overline{v}_z/dy = \sqrt{\tau_w/\rho}/(ky)$ and $d^2\overline{v}_z/dy^2 = -\sqrt{\tau_w/\rho}/(ky^2)$, so

$$
\ell = -k\,\frac{\sqrt{\tau_w/\rho}/(ky)}{-\sqrt{\tau_w/\rho}/(ky^2)} = k\,y
$$

Wherever the profile is logarithmic, von Kármán's local rule reproduces Prandtl's $\ell = ky$.`,
      },
      {
        title: 'The drawback',
        md: md`The hypothesis **fails if $d^2\overline{v}_z/dy^2 = 0$** — a situation that can quite easily occur, for example at the inflection points of the velocity profiles of turbulent jets (Wilkes §9.14; the printed pointer reads "Section 9.13").`,
      },
    ],
    answer: md`Von Kármán's hypothesis leads to the **same log law** $\overline{v}_z = \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln y + c$ (E9.2.4) as Prandtl's (9.37). **Merit:** the length scale is local, so it works without a wall. **Drawback:** it breaks down where $d^2\overline{v}_z/dy^2 = 0$ (inflection points, e.g. in jets).`,
    insight: 'Two different closures give one log law — the log law reflects the constant-stress wall layer rather than the details of the mixing-length model.',
  },
  {
    id: 'ex-two-point',
    concept: 'log-law',
    title: 'Measuring τw from two velocity readings in the log region',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) in a smooth pipe of diameter 150 mm. A Pitot tube in the turbulent core reads $\overline{v}_z = 1.135$ m/s at $y = 5.0$ mm and $\overline{v}_z = 1.335$ m/s at $y = 20.0$ mm from the wall.`,
    find: md`$\sqrt{\tau_w/\rho}$ and $\tau_w$ from the log law (9.37) with $k = 0.4$; check that both points really lie in the turbulent core.`,
    assumptions: md`Both readings lie in the region where (9.37) holds.`,
    steps: [
      {
        title: 'Eliminate the unknown constant c',
        md: md`Write (9.37) at both points and subtract — $c$ cancels:

$$
\overline{v}_{z2} - \overline{v}_{z1} = \frac{1}{k}\sqrt{\frac{\tau_w}{\rho}}\,\ln\frac{y_2}{y_1}
$$`,
      },
      {
        title: 'Friction velocity',
        md: md`$$
\sqrt{\frac{\tau_w}{\rho}} = \frac{k\,(\overline{v}_{z2} - \overline{v}_{z1})}{\ln(y_2/y_1)} = \frac{0.4 \times 0.200}{\ln 4} = \frac{0.0800}{1.386} = 0.0577\ \mathrm{m/s}
$$`,
      },
      {
        title: 'Wall shear stress',
        md: md`$\tau_w = \rho\left(\sqrt{\tau_w/\rho}\right)^2 = 1000 \times 0.0577^2 = 3.33$ Pa.`,
      },
      {
        title: 'Check the region (wall units)',
        md: md`$y^+ = y\sqrt{\tau_w/\rho}/\nu$: at 5 mm, $0.005 \times 0.0577/10^{-6} = 289$; at 20 mm, $1154$. Both are far beyond $y^+ = 30$ (turbulent core) and inside the radius $a = 75$ mm, so using the log law was justified.`,
      },
      {
        title: 'What about c?',
        md: md`$c = \overline{v}_{z1} - \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln y_1 = 1.135 - 0.1443\ln(0.005) = 1.135 + 0.764 = 1.899$ m/s **with $y$ in metres** — but $0.903$ m/s with $y$ in millimetres. $c$ is not a property of the flow alone; the next concept removes this nuisance with wall variables. (In those variables these readings give $A = v_z^+ - 2.5\ln y^+ = 19.67 - 14.16 = 5.51 \approx 5.5$.)`,
      },
    ],
    answer: md`$\sqrt{\tau_w/\rho} = 0.0577$ m/s and $\tau_w = 3.33$ Pa; the points sit at $y^+ = 289$ and $1154$ (turbulent core).`,
    insight: 'Two velocity readings in the log region are enough to measure the wall shear stress — no pressure-drop data needed.',
  },
  {
    id: 'ex-wall-units',
    concept: 'universal-profile',
    title: 'From metres to wall units — and back',
    difficulty: 1,
    given: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) in a smooth pipe with wall shear stress $\tau_w = 9.0$ Pa.`,
    find: md`The friction velocity, the viscous length $\nu/\overline{v}_z^*$, and $y^+$, the region and $\overline{v}_z$ at $y = 0.05$, $0.2$, $1$ and $10$ mm (three-region profile, Eqs. 9.44–9.46).`,
    steps: [
      {
        title: 'Friction velocity',
        md: md`$\overline{v}_z^* = \sqrt{\tau_w/\rho} = \sqrt{9.0/1000} = 0.0949$ m/s.`,
      },
      {
        title: 'One wall unit',
        md: md`$\nu/\overline{v}_z^* = 1.0\times10^{-6}/0.0949 = 1.05\times10^{-5}$ m $= 10.5\ \mu$m. So $y^+ = y/(10.5\ \mu\mathrm{m})$.`,
      },
      {
        title: 'Evaluate point by point',
        md: md`| $y$ (mm) | $y^+$ | region | $v_z^+$ | $\overline{v}_z = v_z^+\,\overline{v}_z^*$ (m/s) |
|---|---|---|---|---|
| 0.05 | 4.74 | sublayer: $v_z^+ = y^+$ | 4.74 | 0.450 |
| 0.2 | 19.0 | buffer: $-3.05 + 5\ln 19.0$ | 11.67 | 1.107 |
| 1 | 94.9 | core: $5.5 + 2.5\ln 94.9$ | 16.88 | 1.601 |
| 10 | 949 | core: $5.5 + 2.5\ln 949$ | 22.64 | 2.148 |`,
      },
      {
        title: 'Read the table',
        md: md`Only 0.05 mm from the wall the water already moves at 0.45 m/s, and by 1 mm it has reached 1.6 m/s. Going ten times further out (1 → 10 mm) adds only 0.55 m/s — the flat turbulent core.`,
      },
    ],
    answer: md`$\overline{v}_z^* = 0.0949$ m/s; $\nu/\overline{v}_z^* = 10.5\ \mu$m; $\overline{v}_z = 0.450$, $1.11$, $1.60$ and $2.15$ m/s at 0.05, 0.2, 1 and 10 mm.`,
    insight: 'Always compute y⁺ first — it tells you which law to use.',
  },
  {
    id: 'ex-junction',
    concept: 'universal-profile',
    title: 'Where do the sublayer and core laws meet?',
    difficulty: 2,
    given: md`The core law (9.42) $v_z^+ = 5.5 + 2.5\ln y^+$ and the sublayer law (9.43) $v_z^+ = y^+$.`,
    find: md`Their intersection $y^+$ to four significant figures, and the velocity that the three-region and Sleicher profiles give at that point.`,
    steps: [
      {
        title: 'Set the two laws equal',
        md: md`$y^+ = 5.5 + 2.5\ln y^+$ is transcendental (no closed-form solution). Iterate $y^+_{\text{new}} = 5.5 + 2.5\ln y^+_{\text{old}}$ — it converges because the slope $2.5/y^+ \approx 0.21 < 1$.`,
      },
      {
        title: 'Iterate from 10',
        md: md`$10 \to 11.256 \to 11.552 \to 11.617 \to 11.631 \to 11.634 \to 11.635$. So $y^+ = 11.63$ — the value Wilkes quotes (p. 496), rounded to 11.6 in §9.8 — and $v_z^+ = 11.63$ there.`,
      },
      {
        title: 'Compare with the smoother profiles',
        md: md`Buffer law (9.45): $-3.05 + 5\ln 11.635 = 9.22$. Sleicher (9.47): $\frac{1}{0.088}\tan^{-1}(1.024) = 9.06$. The two-piece corner therefore over-states the velocity there by $11.63 - 9.22 = 2.41$, about 26 %.`,
      },
    ],
    answer: md`$y^+ = v_z^+ = 11.63$; the three-region profile gives $v_z^+ = 9.22$ and Sleicher's $9.06$ at that point.`,
    insight: 'y⁺ = 11.6 is where two idealized lines cross, not a physical switch — the real profile rounds this corner (buffer region).',
  },
  {
    id: 'ex-sublayer-water',
    concept: 'sublayer',
    title: 'How thick is the sublayer in a water pipe?',
    difficulty: 2,
    given: md`Water ($\rho = 1000$ kg/m³, $\mu = 1.0\times10^{-3}$ Pa·s) flows at a mean velocity $\overline{v}_{zm} = 1.6$ m/s in a smooth pipe of diameter $D = 50$ mm.`,
    find: md`Re, $f_{\mathrm F}$ (Blasius), $\tau_w$, $\sqrt{\tau_w/\rho}$, the sublayer thickness $\delta$ and $\delta/D$ (two-piece model; check with Eq. 9.60), the edge velocity $\overline{v}_{z\delta}$ and the three-piece edge; compare $\overline{v}_{z\delta}$ with the centreline velocity.`,
    steps: [
      { title: 'Reynolds number', md: md`$\mathrm{Re} = \rho\overline{v}_{zm}D/\mu = 1000 \times 1.6 \times 0.05/10^{-3} = 8.0\times10^4 < 10^5$, so Blasius (9.59) may be used.` },
      { title: 'Friction factor and wall stress', md: md`$f_{\mathrm F} = 0.0790\,\mathrm{Re}^{-1/4} = 0.0790/16.82 = 0.00470$. From the definition of $f_{\mathrm F}$ (Eq. 9.51): $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 = 0.5 \times 0.00470 \times 1000 \times 1.6^2 = 6.01$ Pa, so $\sqrt{\tau_w/\rho} = 0.0775$ m/s.` },
      {
        title: 'Sublayer thickness (9.57)',
        md: md`$$
\delta = 11.6\,\frac{\nu}{\sqrt{\tau_w/\rho}} = \frac{11.6 \times 1.0\times10^{-6}}{0.0775} = 1.50\times10^{-4}\ \mathrm{m} = 0.150\ \mathrm{mm}, \qquad \frac{\delta}{D} = 0.00299
$$

Check with (9.60): $58.3/\mathrm{Re}^{7/8} = 58.3/19\,510 = 0.00299$ ✓.`,
      },
      { title: 'Velocity at the edge', md: md`$\overline{v}_{z\delta} = 11.6\sqrt{\tau_w/\rho} = 11.6 \times 0.0775 = 0.90$ m/s — **56 %** of the mean velocity, reached within 0.15 mm of the wall.` },
      { title: 'Three-piece edge', md: md`With the edge at $y^+ = 5$: $5\nu/\sqrt{\tau_w/\rho} = 6.45\times10^{-5}$ m $= 0.065$ mm (the ratio $25.2/58.3 \approx 0.43$ of the two-piece value).` },
      { title: 'Compare with the centreline (supplementary)', md: md`$a^+ = a\sqrt{\tau_w/\rho}/\nu = 0.025 \times 0.0775/10^{-6} = 1939$, so the log law at $y = a$ gives $\overline{v}_{zc} \approx 0.0775\,(5.5 + 2.5\ln 1939) = 1.89$ m/s. Hence $\overline{v}_{z\delta}/\overline{v}_{zc} = 0.47$: across 0.6 % of the radius the velocity reaches almost half its centreline value.` },
    ],
    answer: md`$\mathrm{Re} = 8.0\times10^4$, $f_{\mathrm F} = 0.00470$, $\tau_w = 6.01$ Pa, $\sqrt{\tau_w/\rho} = 0.0775$ m/s, $\delta = 0.150$ mm ($\delta/D = 0.00299$), $\overline{v}_{z\delta} = 0.90$ m/s (56 % of the mean, 47 % of the centreline value); three-piece edge 0.065 mm.`,
    insight: 'Exactly Wilkes’ two conclusions: the sublayer is extremely thin, yet the velocity builds up to a large fraction of its centreline value across it.',
  },
  {
    id: 'ex-sublayer-scaling',
    concept: 'sublayer',
    title: 'Comparing the three δ/D formulas',
    difficulty: 1,
    given: md`Smooth pipe; Eqs. (9.60), (9.62) and (9.63).`,
    find: md`$\delta/D$ from each at $\mathrm{Re} = 10^4$ and $10^5$, and the factor by which $\delta/D$ falls when Re increases ten-fold.`,
    steps: [
      { title: 'The common factor', md: md`$\mathrm{Re}^{7/8}$: $(10^4)^{7/8} = 10^{3.5} = 3162$; $(10^5)^{7/8} = 10^{4.375} = 23\,714$.` },
      {
        title: 'Evaluate',
        md: md`| model | coefficient | $\mathrm{Re} = 10^4$ | $\mathrm{Re} = 10^5$ |
|---|---|---|---|
| two-piece (9.60) | 58.3 | 0.0184 | 0.00246 |
| 1/7 power law (9.62) | 61.7 | 0.0195 | 0.00260 |
| three-piece (9.63) | 25.2 | 0.00797 | 0.00106 |`,
      },
      { title: 'Ten-fold Re', md: md`Every model falls by $10^{-7/8} = 0.133$, i.e. **7.5 times thinner** — "almost in direct proportion" to Re (exact proportionality would be 10 times).` },
      { title: 'Compare coefficients', md: md`$61.7/58.3 = 1.06$: the 1/7 law is only marginally different. $25.2/58.3 = 0.43 \approx 5/11.6$: the three-piece sublayer is thinner simply because its edge is placed at $y^+ = 5$ instead of 11.6.` },
    ],
    answer: md`At $\mathrm{Re} = 10^4$: 0.0184, 0.0195, 0.00797; at $10^5$: 0.00246, 0.00260, 0.00106. A ten-fold rise in Re thins the sublayer by $10^{7/8} \approx 7.5$.`,
    insight: 'The exponent 7/8 comes from the Blasius law; the coefficient only reflects where the model puts the sublayer edge.',
  },
]

/* ===================================== PRACTICE ===================================== */

export const practice: PracticeDef[] = [
  // ---------- log-law ----------
  {
    id: 'pr-ll-air',
    concept: 'log-law',
    difficulty: 2,
    q: md`In the turbulent core of a smooth air duct ($\rho = 1.2$ kg/m³, $\nu = 1.5\times10^{-5}$ m²/s) a hot-wire probe reads $\overline{v}_z = 6.95$ m/s at $y = 4.0$ mm and $8.35$ m/s at $y = 16.0$ mm from the wall. Using the log law (9.37) with $k = 0.4$, find (a) $\sqrt{\tau_w/\rho}$ and (b) $\tau_w$; (c) verify that both points have $y^+ > 30$.`,
    hint: md`Subtract the log law at the two points so that the constant $c$ disappears.`,
    answer: md`(a) $\sqrt{\tau_w/\rho} = 0.404$ m/s; (b) $\tau_w = 0.196$ Pa; (c) $y^+ = 108$ and $431$.`,
    solution: md`(a) $\overline{v}_{z2} - \overline{v}_{z1} = \frac{1}{k}\sqrt{\tau_w/\rho}\ln(y_2/y_1)$, so

$$
\sqrt{\frac{\tau_w}{\rho}} = \frac{0.4 \times (8.35 - 6.95)}{\ln(16/4)} = \frac{0.560}{1.386} = 0.404\ \mathrm{m/s}
$$

(b) $\tau_w = 1.2 \times 0.404^2 = 0.196$ Pa.

(c) $y^+ = y\sqrt{\tau_w/\rho}/\nu$: $0.004 \times 0.404/1.5\times10^{-5} = 108$ and $0.016 \times 0.404/1.5\times10^{-5} = 431$ — both in the turbulent core, so the log law applies. (These readings also give $A = 6.95/0.404 - 2.5\ln 108 = 5.5$, consistent with the universal profile.)`,
    check: [
      { label: md`$\sqrt{\tau_w/\rho}$`, value: 0.404, units: md`\mathrm{m/s}` },
      { label: md`$\tau_w$`, value: 0.196, units: md`\mathrm{Pa}` },
    ],
  },
  {
    id: 'pr-ll-cancel',
    concept: 'log-law',
    difficulty: 2,
    q: md`At $y/a = 0.3$ in a pipe the measured mixing length is $\ell = 0.0864\,a$ (Eq. 9.29) and the total shear stress is $\tau = 0.7\,\tau_w$ (linear distribution). Prandtl's model uses $\ell = 0.4y$ and $\tau = \tau_w$ instead. By what factor does Prandtl's model over-estimate (a) $\ell$ and (b) $\sqrt{\tau}$? (c) What is the ratio of the velocity gradient predicted by Prandtl's model to the realistic one?`,
    hint: md`$d\overline{v}_z/dy = \sqrt{\tau/\rho}\,/\,\ell$ — one over-estimate sits in the numerator, the other in the denominator.`,
    answer: md`(a) 1.39; (b) 1.20; (c) 0.86 — errors of 39 % and 20 % that largely cancel.`,
    solution: md`(a) Prandtl: $\ell = 0.4 \times 0.3a = 0.120a$; ratio $0.120/0.0864 = 1.39$.

(b) $\sqrt{\tau_w/\tau} = \sqrt{1/0.7} = 1.195$.

(c) Since $d\overline{v}_z/dy = \sqrt{\tau/\rho}/\ell$,

$$
\frac{(d\overline{v}_z/dy)_{\text{Prandtl}}}{(d\overline{v}_z/dy)_{\text{real}}} = \frac{\sqrt{\tau_w/\tau}}{\ell_{\text{Prandtl}}/\ell_{\text{real}}} = \frac{1.195}{1.389} = 0.860
$$

The over-estimated stress raises the gradient by 20 % while the over-estimated mixing length lowers it by 39 %; the net error is only 14 %. This is the "fortuitous cancellation" of Wilkes p. 493.`,
    check: [
      { label: 'ℓ factor', value: 1.389 },
      { label: '√τ factor', value: 1.195 },
      { label: 'gradient ratio', value: 0.860 },
    ],
  },
  {
    id: 'pr-ll-jet',
    concept: 'log-law',
    difficulty: 3,
    q: md`A jet-like velocity profile is approximated by $\overline{v} = U\exp(-y^2/b^2)$, where $y$ is measured from the jet axis and $b$ is a width. Apply von Kármán's hypothesis (E9.2.1) to find (a) $\ell(y)$ and (b) the position $y/b$ at which the hypothesis breaks down.`,
    hint: md`Differentiate twice; the breakdown is where the second derivative vanishes.`,
    answer: md`(a) $\ell = \dfrac{k\,y\,b^2}{2y^2 - b^2}$ (in magnitude); (b) it blows up at $y = b/\sqrt2 = 0.707\,b$, the inflection point of the profile.`,
    solution: md`$\dfrac{d\overline{v}}{dy} = -\dfrac{2y}{b^2}\overline{v}$ and $\dfrac{d^2\overline{v}}{dy^2} = \left(\dfrac{4y^2}{b^4} - \dfrac{2}{b^2}\right)\overline{v}$. Then

$$
\ell = -k\,\frac{-2y/b^2}{4y^2/b^4 - 2/b^2} = \frac{k\,y\,b^2}{2y^2 - b^2}
$$

The denominator vanishes at $y^2 = b^2/2$, i.e. $y/b = 1/\sqrt2 = 0.707$ — exactly where $d^2\overline{v}/dy^2 = 0$, the inflection point. There $\ell \to \infty$, which is the failure Wilkes points out for turbulent jets. (The sign of $\ell$ also flips across the inflection point; only its magnitude is meaningful, since the minus sign in (E9.2.1) was chosen for a wall layer.)`,
    check: [{ label: md`$y/b$ at breakdown`, value: 0.7071 }],
  },
  {
    id: 'pr-ll-defect',
    concept: 'log-law',
    difficulty: 2,
    q: md`Using Wilkes' velocity-defect result for the linear stress distribution (p. 495) with $k = 0.4$, find $(\overline{v}_{zc} - \overline{v}_z)/\sqrt{\tau_w/\rho}$ at $r/a = 0.5$. Compare it with the defect obtained by using the log law (9.37) all the way to the centreline, $2.5\ln(a/y)$.`,
    hint: md`At $r/a = 0.5$ the distance from the wall is $y = a - r = 0.5a$.`,
    answer: md`Linear-stress (von Kármán) law: 1.30; log law: 1.73.`,
    solution: md`From the p. 495 result, $\overline{v}_{zc} - \overline{v}_z = -\frac{1}{k}\sqrt{\tau_w/\rho}\left[\sqrt{r/a} + \ln(1 - \sqrt{r/a})\right]$:

$$
\sqrt{0.5} = 0.7071,\quad \ln(1 - 0.7071) = \ln 0.2929 = -1.2279,\quad -2.5\,(0.7071 - 1.2279) = 1.302
$$

Log law used to the centre: $y = 0.5a$, so $2.5\ln(a/y) = 2.5\ln 2 = 1.733$.

The "more sophisticated" law predicts a flatter core (smaller defect). Measured defects at mid-radius are even a little larger than the log-law value (about 2 from Laufer's data replotted from Fox & McDonald's Fig. 8.9), so the simple log law is the more accurate of the two — as Wilkes says.`,
    check: [
      { label: 'defect, p. 495 law', value: 1.302 },
      { label: 'defect, log law', value: 1.733 },
    ],
  },

  // ---------- universal-profile ----------
  {
    id: 'pr-up-junction',
    concept: 'universal-profile',
    difficulty: 2,
    q: md`(a) Solve $y^+ = 5.5 + 2.5\ln y^+$ by fixed-point iteration, starting at $y^+ = 10$, to four significant figures. (b) What does the three-region profile give for $v_z^+$ at this $y^+$? (c) By what percentage does the two-piece profile exceed the three-region value there?`,
    hint: md`Use $y^+_{n+1} = 5.5 + 2.5\ln y^+_n$; the point lies in the buffer region of the three-region model.`,
    answer: md`(a) $y^+ = 11.63$; (b) $v_z^+ = 9.22$; (c) about 26 %.`,
    solution: md`(a) $10 \to 11.256 \to 11.552 \to 11.617 \to 11.631 \to 11.634 \to 11.635$, so $y^+ = 11.63$ (Wilkes: $y^+ \doteq 11.63$).

(b) $5 < 11.63 < 30$, so use the buffer law (9.45): $v_z^+ = -3.05 + 5\ln 11.635 = -3.05 + 12.27 = 9.22$.

(c) $(11.635 - 9.220)/9.220 = 0.262$, i.e. the two-piece corner is about **26 %** too high at that point.`,
    check: [
      { label: md`$y^+$`, value: 11.63, tol: 0.005 },
      { label: md`$v_z^+$ (three-region)`, value: 9.22 },
      { label: 'excess (%)', value: 26.2, tol: 0.03 },
    ],
  },
  {
    id: 'pr-up-air',
    concept: 'universal-profile',
    difficulty: 2,
    q: md`Air ($\rho = 1.2$ kg/m³, $\nu = 1.5\times10^{-5}$ m²/s) flows through a smooth duct with $\tau_w = 0.50$ Pa. Find (a) the friction velocity, (b) the distances from the wall, in mm, of the inner and outer edges of the buffer region ($y^+ = 5$ and $30$), and (c) the time-averaged velocity at $y^+ = 30$.`,
    hint: md`$y = y^+\,\nu/\overline{v}_z^*$ and $\overline{v}_z = v_z^+\,\overline{v}_z^*$.`,
    answer: md`(a) 0.645 m/s; (b) 0.116 mm and 0.697 mm; (c) 9.04 m/s.`,
    solution: md`(a) $\overline{v}_z^* = \sqrt{0.50/1.2} = 0.645$ m/s.

(b) One wall unit is $\nu/\overline{v}_z^* = 1.5\times10^{-5}/0.645 = 2.32\times10^{-5}$ m. Hence $y(5) = 5 \times 2.32\times10^{-5} = 1.16\times10^{-4}$ m $= 0.116$ mm and $y(30) = 6.97\times10^{-4}$ m $= 0.697$ mm.

(c) At $y^+ = 30$: $v_z^+ = 5.5 + 2.5\ln 30 = 14.00$ (the buffer law gives 13.96 — the pieces meet), so $\overline{v}_z = 14.00 \times 0.645 = 9.04$ m/s.

The whole buffer region is thinner than 0.6 mm, yet the velocity at its outer edge is already 9 m/s.`,
    check: [
      { label: md`$\overline{v}_z^*$`, value: 0.645, units: md`\mathrm{m/s}` },
      { label: md`$y$ at $y^+ = 5$`, value: 0.116, units: md`\mathrm{mm}` },
      { label: md`$y$ at $y^+ = 30$`, value: 0.697, units: md`\mathrm{mm}` },
      { label: md`$\overline{v}_z$ at $y^+ = 30$`, value: 9.04, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'pr-up-sleicher',
    concept: 'universal-profile',
    difficulty: 2,
    q: md`For Sleicher's profile (9.47): (a) show that it reduces to $v_z^+ = y^+$ close to the wall; (b) evaluate it at $y^+ = 30$ and compare with the core law (9.46); (c) find its limit as $y^+ \to \infty$ and explain why it must not be used in the turbulent core.`,
    hint: md`Use $\tan^{-1}x \approx x$ for small $x$ and $\tan^{-1}x \to \pi/2$ as $x \to \infty$; keep the calculator in radians.`,
    answer: md`(a) $v_z^+ \approx y^+$; (b) 13.74 vs 14.00; (c) $\pi/(2 \times 0.088) = 17.85$ — it saturates, while the real core profile keeps growing logarithmically.`,
    solution: md`(a) For $0.088y^+ \ll 1$, $\tan^{-1}(0.088y^+) \approx 0.088y^+$, so $v_z^+ \approx \frac{1}{0.088}(0.088y^+) = y^+$ — the sublayer law.

(b) $0.088 \times 30 = 2.64$; $\tan^{-1}2.64 = 1.2088$ rad; $v_z^+ = 1.2088/0.088 = 13.74$. The core law gives $5.5 + 2.5\ln 30 = 14.00$ — 2 % apart, so the curve hands over smoothly.

(c) As $y^+ \to \infty$, $\tan^{-1} \to \pi/2$ and $v_z^+ \to \pi/(2 \times 0.088) = 17.85$. The log law exceeds this beyond $y^+ \approx 120$ ($5.5 + 2.5\ln 120 = 17.47$, rising to 22.8 at $y^+ = 1000$), so Sleicher's form is meant only for the sublayer and buffer, as Wilkes states.`,
    check: [
      { label: md`$v_z^+$ at $y^+ = 30$`, value: 13.74 },
      { label: 'limit', value: 17.85 },
    ],
  },
  {
    id: 'pr-up-findA',
    concept: 'universal-profile',
    difficulty: 1,
    q: md`In a smooth water pipe ($\nu = 1.0\times10^{-6}$ m²/s) the friction velocity is 0.0949 m/s and a Pitot tube 1.00 mm from the wall reads $\overline{v}_z = 1.60$ m/s. Taking $B = 2.5$, estimate the constant $A$ in $v_z^+ = A + B\ln y^+$. Is the reading in the turbulent core?`,
    hint: md`Convert both the distance and the velocity to wall variables first.`,
    answer: md`$y^+ = 94.9$ (core) and $A = 5.48$ — consistent with Wilkes' $A = 5.5$.`,
    solution: md`$y^+ = 0.001 \times 0.0949/10^{-6} = 94.9 > 30$ → turbulent core.
$v_z^+ = 1.60/0.0949 = 16.86$.
$A = v_z^+ - 2.5\ln y^+ = 16.86 - 2.5 \times 4.553 = 16.86 - 11.38 = 5.48$.`,
    check: [{ label: md`$A$`, value: 5.48 }],
  },

  // ---------- sublayer ----------
  {
    id: 'pr-sl-re2e4',
    concept: 'sublayer',
    difficulty: 1,
    q: md`A smooth pipe of diameter $D = 25$ mm carries a liquid at $\mathrm{Re} = 2.0\times10^4$. Using (9.60) and (9.63), find the laminar-sublayer thickness in mm for the two-piece and the three-piece models.`,
    hint: md`$\mathrm{Re}^{7/8} = \exp(0.875\ln\mathrm{Re})$.`,
    answer: md`Two-piece: $\delta = 0.251$ mm; three-piece: $\delta = 0.109$ mm.`,
    solution: md`$\mathrm{Re}^{7/8} = (2.0\times10^4)^{0.875} = 5800$.

Two-piece (9.60): $\delta/D = 58.3/5800 = 0.01005$, so $\delta = 0.01005 \times 25 = 0.251$ mm.

Three-piece (9.63): $\delta/D = 25.2/5800 = 0.004345$, so $\delta = 0.109$ mm.

Both are well below a millimetre even at this modest Re (the Blasius law is valid here since $\mathrm{Re} < 10^5$).`,
    check: [
      { label: 'δ two-piece', value: 0.251, units: md`\mathrm{mm}` },
      { label: 'δ three-piece', value: 0.109, units: md`\mathrm{mm}` },
    ],
  },
  {
    id: 'pr-sl-water',
    concept: 'sublayer',
    difficulty: 2,
    q: md`Water ($\rho = 1000$ kg/m³, $\nu = 1.0\times10^{-6}$ m²/s) flows at $\overline{v}_{zm} = 1.5$ m/s in a smooth pipe of $D = 100$ mm; Eq. (9.53) gives $f_{\mathrm F} = 0.00412$ for this Re. Find $\tau_w$, $\sqrt{\tau_w/\rho}$, the two-piece sublayer thickness $\delta$ in mm (check $\delta/D$ with Eq. 9.58) and the edge velocity $\overline{v}_{z\delta}$. Why is the Blasius law not the right choice here?`,
    hint: md`$\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2$ (definition of the Fanning friction factor, Eq. 9.51).`,
    answer: md`$\tau_w = 4.64$ Pa, $\sqrt{\tau_w/\rho} = 0.0681$ m/s, $\delta = 0.170$ mm ($\delta/D = 1.70\times10^{-3}$), $\overline{v}_{z\delta} = 0.790$ m/s; $\mathrm{Re} = 1.5\times10^5$ is beyond the Blasius range.`,
    solution: md`$\mathrm{Re} = 1.5 \times 0.1/10^{-6} = 1.5\times10^5 > 10^5$ — outside the stated range of Blasius (9.59), hence the use of (9.53).

$\tau_w = 0.5 \times 0.00412 \times 1000 \times 1.5^2 = 4.64$ Pa; $\sqrt{\tau_w/\rho} = \sqrt{4.635\times10^{-3}} = 0.0681$ m/s.

$\delta = 11.6\nu/\sqrt{\tau_w/\rho} = 11.6\times10^{-6}/0.0681 = 1.70\times10^{-4}$ m $= 0.170$ mm, so $\delta/D = 1.70\times10^{-3}$. Check with (9.58): $16.4/(\mathrm{Re}\sqrt{f_{\mathrm F}}) = 16.4/(1.5\times10^5 \times 0.0642) = 1.70\times10^{-3}$ ✓.

$\overline{v}_{z\delta} = 11.6 \times 0.0681 = 0.790$ m/s (53 % of the mean velocity).`,
    check: [
      { label: md`$\tau_w$`, value: 4.64, units: md`\mathrm{Pa}` },
      { label: md`$\sqrt{\tau_w/\rho}$`, value: 0.0681, units: md`\mathrm{m/s}` },
      { label: md`$\delta$`, value: 0.170, units: md`\mathrm{mm}` },
      { label: md`$\overline{v}_{z\delta}$`, value: 0.790, units: md`\mathrm{m/s}` },
    ],
  },
  {
    id: 'pr-sl-scaling',
    concept: 'sublayer',
    difficulty: 2,
    q: md`Within the range of the Blasius law: (a) by what factor does $\delta/D$ change when Re is doubled? (b) By what factor must Re increase to halve $\delta/D$? (c) For a fixed pipe and fluid, by what factor does $\delta$ change when the mean velocity is doubled?`,
    hint: md`$\delta/D \propto \mathrm{Re}^{-7/8}$, and for a fixed pipe and fluid $\mathrm{Re} \propto \overline{v}_{zm}$.`,
    answer: md`(a) 0.545; (b) 2.21; (c) 0.545.`,
    solution: md`(a) $2^{-7/8} = 0.545$ — the sublayer becomes 45 % thinner.

(b) $\mathrm{Re}_2/\mathrm{Re}_1 = 2^{8/7} = 2.21$.

(c) With $D$ and $\nu$ fixed, doubling $\overline{v}_{zm}$ doubles Re, and $\delta = (\delta/D)D$ changes by the same factor 0.545. Physically: faster flow → larger $\tau_w$ → larger friction velocity → smaller wall unit $\nu/\sqrt{\tau_w/\rho}$.`,
    check: [
      { label: '(a)', value: 0.545 },
      { label: '(b)', value: 2.21 },
      { label: '(c)', value: 0.545 },
    ],
  },
  {
    id: 'pr-sl-rough',
    concept: 'sublayer',
    difficulty: 2,
    q: md`The water pipe of the worked example ($D = 50$ mm, $\overline{v}_{zm} = 1.6$ m/s, $\sqrt{\tau_w/\rho} = 0.0775$ m/s, $\nu = 1.0\times10^{-6}$ m²/s) has a wall roughness $\varepsilon = 0.046$ mm. (a) Compute $\varepsilon\overline{v}_z^*/\nu$ and classify the pipe with Wilkes' regimes (9.64)–(9.66). (b) What is the largest roughness height that would still be hydraulically smooth at this flow? Compare it with the three-piece sublayer edge.`,
    hint: md`Hydraulically smooth: $0 < \varepsilon\overline{v}_z^*/\nu < 5$ (Wilkes p. 501).`,
    answer: md`(a) 3.57 → hydraulically smooth; (b) $\varepsilon_{\max} = 0.0645$ mm — exactly the three-piece sublayer thickness ($y^+ = 5$).`,
    solution: md`(a) $\varepsilon\overline{v}_z^*/\nu = 0.046\times10^{-3} \times 0.0775/10^{-6} = 3.57 < 5$ → **hydraulically smooth** (9.64): $f_{\mathrm F}$ depends on Re only.

(b) $\varepsilon_{\max} = 5\nu/\overline{v}_z^* = 5\times10^{-6}/0.0775 = 6.45\times10^{-5}$ m $= 0.0645$ mm. That is the edge of the three-piece laminar sublayer ($y^+ = 5$): a pipe is hydraulically smooth when its roughness elements stay buried inside the sublayer. At a higher flow rate the sublayer thins and the same wall may stop being smooth.`,
    check: [
      { label: md`$\varepsilon\overline{v}_z^*/\nu$`, value: 3.57 },
      { label: md`$\varepsilon_{\max}$`, value: 0.0645, units: md`\mathrm{mm}` },
    ],
  },
]

/* ===================================== QUIZ ===================================== */

export const quiz: QuizQ[] = [
  {
    id: 'q-ll-overestimates',
    concept: 'log-law',
    src: W('493'),
    difficulty: 1,
    q: md`Prandtl's hypothesis uses $\ell = ky$ (9.33) and $\tau^t_{yz} \doteq \tau_w$ (9.34). How does Wilkes characterize these two assumptions?`,
    options: [
      md`Both over-estimate the true values, but their effects on the predicted profile tend to cancel`,
      md`Both under-estimate the true values, so the log law under-predicts the velocity`,
      md`$\ell = ky$ is exact everywhere; only the constant-stress assumption is approximate`,
      md`Both are exact near the wall and remain exact at the pipe centreline`,
    ],
    answer: 0,
    explain: md`p. 493: both are over-estimates, of $\ell$ and of $\tau^t_{yz}$; fortuitously they cancel and give an excellent profile. Because $d\overline{v}_z/dy = \sqrt{\tau/\rho}/\ell$, a too-large $\tau$ raises the gradient and a too-large $\ell$ lowers it. Neither is exact far from the wall: $\tau$ falls linearly to zero at the centreline and the measured $\ell$ levels off (Eq. 9.29).`,
  },
  {
    id: 'q-ll-wall',
    concept: 'log-law',
    src: W('494'),
    difficulty: 1,
    q: md`Why can the log law (9.37) not hold very close to the wall?`,
    options: [
      md`As $y \to 0$ it predicts an ever more negative velocity and an ever larger velocity gradient`,
      md`Because the wall shear stress $\tau_w$ is zero at the wall`,
      md`Because $k$ changes from 0.4 to 2.5 near the wall`,
      md`Because the time-averaged velocity is constant inside the sublayer`,
    ],
    answer: 0,
    explain: md`$\ln y \to -\infty$ as $y \to 0$ (Wilkes p. 494), which violates no-slip; a viscous sublayer takes over. $\tau_w$ is the *largest* stress, not zero; 2.5 is $1/k$, not another value of $k$; and in the sublayer the velocity grows linearly ($v_z^+ = y^+$), it is not constant.`,
  },
  {
    id: 'q-ll-vk',
    concept: 'log-law',
    src: W('494–495', 'Example 9.2'),
    difficulty: 2,
    q: md`Von Kármán's hypothesis $\ell = -k\,(d\overline{v}_z/dy)/(d^2\overline{v}_z/dy^2)$ (Example 9.2) breaks down when:`,
    options: [
      md`$d^2\overline{v}_z/dy^2 = 0$, e.g. at the inflection points of a turbulent-jet profile`,
      md`the flow is far from any wall, because there is then no length scale`,
      md`the velocity gradient becomes infinite at the wall`,
      md`the turbulent stress is equal to $\tau_w$`,
    ],
    answer: 0,
    explain: md`$\ell$ becomes undefined where the curvature vanishes — easily the case at inflection points of jet profiles. Being far from a wall is where the hypothesis has its *advantage* (it is local); the infinite wall gradient is the boundary condition that makes $c_1 = 0$; and $\tau \doteq \tau_w$ is an assumption used in the example, not a failure.`,
  },
  {
    id: 'q-ll-doubling',
    concept: 'log-law',
    difficulty: 2,
    q: md`In the log region ($k = 0.4$), by how much does $\overline{v}_z$ increase every time the distance from the wall is **doubled**?`,
    options: [
      md`about $1.73\sqrt{\tau_w/\rho}$, whatever the starting $y$`,
      md`about $2.5\sqrt{\tau_w/\rho}$`,
      md`about $0.69\sqrt{\tau_w/\rho}$`,
      md`the velocity doubles`,
    ],
    answer: 0,
    explain: md`$\Delta\overline{v}_z = \frac{1}{k}\sqrt{\tau_w/\rho}\ln 2 = 2.5 \times 0.693 = 1.73$ friction velocities. 2.5 is the rise per factor $e$, not per factor 2; 0.69 forgets the $1/k$; and a logarithmic profile does not double when $y$ doubles.`,
  },
  {
    id: 'q-up-yplus',
    concept: 'universal-profile',
    src: W('495', 'Eq. (9.38)'),
    difficulty: 1,
    q: md`The dimensionless wall distance $y^+$ (Eq. 9.38) is defined as:`,
    options: [
      md`$y\sqrt{\tau_w/\rho}\,/\,\nu$`,
      md`$y\,\overline{v}_{zm}/\nu$, a Reynolds number based on the mean velocity`,
      md`$y/\delta$, the distance measured in sublayer thicknesses`,
      md`$y\sqrt{\tau_w/\rho}\,/\,\mu$`,
    ],
    answer: 0,
    explain: md`$y^+$ measures distance in wall units $\nu/\sqrt{\tau_w/\rho}$. A mean-velocity Reynolds number does not collapse near-wall data; $y/\delta$ would put the sublayer edge at 1 by definition; and dividing by $\mu$ instead of $\nu$ leaves units of m³/kg — not dimensionless.`,
  },
  {
    id: 'q-up-buffer',
    concept: 'universal-profile',
    src: W('497', 'Eqs. (9.44)–(9.46)'),
    difficulty: 1,
    q: md`In von Kármán's three-region profile, the **buffer region** and its law are:`,
    options: [
      md`$5 < y^+ < 30$: $v_z^+ = -3.05 + 5\ln y^+$`,
      md`$0 < y^+ < 5$: $v_z^+ = y^+$`,
      md`$11.6 < y^+ < 30$: $v_z^+ = 5.5 + 2.5\ln y^+$`,
      md`$30 < y^+ < 500$: $v_z^+ = \frac{1}{0.088}\tan^{-1}(0.088y^+)$`,
    ],
    answer: 0,
    explain: md`(9.45). $0$–$5$ is the laminar sublayer (9.44); $y^+ > 30$ is the core with $5.5 + 2.5\ln y^+$ (9.46); 11.6 is the junction of the *two-piece* model; Sleicher's arctan fits the sublayer and buffer, not the core.`,
  },
  {
    id: 'q-up-universal',
    concept: 'universal-profile',
    src: W('496'),
    difficulty: 2,
    q: md`Why is $v_z^+ = 5.5 + 2.5\ln y^+$ called the *universal* velocity profile?`,
    options: [
      md`For smooth pipes it agrees exceptionally well with measured velocities over a very wide range of Reynolds number`,
      md`It holds with the same constants for smooth and completely rough pipes`,
      md`It is valid right down to the wall, including the sublayer`,
      md`It contains no empirical constants`,
    ],
    answer: 0,
    explain: md`p. 496: one curve fits all smooth-pipe flows once velocity and distance are scaled with wall variables. Rough pipes need a different intercept ($8.5 + 2.5\ln(y/\varepsilon)$, §9.9); the law fails in the sublayer ($v_z^+ = y^+$ there); and $A = 5.5$, $B = 2.5$ are experimental constants.`,
  },
  {
    id: 'q-up-sleicher',
    concept: 'universal-profile',
    src: W('497', 'Eq. (9.47)'),
    difficulty: 2,
    q: md`Sleicher's profile $v_z^+ = \frac{1}{0.088}\tan^{-1}(0.088\,y^+)$ (Eq. 9.47) is intended for:`,
    options: [
      md`the laminar sublayer and buffer regions`,
      md`the turbulent core out to the centreline`,
      md`completely rough pipes`,
      md`laminar pipe flow below Re ≈ 2100`,
    ],
    answer: 0,
    explain: md`Wilkes: an excellent fit in the sublayer and buffer regions. For small $y^+$ it reduces to $v_z^+ = y^+$; for large $y^+$ it saturates at $\pi/(2 \times 0.088) = 17.85$, so it cannot follow the logarithmic growth of the core. It says nothing about roughness or laminar flow.`,
  },
  {
    id: 'q-sl-delta',
    concept: 'sublayer',
    src: W('499', 'Eq. (9.57)'),
    difficulty: 1,
    q: md`In the **two-piece** model the laminar-sublayer thickness is:`,
    options: [
      md`$\delta = 11.6\,\nu/\sqrt{\tau_w/\rho}$`,
      md`$\delta = 5\,\nu/\sqrt{\tau_w/\rho}$`,
      md`$\delta = 11.6\,D/\mathrm{Re}$`,
      md`$\delta = 30\,\nu/\sqrt{\tau_w/\rho}$`,
    ],
    answer: 0,
    explain: md`(9.57): the sublayer line meets the log law at $y^+ = 11.6$. $y^+ = 5$ is the edge in the *three-piece* model (giving $25.2/\mathrm{Re}^{7/8}$); $11.6D/\mathrm{Re}$ uses the mean velocity instead of the friction velocity; $y^+ = 30$ is where the turbulent core begins.`,
  },
  {
    id: 'q-sl-scaling',
    concept: 'sublayer',
    src: W('500', 'Eq. (9.60)'),
    difficulty: 2,
    q: md`Within the Blasius range, if Re increases ten-fold, $\delta/D$ changes by a factor of about:`,
    options: [md`0.13`, md`0.10`, md`0.56`, md`10`],
    answer: 0,
    explain: md`$\delta/D = 58.3/\mathrm{Re}^{7/8}$, so the factor is $10^{-7/8} = 0.133$ — "almost in direct proportion" (exactly $1/\mathrm{Re}$ would give 0.10). $0.56 = 10^{-1/4}$ is the Blasius change of $f_{\mathrm F}$; and the sublayer gets thinner, not thicker, as Re grows.`,
  },
  {
    id: 'q-sl-velocity',
    concept: 'sublayer',
    src: W('500'),
    difficulty: 2,
    q: md`Across the laminar sublayer of a smooth pipe at $\mathrm{Re} \approx 10^5$, the time-averaged velocity rises from zero to roughly:`,
    options: [
      md`about half of the centreline velocity`,
      md`about 1 % of the centreline velocity`,
      md`exactly the mean velocity`,
      md`nothing — the fluid in the sublayer is stagnant`,
    ],
    answer: 0,
    explain: md`Wilkes' conclusion 1 (p. 500): the sublayer is extremely thin, yet the velocity builds up to a significant portion of its centreline value across it. With $\overline{v}_{z\delta} = 11.6\sqrt{\tau_w/\rho}$, at $\mathrm{Re} = 10^5$ this is $\approx 0.47\,\overline{v}_{zc}$ ($\approx 55$ % of the mean). Only the fluid touching the wall is at rest.`,
  },
  {
    id: 'q-sl-threepiece',
    concept: 'sublayer',
    src: W('500', 'Eq. (9.63)'),
    difficulty: 2,
    q: md`Using the three-piece profile (sublayer edge at $y^+ = 5$) instead of the two-piece one changes the predicted $\delta/D$ to:`,
    options: [
      md`$25.2/\mathrm{Re}^{7/8}$, about 0.43 of the two-piece value`,
      md`$61.7/\mathrm{Re}^{7/8}$, slightly larger`,
      md`$58.3/\mathrm{Re}^{7/8}$, unchanged`,
      md`about twice the two-piece value, because the buffer is added to the sublayer`,
    ],
    answer: 0,
    explain: md`(9.63): $\delta$ is proportional to the $y^+$ of the edge, and $5/11.6 \approx 0.43$ ($25.2/58.3 = 0.432$). 61.7 belongs to the one-seventh power law (9.62); and in the three-piece model the buffer starts *at* the sublayer edge — it is not part of the sublayer.`,
  },
  {
    id: 'q-sl-rough',
    concept: 'sublayer',
    src: W('501', 'Eqs. (9.64)–(9.66)'),
    difficulty: 2,
    q: md`According to Wilkes (§9.9), a pipe behaves as **hydraulically smooth** when its roughness height $\varepsilon$ satisfies:`,
    options: [
      md`$\varepsilon\overline{v}_z^*/\nu < 5$, i.e. the roughness stays inside the laminar sublayer`,
      md`$\varepsilon/D < 0.05$`,
      md`$\varepsilon\overline{v}_z^*/\nu > 70$`,
      md`$\varepsilon < D/\mathrm{Re}$`,
    ],
    answer: 0,
    explain: md`(9.64): for $0 < \varepsilon\overline{v}_z^*/\nu < 5$, $f_{\mathrm F}$ depends on Re only. $5$–$70$ is the transition (9.65) and $> 70$ completely rough (9.66). A fixed $\varepsilon/D$ threshold cannot work, because whether bumps poke out of the sublayer depends on $\delta$, which shrinks as Re grows.`,
  },
]

/* ===================================== FLASHCARDS ===================================== */

export const flashcards: Flashcard[] = [
  { id: 'fc-prandtl', front: md`Prandtl hypothesis (9.33)–(9.34)?`, back: md`$\ell = ky$ (mixing length ∝ distance from the wall) and $\tau^t_{yz} \doteq \tau_w$ (constant stress near the wall). Both are over-estimates whose errors cancel → excellent log profile.`, src: W('493') },
  { id: 'fc-loglaw', front: md`Log law (9.37): form, constant, limits?`, back: md`$\overline{v}_z = \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln y + c$ with $k \doteq 0.4$. Also holds in the pipe core (flat profile); fails as $y \to 0$ ($\overline{v}_z \to -\infty$).`, src: W('494') },
  { id: 'fc-vk', front: md`Von Kármán hypothesis (Example 9.2): formula, merit, drawback?`, back: md`$\ell = -k\,\overline{v}_z'/\overline{v}_z''$. Local length scale (no wall needed) and the same log law; fails where $\overline{v}_z'' = 0$ (inflection points, jets).`, src: W('494–495', 'Example 9.2') },
  { id: 'fc-defect', front: md`Wilkes' velocity-defect law for $\tau = \tau_w r/a$?`, back: md`$\overline{v}_z = \overline{v}_{zc} + \frac{1}{k}\sqrt{\tau_w/\rho}\left[\sqrt{r/a} + \ln(1 - \sqrt{r/a})\right]$ — "more sophisticated" but less accurate than the simple log law.`, src: W('495') },
  { id: 'fc-wallvars', front: md`Friction velocity, $y^+$ and $v_z^+$?`, back: md`$\overline{v}_z^* = \sqrt{\tau_w/\rho}$; $y^+ = y\overline{v}_z^*/\nu$ (9.38); $v_z^+ = \overline{v}_z/\overline{v}_z^*$ (9.39). Fox & McDonald's: $u_*$, $y^+$, $u^+$.`, src: W('495–496') },
  { id: 'fc-upv', front: md`Universal velocity profile for smooth pipes?`, back: md`$v_z^+ = A + B\ln y^+$ with $A = 5.5$, $B = 2.5 = 1/k$ (9.41)–(9.42); sublayer $v_z^+ = y^+$ (9.43); they intersect at $y^+ \doteq 11.63$.`, src: W('496') },
  { id: 'fc-three', front: md`Von Kármán's three regions?`, back: md`$0 < y^+ < 5$: $v_z^+ = y^+$; $5 < y^+ < 30$: $v_z^+ = -3.05 + 5\ln y^+$; $y^+ > 30$: $v_z^+ = 5.5 + 2.5\ln y^+$ (9.44)–(9.46).`, src: W('497') },
  { id: 'fc-sleicher', front: md`Sleicher profile (9.47)?`, back: md`$v_z^+ = \frac{1}{0.088}\tan^{-1}(0.088y^+)$: $\approx y^+$ near the wall, fits sublayer + buffer, saturates at 17.85 (not for the core).`, src: W('497') },
  { id: 'fc-delta', front: md`Two-piece sublayer thickness and edge velocity?`, back: md`$\delta = 11.6\,\nu/\sqrt{\tau_w/\rho}$ and $\overline{v}_{z\delta} = 11.6\sqrt{\tau_w/\rho}$ (9.57).`, src: W('499') },
  { id: 'fc-deltaD', front: md`$\delta/D$ in terms of Re?`, back: md`$\delta/D = 16.4/(\mathrm{Re}\sqrt{f_{\mathrm F}})$ (9.58) → $58.3/\mathrm{Re}^{7/8}$ with Blasius (9.60); $61.7/\mathrm{Re}^{7/8}$ with the 1/7 law (9.62); $25.2/\mathrm{Re}^{7/8}$ three-piece (9.63).`, src: W('500') },
  { id: 'fc-conclusions', front: md`Wilkes' two conclusions about the sublayer?`, back: md`(1) It is *extremely* thin, yet the velocity builds up across it to a significant portion of the centreline value. (2) Its thickness decreases almost in direct proportion to Re.`, src: W('500') },
  { id: 'fc-rough', front: md`When is a pipe hydraulically smooth?`, back: md`When $\varepsilon\overline{v}_z^*/\nu < 5$ (9.64): the roughness is buried in the sublayer. $5$–$70$: transition; $> 70$: completely rough.`, src: W('501') },
]

/* ===================================== TAKEAWAYS ===================================== */

export const takeaways: string[] = [
  md`**Prandtl's hypothesis** ($\ell = ky$, $\tau^t_{yz} \doteq \tau_w$) turns the mixing-length stress (9.35) into $d\overline{v}_z/dy = \sqrt{\tau_w/\rho}\,/(ky)$ and hence the **log law** $\overline{v}_z = \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln y + c$, with $k \doteq 0.4$ (9.37).`,
  md`Both Prandtl assumptions are **over-estimates**; since $d\overline{v}_z/dy = \sqrt{\tau/\rho}/\ell$ their effects largely cancel — which is why the simple law beats the "more sophisticated" linear-stress result of p. 495.`,
  md`The log law also fits the pipe core (a flat profile) but **fails at the wall** ($\overline{v}_z \to -\infty$ as $y \to 0$). Von Kármán's local hypothesis gives the same law but fails at inflection points (jets).`,
  md`**Wall variables:** $\overline{v}_z^* = \sqrt{\tau_w/\rho}$, $y^+ = y\overline{v}_z^*/\nu$, $v_z^+ = \overline{v}_z/\overline{v}_z^*$. In them all smooth-pipe profiles collapse onto the **universal profile** $v_z^+ = 5.5 + 2.5\ln y^+$.`,
  md`Near the wall $v_z^+ = y^+$. **Two-piece** model: junction at $y^+ \doteq 11.6$. **Three-region** model: sublayer $0$–$5$, buffer $5$–$30$ ($-3.05 + 5\ln y^+$), core $> 30$. Sleicher's arctan fits sublayer + buffer only.`,
  md`**Sublayer:** $\delta = 11.6\,\nu/\overline{v}_z^*$, $\overline{v}_{z\delta} = 11.6\,\overline{v}_z^*$, and $\delta/D = 16.4/(\mathrm{Re}\sqrt{f_{\mathrm F}}) = 58.3/\mathrm{Re}^{7/8}$ (Blasius, $\mathrm{Re} < 10^5$).`,
  md`The coefficient only reflects where the sublayer edge is placed: **58.3** (two-piece, $y^+ = 11.6$), **61.7** (one-seventh law), **25.2** (three-piece, $y^+ = 5$); the exponent $7/8$ comes from Blasius.`,
  md`The sublayer is **extremely thin** (≈ 0.15 mm for water at 1.6 m/s in a 50 mm pipe), yet the velocity reaches about half its centreline value across it — and it carries well under 1 % of the flow, so the log law can be integrated over the whole pipe (§9.7).`,
  md`Roughness buried inside the sublayer ($\varepsilon\overline{v}_z^*/\nu < 5$) does not matter: the pipe is **hydraulically smooth** (§9.9). The friction-factor laws themselves are in the *Friction factor* topic.`,
  md`**Notation:** Wilkes $\overline{v}_z$, $\overline{v}_z^*$, $f_{\mathrm F}$ ↔ Fox & McDonald's $\bar u$, $u_*$, Darcy $f = 4f_{\mathrm F}$; Fox writes the log-law intercept as 5.0 (Wilkes 5.5) with the same slope 2.5.`,
]

/* ===================================== CONTENT ===================================== */

// Illustrative log law across one radius (Concept 1 visual): √(τw/ρ) = 0.05 m/s, k = 0.4, v̄z(a = 25 mm) = 1.2 m/s.
const ILL_VS = 0.05
const ILL_C = 1.2 - (ILL_VS / 0.4) * Math.log(0.025)
const LOG_ILL: [number, number][] = Array.from({ length: 241 }, (_, k) => {
  const ymm = 1e-4 * (25 / 1e-4) ** (k / 240)
  return [ymm, (ILL_VS / 0.4) * Math.log(ymm * 1e-3) + ILL_C]
})

const A_PLUS_1E5 = aPlusOf(1e5, fFanning953(1e5))

export default function Content() {
  return (
    <>
      {/* ================================ CONCEPT 1 ================================ */}
      <Concept id="log-law">
        <Step kind="intro" src={W('493', '§9.5')}>
          <Md>{md`**Where we are.** The mixing length $\ell$ and the eddy kinematic viscosity $\nu_{\mathrm T}$ were defined and measured in §9.3–9.4 (see the *Mixing length* topic). Section 9.5 asks the pay-off question: **what time-averaged velocity profile do they predict next to a wall?** The answer — the **logarithmic law** — is the backbone of turbulent pipe flow: the universal velocity profile (next concept), the friction-factor laws (§9.7) and the Prandtl–Taylor analogy (§9.13) are all built on it.

**Set-up (Wilkes p. 493).** Pipe flow with axial coordinate $z$. For the moment it is more expedient to use the distance **from the wall**, $y = a - r$, rather than $r$ as the transverse coordinate — hence the notation $\tau^t_{yz}$ for the turbulent shear stress. An overline means a time average (footnote 6, p. 494), so $\overline{v}_z$ is the time-averaged axial velocity.

**Prandtl's hypothesis — the simplest model** — makes two assumptions:

1. the mixing length is **directly proportional to the distance from the wall**, $\ell = ky$, the argument being that eddies have more freedom of motion the further they are from it;
2. the turbulent stress is **constant and equal to its wall value**, $\tau^t_{yz} \doteq \tau_w$ — strictly true only in a small interval near the wall.`}</Md>
          <Callout kind="note" title="Notation — Wilkes ↔ Fox & McDonald's (cross-reference)">
            <Md>{md`Wilkes $\overline{v}_z$ ↔ Fox $\bar u$; $\sqrt{\tau_w/\rho}$ (named the *friction velocity* $\overline{v}_z^*$ in §9.6) ↔ Fox $u_*$; pipe radius $a$ ↔ $R$; Fanning $f_{\mathrm F}$ ↔ Darcy $f = 4f_{\mathrm F}$. Both books use $y$ for the distance from the wall.`}</Md>
            <SourceChips src={FOX('294–295', '§8.4–8.5')} size="xs" />
          </Callout>
        </Step>

        <Step kind="intuition">
          <Md>{md`Picture the wall as a floor and the eddies as tumbling balls of fluid. A ball centred at height $y$ cannot be much bigger than $y$ — the wall is in the way — so the size of the eddies, and the distance $\ell$ over which they carry momentum, grows in proportion to $y$.

Close to the wall the shear stress "has nowhere to go": a momentum balance shows the total stress falls only linearly from $\tau_w$ at the wall to zero at the centreline, so in a thin layer next to the wall it is practically $\tau_w$.

Put the two together. The eddies must pass the **same** stress $\tau_w$ across every layer, but further out they are bigger — and a bigger eddy needs a *smaller* velocity difference to transport the same momentum. So $d\overline{v}_z/dy \propto 1/y$, and a gradient proportional to $1/y$ integrates to a **logarithm**.`}</Md>
          <Callout kind="tip" title="A handy way to remember the log law">
            <Md>{md`Each **doubling** of the distance from the wall adds the same velocity: $\Delta\overline{v}_z = \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln 2 \approx 1.73\sqrt{\tau_w/\rho}$. Going from 1 mm to 25 mm (25 times further out) raises the velocity by only $2.5\ln 25 \approx 8.0$ friction velocities — that is why turbulent profiles look so **flat**.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual">
          <Figure caption="Prandtl's picture (sketch, not to scale). Left: eddies grow in proportion to their distance from the wall (ℓ = ky) and spin more slowly the further out they are — they rotate with the local shear dv̄z/dy = √(τw/ρ)/(ky). Right: the resulting mean profile — a thin linear sublayer at the wall and the logarithmic law above it; the dashed red curve is the log law's own unphysical plunge towards −∞ as y → 0.">
            <EddySketch />
          </Figure>
          <FlowSteps
            steps={[
              { title: 'Mixing-length stress (9.35)', md: md`$\tau^t_{yz} = \rho\,\ell^2\,(d\overline{v}_z/dy)^2$ with $d\overline{v}_z/dy > 0$ near the wall.`, tone: 'slate' },
              { title: 'Insert ℓ = ky (9.33) and τ ≐ τw (9.34)', md: md`$\tau_w = \rho k^2y^2(d\overline{v}_z/dy)^2$ — Eq. (9.36).`, tone: 'indigo' },
              { title: 'Take the positive root', md: md`$d\overline{v}_z/dy = \sqrt{\tau_w/\rho}\,/(ky)$: the gradient falls off as $1/y$.`, tone: 'cyan' },
              { title: 'Integrate in y', md: md`$\overline{v}_z = \frac{1}{k}\sqrt{\tau_w/\rho}\,\ln y + c$ — the log law, Eq. (9.37).`, tone: 'emerald' },
            ]}
          />
          <Figure caption="The log law (9.37) across one pipe radius (illustrative: √(τw/ρ) = 0.05 m/s, k = 0.4, c chosen so that v̄z = 1.2 m/s at the centreline, a = 25 mm) against a laminar parabola with the same centreline velocity. The log profile is flat over almost the whole radius but plunges to negative values within a few micrometres of the wall — the vertical drop at y = 0.">
            <Plot
              height={280}
              x={{ label: 'distance from the wall $y$ (mm)', domain: [0, 25] }}
              y={{ label: md`$\overline{v}_z$ (m/s)`, domain: [-0.4, 1.4] }}
              series={[
                { label: 'log law (9.37)', points: LOG_ILL, color: 'var(--plot-1)', width: 2.6 },
                { label: 'laminar parabola, same centreline velocity', fn: (y) => 1.2 * (2 * (y / 25) - (y / 25) ** 2), color: 'var(--plot-7)', dash: '6 4' },
              ]}
              hlines={[{ y: 0, label: 'v̄z = 0', color: 'var(--plot-4)' }]}
            />
          </Figure>
        </Step>

        <Step kind="equations" src={W('493–495', 'Eqs. (9.33)–(9.37), (E9.2.1)')}>
          <FormulaCard id="prandtl-ml" />
          <FormulaCard id="const-stress" />
          <Callout kind="key" title="Two over-estimates that cancel (Wilkes p. 493)">
            <Md>{md`Actually (9.33) and (9.34) are **over-estimates** for both $\ell$ and $\tau^t_{yz}$; fortuitously, the two tend to cancel each other and give an **excellent** turbulent velocity profile. *Why they cancel (added here):* the profile depends only on $d\overline{v}_z/dy = \sqrt{\tau^t/\rho}\,/\,\ell$ — a too-large stress raises the predicted gradient, a too-large mixing length lowers it. The interactive demo below puts numbers on this.`}</Md>
          </Callout>
          <Md>{md`Mixing-length theory also gave the formula for the turbulent stress, in which $d\overline{v}_z/dy$ is recognized as **positive**, since the time-averaged velocity increases with distance from the wall:`}</Md>
          <FormulaCard id="ml-stress" />
          <Derivation
            title="From the mixing-length stress to the log law (Wilkes p. 494)"
            steps={[
              { md: md`$\tau^t_{yz} = \rho\,\ell^2\left(\dfrac{d\overline{v}_z}{dy}\right)^2$`, why: 'Eq. (9.35)' },
              { md: md`$\tau_w = \rho\,k^2y^2\left(\dfrac{d\overline{v}_z}{dy}\right)^2$`, why: 'substitute ℓ = ky (9.33) and τ ≐ τw (9.34) → Eq. (9.36)' },
              { md: md`$\dfrac{d\overline{v}_z}{dy} = \dfrac{1}{k\,y}\sqrt{\dfrac{\tau_w}{\rho}}$`, why: 'positive square root (gradient > 0 near the wall)' },
              { md: md`$\overline{v}_z = \dfrac{1}{k}\sqrt{\dfrac{\tau_w}{\rho}}\,\ln y + c$`, why: 'integrate; c is a constant of integration → Eq. (9.37)' },
            ]}
          />
          <FormulaCard id="tauw-k" />
          <FormulaCard id="log-law" />
          <Callout kind="note" title="What experiment says (p. 494)">
            <Md>{md`Experimentally — perhaps rather surprisingly — the log profile (9.37) **also holds in the central region of a pipe**, with $k \doteq 0.4$. Since $\ln y$ is fairly insensitive to changes in $y$, it predicts a fairly **"flat"** turbulent profile, in accordance with observation. (Wilkes' sentence cites "Eq. (9.34)" at this point; it is the log law (9.37) that does the predicting.)`}</Md>
          </Callout>
          <Callout kind="warning" title="It cannot hold right at the wall">
            <Md>{md`As $y \to 0$, $\ln y \to -\infty$: the log law gives an ever more negative velocity and an ever larger velocity gradient — impossible with no-slip. Very close to the wall a viscous **laminar sublayer** takes over (next two concepts). Do not evaluate (9.37) at $y = 0$, and never use it where $y^+ < 30$ in exam problems unless told to.`}</Md>
          </Callout>

          <h4 className="pt-2 font-display text-lg font-bold text-ink">Von Kármán's alternative (Example 9.2)</h4>
          <Md>{md`Prandtl's $\ell = ky$ needs a wall. Von Kármán instead tied the mixing length to the **local shape** of the velocity profile — the ratio of its first two derivatives, which has the dimensions of length:`}</Md>
          <FormulaCard id="vk-hyp" />
          <h4 className="pt-2 font-display text-lg font-bold text-ink">A "more realistic" stress — the velocity-defect result (p. 495)</h4>
          <Md>{md`Suppose the more realistic pipe-flow stress distribution $\tau^t_{rz} = -\tau_w(r/a)$ (linear, zero at the centreline) is used together with mixing-length theory and the von Kármán hypothesis. A double integration — with an infinite velocity gradient at the wall fixing one constant — gives the velocity in terms of the **centreline velocity** $(\overline{v}_z)_{r=0}$:`}</Md>
          <FormulaCard id="vk-defect" />
          <Callout kind="note" title="Wilkes' verdict — and a pointer slip">
            <Md>{md`"For reasons already given, this seemingly more sophisticated result is **not as accurate** as the simpler law" — the reason being the cancelling over-estimates above. (The printed text cites Eqs. (9.29) and (9.34); the derivation actually combines the mixing-length stress (9.35) with von Kármán's $\ell$, and the "simpler law" is the log law (9.37).)`}</Md>
          </Callout>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's defect law (secondary source)">
            <Md>{md`Fox & McDonald's evaluates the log law at the centreline ($y = R$, $\bar u = U$) and subtracts the general expression, obtaining $(U - \bar u)/u_* = 2.5\ln(R/y)$ (its Eq. 8.21): the velocity defect depends only on $y/R$ and **not on viscosity**. In Wilkes' notation that is $(\overline{v}_{zc} - \overline{v}_z)/\overline{v}_z^* = 2.5\ln(a/y)$ — the "log law used to the centre" curve in the demo below.`}</Md>
            <SourceChips src={FOX('295', 'Eq. 8.21')} size="xs" />
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-vonkarman" />
          <ExampleCard id="ex-two-point" />
        </Step>

        <Step kind="interactive">
          <CancellationExplorer />
        </Step>

        <Step kind="practice">
          <PracticeList concept="log-law" />
          <QuickCheck ids={['q-ll-overestimates', 'q-ll-doubling']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Prandtl: $\ell = ky$ (9.33) + $\tau^t_{yz} \doteq \tau_w$ (9.34) in $\tau^t = \rho\ell^2(d\overline{v}_z/dy)^2$ (9.35) ⇒ $d\overline{v}_z/dy = \sqrt{\tau_w/\rho}/(ky)$ ⇒ **log law** (9.37), $k \doteq 0.4$.`,
              md`Both assumptions over-estimate, but they act on the gradient in opposite directions — the cancellation makes the simple law **excellent**, better than the linear-stress defect law of p. 495.`,
              md`The log law also fits the pipe core (flat profile) but **diverges at the wall** — never apply it at $y \to 0$.`,
              md`The constant $c$ depends on the flow and on the **units of $y$**; eliminate it by differencing two points (or move to wall variables).`,
              md`Von Kármán's $\ell = -k\,\overline{v}_z'/\overline{v}_z''$ is local (no wall needed) and gives the same log law, but fails where $\overline{v}_z'' = 0$ — a classic exam contrast.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================ CONCEPT 2 ================================ */}
      <Concept id="universal-profile">
        <Step kind="intro" src={W('495–496', '§9.6')}>
          <Md>{md`The log law (9.37) still contains the awkward constant $c$, whose value changes from flow to flow (and even with the units of $y$). Section 9.6 removes it by rephrasing the law in **dimensionless wall variables**: a distance from the wall $y^+$ (9.38) and a velocity $v_z^+$ (9.39), both built from the wall shear stress and the viscosity. The quantity $\sqrt{\tau_w/\rho}$, which has the units of a velocity, is called the **friction velocity** and given the symbol $\overline{v}_z^*$.

In these variables the log law becomes $v_z^+ = A + B\ln y^+$ (9.41) with $B = 1/k$, and experiment gives $A = 5.5$, $B = 2.5$ (9.42). It is called the **universal velocity profile** because it gives exceptionally good agreement with experimental velocities over a **very wide range of Reynolds number for smooth pipes** (Wilkes points to the velocities on p. 405 of Schlichting's *Boundary Layer Theory*). Very close to the wall it is replaced by the sublayer law $v_z^+ = y^+$ (9.43), and von Kármán added a **buffer region** in between (9.44)–(9.46).`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Near a wall the flow "knows" only a few things: the stress the wall exerts ($\tau_w$), the fluid's density and viscosity ($\rho$, $\mu$) and how far away it is ($y$). From $\tau_w/\rho$ and $\nu$ you can build exactly **one velocity**, $\sqrt{\tau_w/\rho}$, and **one length**, $\nu/\sqrt{\tau_w/\rho}$ — the *wall unit*, typically a few micrometres to a few tens of micrometres in water and air pipes. Measure distance in wall units ($y^+$) and velocity in friction velocities ($v_z^+$), and the particular pipe, fluid and flow rate drop out — so data from very different pipes collapse onto one curve. (Fox & McDonald's gives the same dimensional-analysis argument, p. 294.)

Then think about *who carries the stress* at each height:

- **$y^+ \lesssim 5$** — the wall damps the eddies; viscosity carries the stress, so the profile is linear: $v_z^+ = y^+$.
- **$y^+ \gtrsim 30$** — eddies carry the stress; the log law holds.
- **in between** — both mechanisms matter: the buffer region, where the profile bends from one law to the other.`}</Md>
          <Callout kind="tip" title="Read y⁺ like a ruler">
            <Md>{md`$y^+ = 1$ means "one viscous length from the wall". The whole sublayer + buffer ($y^+ < 30$) is usually a fraction of a millimetre — the rest of the pipe is turbulent core.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('496–497', 'Fig. 9.9; Eqs. (9.44)–(9.46)')}>
          <Figure caption="Fig. 9.9 recreated — the universal velocity profile on log–log axes, as Wilkes plots it: the sublayer line v⁺ = y⁺, the log law v⁺ = 5.5 + 2.5 ln y⁺ (drawn, as in the book, to y⁺ ≈ 200) and the buffer curve v⁺ = −3.05 + 5.0 ln y⁺ from y⁺ = 5 to 30, which runs below the 11.6 corner. Hover to read values." src={W('496', 'Fig. 9.9')}>
            <Plot
              height={320}
              x={{ label: '$y^+$ (log scale)', domain: [1, 1000], log: true }}
              y={{ label: '$v_z^+$ (log scale)', domain: [1, 100], log: true }}
              series={[
                { label: '$v_z^+ = y^+$', fn: (y) => y, range: [1, Y_JUNCTION], color: 'var(--plot-5)', width: 2.4 },
                { label: md`$v_z^+ = 5.5 + 2.5\ln y^+$`, fn: vLog, range: [Y_JUNCTION, 200], color: 'var(--plot-1)', width: 2.4 },
                { label: md`$v_z^+ = -3.05 + 5.0\ln y^+$`, fn: vBuffer, range: [5, 30], color: 'var(--plot-3)', dash: '7 4', width: 2.2 },
              ]}
              marks={[{ x: Y_JUNCTION, y: Y_JUNCTION, label: 'y⁺ ≐ 11.63', color: 'var(--plot-8)' }]}
            />
          </Figure>
          <Compare
            items={[
              { title: 'Laminar sublayer · 0 < y⁺ < 5', md: md`$v_z^+ = y^+$ (9.44). Eddies are suppressed by the wall; the **viscous** stress $\mu\,d\overline{v}_z/dy$ carries $\tau_w$.`, tone: 'emerald' },
              { title: 'Buffer region · 5 < y⁺ < 30', md: md`$v_z^+ = -3.05 + 5\ln y^+$ (9.45). Viscous and turbulent stresses are **both** important; the profile bends from linear to logarithmic.`, tone: 'amber' },
              { title: 'Turbulent core · y⁺ > 30', md: md`$v_z^+ = 5.5 + 2.5\ln y^+$ (9.46). The **turbulent (Reynolds) stress** dominates; the log law holds out to (nearly) the centreline.`, tone: 'indigo' },
            ]}
          />
          <Md className="text-sm text-ink-3">{md`Which stress dominates where: Wilkes p. 503 (turbulent stress dominant over most of the cross-section, falling to zero at the wall where the viscous term takes over).`}</Md>
        </Step>

        <Step kind="equations" src={W('495–497', 'Eqs. (9.38)–(9.47)')}>
          <FormulaCard id="yplus" />
          <FormulaCard id="vplus" />
          <FormulaCard id="friction-velocity" />
          <Md>{md`With these definitions Eq. (9.37) can be rewritten as (9.40), or compactly (9.41), in which $A$ is a constant of integration and $B = 1/k$:`}</Md>
          <FormulaCard id="log-AB-dim" />
          <FormulaCard id="log-AB" />
          <Supplement title="Where A comes from (algebra added here)">
            <Derivation
              steps={[
                { md: md`$\overline{v}_z = \dfrac{1}{k}\sqrt{\dfrac{\tau_w}{\rho}}\,\ln y + c$`, why: 'log law (9.37)' },
                { md: md`$\dfrac{\overline{v}_z}{\sqrt{\tau_w/\rho}} = \dfrac{1}{k}\ln y + \dfrac{c}{\sqrt{\tau_w/\rho}}$`, why: 'divide by the friction velocity' },
                { md: md`$= \dfrac{1}{k}\ln\dfrac{y\sqrt{\tau_w/\rho}}{\nu} + \underbrace{\left[\dfrac{c}{\sqrt{\tau_w/\rho}} - \dfrac{1}{k}\ln\dfrac{\sqrt{\tau_w/\rho}}{\nu}\right]}_{A}$`, why: 'add and subtract (1/k) ln(√(τw/ρ)/ν)' },
                { md: md`$v_z^+ = A + B\ln y^+,\qquad B = 1/k$`, why: '(9.40)–(9.41): the flow-dependent c and the units of y are absorbed into A' },
              ]}
            />
            <Md>{md`The remarkable experimental fact is that this $A$ comes out the **same** (5.5) for all smooth pipes — the payoff of using wall variables.`}</Md>
          </Supplement>
          <FormulaCard id="upv" />
          <Md>{md`Of course (9.42) does not hold very close to the wall. There, integration of $\tau_{yz} = \mu\,d\overline{v}_z/dy$ in the laminar sublayer gives:`}</Md>
          <FormulaCard id="sublayer-law" />
          <Supplement title="The sublayer law in three lines (added here)">
            <Md>{md`In the sublayer the stress is viscous and, being so close to the wall, still $\approx\tau_w$:

$$
\mu\frac{d\overline{v}_z}{dy} \approx \tau_w
\;\Rightarrow\;
\overline{v}_z = \frac{\tau_w\,y}{\mu}
\;\Rightarrow\;
\frac{\overline{v}_z}{\sqrt{\tau_w/\rho}} = \frac{\rho\sqrt{\tau_w/\rho}\;y}{\mu} = \frac{y\sqrt{\tau_w/\rho}}{\nu}
$$

i.e. $v_z^+ = y^+$ (using $\tau_w = \rho\,(\sqrt{\tau_w/\rho})^2$ and $\nu = \mu/\rho$).`}</Md>
          </Supplement>
          <Md>{md`As Fig. 9.9 shows, the turbulent and laminar profiles (9.42) and (9.43) **intersect at $y^+ \doteq 11.63$**. To represent the experimental data of **Nikuradse** even better, particularly in a *buffer region* between the sublayer and the fully developed turbulent core, **von Kármán** divided the profile into three regions:`}</Md>
          <FormulaCard id="three-region" />
          <Md>{md`A profile based on a theory of **Sleicher** (discussed further in Wilkes' Problem 9.10) also gives an excellent fit of turbulent velocities in the laminar sublayer and buffer regions:`}</Md>
          <FormulaCard id="sleicher" />
          <Callout kind="exam" title="Numbers to know cold">
            <Md>{md`$k \doteq 0.4 \Leftrightarrow B = 2.5$; $A = 5.5$; two-piece junction $y^+ \doteq 11.6$ ($11.63$); three-region boundaries **5** and **30**; buffer law $-3.05 + 5\ln y^+$; Sleicher constant 0.088. On semi-log axes the core law rises $2.5\ln 10 = 5.76$ per decade of $y^+$.`}</Md>
          </Callout>
          <Callout kind="warning" title="Common slips">
            <Md>{md`Using $\ln$ vs $\log_{10}$ (the laws use the **natural** log); using the mean velocity instead of $\sqrt{\tau_w/\rho}$ in $y^+$; applying the log law inside the sublayer; and forgetting that $\tan^{-1}$ in (9.47) is in **radians**.`}</Md>
          </Callout>
          <Callout kind="note" title="Cross-reference — Fox & McDonald's §8.5 (secondary source)">
            <Md>{md`Fox writes $u^+ = \bar u/u_* = yu_*/\nu = y^+$ (Eq. 8.19), valid for $0 \le y^+ \le 5$–$7$, and fits the data for $y^+ > 30$ with $\bar u/u_* = 2.5\ln(yu_*/\nu) + 5.0$ (Eq. 8.20), noting considerable scatter in the constants. The slope **2.5 is the same** as Wilkes'; the intercept 5.0 vs 5.5 lies within that scatter (the two lines then cross the sublayer line at $y^+ \approx 11.0$ instead of 11.6). Fox plots on **semi-log** axes with Laufer's measurements (Fig. 8.9) — available as an overlay in the lab below.`}</Md>
            <SourceChips src={FOX('294–295', 'Eqs. 8.19–8.20, Fig. 8.9')} size="xs" />
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-wall-units" />
          <ExampleCard id="ex-junction" />
        </Step>

        <Step kind="interactive">
          <UniversalProfileLab />
        </Step>

        <Step kind="practice">
          <PracticeList concept="universal-profile" />
          <QuickCheck ids={['q-up-yplus', 'q-up-buffer']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Friction velocity $\overline{v}_z^* = \sqrt{\tau_w/\rho}$; wall variables $y^+ = y\overline{v}_z^*/\nu$ (9.38) and $v_z^+ = \overline{v}_z/\overline{v}_z^*$ (9.39).`,
              md`**Universal profile** (smooth pipes, wide Re range): $v_z^+ = 5.5 + 2.5\ln y^+$ (9.42), i.e. $A = 5.5$, $B = 1/k = 2.5$.`,
              md`Sublayer: $v_z^+ = y^+$ (9.43); it meets the log law at $y^+ \doteq 11.63$.`,
              md`Three-region (von Kármán): $0$–$5$ sublayer, $5$–$30$ buffer ($-3.05 + 5\ln y^+$), $> 30$ core. Sleicher's arctan fits sublayer + buffer but saturates at 17.85.`,
              md`Exam trap: always compute $y^+$ **first** to pick the right law, use natural logs, and use $\sqrt{\tau_w/\rho}$ — not the mean velocity — in the wall variables.`,
            ]}
          />
        </Step>
      </Concept>

      {/* ================================ CONCEPT 3 ================================ */}
      <Concept id="sublayer">
        <Step kind="intro" src={W('499', '§9.8')}>
          <Md>{md`The **laminar sublayer** is the thin film next to the wall in which viscosity, not eddies, transmits the shear stress. Its thickness $\delta$ matters because it controls the wall friction, heat and mass transfer (the "two-piece" picture is exactly what the Prandtl–Taylor analogy of §9.13 needs) and decides whether wall roughness matters (§9.9).

Wilkes (p. 499): the thickness of the laminar sublayer **diminishes as the Reynolds number increases**, because the more vigorous turbulent eddies approach the wall more closely. For simplicity the buffer region is ignored and a **two-piece model** — sublayer + turbulent core, Fig. 9.10 — is used. $\delta$ is then found as a function of Re by requiring the velocities of the two regions to **match at their junction**.`}</Md>
        </Step>

        <Step kind="intuition">
          <Md>{md`Think of the sublayer as a "no-eddy zone" glued to the wall. In **wall units** its thickness is fixed — $y^+ \approx 11.6$ in the two-piece picture — so in metres $\delta = 11.6\,\nu/\overline{v}_z^*$: anything that raises the wall shear stress (a faster flow) shrinks it.

For water at 1.6 m/s in a 50 mm pipe ($\mathrm{Re} = 8\times10^4$) that is about **0.15 mm** — roughly the thickness of a sheet of paper — yet across it the velocity climbs to about **half its centreline value**. Such a steep gradient right at the wall is why turbulent flows have far higher wall shear stresses than laminar ones at the same mean velocity. And because the sublayer is so thin it carries well under 1 % of the flow, which is why §9.7 may integrate the log law over the whole cross-section (Wilkes p. 497).`}</Md>
          <Callout kind="tip" title="Two numbers, two questions">
            <Md>{md`*How thick?* — $\delta = 11.6\,\nu/\overline{v}_z^*$. *How fast at its edge?* — $\overline{v}_{z\delta} = 11.6\,\overline{v}_z^*$. Same 11.6, because on the line $v_z^+ = y^+$ the corner has equal coordinates.`}</Md>
          </Callout>
        </Step>

        <Step kind="visual" src={W('499', 'Fig. 9.10')}>
          <Figure caption="Fig. 9.10 recreated — velocity profiles in the laminar sublayer and part of the turbulent core (linear axes). The straight line v⁺ = y⁺ meets v⁺ = 5.5 + 2.5 ln y⁺ at the kink y⁺ = v⁺ = 11.6; that corner defines δ and v̄zδ." src={W('499', 'Fig. 9.10')}>
            <Plot
              height={300}
              x={{ label: '$y^+$', domain: [0, 20] }}
              y={{ label: '$v_z^+$', domain: [0, 15] }}
              series={[
                { label: '$v_z^+ = y^+$', fn: (y) => y, range: [0, Y_JUNCTION], color: 'var(--plot-5)', width: 2.4 },
                { label: md`$v_z^+ = 5.5 + 2.5\ln y^+$`, fn: vLog, range: [Y_JUNCTION, 20], color: 'var(--plot-1)', width: 2.4 },
              ]}
              vlines={[{ x: Y_JUNCTION, label: 'δ ↔ y⁺ = 11.6', color: 'var(--plot-8)' }]}
              marks={[{ x: Y_JUNCTION, y: Y_JUNCTION, label: 'v̄zδ = 11.6 v̄z*', color: 'var(--plot-8)' }]}
            />
          </Figure>
          <Figure caption="Supplementary: the same sublayer drawn to scale in a smooth pipe at Re = 10⁵ (a⁺ ≈ 2370). Left: one pipe radius from the wall (bottom) to the centreline (CL); the green sliver at the wall is the entire sublayer. Right: the first 50 wall units magnified — the linear sublayer, the δ corner and the y⁺ = 5 three-piece edge.">
            <SublayerZoom aPlus={A_PLUS_1E5} />
          </Figure>
        </Step>

        <Step kind="equations" src={W('499–500', 'Eqs. (9.54)–(9.63)')}>
          <Md>{md`Start with the known velocity profiles in the two regions (Fig. 9.10):`}</Md>
          <FormulaCard id="two-piece" />
          <Md>{md`At the junction between the two regions the velocities must match:`}</Md>
          <FormulaCard id="junction" />
          <Md>{md`That is, the thickness $\delta$ of the laminar sublayer and the velocity $\overline{v}_{z\delta}$ at the sublayer/turbulent-core junction are:`}</Md>
          <FormulaCard id="delta" />
          <FormulaCard id="delta-D" />
          <Md>{md`Although $f_{\mathrm F}$ is given by Eq. (9.53), a somewhat simpler relationship — of admittedly more limited range, $\mathrm{Re} < 10^5$ — is the **Blasius law**:`}</Md>
          <FormulaCard id="blasius" />
          <FormulaCard id="delta-blasius" />
          <Supplement title="From (9.57) to (9.58) and (9.60), step by step (added here)">
            <Derivation
              steps={[
                { md: md`$\dfrac{\delta}{D} = \dfrac{11.6\,\nu}{D\sqrt{\tau_w/\rho}}$`, why: 'divide (9.57) by D' },
                { md: md`$= 11.6\,\dfrac{\mu}{\rho\overline{v}_{zm}D}\cdot\dfrac{\overline{v}_{zm}}{\sqrt{\tau_w/\rho}} = \dfrac{11.6}{\mathrm{Re}}\sqrt{\dfrac{\rho\overline{v}_{zm}^2}{\tau_w}}$`, why: 'multiply and divide by v̄zm' },
                { md: md`$\sqrt{\dfrac{\rho\overline{v}_{zm}^2}{\tau_w}} = \sqrt{\dfrac{2}{f_{\mathrm F}}}$`, why: 'definition f_F = τw/(½ρv̄zm²), Eq. (9.51)' },
                { md: md`$\dfrac{\delta}{D} = \dfrac{11.6\sqrt2}{\mathrm{Re}\sqrt{f_{\mathrm F}}} = \dfrac{16.4}{\mathrm{Re}\sqrt{f_{\mathrm F}}}$`, why: 'Eq. (9.58)' },
                { md: md`$\sqrt{f_{\mathrm F}} = \sqrt{0.0790}\,\mathrm{Re}^{-1/8} = 0.281\,\mathrm{Re}^{-1/8} \;\Rightarrow\; \dfrac{\delta}{D} = \dfrac{16.4/0.281}{\mathrm{Re}^{7/8}} = \dfrac{58.3}{\mathrm{Re}^{7/8}}$`, why: 'Blasius (9.59) → Eq. (9.60). (Wilkes introduces (9.60) "from Eqs. (9.56) and (9.57)"; the arithmetic runs through (9.58)–(9.59).)' },
              ]}
            />
          </Supplement>
          <Md>{md`For a slightly different velocity-profile equation, the **one-seventh power law** (with $\overline{v}_{zc}$ the centreline velocity), the result is only marginally different:`}</Md>
          <FormulaCard id="seventh" />
          <FormulaCard id="delta-seventh" />
          <Supplement title="Where might 61.7 come from? (our reconstruction — Wilkes does not show it)">
            <Derivation
              steps={[
                { md: md`Sublayer $\overline{v}_z = \tau_w y/\mu$; outer profile (9.61) $\overline{v}_z = \overline{v}_{zc}(y/a)^{1/7}$; equate them at $y = \delta$.`, why: 'linear sublayer matched to the 1/7 law' },
                { md: md`For the 1/7 law, $\overline{v}_{zm}/\overline{v}_{zc} = \dfrac{2}{(m+1)(m+2)} = \dfrac{49}{60}$ with $m = \tfrac17$.`, why: 'average (y/a)^{1/7} over the circular cross-section' },
                { md: md`$\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2 = 0.0395\,\mathrm{Re}^{-1/4}\rho\overline{v}_{zm}^2$`, why: 'Blasius (9.59)' },
                { md: md`$0.0395\,\mathrm{Re}^{-1/4}\,\dfrac{\mathrm{Re}}{2}\,\dfrac{\delta}{a} = \dfrac{60}{49}\left(\dfrac{\delta}{a}\right)^{1/7}$`, why: 'equate at δ, divide by v̄zm, use ρv̄zm a/μ = Re/2' },
                { md: md`$\left(\dfrac{\delta}{a}\right)^{6/7} = \dfrac{1}{0.01613\,\mathrm{Re}^{3/4}} \Rightarrow \dfrac{\delta}{a} = 123.3\,\mathrm{Re}^{-7/8},\quad \dfrac{\delta}{D} = \dfrac{61.7}{\mathrm{Re}^{7/8}}$`, why: '0.0395 × 49/60 × ½ = 0.01613; raise to the power 7/6' },
              ]}
            />
          </Supplement>
          <Callout kind="key" title="Wilkes' two conclusions (p. 500)">
            <Md>{md`Substituting representative Reynolds numbers into these equations shows that:

1. the laminar sublayer is an **extremely thin** region, across which the velocity builds up to a **significant portion of its centreline value**;
2. the thickness of the laminar sublayer **decreases almost in direct proportion** to the Reynolds number ($\delta/D \propto \mathrm{Re}^{-7/8}$, close to $\mathrm{Re}^{-1}$).`}</Md>
          </Callout>
          <Md>{md`If a **three-piece** velocity profile is considered, as in Fig. 9.9, the outer edge of the laminar sublayer occurs at $y^+ = 5$, and:`}</Md>
          <FormulaCard id="delta-three" />
          <Callout kind="warning" title="Which δ?">
            <Md>{md`$\delta$ is a **model** quantity: its value depends on where the edge is put — $y^+ = 11.6$ (two-piece, 58.3), the 1/7-law matching (61.7) or $y^+ = 5$ (three-piece, 25.2). State which model you use. Also check the range: (9.60)–(9.63) rely on Blasius, so strictly $\mathrm{Re} < 10^5$; beyond that use (9.58) with a wide-range $f_{\mathrm F}$ such as (9.53).`}</Md>
          </Callout>
          <Callout kind="note" title="Link to rough pipes (Wilkes p. 501 — details in the Friction factor topic)">
            <Md>{md`In turbulent flow, wall irregularities may or may not **project through the laminar sublayer**. Wilkes classifies pipes by $\varepsilon\overline{v}_z^*/\nu$ (roughness height in wall units): **hydraulically smooth** for $0$–$5$, where $f_{\mathrm F} = f_{\mathrm F}(\mathrm{Re})$ (9.64); **transition** for $5$–$70$ (9.65); **completely rough** above 70, where $f_{\mathrm F} = f_{\mathrm F}(\varepsilon/a)$ only (9.66). Note that the smooth limit, 5, is exactly the three-piece sublayer edge: roughness buried inside the sublayer does not affect the flow.`}</Md>
            <SourceChips src={W('501', 'Eqs. (9.64)–(9.66)')} size="xs" />
          </Callout>
        </Step>

        <Step kind="example">
          <ExampleCard id="ex-sublayer-water" />
          <ExampleCard id="ex-sublayer-scaling" />
        </Step>

        <Step kind="interactive">
          <SublayerVsRe />
          <RealPipe />
        </Step>

        <Step kind="practice">
          <PracticeList concept="sublayer" />
          <QuickCheck ids={['q-sl-delta', 'q-sl-scaling']} />
        </Step>

        <Step kind="takeaways">
          <Takeaways
            items={[
              md`Two-piece model: sublayer $v_z^+ = y^+$ meets the core law at $y^+ = 11.6$ ⇒ $\delta = 11.6\,\nu/\sqrt{\tau_w/\rho}$ and $\overline{v}_{z\delta} = 11.6\sqrt{\tau_w/\rho}$ (9.57).`,
              md`$\delta/D = 16.4/(\mathrm{Re}\sqrt{f_{\mathrm F}})$ (9.58); with Blasius $f_{\mathrm F} = 0.0790\,\mathrm{Re}^{-1/4}$ ($\mathrm{Re} < 10^5$): $\delta/D = 58.3/\mathrm{Re}^{7/8}$ (9.60).`,
              md`Alternatives: 1/7 power law → $61.7/\mathrm{Re}^{7/8}$ (9.62, marginally different); three-piece edge $y^+ = 5$ → $25.2/\mathrm{Re}^{7/8}$ (9.63, ≈ 0.43×).`,
              md`The sublayer is **extremely thin** (≈ 0.1 mm at Re ≈ 10⁵) yet carries the velocity to about half its centreline value; it thins almost as $1/\mathrm{Re}$.`,
              md`Exam traps: mixing up 11.6 (two-piece) and 5 (three-piece); using Blasius above $10^5$; forgetting $\tau_w = \tfrac12 f_{\mathrm F}\rho\overline{v}_{zm}^2$ uses the **Fanning** factor (Darcy $f = 4f_{\mathrm F}$).`,
              md`Hydraulically smooth ⇔ $\varepsilon\overline{v}_z^*/\nu < 5$: the roughness hides inside the sublayer (§9.9).`,
            ]}
          />
        </Step>
      </Concept>
    </>
  )
}
