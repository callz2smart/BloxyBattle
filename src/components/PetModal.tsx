import { useEffect } from 'react'
import type { Pet, Inventory, Watchlist } from '../types'
import { getImageUrl } from '../lib/seedData'

interface PetModalProps {
  pet: Pet | null
  inventory: Inventory
  watchlist: Watchlist
  onClose: () => void
  onToggleWatchlist: (petId: number, e: React.MouseEvent) => void
  onModifyInventory: (petId: number, delta: number, e: React.MouseEvent) => void
}

const TREND_CONFIG = {
  rising:  { icon: '▲', label: 'Rising',  cls: 'trend-rising',  bar: 'bg-green-500'  },
  stable:  { icon: '●', label: 'Stable',  cls: 'trend-stable',  bar: 'bg-slate-400'  },
  falling: { icon: '▼', label: 'Falling', cls: 'trend-falling', bar: 'bg-red-400'    },
}

export default function PetModal({
  pet, inventory, watchlist, onClose, onToggleWatchlist, onModifyInventory,
}: PetModalProps) {
  useEffect(() => {
    if (!pet) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pet, onClose])

  if (!pet) return null

  const qty = inventory[pet.id] ?? 0
  const inWatchlist = watchlist[pet.id] ?? false
  const trend = TREND_CONFIG[pet.trend]
  const demandPct = (pet.demand / 10) * 100

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-animate bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header image strip */}
        <div className="relative flex">
          {/* Pet image */}
          <div className="w-48 h-48 flex-shrink-0 bg-slate-50 dark:bg-black flex items-center justify-center p-6">
            <img
              src={getImageUrl(pet.image_filename)}
              alt={pet.name}
              className="w-full h-full object-contain"
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
            />
          </div>

          {/* Title + badges */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 mb-1">{pet.rarity} tier</p>
                  <h2 className="text-xl font-normal text-slate-900 dark:text-white leading-tight">{pet.name}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  {pet.is_hot && <span className="hot-badge">HOT</span>}
                  <button
                    onClick={e => onToggleWatchlist(pet.id, e)}
                    className={`text-xl transition-colors ${inWatchlist ? 'text-red-400' : 'text-slate-300 hover:text-red-400'}`}
                  >
                    {inWatchlist ? '♥' : '♡'}
                  </button>
                </div>
              </div>

              {/* Value pill */}
              <div className="inline-flex items-baseline gap-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl px-4 py-2">
                <span className="text-2xl font-bold text-indigo-600">{pet.value_display}</span>
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest">gems</span>
              </div>
            </div>

            {/* Trend */}
            <div className={`flex items-center gap-2 text-sm ${trend.cls}`}>
              <span>{trend.icon}</span>
              <span className="uppercase tracking-wider text-[11px]">{trend.label}</span>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-white/5" />

        {/* Stats grid */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Demand */}
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">Demand</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pet.demand}/10</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="demand-fill h-full rounded-full"
                style={{ width: `${demandPct}%` }}
              />
            </div>
          </div>

          {/* Exists */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
            <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Exists</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">{pet.exists_count ?? '???'}</p>
          </div>

          {/* Rarity */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
            <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Rarity</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white capitalize">{pet.rarity}</p>
          </div>

          {/* Your inventory */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
            <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Your Inventory</p>
            <div className="flex items-center gap-3">
              <button
                onClick={e => qty > 0 && onModifyInventory(pet.id, -1, e)}
                disabled={qty === 0}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center text-lg leading-none disabled:opacity-30 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
              >−</button>
              <span className="text-lg font-medium text-slate-900 dark:text-white w-4 text-center">{qty}</span>
              <button
                onClick={e => onModifyInventory(pet.id, 1, e)}
                className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-lg leading-none hover:bg-indigo-700 transition-colors"
              >+</button>
            </div>
          </div>

          {/* Trend */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
            <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1">Price Trend</p>
            <p className={`text-lg font-medium ${trend.cls}`}>{trend.icon} {trend.label}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-normal hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  )
}