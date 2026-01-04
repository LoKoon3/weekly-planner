
export type Priority = 'high' | 'medium' | 'low';
export type TimeTag = 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'night';
export type GoalType = 'yearly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:MM
  endTime: string;        // HH:MM
  priority: Priority;
  timeTag?: TimeTag;
  memo?: string;
  completed: boolean;
  googleEventId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  type: GoalType;
  year: number;
  month?: number;
  content: string;
  createdAt: number;
}

export interface WeeklyReview {
  id: string;
  year: number;
  weekNumber: number;
  completionRate: number;
  comment: string;
  createdAt: number;
}

export interface UserSettings {
  googleConnected: boolean;
  googleAccessToken?: string;
  theme: 'light' | 'dark';
}
