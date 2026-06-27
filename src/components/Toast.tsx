import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    if (visible) {
      setAnimClass('toast-in')
    } else {
      setAnimClass('toast-out')
    }
  }, [visible])

  if (!visible && animClass === '') return null

  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[200] bg-indigo-600 text-white px-6 py-3 rounded-2xl font-normal text-sm pointer-events-none ${animClass}`}
      style={{ transform: 'translateX(-50%)' }}
    >
      {message}
    </div>
  )
}