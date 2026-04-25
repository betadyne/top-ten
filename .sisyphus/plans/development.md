# Plan: Top 10 List Maker - Development

**Generated:** 2026-04-24
**Status:** In Progress
**Project:** /mnt/Data/Tugas/Project/top-ten

---

## Task List

### Phase 1: Foundation
- [ ] **Task 1**: Implementasi API Proxy (AniList, VNDB, RanobeDB)
  - File: `src/routes/api/anime/search/+server.ts` - AniList GraphQL proxy
  - File: `src/routes/api/char/search/+server.ts` - AniList + VNDB parallel proxy
  - File: `src/routes/api/ranobe/search/+server.ts` - RanobeDB proxy
  - File: `src/routes/api/vn/search/+server.ts` - VNDB proxy
  - Verify: All endpoints return normalized SearchResult[]

### Phase 2: Core Features
- [ ] **Task 2**: Implementasi Search & Select Items (F-002)
  - Component: `SearchBar.svelte` with debounce
  - Component: `ItemCard.svelte` with "Add to List" button
  - Integration: Connect to API proxy endpoints
  - Verify: Search works for all 4 categories

- [ ] **Task 3**: Implementasi Drag & Drop Ranking (F-003)
  - Component: `ListItem.svelte` with drag handle
  - Integration: @dnd-kit/core for reordering
  - Feature: Support mouse + touch
  - Verify: Items can be reordered

- [ ] **Task 4**: Implementasi Create List & Save (F-001)
  - API: `src/routes/api/list/+server.ts` - POST create list
  - API: `src/routes/api/list/[id]/+server.ts` - GET list by ID
  - Component: `ListCreator.svelte` - Main creation interface
  - Pages: `/anime`, `/char`, `/ranobe`, `/vn`
  - Verify: Lists are saved to D1 database

- [ ] **Task 5**: Implementasi List Preview & Share (F-004)
  - Page: `src/routes/list/[id]/+page.svelte`
  - Feature: Display list with ranks 1-10
  - Feature: Copy link to clipboard
  - Verify: Shareable links work

- [ ] **Task 6**: Implementasi Homepage & Category Selection
  - Page: `src/routes/+page.svelte`
  - Component: `CategoryCard.svelte`
  - Layout: `src/routes/+layout.svelte`
  - Verify: Navigation works to all categories

### Phase 3: Polish & Deploy
- [ ] **Task 7**: Testing & Verification
  - TypeScript check: 0 errors
  - Build: Successful
  - Functional test: Create list → Save → View
  - API test: All search endpoints

- [ ] **Task 8**: Deploy ke Cloudflare Pages
  - Build production
  - Deploy to Pages
  - Add custom domain: rank.shiroha.my.id
  - Verify: Site accessible

---

## Current Status
- [x] Project initialized
- [x] Dependencies installed
- [x] Database schema created
- [x] Wrangler config updated
- [x] Basic structure created
- [ ] Implementation complete
- [ ] Deployed

---

## Notes
- Develop locally first before deploying
- Test each API endpoint with curl before frontend integration
- Use `npm run dev` for local development
- Use `npm run build` for production build
