import { Mic, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function VoiceRecording({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'todo' | 'event' | 'memo'>('todo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 max-w-[375px] mx-auto">
      {/* Mode Selector Tabs */}
      <div className="absolute top-20 flex gap-8">
        {[
          { key: 'todo', label: '할 일' },
          { key: 'event', label: '일정' },
          { key: 'memo', label: '메모' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-2 relative ${activeTab === tab.key ? 'text-white' : 'text-white/60'
              }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
              />
            )}
          </button>
        ))}
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-[60px] mb-4">
        {isRecording && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{
                  height: [
                    Math.random() * 40 + 10,
                    Math.random() * 50 + 5,
                    Math.random() * 40 + 10
                  ]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Recording Time */}
      <div className="text-white mb-8">
        {formatTime(recordingTime)}
      </div>

      {/* Microphone Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsRecording(!isRecording)}
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 ${isRecording ? 'bg-[#EF4444]' : 'bg-white'
          }`}
      >
        {isRecording && (
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-[#EF4444]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <Mic size={32} className={isRecording ? 'text-white relative z-10' : 'text-[#1F2937]'} />
      </motion.button>

      {!isRecording && (
        <p className="text-white/60 mb-8">탭하여 녹음 시작</p>
      )}

      {/* Cancel Button */}
      <button
        onClick={onClose}
        className="text-white underline"
      >
        취소
      </button>
    </div>
  );
}
