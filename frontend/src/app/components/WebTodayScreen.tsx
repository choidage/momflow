import { RefreshCw, Plus, Mic, Calendar as CalendarIcon } from 'lucide-react';
import { WebLayout } from './WebLayout';
import { TodoItem } from './TodoItem';
import { useState } from 'react';
import { motion } from 'framer-motion';

const mockTodos = [
  { id: '1', title: '소아과 예약 확인하기', time: '오전 10:00', rule: '병원', completed: false },
  { id: '2', title: '독감 예방접종 준비물 챙기기', time: '오전 10:30', rule: '병원', completed: false },
  { id: '3', title: '학교 준비물 챙기기', time: '오전 7:30', completed: true },
  { id: '4', title: '저녁 식재료 구매하기', time: '오후 5:00', completed: false },
];

export function WebTodayScreen() {
  const [todos, setTodos] = useState(mockTodos);

  const handleToggle = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <WebLayout currentPage="today">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>오늘</h1>
          <p className="text-[#6B7280] mt-1">2025년 1월 15일 수요일</p>
        </div>
        <div className="flex gap-3">
          <button className="h-11 px-4 border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors flex items-center gap-2">
            <RefreshCw size={16} />
            <span>지금 동기화</span>
          </button>
          <button className="h-11 px-4 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3] transition-colors flex items-center gap-2">
            <Plus size={16} />
            <span>할 일 추가</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-[1fr_300px] gap-8">
        {/* Todo List */}
        <div className="space-y-3">
          {todos.map(todo => (
            <motion.div
              key={todo.id}
              whileHover={{ y: -2, boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}
              className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow cursor-pointer"
            >
              <TodoItem
                {...todo}
                onToggle={handleToggle}
              />
            </motion.div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar Widget */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="mb-4">1월</h3>
            <MiniCalendar />
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="mb-3">오늘의 할 일</h3>
            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-[#6B7280]">진행 상황</span>
                <span className="font-semibold">{completedCount}/{totalCount} 완료</span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6366F1] rounded-full transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Add via Voice */}
          <div className="bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-lg p-6 text-white text-center">
            <Mic size={32} className="mx-auto mb-3" />
            <h4 className="mb-2 text-white">음성으로 추가하기</h4>
            <p className="text-sm text-white/80">빠르게 할 일을 추가해보세요</p>
            <button className="mt-4 w-full h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              시작하기
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#6366F1] rounded-full flex items-center justify-center shadow-lg hover:bg-[#5558E3] transition-colors"
      >
        <Mic size={28} className="text-white" />
      </motion.button>
    </WebLayout>
  );
}

function MiniCalendar() {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 2; // 1월 1일이 수요일이라고 가정

  return (
    <div>
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, i) => (
          <div key={day} className={`text-center text-xs ${i === 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dates.map(date => {
          const isToday = date === 15;
          const hasEvents = [3, 7, 15, 21, 28].includes(date);

          return (
            <button
              key={date}
              className={`
                aspect-square flex flex-col items-center justify-center rounded text-xs
                ${isToday ? 'bg-[#6366F1] text-white' : 'hover:bg-[#F3F4F6]'}
              `}
            >
              <span>{date}</span>
              {hasEvents && !isToday && (
                <div className="w-1 h-1 bg-[#6366F1] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
