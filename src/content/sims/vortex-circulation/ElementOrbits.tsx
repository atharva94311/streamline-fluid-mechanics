import { useEffect, useRef, useState } from 'react'
import { StepForward } from 'lucide-react'
import { M, md, PlayPause, Segmented, Toggle, useAnimationFrame, useInView, usePrefersReducedMotion, useUid } from '@/kit'
import { ArrowDefs, Chevron, f2, polarFrame, polyPath, wrapDeg, type Pt } from './svg'

/*
 * Side-by-side kinematics of the free vortex (v_θ = K/r) and the forced vortex (v_θ = K₁r),
 * recreating the element sketches A → B of Lecture 12, slides 12–13.
 *
 * Both fields are steady and purely circular, so the exact flow map is known in closed form:
 * a particle at (r, θ) is at (r, θ + Ω(r) t) a time t later, with Ω = K/r² (free) or Ω = K₁ (forced).
 * K and K₁ are chosen so that element A (at r_A) orbits at the same rate in both panels:
 * same path, same speed at A — only the rotation differs.
 */

const CX = 150
const CY = 152
const S = 118
const DEG = Math.PI / 180
const R_A = 0.85
const OMEGA = (2 * Math.PI) / 14 // orbital angular speed of element A in both panels (rad/s): one lap in 14 s
const K_FREE = OMEGA * R_A * R_A
const K1 = OMEGA
const DYE_TRAVEL = 30 * DEG // the dyed cross is followed from A for 30° of travel (slide 12 shows ≈ 30°)
const T_TRAVEL = DYE_TRAVEL / OMEGA
const DYE_HOLD = 1.6
const CIRCLES = [0.09, 0.42, 0.7, 1.0]
const PROFILE_R = [0.18, 0.42, 0.65, 0.9]
const C_FREE = 0.171 // drawing scale of the 1/r profile arrows
const C_FORCED = 0.72 // drawing scale of the linear profile arrows
const FLOATS: { r: number; th0: number; isA?: boolean }[] = [
  { r: 0.42, th0: 210 * DEG },
  { r: 0.42, th0: 30 * DEG },
  { r: 0.7, th0: 135 * DEG },
  { r: 0.7, th0: 315 * DEG },
  { r: R_A, th0: 90 * DEG, isA: true },
]
const ARM = 0.075
const DYE_ARM = 0.11

type Kind = 'free' | 'forced'
type Mode = 'float' | 'dye'

const angSpeed = (kind: Kind, r: number) => (kind === 'free' ? K_FREE / (r * r) : K1)

function advect(kind: Kind, x: number, y: number, t: number): Pt {
  const r = Math.hypot(x, y)
  const th = Math.atan2(y, x) + angSpeed(kind, r) * t
  return [r * Math.cos(th), r * Math.sin(th)]
}

const toScreen = ([x, y]: Pt): Pt => [CX + S * x, CY - S * y]

/** A dyed material cross released at A (top of the circle r_A): exact positions of its two arms after time τ. */
function dyedCross(kind: Kind, tau: number) {
  const n = 13
  const radial: Pt[] = []
  const tangential: Pt[] = []
  for (let i = 0; i < n; i++) {
    const s = -DYE_ARM + (2 * DYE_ARM * i) / (n - 1)
    radial.push(advect(kind, 0, R_A + s, tau)) // initially vertical = radial at A
    tangential.push(advect(kind, -s, R_A, tau)) // initially horizontal = tangential at A (pointing in −x, the CCW direction)
  }
  const ang = (pts: Pt[]) => Math.atan2(pts[n - 1][1] - pts[0][1], pts[n - 1][0] - pts[0][0]) / DEG
  return { radial, tangential, radialTurn: wrapDeg(ang(radial) - 90), tangentialTurn: wrapDeg(ang(tangential) - 180) }
}

const signed = (d: number) => `${d > 0.5 ? '+' : d < -0.5 ? '−' : ''}${Math.abs(Math.round(d))}°`
const mod360 = (d: number) => ((Math.round(d) % 360) + 360) % 360

