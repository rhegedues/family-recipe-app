# Family Recipe App — Sprint 2

## Sprint 2 Scope (with Priorities)

> 💡 Tip: To work on a task, copy its line (e.g. `Task: [ ] ...`) into Cursor chat — this gives Cursor the exact context it needs.

### 🚨 Must (non-negotiable)

**Meal Planner**
- [x] Remove stray recipe list from Planner page
- [x] Prev / This Week / Next navigation buttons
- [x] Quick Add Dialog (search bar + recipe list results)
- [x] Add recipe into slot by Enter/click
- [x] Recipe titles in Planner link to Recipe detail page
- [x] Show date range below week label (updates with navigation)
- [x] Show month/day next to weekday in the grid
- [x] Transpose grid (Days across, Meals down)
- [x] Stack multiple recipes vertically in each cell
- [x] Planner grid: fixed column widths + spacing
- [x] Planner cell content: wrap long text, stack items, no bullets
- [x] Planner empty state: single, subtle message per cell

**Recipe Detail Page**
- [x] `/recipes/[id]` page with title, categories, badges, description, ingredients, steps
- [x] **Enable Edit & Delete on detail page only** (with confirmation + proper redirects/toasts)

**Recipes List**
- [x] **Remove Edit/Delete buttons from recipe cards/list items** (list should only navigate to detail)

**Data Management**
- [x] Define JSON schema with `schemaVersion`
- [x] Export recipes + planner as JSON
- [x] Import JSON (validate + merge by ID)
- [x] Create /data page but hide it in production

**Filters**
- [ ] Active chip styling (filled, white text)

**UX Refinements**
- [x] Toast notifications (Save/Delete/Import/Export)
- [ ] Keyboard shortcuts (Esc to close, Cmd/Ctrl+Enter to save)
- [ ] Accessibility: aria-labels, dialog roles, focus trap

**Deployment**
- [ ] Prepare for Vercel deployment

---

### ✅ Should (important but OK to slip)

**Meal Planner**
- [x] Clear week button
- [ ] Duplicate week button (copy to next)
- [ ] “Add to Planner” button on Recipe cards

**Recipe Detail Page**
- [ ] Print-friendly stylesheet
- [ ] Copy link button
- [x] Back to list navigation
- [ ] Visual polish (badge layout, meta rows, spacing, headings)

**Data Management**
- [ ] Load sample data (dev-only when empty)

**Filters**
- [ ] Removable filter pills for active filters (chips/search/tags)
- [ ] Filter panel (⚙️ with Time, Difficulty, Cuisine, Extra tags)

**UX Refinements**
- [ ] Focus management (return focus to trigger after modal close)

**Deployment**
- [ ] Favicon + SEO meta tags (title, description, open graph)
- [ ] Simple 404 page

---

### ✨ Stretch (nice-to-have)

**Meal Planner**
- [ ] “Jump to Recipes” link at top of Planner page

---

## Suggested Flow
- **Week 1:** Cleanup + Planner Core + Recipe Detail basics  
- **Week 2:** Data Management + Filter polish  
- **Week 3:** UX refinements + Deployment polish  

---

## Dependency Map

**Meal Planner**
- `Remove stray recipe list` → do first (cleanup baseline).  
- `Prev/This Week/Next navigation` → standalone, can be done early.  
- `Quick Add Dialog` → depends on JSON schema (Data Management) for future-proofing search.  
- `Add recipe into slot` → depends on Quick Add Dialog.  
- `Recipe titles link to detail page` → depends on Recipe Detail Page existing.  

**Recipe Detail Page**
- Base page → prerequisite for linking from Planner and for Print/Copy/Back nav.  
- Print-friendly stylesheet, Copy link button, Back nav → depend on base page.  

**Data Management**
- `Define JSON schema` → prerequisite for Export, Import, and Quick Add reliability.  
- `Export` → depends on schema.  
- `Import` → depends on schema.  
- `Load sample data` → depends on Import working.  

**Filters**
- `Active chip styling` → standalone, low dependency.  
- `Removable pills` and `Filter panel` → depend on base filter logic (from Sprint 1, already present).  

**UX Refinements**
- Toasts → can be added progressively, no dependencies.  
- Keyboard shortcuts → depend on modals/dialogs being stable.  
- Accessibility roles/focus trap → depend on dialogs being in place.  
- Focus management → depends on dialogs too.  

**Deployment**
- Prep Vercel deployment → can be done anytime once Must-haves are stable.  
- Favicon, SEO tags, 404 page → final polish after deployment prep.  

---

## 📊 Dependency Diagram

```text
Meal Planner
 ├─ Remove stray recipe list  (start here)
 ├─ Prev/This/Next navigation (independent)
 ├─ Quick Add Dialog
 │    └─ depends on JSON schema (Data Management)
 ├─ Add recipe into slot
 │    └─ depends on Quick Add Dialog
 └─ Recipe titles link to detail page
      └─ depends on Recipe Detail Page (base)

Recipe Detail Page
 ├─ Base page (/recipes/[id]) (must do first)
 ├─ Print-friendly stylesheet
 ├─ Copy link button
 └─ Back to list navigation
      └─ all depend on Base page

Data Management
 ├─ Define JSON schema (prerequisite)
 ├─ Export JSON
 │    └─ depends on schema
 ├─ Import JSON
 │    └─ depends on schema
 └─ Load sample data
      └─ depends on Import JSON

Filters
 ├─ Active chip styling (independent)
 ├─ Removable pills
 └─ Filter panel
      └─ both depend on base filters (Sprint 1, already done)

UX Refinements
 ├─ Toasts (independent, incremental)
 ├─ Keyboard shortcuts
 │    └─ depends on stable modals/dialogs
 ├─ Accessibility (roles, focus trap)
 │    └─ depends on dialogs
 └─ Focus management
      └─ depends on dialogs

Deployment
 ├─ Prep Vercel deployment (independent, anytime after core features)
 ├─ Favicon + SEO tags
 └─ 404 page
      └─ both after deployment prep

---

## Labels (for quick tagging in Cursor)
- `planner`  
- `recipes`  
- `data`  
- `filters`  
- `ux`  
- `deployment`  

## Future Backlog
- Rich Recipe Form v2: step builder for ingredients (name + amount + unit) and cooking steps (numbered list with add/remove/reorder)
- Favorites (flag/star recipes)
- Recipe lists (user-defined: e.g. Kids’ favorites, Holiday meals)
- Course combos (group multiple recipes into a saved “meal set”)
- AI-generated recipes
- Recipe sharing
- Upload recipe photos
- Seed library / bootstrapping from open data
