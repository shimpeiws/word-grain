# WordGrain Specification

A JSON format for storing vocabulary data and lyric bar analysis extracted from musical lyrics. Originally developed for hip-hop lyric analysis.

## Documentation

Full documentation is available at: https://shimpeiws.github.io/word-grain/

## Overview

WordGrain provides a standardized way to represent linguistic analysis of musical lyrics, including:

- Vocabulary with frequency and TF-IDF scores (grains)
- Lyric bar analysis with metrics and semantics (bars)
- Part of speech and sentiment analysis
- Contextual examples from actual lyrics
- Collocation and usage patterns

A single `.wg.json` file can contain `grains`, `bars`, or both.

## Quick Start

### Grains Example

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
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

### Bars Example

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "meta": {
    "source": "manual",
    "artist": "KOHH",
    "generated_at": "2026-03-06T00:00:00Z",
    "language": "ja"
  },
  "bars": [
    {
      "text": "結局俺は俺 お前はお前",
      "source": { "track": "貧乏なんて気にしない", "album": "MONEYFLOWER", "year": 2017 },
      "semantics": { "mood": "defiant", "themes": ["identity"] }
    }
  ]
}
```

### Validation

```bash
# Using ajv-cli
npx ajv validate -s schema/v0.2.0/wordgrain.schema.json -d your-file.wg.json --spec=draft2020

# Using Python jsonschema
python -m jsonschema -i your-file.wg.json schema/v0.2.0/wordgrain.schema.json
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
| [examples/kendrick-lamar.wg.json](examples/kendrick-lamar.wg.json) | Full-featured grains example |
| [examples/kohh-bar.wg.json](examples/kohh-bar.wg.json) | Bars-only example |
| [examples/mixed.wg.json](examples/mixed.wg.json) | Mixed grains + bars document |

## Schema

The JSON Schema is available at:

- Local: [schema/v0.2.0/wordgrain.schema.json](schema/v0.2.0/wordgrain.schema.json)
- Remote: `https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json`

## License

This project is licensed under the [MIT License](LICENSE).
