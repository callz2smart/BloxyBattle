import { useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initial
    } catch {
      return initial
    }
  })

  const setValue = (val: T | ((prev: T) => T)) => {
    const nextValue = typeof val === 'function' ? (val as (prev: T) => T)(state) : val
    setState(nextValue)
    try {
      localStorage.setItem(key, JSON.stringify(nextValue))
    } catch {
      // storage full or unavailable
    }
  }

  return [state, setValue]
}