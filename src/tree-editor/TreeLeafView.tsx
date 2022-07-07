import React from "react";
import { NamedCSSColor } from "../color";

export function TreeLeafView({
  color,
  handleFocus,
  children,
}: {
  color: NamedCSSColor;
  handleFocus: (color: NamedCSSColor) => void;
  children: React.ReactNode;
}) {
  return (
    <button className="flex items-center" onClick={(_e) => handleFocus(color)}>
      {children}
    </button>
  );
}
