import type { ProblemSet } from '@/lib/types'
import { md } from '@/kit'

/*
 * Fox & McDonald's, Chapter 7 end-of-chapter problems 7.20–7.37 ("Determining the Π Groups", pp. 271–272).
 * The book prints no answers for these problems: every solution below was written for this platform.
 * Notation: dimensions use the sans-serif macros of the Buckingham-Pi topic — \dimM, \dimL, \dimT (TIME, which
 * Fox writes as t) and \dimF — and temperature is written \mathsf{\Theta} (Fox writes T).
 */

const P271 = { doc: 'fox' as const, pages: '271' }

export const sets: ProblemSet[] = [
  {
    id: 'fox7b-buckingham-pi',
    topic: 'buckingham-pi',
    title: "Fox & McDonald's Ch. 7 — Problems 7.20–7.37: determining the Π groups",
    src: { doc: 'fox', pages: '271–272' },
    intro: md`Eighteen Buckingham-Pi drills from sound waves to flames and propellers: count the groups ($n - m$), pick legal repeating parameters, solve the exponent equations and check the result in the other dimension system.`,
    problems: [
      // ───────────────────────────── 7.20 ─────────────────────────────
      {
        id: 'fox7-20',
        concept: 'repeating-variables',
        difficulty: 1,
        src: { ...P271, note: 'Problem 7.20' },
        q: md`A sound wave carries a power per unit cross-sectional area $E$. Assume $E$ depends only on the wave speed $V$, the density of the medium $\rho$, the amplitude of the wave $r$ and its frequency $n$. Using dimensional analysis, find the general form of the relation between $E$ and the other variables.`,
        hint: md`Power per unit area has dimensions $\dimM\dimL^2\dimT^{-3}/\dimL^2 = \dimM\dimT^{-3}$. Five parameters and three dimensions leave two groups; take $\rho$, $V$, $r$ as repeating parameters.`,
        answer: md`Two Π groups: $\dfrac{E}{\rho V^3} = f\!\left(\dfrac{n\,r}{V}\right)$, i.e. $E = \rho V^3 f(nr/V)$.`,
        solution: md`**Step 1 – parameters.** $E,\ V,\ \rho,\ r,\ n$: five parameters ($E$ is the dependent one).

      **Steps 2–3 – dimensions** ($\dimM\dimL\dimT$: three primary dimensions).

      | | $E$ | $V$ | $\rho$ | $r$ | $n$ |
      |---|---|---|---|---|---|
      | dimensions | $\dimM\dimT^{-3}$ | $\dimL\dimT^{-1}$ | $\dimM\dimL^{-3}$ | $\dimL$ | $\dimT^{-1}$ |

      ($E$ = power/area = $\dimM\dimL^2\dimT^{-3}\div\dimL^2$.) The dimensional matrix has rank 3, so $m = 3$ and there are $5 - 3 = 2$ groups.

      **Step 4 – repeating parameters:** $\rho$, $V$, $r$ (together they contain $\dimM$, $\dimL$, $\dimT$; none is the dependent variable).

      **Step 5 – dimensional equations.** $\Pi_1 = E\,\rho^a V^b r^c$:

      $$
      \begin{aligned}
      \dimM&:\ 1 + a = 0 \;\Rightarrow\; a = -1\\
      \dimT&:\ -3 - b = 0 \;\Rightarrow\; b = -3\\
      \dimL&:\ -3a + b + c = 3 - 3 + c = 0 \;\Rightarrow\; c = 0
      \end{aligned}
      \qquad\Rightarrow\qquad \Pi_1 = \frac{E}{\rho V^3}
      $$

      $\Pi_2 = n\,\rho^a V^b r^c$: $\dimM$: $a = 0$; $\dimT$: $-1 - b = 0 \Rightarrow b = -1$; $\dimL$: $b + c = 0 \Rightarrow c = 1$, so $\Pi_2 = \dfrac{n r}{V}$.

      **Step 6 – check in $\dimF\dimL\dimT$.** $[E] = \dimF\dimL\dimT^{-1}/\dimL^2 = \dimF\dimL^{-1}\dimT^{-1}$ and $[\rho V^3] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^3\dimT^{-3} = \dimF\dimL^{-1}\dimT^{-1}$ ✓; $\Pi_2$ contains no force and $\dimL\dimT^{-1}/(\dimL\dimT^{-1})$ ✓.

      **Result**

      $$
      \frac{E}{\rho V^3} = f\!\left(\frac{n r}{V}\right)
      $$

      *Supplementary remark (not from the book):* linear acoustics gives $E = 2\pi^2\rho V n^2 r^2$, i.e. $f(\Pi_2) = 2\pi^2\,\Pi_2^{\,2}$. Dimensional analysis delivers the form; only physics or experiment fixes the function.`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
      },
      // ───────────────────────────── 7.21 ─────────────────────────────
      {
        id: 'fox7-21',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.21' },
        q: md`A belt moves continuously upward through a bath of viscous liquid and carries a liquid layer of thickness $h$ out with it. The volume flow rate $Q$ of liquid lifted is taken to depend on $\mu$, $\rho$, $g$, $h$ and the belt speed $V$. Use dimensional analysis to predict the form of the dependence of $Q$ on these variables.`,
        hint: md`Six parameters, three dimensions → three groups. With $\rho$, $V$, $h$ repeating you get one flow-rate group, one viscous group and one gravity group.`,
        answer: md`$\dfrac{Q}{V h^2} = f\!\left(\dfrac{\mu}{\rho V h},\ \dfrac{g h}{V^2}\right)$ — three Π groups.`,
        solution: md`**Step 1.** $Q,\ \mu,\ \rho,\ g,\ h,\ V$ → $n = 6$.

      **Steps 2–3** ($\dimM\dimL\dimT$, $r = 3$). Taking $Q$ as a volume flow rate as stated:

      | | $Q$ | $\mu$ | $\rho$ | $g$ | $h$ | $V$ |
      |---|---|---|---|---|---|---|
      | dimensions | $\dimL^3\dimT^{-1}$ | $\dimM\dimL^{-1}\dimT^{-1}$ | $\dimM\dimL^{-3}$ | $\dimL\dimT^{-2}$ | $\dimL$ | $\dimL\dimT^{-1}$ |

      Rank 3 → $m = 3$, so $n - m = 3$ groups.

      **Step 4.** Repeating parameters $\rho$, $V$, $h$ (not $\mu$, which should appear in one group only, and not $Q$).

      **Step 5.**

      * $\Pi_1 = Q\,\rho^a V^b h^c$: $\dimM$: $a = 0$; $\dimT$: $-1 - b = 0 \Rightarrow b = -1$; $\dimL$: $3 + b + c = 0 \Rightarrow c = -2$. $\;\Pi_1 = \dfrac{Q}{V h^2}$
      * $\Pi_2 = \mu\,\rho^a V^b h^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-1 - b = 0 \Rightarrow b = -1$; $\dimL$: $-1 + 3 - 1 + c = 0 \Rightarrow c = -1$. $\;\Pi_2 = \dfrac{\mu}{\rho V h}$
      * $\Pi_3 = g\,\rho^a V^b h^c$: $\dimM$: $a = 0$; $\dimT$: $-2 - b = 0 \Rightarrow b = -2$; $\dimL$: $1 - 2 + c = 0 \Rightarrow c = 1$. $\;\Pi_3 = \dfrac{g h}{V^2}$

      **Step 6 (FLt check).** $[\mu] = \dimF\dimT\dimL^{-2}$ and $[\rho V h] = \dimF\dimT^2\dimL^{-4}\cdot\dimL\dimT^{-1}\cdot\dimL = \dimF\dimT\dimL^{-2}$ ✓; $\Pi_1$ and $\Pi_3$ contain no force and are $\dimL\dimT$-balanced ✓.

      **Result**

      $$
      \frac{Q}{V h^2} = f\!\left(\frac{\mu}{\rho V h},\ \frac{g h}{V^2}\right)
      $$

      $\Pi_2$ is an inverse Reynolds number and $\Pi_3$ an inverse Froude number squared.

      *Assumption stated:* the belt width is not in the list. If $Q$ is meant per unit belt width ($\dimL^2\dimT^{-1}$), the first group becomes $Q/(V h)$ and the other two are unchanged.`,
        check: [{ label: 'number of Π groups', value: 3, tol: 0.01 }],
      },
      // ───────────────────────────── 7.22 ─────────────────────────────
      {
        id: 'fox7-22',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.22' },
        q: md`In a lab experiment a water tank of diameter $D$ drains, starting from level $h_0$, through a smoothly rounded hole of diameter $d$. The mass flow rate from the tank is assumed to depend on $h$, $D$, $d$, the gravitational acceleration $g$, and the fluid properties $\rho$ and $\mu$. The measurements are to be correlated in dimensionless form. (i) How many dimensionless parameters will there be? (ii) How many repeating parameters must be chosen? (iii) Find the Π parameter that contains the viscosity.`,
        hint: md`There is no velocity in the list, so build the repeating set from $\rho$, $g$ and $d$; a velocity scale $\sqrt{g d}$ then appears automatically.`,
        answer: md`(i) 4 groups; (ii) 3 repeating parameters; (iii) $\Pi_4 = \dfrac{\mu}{\rho\,g^{1/2} d^{3/2}}$ (its inverse $\rho\sqrt{g d}\,d/\mu$ is a Reynolds number). Full set: $\dfrac{\dot m}{\rho g^{1/2} d^{5/2}} = f\!\left(\dfrac{h}{d}, \dfrac{D}{d}, \dfrac{\mu}{\rho g^{1/2} d^{3/2}}\right)$.`,
        solution: md`**Step 1.** $\dot m,\ h,\ D,\ d,\ g,\ \rho,\ \mu$ → $n = 7$.

      **Steps 2–3** ($\dimM\dimL\dimT$, $r = 3$):

      | | $\dot m$ | $h,\ D,\ d$ | $g$ | $\rho$ | $\mu$ |
      |---|---|---|---|---|---|
      | dimensions | $\dimM\dimT^{-1}$ | $\dimL$ | $\dimL\dimT^{-2}$ | $\dimM\dimL^{-3}$ | $\dimM\dimL^{-1}\dimT^{-1}$ |

      The rank is 3, so **(ii) $m = 3$ repeating parameters** and **(i) $n - m = 7 - 3 = 4$ dimensionless parameters**.

      **Step 4.** Repeating parameters $\rho$, $g$, $d$ (no $\mu$; only one of the lengths).

      **Step 5.**

      * $\Pi_1 = \dot m\,\rho^a g^b d^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-1 - 2b = 0 \Rightarrow b = -\tfrac12$; $\dimL$: $-3a + b + c = 3 - \tfrac12 + c = 0 \Rightarrow c = -\tfrac52$. $\;\Pi_1 = \dfrac{\dot m}{\rho\,g^{1/2} d^{5/2}}$
      * $\Pi_2 = h/d$ and $\Pi_3 = D/d$ by inspection (length ratios).
      * $\Pi_4 = \mu\,\rho^a g^b d^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-1 - 2b = 0 \Rightarrow b = -\tfrac12$; $\dimL$: $-1 + 3 - \tfrac12 + c = 0 \Rightarrow c = -\tfrac32$.

      $$
      \text{(iii)}\qquad \Pi_4 = \frac{\mu}{\rho\,g^{1/2} d^{3/2}} = \frac{\mu}{\rho\,d\sqrt{g d}}
      $$

      **Step 6 (FLt check of $\Pi_4$).** $[\rho g^{1/2} d^{3/2}] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^{1/2}\dimT^{-1}\cdot\dimL^{3/2} = \dimF\dimT\dimL^{-2} = [\mu]$ ✓.

      **Correlation**

      $$
      \frac{\dot m}{\rho\,g^{1/2} d^{5/2}} = f\!\left(\frac{h}{d},\ \frac{D}{d},\ \frac{\mu}{\rho\,g^{1/2} d^{3/2}}\right)
      $$

      The reciprocal of $\Pi_4$, $\rho\sqrt{g d}\,d/\mu$, is a Reynolds number built on the free-fall velocity scale $\sqrt{g d}$. (Another legal repeating set, e.g. $\rho$, $g$, $h$, gives an equivalent but different-looking viscous group.)`,
        check: [
          { label: '(i) number of Π groups', value: 4, tol: 0.01 },
          { label: '(ii) number of repeating parameters', value: 3, tol: 0.01 },
          { label: md`(iii) exponent of $d$ in the viscous Π (with $\mu^{1}$, repeating $\rho, g, d$)`, value: -1.5, tol: 0.01 },
        ],
      },
      // ───────────────────────────── 7.23 ─────────────────────────────
      {
        id: 'fox7-23',
        concept: 'dimensional-matrix',
        difficulty: 3,
        src: { ...P271, note: 'Problem 7.23' },
        q: md`Water tanks on the roofs of tall buildings are often cylindrical. With the tank full, the weight of the water deflects the tank bottom by an amount $\delta$, which depends on the tank diameter $D$, the water height $h$, the bottom thickness $d$, the specific weight of water $\gamma$ and the elastic modulus $E$ of the tank material. Express the functional relationship among these quantities in dimensionless groups.`,
        hint: md`Write $\gamma$ and $E$ in $\dimM\dimL\dimT$ and look at the rows of the dimensional matrix: $\dimM$ and $\dimT$ only ever appear together. What is the rank?`,
        answer: md`Rank 2, so only 2 repeating parameters and **4** groups: $\dfrac{\delta}{D} = f\!\left(\dfrac{h}{D},\ \dfrac{d}{D},\ \dfrac{\gamma D}{E}\right)$.`,
        solution: md`**Step 1.** $\delta,\ D,\ h,\ d,\ \gamma,\ E$ → $n = 6$.

      **Steps 2–3.** $[\gamma] = \dimF\dimL^{-3} = \dimM\dimL^{-2}\dimT^{-2}$ and $[E] = \dimF\dimL^{-2} = \dimM\dimL^{-1}\dimT^{-2}$; the four lengths are $\dimL$. Dimensional matrix in $\dimM\dimL\dimT$:

      | | $\delta$ | $D$ | $h$ | $d$ | $\gamma$ | $E$ |
      |---|---|---|---|---|---|---|
      | $\dimM$ | 0 | 0 | 0 | 0 | 1 | 1 |
      | $\dimL$ | 1 | 1 | 1 | 1 | −2 | −1 |
      | $\dimT$ | 0 | 0 | 0 | 0 | −2 | −2 |

      The $\dimT$ row is exactly $-2\times$ the $\dimM$ row, so every $3\times3$ determinant vanishes: **rank = 2** although $r = 3$ dimensions appear. (In $\dimF\dimL\dimT$ this is obvious: only $\dimF$ and $\dimL$ occur.) Hence $m = 2$ and $n - m = 6 - 2 = 4$ groups — the same situation as Example 7.3, where $m \ne r$.

      **Step 4.** Repeating parameters $D$ and $E$ (they contain $\dimF$ and $\dimL$; the dependent $\delta$ is excluded).

      **Step 5.**

      * $\Pi_1 = \delta/D$, $\;\Pi_2 = h/D$, $\;\Pi_3 = d/D$ (lengths, by inspection).
      * $\Pi_4 = \gamma\,D^a E^b$ in $\dimF\dimL$: $\dimF$: $1 + b = 0 \Rightarrow b = -1$; $\dimL$: $-3 + a + 2 = 0 \Rightarrow a = 1$. $\;\Pi_4 = \dfrac{\gamma D}{E}$

      **Step 6 (MLt check).** $[\gamma D] = \dimM\dimL^{-2}\dimT^{-2}\cdot\dimL = \dimM\dimL^{-1}\dimT^{-2} = [E]$ ✓.

      **Result**

      $$
      \frac{\delta}{D} = f\!\left(\frac{h}{D},\ \frac{d}{D},\ \frac{\gamma D}{E}\right)
      $$

      Groups can be recombined: $\Pi_4\Pi_2 = \gamma h/E$ (bottom pressure divided by stiffness) is an equally valid fourth group.`,
        check: [
          { label: 'rank of the dimensional matrix (= repeating parameters)', value: 2, tol: 0.01 },
          { label: 'number of Π groups', value: 4, tol: 0.01 },
        ],
      },
      // ───────────────────────────── 7.24 ─────────────────────────────
      {
        id: 'fox7-24',
        concept: 'repeating-variables',
        difficulty: 1,
        src: { ...P271, note: 'Problem 7.24' },
        q: md`In sprays and fuel injectors a liquid jet breaks up into small droplets. The droplet diameter $d$ is believed to depend on the liquid's density $\rho$, viscosity $\mu$ and surface tension $\sigma$, and on the jet speed $V$ and jet diameter $D$. How many dimensionless ratios characterize this process? Find them.`,
        hint: md`$[\sigma] = \dimF\dimL^{-1} = \dimM\dimT^{-2}$. Use $\rho$, $V$, $D$ as repeating parameters.`,
        answer: md`Three ratios: $\dfrac{d}{D} = f\!\left(\dfrac{\rho V D}{\mu},\ \dfrac{\rho V^2 D}{\sigma}\right) = f(\Rey,\ \We)$.`,
        solution: md`**Step 1.** $d,\ \rho,\ \mu,\ \sigma,\ V,\ D$ → $n = 6$.

      **Steps 2–3.** $[d] = [D] = \dimL$, $[\rho] = \dimM\dimL^{-3}$, $[\mu] = \dimM\dimL^{-1}\dimT^{-1}$, $[\sigma] = \dimM\dimT^{-2}$, $[V] = \dimL\dimT^{-1}$. Rank 3 → $m = 3$, so **$6 - 3 = 3$ dimensionless ratios**.

      **Step 4.** Repeating $\rho$, $V$, $D$.

      **Step 5.**

      * $\Pi_1 = d/D$ by inspection.
      * $\Pi_2 = \mu\,\rho^a V^b D^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-1 - b = 0 \Rightarrow b = -1$; $\dimL$: $-1 + 3 - 1 + c = 0 \Rightarrow c = -1$. $\;\Pi_2 = \dfrac{\mu}{\rho V D} = \dfrac{1}{\Rey}$
      * $\Pi_3 = \sigma\,\rho^a V^b D^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-2 - b = 0 \Rightarrow b = -2$; $\dimL$: $3 - 2 + c = 0 \Rightarrow c = -1$. $\;\Pi_3 = \dfrac{\sigma}{\rho V^2 D} = \dfrac{1}{\We}$

      **Step 6 (FLt).** $[\rho V^2 D] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^2\dimT^{-2}\cdot\dimL = \dimF\dimL^{-1} = [\sigma]$ ✓.

      **Result**

      $$
      \frac{d}{D} = f\!\left(\frac{\rho V D}{\mu},\ \frac{\rho V^2 D}{\sigma}\right)
      $$

      Droplet size is governed by a Reynolds number (inertia/viscous) and a Weber number (inertia/surface tension).`,
        check: [{ label: 'number of dimensionless ratios', value: 3, tol: 0.01 }],
      },
      // ───────────────────────────── 7.25 ─────────────────────────────
      {
        id: 'fox7-25',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.25' },
        q: md`The diameter $d$ of the dots produced by an ink-jet printer depends on the ink's viscosity $\mu$, density $\rho$ and surface tension $\sigma$, on the nozzle diameter $D$, on the distance $L$ from the nozzle to the paper, and on the jet velocity $V$. Find the Π parameters that characterize the behaviour of the ink jet.`,
        hint: md`Same physics as Problem 7.24 plus one extra length $L$ — so one extra group.`,
        answer: md`Four groups: $\dfrac{d}{D} = f\!\left(\dfrac{L}{D},\ \dfrac{\rho V D}{\mu},\ \dfrac{\rho V^2 D}{\sigma}\right)$.`,
        solution: md`**Step 1.** $d,\ \mu,\ \rho,\ \sigma,\ D,\ L,\ V$ → $n = 7$.

      **Steps 2–3.** Lengths $d, D, L$: $\dimL$; $\mu$: $\dimM\dimL^{-1}\dimT^{-1}$; $\rho$: $\dimM\dimL^{-3}$; $\sigma$: $\dimM\dimT^{-2}$; $V$: $\dimL\dimT^{-1}$. Rank 3 → $m = 3$ → $7 - 3 = 4$ groups.

      **Step 4.** Repeating $\rho$, $V$, $D$ (never $\mu$; the dependent $d$ excluded; $L$ would duplicate $D$'s dimension).

      **Step 5.**

      * $\Pi_1 = d/D$, $\;\Pi_2 = L/D$ (by inspection).
      * $\Pi_3 = \mu\,\rho^a V^b D^c$: $a = -1$ ($\dimM$), $b = -1$ ($\dimT$), $c = -1$ ($\dimL$: $-1 + 3 - 1 + c = 0$). $\;\Pi_3 = \dfrac{\mu}{\rho V D}$
      * $\Pi_4 = \sigma\,\rho^a V^b D^c$: $a = -1$, $b = -2$, $c = -1$ ($\dimL$: $3 - 2 + c = 0$). $\;\Pi_4 = \dfrac{\sigma}{\rho V^2 D}$

      **Step 6.** As in Problem 7.24, $[\rho V D] = \dimF\dimT\dimL^{-2} = [\mu]$ and $[\rho V^2 D] = \dimF\dimL^{-1} = [\sigma]$ ✓.

      **Result** (inverting $\Pi_3$, $\Pi_4$ to the familiar forms)

      $$
      \frac{d}{D} = f\!\left(\frac{L}{D},\ \frac{\rho V D}{\mu},\ \frac{\rho V^2 D}{\sigma}\right) = f\!\left(\frac{L}{D},\ \Rey,\ \We\right)
      $$`,
        check: [{ label: 'number of Π groups', value: 4, tol: 0.01 }],
      },
      // ───────────────────────────── 7.26 ─────────────────────────────
      {
        id: 'fox7-26',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.26' },
        q: md`Shipping boxes slide down an incline on a thin layer of air that is blown through many pinholes in the incline's surface. Their terminal speed $V$ depends on the box mass $m$ and base area $A$, gravity $g$, the incline angle $\theta$, the air viscosity $\mu$ and the air-layer thickness $\delta$. Find the Π parameters that characterize this phenomenon.`,
        hint: md`$\theta$ is already dimensionless — it is a Π by itself. $A$ ($\dimL^2$) and $\delta$ ($\dimL$) may not both be repeating, because one dimension is a power of the other. Try $m$, $g$, $\delta$.`,
        answer: md`Four groups: $\dfrac{V}{\sqrt{g\delta}} = f\!\left(\dfrac{A}{\delta^2},\ \theta,\ \dfrac{\mu\,\delta^{3/2}}{m\,g^{1/2}}\right)$; equivalently $\dfrac{\mu V A}{m g \delta} = \phi\!\left(\dfrac{A}{\delta^2}, \theta, \dfrac{\mu\,\delta^{3/2}}{m\,g^{1/2}}\right)$.`,
        solution: md`**Step 1.** $V,\ m,\ A,\ g,\ \theta,\ \mu,\ \delta$ → $n = 7$.

      **Steps 2–3.**

      | | $V$ | $m$ | $A$ | $g$ | $\theta$ | $\mu$ | $\delta$ |
      |---|---|---|---|---|---|---|---|
      | dimensions | $\dimL\dimT^{-1}$ | $\dimM$ | $\dimL^2$ | $\dimL\dimT^{-2}$ | 1 | $\dimM\dimL^{-1}\dimT^{-1}$ | $\dimL$ |

      Rank 3 → $m_{\text{rep}} = 3$, so $7 - 3 = 4$ groups.

      **Step 4.** Repeating $m$, $g$, $\delta$. Not $\mu$ (viscosity in one group only), not $V$ (dependent), and not both $A$ and $\delta$ (since $[A] = [\delta]^2$).

      **Step 5.**

      * $\Pi_1 = V\,m^a g^b \delta^c$: $\dimM$: $a = 0$; $\dimT$: $-1 - 2b = 0 \Rightarrow b = -\tfrac12$; $\dimL$: $1 - \tfrac12 + c = 0 \Rightarrow c = -\tfrac12$. $\;\Pi_1 = \dfrac{V}{\sqrt{g\delta}}$
      * $\Pi_2 = A/\delta^2$ and $\Pi_3 = \theta$ (by inspection).
      * $\Pi_4 = \mu\,m^a g^b \delta^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-1 - 2b = 0 \Rightarrow b = -\tfrac12$; $\dimL$: $-1 - \tfrac12 + c = 0 \Rightarrow c = \tfrac32$. $\;\Pi_4 = \dfrac{\mu\,\delta^{3/2}}{m\,g^{1/2}}$

      **Step 6 (FLt check of $\Pi_4$).** $[m g^{1/2}] = \dimF\dimT^2\dimL^{-1}\cdot\dimL^{1/2}\dimT^{-1} = \dimF\dimT\dimL^{-1/2}$ and $[\mu\delta^{3/2}] = \dimF\dimT\dimL^{-2}\cdot\dimL^{3/2} = \dimF\dimT\dimL^{-1/2}$ ✓.

      **Result**

      $$
      \frac{V}{\sqrt{g\delta}} = f\!\left(\frac{A}{\delta^2},\ \theta,\ \frac{\mu\,\delta^{3/2}}{m\,g^{1/2}}\right)
      $$

      **A more physical set.** The product $\Pi_1\Pi_2\Pi_4 = \dfrac{\mu V A}{m g \delta}$ is also dimensionless and may replace $\Pi_1$. *Supplementary check (not from the book):* if the air film has a linear (Couette) velocity profile, the shear force $\mu V A/\delta$ balances the weight component $m g\sin\theta$, giving $\dfrac{\mu V A}{m g \delta} = \sin\theta$ — exactly one function of the groups found.`,
        check: [{ label: 'number of Π groups', value: 4, tol: 0.01 }],
      },
      // ───────────────────────────── 7.27 ─────────────────────────────
      {
        id: 'fox7-27',
        concept: 'repeating-variables',
        difficulty: 1,
        src: { ...P271, note: 'Problem 7.27' },
        q: md`The length $w$ of the wake behind an airfoil depends on the flow speed $V$, the chord length $L$, the thickness $t$, and the fluid's density $\rho$ and viscosity $\mu$. Find the dimensionless parameters that characterize the phenomenon.`,
        hint: md`Six parameters, three dimensions. Two of the groups are length ratios; the third must contain $\mu$.`,
        answer: md`Three groups: $\dfrac{w}{L} = f\!\left(\dfrac{t}{L},\ \dfrac{\rho V L}{\mu}\right)$.`,
        solution: md`**Step 1.** $w,\ V,\ L,\ t,\ \rho,\ \mu$ → $n = 6$ (here $t$ is a thickness, not time).

      **Steps 2–3.** $w, L, t$: $\dimL$; $V$: $\dimL\dimT^{-1}$; $\rho$: $\dimM\dimL^{-3}$; $\mu$: $\dimM\dimL^{-1}\dimT^{-1}$. Rank 3 → $m = 3$ → $6 - 3 = 3$ groups.

      **Step 4.** Repeating $\rho$, $V$, $L$.

      **Step 5.**

      * $\Pi_1 = w/L$, $\;\Pi_2 = t/L$ (by inspection).
      * $\Pi_3 = \mu\,\rho^a V^b L^c$: $\dimM$: $a = -1$; $\dimT$: $b = -1$; $\dimL$: $-1 + 3 - 1 + c = 0 \Rightarrow c = -1$. $\;\Pi_3 = \dfrac{\mu}{\rho V L}$

      **Step 6.** $[\rho V L] = \dimF\dimT^2\dimL^{-4}\cdot\dimL\dimT^{-1}\cdot\dimL = \dimF\dimT\dimL^{-2} = [\mu]$ ✓.

      **Result**

      $$
      \frac{w}{L} = f\!\left(\frac{t}{L},\ \frac{\rho V L}{\mu}\right)
      $$

      The relative wake length depends on the thickness ratio and the chord Reynolds number.`,
        check: [{ label: 'number of Π groups', value: 3, tol: 0.01 }],
      },
      // ───────────────────────────── 7.28 ─────────────────────────────
      {
        id: 'fox7-28',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.28' },
        q: md`A washing-machine agitator is being designed. Its required power $\mathscr{P}$ is to be correlated with the amount of water used, indicated by the water depth $H$. The power also depends on the agitator diameter $D$ and height $h$, its maximum angular velocity $\omega_{\max}$, the oscillation frequency $f$, and the water's density $\rho$ and viscosity $\mu$. Determine the dimensionless parameters that characterize the problem.`,
        hint: md`$\omega_{\max}$ and $f$ both have dimensions $\dimT^{-1}$, so only one may be repeating — and their ratio is a group by inspection. Use $\rho$, $\omega_{\max}$, $D$.`,
        answer: md`Five groups: $\dfrac{\mathscr{P}}{\rho\,\omega_{\max}^3 D^5} = f_1\!\left(\dfrac{H}{D},\ \dfrac{h}{D},\ \dfrac{f}{\omega_{\max}},\ \dfrac{\rho\,\omega_{\max} D^2}{\mu}\right)$.`,
        solution: md`**Step 1.** $\mathscr{P},\ H,\ D,\ h,\ \omega_{\max},\ f,\ \rho,\ \mu$ → $n = 8$.

      **Steps 2–3.** $[\mathscr{P}] = \dimM\dimL^2\dimT^{-3}$; $H, D, h$: $\dimL$; $\omega_{\max}, f$: $\dimT^{-1}$; $\rho$: $\dimM\dimL^{-3}$; $\mu$: $\dimM\dimL^{-1}\dimT^{-1}$. Rank 3 → $m = 3$ → $8 - 3 = 5$ groups.

      **Step 4.** Repeating $\rho$, $\omega_{\max}$, $D$. ($f$ and $\omega_{\max}$ have identical dimensions, so they cannot both be repeating.)

      **Step 5.**

      * $\Pi_1 = \mathscr{P}\,\rho^a\omega_{\max}^b D^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-3 - b = 0 \Rightarrow b = -3$; $\dimL$: $2 + 3 + c = 0 \Rightarrow c = -5$. $\;\Pi_1 = \dfrac{\mathscr{P}}{\rho\,\omega_{\max}^3 D^5}$
      * $\Pi_2 = H/D$, $\;\Pi_3 = h/D$, $\;\Pi_4 = f/\omega_{\max}$ (by inspection).
      * $\Pi_5 = \mu\,\rho^a\omega_{\max}^b D^c$: $a = -1$; $\dimT$: $-1 - b = 0 \Rightarrow b = -1$; $\dimL$: $-1 + 3 + c = 0 \Rightarrow c = -2$. $\;\Pi_5 = \dfrac{\mu}{\rho\,\omega_{\max} D^2}$

      **Step 6 (FLt check of $\Pi_1$).** $[\rho\,\omega^3 D^5] = \dimF\dimT^2\dimL^{-4}\cdot\dimT^{-3}\cdot\dimL^5 = \dimF\dimL\dimT^{-1} = [\mathscr{P}]$ ✓.

      **Result**

      $$
      \frac{\mathscr{P}}{\rho\,\omega_{\max}^3 D^5} = f_1\!\left(\frac{H}{D},\ \frac{h}{D},\ \frac{f}{\omega_{\max}},\ \frac{\rho\,\omega_{\max} D^2}{\mu}\right)
      $$

      $\Pi_1$ is a power coefficient, and $\rho\,\omega_{\max}D^2/\mu$ is a Reynolds number with tip-speed scale $\omega_{\max}D$.`,
        check: [{ label: 'number of Π groups', value: 5, tol: 0.01 }],
      },
      // ───────────────────────────── 7.29 ─────────────────────────────
      {
        id: 'fox7-29',
        concept: 'dimensional-matrix',
        difficulty: 3,
        src: { ...P271, note: 'Problem 7.29' },
        q: md`Choked-flow nozzles are commonly used to meter gas flow in piping systems. The gas mass flow rate is thought to depend on the nozzle area $A$, the pressure $p$ and temperature $T$ upstream of the meter, and the gas constant $R$. How many independent Π parameters can be formed? State the functional relationship for the mass flow rate in terms of the dimensionless parameters.`,
        hint: md`Temperature is a fourth primary dimension $\mathsf{\Theta}$; $[R] = \dimL^2\dimT^{-2}\mathsf{\Theta}^{-1}$. Five parameters, rank 4.`,
        answer: md`One Π parameter, which must be a constant: $\dfrac{\dot m\sqrt{R T}}{p A} = C$, i.e. $\dot m = C\,\dfrac{p A}{\sqrt{R T}}$.`,
        solution: md`**Step 1.** $\dot m,\ A,\ p,\ T,\ R$ → $n = 5$.

      **Steps 2–3.** Primary dimensions $\dimM$, $\dimL$, $\dimT$ (time) and $\mathsf{\Theta}$ (temperature) — $r = 4$.

      | | $\dot m$ | $A$ | $p$ | $T$ | $R$ |
      |---|---|---|---|---|---|
      | $\dimM$ | 1 | 0 | 1 | 0 | 0 |
      | $\dimL$ | 0 | 2 | −1 | 0 | 2 |
      | $\dimT$ | −1 | 0 | −2 | 0 | −2 |
      | $\mathsf{\Theta}$ | 0 | 0 | 0 | 1 | −1 |

      The columns $A, p, T, R$ give a non-zero $4\times4$ determinant, so the rank is 4: $m = 4$ and **$n - m = 5 - 4 = 1$ independent Π**.

      **Step 4.** Repeating $A$, $p$, $T$, $R$.

      **Step 5.** $\Pi_1 = \dot m\,A^a p^b T^c R^d$:

      $$
      \begin{aligned}
      \dimM&:\ 1 + b = 0 \;\Rightarrow\; b = -1\\
      \dimT&:\ -1 - 2b - 2d = 0 \;\Rightarrow\; d = \tfrac12\\
      \mathsf{\Theta}&:\ c - d = 0 \;\Rightarrow\; c = \tfrac12\\
      \dimL&:\ 2a - b + 2d = 0 \;\Rightarrow\; 2a + 1 + 1 = 0 \;\Rightarrow\; a = -1
      \end{aligned}
      \qquad\Rightarrow\qquad \Pi_1 = \frac{\dot m\sqrt{R T}}{p A}
      $$

      **Step 6.** $[\dot m\sqrt{RT}] = \dimM\dimT^{-1}\cdot\dimL\dimT^{-1} = \dimM\dimL\dimT^{-2}$ and $[pA] = \dimM\dimL^{-1}\dimT^{-2}\cdot\dimL^2 = \dimM\dimL\dimT^{-2}$ ✓ (both are a force, $\dimF$).

      **Result.** With a single group, $f(\Pi_1) = 0$ means $\Pi_1$ is a constant:

      $$
      \dot m = C\,\frac{p A}{\sqrt{R T}}
      $$

      The constant $C$ must come from experiment (calibration of the meter).

      *Supplementary remark (not from the book):* ideal compressible-flow theory for choked flow gives $C = \sqrt{k}\,\left(\tfrac{2}{k+1}\right)^{(k+1)/[2(k-1)]}$ with $p$, $T$ the stagnation values; for air ($k = 1.4$) $C \approx 0.685$. The specific-heat ratio $k$ is itself dimensionless, which is why the parameter list above could omit it.`,
        check: [{ label: 'number of independent Π parameters', value: 1, tol: 0.01 }],
      },
      // ───────────────────────────── 7.30 ─────────────────────────────
      {
        id: 'fox7-30',
        concept: 'repeating-variables',
        difficulty: 3,
        src: { ...P271, note: 'Problem 7.30' },
        q: md`A flywheel with moment of inertia $I$ is spun up from rest. The time $t$ it takes to reach angular velocity $\omega$ depends on the applied torque $T$ and on the properties of the flywheel bearing: oil viscosity $\mu$, gap $\delta$, diameter $D$ and length $L$. Find the Π parameters that characterize this phenomenon.`,
        hint: md`Here $T$ is a torque, $[T] = \dimM\dimL^2\dimT^{-2}$, and $[I] = \dimM\dimL^2$. Choose $D$, $\omega$, $T$ as repeating parameters.`,
        answer: md`Five groups: $\omega t = f\!\left(\dfrac{I\omega^2}{T},\ \dfrac{\mu\,\omega D^3}{T},\ \dfrac{\delta}{D},\ \dfrac{L}{D}\right)$.`,
        solution: md`**Step 1.** $t,\ I,\ \omega,\ T,\ \mu,\ \delta,\ D,\ L$ → $n = 8$.

      **Steps 2–3.**

      | | $t$ | $I$ | $\omega$ | $T$ (torque) | $\mu$ | $\delta, D, L$ |
      |---|---|---|---|---|---|---|
      | dimensions | $\dimT$ | $\dimM\dimL^2$ | $\dimT^{-1}$ | $\dimM\dimL^2\dimT^{-2}$ | $\dimM\dimL^{-1}\dimT^{-1}$ | $\dimL$ |

      Rank 3 → $m = 3$ → $8 - 3 = 5$ groups.

      **Step 4.** Repeating $D$, $\omega$, $T$ (they contain $\dimM$, $\dimL$, $\dimT$; $\mu$ and the dependent $t$ are excluded).

      **Step 5.**

      * $\Pi_1 = t\,D^a\omega^b T^c$: $\dimM$: $c = 0$; $\dimL$: $a + 2c = 0 \Rightarrow a = 0$; $\dimT$: $1 - b - 2c = 0 \Rightarrow b = 1$. $\;\Pi_1 = \omega t$
      * $\Pi_2 = I\,D^a\omega^b T^c$: $\dimM$: $1 + c = 0 \Rightarrow c = -1$; $\dimL$: $2 + a - 2 = 0 \Rightarrow a = 0$; $\dimT$: $-b + 2 = 0 \Rightarrow b = 2$. $\;\Pi_2 = \dfrac{I\omega^2}{T}$
      * $\Pi_3 = \mu\,D^a\omega^b T^c$: $\dimM$: $c = -1$; $\dimT$: $-1 - b + 2 = 0 \Rightarrow b = 1$; $\dimL$: $-1 + a - 2 = 0 \Rightarrow a = 3$. $\;\Pi_3 = \dfrac{\mu\,\omega D^3}{T}$
      * $\Pi_4 = \delta/D$, $\;\Pi_5 = L/D$ (by inspection).

      **Step 6 (FLt).** $[T] = \dimF\dimL$, $[I] = \dimF\dimT^2\dimL$: $[I\omega^2] = \dimF\dimL$ ✓; $[\mu\,\omega D^3] = \dimF\dimT\dimL^{-2}\cdot\dimT^{-1}\cdot\dimL^3 = \dimF\dimL$ ✓.

      **Result**

      $$
      \omega t = f\!\left(\frac{I\omega^2}{T},\ \frac{\mu\,\omega D^3}{T},\ \frac{\delta}{D},\ \frac{L}{D}\right)
      $$

      *Supplementary check (not from the book):* a thin-film (Petroff) bearing gives a friction torque $k\omega$ with $k = \pi\mu D^3 L/(4\delta)$. Solving $I\,d\omega/dt = T - k\omega$ from rest gives $\omega t = \Pi_2\,\dfrac{1}{X}\ln\dfrac{1}{1 - X}$ with $X = \dfrac{k\omega}{T} = \dfrac{\pi}{4}\,\dfrac{\Pi_3\,\Pi_5}{\Pi_4}$, so the answer depends only on the groups found above.`,
        check: [{ label: 'number of Π groups', value: 5, tol: 0.01 }],
      },
      // ───────────────────────────── 7.31 ─────────────────────────────
      {
        id: 'fox7-31',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.31' },
        q: md`A large pressurized tank of liquid drains through a smoothly contoured nozzle of area $A$. The mass flow rate is thought to depend on $A$, the liquid density $\rho$, the height $h$ of the liquid surface above the nozzle, the tank gage pressure $\Delta p$ and the gravitational acceleration $g$. How many independent Π parameters can be formed? Find them, and state the functional relationship for the mass flow rate in terms of them.`,
        hint: md`Use $\rho$, $g$, $h$ as repeating parameters; $A$ gives a group by inspection, $A/h^2$.`,
        answer: md`Three: $\dfrac{\dot m}{\rho\,g^{1/2} h^{5/2}} = f\!\left(\dfrac{A}{h^2},\ \dfrac{\Delta p}{\rho g h}\right)$, or equivalently $\dfrac{\dot m}{\rho A\sqrt{g h}} = \phi\!\left(\dfrac{A}{h^2},\ \dfrac{\Delta p}{\rho g h}\right)$.`,
        solution: md`**Step 1.** $\dot m,\ A,\ \rho,\ h,\ \Delta p,\ g$ → $n = 6$.

      **Steps 2–3.** $[\dot m] = \dimM\dimT^{-1}$, $[A] = \dimL^2$, $[\rho] = \dimM\dimL^{-3}$, $[h] = \dimL$, $[\Delta p] = \dimM\dimL^{-1}\dimT^{-2}$, $[g] = \dimL\dimT^{-2}$. Rank 3 → $m = 3$ → **$6 - 3 = 3$ independent Π parameters**.

      **Step 4.** Repeating $\rho$, $g$, $h$ (not $A$ together with $h$, since $[A] = [h]^2$).

      **Step 5.**

      * $\Pi_1 = \dot m\,\rho^a g^b h^c$: $a = -1$ ($\dimM$), $b = -\tfrac12$ ($\dimT$: $-1 - 2b = 0$), $c = -\tfrac52$ ($\dimL$: $3 - \tfrac12 + c = 0$). $\;\Pi_1 = \dfrac{\dot m}{\rho\,g^{1/2} h^{5/2}}$
      * $\Pi_2 = A/h^2$ (by inspection).
      * $\Pi_3 = \Delta p\,\rho^a g^b h^c$: $\dimM$: $a = -1$; $\dimT$: $-2 - 2b = 0 \Rightarrow b = -1$; $\dimL$: $-1 + 3 - 1 + c = 0 \Rightarrow c = -1$. $\;\Pi_3 = \dfrac{\Delta p}{\rho g h}$

      **Step 6 (FLt).** $[\rho g h] = \dimF\dimT^2\dimL^{-4}\cdot\dimL\dimT^{-2}\cdot\dimL = \dimF\dimL^{-2} = [\Delta p]$ ✓.

      **Result**

      $$
      \frac{\dot m}{\rho\,g^{1/2} h^{5/2}} = f\!\left(\frac{A}{h^2},\ \frac{\Delta p}{\rho g h}\right)
      \quad\Longleftrightarrow\quad
      \frac{\dot m}{\rho A\sqrt{g h}} = \phi\!\left(\frac{A}{h^2},\ \frac{\Delta p}{\rho g h}\right)
      $$

      (the second form uses $\Pi_1/\Pi_2$ in place of $\Pi_1$).

      *Supplementary check (not from the book):* Bernoulli for a large tank and an ideal nozzle gives $\dot m = \rho A\sqrt{2(\Delta p/\rho + g h)}$, i.e. $\dfrac{\dot m}{\rho A\sqrt{g h}} = \sqrt{2\left(1 + \dfrac{\Delta p}{\rho g h}\right)}$ — independent of $A/h^2$ in that limit.`,
        check: [{ label: 'number of independent Π parameters', value: 3, tol: 0.01 }],
      },
      // ───────────────────────────── 7.32 ─────────────────────────────
      {
        id: 'fox7-32',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.32' },
        q: md`The ventilation of a cruise-ship clubhouse cannot clear cigarette smoke, so a larger extractor fan is to be tested. The smoke concentration $c$ (particles per cubic metre) is taken to depend on the number of smokers $N$, the fan pressure drop $\Delta p$, the fan diameter $D$, the motor speed $\omega$, the particle density $\rho_p$, the air density $\rho$, gravity $g$ and the air viscosity $\mu$. Determine the dimensionless parameters that characterize the problem.`,
        hint: md`A count of particles is a pure number, so $[c] = \dimL^{-3}$; $N$ is already dimensionless. Use $\rho$, $\omega$, $D$ as repeating parameters.`,
        answer: md`Six groups: $c D^3 = f\!\left(N,\ \dfrac{\Delta p}{\rho\,\omega^2 D^2},\ \dfrac{\rho_p}{\rho},\ \dfrac{g}{\omega^2 D},\ \dfrac{\mu}{\rho\,\omega D^2}\right)$.`,
        solution: md`**Step 1.** $c,\ N,\ \Delta p,\ D,\ \omega,\ \rho_p,\ \rho,\ g,\ \mu$ → $n = 9$.

      **Steps 2–3.**

      | | $c$ | $N$ | $\Delta p$ | $D$ | $\omega$ | $\rho_p,\ \rho$ | $g$ | $\mu$ |
      |---|---|---|---|---|---|---|---|---|
      | dimensions | $\dimL^{-3}$ | 1 | $\dimM\dimL^{-1}\dimT^{-2}$ | $\dimL$ | $\dimT^{-1}$ | $\dimM\dimL^{-3}$ | $\dimL\dimT^{-2}$ | $\dimM\dimL^{-1}\dimT^{-1}$ |

      Rank 3 → $m = 3$ → $9 - 3 = 6$ groups.

      **Step 4.** Repeating $\rho$, $\omega$, $D$ (only one of the two densities may be used).

      **Step 5.**

      * $\Pi_1 = c\,\rho^a\omega^b D^{e}$: $a = 0$, $b = 0$, $-3 + e = 0 \Rightarrow e = 3$. $\;\Pi_1 = c D^3$
      * $\Pi_2 = N$ (already dimensionless) and $\Pi_4 = \rho_p/\rho$ (same dimensions).
      * $\Pi_3 = \Delta p\,\rho^a\omega^b D^{e}$: $\dimM$: $a = -1$; $\dimT$: $-2 - b = 0 \Rightarrow b = -2$; $\dimL$: $-1 + 3 + e = 0 \Rightarrow e = -2$. $\;\Pi_3 = \dfrac{\Delta p}{\rho\,\omega^2 D^2}$
      * $\Pi_5 = g\,\rho^a\omega^b D^{e}$: $a = 0$; $b = -2$; $\dimL$: $1 + e = 0 \Rightarrow e = -1$. $\;\Pi_5 = \dfrac{g}{\omega^2 D}$
      * $\Pi_6 = \mu\,\rho^a\omega^b D^{e}$: $a = -1$; $b = -1$; $\dimL$: $-1 + 3 + e = 0 \Rightarrow e = -2$. $\;\Pi_6 = \dfrac{\mu}{\rho\,\omega D^2}$

      **Step 6 (FLt).** $[\rho\,\omega^2 D^2] = \dimF\dimT^2\dimL^{-4}\cdot\dimT^{-2}\cdot\dimL^2 = \dimF\dimL^{-2} = [\Delta p]$ ✓; $[\rho\,\omega D^2] = \dimF\dimT\dimL^{-2} = [\mu]$ ✓.

      **Result**

      $$
      c D^3 = f\!\left(N,\ \frac{\Delta p}{\rho\,\omega^2 D^2},\ \frac{\rho_p}{\rho},\ \frac{g}{\omega^2 D},\ \frac{\mu}{\rho\,\omega D^2}\right)
      $$

      These are a fan pressure coefficient, a density ratio, an inverse Froude number and an inverse Reynolds number based on the fan tip speed $\omega D$.`,
        check: [{ label: 'number of Π groups', value: 6, tol: 0.01 }],
      },
      // ───────────────────────────── 7.33 ─────────────────────────────
      {
        id: 'fox7-33',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.33' },
        q: md`The mass burning rate $\dot m$ of a flammable gas depends on the flame thickness $\delta$, the gas density $\rho$, the thermal diffusivity $\alpha$ and the mass diffusivity $D$. Both $\alpha$ and $D$ have dimensions $\dimL^2/\dimT$. Use dimensional analysis to find the functional form of this dependence in dimensionless parameters.`,
        hint: md`$\alpha$ and $D$ have the same dimensions, so they cannot both be repeating — their ratio is a group by inspection. Repeating: $\rho$, $\delta$, $\alpha$.`,
        answer: md`Two groups: $\dfrac{\dot m}{\rho\,\alpha\,\delta} = f\!\left(\dfrac{D}{\alpha}\right)$.`,
        solution: md`**Step 1.** $\dot m,\ \delta,\ \rho,\ \alpha,\ D$ → $n = 5$.

      **Steps 2–3.** $[\dot m] = \dimM\dimT^{-1}$ (mass per unit time, as stated), $[\delta] = \dimL$, $[\rho] = \dimM\dimL^{-3}$, $[\alpha] = [D] = \dimL^2\dimT^{-1}$. Rank 3 → $m = 3$ → $5 - 3 = 2$ groups.

      **Step 4.** Repeating $\rho$, $\delta$, $\alpha$.

      **Step 5.**

      * $\Pi_1 = \dot m\,\rho^a\delta^b\alpha^c$: $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-1 - c = 0 \Rightarrow c = -1$; $\dimL$: $3 + b - 2 = 0 \Rightarrow b = -1$. $\;\Pi_1 = \dfrac{\dot m}{\rho\,\alpha\,\delta}$
      * $\Pi_2 = D/\alpha$ (by inspection).

      **Step 6 (FLt).** $[\rho\,\alpha\,\delta] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^2\dimT^{-1}\cdot\dimL = \dimF\dimT\dimL^{-1}$, and a mass rate is $\dimF\dimT^2\dimL^{-1}\cdot\dimT^{-1} = \dimF\dimT\dimL^{-1}$ ✓.

      **Result**

      $$
      \frac{\dot m}{\rho\,\alpha\,\delta} = f\!\left(\frac{D}{\alpha}\right)
      $$

      *Supplementary remarks (not from the book):* $\alpha/D$ is known as the Lewis number. If the burning rate is taken per unit flame area ($\dimM\dimL^{-2}\dimT^{-1}$), the first group becomes $\dot m\,\delta/(\rho\,\alpha)$ instead.`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
      },
      // ───────────────────────────── 7.34 ─────────────────────────────
      {
        id: 'fox7-34',
        concept: 'dimensional-matrix',
        difficulty: 3,
        src: { ...P271, note: 'Problem 7.34' },
        q: md`In a fan-assisted convection oven the heat transfer rate to a roast, $\dot Q$ (energy per unit time), is thought to depend on the specific heat of air $c_p$, a temperature difference $\Theta$, a length scale $L$, and the air's density $\rho$, viscosity $\mu$ and speed $V$. (i) How many basic dimensions do these variables contain? (ii) How many Π parameters are needed to characterize the oven? (iii) Evaluate the Π parameters.`,
        hint: md`$[c_p] = \dimL^2\dimT^{-2}\mathsf{\Theta}^{-1}$ (J/(kg·K)), so temperature is a fourth basic dimension and four repeating parameters are needed: $\rho$, $V$, $L$, $\Theta$.`,
        answer: md`(i) 4 ($\dimM$, $\dimL$, time, temperature); (ii) $7 - 4 = 3$; (iii) $\dfrac{\dot Q}{\rho V^3 L^2} = f\!\left(\dfrac{c_p\Theta}{V^2},\ \dfrac{\rho V L}{\mu}\right)$.`,
        solution: md`**Step 1.** $\dot Q,\ c_p,\ \Theta,\ L,\ \rho,\ \mu,\ V$ → $n = 7$.

      **Steps 2–3.** Time is written $\dimT$ and temperature $\mathsf{\Theta}$:

      | | $\dot Q$ | $c_p$ | $\Theta$ | $L$ | $\rho$ | $\mu$ | $V$ |
      |---|---|---|---|---|---|---|---|
      | $\dimM$ | 1 | 0 | 0 | 0 | 1 | 1 | 0 |
      | $\dimL$ | 2 | 2 | 0 | 1 | −3 | −1 | 1 |
      | $\dimT$ | −3 | −2 | 0 | 0 | 0 | −1 | −1 |
      | $\mathsf{\Theta}$ | 0 | −1 | 1 | 0 | 0 | 0 | 0 |

      **(i)** Four basic dimensions: mass, length, time and temperature. The columns $\rho, V, L, \Theta$ are independent, so the rank is 4 and $m = 4$.

      **(ii)** $n - m = 7 - 4 = 3$ Π parameters.

      **(iii) Step 4.** Repeating $\rho$, $V$, $L$, $\Theta$.

      **Step 5.**

      * $\Pi_1 = \dot Q\,\rho^a V^b L^c\Theta^d$: $\mathsf{\Theta}$: $d = 0$; $\dimM$: $1 + a = 0 \Rightarrow a = -1$; $\dimT$: $-3 - b = 0 \Rightarrow b = -3$; $\dimL$: $2 + 3 - 3 + c = 0 \Rightarrow c = -2$. $\;\Pi_1 = \dfrac{\dot Q}{\rho V^3 L^2}$
      * $\Pi_2 = c_p\,\rho^a V^b L^c\Theta^d$: $\mathsf{\Theta}$: $-1 + d = 0 \Rightarrow d = 1$; $\dimM$: $a = 0$; $\dimT$: $-2 - b = 0 \Rightarrow b = -2$; $\dimL$: $2 - 2 + c = 0 \Rightarrow c = 0$. $\;\Pi_2 = \dfrac{c_p\Theta}{V^2}$
      * $\Pi_3 = \mu\,\rho^a V^b L^c\Theta^d$: $d = 0$, $a = -1$, $b = -1$, $c = -1$. $\;\Pi_3 = \dfrac{\mu}{\rho V L}$

      **Step 6 (FLt).** $[\dot Q] = \dimF\dimL\dimT^{-1}$ and $[\rho V^3 L^2] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^3\dimT^{-3}\cdot\dimL^2 = \dimF\dimL\dimT^{-1}$ ✓; $[c_p\Theta] = \dimL^2\dimT^{-2} = [V^2]$ ✓.

      **Result**

      $$
      \frac{\dot Q}{\rho V^3 L^2} = f\!\left(\frac{c_p\,\Theta}{V^2},\ \frac{\rho V L}{\mu}\right)
      $$

      *Supplementary remarks (not from the book):* $V^2/(c_p\Theta)$ is the Eckert number. Because the air's thermal conductivity was not in the list, the Prandtl and Nusselt numbers cannot appear; a fuller analysis would add it.`,
        check: [
          { label: '(i) number of basic dimensions', value: 4, tol: 0.01 },
          { label: '(ii) number of Π parameters', value: 3, tol: 0.01 },
        ],
      },
      // ───────────────────────────── 7.35 ─────────────────────────────
      {
        id: 'fox7-35',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.35' },
        q: md`A marine propeller's thrust is to be measured in "open-water" tests over a range of angular speeds and forward speeds ("speeds of advance"). The thrust $F_T$ is thought to depend on the water density $\rho$, the propeller diameter $D$, the speed of advance $V$, gravity $g$, the angular speed $\omega$, the liquid pressure $p$ and the liquid viscosity $\mu$. Develop a set of dimensionless parameters that characterizes the propeller's performance. (One of them, $gD/V^2$, is called the *Froude speed of advance*.)`,
        hint: md`Eight parameters, three dimensions → five groups. Repeating $\rho$, $D$, $V$; every other parameter gets its own group.`,
        answer: md`$\dfrac{F_T}{\rho V^2 D^2} = f\!\left(\dfrac{g D}{V^2},\ \dfrac{\omega D}{V},\ \dfrac{p}{\rho V^2},\ \dfrac{\mu}{\rho V D}\right)$ — five groups.`,
        solution: md`**Step 1.** $F_T,\ \rho,\ D,\ V,\ g,\ \omega,\ p,\ \mu$ → $n = 8$.

      **Steps 2–3.** $[F_T] = \dimM\dimL\dimT^{-2}$, $[\rho] = \dimM\dimL^{-3}$, $[D] = \dimL$, $[V] = \dimL\dimT^{-1}$, $[g] = \dimL\dimT^{-2}$, $[\omega] = \dimT^{-1}$, $[p] = \dimM\dimL^{-1}\dimT^{-2}$, $[\mu] = \dimM\dimL^{-1}\dimT^{-1}$. Rank 3 → $m = 3$ → $8 - 3 = 5$ groups.

      **Step 4.** Repeating $\rho$, $V$, $D$.

      **Step 5** (each $\Pi = q\,\rho^a V^b D^c$):

      | $q$ | $\dimM$ | $\dimT$ | $\dimL$ | group |
      |---|---|---|---|---|
      | $F_T$ | $a = -1$ | $b = -2$ | $1 + 3 - 2 + c = 0 \Rightarrow c = -2$ | $\Pi_1 = F_T/(\rho V^2 D^2)$ |
      | $g$ | $a = 0$ | $b = -2$ | $1 - 2 + c = 0 \Rightarrow c = 1$ | $\Pi_2 = g D/V^2$ |
      | $\omega$ | $a = 0$ | $b = -1$ | $-1 + c = 0 \Rightarrow c = 1$ | $\Pi_3 = \omega D/V$ |
      | $p$ | $a = -1$ | $b = -2$ | $-1 + 3 - 2 + c = 0 \Rightarrow c = 0$ | $\Pi_4 = p/(\rho V^2)$ |
      | $\mu$ | $a = -1$ | $b = -1$ | $-1 + 3 - 1 + c = 0 \Rightarrow c = -1$ | $\Pi_5 = \mu/(\rho V D)$ |

      **Step 6 (FLt).** $[\rho V^2 D^2] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^2\dimT^{-2}\cdot\dimL^2 = \dimF = [F_T]$ ✓; $[\rho V^2] = \dimF\dimL^{-2} = [p]$ ✓.

      **Result**

      $$
      \frac{F_T}{\rho V^2 D^2} = f\!\left(\frac{g D}{V^2},\ \frac{\omega D}{V},\ \frac{p}{\rho V^2},\ \frac{\mu}{\rho V D}\right)
      $$

      $\Pi_2$ is the Froude speed of advance named in the problem, $\Pi_4$ an Euler (cavitation-type) number and $\Pi_5$ an inverse Reynolds number. *Supplementary (not from the book):* naval architects usually recombine these into a thrust coefficient $F_T/(\rho n^2 D^4)$ and an advance ratio $J = V/(nD)$, with $n$ in revolutions per unit time — the same information, rearranged.`,
        check: [{ label: 'number of Π groups', value: 5, tol: 0.01 }],
      },
      // ───────────────────────────── 7.36 ─────────────────────────────
      {
        id: 'fox7-36',
        concept: 'repeating-variables',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.36' },
        q: md`The power $\mathscr{P}$ needed to drive a propeller depends on the freestream speed $V$, the propeller diameter $D$, its angular speed $\omega$, and the fluid's viscosity $\mu$, density $\rho$ and speed of sound $c$. How many dimensionless groups are needed to characterize this situation? Obtain them.`,
        hint: md`Seven parameters, three dimensions. With $\rho$, $V$, $D$ repeating, the speed of sound produces a Mach number.`,
        answer: md`Four groups: $\dfrac{\mathscr{P}}{\rho V^3 D^2} = f\!\left(\dfrac{\omega D}{V},\ \dfrac{\rho V D}{\mu},\ \dfrac{V}{c}\right)$.`,
        solution: md`**Step 1.** $\mathscr{P},\ V,\ D,\ \omega,\ \mu,\ \rho,\ c$ → $n = 7$.

      **Steps 2–3.** $[\mathscr{P}] = \dimM\dimL^2\dimT^{-3}$, $[V] = [c] = \dimL\dimT^{-1}$, $[D] = \dimL$, $[\omega] = \dimT^{-1}$, $[\mu] = \dimM\dimL^{-1}\dimT^{-1}$, $[\rho] = \dimM\dimL^{-3}$. Rank 3 → $m = 3$ → **$7 - 3 = 4$ groups**.

      **Step 4.** Repeating $\rho$, $V$, $D$ ($c$ and $V$ have the same dimensions, so only one of them can be repeating).

      **Step 5.**

      * $\Pi_1 = \mathscr{P}\,\rho^a V^b D^e$: $\dimM$: $a = -1$; $\dimT$: $-3 - b = 0 \Rightarrow b = -3$; $\dimL$: $2 + 3 - 3 + e = 0 \Rightarrow e = -2$. $\;\Pi_1 = \dfrac{\mathscr{P}}{\rho V^3 D^2}$
      * $\Pi_2 = \omega\,\rho^a V^b D^e$: $a = 0$, $b = -1$, $e = 1$. $\;\Pi_2 = \dfrac{\omega D}{V}$
      * $\Pi_3 = \mu\,\rho^a V^b D^e$: $a = -1$, $b = -1$, $e = -1$. $\;\Pi_3 = \dfrac{\mu}{\rho V D}$
      * $\Pi_4 = c\,\rho^a V^b D^e$: $a = 0$, $b = -1$, $e = 0$. $\;\Pi_4 = \dfrac{c}{V}$, conveniently inverted to the Mach number $V/c$.

      **Step 6 (FLt).** $[\rho V^3 D^2] = \dimF\dimT^2\dimL^{-4}\cdot\dimL^3\dimT^{-3}\cdot\dimL^2 = \dimF\dimL\dimT^{-1} = [\mathscr{P}]$ ✓.

      **Result**

      $$
      \frac{\mathscr{P}}{\rho V^3 D^2} = f\!\left(\frac{\omega D}{V},\ \frac{\rho V D}{\mu},\ \frac{V}{c}\right)
      $$

      A power coefficient as a function of a speed ratio, the Reynolds number and the Mach number (compressibility). Using $\rho$, $\omega$, $D$ as repeating parameters instead would give the equally valid power coefficient $\mathscr{P}/(\rho\,\omega^3 D^5)$.`,
        check: [{ label: 'number of dimensionless groups', value: 4, tol: 0.01 }],
      },
      // ───────────────────────────── 7.37 ─────────────────────────────
      {
        id: 'fox7-37',
        concept: 'dimensional-matrix',
        difficulty: 3,
        src: { doc: 'fox', pages: '271–272', note: 'Problem 7.37, Fig. P7.37' },
        q: md`In a boundary layer (Fig. P7.37: velocity rising from zero at the wall to the free-stream value $U$ at height $\delta$), the fluid velocity $u$ at a point depends on the point's height $y$ above the surface, the free-stream velocity $U$, the free-stream velocity gradient $dU/dx$, the kinematic viscosity $\nu$ and the boundary-layer thickness $\delta$. How many dimensionless groups are needed to describe the problem? Find (a) two Π groups by inspection, (b) one Π that is a standard fluid-mechanics group, and (c) any remaining Π groups using the Buckingham Pi theorem.`,
        hint: md`No variable contains mass, so only $\dimL$ and $\dimT$ appear: $r = 2$. Use $U$ and $\delta$ as the repeating parameters.`,
        answer: md`Four groups: (a) $u/U$ and $y/\delta$; (b) the Reynolds number $U\delta/\nu$; (c) $\dfrac{\delta}{U}\dfrac{dU}{dx}$. So $\dfrac{u}{U} = f\!\left(\dfrac{y}{\delta},\ \dfrac{U\delta}{\nu},\ \dfrac{\delta}{U}\dfrac{dU}{dx}\right)$.`,
        solution: md`**Step 1.** $u,\ y,\ U,\ dU/dx,\ \nu,\ \delta$ → $n = 6$.

      **Steps 2–3.**

      | | $u$ | $y$ | $U$ | $dU/dx$ | $\nu$ | $\delta$ |
      |---|---|---|---|---|---|---|
      | $\dimL$ | 1 | 1 | 1 | 0 | 2 | 1 |
      | $\dimT$ | −1 | 0 | −1 | −1 | −1 | 0 |

      Mass does not appear, so the dimensional matrix has only two rows and rank 2: $m = 2$ and **$6 - 2 = 4$ dimensionless groups** are needed.

      **(a) By inspection.** Two velocities and two lengths give $\Pi_1 = \dfrac{u}{U}$ and $\Pi_2 = \dfrac{y}{\delta}$.

      **(b) Standard group.** With a velocity, a length and a kinematic viscosity: $\Pi_3 = \dfrac{U\delta}{\nu}$, the Reynolds number based on boundary-layer thickness.

      **(c) Pi theorem for the remaining parameter.** Repeating $U$, $\delta$; $\Pi_4 = \dfrac{dU}{dx}\,U^a\delta^b$:

      $$
      \begin{aligned}
      \dimT&:\ -1 - a = 0 \;\Rightarrow\; a = -1\\
      \dimL&:\ a + b = 0 \;\Rightarrow\; b = 1
      \end{aligned}
      \qquad\Rightarrow\qquad \Pi_4 = \frac{\delta}{U}\,\frac{dU}{dx}
      $$

      (Applying the same procedure to $\nu$ gives $\nu/(U\delta)$, the inverse of (b) — a check.)

      **Check.** $[\delta\,dU/dx] = \dimL\cdot\dimT^{-1} = [U]$ ✓.

      **Result**

      $$
      \frac{u}{U} = f\!\left(\frac{y}{\delta},\ \frac{U\delta}{\nu},\ \frac{\delta}{U}\frac{dU}{dx}\right)
      $$

      *Supplementary remark (not from the book):* the product $\Pi_3\Pi_4 = \dfrac{\delta^2}{\nu}\dfrac{dU}{dx}$ is the pressure-gradient shape parameter used in Pohlhausen's approximate boundary-layer method.`,
        check: [
          { label: 'number of primary dimensions $r$', value: 2, tol: 0.01 },
          { label: 'number of dimensionless groups', value: 4, tol: 0.01 },
        ],
      },
    ],
    quiz: [
      {
        id: 'fox7b-q1',
        concept: 'dimensional-matrix',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.23' },
        q: md`Tank-bottom deflection (Problem 7.23): $\delta = f(D, h, d, \gamma, E)$. In $\dimM\dimL\dimT$, $\gamma$ and $E$ contain all three dimensions. How many repeating parameters are needed?`,
        options: ['2', '3', '4', '6'],
        answer: 0,
        explain: md`In the dimensional matrix the $\dimT$ row is $-2$ times the $\dimM$ row ($\dimM$ and $\dimT$ only ever appear together as $\dimM\dimT^{-2}$, i.e. only through the force dimension $\dimF = \dimM\dimL\dimT^{-2}$), so the rank is 2, not 3. The number of repeating parameters equals the rank, giving $6 - 2 = 4$ groups. Counting the three letters that appear (3) is the tempting mistake.`,
      },
      {
        id: 'fox7b-q2',
        concept: 'repeating-variables',
        difficulty: 1,
        src: { ...P271, note: 'Problem 7.28' },
        q: md`For the agitator of Problem 7.28, why may $\omega_{\max}$ and the oscillation frequency $f$ not both be chosen as repeating parameters?`,
        options: [
          md`They have identical dimensions ($\dimT^{-1}$), so their ratio is already dimensionless`,
          md`Neither contains mass, so they cannot be repeating`,
          md`$f$ is a dependent variable`,
          md`Repeating parameters must all contain length`,
        ],
        answer: 0,
        explain: md`No repeating parameter may have dimensions that are a power (here, the first power) of another's. Since $[f] = [\omega_{\max}]$, the two would not be independent, and $f/\omega_{\max}$ is a Π group by inspection. A repeating parameter does not need to contain every dimension — only the set as a whole must.`,
      },
      {
        id: 'fox7b-q3',
        concept: 'pi-theorem',
        difficulty: 2,
        src: { ...P271, note: 'Problem 7.29' },
        q: md`Choked-nozzle meter (Problem 7.29): $\dot m = f(A, p, T, R)$ with temperature as a fourth dimension. What does dimensional analysis predict?`,
        options: [
          md`$\dot m\sqrt{RT}/(pA)$ is a constant`,
          md`$\dot m\sqrt{RT}/(pA)$ is an unknown function of $p/(RT)$`,
          md`Two Π groups, so a curve must be measured`,
          md`Nothing — $R$ makes the problem dimensionally inconsistent`,
        ],
        answer: 0,
        explain: md`Five parameters, rank 4 ($\dimM$, $\dimL$, time, temperature) → $n - m = 1$ group, and a single group must equal a constant: $\dot m = C\,pA/\sqrt{RT}$. The quantity $p/(RT)$ is a density, not a dimensionless group, so it cannot be an argument of the function.`,
      },
      {
        id: 'fox7b-q4',
        concept: 'repeating-variables',
        difficulty: 1,
        src: { ...P271, note: 'Problem 7.26' },
        q: md`True or false: in Problem 7.26 the incline angle $\theta$ counts as one of the $n$ parameters and forms a Π group on its own.`,
        options: ['True', 'False'],
        answer: 0,
        explain: md`An angle is already dimensionless, so it is listed among the parameters (raising $n$ to 7) and is itself one of the $n - m = 4$ groups. Dropping it would leave only three groups and lose the dependence on $\theta$ (the physics gives a $\sin\theta$ dependence).`,
      },
    ],
  },
]
