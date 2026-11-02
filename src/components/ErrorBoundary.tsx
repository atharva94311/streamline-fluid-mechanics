import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error(`[${this.props.label ?? 'content'}]`, error)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="my-6 flex gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <div>
          <div className="font-semibold">This section failed to render{this.props.label ? ` (${this.props.label})` : ''}.</div>
          <div className="mt-1 font-mono text-xs opacity-80">{this.state.error.message}</div>
        </div>
      </div>
    )
  }
}
