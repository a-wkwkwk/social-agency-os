'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2, Plus, Eye, Download, Loader2 } from 'lucide-react';
import { CarouselSlide, SlideType, BrandStyleGuide } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CarouselEditorProps {
  contentId: string;
  contentTitle: string;
  slides: CarouselSlide[];
  styleGuide: BrandStyleGuide | null;
  brandName: string;
  onChange: (slides: CarouselSlide[]) => void;
}

const slideTypeLabels: Record<SlideType, string> = {
  hook: 'Hook',
  proof: 'Proof',
  tutorial: 'Tutorial',
  cta: 'CTA',
  generic: 'Generic',
};

interface PreviewData {
  html: string;
}

function SortableSlideItem({
  slide,
  onUpdate,
  onDelete,
}: {
  slide: CarouselSlide;
  onUpdate: (id: string, updates: Partial<CarouselSlide>) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <button
              className="mt-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <Select
                  value={slide.slide_type}
                  onValueChange={(value) => onUpdate(slide.id, { slide_type: value as SlideType })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(slideTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(slide.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Headline</label>
                <Input
                  value={slide.headline || ''}
                  onChange={(e) => onUpdate(slide.id, { headline: e.target.value })}
                  placeholder="Slide headline..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Body</label>
                <Textarea
                  value={slide.body || ''}
                  onChange={(e) => onUpdate(slide.id, { body: e.target.value })}
                  placeholder="Slide body text..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">CTA Text</label>
                  <Input
                    value={slide.cta_text || ''}
                    onChange={(e) => onUpdate(slide.id, { cta_text: e.target.value })}
                    placeholder="e.g., Learn More"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Image Description</label>
                  <Input
                    value={slide.image_description || ''}
                    onChange={(e) => onUpdate(slide.id, { image_description: e.target.value })}
                    placeholder="Visual description..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CarouselEditor({ 
  contentId, 
  contentTitle,
  slides, 
  styleGuide, 
  brandName,
  onChange 
}: CarouselEditorProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      const newSlides = arrayMove(slides, oldIndex, newIndex);
      
      const reorderedSlides = newSlides.map((slide, index) => ({
        ...slide,
        position: index,
      }));
      
      onChange(reorderedSlides);
    }
  };

  const handleUpdateSlide = (id: string, updates: Partial<CarouselSlide>) => {
    const newSlides = slides.map((slide) =>
      slide.id === id ? { ...slide, ...updates } : slide
    );
    onChange(newSlides);
  };

  const handleDeleteSlide = (id: string) => {
    const newSlides = slides
      .filter((slide) => slide.id !== id)
      .map((slide, index) => ({ ...slide, position: index }));
    onChange(newSlides);
  };

  const handleAddSlide = () => {
    const newSlide: CarouselSlide = {
      id: `temp-${Date.now()}`,
      content_piece_id: contentId,
      position: slides.length,
      slide_type: 'generic',
      headline: '',
      body: '',
      cta_text: '',
      image_description: '',
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onChange([...slides, newSlide]);
  };

  const generatePreview = async () => {
    setPreviewLoading(true);
    try {
      const response = await fetch('/api/carousel/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_title: contentTitle,
          brand_name: brandName,
          style_guide: styleGuide,
          slides,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate preview');
      
      const data = await response.json();
      setPreviewHtml(data.html);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const exportImages = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/carousel/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_piece_id: contentId,
        }),
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carousel-${contentId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Slides ({slides.length})</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={generatePreview} disabled={previewLoading}>
                <Eye className="h-4 w-4 mr-2" />
                {previewLoading ? 'Loading...' : 'Live Preview'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Carousel Preview</DialogTitle>
              </DialogHeader>
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px] border rounded"
                  title="Carousel Preview"
                />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Click "Live Preview" to generate
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={exportImages} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Images'}
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {slides.map((slide) => (
            <SortableSlideItem
              key={slide.id}
              slide={slide}
              onUpdate={handleUpdateSlide}
              onDelete={handleDeleteSlide}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button onClick={handleAddSlide} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Slide
      </Button>
    </div>
  );
}
