import { NextResponse } from 'next/server'
import { fetchAuditData, organizeHierarchy } from '../../../lib/supabase.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const sector = searchParams.get('sector')
    const family = searchParams.get('family')
    const category = searchParams.get('category')

    // Fetch all data from Supabase
    const rawData = await fetchAuditData()

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ error: 'No data found in database' }, { status: 404 })
    }

    // Organize into hierarchy
    const hierarchy = organizeHierarchy(rawData)

    // Return different data based on query parameters
    if (level === 'initial') {
      // Return sectors and families for initial view
      const sectors = Object.keys(hierarchy).map(sectorName => ({
        name: sectorName,
        families: Object.keys(hierarchy[sectorName])
      }))
      return NextResponse.json({ sectors })
    }

    if (level === 'categories' && sector && family) {
      // Return categories for a specific family
      const categories = hierarchy[sector]?.[family] 
        ? Object.keys(hierarchy[sector][family])
        : []
      return NextResponse.json({ 
        sector, 
        family, 
        categories 
      })
    }

    if (level === 'types' && sector && family && category) {
      // Return types for a specific category
      const types = hierarchy[sector]?.[family]?.[category] || []
      return NextResponse.json({ 
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