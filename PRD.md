# Product Requirements Document (PRD)

## Top 10 List Maker - Anime & Visual Media Edition

---

## 1. Overview

### 1.1 Product Name
**Top 10 List Maker**

### 1.2 Product Description
Sebuah aplikasi web interaktif yang memungkinkan pengguna untuk membuat, mengelola, dan membagikan daftar "Top 10" mereka untuk berbagai kategori konten anime dan visual media, termasuk Anime, Karakter, Light Novel, dan Visual Novel.

### 1.3 Target Audience
- Penggemar anime dan otaku
- Pembaca light novel
- Pemain visual novel
- Komunitas penggemar yang ingin berbagi daftar ranking mereka

### 1.4 Referensi Utama
- https://polls.animecorner.me/create/top-ten-list/spring-2026

---

## 2. Tech Stack

| Layer | Technology | Keterangan |
|-------|-----------|------------|
| Framework | SvelteKit | Full-stack framework dengan routing bawaan |
| Language | TypeScript | Type safety untuk development yang lebih baik |
| Styling | Plain HTML + CSS Minimal | Hanya untuk layout, tanpa styling visual berlebihan |
| Hosting | Cloudflare Pages | Serverless hosting dengan edge deployment |
| Adapter | @sveltejs/adapter-cloudflare | Kompabilitas dengan Cloudflare Workers |

### 2.1 Alasan Pemilihan Tech Stack
- **SvelteKit**: Lightweight, performant, dan memiliki routing yang powerful
- **Cloudflare Pages**: Gratis untuk personal project, deployment cepat, CDN global
- **Plain HTML/CSS**: Sesuai permintaan user - fokus pada functionality daripada visual design

### 2.2 Cloudflare Analysis

**Rekomendasi untuk scale:**
- Gunakan Cloudflare KV untuk cache search results (10 menit)
- Lazy loading images (tidak load semua thumbnail sekaligus)
- Minimalisasi jumlah API calls dengan batching

---

## 3. Features

### 3.1 Core Features (MVP)

#### F-001: Create Top 10 List
- **Deskripsi**: Pengguna dapat membuat daftar Top 10 dari kategori yang tersedia
- **Flow**:
  1. Kunjungi homepage → Pilih kategori (Anime, Character, Light Novel, Visual Novel)
  2. Redirect ke halaman kategori (`/anime`, `/char`, `/ranobe`, `/vn`)
  3. Cari item dari database eksternal sesuai kategori
  4. Tambahkan item ke daftar (maksimal 10)
  5. Atur urutan dengan drag-and-drop
  6. Simpan dan dapatkan link untuk dibagikan

#### F-002: Search & Select Items
- **Deskripsi**: Pencarian real-time dari database eksternal
- **Detail**:
  - Search dengan debounce (300ms)
  - Display hasil dengan thumbnail dan judul
  - Pagination untuk hasil pencarian
  - Preview detail item saat hover/click

#### F-003: Drag & Drop Ranking
- **Deskripsi**: Mengatur urutan item dengan drag-and-drop
- **Detail**:
  - Support mouse dan touch
  - Visual feedback saat dragging
  - Auto-save posisi
  - Animasi smooth saat reordering

#### F-004: List Preview & Share
- **Deskripsi**: Preview daftar final dan generate shareable link
- **Detail**:
  - Display vertical list dengan nomor urut 1-10
  - Show thumbnail, judul, dan sumber database
  - Generate unique URL untuk setiap list
  - Copy to clipboard functionality
  - Export sebagai image (future enhancement)

### 3.2 Kategori yang Didukung

| Kategori | Sumber Data | API Endpoint | ID Field |
|----------|------------|--------------|----------|
| Anime | AniList | GraphQL: https://graphql.anilist.co | id (Int) |
| Character | AniList + VNDB | GraphQL + REST | id (Int) / vndbid |
| Light Novel | RanobeDB | REST: https://ranobedb.org/api/v0 | id (number) |
| Visual Novel | VNDB | REST: https://api.vndb.org/kana | vndbid (string) |

