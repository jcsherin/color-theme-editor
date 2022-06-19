import React, { useState } from "react";

interface CopyTextProps {
  label: string;
  content: string;
  expiryInMs: number;
}

interface ClassNameProps {
  className?: string;
  flashClassName?: string;
}

export default function CopyButton({
  label,
  content,
  expiryInMs,
  className,
  flashClassName,
}: CopyTextProps & ClassNameProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (_event: React.MouseEvent) =>
    navigator.clipboard
      .writeText(content)
      .then(() => setCopied(true))
      .then(() => setTimeout(() => setCopied(false), expiryInMs))
      .catch((msg) => console.error(msg));

  if (!navigator || !navigator.clipboard)
    return (
      <span className="py-1 px-4 text-xl text-red-600">
        Copying to clipboard is not supported in this browser!
      </span>
    );

  return copied ? (
    <span className={flashClassName}>Copied to clipboard!</span>
  ) : (
    <button className={className} onClick={handleCopy}>
      {label}
    </button>
  );
}
