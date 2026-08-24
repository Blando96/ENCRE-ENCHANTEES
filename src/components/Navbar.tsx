import React, { useState } from 'react';
import { NavTab, UserProfile } from '../types';
import { CINESCRYPTE_LOGO_URL } from '../assets/logo';
import {
  Film,
  LayoutDashboard,
  BookOpen,
  Brain,
  Users,
  Compass,
  Clapperboard,
  Video,
  Mic,
  Sliders,
  ShieldAlert,
  FolderKanban,
  Download,
  Settings,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Crown,
  Share2,
  UserPlus,
  Check,
  Radio,
  X,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  projectTitle?: string;
  hasProject: boolean;
  sceneCount: number;
  characterCount: number;
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onOpenResetModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  projectTitle,
  hasProject,
  sceneCount,
  characterCount,
  user,
  onOpenAuthModal,
  onLogout,
  onOpenResetModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [shareModalUrl, setShareModalUrl] = useState<string | null>(null);

  const handleShareInvite = () => {
    const inviterName = user?.name || 'Promoteur CINESCRYPTE';
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?invite=true&invitedBy=${encodeURIComponent(inviterName)}`;
    
    setShareModalUrl(shareUrl);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 3000);
      }
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }
  };

  const mainModules: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'novels', label: 'Mes Romans', icon: BookOpen },
    { id: 'ai_analysis', label: 'Analyse IA', icon: Brain },
    { id: 'characters', label: 'Personnages', icon: Users },
    { id: 'locations', label: 'Décors', icon: Compass },
    { id: 'scenes', label: 'Scènes', icon: Clapperboard },
    { id: 'storyboard', label: 'Storyboard', icon: Film },
    { id: 'video_generator', label: 'Génération Vidéo', icon: Video },
    { id: 'audio_studio', label: 'Studio Audio', icon: Mic },
    { id: 'timeline_editor', label: 'Montage', icon: Sliders },
    { id: 'coherence_guard', label: 'Cohérence IA', icon: ShieldAlert },
    { id: 'my_films', label: 'Mes Films', icon: Film },
    { id: 'asset_library', label: 'Bibliothèque', icon: FolderKanban },
    { id: 'export', label: 'Exportation', icon: Download },
    { id: 'pricing', label: 'Abonnements', icon: Crown },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-amber-500/20 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="cursor-pointer flex items-center gap-3 group"
            >
              {/* 3D Application Pop Logo Box */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-950 p-0.5 border border-amber-500/40 shadow-xl shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-400 transition-all overflow-hidden ring-2 ring-amber-500/10">
                <img
                  src={CINESCRYPTE_LOGO_URL}
                  alt="CINESCRYPTE IA Logo"
                  className="w-full h-full object-cover rounded-xl shadow-inner"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0c] shadow-md" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                    CINESCRYPTE IA
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Pro Cinema 4K
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                  Du roman au film cinématographique avec cohérence des personnages
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Actions: Project Badge & User Auth Selector */}
          <div className="flex items-center gap-3">
            {projectTitle && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-serif font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="truncate max-w-[180px]">{projectTitle}</span>
              </div>
            )}

            {/* SHARE / INVITE LINK BUTTON */}
            <button
              onClick={handleShareInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-md group shrink-0"
              title="Copier le lien d'invitation pour collaborer sur ce projet en temps réel"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Lien d'invitation copié !</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Inviter / Partager</span>
                  <span className="sm:hidden">Partager</span>
                </>
              )}
            </button>

            {/* RESET / CLEAR ALL PROMPTS & RESTART STUDY BUTTON */}
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-all shadow-md group shrink-0"
                title="Balayer les prompts & Réinitialiser l'étude du roman à 0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400 group-hover:-rotate-90 transition-transform" />
                <span className="hidden lg:inline">Nettoyer / Réinitialiser ↺</span>
                <span className="lg:hidden">Reset ↺</span>
              </button>
            )}

            {/* USER PROFILE OR AUTH SIGN-IN BUTTON */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-md"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-amber-500/50"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <span className="font-bold truncate max-w-[120px]">{user.name}</span>

                  {/* Provider icon badge */}
                  {user.provider === 'google' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-mono font-bold flex items-center gap-1 border border-blue-500/30">
                      Google
                    </span>
                  )}
                  {user.provider === 'apple' && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white text-[9px] font-mono font-bold flex items-center gap-1 border border-slate-600">
                      Apple
                    </span>
                  )}

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 space-y-3 animate-in fade-in duration-150">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <p className="font-serif font-bold text-slate-200 text-xs truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-amber-400 font-bold">
                        <span>{user.plan}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('pricing');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2 font-medium"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Abonnements & Tarifs</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800 flex items-center gap-2 font-medium"
                      >
                        <Settings className="w-4 h-4 text-amber-400" />
                        <span>Paramètres du Compte</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onLogout) onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Se Déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
              >
                {/* Google and Apple micro icons */}
                <div className="flex items-center -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center p-0.5 border border-slate-300 shadow-sm">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                    </svg>
                  </span>
                  <span className="w-4 h-4 rounded-full bg-black flex items-center justify-center p-0.5 border border-slate-700 shadow-sm">
                    <svg className="w-2.5 h-2.5 fill-current text-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.74-1.93-14.76-6.19-3.23-2.73-7.1-7.37-11.61-13.91-6.12-8.73-10.99-18.42-14.61-29.07-3.62-10.65-5.43-21.2-5.43-31.65 0-14.07 3.51-25.79 10.53-35.15 7.02-9.36 15.82-14.16 26.4-14.4 4.58 0 9.87 1.25 15.88 3.75 6.01 2.5 10.12 3.75 12.33 3.75 1.77 0 6.04-1.32 12.82-3.96 6.78-2.64 12.19-3.83 16.23-3.57 11.83.97 21.05 5.28 27.67 12.93-10.62 6.42-15.8 15.42-15.54 27 0 10.02 3.86 18.29 11.58 24.81 7.72 6.52 16.92 10.12 27.6 10.8-2.31 6.81-5.32 13.62-9.03 20.43zM119.22 31.84c0-7.35 2.65-14.47 7.95-21.36 5.3-6.89 12.03-10.87 20.19-11.94.13 1.03.19 1.94.19 2.73 0 7.37-2.73 14.62-8.19 21.75-5.46 7.13-12.18 11.13-20.14 12-0.08-.85-.12-1.92-.12-3.18z" />
                    </svg>
                  </span>
                </div>
                <span>Inscription Google / Apple</span>
              </button>
            )}

            {/* Mobile All Modules Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>15 Compartiments</span>
              <ChevronDown className="w-4 h-4 text-amber-400" />
            </button>
          </div>

        </div>

        {/* Modules Sub-Navbar Grid */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/80">
          {mainModules.map((m) => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;

            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveTab(m.id);
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
                {m.id === 'characters' && characterCount > 0 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                    {characterCount}
                  </span>
                )}
                {m.id === 'scenes' && sceneCount > 0 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                    {sceneCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* SHARE LINK MODAL POPUP */}
        {shareModalUrl && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-lg">
                  <Share2 className="w-5 h-5 text-amber-400" />
                  <span>Publier & Partager le Film</span>
                </div>
                <button
                  onClick={() => setShareModalUrl(null)}
                  className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Voici le lien public d'invitation de votre projet CinéScript. Toute personne ouvrant ce lien verra votre film et le script en direct synchronisé sur Firestore !
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                  Lien Public d'Invitation VIP :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareModalUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(shareModalUrl);
                        setCopiedShareLink(true);
                      } catch (e) {
                        console.warn(e);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
                  >
                    {copiedShareLink ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{copiedShareLink ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                <span>Base Firestore synchronisée en temps réel pour tous vos invités.</span>
              </div>

              <button
                onClick={() => setShareModalUrl(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
