import {
  EventConfig,
  QuestionnaireTemplate,
  PublishedBooklet,
  UserAccount,
  ParticipantPrivateInfo,
  QuestionnaireResponse,
  BookletDraft,
  SubmittedBooklet,
  NotificationOutboxItem,
  Cohort,
} from '../types';

// -----------------------------------------------------------------------------
// Event Configuration (Single Source of Truth)
// -----------------------------------------------------------------------------
export const EVENT_CONFIG: EventConfig = {
  id: 'event-2026-10-seoul-forest',
  title: '2026 가을 서울숲 산책 4:4 로테이션',
  applicationDeadline: '2026-10-29 20:00',
  timezone: 'Asia/Seoul',
  status: 'RECRUITING',
  sessions: [
    {
      id: 'session-2026-10-31',
      dayOfWeek: '토요일',
      date: '2026-10-31',
      location: '서울숲',
      checkInTime: '13:45',
      runTime: '14:00~16:40',
      capacityMale: 4,
      capacityFemale: 4,
      formatDescription: '한 사람과 30분씩 4회, 교체 5분 별도',
      targetEligibility: '1990년생부터, 행사일 기준 만 19세 이상인 싱글 남녀',
    },
    {
      id: 'session-2026-11-01',
      dayOfWeek: '일요일',
      date: '2026-11-01',
      location: '서울숲',
      checkInTime: '13:45',
      runTime: '14:00~16:40',
      capacityMale: 4,
      capacityFemale: 4,
      formatDescription: '한 사람과 30분씩 4회, 교체 5분 별도',
      targetEligibility: '1990년생부터, 행사일 기준 만 19세 이상인 싱글 남녀',
    },
  ],
};

