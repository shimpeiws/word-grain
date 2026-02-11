import HeroSection from "@/components/landing/HeroSection";
import SchemaOverview from "@/components/landing/SchemaOverview";
import FeatureCards from "@/components/landing/FeatureCards";

const EXAMPLE_JSON = `{
  "$schema": "https://raw.githubusercontent.com/shimpeiws/word-grain/main/schema/v0.1.0/wordgrain.schema.json",
  "meta": {
    "source": "genius",
    "artist": "Kendrick Lamar",
    "corpus_size": 142,
    "total_words": 89420,
    "generated_at": "2026-02-08T12:00:00Z",
    "generator": "wordgrain-cli/0.1.0",
    "language": "en",
    "description": "Vocabulary analysis of Kendrick Lamar's studio albums (2011-2024)"
  },
  "grains": [
    {
      "word": "hustle",
      "normalized": "hustle",
      "pos": "noun",
      "frequency": 47,
      "tfidf": 0.82,
      "sentiment": "positive",
      "categories": ["work", "struggle", "ambition"],
      "contexts": [
        {
          "line": "The hustle never sleeps, I grind until the sun comes up",
          "track": "Money Trees",
          "album": "good kid, m.A.A.d city",
          "year": 2012
        }
      ]
    }
  ]
}`;

export default function Home() {
  return (
    <>
      <HeroSection />
      <SchemaOverview />

      {/* JSON Preview Section */}
      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              What It Looks Like
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              A WordGrain file for Kendrick Lamar&apos;s discography.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-lg dark:border-zinc-700">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <span className="ml-2 font-mono text-xs text-zinc-400">
                kendrick-lamar.wg.json
              </span>
            </div>

            {/* Code block */}
            <div className="overflow-x-auto p-4 sm:p-6">
              <pre className="font-mono text-sm leading-relaxed">
                <code>
                  {EXAMPLE_JSON.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      <span className="mr-4 inline-block w-6 text-right text-zinc-600 select-none">
                        {i + 1}
                      </span>
                      <JsonLine line={line} />
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <FeatureCards />
    </>
  );
}

/**
 * Minimal JSON syntax highlighter using spans with Tailwind classes.
 * Handles keys, string values, numbers, and keywords (true/false/null).
 */
function JsonLine({ line }: { line: string }) {
  const tokens: React.ReactNode[] = [];
  let remaining = line;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Match a JSON key: "key":
    const keyMatch = remaining.match(/^(\s*")((?:[^"\\]|\\.)*)(":\s*)/);
    if (keyMatch) {
      tokens.push(
        <span key={keyIdx++} className="text-zinc-500">{keyMatch[1]}</span>,
        <span key={keyIdx++} className="text-blue-400">{keyMatch[2]}</span>,
        <span key={keyIdx++} className="text-zinc-500">{keyMatch[3]}</span>
      );
      remaining = remaining.slice(keyMatch[0].length);
      continue;
    }

    // Match a string value: "..."
    const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
    if (strMatch) {
      tokens.push(
        <span key={keyIdx++} className="text-green-400">{strMatch[1]}</span>
      );
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Match a number
    const numMatch = remaining.match(/^(-?\d+(?:\.\d+)?)/);
    if (numMatch) {
      tokens.push(
        <span key={keyIdx++} className="text-amber-400">{numMatch[1]}</span>
      );
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Match boolean / null
    const boolMatch = remaining.match(/^(true|false|null)/);
    if (boolMatch) {
      tokens.push(
        <span key={keyIdx++} className="text-purple-400">{boolMatch[1]}</span>
      );
      remaining = remaining.slice(boolMatch[0].length);
      continue;
    }

    // Take one character as punctuation / whitespace
    tokens.push(
      <span key={keyIdx++} className="text-zinc-500">{remaining[0]}</span>
    );
    remaining = remaining.slice(1);
  }

  return <>{tokens}</>;
}
