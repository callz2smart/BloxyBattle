import { useState, useCallback } from 'react'
import type { Pet, SortOption, FilterMode, Inventory, Watchlist } from '../types'
import { usePets } from '../hooks/usePets'
import { useLocalStorage } from '../../hooks/UseLocalStorage'
import Header from '../components/Header'
import PetCard from '../components/PetCard'
import PetModal from '../components/PetModal'
import Pagination from '../components/Pagination'
import MobileNav from '../components/MobileNav'
import Toast from '../components/Toast'
import RobloxModal from '../components/RobloxModal'
import SettingsModal from '../components/SettingsModal'

function formatMarketValue(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function Database() {
  const [search,  setSearch]  = useState('')
  const [sort,    setSort]    = useState<SortOption>('highest')
  const [filter,  setFilter]  = useState<FilterMode>('all')
  const [page,    setPage]    = useState(1)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [robloxOpen,   setRobloxOpen]   = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Toast
  const [toastMsg,     setToastMsg]     = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // Persistent state
  const [inventory, setInventory] = useLocalStorage<Inventory>('peinf-inventory', {})
  const [watchlist, setWatchlist] = useLocalStorage<Watchlist>('peinf-watchlist', {})

  const { pets, totalPets, totalValue, totalPages, loading } = usePets({
    sort, filter, search, page, inventory, watchlist,
  })

  // Reset to page 1 on filter/search/sort change
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleSort   = (v: SortOption)  => { setSort(v);   setPage(1) }
  const handleFilter = (v: FilterMode)  => { setFilter(v); setPage(1) }

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2000)
  }, [])

  const handleToggleWatchlist = useCallback((petId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setWatchlist(prev => {
      const next = { ...prev }
      if (next[petId]) {
        delete next[petId]
        showToast('Removed from watchlist')
      } else {
        next[petId] = true
        showToast('Added to watchlist ❤')
      }
      return next
    })
  }, [setWatchlist, showToast])

  const handleModifyInventory = useCallback((petId: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setInventory(prev => {
      const current = prev[petId] ?? 0
      const next = Math.max(0, current + delta)
      const updated = { ...prev }
      if (next === 0) {
        delete updated[petId]
        showToast('Removed from inventory')
      } else {
        updated[petId] = next
        delta > 0 ? showToast(`Added to inventory (x${next})`) : showToast(`Inventory updated (x${next})`)
      }
      return updated
    })
  }, [setInventory, showToast])

  const handleCopyValue = useCallback((value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(value).catch(() => {})
    showToast(`Copied ${value}`)
  }, [showToast])

  const filterLabel: Record<FilterMode, string> = {
    all: 'Database Market',
    inventory: 'My Inventory',
    watchlist: 'Watchlist',
  }

  return (
    <div className="text-slate-900 dark:text-white antialiased min-h-screen">
      <Header
        search={search}   onSearch={handleSearch}
        sort={sort}       onSort={handleSort}
        filter={filter}   onFilter={handleFilter}
        onOpenConnect={() => setRobloxOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="max-w-[1600px] mx-auto px-4 pt-12 pb-12">
        {/* Market stats */}
        <div className="mb-6 px-2 flex items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-slate-400">{filterLabel[filter]}</span>
            <span className="text-[10px] text-indigo-600 font-bold">
              <span>{totalPets}</span> Items • <span>{formatMarketValue(totalValue)}</span>
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-slate-400">
              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Loading
            </div>
          )}
        </div>

        {/* Pet grid */}
        {pets.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-4 content-start">
            {pets.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                inventory={inventory}
                watchlist={watchlist}
                onOpen={setSelectedPet}
                onToggleWatchlist={handleToggleWatchlist}
                onModifyInventory={handleModifyInventory}
                onCopyValue={handleCopyValue}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-4 opacity-20">🐾</div>
            <p className="text-slate-400 text-sm uppercase tracking-widest">No pets found</p>
            <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">
              {search ? `No results for "${search}"` : `Your ${filter} is empty`}
            </p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </main>

      <footer className="max-w-2xl mx-auto px-6 py-12 border-t border-slate-100 dark:border-white/5 mt-20 text-center">
        <div className="text-slate-400 text-[10px] font-normal uppercase tracking-[0.2em] mb-2">
          © 2026 Official PE:INF Website
        </div>
        <div className="text-slate-400 text-[11px] font-normal">
          Created by <span className="text-indigo-500">@coderhorror</span>
        </div>
      </footer>

      {/* Modals */}
      {selectedPet && (
        <PetModal
          pet={selectedPet}
          inventory={inventory}
          watchlist={watchlist}
          onClose={() => setSelectedPet(null)}
          onToggleWatchlist={handleToggleWatchlist}
          onModifyInventory={handleModifyInventory}
        />
      )}

      <RobloxModal open={robloxOpen} onClose={() => setRobloxOpen(false)} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearInventory={() => { setInventory({}); showToast('Inventory cleared') }}
        onClearWatchlist={() => { setWatchlist({}); showToast('Watchlist cleared') }}
      />

      {/* Mobile nav */}
      <MobileNav />

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}