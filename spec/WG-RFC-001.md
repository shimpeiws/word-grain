# WG-RFC-001: WordGrain Specification v0.2.0

| Field | Value |
|-------|-------|
| RFC | WG-RFC-001 |
| Title | WordGrain JSON Format Specification |
| Status | Draft |
| Created | 2026-02-08 |
| Updated | 2026-03-06 |
| Author | Shin Takamatsu |

---

## Abstract

WordGrain is a standardized JSON format for representing vocabulary data and lyric bar analysis extracted from musical lyrics and other text sources. This specification defines the structure, fields, and validation rules for WordGrain documents.

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Terminology](#2-terminology)
3. [Specification](#3-specification)
4. [Content Sections](#4-content-sections)
5. [File Conventions](#5-file-conventions)
6. [Versioning](#6-versioning)
7. [MIME Type](#7-mime-type)
8. [Examples](#8-examples)
9. [Validation](#9-validation)
10. [Security Considerations](#10-security-considerations)
11. [Future Extensions](#11-future-extensions)
12. [References](#12-references)

---

## 1. Motivation

### 1.1 Problem Statement

Musical lyrics represent a rich linguistic corpus with unique vocabulary, slang evolution, and cultural significance. Currently, there is no standardized format for:

- Exchanging vocabulary analysis data between tools
- Archiving linguistic patterns in musical lyrics
- Building educational and research applications
- Creating interoperable lyric analysis pipelines
- Storing structured bar-level lyric analysis

### 1.2 Goals

1. **Interoperability**: Enable data exchange between analysis tools
2. **Completeness**: Capture linguistic, statistical, and contextual data
3. **Extensibility**: Allow future additions without breaking changes
4. **Simplicity**: Keep the core format minimal and human-readable
5. **Validation**: Provide machine-verifiable schema
6. **Unified Format**: Support multiple content types (grains, bars) in a single document

### 1.3 Non-Goals

- Audio storage or streaming
- Full lyric text storage (copyright considerations)
- Real-time processing protocols

---

## 2. Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

| Term | Definition |
|------|------------|
| Grain | A single vocabulary entry with associated metadata |
| Bar | A lyric line or phrase with source, metrics, and semantic analysis |
| Corpus | The collection of lyrics analyzed to produce grains |
| Context | A specific usage instance of a word in lyrics |
| TF-IDF | Term Frequency-Inverse Document Frequency score |

---

## 3. Specification

### 3.1 Document Structure

A WordGrain document is a unified JSON object that can contain vocabulary grains, lyric bars, or both. At least one of `grains` or `bars` MUST be present.

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "meta": { ... },
  "grains": [ ... ],
  "bars": [ ... ]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string (URI) | REQUIRED | Schema version URI |
| `schema_version` | string | REQUIRED | Schema version identifier (e.g., "0.2.0") |
| `meta` | object | REQUIRED | Document metadata |
| `grains` | array | OPTIONAL* | Array of grain objects |
| `bars` | array | OPTIONAL* | Array of bar objects |

\* At least one of `grains` or `bars` MUST be present.

### 3.2 Meta Object

#### 3.2.1 Required Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `source` | string | minLength: 1 | Data source identifier (e.g., "genius", "manual") |
| `artist` | string | minLength: 1 | Primary artist name |
| `generated_at` | string | ISO 8601 datetime | Generation timestamp |

#### 3.2.2 Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `artists` | string[] | - | Additional artists for collaborative corpora |
| `corpus_size` | integer | - | Number of tracks analyzed |
| `total_words` | integer | - | Total word count in corpus |
| `generator` | string | - | Generator tool identifier |
| `language` | string | "en" | ISO 639-1 language code |
| `description` | string | - | Human-readable description |

### 3.3 Grain Object

#### 3.3.1 Required Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `word` | string | minLength: 1 | The vocabulary word or phrase |

#### 3.3.2 Statistical Fields (Optional)

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `frequency` | integer | >= 1 | Raw occurrence count |
| `frequency_normalized` | number | >= 0 | Per 10,000 words |
| `tfidf` | number | 0.0 - 1.0 | TF-IDF score |

#### 3.3.3 Linguistic Fields (Optional)

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `pos` | string | enum | Part of speech |
| `normalized` | string | - | Lemmatized form |
| `sentiment` | string | enum | Sentiment classification |
| `sentiment_score` | number | -1.0 to 1.0 | Sentiment value |
| `is_slang` | boolean | - | Slang indicator |
| `etymology` | string | - | Origin notes |
| `definition` | string | - | Contextual definition |

#### 3.3.4 POS Enum Values

- `noun`, `verb`, `adjective`, `adverb`, `pronoun`
- `preposition`, `conjunction`, `interjection`
- `determiner`, `particle`, `other`

#### 3.3.5 Sentiment Enum Values

- `positive`, `negative`, `neutral`, `mixed`

#### 3.3.6 Additional Fields (Optional)

| Field | Type | Description |
|-------|------|-------------|
| `categories` | string[] | Semantic categories or tags |
| `contexts` | Context[] | Example usages from corpus |
| `first_seen` | string | Earliest known usage |
| `collocations` | Collocation[] | Co-occurring words |
| `extensions` | object | Vendor-specific fields |

### 3.4 Context Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `line` | string | REQUIRED | Lyric line excerpt |
| `track` | string | OPTIONAL | Song title |
| `album` | string | OPTIONAL | Album name |
| `year` | integer | OPTIONAL | Release year (1-2200) |
| `featuring` | string[] | OPTIONAL | Featured artists |
| `timestamp` | string | OPTIONAL | MM:SS format |

### 3.5 Collocation Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `word` | string | REQUIRED | Co-occurring word |
| `score` | number | REQUIRED | Strength (0.0-1.0) |
| `position` | string | OPTIONAL | "before", "after", "either" |

### 3.6 Extensions Field

The `extensions` field in Grain objects allows vendor-specific data:

```json
{
  "word": "drip",
  "extensions": {
    "x-custom-embedding": [0.1, 0.2, ...],
    "x-urban-dictionary-id": "12345"
  }
}
```

Extension keys SHOULD be prefixed with `x-` to indicate non-standard fields.

---

## 4. Content Sections

A WordGrain document supports two content sections: **grains** for vocabulary analysis and **bars** for lyric-level analysis. At least one section MUST be present; both MAY coexist in a single document.

### 4.1 Grains Section

The `grains` array contains vocabulary entries with linguistic and statistical data. See Section 3.3 for the Grain object structure.

### 4.2 Bars Section

The `bars` array contains lyric bar entries. Each bar is an individual lyric line or phrase with associated metadata.

#### 4.2.1 Bar Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | REQUIRED | The lyric bar text |
| `source` | BarSource | REQUIRED | Source information (track, album, year) |
| `metrics` | BarMetrics | OPTIONAL | Quantitative metrics |
| `semantics` | BarSemantics | OPTIONAL | Semantic analysis |
| `language` | string | OPTIONAL | ISO 639-1 language code for this bar |

#### 4.2.2 BarSource Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `track` | string | REQUIRED | Track/song title |
| `album` | string | OPTIONAL | Album name |
| `year` | integer | OPTIONAL | Release year (1-2200) |
| `featuring` | string[] | OPTIONAL | Featured artists |
| `timestamp` | string | OPTIONAL | MM:SS format |

#### 4.2.3 BarMetrics Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `syllable_count` | integer | OPTIONAL | Number of syllables |
| `word_count` | integer | OPTIONAL | Number of words |
| `rhyme_density` | number | OPTIONAL | Rhyme density score (0.0-1.0) |

#### 4.2.4 BarSemantics Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mood` | Mood | OPTIONAL | Mood classification |
| `themes` | string[] | OPTIONAL | Thematic tags |
| `techniques` | string[] | OPTIONAL | Lyrical techniques used |

#### 4.2.5 Mood Enum Values

- `aggressive`, `melancholic`, `triumphant`, `reflective`, `humorous`
- `romantic`, `defiant`, `hopeful`, `dark`, `celebratory`

---

## 5. File Conventions

### 5.1 File Extension

WordGrain files SHOULD use the `.wg.json` extension:

```
kendrick-lamar.wg.json
wu-tang-clan.wg.json
```

### 5.2 Naming Conventions

| Pattern | Example | Use Case |
|---------|---------|----------|
| `{artist-slug}.wg.json` | `kendrick-lamar.wg.json` | Single artist |
| `{artist-slug}-{album-slug}.wg.json` | `kendrick-lamar-damn.wg.json` | Single album |
| `{collection-name}.wg.json` | `west-coast-2020s.wg.json` | Curated collection |

Slugs SHOULD be lowercase, hyphen-separated ASCII.

### 5.3 Encoding

Files MUST be encoded as UTF-8 without BOM.

---

## 6. Versioning

### 6.1 Schema Version

The `$schema` field indicates the specification version:

```
https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v{MAJOR}.{MINOR}.{PATCH}/wordgrain.schema.json
```

The `schema_version` field MUST contain the version string (e.g., `"0.2.0"`).

### 6.2 Semantic Versioning Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking change to required fields | MAJOR | v1.0.0 -> v2.0.0 |
| New optional fields | MINOR | v0.1.0 -> v0.2.0 |
| Documentation/typo fixes | PATCH | v0.1.0 -> v0.1.1 |

### 6.3 Compatibility

- Consumers SHOULD ignore unknown fields for forward compatibility
- Producers MUST NOT remove required fields in minor versions

---

## 7. MIME Type

Recommended MIME type: `application/vnd.wordgrain+json`

Until registered, use: `application/json`

---

## 8. Examples

### 8.1 Minimal Valid Document (Grains only)

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "meta": {
    "source": "manual",
    "artist": "Example Artist",
    "generated_at": "2026-02-08T00:00:00Z"
  },
  "grains": []
}
```

### 8.2 Bars Only Document

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

### 8.3 Mixed Document (Grains + Bars)

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "meta": {
    "source": "manual",
    "artist": "Kendrick Lamar",
    "generated_at": "2026-03-06T00:00:00Z"
  },
  "grains": [
    { "word": "hustle", "frequency": 47, "tfidf": 0.82 }
  ],
  "bars": [
    {
      "text": "I got hustle though, ambition flow inside my DNA",
      "source": { "track": "DNA.", "album": "DAMN.", "year": 2017 },
      "semantics": { "mood": "aggressive", "themes": ["ambition"] }
    }
  ]
}
```

### 8.4 Complete Example

See [examples/kendrick-lamar.wg.json](../examples/kendrick-lamar.wg.json) for a full-featured example.

---

## 9. Validation

### 9.1 JSON Schema

The official JSON Schema is available at:

- Local: [schema/v0.2.0/wordgrain.schema.json](../schema/v0.2.0/wordgrain.schema.json)
- Remote: `https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json`

### 9.2 Validation Rules

1. Document MUST be valid JSON
2. Document MUST validate against the JSON Schema
3. Document MUST contain at least one of `grains` or `bars`
4. `generated_at` MUST be a valid ISO 8601 datetime
5. `tfidf` and `sentiment_score` MUST be within specified ranges

### 9.3 Validation Commands

```bash
# Using ajv-cli
npx ajv validate -s schema/v0.2.0/wordgrain.schema.json -d your-file.wg.json --spec=draft2020

# Using Python jsonschema
python -m jsonschema -i your-file.wg.json schema/v0.2.0/wordgrain.schema.json
```

---

## 10. Security Considerations

### 10.1 Copyright

- Context lines and bar text SHOULD be limited excerpts (fair use)
- Full lyrics MUST NOT be stored
- Attribution to original artists is RECOMMENDED

### 10.2 Data Validation

- Consumers SHOULD validate input against schema
- Untrusted sources SHOULD be sanitized

---

## 11. Future Extensions

### 11.1 Planned

| Feature | Description |
|---------|-------------|
| `verse` content type | Structured verse-level analysis |
| `embedding` | Word embedding vectors |
| `phonetics` | IPA pronunciation, rhyme patterns |
| `audio_link` | Reference to audio timestamps |

### 11.2 Planned for v1.0.0

| Feature | Description |
|---------|-------------|
| Streaming format | NDJSON for large corpora |
| Binary format | Efficient storage for embeddings |
| Multi-language | Full i18n support |

### 11.3 Extension Mechanism

Custom fields can be added via the `extensions` object:

```json
{
  "word": "drip",
  "extensions": {
    "x-embedding-384": [0.12, -0.34, ...],
    "x-rhyme-group": "drip-trip-flip"
  }
}
```

---

## 12. References

- [RFC 2119](https://tools.ietf.org/html/rfc2119) - Key words
- [JSON Schema](https://json-schema.org/) - Validation
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Datetime
- [ISO 639-1](https://www.iso.org/iso-639-language-codes.html) - Language codes

---

## Appendix A: Change Log

| Version | Date | Changes |
|---------|------|---------|
| v0.1.0 | 2026-02-08 | Initial draft |
| v0.2.0 | 2026-03-06 | Unified document format: added `bars` section, `schema_version` field; `grains` and `bars` are both optional but at least one required |
