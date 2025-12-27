'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home, X, Loader2, AlertCircle } from 'lucide-react'

export default function AuditTreeExplorer() {
  const [sectors, setSectors] = useState([])
  const [currentView, setCurrentView] = useState('initial') // initial, categories, types
  const [selectedSector, setSelectedSector] = useState(null)
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [types, setTypes] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api?level=initial')
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setSectors(data.sectors || [])
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFamilyClick = async (sector, family) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api?level=categories&sector=${encodeURIComponent(sector)}&family=${encodeURIComponent(family)}`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setSelectedSector(sector)
      setSelectedFamily(family)
      setCategories(data.categories || [])
      setCurrentView('categories')
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (category) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        `/api?level=types&sector=${encodeURIComponent(selectedSector)}&family=${encodeURIComponent(selectedFamily)}&category=${encodeURIComponent(category)}`
      )
      if (!response.ok) throw new Error('Failed to fetch types')
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setSelectedCategory(category)
      setTypes(data.types || [])
      setCurrentView('types')
    } catch (err) {
      console.error('Error fetching types:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeClick = (type) => {
    setSelectedType(type)
  }

  const handleBack = () => {
    if (currentView === 'types') {
      setCurrentView('categories')
      setSelectedCategory(null)
      setTypes([])
    } else if (currentView === 'categories') {
      setCurrentView('initial')
      setSelectedSector(null)
      setSelectedFamily(null)
      setCategories([])
    }
  }

  const handleHome = () => {
    setCurrentView('initial')
    setSelectedSector(null)
    setSelectedFamily(null)
    setSelectedCategory(null)
    setCategories([])
    setTypes([])
  }

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center gap-2 mb-8 text-sm flex-wrap">
      <button
        onClick={handleHome}
        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="font-medium">Internal Audit</span>
      </button>
      {selectedSector && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-medium">{selectedSector}</span>
        </>
      )}
      {selectedFamily && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-medium">{selectedFamily}</span>
        </>
      )}
      {selectedCategory && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 font-semibold">{selectedCategory}</span>
        </>
      )}
    </div>
  )

  // Loading state
  if (loading && currentView === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading audit taxonomy...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && currentView === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Error Loading Data</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={fetchInitialData}>Try Again</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Internal Audit Tree Explorer</h1>
          <p className="text-slate-600">Navigate through the audit taxonomy hierarchy</p>
        </div>

        {/* Breadcrumb */}
        {currentView !== 'initial' && <Breadcrumb />}

        {/* Back Button */}
        {currentView !== 'initial' && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="mb-6"
          >
            ← Back
          </Button>
        )}

        {/* Loading overlay for transitions */}
        {loading && currentView !== 'initial' && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Initial View: Sectors and Families */}
        {!loading && currentView === 'initial' && (
          <div className="space-y-8">
            {sectors.map((sector, idx) => (
              <div
                key={idx}
                className="animate-fadeIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Sector Header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{sector.name}</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
                </div>

                {/* Families Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sector.families.map((family, familyIdx) => (
                    <Card
                      key={familyIdx}
                      className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300"
                      onClick={() => handleFamilyClick(sector.name, family)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                          {family}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Click to explore categories</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories View */}
        {!loading && currentView === 'categories' && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedFamily}</h2>
            <p className="text-slate-600 mb-6">Select a category to view audit types</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category, idx) => (
                <Card
                  key={idx}
                  className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 bg-gradient-to-br from-teal-50 to-white border-2 border-teal-100 hover:border-teal-300"
                  onClick={() => handleCategoryClick(category)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-teal-600 transition-colors">
                      {category}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-teal-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">View audit types</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Types View */}
        {!loading && currentView === 'types' && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedCategory}</h2>
            <p className="text-slate-600 mb-6">Click on any audit type to view details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {types.map((type, idx) => (
                <Card
                  key={idx}
                  className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 hover:border-purple-300"
                  onClick={() => handleTypeClick(type)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-purple-600 transition-colors">
                      {type.type}
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-150 transition-transform"></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Click for details</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Type Details */}
        {selectedType && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
            onClick={() => setSelectedType(null)}
          >
            <Card
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                      {selectedType.type}
                    </h2>
                    <p className="text-sm text-slate-500">Type of Audit</p>
                  </div>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-6">
                  {selectedType.description && (
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-2 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded"></div>
                        Description
                      </h3>
                      <p className="text-slate-700 leading-relaxed pl-3">
                        {selectedType.description}
                      </p>
                    </div>
                  )}

                  {selectedType.whenToUse && (
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-2 flex items-center gap-2">
                        <div className="w-1 h-6 bg-teal-500 rounded"></div>
                        When to Use
                      </h3>
                      <p className="text-slate-700 leading-relaxed pl-3">
                        {selectedType.whenToUse}
                      </p>
                    </div>
                  )}

                  {selectedType.framework && (
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 mb-2 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded"></div>
                        Framework or Criteria
                      </h3>
                      <p className="text-slate-700 leading-relaxed pl-3">
                        {selectedType.framework}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="mt-8 pt-6 border-t">
                  <Button
                    onClick={() => setSelectedType(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}