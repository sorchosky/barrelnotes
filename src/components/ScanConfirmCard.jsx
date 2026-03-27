import { useEffect } from 'react'

const TYPE_MAP = {
  bourbon: 'bourbon',
  rye: 'rye',
  scotch: 'scotch',
  irish: 'irish',
  japanese: 'japanese',
  canadian: 'other',
  tennessee: 'other',
  other: 'other',
}

function normalizeType(t) {
  return TYPE_MAP[t?.toLowerCase()] ?? 'other'
}

export default function ScanConfirmCard({ result, onAddToWishlist, onScanAnother, onDismiss }) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onDismiss])

  const handleAddToWishlist = () => {
    onAddToWishlist({
      name: result.name ?? '',
      distillery: result.distillery ?? '',
      type: normalizeType(result.type),
      proof: result.proof ?? '',
      status: 'wishlist',
    })
  }

  const {
    name,
    distillery,
    type,
    proof,
    description,
    tastingNotes = [],
    matchScore,
    matchReason,
    isPersonalized,
    confidence,
  } = result

  const matchPillClass = {
    High: 'bg-amber text-cream',
    Medium: 'border border-amber text-amber bg-transparent',
    Low: 'border border-stone text-stone bg-transparent',
  }[matchScore] ?? 'border border-stone text-stone bg-transparent'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss()
      }}
    >
      <div
        className="bg-cream w-full max-w-[480px] max-h-[90vh] overflow-y-auto cask-scroll flex flex-col"
        style={{
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(26,22,18,0.14), 0 2px 8px rgba(26,22,18,0.08)',
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CameraIcon />
            <span
              className="font-sans font-semibold text-[10px] tracking-[0.18em] uppercase"
              style={{ color: 'var(--stone, #6B6059)' }}
            >
              Bottle Scan
            </span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md transition-colors hover:bg-ink/[0.06]"
            style={{ color: 'var(--stone, #6B6059)' }}
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Bottle name + distillery */}
        <h2
          className="font-display font-[500] text-ink leading-[1.1]"
          style={{ fontSize: '28px', marginTop: '16px' }}
        >
          {name ?? 'Unknown Bottle'}
        </h2>
        {distillery && (
          <p className="font-sans font-normal text-[13px] text-stone mt-0.5">{distillery}</p>
        )}

        {/* Chips row */}
        <div className="flex flex-wrap gap-2 mt-3">
          {type && <span className="chip-outline">{type}</span>}
          {proof != null && <span className="chip-outline">{proof} proof</span>}
        </div>

        {/* Description */}
        {description && (
          <p
            className="font-sans font-normal text-[15px] text-ink"
            style={{ lineHeight: '1.65', marginTop: '16px' }}
          >
            {description}
          </p>
        )}

        {/* Tasting Notes */}
        {tastingNotes.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p className="label-eyebrow">Tasting Notes</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {tastingNotes.map((note, i) => (
                <span key={i} className="chip-amber">
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Score */}
        <div style={{ marginTop: '20px' }}>
          <p className="label-eyebrow">Match for You</p>
          <div className="mt-2">
            <span
              className={`inline-block font-sans font-bold text-[13px] rounded-full px-4 py-1.5 ${matchPillClass}`}
            >
              {matchScore ?? 'Medium'}
            </span>
          </div>
          {matchReason && (
            <p
              className="font-sans font-normal text-[13px] text-stone"
              style={{ lineHeight: '1.5', marginTop: '8px' }}
            >
              {matchReason}
            </p>
          )}
          {isPersonalized === false && (
            <p
              className="font-sans font-normal text-[12px] text-stone"
              style={{ marginTop: '6px' }}
            >
              Score based on general reviews — log some bottles to get a personalized match.
            </p>
          )}
        </div>

        {/* Confidence note */}
        {(confidence === 'low' || confidence === 'medium') && (
          <p
            className="font-sans font-normal text-[12px] text-stone"
            style={{ marginTop: '16px' }}
          >
            {confidence === 'low'
              ? 'Label was unclear — please review details carefully'
              : 'Some details may need correction'}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2" style={{ marginTop: '24px' }}>
          <button
            type="button"
            onClick={handleAddToWishlist}
            className="w-full font-sans font-semibold text-[13px] bg-amber hover:bg-amber/90 text-cream py-[11px] rounded-md transition-colors"
          >
            Add to Wishlist
          </button>
          <button
            type="button"
            onClick={onScanAnother}
            className="w-full font-sans font-semibold text-[13px] bg-transparent border text-stone hover:bg-ink/[0.04] py-[11px] rounded-md transition-colors"
            style={{ borderColor: 'var(--rule)' }}
          >
            Scan Another
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full font-sans font-normal text-[13px] text-stone bg-transparent border-none py-2 transition-colors hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

function CameraIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--stone, #6B6059)' }}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
