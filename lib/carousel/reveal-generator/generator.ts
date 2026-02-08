/**
 * Reveal.js Carousel Generator
 * Adapted from https://github.com/drbobber/reveal-carousel-generator
 * 
 * Generates reveal.js HTML from brand config and slides
 */

import { 
  RevealBrand, 
  RevealSlide, 
  DesignPlanSlide,
  RevealElement,
  RevealIconName 
} from './types';

// SVG icons (inline, no external files)
const ICONS: Record<RevealIconName | string, string> = {
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
  lightning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
  trending: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--secondary)"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><polyline points="20 6 9 17 4 12"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--secondary)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  diamond: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><polygon points="12 2 22 9 12 22 2 9"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--highlight)"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  trending_down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#f87171"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
};

// Semantic layer → z-index mapping
const LAYER_ZINDEX: Record<string, number> = {
  background: 0,
  decorative: 2,
  foreground: 5,
};

// Position presets
const PRESETS: Record<string, { x: number; y: number }> = {
  'top-left': { x: 8, y: 8 },
  'top-right': { x: 85, y: 8 },
  'bottom-left': { x: 8, y: 78 },
  'bottom-right': { x: 85, y: 78 },
  'center-right': { x: 82, y: 42 },
  'center-left': { x: 5, y: 42 },
  'center': { x: 42, y: 42 },
};

export interface CarouselGenerationOptions {
  title?: string;
  includeRevealJs?: boolean;
}

/**
 * Generate CSS from brand configuration
 */
