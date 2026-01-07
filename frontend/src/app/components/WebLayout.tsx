import { Home, Calendar, Search, Settings, RefreshCw, ChevronRight } from 'lucide-react';
import { MomFlowLogo } from './MomFlowLogo';
import { ReactNode, useState } from 'react';

interface WebLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export function WebLayout({ children, currentPage = 'today' }: WebLayoutProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="w-[250px] bg-white border-r border-[#E5E7EB] flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6">
          <MomFlowLogo size="sm" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <NavItem
            icon={Home}
            label="오늘"
            active={currentPage === 'today'}
            onClick={() => {}}
          />
          <NavItem
            icon={Calendar}
            label="캘린더"
            active={currentPage === 'calendar'}
            onClick={() => {}}
          />
          <NavItem
            icon={Search}
            label="검색"
            active={currentPage === 'search'}
            onClick={() => {}}
          />
          <NavItem
            icon={Settings}
            label="설정"
            active={currentPage === 'settings'}
            hasSubmenu
            expanded={expandedMenu === 'settings'}
            onClick={() => setExpandedMenu(expandedMenu === 'settings' ? null : 'settings')}
          />
          {expandedMenu === 'settings' && (
            <div className="ml-8 space-y-1 mt-1">
              <SubNavItem label="계정 관리" />
              <SubNavItem label="룰(규칙) 관리" />
              <SubNavItem label="알림 설정" />
            </div>
          )}
        </nav>

        {/* Sync Status */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>마지막 동기화: 방금 전</span>
            <button className="p-1 hover:bg-[#F3F4F6] rounded">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1000px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  hasSubmenu = false,
  expanded = false,
  onClick
}: {
  icon: any;
  label: string;
  active?: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-11 flex items-center gap-3 px-3 rounded-lg mb-1 transition-colors
        ${active ? 'bg-[#EEF2FF] text-[#6366F1]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'}
      `}
    >
      <Icon size={20} />
      <span className="flex-1 text-left">{label}</span>
      {hasSubmenu && (
        <ChevronRight
          size={16}
          className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      )}
    </button>
  );
}

function SubNavItem({ label }: { label: string }) {
  return (
    <button className="w-full h-9 flex items-center px-3 rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
      {label}
    </button>
  );
}
