import type { ProblemSet } from '@/lib/types'
import { md } from '@/kit'

/*
 * Fox & McDonald's, Chapter 7 end-of-chapter problems 7.57–7.75 ("Flow Similarity and Model Studies", pp. 273–274).
 * The book prints no answers: every solution below was written for this platform.
 * Property data (standard air, water, CO2, honey) come from standard tables and are stated as labelled assumptions
 * inside each solution; they are not printed on pp. 273–274.
 */

const P273 = { doc: 'fox' as const, pages: '273' }
const P274 = { doc: 'fox' as const, pages: '274' }

export const sets: ProblemSet[] = [
  {
    id: 'fox7d-similitude',
    topic: 'similitude',
    title: "Fox & McDonald's Ch. 7 — Problems 7.57–7.75: model studies, pump/fan laws and wind-tunnel practice",
    src: { doc: 'fox', pages: '273–274' },
    intro: md`Fifteen model-study problems: trucks, boats, submarines and spillways (which group to match, and what happens when you cannot match them all), fan and pump laws, and the practical side of wind-tunnel testing — blockage, Reynolds-number limits, kinetic-energy ratio and horizontal buoyancy.`,
    problems: [
      // ───────────────────────────── 7.57 ─────────────────────────────
      {
        id: 'fox7-57',
        concept: 'similarity-types',
        difficulty: 1,
        src: { ...P273, note: 'Problem 7.57' },
        q: md`The drag $F_D$ of a model tractor-trailer in a wind tunnel depends on the frontal area $A$, the wind speed $V$, the air density $\rho$ and the air viscosity $\mu$. The model is built at 1:4 scale and has a frontal area of $0.625\ \mathrm{m^2}$.

(a) Find a set of dimensionless parameters that characterizes the model results.
(b) State the conditions for dynamic similarity between model and prototype.
(c) In standard air at $V = 89.6$ m/s the model drag is $F_D = 2.46$ kN. Assuming dynamic similarity, estimate the drag on the full-scale vehicle at $V = 22.4$ m/s.
(d) What power is needed to overcome this drag in still air?`,
        hint: md`Use $\sqrt{A}$ as the length in the Reynolds number. Compare $V_m L_m$ with $V_p L_p$ — is the prototype speed the Reynolds-matched one?`,
        answer: md`$\dfrac{F_D}{\tfrac12\rho V^2 A} = f\!\left(\dfrac{\rho V\sqrt{A}}{\mu}\right)$; similarity needs equal Re (geometric similarity assumed). $22.4$ m/s is exactly the Re-matched speed, so $F_{D_p} = 2.46$ kN and $\mathcal{P} = 55.1$ kW.`,
        solution: md`**(a) Π groups.** Five parameters $F_D, A, V, \rho, \mu$ in three dimensions ($\dimM\dimL\dimT$) → two groups. With $\rho$, $V$, $\sqrt{A}$ repeating:

$$
\Pi_1 = \frac{F_D}{\rho V^2 A}\ \ (\text{conventionally } C_D = \frac{F_D}{\tfrac12\rho V^2 A}),\qquad \Pi_2 = \Rey = \frac{\rho V\sqrt{A}}{\mu}
$$

so $C_D = f(\Rey)$.

**(b) Dynamic similarity.** Model and prototype must be geometrically similar and have the same independent group: $\Rey_m = \Rey_p$. Then $C_{D_m} = C_{D_p}$.

**(c) Check the speeds.** Both flows are in standard air ($\nu$ equal), and $\sqrt{A}$ scales with the length ratio 1:4, so $\Rey_m = \Rey_p$ requires

$$
V_p = V_m\,\frac{L_m}{L_p} = 89.6 \times \frac14 = 22.4\ \text{m/s}
$$

— exactly the speed asked for, so the flows are dynamically similar and $C_{D_p} = C_{D_m}$:

$$
F_{D_p} = F_{D_m}\,\frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\frac{A_p}{A_m} = 2.46\ \text{kN}\times 1\times\left(\frac14\right)^2\times 16 = 2.46\ \text{kN}
$$

(With matched Re in the same fluid, $F_D \propto \mu^2/\rho$ is the same in model and prototype.)

**(d) Power** in still air (relative speed = road speed):

$$
\mathcal{P} = F_{D_p} V_p = 2460\ \text{N}\times 22.4\ \text{m/s} = 5.51\times10^4\ \text{W} = 55.1\ \text{kW}
$$

*Check (supplementary):* with standard air $\nu = 1.46\times10^{-5}\ \mathrm{m^2/s}$, $\Rey_m = 89.6\times\sqrt{0.625}/1.46\times10^{-5} = 4.85\times10^{6}$, comfortably high.`,
        check: [
          { label: 'prototype drag', value: 2.46, units: md`\mathrm{kN}`, tol: 0.02 },
          { label: 'power', value: 55.1, units: md`\mathrm{kW}`, tol: 0.02 },
        ],
      },
      // ───────────────────────────── 7.58 ─────────────────────────────
      {
        id: 'fox7-58',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.58' },
        q: md`A boat is tested with a 1:10-scale model. The full-size boat will run in a freshwater lake whose average temperature is 10°C. What kinematic viscosity must the model fluid have if **both** friction drag and wave drag are to be modelled correctly? Comment on the result.`,
        hint: md`Wave drag → match $\Fr$ (fixes $V_m/V_p$). Friction drag → match $\Rey$ (then fixes $\nu_m/\nu_p$). Assumption: water at 10°C has $\nu \approx 1.30\times10^{-6}\ \mathrm{m^2/s}$.`,
        answer: md`$\nu_m = \nu_p (L_m/L_p)^{3/2} = 0.0316\,\nu_p \approx 4.1\times10^{-8}\ \mathrm{m^2/s}$ — far below any practical liquid, so complete similarity is not achievable.`,
        solution: md`**Wave drag (gravity waves)** requires equal Froude numbers, $V_m/\sqrt{gL_m} = V_p/\sqrt{gL_p}$ (same $g$):

$$
\frac{V_m}{V_p} = \sqrt{\frac{L_m}{L_p}} = \sqrt{0.1} = 0.316
$$

**Friction drag** requires equal Reynolds numbers, $V_mL_m/\nu_m = V_pL_p/\nu_p$:

$$
\frac{\nu_m}{\nu_p} = \frac{V_m}{V_p}\,\frac{L_m}{L_p} = \left(\frac{L_m}{L_p}\right)^{3/2} = (0.1)^{1.5} = 0.0316
$$

**Numbers.** *Assumption (standard table value, not printed in the problem):* fresh water at 10°C, $\nu_p = 1.30\times10^{-6}\ \mathrm{m^2/s}$. Then

$$
\nu_m = 0.0316\times1.30\times10^{-6} = 4.11\times10^{-8}\ \mathrm{m^2/s}
$$

**Comment.** This is about 30 times less than water and still nearly three times less than mercury ($\nu\approx1.1\times10^{-7}\ \mathrm{m^2/s}$). No practical test liquid exists, so ship models are run at Froude similarity in water and the friction drag is corrected separately — the incomplete-similarity procedure of Figs. 7.2–7.3.`,
        check: [{ label: 'model-fluid kinematic viscosity', value: 4.11e-8, units: md`\mathrm{m^2/s}`, tol: 0.03 }],
      },
      // ───────────────────────────── 7.59 ─────────────────────────────
      {
        id: 'fox7-59',
        concept: 'similarity-types',
        difficulty: 3,
        src: { ...P273, note: 'Problem 7.59' },
        q: md`The pressure distribution on an automobile travelling at 96 km/h in standard air is to be found from a 1/5-scale model tested in water.

(a) What factors must be considered to ensure kinematic similarity?
(b) What water speed should be used?
(c) What is the ratio of prototype drag to model drag?
(d) The lowest pressure coefficient, at the point of minimum static pressure on the surface, is $C_p = -1.4$. If cavitation begins at a cavitation number of 0.5, estimate the minimum water-tunnel pressure needed to avoid cavitation.`,
        hint: md`Match $\Rey$ with $\nu_{air} = 1.46\times10^{-5}$ and $\nu_{water} = 1.00\times10^{-6}\ \mathrm{m^2/s}$ (assumed, 20°C water). For (d) the local pressure at the worst point is $p_\infty + C_p\tfrac12\rho V^2$; require its cavitation number $(p_{min}-p_v)/\tfrac12\rho V^2 \ge 0.5$.`,
        answer: md`(a) Geometric similarity (including ground clearance), equal $\Rey$, negligible compressibility, no cavitation in the model. (b) $V_m \approx 9.13$ m/s. (c) $F_p/F_m \approx 0.263$ (model drag ≈ 3.8 × prototype drag). (d) $p_\infty \gtrsim 81$ kPa (abs).`,
        solution: md`**(a) Kinematic similarity** (same streamline pattern, velocities in a fixed ratio) requires:
- **geometric similarity** of the car *and* its surroundings (ground plane, ground clearance, wheels, tunnel blockage small);
- **equal Reynolds numbers**, so viscous effects (boundary layers, separation) match;
- **no compressibility** effects in either flow (air at 26.7 m/s has $M\approx0.08$ — fine);
- **no cavitation** in the water model (in air there is no vapour phase), since a vapour cavity would change the flow pattern — this is part (d).

**Assumed properties (standard tables):** standard air $\rho_a = 1.23\ \mathrm{kg/m^3}$, $\nu_a = 1.46\times10^{-5}\ \mathrm{m^2/s}$; water at 20°C $\rho_w = 998\ \mathrm{kg/m^3}$, $\nu_w = 1.00\times10^{-6}\ \mathrm{m^2/s}$, $p_v = 2.34$ kPa.

**(b) Water speed.** $V_p = 96/3.6 = 26.67$ m/s. With $\Rey_m = \Rey_p$:

$$
V_m = V_p\,\frac{\nu_w}{\nu_a}\,\frac{L_p}{L_m} = 26.67\times\frac{1.00\times10^{-6}}{1.46\times10^{-5}}\times5 = 9.13\ \text{m/s}
$$

**(c) Drag ratio.** Equal Re ⇒ equal $C_D$, so

$$
\frac{F_p}{F_m} = \frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2 = \frac{1.23}{998}\times\left(\frac{26.67}{9.13}\right)^2\times25 = 0.263
$$

The model in water feels about $1/0.263 = 3.8$ times the prototype drag.

**(d) Cavitation.** The dynamic pressure in the model is $\tfrac12\rho_wV_m^2 = 0.5\times998\times9.13^2 = 41.6$ kPa. At the minimum-pressure point

$$
p_{min} = p_\infty + C_p\,\tfrac12\rho V^2
$$

Cavitation starts when the cavitation number based on this local pressure falls to 0.5:

$$
\frac{p_{min}-p_v}{\tfrac12\rho V^2} = 0.5 \;\Rightarrow\; p_\infty = p_v + (0.5 - C_p)\,\tfrac12\rho V^2 = 2.34 + (0.5+1.4)\times41.6 = 81.4\ \text{kPa (abs)}
$$

The tunnel must be run at or above about 81 kPa absolute (slightly below atmospheric, so atmospheric pressure is already safe).

*Interpretation note:* the problem does not say at which pressure the cavitation number 0.5 is evaluated; here it is applied at the minimum-pressure point, which is the only reading that uses the given $C_p$.`,
        check: [
          { label: 'water speed', value: 9.13, units: md`\mathrm{m/s}`, tol: 0.02 },
          { label: 'F_p / F_m', value: 0.263, tol: 0.03 },
          { label: 'minimum tunnel pressure', value: 81.4, units: md`\mathrm{kPa}`, tol: 0.03 },
        ],
      },
      // ───────────────────────────── 7.60 ─────────────────────────────
      {
        id: 'fox7-60',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.60' },
        q: md`A 1:50-scale submarine model is tested in a freshwater towing tank in two conditions: moving **at the free surface** and moving **far below** it. At the surface the submarine cruises at 12 m/s; far below the surface it cruises at 0.18 m/s.

(a) At what speed must the model be towed for dynamic similarity at the surface?
(b) At what speed for dynamic similarity far below the surface?
(c) In each case, by what factor must the model drag be multiplied to give the full-scale drag?`,
        hint: md`At the surface the waves dominate → Froude. Deep down there are no waves → Reynolds. Assume the prototype water has the same $\rho$ and $\nu$ as the tank.`,
        answer: md`(a) $V_m = 12/\sqrt{50} = 1.70$ m/s (Froude); drag factor $50^3 = 1.25\times10^5$. (b) $V_m = 0.18\times50 = 9.0$ m/s (Reynolds); drag factor 1.`,
        solution: md`*Assumption:* the prototype operates in water with the same $\rho$ and $\nu$ as the freshwater tank (for sea water the force factors below would be multiplied by $\rho_{sea}/\rho_{fresh}\approx1.03$, and the Reynolds condition would change slightly).

Force scaling for equal force coefficients:

$$
\frac{F_p}{F_m} = \frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2
$$

**(a) At the surface** wave-making dominates, so match $\Fr = V/\sqrt{gL}$:

$$
V_m = V_p\sqrt{\frac{L_m}{L_p}} = \frac{12}{\sqrt{50}} = 1.70\ \text{m/s}
$$

$$
\frac{F_p}{F_m} = 1\times\left(\sqrt{50}\right)^2\times50^2 = 50^3 = 1.25\times10^5
$$

(Re is then *not* matched — model Re is $50^{3/2}\approx354$ times too small — so this is incomplete similarity; friction drag would need a separate correction.)

**(b) Far below the surface** there is no free surface; only viscous and inertia forces matter, so match $\Rey = VL/\nu$:

$$
V_m = V_p\,\frac{L_p}{L_m} = 0.18\times50 = 9.0\ \text{m/s}
$$

$$
\frac{F_p}{F_m} = 1\times\left(\frac{1}{50}\right)^2\times50^2 = 1
$$

The model drag equals the prototype drag — the general result that Re-matched tests in the same fluid give equal forces ($F \propto \mu^2/\rho$).`,
        check: [
          { label: 'surface towing speed', value: 1.70, units: md`\mathrm{m/s}`, tol: 0.02 },
          { label: 'surface drag factor', value: 125000, tol: 0.02 },
          { label: 'submerged towing speed', value: 9.0, units: md`\mathrm{m/s}`, tol: 0.02 },
          { label: 'submerged drag factor', value: 1, tol: 0.02 },
        ],
      },
      // ───────────────────────────── 7.61 ─────────────────────────────
      {
        id: 'fox7-61',
        concept: 'model-testing',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.61' },
        q: md`A wind tunnel is used to test a full-scale model rocket 30 cm long; drag is scaled on the Reynolds number. The rocket's maximum expected speed is 190 km/h in ambient air at 20°C.

(a) Find the Reynolds number at this speed.
(b) The tunnel only reaches 160 km/h, so its effective top speed is to be raised by changing the air temperature. Find the equivalent speed (the speed in 20°C air with the same Re) when the tunnel air is at 5°C and at 65°C.
(c) Would replacing the air with carbon dioxide give higher equivalent speeds?`,
        hint: md`Same body, so $\Rey$ equal ⇔ $V/\nu$ equal: $V_{eq} = V_{tunnel}\,\nu_{20}/\nu_{T}$. Air at 1 atm (assumed table values): $\nu = 1.33, 1.42, 1.51\times10^{-5}$ at 0, 10, 20°C and $1.89, 1.99\times10^{-5}\ \mathrm{m^2/s}$ at 60, 70°C.`,
        answer: md`(a) $\Rey \approx 1.05\times10^6$. (b) 5°C: $V_{eq}\approx176$ km/h; 65°C: $V_{eq}\approx125$ km/h — cooling helps, heating hurts. (c) Yes: $\nu_{CO_2}\approx8.0\times10^{-6}\ \mathrm{m^2/s}$ gives $V_{eq}\approx300$ km/h.`,
        solution: md`**Assumed properties (air at 1 atm, standard tables):** $\nu_{20} = 1.51\times10^{-5}\ \mathrm{m^2/s}$; linear interpolation gives $\nu_{5} = 1.375\times10^{-5}$ and $\nu_{65} = 1.94\times10^{-5}\ \mathrm{m^2/s}$.

**(a)** $V = 190/3.6 = 52.8$ m/s:

$$
\Rey = \frac{VL}{\nu} = \frac{52.8\times0.30}{1.51\times10^{-5}} = 1.05\times10^{6}
$$

**(b) Equivalent speed.** The rocket is the same size in the tunnel, so equal Re requires equal $V/\nu$. Running the tunnel at its maximum, 160 km/h, in air of viscosity $\nu_T$ produces the Re that 20°C air would give at

$$
V_{eq} = V_{tunnel}\,\frac{\nu_{20}}{\nu_T}
$$

- 5°C: $V_{eq} = 160\times\dfrac{1.51}{1.375} = 176$ km/h
- 65°C: $V_{eq} = 160\times\dfrac{1.51}{1.94} = 125$ km/h

For gases $\nu = \mu/\rho$ *rises* with temperature ($\mu$ increases and $\rho$ falls), so **cooling** raises the equivalent speed and heating lowers it. Even at 5°C the tunnel falls short of 190 km/h; reaching it would need $\nu = 1.51\times10^{-5}\times160/190 = 1.27\times10^{-5}\ \mathrm{m^2/s}$, i.e. air below 0°C (the idea behind the cryogenic NTF, p. 268).

**(c) Carbon dioxide.** *Assumption:* at 20°C and 1 atm, $\mu_{CO_2}\approx1.47\times10^{-5}$ Pa·s and $\rho = pM/(R_uT) = 101\,325\times0.04401/(8.314\times293.15) = 1.83\ \mathrm{kg/m^3}$, so $\nu_{CO_2} = 8.0\times10^{-6}\ \mathrm{m^2/s}$ — about half that of air. Then

$$
V_{eq} = 160\times\frac{1.51\times10^{-5}}{8.0\times10^{-6}} \approx 300\ \text{km/h}
$$

Yes — CO₂ gives a much higher equivalent speed (Mach number stays low: $44.4/267\approx0.17$), at the cost of handling a non-air test gas in a closed circuit.`,
        check: [
          { label: 'Reynolds number', value: 1.05e6, tol: 0.03 },
          { label: 'V_eq at 5°C', value: 176, units: md`\mathrm{km/h}`, tol: 0.03 },
          { label: 'V_eq at 65°C', value: 125, units: md`\mathrm{km/h}`, tol: 0.03 },
        ],
      },
      // ───────────────────────────── 7.64 ─────────────────────────────
      {
        id: 'fox7-64',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.64' },
        q: md`A 1/9-scale tractor-trailer model (frontal area $0.2\ \mathrm{m^2}$) is tested in a wind tunnel. At $V_m = 85$ m/s in standard air the drag is $F_D = 370$ N.

(a) Find the drag coefficient at the model conditions.
(b) Assuming $C_D$ is the same for model and prototype, find the drag on a prototype rig at 100 km/h.
(c) At what air speed should the model be tested for dynamically similar results if the prototype speed is 90 km/h?
(d) Is that speed practical? Why or why not?`,
        hint: md`Areas scale with the square of the length ratio: $A_p = 81A_m$. Re matching in the same air gives $V_m = 9V_p$.`,
        answer: md`(a) $C_D = 0.416$. (b) $F_{D_p}\approx3.20$ kN. (c) $V_m = 225$ m/s. (d) No — $M\approx0.66$, compressibility would spoil similarity (SAE limit 91 m/s); since $C_D$ is Re-independent for bluff bodies, it is also unnecessary.`,
        solution: md`*Assumed property:* standard air, $\rho = 1.23\ \mathrm{kg/m^3}$.

**(a)**

$$
C_D = \frac{F_D}{\tfrac12\rho V^2A} = \frac{370}{0.5\times1.23\times85^2\times0.2} = \frac{370}{888.6} = 0.416
$$

**(b)** $A_p = 9^2\times0.2 = 16.2\ \mathrm{m^2}$, $V_p = 100/3.6 = 27.8$ m/s:

$$
F_{D_p} = C_D\,\tfrac12\rho V_p^2A_p = 0.416\times0.5\times1.23\times27.8^2\times16.2 = 3.20\times10^3\ \text{N}
$$

**(c)** Dynamic similarity needs $\Rey_m = \Rey_p$ in the same air:

$$
V_m = V_p\,\frac{L_p}{L_m} = \frac{90}{3.6}\times9 = 25\times9 = 225\ \text{m/s}
$$

**(d) Not practical.** 225 m/s is a Mach number of about $225/343 = 0.66$: compressibility would change the flow (the model and prototype would no longer be kinematically similar), it is far above the 91 m/s limit recommended for truck testing, and the power would be enormous ($\propto V^3$). Fortunately a tractor-trailer is a bluff body whose $C_D$ becomes independent of Re above a threshold (Example 7.5), so the 85 m/s test — model $\Rey$ already high — gives a usable $C_D$ without matching Re. This is incomplete similarity used deliberately.`,
        check: [
          { label: 'C_D', value: 0.416, tol: 0.02 },
          { label: 'prototype drag', value: 3.2, units: md`\mathrm{kN}`, tol: 0.02 },
          { label: 'model speed for Re matching', value: 225, units: md`\mathrm{m/s}`, tol: 0.02 },
        ],
      },
      // ───────────────────────────── 7.65 ─────────────────────────────
      {
        id: 'fox7-65',
        concept: 'model-testing',
        difficulty: 3,
        src: { ...P274, note: 'Problem 7.65' },
        q: md`SAE recommended practice (Fox ref. [8]) for truck models: frontal area less than 5 % of the test-section area; $\Rey = Vw/\nu > 2\times10^6$ with $w$ the model width; model height less than 30 % of the test-section height; maximum projected width at the maximum yaw angle (20°) less than 30 % of the test-section width; maximum air speed below 91 m/s to avoid compressibility. A tractor-trailer model is to be tested in a tunnel whose test section is 0.46 m high and 0.61 m wide. The full-scale rig is 4.1 m high, 2.4 m wide and 19.8 m long. Find the scale ratio of the largest model that meets all the criteria, and decide whether an adequate Reynolds number can be reached in this facility.`,
        hint: md`Write each geometric criterion as an upper limit on the scale $s = L_m/L_p$ and take the smallest. For the yawed width, treat the rig as a rectangular box: projected width $= W\cos20^\circ + L\sin20^\circ$ (an assumption).`,
        answer: md`Yaw-width criterion governs: $s \le 1/49.3$, so about a **1:50** model ($w_m\approx49$ mm). At the 91 m/s limit $\Rey \approx 3.0\times10^5 \ll 2\times10^6$ — an adequate Re cannot be reached.`,
        solution: md`Let $s = L_m/L_p$ (model/prototype length ratio).

**1. Blockage (area < 5 %).** Test-section area $0.46\times0.61 = 0.281\ \mathrm{m^2}$; prototype frontal area $4.1\times2.4 = 9.84\ \mathrm{m^2}$:

$$
s^2\times9.84 \le 0.05\times0.281 = 0.01403 \;\Rightarrow\; s \le 0.0378 \quad(1{:}26.5)
$$

**2. Height (< 30 %).** $4.1\,s \le 0.3\times0.46 = 0.138 \Rightarrow s \le 0.0337$ (1:29.7).

**3. Yawed width (< 30 % at 20°).** *Assumption (geometry not specified in the book):* the rig is a rectangular box, so its projected width at yaw angle $\beta$ is $W\cos\beta + L\sin\beta$:

$$
2.4\cos20^\circ + 19.8\sin20^\circ = 2.255 + 6.772 = 9.03\ \text{m}
$$

$$
9.03\,s \le 0.3\times0.61 = 0.183 \;\Rightarrow\; s \le 0.0203 \quad(1{:}49.3)
$$

**Governing limit:** the long trailer swung to 20° yaw is the most restrictive, so the largest model is about **1:50** (strictly 1:49.3), with width $w_m = 2.4/49.3 = 0.0487$ m.

**4. Reynolds number.** At the maximum allowed speed (91 m/s) in standard air ($\nu = 1.46\times10^{-5}\ \mathrm{m^2/s}$, assumed):

$$
\Rey = \frac{Vw_m}{\nu} = \frac{91\times0.0487}{1.46\times10^{-5}} = 3.0\times10^5
$$

This is less than one-sixth of the recommended $2\times10^6$. Reaching it would need $V = 2\times10^6\times1.46\times10^{-5}/0.0487 \approx 600$ m/s — supersonic. **An adequate Reynolds number cannot be achieved in this facility**; a much larger (or pressurized) tunnel is needed.`,
        check: [
          { label: 'largest scale denominator (1:N)', value: 49.3, tol: 0.03 },
          { label: 'Re at 91 m/s', value: 3.0e5, tol: 0.03 },
        ],
      },
      // ───────────────────────────── 7.66 ─────────────────────────────
      {
        id: 'fox7-66',
        concept: 'pump-scaling',
        difficulty: 1,
        src: { ...P274, note: 'Problem 7.66' },
        q: md`The power $\mathcal{P}$ needed to drive a fan is assumed to depend on fluid density $\rho$, volume flow rate $Q$, impeller diameter $D$ and angular speed $\omega$. A fan with $D_1 = 200$ mm delivers $Q_1 = 0.4\ \mathrm{m^3/s}$ of air at $\omega_1 = 2500$ rpm. What diameter fan would be expected to deliver $Q_2 = 2.38\ \mathrm{m^3/s}$ of air at $\omega_2 = 1800$ rpm, if the two fans are geometrically and dynamically similar?`,
        hint: md`Five variables, three dimensions → $\dfrac{\mathcal{P}}{\rho\omega^3D^5} = f\!\left(\dfrac{Q}{\omega D^3}\right)$. Dynamic similarity ⇒ equal flow coefficient (Eq. 7.19).`,
        answer: md`$D_2 = D_1\left(\dfrac{Q_2\,\omega_1}{Q_1\,\omega_2}\right)^{1/3} \approx 0.404$ m (about 400 mm).`,
        solution: md`**Π groups.** $\mathcal{P}, \rho, Q, D, \omega$: five parameters, three dimensions → two groups. With $\rho, \omega, D$ repeating:

$$
\Pi_1 = \frac{\mathcal{P}}{\rho\,\omega^3D^5}\ (\text{power coefficient}),\qquad \Pi_2 = \frac{Q}{\omega D^3}\ (\text{flow coefficient})
$$

**Similarity condition.** Dynamically similar operating points have the same flow coefficient (Eq. 7.19):

$$
\frac{Q_1}{\omega_1D_1^3} = \frac{Q_2}{\omega_2D_2^3}\;\Rightarrow\; D_2 = D_1\left(\frac{Q_2}{Q_1}\,\frac{\omega_1}{\omega_2}\right)^{1/3}
$$

$$
D_2 = 0.200\times\left(\frac{2.38}{0.4}\times\frac{2500}{1800}\right)^{1/3} = 0.200\times(8.26)^{1/3} = 0.200\times2.021 = 0.404\ \text{m}
$$

(rpm cancels in the ratio, so no conversion to rad/s is needed). The power would then follow from $\Pi_1$ equal: $\mathcal{P}_2/\mathcal{P}_1 = (\omega_2/\omega_1)^3(D_2/D_1)^5$.`,
        check: [{ label: 'fan diameter', value: 0.404, units: md`\mathrm{m}`, tol: 0.02 }],
      },
      // ───────────────────────────── 7.67 ─────────────────────────────
      {
        id: 'fox7-67',
        concept: 'incomplete-similarity',
        difficulty: 3,
        src: { ...P274, note: 'Problem 7.67' },
        q: md`Tests on a 1-m long ship model in a water tank gave (after data analysis):

| $V$ (m/s) | 3 | 6 | 9 | 12 | 15 | 18 | 20 |
|---|---|---|---|---|---|---|---|
| $D_{wave}$ (N) | 0 | 0.0125 | 0.5 | 1.5 | 3 | 4 | 5.5 |
| $D_{friction}$ (N) | 0.1 | 0.35 | 0.75 | 1.25 | 2 | 2.75 | 3.25 |

Wave drag is to be scaled with the Froude number and friction drag with the Reynolds number. The full-size ship will be 50 m long. Estimate its total drag when cruising at 7.7 m/s and at 10.3 m/s in a freshwater lake.`,
        hint: md`Find the model speed that matches each group. Froude: $V_m = V_p/\sqrt{50}$. Reynolds (same water): $V_m = 50V_p$ — far outside the table, so fit $D_{friction} = aV^b$ on log–log axes and extrapolate. Force scaling: $F_p/F_m = (V_p/V_m)^2(L_p/L_m)^2$.`,
        answer: md`Wave drag ≈ 0 (Froude model speeds 1.09 and 1.46 m/s are below the 3 m/s point where $D_{wave}=0$). Friction drag by Reynolds scaling with a power-law extrapolation $D_f \approx 0.0129\,V^{1.85}$: total ≈ **0.78 kN** at 7.7 m/s and ≈ **1.34 kN** at 10.3 m/s (rough, because of the long extrapolation).`,
        solution: md`*Assumption:* the tank water and the lake water have the same $\rho$ and $\nu$.

General force scaling (equal force coefficient):

$$
\frac{F_p}{F_m} = \frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2
$$

**Wave drag — Froude scaling.** $V_m = V_p\sqrt{L_m/L_p} = V_p/\sqrt{50}$:
- $V_p = 7.7$ m/s → $V_m = 1.09$ m/s
- $V_p = 10.3$ m/s → $V_m = 1.46$ m/s

Then $F_p/F_m = 50\times50^2 = 50^3 = 1.25\times10^5$. But both model speeds lie below 3 m/s, where the measured wave drag is already zero (and it is only 0.0125 N at 6 m/s). The model wave drag is therefore $\approx0$ and so is the prototype's: at these speeds ($\Fr = V/\sqrt{gL} = 0.35$ and $0.47$) the 50-m ship makes negligible waves *according to these data*.

**Friction drag — Reynolds scaling.** $V_m = V_p L_p/L_m = 50V_p$, i.e. 385 m/s and 515 m/s. Then

$$
\frac{F_p}{F_m} = \left(\frac{1}{50}\right)^2\times50^2 = 1
$$

so the prototype friction drag equals the model friction drag *at* 385 or 515 m/s. These speeds are far beyond the data, so extrapolate. A least-squares fit of $\ln D_f$ against $\ln V$ through all seven points gives

$$
D_f \approx 0.0129\,V^{1.85}\qquad(D_f\ \text{in N},\ V\ \text{in m/s})
$$

(it reproduces the table within ≈ 3 %). Equivalently $C_F \propto D_f/V^2 \propto \Rey^{-0.15}$, close to the $\Rey^{-1/5}$ behaviour of turbulent skin friction, which makes the extrapolation physically plausible.

- $V_p = 7.7$ m/s: $D_{f,p} = 0.0129\times385^{1.85} \approx 782$ N
- $V_p = 10.3$ m/s: $D_{f,p} = 0.0129\times515^{1.85} \approx 1339$ N

**Total drag** (wave ≈ 0 + friction):

$$
D_p(7.7\ \text{m/s}) \approx 0.78\ \text{kN},\qquad D_p(10.3\ \text{m/s}) \approx 1.34\ \text{kN}
$$

**Caveat.** The answer rests on extrapolating the friction data by a factor of 20–25 in Reynolds number, so it is an estimate only (Fox p. 261 instead computes the full-scale viscous resistance from boundary-layer theory). The structure of the method — split the drag, scale each part with its own group, add — is the point of the problem.`,
        check: [
          { label: 'total drag at 7.7 m/s', value: 0.78, units: md`\mathrm{kN}`, tol: 0.1 },
          { label: 'total drag at 10.3 m/s', value: 1.34, units: md`\mathrm{kN}`, tol: 0.1 },
        ],
      },
      // ───────────────────────────── 7.68 ─────────────────────────────
      {
        id: 'fox7-68',
        concept: 'pump-scaling',
        difficulty: 2,
        src: { ...P274, note: 'Problem 7.68' },
        q: md`A centrifugal water pump running at $\omega = 800$ rpm gives:

| $Q$ (m³/h) | 0 | 100 | 150 | 200 | 250 | 300 | 325 | 350 |
|---|---|---|---|---|---|---|---|---|
| $\Delta p$ (kPa) | 361 | 349 | 328 | 293 | 230 | 145 | 114 | 59 |

The pressure head is a function of flow rate, speed, impeller diameter $D$ and water density $\rho$. (a) Describe the $\Delta p$ versus $Q$ curve. (b) Find the two Π parameters and explain how the data plot in terms of them. (c) Using a trendline fit of the Π–Π curve, generate the pressure head versus flow rate for impeller speeds of 600 rpm and 1200 rpm. (In the book this is a spreadsheet exercise; here give the fitted curves and scaled points.)`,
        hint: md`$\Pi_1 = \Delta p/(\rho\omega^2D^2)$, $\Pi_2 = Q/(\omega D^3)$. For the same pump ($D$, $\rho$ fixed), equal $\Pi_2$ and $\Pi_1$ mean $Q\propto\omega$ and $\Delta p\propto\omega^2$.`,
        answer: md`$\dfrac{\Delta p}{\rho\omega^2D^2} = f\!\left(\dfrac{Q}{\omega D^3}\right)$. Quadratic fit at 800 rpm: $\Delta p \approx 358.7 + 0.292Q - 0.003266Q^2$ (kPa, m³/h). Scaled: 600 rpm → $\Delta p \approx 201.8 + 0.219Q - 0.003266Q^2$; 1200 rpm → $\Delta p \approx 807.1 + 0.438Q - 0.003266Q^2$. Shut-off head at 1200 rpm ≈ 812 kPa (from the data point).`,
        solution: md`**(a) Head curve.** $\Delta p$ falls slowly from 361 kPa at shut-off ($Q = 0$) and then ever more steeply, reaching 59 kPa at 350 m³/h — the typical drooping centrifugal-pump characteristic of Fig. 7.5.

**(b) Π groups.** $\Delta p, Q, \omega, D, \rho$: five parameters, three dimensions → two groups. With $\rho, \omega, D$ repeating:

$$
\Pi_1 = \frac{\Delta p}{\rho\,\omega^2D^2}\ (\text{head coefficient, with } h = \Delta p/\rho),\qquad \Pi_2 = \frac{Q}{\omega D^3}\ (\text{flow coefficient})
$$

so $\Pi_1 = f(\Pi_2)$, the dimensionless form of Eq. 7.17 with viscous effects neglected. $D$ is not given, but for this one pump $D$ and $\rho$ are constants, so plotting $\Delta p/\omega^2$ against $Q/\omega$ (with $\omega$ in rad/s, $800\ \text{rpm} = 83.8$ rad/s) gives the same curve shape up to constant factors $\rho D^2$ and $D^3$.

**Trendline.** A least-squares quadratic through the eight points at 800 rpm gives

$$
\Delta p \approx 358.7 + 0.292\,Q - 0.003266\,Q^2\qquad(\Delta p\ \text{in kPa},\ Q\ \text{in m}^3/\text{h})
$$

(it reproduces the data within about 8 kPa). In Π form this is $\Pi_1 = a_0 + a_1\Pi_2 + a_2\Pi_2^2$.

**(c) Other speeds.** Equal $\Pi_2$ ⇒ $Q_2 = Q_1(\omega_2/\omega_1)$; equal $\Pi_1$ ⇒ $\Delta p_2 = \Delta p_1(\omega_2/\omega_1)^2$. Substituting into the fit, the coefficients scale as $r^2$, $r$ and $1$ with $r = \omega_2/\omega_1$:

$$
\Delta p_{(r)} = 358.7\,r^2 + 0.292\,r\,Q - 0.003266\,Q^2
$$

- 600 rpm ($r = 0.75$): $\Delta p \approx 201.8 + 0.219Q - 0.003266Q^2$
- 1200 rpm ($r = 1.5$): $\Delta p \approx 807.1 + 0.438Q - 0.003266Q^2$

Scaled data points:

| 800 rpm $(Q, \Delta p)$ | 600 rpm | 1200 rpm |
|---|---|---|
| (0, 361) | (0, 203.1) | (0, 812.3) |
| (100, 349) | (75, 196.3) | (150, 785.3) |
| (200, 293) | (150, 164.8) | (300, 659.3) |
| (300, 145) | (225, 81.6) | (450, 326.3) |
| (350, 59) | (262.5, 33.2) | (525, 132.8) |

Plotted in Π form, all three sets collapse onto the single 800-rpm curve — the essence of the pump "laws" (Eqs. 7.19–7.20).`,
        check: [
          { label: 'shut-off Δp at 1200 rpm', value: 812, units: md`\mathrm{kPa}`, tol: 0.02 },
          { label: 'Δp at 600 rpm for the 300 m³/h point (now Q = 225)', value: 81.6, units: md`\mathrm{kPa}`, tol: 0.02 },
        ],
      },
      // ───────────────────────────── 7.69 ─────────────────────────────
      {
        id: 'fox7-69',
        concept: 'pump-scaling',
        difficulty: 2,
        src: { ...P274, note: 'Problem 7.69' },
        q: md`An axial-flow pump must deliver $0.75\ \mathrm{m^3/s}$ of water at a head of 15 J/kg. Its rotor diameter is 0.25 m and it is driven at 500 rpm. The prototype is to be modelled on a small test apparatus with a 2.25 kW, 1000 rpm power supply. For similar performance between prototype and model, find the model's head, volume flow rate and diameter.`,
        hint: md`Prototype fluid power $\mathcal{P} = \rho Qh$. Equal power coefficients $\mathcal{P}/(\rho\omega^3D^5)$ fix $D_m$; then use Eqs. 7.19–7.20. Assume equal efficiencies (so the power ratio is the same for shaft and fluid power).`,
        answer: md`$D_m \approx 0.120$ m, $h_m \approx 13.7$ J/kg, $Q_m \approx 0.164\ \mathrm{m^3/s}$.`,
        solution: md`**Prototype power.** $\mathcal{P}_p = \rho Q_ph_p = 1000\times0.75\times15 = 11.25$ kW (water, $\rho = 1000\ \mathrm{kg/m^3}$). *Assumption:* model and prototype have the same efficiency, so the 2.25 kW available is in the same proportion to the model's fluid power as 11.25 kW is to the prototype's; the same water is used ($\rho_m = \rho_p$).

**Diameter from the power coefficient (Eq. 7.21):**

$$
\frac{\mathcal{P}_m}{\rho\omega_m^3D_m^5} = \frac{\mathcal{P}_p}{\rho\omega_p^3D_p^5}\;\Rightarrow\; D_m = D_p\left(\frac{\mathcal{P}_m}{\mathcal{P}_p}\right)^{1/5}\left(\frac{\omega_p}{\omega_m}\right)^{3/5}
$$

$$
D_m = 0.25\times\left(\frac{2.25}{11.25}\right)^{1/5}\left(\frac{500}{1000}\right)^{3/5} = 0.25\times0.725\times0.660 = 0.120\ \text{m}
$$

**Head (Eq. 7.20):**

$$
h_m = h_p\left(\frac{\omega_m}{\omega_p}\right)^2\left(\frac{D_m}{D_p}\right)^2 = 15\times2^2\times\left(\frac{0.1195}{0.25}\right)^2 = 13.7\ \text{J/kg}
$$

**Flow rate (Eq. 7.19):**

$$
Q_m = Q_p\,\frac{\omega_m}{\omega_p}\left(\frac{D_m}{D_p}\right)^3 = 0.75\times2\times\left(\frac{0.1195}{0.25}\right)^3 = 0.164\ \mathrm{m^3/s}
$$

**Check:** $\rho Q_mh_m = 1000\times0.164\times13.72 = 2250$ W ✓.`,
        check: [
          { label: 'model head', value: 13.7, units: md`\mathrm{J/kg}`, tol: 0.02 },
          { label: 'model flow rate', value: 0.164, units: md`\mathrm{m^3/s}`, tol: 0.02 },
          { label: 'model diameter', value: 0.120, units: md`\mathrm{m}`, tol: 0.02 },
        ],
      },
      // ───────────────────────────── 7.70 ─────────────────────────────
      {
        id: 'fox7-70',
        concept: 'similarity-types',
        difficulty: 1,
        src: { ...P274, note: 'Problem 7.70' },
        q: md`A geometrically similar model of a spillway is built at a scale of 1/30. The model discharge per metre of spillway length is $1/5\ \mathrm{m^3/s}$. Find the discharge per metre length of the prototype.`,
        hint: md`A spillway is a free-surface, gravity-driven flow → Froude similarity, $V\propto L^{1/2}$. Discharge per unit length $q = V\times$depth $\propto L^{3/2}$.`,
        answer: md`$q_p = q_m(30)^{3/2} = 0.2\times164.3 \approx 32.9\ \mathrm{m^3/s}$ per metre.`,
        solution: md`**Governing group.** Flow over a spillway is driven by gravity with a free surface, so dynamic similarity requires equal Froude numbers $V/\sqrt{gL}$ (viscous effects are small at the large Reynolds numbers involved — the Re mismatch is accepted).

**Velocity ratio:** $\dfrac{V_p}{V_m} = \left(\dfrac{L_p}{L_m}\right)^{1/2} = \sqrt{30}$.

**Discharge per unit length** $q = Q/b$ has dimensions $\dimL^2\dimT^{-1}$: it equals velocity × depth, so

$$
\frac{q_p}{q_m} = \frac{V_p}{V_m}\,\frac{L_p}{L_m} = \left(\frac{L_p}{L_m}\right)^{3/2} = 30^{1.5} = 164.3
$$

$$
q_p = 0.2\times164.3 = 32.9\ \mathrm{m^3/s}\ \text{per metre}
$$`,
        check: [{ label: 'prototype discharge per metre', value: 32.9, units: md`\mathrm{m^2/s}`, tol: 0.02 }],
      },
      // ───────────────────────────── 7.72 ─────────────────────────────
      {
        id: 'fox7-72',
        concept: 'model-testing',
        difficulty: 2,
        src: [{ ...P274, note: 'Problem 7.72' }, { doc: 'fox', pages: '268', note: 'NASA-Ames facility data' }],
        q: md`Closed-circuit wind tunnels reach higher speeds than open-circuit tunnels for the same power input, because the diffuser downstream of the test section recovers energy. The *kinetic energy ratio* is a figure of merit: the kinetic-energy flux in the test section divided by the drive power. Estimate it for the 12.2 m × 24.4 m wind tunnel at NASA-Ames. (The problem points to a facility description on another page; the description in this edition, p. 268, gives a 93 255 kW drive and a maximum speed of 154 m/s for the 12 × 24 m section.)`,
        hint: md`Kinetic-energy flux $= \int \tfrac12V^2\,\rho V\,dA = \tfrac12\rho V^3A$ for uniform flow. Use standard air, $\rho = 1.23\ \mathrm{kg/m^3}$.`,
        answer: md`KE flux $\approx 6.69\times10^8$ W; ratio $\approx 669/93.3 \approx 7.2$.`,
        solution: md`**Data.** Test section $A = 12.2\times24.4 = 297.7\ \mathrm{m^2}$ (dimensions as stated in the problem); maximum speed $V = 154$ m/s and drive power $\mathcal{P} = 93\,255$ kW from the facility description on p. 268. *Assumption:* standard air, $\rho = 1.23\ \mathrm{kg/m^3}$, uniform velocity across the test section, and the full drive power used for this section.

**Kinetic-energy flux** through the test section (mass flux $\rho VA$ times kinetic energy per unit mass $V^2/2$):

$$
\dot E_{KE} = \tfrac12\rho V^3A = 0.5\times1.23\times154^3\times297.7 = 6.69\times10^8\ \text{W}
$$

**Kinetic energy ratio:**

$$
\text{KER} = \frac{\dot E_{KE}}{\mathcal{P}} = \frac{6.69\times10^8}{9.33\times10^7} \approx 7.2
$$

**Interpretation.** The air in the test section carries about seven times more kinetic-energy flux than the motors supply: in a closed circuit most of that energy is recovered by the diffuser and returned, and the drive only makes up the losses (wall friction, turning vanes, screens, diffuser losses). An open-circuit tunnel dumps the jet's kinetic energy, so its ratio cannot exceed about 1.`,
        check: [{ label: 'kinetic energy ratio', value: 7.17, tol: 0.03 }],
      },
      // ───────────────────────────── 7.73 ─────────────────────────────
      {
        id: 'fox7-73',
        concept: 'model-testing',
        difficulty: 3,
        src: [{ ...P274, note: 'Problem 7.73' }, { doc: 'fox', pages: '267', note: 'test-section pressure gradients' }],
        q: md`A 1:16 model of a 20-m long truck is tested in a wind tunnel at 80 m/s, where the axial static-pressure gradient is $-11.17\ \mathrm{N/m^2}$ per metre. The prototype frontal area is $9.9\ \mathrm{m^2}$. Estimate the horizontal buoyancy correction and express it as a fraction of the measured drag coefficient, $C_D = 0.85$.`,
        hint: md`A linear pressure field exerts a net force $-(dp/dx)\,\mathcal{V}$ on a body of volume $\mathcal{V}$ (divergence theorem — supplementary result). Approximate the model volume as frontal area × length.`,
        answer: md`Model: $L = 1.25$ m, $A = 0.0387\ \mathrm{m^2}$, $\mathcal{V}\approx0.0483\ \mathrm{m^3}$. Buoyancy force ≈ 0.54 N downstream, vs measured drag ≈ 129 N: $\Delta C_D/C_D \approx 0.0042$ (0.42 %), i.e. $\Delta C_D\approx0.0035$.`,
        solution: md`**Horizontal buoyancy (supplementary derivation — the formula is not printed in the book).** Fox p. 267 warns that a test-section pressure gradient gives erroneous drag readings. Suppose the undisturbed static pressure varies linearly, $p = p_0 + (dp/dx)\,x$. The net pressure force on a closed body of volume $\mathcal{V}$ is, by the divergence theorem,

$$
\vb{F} = -\oint_S p\,\vb{n}\,dA = -\int_{\mathcal{V}}\nabla p\,d\mathcal{V}\;\Rightarrow\; F_{HB} = -\frac{dp}{dx}\,\mathcal{V}
$$

exactly like Archimedes' buoyancy with $dp/dx$ in place of $-\rho g$. With $dp/dx<0$ (pressure falling downstream as the wall boundary layers grow), $F_{HB}$ points **downstream** and adds to the measured "drag", so it must be subtracted.

**Model size.** $L_m = 20/16 = 1.25$ m; $A_m = 9.9/16^2 = 0.0387\ \mathrm{m^2}$. *Assumption:* the truck is a prism of constant frontal area, $\mathcal{V}_m\approx A_mL_m = 0.0483\ \mathrm{m^3}$.

**Buoyancy force:**

$$
F_{HB} = 11.17\times0.0483 = 0.540\ \text{N}
$$

**Measured drag** (standard air, $\rho = 1.23\ \mathrm{kg/m^3}$, assumed): $\tfrac12\rho V^2 = 0.5\times1.23\times80^2 = 3936$ Pa, so

$$
F_D = C_D\,\tfrac12\rho V^2A_m = 0.85\times3936\times0.0387 = 129.4\ \text{N}
$$

**Correction as a fraction of $C_D$:**

$$
\frac{\Delta C_D}{C_D} = \frac{F_{HB}}{F_D} = \frac{(-dp/dx)\,L_m}{C_D\,\tfrac12\rho V^2} = \frac{11.17\times1.25}{0.85\times3936} = 0.0042
$$

i.e. $\Delta C_D\approx0.0035$: the measured $C_D = 0.85$ is about 0.4 % too high, and the corrected value is $\approx0.846$. Small here, but it grows for long models and low test speeds (the ratio is independent of $A$ but $\propto L/V^2$).`,
        check: [
          { label: 'buoyancy force', value: 0.54, units: md`\mathrm{N}`, tol: 0.03 },
          { label: 'fraction of C_D', value: 0.0042, tol: 0.03 },
        ],
      },
      // ───────────────────────────── 7.75 ─────────────────────────────
      {
        id: 'fox7-75',
        concept: 'model-testing',
        difficulty: 2,
        src: [{ ...P274, note: 'Problem 7.75' }, { doc: 'fox', pages: '263–264', note: 'Example 7.5' }],
        q: md`A 1:16 model of a bus is tested in a wind tunnel in standard air. The model is 154 mm wide, 204 mm high and 768 mm long. The measured drag is 6.18 N at a wind speed of 28.5 m/s, and the longitudinal pressure gradient in the test section is $-12.4\ \mathrm{N/m^2/m}$. (a) Estimate the correction to the measured drag for horizontal buoyancy. (b) Calculate the model drag coefficient. (c) Evaluate the aerodynamic drag on the prototype at 120 km/h on a calm day.`,
        hint: md`$F_{HB} = -(dp/dx)\,\mathcal{V}$ with $\mathcal{V}\approx$ width × height × length (box assumption). Subtract it, then $C_D = F/(\tfrac12\rho V^2A)$ with $A$ = width × height.`,
        answer: md`(a) $F_{HB}\approx0.30$ N, corrected drag ≈ 5.88 N. (b) $C_D\approx0.375$ (0.394 uncorrected). (c) $A_p\approx8.04\ \mathrm{m^2}$, $F_{D_p}\approx2.06$ kN.`,
        solution: md`*Assumptions:* standard air $\rho = 1.23\ \mathrm{kg/m^3}$, $\nu = 1.46\times10^{-5}\ \mathrm{m^2/s}$; the model is treated as a rectangular box for its volume and frontal area; the horizontal-buoyancy formula $F_{HB} = -(dp/dx)\,\mathcal{V}$ is the supplementary result derived in Problem 7.73.

**(a) Buoyancy correction.** $\mathcal{V} = 0.154\times0.204\times0.768 = 0.0241\ \mathrm{m^3}$:

$$
F_{HB} = 12.4\times0.0241 = 0.299\ \text{N (downstream)}
$$

Corrected drag: $F_D = 6.18 - 0.30 = 5.88$ N (a 4.8 % correction — much larger than in 7.73 because the speed is low).

**(b) Drag coefficient.** $A_m = 0.154\times0.204 = 0.0314\ \mathrm{m^2}$, $\tfrac12\rho V^2 = 0.5\times1.23\times28.5^2 = 499.5$ Pa:

$$
C_D = \frac{5.88}{499.5\times0.0314} = 0.375\qquad(\text{uncorrected: } 6.18/15.69 = 0.394)
$$

**(c) Prototype drag.** $A_p = 16^2\times0.0314 = 8.04\ \mathrm{m^2}$, $V_p = 120/3.6 = 33.3$ m/s. Taking $C_{D_p} = C_{D_m}$ (bluff body, $C_D$ independent of Re at high Re — incomplete similarity, as in Example 7.5):

$$
F_{D_p} = 0.375\times0.5\times1.23\times33.3^2\times8.04 = 2.06\times10^3\ \text{N}
$$

(Power at 120 km/h: $2.06\ \text{kN}\times33.3\ \text{m/s}\approx69$ kW.)

**Caution.** The model Reynolds number is only $\Rey_m = 28.5\times0.154/1.46\times10^{-5} = 3.0\times10^5$, below the $\approx4\times10^5$ at which Example 7.5 found $C_D$ to level off, so the assumption $C_{D_p} = C_{D_m}$ is somewhat optimistic; a higher test speed would be better.`,
        check: [
          { label: 'buoyancy correction', value: 0.299, units: md`\mathrm{N}`, tol: 0.03 },
          { label: 'model C_D', value: 0.375, tol: 0.02 },
          { label: 'prototype drag', value: 2.06, units: md`\mathrm{kN}`, tol: 0.02 },
        ],
      },
    ],
    quiz: [
      {
        id: 'fox7d-q1',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.58' },
        q: md`A 1:10 boat model is to match **both** the Froude and Reynolds numbers of the prototype. What must the model fluid's kinematic viscosity be, relative to the prototype's?`,
        options: [md`$\nu_m = (0.1)^{3/2}\,\nu_p \approx 0.032\,\nu_p$`, md`$\nu_m = 0.1\,\nu_p$`, md`$\nu_m = \nu_p$`, md`$\nu_m = (0.1)^{1/2}\,\nu_p \approx 0.32\,\nu_p$`],
        answer: 0,
        explain: md`Froude fixes $V_m/V_p = (L_m/L_p)^{1/2}$; Reynolds then needs $\nu_m/\nu_p = (V_m/V_p)(L_m/L_p) = (L_m/L_p)^{3/2}$. Writing $0.1$ forgets that the speed is also scaled down; $0.32$ is only the velocity ratio. No practical liquid is 30 times less viscous than water, which is why ship tests are run at Froude similarity only.`,
      },
      {
        id: 'fox7d-q2',
        concept: 'model-testing',
        difficulty: 2,
        src: [{ ...P274, note: 'Problems 7.73, 7.75' }, { doc: 'fox', pages: '267' }],
        q: md`In a wind-tunnel test section the static pressure decreases in the flow direction ($dp/dx < 0$). How does this affect the drag measured on a model, and how is it corrected?`,
        options: [
          md`The pressure gradient pushes the model downstream, so the measured drag is too high; subtract $(-dp/dx)\,\mathcal{V}$`,
          md`The gradient pushes the model upstream, so the measured drag is too low; add $(-dp/dx)\,\mathcal{V}$`,
          md`A pressure gradient only changes lift, never drag`,
          md`The error is removed automatically by using the corrected dynamic pressure $\tfrac12\rho V^2$`,
        ],
        answer: 0,
        explain: md`Pressure is higher on the upstream face than the downstream face, giving a net force $-(dp/dx)\mathcal{V}$ in the flow direction ("horizontal buoyancy"). The balance cannot tell it from drag, so it is subtracted. The sign trap: with $dp/dx<0$ the force is positive (downstream), not upstream.`,
      },
      {
        id: 'fox7d-q3',
        concept: 'pump-scaling',
        difficulty: 1,
        src: { ...P274, note: 'Problem 7.66' },
        q: md`Two geometrically similar fans operate at dynamically similar points. Fan 2 must deliver more flow at a lower speed than fan 1. Which relation fixes its diameter?`,
        options: [md`$D_2 = D_1\left(\dfrac{Q_2\,\omega_1}{Q_1\,\omega_2}\right)^{1/3}$`, md`$D_2 = D_1\,\dfrac{Q_2\,\omega_1}{Q_1\,\omega_2}$`, md`$D_2 = D_1\left(\dfrac{Q_2\,\omega_2}{Q_1\,\omega_1}\right)^{1/3}$`, md`$D_2 = D_1\left(\dfrac{Q_2}{Q_1}\right)^{1/2}$`],
        answer: 0,
        explain: md`Equal flow coefficient $Q/(\omega D^3)$ (Eq. 7.19) gives $D^3\propto Q/\omega$. Forgetting the cube root, or putting $\omega$ in the numerator, are the common slips; the square-root form would come from a velocity × area argument that ignores speed.`,
      },
    ],
  },
  {
    id: 'fox7d-dimensionless-groups',
    topic: 'dimensionless-groups',
    title: "Fox & McDonald's Ch. 7 — Problems 7.62–7.74: pressure coefficient, cavitation, Weber number and force ratios",
    src: { doc: 'fox', pages: '273–274' },
    intro: md`Four problems from the model-study group that are really about what individual dimensionless groups mean: $C_p$ and the cavitation number, when the Reynolds number drops out, Weber-number scaling of drops, and why a flag flaps.`,
    problems: [
      // ───────────────────────────── 7.62 ─────────────────────────────
      {
        id: 'fox7-62',
        concept: 'common-groups',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.62' },
        q: md`Water flows around a circular cylinder of diameter $D$ and length $l$. Besides geometry, the drag force depends on the liquid speed $V$, density $\rho$ and viscosity $\mu$. (a) Express the drag $F_D$ in dimensionless form as a function of all relevant variables. (b) Laboratory measurements of the static pressure on a cylinder, expressed as a pressure coefficient, show a minimum of $C_p = -2.8$ at the point of minimum static pressure. If cavitation begins at a cavitation number of 0.7, estimate the maximum speed at which a cylinder could be towed in water at atmospheric pressure without cavitation.`,
        hint: md`(a) Six parameters, three dimensions → three groups. (b) $p_{min} = p_\infty + C_p\tfrac12\rho V^2$; set $(p_{min}-p_v)/(\tfrac12\rho V^2) = 0.7$. Assume water at 20°C: $\rho = 998\ \mathrm{kg/m^3}$, $p_v = 2.34$ kPa.`,
        answer: md`(a) $\dfrac{F_D}{\tfrac12\rho V^2Dl} = f\!\left(\dfrac{\rho VD}{\mu},\ \dfrac{l}{D}\right)$. (b) $V_{max} = \sqrt{\dfrac{2(p_{atm}-p_v)}{\rho\,(Ca - C_p)}} \approx 7.5$ m/s (≈ 27 km/h).`,
        solution: md`**(a) Dimensionless drag.** Parameters $F_D, D, l, V, \rho, \mu$: $n = 6$, $r = 3$ → three groups. With $\rho, V, D$ repeating:

$$
\Pi_1 = \frac{F_D}{\rho V^2D^2}\ \text{(or } C_D = \frac{F_D}{\tfrac12\rho V^2Dl}\text{ using the projected area } Dl),\quad \Pi_2 = \frac{\rho VD}{\mu} = \Rey,\quad \Pi_3 = \frac{l}{D}
$$

$$
C_D = \frac{F_D}{\tfrac12\rho V^2Dl} = f\!\left(\Rey,\ \frac{l}{D}\right)
$$

**(b) Cavitation limit.** The pressure coefficient is the Euler number based on the local-minus-freestream pressure, $C_p = (p - p_\infty)/(\tfrac12\rho V^2)$, so the lowest surface pressure is

$$
p_{min} = p_\infty + C_p\,\tfrac12\rho V^2 = p_\infty - 2.8\,\tfrac12\rho V^2
$$

The cavitation number (Eq. 7.13) uses $p - p_v$; applied at the minimum-pressure point, cavitation begins when

$$
\frac{p_{min}-p_v}{\tfrac12\rho V^2} = 0.7 \;\Rightarrow\; p_\infty - p_v = (0.7 + 2.8)\,\tfrac12\rho V^2 = 3.5\,\tfrac12\rho V^2
$$

*Assumed properties:* water at 20°C, $\rho = 998\ \mathrm{kg/m^3}$, $p_v = 2.34$ kPa; $p_\infty = 101.3$ kPa. Then

$$
V_{max} = \sqrt{\frac{2(p_\infty - p_v)}{3.5\,\rho}} = \sqrt{\frac{2\times(101\,325-2340)}{3.5\times998}} = 7.53\ \text{m/s}
$$

Towing faster than about 7.5 m/s (27 km/h) would cavitate near the shoulders of the cylinder, where the flow is fastest. (Depth below the surface would raise $p_\infty$ and the limit.)`,
        check: [{ label: 'maximum towing speed', value: 7.53, units: md`\mathrm{m/s}`, tol: 0.02 }],
      },
      // ───────────────────────────── 7.63 ─────────────────────────────
      {
        id: 'fox7-63',
        concept: 'force-ratios',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.63' },
        q: md`A circular container partly filled with water is rotated about its axis at constant angular speed $\omega$. At any time $\tau$ after rotation starts, the speed $V_\theta$ at radius $r$ is found to depend on $\tau$, $\omega$ and the liquid's properties. (a) Write the dimensionless parameters that characterize the problem. (b) If honey is rotated in the same cylinder at the same $\omega$, use these parameters to decide whether honey reaches steady motion as quickly as water. (c) Explain why the Reynolds number would not be an important parameter in scaling the **steady-state** motion of the liquid.`,
        hint: md`Liquid properties: $\rho$ and $\mu$. Seven parameters with $R$ (container radius) included, or six without; repeating $\rho$, $\omega$, $r$. What does the liquid do once it rotates like a solid body?`,
        answer: md`(a) $\dfrac{V_\theta}{\omega r} = f\!\left(\omega\tau,\ \dfrac{\mu}{\rho\omega r^2}\right)$ (plus $r/R$ if the container radius is included). (b) Honey's $\nu$ is ~$10^3$–$10^4$ times water's, so the viscous group is much larger and honey spins up much **faster**. (c) At steady state the liquid rotates as a rigid body, $V_\theta = \omega r$: no relative motion, no viscous stress, so $\mu$ (and Re) drop out.`,
        solution: md`**(a) Π groups.** Parameters $V_\theta, r, \tau, \omega, \rho, \mu$: $n = 6$, $r_{dim} = 3$ ($\dimM\dimL\dimT$) → three groups. Repeating $\rho, \omega, r$:

$$
\Pi_1 = \frac{V_\theta}{\omega r},\qquad \Pi_2 = \omega\tau,\qquad \Pi_3 = \frac{\mu}{\rho\,\omega r^2} = \frac{\nu}{\omega r^2}
$$

so $\dfrac{V_\theta}{\omega r} = f\!\left(\omega\tau,\ \dfrac{\nu}{\omega r^2}\right)$. $\Pi_3$ is an inverse rotational Reynolds number ($\Rey = \omega r^2/\nu$). If the container radius $R$ and liquid depth are added, $r/R$ and depth/$R$ appear as geometric groups.

**(b) Honey versus water.** *Assumed order-of-magnitude properties:* water $\nu\approx1\times10^{-6}\ \mathrm{m^2/s}$; honey $\mu\sim10$ Pa·s, $\rho\approx1400\ \mathrm{kg/m^3}$, so $\nu\sim7\times10^{-3}\ \mathrm{m^2/s}$ — several thousand times larger. In the same container at the same $\omega$, $\Pi_3$ is therefore thousands of times larger for honey.

Spin-up happens because the walls drag the liquid along by viscous shear; the viscous group measures how strong that coupling is relative to the rotation. For a given $\Pi_1$ (say 99 % of rigid rotation), the dimensionless time $\omega\tau$ needed falls as $\Pi_3$ rises. For example, if momentum spreads inward by viscous diffusion, $\tau\sim r^2/\nu$, i.e. $\omega\tau\sim\Pi_3^{-1}$. So **honey reaches steady motion much sooner than water**, not as quickly — the opposite of what "thick and sluggish" intuition suggests. (Real spin-up in a container with a bottom is accelerated by Ekman layers, $\tau\sim H/\sqrt{\nu\omega}$, but the conclusion is the same.)

**(c) Steady state.** Once spin-up is complete the liquid turns with the container as a **rigid body**, $V_\theta = \omega r$ (i.e. $\Pi_1 = 1$ for all $\Pi_3$). In rigid-body motion there is no relative motion between fluid layers, so the shear stress — the only place $\mu$ enters — is zero. Re is a ratio of inertia to viscous forces; with viscous forces identically zero it cannot affect the result, and the steady free-surface shape (a paraboloid, set by $\omega^2r^2/2g$) is the same for water and honey.`,
        check: [{ label: 'number of Π groups (without R)', value: 3, tol: 0.01 }],
      },
      // ───────────────────────────── 7.71 ─────────────────────────────
      {
        id: 'fox7-71',
        concept: 'common-groups',
        difficulty: 2,
        src: { ...P274, note: 'Problem 7.71' },
        q: md`Water drops are produced by a mechanism believed to follow $d_p = D\,(\We)^{-3/5}$, where $d_p$ is the drop size, $D$ is proportional to a length scale and $\We$ is the Weber number. In scaling up, the large-scale characteristic length is increased by a factor of 20 and the large-scale velocity is decreased by a factor of 5. How would the small- and large-scale drops differ for the same liquid (for example, water)?`,
        hint: md`$\We = \rho V^2L/\sigma$ (Eq. 7.15). Same liquid → $\rho$, $\sigma$ unchanged. Form the ratio $d_{p,large}/d_{p,small}$.`,
        answer: md`$\We_{large}/\We_{small} = (1/5)^2\times20 = 0.8$, so $d_{large}/d_{small} = 20\times0.8^{-3/5} \approx 22.9$: the large-scale drops are about 23 times bigger.`,
        solution: md`**Weber number** (inertia / surface tension, Eq. 7.15): $\We = \dfrac{\rho V^2L}{\sigma}$.

Same liquid, so $\rho$ and $\sigma$ cancel in the ratio:

$$
\frac{\We_{large}}{\We_{small}} = \left(\frac{V_{large}}{V_{small}}\right)^2\frac{L_{large}}{L_{small}} = \left(\frac15\right)^2\times20 = 0.8
$$

**Drop size.** $D\propto L$, so

$$
\frac{d_{p,large}}{d_{p,small}} = \frac{L_{large}}{L_{small}}\left(\frac{\We_{large}}{\We_{small}}\right)^{-3/5} = 20\times(0.8)^{-0.6} = 20\times1.143 = 22.9
$$

**Interpretation.** The large-scale drops are about 23 times larger. Geometric scaling alone would make them 20 times larger; in addition the large device has a slightly *smaller* Weber number (inertia less dominant over surface tension, which holds drops together), so the drops break up less and come out a further 14 % bigger. Because $\We$ is not matched, the two devices are not dynamically similar and the drop-size ratio differs from the length ratio.`,
        check: [{ label: 'd_large / d_small', value: 22.9, tol: 0.02 }],
      },
      // ───────────────────────────── 7.74 ─────────────────────────────
      {
        id: 'fox7-74',
        concept: 'force-ratios',
        difficulty: 1,
        src: { ...P274, note: 'Problem 7.74' },
        q: md`A flag on a pole is often seen flapping in the wind. Explain why this happens.`,
        hint: md`Think about what the pole does to the wind at $\Rey = VD/\nu$ of order $10^3$–$10^4$, and whether a thin, flexible sheet aligned with the flow is a stable equilibrium.`,
        answer: md`The pole sheds a von Kármán vortex street (alternating vortices at $f\approx0.2V/D$), which gives the flag a periodic side load; and a flexible sheet in a stream is itself unstable (flutter): any small bend creates pressure differences that amplify it, while the sheet's inertia carries it past equilibrium. Steady straight trailing is therefore not stable, and the flag waves.`,
        solution: md`*This answer is supplementary physical reasoning — the book gives none.*

**1. Vortex shedding from the pole.** A pole of diameter $D$ in a wind $V$ has $\Rey = VD/\nu$ of order $10^3$–$10^4$ (e.g. $5\times0.05/1.5\times10^{-5}\approx1.7\times10^4$). In this range the wake is a **von Kármán vortex street**: vortices peel off alternately from each side at a frequency given by a Strouhal number $\mathrm{St} = fD/V\approx0.2$. Each vortex produces a side-to-side pressure difference, so the flag attached behind the pole is pushed alternately left and right — a periodic forcing.

**2. Flutter of a flexible sheet.** Even without the pole, a thin, flexible membrane aligned with a stream is unstable. If part of the flag bends slightly, the flow around the bend speeds up on the convex side (lower pressure) and slows on the concave side, so the pressure difference pushes the bend *further* out. The sheet's own inertia then carries it past the neutral position and the process reverses, producing travelling waves that run toward the free edge and grow in amplitude there. The flag has almost no bending stiffness to resist this, so aerodynamic (inertia) forces dominate elastic restoring forces.

**3. In dimensionless terms.** Flapping is governed by force ratios: Re (inertia/viscous) is large enough for vortex shedding, the Strouhal number sets the shedding frequency, and the ratio of fluid inertia ($\rho V^2$) to the cloth's bending stiffness and mass is large, so the straight position is not a stable equilibrium. Stronger wind → higher $f$ and more vigorous flapping, as observed.`,
      },
    ],
    quiz: [
      {
        id: 'fox7d-q4',
        concept: 'force-ratios',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.63' },
        q: md`Liquid in a container rotating steadily at $\omega$ has reached rigid-body rotation. Why does the Reynolds number not affect this steady state?`,
        options: [
          md`With no relative motion between fluid layers the viscous stress is zero, so viscosity cannot enter`,
          md`Because Re is always very large in rotating flows, so viscosity is negligible`,
          md`Because gravity dominates, so only the Froude number matters at any time`,
          md`Because Re is not defined for rotating flows`,
        ],
        answer: 0,
        explain: md`In rigid-body rotation $V_\theta = \omega r$ for any liquid — water or honey — because the strain rate is zero and so is the shear stress. Re (inertia/viscous) only matters while there is shear, i.e. during spin-up. The "Re is large" argument is wrong: honey can have small Re yet the same steady state.`,
      },
      {
        id: 'fox7d-q5',
        concept: 'common-groups',
        difficulty: 2,
        src: { ...P273, note: 'Problem 7.62' },
        q: md`A body with minimum $C_p = -2.8$ is towed faster in water at atmospheric pressure. What happens to the cavitation risk, and why?`,
        options: [
          md`It increases: $p_\infty - p_v$ is fixed while $\tfrac12\rho V^2$ grows, so the cavitation number at the minimum-pressure point falls`,
          md`It decreases: a faster flow raises the stagnation pressure everywhere on the body`,
          md`It is unchanged, because $C_p$ is independent of speed`,
          md`It increases only if the Reynolds number exceeds $2\times10^5$`,
        ],
        answer: 0,
        explain: md`$C_p$ being constant means the pressure *drop* $-C_p\tfrac12\rho V^2$ grows as $V^2$, so $p_{min}$ falls toward $p_v$. The cavitation number $(p_{min}-p_v)/\tfrac12\rho V^2 = (p_\infty-p_v)/\tfrac12\rho V^2 + C_p$ decreases with speed; smaller cavitation number means cavitation is more likely.`,
      },
    ],
  },
]
