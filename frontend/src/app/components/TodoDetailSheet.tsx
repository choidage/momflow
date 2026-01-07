import { X, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface TodoDetailSheetProps {
  todo: {
    id: string;
    title: string;
    completed?: boolean;
    time?: string;
    rule?: string;
    checklist?: Array<{ id: string; text: string; completed: boolean }>;
    notes?: string;
  };
  onClose: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

export function TodoDetailSheet({ todo, onClose, onDelete, onComplete }: TodoDetailSheetProps) {
  const [checklist, setChecklist] = useState(todo.checklist || []);
  const [notes, setNotes] = useState(todo.notes || '');

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex items-end max-w-[375px] mx-auto"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl shadow-lg" style={{ height: '70%' }}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 h-full overflow-auto">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <button
              onClick={() => { }}
              className={`
                mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${todo.completed ? 'bg-[#6366F1] border-[#6366F1]' : 'border-[#D1D5DB]'}
              `}
            >
              {todo.completed && <span className="text-white text-sm">✓</span>}
            </button>
            <h3 className="flex-1 leading-relaxed">{todo.title}</h3>
            <button onClick={onClose} className="p-1">
              <X size={24} className="text-[#6B7280]" />
            </button>
          </div>

          {/* Rule Badge */}
          {todo.rule && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF2FF] text-xs text-[#6366F1]">
                🤖 [{todo.rule}] 룰에 의해 생성됨
              </span>
            </div>
          )}

          {/* Due Date/Time */}
          {todo.time && (
            <div className="flex items-center gap-2 mb-6 text-[#6B7280]">
              <Clock size={16} />
              <span>{todo.time}</span>
            </div>
          )}

          {/* Checklist Section */}
          {checklist.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs text-[#9CA3AF] uppercase mb-3">체크리스트</h4>
              <div className="space-y-2">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-3 h-12">
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${item.completed ? 'bg-[#6366F1] border-[#6366F1]' : 'border-[#D1D5DB]'}
                      `}
                    >
                      {item.completed && <span className="text-white text-xs">✓</span>}
                    </button>
                    <span className={item.completed ? 'line-through text-[#9CA3AF]' : ''}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 mt-3 text-[#6366F1]">
                <Plus size={16} />
                <span>항목 추가</span>
              </button>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-20">
            <h4 className="text-xs text-[#9CA3AF] uppercase mb-3">메모</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="w-full min-h-[80px] p-3 border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-[#E5E7EB] flex gap-4">
          <button
            onClick={onDelete}
            className="flex-1 h-12 border border-[#EF4444] text-[#EF4444] rounded-lg hover:bg-[#FEE2E2] transition-colors"
          >
            삭제
          </button>
          <button
            onClick={onComplete}
            className="flex-1 h-12 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3] transition-colors"
          >
            완료
          </button>
        </div>
      </div>
    </motion.div>
  );
}
