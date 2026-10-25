import {
  QuestionId,
  BookletChapter,
  BookletParagraph,
  PublishedBooklet,
  EvidenceItem,
  AIStatus,
} from '../types';

export interface RawBookletAIOutput {
  title?: string;
  intro?: string;
  chapters?: Array<{
    id?: string;
    heading?: string;
    paragraphs?: Array<{
      text?: string;
      sourceQuestionIds?: string[];
    }>;
  }>;
  reviewFlags?: string[];
}

export interface ValidatedBookletDraftResult {
  title: string;
  intro: string;
  chapters: BookletChapter[];
  reviewFlags: string[];
}

/**
 * Validates and sanitizes structured AI booklet output against user questionnaire answers.
 * Checks for:
 * - Proper 3-chapter structure (daily-life, getting-close, cherished-values)
 * - Source question ID validity (only answered questions cited)
 * - Absence of leaked private identifiers (phone numbers, emails)
 */
export function validateBookletAIOutput(
  raw: any,
  answers: Partial<Record<QuestionId, string>>,
  nickname: string
): ValidatedBookletDraftResult {
  if (!raw || typeof raw !== 'object') {
    return generateWalkBookletFallback(answers, nickname);
  }

  const reviewFlags: string[] = Array.isArray(raw.reviewFlags)
    ? raw.reviewFlags.filter((f: any) => typeof f === 'string')
    : [];

  const rawTitle = typeof raw.title === 'string' ? raw.title.trim() : '';
  const title =
    rawTitle && rawTitle.length <= 60
      ? rawTitle
      : `${nickname}의 일상과 가치관`;

  const rawIntro = typeof raw.intro === 'string' ? raw.intro.trim() : '';
  const intro =
    rawIntro && rawIntro.length <= 300
      ? sanitizeText(rawIntro)
      : answers.Q01
      ? sanitizeText(answers.Q01)
      : `안녕하세요. 서울숲 산책에서 뵙게 될 ${nickname}입니다.`;

  // Required 3 chapters definition
  const requiredChapters = [
    { id: 'daily-life', heading: '내가 좋아하는 하루', defaultSources: ['Q04'] as QuestionId[] },
    { id: 'getting-close', heading: '가까워지는 방식', defaultSources: ['Q01', 'Q05'] as QuestionId[] },
    { id: 'cherished-values', heading: '함께 지키고 싶은 것', defaultSources: ['Q07', 'Q08'] as QuestionId[] },
  ];

  const chapters: BookletChapter[] = [];

  for (const reqCh of requiredChapters) {
    const foundCh = Array.isArray(raw.chapters)
      ? raw.chapters.find((c: any) => c && (c.id === reqCh.id || (c.heading && c.heading.includes(reqCh.heading))))
      : null;

    let paragraphs: BookletParagraph[] = [];

    if (foundCh && Array.isArray(foundCh.paragraphs) && foundCh.paragraphs.length > 0) {
      for (const p of foundCh.paragraphs) {
        if (!p || typeof p.text !== 'string') continue;
        const text = sanitizeText(p.text.trim());
        if (text.length < 5) continue;

        const validSources: QuestionId[] = [];
        if (Array.isArray(p.sourceQuestionIds)) {
          for (const sid of p.sourceQuestionIds) {
            const cleanSid = String(sid).toUpperCase() as QuestionId;
            if (['Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08', 'Q09'].includes(cleanSid)) {
              if (answers[cleanSid]) {
                validSources.push(cleanSid);
              }
            }
          }
        }

        paragraphs.push({
          text,
          sourceQuestionIds: validSources.length > 0 ? validSources : reqCh.defaultSources,
        });
      }
    }

    // Fallback if chapter has no valid paragraphs from AI
    if (paragraphs.length === 0) {
      const fallbackP = buildFallbackParagraphForChapter(reqCh.id, answers);
      if (fallbackP) {
        paragraphs.push(fallbackP);
      }
    }

    chapters.push({
      id: reqCh.id,
      heading: foundCh?.heading && typeof foundCh.heading === 'string' ? foundCh.heading : reqCh.heading,
      paragraphs,
      body: paragraphs.map((p) => p.text).join('\n\n'),
      chapterId: reqCh.id,
    });
  }

  return {
    title,
    intro,
    chapters,
    reviewFlags,
  };
}

