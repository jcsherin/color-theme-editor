import type { NamedCSSColor } from "../color";

import React from "react";
import { SelectableItem } from "./index";

interface SelectableProps {
  color: NamedCSSColor;
  selectableItem: SelectableItem;
  handleSelection: (selectableItem: SelectableItem) => void;
}

interface ClassNameProps {
  className?: string;
}

export function Selectable({
  className = "",
  color,
  selectableItem,
  handleSelection,
}: SelectableProps & ClassNameProps) {
  const getClassName = (selectable: SelectableItem): string => {
    switch (selectable.status) {
      case "selected":
        return "border-4 border-neutral-500";
      case "default":
        return "border-4 border-transparent";
      case "grouped":
        return "hidden";
    }
  };

  return (
    <button
      className={`${className} ${getClassName(selectableItem)}`}
      onClick={(_event) => handleSelection(selectableItem)}
    >
      <span
        className="w-16 h-12 block border-b"
        style={{ backgroundColor: color.cssValue }}
      ></span>
      <span className="block text-xs text-center truncate bg-black text-white">
        {color.cssValue}
      </span>
    </button>
  );
}
