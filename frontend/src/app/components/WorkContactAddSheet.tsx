import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface WorkContactAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (contact: any) => void;
}

export function WorkContactAddSheet({ isOpen, onClose, onSave }: WorkContactAddSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    position: '',
    specialization: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    
    if (onSave) {
      onSave(formData);
    } else {
      toast.success('업무 연락처가 저장되었습니다.');
    }
    
    // Reset and close
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: '',
      position: '',
      specialization: ''
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[20px] h-[85vh] p-6 max-w-[375px] mx-auto left-0 right-0 overflow-y-auto scrollbar-hide">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-xl font-bold">업무 연락처 추가</SheetTitle>
          <SheetDescription className="text-sm text-[#6B7280]">
            새로운 업무 관련 연락처 정보를 입력합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="work-name" className="text-base font-medium">이름</Label>
            <Input
              id="work-name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="work-phone" className="text-base font-medium">전화번호</Label>
            <Input
              id="work-phone"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
              type="tel"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="work-email" className="text-base font-medium">이메일</Label>
            <Input
              id="work-email"
              placeholder="example@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
              type="email"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="work-company" className="text-base font-medium">회사명</Label>
            <Input
              id="work-company"
              placeholder="회사 이름을 입력하세요"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="work-position" className="text-base font-medium">직위</Label>
            <Input
              id="work-position"
              placeholder="예: 과장, 팀장"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
            />
          </div>

           {/* Specialization */}
           <div className="space-y-2">
            <Label htmlFor="work-specialization" className="text-base font-medium">전문분야</Label>
            <Input
              id="work-specialization"
              placeholder="예: 마케팅, 개발, 영업"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className="h-12 text-lg bg-[#F9FAFB] border-[#E5E7EB]"
            />
          </div>
        </div>

        <SheetFooter className="mt-8 mb-4">
          <Button 
            onClick={handleSave}
            className="w-full h-14 text-lg font-bold bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] rounded-xl"
          >
            저장하기
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
