import React, { useState, useEffect, useRef } from 'react';
import { Scene, Character, ChapterProject } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Sparkles, Download, RefreshCw, Film, Subtitles, Music, Radio } from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';

interface CinemaPlayerProps {
  project: ChapterProject;
  initialSceneIndex?: number;
}

export const CinemaPlayer: React.FC<CinemaPlayerProps> = ({
  project,
  initialSceneIndex = 0,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(initialSceneIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<any>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const currentScene: Scene | undefined = project.scenes[currentSceneIndex];

  // Voice narration player using Web Speech API or Gemini TTS fallback
  const speakVoiceover = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (!isMuted && text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.95; // Steady narrator pace
        utterance.pitch = 0.95; // Slightly deeper tone

        // Try to pick a French natural voice
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find((v) => v.lang.includes('fr') || v.lang.includes('FR'));
        if (frenchVoice) utterance.voice = frenchVoice;

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Play scene sound ambiance and speak
  useEffect(() => {
    if (isPlaying && currentScene) {
      soundEngine.playAtmosphere(currentScene.musicMood);
      if (currentScene.soundEffects) {
        soundEngine.playSfx(currentScene.soundEffects);
      }
      speakVoiceover(currentScene.voiceoverText);
    } else {
      soundEngine.stopAll();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentSceneIndex, isPlaying, isMuted]);

  // Scene auto-advance timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const duration = (currentScene?.duration || 6) * 1000;

    timerRef.current = setTimeout(() => {
      if (currentSceneIndex < project.scenes.length - 1) {
        setCurrentSceneIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentSceneIndex(0);
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex, project.scenes.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    soundEngine.setMuted(newMute);
    if (newMute && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else if (!newMute && isPlaying && currentScene) {
      speakVoiceover(currentScene.voiceoverText);
    }
  };

  const handleNextScene = () => {
    if (currentSceneIndex < project.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Camera Motion CSS Animation Class Mapping
  const getCameraAnimationClass = (motion: string) => {
    switch (motion) {
      case 'zoom_in':
        return 'animate-[zoomIn_10s_ease-in-out_infinite_alternate]';
      case 'zoom_out':
        return 'animate-[zoomOut_10s_ease-in-out_infinite_alternate]';
      case 'pan_left':
        return 'animate-[panLeft_10s_ease-in-out_infinite_alternate]';
      case 'pan_right':
        return 'animate-[panRight_10s_ease-in-out_infinite_alternate]';
      case 'tilt_up':
        return 'animate-[tiltUp_10s_ease-in-out_infinite_alternate]';
      default:
        return 'animate-[kenBurns_12s_ease-in-out_infinite_alternate]';
    }
  };

  // MediaRecorder Video Export
  const startRecording = () => {
    if (!canvasRef.current) return;
    try {
      const stream = canvasRef.current.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.replace(/\s+/g, '_')}_CineScript.webm`;
        a.click();
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setCurrentSceneIndex(0);
      setIsPlaying(true);
    } catch (err) {
      console.error('Recording error:', err);
      alert('L\'enregistrement vidéo interactif a démarré. Veuillez lire la séquence jusqu\'à la fin.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Main Video Screen Container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black border-2 border-amber-500/30 shadow-2xl group flex flex-col justify-between aspect-video select-none"
      >
        {/* Background Canvas / Image with Ken Burns Camera Motion */}
        <div className="absolute inset-0 overflow-hidden bg-slate-950 flex items-center justify-center">
          {currentScene?.imageUrl ? (
            <img
              src={currentScene.imageUrl}
              alt={currentScene.title}
              className={`w-full h-full object-cover transform scale-110 ${
                isPlaying ? getCameraAnimationClass(currentScene.cameraMotion) : ''
              } transition-transform duration-1000`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <Film className="w-12 h-12 text-amber-500/40 mx-auto animate-pulse" />
              <p className="text-sm font-serif text-slate-300">
                Plan #{currentScene?.sceneNumber}: {currentScene?.title}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Veuillez générer les images IA dans l'onglet Storyboard pour profiter du rendu photoréaliste.
              </p>
            </div>
          )}

          {/* Vignette & Cinematic Dark Grading */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Hidden Canvas element for video recording stream */}
        <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

        {/* Top Overlay Bar */}
        <div className="relative z-10 p-4 md:p-6 flex items-center justify-between text-slate-100">
          <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-serif font-bold text-amber-300">
              {project.title}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300">
              Plan {currentSceneIndex + 1} / {project.scenes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-600/90 text-white text-xs font-bold animate-pulse shadow-lg">
                <Radio className="w-3.5 h-3.5" />
                <span>REC VIDEO WEB M</span>
              </div>
            )}

            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-2 rounded-xl border transition-all text-xs ${
                showSubtitles
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
              title="Sous-titres"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            <button
              onClick={handleFullscreen}
              className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs transition-all"
              title="Plein Écran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtitles & Captions Overlay */}
        {showSubtitles && currentScene?.voiceoverText && (
          <div className="relative z-10 px-6 py-4 text-center max-w-4xl mx-auto">
            <div className="inline-block bg-slate-950/85 backdrop-blur-md border border-amber-500/30 px-6 py-3 rounded-2xl shadow-2xl text-slate-100 font-serif text-sm md:text-base leading-relaxed">
              <span className="text-amber-400/90 font-bold mr-2">VOIX OFF:</span>
              <span>"{currentScene.voiceoverText}"</span>
            </div>
          </div>
        )}

        {/* Bottom Video Controls Bar */}
        <div className="relative z-10 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-3">
          
          {/* Progress Timeline Bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden cursor-pointer flex gap-1">
            {project.scenes.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setCurrentSceneIndex(idx)}
                className={`h-full flex-1 transition-all ${
                  idx === currentSceneIndex
                    ? 'bg-amber-400 shadow-sm shadow-amber-400'
                    : idx < currentSceneIndex
                    ? 'bg-amber-600/60'
                    : 'bg-slate-700/50 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            
            {/* Play/Pause & Skipping */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevScene}
                disabled={currentSceneIndex === 0}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 disabled:opacity-30 transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextScene}
                disabled={currentSceneIndex === project.scenes.length - 1}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 disabled:opacity-30 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMute}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            {/* Current Scene Information */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-amber-300 font-medium">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Musique: {currentScene?.musicMood}</span>
              <span className="text-slate-600">•</span>
              <span>Bruitage: {currentScene?.soundEffects}</span>
            </div>

            {/* Video Recording Download Action */}
            <div>
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Arrêter & Télécharger
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter Vidéo MP4 / WebM</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Film Reel Thumbnails Scrub Bar */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Film className="w-4 h-4" />
            <span>Bande de Film du Chapitre</span>
          </h3>
          <span className="text-xs text-slate-400">Cliquez sur un plan pour y accéder</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {project.scenes.map((scene, idx) => {
            const isSelected = idx === currentSceneIndex;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentSceneIndex(idx);
                  setIsPlaying(false);
                }}
                className={`relative shrink-0 w-36 aspect-video rounded-xl overflow-hidden border-2 transition-all text-left ${
                  isSelected
                    ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center text-[10px] text-slate-500 p-2 text-center">
                    Plan #{scene.sceneNumber}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex items-end">
                  <span className="text-[10px] font-bold text-amber-300 truncate">
                    #{scene.sceneNumber} {scene.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
