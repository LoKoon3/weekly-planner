
import { Priority, TimeTag } from '../types';

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-500 text-white border-red-600',
  medium: 'bg-amber-400 text-white border-amber-500',
  low: 'bg-gray-400 text-white border-gray-500',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '상',
  medium: '중',
  low: '하',
};

export const TIME_TAG_COLORS: Record<TimeTag, string> = {
  morning: 'bg-orange-100 text-orange-700',   // 05-08
  forenoon: 'bg-blue-100 text-blue-700',     // 08-12
  afternoon: 'bg-green-100 text-green-700',   // 12-17
  evening: 'bg-purple-100 text-purple-700',   // 17-21
  night: 'bg-indigo-100 text-indigo-700',     // 21-05
};

export const TIME_TAG_LABELS: Record<TimeTag, string> = {
  morning: '아침',
  forenoon: '오전',
  afternoon: '오후',
  evening: '저녁',
  night: '밤',
};

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 시간대 블록 정의
export const TIME_PERIODS = [
  { id: 'morning', label: '아침', startHour: 4, endHour: 8, color: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'forenoon', label: '오전', startHour: 9, endHour: 12, color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'afternoon', label: '오후', startHour: 13, endHour: 17, color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'evening', label: '저녁', startHour: 18, endHour: 21, color: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'night', label: '밤', startHour: 22, endHour: 3, color: 'bg-indigo-50 dark:bg-indigo-900/20' },
] as const;

// 시간(HH:MM)을 받아서 해당 시간대 ID 반환
export const getTimePeriodId = (timeStr: string): string => {
  const hour = parseInt(timeStr.split(':')[0], 10);

  // 밤 시간대 (22-03시)는 특별 처리
  if (hour >= 22 || hour <= 3) return 'night';
  if (hour >= 4 && hour <= 8) return 'morning';
  if (hour >= 9 && hour <= 12) return 'forenoon';
  if (hour >= 13 && hour <= 17) return 'afternoon';
  if (hour >= 18 && hour <= 21) return 'evening';

  return 'forenoon'; // 기본값
};
