import React from 'react';
import { Bell, Type, User } from 'lucide-react';
import { UserAccount, FontPreset } from '../types';

interface HeaderProps {
  currentTab: 'bookshelf' | 'my-booklet' | 'admin';
  setCurrentTab: (tab: 'bookshelf' | 'my-booklet' | 'admin') => void;
  currentUser: UserAccount;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenCohortInfo: () => void;
  onOpenFontSettings: () => void;
  onOpenAuth: () => void;
  currentFont: FontPreset;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenCohortInfo,
  onOpenFontSettings,
  onOpenAuth,
  currentFont,
}) => {
  const getFontLabel = (preset: FontPreset) => {
    switch (preset) {
      case 'maruburi':
        return '마루 부리';
      case 'gowun':
        return '고운바탕';
      case 'pretendard':
        return '프리텐다드';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-subtle px-4 sm:px-8 py-3.5 transition-all font-ui">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('bookshelf')}
            className="flex flex-col text-left text-[#272B29] group cursor-pointer"
          >
            <span className="text-xl font-bold tracking-tight font-book-maruburi whitespace-nowrap">
              사람책
            </span>
            <span className="text-[10px] text-[#686B65] font-book-maruburi hidden sm:inline -mt-0.5">
              사람을 읽는 책장 · 서울숲 산책
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#686B65]">
          <button
            onClick={() => setCurrentTab('bookshelf')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'bookshelf'
                ? 'text-[#272B29] font-semibold border-b border-[#58614C]'
                : 'hover:text-[#272B29]'
            }`}
          >
            책장
          </button>
          <button
            onClick={() => setCurrentTab('my-booklet')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              currentTab === 'my-booklet'
                ? 'text-[#272B29] font-semibold border-b border-[#58614C]'
                : 'hover:text-[#272B29]'
            }`}
          >
            내 이야기와 책
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                currentTab === 'admin'
                  ? 'text-[#272B29] font-semibold border-b border-[#58614C]'
                  : 'hover:text-[#272B29]'
              }`}
            >
              운영 관리
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Font Toggle (Aa) */}
          <button
            onClick={onOpenFontSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-subtle text-xs text-[#272B29] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            title="독서 및 인쇄 글꼴 선택"
          >
            <Type className="w-3.5 h-3.5 text-[#58614C]" />
            <span className="hidden sm:inline font-book-maruburi">{getFontLabel(currentFont)}</span>
            <span className="sm:hidden font-book-maruburi">Aa</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-sm border border-subtle text-[#272B29] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            title="알림함"
            aria-label="알림"
          >
            <Bell className="w-4 h-4 text-[#686B65]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#9C5A4C]" />
            )}
          </button>

          {/* User Account / Auth */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-subtle text-xs text-[#272B29] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#58614C]" />
            <span className="max-w-[70px] sm:max-w-[100px] truncate font-medium">
              {currentUser.displayName}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-around pt-2.5 mt-2 border-t border-subtle text-xs text-[#686B65]">
        <button
          onClick={() => setCurrentTab('bookshelf')}
          className={`py-1 cursor-pointer ${
            currentTab === 'bookshelf' ? 'text-[#272B29] font-bold border-b border-[#58614C]' : ''
          }`}
        >
          책장
        </button>
        <button
          onClick={() => setCurrentTab('my-booklet')}
          className={`py-1 cursor-pointer ${
            currentTab === 'my-booklet' ? 'text-[#272B29] font-bold border-b border-[#58614C]' : ''
          }`}
        >
          내 이야기와 책
        </button>
        {currentUser.role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`py-1 cursor-pointer ${
              currentTab === 'admin' ? 'text-[#272B29] font-bold border-b border-[#58614C]' : ''
            }`}
          >
            운영 관리
          </button>
        )}
      </div>
    </header>
  );
};