/**
 * Strips phone numbers, emails, or personal identifiers from generated text
 */
function sanitizeText(text: string): string {
  let cleaned = text;
  // Remove phone numbers
  cleaned = cleaned.replace(/01[0-9]-?[0-9]{3,4}-?[0-9]{4}/g, '[연락처 비공개]');
  // Remove emails
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[이메일 비공개]');
  return cleaned;
}

function buildFallbackParagraphForChapter(chapterId: string, answers: Partial<Record<QuestionId, string>>): BookletParagraph | null {
  if (chapterId === 'daily-life') {
    const q4 = answers.Q04;
    const q2 = answers.Q02;
    const q3 = answers.Q03;
    const parts: string[] = [];
    const sources: QuestionId[] = [];
    if (q4) {
      parts.push(q4);
      sources.push('Q04');
    }
    if (q2) {
      parts.push(`마음에 남는 작품으로는 ${q2}`);
      sources.push('Q02');
    }
    if (q3) {
      parts.push(`요즘은 ${q3}`);
      sources.push('Q03');
    }
    if (parts.length === 0) return null;
    return {
      text: parts.join(' '),
      sourceQuestionIds: sources,
    };
  }

  if (chapterId === 'getting-close') {
    const q5 = answers.Q05;
    const q6 = answers.Q06;
    const q9 = answers.Q09;
    const parts: string[] = [];
    const sources: QuestionId[] = [];
    if (q5) {
      parts.push(`누군가와 함께한다면 ${q5}`);
      sources.push('Q05');
    }
    if (q6) {
      parts.push(`연애할 때의 제 모습은 ${q6}`);
      sources.push('Q06');
    }
    if (q9) {
      parts.push(`편안한 만남을 위해 알아주셨으면 하는 점은, ${q9}`);
      sources.push('Q09');
    }
    if (parts.length === 0) {
      if (answers.Q01) {
        return {
          text: `처음 만날 때에는 서로의 보폭을 맞추며 편안하게 알아가고 싶어요. ${answers.Q01}`,
          sourceQuestionIds: ['Q01'],
        };
      }
      return null;
    }
    return {
      text: parts.join(' '),
      sourceQuestionIds: sources,
    };
  }

  if (chapterId === 'cherished-values') {
    const q7 = answers.Q07;
    const q8 = answers.Q08;
    const parts: string[] = [];
    const sources: QuestionId[] = [];
    if (q7) {
      parts.push(`관계에서 가장 소중히 지키고 싶은 것은 ${q7}`);
      sources.push('Q07');
    }
    if (q8) {
      parts.push(`앞으로 ${q8}`);
      sources.push('Q08');
    }
    if (parts.length === 0) return null;
    return {
      text: parts.join(' '),
      sourceQuestionIds: sources,
    };
  }

  return null;
}

/**
 * Deterministic local fallback editor when Gemini is unavailable or times out.
 * Faithfully compiles user's Q01~Q09 answers into a 3-chapter booklet.
 */
