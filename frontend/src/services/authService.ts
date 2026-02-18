import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { cognitoConfig, isCognitoConfigured } from '../config/cognito';

// User Pool 인스턴스
let userPool: CognitoUserPool | null = null;

function getUserPool(): CognitoUserPool {
  if (!userPool) {
    if (!isCognitoConfigured()) {
      throw new Error('Cognito is not configured. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID');
    }
    userPool = new CognitoUserPool({
      UserPoolId: cognitoConfig.userPoolId,
      ClientId: cognitoConfig.clientId,
    });
  }
  return userPool;
}

export interface AuthUser {
  email: string;
  sub: string;
  emailVerified: boolean;
}

export interface SignUpResult {
  userConfirmed: boolean;
  userSub: string;
}

// 회원가입
export function signUp(email: string, password: string): Promise<SignUpResult> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();

    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    pool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (result) {
        resolve({
          userConfirmed: result.userConfirmed,
          userSub: result.userSub,
        });
      }
    });
  });
}

// 이메일 인증 코드 확인
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// 인증 코드 재전송
export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// 로그인
export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

// 로그아웃
export function signOut(): void {
  const pool = getUserPool();
  const cognitoUser = pool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

// 현재 인증된 사용자 가져오기
export function getCurrentUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    if (!isCognitoConfigured()) {
      resolve(null);
      return;
    }

    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }

      cognitoUser.getUserAttributes((attrErr, attributes) => {
        if (attrErr || !attributes) {
          resolve(null);
          return;
        }

        const email = attributes.find(a => a.getName() === 'email')?.getValue() || '';
        const sub = attributes.find(a => a.getName() === 'sub')?.getValue() || '';
        const emailVerified = attributes.find(a => a.getName() === 'email_verified')?.getValue() === 'true';

        resolve({ email, sub, emailVerified });
      });
    });
  });
}

// 세션 가져오기 (API 호출용)
export function getSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    if (!isCognitoConfigured()) {
      resolve(null);
      return;
    }

    const pool = getUserPool();
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session);
    });
  });
}

// ID 토큰 가져오기 (API 호출용)
export async function getIdToken(): Promise<string | null> {
  const session = await getSession();
  return session?.getIdToken().getJwtToken() || null;
}

// 비밀번호 재설정 요청
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

// 비밀번호 재설정 완료
export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const pool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}