function generateCSS(brand: RevealBrand): string {
  const c = brand.colors;
  const t = brand.typography;

  return `
:root {
  --primary: ${c.primary};
  --secondary: ${c.secondary};
  --highlight: ${c.highlight};
  --bg-dark: ${c.background_dark};
  --bg-mid: ${c.background_mid};
  --bg-light: ${c.background_light};
  --text-main: ${c.text_main};
  --text-body: ${c.text_body};
  --text-dim: ${c.text_dim};
  --card-bg: ${c.card_bg};
  --card-border: ${c.card_border};
}
.reveal { font-family: ${t.font_family}; }

.reveal .slides section {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center;
  height: 100%;
  padding: 60px 90px 90px !important;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.reveal .slides section.bg-gradient {
  background: linear-gradient(160deg, var(--bg-dark) 0%, var(--bg-mid) 40%, var(--bg-light) 100%);
}

.reveal .slides section.bg-photo {
  background-size: cover;
  background-position: center;
}
.reveal .slides section.bg-photo::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 18, 0.65);
  z-index: 1;
}

.reveal .slides section::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 8px;
  background: linear-gradient(90deg, var(--primary), var(--secondary), var(--primary));
  z-index: 3;
}

.content-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 0%;
  width: 100%;
  max-width: 900px;
  min-height: 0;
}

.brand-strip {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 2;
  padding: 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.brand-strip .line { width: 34px; height: 2px; background: var(--primary); opacity: 0.5; }
.brand-strip .label { font-size: ${t.label_size}px; letter-spacing: 5px; color: var(--text-dim); text-transform: uppercase; font-weight: 500; }

.slide-num {
  position: absolute;
  top: 38px; right: 48px;
  z-index: 3;
  font-size: 15px;
  color: var(--text-dim);
  letter-spacing: 2px;
  font-weight: 500;
}

.reveal h1 {
  font-size: ${t.h1_size}px;
  line-height: 1.05;
  margin: 0 0 16px;
  color: var(--text-main);
  text-transform: none;
  font-weight: 800;
  letter-spacing: -2px;
}
.reveal .bg-gradient h1 {
  background: linear-gradient(90deg, var(--primary), var(--highlight));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.reveal h2 {
  font-size: ${t.h2_size}px;
  color: var(--secondary);
  margin: 0 0 32px;
  text-transform: none;
  font-weight: 700;
  line-height: 1.15;
}
.reveal .bg-photo h2 { color: var(--text-main); text-shadow: 0 2px 16px rgba(0,0,0,0.4); }
.reveal h3 {
  font-size: ${t.subtitle_size}px;
  color: var(--text-body);
  margin: 10px 0 0;
  text-transform: none;
  font-weight: 400;
  line-height: 1.45;
  opacity: 0.85;
}
.reveal p {
  font-size: ${t.body_size}px;
  line-height: 1.7;
  color: var(--text-body);
  max-width: 820px;
  margin: 0;
}

.tag {
  display: inline-block;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--bg-dark);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 10px 28px;
  border-radius: 40px;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.card {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 22px;
  padding: 40px 48px;
  max-width: 820px;
  width: 100%;
  box-sizing: border-box;
}
.reveal .bg-photo .card {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.18);
}
.card p { margin: 0; font-size: ${t.body_size}px; }

.reveal ul { list-style: none; padding: 0; margin: 0; text-align: left; max-width: 800px; width: 100%; }
.reveal ul li {
  font-size: ${t.list_size}px;
  color: var(--text-body);
  padding: 16px 0;
  line-height: 1.5;
  border-bottom: 1px solid rgba(116,198,157,0.2);
}
.reveal ul li:last-child { border-bottom: none; }
.reveal ul li::before { content: "✦ "; color: var(--primary); font-size: 0.8em; }
.reveal .bg-photo ul li { border-bottom-color: rgba(255,255,255,0.15); }
.reveal .bg-photo ul li::before { content: "— "; color: #f0c040; }

.num-big {
  font-size: 150px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 10px;
  letter-spacing: -5px;
}
.reveal .bg-gradient .num-big {
  background: linear-gradient(135deg, var(--primary), var(--highlight));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.reveal .bg-photo .num-big { color: #f0c040; text-shadow: 0 4px 30px rgba(0,0,0,0.4); }

.quote-mark {
  font-size: 130px;
  line-height: 0.7;
  color: var(--primary);
  font-family: Georgia, serif;
  margin-bottom: 16px;
  display: block;
}
.reveal .bg-photo .quote-mark { color: #f0c040; opacity: 0.85; }
.quote-text { font-style: italic; font-size: 46px !important; color: var(--text-main) !important; line-height: 1.5; max-width: 780px; }
.quote-author { color: var(--secondary) !important; font-size: 30px !important; margin-top: 24px !important; font-weight: 600; letter-spacing: 1px; }
.reveal .bg-photo .quote-author { color: #f0c040 !important; }

.hi { color: var(--highlight); font-weight: 700; }
.reveal .bg-photo .hi { color: #ffe07a; }
.check { color: var(--highlight); font-size: 40px; font-weight: 700; }
.reveal .bg-photo .check { color: #f0c040; }

.reveal .controls { display: none !important; }
.reveal .progress { display: none !important; }

.particles { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.particles .dot {
  position: absolute;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0.15;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.18;
  z-index: 1;
  pointer-events: none;
}
.orb.top-right { top: -80px; right: -80px; width: 320px; height: 320px; background: var(--primary); }
.orb.bottom-left { bottom: -60px; left: -60px; width: 280px; height: 280px; background: var(--secondary); }
.orb.mid-right { top: 50%; right: -100px; width: 260px; height: 260px; background: var(--bg-light); transform: translateY(-50%); }

.icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.icon-svg svg { width: 72px; height: 72px; }

.icon-circle {
  width: 96px; height: 96px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 28px;
}
.icon-circle svg { width: 48px; height: 48px; }

.corner-line {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}
.corner-line.tl { top: 24px; left: 24px; width: 48px; height: 48px; border-top: 2px solid var(--primary); border-left: 2px solid var(--primary); opacity: 0.3; }
.corner-line.tr { top: 24px; right: 24px; width: 48px; height: 48px; border-top: 2px solid var(--primary); border-right: 2px solid var(--primary); opacity: 0.3; }
.corner-line.bl { bottom: 60px; left: 24px; width: 48px; height: 48px; border-bottom: 2px solid var(--primary); border-left: 2px solid var(--primary); opacity: 0.3; }
.corner-line.br { bottom: 60px; right: 24px; width: 48px; height: 48px; border-bottom: 2px solid var(--primary); border-right: 2px solid var(--primary); opacity: 0.3; }

.num-bullet {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  color: var(--highlight);
  font-size: 16px;
  font-weight: 700;
  margin-right: 12px;
  flex-shrink: 0;
}
.reveal ul li.numbered { display: flex; align-items: flex-start; }
.reveal ul li.numbered::before { content: none !important; }

.stat-row {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}
.stat-box {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px 28px;
  text-align: center;
  min-width: 180px;
}
.stat-box .stat-num { font-size: 36px; font-weight: 800; color: var(--highlight); line-height: 1; margin-bottom: 6px; }
.stat-box .stat-label { font-size: 18px; color: var(--text-body); opacity: 0.75; }

.json-element {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.json-element svg { width: 100%; height: 100%; }
.json-element img { width: 100%; height: 100%; object-fit: contain; }
.json-element .shape-circle { border-radius: 50%; }
.json-element .shape-square { border-radius: 12px; }
.json-element .shape-diamond { transform: rotate(45deg); border-radius: 8px; }
.json-element .shape-ring {
  border-radius: 50%;
  border: 3px solid currentColor;
  background: transparent !important;
}
`;
}

