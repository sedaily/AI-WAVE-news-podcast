import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  signOut as cognitoSignOut,
  confirmSignUp as cognitoConfirmSignUp,
  getCurrentUser,
  type AuthUser,
  type SignUpResult,
} from '../services/authService';
import { isCognitoConfigured } from '../config/cognito';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => void;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(() => isCognitoConfigured());

  const refreshUser = useCallback(async () => {
    if (!isConfigured) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    await cognitoSignIn(email, password);
    await refreshUser();
  };

  const signUp = async (email: string, password: string): Promise<SignUpResult> => {
    return cognitoSignUp(email, password);
  };

  const signOut = () => {
    cognitoSignOut();
    setUser(null);
  };

  const confirmSignUp = async (email: string, code: string) => {
    await cognitoConfirmSignUp(email, code);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        confirmSignUp,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
