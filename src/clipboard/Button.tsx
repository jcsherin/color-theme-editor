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

export default function Button({
  label,
  content,
  expiryInMs,
  className,
  flashClassName,
}: CopyTextProps & ClassNameProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    if (!(navigator && navigator.clipboard))
      return Promise.reject(
        new Error(
          "The `navigator.clipboard` Web API is not supported in this browser!"
        )
      );

    return navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .then(() => setTimeout(() => setCopied(false), expiryInMs));
  };

  const handleCopy = (_event: React.MouseEvent) =>
    copyToClipboard(content).catch((msg) => console.error(msg));

  return copied ? (
    <span className={flashClassName}>Copied!</span>
  ) : (
    <button className={className} onClick={handleCopy}>
      {label}
    </button>
  );
}
