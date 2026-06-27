import { useRef } from 'react'
import type { Pet, Inventory, Watchlist } from '../types'
import { getImageUrl } from '../lib/seedData'

interface PetCardProps {
  pet: Pet
  inventory: Inventory
  watchlist: Watchlist
  onOpen: (pet: Pet) => void
  onToggleWatchlist: (petId: number, e: React.MouseEvent) => void
  onModifyInventory: (petId: number, delta: number, e: React.MouseEvent) => void
  onCopyValue: (value: string, e: React.MouseEvent) => void
}

const TREND_ICONS = {
  rising:  { icon: '▲', label: 'Rising',  cls: 'trend-rising'  },
  stable:  { icon: '●', label: 'Stable',  cls: 'trend-stable'  },
  falling: { icon: '▼', label: 'Falling', cls: 'trend-falling' },
}

export default function PetCard({
  pet, inventory, watchlist, onOpen, onToggleWatchlist, onModifyInventory, onCopyValue,
}: PetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const qty = inventory[pet.id] ?? 0
  const inWatchlist = watchlist[pet.id] ?? false
  const trend = TREND_ICONS[pet.trend]

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -6
    const rotY = ((x - cx) / cx) * 6
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }

  return (
    <div
      ref={cardRef}
      className={`pet-card shine-effect rarity-${pet.rarity} group overflow-hidden flex flex-col p-2 cursor-pointer transition-all`}
      onClick={() => onOpen(pet)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image area */}
      <div className="relative rounded-none overflow-hidden mb-3 aspect-square">
        {/* Inventory badge */}
        {qty > 0 && (
          <div className="inventory-badge">
            <span>x{qty}</span>
          </div>
        )}

        {/* Watchlist heart */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWatchlist(pet.id, e) }}
          className={`absolute top-0 right-0 z-20 p-2 text-sm transition-colors ${inWatchlist ? 'text-red-400' : 'text-slate-300 hover:text-red-400'}`}
        >
          {inWatchlist ? '♥' : '♡'}
        </button>

        <img
          src={getImageUrl(pet.image_filename)}
          alt={pet.name}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />

        {/* Quick add hover bar */}
        <div
          onClick={e => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex border-t border-slate-100 dark:border-white/10"
        >
          <button
            onClick={e => onModifyInventory(pet.id, 1, e)}
            className="flex-grow py-2 text-[10px] uppercase tracking-widest text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
          >
            + Quick Add
          </button>
          {qty > 0 && (
            <button
              onClick={e => onModifyInventory(pet.id, -1, e)}
              className="px-3 py-2 text-[10px] text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-l border-slate-100 dark:border-white/10"
            >
              −
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-2 pb-2">
        <h3 className="text-[12px] font-normal text-slate-900 dark:text-white mb-3 tracking-tight flex items-center justify-between gap-2 min-w-0">
          <span className="truncate" title={pet.name}>{pet.name}</span>
          {pet.is_hot && <span className="hot-badge">HOT</span>}
        </h3>

        <div className="space-y-2">
          <div
            className="flex justify-between items-center text-[10px] cursor-copy"
            onClick={e => { e.stopPropagation(); onCopyValue(pet.value_display, e) }}
            title="Click to copy value"
          >
            <span className="text-slate-400">Value</span>
            <span className="text-indigo-600 text-xs font-medium">{pet.value_display}</span>
          </div>

          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Demand</span>
            <span className="text-slate-700 dark:text-slate-300">{pet.demand}/10</span>
          </div>

          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Exists</span>
            <span className="text-slate-700 dark:text-slate-300">{pet.exists_count ?? '???'}</span>
          </div>

          <div className="flex justify-between items-center text-[8px] pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-slate-400 uppercase">Trend</span>
            <span className={`uppercase tracking-tighter ${trend.cls}`}>
              {trend.icon} {trend.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}