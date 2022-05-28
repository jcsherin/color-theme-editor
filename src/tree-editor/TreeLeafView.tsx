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
    <button className="flex items-center" onClick={(_e) => handleFocus(colorId)}>
      {children}
    </button>
  );
}
