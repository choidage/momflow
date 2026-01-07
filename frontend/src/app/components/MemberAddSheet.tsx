import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface MemberAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (member: { name: string; phone: string; memo: string }) => void;
}

export function MemberAddSheet({ isOpen, onClose, onSave }: MemberAddSheetProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!name) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    
    // Validate memo length (though maxlength attribute handles it mostly)
    if (memo.length > 30) {
      toast.error('소개는 30자 이내로 입력해주세요.');
      return;
    }

    if (onSave) {
      onSave({ name, phone, memo });
    } else {
      toast.success('멤버가 추가되었습니다.');
    }
    
    // Reset and close
    setName('');
    setPhone('');
    setMemo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[375px] mx-auto bg-white rounded-t-[20px] shadow-2xl" style={{ height: '70vh' }}>
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#F3F4F6] rounded-t-[20px]">
        <h2 className="font-bold text-[#1F2937]">멤버 추가</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
        >
          <X size={24} className="text-[#6B7280]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto" style={{ height: 'calc(70vh - 64px - 80px)' }}>
        <p className="text-sm text-[#6B7280] mb-6">
          새로운 가족 구성원이나 지인을 목록에 추가합니다.
        </p>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">이름</Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-medium">전화번호</Label>
            <Input
              id="phone"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
              type="tel"
            />
          </div>

          {/* Memo Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="memo" className="text-base font-medium">간단 소개</Label>
              <span className="text-xs text-[#9CA3AF]">{memo.length}/30자</span>
            </div>
            <Textarea
              id="memo"
              placeholder="멤버에 대한 간단한 설명을 입력하세요 (30자 이내)"
              value={memo}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setMemo(e.target.value);
                }
              }}
              className="min-h-[100px] bg-[#F9FAFB] border-[#E5E7EB] resize-none text-base"
              maxLength={30}
            />
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[375px] mx-auto bg-white border-t border-[#E5E7EB] p-4">
        <Button 
          onClick={handleSave}
          className="w-full h-14 text-lg font-bold bg-[#FF9B82] hover:bg-[#FF8A6D] text-white rounded-xl"
        >
          추가하기
        </Button>
      </div>
    </div>
  );
}