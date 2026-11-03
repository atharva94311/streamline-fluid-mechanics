# Syllabus & coverage checklist

Generated from the content modules (`GEN_SYLLABUS=1 npx vitest run src/test/syllabus.gen.test.ts`).

## Unit A — Differential Analysis of Fluid Flow

How an infinitesimal fluid element moves and deforms, and the differential equations of mass and momentum that govern it.

### A1. Fluid Element Kinematics

_How an infinitesimal fluid element translates, rotates, stretches and shears — and how each motion is read off the velocity field and its gradients._

Sources: Lec 9 · slides 2–9

- [ ] 1. Velocity & acceleration fields; the four kinds of element motion — Lec 9 · slides 2–4
- [ ] 2. Translation, linear deformation & volumetric dilatation rate — Lec 9 · slide 5
- [ ] 3. Rotation, vorticity & irrotational flow — Lec 9 · slides 6–8
- [ ] 4. Angular deformation: rate of shearing strain — Lec 9 · slide 9

25 formulas · 9 solved examples · 15 practice problems · 15 quiz questions · 12 flashcards

### A2. Conservation of Mass — Differential Continuity Equation

_From a mass balance on an infinitesimal box to ∂ρ/∂t + ∇·(ρV) = 0, and its steady-compressible, incompressible and cylindrical forms — plus how to test a velocity field and find a missing component._

Sources: Lec 9 · slides 10–11

- [ ] 1. The continuity equation — general and steady compressible forms — Lec 9 · slide 10
- [ ] 2. Incompressible flow: ∇·V = 0 — Lec 9 · slide 11
- [ ] 3. Continuity in cylindrical polar coordinates (r, θ, z) — Lec 9 · slide 11

14 formulas · 8 solved examples · 16 practice problems · 13 quiz questions · 12 flashcards

### A3. The Stream Function

_One scalar ψ(x, y) that builds mass conservation into plane flow: its contour lines are the streamlines and its differences are flow rates._

Sources: Lec 9 · slides 12–14; Lec 10 · slide 2

- [ ] 1. Defining ψ: continuity satisfied identically — Lec 9 · slide 12
- [ ] 2. Lines of constant ψ are streamlines — Lec 9 · slide 13
- [ ] 3. Δψ equals the volume flow rate between streamlines — Lec 9 · slide 14
- [ ] 4. ψ in polar coordinates & where a stream function exists — Lec 10 · slide 2

15 formulas · 9 solved examples · 14 practice problems · 17 quiz questions · 11 flashcards

### A4. Equations of Motion: Cauchy & Euler

_Newton's second law for a fluid particle — body and surface forces on a differential element, the Cauchy equations that hold for any continuum, and their inviscid limit: Pascal's law, pressure and Euler's equations._

Sources: Lec 10 · slides 3–5; Lec 9 · slide 4; Fox & McDonald p. 221; Fox & McDonald p. 247

- [ ] 1. Body and surface forces on a differential element — Lec 10 · slide 3
- [ ] 2. Cauchy equations of motion — Lec 10 · slide 4
- [ ] 3. Inviscid flow: pressure, Pascal's law & Euler's equations — Lec 10 · slide 5

13 formulas · 6 solved examples · 12 practice problems · 13 quiz questions · 13 flashcards

### A5. Velocity Potential & Laplace's Equation

_In irrotational flow one scalar φ generates the whole velocity field, V = ∇φ. Add incompressibility and φ must satisfy Laplace's equation — the doorway to potential-flow theory._

Sources: Lec 10 · slides 6–8; Lec 11 · slide 2; Fox & McDonald pp. 222–224; Lec 12 · slides 2–4

- [ ] 1. Velocity potential for irrotational flow — Lec 10 · slide 6; Fox & McDonald pp. 222–223
- [ ] 2. Velocity potential vs stream function — Lec 10 · slide 7; Fox & McDonald pp. 223–224
- [ ] 3. Laplace's equation & potential flow — Lec 10 · slides 7–8; Fox & McDonald p. 223
- [ ] 4. Finding φ from ψ (and ψ from φ) — Lec 11 · slide 2; Fox & McDonald p. 224

