# Family Recipe App

## Overview
The Family Recipe App helps families collect, organize, and plan meals easily.  
The app supports **recipe management** and a **weekly meal planner**, with a focus on clean UI and quick filtering.

---

## Current Features (after Sprint 1 ✅)
1. **Recipe Management**
   - Add, edit, delete recipes with confirmation dialogs  
   - Multi-category tags (Course, Diet, Cuisine, Time, Difficulty, Extra)  
   - Title, description, ingredients, steps  

2. **Search & Filtering**
   - Full-text search across titles, ingredients, steps, tags  
   - Category filter chips (AND logic)  

3. **Meal Planner**
   - Week-based planner stored in localStorage  
   - Basic grid view (Breakfast, Lunch, Dinner slots)  

4. **UI & UX**
   - Tailwind theming with gradient hero + clean cards  
   - Save/Discard confirmation dialogs  
   - Hydration issues fixed  

---

## In Progress (Sprint 2 🚀)
- **Meal Planner polish** (navigation, quick add dialog, recipe linking)  
- **Data management** (import/export JSON, sample data)  
- **Recipe detail page** (print-friendly, copy link)  
- **Filter polish** (active chip styling, removable pills, filter panel)  
- **UX refinements** (toasts, keyboard shortcuts, accessibility)  
- **Deployment** (Vercel prep, favicon, SEO, 404 page)  

See 👉 [`SPRINT2.md`](./SPRINT2.md) for the detailed sprint backlog.  

---

## Tech Stack
- **Frontend**: Next.js (React + App Router)  
- **UI**: TailwindCSS  
- **State Management**: Zustand  
- **Search**: Fuse.js  
- **Storage**: localStorage (for planner + recipes, with import/export)  

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

---

## How to Run
```bash
# install dependencies
npm install

# run dev server
npm run dev

# build for production
npm run build
```

---

## Data Management Tools

The app includes Export/Import functionality for recipes and meal plans, but it's **disabled by default** for security. To enable data management tools:

### Enable Data Tools (Development)
```bash
# Option 1: Set environment variable when starting dev server
NEXT_PUBLIC_ENABLE_DATA_TOOLS=true npm run dev

# Option 2: Create .env.local file
echo "NEXT_PUBLIC_ENABLE_DATA_TOOLS=true" > .env.local
npm run dev
```

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
