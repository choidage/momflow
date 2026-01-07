import { X, Clock, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface TodoAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: any) => void;
}

export function TodoAddSheet({ isOpen, onClose, onSave }: TodoAddSheetProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddChecklist = () => {
    if (newChecklistItem.trim()) {
      setChecklist([
        ...checklist,
        { id: Date.now().toString(), text: newChecklistItem, completed: false }
      ]);
      setNewChecklistItem('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: Date.now().toString(),
      title,
      time,
      checklist,
      notes,
      completed: false
    });
    onClose();
    // Reset form
    setTitle('');
    setTime('');
    setChecklist([]);
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 pointer-events-auto"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-[375px] bg-white rounded-t-2xl shadow-lg pointer-events-auto h-[80vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-[#E5E7EB] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-2 flex-shrink-0">
              <h2 className="text-lg font-semibold">할 일 추가</h2>
              <button onClick={onClose} className="p-1">
                <X size={24} className="text-[#6B7280]" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-xs text-[#9CA3AF] uppercase mb-2">할 일 제목</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="무엇을 해야 하나요?"
                  className="text-lg border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-[#D1D5DB]"
                  autoFocus
                />
              </div>

              {/* Date & Time */}
              <div className="mb-6">
                <label className="block text-xs text-[#9CA3AF] uppercase mb-2">일시</label>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-lg text-[#1F2937]">
                    <Calendar size={18} className="text-[#6B7280]" />
                    <span className="text-sm">오늘</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-lg text-[#1F2937]">
                    <Clock size={18} className="text-[#6B7280]" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="bg-transparent text-sm w-full outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="mb-6">
                <label className="block text-xs text-[#9CA3AF] uppercase mb-2">체크리스트</label>
                <div className="space-y-2 mb-3">
                  {checklist.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-[#D1D5DB]" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Plus size={20} className="text-[#6B7280]" />
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    placeholder="항목 추가"
                    className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
                  />
                  <button
                    onClick={handleAddChecklist}
                    className="text-xs text-[#6366F1] font-medium px-2 py-1"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-8">
                <label className="block text-xs text-[#9CA3AF] uppercase mb-2">메모</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className="w-full min-h-[100px] p-3 bg-[#F9FAFB] rounded-lg resize-none outline-none text-sm placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#E5E7EB] bg-white flex-shrink-0">
              <Button
                onClick={handleSave}
                disabled={!title.trim()}
                className="w-full h-12 text-base bg-[#FF9B82] hover:bg-[#FF8A6D] text-white"
              >
                저장하기
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
