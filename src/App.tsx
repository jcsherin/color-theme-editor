import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  getColorId,
  getColorName,
  getColorValue,
  HexColor,
  parseColor,
  updateColorName,
} from "./color";
import * as example from "./example";

interface UnparsedColorTheme {
  classnames: string;
  colors: string;
}

interface ColorListItem {
  colorId: string;
  status: "visible" | "selected" | "hidden";
}

interface ColorGroup {
  name: string;
  colorIds: string[];
}

type ColorDict = Map<string, HexColor>;
type ColorGroupDict = Map<string, ColorGroup>;

interface ViewMode {
  kind: "view";
}
interface EditMode {
  kind: "edit";
  colorId: string;
}

type InputMode = ViewMode | EditMode;

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

interface WizardStep {
  kind: "colorThemeInput" | "colorThemeConfig";
}
interface Wizard {
  steps: WizardStep[];
  currStep: number;
}

function Clipboard({
  text,
  timeoutInMs,
  className: overrideClassName,
}: {
  text: string;
  timeoutInMs: number;
  className: string;
}) {
  const [copied, setCopied] = useState(false);

  const clipboardWriteText = (text: string) =>
    navigator && navigator.clipboard
      ? navigator.clipboard.writeText(text)
      : Promise.reject(
          new Error("Copying to clipboard not supported in browser!")
        );

  const handleCopy = (text: string) =>
    clipboardWriteText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, timeoutInMs);
      })
      .catch((reason) => console.error(reason));

  const copyButton = copied ? (
    <p className="text-green-100 text-2xl font-sans py-1 px-4">Copied!</p>
  ) : (
    <button
      className="bg-slate-100 hover:bg-slate-300 text-blue-500 hover:text-blue-800 text-2xl py-1 px-4"
      onClick={(_e) => handleCopy(text)}
    >
      Copy
    </button>
  );

  return <div className={overrideClassName}>{copyButton}</div>;
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

function makeColorListItem(colorId: string): ColorListItem {
  return { colorId: colorId, status: "visible" };
}

function makeColorGroup(name: string): ColorGroup {
  return { name: name, colorIds: [] };
}

