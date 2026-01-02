# Internal Audit Tree Explorer

A beautiful, interactive web application for exploring Internal Audit taxonomy hierarchies. Built with Next.js 14, Supabase, and Tailwind CSS.

## Features

✨ **Progressive Drill-Down Navigation**
- Start with Sector → Family view
- Click Family to explore Categories
- Click Category to view Types of Audit
- Click Type to see detailed information

🎨 **Modern, Professional Design**
- Gradient color schemes for different hierarchy levels
- Smooth animations and transitions
- Responsive layout (desktop, tablet, mobile)
- Clean breadcrumb navigation
- Modal pop-ups for detailed information

🚀 **Performance Optimized**
- Server-side data fetching
- Efficient API queries
- Smooth loading states
- Error handling with retry capability

## Database Structure

The application connects to Supabase and reads from a table with the following **5-level hierarchy**:

### Table Name: `audit_types`

### Required Columns:
| Column Name | Data Type | Hierarchy Level | Description |
|------------|-----------|-----------------|-------------|
| `internal_audit` | TEXT | **Level 1** | Top-level audit type (e.g., "Assurance", "Advisory", "Investigation") |
| `sector` | TEXT | **Level 2** | Audit sector (e.g., "Non-IT", "IT", "Financial") |
| `family` | TEXT | **Level 3** | Audit family within the sector (e.g., "Compliance Audit") |
| `category` | TEXT | **Level 4** | Specific audit category (e.g., "Corporate Compliance") |
| `type_of_audit` | TEXT | **Level 5** | Specific type of audit (e.g., "Corporate Governance Compliance") |
| `description` | TEXT | - | Detailed description of the audit type |
| `when_to_use` | TEXT | - | Guidance on when to use this audit type |
| `framework_or_criteria` | TEXT | - | Applicable framework or criteria |

### Hierarchy Flow:
```
1. internal_audit (Assurance, Advisory, etc.)
   └── 2. sector (Non-IT, IT, etc.)
       └── 3. family (Compliance Audit, Financial Audit, etc.)
           └── 4. category (Corporate Compliance, etc.)
               └── 5. type_of_audit (Corporate Governance Compliance, etc.)
                   ├── description
                   ├── when_to_use
                   └── framework_or_criteria
```

### Example Data Row:
```
internal_audit: "Assurance"
sector: "Non-IT"
family: "Compliance Audit"
category: "Corporate Compliance"
type_of_audit: "Corporate Governance Compliance"
description: "Evaluates adherence to corporate governance regulations..."
when_to_use: "When assessing corporate governance controls..."
framework_or_criteria: "Corporate Governance Frameworks, GRC Guidelines"
```

### SQL to Create Table:
```sql
CREATE TABLE audit_types (
  id SERIAL PRIMARY KEY,
  internal_audit TEXT NOT NULL,
  sector TEXT NOT NULL,
  family TEXT NOT NULL,
  category TEXT NOT NULL,
  type_of_audit TEXT NOT NULL,
  description TEXT,
  when_to_use TEXT,
  framework_or_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE audit_types ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
ON audit_types FOR SELECT 
USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_audit_internal_audit ON audit_types(internal_audit);
CREATE INDEX idx_audit_sector ON audit_types(sector);
CREATE INDEX idx_audit_family ON audit_types(family);
CREATE INDEX idx_audit_category ON audit_types(category);
```

## Setup Instructions

### 1. Environment Variables

The application requires the following environment variables in your `.env` file:

```env
# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration (replace with your project credentials)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_TABLE_NAME=audit_types
```

**Where to find your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy your **Project URL** and **anon/public key**
4. Update the `.env` file with your actual credentials

### 2. Supabase Setup

