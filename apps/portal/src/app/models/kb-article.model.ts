export interface KbArticle {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  publishedAt: Date;
}
