"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
      <span className="text-sm text-zinc-500">Loading editor...</span>
    </div>
  ),
});

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

export default function JsonEditor({
  value,
  onChange,
  height = "400px",
  readOnly = false,
}: JsonEditorProps) {
  return (
    <MonacoEditor
      height={height}
      language="json"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
}
