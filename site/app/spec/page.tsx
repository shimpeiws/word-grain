"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import RfcRenderer, { type Heading } from "@/components/spec/RfcRenderer";
import SchemaPropertyTable from "@/components/spec/SchemaPropertyTable";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/word-grain";

/* -------------------------------------------------------------------------- */
/*  TOC Sidebar                                                                */
/* -------------------------------------------------------------------------- */

function TocSidebar({
  headings,
  activeId,
  mobile,
}: {
  headings: Heading[];
  activeId: string;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const tocContent = (
    <nav aria-label="Table of contents">
      <ul className="space-y-1 text-sm">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                  history.replaceState(null, "", `#${h.id}`);
                }
                if (mobile) setOpen(false);
              }}
              className={`block rounded px-2 py-1 transition-colors ${
                activeId === h.id
                  ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (mobile) {
    return (
      <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-700 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
        >
          On this page
          <span className="text-zinc-400">{open ? "\u25BE" : "\u25B8"}</span>
        </button>
        {open && <div className="px-4 pb-4">{tocContent}</div>}
      </div>
    );
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          On this page
        </p>
        {tocContent}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Spec Page                                                             */
/* -------------------------------------------------------------------------- */

export default function SpecPage() {
  const [markdown, setMarkdown] = useState<string>("");
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch markdown and schema on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [mdRes, schemaRes] = await Promise.all([
          fetch(`${BASE_PATH}/spec/WG-RFC-001.md`),
          fetch(`${BASE_PATH}/schema/v0.1.0/wordgrain.schema.json`),
        ]);

        if (!mdRes.ok) throw new Error(`Failed to load spec: ${mdRes.status}`);
        if (!schemaRes.ok)
          throw new Error(`Failed to load schema: ${schemaRes.status}`);

        const [mdText, schemaJson] = await Promise.all([
          mdRes.text(),
          schemaRes.json(),
        ]);

        setMarkdown(mdText);
        setSchema(schemaJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Set up IntersectionObserver for active TOC heading
  useEffect(() => {
    if (headings.length === 0) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    observerRef.current = observer;

    // Observe all heading elements
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleHeadings = useCallback((extracted: Heading[]) => {
    // Filter to h2 and h3 for TOC
    const tocHeadings = extracted.filter((h) => h.level === 2 || h.level === 3);
    setHeadings(tocHeadings);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          <span className="text-zinc-500">Loading specification...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Mobile TOC */}
      {headings.length > 0 && (
        <TocSidebar headings={headings} activeId={activeId} mobile />
      )}

      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
        {/* Main content */}
        <div className="min-w-0">
          <RfcRenderer markdown={markdown} onHeadings={handleHeadings} />

          {/* Schema Reference Section */}
          {schema && (
            <section id="schema-reference" className="mt-12 scroll-mt-20">
              <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Schema Reference
              </h2>
              <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                Interactive reference for the WordGrain JSON Schema definitions.
                Each section below corresponds to a type defined in{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono dark:bg-zinc-800">
                  wordgrain.schema.json
                </code>
                .
              </p>
              <SchemaPropertyTable schema={schema} />
            </section>
          )}
        </div>

        {/* Desktop TOC sidebar */}
        {headings.length > 0 && (
          <TocSidebar headings={headings} activeId={activeId} />
        )}
      </div>
    </div>
  );
}
