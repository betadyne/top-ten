# Drag Ranking + Empty State Fix

## TL;DR

> Fix empty state layout (remove nested "Selections" wrapper when empty) and implement drag-and-drop ranking using `@dnd-kit/svelte` with visible rank numbers on each item.
>
> **Deliverables**:
> - Uninstall `@dnd-kit/core` (React), install `@dnd-kit/svelte` (Svelte 5)
> - Empty state shows clean "Top 10 {Category}" preview box directly
> - Selections list supports drag-to-reorder with `@dnd-kit/svelte/sortable`
> - Each `ListItem` displays its current rank number (1–10) on the left
>
> **Estimated Effort**: Short–Medium
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: T1 → T4 → F1-F4

---

## Context

### Original Request
User showed screenshot of ugly nested borders in empty "Selections (0/10)" section. Requests:
1. Remove "Selections" wrapper when empty — show preview box directly
2. Add drag-and-drop to reorder ranked items
3. Show rank numbers on the left of each selection item

### Research Findings
- `@dnd-kit/core` (currently installed) is **React-only** — cannot be used in Svelte
- `@dnd-kit/svelte` is the official Svelte 5 adapter (published 2026-02, requires Svelte ^5.29)
- `listStore` **already** has `reorderItems()` action that remaps `rank: index + 1`
- `listStore.addItem()` and `listStore.removeItem()` already maintain correct rank continuity
- API persistence (`/api/list/[id]/`) already stores and returns `rank` field ordered by `rank ASC`

### Metis Review
**Identified Gaps** (addressed in this plan):
- DnD library mismatch → Resolved: use `@dnd-kit/svelte` + `@dnd-kit/svelte/sortable`
- Store already has reorder logic → No new store action needed
- Touch/mobile support → `@dnd-kit/svelte` includes PointerSensor by default

---

## Work Objectives

### Core Objective
Replace React-only `@dnd-kit/core` with `@dnd-kit/svelte`, fix empty state layout, and enable drag-to-reorder ranking with visible rank numbers.

### Concrete Deliverables
- `package.json` — dependency swap (@dnd-kit/core out, @dnd-kit/svelte in)
- `src/lib/components/ListCreator.svelte` — conditional empty state + DnD sortable integration
- `src/lib/components/ListItem.svelte` — rank number display + drag handle
- `src/lib/styles/global.css` — drag active state styles + rank number styling

### Definition of Done
- [ ] `npm run build` passes with zero errors
- [ ] Empty state: `.selections-section` is absent from DOM; `.list-preview` is direct child of right column
- [ ] Filled state: items can be dragged to reorder; ranks update 1–N automatically
- [ ] Saved list preserves rank order; viewed at `/list/{id}` in correct order

### Must Have
- `@dnd-kit/svelte` installed and `@dnd-kit/core` removed
- Empty state shows only preview box (no "Selections" header)
- Drag-to-reorder works with mouse and touch
- Rank numbers visible on every selected item

### Must NOT Have (Guardrails)
- Do NOT install `react`, `react-dom`, or any React bridge
- Do NOT modify API routes, database schema, or save payload shape
- Do NOT modify `/list/[id]/+page.svelte` view page
- Do NOT add animation libraries or complex transitions
- Do NOT change search result behavior or `ItemCard`

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test framework configured)
- **Automated tests**: None
- **Agent-Executed QA**: YES — every task includes Playwright or store-state verification

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — swap deps + UI prep, 3 parallel tasks):
├── T1: Swap DnD dependency (uninstall core, install svelte)
├── T2: Verify/audit listStore reorderItems (no code change likely)
└── T3: Update ListItem.svelte — rank number + drag handle markup

Wave 2 (Integration + styling — depends on Wave 1, 2 parallel tasks):
├── T4: ListCreator.svelte — conditional empty state + @dnd-kit/svelte sortable
└── T5: global.css — drag-active styles + rank number styling

