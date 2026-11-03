import type { ProblemSet } from '@/lib/types'
import { md } from '@/kit'

/*
 * Fox & McDonald's, Chapter 7 end-of-chapter problems 7.38–7.56 (printed pp. 272–273),
 * "Flow Similarity and Model Studies". The book prints statements only; every solution below
 * was written for this platform. Fluid properties are NOT in the source excerpt (they come from
 * the book's appendices), so each solution states the standard values it assumes.
 */

const P272 = (n: string) => ({ doc: 'fox' as const, pages: '272', note: `Problem ${n}` })
const P273 = (n: string) => ({ doc: 'fox' as const, pages: '273', note: `Problem ${n}` })

export const sets: ProblemSet[] = [
  /* ------------------------------------------------------------------ */
  /*  Similitude: model studies 7.38–7.56 (except 7.40, 7.45)            */
  /* ------------------------------------------------------------------ */
  {
    id: 'fox7c-similitude',
    topic: 'similitude',
    title: "Fox & McDonald's Ch. 7 — Problems 7.38–7.56: flow similarity and model studies",
    src: { doc: 'fox', pages: '272–273', note: 'Problems 7.38–7.56' },
    intro: md`Pick the Π groups that govern the flow, match the independent ones between model and prototype (or argue why one may be dropped), then scale the dependent group — the procedure of Fox §7.5 and Examples 7.4–7.6. Property values that the book takes from its appendices are stated as assumptions in each solution.`,
    problems: [
      {
        id: 'fox7-38',
        concept: 'similarity-types',
        difficulty: 2,
        src: P272('7.38'),
        q: md`A large tethered balloon will carry pollution-sampling instruments. Its designers need the drag at the highest expected wind speed, 5 m/s, in air at 20°C. A 1/20-scale model is to be tested in water at 20°C.

(a) What water speed models the prototype condition?

(b) At that speed the model drag is 2 kN. What is the drag on the prototype?`,
        hint: md`Drag of a submerged body: $F/\rho V^2L^2 = f(\rho VL/\mu)$. Match $\Rey$ using $\nu = \mu/\rho$ of each fluid, then equate $F/\rho V^2L^2$.`,
        answer: md`(a) $V_m \approx 6.6$ m/s; (b) $F_p \approx 545$ N (assuming air 20°C: $\rho=1.20$ kg/m³, $\mu=1.81\times10^{-5}$ N·s/m²; water 20°C: $\rho=998$ kg/m³, $\mu=1.00\times10^{-3}$ N·s/m²).`,
        solution: md`**Assumed properties (standard table values, not printed in the problem):** air at 20°C $\rho_p=1.20$ kg/m³, $\mu_p=1.81\times10^{-5}$ N·s/m², so $\nu_p=1.51\times10^{-5}$ m²/s; water at 20°C $\rho_m=998$ kg/m³, $\mu_m=1.00\times10^{-3}$ N·s/m², so $\nu_m=1.00\times10^{-6}$ m²/s.

**1. Governing groups.** The balloon is far from any free surface and the flow is incompressible, so (as for the sphere, Fox p.258)

$$
\frac{F}{\rho V^2L^2}=f\!\left(\frac{\rho VL}{\mu}\right)
$$

Geometric similarity plus $\Rey_m=\Rey_p$ gives dynamic similarity.

**2. Model speed.** $V_mL_m/\nu_m=V_pL_p/\nu_p$ with $L_p/L_m=20$:

$$
V_m=V_p\,\frac{L_p}{L_m}\,\frac{\nu_m}{\nu_p}=5\times20\times\frac{1.00\times10^{-6}}{1.51\times10^{-5}}=6.64\ \text{m/s}
$$

**3. Prototype drag.** Equal $F/\rho V^2L^2$:

$$
F_p=F_m\,\frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2
=2000\times\frac{1.20}{998}\times\left(\frac{5}{6.64}\right)^2\times400=545\ \text{N}
$$

**Check.** With $\Rey$ matched, $F\propto\mu^2/\rho$ (substitute $V=\Rey\,\mu/\rho L$ into $F\propto\rho V^2L^2$). So $F_p/F_m=(\mu_p^2/\rho_p)/(\mu_m^2/\rho_m)=2.73\times10^{-10}/1.00\times10^{-9}=0.272$, and $0.272\times2000=545$ N. ✓

The water model sees almost **four times** the prototype force — one reason water tunnels are attractive for low-speed air problems.`,
        check: [
          { label: 'model water speed', value: 6.64, units: 'm/s', tol: 0.03 },
          { label: 'prototype drag', value: 545, units: 'N', tol: 0.03 },
        ],
      },
      {
        id: 'fox7-39',
        concept: 'model-testing',
        difficulty: 2,
        src: P272('7.39'),
        q: md`An airship is to fly at 40 m/s through air at standard conditions. Its drag will be measured on a 1/40-scale model in a wind tunnel whose air is at the same temperature as the prototype's.

(a) What criterion must be satisfied for dynamic similarity?

(b) If the model is tested at 75 m/s, what pressure should the tunnel run at?

(c) If the model drag is then 300 N, what is the prototype drag?`,
        hint: md`At equal temperature the viscosity is the same in tunnel and atmosphere, so matching $\Rey=\rho VL/\mu$ fixes the required **density** ratio; for an ideal gas at fixed $T$, $p\propto\rho$.`,
        answer: md`(a) Equal Reynolds numbers (with geometric similarity and negligible compressibility). (b) $\rho_m/\rho_p=21.3$, so $p_m\approx2.16$ MPa (≈ 21.3 atm). (c) $F_p=6.40$ kN.`,
        solution: md`**1. Criterion.** For an incompressible flow around a submerged body $F/\rho V^2L^2=f(\rho VL/\mu)$, so dynamic similarity requires a geometrically similar model run at

$$
\Rey_m=\Rey_p\quad\Longleftrightarrow\quad \frac{\rho_mV_mL_m}{\mu_m}=\frac{\rho_pV_pL_p}{\mu_p}
$$

The model Mach number, $75/340\approx0.22$, is low enough that compressibility can still be neglected.

**2. Tunnel density.** Same temperature, so $\mu_m=\mu_p$ (viscosity of a gas hardly depends on pressure):

$$
\frac{\rho_m}{\rho_p}=\frac{V_p}{V_m}\,\frac{L_p}{L_m}=\frac{40}{75}\times40=21.3
$$

**3. Tunnel pressure.** Ideal gas at fixed $T$: $p=\rho RT\Rightarrow p_m/p_p=\rho_m/\rho_p$. With standard atmospheric pressure $p_p=101.3$ kPa (assumed):

$$
p_m=21.3\times101.3\ \text{kPa}=2.16\times10^{3}\ \text{kPa}\approx2.16\ \text{MPa}
$$

**4. Prototype drag.** Equal $F/\rho V^2L^2$:

$$
F_p=F_m\,\frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2=300\times\frac{1}{21.3}\times\left(\frac{40}{75}\right)^2\times1600=6400\ \text{N}
$$

**Check.** With $\Rey$ matched, $F\propto\mu^2/\rho$; with equal $\mu$, $F_p/F_m=\rho_m/\rho_p=21.3$, giving $6.40$ kN. ✓`,
        check: [
          { label: 'tunnel pressure', value: 2.16, units: 'MPa', tol: 0.03 },
          { label: 'prototype drag', value: 6400, units: 'N', tol: 0.02 },
        ],
      },
      {
        id: 'fox7-41',
        concept: 'model-testing',
        difficulty: 3,
        src: P272('7.41'),
        q: md`An ocean-going ship is to be propelled by a rotating circular cylinder (the wind acting on the spinning cylinder produces a propulsive side force). Model tests will be used to estimate the power needed to spin the prototype cylinder.

(a) List the parameters that should enter the dimensional analysis.

(b) Perform the analysis and identify the important dimensionless groups.`,
        hint: md`Power depends on the cylinder geometry ($D$, $L$), its spin rate $\omega$, the speed $V$ of the air relative to the ship, and the air properties $\rho$, $\mu$. Use $\rho$, $\omega$, $D$ as repeating parameters.`,
        answer: md`$\mathcal{P}=f(\omega,D,L,V,\rho,\mu)$: 7 parameters, 3 dimensions, **4 groups**:

$$
\frac{\mathcal{P}}{\rho\omega^3D^5}=g\!\left(\frac{\omega D}{V},\ \frac{\rho VD}{\mu},\ \frac{L}{D}\right)
$$`,
        solution: md`**1. Parameters (part a).** The power $\mathcal{P}$ needed to spin the cylinder against aerodynamic torque depends on

- cylinder diameter $D$ and length $L$ (geometry; surface roughness $e$ could be added as $e/D$),
- angular speed $\omega$ of the cylinder,
- speed $V$ of the air relative to the ship (wind plus ship motion),
- air density $\rho$ and viscosity $\mu$.

So $\mathcal{P}=f(\omega,D,L,V,\rho,\mu)$ with $n=7$ parameters. Bearing friction is a mechanical loss and is excluded from the fluid analysis.

**2. Dimensions** ($M$, $L$, $t$; $r=3$):

| $\mathcal{P}$ | $\omega$ | $D$ | $L$ | $V$ | $\rho$ | $\mu$ |
|---|---|---|---|---|---|---|
| $ML^2/t^3$ | $1/t$ | $L$ | $L$ | $L/t$ | $M/L^3$ | $M/(Lt)$ |

$n-r=4$ groups.

**3. Repeating parameters** $\rho,\ \omega,\ D$ (they contain $M$, $t$, $L$ and cannot form a group among themselves).

- $\Pi_1=\mathcal{P}\rho^a\omega^bD^c$: $M$: $1+a=0$; $t$: $-3-b=0$; $L$: $2-3a+c=0$ $\Rightarrow a=-1,\ b=-3,\ c=-5$, so $\Pi_1=\dfrac{\mathcal{P}}{\rho\omega^3D^5}$ (power coefficient, same form as Fox Eq. 7.18).
- $\Pi_2=V\rho^a\omega^bD^c$ $\Rightarrow\Pi_2=\dfrac{V}{\omega D}$ (we may invert it to the **spin ratio** $\omega D/V$).
- $\Pi_3=\mu\rho^a\omega^bD^c$ $\Rightarrow\Pi_3=\dfrac{\mu}{\rho\omega D^2}$; combining with $\Pi_2$ gives the Reynolds number $\rho VD/\mu$.
- $\Pi_4=L/D$ (aspect ratio).

**4. Result.**

$$
\frac{\mathcal{P}}{\rho\omega^3D^5}=g\!\left(\frac{\omega D}{V},\ \frac{\rho VD}{\mu},\ \frac{L}{D}\right)
$$

**5. Using it.** A geometrically similar model ($L/D$ equal) must be run at the prototype spin ratio $\omega D/V$; ideally $\Rey$ is matched as well, but if the rotor flow is found to be insensitive to $\Rey$ at high Reynolds number (as for many bluff bodies, Fox p.263) the power can be scaled with $\mathcal{P}_p=\mathcal{P}_m(\rho_p/\rho_m)(\omega_p/\omega_m)^3(D_p/D_m)^5$.`,
      },
      {
        id: 'fox7-42',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: P272('7.42'),
        q: md`The drag of a model automobile is measured in a towing tank filled with fresh water; the model is 1/5 the size of the prototype.

(a) State the conditions for dynamic similarity between model and prototype.

(b) At what fraction of the prototype's air speed should the water test be run for dynamic similarity?

(c) Tests at several speeds show that the dimensionless force ratio becomes constant for model speeds above $V_m=4$ m/s, where the drag is $F_{D_m}=182$ N. Estimate the drag on the prototype at 90 km/h in air.`,
        hint: md`Matching $\Rey$ gives (b). For (c), the plateau means $C_D=F/\rho V^2L^2$ no longer depends on $\Rey$; the prototype runs at a higher $\Rey$ than the 4 m/s model test, so the same $C_D$ applies.`,
        answer: md`(a) Geometric similarity and equal $\Rey$ (no free-surface waves, incompressible). (b) $V_m/V_p\approx0.33$. (c) $F_{D_p}\approx214$ N (air $\rho=1.20$ kg/m³, $\nu=1.51\times10^{-5}$ m²/s; water $\rho=998$ kg/m³, $\nu=1.00\times10^{-6}$ m²/s, both at 20°C — assumed).`,
        solution: md`**Assumed properties (20°C):** air $\rho_p=1.20$ kg/m³, $\nu_p=1.51\times10^{-5}$ m²/s; water $\rho_m=998$ kg/m³, $\nu_m=1.00\times10^{-6}$ m²/s.

**1. Conditions (a).** For a vehicle fully immersed in the test fluid (deep enough that no surface waves form) and at low Mach number,

$$
\frac{F_D}{\rho V^2L^2}=f\!\left(\frac{\rho VL}{\mu}\right)
$$

so the model must be geometrically similar (including relative roughness and ground clearance) and run at $\Rey_m=\Rey_p$.

**2. Speed fraction (b).**

$$
\frac{V_m}{V_p}=\frac{L_p}{L_m}\,\frac{\nu_m}{\nu_p}=5\times\frac{1.00\times10^{-6}}{1.51\times10^{-5}}=0.332\approx\frac13
$$

At 90 km/h = 25 m/s this would be $V_m\approx8.3$ m/s.

**3. Use of the plateau (c).** Above $V_m=4$ m/s the force ratio $F_D/\rho V^2L^2$ is constant — the drag is independent of $\Rey$, as for the bus of Example 7.5. The prototype Reynolds number is larger than the model's at 4 m/s:

$$
\frac{\Rey_p}{\Rey_m}=\frac{V_pL_p/\nu_p}{V_mL_m/\nu_m}=\frac{25\times5}{4}\times\frac{1.00\times10^{-6}}{1.51\times10^{-5}}=2.08
$$

so the prototype also lies on the plateau and the 4 m/s data can be scaled even though $\Rey$ is not matched (incomplete similarity).

**4. Prototype drag.**

$$
F_{D_p}=F_{D_m}\,\frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2=182\times\frac{1.20}{998}\times\left(\frac{25}{4}\right)^2\times25=214\ \text{N}
$$`,
        check: [
          { label: 'V_m / V_p', value: 0.332, tol: 0.03 },
          { label: 'prototype drag', value: 214, units: 'N', tol: 0.03 },
        ],
      },
      {
        id: 'fox7-43',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: P272('7.43'),
        q: md`Passengers on a cruise ship complain about propeller noise, probably caused by turbulent flow between the propellers and the hull. You will study the flow around the propellers in a 1:10-scale model in a water tank. The ship's propellers turn at 120 rpm. Estimate the model propeller speed if (a) the Froude number or (b) the Reynolds number is the governing group. Which is more likely to give the better model?`,
        hint: md`Use the blade tip speed $V\propto\omega D$ as the velocity scale. Froude: $\omega D/\sqrt{gD}$ equal. Reynolds (same water): $\omega D\cdot D/\nu$ equal.`,
        answer: md`(a) $\omega_m=120\sqrt{10}\approx379$ rpm; (b) $\omega_m=120\times10^2=12\,000$ rpm. Reynolds scaling is the physically relevant one (turbulence, no free surface at the propellers), but 12 000 rpm is hard to reach, so in practice one relies on high-$\Rey$ insensitivity.`,
        solution: md`**Velocity scale.** For a propeller the characteristic speed is the blade speed $V\propto\omega D$; $D_p/D_m=10$, and model and ship both run in water ($\nu_m=\nu_p$, $g$ the same).

**(a) Froude scaling.**

$$
\Fr=\frac{V}{\sqrt{gD}}\propto\frac{\omega D}{\sqrt{gD}}=\omega\sqrt{\frac{D}{g}}\quad\Rightarrow\quad\omega_m=\omega_p\sqrt{\frac{D_p}{D_m}}=120\sqrt{10}=379\ \text{rpm}
$$

**(b) Reynolds scaling.**

$$
\Rey=\frac{VD}{\nu}\propto\frac{\omega D^2}{\nu}\quad\Rightarrow\quad\omega_m=\omega_p\left(\frac{D_p}{D_m}\right)^2=120\times100=12\,000\ \text{rpm}
$$

**Which is better?** Froude scaling matters when **gravity waves** at a free surface dominate (ship wave resistance, Fox pp.259–261). The propellers are submerged and the suspected noise source is **turbulent, viscous** flow between propeller and hull, so the Reynolds number is the governing group. The two requirements conflict (379 vs 12 000 rpm) — the same Froude–Reynolds conflict as in ship testing — and 12 000 rpm is impractical for a model propeller. A workable compromise is to run the model as fast as practical and rely on the flow pattern becoming insensitive to $\Rey$ once the model flow is fully turbulent (if needed, with the boundary layer tripped as in Fox p.261). Cavitation, if present, would add the cavitation number as a further group.`,
        check: [
          { label: 'Froude-scaled speed', value: 379, units: 'rpm', tol: 0.02 },
          { label: 'Reynolds-scaled speed', value: 12000, units: 'rpm', tol: 0.02 },
        ],
      },
      {
        id: 'fox7-44',
        concept: 'model-testing',
        difficulty: 3,
        src: P272('7.44'),
        q: md`A 1/7-scale model of a torpedo is tested in a wind tunnel to measure drag. The prototype operates in water, has diameter 547 mm and length 7.1 m, and is to travel at 32 m/s. To avoid compressibility effects the tunnel speed is limited to 115 m/s; the tunnel pressure can be varied while the air temperature is held at 25°C.

(a) Find the minimum tunnel pressure for a dynamically similar test.

(b) At dynamically similar conditions the model drag is 628 N. Evaluate the drag on the full-scale torpedo.`,
        hint: md`Lowest pressure ↔ lowest density ↔ highest allowed speed (115 m/s). Match $\rho VL/\mu$; air viscosity is fixed by the temperature, so solve for $\rho_m$ and use $p=\rho RT$.`,
        answer: md`(a) $\rho_m\approx35.8$ kg/m³, $p_m\approx3.06$ MPa (abs). (b) $F_p\approx66.5$ kN. (Assumed: water at 20°C, $\rho=998$ kg/m³, $\nu=1.00\times10^{-6}$ m²/s; air at 25°C, $\mu=1.84\times10^{-5}$ N·s/m², $R=287$ J/kg·K.)`,
        solution: md`**Assumed properties:** sea/fresh water at 20°C, $\rho_p=998$ kg/m³, $\mu_p=1.00\times10^{-3}$ N·s/m² ($\nu_p=1.00\times10^{-6}$ m²/s); air at 25°C, $\mu_m=1.84\times10^{-5}$ N·s/m² (independent of pressure), $R=287$ J/(kg·K).

**1. Similarity requirement.** Deeply submerged torpedo (no waves, no cavitation) and an incompressible tunnel flow: $F/\rho V^2L^2=f(\rho VL/\mu)$, so $\Rey_m=\Rey_p$. Base $\Rey$ on length; $L_m=7.1/7=1.014$ m.

$$
\Rey_p=\frac{V_pL_p}{\nu_p}=\frac{32\times7.1}{1.00\times10^{-6}}=2.27\times10^{8}
$$

**2. Minimum density / pressure.** $\rho_m=\Rey_p\,\mu_m/(V_mL_m)$ is smallest at the largest allowed $V_m=115$ m/s:

$$
\rho_m=\frac{2.27\times10^{8}\times1.84\times10^{-5}}{115\times1.014}=35.8\ \text{kg/m}^3
$$

$$
p_m=\rho_mRT=35.8\times287\times298.15=3.06\times10^{6}\ \text{Pa}\approx3.06\ \text{MPa (abs)}
$$

about 30 atmospheres.

**3. Prototype drag.**

$$
F_p=F_m\,\frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{L_p}{L_m}\right)^2=628\times\frac{998}{35.8}\times\left(\frac{32}{115}\right)^2\times49=6.65\times10^{4}\ \text{N}
$$

**Check.** With $\Rey$ matched, $F\propto\mu^2/\rho$, so $F_p/F_m=(\mu_p^2/\rho_p)/(\mu_m^2/\rho_m)=(1.00\times10^{-9})/(9.46\times10^{-12})=106$, and $106\times628\ \text{N}=66.5$ kN. ✓`,
        check: [
          { label: 'minimum tunnel pressure', value: 3.06, units: 'MPa', tol: 0.03 },
          { label: 'prototype drag', value: 66.5, units: 'kN', tol: 0.03 },
        ],
      },
      {
        id: 'fox7-46',
        concept: 'similarity-types',
        difficulty: 2,
        src: P272('7.46'),
        q: md`A smooth sphere of diameter $D$ moves at speed $V$ through a fluid. A 3-m diameter weather balloon moves through air at 1.5 m/s. To find its drag, a 50-mm diameter sphere is tested in water; under dynamically similar conditions the model drag is 3.8 N. Find the model test speed and the expected drag on the full-scale balloon.`,
        hint: md`Same procedure as Example 7.4, but in reverse (prototype in air, model in water). Match $VD/\nu$, then equate $F/\rho V^2D^2$.`,
        answer: md`$V_m\approx6.2$ m/s; $F_p\approx0.99$ N (assumed standard air $\rho=1.23$ kg/m³, $\nu=1.46\times10^{-5}$ m²/s; water at 20°C $\rho=998$ kg/m³, $\nu=1.00\times10^{-6}$ m²/s).`,
        solution: md`**Assumed properties:** standard air $\rho_p=1.23$ kg/m³, $\mu_p=1.79\times10^{-5}$ N·s/m² ($\nu_p=1.46\times10^{-5}$ m²/s); water at 20°C $\rho_m=998$ kg/m³, $\nu_m=1.00\times10^{-6}$ m²/s.

**1. Groups.** Smooth sphere, incompressible flow (Fox p.258): $F/\rho V^2D^2=f(\rho VD/\mu)$. Geometric similarity is automatic for smooth spheres; $D_p/D_m=3/0.05=60$.

**2. Model speed.**

$$
V_m=V_p\,\frac{D_p}{D_m}\,\frac{\nu_m}{\nu_p}=1.5\times60\times\frac{1.00\times10^{-6}}{1.46\times10^{-5}}=6.20\ \text{m/s}
$$

(Here $\Rey=1.5\times3/1.46\times10^{-5}=3.1\times10^{5}$ in both tests.)

**3. Prototype drag.**

$$
F_p=F_m\,\frac{\rho_p}{\rho_m}\left(\frac{V_p}{V_m}\right)^2\left(\frac{D_p}{D_m}\right)^2=3.8\times\frac{1.23}{998}\times\left(\frac{1.5}{6.20}\right)^2\times3600=0.99\ \text{N}
$$

**Comment.** The prototype drag is about **one quarter** of the model drag: with $\Rey$ matched, $F\propto\mu^2/\rho$, and $\mu^2/\rho$ is about 3.8 times larger for water than for air. A $\Rey$ of $3\times10^5$ lies close to the drag crisis of a smooth sphere, so in practice the test should be repeated at slightly different speeds to check sensitivity.`,
        check: [
          { label: 'model speed', value: 6.2, units: 'm/s', tol: 0.03 },
          { label: 'prototype drag', value: 0.99, units: 'N', tol: 0.04 },
        ],
      },
      {
        id: 'fox7-47',
        concept: 'similarity-types',
        difficulty: 1,
        src: P272('7.47'),
        q: md`An airplane wing of chord 2 m and span 12 m is designed to move through standard air at 10 m/s. A 1/20-scale model is to be tested in a water tunnel.

(a) What water speed is needed for dynamic similarity?

(b) What is the ratio of the forces measured on the model to those on the prototype wing?`,
        hint: md`Match $\Rey$ on the chord, then $F_m/F_p=(\rho_m/\rho_p)(V_m/V_p)^2(L_m/L_p)^2$.`,
        answer: md`(a) $V_m\approx13.8$ m/s; (b) $F_m/F_p\approx3.85$ (assumed standard air $\rho=1.23$ kg/m³, $\nu=1.46\times10^{-5}$ m²/s; water 20°C $\rho=998$ kg/m³, $\nu=1.00\times10^{-6}$ m²/s).`,
        solution: md`**Assumed properties:** standard air $\rho_p=1.23$ kg/m³, $\mu_p=1.79\times10^{-5}$ N·s/m² ($\nu_p=1.46\times10^{-5}$ m²/s); water at 20°C $\rho_m=998$ kg/m³, $\mu_m=1.00\times10^{-3}$ N·s/m² ($\nu_m=1.00\times10^{-6}$ m²/s).

**1. Criterion.** Lift and drag coefficients $F/\rho V^2L^2$ depend on $\Rey=\rho Vc/\mu$ (and on geometry, angle of attack, aspect ratio — all identical in a geometrically similar model at the same attitude). Chord: $c_p=2$ m, $c_m=0.1$ m.

**2. Water speed (a).**

$$
V_m=V_p\,\frac{c_p}{c_m}\,\frac{\nu_m}{\nu_p}=10\times20\times\frac{1.00\times10^{-6}}{1.46\times10^{-5}}=13.8\ \text{m/s}
$$

($\Rey=10\times2/1.46\times10^{-5}=1.37\times10^{6}$ in both.)

**3. Force ratio (b).**

$$
\frac{F_m}{F_p}=\frac{\rho_m}{\rho_p}\left(\frac{V_m}{V_p}\right)^2\left(\frac{c_m}{c_p}\right)^2=\frac{998}{1.23}\times(1.377)^2\times\frac{1}{400}=3.85
$$

Equivalently $F_m/F_p=(\mu_m^2/\rho_m)/(\mu_p^2/\rho_p)=1.00\times10^{-9}/2.60\times10^{-10}=3.85$. The tiny water model carries almost four times the load of the full-size wing — a structural consideration for the model and its balance.`,
        check: [
          { label: 'water speed', value: 13.8, units: 'm/s', tol: 0.03 },
          { label: 'F_m / F_p', value: 3.85, tol: 0.03 },
        ],
      },
      {
        id: 'fox7-48',
        concept: 'similarity-types',
        difficulty: 2,
        src: P272('7.48'),
        q: md`The fluid dynamics of a golf ball are to be studied with a model in a wind tunnel. The dependent parameters are the drag force $F_D$ and lift force $F_L$; the independent parameters must include the angular speed $\omega$ and the dimple depth $d$.

(a) Find suitable dimensionless parameters and express the functional dependence among them.

(b) A golf pro can hit a ball at $V=75$ m/s with $\omega=8100$ rpm. The tunnel's maximum speed is 25 m/s, and a U.S. golf ball is 4.27 cm in diameter. To model these conditions in the tunnel, what model diameter must be used, and how fast must the model spin?`,
        hint: md`Parameters: $F$, $V$, $D$, $\omega$, $d$, $\rho$, $\mu$. Repeating $\rho$, $V$, $D$. Model and prototype both use air, so $\Rey$ matching means $V_mD_m=V_pD_p$.`,
        answer: md`(a) $\dfrac{F_D}{\rho V^2D^2},\ \dfrac{F_L}{\rho V^2D^2}=f\!\left(\dfrac{\rho VD}{\mu},\ \dfrac{\omega D}{V},\ \dfrac{d}{D}\right)$. (b) $D_m=12.8$ cm (3× larger), $\omega_m=900$ rpm.`,
        solution: md`**1. Parameters.** Each force depends on $V,\ D,\ \omega,\ d,\ \rho,\ \mu$: $F=f(V,D,\omega,d,\rho,\mu)$, $n=7$, $r=3$ ($M$, $L$, $t$) ⇒ 4 groups.

**2. Groups** (repeating $\rho,V,D$):

- $\Pi_1=F/\rho V^2D^2$ (separately for $F_D$ and $F_L$ — two dependent parameters, two dependent groups);
- $\Pi_2=\mu/\rho VD$ → inverted, $\Rey=\rho VD/\mu$;
- $\Pi_3=\omega D/V$ (spin ratio);
- $\Pi_4=d/D$ (relative dimple depth).

$$
\frac{F_D}{\rho V^2D^2}=f_1\!\left(\frac{\rho VD}{\mu},\frac{\omega D}{V},\frac{d}{D}\right),\qquad
\frac{F_L}{\rho V^2D^2}=f_2\!\left(\frac{\rho VD}{\mu},\frac{\omega D}{V},\frac{d}{D}\right)
$$

**3. Model diameter.** Geometric similarity fixes $d/D$. Both flows are air at (presumably) the same conditions, so $\nu_m=\nu_p$ and $\Rey_m=\Rey_p$ gives $V_mD_m=V_pD_p$:

$$
D_m=D_p\,\frac{V_p}{V_m}=4.27\times\frac{75}{25}=12.8\ \text{cm}
$$

**4. Model spin.** Match $\omega D/V$:

$$
\omega_m=\omega_p\,\frac{V_m}{V_p}\,\frac{D_p}{D_m}=8100\times\frac13\times\frac13=900\ \text{rpm}
$$

The model is an enlarged ball (3×) spinning nine times slower.`,
        check: [
          { label: 'model diameter', value: 12.8, units: 'cm', tol: 0.02 },
          { label: 'model spin', value: 900, units: 'rpm', tol: 0.02 },
        ],
      },
      {
        id: 'fox7-49',
        concept: 'pump-scaling',
        difficulty: 2,
        src: P272('7.49'),
        q: md`A water pump with impeller diameter 60 cm is designed to deliver 0.4 m³/s at 750 rpm. It is to be tested with a 1:4-scale model running at 2400 rpm with air at 20°C as the working fluid. For similar operating conditions, and neglecting Reynolds-number effects, find (a) the model flow rate and (b) the prototype power requirement if the model draws 75 W.`,
        hint: md`Pump laws (Fox Eqs. 7.19 and 7.21): equal $Q/\omega D^3$ and equal $\mathcal{P}/\rho\omega^3D^5$. The density ratio water/air enters only the power.`,
        answer: md`(a) $Q_m=0.020$ m³/s; (b) $\mathcal{P}_p\approx1.95$ MW (air $\rho=1.20$ kg/m³, water $\rho=998$ kg/m³ assumed).`,
        solution: md`**Assumed densities:** water $\rho_p=998$ kg/m³; air at 20°C and atmospheric pressure $\rho_m=1.20$ kg/m³.

**1. Similarity conditions.** With Reynolds-number effects neglected, Fox Eqs. 7.17–7.18 reduce to the pump laws: geometrically similar machines at equal flow coefficient have equal head and power coefficients.

$D_m=60/4=15$ cm, $\omega_p=750$ rpm, $\omega_m=2400$ rpm.

**2. Flow rate (a).** Equal $Q/\omega D^3$ (Eq. 7.19):

$$
Q_m=Q_p\,\frac{\omega_m}{\omega_p}\left(\frac{D_m}{D_p}\right)^3=0.4\times\frac{2400}{750}\times\left(\frac14\right)^3=0.020\ \text{m}^3/\text{s}
$$

**3. Power (b).** Equal $\mathcal{P}/\rho\omega^3D^5$ (Eq. 7.21):

$$
\mathcal{P}_p=\mathcal{P}_m\,\frac{\rho_p}{\rho_m}\left(\frac{\omega_p}{\omega_m}\right)^3\left(\frac{D_p}{D_m}\right)^5
=75\times\frac{998}{1.20}\times\left(\frac{750}{2400}\right)^3\times4^5=1.95\times10^{6}\ \text{W}
$$

so $\mathcal{P}_p\approx1.95$ MW.

**Comment.** The huge factor comes from the density ratio (≈ 830) times $4^5=1024$. Because air is about 15 times more "kinematically viscous" than water, the model Reynolds number is far below the prototype's — this is exactly why the problem says to neglect Reynolds-number effects; Fox p.265 notes that viscous effects are relatively unimportant for similar operating points.`,
        check: [
          { label: 'model flow rate', value: 0.02, units: 'm³/s', tol: 0.02 },
          { label: 'prototype power', value: 1.95, units: 'MW', tol: 0.03 },
        ],
      },
      {
        id: 'fox7-50',
        concept: 'similarity-types',
        difficulty: 2,
        src: P272('7.50'),
        q: md`A model test is run to determine the flight characteristics of a Frisbee. The dependent parameters are the drag force $F_D$ and lift force $F_L$; the independent parameters should include the angular speed $\omega$ and the roughness height $h$.

(a) Find suitable dimensionless parameters and express the functional dependence among them.

(b) The test (in air) uses a 1:7-scale model that must be geometrically, kinematically and dynamically similar to the prototype. If the tunnel conditions are $V_m=42$ m/s and $\omega_m=5000$ rpm, what are the corresponding $V_p$ and $\omega_p$?`,
        hint: md`Same structure as Problem 7.48: $F/\rho V^2D^2=f(\rho VD/\mu,\ \omega D/V,\ h/D)$. Same fluid ⇒ $VD$ equal; then $\omega D/V$ equal.`,
        answer: md`(a) $\dfrac{F_D}{\rho V^2D^2},\ \dfrac{F_L}{\rho V^2D^2}=f\!\left(\dfrac{\rho VD}{\mu},\ \dfrac{\omega D}{V},\ \dfrac{h}{D}\right)$. (b) $V_p=6.0$ m/s, $\omega_p\approx102$ rpm (model taken as 1/7 of the prototype size).`,
        solution: md`**1. Groups.** $F=f(V,D,\omega,h,\rho,\mu)$: 7 parameters, 3 dimensions ⇒ 4 groups. With repeating $\rho,V,D$:

$$
\frac{F_D}{\rho V^2D^2}=f_1\!\left(\frac{\rho VD}{\mu},\frac{\omega D}{V},\frac{h}{D}\right),\qquad
\frac{F_L}{\rho V^2D^2}=f_2\!\left(\frac{\rho VD}{\mu},\frac{\omega D}{V},\frac{h}{D}\right)
$$

**2. What each similarity means here.**
- Geometric: same shape and the same relative roughness $h/D$.
- Kinematic: same spin ratio $\omega D/V$ (same pattern of surface speed relative to flight speed) and same angle of attack.
- Dynamic: same $\Rey$.

**3. Speed.** Reading "1:7" as $D_m/D_p=1/7$ (Fox's usual convention), and air for both ($\nu_m=\nu_p$):

$$
V_p=V_m\,\frac{D_m}{D_p}=42\times\frac17=6.0\ \text{m/s}
$$

**4. Spin.**

$$
\omega_p=\omega_m\,\frac{V_p}{V_m}\,\frac{D_m}{D_p}=5000\times\frac17\times\frac17=102\ \text{rpm}
$$

**Remark.** These prototype values correspond to a slow, gently spinning throw; matching $\Rey$ with a small model in the same fluid always demands a much higher model speed (here 7×) and a much higher spin rate (here 49×).`,
        check: [
          { label: 'prototype speed', value: 6.0, units: 'm/s', tol: 0.02 },
          { label: 'prototype spin', value: 102, units: 'rpm', tol: 0.02 },
        ],
      },
      {
        id: 'fox7-51',
        concept: 'model-testing',
        difficulty: 3,
        src: P273('7.51'),
        q: md`A hydrofoil is to be tested as a 1:20-scale model. The test speed is chosen to duplicate the Froude number of the 30 m/s prototype speed. To model cavitation correctly, the cavitation number must be duplicated as well. The water in the model basin can be heated to 54°C, while the prototype runs in water at 7°C. At what ambient pressure must the test be run?`,
        hint: md`$\Fr$ fixes $V_m$. Then $Ca=(p-p_v)/\tfrac12\rho V^2$ equal fixes $p_m-p_{v,m}$. You need vapor pressures at 7°C and 54°C and assume the prototype operates at atmospheric pressure.`,
        answer: md`$V_m=6.71$ m/s and $p_m\approx19.9$ kPa (abs) — a partial vacuum. (Assumed: prototype ambient 101.3 kPa; $p_v=1.0$ kPa, $\rho=1000$ kg/m³ at 7°C; $p_v=15.0$ kPa, $\rho=986$ kg/m³ at 54°C.)`,
        solution: md`**Assumed data (standard steam-table values, not printed):** at 7°C, $p_{v,p}\approx1.0$ kPa, $\rho_p\approx1000$ kg/m³; at 54°C, $p_{v,m}\approx15.0$ kPa, $\rho_m\approx986$ kg/m³. The prototype hydrofoil runs near the surface, so its ambient pressure is taken as atmospheric, $p_p=101.3$ kPa.

**1. Froude matching.** $V/\sqrt{gL}$ equal with the same $g$:

$$
V_m=V_p\sqrt{\frac{L_m}{L_p}}=\frac{30}{\sqrt{20}}=6.71\ \text{m/s}
$$

**2. Cavitation-number matching** (Fox Eq. 7.13, $Ca=(p-p_v)/\tfrac12\rho V^2$):

$$
\frac{p_m-p_{v,m}}{\tfrac12\rho_mV_m^2}=\frac{p_p-p_{v,p}}{\tfrac12\rho_pV_p^2}
\ \Rightarrow\
p_m-p_{v,m}=(p_p-p_{v,p})\,\frac{\rho_m}{\rho_p}\left(\frac{V_m}{V_p}\right)^2
$$

With $(V_m/V_p)^2=1/20$:

$$
p_m-p_{v,m}=(101.3-1.0)\times\frac{986}{1000}\times\frac{1}{20}=4.95\ \text{kPa}
$$

**3. Ambient test pressure.**

$$
p_m=15.0+4.95=19.9\ \text{kPa (abs)}
$$

The basin must be evacuated to about one-fifth of an atmosphere. Heating the water helps: the higher vapor pressure at 54°C lets the required absolute pressure stay well above zero ($Ca_p\approx0.22$ in both flows). Reynolds number is **not** matched — this is a deliberately incomplete similarity in which gravity (waves) and cavitation are modeled and viscous effects are corrected separately.`,
        check: [
          { label: 'model speed', value: 6.71, units: 'm/s', tol: 0.02 },
          { label: 'test ambient pressure', value: 19.9, units: 'kPa', tol: 0.04 },
        ],
      },
      {
        id: 'fox7-52',
        concept: 'similarity-types',
        difficulty: 3,
        src: P273('7.52'),
        q: md`SAE 10W oil at 25°C flows through a 25-mm diameter horizontal pipe at an average speed of 1 m/s and produces a pressure drop of 450 kPa (gage) over 150 m of pipe. Water at 15°C flows through the same pipe under dynamically similar conditions. Using the results of Example 7.2, find the average water speed and the corresponding pressure drop.`,
        hint: md`Example 7.2: $\Delta p/\rho\bar V^2=f(\mu/\rho\bar VD,\ l/D,\ e/D)$. Same pipe ⇒ $l/D$, $e/D$ equal; match $\Rey$, then equate $\Delta p/\rho\bar V^2$. You need oil properties from a table.`,
        answer: md`$\bar V_w\approx0.0105$ m/s; $\Delta p_w\approx54$ Pa. (Assumed: SAE 10W at 25°C, $\rho=920$ kg/m³, $\mu\approx0.10$ N·s/m²; water at 15°C, $\rho=999$ kg/m³, $\mu=1.14\times10^{-3}$ N·s/m². The answers scale with the assumed oil viscosity: $\bar V_w\propto1/\nu_o$, $\Delta p_w\propto1/\nu_o^2$.)`,
        solution: md`**Assumed properties (from standard tables, not printed in the problem):** SAE 10W oil at 25°C, $\rho_o\approx920$ kg/m³ (SG ≈ 0.92), $\mu_o\approx0.10$ N·s/m², so $\nu_o=1.09\times10^{-4}$ m²/s; water at 15°C, $\rho_w=999$ kg/m³, $\mu_w=1.14\times10^{-3}$ N·s/m², so $\nu_w=1.14\times10^{-6}$ m²/s.

**1. Groups (Example 7.2, Fox pp.251–252).**

$$
\frac{\Delta p}{\rho\bar V^2}=f\!\left(\frac{\mu}{\rho\bar VD},\ \frac{l}{D},\ \frac{e}{D}\right)
$$

The same pipe is used, so $l/D$ and $e/D$ are identical; dynamic similarity needs only equal Reynolds numbers.

**2. Water speed.** Same $D$:

$$
\bar V_w=\bar V_o\,\frac{\nu_w}{\nu_o}=1\times\frac{1.14\times10^{-6}}{1.09\times10^{-4}}=0.0105\ \text{m/s}
$$

($\Rey=1\times0.025/1.09\times10^{-4}\approx230$ in both flows — laminar.)

**3. Pressure drop.** Equal $\Delta p/\rho\bar V^2$:

$$
\Delta p_w=\Delta p_o\,\frac{\rho_w}{\rho_o}\left(\frac{\bar V_w}{\bar V_o}\right)^2=450\times10^{3}\times\frac{999}{920}\times(0.0105)^2=53.9\ \text{Pa}
$$

**Comment.** Water is about 100 times less viscous (kinematically) than the oil, so the dynamically similar water flow is about 100 times slower and its pressure drop about $10^4$ times smaller. The numerical answer depends directly on the oil viscosity read from the property chart — a different chart value changes $\bar V_w$ in proportion to $1/\nu_o$ and $\Delta p_w$ in proportion to $1/\nu_o^2$.`,
        check: [
          { label: 'water speed', value: 0.0105, units: 'm/s', tol: 0.05 },
          { label: 'water pressure drop', value: 53.9, units: 'Pa', tol: 0.08 },
        ],
      },
      {
        id: 'fox7-53',
        concept: 'model-testing',
        difficulty: 2,
        src: P273('7.53'),
        q: md`A submarine prototype moves at 12 m/s. A 28:1-scale model (model 1/28 of full size) is tested in a wind tunnel. Find the tunnel air speed and the ratio of model drag to prototype drag. Use the printed data: kinematic viscosity of sea water 0.015 stokes, of air 0.018 stokes; density of air 1.35 kg/m³, of sea water 1080 kg/m³.`,
        hint: md`1 stokes = 1 cm²/s = $10^{-4}$ m²/s. Match $\Rey=VL/\nu$, then $F_m/F_p=(\rho_m/\rho_p)(V_m/V_p)^2(L_m/L_p)^2$.`,
        answer: md`$V_m=403$ m/s; $F_m/F_p=1.80\times10^{-3}$ (i.e. $F_p\approx556\,F_m$). Note $V_m$ exceeds the speed of sound, so the test would not actually be valid.`,
        solution: md`**1. Units.** $\nu_p=0.015$ St $=1.5\times10^{-6}$ m²/s (sea water), $\nu_m=0.018$ St $=1.8\times10^{-6}$ m²/s (air, as printed). $L_p/L_m=28$.

**2. Reynolds matching.**

$$
V_m=V_p\,\frac{L_p}{L_m}\,\frac{\nu_m}{\nu_p}=12\times28\times\frac{1.8\times10^{-6}}{1.5\times10^{-6}}=403\ \text{m/s}
$$

**3. Drag ratio.** Equal $F/\rho V^2L^2$:

$$
\frac{F_m}{F_p}=\frac{\rho_m}{\rho_p}\left(\frac{V_m}{V_p}\right)^2\left(\frac{L_m}{L_p}\right)^2=\frac{1.35}{1080}\times(33.6)^2\times\frac{1}{784}=1.80\times10^{-3}
$$

so the prototype drag is about 556 times the model drag.

**4. Is the test feasible?** No. 403 m/s is a Mach number of about $403/340\approx1.2$: the model flow would be compressible (even supersonic) while the submarine flow is incompressible, so the flows could not be kinematically similar. Moreover, the printed air viscosity (0.018 St) is roughly one-eighth of the usual room-temperature value (≈ 0.15 St); with a realistic value the required speed would be several thousand m/s. An air test of a sea-water prototype at this scale must rely on Reynolds-number independence rather than on exact $\Rey$ matching.`,
        check: [
          { label: 'tunnel air speed', value: 403, units: 'm/s', tol: 0.02 },
          { label: 'F_m / F_p', value: 0.0018, tol: 0.03 },
        ],
      },
      {
        id: 'fox7-54',
        concept: 'incomplete-similarity',
        difficulty: 3,
        src: P273('7.54'),
        q: md`A 1/8-scale model of a tractor-trailer rig is tested in a pressurized wind tunnel. The rig width, height and length are $W=0.305$ m, $H=0.476$ m and $L=2.48$ m (taken here as the model's dimensions). At $V=75.0$ m/s the model drag is $F_D=128$ N, with tunnel air density $\rho=3.23$ kg/m³.

(a) Calculate the model's aerodynamic drag coefficient.

(b) Compare the Reynolds numbers of the model test and of the prototype at 88 km/h.

(c) Calculate the aerodynamic drag on the prototype at a road speed of 88 km/h into a headwind of 16 km/h.`,
        hint: md`Follow Example 7.5: $C_D=F_D/\tfrac12\rho V^2A$ with frontal area $A=WH$, $\Rey=\rho VW/\mu$. Into a headwind the relative air speed is the sum of road and wind speeds.`,
        answer: md`(a) $C_D\approx0.097$. (b) $\Rey_m\approx4.1\times10^6$, $\Rey_p\approx4.1\times10^6$ — essentially equal. (c) $V_{rel}=104$ km/h, $F_{D_p}\approx463$ N. (Assumed tunnel air $\mu=1.79\times10^{-5}$ N·s/m²; standard air $\rho=1.23$ kg/m³, $\nu=1.46\times10^{-5}$ m²/s for the prototype.)`,
        solution: md`**Assumptions.** $W$, $H$, $L$ are the model's dimensions (8× them gives a 2.44-m wide prototype, as in Example 7.5). Tunnel air at about 15°C, $\mu=1.79\times10^{-5}$ N·s/m² (viscosity is unaffected by pressurization). Prototype in standard air, $\rho=1.23$ kg/m³, $\nu=1.46\times10^{-5}$ m²/s.

**1. Drag coefficient (a).** Frontal area $A_m=WH=0.305\times0.476=0.1452$ m².

$$
C_D=\frac{F_D}{\tfrac12\rho V^2A}=\frac{128}{\tfrac12\times3.23\times75.0^2\times0.1452}=0.097
$$

**2. Reynolds numbers (b)** (based on width, as in Example 7.5).

$$
\Rey_m=\frac{\rho VW}{\mu}=\frac{3.23\times75.0\times0.305}{1.79\times10^{-5}}=4.13\times10^{6}
$$

Prototype: $V_p=88/3.6=24.4$ m/s, $W_p=8\times0.305=2.44$ m:

$$
\Rey_p=\frac{V_pW_p}{\nu}=\frac{24.4\times2.44}{1.46\times10^{-5}}=4.10\times10^{6}
$$

The pressurized tunnel (density ≈ 2.6× atmospheric) lets the model match the prototype $\Rey$ at 88 km/h almost exactly — and both exceed the SAE recommendation $\Rey\ge2\times10^6$ quoted in Example 7.5.

**3. Drag into a headwind (c).** Aerodynamic drag depends on the speed of the air relative to the truck: $V_{rel}=88+16=104$ km/h $=28.9$ m/s. Then $\Rey_p=4.8\times10^6$, slightly above the model value; for a bluff body $C_D$ is independent of $\Rey$ in this range (Fox p.263), so $C_D=0.097$ still applies. Prototype frontal area $A_p=8^2A_m=9.29$ m².

$$
F_{D_p}=C_D\,\tfrac12\rho V_{rel}^2A_p=0.097\times\tfrac12\times1.23\times28.9^2\times9.29=463\ \text{N}
$$

**Comment.** The computed $C_D$ is much lower than the ≈ 0.46 of the bus in Example 7.5; that is what the printed data give, so the result should be read as an exercise in the method (headwind ⇒ relative speed; drag grows as $V_{rel}^2$: the 16 km/h headwind raises drag by $(104/88)^2-1\approx40\%$).`,
        check: [
          { label: 'model C_D', value: 0.097, tol: 0.03 },
          { label: 'model Re', value: 4.13e6, tol: 0.04 },
          { label: 'prototype drag with headwind', value: 463, units: 'N', tol: 0.04 },
        ],
      },
      {
        id: 'fox7-55',
        concept: 'incomplete-similarity',
        difficulty: 2,
        src: P273('7.55'),
        q: md`On a cruise ship, passengers complain about smoke entrained behind the cylindrical smoke stack. You will study the flow around the 4.75-m stack with a 1:15-scale model in a wind tunnel. The problem occurs at ship speeds of 6 to 12 m/s. What range of wind-tunnel speeds could you use?`,
        hint: md`Both flows are air: $\Rey$ matching gives $V_m=15V_p$. Then check the Mach number of the result.`,
        answer: md`Exact $\Rey$ matching: $V_m=90$ to $180$ m/s. Above about 100 m/s ($M\gtrsim0.3$) compressibility spoils similarity, so in practice one tests at the lower end (or as high as practical) and relies on the Re-insensitivity of bluff-body flow.`,
        solution: md`**1. Governing group.** The flow pattern around the stack (separation, wake, entrainment) depends on $\Rey=VD/\nu$ for a geometrically similar model at low Mach number. Model and prototype are both in air ($\nu_m=\nu_p$); the relevant prototype speed is the air speed relative to the stack, taken as the ship speed (no wind). $D_m=4.75/15=0.317$ m.

**2. Required speeds.**

$$
V_m=V_p\,\frac{D_p}{D_m}=15V_p\quad\Rightarrow\quad V_m=15\times6=90\ \text{m/s}\ \ \text{to}\ \ 15\times12=180\ \text{m/s}
$$

**3. Practicality.** The upper end corresponds to $M\approx180/340=0.53$, where compressibility is significant and the model flow would no longer be kinematically similar to the incompressible prototype flow; even 90 m/s ($M\approx0.26$) is near the usual limit $M\approx0.3$. The prototype Reynolds numbers are $\Rey_p=V_pD_p/\nu\approx(2\text{–}4)\times10^6$ (standard air), so — as for the bluff bodies of Example 7.5 — a practical test would run at the highest incompressible speed available and check that the wake pattern no longer changes with speed (incomplete similarity).`,
        check: [
          { label: 'lowest tunnel speed', value: 90, units: 'm/s', tol: 0.02 },
          { label: 'highest tunnel speed', value: 180, units: 'm/s', tol: 0.02 },
        ],
      },
      {
        id: 'fox7-56',
        concept: 'model-testing',
        difficulty: 3,
        src: P273('7.56'),
        q: md`The aerodynamics of a flying insect are to be studied in a wind tunnel with a 1:8-scale model. The insect flaps its wings 60 times per second while flying at 1.5 m/s.

(a) Find the tunnel air speed and wing oscillation rate required for dynamic similarity.

(b) Would this be a successful or practical model for producing easily measurable wing lift?

(c) If not, can you suggest a different fluid (e.g. water, or air at a different pressure or temperature) that would give a better model?`,
        hint: md`An insect model is normally **enlarged**: take $L_m/L_p=8$. Match $\Rey=VL/\nu$ and the reduced frequency (Strouhal-type group) $fL/V$. With $\Rey$ matched, forces scale as $\mu^2/\rho$.`,
        answer: md`(a) In air: $V_m=1.5/8=0.19$ m/s and $f_m=60/64\approx0.94$ Hz. (b) Lift on the model equals the insect's own lift (only millinewtons) — not easily measurable. (c) Use a fluid with larger $\mu^2/\rho$: water gives ≈ 3.7× the force ($V_m\approx0.012$ m/s, $f_m\approx0.06$ Hz); a viscous oil is better still. Pressurizing air makes it worse; heating air helps only slightly.`,
        solution: md`**Interpretation.** The book does not say which way the 1:8 ratio goes; a model of an insect is normally made **larger**, so we take $L_m/L_p=8$.

**1. Groups.** Lift on a flapping wing: $F/\rho V^2L^2=f(\Rey,\ fL/V)$, where $fL/V$ (flapping frequency × length / speed) is the kinematic-similarity group for the oscillation.

**2. Air model (a).** Same fluid ($\nu_m=\nu_p$):

$$
V_m=V_p\,\frac{L_p}{L_m}=\frac{1.5}{8}=0.19\ \text{m/s},\qquad
f_m=f_p\,\frac{V_m}{V_p}\,\frac{L_p}{L_m}=60\times\frac18\times\frac18=0.94\ \text{Hz}
$$

**3. Measurability (b).** Equal $F/\rho V^2L^2$ gives

$$
\frac{F_m}{F_p}=\frac{\rho_m}{\rho_p}\left(\frac{V_m}{V_p}\right)^2\left(\frac{L_m}{L_p}\right)^2=1\times\frac{1}{64}\times64=1
$$

The model's lift equals the insect's lift — roughly the insect's weight, a few millinewtons — and it acts in a tunnel running at only 0.19 m/s, where low-speed control and flow quality are poor. Not a practical test.

**4. Better fluid (c).** With $\Rey$ matched, $V_m=\Rey\,\nu_m/L_m$ and $F\propto\rho V^2L^2\propto\mu^2/\rho$: for a given $\Rey$ the force depends only on the fluid through $\mu^2/\rho$.

- Water at 20°C: $\mu^2/\rho=1.00\times10^{-9}$ vs air $2.73\times10^{-10}$ (SI) — about **3.7×** larger forces, with $V_m=0.19\times(1.00\times10^{-6}/1.51\times10^{-5})=0.012$ m/s and $f_m\approx0.06$ Hz (slow motions, easy to drive and film).
- A viscous liquid (e.g. mineral oil or glycerin–water) raises $\mu^2/\rho$ much more and gives larger, easily measured forces at practical speeds — the usual choice for robotic insect-wing experiments.
- Pressurized air raises $\rho$ at fixed $\mu$, so $\mu^2/\rho$ **falls** — worse. Heated air raises $\mu$ and lowers $\rho$, so forces increase, but only modestly.`,
        check: [
          { label: 'tunnel air speed', value: 0.1875, units: 'm/s', tol: 0.03 },
          { label: 'wing oscillation rate', value: 0.9375, units: 'Hz', tol: 0.03 },
        ],
      },
    ],
    quiz: [
      {
        id: 'fox7c-q-sim1',
        concept: 'similarity-types',
        difficulty: 2,
        q: md`A geometrically similar model is tested in the **same fluid** as the prototype with the Reynolds number matched. How does the drag force on the model compare with that on the prototype?`,
        options: [
          'It is equal to the prototype drag',
          md`It is smaller by the factor $(L_m/L_p)^2$`,
          md`It is smaller by the factor $(L_m/L_p)^3$`,
          md`It is larger by the factor $L_p/L_m$`,
        ],
        answer: 0,
        explain: md`With $\Rey$ matched, $V=\Rey\,\mu/\rho L$, so $F\propto\rho V^2L^2=\Rey^2\mu^2/\rho$: the force depends on the fluid only through $\mu^2/\rho$, not on size. Same fluid ⇒ same force (as in Problem 7.56). The $(L_m/L_p)^2$ factor would apply only at **equal speeds**, which is not a $\Rey$-matched test.`,
      },
      {
        id: 'fox7c-q-sim2',
        concept: 'model-testing',
        difficulty: 2,
        q: md`Why does raising the pressure of a wind tunnel (at fixed temperature) help to reach the prototype Reynolds number with a small model?`,
        options: [
          'Density rises in proportion to pressure while viscosity stays almost unchanged, so the kinematic viscosity falls',
          'Viscosity falls with pressure, so the boundary layer becomes thinner',
          'The speed of sound rises with pressure, so higher speeds become available',
          'It increases the Mach number to match the prototype',
        ],
        answer: 0,
        explain: md`For an ideal gas at fixed $T$, $\rho\propto p$, while $\mu$ depends essentially only on temperature. Hence $\nu=\mu/\rho$ drops and $\Rey=VL/\nu$ rises at the same speed (Problems 7.39, 7.44, 7.54). The speed of sound $\sqrt{kRT}$ depends on temperature, not pressure, so pressurizing does not raise the allowable speed.`,
      },
      {
        id: 'fox7c-q-sim3',
        concept: 'incomplete-similarity',
        difficulty: 1,
        q: md`A 1:10 model propeller runs in water like the prototype. If the Froude number is matched, the model rotational speed must be ...`,
        options: [
          md`$\sqrt{10}$ times the prototype speed`,
          '10 times the prototype speed',
          '100 times the prototype speed',
          md`$1/\sqrt{10}$ of the prototype speed`,
        ],
        answer: 0,
        explain: md`$\Fr\propto\omega D/\sqrt{gD}=\omega\sqrt{D/g}$, so $\omega\propto D^{-1/2}$ and $\omega_m=\omega_p\sqrt{10}$ (Problem 7.43). The factor 100 is what **Reynolds** matching in the same fluid would require ($\omega\propto D^{-2}$) — the conflict that makes complete similarity impossible.`,
      },
      {
        id: 'fox7c-q-sim4',
        concept: 'pump-scaling',
        difficulty: 2,
        q: md`A pump is modeled at 1:4 scale with air instead of water, at a homologous point and neglecting Reynolds-number effects. Which scaled quantity depends on the density ratio of the two fluids?`,
        options: ['The power', 'The flow rate', md`The head $h$ (energy per unit mass)`, 'The flow coefficient'],
        answer: 0,
        explain: md`The pump laws are $Q\propto\omega D^3$, $h\propto\omega^2D^2$ and $\mathcal{P}\propto\rho\omega^3D^5$ (Fox Eqs. 7.19–7.21). Only the power coefficient contains $\rho$, which is why the 75 W air model of Problem 7.49 corresponds to about 1.95 MW in water. The flow coefficient is equal by construction.`,
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Dimensionless groups: 7.40, 7.45 (single named group: Re)          */
  /* ------------------------------------------------------------------ */
  {
    id: 'fox7c-dimensionless-groups',
    topic: 'dimensionless-groups',
    title: "Fox & McDonald's Ch. 7 — Problems 7.40 & 7.45: working with the Reynolds number",
    src: { doc: 'fox', pages: '272', note: 'Problems 7.40, 7.45' },
    intro: md`Two short problems from the model-study set whose whole content is computing and interpreting one named group — the Reynolds number — for different fluids and pressures.`,
    problems: [
      {
        id: 'fox7-40',
        concept: 'common-groups',
        difficulty: 1,
        src: P272('7.40'),
        q: md`To match the Reynolds number in an air flow and a water flow using the same-size model, which flow requires the higher speed? How much higher must it be?`,
        hint: md`Same length, $\Rey=VL/\nu$ ⇒ $V_{air}/V_{water}=\nu_{air}/\nu_{water}$. Compare **kinematic**, not dynamic, viscosities.`,
        answer: md`The air flow, about **15 times** faster (at 20°C: $\nu_{air}=1.51\times10^{-5}$ m²/s, $\nu_{water}=1.00\times10^{-6}$ m²/s).`,
        solution: md`**1. Matching condition.** With the same model length $L$,

$$
\frac{V_aL}{\nu_a}=\frac{V_wL}{\nu_w}\quad\Rightarrow\quad\frac{V_a}{V_w}=\frac{\nu_a}{\nu_w}
$$

**2. Properties (assumed 20°C, atmospheric pressure).** Air: $\mu=1.81\times10^{-5}$ N·s/m², $\rho=1.20$ kg/m³, $\nu_a=1.51\times10^{-5}$ m²/s. Water: $\mu=1.00\times10^{-3}$ N·s/m², $\rho=998$ kg/m³, $\nu_w=1.00\times10^{-6}$ m²/s.

**3. Ratio.**

$$
\frac{V_a}{V_w}=\frac{1.51\times10^{-5}}{1.00\times10^{-6}}\approx15
$$

**The trap.** Water's **dynamic** viscosity is about 55 times air's, which tempts one to say water needs the higher speed. But $\Rey=\rho VL/\mu$ also contains density, and water is about 830 times denser; the net effect is that air's kinematic viscosity is 15 times larger, so air must flow 15 times faster.`,
        check: [{ label: 'V_air / V_water', value: 15, tol: 0.03 }],
      },
      {
        id: 'fox7-45',
        concept: 'common-groups',
        difficulty: 2,
        src: P272('7.45'),
        q: md`The drag on an airfoil at zero angle of attack depends on density, viscosity and velocity, in addition to a length parameter. A 1:5-scale model airfoil is tested in a wind tunnel at 40 m/s, 15°C and 3800 mm Hg pressure. The prototype has a chord length of 1.8 m and flies in air at standard conditions.

(a) Find the Reynolds number at which the model was tested.

(b) Find the prototype speed at that same Reynolds number.`,
        hint: md`3800 mm Hg = 5 atm. Ideal gas at 15°C gives the tunnel density; viscosity depends only on temperature. Base $\Rey$ on the chord ($c_m=0.36$ m).`,
        answer: md`(a) $\Rey_m\approx4.9\times10^{6}$; (b) $V_p=40$ m/s (density ratio 5 exactly cancels the length ratio 1/5). (Assumed $\mu=1.79\times10^{-5}$ N·s/m², $R=287$ J/kg·K.)`,
        solution: md`**1. Tunnel air density.** $3800$ mm Hg $=3800/760=5$ atm $=5\times101.3=506.6$ kPa. At $T=288.15$ K:

$$
\rho_m=\frac{p}{RT}=\frac{506.6\times10^{3}}{287\times288.15}=6.13\ \text{kg/m}^3
$$

**2. Model Reynolds number (a).** Chord $c_m=1.8/5=0.36$ m; $\mu=1.79\times10^{-5}$ N·s/m² at 15°C (unaffected by pressure):

$$
\Rey_m=\frac{\rho_mV_mc_m}{\mu}=\frac{6.13\times40\times0.36}{1.79\times10^{-5}}=4.93\times10^{6}
$$

**3. Prototype speed (b).** Standard air at the same temperature: $\rho_p=101.3\times10^3/(287\times288.15)=1.225$ kg/m³, same $\mu$.

$$
V_p=\frac{\Rey_m\,\mu}{\rho_pc_p}=V_m\,\frac{\rho_m}{\rho_p}\,\frac{c_m}{c_p}=40\times5\times\frac15=40\ \text{m/s}
$$

**Insight.** Pressurizing the tunnel by the same factor as the geometric scale-down (5) exactly compensates the smaller chord: at the same speed and temperature, $\Rey\propto\rho c$ is unchanged.`,
        check: [
          { label: 'model Reynolds number', value: 4.93e6, tol: 0.03 },
          { label: 'prototype speed', value: 40, units: 'm/s', tol: 0.02 },
        ],
      },
    ],
    quiz: [
      {
        id: 'fox7c-q-dg1',
        concept: 'common-groups',
        difficulty: 1,
        q: md`At 20°C, water is about 55 times more viscous (dynamic viscosity) than air. For the same body size, matching the Reynolds number requires the air speed to be about ...`,
        options: [
          '15 times the water speed',
          '1/55 of the water speed',
          '55 times the water speed',
          '830 times the water speed',
        ],
        answer: 0,
        explain: md`$\Rey=VL/\nu$, so the speeds scale with the **kinematic** viscosities: $\nu_{air}/\nu_{water}\approx1.51\times10^{-5}/1.00\times10^{-6}\approx15$. Using the dynamic-viscosity ratio alone (55) ignores the 830-fold density difference that $\Rey=\rho VL/\mu$ also contains.`,
      },
      {
        id: 'fox7c-q-dg2',
        concept: 'common-groups',
        difficulty: 2,
        q: md`A wind tunnel's pressure is raised from 1 atm to 5 atm at constant temperature, with model size and speed unchanged. The test Reynolds number ...`,
        options: [
          'increases by a factor of 5',
          'is unchanged, because viscosity rises with pressure too',
          md`increases by a factor of $\sqrt5$`,
          'decreases by a factor of 5',
        ],
        answer: 0,
        explain: md`At fixed $T$, $\rho\propto p$ while $\mu$ is essentially independent of pressure, so $\Rey=\rho VL/\mu$ scales directly with $p$ (Problem 7.45: 5 atm compensates a 1:5 model). Gas viscosity does not rise appreciably with pressure in this range.`,
      },
    ],
  },
]
