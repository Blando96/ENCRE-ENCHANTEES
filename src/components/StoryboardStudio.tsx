import React, { useState } from 'react';
import { Scene, Character, CinematicStyle } from '../types';
import { LayoutGrid, Sparkles, RefreshCw, Volume2, Film, Lock, Camera, Play, Check, Edit3, Image as ImageIcon, Sliders, Users, Download } from 'lucide-react';

interface StoryboardStudioProps {
  scenes: Scene[];
  characters: Character[];
  artStyle: CinematicStyle;
  aspectRatio: string;
  onUpdateScene: (scene: Scene) => void;
  onPlaySceneInPlayer: (sceneIndex: number) => void;
}

export const StoryboardStudio: React.FC<StoryboardStudioProps> = ({
  scenes = [],
  characters = [],
  artStyle,
  aspectRatio,
  onUpdateScene,
  onPlaySceneInPlayer,
}) => {
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'prologue' | 'chapter'>('all');

  const safeScenes = scenes || [];
  const safeCharacters = characters || [];

  const prologueCount = safeScenes.filter((s) => (s?.title || '').toLowerCase().includes('prologue')).length;
  const chapterCount = safeScenes.length - prologueCount;

  const filteredScenes = safeScenes.filter((scene) => {
    if (!scene) return false;
    const isPrologue = (scene.title || '').toLowerCase().includes('prologue');
    if (filterMode === 'prologue') return isPrologue;
    if (filterMode === 'chapter') return !isPrologue;
    return true;
  });

  // Get character visual anchor strings for a scene without trait mixing
  const getSceneCharacterAnchors = (scene: Scene): string[] => {
    if (!scene) return [];
    let matched = (scene.characterIds || [])
      .map((id) => safeCharacters.find((c) => c.id === id))
      .filter((c): c is Character => !!c);

    if (matched.length === 0) {
      matched = safeCharacters.filter((c) => {
        if (!c?.name) return false;
        const cName = c.name.toLowerCase();
        return (
          (scene.visualDescription || '').toLowerCase().includes(cName) ||
          (scene.title || '').toLowerCase().includes(cName) ||
          (scene.imagePrompt || '').toLowerCase().includes(cName)
        );
      });
    }

    return matched.map((c) => `[EXACT CHARACTER "${c.name}": ${c.visualAnchor}]`);
  };

  const handleGenerateSceneImage = async (scene: Scene) => {
    const updatedScene = { ...scene, isGeneratingImage: true };
    onUpdateScene(updatedScene);

    try {
      const anchors = getSceneCharacterAnchors(scene);
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.imagePrompt,
          aspectRatio,
          characterAnchors: anchors,
          artStyle,
        }),
      });

      const result = await response.json();
      if (result.success && result.imageUrl) {
        onUpdateScene({
          ...scene,
          imageUrl: result.imageUrl,
          isGeneratingImage: false,
        });
      } else {
        onUpdateScene({ ...scene, isGeneratingImage: false });
      }
    } catch (e) {
      console.error('Error generating scene image:', e);
      onUpdateScene({ ...scene, isGeneratingImage: false });
    }
  };

  const handleGenerateAllImages = async () => {
    setIsGeneratingAll(true);

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      await handleGenerateSceneImage(scene);
    }

    setIsGeneratingAll(false);
  };

  const handleGenerateSceneVideo = async (scene: Scene) => {
    onUpdateScene({ ...scene, isGeneratingVideo: true });

    let currentImageUrl = scene.imageUrl;
    if (!currentImageUrl) {
      await handleGenerateSceneImage(scene);
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
          model: 'seedance_2_5',
          dialogueText: dialogueLine,
          syncPrecision: 'ultra',
        }),
      });

      const data = await res.json();
      if (data.success && data.videoUrl) {
        onUpdateScene({
          ...scene,
          videoUrl: data.videoUrl,
          isGeneratingVideo: false,
        });
      } else {
        onUpdateScene({ ...scene, isGeneratingVideo: false });
      }
    } catch (e) {
      console.error('Error generating video in storyboard:', e);
      onUpdateScene({ ...scene, isGeneratingVideo: false });
    }
  };

  const handleStartEditPrompt = (scene: Scene) => {
    setEditingPromptId(scene.id);
    setTempPrompt(scene.imagePrompt);
  };

  const handleSavePrompt = (scene: Scene) => {
    onUpdateScene({
      ...scene,
      imagePrompt: tempPrompt,
    });
    setEditingPromptId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Storyboard Header & Action Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Storyboard Cinématographique ({scenes.length} plans)
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Chaque scène intègre les ancres physiques des personnages pour garantir la cohérence visuelle d'image en image.
          </p>
        </div>

        <button
          onClick={handleGenerateAllImages}
          disabled={isGeneratingAll}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center gap-2.5 shadow-lg shadow-amber-500/20 shrink-0 disabled:opacity-50"
        >
          {isGeneratingAll ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Génération IA en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Générer Toutes les Images IA (Cohérence Verrouillée)</span>
            </>
          )}
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Affichage du Storyboard :</span>
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
            Tous les plans ({scenes.length})
          </button>
          <button
            onClick={() => setFilterMode('prologue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'prologue'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📜 Plans du Prologue ({prologueCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('chapter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterMode === 'chapter'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎬 Plans du Chapitre ({chapterCount})</span>
          </button>
        </div>
      </div>

      {/* Scene List Grid */}
      <div className="space-y-6">
        {filteredScenes.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">Aucun plan ne correspond au filtre sélectionné.</p>
          </div>
        ) : (
          filteredScenes.map((scene, index) => {
            const sceneChars = characters.filter((c) => scene.characterIds.includes(c.id));

            return (
              <div
                key={scene.id}
                className="bg-slate-900/70 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden shadow-xl"
              >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                
                {/* Visual Image Preview Slot (16:9 Aspect Ratio) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
                    {scene.imageUrl ? (
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80 text-slate-500 text-xs p-4 text-center space-y-2">
                        <ImageIcon className="w-8 h-8 text-amber-500/40" />
                        <span>Plan visuel non généré</span>
                        <span className="text-[10px] text-slate-600">
                          Intègre les ancres physiques des personnages
                        </span>
                      </div>
                    )}

                    {scene.isGeneratingImage && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                        <span className="text-xs font-semibold text-amber-300">
                          Génération IA par Gemini...
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-300 text-xs font-bold">
                      Plan #{scene.sceneNumber}
                    </div>

                    {scene.imageUrl && (
                      <button
                        onClick={() => onPlaySceneInPlayer(index)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-amber-500/90 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-amber-400 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Aperçu vidéo</span>
                      </button>
                    )}
                  </div>

                  {/* Image Generation & Regeneration Action */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => handleGenerateSceneImage(scene)}
                      disabled={scene.isGeneratingImage}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {scene.imageUrl ? 'Régénérer cette image IA' : 'Générer l\'image du plan'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Scene Script Details */}
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    
                    {/* Scene Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950/80 rounded-xl border border-amber-500/30">
                      <button
                        onClick={() => handleGenerateSceneImage(scene)}
                        disabled={scene.isGeneratingImage}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 border border-amber-500/20"
                        title="Générer l'image depuis le prompt du roman"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{scene.imageUrl ? 'Image Prête' : 'Générer Image'}</span>
                      </button>

                      <button
                        onClick={() => handleGenerateSceneVideo(scene)}
                        disabled={scene.isGeneratingVideo || scene.isGeneratingImage}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 shadow"
                        title="Générer le clip vidéo Seedance 2.5 synchronisé"
                      >
                        <Film className="w-3.5 h-3.5 text-slate-950" />
                        <span>{scene.videoUrl ? 'Vidéo Seedance 2.5 Prête' : 'Générer Vidéo Seedance 2.5'}</span>
                      </button>
                    </div>

                    {/* Scene Title & Camera Motion */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                        {scene.title.toLowerCase().includes('prologue') && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] uppercase font-mono font-bold tracking-wider shrink-0">
                            PROLOGUE
                          </span>
                        )}
                        <span>{scene.title}</span>
                      </h3>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase">
                          Caméra: {scene.cameraMotion.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                          Ambiance: {scene.musicMood}
                        </span>
                      </div>
                    </div>

                    {/* Original Novel Excerpt */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Extrait du Roman
                      </span>
                      <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                        "{scene.novelExcerpt}"
                      </p>
                    </div>

                    {/* Characters Present with Visual Anchors */}
                    {sceneChars.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Personnages présents (Ancres de cohérence appliquées)</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sceneChars.map((c) => (
                            <span
                              key={c.id}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-center gap-1.5"
                            >
                              <span>{c.name}</span>
                              <span className="text-[9px] text-amber-400/80">({c.hair})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Narration Voiceover Text */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        <span>Voix Off Narrateur (Français)</span>
                      </span>
                      <p className="text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-sans">
                        {scene.voiceoverText}
                      </p>
                    </div>

                    {/* Image Prompt Display & Edit */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>Prompt Visuel IA (Anglais Cinéma)</span>
                        </span>
                        {editingPromptId !== scene.id && (
                          <button
                            onClick={() => handleStartEditPrompt(scene)}
                            className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifier prompt</span>
                          </button>
                        )}
                      </div>

                      {editingPromptId === scene.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={tempPrompt}
                            onChange={(e) => setTempPrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingPromptId(null)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSavePrompt(scene)}
                              className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px]"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-mono line-clamp-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                          {scene.imagePrompt}
                        </p>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
