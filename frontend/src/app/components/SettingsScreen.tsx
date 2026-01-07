import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsScreen({ isOpen, onClose }: SettingsScreenProps) {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);

  if (!isOpen) return null;

  const handleNotificationToggle = () => {
    const newState = !notificationEnabled;
    setNotificationEnabled(newState);
    toast.success(newState ? "알림이 활성화되었습니다." : "알림이 비활성화되었습니다.");
  };

  const handleGoogleCalendarToggle = () => {
    const newState = !googleCalendarEnabled;
    setGoogleCalendarEnabled(newState);
    toast.success(
      newState
        ? "Google Calendar 연동이 활성화되었습니다."
        : "Google Calendar 연동이 비활성화되었습니다."
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6]">
        <button onClick={onClose} className="p-1">
          <ArrowLeft size={24} className="text-[#1F2937]" />
        </button>
        <h1 className="flex-1 font-semibold text-[#1F2937]">설정</h1>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto bg-[#FAFAFA]">
        {/* Notification Settings */}
        <div className="bg-white p-6 mb-4">
          <h3 className="font-medium text-[#1F2937] mb-4">알림 설정</h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-[#1F2937]">푸시 알림</div>
              <div className="text-sm text-[#6B7280] mt-1">
                일정 알림을 받아보세요
              </div>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                notificationEnabled ? "bg-[#FF9B82]" : "bg-[#D1D5DB]"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  notificationEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className="bg-white p-6">
          <h3 className="font-medium text-[#1F2937] mb-4">캘린더 연동</h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-[#1F2937]">Google Calendar</div>
              <div className="text-sm text-[#6B7280] mt-1">
                구글 캘린더와 동기화하기
              </div>
            </div>
            <button
              onClick={handleGoogleCalendarToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                googleCalendarEnabled ? "bg-[#FF9B82]" : "bg-[#D1D5DB]"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  googleCalendarEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white p-6 mt-4">
          <h3 className="font-medium text-[#1F2937] mb-4">앱 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
              <span className="text-[#6B7280]">버전</span>
              <span className="text-[#1F2937]">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
              <span className="text-[#6B7280]">최근 업데이트</span>
              <span className="text-[#1F2937]">2024.01.05</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
