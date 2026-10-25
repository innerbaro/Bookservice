import React, { useState } from 'react';
import { UserAccount } from '../types';
import { updateProfile } from '../services/apiClient';
import { ShieldCheck, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onCompleted: (updatedUser: UserAccount) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCompleted,
}) => {
  const [nickname, setNickname] = useState<string>(currentUser.displayName || '');
  const [region, setRegion] = useState<string>(currentUser.region || '서울 성동구');
  const [gender, setGender] = useState<'남성' | '여성'>((currentUser.gender as any) || '여성');
  const [adultConfirmed, setAdultConfirmed] = useState<boolean>(currentUser.adultSelfAttested);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('책자에 표기될 가명(닉네임)을 입력해 주세요.');
      return;
    }
    if (!adultConfirmed) {
      setErrorMsg('만 19세 이상 참여 자가 확인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const updated: UserAccount = {
        ...currentUser,
        displayName: nickname.trim(),
        region,
        gender,
        adultSelfAttested: adultConfirmed,
        onboardingCompleted: true,
      };
      await updateProfile(updated);
      onCompleted(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '정보 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#272B29]/60 backdrop-blur-xs font-ui">
      <div className="bg-[#F8F7F3] rounded-xs max-w-md w-full p-6 sm:p-7 shadow-paper border border-subtle relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#686B65] hover:text-[#272B29] p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[10px] uppercase tracking-wider text-[#58614C] font-mono font-semibold mb-1">
          사람책 · 시작하기
        </div>
        <h2 className="text-xl font-bold font-book-maruburi text-[#272B29] mb-1.5">
          기본 활동 정보 확인
        </h2>
        <p className="text-xs text-[#686B65] leading-relaxed mb-5 font-book-maruburi">
          실명·사진 대신 책자에 쓰일 닉네임과 기본 정보만 확인합니다.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#FAF4F2] text-[#9C5A4C] border border-[#9C5A4C]/30 rounded-xs text-xs font-book-maruburi">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#272B29] font-medium mb-1 font-book-maruburi">
              책자에 실릴 가명 (닉네임)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 느린오후, 골목탐험, 새벽산책"
              className="w-full bg-white border border-subtle rounded-xs p-2.5 text-xs text-[#272B29] focus:outline-hidden focus:border-[#58614C] font-book-maruburi"
              required
            />
          </div>

          <div>
            <label className="block text-[#272B29] font-medium mb-1 font-book-maruburi">
              주요 활동 지역 (시·구 단위)
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="예: 서울 성동구, 서울 마포구"
              className="w-full bg-white border border-subtle rounded-xs p-2.5 text-xs text-[#272B29] focus:outline-hidden focus:border-[#58614C] font-book-maruburi"
              required
            />
          </div>

          <div>
            <label className="block text-[#272B29] font-medium mb-1 font-book-maruburi">
              성별
            </label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="onboarding_gender"
                  value="여성"
                  checked={gender === '여성'}
                  onChange={() => setGender('여성')}
                />
                여성
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="onboarding_gender"
                  value="남성"
                  checked={gender === '남성'}
                  onChange={() => setGender('남성')}
                />
                남성
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-subtle">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={adultConfirmed}
                onChange={(e) => setAdultConfirmed(e.target.checked)}
                className="mt-0.5 rounded-xs"
                required
              />
              <span className="text-[#272B29] text-xs leading-relaxed">
                <strong>(필수)</strong> 행사일(2026-10-31) 기준 만 19세 이상이며 1990년 이후 출생한 성인입니다. (현장 확인 절차 포함)
              </span>
            </label>
          </div>

          <div className="p-3 bg-[#FAF9F5] border border-subtle rounded-xs flex items-start gap-2 text-[11px] text-[#686B65]">
            <ShieldCheck className="w-4 h-4 text-[#58614C] shrink-0 mt-0.5" />
            <span>
              서울숲 4:4 산책 행사는 사전 승인된 인쇄 책자로 현장에서 대면 대화를 나눕니다.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#58614C] text-[#F8F7F3] rounded-xs font-medium hover:bg-[#474F3D] transition-colors cursor-pointer"
            >
              {isSubmitting ? '저장 중...' : '확인하고 계속하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