21 formulas · 9 solved examples · 15 practice problems · 18 quiz questions · 12 flashcards

### A6. From Euler to Bernoulli: Inviscid Flow

_Integrate Euler's equation along a streamline to reach Bernoulli's equation — then see why, in irrotational flow, one constant covers the whole field and turns a velocity potential into a pressure map._

Sources: Lec 10 · slides 9–11; Lec 11 · slide 2; Fox & McDonald pp. 221–222

- [ ] 1. Steady Euler equation along a streamline — Lec 10 · slides 9–10
- [ ] 2. The Bernoulli equation (steady, inviscid, incompressible) — Lec 10 · slide 11
- [ ] 3. Bernoulli between any two points in irrotational flow — Fox & McDonald pp. 221–222
- [ ] 4. Pressure field from a velocity potential — Lec 11 · slide 2

33 formulas · 7 solved examples · 13 practice problems · 16 quiz questions · 12 flashcards

## Unit B — Plane Potential Flows

Building blocks of inviscid, irrotational flow — uniform flow, sources, sinks, vortices — and superposing them into real shapes.

### B1. Flow Nets: Streamlines & Equipotentials

_Put φ and ψ to work: read velocities in Cartesian and polar form, see why streamlines and equipotentials cross at right angles, and read speed, flow rate and pressure straight off a flow net._

Sources: Lec 12 · slides 2–7; Fox & McDonald p. 224; Fox & McDonald p. 222

- [ ] 1. Velocities from φ and ψ — Cartesian & polar form — Lec 12 · slides 2–4
- [ ] 2. Equipotentials are orthogonal to streamlines — Lec 12 · slide 5; Fox & McDonald p. 224
- [ ] 3. Flow nets: spacing, speed & flow rate — Lec 12 · slides 6–7

18 formulas · 6 solved examples · 9 practice problems · 12 quiz questions · 11 flashcards

### B2. Uniform Flow, Source & Sink

_The first building blocks of plane potential flow — a straight uniform stream and a radial line source or sink: their φ, ψ, velocities, flow rates and pressures._

Sources: Lec 12 · slides 8–10; Lec 12 · slides 2–3, 5–6; Lec 12 · slides 16–18; Lec 10 · slides 2, 8; Fox & McDonald pp. 222–223

- [ ] 1. Uniform flow — along x and at an angle α — Lec 12 · slides 8–9
- [ ] 2. Line source and sink — Lec 12 · slide 10

16 formulas · 4 solved examples · 10 practice problems · 14 quiz questions · 11 flashcards

### B3. Vortex, Circulation & Free vs Forced Vortex

_Fluid that swirls round a point without rotating, the rigid-body vortex that does rotate, circulation Γ as the measure of vortex strength — and the dip in the free surface above a draining tank._

Sources: Lec 12 · slides 11–15; Lec 12 · slide 19

- [ ] 1. The free vortex: concentric streamlines, irrotational motion — Lec 12 · slides 11–12
- [ ] 2. Free (irrotational) vs forced (rotational) vortex — Lec 12 · slides 12–13
- [ ] 3. Circulation and vortex strength Γ — Lec 12 · slides 14–15
- [ ] 4. Application: free-surface shape of a draining-tank vortex — Lec 12 · slide 19

20 formulas · 9 solved examples · 16 practice problems · 16 quiz questions · 13 flashcards

### B4. Superposition & the Half-Body

_Add a uniform stream to a line source and a blunt-nosed body appears — its stagnation point, shape, speeds and pressures all follow from one summed stream function._

Sources: Lec 12 · slides 16–18

- [ ] 1. The method of superposition — Lec 12 · slide 16
- [ ] 2. Half-body: stagnation point & dividing streamline — Lec 12 · slides 16–17
- [ ] 3. Velocity and pressure on the half-body — Lec 12 · slide 18

17 formulas · 5 solved examples · 12 practice problems · 14 quiz questions · 10 flashcards

## Unit C — Dimensional Analysis & Similitude

Reduce many variables to a few dimensionless groups with the Buckingham Pi theorem, and scale model tests to prototypes.

### C1. Dimensions, Homogeneity & Nondimensional Equations

