"use client";

import { Search, PenSquare, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateNew: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function AppHeader({ 
  searchQuery, 
  setSearchQuery, 
  onCreateNew, 
  viewMode, 
  onViewModeChange,
  language,
  onLanguageChange
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">
            SmartNote
          </h1>
        </div>

        <div className="flex-1 flex justify-center px-2 sm:px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="sm:hidden">
             <ThemeToggle />
          </div>
          <Select value={language} onValueChange={(value: Language) => onLanguageChange(value)}>
            <SelectTrigger className="w-auto sm:w-[120px] text-xs sm:text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gu">Gujarati</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center gap-1 bg-muted p-1 rounded-lg">
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
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>
          <div className="hidden md:flex">
            <Button onClick={onCreateNew}>
              <PenSquare className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
