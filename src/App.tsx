import React, { useEffect, useReducer, useRef, useState } from "react";
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
  const className =
    item.status === "selected"
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
  status: "visible" | "selected" | "hidden";
}

function makeColorListItem(color: HexColor): ColorListItem {
  return { color: color, status: "visible" };
}

interface NoneKlass {
  kind: "none";
  color: HexColor;
}

interface UtilityKlass {
  kind: "utility";
  name: string;
  colors: HexColor[];
}

type Klass = UtilityKlass | NoneKlass;

function TreeNode({
  contents,
  children,
}: {
  contents: string;
  children?: React.ReactNode;
}) {
  let node = children ? (
    <div>
      <p className="mb-1">{`${contents} {`}</p>
      <div className="ml-4">{children}</div>
      <p>{"}"}</p>
    </div>
  ) : (
    <p className="mb-1">{`${contents} {}`}</p>
  );
  return node;
}

function TreeLeaf({
  handleFocus,
  children,
}: {
  handleFocus: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  return (
    <button className="mb-1 block" onClick={handleFocus}>
      {children}
    </button>
  );
}
function TreeLeafInput({ color, focus }: { color: HexColor; focus: boolean }) {
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
    <div>
      <input
        id="tree-leaf-input"
        ref={renameRef}
        type="text"
        placeholder={`Rename ${getColorName(color)}`}
        value={getColorName(color)}
        className="py-2 pl-4 mr-4 w-1/2 mt-4 mb-4 text-black"
      />
      <span className="mr-4">:</span>
      <span
        className="w-4 h-4 inline-block mr-2 rounded-sm"
        style={{ backgroundColor: getColorValue(color) }}
      ></span>
      <span>{getColorValue(color)},</span>
    </div>
  );
}

interface ViewMode {
  kind: "view";
}
interface EditMode {
  kind: "edit";
  color: HexColor;
}

type InputMode = ViewMode | EditMode;

const initialInputMode: InputMode = { kind: "view" };

interface Focus {
  kind: "focus";
  color: HexColor;
}

interface Escape {
  kind: "escape";
}

type InputAction = Focus | Escape;

