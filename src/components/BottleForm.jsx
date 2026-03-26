import { useState, useEffect } from 'react'

const BOTTLE_TYPES = ['bourbon', 'rye', 'scotch', 'irish', 'japanese', 'other']

export default function BottleForm({ bottle, onSubmit, onClose, onDelete }) {
  const isEditing = bottle !== null

  const [formData, setFormData] = useState({
    name:       bottle?.name       ?? '',
    distillery: bottle?.distillery ?? '',
    type:       bottle?.type       ?? 'bourbon',
    proof:      bottle?.proof      ?? '',
    price:      bottle?.price      ?? '',
    status:     bottle?.status     ?? 'tried',
    rating:     bottle?.rating     ?? 7,
    notes:      bottle?.notes      ?? '',
  })

  const [errors, setErrors] = useState({})

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' || type === 'range'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.name.trim())        errs.name = 'Name is required'
    if (!formData.distillery.trim())  errs.distillery = 'Distillery is required'
    if (formData.proof === '' || formData.proof <= 0)
      errs.proof = 'Proof is required'
    if (formData.price === '' || formData.price < 0)
      errs.price = 'Price is required'
    if (
      formData.status === 'tried' &&
      (!formData.rating || formData.rating < 1 || formData.rating > 10)
    ) {
      errs.rating = 'Rating must be 1–10'
    }
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(formData)
  }

  const inputClass = (field) =>
    [
      'w-full bg-white/[0.04] border rounded-lg px-3 py-2.5',
      'font-sans text-[14px] text-wheat placeholder-stone/40',
      'focus:outline-none transition-colors',
      errors[field]
        ? 'border-red-400/50 focus:border-red-400/80'
        : 'border-white/10 focus:border-amber/50',
    ].join(' ')

  const labelClass =
    'block font-sans font-semibold text-[10px] tracking-[0.14em] uppercase text-stone mb-1.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-espresso border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto cask-scroll flex flex-col"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <h2 className="font-display font-[500] text-[22px] text-cream tracking-[-0.01em]">
            {isEditing ? 'Edit Bottle' : 'Add Bottle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone hover:text-wheat transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Status toggle */}
          <div>
            <p className={labelClass}>Status</p>
            <div className="flex gap-2">
              {['tried', 'wishlist'].map((s) => (
                <label
                  key={s}
                  className={[
                    'flex-1 text-center py-2.5 rounded-lg cursor-pointer border',
                    'font-sans font-medium text-[13px] capitalize transition-colors',
                    formData.status === s
                      ? 'bg-amber border-amber text-espresso'
                      : 'border-white/10 text-stone hover:border-amber/30 hover:text-wheat',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formData.status === s}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Bottle name */}
          <div>
            <label className={labelClass} htmlFor="name">
              Bottle Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Pappy Van Winkle 15 Year"
              className={inputClass('name')}
            />
            {errors.name && (
              <p className="font-sans text-[11px] text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Distillery */}
          <div>
            <label className={labelClass} htmlFor="distillery">
              Distillery
            </label>
            <input
              id="distillery"
              name="distillery"
              type="text"
              value={formData.distillery}
              onChange={handleChange}
              placeholder="e.g. Buffalo Trace Distillery"
              className={inputClass('distillery')}
            />
            {errors.distillery && (
              <p className="font-sans text-[11px] text-red-400 mt-1">{errors.distillery}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className={labelClass} htmlFor="type">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={inputClass('type') + ' cursor-pointer'}
            >
              {BOTTLE_TYPES.map((t) => (
                <option key={t} value={t} className="bg-espresso text-wheat">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Proof + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="proof">
                Proof
              </label>
              <input
                id="proof"
                name="proof"
                type="number"
                min={1}
                max={200}
                value={formData.proof}
                onChange={handleChange}
                placeholder="e.g. 90"
                className={inputClass('proof')}
              />
              {errors.proof && (
                <p className="font-sans text-[11px] text-red-400 mt-1">{errors.proof}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="price">
                Price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 65"
                className={inputClass('price')}
              />
              {errors.price && (
                <p className="font-sans text-[11px] text-red-400 mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Rating — tried only */}
          {formData.status === 'tried' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={labelClass}>Rating</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-sans font-bold text-[20px] leading-none text-amber">
                    {formData.rating}
                  </span>
                  <span className="font-sans text-[11px] text-stone">/10</span>
                </div>
              </div>
              <input
                type="range"
                name="rating"
                min={1}
                max={10}
                step={1}
                value={formData.rating}
                onChange={handleChange}
                className="w-full cursor-pointer h-1"
                style={{ accentColor: '#C8813A' }}
              />
              {errors.rating && (
                <p className="font-sans text-[11px] text-red-400 mt-1">{errors.rating}</p>
              )}
            </div>
          )}

          {/* Tasting notes — tried only */}
          {formData.status === 'tried' && (
            <div>
              <label className={labelClass} htmlFor="notes">
                Tasting Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Describe the flavors, finish, and your impressions…"
                rows={3}
                className={inputClass('notes') + ' resize-none leading-[1.65]'}
              />
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {/* Delete (edit mode only) */}
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="font-sans text-[13px] text-red-400/60 hover:text-red-400 transition-colors"
              >
                Delete Bottle
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="font-sans font-medium text-[13px] text-stone hover:text-wheat px-4 py-2.5 rounded-lg border transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="font-sans font-semibold text-[13px] bg-amber hover:bg-amber/90 text-espresso px-5 py-2.5 rounded-lg transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Add Bottle'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
