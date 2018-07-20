export type responseModes =
    'form_post'
  | 'query'
  | 'fragment';
export type grantTypes =
    'authorization_code'
  | 'client_credentials'
  | 'refresh_token'
  | 'implicit'
  | 'password';
export type codeChallengeTypes =
    'plain'
  | 'S256';
export type responseTypes =
    'code'
  | 'token'
  | 'id_token'
  | 'id_token token'
  | 'code id_token'
  | 'code token'
  | 'code id_token token';
export type subjectTypes =
    'public';
export type authMethodSupported =
    'client_secret_basic'
  | 'client_secret_post';

interface IOpenIDConfig {
  authorization_endpoint: string;
  claims_supported: string[];
  code_challenge_methods_supported: codeChallengeTypes[];
  end_session_endpoint: string;
  grant_types_supported: grantTypes[];
  id_token_signing_alg_values_supported: string[];
  introspection_endpoint: string;
  issuer: string;
  jwks_uri: string;
  response_modes_supported: responseModes[];
  revocation_endpoint: string;
  scopes_supported: string;
  subject_types_supported: subjectTypes[];
  token_endpoint: string;
  token_endpoint_auth_methods_supported: authMethodSupported[];
  userinfo_endpoint: string;
}

export default IOpenIDConfig;
