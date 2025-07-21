export type Language = 'gu' | 'hi' | 'en';

export type NoteContent = {
  title: string;
  body: string;
};

export type Note = {
  id: string;
  content: {
    [key in Language]?: NoteContent;
  };
  color: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
};
