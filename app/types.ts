export interface Habit {
    id: number;
    name: string;
    completed: boolean;
    userId: number;
  }
  
export interface HabitEntry {
  date: string;
  habits: Habit[];
};

export interface HabitStats {
  name: string;
  completionRate: number;
};

export type TabsParamList = {
  index: undefined;
};