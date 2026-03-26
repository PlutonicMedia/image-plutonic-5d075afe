

# Phase 1 Refinement: Intelligent Control Panel & AI Edge Functions

## Overview
Replace the multi-dropdown Control Panel with a prompt-first design, add AI-powered prompt optimization, create a dedicated ad copy function, and enhance the Lightbox.

---

## 1. Control Panel Redesign (`ControlColumn.tsx`)

**Remove:** Scene Template dropdown, Style Preset dropdown, Camera Lens/Angle dropdowns, and all sub-option grids.

**New layout (top to bottom):**
1. **Prompt textarea** — large, prominent, multi-language free-text. Label: "Prompt". Replaces both the old "Influence Prompt" and all preset selectors.
2. **"AI Optimize" button** — next to textarea. Calls the new `optimize-prompt` edge function. When response arrives, the optimized prompt replaces the textarea content (user can edit further). Show a loading spinner while processing.
3. **Scoped Pickers** — two collapsible sections ("Saved Models" and "Saved Prompts"), each with tabs: Global | Client | Project. Uses `useScopedData` hook. Selecting a prompt appends it to the textarea; selecting a model sets it as a reference image.
4. **Output Settings** — Aspect Ratio buttons, Quality, Format, Outputs slider, Grid toggle, Draft Mode toggle (unchanged).
5. **Ad Copy Display** — unchanged.
6. **Generate Button** — unchanged.

**Props change:** Remove `selectedStyle`, `onStyleChange`, `styleSubOptions`, `onStyleSubOptionsChange`, `selectedJsonPrompt`, `onJsonPromptChange`, `influencePrompt`, `onInfluencePromptChange`. Replace with single `prompt` / `onPromptChange` pair. Add `userId`, `clientId`, `projectId` for scoped pickers.

**DashboardLayout & Index.tsx:** Update props accordingly. Replace `influencePrompt` state with `prompt`. Remove style/jsonPrompt state. Update `handleGenerate` validation.

## 2. Prompt Compiler Update (`promptCompiler.ts`)

**New interface `CompilerInput`:**
- Remove `style`, `subOptions`, `customPrompt`, `jsonPrompt`, `influencePrompt`
- Add `prompt` (the user's free-text, possibly AI-optimized)
- Add optional `aiOptimized?: { scene_description, lighting_style, camera_lens, camera_angle, artistic_style }`
- Keep `scrapedUsps`, `hasProductImage`, `hasModelImage`, `aspectRatio`

**New compilation order:**
1. If `aiOptimized` fields exist, prepend structured instructions (scene, lighting, lens, angle, artistic style)
2. Append user prompt
3. Append camera angle instruction (if set in settings)
4. Append scraped USPs
5. Append 1:1 consistency block (if product images)
6. Append aspect ratio, global constraint, negative prompt

**Remove:** `getStylePrompt`, `compileJsonPrompt`, `STYLE_SUB_OPTIONS` usage. Keep `getCameraInstruction`, `getCameraAngleInstruction`, `getContextInjection`, `getShadowReflectionMapping` (still useful for product images).

## 3. `optimize-prompt` Edge Function (NEW)

**File:** `supabase/functions/optimize-prompt/index.ts`

- Receives `{ prompt: string }` from client
- Calls Gemini 2.5 Flash via Lovable AI gateway with tool calling
- Tool schema returns: `{ scene_description, lighting_style, camera_lens, camera_angle, artistic_style }`
- System prompt: "You are a professional commercial photography prompt engineer. Analyze the user's intent and return structured scene parameters."
- Returns the JSON to the client
- Add to `supabase/config.toml` with `verify_jwt = false`

## 4. `generate-ad-copy` Edge Function (NEW)

**File:** `supabase/functions/generate-ad-copy/index.ts`

- Receives `{ product_name, description, usps }` from client
- Calls Gemini 2.5 Flash via tool calling
- Tool schema returns: `{ headline, body, cta }`
- System prompt: "Expert ad copywriter. Write punchy, conversion-focused copy."
- Separate from generate-creative (decoupled ad copy generation)
- Add to `supabase/config.toml`
- Update `AdCopy` type: rename `hook` to `headline`

## 5. Grid & Draft Mode Fixes (`generate-creative/index.ts`)

- If `isGrid === true`, prepend: `"MANDATORY: Output a single image divided into a perfect 2x2 grid containing 4 different variations of the subject."`
- If `draftMode === true`, append to system prompt: `"Output at 512x512 resolution for quick draft preview."`
- Both already partially implemented — just ensure the prepend is explicit and resolution instruction is in system prompt.

## 6. Scrape-Product Error Handling (`scrape-product/index.ts`)

Already has fallback logic. Verify: on Firecrawl failure, return `{ product_name: "", description: "", usps: [] }` with 200 status (not error status). Currently returns fallback with placeholder text — change to empty strings so UI shows blank editable fields.

## 7. Lightbox Enhancement (`Lightbox.tsx`)

- Add keyboard navigation: `useEffect` with `keydown` listener for ArrowLeft, ArrowRight, Escape
- Make overlay truly full-screen (already is, but increase image max-height to `80vh`)
- Add click-to-zoom: toggle between `object-contain` and `object-cover` / scrollable full-res on click
- Add zoom state with `cursor-zoom-in` / `cursor-zoom-out`

---

## Files Changed Summary

| Action | File |
|--------|------|
| Rewrite | `src/components/dashboard/ControlColumn.tsx` |
| Edit | `src/components/dashboard/DashboardLayout.tsx` — simplified props |
| Edit | `src/pages/Index.tsx` — remove style/jsonPrompt state, add prompt state |
| Rewrite | `src/lib/promptCompiler.ts` — new compilation logic |
| Edit | `src/types/index.ts` — add `AiOptimizedPrompt` type, rename `hook` → `headline` in AdCopy |
| Edit | `src/hooks/useGeneration.ts` — accept new prompt structure |
| Create | `supabase/functions/optimize-prompt/index.ts` |
| Create | `supabase/functions/generate-ad-copy/index.ts` |
| Edit | `supabase/functions/generate-creative/index.ts` — grid/draft fixes |
| Edit | `supabase/functions/scrape-product/index.ts` — empty fallback |
| Edit | `supabase/config.toml` — add new functions |
| Edit | `src/components/generator/Lightbox.tsx` — keyboard + zoom |

