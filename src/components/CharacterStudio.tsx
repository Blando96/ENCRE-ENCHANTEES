import React, { useState, useMemo, useRef } from 'react';
import { Character, CinematicStyle, FaceReference } from '../types';
import {
  Users,
  Lock,
  Sparkles,
  Edit3,
  Plus,
  RefreshCw,
  UserCheck,
  Eye,
  Check,
  Grid,
  Search,
  Maximize2,
  Download,
  Trash2,
  Upload,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  Palette,
  Film,
  Sparkle,
  Image as ImageIcon
} from 'lucide-react';

interface CharacterStudioProps {
  characters: Character[];
  onUpdateCharacter: (character: Character) => void;
  onAddCharacter: (character: Character) => void;
  onDeleteCharacter?: (characterId: string) => void;
  artStyle: CinematicStyle;
}

type ViewMode = 'gallery' | 'detail';
type RoleFilter = 'all' | 'protagonist' | 'antagonist' | 'supporting' | 'deuteragonist';

export const CharacterStudio: React.FC<CharacterStudioProps> = ({
  characters,
  onUpdateCharacter,
  onAddCharacter,
  onDeleteCharacter,
  artStyle,
}) => {
  // Navigation & View mode
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    characters.length > 0 ? characters[0] : null
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Character>>({});

  // Generation loading states
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);

  // Lightbox Modal state
  const [lightboxCharacterIndex, setLightboxCharacterIndex] = useState<number | null>(null);
  const [copiedAnchorId, setCopiedAnchorId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Hidden file input for uploading images
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetCharId, setUploadTargetCharId] = useState<string | null>(null);

  // Filtered characters list for gallery
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.hair || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.eyes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.visualAnchor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.clothingStyle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.ethnicity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.gender || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || (char.role || 'supporting') === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [characters, searchQuery, roleFilter]);

  // Total portraits statistics
  const charactersWithImages = useMemo(() => {
    return characters.filter((c) => Boolean(c.referenceImageUrl || c.avatarUrl));
  }, [characters]);

  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setEditForm(char);
    setIsEditing(false);
    setViewMode('detail');
  };

  const handleStartEdit = (char: Character) => {
    setSelectedCharacter(char);
    setEditForm(char);
    setIsEditing(true);
    setViewMode('detail');
  };

  const handleSaveEdit = () => {
    if (!selectedCharacter || !editForm.id) return;
    const updated: Character = {
      ...selectedCharacter,
      ...editForm,
      visualAnchor:
        editForm.visualAnchor ||
        `${editForm.age || ''} ${editForm.ethnicity || ''} ${editForm.gender || ''}, ${editForm.hair || ''}, ${editForm.eyes || ''}, ${editForm.faceFeatures || ''}, wearing ${editForm.clothingStyle || ''}`,
    } as Character;

    onUpdateCharacter(updated);
    setSelectedCharacter(updated);
    setIsEditing(false);
  };

  // Download image helper
  const handleDownloadImage = async (imageUrl: string, characterName: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (!imageUrl) return;

    try {
      const safeName = (characterName || 'Personnage').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safeName}_portrait_HD.png`;

      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadSuccessId(characterName);
        setTimeout(() => setDownloadSuccessId(null), 2000);
        return;
      }

      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      setDownloadSuccessId(characterName);
      setTimeout(() => setDownloadSuccessId(null), 2000);
    } catch (e) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `${characterName || 'portrait'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Delete portrait image
  const handleDeletePortrait = (char: Character, specificImageUrl?: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    const currentRefs = char.faceReferences || [];

    if (specificImageUrl) {
      // Remove specific variation
      const filteredRefs = currentRefs.filter((r) => r.imageUrl !== specificImageUrl);
      const nextActiveImage =
        char.referenceImageUrl === specificImageUrl
          ? filteredRefs[0]?.imageUrl || undefined
          : char.referenceImageUrl;

      const updated: Character = {
        ...char,
        referenceImageUrl: nextActiveImage,
        avatarUrl: nextActiveImage,
        faceReferences: filteredRefs,
      };

      onUpdateCharacter(updated);
      if (selectedCharacter?.id === char.id) {
        setSelectedCharacter(updated);
      }
    } else {
      // Clear main portrait & all variations
      const updated: Character = {
        ...char,
        referenceImageUrl: undefined,
        avatarUrl: undefined,
        faceReferences: [],
      };

      onUpdateCharacter(updated);
      if (selectedCharacter?.id === char.id) {
        setSelectedCharacter(updated);
      }
    }
  };

  // Trigger file upload for character
  const handleTriggerUpload = (charId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setUploadTargetCharId(charId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetCharId) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      if (!base64Data) return;

      const char = characters.find((c) => c.id === uploadTargetCharId);
      if (!char) return;

      const newRef: FaceReference = {
        angle: 'frontal',
        label: `Photo Importée (${file.name.slice(0, 15)})`,
        imageUrl: base64Data,
      };

      const updated: Character = {
        ...char,
        referenceImageUrl: base64Data,
        avatarUrl: base64Data,
        faceReferences: [newRef, ...(char.faceReferences || [])],
      };

      onUpdateCharacter(updated);
      if (selectedCharacter?.id === char.id) {
        setSelectedCharacter(updated);
      }
      setUploadTargetCharId(null);
    };

    reader.readAsDataURL(file);
  };

  // Generate portrait for a single character (Reprendre / Générer)
  const handleGeneratePortrait = async (char: Character, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setIsGeneratingPortrait(char.id);
    try {
      const response = await fetch('/api/generate-character-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: char.name,
          visualAnchor: char.visualAnchor,
          gender: char.gender,
          ethnicity: char.ethnicity,
          skinTone: char.skinTone,
          age: char.age,
          hair: char.hair,
          eyes: char.eyes,
          faceFeatures: char.faceFeatures,
          clothingStyle: char.clothingStyle,
          role: char.role,
          artStyle,
        }),
      });

      const result = await response.json();
      if (result.success && result.imageUrl) {
        // Save to referenceImageUrl, avatarUrl and append to faceReferences gallery
        const existingRefs = char.faceReferences || [];
        const newRef: FaceReference = {
          angle: 'frontal',
          label: `Portrait Studio HD (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          imageUrl: result.imageUrl,
        };

        const updated: Character = {
          ...char,
          referenceImageUrl: result.imageUrl,
          avatarUrl: result.imageUrl,
          faceReferences: [newRef, ...existingRefs.filter((r) => r.imageUrl !== result.imageUrl)],
        };

        onUpdateCharacter(updated);
        if (selectedCharacter?.id === char.id) {
          setSelectedCharacter(updated);
        }
      }
    } catch (e) {
      console.error('Error generating character portrait:', e);
    } finally {
      setIsGeneratingPortrait(null);
    }
  };

  // Batch generate portraits for all characters
  const handleGenerateAllPortraits = async () => {
    if (characters.length === 0 || isGeneratingAll) return;
    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: characters.length });

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      setGenerationProgress({ current: i + 1, total: characters.length });
      setIsGeneratingPortrait(char.id);

      try {
        const response = await fetch('/api/generate-character-portrait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterName: char.name,
            visualAnchor: char.visualAnchor,
            gender: char.gender,
            ethnicity: char.ethnicity,
            skinTone: char.skinTone,
            age: char.age,
            hair: char.hair,
            eyes: char.eyes,
            faceFeatures: char.faceFeatures,
            clothingStyle: char.clothingStyle,
            role: char.role,
            artStyle,
          }),
        });
        const result = await response.json();
        if (result.success && result.imageUrl) {
          const existingRefs = char.faceReferences || [];
          const newRef: FaceReference = {
            angle: 'frontal',
            label: `Portrait Studio HD (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            imageUrl: result.imageUrl,
          };

          const updated: Character = {
            ...char,
            referenceImageUrl: result.imageUrl,
            avatarUrl: result.imageUrl,
            faceReferences: [newRef, ...existingRefs.filter((r) => r.imageUrl !== result.imageUrl)],
          };
          onUpdateCharacter(updated);
          if (selectedCharacter?.id === char.id) {
            setSelectedCharacter(updated);
          }
        }
      } catch (e) {
        console.error('Error generating portrait for ' + char.name, e);
      } finally {
        setIsGeneratingPortrait(null);
      }
    }
    setIsGeneratingAll(false);
    setGenerationProgress(null);
  };

  // Select an alternate reference from the character's photo history
  const handleSelectVariation = (char: Character, imageUrl: string) => {
    const updated = {
      ...char,
      referenceImageUrl: imageUrl,
      avatarUrl: imageUrl,
    };
    onUpdateCharacter(updated);
    if (selectedCharacter?.id === char.id) {
      setSelectedCharacter(updated);
    }
  };

  const handleAddNewCharacter = () => {
    const newChar: Character = {
      id: 'char_' + Date.now(),
      characterCode: 'CHAR_' + String(characters.length + 1).padStart(3, '0'),
      name: 'Nouveau Personnage',
      age: '30 ans',
      gender: 'Masculin (Homme)',
      ethnicity: 'Africain / Noir',
      skinTone: 'Peau noire foncée',
      hair: 'Cheveux noirs courts',
      eyes: 'Yeux sombres expressifs',
      faceFeatures: 'Visage expressif',
      clothingStyle: 'Veste de travail soignée',
      build: 'Stature moyenne',
      visualAnchor: 'Close-up studio portrait of a 30yo Black African man, short dark hair, expressive dark eyes, wearing stylish work jacket',
      role: 'supporting',
      faceReferences: [],
    };

    onAddCharacter(newChar);
    setSelectedCharacter(newChar);
    setEditForm(newChar);
    setIsEditing(true);
    setViewMode('detail');
  };

  const handleCopyAnchor = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnchorId(id);
    setTimeout(() => setCopiedAnchorId(null), 2000);
  };

  // Selected character reference synchronized with latest characters prop
  const activeSelectedChar = useMemo(() => {
    if (selectedCharacter) {
      const found = characters.find((c) => c.id === selectedCharacter.id);
      if (found) return found;
    }
    return characters.length > 0 ? characters[0] : null;
  }, [characters, selectedCharacter]);

  // Lightbox navigation helpers
  const currentLightboxChar =
    lightboxCharacterIndex !== null &&
    lightboxCharacterIndex >= 0 &&
    lightboxCharacterIndex < characters.length
      ? characters[lightboxCharacterIndex]
      : null;

  const handlePrevLightbox = () => {
    if (lightboxCharacterIndex !== null && characters.length > 0) {
      setLightboxCharacterIndex((lightboxCharacterIndex - 1 + characters.length) % characters.length);
    }
  };
  const handleNextLightbox = () => {
    if (lightboxCharacterIndex !== null && characters.length > 0) {
      setLightboxCharacterIndex((lightboxCharacterIndex + 1) % characters.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/jpg"
        className="hidden"
      />

      {/* TOP HERO CONTROLLER */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 flex items-center gap-3">
                  <span>Studio & Galerie des Personnages</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    8K Visual Lock
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Boîte de conservation, retouche et téléchargement des portraits d'acteurs. Respect strict des ethnies, couleurs de peau et genres du roman.
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  <strong>{characters.length}</strong> Personnages au casting
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>{charactersWithImages.length} / {characters.length}</strong> Portraits HD Générés
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Style : <strong className="capitalize">{artStyle.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View switcher */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'gallery'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Galerie ({characters.length})</span>
              </button>

              <button
                onClick={() => setViewMode('detail')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'detail'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Fiche & Verrou</span>
              </button>
            </div>

            <button
              onClick={handleGenerateAllPortraits}
              disabled={isGeneratingAll || characters.length === 0}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>
                    Génération ({generationProgress?.current}/{generationProgress?.total})...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Générer Tous les Portraits ({characters.length})</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddNewCharacter}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MASTER GALLERY BOX (BOÎTE DE GALERIE DES PERSONNAGES) */}
      {viewMode === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Gallery Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, rôle, ethnie, couleur de peau, vêtements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: 'all', label: 'Tous' },
                  { id: 'protagonist', label: 'Principaux' },
                  { id: 'antagonist', label: 'Antagonistes' },
                  { id: 'supporting', label: 'Secondaires' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    roleFilter === f.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Characters Master Card Grid */}
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCharacters.map((char) => {
                const charIndex = characters.findIndex((c) => c.id === char.id);
                const charImage = char.referenceImageUrl || char.avatarUrl;
                const isGeneratingThis = isGeneratingPortrait === char.id;
                const hasVariations = (char.faceReferences || []).length > 1;

                return (
                  <div
                    key={char.id}
                    className="group bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl hover:shadow-amber-500/10"
                  >
                    {/* Portrait Image Container */}
                    <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                      {charImage ? (
                        <>
                          <img
                            src={charImage}
                            alt={char.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {/* Image Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                          {/* Quick Action Top Bar (Fullscreen, Download, Delete) */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Download button */}
                            <button
                              onClick={(e) => handleDownloadImage(charImage, char.name, e)}
                              className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-white border border-white/10 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all"
                              title="Télécharger le portrait HD"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Fullscreen Lightbox Button */}
                            <button
                              onClick={() => setLightboxCharacterIndex(charIndex)}
                              className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-white border border-white/10 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 transition-all"
                              title="Agrandir en Plein Écran HD"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Portrait Button */}
                            <button
                              onClick={(e) => handleDeletePortrait(char, undefined, e)}
                              className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-rose-300 border border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all"
                              title="Supprimer la photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950 p-4 text-center space-y-3">
                          <Users className="w-12 h-12 text-slate-700" />
                          <span className="text-xs text-slate-500">Aucun portrait généré</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleGeneratePortrait(char, e)}
                              disabled={isGeneratingThis}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Générer</span>
                            </button>
                            <button
                              onClick={(e) => handleTriggerUpload(char.id, e)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center gap-1 border border-slate-700"
                              title="Importer une photo depuis l'ordinateur"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Importer</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                          {char.characterCode || `CHR_${char.id.slice(-3)}`}
                        </span>
                        {char.role === 'protagonist' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-md">
                            ★ Protagoniste
                          </span>
                        )}
                        {char.role === 'antagonist' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md">
                            Antagoniste
                          </span>
                        )}
                      </div>

                      {/* Bottom Name & Meta overlay on picture */}
                      <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                        <h3 className="font-serif font-bold text-lg text-slate-100 leading-tight drop-shadow-md">
                          {char.name}
                        </h3>
                        <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                          {char.age || 'Adulte'} • {char.gender || 'Personnage'} {char.ethnicity ? `• ${char.ethnicity}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Card Body Information */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      {/* Physical traits summary */}
                      <div className="space-y-1.5 text-xs">
                        {char.ethnicity && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Ethnie / Origine :</span>
                            <strong className="text-amber-300 truncate max-w-[150px] font-semibold">{char.ethnicity}</strong>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Cheveux :</span>
                          <strong className="text-slate-200 truncate max-w-[150px] font-normal">{char.hair || 'Naturels'}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Yeux :</span>
                          <strong className="text-slate-200 truncate max-w-[150px] font-normal">{char.eyes || 'Expressifs'}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Tenue :</span>
                          <strong className="text-slate-200 truncate max-w-[150px] font-normal">{char.clothingStyle || 'Cinématique'}</strong>
                        </div>
                      </div>

                      {/* Visual Anchor Token Preview */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Ancre Visuelle
                          </span>
                          <button
                            onClick={() => handleCopyAnchor(char.id, char.visualAnchor)}
                            className="hover:text-amber-300 transition-colors"
                            title="Copier le prompt de l'ancre"
                          >
                            {copiedAnchorId === char.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="line-clamp-2 text-slate-300 select-all">
                          "{char.visualAnchor}"
                        </p>
                      </div>

                      {/* Photo history variations selector if present */}
                      {hasVariations && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Camera className="w-3 h-3 text-amber-400" />
                              Clichés ({char.faceReferences?.length})
                            </span>
                            <span className="text-[10px] text-slate-500">Choisir portrait actif</span>
                          </div>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {char.faceReferences?.map((ref, idx) => (
                              <div key={idx} className="relative group/thumb shrink-0">
                                <button
                                  onClick={() => handleSelectVariation(char, ref.imageUrl)}
                                  className={`w-8 h-8 rounded-lg overflow-hidden border transition-all ${
                                    char.referenceImageUrl === ref.imageUrl
                                      ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                                      : 'border-slate-800 opacity-60 hover:opacity-100'
                                  }`}
                                  title={ref.label}
                                >
                                  <img src={ref.imageUrl} alt={ref.label} className="w-full h-full object-cover" />
                                </button>
                                <button
                                  onClick={(e) => handleDeletePortrait(char, ref.imageUrl, e)}
                                  className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-600 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-md"
                                  title="Supprimer ce cliché"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons (Reprendre, Télécharger, Supprimer, Fiche) */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex items-center gap-1.5">
                          {/* Reprendre / Régénérer button */}
                          <button
                            onClick={() => handleGeneratePortrait(char)}
                            disabled={isGeneratingThis}
                            className="flex-1 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                            title="Reprendre et régénérer un nouveau portrait IA"
                          >
                            {isGeneratingThis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Génération...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{charImage ? 'Reprendre' : 'Générer'}</span>
                              </>
                            )}
                          </button>

                          {/* Upload photo button */}
                          <button
                            onClick={(e) => handleTriggerUpload(char.id, e)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
                            title="Importer une photo"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          {/* Download button */}
                          {charImage && (
                            <button
                              onClick={(e) => handleDownloadImage(charImage, char.name, e)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs transition-all"
                              title="Télécharger l'image HD"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete portrait button */}
                          {charImage && (
                            <button
                              onClick={(e) => handleDeletePortrait(char, undefined, e)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 text-xs transition-all"
                              title="Supprimer la photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Fiche Editor button */}
                          <button
                            onClick={() => handleSelectCharacter(char)}
                            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center gap-1 border border-slate-700"
                            title="Modifier la fiche détaillée"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
              <Users className="w-12 h-12 mx-auto text-slate-600" />
              <div>
                <h4 className="text-base font-serif font-bold text-slate-200">Aucun personnage trouvé</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Essayez de modifier votre recherche ou ajoutez un nouveau personnage.
                </p>
              </div>
              <button
                onClick={handleAddNewCharacter}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Ajouter un personnage
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DETAILED CHARACTER EDITOR & ANCHOR LOCK (FICHE DÉTAILLÉE) */}
      {viewMode === 'detail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
          {/* Left: Character Selector List */}
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between px-2 py-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Roster ({characters.length})</span>
              </h2>
              <button
                onClick={handleAddNewCharacter}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {characters.map((char) => {
                const isSelected = selectedCharacter?.id === char.id;
                const charImg = char.referenceImageUrl || char.avatarUrl;

                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelectCharacter(char)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                        {charImg ? (
                          <img
                            src={charImg}
                            alt={char.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="truncate">
                        <div className="font-semibold text-sm text-slate-100 truncate flex items-center gap-1.5">
                          <span>{char.name}</span>
                          {char.role === 'protagonist' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {char.age} • {char.gender} {char.ethnicity ? `• ${char.ethnicity}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Character Detailed Spotlight Card */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            {activeSelectedChar ? (
              <>
                {/* Header Spotlight Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-5">
                    {/* Big High Definition Portrait Preview with zoom */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-950 border-2 border-amber-500/40 shrink-0 shadow-2xl group cursor-pointer">
                      {(activeSelectedChar.referenceImageUrl || activeSelectedChar.avatarUrl) ? (
                        <>
                          <img
                            src={activeSelectedChar.referenceImageUrl || activeSelectedChar.avatarUrl}
                            alt={activeSelectedChar.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onClick={() => {
                              const idx = characters.findIndex((c) => c.id === activeSelectedChar.id);
                              setLightboxCharacterIndex(idx);
                            }}
                          />
                          <div
                            onClick={() => {
                              const idx = characters.findIndex((c) => c.id === activeSelectedChar.id);
                              setLightboxCharacterIndex(idx);
                            }}
                            className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <Maximize2 className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 text-xs p-2 text-center">
                          <Users className="w-6 h-6 mb-1 text-slate-400" />
                          <span>Pas de portrait</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-serif font-bold text-slate-100">
                          {activeSelectedChar.name}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold">
                          {activeSelectedChar.characterCode || `CHR_${activeSelectedChar.id.slice(-3)}`}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 font-medium mt-0.5">
                        {activeSelectedChar.age} • {activeSelectedChar.gender} {activeSelectedChar.ethnicity ? `• ${activeSelectedChar.ethnicity}` : ''} • {activeSelectedChar.role || 'Personnage'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-semibold">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          Verrouillage de cohérence actif
                        </span>
                        {(activeSelectedChar.faceReferences || []).length > 0 && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                            {activeSelectedChar.faceReferences?.length} variations conservées
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Action Controls: Reprendre, Télécharger, Supprimer, Modifier */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reprendre / Régénérer Button */}
                    <button
                      onClick={() => handleGeneratePortrait(activeSelectedChar)}
                      disabled={isGeneratingPortrait === activeSelectedChar.id}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                      title="Reprendre et générer un nouveau portrait"
                    >
                      {isGeneratingPortrait === activeSelectedChar.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reprendre / Régénérer</span>
                        </>
                      )}
                    </button>

                    {/* Importer Photo Button */}
                    <button
                      onClick={() => handleTriggerUpload(activeSelectedChar.id)}
                      className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700"
                      title="Importer une photo depuis l'ordinateur"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importer</span>
                    </button>

                    {/* Télécharger Button */}
                    {(activeSelectedChar.referenceImageUrl || activeSelectedChar.avatarUrl) && (
                      <button
                        onClick={() =>
                          handleDownloadImage(
                            activeSelectedChar.referenceImageUrl || activeSelectedChar.avatarUrl || '',
                            activeSelectedChar.name
                          )
                        }
                        className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700"
                        title="Télécharger l'image HD"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger</span>
                      </button>
                    )}

                    {/* Supprimer Portrait Button */}
                    {(activeSelectedChar.referenceImageUrl || activeSelectedChar.avatarUrl) && (
                      <button
                        onClick={() => handleDeletePortrait(activeSelectedChar)}
                        className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700 hover:border-rose-500"
                        title="Supprimer la photo du personnage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    )}

                    {/* Modifier Fiche Button */}
                    <button
                      onClick={() => handleStartEdit(activeSelectedChar)}
                      className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Édition en cours' : 'Modifier Fiche'}</span>
                    </button>
                  </div>
                </div>

                {/* Photo Vault History for this Character */}
                {(activeSelectedChar.faceReferences || []).length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Galerie des Versions du Portrait</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Cliquez pour définir comme portrait principal</span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto py-2">
                      {activeSelectedChar.faceReferences?.map((ref, idx) => (
                        <div key={idx} className="relative group/vault shrink-0">
                          <div
                            onClick={() => handleSelectVariation(activeSelectedChar, ref.imageUrl)}
                            className={`w-16 h-16 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                              activeSelectedChar.referenceImageUrl === ref.imageUrl
                                ? 'border-amber-500 ring-2 ring-amber-500/40 scale-105 shadow-lg'
                                : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                            }`}
                          >
                            <img src={ref.imageUrl} alt={ref.label} className="w-full h-full object-cover" />
                            {activeSelectedChar.referenceImageUrl === ref.imageUrl && (
                              <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-slate-950">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          {/* Quick hover action bar on each variation thumbnail */}
                          <div className="absolute -top-1 -right-1 flex items-center gap-1 opacity-0 group-hover/vault:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDownloadImage(ref.imageUrl, `${activeSelectedChar.name}_v${idx + 1}`, e)}
                              className="p-1 rounded-full bg-slate-900 text-slate-200 hover:bg-emerald-600 hover:text-white border border-slate-700 shadow-md"
                              title="Télécharger cette version"
                            >
                              <Download className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePortrait(activeSelectedChar, ref.imageUrl, e)}
                              className="p-1 rounded-full bg-slate-900 text-rose-400 hover:bg-rose-600 hover:text-white border border-slate-700 shadow-md"
                              title="Supprimer cette version"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Visual Anchor Token Display */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Ancre Visuelle Verrouillée (Visual Anchor Token)</span>
                    </span>
                    <button
                      onClick={() => handleCopyAnchor(activeSelectedChar.id, activeSelectedChar.visualAnchor)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-amber-400 font-mono transition-colors flex items-center gap-1"
                    >
                      {copiedAnchorId === activeSelectedChar.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editForm.visualAnchor || ''}
                      onChange={(e) => setEditForm({ ...editForm, visualAnchor: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="text-xs text-amber-200/90 font-mono bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed select-all">
                      "{activeSelectedChar.visualAnchor}"
                    </p>
                  )}
                </div>

                {/* Physical Attributes Grid with Ethnicity & Gender Controls */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Traits Physiques & Verrous Démographiques
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Genre */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Genre</span>
                      {isEditing ? (
                        <select
                          value={editForm.gender || 'Masculin (Homme)'}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        >
                          <option value="Féminin (Femme)">Féminin (Femme)</option>
                          <option value="Masculin (Homme)">Masculin (Homme)</option>
                          <option value="Non binaire / Autre">Non binaire / Autre</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.gender || 'Non spécifié'}</p>
                      )}
                    </div>

                    {/* Origine / Ethnie */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Origine / Ethnie</span>
                      {isEditing ? (
                        <select
                          value={editForm.ethnicity || 'Africain / Noir'}
                          onChange={(e) => setEditForm({ ...editForm, ethnicity: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        >
                          <option value="Africain / Noir">Africain / Noir</option>
                          <option value="Caucasien / Blanc">Caucasien / Blanc</option>
                          <option value="Asiatique">Asiatique</option>
                          <option value="Maghrébin / Arabe">Maghrébin / Arabe</option>
                          <option value="Latino / Hispanique">Latino / Hispanique</option>
                          <option value="Métis">Métis</option>
                          <option value="Autre">Autre</option>
                        </select>
                      ) : (
                        <p className="font-semibold text-amber-300">{activeSelectedChar.ethnicity || 'Non spécifiée'}</p>
                      )}
                    </div>

                    {/* Teint / Couleur de Peau */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Teint / Couleur de peau</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.skinTone || ''}
                          onChange={(e) => setEditForm({ ...editForm, skinTone: e.target.value })}
                          placeholder="ex: Peau noire foncée, Peau ébène, Peau claire, Peau mate"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.skinTone || 'Non spécifié'}</p>
                      )}
                    </div>

                    {/* Cheveux & Coiffure */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Cheveux & Coiffure</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.hair || ''}
                          onChange={(e) => setEditForm({ ...editForm, hair: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.hair || 'Non spécifié'}</p>
                      )}
                    </div>

                    {/* Yeux & Regard */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Yeux & Regard</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.eyes || ''}
                          onChange={(e) => setEditForm({ ...editForm, eyes: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.eyes || 'Non spécifié'}</p>
                      )}
                    </div>

                    {/* Visage & Expression */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Visage & Expression</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.faceFeatures || ''}
                          onChange={(e) => setEditForm({ ...editForm, faceFeatures: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.faceFeatures || 'Non spécifié'}</p>
                      )}
                    </div>

                    {/* Tenue Vestimentaire Signature */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Tenue Vestimentaire Signature</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.clothingStyle || ''}
                          onChange={(e) => setEditForm({ ...editForm, clothingStyle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.clothingStyle || 'Non spécifié'}</p>
                      )}
                    </div>

                    {/* Corpulence & Stature */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 font-medium">Corpulence & Stature</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.build || ''}
                          onChange={(e) => setEditForm({ ...editForm, build: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200">{activeSelectedChar.build || 'Stature moyenne'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Save Controls */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Annuler
                    </button>

                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Sauvegarder les modifications</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-slate-500 text-sm space-y-3">
                <Users className="w-12 h-12 mx-auto text-slate-600" />
                <p>Sélectionnez un personnage pour afficher et verrouiller son ancre visuelle.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL FOR ULTRA-HD CHARACTER PREVIEW */}
      {lightboxCharacterIndex !== null && currentLightboxChar && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  {currentLightboxChar.characterCode || `CHR_${currentLightboxChar.id.slice(-3)}`}
                </span>
                <h4 className="font-serif font-bold text-slate-100 text-lg">
                  {currentLightboxChar.name}
                </h4>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  ({lightboxCharacterIndex + 1} / {characters.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Reprendre / Régénérer in Lightbox */}
                <button
                  onClick={() => handleGeneratePortrait(currentLightboxChar)}
                  disabled={isGeneratingPortrait === currentLightboxChar.id}
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Reprendre et régénérer le portrait"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingPortrait === currentLightboxChar.id ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {isGeneratingPortrait === currentLightboxChar.id ? 'Génération...' : 'Reprendre'}
                  </span>
                </button>

                {/* Download Button in Lightbox */}
                {(currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl) && (
                  <button
                    onClick={() =>
                      handleDownloadImage(
                        currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl || '',
                        currentLightboxChar.name
                      )
                    }
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Télécharger en résolution HD"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Télécharger</span>
                  </button>
                )}

                {/* Open in new tab */}
                {(currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl) && (
                  <button
                    onClick={() =>
                      window.open(
                        currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl,
                        '_blank'
                      )
                    }
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                    title="Ouvrir l'image originale"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {/* Delete in lightbox */}
                {(currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl) && (
                  <button
                    onClick={() => {
                      handleDeletePortrait(currentLightboxChar);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-rose-300 hover:text-white transition-all"
                    title="Supprimer cette photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setLightboxCharacterIndex(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Stage with Previous / Next Arrows */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-6 min-h-[350px]">
              {/* Prev button */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-800 backdrop-blur-md transition-all shadow-xl"
                title="Personnage précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Character Image */}
              {(currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl) ? (
                <img
                  src={currentLightboxChar.referenceImageUrl || currentLightboxChar.avatarUrl}
                  alt={currentLightboxChar.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-2xl border border-slate-800 shadow-2xl"
                />
              ) : (
                <div className="text-center text-slate-500 space-y-2">
                  <Users className="w-16 h-16 mx-auto text-slate-700" />
                  <p className="text-sm">Aucun portrait généré pour ce personnage</p>
                </div>
              )}

              {/* Next button */}
              <button
                onClick={handleNextLightbox}
                className="absolute right-4 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-800 backdrop-blur-md transition-all shadow-xl"
                title="Personnage suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Footer with Anchor Details & Actions */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <p className="text-xs text-amber-300 font-mono line-clamp-1">
                  <strong>Ancre :</strong> {currentLightboxChar.visualAnchor}
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentLightboxChar.age} • {currentLightboxChar.gender} {currentLightboxChar.ethnicity ? `• ${currentLightboxChar.ethnicity}` : ''} • {currentLightboxChar.hair} • {currentLightboxChar.clothingStyle}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Reprendre / Régénérer in Lightbox */}
                <button
                  onClick={() => handleGeneratePortrait(currentLightboxChar)}
                  disabled={isGeneratingPortrait === currentLightboxChar.id}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                  title="Reprendre le portrait"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPortrait === currentLightboxChar.id ? 'animate-spin' : ''}`} />
                  <span>Reprendre / Régénérer</span>
                </button>

                <button
                  onClick={() => {
                    handleSelectCharacter(currentLightboxChar);
                    setLightboxCharacterIndex(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  Ouvrir la fiche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
