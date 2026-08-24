import React from 'react';
import { ChapterProject, NavTab } from '../types';
import { CINESCRYPTE_LOGO_URL } from '../assets/logo';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Users,
  Compass,
  Clapperboard,
  Film,
  Video,
  Mic,
  Sliders,
  ShieldAlert,
  Sparkles,
  FolderKanban,
  FileVideo,
  CheckCircle2,
  TrendingUp,
  Zap,
  ArrowRight,
  Layers,
  Award,
  Play
} from 'lucide-react';

interface DashboardProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ project, setActiveTab }) => {
  const creditsUsed = 2550;
  const creditsTotal = 5000;
  const creditsPercent = Math.round((creditsUsed / creditsTotal) * 100);

  const characterCount = project.characters?.length || 0;
  const locationCount = project.locations?.length || 0;
  const sceneCount = project.scenes?.length || 0;
  const totalShotsCount = project.scenes?.reduce((acc, s) => acc + (s.shots?.length || 1), 0) || 0;
  const anomalyCount = project.continuityAnomalies?.filter((a) => a.status === 'detected').length || 0;

  const pipelineSteps: { name: string; tab: NavTab; icon: React.ElementType; status: string }[] = [
    { name: '1. Roman', tab: 'novels', icon: BookOpen, status: 'Actif' },
    { name: '2. Analyse IA', tab: 'ai_analysis', icon: Brain, status: 'Analysé' },
    { name: '3. Personnages', tab: 'characters', icon: Users, status: `${characterCount} Fiches` },
    { name: '4. Décors', tab: 'locations', icon: Compass, status: `${locationCount} Lieux` },
    { name: '5. Scènes', tab: 'scenes', icon: Clapperboard, status: `${sceneCount} Scènes` },
    { name: '6. Storyboard', tab: 'storyboard', icon: Film, status: `${totalShotsCount} Plans` },
    { name: '7. Génération Vidéo', tab: 'video_generator', icon: Video, status: 'Prêt' },
    { name: '8. Studio Audio', tab: 'audio_studio', icon: Mic, status: 'Prêt' },
    { name: '9. Montage', tab: 'timeline_editor', icon: Sliders, status: 'Prêt' },
    { name: '10. Cohérence IA', tab: 'coherence_guard', icon: ShieldAlert, status: anomalyCount > 0 ? `${anomalyCount} Alertes` : '100% OK' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-950 p-8 border border-amber-500/30 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Studio Cinématographique IA — Single-Prompt to Film</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 p-0.5 border border-amber-500/40 shadow-xl shadow-amber-500/20 shrink-0">
                <img
                  src={CINESCRYPTE_LOGO_URL}
                  alt="CINESCRYPTE IA Logo"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-100 tracking-tight">
                Bienvenue dans <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">CINESCRYPTE IA</span>
              </h1>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Projet actif : <strong className="text-amber-300 font-serif">{project.title}</strong> par {project.author || 'Henri de La Tour'}. 
              Passez en revue la chaîne de production cinématographique et transformez vos textes en films haute fidélité.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('novels')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 fill-current" />
              <span>Importer un Roman (Word / PDF)</span>
            </button>
            <button
              onClick={() => setActiveTab('my_films')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-amber-400 fill-current" />
              <span>Voir les Films</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Metrics & AI Credits Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Credits Gauge */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Crédits IA Moteur</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{creditsPercent}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {creditsUsed.toLocaleString()} <span className="text-xs text-slate-500 font-sans">/ {creditsTotal.toLocaleString()} cr.</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${creditsPercent}%` }} />
          </div>
        </div>

        {/* Characters Metric */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Personnages Locks</span>
            </span>
            <span className="text-xs text-emerald-400 font-medium">Character Bible</span>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-100">
            {characterCount} <span className="text-xs text-slate-400 font-sans font-normal">ancres verrouillées</span>
          </div>
          <p className="text-[11px] text-slate-500">ID de cohérence active (ex: VIC_001)</p>
        </div>

        {/* Scenes / Shots Metric */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Découpage Plans</span>
            </span>
            <span className="text-xs text-amber-400 font-medium">{sceneCount} scènes</span>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-100">
            {totalShotsCount} <span className="text-xs text-slate-400 font-sans font-normal">plans ciné</span>
          </div>
          <p className="text-[11px] text-slate-500">Durée estimée : ~02m 30s</p>
        </div>

        {/* AI Continuity Status */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Cohérence Visuelle</span>
            </span>
            <span className={`text-xs font-bold ${anomalyCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {anomalyCount > 0 ? 'Action Requise' : 'Verrouillée'}
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-100">
            {anomalyCount > 0 ? `${anomalyCount} anomalie` : '100% Conforme'}
          </div>
          <p className="text-[11px] text-slate-500">
            {anomalyCount > 0 ? 'Ajustement rapide dispo' : 'Visages & décors alignés'}
          </p>
        </div>

      </div>

      {/* Production Chain Pipeline Flow */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-amber-400" />
              <span>Chaîne de Production Cinématographique</span>
            </h2>
            <p className="text-xs text-slate-400">
              Accédez directement à chaque compartiment de votre studio de production cinématographique IA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineSteps.map((step) => {
            const IconComponent = step.icon;
            return (
              <button
                key={step.tab}
                onClick={() => setActiveTab(step.tab)}
                className="group p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 text-left transition-all duration-200 flex flex-col justify-between h-32 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {step.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-serif font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {step.name}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 group-hover:text-slate-300">
                    <span>Ouvrir le module</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Access Studio Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Character Studio */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-base">Studio Personnages & Bible</h3>
                <p className="text-xs text-slate-400">Verrouillage de visage & Character IDs</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Conservez le même visage, teint, coiffure et tenue pour Victor et Éléonore sur toutes les scènes.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('characters')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>Gérer les {characterCount} Personnages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: AI Video Generator */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-base">Générateur Vidéo Multi-Modèles</h3>
                <p className="text-xs text-slate-400">Image-to-Video & Camera Motion</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Routeur vidéo intelligent (UltraMotion, LipSync Pro) pour animer chaque plan avec mouvements fluides.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('video_generator')}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
          >
            <span>Lancer la Génération Vidéo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Timeline & Montage */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-base">Studio de Montage</h3>
                <p className="text-xs text-slate-400">Timeline Multi-Pistes & Audio</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assemblez les séquences, ajustez les voix-off, sous-titres, bruitages et musiques d'ambiance.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('timeline_editor')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>Ouvrir la Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