function reducerInputAction(state: InputMode, action: InputAction): InputMode {
  switch (state.kind) {
    case "view":
      switch (action.kind) {
        case "focus":
          return { kind: "edit", color: action.color };
        case "escape":
          return state;
      }
    case "edit":
      switch (action.kind) {
        case "focus":
          return { ...state, color: action.color };
        case "escape":
          return { kind: "view" };
      }
  }
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
  useEffect(() => setColorList(colors.map(makeColorListItem)), []);

  const [theme, setTheme] = useState<Klass[]>([]);
  useEffect(() => {
    setTheme((_theme) => {
      const scaleKlasses = classnames.map<Klass>((name) => {
        return { kind: "utility", name: name, colors: [] };
      });
      const defaultKlasses = colors.map<Klass>((color) => {
        return { kind: "none", color: color };
      });

      return [...scaleKlasses, ...defaultKlasses];
    });
  }, []);

  const [inputMode, inputActionDispatch] = useReducer(
    reducerInputAction,
    initialInputMode
  );

  const [disableButtonGroup, setDisableButtonGroup] = useState(true);
  useEffect(() => {
    setDisableButtonGroup(
      colorList.every(
        (item) => item.status === "visible" || item.status === "hidden"
      )
    );
  }, [colorList]);

  const [focusRenameInput, setFocusRenameInput] = useState(false);
  const mouseRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleRenameInputFocus(event: MouseEvent) {
      if (
        mouseRef &&
        mouseRef.current &&
        mouseRef.current.contains(event.target as Node)
      ) {
        setFocusRenameInput(true);
      } else {
        setFocusRenameInput(false);
      }
    }

    document.addEventListener("mousedown", handleRenameInputFocus);
    return () =>
      document.removeEventListener("mousedown", handleRenameInputFocus);
  }, []);

  const handleToggleColorSelection = (color: ColorListItem) => {
    const toggleStatus = (item: ColorListItem): ColorListItem => {
      switch (item.status) {
        case "visible":
          return { ...item, status: "selected" };
        case "selected":
          return { ...item, status: "visible" };
        case "hidden":
          return item;
      }
    };
    setColorList((state) => {
      return state.map((item) =>
        item.color === color.color ? toggleStatus(item) : item
      );
    });
  };

  const handleAddColorsToKlass = (className: string) => {
    const removeFromDefaultKlass = (
      selectedColors: HexColor[],
      klass: Klass
    ) => {
      switch (klass.kind) {
        case "none":
          return !selectedColors.includes(klass.color);
        case "utility":
          return true;
      }
    };

    const addToScaleKlass = (selectedColors: HexColor[], klass: Klass) => {
      switch (klass.kind) {
        case "none":
          return klass;
        case "utility":
          return klass.name === className
            ? { ...klass, colors: [...klass.colors, ...selectedColors] }
            : klass;
      }
    };
    setTheme((theme) => {
      const selectedColors = colorList
        .filter((item) => item.status === "selected")
        .map((item) => item.color);

      return theme
        .filter((klass) => removeFromDefaultKlass(selectedColors, klass))
        .map((klass) => addToScaleKlass(selectedColors, klass));
    });
    setColorList((colors) =>
      colors.map((item) =>
        item.status === "selected" ? { ...item, status: "hidden" } : item
      )
    );
  };

  const colorListItems = colorList
    .filter((item) => item.status !== "hidden")
    .map((item) => (
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
        handleClick={handleAddColorsToKlass}
      />
    );
  });

  const colorNode = (
    color: HexColor,
    handleFocus: (color: HexColor) => void,
    focusRenameInput: boolean
  ) => {
    let colorValue = getColorValue(color);

    switch (inputMode.kind) {
      case "view":
        return (
          <TreeLeaf
            key={getColorValue(color)}
            handleFocus={(_event) => handleFocus(color)}
          >
            <span className="mr-4">"{getColorName(color)}"</span>
            <span className="mr-4">:</span>
            <span
              className="w-4 h-4 inline-block mr-2 rounded-sm"
              style={{ backgroundColor: colorValue }}
            ></span>
            <span>{colorValue},</span>
          </TreeLeaf>
        );
      case "edit":
        return inputMode.color === color ? (
          <TreeLeafInput
            key={getColorValue(color)}
            color={color}
            focus={focusRenameInput}
          />
        ) : (
          <TreeLeaf
            key={getColorValue(color)}
            handleFocus={(_event) => handleFocus(color)}
          >
            <span className="mr-4">"{getColorName(color)}"</span>
            <span className="mr-4">:</span>
            <span
              className="w-4 h-4 inline-block mr-2 rounded-sm"
              style={{ backgroundColor: colorValue }}
            ></span>
            <span>{colorValue},</span>
          </TreeLeaf>
        );
    }
  };

  const handleInputFocus = (color: HexColor) => {
    inputActionDispatch({ kind: "focus", color: color });
    console.log(`Editing -> ${JSON.stringify(color, null, 2)}`);
  };

  const childNodes = theme.map((klass) => {
    switch (klass.kind) {
      case "none":
        return colorNode(klass.color, handleInputFocus, focusRenameInput);
      case "utility":
        let contents = `"${klass.name}" :`;
        const node =
          klass.colors.length === 0 ? (
            <TreeNode key={klass.name} contents={contents} />
          ) : (
            <TreeNode key={klass.name} contents={contents}>
              {klass.colors.map((color) =>
                colorNode(color, handleInputFocus, focusRenameInput)
              )}
            </TreeNode>
          );
        return node;
    }
  });

  return (
    <div className="mx-2 my-8">
      <div className="grid grid-cols-2">
        <div
          ref={mouseRef}
          className="bg-slate-900 text-slate-200 font-mono px-4 py-2 mr-2"
        >
          <TreeNode contents="module.exports =">
            <TreeNode contents="theme:">
              <TreeNode contents="colors:">{childNodes}</TreeNode>
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
