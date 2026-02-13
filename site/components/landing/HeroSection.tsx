import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl dark:text-zinc-50">
            WordGrain
          </h1>
          <p className="mt-6 text-xl text-zinc-600 sm:text-2xl dark:text-zinc-400">
            A JSON format for vocabulary data from musical lyrics
          </p>
          <p className="mt-4 max-w-2xl text-base text-zinc-500 dark:text-zinc-500">
            WordGrain defines a standardized schema for storing vocabulary data
            extracted from musical lyrics -- word frequencies, sentiment, usage
            contexts, and more.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/spec"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Read the Spec
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/explorer"
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Try the Explorer
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Decorative code snippet */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="w-96 rounded-lg border border-zinc-200/60 bg-white/70 p-8 font-mono text-base text-zinc-400 shadow-sm backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-900/70 dark:text-zinc-600">
            <div className="text-zinc-500 dark:text-zinc-500">
              {"{"} <span className="text-blue-600 dark:text-blue-400">&quot;word&quot;</span>: <span className="text-green-600 dark:text-green-400">&quot;hustle&quot;</span>,
            </div>
            <div className="ml-6 text-zinc-500 dark:text-zinc-500">
              <span className="text-blue-600 dark:text-blue-400">&quot;frequency&quot;</span>: <span className="text-amber-600 dark:text-amber-400">47</span>,
            </div>
            <div className="ml-6 text-zinc-500 dark:text-zinc-500">
              <span className="text-blue-600 dark:text-blue-400">&quot;sentiment&quot;</span>: <span className="text-green-600 dark:text-green-400">&quot;positive&quot;</span>,
            </div>
            <div className="ml-6 text-zinc-500 dark:text-zinc-500">
              <span className="text-blue-600 dark:text-blue-400">&quot;tfidf&quot;</span>: <span className="text-amber-600 dark:text-amber-400">0.82</span>
            </div>
            <div className="text-zinc-500 dark:text-zinc-500">{"}"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
