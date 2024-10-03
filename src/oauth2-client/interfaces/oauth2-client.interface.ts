export interface IOAuth2Client {
  /**
   * 인증 URL을 생성합니다.
   * @param scopes 요청할 권한 범위 배열
   * @param redirect_url
   * @returns 사용자를 리디렉션할 인증 URL
   */
  getAuthorizationUrl(scopes: string[], state: string): Promise<string>;

  /**
   * 인증 코드를 토큰으로 교환합니다.
   * @param code 인증 과정에서 받은 코드
   * @returns 액세스 토큰, 리프레시 토큰 등을 포함한 토큰 객체
   */
  getToken(code: string): Promise<any>;

  /**
   * 리프레시 토큰을 사용하여 새 액세스 토큰을 얻습니다.
   * @param refreshToken 리프레시 토큰
   * @returns 새로운 액세스 토큰을 포함한 토큰 객체
   */
  refreshToken(refreshToken: string): Promise<any>;

  /**
   * 토큰을 취소합니다.
   * @param token 취소할 토큰
   */
  revokeToken(token: string): Promise<void>;
}
