
import React, { useState, useMemo } from 'react';
import { useStore } from '../../stores/useStore';
import Modal from '../common/Modal';
import { Priority } from '../../types';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  weekNumber: number;
  tasks: any[];
}

const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onClose, year, weekNumber, tasks }) => {
  const { reviews, addReview } = useStore();
  const [comment, setComment] = useState('');

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const getPriorityRate = (p: Priority) => {
      const pTasks = tasks.filter(t => t.priority === p);
      const pTotal = pTasks.length;
      if (pTotal === 0) return { total: 0, completed: 0, rate: 0 };
      const pCompleted = pTasks.filter(t => t.completed).length;
      return { total: pTotal, completed: pCompleted, rate: Math.round((pCompleted / pTotal) * 100) };
    };

    return {
      total,
      completed,
      rate,
      high: getPriorityRate('high'),
      medium: getPriorityRate('medium'),
      low: getPriorityRate('low'),
    };
  }, [tasks]);

  const existingReview = reviews.find(r => r.year === year && r.weekNumber === weekNumber);

  React.useEffect(() => {
    if (existingReview) setComment(existingReview.comment);
    else setComment('');
  }, [existingReview, isOpen]);

  const handleSave = () => {
    addReview({
      year,
      weekNumber,
      completionRate: stats.rate,
      comment,
    });
    onClose();
  };

  const ProgressBar = ({ rate, color }: { rate: number, color: string }) => (
    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
      <div 
        className={`${color} h-full transition-all duration-1000 ease-out`} 
        style={{ width: `${rate}%` }} 
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${year}년 ${weekNumber}주차 회고`}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-black text-blue-600 mb-1">{stats.rate}%</div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">주간 완료율</div>
          <div className="mt-3">
             <ProgressBar rate={stats.rate} color="bg-blue-600" />
          </div>
          <p className="text-xs text-gray-400 mt-2">전체 {stats.total}개 중 {stats.completed}개 완료</p>
        </div>

        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">상 우선순위</span>
            <span className="text-sm font-mono font-bold text-red-500">{stats.high.rate}%</span>
          </div>
          <ProgressBar rate={stats.high.rate} color="bg-red-500" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">중 우선순위</span>
            <span className="text-sm font-mono font-bold text-amber-500">{stats.medium.rate}%</span>
          </div>
          <ProgressBar rate={stats.medium.rate} color="bg-amber-500" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">하 우선순위</span>
            <span className="text-sm font-mono font-bold text-gray-500">{stats.low.rate}%</span>
          </div>
          <ProgressBar rate={stats.low.rate} color="bg-gray-500" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">한 줄 코멘트</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
            rows={4}
            placeholder="이번 주는 어땠나요? 자신에게 한마디 남겨보세요."
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          회고 저장하기
        </button>
      </div>
    </Modal>
  );
};

export default WeeklyReviewModal;