**Important:** This application uses an **external Supabase** (PostgreSQL) database. Make sure you have:
- A Supabase account and project created at [supabase.com](https://supabase.com)
- Your Supabase instance accessible from external connections
- Project credentials configured in your `.env` file

**Database Setup Steps:**

1. **Log into your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the SQL script** to create the `audit_types` table (see below)
4. **Import your audit data** into the table
5. **Verify data** is present in the Table Editor

**Note:** Since Supabase is an external service (not managed by Emergent), ensure your Supabase project allows connections from your deployment environment.

### 3. Install Dependencies

```bash
yarn install
```

### 4. Run the Application

Development mode:
```bash
yarn dev
```

Or using supervisor (production):
```bash
sudo supervisorctl restart nextjs
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Architecture

### Frontend (`/app/app/page.js`)
- React client component with state management
- Progressive view states (initial → categories → types)
- Modal component for detailed audit information
- Breadcrumb navigation
- Loading and error states
- Smooth animations and transitions

### Backend API (`/app/app/api/[[...path]]/route.js`)
- RESTful API endpoints
- Query parameters for different hierarchy levels
- Data filtering based on user selection
- Error handling and validation

### Database Layer (`/lib/supabase.js`)
- Supabase client configuration
- Data fetching functions
- Hierarchy organization
- Column name normalization (handles both uppercase/lowercase)

## API Endpoints

### Get Filter Options
```
GET /api?level=filters&internalAudit=Assurance (optional)
```

Response:
```json
{
  "internalAuditTypes": ["Assurance", "Advisory", "Investigation"],
  "sectors": ["Non-IT", "IT", "Financial"]
}
```

### Get Initial Data (Families with Filters)
```
GET /api?level=initial&internalAudit=Assurance&sector=Non-IT (filters optional)
```

Response:
```json
{
  "data": [
    {
      "internalAudit": "Assurance",
      "sector": "Non-IT",
      "families": ["Compliance Audit", "Financial Audit", ...]
    }
  ]
}
```

### Get Categories for a Family
```
GET /api?level=categories&internalAudit=Assurance&sector=Non-IT&family=Compliance+Audit
```

Response:
```json
{
  "internalAudit": "Assurance",
  "sector": "Non-IT",
  "family": "Compliance Audit",
  "categories": ["Legal Compliance", "Regulatory Compliance", ...]
}
```

### Get Types for a Category
```
GET /api?level=types&internalAudit=Assurance&sector=Non-IT&family=Compliance+Audit&category=Corporate+Compliance
```

Response:
```json
{
  "internalAudit": "Assurance",
  "sector": "Non-IT",
  "family": "Compliance Audit",
  "category": "Corporate Compliance",
  "types": [
    {
      "type": "Corporate Governance Compliance",
      "description": "...",
      "whenToUse": "...",
      "framework": "..."
    }
  ]
}
```

## User Interface

### Landing Page - NEW Filter System
- **Type of Audit Filter**: Buttons to select audit type (e.g., "Assurance", "Advisory")
- **Sector Filter**: Buttons to filter by sector (e.g., "Non-IT", "IT", "All Sectors")
- Displays all Families grouped by Sector based on selected filters
- Family cards are clickable
- Color-coded with blue gradient

### Family → Category View
- Shows all Categories under selected Family
- Breadcrumb navigation at top shows: Type → Sector → Family
- Back button to return to previous view
- Teal color scheme

### Category → Types View
- Shows all Types of Audit under selected Category
- Each type is clickable to view details
- Purple color scheme

### Type Details Modal
- Full-screen overlay with detailed information
- Displays:
  - Type of Audit (title)
  - Description
  - When to Use
  - Framework or Criteria
- Close button (X) in top-right
- Click outside to close

## Design System

### Color Scheme
- **Sectors/Families**: Blue gradient (`from-blue-50 to-white`)
- **Categories**: Teal gradient (`from-teal-50 to-white`)
- **Types**: Purple gradient (`from-purple-50 to-white`)
- **Background**: Slate to blue gradient

### Typography
- Headers: Bold, large sizes
- Body: Clean, readable
- Breadcrumbs: Medium weight

### Animations
- `fadeIn`: Cards appear with fade and slide-up
- `slideUp`: Modal appears with smooth transition
- Hover effects: Scale and color changes
- Staggered delays for multiple items

## Technologies Used

- **Next.js 14** - React framework with App Router
- **Supabase** - PostgreSQL database and backend
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icon library

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Server-side rendering for initial page load
- Client-side navigation for smooth transitions
- Optimized API queries with reasonable limits (max 5,000 records per query)
- Fetch only what's needed based on user selection
- Responsive images and assets
- Smooth 60fps animations
- Efficient data caching and organization

**Note:** The application is optimized to handle up to 5,000 audit records. If you need to manage larger datasets, consider implementing:
- Server-side pagination
- Virtual scrolling for long lists
- More aggressive filtering options
- Database indexing on frequently queried columns

## Accessibility

- Keyboard navigation support
- High contrast text
- ARIA labels
- Focus indicators
- Screen reader friendly

## Troubleshooting

### "No data found in database"
- Verify data exists in your Supabase `audit_types` table
- Check table name matches `SUPABASE_TABLE_NAME` in `.env`
- Verify Row Level Security policies allow read access

### "Failed to fetch data"
- Check Supabase credentials in `.env`
- Verify network connection to Supabase
- Check browser console for detailed errors

### Column name errors
- The code handles both uppercase and lowercase column names
- Verify your table uses lowercase column names (PostgreSQL standard)

## License

MIT License - Feel free to use this for your organization's needs.

## Support

For questions or issues, please check:
1. Supabase connection and credentials
2. Table structure matches specification
3. Data is properly formatted
4. Browser console for error messages
