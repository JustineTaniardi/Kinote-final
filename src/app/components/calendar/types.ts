export type Difficulty = "easy" | "medium" | "hard";

export interface TaskItem {
  id: string | number;
  title: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  difficulty: Difficulty;
  description?: string;
  kategori?: string;
  status?: string;
}

export type ViewMode = "week" | "today";
