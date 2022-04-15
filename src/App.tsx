import React, { useEffect, useState } from "react";
import { getColorText, HexColor, parseColor } from "./color";
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
  item,
  handleSelection,
}: {
  className: string;
  item: ColorListItem;
  handleSelection: (color: ColorListItem) => void;
}) {
  const className = item.selected
    ? `border-4 border-indigo-500`
    : `border-4 border-white`;

  return (
    <button
      className={`${overrideClassName} ${className}`}
      onClick={(_event) => handleSelection(item)}
    >
      <span
        className="w-16 h-12 block border-b"
        style={{ backgroundColor: getColorText(item.color) }}
      ></span>
      <span className="block text-xs text-center truncate bg-black text-white">
        {getColorText(item.color)}
      </span>
    </button>
  );
}

interface ColorListItem {
  color: HexColor;
  selected: boolean;
}

export default function App() {
  const [colors, _setColors] = useState(
    example.colors.flatMap((value) => {
      const color = parseColor(value);
      return color ? [color] : [];
    })
  );
  const [classnames, _setClassnames] = useState(example.utilityClassnames);

  const [colorList, setColorList] = useState<ColorListItem[]>([]);
  useEffect(
    () =>
      setColorList(
        colors.map((color) => {
          return { color: color, selected: false };
        })
      ),
    [colors]
  );

  const [disableButtonGroup, setDisableButtonGroup] = useState(true);
  useEffect(() => {
    setDisableButtonGroup(colorList.every((item) => !item.selected));
  }, [colorList]);

  const handleToggleColorSelection = (color: ColorListItem) =>
    setColorList((state) => {
      return state.map((item) =>
        item.color === color.color
          ? { ...item, selected: !item.selected }
          : item
      );
    });

  return (
    <div className="mx-2 my-8">
      <div className="grid grid-cols-2">
        <div>
          <div className="flex flex-wrap mb-4">
            {colorList.map((item) => (
              <ColorSquare
                className="mr-1 mb-1 p-1"
                key={getColorText(item.color)}
                item={item}
                handleSelection={handleToggleColorSelection}
              />
            ))}
          </div>
          <div className={"pl-2"}>
            {classnames.map((value) => {
              return (
                <Button
                  disabled={disableButtonGroup}
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
        <div></div>
      </div>
    </div>
  );
}
