import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, Bot, User, Copy, Check, ChevronDown, Wand2, Lightbulb, Film, SlidersHorizontal, Settings2, Compass, Layers, Palette, Monitor, Minimize2, RotateCcw, Trash2 } from 'lucide-react';
import { ChapterProject } from '../types';

interface AIDirectorChatProps {
  project?: ChapterProject | null;
  onUpdateProject?: (updatedFields: Partial<ChapterProject>) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onSetWorkScope?: (scope: 'both' | 'prologue_only' | 'chapter_only') => void;
  onOpenResetModal?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  executedActions?: string[];
}

export const AIDirectorChat: React.FC<AIDirectorChatProps> = ({
  project,
  onUpdateProject,
  activeTab = 'import',
  setActiveTab,
  onSetWorkScope,
  onOpenResetModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      text: `Bonjour ! Je suis votre **Assistant Réalisateur & Co-Pilote de Navigation IA**.

Vous pouvez piloter directement toute l'application en discutant avec moi ou en utilisant les paramètres ci-dessus !

⚡ **Exemples d'instructions directes :**
• *"Passe en style Manga Anime et format vertical 9:16"*
• *"Travaille uniquement sur le prologue"*
• *"Va à l'onglet Storyboard"*
• *"Analyse le roman et génère les scènes"*`,
      timestamp: 'Aujourd\'hui',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleOpenWithPrompt = (e: any) => {
      setIsOpen(true);
      const detail = e.detail;
      if (detail && detail.prompt) {
        const textToImprove = `🎬 **Instruction Réalisateur : Améliorer ce prompt avec précision cinématographique & détails extrêmes**

**Scène :** ${detail.sceneTitle || 'Scène du roman'}
**Extrait du roman :** ${detail.novelExcerpt ? `"${detail.novelExcerpt}"` : 'Extrait du chapitre'}
**Prompt Actuel :**
\`\`\`prompt
${detail.prompt}
\`\`\`

Peux-tu enrichir ce prompt en anglais photoréaliste de niveau Hollywood, en précisant l'éclairage de cinéma (Rembrandt/volumétrique), les optiques de caméra (35mm f/1.4), les micro-textures et les expressions faciales pour une fidélité maximale ?`;

        if (detail.autoSend) {
          handleSend(textToImprove);
        } else {
          setInput(textToImprove);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-ai-chat-with-prompt', handleOpenWithPrompt as EventListener);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-ai-chat-with-prompt', handleOpenWithPrompt as EventListener);
    };
  }, [messages, isOpen]);

  // Execute parameter actions locally
  const executeChatAction = (type: string, value: string): string => {
    let summary = '';
    switch (type) {
      case 'SET_DIRECTOR_CONSIGNE':
        if (onUpdateProject) {
          onUpdateProject({ directorConsignes: value });
          summary = `Consigne Réalisateur appliquée : "${value}"`;
        }
        break;
      case 'SET_ART_STYLE':
        if (onUpdateProject) {
          onUpdateProject({ artStyle: value as any });
          summary = `Style Visuel : ${value}`;
        }
        break;
      case 'SET_ASPECT_RATIO':
        if (onUpdateProject) {
          onUpdateProject({ aspectRatio: value as any });
          summary = `Format / Ratio : ${value}`;
        }
        break;
      case 'SET_TITLE':
        if (onUpdateProject) {
          onUpdateProject({ title: value });
          summary = `Titre du projet : "${value}"`;
        }
        break;
      case 'SET_GENRE':
        if (onUpdateProject) {
          onUpdateProject({ genre: value });
          summary = `Genre cinématographique : "${value}"`;
        }
        break;
      case 'SWITCH_TAB':
        if (setActiveTab) {
          setActiveTab(value);
          summary = `Navigation onglet : ${value}`;
        }
        break;
      case 'SET_WORK_SCOPE':
        if (onSetWorkScope) {
          onSetWorkScope(value as any);
          summary = `Périmètre : ${value === 'prologue_only' ? 'Prologue Uniquement' : value === 'chapter_only' ? 'Chapitre 1 Seul' : 'Prologue + Chapitre'}`;
        }
        break;
      default:
        break;
    }
    return summary;
  };

  // Client-side quick intent matcher for instant execution
  const detectAndExecuteQueryIntents = (query: string): string[] => {
    const executed: string[] = [];
    const lower = query.toLowerCase();

    // Directives & Consignes du Réalisateur (Enregistrées automatiquement pour l'analyse)
    if (lower.startsWith('consigne:') || lower.startsWith('consignes:') || lower.includes('change la consigne') || lower.includes('nouvelle consigne') || lower.includes('directive:')) {
      const consigneText = query.replace(/^(consigne:|consignes:|directive:|directives:|change la consigne en:|nouvelle consigne:)/i, '').trim();
      if (consigneText.length > 2) {
        const res = executeChatAction('SET_DIRECTOR_CONSIGNE', consigneText);
        if (res) executed.push(res);
      }
    } else if (query.trim().length > 3 && !lower.includes('nettoy') && !lower.includes('reset')) {
      // Auto-bind any general chat directive/instruction to project.directorConsignes
      const res = executeChatAction('SET_DIRECTOR_CONSIGNE', query.trim());
      if (res) executed.push(res);
    }

    // Style
    if (lower.includes('manga') || lower.includes('anime')) {
      const res = executeChatAction('SET_ART_STYLE', 'anime_manga');
      if (res) executed.push(res);
    } else if (lower.includes('film noir') || lower.includes('cyberpunk')) {
      const res = executeChatAction('SET_ART_STYLE', 'film_noir');
      if (res) executed.push(res);
    } else if (lower.includes('cinema') || lower.includes('8k') || lower.includes('photoréalism')) {
      const res = executeChatAction('SET_ART_STYLE', 'cinema_8k');
      if (res) executed.push(res);
    } else if (lower.includes('dark fantasy') || lower.includes('gothique')) {
      const res = executeChatAction('SET_ART_STYLE', 'dark_fantasy');
      if (res) executed.push(res);
    }

    // Ratio
    if (lower.includes('9:16') || lower.includes('vertical') || lower.includes('tiktok') || lower.includes('reels')) {
      const res = executeChatAction('SET_ASPECT_RATIO', '9:16');
      if (res) executed.push(res);
    } else if (lower.includes('16:9') || lower.includes('paysage') || lower.includes('horizontal')) {
      const res = executeChatAction('SET_ASPECT_RATIO', '16:9');
      if (res) executed.push(res);
    } else if (lower.includes('2.39:1') || lower.includes('cinemascope')) {
      const res = executeChatAction('SET_ASPECT_RATIO', '2.39:1');
      if (res) executed.push(res);
    }

    // Work scope
    if (lower.includes('prologue uniquement') || lower.includes('seulement le prologue') || lower.includes('travailler sur le prologue') || lower.includes('mode prologue')) {
      const res = executeChatAction('SET_WORK_SCOPE', 'prologue_only');
      if (res) executed.push(res);
    } else if (lower.includes('chapitre 1 seul') || lower.includes('seulement le chapitre') || lower.includes('mode chapitre')) {
      const res = executeChatAction('SET_WORK_SCOPE', 'chapter_only');
      if (res) executed.push(res);
    } else if (lower.includes('prologue et chapitre') || lower.includes('les deux') || lower.includes('prologue + chapitre')) {
      const res = executeChatAction('SET_WORK_SCOPE', 'both');
      if (res) executed.push(res);
    }

    // Tab navigation
    if (lower.includes('analyse') || lower.includes('découpe') || lower.includes('lance l\'analyse')) {
      const res = executeChatAction('SWITCH_TAB', 'ai_analysis');
      if (res) executed.push(res);
    } else if (lower.includes('storyboard')) {
      const res = executeChatAction('SWITCH_TAB', 'storyboard');
      if (res) executed.push(res);
    } else if (lower.includes('casting') || lower.includes('personnages')) {
      const res = executeChatAction('SWITCH_TAB', 'casting');
      if (res) executed.push(res);
    } else if (lower.includes('scènes') || lower.includes('scenes')) {
      const res = executeChatAction('SWITCH_TAB', 'scenes');
      if (res) executed.push(res);
    } else if (lower.includes('film') || lower.includes('catalogue')) {
      const res = executeChatAction('SWITCH_TAB', 'my_films');
      if (res) executed.push(res);
    }

    // Reset & Clean Prompts Intent
    if (lower.includes('nettoy') || lower.includes('balaye') || lower.includes('efface les prompt') || lower.includes('recommence') || lower.includes('reprendre l\'etude') || lower.includes('reprendre l\'étude') || lower.includes('remet a zero') || lower.includes('remets à zéro') || lower.includes('reset')) {
      if (onOpenResetModal) {
        onOpenResetModal();
        executed.push('Ouverture de l\'interface de nettoyage des prompts & réinitialisation');
      }
    }

    return executed;
  };

  // Parse JSON action block from assistant text response
  const parseAndExecuteJsonActions = (text: string): string[] => {
    const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
    const executed: string[] = [];
    let match;
    while ((match = jsonBlockRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed && Array.isArray(parsed.actions)) {
          for (const act of parsed.actions) {
            const val = act.value || act.tab;
            if (act.type && val) {
              const res = executeChatAction(act.type, val);
              if (res && !executed.includes(res)) executed.push(res);
            }
          }
        }
      } catch (e) {
        console.warn('JSON action parse notice:', e);
      }
    }
    return executed;
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    // Immediately execute client intents
    const clientActions = detectAndExecuteQueryIntents(query);

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executedActions: clientActions.length > 0 ? clientActions : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/director-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          projectContext: project ? {
            title: project.title,
            genre: project.genre,
            artStyle: project.artStyle,
            aspectRatio: project.aspectRatio,
            summary: project.summary,
          } : undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        // Parse any server-side actions
        const serverActions = parseAndExecuteJsonActions(data.reply);
        const allExecuted = Array.from(new Set([...clientActions, ...serverActions]));

        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          executedActions: allExecuted.length > 0 ? allExecuted : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Erreur lors du traitement.');
      }
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        text: "J'ai bien pris en compte vos paramètres et ajustements direct.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executedActions: clientActions.length > 0 ? clientActions : undefined,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const renderMessageContent = (msg: ChatMessage) => {
    // Remove JSON action blocks from rendered display for clean reading
    let text = msg.text.replace(/```json\s*[\s\S]*?```/g, '').trim();
    const promptBlockRegex = /```(?:prompt)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = promptBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[1].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {msg.executedActions && msg.executedActions.length > 0 && (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold space-y-1 my-1 shadow">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Réglages appliqués automatiquement :</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-emerald-200">
              {msg.executedActions.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        )}

        {parts.map((part, idx) => {
          if (part.type === 'code') {
            const codeId = `${msg.id}_code_${idx}`;
            return (
              <div key={codeId} className="my-2 rounded-xl bg-slate-950 border border-amber-500/40 p-3 space-y-2 font-mono text-[11px] text-amber-200 relative group shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-sans font-bold text-amber-400">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Prompt Visuel Suggéré (Gemini/35mm)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(part.content, codeId)}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans font-semibold flex items-center gap-1 transition-all"
                  >
                    {copiedCodeId === codeId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodeId === codeId ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-slate-200">{part.content}</p>
              </div>
            );
          }
          return (
            <p key={idx} className="whitespace-pre-wrap">
              {part.content}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay to close on tap outside */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 sm:hidden transition-opacity animate-in fade-in"
        />
      )}

      {/* Floating Toggle Button (Always visible for easy Open / Close) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold shadow-2xl shadow-amber-500/40 border border-amber-300/40 transition-all transform hover:scale-105 flex items-center gap-2 group"
        title={isOpen ? "Fermer le Chat (Echap)" : "Ouvrir l'Assistant Réalisateur IA & Contrôle de Paramètres"}
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-5 h-5 text-slate-950 transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </>
          )}
        </div>
        <span className="text-xs tracking-wide pr-1">
          {isOpen ? 'Fermer Chat' : 'Assistant & Pilote IA'}
        </span>
      </button>

      {/* Floating Chat & Direct Parameter Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-full max-w-md h-[600px] max-h-[calc(100vh-120px)] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-amber-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 relative">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-100 text-sm flex items-center gap-1.5">
                  <span>Assistant Réalisateur & Pilote</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">3.6</span>
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Contrôle direct des paramètres par le chat</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowControls(!showControls)}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  showControls
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-amber-400 hover:bg-slate-800'
                }`}
                title="Panneau de Contrôle Direct des Paramètres"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
                title="Réduire le Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                title="Fermer le Chat (Echap)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expandable Direct Parameter Control Panel */}
          {showControls && (
            <div className="p-3.5 bg-slate-950 border-b border-amber-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Panneau de Contrôle Direct & Consignes (Temps Réel)</span>
                </span>
                <span className="text-[10px] text-slate-400">Modifiable par chat ou directement</span>
              </div>

              {/* Direct Consignes / Directives Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-amber-400" />
                  <span>Consignes Générales du Réalisateur pour l'IA</span>
                </label>
                <textarea
                  value={project?.directorConsignes || ''}
                  onChange={(e) => executeChatAction('SET_DIRECTOR_CONSIGNE', e.target.value)}
                  placeholder="Ex: Ambiance très sombre, cadrages serrés, éclairage Rembrandt, narration poétique..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Art Style */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Palette className="w-3 h-3 text-amber-400" />
                    <span>Style Visuel</span>
                  </label>
                  <select
                    value={project?.artStyle || 'cinema_8k'}
                    onChange={(e) => executeChatAction('SET_ART_STYLE', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="cinema_8k">Cinéma Photoréaliste 8K</option>
                    <option value="anime_manga">Anime / Manga 2D</option>
                    <option value="film_noir">Film Noir / Cyberpunk</option>
                    <option value="dark_fantasy">Dark Fantasy Gothique</option>
                    <option value="watercolor">Aquarelle Minimaliste</option>
                    <option value="oil_painting">Peinture à l'Huile</option>
                    <option value="futuristic_sf">SF Futuriste Neons</option>
                    <option value="3d_render">3D Render Animation</option>
                  </select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-amber-400" />
                    <span>Format / Ratio</span>
                  </label>
                  <select
                    value={project?.aspectRatio || '16:9'}
                    onChange={(e) => executeChatAction('SET_ASPECT_RATIO', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="16:9">16:9 Cinéma / Ecran</option>
                    <option value="9:16">9:16 Vertical TikTok/Reels</option>
                    <option value="2.39:1">2.39:1 Cinemascope</option>
                    <option value="1:1">1:1 Carré Instagram</option>
                    <option value="4:3">4:3 Télévision Classique</option>
                  </select>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Saut d'Onglet Immédiat</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'import', label: 'Importation' },
                    { id: 'ai_analysis', label: 'Analyse' },
                    { id: 'casting', label: 'Casting' },
                    { id: 'scenes', label: 'Scènes' },
                    { id: 'storyboard', label: 'Storyboard' },
                    { id: 'my_films', label: 'Rendu 4K' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => executeChatAction('SWITCH_TAB', tab.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Director Consigne Banner connected directly to Analysis */}
          {project?.directorConsignes && (
            <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/30 border-b border-amber-500/40 px-3.5 py-2 flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-[10px] uppercase font-mono tracking-wider">Consigne Active pour l'Analyse :</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">✓ Liée au bouton Analyse</span>
                  </div>
                  <p className="text-slate-200 truncate font-mono text-[11px] font-semibold">
                    "{project.directorConsignes}"
                  </p>
                </div>
              </div>
              {setActiveTab && (
                <button
                  onClick={() => {
                    setActiveTab('novels');
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-md shrink-0"
                  title="Lancer l'analyse du roman avec cette consigne"
                >
                  <Wand2 className="w-3 h-3 text-slate-950" />
                  <span className="hidden sm:inline">Exécuter l'Analyse</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Command Suggestion Pills */}
          <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="px-2.5 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 shadow-sm"
              >
                <RotateCcw className="w-3 h-3 text-red-400" />
                <span>🧹 Nettoyer & Reprendre à 0</span>
              </button>
            )}
            <button
              onClick={() => handleSend("Passe en style Anime Manga et format 9:16 vertical")}
              className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 whitespace-nowrap transition-all shrink-0 flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3 text-amber-400" />
              <span>Manga 9:16</span>
            </button>
            <button
              onClick={() => handleSend("Travailler uniquement sur le prologue")}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-all shrink-0 flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Prologue Seul</span>
            </button>
            <button
              onClick={() => handleSend("Passe en style Cinéma Photoréaliste 8K et format 16:9")}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-all shrink-0 flex items-center gap-1"
            >
              <Film className="w-3 h-3 text-amber-400" />
              <span>Cinéma 8K 16:9</span>
            </button>
            <button
              onClick={() => handleSend("Affiche le storyboard et le découpage")}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-all shrink-0 flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Voir Storyboard</span>
            </button>
          </div>

          {/* Messages Scroll Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 h-fit shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {renderMessageContent(msg)}
                  <span className={`block text-[9px] mt-1 text-right font-mono ${msg.role === 'user' ? 'text-slate-900/60' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-slate-900 h-fit shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 h-fit shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-xs text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span>Le Réalisateur IA configure les paramètres & génère la réponse...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Donnez vos consignes (ex: Passe en style Anime 9:16...)"
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
