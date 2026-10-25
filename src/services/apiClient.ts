import {
  PublishedBooklet,
  UserAccount,
  NotificationOutboxItem,
  BookletDraft,
  SubmittedBooklet,
  FontPreset,
  UserPreferences,
  EventConfig,
  ParticipantPrivateInfo,
  QuestionnaireTemplate,
  QuestionnaireResponse,
  QuestionId,
} from '../types';

export interface SessionInfo {
  user: UserAccount;
  eventConfig: EventConfig;
  hasGeminiKey: boolean;
  model: string;
  appMode: 'DEMO' | 'PILOT';
  cohort?: any; // backwards-compatible
}

const STORAGE_KEY_UID = 'between_pages_current_uid';

export function getStoredUserUid(): string {
  return localStorage.getItem(STORAGE_KEY_UID) || 'user-slow-afternoon';
}

export function setStoredUserUid(uid: string) {
  localStorage.setItem(STORAGE_KEY_UID, uid);
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-uid': getStoredUserUid(),
  };
}

export async function fetchSession(): Promise<SessionInfo> {
  const res = await fetch('/api/session', { headers: getHeaders() });
  if (!res.ok) throw new Error('세션 정보를 불러오지 못했습니다.');
  const data = await res.json();
  return {
    ...data,
    cohort: {
      id: data.eventConfig?.id || 'event-2026-10-seoul-forest',
      title: data.eventConfig?.title || '2026 가을 서울숲 산책 4:4 로테이션',
    },
  };
}

export async function switchUserSession(uid: string): Promise<UserAccount> {
  setStoredUserUid(uid);
  const res = await fetch('/api/session/switch', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ uid }),
  });
  if (!res.ok) throw new Error('사용자 전환에 실패했습니다.');
  const data = await res.json();
  return data.user;
}

export async function fetchMyProfile(): Promise<{ user: UserAccount; participantInfo: ParticipantPrivateInfo | null }> {
  const res = await fetch('/api/me', { headers: getHeaders() });
  if (!res.ok) throw new Error('프로필을 불러오지 못했습니다.');
  return res.json();
}

// User Preferences (Font Preset)
export async function fetchPreferences(): Promise<UserPreferences> {
  const res = await fetch('/api/me/preferences', { headers: getHeaders() });
  if (!res.ok) throw new Error('설정을 불러오지 못했습니다.');
  const data = await res.json();
  return data.preferences;
}

export async function updatePreferences(readingFontPreset: FontPreset): Promise<UserPreferences> {
  const res = await fetch('/api/me/preferences', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ readingFontPreset }),
  });
  if (!res.ok) throw new Error('글꼴 설정 변경에 실패했습니다.');
  const data = await res.json();
  return data.preferences;
}

// Participation Info
export async function fetchMyParticipation(): Promise<ParticipantPrivateInfo | null> {
  const res = await fetch('/api/me/participation', { headers: getHeaders() });
  if (!res.ok) throw new Error('참가 정보를 불러오지 못했습니다.');
  const data = await res.json();
  return data.participation;
}

export async function updateMyParticipation(info: Partial<ParticipantPrivateInfo>): Promise<ParticipantPrivateInfo> {
  const res = await fetch('/api/me/participation', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(info),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '참가 정보 저장에 실패했습니다.' }));
    throw new Error(err.error || '참가 정보 저장에 실패했습니다.');
  }
  const data = await res.json();
  return data.participation;
}

// Questionnaire
export async function fetchQuestionnaireTemplate(): Promise<QuestionnaireTemplate> {
  const res = await fetch('/api/questionnaire/template', { headers: getHeaders() });
  if (!res.ok) throw new Error('질문지 템플릿을 불러오지 못했습니다.');
  const data = await res.json();
  return data.template;
}

export async function fetchMyQuestionnaire(): Promise<QuestionnaireResponse> {
  const res = await fetch('/api/me/questionnaire', { headers: getHeaders() });
  if (!res.ok) throw new Error('질문 답변을 불러오지 못했습니다.');
  const data = await res.json();
  return data.questionnaire;
}

export async function saveMyQuestionnaire(
  answers: Partial<Record<QuestionId, string>>,
  answersRevision: number
): Promise<{ success: boolean; answersRevision: number; lastSavedAt: string }> {
  const res = await fetch('/api/me/questionnaire', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ answers, answersRevision }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '답변 저장에 실패했습니다.' }));
    throw new Error(err.error || '답변 저장에 실패했습니다.');
  }
  return res.json();
}

