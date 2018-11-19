type types = 
  'Implicit'
  | 'AuthorizationCode'
  | 'Password'
  | 'ClientCredentials'
  | 'DeviceCode'

interface Configuration {
  host: string;
  type: types;
  scopes: string[];
  redirectUri: string;
  pkce?: boolean;
}