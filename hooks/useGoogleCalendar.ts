import { useCallback } from 'react';
import { useStore } from '../stores/useStore';
import { Task } from '../types';
import { PRIORITY_LABELS, TIME_TAG_LABELS } from '../constants';

const TIMEZONE = 'Asia/Seoul';

// 할 일을 Google Calendar 이벤트로 변환
const taskToCalendarEvent = (task: Task) => {
  const priorityLabel = PRIORITY_LABELS[task.priority];
  const timeTagLabel = task.timeTag ? TIME_TAG_LABELS[task.timeTag] : '';

  const description = [
    task.memo || '',
    timeTagLabel ? `시간대: ${timeTagLabel}` : '',
    `우선순위: ${priorityLabel}`,
  ].filter(Boolean).join('\n');

  return {
    summary: `[${priorityLabel}] ${task.title}`,
    description,
    start: {
      dateTime: `${task.date}T${task.startTime}:00`,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: `${task.date}T${task.endTime}:00`,
      timeZone: TIMEZONE,
    },
  };
};

export const useGoogleCalendar = () => {
  const { settings, updateTask } = useStore();

  // 이벤트 생성
  const createEvent = useCallback(async (task: Task): Promise<string | null> => {
    if (!settings.googleConnected || !settings.googleAccessToken) {
      console.log('구글 캘린더 미연동');
      return null;
    }

    try {
      const event = taskToCalendarEvent(task);
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      const eventId = response.result.id;
      console.log('캘린더 이벤트 생성:', eventId);
      return eventId;
    } catch (err) {
      console.error('캘린더 이벤트 생성 실패:', err);
      return null;
    }
  }, [settings.googleConnected, settings.googleAccessToken]);

  // 이벤트 수정
  const updateEvent = useCallback(async (task: Task): Promise<boolean> => {
    if (!settings.googleConnected || !settings.googleAccessToken || !task.googleEventId) {
      return false;
    }

    try {
      const event = taskToCalendarEvent(task);
      await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: task.googleEventId,
        resource: event,
      });

      console.log('캘린더 이벤트 수정:', task.googleEventId);
      return true;
    } catch (err) {
      console.error('캘린더 이벤트 수정 실패:', err);
      return false;
    }
  }, [settings.googleConnected, settings.googleAccessToken]);

  // 이벤트 삭제
  const deleteEvent = useCallback(async (googleEventId: string): Promise<boolean> => {
    if (!settings.googleConnected || !settings.googleAccessToken || !googleEventId) {
      return false;
    }

    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      console.log('캘린더 이벤트 삭제:', googleEventId);
      return true;
    } catch (err) {
      console.error('캘린더 이벤트 삭제 실패:', err);
      return false;
    }
  }, [settings.googleConnected, settings.googleAccessToken]);

  // 할 일 생성과 동시에 캘린더 동기화
  const syncTaskToCalendar = useCallback(async (task: Task): Promise<void> => {
    if (!settings.googleConnected) return;

    const eventId = await createEvent(task);
    if (eventId) {
      updateTask(task.id, { googleEventId: eventId });
    }
  }, [settings.googleConnected, createEvent, updateTask]);

  // 할 일 수정과 동시에 캘린더 동기화
  const syncTaskUpdate = useCallback(async (task: Task): Promise<void> => {
    if (!settings.googleConnected) return;

    if (task.googleEventId) {
      await updateEvent(task);
    } else {
      // 기존에 연동 안됐으면 새로 생성
      const eventId = await createEvent(task);
      if (eventId) {
        updateTask(task.id, { googleEventId: eventId });
      }
    }
  }, [settings.googleConnected, createEvent, updateEvent, updateTask]);

  // 할 일 삭제와 동시에 캘린더 동기화
  const syncTaskDelete = useCallback(async (googleEventId?: string): Promise<void> => {
    if (!settings.googleConnected || !googleEventId) return;
    await deleteEvent(googleEventId);
  }, [settings.googleConnected, deleteEvent]);

  return {
    isConnected: settings.googleConnected,
    createEvent,
    updateEvent,
    deleteEvent,
    syncTaskToCalendar,
    syncTaskUpdate,
    syncTaskDelete,
  };
};
