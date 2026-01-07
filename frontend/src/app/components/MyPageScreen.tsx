import { ArrowLeft, Edit2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MyPageScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyPageScreen({ isOpen, onClose }: MyPageScreenProps) {
  const [userName, setUserName] = useState("홍길동");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  if (!isOpen) return null;

  const handleSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setIsEditing(false);
      toast.success("이름이 변경되었습니다!");
    } else {
      toast.error("이름을 입력해주세요.");
    }
  };

  const handleCancel = () => {
    setTempName(userName);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[375px] mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-[#F3F4F6]">
        <button onClick={onClose} className="p-1">
          <ArrowLeft size={24} className="text-[#1F2937]" />
        </button>
        <h1 className="flex-1 font-semibold text-[#1F2937]">마이페이지</h1>
      </div>

      {/* Profile Section */}
      <div className="flex-1 overflow-auto bg-[#FAFAFA]">
        <div className="bg-white p-6 mb-4">
          <div className="flex flex-col items-center">
            {/* Profile Image */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD4C8] to-[#FF9B82] flex items-center justify-center mb-4">
              <User size={48} className="text-white" />
            </div>

            {/* Name Section */}
            <div className="w-full max-w-sm">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F9FAFB] rounded-lg text-center text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#FF9B82] transition-all"
                    placeholder="이름을 입력하세요"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2.5 bg-[#FF9B82] text-white rounded-lg hover:bg-[#FF8A6D] transition-colors"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-xl font-semibold text-[#1F2937]">{userName}</h2>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setTempName(userName);
                    }}
                    className="p-2 bg-[#FFF0EB] rounded-lg hover:bg-[#FFE8E0] transition-colors"
                  >
                    <Edit2 size={16} className="text-[#FF9B82]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white p-6">
          <h3 className="font-medium text-[#1F2937] mb-4">계정 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
              <span className="text-[#6B7280]">가입일</span>
              <span className="text-[#1F2937]">2024.01.05</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#F3F4F6]">
              <span className="text-[#6B7280]">멤버십</span>
              <span className="text-[#FF9B82] font-medium">프리미엄</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
