import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onNeedConfirmation: (email: string) => void;
}

function SignupForm({ onSwitchToLogin, onNeedConfirmation }: SignupFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    // 비밀번호 유효성 검사
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password);
      if (!result.userConfirmed) {
        onNeedConfirmation(email);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'UsernameExistsException') {
        setError('이미 등록된 이메일입니다');
      } else if (error.code === 'InvalidPasswordException') {
        setError('비밀번호 형식이 올바르지 않습니다');
      } else {
        setError(error.message || '회원가입에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>회원가입</h2>
      <p className="auth-subtitle">뉴스캐스트와 함께하세요</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="signup-email">이메일</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-password">비밀번호</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-confirm-password">비밀번호 확인</label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 재입력"
            required
            disabled={isLoading}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <div className="auth-footer">
        <span>이미 계정이 있으신가요?</span>
        <button type="button" className="btn-text" onClick={onSwitchToLogin}>
          로그인
        </button>
      </div>
    </div>
  );
}

export default SignupForm;
