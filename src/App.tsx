/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChapterProject, Character, Scene, NavTab, UserProfile } from './types';
import { DEFAULT_PROJECT } from './data/defaultProject';
import { db } from './lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { Sparkles, Film, Users, Check, X, Radio, Share2, Crown, RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NovelImporter } from './components/NovelImporter';
import { NovelAnalysis } from './components/NovelAnalysis';
import { CharacterStudio } from './components/CharacterStudio';
import { LocationStudio } from './components/LocationStudio';
import { SceneDecomposition } from './components/SceneDecomposition';
import { StoryboardStudio } from './components/StoryboardStudio';
import { VideoGenerator } from './components/VideoGenerator';
import { AudioStudio } from './components/AudioStudio';
import { TimelineStudio } from './components/TimelineStudio';
import { CoherenceGuard } from './components/CoherenceGuard';
import { FilmCatalog } from './components/FilmCatalog';
import { AssetLibrary } from './components/AssetLibrary';
import { ExportStudio } from './components/ExportStudio';
import { SettingsStudio } from './components/SettingsStudio';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AuthModal } from './components/AuthModal';
import { AIDirectorChat } from './components/AIDirectorChat';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // User profile state initialized with saved profile or Google default
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('novelia_ai_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // Default initialized Google user
    return {
      id: 'usr_google_default',
      name: 'Lensorceleuse',
      email: 'lensorceleuse2@gmail.com',
      phone: '+229 53 30 21 75 / 01 67 43 03 81',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      provider: 'google',
      plan: 'Studio Pro 4K (Google)',
      createdAt: new Date().toISOString()
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [project, setProject] = useState<ChapterProject>(() => {
    const saved = localStorage.getItem('novelia_ai_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved project:', e);
      }
    }
    return DEFAULT_PROJECT;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [initialPlayerSceneIndex, setInitialPlayerSceneIndex] = useState(0);
  const [inviteNotice, setInviteNotice] = useState<{ isInvite: boolean; inviterName: string } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Clear generated prompts, characters, scenes while keeping raw novel text & title
  const handleClearGeneratedPromptsAndCache = () => {
    setProject((prev) => {
      if (!prev) return prev;
      const cleanedProject: ChapterProject = {
        ...prev,
        characters: [],
        locations: [],
        scenes: [],
        scenesDecomposition: [],
        generatedFilms: [],
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('novelia_ai_project', JSON.stringify(cleanedProject));
      setDoc(doc(db, 'projects', cleanedProject.id), cleanedProject, { merge: true }).catch(console.warn);
      setDoc(doc(db, 'projects', 'default_project'), cleanedProject, { merge: true }).catch(console.warn);
      return cleanedProject;
    });
    setIsResetModalOpen(false);
    setResetNotice('🧹 Tous les prompts, personnages et découpages ont été nettoyés ! L\'étude du roman peut reprendre à zéro.');
    setTimeout(() => setResetNotice(null), 8000);
    setActiveTab('novels');
  };

  // Full reset back to a clean blank slate
  const handleFullResetToZero = () => {
    const blankProject: ChapterProject = {
      id: `proj_${Date.now()}`,
      title: 'Nouveau Roman À Scénariser',
      author: user?.name || 'Auteur',
      genre: 'Cinéma / Drame',
      summary: '',
      rawText: '',
      prologueText: '',
      artStyle: 'ultra_realism',
      aspectRatio: '16:9',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      characters: [],
      locations: [],
      scenes: [],
      generatedFilms: []
    };
    setProject(blankProject);
    localStorage.setItem('novelia_ai_project', JSON.stringify(blankProject));
    setDoc(doc(db, 'projects', blankProject.id), blankProject, { merge: true }).catch(console.warn);
    setDoc(doc(db, 'projects', 'default_project'), blankProject, { merge: true }).catch(console.warn);
    setIsResetModalOpen(false);
    setResetNotice('🗑️ Le projet a été totalement réinitialisé à zéro ! Vous pouvez importer un nouveau roman.');
    setTimeout(() => setResetNotice(null), 8000);
    setActiveTab('novels');
  };

  // Detect Share / Invite Link URL parameters on Mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isInvite = searchParams.get('invite') === 'true';
      const inviterName = searchParams.get('invitedBy') || 'Promoteur CINESCRYPTE IA';
      if (isInvite || searchParams.has('invitedBy')) {
        setInviteNotice({
          isInvite: true,
          inviterName: decodeURIComponent(inviterName)
        });
      }
    } catch (e) {
      console.warn('URL invite check notice:', e);
    }
  }, []);

  // Real-time Firestore Load & Live Multi-User Synchronization on Mount
  useEffect(() => {
    async function loadUserFromFirestore() {
      if (user?.id) {
        try {
          const userDocRef = doc(db, 'users', user.id);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          }
        } catch (e) {
          console.warn('User firestore sync notice:', e);
        }
      }
    }
    loadUserFromFirestore();

    // Subscribe to live updates for the project in Firestore
    const projDocRef = doc(db, 'projects', 'default_project');
    const unsubscribe = onSnapshot(projDocRef, (snap) => {
      if (snap.exists()) {
        const remoteProject = snap.data() as ChapterProject;
        setProject((prev) => {
          if (!prev) return remoteProject;
          // Sync if remote is strictly newer than current local project
          if (remoteProject.updatedAt && prev.updatedAt && remoteProject.updatedAt > prev.updatedAt) {
            return remoteProject;
          }
          return prev;
        });
      }
    }, (err) => console.warn('Firestore live listener notice:', err));

    return () => unsubscribe();
  }, []);

  // Save project to localStorage & Firestore
  useEffect(() => {
    if (project) {
      localStorage.setItem('novelia_ai_project', JSON.stringify(project));
      const payload = {
        ...project,
        updatedAt: project.updatedAt || new Date().toISOString()
      };

      // Save under project.id
      setDoc(doc(db, 'projects', project.id || 'default_project'), payload, { merge: true })
        .catch((err) => console.warn('Firestore project sync notice:', err));

      // Always sync to default_project so live viewers and reloads get the active novel
      if (project.id !== 'default_project') {
        setDoc(doc(db, 'projects', 'default_project'), payload, { merge: true })
          .catch((err) => console.warn('Firestore default_project sync notice:', err));
      }
    }
  }, [project]);

  // Save user session to localStorage & Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem('novelia_ai_user', JSON.stringify(user));
      setDoc(doc(db, 'users', user.id), {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => console.warn('Firestore user sync notice:', err));
    } else {
      localStorage.removeItem('novelia_ai_user');
    }
  }, [user]);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleUpdateUserPlan = (newPlanName: string) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        plan: newPlanName
      };
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleProjectCreated = (newProject: ChapterProject) => {
    const timestampedProject = {
      ...newProject,
      updatedAt: new Date().toISOString()
    };
    setProject(timestampedProject);
    localStorage.setItem('novelia_ai_project', JSON.stringify(timestampedProject));

    // Force immediate sync to Firestore default_project & project ID
    setDoc(doc(db, 'projects', timestampedProject.id), timestampedProject, { merge: true }).catch(console.warn);
    setDoc(doc(db, 'projects', 'default_project'), timestampedProject, { merge: true }).catch(console.warn);

    // Switch active tab to 'ai_analysis' (Analyse & Decoupage)
    setActiveTab('ai_analysis');
  };

  const handleUpdateCharacter = (updatedChar: Character) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        characters: (prev.characters || []).map((c) => (c.id === updatedChar.id ? updatedChar : c)),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleAddCharacter = (newChar: Character) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        characters: [...(prev.characters || []), newChar],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeleteCharacter = (characterId: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        characters: (prev.characters || []).filter((c) => c.id !== characterId),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: (prev.scenes || []).map((s) => (s.id === updatedScene.id ? updatedScene : s)),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handlePlaySceneInPlayer = (sceneIndex: number) => {
    setInitialPlayerSceneIndex(sceneIndex);
    setActiveTab('my_films');
  };

  const handleUpdateProjectFields = (updatedFields: Partial<ChapterProject>) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-amber-500 selection:text-black flex flex-col justify-between">
      <div>
        {/* Top Application Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projectTitle={project?.title}
          hasProject={!!project}
          sceneCount={project?.scenes?.length || 0}
          characterCount={project?.characters?.length || 0}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenResetModal={() => setIsResetModalOpen(true)}
        />

        {/* RESET NOTIFICATION BANNER */}
        {resetNotice && (
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 text-slate-950 px-4 py-3 shadow-2xl flex items-center justify-between gap-4 border-b border-emerald-300/40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 max-w-5xl mx-auto">
              <div className="p-2 rounded-xl bg-slate-950/20 text-slate-950 font-bold shrink-0">
                <RotateCcw className="w-5 h-5 animate-spin-once" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-950 leading-tight">
                {resetNotice}
              </p>
            </div>
            <button
              onClick={() => setResetNotice(null)}
              className="p-1.5 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 font-bold transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* INVITATION LINK VIP BANNER */}
        {inviteNotice && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 px-4 py-3 shadow-2xl flex items-center justify-between gap-4 border-b border-amber-300/40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 max-w-5xl mx-auto">
              <div className="p-2 rounded-xl bg-slate-950/20 text-slate-950 font-bold shrink-0">
                <Crown className="w-5 h-5 animate-bounce" />
              </div>
              <div className="text-xs sm:text-sm font-medium leading-tight">
                <p className="font-serif font-black text-slate-950 text-sm sm:text-base flex items-center gap-2">
                  <span>Invitation VIP Reçue !</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-[10px] font-bold uppercase">
                    Projet Partagé
                  </span>
                </p>
                <p className="text-slate-900 mt-0.5">
                  Vous avez été invité(e) par <strong className="underline decoration-slate-950">{inviteNotice.inviterName}</strong> à collaborer et visionner le film : <strong className="font-serif">"{project?.title || 'CinéScript IA'}"</strong>. La synchronisation Firestore est active en direct !
                </p>
              </div>
            </div>

            <button
              onClick={() => setInviteNotice(null)}
              className="p-1.5 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 font-bold transition-all shrink-0"
              title="Fermer cette notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Compartments Router */}
        <main className="px-4 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <Dashboard project={project} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'novels' && (
            <NovelImporter
              project={project}
              onProjectCreated={handleProjectCreated}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              loadingStep={loadingStep}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}

          {activeTab === 'ai_analysis' && (
            <NovelAnalysis
              project={project}
              setActiveTab={setActiveTab}
              onUpdateProject={setProject}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}

          {activeTab === 'characters' && (
            <CharacterStudio
              characters={project?.characters || []}
              onUpdateCharacter={handleUpdateCharacter}
              onAddCharacter={handleAddCharacter}
              onDeleteCharacter={handleDeleteCharacter}
              artStyle={project?.artStyle || 'ultra_realism'}
            />
          )}

          {activeTab === 'locations' && (
            <LocationStudio
              project={project}
              setActiveTab={setActiveTab}
              onUpdateLocations={(updatedLocs) => {
                setProject((prev) => prev ? ({ ...prev, locations: updatedLocs, updatedAt: new Date().toISOString() }) : null);
              }}
            />
          )}

          {activeTab === 'scenes' && (
            <SceneDecomposition
              project={project}
              setActiveTab={setActiveTab}
              onUpdateScenes={(updatedScenes) => {
                setProject((prev) => prev ? ({ ...prev, scenes: updatedScenes, updatedAt: new Date().toISOString() }) : null);
              }}
            />
          )}

          {activeTab === 'storyboard' && (
            <StoryboardStudio
              scenes={project.scenes}
              characters={project.characters}
              artStyle={project.artStyle}
              aspectRatio={project.aspectRatio}
              onUpdateScene={handleUpdateScene}
              onPlaySceneInPlayer={handlePlaySceneInPlayer}
            />
          )}

          {activeTab === 'video_generator' && (
            <VideoGenerator 
              project={project} 
              setActiveTab={setActiveTab} 
              onUpdateProject={setProject}
            />
          )}

          {activeTab === 'audio_studio' && (
            <AudioStudio project={project} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'timeline_editor' && (
            <TimelineStudio project={project} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'coherence_guard' && (
            <CoherenceGuard
              project={project}
              setActiveTab={setActiveTab}
              onUpdateProject={setProject}
            />
          )}

          {activeTab === 'my_films' && (
            <FilmCatalog project={project} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'asset_library' && (
            <AssetLibrary project={project} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'export' && (
            <ExportStudio project={project} />
          )}

          {activeTab === 'pricing' && (
            <SubscriptionPlans
              user={user}
              onUpdateUserPlan={handleUpdateUserPlan}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsStudio
              project={project}
              onUpdateStyle={(style) => handleUpdateProjectFields({ artStyle: style })}
              onUpdateAspectRatio={(ratio) => handleUpdateProjectFields({ aspectRatio: ratio })}
              onUpdateDirectorConsignes={(consignes) => handleUpdateProjectFields({ directorConsignes: consignes })}
              onUpdatePreferredVideoModel={(model) => handleUpdateProjectFields({ preferredVideoModel: model })}
              user={user}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
              onNavigateToPricing={() => setActiveTab('pricing')}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Reset & Clean Prompts Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                  <RotateCcw className="w-6 h-6 animate-spin-once" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-slate-100">
                    Nettoyage & Réinitialisation de l'Étude
                  </h2>
                  <p className="text-xs text-slate-400">
                    Reprenez l'analyse cinématographique de votre roman sur de nouvelles bases propres.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Clean prompts & cache only */}
              <div
                className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-3 group cursor-pointer"
                onClick={handleClearGeneratedPromptsAndCache}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                    Option Recommandée
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-serif font-bold text-base text-amber-200">
                  🧹 1. Balayer tous les prompts & Régénérer à 0
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conserve votre <strong>texte brut de roman</strong>, le titre et l'auteur, mais <strong>efface tous les prompts visuels, personnages, scènes, voix off et clips vidéo générés</strong> pour relancer une étude propre sans erreur.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearGeneratedPromptsAndCache();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-slate-950" />
                  <span>Nettoyer les Prompts & Garder le Texte du Roman</span>
                </button>
              </div>

              {/* Option 2: Full reset back to zero */}
              <div
                className="p-5 rounded-2xl bg-slate-950 border border-red-500/30 hover:border-red-500/60 transition-all space-y-3 group cursor-pointer"
                onClick={handleFullResetToZero}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold uppercase">
                    Effacement Total
                  </span>
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-serif font-bold text-base text-red-300">
                  🗑️ 2. Réinitialiser Tout le Projet à 0 (Nouveau Roman)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Efface intégralement le roman actuel et toutes ses données pour vous permettre d'importer un <strong>tout nouveau livre ou chapitre</strong>.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullResetToZero();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-slate-950" />
                  <span>Tout Réinitialiser à Zéro (Effacer Roman)</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Annuler / Conserver le projet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal (Google / Gmail & Apple ID Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        currentUser={user}
      />

      {/* Floating AI Director Chat & Prompt Copilot */}
      <AIDirectorChat
        project={project}
        onUpdateProject={handleUpdateProjectFields}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSetWorkScope={(scope) => {
          setActiveTab('import');
        }}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p>CINESCRYPTE IA • Du Roman au Film Cinématographique 4K avec Verrouillage de Cohérence Visuelle des Personnages</p>
        <p className="font-mono text-[11px] text-slate-400">
          Contact : <span className="text-amber-400">lensorceleuse2@gmail.com</span> &bull; Tel / WhatsApp : <span className="text-amber-300">+229 53 30 21 75 / 01 67 43 03 81</span>
        </p>
      </footer>
    </div>
  );
}
