import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import BottleCard from './components/BottleCard.jsx'
import BottleForm from './components/BottleForm.jsx'
import { SAMPLE_BOTTLES } from './data/sampleBottles.js'

const STORAGE_KEY = 'whiskey-tracker-bottles'
const VIEW_KEY    = 'whiskey-tracker-view'

function generateId() {
  return `bottle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function App() {
  const [bottles, setBottles] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_BOTTLES))
    return SAMPLE_BOTTLES
  })

  const [activeFilter, setActiveFilter] = useState('tried')

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_KEY) || 'grid'
  })

  const [isFormOpen, setIsFormOpen]       = useState(false)
  const [editingBottle, setEditingBottle] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bottles))
  }, [bottles])

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewMode)
  }, [viewMode])

  const handleAddBottle = (formData) => {
    const newBottle = {
      ...formData,
      id:        generateId(),
      dateAdded: new Date().toISOString().split('T')[0],
      rating:    formData.status === 'tried' ? formData.rating : null,
      notes:     formData.status === 'tried' ? formData.notes  : null,
    }
    setBottles((prev) => [newBottle, ...prev])
    handleCloseForm()
  }

  const handleEditBottle = (formData) => {
    setBottles((prev) =>
      prev.map((b) =>
        b.id === editingBottle.id
          ? {
              ...b,
              ...formData,
              rating: formData.status === 'tried' ? formData.rating : null,
              notes:  formData.status === 'tried' ? formData.notes  : null,
            }
          : b,
      ),
    )
    handleCloseForm()
  }

  const handleDeleteBottle = (id) => {
    setBottles((prev) => prev.filter((b) => b.id !== id))
  }

  const handleOpenAdd = () => {
    setEditingBottle(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (bottle) => {
    setEditingBottle(bottle)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingBottle(null)
  }

  const filteredBottles = bottles.filter((b) => b.status === activeFilter)
  const triedCount      = bottles.filter((b) => b.status === 'tried').length
  const wishlistCount   = bottles.filter((b) => b.status === 'wishlist').length

  return (
    <div className="min-h-screen bg-cream">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={handleOpenAdd}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          triedCount={triedCount}
          wishlistCount={wishlistCount}
        />

        {filteredBottles.length === 0 ? (
          <EmptyState filter={activeFilter} onAddClick={handleOpenAdd} />
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'flex flex-col gap-3'
            }
          >
            {filteredBottles.map((bottle) => (
              <BottleCard
                key={bottle.id}
                bottle={bottle}
                viewMode={viewMode}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteBottle}
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <BottleForm
          bottle={editingBottle}
          onSubmit={editingBottle ? handleEditBottle : handleAddBottle}
          onClose={handleCloseForm}
          onDelete={
            editingBottle
              ? () => {
                  handleDeleteBottle(editingBottle.id)
                  handleCloseForm()
                }
              : null
          }
        />
      )}
    </div>
  )
}

function EmptyState({ filter, onAddClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display font-[500] text-[28px] tracking-[-0.01em] text-ink/20 mb-3">
        Your collection awaits
      </p>
      <p className="font-sans text-[14px] text-stone mb-8 max-w-xs leading-relaxed">
        {filter === 'tried'
          ? 'No bottles tasted yet. Add one to begin your log.'
          : 'Your wishlist is empty. Start adding bottles to try.'}
      </p>
      <button
        onClick={onAddClick}
        className="font-sans font-semibold text-[13px] bg-amber hover:bg-amber/90 text-espresso px-5 py-[11px] rounded-md transition-colors"
      >
        Add Bottle
      </button>
    </div>
  )
}
