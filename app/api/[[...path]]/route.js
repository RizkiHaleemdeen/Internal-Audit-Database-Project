import { NextResponse } from 'next/server'
import { fetchAuditData, organizeHierarchy, getUniqueInternalAuditTypes, getUniqueSectors } from '../../../lib/supabase.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const internalAudit = searchParams.get('internalAudit')
    const sector = searchParams.get('sector')
    const family = searchParams.get('family')
    const category = searchParams.get('category')

    // Fetch all data from Supabase
    const rawData = await fetchAuditData()

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: 'No data found in database' }, { status: 404 })
    }

    // Return filter options
    if (level === 'filters') {
      const internalAuditTypes = getUniqueInternalAuditTypes(rawData)
      const sectors = getUniqueSectors(rawData, internalAudit)
      return NextResponse.json({ 
        internalAuditTypes,
        sectors 
      })
    }

    // Organize into hierarchy with filters
    const hierarchy = organizeHierarchy(rawData, internalAudit, sector)

    // Return different data based on query parameters
    if (level === 'initial') {
      // Return families grouped by sector (with optional filters)
      const result = []
      
      Object.keys(hierarchy).forEach(auditType => {
        Object.keys(hierarchy[auditType]).forEach(sectorName => {
          const families = Object.keys(hierarchy[auditType][sectorName])
          result.push({
            internalAudit: auditType,
            sector: sectorName,
            families: families
          })
        })
      })
      
      return NextResponse.json({ data: result })
    }

    if (level === 'categories' && internalAudit && sector && family) {
      // Return categories for a specific family
      const categories = hierarchy[internalAudit]?.[sector]?.[family] 
        ? Object.keys(hierarchy[internalAudit][sector][family])
        : []
      return NextResponse.json({ 
        internalAudit,
        sector, 
        family, 
        categories 
      })
    }

    if (level === 'types' && internalAudit && sector && family && category) {
      // Return types for a specific category
      const types = hierarchy[internalAudit]?.[sector]?.[family]?.[category] || []
      return NextResponse.json({ 
        internalAudit,
        sector, 
        family, 
        category, 
        types 
      })
    }

    // Default: return full hierarchy
    return NextResponse.json({ hierarchy })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch audit data',
      details: error.message 
    }, { status: 500 })
  }
}