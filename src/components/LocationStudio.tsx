import React, { useState } from 'react';
import { ChapterProject, LocationDecor, NavTab } from '../types';
import {
  Compass,
  Plus,
  Sparkles,
  MapPin,
  Building,
  Sun,
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye
} from 'lucide-react';

interface LocationStudioProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
  onUpdateLocations?: (locations: LocationDecor[]) => void;
}

export const LocationStudio: React.FC<LocationStudioProps> = ({
  project,
  setActiveTab,
  onUpdateLocations,
}) => {
  const [locations, setLocations] = useState<LocationDecor[]>(project.locations || []);
  const [selectedLocation, setSelectedLocation] = useState<LocationDecor | null>(
    locations[0] || null
  );
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);

  // New location form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('interieur');
  const [newDesc, setNewDesc] = useState('');
  const [newLighting, setNewLighting] = useState('');
  const [newEra, setNewEra] = useState('1920s');

  const handleGenerateLocationImage = async (loc: LocationDecor) => {
    setIsGeneratingImage(loc.id);
    try {
      const res = await fetch('/api/generate-location-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: loc.name,
          visualPrompt: loc.visualPrompt,
          artStyle: project.artStyle || 'ultra_realism',
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        const updatedLocs = locations.map((l) => (l.id === loc.id ? { ...l, imageUrl: data.imageUrl } : l));
        setLocations(updatedLocs);
        if (onUpdateLocations) onUpdateLocations(updatedLocs);
        if (selectedLocation?.id === loc.id) {
          setSelectedLocation({ ...loc, imageUrl: data.imageUrl });
        }
      }
    } catch (e) {
      console.error('Error generating location image:', e);
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newLoc: LocationDecor = {
      id: `loc_${Date.now()}`,
      name: newName,
      type: newType,
      description: newDesc || 'Décor authentique extrait du récit.',
      era: newEra,
      architecture: 'Architecture personnalisée',
      lightingAtmosphere: newLighting || 'Lumière naturelle dramatique',
      visualPrompt: `${newName}, ${newType}, ${newEra}, ${newLighting}, cinematic photorealistic 8k`,
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1280&auto=format&fit=crop'
    };

    const updated = [...locations, newLoc];
    setLocations(updated);
    if (onUpdateLocations) onUpdateLocations(updated);
    setSelectedLocation(newLoc);
    setIsAddingModalOpen(false);
    setNewName('');
    setNewDesc('');
    setNewLighting('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Univers & Studio des Décors
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Gestion des environnements, lieux et éclairages pour empêcher les faux raccords de décors d'un plan à l'autre.
          </p>
        </div>

        <button
          onClick={() => setIsAddingModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Nouveau Décor</span>
        </button>
      </div>

      {/* Main Grid: Left Location Cards, Right Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Locations Gallery */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`cursor-pointer rounded-2xl overflow-hidden border transition-all bg-slate-900/60 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={loc.imageUrl || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop'}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30 uppercase">
                    {loc.type}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                    <h3 className="font-serif font-bold text-slate-100 text-base">{loc.name}</h3>
                    <p className="text-[11px] text-slate-300 truncate">{loc.description}</p>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{loc.lightingAtmosphere}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{loc.era}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Location Detail Card */}
        {selectedLocation && (
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl h-fit">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-lg">{selectedLocation.name}</h3>
                <p className="text-xs text-amber-400 font-mono">Ancre Visuelle de Décor</p>
              </div>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Compass className="w-5 h-5" />
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 h-48 bg-slate-950 relative group">
              <img
                src={selectedLocation.imageUrl}
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleGenerateLocationImage(selectedLocation)}
                disabled={isGeneratingImage === selectedLocation.id}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingImage === selectedLocation.id ? 'Génération IA...' : 'Générer Décor IA'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Description Extrait</span>
                <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {selectedLocation.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Époque / Style</span>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 font-mono">
                    {selectedLocation.era}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Architecture</span>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
                    {selectedLocation.architecture}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Prompt Verrrouillé</span>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-300 border border-slate-800 break-words">
                  {selectedLocation.visualPrompt}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('scenes')}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <span>Associer ce décor aux scènes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal Add Location */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-slate-100 text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <span>Nouveau Décor / Univers</span>
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom du Décor</label>
                <input
                  type="text"
                  placeholder="Ex: Le Salon du Château, Rue Pavée..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="interieur">Intérieur</option>
                    <option value="exterieur">Extérieur</option>
                    <option value="nature">Nature / Paysage</option>
                    <option value="urbain">Urbain / Rue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Époque</label>
                  <input
                    type="text"
                    placeholder="Ex: 1920s, Contemporain..."
                    value={newEra}
                    onChange={(e) => setNewEra(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description du Décor</label>
                <textarea
                  placeholder="Description détaillée de l'ambiance et des meubles..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none h-20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Éclairage & Ambiance</label>
                <input
                  type="text"
                  placeholder="Ex: Tempête nocturne, bougies sombres..."
                  value={newLighting}
                  onChange={(e) => setNewLighting(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Enregistrer Décor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
