import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function AccountSettings() {
  const [googleConnected, setGoogleConnected] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAFAFA] max-w-[375px] mx-auto">
      {/* Header */}
      <div className="h-14 bg-white border-b border-[#E5E7EB] px-4 flex items-center">
        <button className="p-1 mr-3">
          <ChevronLeft size={24} className="text-[#6B7280]" />
        </button>
        <h2 className="flex-1 text-center">계정 관리</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Profile Section */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-full flex items-center justify-center text-white text-xl font-semibold">
              김
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-1">김지현</h3>
            <p className="text-[#6B7280]">jihyun.kim@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="mt-6">
        {/* Calendar Integration */}
        <MenuSection title="캘린더 연동">
          <MenuItem
            icon="📅"
            label="Google Calendar"
            rightElement={
              <Badge className="bg-[#10B981] text-white hover:bg-[#10B981]">연동됨</Badge>
            }
          />
          <MenuItem
            icon="⚙️"
            label="동기화 설정"
            onClick={() => {}}
          />
        </MenuSection>

        {/* Notification Settings */}
        <MenuSection title="알림 설정">
          <MenuItem
            icon="🔔"
            label="알림 관리"
            onClick={() => {}}
          />
        </MenuSection>

        {/* Automation Rules */}
        <MenuSection title="자동화 규칙">
          <MenuItem
            icon="🤖"
            label="룰(규칙) 관리"
            onClick={() => {}}
          />
        </MenuSection>

        {/* Privacy */}
        <MenuSection title="개인정보">
          <MenuItem
            icon="🔒"
            label="프라이버시 설정"
            onClick={() => {}}
          />
          <MenuItem
            icon="📄"
            label="개인정보처리방침"
            rightElement={<ExternalLink size={16} className="text-[#9CA3AF]" />}
            onClick={() => {}}
          />
        </MenuSection>
      </div>

      {/* Danger Zone */}
      <div className="px-6 py-8 space-y-4">
        <Button variant="outline" className="w-full">
          로그아웃
        </Button>
        <button className="w-full text-[#EF4444] text-center hover:underline">
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="px-6 py-2 text-xs text-[#9CA3AF] uppercase">{title}</h4>
      <div className="bg-white border-y border-[#E5E7EB]">
        {children}
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  rightElement,
  onClick
}: {
  icon: string;
  label: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[52px] px-6 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors border-b border-[#F3F4F6] last:border-b-0"
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {rightElement || <ChevronRight size={20} className="text-[#D1D5DB]" />}
    </button>
  );
}
