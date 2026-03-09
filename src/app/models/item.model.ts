export type Priority = 'low' | 'medium' | 'high';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  createdAt: Date;
  completed: boolean;
}
