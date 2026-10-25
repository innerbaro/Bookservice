import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchMyParticipation,
  updateMyParticipation,
  fetchQuestionnaireTemplate,
  fetchMyQuestionnaire,
  saveMyQuestionnaire,
  generateBookletDraft,
  fetchMyBookletDraft,
  updateMyBookletDraft,
  submitBookletToOperator,
  withdrawBookletSubmission,
} from '../services/apiClient';
import {
  ParticipantPrivateInfo,
  QuestionnaireTemplate,
  QuestionnaireResponse,
  BookletDraft,
  SubmittedBooklet,
  QuestionId,
  FontPreset,
} from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  BookOpen,
  Send,
  RotateCcw,
  Edit3,
  Check,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Type,
} from 'lucide-react';

interface BookletAuthoringViewProps {
  currentUserUid: string;
  onPublished?: () => void;
  readingFontPreset?: FontPreset;
}

type Step = 'participation' | 'questionnaire' | 'draft_review' | 'submitted';

export const BookletAuthoringView: React.FC<BookletAuthoringViewProps> = ({
  currentUserUid,
  onPublished,
  readingFontPreset = 'maruburi',
}) => {
  const [activeStep, setActiveStep] = useState<Step>('questionnaire');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Step 1: Participation
  const [participation, setParticipation] = useState<ParticipantPrivateInfo | null>(null);
  const [partForm, setPartForm] = useState<Partial<ParticipantPrivateInfo>>({
    nickname: '',
    birthYear: 1993,
    gender: '여성',
    activityRegion: '서울 성동구',
    adultSelfConfirmed: true,
    isSingleConfirmed: true,
    phoneNumber: '',
    preferredDates: ['2026-10-31'],
    primaryPreferredDate: '2026-10-31',
    preferredAgeBracket: '',
    inflowChannel: '',
  });
  const [partError, setPartError] = useState<string | null>(null);
  const [partSaving, setPartSaving] = useState<boolean>(false);

  // Step 2: Questionnaire
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [answersRevision, setAnswersRevision] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Step 3: Booklet Draft & Review
  const [draft, setDraft] = useState<BookletDraft | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedBooklet | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isManualEditing, setIsManualEditing] = useState<boolean>(false);
  const [editableDraft, setEditableDraft] = useState<{
    title: string;
    intro: string;
    chapters: Array<{ id: string; heading: string; paragraphs: Array<{ text: string }> }>;
  }>({ title: '', intro: '', chapters: [] });
  const [selectedFont, setSelectedFont] = useState<FontPreset>('maruburi');
  const [showOriginalAnswers, setShowOriginalAnswers] = useState<boolean>(false);

  // Debounce ref for auto-saving questionnaire answers
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAllData();
  }, [currentUserUid]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [partData, tmplData, qData, draftData] = await Promise.all([
        fetchMyParticipation(),
        fetchQuestionnaireTemplate(),
        fetchMyQuestionnaire(),
        fetchMyBookletDraft(),
      ]);

      if (partData) {
        setParticipation(partData);
        setPartForm(partData);
      }
      setTemplate(tmplData);
      if (qData) {
        setAnswers(qData.answers || {});
        setAnswersRevision(qData.answersRevision || 1);
        if (qData.lastSavedAt) {
          setLastSavedTime(new Date(qData.lastSavedAt).toLocaleTimeString('ko-KR'));
        }
      }

      setDraft(draftData.draft);
      setSubmitted(draftData.submitted);

      if (draftData.submitted && draftData.submitted.operatorApproved) {
        setActiveStep('submitted');
      } else if (draftData.submitted) {
        setActiveStep('submitted');
      } else if (draftData.draft) {
        setActiveStep('draft_review');
        initEditableDraft(draftData.draft);
        setSelectedFont(draftData.draft.authorFontPreset || 'maruburi');
      } else if (partData && (!partData.phoneNumber || !partData.birthYear)) {
        setActiveStep('participation');
      } else {
        setActiveStep('questionnaire');
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initEditableDraft = (d: BookletDraft) => {
    setEditableDraft({
      title: d.title,
      intro: d.intro,
      chapters: d.chapters.map((ch) => ({
        id: ch.id,
        heading: ch.heading,
        paragraphs: ch.paragraphs.map((p) => ({ text: p.text })),
      })),
    });
  };

  // Auto-save logic (~800ms debounce)
  const triggerAutoSave = (updatedAnswers: Partial<Record<QuestionId, string>>) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await saveMyQuestionnaire(updatedAnswers, answersRevision);
        setAnswersRevision(res.answersRevision);
        setSaveStatus('saved');
        setLastSavedTime(new Date(res.lastSavedAt).toLocaleTimeString('ko-KR'));
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('error');
      }
    }, 800);
  };

  const handleAnswerChange = (questionId: QuestionId, text: string) => {
    if (text.length > 2000) return;
    const nextAnswers = { ...answers, [questionId]: text };
    setAnswers(nextAnswers);
    triggerAutoSave(nextAnswers);
  };

  const handleSaveParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartError(null);
    setPartSaving(true);
    try {
      if (!partForm.birthYear || partForm.birthYear < 1990 || partForm.birthYear > 2007) {
        throw new Error('1990년생부터 만 19세 이상만 참가 신청할 수 있습니다.');
      }
      if (!partForm.nickname?.trim()) {
        throw new Error('활동 닉네임을 입력해 주세요.');
      }
      if (!partForm.phoneNumber?.trim()) {
        throw new Error('행사 안내를 위한 휴대전화 번호를 입력해 주세요.');
      }
      if (!partForm.adultSelfConfirmed) {
        throw new Error('행사일 기준 만 19세 이상 성인임을 확인해 주세요.');
      }
      if (!partForm.isSingleConfirmed) {
        throw new Error('싱글 참가자임을 확인해 주세요.');
      }

      const updated = await updateMyParticipation(partForm);
      setParticipation(updated);
      setActiveStep('questionnaire');
    } catch (err: any) {
      setPartError(err.message || '참가 정보 저장에 실패했습니다.');
    } finally {
      setPartSaving(false);
    }
  };

  // Required answers validation
  const requiredQuestions: QuestionId[] = ['Q01', 'Q04', 'Q07', 'Q08'];
  const hasAllRequiredAnswers = requiredQuestions.every(
    (qid) => answers[qid] && answers[qid]!.trim().length > 0
  );

  const handleGenerateBooklet = async () => {
    setGenerationError(null);
    setIsGenerating(true);
    try {
      // First ensure latest answers are persisted
      await saveMyQuestionnaire(answers, answersRevision);
      const newDraft = await generateBookletDraft();
      setDraft(newDraft);
      initEditableDraft(newDraft);
      setSelectedFont(newDraft.authorFontPreset || 'maruburi');
      setActiveStep('draft_review');
    } catch (err: any) {
      setGenerationError(err.message || '책자 초안 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveManualDraft = async () => {
    try {
      const updatedChapters = editableDraft.chapters.map((ch, idx) => ({
        id: ch.id,
        heading: ch.heading,
        paragraphs: ch.paragraphs.map((p) => ({
          text: p.text,
          sourceQuestionIds: draft?.chapters[idx]?.paragraphs[0]?.sourceQuestionIds || ['Q04'],
        })),
        body: ch.paragraphs.map((p) => p.text).join('\n\n'),
        chapterId: ch.id,
      }));

      const res = await updateMyBookletDraft({
        title: editableDraft.title,
        intro: editableDraft.intro,
        chapters: updatedChapters as any,
        authorFontPreset: selectedFont,
      });
      setDraft(res);
      setIsManualEditing(false);
    } catch (err: any) {
      alert(err.message || '책자 수정 저장에 실패했습니다.');
    }
  };

  const handleSubmitToOperator = async () => {
    if (!window.confirm('이 내용으로 운영자에게 제출할까요?\n제출된 책자는 서울숲 4:4 산책 당일 대화 상대에게만 인쇄본으로 전달됩니다.')) {
      return;
    }
    try {
      const sub = await submitBookletToOperator();
      setSubmitted(sub);
      setActiveStep('submitted');
      if (onPublished) onPublished();
    } catch (err: any) {
      alert(err.message || '제출에 실패했습니다.');
    }
  };

  const handleWithdrawSubmission = async () => {
    if (!window.confirm('제출을 철회하고 다시 수정하시겠어요?')) return;
    try {
      await withdrawBookletSubmission();
      setSubmitted(null);
      if (draft) {
        setDraft({ ...draft, status: 'REVIEW_READY' });
      }
      setActiveStep('draft_review');
    } catch (err: any) {
      alert(err.message || '제출 철회 실패');
    }
  };

  const getFontFamilyClass = (preset: FontPreset) => {
    switch (preset) {
      case 'maruburi':
        return 'font-book-maruburi';
      case 'gowun':
        return 'font-book-gowun';
      case 'pretendard':
        return 'font-ui';
    }
  };

  if (isLoading || !template) {
    return (
      <div className="py-20 text-center space-y-3 font-book-maruburi text-sm text-[#686B65]">
        <div className="w-6 h-6 border-2 border-[#58614C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>가치관 질문지와 책자 초안을 불러오고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-ui pb-16">
      {/* Stepper Navigation */}
      <div className="border-b border-subtle pb-4">
        <div className="flex items-center justify-between text-xs text-[#686B65] font-book-maruburi">
          <button
            onClick={() => setActiveStep('participation')}
            className={`flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
              activeStep === 'participation'
                ? 'text-[#272B29] font-bold border-b-2 border-[#58614C]'
                : 'hover:text-[#272B29]'
            }`}
          >
            <span>1. 참가 정보</span>
            {participation?.phoneNumber && <Check className="w-3.5 h-3.5 text-[#58614C]" />}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-subtle" />

          <button
            onClick={() => setActiveStep('questionnaire')}
            className={`flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
              activeStep === 'questionnaire'
                ? 'text-[#272B29] font-bold border-b-2 border-[#58614C]'
                : 'hover:text-[#272B29]'
            }`}
          >
            <span>2. 가치관 질문지</span>
            {hasAllRequiredAnswers && <Check className="w-3.5 h-3.5 text-[#58614C]" />}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-subtle" />

          <button
            onClick={() => draft && setActiveStep('draft_review')}
            disabled={!draft}
            className={`flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
              activeStep === 'draft_review'
                ? 'text-[#272B29] font-bold border-b-2 border-[#58614C]'
                : draft
                ? 'hover:text-[#272B29]'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <span>3. 책자 초안 확인</span>
            {draft && <Check className="w-3.5 h-3.5 text-[#58614C]" />}
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-subtle" />

          <button
            onClick={() => submitted && setActiveStep('submitted')}
            disabled={!submitted}
            className={`flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
              activeStep === 'submitted'
                ? 'text-[#272B29] font-bold border-b-2 border-[#58614C]'
                : submitted
                ? 'hover:text-[#272B29]'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <span>4. 운영자 제출</span>
            {submitted && <Check className="w-3.5 h-3.5 text-[#58614C]" />}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* STEP 1: PARTICIPATION PRIVATE INFO                                    */}
      {/* ===================================================================== */}
      {activeStep === 'participation' && (
        <form onSubmit={handleSaveParticipation} className="space-y-6 bg-white p-6 sm:p-8 border border-subtle rounded-xs shadow-xs">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-book-maruburi text-[#272B29]">
              참가 정보 및 신청
            </h2>
            <p className="text-xs text-[#686B65] font-book-maruburi">
              출생연도와 연락처는 비공개 운영 정보이며, 소개 책자에는 들어가지 않습니다.
            </p>
          </div>

          {partError && (
            <div className="p-3 bg-[#FAF4F2] border border-[#9C5A4C]/30 text-xs text-[#9C5A4C] rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{partError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#272B29] mb-1">
                활동 닉네임 <span className="text-[#9C5A4C]">*</span>
              </label>
              <input
                type="text"
                value={partForm.nickname || ''}
                onChange={(e) => setPartForm({ ...partForm, nickname: e.target.value })}
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-subtle rounded-xs focus:border-[#58614C] outline-hidden font-book-maruburi"
                placeholder="책자에 표기될 이름"
                required
              />
              <span className="text-[10px] text-[#686B65]">실명 대신 사용할 가명입니다.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#272B29] mb-1">
                출생연도 <span className="text-[#9C5A4C]">*</span>
              </label>
              <input
                type="number"
                min="1990"
                max="2007"
                value={partForm.birthYear || ''}
                onChange={(e) => setPartForm({ ...partForm, birthYear: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-subtle rounded-xs focus:border-[#58614C] outline-hidden font-mono"
                placeholder="예: 1993"
                required
              />
              <span className="text-[10px] text-[#686B65]">1990년생부터 참가 가능 (만 19세 이상)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#272B29] mb-1">
                성별 <span className="text-[#9C5A4C]">*</span>
              </label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-[#272B29] cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="여성"
                    checked={partForm.gender === '여성'}
                    onChange={() => setPartForm({ ...partForm, gender: '여성' })}
                  />
                  여성
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#272B29] cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="남성"
                    checked={partForm.gender === '남성'}
                    onChange={() => setPartForm({ ...partForm, gender: '남성' })}
                  />
                  남성
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#272B29] mb-1">
                활동 지역 (시·구 단위) <span className="text-[#9C5A4C]">*</span>
              </label>
              <input
                type="text"
                value={partForm.activityRegion || ''}
                onChange={(e) => setPartForm({ ...partForm, activityRegion: e.target.value })}
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-subtle rounded-xs focus:border-[#58614C] outline-hidden font-book-maruburi"
                placeholder="예: 서울 성동구, 서울 마포구"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#272B29] mb-1">
              행사 안내용 휴대전화 번호 <span className="text-[#9C5A4C]">*</span>
            </label>
            <input
              type="tel"
              value={partForm.phoneNumber || ''}
              onChange={(e) => setPartForm({ ...partForm, phoneNumber: e.target.value })}
              className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-subtle rounded-xs focus:border-[#58614C] outline-hidden font-mono"
              placeholder="010-0000-0000"
              required
            />
            <span className="text-[10px] text-[#686B65]">
              당일 서울숲 집결 안내 및 본인 확인용이며 다른 참가자에게는 공개되지 않습니다.
            </span>
          </div>

          <div className="space-y-2 border-t border-subtle pt-4">
            <label className="block text-xs font-semibold text-[#272B29]">
              참가 희망 날짜 <span className="text-[#9C5A4C]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className={`p-3 border rounded-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                partForm.preferredDates?.includes('2026-10-31') ? 'border-[#58614C] bg-[#F3F5F0]' : 'border-subtle bg-[#FAF9F5]'
              }`}>
                <input
                  type="checkbox"
                  checked={partForm.preferredDates?.includes('2026-10-31') || false}
                  onChange={(e) => {
                    const current = partForm.preferredDates || [];
                    const next = e.target.checked
                      ? [...current, '2026-10-31']
                      : current.filter((d) => d !== '2026-10-31');
                    setPartForm({ ...partForm, preferredDates: next });
                  }}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-[#272B29]">10/31 (토요일) 14:00~16:40</div>
                  <div className="text-[11px] text-[#686B65]">서울숲 (체크인 13:45)</div>
                </div>
              </label>

              <label className={`p-3 border rounded-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                partForm.preferredDates?.includes('2026-11-01') ? 'border-[#58614C] bg-[#F3F5F0]' : 'border-subtle bg-[#FAF9F5]'
              }`}>
                <input
                  type="checkbox"
                  checked={partForm.preferredDates?.includes('2026-11-01') || false}
                  onChange={(e) => {
                    const current = partForm.preferredDates || [];
                    const next = e.target.checked
                      ? [...current, '2026-11-01']
                      : current.filter((d) => d !== '2026-11-01');
                    setPartForm({ ...partForm, preferredDates: next });
                  }}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-[#272B29]">11/01 (일요일) 14:00~16:40</div>
                  <div className="text-[11px] text-[#686B65]">서울숲 (체크인 13:45)</div>
                </div>
              </label>
            </div>

            {partForm.preferredDates && partForm.preferredDates.length > 1 && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#272B29] mb-1">
                  두 날짜 모두 가능할 때 우선 희망일
                </label>
                <select
                  value={partForm.primaryPreferredDate || '2026-10-31'}
                  onChange={(e) => setPartForm({ ...partForm, primaryPreferredDate: e.target.value })}
                  className="text-xs p-2 bg-[#FAF9F5] border border-subtle rounded-xs outline-hidden"
                >
                  <option value="2026-10-31">10/31 (토) 우선</option>
                  <option value="2026-11-01">11/01 (일) 우선</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-subtle pt-4 text-xs text-[#272B29]">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={partForm.adultSelfConfirmed || false}
                onChange={(e) => setPartForm({ ...partForm, adultSelfConfirmed: e.target.checked })}
                className="mt-0.5"
                required
              />
              <span>
                <strong>(필수)</strong> 행사 당일(2026-10-31) 기준 만 19세 이상 성인입니다. (현장 확인 절차가 있습니다)
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={partForm.isSingleConfirmed || false}
                onChange={(e) => setPartForm({ ...partForm, isSingleConfirmed: e.target.checked })}
                className="mt-0.5"
                required
              />
              <span>
                <strong>(필수)</strong> 현재 싱글이며, 진지하고 편안한 이성과의 만남을 위해 신청합니다.
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={partSaving}
              className="px-6 py-2.5 bg-[#58614C] text-[#F8F7F3] hover:bg-[#474F3D] transition-colors rounded-xs text-xs font-medium cursor-pointer"
            >
              {partSaving ? '저장 중...' : '저장하고 질문지로 이동 →'}
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* STEP 2: STRUCTURED VALUE QUESTIONNAIRE (Q01 ~ Q09)                   */}
      {/* ===================================================================== */}
      {activeStep === 'questionnaire' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtle pb-4">
            <div>
              <h2 className="text-xl font-bold font-book-maruburi text-[#272B29]">
                가치관 질문지: 서울숲 4:4 산책
              </h2>
              <p className="text-xs text-[#686B65] font-book-maruburi">
                일상과 생각, 관계의 태도를 편안하게 적어주세요. 질문에 담긴 답변들이 1인칭 소개 책자로 엮입니다.
              </p>
            </div>

            {/* Autosave status indicator */}
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              {saveStatus === 'saving' && (
                <span className="text-[#686B65] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> 저장 중...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[#58614C] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 저장 완료 ({lastSavedTime || '방금'})
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-[#9C5A4C] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 아직 저장하지 못했어요
                </span>
              )}
            </div>
          </div>

          {/* 3 Sections: intro / daily / connection */}
          {['intro', 'daily', 'connection'].map((secId) => {
            const secQuestions = template.questions.filter((q) => q.sectionId === secId);
            const sectionTitles: Record<string, string> = {
              intro: '1구역: 첫인사',
              daily: '2구역: 일상과 취향',
              connection: '3구역: 가까워지는 방식',
            };

            return (
              <div key={secId} className="space-y-6">
                <div className="border-b border-subtle/70 pb-2">
                  <h3 className="text-sm font-bold font-book-maruburi text-[#272B29] tracking-wide">
                    {sectionTitles[secId]}
                  </h3>
                </div>

                <div className="space-y-6">
                  {secQuestions.map((q) => {
                    const val = answers[q.id] || '';
                    const isFilled = val.trim().length > 0;

                    return (
                      <div
                        key={q.id}
                        className="bg-white p-5 sm:p-6 border border-subtle rounded-xs shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="text-sm font-semibold font-book-maruburi text-[#272B29] leading-snug">
                            <span className="font-mono text-[#58614C] mr-2 text-xs">[{q.id}]</span>
                            {q.question}
                          </label>
                          {q.required ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FAF4F2] text-[#9C5A4C] border border-[#9C5A4C]/30 rounded-xs shrink-0 font-medium">
                              필수
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FAF9F5] text-[#686B65] border border-subtle rounded-xs shrink-0">
                              선택
                            </span>
                          )}
                        </div>

                        {q.hint && (
                          <p className="text-[11px] text-[#686B65] font-book-maruburi leading-relaxed">
                            {q.hint}
                          </p>
                        )}

                        <textarea
                          rows={3}
                          value={val}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full text-xs p-3 bg-[#FAF9F5] border border-subtle rounded-xs focus:border-[#58614C] outline-hidden leading-relaxed font-book-maruburi resize-y"
                        />

                        <div className="flex justify-between items-center text-[10px] text-[#686B65] font-mono">
                          <span>
                            {q.required && !isFilled ? (
                              <span className="text-[#9C5A4C]">필수 질문입니다</span>
                            ) : isFilled ? (
                              <span className="text-[#58614C]">작성됨</span>
                            ) : (
                              '선택 항목 (비워두셔도 됩니다)'
                            )}
                          </span>
                          <span>{val.length} / 2,000자</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Booklet Generation Action Banner */}
          <div className="p-6 bg-[#FAF9F5] border border-subtle rounded-xs space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm font-book-maruburi text-[#272B29]">
                  책자로 엮어보기
                </h4>
                <p className="text-xs text-[#686B65] font-book-maruburi">
                  필수 네 질문(Q01, Q04, Q07, Q08)에 답하시면 AI가 3개 장으로 이루어진 소개 책자 초안을 엮어드립니다.
                </p>
              </div>

              <button
                onClick={handleGenerateBooklet}
                disabled={!hasAllRequiredAnswers || isGenerating}
                className={`flex items-center gap-2 px-6 py-3 rounded-xs text-xs font-semibold font-book-maruburi transition-all cursor-pointer ${
                  hasAllRequiredAnswers && !isGenerating
                    ? 'bg-[#58614C] text-[#F8F7F3] hover:bg-[#474F3D] shadow-xs'
                    : 'bg-[#DEDCD4] text-[#8C8F89] cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>책자로 정리 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#F8F7F3]" />
                    <span>책자로 엮어보기</span>
                  </>
                )}
              </button>
            </div>

            {generationError && (
              <div className="p-3 bg-[#FAF4F2] border border-[#9C5A4C]/30 text-xs text-[#9C5A4C] rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 3: BOOKLET DRAFT REVIEW & MANUAL EDIT                           */}
      {/* ===================================================================== */}
      {activeStep === 'draft_review' && draft && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-4">
            <div>
              <div className="text-[11px] font-mono text-[#58614C] font-semibold uppercase tracking-wider">
                책자 초안 검토
              </div>
              <h2 className="text-xl font-bold font-book-maruburi text-[#272B29]">
                읽고 고칠 수 있어요
              </h2>
              <p className="text-xs text-[#686B65] font-book-maruburi">
                AI가 정리한 초안입니다. 사실과 다르거나 말투를 바꾸고 싶은 부분은 직접 고쳐주세요.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsManualEditing(!isManualEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xs border transition-colors cursor-pointer ${
                  isManualEditing
                    ? 'bg-[#58614C] text-white border-[#58614C]'
                    : 'bg-white text-[#272B29] border-subtle hover:bg-[#FAF9F5]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isManualEditing ? '편집 완료' : '내 말로 고치기'}</span>
              </button>

              <button
                onClick={() => setShowOriginalAnswers(!showOriginalAnswers)}
                className="px-3 py-1.5 text-xs bg-white text-[#686B65] border border-subtle rounded-xs hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                {showOriginalAnswers ? '원래 답변 닫기' : '원래 답변 보기'}
              </button>
            </div>
          </div>

          {/* Font Selector for Booklet */}
          <div className="flex items-center gap-3 p-3 bg-white border border-subtle rounded-xs text-xs font-ui">
            <span className="font-semibold text-[#272B29] flex items-center gap-1.5 shrink-0">
              <Type className="w-3.5 h-3.5 text-[#58614C]" />
              인쇄 글꼴:
            </span>
            <div className="flex gap-2">
              {[
                { id: 'maruburi', label: '책처럼 (마루 부리)' },
                { id: 'gowun', label: '부드럽게 (고운바탕)' },
                { id: 'pretendard', label: '담백하게 (Pretendard)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFont(f.id as FontPreset)}
                  className={`px-2.5 py-1 rounded-xs border text-xs transition-colors cursor-pointer ${
                    selectedFont === f.id
                      ? 'bg-[#58614C] text-white border-[#58614C] font-semibold'
                      : 'border-subtle text-[#686B65] hover:bg-[#FAF9F5]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Original Answers Drawer (if open) */}
          {showOriginalAnswers && (
            <div className="p-4 bg-[#FAF9F5] border border-subtle rounded-xs space-y-3 text-xs">
              <div className="font-bold font-book-maruburi text-[#272B29]">
                내가 작성한 원래 답변 (참고용)
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {template.questions.map((q) => {
                  const ans = answers[q.id];
                  if (!ans) return null;
                  return (
                    <div key={q.id} className="p-2 bg-white border border-subtle/60 rounded-xs">
                      <div className="font-mono text-[#58614C] text-[10px]">[{q.id}] {q.question}</div>
                      <div className="text-xs text-[#272B29] mt-1 whitespace-pre-wrap font-book-maruburi">{ans}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Book Spread Mockup / Editor View */}
          <div className={`bg-white border border-subtle rounded-xs p-6 sm:p-10 shadow-xs space-y-8 ${getFontFamilyClass(selectedFont)}`}>
            {/* Cover / Title */}
            <div className="border-b border-subtle pb-6 space-y-3 text-center">
              <span className="text-[11px] font-mono tracking-widest text-[#58614C] uppercase">
                {participation?.nickname || '참가자'}의 사람책
              </span>

              {isManualEditing ? (
                <div className="space-y-2 max-w-md mx-auto">
                  <label className="text-[11px] font-mono text-[#686B65] block">책 제목</label>
                  <input
                    type="text"
                    value={editableDraft.title}
                    onChange={(e) => setEditableDraft({ ...editableDraft, title: e.target.value })}
                    className="w-full text-center text-lg font-bold p-2 border border-subtle rounded-xs"
                  />
                  <label className="text-[11px] font-mono text-[#686B65] block">여는 말 (한 줄 소개)</label>
                  <textarea
                    rows={2}
                    value={editableDraft.intro}
                    onChange={(e) => setEditableDraft({ ...editableDraft, intro: e.target.value })}
                    className="w-full text-center text-xs p-2 border border-subtle rounded-xs"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-[#272B29] tracking-tight">
                    {editableDraft.title || draft.title}
                  </h1>
                  <p className="text-xs text-[#686B65] max-w-lg mx-auto leading-relaxed">
                    {editableDraft.intro || draft.intro}
                  </p>
                </>
              )}
            </div>

            {/* Chapters (3 Chapters) */}
            <div className="space-y-8">
              {editableDraft.chapters.map((ch, chIdx) => (
                <div key={ch.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#58614C] font-semibold">
                      제 {chIdx + 1} 장
                    </span>
                    <h3 className="font-bold text-base text-[#272B29] border-b border-[#58614C]/30 pb-0.5">
                      {ch.heading}
                    </h3>
                  </div>

                  <div className="space-y-3 pl-2 sm:pl-4">
                    {ch.paragraphs.map((p, pIdx) => (
                      <div key={pIdx}>
                        {isManualEditing ? (
                          <textarea
                            rows={3}
                            value={p.text}
                            onChange={(e) => {
                              const nextChapters = [...editableDraft.chapters];
                              nextChapters[chIdx].paragraphs[pIdx].text = e.target.value;
                              setEditableDraft({ ...editableDraft, chapters: nextChapters });
                            }}
                            className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-subtle rounded-xs leading-relaxed"
                          />
                        ) : (
                          <p className="text-xs sm:text-sm text-[#272B29] leading-relaxed whitespace-pre-line">
                            {p.text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Edit Save Button */}
            {isManualEditing && (
              <div className="pt-4 border-t border-subtle flex justify-end">
                <button
                  onClick={handleSaveManualDraft}
                  className="px-5 py-2 bg-[#58614C] text-[#F8F7F3] rounded-xs text-xs font-medium cursor-pointer"
                >
                  수정 내용 저장하기
                </button>
              </div>
            )}
          </div>

          {/* Submission Card */}
          <div className="p-6 bg-[#FAF9F5] border border-subtle rounded-xs space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm font-book-maruburi text-[#272B29] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#58614C]" />
                운영자에게 최종 제출하기
              </h3>
              <p className="text-xs text-[#686B65] font-book-maruburi leading-relaxed">
                제출된 책자는 운영자가 회차(10/31 토 또는 11/01 일) 배정 후 인쇄본으로 제작하여 행사 당일 4:4 산책 대화 상대 4분에게 전달됩니다.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[#686B65] font-mono">
                제출 후에도 행사 전까지 언제든 다시 수정하거나 철회할 수 있습니다.
              </span>
              <button
                onClick={handleSubmitToOperator}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#58614C] text-[#F8F7F3] hover:bg-[#474F3D] transition-colors rounded-xs text-xs font-semibold font-book-maruburi shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>이 내용으로 운영자에게 보내기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 4: SUBMITTED CONFIRMATION                                       */}
      {/* ===================================================================== */}
      {activeStep === 'submitted' && submitted && (
        <div className="space-y-8 bg-white p-6 sm:p-10 border border-subtle rounded-xs shadow-xs text-center">
          <div className="w-12 h-12 bg-[#F3F5F0] text-[#58614C] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-[11px] font-mono text-[#58614C] font-semibold uppercase tracking-widest">
              제출 완료
            </span>
            <h2 className="text-2xl font-bold font-book-maruburi text-[#272B29]">
              운영자에게 전달되었습니다
            </h2>
            <p className="text-xs text-[#686B65] font-book-maruburi leading-relaxed">
              작성하신 소개 책자 「{submitted.title}」가 안전하게 접수되었습니다.
              {submitted.operatorApproved ? (
                <strong className="block text-[#58614C] mt-2">
                  [인쇄 승인 완료] 행사 당일 서울숲에서 인쇄본으로 배부됩니다.
                </strong>
              ) : (
                <span className="block mt-1">
                  운영자가 신청 정보와 책자를 확인하여 회차 확정 및 인쇄를 준비합니다.
                </span>
              )}
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-[#FAF9F5] border border-subtle rounded-xs text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[#686B65]">참가자 닉네임:</span>
              <span className="text-[#272B29] font-bold">{submitted.nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#686B65]">신청 희망일:</span>
              <span className="text-[#272B29]">{participation?.preferredDates?.join(', ') || '10/31'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#686B65]">제출 시각:</span>
              <span className="text-[#272B29]">{new Date(submitted.submittedAt).toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#686B65]">인쇄 상태:</span>
              <span className={submitted.operatorApproved ? 'text-[#58614C] font-bold' : 'text-[#686B65]'}>
                {submitted.operatorApproved ? '인쇄 승인 완료' : '운영자 검토 중'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveStep('draft_review')}
              className="px-4 py-2 border border-subtle text-[#272B29] hover:bg-[#FAF9F5] rounded-xs text-xs cursor-pointer font-book-maruburi"
            >
              제출된 책자 보기
            </button>
            <button
              onClick={handleWithdrawSubmission}
              className="px-4 py-2 border border-[#9C5A4C]/30 text-[#9C5A4C] hover:bg-[#FAF4F2] rounded-xs text-xs cursor-pointer font-book-maruburi flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>아직 조금 더 고칠게요 (철회)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
