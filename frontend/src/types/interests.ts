// 관심 분야 카테고리 타입
export type InterestCategory =
  | 'stock'       // 증권/주식
  | 'realestate'  // 부동산
  | 'tech'        // IT/테크
  | 'global'      // 글로벌 경제
  | 'industry'    // 산업/기업
  | 'finance'     // 금융/은행
  | 'policy';     // 정책/규제

// 관심 분야 정보
export interface InterestInfo {
  id: InterestCategory;
  name: string;
  keywords: string[];  // 관련 키워드 목록 (매칭용)
  description: string;
}

// 사용자 관심사 설정
export interface UserInterests {
  categories: InterestCategory[];
  onboardingCompleted: boolean;
  completedAt: number | null;
  version: number;  // 스키마 버전 (마이그레이션용)
}
