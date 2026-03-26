export default function TasteNotes({ rating, notes, viewMode }) {
  return (
    <div>
      {/* Rating number */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="font-sans font-bold text-[20px] leading-none text-amber">
          {rating}
        </span>
        <span className="font-sans font-normal text-[11px] text-wheat/60">/10</span>
      </div>

      {/* Rating bar */}
      <div
        className="h-1 rounded-full mb-3"
        style={{ backgroundColor: 'var(--rule)' }}
      >
        <div
          className="h-1 rounded-full bg-amber transition-all duration-300"
          style={{ width: `${rating * 10}%` }}
        />
      </div>

      {/* Tasting notes */}
      {notes && (
        <p
          className={`font-sans text-[14px] leading-[1.65] text-wheat/70 ${
            viewMode === 'grid' ? 'line-clamp-2' : ''
          }`}
        >
          {notes}
        </p>
      )}
    </div>
  )
}
