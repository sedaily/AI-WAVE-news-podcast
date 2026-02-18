import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ConfirmEmail from './ConfirmEmail';

type AuthView = 'login' | 'signup' | 'confirm';

interface AuthModalProps {
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

function AuthModal({ onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleNeedConfirmation = (email: string) => {
    setPendingEmail(email);
    setView('confirm');
  };

  const handleConfirmSuccess = () => {
    setView('login');
  };

  const handleLoginSuccess = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleBackdropClick}>
      <div className="auth-modal">
        <button className="auth-close-btn" onClick={onClose} aria-label="닫기">
          &times;
        </button>

        {view === 'login' && (
          <LoginForm
            onSwitchToSignup={() => setView('signup')}
            onSuccess={handleLoginSuccess}
            onNeedConfirmation={handleNeedConfirmation}
          />
        )}

        {view === 'signup' && (
          <SignupForm
            onSwitchToLogin={() => setView('login')}
            onNeedConfirmation={handleNeedConfirmation}
          />
        )}

        {view === 'confirm' && (
          <ConfirmEmail
            email={pendingEmail}
            onSuccess={handleConfirmSuccess}
            onBack={() => setView('login')}
          />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
