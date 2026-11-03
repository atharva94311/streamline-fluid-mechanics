import type { ProblemSet, QuizQ } from '@/lib/types'
import { md } from '@/kit'

/*
 * Wilkes, Fluid Mechanics for Chemical Engineers, Chapter 9 end-of-chapter problems
 * 9.17–9.24, 9.26 (turbulent jets, printed pp. 539–540) and the true/false Problem 9.27(a)–(u)
 * (printed pp. 540–541). The book prints statements only; every solution below was written for
 * this platform. Numbers were verified numerically (Euler/RK4 integration, finite differences).
 */

const P = (page: string, n: string) => ({ doc: 'wilkes' as const, pages: page, note: `Problem ${n}` })
const W = (pages: string, note?: string) => (note ? { doc: 'wilkes' as const, pages, note } : { doc: 'wilkes' as const, pages })
const TF = ['True', 'False']

/* ------------------------------------------------------------------ */
/*  Problem 9.27 true/false items, grouped by target topic             */
/* ------------------------------------------------------------------ */

const tfTurbulenceNature: QuizQ[] = [
  {
    id: 'w9-27a',
    concept: 'time-averaging',
    difficulty: 1,
    src: [P('540', '9.27(a)'), W('483', 'Fig. 9.3')],
    q: md`**True or false?** Turbulent fluctuations typically occur in a matter of *microseconds*.`,
    options: TF,
    answer: 1,
    explain: md`**False.** Wilkes (p. 483, Fig. 9.3) says the velocity fluctuations change very rapidly, typically over a period of a few **milliseconds** — not microseconds. That is why an averaging time $T$ of a few *seconds* is long enough to define a time average $\bar v_x$. The tempting "true" comes from thinking "very fast" must mean the smallest unit you know; the book's time scale is three orders of magnitude longer.`,
  },
]

const tfReynoldsStresses: QuizQ[] = [
  {
    id: 'w9-27b',
    concept: 'averaged-continuity',
    difficulty: 1,
    src: [P('540', '9.27(b)'), W('484', 'Eq. (9.8)')],
    q: md`**True or false?** The time-averaged continuity equation contains the time-averaged velocities instead of the instantaneous velocities.`,
    options: TF,
    answer: 0,
    explain: md`**True.** Continuity is *linear* in the velocities, so averaging each term simply replaces $v_x, v_y, v_z$ by $\bar v_x, \bar v_y, \bar v_z$ (Eq. 9.8, p. 484): $\pd{\bar v_x}{x}+\pd{\bar v_y}{y}+\pd{\bar v_z}{z}=0$. No extra terms appear — unlike the momentum equations, whose nonlinear convective terms generate Reynolds stresses.`,
  },
  {
    id: 'w9-27c',
    concept: 'averaged-momentum',
    difficulty: 1,
    src: [P('540', '9.27(c)'), W('485–486', 'Eq. (9.13)')],
    q: md`**True or false?** Extra terms, known as the Reynolds stresses, occur when the momentum balances are time-averaged.`,
    options: TF,
    answer: 0,
    explain: md`**True.** Averaging the nonlinear products such as $v_x v_y$ leaves $\bar v_x\bar v_y + \overline{v_x'v_y'}$; the correlation terms are moved to the stress side and appear as additional stresses, e.g. $-\rho\overline{v_x'v_y'}$ — the Reynolds stresses (Eq. 9.13, pp. 485–486).`,
  },
  {
    id: 'w9-27d',
    concept: 'physical-interpretation',
    difficulty: 1,
    src: [P('540', '9.27(d)'), W('487', 'Fig. 9.4, Eq. (9.16)')],
    q: md`**True or false?** The Reynolds stresses can be explained by considering the transport of momentum by turbulent eddies.`,
    options: TF,
    answer: 0,
    explain: md`**True.** Section 9.2 (p. 487, Fig. 9.4) pictures eddies jumping across a plane X–X: fluid carried across by $v_y'$ brings its $x$-momentum with it, and the time-averaged net transfer gives $\tau^t_{yx}=-\rho\overline{v_y'v_x'}$ (Eq. 9.16). The Reynolds stress is therefore a momentum *flux* due to eddy motion, not a molecular stress.`,
  },
  {
    id: 'w9-27p',
    concept: 'reynolds-stress-example',
    difficulty: 2,
    src: [P('541', '9.27(p)'), W('486–487', 'Example 9.1, Table E9.1')],
    q: md`**True or false?** If the random fluctuations $v_x'$ and $v_y'$ are correlated in some way, then $\overline{v_x'v_y'}$ will not be zero.`,
    options: TF,
    answer: 0,
    explain: md`**True.** Example 9.1 (Table E9.1, pp. 486–487) averages $v_x'v_y'$ for three sets of fluctuations: correlated in concert gives $+1$, correlated in opposition gives $-1$, and independent fluctuations give $0$. So the Reynolds stresses are non-zero only when there is correlation — which turbulent flows do exhibit. Note that each $\overline{v'}$ alone is zero; it is the *product* that survives averaging.`,
  },
  {
    id: 'w9-27s',
    concept: 'averaged-momentum',
    difficulty: 2,
    src: [P('541', '9.27(s)'), W('485–486', 'Eq. (9.13)')],
    q: md`**True or false?** When the general momentum balances are time-averaged, the only significant changes are that time-averaged values (such as $\bar p$) replace the instantaneous values (such as $p$).`,
    options: TF,
    answer: 1,
    explain: md`**False.** That description fits the *continuity* equation, not the momentum balances. Averaging the momentum equations makes **two** changes (pp. 485–486): averaged quantities replace instantaneous ones **and** the extra Reynolds-stress terms $-\rho\overline{v_i'v_j'}$ appear — and in turbulent flow these extra stresses usually dominate the viscous ones.`,
  },
]

const tfMixingLength: QuizQ[] = [
  {
    id: 'w9-27e',
    concept: 'transport-analogies',
    difficulty: 1,
    src: [P('540', '9.27(e)'), W('490', 'Table 9.1')],
    q: md`**True or false?** Mixing-length theory attempts to unify the turbulent transport of momentum, heat, and mass.`,
    options: TF,
    answer: 0,
    explain: md`**True.** After obtaining $\nu_T=\ell^2\lvert d\bar v_x/dy\rvert$ for momentum, the book applies the same eddy-exchange argument to heat and to mass and collects all three in Table 9.1 (p. 490), using $\alpha_T=\mathcal{D}_T=\nu_T$. The book adds that this equality holds only as a first approximation — but the *attempt* to treat all three with one model is exactly what the statement says.`,
  },
  {
    id: 'w9-27f',
    concept: 'prandtl-mixing-length',
    difficulty: 1,
    src: [P('540', '9.27(f)'), W('493', 'Eq. (9.33)')],
    q: md`**True or false?** The Prandtl hypothesis assumes that the mixing length $\ell$ does not depend on the distance from the wall.`,
    options: TF,
    answer: 1,
    explain: md`**False.** Prandtl assumed the opposite: $\ell$ is **directly proportional** to the distance $y$ from the wall, $\ell=ky$ (Eq. 9.33, p. 493). Eddies near a wall are squeezed — they can only be as large as the space available — so $\ell\to0$ at the wall.`,
  },
  {
    id: 'w9-27n',
    concept: 'prandtl-mixing-length',
    difficulty: 2,
    src: [P('541', '9.27(n)'), W('492–493', 'Eqs. (9.29), (9.33)–(9.34)')],
    q: md`**True or false?** The Prandtl hypothesis, $\ell = ky$, somewhat underestimates the mixing length for general values of $y$.`,
    options: TF,
    answer: 1,
    explain: md`**False.** It **overestimates** $\ell$. Nikuradse's measured mixing length (Eq. 9.29, Fig. 9.7, p. 492) follows $\ell=0.4y$ only near the wall and then levels off at $\ell/a=0.14$ on the centerline, below the straight line $ky$. The book notes (p. 493) that $\ell=ky$ and $\tau^t\doteq\tau_w$ are *both* overestimates, and their errors fortuitously cancel to give an excellent log profile.`,
  },
]

