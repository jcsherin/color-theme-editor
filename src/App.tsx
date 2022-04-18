import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  getColorId,
  getColorName,
  getColorValue,
  HexColor,
  parseColor,
} from "./color";
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
  item,
  handleSelection,
}: {
  className: string;
  color: HexColor;
  item: ColorListItem;
  handleSelection: (color: ColorListItem) => void;
}) {
  const getClassName = (item: ColorListItem): string => {
    switch (item.status) {
      case "selected":
        return "border-4 border-indigo-500";
      case "visible":
        return "border-4 border-white";
      case "hidden":
        return "hidden";
    }
  };

  return (
    <button
      className={`${overrideClassName} ${getClassName(item)}`}
      onClick={(_event) => handleSelection(item)}
    >
      <span
        className="w-16 h-12 block border-b"
        style={{ backgroundColor: getColorValue(color) }}
      ></span>
      <span className="block text-xs text-center truncate bg-black text-white">
        {getColorValue(color)}
      </span>
    </button>
  );
}

interface ColorListItem {
  colorId: string;
  status: "visible" | "selected" | "hidden";
}

function makeColorListItem(colorId: string): ColorListItem {
  return { colorId: colorId, status: "visible" };
}

interface SingleColorKlass {
  kind: "singleColor";
  colorId: string;
}

interface UtilityKlass {
  kind: "utility";
  name: string;
  colorIds: string[];
}

type Klass = UtilityKlass | SingleColorKlass;

function makeUtilityKlass(name: string): UtilityKlass {
  return { kind: "utility", name: name, colorIds: [] };
}

function makeSingleColorKlass(colorId: string): SingleColorKlass {
  return { kind: "singleColor", colorId: colorId };
}

function parseUtilityKlass(value: string): UtilityKlass | undefined {
  const name = value.trim().replace(/\s+/g, "-");
  if (name.length > 0) {
    return makeUtilityKlass(name);
  }
}

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

type ColorDict = { [id: string]: HexColor };

function makeColorDict(colors: HexColor[]): ColorDict {
  return colors.reduce((store, color) => {
    const colorId = getColorId(color);
    store[colorId] = color;
    return store;
  }, {} as ColorDict);
}

type UtilityKlassDict = { [id: string]: UtilityKlass };

function makeUtilityKlassDict(klasses: UtilityKlass[]): UtilityKlassDict {
  return klasses.reduce((store, klass) => {
    store[klass.name] = klass;
    return store;
  }, {} as UtilityKlassDict);
}

function getColorIds(colorStore: ColorDict): string[] {
  return Object.keys(colorStore);
}

export default function App() {
  const [colorDict, _setColorDict] = useState(() => {
    const deduped = new Set(example.colors);
    const parsed = Array.from(deduped)
      .map(parseColor)
      .flatMap((item) => (item ? [item] : []));
    return makeColorDict(parsed);
  });
  const [klassDict, setKlassDict] = useState(() => {
    const deduped = new Set(example.utilityClassnames.map((x) => x.trim()));
    const parsed = Array.from(deduped)
      .map(parseUtilityKlass)
      .flatMap((item) => (item ? [item] : []));
    return makeUtilityKlassDict(parsed);
  });

  const [colorList, setColorList] = useState<ColorListItem[]>([]);
  useEffect(() => {
    function initColorList(colorIds: string[]): ColorListItem[] {
      return colorIds.map(makeColorListItem);
    }

    setColorList(initColorList(getColorIds(colorDict)));
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
        item.colorId === color.colorId ? toggleStatus(item) : item
      );
    });
  };

  const handleAddColorsToKlass = (className: string) => {
    const removeFromDefaultKlass = (selectedColors: string[], klass: Klass) => {
      switch (klass.kind) {
        case "singleColor":
          return !selectedColors.includes(klass.colorId);
        case "utility":
          return true;
      }
    };

    const addToScaleKlass = (selectedColors: string[], klass: Klass) => {
      switch (klass.kind) {
        case "singleColor":
          return klass;
        case "utility":
          return klass.name === className
            ? { ...klass, colors: [...klass.colorIds, ...selectedColors] }
            : klass;
      }
    };
    setKlassDict((dict) => {
      const selectedColorIds = colorList
        .filter((item) => item.status === "selected")
        .map((item) => item.colorId);

      dict[className].colorIds = [
        ...dict[className].colorIds,
        ...selectedColorIds,
      ];

      return dict;
    });
    setColorList((colors) =>
      colors.map((item) =>
        item.status === "selected" ? { ...item, status: "hidden" } : item
      )
    );
  };

  const colorListItems = colorList.map((item) => (
    <ColorSquare
      className="mr-1 mb-1 p-1"
      key={item.colorId}
      color={colorDict[item.colorId]}
      item={item}
      handleSelection={handleToggleColorSelection}
    />
  ));

  const utilityKlassesButtonGroup = Object.keys(klassDict).map((id) => {
    return (
      <Button
        disabled={disableButtonGroup}
        key={id}
        className="mr-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900"
        text={klassDict[id].name}
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

  const childNodes = Object.entries(klassDict).map(([id, klass]) => {
    let contents = `"${klass.name}" :`;
    const klassNodes =
      klass.colorIds.length === 0 ? (
        <TreeNode key={klass.name} contents={contents} />
      ) : (
        <TreeNode key={klass.name} contents={contents}>
          {klass.colorIds.map((colorId) =>
            colorNode(colorDict[colorId], handleInputFocus, focusRenameInput)
          )}
        </TreeNode>
      );
    const singleColorNodes = colorList
      .filter((item) => item.status === "visible")
      .map((item) => item.colorId)
      .map((colorId) =>
        colorNode(colorDict[colorId], handleInputFocus, focusRenameInput)
      );
    return (
      <>
        {klassNodes}
        {singleColorNodes}
      </>
    );
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
          <div className={"pl-2"}>{utilityKlassesButtonGroup}</div>
        </div>
      </div>
    </div>
  );
}
