export default function FilterBar({ activeFilter, onFilterChange, triedCount, wishlistCount }) {
  const tabs = [
    { key: 'tried',    label: 'Tried',    count: triedCount },
    { key: 'wishlist', label: 'Wishlist', count: wishlistCount },
  ]

  return (
    <div className="flex gap-0 border-b mb-10" style={{ borderColor: 'var(--rule)' }}>
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`relative flex items-center gap-2 px-5 py-3 font-sans text-sm font-medium transition-colors ${
            activeFilter === key ? 'text-ink' : 'text-stone hover:text-ink'
          }`}
        >
          {label}
          <span
            className={`font-sans text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
              activeFilter === key ? 'bg-amber text-white' : 'text-stone'
            }`}
            style={activeFilter !== key ? { backgroundColor: 'var(--rule)' } : {}}
          >
            {count}
          </span>
          {activeFilter === key && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  )
}
