import React, { useState } from 'react';
import { PublishedBooklet, FontPreset, BookletDraft, SubmittedBooklet } from '../types';
import { BookOpen, Bookmark, ChevronRight, PenLine, CheckCircle2, Clock } from 'lucide-react';

interface BookshelfViewProps {
  books: PublishedBooklet[];
  currentEventTitle?: string;
  onOpenBook: (book: PublishedBooklet) => void;
  currentUserUid: string;
  myDraft?: BookletDraft | null;
  mySubmitted?: SubmittedBooklet | null;
  onNavigateToAuthoring: () => void;
  readingFontPreset?: FontPreset;
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  currentEventTitle = '2026 가을 서울숲 산책 4:4 로테이션',
  onOpenBook,
  currentUserUid,
  myDraft,
  mySubmitted,
  onNavigateToAuthoring,
  readingFontPreset = 'maruburi',
}) => {
  const [pullingBookId, setPullingBookId] = useState<string | null>(null);

  // User's own booklet if available
  const myBook = books.find((b) => b.authorUid === currentUserUid && !b.isExampleBook);
  const exampleBooks = books.filter((b) => b.isExampleBook);

  const handleBookClick = (book: PublishedBooklet) => {
    setPullingBookId(book.publicBookId);
    setTimeout(() => {
      setPullingBookId(null);
      onOpenBook(book);
    }, 240);
  };

  const getThemeColors = (theme?: string) => {
    switch (theme) {
      case 'brick':
        return {
          bg: 'bg-[#9C5A4C]',
          text: 'text-[#F8F7F3]',
          border: 'border-[#84493D]',
          lightBg: 'bg-[#FAF4F2]',
        };
      case 'charcoal':
        return {
          bg: 'bg-[#272B29]',
          text: 'text-[#F8F7F3]',
          border: 'border-[#1C1E1D]',
          lightBg: 'bg-[#F2F3F2]',
        };
      case 'olive':
      default:
        return {
          bg: 'bg-[#58614C]',
          text: 'text-[#F8F7F3]',
          border: 'border-[#474F3D]',
          lightBg: 'bg-[#F3F5F0]',
        };
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Editorial Header Section */}
      <section className="border-b border-subtle pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EFECE6] text-[#58614C] text-[11px] font-mono rounded-xs font-book-maruburi">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58614C]" />
            오프라인 4:4 산책 로테이션
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-book-maruburi text-[#272B29] tracking-tight">
            사람을 읽는 책장
          </h1>
          <p className="text-sm sm:text-base text-[#686B65] font-book-maruburi max-w-2xl leading-relaxed">
            어떤 사람인지, 이야기부터 읽어보세요. 고정된 가치관 질문에 담은 나의 일상과 생각이
            담백한 4면 소개 책자로 엮입니다. 만남은 서울숲에서 4:4 산책으로 이어집니다.
          </p>
        </div>

        {/* Clear Data Boundary & Event Notice */}
        <div className="mt-5 p-4 bg-[#FAF9F5] border border-subtle rounded-xs space-y-1.5 text-xs text-[#686B65] font-ui leading-relaxed">
          <div className="font-semibold text-[#272B29] flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-[#58614C]" />
            책장 안내 및 개인정보 보호 원칙
          </div>
          <p>
            • 아래 서가에 꽂힌 책들은 참가자의 실제 책자 형태를 미리 살펴보실 수 있는 <strong className="text-[#272B29]">예시 책자</strong>입니다.
          </p>
          <p>
            • 참가자의 실제 책자는 온라인에 불특정 다수에게 공개되지 않으며, 행사 당일 서울숲에서 대화 상대 4명에게만 인쇄본으로 제공된 뒤 종료 후 회수됩니다.
          </p>
          <p>
            • 신청 마감은 <strong className="text-[#272B29]">10/29(목) 20:00</strong>이며, 본인이 최종 확인하고 승인한 책자만 인쇄됩니다.
          </p>
        </div>
      </section>

      {/* User's Own Booklet Action Hero */}
      <section className="bg-[#FAF9F5] border border-subtle rounded-xs p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-[#58614C] tracking-wide uppercase font-semibold">
              내 책자 현황
            </div>
            <h2 className="text-lg font-bold font-book-maruburi text-[#272B29]">
              {mySubmitted
                ? `제출 완료: 「${mySubmitted.title}」`
                : myDraft
                ? `초안 작성 중: 「${myDraft.title}」`
                : '아직 작성한 내 책자가 없어요'}
            </h2>
            <p className="text-xs text-[#686B65] font-book-maruburi">
              {mySubmitted
                ? mySubmitted.operatorApproved
                  ? '운영자 인쇄 승인이 완료되었습니다. 행사 당일 서울숲에서 책자로 전달됩니다.'
                  : '운영자 확인 대기 중입니다. 언제든 다시 고치거나 철회할 수 있습니다.'
                : myDraft
                ? '가치관 답변을 바탕으로 정리된 초안이 있습니다. 읽어보고 내 말로 고쳐보세요.'
                : '9가지 고정 가치관 질문에 답하면 AI가 따뜻하고 담백한 소개 책자 초안을 엮어드립니다.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {myBook && (
              <button
                onClick={() => handleBookClick(myBook)}
                className="flex-1 sm:flex-none px-4 py-2 text-xs border border-subtle text-[#272B29] hover:bg-[#EFECE6] transition-colors rounded-xs font-medium cursor-pointer"
              >
                내 책 읽어보기
              </button>
            )}
            <button
              onClick={onNavigateToAuthoring}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs bg-[#58614C] text-[#F8F7F3] hover:bg-[#474F3D] transition-colors rounded-xs font-medium cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>
                {mySubmitted
                  ? '제출 내용 확인 및 수정'
                  : myDraft
                  ? '초안 확인 및 직접 수정'
                  : '내 이야기 적기 (신청 시작)'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Physical Bookshelf (Physical Spine & Pulling Interaction) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-subtle pb-2">
          <h2 className="text-base font-bold font-book-maruburi text-[#272B29] flex items-center gap-2">
            <span>서가에 꽂힌 예시 책들</span>
            <span className="text-xs font-normal text-[#686B65]">
              (총 {exampleBooks.length}권)
            </span>
          </h2>
          <span className="text-xs text-[#686B65] font-ui hidden sm:inline">
            책등을 누르면 책을 꺼내어 양면으로 펼칩니다
          </span>
        </div>

        {/* Shelf Frame */}
        <div className="bg-[#FAF9F5] border border-subtle rounded-xs p-4 sm:p-6 shadow-xs space-y-8">
          {/* Upper Shelf */}
          <div className="space-y-1">
            <div className="flex items-end gap-3 sm:gap-4 overflow-x-auto pb-1 pt-6 px-3 min-h-[220px]">
              {/* Highlight user's book on the shelf if exists */}
              {myBook && (
                <div
                  key={myBook.publicBookId}
                  onClick={() => handleBookClick(myBook)}
                  className={`relative group cursor-pointer transition-all duration-250 select-none ${
                    pullingBookId === myBook.publicBookId
                      ? '-translate-y-4 scale-105 shadow-xl'
                      : 'hover:-translate-y-2'
                  }`}
                  style={{ width: '56px', minWidth: '56px' }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#9C5A4C] text-[#F8F7F3] text-[9px] px-1.5 py-0.5 rounded-xs font-ui">
                    내 책
                  </div>
                  <div
                    className="w-14 h-48 rounded-xs shadow-book-spine flex flex-col justify-between p-2 border transition-colors bg-[#58614C] text-[#F8F7F3] border-[#474F3D]"
                  >
                    <div className="text-[10px] text-center font-mono opacity-80 border-b border-white/20 pb-1">
                      나
                    </div>
                    <div className="flex-1 flex items-center justify-center py-2">
                      <span className="writing-vertical font-book-maruburi text-xs tracking-wider leading-relaxed line-clamp-1 max-h-[120px]">
                        {myBook.metadata.oneLineTitle}
                      </span>
                    </div>
                    <div className="text-[9px] text-center font-mono opacity-70 border-t border-white/20 pt-1">
                      {myBook.metadata.nickname}
                    </div>
                  </div>
                </div>
              )}

              {/* Example books on the shelf */}
              {exampleBooks.map((book) => {
                const colors = getThemeColors(book.metadata.coverTheme);
                const isPulling = pullingBookId === book.publicBookId;

                return (
                  <div
                    key={book.publicBookId}
                    onClick={() => handleBookClick(book)}
                    className={`relative group cursor-pointer transition-all duration-250 select-none ${
                      isPulling ? '-translate-y-4 scale-105 shadow-xl' : 'hover:-translate-y-2'
                    }`}
                    style={{ width: '54px', minWidth: '54px' }}
                    title={`${book.metadata.nickname} · ${book.metadata.oneLineTitle}`}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[#272B29] text-[#F8F7F3] text-[9px] px-1.5 py-0.5 rounded-xs font-ui pointer-events-none">
                      예시 책자
                    </div>
                    <div
                      className={`w-13.5 h-48 rounded-xs shadow-book-spine flex flex-col justify-between p-2 border transition-colors ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      <div className="text-[9px] text-center font-mono opacity-80 border-b border-white/20 pb-1">
                        예시
                      </div>
                      <div className="flex-1 flex items-center justify-center py-2">
                        <span className="writing-vertical font-book-maruburi text-xs tracking-wider leading-relaxed line-clamp-1 max-h-[120px]">
                          {book.metadata.spineTitle || book.metadata.oneLineTitle}
                        </span>
                      </div>
                      <div className="text-[9px] text-center font-mono opacity-70 border-t border-white/20 pt-1">
                        {book.metadata.nickname}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shelf Wood Plaque */}
            <div className="h-3.5 bg-[#4A3B2C] rounded-xs shadow-shelf border-t border-[#6E5741] relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-[#DEDCD4]/70 font-mono tracking-widest">
                SEOUL FOREST · 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Example Preview Cards */}
      <section className="space-y-4">
        <h2 className="text-base font-bold font-book-maruburi text-[#272B29]">
          예시 책자 본문 발췌
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleBooks.slice(0, 2).map((book) => (
            <div
              key={book.publicBookId}
              onClick={() => handleBookClick(book)}
              className="p-5 bg-white border border-subtle rounded-xs hover:border-[#58614C] transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between text-xs text-[#686B65]">
                <span className="font-mono text-[11px] px-1.5 py-0.5 bg-[#EFECE6] text-[#58614C] rounded-xs">
                  예시 책자
                </span>
                <span>{book.metadata.ageBracket}</span>
              </div>
              <h3 className="font-bold text-base font-book-maruburi text-[#272B29] group-hover:text-[#58614C] transition-colors">
                {book.metadata.oneLineTitle}
              </h3>
              <p className="text-xs text-[#686B65] font-book-maruburi leading-relaxed line-clamp-3">
                {book.chapters[0]?.paragraphs[0]?.text || book.chapters[0]?.body}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-[#58614C] font-medium border-t border-subtle/50">
                <span>{book.metadata.nickname} 지음</span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  책 펼쳐 읽기 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
