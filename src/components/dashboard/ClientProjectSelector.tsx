import { useState } from 'react';
import { Plus, Check, X, FolderOpen, Trash2 } from 'lucide-react';
import { Client, Project } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ClientProjectSelectorProps {
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
}

export function ClientProjectSelector({
  clients, selectedClient, onSelectClient, onAddClient, onDeleteClient,
  projects, selectedProject, onSelectProject, onAddProject, onDeleteProject,
}: ClientProjectSelectorProps) {
  const [addingClient, setAddingClient] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<Project | null>(null);

  const handleAddClient = () => {
    if (newName.trim()) {
      onAddClient(newName.trim());
      setNewName('');
      setAddingClient(false);
    }
  };

  const handleAddProject = () => {
    if (newName.trim()) {
      onAddProject(newName.trim());
      setNewName('');
      setAddingProject(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Client */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Client</Label>
          <div className="flex items-center gap-2">
            {selectedClient && (
              <button onClick={() => setDeleteTarget(selectedClient)} className="text-xs text-destructive hover:underline flex items-center gap-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => { setAddingClient(true); setAddingProject(false); setNewName(''); }} className="text-xs text-primary hover:underline flex items-center gap-0.5">
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
        </div>
        {addingClient ? (
          <div className="flex gap-1.5">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Client name..." className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddClient()} />
            <button onClick={handleAddClient} className="p-1.5 rounded-md hover:bg-accent text-primary"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setAddingClient(false)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <Select value={selectedClient?.id || ''} onValueChange={(v) => {
            const c = clients.find((c) => c.id === v) || null;
            onSelectClient(c);
            onSelectProject(null);
          }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-sm">
                  <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" />{c.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Project */}
      {selectedClient && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Project</Label>
            <div className="flex items-center gap-2">
              {selectedProject && (
                <button onClick={() => setDeleteProjectTarget(selectedProject)} className="text-xs text-destructive hover:underline flex items-center gap-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <button onClick={() => { setAddingProject(true); setAddingClient(false); setNewName(''); }} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
          </div>
          {addingProject ? (
            <div className="flex gap-1.5">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Project name..." className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddProject()} />
              <button onClick={handleAddProject} className="p-1.5 rounded-md hover:bg-accent text-primary"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setAddingProject(false)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <Select value={selectedProject?.id || ''} onValueChange={(v) => onSelectProject(projects.find((p) => p.id === v) || null)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-sm">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this client and all associated projects and generations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) { onDeleteClient(deleteTarget.id); setDeleteTarget(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
