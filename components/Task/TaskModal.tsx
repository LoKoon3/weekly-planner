
import React, { useState, useEffect } from 'react';
import { useStore } from '../../stores/useStore';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { Task, Priority, TimeTag } from '../../types';
import Modal from '../common/Modal';
import { TIME_TAG_LABELS, PRIORITY_LABELS } from '../../constants';
import { formatDate } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  taskToEdit?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, selectedDate, taskToEdit }) => {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const { isConnected, syncTaskToCalendar, syncTaskUpdate, syncTaskDelete } = useGoogleCalendar();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    priority: 'medium' as Priority,
    timeTag: 'forenoon' as TimeTag,
    memo: '',
  });

  useEffect(() => {
    if (!isOpen) return; // 모달이 닫혀있으면 무시

    if (taskToEdit) {
      // 편집 모드: 기존 데이터 로드
      setFormData({
        title: taskToEdit.title,
        date: taskToEdit.date,
        startTime: taskToEdit.startTime,
        endTime: taskToEdit.endTime,
        priority: taskToEdit.priority,
        timeTag: taskToEdit.timeTag || 'forenoon',
        memo: taskToEdit.memo || '',
      });
    } else {
      // 추가 모드: 폼 초기화
      setFormData({
        title: '',
        date: selectedDate || formatDate(new Date()),
        startTime: '09:00',
        endTime: '10:00',
        priority: 'medium',
        timeTag: 'forenoon',
        memo: '',
      });
    }
  }, [taskToEdit, selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);

    try {
      if (taskToEdit) {
        // 기존 할 일 수정
        updateTask(taskToEdit.id, formData);

        // 구글 캘린더 동기화
        if (isConnected) {
          const updatedTask = { ...taskToEdit, ...formData };
          await syncTaskUpdate(updatedTask);
        }
      } else {
        // 새 할 일 추가
        addTask({
          ...formData,
          completed: false,
        });

        // 구글 캘린더 동기화 (addTask 후 최신 task를 가져와야 함)
        if (isConnected) {
          // 약간의 지연 후 최신 task 찾기
          setTimeout(async () => {
            const latestTasks = useStore.getState().tasks;
            const newTask = latestTasks.find(t =>
              t.title === formData.title &&
              t.date === formData.date &&
              t.startTime === formData.startTime
            );
            if (newTask) {
              await syncTaskToCalendar(newTask);
            }
          }, 100);
        }
      }
    } finally {
      setIsSyncing(false);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (taskToEdit) {
      setIsSyncing(true);
      try {
        // 구글 캘린더에서 삭제
        if (isConnected && taskToEdit.googleEventId) {
          await syncTaskDelete(taskToEdit.googleEventId);
        }
        deleteTask(taskToEdit.id);
      } finally {
        setIsSyncing(false);
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? '할 일 편집' : '할 일 추가'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목 *</label>
          <input 
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="어떤 일을 하실 건가요?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">날짜 *</label>
            <input 
              required
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">우선순위 *</label>
            <select 
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시작 시간 *</label>
            <input 
              required
              type="time"
              value={formData.startTime}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">종료 시간 *</label>
            <input 
              required
              type="time"
              value={formData.endTime}
              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시간대 태그</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TIME_TAG_LABELS).map(([tag, label]) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFormData({ ...formData, timeTag: tag as TimeTag })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  formData.timeTag === tag 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">메모</label>
          <textarea 
            rows={3}
            value={formData.memo}
            onChange={e => setFormData({ ...formData, memo: e.target.value })}
            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="추가 내용을 적어주세요."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
          {taskToEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-4 py-2 text-sm font-bold text-red-500 border border-red-500 rounded-xl hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          )}
          <button
            type="submit"
            disabled={isSyncing}
            className="flex-[2] px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? '저장 중...' : (isConnected ? '저장 및 캘린더 동기화' : '저장하기')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
