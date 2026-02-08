/**
 * Types for the reveal-carousel-generator integration
 * Based on https://github.com/drbobber/reveal-carousel-generator
 */

// Brand configuration (maps to brand_style_guides)
export interface RevealBrand {
  name: string;
  handle?: string;
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    background_dark: string;
    background_mid: string;
    background_light: string;
    text_main: string;
    text_body: string;
    text_dim: string;
    card_bg: string;
    card_border: string;
  };
  typography: {
    font_family: string;
    h1_size: number;
    h2_size: number;
    body_size: number;
    list_size: number;
    subtitle_size: number;
    label_size: number;
  };
  style: {
    tone: string;
    accent_style: 'gradient' | 'solid' | 'minimal';
    card_style: 'glassmorphism' | 'solid' | 'minimal';
    brand_label: string;
    show_slide_numbers: boolean;
    overlay_range: [number, number];
  };
}

// Element types for slides
export interface RevealElement {
  type: 'icon' | 'shape' | 'image';
  icon?: string;
  src?: string;
  shape?: 'circle' | 'square' | 'diamond' | 'ring';
  fill?: string;
  position: {
    x?: number;
    y?: number;
    preset?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-right' | 'center-left' | 'center';
  };
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  border?: {
    color: string;
    width: number;
    radius: string;
  };
  background?: string;
  object_fit?: 'contain' | 'cover';
  layer?: 'background' | 'decorative' | 'foreground';
  z_index?: number;
  // Internal resolved path for images
  _fg_resolved?: string;
}

// Slide types
export type RevealSlideType = 
  | 'cover' 
  | 'closing' 
  | 'title_card' 
  | 'title_list' 
  | 'hero_number' 
  | 'quote';

// Individual slide
export interface RevealSlide {
  type: RevealSlideType;
  title?: string;
  subtitle?: string;
  content?: string;
  body?: string;
  hero_number?: string;
  quote?: string;
  author?: string;
  items?: string[];
  background_image?: string;
  overlay_opacity?: number;
  elements?: RevealElement[];
}

// Full slides JSON structure
export interface RevealSlidesJson {
  carousel: {
    topic: string;
    platform: 'instagram' | 'tiktok' | 'linkedin';
    slides: RevealSlide[];
  };
}

// Full brand JSON structure
export interface RevealBrandJson {
  brand: RevealBrand;
}

// Design plan slide (internal format used during generation)
export interface DesignPlanSlide {
  slide: number;
  template: RevealSlideType;
  bg_type: 'gradient' | 'photo';
  overlay_opacity?: number;
  content: {
    title?: string;
    subtitle?: string;
    body?: string;
    items?: string[];
    hero_number?: string;
    quote?: string;
    author?: string;
  };
  accents: string[];
  highlights: string[];
  image_path?: string;
}

// Export options
export interface ExportOptions {
  width?: number;
  height?: number;
  quality?: number;
  outputDir?: string;
}

// Available icon names
export const REVEAL_ICONS = [
  'rocket',
  'brain',
  'lightning',
  'target',
  'trending',
  'cpu',
  'users',
  'check',
  'chart',
  'globe',
  'shield',
  'star',
  'clock',
  'diamond',
  'code',
  'zap',
  'eye',
  'wifi',
  'trending_down',
] as const;

export type RevealIconName = typeof REVEAL_ICONS[number];