Wave FINAL (After ALL implementation tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T4 → F1-F4 → user okay
Parallel Speedup: T2/T3 parallel with T1; T5 parallel with T4
```

### Dependency Matrix
- **T1**: None → T4
- **T2**: None → T4
- **T3**: None → T4
- **T4**: T1, T2, T3 → F1-F4
- **T5**: T3 → F1-F4

### Agent Dispatch Summary
- **Wave 1**: T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: T4 → `deep`, T5 → `visual-engineering`
- **FINAL**: F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` (+playwright), F4 → `deep`

---

## TODOs

- [x] T1. **Swap DnD dependency** — `@dnd-kit/core` out, `@dnd-kit/svelte` in

  **What to do**:
  1. Run `npm uninstall @dnd-kit/core`
  2. Run `npm install @dnd-kit/svelte @dnd-kit/dom`
  3. Verify `package.json` no longer contains `@dnd-kit/core`
  4. Verify `node_modules/@dnd-kit/svelte` exists
  5. Run `npm run build` to ensure dependency resolution is clean

  **Must NOT do**:
  - Do NOT install `react` or `react-dom`
  - Do NOT leave `@dnd-kit/core` in package.json

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3)
  - **Blocks**: T4
  - **Blocked By**: None

  **References**:
  - `package.json` — current dependency list
  - `@dnd-kit/svelte` docs: https://dndkit.com/svelte/quickstart — installation requirements

  **Acceptance Criteria**:
  - [ ] `grep '"@dnd-kit/core"' package.json` → no matches
  - [ ] `ls node_modules/@dnd-kit/svelte` → directory exists
  - [ ] `npm run build` → succeeds with zero errors

  **QA Scenarios**:
  ```
  Scenario: Dependency swap succeeds
    Tool: Bash
    Preconditions: Project checked out, npm available
    Steps:
      1. Run `cat package.json | grep dnd-kit`
      2. Assert output contains `@dnd-kit/svelte` and NOT `@dnd-kit/core`
      3. Run `npm run build`
    Expected Result: Build completes successfully
    Evidence: .sisyphus/evidence/t1-deps-swap.log
  ```

  **Commit**: YES — standalone commit
  - Message: `chore(deps): swap @dnd-kit/core for @dnd-kit/svelte`

---

- [x] T2. **Audit listStore.reorderItems()** — verify existing action correctness

  **What to do**:
  1. Read `src/lib/stores/listStore.ts`
  2. Verify `reorderItems` action exists and correctly remaps `rank: index + 1`
  3. Verify `addItem` sets `rank: state.items.length + 1`
  4. Verify `removeItem` filters then remaps ranks to be contiguous
  5. If any of these are broken, fix them; otherwise no code change needed

  **Must NOT do**:
  - Do NOT add new store actions unless existing ones are broken
  - Do NOT change store interface shape (types remain same)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3)
  - **Blocks**: T4
  - **Blocked By**: None

  **References**:
  - `src/lib/stores/listStore.ts` — existing store implementation
  - `src/lib/types/index.ts` — `ListItem` type with `rank: number`

  **Acceptance Criteria**:
  - [ ] `reorderItems` exists and sets `rank: index + 1` for all items
  - [ ] `addItem` sets `rank` to next available number
  - [ ] `removeItem` renumbers remaining items 1–N without gaps

  **QA Scenarios**:
  ```
  Scenario: Store rank logic is correct
    Tool: Bash (node REPL via tsx or bun)
    Preconditions: Store file exists
    Steps:
      1. Import listStore
      2. Add 3 mock items, verify ranks are 1,2,3
      3. Call reorderItems with reversed array, verify ranks become 1,2,3
      4. Remove middle item, verify remaining ranks are 1,2
    Expected Result: All rank values are contiguous 1-based
    Evidence: .sisyphus/evidence/t2-store-ranks.log
  ```

  **Commit**: NO (bundled with T4 commit if no changes, or separate fix commit if changes needed)

---

