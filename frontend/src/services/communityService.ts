// 커뮤니티 서비스 - 사용자 감상평 관리

export interface UserProfile {
  id: string;
  displayName: string;
  avatar: string;  // 프로필 이미지 URL 또는 이니셜
  avatarColor: string;
}

export interface SharedThought {
  id: string;
  user: UserProfile;
  podcastKeyword: string;
  podcastDate: string;
  content: string;
  emoji?: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: number;
  listenedAt?: string;  // "2분 전", "오늘 오전" 등
}

// 샘플 프로필 이미지 (이니셜 기반)
const SAMPLE_AVATARS: UserProfile[] = [
  { id: 'user1', displayName: '경제덕후', avatar: '경', avatarColor: '#6b9b8e' },
  { id: 'user2', displayName: '주식초보', avatar: '주', avatarColor: '#8b7ba8' },
  { id: 'user3', displayName: '퇴근길청취자', avatar: '퇴', avatarColor: '#c08b7b' },
  { id: 'user4', displayName: '아침뉴스러버', avatar: '아', avatarColor: '#7ba3c0' },
  { id: 'user5', displayName: '재테크마스터', avatar: '재', avatarColor: '#9b8b6b' },
  { id: 'user6', displayName: '경제신문구독자', avatar: '신', avatarColor: '#7cb89d' },
  { id: 'user7', displayName: '투자입문자', avatar: '투', avatarColor: '#b87c9d' },
  { id: 'user8', displayName: '출근길리스너', avatar: '출', avatarColor: '#8ba3c0' },
];

// 샘플 감상평 데이터
const SAMPLE_THOUGHTS: Omit<SharedThought, 'id'>[] = [
  {
    user: SAMPLE_AVATARS[0],
    podcastKeyword: '삼성전자 로봇청소기',
    podcastDate: '2026-02-15',
    content: '중국 시장 진출이 쉽지 않을 텐데, 보안 강화로 차별화하려는 전략이 흥미롭네요. 과연 성공할 수 있을지 지켜봐야겠어요.',
    emoji: '🤔',
    likeCount: 12,
    isLiked: false,
    createdAt: Date.now() - 1000 * 60 * 30,
    listenedAt: '30분 전'
  },
  {
    user: SAMPLE_AVATARS[1],
    podcastKeyword: '미국 경제지표',
    podcastDate: '2026-02-15',
    content: '출근길에 들었는데 PCE 지수 설명이 쉬워서 좋았어요! 연준 금리 결정에 영향을 미친다는 게 이해됐습니다 👍',
    emoji: '📈',
    likeCount: 24,
    isLiked: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    listenedAt: '2시간 전'
  },
  {
    user: SAMPLE_AVATARS[2],
    podcastKeyword: 'BTS 부산 공연 숙박비',
    podcastDate: '2026-02-15',
    content: '7.5배 인상은 좀 심하네요... 팬들 입장에서는 부담이 크겠어요. 그래도 부산 관광산업 활성화에는 도움이 되겠죠?',
    emoji: '😮',
    likeCount: 31,
    isLiked: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    listenedAt: '4시간 전'
  },
  {
    user: SAMPLE_AVATARS[3],
    podcastKeyword: '채권시장',
    podcastDate: '2026-02-15',
    content: '약보합 전망이라니, 당분간은 큰 변동 없이 관망해야겠네요. 설 연휴 지나고 시장 분위기 지켜봐야겠습니다.',
    emoji: '📊',
    likeCount: 8,
    isLiked: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    listenedAt: '6시간 전'
  },
  {
    user: SAMPLE_AVATARS[4],
    podcastKeyword: '삼성 특허소송',
    podcastDate: '2026-02-15',
    content: 'ITC 결정이 산업 전체에 영향을 미칠 수 있다니 무섭네요. SK하이닉스 주식 좀 더 사둬야 하나... 🤔',
    emoji: '⚖️',
    likeCount: 15,
    isLiked: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    listenedAt: '8시간 전'
  },
  {
    user: SAMPLE_AVATARS[5],
    podcastKeyword: '미국 경제지표',
    podcastDate: '2026-02-15',
    content: '매일 아침 들으면서 경제 공부하고 있어요. 짧고 핵심만 전달해줘서 출근 전에 딱 좋아요!',
    emoji: '☕',
    likeCount: 42,
    isLiked: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    listenedAt: '오늘 오전'
  },
  {
    user: SAMPLE_AVATARS[6],
    podcastKeyword: '삼성전자 로봇청소기',
    podcastDate: '2026-02-15',
    content: '개인정보 보호 기능 강화가 중국 시장에서 어필할 수 있을지 궁금하네요. 중국 소비자들의 반응이 기대됩니다.',
    emoji: '🤖',
    likeCount: 9,
    isLiked: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    listenedAt: '어제'
  },
  {
    user: SAMPLE_AVATARS[7],
    podcastKeyword: 'BTS 부산 공연 숙박비',
    podcastDate: '2026-02-15',
    content: '숙박비 폭등은 어쩔 수 없는 것 같아요. 수요가 폭발하니까요. 그래도 팬들 화이팅! 💜',
    emoji: '💜',
    likeCount: 28,
    isLiked: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    listenedAt: '어제'
  },
];

