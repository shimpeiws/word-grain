# WG-RFC-001: WordGrain Specification v0.1.0

| Field | Value |
|-------|-------|
| RFC | WG-RFC-001 |
| Title | WordGrain JSON Format Specification |
| Status | Draft |
| Created | 2026-02-08 |
| Author | Shin Takamatsu |

---

## Abstract

WordGrain is a standardized JSON format for representing vocabulary data extracted from musical lyrics and other text sources. This specification defines the structure, fields, and validation rules for WordGrain documents.

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Terminology](#2-terminology)
3. [Specification](#3-specification)
4. [File Conventions](#4-file-conventions)
5. [Versioning](#5-versioning)
6. [MIME Type](#6-mime-type)
7. [Examples](#7-examples)
8. [Validation](#8-validation)
9. [Security Considerations](#9-security-considerations)
10. [Future Extensions](#10-future-extensions)
11. [References](#11-references)

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
| Corpus | The collection of lyrics analyzed to produce grains |
| Context | A specific usage instance of a word in lyrics |
| TF-IDF | Term Frequency-Inverse Document Frequency score |

---

## 3. Specification

### 3.1 Document Structure

A WordGrain document is a JSON object with three top-level properties:

```json
{
  "$schema": "https://example.com/schemas/wordgrain/v0.1.0",
  "meta": { ... },
  "grains": [ ... ]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `$schema` | string (URI) | REQUIRED | Schema version URI |
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

## 4. File Conventions

### 4.1 File Extension

WordGrain files SHOULD use the `.wg.json` extension:

```
kendrick-lamar.wg.json
wu-tang-clan.wg.json
```

### 4.2 Naming Conventions

| Pattern | Example | Use Case |
|---------|---------|----------|
| `{artist-slug}.wg.json` | `kendrick-lamar.wg.json` | Single artist |
| `{artist-slug}-{album-slug}.wg.json` | `kendrick-lamar-damn.wg.json` | Single album |
| `{collection-name}.wg.json` | `west-coast-2020s.wg.json` | Curated collection |

Slugs SHOULD be lowercase, hyphen-separated ASCII.

### 4.3 Encoding

Files MUST be encoded as UTF-8 without BOM.

---

## 5. Versioning

### 5.1 Schema Version

The `$schema` field indicates the specification version:

```
https://example.com/schemas/wordgrain/v{MAJOR}.{MINOR}.{PATCH}
```

### 5.2 Semantic Versioning Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking change to required fields | MAJOR | v1.0.0 -> v2.0.0 |
| New optional fields | MINOR | v0.1.0 -> v0.2.0 |
| Documentation/typo fixes | PATCH | v0.1.0 -> v0.1.1 |

### 5.3 Compatibility

- Consumers SHOULD ignore unknown fields for forward compatibility
- Producers MUST NOT remove required fields in minor versions

---

## 6. MIME Type

Recommended MIME type: `application/vnd.wordgrain+json`

Until registered, use: `application/json`

---

## 7. Examples

### 7.1 Minimal Valid Document

```json
{
  "$schema": "https://example.com/schemas/wordgrain/v0.1.0",
  "meta": {
    "source": "manual",
    "artist": "Example Artist",
    "generated_at": "2026-02-08T00:00:00Z"
  },
  "grains": []
}
```

### 7.2 Complete Example

See [examples/kendrick-lamar.wg.json](../examples/kendrick-lamar.wg.json) for a full-featured example.

---

## 8. Validation

### 8.1 JSON Schema

The official JSON Schema is available at:

- Local: [schema/wordgrain.schema.json](../schema/wordgrain.schema.json)
- Remote: `https://example.com/schemas/wordgrain/v0.1.0/wordgrain.schema.json`

### 8.2 Validation Rules

1. Document MUST be valid JSON
2. Document MUST validate against the JSON Schema
3. `generated_at` MUST be a valid ISO 8601 datetime
4. `tfidf` and `sentiment_score` MUST be within specified ranges

### 8.3 Validation Commands

```bash
# Using ajv-cli
npx ajv validate -s schema/wordgrain.schema.json -d your-file.wg.json --spec=draft2020

# Using Python jsonschema
python -m jsonschema -i your-file.wg.json schema/wordgrain.schema.json
```

---

## 9. Security Considerations

### 9.1 Copyright

- Context lines SHOULD be limited excerpts (fair use)
- Full lyrics MUST NOT be stored
- Attribution to original artists is RECOMMENDED

### 9.2 Data Validation

- Consumers SHOULD validate input against schema
- Untrusted sources SHOULD be sanitized

---

## 10. Future Extensions

### 10.1 Planned for v0.2.0

| Feature | Description |
|---------|-------------|
| `embedding` | Word embedding vectors |
| `phonetics` | IPA pronunciation, rhyme patterns |
| `audio_link` | Reference to audio timestamps |

### 10.2 Planned for v1.0.0

| Feature | Description |
|---------|-------------|
| Streaming format | NDJSON for large corpora |
| Binary format | Efficient storage for embeddings |
| Multi-language | Full i18n support |

### 10.3 Extension Mechanism

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

## 11. References

- [RFC 2119](https://tools.ietf.org/html/rfc2119) - Key words
- [JSON Schema](https://json-schema.org/) - Validation
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Datetime
- [ISO 639-1](https://www.iso.org/iso-639-language-codes.html) - Language codes

---

## Appendix A: Change Log

| Version | Date | Changes |
|---------|------|---------|
| v0.1.0 | 2026-02-08 | Initial draft |