_Why a five-variable pipe problem collapses onto one curve: basic dimensions (MLT or FLT), dimensional homogeneity, and what the nondimensional Navier–Stokes equations reveal through 1/Re and gL/V∞²._

Sources: Lec 13 · slides 2–4; Fox & McDonald pp. 245–249

- [ ] 1. Why dimensional analysis? The pipe pressure-drop problem — Lec 13 · slides 2–3; Fox & McDonald pp. 245, 247–249
- [ ] 2. Basic dimensions (MLT or FLT) and dimensional homogeneity — Lec 13 · slides 3–4
- [ ] 3. Nondimensionalizing the governing equations — Fox & McDonald pp. 246–247

29 formulas · 8 solved examples · 21 practice problems · 18 quiz questions · 12 flashcards

### C2. Buckingham Pi Theorem & Method of Repeating Variables

_k variables, r reference dimensions, k − r dimensionless pi terms: the theorem, the 9-step recipe, the two lecture examples (pipe pressure drop, paint-can bottom) and the dimensional-matrix rank that settles r for certain._

Sources: Lec 13 · slides 5–20; Fox & McDonald pp. 249–255

- [ ] 1. The Buckingham pi theorem: k − r dimensionless products — Lec 13 · slides 5–6; Fox & McDonald p. 249
- [ ] 2. Method of repeating variables (the 9 steps) — Lec 13 · slides 7–12, 17; Fox & McDonald p. 250
- [ ] 3. Worked: pressure drop per unit length in a pipe — Lec 13 · slides 12–16
- [ ] 4. Worked: deflection of a paint-can bottom — Lec 13 · slides 18–20
- [ ] 5. Dimensional matrix, rank & Fox Examples 7.1–7.3 — Fox & McDonald pp. 250–255

24 formulas · 11 solved examples · 47 practice problems · 24 quiz questions · 12 flashcards

### C3. Significant Dimensionless Groups

_Reynolds, Euler, cavitation, Froude, Weber, Mach, Cauchy and Strouhal numbers — each one a ratio of two forces that tells you, before any analysis, which physics controls a flow._

Sources: Fox & McDonald pp. 255–257; Fox & McDonald pp. 268–269; Fox & McDonald p. 245; Lec 13 · slide 21

- [ ] 1. Dimensionless groups as force ratios — Fox & McDonald p. 255
- [ ] 2. Reynolds, Euler, cavitation, Froude, Weber & Mach numbers — Fox & McDonald pp. 255–257; Lec 13 · slide 21

17 formulas · 8 solved examples · 17 practice problems · 20 quiz questions · 12 flashcards

### C4. Flow Similarity & Model Studies

_How a small model in a tunnel or towing tank predicts the forces on a ship, a bus or a pump — and what to do when not every Π group can be matched._

Sources: Fox & McDonald pp. 257–269

- [ ] 1. Geometric, kinematic & dynamic similarity — Fox & McDonald pp. 257–259
- [ ] 2. Incomplete similarity: ships, rivers, vehicles — Fox & McDonald pp. 259–264
- [ ] 3. Scaling with multiple dependent parameters: pumps & fans — Fox & McDonald pp. 264–267
- [ ] 4. Comments on model testing & special facilities — Fox & McDonald pp. 267–268

23 formulas · 8 solved examples · 46 practice problems · 19 quiz questions · 12 flashcards

## Unit D — Internal & Turbulent Flow

Time-averaging, Reynolds stresses, mixing length, the universal velocity profile, friction factors, k–ε modelling, analogies and jets.

### D1. Internal Flow Basics: Laminar vs Turbulent & Wall Shear

_Pipe flow is laminar or turbulent depending on Re; it needs an entrance length to become fully developed; and once it is, a simple force balance fixes a linear shear-stress profile — carried by viscosity near the wall and by Reynolds stress in the core._

Sources: Fox & McDonald pp. 275–277; Fox & McDonald pp. 293–294

- [ ] 1. Laminar vs turbulent internal flow — Fox & McDonald p. 276
- [ ] 2. Entrance region & entrance length — Fox & McDonald p. 277
- [ ] 3. Shear-stress distribution in fully developed pipe flow — Fox & McDonald pp. 293–294

