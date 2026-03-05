export interface Context {
  line: string;
  track?: string;
  album?: string;
  year?: number;
  featuring?: string[];
  timestamp?: string;
}

export interface Collocation {
  word: string;
  score: number;
  position?: "before" | "after" | "either";
}

export interface Grain {
  word: string;
  normalized?: string;
  pos?:
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "pronoun"
    | "preposition"
    | "conjunction"
    | "interjection"
    | "determiner"
    | "particle"
    | "other";
  frequency?: number;
  frequency_normalized?: number;
  tfidf?: number;
  sentiment?: "positive" | "negative" | "neutral" | "mixed";
  sentiment_score?: number;
  categories?: string[];
  is_slang?: boolean;
  etymology?: string;
  definition?: string;
  contexts?: Context[];
  first_seen?: string;
  collocations?: Collocation[];
  extensions?: Record<string, unknown>;
}

export interface Meta {
  source: string;
  artist: string;
  artists?: string[];
  corpus_size?: number;
  total_words?: number;
  generated_at: string;
  generator?: string;
  language?: string;
  description?: string;
}

export interface BarSource {
  track: string;
  album?: string;
  year?: number;
  featuring?: string[];
  timestamp?: string;
}

export interface BarMetrics {
  syllable_count?: number;
  word_count?: number;
  rhyme_density?: number;
}

export interface BarSemantics {
  mood?:
    | "aggressive"
    | "melancholic"
    | "triumphant"
    | "reflective"
    | "humorous"
    | "romantic"
    | "defiant"
    | "hopeful"
    | "dark"
    | "celebratory";
  themes?: string[];
  techniques?: string[];
}

export interface Bar {
  text: string;
  source: BarSource;
  metrics?: BarMetrics;
  semantics?: BarSemantics;
  language?: string;
}

export interface WordGrainDocument {
  $schema: string;
  schema_version: string;
  meta: Meta;
  grains?: Grain[];
  bars?: Bar[];
}
