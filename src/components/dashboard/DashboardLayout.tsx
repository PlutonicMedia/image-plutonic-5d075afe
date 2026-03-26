import { Client, Project, GeneratedImage, GenerationSettings, ScrapedProduct, AdCopy } from '@/types';
import { InputColumn } from './InputColumn';
import { CanvasColumn } from './CanvasColumn';
import { ControlColumn } from './ControlColumn';

interface DashboardLayoutProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (c: Client | null) => void;
  onAddClient: (name: string) => void;
  onDeleteClient: (id: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  scrapedProduct: ScrapedProduct | null;
  onScraped: (data: ScrapedProduct | null) => void;
  productImages: string[];
  onProductImagesChange: (imgs: string[]) => void;
  modelImages: string[];
  onModelImagesChange: (imgs: string[]) => void;
  onSignOut: () => void;
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  onDownloadSelected: (images: GeneratedImage[]) => void;
  onRefinedImage: (newImage: GeneratedImage) => void;
  isGrid: boolean;
  prompt: string;
  onPromptChange: (p: string) => void;
  settings: GenerationSettings;
  onSettingsChange: (s: GenerationSettings) => void;
  onGridChange: (g: boolean) => void;
  adCopy: AdCopy | null;
  onGenerate: () => void;
  isGenerating: boolean;
  userId: string | null;
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <InputColumn
        clients={props.clients}
        selectedClient={props.selectedClient}
        onSelectClient={props.onSelectClient}
        onAddClient={props.onAddClient}
        onDeleteClient={props.onDeleteClient}
        projects={props.projects}
        selectedProject={props.selectedProject}
        onSelectProject={props.onSelectProject}
        onAddProject={props.onAddProject}
        onDeleteProject={props.onDeleteProject}
        scrapedProduct={props.scrapedProduct}
        onScraped={props.onScraped}
        productImages={props.productImages}
        onProductImagesChange={props.onProductImagesChange}
        modelImages={props.modelImages}
        onModelImagesChange={props.onModelImagesChange}
        onSignOut={props.onSignOut}
      />
      <CanvasColumn
        images={props.images}
        onImageClick={props.onImageClick}
        onDownloadSelected={props.onDownloadSelected}
        onRefinedImage={props.onRefinedImage}
        isGrid={props.isGrid}
      />
      <ControlColumn
        prompt={props.prompt}
        onPromptChange={props.onPromptChange}
        settings={props.settings}
        onSettingsChange={props.onSettingsChange}
        isGrid={props.isGrid}
        onGridChange={props.onGridChange}
        adCopy={props.adCopy}
        onGenerate={props.onGenerate}
        isGenerating={props.isGenerating}
        userId={props.userId}
        clientId={props.selectedClient?.id || null}
        projectId={props.selectedProject?.id || null}
      />
    </div>
  );
}
