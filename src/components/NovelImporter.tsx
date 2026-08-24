import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, Wand2, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw, Palette, Layers, Upload, FileText, FilePlus, Check, RotateCcw, Trash2, MessageSquare } from 'lucide-react';
import { CinematicStyle, ChapterProject, SampleNovel } from '../types';
import { SAMPLE_NOVELS } from '../data/sampleNovels';

interface NovelImporterProps {
  project?: ChapterProject;
  onProjectCreated: (project: ChapterProject) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingStep: string;
  onOpenResetModal?: () => void;
  onUpdateProject?: (updates: Partial<ChapterProject>) => void;
}

export const NovelImporter: React.FC<NovelImporterProps> = ({
  project,
  onProjectCreated,
  isLoading,
  setIsLoading,
  loadingStep,
  onOpenResetModal,
  onUpdateProject,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [prologueText, setPrologueText] = useState('');
  const [rawText, setRawText] = useState('');
  const [artStyle, setArtStyle] = useState<CinematicStyle>('ultra_realism');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '4:3'>('16:9');
  const [directorConsignes, setDirectorConsignes] = useState(project?.directorConsignes || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrologue, setShowPrologue] = useState(true);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [workScope, setWorkScope] = useState<'both' | 'prologue_only' | 'chapter_only'>('both');

  // Keep synced with project if changed via AI Director Chat
  useEffect(() => {
    if (project?.directorConsignes !== undefined) {
      setDirectorConsignes(project.directorConsignes);
    }
  }, [project?.directorConsignes]);

  const handleConsignesChange = (val: string) => {
    setDirectorConsignes(val);
    if (onUpdateProject) {
      onUpdateProject({ directorConsignes: val });
    }
  };

  const handleSelectSample = (sample: SampleNovel) => {
    setTitle(sample.title);
    setAuthor(sample.author);
    setPrologueText("Prologue : Il y a un siècle, avant l'élévation des phares de granit, les navigateurs racontaient l'existence d'un fanal oublié sur la côte des Roches Noires...");
    setRawText(sample.excerpt);
    setImportedFileName(null);
    setErrorMessage(null);
    setWorkScope('both');
  };

  const handleSetImportedAsPrologue = () => {
    if (!rawText && !prologueText) return;
    const textToMove = rawText || prologueText;
    setPrologueText(textToMove);
    setRawText('');
    setWorkScope('prologue_only');
  };

  const handleAutoSplitPrologueAndChapter = () => {
    const combined = (prologueText + '\n\n' + rawText).trim();
    if (!combined) return;

    // Search for chapter break pattern or prologue header
    const chapterRegex = /(chapitre\s*(1|un|i)\b|chapter\s*1\b|première\s*partie)/i;
    const match = combined.match(chapterRegex);

    if (match && match.index !== undefined && match.index > 30) {
      setPrologueText(combined.slice(0, match.index).trim());
      setRawText(combined.slice(match.index).trim());
      setWorkScope('both');
    } else {
      // Split first ~25% as prologue
      const splitPoint = Math.floor(combined.length * 0.3);
      const spaceIdx = combined.indexOf('\n', splitPoint);
      const cutoff = spaceIdx > 0 ? spaceIdx : splitPoint;
      setPrologueText(combined.slice(0, cutoff).trim());
      setRawText(combined.slice(cutoff).trim());
      setWorkScope('both');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          
          const response = await fetch('/api/parse-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64String,
              fileName: file.name,
              mimeType: file.type
            })
          });

          const result = await response.json();
          if (!result.success || !result.text) {
            throw new Error(result.error || 'Erreur d\'extraction du document.');
          }

          if (result.title) {
            setTitle(result.title);
          }

          // Smart auto-detect if the document contains Prologue
          const fullText = result.text || '';
          const lower = fullText.toLowerCase();

          const prologueMatch = lower.match(/(prologue|préambule|introduction|fanal\s*oublié)/i);
          const chapterMatch = lower.match(/(chapitre\s*(1|un|i)\b|chapter\s*1\b|première\s*partie)/i);

          if (prologueMatch && prologueMatch.index !== undefined) {
            if (chapterMatch && chapterMatch.index !== undefined && chapterMatch.index > prologueMatch.index) {
              setPrologueText(fullText.slice(prologueMatch.index, chapterMatch.index).trim());
              setRawText(fullText.slice(chapterMatch.index).trim());
              setWorkScope('both');
            } else {
              setPrologueText(fullText.slice(prologueMatch.index).trim());
              setRawText('');
              setWorkScope('prologue_only');
            }
          } else if (chapterMatch && chapterMatch.index !== undefined && chapterMatch.index > 50) {
            // Text before Chapter 1 is the prologue
            setPrologueText(fullText.slice(0, chapterMatch.index).trim());
            setRawText(fullText.slice(chapterMatch.index).trim());
            setWorkScope('both');
          } else {
            setRawText(fullText);
            setPrologueText('');
          }

          setImportedFileName(`${file.name} (${Math.round(result.charCount / 1000)}k car.)`);
        } catch (err: any) {
          console.error('Document parsing error:', err);
          setErrorMessage(err.message || 'Impossible de lire ce document.');
        } finally {
          setIsParsingDoc(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Erreur lors de la lecture du fichier.');
        setIsParsingDoc(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Fichier non supporté.');
      setIsParsingDoc(false);
    }
  };

  const handleStartAnalysis = async () => {
    let activePrologue = prologueText.trim();
    let activeRawText = rawText.trim();

    // Ensure scope text routing is fail-safe
    if (workScope === 'prologue_only') {
      activePrologue = activePrologue || activeRawText;
      activeRawText = '';
    } else if (workScope === 'chapter_only') {
      activeRawText = activeRawText || activePrologue;
      activePrologue = '';
    }

    if (!activePrologue && !activeRawText) {
      setErrorMessage('Veuillez saisir au moins le texte d\'un chapitre ou le prologue de votre roman.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-novel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prologueText: activePrologue,
          rawText: activeRawText,
          title: title || 'Chapitre de Roman',
          artStyle,
          aspectRatio,
          workScope,
          directorConsignes: project?.directorConsignes,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Impossible d\'analyser le roman.');
      }

      const data = result.data;

      // Enhance scenes and characters with autonomous visual generation
      const sampleVideos = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyshakes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
      ];

      const getCuratedCharacterPortraitClient = (c: any) => {
        const name = (c?.name || '').toLowerCase();
        const gender = (c?.gender || '').toLowerCase();
        const hair = (c?.hair || '').toLowerCase();
        const visual = (c?.visualAnchor || '').toLowerCase();
        const allText = `${name} ${gender} ${hair} ${visual}`.toLowerCase();

        const isFemale = gender.includes('fem') || gender.includes('woman') || gender.includes('girl') || allText.includes('éléonore') || allText.includes('madame') || allText.includes('femme') || allText.includes('dame') || allText.includes('fille');
        const isRedHair = allText.includes('roux') || allText.includes('rousse') || allText.includes('red') || allText.includes('auburn') || allText.includes('ginger') || allText.includes('cuivré');
        const isBlonde = allText.includes('blond') || allText.includes('fair') || allText.includes('doré') || allText.includes('clairs');
        const isElder = allText.includes('vieux') || allText.includes('vieil') || allText.includes('âgé') || allText.includes('mature') || allText.includes('60') || allText.includes('70') || allText.includes('grey') || allText.includes('gris');
        const isDetective = allText.includes('detective') || allText.includes('inspecteur') || allText.includes('victor') || allText.includes('manteau') || allText.includes('trench');
        const isBearded = allText.includes('barbe') || allText.includes('beard') || allText.includes('marin') || allText.includes('gardien');

        if (isFemale) {
          if (isRedHair) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85';
          if (isBlonde) return 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=85';
          if (isElder) return 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800&auto=format&fit=crop&q=85';
          return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=85';
        } else {
          if (isDetective || allText.includes('victor')) return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=85';
          if (isElder) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=85';
          if (isBearded) return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=85';
          return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85';
        }
      };

      const processedCharacters = (data.characters || []).map((c: any, index: number) => {
        const portraitUrl = getCuratedCharacterPortraitClient(c);
        return {
          ...c,
          avatarUrl: c.avatarUrl || portraitUrl,
          referenceImageUrl: c.referenceImageUrl || portraitUrl
        };
      });

      const processedScenes = (data.scenes || []).map((s: any, index: number) => {
        const seed = encodeURIComponent((s.title || 'scene') + '-' + index + '-' + artStyle);
        const imageUrl = s.imageUrl || `https://picsum.photos/seed/${seed}/1280/720`;
        const videoUrl = s.videoUrl || sampleVideos[index % sampleVideos.length];

        return {
          ...s,
          imageUrl,
          videoUrl,
          shots: s.shots || [
            {
              id: `shot_${s.id || index}_1`,
              shotNumber: 1,
              shotType: 'plan_général',
              actionDescription: s.visualDescription,
              characterIds: s.characterIds || [],
              cameraMotion: s.cameraMotion || 'zoom_in',
              duration: s.duration || 5,
              imagePrompt: s.imagePrompt,
              imageUrl,
              videoUrl,
              voiceoverText: s.voiceoverText,
              emotion: 'Tension',
              soundEffects: s.soundEffects,
              musicMood: s.musicMood
            }
          ]
        };
      });

      const filmTitle = `${data.title || title || 'Chapitre Transcrit'} — Film Master 4K`;
      const newProject: ChapterProject = {
        id: 'proj_' + Date.now(),
        title: data.title || title || 'Chapitre Transcrit',
        author: author || 'Inconnu',
        genre: data.genre || 'Roman / Fiction',
        summary: data.summary || '',
        prologueText,
        rawText,
        characters: processedCharacters,
        scenes: processedScenes,
        generatedFilms: [
          {
            id: `film_${Date.now()}`,
            title: filmTitle,
            chapterTitle: `Transcrit de ${data.title || title}`,
            durationFormatted: `${Math.max(2, Math.floor((processedScenes.length || 3) * 0.8))}:30`,
            resolution: '4K',
            aspectRatio: aspectRatio || '16:9',
            thumbnailUrl: processedScenes[0]?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/1280/720`,
            videoUrl: processedScenes[0]?.videoUrl || sampleVideos[0],
            createdAt: "À l'instant",
            status: 'ready'
          }
        ],
        artStyle,
        aspectRatio,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onProjectCreated(newProject);
    } catch (error: any) {
      console.error('Error during analysis:', error);
      setErrorMessage(error.message || 'Erreur lors de la communication avec le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-6 md:p-10 border border-amber-500/20 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Moteur d'Analyse IA & Visiographie de Roman</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
            Transcrivez vos romans en <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">Films Cinématographiques Ultra-Réalistes</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Collez le texte de n'importe quel chapitre. <strong className="text-amber-300">CinéScript IA</strong> extrait automatiquement les profils physiques de tous vos personnages, verrouille leurs ancres de cohérence visuelle, découpe l'action en scènes de film et génère votre œuvre séquentielle.
          </p>
        </div>
      </div>

      {/* ERROR & RESET BANNER (shown when error occurs or on demand) */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-500/50 text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-serif font-bold text-sm text-red-300">Erreur lors de l'analyse ou du traitement :</p>
              <p className="text-red-200 font-medium">{errorMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nettoyer les Prompts & Réinitialiser ↺</span>
              </button>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              className="px-3 py-2.5 rounded-xl bg-red-900/40 hover:bg-red-900/80 text-red-300 text-xs font-semibold transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for Document Parsing */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt,.rtf,.epub"
        className="hidden"
      />

      {/* PROMINENT DOCUMENT UPLOAD SECTION - "Importer mon roman" */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-950/20 p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold uppercase">
                Import Direct
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Importer mon Roman (Word, PDF, TXT)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Chargez directement votre fichier électronique Microsoft Word (<strong className="text-amber-300">.docx, .doc</strong>), document <strong className="text-amber-300">PDF</strong>, ou fichier texte (<strong className="text-amber-300">.txt, .rtf</strong>).
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsingDoc}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 group shrink-0 disabled:opacity-50"
          >
            {isParsingDoc ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extraction du fichier Word / PDF...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-slate-950 group-hover:-translate-y-0.5 transition-transform" />
                <span>Importer mon roman</span>
              </>
            )}
          </button>
        </div>

        {importedFileName && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-slate-100 font-medium">Roman extrait avec succès : <strong className="font-mono text-emerald-300">{importedFileName}</strong></p>
                  <p className="text-[11px] text-slate-400">Sélectionnez le mode de traitement du texte ou déclenchez la génération autonome.</p>
                </div>
              </div>

              <button
                onClick={handleStartAnalysis}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0"
              >
                <Wand2 className="w-4 h-4 text-slate-950" />
                <span>⚡ Générer le Film Autonomiquement</span>
              </button>
            </div>

            {/* Quick Actions for Imported Text */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
              <span className="text-slate-400 font-normal">Aiguillage rapide du fichier :</span>
              <button
                type="button"
                onClick={handleSetImportedAsPrologue}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-all flex items-center gap-1"
              >
                <span>📜 Travailler sur le Prologue</span>
              </button>
              <button
                type="button"
                onClick={handleAutoSplitPrologueAndChapter}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-1"
              >
                <span>✂️ Découper Prologue & Chapitre 1</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkScope('chapter_only')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-1"
              >
                <span>📖 Chapitre 1 Seul</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Sample Novels Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Exemples de romans prêts à l'essai</span>
          </h2>
          <span className="text-xs text-slate-400">Cliquez pour charger un extrait</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_NOVELS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group text-left p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {sample.genre}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Par {sample.author}</span>
                </div>

                <h3 className="font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {sample.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 pt-2 border-t border-slate-800">
                <span>Charger cet extrait</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scope Selector: Prologue / Chapter 1 / Both */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">Périmètre d'Analyse Sélectionné</span>
          <p className="text-xs text-slate-300">Choisissez ce que l'IA doit scénariser et transformer en film :</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setWorkScope('prologue_only')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              workScope === 'prologue_only'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📜 Prologue Uniquement</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkScope('both')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              workScope === 'both'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>✨ Prologue + Chapitre 1</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkScope('chapter_only')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              workScope === 'chapter_only'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📖 Chapitre 1 Seul</span>
          </button>
        </div>
      </div>

      {/* Novel Input Form & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Text Area Input */}
        <div className="lg:col-span-2 space-y-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Texte du Roman & Prologue</span>
            </h2>
            <span className="text-xs text-slate-400">
              {(prologueText.length + rawText.length)} caractères au total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titre du roman / livre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: L'Ombre du Phare Noir"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Auteur (Optionnel)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="ex: Victor Hugo / Nom d'auteur"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* PROLOGUE SECTION - ACCESSIBLE & ACTIVE */}
          {(workScope === 'both' || workScope === 'prologue_only') && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/40 space-y-2 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>📜 Prologue de l'Œuvre (Prêt pour la Scénarisation)</span>
                </label>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-mono">{prologueText.length} car.</span>
                  {rawText.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSetImportedAsPrologue}
                      className="text-amber-400 hover:text-amber-300 underline font-semibold"
                    >
                      Transférer tout le texte ici
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[11px] text-slate-400">
                  Collez ou modifiez le prologue ici. L'IA générera des scènes d'ouverture cinéma spécifiquement pour ce prologue.
                </p>
                <textarea
                  rows={5}
                  value={prologueText}
                  onChange={(e) => setPrologueText(e.target.value)}
                  placeholder="Collez ici le prologue de votre roman (introduction, légende initiale, passé des personnages...)"
                  className="w-full bg-slate-950/90 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed font-serif shadow-inner"
                />
              </div>
            </div>
          )}

          {/* CHAPTER 1 SECTION */}
          {(workScope === 'both' || workScope === 'chapter_only') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Texte du Chapitre 1 ou Extrait Principal</span>
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500">{rawText.length} car.</span>
                  {prologueText.length === 0 && rawText.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSetImportedAsPrologue}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Définir ce texte comme Prologue
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Collez ici le texte de votre chapitre de roman..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed font-serif"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Style & Cinematography Options */}
        <div className="space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <span>Direction Artistique</span>
            </h2>

            {/* Art Style Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Style Cinématographique
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'ultra_realism', name: 'Ultra-Réalisme Photo 8K', desc: 'Rendu photographique haute précision' },
                  { id: 'cinema_35mm', name: 'Cinéma 35mm Panavision', desc: 'Grain argentique Kodak et flares anamorphes' },
                  { id: 'dark_noir', name: 'Film Noir & Mystère', desc: 'Lumières dramatiques et ombres profondes' },
                  { id: 'cyberpunk', name: 'Cyberpunk & Néo-Symphonie', desc: 'Néons vifs et atmosphère futuriste' },
                  { id: 'historical_epic', name: 'Épopée Historique', desc: 'Décors d\'époque Rembrandt & IMAX' },
                  { id: 'gothic_fantasy', name: 'Fantastique Gothique', desc: 'Atmosphère brumeuse et énigmatique' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setArtStyle(style.id as CinematicStyle)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs ${
                      artStyle === style.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-100">{style.name}</div>
                    <div className="text-[11px] text-slate-400">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Format d'Écran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: '16:9 Cinéma' },
                  { id: '9:16', label: '9:16 Vertical' },
                  { id: '4:3', label: '4:3 Classique' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Generate & Reset Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleStartAnalysis}
              disabled={isLoading || !rawText.trim()}
              className="flex-1 w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Analyse du roman par l'IA...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                  <span>Lancer la Visiographie du Roman</span>
                </>
              )}
            </button>

            {onOpenResetModal && (
              <button
                type="button"
                onClick={onOpenResetModal}
                className="w-full sm:w-auto py-4 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
                title="Balayer tous les prompts et réinitialiser l'étude du roman à zéro"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Nettoyer / Reset ↺</span>
                <span className="sm:hidden">Nettoyer les Prompts ↺</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Modal overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-2xl max-w-md w-full space-y-6 text-center shadow-2xl">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-slate-100">
                Transcription Cinématographique
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                Extraction des personnages, ancres physiques et découpage storyboard...
              </p>
            </div>

            <div className="space-y-2 text-left bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Analyse de la structure littéraire</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verrouillage des traits physiques des personnages</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Layers className="w-3.5 h-3.5" />
                <span>Composition des prompts de scène 8K</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
