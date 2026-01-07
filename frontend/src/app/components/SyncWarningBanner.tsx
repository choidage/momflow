import { AlertTriangle, AlertCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type BannerState = 'warning' | 'error' | 'retrying';

interface SyncWarningBannerProps {
  state: BannerState;
  onRetry?: () => void;
  onDismiss: () => void;
  visible: boolean;
}

export function SyncWarningBanner({ state, onRetry, onDismiss, visible }: SyncWarningBannerProps) {
  const configs = {
    warning: {
      bg: '#FEF3C7',
      border: '#F59E0B',
      icon: AlertTriangle,
      iconColor: '#D97706',
      message: '일정 동기화가 지연되고 있습니다'
    },
    error: {
      bg: '#FEE2E2',
      border: '#DC2626',
      icon: AlertCircle,
      iconColor: '#DC2626',
      message: '일정 동기화에 실패했습니다'
    },
    retrying: {
      bg: '#DBEAFE',
      border: '#3B82F6',
      icon: Loader2,
      iconColor: '#3B82F6',
      message: '다시 연결 중...'
    }
  };

  const config = configs[state];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 max-w-[375px] mx-auto"
          style={{
            backgroundColor: config.bg,
            borderBottom: `1px solid ${config.border}`
          }}
        >
          <div className="h-12 px-4 flex items-center gap-3">
            <Icon
              size={20}
              style={{ color: config.iconColor }}
              className={state === 'retrying' ? 'animate-spin' : ''}
            />
            <span className="flex-1 text-sm font-medium" style={{ color: config.iconColor }}>
              {config.message}
            </span>
            {state !== 'retrying' && onRetry && (
              <button
                onClick={onRetry}
                className="text-sm font-medium text-[#6366F1] hover:underline"
              >
                다시 시도
              </button>
            )}
            <button onClick={onDismiss} className="p-1">
              <X size={18} style={{ color: config.iconColor }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
