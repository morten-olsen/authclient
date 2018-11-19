import Token from '../models/Token';

type types = 
  'Implicit'
  | 'AuthorizationCode'
  | 'Password'
  | 'ClientCredentials'
  | 'DeviceCode'

interface Configuration {
  host: string;
  clientId: string;
  clientSecret?: string;
  type: types;
  scopes: string[];
  redirectUri?: string;
  pkce?: boolean;
  saveToken?: (token: Token) => Promise<void>;
  loadToken?: () => Promise<Token | undefined>;
}

export default Configuration;