function Panel({ kind, t, mode, profile, uid }: { kind: Kind; t: number; mode: Mode; profile: boolean; uid: string }) {
  const { P, arc, ccw } = polarFrame(CX, CY, S)
  const free = kind === 'free'
  const tau = Math.min(t % (T_TRAVEL + DYE_HOLD), T_TRAVEL)
  const travelled = mode === 'dye' ? OMEGA * tau : (OMEGA * t) % (2 * Math.PI)
  const markerAngle = free ? 90 * DEG : 90 * DEG + K1 * t
  const a = S * ARM

  const floatGlyph = (px: number, py: number, ang: number, key: string, faint = false) => {
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    return (
      <g key={key} opacity={faint ? 0.35 : 1}>
        <line x1={f2(px - a * c)} y1={f2(py + a * s)} x2={f2(px + a * c)} y2={f2(py - a * s)} stroke="var(--ink-2)" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={f2(px + a * s)} y1={f2(py + a * c)} x2={f2(px - a * s)} y2={f2(py - a * c)} stroke="var(--ink-2)" strokeWidth={2.2} strokeLinecap="round" />
        <line
          x1={f2(px)}
          y1={f2(py)}
          x2={f2(px + 1.6 * a * c)}
          y2={f2(py - 1.6 * a * s)}
          stroke="var(--plot-1)"
          strokeWidth={2.6}
          strokeLinecap="round"
          markerEnd={`url(#${uid}-mark)`}
          strokeDasharray={faint ? '3 2' : undefined}
        />
        <circle cx={f2(px)} cy={f2(py)} r={2.4} fill="var(--plot-1)" />
      </g>
    )
  }

  const start = P(R_A, 90 * DEG)
  const cross = mode === 'dye' ? dyedCross(kind, tau) : null
  const bCentre = mode === 'dye' ? toScreen(advect(kind, 0, R_A, tau)) : P(R_A, 90 * DEG + travelled)
  const bLabel = P(R_A + 0.2, 90 * DEG + travelled + 6 * DEG)

  return (
    <svg viewBox="0 0 300 300" className="mx-auto block h-auto w-full max-w-[380px]" role="img" aria-label={`${free ? 'Free' : 'Forced'} vortex: fluid elements carried round circular streamlines`}>
      <ArrowDefs id={uid} colors={{ ink: 'var(--ink)', mark: 'var(--plot-1)', ink3: 'var(--ink-3)' }} size={6.5} />
      {/* streamlines (counter-clockwise) */}
      {CIRCLES.map((r, i) => {
        const th = (i === 0 ? 120 : 200) * DEG
        const [px, py] = P(r, th)
        const [dx, dy] = ccw(th)
        return (
          <g key={r}>
            <circle cx={CX} cy={CY} r={S * r} fill="none" stroke="var(--plot-4)" strokeOpacity={0.75} strokeWidth={1.6} />
            <Chevron x={px} y={py} dx={dx} dy={dy} fill="var(--plot-4)" size={i === 0 ? 3.8 : 5.2} />
          </g>
        )
      })}
      <circle cx={CX} cy={CY} r={3} fill="var(--ink)" />
      {/* radius indicator */}
      <line x1={CX} y1={CY} x2={P(0.98, -48 * DEG)[0]} y2={P(0.98, -48 * DEG)[1]} stroke="var(--ink-3)" strokeWidth={1} markerEnd={`url(#${uid}-ink3)`} />
      <text x={P(0.8, -56 * DEG)[0]} y={P(0.8, -56 * DEG)[1] + 4} className="text-[12px] italic" fill="var(--ink-3)">r</text>

      {/* v_θ(r) profile along the +x axis */}
      {profile ? (
        <g>
          <line x1={CX} y1={CY} x2={CX + S * 1.17} y2={CY} stroke="var(--ink-3)" strokeWidth={1} />
          {PROFILE_R.map((r) => {
            const L = free ? C_FREE / r : C_FORCED * r
            return <line key={r} x1={f2(CX + S * r)} y1={CY} x2={f2(CX + S * r)} y2={f2(CY - S * L)} stroke="var(--ink)" strokeWidth={1.8} markerEnd={`url(#${uid}-ink)`} />
          })}
          <path
            d={
              free
                ? polyPath(Array.from({ length: 60 }, (_, i) => {
                    const x = 0.16 + (1.18 - 0.16) * (i / 59)
                    return [CX + S * x, CY - S * Math.min(1.14, C_FREE / x)] as Pt
                  }))
                : `M${CX} ${CY}L${f2(CX + S * 1.18)} ${f2(CY - S * C_FORCED * 1.18)}`
            }
            fill="none"
            stroke="var(--ink)"
            strokeWidth={2}
          />
          {free ? (
            <text x={206} y={30} className="text-[12.5px] italic" fill="var(--ink)">
              v<tspan dy={3} className="text-[9px]">θ</tspan>
              <tspan dy={-3}> ∝ 1/r</tspan>
            </text>
          ) : (
            <text x={176} y={30} className="text-[12.5px] italic" fill="var(--ink)">
              v<tspan dy={3} className="text-[9px]">θ</tspan>
              <tspan dy={-3}> = K</tspan>
              <tspan dy={3} className="text-[9px]">1</tspan>
              <tspan dy={-3}>r</tspan>
            </text>
          )}
        </g>
      ) : null}

      {/* path travelled by element A during this lap */}
      {travelled > 2 * DEG ? (
        <path d={arc(R_A, 90 * DEG, 90 * DEG + travelled)} fill="none" stroke="var(--plot-1)" strokeOpacity={0.4} strokeWidth={1.6} strokeDasharray="4 3" />
      ) : null}

      {/* elements */}
      {mode === 'float' ? (
        <g>
          {floatGlyph(start[0], start[1], 90 * DEG, 'ghost', true)}
          {FLOATS.map((fl, i) => {
            const th = fl.th0 + angSpeed(kind, fl.r) * t
            const [px, py] = P(fl.r, th)
            return floatGlyph(px, py, markerAngle, `f${i}`)
          })}
        </g>
      ) : cross ? (
        <g>
          <g opacity={0.35}>
            <line x1={start[0]} y1={start[1] - S * DYE_ARM} x2={start[0]} y2={start[1] + S * DYE_ARM} stroke="var(--plot-4)" strokeWidth={2} strokeDasharray="3 2" />
            <line x1={start[0] - S * DYE_ARM} y1={start[1]} x2={start[0] + S * DYE_ARM} y2={start[1]} stroke="var(--plot-1)" strokeWidth={2} strokeDasharray="3 2" />
          </g>
          <path d={polyPath(cross.radial.map(toScreen))} fill="none" stroke="var(--plot-4)" strokeWidth={2.8} strokeLinecap="round" />
          <path d={polyPath(cross.tangential.map(toScreen))} fill="none" stroke="var(--plot-1)" strokeWidth={2.8} strokeLinecap="round" />
          <circle cx={f2(bCentre[0])} cy={f2(bCentre[1])} r={2.2} fill="var(--ink)" />
        </g>
      ) : null}
      <text x={start[0] + 9} y={start[1] - 13} className="text-[13px] font-semibold italic" fill="var(--ink)">A</text>
      {travelled > 12 * DEG ? (
        <text x={f2(bLabel[0] - 6)} y={f2(bLabel[1] + 4)} className="text-[13px] font-semibold italic" fill="var(--ink)">B</text>
      ) : null}
    </svg>
  )
}

