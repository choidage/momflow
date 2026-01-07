import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface VoiceTranscriptionResultProps {
  onClose: () => void;
  onSave: (data: { text: string; date: string; time: string }) => void;
}

export function VoiceTranscriptionResult({ onClose, onSave }: VoiceTranscriptionResultProps) {
  const [text, setText] = useState('소아과 예약 내일 오후 2시에 확인하기');
  const [date, setDate] = useState('2025년 1월 16일');
  const [time, setTime] = useState('오후 2:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (text.trim()) {
      onSave({ text, date, time });
      onClose();
    }
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
      <div className="relative w-full bg-white rounded-t-2xl shadow-lg" style={{ height: '75%' }}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 h-full overflow-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2>음성 입력 결과</h2>
            <button onClick={onClose} className="p-1">
              <X size={24} className="text-[#6B7280]" />
            </button>
          </div>

          {/* Transcribed Text Area */}
          <div className="mb-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="인식된 내용이 여기에 표시됩니다"
              className="w-full min-h-[80px] p-3 border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          {/* Extracted Info Section */}
          <div className="flex-1">
            <h4 className="text-xs text-[#9CA3AF] uppercase mb-3">추출된 정보</h4>

            {/* Date Picker Row */}
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full h-12 flex items-center gap-3 px-4 border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            >
              <CalendarIcon size={20} className="text-[#6B7280]" />
              <span className="flex-1 text-left text-[#6B7280]">날짜</span>
              <span>{date}</span>
            </button>

            {/* Time Picker Row */}
            <button
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="w-full h-12 flex items-center gap-3 px-4 border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            >
              <Clock size={20} className="text-[#6B7280]" />
              <span className="flex-1 text-left text-[#6B7280]">시간</span>
              <span>{time}</span>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#1F2937]"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="px-6 h-11 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