// -----------------------------------------------------------------------------
// Questionnaire Template (walk-values-v1)
// -----------------------------------------------------------------------------
export const QUESTIONNAIRE_TEMPLATE: QuestionnaireTemplate = {
  version: 'walk-values-v1',
  title: '가치관 질문지: 서울숲 4:4 산책',
  questions: [
    {
      id: 'Q01',
      sectionId: 'intro',
      sectionTitle: '첫인사',
      question: '처음 만날 분들에게 어떤 인사를 건네고 싶나요? 나를 소개하는 한두 문장도 좋아요.',
      required: true,
      placeholder: '예: 안녕하세요. 주말에는 조용히 걷거나 작은 숲길을 둘러보는 시간을 좋아해요.',
      hint: '길지 않아도 괜찮습니다. 나를 떠올리기 좋은 편안한 첫인사나 한 문장을 적어주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q02',
      sectionId: 'daily',
      sectionTitle: '일상과 취향',
      question: '오래 마음에 남은 책이나 영화가 있나요? 어떤 점이 좋았는지도 들려주세요.',
      required: false,
      placeholder: '예: 영화 <리틀 포레스트>요. 큰 사건보다 밥을 짓고 계절의 온도를 마주하는 모습이 오래 남았어요.',
      hint: '줄거리보다는 그 작품이 내게 특별했던 이유나 기억에 남는 장면을 나누어 주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q03',
      sectionId: 'daily',
      sectionTitle: '일상과 취향',
      question: '요즘 자주 듣는 노래나 좋아하는 아티스트가 있나요?',
      required: false,
      placeholder: '예: 요즘은 가사 없는 재즈 트리오나 루시드폴의 담담한 노래를 자주 들어요.',
      hint: '음악의 장르나 아티스트, 혹은 주로 듣는 시간대와 기분을 편안히 적어주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q04',
      sectionId: 'daily',
      sectionTitle: '일상과 취향',
      question: '아무 약속 없는 주말이 생겼어요. 어떤 하루를 보내면 좋을까요?',
      required: true,
      placeholder: '예: 아침에 일어나서 드립 커피를 내리고, 낮에는 햇볕이 잘 드는 공원 벤치에서 책을 읽다 돌아오고 싶어요.',
      hint: '혼자서 온전히 보내는 시간 중 내가 가장 편안하고 기분 좋게 회복하는 하루를 들려주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q05',
      sectionId: 'daily',
      sectionTitle: '일상과 취향',
      question: '누군가와 함께 보낸다면 어떤 데이트가 편하고 즐거울까요?',
      required: false,
      placeholder: '예: 각자 좋아하는 동네 골목이나 작은 헌책방을 천천히 산책하고, 조용한 찻집에서 따뜻한 차를 마시는 데이트요.',
      hint: '특별한 이벤트가 아니더라도 편안하게 함께 숨 쉴 수 있는 시간의 모습을 적어주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q06',
      sectionId: 'connection',
      sectionTitle: '가까워지는 방식',
      question: '연애할 때의 나는 어떤 모습에 가까운가요?',
      required: false,
      placeholder: '예: 말이 앞서기보다 상대방의 하루를 먼저 묵묵히 들어주고, 작은 배려나 맛있는 음식을 챙겨주는 편이에요.',
      hint: '나의 표현 방식이나 상대방을 대하는 태도를 솔직하게 적어주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q07',
      sectionId: 'connection',
      sectionTitle: '가까워지는 방식',
      question: '누군가와 만나면서 오래 소중히 지키고 싶은 것은 무엇인가요? 이유도 조금 들려주세요.',
      required: true,
      placeholder: '예: 서로의 일상과 혼자만의 시간을 존중하는 것, 그리고 서운한 점이 생겼을 때 바로 단정 짓지 않고 대화로 푸는 태도요.',
      hint: '관계 속에서 가장 중요하게 여기는 태도나 서로를 지켜주는 약속을 들려주세요.',
      maxLength: 2000,
    },
    {
      id: 'Q08',
      sectionId: 'connection',
      sectionTitle: '가까워지는 방식',
      question: '어떤 사람과 서로를 알아가고 싶나요?',
      required: true,
      placeholder: '예: 사소한 일상에도 따뜻한 눈길을 둘 줄 알고, 솔직하면서도 다정한 태도로 대화할 수 있는 사람과 알아가고 싶어요.',
      hint: '나와 결이 맞거나 대화를 나누었을 때 마음이 편안해지는 상대의 모습을 떠올려 보세요.',
      maxLength: 2000,
    },
    {
      id: 'Q09',
      sectionId: 'connection',
      sectionTitle: '가까워지는 방식',
      question: '서로 조금 더 편하게 만나려면, 나에 대해 미리 알아주었으면 하는 점이나 잘 맞지 않는 관계 방식이 있나요?',
      required: false,
      placeholder: '예: 처음에는 조금 낯을 가려서 조용해 보일 수 있지만, 편안해지면 이야기를 잘 들어요. 재촉하거나 서두르지 않는 속도가 편해요.',
      hint: '나의 템포나 관계에서 피하고 싶은 방식을 미리 이야기해 주시면 더 사려 깊은 만남이 됩니다.',
      maxLength: 2000,
    },
  ],
};