/**
 * Generate decorative particles HTML
 */
function particlesHTML(count = 8): string {
  const positions = [
    { x: 8, y: 12, s: 4 }, { x: 88, y: 18, s: 3 }, { x: 15, y: 75, s: 5 }, { x: 82, y: 70, s: 4 },
    { x: 50, y: 8, s: 3 }, { x: 92, y: 45, s: 2 }, { x: 5, y: 45, s: 3 }, { x: 75, y: 90, s: 5 },
    { x: 40, y: 88, s: 4 }, { x: 60, y: 15, s: 2 }, { x: 25, y: 35, s: 3 }, { x: 70, y: 55, s: 4 }
  ];
  return `<div class="particles">${positions.slice(0, count).map(p =>
    `<div class="dot" style="left:${p.x}%;top:${p.y}%;width:${p.s}px;height:${p.s}px;"></div>`
  ).join('')}</div>`;
}

/**
 * Generate glowing orbs HTML
 */
function orbsHTML(variant = 'default'): string {
  const configs: Record<string, string[]> = {
    default: ['top-right', 'bottom-left'],
    mid: ['mid-right', 'bottom-left'],
    corners: ['top-right', 'bottom-left'],
  };
  return (configs[variant] || configs.default).map(cls => `<div class="orb ${cls}"></div>`).join('');
}

/**
 * Generate corner lines HTML
 */
function cornerLinesHTML(): string {
  return `<div class="corner-line tl"></div><div class="corner-line tr"></div><div class="corner-line bl"></div><div class="corner-line br"></div>`;
}

/**
 * Render JSON-driven elements
 */
function renderElements(elements?: RevealElement[]): string {
  if (!elements || !Array.isArray(elements) || elements.length === 0) return '';

  return elements.map(el => {
    const pos = el.position?.preset
      ? PRESETS[el.position.preset] || PRESETS['top-right']
      : { x: el.position?.x ?? 85, y: el.position?.y ?? 10 };

    const elWidth = el.width || el.size || 80;
    const elHeight = el.height || el.size || 80;
    const opacity = el.opacity ?? 1;
    const colorOverride = el.color || null;

    let borderCSS = 'none';
    if (el.border) {
      borderCSS = `${el.border.width || 2}px solid ${el.border.color || 'var(--card-border)'}`;
    }
    const borderRadius = el.border?.radius || (el.type === 'icon' ? '20px' : '12px');
    const bgCSS = el.background || 'transparent';
    const zIndex = el.layer
      ? (LAYER_ZINDEX[el.layer] ?? 2)
      : (el.z_index ?? 2);

    let innerHTML = '';
    if (el.type === 'icon' && el.icon) {
      let svg = ICONS[el.icon] || ICONS.rocket;
      if (colorOverride) {
        svg = svg.replace(/style="color:[^"]*"/, `style="color:${colorOverride}"`);
      }
      innerHTML = svg;
    } else if (el.type === 'shape') {
      const shapeClass = `shape-${el.shape || 'circle'}`;
      innerHTML = `<div class="${shapeClass}" style="width:100%;height:100%;background:${el.fill || bgCSS};"></div>`;
    } else if (el.type === 'image' && el.src) {
      const objFit = el.object_fit || 'contain';
      innerHTML = `<img src="${el.src}" style="width:100%;height:100%;object-fit:${objFit};" />`;
    }

    return `<div class="json-element" style="
      left: ${pos.x}%;
      top: ${pos.y}%;
      width: ${elWidth}px;
      height: ${elHeight}px;
      opacity: ${opacity};
      z-index: ${zIndex};
      border: ${borderCSS};
      border-radius: ${borderRadius};
      background: ${bgCSS};
      overflow: hidden;
    ">${innerHTML}</div>`;
  }).join('\n');
}

/**
 * Get icon circle HTML
 */
function iconCircleHTML(iconName: string): string {
  return `<div class="icon-circle">${ICONS[iconName] || ICONS.rocket}</div>`;
}

/**
 * Wrap slide with container
 */
