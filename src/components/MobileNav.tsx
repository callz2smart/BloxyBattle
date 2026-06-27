import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/database', label: 'DB' },
  { to: '/pulse',    label: 'Pulse' },
  { to: '/calc',     label: 'Calc' },
  { to: '/blogs',    label: 'Blogs' },
  { to: '/clans',    label: 'Clans' },
]

export default function MobileNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-slate-100 dark:border-white/10 z-[100] px-6 py-4 flex justify-around items-center">
      {NAV.map(({ to, label }) => {
        const active = pathname === to
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 text-[8px] uppercase tracking-widest font-bold ${active ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}