15 formulas · 9 solved examples · 13 practice problems · 15 quiz questions · 11 flashcards

### D2. The Nature of Turbulence & Time Averaging

_What turbulence is (and is not), how eddies hand energy down to the Kolmogorov limit, and how a chaotic velocity signal is split into a steady mean plus a zero-mean fluctuation whose RMS measures the turbulence intensity._

Sources: Wilkes pp. 480–484; Fox & McDonald p. 293

- [ ] 1. What turbulence is (and is not) — Wilkes pp. 480–482
- [ ] 2. Eddies and the energy cascade — Wilkes pp. 481–482
- [ ] 3. Time averaging & Reynolds decomposition — Wilkes pp. 482–483
- [ ] 4. Turbulence intensity — Wilkes p. 484

14 formulas · 8 solved examples · 15 practice problems · 16 quiz questions · 13 flashcards

### D3. Reynolds-Averaged Equations & Reynolds Stresses

_Time-average the continuity and momentum equations, find the extra “Reynolds stresses” −ρ·mean(v′ᵢv′ⱼ) that the nonlinear terms leave behind, and see why only correlated velocity fluctuations carry momentum across a plane._

Sources: Wilkes pp. 484–488; Fox & McDonald pp. 293–294

- [ ] 1. Time-averaged continuity — Wilkes p. 484
- [ ] 2. Time-averaged momentum (RANS) equations — Wilkes pp. 484–486
- [ ] 3. Example 9.1: why correlated fluctuations matter — Wilkes pp. 486–487
- [ ] 4. Physical meaning of the Reynolds stresses — Wilkes pp. 487–488

20 formulas · 7 solved examples · 13 practice problems · 19 quiz questions · 11 flashcards

### D4. Mixing-Length Theory & Eddy Viscosity

_Prandtl's eddy model turns the unknown Reynolds stress into a gradient law, τᵗ = ρℓ²|dv̄/dy| dv̄/dy — and pressure-drop and velocity measurements in pipes tell us how large ℓ and the eddy viscosity really are._

Sources: Wilkes pp. 488–493; Fox & McDonald pp. 293–294

- [ ] 1. Eddy kinematic viscosity — Wilkes pp. 488–489
- [ ] 2. Prandtl's mixing-length model — Wilkes pp. 489–490
- [ ] 3. Eddy transport of heat & mass (Table 9.1) — Wilkes p. 490
- [ ] 4. Determining eddy viscosity and mixing length in pipes (Nikuradse data) — Wilkes pp. 491–493

27 formulas · 7 solved examples · 17 practice problems · 22 quiz questions · 12 flashcards

### D5. Universal Velocity Profile & the Laminar Sublayer

_From Prandtl’s mixing-length hypothesis to the logarithmic law, the wall variables y⁺ and v⁺, the three-layer smooth-pipe profile and the thickness of the laminar sublayer._

Sources: Wilkes pp. 493–501; Fox & McDonald pp. 294–295

- [ ] 1. The log law from the Prandtl hypothesis — Wilkes pp. 493–495
- [ ] 2. Universal velocity profile for smooth pipes — Wilkes pp. 495–497
- [ ] 3. Thickness of the laminar sublayer — Wilkes pp. 499–500; Wilkes p. 501

25 formulas · 6 solved examples · 17 practice problems · 20 quiz questions · 12 flashcards

### D6. Friction Factor: Smooth & Rough Pipes, Blasius & Power Law

_Integrate the universal velocity profile to get the smooth-pipe friction law, classify wall roughness with εv*/ν, use Colebrook–White, and connect the Blasius law to the one-seventh power profile._

Sources: Wilkes pp. 497–503; Fox & McDonald pp. 295–296

- [ ] 1. Friction factor for smooth pipes — Wilkes pp. 497–498
- [ ] 2. Rough pipes: velocity profiles & friction factor — Wilkes p. 501
- [ ] 3. Blasius law & the power-law velocity profile — Wilkes pp. 502–503

29 formulas · 6 solved examples · 15 practice problems · 18 quiz questions · 12 flashcards

### D7. Reynolds-Stress Correlation & the k–ε Model

