// 앱 상태
let currentPodcast = null;
let isPlaying = false;
let currentTime = 0;
let progressInterval = null;
let audioElement = null;

// 드래그 상태
let isDragging = false;
let startY = 0;
let currentY = 0;
let playerStartY = 0;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderIssueMap();
    initProgressBarDrag();
    initAudio();
});

// 오디오 초기화
function initAudio() {
    audioElement = new Audio();
    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            currentTime = Math.floor(audioElement.currentTime);
            updateProgress();
        }
    });
    audioElement.addEventListener('ended', () => {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶';
    });
}

// 이슈맵 렌더링
function renderIssueMap() {
    const container = document.getElementById('issueNetwork');
    
    // 노드 위치 정의 (x, y는 퍼센트)
    const nodes = [
        { key: 'ai', x: 30, y: 35, size: 'large', color: '#6b9b8e' },
        { key: 'economy', x: 70, y: 40, size: 'large', color: '#8b7ba8' },
        { key: 'tech', x: 25, y: 75, size: 'medium', color: '#7ba3c0' },
        { key: 'climate', x: 75, y: 80, size: 'medium', color: '#7cb89d' }
    ];
    
    // SVG 라인 그리기
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'network-lines');
    
    // 모든 노드 간 연결선
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', `${nodes[i].x}%`);
            line.setAttribute('y1', `${nodes[i].y}%`);
            line.setAttribute('x2', `${nodes[j].x}%`);
            line.setAttribute('y2', `${nodes[j].y}%`);
            svg.appendChild(line);
        }
    }
    
    container.appendChild(svg);
    
    // 노드 생성
    nodes.forEach(node => {
        const podcast = podcastData[node.key];
        const nodeEl = document.createElement('div');
        nodeEl.className = `issue-node ${node.size}`;
        nodeEl.style.left = `${node.x}%`;
        nodeEl.style.top = `${node.y}%`;
        nodeEl.style.transform = 'translate(-50%, -50%)';
        nodeEl.style.background = node.color;
        nodeEl.onclick = () => openPodcast(node.key);
        nodeEl.textContent = podcast.keyword;
        container.appendChild(nodeEl);
    });
}

// 팟캐스트 열기
async function openPodcast(key) {
    currentPodcast = podcastData[key];
    currentTime = 0;
    isPlaying = false;
    
    // ElevenLabs로 오디오 생성
    if (!currentPodcast.audioUrl) {
        await generateAudioFromTranscript();
    }
    
    // 오디오 설정
    if (currentPodcast.audioUrl) {
        audioElement.src = currentPodcast.audioUrl;
        audioElement.load();
    }
    
    // 앨범 커버 설정 및 인포그래픽
    const albumCover = document.getElementById('albumCover');
    
    // 이미지가 있으면 배경 이미지로, 없으면 색상으로
    if (currentPodcast.coverImage) {
        albumCover.style.background = `url('${currentPodcast.coverImage}') center/cover`;
    } else {
        albumCover.style.background = currentPodcast.coverColor;
    }
    
    const bars = currentPodcast.chartHeights.map(height => 
        `<div class="cover-bar" style="height: ${height}%"></div>`
    ).join('');
    
    albumCover.innerHTML = '';
    
    // 트랙 정보 설정
    document.getElementById('trackTitle').textContent = currentPodcast.title;
    document.getElementById('trackKeyword').textContent = `#${currentPodcast.keyword}`;
    
    // 대본 렌더링
    renderTranscript();
    
    // 재생 시간 설정
    document.getElementById('duration').textContent = formatTime(currentPodcast.duration);
    document.getElementById('currentTime').textContent = '0:00';
    document.getElementById('progress').style.setProperty('--progress', '0%');
    
    // 재생 버튼 초기화
    document.getElementById('playBtn').textContent = '▶';
    
    // 화면 전환
    showScreen('player');
}

