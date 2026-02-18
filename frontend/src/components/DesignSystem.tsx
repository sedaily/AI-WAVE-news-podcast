import { useState } from 'react';
import './DesignSystem.css';

type TabType = 'journey' | 'onboarding' | 'core' | 'retention';

function DesignSystem() {
  const [activeTab, setActiveTab] = useState<TabType>('journey');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  return (
    <div className="design-system">
      {/* Header */}
      <header className="ds-header">
        <div className="ds-header-content">
          <div className="ds-logo">
            <div className="ds-logo-icon" />
            <div>
              <h1>뉴스캐스트</h1>
              <p>UI/UX 디자인 시스템</p>
            </div>
          </div>
        </div>
        <a href="/" className="ds-back-btn">서비스로 돌아가기</a>
      </header>

      {/* Tab Navigation */}
      <nav className="ds-tabs">
        {[
          { id: 'journey', label: '사용자 여정' },
          { id: 'onboarding', label: '온보딩' },
          { id: 'core', label: '핵심 경험' },
          { id: 'retention', label: '리텐션' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`ds-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="ds-content">

        {/* ===== 사용자 여정 맵 ===== */}
        {activeTab === 'journey' && (
          <div className="ds-section">
            <div className="ds-section-header">
              <span className="ds-section-number">01</span>
              <h2>사용자 여정 맵</h2>
              <p>첫 방문부터 충성 사용자까지의 경험 설계</p>
            </div>

            {/* Journey Flow */}
            <div className="ds-journey-flow">
              {/* Stage 1: 발견 */}
              <div className="ds-journey-stage">
                <div className="stage-header">
                  <span className="stage-num">1</span>
                  <h3>발견</h3>
                </div>
                <div className="stage-content">
                  <div className="stage-touchpoint">
                    <span className="touchpoint-label">터치포인트</span>
                    <p>앱스토어, 소셜 공유, 검색</p>
                  </div>
                  <div className="stage-emotion">
                    <span className="emotion-label">사용자 심리</span>
                    <p>"경제 뉴스 쉽게 듣고 싶다"</p>
                  </div>
                  <div className="stage-action">
                    <span className="action-label">액션</span>
                    <p>앱 설치</p>
                  </div>
                </div>
              </div>

              <div className="journey-arrow" />

              {/* Stage 2: 온보딩 */}
              <div className="ds-journey-stage highlight">
                <div className="stage-header">
                  <span className="stage-num">2</span>
                  <h3>온보딩</h3>
                </div>
                <div className="stage-content">
                  <div className="stage-touchpoint">
                    <span className="touchpoint-label">터치포인트</span>
                    <p>웰컴 화면, 관심사 선택</p>
                  </div>
                  <div className="stage-emotion">
                    <span className="emotion-label">사용자 심리</span>
                    <p>"나한테 맞는 뉴스가 올까?"</p>
                  </div>
                  <div className="stage-action">
                    <span className="action-label">액션</span>
                    <p>관심 분야 3개 선택</p>
                  </div>
                </div>
                <div className="stage-metric">
                  <span>목표: 완료율 80%</span>
                </div>
              </div>

              <div className="journey-arrow" />

              {/* Stage 3: 첫 경험 */}
              <div className="ds-journey-stage highlight">
                <div className="stage-header">
                  <span className="stage-num">3</span>
                  <h3>첫 경험</h3>
                </div>
                <div className="stage-content">
                  <div className="stage-touchpoint">
                    <span className="touchpoint-label">터치포인트</span>
                    <p>홈 화면, 첫 번째 뉴스</p>
                  </div>
                  <div className="stage-emotion">
                    <span className="emotion-label">사용자 심리</span>
                    <p>"오, 진짜 쉽게 설명해주네"</p>
                  </div>
                  <div className="stage-action">
                    <span className="action-label">액션</span>
                    <p>첫 뉴스 끝까지 청취</p>
                  </div>
                </div>
                <div className="stage-metric">
                  <span>목표: 완료율 70%</span>
                </div>
              </div>

              <div className="journey-arrow" />

              {/* Stage 4: 습관 형성 */}
              <div className="ds-journey-stage">
                <div className="stage-header">
                  <span className="stage-num">4</span>
                  <h3>습관 형성</h3>
                </div>
                <div className="stage-content">
                  <div className="stage-touchpoint">
                    <span className="touchpoint-label">터치포인트</span>
                    <p>푸시 알림, 스트릭</p>
                  </div>
                  <div className="stage-emotion">
                    <span className="emotion-label">사용자 심리</span>
                    <p>"출근길에 꼭 들어야지"</p>
                  </div>
                  <div className="stage-action">
                    <span className="action-label">액션</span>
                    <p>3일 연속 방문</p>
                  </div>
                </div>
                <div className="stage-metric">
                  <span>목표: D3 리텐션 40%</span>
                </div>
              </div>

              <div className="journey-arrow" />

              {/* Stage 5: 충성 */}
              <div className="ds-journey-stage">
                <div className="stage-header">
                  <span className="stage-num">5</span>
                  <h3>충성 사용자</h3>
                </div>
                <div className="stage-content">
                  <div className="stage-touchpoint">
                    <span className="touchpoint-label">터치포인트</span>
                    <p>배지, 통계, 공유</p>
                  </div>
                  <div className="stage-emotion">
                    <span className="emotion-label">사용자 심리</span>
                    <p>"이제 경제 뉴스 놓치지 않아"</p>
                  </div>
                  <div className="stage-action">
                    <span className="action-label">액션</span>
                    <p>주 5회 이상 사용, 공유</p>
                  </div>
                </div>
                <div className="stage-metric">
                  <span>목표: WAU 60%</span>
                </div>
              </div>
            </div>

            {/* Pain Points */}
            <div className="ds-subsection">
              <h3>이탈 위험 구간 & 해결책</h3>
              <div className="ds-pain-points">
                <div className="pain-point">
                  <div className="pain-header">
                    <span className="pain-stage">온보딩</span>
                    <span className="pain-risk high">높음</span>
                  </div>
                  <p className="pain-desc">"관심사 선택이 귀찮아"</p>
                  <div className="pain-solution">
                    <span className="solution-label">해결책</span>
                    <p>3개만 선택, 스킵 가능, 나중에 변경 안내</p>
                  </div>
                </div>

                <div className="pain-point">
                  <div className="pain-header">
                    <span className="pain-stage">첫 경험</span>
                    <span className="pain-risk high">높음</span>
                  </div>
                  <p className="pain-desc">"뉴스가 너무 길어"</p>
                  <div className="pain-solution">
                    <span className="solution-label">해결책</span>
                    <p>2~3분 요약본 제공, 배속 기능 안내</p>
                  </div>
                </div>

                <div className="pain-point">
                  <div className="pain-header">
                    <span className="pain-stage">습관 형성</span>
                    <span className="pain-risk medium">중간</span>
                  </div>
                  <p className="pain-desc">"앱 켜는 걸 잊어버려"</p>
                  <div className="pain-solution">
                    <span className="solution-label">해결책</span>
                    <p>아침 푸시 알림, 위젯, 스트릭 동기부여</p>
                  </div>
                </div>

                <div className="pain-point">
                  <div className="pain-header">
                    <span className="pain-stage">장기 사용</span>
                    <span className="pain-risk low">낮음</span>
                  </div>
                  <p className="pain-desc">"비슷한 뉴스만 나와"</p>
                  <div className="pain-solution">
                    <span className="solution-label">해결책</span>
                    <p>새 카테고리 추천, 퀴즈로 다양성</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 온보딩 ===== */}
        {activeTab === 'onboarding' && (
          <div className="ds-section">
            <div className="ds-section-header">
              <span className="ds-section-number">02</span>
              <h2>온보딩 플로우</h2>
              <p>첫 인상을 결정하는 3단계</p>
            </div>

            {/* Onboarding Steps */}
            <div className="ds-onboarding-flow">
              <div className="onboarding-progress">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`progress-step ${onboardingStep >= step ? 'active' : ''} ${onboardingStep === step ? 'current' : ''}`}
                    onClick={() => setOnboardingStep(step)}
                  >
                    <span className="step-dot" />
                    <span className="step-label">
                      {step === 1 ? '환영' : step === 2 ? '관심사' : '완료'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="onboarding-device">
                <div className="device-frame">
                  <div className="device-notch" />
                  <div className="device-screen">
                    {/* Step 1: Welcome */}
                    {onboardingStep === 1 && (
                      <div className="onboarding-screen welcome">
                        <div className="welcome-visual">
                          <div className="welcome-icon" />
                          <div className="welcome-waves">
                            <span /><span /><span />
                          </div>
                        </div>
                        <h2>경제 뉴스,<br />들으면서 출근해요</h2>
                        <p>매일 아침 5분,<br />꼭 알아야 할 경제 이슈를 쉽게</p>
                        <div className="onboarding-features">
                          <div className="feature-item">
                            <span className="feature-icon">◉</span>
                            <span>AI가 쉽게 설명</span>
                          </div>
                          <div className="feature-item">
                            <span className="feature-icon">◉</span>
                            <span>매일 5개 핵심 뉴스</span>
                          </div>
                          <div className="feature-item">
                            <span className="feature-icon">◉</span>
                            <span>3분 요약 브리핑</span>
                          </div>
                        </div>
                        <button className="onboarding-btn primary" onClick={() => setOnboardingStep(2)}>
                          시작하기
                        </button>
                      </div>
                    )}

                    {/* Step 2: Interest Selection */}
                    {onboardingStep === 2 && (
                      <div className="onboarding-screen interests">
                        <div className="interests-header">
                          <h2>관심 분야를 알려주세요</h2>
                          <p>선택한 주제를 우선으로 들려드려요</p>
                        </div>
                        <div className="interests-grid">
                          {[
                            { id: 'stock', name: '주식·증시', selected: true },
                            { id: 'real-estate', name: '부동산', selected: true },
                            { id: 'tech', name: '반도체·IT', selected: true },
                            { id: 'finance', name: '금융·은행', selected: false },
                            { id: 'global', name: '글로벌·환율', selected: false },
                            { id: 'policy', name: '정책·제도', selected: false },
                          ].map(item => (
                            <div key={item.id} className={`interest-chip ${item.selected ? 'selected' : ''}`}>
                              <span className="chip-check">{item.selected ? '✓' : '+'}</span>
                              <span>{item.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="interests-footer">
                          <span className="selection-count">3개 선택됨</span>
                          <span className="selection-hint">나중에 변경할 수 있어요</span>
                        </div>
                        <div className="onboarding-actions">
                          <button className="onboarding-btn secondary" onClick={() => setOnboardingStep(3)}>
                            건너뛰기
                          </button>
                          <button className="onboarding-btn primary" onClick={() => setOnboardingStep(3)}>
                            다음
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Complete */}
                    {onboardingStep === 3 && (
                      <div className="onboarding-screen complete">
                        <div className="complete-visual">
                          <div className="complete-check">✓</div>
                          <div className="complete-sparkles">
                            <span /><span /><span /><span />
                          </div>
                        </div>
                        <h2>준비 완료!</h2>
                        <p>맞춤 뉴스가 준비되었어요</p>
                        <div className="complete-preview">
                          <span className="preview-label">오늘의 첫 번째 뉴스</span>
                          <div className="preview-card">
                            <div className="preview-tag">반도체·IT</div>
                            <h4>삼성전자 HBM3E 양산 본격화</h4>
                            <span className="preview-duration">2분 30초</span>
                          </div>
                        </div>
                        <button className="onboarding-btn primary large">
                          첫 뉴스 듣기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Design Principles */}
            <div className="ds-subsection">
              <h3>온보딩 설계 원칙</h3>
              <div className="ds-principles">
                <div className="principle-card">
                  <span className="principle-num">01</span>
                  <h4>3단계 이내</h4>
                  <p>복잡한 설정 없이 빠르게 서비스 경험</p>
                </div>
                <div className="principle-card">
                  <span className="principle-num">02</span>
                  <h4>스킵 가능</h4>
                  <p>모든 단계는 건너뛸 수 있어야 함</p>
                </div>
                <div className="principle-card">
                  <span className="principle-num">03</span>
                  <h4>즉시 가치 전달</h4>
                  <p>온보딩 완료 직후 첫 콘텐츠로 연결</p>
                </div>
                <div className="principle-card">
                  <span className="principle-num">04</span>
                  <h4>부담 최소화</h4>
                  <p>"나중에 변경 가능" 명시로 선택 부담 감소</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 핵심 경험 ===== */}
        {activeTab === 'core' && (
          <div className="ds-section">
            <div className="ds-section-header">
              <span className="ds-section-number">03</span>
              <h2>핵심 경험</h2>
              <p>매일 사용하는 플레이어와 홈 화면</p>
            </div>

            {/* Player Design */}
            <div className="ds-core-grid">
              <div className="ds-card">
                <div className="card-header">
                  <h3>플레이어</h3>
                  <span className="card-badge">핵심</span>
                </div>
                <div className="ds-player-mockup">
                  <div className="player-artwork">
                    <div className="artwork-bg" />
                    <div className="artwork-icon" />
                  </div>
                  <div className="player-meta">
                    <span className="meta-tag">반도체·IT</span>
                    <h4>삼성전자 HBM3E 양산</h4>
                  </div>
                  <div className="player-progress">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '35%' }} />
                      <div className="progress-thumb" style={{ left: '35%' }} />
                    </div>
                    <div className="progress-times">
                      <span>1:23</span>
                      <span>3:45</span>
                    </div>
                  </div>
                  <div className="player-controls">
                    <button className="ctrl-btn">-10</button>
                    <button className="ctrl-btn play" />
                    <button className="ctrl-btn">+10</button>
                  </div>
                  <div className="player-speed">
                    {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                        onClick={() => setPlaybackSpeed(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                  <div className="player-actions">
                    <button className="action-btn">
                      <span className="action-icon bookmark" />
                      <span>저장</span>
                    </button>
                    <button className="action-btn">
                      <span className="action-icon timer" />
                      <span>타이머</span>
                    </button>
                    <button className="action-btn">
                      <span className="action-icon share" />
                      <span>공유</span>
                    </button>
                    <button className="action-btn">
                      <span className="action-icon script" />
                      <span>스크립트</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="ds-card">
                <div className="card-header">
                  <h3>홈 화면</h3>
                  <span className="card-badge">일상</span>
                </div>
                <div className="ds-home-mockup">
                  <div className="home-quick">
                    <div className="quick-main">
                      <div className="quick-icon play" />
                      <div className="quick-text">
                        <span className="quick-title">오늘의 브리핑</span>
                        <span className="quick-desc">5개 뉴스 · 12분</span>
                      </div>
                    </div>
                    <div className="quick-sub">
                      <div className="quick-card">
                        <div className="quick-icon chat" />
                        <span>AI 질문</span>
                      </div>
                      <div className="quick-card">
                        <div className="quick-icon quiz" />
                        <span>퀴즈</span>
                      </div>
                    </div>
                  </div>
                  <div className="home-section">
                    <div className="section-header">
                      <span>맞춤 추천</span>
                      <span className="section-ai">AI</span>
                    </div>
                    <div className="news-list">
                      <div className="news-item priority">
                        <div className="news-tag">반도체</div>
                        <span className="news-title">TSMC 실적 서프라이즈</span>
                        <span className="news-time">3:20</span>
                      </div>
                      <div className="news-item">
                        <div className="news-tag">부동산</div>
                        <span className="news-title">서울 아파트 거래량 변화</span>
                        <span className="news-time">2:45</span>
                      </div>
                    </div>
                  </div>
                  <div className="home-bubbles">
                    <span className="bubble lg">반도체</span>
                    <span className="bubble md">환율</span>
                    <span className="bubble md">금리</span>
                    <span className="bubble sm">증시</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Player */}
            <div className="ds-subsection">
              <h3>미니 플레이어</h3>
              <p>홈 화면에서 계속 재생 중일 때</p>
              <div className="ds-mini-player">
                <div className="mini-artwork" />
                <div className="mini-info">
                  <span className="mini-title">삼성전자 HBM3E 양산</span>
                  <div className="mini-progress">
                    <div className="mini-fill" style={{ width: '35%' }} />
                  </div>
                </div>
                <div className="mini-controls">
                  <button className="mini-btn pause" />
                  <button className="mini-btn next" />
                </div>
              </div>
            </div>

            {/* Empty & Error States */}
            <div className="ds-subsection">
              <h3>빈 상태 & 에러</h3>
              <div className="ds-states-grid">
                <div className="state-card">
                  <div className="state-visual empty" />
                  <h4>뉴스 없음</h4>
                  <p>오늘의 뉴스가 아직 준비 중이에요</p>
                  <button className="state-btn">새로고침</button>
                </div>
                <div className="state-card">
                  <div className="state-visual offline" />
                  <h4>오프라인</h4>
                  <p>인터넷 연결을 확인해주세요</p>
                  <button className="state-btn">다시 시도</button>
                </div>
                <div className="state-card">
                  <div className="state-visual error" />
                  <h4>오류 발생</h4>
                  <p>잠시 후 다시 시도해주세요</p>
                  <button className="state-btn">문의하기</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 리텐션 ===== */}
        {activeTab === 'retention' && (
          <div className="ds-section">
            <div className="ds-section-header">
              <span className="ds-section-number">04</span>
              <h2>리텐션 전략</h2>
              <p>사용자가 매일 돌아오게 만드는 장치</p>
            </div>

            {/* Retention Mechanics */}
            <div className="ds-retention-grid">
              {/* Streak */}
              <div className="ds-card">
                <div className="card-header">
                  <h3>청취 스트릭</h3>
                  <span className="card-badge">습관</span>
                </div>
                <div className="streak-demo">
                  <div className="streak-week">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                      <div key={day} className={`streak-day ${i < 5 ? 'done' : ''}`}>
                        <span className="day-label">{day}</span>
                        <span className="day-check">{i < 5 ? '✓' : ''}</span>
                      </div>
                    ))}
                  </div>
                  <div className="streak-message">
                    <span className="streak-fire" />
                    <span>5일 연속 청취 중!</span>
                  </div>
                  <p className="streak-motivation">주말에도 함께하면 7일 배지를 받아요</p>
                </div>
              </div>

              {/* Badges */}
              <div className="ds-card">
                <div className="card-header">
                  <h3>배지 시스템</h3>
                  <span className="card-badge">성취</span>
                </div>
                <div className="badges-grid">
                  <div className="badge-item earned">
                    <div className="badge-icon first" />
                    <span className="badge-name">첫 청취</span>
                  </div>
                  <div className="badge-item earned">
                    <div className="badge-icon streak3" />
                    <span className="badge-name">3일 연속</span>
                  </div>
                  <div className="badge-item earned">
                    <div className="badge-icon listen10" />
                    <span className="badge-name">10회 청취</span>
                  </div>
                  <div className="badge-item locked">
                    <div className="badge-icon streak7" />
                    <span className="badge-name">7일 연속</span>
                    <span className="badge-progress">2일 남음</span>
                  </div>
                  <div className="badge-item locked">
                    <div className="badge-icon speed" />
                    <span className="badge-name">스피드 마스터</span>
                    <span className="badge-progress">배속 1시간</span>
                  </div>
                  <div className="badge-item locked">
                    <div className="badge-icon quiz" />
                    <span className="badge-name">퀴즈왕</span>
                    <span className="badge-progress">만점 5회</span>
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="ds-card wide">
                <div className="card-header">
                  <h3>푸시 알림</h3>
                  <span className="card-badge">리마인드</span>
                </div>
                <div className="push-examples">
                  <div className="push-card morning">
                    <div className="push-header">
                      <span className="push-app">뉴스캐스트</span>
                      <span className="push-time">오전 7:30</span>
                    </div>
                    <div className="push-content">
                      <strong>좋은 아침이에요!</strong>
                      <p>오늘의 경제 브리핑이 준비됐어요. 출근길에 들어보세요.</p>
                    </div>
                  </div>
                  <div className="push-card streak">
                    <div className="push-header">
                      <span className="push-app">뉴스캐스트</span>
                      <span className="push-time">오후 8:00</span>
                    </div>
                    <div className="push-content">
                      <strong>4일 스트릭 유지 중!</strong>
                      <p>오늘 하루만 더 들으면 5일 배지를 받아요.</p>
                    </div>
                  </div>
                  <div className="push-card breaking">
                    <div className="push-header">
                      <span className="push-app">뉴스캐스트</span>
                      <span className="push-time">오후 2:15</span>
                    </div>
                    <div className="push-content">
                      <strong>속보: 한국은행 기준금리 동결</strong>
                      <p>관심 키워드 "금리"에 새 뉴스가 올라왔어요.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Stats */}
              <div className="ds-card">
                <div className="card-header">
                  <h3>주간 리포트</h3>
                  <span className="card-badge">통계</span>
                </div>
                <div className="weekly-stats">
                  <div className="stat-row">
                    <span className="stat-label">총 청취 시간</span>
                    <span className="stat-value">2시간 34분</span>
                  </div>
                  <div className="stat-row highlight">
                    <span className="stat-label">배속으로 절약</span>
                    <span className="stat-value accent">45분</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">청취한 뉴스</span>
                    <span className="stat-value">12개</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">평균 완료율</span>
                    <span className="stat-value">85%</span>
                  </div>
                </div>
              </div>

              {/* Re-engagement */}
              <div className="ds-card">
                <div className="card-header">
                  <h3>이탈 방지</h3>
                  <span className="card-badge">복귀</span>
                </div>
                <div className="reengagement">
                  <div className="reengage-scenario">
                    <span className="scenario-label">3일 미접속 시</span>
                    <div className="scenario-push">
                      <strong>요즘 바쁘셨죠?</strong>
                      <p>놓친 주요 뉴스 3개를 2분 요약으로 준비했어요.</p>
                    </div>
                  </div>
                  <div className="reengage-scenario">
                    <span className="scenario-label">7일 미접속 시</span>
                    <div className="scenario-push">
                      <strong>다시 만나서 반가워요!</strong>
                      <p>이번 주 핵심 뉴스 베스트 5를 들어보세요.</p>
                    </div>
                  </div>
                  <div className="reengage-scenario">
                    <span className="scenario-label">스트릭 끊김</span>
                    <div className="scenario-push">
                      <strong>아쉽게 스트릭이 끊겼어요</strong>
                      <p>괜찮아요, 오늘부터 다시 시작해봐요!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="ds-footer">
        <p>뉴스캐스트 디자인 시스템 v2.0</p>
      </footer>
    </div>
  );
}

export default DesignSystem;
