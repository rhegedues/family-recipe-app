Family Recipe App — Sprint 3
🎯 Goals

Improve the recipe entry flow so users can add richer, structured recipes (not just plain text).

Enhance discovery by making search truly global and consistent across the app.

Begin polishing filters and planner usability with small, high-impact upgrades.

🚨 Must (non-negotiable)
Recipe Form Improvements

Structured ingredient builder (rows with name + quantity + unit, add/remove rows)

Step builder (add/reorder/remove steps)

Source / provenance field (text + optional tag, e.g. “Ottolenghi”)

Discovery

Global search: extend Fuse.js beyond QuickAdd & Recipe List → top-level search (navbar/command palette)

Accessible everywhere, supports titles, ingredients, steps, tags

Deliverables

 Ingredient builder implemented (structured rows with qty/unit)

 Step builder implemented (structured, reorderable steps)

 Source/provenance field in form + display on recipe detail

 Global search bar (navbar or Cmd+K) that queries all recipes consistently

✅ Should (important but can slip)

Recipe form: basic photo upload (local only — base64 or object URL, no backend yet)

Filters:

Active/removable filter pills or other polish

Filter panel wired to “Filter” button (facets: Time, Difficulty, Cuisine, Extra)

Planner: duplicate week button (copy week contents forward)

Deliverables

 Add 1 photo per recipe, stored locally (no backend)

 Active filter chips improved (removable pills or polish)

 Filter panel opens from “Filter” button

 Selections apply to recipe list & persist in URL

 Clear all resets panel + chip row

 Duplicate week button working in planner

✨ Stretch (nice-to-have)

Shopping list export (aggregate all ingredients per week, no dedupe/units merging yet)

Template system foundations (hardcode one demo template “Balanced Basics” to apply constraints to 1 week)

Deliverables

 Export plain shopping list from current week’s planner

 Demo template “Balanced Basics” visible + constraints filter QuickAdd (hardcoded, not editable yet)

💡 Decisions & Rationale

Prioritize structured recipe entry: improves long-term usability, unlocks future features (shopping list, nutrition, sharing).

Add provenance/source early: prepares for ingestion of external recipes in the future.

Keep shopping list + templates as stretch: valuable demonstrations, but core entry/discovery comes first.

Photo upload scoped to local-only MVP: avoids backend complexity before Sprint 5.

Filter panel now prioritized into Sprint 3 to make use of the existing “Filter” button in the UI.

⚠️ Known Risks

Ingredient/step builders may require more complex state handling.

Global search performance must be validated on larger datasets.

Even simple photo upload may complicate deployment if not scoped tightly (storage, build size).

Filter panel sync (chips ↔ panel ↔ URL state) may require careful store design.

🔜 Next Steps

Sprint 4: expand shopping list functionality (deduping + quantities), add planner tools (add-to-planner from recipe cards), and start on community features (favorites, recipe lists).