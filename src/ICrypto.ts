interface ICrypto {
  sha256: (input: string) => Promise<string>;
  random: (type: string) => Promise<string>;
  base64UrlEncode: (input: string) => Promise<string>;
}

export default ICrypto;
