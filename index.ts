export interface Pet {
  id: number
  name: string
  image_filename: string
  value_numeric: number
  value_display: string
  demand: number
  exists_count: string | null
  trend: 'rising' | 'stable' | 'falling'
  rarity: 'huge' | 'legendary' | 'rare' | 'uncommon' | 'common'
  is_hot: boolean
  created_at: string
}

export type SortOption = 'highest' | 'lowest' | 'demand'
export type FilterMode = 'all' | 'inventory' | 'watchlist'

export interface Inventory {
  [petId: number]: number
}

export interface Watchlist {
  [petId: number]: boolean
}