import { ChevronRight, Info, X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Switch } from './ui/switch';
import { motion, AnimatePresence } from 'framer-motion';

const ruleCategories = [
  {
    id: 'hospital',
    icon: '🏥',
    name: '병원/예방접종',
    enabled: true,
    rules: [
      { id: 'h1', name: '병원 방문 전 준비', offset: 'D-1 21:00', items: ['보험증 챙기기', '문진표 작성하기'] },
      { id: 'h2', name: '예방접종 준비', offset: '당일 1시간 전', items: ['예방접종 수첩 챙기기', '아이 컨디션 확인'] }
    ]
  },
  {
    id: 'school',
    icon: '🏫',
    name: '등교/하교',
    enabled: true,
    rules: [
      { id: 's1', name: '등교 준비', offset: '당일 아침 7:00', items: ['가방 챙기기', '숙제 확인'] }
    ]
  },
  {
    id: 'academy',
    icon: '📚',
    name: '학원/방과후',
    enabled: false,
    rules: []
  },
  {
    id: 'event',
    icon: '🎒',
    name: '체험학습/행사',
    enabled: true,
    rules: []
  },
  {
    id: 'shopping',
    icon: '🛒',
    name: '장보기',
    enabled: false,
    rules: []
  }
];

export function RuleManagement() {
  const [showInfo, setShowInfo] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('hospital');
  const [editingRule, setEditingRule] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAFA] max-w-[375px] mx-auto">
      {/* Header */}
      <div className="h-14 bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between">
        <button className="p-1">
          <ChevronRight size={24} className="text-[#6B7280] rotate-180" />
        </button>
        <h2>룰(규칙) 관리</h2>
        <button className="p-1">
          <Info size={24} className="text-[#6B7280]" />
        </button>
      </div>

      {/* Info Banner */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#EFF6FF] border-b border-[#BFDBFE] overflow-hidden"
          >
            <div className="px-4 py-3 flex gap-3">
              <Info size={20} className="text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-sm text-[#1E40AF]">
                룰을 켜면 해당 일정에 자동으로 할 일이 생성됩니다
              </p>
              <button onClick={() => setShowInfo(false)} className="flex-shrink-0">
                <X size={20} className="text-[#3B82F6]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rule Categories */}
      <div className="divide-y divide-[#E5E7EB]">
        {ruleCategories.map(category => (
          <div key={category.id}>
            {/* Category Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-3">
              <button
                onClick={() => setExpandedCategory(
                  expandedCategory === category.id ? null : category.id
                )}
                className="flex-1 flex items-center gap-3"
              >
                <span className="text-2xl">{category.icon}</span>
                <h3 className="flex-1 text-left">{category.name}</h3>
                <ChevronRight
                  size={20}
                  className={`text-[#9CA3AF] transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''
                    }`}
                />
              </button>
              <Switch checked={category.enabled} />
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#F9FAFB] overflow-hidden"
                >
                  <div className="px-4 py-3 space-y-3">
                    {category.rules.map(rule => (
                      <div key={rule.id} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{rule.name}</span>
                          <button
                            onClick={() => setEditingRule(editingRule === rule.id ? null : rule.id)}
                            className="text-sm text-[#6366F1]"
                          >
                            편집
                          </button>
                        </div>
                        <p className="text-xs text-[#9CA3AF] mb-2">{rule.offset}</p>

                        {editingRule === rule.id && (
                          <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-2">
                            {rule.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="flex-1 text-sm">{item}</span>
                                <button className="p-1">
                                  <X size={16} className="text-[#EF4444]" />
                                </button>
                              </div>
                            ))}
                            <button className="flex items-center gap-1 text-sm text-[#6366F1]">
                              <Plus size={16} />
                              <span>항목 추가</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
