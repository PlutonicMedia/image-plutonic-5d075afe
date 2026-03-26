import { AiOptimizedPrompt, GLOBAL_PROMPT_CONSTRAINT, NEGATIVE_PROMPT } from '@/types';

export interface CompilerInput {
  prompt: string;
  aiOptimized?: AiOptimizedPrompt | null;
  hasProductImage: boolean;
  hasModelImage: boolean;
  aspectRatio: string;
  scrapedUsps?: string[];
}

function getContextInjection(hasProduct: boolean, hasModel: boolean): string {
  if (hasProduct && hasModel) {
    return 'Create a natural interaction where the uploaded model is holding or interacting with the uploaded product in a realistic manner. Maintain facial features and product branding exactly.';
  }
  if (hasProduct) {
    return 'Incorporate the specific uploaded product image into the scene. Maintain the exact label details, shape, and branding of the product without alteration.';
  }
  if (hasModel) {
    return 'Feature the specific uploaded model person as the central subject. Maintain their facial features, hair, and physique exactly as shown in the reference.';
  }
  return '';
}

const CONSISTENCY_BLOCK = "CRITICAL — 1:1 PRODUCT CONSISTENCY: The uploaded product images are the absolute structural reference. Replicate the exact pixel-level shape, color, branding, label text, and proportions of the product. Product fidelity takes priority over all stylistic instructions. Do not alter, simplify, or reimagine the product design in any way.";

export function compilePrompt(input: CompilerInput): string {
  const parts: string[] = [];

  // 1. AI-optimized structured fields (if present)
  if (input.aiOptimized) {
    const ai = input.aiOptimized;
    if (ai.scene_description) parts.push(`Scene: ${ai.scene_description}`);
    if (ai.lighting_style) parts.push(`Lighting: ${ai.lighting_style}`);
    if (ai.camera_lens) parts.push(`Lens: ${ai.camera_lens}`);
    if (ai.camera_angle) parts.push(`Angle: ${ai.camera_angle}`);
    if (ai.artistic_style) parts.push(`Style: ${ai.artistic_style}`);
  }

  // 2. User prompt
  if (input.prompt.trim()) {
    parts.push(input.prompt.trim());
  }

  // 3. Context injection for uploaded images
  const contextInjection = getContextInjection(input.hasProductImage, input.hasModelImage);
  if (contextInjection) parts.push(contextInjection);

  // 4. Scraped USPs
  if (input.scrapedUsps && input.scrapedUsps.length > 0) {
    parts.push(`Key product selling points to visually emphasize: ${input.scrapedUsps.join('; ')}.`);
  }

  // 5. 1:1 Consistency
  if (input.hasProductImage) {
    parts.push(CONSISTENCY_BLOCK);
  }

  // Aspect ratio hint
  parts.push(`Aspect ratio: ${input.aspectRatio}.`);

  // Global constraint + negative prompt
  parts.push(GLOBAL_PROMPT_CONSTRAINT);
  parts.push(NEGATIVE_PROMPT);

  return parts.join(' ');
}
