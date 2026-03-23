export interface Task {
  id: string;
  title: string;
  content: string;
  created_at: string;
  due_date?: string | null;
  updated_at?: string;
  is_completed: boolean;
}
