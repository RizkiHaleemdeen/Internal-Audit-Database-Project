import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to fetch hierarchical audit data
export async function fetchAuditData() {
  try {
    const { data, error } = await supabase
      .from(process.env.SUPABASE_TABLE_NAME || 'audit_types')
      .select('*')

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Sort data manually after fetching
    const sortedData = (data || []).sort((a, b) => {
      const getSector = (row) => row.Sector || row.sector || ''
      const getFamily = (row) => row.Family || row.family || ''
      const getCategory = (row) => row.Category || row.category || ''
      const getType = (row) => row.Type_of_Audit || row.type_of_audit || ''
      
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

// Helper to organize data into hierarchy (handles both uppercase and lowercase column names)
export function organizeHierarchy(data) {
  const hierarchy = {}

  data.forEach(row => {
    // Handle both uppercase and lowercase column names
    const sector = row.Sector || row.sector || 'Unknown'
    const family = row.Family || row.family || 'Unknown'
    const category = row.Category || row.category || 'Unknown'
    const type = row.Type_of_Audit || row.type_of_audit || 'Unknown'
    const description = row.Description || row.description || ''
    const whenToUse = row.When_to_use || row.when_to_use || ''
    const framework = row.Framework_or_Criteria || row.framework_or_criteria || ''

    if (!hierarchy[sector]) {
      hierarchy[sector] = {}
    }
    if (!hierarchy[sector][family]) {
      hierarchy[sector][family] = {}
    }
    if (!hierarchy[sector][family][category]) {
      hierarchy[sector][family][category] = []
    }

    hierarchy[sector][family][category].push({
      type: type,
      description: description,
      whenToUse: whenToUse,
      framework: framework
    })
  })

  return hierarchy
}