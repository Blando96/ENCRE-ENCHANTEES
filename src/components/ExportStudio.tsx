import React, { useState } from 'react';
import { ChapterProject } from '../types';
import { Download, FileText, Code, CheckCircle, Film, Sparkles, Printer, Copy, Share2, Globe, Radio, Check, X, Crown } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface ExportStudioProps {
  project: ChapterProject;
}

export const ExportStudio: React.FC<ExportStudioProps> = ({ project }) => {
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishOnline = async () => {
    setIsPublishing(true);
    try {
      // Sync latest project state to Firestore
      const projDocRef = doc(db, 'projects', 'default_project');
      await setDoc(projDocRef, {
        ...project,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?invite=true&invitedBy=${encodeURIComponent(project.author || 'Promoteur CINESCRYPTE')}`;
      
      setPublishedUrl(shareUrl);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      } catch (e) {
        console.warn(e);
      }
    } catch (e) {
      console.warn('Publish firestore error:', e);
      const baseUrl = window.location.origin + window.location.pathname;
      setPublishedUrl(`${baseUrl}?invite=true`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.replace(/\s+/g, '_')}_CineScript.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintScript = () => {
    window.print();
  };

  const handleCopyScriptText = () => {
    let scriptText = `====================================================\n`;
    scriptText += `CINÉSCRIPT IA - TRANSCRIPTION CINÉMATOGRAPHIQUE DE ROMAN\n`;
    scriptText += `TITRE DU ROMAN: ${project.title}\n`;
    scriptText += `AUTEUR: ${project.author || 'Inconnu'}\n`;
    scriptText += `GENRE: ${project.genre}\n`;
    scriptText += `====================================================\n\n`;

    scriptText += `--- LISTE DES PERSONNAGES ET ANCRES VISUELLES ---\n`;
    project.characters.forEach((c) => {
      scriptText += `\n• ${c.name} (${c.age}, ${c.gender})\n`;
      scriptText += `  - Traits: ${c.hair}, ${c.eyes}, ${c.faceFeatures}\n`;
      scriptText += `  - Tenue: ${c.clothingStyle}\n`;
      scriptText += `  - ANCRE DE COHÉRENCE VISUELLE: "${c.visualAnchor}"\n`;
    });

    scriptText += `\n\n--- STORYBOARD DÉTAILLÉ SÉQUENTIEL (${project.scenes.length} PLANS) ---\n`;
    project.scenes.forEach((s) => {
      scriptText += `\n====================================================\n`;
      scriptText += `PLAN #${s.sceneNumber}: ${s.title.toUpperCase()}\n`;
      scriptText += `Extrait Roman: "${s.novelExcerpt}"\n`;
      scriptText += `Caméra: ${s.cameraMotion} | Ambiance Musicale: ${s.musicMood}\n`;
      scriptText += `Voix Off Narrateur: "${s.voiceoverText}"\n`;
      scriptText += `Prompt Visuel IA: ${s.imagePrompt}\n`;
    });

    navigator.clipboard.writeText(scriptText);
    alert('Le script complet a été copié dans votre presse-papiers !');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 border border-amber-500/20 space-y-2 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400">
          <Download className="w-5 h-5" />
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Centre d'Exportation & Production
          </h1>
        </div>
        <p className="text-xs text-slate-300">
          Exportez votre roman transcrit sous forme de script de cinéma imprimable, de fichier projet JSON ou d'archive de tournage.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Publish Online / Share Web Link */}
        <div className="bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-slate-900/80 p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-serif font-bold text-amber-300 text-lg">
              Publier le Film en Ligne
            </h3>
            <p className="text-xs text-slate-300">
              Générez un lien web public synchronisé sur Firestore pour diffuser votre projet et inviter vos collaborateurs à le voir.
            </p>
          </div>

          <button
            onClick={handlePublishOnline}
            disabled={isPublishing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span>{isPublishing ? 'Synchronisation...' : 'Publier en 1-Clic'}</span>
          </button>
        </div>

        {/* Print / PDF Script */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-slate-100 text-lg">
              Script & Storyboard PDF
            </h3>
            <p className="text-xs text-slate-400">
              Générez une version imprimable propre incluant les plans, les extraits du livre, les voix off et les ancres de cohérence.
            </p>
          </div>

          <button
            onClick={handlePrintScript}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>
        </div>

        {/* Copy Script Text */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-slate-100 text-lg">
              Copier le Script Réal
            </h3>
            <p className="text-xs text-slate-400">
              Copiez le script texte enrichi dans le presse-papiers pour l'utiliser dans un logiciel de montage externe (Premiere, DaVinci).
            </p>
          </div>

          <button
            onClick={handleCopyScriptText}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copier Script</span>
          </button>
        </div>

        {/* Export JSON Project Backup */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-slate-100 text-lg">
              Projet Backup JSON
            </h3>
            <p className="text-xs text-slate-400">
              Téléchargez les métadonnées complètes de votre projet pour pouvoir le réimporter ou le partager ultérieurement.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Sauvegarder JSON</span>
          </button>
        </div>

      </div>

      {/* PUBLISHED LINK MODAL DIALOG */}
      {publishedUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-lg">
                <Globe className="w-5 h-5 text-amber-400" />
                <span>Publication en Ligne Réussie !</span>
              </div>
              <button
                onClick={() => setPublishedUrl(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Votre projet <strong className="text-amber-300">"{project.title}"</strong> est synchronisé en direct sur Firestore. Vous pouvez partager ce lien d'accès libre avec vos équipes, investisseurs et spectateurs.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                Lien Web Public de Diffusion :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none select-all"
                />
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(publishedUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>Accès instantané 24/7 sur la plateforme sans blocage ni carte de crédit requise.</span>
            </div>

            <button
              onClick={() => setPublishedUrl(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              Fermer & Continuer
            </button>
          </div>
        </div>
      )}

      {/* Printable Script Sheet View */}
      <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl print:bg-white print:text-black print:border-none">
        
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-serif font-bold text-slate-100 print:text-black">
            {project.title}
          </h2>
          <p className="text-xs text-amber-400 font-medium print:text-gray-700">
            Par {project.author || 'Inconnu'} • Genre: {project.genre}
          </p>
        </div>

        {/* Characters Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black">
            Fiches Personnages & Ancres Visuelles de Cohérence
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {project.characters.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 print:border-gray-300 print:bg-gray-50"
              >
                <div className="font-bold text-slate-200 print:text-black">{c.name} ({c.age}, {c.gender})</div>
                <div className="text-slate-400 print:text-gray-600">{c.hair} • {c.eyes} • {c.clothingStyle}</div>
                <div className="text-[11px] font-mono text-amber-300 print:text-gray-800">
                  Visual Lock: "{c.visualAnchor}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storyboard Scenes List */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black">
            Séquencier des Plans Cinéma
          </h3>

          <div className="space-y-4 text-xs">
            {project.scenes.map((scene) => (
              <div
                key={scene.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 print:border-gray-300 print:bg-white"
              >
                <div className="flex items-center justify-between font-bold text-slate-100 print:text-black">
                  <span>Plan #{scene.sceneNumber}: {scene.title}</span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    {scene.cameraMotion} • {scene.musicMood}
                  </span>
                </div>

                <p className="text-slate-300 italic font-serif print:text-gray-800">
                  "{scene.novelExcerpt}"
                </p>

                <div className="p-2 rounded bg-slate-900 text-slate-200 print:bg-gray-100 print:text-black">
                  <strong>Voix Off:</strong> "{scene.voiceoverText}"
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  Prompt: {scene.imagePrompt}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
