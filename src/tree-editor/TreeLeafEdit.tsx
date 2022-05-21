import React from "react";
import { useEffect, useRef, useState } from "react";
import { getColorId, getColorName, getColorValue, HexColor } from "../color";

export function TreeLeafEdit({
  color,
  focus,
  handleRenameColor,
  handleKeyboardNavigate,
  prev,
  next,
  children,
}: {
  color: HexColor;
  focus: boolean;
  handleRenameColor: (colorId: string, name: string) => void;
  handleKeyboardNavigate: (key: string, target: string) => void;
  prev: string;
  next: string;
  children?: React.ReactNode;
}) {
  const [value, setValue] = useState(getColorName(color));
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
    <div className="my-2 h-10">
      <input
        ref={renameRef}
        type="text"
        placeholder={`Rename ${getColorName(color)}`}
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
              const colorId = getColorId(color);
              handleRenameColor(colorId, name);
            }
            handleKeyboardNavigate(key, next);
          } else if (key === "ArrowDown") {
            handleKeyboardNavigate(key, next);
          } else if (key === "ArrowUp") {
            handleKeyboardNavigate(key, prev);
          } else if (key === "Escape") {
            // refactor: the 2nd arg `next` is unused
            handleKeyboardNavigate(key, next);
          }
        }}
        className="py-2 pl-4 mr-4 w-1/2 text-black"
      />
      <span className="mr-4">:</span>
      <span
        className="w-4 h-4 inline-block mr-2 rounded-sm"
        style={{ backgroundColor: getColorValue(color) }}
      ></span>
      <span className="mr-4">{getColorValue(color)},</span>
      {children}
    </div>
  );
}
