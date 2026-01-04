
import React, { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { GoalType } from '../../types';

const GoalPanel: React.FC = () => {
  const { goals, addGoal, deleteGoal } = useStore();
  const [newGoal, setNewGoal] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('monthly');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const filteredGoals = goals.filter(g => 
    g.type === goalType && 
    g.year === currentYear && 
    (goalType === 'yearly' || g.month === currentMonth)
  );

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    addGoal({
      type: goalType,
      year: currentYear,
      month: goalType === 'monthly' ? currentMonth : undefined,
      content: newGoal.trim(),
    });
    setNewGoal('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold dark:text-white">목표 관리</h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setGoalType('yearly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${goalType === 'yearly' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              년간
            </button>
            <button 
              onClick={() => setGoalType('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${goalType === 'monthly' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              월간
            </button>
          </div>
        </div>

        <form onSubmit={handleAddGoal} className="mb-4">
          <div className="relative">
            <input 
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder={`${goalType === 'yearly' ? currentYear : currentMonth}월 목표 추가...`}
              className="w-full pl-3 pr-10 py-2 text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="absolute right-2 top-1.5 text-blue-500 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {filteredGoals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 italic">등록된 목표가 없습니다.</p>
          ) : (
            filteredGoals.map((goal) => (
              <div key={goal.id} className="group flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{goal.content}</p>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalPanel;
