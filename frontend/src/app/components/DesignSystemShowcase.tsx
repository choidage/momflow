import { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { OnboardingSync } from './OnboardingSync';
import { TodayScreen } from './TodayScreen';
import { CalendarHomeScreen } from './CalendarHomeScreen';
import { CalendarDetailScreen } from './CalendarDetailScreen';
import { WebTodayScreen } from './WebTodayScreen';
import { RuleManagement } from './RuleManagement';
import { AccountSettings } from './AccountSettings';
import { SyncWarningBanner } from './SyncWarningBanner';
import { VoiceRecording } from './VoiceRecording';
import { VoiceTranscriptionResult } from './VoiceTranscriptionResult';
import { TodoDetailSheet } from './TodoDetailSheet';
import { ConfirmDialog, TodoDetailModal, VoiceModal } from './WebModals';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import {
  Home,
  Calendar,
  Search,
  Settings,
  Plus,
  Edit,
  Trash2,
  Check,
  Mic,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Bell,
  User,
  ExternalLink,
  Smartphone,
  Monitor
} from 'lucide-react';

export function DesignSystemShowcase() {
  const [currentScreen, setCurrentScreen] = useState<'showcase' | 'login' | 'sync' | 'today' | 'calendar-home' | 'calendar-detail' | 'web' | 'rules' | 'settings'>('showcase');
  const [showBanner, setShowBanner] = useState(true);
  const [bannerState, setBannerState] = useState<'warning' | 'error' | 'retrying'>('warning');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const mockTodo = {
    id: '1',
    title: '소아과 예약 확인하기',
    time: '오전 10:00',
    rule: '병원',
    completed: false,
    checklist: [
      { id: 'c1', text: '보험증 챙기기', completed: true },
      { id: 'c2', text: '문진표 작성하기', completed: false }
    ],
    notes: '예방접종 수첩도 함께 가져가기'
  };

  if (currentScreen === 'login') return <LoginScreen />;
  if (currentScreen === 'sync') return <OnboardingSync />;
  if (currentScreen === 'today') return <TodayScreen />;
  if (currentScreen === 'calendar-home') return <CalendarHomeScreen />;
  if (currentScreen === 'calendar-detail') return <CalendarDetailScreen />;
  if (currentScreen === 'web') return <WebTodayScreen />;
  if (currentScreen === 'rules') return <RuleManagement />;
  if (currentScreen === 'settings') return <AccountSettings />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <Toaster />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="mb-2">Always Plan Design System</h1>
          <p className="text-[#6B7280]">부모들을 위한 손쉬운 일정 관리 & 소통</p>
        </div>

        {/* Screen Navigation */}
        <section className="mb-12">
          <h2 className="mb-6">📱 화면 프로토타입</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScreenCard
              icon={<Smartphone className="text-[#FF9B82]" />}
              title="로그인 화면 (NEW)"
              description="Google 로그인"
              onClick={() => setCurrentScreen('login')}
              isNew
            />
            <ScreenCard
              icon={<Calendar className="text-[#FF9B82]" />}
              title="캘린더 홈 (NEW)"
              description="가족 구성원 & 월간 캘린더"
              onClick={() => setCurrentScreen('calendar-home')}
              isNew
            />
            <ScreenCard
              icon={<Calendar className="text-[#E946F5]" />}
              title="캘린더 상세 (NEW)"
              description="맘스플로우 캘린더 뷰"
              onClick={() => setCurrentScreen('calendar-detail')}
              isNew
            />
            <ScreenCard
              icon={<RefreshCw className="text-[#6366F1]" />}
              title="동기화 화면"
              description="온보딩 일정 가져오기"
              onClick={() => setCurrentScreen('sync')}
            />
            <ScreenCard
              icon={<Home className="text-[#6366F1]" />}
              title="오늘 화면 (모바일)"
              description="할 일 타임라인 & FAB"
              onClick={() => setCurrentScreen('today')}
            />
            <ScreenCard
              icon={<Monitor className="text-[#6366F1]" />}
              title="오늘 화면 (웹)"
              description="데스크톱 레이아웃"
              onClick={() => setCurrentScreen('web')}
            />
            <ScreenCard
              icon={<Settings className="text-[#6366F1]" />}
              title="규칙 관리"
              description="자동화 룰 설정"
              onClick={() => setCurrentScreen('rules')}
            />
            <ScreenCard
              icon={<User className="text-[#6366F1]" />}
              title="계정 관리"
              description="프로필 & 설정"
              onClick={() => setCurrentScreen('settings')}
            />
          </div>
        </section>

        {/* Brand Identity */}
        <section className="mb-12">
          <h2 className="mb-6">🎨 브랜드 아이덴티티</h2>
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3">브랜드 성격</h3>
                <ul className="space-y-2 text-[#6B7280]">
                  <li>• 따뜻하고 지지적이며 신뢰할 수 있는</li>
                  <li>• 현대적이지만 차갑지 않은</li>
                  <li>• 차분하고 정돈된 느낌</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3">디자인 원칙</h3>
                <ul className="space-y-2 text-[#6B7280]">
                  <li>• 충분한 여백으로 편안한 느낌</li>
                  <li>• 일관된 4px 기반 간격 시스템</li>
                  <li>• 부드러운 모서리와 그림자</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="mb-6">🎨 컬러 팔레트</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ColorSwatch name="Primary" color="#6366F1" description="신뢰감, 안정성" />
            <ColorSwatch name="Secondary" color="#F59E0B" description="따뜻함, 주의" />
            <ColorSwatch name="Success" color="#10B981" description="완료, 긍정" />
            <ColorSwatch name="Error" color="#EF4444" description="경고, 삭제" />
            <ColorSwatch name="Background" color="#FAFAFA" description="페이지 배경" />
            <ColorSwatch name="Surface" color="#FFFFFF" description="카드, 모달" />
            <ColorSwatch name="Text Primary" color="#1F2937" description="주요 텍스트" />
            <ColorSwatch name="Text Secondary" color="#6B7280" description="보조 텍스트" />
            <ColorSwatch name="Text Muted" color="#9CA3AF" description="비활성" />
            <ColorSwatch name="Border" color="#E5E7EB" description="구분선" />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="mb-6">📝 타이포그래피</h2>
          <Card className="p-6 space-y-4">
            <div>
              <div className="text-xs text-[#9CA3AF] mb-1">Display / 24px Bold</div>
              <h1>페이지 제목 - Display Text</h1>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF] mb-1">Heading / 18px Semibold</div>
              <h2>섹션 제목 - Heading Text</h2>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF] mb-1">Subheading / 16px Semibold</div>
              <h3>서브 제목 - Subheading Text</h3>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF] mb-1">Body / 14px Regular</div>
              <p>본문 텍스트 - 일반적인 내용에 사용됩니다. 가독성이 좋고 편안한 느낌을 줍니다.</p>
            </div>
            <div>
              <div className="text-xs text-[#9CA3AF] mb-1">Caption / 12px Regular</div>
              <p className="text-xs text-[#6B7280]">보조 텍스트 - 메타데이터나 부가 정보에 사용됩니다.</p>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="mb-6">🔘 버튼</h2>
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3">크기 & 스타일</h3>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <h3 className="mb-3">변형</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
              <div>
                <h3 className="mb-3">아이콘 포함</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Plus size={16} className="mr-2" />
                    할 일 추가
                  </Button>
                  <Button variant="outline">
                    <RefreshCw size={16} className="mr-2" />
                    동기화
                  </Button>
                  <Button variant="destructive">
                    <Trash2 size={16} className="mr-2" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="mb-12">
          <h2 className="mb-6">📝 폼 요소</h2>
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">텍스트 입력</label>
                <Input placeholder="내용을 입력하세요..." />
              </div>
              <div>
                <label className="block mb-2">비활성 입력</label>
                <Input disabled placeholder="비활성 상태" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2">텍스트 영역</label>
                <Textarea placeholder="메모를 입력하세요..." rows={3} />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox />
                  <span>체크박스 옵션</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span>선택된 체크박스</span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch />
                  <span>토글 스위치</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch defaultChecked />
                  <span>활성화된 스위치</span>
                </label>
              </div>
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="mb-6">🏷️ 뱃지</h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge className="bg-[#10B981] text-white hover:bg-[#059669]">Success</Badge>
              <Badge className="bg-[#EEF2FF] text-[#6366F1] hover:bg-[#E0E7FF]">
                🤖 Rule Badge
              </Badge>
              <Badge className="border-dashed">Draft</Badge>
            </div>
          </Card>
        </section>

        {/* Interactive Components */}
        <section className="mb-12">
          <h2 className="mb-6">⚡ 인터랙티브 컴포넌트</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="mb-4">동기화 배너</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowBanner(true);
                    setBannerState('warning');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Warning 배너 표시
                </Button>
                <Button
                  onClick={() => {
                    setShowBanner(true);
                    setBannerState('error');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Error 배너 표시
                </Button>
                <SyncWarningBanner
                  state={bannerState}
                  onRetry={() => setBannerState('retrying')}
                  onDismiss={() => setShowBanner(false)}
                  visible={showBanner}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">모달 다이얼로그</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  variant="outline"
                  className="w-full"
                >
                  확인 다이얼로그
                </Button>
                <Button
                  onClick={() => setShowTodoModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  할 일 상세 모달
                </Button>
                <Button
                  onClick={() => setShowVoiceModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  음성 입력 모달
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Icons */}
        <section className="mb-12">
          <h2 className="mb-6">🎯 아이콘 세트 (24px)</h2>
          <Card className="p-6">
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
              {[
                { Icon: Home, name: 'Home' },
                { Icon: Calendar, name: 'Calendar' },
                { Icon: Search, name: 'Search' },
                { Icon: Settings, name: 'Settings' },
                { Icon: Plus, name: 'Add' },
                { Icon: Edit, name: 'Edit' },
                { Icon: Trash2, name: 'Delete' },
                { Icon: Check, name: 'Check' },
                { Icon: Mic, name: 'Mic' },
                { Icon: RefreshCw, name: 'Sync' },
                { Icon: AlertTriangle, name: 'Warning' },
                { Icon: AlertCircle, name: 'Error' },
                { Icon: Info, name: 'Info' },
                { Icon: Clock, name: 'Clock' },
                { Icon: Bell, name: 'Bell' },
                { Icon: User, name: 'User' },
                { Icon: ExternalLink, name: 'Link' }
              ].map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white transition-colors">
                  <Icon size={24} className="text-[#6366F1]" />
                  <span className="text-xs text-[#6B7280]">{name}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Progress & Loading */}
        <section className="mb-12">
          <h2 className="mb-6">⏳ 진행률 & 로딩</h2>
          <Card className="p-6">
            <div className="space-y-6 max-w-md">
              <div>
                <label className="block mb-2">진행률 바</label>
                <Progress value={35} className="mb-2" />
                <Progress value={65} className="mb-2" />
                <Progress value={90} />
              </div>
              <div>
                <label className="block mb-2">스켈레톤 로딩</label>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Toast Notifications */}
        <section className="mb-12">
          <h2 className="mb-6">🔔 토스트 알림</h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast.success('할 일이 추가되었습니다!')}>
                Success Toast
              </Button>
              <Button onClick={() => toast.error('동기화에 실패했습니다.')}>
                Error Toast
              </Button>
              <Button onClick={() => toast.info('새로운 알림이 있습니다.')}>
                Info Toast
              </Button>
              <Button onClick={() => toast('일반 메시지입니다.')}>
                Default Toast
              </Button>
            </div>
          </Card>
        </section>

        {/* Spacing & Shadows */}
        <section className="mb-12">
          <h2 className="mb-6">📏 간격 시스템 (4px 기반)</h2>
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-1 h-1 bg-[#6366F1]"></div>
                <span className="text-[#6B7280]">xs: 4px</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-1 bg-[#6366F1]"></div>
                <span className="text-[#6B7280]">sm: 8px</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-1 bg-[#6366F1]"></div>
                <span className="text-[#6B7280]">md: 12px</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-1 bg-[#6366F1]"></div>
                <span className="text-[#6B7280]">lg: 16px</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-1 bg-[#6366F1]"></div>
                <span className="text-[#6B7280]">xl: 24px</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-1 bg-[#6366F1]"></div>
                <span className="text-[#6B7280]">2xl: 32px</span>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-6">🌑 그림���</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-white rounded-lg flex items-center justify-center" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="text-center">
                <div className="font-semibold mb-1">sm</div>
                <div className="text-xs text-[#9CA3AF]">0 1px 2px</div>
              </div>
            </div>
            <div className="h-24 bg-white rounded-lg flex items-center justify-center" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
              <div className="text-center">
                <div className="font-semibold mb-1">md</div>
                <div className="text-xs text-[#9CA3AF]">0 4px 6px</div>
              </div>
            </div>
            <div className="h-24 bg-white rounded-lg flex items-center justify-center" style={{ boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
              <div className="text-center">
                <div className="font-semibold mb-1">lg</div>
                <div className="text-xs text-[#9CA3AF]">0 10px 15px</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Demos */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => toast.success('삭제되었습니다')}
        title="이 할 일을 삭제하시겠습니까?"
        description="삭제된 항목은 복구할 수 없습니다."
        type="error"
        confirmText="삭제"
      />

      <TodoDetailModal
        isOpen={showTodoModal}
        onClose={() => setShowTodoModal(false)}
        todo={mockTodo}
      />

      <VoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </div>
  );
}

function ColorSwatch({ name, color, description }: { name: string; color: string; description: string }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-24" style={{ backgroundColor: color }} />
      <div className="p-3">
        <div className="font-semibold mb-1">{name}</div>
        <div className="text-xs text-[#9CA3AF] mb-1 font-mono">{color}</div>
        <div className="text-xs text-[#6B7280]">{description}</div>
      </div>
    </div>
  );
}

function ScreenCard({
  icon,
  title,
  description,
  onClick,
  isNew
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isNew?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left group"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="mb-2 group-hover:text-[#6366F1] transition-colors">{title}</h3>
      <p className="text-[#6B7280]">{description}</p>
      {isNew && <Badge className="absolute top-2 right-2 bg-[#FF9B82] text-white">NEW</Badge>}
    </button>
  );
}