### 3.3 Character Category - Detail Spesial
Karakter akan digabungkan dari 2 sumber:
- **AniList Characters**: Karakter dari anime/manga
- **VNDB Characters**: Karakter dari visual novel
- Display akan menunjukkan sumber database
- Search akan melakukan query ke kedua API secara paralel

---

## 4. API Integration Specification

### 4.1 AniList API (Anime & Character)

#### 4.1.1 Search Anime
```graphql
query SearchAnime($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
    }
    media(search: $search, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
        large
      }
      season
      seasonYear
      format
      episodes
    }
  }
}
```

#### 4.1.2 Search Character (AniList)
```graphql
query SearchCharacter($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
    }
    characters(search: $search) {
      id
      name {
        full
        native
      }
      image {
        medium
        large
      }
      media(page: 1, perPage: 1) {
        nodes {
          title {
            romaji
          }
        }
      }
    }
  }
}
```

#### 4.1.3 Rate Limiting
- AniList: Tidak ada rate limit yang ketat, tapi implementasi client-side debounce wajib

### 4.2 VNDB API (Visual Novel & Character)

#### 4.2.1 Search Visual Novel
```bash
POST https://api.vndb.org/kana/vn
Content-Type: application/json

{
  "filters": ["search", "=", "search_term"],
  "fields": "id, title, alttitle, image.url, image.thumbnail, released, developers.name",
  "results": 24,
  "page": 1
}
```

#### 4.2.2 Search Character (VNDB)
```bash
POST https://api.vndb.org/kana/character
Content-Type: application/json

{
  "filters": ["search", "=", "search_term"],
  "fields": "id, name, original, image.url, vns.title",
  "results": 24,
  "page": 1
}
```

#### 4.2.3 Rate Limiting
- 200 requests per 5 minutes
- Max 1 second execution time per minute
- Requests > 3 seconds akan di-abort
- Implementasi: Queue system dengan delay 1.5s antara request

### 4.3 RanobeDB API (Light Novel)

#### 4.3.1 Search Books
```bash
GET https://ranobedb.org/api/v0/books?q={search_term}&limit=24&page=1
```

#### 4.3.2 Search Series
```bash
GET https://ranobedb.org/api/v0/series?q={search_term}&limit=24&page=1
```

#### 4.3.3 Rate Limiting
- Tidak ada rate limit yang ketat
- Rekomendasi: Jangan melebihi 60 requests per menit
- Implementasi: Debounce 300ms + max 1 request per detik

---

## 5. Data Models

### 5.1 Unified List Item Interface
```typescript
interface ListItem {
  id: string;                    // Unique ID: "anilist_123", "vndb_v17", "ranobe_456"
  source: 'anilist' | 'vndb' | 'ranobe';
  category: 'anime' | 'character' | 'light-novel' | 'visual-novel';
  rank: number;                  // 1-10
  title: string;
  altTitle?: string;             // Original/native title
  imageUrl: string;
  thumbnailUrl: string;
  metadata: {
    // Anime specific
    episodes?: number;
    season?: string;
    year?: number;
    format?: string;
    
    // Character specific
    sourceName?: string;         // Anime/VN title where character appears
    
    // LN/VN specific
    releaseDate?: string;
    publisher?: string;
    status?: string;
  };
}
```

### 5.2 Top 10 List Interface
```typescript
interface TopTenList {
  id: string;                    // Unique shareable ID (crypto.randomUUID())
  title: string;                 // Custom title dari user
  category: 'anime' | 'character' | 'light-novel' | 'visual-novel';
  createdAt: Date;
  updatedAt: Date;
  items: ListItem[];             // Array of 1-10 items, sorted by rank
  isPublic: boolean;
  creatorName?: string;          // Optional anonymous name
}
```

### 5.3 API Response Normalization
Semua response dari API eksternal harus di-normalize ke format `ListItem` untuk konsistensi di frontend.

---

## 6. UI/UX Requirements

