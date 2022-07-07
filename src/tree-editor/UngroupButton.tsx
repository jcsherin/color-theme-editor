import type { NamedCSSColor } from "../color";

import React from "react";

interface UngroupButtonProps {
  groupName: string;
  color: NamedCSSColor;
  handleRemoveFromGroup: (colorId: string, groupName: string) => void;
}

export function UngroupButton({
  groupName,
  color,
  handleRemoveFromGroup,
}: UngroupButtonProps) {
  return (
    <button
      className="py-1 px-4 text-red-100 hover:text-red-300 bg-red-600 hover:bg-red-800 font-sans rounded-sm"
      onClick={(_e) => handleRemoveFromGroup(color.id, groupName)}
    >
      Remove
    </button>
  );
}
