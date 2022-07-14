import React from "react";
import { useEffect, useRef, useState } from "react";

import type { NamedCSSColor } from "../color";
import type { ColorIterator } from "./colorIterator";

export function ColorInput({
  color,
  focus,
  handleRenameColor,
  handleKeyboardNavigate,
  colorIterator,
  children,
}: {
  color: NamedCSSColor;
  focus: boolean;
  handleRenameColor: (colorId: string, name: string) => void;
  handleKeyboardNavigate: (key: string, target: string) => void;
  colorIterator: ColorIterator;
  children?: React.ReactNode;
}) {
  const [value, setValue] = useState(color.name);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (focus && renameRef && renameRef.current) {
        renameRef.current.focus();
        renameRef.current.select();
      }
    }, 20);
  }, [focus]);

  return (
    <div className="my-2 h-10 flex items-center">
      <input
        ref={renameRef}
        type="text"
        placeholder={`Rename ${color.name ? color.name : color.cssValue}`}
        value={value}
        onChange={(event) => {
          const newValue = event.currentTarget.value;
          setValue(newValue);
        }}
        onKeyDown={(event) => {
          const key = event.key;
          if (key === "Enter") {
            const name = event.currentTarget.value.trim();
            if (name.length > 0) {
              handleRenameColor(color.id, name);
            }
            handleKeyboardNavigate(key, colorIterator.next(color).id);
          } else if (key === "ArrowDown") {
            handleKeyboardNavigate(key, colorIterator.next(color).id);
          } else if (key === "ArrowUp") {
            handleKeyboardNavigate(key, colorIterator.prev(color).id);
          } else if (key === "Escape") {
            // refactor: the 2nd arg `next` is unused
            handleKeyboardNavigate(key, colorIterator.next(color).id);
          }
        }}
        className="py-2 pl-4 mr-4 w-1/2 text-black"
      />
      <span className="mr-4">:</span>
      <span
        className="w-4 h-4 inline-block mr-2 rounded-sm"
        style={{ backgroundColor: color.cssValue }}
      ></span>
      <span className="mr-4">{color.cssValue},</span>
      {children}
    </div>
  );
}
