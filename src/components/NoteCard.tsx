"use client";

import { useState } from 'react';
import { Pin, PinOff, Pencil, Trash2, Sparkles, Loader2 } from 'lucide-react';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';
import { summarizeNote } from '@/ai/flows/summarize-long-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  viewMode: 'grid' | 'list';
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, viewMode }: NoteCardProps) {
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    try {
      const result = await summarizeNote({ note: note.body });
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

  const cardStyle = {
    backgroundColor: note.color,
  };
  
  const getTextColor = (bgColor: string) => {
    if (!bgColor || bgColor.length < 7) return 'black';
    const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? 'black' : 'white';
  };

  const textColorClass = getTextColor(note.color) === 'black' ? 'text-slate-800' : 'text-white';
  const mutedTextColorClass = getTextColor(note.color) === 'black' ? 'text-slate-600' : 'text-slate-200';
  const iconColorClass = getTextColor(note.color) === 'black' ? 'text-slate-700 hover:text-slate-900' : 'text-slate-100 hover:text-white';


  return (
    <>
      <Card className={cn("flex flex-col h-full transition-shadow duration-300 hover:shadow-xl", textColorClass)} style={cardStyle}>
        <CardHeader className="relative pb-2">
          <CardTitle className="font-headline pr-8">{note.title}</CardTitle>
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
            viewMode === 'grid' ? 'line-clamp-6' : 'line-clamp-2'
            )}>{note.body}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
           <CardDescription className={cn('text-xs', mutedTextColorClass)}>
            {new Date(note.updatedAt).toLocaleDateString()}
           </CardDescription>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className={iconColorClass} onClick={() => onEdit(note)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
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

            <Button
              variant="ghost"
              size="icon"
              className={iconColorClass}
              onClick={handleSummarize}
              disabled={isSummarizing || note.body.length < 50}
              title={note.body.length < 50 ? 'Note too short to summarize' : 'Summarize note'}
            >
              {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="sr-only">Summarize</span>
            </Button>
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
