

# Creative Dashboard Transformation Plan

## Overview
Transform the current sidebar + gallery layout into a professional agency-grade three-column dashboard with URL scraping, ad copy generation, grid output logic, and schema rebuild.

---

## 1. Database Migration

Drop/replace existing tables with new agency schema:

```sql
-- New tables
customers (id uuid PK, user_id uuid, name text, logo_url text, created_at timestamptz)
projects (id uuid PK, customer_id uuid FK→customers, name text, created_at timestamptz)
generations (id uuid PK, project_id uuid FK→projects, user_id uuid, status text, params jsonb, output_url text, ad_copy jsonb, is_grid bool default false, created_at timestamptz)

-- Coming Soon (schema only, no app logic yet)
saved_models (id uuid PK, user_id uuid, name text, image_url text, created_at timestamptz)
brand_presets (id uuid PK, customer_id uuid FK→customers, name text, preset_data jsonb, created_at timestamptz)
```

RLS: All tables scoped to `auth.uid() = user_id` (customers/generations direct, projects/brand_presets via customer join). Keep existing `generated_images`, `clients`, `brand_assets`, `prompt_templates` tables intact but unused by new UI.

---

## 2. Connect Firecrawl + Create scrape-product Edge Function

Link the existing Firecrawl connection (`std_01kkvaympqep6a2kk0sjpcth6v`) to the project.

**New Edge Function: `supabase/functions/scrape-product/index.ts`**
- Accept `{ url }` body
- Call Firecrawl scrape API (markdown format) using `FIRECRAWL_API_KEY`
- Pass scraped markdown to `gemini-2.5-flash-lite` via Lovable AI gateway with a tool-call schema to extract `{ product_name, description, usps: string[3] }`
- Return structured JSON

---

## 3. UI: Three-Column Dashboard Canvas

Replace `AppSidebar` + `GeneratorPanel` + `GalleryGrid` layout with:

**New file: `src/components/dashboard/DashboardLayout.tsx`**
- Three-column flex layout replacing current two-panel design

**Column 1 — Input & Intelligence (`src/components/dashboard/InputColumn.tsx`)**
- Customer/Project selector (dropdown + create)
- URL Scraper field → calls `scrape-product`, displays extracted name/description/USPs
- Product Hub: `MultiImageUpload` (1-5 images) with note "AI uses all as structural reference"
- Model Hub: `MultiImageUpload` (1-5 images) + "Coming Soon" badge for "Save Model to Library"

**Column 2 — The Canvas (`src/components/dashboard/CanvasColumn.tsx`)**
- Generation output display (reuses image card rendering)
- When "4x4 Grid" is ON: display single grid image, clicking a quadrant calls `refine-image` with upscale instruction
- Empty state matching current design

**Column 3 — Control & Copy (`src/components/dashboard/ControlColumn.tsx`)**
- Preset Library: Style, Lighting, Location, Camera (Lens + Angle) dropdowns
- "Coming Soon" badge on "Save as Brand Preset"
- Influence Prompt: permanent Textarea field
- Ad Copy display: Hook / Body / CTA cards (populated from generation response)
- Output settings (aspect ratio, quality, format, num outputs)
- Generate button

---

## 4. Types Update (`src/types/index.ts`)

- Add `Customer`, `Project`, `Generation`, `ScrapedProduct`, `AdCopy` interfaces
- Add camera angles: `'eye-level' | 'top-down' | 'hero-angle' | 'macro'` to a new `CameraAngle` type + presets array
- Keep existing `StyleCategory`, `PredefinedJsonPrompt` etc.

---

## 5. Prompt Compiler Update (`src/lib/promptCompiler.ts`)

- **Additive merge**: `[Preset Context] + [Influence Prompt] + [Scraped USPs] + [1:1 Consistency Instructions]`
- New input fields: `influencePrompt`, `scrapedUsps`, `cameraAngle`
- 1:1 consistency block: "The uploaded product images are the absolute structural reference. Replicate the exact pixel-level shape, color, branding, and proportions. Product fidelity takes priority over all stylistic instructions."
- Camera angle instructions for eye-level, top-down, hero-angle, macro
- Always append `GLOBAL_PROMPT_CONSTRAINT` and `NEGATIVE_PROMPT`

---

## 6. Edge Function Updates

**`generate-creative/index.ts`**
- Accept optional `adCopyContext` (scraped product data) in body
- After image generation, if `adCopyContext` provided: make a second call to `gemini-2.5-flash-lite` to generate `{ hook, body, cta }` ad copy
- Return `{ imageUrl, adCopy }` 
- System prompt updated: "Generate a photorealistic ad asset. 1:1 product shape is mandatory. No conversational filler."

---

## 7. Snake Game Enhancement (`src/components/generator/SnakeGame.tsx`)

- Add `localStorage` high score (`plutonic-snake-highscore`)
- Display "Best: X" on start and game-over screens
- Add touch support (swipe detection via `touchstart`/`touchend` delta)
- Make canvas size responsive (`min(GRID * CELL, containerWidth)`)

---

## 8. State Management (`src/pages/Index.tsx`)

Full rewrite to:
- Manage `customers[]`, `selectedCustomer`, `projects[]`, `selectedProject`
- Manage `scrapedProduct` state from URL scraper
- Manage `adCopy` state from generation response
- Manage `influencePrompt` (always-on free text)
- Manage `isGrid` toggle
- Wire generation to new `generations` table instead of `generated_images`
- Toast on background generation complete (already exists, carry forward)

---

## 9. File Changes Summary

| Action | File |
|--------|------|
| Create | `src/components/dashboard/DashboardLayout.tsx` |
| Create | `src/components/dashboard/InputColumn.tsx` |
| Create | `src/components/dashboard/CanvasColumn.tsx` |
| Create | `src/components/dashboard/ControlColumn.tsx` |
| Create | `src/components/dashboard/CustomerProjectSelector.tsx` |
| Create | `src/components/dashboard/UrlScraper.tsx` |
| Create | `src/components/dashboard/AdCopyDisplay.tsx` |
| Create | `supabase/functions/scrape-product/index.ts` |
| Edit | `src/types/index.ts` — new interfaces + camera angles |
| Edit | `src/lib/promptCompiler.ts` — additive merge logic |
| Edit | `src/hooks/useGeneration.ts` — ad copy + grid support |
| Edit | `supabase/functions/generate-creative/index.ts` — system prompt + ad copy |
| Edit | `src/components/generator/SnakeGame.tsx` — highscore + touch |
| Edit | `src/pages/Index.tsx` — full rewrite for dashboard |
| Edit | `supabase/config.toml` — add scrape-product function |
| Keep | `Lightbox.tsx`, `RefinementBar.tsx`, `LoadingOverlay.tsx`, `MultiImageUpload.tsx` — reused as-is |
| Migration | New SQL migration for customers, projects, generations, saved_models, brand_presets |

---

## 10. Firecrawl Connection

Will link the existing workspace Firecrawl connection to enable `FIRECRAWL_API_KEY` in edge functions.

