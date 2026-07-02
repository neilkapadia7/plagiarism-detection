# Plagiarism Detection — Text Similarity Module + Express API

A small, self-contained text comparison engine (`TextMatcher`) wrapped in an Express HTTP
API. No external infrastructure required — everything runs locally.

Request validation is handled by `express-validator`, all route handlers are wrapped in
try/catch, and every response (success or error) is sent through a shared responder
(`services/responder.js`) so the wire format stays consistent across the API.

## Install

```bash
npm install
```

## Start the server

```bash
npm start
```

The server listens on `process.env.PORT` (loaded via `dotenv` from `.env`), falling back
to `5010` if unset. This repo includes a `.env` file with `PORT=5000` for local
development, so `npm start` boots on port **5000** unless you remove/override it.

## Run tests

```bash
npm test
```

Runs the full Jest suite (unit tests for `TextMatcher` + API tests for the Express
endpoints).

## API

| Method | Path       | Description                                              |
| ------ | ---------- | --------------------------------------------------------- |
| POST   | /compare   | Body: `{ source, candidate }`. Returns a `MatchResult`.    |
| GET    | /health    | Returns `200` with `{ status: 'ok' }`.                     |

`MatchResult` shape:

```json
{
  "score": 0.87,
  "strategies": { "exact": 0.91, "tokenOverlap": 0.83 },
  "matchedTokens": ["brown", "fox", "quick"],
  "processingMs": 0
}
```

### Example requests

```bash
curl -s http://localhost:5000/health

curl -s -X POST http://localhost:5000/compare \
  -H "Content-Type: application/json" \
  -d '{"source": "The quick brown fox jumps over the lazy dog", "candidate": "The quick brown fox leaps over the lazy dog"}'

# Missing field -> 400 JSON error
curl -s -X POST http://localhost:5000/compare \
  -H "Content-Type: application/json" \
  -d '{"source": "only source provided"}'
```

## Assumptions

- **`exact` (character-level) similarity** is computed as normalized Levenshtein
  similarity: `1 - levenshtein(a, b) / max(a.length, b.length)` on the normalized strings.
  This is a single, well-known metric that is easy to reason about and naturally yields
  `1.0` for identical strings.
- **Stop word list** is hardcoded in `TextMatcher.js` (`the, a, an, is, are, was, were, of,
  in, on, at, to, and, or, but, for, with, as, by, be, this, that`) and can be overridden
  via `new TextMatcher({ stopWords: [...] })`.
- **Empty-input vs. identical-string rules conflict for `compare("", "")`**: the spec says
  both "identical strings must produce score 1.0" and "empty string inputs must not throw
  — return score 0.0". This implementation treats the empty-input rule as taking
  precedence — if either input is empty (after normalization), the result short-circuits
  to `score: 0` regardless of whether the other side is also empty.
- **Missing vs. empty string fields in `POST /compare`**: a field that is entirely absent
  (`undefined`) or not a string returns HTTP `400`. A field present as an empty string
  (`""`) is treated as valid input and passed through to `TextMatcher`, which returns
  `score: 0` per its own empty-input rule — this keeps the "missing fields → 400" and
  "empty strings must not throw" requirements from conflicting with each other.
- A catch-all Express error-handling middleware in `server.js` guards against malformed
  JSON bodies or any unexpected thrown errors, always responding with a JSON error body
  instead of crashing the process.