### 6.1 Design Philosophy
- **Plain HTML**: Semantic markup, no fancy UI libraries
- **CSS Minimal**: Hanya untuk layout (flexbox/grid), spacing, dan basic visual hierarchy
- **No Visual Styling**: Tidak ada warna tema, gradient, shadow, atau animasi decorative
- **Focus on Functionality**: User experience melalui functionality yang solid

### 6.2 Halaman/Route

#### 6.2.1 Home (`/`)
- Halaman pemilihan kategori sebagai entry point utama
- 4 opsi kategori yang ditampilkan sebagai card/tombol besar:
  - **Anime** → navigasi ke `/anime`
  - **Character** → navigasi ke `/char`
  - **Light Novel** → navigasi ke `/ranobe`
  - **Visual Novel** → navigasi ke `/vn`
- Setiap card menampilkan nama kategori dan ikon/symbol sederhana
- Penjelasan singkat aplikasi di bagian atas

#### 6.2.2 Create Anime List (`/anime`)
- **Step 1**: Search & select anime
  - Search bar di atas dengan placeholder "Search anime..."
  - Query ke AniList API untuk hasil pencarian
  - Grid/list hasil pencarian dengan thumbnail dan judul
  - Tombol "Add to List" pada setiap item
  - Counter "X/10 items selected"
- **Step 2**: Arrange & finalize
  - Drag-and-drop list (1-10)
  - Input field untuk judul list
  - Input field untuk nama (optional)
  - Toggle public/private
  - Tombol "Save List"

#### 6.2.3 Create Character List (`/char`)
- **Step 1**: Search & select character
  - Search bar di atas dengan placeholder "Search character..."
  - Query paralel ke AniList + VNDB API untuk hasil pencarian
  - Grid/list hasil pencarian dengan thumbnail, nama, dan sumber database
  - Tombol "Add to List" pada setiap item
  - Counter "X/10 items selected"
- **Step 2**: Arrange & finalize
  - Drag-and-drop list (1-10)
  - Input field untuk judul list
  - Input field untuk nama (optional)
  - Toggle public/private
  - Tombol "Save List"

#### 6.2.4 Create Light Novel List (`/ranobe`)
- **Step 1**: Search & select light novel
  - Search bar di atas dengan placeholder "Search light novel..."
  - Query ke RanobeDB API untuk hasil pencarian
  - Grid/list hasil pencarian dengan thumbnail dan judul
  - Tombol "Add to List" pada setiap item
  - Counter "X/10 items selected"
- **Step 2**: Arrange & finalize
  - Drag-and-drop list (1-10)
  - Input field untuk judul list
  - Input field untuk nama (optional)
  - Toggle public/private
  - Tombol "Save List"

#### 6.2.5 Create Visual Novel List (`/vn`)
- **Step 1**: Search & select visual novel
  - Search bar di atas dengan placeholder "Search visual novel..."
  - Query ke VNDB API untuk hasil pencarian
  - Grid/list hasil pencarian dengan thumbnail dan judul
  - Tombol "Add to List" pada setiap item
  - Counter "X/10 items selected"
- **Step 2**: Arrange & finalize
  - Drag-and-drop list (1-10)
  - Input field untuk judul list
  - Input field untuk nama (optional)
  - Toggle public/private
  - Tombol "Save List"

#### 6.2.6 View List (`/list/[id]`)
- Display list dengan urutan 1-10
- Informasi creator dan tanggal
- Share buttons (copy link)
- Edit button (jika ada mekanisme edit di masa depan)

#### 6.2.7 Search Results (`/search`)
- Unified search across all categories
- Filter by category
- Results dengan preview minimal

### 6.3 Layout Structure
```
+----------------------------------+
|  Header (Logo + Navigation)     |
+----------------------------------+
|                                  |
|         Main Content             |
|                                  |
+----------------------------------+
|  Footer (Links + Copyright)     |
+----------------------------------+
```

### 6.4 CSS Requirements (Minimal)
- CSS Grid/Flexbox untuk layout utama
- CSS Custom Properties untuk spacing dan sizing
- Mobile-responsive breakpoints (320px, 768px, 1024px)
- Print-friendly styles untuk list view

