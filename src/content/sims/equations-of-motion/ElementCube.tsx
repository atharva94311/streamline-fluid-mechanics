import { COL, HArrow, SubText, Tag } from './svg'

/**
 * Oblique-projection drawing of the differential element of Lecture 10, slide 3:
 * y up, x to the right, z towards the viewer (down-left). Front face (+z) at lower left, back face (−z) up-right.
 */
export type Pt = [number, number]
export const V: Record<'FTL' | 'FTR' | 'FBR' | 'FBL' | 'BTL' | 'BTR' | 'BBR' | 'BBL', Pt> = {
  FTL: [200, 120],
  FTR: [330, 120],
  FBR: [330, 250],
  FBL: [200, 250],
  BTL: [270, 65],
  BTR: [400, 65],
  BBR: [400, 195],
  BBL: [270, 195],
}

export type FaceKey = 'R' | 'L' | 'T' | 'B' | 'F' | 'K'
export type Family = 'n' | 'y' | 'z'

export interface FaceInfo {
  /** Centre of the face on screen (where the force acts). */
  c: Pt
  /** +1 for a positive face (+x, +y, +z), −1 for a negative face. */
  sign: 1 | -1
  family: Family
  /** Is the face hidden in this view? (its arrow is dashed) */
  hidden: boolean
  name: string
  n: number
}

export const FACES: Record<FaceKey, FaceInfo> = {
  R: { c: [365, 157.5], sign: 1, family: 'n', hidden: false, name: 'right (+x) face', n: 1 },
  L: { c: [235, 157.5], sign: -1, family: 'n', hidden: true, name: 'left (−x) face', n: 2 },
  T: { c: [300, 92.5], sign: 1, family: 'y', hidden: false, name: 'top (+y) face', n: 3 },
  B: { c: [300, 222.5], sign: -1, family: 'y', hidden: true, name: 'bottom (−y) face', n: 4 },
  F: { c: [265, 185], sign: 1, family: 'z', hidden: false, name: 'front (+z) face', n: 5 },
  K: { c: [335, 130], sign: -1, family: 'z', hidden: true, name: 'back (−z) face', n: 6 },
}
export const FACE_ORDER: FaceKey[] = ['R', 'L', 'T', 'B', 'F', 'K']
export const FAMILY_COLOR: Record<Family, string> = { n: COL.normal, y: COL.shearY, z: COL.shearZ }

const poly = (...pts: Pt[]) => pts.map((p) => p.join(',')).join(' ')

/** Cube faces (light fills) and edges: hidden edges dashed, visible edges solid. */
export function CubeOutline() {
  const e = (a: Pt, b: Pt, dashed = false, key?: string) => (
    <line
      key={key}
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      stroke="var(--ink-2)"
      strokeWidth={dashed ? 1.1 : 1.6}
      strokeDasharray={dashed ? '5 4' : undefined}
    />
  )
  return (
    <g>
      <polygon points={poly(V.FTL, V.FTR, V.BTR, V.BTL)} fill="var(--surface-2)" opacity={0.9} />
      <polygon points={poly(V.FTR, V.BTR, V.BBR, V.FBR)} fill="var(--line)" opacity={0.55} />
      <polygon points={poly(V.FTL, V.FTR, V.FBR, V.FBL)} fill="var(--surface-2)" opacity={0.35} />
      {e(V.BBL, V.BTL, true, 'h1')}
      {e(V.BBL, V.BBR, true, 'h2')}
      {e(V.BBL, V.FBL, true, 'h3')}
      {e(V.FTL, V.FTR, false, 'v1')}
      {e(V.FTR, V.FBR, false, 'v2')}
      {e(V.FBR, V.FBL, false, 'v3')}
      {e(V.FBL, V.FTL, false, 'v4')}
      {e(V.FTL, V.BTL, false, 'v5')}
      {e(V.BTL, V.BTR, false, 'v6')}
      {e(V.BTR, V.FTR, false, 'v7')}
      {e(V.BTR, V.BBR, false, 'v8')}
      {e(V.BBR, V.FBR, false, 'v9')}
    </g>
  )
}

/**
 * Geometry of the x-direction arrow on one face.
 * Normal faces: a pull (force along the outward normal) starts at the face and points outward; a push ends at the face.
 * Shear faces: the arrow lies on the face, centred on the face centre.
 */
