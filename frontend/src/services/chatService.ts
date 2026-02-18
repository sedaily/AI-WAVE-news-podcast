// Chat API 엔드포인트
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL ||
  'https://zuudipbmnz73fb5caw3mlk2q5i0fwudp.lambda-url.us-east-1.on.aws/';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

// 채팅 메시지 전송
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-10) // 최근 10개 대화만 전송
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      message: '',
      error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

// 로컬 대화 히스토리 저장
const HISTORY_KEY = 'podcast_chat_history';
const MAX_HISTORY = 50;

export function saveChatHistory(messages: ChatMessage[]): void {
  const trimmed = messages.slice(-MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearChatHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
