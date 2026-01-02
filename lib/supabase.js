import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to fetch hierarchical audit data with optimization
export async function fetchAuditData() {
  try {
    const { data, error } = await supabase
      .from(process.env.SUPABASE_TABLE_NAME || 'audit_types')
      .select('*')
      .limit(5000) // Add reasonable limit to prevent memory issues with large datasets

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Sort data manually after fetching
    const sortedData = (data || []).sort((a, b) => {
      const getInternalAudit = (row) => row.internal_audit || row.Internal_Audit || ''
      const getSector = (row) => row.Sector || row.sector || ''
      const getFamily = (row) => row.Family || row.family || ''
      const getCategory = (row) => row.Category || row.category || ''
      const getType = (row) => row.Type_of_Audit || row.type_of_audit || ''
      
      if (getInternalAudit(a) !== getInternalAudit(b)) return getInternalAudit(a).localeCompare(getInternalAudit(b))
      if (getSector(a) !== getSector(b)) return getSector(a).localeCompare(getSector(b))
      if (getFamily(a) !== getFamily(b)) return getFamily(a).localeCompare(getFamily(b))
      if (getCategory(a) !== getCategory(b)) return getCategory(a).localeCompare(getCategory(b))
      return getType(a).localeCompare(getType(b))
    })

    return sortedData
  } catch (error) {
    console.error('Error fetching audit data:', error)
    throw error
  }
}

// Helper to get unique internal audit types
export function getUniqueInternalAuditTypes(data) {
  const types = new Set()
  data.forEach(row => {
    const internalAudit = row.internal_audit || row.Internal_Audit || 'Unknown'
    types.add(internalAudit)
  })
  return Array.from(types).sort()
}

// Helper to get unique sectors (optionally filtered by internal_audit)
export function getUniqueSectors(data, internalAuditFilter = null) {
  const sectors = new Set()
  data.forEach(row => {
    const internalAudit = row.internal_audit || row.Internal_Audit || 'Unknown'
    const sector = row.Sector || row.sector || 'Unknown'
    
    if (!internalAuditFilter || internalAudit === internalAuditFilter) {
      sectors.add(sector)
    }
  })
  return Array.from(sectors).sort()
}

// Helper to organize data into hierarchy (handles both uppercase and lowercase column names)
export function organizeHierarchy(data, internalAuditFilter = null, sectorFilter = null) {
  const hierarchy = {}

  data.forEach(row => {
    // Handle both uppercase and lowercase column names
    const internalAudit = row.internal_audit || row.Internal_Audit || 'Unknown'
    const sector = row.Sector || row.sector || 'Unknown'
    const family = row.Family || row.family || 'Unknown'
    const category = row.Category || row.category || 'Unknown'
    const type = row.Type_of_Audit || row.type_of_audit || 'Unknown'
    const description = row.Description || row.description || ''
    const whenToUse = row.When_to_use || row.when_to_use || ''
    const framework = row.Framework_or_Criteria || row.framework_or_criteria || ''

    // Apply filters
    if (internalAuditFilter && internalAudit !== internalAuditFilter) return
    if (sectorFilter && sector !== sectorFilter) return

    if (!hierarchy[internalAudit]) {
      hierarchy[internalAudit] = {}
    }
    if (!hierarchy[internalAudit][sector]) {
      hierarchy[internalAudit][sector] = {}
    }
    if (!hierarchy[internalAudit][sector][family]) {
      hierarchy[internalAudit][sector][family] = {}
    }
    if (!hierarchy[internalAudit][sector][family][category]) {
      hierarchy[internalAudit][sector][family][category] = []
    }

    hierarchy[internalAudit][sector][family][category].push({
      type: type,
      description: description,
      whenToUse: whenToUse,
      framework: framework
    })
  })

  return hierarchy
}