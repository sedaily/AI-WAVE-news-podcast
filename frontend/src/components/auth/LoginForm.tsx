import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSuccess: () => void;
  onNeedConfirmation: (email: string) => void;
}

function LoginForm({ onSwitchToSignup, onSuccess, onNeedConfirmation }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'UserNotConfirmedException') {
        onNeedConfirmation(email);
      } else if (error.code === 'NotAuthorizedException') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다');
      } else if (error.code === 'UserNotFoundException') {
        setError('등록되지 않은 이메일입니다');
      } else {
        setError(error.message || '로그인에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>로그인</h2>
      <p className="auth-subtitle">뉴스캐스트에 오신 것을 환영합니다</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            required
            disabled={isLoading}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="auth-footer">
        <span>계정이 없으신가요?</span>
        <button type="button" className="btn-text" onClick={onSwitchToSignup}>
          회원가입
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
