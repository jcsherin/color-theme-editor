import React from "react";

export function TreeLeafView({
  colorId,
  handleFocus,
  children,
}: {
  colorId: string;
  handleFocus: (colorId: string) => void;
  children: React.ReactNode;
}) {
  return (
    <button className="my-2 block h-10" onClick={(_e) => handleFocus(colorId)}>
      {children}
    </button>
  );
}
