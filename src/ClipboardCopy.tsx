import { useState } from "react";
import { Button } from "./Button";

interface ClipboardCopyProps {
  text: string;
}

export function ClipboardCopy({ text }: ClipboardCopyProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copy(text: string) {
    return await navigator.clipboard.writeText(text);
  }

  const handleCopy = () => {
    copy(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return isCopied ? (
    <p className="text-green-800 px-8 py-2 mb-2">Copied!</p>
  ) : (
    <Button
      label="Copy Tailwind Config"
      handleClick={handleCopy}
      className="bg-blue-500 hover:bg-blue-800 text-slate-200 hover:text-slate-500 px-8 py-2 mb-2"
    />
  );
}
