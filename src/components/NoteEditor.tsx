"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mic, MicOff, Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Note, Language } from '@/lib/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
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

const colorPalette = ['#FFFFFF', '#FADADD', '#D3F4E2', '#FFF6D1', '#E3F2FD', '#FFE0B2', '#E1BEE7', '#FFCDD2'];

export function NoteEditor({ isOpen, onOpenChange, note, onSave, currentLanguage }: NoteEditorProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
  
  const EditorForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 sm:px-0">
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
                  <Textarea placeholder="Start writing your note..." className="min-h-[200px] resize-y pr-12" {...field} />
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
                   {field.value === color && <Check className="h-5 w-5 mx-auto my-auto text-primary-foreground" style={{color: '#222222'}} />}
                   <span className="sr-only">{color}</span>
                 </button>
               ))}
             </div>
          )}
        />

        {!isMobile && (
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        )}
        
        {isMobile && (
          <DrawerFooter className="pt-2">
             <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{note ? 'Edit Note' : 'Create New Note'}</DrawerTitle>
            <DrawerDescription>
              {note ? 'Make changes to your note.' : 'Fill in the details for your new note.'}
            </DrawerDescription>
          </DrawerHeader>
          {EditorForm}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Create New Note'}</DialogTitle>
           <DialogDescription>
            {note ? 'Make changes to your note.' : 'Fill in the details for your new note.'}
          </DialogDescription>
        </DialogHeader>
        {EditorForm}
      </DialogContent>
    </Dialog>
  );
}