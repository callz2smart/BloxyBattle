import { useEffect } from 'react'
import { useDark } from '../app'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onClearInventory: () => void
  onClearWatchlist: () => void
}

export default function SettingsModal({ open, onClose, onClearInventory, onClearWatchlist }: SettingsModalProps) {
  const { dark, toggle } = useDark()

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-animate bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 mb-1">Preferences</p>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white">Settings</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Dark mode */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <p className="text-sm text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Switch between light and dark themes</p>
              </div>
              <button
                onClick={toggle}
                className={`w-12 h-6 rounded-full transition-colors relative ${dark ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>

            {/* Clear inventory */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <p className="text-sm text-slate-900 dark:text-white">Clear Inventory</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Remove all pets from your inventory</p>
              </div>
              <button
                onClick={() => { onClearInventory(); onClose() }}
                className="text-[9px] uppercase tracking-widest px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Clear watchlist */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-slate-900 dark:text-white">Clear Watchlist</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Remove all pets from your watchlist</p>
              </div>
              <button
                onClick={() => { onClearWatchlist(); onClose() }}
                className="text-[9px] uppercase tracking-widest px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 text-center">
            <p className="text-[9px] uppercase tracking-widest text-slate-400">© 2026 PE:INF Database · by <span className="text-indigo-500">@coderhorror</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}