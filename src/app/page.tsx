"use client";

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/AppHeader';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditor } from '@/components/NoteEditor';
import { Button } from '@/components/ui/button';

// Mock data to simulate fetching from a database
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'મારો પહેલો વિચાર',
    body: 'આ ગુજરાતીમાં મારી પ્રથમ નોંધ છે. હું મારી નોટ-ટેકીંગ એપ્લિકેશન બનાવવા માટે ઉત્સાહિત છું. આ એક ખૂબ જ સુંદર અને ઉપયોગી એપ્લિકેશન બનશે.',
    color: '#B2E4A8', // Light Green
    isPinned: true,
    createdAt: new Date('2023-10-26T10:00:00Z'),
    updatedAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: '2',
    title: 'ખરીદીની યાદી',
    body: '- દૂધ\n- બ્રેડ\n- ઈંડા\n- શાકભાજી\n- ફળો',
    color: '#A8B778', // Soft Olive
    isPinned: false,
    createdAt: new Date('2023-10-25T15:30:00Z'),
    updatedAt: new Date('2023-10-25T15:30:00Z'),
  },
  {
    id: '3',
    title: 'પ્રોજેક્ટ માટેના વિચારો',
    body: 'AI સુવિધા માટે જેમિની API નો ઉપયોગ કરો. વપરાશકર્તાની નોંધોના સારાંશ માટે એક ફંક્શન બનાવો. ગ્રીડ અને લિસ્ટ વ્યુ માટે ટોગલ ઉમેરો. ડાર્ક મોડ પણ ઉમેરો.',
    color: '#F0F8F0', // Very light green
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
  }, []);
  
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

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

  const handleSaveNote = (noteToSave: Omit<Note, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    if (noteToSave.id) {
      setNotes(notes.map(n => n.id === noteToSave.id ? { ...n, ...noteToSave, updatedAt: new Date() } : n));
    } else {
      const newNote: Note = {
        ...noteToSave,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
    }
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, isPinned: !note.isPinned } : note));
  };

  const sortedAndFilteredNotes = useMemo(() => {
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [notes, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onCreateNew={handleCreateNewNote}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        {sortedAndFilteredNotes.length > 0 ? (
          <div className={cn(
            "transition-all duration-300",
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-4 max-w-4xl mx-auto"
          )}>
            <AnimatePresence>
              {sortedAndFilteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <NoteCard
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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
      />

      <div className="fixed bottom-8 right-8 z-20">
         <Button onClick={handleCreateNewNote} className="rounded-full h-16 w-16 shadow-lg hover:scale-105 transition-transform">
           <Plus className="h-8 w-8" />
           <span className="sr-only">Create New Note</span>
         </Button>
      </div>
    </div>
  );
}
