import type { ComponentProps } from 'react'
import { Readout } from '@/kit'

/**
 * The kit's Readout prints its labels in CSS upper case, which would also upper-case TeX symbols
 * (ψ → Ψ, α → A, u → U). This wrapper keeps KaTeX inside the labels in normal case.
 */
export function TeXReadout(props: ComponentProps<typeof Readout>) {
  return (
    <div className="[&_.katex]:normal-case">
      <Readout {...props} />
    </div>
  )
}
