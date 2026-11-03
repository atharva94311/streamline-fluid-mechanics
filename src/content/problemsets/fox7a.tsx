import type { ProblemSet } from '@/lib/types'
import { md } from '@/kit'

/*
 * Fox & McDonald's, Chapter 7 end-of-chapter problems 7.1–7.19 (printed pp. 269–271).
 * The book prints statements only; every solution below was written for this platform.
 */

const P269 = (n: string) => ({ doc: 'fox' as const, pages: '269', note: `Problem ${n}` })
const P270 = (n: string) => ({ doc: 'fox' as const, pages: '270', note: `Problem ${n}` })
const P271 = (n: string) => ({ doc: 'fox' as const, pages: '271', note: `Problem ${n}` })

export const sets: ProblemSet[] = [
  /* ------------------------------------------------------------------ */
  /*  7.1 – 7.6  Nondimensionalizing the basic differential equations    */
  /* ------------------------------------------------------------------ */
  {
    id: 'fox7a-dimensional-basics',
    topic: 'dimensional-basics',
    title: "Fox & McDonald's Ch. 7 — Problems 7.1–7.6: nondimensionalizing governing equations",
    src: { doc: 'fox', pages: '269–270', note: 'Problems 7.1–7.6' },
    intro: md`Scale every variable with the reference quantities given, substitute, divide by the coefficient of one term, and read off the dimensionless groups that remain — exactly the recipe of Fox §7.1 (Eqs. 7.4–7.10).`,
    problems: [
      {
        id: 'fox7-1',
        concept: 'nondimensional-equations',
        difficulty: 2,
        src: P269('7.1'),
        q: md`Small-amplitude surface waves on a liquid layer of uniform depth travel with speed $c$ given by

$$
c^{2}=\left(\frac{\sigma}{\rho}\,\frac{2\pi}{\lambda}+\frac{g\lambda}{2\pi}\right)\tanh\frac{2\pi h}{\lambda}
$$

where $h$ is the depth of the undisturbed liquid and $\lambda$ is the wavelength (the remaining symbols take their usual meanings: $\sigma$ surface tension, $\rho$ liquid density, $g$ gravitational acceleration). Taking $L$ as a characteristic length and $V_0$ as a characteristic velocity, nondimensionalize the equation and identify the dimensionless groups that characterize it.`,
        hint: md`Set $c^* = c/V_0$, $\lambda^* = \lambda/L$, $h^* = h/L$, substitute, then divide the whole equation by $V_0^2$. The argument of tanh is already dimensionless.`,
        answer: md`$$
c^{*2}=\left(\frac{\sigma}{\rho V_0^2 L}\,\frac{2\pi}{\lambda^*}+\frac{gL}{V_0^2}\,\frac{\lambda^*}{2\pi}\right)\tanh\frac{2\pi h^*}{\lambda^*}
$$

Groups: $\dfrac{\sigma}{\rho V_0^2L}=\dfrac{1}{\We}$ and $\dfrac{gL}{V_0^2}=\dfrac{1}{\Fr^2}$ (plus the geometric ratios $\lambda/L$ and $h/L$).`,
        solution: md`**1. Define dimensionless variables.** With the given scales,

$$
c^*=\frac{c}{V_0},\qquad \lambda^*=\frac{\lambda}{L},\qquad h^*=\frac{h}{L}
$$

so $c=V_0c^*$, $\lambda=L\lambda^*$, $h=Lh^*$. The constants $\sigma$, $\rho$, $g$ are parameters, not variables.

**2. Substitute.**

$$
V_0^2\,c^{*2}=\left(\frac{\sigma}{\rho}\,\frac{2\pi}{L\lambda^*}+\frac{gL\lambda^*}{2\pi}\right)\tanh\frac{2\pi Lh^*}{L\lambda^*}
$$

The $L$'s cancel inside tanh: its argument $2\pi h/\lambda = 2\pi h^*/\lambda^*$ is dimensionless already.

**3. Divide by $V_0^2$** (the coefficient of the left-hand side):

$$
c^{*2}=\left(\frac{\sigma}{\rho V_0^2 L}\,\frac{2\pi}{\lambda^*}+\frac{gL}{V_0^2}\,\frac{\lambda^*}{2\pi}\right)\tanh\frac{2\pi h^*}{\lambda^*}
$$

**4. Identify the groups.**

- $\dfrac{\sigma}{\rho V_0^2L}$ — surface-tension force / inertia force $=1/\We$, with $\We=\rho V_0^2L/\sigma$ (Fox Eq. 7.15).
- $\dfrac{gL}{V_0^2}$ — gravity force / inertia force $=1/\Fr^2$, with $\Fr=V_0/\sqrt{gL}$ (Fox Eq. 7.14).
- The geometric ratios $\lambda/L$ and $h/L$ appear as the dimensionless independent variables.

**Check (dimensions):** $[\sigma/(\rho V_0^2 L)]=(\dimM\dimT^{-2})/(\dimM\dimL^{-3}\cdot\dimL^2\dimT^{-2}\cdot\dimL)=1$ and $[gL/V_0^2]=(\dimL\dimT^{-2}\cdot\dimL)/(\dimL^2\dimT^{-2})=1$.

**Physical reading (supplementary).** In deep water ($h\gg\lambda$, $\tanh\to1$) long waves are gravity-controlled, $c^2\approx g\lambda/2\pi$, and very short waves are surface-tension-controlled, $c^2\approx 2\pi\sigma/(\rho\lambda)$ — the capillary waves of Problem 7.16. Which term wins is decided by the two groups above.`,
      },
      {
        id: 'fox7-2',
        concept: 'nondimensional-equations',
        difficulty: 2,
        src: P270('7.2'),
        q: md`Small-amplitude vibration of a beam obeys

$$
\rho A\frac{\partial^{2}y}{\partial t^{2}}+EI\frac{\partial^{4}y}{\partial x^{4}}=0
$$

where $y$ is the deflection at position $x$ and time $t$; $\rho$ and $E$ are the density and modulus of elasticity of the beam material; $A$ and $I$ are the cross-sectional area and second moment of area. Using the beam length $L$ and the vibration frequency $\omega$, nondimensionalize the equation and obtain the dimensionless group(s) that characterize it.`,
        hint: md`Use $x^*=x/L$, $t^*=\omega t$ and $y^*=y/L$. Each time derivative brings a factor $\omega$, each space derivative a factor $1/L$.`,
        answer: md`$$
\frac{\partial^2y^*}{\partial t^{*2}}+\frac{EI}{\rho A\,\omega^2L^4}\,\frac{\partial^4y^*}{\partial x^{*4}}=0
$$

One group: $\Pi=\dfrac{EI}{\rho A\,\omega^2 L^4}$ (equivalently its inverse, a dimensionless frequency squared).`,
        solution: md`**1. Dimensionless variables.** The only length scale is $L$ and the only time scale is $1/\omega$:

$$
x^*=\frac{x}{L},\qquad y^*=\frac{y}{L},\qquad t^*=\omega t
$$

**2. Transform the derivatives.** Because $L$ and $\omega$ are constants,

$$
\frac{\partial^2 y}{\partial t^2}=\frac{\partial^2(Ly^*)}{\partial (t^*/\omega)^2}=L\omega^2\,\frac{\partial^2y^*}{\partial t^{*2}},\qquad
\frac{\partial^4 y}{\partial x^4}=\frac{\partial^4(Ly^*)}{\partial (Lx^*)^4}=\frac{1}{L^3}\,\frac{\partial^4y^*}{\partial x^{*4}}
$$

**3. Substitute.**

$$
\rho A L\omega^2\,\frac{\partial^2y^*}{\partial t^{*2}}+\frac{EI}{L^3}\,\frac{\partial^4y^*}{\partial x^{*4}}=0
$$

**4. Divide by $\rho A L\omega^2$:**

$$
\frac{\partial^2y^*}{\partial t^{*2}}+\frac{EI}{\rho A\,\omega^2L^4}\,\frac{\partial^4y^*}{\partial x^{*4}}=0
$$

**5. The group.** $\Pi=EI/(\rho A\omega^2L^4)$ — the ratio of elastic (bending) restoring force to inertia force.

**Check:** $[EI]=(\dimM\dimL^{-1}\dimT^{-2})(\dimL^4)=\dimM\dimL^3\dimT^{-2}$ and $[\rho A\omega^2L^4]=(\dimM\dimL^{-3})(\dimL^2)(\dimT^{-2})(\dimL^4)=\dimM\dimL^3\dimT^{-2}$, so $\Pi$ is dimensionless.

**Remarks.** The deflection scale cancels because the equation is linear in $y$ — any amplitude scale gives the same result. For free vibration the solution exists only for particular values of $\Pi$, i.e. $\omega\propto\sqrt{EI/(\rho A L^4)}$ (supplementary: this is the familiar natural-frequency scaling of beams).`,
      },
      {
        id: 'fox7-3',
        concept: 'nondimensional-equations',
        difficulty: 1,
        src: P270('7.3'),
        q: md`One-dimensional unsteady flow in a thin liquid layer is described by

$$
\frac{\partial u}{\partial t}+u\frac{\partial u}{\partial x}=-g\frac{\partial h}{\partial x}
$$

(read $u$ as the velocity in $x$, $h$ as the local layer depth and $g$ as gravitational acceleration — the book does not define the symbols). Using a length scale $L$ and a velocity scale $V_0$, nondimensionalize the equation and obtain the dimensionless group(s) that characterize the flow.`,
        hint: md`No time scale is given, so build one from $L$ and $V_0$: $t^*=tV_0/L$. Scale $h$ with $L$ as well.`,
        answer: md`$$
\frac{\partial u^*}{\partial t^*}+u^*\frac{\partial u^*}{\partial x^*}=-\frac{gL}{V_0^2}\frac{\partial h^*}{\partial x^*}
$$

One group: $gL/V_0^2=1/\Fr^2$.`,
        solution: md`**1. Dimensionless variables.**

$$
u^*=\frac{u}{V_0},\qquad x^*=\frac{x}{L},\qquad h^*=\frac{h}{L},\qquad t^*=\frac{tV_0}{L}
$$

The time scale $L/V_0$ is the only time that can be formed from the two given scales.

**2. Transform each term.**

$$
\frac{\partial u}{\partial t}=\frac{V_0^2}{L}\frac{\partial u^*}{\partial t^*},\qquad
u\frac{\partial u}{\partial x}=\frac{V_0^2}{L}\,u^*\frac{\partial u^*}{\partial x^*},\qquad
g\frac{\partial h}{\partial x}=g\,\frac{L}{L}\frac{\partial h^*}{\partial x^*}=g\frac{\partial h^*}{\partial x^*}
$$

**3. Substitute and divide by $V_0^2/L$:**

$$
\frac{\partial u^*}{\partial t^*}+u^*\frac{\partial u^*}{\partial x^*}=-\frac{gL}{V_0^2}\frac{\partial h^*}{\partial x^*}
$$

**4. The group.** $gL/V_0^2=1/\Fr^2$ with $\Fr=V_0/\sqrt{gL}$ (Fox Eq. 7.14): gravity force / inertia force. Two thin-layer flows with the same Froude number (and geometrically similar initial/boundary conditions) have identical dimensionless solutions.

**Remark.** If you scale the depth with its own scale $H$ instead of $L$, the group becomes $gH/V_0^2$ — the Froude number based on depth, which is the usual open-channel choice.`,
      },
      {
        id: 'fox7-4',
        concept: 'nondimensional-equations',
        difficulty: 2,
        src: P270('7.4'),
        q: md`A two-dimensional steady flow of a viscous liquid is described by

$$
u\frac{\partial u}{\partial x}=-g\frac{\partial h}{\partial x}+\frac{\mu}{\rho}\left(\frac{\partial^{2}u}{\partial x^{2}}+\frac{\partial^{2}u}{\partial y^{2}}\right)
$$

($\mu$ viscosity, $\rho$ density; $u$, $h$, $g$ as in Problem 7.3 — these readings are supplied, not printed). Using a length scale $L$ and a velocity scale $V_0$, nondimensionalize the equation and obtain the dimensionless groups that characterize the flow.`,
        hint: md`Scale $x$, $y$, $h$ with $L$ and $u$ with $V_0$. The convective term carries $V_0^2/L$, the viscous term $\mu V_0/(\rho L^2)$.`,
        answer: md`$$
u^*\frac{\partial u^*}{\partial x^*}=-\frac{gL}{V_0^2}\frac{\partial h^*}{\partial x^*}+\frac{\mu}{\rho V_0L}\left(\frac{\partial^2u^*}{\partial x^{*2}}+\frac{\partial^2u^*}{\partial y^{*2}}\right)
$$

Two groups: $gL/V_0^2=1/\Fr^2$ and $\mu/(\rho V_0L)=1/\Rey$.`,
        solution: md`**1. Dimensionless variables.** $x^*=x/L$, $y^*=y/L$, $h^*=h/L$, $u^*=u/V_0$.

**2. Transform each term** (constants factor out of the derivatives):

$$
u\frac{\partial u}{\partial x}=\frac{V_0^2}{L}u^*\frac{\partial u^*}{\partial x^*},\qquad
g\frac{\partial h}{\partial x}=g\frac{\partial h^*}{\partial x^*},\qquad
\frac{\partial^2u}{\partial x^2}=\frac{V_0}{L^2}\frac{\partial^2u^*}{\partial x^{*2}}\ \ (\text{same for } y)
$$

**3. Substitute:**

$$
\frac{V_0^2}{L}u^*\frac{\partial u^*}{\partial x^*}=-g\frac{\partial h^*}{\partial x^*}+\frac{\mu V_0}{\rho L^2}\left(\frac{\partial^2u^*}{\partial x^{*2}}+\frac{\partial^2u^*}{\partial y^{*2}}\right)
$$

**4. Divide by $V_0^2/L$:**

$$
u^*\frac{\partial u^*}{\partial x^*}=-\frac{gL}{V_0^2}\frac{\partial h^*}{\partial x^*}+\frac{\mu}{\rho V_0L}\left(\frac{\partial^2u^*}{\partial x^{*2}}+\frac{\partial^2u^*}{\partial y^{*2}}\right)
$$

**5. The groups.**

- $\dfrac{gL}{V_0^2}=\dfrac{1}{\Fr^2}$ — gravity / inertia.
- $\dfrac{\mu}{\rho V_0L}=\dfrac{1}{\Rey}$ — viscous / inertia, with $\Rey=\rho V_0L/\mu$ (Fox Eq. 7.11).

These are the same two coefficients Fox finds in Eq. 7.10 for the full Navier–Stokes equations. Dynamic similarity of two such flows needs **both** $\Fr$ and $\Rey$ matched.`,
      },
      {
        id: 'fox7-5',
        concept: 'nondimensional-equations',
        difficulty: 2,
        src: P270('7.5'),
        q: md`By order-of-magnitude analysis, continuity and the Navier–Stokes equations reduce to the Prandtl boundary-layer equations. For steady, incompressible, two-dimensional flow with gravity neglected:

$$
\frac{\partial u}{\partial x}+\frac{\partial v}{\partial y}=0,\qquad
u\frac{\partial u}{\partial x}+v\frac{\partial u}{\partial y}=-\frac{1}{\rho}\frac{\partial p}{\partial x}+\nu\frac{\partial^{2}u}{\partial y^{2}}
$$

($u$, $v$ velocity components, $p$ pressure, $\rho$ density, $\nu$ kinematic viscosity — standard readings). Using $L$ and $V_0$ as the characteristic length and velocity, nondimensionalize these equations and identify the similarity parameter(s) that result.`,
        hint: md`Follow Fox Eq. 7.4: lengths over $L$, velocities over $V_0$, pressure over $\rho V_0^2$. Divide continuity by $V_0/L$ and momentum by $V_0^2/L$.`,
        answer: md`$$
\frac{\partial u^*}{\partial x^*}+\frac{\partial v^*}{\partial y^*}=0,\qquad
u^*\frac{\partial u^*}{\partial x^*}+v^*\frac{\partial u^*}{\partial y^*}=-\frac{\partial p^*}{\partial x^*}+\frac{\nu}{V_0L}\frac{\partial^2u^*}{\partial y^{*2}}
$$

Similarity parameter: $\Rey=V_0L/\nu$ (if pressure is scaled by an arbitrary $p_0$, the Euler-type group $p_0/(\rho V_0^2)$ also appears).`,
        solution: md`**1. Dimensionless variables** (Fox Eq. 7.4 pattern):

$$
x^*=\frac{x}{L},\quad y^*=\frac{y}{L},\quad u^*=\frac{u}{V_0},\quad v^*=\frac{v}{V_0},\quad p^*=\frac{p}{\rho V_0^2}
$$

**2. Continuity.** Each term becomes $(V_0/L)\times$(dimensionless derivative):

$$
\frac{V_0}{L}\left(\frac{\partial u^*}{\partial x^*}+\frac{\partial v^*}{\partial y^*}\right)=0\ \Rightarrow\ \frac{\partial u^*}{\partial x^*}+\frac{\partial v^*}{\partial y^*}=0
$$

No parameter appears.

**3. Momentum, term by term.**

$$
u\frac{\partial u}{\partial x}+v\frac{\partial u}{\partial y}=\frac{V_0^2}{L}\left(u^*\frac{\partial u^*}{\partial x^*}+v^*\frac{\partial u^*}{\partial y^*}\right),\qquad
\frac{1}{\rho}\frac{\partial p}{\partial x}=\frac{1}{\rho}\frac{\rho V_0^2}{L}\frac{\partial p^*}{\partial x^*}=\frac{V_0^2}{L}\frac{\partial p^*}{\partial x^*},\qquad
\nu\frac{\partial^2u}{\partial y^2}=\frac{\nu V_0}{L^2}\frac{\partial^2u^*}{\partial y^{*2}}
$$

**4. Divide by $V_0^2/L$:**

$$
u^*\frac{\partial u^*}{\partial x^*}+v^*\frac{\partial u^*}{\partial y^*}=-\frac{\partial p^*}{\partial x^*}+\frac{\nu}{V_0L}\frac{\partial^2u^*}{\partial y^{*2}}
$$

**5. Similarity parameter.** $\nu/(V_0L)=1/\Rey$ with $\Rey=V_0L/\nu$. Two boundary layers with the same Reynolds number (and similar geometry and boundary conditions) have the same dimensionless solution.

**Remark on the pressure scale.** Had we used a general reference pressure $p^*=p/p_0$, the pressure term would carry $p_0/(\rho V_0^2)$ — an Euler-type number (Fox Eq. 7.12 uses $\tfrac12\rho V^2$). Choosing $p_0=\rho V_0^2$, as Fox does, absorbs it.`,
      },
      {
        id: 'fox7-6',
        concept: 'nondimensional-equations',
        difficulty: 3,
        src: P270('7.6'),
        q: md`Flow in a pipe that starts from rest under an applied pressure gradient obeys

$$
\frac{\partial u}{\partial t}=-\frac{1}{\rho}\frac{\partial p}{\partial x}+\nu\left(\frac{\partial^{2}u}{\partial r^{2}}+\frac{1}{r}\frac{\partial u}{\partial r}\right)
$$

($u$ axial velocity, $r$ radial and $x$ axial coordinate, $p$ pressure, $\rho$ density, $\nu$ kinematic viscosity — standard readings). Using the average velocity $\bar V$, the pressure drop $\Delta p$, the pipe length $L$ and the diameter $D$, nondimensionalize the equation and obtain the dimensionless groups that characterize the flow.`,
        hint: md`Use the scale that fits each variable: $x$ with $L$, $r$ with $D$, $u$ with $\bar V$, $p$ with $\Delta p$. No time scale is given — take $L/\bar V$.`,
        answer: md`With $t^*=t\bar V/L$:

$$
\frac{\partial u^*}{\partial t^*}=-\frac{\Delta p}{\rho\bar V^2}\frac{\partial p^*}{\partial x^*}+\frac{\nu L}{\bar VD^2}\left(\frac{\partial^2u^*}{\partial r^{*2}}+\frac{1}{r^*}\frac{\partial u^*}{\partial r^*}\right)
$$

Groups: $\Delta p/(\rho\bar V^2)$ (Euler-type), and $\nu L/(\bar VD^2)=(L/D)/\Rey$, i.e. $\Rey=\bar VD/\nu$ and $L/D$.`,
        solution: md`**1. Dimensionless variables.**

$$
u^*=\frac{u}{\bar V},\quad x^*=\frac{x}{L},\quad r^*=\frac{r}{D},\quad p^*=\frac{p}{\Delta p},\quad t^*=\frac{t\bar V}{L}
$$

(Assumption: the time scale is the through-flow time $L/\bar V$; the problem does not specify one.)

**2. Transform each term.**

$$
\frac{\partial u}{\partial t}=\frac{\bar V^2}{L}\frac{\partial u^*}{\partial t^*},\qquad
\frac{1}{\rho}\frac{\partial p}{\partial x}=\frac{\Delta p}{\rho L}\frac{\partial p^*}{\partial x^*},\qquad
\frac{\partial^2u}{\partial r^2}+\frac{1}{r}\frac{\partial u}{\partial r}=\frac{\bar V}{D^2}\left(\frac{\partial^2u^*}{\partial r^{*2}}+\frac{1}{r^*}\frac{\partial u^*}{\partial r^*}\right)
$$

**3. Substitute:**

$$
\frac{\bar V^2}{L}\frac{\partial u^*}{\partial t^*}=-\frac{\Delta p}{\rho L}\frac{\partial p^*}{\partial x^*}+\frac{\nu\bar V}{D^2}\left(\frac{\partial^2u^*}{\partial r^{*2}}+\frac{1}{r^*}\frac{\partial u^*}{\partial r^*}\right)
$$

**4. Divide by $\bar V^2/L$:**

$$
\frac{\partial u^*}{\partial t^*}=-\frac{\Delta p}{\rho\bar V^2}\frac{\partial p^*}{\partial x^*}+\frac{\nu L}{\bar VD^2}\left(\frac{\partial^2u^*}{\partial r^{*2}}+\frac{1}{r^*}\frac{\partial u^*}{\partial r^*}\right)
$$

**5. The groups.**

- $\dfrac{\Delta p}{\rho\bar V^2}$ — pressure force / inertia force (Euler number form; Fox Eq. 7.12 uses $\tfrac12\rho V^2$).
- $\dfrac{\nu L}{\bar VD^2}=\dfrac{L}{D}\cdot\dfrac{\nu}{\bar VD}=\dfrac{L/D}{\Rey}$ — viscous / inertia, combining the Reynolds number $\Rey=\bar VD/\nu$ with the aspect ratio $L/D$.

So the flow is characterized by $\Delta p/(\rho\bar V^2)$, $\Rey$ and $L/D$.

**Remark.** Choosing instead the viscous diffusion time $D^2/\nu$ as the time scale rearranges the same quantities: the pressure coefficient becomes $\Delta p D^2/(\rho\nu\bar V L)$ and the viscous coefficient becomes 1. The set of independent groups is unchanged — groups are not unique, but their number is.`,
      },
    ],
    quiz: [
      {
        id: 'fox7a-q-nd1',
        concept: 'nondimensional-equations',
        difficulty: 1,
        src: P270('7.3'),
        q: md`When Problem 7.3's thin-layer equation $\partial u/\partial t+u\,\partial u/\partial x=-g\,\partial h/\partial x$ is scaled with $L$ and $V_0$, which group multiplies the depth-gradient term?`,
        options: [md`$gL/V_0^2$`, md`$V_0^2/(gL)$`, md`$\rho V_0L/\mu$`, md`$V_0/\sqrt{gL}$`],
        answer: 0,
        explain: md`Dividing by the inertia coefficient $V_0^2/L$ leaves $g/(V_0^2/L)=gL/V_0^2=1/\Fr^2$ in front of $\partial h^*/\partial x^*$. $V_0^2/(gL)$ is its inverse ($\Fr^2$ itself) and $V_0/\sqrt{gL}$ is $\Fr$ — both are the right family but the wrong power; the Reynolds number cannot appear because the equation contains no viscosity.`,
      },
      {
        id: 'fox7a-q-nd2',
        concept: 'nondimensional-equations',
        difficulty: 2,
        src: P270('7.2'),
        q: md`In Problem 7.2 (beam vibration) the deflection $y$ can be scaled with any length without changing the dimensionless group $EI/(\rho A\omega^2L^4)$. Why?`,
        options: [
          'The equation is linear and homogeneous in y, so the deflection scale cancels',
          'The deflection is always much smaller than L',
          'E and ρ have the same dimensions',
          'Beam vibration is independent of the amplitude only at resonance',
        ],
        answer: 0,
        explain: md`Every term contains $y$ exactly once, so a scale factor on $y$ multiplies every term equally and divides out. Small deflection is why the linear equation is valid in the first place, but it is not why the scale cancels; $E$ (pressure units) and $\rho$ (mass/volume) have different dimensions.`,
      },
      {
        id: 'fox7a-q-nd3',
        concept: 'nondimensional-equations',
        difficulty: 2,
        src: P270('7.5'),
        q: md`True or false: nondimensionalizing the Prandtl boundary-layer equations (Problem 7.5) with $L$, $V_0$ and $p^*=p/(\rho V_0^2)$ leaves the Reynolds number as the only parameter.`,
        options: ['True', 'False'],
        answer: 0,
        explain: md`Continuity has no parameter, the pressure term has coefficient 1 because of the choice $p^*=p/(\rho V_0^2)$, and the viscous term carries $\nu/(V_0L)=1/\Rey$. Gravity was neglected, so no Froude number appears. (A different pressure scale would add an Euler-type group, which is why the statement specifies $\rho V_0^2$.)`,
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  7.7 – 7.19  Determining the Π groups (Buckingham Pi)              */
  /* ------------------------------------------------------------------ */
  {
    id: 'fox7a-buckingham-pi',
    topic: 'buckingham-pi',
    title: "Fox & McDonald's Ch. 7 — Problems 7.7–7.19: determining the Π groups",
    src: { doc: 'fox', pages: '270–271', note: 'Problems 7.7–7.19' },
    intro: md`Each problem lists the physical variables; apply Fox's six-step procedure — count $n$, find the number of primary dimensions $r$, pick $r$ repeating parameters (never the dependent variable), solve for the $n-r$ Π groups and check them.`,
    problems: [
      {
        id: 'fox7-7',
        concept: 'repeating-variables',
        difficulty: 1,
        src: P270('7.7'),
        q: md`Experiments show that the pressure drop across an orifice plate of diameter $d$ mounted in a pipe of diameter $D$ can be written $\Delta p=p_1-p_2=f(\rho,\mu,\bar V,d,D)$. To organize experimental data, obtain the resulting dimensionless parameters.`,
        hint: md`$n=6$, $r=3$ ($\dimM\dimL\dimT$). Repeat $\rho$, $\bar V$, $D$.`,
        answer: md`Three groups: $\dfrac{\Delta p}{\rho\bar V^2}=f\!\left(\dfrac{\rho\bar VD}{\mu},\ \dfrac{d}{D}\right)$`,
        check: [{ label: 'number of Π groups', value: 3, tol: 0.01 }],
        solution: md`**Step 1 — parameters:** $\Delta p,\ \rho,\ \mu,\ \bar V,\ d,\ D$, so $n=6$.

**Steps 2–3 — dimensions** ($\dimM\dimL\dimT$):

| $\Delta p$ | $\rho$ | $\mu$ | $\bar V$ | $d$ | $D$ |
|---|---|---|---|---|---|
| $\dimM\dimL^{-1}\dimT^{-2}$ | $\dimM\dimL^{-3}$ | $\dimM\dimL^{-1}\dimT^{-1}$ | $\dimL\dimT^{-1}$ | $\dimL$ | $\dimL$ |

$r=3$, so $n-r=3$ groups.

**Step 4 — repeating parameters:** $\rho,\ \bar V,\ D$ (they contain $\dimM$, $\dimL$, $\dimT$; not $\Delta p$, the dependent variable; not $\mu$).

**Step 5 — groups.**

$\Pi_1=\Delta p\,\rho^a\bar V^bD^c$: $\ \dimM:\ 1+a=0$; $\ \dimT:\ -2-b=0$; $\ \dimL:\ -1-3a+b+c=0$ $\Rightarrow a=-1,\ b=-2,\ c=0$:

$$
\Pi_1=\frac{\Delta p}{\rho\bar V^2}
$$

$\Pi_2=\mu\,\rho^a\bar V^bD^c$: $\ \dimM:\ 1+a=0$; $\ \dimT:\ -1-b=0$; $\ \dimL:\ -1-3a+b+c=0$ $\Rightarrow a=-1,\ b=-1,\ c=-1$:

$$
\Pi_2=\frac{\mu}{\rho\bar VD}\quad(\text{use its inverse, } \Rey=\rho\bar VD/\mu)
$$

$\Pi_3=d\,\rho^a\bar V^bD^c$ gives $a=b=0$, $c=-1$: $\ \Pi_3=d/D$.

**Step 6 — check** (in $\dimF\dimL\dimT$): $[\Delta p/(\rho\bar V^2)]=(\dimF\dimL^{-2})/(\dimF\dimT^2\dimL^{-4}\cdot\dimL^2\dimT^{-2})=1$. ✓

**Result:**

$$
\frac{\Delta p}{\rho\bar V^2}=f\!\left(\frac{\rho\bar VD}{\mu},\ \frac{d}{D}\right)
$$

Plot $\Delta p/(\rho\bar V^2)$ against $\Rey$ with one curve per diameter ratio $d/D$.`,
      },
      {
        id: 'fox7-8',
        concept: 'pi-theorem',
        difficulty: 1,
        src: P270('7.8'),
        q: md`At relatively high speeds the drag on an object does not depend on fluid viscosity. The aerodynamic drag force $F$ on an automobile is then a function only of speed $V$, air density $\rho$ and vehicle size, characterized by the frontal area $A$. Use dimensional analysis to find how $F$ depends on $V$.`,
        hint: md`$n=4$ and $r=3$, so there is a single Π group — and a single group must equal a constant.`,
        answer: md`$\dfrac{F}{\rho V^2A}=\text{const}$, so $F\propto V^2$ (at fixed $\rho$ and $A$).`,
        check: [{ label: 'exponent of $V$ in $F$', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $F,\ V,\ \rho,\ A$ $\Rightarrow n=4$.

**Dimensions:** $F$: $\dimM\dimL\dimT^{-2}$; $V$: $\dimL\dimT^{-1}$; $\rho$: $\dimM\dimL^{-3}$; $A$: $\dimL^2$. $\ r=3$.

**Number of groups:** $n-r=1$.

**Repeating parameters:** $\rho,\ V,\ A$.

$\Pi=F\rho^aV^bA^c$:

$$
\begin{aligned}
\dimM:&\quad 1+a=0 &&\Rightarrow a=-1\\
\dimT:&\quad -2-b=0 &&\Rightarrow b=-2\\
\dimL:&\quad 1-3a+b+2c=0 &&\Rightarrow 1+3-2+2c=0\Rightarrow c=-1
\end{aligned}
$$

$$
\Pi=\frac{F}{\rho V^2A}
$$

**Conclusion.** With only one group, $\Pi=f(\ )$ has no argument, so it must be a **constant** (the drag coefficient, up to a factor 2):

$$
F=C\,\rho V^2A\qquad\Rightarrow\qquad F\propto V^2
$$

Doubling the speed quadruples the drag. The constant $C$ must come from experiment (e.g. a wind-tunnel test).`,
      },
      {
        id: 'fox7-9',
        concept: 'repeating-variables',
        difficulty: 1,
        src: P270('7.9'),
        q: md`The drag force $F$ on the International Space Station depends on the mean free path of the molecules $\lambda$ (a length), the density $\rho$, a characteristic length $L$ and the mean speed of the air molecules $c$. Find a nondimensional form of this functional relationship. (The book gives no symbol for the drag force; $F$ is used here.)`,
        hint: md`$n=5$, $r=3$. Repeat $\rho$, $c$, $L$. Two lengths give a length ratio directly.`,
        answer: md`$\dfrac{F}{\rho c^2L^2}=f\!\left(\dfrac{\lambda}{L}\right)$`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $F,\ \lambda,\ \rho,\ L,\ c$ $\Rightarrow n=5$.

**Dimensions:** $F$: $\dimM\dimL\dimT^{-2}$; $\lambda$, $L$: $\dimL$; $\rho$: $\dimM\dimL^{-3}$; $c$: $\dimL\dimT^{-1}$. $\ r=3$, so $n-r=2$ groups.

**Repeating parameters:** $\rho,\ c,\ L$ (not $F$, the dependent variable; not both $\lambda$ and $L$, whose dimensions are identical).

$\Pi_1=F\rho^ac^bL^d$: $\ \dimM:\ 1+a=0$; $\ \dimT:\ -2-b=0$; $\ \dimL:\ 1-3a+b+d=0$ $\Rightarrow a=-1,\ b=-2,\ d=-2$:

$$
\Pi_1=\frac{F}{\rho c^2L^2}
$$

$\Pi_2=\lambda\rho^ac^bL^d$ $\Rightarrow a=b=0,\ d=-1$: $\ \Pi_2=\lambda/L$.

**Result:**

$$
\frac{F}{\rho c^2L^2}=f\!\left(\frac{\lambda}{L}\right)
$$

$\lambda/L$ is the Knudsen number (supplementary name) — it measures how rarefied the gas is relative to the body size, which is what matters in the very thin air at the station's altitude.`,
      },
      {
        id: 'fox7-10',
        concept: 'repeating-variables',
        difficulty: 1,
        src: P270('7.10'),
        q: md`At supersonic speeds the aerodynamic drag $F$ on an object depends on its velocity $V$, the air density $\rho$, its size (a reference area $A$) and the speed of sound $c$. (All except $c$ were the variables used for subsonic speeds in Problem 7.8.) Develop a functional relationship between dimensionless variables that describes the problem.`,
        hint: md`Adding $c$ to Problem 7.8's list adds one variable but no new dimension, so it adds exactly one Π group.`,
        answer: md`$\dfrac{F}{\rho V^2A}=f\!\left(\dfrac{V}{c}\right)=f(\Ma)$`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $F,\ V,\ \rho,\ A,\ c$ $\Rightarrow n=5$; dimensions as in Problem 7.8 plus $c$: $\dimL\dimT^{-1}$. $\ r=3$, so 2 groups.

**Repeating parameters:** $\rho,\ V,\ A$.

$\Pi_1=F\rho^aV^bA^d$: exactly as in Problem 7.8, $a=-1,\ b=-2,\ d=-1$:

$$
\Pi_1=\frac{F}{\rho V^2A}
$$

$\Pi_2=c\,\rho^aV^bA^d$: $\ \dimM:\ a=0$; $\ \dimT:\ -1-b=0\Rightarrow b=-1$; $\ \dimL:\ 1+b+2d=0\Rightarrow d=0$:

$$
\Pi_2=\frac{c}{V}\quad(\text{invert to } V/c=\Ma)
$$

**Result:**

$$
\frac{F}{\rho V^2A}=f\!\left(\frac{V}{c}\right)
$$

The drag coefficient is no longer a constant (as it was in Problem 7.8); it depends on the Mach number $\Ma=V/c$ (Fox Eq. 7.16), the key parameter for compressibility effects.`,
      },
      {
        id: 'fox7-11',
        concept: 'repeating-variables',
        difficulty: 1,
        src: P270('7.11'),
        q: md`The wall shear stress $\tau_w$ in a boundary layer depends on the distance from the body's leading edge $x$, the fluid density $\rho$ and viscosity $\mu$, and the freestream speed $U$. Obtain the dimensionless groups and express the functional relationship among them.`,
        hint: md`Repeat $\rho$, $U$, $x$. Shear stress has the dimensions of pressure.`,
        answer: md`$\dfrac{\tau_w}{\rho U^2}=f\!\left(\dfrac{\rho Ux}{\mu}\right)=f(\Rey_x)$`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $\tau_w,\ x,\ \rho,\ \mu,\ U$ $\Rightarrow n=5$.

**Dimensions:** $\tau_w$: $\dimM\dimL^{-1}\dimT^{-2}$; $x$: $\dimL$; $\rho$: $\dimM\dimL^{-3}$; $\mu$: $\dimM\dimL^{-1}\dimT^{-1}$; $U$: $\dimL\dimT^{-1}$. $\ r=3\Rightarrow 2$ groups.

**Repeating parameters:** $\rho,\ U,\ x$.

$\Pi_1=\tau_w\rho^aU^bx^c$: $\ \dimM:\ 1+a=0$; $\ \dimT:\ -2-b=0$; $\ \dimL:\ -1-3a+b+c=0$ $\Rightarrow a=-1,\ b=-2,\ c=0$:

$$
\Pi_1=\frac{\tau_w}{\rho U^2}
$$

$\Pi_2=\mu\rho^aU^bx^c$: $\ a=-1,\ b=-1,\ c=-1$:

$$
\Pi_2=\frac{\mu}{\rho Ux}\ \to\ \Rey_x=\frac{\rho Ux}{\mu}
$$

**Result:**

$$
\frac{\tau_w}{\rho U^2}=f\!\left(\frac{\rho Ux}{\mu}\right)
$$

The left side is (half) the local skin-friction coefficient; the local Reynolds number $\Rey_x$ is based on distance from the leading edge.`,
      },
      {
        id: 'fox7-12',
        concept: 'repeating-variables',
        difficulty: 1,
        src: P270('7.12'),
        q: md`For a smooth flat plate in incompressible flow with no pressure gradient, the boundary-layer thickness $\delta$ depends on the freestream speed $U$, the fluid density $\rho$, the viscosity $\mu$ and the distance from the leading edge $x$. Express these variables in dimensionless form.`,
        hint: md`Same variable list as Problem 7.11 with $\tau_w$ replaced by the length $\delta$.`,
        answer: md`$\dfrac{\delta}{x}=f\!\left(\dfrac{\rho Ux}{\mu}\right)=f(\Rey_x)$`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $\delta,\ U,\ \rho,\ \mu,\ x$ $\Rightarrow n=5$; $r=3$ ($\delta$ and $x$ are $\dimL$, $U$ is $\dimL\dimT^{-1}$, $\rho$ is $\dimM\dimL^{-3}$, $\mu$ is $\dimM\dimL^{-1}\dimT^{-1}$) $\Rightarrow 2$ groups.

**Repeating parameters:** $\rho,\ U,\ x$.

$\Pi_1=\delta\rho^aU^bx^c$: $\ \dimM:\ a=0$; $\ \dimT:\ -b=0$; $\ \dimL:\ 1+c=0$ $\Rightarrow$

$$
\Pi_1=\frac{\delta}{x}
$$

$\Pi_2=\mu\rho^aU^bx^c$ gives, as in Problem 7.11, $\mu/(\rho Ux)$, i.e. $\Rey_x=\rho Ux/\mu$.

**Result:**

$$
\frac{\delta}{x}=f\!\left(\frac{\rho Ux}{\mu}\right)
$$

Supplementary: for a laminar boundary layer the function turns out to be $\delta/x\approx 5/\sqrt{\Rey_x}$ (Blasius) — dimensional analysis gives the form, theory or experiment gives the function.`,
      },
      {
        id: 'fox7-13',
        concept: 'repeating-variables',
        difficulty: 2,
        src: P270('7.13'),
        q: md`A light enough object can be supported on a liquid surface by surface tension, and tests are planned. The supportable weight $W$ depends on the object's perimeter $p$, the fluid density $\rho$, the surface tension $\sigma$ and gravity $g$. Determine the dimensionless parameters that characterize the problem.`,
        hint: md`Here $p$ is a **length** (perimeter), not a pressure. Repeat $p$, $\sigma$, $\rho$ — check they are dimensionally independent.`,
        answer: md`$\dfrac{W}{\sigma p}=f\!\left(\dfrac{\rho g p^2}{\sigma}\right)$`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $W,\ p,\ \rho,\ \sigma,\ g$ $\Rightarrow n=5$.

**Dimensions:** $W$: $\dimM\dimL\dimT^{-2}$; $p$: $\dimL$; $\rho$: $\dimM\dimL^{-3}$; $\sigma$ (force per length): $\dimM\dimT^{-2}$; $g$: $\dimL\dimT^{-2}$. $\ r=3\Rightarrow 2$ groups.

**Repeating parameters:** $p,\ \sigma,\ \rho$ — $p$ carries only $\dimL$, $\sigma$ brings $\dimT$, $\rho$ brings $\dimM$ with a different $\dimL$ power, so they are independent. ($W$ is the dependent variable and must not repeat.)

$\Pi_1=W\rho^a\sigma^bp^c$:

$$
\begin{aligned}
\dimM:&\quad 1+a+b=0\\
\dimT:&\quad -2-2b=0 &&\Rightarrow b=-1,\ a=0\\
\dimL:&\quad 1-3a+c=0 &&\Rightarrow c=-1
\end{aligned}
$$

$$
\Pi_1=\frac{W}{\sigma p}
$$

$\Pi_2=g\rho^a\sigma^bp^c$:

$$
\begin{aligned}
\dimM:&\quad a+b=0\\
\dimT:&\quad -2-2b=0 &&\Rightarrow b=-1,\ a=1\\
\dimL:&\quad 1-3a+c=0 &&\Rightarrow c=2
\end{aligned}
$$

$$
\Pi_2=\frac{\rho gp^2}{\sigma}
$$

**Check:** $\sigma p$ is a force, like $W$ ✓; $\rho g p^2$ has units $(\mathrm{N/m^3})(\mathrm{m^2})=\mathrm{N/m}$, like $\sigma$ ✓.

**Result:**

$$
\frac{W}{\sigma p}=f\!\left(\frac{\rho gp^2}{\sigma}\right)
$$

$\Pi_2$ compares gravity to surface tension (a Bond-number type group, supplementary name). When it is small, $W\approx C\,\sigma p$ — the weight supported is proportional to the perimeter.`,
      },
      {
        id: 'fox7-14',
        concept: 'repeating-variables',
        difficulty: 2,
        src: P270('7.14'),
        q: md`The mean velocity $\bar u$ for turbulent flow in a pipe or boundary layer may be correlated using the wall shear stress $\tau_w$, the distance from the wall $y$ and the fluid properties $\rho$ and $\mu$. Use dimensional analysis to find one dimensionless parameter containing $\bar u$ and one containing $y$ that are suitable for organizing experimental data. Show that the result can be written

$$
\frac{\bar u}{u_*}=f\!\left(\frac{y\,u_*}{\nu}\right)
$$

where $u_*=(\tau_w/\rho)^{1/2}$ is the **friction velocity** and $\nu=\mu/\rho$.`,
        hint: md`Repeat $\tau_w$, $\rho$, $y$. Half-integer exponents will appear — they combine into $u_*$.`,
        answer: md`$\Pi_1=\bar u\sqrt{\rho/\tau_w}=\bar u/u_*$, $\ \Pi_2=\mu/(y\sqrt{\rho\tau_w})=\nu/(yu_*)$; inverting $\Pi_2$: $\ \bar u/u_*=f(yu_*/\nu)$.`,
        check: [{ label: md`exponent of $\tau_w$ in the $\bar u$ group`, value: -0.5, tol: 0.01 }],
        solution: md`**Parameters:** $\bar u,\ \tau_w,\ y,\ \rho,\ \mu$ $\Rightarrow n=5$.

**Dimensions:** $\bar u$: $\dimL\dimT^{-1}$; $\tau_w$: $\dimM\dimL^{-1}\dimT^{-2}$; $y$: $\dimL$; $\rho$: $\dimM\dimL^{-3}$; $\mu$: $\dimM\dimL^{-1}\dimT^{-1}$. $\ r=3\Rightarrow 2$ groups.

**Repeating parameters:** $\tau_w,\ \rho,\ y$ (all three primary dimensions; $\bar u$ is dependent; avoid $\mu$).

**$\Pi_1=\bar u\,\tau_w^a\rho^by^c$:**

$$
\begin{aligned}
\dimM:&\quad a+b=0\\
\dimT:&\quad -1-2a=0 &&\Rightarrow a=-\tfrac12,\ b=\tfrac12\\
\dimL:&\quad 1-a-3b+c=0 &&\Rightarrow 1+\tfrac12-\tfrac32+c=0\Rightarrow c=0
\end{aligned}
$$

$$
\Pi_1=\bar u\sqrt{\frac{\rho}{\tau_w}}=\frac{\bar u}{\sqrt{\tau_w/\rho}}=\frac{\bar u}{u_*}
$$

**$\Pi_2=\mu\,\tau_w^a\rho^by^c$:**

$$
\begin{aligned}
\dimM:&\quad 1+a+b=0\\
\dimT:&\quad -1-2a=0 &&\Rightarrow a=-\tfrac12,\ b=-\tfrac12\\
\dimL:&\quad -1-a-3b+c=0 &&\Rightarrow -1+\tfrac12+\tfrac32+c=0\Rightarrow c=-1
\end{aligned}
$$

$$
\Pi_2=\frac{\mu}{y\sqrt{\tau_w\rho}}=\frac{\mu}{\rho\,y\sqrt{\tau_w/\rho}}=\frac{\nu}{y\,u_*}
$$

**Rearrange.** Any function of a Π group is also a valid group, so use $1/\Pi_2=yu_*/\nu$:

$$
\frac{\bar u}{u_*}=f\!\left(\frac{y\,u_*}{\nu}\right)
$$

which is the required form. $u_*$ is a velocity built from the wall stress, and $\nu/u_*$ is a viscous length; this is the dimensional basis of the turbulent "law of the wall" (developed in the turbulent-flow topic).`,
      },
      {
        id: 'fox7-15',
        concept: 'repeating-variables',
        difficulty: 2,
        src: P270('7.15'),
        q: md`The energy $E$ released by an explosion depends on the time after detonation $t$, the blast radius $R$ at that time, the ambient air pressure $p$ and the density $\rho$. Determine by dimensional analysis the general form of the expression for $E$ in terms of the other variables.`,
        hint: md`Repeat $\rho$, $R$, $t$ (not $E$). Energy is $\dimM\dimL^2\dimT^{-2}$.`,
        answer: md`$E=\dfrac{\rho R^5}{t^2}\,f\!\left(\dfrac{pt^2}{\rho R^2}\right)$`,
        check: [
          { label: 'exponent of $R$ in the energy group', value: 5, tol: 0.01 },
          { label: 'exponent of $t$ in the energy group', value: -2, tol: 0.01 },
        ],
        solution: md`**Parameters:** $E,\ t,\ R,\ p,\ \rho$ $\Rightarrow n=5$.

**Dimensions:** $E$: $\dimM\dimL^2\dimT^{-2}$; $t$: $\dimT$; $R$: $\dimL$; $p$: $\dimM\dimL^{-1}\dimT^{-2}$; $\rho$: $\dimM\dimL^{-3}$. $\ r=3\Rightarrow 2$ groups.

**Repeating parameters:** $\rho,\ R,\ t$ — one per primary dimension, clearly independent.

**$\Pi_1=E\rho^aR^bt^c$:** $\ \dimM:\ 1+a=0\Rightarrow a=-1$; $\ \dimT:\ -2+c=0\Rightarrow c=2$; $\ \dimL:\ 2-3a+b=0\Rightarrow b=-5$:

$$
\Pi_1=\frac{Et^2}{\rho R^5}
$$

**$\Pi_2=p\rho^aR^bt^c$:** $\ a=-1$; $\ c=2$; $\ \dimL:\ -1+3+b=0\Rightarrow b=-2$:

$$
\Pi_2=\frac{pt^2}{\rho R^2}
$$

**Result:** $\Pi_1=f(\Pi_2)$, i.e.

$$
E=\frac{\rho R^5}{t^2}\,f\!\left(\frac{pt^2}{\rho R^2}\right)
$$

**Check:** $\rho R^5/t^2$ has units $\mathrm{kg\,m^{-3}\cdot m^5\cdot s^{-2}}=\mathrm{kg\,m^2\,s^{-2}}=\mathrm{J}$ ✓.

Supplementary: for a very strong blast the ambient pressure is negligible, $f$ tends to a constant, and $R\propto (E/\rho)^{1/5}t^{2/5}$ — G. I. Taylor's famous scaling for blast waves.`,
      },
      {
        id: 'fox7-16',
        concept: 'repeating-variables',
        difficulty: 1,
        src: P270('7.16'),
        q: md`Capillary waves form on a liquid free surface as a result of surface tension; they have short wavelengths. Their speed $V$ depends on the surface tension $\sigma$, the wavelength $\lambda$ and the liquid density $\rho$. Use dimensional analysis to express the wave speed as a function of these variables.`,
        hint: md`Four variables, three dimensions: one group, which must be constant. Solve for the exponents of $\sigma$, $\rho$, $\lambda$.`,
        answer: md`$V=C\sqrt{\dfrac{\sigma}{\rho\lambda}}$ ($C$ a constant)`,
        check: [{ label: md`exponent of $\lambda$ in $V$`, value: -0.5, tol: 0.01 }],
        solution: md`**Parameters:** $V,\ \sigma,\ \lambda,\ \rho$ $\Rightarrow n=4$; dimensions $V$: $\dimL\dimT^{-1}$, $\sigma$: $\dimM\dimT^{-2}$, $\lambda$: $\dimL$, $\rho$: $\dimM\dimL^{-3}$; $r=3\Rightarrow$ **one** group.

$\Pi=V\sigma^a\rho^b\lambda^c$:

$$
\begin{aligned}
\dimM:&\quad a+b=0\\
\dimT:&\quad -1-2a=0 &&\Rightarrow a=-\tfrac12,\ b=\tfrac12\\
\dimL:&\quad 1-3b+c=0 &&\Rightarrow c=\tfrac12
\end{aligned}
$$

$$
\Pi=V\sqrt{\frac{\rho\lambda}{\sigma}}=C\quad\Rightarrow\quad V=C\sqrt{\frac{\sigma}{\rho\lambda}}
$$

Shorter waves travel **faster** ($V\propto\lambda^{-1/2}$), opposite to gravity waves.

**Cross-check with Problem 7.1.** Keeping only the surface-tension term in deep water ($\tanh\to1$) gives $c^2=2\pi\sigma/(\rho\lambda)$, so the theory fixes $C=\sqrt{2\pi}\approx 2.51$.`,
      },
      {
        id: 'fox7-17',
        concept: 'dimensional-matrix',
        difficulty: 2,
        src: P270('7.17'),
        q: md`The torque $T$ of a handheld automobile buffer is a function of its rotational speed $\omega$, the applied normal force $F$, the automobile surface roughness $e$, the buffing-paste viscosity $\mu$ and the surface tension $\sigma$. Determine the dimensionless parameters that characterize the problem.`,
        hint: md`Write the $3\times6$ dimensional matrix to confirm rank 3. Repeat $F$, $\omega$, $e$ (never $\mu$ or the dependent $T$).`,
        answer: md`$\dfrac{T}{Fe}=f\!\left(\dfrac{\mu\omega e^2}{F},\ \dfrac{\sigma e}{F}\right)$`,
        check: [{ label: 'number of Π groups', value: 3, tol: 0.01 }],
        solution: md`**Parameters:** $T,\ \omega,\ F,\ e,\ \mu,\ \sigma$ $\Rightarrow n=6$.

**Dimensional matrix** (exponents of $\dimM$, $\dimL$, $\dimT$):

| | $T$ | $\omega$ | $F$ | $e$ | $\mu$ | $\sigma$ |
|---|---|---|---|---|---|---|
| $\dimM$ | 1 | 0 | 1 | 0 | 1 | 1 |
| $\dimL$ | 2 | 0 | 1 | 1 | −1 | 0 |
| $\dimT$ | −2 | −1 | −2 | 0 | −1 | −2 |

The columns of $\omega$, $F$, $e$ form a non-singular $3\times3$ block (its determinant is $-1\neq0$: $e$ supplies $\dimL$, $\omega$ supplies $\dimT$ and $F$ then supplies $\dimM$), so the rank is $m=3$ and there are $n-m=3$ groups.

**Repeating parameters:** $F,\ \omega,\ e$.

**$\Pi_1=TF^a\omega^be^c$:** $\ \dimM:\ 1+a=0\Rightarrow a=-1$; $\ \dimT:\ -2-2a-b=0\Rightarrow b=0$; $\ \dimL:\ 2+a+c=0\Rightarrow c=-1$:

$$
\Pi_1=\frac{T}{Fe}
$$

**$\Pi_2=\mu F^a\omega^be^c$:** $\ a=-1$; $\ \dimT:\ -1+2-b=0\Rightarrow b=1$; $\ \dimL:\ -1-1+c=0\Rightarrow c=2$:

$$
\Pi_2=\frac{\mu\omega e^2}{F}
$$

**$\Pi_3=\sigma F^a\omega^be^c$:** $\ a=-1$; $\ \dimT:\ -2+2-b=0\Rightarrow b=0$; $\ \dimL:\ 0-1+c=0\Rightarrow c=1$:

$$
\Pi_3=\frac{\sigma e}{F}
$$

**Check (in $\dimF\dimL\dimT$):** $T/(Fe)$: $\dimF\dimL/(\dimF\dimL)$ ✓; $\mu\omega e^2/F$: $(\dimF\dimT\dimL^{-2})(\dimT^{-1})(\dimL^2)/\dimF$ ✓; $\sigma e/F$: $(\dimF\dimL^{-1})(\dimL)/\dimF$ ✓.

**Result:**

$$
\frac{T}{Fe}=f\!\left(\frac{\mu\omega e^2}{F},\ \frac{\sigma e}{F}\right)
$$

Other repeating sets give different-looking but equivalent groups (Fox: groups are independent but not unique).`,
      },
      {
        id: 'fox7-18',
        concept: 'dimensional-matrix',
        difficulty: 2,
        src: P270('7.18'),
        q: md`The power $\mathscr{P}$ used by a vacuum cleaner is to be correlated with the suction it provides, indicated by the pressure drop $\Delta p$ below ambient room pressure. It also depends on the impeller diameter $D$ and width $d$, the motor speed $\omega$, the air density $\rho$, and the cleaner's inlet and exit widths $d_i$ and $d_0$. Determine the dimensionless parameters that characterize the problem.`,
        hint: md`$n=8$, rank 3. Repeat $\rho$, $\omega$, $D$ — the turbomachine choice. The three lengths other than $D$ ($d$, $d_i$, $d_0$) just become ratios.`,
        answer: md`$\dfrac{\mathscr{P}}{\rho\omega^3D^5}=f\!\left(\dfrac{\Delta p}{\rho\omega^2D^2},\ \dfrac{d}{D},\ \dfrac{d_i}{D},\ \dfrac{d_0}{D}\right)$`,
        check: [
          { label: 'number of Π groups', value: 5, tol: 0.01 },
          { label: 'exponent of $D$ in the power group', value: -5, tol: 0.01 },
        ],
        solution: md`**Parameters:** $\mathscr{P},\ \Delta p,\ D,\ d,\ \omega,\ \rho,\ d_i,\ d_0$ $\Rightarrow n=8$.

**Dimensional matrix:**

| | $\mathscr{P}$ | $\Delta p$ | $D$ | $d$ | $d_i$ | $d_0$ | $\omega$ | $\rho$ |
|---|---|---|---|---|---|---|---|---|
| $\dimM$ | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| $\dimL$ | 2 | −1 | 1 | 1 | 1 | 1 | 0 | −3 |
| $\dimT$ | −3 | −2 | 0 | 0 | 0 | 0 | −1 | 0 |

Rank $m=3$ ($\rho$, $\omega$, $D$ are independent: only $\rho$ has $\dimM$, only $\omega$ has $\dimT$, $D$ has pure $\dimL$), so $n-m=5$ groups.

**Repeating parameters:** $\rho,\ \omega,\ D$.

**$\Pi_1=\mathscr{P}\rho^a\omega^bD^c$:** $\ \dimM:\ 1+a=0\Rightarrow a=-1$; $\ \dimT:\ -3-b=0\Rightarrow b=-3$; $\ \dimL:\ 2-3a+c=0\Rightarrow c=-5$:

$$
\Pi_1=\frac{\mathscr{P}}{\rho\omega^3D^5}
$$

**$\Pi_2=\Delta p\,\rho^a\omega^bD^c$:** $\ a=-1$; $\ \dimT:\ -2-b=0\Rightarrow b=-2$; $\ \dimL:\ -1+3+c=0\Rightarrow c=-2$:

$$
\Pi_2=\frac{\Delta p}{\rho\omega^2D^2}
$$

**$\Pi_3,\Pi_4,\Pi_5$:** each extra length over $D$: $\ d/D,\ d_i/D,\ d_0/D$.

**Result:**

$$
\frac{\mathscr{P}}{\rho\omega^3D^5}=f\!\left(\frac{\Delta p}{\rho\omega^2D^2},\ \frac{d}{D},\ \frac{d_i}{D},\ \frac{d_0}{D}\right)
$$

$\Pi_1$ and $\Pi_2$ are the power and pressure (head) coefficients used for pumps and fans; for a family of geometrically similar cleaners the three length ratios are fixed and the power coefficient depends on the pressure coefficient alone.`,
      },
      {
        id: 'fox7-19',
        concept: 'repeating-variables',
        difficulty: 2,
        src: P271('7.19'),
        q: md`The time $t$ for oil to drain out of a viscosity-calibration container depends on the fluid viscosity $\mu$, the density $\rho$, the orifice diameter $d$ and gravity $g$. Use dimensional analysis to find the functional dependence of $t$ on the other variables, expressed in the simplest possible form.`,
        hint: md`Repeat $\rho$, $d$, $g$. The time group is $t\sqrt{g/d}$.`,
        answer: md`$t\sqrt{\dfrac{g}{d}}=f\!\left(\dfrac{\mu}{\rho\sqrt{gd^3}}\right)$, i.e. $t=\sqrt{\dfrac{d}{g}}\,f\!\left(\dfrac{\mu}{\rho\sqrt{gd^3}}\right)$`,
        check: [{ label: 'number of Π groups', value: 2, tol: 0.01 }],
        solution: md`**Parameters:** $t,\ \mu,\ \rho,\ d,\ g$ $\Rightarrow n=5$.

**Dimensions:** $t$: $\dimT$; $\mu$: $\dimM\dimL^{-1}\dimT^{-1}$; $\rho$: $\dimM\dimL^{-3}$; $d$: $\dimL$; $g$: $\dimL\dimT^{-2}$. $\ r=3\Rightarrow 2$ groups.

**Repeating parameters:** $\rho,\ d,\ g$ (not $t$, the dependent variable; not $\mu$).

**$\Pi_1=t\rho^ad^bg^c$:** $\ \dimM:\ a=0$; $\ \dimT:\ 1-2c=0\Rightarrow c=\tfrac12$; $\ \dimL:\ -3a+b+c=0\Rightarrow b=-\tfrac12$:

$$
\Pi_1=t\sqrt{\frac{g}{d}}
$$

**$\Pi_2=\mu\rho^ad^bg^c$:** $\ \dimM:\ 1+a=0\Rightarrow a=-1$; $\ \dimT:\ -1-2c=0\Rightarrow c=-\tfrac12$; $\ \dimL:\ -1+3+b-\tfrac12=0\Rightarrow b=-\tfrac32$:

$$
\Pi_2=\frac{\mu}{\rho\,d^{3/2}g^{1/2}}=\frac{\mu}{\rho\sqrt{gd^3}}
$$

**Simplest form:**

$$
t=\sqrt{\frac{d}{g}}\;f\!\left(\frac{\mu}{\rho\sqrt{gd^3}}\right)
$$

$\Pi_2$ is the inverse of a Reynolds number built on the free-fall speed $\sqrt{gd}$.

Supplementary: a viscometer is designed so that viscous effects dominate; if $t$ is then proportional to $\mu$, the relation collapses to $t=C\,\mu/(\rho gd)$, i.e. $t\propto\nu$ — which is why drain-time viscometers read **kinematic** viscosity.`,
      },
    ],
    quiz: [
      {
        id: 'fox7a-q-pi1',
        concept: 'pi-theorem',
        difficulty: 1,
        src: P270('7.8'),
        q: md`In Problem 7.8 the high-speed drag $F$ depends only on $V$, $\rho$ and $A$. What does dimensional analysis alone predict when $V$ is doubled (same car, same air)?`,
        options: ['The drag force increases by a factor of 4', 'The drag force doubles', 'The drag force increases by a factor of 8', 'Nothing — the relation must be found experimentally'],
        answer: 0,
        explain: md`Four variables and three dimensions give a single group, $F/(\rho V^2A)$, which must be a constant, so $F\propto V^2$ and doubling $V$ quadruples $F$. Experiment is needed only for the value of the constant, not for the exponent — that is the power of the $n-r=1$ case.`,
      },
      {
        id: 'fox7a-q-pi2',
        concept: 'repeating-variables',
        difficulty: 2,
        src: P270('7.17'),
        q: md`For the buffer torque of Problem 7.17, $T=f(\omega,F,e,\mu,\sigma)$, which choice of repeating parameters follows Fox's rules?`,
        options: [md`$F,\ \omega,\ e$`, md`$T,\ \omega,\ e$`, md`$\mu,\ \omega,\ e$`, md`$F,\ \sigma,\ e$`],
        answer: 0,
        explain: md`$F$, $\omega$, $e$ are dimensionally independent and contain $\dimM$, $\dimL$, $\dimT$. $T$ is the dependent variable and must not repeat; Fox advises never repeating $\mu$; and $F$, $\sigma$, $e$ are not independent, because $[F]=[\sigma][e]$ — the force is dimensionally a product of the other two, so the three columns of the dimensional matrix are linearly dependent and span only two independent dimension combinations.`,
      },
      {
        id: 'fox7a-q-pi3',
        concept: 'repeating-variables',
        difficulty: 2,
        src: P270('7.14'),
        q: md`Problem 7.14 leads to $\bar u/u_*=f(yu_*/\nu)$. The group $yu_*/\nu$ came out of the analysis as $\mu/(y\sqrt{\rho\tau_w})$. Why is it legitimate to use the inverted form?`,
        options: [
          'Any function of a Π group (such as its inverse) is itself a valid dimensionless group',
          'Because ν = μ/ρ makes the two expressions exactly equal',
          'Inverting is only allowed when the exponents are half-integers',
          'Because the friction velocity is defined to make the group equal to one',
        ],
        answer: 0,
        explain: md`Π groups are independent but not unique: powers and products of groups are equally valid, so $1/\Pi_2=yu_*/\nu$ carries the same information. The relation $\nu=\mu/\rho$ is used to rewrite $\Pi_2$ as $\nu/(yu_*)$, but that expression is the inverse, not the same quantity.`,
      },
      {
        id: 'fox7a-q-pi4',
        concept: 'dimensional-matrix',
        difficulty: 1,
        src: P270('7.18'),
        q: md`How many Π groups describe the vacuum-cleaner power of Problem 7.18, with variables $\mathscr{P},\ \Delta p,\ D,\ d,\ \omega,\ \rho,\ d_i,\ d_0$?`,
        options: ['5', '8', '3', '4'],
        answer: 0,
        explain: md`$n=8$ variables and the dimensional matrix has rank $m=3$ ($\dimM\dimL\dimT$), so $n-m=5$ groups. 3 is the number of repeating parameters, not of groups; 8 is the number of dimensional variables.`,
      },
    ],
  },
]
