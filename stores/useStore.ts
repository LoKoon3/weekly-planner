
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Goal, WeeklyReview, UserSettings } from '../types';

interface AppState {
  tasks: Task[];
  goals: Goal[];
  reviews: WeeklyReview[];
  settings: UserSettings;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  
  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  deleteGoal: (id: string) => void;
  
  // Reviews
  addReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => void;
  
  // Settings
  setTheme: (theme: 'light' | 'dark') => void;
  setGoogleConnected: (connected: boolean, token?: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      goals: [],
      reviews: [],
      settings: {
        googleConnected: false,
        theme: 'light',
      },

      addTask: (task) => set((state) => {
        const newTask = {
          ...task,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        console.log('📝 새 할 일 추가:', newTask);
        const newTasks = [...state.tasks, newTask].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        console.log('📋 전체 할 일 목록:', newTasks);
        return { tasks: newTasks };
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t)
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      toggleTaskComplete: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t)
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, {
          ...goal,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now()
        }]
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      addReview: (review) => set((state) => ({
        reviews: [...state.reviews.filter(r => !(r.year === review.year && r.weekNumber === review.weekNumber)), {
          ...review,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now()
        }]
      })),

      setTheme: (theme) => set((state) => ({
        settings: { ...state.settings, theme }
      })),

      setGoogleConnected: (connected, token) => set((state) => ({
        settings: { ...state.settings, googleConnected: connected, googleAccessToken: token }
      })),
    }),
    {
      name: 'weekly-planner-storage',
    }
  )
);
