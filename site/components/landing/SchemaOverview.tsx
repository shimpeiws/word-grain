const MAIN_COL = 300;
const SUB_COL = 200;

export default function SchemaOverview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Document Structure
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
          A WordGrain document is a JSON file with a simple, well-defined
          hierarchy.
        </p>
      </div>

      {/* Desktop Tree */}
      <div className="mt-12 hidden justify-center overflow-x-auto sm:flex">
        <div className="flex flex-col items-center">
          <TreeNode
            label="Document"
            type="object"
            accent
            fields={["$schema", "meta", "grains[]"]}
          />

          <TreeConnector cols={2} colWidth={MAIN_COL} />

          <div className="flex" style={{ width: MAIN_COL * 2 }}>
            {/* meta column */}
            <div
              style={{ width: MAIN_COL }}
              className="flex flex-col items-center"
            >
              <TreeNode
                label="meta"
                type="object"
                fields={[
                  "source: string",
                  "artist: string",
                  "corpus_size: integer",
                  "total_words: integer",
                  "generated_at: date-time",
                  "generator: string",
                  "language: string",
                  "description: string",
                ]}
              />
            </div>

            {/* grains column */}
            <div
              style={{ width: MAIN_COL }}
              className="flex flex-col items-center"
            >
              <TreeNode
                label="grains[]"
                type="array"
                fields={[
                  "word: string *",
                  "normalized: string",
                  "pos: enum",
                  "frequency: integer",
                  "tfidf: number",
                  "sentiment: enum",
                  "categories: string[]",
                  "contexts: Context[]",
                  "collocations: Collocation[]",
                ]}
              />

              <TreeConnector cols={2} colWidth={SUB_COL} />

              <div className="flex" style={{ width: SUB_COL * 2 }}>
                <div
                  style={{ width: SUB_COL }}
                  className="flex flex-col items-center"
                >
                  <TreeNode
                    label="Context"
                    type="object"
                    small
                    fields={[
                      "line: string *",
                      "track: string",
                      "album: string",
                      "year: integer",
                    ]}
                  />
                </div>
                <div
                  style={{ width: SUB_COL }}
                  className="flex flex-col items-center"
                >
                  <TreeNode
                    label="Collocation"
                    type="object"
                    small
                    fields={[
                      "word: string *",
                      "score: number *",
                      "position: enum",
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tree */}
      <div className="mt-12 flex flex-col items-center sm:hidden">
        <TreeNode
          label="Document"
          type="object"
          accent
          fields={["$schema", "meta", "grains[]"]}
        />
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
        <TreeNode
          label="meta"
          type="object"
          fields={[
            "source: string",
            "artist: string",
            "corpus_size: integer",
            "total_words: integer",
            "generated_at: date-time",
            "generator: string",
            "language: string",
            "description: string",
          ]}
        />
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
        <TreeNode
          label="grains[]"
          type="array"
          fields={[
            "word: string *",
            "normalized: string",
            "pos: enum",
            "frequency: integer",
            "tfidf: number",
            "sentiment: enum",
            "categories: string[]",
            "contexts: Context[]",
            "collocations: Collocation[]",
          ]}
        />
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
        <div className="flex gap-4">
          <TreeNode
            label="Context"
            type="object"
            small
            fields={[
              "line: string *",
              "track: string",
              "album: string",
              "year: integer",
            ]}
          />
          <TreeNode
            label="Collocation"
            type="object"
            small
            fields={[
              "word: string *",
              "score: number *",
              "position: enum",
            ]}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30" />
          Root document
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800" />
          Object / Array
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
            *
          </span>
          Required field
        </div>
      </div>
    </section>
  );
}

/**
 * SVG connector that draws a T-shaped branch from a parent node
 * to `cols` child nodes arranged in equal-width columns.
 *
 *        |           ← vertical stem (from parent center)
 *    ────┼────       ← horizontal bar
 *    |       |       ← vertical drops (to each child center)
 */
function TreeConnector({
  cols,
  colWidth,
}: {
  cols: number;
  colWidth: number;
}) {
  const totalWidth = cols * colWidth;
  const barWidth = (cols - 1) * colWidth;
  const h = 40;
  const mid = h / 2;

  return (
    <div className="flex justify-center" style={{ width: totalWidth }}>
      <svg
        width={barWidth}
        height={h}
        className="block text-zinc-300 dark:text-zinc-600"
        style={{ overflow: "visible" }}
      >
        {/* Vertical stem from parent center */}
        <line
          x1={barWidth / 2}
          y1={0}
          x2={barWidth / 2}
          y2={mid}
          stroke="currentColor"
          strokeWidth={1}
        />
        {/* Horizontal bar */}
        <line
          x1={0}
          y1={mid}
          x2={barWidth}
          y2={mid}
          stroke="currentColor"
          strokeWidth={1}
        />
        {/* Vertical drops to children */}
        {Array.from({ length: cols }, (_, i) => (
          <line
            key={i}
            x1={i * colWidth}
            y1={mid}
            x2={i * colWidth}
            y2={h}
            stroke="currentColor"
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}

function TreeNode({
  label,
  type,
  fields,
  accent,
  small,
}: {
  label: string;
  type: string;
  fields: string[];
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border shadow-sm ${
        accent
          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/80"
      } ${small ? "w-44 p-3" : "w-64 p-4"}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`font-mono font-bold ${
            accent
              ? "text-blue-700 dark:text-blue-300"
              : "text-zinc-800 dark:text-zinc-200"
          } ${small ? "text-xs" : "text-sm"}`}
        >
          {label}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs ${
            accent
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
          }`}
        >
          {type}
        </span>
      </div>
      <ul
        className={`mt-2 space-y-0.5 font-mono text-zinc-600 dark:text-zinc-400 ${
          small ? "text-[10px]" : "text-xs"
        }`}
      >
        {fields.map((field) => (
          <li key={field} className="truncate">
            {field}
          </li>
        ))}
      </ul>
    </div>
  );
}
