const TextMatcher = require('../services/TextMatcher');

describe('TextMatcher', () => {
  const matcher = new TextMatcher();

  test('identical strings produce score 1.0', () => {
    const result = matcher.compare(
      'The quick brown fox jumps over the lazy dog.',
      'The quick brown fox jumps over the lazy dog.',
    );
    expect(result.score).toBe(1);
  });

  test('completely unrelated strings produce score below 0.3', () => {
    const result = matcher.compare(
      'The quick brown fox jumps over the lazy dog.',
      'Quantum computing relies on superposition and entanglement effects.',
    );
    expect(result.score).toBeLessThan(0.3);
  });

  test('near-duplicate strings (one word changed) produce score above 0.7', () => {
    const result = matcher.compare(
      'The quick brown fox jumps over the lazy dog.',
      'The quick brown fox leaps over the lazy dog.',
    );
    expect(result.score).toBeGreaterThan(0.7);
  });

  test('empty string inputs do not throw and return score 0.0', () => {
    expect(() => matcher.compare('', '')).not.toThrow();
    expect(matcher.compare('', '').score).toBe(0);
    expect(matcher.compare('some text', '').score).toBe(0);
    expect(matcher.compare('', 'some text').score).toBe(0);
  });

  test('stop words are excluded from matchedTokens', () => {
    const result = matcher.compare(
      'The cat is on the mat',
      'The cat was on the mat',
    );
    const stopWords = ['the', 'is', 'was', 'on'];
    stopWords.forEach((word) => {
      expect(result.matchedTokens).not.toContain(word);
    });
    expect(result.matchedTokens).toEqual(expect.arrayContaining(['cat', 'mat']));
  });
});
