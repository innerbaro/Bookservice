import React, { useState, useEffect } from 'react';
import { PublishedBooklet, FontPreset } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Type,
  ArrowLeft,
  Printer,
} from 'lucide-react';

interface BookletReaderProps {
  book: PublishedBooklet;
  isOpen: boolean;
  onClose: () => void;
  isSelf: boolean;
  readerFontPreset: FontPreset;
  onOpenFontSettings: () => void;
}

export const BookletReader: React.FC<BookletReaderProps> = ({
  book,
  isOpen,
  onClose,
  isSelf,
  readerFontPreset,
  onOpenFontSettings,
}) => {
  // 4-page booklet spreads:
  // Spread 0: Page 1 (Cover) & Page 2 (Chapter 1: 내가 좋아하는 하루)
  // Spread 1: Page 3 (Chapter 2: 가까워지는 방식) & Page 4 (Chapter 3: 함께 지키고 싶은 것)
  const [spreadIndex, setSpreadIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [useAuthorFont, setUseAuthorFont] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    setSpreadIndex(0);
    setIsClosing(false);
  }, [book.publicBookId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleCloseWithAnimation();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, spreadIndex]);

  if (!isOpen) return null;

  const handleCloseWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240);
  };

  const activeFont: FontPreset = useAuthorFont
    ? book.authorFontPreset || 'maruburi'
    : readerFontPreset;

  const getFontClass = (preset: FontPreset) => {
    switch (preset) {
      case 'maruburi':
        return 'font-book-maruburi';
      case 'gowun':
        return 'font-book-gowun';
      case 'pretendard':
        return 'font-ui';
    }
  };

  const chapters = book.chapters || [];
  const ch1 = chapters.find((c) => c.id === 'daily-life') || chapters[0];
  const ch2 = chapters.find((c) => c.id === 'getting-close') || chapters[1];
  const ch3 = chapters.find((c) => c.id === 'cherished-values') || chapters[2];

  const totalSpreads = 2;

  const handlePrev = () => {
    if (spreadIndex > 0) setSpreadIndex(spreadIndex - 1);
  };

  const handleNext = () => {
    if (spreadIndex < totalSpreads - 1) setSpreadIndex(spreadIndex + 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const getThemeBg = (theme?: string) => {
    switch (theme) {
      case 'brick':
        return 'bg-[#9C5A4C] text-[#F8F7F3]';
      case 'charcoal':
        return 'bg-[#272B29] text-[#F8F7F3]';
      case 'olive':
      default:
        return 'bg-[#58614C] text-[#F8F7F3]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#272B29]/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Container simulating book volume */}
      <div
        className={`relative w-full max-w-4xl bg-[#F8F7F3] rounded-xs shadow-2xl border border-[#DEDCD4] transition-all duration-250 flex flex-col max-h-[92vh] overflow-hidden ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Top Reading Navigation Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-subtle flex items-center justify-between text-xs font-ui bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseWithAnimation}
              className="flex items-center gap-1.5 text-[#686B65] hover:text-[#272B29] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>책장으로</span>
            </button>
            <span className="text-[#DEDCD4]">|</span>
            <span className="font-semibold text-[#272B29] font-book-maruburi truncate max-w-[200px] sm:max-w-xs">
              {book.metadata.oneLineTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[#686B65] hover:text-[#272B29] transition-colors cursor-pointer"
              title="이 책자 인쇄하기"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">인쇄</span>
            </button>

            {/* Author font toggle */}
            <button
              onClick={() => setUseAuthorFont(!useAuthorFont)}
              className={`text-xs px-2 py-1 rounded-xs border transition-colors cursor-pointer ${
                useAuthorFont
                  ? 'bg-[#58614C] text-white border-[#58614C]'
                  : 'bg-white text-[#686B65] border-subtle hover:bg-[#FAF9F5]'
              }`}
            >
              {useAuthorFont ? '글쓴이 글꼴' : '내 글꼴'}
            </button>

            {/* Font selector trigger */}
            <button
              onClick={onOpenFontSettings}
              className="p-1.5 text-[#686B65] hover:text-[#272B29] transition-colors cursor-pointer"
              title="글꼴 변경"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={handleCloseWithAnimation}
              className="p-1.5 text-[#686B65] hover:text-[#272B29] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Two-Page Spread Book Reader View                                    */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 bg-[#F8F7F3] border border-[#DEDCD4] rounded-xs shadow-md relative min-h-[460px]">
            {/* Center binding seam (visible on desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#DEDCD4] z-10 pointer-events-none" />
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/[0.04] to-transparent pointer-events-none z-10" />

            {/* --------------------------------------------------------------- */}
            {/* SPREAD 0: Page 1 (Cover) & Page 2 (내가 좋아하는 하루)            */}
            {/* --------------------------------------------------------------- */}
            {spreadIndex === 0 && (
              <>
                {/* Left Page: Cover */}
                <div className="p-6 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-subtle bg-[#FAF9F5]">
                  <div className="space-y-4 text-center py-6">
                    <span className="text-[10px] font-mono tracking-widest text-[#58614C] uppercase border border-[#58614C]/30 px-2 py-0.5 rounded-xs">
                      {book.isExampleBook ? '예시 책자' : '서울숲 산책 사람책'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold font-book-maruburi text-[#272B29] tracking-tight leading-snug">
                      {book.metadata.oneLineTitle}
                    </h1>
                    <div className="text-xs text-[#686B65] font-book-maruburi">
                      {book.metadata.nickname} 지음
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-subtle/60 text-center">
                    <div className="text-xs text-[#272B29] font-book-maruburi italic leading-relaxed">
                      "{book.chapters[0]?.paragraphs[0]?.text?.slice(0, 70)}..."
                    </div>
                    <div className="text-[11px] font-mono text-[#686B65]">
                      {book.metadata.ageBracket} · {book.metadata.gender}
                    </div>
                    <div className="text-[10px] text-[#686B65]/70 font-mono">
                      1 / 4 면
                    </div>
                  </div>
                </div>

                {/* Right Page: Chapter 1 (내가 좋아하는 하루) */}
                <div className={`p-6 sm:p-10 flex flex-col justify-between ${getFontClass(activeFont)} bg-white`}>
                  <div className="space-y-4">
                    <div className="border-b border-[#58614C]/20 pb-2">
                      <span className="text-[10px] font-mono text-[#58614C] font-semibold block">
                        제 1 장
                      </span>
                      <h2 className="text-base font-bold text-[#272B29]">
                        {ch1?.heading || '내가 좋아하는 하루'}
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-[#272B29] leading-relaxed">
                      {ch1?.paragraphs?.map((p, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {p.text}
                        </p>
                      ))}
                      {!ch1?.paragraphs?.length && ch1?.body && (
                        <p className="whitespace-pre-line">{ch1.body}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-right text-[#686B65]/70 font-mono pt-4 border-t border-subtle/40">
                    2 / 4 면
                  </div>
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SPREAD 1: Page 3 (가까워지는 방식) & Page 4 (함께 지키고 싶은 것)   */}
            {/* --------------------------------------------------------------- */}
            {spreadIndex === 1 && (
              <>
                {/* Left Page: Chapter 2 (가까워지는 방식) */}
                <div className={`p-6 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-subtle bg-white ${getFontClass(activeFont)}`}>
                  <div className="space-y-4">
                    <div className="border-b border-[#58614C]/20 pb-2">
                      <span className="text-[10px] font-mono text-[#58614C] font-semibold block">
                        제 2 장
                      </span>
                      <h2 className="text-base font-bold text-[#272B29]">
                        {ch2?.heading || '가까워지는 방식'}
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-[#272B29] leading-relaxed">
                      {ch2?.paragraphs?.map((p, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {p.text}
                        </p>
                      ))}
                      {!ch2?.paragraphs?.length && ch2?.body && (
                        <p className="whitespace-pre-line">{ch2.body}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-right text-[#686B65]/70 font-mono pt-4 border-t border-subtle/40">
                    3 / 4 면
                  </div>
                </div>

                {/* Right Page: Chapter 3 (함께 지키고 싶은 것) */}
                <div className={`p-6 sm:p-10 flex flex-col justify-between ${getFontClass(activeFont)} bg-[#FAF9F5]`}>
                  <div className="space-y-4">
                    <div className="border-b border-[#58614C]/20 pb-2">
                      <span className="text-[10px] font-mono text-[#58614C] font-semibold block">
                        제 3 장
                      </span>
                      <h2 className="text-base font-bold text-[#272B29]">
                        {ch3?.heading || '함께 지키고 싶은 것'}
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-[#272B29] leading-relaxed">
                      {ch3?.paragraphs?.map((p, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {p.text}
                        </p>
                      ))}
                      {!ch3?.paragraphs?.length && ch3?.body && (
                        <p className="whitespace-pre-line">{ch3.body}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-6 border-t border-subtle/60 text-center">
                    <div className="text-[11px] text-[#58614C] font-book-maruburi">
                      서울숲 오프라인 4:4 산책 로테이션
                    </div>
                    <div className="text-[10px] text-[#686B65] font-mono">
                      4 / 4 면 · 마침
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Paging Controls */}
        <div className="px-4 sm:px-6 py-3 border-t border-subtle flex items-center justify-between text-xs font-ui bg-[#FAF9F5] shrink-0">
          <button
            onClick={handlePrev}
            disabled={spreadIndex === 0}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-xs border transition-colors cursor-pointer ${
              spreadIndex === 0
                ? 'opacity-30 border-transparent cursor-not-allowed text-[#686B65]'
                : 'border-subtle bg-white text-[#272B29] hover:bg-[#EFECE6]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 장</span>
          </button>

          <span className="text-xs font-mono text-[#686B65]">
            펼침 {spreadIndex + 1} / {totalSpreads}
          </span>

          <button
            onClick={handleNext}
            disabled={spreadIndex === totalSpreads - 1}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-xs border transition-colors cursor-pointer ${
              spreadIndex === totalSpreads - 1
                ? 'opacity-30 border-transparent cursor-not-allowed text-[#686B65]'
                : 'border-subtle bg-white text-[#272B29] hover:bg-[#EFECE6]'
            }`}
          >
            <span>다음 장</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
