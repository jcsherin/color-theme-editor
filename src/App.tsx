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
function TreeLeafInput({
  color,
  focus,
  handleRenameColor,
  handleKeyboardNavigate,
  prev,
  next,
  handleRemoveColor,
}: {
  color: HexColor;
  focus: boolean;
  handleRenameColor: (colorId: string, name: string) => void;
  handleKeyboardNavigate: (key: string, target: string) => void;
  prev: string;
  next: string;
  handleRemoveColor?: (colorId: string) => void;
}) {
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (focus && renameRef && renameRef.current) {
        renameRef.current.focus();
        renameRef.current.select();
      }
    }, 20);
  }, [focus]);

  const removeButton = handleRemoveColor ? (
    <button
      className="py-1 px-4 text-red-100 hover:text-red-300 bg-red-600 hover:bg-red-800 font-sans rounded-sm"
      onClick={(_e) => handleRemoveColor(getColorId(color))}
    >
      Remove
    </button>
  ) : (
    <></>
  );

  return (
    <div>
      <input
        id="tree-leaf-input"
        ref={renameRef}
        type="text"
        placeholder={`Rename ${getColorName(color)}`}
        value={getColorName(color)}
        onChange={(event) => {
          let name = event.currentTarget.value;
          let colorId = getColorId(color);
          handleRenameColor(colorId, name);
        }}
        onKeyDown={(event) => {
          let key = event.key;
          if (key === "ArrowDown" || key === "Enter") {
            handleKeyboardNavigate(key, next);
          } else if (key === "ArrowUp") {
            handleKeyboardNavigate(key, prev);
          } else if (key === "Escape") {
            // refactor: the 2nd arg `next` is unused
            handleKeyboardNavigate(key, next);
          }
        }}
        className="py-2 pl-4 mr-4 w-1/2 mt-4 mb-4 text-black"
      />
      <span className="mr-4">:</span>
      <span
        className="w-4 h-4 inline-block mr-2 rounded-sm"
        style={{ backgroundColor: getColorValue(color) }}
      ></span>
      <span className="mr-4">{getColorValue(color)},</span>
      {removeButton}
    </div>
  );
}

interface ViewMode {
  kind: "view";
}
interface EditMode {
  kind: "edit";
  colorId: string;
}

type InputMode = ViewMode | EditMode;

const initialInputMode: InputMode = { kind: "view" };

interface Focus {
  kind: "focus";
  colorId: string;
}

interface MoveUp {
  kind: "moveup";
  target: string;
}

interface MoveDown {
  kind: "movedown";
  target: string;
}

interface Escape {
  kind: "escape";
}

type InputAction = Focus | MoveUp | MoveDown | Escape;

function reducerInputAction(state: InputMode, action: InputAction): InputMode {
  switch (state.kind) {
    case "view":
      switch (action.kind) {
        case "focus":
          return { kind: "edit", colorId: action.colorId };
        case "movedown":
        case "moveup":
          return { kind: "edit", colorId: action.target };
        case "escape":
          return state;
      }
    case "edit":
      switch (action.kind) {
        case "focus":
          return { ...state, colorId: action.colorId };
        case "movedown":
        case "moveup":
          return { ...state, colorId: action.target };
        case "escape":
          return { ...state, kind: "view" };
      }
  }
}

type ColorDict = Map<string, HexColor>;

function makeColorDict(colors: HexColor[]): ColorDict {
  const map = new Map();
  colors.forEach((color) => {
    const key = getColorId(color);
    map.set(key, color);
  });
  return map;
}

type UtilityKlassDict = Map<string, UtilityKlass>;

function makeUtilityKlassDict(klasses: UtilityKlass[]): UtilityKlassDict {
  const map = new Map();
  klasses.forEach((klass) => {
    map.set(klass.name, klass);
  });
  return map;
}

function getColorIds(map: ColorDict): string[] {
  return Array.from(map.keys());
}

