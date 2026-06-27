import { createContext, useContext, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/UseLocalStorage'
import Database from './pages/Database'

interface DarkModeCtx {
  dark: boolean
  toggle: () => void
}

const DarkCtx = createContext<DarkModeCtx>({ dark: false, toggle: () => {} })
export const useDark = () => useContext(DarkCtx)

export default function App() {
  const [dark, setDark] = useLocalStorage<boolean>('peinf-dark', false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <DarkCtx.Provider value={{ dark, toggle: () => setDark(!dark) }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/database" replace />} />
          <Route path="/database" element={<Database />} />
          <Route path="*" element={<Navigate to="/database" replace />} />
        </Routes>
      </BrowserRouter>
    </DarkCtx.Provider>
  )
}