---

## 7. State Management

### 7.1 Local State (Svelte Stores)
- `listStore`: Menyimpan state list yang sedang dibuat
- `searchStore`: Menyimpan hasil pencarian dan loading state
- `uiStore`: Menyimpan UI state (modal, toast, dll)

### 7.2 Server State (SvelteKit)
- Load functions untuk fetch data
- Form actions untuk submit list
- Caching dengan `Cache-Control` headers

### 7.3 Persistence
- **Lists**: Disimpan di database (rekomendasi: Cloudflare D1 atau KV)
- **Draft**: LocalStorage untuk auto-save draft list yang sedang dibuat

---

## 8. Routes & API Endpoints

### 8.1 Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Home - Pilih kategori |
| `/anime` | Create Top 10 Anime List |
| `/char` | Create Top 10 Character List |
| `/ranobe` | Create Top 10 Light Novel List |
| `/vn` | Create Top 10 Visual Novel List |
| `/list/[id]` | View a specific list |
| `/search` | Global search page |

### 8.2 API Routes (SvelteKit)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/anime/search` | GET | Search AniList anime |
| `/api/char/search` | GET | Search character (AniList + VNDB) |
| `/api/ranobe/search` | GET | Search RanobeDB light novel |
| `/api/vn/search` | GET | Search VNDB visual novel |
| `/api/list` | POST | Create new list |
| `/api/list/[id]` | GET | Get list by ID |

### 8.3 API Proxy Strategy
Karena beberapa API memiliki CORS restrictions dan rate limits, semua panggilan ke API eksternal HARUS melalui server-side proxy:
- Client → SvelteKit API Route → External API
- Benefits: Hide API keys, rate limiting protection, response caching, CORS handling

---

## 9. Performance Requirements

### 9.1 Loading Performance
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3s
- Lighthouse Performance Score: > 90

### 9.2 Search Performance
- Search response time: < 500ms (dengan debounce)
- Results display: < 100ms setelah data diterima
- Skeleton loading saat fetching

### 9.3 Optimization Strategies
- Code splitting: Split by route
- Prefetching: Prefetch data saat hover pada link

### 9.4 Image Handling Strategy
Gunakan `images.weserv.nl` (free tier) untuk serve dan optimize gambar dari API eksternal.

**Alasan pemilihan:**
- Free tier tanpa API key
- Otomatis resize gambar ke ukuran yang dibutuhkan (thumbnail vs full)
- Auto-convert ke WebP untuk ukuran file lebih kecil
- Global CDN untuk load time lebih cepat

**Implementasi:**
- Thumbnail list: `https://images.weserv.nl/?url={image_url}&w=150&output=webp`
- Detail view: `https://images.weserv.nl/?url={image_url}&w=400&output=webp`
- Fallback: jika weserv gagal, gunakan original URL dari API

### 9.5 Caching Strategy

#### Search Results
- Cache di Cloudflare KV dengan key: `search:{category}:{query}:{page}`
- TTL: 10 menit
- Gunakan: mengurangi hit ke API eksternal untuk query yang sama

#### List View (`/list/[id]`)
- Cache selamanya dengan `Cache-Control: immutable`
- Alasan: data list bersifat statis setelah dibuat, tidak pernah berubah
- Invalidation: tidak diperlukan

#### Homepage
- Cache di edge (Cloudflare Pages)
- Invalidate saat ada list baru yang dibuat
- Strategy: stale-while-revalidate dengan TTL 1 menit

---

## 10. Error Handling & Edge Cases

### 10.1 API Errors
- **Rate Limit**: Tampilkan pesan "Please wait a moment" dengan countdown
- **Timeout**: Retry 2x dengan exponential backoff
- **No Results**: Tampilkan "No results found" dengan suggestions
- **API Down**: Fallback ke cache atau pesan error yang jelas

### 10.2 User Input Validation
- List title: Required, max 100 karakter
- Items: Min 1, max 10
- Creator name: Optional, max 50 karakter

