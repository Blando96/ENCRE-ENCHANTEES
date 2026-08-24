import React, { useState } from 'react';
import { ChapterProject, NavTab } from '../types';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Film,
  Mic,
  Music,
  MessageSquare,
  Sparkles,
  Scissors,
  ArrowRight,
  Download
} from 'lucide-react';

interface TimelineStudioProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
}

export const TimelineStudio: React.FC<TimelineStudioProps> = ({ project, setActiveTab }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

  const scenes = project?.scenes || [];
  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 6), 0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (scenes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Studio de Montage & Timeline Multi-Pistes
            </h1>
          </div>
        </div>

        <div className="bg-slate-900/60 p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <Film className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-serif font-bold text-slate-100">
            Aucune séquence à monter
          </h2>
          <p className="text-xs text-slate-400">
            Générez vos scènes et vos plans pour accéder à la table de montage multi-pistes.
          </p>
          <button
            onClick={() => setActiveTab('scenes')}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all inline-flex items-center gap-2"
          >
            <span>Découper les Scènes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Studio de Montage & Timeline Multi-Pistes
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Édition fine des pistes vidéo, synchronisation voix-off, calage des bruitages et incrustation de sous-titres.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('coherence_guard')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <span>Vérifier la Cohérence IA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Video Monitor + Master Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monitor Player */}
        <div className="lg:col-span-2 bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 group">
            <img
              src={project.scenes[0]?.imageUrl || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1280&auto=format&fit=crop'}
              alt="Montage Monitor"
              className="w-full h-full object-cover"
            />

            {/* Subtitles Overlay */}
            {subtitlesEnabled && (
              <div className="absolute bottom-6 left-8 right-8 text-center pointer-events-none">
                <span className="inline-block px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-300 font-serif text-sm font-semibold shadow-2xl">
                  "La pluie battante cinglait le verre dépoli du phare des Roches Noires..."
                </span>
              </div>
            )}

            {/* Play Button Overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all shadow-2xl shadow-amber-500/40"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          {/* Transport Controls Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => setCurrentTime(0)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-200">
                00:{currentTime < 10 ? `0${currentTime}` : currentTime} / 00:{totalDuration}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all ${
                  subtitlesEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Sous-titres : {subtitlesEnabled ? 'Activés' : 'Désactivés'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Track Mixer & Transitions */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
          <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Mixeur Master & Volumes</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Piste Vidéo Clip</span>
                </span>
                <span>100%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="100" className="w-full accent-amber-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voix-Off Narration</span>
                </span>
                <span>90%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="90" className="w-full accent-amber-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bruitages Sound FX</span>
                </span>
                <span>75%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-amber-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>Musique d'Ambiance</span>
                </span>
                <span>40%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-amber-500" />
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Track Timeline Visualizer */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-serif font-bold text-slate-100 text-sm flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span>Pistes Multi-Séquences Cinéma</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Total : {totalDuration} secondes</span>
        </div>

        {/* Tracks Grid */}
        <div className="space-y-2 text-xs font-mono">
          
          {/* Track 1: Video Shots */}
          <div className="flex items-center gap-3">
            <div className="w-28 text-slate-400 flex items-center gap-1.5 text-[11px] font-sans font-semibold">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>🎥 Vidéo</span>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2">
              {project.scenes.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold truncate text-[11px]"
                >
                  Scène {s.sceneNumber} ({s.duration}s)
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Voiceover */}
          <div className="flex items-center gap-3">
            <div className="w-28 text-slate-400 flex items-center gap-1.5 text-[11px] font-sans font-semibold">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>🎙️ Voix-Off</span>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2">
              {project.scenes.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 truncate text-[11px]"
                >
                  Voix FR #{s.sceneNumber}
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: Sound FX */}
          <div className="flex items-center gap-3">
            <div className="w-28 text-slate-400 flex items-center gap-1.5 text-[11px] font-sans font-semibold">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>🔊 Bruitages</span>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2">
              {project.scenes.map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 truncate text-[10px]"
                >
                  {s.soundEffects}
                </div>
              ))}
            </div>
          </div>

          {/* Track 4: Subtitles */}
          <div className="flex items-center gap-3">
            <div className="w-28 text-slate-400 flex items-center gap-1.5 text-[11px] font-sans font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>💬 Sous-titres</span>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2">
              {project.scenes.map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 truncate text-[10px]"
                >
                  ST-FR #{s.sceneNumber}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Next Step Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-slate-100 text-sm">Vérifier la cohérence globale avant le rendu final ?</h3>
          <p className="text-xs text-slate-400">
            L'IA effectue une analyse de continuité (visages, garde-robe, lumière) pour éliminer tout bug visuel.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('coherence_guard')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Étape Suivante : Contrôle Cohérence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
