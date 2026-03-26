export default function Header({ viewMode, onViewModeChange, onAddClick }) {
  return (
    <header
      className="bg-espresso border-b"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / title */}
        <div>
          <h1 className="font-display font-[500] text-2xl text-cream tracking-[-0.02em] leading-none">
            CaskBook
          </h1>
          <p className="font-sans text-[10px] text-wheat/40 tracking-[0.14em] uppercase mt-0.5">
            Digital Whiskey Log
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-black/25 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber text-white'
                  : 'text-wheat/40 hover:text-wheat/80'
              }`}
              aria-label="Grid view"
            >
              <GridIcon />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-amber text-white'
                  : 'text-wheat/40 hover:text-wheat/80'
              }`}
              aria-label="List view"
            >
              <ListIcon />
            </button>
          </div>

          {/* Add bottle */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-amber hover:bg-amber/90 text-espresso font-sans font-semibold text-[13px] px-5 py-[11px] rounded-md transition-colors"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span className="hidden sm:inline">Add Bottle</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