_How the shear in a turbulent pipe is shared between viscosity and eddies (Churchill), how CFD closes the Reynolds stresses with two transported quantities k and ε, and what two COMSOL k–ε simulations reveal._

Sources: Wilkes pp. 503–519; Fox & McDonald pp. 293–294

- [ ] 1. Viscous vs Reynolds stress: the Churchill correlation — Wilkes pp. 503–505
- [ ] 2. The k–ε model — Wilkes pp. 506–507
- [ ] 3. CFD example: flow through an orifice plate (Example 9.4) — Wilkes pp. 508–514
- [ ] 4. CFD example: obstructed U-duct (Example 9.5) — Wilkes pp. 514–519

31 formulas · 10 solved examples · 13 practice problems · 15 quiz questions · 12 flashcards

### D8. Momentum–Heat Transfer Analogies

_Predicting heat transfer from friction: the Reynolds analogy, the Prandtl–Taylor analogy with its laminar sublayer, and how both compare with experiment (Wilkes §9.13 and Example 9.6)._

Sources: Wilkes pp. 520–524; Wilkes pp. 490–491, 496, 498–500; Fox & McDonald pp. 294, 296

- [ ] 1. The Reynolds analogy: one set of eddies, two fluxes — Wilkes pp. 520–521
- [ ] 2. The Prandtl–Taylor analogy: adding a laminar sublayer — Wilkes pp. 521–522
- [ ] 3. Evaluating the analogies (Example 9.6) — Wilkes pp. 522–524

25 formulas · 6 solved examples · 16 practice problems · 19 quiz questions · 9 flashcards

### D9. Turbulent Jets

_Free turbulence with no walls: a jet keeps its momentum flux, spreads linearly, slows down and drags in the surrounding fluid — the reason jets are such good mixers._

Sources: Wilkes pp. 524–532

- [ ] 1. Free jets: types, governing equations & momentum conservation — Wilkes pp. 524–526
- [ ] 2. Plane jet: order of magnitude & similarity solution — Wilkes pp. 526–529
- [ ] 3. Alternative eddy-viscosity model: the tanh solution — Wilkes pp. 529–530
- [ ] 4. The axisymmetric (round) jet — Wilkes pp. 530–532

37 formulas · 4 solved examples · 22 practice problems · 13 quiz questions · 12 flashcards

## Totals

23 topics · 80 concepts · 508 formulas · 170 solved examples · 404 practice problems · 386 quiz questions · 269 flashcards

## Source coverage

Every content page of every PDF and the topics that use it.

### Lecture 9 — Fluid element kinematics, continuity, stream function (FM_Lec9.pdf)

13/13 content pages covered.

| Page | Topics |
|---|---|
| slide 1 | (title / reference slide) |
| slide 2 | Fluid Element Kinematics |
| slide 3 | Fluid Element Kinematics |
| slide 4 | Fluid Element Kinematics, Equations of Motion: Cauchy & Euler |
| slide 5 | Fluid Element Kinematics, Conservation of Mass — Differential Continuity Equation |
| slide 6 | Fluid Element Kinematics |
| slide 7 | Fluid Element Kinematics, Vortex, Circulation & Free vs Forced Vortex |
| slide 8 | Fluid Element Kinematics, Vortex, Circulation & Free vs Forced Vortex |
| slide 9 | Fluid Element Kinematics |
| slide 10 | Conservation of Mass — Differential Continuity Equation |
| slide 11 | Conservation of Mass — Differential Continuity Equation |
| slide 12 | Conservation of Mass — Differential Continuity Equation, The Stream Function, Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow |
| slide 13 | The Stream Function |
| slide 14 | The Stream Function |
| slide 15 | (title / reference slide) |

### Lecture 10 — Equations of motion, Euler, velocity potential, Laplace (FM_Lec10.pdf)

10/10 content pages covered.

