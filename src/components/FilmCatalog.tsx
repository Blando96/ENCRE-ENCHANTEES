import React, { useState } from 'react';
import { ChapterProject, GeneratedFilm, NavTab } from '../types';
import {
  Film,
  Play,
  Sparkles,
  Clock,
  Download,
  Share2,
  CheckCircle2,
  Plus,
  ArrowRight,
  Tv,
  Clapperboard
} from 'lucide-react';

interface FilmCatalogProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
  onOpenPlayer?: () => void;
}

export const FilmCatalog: React.FC<FilmCatalogProps> = ({
  project,
  setActiveTab,
  onOpenPlayer,
}) => {
  const defaultThumbnail = project.scenes?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop';

  const [films, setFilms] = useState<GeneratedFilm[]>(() => {
    if (project.generatedFilms && project.generatedFilms.length > 0) {
      return project.generatedFilms;
    }
    return [
      {
        id: `film_${project.id || 'default'}`,
        title: `${project.title || 'Mon Roman'} — Épisode 1`,
        chapterTitle: `Transcrit de ${project.title || 'Chapitre de Roman'}`,
        durationFormatted: '02:30',
        resolution: '4K Ultra HD',
        aspectRatio: project.aspectRatio || '16:9',
        thumbnailUrl: defaultThumbnail,
        createdAt: "À l'instant",
        status: 'ready'
      }
    ];
  });

  // Re-sync catalog when project changes
  React.useEffect(() => {
    if (project.generatedFilms && project.generatedFilms.length > 0) {
      setFilms(project.generatedFilms);
    } else {
      setFilms([
        {
          id: `film_${project.id || 'default'}`,
          title: `${project.title || 'Mon Roman'} — Épisode 1`,
          chapterTitle: `Transcrit de ${project.title || 'Chapitre de Roman'}`,
          durationFormatted: '02:30',
          resolution: '4K Ultra HD',
          aspectRatio: project.aspectRatio || '16:9',
          thumbnailUrl: project.scenes?.[0]?.imageUrl || defaultThumbnail,
          createdAt: "À l'instant",
          status: 'ready'
        }
      ]);
    }
  }, [project.id, project.title, project.scenes]);

  const [isGeneratingNewFilm, setIsGeneratingNewFilm] = useState(false);

  const handleCreateNewFilm = (format: 'teaser' | 'episode' | 'full') => {
    setIsGeneratingNewFilm(true);

    setTimeout(() => {
      const newFilm: GeneratedFilm = {
        id: `film_${Date.now()}`,
        title: `${project.title} — ${format === 'teaser' ? 'Bande-Annonce Teaser' : 'Version Longue 4K'}`,
        chapterTitle: 'Chapitre Complete Edition',
        durationFormatted: format === 'teaser' ? '00:45' : '04:15',
        resolution: '4K',
        aspectRatio: '16:9',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
        createdAt: "À l'instant",
        status: 'ready'
      };

      setFilms([newFilm, ...films]);
      setIsGeneratingNewFilm(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Film className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Studio des Films Générés
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Assemblage du storyboard, des clips vidéo et des pistes audio en un film cinématographique complet prêt à la diffusion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreateNewFilm('teaser')}
            disabled={isGeneratingNewFilm}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span>Créer Teaser 45s</span>
          </button>
          <button
            onClick={() => handleCreateNewFilm('full')}
            disabled={isGeneratingNewFilm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Générer Film Master 4K</span>
          </button>
        </div>
      </div>

      {/* Generated Films Poster Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {films.map((film) => (
          <div
            key={film.id}
            className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden space-y-4 p-5 shadow-xl hover:border-amber-500/40 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Poster Image */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
                <img
                  src={film.thumbnailUrl}
                  alt={film.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30 font-mono">
                  {film.resolution} • {film.aspectRatio}
                </div>

                <button
                  onClick={() => {
                    if (onOpenPlayer) onOpenPlayer();
                    else setActiveTab('player');
                  }}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all shadow-xl shadow-amber-500/30 group-hover:scale-110"
                >
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-slate-100 text-base group-hover:text-amber-300 transition-colors">
                  {film.title}
                </h3>
                <p className="text-xs text-slate-400">{film.chapterTitle}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{film.durationFormatted}</span>
              </span>

              <button
                onClick={() => setActiveTab('export')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter MP4</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Next Step Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-slate-100 text-sm">Prêt pour l'exportation finale ?</h3>
          <p className="text-xs text-slate-400">
            Exportez en MP4 1080p / 4K, adaptez aux formats sociaux (16:9, 9:16 vertical) et téléchargez le script PDF.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('export')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Accéder aux Exportations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