export default function App() {
  const [colorDict, setColorDict] = useState(() => {
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
    setKlassDict((dict) => {
      const selectedColorIds = colorList
        .filter((item) => item.status === "selected")
        .map((item) => item.colorId);

      const item = dict.get(className);
      if (item) {
        const newItem = {
          ...item,
          colorIds: [...item.colorIds, ...selectedColorIds],
        };
        dict.set(className, newItem);
      }

      return new Map(Array.from(dict));
    });
    setColorList((colors) =>
      colors.map((item) =>
        item.status === "selected" ? { ...item, status: "hidden" } : item
      )
    );
  };

  const handleRemoveColorFromKlass = (className: string, colorId: string) => {
    setKlassDict((map) => {
      const klass = map.get(className);
      if (klass) {
        let newColorIds = klass.colorIds.filter((item) => item != colorId);
        map.set(className, { ...klass, colorIds: newColorIds });
      }

      return new Map(Array.from(map));
    });
    setColorList((colors) =>
      colors.map((item) =>
        item.colorId === colorId ? { ...item, status: "visible" } : item
      )
    );
  };

  const colorListItems = colorList.map((item) => {
    const color = colorDict.get(item.colorId);
    return color ? (
      <ColorSquare
        className="mr-1 mb-1 p-1"
        key={item.colorId}
        color={color}
        item={item}
        handleSelection={handleToggleColorSelection}
      />
    ) : (
      <></>
    );
  });

  const utilityKlassesButtonGroup = Array.from(klassDict.keys()).map((id) => {
    const klass = klassDict.get(id);
    return klass ? (
      <Button
        disabled={disableButtonGroup}
        key={id}
        className="mr-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900"
        text={klass.name}
        handleClick={handleAddColorsToKlass}
      />
    ) : (
      <></>
    );
  });

  const colorNode = (
    colorId: string,
    handleFocus: (colorId: string) => void,
    focusRenameInput: boolean,
    handleRenameColor: (colorId: string, name: string) => void,
    handleKeyboardNavigate: (key: string, target: string) => void,
    idx: number,
    prevColorId: string,
    nextColorId: string,
    handleRemoveColor?: (colorId: string) => void
  ) => {
    let color = colorDict.get(colorId);
    if (color) {
      let colorValue = getColorValue(color);

      switch (inputMode.kind) {
        case "view":
          return (
            <TreeLeaf
              key={getColorValue(color)}
              handleFocus={(_event) => handleFocus(colorId)}
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
          return inputMode.colorId === colorId ? (
            <TreeLeafInput
              key={getColorValue(color)}
              color={color}
              focus={focusRenameInput}
              handleRenameColor={handleRenameColor}
              handleKeyboardNavigate={handleKeyboardNavigate}
              prev={prevColorId}
              next={nextColorId}
              handleRemoveColor={handleRemoveColor}
            />
          ) : (
            <TreeLeaf
              key={getColorValue(color)}
              handleFocus={(_event) => handleFocus(colorId)}
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
    } else {
      return <></>;
    }
  };

  const handleInputFocus = (colorId: string) => {
    inputActionDispatch({ kind: "focus", colorId: colorId });
    const color = colorDict.get(colorId);
    if (color) console.log(`Editing -> ${JSON.stringify(color, null, 2)}`);
  };

  const handleKeyboardNavigate = (key: string, target: string) => {
    switch (key) {
      case "Enter":
      case "ArrowDown":
        return inputActionDispatch({ kind: "movedown", target: target });
      case "ArrowUp":
        return inputActionDispatch({ kind: "moveup", target: target });
      case "Escape":
        return inputActionDispatch({ kind: "escape" });
    }
  };

  const handleRenameColor = (colorId: string, name: string) => {
    setColorDict((state) => {
      const color = state.get(colorId);
      if (color) {
        const newColor = { ...color, name: name };
        state.set(colorId, newColor);
      }
      return new Map(Array.from(state));
    });
  };

  const configOrderedColorIds = Array.from(klassDict.values())
    .flatMap((klass) => klass.colorIds)
    .concat(
      colorList
        .filter((item) => item.status !== "hidden")
        .map((item) => item.colorId)
    );

  const getNodeIdx = (colorId: string) =>
    configOrderedColorIds.findIndex((id) => id === colorId);

  const prevColorId = (colorId: string) => {
    const idx = getNodeIdx(colorId);
    const prevIdx =
      (idx - 1 + configOrderedColorIds.length) % configOrderedColorIds.length;
    return configOrderedColorIds[prevIdx];
  };

  const nextColorId = (colorId: string) => {
    const idx = getNodeIdx(colorId);
    const nextIdx = (idx + 1) % configOrderedColorIds.length;
    return configOrderedColorIds[nextIdx];
  };

  const klassNodes = Array.from(klassDict.values()).map((klass) => {
    let contents = `"${klass.name}" :`;
    return klass.colorIds.length === 0 ? (
      <TreeNode key={klass.name} contents={contents} />
    ) : (
      <TreeNode key={klass.name} contents={contents}>
        {klass.colorIds.map((colorId) => {
          let node = colorNode(
            colorId,
            handleInputFocus,
            focusRenameInput,
            handleRenameColor,
            handleKeyboardNavigate,
            getNodeIdx(colorId),
            prevColorId(colorId),
            nextColorId(colorId),
            (colorId) => handleRemoveColorFromKlass(klass.name, colorId)
          );
          return node;
        })}
      </TreeNode>
    );
  });
  const singleColorNodes = colorList
    .filter((item) => item.status !== "hidden")
    .map((item) => {
      let node = colorNode(
        item.colorId,
        handleInputFocus,
        focusRenameInput,
        handleRenameColor,
        handleKeyboardNavigate,
        getNodeIdx(item.colorId),
        prevColorId(item.colorId),
        nextColorId(item.colorId)
      );
      return node;
    });

  const childNodes = [klassNodes, ...singleColorNodes];

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