// -----------------------------------------------------------------------------
// Demo Users
// -----------------------------------------------------------------------------
export const DEMO_USERS: UserAccount[] = [
  {
    uid: 'user-slow-afternoon',
    displayName: '느린오후',
    email: 'slow.afternoon@demo.local',
    optionalPhone: '010-3841-8821',
    role: 'user',
    cohortId: 'event-2026-10-seoul-forest',
    adultSelfAttested: true,
    notificationPreference: 'IN_APP_ONLY',
    bookletId: 'book-slow-afternoon',
    readingFontPreset: 'maruburi',
    ageBracket: '1993년생 (30대 초반)',
    gender: '여성',
    region: '서울 성동구',
    onboardingCompleted: true,
  },
  {
    uid: 'user-alley-explorer',
    displayName: '골목탐험',
    email: 'alley.walk@demo.local',
    optionalPhone: '010-9271-4190',
    role: 'user',
    cohortId: 'event-2026-10-seoul-forest',
    adultSelfAttested: true,
    notificationPreference: 'IN_APP_ONLY',
    bookletId: 'book-alley-explorer',
    readingFontPreset: 'gowun',
    ageBracket: '1991년생 (30대 중반)',
    gender: '남성',
    region: '서울 마포구',
    onboardingCompleted: true,
  },
  {
    uid: 'user-dawn-walk',
    displayName: '새벽산책',
    email: 'dawn.walk@demo.local',
    optionalPhone: '010-5112-9014',
    role: 'user',
    cohortId: 'event-2026-10-seoul-forest',
    adultSelfAttested: true,
    notificationPreference: 'IN_APP_ONLY',
    bookletId: 'book-dawn-walk',
    readingFontPreset: 'pretendard',
    ageBracket: '1995년생 (20대 후반)',
    gender: '여성',
    region: '서울 용산구',
    onboardingCompleted: true,
  },
  {
    uid: 'user-type-addict',
    displayName: '활자중독',
    email: 'type.lover@demo.local',
    optionalPhone: '010-8841-3329',
    role: 'user',
    cohortId: 'event-2026-10-seoul-forest',
    adultSelfAttested: true,
    notificationPreference: 'IN_APP_ONLY',
    bookletId: 'book-type-addict',
    readingFontPreset: 'maruburi',
    ageBracket: '1992년생 (30대 초반)',
    gender: '남성',
    region: '서울 종로구',
    onboardingCompleted: true,
  },
  {
    uid: 'user-admin',
    displayName: '숲의운영자',
    email: 'admin@betweenpages.local',
    role: 'admin',
    cohortId: 'event-2026-10-seoul-forest',
    adultSelfAttested: true,
    notificationPreference: 'IN_APP_ONLY',
    readingFontPreset: 'pretendard',
    region: '서울 성동구',
    onboardingCompleted: true,
  },
];