export function faceArrow(face: FaceKey, fx: number, len: number): { x1: number; x2: number; y: number } | null {
  if (!Number.isFinite(fx) || Math.abs(len) < 1 || fx === 0) return null
  const f = FACES[face]
  const d = Math.sign(fx)
  const [cx, cy] = f.c
  if (f.family === 'n') {
    if (d === f.sign) return { x1: cx, x2: cx + d * len, y: cy } // pull: outward
    return { x1: cx + f.sign * len, x2: cx, y: cy } // push: from outside onto the face
  }
  return { x1: cx - (d * len) / 2, x2: cx + (d * len) / 2, y: cy }
}

/** The arrow on a face, drawn with the slide's hidden-line convention. */
export function FaceArrow({ face, fx, len, color, width = 2.6 }: { face: FaceKey; fx: number; len: number; color: string; width?: number }) {
  const g = faceArrow(face, fx, len)
  if (!g) return null
  const f = FACES[face]
  if (face === 'L') {
    // the left face lies behind the front face: the part between x = 200 and x = 330 is hidden
    return <HArrow x1={g.x1} x2={g.x2} y={g.y} color={color} width={width} hidden={[V.FTL[0], V.FTR[0]]} />
  }
  return <HArrow x1={g.x1} x2={g.x2} y={g.y} color={color} width={width} allHidden={f.hidden} />
}

/** Edge-length labels and the y–x–z axis triad (as on the slide). */
export function CubeAnnotations({ axes = true }: { axes?: boolean }) {
  return (
    <g>
      <SubText x={265} y={272} text="δx" italic anchor="middle" size={14} fill="var(--ink-2)" />
      <SubText x={412} y={134} text="δy" italic size={14} fill="var(--ink-2)" />
      <SubText x={372} y={236} text="δz" italic size={14} fill="var(--ink-2)" />
      {axes ? (
        <g>
          <line x1={62} y1={300} x2={62} y2={248} stroke="var(--ink-3)" strokeWidth={1.4} />
          <line x1={62} y1={300} x2={118} y2={300} stroke="var(--ink-3)" strokeWidth={1.4} />
          <line x1={62} y1={300} x2={34} y2={324} stroke="var(--ink-3)" strokeWidth={1.4} />
          <text x={56} y={246} fontSize={13} fontStyle="italic" fill="var(--ink-2)" textAnchor="end">y</text>
          <text x={122} y={304} fontSize={13} fontStyle="italic" fill="var(--ink-2)">x</text>
          <text x={26} y={334} fontSize={13} fontStyle="italic" fill="var(--ink-2)">z</text>
        </g>
      ) : null}
    </g>
  )
}

/**
 * Static recreation of the Lecture 10 slide 3 figure: the six x-direction surface forces (numbered 1–6,
 * positive stresses as drawn on the slide) and the body-force components at the upper left.
 */
export function ElementForcesFigure() {
  const L = 56
  const tagPos: Record<FaceKey, Pt> = {
    R: [365 + L + 15, 157.5],
    L: [235 - L - 15, 157.5],
    T: [300, 76],
    B: [300, 240],
    F: [265, 203],
    K: [378, 122],
  }
  return (
    <svg viewBox="0 0 520 340" className="mx-auto block h-auto w-full max-w-[640px]" role="img" aria-label="Differential fluid element with the six x-direction surface forces">
      <g>
        <SubText x={14} y={30} text="δF_{bx} = δm g_x" size={15} italic fill={COL.body} />
        <SubText x={14} y={54} text="δF_{by} = δm g_y" size={15} italic fill={COL.body} />
        <SubText x={14} y={78} text="δF_{bz} = δm g_z" size={15} italic fill={COL.body} />
      </g>
      <CubeOutline />
      {(['B', 'K', 'L', 'R', 'T', 'F'] as FaceKey[]).map((k) => (
        <FaceArrow key={k} face={k} fx={FACES[k].sign} len={L} color={FAMILY_COLOR[FACES[k].family]} />
      ))}
      {FACE_ORDER.map((k) => (
        <Tag key={k} x={tagPos[k][0]} y={tagPos[k][1]} n={FACES[k].n} color={FAMILY_COLOR[FACES[k].family]} />
      ))}
      <CubeAnnotations />
      <g fontSize={11.5} fill="var(--ink-2)">
        <rect x={358} y={276} width={11} height={4} fill={COL.normal} />
        <SubText x={374} y={282} text="σ_xx on x-faces" size={11.5} fill="var(--ink-2)" />
        <rect x={358} y={294} width={11} height={4} fill={COL.shearY} />
        <SubText x={374} y={300} text="τ_yx on y-faces" size={11.5} fill="var(--ink-2)" />
        <rect x={358} y={312} width={11} height={4} fill={COL.shearZ} />
        <SubText x={374} y={318} text="τ_zx on z-faces" size={11.5} fill="var(--ink-2)" />
      </g>
    </svg>
  )
}
