"use client";

import { useState, useMemo, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import type { Note, Language } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/AppHeader';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditor } from '@/components/NoteEditor';
import { Chatbot } from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { summarizeNote } from '@/ai/flows/summarize-long-notes';


const initialNotes: Note[] = [
  {
    id: '1',
    content: {
      gu: {
        title: 'મારો પહેલો વિચાર',
        body: 'આ ગુજરાતીમાં મારી પ્રથમ નોંધ છે. હું મારી નોટ-ટેકીંગ એપ્લિકેશન બનાવવા માટે ઉત્સાહિત છું. આ એક ખૂબ જ સુંદર અને ઉપયોગી એપ્લિકેશન બનશે.',
      },
    },
    color: '#D3F4E2', // Mint Green
    isPinned: true,
    createdAt: new Date('2023-10-26T10:00:00Z'),
    updatedAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: '2',
    content: {
      gu: {
        title: 'ખરીદીની યાદી',
        body: '- દૂધ\n- બ્રેડ\n- ઈંડા\n- શાકભાજી\n- ફળો',
      },
      en: {
        title: 'Shopping List',
        body: '- Milk\n- Bread\n- Eggs\n- Vegetables\n- Fruits',
      }
    },
    color: '#FFF6D1', // Soft Yellow
    isPinned: false,
    createdAt: new Date('2023-10-25T15:30:00Z'),
    updatedAt: new Date('2023-10-25T15:30:00Z'),
  },
  {
    id: '3',
    content: {
      en: {
        title: 'Project Ideas',
        body: 'Use Gemini API for AI features. Create a function to summarize user notes. Add a toggle for grid and list view. Also add a dark mode.',
      },
      hi: {
        title: 'परियोजना के विचार',
        body: 'एआई सुविधाओं के लिए जेमिनी एपीआई का उपयोग करें। उपयोगकर्ता नोट्स को सारांशित करने के लिए एक फ़ंक्शन बनाएं। ग्रिड और सूची दृश्य के लिए एक टॉगल जोड़ें। डार्क मोड भी जोड़ें।',
      }
    },
    color: '#FADADD', // Soft Pink
    isPinned: false,
    createdAt: new Date('2023-10-24T09:00:00Z'),
    updatedAt: new Date('2023-10-24T09:00:00Z'),
  },
];


export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [language, setLanguage] = useState<Language>('gu');
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
        return value;
      }));
    } else {
      setNotes(initialNotes);
    }

    const savedViewMode = localStorage.getItem('viewMode') as 'grid' | 'list' | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const handleCreateNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleSaveNote = (noteToSave: Omit<Note, 'createdAt' | 'updatedAt' | 'id' | 'content'> & { id?: string; title: string; body: string; }) => {
    const { id, title, body, ...rest } = noteToSave;
    const noteContent = { title, body };

    if (id) {
      setNotes(notes.map(n => {
        if (n.id === id) {
          const newContent = { ...n.content, [language]: noteContent };
          return { ...n, ...rest, content: newContent, updatedAt: new Date() };
        }
        return n;
      }));
    } else {
      const newNote: Note = {
        ...rest,
        id: crypto.randomUUID(),
        content: { [language]: noteContent },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
    }
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };
  
  const handleTogglePin = (id: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, isPinned: !note.isPinned } : note));
  };

  const handleSummarize = async (note: Note) => {
    const noteContent = note.content[language];
    if (!noteContent || !noteContent.body) {
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'Note is empty.',
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const { summary } = await summarizeNote({ note: noteContent.body });
      toast({
        title: "✨ Note Summary",
        description: summary,
        duration: 9000,
      });
    } catch (error) {
      console.error('Summarization failed:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'Could not summarize this note.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const sortedAndFilteredNotes = useMemo(() => {
    const filtered = notes.filter(note => {
      if (!note.content) return false;
      const currentContent = note.content[language];
      if (!currentContent) return false;

      return currentContent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             currentContent.body.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [notes, searchQuery, language]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onCreateNew={handleCreateNewNote}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        {sortedAndFilteredNotes.length > 0 ? (
          <div className={cn(
            "transition-all duration-300",
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-4 max-w-4xl mx-auto"
          )}>
            {sortedAndFilteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onUpdateNote={handleUpdateNote}
                onSummarize={() => handleSummarize(note)}
                isSummarizing={isSummarizing}
                viewMode={viewMode}
                currentLanguage={language}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground mt-24 space-y-4">
            <h2 className="text-2xl font-semibold font-headline">No notes yet</h2>
            <p className="max-w-xs">Looks like your note space is empty. Why not create your first note?</p>
            <Button onClick={handleCreateNewNote} size="lg">
               <Plus className="mr-2 h-5 w-5" />
               Create First Note
            </Button>
          </div>
        )}
      </main>

      <NoteEditor
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        note={editingNote}
        onSave={handleSaveNote}
        currentLanguage={language}
      />

      <Chatbot />
      
      <div className="fixed bottom-6 right-6 z-20 sm:bottom-8 sm:right-8">
         <Button onClick={handleCreateNewNote} className="rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
           <Plus className="h-7 w-7 sm:h-8 sm:w-8" />
           <span className="sr-only">Create New Note</span>
         </Button>
      </div>
    </div>
  );
}