// -----------------------------------------------------------------------------
// Curated Example Booklets (Displayed on the Bookshelf to demonstrate format)
// -----------------------------------------------------------------------------
export const INITIAL_BOOKLETS: PublishedBooklet[] = [
  {
    schemaVersion: 2,
    publicBookId: 'book-slow-afternoon',
    cohortId: 'event-2026-10-seoul-forest',
    authorUid: 'user-slow-afternoon',
    version: 1,
    status: 'PUBLISHED',
    authorApprovedAt: '2026-10-24T10:00:00Z',
    authorFontPreset: 'maruburi',
    isExampleBook: true,
    metadata: {
      nickname: '느린오후',
      oneLineTitle: '평범한 토요일을 나누는 법',
      spineTitle: '평범한 토요일',
      region: '서울 성동구',
      ageBracket: '30대 초반 (1993년생)',
      gender: '여성',
      coverTheme: 'olive',
    },
    chapters: [
      {
        id: 'daily-life',
        heading: '내가 좋아하는 하루',
        paragraphs: [
          {
            text: '인생 영화는 <리틀 포레스트>예요. 큰 사건보다 밥을 짓고 계절의 온도를 느끼는 시간이 오래 기억에 남았어요. 정신없는 한 주가 끝나면 작은 음식을 조용히 만들면서 쉬는 편이에요.',
            sourceQuestionIds: ['Q02'],
          },
          {
            text: '아무 약속 없는 주말에는 아침 일찍 일어나 따뜻한 드립 커피를 내려요. 낮에는 햇볕이 잘 드는 공원 벤치에서 책을 읽거나 식물 화분을 정리하며 고요하게 머물러요.',
            sourceQuestionIds: ['Q04'],
          },
        ],
      },
      {
        id: 'getting-close',
        heading: '가까워지는 방식',
        paragraphs: [
          {
            text: '누군가와 함께 보낸다면 화려한 곳보다 각자 좋아하는 동네 골목이나 작은 헌책방을 천천히 걷고 싶어요. 조용한 찻집에서 따뜻한 차를 마시며 사소한 일상을 나누는 데이트가 가장 편안해요.',
            sourceQuestionIds: ['Q05'],
          },
          {
            text: '연애할 때는 말이 앞서기보다 상대의 하루를 묵묵히 들어주는 편이에요. 처음에는 조금 낯을 가리지만, 편안해지면 속 깊은 이야기를 오래 나눌 수 있어요. 재촉하지 않는 다정한 속도가 좋아요.',
            sourceQuestionIds: ['Q06', 'Q09'],
          },
        ],
      },
      {
        id: 'cherished-values',
        heading: '함께 지키고 싶은 것',
        paragraphs: [
          {
            text: '누군가와 만나면서 서로의 일상과 혼자만의 시간을 존중해 주는 것을 가장 소중히 여겨요. 서운한 점이 생겼을 때 혼자 속으로 단정 짓지 않고 부드러운 언어로 이야기할 수 있는 신뢰를 지키고 싶어요.',
            sourceQuestionIds: ['Q07'],
          },
          {
            text: '사소한 일상에도 따뜻한 눈길을 둘 줄 알고, 솔직하면서도 다정한 태도로 대화할 수 있는 분과 천천히 알아가고 싶어요.',
            sourceQuestionIds: ['Q08'],
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 2,
    publicBookId: 'book-alley-explorer',
    cohortId: 'event-2026-10-seoul-forest',
    authorUid: 'user-alley-explorer',
    version: 1,
    status: 'PUBLISHED',
    authorApprovedAt: '2026-10-24T11:00:00Z',
    authorFontPreset: 'gowun',
    isExampleBook: true,
    metadata: {
      nickname: '골목탐험',
      oneLineTitle: '익숙한 길 밖으로 발걸음을 옮길 때',
      spineTitle: '익숙한 길 밖으로',
      region: '서울 마포구',
      ageBracket: '30대 중반 (1991년생)',
      gender: '남성',
      coverTheme: 'brick',
    },
    chapters: [
      {
        id: 'daily-life',
        heading: '내가 좋아하는 하루',
        paragraphs: [
          {
            text: '약속 없는 주말에는 카메라 하나를 메고 가보지 않은 낯선 동네의 골목길을 정처 없이 걸어요. 오래된 간판과 작은 화분들을 구경하다 발견한 동네 빵집에서 갓 구운 빵을 먹는 순간이 참 평화로워요.',
            sourceQuestionIds: ['Q04'],
          },
          {
            text: '요즘은 쳇 베이커의 나직한 트럼펫 연주나 잔잔한 어쿠스틱 포크를 자주 들어요. 걷는 동안 귀에 닿는 차분한 멜로디가 생각을 가볍게 비워줘요.',
            sourceQuestionIds: ['Q03'],
          },
        ],
      },
      {
        id: 'getting-close',
        heading: '가까워지는 방식',
        paragraphs: [
          {
            text: '누군가와 함께한다면 동네 산책길을 나란히 걷다가 우연히 마주친 아늑한 공간에서 쉬어가는 시간이 즐거워요. 특별히 대단한 계획이 없어도 함께 있는 공기가 편안했으면 좋겠어요.',
            sourceQuestionIds: ['Q05'],
          },
          {
            text: '상대방의 취향을 호기심 어린 눈으로 바라보고 그 세계를 함께 경험해 보는 걸 좋아해요. 감정을 억누르거나 돌려 말하기보다 솔직하고 담백하게 표현하는 편이에요.',
            sourceQuestionIds: ['Q06'],
          },
        ],
      },
      {
        id: 'cherished-values',
        heading: '함께 지키고 싶은 것',
        paragraphs: [
          {
            text: '가장 소중히 지키고 싶은 것은 서로를 당연하게 여기지 않는 감사한 마음이에요. 아무리 가까워져도 예의와 배려를 잃지 않고, 서로의 고유한 꿈과 영역을 따뜻하게 응원해주고 싶어요.',
            sourceQuestionIds: ['Q07'],
          },
          {
            text: '자기만의 시선으로 세상을 바라볼 줄 알고, 일상의 작은 유머에 함께 웃을 수 있는 다정한 분과 마주하고 싶습니다.',
            sourceQuestionIds: ['Q08'],
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 2,
    publicBookId: 'book-dawn-walk',
    cohortId: 'event-2026-10-seoul-forest',
    authorUid: 'user-dawn-walk',
    version: 1,
    status: 'PUBLISHED',
    authorApprovedAt: '2026-10-24T12:00:00Z',
    authorFontPreset: 'pretendard',
    isExampleBook: true,
    metadata: {
      nickname: '새벽산책',
      oneLineTitle: '계절의 냄새를 온전히 마주하기',
      spineTitle: '계절 마주하기',
      region: '서울 용산구',
      ageBracket: '20대 후반 (1995년생)',
      gender: '여성',
      coverTheme: 'charcoal',
    },
    chapters: [
      {
        id: 'daily-life',
        heading: '내가 좋아하는 하루',
        paragraphs: [
          {
            text: '이른 아침 공기가 차가울 때 집 근처 산책로를 가볍게 달리는 걸 좋아해요. 땀을 흘린 뒤 마시는 시원한 보리차와 아침 햇살이 비추는 방 안에서 책을 펼칠 때 마음이 단단해져요.',
            sourceQuestionIds: ['Q04'],
          },
          {
            text: '오래 마음에 남은 책은 헤르만 헤세의 <데미안>이에요. 나 자신에게로 이르는 길을 묵묵히 걸어가는 태도가 삶의 중요한 길잡이가 되어주고 있어요.',
            sourceQuestionIds: ['Q02'],
          },
        ],
      },
      {
        id: 'getting-close',
        heading: '가까워지는 방식',
        paragraphs: [
          {
            text: '복잡한 식당보다 한적한 강변이나 나무 그늘 아래 벤치에서 커피를 테이크아웃해 나누어 마시는 소박한 시간을 선호해요. 곁에 머무는 것만으로도 편안한 침묵이 어색하지 않은 관계가 좋아요.',
            sourceQuestionIds: ['Q05'],
          },
          {
            text: '처음에는 조금 관찰하는 시간이 필요하지만, 마음을 열면 깊은 신뢰와 든든한 지지를 아끼지 않는 편입니다.',
            sourceQuestionIds: ['Q06', 'Q09'],
          },
        ],
      },
      {
        id: 'cherished-values',
        heading: '함께 지키고 싶은 것',
        paragraphs: [
          {
            text: '관계 안에서 각자의 보폭을 인정해 주는 것이 가장 소중해요. 서로 닮아갈 것을 강요하기보다 서로의 차이를 흥미롭게 바라보며 나란히 걸어갈 수 있기를 바라요.',
            sourceQuestionIds: ['Q07'],
          },
          {
            text: '자신의 감정을 건강하게 마주할 줄 알고, 일상의 솔직한 이야기를 담담하게 나눌 수 있는 사람과 알아가고 싶어요.',
            sourceQuestionIds: ['Q08'],
          },
        ],
      },
    ],
  },
  {
    schemaVersion: 2,
    publicBookId: 'book-type-addict',
    cohortId: 'event-2026-10-seoul-forest',
    authorUid: 'user-type-addict',
    version: 1,
    status: 'PUBLISHED',
    authorApprovedAt: '2026-10-24T13:00:00Z',
    authorFontPreset: 'maruburi',
    isExampleBook: true,
    metadata: {
      nickname: '활자중독',
      oneLineTitle: '사람의 온도가 묻어나는 문장들',
      spineTitle: '사람의 온도',
      region: '서울 종로구',
      ageBracket: '30대 초반 (1992년생)',
      gender: '남성',
      coverTheme: 'olive',
    },
    chapters: [
      {
        id: 'daily-life',
        heading: '내가 좋아하는 하루',
        paragraphs: [
          {
            text: '토요일 오후엔 정독도서관이나 동네 독립서점에 들러 마음에 와닿는 문장이 있는 책을 골라요. 종이 냄새를 맡으며 활자 속에 푹 빠져 있을 때 가장 나다워지는 것 같아요.',
            sourceQuestionIds: ['Q04'],
          },
          {
            text: '요즘은 김연수 작가의 산문집을 다시 읽고 있어요. 사람을 향한 다정한 문체와 따뜻한 유머가 마음에 긴 여운을 남겨요.',
            sourceQuestionIds: ['Q02'],
          },
        ],
      },
      {
        id: 'getting-close',
        heading: '가까워지는 방식',
        paragraphs: [
          {
            text: '누군가와 만난다면 서로 최근 감명 깊게 읽은 책의 구절이나 좋아하는 음악 한 곡을 나누는 대화를 해보고 싶어요. 상대의 눈빛과 생각을 온전히 마주하는 시간이 의미 있어요.',
            sourceQuestionIds: ['Q05'],
          },
          {
            text: '이야기를 경청하고 진심으로 호응해 주는 편이에요. 빠르게 가까워지기보다 서서히 물들어가는 자연스러운 만남을 선호합니다.',
            sourceQuestionIds: ['Q06'],
          },
        ],
      },
      {
        id: 'cherished-values',
        heading: '함께 지키고 싶은 것',
        paragraphs: [
          {
            text: '서로를 향한 따뜻한 존중과 정직한 소통이에요. 힘든 날에는 기대어 쉴 수 있는 쉼표 같은 존재가 되어주고 싶어요.',
            sourceQuestionIds: ['Q07'],
          },
          {
            text: '글이나 대화에서 전해지는 따스함을 소중히 여기고, 타인의 아픔에 공감할 줄 아는 성숙한 분과 알아가고 싶어요.',
            sourceQuestionIds: ['Q08'],
          },
        ],
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// Seeded Participant Private Info
// -----------------------------------------------------------------------------
export const INITIAL_PARTICIPANT_INFOS: Record<string, ParticipantPrivateInfo> = {
  'user-slow-afternoon': {
    uid: 'user-slow-afternoon',
    nickname: '느린오후',
    birthYear: 1993,
    gender: '여성',
    activityRegion: '서울 성동구',
    adultSelfConfirmed: true,
    isSingleConfirmed: true,
    phoneNumber: '010-3841-8821',
    preferredDates: ['2026-10-31', '2026-11-01'],
    primaryPreferredDate: '2026-10-31',
    preferredAgeBracket: '1989~1995년생 선호',
    inflowChannel: '인스타그램 지인 추천',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-여-1',
    applicationStatus: 'CONFIRMED',
    ageCheckStatus: 'SELF_ATTESTED',
    updatedAt: '2026-10-24T10:00:00Z',
  },
  'user-alley-explorer': {
    uid: 'user-alley-explorer',
    nickname: '골목탐험',
    birthYear: 1991,
    gender: '남성',
    activityRegion: '서울 마포구',
    adultSelfConfirmed: true,
    isSingleConfirmed: true,
    phoneNumber: '010-9271-4190',
    preferredDates: ['2026-10-31'],
    primaryPreferredDate: '2026-10-31',
    preferredAgeBracket: '무관',
    inflowChannel: '독서모임 커뮤니티',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-남-1',
    applicationStatus: 'CONFIRMED',
    ageCheckStatus: 'SELF_ATTESTED',
    updatedAt: '2026-10-24T11:00:00Z',
  },
  'user-dawn-walk': {
    uid: 'user-dawn-walk',
    nickname: '새벽산책',
    birthYear: 1995,
    gender: '여성',
    activityRegion: '서울 용산구',
    adultSelfConfirmed: true,
    isSingleConfirmed: true,
    phoneNumber: '010-5112-9014',
    preferredDates: ['2026-10-31'],
    primaryPreferredDate: '2026-10-31',
    preferredAgeBracket: '1990~1996년생 선호',
    inflowChannel: '검색',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-여-2',
    applicationStatus: 'CONFIRMED',
    ageCheckStatus: 'SELF_ATTESTED',
    updatedAt: '2026-10-24T12:00:00Z',
  },
  'user-type-addict': {
    uid: 'user-type-addict',
    nickname: '활자중독',
    birthYear: 1992,
    gender: '남성',
    activityRegion: '서울 종로구',
    adultSelfConfirmed: true,
    isSingleConfirmed: true,
    phoneNumber: '010-8841-3329',
    preferredDates: ['2026-10-31', '2026-11-01'],
    primaryPreferredDate: '2026-10-31',
    preferredAgeBracket: '무관',
    inflowChannel: '지인 소개',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-남-2',
    applicationStatus: 'CONFIRMED',
    ageCheckStatus: 'SELF_ATTESTED',
    updatedAt: '2026-10-24T13:00:00Z',
  },
};

// -----------------------------------------------------------------------------
// Seeded Questionnaire Responses
// -----------------------------------------------------------------------------
export const INITIAL_QUESTIONNAIRE_RESPONSES: Record<string, QuestionnaireResponse> = {
  'user-slow-afternoon': {
    ownerUid: 'user-slow-afternoon',
    questionnaireVersion: 'walk-values-v1',
    answersRevision: 2,
    lastSavedAt: '2026-10-24T10:15:00Z',
    answers: {
      Q01: '안녕하세요. 주말에는 조용히 걷거나 작은 숲길을 둘러보는 시간을 좋아해요.',
      Q02: '영화 <리틀 포레스트>요. 큰 사건보다 밥을 짓고 계절의 온도를 마주하는 모습이 오래 남았어요.',
      Q03: '가사 없는 재즈 트리오나 루시드폴의 담담한 노래를 자주 들어요.',
      Q04: '아침에 일어나서 드립 커피를 내리고, 낮에는 햇볕이 잘 드는 공원 벤치에서 책을 읽다 돌아오고 싶어요.',
      Q05: '각자 좋아하는 동네 골목이나 작은 헌책방을 천천히 산책하고, 조용한 찻집에서 따뜻한 차를 마시는 데이트요.',
      Q06: '말이 앞서기보다 상대방의 하루를 먼저 묵묵히 들어주고, 작은 배려를 챙겨주는 편이에요.',
      Q07: '서로의 일상과 혼자만의 시간을 존중하는 것, 그리고 서운한 점이 생겼을 때 바로 단정 짓지 않고 대화로 푸는 태도요.',
      Q08: '사소한 일상에도 따뜻한 눈길을 둘 줄 알고, 솔직하면서도 다정한 태도로 대화할 수 있는 사람과 알아가고 싶어요.',
      Q09: '처음에는 조금 낯을 가려서 조용해 보일 수 있지만, 편안해지면 이야기를 잘 들어요. 재촉하거나 서두르지 않는 속도가 편해요.',
    },
  },
};

// -----------------------------------------------------------------------------
// Seeded Submitted Booklets (Immutable Snapshot for Operator & Printing)
// -----------------------------------------------------------------------------
export const INITIAL_SUBMITTED_BOOKLETS: Record<string, SubmittedBooklet> = {
  'user-slow-afternoon': {
    id: 'sub-slow-afternoon-v1',
    uid: 'user-slow-afternoon',
    version: 1,
    nickname: '느린오후',
    ageBracket: '30대 초반 (1993년생)',
    gender: '여성',
    title: '평범한 토요일을 나누는 법',
    intro: '안녕하세요. 일상의 작은 계절과 온도를 소중히 여기는 느린오후입니다.',
    chapters: INITIAL_BOOKLETS[0].chapters,
    authorFontPreset: 'maruburi',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-여-1',
    operatorApproved: true,
    operatorApprovedAt: '2026-10-24T14:00:00Z',
    operatorComment: '서울숲 토요일 14:00 세션 인쇄 대상 승인 완료',
    submittedAt: '2026-10-24T10:30:00Z',
    consentSnapshot: {
      rotationNoticeAcknowledged: true,
      termsVersion: '2026-10-25',
      timestamp: '2026-10-24T10:30:00Z',
    },
  },
  'user-alley-explorer': {
    id: 'sub-alley-explorer-v1',
    uid: 'user-alley-explorer',
    version: 1,
    nickname: '골목탐험',
    ageBracket: '30대 중반 (1991년생)',
    gender: '남성',
    title: '익숙한 길 밖으로 발걸음을 옮길 때',
    intro: '새로운 골목과 오래된 빵집을 좋아하는 골목탐험입니다.',
    chapters: INITIAL_BOOKLETS[1].chapters,
    authorFontPreset: 'gowun',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-남-1',
    operatorApproved: true,
    operatorApprovedAt: '2026-10-24T14:10:00Z',
    submittedAt: '2026-10-24T11:15:00Z',
    consentSnapshot: {
      rotationNoticeAcknowledged: true,
      termsVersion: '2026-10-25',
      timestamp: '2026-10-24T11:15:00Z',
    },
  },
  'user-dawn-walk': {
    id: 'sub-dawn-walk-v1',
    uid: 'user-dawn-walk',
    version: 1,
    nickname: '새벽산책',
    ageBracket: '20대 후반 (1995년생)',
    gender: '여성',
    title: '계절의 냄새를 온전히 마주하기',
    intro: '맑은 아침 공기와 나직한 책 읽기를 좋아하는 새벽산책입니다.',
    chapters: INITIAL_BOOKLETS[2].chapters,
    authorFontPreset: 'pretendard',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-여-2',
    operatorApproved: true,
    operatorApprovedAt: '2026-10-24T14:20:00Z',
    submittedAt: '2026-10-24T12:20:00Z',
    consentSnapshot: {
      rotationNoticeAcknowledged: true,
      termsVersion: '2026-10-25',
      timestamp: '2026-10-24T12:20:00Z',
    },
  },
  'user-type-addict': {
    id: 'sub-type-addict-v1',
    uid: 'user-type-addict',
    version: 1,
    nickname: '활자중독',
    ageBracket: '30대 초반 (1992년생)',
    gender: '남성',
    title: '사람의 온도가 묻어나는 문장들',
    intro: '좋은 글과 사려 깊은 대화를 나누고 싶은 활자중독입니다.',
    chapters: INITIAL_BOOKLETS[3].chapters,
    authorFontPreset: 'maruburi',
    assignedSessionId: 'session-2026-10-31',
    participantNumber: '토-남-2',
    operatorApproved: true,
    operatorApprovedAt: '2026-10-24T14:30:00Z',
    submittedAt: '2026-10-24T13:20:00Z',
    consentSnapshot: {
      rotationNoticeAcknowledged: true,
      termsVersion: '2026-10-25',
      timestamp: '2026-10-24T13:20:00Z',
    },
  },
};

// -----------------------------------------------------------------------------
// Legacy Cohort Stub (For backward compatibility)
// -----------------------------------------------------------------------------
export const INITIAL_COHORT: Cohort = {
  id: 'event-2026-10-seoul-forest',
  cohortNumber: 1,
  title: '2026 가을 서울숲 산책 4:4 로테이션',
  region: '서울 성동구 서울숲',
  meetingModes: ['SOCIAL_4'],
  startDate: '2026-10-31',
  endDate: '2026-11-01',
  status: 'ACTIVE',
  accessWindow: '2026년 10월 31일(토) & 11월 1일(일) 14:00~16:40',
  maxParticipants: 16,
  approvedCount: 8,
};

export const INITIAL_NOTIFICATIONS: NotificationOutboxItem[] = [
  {
    id: 'notif-1',
    eventKey: 'APPLICATION_SUBMITTED',
    recipientUid: 'user-slow-afternoon',
    channel: 'IN_APP',
    title: '서울숲 산책 참가 신청이 접수되었습니다',
    body: '가치관 질문에 답변하고 책자 초안을 작성해 보세요. 마감은 10/29 20:00입니다.',
    createdAt: '2026-10-24T10:00:00Z',
    status: 'SENT',
    read: true,
  },
  {
    id: 'notif-2',
    eventKey: 'BOOKLET_APPROVED',
    recipientUid: 'user-slow-afternoon',
    channel: 'IN_APP',
    title: '소개 책자가 운영자 인쇄 승인되었습니다',
    body: '10/31(토) 13:45 서울숲 체크인입니다. 당일 배정된 대화 상대 네 분에게 책자가 전달됩니다.',
    createdAt: '2026-10-24T14:00:00Z',
    status: 'SENT',
    read: false,
  },
];
