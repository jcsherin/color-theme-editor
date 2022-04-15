import React, { useEffect, useState } from "react";
import { getColorName, getColorValue, HexColor, parseColor } from "./color";
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
        style={{ backgroundColor: getColorValue(item.color) }}
      ></span>
      <span className="block text-xs text-center truncate bg-black text-white">
        {getColorValue(item.color)}
      </span>
    </button>
  );
}

interface ColorListItem {
  color: HexColor;
  selected: boolean;
}

interface DefaultKlass {
  kind: "default";
  color: HexColor;
}

interface ScaleKlass {
  kind: "scale";
  name: string;
  colors: HexColor[];
}

type Klass = ScaleKlass | DefaultKlass;

function TreeNode({
  contents,
  children,
}: {
  contents: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1">{`${contents} {`}</p>
      <div className="ml-4">{children}</div>
      <p>{"}"}</p>
    </div>
  );
}

function TreeLeaf({ contents }: { contents: string }) {
  return <p className="mb-1">{`${contents},`}</p>;
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
    []
  );

  const [theme, setTheme] = useState<Klass[]>([]);
  useEffect(() => {
    setTheme((_theme) => {
      const scaleKlasses = classnames.map<Klass>((name) => {
        return { kind: "scale", name: name, colors: [] };
      });
      const defaultKlasses = colors.map<Klass>((color) => {
        return { kind: "default", color: color };
      });

      return [...scaleKlasses, ...defaultKlasses];
    });
  }, []);

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

  const colorListItems = colorList.map((item) => (
    <ColorSquare
      className="mr-1 mb-1 p-1"
      key={getColorValue(item.color)}
      item={item}
      handleSelection={handleToggleColorSelection}
    />
  ));

  const classnamesButtonGroup = classnames.map((value) => {
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
  });

  const themeItems = theme
    .map((klass) => {
      switch (klass.kind) {
        case "default":
          return `${getColorName(klass.color)}: ${getColorValue(klass.color)}`;
      }
    })
    .flatMap((line) => (line ? [line] : []))
    .map((contents) => <TreeLeaf contents={contents} />);

  return (
    <div className="mx-2 my-8">
      <div className="grid grid-cols-2">
        <div className="bg-slate-900 text-slate-200 font-mono px-4 py-2 mr-2">
          <TreeNode contents="module.exports =">
            <TreeNode contents="theme:">
              <TreeNode contents="colors:">{themeItems}</TreeNode>
            </TreeNode>
          </TreeNode>
        </div>
        <div>
          <div className="flex flex-wrap mb-4">{colorListItems}</div>
          <div className={"pl-2"}>{classnamesButtonGroup}</div>
        </div>
      </div>
    </div>
  );
}
