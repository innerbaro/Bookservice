import React, { useState, useEffect } from 'react';
import {
  fetchAdminOverview,
  adminAssignApplication,
  adminReviewBooklet,
  fetchAdminPrintBatch,
} from '../services/apiClient';
import {
  EventConfig,
  ParticipantPrivateInfo,
  SubmittedBooklet,
} from '../types';
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  MapPin,
  RefreshCw,
  Users,
  BookOpen,
  Send,
  AlertCircle,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [data, setData] = useState<{
    eventConfig: EventConfig;
    sessionStats: any[];
    applications: ParticipantPrivateInfo[];
    submittedBooklets: SubmittedBooklet[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'applications' | 'booklets' | 'print'>('applications');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Print batch state
  const [selectedPrintSessionId, setSelectedPrintSessionId] = useState<string>('session-2026-10-31');
  const [printBatchData, setPrintBatchData] = useState<any | null>(null);
  const [isPrintLoading, setIsPrintLoading] = useState<boolean>(false);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetchAdminOverview();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || '운영자 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (uid: string, assignedSessionId: string, participantNumber: string) => {
    try {
      await adminAssignApplication(uid, {
        assignedSessionId,
        participantNumber,
        applicationStatus: 'CONFIRMED',
      });
      setStatusMessage(`배정이 저장되었습니다: ${participantNumber}`);
      loadOverview();
    } catch (err: any) {
      alert(err.message || '배정 처리에 실패했습니다.');
    }
  };

  const handleReview = async (uid: string, approved: boolean) => {
    try {
      await adminReviewBooklet(uid, approved, reviewComment);
      setStatusMessage(`책자 검수가 처리되었습니다 (${approved ? '인쇄 승인' : '수정 요청'}).`);
      setReviewComment('');
      loadOverview();
    } catch (err: any) {
      alert(err.message || '검수 처리에 실패했습니다.');
    }
  };

  const handleLoadPrintBatch = async (sessionId: string) => {
    setSelectedPrintSessionId(sessionId);
    setIsPrintLoading(true);
    try {
      const res = await fetchAdminPrintBatch(sessionId);
      setPrintBatchData(res);
    } catch (err: any) {
      alert(err.message || '인쇄 데이터 조회 실패');
    } finally {
      setIsPrintLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === 'print') {
      handleLoadPrintBatch(selectedPrintSessionId);
    }
  }, [selectedTab]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-[#686B65] font-book-maruburi">
        운영자 데이터를 불러오는 중입니다...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-[#FAF4F2] border border-[#9C5A4C]/30 text-xs text-[#9C5A4C] rounded-xs font-book-maruburi text-center">
        {statusMessage || '운영자 권한이 없거나 데이터를 불러올 수 없습니다.'}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-ui pb-20">
      {/* Admin Header */}
      <div className="border-b border-subtle pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF4F2] text-[#9C5A4C] text-[10px] font-mono rounded-xs font-semibold uppercase mb-1">
            <ShieldAlert className="w-3 h-3" />
            OPERATOR ONLY
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-book-maruburi text-[#272B29]">
            사람책 운영실: 서울숲 산책 4:4 로테이션
          </h1>
          <p className="text-xs text-[#686B65] font-book-maruburi">
            참가 신청 접수, 회차별 4:4 정원 행정 배정, 소개 책자 검수 및 A5 인쇄 묶음 출력
          </p>
        </div>

        <button
          onClick={loadOverview}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-subtle rounded-xs hover:bg-[#FAF9F5] transition-colors cursor-pointer text-[#272B29]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>새로고침</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#F3F5F0] border border-[#58614C]/30 text-xs text-[#58614C] rounded-xs font-book-maruburi flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-[#686B65] hover:text-[#272B29]">✕</button>
        </div>
      )}

      {/* Session Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.sessionStats.map((stat, idx) => (
          <div key={idx} className="p-5 bg-white border border-subtle rounded-xs space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm font-book-maruburi text-[#272B29]">
                {stat.session.date} ({stat.session.dayOfWeek})
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[#EFECE6] text-[#58614C] rounded-xs font-medium">
                {stat.session.location} {stat.session.runTime}
              </span>
            </div>
            <div className="text-xs text-[#686B65] font-mono flex items-center gap-4 pt-1">
              <span>남성: <strong className="text-[#272B29]">{stat.maleCount}</strong> / {stat.session.capacityMale}명</span>
              <span>여성: <strong className="text-[#272B29]">{stat.femaleCount}</strong> / {stat.session.capacityFemale}명</span>
              <span>총 배정: <strong className="text-[#272B29]">{stat.assignedCount}</strong> / {stat.maxCapacity}명</span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-subtle pb-2 text-xs font-book-maruburi">
        <button
          onClick={() => setSelectedTab('applications')}
          className={`px-4 py-2 rounded-xs border transition-colors cursor-pointer ${
            selectedTab === 'applications'
              ? 'bg-[#58614C] text-white border-[#58614C] font-semibold'
              : 'bg-white border-subtle text-[#686B65] hover:bg-[#FAF9F5]'
          }`}
        >
          참가 신청 및 배정 ({data.applications.length}명)
        </button>
        <button
          onClick={() => setSelectedTab('booklets')}
          className={`px-4 py-2 rounded-xs border transition-colors cursor-pointer ${
            selectedTab === 'booklets'
              ? 'bg-[#58614C] text-white border-[#58614C] font-semibold'
              : 'bg-white border-subtle text-[#686B65] hover:bg-[#FAF9F5]'
          }`}
        >
          제출된 책자 검토 ({data.submittedBooklets.length}권)
        </button>
        <button
          onClick={() => setSelectedTab('print')}
          className={`px-4 py-2 rounded-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'print'
              ? 'bg-[#58614C] text-white border-[#58614C] font-semibold'
              : 'bg-white border-subtle text-[#686B65] hover:bg-[#FAF9F5]'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>회차별 묶음 인쇄</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: APPLICATIONS & SESSIONS ASSIGNMENT                             */}
      {/* ===================================================================== */}
      {selectedTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white border border-subtle rounded-xs overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-subtle text-[#686B65] font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-3">닉네임</th>
                  <th className="p-3">성별/출생</th>
                  <th className="p-3">활동 지역</th>
                  <th className="p-3">가능 날짜</th>
                  <th className="p-3">연락처</th>
                  <th className="p-3">배정 회차</th>
                  <th className="p-3">참가번호</th>
                  <th className="p-3">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {data.applications.map((app) => (
                  <tr key={app.uid} className="hover:bg-[#FAF9F5]/60 transition-colors">
                    <td className="p-3 font-semibold text-[#272B29] font-book-maruburi">
                      {app.nickname}
                    </td>
                    <td className="p-3 font-mono">
                      {app.gender} · {app.birthYear}년
                    </td>
                    <td className="p-3 text-[#686B65] font-book-maruburi">
                      {app.activityRegion}
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {app.preferredDates?.map((d) => d.slice(5)).join(', ')}
                    </td>
                    <td className="p-3 font-mono text-[#686B65]">
                      {app.phoneNumber || '-'}
                    </td>
                    <td className="p-3">
                      <select
                        defaultValue={app.assignedSessionId || ''}
                        id={`session-${app.uid}`}
                        className="p-1 border border-subtle rounded-xs text-[11px] bg-white outline-hidden"
                      >
                        <option value="">미배정</option>
                        <option value="session-2026-10-31">10/31 (토)</option>
                        <option value="session-2026-11-01">11/01 (일)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        defaultValue={app.participantNumber || ''}
                        id={`num-${app.uid}`}
                        className="w-16 p-1 border border-subtle rounded-xs text-[11px] font-mono text-center outline-hidden"
                        placeholder="토-남-1"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const sessEl = document.getElementById(`session-${app.uid}`) as HTMLSelectElement;
                          const numEl = document.getElementById(`num-${app.uid}`) as HTMLInputElement;
                          handleAssign(app.uid, sessEl.value, numEl.value);
                        }}
                        className="px-2.5 py-1 bg-[#58614C] text-white rounded-xs text-[11px] hover:bg-[#474F3D] cursor-pointer"
                      >
                        저장
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SUBMITTED BOOKLETS REVIEW                                      */}
      {/* ===================================================================== */}
      {selectedTab === 'booklets' && (
        <div className="space-y-6">
          {data.submittedBooklets.map((sub) => (
            <div
              key={sub.id}
              className="p-6 bg-white border border-subtle rounded-xs space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-subtle pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-[#58614C] font-semibold">
                    {sub.participantNumber || '번호 미지정'} · {sub.gender}
                  </span>
                  <h3 className="text-base font-bold font-book-maruburi text-[#272B29]">
                    {sub.nickname} — 「{sub.title}」
                  </h3>
                  <div className="text-xs text-[#686B65] font-book-maruburi">
                    {sub.intro}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-xs font-mono font-medium ${
                      sub.operatorApproved
                        ? 'bg-[#F3F5F0] text-[#58614C] border border-[#58614C]/30'
                        : 'bg-[#FAF9F5] text-[#686B65] border border-subtle'
                    }`}
                  >
                    {sub.operatorApproved ? '인쇄 승인 완료' : '검토 대기'}
                  </span>
                </div>
              </div>

              {/* 3 Chapters Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#FAF9F5] p-4 rounded-xs border border-subtle/60">
                {sub.chapters.map((ch, idx) => (
                  <div key={ch.id} className="space-y-1.5 font-book-maruburi">
                    <span className="font-mono text-[#58614C] text-[10px] block">
                      제 {idx + 1} 장 · {ch.heading}
                    </span>
                    <p className="text-[11px] text-[#272B29] leading-relaxed line-clamp-4">
                      {ch.paragraphs?.map((p) => p.text).join(' ') || ch.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Operator Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-subtle/60">
                <div className="text-[11px] text-[#686B65] font-mono">
                  제출 시각: {new Date(sub.submittedAt).toLocaleString('ko-KR')}
                  {sub.operatorComment && ` · 메모: ${sub.operatorComment}`}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview(sub.uid, false)}
                    className="px-3 py-1.5 border border-[#9C5A4C]/30 text-[#9C5A4C] hover:bg-[#FAF4F2] rounded-xs text-xs cursor-pointer font-book-maruburi"
                  >
                    수정 요청
                  </button>
                  <button
                    onClick={() => handleReview(sub.uid, true)}
                    className="px-4 py-1.5 bg-[#58614C] text-white hover:bg-[#474F3D] rounded-xs text-xs font-medium cursor-pointer font-book-maruburi"
                  >
                    인쇄 승인
                  </button>
                </div>
              </div>
            </div>
          ))}

          {data.submittedBooklets.length === 0 && (
            <div className="p-8 text-center text-xs text-[#686B65] bg-white border border-subtle rounded-xs">
              아직 제출된 책자가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: BATCH PRINT (A5 PREVIEW & BROWSER PRINT)                       */}
      {/* ===================================================================== */}
      {selectedTab === 'print' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-subtle rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#272B29]">출력 회차 선택:</span>
              <select
                value={selectedPrintSessionId}
                onChange={(e) => handleLoadPrintBatch(e.target.value)}
                className="text-xs p-2 bg-[#FAF9F5] border border-subtle rounded-xs outline-hidden font-book-maruburi"
              >
                <option value="session-2026-10-31">10/31 (토) 서울숲 세션</option>
                <option value="session-2026-11-01">11/01 (일) 서울숲 세션</option>
              </select>
            </div>

            <button
              onClick={() => window.print()}
              disabled={!printBatchData || printBatchData.totalCount === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#58614C] text-white hover:bg-[#474F3D] rounded-xs text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>브라우저 인쇄 / PDF 저장 (A5 크기)</span>
            </button>
          </div>

          {isPrintLoading ? (
            <div className="p-12 text-center text-xs text-[#686B65]">인쇄 데이터를 생성 중입니다...</div>
          ) : printBatchData && printBatchData.booklets ? (
            <div className="space-y-8">
              <div className="text-xs text-[#686B65] font-mono">
                {printBatchData.session.date} ({printBatchData.session.dayOfWeek}) 인쇄 승인 책자: 총 {printBatchData.totalCount}권 (전화번호, 이메일, 정확한 출생연도, 근거 ID 제외됨)
              </div>

              {/* Printable Booklets Collection */}
              <div className="space-y-12">
                {printBatchData.booklets.map((b: any, bIdx: number) => (
                  <div
                    key={bIdx}
                    className="p-8 bg-white border border-[#272B29] rounded-xs space-y-6 shadow-sm print:shadow-none print:border-none print:p-0 page-break-after"
                    style={{ minHeight: '400px' }}
                  >
                    {/* Header Strip for Operator Sorting */}
                    <div className="flex justify-between items-center text-xs border-b border-[#272B29] pb-2 font-mono">
                      <span className="font-bold text-[#272B29]">
                        [사람책 A5 인쇄본] {b.participantNumber} ({b.gender})
                      </span>
                      <span>{printBatchData.session.date} 서울숲</span>
                    </div>

                    {/* Cover Section */}
                    <div className="text-center py-4 space-y-2 border-b border-subtle">
                      <h2 className="text-xl font-bold font-book-maruburi text-[#272B29]">
                        {b.title}
                      </h2>
                      <div className="text-xs font-book-maruburi text-[#686B65]">
                        {b.nickname} · {b.ageBracket}
                      </div>
                      <p className="text-xs font-book-maruburi text-[#272B29] max-w-lg mx-auto italic">
                        "{b.intro}"
                      </p>
                    </div>

                    {/* 3 Chapters Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-book-maruburi text-xs">
                      {b.chapters.map((ch: any, cIdx: number) => (
                        <div key={cIdx} className="space-y-2 border-l-2 border-[#58614C] pl-3">
                          <h4 className="font-bold text-[#272B29] text-xs">
                            {cIdx + 1}. {ch.heading}
                          </h4>
                          <div className="space-y-1.5 text-[#272B29] leading-relaxed">
                            {ch.paragraphs.map((pText: string, pIdx: number) => (
                              <p key={pIdx} className="whitespace-pre-line">
                                {pText}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-subtle flex justify-between text-[10px] text-[#686B65] font-mono">
                      <span>사람책 서울숲 4:4 산책 로테이션 전용 · 행사 종료 후 회수</span>
                      <span>1권 4면 구성</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#686B65] bg-white border border-subtle rounded-xs">
              선택한 회차에 인쇄 승인된 책자가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
