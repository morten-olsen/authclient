interface IConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
  pkce?: boolean;
  grantType: string;
  responseType: string;
}

export default IConfig;
