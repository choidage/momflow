import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

const eventTypes = [
  { id: 'hospital', name: '병원', color: 'bg-[#FFE8E0]', active: true },
  { id: 'weekly', name: '주간', color: 'bg-[#E0E7FF]', active: false },
  { id: 'academy', name: '학원', color: 'bg-[#FCE7F3]', active: false },
  { id: 'activity', name: '활동', color: 'bg-[#FEF3C7]', active: false },
  { id: 'general', name: '일반', color: 'bg-[#E0F2FE]', active: false },
];

export function CalendarDetailScreen() {
  const [currentDate] = useState(new Date(2025, 11, 1)); // December 2025

  const handleBack = () => {
    window.location.reload();
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    return { firstDay, daysInMonth, prevMonthDays };
  };

  const { firstDay, daysInMonth, prevMonthDays } = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#F3F4F6]">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} className="text-[#6B7280]" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-[#E946F5] rounded flex items-center justify-center text-white text-xs">
            맘
          </span>
          <h2>맘스플로우</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2">
            <CalendarIcon size={20} className="text-[#6366F1]" />
          </button>
          <button className="p-2">
            <List size={20} className="text-[#9CA3AF]" />
          </button>
          <button className="p-2">
            <Edit size={20} className="text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-2">
            <ChevronLeft size={20} className="text-[#E946F5]" />
          </button>
          <h3 className="text-lg">{monthName}</h3>
          <button className="p-2">
            <ChevronRight size={20} className="text-[#E946F5]" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs py-2 ${
                  i === 0 ? 'text-[#FF6B6B]' : i === 6 ? 'text-[#6366F1]' : 'text-[#9CA3AF]'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Previous month days */}
            {Array.from({ length: firstDay }).map((_, i) => {
              const date = prevMonthDays - firstDay + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="aspect-square flex items-center justify-center text-sm text-[#D1D5DB]"
                >
                  {date}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const isToday = date === 31;
              const isWeekend = (firstDay + i) % 7 === 0 || (firstDay + i) % 7 === 6;
              const isSunday = (firstDay + i) % 7 === 0;
              const isSaturday = (firstDay + i) % 7 === 6;

              return (
                <button
                  key={date}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                    isToday
                      ? 'bg-[#E946F5] text-white'
                      : isSunday
                      ? 'text-[#FF6B6B]'
                      : isSaturday
                      ? 'text-[#6366F1]'
                      : 'text-[#1F2937] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {date}
                </button>
              );
            })}

            {/* Next month days */}
            {Array.from({ length: 7 - ((firstDay + daysInMonth) % 7) }).map((_, i) => {
              if ((firstDay + daysInMonth) % 7 === 0) return null;
              const date = i + 1;
              return (
                <div
                  key={`next-${i}`}
                  className="aspect-square flex items-center justify-center text-sm text-[#D1D5DB]"
                >
                  {date}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2 flex-wrap pb-20">
          <span className="text-sm text-[#6B7280]">일정 종류:</span>
          {eventTypes.map(type => (
            <button
              key={type.id}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                type.active
                  ? `${type.color} text-[#1F2937] border-2 border-[#E946F5]`
                  : 'bg-[#F3F4F6] text-[#9CA3AF] border border-transparent'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-[#E946F5] rounded-full flex items-center justify-center shadow-lg">
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
}
