import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { ContentPiece } from '@/types';

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-purple-100 text-purple-800',
};

async function getContentPieces(): Promise<(ContentPiece & { brands: { name: string }, campaigns: { name: string } | null })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content_pieces')
    .select('*, brands(name), campaigns(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content:', error);
    return [];
  }

  return data || [];
}

export default async function ContentPage() {
  const contentPieces = await getContentPieces();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content</h1>
          <p className="text-slate-600 mt-1">Manage content pieces and carousels</p>
        </div>
        <Button asChild>
          <Link href="/content/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Link>
        </Button>
      </div>

      {contentPieces.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No content yet</h3>
          <p className="text-slate-600 mb-4">
            Start creating content for your campaigns.
          </p>
          <Button asChild>
            <Link href="/content/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contentPieces.map((content) => (
            <Link key={content.id} href={`/content/${content.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{content.title}</h3>
                        <Badge className={statusColors[content.status] || 'bg-slate-100'}>
                          {content.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{content.content_type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>{content.brands?.name}</span>
                        {content.campaigns && (
                          <>
                            <span>•</span>
                            <span>{content.campaigns.name}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(content.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
