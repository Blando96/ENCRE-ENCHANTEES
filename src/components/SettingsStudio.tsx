import React, { useState } from 'react';
import { ChapterProject, CinematicStyle, UserProfile, VideoGenerationModel } from '../types';
import { CINESCRYPTE_LOGO_URL } from '../assets/logo';
import {
  Settings,
  Zap,
  Key,
  Sliders,
  CheckCircle2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Globe,
  Film,
  User,
  LogOut,
  UserCheck,
  Phone,
  Mail,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Video,
  Activity
} from 'lucide-react';

interface SettingsStudioProps {
  project: ChapterProject;
  onUpdateStyle?: (style: CinematicStyle) => void;
  onUpdateAspectRatio?: (ratio: '16:9' | '9:16' | '4:3') => void;
  onUpdateDirectorConsignes?: (consignes: string) => void;
  onUpdatePreferredVideoModel?: (model: VideoGenerationModel) => void;
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onNavigateToPricing?: () => void;
  onOpenResetModal?: () => void;
}

export const SettingsStudio: React.FC<SettingsStudioProps> = ({
  project,
  onUpdateStyle,
  onUpdateAspectRatio,
  onUpdateDirectorConsignes,
  onUpdatePreferredVideoModel,
  user,
  onOpenAuthModal,
  onLogout,
  onNavigateToPricing,
  onOpenResetModal,
}) => {
  const [activeStyle, setActiveStyle] = useState<CinematicStyle>(project.artStyle || 'ultra_realism');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '4:3'>(project.aspectRatio || '16:9');
  const [consignesText, setConsignesText] = useState<string>(project.directorConsignes || '');
  const [videoModel, setVideoModel] = useState<VideoGenerationModel>(project.preferredVideoModel || 'seedance_2_5');

  const styles: { id: CinematicStyle; name: string; desc: string }[] = [
    { id: 'ultra_realism', name: 'Ultra-Réalisme Photographique', desc: 'Grain cinéma 35mm, éclairage naturel et textures hyper-détaillées.' },
    { id: 'cinema_35mm', name: 'Cinéma classique Panavision 35mm', desc: 'Rendu argentique, contrastes profonds et bokeh prononcé.' },
    { id: 'dark_noir', name: 'Dark Noir & Thriller Gothique', desc: 'Ombres rasant, atmosphère pluvieuse, lumière Rembrandt.' },
    { id: 'cyberpunk', name: 'Futuriste / Cyberpunk', desc: 'Néons humides, reflets chromés et ambiances nocturnes.' },
    { id: 'historical_epic', name: 'Épique Historique / Années 1920', desc: 'Couleurs sépia chaudes, velours et décor ancien.' }
  ];

  const videoModels: { id: VideoGenerationModel; name: string; desc: string; badge: string; isRecommended?: boolean }[] = [
    { 
      id: 'seedance_2_5', 
      name: 'Seedance 2.5 Pro Ultra-Sync', 
      desc: 'Synchronisation labiale millimétrique (Lip-Sync), phonèmes exacts, 60 FPS et micro-expressions faciales.',
      badge: '★ RECOMMANDÉ • SYNCHRO PARFAITE',
      isRecommended: true
    },
    { 
      id: 'ultramotion', 
      name: 'UltraMotion 2.1', 
      desc: 'Mouvements de caméra cinématographiques fluides (travelling, pano, zoom dynamique).',
      badge: 'Caméra & Décor'
    },
    { 
      id: 'lipsync', 
      name: 'LipSync Pro Studio', 
      desc: 'Synchronisation de bouche basique pour scènes de dialogue.',
      badge: 'Dialogues'
    },
    { 
      id: 'photoreal', 
      name: 'Photoreal Flow 4K', 
      desc: 'Haute fidélité des textures environnementales et des éclairages.',
      badge: 'Textures 4K'
    }
  ];

  const handleStyleSelect = (style: CinematicStyle) => {
    setActiveStyle(style);
    if (onUpdateStyle) onUpdateStyle(style);
  };

  const handleRatioSelect = (ratio: '16:9' | '9:16' | '4:3') => {
    setAspectRatio(ratio);
    if (onUpdateAspectRatio) onUpdateAspectRatio(ratio);
  };

  const handleVideoModelSelect = (model: VideoGenerationModel) => {
    setVideoModel(model);
    if (onUpdatePreferredVideoModel) onUpdatePreferredVideoModel(model);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 p-0.5 border border-amber-500/40 shadow-lg shadow-amber-500/20 shrink-0">
              <img
                src={CINESCRYPTE_LOGO_URL}
                alt="CINESCRYPTE IA Logo"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Paramètres Studio & Compte CINESCRYPTE IA
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Gestion de votre inscription Google / Apple, crédits IA, clés d'API et formats de rendu.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Plan Studio Pro 4K</span>
        </div>
      </div>

      {/* Grid: Left AI Style Presets, Right User Account & AI Credits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Style & Aspect Ratio Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Director Consignes & AI Directives Card */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Consignes & Directives du Réalisateur pour l'IA</span>
              </h2>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
                Contrôlable par Chat
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Saisissez ou dites au Chat vos consignes spécifiques (ex: ton de narration, atmosphère visuelle, ambiance sonore, cadrages préférés). L'IA en tiendra compte dans tous les découpages et générations.
            </p>

            <div className="space-y-3">
              <textarea
                value={consignesText}
                onChange={(e) => {
                  setConsignesText(e.target.value);
                  if (onUpdateDirectorConsignes) onUpdateDirectorConsignes(e.target.value);
                }}
                placeholder="Exemple: Privilégier une atmosphère sombre et mystérieuse, voix off poétique, éclairage Rembrandt en clairs-obscurs..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (onUpdateDirectorConsignes) onUpdateDirectorConsignes(consignesText);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enregistrer les Consignes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cinematic Art Style Preset */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Style Artistique Cinématographique Défaut</span>
            </h2>

            <div className="space-y-3">
              {styles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleStyleSelect(s.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    activeStyle === s.id
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-serif font-bold text-sm text-amber-300">{s.name}</span>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>

                  {activeStyle === s.id && (
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Ratio d'Aspect & Cadrage</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRatioSelect('16:9')}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                16:9 Horizontal (Cinéma / YT)
              </button>
              <button
                onClick={() => handleRatioSelect('9:16')}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                9:16 Vertical (TikTok / Reels)
              </button>
              <button
                onClick={() => handleRatioSelect('4:3')}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                  aspectRatio === '4:3'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                4:3 Rétro Classic
              </button>
            </div>
          </div>

          {/* Moteur Vidéo & Synchronisation par Défaut (Seedance 2.5) */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" />
                <span>Moteur de Rendu Vidéo & Synchronisation</span>
              </h2>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Lip-Sync 4K</span>
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Choisissez le moteur IA principal pour animer les plans et synchroniser les dialogues des personnages.
            </p>

            <div className="space-y-3">
              {videoModels.map((vm) => (
                <div
                  key={vm.id}
                  onClick={() => handleVideoModelSelect(vm.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    videoModel === vm.id
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-amber-300">{vm.name}</span>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {vm.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{vm.desc}</p>
                  </div>

                  {videoModel === vm.id && (
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: User Account Card, AI Credits & API Keys */}
        <div className="space-y-6">
          
          {/* USER ACCOUNT & INSCRIPTION STATUS CARD */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Compte & Inscription OAuth</span>
            </h2>

            {user ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/50 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-base shrink-0">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1 overflow-hidden">
                    <p className="font-serif font-bold text-slate-100 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-amber-300 font-mono font-semibold flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span>Contacts : {user.phone}</span>
                      </p>
                    )}
                    
                    <div className="pt-1 flex items-center gap-2">
                      {user.provider === 'google' && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold border border-blue-500/30 flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                          </svg>
                          Connecté via Google / Gmail
                        </span>
                      )}
                      {user.provider === 'apple' && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-mono font-bold border border-slate-700 flex items-center gap-1">
                          <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 170 170">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.74-1.93-14.76-6.19-3.23-2.73-7.1-7.37-11.61-13.91-6.12-8.73-10.99-18.42-14.61-29.07-3.62-10.65-5.43-21.2-5.43-31.65 0-14.07 3.51-25.79 10.53-35.15 7.02-9.36 15.82-14.16 26.4-14.4 4.58 0 9.87 1.25 15.88 3.75 6.01 2.5 10.12 3.75 12.33 3.75 1.77 0 6.04-1.32 12.82-3.96 6.78-2.64 12.19-3.83 16.23-3.57 11.83.97 21.05 5.28 27.67 12.93-10.62 6.42-15.8 15.42-15.54 27 0 10.02 3.86 18.29 11.58 24.81 7.72 6.52 16.92 10.12 27.6 10.8-2.31 6.81-5.32 13.62-9.03 20.43zM119.22 31.84c0-7.35 2.65-14.47 7.95-21.36 5.3-6.89 12.03-10.87 20.19-11.94.13 1.03.19 1.94.19 2.73 0 7.37-2.73 14.62-8.19 21.75-5.46 7.13-12.18 11.13-20.14 12-0.08-.85-.12-1.92-.12-3.18z" />
                          </svg>
                          Connecté via Apple ID
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onOpenAuthModal}
                    className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700"
                  >
                    Changer de Compte
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-1/2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-all border border-rose-500/20 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vous n'êtes actuellement pas connecté à un compte NOVELIA. Inscrivez-vous avec Google, Gmail ou Apple pour sauvegarder vos données.
                </p>
                <button
                  onClick={onOpenAuthModal}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  Inscription Google / Apple ID
                </button>
              </div>
            )}
          </div>

          {/* AI Credits Card */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Crédits de Génération</span>
              </h2>
              <span className="text-xs font-mono font-bold text-amber-400">2,550 / 5,000</span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: '51%' }} />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Vos crédits se réinitialisent automatiquement le 1er de chaque mois.
            </p>

            <button
              onClick={onNavigateToPricing}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
            >
              Voir les Plans d'Abonnement & Recharger
            </button>
          </div>

          {/* ZONE DE DANGER / NETTOYAGE GENERAL DE L'ETUDE */}
          <div className="bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-red-500/40 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-red-300 text-base flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              <span>Nettoyage & Réinitialisation de l'Étude ↺</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              En cas d'erreur générale ou si vous souhaitez recommencer l'analyse de votre roman sur de nouvelles bases, vous pouvez nettoyer les prompts générés ou réinitialiser le projet.
            </p>

            {onOpenResetModal && (
              <button
                type="button"
                onClick={onOpenResetModal}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-slate-950" />
                <span>Balayer les Prompts & Réinitialiser l'Analyse à 0</span>
              </button>
            )}
          </div>

          {/* Gemini API Key Integration */}
          <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Clé API Gemini System</span>
            </h2>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>GEMINI_API_KEY Active</span>
              </span>
              <span className="text-[10px] text-slate-500 font-sans">Injectée v2.4.0</span>
            </div>

            <p className="text-xs text-slate-400">
              Traitement côté serveur sécurisé pour les modèles de génération Gemini AI Studio.
            </p>
          </div>

          {/* Contact & Assistance Studio */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-6 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Contact & Assistance Studio</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Email de Contact :</p>
                  <p className="font-mono text-slate-200 font-bold">lensorceleuse2@gmail.com</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Lignes Directes / Whatsapp :</p>
                  <p className="font-mono text-amber-300 font-bold">+229 53 30 21 75 &bull; +229 01 67 43 03 81</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
