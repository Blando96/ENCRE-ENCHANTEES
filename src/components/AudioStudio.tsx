import React, { useState } from 'react';
import { ChapterProject, NavTab, MusicMood } from '../types';
import {
  Mic,
  Volume2,
  Music,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Radio,
  FileAudio
} from 'lucide-react';

interface AudioStudioProps {
  project: ChapterProject;
  setActiveTab: (tab: NavTab) => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({ project, setActiveTab }) => {
  const [playingFx, setPlayingFx] = useState<string | null>(null);
  const [narratorVoice, setNarratorVoice] = useState('fr_male_dramatic');
  const [selectedMusicMood, setSelectedMusicMood] = useState<MusicMood>('suspense');

  const sampleVoices = [
    { id: 'fr_male_dramatic', name: 'Antoine — Narrateur Réalisme Grave (Français)', desc: 'Timbre profond, idéal pour thriller noir' },
    { id: 'fr_female_expressive', name: 'Éléonore — Voix Féminine Expressive (Français)', desc: 'Timbre suave avec nuances d\'émotion' },
    { id: 'fr_male_epic', name: 'Victor — Voix Homme Athlétique (Français)', desc: 'Voix grave, posée, ton impératif' }
  ];

  const soundFxList = [
    { id: 'sfx_rain', name: 'Pluie battante & tonnerre', cat: 'Météo' },
    { id: 'sfx_footsteps', name: 'Pas lourds sur dalles mouillées', cat: 'Action' },
    { id: 'sfx_waves', name: 'Ressac des vagues sur falaise', cat: 'Ambiance' },
    { id: 'sfx_door', name: 'Grincement de porte massive', cat: 'Mécanique' },
    { id: 'sfx_lantern', name: 'Rotation de la lanterne du phare', cat: 'Mécanique' }
  ];

  const speakText = async (text: string, id: string) => {
    if (playingFx === id) {
      setPlayingFx(null);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    setPlayingFx(id);

    try {
      const res = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Kore' }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.onended = () => setPlayingFx(null);
        audio.play();
        return;
      }
    } catch (e) {
      console.warn('TTS API error, falling back to Web Speech:', e);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingFx(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingFx(null), 3000);
    }
  };

  const togglePlayFx = (id: string) => {
    if (playingFx === id) {
      setPlayingFx(null);
    } else {
      setPlayingFx(id);
      setTimeout(() => setPlayingFx(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Mic className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-100">
              Studio Audio & Voix-Off Personnalisées
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Synthesizer vocal pour dialogues, générateur de voix-off narration, bruitages spatiaux et nappe musicale.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('timeline_editor')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <span>Ouvrir Studio de Montage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Left Character Voices, Right SFX Soundboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Voices & Narrator Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Narrator Voice Selection */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Attribution des Voix Fr (TTS Haute Qualité)</span>
            </h2>

            <div className="space-y-3">
              {sampleVoices.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => setNarratorVoice(voice.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
                    narratorVoice === voice.id
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-serif font-bold text-sm text-amber-300">{voice.name}</span>
                    <p className="text-xs text-slate-400">{voice.desc}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText("Ceci est une démonstration du timbre de voix de narration pour CinéScript IA.", `voice_${voice.id}`);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {playingFx === `voice_${voice.id}` ? (
                      <Square className="w-3.5 h-3.5 fill-current text-amber-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                    )}
                    <span>{playingFx === `voice_${voice.id}` ? 'Stop' : 'Tester'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Scene Voiceover Narrator Script Preview */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-amber-400" />
              <span>Extraits Narration Voix-Off</span>
            </h2>

            <div className="space-y-3">
              {project.scenes.map((scene) => (
                <div key={scene.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-amber-300">Scène {scene.sceneNumber} — {scene.title}</span>
                    <button
                      onClick={() => speakText(scene.voiceoverText, `scene_${scene.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1"
                    >
                      {playingFx === `scene_${scene.id}` ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{playingFx === `scene_${scene.id}` ? 'Arrêter' : 'Écouter'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 italic font-serif leading-relaxed">
                    "{scene.voiceoverText}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: SFX & Music Track Selection */}
        <div className="space-y-6">
          
          {/* Sound Effects Board */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Bruitages & Sound FX</span>
            </h2>

            <div className="space-y-2">
              {soundFxList.map((sfx) => (
                <div
                  key={sfx.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{sfx.name}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">{sfx.cat}</span>
                  </div>

                  <button
                    onClick={() => togglePlayFx(sfx.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    {playingFx === sfx.id ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ambient Music Selector */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h2 className="font-serif font-bold text-slate-100 text-base flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Musique d'Ambiance</span>
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['suspense', 'dramatic', 'mysterious', 'epic', 'melancholic'] as MusicMood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMusicMood(m)}
                  className={`p-2.5 rounded-xl border text-center capitalize font-semibold transition-all ${
                    selectedMusicMood === m
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Next Step Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-slate-100 text-sm">Passer au Studio de Montage Multi-Pistes ?</h3>
          <p className="text-xs text-slate-400">
            Ajustez les pistes vidéo, voix-off, bruitages et sous-titres sur une timeline interactive.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('timeline_editor')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Ouvrir Studio de Montage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
