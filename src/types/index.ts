export type AppMode = 'DEMO' | 'PILOT';

export type FontPreset = 'maruburi' | 'gowun' | 'pretendard';

export interface UserPreferences {
  readingFontPreset: FontPreset;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Event Configuration (Seoul Forest Walk 4:4 Rotation)
// -----------------------------------------------------------------------------
export interface EventSessionConfig {
  id: string; // 'session-2026-10-31' | 'session-2026-11-01'
  dayOfWeek: '토요일' | '일요일';
  date: string; // '2026-10-31' | '2026-11-01'
  location: string; // '서울숲'
  checkInTime: string; // '13:45'
  runTime: string; // '14:00~16:40'
  capacityMale: number; // 4
  capacityFemale: number; // 4
  formatDescription: string; // '한 사람과 30분씩 4회, 교체 5분 별도'
  targetEligibility: string; // '1990년생부터, 행사일 기준 만 19세 이상인 싱글 남녀'
}

export interface EventConfig {
  id: string;
  title: string;
  sessions: EventSessionConfig[];
  applicationDeadline: string; // '2026-10-29 20:00'
  timezone: 'Asia/Seoul';
  status: 'RECRUITING' | 'CLOSED';
}

// -----------------------------------------------------------------------------
// Participant Private Info (Separated from public booklet)
// -----------------------------------------------------------------------------
export interface ParticipantPrivateInfo {
  uid: string;
  nickname: string;
  birthYear: number; // 1990 <= birthYear <= 2007
  gender: '남성' | '여성';
  activityRegion: string; // e.g. '서울 성동구'
  adultSelfConfirmed: boolean; // 행사 당일 만 19세 이상 자가 확인
  isSingleConfirmed: boolean; // 싱글 확인
  phoneNumber: string; // 행사 안내용
  preferredDates: string[]; // ['2026-10-31', '2026-11-01']
  primaryPreferredDate?: string; // 우선 희망일
  preferredAgeBracket?: string; // 선택
  inflowChannel?: string; // 선택
  assignedSessionId?: string; // 'session-2026-10-31' | 'session-2026-11-01'
  participantNumber?: string; // e.g. '토-남-1'
  applicationStatus: 'APPLIED' | 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
  ageCheckStatus: 'SELF_ATTESTED' | 'VERIFIED_ON_SITE' | 'REJECTED';
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Questionnaire (Template & Responses)
// -----------------------------------------------------------------------------
export type QuestionId =
  | 'Q01'
  | 'Q02'
  | 'Q03'
  | 'Q04'
  | 'Q05'
  | 'Q06'
  | 'Q07'
  | 'Q08'
  | 'Q09';

export type QuestionSectionId = 'intro' | 'daily' | 'connection';

export interface QuestionnaireQuestion {
  id: QuestionId;
  sectionId: QuestionSectionId;
  sectionTitle: string;
  question: string;
  required: boolean;
  placeholder?: string;
  hint?: string;
  maxLength: number; // 2000
}

export interface QuestionnaireTemplate {
  version: 'walk-values-v1';
  title: string;
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireResponse {
  ownerUid: string;
  questionnaireVersion: 'walk-values-v1';
  answers: Partial<Record<QuestionId, string>>;
  answersRevision: number;
  lastSavedAt: string;
}

// -----------------------------------------------------------------------------
// Booklet (AI Draft, Chapters, Submission, Print)
// -----------------------------------------------------------------------------
export interface BookletParagraph {
  text: string;
  sourceQuestionIds: QuestionId[];
}

export interface BookletChapter {
  id: 'daily-life' | 'getting-close' | 'cherished-values' | string;
  heading: string;
  paragraphs: BookletParagraph[];
  body?: string; // Backwards-compatible representation
  chapterId?: string; // Backwards-compatible alias
  sourceMessageIds?: string[]; // Backwards-compatible
}

export type BookletLifecycleStatus =
  | 'DRAFT'
  | 'GENERATING'
  | 'REVIEW_READY'
  | 'SUBMITTED'
  | 'OPERATOR_APPROVED'
  | 'WITHDRAWN';

export interface BookletDraft {
  schemaVersion: number;
  uid: string;
  title: string;
  intro: string;
  chapters: BookletChapter[];
  authorFontPreset: FontPreset;
  status: BookletLifecycleStatus;
  inputRevision: number;
  promptVersion: string;
  modelUsed?: string;
  reviewFlags: string[];
  submittedAt?: string;
  updatedAt: string;
  // Legacy compatibility fields if needed
  cohortId?: string;
  metadata?: any;
  reviewStatus?: string;
  missingTopics?: any[];
  adminReviewComment?: string;
}

export interface SubmittedBooklet {
  id: string;
  uid: string;
  version: number;
  nickname: string;
  ageBracket: string; // e.g. "30대 초반" (calculated from birthYear, exact birth year excluded)
  gender: '남성' | '여성';
  title: string;
  intro: string;
  chapters: BookletChapter[];
  authorFontPreset: FontPreset;
  assignedSessionId?: string;
  participantNumber?: string;
  operatorApproved: boolean;
  operatorApprovedAt?: string;
  operatorComment?: string;
  submittedAt: string;
  consentSnapshot: {
    rotationNoticeAcknowledged: boolean;
    termsVersion: '2026-10-25';
    timestamp: string;
  };
}

export interface PublishedBooklet {
  schemaVersion: number;
  publicBookId: string;
  cohortId: string;
  authorUid: string;
  version: number;
  metadata: {
    nickname: string;
    oneLineTitle: string;
    spineTitle?: string;
    region: string;
    ageBracket: string;
    gender: '남성' | '여성' | '직접 표현' | '공개하지 않음';
    coverTheme?: 'olive' | 'brick' | 'charcoal' | 'paper' | 'navy';
    preferredMode?: string;
  };
  authorFontPreset: FontPreset;
  chapters: BookletChapter[];
  authorApprovedAt: string;
  status: 'PUBLISHED' | 'WITHDRAWN';
  isExampleBook?: boolean;
}

export type AIStatus = 'SUPPORTED' | 'NOT_IN_BOOK' | 'PRIVATE_OR_UNSAFE';

export interface EvidenceItem {
  chapterId?: string;
  questionId?: string;
  quote: string;
}

// -----------------------------------------------------------------------------
// User Account & Legacy Stubs
// -----------------------------------------------------------------------------
export interface UserAccount {
  uid: string;
  displayName: string;
  email?: string;
  optionalPhone?: string;
  role: 'user' | 'admin';
  cohortId: string;
  adultSelfAttested: boolean;
  notificationPreference: 'IN_APP_ONLY' | 'EMAIL' | 'KAKAO';
  bookletId?: string;
  readingFontPreset?: FontPreset;
  isGuest?: boolean;
  onboardingCompleted?: boolean;
  region?: string;
  ageBracket?: string;
  gender?: '남성' | '여성';
  preferredMode?: string;
}

export type OutboxStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';

export interface NotificationOutboxItem {
  id: string;
  eventKey:
    | 'APPLICATION_SUBMITTED'
    | 'DRAFT_GENERATED'
    | 'BOOKLET_SUBMITTED'
    | 'BOOKLET_APPROVED'
    | 'REVISION_REQUESTED'
    | 'SESSION_CONFIRMED';
  recipientUid: string;
  channel: 'IN_APP' | 'KAKAO' | 'EMAIL';
  title: string;
  body: string;
  createdAt: string;
  status: OutboxStatus;
  read: boolean;
}

export interface Cohort {
  id: string;
  cohortNumber: number;
  title: string;
  region: string;
  meetingModes: string[];
  startDate: string;
  endDate: string;
  status: 'PREPARING' | 'RECRUITING' | 'ACTIVE' | 'ARCHIVED';
  accessWindow: string;
  maxParticipants: number;
  approvedCount: number;
}
