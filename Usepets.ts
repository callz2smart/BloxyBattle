import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SEED_PETS } from '../lib/seedData'
import type { Pet, SortOption, FilterMode, Inventory, Watchlist } from '../types'

const PETS_PER_PAGE = 16

interface UsePetsOptions {
  sort: SortOption
  filter: FilterMode
  search: string
  page: number
  inventory: Inventory
  watchlist: Watchlist
}

export function usePets({ sort, filter, search, page, inventory, watchlist }: UsePetsOptions) {
  const [allPets, setAllPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPets() {
      setLoading(true)
      const url = import.meta.env.VITE_SUPABASE_URL
      if (!url) {
        setAllPets(SEED_PETS)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('pets')
        .select('*')
      if (error || !data?.length) {
        setAllPets(SEED_PETS)
      } else {
        setAllPets(data as Pet[])
      }
      setLoading(false)
    }
    fetchPets()
  }, [])

  // Apply search
  let filtered = allPets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  // Apply filter mode
  if (filter === 'inventory') {
    filtered = filtered.filter(p => (inventory[p.id] ?? 0) > 0)
  } else if (filter === 'watchlist') {
    filtered = filtered.filter(p => watchlist[p.id])
  }

  // Apply sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'highest') return b.value_numeric - a.value_numeric
    if (sort === 'lowest') return a.value_numeric - b.value_numeric
    if (sort === 'demand') return b.demand - a.demand
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PETS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = sorted.slice((safePage - 1) * PETS_PER_PAGE, safePage * PETS_PER_PAGE)

  const totalValue = allPets.reduce((sum, p) => sum + p.value_numeric, 0)

  return { pets: paginated, totalPets: allPets.length, totalValue, totalPages, loading }
}