// Booklet Generation & Review
export async function generateBookletDraft(): Promise<BookletDraft> {
  const res = await fetch('/api/me/booklet/generate', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '책자 초안 생성에 실패했습니다.' }));
    throw new Error(err.error || '책자 초안 생성에 실패했습니다.');
  }
  const data = await res.json();
  return data.draft;
}

export async function fetchMyBookletDraft(): Promise<{
  draft: BookletDraft | null;
  submitted: SubmittedBooklet | null;
}> {
  const res = await fetch('/api/me/booklet/draft', { headers: getHeaders() });
  if (!res.ok) throw new Error('책자 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function updateMyBookletDraft(
  draftUpdates: Partial<BookletDraft>
): Promise<BookletDraft> {
  const res = await fetch('/api/me/booklet/draft', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(draftUpdates),
  });
  if (!res.ok) throw new Error('책자 수정에 실패했습니다.');
  const data = await res.json();
  return data.draft;
}

export async function submitBookletToOperator(): Promise<SubmittedBooklet> {
  const res = await fetch('/api/me/booklet/submit', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '책자 제출에 실패했습니다.' }));
    throw new Error(err.error || '책자 제출에 실패했습니다.');
  }
  const data = await res.json();
  return data.submittedBooklet;
}

export async function withdrawBookletSubmission(): Promise<void> {
  const res = await fetch('/api/me/booklet/withdraw', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('제출 철회에 실패했습니다.');
}

// Bookshelf & Books
export async function fetchCohortBooks(cohortId: string): Promise<PublishedBooklet[]> {
  const res = await fetch(`/api/cohorts/${cohortId}/books`, { headers: getHeaders() });
  if (!res.ok) throw new Error('서가를 불러오지 못했습니다.');
  const data = await res.json();
  return data.books;
}

export async function fetchBook(bookId: string): Promise<PublishedBooklet> {
  const res = await fetch(`/api/books/${bookId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('책자를 불러오지 못했습니다.');
  return res.json();
}

// Notifications
export async function fetchNotifications(): Promise<NotificationOutboxItem[]> {
  const res = await fetch('/api/me/notifications', { headers: getHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications || [];
}

export async function markNotificationsRead(): Promise<void> {
  await fetch('/api/me/notifications/read-all', {
    method: 'POST',
    headers: getHeaders(),
  });
}

// Admin / Operator
export async function fetchAdminOverview(): Promise<any> {
  const res = await fetch('/api/admin/overview', { headers: getHeaders() });
  if (!res.ok) throw new Error('운영자 데이터를 불러오지 못했습니다.');
  return res.json();
}

export async function adminAssignApplication(
  uid: string,
  payload: { assignedSessionId?: string; participantNumber?: string; applicationStatus?: string }
): Promise<any> {
  const res = await fetch(`/api/admin/applications/${uid}/assign`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('배정 처리에 실패했습니다.');
  return res.json();
}

export async function adminReviewBooklet(
  uid: string,
  approved: boolean,
  comment?: string
): Promise<any> {
  const res = await fetch(`/api/admin/booklets/${uid}/review`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ approved, comment }),
  });
  if (!res.ok) throw new Error('책자 검수 처리에 실패했습니다.');
  return res.json();
}

export async function fetchAdminPrintBatch(sessionId: string): Promise<any> {
  const res = await fetch(`/api/admin/print-batch/${sessionId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('인쇄용 책자 데이터를 불러오지 못했습니다.');
  return res.json();
}

// Demo Reset
export async function resetDemoData(): Promise<void> {
  const res = await fetch('/api/demo/reset', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('데모 초기화에 실패했습니다.');
}

// Backwards-compatible stubs for removed features
export async function fetchMyProposals(): Promise<any[]> {
  return [];
}
export async function updateProfile(account: Partial<UserAccount>): Promise<UserAccount> {
  const p = await updateMyParticipation(account as any);
  return {
    uid: p.uid,
    displayName: p.nickname,
    role: 'user',
    cohortId: 'event-2026-10-seoul-forest',
    adultSelfAttested: p.adultSelfConfirmed,
    notificationPreference: 'IN_APP_ONLY',
  };
}