function parseColorGroup(value: string): ColorGroup | undefined {
  const name = value.trim().replace(/\s+/g, "-");
  if (name.length > 0) {
    return makeColorGroup(name);
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

function TreeLeafView({
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
function TreeLeafEdit({
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

const initialInputMode: InputMode = { kind: "view" };

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

function makeColorDict(colors: HexColor[]): ColorDict {
  const map = new Map();
  colors.forEach((color) => {
    const key = getColorId(color);
    map.set(key, color);
  });
  return map;
}

function makeColorGroupDict(colorGroups: ColorGroup[]): ColorGroupDict {
  const map = new Map();
  colorGroups.forEach((group) => {
    map.set(group.name, group);
  });
  return map;
}

function getColorIds(map: ColorDict): string[] {
  return Array.from(map.keys());
}

const compareColorId = (colorDict: ColorDict) => (x: string, y: string) => {
  const xname = getColorName(colorDict.get(x)!);
  const yname = getColorName(colorDict.get(y)!);
  if (xname < yname) return -1;
  if (xname > yname) return 1;
  return 0;
};

function serializeConfig({ colorDict, colorGroupDict, colorList }: State) {
  const serialized: { [name: string]: string | { [name: string]: string } } =
    {};
  Array.from(colorGroupDict.values()).forEach((colorGroup) => {
    const inner: { [name: string]: string } = {};
    Array.from(colorGroup.colorIds)
      .sort(compareColorId(colorDict))
      .forEach((colorId) => {
        const color = colorDict.get(colorId);
        if (color) {
          const key = getColorName(color);
          const value = getColorValue(color);
          inner[key] = value;
        }
      });
    serialized[colorGroup.name] = inner;
  });
  colorList
    .filter((item) => item.status !== "hidden")
    .map((item) => item.colorId)
    .sort(compareColorId(colorDict))
    .forEach((colorId) => {
      const color = colorDict.get(colorId);
      if (color) {
        const key = getColorName(color);
        const value = getColorValue(color);
        serialized[key] = value;
      }
    });
  const wrapper = { theme: { colors: serialized } };
  const template = `module.exports = ${JSON.stringify(wrapper, null, 2)}`;
  return template;
}

function makeWizard(): Wizard {
  return {
    steps: [{ kind: "colorThemeInput" }, { kind: "colorThemeConfig" }],
    currStep: 0,
  };
}

function wizardNextStep(wizard: Wizard): Wizard {
  return wizard.currStep < wizard.steps.length - 1
    ? { ...wizard, currStep: wizard.currStep + 1 }
    : wizard;
}

function wizardPrevStep(wizard: Wizard): Wizard {
  return wizard.currStep > 0
    ? { ...wizard, currStep: wizard.currStep - 1 }
    : wizard;
}

interface State {
  colorDict: Map<string, HexColor>;
  colorGroupDict: Map<string, ColorGroup>;
  colorList: ColorListItem[];
}

interface ActionParse {
  kind: "parse";
  unparsedColorTheme: UnparsedColorTheme;
}

interface ActionAddToGroup {
  kind: "addToGroup";
  groupName: string;
}

interface ActionRemoveFromGroup {
  kind: "removeFromGroup";
  groupName: string;
  colorId: string;
}

interface ActionRenameColor {
  kind: "renameColor";
  colorId: string;
  newName: string;
}

interface ActionToggleStatus {
  kind: "toggleStatus";
  colorListItem: ColorListItem;
}

type Action =
  | ActionParse
  | ActionAddToGroup
  | ActionRemoveFromGroup
  | ActionRenameColor
  | ActionToggleStatus;

const initialState = {
  colorDict: new Map(),
  colorGroupDict: new Map(),
  colorList: [],
};

const parseColors = (colors: string): ColorDict => {
  const deduped = new Set(colors.split("\n"));
  const parsed = Array.from(deduped)
    .map(parseColor)
    .flatMap((color) => (color ? [color] : []));
  return makeColorDict(parsed);
};

const parseColorGroups = (groupNames: string): ColorGroupDict => {
  const deduped = new Set(groupNames.split("\n"));
  const parsed = Array.from(deduped)
    .map(parseColorGroup)
    .flatMap((classname) => (classname ? [classname] : []));
  return makeColorGroupDict(parsed);
};

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

const reducer = (state: State, action: Action): State => {
  switch (action.kind) {
    case "parse": {
      // Don't reparse user input!
      if (state.colorDict.size > 0 && state.colorGroupDict.size > 0)
        return state;

      const colorDict = parseColors(action.unparsedColorTheme.colors);
      const colorGroupDict = parseColorGroups(
        action.unparsedColorTheme.classnames
      );
      const colorList = Array.from(colorDict.keys()).map(makeColorListItem);

      return {
        colorDict: colorDict,
        colorGroupDict: colorGroupDict,
        colorList: colorList,
      };
    }

    case "addToGroup": {
      const group = state.colorGroupDict.get(action.groupName);
      if (!group) return state;

      const selected = state.colorList
        .filter((item) => item.status === "selected")
        .map((item) => item.colorId);

      const deduped = new Set([...group.colorIds, ...selected]);
      const newGroup = { ...group, colorIds: Array.from(deduped) };
      state.colorGroupDict.set(group.name, newGroup);

      const colorList = state.colorList.map<ColorListItem>((item) =>
        item.status === "selected" ? { ...item, status: "hidden" } : item
      );

      return {
        ...state,
        colorGroupDict: new Map(Array.from(state.colorGroupDict)),
        colorList: colorList,
      };
    }

    case "removeFromGroup": {
      const group = state.colorGroupDict.get(action.groupName);
      if (!group) return state;

      const colorIds = group.colorIds.filter(
        (colorId) => colorId !== action.colorId
      );
      const newGroup = { ...group, colorIds: colorIds };
      state.colorGroupDict.set(group.name, newGroup);

      const colorList = state.colorList.map<ColorListItem>((item) =>
        item.colorId === action.colorId ? { ...item, status: "visible" } : item
      );

      return {
        ...state,
        colorGroupDict: new Map(Array.from(state.colorGroupDict)),
        colorList: colorList,
      };
    }

    case "renameColor": {
      const color = state.colorDict.get(action.colorId);
      if (!color) return state;

      state.colorDict.set(
        action.colorId,
        updateColorName(color, action.newName)
      );

      return {
        ...state,
        colorDict: new Map(Array.from(state.colorDict)),
      };
    }

    case "toggleStatus": {
      const colorList = state.colorList.map((item) =>
        item.colorId === action.colorListItem.colorId
          ? toggleStatus(item)
          : item
      );

      return { ...state, colorList: colorList };
    }
  }
};

export default function App() {
  const [unparsedColorTheme, setUnparsedColorTheme] =
    useState<UnparsedColorTheme>(() => {
      const item = localStorage.getItem("unparsedColorTheme");
      return item
        ? JSON.parse(item)
        : {
            classnames: "",
            colors: "",
          };
    });
  const [wizard, setWizard] = useState<Wizard>(makeWizard());
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem(
      "unparsedColorTheme",
      JSON.stringify(unparsedColorTheme)
    );
  }, [unparsedColorTheme]);

  const [inputMode, inputActionDispatch] = useReducer(
    reducerInputAction,
    initialInputMode
  );

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

  const handleNextUI = () => {
    setWizard((wizard) => wizardNextStep(wizard));

    dispatch({ kind: "parse", unparsedColorTheme: unparsedColorTheme });
  };
  const handlePrevUI = () => setWizard((wizard) => wizardPrevStep(wizard));

  const handleLoadExample = () =>
    setUnparsedColorTheme({
      classnames: example.utilityClassnames.join("\n"),
      colors: example.colors.join("\n"),
    });

  const handleClearInput = () =>
    setUnparsedColorTheme({ classnames: "", colors: "" });

  const isInputEmpty = () =>
    unparsedColorTheme.classnames.trim().length === 0 &&
    unparsedColorTheme.colors.trim().length === 0;

  const colorListItems = state.colorList.map((item) => {
    const color = state.colorDict.get(item.colorId);
    return color ? (
      <ColorSquare
        className="mr-1 mb-1 p-1"
        key={item.colorId}
        color={color}
        item={item}
        handleSelection={(colorListItem) =>
          dispatch({
            kind: "toggleStatus",
            colorListItem: colorListItem,
          })
        }
      />
    ) : (
      <></>
    );
  });

  const colorGroupsButtonRow = Array.from(state.colorGroupDict.keys()).map(
    (id) => {
      const colorGroup = state.colorGroupDict.get(id);
      const disabled = state.colorList.every(
        (item) => item.status === "visible" || item.status === "hidden"
      );

      return colorGroup ? (
        <button
          disabled={disabled}
          key={id}
          className={`mr-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900 ${
            disabled ? "disabled:cursor-not-allowed" : ""
          }`}
          onClick={(_e) =>
            dispatch({ kind: "addToGroup", groupName: colorGroup.name })
          }
        >
          {colorGroup.name}
        </button>
      ) : (
        <></>
      );
    }
  );

  const colorNode = (
    colorId: string,
    handleFocus: (colorId: string) => void,
    focusRenameInput: boolean,
    handleRenameColor: (colorId: string, name: string) => void,
    handleKeyboardNavigate: (key: string, target: string) => void,
    prevColorId: string,
    nextColorId: string,
    handleRemoveColor?: (colorId: string) => void
  ) => {
    let color = state.colorDict.get(colorId);
    if (color) {
      let colorValue = getColorValue(color);

      switch (inputMode.kind) {
        case "view":
          return (
            <TreeLeafView
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
            </TreeLeafView>
          );
        case "edit":
          return inputMode.colorId === colorId ? (
            <TreeLeafEdit
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
            <TreeLeafView
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
            </TreeLeafView>
          );
      }
    } else {
      return <></>;
    }
  };

  const handleInputFocus = (colorId: string) => {
    inputActionDispatch({ kind: "focus", colorId: colorId });
    const color = state.colorDict.get(colorId);
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

  const configOrderedColorIds = Array.from(state.colorGroupDict.values())
    .flatMap((colorGroup) =>
      Array.from(colorGroup.colorIds).sort(compareColorId(state.colorDict))
    )
    .concat(
      state.colorList
        .filter((item) => item.status !== "hidden")
        .map((item) => item.colorId)
        .sort(compareColorId(state.colorDict))
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

  const colorGroupNodes = Array.from(state.colorGroupDict.values()).map(
    (colorGroup) => {
      let contents = `"${colorGroup.name}" :`;
      let sortedColorIds = Array.from(colorGroup.colorIds).sort(
        compareColorId(state.colorDict)
      );
      return colorGroup.colorIds.length === 0 ? (
        <TreeNode key={colorGroup.name} contents={contents} />
      ) : (
        <TreeNode key={colorGroup.name} contents={contents}>
          {sortedColorIds.map((colorId) => {
            let node = colorNode(
              colorId,
              handleInputFocus,
              focusRenameInput,
              (colorId, newName) =>
                dispatch({
                  kind: "renameColor",
                  colorId: colorId,
                  newName: newName,
                }),
              handleKeyboardNavigate,
              prevColorId(colorId),
              nextColorId(colorId),
              (colorId) =>
                dispatch({
                  kind: "removeFromGroup",
                  groupName: colorGroup.name,
                  colorId: colorId,
                })
            );
            return node;
          })}
        </TreeNode>
      );
    }
  );

  const singleColorNodes = state.colorList
    .filter((item) => item.status !== "hidden")
    .map((item) => item.colorId)
    .sort(compareColorId(state.colorDict))
    .map((colorId) => {
      let node = colorNode(
        colorId,
        handleInputFocus,
        focusRenameInput,
        (colorId, newName) =>
          dispatch({
            kind: "renameColor",
            colorId: colorId,
            newName: newName,
          }),
        handleKeyboardNavigate,
        prevColorId(colorId),
        nextColorId(colorId)
      );
      return node;
    });

  const childNodes = [colorGroupNodes, ...singleColorNodes];

  const colorThemeInputUI = (
    <>
      <div className="grid grid-cols-2">
        <div className="mr-4">
          <p>Utility Classnames:</p>
          <textarea
            className="w-full bg-slate-100 h-60 py-1 px-4"
            placeholder="One name per line"
            value={unparsedColorTheme.classnames}
            onChange={(_e) => {}}
          />
        </div>
        <div>
          <p>Color Values:</p>
          <textarea
            className="w-full bg-slate-100 h-60 py-1 px-4"
            placeholder="One color value per line"
            value={unparsedColorTheme.colors}
            onChange={(_e) => {}}
          />
        </div>
      </div>
      <div>
        <button
          onClick={(_e) => handleNextUI()}
          className="mr-4 py-1 px-4 text-2xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed"
          disabled={isInputEmpty()}
        >
          Next
        </button>
        {isInputEmpty() ? (
          <button
            onClick={(_e) => handleLoadExample()}
            className="text-blue-500 hover:text-blue-700 text-2xl"
          >
            Load Example
          </button>
        ) : (
          <button
            onClick={(_e) => handleClearInput()}
            className="text-blue-500 hover:text-blue-700 text-2xl"
          >
            Clear
          </button>
        )}
      </div>
    </>
  );
  const colorThemeConfigUI = (
    <>
      <div className="grid grid-cols-2 mb-4">
        <div
          ref={mouseRef}
          className="bg-slate-900 text-slate-200 font-mono px-4 py-2 mr-2"
        >
          <Clipboard
            text={serializeConfig(state)}
            timeoutInMs={2000}
            className="mb-4 flex justify-end"
          />
          <TreeNode contents="module.exports =">
            <TreeNode contents="theme:">
              <TreeNode contents="colors:">{childNodes}</TreeNode>
            </TreeNode>
          </TreeNode>
        </div>
        <div>
          <div className="flex flex-wrap mb-4">{colorListItems}</div>
          <div className={"pl-2"}>{colorGroupsButtonRow}</div>
        </div>
      </div>
      <div>
        <button
          onClick={(_e) => handlePrevUI()}
          className="py-1 px-4 text-2xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700"
        >
          Go Back
        </button>
      </div>
    </>
  );

  const showUI = (wizard: Wizard) => {
    switch (wizard.steps[wizard.currStep].kind) {
      case "colorThemeInput":
        return colorThemeInputUI;
      case "colorThemeConfig":
        return colorThemeConfigUI;
    }
  };

  return <div className="mx-2 my-8">{showUI(wizard)}</div>;
}
