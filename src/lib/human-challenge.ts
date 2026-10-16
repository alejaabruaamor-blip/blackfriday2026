export function validHumanAnswer(answer: string, a: number, b: number): boolean {
  const value = answer.trim();
  return /^\d{1,2}$/.test(value) && Number(value) === a + b;
}
