interface PaginationProps {
  page: number
  totalPages: number
  onPage: (p: number) => void
}

export default function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-8 pb-20 md:pb-0">
      <div className="flex items-center gap-4 bg-white dark:bg-black border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={page}
            min={1}
            max={totalPages}
            onChange={e => {
              const v = parseInt(e.target.value)
              if (!isNaN(v) && v >= 1 && v <= totalPages) onPage(v)
            }}
            className="w-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg text-center text-sm py-1 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
          />
          <span className="text-slate-400 text-xs uppercase tracking-widest">of {totalPages}</span>
        </div>

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}