interface Token {
  idToken?: string;
  acceessToken: string;
  refreshToken?: string;
  expiresIn: number;
  createdAt: number;
}

export default Token;