const STORAGE_KEY = 'community_thoughts';
const LIKES_KEY = 'community_likes';

// 내 좋아요 목록 가져오기
function getMyLikes(): Set<string> {
  try {
    const data = localStorage.getItem(LIKES_KEY);
    if (!data) return new Set();
    return new Set(JSON.parse(data));
  } catch {
    return new Set();
  }
}

// 좋아요 저장
function saveMyLikes(likes: Set<string>): void {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]));
}

// 모든 감상평 가져오기 (샘플 + 내가 작성한 것)
export function getSharedThoughts(): SharedThought[] {
  const myLikes = getMyLikes();

  // 샘플 데이터에 좋아요 상태 적용
  const thoughts: SharedThought[] = SAMPLE_THOUGHTS.map((thought, index) => ({
    ...thought,
    id: `sample-${index}`,
    isLiked: myLikes.has(`sample-${index}`)
  }));

  // localStorage에서 사용자 작성 감상평 가져오기
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const userThoughts: SharedThought[] = JSON.parse(data);
      userThoughts.forEach(t => {
        t.isLiked = myLikes.has(t.id);
      });
      thoughts.unshift(...userThoughts);
    }
  } catch {
    // ignore
  }

  // 최신순 정렬
  return thoughts.sort((a, b) => b.createdAt - a.createdAt);
}

// 감상평 작성
export function addThought(
  podcastKeyword: string,
  podcastDate: string,
  content: string,
  emoji?: string
): SharedThought {
  const thoughts = getSharedThoughts().filter(t => !t.id.startsWith('sample-'));

  const newThought: SharedThought = {
    id: `user-${Date.now()}`,
    user: {
      id: 'me',
      displayName: '나',
      avatar: '나',
      avatarColor: '#6b9b8e'
    },
    podcastKeyword,
    podcastDate,
    content,
    emoji,
    likeCount: 0,
    isLiked: false,
    createdAt: Date.now(),
    listenedAt: '방금 전'
  };

  thoughts.unshift(newThought);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));

  return newThought;
}

// 좋아요 토글
export function toggleLike(thoughtId: string): boolean {
  const myLikes = getMyLikes();

  if (myLikes.has(thoughtId)) {
    myLikes.delete(thoughtId);
    saveMyLikes(myLikes);
    return false;
  } else {
    myLikes.add(thoughtId);
    saveMyLikes(myLikes);
    return true;
  }
}

// 감상평 삭제 (내가 작성한 것만)
export function deleteThought(thoughtId: string): void {
  if (!thoughtId.startsWith('user-')) return;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const thoughts: SharedThought[] = JSON.parse(data);
      const filtered = thoughts.filter(t => t.id !== thoughtId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }
}

// 특정 팟캐스트의 감상평만 가져오기
export function getThoughtsForPodcast(keyword: string, date: string): SharedThought[] {
  return getSharedThoughts().filter(
    t => t.podcastKeyword === keyword && t.podcastDate === date
  );
}

// 감상평 개수
export function getThoughtCount(): number {
  return getSharedThoughts().length;
}
