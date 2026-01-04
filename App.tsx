
import React, { useState, useMemo } from 'react';
import { useStore } from './stores/useStore';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import WeeklyCalendar from './components/Calendar/WeeklyCalendar';
import DailyTimelineView from './components/Calendar/DailyTimelineView';
import GoalPanel from './components/Goals/GoalPanel';
import TaskModal from './components/Task/TaskModal';
import WeeklyReviewModal from './components/Review/WeeklyReviewModal';
import { getWeekRange, getWeekNumber, formatDate } from './utils/dateUtils';
import { Task } from './types';

const App: React.FC = () => {
  const { settings, tasks, setTheme } = useStore();
  const { isReady, isConnected, isLoading, error, signIn, signOut } = useGoogleAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 일별 상세 뷰 상태
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<Date | null>(null);

  const weekDays = useMemo(() => getWeekRange(currentDate), [currentDate]);
  const weekNum = useMemo(() => getWeekNumber(currentDate), [currentDate]);
  const year = currentDate.getFullYear();

  const currentWeekTasks = useMemo(() => {
    const dates = weekDays.map(d => formatDate(d));
    return tasks.filter(t => dates.includes(t.date));
  }, [tasks, weekDays]);

  const changeWeek = (offset: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset * 7);
    setCurrentDate(next);
  };

  const handleEmptySlotClick = (date: string, hour: number) => {
    setSelectedDate(date);
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDayForDetail(date);
  };

  const handleBackToWeekly = () => {
    setSelectedDayForDetail(null);
  };

  const handleGoogleAuth = () => {
    if (isConnected) {
      signOut();
    } else {
      signIn();
    }
  };

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
          ${isSidebarOpen ? 'w-80' : 'w-0'} 
          transition-all duration-300 ease-in-out border-r dark:border-gray-800 bg-white dark:bg-gray-900 
          hidden lg:flex flex-col p-6 overflow-hidden shrink-0
        `}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight">주간 플래너</h1>
          </div>
          
          <GoalPanel />

          <div className="mt-auto space-y-4">
            <button 
              onClick={() => setTheme(settings.theme === 'light' ? 'dark' : 'light')}
              className="w-full flex items-center justify-center gap-2 py-3 border dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {settings.theme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드'}
            </button>
            <div className="text-[10px] text-gray-400 text-center font-bold tracking-widest uppercase">
              © 2025 Weekly Planner Pro
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 px-6 flex items-center justify-between shrink-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold leading-none">{year}년 {weekNum}주차</h2>
                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                  {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                </span>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl ml-4">
                <button onClick={() => changeWeek(-1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold">오늘</button>
                <button onClick={() => changeWeek(1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
              >
                📊 주간 회고
              </button>
              
              <button
                onClick={handleGoogleAuth}
                disabled={!isReady || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border
                  ${isConnected
                    ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${(!isReady || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                {isLoading ? '연동 중...' : isConnected ? '연동 해제' : '구글 연동'}
              </button>
              {error && (
                <span className="text-xs text-red-500 max-w-[150px] truncate" title={error}>
                  {error}
                </span>
              )}
            </div>
          </header>

          {/* Calendar View */}
          <div className="flex-1 p-6 overflow-auto relative">
            {selectedDayForDetail ? (
              <DailyTimelineView
                selectedDate={selectedDayForDetail}
                onBack={handleBackToWeekly}
              />
            ) : (
              <WeeklyCalendar
                weekDays={weekDays}
                onTaskClick={handleTaskClick}
                onEmptySlotClick={handleEmptySlotClick}
                onDateClick={handleDateClick}
              />
            )}
            
            {/* FAB */}
            <button 
              onClick={() => {
                setTaskToEdit(null);
                setSelectedDate(formatDate(new Date()));
                setIsTaskModalOpen(true);
              }}
              className="absolute bottom-10 right-10 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-400/50 hover:scale-110 active:scale-95 transition-all z-40"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </main>

        {/* Modals */}
        <TaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          selectedDate={selectedDate}
          taskToEdit={taskToEdit}
        />
        <WeeklyReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)} 
          year={year}
          weekNumber={weekNum}
          tasks={currentWeekTasks}
        />
      </div>
    </div>
  );
};

export default App;
