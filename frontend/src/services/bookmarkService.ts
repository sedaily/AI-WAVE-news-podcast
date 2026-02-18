// 북마크 서비스 - localStorage 기반

export interface BookmarkedPodcast {
  id: string;  // date-keyword 형태
  date: string;
  keyword: string;
  title: string;
  audioUrl: string;
  coverColor: string;
  duration: number;
  bookmarkedAt: number;
}

const STORAGE_KEY = 'podcast_bookmarks';

// 모든 북마크 가져오기
export function getBookmarks(): BookmarkedPodcast[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 북마크 추가
export function addBookmark(podcast: Omit<BookmarkedPodcast, 'bookmarkedAt'>): void {
  const bookmarks = getBookmarks();
  const exists = bookmarks.some(b => b.id === podcast.id);

  if (!exists) {
    bookmarks.unshift({
      ...podcast,
      bookmarkedAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
}

// 북마크 제거
export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// 북마크 토글
export function toggleBookmark(podcast: Omit<BookmarkedPodcast, 'bookmarkedAt'>): boolean {
  const isBookmarked = isBookmarkedPodcast(podcast.id);

  if (isBookmarked) {
    removeBookmark(podcast.id);
    return false;
  } else {
    addBookmark(podcast);
    return true;
  }
}

// 북마크 여부 확인
export function isBookmarkedPodcast(id: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === id);
}

// 북마크 개수
export function getBookmarkCount(): number {
  return getBookmarks().length;
}