| Page | Topics |
|---|---|
| slide 1 | (title / reference slide) |
| slide 2 | Conservation of Mass — Differential Continuity Equation, The Stream Function, Velocity Potential & Laplace's Equation, Uniform Flow, Source & Sink |
| slide 3 | Equations of Motion: Cauchy & Euler |
| slide 4 | Equations of Motion: Cauchy & Euler |
| slide 5 | Equations of Motion: Cauchy & Euler, From Euler to Bernoulli: Inviscid Flow |
| slide 6 | Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow |
| slide 7 | Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow |
| slide 8 | Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow, Uniform Flow, Source & Sink |
| slide 9 | From Euler to Bernoulli: Inviscid Flow |
| slide 10 | From Euler to Bernoulli: Inviscid Flow |
| slide 11 | From Euler to Bernoulli: Inviscid Flow, Vortex, Circulation & Free vs Forced Vortex |
| slide 12 | (title / reference slide) |

### Lecture 11 — Worked problems: stream function & velocity potential (FM_Lec11.pdf)

1/1 content pages covered.

| Page | Topics |
|---|---|
| slide 1 | (title / reference slide) |
| slide 2 | Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow |

### Lecture 12 — Basic plane potential flows & superposition (FM_Lec12.pdf)

18/18 content pages covered.

| Page | Topics |
|---|---|
| slide 1 | (title / reference slide) |
| slide 2 | Velocity Potential & Laplace's Equation, Flow Nets: Streamlines & Equipotentials, Uniform Flow, Source & Sink |
| slide 3 | Velocity Potential & Laplace's Equation, Flow Nets: Streamlines & Equipotentials, Uniform Flow, Source & Sink, Vortex, Circulation & Free vs Forced Vortex |
| slide 4 | Velocity Potential & Laplace's Equation, Flow Nets: Streamlines & Equipotentials, Vortex, Circulation & Free vs Forced Vortex |
| slide 5 | Flow Nets: Streamlines & Equipotentials, Uniform Flow, Source & Sink |
| slide 6 | Flow Nets: Streamlines & Equipotentials, Uniform Flow, Source & Sink |
| slide 7 | Flow Nets: Streamlines & Equipotentials |
| slide 8 | Uniform Flow, Source & Sink, Superposition & the Half-Body |
| slide 9 | Uniform Flow, Source & Sink |
| slide 10 | Conservation of Mass — Differential Continuity Equation, Uniform Flow, Source & Sink, Vortex, Circulation & Free vs Forced Vortex, Superposition & the Half-Body |
| slide 11 | Vortex, Circulation & Free vs Forced Vortex |
| slide 12 | Vortex, Circulation & Free vs Forced Vortex |
| slide 13 | Vortex, Circulation & Free vs Forced Vortex |
| slide 14 | Vortex, Circulation & Free vs Forced Vortex |
| slide 15 | Vortex, Circulation & Free vs Forced Vortex |
| slide 16 | Uniform Flow, Source & Sink, Superposition & the Half-Body |
| slide 17 | Uniform Flow, Source & Sink, Superposition & the Half-Body |
| slide 18 | Uniform Flow, Source & Sink, Superposition & the Half-Body |
| slide 19 | Vortex, Circulation & Free vs Forced Vortex |

### Lecture 13 — Dimensional analysis & Buckingham Pi theorem (FM_Lec13.pdf)

20/20 content pages covered.

| Page | Topics |
|---|---|
| slide 1 | (title / reference slide) |
| slide 2 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| slide 3 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| slide 4 | Dimensions, Homogeneity & Nondimensional Equations |
| slide 5 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| slide 6 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| slide 7 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 8 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 9 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 10 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 11 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 12 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 13 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 14 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 15 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 16 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| slide 17 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 18 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 19 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 20 | Buckingham Pi Theorem & Method of Repeating Variables |
| slide 21 | Significant Dimensionless Groups |

### Fox & McDonald's Introduction to Fluid Mechanics — excerpt (Fox and McDonalds (1).pdf)

41/41 content pages covered.