- [x] T3. **Update ListItem.svelte** — visible rank number + drag handle markup

  **What to do**:
  1. Read `src/lib/components/ListItem.svelte`
  2. Ensure rank number is displayed prominently on the left side
  3. Add a drag handle element (small grip icon or area) that can be attached to `@dnd-kit/svelte` later
  4. Keep existing remove button functionality
  5. Use existing monochrome CSS variables for styling

  **Must NOT do**:
  - Do NOT remove existing remove button
  - Do NOT change item image or title display logic
  - Do NOT add complex animations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: (none needed)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2)
  - **Blocks**: T4, T5
  - **Blocked By**: None

  **References**:
  - `src/lib/components/ListItem.svelte` — current component
  - `src/lib/styles/global.css` — `.list-item`, `.list-item-rank` classes
  - `@dnd-kit/svelte` docs — `createSortable` + `attachHandle` pattern

  **Acceptance Criteria**:
  - [ ] Rank number visible as first element in each ListItem
  - [ ] Drag handle element present (can be simple div with class, styled later in T5)
  - [ ] Remove button still works
  - [ ] No TypeScript errors

  **QA Scenarios**:
  ```
  Scenario: ListItem displays rank and drag handle
    Tool: Playwright
    Preconditions: Dev server running, at least 1 item added to list
    Steps:
      1. Navigate to /anime
      2. Search and add 2 items
      3. Assert `.list-item-rank` contains "1" for first item
      4. Assert `.list-item-rank` contains "2" for second item
      5. Assert `.drag-handle` element exists in DOM
    Expected Result: Both items show correct rank numbers; drag handle present
    Evidence: .sisyphus/evidence/t3-listitem-ranks.png
  ```

  **Commit**: NO (bundled with T4+T5)

---

