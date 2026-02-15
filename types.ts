
export enum AppTab {
  CREATE = 'create',
  TRANSFORM = 'transform',
  PERSONA = 'persona',
  EXPAND = 'expand',
  HISTORY = 'history'
}

export interface GenerationSettings {
  quality: 'Standard' | 'HD' | 'Ultra HD';
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9' | 'Custom';
  customWidth?: number;
  customHeight?: number;
  negativePrompt: string;
  strength: number; // 0-100
  lighting?: string;
  camera?: string;
  faceEnhancement?: boolean;
}

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  settings: GenerationSettings;
  timestamp: number;
  type: AppTab;
  personaStyle?: string;
}

export interface PersonaPreset {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  { id: 'superhero', name: 'Superhero', prompt: 'a powerful cinematic superhero with an intricate glowing costume', icon: 'fa-mask' },
  { id: 'anime', name: 'Anime', prompt: 'high-quality modern anime style character portrait, vibrant colors', icon: 'fa-palette' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'cyberpunk futuristic nomad with neon augmentations and street wear', icon: 'fa-robot' },
  { id: 'knight', name: 'Medieval Knight', prompt: 'a royal medieval knight in ornate shining silver armor', icon: 'fa-shield-halved' },
  { id: 'fantasy-elf', name: 'Fantasy Elf', prompt: 'ethereal fantasy elf with mystical aura and woodland garments', icon: 'fa-leaf' },
  { id: 'villain', name: 'Dark Villain', prompt: 'intimidating dark villain with shadowy energy and dramatic lighting', icon: 'fa-ghost' },
];

export const STYLE_PRESETS = [
  'Realistic', 'Anime', 'Pixar 3D', 'Cyberpunk', 'Watercolor', 'Oil Painting', 
  'Sketch', 'Cinematic', 'Hyper Realistic', 'Fantasy', 'Dark Gothic', 'Minimalist', 'Vintage Film'
];

export const LIGHTING_PRESETS = ['Soft', 'Studio', 'Sunset', 'Neon', 'Dramatic', 'Golden hour'];
export const CAMERA_PRESETS = ['DSLR', 'Cinematic lens', 'Drone shot', 'Macro', 'Wide angle', 'Portrait lens'];
