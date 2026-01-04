
export const formatDate = (date: Date): string => {
  // 로컬 시간 기준으로 YYYY-MM-DD 포맷
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekRange = (currentDate: Date) => {
  const date = new Date(currentDate);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = date.getDate() - (day === 0 ? 6 : day - 1); // Adjust for Monday start
  const monday = new Date(date.setDate(diff));
  
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    weekDays.push(nextDay);
  }
  return weekDays;
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const getTimeDecimal = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
};

// 주차에서 가장 높은 월 계산 (연도 경계 처리 포함)
export const getHighestMonth = (weekDays: Date[]): { month: number; year: number } => {
  if (weekDays.length === 0) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }

  // 주간의 모든 날짜에서 가장 높은 월 찾기
  let highestMonth = 0;
  let highestYear = 0;

  weekDays.forEach(day => {
    const month = day.getMonth() + 1; // 1-12
    const year = day.getFullYear();

    // 연도가 더 높거나, 같은 연도에서 월이 더 높은 경우
    if (year > highestYear || (year === highestYear && month > highestMonth)) {
      highestMonth = month;
      highestYear = year;
    }
  });

  return { month: highestMonth, year: highestYear };
};