export function generateWalkBookletFallback(
  answers: Partial<Record<QuestionId, string>>,
  nickname: string
): ValidatedBookletDraftResult {
  const title = answers.Q04
    ? `${nickname}의 하루와 다정한 대화`
    : `${nickname}의 이야기`;

  const intro = answers.Q01
    ? answers.Q01.trim()
    : `안녕하세요. 서울숲 산책에서 뵙게 될 ${nickname}입니다.`;

  const chapters: BookletChapter[] = [
    {
      id: 'daily-life',
      heading: '내가 좋아하는 하루',
      paragraphs: [
        {
          text: answers.Q04
            ? answers.Q04.trim()
            : '주말에는 조용히 시간을 보내며 좋아하는 음악이나 책을 곁에 두고 쉬어가는 편이에요.',
          sourceQuestionIds: ['Q04'],
        },
        ...(answers.Q02
          ? [
              {
                text: `오래 기억에 남는 작품은 ${answers.Q02.trim()}`,
                sourceQuestionIds: ['Q02' as QuestionId],
              },
            ]
          : []),
        ...(answers.Q03
          ? [
              {
                text: `요즘 자주 듣는 노래와 취향은 ${answers.Q03.trim()}`,
                sourceQuestionIds: ['Q03' as QuestionId],
              },
            ]
          : []),
      ],
    },
    {
      id: 'getting-close',
      heading: '가까워지는 방식',
      paragraphs: [
        ...(answers.Q05
          ? [
              {
                text: answers.Q05.trim(),
                sourceQuestionIds: ['Q05' as QuestionId],
              },
            ]
          : [
              {
                text: '누군가와 함께 보낼 때는 복잡한 곳보다 가볍게 걸으며 사소한 일상을 편안하게 나눌 수 있는 산책을 좋아해요.',
                sourceQuestionIds: ['Q01' as QuestionId],
              },
            ]),
        ...(answers.Q06
          ? [
              {
                text: `연애할 때의 저는 ${answers.Q06.trim()}`,
                sourceQuestionIds: ['Q06' as QuestionId],
              },
            ]
          : []),
        ...(answers.Q09
          ? [
              {
                text: `서로 편안하게 대화하기 위해 미리 나누고 싶은 부분은, ${answers.Q09.trim()}`,
                sourceQuestionIds: ['Q09' as QuestionId],
              },
            ]
          : []),
      ],
    },
    {
      id: 'cherished-values',
      heading: '함께 지키고 싶은 것',
      paragraphs: [
        {
          text: answers.Q07
            ? answers.Q07.trim()
            : '관계 속에서 가장 소중히 지키고 싶은 것은 서로를 향한 따뜻한 존중과 정직한 대화예요.',
          sourceQuestionIds: ['Q07'],
        },
        {
          text: answers.Q08
            ? `앞으로 ${answers.Q08.trim()}`
            : '사소한 일상에도 따뜻한 눈길을 둘 줄 알고, 서로의 보폭을 배려해 줄 수 있는 분과 알아가고 싶어요.',
          sourceQuestionIds: ['Q08'],
        },
      ],
    },
  ];

  // Set backward-compatible body and chapterId
  chapters.forEach((ch) => {
    ch.body = ch.paragraphs.map((p) => p.text).join('\n\n');
    ch.chapterId = ch.id;
  });

  return {
    title,
    intro,
    chapters,
    reviewFlags: [],
  };
}

// -----------------------------------------------------------------------------
// Legacy Visitor AI & Interview AI Fallbacks (For safe compile / retired API)
// -----------------------------------------------------------------------------
export interface RawVisitorAIOutput {
  status?: string;
  answer?: string;
  evidence?: Array<{ chapterId?: string; questionId?: string; quote?: string }>;
}

export function validateVisitorAIOutput(
  raw: any,
  booklet: PublishedBooklet
): {
  status: AIStatus;
  answer: string;
  evidence: EvidenceItem[];
} {
  return {
    status: 'NOT_IN_BOOK',
    answer: '2026-10-25 개편으로 방문자 AI 질문 기능은 비활성화되었습니다. 서울숲 오프라인 4:4 산책에서 직접 대면 대화를 나눠보세요.',
    evidence: [],
  };
}

export function generateVisitorFallbackAnswer(
  _question: string,
  _booklet: PublishedBooklet
): {
  status: AIStatus;
  answer: string;
  evidence: EvidenceItem[];
} {
  return {
    status: 'NOT_IN_BOOK',
    answer: '2026-10-25 개편으로 방문자 AI 질문 기능은 비활성화되었습니다. 서울숲 오프라인 4:4 산책에서 직접 대면 대화를 나눠보세요.',
    evidence: [],
  };
}

export function generateInterviewAIFallback(_session: any, _userMsg: string): any {
  return {
    reply: '정형 가치관 질문지(Q01~Q09) 방식으로 개편되었습니다.',
    topicId: 'WRAPUP',
    coverageEvidence: [],
    canOfferBooklet: true,
  };
}

export function generateEditorAIFallback(session: any, userContext: any): any {
  return generateWalkBookletFallback({}, userContext?.nickname || '참가자');
}