const tfVelocityProfiles: QuizQ[] = [
  {
    id: 'w9-27g',
    concept: 'log-law',
    difficulty: 1,
    src: [P('540', '9.27(g)'), W('493–494', 'Eqs. (9.33)–(9.37)')],
    q: md`**True or false?** The Prandtl hypothesis, in conjunction with the assumption of an approximately constant shear stress, leads to a logarithmic-type velocity profile.`,
    options: TF,
    answer: 0,
    explain: md`**True.** With $\ell=ky$ and $\tau^t\doteq\tau_w$: $\tau_w/\rho=k^2y^2(d\bar v_z/dy)^2$, so $d\bar v_z/dy=\sqrt{\tau_w/\rho}/(ky)$, which integrates to $\bar v_z=\frac{1}{k}\sqrt{\tau_w/\rho}\,\ln y+c$ (Eq. 9.37, pp. 493–494).`,
  },
  {
    id: 'w9-27h',
    concept: 'sublayer',
    difficulty: 1,
    src: [P('541', '9.27(h)'), W('500, 521')],
    q: md`**True or false?** The laminar sublayer is a thin region next to the wall, in which turbulent fluctuations are essentially negligible.`,
    options: TF,
    answer: 0,
    explain: md`**True.** The sublayer is an extremely thin region at the wall (p. 500) in which turbulent effects are negligible, so momentum is transported by viscous action and heat by conduction (Prandtl–Taylor model, p. 521). The wall itself damps the eddies there.`,
  },
  {
    id: 'w9-27j',
    concept: 'universal-profile',
    difficulty: 2,
    src: [P('541', '9.27(j)'), W('496–499', 'Eqs. (9.43)–(9.46), (9.56)')],
    q: md`**True or false?** In the universal velocity profile, the junction between the laminar sublayer and the turbulent core occurs at approximately $y^+ = 25$.`,
    options: TF,
    answer: 1,
    explain: md`**False.** In the two-piece model the lines $v^+=y^+$ and $v^+=5.5+2.5\ln y^+$ intersect at $y^+\doteq11.6$ (pp. 496, 499, Eq. 9.56). In the three-region model the sublayer ends at $y^+=5$ and the turbulent core starts at $y^+=30$, with a buffer zone between (p. 497). The value 25 matches neither junction — it lies inside the buffer zone.`,
  },
  {
    id: 'w9-27k',
    concept: 'sublayer',
    difficulty: 1,
    src: [P('541', '9.27(k)'), W('499–500', 'Eqs. (9.58)–(9.60)')],
    q: md`**True or false?** The thickness of the laminar sublayer increases as the Reynolds number increases.`,
    options: TF,
    answer: 1,
    explain: md`**False.** It **decreases**: more vigorous eddies penetrate closer to the wall (p. 499). Quantitatively $\delta/D=58.3/\Rey^{7/8}$ (Eq. 9.60, p. 500), almost inversely proportional to $\Rey$. Do not confuse this with a laminar *boundary layer* on a plate, whose thickness grows with *distance* $x$.`,
  },
  {
    id: 'w9-27t',
    concept: 'sublayer',
    difficulty: 3,
    src: [P('541', '9.27(t)'), W('500', 'Eqs. (9.60), (9.62), (9.63)')],
    q: md`**True or false?** For flow in a smooth pipe of diameter $D = 12$ in. with $\Rey = 10^5$, the thickness of the laminar sublayer is $0.138 \pm 0.02$ in.`,
    options: TF,
    answer: 1,
    explain: md`**False.** $\Rey^{7/8}=10^{4.375}=2.37\times10^4$. Eq. (9.60): $\delta/D=58.3/(2.37\times10^4)=2.46\times10^{-3}$, so $\delta=0.0295$ in. The alternatives on p. 500 give $61.7/\Rey^{7/8}\Rightarrow0.031$ in. (Eq. 9.62) and $25.2/\Rey^{7/8}\Rightarrow0.013$ in. (Eq. 9.63, three-region model). All are far below $0.138\pm0.02$ in. — the sublayer is about a few hundredths of an inch thick, roughly 0.25 % of the diameter.`,
  },
]

const tfFrictionFactor: QuizQ[] = [
  {
    id: 'w9-27l',
    concept: 'rough-pipe',
    difficulty: 1,
    src: [P('541', '9.27(l)'), W('501', 'Eq. (9.70)')],
    q: md`**True or false?** The Colebrook and White equation gives the friction factor for both laminar and turbulent flow in a pipe.`,
    options: TF,
    answer: 1,
    explain: md`**False.** Colebrook–White (Eq. 9.70, p. 501) correlates $f_F$ against relative roughness and Reynolds number over a very wide range of roughnesses and **turbulent** Reynolds numbers only. Laminar pipe flow needs no correlation at all: $f_F=16/\Rey$, independent of roughness.`,
  },
  {
    id: 'w9-27m',
    concept: 'blasius-power-law',
    difficulty: 2,
    src: [P('541', '9.27(m)'), W('502', 'Eqs. (9.71)–(9.77)')],
    q: md`**True or false?** The Blasius law, $f_F = 0.079\,\Rey^{-1/4}$, is consistent with the one-seventh power law turbulent velocity profile.`,
    options: TF,
    answer: 0,
    explain: md`**True.** For a friction law $f_F=A\,\Rey^{-1/n}$, the book shows (Eq. 9.77, p. 502) that the matching power-law profile has exponent $m=1/(2n-1)$. Blasius has $n=4$, so $m=1/7$ — the familiar one-seventh law.`,
  },
  {
    id: 'w9-27r',
    concept: 'rough-pipe',
    difficulty: 1,
    src: [P('541', '9.27(r)'), W('501', 'Eq. (9.64)')],
    q: md`**True or false?** A hydraulically smooth pipe is one in which the "hills" on the wall do not extend beyond the laminar sublayer.`,
    options: TF,
    answer: 0,
    explain: md`**True.** Wall irregularities may or may not project through the laminar sublayer (p. 501). If they stay buried in it ($0<\varepsilon\bar v_z^*/\nu<5$, Eq. 9.64) they do not disturb the turbulent core and $f_F$ depends on $\Rey$ only — the hydraulically smooth regime. Note the same pipe can become "rough" at higher $\Rey$ because the sublayer thins.`,
  },
]

const tfHeatTransfer: QuizQ[] = [
  {
    id: 'w9-27i',
    concept: 'reynolds-analogy',
    difficulty: 2,
    src: [P('541', '9.27(i)'), W('498, 521', 'Eq. (9.51), Eq. (9.99)')],
    q: md`**True or false?** A friction factor is the ratio of the wall shear-stress effects to inertial effects.`,
    options: TF,
    answer: 0,
    explain: md`**True.** $f_F=\tau_w/(\tfrac12\rho\bar v_{zm}^2)$ (Eq. 9.51, p. 498): wall shear stress over a dynamic (inertial) pressure. In the Reynolds-analogy discussion (p. 521) the book reads it as the ratio of the overall momentum transport to the wall to inertial effects in the mainstream, which the analogy equates with the corresponding heat-transfer ratio, the Stanton number.`,
  },
  {
    id: 'w9-27o',
    concept: 'analogy-evaluation',
    difficulty: 1,
    src: [P('541', '9.27(o)'), W('523', 'Eq. (E9.6.7)')],
    q: md`**True or false?** The Prandtl number is the ratio of the kinematic viscosity to the thermal diffusivity.`,
    options: TF,
    answer: 0,
    explain: md`**True.** $\Pran=\mu c_p/k=(\mu/\rho)/(k/\rho c_p)=\nu/\alpha$ (Eq. E9.6.7, p. 523). Do not invert it: the *thermal* diffusivity is in the denominator.`,
  },
  {
    id: 'w9-27q',
    concept: 'reynolds-analogy',
    difficulty: 1,
    src: [P('541', '9.27(q)'), W('520')],
    q: md`**True or false?** In the simple model discussed for turbulence, the same eddies can transport mass, momentum, and thermal energy.`,
    options: TF,
    answer: 0,
    explain: md`**True.** The basis of §9.13 (p. 520) is that eddies carrying momentum toward the wall also carry heat (and species), so the same exchange model applies to all three — the foundation of the Reynolds analogy.`,
  },
  {
    id: 'w9-27u',
    concept: 'analogy-evaluation',
    difficulty: 3,
    src: [P('541', '9.27(u)'), W('523', 'Eq. (E9.6.7)')],
    q: md`**True or false?** For a turbulent eddy, a high Prandtl number means that its momentum content is likely to be dissipated more quickly than its thermal energy content before it reaches its destination.`,
    options: TF,
    answer: 0,
    explain: md`**True.** $\Pran=\nu/\alpha$, and $\nu$ and $\alpha$ are the rates at which momentum and heat diffuse by molecular action (p. 523). A high $\Pran$ means $\nu\gg\alpha$: the eddy loses (shares with its surroundings) its momentum faster than its heat on its journey. The simple Reynolds analogy ignores this difference — which is why it agrees with experiment only near $\Pran=1$ (Table E9.6).`,
  },
]

/* ------------------------------------------------------------------ */
/*  The problem sets                                                   */
/* ------------------------------------------------------------------ */

