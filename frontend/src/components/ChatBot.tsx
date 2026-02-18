import { useState, useRef, useEffect } from 'react';
import {
  sendChatMessage,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  type ChatMessage
} from '../services/chatService';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 대화 히스토리 로드
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  // 새 메시지 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 열릴 때 포커스
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmed, messages);

      if (response.error) {
        // 에러 메시지 표시
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: response.error
        };
        setMessages([...newMessages, errorMessage]);
      } else {
        // 응답 추가
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message
        };
        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
        saveChatHistory(updatedMessages);
      }
    } catch {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '죄송합니다. 잠시 후 다시 시도해주세요.'
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    clearChatHistory();
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const quickQuestions = [
    '오늘 주요 뉴스 요약해줘',
    '환율 관련 뉴스 있어?',
    '부동산 이슈 알려줘',
    '주식 시장 어때?'
  ];

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">💬</span>
            <span>뉴스 Q&A</span>
          </div>
          <div className="chatbot-actions">
            {messages.length > 0 && (
              <button className="chatbot-clear" onClick={handleClear} title="대화 지우기">
                🗑️
              </button>
            )}
            <button className="chatbot-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.length === 0 ? (
            <div className="chatbot-welcome">
              <div className="welcome-icon">🎙️</div>
              <h3>안녕하세요!</h3>
              <p>오늘의 경제 뉴스에 대해 궁금한 점을 물어보세요.</p>

              <div className="quick-questions">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="quick-question"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.role}`}
              >
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="chat-message assistant">
              <div className="message-content loading">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            disabled={isLoading}
            className="chatbot-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="chatbot-send"
          >
            {isLoading ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
