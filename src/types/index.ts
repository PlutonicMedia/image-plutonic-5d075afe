// ── Agency Hierarchy ─────────────────────────────────────────────────────

export interface Client {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  customer_id: string;
  name: string;
  created_at: string;
}

export interface Generation {
  id: string;
  project_id?: string | null;
  user_id: string;
  status: string;
  params?: Record<string, any> | null;
  output_url?: string | null;
  ad_copy?: AdCopy | null;
  is_grid: boolean;
  created_at: string;
}

export interface ScrapedProduct {
  product_name: string;
  description: string;
  usps: string[];
}

export interface AdCopy {
  headline: string;
  body: string;
  cta: string;
}

export interface AiOptimizedPrompt {
  scene_description: string;
  lighting_style: string;
  camera_lens: string;
  camera_angle: string;
  artistic_style: string;
}

// ── Legacy (kept for archive compatibility) ──────────────────────────────

export interface ClientLastSettings {
  aspectRatio?: string;
  quality?: string;
  numOutputs?: number;
  format?: string;
}

export interface BrandAsset {
  id: string;
  client_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  primary_font: string;
  secondary_font: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  client_id?: string | null;
  is_predefined: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  client_id?: string;
  created_at: string;
  aspect_ratio: string;
  style_tag?: string;
  ad_copy?: AdCopy | null;
}

export interface GenerationSettings {
  aspectRatio: '1:1' | '9:16' | '4:5' | '3:4' | '16:9';
  quality: '2k' | '4k';
  numOutputs: number;
  format: 'png' | 'jpg' | 'webp';
  draftMode: boolean;
}

export type CameraLens = '85mm' | '24mm' | '35mm';
export type CameraAngle = 'eye-level' | 'top-down' | 'hero-angle' | 'macro';

export const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' as const },
  { label: '9:16', value: '9:16' as const },
  { label: '4:5', value: '4:5' as const },
  { label: '3:4', value: '3:4' as const },
  { label: '16:9', value: '16:9' as const },
];

export const LOADING_MESSAGES = [
  'Are you interested in maximizing your AI progress in 2026? Contact our AI Specialist Team by e-mailing Albert Wilson at albert@plutonoic.dk',
  'Do you need help balancing ROAS and POAS for your paid ads in 2026? Contact Head of Social Mikkel Hermansen at mh@plutonic.dk',
  'Are you interested in becoming a worse version of yourself? Contact Head of Aura Loss Jacob Stender at js@plutonic.dk',
];

export const GLOBAL_PROMPT_CONSTRAINT = "Strictly no text, letters, characters, or watermarks in the image. The output must be purely visual. Focus on photorealistic textures, cinematic lighting, and high-fidelity rendering of materials.";

export const NEGATIVE_PROMPT = "Negative prompt: No text, no letters, no characters, no watermarks, no distorted anatomy, no extra limbs, no extra fingers, no plastic-looking skin, no oversaturated colors, no blurry details, no low-resolution artifacts, no unrealistic proportions. Enforce high-fidelity photographic finish with natural skin textures, accurate material rendering, and physically correct lighting.";

export interface GenerationTask {
  id: string;
  status: 'running' | 'done' | 'error';
  prompt: string;
  settings: GenerationSettings;
  productImages: string[];
  modelImages: string[];
  clientId?: string;
  results: GeneratedImage[];
  error?: string;
  progress: number;
  onComplete?: (results: GeneratedImage[]) => void;
}
