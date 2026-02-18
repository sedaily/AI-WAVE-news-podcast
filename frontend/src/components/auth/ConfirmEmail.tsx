import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resendConfirmationCode } from '../../services/authService';

interface ConfirmEmailProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

function ConfirmEmail({ email, onSuccess, onBack }: ConfirmEmailProps) {
  const { confirmSignUp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignUp(email, code);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'CodeMismatchException') {
        setError('인증 코드가 올바르지 않습니다');
      } else if (error.code === 'ExpiredCodeException') {
        setError('인증 코드가 만료되었습니다. 코드를 다시 요청해주세요');
      } else {
        setError(error.message || '인증에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendMessage('');

    try {
      await resendConfirmationCode(email);
      setResendMessage('인증 코드가 재전송되었습니다');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || '코드 재전송에 실패했습니다');
    }
  };

  return (
    <div className="auth-form">
      <h2>이메일 인증</h2>
      <p className="auth-subtitle">
        <strong>{email}</strong>로 전송된<br />
        인증 코드를 입력해주세요
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="confirm-code">인증 코드</label>
          <input
            id="confirm-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6자리 코드 입력"
            maxLength={6}
            required
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        </div>

        {error && <div className="auth-error">{error}</div>}
        {resendMessage && <div className="auth-success">{resendMessage}</div>}

        <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
          {isLoading ? '확인 중...' : '인증 완료'}
        </button>
      </form>

      <div className="auth-footer">
        <button type="button" className="btn-text" onClick={handleResendCode}>
          코드 재전송
        </button>
        <span className="divider">|</span>
        <button type="button" className="btn-text" onClick={onBack}>
          돌아가기
        </button>
      </div>
    </div>
  );
}

export default ConfirmEmail;