| Page | Topics |
|---|---|
| p. 221 | Equations of Motion: Cauchy & Euler, Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow, Vortex, Circulation & Free vs Forced Vortex |
| p. 222 | Velocity Potential & Laplace's Equation, From Euler to Bernoulli: Inviscid Flow, Flow Nets: Streamlines & Equipotentials, Uniform Flow, Source & Sink, Vortex, Circulation & Free vs Forced Vortex |
| p. 223 | Velocity Potential & Laplace's Equation, Uniform Flow, Source & Sink |
| p. 224 | Velocity Potential & Laplace's Equation, Flow Nets: Streamlines & Equipotentials |
| p. 245 | Dimensions, Homogeneity & Nondimensional Equations, Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 246 | Conservation of Mass — Differential Continuity Equation, Dimensions, Homogeneity & Nondimensional Equations |
| p. 247 | Equations of Motion: Cauchy & Euler, Dimensions, Homogeneity & Nondimensional Equations, Significant Dimensionless Groups |
| p. 248 | Dimensions, Homogeneity & Nondimensional Equations |
| p. 249 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| p. 250 | Buckingham Pi Theorem & Method of Repeating Variables |
| p. 251 | Buckingham Pi Theorem & Method of Repeating Variables |
| p. 252 | Buckingham Pi Theorem & Method of Repeating Variables |
| p. 253 | Buckingham Pi Theorem & Method of Repeating Variables |
| p. 254 | Buckingham Pi Theorem & Method of Repeating Variables |
| p. 255 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables, Significant Dimensionless Groups |
| p. 256 | Dimensions, Homogeneity & Nondimensional Equations, Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 257 | Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 258 | Flow Similarity & Model Studies |
| p. 259 | Flow Similarity & Model Studies |
| p. 260 | Flow Similarity & Model Studies |
| p. 261 | Flow Similarity & Model Studies |
| p. 262 | Flow Similarity & Model Studies |
| p. 263 | Flow Similarity & Model Studies |
| p. 264 | Flow Similarity & Model Studies |
| p. 265 | Flow Similarity & Model Studies |
| p. 266 | Flow Similarity & Model Studies |
| p. 267 | Flow Similarity & Model Studies |
| p. 268 | Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 269 | Dimensions, Homogeneity & Nondimensional Equations, Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 270 | Dimensions, Homogeneity & Nondimensional Equations, Buckingham Pi Theorem & Method of Repeating Variables |
| p. 271 | Buckingham Pi Theorem & Method of Repeating Variables |
| p. 272 | Buckingham Pi Theorem & Method of Repeating Variables, Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 273 | Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 274 | Significant Dimensionless Groups, Flow Similarity & Model Studies |
| p. 275 | Internal Flow Basics: Laminar vs Turbulent & Wall Shear |
| p. 276 | Internal Flow Basics: Laminar vs Turbulent & Wall Shear |
| p. 277 | Internal Flow Basics: Laminar vs Turbulent & Wall Shear |
| p. 293 | Internal Flow Basics: Laminar vs Turbulent & Wall Shear, The Nature of Turbulence & Time Averaging, Reynolds-Averaged Equations & Reynolds Stresses, Mixing-Length Theory & Eddy Viscosity, Reynolds-Stress Correlation & the k–ε Model |
| p. 294 | Internal Flow Basics: Laminar vs Turbulent & Wall Shear, Reynolds-Averaged Equations & Reynolds Stresses, Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Reynolds-Stress Correlation & the k–ε Model, Momentum–Heat Transfer Analogies |
| p. 295 | Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 296 | Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Momentum–Heat Transfer Analogies |

### Wilkes, Fluid Mechanics for Chemical Engineers — Ch. 9 Turbulent Flow (Wilke's Fluid Mechanics for Chemical Engineers-499-560.pdf)

62/62 content pages covered.

