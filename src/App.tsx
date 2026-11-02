import { useEffect, useState } from 'react'
import { useRoute } from '@/lib/router'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SearchDialog } from '@/components/SearchDialog'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Home } from '@/pages/Home'
import { TopicPage } from '@/pages/TopicPage'
import { Syllabus } from '@/pages/Syllabus'
import { FormulaSheet } from '@/pages/FormulaSheet'
import { PracticeBank } from '@/pages/PracticeBank'
import { Revision } from '@/pages/Revision'

export default function App() {
  const route = useRoute()
  const [menu, setMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (route.name !== 'topic' || !route.concept) window.scrollTo({ top: 0 })
  }, [route.name, route.name === 'topic' ? route.id : '']) // eslint-disable-line react-hooks/exhaustive-deps

  let page
  switch (route.name) {
    case 'home':
      page = <Home />
      break
    case 'topic':
      page = <TopicPage id={route.id} concept={route.concept} />
      break
    case 'syllabus':
      page = <Syllabus />
      break
    case 'formulas':
      page = <FormulaSheet />
      break
    case 'practice':
      page = <PracticeBank />
      break
    case 'revision':
      page = <Revision tab={route.tab} />
      break
    default:
      page = (
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Page not found</h1>
          <a href="#/" className="mt-4 inline-block text-indigo-600 underline">
            Back to the dashboard
          </a>
        </div>
      )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMenu(true)} onSearch={() => setSearchOpen(true)} />
        <main className="flex-1">
          <ErrorBoundary key={JSON.stringify(route)} label={route.name}>
            {page}
          </ErrorBoundary>
        </main>
        <footer className="no-print border-t border-line px-6 py-5 text-center text-xs text-ink-3">
          Built from the CH21207 lecture slides (Lec 9–13), Fox &amp; McDonald’s and Wilkes Ch. 9. Content marked
          <span className="mx-1 rounded-full border border-dashed border-fuchsia-300 px-1.5 text-fuchsia-600 dark:text-fuchsia-300">✦ Supplementary</span>
          is explanation added by this platform; green chips cite the exact PDF slide or page.
        </footer>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
