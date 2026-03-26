import { Image } from 'lucide-react';
import { Client, Project, ScrapedProduct } from '@/types';
import { ClientProjectSelector } from './ClientProjectSelector';
import { UrlScraper } from './UrlScraper';
import { MultiImageUpload } from '@/components/generator/MultiImageUpload';

interface InputColumnProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (c: Client | null) => void;
  onAddClient: (name: string) => void;
  onDeleteClient: (id: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  onAddProject: (name: string) => void;
  scrapedProduct: ScrapedProduct | null;
  onScraped: (data: ScrapedProduct | null) => void;
  productImages: string[];
  onProductImagesChange: (imgs: string[]) => void;
  modelImages: string[];
  onModelImagesChange: (imgs: string[]) => void;
}

export function InputColumn({
  clients, selectedClient, onSelectClient, onAddClient, onDeleteClient,
  projects, selectedProject, onSelectProject, onAddProject,
  scrapedProduct, onScraped,
  productImages, onProductImagesChange,
  modelImages, onModelImagesChange,
}: InputColumnProps) {
  return (
    <div className="w-[320px] shrink-0 border-r border-border bg-card overflow-y-auto scrollbar-thin">
      <div className="p-5 space-y-5">
        {/* Brand Header */}
        <div>
          <h1 className="text-lg font-display font-bold tracking-tight">Plutonic Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Creative Dashboard</p>
        </div>

        {/* Client & Project */}
        <ClientProjectSelector
          clients={clients} selectedClient={selectedClient}
          onSelectClient={onSelectClient} onAddClient={onAddClient} onDeleteClient={onDeleteClient}
          projects={projects} selectedProject={selectedProject}
          onSelectProject={onSelectProject} onAddProject={onAddProject}
        />

        {/* URL Scraper */}
        <UrlScraper scrapedProduct={scrapedProduct} onScraped={onScraped} />

        {/* Product Images */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Product Images
          </div>
          <MultiImageUpload label="Product Images" images={productImages} onChange={onProductImagesChange} max={5} />
        </div>

        {/* Model Images */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Model Images
          </div>
          <MultiImageUpload label="Model Images" images={modelImages} onChange={onModelImagesChange} max={5} />
        </div>
      </div>
    </div>
  );
}
