import { ChapterProject } from '../types';

export const DEFAULT_PROJECT: ChapterProject = {
  id: 'proj_default_lighthouse',
  title: 'L\'Ombre du Phare Noir',
  author: 'Henri de La Tour',
  genre: 'Thriller / Mystère',
  summary: 'Le capitaine Victor Vance rencontre l\'archiviste Éléonore au phare des Roches Noires pour échanger un carnet compromettant lors d\'une tempête nocturne.',
  rawText: `La pluie battante cinglait le verre dépoli du phare des Roches Noires. L'eau s'infiltrivial sous la porte en bois massif, faisant luire les dalles sombres.

Victor Vance, quarante-cinq ans, la mâchoire carrée drapée dans un imperméable sombre mouillé par l'orage, braquait sa torche vers l'angle de la tourelle. Ses yeux gris acier traquaient le moindre mouvement dans l'obscurité.

Soudain, une silhouette s'avança. C'était Éléonore de Saint-Clair, la jeune archiviste de la préfecture. Ses cheveux roux flamboyants trempés collaient à ses joues pâles. Elle portait une veste écossaise verte ajustée et tenait fermement sous son bras un livre relié en cuir noir orné d'un sceau doré.

"Vous n'auriez pas dû venir, Éléonore," murmura Victor d'une voix grave et rocailleuse, le regard fixé sur la lanterne géante du phare qui balayait le ciel nocturne.

"Le Comte sait que j'ai le carnet, Victor," répondit-elle en frissonnant. "Si nous ne diffusons pas ces preuves avant l'aube, tout est perdu."`,
  artStyle: 'ultra_realism',
  aspectRatio: '16:9',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  characters: [
    {
      id: 'char_victor_vance',
      characterCode: 'VIC_001',
      name: 'Victor Vance',
      age: '45 ans',
      gender: 'Masculin',
      skinTone: 'Pâle avec légère couperose due au vent marin',
      hair: 'Cheveux bruns foncés courts avec tempes argentées',
      eyes: 'Yeux gris acier pénétrants',
      faceFeatures: 'Mâchoire carrée virile, barbe de 3 jours, rides légères d\'expression',
      clothingStyle: 'Imperméable trench-coat sombre trempé de pluie, col relevé',
      build: 'Stature imposante, carrure athlétique (1m85)',
      distinguishingMarks: 'Cicatrisation discrète à la joue droite, torche tactique en laiton',
      personalityTraits: 'Stoïque, méfiant, déterminé, voix grave et éraillée',
      voiceStyle: 'Voix homme mûr grave, débit posé (Français)',
      visualAnchor: '45yo man, square jawline, short dark hair with silver-streaked temples, steel gray eyes, 3-day stubble, wearing wet dark trench coat',
      role: 'protagonist',
      referenceImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
      faceReferences: [
        { angle: 'frontal', label: 'Face Droite', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
        { angle: 'three_quarter_left', label: '3/4 Gauche', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
        { angle: 'profile', label: 'Profil Droit', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop' }
      ]
    },
    {
      id: 'char_eleonore',
      characterCode: 'ELE_002',
      name: 'Éléonore de Saint-Clair',
      age: '28 ans',
      gender: 'Féminin',
      skinTone: 'Diaphane et très claire',
      hair: 'Longs cheveux roux flamboyants trempés par la pluie',
      eyes: 'Grands yeux vert émeraude expressifs',
      faceFeatures: 'Visage ovale pâle, pommettes saillantes, quelques taches de rousseur',
      clothingStyle: 'Veste écossaise verte ajustée, écharpe en laine sombre',
      build: 'Silhouette élancée et élégante (1m68)',
      distinguishingMarks: 'Livre relié en cuir noir orné d\'un sceau doré sous le bras',
      personalityTraits: 'Intelligente, courageuse, frémissante sous l\'émotion',
      voiceStyle: 'Voix femme jeune suave et expressive (Français)',
      visualAnchor: '28yo woman, vibrant wet copper red hair, striking emerald green eyes, pale skin with light freckles, wearing dark green plaid tailored jacket holding black leather book with gold seal',
      role: 'deuteragonist',
      referenceImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      faceReferences: [
        { angle: 'frontal', label: 'Face Droite', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop' },
        { angle: 'three_quarter_left', label: '3/4 Gauche', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop' }
      ]
    }
  ],
  locations: [
    {
      id: 'loc_phare_roches_noires',
      name: 'Le Phare des Roches Noires',
      type: 'exterieur',
      description: 'Tour en pierre noire granitique perchée sur une falaise escarpée battue par les vagues de l\'Océan.',
      era: 'Début XXe siècle / Années 1920',
      architecture: 'Architecture maritime gothique en pierre massive, lanternes en cuivre et lentilles Fresnel',
      lightingAtmosphere: 'Lumière sombre de tempête nocturne, éclairs aveuglants, faisceau balayant jaune doré',
      imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1280&auto=format&fit=crop',
      visualPrompt: 'Exterior dramatic stone lighthouse on dark granite cliffs, stormy ocean waves, lightning in dark clouds, 1920s architecture'
    },
    {
      id: 'loc_tourelle_interieure',
      name: 'Lanterne & Escalier de la Tourelle',
      type: 'interieur',
      description: 'Intérieur exigu du sommet du phare avec roulements en bronze, vitres mouillées par la pluie et ombre portée des lentilles.',
      era: 'Années 1920',
      architecture: 'Escalier en colimaçon en fer forgé, dalles de pierre mouillées',
      lightingAtmosphere: 'Eclairage rasant de torche électrique et faisceau rotatif du phare',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1280&auto=format&fit=crop',
      visualPrompt: 'Interior lighthouse glass lantern tower, damp stone floors, brass machinery, rain hitting glass windows at night'
    }
  ],
  scenes: [
    {
      id: 'scene_1',
      sceneNumber: 1,
      title: 'L\'Orage sur la Côte',
      locationName: 'Le Phare des Roches Noires',
      locationId: 'loc_phare_roches_noires',
      novelExcerpt: 'La pluie battante cinglait le verre dépoli du phare des Roches Noires. L\'eau s\'infiltrait sous la porte en bois massif, faisant luire les dalles sombres.',
      visualDescription: 'Plan large extérieur du phare des Roches Noires sous la tempête nocturne. Éclairs dans le ciel noir, vagues se fracassant sur les rochers.',
      characterIds: [],
      imagePrompt: 'Exterior dramatic wide shot of a towering stone lighthouse on jagged coastal cliff during a violent night storm, crashing sea waves, lightning striking dark clouds, glowing yellow beam from lighthouse lantern, photorealistic 8k, cinematic lighting',
      imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1280&auto=format&fit=crop',
      voiceoverText: 'La pluie battante cinglait le verre dépoli du phare des Roches Noires. L\'eau s\'infiltrait sous la porte en bois massif.',
      soundEffects: 'Pluie battante et tonnerre au loin',
      musicMood: 'suspense',
      cameraMotion: 'zoom_in',
      duration: 6,
      timeOfDay: 'Nuit',
      weather: 'Tempête violent & pluie',
      shots: [
        {
          id: 'shot_1_1',
          shotNumber: 1,
          shotType: 'plan_général',
          actionDescription: 'Vue panoramique du phare battu par les lames de l\'océan sous un ciel d\'orage.',
          characterIds: [],
          cameraMotion: 'pan_right',
          duration: 3,
          imagePrompt: 'Panoramic exterior shot lighthouse stormy sea lightning photorealistic 8k',
          imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1280&auto=format&fit=crop',
          voiceoverText: 'La pluie battante cinglait le verre dépoli du phare.',
          soundEffects: 'Tonnerre et ressac des vagues',
          musicMood: 'suspense',
          emotion: 'Inquiétude'
        },
        {
          id: 'shot_1_2',
          shotNumber: 2,
          shotType: 'plan_moyen',
          actionDescription: 'Gros plan sur la porte en bois de chêne massif au pied du phare, l\'eau ruisselle sur le seuil.',
          characterIds: [],
          cameraMotion: 'zoom_in',
          duration: 3,
          imagePrompt: 'Close up old wooden door wet stone threshold dripping water storm night photorealistic',
          imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1280&auto=format&fit=crop',
          voiceoverText: 'L\'eau s\'infiltrait sous la porte en bois massif.',
          soundEffects: 'Gouttes d\'eau lourdes',
          musicMood: 'mysterious',
          emotion: 'Tension'
        }
      ]
    },
    {
      id: 'scene_2',
      sceneNumber: 2,
      title: 'L\'Arrivée du Capitaine',
      locationName: 'Lanterne & Escalier de la Tourelle',
      locationId: 'loc_tourelle_interieure',
      novelExcerpt: 'Victor Vance, quarante-cinq ans, la mâchoire carrée drapée dans un imperméable sombre mouillé par l\'orage, braquait sa torche vers l\'angle de la tourelle.',
      visualDescription: 'Gros plan moyen sur Victor Vance tenant sa torche dans la pénombre de la tourelle du phare.',
      characterIds: ['char_victor_vance'],
      imagePrompt: 'Cinematic medium shot of 45yo man [VIC_001], square jawline, short dark hair with silver-streaked temples, steel gray eyes, 3-day stubble, wearing wet dark trench coat, holding a glowing brass flashlight in dark stone lighthouse interior, rain dripping, photorealistic 8k, Rembrandt lighting',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1280&auto=format&fit=crop',
      voiceoverText: 'Victor Vance braquait sa torche dans l\'obscurité de la tourelle, ses yeux gris acier traquant le moindre mouvement.',
      soundEffects: 'Vent hurlant et gouttes d\'eau',
      musicMood: 'mysterious',
      cameraMotion: 'pan_left',
      duration: 6,
      timeOfDay: 'Nuit',
      weather: 'Interieur exigu',
      shots: [
        {
          id: 'shot_2_1',
          shotNumber: 1,
          shotType: 'plan_américain',
          actionDescription: 'Victor s\'avance doucement, la torche en main, son imperméable trempé gouttant au sol.',
          characterIds: ['char_victor_vance'],
          cameraMotion: 'pan_left',
          duration: 3,
          imagePrompt: '3/4 shot 45yo man [VIC_001] wet dark trench coat brass flashlight dark stairs lighthouse',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1280&auto=format&fit=crop',
          voiceoverText: 'Victor Vance scrutait les ombres de la tourelle.',
          soundEffects: 'Pas lourds sur la pierre mouillée',
          musicMood: 'suspense',
          emotion: 'Méfiance'
        },
        {
          id: 'shot_2_2',
          shotNumber: 2,
          shotType: 'gros_plan',
          actionDescription: 'Gros plan sur les yeux gris acier de Victor reflétant le faisceau de la torche.',
          characterIds: ['char_victor_vance'],
          cameraMotion: 'zoom_in',
          duration: 3,
          imagePrompt: 'Extreme close up steel gray eyes of 45yo man [VIC_001] light reflection dramatic contrast',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1280&auto=format&fit=crop',
          voiceoverText: 'Ses yeux traquaient la moindre menace dans le noir.',
          soundEffects: 'Respiration contenue',
          musicMood: 'suspense',
          emotion: 'Hypervigilance'
        }
      ]
    },
    {
      id: 'scene_3',
      sceneNumber: 3,
      title: 'L\'Archiviste dans l\'Ombre',
      locationName: 'Lanterne & Escalier de la Tourelle',
      locationId: 'loc_tourelle_interieure',
      novelExcerpt: 'Soudain, une silhouette s\'avança. C\'était Éléonore de Saint-Clair, la jeune archiviste de la préfecture. Ses cheveux roux flamboyants trempés collaient à ses joues pâles.',
      visualDescription: 'Plan moyen sur Éléonore avançant dans la lumière tournante de la lanterne du phare avec le carnet scellé.',
      characterIds: ['char_eleonore'],
      imagePrompt: 'Cinematic medium shot of 28yo woman [ELE_002], vibrant wet copper red hair, striking emerald green eyes, pale skin with light freckles, wearing dark green plaid tailored jacket holding black leather book with gold seal, dramatic shadows in lighthouse interior, photorealistic 8k',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1280&auto=format&fit=crop',
      voiceoverText: 'Une silhouette s\'avança dans la pénombre. C\'était Éléonore de Saint-Clair, serrant contre elle le précieux livre en cuir noir.',
      soundEffects: 'Pas sur la pierre et respiration courte',
      musicMood: 'dramatic',
      cameraMotion: 'dolly_zoom',
      duration: 6,
      timeOfDay: 'Nuit',
      weather: 'Interieur exigu',
      shots: [
        {
          id: 'shot_3_1',
          shotNumber: 1,
          shotType: 'plan_moyen',
          actionDescription: 'Éléonore émerge de l\'ombre d\'un pilier en tenant fortement le carnet noir.',
          characterIds: ['char_eleonore'],
          cameraMotion: 'dolly_zoom',
          duration: 6,
          imagePrompt: 'Medium shot 28yo woman [ELE_002] copper red hair green plaid jacket holding black book gold seal',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1280&auto=format&fit=crop',
          voiceoverText: 'Ses cheveux roux trempés collaient à ses joues pâles.',
          soundEffects: 'Robe froissée et frisson',
          musicMood: 'dramatic',
          emotion: 'Peur & Détermination'
        }
      ]
    },
    {
      id: 'scene_4',
      sceneNumber: 4,
      title: 'Le Secret Révélé',
      locationName: 'Lanterne & Escalier de la Tourelle',
      locationId: 'loc_tourelle_interieure',
      novelExcerpt: '"Le Comte sait que j\'ai le carnet, Victor," répondit-elle en frissonnant. "Si nous ne diffusons pas ces preuves avant l\'aube, tout est perdu."',
      visualDescription: 'Plan rapproché à deux personnages (Victor et Éléonore) se faisant face dans la lanterne du phare.',
      characterIds: ['char_victor_vance', 'char_eleonore'],
      imagePrompt: 'Cinematic two-shot inside lighthouse tower: 45yo man [VIC_001], square jawline, short dark hair with silver-streaked temples, wearing wet dark trench coat, talking with 28yo woman [ELE_002], vibrant wet copper red hair, emerald green eyes, dark green plaid jacket holding black leather book with gold seal, sweeping beam of lighthouse lantern behind them, tense atmosphere, photorealistic 8k',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1280&auto=format&fit=crop',
      voiceoverText: 'Le Comte sait que j\'ai le carnet, Victor. Si nous ne diffusons pas ces preuves avant l\'aube, tout est perdu.',
      soundEffects: 'Grincement du roulement de la lanterne',
      musicMood: 'suspense',
      cameraMotion: 'zoom_out',
      duration: 7,
      timeOfDay: 'Nuit',
      weather: 'Intérieur lanterne',
      shots: [
        {
          id: 'shot_4_1',
          shotNumber: 1,
          shotType: 'champ_contrechamp',
          actionDescription: 'Victor et Éléonore se font face, éclairés par le balayage de la lanterne.',
          characterIds: ['char_victor_vance', 'char_eleonore'],
          cameraMotion: 'orbit',
          duration: 7,
          imagePrompt: 'Two shot 45yo man [VIC_001] and 28yo woman [ELE_002] inside lantern tower glowing beam suspense photorealistic 8k',
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1280&auto=format&fit=crop',
          dialogue: '"Le Comte sait que j\'ai le carnet, Victor. Si nous ne diffusons pas ces preuves avant l\'aube, tout est perdu."',
          voiceoverText: 'Si nous ne diffusons pas ces preuves avant l\'aube, tout est perdu.',
          soundEffects: 'Moteur de la lanterne et vent',
          musicMood: 'epic',
          emotion: 'Urgence absolue'
        }
      ]
    }
  ],
  continuityAnomalies: [
    {
      id: 'ano_1',
      shotNumber: 3,
      sceneTitle: 'L\'Archiviste dans l\'Ombre',
      characterName: 'Éléonore de Saint-Clair',
      type: 'clothing_drift',
      severity: 'low',
      message: 'Légère variation de la nuance de la veste écossaise (vert foncé vs olive).',
      status: 'detected',
      autoFixSuggestion: 'Appliquer le filtre de verrouillage couleur de l\'Ancre Visuelle [ELE_002].'
    }
  ],
  generatedFilms: [
    {
      id: 'film_1',
      title: 'L\'Ombre du Phare Noir — Épisode 1',
      chapterTitle: 'Chapitre 1 : Les Roches Noires',
      durationFormatted: '00:25',
      resolution: '1080p',
      aspectRatio: '16:9',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
      createdAt: 'Aujourd\'hui 09:30',
      status: 'ready'
    }
  ]
};