/**
 * Animated comparison of fluid elements in a free and a forced vortex.
 * Mode "float": tiny rigid floats carrying an arrow (a vorticity meter) — they turn at the local ω_z.
 * Mode "dye": a dyed material cross released at A and followed exactly for 30° of travel (the slide's A → B).
 */
export function ElementOrbits() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduced = usePrefersReducedMotion()
  const uidFree = useUid('eof')
  const uidForced = useUid('eok')
  const [playing, setPlaying] = useState(true)
  const [t, setT] = useState(T_TRAVEL)
  const [mode, setMode] = useState<Mode>('float')
  const [profile, setProfile] = useState(true)
  useEffect(() => {
    if (reduced) setPlaying(false)
  }, [reduced])
  useAnimationFrame((dt) => setT((x) => x + dt), playing && inView)

  const tau = Math.min(t % (T_TRAVEL + DYE_HOLD), T_TRAVEL)
  const travelled = mode === 'dye' ? (OMEGA * tau) / DEG : ((OMEGA * t) / DEG) % 360
  const freeCross = mode === 'dye' ? dyedCross('free', tau) : null
  const forcedCross = mode === 'dye' ? dyedCross('forced', tau) : null
  const forcedMarker = mod360((K1 * t) / DEG)

  const statusFree =
    mode === 'float'
      ? 'marker arrow has turned 0° — it keeps pointing up'
      : `radial arm ${signed(freeCross!.radialTurn)}, tangential arm ${signed(freeCross!.tangentialTurn)}`
  const statusForced =
    mode === 'float'
      ? `marker arrow has turned ${forcedMarker}° — same as the orbit`
      : `radial arm ${signed(forcedCross!.radialTurn)}, tangential arm ${signed(forcedCross!.tangentialTurn)}`

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setT(0)} />
        <button type="button" className="btn-ghost" onClick={() => { setPlaying(false); setT((x) => x + (10 * DEG) / OMEGA) }}>
          <StepForward className="h-4 w-4" /> Step 10°
        </button>
        <div className="min-w-[230px] flex-1">
          <Segmented<Mode>
            value={mode}
            onChange={(m) => { setMode(m); setT(m === 'dye' ? 0 : T_TRAVEL) }}
            options={[
              { value: 'float', label: 'Tiny floats with an arrow' },
              { value: 'dye', label: 'Dyed fluid cross (slide A → B)' },
            ]}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Toggle label={md`$v_\theta(r)$ profile`} checked={profile} onChange={setProfile} />
        </div>
      </div>
      <div className="rounded-xl bg-surface-2 px-3 py-1.5 text-center font-mono text-xs text-ink-2">
        element A has travelled {Math.round(travelled)}° round its circle (same path and same speed in both panels)
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['free', 'forced'] as Kind[]).map((k) => (
          <div key={k} className="min-w-0">
            <Panel kind={k} t={t} mode={mode} profile={profile} uid={k === 'free' ? uidFree : uidForced} />
            <div className="mt-1 text-center">
              <div className="font-semibold text-ink">{k === 'free' ? 'irrotational (free) vortex' : 'rotational (forced) vortex'}</div>
              <div className="text-sm text-ink-2">
                <M tex={k === 'free' ? md`v_\theta = K/r,\quad \omega_z = 0` : md`v_\theta = K_1 r,\quad \omega_z = K_1`} />
              </div>
              <div className="mt-1 font-mono text-[11.5px] text-ink-3">{k === 'free' ? statusFree : statusForced}</div>
            </div>
          </div>
        ))}
      </div>
      {mode === 'dye' ? (
        <p className="text-xs text-ink-3">
          Free vortex: at the instant of release the radial (rose) arm turns clockwise at −K/r² and the tangential (indigo) arm counter-clockwise
          at +K/r² — equal and opposite, so ω_z = 0. The cross is sheared (deformed), not rotated. Forced vortex: both arms turn together
          at K₁ — a rigid rotation with no deformation. The cross is re-dyed at A every cycle.
        </p>
      ) : (
        <p className="text-xs text-ink-3">
          Each float is a tiny rigid “vorticity meter”: it spins at the local rotation ω_z of the fluid. Inner floats lap outer ones in the free
          vortex (Ω = K/r²) yet every arrow keeps pointing up; in the forced vortex everything turns together, arrows included.
        </p>
      )}
    </div>
  )
}
