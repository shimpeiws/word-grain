# WordGrain Specification

A JSON format for storing vocabulary and lyrical structure data extracted from musical lyrics. Originally developed for hip-hop lyric analysis.

## Documentation

Full documentation is available at: https://shimpeiws.github.io/word-grain/

## Overview

WordGrain provides a standardized way to represent linguistic analysis of musical lyrics at multiple granularity levels:

| Type | Granularity | Description |
|------|-------------|-------------|
| `word` | Morpheme/token | Vocabulary entries with frequency, TF-IDF, sentiment, and contextual data |
| `bar` | Phrase/line | 1-2 line lyrical units with source, metrics, and mood |
| `verse` | Full verse | Complete verse sections (coming soon) |

## Quick Start

### Word Type (v0.1.0 compatible)

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "type": "word",
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

### Bar Type (new in v0.2.0)

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "type": "bar",
  "text": "俺はまだ関係ねえ 関係ねえ 関係ねえ",
  "source": {
    "artist": "KOHH",
    "track": "貧乏なんて気にしない",
    "album": "YELLOW T△PE 3",
    "year": 2016
  },
  "metrics": {
    "lines": 1,
    "syllables": 18,
    "mora": 20
  },
  "semantics": {
    "mood": "defiant"
  },
  "language": "ja"
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
- Naming: `{artist-slug}.wg.json` (word type), `{artist-slug}-bar.wg.json` (bar type)

## Examples

| File | Type | Description |
|------|------|-------------|
| [examples/minimal.wg.json](examples/minimal.wg.json) | word | Minimal valid document |
| [examples/kendrick-lamar.wg.json](examples/kendrick-lamar.wg.json) | word | Full-featured word example |
| [examples/kohh-bar.wg.json](examples/kohh-bar.wg.json) | bar | Bar type example (Japanese) |

## Schema

The JSON Schema is available at:

- **v0.2.0** (latest): [schema/v0.2.0/wordgrain.schema.json](schema/v0.2.0/wordgrain.schema.json) / [Remote](https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json)
- v0.1.0: [schema/v0.1.0/wordgrain.schema.json](schema/v0.1.0/wordgrain.schema.json) / [Remote](https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.1.0/wordgrain.schema.json)

## License

This project is licensed under the [MIT License](LICENSE).
