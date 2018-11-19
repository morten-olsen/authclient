interface Security {
  generateRandom: (length: number) => Promise<string>;
  sha256: (input: string) => Promise<string>;
}

export default Security;