### 10.3 Edge Cases
- User menutup browser saat membuat list → Auto-save ke localStorage
- Duplicate items dalam satu list → Prevent dengan warning
- Image tidak load → Placeholder image
- Network offline → Offline indicator dengan retry button

---

## 11. Security Considerations

### 11.1 XSS Prevention
- Sanitize semua user input sebelum render
- Gunakan Svelte's built-in XSS protection
- Validasi dan escape HTML

### 11.2 CSRF Protection
- Gunakan SvelteKit's built-in CSRF protection
- Validasi origin pada form submissions

### 11.3 Rate Limiting
- Implementasi rate limiting di API routes
- Max 30 requests per menit per IP untuk search
- Max 10 list creations per jam per IP

---

## 12. Database Schema (Minimal)

### 12.1 Cloudflare D1 / SQLite Schema
```sql
-- Lists table
CREATE TABLE lists (
    id TEXT PRIMARY KEY,              -- crypto.randomUUID()
    title TEXT NOT NULL,
    category TEXT NOT NULL,           -- anime, character, light-novel, visual-novel
    creator_name TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- List items table
CREATE TABLE list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id TEXT NOT NULL,
    external_id TEXT NOT NULL,         -- ID dari API eksternal
    source TEXT NOT NULL,              -- anilist, vndb, ranobe
    rank INTEGER NOT NULL,             -- 1-10
    title TEXT NOT NULL,
    alt_title TEXT,
    image_url TEXT,
    metadata TEXT,                     -- JSON string
    FOREIGN KEY (list_id) REFERENCES lists(id)
);

-- Indexes
CREATE INDEX idx_lists_category ON lists(category);
CREATE INDEX idx_lists_public ON lists(is_public, created_at);
CREATE INDEX idx_list_items_list ON list_items(list_id);
```

### 12.2 Cloudflare KV (Alternative)
Jika menggunakan KV untuk penyimpanan sederhana:
- Key: `list:{id}` → Value: JSON string dari TopTenList
- Key: `lists:public:{category}` → Value: Array of list IDs

---

## 13. Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Setup SvelteKit project dengan Cloudflare adapter
- [ ] Implementasi API proxy untuk semua external APIs
- [ ] Halaman create list (search + select)
- [ ] Halaman view list
- [ ] Drag & drop functionality
- [ ] Save list ke database
- [ ] Basic responsive layout

### Phase 2: Enhancement (Week 3)
- [ ] Search across all categories
- [ ] Auto-save draft ke localStorage
- [ ] Image optimization dan lazy loading
- [ ] Error handling dan loading states
- [ ] SEO optimization

### Phase 3: Polish (Week 4)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Analytics
- [ ] Export functionality (image/share)
- [ ] User feedback dan iteration

---

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| Page Load Time | < 2s |
| Search Response Time | < 500ms |
| List Creation Completion Rate | > 70% |
| Mobile Usability | > 95% |
| Lighthouse Score | > 90 |

---

## 15. Future Enhancements

- [ ] Authentication (OAuth dengan AniList/VNDB)
- [ ] User profiles dan list history
- [ ] Browse public lists (gallery/voting)
- [ ] Export sebagai image (PNG/JPG)
- [ ] Template lists (Top 10 Spring 2024 Anime, dll)
- [ ] Collaborative lists
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Advanced search filters (genre, year, rating, dll)
- [ ] Import list dari MyAnimeList/AniList

---

## 16. Appendix

### 16.1 API Keys & Authentication
- **AniList**: No API key required (public GraphQL)
- **VNDB**: No API key required untuk read-only endpoints
- **RanobeDB**: No API key required

### 16.2 External Dependencies
- SvelteKit + adapter-cloudflare
- @dnd-kit/core untuk drag-and-drop (support mouse dan touch, maintenance aktif)
- Zod untuk schema validation

### 16.3 Environment Variables
```env
# Database
DATABASE_URL="..."  # D1 database URL

# Optional: Analytics
ANALYTICS_ID="..."
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-24  
**Status**: Ready for Development
