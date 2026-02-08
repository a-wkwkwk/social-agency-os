/**
 * Reveal Carousel Export
 * Screenshot generation using Puppeteer
 */

import puppeteer from 'puppeteer';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { RevealBrand, RevealSlide, ExportOptions } from './types';
import { generateCarouselHTML } from './generator';

const DEFAULT_OPTIONS: Required<ExportOptions> = {
  width: 1080,
  height: 1350,
  quality: 90,
  outputDir: './output',
};

export interface ExportResult {
  slideNumber: number;
  buffer: Buffer;
  filename: string;
}

/**
 * Export carousel slides to PNG images
 */
export async function exportCarouselToImages(
  brand: RevealBrand,
  slides: RevealSlide[],
  options: ExportOptions = {}
): Promise<ExportResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Generate HTML
  const html = generateCarouselHTML(brand, slides, {
    title: slides[0]?.title || 'Carousel',
  });

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      `--window-size=${opts.width},${opts.height}`,
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: opts.width, height: opts.height });

    // Load HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for Reveal to initialize
    await page.waitForFunction(
      () => typeof (window as unknown as { Reveal?: { isReady: () => boolean } }).Reveal !== 'undefined' && 
           (window as unknown as { Reveal?: { isReady: () => boolean } }).Reveal!.isReady(),
      { timeout: 10000 }
    );

    // Disable transitions
    await page.evaluate(() => {
      const Reveal = (window as unknown as { Reveal: { configure: (opts: unknown) => void } }).Reveal;
      Reveal.configure({ transition: 'none', transitionSlideLevel: 'none' });
    });

    // Count slides
    const totalSlides = await page.evaluate(
      () => document.querySelectorAll('.reveal .slides > section').length
    );

    const results: ExportResult[] = [];

    for (let i = 0; i < totalSlides; i++) {
      // Navigate to slide
      await page.evaluate((idx: number) => {
        const Reveal = (window as unknown as { Reveal: { slide: (idx: number) => void } }).Reveal;
        Reveal.slide(idx);
      }, i);

      // Wait for slide to be active
      await page.waitForFunction(
        (idx: number) => {
          const sections = document.querySelectorAll('.reveal .slides > section');
          return sections[idx] && sections[idx].classList.contains('present');
        },
        { timeout: 5000 },
        i
      );

      // Wait for paint to settle
      await new Promise(r => setTimeout(r, 150));

      // Screenshot the slide element
      const handle = await page.evaluateHandle((idx: number) => {
        return document.querySelectorAll('.reveal .slides > section')[idx];
      }, i);

      const num = String(i + 1).padStart(2, '0');
      const filename = `slide-${num}.png`;
      const buffer = await handle.screenshot({ 
        type: 'png',
        encoding: 'binary',
      }) as Buffer;

      await handle.dispose();

      results.push({
        slideNumber: i + 1,
        buffer,
        filename,
      });
    }

    return results;
  } finally {
    await browser.close();
  }
}

/**
 * Export carousel to single PDF (optional)
 */
export async function exportCarouselToPDF(
  brand: RevealBrand,
  slides: RevealSlide[],
  options: ExportOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const html = generateCarouselHTML(brand, slides, {
    title: slides[0]?.title || 'Carousel',
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for Reveal
    await page.waitForFunction(
      () => typeof (window as unknown as { Reveal?: { isReady: () => boolean } }).Reveal !== 'undefined' && 
           (window as unknown as { Reveal?: { isReady: () => boolean } }).Reveal!.isReady(),
      { timeout: 10000 }
    );

    const pdf = await page.pdf({
      width: opts.width,
      height: opts.height,
      printBackground: true,
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

/**
 * Generate and save carousel images to disk
 */
export async function saveCarouselImages(
  brand: RevealBrand,
  slides: RevealSlide[],
  outputDir: string
): Promise<string[]> {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const { writeFileSync } = await import('fs');
  const results = await exportCarouselToImages(brand, slides, { outputDir });
  
  const savedPaths: string[] = [];
  for (const result of results) {
    const filepath = resolve(outputDir, result.filename);
    writeFileSync(filepath, result.buffer);
    savedPaths.push(filepath);
  }

  return savedPaths;
}