export const sets: ProblemSet[] = [
  {
    id: 'wilkes9b-turbulent-jets',
    topic: 'turbulent-jets',
    title: 'Wilkes Ch. 9 — Problems 9.17–9.24, 9.26: plane and axisymmetric turbulent jets',
    src: { doc: 'wilkes', pages: '539–540', note: 'Problems 9.17–9.24, 9.26' },
    intro: md`Similarity solutions for free jets: order-of-magnitude exponents, the mixing-length ODE and its numerical solution, the tanh eddy-viscosity solution, streamlines, entrainment and the round jet.`,
    problems: [
      /* ----------------------------- 9.17 ----------------------------- */
      {
        id: 'w9-17',
        concept: 'plane-jet-similarity',
        difficulty: 3,
        src: P('539', '9.17'),
        q: md`**Theory for a plane turbulent jet.** Starting from the development in §9.14, prove Eq. (9.114). The ingredients are:

- the boundary-layer momentum balance $\bar v_x\pd{\bar v_x}{x}+\bar v_y\pd{\bar v_x}{y}=\dfrac1\rho\pd{\bar\tau^t_{yx}}{y}$ (9.104);
- the mixing-length stress $\bar\tau^t_{yx}=\rho\,\ell^2\left\lvert\pd{\bar v_x}{y}\right\rvert\pd{\bar v_x}{y}$ (9.107);
- the stream function $\bar v_x=\pd{\psi}{y}$, $\bar v_y=-\pd{\psi}{x}$ (9.111);
- the similarity forms $\ell=\alpha x$, $\zeta=\beta y/x$, $\psi=\gamma\sqrt{x}\,f(\zeta)$ (9.112).

Show that, with $\beta=(2\alpha^2)^{-1/3}$,

$$
\left(\frac{df}{d\zeta}\right)^2+f\frac{d^2f}{d\zeta^2}=\frac{d}{d\zeta}\left(\frac{d^2f}{d\zeta^2}\right)^2 .
$$

*Platform follow-up:* Reichardt's data give $\beta=7.67$ (p. 528). What mixing-length constant $\alpha$ does this imply?`,
        hint: md`Use $\partial\zeta/\partial y=\beta/x$ and $\partial\zeta/\partial x=-\zeta/x$. For $y>0$ the velocity falls with $y$, so $f''<0$ and $\lvert f''\rvert f''=-(f'')^2$.`,
        answer: md`Substitution gives $-\dfrac{\beta^2\gamma^2}{2x^2}\left(f'^2+ff''\right)=-\dfrac{\alpha^2\beta^5\gamma^2}{x^2}\dfrac{d}{d\zeta}(f'')^2$, i.e. $f'^2+ff''=2\alpha^2\beta^3\,[(f'')^2]'$, which is (9.114) when $2\alpha^2\beta^3=1$. With $\beta=7.67$: $\alpha=(2\beta^3)^{-1/2}=0.0333$.`,
        solution: md`**1. Velocities from $\psi$.** With $\zeta=\beta y/x$: $\partial\zeta/\partial y=\beta/x$, $\partial\zeta/\partial x=-\beta y/x^2=-\zeta/x$. A prime denotes $d/d\zeta$.

$$
\bar v_x=\pd{\psi}{y}=\gamma\sqrt{x}\,f'\,\frac{\beta}{x}=\frac{\beta\gamma f'}{\sqrt x}
$$

$$
\bar v_y=-\pd{\psi}{x}=-\left[\frac{\gamma f}{2\sqrt x}+\gamma\sqrt x\,f'\left(-\frac{\zeta}{x}\right)\right]=\frac{\gamma}{\sqrt x}\left(\zeta f'-\frac f2\right)
$$

These are Eqs. (9.113); continuity (9.105) is satisfied automatically.

**2. Derivatives of $\bar v_x$.**

$$
\pd{\bar v_x}{x}=\beta\gamma\left[-\frac{f'}{2x^{3/2}}+\frac{f''}{\sqrt x}\left(-\frac{\zeta}{x}\right)\right]=-\frac{\beta\gamma}{x^{3/2}}\left(\frac{f'}{2}+\zeta f''\right),\qquad \pd{\bar v_x}{y}=\frac{\beta^2\gamma f''}{x^{3/2}}
$$

**3. Left side of (9.104).**

$$
\begin{aligned}
\bar v_x\pd{\bar v_x}{x}+\bar v_y\pd{\bar v_x}{y}
&=\frac{\beta^2\gamma^2}{x^2}\left[-f'\left(\frac{f'}{2}+\zeta f''\right)+\left(\zeta f'-\frac f2\right)f''\right]\\
&=\frac{\beta^2\gamma^2}{x^2}\left[-\frac{f'^2}{2}-\zeta f'f''+\zeta f'f''-\frac{ff''}{2}\right]
=-\frac{\beta^2\gamma^2}{2x^2}\left(f'^2+ff''\right)
\end{aligned}
$$

The $\zeta f'f''$ terms cancel — this is what makes a similarity solution possible.

**4. Right side.** With $\ell=\alpha x$:

$$
\frac{\bar\tau^t_{yx}}{\rho}=\alpha^2x^2\left(\frac{\beta^2\gamma}{x^{3/2}}\right)^2\lvert f''\rvert f''=\frac{\alpha^2\beta^4\gamma^2}{x}\,\lvert f''\rvert f''
$$

For $y>0$ the axial velocity decreases outward, so $f''<0$ and $\lvert f''\rvert f''=-(f'')^2$. Then

$$
\frac1\rho\pd{\bar\tau^t_{yx}}{y}=\frac{\beta}{x}\,\frac{d}{d\zeta}\left[-\frac{\alpha^2\beta^4\gamma^2}{x}(f'')^2\right]=-\frac{\alpha^2\beta^5\gamma^2}{x^2}\,\frac{d}{d\zeta}(f'')^2
$$

**5. Equate.** Both sides scale as $x^{-2}$ (as Table 9.2 predicted for $p=1$, $q=\tfrac12$), so $x$ drops out:

$$
-\frac{\beta^2\gamma^2}{2}\left(f'^2+ff''\right)=-\alpha^2\beta^5\gamma^2\frac{d}{d\zeta}(f'')^2
\;\Longrightarrow\;
f'^2+ff''=2\alpha^2\beta^3\,\frac{d}{d\zeta}(f'')^2
$$

$\gamma$ cancels too. Choosing $\beta^3=1/(2\alpha^2)$, i.e. $\beta=(2\alpha^2)^{-1/3}$, makes the coefficient 1 and gives Eq. (9.114). $\blacksquare$

(Since $f'^2+ff''=(ff')'$, one integration with $f=f''=0$ on the centerline gives (9.115), $ff'=(f'')^2$.)

**6. Follow-up.** $\beta^3=1/(2\alpha^2)\Rightarrow\alpha=(2\beta^3)^{-1/2}$. With $\beta=7.67$: $\beta^3=451.2$, $2\beta^3=902.4$, $\sqrt{902.4}=30.04$, so $\alpha=0.0333$ — the value the book quotes alongside $\beta=7.67$. The mixing length is only about 3 % of the distance from the slot.`,
        check: [{ label: md`$\alpha$ for $\beta=7.67$`, value: 0.0333, tol: 0.02 }],
      },

      /* ----------------------------- 9.18 ----------------------------- */
      {
        id: 'w9-18',
        concept: 'plane-jet-similarity',
        difficulty: 3,
        src: P('539', '9.18'),
        q: md`**Calculation of velocities for a plane turbulent jet.** Eq. (9.115) for the mixing-length plane jet is $f\,\dfrac{df}{d\zeta}=\left(\dfrac{d^2f}{d\zeta^2}\right)^2$.

**(a)** Verify that with the new variables $f_0=f$ and $f_1=df/d\zeta$, Eq. (9.115) can be written as *two* first-order ODEs, printed as

$$
\frac{df_0}{d\zeta}=f_1,\qquad\frac{df_1}{d\zeta}=\sqrt{f_0f_1},
$$

with the conditions $f_0=0$, $f_1=1$ at $\zeta=0$.

**(b)** Solve these with Euler's method (a spreadsheet or any ODE software) from $\zeta=0$ out to where the velocities are negligible. Try several step sizes $\Delta\zeta$ to make sure yours is small enough. Plot $f'$ (axial velocity, $\bar v_x\sqrt x/(\beta\gamma)$) and $\zeta f'-f/2$ (transverse velocity, $\bar v_y\sqrt x/\gamma$) against both negative and positive $\zeta$, using symmetry for one half.

The book's hint: if your computed values look improbable, ask whether you made the right choice when faced with an alternative.

*Check values to report:* $f'$ at $\zeta=1$; the $\zeta$ where $\zeta f'-f/2$ changes sign; the jet edge $\zeta_e$ where $f'$ reaches 0.`,
        hint: md`Taking a square root of $(f'')^2$ gives two signs. On the side $\zeta>0$ the axial velocity $f'$ must *decrease* away from the axis. Stop the integration (or clamp $f_1\ge0$) when $f_1$ hits zero.`,
        answer: md`Correct branch: $df_1/d\zeta=-\sqrt{f_0f_1}$ (the printed $+$ root makes $f'$ grow without bound). Converged results: $f'(1)\approx0.473$; $\zeta f'-f/2$ peaks at $\approx0.168$ near $\zeta=0.59$ and changes sign at $\zeta\approx1.21$; $f'=0$ at the edge $\zeta_e\approx2.42$ (where $f=1$, so $\zeta f'-f/2\to-0.5$).`,
        solution: md`**(a) Reduction to a first-order system.** Set $f_0=f$, $f_1=f'$. Then $df_0/d\zeta=f_1$ by definition and $f''=df_1/d\zeta$. Eq. (9.115) becomes $f_0f_1=(df_1/d\zeta)^2$, so

$$
\frac{df_1}{d\zeta}=\pm\sqrt{f_0f_1}
$$

The initial conditions come from the centerline: $f(0)=0$ (by symmetry $\bar v_y=0$, $\psi=0$ on the axis) and $f'(0)=1$ (an arbitrary normalisation; $\gamma$ is later chosen to fit the jet's strength).

**Which sign?** For $\zeta>0$ the axial velocity $f'$ must fall from 1 toward 0, so $f''<0$: the **negative** root is the physical one,

$$
\frac{df_0}{d\zeta}=f_1,\qquad \frac{df_1}{d\zeta}=-\sqrt{f_0f_1}
$$

With the printed $+$ root, $f'$ *grows*: Euler with $\Delta\zeta=0.01$ gives $f'(1)\approx1.83$ and $f'(2)\approx4.6$ — the "improbable values" the hint warns about.

**(b) Euler's method.** $f_0^{(n+1)}=f_0^{(n)}+\Delta\zeta\,f_1^{(n)}$, $\;f_1^{(n+1)}=f_1^{(n)}-\Delta\zeta\sqrt{f_0^{(n)}f_1^{(n)}}$, starting from $(0,1)$. Step-size study for $f'(1)$:

| $\Delta\zeta$ | 0.1 | 0.05 | 0.01 | 0.001 |
|---|---|---|---|---|
| $f'(1)$ | 0.490 | 0.480 | 0.474 | 0.473 |

The error falls roughly in proportion to $\Delta\zeta$ (first-order method); $\Delta\zeta\le0.01$ is adequate for plotting.

**Results (converged):**

| $\zeta$ | $f$ | $f'$ | $\zeta f'-f/2$ |
|---|---|---|---|
| 0 | 0 | 1.000 | 0 |
| 0.5 | 0.455 | 0.783 | 0.164 |
| 1.0 | 0.769 | 0.473 | 0.088 |
| 1.5 | 0.936 | 0.208 | −0.157 |
| 2.0 | 0.994 | 0.044 | −0.410 |
| 2.42 | 1.000 | 0 | −0.500 |

- $f'=0.5$ at $\zeta\approx0.955$; the transverse group peaks at $0.168$ near $\zeta=0.59$ and changes sign at $\zeta\approx1.21$ (the book says $\approx1.25$).
- $f'$ reaches zero at a **finite** edge $\zeta_e\approx2.42$. Beyond it the mixing-length model gives $\bar v_x=0$ and $f=1$, so $\zeta f'-f/2=-0.5$: a constant inflow of entrained fluid.
- A neat check (supplementary): multiplying shows $\frac{d}{d\zeta}\left(f'^{3/2}+f^{3/2}\right)=\tfrac32\sqrt{f'}\left(f''+\sqrt{ff'}\right)=0$ on the correct branch, so $f'^{3/2}+f^{3/2}=1$ exactly; the edge is at $\zeta_e=\int_0^1(1-f^{3/2})^{-2/3}df=4\pi/(3\sqrt3)=2.418$.

**Plot for $\zeta<0$:** $f'$ is even (bell curve symmetric about the axis), while $f$ and $\zeta f'-f/2$ are odd. So $\bar v_y$ points *away* from the axis for $\lvert\zeta\rvert<1.21$ (the jet spreading) and *toward* it outside (entrainment) — reproducing Fig. 9.16.`,
        check: [
          { label: md`$f'(1)$`, value: 0.473, tol: 0.02 },
          { label: md`$\zeta$ where $\zeta f'-f/2=0$`, value: 1.205, tol: 0.04 },
          { label: md`edge $\zeta_e$`, value: 2.418, tol: 0.02 },
        ],
      },

      /* ----------------------------- 9.19 ----------------------------- */
      {
        id: 'w9-19',
        concept: 'plane-jet-similarity',
        difficulty: 2,
        src: P('539', '9.19'),
        q: md`**Streamlines and velocities for a plane turbulent jet.** Sketch the streamlines for the plane turbulent jet whose velocities are given in Fig. 9.16 (mixing-length solution, $\psi=\gamma\sqrt x\,f(\zeta)$, $\zeta=\beta y/x$). Include both the jet *and* the region outside it. Also show the axial velocity profiles at three stages in the development of the jet.

*Platform check values (use Reichardt's $\beta=7.67$, p. 528, and the results of Problem 9.18):* (i) the slope $y_e/x$ of the jet edge; (ii) for the streamline that enters the jet edge at $x=x_0$, the value of $\zeta$ at $x=4x_0$; (iii) the ratio of centerline velocities at $4x_0$ and $x_0$.`,
        hint: md`A streamline is $\psi=$ const, i.e. $f(\zeta)=c/(\gamma\sqrt x)$. Outside the edge $f=1$, so $\psi=\gamma\sqrt x$ depends on $x$ only.`,
        answer: md`Outside the jet the streamlines are straight lines $x=$ const: fluid moves purely transversely toward the jet with $\bar v_y=\mp\gamma/(2\sqrt x)$. On reaching the edge ($y=\pm0.315x$, half-angle $\approx17.5°$) each streamline turns downstream and then drifts outward only as $y\propto\sqrt x$. Axial profiles at $x_0$, $4x_0$, $9x_0$ are bells with peak heights $1:\tfrac12:\tfrac13$ and widths $1:4:9$. Checks: $y_e/x=0.315$; $\zeta=0.558$; ratio $0.5$.`,
        solution: md`**1. Streamline equation.** $\psi=\gamma\sqrt x\,f(\beta y/x)=c$. The centerline is $\psi=0$ (because $f(0)=0$); by symmetry $\psi<0$ below it.

**2. Outside the jet** ($\lvert\zeta\rvert\ge\zeta_e=2.418$). Problem 9.18 showed $f=1$ there, so $\psi=\gamma\sqrt x$ for $y>0$: the streamline $\psi=c$ is the **vertical line** $x=x_0=(c/\gamma)^2$. Indeed $\bar v_x=0$ and $\bar v_y=(\gamma/\sqrt x)(0-\tfrac12)=-\gamma/(2\sqrt x)$: outside fluid is drawn straight toward the jet, faster near the slot (small $x$) — **entrainment**.

**3. Jet edge.** $y_e=\zeta_e x/\beta=2.418x/7.67=0.315x$, a straight line (linear spreading, $p=1$) at a half-angle $\tan^{-1}0.315=17.5°$. The half-velocity point is at $y_{1/2}=0.955x/7.67=0.125x$.

**4. Inside the jet.** The streamline that arrives at the edge at $x_0$ continues with $f(\zeta)=c/(\gamma\sqrt x)=\sqrt{x_0/x}$. As $x$ grows, $f\to0$, so $\zeta\to0$: the streamline gets **relatively** closer to the axis. Near the axis $f\approx\zeta$, so $y=x\zeta/\beta\approx(\sqrt{x_0}/\beta)\sqrt x$ — it still moves away from the axis, but only as $\sqrt x$, more slowly than the edge ($\propto x$). Example: at $x=4x_0$, $f=\tfrac12$, which (from the solution of 9.18) occurs at $\zeta=0.558$, i.e. $y=4x_0(0.558)/7.67=0.291x_0$.

So each streamline comes down vertically, crosses the edge, bends sharply downstream and then runs almost parallel to the axis inside the jet. Streamlines with larger $c$ enter further downstream ($x_0\propto c^2$).

**5. Axial profiles at three stages.** $\bar v_x=\beta\gamma f'(\zeta)/\sqrt x$. At $x_0$, $4x_0$, $9x_0$ the centerline value $\beta\gamma/\sqrt x$ is in the ratio $1:\tfrac12:\tfrac13$, and since $\zeta=\beta y/x$ the width scales as $x$, $1:4:9$. The area under $\bar v_x$ (volume flow) grows as $\sqrt x$ while $\int\bar v_x^2\,dy$ (momentum) stays constant: the jet spreads and slows down at the same time.`,
        check: [
          { label: md`edge slope $y_e/x$`, value: 0.315, tol: 0.02 },
          { label: md`$\zeta$ at $x=4x_0$`, value: 0.558, tol: 0.03 },
          { label: md`$\bar v_{xc}(4x_0)/\bar v_{xc}(x_0)$`, value: 0.5, tol: 0.01 },
        ],
      },

      /* ----------------------------- 9.20 ----------------------------- */
      {
        id: 'w9-20',
        concept: 'plane-jet-tanh',
        difficulty: 2,
        src: P('539', '9.20'),
        q: md`**Analytical solution for the plane turbulent jet.** Using the simplified eddy viscosity $\nu_T=c\,b\,\bar v_{xc}$ (9.116), with $\bar v_{xc}=V/\sqrt x$, $\nu_T=\alpha V\sqrt x$, $\zeta=\beta y/x$ and $\psi=\gamma V\sqrt x\,f(\zeta)$ (9.117), verify Eq. (9.123),

$$
f=\tanh\zeta,\qquad \frac{df}{d\zeta}=1-\tanh^2\zeta,
$$

from the development that precedes it (the momentum balance (9.104) with $\bar\tau^t_{yx}=\rho\nu_T\,\partial\bar v_x/\partial y$). Then compare its values of $f'$ with those of the numerical mixing-length solution of Fig. 9.16 (Problem 9.18).

*Check values:* $f'(1)$ from the tanh solution, and the $\zeta$ at which the tanh profile falls to half its centerline value.`,
        hint: md`$\nu_T$ does not depend on $y$, so the stress term is $\nu_T\,\partial^2\bar v_x/\partial y^2$. Integrate twice, using $f=f''=0$ and $f'=1$ on the axis, then choose $\beta=\gamma/(4\alpha)$.`,
        answer: md`The balance becomes $(ff')'=-(2\alpha\beta/\gamma)f'''$ (9.119); integrating twice with centerline conditions and $\beta=\gamma/(4\alpha)$ gives $f'=1-f^2$, so $f=\tanh\zeta$. Tanh: $f'(1)=0.420$ (numerical 0.473), half-value at $\zeta=0.881$ (numerical 0.955); tanh is slightly lower for $0.53<\zeta<1.73$ and higher beyond (0.071 vs 0.044 at $\zeta=2$), in line with the book's remark that it over-predicts at large $\zeta$.`,
        solution: md`**1. Velocities.** As in (9.113), with $\gamma\to\gamma V$:

$$
\bar v_x=\frac{\beta\gamma Vf'}{\sqrt x},\qquad \bar v_y=\frac{\gamma V}{\sqrt x}\left(\zeta f'-\frac f2\right)\qquad(9.118)
$$

**2. Left side of (9.104)** (same algebra as Problem 9.17): $-\dfrac{\beta^2\gamma^2V^2}{2x^2}(f'^2+ff'')=-\dfrac{\beta^2\gamma^2V^2}{2x^2}(ff')'$.

**3. Right side.** $\nu_T=\alpha V\sqrt x$ is uniform across a section, so $\frac1\rho\pd{\bar\tau^t}{y}=\nu_T\pd{^2\bar v_x}{y^2}$ with $\pd{^2\bar v_x}{y^2}=\dfrac{\beta^3\gamma Vf'''}{x^{5/2}}$:

$$
\nu_T\pd{^2\bar v_x}{y^2}=\alpha V\sqrt x\cdot\frac{\beta^3\gamma Vf'''}{x^{5/2}}=\frac{\alpha\beta^3\gamma V^2}{x^2}f'''
$$

**4. Equate** ($x^{-2}$ cancels):

$$
\frac{d}{d\zeta}\left(f\frac{df}{d\zeta}\right)=-\frac{2\alpha\beta}{\gamma}\frac{d^3f}{d\zeta^3}\qquad(9.119)
$$

**5. First integration.** $ff'=-(2\alpha\beta/\gamma)f''+C_1$. On the axis $f=0$ and $f''=0$ (symmetric bell), so $C_1=0$ — Eq. (9.120).

**6. Second integration.** $\tfrac12f^2=-(2\alpha\beta/\gamma)f'+C_2$, i.e. $f^2=-(4\alpha\beta/\gamma)f'+c$ (9.121). At $\zeta=0$: $f=0$, $f'=1$, so $c=4\alpha\beta/\gamma$.

**7. Choose $\beta=\gamma/(4\alpha)$** so that $4\alpha\beta/\gamma=1$ (9.122):

$$
f^2+f'=1\;\Longrightarrow\;\frac{df}{1-f^2}=d\zeta\;\Longrightarrow\;\tanh^{-1}f=\zeta+\text{const}
$$

and $f(0)=0$ makes the constant zero: $f=\tanh\zeta$, $f'=1-\tanh^2\zeta=\operatorname{sech}^2\zeta$. $\blacksquare$

**8. Comparison with the numerical (mixing-length) solution of Problem 9.18:**

| $\zeta$ | 0.5 | 1.0 | 1.5 | 2.0 |
|---|---|---|---|---|
| tanh: $\operatorname{sech}^2\zeta$ | 0.786 | 0.420 | 0.181 | 0.071 |
| numerical $f'$ | 0.783 | 0.473 | 0.208 | 0.044 |

Half-velocity point: $\operatorname{sech}^2\zeta=\tfrac12\Rightarrow\cosh\zeta=\sqrt2\Rightarrow\zeta=0.881$ (numerical: 0.955). The curves agree well near the axis; the tanh profile is a little narrower in the middle and crosses above the numerical curve at $\zeta\approx1.73$. It never reaches zero (no sharp edge), so it **over-predicts** the velocity in the outer fringe — consistent with the book's comment that it over-predicts for $\zeta>1.5$ (the book reads values from the graph).`,
        check: [
          { label: md`tanh $f'(1)$`, value: 0.42, tol: 0.02 },
          { label: md`tanh half-velocity $\zeta$`, value: 0.881, tol: 0.02 },
        ],
      },

      /* ----------------------------- 9.21 ----------------------------- */
      {
        id: 'w9-21',
        concept: 'plane-jet-tanh',
        difficulty: 2,
        src: P('539', '9.21'),
        q: md`**Entrainment by a plane turbulent jet.** For the plane turbulent jet of §9.14, how does the total mass flow rate per unit depth in the jet depend on the axial distance $x$? Comment critically on your answer. Use the "simplified" analytical solution, Eq. (9.123): $\psi=\gamma V\sqrt x\,f(\zeta)$ with $f=\tanh\zeta$, $\zeta=\beta y/x$.

*Check value:* by what factor does the mass flow rate increase between $x$ and $4x$?`,
        hint: md`$\rho\int\bar v_x\,dy=\rho\,[\psi]_{y=-\infty}^{y=+\infty}$. What are $\tanh(\pm\infty)$?`,
        answer: md`$\dot m=\rho\int_{-\infty}^{\infty}\bar v_x\,dy=2\rho\gamma V\sqrt x\;\propto\sqrt x$ (equivalently $\dot m=\sqrt{3\rho\dot{\mathcal M}x/\beta}$); it doubles from $x$ to $4x$. The growth is entrained fluid ($\bar v_y\to\mp\gamma V/2\sqrt x$ outside). Critically: the solution has $\dot m\to0$ at $x=0$ (a line source of momentum with no mass) and unbounded growth, so it holds only far downstream of a real slot.`,
        solution: md`**1. Mass flow per unit depth.** Since $\bar v_x=\pd{\psi}{y}$,

$$
\dot m=\rho\int_{-\infty}^{\infty}\bar v_x\,dy=\rho\left[\psi\right]_{-\infty}^{+\infty}=\rho\gamma V\sqrt x\left[\tanh(+\infty)-\tanh(-\infty)\right]=2\rho\gamma V\sqrt x
$$

(Equivalently: $dy=x\,d\zeta/\beta$ and $\int_{-\infty}^\infty\operatorname{sech}^2\zeta\,d\zeta=2$.) So $\dot m\propto x^{1/2}$: from $x$ to $4x$ it doubles.

**2. Link to the momentum flux.** $\dot{\mathcal M}=\rho\int\bar v_x^2dy=\rho\frac{\beta^2\gamma^2V^2}{x}\cdot\frac{x}{\beta}\int_{-\infty}^\infty\operatorname{sech}^4\zeta\,d\zeta=\tfrac43\rho\beta\gamma^2V^2$, independent of $x$ as it must be. Eliminating $\gamma V$:

$$
\dot m=\sqrt{\frac{3\rho\dot{\mathcal M}\,x}{\beta}}
$$

**3. Where does the extra mass come from?** Far from the axis $\zeta\to\pm\infty$: $f'\to0$, $f\to\pm1$, so $\bar v_y\to\mp\gamma V/(2\sqrt x)$ — fluid flows *into* the jet from both sides. The inflow per unit length is $2\rho\cdot\gamma V/(2\sqrt x)=\rho\gamma V/\sqrt x$, which equals $d\dot m/dx$ exactly. Entrainment is fastest near the slot and decays as $x^{-1/2}$.

**4. Critical comments.**
- At $x=0$ the formula gives $\dot m=0$ but infinite centerline velocity: the similarity solution represents a **line source of momentum with no mass flow**. A real slot of width $w$ delivers a finite $\dot m_0$, so the result applies only for $x\gg w$ (measured from a "virtual origin").
- $\dot m$ grows without limit; in practice it is bounded by the size of the surroundings (walls, finite reservoir).
- Momentum is conserved while mass flow increases, so the mean velocity $\dot{\mathcal M}/\dot m\propto x^{-1/2}$ falls — the jet slows as it entrains.
- The tanh profile has no sharp edge, so "the jet" includes a weak, slowly decaying fringe; the mixing-length solution (sharp edge at $\zeta_e$) gives the same $\sqrt x$ law because $[\psi]$ across the jet is again $2\gamma\sqrt x$.`,
        check: [{ label: md`$\dot m(4x)/\dot m(x)$`, value: 2, tol: 0.01 }],
      },

      /* ----------------------------- 9.22 ----------------------------- */
      {
        id: 'w9-22',
        concept: 'round-jet',
        difficulty: 3,
        src: P('539', '9.22'),
        q: md`**Axisymmetric turbulent jet.** The round jet obeys $\bar v_r\pd{\bar v_z}{r}+\bar v_z\pd{\bar v_z}{z}=\dfrac{1}{\rho r}\pd{(r\bar\tau^t_{rz})}{r}$ (9.124), $\dfrac1r\pd{(r\bar v_r)}{r}+\pd{\bar v_z}{z}=0$ (9.125), with constant momentum flow $\dot{\mathcal M}=\rho\int_0^\infty2\pi r\bar v_z^2\,dr$ (9.126), $\bar\tau^t_{rz}=\rho\nu_T\,\partial\bar v_z/\partial r$, $\nu_T=c_1b\bar v_{zc}$ (9.127), and similarity forms $b=c_2z^p$, $\zeta=c_3r/z^p$, $\bar v_z=g(\zeta)/z^q$ (9.128). Verify that:

**(a)** the powers in (9.128) are $p=q=1$;

**(b)** the velocities

$$
\bar v_z=\frac{3\dot{\mathcal M}}{8\pi\nu_T\rho z\left(1+\zeta^2/4\right)^2},\qquad
\bar v_r=\frac{1}{4z}\sqrt{\frac{3\dot{\mathcal M}}{\pi\rho}}\,\frac{\zeta-\zeta^3/4}{\left(1+\zeta^2/4\right)^2},\qquad
\zeta=\frac{1}{4\nu_T}\sqrt{\frac{3\dot{\mathcal M}}{\pi\rho}}\,\frac rz
$$

(9.132)–(9.134) satisfy the differential momentum and mass balances, and that the total rate of momentum transfer is $\dot{\mathcal M}$.

*Check value:* the dimensionless integral $\int_0^\infty\zeta\,(1+\zeta^2/4)^{-4}\,d\zeta$ that appears in the momentum check.`,
        hint: md`(a) Constancy of $\int r\bar v_z^2dr\sim b^2z^{-2q}$ gives one relation; balancing inertia against the stress term gives the other. (b) Write $\beta=\frac{1}{4\nu_T}\sqrt{3\dot{\mathcal M}/\pi\rho}$ and work with the Stokes stream function $\psi=\nu_Tz\,f(\zeta)$, $f=\zeta^2/(1+\zeta^2/4)$.`,
        answer: md`(a) Momentum: $z^{2p-2q}=$ const $\Rightarrow p=q$; inertia $\sim z^{-(1+2q)}$, stress $\sim z^{-(p+2q)}$ $\Rightarrow p=1$, so $p=q=1$ and $\nu_T\propto z^{p-q}$ is constant. (b) The velocities follow from $\psi=\nu_Tzf$ (so continuity holds identically); momentum reduces to $ff'=f'-\zeta f''$, satisfied by $f=\zeta^2/(1+\zeta^2/4)$; and $\rho\int2\pi r\bar v_z^2dr=\tfrac{16\pi}{3}\rho\beta^2\nu_T^2=\dot{\mathcal M}$, using $\int_0^\infty\zeta(1+\zeta^2/4)^{-4}d\zeta=2/3$.`,
        solution: md`**(a) Exponents.**

- *Momentum invariant:* $\bar v_z^2\sim z^{-2q}$ and $r\,dr\sim b^2\sim z^{2p}$, so $\dot{\mathcal M}/\rho\sim z^{2p-2q}$. It must not depend on $z$: $p=q$. (Plane jet: $p=2q$, because there $dy\sim b$ only.)
- *Inertia:* $\bar v_z\pd{\bar v_z}{z}\sim z^{-q}\cdot z^{-q-1}=z^{-(1+2q)}$. Continuity gives $\bar v_r\sim b\,\pd{\bar v_z}{z}\sim z^{p-q-1}$, so $\bar v_r\pd{\bar v_z}{r}\sim z^{p-q-1}z^{-q-p}=z^{-(1+2q)}$ as well.
- *Stress:* $\nu_T=c_1b\bar v_{zc}\sim z^{p-q}$, and $\frac1r\pd{}{r}\left(r\nu_T\pd{\bar v_z}{r}\right)\sim\nu_T\bar v_z/b^2\sim z^{p-q}z^{-q}z^{-2p}=z^{-(p+2q)}$.
- *Balance:* $1+2q=p+2q\Rightarrow p=1$, and then $q=p=1$. $\blacksquare$

Consequence: $\nu_T\sim z^{p-q}=z^0$ is **constant everywhere** — the jet widens ($b\propto z$) exactly as fast as its centerline velocity falls ($\propto1/z$). The balances become (9.130)–(9.131): the laminar round-jet equations with $\nu$ replaced by $\nu_T$.

**(b) Velocities from a stream function.** Let $A=\sqrt{3\dot{\mathcal M}/\pi\rho}$ and $\beta=A/(4\nu_T)$, so $\zeta=\beta r/z$ and $3\dot{\mathcal M}/(\pi\rho)=A^2=16\beta^2\nu_T^2$. Take $\psi=\nu_Tzf(\zeta)$ with $\bar v_z=\frac1r\pd{\psi}{r}$, $\bar v_r=-\frac1r\pd{\psi}{z}$ — continuity (9.131) is then satisfied **identically**. With $u=1+\zeta^2/4$ and $f=\zeta^2/u$: $f'=2\zeta/u^2$, $f''=(2-\tfrac32\zeta^2)/u^3$.

$$
\bar v_z=\frac{\nu_T\beta f'}{r}=\frac{\nu_T\beta^2}{z}\,\frac{f'}{\zeta}=\frac{2\beta^2\nu_T}{zu^2}=\frac{A^2}{8\nu_Tzu^2}=\frac{3\dot{\mathcal M}}{8\pi\nu_T\rho z\,u^2}\;\checkmark
$$

$$
\bar v_r=\frac{\nu_T}{r}\left(\zeta f'-f\right)=\frac{\nu_T\beta}{z}\,\frac{\zeta^2-\zeta^4/4}{\zeta\,u^2}=\frac{A}{4z}\,\frac{\zeta-\zeta^3/4}{u^2}\;\checkmark
$$

**Momentum balance (9.130).** Write $\bar v_z=(\nu_T\beta^2/z)F$ with $F=f'/\zeta$, and $\bar v_r=(\nu_T\beta/z)(f'-f/\zeta)$. Using $\partial/\partial r=(\beta/z)d/d\zeta$, $\partial\zeta/\partial z=-\zeta/z$:

$$
\bar v_r\pd{\bar v_z}{r}+\bar v_z\pd{\bar v_z}{z}=\frac{\nu_T^2\beta^4}{z^3}\left[(f'-\tfrac f\zeta)F'-F(F+\zeta F')\right]=-\frac{\nu_T^2\beta^4}{z^3}\,\frac1\zeta\frac{d}{d\zeta}\!\left(\frac{ff'}{\zeta}\right)
$$

$$
\nu_T\frac1r\pd{}{r}\left(r\pd{\bar v_z}{r}\right)=\frac{\nu_T^2\beta^4}{z^3}\,\frac1\zeta\frac{d}{d\zeta}\left(\zeta F'\right)=\frac{\nu_T^2\beta^4}{z^3}\,\frac1\zeta\frac{d}{d\zeta}\left(f''-\frac{f'}{\zeta}\right)
$$

So (9.130) requires $-\left(ff'/\zeta\right)'=\left(f''-f'/\zeta\right)'$. Both brackets vanish on the axis ($f\approx\zeta^2$: $ff'/\zeta\to0$, $f''-f'/\zeta\to2-2=0$), so integrate once: $ff'=f'-\zeta f''$. Check with the given $f$:

$$
f'-\zeta f''=\frac{2\zeta u-\zeta(2-\tfrac32\zeta^2)}{u^3}=\frac{2\zeta+\tfrac12\zeta^3-2\zeta+\tfrac32\zeta^3}{u^3}=\frac{2\zeta^3}{u^3},\qquad ff'=\frac{\zeta^2}{u}\cdot\frac{2\zeta}{u^2}=\frac{2\zeta^3}{u^3}\;\checkmark
$$

(A finite-difference check of (9.130) at arbitrary points confirms it to rounding error.)

**Total momentum.** With $r=z\zeta/\beta$, $dr=z\,d\zeta/\beta$:

$$
\rho\int_0^\infty2\pi r\bar v_z^2dr=2\pi\rho\cdot4\beta^2\nu_T^2\int_0^\infty\frac{\zeta\,d\zeta}{(1+\zeta^2/4)^4}
$$

Substituting $s=\zeta^2/4$ ($\zeta d\zeta=2ds$): $\int_0^\infty2\,ds/(1+s)^4=2/3$. Hence the integral is $\tfrac{16\pi}{3}\rho\beta^2\nu_T^2=\tfrac{16\pi}{3}\rho\cdot\frac{3\dot{\mathcal M}}{16\pi\rho}=\dot{\mathcal M}$, independent of $z$. $\blacksquare$`,
        check: [{ label: md`$\int_0^\infty\zeta(1+\zeta^2/4)^{-4}d\zeta$`, value: 0.6667, tol: 0.01 }],
      },

      /* ----------------------------- 9.23 ----------------------------- */
      {
        id: 'w9-23',
        concept: 'round-jet',
        difficulty: 2,
        src: P('540', '9.23'),
        q: md`**Entrainment by an axisymmetric turbulent jet.** For the axisymmetric turbulent jet of §9.14 (velocities (9.132)–(9.134), constant eddy viscosity $\nu_T$), how does the total mass flow rate in the jet depend on the axial distance $z$? Comment critically on your answer.

*Check values:* (i) the ratio $\dot m(2z)/\dot m(z)$; (ii) *platform illustration, labelled assumption:* the book quotes Reichardt's value as "$\nu_T\rho/\dot{\mathcal M}=0.0161$" (p. 532), a group that is not dimensionless as printed; taking the dimensionally consistent reading $\nu_T=0.0161\sqrt{\dot{\mathcal M}/\rho}$, evaluate $\dot m/(z\sqrt{\rho\dot{\mathcal M}})$.`,
        hint: md`Use the Stokes stream function of Problem 9.24, $\psi=\nu_Tzf(\zeta)$ with $f=\zeta^2/(1+\zeta^2/4)$: $\dot m=2\pi\rho[\psi]_{r=0}^{r=\infty}$.`,
        answer: md`$\dot m=\rho\int_0^\infty2\pi r\bar v_z\,dr=8\pi\rho\nu_Tz$ — linear in $z$ (doubles when $z$ doubles), independent of $\dot{\mathcal M}$ except through $\nu_T$. With $\nu_T=0.0161\sqrt{\dot{\mathcal M}/\rho}$: $\dot m=0.405\,z\sqrt{\rho\dot{\mathcal M}}$. The extra mass is entrained radially ($\bar v_r\to-4\nu_T/r$); the point-source model fails near the orifice ($\dot m\to0$ at $z=0$).`,
        solution: md`**1. Mass flow.** $\bar v_z=\frac1r\pd{\psi}{r}$, so

$$
\dot m=\rho\int_0^\infty2\pi r\bar v_z\,dr=2\pi\rho\left[\psi\right]_{r=0}^{r=\infty}=2\pi\rho\nu_Tz\left[f(\infty)-f(0)\right]
$$

$f=\zeta^2/(1+\zeta^2/4)\to4$ as $\zeta\to\infty$ and $f(0)=0$, so

$$
\dot m=8\pi\rho\nu_T z
$$

Direct check: with $r\,dr=(z/\beta)^2\zeta d\zeta$ and $\bar v_z=2\beta^2\nu_T/(zu^2)$, $\dot m=4\pi\rho\nu_Tz\int_0^\infty\zeta\,d\zeta/(1+\zeta^2/4)^2=4\pi\rho\nu_Tz\cdot2$. ✓

**2. Dependence on $z$.** $\dot m\propto z$ (doubles from $z$ to $2z$), compared with $\sqrt x$ for the plane jet. The volumetric flow $Q=8\pi\nu_Tz$ grows at a rate $8\pi\nu_T$ per unit length, set only by the eddy viscosity.

**3. Entrainment.** As $\zeta\to\infty$, (9.133) gives $\bar v_r\to\frac{A}{4z}\cdot\left(-\frac4\zeta\right)=-\frac{4\nu_T}{r}$: a radial inflow. Through a cylinder of radius $R$ it supplies $2\pi R\rho\cdot4\nu_T/R=8\pi\rho\nu_T$ per unit length — exactly $d\dot m/dz$.

**4. Platform illustration (assumption).** If $\nu_T=0.0161\sqrt{\dot{\mathcal M}/\rho}$ (the dimensionally consistent reading of Reichardt's constant), then $\dot m=8\pi(0.0161)\,z\sqrt{\rho\dot{\mathcal M}}=0.405\,z\sqrt{\rho\dot{\mathcal M}}$.

**5. Critical comments.**
- $\dot m\to0$ at $z=0$ while $\bar v_{zc}\propto1/z\to\infty$: the solution describes a **point source of momentum** with no mass. A real nozzle supplies a finite $\dot m_0$ and finite velocity, so the result holds only many diameters downstream (from a virtual origin).
- $\dot m$ grows without bound because the surroundings are assumed infinite and quiescent; confinement would limit entrainment.
- Momentum stays constant while mass increases, so the mean velocity $\dot{\mathcal M}/\dot m\propto1/z$ — the jet dilutes itself with entrained fluid (important for mixing and combustion).
- Constant $\nu_T$ gives a profile that decays only algebraically ($\bar v_z\sim\zeta^{-4}$); the book notes mixing-length theory fits Reichardt's data slightly better at large $\zeta$ (p. 532), so the outer-fringe contribution to $\dot m$ is the least reliable part.`,
        check: [
          { label: md`$\dot m(2z)/\dot m(z)$`, value: 2, tol: 0.01 },
          { label: md`$\dot m/(z\sqrt{\rho\dot{\mathcal M}})$ (assumed $\nu_T$)`, value: 0.405, tol: 0.02 },
        ],
      },

      /* ----------------------------- 9.24 ----------------------------- */
      {
        id: 'w9-24',
        concept: 'round-jet',
        difficulty: 2,
        src: P('540', '9.24'),
        q: md`**Streamlines and velocities in an axisymmetric turbulent jet.**

**(a)** Verify that the velocities of Eqs. (9.132) and (9.133) are consistent with the stream function

$$
\psi=\nu_T\,z\,f(\zeta),\qquad \zeta=\frac{\beta r}{z},\qquad f=\frac{\zeta^2}{1+\zeta^2/4}
$$

($\beta$ is not defined in the problem; comparison with (9.134) shows it must be $\beta=\frac{1}{4\nu_T}\sqrt{3\dot{\mathcal M}/\pi\rho}$).

**(b)** Sketch several streamlines, both within the jet and outside it, and show the axial velocity profiles at three stages of the jet's development.

**(c)** Plot dimensionless axial and radial velocity profiles in the manner of Fig. 9.16.

*Check values:* the $\zeta$ at which $\bar v_z$ is half its centerline value; the maximum of the dimensionless radial velocity $\bar v_r\cdot4z/\sqrt{3\dot{\mathcal M}/\pi\rho}$; and, for a streamline $\psi=c$, the ratio of the $z$ at which it is parallel to the axis to the $z$ at which it comes in from $r\to\infty$.`,
        hint: md`For the Stokes stream function $\bar v_z=\frac1r\pd{\psi}{r}$, $\bar v_r=-\frac1r\pd{\psi}{z}$. For the streamlines, note $f\to4$ as $\zeta\to\infty$ and that $\bar v_r$ changes sign where $\zeta=2$.`,
        answer: md`(a) $\frac1r\partial_r\psi=2\beta^2\nu_T/[z(1+\zeta^2/4)^2]$ and $-\frac1r\partial_z\psi=\frac{\nu_T\beta}{z}\frac{\zeta-\zeta^3/4}{(1+\zeta^2/4)^2}$, which are (9.132)–(9.133) since $4\nu_T\beta=\sqrt{3\dot{\mathcal M}/\pi\rho}$. (b) Far out, streamlines are planes $z=c/(4\nu_T)$ (pure radial inflow); each turns at $\zeta=2$, $z=c/(2\nu_T)$ (ratio 2), then runs downstream with $r\propto\sqrt z$. (c) $\bar v_z/\bar v_{zc}=(1+\zeta^2/4)^{-2}$, half at $\zeta=1.287$; radial group $(\zeta-\zeta^3/4)/(1+\zeta^2/4)^2$, max $0.5$ at $\zeta=0.83$, zero at $\zeta=2$, $\to-4/\zeta$ outside.`,
        solution: md`**(a) Consistency.** With $u=1+\zeta^2/4$: $f'=2\zeta/u^2$, $\partial\zeta/\partial r=\beta/z$, $\partial\zeta/\partial z=-\zeta/z$.

$$
\bar v_z=\frac1r\pd{\psi}{r}=\frac{\nu_T z f'\beta/z}{r}=\frac{\nu_T\beta}{r}\,\frac{2\zeta}{u^2}=\frac{2\nu_T\beta^2}{z\,u^2}
$$

$$
\bar v_r=-\frac1r\pd{\psi}{z}=-\frac{\nu_T}{r}\left(f-\zeta f'\right)=\frac{\nu_T}{r}\,\frac{\zeta^2-\zeta^4/4}{u^2}=\frac{\nu_T\beta}{z}\,\frac{\zeta-\zeta^3/4}{u^2}
$$

With $4\nu_T\beta=\sqrt{3\dot{\mathcal M}/\pi\rho}$: $\nu_T\beta=\tfrac14\sqrt{3\dot{\mathcal M}/\pi\rho}$ reproduces (9.133), and $2\nu_T\beta^2=\frac{3\dot{\mathcal M}}{8\pi\rho\nu_T}$ reproduces (9.132). ✓ (Continuity is automatic for any $\psi$.)

**(b) Streamlines** $\nu_Tzf(\zeta)=c$:
- **Far outside** ($\zeta\to\infty$, $f\to4$): $z\to z_\infty=c/(4\nu_T)$. Streamlines become planes perpendicular to the axis; fluid approaches radially with $\bar v_r\approx-4\nu_T/r$.
- **Turning point:** $\bar v_r=0$ at $\zeta=2$, where $f=4/2=2$, so $z=c/(2\nu_T)=2z_\infty$ and $r=2z/\beta$. Coming in from far away the streamline tilts downstream (its $z$ doubles) until it reaches the cone $\zeta=2$, where it is parallel to the axis.
- **Inside** ($\zeta<2$, $\bar v_r>0$): as $z\to\infty$, $f=c/(\nu_Tz)\to0$, so $\zeta^2\approx c/(\nu_Tz)$ and $r=z\zeta/\beta\approx\sqrt{cz/\nu_T}/\beta\propto\sqrt z$. The streamline drifts outward slowly while the jet itself spreads linearly — entrained fluid is progressively buried in the jet.
- The jet's "edge" is a cone $r\propto z$; the half-velocity cone is $\zeta=1.287$.

**Axial profiles at three stages**, say $z_1$, $2z_1$, $3z_1$: $\bar v_{zc}=3\dot{\mathcal M}/(8\pi\nu_T\rho z)$ falls as $1/z$ (heights $1:\tfrac12:\tfrac13$) and the radial scale grows as $z$ (widths $1:2:3$), keeping $\int2\pi r\bar v_z^2dr$ constant.

**(c) Dimensionless profiles.**

$$
\frac{\bar v_z}{\bar v_{zc}}=\frac{1}{(1+\zeta^2/4)^2},\qquad \frac{4z\,\bar v_r}{\sqrt{3\dot{\mathcal M}/\pi\rho}}=\frac{\zeta-\zeta^3/4}{(1+\zeta^2/4)^2}
$$

| $\zeta$ | 0 | 0.5 | 1 | 1.287 | 2 | 3 | 4 |
|---|---|---|---|---|---|---|---|
| axial | 1 | 0.886 | 0.640 | 0.500 | 0.250 | 0.095 | 0.040 |
| radial | 0 | 0.415 | 0.480 | 0.377 | 0 | −0.355 | −0.480 |

- Axial: bell-shaped, even in $\zeta$; half value where $(1+\zeta^2/4)^2=2$, i.e. $\zeta=2\sqrt{\sqrt2-1}=1.287$.
- Radial: odd in $\zeta$ (as a signed plot like Fig. 9.16); maximum $0.5$ at $\zeta=2(\sqrt2-1)=0.83$ (outflow: spreading), zero at $\zeta=2$, then negative (inflow: entrainment), tending to $-4/\zeta$, i.e. $\bar v_r\to-4\nu_T/r$. Unlike the plane jet, the inflow decays with distance, because it must feed a jet through an ever-larger cylindrical surface.`,
        check: [
          { label: md`half-velocity $\zeta$`, value: 1.287, tol: 0.02 },
          { label: 'max dimensionless radial velocity', value: 0.5, tol: 0.02 },
          { label: md`$z_{\text{turn}}/z_\infty$`, value: 2, tol: 0.01 },
        ],
      },

      /* ----------------------------- 9.26 ----------------------------- */
      {
        id: 'w9-26',
        concept: 'jet-basics',
        difficulty: 1,
        src: P('540', '9.26'),
        q: md`**Order of terms for turbulent jet.** For the plane turbulent jet, with the similarity assumptions $\ell=c_1b$, $b=c_2x^p$, $\zeta=c_4y/x^p$, $\bar v_x=g(\zeta)/x^q$ (9.108), verify the orders of the three terms of the momentum balance (9.104) listed in Table 9.2:

| Term | Order |
|---|---|
| $\bar v_x\,\partial\bar v_x/\partial x$ | $x^{-(1+2q)}$ |
| $\bar v_y\,\partial\bar v_x/\partial y$ | $x^{-(1+2q)}$ |
| $(1/\rho)\,\partial\bar\tau^t_{yx}/\partial y$ | $x^{-(p+2q)}$ |

*Check value:* the common power of $x$ of all three terms once $p=1$, $q=\tfrac12$.`,
        hint: md`$\partial/\partial y$ brings in $1/b\sim x^{-p}$; $\partial/\partial x$ of a similarity form brings in $1/x$. Get the order of $\bar v_y$ from continuity (9.105), and use $\bar\tau^t/\rho=\ell^2(\partial\bar v_x/\partial y)^2$.`,
        answer: md`$\bar v_x\sim x^{-q}$, $\partial_x\bar v_x\sim x^{-q-1}$; continuity gives $\bar v_y\sim x^{p-q-1}$ and $\partial_y\bar v_x\sim x^{-q-p}$; $\bar\tau^t/\rho\sim x^{2p}x^{-2q-2p}=x^{-2q}$. Hence the orders $x^{-(1+2q)}$, $x^{-(1+2q)}$, $x^{-(p+2q)}$; with $p=1$, $q=\tfrac12$ all are $x^{-2}$.`,
        solution: md`**1. First inertia term.** $\bar v_x=g(\zeta)x^{-q}$ with $\zeta=c_4yx^{-p}$, so $\partial\zeta/\partial x=-p\zeta/x$ and

$$
\pd{\bar v_x}{x}=-\frac{q\,g+p\,\zeta g'}{x^{q+1}}\sim x^{-(q+1)}\quad\Rightarrow\quad \bar v_x\pd{\bar v_x}{x}\sim x^{-q}x^{-(q+1)}=x^{-(1+2q)}
$$

**2. Second inertia term.** $\pd{\bar v_x}{y}=\dfrac{c_4g'}{x^{q+p}}\sim x^{-(p+q)}$. From continuity, $\pd{\bar v_y}{y}=-\pd{\bar v_x}{x}\sim x^{-(q+1)}$; integrating across a width $b\sim x^p$ gives $\bar v_y\sim x^{p-q-1}$. Then

$$
\bar v_y\pd{\bar v_x}{y}\sim x^{p-q-1}\,x^{-(p+q)}=x^{-(1+2q)}
$$

— the same order as the first term, as it must be since both come from the same convective derivative.

**3. Stress term.** $\bar\tau^t_{yx}/\rho=\ell^2\left\lvert\pd{\bar v_x}{y}\right\rvert\pd{\bar v_x}{y}\sim(x^p)^2\left(x^{-(p+q)}\right)^2=x^{-2q}$, and $\partial/\partial y$ adds $x^{-p}$:

$$
\frac1\rho\pd{\bar\tau^t_{yx}}{y}\sim x^{-(p+2q)}
$$

**4. Consequence.** Balance needs $1+2q=p+2q$, so $p=1$; with $p=2q$ from constant $\dot{\mathcal M}$ (9.109), $q=\tfrac12$ (9.110). Then every term is $\sim x^{-(1+2\cdot\frac12)}=x^{-2}$ — matching the $1/x^2$ factors that cancel in Problem 9.17.`,
        check: [{ label: 'power of $x$ for $p=1$, $q=1/2$', value: -2, tol: 0.01 }],
      },
    ],
  },

  /* ---------------------- Problem 9.27 true/false sets ---------------------- */
  {
    id: 'wilkes9b-turbulence-nature',
    topic: 'turbulence-nature',
    title: 'Wilkes Ch. 9 — Problem 9.27(a): true/false on turbulent fluctuations',
    src: { doc: 'wilkes', pages: '540', note: 'Problem 9.27(a)' },
    intro: md`A true/false statement from the end of Wilkes Chapter 9 about the time scale of turbulent fluctuations.`,
    problems: [],
    quiz: tfTurbulenceNature,
  },
  {
    id: 'wilkes9b-reynolds-stresses',
    topic: 'reynolds-stresses',
    title: 'Wilkes Ch. 9 — Problem 9.27(b, c, d, p, s): true/false on time-averaged equations and Reynolds stresses',
    src: { doc: 'wilkes', pages: '540–541', note: 'Problem 9.27' },
    intro: md`True/false statements from Wilkes Chapter 9 on what time-averaging does to continuity and momentum, and where Reynolds stresses come from.`,
    problems: [],
    quiz: tfReynoldsStresses,
  },
  {
    id: 'wilkes9b-mixing-length',
    topic: 'mixing-length',
    title: 'Wilkes Ch. 9 — Problem 9.27(e, f, n): true/false on mixing-length theory',
    src: { doc: 'wilkes', pages: '540–541', note: 'Problem 9.27' },
    intro: md`True/false statements from Wilkes Chapter 9 on the mixing-length model and Prandtl's hypothesis $\ell=ky$.`,
    problems: [],
    quiz: tfMixingLength,
  },
  {
    id: 'wilkes9b-velocity-profiles',
    topic: 'velocity-profiles',
    title: 'Wilkes Ch. 9 — Problem 9.27(g, h, j, k, t): true/false on the log law and the laminar sublayer',
    src: { doc: 'wilkes', pages: '540–541', note: 'Problem 9.27' },
    intro: md`True/false statements from Wilkes Chapter 9 on the logarithmic profile, the universal velocity profile and the laminar-sublayer thickness.`,
    problems: [],
    quiz: tfVelocityProfiles,
  },
  {
    id: 'wilkes9b-friction-factor',
    topic: 'friction-factor',
    title: 'Wilkes Ch. 9 — Problem 9.27(l, m, r): true/false on friction-factor laws',
    src: { doc: 'wilkes', pages: '541', note: 'Problem 9.27' },
    intro: md`True/false statements from Wilkes Chapter 9 on Colebrook–White, the Blasius law and hydraulically smooth pipes.`,
    problems: [],
    quiz: tfFrictionFactor,
  },
  {
    id: 'wilkes9b-heat-transfer-analogies',
    topic: 'heat-transfer-analogies',
    title: 'Wilkes Ch. 9 — Problem 9.27(i, o, q, u): true/false on momentum–heat analogies',
    src: { doc: 'wilkes', pages: '541', note: 'Problem 9.27' },
    intro: md`True/false statements from Wilkes Chapter 9 on the friction factor, the Prandtl number and the eddy-transport picture behind the Reynolds analogy.`,
    problems: [],
    quiz: tfHeatTransfer,
  },
]
