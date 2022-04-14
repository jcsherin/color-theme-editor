import React from "react";
import type { Color } from "./color";
import { getColorValue, parseColor } from "./color";
import * as example from "./example";

function Button({
  className: overrideClassName,
  text,
  disabled,
  handleClick,
}: {
  className: string;
  text: string;
  disabled: boolean;
  handleClick: (text: string) => void;
}) {
  const computedClassName = disabled
    ? "cursor-not-allowed disabled:bg-gray-200 disabled:text-slate-400"
    : "";

  return (
    <button
      onClick={(_event) => handleClick(text)}
      className={`${overrideClassName} ${computedClassName}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

function ColorSquare({
  className: overrideClassName,
  color,
  handleSelection,
}: {
  className: string;
  color: Color;
  handleSelection: (color: Color) => void;
}) {
  return (
    <button
      className={overrideClassName}
      onClick={(_event) => handleSelection(color)}
    >
      <span
        className="w-16 h-16 block border-b"
        style={{ backgroundColor: getColorValue(color) }}
      ></span>
      <span className="block pt-1 text-xs text-center truncate">
        {getColorValue(color)}
      </span>
    </button>
  );
}

export default function App() {
  const colors = example.colors
    .map((value) => parseColor(value))
    .flatMap((color) => (color ? [color] : []));
  const classnames = example.utilityClassnames;

  return (
    <div className="m-2">
      <div className="flex flex-wrap mb-2">
        {colors.map((color) => (
          <ColorSquare
            className="m-1 pb-1 border bg-black text-white"
            key={getColorValue(color)}
            color={color}
            handleSelection={(color) =>
              console.log(`Clicke color -> ${JSON.stringify(color, null, 2)}`)
            }
          />
        ))}
      </div>
      <div className={"mb-4"}>
        {classnames.map((value) => {
          return (
            <Button
              disabled={false}
              key={value}
              className="mr-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900"
              text={value}
              handleClick={(className) => {
                console.log(`Clicked on -> ${className}.`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
