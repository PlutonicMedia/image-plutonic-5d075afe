import { useState } from 'react';
import { Upload, X, Image, Sparkles, Settings2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MultiImageUpload } from './MultiImageUpload';
import { Client, GenerationSettings, ASPECT_RATIOS } from '@/types';

interface GeneratorPanelProps {
  selectedClient: Client | null;
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  productImages: string[];
  onProductImagesChange: (imgs: string[]) => void;
  modelImages: string[];
  onModelImagesChange: (imgs: string[]) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function GeneratorPanel({
  selectedClient, settings, onSettingsChange,
  prompt, onPromptChange,
  productImages, onProductImagesChange,
  modelImages, onModelImagesChange,
  onGenerate, isGenerating,
}: GeneratorPanelProps) {
  const canGenerate = !!prompt.trim() || productImages.length > 0;

  return (
    <div className="generator-panel scrollbar-thin">
      <div className="p-5 space-y-5">
        <div>
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Creative
          </h2>
          {selectedClient && (
            <p className="text-xs text-muted-foreground mt-1">
              Creating for <span className="font-medium text-foreground">{selectedClient.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Reference Images
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MultiImageUpload label="Product Images" images={productImages} onChange={onProductImagesChange} max={5} />
            <MultiImageUpload label="Model Images" images={modelImages} onChange={onModelImagesChange} max={5} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
          <Textarea value={prompt} onChange={(e) => onPromptChange(e.target.value)} placeholder="Describe your creative vision..." className="min-h-[90px] text-sm resize-none" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Settings2 className="w-3.5 h-3.5" /> Output Settings
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Aspect Ratio</Label>
            <div className="flex gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button key={ar.value} onClick={() => onSettingsChange({ ...settings, aspectRatio: ar.value })}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${settings.aspectRatio === ar.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                >{ar.label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Quality</Label>
              <Select value={settings.quality} onValueChange={(v) => onSettingsChange({ ...settings, quality: v as '2k' | '4k' })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2k">2K</SelectItem><SelectItem value="4k">4K</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Format</Label>
              <Select value={settings.format} onValueChange={(v) => onSettingsChange({ ...settings, format: v as 'png' | 'jpg' | 'webp' })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Number of Outputs</Label>
              <span className="text-xs font-medium text-foreground">{settings.numOutputs}</span>
            </div>
            <Slider value={[settings.numOutputs]} onValueChange={([v]) => onSettingsChange({ ...settings, numOutputs: v })} min={1} max={10} step={1} className="w-full" />
          </div>
        </div>

        <Button onClick={onGenerate} disabled={!canGenerate || isGenerating} className="w-full h-11 font-display font-semibold text-sm shadow-soft" size="lg">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating…' : `Generate ${settings.numOutputs} Creative${settings.numOutputs > 1 ? 's' : ''}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
