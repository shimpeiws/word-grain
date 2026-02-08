# WordGrain Specification

A JSON format for storing vocabulary data extracted from musical lyrics. Originally developed for hip-hop lyric analysis.

## Overview

WordGrain provides a standardized way to represent linguistic analysis of musical lyrics, including:

- Vocabulary with frequency and TF-IDF scores
- Part of speech and sentiment analysis
- Contextual examples from actual lyrics
- Collocation and usage patterns

## Quick Start

### Minimal Example

```json
{
  "$schema": "https://example.com/schemas/wordgrain/v0.1.0",
  "meta": {
    "source": "genius",
    "artist": "Kendrick Lamar",
    "generated_at": "2026-02-08T12:00:00Z"
  },
  "grains": [
    {
      "word": "hustle",
      "frequency": 47,
      "tfidf": 0.82
    }
  ]
}
```

### Validation

```bash
# Using ajv-cli
npx ajv validate -s schema/wordgrain.schema.json -d your-file.wg.json

# Using Python jsonschema
python -m jsonschema -i your-file.wg.json schema/wordgrain.schema.json
```

## Specification

See [spec/WG-RFC-001.md](spec/WG-RFC-001.md) for the full specification.

## File Convention

- Extension: `.wg.json`
- Encoding: UTF-8
- Naming: `{artist-slug}.wg.json`

## Examples

| File | Description |
|------|-------------|
| [examples/minimal.wg.json](examples/minimal.wg.json) | Minimal valid document |
| [examples/kendrick-lamar.wg.json](examples/kendrick-lamar.wg.json) | Full-featured example |

## Schema

The JSON Schema is available at:

- Local: [schema/wordgrain.schema.json](schema/wordgrain.schema.json)
- Remote: `https://example.com/schemas/wordgrain/v0.1.0/wordgrain.schema.json`

## License

This project is licensed under the [MIT License](LICENSE).
