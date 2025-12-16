# Fleet Management System Design Guidelines

## Design Approach

**Selected Framework:** Material Design System with data-visualization focus
**Rationale:** Enterprise fleet management demands information density, clarity, and efficient workflows. Material Design provides robust patterns for dashboards, data tables, and complex interfaces while maintaining visual hierarchy.

**Key Influences:**
- Linear's clean data presentation and status indicators
- Google Maps' intuitive geospatial interfaces
- Asana's task/asset management patterns
- Samsara/Geotab fleet dashboards for industry conventions

---

## Typography System

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Inter (400, 500, 600, 700)
- Monospace: JetBrains Mono for VINs, license plates, coordinates

**Hierarchy:**
- Dashboard Headers: text-2xl font-semibold (24px/600)
- Section Titles: text-lg font-semibold (18px/600)
- Card Headers: text-base font-medium (16px/500)
- Body Text: text-sm (14px/400)
- Data Labels: text-xs font-medium uppercase tracking-wide (12px/500)
- Metric Values: text-3xl font-bold (30px/700)
- Table Content: text-sm (14px/400)
- VIN/Plate Numbers: font-mono text-xs (12px monospace)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section gaps: gap-4 to gap-6
- Card spacing: p-6
- Form fields: space-y-4
- Dashboard grid gaps: gap-6
- Map container: h-96 to h-screen

**Container Structure:**
- Admin Dashboard: Sidebar navigation (w-64) + Main content area (flex-1)
- Content max-width: max-w-7xl mx-auto px-6
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Form layouts: max-w-2xl for single-column forms

---

## Component Library

### Navigation
**Admin Sidebar:**
- Fixed left sidebar (w-64)
- Logo/brand at top (h-16)
- Navigation items with icons (h-12 each)
- Active state: border-l-4 indicator
- Collapsible sections for multi-level nav

**Top Bar:**
- Fixed header (h-16)
- Search input (flex-1 max-w-md)
- User profile dropdown (right-aligned)
- Notification bell with badge counter

### Dashboard Cards
**Metric Cards:**
- Grid layout (4 columns desktop, 2 tablet, 1 mobile)
- Each card: rounded-lg with subtle border
- Large metric value (text-3xl)
- Trend indicator (arrow icon + percentage)
- Supporting label text

**Status Overview Cards:**
- Vehicle count by status (Active, Idle, Maintenance, Alert)
- Icon + count + status label
- Clickable for filtering

### Data Tables
**Fleet List Table:**
- Striped rows for readability
- Sticky header row
- Columns: Vehicle ID, Make/Model, Driver, Status, Location, Last Update
- Status badges (inline, rounded-full px-3 py-1)
- Action menu (three-dot icon) per row
- Sortable column headers
- Pagination controls at bottom

**Responsive:** Stack to cards on mobile (each vehicle as individual card)

### Map Interface
**GPS Tracking View:**
- Full-height map container (h-screen - header height)
- Vehicle markers with status-based styling
- Selected vehicle: highlighted with info card overlay
- Side panel (w-96) showing vehicle list (toggleable)
- Map controls: zoom, layer selection, fullscreen
- Real-time update indicator (pulsing dot)

### Forms
**Vehicle Registration:**
- Two-column layout on desktop (grid-cols-2 gap-6)
- Single column on mobile
- Input groups with labels (text-sm font-medium mb-1)
- Input fields: rounded-md border px-4 py-2.5
- Required field indicator (*)
- File upload area: dashed border, centered text, drag-drop zone
- Submit/Cancel buttons at bottom (flex justify-end gap-4)

**Driver Profile:**
- Photo upload (circular, w-24 h-24)
- Document upload section (multiple files)
- Contact information fieldset
- License details with expiration date picker

### Alerts & Notifications
**Alert Banner:**
- Full-width at top of relevant sections
- Icon + message + action button
- Dismissible (x icon)
- Severity levels affect visual treatment

**Notification Panel:**
- Slide-out from right (w-96)
- Scrollable list of notifications
- Each item: icon, message, timestamp, mark-as-read
- Group by date (Today, Yesterday, This Week)

### Status Indicators
**Vehicle Status Badges:**
- Small rounded pills (rounded-full px-3 py-1 text-xs font-medium)
- Icons for: Active (circle), Idle (pause), Maintenance (wrench), Alert (warning)

**Document Status:**
- Valid (checkmark), Expiring Soon (clock), Expired (x)

### Mobile Driver App
**Touch-Optimized:**
- Bottom navigation bar (h-16, fixed)
- Large tap targets (min h-12)
- Swipeable cards
- Pull-to-refresh on lists
- Floating action button (bottom-right, rounded-full w-14 h-14)

**Trip Logging:**
- Large odometer input (text-4xl text-center)
- Quick-action buttons (h-16)
- Photo capture for pre/post trip inspection
- Simple form: Start location, End location, Purpose dropdown

---

## Icons

**Library:** Heroicons (via CDN)
- Navigation: home, truck, users, wrench, map, bell, cog
- Actions: plus, pencil, trash, eye, download
- Status: check-circle, exclamation-triangle, clock, x-circle
- Map: map-pin, location-marker
- Vehicle: truck (primary vehicle icon)

---

## Animations

**Minimal Usage:**
- Map marker pulse for real-time updates (subtle)
- Loading spinners for data fetch
- Smooth transitions on hover (transition-colors duration-150)
- Slide-in for panels/modals (transition-transform)

**No complex animations** - prioritize performance and clarity

---

## Images

**Dashboard:**
- No hero images (this is a utility application)
- Vehicle placeholder images in cards (aspect-w-16 aspect-h-9)
- Driver profile photos (circular avatars, w-10 h-10 in lists, w-24 h-24 in profiles)

**Empty States:**
- Illustration placeholders for empty vehicle lists, no maintenance records
- Simple icon + message layout (centered, max-w-md)

---

## Accessibility

- All interactive elements: min 44x44px touch targets
- Form inputs: associated labels (for/id pairing)
- Status communicated via text + icons (not reliance on visual treatment alone)
- Focus rings on keyboard navigation
- ARIA labels for icon-only buttons
- Semantic HTML (table, nav, main, aside)

---

## Responsive Breakpoints

- Mobile: < 640px (single column, bottom nav)
- Tablet: 640px - 1024px (2 columns, condensed sidebar)
- Desktop: > 1024px (full sidebar, multi-column grids)