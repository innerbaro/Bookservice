import React, { useState } from 'react';
import { UserAccount } from '../types';
import { X, Info, MapPin, Calendar, Clock, Users, ShieldCheck } from 'lucide-react';

interface CohortBriefingModalProps {
  cohort?: any;
  currentUser: UserAccount;
  isOpen: boolean;
  onClose: () => void;
  onSaveAttestation: (attested: boolean) => void;
}

export const CohortBriefingModal: React.FC<CohortBriefingModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaveAttestation,
}) => {
  const [attested, setAttested] = useState(currentUser.adultSelfAttested);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#272B29]/60 backdrop-blur-xs font-ui">
      <div className="bg-[#F8F7F3] rounded-xs max-w-lg w-full p-6 sm:p-8 shadow-paper border border-subtle relative max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#686B65] hover:text-[#272B29] p-1 cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="text-[10px] font-mono font-semibold tracking-wider uppercase text-[#58614C] mb-1">
            행사 안내 및 참가 규약
          </div>
          <h2 className="text-xl font-bold font-book-maruburi text-[#272B29]">
            2026 가을 서울숲 산책 4:4 로테이션
          </h2>
          <div className="text-xs text-[#686B65] mt-1 font-book-maruburi flex items-center gap-2">
            <span>서울숲 일대</span>
            <span>·</span>
            <span>2026. 10. 31(토) & 11. 01(일)</span>
            <span>·</span>
            <span>정원 남 4명·여 4명</span>
          </div>
        </div>

        <div className="space-y-4 text-xs text-[#272B29] leading-relaxed">
          {/* Key Schedule Information */}
          <div className="p-4 bg-white rounded-xs border border-subtle space-y-2">
            <h3 className="font-semibold text-[#272B29] flex items-center gap-1.5 font-book-maruburi">
              <Calendar className="w-3.5 h-3.5 text-[#58614C]" />
              행사 일정 및 장소
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#686B65]">
              <div className="p-2 bg-[#FAF9F5] rounded-xs">
                <div className="font-bold text-[#272B29]">토요일 세션</div>
                <div>2026-10-31 (토) 14:00~16:40</div>
                <div>체크인: 13:45 · 서울숲</div>
              </div>
              <div className="p-2 bg-[#FAF9F5] rounded-xs">
                <div className="font-bold text-[#272B29]">일요일 세션</div>
                <div>2026-11-01 (일) 14:00~16:40</div>
                <div>체크인: 13:45 · 서울숲</div>
              </div>
            </div>
            <p className="text-[11px] text-[#686B65] pt-1">
              • 진행 방식: 한 사람과 30분씩 4회 산책 대화, 교체 5분 별도<br />
              • 신청 마감: <strong>10/29(목) 20:00</strong> (선착순 및 가치관 책자 승인 기준)
            </p>
          </div>

          <div className="p-4 bg-white rounded-xs border border-subtle space-y-1.5">
            <h3 className="font-semibold text-[#272B29] flex items-center gap-1.5 font-book-maruburi">
              <Users className="w-3.5 h-3.5 text-[#58614C]" />
              참가 대상 및 인쇄본 원칙
            </h3>
            <ul className="text-[#686B65] space-y-1 list-disc list-inside text-[11px]">
              <li><strong>참가 대상</strong>: 1990년생부터, 행사일 기준 만 19세 이상인 싱글 남녀</li>
              <li><strong>책자 전달</strong>: 행사 당일 배정된 대화 상대 네 분에게만 4권의 인쇄본으로 전달되며, 종료 후 회수됩니다.</li>
              <li><strong>개인정보 보호</strong>: 온라인에 실제 참가자의 책자를 공개하지 않으며, 실명·전화번호·출생연도·직장 정보는 노출되지 않습니다.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-subtle">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => {
                  setAttested(e.target.checked);
                  onSaveAttestation(e.target.checked);
                }}
                className="mt-0.5 w-4 h-4 text-[#58614C] rounded-xs border-stone-300 focus:ring-[#58614C]"
              />
              <span className="text-xs text-[#272B29]">
                <strong>(필수 자가 확인)</strong> 본인은 1990년 이후 출생한 만 19세 이상의 싱글 성인이며, 상호 배려와 존중의 원칙을 지키며 대화에 임할 것에 동의합니다.
                <span className="block text-[#686B65] text-[11px] mt-0.5">
                  * 본 표기는 참가 신청을 위한 자가 확인이며, 정부 공인 본인인증이 아님을 확인합니다.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-subtle flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#58614C] text-[#F8F7F3] rounded-xs text-xs font-medium hover:bg-[#474F3D] cursor-pointer"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
