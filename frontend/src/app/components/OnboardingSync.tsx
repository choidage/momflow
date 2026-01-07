import { Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export function OnboardingSync() {
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(45);

  const handleBack = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 max-w-[375px] mx-auto relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 p-2 hover:bg-white rounded-lg transition-colors z-10"
      >
        <ArrowLeft size={24} className="text-[#6B7280]" />
      </button>

      <div className="flex flex-col items-center gap-8">
        {/* Animated Icon */}
        <motion.div
          className="w-[120px] h-[120px] relative flex items-center justify-center"
          animate={!isError ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {!isError ? (
            <>
              <svg className="absolute w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="55"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="55"
                  stroke="#6366F1"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 55}`}
                  strokeDashoffset={`${2 * Math.PI * 55 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <Calendar size={48} className="text-[#6366F1]" />
            </>
          ) : (
            <AlertTriangle size={48} className="text-[#F59E0B]" />
          )}
        </motion.div>

        {/* Progress Bar */}
        {!isError && (
          <div className="w-[280px] h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Status Text */}
        <div className="text-center">
          {!isError ? (
            <>
              <h2 className="mb-2">일정을 가져오고 있어요...</h2>
              <p className="text-[#6B7280]">잠시만 기다려주세요</p>
            </>
          ) : (
            <>
              <h2 className="mb-2">일정을 가져오는데 실패했습니다</h2>
              <button
                className="mt-4 h-11 px-6 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3] transition-colors"
                onClick={() => {
                  setIsError(false);
                  setProgress(0);
                }}
              >
                다시 시도
              </button>
            </>
          )}
        </div>

        {/* Demo toggle button */}
        <button
          onClick={() => setIsError(!isError)}
          className="mt-4 text-xs text-[#9CA3AF] underline"
        >
          {isError ? '로딩 상태 보기' : '에러 상태 보기'}
        </button>
      </div>
    </div>
  );
}