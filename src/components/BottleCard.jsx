import TasteNotes from './TasteNotes.jsx'

const TYPE_LABEL = {
  bourbon:  'Bourbon',
  rye:      'Rye',
  scotch:   'Scotch',
  irish:    'Irish',
  japanese: 'Japanese',
  other:    'Other',
}

export default function BottleCard({ bottle, viewMode, onEdit, onDelete }) {
  const { name, distillery, type, proof, price, status, rating, notes } = bottle

  if (viewMode === 'list') {
    return (
      <div
        className="group flex items-center gap-4 bg-espresso rounded-xl px-5 py-4 border cursor-pointer hover:border-amber/25 transition-colors"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        onClick={() => onEdit(bottle)}
      >
        {/* Status dot */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            status === 'tried' ? 'bg-amber' : 'bg-stone'
          }`}
        />

        {/* Name + distillery */}
        <div className="flex-1 min-w-0">
          <p className="font-display italic text-cream text-[16px] leading-snug truncate">
            {name}
          </p>
          <p className="font-sans text-[11px] text-wheat/50 truncate mt-0.5">
            {distillery}&nbsp;·&nbsp;{TYPE_LABEL[type] || type}
          </p>
        </div>

        {/* Chips */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="chip">{proof}° proof</span>
          <span className="chip">${price}</span>
        </div>

        {/* Rating */}
        {status === 'tried' && rating !== null && (
          <div className="flex items-baseline gap-0.5 flex-shrink-0">
            <span className="font-sans font-bold text-[18px] leading-none text-amber">
              {rating}
            </span>
            <span className="font-sans text-[10px] text-wheat/50">/10</span>
          </div>
        )}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(bottle.id)
          }}
          className="flex-shrink-0 p-1.5 rounded-md text-stone hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Delete bottle"
        >
          <TrashIcon />
        </button>
      </div>
    )
  }

  // Grid mode
  return (
    <div
      className="group relative bg-espresso rounded-xl border overflow-hidden cursor-pointer hover:border-amber/30 transition-colors flex flex-col"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        backgroundImage:
          'radial-gradient(circle at top right, rgba(200,129,58,0.15) 0%, transparent 60%)',
      }}
      onClick={() => onEdit(bottle)}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Top row: status label + type */}
        <div className="flex items-center justify-between">
          <span className="label-eyebrow">
            {status === 'tried' ? 'Tried' : 'Wishlist'}
          </span>
          <span className="font-sans font-medium text-[10px] tracking-[0.12em] uppercase text-wheat/50">
            {TYPE_LABEL[type] || type}
          </span>
        </div>

        {/* Bottle name + distillery */}
        <div>
          <h3 className="font-display italic font-[400] text-[22px] leading-[1.2] tracking-[-0.01em] text-cream">
            {name}
          </h3>
          <p className="font-sans text-[12px] text-wheat/55 mt-1.5">{distillery}</p>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip">{proof}° proof</span>
          <span className="chip">${price}</span>
        </div>

        {/* Taste notes (tried only) */}
        {status === 'tried' && rating !== null && (
          <>
            <div
              className="h-px"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
            />
            <TasteNotes rating={rating} notes={notes} viewMode={viewMode} />
          </>
        )}
      </div>

      {/* Delete button — revealed on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(bottle.id)
        }}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-espresso/90 text-stone hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Delete bottle"
      >
        <TrashIcon />
      </button>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}