// ElevenLabs TTS 생성
async function generateAudioFromTranscript() {
    const ELEVENLABS_API_KEY = 'sk_ce1357648ecc0ee7a2248034ac018ef53ea2f7517214beb2';
    const VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
    
    const fullText = currentPodcast.transcript.map(s => s.text).join(' ');
    
    console.log('Generating audio...', fullText.substring(0, 50));
    
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: fullText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const audioBlob = await response.blob();
            currentPodcast.audioUrl = URL.createObjectURL(audioBlob);
            console.log('Audio generated:', currentPodcast.audioUrl);
        } else {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', response.status, errorText);
            alert(`오디오 생성 실패: ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to generate audio:', error);
        alert('오디오 생성 중 오류 발생');
    }
}

// 대본 렌더링
function renderTranscript() {
    const container = document.getElementById('transcriptContent');
    container.innerHTML = currentPodcast.transcript.map((segment, index) => 
        `<span class="transcript-segment" data-index="${index}">${segment.text}</span>`
    ).join('');
}

// 대본 업데이트
function updateTranscript() {
    if (!currentPodcast || !currentPodcast.transcript) return;
    
    const segments = document.querySelectorAll('.transcript-segment');
    let activeIndex = -1;
    
    // 현재 재생 중인 세그먼트 찾기
    currentPodcast.transcript.forEach((segment, index) => {
        if (currentTime >= segment.start && currentTime < segment.end) {
            activeIndex = index;
        }
    });
    
    // 세그먼트 스타일 업데이트
    segments.forEach((segment, index) => {
        segment.classList.remove('active', 'past');
        if (index === activeIndex) {
            segment.classList.add('active');
            // 활성 세그먼트로 스크롤
            segment.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (index < activeIndex) {
            segment.classList.add('past');
        }
    });
}

// 재생/일시정지
function togglePlay() {
    if (!audioElement.src) return;
    
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('playBtn');
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
}

// 진행바 업데이트
function startProgress() {
    progressInterval = setInterval(() => {
        if (currentTime < currentPodcast.duration) {
            currentTime++;
            updateProgress();
        } else {
            stopProgress();
            isPlaying = false;
            document.getElementById('playBtn').textContent = '▶';
        }
    }, 1000);
}

function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgress() {
    const percentage = (currentTime / currentPodcast.duration) * 100;
    document.getElementById('progress').style.setProperty('--progress', `${percentage}%`);
    document.getElementById('currentTime').textContent = formatTime(currentTime);
    updateTranscript();
}

// 시간 포맷
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 건너뛰기
function skipBackward() {
    if (audioElement.src) {
        audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
    }
}

function skipForward() {
    if (audioElement.src && audioElement.duration) {
        audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + 10);
    }
}

// 요약 보기
function showSummary() {
    if (!currentPodcast) return;
    
    document.getElementById('summaryTitle').textContent = currentPodcast.title;
    
    const infographic = document.getElementById('infographic');
    const summary = currentPodcast.summary;
    
    infographic.innerHTML = `
        <div class="info-section">
            <h3>📌 핵심 포인트</h3>
            <ul>
                ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
        
        <div class="info-section">
            <h3>📊 주요 지표</h3>
            <div class="stat-grid">
                ${summary.stats.map(stat => `
                    <div class="stat-card">
                        <div class="number">${stat.number}</div>
                        <div class="label">${stat.label}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="info-section">
            <h3>💡 다룬 주제</h3>
            <ul>
                ${summary.topics.map(topic => `<li>${topic}</li>`).join('')}
            </ul>
        </div>
    `;
    
    showScreen('summary');
}

// 화면 전환
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goBack() {
    const player = document.getElementById('player');
    player.style.transform = 'translateY(100%)';
    
    // 오디오 정지
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
    
    setTimeout(() => {
        isPlaying = false;
        showScreen('issueMap');
        player.style.transform = '';
    }, 400);
}

function backToPlayer() {
    const summary = document.getElementById('summary');
    summary.style.transform = 'translateY(100%)';
    setTimeout(() => {
        showScreen('player');
    }, 400);
}


// 재생바 드래그
let isProgressDragging = false;

function initProgressBarDrag() {
    const progressBar = document.getElementById('progress');
    
    progressBar.addEventListener('mousedown', startProgressDrag);
    progressBar.addEventListener('touchstart', startProgressDrag);
    document.addEventListener('mousemove', handleProgressDrag);
    document.addEventListener('touchmove', handleProgressDrag);
    document.addEventListener('mouseup', endProgressDrag);
    document.addEventListener('touchend', endProgressDrag);
}

function startProgressDrag(e) {
    if (!currentPodcast) return;
    isProgressDragging = true;
    updateProgressFromEvent(e);
}

function handleProgressDrag(e) {
    if (!isProgressDragging) return;
    updateProgressFromEvent(e);
}

function endProgressDrag() {
    isProgressDragging = false;
}

function updateProgressFromEvent(e) {
    const progressBar = document.getElementById('progress');
    const rect = progressBar.getBoundingClientRect();
    const x = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX) - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    currentTime = Math.floor(percentage * currentPodcast.duration);
    updateProgress();
}
