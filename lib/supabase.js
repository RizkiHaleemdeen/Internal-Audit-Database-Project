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
      .order('Sector', { ascending: true })
      .order('Family', { ascending: true })
      .order('Category', { ascending: true })
      .order('Type_of_Audit', { ascending: true })

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching audit data:', error)
    throw error
  }
}

// Helper to organize data into hierarchy
export function organizeHierarchy(data) {
  const hierarchy = {}

  data.forEach(row => {
    const sector = row.Sector
    const family = row.Family
    const category = row.Category
    const type = row.Type_of_Audit

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
      description: row.Description,
      whenToUse: row.When_to_use,
      framework: row.Framework_or_Criteria
    })
  })

  return hierarchy
}