function wrapSlide(
  slideNum: number,
  totalSlides: number,
  brand: RevealBrand,
  slide: RevealSlide,
  inner: string
): string {
  const bgClass = slide.background_image ? 'bg-photo' : 'bg-gradient';
  let bgStyle = '';
  if (slide.background_image) {
    bgStyle = `style="background-image:url('${slide.background_image}')"`;
  }

  let overlayStyle = '';
  if (slide.background_image && slide.overlay_opacity) {
    overlayStyle = `<div style="position:absolute;inset:0;background:rgba(10,10,18,${slide.overlay_opacity});z-index:1;"></div>`;
  }

  const numLabel = brand.style.show_slide_numbers
    ? `<div class="slide-num">${String(slideNum).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}</div>`
    : '';

  const particles = particlesHTML(slideNum === 1 || slideNum === totalSlides ? 10 : 7);
  const orbs = orbsHTML(slideNum % 3 === 0 ? 'mid' : 'default');
  const corners = cornerLinesHTML();
  const jsonElements = renderElements(slide.elements);

  return `
        <!-- SLIDE ${slideNum} -->
        <section class="${bgClass}" ${bgStyle}>
            ${numLabel}
            ${overlayStyle}
            ${particles}
            ${orbs}
            ${corners}
            ${jsonElements}
            <div class="content-wrap">
                ${inner}
            </div>
            <div class="brand-strip"><div class="line"></div><div class="label">${brand.style.brand_label}</div><div class="line"></div></div>
        </section>`;
}

/**
 * Build cover slide
 */
function buildCover(brand: RevealBrand, slide: RevealSlide): string {
  return `
                ${iconCircleHTML('rocket')}
                <div class="tag">${brand.style.brand_label}</div>
                <h1>${(slide.title || '').replace(/\n/g, '<br>')}</h1>
                <h3>${slide.subtitle || ''}</h3>`;
}

/**
 * Build closing slide
 */
function buildClosing(brand: RevealBrand, slide: RevealSlide): string {
  return `
                ${iconCircleHTML('target')}
                <div class="tag" style="background:linear-gradient(135deg,var(--secondary),var(--highlight))">${brand.style.tone.charAt(0).toUpperCase() + brand.style.tone.slice(1)}</div>
                <h1>${(slide.title || '').replace(/\n/g, '<br>')}</h1>
                <h3>${slide.subtitle || ''}</h3>`;
}

/**
 * Build title card slide
 */
function buildTitleCard(slide: RevealSlide): string {
  const sentences = (slide.content || '').split(/(?<=[.!])\s+/);
  const formattedBody = sentences.map(s => s.trim()).filter(Boolean).join('<br><br>');

  return `
                ${iconCircleHTML('brain')}
                <h2>${(slide.title || '').replace(/[.!]$/, '')}</h2>
                <div class="card">
                    <p>${formattedBody}</p>
                </div>`;
}

/**
 * Build title list slide
 */
function buildTitleList(slide: RevealSlide): string {
  const items = slide.items || [];
  const isNumbered = items.some(i => /^(Key|Step|Phase|Tool)\s*\d/i.test(i));

  return `
                ${iconCircleHTML('target')}
                <h2>${(slide.title || '').replace(/[.!]$/, '')}</h2>
                <ul>
                    ${items.map((item, idx) => {
                      const cleanItem = item.replace(/^(Key|Step|Phase|Tool)\s*\d[:.—–-]*\s*/i, '');
                      if (isNumbered) {
                        return `<li class="numbered"><span class="num-bullet">${idx + 1}</span>${cleanItem}</li>`;
                      }
                      return `<li>${cleanItem}</li>`;
                    }).join('\n                    ')}
                </ul>`;
}

/**
 * Build hero number slide
 */
function buildHeroNumber(slide: RevealSlide): string {
  const sentences = (slide.content || '').split(/(?<=[.!])\s+/);
  const formattedBody = sentences.map(s => s.trim()).filter(Boolean).join('<br><br>');

  return `
                ${iconCircleHTML('chart')}
                <div class="num-big">${slide.hero_number || '0'}</div>
                <h2>${slide.title || ''}</h2>
                <div class="card">
                    <p>${formattedBody}</p>
                </div>`;
}

/**
 * Build quote slide
 */
function buildQuote(slide: RevealSlide): string {
  return `
                <div class="quote-mark">&ldquo;</div>
                <p class="quote-text">${slide.content || ''}</p>
                <p class="quote-author">— ${slide.author || ''}</p>`;
}

/**
 * Build individual slide
 */
function buildSlide(brand: RevealBrand, slide: RevealSlide, index: number, total: number): string {
  let inner: string;
  switch (slide.type) {
    case 'cover':
      inner = buildCover(brand, slide);
      break;
    case 'closing':
      inner = buildClosing(brand, slide);
      break;
    case 'title_card':
      inner = buildTitleCard(slide);
      break;
    case 'title_list':
      inner = buildTitleList(slide);
      break;
    case 'hero_number':
      inner = buildHeroNumber(slide);
      break;
    case 'quote':
      inner = buildQuote(slide);
      break;
    default:
      inner = buildTitleCard(slide);
  }
  return wrapSlide(index + 1, total, brand, slide, inner);
}