- [x] T4. **Integrate @dnd-kit/svelte sortable into ListCreator.svelte**

  **What to do**:
  1. Conditionally render `.selections-section` ONLY when `$listStore.items.length > 0`
  2. When empty, render `.list-preview` directly as child of `.list-creator-right` (no section wrapper)
  3. Wrap selections `<ol>` with `@dnd-kit/svelte` sortable primitives:
     - Import `{DragDropProvider, createSortable}` from `@dnd-kit/svelte/sortable`
     - Create sortable context with items keyed by `item.id`
     - On drag end, compute new order and call `listStore.reorderItems(newOrderedItems)`
  4. Each `ListItem` receives sortable attachment via prop or context
  5. Ensure keyboard accessibility (up/down arrows) via `@dnd-kit/svelte` built-in sensors

  **Must NOT do**:
  - Do NOT modify search results area or `ItemCard`
  - Do NOT change Settings fieldset
  - Do NOT add React hooks or JSX

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: (none needed)
  - **Reason**: Requires careful integration of third-party library with existing Svelte 5 runes and store patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F4
  - **Blocked By**: T1, T2, T3

  **References**:
  - `src/lib/components/ListCreator.svelte` — current component to modify
  - `src/lib/stores/listStore.ts` — `reorderItems` action
  - `@dnd-kit/svelte` docs: https://dndkit.com/svelte/components/drag-drop-provider
  - `@dnd-kit/svelte/sortable` — `createSortable` primitive
  - `src/lib/components/ListItem.svelte` — must receive sortable attach prop

  **WHY Each Reference Matters**:
  - `ListCreator.svelte`: Main integration point — need to add DragDropProvider and sortable logic
  - `listStore.ts`: `reorderItems` is the single source of truth for rank remapping
  - `@dnd-kit/svelte` docs: Shows Svelte 5 `{@attach}` directive and sortable patterns

  **Acceptance Criteria**:
  - [ ] Empty state: `.selections-section` NOT in DOM; `.list-preview` visible directly
  - [ ] Filled state: `.selections-section` present with "Selections (N/10)" header
  - [ ] Dragging an item updates its position visually
  - [ ] After drop, `listStore` items have updated `rank` values (1–N)
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Empty state shows clean preview
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to /anime
      2. Assert `.selections-section` is NOT in DOM
      3. Assert `.list-preview` is visible
      4. Assert `.list-preview-title` text is "Top 10 Anime"
    Expected Result: Clean preview box without "Selections" wrapper
    Evidence: .sisyphus/evidence/t4-empty-state.png

  Scenario: Drag reorder updates ranks
    Tool: Playwright
    Preconditions: 3 items added to list
    Steps:
      1. Note current item order and ranks
      2. Drag item #3 to position #1 using sortable drag
      3. Assert first `.list-item-rank` now shows "1" for the moved item
      4. Assert all items show contiguous ranks 1,2,3
    Expected Result: Visual order matches rank numbers after drag
    Evidence: .sisyphus/evidence/t4-drag-reorder.png
  ```

  **Commit**: YES — bundles T3+T4+T5
  - Message: `feat: drag-to-reorder ranking with visible rank numbers`

---

- [x] T5. **Update global.css** — drag-active styles + rank number styling

  **What to do**:
  1. Add `.drag-handle` styles: small grip area (e.g., `⋮⋮` or `≡` symbol), monochrome
  2. Add `.dragging` class styles: opacity reduction or border highlight during drag
  3. Add `.list-item-rank` enhancement: larger/bolder font to make rank numbers stand out
  4. Ensure all new styles use existing CSS variables (`--fg`, `--bg`, `--border`, etc.)
  5. Keep responsive behavior intact

  **Must NOT do**:
  - Do NOT add new color values outside monochrome palette
  - Do NOT add complex animations or transitions
  - Do NOT change existing component styles beyond what's needed

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: (none needed)
  - **Reason**: Pure CSS styling task within existing design system

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T4)
  - **Parallel Group**: Wave 2
  - **Blocks**: F3 (QA needs these styles)
  - **Blocked By**: T3 (needs markup classes from ListItem)

  **References**:
  - `src/lib/styles/global.css` — existing styles
  - `src/lib/components/ListItem.svelte` — markup classes to target
  - `@dnd-kit/svelte` docs — CSS classes applied during drag (e.g., `data-dragging`)

  **Acceptance Criteria**:
  - [ ] `.drag-handle` has visible cursor and hover state
  - [ ] Dragging item has visual feedback (opacity/border change)
  - [ ] Rank numbers are clearly visible and styled within monochrome system
  - [ ] No regressions in existing layout

  **QA Scenarios**:
  ```
  Scenario: Drag styles are applied correctly
    Tool: Playwright
    Preconditions: 2 items in list
    Steps:
      1. Start dragging first item
      2. Screenshot during drag
      3. Assert dragged item has distinct visual state (border/opacity change)
    Expected Result: Visual feedback during drag operation
    Evidence: .sisyphus/evidence/t5-drag-styles.png
  ```

  **Commit**: NO (bundled with T3+T4)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  **Initial: REJECT** → **Fixed → APPROVE**
  Must Have [4/4] | Must NOT Have [5/5] | Tasks [5/5]
  Issues found & fixed:
  - `ListItem.svelte:18` — `sortable.index` property didn't exist on type. Fixed: `sortable.sortable.index = index`
  - `ListCreator.svelte:50` — `event: any` anti-pattern. Fixed: typed as `DragEndEvent`
  - Missing evidence files — F3 QA generated screenshots in `final-qa/`

- [x] F2. **Code Quality Review** — `unspecified-high`
  **Initial: REJECT** → **Fixed → APPROVE**
  Build [PASS] | TypeCheck [PASS — 0 errors, 2 expected warnings] | Files [3 clean]
  Issues found & fixed:
  - `sortable.index` TypeScript error — fixed
  - `event: any` — replaced with `DragEndEvent` + type assertion for `.index`
  - 2 Svelte `state_referenced_locally` warnings in `ListItem.svelte:15` — expected with @dnd-kit/svelte API

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  **APPROVE**
  Scenarios [4/4 pass] | Integration [PASS]
  Screenshots saved to `.sisyphus/evidence/final-qa/`:
  - scenario1-empty-state.png
  - scenario2-add-items.png
  - scenario3-drag-reorder.png
  - scenario4-remove-item.png

- [x] F4. **Scope Fidelity Check** — `deep`
  **APPROVE**
  Tasks [5/5 compliant] | Contamination [CLEAN] | Unaccounted [CLEAN]
  Minor deviations noted (no functional impact):
  - `DragDropProvider` imported from `@dnd-kit/svelte` vs `@dnd-kit/svelte/sortable`
  - `list-item-rank` font-size `text-lg` vs plan's "larger" wording

---

## Commit Strategy

- **T1**: `chore(deps): swap @dnd-kit/core for @dnd-kit/svelte`
- **T3+T4+T5**: `feat: drag-to-reorder ranking with visible rank numbers`
- **Pre-commit**: `npm run check && npm run build`

---

## Success Criteria

### Verification Commands
```bash
npm run check   # Expected: 0 errors
npm run build   # Expected: build succeeds
```

### Final Checklist
- [x] `@dnd-kit/core` removed from package.json
- [x] `@dnd-kit/svelte` installed and importable
- [x] Empty state shows preview box directly (no "Selections" wrapper)
- [x] Drag-to-reorder works on selections list
- [x] Rank numbers display 1–N correctly after reorder
- [x] Saved list persists correct rank order
- [x] View page `/list/{id}` shows items in correct rank order
