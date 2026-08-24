export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  provider: 'google' | 'apple' | 'email';
  plan: string;
  createdAt: string;
}

export interface FaceReference {
  angle: 'frontal' | 'three_quarter_left' | 'three_quarter_right' | 'profile' | 'expressions';
  label: string;
  imageUrl: string;
}

export interface Character {
  id: string;
  characterCode: string; // e.g. LIS_001
  name: string;
  age: string;
  gender: string;
  ethnicity?: string;
  skinTone?: string;
  hair: string;
  eyes: string;
  faceFeatures: string;
  clothingStyle: string;
  build: string;
  distinguishingMarks?: string;
  personalityTraits?: string;
  voiceStyle?: string;
  visualAnchor: string; // Exact physical prompt lock for image consistency
  avatarUrl?: string;
  referenceImageUrl?: string;
  faceReferences?: FaceReference[];
  role?: 'protagonist' | 'deuteragonist' | 'antagonist' | 'supporting';
}

export interface LocationDecor {
  id: string;
  name: string;
  type: string; // 'interieur' | 'exterieur' | 'nature' | 'urbain'
  description: string;
  era: string;
  architecture: string;
  lightingAtmosphere: string;
  imageUrl?: string;
  visualPrompt: string;
}

export type ShotType = 
  | 'plan_général' 
  | 'plan_moyen' 
  | 'gros_plan' 
  | 'très_gros_plan' 
  | 'plan_américain' 
  | 'champ_contrechamp' 
  | 'travelling' 
  | 'panoramique';

export type CameraMotion = 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'tilt_up' | 'dolly_zoom' | 'orbit';

export type MusicMood = 'suspense' | 'dramatic' | 'romantic' | 'action' | 'melancholic' | 'mysterious' | 'epic' | 'ambient';

export interface Shot {
  id: string;
  shotNumber: number;
  shotType: ShotType;
  actionDescription: string;
  characterIds: string[];
  cameraMotion: CameraMotion;
  duration: number; // seconds
  imagePrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  isGeneratingVideo?: boolean;
  dialogue?: string;
  voiceoverText: string;
  emotion: string;
  soundEffects: string;
  musicMood: MusicMood;
}

export interface DialogueLine {
  id?: string;
  characterName: string;
  text: string;
  emotion?: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  locationName?: string;
  locationId?: string;
  novelExcerpt: string;
  visualDescription: string;
  characterIds: string[];
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  videoUrl?: string;
  isGeneratingVideo?: boolean;
  voiceoverText: string;
  soundEffects: string;
  musicMood: MusicMood;
  cameraMotion: CameraMotion;
  duration: number; // in seconds (minimum 15s)
  audioUrl?: string;
  isGeneratingAudio?: boolean;
  timeOfDay?: string;
  weather?: string;
  dialogues?: DialogueLine[]; // AT LEAST 4 dialogues per scene
  shots?: Shot[];
}

export interface ContinuityAnomaly {
  id: string;
  shotNumber: number;
  sceneTitle: string;
  characterName: string;
  type: 'face_mismatch' | 'clothing_drift' | 'lighting_mismatch' | 'location_jump';
  severity: 'high' | 'medium' | 'low';
  message: string;
  status: 'detected' | 'resolved';
  autoFixSuggestion: string;
}

export interface GeneratedFilm {
  id: string;
  title: string;
  chapterTitle: string;
  durationFormatted: string;
  resolution: '1080p' | '4K';
  aspectRatio: '16:9' | '9:16' | '1:1';
  thumbnailUrl: string;
  videoUrl?: string;
  createdAt: string;
  status: 'ready' | 'rendering' | 'draft';
}

export interface AssetItem {
  id: string;
  type: 'character_face' | 'location' | 'video_clip' | 'audio_voice' | 'music' | 'sfx';
  name: string;
  previewUrl: string;
  category: string;
  createdAt: string;
  tags: string[];
}

export interface AICreditsInfo {
  total: number;
  used: number;
  remaining: number;
  planName: string;
}

export type CinematicStyle = 
  | 'ultra_realism'
  | 'cinema_35mm'
  | 'cinema_8k'
  | 'anime_manga'
  | 'dark_noir'
  | 'cyberpunk'
  | 'historical_epic'
  | 'gothic_fantasy'
  | 'dark_fantasy'
  | 'watercolor'
  | 'oil_painting'
  | 'futuristic_sf'
  | '3d_render';

export type VideoGenerationModel = 
  | 'seedance_2_5'
  | 'ultramotion'
  | 'lipsync'
  | 'photoreal'
  | 'turbo';

export interface ChapterProject {
  id: string;
  title: string;
  author?: string;
  genre: string;
  summary: string;
  directorConsignes?: string; // Custom instructions & directives set by user or chat
  preferredVideoModel?: VideoGenerationModel; // e.g. seedance_2_5
  prologueText?: string;
  rawText: string;
  characters: Character[];
  locations?: LocationDecor[];
  scenes: Scene[];
  continuityAnomalies?: ContinuityAnomaly[];
  generatedFilms?: GeneratedFilm[];
  artStyle: CinematicStyle;
  aspectRatio: '16:9' | '9:16' | '4:3';
  createdAt: string;
  updatedAt: string;
}

export interface GenerationProgress {
  status: 'idle' | 'parsing_novel' | 'extracting_characters' | 'generating_storyboard' | 'generating_images' | 'generating_audio' | 'complete' | 'error';
  step: string;
  progress: number;
  message?: string;
}

export interface SampleNovel {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  description: string;
  excerpt: string;
}

export type NavTab = 
  | 'dashboard'        // 1. Tableau de bord
  | 'novels'           // 2. Mes Romans
  | 'ai_analysis'      // 3. Analyse IA
  | 'characters'       // 4. Studio Personnages
  | 'locations'        // 5. Univers & Décors
  | 'scenes'           // 6. Découpage Scènes
  | 'storyboard'       // 7. Storyboard
  | 'video_generator'  // 8. Générateur Vidéo
  | 'audio_studio'     // 9. Studio Audio
  | 'timeline_editor'  // 10. Studio de Montage
  | 'coherence_guard'  // 11. Contrôle de Cohérence
  | 'my_films'         // 12. Mes Films
  | 'asset_library'    // 13. Bibliothèque
  | 'export'           // 14. Exportation
  | 'pricing'          // 15. Plans d'Abonnement
  | 'settings';        // 16. Paramètres & Compte

export function isPromoteurEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === 'mahounouvictor123@gmail.com' ||
    clean === 'mahounouvictor123@gmailcom' ||
    clean === 'lensorceleuse2@gmail.com'
  );
}
