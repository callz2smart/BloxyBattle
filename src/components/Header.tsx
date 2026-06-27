import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDark } from '../app'
import type { SortOption, FilterMode } from '../types'

interface HeaderProps {
  search: string
  onSearch: (v: string) => void
  sort: SortOption
  onSort: (v: SortOption) => void
  filter: FilterMode
  onFilter: (v: FilterMode) => void
  onOpenConnect: () => void
  onOpenSettings: () => void
}

const SORT_LABELS: Record<SortOption, string> = {
  highest: 'Highest Value',
  lowest: 'Lowest Value',
  demand: 'Highest Demand',
}

const FILTER_LABELS: Record<FilterMode, string> = {
  all: 'All Rarities',
  inventory: 'My Inventory',
  watchlist: 'Watchlist ❤',
}

function Dropdown<T extends string>({
  value,
  options,
  labels,
  onSelect,
}: {
  value: T
  options: T[]
  labels: Record<T, string>
  onSelect: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-300 text-[10px] font-normal uppercase tracking-widest"
      >
        {labels[value]}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl z-[100] py-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest transition-colors
                ${value === opt ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              {labels[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header({
  search, onSearch,
  sort, onSort,
  filter, onFilter,
  onOpenConnect, onOpenSettings,
}: HeaderProps) {
  const { toggle } = useDark()
  const location = useLocation()
  const [dbOpen, setDbOpen] = useState(false)
  const dbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dbRef.current && !dbRef.current.contains(e.target as Node)) setDbOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-[70] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
      <div className="max-w-[1600px] mx-auto">

        {/* Top bar */}
        <div className="px-4 py-3 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
          <div className="flex gap-6 items-center">

            {/* Database dropdown */}
            <div className="relative" ref={dbRef}>
              <button
                onClick={() => setDbOpen(o => !o)}
                className="text-[10px] font-normal uppercase tracking-[0.15em] text-indigo-600 flex items-center gap-1 outline-none"
              >
                Database
                <svg className={`w-3 h-3 transition-transform ${dbOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {dbOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl z-[100] py-2">
                  <Link to="/database" onClick={() => setDbOpen(false)} className={`block px-4 py-2 text-[9px] uppercase tracking-widest transition-colors ${isActive('/database') ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>
                    Pet Database
                  </Link>
                  <a href="#" className="block px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Market Pulse</a>
                  <a href="#" className="block px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Calculator</a>
                </div>
              )}
            </div>

            <a href="#" className="text-[10px] font-normal uppercase tracking-[0.15em] text-slate-400 hover:text-indigo-600 transition-colors">Blogs</a>
            <a href="#" className="text-[10px] font-normal uppercase tracking-[0.15em] text-slate-400 hover:text-indigo-600 transition-colors">Clans</a>
          </div>

          <div className="flex gap-4 items-center">
            {/* Dark mode toggle */}
            <button onClick={toggle} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <button
              onClick={onOpenConnect}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] uppercase tracking-widest font-normal hover:bg-indigo-700 transition-all"
            >
              Connect
            </button>

            <button onClick={onOpenSettings} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0" />
              </svg>
            </button>

            <a href="#" className="text-[10px] font-normal uppercase tracking-[0.15em] text-slate-400 hover:text-indigo-600 transition-colors">Credits</a>
          </div>
        </div>

        {/* Search + filters bar */}
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-grow max-w-xl relative">
            <input
              type="text"
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search pets..."
              className="w-full bg-white dark:bg-black px-5 py-2.5 rounded-full text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all border border-slate-200 dark:border-white/15"
            />
            {search && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Dropdown
              value={sort}
              options={['highest', 'lowest', 'demand'] as SortOption[]}
              labels={SORT_LABELS}
              onSelect={onSort}
            />
            <Dropdown
              value={filter}
              options={['all', 'inventory', 'watchlist'] as FilterMode[]}
              labels={FILTER_LABELS}
              onSelect={onFilter}
            />
          </div>
        </div>
      </div>
    </header>
  )
}