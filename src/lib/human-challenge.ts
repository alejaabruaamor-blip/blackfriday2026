export function validHumanAnswer(answer: string, a: number, b: number): boolean {
  const value = answer.trim();
  return /^\d{1,2}$/.test(value) && Number(value) === a + b;
}

export function safeStoreReturn(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/";
  const path = value.split(/[?#]/)[0];
  if (path === "/verificacao" || path.startsWith("/verificacao/")) return "/";
  return value;
}
