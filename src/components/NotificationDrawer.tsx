import React from 'react';
import { NotificationOutboxItem } from '../types';
import { markNotificationsRead } from '../services/apiClient';
import { X, Bell, Check, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  notifications: NotificationOutboxItem[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleReadAll = async () => {
    await markNotificationsRead();
    onRefresh();
  };

  const getEventBadge = (eventKey: string) => {
    switch (eventKey) {
      case 'APPLICATION_SUBMITTED':
        return <span className="text-[10px] text-[#58614C] bg-[#EFECE6] px-1.5 py-0.5 rounded-xs font-mono">신청 접수</span>;
      case 'DRAFT_GENERATED':
        return <span className="text-[10px] text-[#58614C] bg-[#F3F5F0] px-1.5 py-0.5 rounded-xs font-mono">초안 완성</span>;
      case 'BOOKLET_SUBMITTED':
        return <span className="text-[10px] text-[#9C5A4C] bg-[#FAF4F2] px-1.5 py-0.5 rounded-xs font-mono">제출 완료</span>;
      case 'BOOKLET_APPROVED':
        return <span className="text-[10px] text-[#58614C] bg-[#F3F5F0] px-1.5 py-0.5 rounded-xs font-mono font-bold">인쇄 승인</span>;
      case 'REVISION_REQUESTED':
        return <span className="text-[10px] text-[#9C5A4C] bg-[#FAF4F2] px-1.5 py-0.5 rounded-xs font-mono">수정 요청</span>;
      case 'SESSION_CONFIRMED':
        return <span className="text-[10px] text-[#58614C] bg-[#EFECE6] px-1.5 py-0.5 rounded-xs font-mono">회차 확정</span>;
      default:
        return <span className="text-[10px] text-[#686B65] bg-[#FAF9F5] px-1.5 py-0.5 rounded-xs font-mono">안내</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#272B29]/50 backdrop-blur-xs font-ui">
      <div className="bg-[#FAF9F5] w-full max-w-sm h-full shadow-2xl border-l border-subtle flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#58614C]" />
            <h2 className="text-sm font-bold font-book-maruburi text-[#272B29]">사람책 알림함</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadAll}
              className="text-[11px] text-[#58614C] hover:underline cursor-pointer"
            >
              모두 읽음
            </button>
            <button
              onClick={onClose}
              className="text-[#686B65] hover:text-[#272B29] p-1 cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#686B65] font-book-maruburi">
              도착한 알림이 없습니다.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xs border text-xs space-y-1.5 transition-colors ${
                  item.read
                    ? 'bg-white border-subtle/70 text-[#686B65]'
                    : 'bg-[#F3F5F0] border-[#58614C]/30 text-[#272B29]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {getEventBadge(item.eventKey)}
                  <span className="text-[10px] text-[#686B65] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="font-bold font-book-maruburi text-[#272B29]">{item.title}</div>
                <p className="text-[11px] text-[#686B65] leading-relaxed font-book-maruburi">{item.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
