import { spawn } from 'child_process';
import { GenerateIdeasResponse, GenerateCarouselResponse, Brand, BrandStyleGuide, Product, Campaign } from '@/types';

const KIMI_CLI_PATH = process.env.KIMI_CLI_PATH || 'kimi';

interface GenerateIdeasInput {
  brand: Brand;
  styleGuide: BrandStyleGuide | null;
  products: Product[];
  campaign: Campaign;
  numIdeas: number;
}

interface GenerateCarouselInput {
  brand: Brand;
  styleGuide: BrandStyleGuide | null;
  products: Product[];
  campaign: Campaign;
  contentTitle: string;
  contentDescription: string;
}

function buildIdeasPrompt(input: GenerateIdeasInput): string {
  const { brand, styleGuide, products, campaign, numIdeas } = input;
  
  return `Generate ${numIdeas} social media content ideas for the following campaign:

BRAND: ${brand.name}
${brand.description ? `DESCRIPTION: ${brand.description}` : ''}
${styleGuide?.voice_guidelines ? `VOICE GUIDELINES: ${styleGuide.voice_guidelines}` : ''}

CAMPAIGN: ${campaign.name}
OBJECTIVE: ${campaign.objective}
${campaign.start_date ? `START DATE: ${campaign.start_date}` : ''}
${campaign.end_date ? `END DATE: ${campaign.end_date}` : ''}

PRODUCTS:
${products.map(p => `- ${p.name}: ${p.description || 'No description'}${p.price ? ` ($${p.price})` : ''}`).join('\n')}

CHANNELS: ${campaign.channels.join(', ') || 'Instagram, TikTok'}

Generate creative, engaging content ideas that align with the brand voice and campaign objective. 

Respond with a JSON object in this exact format:
{
  "ideas": [
    {
      "title": "Short, catchy title for the content idea",
      "description": "Brief description of the concept and angle"
    }
  ]
}

Generate exactly ${numIdeas} ideas. Be creative and specific to the brand and products.`;
}

function buildCarouselPrompt(input: GenerateCarouselInput): string {
  const { brand, styleGuide, products, campaign, contentTitle, contentDescription } = input;
  
  return `Generate a carousel post with 5-7 slides for the following:

BRAND: ${brand.name}
${styleGuide?.voice_guidelines ? `VOICE GUIDELINES: ${styleGuide.voice_guidelines}` : ''}

CAMPAIGN: ${campaign.name}
OBJECTIVE: ${campaign.objective}

PRODUCTS:
${products.map(p => `- ${p.name}: ${p.description || 'No description'}`).join('\n')}

CONTENT IDEA:
Title: ${contentTitle}
Description: ${contentDescription}

Generate a carousel structure with the following slide types:
1. HOOK - Attention-grabbing headline that stops the scroll
2. PROBLEM/CONTEXT - Set up the problem or context
3. VALUE/PROOF - Show value, social proof, or benefits
4. SOLUTION - Present the product as solution
5. HOW IT WORKS - Brief tutorial or explanation
6. CTA - Call to action

Respond with a JSON object in this exact format:
{
  "slides": [
    {
      "slide_type": "hook|proof|tutorial|cta|generic",
      "headline": "Slide headline (keep it short, punchy)",
      "body": "Main body text (2-3 sentences max)",
      "cta_text": "Call to action text (if applicable)",
      "image_description": "Description of what image/visual should show"
    }
  ]
}

Rules:
- 5-7 slides maximum
- Each slide should have clear, concise copy
- Match the brand voice
- Focus on benefits, not just features
- Make CTAs actionable`;
}

async function callKimiCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const kimi = spawn(KIMI_CLI_PATH, ['ask', prompt, '--no-stream'], {
      shell: true,
      env: { ...process.env },
    });

    let output = '';
    let error = '';

    kimi.stdout.on('data', (data) => {
      output += data.toString();
    });

    kimi.stderr.on('data', (data) => {
      error += data.toString();
    });

    kimi.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Kimi CLI exited with code ${code}: ${error}`));
      } else {
        resolve(output);
      }
    });

    kimi.on('error', (err) => {
      reject(new Error(`Failed to spawn Kimi CLI: ${err.message}`));
    });
  });
}

function extractJSON<T>(text: string): T {
  // Try to find JSON in markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim()) as T;
  }
  
  // Try to find JSON between curly braces
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as T;
  }
  
  // Try parsing the whole text
  return JSON.parse(text) as T;
}

export async function generateContentIdeas(input: GenerateIdeasInput): Promise<GenerateIdeasResponse> {
  const prompt = buildIdeasPrompt(input);
  const response = await callKimiCLI(prompt);
  return extractJSON<GenerateIdeasResponse>(response);
}

export async function generateCarouselSlides(input: GenerateCarouselInput): Promise<GenerateCarouselResponse> {
  const prompt = buildCarouselPrompt(input);
  const response = await callKimiCLI(prompt);
  return extractJSON<GenerateCarouselResponse>(response);
}
