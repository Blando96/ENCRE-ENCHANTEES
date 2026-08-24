import React, { useState } from 'react';
import { ChapterProject, NavTab } from '../types';
import {
  FolderKanban,
  Users,
  Compass,
  Video,
  Mic,
  Music,
  Volume2,
  Search,
  Filter,
  Download,
  ExternalLink
} from 'lucide-react';

interface AssetLibraryProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ project, setActiveTab }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'characters' | 'locations' | 'videos' | 'audio'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const characterAssets = (project.characters || []).map((c) => ({
    id: c.id,
    name: c.name,
    category: 'characters' as const,
    type: 'Ancre Visuelle Personnage',
    previewUrl: c.referenceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    code: c.characterCode || 'CHAR_01'
  }));

  const locationAssets = (project.locations || []).map((l) => ({
    id: l.id,
    name: l.name,
    category: 'locations' as const,
    type: 'Décor & Eclairage',
    previewUrl: l.imageUrl || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
    code: l.era
  }));

  const allAssets = [...characterAssets, ...locationAssets];

  const filteredAssets = allAssets.filter((a) => {
    const matchesCat = activeCategory === 'all' || a.category === activeCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Bibliothèque Centralisée des Assets Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Explorer et télécharger les visages de référence, décors 8K, séquences vidéo et pistes audios du film.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher un asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Tous les Assets ({allAssets.length})
        </button>
        <button
          onClick={() => setActiveCategory('characters')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'characters'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Visages & Personnages ({characterAssets.length})
        </button>
        <button
          onClick={() => setActiveCategory('locations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'locations'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Décors & Environnements ({locationAssets.length})
        </button>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-3.5 shadow-lg hover:border-amber-500/30 transition-all group"
          >
            <div className="relative aspect-square rounded-xl bg-slate-950 overflow-hidden border border-slate-800">
              <img
                src={asset.previewUrl}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[9px] font-mono font-bold text-amber-300 border border-amber-500/30">
                {asset.code}
              </div>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-serif font-bold text-slate-100 text-xs truncate">{asset.name}</h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono">{asset.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
