const DEFAULT_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in', 'on', 'at', 'to',
  'and', 'or', 'but', 'for', 'with', 'as', 'by', 'be', 'this', 'that',
]);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dist = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 0; j < cols; j += 1) dist[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + cost,
      );
    }
  }

  return dist[rows - 1][cols - 1];
}

function exactSimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

class TextMatcher {
  constructor(options = {}) {
    this.stopWords = options.stopWords
      ? new Set(options.stopWords)
      : DEFAULT_STOP_WORDS;
  }

  tokenize(normalizedText) {
    if (!normalizedText) return [];
    return normalizedText.split(' ').filter((token) => token && !this.stopWords.has(token));
  }

  compare(source, candidate) {
    const start = Date.now();

    const normSource = normalize(source || '');
    const normCandidate = normalize(candidate || '');

    if (normSource.length === 0 || normCandidate.length === 0) {
      return {
        score: 0,
        strategies: { exact: 0, tokenOverlap: 0 },
        matchedTokens: [],
        processingMs: Date.now() - start,
      };
    }

    const exact = exactSimilarity(normSource, normCandidate);

    const sourceTokens = new Set(this.tokenize(normSource));
    const candidateTokens = new Set(this.tokenize(normCandidate));

    const intersection = [...sourceTokens].filter((token) => candidateTokens.has(token));
    const union = new Set([...sourceTokens, ...candidateTokens]);
    const tokenOverlap = union.size === 0 ? 0 : intersection.length / union.size;

    const score = (exact + tokenOverlap) / 2;

    return {
      score,
      strategies: { exact, tokenOverlap },
      matchedTokens: intersection.sort(),
      processingMs: Date.now() - start,
    };
  }
}

module.exports = TextMatcher;
