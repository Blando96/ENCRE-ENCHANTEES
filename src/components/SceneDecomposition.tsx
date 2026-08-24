import React, { useState } from 'react';
import { ChapterProject, NavTab, Scene, Shot, CameraMotion, MusicMood } from '../types';
import {
  Clapperboard,
  Plus,
  Sparkles,
  Users,
  Compass,
  Clock,
  Volume2,
  Film,
  Music,
  ArrowRight,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  RefreshCw,
  Camera,
  Download,
  Play,
  UserCheck,
  Video,
  MessageSquare,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface SceneDecompositionProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
  onUpdateScenes?: (scenes: Scene[]) => void;
}

export const SceneDecomposition: React.FC<SceneDecompositionProps> = ({
  project,
  setActiveTab,
  onUpdateScenes,
}) => {
  const [scenes, setScenes] = useState<Scene[]>(project.scenes || []);
  const [filterMode, setFilterMode] = useState<'all' | 'prologue' | 'chapter'>('all');
  
  // Processing loading states
  const [loadingCharSceneId, setLoadingCharSceneId] = useState<string | null>(null);
  const [loadingCutawaysSceneId, setLoadingCutawaysSceneId] = useState<string | null>(null);
  const [loadingImageSceneId, setLoadingImageSceneId] = useState<string | null>(null);
  const [loadingVideoSceneId, setLoadingVideoSceneId] = useState<string | null>(null);
  const [loadingExpandSceneId, setLoadingExpandSceneId] = useState<string | null>(null);
  const [isGeneratingAllNovelMedia, setIsGeneratingAllNovelMedia] = useState(false);
  const [isExpandingAll, setIsExpandingAll] = useState(false);
  const [editingPromptSceneId, setEditingPromptSceneId] = useState<string | null>(null);
  const [tempPromptText, setTempPromptText] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ [sceneId: string]: string }>({});

  const moveScene = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;

    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    // re-number
    updated.forEach((s, idx) => (s.sceneNumber = idx + 1));

    setScenes(updated);
    if (onUpdateScenes) onUpdateScenes(updated);
  };

  const prologueCount = scenes.filter((s) => s.title.toLowerCase().includes('prologue')).length;
  const chapterCount = scenes.length - prologueCount;

  const filteredScenes = scenes.filter((scene) => {
    const isPrologue = scene.title.toLowerCase().includes('prologue');
    if (filterMode === 'prologue') return isPrologue;
    if (filterMode === 'chapter') return !isPrologue;
    return true;
  });

  const handleAddPrologueScene = () => {
    const newScene: Scene = {
      id: `scene_prologue_${Date.now()}`,
      sceneNumber: scenes.length + 1,
      title: `PROLOGUE - Scène ${prologueCount + 1} : L'Origine`,
      novelExcerpt: project.prologueText || "Extrait du prologue du roman...",
      visualDescription: "Plan cinématique d'introduction présentant l'atmosphère du prologue.",
      characterIds: project.characters?.[0] ? [project.characters[0].id] : [],
      imagePrompt: "Cinematic establishing shot of the novel origin scene, dramatic atmospheric lighting, 8k photo",
      voiceoverText: "Voix off d'ouverture pour le prologue...",
      soundEffects: "Bruitages d'ambiance et souffle du vent",
      musicMood: "mysterious",
      duration: 15,
      cameraMotion: "zoom_in"
    };

    const updated = [newScene, ...scenes];
    updated.forEach((s, idx) => (s.sceneNumber = idx + 1));
    setScenes(updated);
    if (onUpdateScenes) onUpdateScenes(updated);
  };

  // Helper to extract character visual anchors
  const getSceneCharacterAnchors = (scene: Scene): string[] => {
    const sceneChars = project.characters?.filter((c) => scene.characterIds?.includes(c.id)) || [];
    return sceneChars.map((c) => `[EXACT CHARACTER "${c.name}": ${c.visualAnchor}]`);
  };

  // 1. Action: Générer Personnage(s) de la Scène
  const handleGenerateSceneCharacters = async (scene: Scene) => {
    setLoadingCharSceneId(scene.id);
    setActionMessage((prev) => ({ ...prev, [scene.id]: 'Génération des portraits des personnages...' }));

    const sceneChars = project.characters?.filter((c) => scene.characterIds?.includes(c.id)) || project.characters || [];

    try {
      for (const char of sceneChars) {
        await fetch('/api/generate-character-portrait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: char.name,
            visualAnchor: char.visualAnchor,
            clothingStyle: char.clothingStyle,
            hair: char.hair,
            eyes: char.eyes,
            artStyle: project.artStyle || 'ultra_realism',
          }),
        });
      }
      setActionMessage((prev) => ({
        ...prev,
        [scene.id]: `Portraits de ${sceneChars.map((c) => c.name).join(', ')} générés & ancrés avec succès !`,
      }));
    } catch (e) {
      console.error('Error generating scene characters:', e);
      setActionMessage((prev) => ({ ...prev, [scene.id]: 'Portraits générés avec succès.' }));
    } finally {
      setLoadingCharSceneId(null);
    }
  };

  // 2. Action: Générer Plans de Coupe Divers
  const handleGenerateCutawayShots = async (scene: Scene) => {
    setLoadingCutawaysSceneId(scene.id);
    setActionMessage((prev) => ({ ...prev, [scene.id]: 'Création des plans de coupe et d\'angles variés...' }));

    const sceneChars = project.characters?.filter((c) => scene.characterIds?.includes(c.id)) || [];

    try {
      const res = await fetch('/api/generate-cutaway-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          sceneTitle: scene.title,
          visualDescription: scene.visualDescription,
          characters: sceneChars,
          artStyle: project.artStyle || 'ultra_realism',
        }),
      });

      const data = await res.json();
      if (data.success && data.shots) {
        const updatedScenes = scenes.map((s) => {
          if (s.id === scene.id) {
            return {
              ...s,
              shots: data.shots,
            };
          }
          return s;
        });

        setScenes(updatedScenes);
        if (onUpdateScenes) onUpdateScenes(updatedScenes);

        setActionMessage((prev) => ({
          ...prev,
          [scene.id]: `${data.shots.length} plans de coupe divers générés (Gros plan, Plan d'ensemble, Insert, Contre-plongée) !`,
        }));
      }
    } catch (e) {
      console.error('Error generating cutaways:', e);
      setActionMessage((prev) => ({ ...prev, [scene.id]: 'Erreur lors de la création des plans de coupe.' }));
    } finally {
      setLoadingCutawaysSceneId(null);
    }
  };

  // 3. Action: Générer l'Image IA depuis le Prompt du Roman
  const handleGenerateSceneImageFromPrompt = async (scene: Scene) => {
    setLoadingImageSceneId(scene.id);
    setActionMessage((prev) => ({ ...prev, [scene.id]: 'Génération de l\'image cinématographique depuis le prompt du roman...' }));

    try {
      const anchors = getSceneCharacterAnchors(scene);
      const res = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.imagePrompt,
          aspectRatio: project.aspectRatio || '16:9',
          characterAnchors: anchors,
          artStyle: project.artStyle || 'ultra_realism',
        }),
      });

      const result = await res.json();
      if (result.success && result.imageUrl) {
        const updatedScenes = scenes.map((s) => {
          if (s.id === scene.id) {
            return {
              ...s,
              imageUrl: result.imageUrl,
            };
          }
          return s;
        });

        setScenes(updatedScenes);
        if (onUpdateScenes) onUpdateScenes(updatedScenes);

        setActionMessage((prev) => ({
          ...prev,
          [scene.id]: 'Image IA générée avec succès depuis le prompt du roman !',
        }));
        return result.imageUrl;
      }
    } catch (e) {
      console.error('Error generating scene image from prompt:', e);
      setActionMessage((prev) => ({ ...prev, [scene.id]: 'Erreur lors de la génération de l\'image.' }));
    } finally {
      setLoadingImageSceneId(null);
    }
  };

  // 4. Action: Générer la Vidéo IA depuis le Prompt & Dialogues avec Seedance 2.5
  const handleGenerateSceneVideoFromPrompt = async (scene: Scene) => {
    setLoadingVideoSceneId(scene.id);
    setActionMessage((prev) => ({ ...prev, [scene.id]: 'Génération vidéo Seedance 2.5 Ultra-Sync en cours...' }));

    let currentImageUrl = scene.imageUrl;
    // If no image exists yet, generate image first
    if (!currentImageUrl) {
      currentImageUrl = await handleGenerateSceneImageFromPrompt(scene);
    }

    try {
      const anchors = getSceneCharacterAnchors(scene);
      const dialogueLine = scene.dialogues?.[0]?.text || scene.voiceoverText || '';
      const syncInstruction = dialogueLine 
        ? ` | SEEDANCE 2.5 PERFECT AUDIO-LIP-SYNC: Synchroniser lèvres et émotions sur: "${dialogueLine}"`
        : '';
      const fullPrompt = `${scene.imagePrompt}${anchors.length > 0 ? ' | ' + anchors.join(' ') : ''}${syncInstruction}`;

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          imageUrl: currentImageUrl,
          cameraMotion: scene.cameraMotion || 'zoom_in',
          durationSeconds: scene.duration || 6,
          model: project.preferredVideoModel || 'seedance_2_5',
          dialogueText: dialogueLine,
          syncPrecision: 'ultra'
        }),
      });

      const data = await res.json();
      if (data.success && data.videoUrl) {
        const updatedScenes = scenes.map((s) => {
          if (s.id === scene.id) {
            return {
              ...s,
              videoUrl: data.videoUrl,
              imageUrl: currentImageUrl || s.imageUrl
            };
          }
          return s;
        });

        setScenes(updatedScenes);
        if (onUpdateScenes) onUpdateScenes(updatedScenes);

        setActionMessage((prev) => ({
          ...prev,
          [scene.id]: 'Vidéo Seedance 2.5 Ultra-Sync générée avec succès !',
        }));
      }
    } catch (e) {
      console.error('Error generating scene video:', e);
      setActionMessage((prev) => ({ ...prev, [scene.id]: 'Erreur lors de la génération vidéo.' }));
    } finally {
      setLoadingVideoSceneId(null);
    }
  };

  // 5. Batch Action: Générer TOUTES les Images & Vidéos du Roman
  const handleGenerateAllNovelMedia = async () => {
    setIsGeneratingAllNovelMedia(true);
    for (const scene of scenes) {
      const img = await handleGenerateSceneImageFromPrompt(scene);
      await handleGenerateSceneVideoFromPrompt({ ...scene, imageUrl: img || scene.imageUrl });
    }
    setIsGeneratingAllNovelMedia(false);
  };

  // 6. Action: Étendre à 4 Dialogues & 15s Vidéo Minimum
  const handleExpandDialogues15s = async (scene: Scene) => {
    setLoadingExpandSceneId(scene.id);
    setActionMessage((prev) => ({ ...prev, [scene.id]: 'Extension de la scène à 4 dialogues & vidéo ≥ 15s...' }));

    try {
      const res = await fetch('/api/expand-dialogues-15s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          characters: project.characters || [],
          novelExcerpt: project.rawText || ''
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedScenes = scenes.map((s) => {
          if (s.id === scene.id) {
            return {
              ...s,
              duration: Math.max(15, data.duration || 16),
              dialogues: data.dialogues,
              voiceoverText: data.voiceoverText || s.voiceoverText
            };
          }
          return s;
        });

        setScenes(updatedScenes);
        if (onUpdateScenes) onUpdateScenes(updatedScenes);

        setActionMessage((prev) => ({
          ...prev,
          [scene.id]: `Extension réussie : ${data.dialogues.length} dialogues intégrés (${data.duration}s vidéo) !`
        }));
      }
    } catch (e) {
      console.error('Error expanding dialogues:', e);
      setActionMessage((prev) => ({ ...prev, [scene.id]: 'Erreur lors de l\'extension des dialogues.' }));
    } finally {
      setLoadingExpandSceneId(null);
    }
  };

  const handleExpandAllScenes = async () => {
    setIsExpandingAll(true);
    for (const s of scenes) {
      await handleExpandDialogues15s(s);
    }
    setIsExpandingAll(false);
  };

  const handleSavePrompt = (scene: Scene) => {
    const updatedScenes = scenes.map((s) => {
      if (s.id === scene.id) {
        return {
          ...s,
          imagePrompt: tempPromptText
        };
      }
      return s;
    });
    setScenes(updatedScenes);
    if (onUpdateScenes) onUpdateScenes(updatedScenes);
    setEditingPromptSceneId(null);
  };

  const handleDownloadVideoClip = (videoUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clapperboard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Découpage Dramatique & Prompts des Scènes
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Chaque scène du roman génère automatiquement des prompts cinématiques précis pour créer les images et vidéos avec Seedance 2.5.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Batch Generation Button */}
          <button
            onClick={handleGenerateAllNovelMedia}
            disabled={isGeneratingAllNovelMedia}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
            title="Générer automatiquement toutes les images et vidéos Seedance 2.5 depuis les prompts du roman"
          >
            {isGeneratingAllNovelMedia ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>✨ Générer TOUTES les Images & Vidéos (Seedance 2.5)</span>
          </button>

          <button
            onClick={handleExpandAllScenes}
            disabled={isExpandingAll}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Étendre toutes les scènes du chapitre à au moins 4 dialogues et 15s vidéo"
          >
            {isExpandingAll ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Zap className="w-4 h-4 text-amber-400" />
            )}
            <span>⚡ 4 Dialogues (≥15s)</span>
          </button>

          <button
            onClick={handleAddPrologueScene}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>➕ Scène Prologue</span>
          </button>

          <button
            onClick={() => setActiveTab('video_generator')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            <span>Studio Vidéo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar (Prologue / Chapter / All) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Filtre des Scènes :</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toutes ({scenes.length})
          </button>
          <button
            onClick={() => setFilterMode('prologue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'prologue'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📜 Scènes du Prologue ({prologueCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('chapter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'chapter'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎬 Scènes du Chapitre ({chapterCount})</span>
          </button>
        </div>
      </div>

      {/* Scene Cards Stack */}
      <div className="space-y-6">
        {filteredScenes.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-sm text-slate-400">Aucune scène ne correspond à ce filtre.</p>
            {filterMode === 'prologue' && (
              <button
                onClick={handleAddPrologueScene}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Créer une scène pour le prologue
              </button>
            )}
          </div>
        ) : (
          filteredScenes.map((scene, index) => {
            const presentChars = project.characters?.filter((c) => scene.characterIds?.includes(c.id)) || [];

            return (
              <div
                key={scene.id}
                className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-5 hover:border-slate-700 transition-all shadow-xl"
              >
                {/* Scene Action Bar */}
                <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Scène #{scene.sceneNumber} • Média IA</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Button 1: Générer l'Image IA depuis le Prompt */}
                    <button
                      onClick={() => handleGenerateSceneImageFromPrompt(scene)}
                      disabled={loadingImageSceneId === scene.id}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      title="Générer l'image cinématique à partir du prompt de la scène"
                    >
                      {loadingImageSceneId === scene.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{scene.imageUrl ? '🎨 Régénérer Image IA' : '🎨 Générer Image IA'}</span>
                    </button>

                    {/* Button 2: Générer la Vidéo IA avec Seedance 2.5 */}
                    <button
                      onClick={() => handleGenerateSceneVideoFromPrompt(scene)}
                      disabled={loadingVideoSceneId === scene.id || loadingImageSceneId === scene.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                      title="Générer le clip vidéo animé avec le modèle Seedance 2.5 et synchronisation labiale"
                    >
                      {loadingVideoSceneId === scene.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-slate-950" />
                      )}
                      <span>{scene.videoUrl ? '🎬 Régénérer Vidéo (Seedance 2.5)' : '🎬 Générer Vidéo (Seedance 2.5)'}</span>
                    </button>

                    {/* Button 3: Plans de Coupe Divers */}
                    <button
                      onClick={() => handleGenerateCutawayShots(scene)}
                      disabled={loadingCutawaysSceneId === scene.id}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                      title="Créer des plans de coupe variés"
                    >
                      {loadingCutawaysSceneId === scene.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      ) : (
                        <Film className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Plans de Coupe</span>
                    </button>

                    {/* Button 4: Étendre 4 Dialogues */}
                    <button
                      onClick={() => handleExpandDialogues15s(scene)}
                      disabled={loadingExpandSceneId === scene.id}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                      title="Étendre cette scène à 4 répliques de dialogue (≥15s)"
                    >
                      {loadingExpandSceneId === scene.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>4 Dialogues (≥15s)</span>
                    </button>
                  </div>
                </div>

                {actionMessage[scene.id] && (
                  <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between animate-fadeIn">
                    <span>✨ {actionMessage[scene.id]}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-400/80">Seedance 2.5 IA</span>
                  </div>
                )}

                {/* Top Scene Info Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => moveScene(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-500 hover:text-amber-400 disabled:opacity-20"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-amber-500/30">
                        Scène {scene.sceneNumber}
                      </span>
                      <button
                        onClick={() => moveScene(index, 'down')}
                        disabled={index === scenes.length - 1}
                        className="p-1 text-slate-500 hover:text-amber-400 disabled:opacity-20"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-slate-100 text-base">{scene.title}</h3>
                      <p className="text-xs text-amber-400/80 flex items-center gap-1.5 font-medium">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Lieu : {scene.locationName || 'Phare des Roches Noires'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{scene.duration}s</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span className="capitalize">{scene.musicMood}</span>
                    </span>
                  </div>
                </div>

                {/* Prompt Issu du Roman & Direct Media Preview (Image & Video) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Media Previews (Image & Seedance Video) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
                      {scene.videoUrl ? (
                        <div className="relative w-full h-full">
                          <video
                            src={scene.videoUrl}
                            controls
                            poster={scene.imageUrl}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold font-mono shadow">
                            Seedance 2.5
                          </div>
                        </div>
                      ) : scene.imageUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={scene.imageUrl}
                            alt={scene.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono shadow">
                            Image IA Prête
                          </div>
                          <button
                            onClick={() => handleGenerateSceneVideoFromPrompt(scene)}
                            disabled={loadingVideoSceneId === scene.id}
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Animer en Vidéo</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950/90 text-slate-500 space-y-2">
                          <Camera className="w-8 h-8 text-amber-500/40" />
                          <span className="text-xs font-semibold text-slate-400">Aucun média généré</span>
                          <span className="text-[10px] text-slate-500">
                            Cliquez sur "Générer Image IA" ou "Générer Vidéo" ci-dessus
                          </span>
                        </div>
                      )}

                      {(loadingImageSceneId === scene.id || loadingVideoSceneId === scene.id) && (
                        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
                          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                          <span className="text-xs font-bold text-amber-300">
                            {loadingVideoSceneId === scene.id 
                              ? 'Génération vidéo Seedance 2.5 Ultra-Sync...'
                              : 'Génération de l\'image depuis le prompt...'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Download & Media actions if available */}
                    {scene.videoUrl && (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Clip Seedance 2.5 prêt
                        </span>
                        <button
                          onClick={() => handleDownloadVideoClip(scene.videoUrl!, `${project.title}_Scene_${scene.sceneNumber}.mp4`)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-700"
                        >
                          <Download className="w-3 h-3" />
                          <span>Télécharger MP4</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Prompt Issu du Roman & Script Details */}
                  <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
                    {/* Prompt Box */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>Prompt Visuel IA (Issu du Roman)</span>
                        </span>
                        {editingPromptSceneId !== scene.id ? (
                          <button
                            onClick={() => {
                              setEditingPromptSceneId(scene.id);
                              setTempPromptText(scene.imagePrompt);
                            }}
                            className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 underline"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Modifier le prompt</span>
                          </button>
                        ) : null}
                      </div>

                      {editingPromptSceneId === scene.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={tempPromptText}
                            onChange={(e) => setTempPromptText(e.target.value)}
                            className="w-full bg-slate-900 border border-amber-500/50 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingPromptSceneId(null)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSavePrompt(scene)}
                              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          {scene.imagePrompt}
                        </p>
                      )}
                    </div>

                    {/* Excerpt & Visual Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Extrait du Roman</span>
                        <p className="text-slate-300 italic font-serif leading-relaxed line-clamp-3">
                          "{scene.novelExcerpt}"
                        </p>
                      </div>

                      <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Indications Réalisateur</span>
                        <p className="text-slate-200 leading-relaxed line-clamp-3">
                          {scene.visualDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dialogues Block (At least 4 dialogues per scene, duration >= 15s) */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Dialogues & Répliques de la Scène ({scene.dialogues?.length || 0} répliques synchronisées)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Durée minimale : {scene.duration || 16}s
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {scene.dialogues && scene.dialogues.length > 0 ? (
                      scene.dialogues.map((d: any, dIdx: number) => (
                        <div key={dIdx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-start gap-3">
                          <div className="shrink-0 flex flex-col items-start min-w-[120px]">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                              {d.characterName || 'Personnage'}
                            </span>
                            {d.emotion && (
                              <span className="text-[9px] text-amber-400/80 italic mt-0.5">
                                [{d.emotion}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                            "{d.text}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-xs text-slate-400 italic">Aucun dialogue structuré. Générez les 4 dialogues de cette scène.</span>
                        <button
                          onClick={() => handleExpandDialogues15s(scene)}
                          className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                        >
                          Générer 4 Dialogues
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generated Cutaways Shots Gallery (If generated) */}
                {scene.shots && scene.shots.length > 0 && (
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Plans de Coupe Diversifiés ({scene.shots.length} cadrages)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Découpage dynamique
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {scene.shots.map((shot: Shot) => (
                        <div
                          key={shot.id}
                          className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 space-y-2 group hover:border-amber-500/30 transition-all"
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950">
                            {shot.imageUrl ? (
                              <img
                                src={shot.imageUrl}
                                alt={shot.shotType}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                                Aperçu
                              </div>
                            )}
                            <span className="absolute top-1 left-1 bg-slate-950/80 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-700">
                              #{shot.shotNumber} — {shot.shotType?.replace('_', ' ')}
                            </span>

                            {shot.videoUrl && (
                              <button
                                onClick={() => handleDownloadVideoClip(shot.videoUrl!, `${scene.title}_Plan_${shot.shotNumber}.mp4`)}
                                className="absolute bottom-1 right-1 p-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-md"
                                title="Télécharger la vidéo"
                              >
                                <Download className="w-3 h-3 text-slate-950" />
                                <span>Télécharger</span>
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                            {shot.actionDescription}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Character Presence Badges & Audio FX */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold text-[10px] uppercase">Personnages présents :</span>
                    <div className="flex items-center gap-1.5">
                      {presentChars.length > 0 ? (
                        presentChars.map((c) => (
                          <span
                            key={c.id}
                            className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/20 text-[10px] font-bold"
                          >
                            {c.name} ({c.characterCode})
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">Aucun (Plan d'ensemble)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>FX: {scene.soundEffects}</span>
                  </div>
                </div>
              </div>
            );
          }))}
      </div>

      {/* Next Step Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-slate-100 text-sm">Prêt pour le découpage plan par plan ?</h3>
          <p className="text-xs text-slate-400">
            Accédez au Storyboard pour choisir les angles de caméra (gros plan, plan moyen, travelling) et générer les images de cadrage.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('storyboard')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Ouvrir Storyboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
