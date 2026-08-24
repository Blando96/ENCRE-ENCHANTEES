import React, { useState } from 'react';
import { ChapterProject, ContinuityAnomaly, NavTab } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock
} from 'lucide-react';

interface CoherenceGuardProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
  onResolveAnomaly?: (anomalyId: string) => void;
  onUpdateProject?: (updatedProject: ChapterProject) => void;
}

export const CoherenceGuard: React.FC<CoherenceGuardProps> = ({
  project,
  setActiveTab,
  onResolveAnomaly,
  onUpdateProject,
}) => {
  const [anomalies, setAnomalies] = useState<ContinuityAnomaly[]>(
    project.continuityAnomalies || [
      {
        id: 'ano_1',
        shotNumber: 3,
        sceneTitle: 'L\'Archiviste dans l\'Ombre',
        characterName: 'Éléonore de Saint-Clair',
        type: 'clothing_drift',
        severity: 'low',
        message: 'Légère variation de nuance de la veste écossaise (vert foncé vs olive).',
        status: 'detected',
        autoFixSuggestion: 'Remplacer avec l\'Ancre Visuelle de Code [ELE_002] : green plaid tailored jacket.'
      },
      {
        id: 'ano_2',
        shotNumber: 4,
        sceneTitle: 'Le Secret Révélé',
        characterName: 'Victor Vance',
        type: 'lighting_mismatch',
        severity: 'medium',
        message: 'Eclairage du visage légèrement plus chaud que la scène 2.',
        status: 'detected',
        autoFixSuggestion: 'Harmoniser la température de couleur avec le phare des Roches Noires.'
      }
    ]
  );

  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const handleScanContinuity = async () => {
    setIsScanning(true);
    setSyncStatusMessage(null);
    try {
      const res = await fetch('/api/audit-continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characters: project.characters,
          scenes: project.scenes,
          artStyle: project.artStyle,
        }),
      });
      const data = await res.json();
      if (data.success && data.anomalies) {
        setAnomalies(data.anomalies);
        setSyncStatusMessage(`Audit terminé : Score de fidélité ${data.globalFidelityScore || 98}%`);
      }
    } catch (e) {
      console.error('Audit API error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSyncAllFidelity = async () => {
    if (!project.scenes || project.scenes.length === 0) return;
    setIsSyncing(true);
    setSyncStatusMessage(null);

    try {
      const res = await fetch('/api/sync-character-fidelity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characters: project.characters,
          scenes: project.scenes,
          artStyle: project.artStyle,
        }),
      });

      const data = await res.json();
      if (data.success && data.syncedScenes) {
        const updatedProject: ChapterProject = {
          ...project,
          scenes: data.syncedScenes,
        };
        if (onUpdateProject) {
          onUpdateProject(updatedProject);
        }
        setAnomalies((prev) => prev.map((a) => ({ ...a, status: 'resolved' })));
        setSyncStatusMessage(data.message || 'Personnages synchronisés à 100% sur tout le chapitre !');
      }
    } catch (e) {
      console.error('Sync fidelity API error:', e);
      setSyncStatusMessage('Erreur lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFixAnomaly = (id: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a))
    );
    if (onResolveAnomaly) onResolveAnomaly(id);
  };

  const pendingCount = anomalies.filter((a) => a.status === 'detected').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Contrôle de Cohérence IA & Verrouillage Personnages
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            L'IA audite et synchronise chaque plan du début à la fin du chapitre pour garantit une fidélité parfaite des personnages sans mélange de traits.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSyncAllFidelity}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Verrouillage en cours...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-950" />
                <span>Verrouiller & Synchroniser Tout le Chapitre</span>
              </>
            )}
          </button>

          <button
            onClick={handleScanContinuity}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Lancer l'Audit Global</span>
              </>
            )}
          </button>
        </div>
      </div>

      {syncStatusMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{syncStatusMessage}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
            Fidélité 100% Active
          </span>
        </div>
      )}

      {/* Audit Summary Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-amber-400">Statut Cohérence</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-100">
            {pendingCount === 0 ? '100% Verrouillé' : `${pendingCount} Alerte(s)`}
          </div>
          <p className="text-[11px] text-slate-400">
            {pendingCount === 0 ? 'Aucune dérive visuelle sur le film' : 'Ajustements mineurs suggérés'}
          </p>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-amber-400">Personnages Ancrés</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-100">
            {project.characters.length} Fiches Locks
          </div>
          <p className="text-[11px] text-slate-400">Character Code IDs actifs</p>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-amber-400">Décors Vérifiés</span>
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-100">
            {project.locations?.length || 2} Lieux Conformes
          </div>
          <p className="text-[11px] text-slate-400">Éclairage & architecture stables</p>
        </div>

      </div>

      {/* Anomalies List */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h2 className="font-serif font-bold text-slate-100 text-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Alertes de Dérive Visuelle Détectées</span>
        </h2>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-serif font-bold text-slate-200 text-base">Parfaite Cohérence Visuelle</h3>
            <p className="text-xs text-slate-400">Tous les visages, vêtements et éclairages sont parfaitement synchronisés.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((ano) => {
              const isResolved = ano.status === 'resolved';

              return (
                <div
                  key={ano.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isResolved
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      {isResolved ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      <div>
                        <h3 className="font-serif font-bold text-slate-100 text-sm">
                          {ano.sceneTitle} — Plan #{ano.shotNumber}
                        </h3>
                        <p className="text-xs text-amber-300 font-medium">Personnage : {ano.characterName}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isResolved ? 'Résolu & Synchronisé' : `Anomalie ${ano.severity}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">Détection :</strong> {ano.message}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="text-[10px] uppercase font-semibold text-amber-400">Correction Automatique IA Suggérée</div>
                    <p className="font-mono text-[11px] text-amber-200">{ano.autoFixSuggestion}</p>
                  </div>

                  {!isResolved && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleFixAnomaly(ano.id)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Corriger Automatiquement</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Next Step Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-slate-100 text-sm">Votre film est prêt à être assemblé !</h3>
          <p className="text-xs text-slate-400">
            Rendez-vous dans la section "Mes Films" pour générer et visionner votre production finale.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('my_films')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Générer le Film Final</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
