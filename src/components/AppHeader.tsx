"use client";

import { Search, PenSquare, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateNew: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function AppHeader({ searchQuery, setSearchQuery, onCreateNew, viewMode, onViewModeChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold font-headline text-accent-foreground bg-accent py-1 px-3 rounded-md hidden sm:block">
          Gujarati Notes
        </h1>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('grid')}
              className={cn("h-8 w-8", viewMode === 'grid' && "shadow-sm")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('list')}
              className={cn("h-8 w-8", viewMode === 'list' && "shadow-sm")}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
          <ThemeToggle />
          <div className="hidden sm:flex">
            <Button onClick={onCreateNew}>
              <PenSquare className="mr-2 h-5 w-5" />
              New Note
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
