# 🍲 Family Recipe App

A web app to collect, organize, and plan family meals.  
Focus: clean UI, quick filtering, and a weekly meal planner.

---

## 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Build for production
npm run build
npm start

The app runs at http://localhost:3000
---

## 🌍 Deployment

The app is deployed via **Vercel**, connected to the GitHub repo.

### Setup
1. Push code to GitHub (main branch).
2. Connect the repo to Vercel.
3. Vercel automatically builds & deploys on each push to main.

### Environment
- Data tools (`/data` page) are **disabled by default** in production.
- To enable them in Vercel, set the env variable:  
  `NEXT_PUBLIC_ENABLE_DATA_TOOLS=true`

### URLs
- **Production:** https://your-vercel-app-url.vercel.app  
- **Preview:** every PR/branch gets a unique preview deployment.


## 📦 Features

### ✅ Current (after Sprint 2)

1. **Recipe Management**
   - Add, edit, delete recipes with confirmation dialogs  
   - Multi-category tags (Course, Diet, Cuisine, Time, Difficulty, Extra)  
   - Title, description, ingredients, steps  
   - Dedicated Recipe Detail Page (`/recipes/[id]`) with badges, categories, description, ingredients, steps  
   - Edit & Delete available only on detail page (with confirmation + toasts)  

2. **Search & Filtering**
   - Full-text search across titles, ingredients, steps, tags  
   - Category filter chips with AND logic  
   - Active chip styling (filled + white text)  

3. **Meal Planner**
   - Week-based planner stored in localStorage  
   - Grid view with Breakfast / Lunch / Dinner slots  
   - Week navigation (Prev / This Week / Next) with date ranges  
   - Quick Add Dialog (search + insert recipe into slots by Enter/click)  
   - Stack multiple recipes per slot, with clean wrapping layout  
   - Links from planner slots to recipe detail pages  
   - Clear week button  

4. **Data Management**
   - JSON schema with `schemaVersion`  
   - Export recipes + planner as JSON  
   - Import JSON (validate + merge by ID)  
   - `/data` page (hidden in production unless enabled with env flag)  

5. **UI & UX**
   - Tailwind theming with gradient hero + clean cards  
   - Save/Discard confirmation dialogs  
   - Toast notifications (Save/Delete/Import/Export)  
   - Keyboard shortcuts (Esc to close dialogs, Cmd/Ctrl+Enter to save)  
   - Accessibility improvements (aria labels, focus trap, dialog roles)  
   - Hydration issues fixed  

6. **Deployment**
   - Vercel deployment ready  
   - Favicon + SEO meta tags (title, description, open graph)  
   - Custom 404 page  

---

### 🔄 In Progress

- Meal planner: duplicate week button, “Add to Planner” from recipe cards, jump-to-recipes link  
- Recipe detail page: print-friendly stylesheet, copy link button, visual polish  
- Data management: sample data loader (dev-only)  
- Filters: removable pills, advanced filter panel  
- UX: more visual polish on recipe detail & filter UI  

See 👉 [`SPRINT2.md`](./SPRINT2.md) and 👉 [`SPRINT3.md`](./SPRINT3.md) for the detailed sprint backlog.  

---
## Tech Stack
Framework: Next.js (React + App Router)
UI: TailwindCSS
State: Zustand
Search: Fuse.js
Storage: localStorage (recipes + planner, import/export tools)
---

## Future Backlog
- **Rich Recipe Form v2** (structured ingredients & step builder)
  - Ingredient rows with **name, amount, unit**; add/remove/reorder
  - Step builder with numbered steps; add/remove/reorder
  - Nice-to-haves: unit presets (g, ml, cup, tbsp…), fraction input (½, ⅓), keyboard shortcuts (Enter to add row), validation
- Favorites ⭐  
- Recipe lists & combos 📂  
- Planner templates 🗓  
- Recently added / recently cooked view 🕒  
- Recipe ratings / notes 📝  
- AI recipe generation 🤖  
- Sharing recipes 🔗  
- Recipe photos 📷  
- Shopping list export 🛒  
- Ingredient-level filters (e.g., allergen-free) 🌱  
- Multi-user/household mode 👨‍👩‍👧‍👦  
- Mobile UX enhancements (swipe-to-delete, tap-hold move) 📱  
- Seed library (open dataset ingestion) 🌍
- Payment and subscription management

📖 Full backlog & priorities → ./ROADMAP.md
---


```

---

## Data Tools

The app supports export/import of recipes and meal plans, but these are disabled by default.
Enable with an env flag during development:

# Option 1: Run with env variable
NEXT_PUBLIC_ENABLE_DATA_TOOLS=true npm run dev

# Option 2: .env.local file
echo "NEXT_PUBLIC_ENABLE_DATA_TOOLS=true" > .env.local
npm run dev

Then restart and look for “Data” in the nav bar.
# Export → download JSON of recipes + planner
# Import → upload JSON (merge or replace mode)
# In production: disabled by default (404 unless env flag is set)

### Access Data Tools
1. **Enable the environment variable** (see above)
2. **Restart the dev server** if using `.env.local`
3. **Look for "Data" link** in the navigation bar
4. **Click "Data"** to access Export/Import functionality

### Data Tools Features
- **Export**: Download all recipes and meal plans as JSON
- **Import**: Upload JSON files to add/merge data
- **Merge Mode**: Safely combine data without losing existing content
- **Replace Mode**: Replace planner data completely (use with caution)

### Production Deployment
- Data tools are **disabled by default** in production
- Set `NEXT_PUBLIC_ENABLE_DATA_TOOLS=true` in your deployment environment if needed
- The `/data` page will show a 404 if tools are disabled
