import React from 'react';
import { UserAccount } from '../types';
import { DEMO_USERS } from '../data/defaultData';
import { RotateCcw } from 'lucide-react';

interface DemoBannerProps {
  currentUser: UserAccount;
  onSwitchUser: (uid: string) => void;
  onResetDemo: () => void;
  hasGeminiKey: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  currentUser,
  onSwitchUser,
  onResetDemo,
  hasGeminiKey,
}) => {
  return (
    <div className="bg-[#EAE8E0] text-[#272B29] px-4 py-2 text-xs border-b border-subtle font-ui">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold px-1.5 py-0.5 rounded-xs bg-stone-300/80 text-[11px] text-stone-800">
            가상 인물 데모
          </span>
          <span className="text-[#686B65] hidden sm:inline font-book-maruburi">
            서울숲 산책 4:4 로테이션 · 정형 가치관 설문과 소개 책자
          </span>
          <span className="text-stone-500 text-[11px] font-mono">
            {hasGeminiKey ? '· Gemini 3.8 연동' : '· 로컬 편집기 모드 (키 미설정)'}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[#686B65] text-[11px]">체험 계정:</span>
            <select
              value={currentUser.uid}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="bg-white text-[#272B29] border border-stone-300 rounded-xs px-2 py-0.5 text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              {DEMO_USERS.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName} ({u.role === 'admin' ? '운영실' : u.gender || '참가자'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (window.confirm('데모 상태를 초기 설정으로 되돌릴까요?')) {
                onResetDemo();
              }
            }}
            className="flex items-center gap-1 text-[#686B65] hover:text-[#272B29] underline underline-offset-2 text-[11px] transition-colors cursor-pointer"
            title="데모 초기화"
          >
            <RotateCcw className="w-3 h-3" />
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};
