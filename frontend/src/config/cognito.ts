// Cognito 설정
// 환경변수에서 읽거나 직접 설정
export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  region: import.meta.env.VITE_AWS_REGION || 'ap-northeast-2',
};

// 설정 유효성 검사
export function isCognitoConfigured(): boolean {
  return !!(cognitoConfig.userPoolId && cognitoConfig.clientId);
}
