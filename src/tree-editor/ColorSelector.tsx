import type { NamedCSSColor } from "../color";

import React from "react";
import { TreeLeafView } from "./TreeLeafView";

interface ColorSelectorProps {
  color: NamedCSSColor;
  handleFocus: (color: NamedCSSColor) => void;
}

export function ColorSelector({ color, handleFocus }: ColorSelectorProps) {
  return (
    <TreeLeafView color={color} key={color.id} handleFocus={handleFocus}>
      <span className="mr-4">"{color.name ? color.name : color.cssValue}"</span>
      <span className="mr-4">:</span>
      <span
        className="w-4 h-4 inline-block mr-2 rounded-sm"
        style={{ backgroundColor: color.cssValue }}
      ></span>
      <span>{color.cssValue},</span>
    </TreeLeafView>
  );
}
