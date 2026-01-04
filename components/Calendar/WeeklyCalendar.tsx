
import React, { useMemo } from 'react';
import { useStore } from '../../stores/useStore';
import { WEEKDAYS, PRIORITY_COLORS, TIME_TAG_COLORS, TIME_PERIODS, getTimePeriodId } from '../../constants';
import { formatDate } from '../../utils/dateUtils';
import { Task } from '../../types';

interface WeeklyCalendarProps {
  weekDays: Date[];
  onTaskClick: (task: Task) => void;
  onEmptySlotClick: (date: string, hour: number) => void;
  onDateClick: (date: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ weekDays, onTaskClick, onEmptySlotClick, onDateClick }) => {
  const { tasks, toggleTaskComplete } = useStore();

  // 날짜별 + 시간대별 할 일 그룹화
  const dayColumns = useMemo(() => {
    return weekDays.map(day => {
      const dateStr = formatDate(day);
      const dayTasks = tasks.filter(t => t.date === dateStr);

      // 시간대별 그룹화
      const tasksByPeriod: Record<string, Task[]> = {};
      TIME_PERIODS.forEach(period => {
        tasksByPeriod[period.id] = [];
      });

      dayTasks.forEach(task => {
        const periodId = getTimePeriodId(task.startTime);
        if (tasksByPeriod[periodId]) {
          tasksByPeriod[periodId].push(task);
        }
      });

      // 각 시간대 내에서 시간순 정렬
      Object.keys(tasksByPeriod).forEach(periodId => {
        tasksByPeriod[periodId].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      return {
        date: day,
        dateStr,
        tasksByPeriod,
        totalTasks: dayTasks.length,
      };
    });
  }, [weekDays, tasks]);

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-sm flex flex-col overflow-hidden">
      {/* Header - 날짜 클릭 가능 */}
      <div className="flex border-b dark:border-gray-700 ml-10 sm:ml-20">
        {weekDays.map((day, idx) => {
          const isToday = formatDate(day) === formatDate(new Date());
          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className="flex-1 py-2 sm:py-3 text-center border-l dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className={`text-[9px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                {WEEKDAYS[idx]}
              </div>
              <div className={`text-sm sm:text-xl font-black mt-0.5 ${isToday ? 'text-blue-600' : 'dark:text-white'}`}>
                {day.getDate()}
              </div>
              {dayColumns[idx].totalTasks > 0 && (
                <div className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">
                  {dayColumns[idx].totalTasks}개
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid - 시간대별 섹션 */}
      <div className="flex-1 overflow-y-auto">
        {TIME_PERIODS.map((period) => (
          <div key={period.id} className="flex border-b dark:border-gray-700 last:border-b-0">
            {/* Time Period Label */}
            <div className={`w-10 sm:w-20 shrink-0 p-1.5 sm:p-3 border-r dark:border-gray-700 ${period.color}`}>
              <div className="text-[10px] sm:text-sm font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                {period.label}
              </div>
              <div className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {period.id === 'night'
                  ? '22-03시'
                  : `${period.startHour.toString().padStart(2, '0')}-${period.endHour.toString().padStart(2, '0')}시`
                }
              </div>
            </div>

            {/* Day Columns */}
            {dayColumns.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`flex-1 min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border-l dark:border-gray-700 ${period.color}`}
                onClick={() => {
                  // 빈 영역 클릭 시 해당 시간대의 시작 시간으로 설정
                  const hour = period.id === 'night' ? 22 : period.startHour;
                  onEmptySlotClick(col.dateStr, hour);
                }}
              >
                <div className="space-y-1 sm:space-y-1.5">
                  {col.tasksByPeriod[period.id]?.map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      className={`p-1 sm:p-2 rounded-md sm:rounded-lg border-l-2 sm:border-l-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md group
                        ${PRIORITY_COLORS[task.priority]}
                        ${task.completed ? 'opacity-50 grayscale' : 'opacity-100'}
                      `}
                    >
                      <div className="flex items-start justify-between gap-0.5 sm:gap-1">
                        <h4 className={`text-[9px] sm:text-xs font-bold leading-tight line-clamp-2 ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className={`shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border flex items-center justify-center transition-colors
                            ${task.completed ? 'bg-white text-green-600 border-white' : 'bg-transparent border-white/50 hover:bg-white/20'}
                          `}
                        >
                          {task.completed && (
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="mt-0.5 sm:mt-1 flex flex-wrap gap-0.5 sm:gap-1">
                        <span className="text-[7px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full bg-black/10">
                          {task.startTime}
                        </span>
                        {task.timeTag && (
                          <span className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TIME_TAG_COLORS[task.timeTag]}`}>
                            #{task.timeTag}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
