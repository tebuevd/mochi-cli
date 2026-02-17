export function findClosestMatches(
  input: string,
  candidates: readonly string[],
  maxResults: number
): string[] {
  if (!input || candidates.length === 0) return [];

  const scored = candidates.map((candidate) => ({
    candidate,
    score: calculateSimilarity(input.toLowerCase(), candidate.toLowerCase()),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0.3)
    .slice(0, maxResults)
    .map((s) => s.candidate);
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (b.startsWith(a)) return 0.8 + (a.length / b.length) * 0.2;
  if (b.includes(a)) return 0.5 + (a.length / b.length) * 0.2;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;

  const similarity = 1 - distance / maxLen;
  return similarity > 0.5 ? similarity * 0.6 : 0;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}
