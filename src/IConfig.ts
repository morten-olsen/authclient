import IStore from './IStore';
interface IConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  store?: IStore;
  scopes?: string[];
  pkce?: boolean;
  grantType: string;
  responseType: string;
}

export default IConfig;
