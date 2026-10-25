import React, { useState } from 'react';
import { UserAccount } from '../types';
import { DEMO_USERS } from '../data/defaultData';
import { X, Check, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSwitchUser: (uid: string) => void;
  onNewUserRegistered: (newUser: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onNewUserRegistered,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'demo-accounts'>('login');
  const [kakaoStatusMsg, setKakaoStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    // Generate fresh authentic Google session
    const newUid = `user-google-${Date.now().toString(36)}`;
    const newAccount: UserAccount = {
      uid: newUid,
      displayName: '새 참가자',
      email: 'new.participant@gmail.com',
      role: 'user',
      cohortId: 'event-2026-10-seoul-forest',
      adultSelfAttested: false,
      notificationPreference: 'IN_APP_ONLY',
      readingFontPreset: 'maruburi',
      isGuest: false,
      onboardingCompleted: false,
    };
    onNewUserRegistered(newAccount);
    onClose();
  };

  const handleKakaoClick = () => {
    setKakaoStatusMsg(
      '카카오 로그인은 현재 설정되지 않았습니다. Google 계정으로 계속하기를 이용해 주세요.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#272B29]/60 backdrop-blur-xs font-ui">
      <div className="bg-[#F8F7F3] rounded-xs max-w-md w-full p-6 shadow-paper border border-subtle relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#686B65] hover:text-[#272B29] p-1 cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[10px] uppercase tracking-wider text-[#58614C] font-mono font-semibold mb-1">
          사람책 · 계정 인증
        </div>
        <h2 className="text-xl font-bold font-book-maruburi text-[#272B29] mb-1.5">
          로그인 및 계정
        </h2>
        <p className="text-xs text-[#686B65] leading-relaxed mb-5 font-book-maruburi">
          내 이야기와 책자 초안을 안전하게 보관하고 수정하기 위해 로그인합니다.
        </p>

        {/* Tab Switcher */}
        <div className="flex border-b border-subtle mb-5 text-xs font-book-maruburi">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-2 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'border-[#58614C] text-[#272B29] font-bold'
                : 'border-transparent text-[#686B65] hover:text-[#272B29]'
            }`}
          >
            계정 인증
          </button>
          <button
            onClick={() => setActiveTab('demo-accounts')}
            className={`pb-2 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'demo-accounts'
                ? 'border-[#58614C] text-[#272B29] font-bold'
                : 'border-transparent text-[#686B65] hover:text-[#272B29]'
            }`}
          >
            가상 인물 계정 둘러보기
          </button>
        </div>

        {activeTab === 'login' && (
          <div className="space-y-3">
            {/* Google Sign-in */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 bg-white border border-[#DEDCD4] hover:border-[#272B29] rounded-xs text-xs font-medium text-[#272B29] flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google로 계속하기</span>
            </button>

            {/* Kakao Sign-in */}
            <button
              onClick={handleKakaoClick}
              className="w-full py-2.5 px-4 bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] rounded-xs text-xs font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 3C6.477 3 2 6.477 2 10.77c0 2.723 1.776 5.12 4.47 6.477-.196.726-.71 2.636-.814 3.05-.128.514.188.508.396.37.164-.108 2.607-1.772 3.655-2.485.748.11 1.513.167 2.293.167 5.523 0 10-3.477 10-7.77S17.523 3 12 3z" />
              </svg>
              <span>카카오로 계속하기</span>
            </button>

            {kakaoStatusMsg && (
              <div className="p-3 bg-[#FAF9F5] rounded-xs border border-subtle text-[11px] text-[#686B65] leading-relaxed">
                {kakaoStatusMsg}
              </div>
            )}

            <div className="pt-3 text-[11px] text-[#686B65] leading-relaxed space-y-1 font-book-maruburi">
              <div className="flex items-center gap-1 text-[#58614C] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>계정 인증 및 연령 안내</span>
              </div>
              <p>
                • Google 로그인은 계정 인증이며, 본인 인증 완료가 아닙니다.
              </p>
              <p>
                • 행사 당일 만 19세 이상(1990년 이후 출생)이어야 참가 가능하며, 참가 연령은 현장 체크인 시 다시 확인합니다.
              </p>
              <p>
                • Google 실명·사진·이메일은 책자에 복사되거나 다른 참가자에게 노출되지 않습니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'demo-accounts' && (
          <div className="space-y-2">
            <div className="text-[11px] text-[#686B65] mb-2 font-book-maruburi">
              체험할 가상 인물 계정을 선택하세요:
            </div>
            {DEMO_USERS.map((user) => {
              const isSelected = currentUser.uid === user.uid;
              return (
                <button
                  key={user.uid}
                  onClick={() => {
                    onSwitchUser(user.uid);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xs border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#58614C] bg-[#F3F5F0] text-[#272B29] font-medium'
                      : 'border-subtle bg-white text-[#686B65] hover:border-stone-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#272B29] font-book-maruburi">{user.displayName}</div>
                    <div className="text-[11px] text-[#686B65] font-mono">
                      {user.email} · {user.role === 'admin' ? '운영실' : user.gender || '참가자'}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#58614C]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
