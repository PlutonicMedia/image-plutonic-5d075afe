import { useState } from 'react';
import { Sparkles, Wand2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdCopyDisplay } from './AdCopyDisplay';
import { GenerationSettings, ASPECT_RATIOS, AdCopy } from '@/types';
import { useScopedData } from '@/hooks/useScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ControlColumnProps {
  prompt: string;
  onPromptChange: (p: string) => void;
  settings: GenerationSettings;
  onSettingsChange: (s: GenerationSettings) => void;
  isGrid: boolean;
  onGridChange: (g: boolean) => void;
  adCopy: AdCopy | null;
  onGenerate: () => void;
  isGenerating: boolean;
  userId: string | null;
  clientId: string | null;
  projectId: string | null;
}

export function ControlColumn({
  prompt, onPromptChange,
  settings, onSettingsChange,
  isGrid, onGridChange,
  adCopy, onGenerate, isGenerating,
  userId, clientId, projectId,
}: ControlColumnProps) {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const { models, prompts } = useScopedData(userId, clientId, projectId);

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Enter a prompt first', variant: 'destructive' });
      return;
    }
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-prompt', {
        body: { prompt },
      });
      if (error) throw error;
      if (data?.optimizedPrompt) {
        onPromptChange(data.optimizedPrompt);
        toast({ title: '✨ Prompt optimized' });
      }
    } catch (e: any) {
      console.error('Optimize error:', e);
      toast({ title: 'Optimization failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const filterByScope = <T extends { scope: string; client_id: string | null; project_id: string | null }>(
    items: T[], scope: string
  ): T[] => {
    if (scope === 'global') return items.filter(i => i.scope === 'global');
    if (scope === 'client') return items.filter(i => i.scope === 'client' && i.client_id === clientId);
    if (scope === 'project') return items.filter(i => i.scope === 'project' && i.project_id === projectId);
    return [];
  };

  return (
    <div className="w-[340px] shrink-0 border-l border-border bg-card overflow-y-auto scrollbar-thin">
      <div className="p-5 space-y-5">
        <h2 className="text-base font-display font-semibold">Control Panel</h2>

        {/* Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your creative vision in any language..."
            className="min-h-[120px] text-sm resize-none"
          />
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing || !prompt.trim()}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
            {isOptimizing ? 'Optimizing…' : 'AI Optimize Prompt'}
          </Button>
        </div>

        {/* Saved Prompts */}
        <div>
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Saved Prompts
            {showPrompts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showPrompts && (
            <Tabs defaultValue="global" className="mt-2">
              <TabsList className="h-7 w-full">
                <TabsTrigger value="global" className="text-[10px] flex-1">Global</TabsTrigger>
                <TabsTrigger value="client" className="text-[10px] flex-1" disabled={!clientId}>Client</TabsTrigger>
                <TabsTrigger value="project" className="text-[10px] flex-1" disabled={!projectId}>Project</TabsTrigger>
              </TabsList>
              {['global', 'client', 'project'].map(scope => (
                <TabsContent key={scope} value={scope} className="mt-2 space-y-1">
                  {filterByScope(prompts, scope).length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/60 text-center py-2">No saved prompts</p>
                  ) : (
                    filterByScope(prompts, scope).map(p => (
                      <button
                        key={p.id}
                        onClick={() => onPromptChange(prompt ? `${prompt}\n${p.content}` : p.content)}
                        className="w-full text-left p-2 rounded-md text-xs hover:bg-muted transition-colors truncate"
                      >
                        {p.name}
                      </button>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Saved Models */}
        <div>
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Saved Models
            {showModels ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showModels && (
            <Tabs defaultValue="global" className="mt-2">
              <TabsList className="h-7 w-full">
                <TabsTrigger value="global" className="text-[10px] flex-1">Global</TabsTrigger>
                <TabsTrigger value="client" className="text-[10px] flex-1" disabled={!clientId}>Client</TabsTrigger>
                <TabsTrigger value="project" className="text-[10px] flex-1" disabled={!projectId}>Project</TabsTrigger>
              </TabsList>
              {['global', 'client', 'project'].map(scope => (
                <TabsContent key={scope} value={scope} className="mt-2">
                  {filterByScope(models, scope).length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/60 text-center py-2">No saved models</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {filterByScope(models, scope).map(m => (
                        <div key={m.id} className="relative group">
                          <img src={m.image_url} alt={m.name} className="w-full aspect-square object-cover rounded-md" />
                          <p className="text-[9px] text-muted-foreground truncate mt-0.5">{m.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Output Settings */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Output Settings</Label>
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Aspect Ratio</Label>
            <div className="flex gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button key={ar.value} onClick={() => onSettingsChange({ ...settings, aspectRatio: ar.value })}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${settings.aspectRatio === ar.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Quality</Label>
              <Select value={settings.quality} onValueChange={(v) => onSettingsChange({ ...settings, quality: v as '2k' | '4k' })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2k">2K</SelectItem><SelectItem value="4k">4K</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Format</Label>
              <Select value={settings.format} onValueChange={(v) => onSettingsChange({ ...settings, format: v as 'png' | 'jpg' | 'webp' })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-[10px] text-muted-foreground">Outputs</Label>
              <span className="text-xs font-medium">{settings.numOutputs}</span>
            </div>
            <Slider value={[settings.numOutputs]} onValueChange={([v]) => onSettingsChange({ ...settings, numOutputs: v })} min={1} max={10} step={1} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">4×4 Grid Output</Label>
            <Switch checked={isGrid} onCheckedChange={onGridChange} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <Label className="text-[10px] text-muted-foreground">Draft Mode (Fast)</Label>
            </div>
            <Switch checked={settings.draftMode} onCheckedChange={(v) => onSettingsChange({ ...settings, draftMode: v })} />
          </div>
          {settings.draftMode && (
            <p className="text-[9px] text-muted-foreground/60 italic">512×512 for quick testing</p>
          )}
        </div>

        {/* Ad Copy */}
        <AdCopyDisplay adCopy={adCopy} />

        {/* Generate */}
        <Button onClick={onGenerate} disabled={isGenerating} className="w-full h-11 font-display font-semibold text-sm shadow-soft" size="lg">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating…' : isGrid ? 'Generate Grid' : `Generate ${settings.numOutputs} Creative${settings.numOutputs > 1 ? 's' : ''}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
