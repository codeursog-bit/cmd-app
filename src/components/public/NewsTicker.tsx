'use client'

interface TickerItem {
  id: string
  label: string
}

export default function NewsTicker({ items }: { items: TickerItem[] }) {
  if (!items.length) return null
  // On duplique la liste pour un défilement en boucle continue (transform -50%)
  const loop = [...items, ...items]

  return (
    <div className="w-full overflow-hidden bg-brand-900 border-y border-brand-800">
      <div className="flex items-stretch">
        <div className="flex items-center gap-2 shrink-0 bg-accent-600 px-6 py-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-white whitespace-nowrap">
            Actualités
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center gap-16 py-3 px-8 whitespace-nowrap animate-marquee w-max">
            {loop.map((item, i) => (
              <span key={`${item.id}-${i}`} className="flex items-center gap-3 font-sans text-sm text-brand-100">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