/**
 * Generate complete carousel HTML
 */
export function generateCarouselHTML(
  brand: RevealBrand,
  slides: RevealSlide[],
  options: CarouselGenerationOptions = {}
): string {
  const css = generateCSS(brand);
  const slidesHTML = slides.map((slide, index) => buildSlide(brand, slide, index, slides.length)).join('\n');
  const title = options.title || slides[0]?.title || 'Carousel';

  // CDN links for reveal.js (can be self-hosted too)
  const revealCSS = 'https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.css';
  const revealJS = 'https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.js';

  return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${revealCSS}">
    <style>${css}</style>
</head>
<body>
<div class="reveal">
    <div class="slides">
${slidesHTML}
    </div>
</div>
<script src="${revealJS}"></script>
<script>
    Reveal.initialize({
        width: 1080,
        height: 1350,
        margin: 0,
        controls: false,
        progress: false,
        slideNumber: false,
        hash: false,
        transition: 'none',
    });
</script>
</body>
</html>`;
}

/**
 * Convert Marketing Agency OS slides to Reveal slides
 */
export function convertToRevealSlides(
  contentTitle: string,
  carouselSlides: { slide_type: string; headline: string | null; body: string | null; cta_text: string | null }[]
): RevealSlide[] {
  const revealSlides: RevealSlide[] = [];

  // Add cover slide
  revealSlides.push({
    type: 'cover',
    title: contentTitle,
    subtitle: 'Scroll to discover',
  });

  // Convert carousel slides
  for (const slide of carouselSlides) {
    const type = slide.slide_type as string;
    
    if (type === 'hook') {
      revealSlides.push({
        type: 'title_card',
        title: slide.headline || '',
        content: slide.body || '',
      });
    } else if (type === 'tutorial' || type === 'proof') {
      // Split body into items if it contains list-like content
      const items = slide.body?.split(/\n|\.\s+/).filter(s => s.trim().length > 10) || [];
      if (items.length >= 3) {
        revealSlides.push({
          type: 'title_list',
          title: slide.headline || '',
          items: items.slice(0, 5),
        });
      } else {
        revealSlides.push({
          type: 'title_card',
          title: slide.headline || '',
          content: slide.body || '',
        });
      }
    } else if (type === 'cta') {
      revealSlides.push({
        type: 'closing',
        title: slide.headline || 'Take Action',
        subtitle: slide.cta_text || slide.body || '',
      });
    } else {
      revealSlides.push({
        type: 'title_card',
        title: slide.headline || '',
        content: slide.body || '',
      });
    }
  }

  return revealSlides;
}

/**
 * Convert brand style guide to Reveal brand config
 */
export function convertToRevealBrand(
  brandName: string,
  styleGuide: {
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
    heading_font: string | null;
    body_font: string | null;
    voice_guidelines: string | null;
  } | null
): RevealBrand {
  const primary = styleGuide?.primary_color || '#6366f1';
  const secondary = styleGuide?.secondary_color || '#818cf8';
  const highlight = styleGuide?.accent_color || '#c4b5fd';

  // Generate background colors from primary
  const bgDark = '#0f0e17';
  const bgMid = '#1a1833';
  const bgLight = '#2e1065';

  return {
    name: brandName,
    handle: `@${brandName.toLowerCase().replace(/\s+/g, '')}`,
    colors: {
      primary,
      secondary,
      highlight,
      background_dark: bgDark,
      background_mid: bgMid,
      background_light: bgLight,
      text_main: '#FFFFFF',
      text_body: '#F0F0F5',
      text_dim: 'rgba(255,255,255,0.5)',
      card_bg: 'rgba(26,24,51,0.75)',
      card_border: `${primary}40`,
    },
    typography: {
      font_family: styleGuide?.heading_font || "'Inter', system-ui, sans-serif",
      h1_size: 88,
      h2_size: 64,
      body_size: 36,
      list_size: 32,
      subtitle_size: 34,
      label_size: 20,
    },
    style: {
      tone: styleGuide?.voice_guidelines?.slice(0, 20) || 'Professional',
      accent_style: 'gradient',
      card_style: 'glassmorphism',
      brand_label: brandName.toUpperCase(),
      show_slide_numbers: true,
      overlay_range: [0.55, 0.72],
    },
  };
}
