interface Token {
  idToken?: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  createdAt: number;
}

export default Token;