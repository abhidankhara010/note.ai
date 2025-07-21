"use client";

import { useState } from 'react';
import { Pin, PinOff, Pencil, Trash2, Sparkles, Loader2, Languages, Copy, Share2, Download } from 'lucide-react';
import type { Note, Language, NoteContent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { summarizeNote } from '@/ai/flows/summarize-long-notes';
import { translateNote } from '@/ai/flows/translate-note-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateNote: (note: Note) => void;
  viewMode: 'grid' | 'list';
  currentLanguage: Language;
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onUpdateNote, viewMode, currentLanguage }: NoteCardProps) {
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [summary, setSummary] = useState('');
  
  const noteContent = note.content[currentLanguage] ?? { title: 'Untitled', body: '' };

  const handleSummarize = async () => {
    if (!noteContent.body) return;
    setIsSummarizing(true);
    setSummary('');
    try {
      const result = await summarizeNote({ note: noteContent.body });
      setSummary(result.summary);
    } catch (error) {
      console.error('Summarization failed:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'Could not generate a summary for this note.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranslate = async (targetLang: Language) => {
    if (note.content[targetLang]) return; // Already translated
    setIsTranslating(true);
    try {
      const result = await translateNote({
        title: noteContent.title,
        body: noteContent.body,
        targetLanguage: targetLang,
      });
      const updatedNote = {
        ...note,
        content: {
          ...note.content,
          [targetLang]: {
            title: result.translatedTitle,
            body: result.translatedBody,
          },
        },
        updatedAt: new Date(),
      };
      onUpdateNote(updatedNote);
      toast({
        title: 'Note Translated',
        description: `Successfully translated to ${targetLang}.`,
      });
    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: 'Could not translate this note.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const cardStyle = { backgroundColor: note.color };
  
  const getTextColor = (bgColor: string) => {
    if (!bgColor || bgColor.length < 7) return 'text-slate-800';
    const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65 ? 'text-slate-800' : 'text-white';
  };

  const textColorClass = getTextColor(note.color);
  const mutedTextColorClass = textColorClass === 'text-white' ? 'text-slate-200' : 'text-slate-600';
  const iconColorClass = textColorClass === 'text-white' ? 'text-slate-100 hover:text-white' : 'text-slate-700 hover:text-slate-900';

  const languages: Language[] = ['gu', 'hi', 'en'];

  return (
    <>
      <Card className={cn("flex flex-col h-full transition-shadow duration-300 hover:shadow-xl border-0", textColorClass)} style={cardStyle}>
        <CardHeader className="relative pb-2">
          <CardTitle className="font-headline pr-8">{noteContent.title}</CardTitle>
          <button
            onClick={() => onTogglePin(note.id)}
            className={cn("absolute top-4 right-4 p-1 rounded-full transition-colors", iconColorClass)}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            {note.isPinned ? <Pin className="h-5 w-5 fill-current" /> : <PinOff className="h-5 w-5" />}
          </button>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className={cn(
            "whitespace-pre-wrap text-sm",
            viewMode === 'grid' ? 'line-clamp-6' : 'line-clamp-none'
            )}>{noteContent.body}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
           <CardDescription className={cn('text-xs', mutedTextColorClass)}>
            {new Date(note.updatedAt).toLocaleDateString()}
           </CardDescription>
          <div className="flex items-center gap-0">
            <Button variant="ghost" size="icon" className={iconColorClass} onClick={() => onEdit(note)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={iconColorClass}
                  disabled={isTranslating}
                >
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  <span className="sr-only">Translate</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.filter(lang => lang !== currentLanguage && !note.content[lang]).map(lang => (
                  <DropdownMenuItem key={lang} onClick={() => handleTranslate(lang)}>
                    Translate to {lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'English'}
                  </DropdownMenuItem>
                ))}
                 {languages.filter(lang => lang !== currentLanguage && !note.content[lang]).length === 0 && (
                   <DropdownMenuItem disabled>Already Translated</DropdownMenuItem>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className={iconColorClass}
              onClick={handleSummarize}
              disabled={isSummarizing || noteContent.body.length < 50}
              title={noteContent.body.length < 50 ? 'Note too short to summarize' : 'Summarize note'}
            >
              {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="sr-only">Summarize</span>
            </Button>
            
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("hover:text-destructive", iconColorClass)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(note.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={!!summary} onOpenChange={(open) => !open && setSummary('')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Summary</AlertDialogTitle>
            <AlertDialogDescription>
              {summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSummary('')}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