| Page | Topics |
|---|---|
| p. 480 | The Nature of Turbulence & Time Averaging |
| p. 481 | The Nature of Turbulence & Time Averaging |
| p. 482 | The Nature of Turbulence & Time Averaging |
| p. 483 | The Nature of Turbulence & Time Averaging, Reynolds-Averaged Equations & Reynolds Stresses |
| p. 484 | Conservation of Mass — Differential Continuity Equation, The Nature of Turbulence & Time Averaging, Reynolds-Averaged Equations & Reynolds Stresses |
| p. 485 | Reynolds-Averaged Equations & Reynolds Stresses |
| p. 486 | Reynolds-Averaged Equations & Reynolds Stresses |
| p. 487 | Reynolds-Averaged Equations & Reynolds Stresses, Mixing-Length Theory & Eddy Viscosity |
| p. 488 | Reynolds-Averaged Equations & Reynolds Stresses, Mixing-Length Theory & Eddy Viscosity |
| p. 489 | Mixing-Length Theory & Eddy Viscosity |
| p. 490 | Mixing-Length Theory & Eddy Viscosity, Momentum–Heat Transfer Analogies |
| p. 491 | Mixing-Length Theory & Eddy Viscosity, Momentum–Heat Transfer Analogies |
| p. 492 | Mixing-Length Theory & Eddy Viscosity |
| p. 493 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer |
| p. 494 | Universal Velocity Profile & the Laminar Sublayer |
| p. 495 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Reynolds-Stress Correlation & the k–ε Model |
| p. 496 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Reynolds-Stress Correlation & the k–ε Model, Momentum–Heat Transfer Analogies |
| p. 497 | Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 498 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Momentum–Heat Transfer Analogies |
| p. 499 | Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Momentum–Heat Transfer Analogies |
| p. 500 | Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Momentum–Heat Transfer Analogies |
| p. 501 | Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 502 | Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 503 | Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Reynolds-Stress Correlation & the k–ε Model |
| p. 504 | Mixing-Length Theory & Eddy Viscosity, Reynolds-Stress Correlation & the k–ε Model |
| p. 505 | Reynolds-Stress Correlation & the k–ε Model |
| p. 506 | The Nature of Turbulence & Time Averaging, Reynolds-Stress Correlation & the k–ε Model |
| p. 507 | Reynolds-Stress Correlation & the k–ε Model |
| p. 508 | Reynolds-Stress Correlation & the k–ε Model |
| p. 509 | Reynolds-Stress Correlation & the k–ε Model |
| p. 510 | Reynolds-Stress Correlation & the k–ε Model |
| p. 511 | Reynolds-Stress Correlation & the k–ε Model |
| p. 512 | Reynolds-Stress Correlation & the k–ε Model |
| p. 513 | Reynolds-Stress Correlation & the k–ε Model |
| p. 514 | Reynolds-Stress Correlation & the k–ε Model |
| p. 515 | Reynolds-Stress Correlation & the k–ε Model |
| p. 516 | Reynolds-Stress Correlation & the k–ε Model |
| p. 517 | Reynolds-Stress Correlation & the k–ε Model |
| p. 518 | Reynolds-Stress Correlation & the k–ε Model |
| p. 519 | Reynolds-Stress Correlation & the k–ε Model |
| p. 520 | Momentum–Heat Transfer Analogies |
| p. 521 | Universal Velocity Profile & the Laminar Sublayer, Momentum–Heat Transfer Analogies |
| p. 522 | Momentum–Heat Transfer Analogies |
| p. 523 | Momentum–Heat Transfer Analogies |
| p. 524 | Momentum–Heat Transfer Analogies, Turbulent Jets |
| p. 525 | Turbulent Jets |
| p. 526 | Turbulent Jets |
| p. 527 | Turbulent Jets |
| p. 528 | Turbulent Jets |
| p. 529 | Turbulent Jets |
| p. 530 | Turbulent Jets |
| p. 531 | Turbulent Jets |
| p. 532 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Turbulent Jets |
| p. 533 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 534 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer |
| p. 535 | Mixing-Length Theory & Eddy Viscosity, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 536 | Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law |
| p. 537 | Universal Velocity Profile & the Laminar Sublayer, Momentum–Heat Transfer Analogies |
| p. 538 | Universal Velocity Profile & the Laminar Sublayer, Momentum–Heat Transfer Analogies |
| p. 539 | Turbulent Jets |
| p. 540 | The Nature of Turbulence & Time Averaging, Reynolds-Averaged Equations & Reynolds Stresses, Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Momentum–Heat Transfer Analogies, Turbulent Jets |
| p. 541 | Reynolds-Averaged Equations & Reynolds Stresses, Mixing-Length Theory & Eddy Viscosity, Universal Velocity Profile & the Laminar Sublayer, Friction Factor: Smooth & Rough Pipes, Blasius & Power Law, Momentum–Heat Transfer Analogies |
