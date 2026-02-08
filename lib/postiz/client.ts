import { Platform, ScheduledPostStatus } from '@/types';

const POSTIZ_API_URL = process.env.POSTIZ_API_URL;
const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;

interface CreateScheduledPostInput {
  platform: Platform;
  caption: string;
  hashtags?: string;
  imageUrls: string[];
  scheduledAt: Date;
}

interface PostizResponse {
  id: string;
  status: ScheduledPostStatus;
}

interface PostizMetrics {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export class PostizClient {
  private apiUrl: string;
  private apiKey: string;
  private isConfigured: boolean;

  constructor() {
    this.apiUrl = POSTIZ_API_URL || '';
    this.apiKey = POSTIZ_API_KEY || '';
    this.isConfigured = !!(this.apiUrl && this.apiKey);
  }

  private ensureConfigured() {
    if (!this.isConfigured) {
      throw new Error('Postiz API credentials not configured');
    }
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    this.ensureConfigured();
    
    const url = `${this.apiUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Postiz API error: ${error}`);
    }

    return response.json();
  }

  async createScheduledPost(
    accountId: string,
    input: CreateScheduledPostInput
  ): Promise<PostizResponse> {
    return this.fetch<PostizResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        platform: input.platform,
        caption: input.caption,
        hashtags: input.hashtags,
        media_urls: input.imageUrls,
        scheduled_at: input.scheduledAt.toISOString(),
      }),
    });
  }

  async getPostStatus(jobId: string): Promise<ScheduledPostStatus> {
    const response = await this.fetch<{ status: ScheduledPostStatus }>(`/posts/${jobId}/status`);
    return response.status;
  }

  async getPostMetrics(jobId: string): Promise<PostizMetrics> {
    return this.fetch<PostizMetrics>(`/posts/${jobId}/metrics`);
  }

  async cancelScheduledPost(jobId: string): Promise<void> {
    await this.fetch(`/posts/${jobId}/cancel`, {
      method: 'POST',
    });
  }
}

// Singleton instance - only create if configured
export const postizClient = new PostizClient();
