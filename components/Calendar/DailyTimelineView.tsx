
import React, { useMemo } from 'react';
import { useStore } from '../../stores/useStore';
import { PRIORITY_COLORS, WEEKDAYS } from '../../constants';
import { formatDate, getTimeDecimal } from '../../utils/dateUtils';
import { Task } from '../../types';

interface DailyTimelineViewProps {
  selectedDate: Date;
  onBack: () => void;
}

const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({ selectedDate, onBack }) => {
  const { tasks } = useStore();
  const dateStr = formatDate(selectedDate);
  const dayOfWeek = selectedDate.getDay();
  const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일(0) -> 6, 월요일(1) -> 0

  // 해당 날짜의 할 일 필터링
  const dayTasks = useMemo(() => {
    return tasks.filter(t => t.date === dateStr);
  }, [tasks, dateStr]);

  // 겹치는 할 일 처리를 위한 레이어 계산
  const taskLayers = useMemo(() => {
    const sorted = [...dayTasks].sort((a, b) => {
      const startA = getTimeDecimal(a.startTime);
      const startB = getTimeDecimal(b.startTime);
      return startA - startB;
    });

    const layers: { task: Task; layer: number }[] = [];
    const endTimes: number[] = []; // 각 레이어의 종료 시간

    sorted.forEach(task => {
      const start = getTimeDecimal(task.startTime);
      let assignedLayer = 0;

      // 사용 가능한 가장 낮은 레이어 찾기
      for (let i = 0; i < endTimes.length; i++) {
        if (endTimes[i] <= start) {
          assignedLayer = i;
          break;
        }
        assignedLayer = i + 1;
      }

      const end = getTimeDecimal(task.endTime);
      endTimes[assignedLayer] = end;
      layers.push({ task, layer: assignedLayer });
    });

    return layers;
  }, [dayTasks]);

  const maxLayer = Math.max(0, ...taskLayers.map(l => l.layer));
  const hourWidth = 60; // 시간당 픽셀
  const layerHeight = 50; // 레이어당 높이
  const totalWidth = 24 * hourWidth;

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          주간 뷰로 돌아가기
        </button>
        <div className="text-center">
          <div className="text-lg font-bold dark:text-white">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({WEEKDAYS[weekdayIndex]})
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {dayTasks.length}개의 할 일
          </div>
        </div>
        <div className="w-[140px]" /> {/* Spacer for centering */}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
        <div style={{ width: `${totalWidth}px`, minHeight: '100%' }}>
          {/* Hour markers */}
          <div className="flex border-b dark:border-gray-700 pb-2 mb-4">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                style={{ width: `${hourWidth}px` }}
                className="text-xs font-bold text-gray-400 text-center shrink-0"
              >
                {i.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="relative" style={{ height: `${(maxLayer + 1) * layerHeight + 40}px` }}>
            {/* Vertical hour lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  style={{ width: `${hourWidth}px` }}
                  className="border-l dark:border-gray-700/50 shrink-0"
                />
              ))}
            </div>

            {/* Task bars */}
            {taskLayers.map(({ task, layer }) => {
              const start = getTimeDecimal(task.startTime);
              const end = getTimeDecimal(task.endTime);
              const duration = end - start;
              const left = start * hourWidth;
              const width = Math.max(duration * hourWidth, 40);
              const top = layer * layerHeight + 10;

              return (
                <div
                  key={task.id}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${layerHeight - 10}px`,
                  }}
                  className={`rounded-lg border-l-4 shadow-sm px-3 py-2 overflow-hidden
                    ${PRIORITY_COLORS[task.priority]}
                    ${task.completed ? 'opacity-50 grayscale' : 'opacity-100'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold truncate ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    {task.completed && (
                      <svg className="w-4 h-4 shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {task.startTime} - {task.endTime}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {dayTasks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">이 날에는 할 일이 없습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">상 (High)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">중 (Medium)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">하 (Low)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTimelineView;
