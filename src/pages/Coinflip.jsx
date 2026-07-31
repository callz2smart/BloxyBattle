import { useEffect, useState, useRef } from 'react'
import { Settings, ChevronDown } from 'lucide-react'
import { connectSocket } from '../lib/socket'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../store/auth'
import CoinflipCreateModal from '../components/CoinflipCreateModal'
import CoinflipJoinModal from '../components/CoinflipJoinModal'

const DEFAULT_AVATAR = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-7E27815C7C5F72DA623094CFB3768D15-Png/420/420/AvatarHeadshot/Png/noFilter'

function formatCoinflipValue(value) {
  const numericValue = Number(value ?? 0)
  if (!Number.isFinite(numericValue)) return '0'

  if (numericValue >= 1_000_000) {
    return `${(numericValue / 1_000_000).toFixed(2).replace(/\.0+$/, '').replace(/(\.\d)0+$/, '$1')}M`
  }

  if (numericValue >= 1_000) {
    return `${(numericValue / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }

  return numericValue.toLocaleString('en-US')
}

function parseCoinflipValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  const raw = String(value ?? '').trim().toUpperCase()
  if (!raw) return 0

  const cleaned = raw.replace(/,/g, '')
  const number = Number(cleaned.replace(/[MK]/g, ''))
  if (!Number.isFinite(number)) return 0

  if (cleaned.includes('M')) return number * 1_000_000
  if (cleaned.includes('K')) return number * 1_000
  return number
}

function getRoomValueDetails(room) {
  const itemValue = Array.isArray(room?.creator_items)
    ? room.creator_items.reduce((sum, item) => sum + Number(item?.value ?? 0), 0)
    : 0

  const fallbackValue = parseCoinflipValue(room?.value ?? room?.total_value ?? room?.totalValue ?? room?.numericValue ?? 0)
  const numericValue = fallbackValue > 0 ? fallbackValue : itemValue
  const range = room?.range || room?.value_range || `${formatCoinflipValue(numericValue * 0.9)} - ${formatCoinflipValue(numericValue * 1.1)}`

  return {
    numericValue,
    displayValue: formatCoinflipValue(numericValue),
    range,
  }
}

function normalizeRoom(room) {
  if (!room) return null

  const roomId = room.id || room.room_id || null
  const fingerprint = [room.creator_uuid, room.creator_username, room.creator_side, room.created_at, room.creator_items?.length ?? 0]
    .filter((value) => value !== null && value !== undefined && value !== '')
    .join('::')
  const valueDetails = getRoomValueDetails(room)

  const creatorAvatarUrl = room.creator_avatar_url || room.creator_avatar || room.player1?.avatar_headshot_url || room.player1?.avatar_headshot || room.player1?.avatar || room.player1?.avatar_url || null
  const opponentAvatarUrl = room.opponent_avatar_url || room.opponent_avatar || room.player2?.avatar_headshot_url || room.player2?.avatar_headshot || room.player2?.avatar || room.player2?.avatar_url || null

  return {
    ...room,
    id: roomId || fingerprint || `room-${Date.now()}`,
    creator_avatar_url: creatorAvatarUrl,
    opponent_avatar_url: opponentAvatarUrl,
    numericValue: valueDetails.numericValue,
    value: valueDetails.displayValue,
    total_value: valueDetails.numericValue,
    range: valueDetails.range,
  }
}

export default function Coinflip() {
  const [sortBy, setSortBy] = useState('Highest to Lowest')
  const [createOpen, setCreateOpen] = useState(false)
  const [joinRoom, setJoinRoom] = useState(null)
  const [rooms, setRooms] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    const upsertRoom = (incomingRoom) => {
      const room = normalizeRoom(incomingRoom)
      if (!room) return

      setRooms((prev) => {
        const existingIndex = prev.findIndex((existing) => {
          const nextId = room.id
          const currentId = existing.id || existing.room_id
          if (nextId && currentId && nextId === currentId) return true

          const currentFingerprint = [existing.creator_uuid, existing.creator_username, existing.creator_side, existing.created_at, existing.creator_items?.length ?? 0]
            .filter((value) => value !== null && value !== undefined && value !== '')
            .join('::')

          return currentFingerprint && currentFingerprint === [room.creator_uuid, room.creator_username, room.creator_side, room.created_at, room.creator_items?.length ?? 0]
            .filter((value) => value !== null && value !== undefined && value !== '')
            .join('::')
        })

        if (existingIndex >= 0) {
          const nextRooms = [...prev]
          nextRooms[existingIndex] = { ...nextRooms[existingIndex], ...room }
          return nextRooms
        }

        // mark as new so UI can animate
        const newRoom = { ...room, isNew: true }
        // schedule clearing the isNew flag after animation
        setTimeout(() => {
          setRooms((cur) => cur.map((r) => (r.id === newRoom.id ? { ...r, isNew: false } : r)))
        }, 700)

        return [newRoom, ...prev]
      })
    }

    const handleCreated = (room) => {
      try {
        upsertRoom(room)
      } catch (err) {
        console.warn('[coinflip] handleCreated error', err)
      }
    }

    const handleUpdated = (room) => {
      if (!room) return
      setRooms((prev) => prev.map((existing) => (existing.id === room.id ? { ...existing, ...room } : existing)))
    }

    socket.on('coinflip:created', handleCreated)
    socket.on('coinflip:updated', handleUpdated)

    return () => {
      socket.off('coinflip:created', handleCreated)
      socket.off('coinflip:updated', handleUpdated)
    }
  }, [])

  // Derived stats for the stat cards
  const activeRoomsCount = rooms.filter((r) => !r.canceled && !r.result).length
  const totalValueSum = rooms.reduce((sum, r) => sum + Number(r.total_value ?? r.numericValue ?? 0), 0)
  const totalItemsCount = rooms.reduce((sum, r) => sum + (Array.isArray(r.creator_items) ? r.creator_items.length : 0) + (Array.isArray(r.opponent_items) ? r.opponent_items.length : 0), 0)

  // Load active coinflip rooms from Supabase on initial load so state persists across refreshes
  useEffect(() => {
    let isMounted = true
    const loadRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('coinflip_games')
          .select('*')
          .eq('canceled', false)
          .is('result', null)
          .order('created_at', { ascending: false })

        if (!isMounted) return
        if (error) {
          console.warn('[coinflip] failed to load rooms', error)
          return
        }

        const normalized = Array.isArray(data) ? data.map(normalizeRoom).filter(Boolean) : []
        setRooms((prev) => {
          // merge existing rooms with fetched ones, preferring fetched
          const byId = new Map()
          for (const r of prev) byId.set(r.id, r)
          for (const r of normalized) byId.set(r.id, r)
          return Array.from(byId.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        })
      } catch (err) {
        console.warn('[coinflip] loadRooms error', err)
      }
    }

    void loadRooms()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-transparent">
      <style>{`
        @keyframes coinflip-slide-in { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div className="relative z-10 p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-4">
          <StatCard
            icon="/assets/room-icon.png"
            value={String(activeRoomsCount)}
            label="Active Rooms"
            gradient="rgba(108, 99, 255, 0.22)"
            bgColor="rgba(108, 99, 255, 0.04)"
            showIcon={false}
          />
          <StatCard
            icon="/bobux.png"
            value={String(totalValueSum.toLocaleString('en-US'))}
            label="Total Value"
            gradient="rgba(255, 216, 77, 0.22)"
            bgColor="rgba(255, 216, 77, 0.04)"
          />
          <StatCard
            icon="/assets/items-icon.png"
            value={String(totalItemsCount)}
            label="Total Items"
            gradient="rgba(108, 99, 255, 0.22)"
            bgColor="rgba(108, 99, 255, 0.04)"
            showIcon={false}
          />
        </div>

        {/* Mobile Controls */}
        <div className="flex flex-col gap-2 sm:hidden mb-4">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-5 text-sm font-semibold rounded-md border border-[#5E55D9]/40 bg-[linear-gradient(135deg,#6C63FF_0%,#5147D9_100%)] text-white shadow-[0_2px_8px_rgba(108,99,255,0.25)] hover:opacity-90"
          >
              Create
            </button>
            <button className="h-9 px-5 text-sm font-semibold rounded-md bg-[#2a2e44] text-[#E1E4F2] hover:opacity-90">
              Recent
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-md bg-[#2a2e44] text-[#E1E4F2] hover:opacity-90">
              <Settings size={18} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 px-3 bg-[#20222f] text-sm font-semibold text-[#E1E4F2] rounded-md h-9">
            <span className="flex items-center gap-1">
              <img src="/heads.png" alt="heads" className="h-4 w-4" />
              50
            </span>
            <span className="flex items-center gap-1">
              <img src="/tails.png" alt="tails" className="h-4 w-4" />
              50
            </span>
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} className="w-full" />
        </div>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-2.5 mb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="min-w-24 h-9 px-5 text-sm font-semibold rounded-md border border-[#5E55D9]/40 bg-[linear-gradient(135deg,#6C63FF_0%,#5147D9_100%)] text-white shadow-[0_2px_8px_rgba(108,99,255,0.25)] hover:opacity-90"
            >
              Create
            </button>
            <button className="min-w-24 h-9 px-5 text-sm font-semibold rounded-md bg-[#2a2e44] text-[#E1E4F2] hover:opacity-90">
              Recent
            </button>
            <button className="h-9 w-10 flex items-center justify-center rounded-md bg-[#2a2e44] text-[#E1E4F2] hover:opacity-90">
              <Settings size={18} />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 bg-[#20222f] text-sm font-semibold text-[#E1E4F2] rounded-md h-9">
              <span className="flex items-center gap-1">
                <img src="/heads.png" alt="heads" className="h-4 w-4" />
                50
              </span>
              <span className="flex items-center gap-1">
                <img src="/tails.png" alt="tails" className="h-4 w-4" />
                50
              </span>
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} className="w-44" />
          </div>
        </div>

        {/* Room Cards */}
        <div className="flex flex-col gap-2">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-[#9ca9d6]">No active rooms. Create one to get started.</div>
          ) : (
            rooms
              .slice()
              .sort((a, b) => {
                const aVal = Number(a.numericValue ?? 0)
                const bVal = Number(b.numericValue ?? 0)
                if (sortBy === 'Highest to Lowest') return bVal - aVal
                if (sortBy === 'Lowest to Highest') return aVal - bVal
                return 0
              })
              .map((room) => <RoomCard key={room.id} room={room} onJoin={() => setJoinRoom(room)} />)
          )}
        </div>
      </div>
      {createOpen && <CoinflipCreateModal onClose={() => setCreateOpen(false)} onCreate={(room) => {
        const normalized = normalizeRoom(room)
        if (!normalized) return
        setRooms((prev) => {
          const existingIndex = prev.findIndex((existing) => {
            const nextId = normalized.id
            const currentId = existing.id || existing.room_id
            if (nextId && currentId && nextId === currentId) return true

            const currentFingerprint = [existing.creator_uuid, existing.creator_username, existing.creator_side, existing.created_at, existing.creator_items?.length ?? 0]
              .filter((value) => value !== null && value !== undefined && value !== '')
              .join('::')

            return currentFingerprint && currentFingerprint === [normalized.creator_uuid, normalized.creator_username, normalized.creator_side, normalized.created_at, normalized.creator_items?.length ?? 0]
              .filter((value) => value !== null && value !== undefined && value !== '')
              .join('::')
          })

          if (existingIndex >= 0) {
            const nextRooms = [...prev]
            nextRooms[existingIndex] = { ...nextRooms[existingIndex], ...normalized }
            return nextRooms
          }

          const newRoom = { ...normalized, isNew: true }
          setTimeout(() => {
            setRooms((cur) => cur.map((r) => (r.id === newRoom.id ? { ...r, isNew: false } : r)))
          }, 700)

          return [newRoom, ...prev]
        })
      }} />}
      {joinRoom && (
        <CoinflipJoinModal
          room={joinRoom}
          onClose={() => setJoinRoom(null)}
          onJoin={() => setJoinRoom(null)}
        />
      )}
    </div>
  )
}

function StatCard({ icon, value, label, gradient, bgColor, showIcon = true }) {
  return (
    <div
      className="flex items-start justify-start gap-3 rounded-md p-3"
      style={{
        background: `radial-gradient(circle at 100% 100%, ${gradient} 0%, rgba(108, 99, 255, 0.16) 24%, rgba(108, 99, 255, 0.09) 52%, rgba(108, 99, 255, 0.04) 68%, transparent 82%), rgb(27, 31, 46)`,
      }}
    >
      <div className="flex w-full flex-col items-start justify-center text-left">
        <span className="flex items-center justify-start gap-2 text-left text-lg font-bold text-white">
          {showIcon && icon && <img src={icon} alt="" className="h-5 w-5" />}
          {value}
        </span>
        <span className="text-left text-xs text-white">{label}</span>
      </div>
    </div>
  )
}

function SortDropdown({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const options = ['Highest to Lowest', 'Lowest to Highest']

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-md bg-[#20222f] px-3 text-sm text-[#E1E4F2] shadow-none transition-none hover:bg-[#20222f] focus:border-0 focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`text-[#E1E4F2] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute z-20 mt-1 w-full overflow-hidden rounded-md bg-[#20222f] p-1 shadow-none transition-all duration-200 ease-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              onChange(option)
              setIsOpen(false)
            }}
            className={`mx-0 my-0.5 flex w-full items-center rounded-[6px] px-3 py-2 text-left text-sm text-[#E1E4F2] transition-all duration-200 ease-out hover:bg-[#222531] ${value === option ? 'bg-[#222531]' : 'bg-transparent'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function RoomCard({ room, onJoin }) {
  const user = useAuth((state) => state.user)
  const creatorSide = String(room.creator_side || 'heads').toLowerCase()
  const opponentSide = String(room.opponent_side || (creatorSide === 'heads' ? 'tails' : 'heads')).toLowerCase()

  const creatorAvatarUrl = room.creator_avatar_url || room.creator_avatar || room.player1?.avatar_headshot_url || room.player1?.avatar_headshot || room.player1?.avatar || room.player1?.avatar_url || null
  const opponentAvatarUrl = room.opponent_avatar_url || room.opponent_avatar || room.player2?.avatar_headshot_url || room.player2?.avatar_headshot || room.player2?.avatar || room.player2?.avatar_url || null

  const player1 = {
    avatar: creatorAvatarUrl,
    items: (room.creator_items || room.player1?.items || []).map((i) => i?.image_url || i?.image || i) || [],
    side: String(room.creator_side || room.player1?.side || creatorSide).toLowerCase(),
  }

  const player2 = {
    avatar: opponentAvatarUrl,
    items: (room.opponent_items || room.player2?.items || []).map((i) => i?.image_url || i?.image || i) || [],
    side: String(room.opponent_side || room.player2?.side || opponentSide).toLowerCase(),
  }

  const displayItems = (player1.items?.length ? player1.items : player2.items || []).slice(0, 5)
  const hiddenItemCount = Math.max(((player1.items?.length ? player1.items : player2.items) || []).length - displayItems.length, 0)
  const canJoin = !room.opponent_uuid && !room.canceled
  const currentUserId = String(user?.profile_id || user?.id || '')
  const isCreator = Boolean(currentUserId && (currentUserId === String(room.creator_uuid || '')))
  const joinDisabled = !canJoin || isCreator
  const isCompleted = Boolean(room.opponent_uuid && room.result)
  const winner = isCompleted ? room.result || room.winner || null : null

  return (
    <div
      className="relative grid grid-cols-1 items-center gap-2 rounded-lg border border-solid border-[#252839] bg-[#1c1f2e] py-3 pl-6 pr-2.5 xl:grid-cols-[repeat(5,auto)] [&>*]:min-w-0 overflow-hidden"
      style={room.isNew ? { animation: 'coinflip-slide-in .45s ease' } : undefined}
    >
      {/* Player VS Display */}
      <div className="flex items-center gap-3 justify-self-center xl:justify-self-start">
        <div className={`relative box-border h-14 w-14 flex-[0_0_auto] rounded-full border-2 bg-[#1C1F2E] transition-colors ${winner === 'tails' ? 'border-[#6c63ff]' : 'border-[#2F3347]'} ${isCompleted && winner !== 'tails' ? 'opacity-60' : ''}`}>
          <img
            src={player1.avatar || DEFAULT_AVATAR}
            alt="player1"
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            draggable={false}
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_AVATAR
            }}
          />
          <div className="absolute right-0 top-0 h-7 w-7 overflow-hidden rounded-full" style={{ transform: 'translate(25%, -25%)' }}>
            <img className="block w-full h-full object-contain" alt={player1.side || 'coin'} src={player1.side === 'tails' ? '/tails.png' : '/heads.png'} />
          </div>
        </div>
        <strong className="text-lg font-bold text-[#B0B8C1]">VS</strong>
        <div className={`relative box-border h-14 w-14 flex-[0_0_auto] rounded-full border-2 bg-[#1C1F2E] transition-colors ${winner === 'heads' ? 'border-[#6c63ff]' : 'border-[#2F3347]'} ${isCompleted && winner !== 'heads' ? 'opacity-60' : ''}`}>
          {player2.avatar ? (
            <img
              src={player2.avatar}
              alt="player2"
              className="box-border block w-full h-full object-cover rounded-full"
              loading="lazy"
              draggable={false}
              referrerPolicy="no-referrer"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_AVATAR
              }}
            />
          ) : (
            <div className="box-border flex h-full w-full items-center justify-center rounded-full bg-[#171925]">
              <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
                <circle cx="32" cy="32" r="32" fill="#1c1f2e" />
                <circle cx="22" cy="32" r="4" fill="#6C63FF">
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin="0s" />
                </circle>
                <circle cx="32" cy="32" r="4" fill="#6C63FF">
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin="0.4s" />
                </circle>
                <circle cx="42" cy="32" r="4" fill="#6C63FF">
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin="0.8s" />
                </circle>
              </svg>
            </div>
          )}
          <div className="absolute right-0 top-0 h-7 w-7 overflow-hidden rounded-full" style={{ transform: 'translate(25%, -25%)' }}>
            <img className="block w-full h-full object-contain" alt={player2.side || 'coin'} src={player2.side === 'tails' ? '/tails.png' : '/heads.png'} />
          </div>
        </div>
      </div>

      {/* Items Display */}
      <div className="flex justify-self-center xl:grid xl:grid-cols-5 xl:justify-self-start">
        {displayItems.map((item, idx) => {
          const isLastVisibleItem = idx === displayItems.length - 1 && hiddenItemCount > 0

          return (
            <div
              key={`items-${idx}`}
              className="relative box-border block h-14 w-14 flex-[0_0_auto] cursor-pointer overflow-hidden rounded-[5px] border-2 border-solid border-[#2F3347] bg-[#171925] transition-colors duration-200 hover:border-[#6c63ff] xl:[transform:var(--shift)] max-xl:[&+*]:-ml-5"
              title={item?.name || ''}
              style={{ '--shift': `translate(${idx * -35.7}%)` }}
            >
              <img src={item} alt="" className="block h-full w-full object-contain scale-100" />

              {isLastVisibleItem && (
                <div
                  className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-[5px] text-sm font-semibold text-white"
                  style={{ backdropFilter: 'blur(2px)', background: 'rgba(15, 18, 30, 0.82)' }}
                >
                  +{hiddenItemCount}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Value Display */}
      <div className="w-32 place-self-center text-center font-bold">
        <p className="inline-flex items-center gap-2 text-[1.375rem] leading-normal text-white">
          <img src="/bobux.png" className="w-5 text-[#6c63ff]" alt="bobux" />
          <span>{room.value ?? room.total_value ?? ''}</span>
        </p>
        <p className="text-sm leading-normal text-[#CCC]">{room.range ?? room.value_range ?? ''}</p>
      </div>

      {/* Winner Indicator */}
      <div className="relative justify-self-center xl:w-14 xl:h-14 w-14 h-14">
        {isCompleted ? (
          <img className="w-full h-full object-cover" alt="result" src={winner === 'heads' ? '/heads.png' : '/tails.png'} />
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 justify-self-center xl:ml-auto xl:flex-col xl:justify-self-end">
        <button
          className="min-w-24 rounded-md border border-solid px-5 text-base font-semibold transition-none h-[34px] leading-[34px] py-0 cursor-pointer border-[#5E55D9]/40 bg-[linear-gradient(135deg,#6C63FF_0%,#5147D9_100%)] text-white shadow-[0_2px_8px_rgba(108,99,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={() => { if (!joinDisabled && typeof onJoin === 'function') onJoin() }}
          disabled={joinDisabled}
        >
          Join
        </button>
        <button className="min-w-24 rounded-md border border-solid px-5 text-base font-semibold transition-none h-[34px] leading-[34px] py-0 cursor-pointer border-[#2D314A] bg-[#2a2e44] text-[#E1E4F2] shadow-none hover:opacity-90">
          View
        </button>
      </div>
    </div>
  )
}
