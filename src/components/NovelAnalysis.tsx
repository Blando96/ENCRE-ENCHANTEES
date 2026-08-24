import React, { useState } from 'react';
import { ChapterProject, NavTab, Character, LocationDecor, Scene } from '../types';
import {
  Brain,
  Sparkles,
  Users,
  Compass,
  MessageSquare,
  Clock,
  Layers,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileText,
  Zap,
  Activity,
  RotateCcw,
  Copy,
  Check,
  Film,
  Camera,
  Eye,
  Sliders,
  AlertCircle,
  BookOpen,
  Volume2,
  Share2,
  Wand2,
  Send,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  Image as ImageIcon,
  Play,
  Maximize2,
  Video,
  ExternalLink,
  Download,
  Trash2,
  X
} from 'lucide-react';

interface NovelAnalysisProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
  onUpdateProject?: (updated: ChapterProject) => void;
  onOpenResetModal?: () => void;
}

export const NovelAnalysis: React.FC<NovelAnalysisProps> = ({
  project,
  setActiveTab,
  onUpdateProject,
  onOpenResetModal,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysisStep, setActiveAnalysisStep] = useState<string>('');
  const [workScope, setWorkScope] = useState<'both' | 'prologue_only' | 'chapter_only'>('both');
  const [selectedSubTab, setSelectedSubTab] = useState<'overview' | 'characters' | 'locations' | 'scenes' | 'prompts'>('overview');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [analysisSuccessMsg, setAnalysisSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [directorNotes, setDirectorNotes] = useState<string>(project.directorConsignes || '');

  // Prompt enhancement state
  const [enhancingPromptId, setEnhancingPromptId] = useState<string | null>(null);
  const [enhancedPromptsMap, setEnhancedPromptsMap] = useState<
    Record<
      string,
      {
        enhancedPrompt: string;
        improvementsExplanation: string;
        suggestedCameraMotion: string;
        visualKeywords: string[];
      }
    >
  >({});
  const [customInstructionsMap, setCustomInstructionsMap] = useState<Record<string, string>>({});
  const [promptCategoryFilter, setPromptCategoryFilter] = useState<'all' | 'scenes' | 'characters' | 'locations'>('all');

  // Image generation state
  const [generatingCharImageId, setGeneratingCharImageId] = useState<string | null>(null);
  const [generatingAllChars, setGeneratingAllChars] = useState<boolean>(false);
  const [generatingLocationImageId, setGeneratingLocationImageId] = useState<string | null>(null);
  const [generatingSceneImageId, setGeneratingSceneImageId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // 1. Generate Character Image Portrait & Sync to Storyboard & Video
  const handleGenerateCharacterImage = async (charId: string, charName: string, visualAnchor: string) => {
    if (generatingCharImageId) return;
    setGeneratingCharImageId(charId);
    setErrorMessage(null);
    const targetChar = charactersList.find((c) => c.id === charId);
    try {
      const response = await fetch('/api/generate-character-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: charName,
          visualAnchor: visualAnchor || targetChar?.visualAnchor || '',
          gender: targetChar?.gender || '',
          ethnicity: targetChar?.ethnicity || '',
          skinTone: targetChar?.skinTone || '',
          age: targetChar?.age || '',
          hair: targetChar?.hair || '',
          eyes: targetChar?.eyes || '',
          faceFeatures: targetChar?.faceFeatures || '',
          clothingStyle: targetChar?.clothingStyle || '',
          role: targetChar?.role || '',
          artStyle: project.artStyle || 'ultra_realism',
        }),
      });
      const result = await response.json();
      if (result.success && result.imageUrl) {
        const updatedChars = charactersList.map((c) => {
          if (c.id === charId) {
            const existingRefs = c.faceReferences || [];
            const newRef = {
              angle: 'frontal' as const,
              label: `Portrait Studio HD (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
              imageUrl: result.imageUrl,
            };
            return {
              ...c,
              referenceImageUrl: result.imageUrl,
              avatarUrl: result.imageUrl,
              faceReferences: [newRef, ...existingRefs.filter((r) => r.imageUrl !== result.imageUrl)],
            };
          }
          return c;
        });
        if (onUpdateProject) {
          onUpdateProject({
            ...project,
            characters: updatedChars,
            updatedAt: new Date().toISOString(),
          });
        }
        setAnalysisSuccessMsg(`Portrait IA généré et verrouillé avec succès pour ${charName} ! Synchronisé pour le Storyboard et la Vidéo.`);
        setTimeout(() => setAnalysisSuccessMsg(null), 4000);
      } else {
        throw new Error(result.error || "Erreur lors de la génération du portrait");
      }
    } catch (err: any) {
      console.error('Error generating character image:', err);
      setErrorMessage(err.message || 'Erreur lors de la génération du portrait.');
    } finally {
      setGeneratingCharImageId(null);
    }
  };

  // 2. Batch Generate All Characters Images
  const handleGenerateAllCharacters = async () => {
    if (charactersList.length === 0 || generatingAllChars) return;
    setGeneratingAllChars(true);
    setErrorMessage(null);
    try {
      let currentChars = [...charactersList];
      for (const char of currentChars) {
        setGeneratingCharImageId(char.id);
        try {
          const response = await fetch('/api/generate-character-portrait', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characterName: char.name,
              visualAnchor: char.visualAnchor,
              gender: char.gender,
              ethnicity: char.ethnicity || '',
              skinTone: char.skinTone || '',
              age: char.age,
              hair: char.hair,
              eyes: char.eyes,
              faceFeatures: char.faceFeatures,
              clothingStyle: char.clothingStyle,
              role: char.role,
              artStyle: project.artStyle || 'ultra_realism',
            }),
          });
          const result = await response.json();
          if (result.success && result.imageUrl) {
            const existingRefs = char.faceReferences || [];
            const newRef = {
              angle: 'frontal' as const,
              label: `Portrait Studio HD (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
              imageUrl: result.imageUrl,
            };
            currentChars = currentChars.map((c) =>
              c.id === char.id
                ? {
                    ...c,
                    referenceImageUrl: result.imageUrl,
                    avatarUrl: result.imageUrl,
                    faceReferences: [newRef, ...existingRefs.filter((r) => r.imageUrl !== result.imageUrl)],
                  }
                : c
            );
            if (onUpdateProject) {
              onUpdateProject({
                ...project,
                characters: currentChars,
                updatedAt: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.error('Error generating portrait for ' + char.name, e);
        }
      }
      setAnalysisSuccessMsg('Tous les visages des personnages ont été générés et verrouillés pour la vidéo !');
      setTimeout(() => setAnalysisSuccessMsg(null), 5000);
    } finally {
      setGeneratingCharImageId(null);
      setGeneratingAllChars(false);
    }
  };

  // 3. Generate Location Decor Image
  const handleGenerateLocationImage = async (locId: string, locName: string, visualPrompt: string) => {
    if (!visualPrompt || generatingLocationImageId) return;
    setGeneratingLocationImageId(locId);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/generate-location-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: locName,
          visualPrompt: visualPrompt,
          artStyle: project.artStyle || 'ultra_realism',
        }),
      });
      const result = await response.json();
      if (result.success && result.imageUrl) {
        const updatedLocations = locationsList.map((loc) => {
          if (loc.id === locId) {
            return {
              ...loc,
              imageUrl: result.imageUrl,
            };
          }
          return loc;
        });
        if (onUpdateProject) {
          onUpdateProject({
            ...project,
            locations: updatedLocations,
            updatedAt: new Date().toISOString(),
          });
        }
        setAnalysisSuccessMsg(`Image du décor "${locName}" générée et intégrée au projet !`);
        setTimeout(() => setAnalysisSuccessMsg(null), 4000);
      } else {
        throw new Error(result.error || "Erreur lors de la génération du décor");
      }
    } catch (err: any) {
      console.error('Error generating location image:', err);
      setErrorMessage(err.message || 'Erreur lors de la génération du décor.');
    } finally {
      setGeneratingLocationImageId(null);
    }
  };

  // 4. Generate Scene Frame Image (Locks characters & scene prompt for video)
  const handleGenerateSceneImage = async (sceneId: string, promptText: string, sceneTitle?: string) => {
    if (!promptText || generatingSceneImageId) return;
    setGeneratingSceneImageId(sceneId);
    setErrorMessage(null);
    try {
      const charAnchors = charactersList.map((c) => `${c.name}: ${c.visualAnchor}`).filter(Boolean);
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio: project.aspectRatio || '16:9',
          characterAnchors: charAnchors,
          artStyle: project.artStyle || 'ultra_realism',
        }),
      });
      const result = await response.json();
      if (result.success && result.imageUrl) {
        const updatedScenes = scenesList.map((scene) => {
          if (scene.id === sceneId) {
            return {
              ...scene,
              imageUrl: result.imageUrl,
              imagePrompt: result.optimizedPrompt || promptText,
            };
          }
          return scene;
        });
        if (onUpdateProject) {
          onUpdateProject({
            ...project,
            scenes: updatedScenes,
            updatedAt: new Date().toISOString(),
          });
        }
        setAnalysisSuccessMsg(`Image de la scène "${sceneTitle || ''}" générée ! Directement synchronisée pour la vidéo Seedance 2.5.`);
        setTimeout(() => setAnalysisSuccessMsg(null), 4000);
      } else {
        throw new Error(result.error || "Erreur lors de la génération de l'image de scène");
      }
    } catch (err: any) {
      console.error('Error generating scene image:', err);
      setErrorMessage(err.message || "Erreur lors de la génération de l'image de scène.");
    } finally {
      setGeneratingSceneImageId(null);
    }
  };

  // 5. Navigate to Video Studio directly with selected Scene
  const handleGoToVideoForScene = (sceneId: string) => {
    setActiveTab('video_generator');
  };
  const rawTextLength = (project.rawText || '').split(/\s+/).filter(Boolean).length;
  const prologueLength = (project.prologueText || '').split(/\s+/).filter(Boolean).length;
  const totalWordCount = rawTextLength + prologueLength;
  const charactersList = project.characters || [];
  const locationsList = project.locations || [];
  const scenesList = project.scenes || [];
  const totalDurationSeconds = scenesList.reduce((acc, s) => acc + (s.duration || 15), 0);
  const estimatedFilmDurationMinutes = Math.max(1, Math.round(totalDurationSeconds / 60));

  const prologueScenesCount = scenesList.filter((s) => (s.title || '').toLowerCase().includes('prologue')).length;
  const chapterScenesCount = scenesList.length - prologueScenesCount;

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Open Chat IA and send prompt for interactive refinement
  const handleSendPromptToAIChat = (promptText: string, sceneTitle?: string, novelExcerpt?: string) => {
    window.dispatchEvent(
      new CustomEvent('open-ai-chat-with-prompt', {
        detail: {
          prompt: promptText,
          sceneTitle: sceneTitle || 'Scène du roman',
          novelExcerpt: novelExcerpt || '',
          autoSend: true,
        },
      })
    );
  };

  // Direct AI Prompt Enhancer with extreme precision & cinematic details
  const handleEnhancePrompt = async (
    promptId: string,
    basePrompt: string,
    sceneTitle?: string,
    novelExcerpt?: string,
    enhancementMode: string = 'hyper_precision',
    customInstruction?: string
  ) => {
    if (!basePrompt || enhancingPromptId) return;

    setEnhancingPromptId(promptId);
    setErrorMessage(null);

    try {
      const charAnchors = charactersList.map((c) => `${c.name}: ${c.visualAnchor}`).filter(Boolean);

      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: basePrompt,
          sceneTitle: sceneTitle || 'Scène du roman',
          novelExcerpt: novelExcerpt || '',
          characterAnchors: charAnchors,
          enhancementMode,
          customInstruction: customInstruction || customInstructionsMap[promptId] || '',
          artStyle: project.artStyle || 'ultra_realism',
          aspectRatio: project.aspectRatio || '16:9',
        }),
      });

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Échec de l'amélioration du prompt.");
      }

      setEnhancedPromptsMap((prev) => ({
        ...prev,
        [promptId]: result.data,
      }));

      setAnalysisSuccessMsg(`Prompt amélioré avec succès pour "${sceneTitle || 'la scène'}" ! Précision et optiques cinématographiques appliquées.`);
      setTimeout(() => setAnalysisSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error enhancing prompt:', err);
      setErrorMessage(err.message || "Erreur lors de l'amélioration du prompt.");
    } finally {
      setEnhancingPromptId(null);
    }
  };

  // Apply enhanced prompt directly into project scene
  const handleApplyEnhancedPromptToScene = (sceneId: string, enhancedPrompt: string) => {
    const updatedScenes = scenesList.map((s) => {
      if (s.id === sceneId) {
        return {
          ...s,
          imagePrompt: enhancedPrompt,
        };
      }
      return s;
    });

    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString(),
      });
    }

    setAnalysisSuccessMsg('Prompt amélioré appliqué avec succès à la scène !');
    setTimeout(() => setAnalysisSuccessMsg(null), 3000);
  };

  const handleRunRealAnalysis = async () => {
    let activePrologue = (project.prologueText || '').trim();
    let activeRawText = (project.rawText || '').trim();

    if (workScope === 'prologue_only') {
      activePrologue = activePrologue || activeRawText;
      activeRawText = '';
    } else if (workScope === 'chapter_only') {
      activeRawText = activeRawText || activePrologue;
      activePrologue = '';
    }

    if (!activePrologue && !activeRawText) {
      setErrorMessage("Veuillez d'abord importer le texte du roman ou du prologue dans l'onglet 'Importation Roman'.");
      return;
    }

    setErrorMessage(null);
    setAnalysisSuccessMsg(null);
    setIsAnalyzing(true);
    setActiveAnalysisStep("1/4 : Analyse sémantique & vectorisation du récit...");

    try {
      setTimeout(() => {
        setActiveAnalysisStep("2/4 : Extraction des personnages, traits physiques et Visual Anchors...");
      }, 1500);

      setTimeout(() => {
        setActiveAnalysisStep("3/4 : Détection des décors, éclairages et atmosphères cinématographiques...");
      }, 3000);

      setTimeout(() => {
        setActiveAnalysisStep("4/4 : Découpage des scènes du prologue/chapitres et prompts photoréalistes...");
      }, 4500);

      const response = await fetch('/api/analyze-novel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prologueText: activePrologue,
          rawText: activeRawText,
          title: project.title || 'Mon Roman',
          artStyle: project.artStyle || 'ultra_realism',
          aspectRatio: project.aspectRatio || '16:9',
          workScope,
          directorConsignes: directorNotes || project.directorConsignes,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || result.details || "Échec de l'analyse avec l'IA.");
      }

      const data = result.data;

      // Build updated project
      const updatedProject: ChapterProject = {
        ...project,
        title: data.title || project.title,
        genre: data.genre || project.genre,
        summary: data.summary || project.summary,
        directorConsignes: directorNotes,
        characters: data.characters && data.characters.length > 0 ? data.characters : project.characters,
        locations: data.locations && data.locations.length > 0 ? data.locations : project.locations,
        scenes: data.scenes && data.scenes.length > 0 ? data.scenes : project.scenes,
        updatedAt: new Date().toISOString(),
      };

      if (onUpdateProject) {
        onUpdateProject(updatedProject);
      }

      setAnalysisSuccessMsg(
        `Synchronisation réussie ! ${updatedProject.characters?.length || 0} personnages, ${updatedProject.locations?.length || 0} décors et ${updatedProject.scenes?.length || 0} scènes ont été extraits et synchronisés avec le roman.`
      );
    } catch (err: any) {
      console.error('Error running novel analysis:', err);
      setErrorMessage(err.message || "Erreur lors de la synchronisation avec l'IA.");
    } finally {
      setIsAnalyzing(false);
      setActiveAnalysisStep('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Analyse IA & Extraction Scénaristique
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Synchronisation directe avec le roman : extraction automatique des personnages, des décors, des prompts photoréalistes et découpage séquentiel complet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenResetModal && (
            <button
              onClick={onOpenResetModal}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs transition-all flex items-center gap-2 shadow-md"
              title="Nettoyer les prompts et réinitialiser l'étude à zéro"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>Reset ↺</span>
            </button>
          )}

          <button
            onClick={handleRunRealAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Synchronisation en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Lancer la Synchronisation & Extraction IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Loading Progress Bar */}
      {isAnalyzing && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{activeAnalysisStep || "Analyse et vectorisation du roman par Gemini..."}</span>
            </span>
            <span className="font-mono text-[11px] bg-amber-500/20 px-2.5 py-1 rounded-lg">Moteur Cinéma IA</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Success Banner */}
      {analysisSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{analysisSuccessMsg}</span>
          </div>
          <button
            onClick={() => setAnalysisSuccessMsg(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-bold underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Scope & Directive Configuration Card */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Périmètre de Détection & Extraction</span>
            </h2>
            <p className="text-xs text-slate-400">
              Choisissez les parties du roman à synchroniser (Prologue, Chapitres ou Intégralité).
            </p>
          </div>

          {/* Scope Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setWorkScope('both')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workScope === 'both'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Prologue + Chapitres</span>
            </button>
            <button
              onClick={() => setWorkScope('prologue_only')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workScope === 'prologue_only'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📜 Prologue Seul</span>
            </button>
            <button
              onClick={() => setWorkScope('chapter_only')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                workScope === 'chapter_only'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📖 Chapitres Seuls</span>
            </button>
          </div>
        </div>

        {/* Director Consignes & Roman Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Directives Spéciales du Réalisateur (Optionnel)</span>
            </label>
            <input
              type="text"
              value={directorNotes}
              onChange={(e) => setDirectorNotes(e.target.value)}
              placeholder="Ex: Ambiance très sombre, focus sur le regard des personnages, style photoréaliste 35mm..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">
                Titre : <span className="text-amber-400 font-serif">{project.title || 'Sans titre'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Style : <strong className="text-slate-300">{project.artStyle || 'Ultra Réalisme'}</strong> ({project.aspectRatio || '16:9'})
              </div>
            </div>
            <button
              onClick={() => setActiveTab('novels')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Modifier Roman ✍️
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Volume Analysé</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-100">{totalWordCount} mots</div>
          <p className="text-[10px] text-slate-500">
            Prologue: {prologueLength} | Chapitres: {rawTextLength}
          </p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Personnages Extraits</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">{charactersList.length}</div>
          <p className="text-[10px] text-slate-500">Avec Visual Anchors verrouillés</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Décors & Lieux</span>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-400">{locationsList.length}</div>
          <p className="text-[10px] text-slate-500">Architectures & Éclairages</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Film className="w-4 h-4 text-amber-400" />
            <span>Scènes Découpées</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{scenesList.length} scènes</div>
          <p className="text-[10px] text-slate-500">
            ~{estimatedFilmDurationMinutes} min ({totalDurationSeconds}s)
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setSelectedSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedSubTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Vue d'Ensemble & Synopsis</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('characters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedSubTab === 'characters'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personnages ({charactersList.length})</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('locations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedSubTab === 'locations'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Décors & Lieux ({locationsList.length})</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('scenes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedSubTab === 'scenes'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Toutes les Scènes ({scenesList.length})</span>
        </button>

        <button
          onClick={() => setSelectedSubTab('prompts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedSubTab === 'prompts'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prompts Photoréalistes</span>
        </button>
      </div>

      {/* 1. OVERVIEW SUB-TAB */}
      {selectedSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Synopsis & Dramatic Arc */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Synopsis & Déroulé Dramatique</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase">
                Genre : {project.genre || 'Cinéma Dramatique'}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed font-sans">
              {project.summary ||
                "L'analyse IA a scanné le roman pour extraire les enjeux majeurs, la tension narrative et les dynamiques entre les protagonistes."}
            </p>

            {project.prologueText && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span>📜 Prologue Intégré</span>
                  <span className="text-[10px] text-slate-400">
                    ({project.prologueText.split(/\s+/).filter(Boolean).length} mots — {prologueScenesCount} scènes)
                  </span>
                </div>
                <p className="text-xs text-slate-400 italic line-clamp-3">"{project.prologueText}"</p>
              </div>
            )}
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Characters Highlight */}
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Personnages Extraits</span>
                </span>
                <button
                  onClick={() => setSelectedSubTab('characters')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Voir tout ({charactersList.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {charactersList.slice(0, 3).map((char) => (
                  <div key={char.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-200">{char.name}</div>
                      <div className="text-[10px] text-slate-400">{char.age}, {char.clothingStyle}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      {char.characterCode || 'CHAR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations Highlight */}
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Décors & Lieux</span>
                </span>
                <button
                  onClick={() => setSelectedSubTab('locations')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Voir tout ({locationsList.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {locationsList.slice(0, 3).map((loc) => (
                  <div key={loc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-200">{loc.name}</div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {loc.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-400/80 truncate">💡 {loc.lightingAtmosphere}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenes Highlight */}
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Découpage Scénique</span>
                </span>
                <button
                  onClick={() => setSelectedSubTab('scenes')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Voir tout ({scenesList.length}) →
                </button>
              </div>
              <div className="space-y-2">
                {scenesList.slice(0, 3).map((scene) => (
                  <div key={scene.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-200 truncate">
                        #{scene.sceneNumber} — {scene.title}
                      </div>
                      <span className="text-[10px] font-mono text-amber-400">{scene.duration || 15}s</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{scene.visualDescription}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHARACTERS SUB-TAB */}
      {selectedSubTab === 'characters' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Personnages Extraits du Roman ({charactersList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque personnage dispose d'un portrait haute définition et d'une ancre visuelle verrouillée synchronisée pour la vidéo Seedance 2.5.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAllCharacters}
                disabled={generatingAllChars || charactersList.length === 0}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {generatingAllChars ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Génération de tous les visages...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Générer Tous les Visages IA</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveTab('characters')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <span>Studio Personnages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charactersList.map((char, idx) => {
              const hasImage = !!(char.referenceImageUrl || char.avatarUrl);
              const charImg = char.referenceImageUrl || char.avatarUrl;
              const isGeneratingThis = generatingCharImageId === char.id;

              return (
                <div
                  key={char.id || idx}
                  className="bg-slate-900/85 rounded-3xl border border-slate-800 overflow-hidden p-5 space-y-4 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Character Portrait Frame right in front of description */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-inner">
                      {hasImage ? (
                        <>
                          <img
                            src={charImg}
                            alt={char.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() =>
                              setLightboxImage({
                                url: charImg!,
                                title: char.name,
                                subtitle: `${char.age} • ${char.gender} • ${char.role || 'Protagoniste'}`,
                              })
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>Ancre Verrouillée Vidéo</span>
                          </div>
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const safeName = (char.name || 'Personnage').replace(/[^a-zA-Z0-9_-]/g, '_');
                                const link = document.createElement('a');
                                link.href = charImg!;
                                link.download = `${safeName}_HD.jpg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 backdrop-blur-sm transition-all"
                              title="Télécharger l'image HD"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setLightboxImage({
                                  url: charImg!,
                                  title: char.name,
                                  subtitle: `${char.age} • ${char.gender} • ${char.role || 'Protagoniste'}`,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-700 backdrop-blur-sm"
                              title="Agrandir en haute définition"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const updatedChars = charactersList.map((c) =>
                                  c.id === char.id ? { ...c, referenceImageUrl: undefined, avatarUrl: undefined } : c
                                );
                                if (onUpdateProject) {
                                  onUpdateProject({ ...project, characters: updatedChars });
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-slate-700 backdrop-blur-sm transition-all"
                              title="Supprimer la photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2.5 right-2.5">
                            <button
                              onClick={() => handleGenerateCharacterImage(char.id, char.name, char.visualAnchor)}
                              disabled={isGeneratingThis}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-lg shadow-black/50 transition-all"
                            >
                              <RefreshCw className={`w-3 h-3 ${isGeneratingThis ? 'animate-spin' : ''}`} />
                              <span>{isGeneratingThis ? 'Rendu...' : 'Reprendre / Régénérer'}</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                            <Camera className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="font-serif font-bold text-slate-200 text-xs">Visage non généré</h5>
                            <p className="text-[11px] text-slate-400">Générez le visage pour verrouiller l'ancre visuelle vidéo.</p>
                          </div>
                          <button
                            onClick={() => handleGenerateCharacterImage(char.id, char.name, char.visualAnchor)}
                            disabled={isGeneratingThis}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                          >
                            {isGeneratingThis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Génération IA...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-3.5 h-3.5" />
                                <span>Générer Image du Personnage</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Identity Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-slate-100 text-base">{char.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {char.age} • {char.gender} • <span className="text-amber-400 font-semibold">{char.role || 'Protagoniste'}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 font-bold border border-amber-500/30">
                        {char.characterCode || `CHAR_${idx + 1}`}
                      </span>
                    </div>

                    {/* Physical traits */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                      <div>
                        <strong className="text-slate-400">Cheveux & Yeux :</strong> {char.hair}, {char.eyes}
                      </div>
                      <div>
                        <strong className="text-slate-400">Traits du Visage :</strong> {char.faceFeatures}
                      </div>
                      <div>
                        <strong className="text-slate-400">Garde-Robe :</strong> {char.clothingStyle}
                      </div>
                    </div>

                    {/* Visual Anchor Prompt Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                        <span>Ancre Visuelle Verrouillée (Seedance 2.5)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendPromptToAIChat(char.visualAnchor, `Personnage: ${char.name}`, `${char.age}, ${char.hair}, ${char.eyes}`)}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                            title="Améliorer ce visage dans le Chat IA"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat IA</span>
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(char.visualAnchor, `char_${char.id}`)}
                            className="text-slate-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                          >
                            {copiedPromptId === `char_${char.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800 line-clamp-3 leading-relaxed">
                        {char.visualAnchor}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleGenerateCharacterImage(char.id, char.name, char.visualAnchor)}
                      disabled={isGeneratingThis}
                      className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{hasImage ? 'Régénérer Visage' : 'Générer Image'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('video_generator')}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Video className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tester en Vidéo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LOCATIONS SUB-TAB */}
      {selectedSubTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Décors & Lieux Extraits du Roman ({locationsList.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque décor généré est synchronisé pour les arrière-plans et la continuité spatiale des scènes vidéo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('locations')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>Ouvrir Studio Décors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationsList.map((loc, idx) => {
              const hasLocImage = !!loc.imageUrl;
              const isGeneratingLoc = generatingLocationImageId === loc.id;

              return (
                <div
                  key={loc.id || idx}
                  className="bg-slate-900/85 rounded-3xl border border-slate-800 overflow-hidden space-y-4 p-5 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Décor Image Preview in front of description */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-inner">
                      {hasLocImage ? (
                        <>
                          <img
                            src={loc.imageUrl}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() =>
                              setLightboxImage({
                                url: loc.imageUrl!,
                                title: loc.name,
                                subtitle: `${loc.type} • ${loc.era || 'Récit'}`,
                              })
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
                            <Compass className="w-3 h-3 text-amber-400" />
                            <span>Décor Prêt Tournage</span>
                          </div>
                          <div className="absolute top-2.5 right-2.5">
                            <button
                              onClick={() =>
                                setLightboxImage({
                                  url: loc.imageUrl!,
                                  title: loc.name,
                                  subtitle: `${loc.type} • ${loc.era || 'Récit'}`,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-700 backdrop-blur-sm"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2.5 right-2.5">
                            <button
                              onClick={() => handleGenerateLocationImage(loc.id, loc.name, loc.visualPrompt)}
                              disabled={isGeneratingLoc}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-lg shadow-black/50 transition-all"
                            >
                              <RefreshCw className={`w-3 h-3 ${isGeneratingLoc ? 'animate-spin' : ''}`} />
                              <span>{isGeneratingLoc ? 'Rendu...' : 'Régénérer Décor'}</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-gradient-to-b from-slate-900 to-slate-950">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                            <Compass className="w-5 h-5" />
                          </div>
                          <span className="font-serif font-bold text-slate-200 text-xs">Décor non généré</span>
                          <button
                            onClick={() => handleGenerateLocationImage(loc.id, loc.name, loc.visualPrompt)}
                            disabled={isGeneratingLoc}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                          >
                            {isGeneratingLoc ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Génération Décor...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-3.5 h-3.5" />
                                <span>Générer Image du Décor</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-slate-100 text-base">{loc.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{loc.type}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 font-mono font-bold border border-slate-800">
                        {loc.era || 'Récit'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{loc.description}</p>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1 text-slate-400">
                      <div>
                        <strong className="text-slate-300">⚡ Éclairage :</strong> {loc.lightingAtmosphere}
                      </div>
                      <div>
                        <strong className="text-slate-300">🏛️ Architecture :</strong> {loc.architecture || 'Détaillée'}
                      </div>
                    </div>

                    {/* Visual Prompt */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                        <span>Prompt de Génération du Décor</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendPromptToAIChat(loc.visualPrompt, `Décor: ${loc.name}`, loc.description)}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat IA</span>
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(loc.visualPrompt, `loc_${loc.id}`)}
                            className="text-slate-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                          >
                            {copiedPromptId === `loc_${loc.id}` ? (
                              <span className="text-emerald-400 font-bold">Copié</span>
                            ) : (
                              <span>Copier</span>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800 line-clamp-3 leading-relaxed">
                        {loc.visualPrompt}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleGenerateLocationImage(loc.id, loc.name, loc.visualPrompt)}
                      disabled={isGeneratingLoc}
                      className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{hasLocImage ? 'Régénérer Décor' : 'Générer Décor'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('locations')}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Studio Décors</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SCENES SUB-TAB */}
      {selectedSubTab === 'scenes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Découpage Séquentiel Complet ({scenesList.length} Scènes)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque scène génère son image de cadrage servant directement de point de départ vidéo pour Seedance 2.5.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('scenes')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>Découpage Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-6">
            {scenesList.map((scene, idx) => {
              const isPrologue = (scene.title || '').toLowerCase().includes('prologue');
              const dialogues = scene.dialogues || [];
              const hasSceneImage = !!scene.imageUrl;
              const isGeneratingScene = generatingSceneImageId === scene.id;

              return (
                <div
                  key={scene.id || idx}
                  className={`p-6 rounded-3xl border transition-all ${
                    isPrologue
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-900/85 border-slate-800'
                  } space-y-5 shadow-xl`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-950 text-amber-400 border border-amber-500/30 shadow-inner">
                        Scène #{scene.sceneNumber || idx + 1}
                      </span>
                      <h4 className="font-serif font-bold text-slate-100 text-lg">{scene.title}</h4>
                      {isPrologue && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          Prologue
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{scene.duration || 15}s</span>
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span className="uppercase">{scene.cameraMotion || 'zoom_in'}</span>
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="capitalize">{scene.musicMood || 'dramatic'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Scene Layout: Image + Description side by side on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Scene Image Container (4 cols) */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-inner">
                        {hasSceneImage ? (
                          <>
                            <img
                              src={scene.imageUrl}
                              alt={scene.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() =>
                                setLightboxImage({
                                  url: scene.imageUrl!,
                                  title: scene.title,
                                  subtitle: `Scène #${scene.sceneNumber || idx + 1} • Prête pour Vidéo Seedance 2.5`,
                                })
                              }
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Image Active pour Vidéo</span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <button
                                onClick={() =>
                                  setLightboxImage({
                                    url: scene.imageUrl!,
                                    title: scene.title,
                                    subtitle: `Scène #${scene.sceneNumber || idx + 1}`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-700"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 right-2">
                              <button
                                onClick={() => handleGenerateSceneImage(scene.id, scene.imagePrompt, scene.title)}
                                disabled={isGeneratingScene}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all"
                              >
                                <RefreshCw className={`w-3 h-3 ${isGeneratingScene ? 'animate-spin' : ''}`} />
                                <span>{isGeneratingScene ? 'Génération...' : 'Régénérer'}</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2 bg-gradient-to-b from-slate-900 to-slate-950">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                              <Film className="w-4 h-4" />
                            </div>
                            <span className="font-serif font-bold text-slate-200 text-xs">Image non générée</span>
                            <button
                              onClick={() => handleGenerateSceneImage(scene.id, scene.imagePrompt, scene.title)}
                              disabled={isGeneratingScene}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                            >
                              {isGeneratingScene ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Génération IA...</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>Générer Image Scène</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Prompt Snapshot */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 line-clamp-2">
                        <strong className="text-amber-400 font-sans">Prompt :</strong> {scene.imagePrompt}
                      </div>
                    </div>

                    {/* Scene Details (8 cols) */}
                    <div className="lg:col-span-8 space-y-3">
                      {/* Novel Excerpt */}
                      {scene.novelExcerpt && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 italic font-serif">
                          <strong className="text-amber-400/90 not-italic font-sans">Extrait du Roman : </strong>
                          "{scene.novelExcerpt}"
                        </div>
                      )}

                      {/* Visual Description */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-slate-400">Mise en scène :</strong> {scene.visualDescription}
                      </p>

                      {/* Dialogues List */}
                      {dialogues.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>Dialogues pour Lip-Sync Seedance 2.5 ({dialogues.length} répliques) :</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dialogues.map((dlg, dIdx) => (
                              <div key={dIdx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                                <span className="font-bold text-amber-300">{dlg.characterName} : </span>
                                <span className="text-slate-300">"{dlg.text}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400">
                      Bruitages : <strong className="text-slate-300">{scene.soundEffects || 'Ambiance cinématographique'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendPromptToAIChat(scene.imagePrompt, scene.title, scene.novelExcerpt)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chat IA</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('storyboard')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Storyboard</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('video_generator')}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <Video className="w-3.5 h-3.5 text-slate-950" />
                        <span>Générer Vidéo avec cette Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PROMPTS SUB-TAB WITH ADVANCED AI PROMPT STUDIO & CHAT INTEGRATION */}
      {selectedSubTab === 'prompts' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-100 text-lg">
                    Studio de Perfectionnement des Prompts Photoréalistes
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                  Propositions de prompts de tournage extraits du roman. Chaque prompt peut être <strong>enrichi instantanément en 1 clic</strong> (optiques 35mm, éclairage volumétrique, micro-textures) ou <strong>perfectionné en direct avec le Chat IA Réalisateur</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSendPromptToAIChat(
                    `Voici la liste des scènes et prompts du projet "${project.title || 'Mon Film'}". Peux-tu analyser l'ensemble des prompts et me suggérer une série d'améliorations cinématographiques globales (lumière, optiques, cadrages) ?`,
                    'Revue Globale des Prompts',
                    project.summary
                  )}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Améliorer tout avec le Chat IA 💬</span>
                </button>

                <button
                  onClick={() => setActiveTab('storyboard')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>Aller au Storyboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold text-amber-300">Comment perfectionner vos prompts de film :</span>
                <p className="text-slate-400 text-[11px]">
                  Utilisez les boutons d'amélioration rapide ci-dessous pour injecter des optiques <strong>Anamorphiques 35mm</strong>, du <strong>Chiaroscuro / Rembrandt lighting</strong>, ou cliquez sur <strong>« Améliorer avec le Chat IA 💬 »</strong> pour dialoguer avec l'assistant et affiner chaque millimètre visuel.
                </p>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto">
              <button
                onClick={() => setPromptCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptCategoryFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                🎬 Tous les Prompts ({scenesList.length + charactersList.length + locationsList.length})
              </button>
              <button
                onClick={() => setPromptCategoryFilter('scenes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptCategoryFilter === 'scenes'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                🎥 Scènes de Tournage ({scenesList.length})
              </button>
              <button
                onClick={() => setPromptCategoryFilter('characters')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptCategoryFilter === 'characters'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                👤 Portraits & Visual Anchors ({charactersList.length})
              </button>
              <button
                onClick={() => setPromptCategoryFilter('locations')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptCategoryFilter === 'locations'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                🏛️ Décors & Éclairages ({locationsList.length})
              </button>
            </div>
          </div>

          {/* Prompts Cards Stream */}
          <div className="space-y-6">
            {/* 1. SCENES PROMPTS */}
            {(promptCategoryFilter === 'all' || promptCategoryFilter === 'scenes') &&
              scenesList.map((scene, idx) => {
                const promptKey = `scene_${scene.id || idx}`;
                const isEnhancing = enhancingPromptId === promptKey;
                const enhancedResult = enhancedPromptsMap[promptKey];
                const activePrompt = enhancedResult?.enhancedPrompt || scene.imagePrompt;

                return (
                  <div
                    key={promptKey}
                    className="bg-slate-900/85 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl hover:border-amber-500/30 transition-all"
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30">
                          Scène #{scene.sceneNumber || idx + 1}
                        </span>
                        <h4 className="font-serif font-bold text-slate-100 text-base">{scene.title}</h4>
                        {enhancedResult && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Perfectionné IA</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Send to Chat IA Button */}
                        <button
                          onClick={() => handleSendPromptToAIChat(activePrompt, scene.title, scene.novelExcerpt)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          title="Ouvrir dans le Chat IA Réalisateur pour affiner le prompt en direct"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>Améliorer avec le Chat IA 💬</span>
                        </button>

                        <button
                          onClick={() => handleCopyPrompt(activePrompt, promptKey)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          {copiedPromptId === promptKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Novel Excerpt Context */}
                    {scene.novelExcerpt && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 italic">
                        <strong className="text-slate-300 not-italic font-semibold">Extrait : </strong>
                        "{scene.novelExcerpt}"
                      </div>
                    )}

                    {/* Prompt Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Prompt Visuel pour Midjourney / Flux / Gemini :</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          Format : {project.aspectRatio || '16:9'} • {project.artStyle || 'Ultra-Réalisme'}
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl font-mono text-xs leading-relaxed transition-all ${
                        enhancedResult
                          ? 'bg-slate-950 border border-amber-500/40 text-amber-100 shadow-inner'
                          : 'bg-slate-950/90 border border-slate-800 text-slate-300'
                      }`}>
                        {activePrompt}
                      </div>
                    </div>

                    {/* Enhanced result breakdown if available */}
                    {enhancedResult && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Wand2 className="w-4 h-4 text-amber-400" />
                            <span>Optimisation du Directeur de la Photo :</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-300">
                            Mouvement suggéré : <strong className="text-amber-300">{enhancedResult.suggestedCameraMotion}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {enhancedResult.improvementsExplanation}
                        </p>

                        {/* Keyword tags */}
                        {enhancedResult.visualKeywords && enhancedResult.visualKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Optiques & Rendu :</span>
                            {enhancedResult.visualKeywords.map((kw, kIdx) => (
                              <span
                                key={kIdx}
                                className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px]"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/20">
                          <button
                            onClick={() => handleApplyEnhancedPromptToScene(scene.id, enhancedResult.enhancedPrompt)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Appliquer Définitivement à la Scène</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick AI Enhancement Toolkit */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Amélioration Instantanée par l'IA :</span>
                        </span>

                        {isEnhancing && (
                          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>Optimisation hollywoodienne en cours...</span>
                          </span>
                        )}
                      </div>

                      {/* Quick preset buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => handleEnhancePrompt(promptKey, scene.imagePrompt, scene.title, scene.novelExcerpt, 'hyper_precision')}
                          disabled={isEnhancing}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 text-left"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>⚡ Hyper-Précision 8K & 35mm</span>
                        </button>

                        <button
                          onClick={() => handleEnhancePrompt(promptKey, scene.imagePrompt, scene.title, scene.novelExcerpt, 'lighting_atmosphere')}
                          disabled={isEnhancing}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 text-left"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>💡 Éclairage Volumétrique & Nuit</span>
                        </button>

                        <button
                          onClick={() => handleEnhancePrompt(promptKey, scene.imagePrompt, scene.title, scene.novelExcerpt, 'character_emotions')}
                          disabled={isEnhancing}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 text-left"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>🎭 Micro-Expressions & Émotions</span>
                        </button>
                      </div>

                      {/* Custom Refinement Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={customInstructionsMap[promptKey] || ''}
                          onChange={(e) => setCustomInstructionsMap((prev) => ({ ...prev, [promptKey]: e.target.value }))}
                          placeholder="Consigne sur mesure (ex: 'Pluie torrentielle, reflets dorés, gros plan intense sur le regard')..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => handleEnhancePrompt(promptKey, scene.imagePrompt, scene.title, scene.novelExcerpt, 'custom', customInstructionsMap[promptKey])}
                          disabled={isEnhancing}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 shadow-md shadow-amber-500/20"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-slate-950" />
                          <span>Perfectionner 🪄</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* 2. CHARACTERS VISUAL ANCHORS PROMPTS */}
            {(promptCategoryFilter === 'all' || promptCategoryFilter === 'characters') &&
              charactersList.map((char, idx) => {
                const promptKey = `char_prompt_${char.id || idx}`;
                const isEnhancing = enhancingPromptId === promptKey;
                const enhancedResult = enhancedPromptsMap[promptKey];
                const activePrompt = enhancedResult?.enhancedPrompt || char.visualAnchor;
                const charImg = char.referenceImageUrl || char.avatarUrl;
                const isGeneratingThis = generatingCharImageId === char.id;

                return (
                  <div
                    key={promptKey}
                    className="bg-slate-900/85 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30">
                          {char.characterCode || `CHAR_${idx + 1}`}
                        </span>
                        <h4 className="font-serif font-bold text-slate-100 text-base">Portrait & Verrou : {char.name}</h4>
                        <span className="text-[10px] text-slate-400">({char.age}, {char.clothingStyle})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendPromptToAIChat(activePrompt, `Portrait de ${char.name}`, `${char.hair}, ${char.eyes}, ${char.faceFeatures}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>Améliorer avec le Chat IA 💬</span>
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(activePrompt, promptKey)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          {copiedPromptId === promptKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* Character image thumbnail */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative group">
                        {charImg ? (
                          <>
                            <img
                              src={charImg}
                              alt={char.name}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform"
                              onClick={() => setLightboxImage({ url: charImg, title: char.name, subtitle: `Visual Anchor • ${char.role || 'Protagoniste'}` })}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                            <Users className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800">
                          {activePrompt}
                        </div>
                      </div>
                    </div>

                    {enhancedResult && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Analyse Portrait & Éclairage :</span>
                        </div>
                        <p className="text-xs text-slate-300">{enhancedResult.improvementsExplanation}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEnhancePrompt(promptKey, char.visualAnchor, `Portrait de ${char.name}`, `${char.age}, ${char.hair}`, 'hyper_precision')}
                          disabled={isEnhancing}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEnhancing ? 'Amélioration...' : 'Enrichir Détails du Visage 8K'}</span>
                        </button>
                        <button
                          onClick={() => handleGenerateCharacterImage(char.id, char.name, activePrompt)}
                          disabled={isGeneratingThis}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>{charImg ? 'Régénérer avec ce Prompt' : 'Générer Image du Personnage'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveTab('characters')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                      >
                        Voir dans Studio Casting →
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* 3. LOCATIONS PROMPTS */}
            {(promptCategoryFilter === 'all' || promptCategoryFilter === 'locations') &&
              locationsList.map((loc, idx) => {
                const promptKey = `loc_prompt_${loc.id || idx}`;
                const isEnhancing = enhancingPromptId === promptKey;
                const enhancedResult = enhancedPromptsMap[promptKey];
                const activePrompt = enhancedResult?.enhancedPrompt || loc.visualPrompt;
                const isGeneratingLoc = generatingLocationImageId === loc.id;

                return (
                  <div
                    key={promptKey}
                    className="bg-slate-900/85 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/30">
                          {loc.type || 'DÉCOR'}
                        </span>
                        <h4 className="font-serif font-bold text-slate-100 text-base">Décor : {loc.name}</h4>
                        <span className="text-[10px] text-slate-400">({loc.era || 'Récit'})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendPromptToAIChat(activePrompt, `Décor: ${loc.name}`, `${loc.description} - ${loc.lightingAtmosphere}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>Améliorer avec le Chat IA 💬</span>
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(activePrompt, promptKey)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          {copiedPromptId === promptKey ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* Location image thumbnail */}
                      <div className="w-32 h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative group">
                        {loc.imageUrl ? (
                          <>
                            <img
                              src={loc.imageUrl}
                              alt={loc.name}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform"
                              onClick={() => setLightboxImage({ url: loc.imageUrl!, title: loc.name, subtitle: `${loc.type} • ${loc.era || 'Récit'}` })}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                            <Compass className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800">
                          {activePrompt}
                        </div>
                      </div>
                    </div>

                    {enhancedResult && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Atmosphère & Rendu Décor :</span>
                        </div>
                        <p className="text-xs text-slate-300">{enhancedResult.improvementsExplanation}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEnhancePrompt(promptKey, loc.visualPrompt, `Décor: ${loc.name}`, loc.description, 'lighting_atmosphere')}
                          disabled={isEnhancing}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEnhancing ? 'Amélioration...' : 'Enrichir Lumières & Brouillard Volumétrique'}</span>
                        </button>
                        <button
                          onClick={() => handleGenerateLocationImage(loc.id, loc.name, activePrompt)}
                          disabled={isGeneratingLoc}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>{loc.imageUrl ? 'Régénérer Décor HD' : 'Générer Décor HD'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveTab('locations')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                      >
                        Voir dans Studio Décors →
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-slate-100 text-sm">Passer à la suite de la production ?</h3>
          <p className="text-xs text-slate-400">
            Validez les visages des personnages dans le studio dédié ou passez directement au découpage des scènes et à la génération vidéo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('characters')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700"
          >
            Studio Personnages
          </button>
          <button
            onClick={() => setActiveTab('video_generator')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            <span>Générateur Vidéo Seedance 2.5</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR HIGH-DEFINITION IMAGES */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div>
                <h4 className="font-serif font-bold text-slate-100 text-base">{lightboxImage.title}</h4>
                {lightboxImage.subtitle && (
                  <p className="text-xs text-amber-400 font-mono mt-0.5">{lightboxImage.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const safeName = (lightboxImage.title || 'Image').replace(/[^a-zA-Z0-9_-]/g, '_');
                    const link = document.createElement('a');
                    link.href = lightboxImage.url;
                    link.download = `${safeName}_HD.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  title="Télécharger l'image HD"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(lightboxImage.url, '_blank')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Preview */}
            <div className="p-4 sm:p-6 flex items-center justify-center bg-slate-950">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
              <span className="text-xs text-slate-400">
                ✨ Image synchronisée pour le moteur vidéo <strong>Seedance 2.5</strong>
              </span>
              <button
                onClick={() => {
                  setLightboxImage(null);
                  setActiveTab('video_generator');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Utiliser dans Studio Vidéo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
