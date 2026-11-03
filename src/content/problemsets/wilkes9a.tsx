import type { ProblemSet } from '@/lib/types'
import { md } from '@/kit'

/*
 * Wilkes, Fluid Mechanics for Chemical Engineers, Chapter 9 end-of-chapter problems
 * 9.1–9.16 and 9.25 (printed pp. 532–540). The book prints statements only (no answers);
 * every solution below was written for this platform and every number re-computed with python3.
 */

const W = (pages: string, n: string) => ({ doc: 'wilkes' as const, pages, note: `Problem ${n}` })

export const sets: ProblemSet[] = [
  /* ------------------------------------------------------------------ */
  /*  Mixing length / eddy viscosity: 9.1, 9.4, 9.6, 9.10                */
  /* ------------------------------------------------------------------ */
  {
    id: 'wilkes9a-mixing-length',
    topic: 'mixing-length',
    title: 'Wilkes Ch. 9 — Problems 9.1, 9.4, 9.6, 9.10: mixing length and eddy viscosity',
    src: { doc: 'wilkes', pages: '532–536', note: 'Problems 9.1, 9.4, 9.6, 9.10' },
    intro: md`Each problem pairs a model for $\ell$ or $\nu_T$ with a known shear-stress distribution, then integrates for the velocity (or a concentration) profile. That is the procedure of Wilkes §§9.3–9.5.`,
    problems: [
      {
        id: 'w9-1',
        concept: 'transport-analogies',
        difficulty: 3,
        src: W('532', '9.1'),
        q: md`**Agitation of particles.** A liquid carrying suspended particles flows down an open channel inclined at angle $\theta$ to the horizontal, with uniform depth $\lambda$. Turbulence keeps the particles in suspension.

1. Take the Prandtl mixing length to vary with height $y$ above the channel bed as $\ell = k y\sqrt{1 - y/\lambda}$ ($k$ constant). Show that the time-averaged velocity is $\overline{v}_x = \dfrac{1}{k}\sqrt{\lambda g\sin\theta}\,\ln y + c$.
2. Suppose every particle settles vertically at the same speed $v_g$ relative to the liquid, and that the particles have the same mixing length as the liquid's eddies. Prove that, away from the bed, the particle number concentration $n$ obeys

$$
\frac{n}{n_0} = \left[\frac{y_0(\lambda - y)}{y(\lambda - y_0)}\right]^{\beta}, \qquad \beta = \frac{v_g}{k\sqrt{\lambda g\sin\theta}},
$$

where $n_0$ is the concentration at height $y_0$.
3. With $y_0 = \lambda/2$, plot $n/n_0$ against $y/\lambda$ for $\beta = 0.1$ and $\beta = 1$, and comment.

Give $n/n_0$ at $y/\lambda = 0.25$ for both values of $\beta$.`,
        hint: md`The free surface carries no shear, so a force balance gives $\tau(y) = \rho g\sin\theta\,(\lambda - y)$. Set this equal to $\rho\ell^2(d\overline{v}_x/dy)^2$. For the particles, steady state means the upward eddy-diffusion flux $-\nu_T\,dn/dy$ exactly balances the downward settling flux $v_g n$, with $\nu_T = \ell^2\,|d\overline{v}_x/dy|$.`,
        answer: md`$d\overline{v}_x/dy = \sqrt{\lambda g\sin\theta}/(ky)$, which integrates to the log law. Particles: $\dfrac{dn}{n} = -\beta\left(\dfrac{1}{y} + \dfrac{1}{\lambda - y}\right)dy$ gives the stated power law. With $y_0 = \lambda/2$, $n/n_0 = [(1-\eta)/\eta]^{\beta}$, where $\eta = y/\lambda$. At $\eta = 0.25$: $n/n_0 = 1.116$ for $\beta = 0.1$ and $3.00$ for $\beta = 1$.`,
        solution: md`**1. Shear stress in the layer.** Take a slab of liquid between height $y$ and the free surface $y = \lambda$, per unit area of bed. The free surface carries no shear. In steady uniform flow, the downslope weight component of the slab is balanced by the shear on its lower face:

$$
\tau(y) = \rho g\sin\theta\,(\lambda - y)
$$

**2. Mixing-length stress.** Away from the bed the turbulent stress dominates (Eq. 9.28 form):

$$
\tau = \rho\,\ell^2\left(\frac{d\overline{v}_x}{dy}\right)^2, \qquad \ell^2 = k^2y^2\left(1 - \frac{y}{\lambda}\right) = \frac{k^2y^2(\lambda - y)}{\lambda}
$$

**3. Equate.** The factor $(\lambda - y)$ cancels. This is why the chosen $\ell$ makes the problem simple:

$$
\rho g\sin\theta\,(\lambda - y) = \rho\,\frac{k^2y^2(\lambda - y)}{\lambda}\left(\frac{d\overline{v}_x}{dy}\right)^2
\;\Rightarrow\;
\frac{d\overline{v}_x}{dy} = \frac{\sqrt{\lambda g\sin\theta}}{k\,y}
$$

Integrating gives $\overline{v}_x = \dfrac{1}{k}\sqrt{\lambda g\sin\theta}\,\ln y + c$. Compare Eq. (9.37): $\sqrt{\lambda g\sin\theta}$ is just $\sqrt{\tau_w/\rho}$, because the bed stress is $\tau_w = \rho g\lambda\sin\theta$.

**4. Eddy diffusivity.** Table 9.1 takes the eddy diffusivity equal to $\nu_T$, so

$$
\nu_T = \ell^2\left|\frac{d\overline{v}_x}{dy}\right| = \frac{k^2y^2(\lambda - y)}{\lambda}\cdot\frac{\sqrt{\lambda g\sin\theta}}{ky} = \frac{k\sqrt{\lambda g\sin\theta}}{\lambda}\,y(\lambda - y)
$$

**5. Particle balance.** In steady state there is no net vertical particle flux. Settling carries $v_g n$ downward and turbulent diffusion carries $-\nu_T\,dn/dy$ upward:

$$
v_g n + \nu_T\frac{dn}{dy} = 0
\;\Rightarrow\;
\frac{dn}{n} = -\frac{v_g\lambda}{k\sqrt{\lambda g\sin\theta}}\,\frac{dy}{y(\lambda - y)} = -\beta\left(\frac{1}{y} + \frac{1}{\lambda - y}\right)dy
$$

(*Assumption:* $y$ is treated as the vertical direction, i.e. the $\cos\theta$ component of the vertical settling velocity normal to the bed is taken as $\approx 1$. This is consistent with the $\beta$ given.)

**6. Integrate from $y_0$ to $y$.**

$$
\ln\frac{n}{n_0} = -\beta\left[\ln\frac{y}{y_0} - \ln\frac{\lambda - y}{\lambda - y_0}\right]
\;\Rightarrow\;
\frac{n}{n_0} = \left[\frac{y_0(\lambda - y)}{y(\lambda - y_0)}\right]^{\beta}
$$

The result fails right at the bed. There the viscous sublayer, molecular diffusion and the bed itself (the mixing-length model gives $\nu_T \to 0$ and $n \to \infty$) are not represented.

**7. Plot data** with $y_0 = \lambda/2$, so that $n/n_0 = [(1-\eta)/\eta]^{\beta}$ with $\eta = y/\lambda$:

| $y/\lambda$ | 0.05 | 0.10 | 0.25 | 0.50 | 0.75 | 0.90 | 0.95 |
|---|---|---|---|---|---|---|---|
| $\beta = 0.1$ | 1.342 | 1.246 | 1.116 | 1 | 0.896 | 0.803 | 0.745 |
| $\beta = 1$ | 19.0 | 9.00 | 3.00 | 1 | 0.333 | 0.111 | 0.053 |

**8. Comment.**
- $\beta$ is the ratio of settling speed to the turbulent velocity scale $\sqrt{\tau_w/\rho}$.
- For $\beta = 0.1$ (fine particles or vigorous turbulence) the suspension is almost uniform.
- For $\beta = 1$ the particles crowd toward the bed. The concentration falls to zero at the free surface because $\ell$, and hence $\nu_T$, vanishes there. Nothing can lift particles through a layer with no eddy mixing.
- Both curves pass through 1 at $\eta = 0.5$, and the profile is symmetric in the sense $n(\eta)\,n(1-\eta) = n_0^2$.`,
        check: [
          { label: md`$n/n_0$ at $y/\lambda = 0.25$, $\beta = 0.1$`, value: 1.116, tol: 0.01 },
          { label: md`$n/n_0$ at $y/\lambda = 0.25$, $\beta = 1$`, value: 3.0, tol: 0.01 },
        ],
      },
      {
        id: 'w9-4',
        concept: 'eddy-viscosity',
        difficulty: 2,
        src: W('533', '9.4'),
        q: md`**A novel turbulent velocity profile.** For turbulent flow in a pipe of diameter $D = 2a$, someone proposes that the eddy kinematic viscosity at each point is $\nu_T = c\,D\,\overline{v}_z$, where $\overline{v}_z$ is the local time-averaged velocity and $c$ is a constant.

(a) What are the dimensions of $c$?
(b) Give a brief physical rationale for the model.
(c) Write a realistic expression for the turbulent shear stress $\tau^t_{rz}$ at radius $r$ in terms of the wall stress $\tau_w$.
(d) Derive $\overline{v}_z(r)$ in terms of $r$, $c$, $a$, $\rho$, $\tau_w$ and the centerline velocity $\overline{v}_{zc}$.
(e) Assume the profile holds right up to the wall and find $\overline{v}_z$ in terms of $r$, $a$ and $\overline{v}_{zc}$ only.
(f) Evaluate $\overline{v}_z/\overline{v}_{zc}$ at $r/a = 0, 0.25, 0.5, 0.75, 1$ and comment on how realistic the profile is.`,
        hint: md`$\tau^t_{rz} = \rho\nu_T\,d\overline{v}_z/dr$, and the momentum balance gives $\tau^t_{rz} = (r/2)(dp/dz) = -\tau_w r/a$. Then $\overline{v}_z\,d\overline{v}_z/dr$ is a perfect derivative.`,
        answer: md`(a) $c$ is dimensionless. (c) $\tau^t_{rz} = -\tau_w r/a$. (d) $\overline{v}_z^2 = \overline{v}_{zc}^2 - \dfrac{\tau_w r^2}{2\rho c a^2}$. (e) $\overline{v}_z = \overline{v}_{zc}\sqrt{1 - r^2/a^2}$ (with $\tau_w = 2\rho c\,\overline{v}_{zc}^2$). (f) $1,\ 0.968,\ 0.866,\ 0.661,\ 0$. The profile is an ellipse: blunter than laminar flow, but not nearly as flat as a real turbulent profile.`,
        solution: md`**(a) Dimensions.** $[\nu_T] = \dimL^2\dimT^{-1}$ and $[D\overline{v}_z] = \dimL\cdot\dimL\dimT^{-1} = \dimL^2\dimT^{-1}$, so $c$ is **dimensionless**.

**(b) Rationale.** An eddy viscosity is roughly (eddy size) × (eddy velocity). The largest eddies scale with the space available (the diameter $D$), and the intensity of the fluctuations is taken to scale with the local mean velocity. Wilkes makes the same kind of argument for jets, $\nu_T = c\,b\,\overline{v}_{xc}$ (Eq. 9.116).

**(c) Stress.** Away from the thin sublayer the total stress is essentially turbulent. A momentum balance on a cylinder of radius $r$ (Eq. 9.27) gives

$$
\tau^t_{rz} = \frac{r}{2}\frac{dp}{dz} = -\tau_w\frac{r}{a}
$$

The stress is linear in $r$: zero on the axis and $\tau_w$ in magnitude at the wall. The minus sign arises because $d\overline{v}_z/dr < 0$.

**(d) Profile.** Substitute the model:

$$
\rho\,(cD\overline{v}_z)\frac{d\overline{v}_z}{dr} = -\tau_w\frac{r}{a}
\;\Rightarrow\;
\frac{d}{dr}\left(\frac{\overline{v}_z^2}{2}\right) = -\frac{\tau_w r}{\rho c D a} = -\frac{\tau_w r}{2\rho c a^2}
$$

Integrate from the axis, where $\overline{v}_z = \overline{v}_{zc}$:

$$
\overline{v}_z^2 = \overline{v}_{zc}^2 - \frac{\tau_w r^2}{2\rho c a^2}
$$

**(e) No slip at $r = a$.** Setting $\overline{v}_z = 0$ at $r = a$ gives $\tau_w = 2\rho c\,\overline{v}_{zc}^2$. Then

$$
\overline{v}_z = \overline{v}_{zc}\sqrt{1 - \frac{r^2}{a^2}}
$$

**(f) Numbers.**

| $r/a$ | 0 | 0.25 | 0.5 | 0.75 | 1 |
|---|---|---|---|---|---|
| this model | 1 | 0.968 | 0.866 | 0.661 | 0 |
| laminar $1 - (r/a)^2$ | 1 | 0.938 | 0.75 | 0.438 | 0 |
| 1/7 law $(1 - r/a)^{1/7}$ | 1 | 0.960 | 0.906 | 0.820 | 0 |

**Comment.**
- The profile is elliptical. It is blunter than the laminar parabola, so it captures something of turbulence.
- Toward the wall it is far too rounded: at $r/a = 0.75$ it gives 0.66, whereas real turbulent profiles are still above 0.8 there.
- The model also makes $\nu_T$ largest on the axis and zero only at the wall. Measured $\nu_T$ (Fig. 9.8) peaks about halfway out and *falls* toward the center.
- So the model is not realistic in detail. A realistic profile needs a near-wall region of steep gradients, which this model cannot produce.`,
        check: [
          { label: md`$\overline{v}_z/\overline{v}_{zc}$ at $r/a = 0.5$`, value: 0.866, tol: 0.005 },
          { label: md`$\overline{v}_z/\overline{v}_{zc}$ at $r/a = 0.75$`, value: 0.6614, tol: 0.005 },
        ],
      },
      {
        id: 'w9-6',
        concept: 'determination',
        difficulty: 2,
        src: W('534–535', '9.6'),
        q: md`**Turbulent mixing of reactants.** Gas A flows turbulently along a smooth pipe of radius $a$. A small flow of a reacting gas B is injected axially through a ring of jets concentric with the pipe axis. At what radius $R$ (as a fraction $R/a$) should the ring be placed for the most rapid initial mixing of A and B? Assume:

(a) mixing is fastest where the eddy diffusivity, taken equal to the eddy kinematic viscosity $\nu_T$, is a maximum;
(b) the velocity profile is the one-seventh power law $\overline{v}_z/\overline{v}_{zc} = (y/a)^{1/7}$, with $y$ the distance from the wall.`,
        hint: md`Obtain $\nu_T$ from $\tau^t = \rho\nu_T\,d\overline{v}_z/dy$, with the stress varying linearly from $\tau_w$ at the wall to zero at the axis. Then maximise the resulting function of $\eta = y/a$.`,
        answer: md`$\nu_T \propto \eta^{6/7}(1 - \eta)$, which is a maximum at $\eta = y/a = 6/13$. The ring should be at $R/a = 7/13 = 0.538$.`,
        solution: md`**1. Shear stress.** The momentum balance (Eq. 9.27) gives a stress linear in $r$. In terms of the distance from the wall, $y = a - r$, its magnitude is

$$
\tau = \tau_w\frac{r}{a} = \tau_w\left(1 - \frac{y}{a}\right)
$$

Away from the wall the stress is carried by the eddies.

**2. Velocity gradient of the 1/7 law.**

$$
\frac{d\overline{v}_z}{dy} = \frac{\overline{v}_{zc}}{7a}\left(\frac{y}{a}\right)^{-6/7}
$$

**3. Eddy viscosity** (the method of §9.4, "determination" from measured stress and gradient). With $\eta = y/a$:

$$
\nu_T = \frac{\tau/\rho}{d\overline{v}_z/dy} = \frac{7a\,\tau_w}{\rho\,\overline{v}_{zc}}\,\eta^{6/7}(1 - \eta)
$$

**4. Maximise** $g(\eta) = \eta^{6/7}(1 - \eta)$:

$$
g'(\eta) = \tfrac{6}{7}\eta^{-1/7}(1 - \eta) - \eta^{6/7} = \eta^{-1/7}\left[\tfrac{6}{7}(1 - \eta) - \eta\right] = 0
\;\Rightarrow\;
\eta = \frac{6}{13} = 0.4615
$$

$g'' < 0$ there, and $g = 0$ at both $\eta = 0$ and $\eta = 1$, so this is the maximum.

**5. Ring radius.**

$$
\frac{R}{a} = 1 - \frac{y}{a} = \frac{7}{13} = 0.538
$$

**Comment.** This agrees well with Nikuradse's measurements (Fig. 9.8 and Eq. 9.30, $\nu_T \propto \eta(1 - \eta)$), which peak about halfway between wall and axis.

The 1/7 law has zero slope only at the center in the limit, so the model gives $\nu_T = 0$ on the axis. Measured $\nu_T$ does *not* fall to zero there. Neither does the model hold inside the viscous sublayer. Neither defect affects the location of the maximum much.`,
        check: [{ label: md`$R/a$`, value: 0.538, tol: 0.01 }],
      },
      {
        id: 'w9-10',
        concept: 'prandtl-mixing-length',
        difficulty: 2,
        src: W('536', '9.10'),
        q: md`**An alternative to the Prandtl hypothesis.** Sleicher proposed that near the wall the eddy kinematic viscosity follows $\nu_T = \nu\,(c\,y^+)^2$.

1. Include both the turbulent and the viscous contributions to the shear stress, which near the wall is still essentially $\tau_w$. Prove that the velocity profile is $v_z^+ = \dfrac{1}{c}\tan^{-1}(c\,y^+)$.
2. With $c \doteq 0.088$, show that this profile merges smoothly, in both magnitude and slope, with $v_z^+ = 2.5\ln y^+ + 5.5$. Find the $y^+$ at which the transition occurs.`,
        hint: md`Write $\tau_w = \rho(\nu + \nu_T)\,d\overline{v}_z/dy$ and convert to wall variables: $\tau_w/\rho = (\overline{v}_z^*)^2$, $dy = (\nu/\overline{v}_z^*)\,dy^+$. For the merge, set the slopes $1/(1 + c^2y^{+2})$ and $2.5/y^+$ equal, then compare the values.`,
        answer: md`$dv^+/dy^+ = 1/(1 + c^2y^{+2})$, which integrates to $v^+ = c^{-1}\tan^{-1}(cy^+)$. Equal slopes require $2.5c^2y^{+2} - y^+ + 2.5 = 0$, giving $y^+ \approx 49.0$. There both laws give $v^+ \approx 15.2$–$15.3$ and slope $0.051$, so the transition is at $y^+ \approx 49$.`,
        solution: md`**1. Total stress near the wall.**

$$
\tau_w = \rho(\nu + \nu_T)\frac{d\overline{v}_z}{dy} = \rho\nu\left[1 + (cy^+)^2\right]\frac{d\overline{v}_z}{dy}
$$

**2. Wall variables.** $\overline{v}_z = \overline{v}_z^*\,v_z^+$ and $y = (\nu/\overline{v}_z^*)\,y^+$, so $d\overline{v}_z/dy = [(\overline{v}_z^*)^2/\nu]\,dv_z^+/dy^+$. Dividing by $\tau_w = \rho(\overline{v}_z^*)^2$:

$$
1 = \left(1 + c^2y^{+2}\right)\frac{dv_z^+}{dy^+}
$$

**3. Integrate** with $v_z^+ = 0$ at $y^+ = 0$:

$$
v_z^+ = \int_0^{y^+}\frac{dy'}{1 + c^2y'^2} = \frac{1}{c}\tan^{-1}(cy^+)
$$

Check the limits:
- For small $y^+$, $\tan^{-1}x \approx x$, so $v_z^+ \approx y^+$, which is the laminar sublayer (9.43).
- For large $y^+$ the profile saturates at $\pi/(2c) = 17.85$, so it cannot describe the core.

**4. Slope matching.** The slope of the log law is $2.5/y^+$:

$$
\frac{1}{1 + c^2y^{+2}} = \frac{2.5}{y^+}
\;\Rightarrow\;
2.5c^2y^{+2} - y^+ + 2.5 = 0
$$

With $c = 0.088$, $2.5c^2 = 0.01936$:

$$
y^+ = \frac{1 \pm\sqrt{1 - 4(0.01936)(2.5)}}{2(0.01936)} = \frac{1 \pm 0.8980}{0.03872} = 2.63\ \text{or}\ 49.0
$$

**5. Value matching.**

| $y^+$ | Sleicher $\tfrac{1}{c}\tan^{-1}(cy^+)$ | log law $2.5\ln y^+ + 5.5$ |
|---|---|---|
| 2.63 | 2.59 | 7.92 (no match) |
| 49.0 | 15.26 | 15.23 (match) |

At $y^+ \approx 49$ the two curves agree to 0.2 % in value and exactly in slope (both 0.0510), so they merge smoothly.

Requiring *exact* agreement in both value and slope fixes $c = 0.0882$ and $y^+ = 48.8$, which confirms that Sleicher's $c \doteq 0.088$ is the "tangent" value.

**Transition: $y^+ \approx 49$.** Sleicher's profile is used for $y^+ < 49$ (sublayer and buffer region) and the log law beyond.`,
        check: [{ label: md`transition $y^+$`, value: 49, tol: 0.03 }],
      },
    ],
    quiz: [
      {
        id: 'w9a-ml-q1',
        concept: 'determination',
        difficulty: 2,
        q: md`With the 1/7 power-law profile and a linear shear-stress distribution, where is $\nu_T$ largest in a pipe of radius $a$?`,
        options: [md`At $y/a = 6/13$, a little nearer the wall than the axis`, md`On the axis, where the velocity is largest`, md`At the wall, where the stress is largest`, md`Uniform across the pipe`],
        answer: 0,
        explain: md`$\nu_T \propto \eta^{6/7}(1 - \eta)$, with $\eta = y/a$, peaks at $\eta = 6/13$. On the axis the stress, and hence $\nu_T$ in this model, is zero. At the wall the eddies are suppressed (eddy size → 0), even though the stress is largest there.`,
        src: W('534–535', '9.6'),
      },
      {
        id: 'w9a-ml-q2',
        concept: 'prandtl-mixing-length',
        difficulty: 2,
        q: md`Sleicher's near-wall model $\nu_T = \nu(cy^+)^2$ gives $v_z^+ = c^{-1}\tan^{-1}(cy^+)$. What happens for very large $y^+$?`,
        options: [md`$v_z^+$ levels off at $\pi/(2c) \approx 17.9$, so the log law must take over`, md`$v_z^+$ grows like $2.5\ln y^+$ indefinitely`, md`$v_z^+$ grows linearly, as in the sublayer`, md`$v_z^+$ returns to zero`],
        answer: 0,
        explain: md`$\tan^{-1}$ saturates at $\pi/2$, so the profile is useful only up to the matching point ($y^+ \approx 49$). Linear growth is its *small*-$y^+$ limit, not its large-$y^+$ behaviour.`,
        src: W('536', '9.10'),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Velocity profiles: 9.2, 9.5, 9.8, 9.12, 9.14                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'wilkes9a-velocity-profiles',
    topic: 'velocity-profiles',
    title: 'Wilkes Ch. 9 — Problems 9.2, 9.5, 9.8, 9.12, 9.14: log law, laminar sublayer and the universal profile',
    src: { doc: 'wilkes', pages: '532–538', note: 'Problems 9.2, 9.5, 9.8, 9.12, 9.14' },
    intro: md`These problems cover why the profile must be logarithmic, how a laminar sublayer is matched to a turbulent core, and what the log law predicts when it is applied across a whole pipe.`,
    problems: [
      {
        id: 'w9-2',
        concept: 'log-law',
        difficulty: 3,
        src: W('532–533', '9.2'),
        q: md`**Logarithmic velocity profile from dimensional analysis.** Consider fully developed turbulent flow in a smooth pipe of radius $a$.

(a) Near the wall, suppose $\overline{v}_z = f(\rho, \mu, \tau_w, y)$, independent of $a$. Show that $\overline{v}_z/\overline{v}_z^* = f_1(y/y^*)$, with $\overline{v}_z^* = \sqrt{\tau_w/\rho}$ and $y^* = \nu/\sqrt{\tau_w/\rho}$.
(b) Near the center, suppose the velocity deficit is governed by turbulence alone: $\overline{v}_z - \overline{v}_{zc} = f(\rho, a, \tau_w, y)$, independent of $\mu$. Find its dimensionless form.
(c) In general, $\overline{v}_z = f(\rho, \mu, \tau_w, y, a)$. Find the general dimensionless form of $\overline{v}_z/\overline{v}_z^*$.

Hence show that if a region exists where (a) and (b) hold simultaneously, the profile there, and in the turbulent core, must be logarithmic.`,
        hint: md`Count variables and dimensions ($\dimM$, $\dimL$, $\dimT$) for the pi theorem. For the overlap, multiply both forms by $y$ after differentiating with respect to $y$. One side then depends only on $y^+$ and the other only on $y/a$.`,
        answer: md`(a) $\overline{v}_z/\overline{v}_z^* = f_1(y^+)$. (b) $(\overline{v}_z - \overline{v}_{zc})/\overline{v}_z^* = f_2(y/a)$. (c) $\overline{v}_z/\overline{v}_z^* = f_3(y^+, a^+)$. In the overlap, $y^+f_1'(y^+) = \eta f_2'(\eta) = $ const $= 1/k$, so $f_1 = \tfrac{1}{k}\ln y^+ + A$ and $f_2 = \tfrac{1}{k}\ln(y/a) + B$. Both are logarithmic.`,
        solution: md`**(a) Inner law.** There are 5 variables ($\overline{v}_z, \rho, \mu, \tau_w, y$) and 3 dimensions, so there are $5 - 3 = 2$ groups. Take $\rho$, $\tau_w$ and $\mu$ as repeating variables:
- velocity scale: $\overline{v}_z^* = \sqrt{\tau_w/\rho}$ (dimensions $\dimL\dimT^{-1}$);
- length scale: $y^* = \mu/(\rho\overline{v}_z^*) = \nu/\overline{v}_z^*$.

Then

$$
\frac{\overline{v}_z}{\overline{v}_z^*} = f_1\!\left(\frac{y}{y^*}\right) = f_1(y^+)
$$

**(b) Defect law.** Again 5 variables ($\overline{v}_z - \overline{v}_{zc}, \rho, a, \tau_w, y$) and 2 groups. With $\mu$ absent, the only velocity scale is $\overline{v}_z^*$ and the natural length is $a$:

$$
\frac{\overline{v}_z - \overline{v}_{zc}}{\overline{v}_z^*} = f_2\!\left(\frac{y}{a}\right)
$$

**(c) General.** 6 variables, so 3 groups:

$$
\frac{\overline{v}_z}{\overline{v}_z^*} = f_3\!\left(y^+,\ a^+\right), \qquad a^+ = \frac{a\overline{v}_z^*}{\nu}
$$

($y/a = y^+/a^+$ could replace either group.)

**Overlap argument.** Suppose both (a) and (b) hold in some buffer region:

$$
f_1(y^+) = \frac{\overline{v}_{zc}}{\overline{v}_z^*} + f_2(\eta), \qquad y^+ = \eta\,a^+,\quad \eta = \frac{y}{a}
$$

Differentiate with respect to $y$ at fixed $a$, $\tau_w$, $\nu$ and multiply by $y$:

$$
y^+\,\frac{df_1}{dy^+} = \eta\,\frac{df_2}{d\eta}
$$

The left side is a function of $y^+$ only and the right side of $\eta$ only. Since $a^+$ can be varied independently (different pipes or flow rates), the same $\eta$ corresponds to many different $y^+$. The two sides can be equal for all of them only if both are the **same constant**, call it $1/k$. Integrating:

$$
f_1 = \frac{1}{k}\ln y^+ + A, \qquad f_2 = \frac{1}{k}\ln\frac{y}{a} + B
$$

The inner law is therefore logarithmic in the overlap. The defect law is logarithmic in $y/a$, and it applies throughout the turbulent core. This is the universal form $v_z^+ = A + B\ln y^+$ (Eq. 9.41) with $B = 1/k \approx 2.5$, obtained here without any mixing-length hypothesis.`,
      },
      {
        id: 'w9-5',
        concept: 'log-law',
        difficulty: 3,
        src: W('533–534', '9.5'),
        q: md`**Turbulent condensate film.** A condensate film of thickness $\lambda$ flows down the outside of a vertical tube, treated as a vertical plate. Model it, *without* the universal profile, as two layers:
- a very thin laminar sublayer (LSL) of thickness $\delta$, in which the shear stress is essentially the wall value $\tau_w$;
- a much thicker turbulent mainstream (TMS) with $\overline{v}_x = \dfrac{1}{k}\sqrt{\tau_w/\rho}\,\ln y + c$.

$y$ is the distance from the plate. Density and viscosity are constant. Both the velocity and its gradient are continuous at $y = \delta$.

(a) Why may we take $\sqrt{\tau_w/\rho} = \sqrt{\lambda g}$?
(b) For iso-octane at 99.3 °C ($\rho = 0.692$ g/cm³, $\mu = 0.266$ cP $= 0.00266$ g/(cm s), $g = 981$ cm/s², $\lambda = 0.12$ cm, $k = 0.40$), show that $\tau_w \doteq 81.5$ dyn/cm². Then find (i) $\delta$ in cm, (ii) the velocity at the LSL/TMS junction, and (iii) the velocity at the free surface.`,
        hint: md`(a) Do an overall force balance on the film. (b) In the LSL $\overline{v}_x = \tau_w y/\mu$. Equating the slopes $\tau_w/\mu$ and $\sqrt{\tau_w/\rho}/(k\delta)$ at $y = \delta$ gives $\delta$ directly. Equating the velocities then fixes $c$.`,
        answer: md`$\tau_w = \rho g\lambda = 81.5$ dyn/cm² and $\overline{v}_x^* = 10.85$ cm/s. (i) $\delta = \nu/(k\overline{v}_x^*) = 8.86\times10^{-4}$ cm. (ii) $\overline{v}_{x\delta} = \overline{v}_x^*/k = 27.1$ cm/s. (iii) $\overline{v}_{x,\text{surface}} = (\overline{v}_x^*/k)[1 + \ln(\lambda/\delta)] = 160$ cm/s.`,
        solution: md`**(a) Wall stress.** Take the whole film, per unit wall area. Its weight $\rho g\lambda$ acts downward. The vapor exerts negligible shear on the free surface, and in fully developed flow there is no net momentum change. The only upward force is the wall shear, so

$$
\tau_w = \rho g\lambda \;\Rightarrow\; \sqrt{\tau_w/\rho} = \sqrt{\lambda g}
$$

**(b) Numbers.**

$$
\tau_w = 0.692 \times 981 \times 0.12 = 81.46\ \text{dyn/cm}^2 \doteq 81.5\ \text{dyn/cm}^2
$$

The friction velocity is $\overline{v}_x^* = \sqrt{981 \times 0.12} = 10.85$ cm/s, and $\nu = \mu/\rho = 0.00266/0.692 = 3.844\times10^{-3}$ cm²/s.

**Profiles.**
- LSL ($\tau = \tau_w = \mu\,d\overline{v}_x/dy$): $\overline{v}_x = \tau_w y/\mu$, with slope $\tau_w/\mu = (\overline{v}_x^*)^2/\nu$.
- TMS: $\overline{v}_x = (\overline{v}_x^*/k)\ln y + c$, with slope $\overline{v}_x^*/(ky)$.

**(i) Slope continuity at $y = \delta$:**

$$
\frac{(\overline{v}_x^*)^2}{\nu} = \frac{\overline{v}_x^*}{k\delta}
\;\Rightarrow\;
\delta = \frac{\nu}{k\,\overline{v}_x^*} = \frac{3.844\times10^{-3}}{0.40 \times 10.85} = 8.86\times10^{-4}\ \text{cm}
$$

That is, $\delta^+ = 1/k = 2.5$: a very thin sublayer, about 0.7 % of the film.

**(ii) Junction velocity** from the LSL line:

$$
\overline{v}_{x\delta} = \frac{(\overline{v}_x^*)^2\delta}{\nu} = \frac{\overline{v}_x^*}{k} = \frac{10.85}{0.40} = 27.1\ \text{cm/s}
$$

**(iii) Velocity continuity** fixes $c$: $\overline{v}_x^*/k = (\overline{v}_x^*/k)\ln\delta + c$, so $c = (\overline{v}_x^*/k)(1 - \ln\delta)$ ($= 218$ cm/s with $y$ in cm). At the free surface $y = \lambda$:

$$
\overline{v}_{x\lambda} = \frac{\overline{v}_x^*}{k}\left[1 + \ln\frac{\lambda}{\delta}\right] = 27.12\left[1 + \ln\frac{0.12}{8.857\times10^{-4}}\right] = 27.12\,(1 + 4.909) = 160\ \text{cm/s}
$$

**Comment.** Matching both value *and* slope (instead of only the value, as in §9.8) gives a much thinner sublayer, $\delta^+ = 2.5$ rather than 11.6. The velocity still rises to about a sixth of the surface value across a layer only 9 µm thick.`,
        check: [
          { label: md`$\tau_w$`, value: 81.46, tol: 0.01, units: md`\mathrm{dyn/cm^2}` },
          { label: md`$\delta$`, value: 8.86e-4, tol: 0.02, units: md`\mathrm{cm}` },
          { label: md`junction velocity`, value: 27.1, tol: 0.01, units: md`\mathrm{cm/s}` },
          { label: md`surface velocity`, value: 160, tol: 0.02, units: md`\mathrm{cm/s}` },
        ],
      },
      {
        id: 'w9-8',
        concept: 'sublayer',
        difficulty: 2,
        src: W('536', '9.8'),
        q: md`**Velocity at the outer edge of the laminar sublayer.** Start from the one-seventh power law $\overline{v}_z/\overline{v}_{zc} = (y/a)^{1/7}$ (Eq. 9.61) and the sublayer thickness $\delta/D = 61.7/\mathrm{Re}^{7/8}$ (Eq. 9.62). Prove Eq. (9.103):

$$
\frac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \frac{2.44}{\mathrm{Re}^{1/8}}
$$

Evaluate the ratio for Re $= 10^4$, $10^5$ and $10^6$, and comment.`,
        hint: md`You need $\overline{v}_{zm}/\overline{v}_{zc}$ for the 1/7 law: average $(y/a)^{1/7}$ over the circular cross-section. Then put $y = \delta$ and $\delta/a = 2\delta/D$.`,
        answer: md`$\overline{v}_{zm} = \tfrac{49}{60}\overline{v}_{zc}$, so $\overline{v}_{z\delta}/\overline{v}_{zm} = \tfrac{60}{49}(2 \times 61.7)^{1/7}\mathrm{Re}^{-1/8} = 2.436\,\mathrm{Re}^{-1/8}$. Values: $0.772$ ($10^4$), $0.579$ ($10^5$), $0.434$ ($10^6$).`,
        solution: md`**1. Mean velocity of the 1/7 law.** With $r = a - y$ and $\eta = y/a$:

$$
\frac{\overline{v}_{zm}}{\overline{v}_{zc}} = \frac{1}{\pi a^2}\int_0^a 2\pi r\left(\frac{y}{a}\right)^{1/7}dr = 2\int_0^1(1 - \eta)\,\eta^{1/7}\,d\eta = 2\left(\frac{7}{8} - \frac{7}{15}\right) = \frac{49}{60}
$$

This is the general result $2/[(m+1)(m+2)]$ with $m = 1/7$.

**2. Velocity at $y = \delta$.**

$$
\frac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \frac{\overline{v}_{zc}}{\overline{v}_{zm}}\left(\frac{\delta}{a}\right)^{1/7} = \frac{60}{49}\left(\frac{2\delta}{D}\right)^{1/7}
$$

**3. Insert Eq. (9.62).**

$$
\frac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \frac{60}{49}\left(\frac{123.4}{\mathrm{Re}^{7/8}}\right)^{1/7} = \frac{60}{49}(123.4)^{1/7}\,\mathrm{Re}^{-1/8} = 1.2245 \times 1.990\,\mathrm{Re}^{-1/8} = \frac{2.44}{\mathrm{Re}^{1/8}}
$$

**4. Values.**

| Re | $10^4$ | $10^5$ | $10^6$ |
|---|---|---|---|
| $\mathrm{Re}^{1/8}$ | 3.162 | 4.217 | 5.623 |
| $\overline{v}_{z\delta}/\overline{v}_{zm}$ | 0.772 | 0.579 | 0.434 |

**Comment.**
- Although the sublayer is extremely thin (see Problem 9.12), the velocity at its edge is a large fraction of the mean: 40–80 %.
- The ratio falls only slowly, as $\mathrm{Re}^{-1/8}$, because the profile becomes flatter and the sublayer thinner as Re rises.
- This is exactly the factor that corrects the Reynolds analogy in the Prandtl–Taylor analogy (9.102). The larger $\overline{v}_{z\delta}/\overline{v}_{zm}$, the more the sublayer's molecular transport matters.
- The 1/7 law and the Blasius law behind (9.62) are best below about $10^5$, so the $10^6$ value is an extrapolation.`,
        check: [
          { label: md`Re $= 10^4$`, value: 0.772, tol: 0.01 },
          { label: md`Re $= 10^5$`, value: 0.579, tol: 0.01 },
          { label: md`Re $= 10^6$`, value: 0.434, tol: 0.01 },
        ],
      },
      {
        id: 'w9-12',
        concept: 'sublayer',
        difficulty: 2,
        src: W('537', '9.12'),
        q: md`**Thickness of the laminar sublayer.** Section 9.8 showed that a logarithmic mainstream profile gives $\delta/D = 58.3/\mathrm{Re}^{7/8}$. Carry out a similar derivation when the turbulent region follows the one-seventh power law $\overline{v}_z/\overline{v}_{zc} = (y/a)^{1/7}$. Evaluate $\delta/D$ for Re $= 10^4$, $10^5$ and $10^6$, and comment.`,
        hint: md`Sublayer: $\overline{v}_z = \tau_w y/\mu$. Equate it to the 1/7 law at $y = \delta$. Use $\overline{v}_{zc} = \tfrac{60}{49}\overline{v}_{zm}$ and the Blasius law $f_F = 0.0790\,\mathrm{Re}^{-1/4}$ with $\tau_w = \tfrac12 f_F\rho\overline{v}_{zm}^2$.`,
        answer: md`$\dfrac{\delta}{D} = \left[\dfrac{(60/49)\,2^{1/7}}{0.0395}\right]^{7/6}\mathrm{Re}^{-7/8} = \dfrac{61.7}{\mathrm{Re}^{7/8}}$. Values: $1.95\times10^{-2}$ ($10^4$), $2.60\times10^{-3}$ ($10^5$), $3.47\times10^{-4}$ ($10^6$), about 6 % above the log-profile result.`,
        solution: md`**1. Match the velocities at $y = \delta$.** The linear sublayer meets the power law:

$$
\frac{\tau_w\delta}{\mu} = \overline{v}_{zc}\left(\frac{\delta}{a}\right)^{1/7}
\;\Rightarrow\;
\delta^{6/7} = \frac{\mu\,\overline{v}_{zc}}{\tau_w\,a^{1/7}}
$$

**2. Express everything in $\overline{v}_{zm}$ and Re.** Use $\overline{v}_{zc} = \tfrac{60}{49}\overline{v}_{zm}$ (mean of the 1/7 law) and $\tau_w = \tfrac12 f_F\rho\overline{v}_{zm}^2 = 0.0395\,\mathrm{Re}^{-1/4}\rho\overline{v}_{zm}^2$. Dividing by $D^{6/7}$, with $a = D/2$:

$$
\left(\frac{\delta}{D}\right)^{6/7} = \frac{60}{49}\,\frac{\mu\,\overline{v}_{zm}}{0.0395\,\mathrm{Re}^{-1/4}\rho\overline{v}_{zm}^2\,D}\left(\frac{D}{a}\right)^{1/7} = \frac{(60/49)\,2^{1/7}}{0.0395}\,\mathrm{Re}^{-3/4}
$$

**3. Raise to the power 7/6.**

$$
\frac{\delta}{D} = \left[\frac{1.2245 \times 1.1041}{0.0395}\right]^{7/6}\mathrm{Re}^{-7/8} = (34.23)^{7/6}\,\mathrm{Re}^{-7/8} = \frac{61.7}{\mathrm{Re}^{7/8}}
$$

This is Eq. (9.62), verified.

**4. Values.**

| Re | $10^4$ | $10^5$ | $10^6$ |
|---|---|---|---|
| 1/7 law: $61.7/\mathrm{Re}^{7/8}$ | $1.95\times10^{-2}$ | $2.60\times10^{-3}$ | $3.47\times10^{-4}$ |
| log law: $58.3/\mathrm{Re}^{7/8}$ | $1.84\times10^{-2}$ | $2.46\times10^{-3}$ | $3.28\times10^{-4}$ |

**Comment.**
- The two mainstream profiles give almost the same thickness: 61.7 against 58.3, a difference of 6 %. The sublayer estimate is therefore insensitive to the core model.
- The sublayer is extremely thin: in a 5 cm pipe at Re $= 10^5$ it is about 0.13 mm.
- It shrinks almost in proportion to $1/\mathrm{Re}$ (exponent 7/8).
- The Blasius law used here is reliable only up to about Re $= 10^5$, so the $10^6$ figure is an extrapolation.`,
        check: [
          { label: md`$\delta/D$ at Re $= 10^4$`, value: 0.01951, tol: 0.01 },
          { label: md`$\delta/D$ at Re $= 10^5$`, value: 0.002602, tol: 0.01 },
          { label: md`$\delta/D$ at Re $= 10^6$`, value: 3.47e-4, tol: 0.01 },
        ],
      },
      {
        id: 'w9-14',
        concept: 'universal-profile',
        difficulty: 2,
        src: W('538', '9.14'),
        q: md`**Turbulent velocity profile.** A fluid flows turbulently through a smooth circular pipe with $v_z^+ = 5.5 + 2.5\ln y^+$, where $v_z^+ = \overline{v}_z/\sqrt{\tau_w/\rho}$ and $y^+ = y\sqrt{\tau_w/\rho}/\nu$. Assume this holds across the whole pipe.

(a) Find the ratio of the maximum velocity to the mean velocity at Re $= 10^5$.
(b) Where should a Pitot tube be placed to read the mean velocity directly?`,
        hint: md`The mean of the log law over the pipe is $v_{zm}^+ = 2.5\ln a^+ + 1.75$, and $\mathrm{Re} = 2a^+v_{zm}^+$. Solve for $a^+$ by iteration. The maximum is at $y = a$.`,
        answer: md`$a^+ = 2362$, $v_{zm}^+ = 21.17$, $v_{zc}^+ = 24.92$, so $\overline{v}_{max}/\overline{v}_{zm} = 1 + 3.75/v_{zm}^+ = 1.18$. The Pitot tube goes where $y/a = e^{-1.5} = 0.223$, i.e. $r/a = 0.777$, independent of Re.`,
        solution: md`**1. Mean velocity.** Integrating the log law over the cross-section (Eq. 9.49 with $A = 5.5$, $B = 2.5$):

$$
v_{zm}^+ = 2.5\ln a^+ + 5.5 - \tfrac32(2.5) = 2.5\ln a^+ + 1.75, \qquad a^+ = \frac{a\sqrt{\tau_w/\rho}}{\nu}
$$

**2. Link to Re.**

$$
\mathrm{Re} = \frac{\overline{v}_{zm}D}{\nu} = 2\,a^+v_{zm}^+
$$

Solve $2a^+(2.5\ln a^+ + 1.75) = 10^5$ by iteration:
- $a^+ = 2000$ gives Re $= 8.3\times10^4$;
- $a^+ = 2400$ gives Re $= 1.02\times10^5$;
- converged: $a^+ = 2362$, $v_{zm}^+ = 21.17$.

**3. Maximum velocity.** On the axis, $y^+ = a^+$:

$$
v_{zc}^+ = 5.5 + 2.5\ln 2362 = 24.92, \qquad \frac{\overline{v}_{max}}{\overline{v}_{zm}} = \frac{24.92}{21.17} = 1.18
$$

In general $\overline{v}_{max}/\overline{v}_{zm} = 1 + 3.75/v_{zm}^+ = 1 + 3.75\sqrt{f_F/2}$. The ratio is much flatter than the laminar value of 2.

**4. Pitot position.** Set $v_z^+ = v_{zm}^+$:

$$
5.5 + 2.5\ln y^+ = 2.5\ln a^+ + 1.75 \;\Rightarrow\; \ln\frac{y}{a} = -\frac{3.75}{2.5} = -1.5
$$

$$
\frac{y}{a} = e^{-1.5} = 0.223, \qquad \frac{r}{a} = 0.777
$$

The Pitot tube should sit 0.223 radius from the wall ($r = 0.777a$). The position is independent of Re as long as the log law holds.

**Caveat.** The log law has a nonzero slope at the axis (a cusp) and is wrong in the sublayer. Both regions carry little flow, so the estimates are good.`,
        check: [
          { label: md`$\overline{v}_{max}/\overline{v}_{zm}$`, value: 1.177, tol: 0.01 },
          { label: md`Pitot position $r/a$`, value: 0.777, tol: 0.01 },
        ],
      },
    ],
    quiz: [
      {
        id: 'w9a-vp-q1',
        concept: 'log-law',
        difficulty: 2,
        q: md`In the dimensional-analysis argument for the log law, why must $y^+\,df_1/dy^+$ equal a constant in the overlap region?`,
        options: [
          md`It equals $\eta\,df_2/d\eta$, which depends only on $y/a$, while it depends only on $y^+$; since $a^+$ varies independently, both must be constant`,
          md`Because the shear stress is constant near the wall`,
          md`Because the mixing length is proportional to $y$`,
          md`Because viscosity is negligible everywhere in the pipe`,
        ],
        answer: 0,
        explain: md`The point of Problem 9.2 is that the log law follows from overlap of the inner and outer scalings alone. The constant-stress and $\ell = ky$ assumptions belong to the *Prandtl* derivation, not to the dimensional one.`,
        src: W('532–533', '9.2'),
      },
      {
        id: 'w9a-vp-q2',
        concept: 'sublayer',
        difficulty: 1,
        q: md`At Re $= 10^5$ (1/7 law), the laminar sublayer is about $0.26\,\%$ of the diameter. Roughly what fraction of the mean velocity is reached at its outer edge?`,
        options: [md`About 58 %`, md`About 5 %`, md`About 0.3 %`, md`About 100 %`],
        answer: 0,
        explain: md`$\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/\mathrm{Re}^{1/8} = 0.58$. A tiny layer carries a large part of the velocity change. The wrong answer "0.3 %" assumes the velocity grows in proportion to distance from the wall all the way to the axis, which ignores the steep near-wall gradient.`,
        src: W('536', '9.8'),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Friction factor: 9.3, 9.7, 9.9                                     */
  /* ------------------------------------------------------------------ */
  {
    id: 'wilkes9a-friction-factor',
    topic: 'friction-factor',
    title: 'Wilkes Ch. 9 — Problems 9.3, 9.7, 9.9: friction laws, power-law profiles and smooth-pipe calculations',
    src: { doc: 'wilkes', pages: '533–536', note: 'Problems 9.3, 9.7, 9.9' },
    intro: md`These problems link the friction factor to the velocity profile: the Blasius/power-law pair, a scaling argument for pneumatic transport, and a full smooth-pipe calculation from a measured pressure gradient.`,
    problems: [
      {
        id: 'w9-3',
        concept: 'blasius-power-law',
        difficulty: 1,
        src: W('533', '9.3'),
        q: md`**Blasius and power-law relationship.** Section 9.10 states that, besides $m = 1/(2n - 1)$, a further relation links the coefficient $c$ in the power-law profile $\overline{v}_z/\overline{v}_z^* = c\,(y/y^*)^m$ to the coefficient $A$ in the friction law $f_F = A\,(a\overline{v}_{zm}/\nu)^{-1/n}$. What is it? Evaluate $c$ for the Blasius law $f_F = 0.0790\,\mathrm{Re}^{-1/4}$ and compare with the experimental value 8.74.`,
        hint: md`Equation (9.74) gives $\overline{v}_{zm}/\overline{v}_z^*$ from the friction law, and (9.76) gives it from the profile. Equate the coefficients as well as the exponents. Note that the Blasius law uses $2a$ where (9.72) uses $a$.`,
        answer: md`$\left(\dfrac{2}{A}\right)^{n/(2n-1)} = \dfrac{2c}{(m+1)(m+2)}$, i.e. $c = \dfrac{(m+1)(m+2)}{2}\left(\dfrac{2}{A}\right)^{n/(2n-1)}$. For Blasius, $A = 0.0790/2^{1/4} = 0.0664$ and $n = 4$, giving $c = \tfrac{60}{49}(30.1)^{4/7} = 8.57$. This is about 2 % below the measured 8.74.`,
        solution: md`**1. Two expressions for the same ratio.**

From the friction law, with $\tau_w = \tfrac12 f_F\rho\overline{v}_{zm}^2 = \rho(\overline{v}_z^*)^2$ (Eqs. 9.72–9.74):

$$
\frac{\overline{v}_{zm}}{\overline{v}_z^*} = \left(\frac{2}{A}\right)^{n/(2n-1)}\left(\frac{\overline{v}_z^*a}{\nu}\right)^{1/(2n-1)}
$$

From averaging the power-law profile over the pipe (Eq. 9.76):

$$
\frac{\overline{v}_{zm}}{\overline{v}_z^*} = \frac{2c}{(m+1)(m+2)}\left(\frac{\overline{v}_z^*a}{\nu}\right)^{m}
$$

**2. Equate.**
- The exponents give $m = 1/(2n - 1)$ (Eq. 9.77).
- The coefficients give the **required relation**:

$$
\frac{2c}{(m+1)(m+2)} = \left(\frac{2}{A}\right)^{n/(2n-1)}
\quad\Longleftrightarrow\quad
c = \frac{(m+1)(m+2)}{2}\left(\frac{2}{A}\right)^{n/(2n-1)}
$$

**3. Blasius case.** $f_F = 0.0790(2a\overline{v}_{zm}/\nu)^{-1/4} = 0.0790 \times 2^{-1/4}(a\overline{v}_{zm}/\nu)^{-1/4}$, so

$$
A = \frac{0.0790}{2^{1/4}} = 0.06643, \qquad n = 4,\quad m = \tfrac17,\quad \frac{(m+1)(m+2)}{2} = \frac{60}{49} = 1.2245
$$

$$
c = 1.2245\left(\frac{2}{0.06643}\right)^{4/7} = 1.2245 \times (30.11)^{0.5714} = 8.57
$$

**Comment.** The value 8.57 is within 2 % of the experimental $c = 8.74$ (Eq. 9.78). The Blasius friction law and the 1/7 velocity profile are two faces of one consistent description of smooth-pipe flow below Re ≈ $10^5$.`,
        check: [
          { label: md`$A$`, value: 0.06643, tol: 0.01 },
          { label: md`$c$`, value: 8.57, tol: 0.01 },
        ],
      },
      {
        id: 'w9-7',
        concept: 'smooth-pipe-friction',
        difficulty: 2,
        src: W('535–536', '9.7'),
        q: md`**Pneumatic particle transport.** A gas (density $\rho_g$, viscosity $\mu_g$) flows turbulently at mean velocity $\overline{v}_{zm}$ through a horizontal tube of diameter $D$. Spherical particles of diameter $d$ and density $\rho_p$ rest on the bottom wall. At high enough gas speeds, turbulence lifts the particles and the gas carries them along.

To estimate the gas velocity needed to pick up a single resting particle, assume:
(a) a drag coefficient $C_D = F_y/[\rho_g d^2 (v_y')^2]$, roughly constant at high Reynolds number, where $F_y$ is the upward force caused by a transverse fluctuation $v_y'$;
(b) $v_y'$ is proportional to the axial fluctuation $v_z'$, which is given by mixing-length theory;
(c) the mixing length $\ell'$ is proportional to $D$.

Show that pick-up is governed by the group

$$
\frac{\rho_g}{\rho_p}\,\frac{\overline{v}_{zm}^2}{g\,d}
$$`,
        hint: md`Mixing-length theory gives $v_z' \sim \ell'\,|d\overline{v}_z/dy|$. Either argue $|d\overline{v}_z/dy| \sim \overline{v}_{zm}/D$, or use $\ell'|d\overline{v}_z/dy| = \sqrt{\tau_w/\rho_g} = \overline{v}_{zm}\sqrt{f_F/2}$. Then compare $F_y$ with the particle's weight.`,
        answer: md`$v_y' \propto v_z' \sim \ell'|d\overline{v}_z/dy| \propto \overline{v}_{zm}$ (with $f_F$ nearly constant), so $F_y \propto \rho_g d^2\overline{v}_{zm}^2$. The weight is $\propto \rho_p g d^3$. Their ratio is $(\rho_g/\rho_p)(\overline{v}_{zm}^2/gd)$, and pick-up occurs when it exceeds a critical value.`,
        solution: md`**1. Fluctuation from mixing-length theory.** As in Eqs. (9.21)–(9.25), the axial fluctuation is of order the mixing length times the mean-velocity gradient:

$$
|v_z'| \sim \ell'\left|\frac{d\overline{v}_z}{dy}\right|
$$

**2. Scale the gradient.** With $\ell' \propto D$ (assumption c), the velocity varies by order $\overline{v}_{zm}$ over a distance of order $D$. So $|d\overline{v}_z/dy| \sim \overline{v}_{zm}/D$ and

$$
|v_z'| \propto D\cdot\frac{\overline{v}_{zm}}{D} = \overline{v}_{zm}
$$

**Friction-factor view (equivalent).** The wall stress is $\tau_w = \rho_g\ell'^2(d\overline{v}_z/dy)^2$, so

$$
\ell'\left|\frac{d\overline{v}_z}{dy}\right| = \sqrt{\frac{\tau_w}{\rho_g}} = \overline{v}_{zm}\sqrt{\frac{f_F}{2}}
$$

The fluctuations scale with the friction velocity. Because $f_F$ changes only slowly with Re (and not at all in fully rough flow), $v_z' \propto \overline{v}_{zm}$ to a good approximation. A weak dependence on Re, and hence on $\mu_g$, remains through $f_F$.

**3. Lift force.** From (b), $v_y' \propto v_z' \propto \overline{v}_{zm}$. With constant $C_D$ (a):

$$
F_y = C_D\,\rho_g d^2 (v_y')^2 \;\propto\; \rho_g d^2\,\overline{v}_{zm}^2
$$

**4. Resisting force.** The particle's weight is $\tfrac{\pi}{6}d^3(\rho_p - \rho_g)g \approx \tfrac{\pi}{6}\rho_p g d^3$, since $\rho_p \gg \rho_g$.

**5. Criterion.** The particle lifts off when $F_y$ exceeds a fixed multiple of its weight. Hence the ratio

$$
\frac{F_y}{\text{weight}} \;\propto\; \frac{\rho_g d^2\overline{v}_{zm}^2}{\rho_p g d^3} = \frac{\rho_g}{\rho_p}\left(\frac{\overline{v}_{zm}^2}{g\,d}\right)
$$

decides whether pick-up occurs. It is a density ratio times a particle Froude number. Experimental data on flow regimes and solids fraction should therefore be correlated against this group, perhaps with $D/d$ and Re as secondary parameters.`,
      },
      {
        id: 'w9-9',
        concept: 'smooth-pipe-friction',
        difficulty: 3,
        src: W('536', '9.9'),
        q: md`**Various quantities in turbulent flow.**

1. Using any universal velocity profile, prove that for a smooth pipe $v_{zm}^+ = 2.5\ln a^+ + 1.75$, and comment on the assumptions.
2. Water ($\rho = 1000$ kg/m³, $\mu = 0.001$ kg/(m s)) flows through a hydraulically smooth pipe of diameter 5.0 cm under a pressure gradient $-dp/dz = 14{,}000$ N/m³. Find:
   - the wall shear stress;
   - the mean velocity;
   - the Reynolds number;
   - the laminar-sublayer thickness;
   - the velocity at the junction of the laminar sublayer and the buffer region.
3. Estimate the heat-transfer coefficient between water and wall, given $c_p = 4184$ J/(kg °C).`,
        hint: md`$\tau_w = (a/2)(-dp/dz)$. The friction velocity gives $a^+$, and part 1 gives $v_{zm}^+$. Use the three-region profile: the sublayer ends at $y^+ = 5$. For $h$, apply the Reynolds analogy $h = (f_F/2)\rho\overline{v}_{zm}c_p = \tau_w c_p/\overline{v}_{zm}$.`,
        answer: md`$\tau_w = 175$ N/m², $\overline{v}_z^* = 0.418$ m/s, $a^+ = 10{,}458$, $v_{zm}^+ = 24.89$, $\overline{v}_{zm} = 10.4$ m/s, Re $= 5.21\times10^5$. Sublayer ($y^+ = 5$): $\delta = 1.20\times10^{-5}$ m, junction velocity $2.09$ m/s. Reynolds analogy: $h = \tau_w c_p/\overline{v}_{zm} \approx 7.0\times10^4$ W/(m² °C), an overestimate for water ($\mathrm{Pr} \approx 7$).`,
        solution: md`**1. Proof.** Apply $v_z^+ = A + B\ln y^+$ (with $A = 5.5$, $B = 2.5$) over the whole section. With $y = a - r$, $s = y/a$ and $y^+ = a^+s$, Eq. (9.48) gives

$$
v_{zm}^+ = \frac{2}{a^2}\int_0^a (a - y)\left[A + B\ln y^+\right]dy = 2\int_0^1(1 - s)\left[A + B\ln a^+ + B\ln s\right]ds
$$

Using $2\int_0^1(1 - s)\,ds = 1$ and $2\int_0^1(1 - s)\ln s\,ds = 2\left(-1 + \tfrac14\right) = -\tfrac32$:

$$
v_{zm}^+ = A + B\ln a^+ - \tfrac32 B = 2.5\ln a^+ + 1.75
$$

*Assumptions:*
- The log law is used right down to the wall. It is wrong in the sublayer and buffer region (and $\ln y^+ \to -\infty$), but the integrand is integrable and those layers carry very little flow (Wilkes p.497).
- The cusp at the axis is ignored.
- The pipe is smooth.

**2. Numbers.**

Wall stress from the force balance (Eq. 9.27 at $r = a = 0.025$ m):

$$
\tau_w = \frac{a}{2}\left(-\frac{dp}{dz}\right) = \frac{0.025}{2}(14{,}000) = 175\ \text{N/m}^2
$$

Friction velocity and $a^+$:

$$
\overline{v}_z^* = \sqrt{175/1000} = 0.4183\ \text{m/s}, \qquad a^+ = \frac{a\overline{v}_z^*}{\nu} = \frac{0.025 \times 0.4183}{10^{-6}} = 10{,}458
$$

Mean velocity:

$$
v_{zm}^+ = 2.5\ln(10{,}458) + 1.75 = 24.89, \qquad \overline{v}_{zm} = 24.89 \times 0.4183 = 10.41\ \text{m/s}
$$

Reynolds number:

$$
\mathrm{Re} = \frac{1000 \times 10.41 \times 0.05}{0.001} = 5.21\times10^5
$$

Laminar sublayer: in the three-region profile it extends to $y^+ = 5$, so

$$
\delta = \frac{5\nu}{\overline{v}_z^*} = \frac{5 \times 10^{-6}}{0.4183} = 1.20\times10^{-5}\ \text{m} \approx 12\ \mu\text{m}
$$

Junction velocity: $v_z^+ = y^+ = 5$ there, so $\overline{v}_{z\delta} = 5\overline{v}_z^* = 2.09$ m/s.

(With the two-piece model of §9.8 the junction is at $y^+ = 11.6$, giving $2.77\times10^{-5}$ m and 4.85 m/s.)

*Consistency:* $f_F = 2\tau_w/(\rho\overline{v}_{zm}^2) = 3.23\times10^{-3}$. This satisfies Eq. (9.52), $1/\sqrt{f_F} = 1.77\ln(\mathrm{Re}\sqrt{f_F}) - 0.601$, to 0.1 %.

**3. Heat-transfer coefficient (Reynolds analogy, Eq. 9.99).**

$$
h = \frac{f_F}{2}\rho\overline{v}_{zm}c_p = \frac{\tau_w c_p}{\overline{v}_{zm}} = \frac{175 \times 4184}{10.41} = 7.03\times10^4\ \text{W/(m}^2\,{}^\circ\text{C)}
$$

*Caveat (supplementary, with assumed water properties $\mathrm{Pr} \approx 7$, $k \approx 0.6$ W/(m K)).* The Reynolds analogy is accurate only for Pr ≈ 1, and for water it overestimates $h$. The Prandtl–Taylor correction with $\overline{v}_{z\delta}/\overline{v}_{zm} = 2.44/\mathrm{Re}^{1/8} = 0.471$ divides by $1 + 0.471(7 - 1) = 3.83$, giving $h \approx 1.8\times10^4$ W/(m² °C). Dittus–Boelter gives about $2.2\times10^4$ W/(m² °C).`,
        check: [
          { label: md`$\tau_w$`, value: 175, tol: 0.005, units: md`\mathrm{N/m^2}` },
          { label: md`$\overline{v}_{zm}$`, value: 10.41, tol: 0.01, units: md`\mathrm{m/s}` },
          { label: md`Re`, value: 5.21e5, tol: 0.01 },
          { label: md`$\delta$ ($y^+ = 5$)`, value: 1.195e-5, tol: 0.02, units: md`\mathrm{m}` },
          { label: md`junction velocity`, value: 2.09, tol: 0.01, units: md`\mathrm{m/s}` },
          { label: md`$h$ (Reynolds analogy)`, value: 70330, tol: 0.02, units: md`\mathrm{W/(m^2\,{}^\circ C)}` },
        ],
      },
    ],
    quiz: [
      {
        id: 'w9a-ff-q1',
        concept: 'blasius-power-law',
        difficulty: 2,
        q: md`A friction law $f_F \propto \mathrm{Re}^{-1/n}$ corresponds to a velocity profile $\overline{v}_z \propto y^m$. For the Blasius law ($n = 4$), what is $m$?`,
        options: [md`$1/7$`, md`$1/4$`, md`$1/8$`, md`$1/2$`],
        answer: 0,
        explain: md`Matching the Reynolds-number exponents gives $m = 1/(2n - 1) = 1/7$. Taking $m = 1/n = 1/4$ confuses the friction-law exponent with the profile exponent.`,
        src: W('533', '9.3'),
      },
      {
        id: 'w9a-ff-q2',
        concept: 'smooth-pipe-friction',
        difficulty: 2,
        q: md`In a smooth pipe, $\tau_w$ is known from $-dp/dz$. Which quantity lets you find the mean velocity without first guessing a friction factor?`,
        options: [
          md`$a^+ = a\sqrt{\tau_w/\rho}/\nu$, through $v_{zm}^+ = 2.5\ln a^+ + 1.75$`,
          md`The Reynolds number, through the Blasius law`,
          md`The Stanton number`,
          md`The laminar-sublayer thickness`,
        ],
        answer: 0,
        explain: md`$a^+$ depends only on $\tau_w$, $\rho$, $\nu$ and $a$, all of which are known. The mean velocity then follows explicitly. The Reynolds number needs the velocity you are trying to find.`,
        src: W('536', '9.9'),
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Heat- and mass-transfer analogies: 9.11, 9.13, 9.15, 9.16, 9.25    */
  /* ------------------------------------------------------------------ */
  {
    id: 'wilkes9a-heat-transfer-analogies',
    topic: 'heat-transfer-analogies',
    title: 'Wilkes Ch. 9 — Problems 9.11, 9.13, 9.15, 9.16, 9.25: Reynolds and Prandtl–Taylor analogies in practice',
    src: { doc: 'wilkes', pages: '537–540', note: 'Problems 9.11, 9.13, 9.15, 9.16, 9.25' },
    intro: md`These problems use the eddy-exchange model of §9.13 to predict mass flux, wall temperature and pumping power from friction data, and explain why the analogy fails away from $\mathrm{Pr} = 1$.`,
    problems: [
      {
        id: 'w9-11',
        concept: 'prandtl-taylor',
        difficulty: 3,
        src: W('537', '9.11'),
        q: md`**Turbulent mass transfer.**

1. Model gas flow (molecular weight $M_w$) in a pipe as a turbulent core plus a laminar sublayer at the wall. The partial pressure of A is $p_{Am}$ in the mainstream and zero at the wall. Derive

$$
N_A = \frac{\tau\,p_{Am}}{P\,M_w\left[u_m + u_L(\mathrm{Sc} - 1)\right]}
$$

Here $N_A$ is the molal flux of A to the wall, $P$ the total pressure, $\mathrm{Sc} = \nu/\mathscr{D}$, $\tau$ the wall shear stress, $u_m$ the mainstream velocity and $u_L$ the velocity at the sublayer edge.

2. Butene-1 is isomerized to butene-2 continuously and isothermally at 800 °F and 1 atm in a lime-coated porcelain tube of 2 in. I.D. The tube wall is the catalyst, and the rate is controlled by diffusion of butene-1 to the wall. Estimate the tube length for 80 % conversion of a pure butene-1 feed. Assume the sublayer carries little flow and the profiles are flat over most of the core.

Data at 800 °F: $\mathscr{D} = 0.59$ ft²/hr, $\mu = 0.044$ lbm/(ft hr), $c_f = 0.0086$, $u_L/u_m = 0.72$.`,
        hint: md`Write the momentum and the A-flux each twice, once across the sublayer (molecular) and once across the core (eddy mass flux $m$), exactly as in Eqs. (9.100)–(9.101). Then eliminate $\delta$, $m$ and $p_{AL}$. For part 2, an A balance on a slice $dx$ gives a first-order decay whose rate does not depend on the flow rate.`,
        answer: md`Derivation: Prandtl–Taylor elimination, with $RT\mu/\mathscr{D} = PM_w\,\mathrm{Sc}$. Part 2: $\rho = 0.0610$ lbm/ft³, Sc $= 1.22$, $\Phi = 1 + 0.72(\mathrm{Sc} - 1) = 1.160$, and $L = \dfrac{D\,\Phi}{2c_f}\ln\dfrac{1}{1 - 0.8} = 18.1$ ft (about 5.5 m).`,
        solution: md`**Part 1 — derivation.** Let the gas density be $\rho = PM_w/(RT)$, the sublayer thickness $\delta$, the eddy mass flux $m$, and the partial pressure of A at the sublayer edge $p_{AL}$. The molar concentration is $c_A = p_A/(RT)$.

*Momentum* (sublayer = core):

$$
\tau = \mu\frac{u_L}{\delta} = m\,(u_m - u_L)
$$

*Species A* (sublayer = core). Eddies carry a volume flux $m/\rho$, and the wall value is zero:

$$
N_A = \frac{\mathscr{D}}{RT}\,\frac{p_{AL} - 0}{\delta} = \frac{m}{\rho RT}(p_{Am} - p_{AL}) = \frac{m}{PM_w}(p_{Am} - p_{AL})
$$

*Eliminate.* From momentum, $\delta = \mu u_L/\tau$ and $m = \tau/(u_m - u_L)$. Then

$$
p_{AL} = \frac{N_A RT\delta}{\mathscr{D}} = \frac{N_A}{\tau}\,\frac{RT\mu}{\mathscr{D}}\,u_L, \qquad
p_{Am} - p_{AL} = \frac{N_A}{\tau}\,PM_w(u_m - u_L)
$$

Add the two to remove $p_{AL}$, using $RT\mu/\mathscr{D} = PM_w\,\mu/(\rho\mathscr{D}) = PM_w\,\mathrm{Sc}$:

$$
p_{Am} = \frac{N_A PM_w}{\tau}\left[u_L\mathrm{Sc} + u_m - u_L\right]
\;\Rightarrow\;
N_A = \frac{\tau\,p_{Am}}{PM_w\left[u_m + u_L(\mathrm{Sc} - 1)\right]}
$$

For Sc $= 1$ this reduces to the Reynolds analogy. It is the mass-transfer twin of Eq. (9.102).

**Part 2 — tube length.**

*Gas properties.* Butene, C₄H₈, has $M_w = 56.1$ (standard value, not given in the problem). $T = 800 + 459.67 = 1259.7$ °R, and $R = 0.7302$ ft³ atm/(lbmol °R):

$$
\rho = \frac{PM_w}{RT} = \frac{1 \times 56.1}{0.7302 \times 1259.7} = 0.0610\ \text{lbm/ft}^3, \qquad
\nu = \frac{0.044}{0.0610} = 0.721\ \text{ft}^2/\text{hr}, \qquad
\mathrm{Sc} = \frac{0.721}{0.59} = 1.22
$$

*Flux.* Take $c_f$ as the Fanning coefficient, so $\tau = \tfrac12 c_f\rho u_m^2$. With mole fraction $y_A = p_{Am}/P$:

$$
N_A = \frac{\tfrac12 c_f\rho u_m\,y_A}{M_w\,\Phi}, \qquad \Phi = 1 + \frac{u_L}{u_m}(\mathrm{Sc} - 1) = 1 + 0.72(0.2225) = 1.160
$$

*Balance on a slice $dx$.* The isomerization is equimolar, so the total molar flow $F = \rho u_m(\pi D^2/4)/M_w$ is constant:

$$
F\frac{dy_A}{dx} = -\pi D\,N_A
\;\Rightarrow\;
\frac{dy_A}{dx} = -\frac{2c_f}{D\,\Phi}\,y_A
$$

The velocity has cancelled, which is why no flow rate is given.

*Integrate* from $y_A = 1$ to $y_A = 0.2$, with $D = 2/12 = 0.1667$ ft:

$$
L = \frac{D\,\Phi}{2c_f}\ln\frac{1}{0.2} = \frac{0.1667 \times 1.160}{2 \times 0.0086} \times 1.609 = 18.1\ \text{ft} \;(\approx 5.5\ \text{m})
$$

*Assumptions:*
- plug flow, with flat core profiles so that $p_{Am}$ is the bulk value;
- the surface reaction is infinitely fast ($p_A = 0$ at the wall);
- $c_f$ is the Fanning factor (if it were the Darcy factor, $L$ would be 4 times larger).`,
        check: [
          { label: md`Sc`, value: 1.222, tol: 0.01 },
          { label: md`tube length $L$`, value: 18.1, tol: 0.02, units: md`\mathrm{ft}` },
        ],
      },
      {
        id: 'w9-13',
        concept: 'reynolds-analogy',
        difficulty: 3,
        src: W('537–538', '9.13'),
        q: md`**Turbulent heat transfer.** In a gas-cooled nuclear reactor, the fuel forms straight tubular elements of length $L$ and internal diameter $D$. Coolant enters at $T_0$ and flows through the tubes, which are embedded in moderator of thickness $L$. At distance $x$ from the inlet, heat is produced at rate $q\sin(\pi x/L)$ per unit length. The coolant energy balance is

$$
m c_p\frac{dT}{dx} = \pi D h\,(T_w - T) = q\sin\frac{\pi x}{L}
$$

where $m$ is the coolant mass flow rate, $T$ the coolant temperature and $T_w$ the wall temperature. Using the Reynolds analogy, prove that the inner wall temperature is a maximum at

$$
x_m = \frac{L}{\pi}\tan^{-1}\!\left(\frac{-\pi D}{2f_F L}\right)
$$

As an illustration (values chosen here, not from the book), evaluate $x_m/L$ for $D/L = 0.02$ and $f_F = 0.005$.`,
        hint: md`Integrate for $T(x)$. Write $T_w = T + q\sin(\pi x/L)/(\pi D h)$. The Reynolds analogy with $\overline{v}_{zm} = 4m/(\rho\pi D^2)$ gives $\pi D h = 2f_F m c_p/D$. Set $dT_w/dx = 0$ and choose the branch with $0 < x_m < L$.`,
        answer: md`$T_w = T_0 + \dfrac{qL}{\pi mc_p}\left(1 - \cos\dfrac{\pi x}{L}\right) + \dfrac{qD}{2f_F mc_p}\sin\dfrac{\pi x}{L}$. Setting $dT_w/dx = 0$ gives $\tan(\pi x_m/L) = -\pi D/(2f_FL)$, with $\pi/2 < \pi x_m/L < \pi$, so the maximum lies in the downstream half. Illustration: $x_m/L = 0.550$.`,
        solution: md`**1. Coolant temperature.** Integrate $mc_p\,dT/dx = q\sin(\pi x/L)$ from $T = T_0$ at $x = 0$:

$$
T = T_0 + \frac{qL}{\pi mc_p}\left(1 - \cos\frac{\pi x}{L}\right)
$$

**2. Heat-transfer coefficient from the Reynolds analogy (9.99).** With $\overline{v}_{zm} = 4m/(\rho\pi D^2)$:

$$
h = \frac{f_F}{2}\rho\overline{v}_{zm}c_p = \frac{2f_F\,mc_p}{\pi D^2}
\;\Rightarrow\;
\pi D h = \frac{2f_F\,mc_p}{D}
$$

**3. Wall temperature.**

$$
T_w = T + \frac{q\sin(\pi x/L)}{\pi Dh} = T_0 + \frac{qL}{\pi mc_p}\left(1 - \cos\frac{\pi x}{L}\right) + \frac{qD}{2f_F\,mc_p}\sin\frac{\pi x}{L}
$$

**4. Maximum.** Write $\theta = \pi x/L$ and differentiate:

$$
\frac{dT_w}{dx} = \frac{q}{mc_p}\left[\sin\theta + \frac{\pi D}{2f_FL}\cos\theta\right] = 0
\;\Rightarrow\;
\tan\theta_m = -\frac{\pi D}{2f_FL}
$$

$$
x_m = \frac{L}{\pi}\tan^{-1}\!\left(\frac{-\pi D}{2f_F L}\right)
$$

**Branch.** The right-hand side is negative, so $\theta_m$ lies in $(\pi/2, \pi)$, i.e. $L/2 < x_m < L$. A calculator returns the principal value; add $\pi$ to it. It is a maximum because $d^2T_w/dx^2 \propto \cos\theta - (\pi D/2f_FL)\sin\theta < 0$ there.

**Physics.** The wall is hotter than the gas by the local heat flux divided by $h$, which is largest at mid-length. The gas itself keeps warming toward the outlet. The sum peaks downstream of the centre.

**Illustration** ($D/L = 0.02$, $f_F = 0.005$): $\pi D/(2f_FL) = 6.283$, so

$$
\theta_m = \pi - \tan^{-1}(6.283) = 1.729\ \text{rad}, \qquad x_m/L = 0.550
$$

A larger $f_F L/D$ (better heat transfer, longer tube) pushes $x_m$ further toward the outlet.`,
        check: [{ label: md`$x_m/L$ (illustration)`, value: 0.550, tol: 0.01 }],
      },
      {
        id: 'w9-15',
        concept: 'reynolds-analogy',
        difficulty: 2,
        src: W('538', '9.15'),
        q: md`**Reynolds analogy for minimum pumping power.** A gas of molecular weight $M_w$ is pumped through a cylindrical coolant duct to remove heat from a nuclear reactor. The temperature rise $\Delta T$, the log-mean temperature difference, the transfer area $A$ and the heat load $q$ are all specified. In

$$
q = m\,c_p\,\Delta T = A\,h\,\Delta T_{\log\,\text{mean}}
$$

the only variables are therefore the mass flow rate $m$ and the gas specific heat $c_p$, so $mc_p = c_1$ is constant. Use the Reynolds analogy to prove that the pumping power $\mathcal{P} = Q\,\Delta p$ ($Q$ = volumetric flow rate) is lowest for the gas with the largest $M_w^2c_p^3$. Assume $\rho = M_w p/RT = c_2M_w$.`,
        hint: md`The heat balance fixes $h$ as well as $mc_p$. Express $\Delta p$ through $\tau_w$ ($\Delta p\,\pi D^2/4 = \tau_w\pi DL$), then replace $\tau_w$ using the Reynolds analogy $\tau_w = h\overline{v}_{zm}/c_p$.`,
        answer: md`$\mathcal{P} = \dfrac{4Lh}{DA_c}\,\dfrac{m^2}{\rho^2c_p} = \dfrac{4Lh\,c_1^2}{DA_c\,c_2^2}\,\dfrac{1}{M_w^2c_p^3}$. With everything else fixed, $\mathcal{P}$ is smallest when $M_w^2c_p^3$ is largest.`,
        solution: md`**1. Fixed quantities.**
- The duct geometry ($D$, length $L$, flow area $A_c = \pi D^2/4$, transfer area $A$) is fixed.
- $q = Ah\Delta T_{\log\,\text{mean}}$ with $q$, $A$ and $\Delta T_{\log\,\text{mean}}$ fixed means **$h$ is fixed**.
- $mc_p = c_1$, so $m = c_1/c_p$.

**2. Reynolds analogy (9.97/9.99).**

$$
\frac{f_F}{2} = \frac{\tau_w}{\rho\overline{v}_{zm}^2} = \frac{h}{\rho\overline{v}_{zm}c_p}
\;\Rightarrow\;
\tau_w = \frac{h\,\overline{v}_{zm}}{c_p}
$$

The friction factor itself drops out.

**3. Pressure drop.** A force balance on the duct gives $\Delta p\,(\pi D^2/4) = \tau_w(\pi DL)$, so

$$
\Delta p = \frac{4L}{D}\tau_w = \frac{4Lh}{D}\,\frac{\overline{v}_{zm}}{c_p}, \qquad \overline{v}_{zm} = \frac{m}{\rho A_c}
$$

**4. Pumping power.**

$$
\mathcal{P} = Q\Delta p = \frac{m}{\rho}\cdot\frac{4Lh}{D}\,\frac{m}{\rho A_c c_p} = \frac{4Lh}{DA_c}\,\frac{m^2}{\rho^2 c_p}
$$

**5. Substitute $m = c_1/c_p$ and $\rho = c_2M_w$.**

$$
\mathcal{P} = \frac{4Lh\,c_1^2}{DA_c\,c_2^2}\cdot\frac{1}{M_w^2\,c_p^3}
$$

Every factor except $M_w^2c_p^3$ is fixed, so the pumping power is **lowest for the largest $M_w^2c_p^3$**.

**Remark (supplementary, approximate handbook values).** Note that $M_w^2c_p^3 = (M_wc_p)^2c_p$, and the molar heat capacity $M_wc_p$ is similar for gases of the same molecular type. The criterion therefore favours gases with a high specific heat per unit mass, i.e. light gases.

For example, helium ($M_w = 4.0$, $c_p \approx 5.19$ kJ/(kg K)) gives $M_w^2c_p^3 \approx 2240$, and CO₂ ($M_w = 44$, $c_p \approx 0.846$) gives about 1170. Helium would need roughly half the pumping power of CO₂, which helps explain why both are reactor coolants but helium is preferred for high-performance designs.`,
        check: [{ label: md`$\mathcal{P}_{\mathrm{CO_2}}/\mathcal{P}_{\mathrm{He}}$ (illustrative property values)`, value: 1.91, tol: 0.03 }],
      },
      {
        id: 'w9-16',
        concept: 'reynolds-analogy',
        difficulty: 1,
        src: W('538', '9.16'),
        q: md`**Turbulent mass flux.** For flow in a pipe of diameter $D$ and length $L$ at mean velocity $\overline{v}_{zm}$, the Reynolds analogy gives the eddy mass flux per unit wall area as $m = \tau_w/\overline{v}_{zm}$.
- $m_t$ is this flux integrated over the whole wall area.
- $m_c$ is the convective mass flow rate along the pipe.

For a smooth pipe with $D = 0.05$ m at Re $= 10^4$, how long must the pipe be for $m_t = m_c$?`,
        hint: md`$m_t = (\tau_w/\overline{v}_{zm})\pi DL$ and $m_c = \rho\overline{v}_{zm}\pi D^2/4$. The ratio involves only $f_F$, which comes from the Blasius law.`,
        answer: md`$L = \dfrac{\rho\overline{v}_{zm}^2D}{4\tau_w} = \dfrac{D}{2f_F}$. With $f_F = 0.0790(10^4)^{-1/4} = 0.00790$, $L = 3.16$ m ($L/D \approx 63$).`,
        solution: md`**1. Total eddy flux to the wall.**

$$
m_t = \frac{\tau_w}{\overline{v}_{zm}}\,\pi DL
$$

**2. Convective flow along the pipe.**

$$
m_c = \rho\overline{v}_{zm}\frac{\pi D^2}{4}
$$

**3. Equate.**

$$
\frac{\tau_w}{\overline{v}_{zm}}\pi DL = \rho\overline{v}_{zm}\frac{\pi D^2}{4}
\;\Rightarrow\;
L = \frac{\rho\overline{v}_{zm}^2D}{4\tau_w} = \frac{D}{2f_F}
$$

using $\tau_w = \tfrac12 f_F\rho\overline{v}_{zm}^2$.

**4. Friction factor** (Blasius, Eq. 9.59, valid for Re < $10^5$):

$$
f_F = 0.0790\,(10^4)^{-1/4} = \frac{0.0790}{10} = 0.00790
$$

**5. Length.**

$$
L = \frac{0.05}{2 \times 0.00790} = 3.16\ \text{m}, \qquad \frac{L}{D} = 63
$$

**Meaning.** After about 63 diameters, the eddies have exchanged with the wall region a mass equal to the entire through-flow. This is the "renewal length" of the turbulent core. It explains why turbulent pipe flow transfers heat and mass so effectively, and why fully developed transfer is reached within a few tens of diameters.`,
        check: [
          { label: md`$f_F$`, value: 0.0079, tol: 0.01 },
          { label: md`$L$`, value: 3.16, tol: 0.01, units: md`\mathrm{m}` },
        ],
      },
      {
        id: 'w9-25',
        concept: 'analogy-evaluation',
        difficulty: 1,
        src: W('540', '9.25'),
        q: md`**The Prandtl number and the Reynolds analogy.** Table E9.6 showed that the Reynolds analogy *underestimates* the heat-transfer coefficient when $\mathrm{Pr} < 1$ and *overestimates* it when $\mathrm{Pr} > 1$. Using $\mathrm{Pr} = \nu/\alpha$ (kinematic viscosity over thermal diffusivity), explain physically why.

As a quantitative extension (not part of the printed problem), use the Prandtl–Taylor analogy at the Re $= 50{,}000$ of Table E9.6 to find the factor $\mathrm{St}/(f_F/2)$ for $\mathrm{Pr} = 0.5$ and $\mathrm{Pr} = 2$.`,
        hint: md`The Reynolds analogy lets eddies carry heat and momentum identically all the way to the wall. Near the wall, though, transport is molecular: momentum diffuses at rate $\nu$ and heat at rate $\alpha$. Which one gets through the sublayer more easily when $\nu < \alpha$?`,
        answer: md`Near the wall, heat crosses by conduction (rate $\alpha$) and momentum by viscosity (rate $\nu$). For Pr < 1 heat gets through more easily than momentum, so the friction-based prediction is too low. For Pr > 1 heat is held back, so the prediction is too high. Prandtl–Taylor at Re $= 5\times10^4$: $\overline{v}_{z\delta}/\overline{v}_{zm} = 0.631$, giving factors $1.46$ (Pr $= 0.5$) and $0.613$ (Pr $= 2$).`,
        solution: md`**1. What the Reynolds analogy assumes.** One eddy mass flux $m$ carries both momentum and heat right up to the wall (Eqs. 9.95–9.96). This implicitly treats heat and momentum as diffusing identically everywhere, which is equivalent to Pr $= 1$. Molecular properties never enter.

**2. What really happens near the wall.** In the laminar sublayer the eddies die out:
- momentum crosses by viscous diffusion, at a rate set by $\nu$;
- heat crosses by conduction, at a rate set by $\alpha = k/(\rho c_p)$.

The ratio of the sublayer's resistance to heat and its resistance to momentum is therefore Pr $= \nu/\alpha$.

**3. Pr < 1** (liquid metals, and to a lesser degree gases). Here $\alpha > \nu$, so heat diffuses through the sublayer *more easily* than momentum. The friction (momentum transfer) is the harder process. Basing $h$ on it misses the extra ease of heat transfer, so the Reynolds analogy **underestimates** $h$: in Table E9.6, 67 against 100.

**4. Pr > 1** (water, oils). Here $\alpha < \nu$, so heat diffuses through the sublayer *less easily* than momentum. The sublayer is an extra thermal resistance that the momentum data do not reveal. The Reynolds analogy **overestimates** $h$: 264 against 173.

**5. Quantitative check (Prandtl–Taylor, 9.102–9.103).**

$$
\frac{\mathrm{St}}{f_F/2} = \frac{1}{1 + \dfrac{\overline{v}_{z\delta}}{\overline{v}_{zm}}(\mathrm{Pr} - 1)}, \qquad \frac{\overline{v}_{z\delta}}{\overline{v}_{zm}} = \frac{2.44}{(50{,}000)^{1/8}} = 0.631
$$

- Pr $= 0.5$: factor $= 1/(1 - 0.316) = 1.46$, raising the Reynolds-analogy value (×1.46).
- Pr $= 2$: factor $= 1/1.631 = 0.613$, lowering it.

Both corrections move toward the Dittus–Boelter values and reproduce the PTA column of Table E9.6 (95 and 162) to within about 2 % (recomputing from the formulas gives 96.5 and 162). At Pr $= 1$ the factor is exactly 1, which is why all three methods agree there.`,
        check: [
          { label: md`factor at Pr $= 0.5$`, value: 1.461, tol: 0.01 },
          { label: md`factor at Pr $= 2$`, value: 0.613, tol: 0.01 },
        ],
      },
    ],
    quiz: [
      {
        id: 'w9a-ht-q1',
        concept: 'reynolds-analogy',
        difficulty: 2,
        q: md`With the Reynolds analogy and fixed duct geometry, heat load and temperatures, the pumping power varies with the coolant gas as`,
        options: [md`$1/(M_w^2c_p^3)$`, md`$M_w^2c_p^3$`, md`$1/(M_wc_p)$`, md`$f_F$ only, independent of the gas`],
        answer: 0,
        explain: md`$\mathcal{P} \propto m^2/(\rho^2c_p)$, with $m \propto 1/c_p$ and $\rho \propto M_w$, so $\mathcal{P} \propto 1/(M_w^2c_p^3)$. The friction factor cancels through the analogy, so "$f_F$ only" is the tempting but wrong choice.`,
        src: W('538', '9.15'),
      },
      {
        id: 'w9a-ht-q2',
        concept: 'analogy-evaluation',
        difficulty: 1,
        q: md`For water ($\mathrm{Pr} \approx 7$), the Reynolds analogy predicts a heat-transfer coefficient that is`,
        options: [md`too high, because heat crosses the sublayer more slowly than momentum`, md`too low, because heat crosses the sublayer faster than momentum`, md`exact, since eddies carry heat and momentum alike`, md`too high, because water has a thick turbulent core`],
        answer: 0,
        explain: md`Pr $= \nu/\alpha > 1$ means that thermal diffusion is the slower molecular process in the sublayer. The analogy ignores this extra resistance and so overpredicts $h$.`,
        src: W('540', '9.25'),
      },
    ],
  },
]
