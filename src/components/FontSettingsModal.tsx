import React, { useState } from 'react';
import { FontPreset, UserPreferences } from '../types';
import { updatePreferences } from '../services/apiClient';
import { X, Check } from 'lucide-react';

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: FontPreset;
  onSaved?: (newPreset: FontPreset) => void;
  onSelectPreset?: (newPreset: FontPreset) => void;
}

export const FontSettingsModal: React.FC<FontSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  onSaved,
  onSelectPreset,
}) => {
  const [selected, setSelected] = useState<FontPreset>(currentPreset);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const fontOptions: Array<{
    id: FontPreset;
    name: string;
    sublabel: string;
    fontClass: string;
    description: string;
  }> = [
    {
      id: 'maruburi',
      name: '책처럼',
      sublabel: '마루 부리 MaruBuri',
      fontClass: 'font-book-maruburi',
      description: '단정한 인쇄물과 책의 질감을 닮은 명조 서체입니다.',
    },
    {
      id: 'gowun',
      name: '부드럽게',
      sublabel: '고운바탕 Gowun Batang',
      fontClass: 'font-book-gowun',
      description: '조금 더 둥글고 다정한 손길이 느껴지는 바탕 서체입니다.',
    },
    {
      id: 'pretendard',
      name: '담백하게',
      sublabel: '프리텐다드 Pretendard',
      fontClass: 'font-book-pretendard',
      description: '군더더기 없이 깔끔하고 시원하게 읽히는 현대적인 고딕 서체입니다.',
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(selected);
      if (onSaved) onSaved(selected);
      if (onSelectPreset) onSelectPreset(selected);
      onClose();
    } catch (err) {
      console.error(err);
      alert('글꼴 설정을 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in font-ui">
      <div className="bg-[#F8F7F3] rounded-md max-w-md w-full p-6 shadow-paper border border-subtle relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-xs uppercase tracking-wider text-[#58614C] font-medium mb-1">
          독서 서체 설정
        </div>
        <h2 className="text-lg font-bold text-[#272B29] mb-1">
          어떤 글꼴로 책자를 읽으시겠어요?
        </h2>
        <p className="text-xs text-[#686B65] mb-5">
          선택하신 글꼴은 서가의 모든 책자를 열람할 때 개인 읽기 서체로 적용되며, 기기에 저장됩니다.
        </p>

        {/* Font List & Sample sentence preview */}
        <div className="space-y-3 mb-6">
          {fontOptions.map((opt) => {
            const isChosen = selected === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`p-4 rounded border transition-all cursor-pointer ${
                  isChosen
                    ? 'border-[#58614C] bg-[#F1EFEA]'
                    : 'border-subtle bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#272B29]">{opt.name}</span>
                    <span className="text-xs text-[#686B65]">({opt.sublabel})</span>
                  </div>
                  {isChosen && <Check className="w-4 h-4 text-[#58614C]" />}
                </div>

                <div className="text-xs text-stone-500 mb-2.5">{opt.description}</div>

                {/* Live Sample Sentence */}
                <div
                  className={`p-2.5 bg-[#FAF9F5] rounded border border-subtle-light text-sm text-[#272B29] leading-relaxed ${opt.fontClass}`}
                >
                  "오전에는 혼자 책을 읽고, 오후에는 가까운 사람과 천천히 걷고 싶어요."
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#58614C] text-white rounded font-medium hover:bg-[#474f3d] transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '이 글꼴로 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
