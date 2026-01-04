
import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';

const GoalPanel: React.FC = () => {
  const { goals, addGoal, deleteGoal } = useStore();
  const [newGoal, setNewGoal] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const monthlyGoals = goals.filter(g =>
    g.type === 'monthly' &&
    g.year === currentYear &&
    g.month === currentMonth
  );

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    addGoal({
      type: 'monthly',
      year: currentYear,
      month: currentMonth,
      content: newGoal.trim(),
    });

    setNewGoal('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewGoal('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold dark:text-white">{monthNames[currentMonth]} 목표</h3>
            <p className="text-[10px] text-gray-400">{monthlyGoals.length}개 설정됨</p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddGoal} className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <input
            autoFocus
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="이번 달 목표를 입력하세요..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none mb-2"
            maxLength={100}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!newGoal.trim()}
              className="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {monthlyGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 mb-1">이번 달 목표가 없습니다</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs text-green-500 hover:text-green-600 font-medium"
            >
              + 목표 추가하기
            </button>
          </div>
        ) : (
          monthlyGoals.map((goal, index) => (
            <div
              key={goal.id}
              className="group flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm transition-all"
            >
              <div className="shrink-0 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {index + 1}
              </div>
              <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-relaxed pt-0.5">
                {goal.content}
              </p>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="shrink-0 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 rounded transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalPanel;
