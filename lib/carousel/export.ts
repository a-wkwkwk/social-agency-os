import puppeteer from 'puppeteer';
import { CarouselSlide, BrandStyleGuide } from '@/types';

interface ExportOptions {
  width?: number;
  height?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: ExportOptions = {
  width: 1080,
  height: 1350,
  quality: 90,
};

function generateSlideHTML(
  slide: CarouselSlide,
  styleGuide: BrandStyleGuide | null,
  options: ExportOptions
): string {
  const primaryColor = styleGuide?.primary_color || '#1a1a1a';
  const secondaryColor = styleGuide?.secondary_color || '#f5f5f5';
  const accentColor = styleGuide?.accent_color || '#3b82f6';
  const headingFont = styleGuide?.heading_font || 'Inter, sans-serif';
  const bodyFont = styleGuide?.body_font || 'Inter, sans-serif';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${options.width}px;
      height: ${options.height}px;
      background: ${secondaryColor};
      font-family: ${bodyFont};
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .slide-number {
      position: absolute;
      top: 30px;
      left: 30px;
      font-size: 14px;
      color: ${primaryColor};
      opacity: 0.5;
      font-family: ${bodyFont};
    }
    .slide-type {
      position: absolute;
      top: 30px;
      right: 30px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: ${accentColor};
      font-family: ${bodyFont};
      font-weight: 600;
    }
    h1 {
      font-family: ${headingFont};
      font-size: 64px;
      font-weight: 800;
      color: ${primaryColor};
      line-height: 1.1;
      margin-bottom: 40px;
    }
    p {
      font-size: 32px;
      color: ${primaryColor};
      line-height: 1.5;
      opacity: 0.9;
    }
    .cta {
      margin-top: 50px;
      padding: 20px 40px;
      background: ${accentColor};
      color: white;
      font-size: 24px;
      font-weight: 600;
      border-radius: 8px;
      display: inline-block;
      font-family: ${headingFont};
    }
    .accent-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: ${accentColor};
    }
  </style>
</head>
<body>
  <div class="slide-number">${slide.position + 1}</div>
  <div class="slide-type">${slide.slide_type}</div>
  ${slide.headline ? `<h1>${escapeHtml(slide.headline)}</h1>` : ''}
  ${slide.body ? `<p>${escapeHtml(slide.body)}</p>` : ''}
  ${slide.cta_text ? `<div class="cta">${escapeHtml(slide.cta_text)}</div>` : ''}
  <div class="accent-bar"></div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function exportSlidesToImages(
  slides: CarouselSlide[],
  styleGuide: BrandStyleGuide | null,
  options: ExportOptions = {}
): Promise<Buffer[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const images: Buffer[] = [];

    for (const slide of slides) {
      const html = generateSlideHTML(slide, styleGuide, opts);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: opts.quality,
        clip: {
          x: 0,
          y: 0,
          width: opts.width!,
          height: opts.height!,
        },
      });

      images.push(screenshot);
    }

    return images;
  } finally {
    await browser.close();
  }
}

export async function exportSingleSlide(
  slide: CarouselSlide,
  styleGuide: BrandStyleGuide | null,
  options: ExportOptions = {}
): Promise<Buffer> {
  const images = await exportSlidesToImages([slide], styleGuide, options);
  return images[0];
}
