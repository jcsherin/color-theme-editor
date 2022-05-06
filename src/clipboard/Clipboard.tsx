import React, { useState } from "react";

interface CopyTextProps {
  label: string;
  contents: string;
  timeoutInMs: number;
}

const clipboardWriteText = (text: string) =>
  navigator && navigator.clipboard
    ? navigator.clipboard.writeText(text)
    : Promise.reject(
        new Error("Copying to clipboard not supported in browser!")
      );

export default function Clipboard({
  label,
  contents,
  timeoutInMs,
}: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (_event: React.MouseEvent) =>
    clipboardWriteText(contents)
      .then(() => setCopied(true))
      .then(() =>
        setTimeout(() => {
          setCopied(false);
        }, timeoutInMs)
      )
      .catch((msg) => console.error(msg));

  return copied ? (
    <span className="text-green-800 text-xl py-1 px-4">Copied!</span>
  ) : (
    <button
      className=" text-blue-500 hover:text-blue-800 text-xl py-1 px-4"
      onClick={handleCopy}
    >
      {label}
    </button>
  );
}
