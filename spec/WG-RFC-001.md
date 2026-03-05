# WG-RFC-001: WordGrain Specification v0.2.0

| Field | Value |
|-------|-------|
| RFC | WG-RFC-001 |
| Title | WordGrain JSON Format Specification |
| Status | Draft |
| Created | 2026-02-08 |
| Author | Shin Takamatsu |

---

## Abstract

WordGrain is a standardized JSON format for representing vocabulary and lyrical structure data extracted from musical lyrics and other text sources. This specification defines the structure, fields, and validation rules for WordGrain documents at three granularity levels: word (morpheme), bar (phrase/line), and verse (full verse).

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Terminology](#2-terminology)
3. [Specification](#3-specification)
4. [Type Hierarchy](#4-type-hierarchy)
5. [File Conventions](#5-file-conventions)
6. [Versioning](#6-versioning)
7. [MIME Type](#7-mime-type)
8. [Examples](#8-examples)
9. [Validation](#9-validation)
10. [Security Considerations](#10-security-considerations)
11. [Design Decisions](#11-design-decisions)
12. [Future Extensions](#12-future-extensions)
13. [References](#13-references)

---

## 1. Motivation

### 1.1 Problem Statement

Musical lyrics represent a rich linguistic corpus with unique vocabulary, slang evolution, and cultural significance. Currently, there is no standardized format for:

- Exchanging vocabulary analysis data between tools
- Archiving linguistic patterns in musical lyrics
- Building educational and research applications
- Creating interoperable lyric analysis pipelines

### 1.2 Goals

1. **Interoperability**: Enable data exchange between analysis tools
2. **Completeness**: Capture linguistic, statistical, and contextual data
3. **Extensibility**: Allow future additions without breaking changes
4. **Simplicity**: Keep the core format minimal and human-readable
5. **Validation**: Provide machine-verifiable schema

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
| Bar | A phrase or 1-2 line unit of lyrics, named after the musical term for a measure |
| Verse | A full verse section of a song |
| Corpus | The collection of lyrics analyzed to produce grains |
| Context | A specific usage instance of a word in lyrics |
| TF-IDF | Term Frequency-Inverse Document Frequency score |
| Mood | The dominant emotional tone of a bar |

---

## 3. Specification

### 3.1 Document Structure

A WordGrain document is a JSON object whose structure is determined by the `type` field. All document types share these common top-level properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string (URI) | REQUIRED | Schema version URI |
| `schema_version` | string | REQUIRED | Semver version string (e.g., `"0.2.0"`) |
| `type` | string | REQUIRED | Document type: `"word"`, `"bar"`, or `"verse"` |

The remaining properties depend on the `type` value. See [Section 4: Type Hierarchy](#4-type-hierarchy) for details.

#### 3.1.1 Word Document (v0.1.0 compatible)

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "type": "word",
  "meta": { ... },
  "grains": [ ... ]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `meta` | object | REQUIRED | Document metadata |
| `grains` | array | REQUIRED | Array of grain objects |

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

## 4. Type Hierarchy

### 4.1 Overview

WordGrain v0.2.0 introduces a three-level type hierarchy for representing lyrical data at different granularities:

| Type | Granularity | Description |
|------|-------------|-------------|
| `word` | Morpheme/token | Individual vocabulary entries with linguistic metadata. Compatible with v0.1.0. |
| `bar` | Phrase/line (1-2 lines) | A short lyrical unit, typically a measure in musical terms. |
| `verse` | Full verse | A complete verse section. Reserved for future specification. |

The `type` field acts as a discriminator: each type has its own set of required and optional properties.

### 4.2 Bar Type

A `bar` document represents a phrase-level lyrical unit (1-2 lines). This is the primary new type in v0.2.0.

#### 4.2.1 Bar Document Structure

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

#### 4.2.2 Bar Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | REQUIRED | The lyric text of the bar (1-2 lines) |
| `source` | object | REQUIRED | Source attribution (see 4.2.3) |
| `metrics` | object | OPTIONAL | Quantitative metrics (see 4.2.4) |
| `semantics` | object | OPTIONAL | Semantic attributes (see 4.2.5) |
| `language` | string | OPTIONAL | ISO 639-1 language code (default: `"en"`) |

#### 4.2.3 Source Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `artist` | string | REQUIRED | Artist name |
| `track` | string | REQUIRED | Track/song title |
| `album` | string | OPTIONAL | Album name |
| `year` | integer | OPTIONAL | Release year (1-2200) |
| `featuring` | string[] | OPTIONAL | Featured artists |

#### 4.2.4 Metrics Object

| Field | Type | Description |
|-------|------|-------------|
| `lines` | integer | Number of lines in the bar (>= 1) |
| `syllables` | integer | Total syllable count (>= 0) |
| `mora` | integer or null | Mora count for mora-timed languages (e.g., Japanese). Null if not applicable. |

#### 4.2.5 Semantics Object

| Field | Type | Description |
|-------|------|-------------|
| `mood` | string | The dominant mood/emotional tone (see 4.2.6) |

#### 4.2.6 Mood Enum

The `mood` field captures the dominant emotional tone of a bar. It uses a curated set of 8 values chosen to represent the emotional spectrum commonly found in hip-hop and related genres:

| Value | Description |
|-------|-------------|
| `cold` | Cool, detached, controlled menace |
| `defiant` | Rebellious, resistant, confrontational |
| `melancholic` | Sad, reflective, sorrowful |
| `aggressive` | Hostile, intense, hard-hitting |
| `introspective` | Self-examining, thoughtful, philosophical |
| `celebratory` | Triumphant, joyful, boastful |
| `tender` | Gentle, vulnerable, affectionate |
| `weary` | Tired, worn, resigned |

### 4.3 Verse Type

The `verse` type is reserved for representing full verse sections. Its detailed schema will be defined in a future version. Currently, `verse` documents require only the common top-level fields (`$schema`, `schema_version`, `type`) and allow additional properties.

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

### 8.1 Minimal Valid Document (Word Type)

```json
{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json",
  "schema_version": "0.2.0",
  "type": "word",
  "meta": {
    "source": "manual",
    "artist": "Example Artist",
    "generated_at": "2026-02-08T00:00:00Z"
  },
  "grains": []
}
```

### 8.2 Bar Type Example

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

### 8.3 Complete Word Example

See [examples/kendrick-lamar.wg.json](../examples/kendrick-lamar.wg.json) for a full-featured word-type example.

---

## 9. Validation

### 9.1 JSON Schema

The official JSON Schema is available at:

- Local: [schema/v0.2.0/wordgrain.schema.json](../schema/v0.2.0/wordgrain.schema.json)
- Remote: `https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.2.0/wordgrain.schema.json`

### 9.2 Validation Rules

1. Document MUST be valid JSON
2. Document MUST validate against the JSON Schema
3. `generated_at` MUST be a valid ISO 8601 datetime
4. `tfidf` and `sentiment_score` MUST be within specified ranges

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

- Context lines SHOULD be limited excerpts (fair use)
- Full lyrics MUST NOT be stored
- Attribution to original artists is RECOMMENDED

### 10.2 Data Validation

- Consumers SHOULD validate input against schema
- Untrusted sources SHOULD be sanitized

---

## 11. Design Decisions

This section records key design decisions made in v0.2.0 and their rationale.

### 11.1 "bar" over "phrase"

The term **bar** was chosen over "phrase" for the line-level type. In music, a "bar" (or measure) is a natural unit of rhythmic structure. Since WordGrain is designed for lyric analysis in hip-hop and related genres, the musical terminology is more intuitive and idiomatic for the target audience. "Phrase" is a more generic linguistic term that lacks this musical connotation.

### 11.2 No `vector` / `embedding` field

Embedding vectors were considered for v0.2.0 but ultimately excluded. Reasons:

- **Size**: Embedding vectors (e.g., 384 or 768 dimensions) would dramatically increase file size, conflicting with the goal of human-readable, lightweight JSON files.
- **Volatility**: Embedding models evolve rapidly; baking a specific model's output into the schema would create tight coupling.
- **Scope**: Embeddings are better served by dedicated vector stores or the `extensions` field for experimental use.

### 11.3 Simplified `semantics` (no `intensity`, no `tags`)

Earlier drafts included `intensity` (a numeric scale) and `tags` (free-form string array) in the `semantics` object. These were removed:

- **`intensity`**: Subjective and difficult to calibrate consistently across annotators. The `mood` enum alone provides sufficient signal.
- **`tags`**: Too open-ended, leading to inconsistent and noisy data. Structured fields (like `mood`) are preferred for interoperability.

The `semantics` object now contains only `mood`, keeping it focused and reliable.

---

## 12. Future Extensions

### 12.1 Planned for v0.3.0+

| Feature | Description |
|---------|-------------|
| `verse` type detail | Full schema for verse-level documents |
| `phonetics` | IPA pronunciation, rhyme patterns |
| `audio_link` | Reference to audio timestamps |

### 12.2 Planned for v1.0.0

| Feature | Description |
|---------|-------------|
| Streaming format | NDJSON for large corpora |
| Binary format | Efficient storage for embeddings |
| Multi-language | Full i18n support |

### 12.3 Extension Mechanism

Custom fields can be added via the `extensions` object in word-type documents:

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

## 13. References

- [RFC 2119](https://tools.ietf.org/html/rfc2119) - Key words
- [JSON Schema](https://json-schema.org/) - Validation
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Datetime
- [ISO 639-1](https://www.iso.org/iso-639-language-codes.html) - Language codes

---

## Appendix A: Change Log

| Version | Date | Changes |
|---------|------|---------|
| v0.2.0 | 2026-03-05 | Add type hierarchy (word/bar/verse), bar type with source/metrics/semantics, mood enum, schema_version field, design decisions section |
| v0.1.0 | 2026-02-08 | Initial draft |
