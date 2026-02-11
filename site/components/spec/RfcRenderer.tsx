"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Recursively extract plain text from React children. */
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props
        .children
    );
  }
  return "";
}

interface RfcRendererProps {
  markdown: string;
  onHeadings?: (headings: Heading[]) => void;
}

export default function RfcRenderer({
  markdown,
  onHeadings,
}: RfcRendererProps) {
  const headingsRef = useRef<Heading[]>([]);
  const reportedRef = useRef(false);

  // Reset tracking when markdown changes
  useEffect(() => {
    headingsRef.current = [];
    reportedRef.current = false;
  }, [markdown]);

  // Report headings after render
  useEffect(() => {
    if (onHeadings && headingsRef.current.length > 0 && !reportedRef.current) {
      reportedRef.current = true;
      onHeadings(headingsRef.current);
    }
  });

  const createHeadingComponent = (level: number) => {
    const HeadingComponent = (
      props: React.JSX.IntrinsicElements[keyof React.JSX.IntrinsicElements]
    ) => {
      const { children, node: _node, ...rest } = props as Record<
        string,
        unknown
      >;
      const text = extractText(children as React.ReactNode);
      const id = slugify(text);

      // Collect headings for TOC
      if (!reportedRef.current) {
        const exists = headingsRef.current.some((h) => h.id === id);
        if (!exists) {
          headingsRef.current.push({ id, text, level });
        }
      }

      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      return (
        <Tag id={id} className="group scroll-mt-20" {...(rest as object)}>
          {children as React.ReactNode}
          <a
            href={`#${id}`}
            className="ml-2 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
            aria-label={`Link to ${text}`}
          >
            #
          </a>
        </Tag>
      );
    };
    HeadingComponent.displayName = `Heading${level}`;
    return HeadingComponent;
  };

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const components: Components = {
    h1: createHeadingComponent(1) as Components["h1"],
    h2: createHeadingComponent(2) as Components["h2"],
    h3: createHeadingComponent(3) as Components["h3"],
    h4: createHeadingComponent(4) as Components["h4"],
    h5: createHeadingComponent(5) as Components["h5"],
    h6: createHeadingComponent(6) as Components["h6"],
    table({ children, node, ...props }) {
      return (
        <div className="my-4 overflow-x-auto">
          <table {...props} className="min-w-full border-collapse text-sm">
            {children}
          </table>
        </div>
      );
    },
    th({ children, node, ...props }) {
      return (
        <th
          {...props}
          className="border border-zinc-300 bg-zinc-100 px-3 py-2 text-left font-semibold dark:border-zinc-600 dark:bg-zinc-800"
        >
          {children}
        </th>
      );
    },
    td({ children, node, ...props }) {
      return (
        <td {...props} className="border border-zinc-300 px-3 py-2 dark:border-zinc-700">
          {children}
        </td>
      );
    },
    a({ href, children, node, ...props }) {
      return (
        <a
          {...props}
          href={href}
          className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    code({ className, children, node, ...props }) {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            {...props}
            className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre({ children, node, ...props }) {
      return (
        <pre
          {...props}
          className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {children}
        </pre>
      );
    },
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
