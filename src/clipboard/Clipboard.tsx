import React, { useState } from "react";

interface CopyTextProps {
  label: string;
  content: string;
  timeoutInMs: number;
}

interface ClassNameProps {
  className?: string;
  flashClassName?: string;
}

const clipboardWriteText = (text: string) =>
  navigator && navigator.clipboard
    ? navigator.clipboard.writeText(text)
    : Promise.reject(
        new Error(
          "The `navigator.clipboard` Web API is not supported in this browser!"
        )
      );

export default function Clipboard({
  label,
  content,
  timeoutInMs,
  className,
  flashClassName: flashMsgClassName,
}: CopyTextProps & ClassNameProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (_event: React.MouseEvent) =>
    clipboardWriteText(content)
      .then(() => setCopied(true))
      .then(() =>
        setTimeout(() => {
          setCopied(false);
        }, timeoutInMs)
      )
      .catch((msg) => console.error(msg));

  return copied ? (
    <span className={flashMsgClassName}>Copied!</span>
  ) : (
    <button className={className} onClick={handleCopy}>
      {label}
    </button>
  );
}
