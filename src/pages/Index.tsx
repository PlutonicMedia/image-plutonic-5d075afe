import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Lightbox } from '@/components/generator/Lightbox';
import { LoadingOverlay } from '@/components/generator/LoadingOverlay';
import { AdPlacementPreviewer } from '@/components/generator/AdPlacementPreviewer';
import { useGeneration } from '@/hooks/useGeneration';
import { Client, Project, GeneratedImage, GenerationSettings, ScrapedProduct, AdCopy } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const navigate = useNavigate();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null);
  const [adCopy, setAdCopy] = useState<AdCopy | null>(null);

  const [prompt, setPrompt] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [modelImages, setModelImages] = useState<string[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1', quality: '2k', numOutputs: 4, format: 'png', draftMode: false,
  });
  const [isGrid, setIsGrid] = useState(false);

  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [adPreviewImage, setAdPreviewImage] = useState<GeneratedImage | null>(null);

  const { task, allResults, generate, setAllResults } = useGeneration();
  const isGenerating = task?.status === 'running';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate('/auth');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate('/auth');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => { if (user) loadClients(); }, [user]);

  useEffect(() => {
    if (selectedClient) loadProjects(selectedClient.id);
    else setProjects([]);
  }, [selectedClient?.id]);

  const loadClients = async () => {
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) setClients(data as Client[]);
  };

  const loadProjects = async (clientId: string) => {
    const { data } = await supabase.from('projects').select('*').eq('customer_id', clientId).order('name');
    if (data) setProjects(data as Project[]);
  };

  const addClient = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('customers').insert({ name, user_id: user.id }).select().single();
    if (data) {
      const client = data as Client;
      setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedClient(client);
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const deleteClient = async (id: string) => {
    const { data: clientProjects } = await supabase.from('projects').select('id').eq('customer_id', id);
    if (clientProjects?.length) {
      const projectIds = clientProjects.map(p => p.id);
      await supabase.from('generations').delete().in('project_id', projectIds);
    }
    await supabase.from('projects').delete().eq('customer_id', id);
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selectedClient?.id === id) {
      setSelectedClient(null);
      setSelectedProject(null);
      setProjects([]);
    }
    toast({ title: 'Client deleted' });
  };

  const deleteProject = async (id: string) => {
    await supabase.from('generations').delete().eq('project_id', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    toast({ title: 'Project deleted' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const addProject = async (name: string) => {
    if (!selectedClient) return;
    const { data, error } = await supabase.from('projects').insert({ name, customer_id: selectedClient.id }).select().single();
    if (data) {
      const project = data as Project;
      setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedProject(project);
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const saveGeneration = async (images: GeneratedImage[]) => {
    if (!user) return;
    for (const img of images) {
      await supabase.from('generations').insert({
        user_id: user.id,
        project_id: selectedProject?.id || null,
        status: 'completed',
        params: { prompt: img.prompt, aspect_ratio: img.aspect_ratio },
        output_url: img.url,
        ad_copy: img.ad_copy as any || null,
        is_grid: isGrid,
      });
    }
  };

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() && productImages.length === 0) {
      toast({ title: 'Missing input', description: 'Enter a prompt or upload product images.', variant: 'destructive' });
      return;
    }
    setShowLoadingOverlay(true);
    generate({
      prompt,
      settings,
      productImages,
      modelImages,
      clientId: selectedClient?.id,
      scrapedProduct,
      isGrid,
      onComplete: async (results: GeneratedImage[]) => {
        const firstAdCopy = results.find((r) => r.ad_copy)?.ad_copy || null;
        if (firstAdCopy) setAdCopy(firstAdCopy);
        saveGeneration(results);
      },
    });
  }, [prompt, settings, productImages, modelImages, selectedClient, generate, scrapedProduct, selectedProject, isGrid]);

  const handleRefinedImage = useCallback((newImage: GeneratedImage) => {
    setAllResults((prev) => [...prev, newImage]);
  }, [setAllResults]);

  const handleDownload = async (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    const name = selectedClient?.name?.replace(/\s+/g, '-') || 'creative';
    link.download = `${name}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = async (images: GeneratedImage[]) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    const zip = new JSZip();
    const name = selectedClient?.name?.replace(/\s+/g, '-') || 'creatives';
    await Promise.all(images.map(async (img, i) => {
      try {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(`${name}-${i + 1}.${settings.format}`, blob);
      } catch (e) { console.error('Failed to fetch image for zip:', e); }
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${name}-${new Date().toISOString().slice(0, 10)}.zip`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DashboardLayout
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onAddClient={addClient}
        onDeleteClient={deleteClient}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        scrapedProduct={scrapedProduct}
        onScraped={setScrapedProduct}
        productImages={productImages}
        onProductImagesChange={setProductImages}
        modelImages={modelImages}
        onModelImagesChange={setModelImages}
        onSignOut={handleSignOut}
        images={allResults}
        onImageClick={setLightboxImage}
        onDownloadSelected={handleDownloadSelected}
        onRefinedImage={handleRefinedImage}
        isGrid={isGrid}
        prompt={prompt}
        onPromptChange={setPrompt}
        settings={settings}
        onSettingsChange={setSettings}
        onGridChange={setIsGrid}
        adCopy={adCopy}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        userId={user?.id || null}
      />
      {isGenerating && showLoadingOverlay && (
        <LoadingOverlay progress={task?.progress || 0} onDismiss={() => setShowLoadingOverlay(false)} />
      )}
      {lightboxImage && (
        <Lightbox image={lightboxImage} allImages={allResults} onClose={() => setLightboxImage(null)} onNavigate={setLightboxImage} onDownload={handleDownload} onPreviewAd={setAdPreviewImage} />
      )}
      {adPreviewImage && (
        <AdPlacementPreviewer image={adPreviewImage} onClose={() => setAdPreviewImage(null)} />
      )}
    </>
  );
}
