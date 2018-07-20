interface IToken {
  accessCode?: string;
  refreshCode?: string;
  expiresIn: number;
  creationTime: number;
}

export default IToken;
