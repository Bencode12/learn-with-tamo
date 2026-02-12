import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ChevronLeft, ChevronRight, Download, Presentation } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  content: string;
  layout: 'title' | 'content' | 'split';
}

interface PresentationEditorProps {
  subject: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export const PresentationEditor = ({ subject, initialContent = "", onSave }: PresentationEditorProps) => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        return parsed.slides || [{ id: '1', title: subject, content: 'Click to edit subtitle', layout: 'title' }];
      } catch {
        return [{ id: '1', title: subject, content: 'Click to edit subtitle', layout: 'title' }];
      }
    }
    return [{ id: '1', title: subject, content: 'Click to edit subtitle', layout: 'title' }];
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const addSlide = () => {
    const newSlide: Slide = {
      id: String(Date.now()),
      title: 'New Slide',
      content: 'Click to edit content',
      layout: 'content'
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== currentSlide));
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const updateSlide = (field: 'title' | 'content', value: string) => {
    setSlides(prev => prev.map((s, i) => i === currentSlide ? { ...s, [field]: value } : s));
  };

  const handleExport = () => {
    const html = slides.map((s, i) => 
      `<div style="page-break-after:always;padding:40px;min-height:600px;">
  <h1>${s.title}</h1>
  <p>${s.content}</p>
  <p style="color:#999;font-size:12px;">Slide ${i + 1}</p>
</div>`
    ).join('\n');
    const blob = new Blob([`<html><body>${html}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject}_presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(JSON.stringify({ slides }));
    }
  };

  const slide = slides[currentSlide];

  if (isPresenting) {
    return (
      <div 
        className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
        onClick={() => {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
          } else {
            setIsPresenting(false);
          }
        }}
      >
        <div className="max-w-4xl w-full text-white text-center p-12">
          <h1 className="text-5xl font-bold mb-8">{slide.title}</h1>
          <p className="text-2xl text-white/80 whitespace-pre-wrap">{slide.content}</p>
        </div>
        <div className="absolute bottom-4 right-4 text-white/50 text-sm">
          {currentSlide + 1} / {slides.length} • Click to advance • ESC to exit
        </div>
        <button
          className="absolute top-4 right-4 text-white/50 hover:text-white"
          onClick={(e) => { e.stopPropagation(); setIsPresenting(false); }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Slide sidebar */}
      <div className="w-48 border-r bg-muted/20 overflow-y-auto p-2 space-y-2">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`p-2 rounded cursor-pointer border text-xs transition-colors ${
              i === currentSlide ? 'border-primary bg-primary/5' : 'border-border/40 hover:bg-muted/50'
            }`}
            onClick={() => setCurrentSlide(i)}
          >
            <div className="aspect-video bg-background rounded mb-1 flex items-center justify-center p-2">
              <span className="font-medium truncate text-[10px]">{s.title}</span>
            </div>
            <span className="text-muted-foreground">Slide {i + 1}</span>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full gap-1" onClick={addSlide}>
          <Plus className="h-3 w-3" />
          Add Slide
        </Button>
      </div>

      {/* Main editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))} disabled={currentSlide === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{currentSlide + 1} / {slides.length}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))} disabled={currentSlide === slides.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={deleteSlide} disabled={slides.length <= 1}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {onSave && (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
              <Download className="h-4 w-4" />
              Save
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setCurrentSlide(0); setIsPresenting(true); }}>
            <Presentation className="h-4 w-4" />
            Present
          </Button>
        </div>

        {/* Slide canvas */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/10 overflow-auto">
          <Card className="w-full max-w-3xl aspect-video p-12 flex flex-col items-center justify-center shadow-lg">
            <input
              className="text-3xl font-bold text-center w-full border-none outline-none bg-transparent mb-6 placeholder:text-muted-foreground/40"
              value={slide.title}
              onChange={(e) => updateSlide('title', e.target.value)}
              placeholder="Slide Title"
            />
            <Textarea
              className="text-lg text-center border-none shadow-none resize-none bg-transparent focus-visible:ring-0 flex-1"
              value={slide.content}
              onChange={(e) => updateSlide('content', e.target.value)}
              placeholder="Slide content..."
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
