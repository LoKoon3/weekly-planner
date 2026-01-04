
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../stores/useStore';

const YearlyGoalBanner: React.FC = () => {
  const { goals, addGoal, deleteGoal } = useStore();
  const currentYear = new Date().getFullYear();

  const yearlyGoal = goals.find(g => g.type === 'yearly' && g.year === currentYear);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(yearlyGoal?.content || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }

    if (yearlyGoal) {
      // 기존 목표 업데이트 - updateGoal이 없으면 삭제 후 추가
      deleteGoal(yearlyGoal.id);
    }

    addGoal({
      type: 'yearly',
      year: currentYear,
      content: trimmed,
    });

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (yearlyGoal && confirm('년간 목표를 삭제하시겠습니까?')) {
      deleteGoal(yearlyGoal.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20">
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl px-6 py-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                {currentYear} 년간 목표
              </span>
              {yearlyGoal && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full">
                  핵심 목표
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  placeholder="올해 가장 이루고 싶은 목표를 입력하세요..."
                  className="flex-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 text-lg font-medium outline-none focus:ring-2 focus:ring-white/50"
                  maxLength={100}
                />
              </div>
            ) : yearlyGoal ? (
              <p className="text-xl font-bold text-white leading-tight truncate">
                {yearlyGoal.content}
              </p>
            ) : (
              <button
                onClick={handleStartEdit}
                className="text-lg text-white/60 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                올해의 핵심 목표를 설정하세요
              </button>
            )}
          </div>

          {/* Actions */}
          {!isEditing && yearlyGoal && (
            <div className="shrink-0 flex items-center gap-1">
              <button
                onClick={handleStartEdit}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="수정"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-white/60 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all"
                title="삭제"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {!isEditing && !yearlyGoal && (
            <button
              onClick={handleStartEdit}
              className="shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-bold rounded-xl transition-all"
            >
              목표 설정
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyGoalBanner;
