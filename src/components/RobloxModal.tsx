import { useState, useEffect } from 'react'

interface RobloxModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'username' | 'verify' | 'done'

export default function RobloxModal({ open, onClose }: RobloxModalProps) {
  const [step, setStep] = useState<Step>('username')
  const [username, setUsername] = useState('')
  const [code] = useState(() => `PEINF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)

  useEffect(() => {
    if (!open) { setStep('username'); setUsername('') }
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 mb-1">Account</p>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white">Connect Roblox</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {step === 'username' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Link your Roblox account to sync your inventory and trade history.
              </p>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Roblox username"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                onClick={() => username.trim() && setStep('verify')}
                disabled={!username.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-normal hover:bg-indigo-700 transition-all disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add this code to your Roblox profile bio to verify ownership:
              </p>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                <code className="text-indigo-600 font-normal tracking-widest text-sm">{code}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors text-[9px] uppercase tracking-widest border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg"
                >
                  Copy
                </button>
              </div>
              <ol className="text-[11px] text-slate-400 space-y-1.5 list-decimal list-inside">
                <li>Go to your Roblox profile settings</li>
                <li>Paste the code into your bio/description</li>
                <li>Click Verify below</li>
              </ol>
              <div className="flex gap-3">
                <button onClick={() => setStep('username')} className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-sm font-normal hover:bg-slate-200 dark:hover:bg-white/20 transition-all">
                  Back
                </button>
                <button onClick={() => setStep('done')} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-normal hover:bg-indigo-700 transition-all">
                  Verify
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-normal text-slate-900 dark:text-white mb-1">Connected!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{username} linked successfully.</p>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-normal hover:bg-indigo-700 transition-all">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}