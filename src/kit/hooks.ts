import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Observe an element's content-box width/height (falls back to 640×360 where ResizeObserver is missing). */
export function useElementSize<T extends HTMLElement>(): [React.RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      setSize((s) => (Math.abs(s.width - r.width) > 0.5 || Math.abs(s.height - r.height) > 0.5 ? { width: r.width, height: r.height } : s))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

/**
 * Run `cb(dtSeconds, elapsedSeconds)` every animation frame while `running` is true.
 * dt is clamped to 0.05 s so a background tab does not make simulations jump.
 */
export function useAnimationFrame(cb: (dt: number, t: number) => void, running = true) {
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    if (!running || typeof requestAnimationFrame === 'undefined') return
    let raf = 0
    let last = performance.now()
    let elapsed = 0
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      elapsed += dt
      cbRef.current(dt, elapsed)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running])
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

/** Pause animations when the element is off-screen (saves CPU on long topic pages). */
export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '200px'): boolean {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}

/** Stable sanitized unique id usable inside url(#...) references. */
let uidCounter = 0
export function useUid(prefix = 'u'): string {
  const [id] = useState(() => `${prefix}${++uidCounter}`)
  return id
}
