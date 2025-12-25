
export type MediaType = 'image' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  name: string;
}

export interface ContentSection {
  id: string;
  heading: string;
  body: string;
}

export interface LayoutData {
  id: string;
  title: string;
  description: string;
  sections: ContentSection[];
  media: MediaItem[];
  themeColor: string;
  createdAt: number;
}

export interface AISuggestion {
  refinedTitle: string;
  refinedDescription: string;
  suggestedTheme: string;
  sections: { heading: string; body: string }[];
}
