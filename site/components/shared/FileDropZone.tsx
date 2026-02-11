"use client";

import { useCallback, useState } from "react";

interface FileDropZoneProps {
  onFileLoad: (content: string, filename: string) => void;
  accept?: string;
}

export default function FileDropZone({
  onFileLoad,
  accept = ".json,.wg.json",
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          onFileLoad(text, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onFileLoad]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        dragging
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
          : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
      }`}
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Drop a <code className="font-mono">.wg.json</code> file here, or{" "}
        <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          browse
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </p>
    </div>
  );
}
