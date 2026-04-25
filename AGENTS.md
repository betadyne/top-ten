# Top 10 List Maker - AGENTS.md

**Generated:** 2026-04-24
**Stack:** SvelteKit 5 + TypeScript + Cloudflare Pages
**Adapter:** @sveltejs/adapter-cloudflare

---

## OVERVIEW
Aplikasi web untuk membuat dan membagikan daftar "Top 10" untuk Anime, Character, Light Novel, dan Visual Novel. Menggunakan API eksternal (AniList, VNDB, RanobeDB) untuk pencarian data.

---

## STRUCTURE

```
src/
├── lib/
│   ├── components/     # Svelte components (CategoryCard, SearchBar, ItemCard, ListItem, ListCreator)
│   ├── stores/         # Svelte stores (listStore, searchStore)
│   ├── types/          # TypeScript types & interfaces
│   ├── utils/          # Helpers (api, cache, id, image)
│   └── assets/         # Static assets
├── routes/
│   ├── +page.svelte    # Homepage (category selection)
│   ├── +layout.svelte  # Root layout
│   ├── anime/          # Create Top 10 Anime
│   ├── char/           # Create Top 10 Character
│   ├── ranobe/         # Create Top 10 Light Novel
│   ├── vn/             # Create Top 10 Visual Novel
│   ├── list/[id]/      # View shared list
│   └── api/
│       ├── anime/search/+server.ts    # Proxy AniList GraphQL
│       ├── char/search/+server.ts     # Proxy AniList + VNDB
│       ├── ranobe/search/+server.ts   # Proxy RanobeDB
│       ├── vn/search/+server.ts       # Proxy VNDB
│       ├── list/+server.ts            # POST create list
│       └── list/[id]/+server.ts       # GET list by ID
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new component | `src/lib/components/` | Export dari `index.ts` |
| Add new type | `src/lib/types/index.ts` | Re-export semua types |
| Add new utility | `src/lib/utils/` | Export dari file masing-masing |
| Add new page | `src/routes/[path]/+page.svelte` | Follow SvelteKit routing |
| Add new API endpoint | `src/routes/api/[name]/+server.ts` | Export GET/POST handlers |
| Update database schema | `schema.sql` | Run via wrangler d1 execute |
| Update Cloudflare config | `wrangler.jsonc` | Bindings, compatibility flags |

---

## CONVENTIONS

### Svelte 5 Runes Mode
- Gunakan `$state()` untuk reactive state
- Gunakan `$derived()` untuk computed values
- Gunakan `$effect()` untuk side effects
- Gunakan `$props()` untuk component props
- **JANGAN** gunakan `let` untuk reactive vars di Svelte 5

### TypeScript
- Strict mode enabled
- Semua file `.ts` atau `.svelte` dengan `lang="ts"`
- Type imports gunakan `import type { ... }`

### API Routes
- Selalu validasi input dengan Zod
- Return `json()` atau `error()` dari `@sveltejs/kit`
- Cache search results di KV (TTL 10 menit)

### Image Handling
- SELALU gunakan `weservUrl()` dari `$lib/utils/image`
- Thumbnail: `weservUrl(url, 150)`
- Detail: `weservUrl(url, 400)`
- Auto-convert ke WebP

### ID Generation
- Gunakan `generateId()` dari `$lib/utils/id`
- Implementasi: `crypto.randomUUID()` (Web API bawaan)
- **JANGAN** install nanoid, cuid, atau uuid

---

## ANTI-PATTERNS

- **JANGAN** simpan image blob di database (hanya URL)
- **JANGAN** gunakan `any` type (kecuali benar-benar unavoidable)
- **JANGAN** styling/CSS berlebihan (plain HTML + layout CSS only)
- **JANGAN** skip Zod validation di API routes
- **JANGAN** cache list view (/list/[id]) di KV (immutable, gunakan Cache-Control header)

---

## COMMANDS

```bash
# Development
npm run dev

# Type check
npm run check

# Build
npm run build

# Preview production build
npm run preview

# Generate Wrangler types
npm run gen

# D1 database commands
npx wrangler d1 create top-ten-db
npx wrangler d1 execute top-ten-db --local --file=./schema.sql
```

---

## NOTES

### Cloudflare Bindings (wrangler.jsonc)
- `DB`: D1 database binding untuk lists dan list_items
- `TOP_TEN_KV`: KV namespace untuk caching search results
- Database ID dan KV ID di wrangler.jsonc masih placeholder (`00000000...`)
- Update dengan ID aktual setelah create via Wrangler CLI

### External APIs
- **AniList**: GraphQL endpoint, no API key required
- **VNDB**: REST endpoint, rate limit 200 req/5min
- **RanobeDB**: REST endpoint, rate limit 60 req/min

### Drag & Drop
- Menggunakan `@dnd-kit/core` (bukan svelte-dnd-action)
- Support mouse dan touch
- ListCreator component sudah include DnD logic

### Database Schema
- `lists`: id (PK), title, category, creator_name, is_public, created_at, updated_at
- `list_items`: id (PK), list_id (FK), external_id, source, rank, title, alt_title, image_url, metadata
- Metadata disimpan sebagai JSON string

---

## PRD Reference

Full PRD: `/mnt/Data/Tugas/Project/top-ten/PRD.md`
