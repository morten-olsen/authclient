interface IToken {
  idToken?: string;
  accessCode?: string;
  refreshCode?: string;
  expiresIn: number;
  creationTime: number;
}

export default IToken;
