"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mic, MicOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Note, Language } from '@/lib/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  body: z.string().min(1, 'Note body cannot be empty'),
  color: z.string(),
  isPinned: z.boolean(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  note: Note | null;
  onSave: (note: NoteFormData & { id?: string }) => void;
  currentLanguage: Language;
}

const colorPalette = ['#F0F8F0', '#B2E4A8', '#A8B778', '#F3E5AB', '#FFDDC1', '#FFC0CB', '#C1D1FF', '#B2F7E8'];

export function NoteEditor({ isOpen, onOpenChange, note, onSave, currentLanguage }: NoteEditorProps) {
  const { toast } = useToast();
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      body: '',
      color: colorPalette[0],
      isPinned: false,
    },
  });

  const languageToLocale: Record<Language, string> = {
    en: 'en-US',
    gu: 'gu-IN',
    hi: 'hi-IN',
  };

  const {
    isListening,
    startListening,
    stopListening,
    error: speechError,
    setLanguage,
    hasRecognitionSupport
  } = useSpeechRecognition((transcript) => {
    form.setValue('body', form.getValues('body') + transcript, { shouldValidate: true });
  });

  useEffect(() => {
    setLanguage(languageToLocale[currentLanguage]);
  }, [currentLanguage, setLanguage]);

  useEffect(() => {
    if (speechError) {
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: speechError,
      });
    }
  }, [speechError, toast]);

  useEffect(() => {
    if (isOpen) {
      const currentNoteContent = note?.content?.[currentLanguage];
      const defaultValues = {
        title: note && currentNoteContent ? currentNoteContent.title : '',
        body: note && currentNoteContent ? currentNoteContent.body : '',
        color: note ? note.color : colorPalette[0],
        isPinned: note ? note.isPinned : false,
      };
      form.reset(defaultValues);
    }
  }, [isOpen, note, form, currentLanguage]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const onSubmit = (data: NoteFormData) => {
    onSave({ ...data, id: note?.id });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{note ? 'Edit Note' : 'Create New Note'}</DialogTitle>
           <DialogDescription>
            {note ? 'Make changes to your note.' : 'Fill in the details for your new note.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea placeholder="Start writing your note..." className="min-h-[200px] pr-12" {...field} />
                      {hasRecognitionSupport && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleMicClick}
                          className={cn("absolute top-2 right-2", isListening ? "text-destructive" : "text-muted-foreground")}
                        >
                          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                          <span className="sr-only">{isListening ? 'Stop recording' : 'Start recording'}</span>
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Controller
              control={form.control}
              name="color"
              render={({ field }) => (
                 <div className="flex items-center gap-2 flex-wrap">
                   <FormLabel className="text-sm font-medium">Color:</FormLabel>
                   {colorPalette.map((color) => (
                     <button
                       key={color}
                       type="button"
                       className="h-8 w-8 rounded-full border-2 transition-transform transform hover:scale-110"
                       style={{ backgroundColor: color, borderColor: field.value === color ? 'hsl(var(--primary))' : 'transparent' }}
                       onClick={() => field.onChange(color)}
                     >
                       {field.value === color && <Check className="h-5 w-5 mx-auto my-auto text-primary-foreground" style={{color: color === '#F0F8F0' ? 'black' : 'white'}} />}
                       <span className="sr-only">{color}</span>
                     </button>
                   ))}
                 </div>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
