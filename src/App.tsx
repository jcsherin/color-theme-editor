import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  getColorId,
  getColorName,
  getColorValue,
  HexColor,
  updateColorName,
} from "./hexColor";
import * as example from "./utils/example";

import { CopyButton } from "./clipboard";
import {
  ColorSquare,
  allGrouped,
  ColorListItem,
  groupSelected,
  isSelected,
  makeColorListItem,
  notGrouped,
  someSelected,
  toggleStatus,
  ungroup,
  ColorGroupButton,
  ColorDict,
  compareColorId,
  ColorGroupDict,
  ColorGroup,
  parseColors,
  parseColorGroups,
} from "./grouping";
import {
  ColorThemeInput,
  isUnparsedColorThemeEmpty,
  UnparsedColorTheme,
} from "./input";
import {
  initialInputMode,
  reducerInputAction,
  TreeLeafEdit,
  TreeLeafView,
  TreeNode,
} from "./editor";

interface WizardStep {
  kind: "colorThemeInput" | "colorThemeConfig";
}
interface Wizard {
  steps: WizardStep[];
  currStep: number;
}

interface State {
  colorDict: Map<string, HexColor>;
  colorGroupDict: Map<string, ColorGroup>;
  colorList: ColorListItem[];
}

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
    .filter(notGrouped)
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

// TreeEditor Helpers

const treeLeafView = (
  color: HexColor,
  colorId: string,
  handleFocus: (colorId: string) => void
) => (
  <TreeLeafView
    colorId={colorId}
    key={getColorValue(color)}
    handleFocus={(_event) => handleFocus(colorId)}
  >
    <span className="mr-4">"{getColorName(color)}"</span>
    <span className="mr-4">:</span>
    <span
      className="w-4 h-4 inline-block mr-2 rounded-sm"
      style={{ backgroundColor: getColorValue(color) }}
    ></span>
    <span>{getColorValue(color)},</span>
  </TreeLeafView>
);

function TreeEditor({
  state,
  handleRenameColor,
  handleRemoveFromGroup,
}: {
  state: State;
  handleRenameColor: (colorId: string, newName: string) => void;
  handleRemoveFromGroup: (colorId: string, gorupName: string) => void;
}) {
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

  const [inputMode, inputActionDispatch] = useReducer(
    reducerInputAction,
    initialInputMode
  );

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

  const colorNode = (
    {
      colorId,
      prevColorId,
      nextColorId,
      color,
    }: {
      colorId: string;
      prevColorId: string;
      nextColorId: string;
      color: HexColor;
    },
    focusRenameInput: boolean,
    handleFocus: (colorId: string) => void,
    handleRenameColor: (colorId: string, name: string) => void,
    handleKeyboardNavigate: (key: string, target: string) => void,
    children?: React.ReactNode
  ) => {
    switch (inputMode.kind) {
      case "view":
        return treeLeafView(color, colorId, handleFocus);
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
          >
            {children}
          </TreeLeafEdit>
        ) : (
          treeLeafView(color, colorId, handleFocus)
        );
    }
  };

  const configOrderedColorIds = Array.from(state.colorGroupDict.values())
    .flatMap((colorGroup) =>
      Array.from(colorGroup.colorIds).sort(compareColorId(state.colorDict))
    )
    .concat(
      state.colorList
        .filter(notGrouped)
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
      const children = Array.from(colorGroup.colorIds)
        .sort(compareColorId(state.colorDict))
        .flatMap((colorId) => {
          const color = state.colorDict.get(colorId);
          return color
            ? [
                {
                  colorId,
                  prevColorId: prevColorId(colorId),
                  nextColorId: nextColorId(colorId),
                  color,
                },
              ]
            : [];
        })
        .map((args) => {
          let removeButton = (
            <button
              className="py-1 px-4 text-red-100 hover:text-red-300 bg-red-600 hover:bg-red-800 font-sans rounded-sm"
              onClick={(_e) =>
                handleRemoveFromGroup(args.colorId, colorGroup.name)
              }
            >
              Remove
            </button>
          );

          return colorNode(
            args,
            focusRenameInput,
            handleInputFocus,
            handleRenameColor,
            handleKeyboardNavigate,
            removeButton
          );
        });

      const contents = `"${colorGroup.name}" :`;
      return children.length === 0 ? (
        <TreeNode key={colorGroup.name} contents={contents} />
      ) : (
        <TreeNode key={colorGroup.name} contents={contents}>
          {children}
        </TreeNode>
      );
    }
  );

  const singleColorNodes = state.colorList
    .filter(notGrouped)
    .map((item) => item.colorId)
    .sort(compareColorId(state.colorDict))
    .flatMap((colorId) => {
      const color = state.colorDict.get(colorId);
      return color
        ? [
            {
              colorId,
              prevColorId: prevColorId(colorId),
              nextColorId: nextColorId(colorId),
              color,
            },
          ]
        : [];
    })
    .map((args) =>
      colorNode(
        args,
        focusRenameInput,
        handleInputFocus,
        handleRenameColor,
        handleKeyboardNavigate
      )
    );

  const childNodes = [colorGroupNodes, ...singleColorNodes];

  return (
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
  );
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

interface ActionReset {
  kind: "reset";
}

type Action =
  | ActionParse
  | ActionAddToGroup
  | ActionRemoveFromGroup
  | ActionRenameColor
  | ActionToggleStatus
  | ActionReset;

const getInitialState = (reset: boolean = false) => {
  const key = "state";

  if (reset) {
    const emptyJSON = JSON.stringify({
      colorDict: [],
      colorGroupDict: [],
      colorList: [],
    });
    localStorage.setItem(key, emptyJSON);
  }

  const cached = localStorage.getItem(key);
  if (!cached) {
    return {
      colorDict: new Map(),
      colorGroupDict: new Map(),
      colorList: [],
    };
  }

  const state = JSON.parse(cached);
  const colorDict: ColorDict = new Map(state.colorDict);
  const colorGroupDict: ColorGroupDict = new Map(state.colorGroupDict);
  const colorList: ColorListItem[] = state.colorList;
  return {
    colorDict: colorDict,
    colorGroupDict: colorGroupDict,
    colorList: colorList,
  };
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
        .filter(isSelected)
        .map((item) => item.colorId);

      const deduped = new Set([...group.colorIds, ...selected]);
      const newGroup = { ...group, colorIds: Array.from(deduped) };
      state.colorGroupDict.set(group.name, newGroup);

      return {
        ...state,
        colorGroupDict: new Map(Array.from(state.colorGroupDict)),
        colorList: groupSelected(state.colorList),
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

      return {
        ...state,
        colorGroupDict: new Map(Array.from(state.colorGroupDict)),
        colorList: state.colorList.map(ungroup(action.colorId)),
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
      return {
        ...state,
        colorList: state.colorList.map(
          toggleStatus(action.colorListItem.colorId)
        ),
      };
    }

    case "reset": {
      return getInitialState(true);
    }
  }
};

export default function App() {
  const [wizard, setWizard] = useState<Wizard>(() => {
    const cached = localStorage.getItem("wizard");
    return cached ? JSON.parse(cached) : makeWizard();
  });
  const [unparsedColorTheme, setUnparsedColorTheme] =
    useState<UnparsedColorTheme>(() => {
      const cached = localStorage.getItem("unparsedColorTheme");
      return cached
        ? JSON.parse(cached)
        : {
            classnames: "",
            colors: "",
          };
    });
  const [state, dispatch] = useReducer(reducer, getInitialState());

  useEffect(() => {
    localStorage.setItem("wizard", JSON.stringify(wizard));
    localStorage.setItem(
      "unparsedColorTheme",
      JSON.stringify(unparsedColorTheme)
    );
    localStorage.setItem(
      "state",
      JSON.stringify({
        colorDict: Array.from(state.colorDict),
        colorGroupDict: Array.from(state.colorGroupDict),
        colorList: state.colorList,
      })
    );
  }, [wizard, unparsedColorTheme, state]);

  const handleNextUI = () => {
    setWizard((wizard) => wizardNextStep(wizard));

    dispatch({ kind: "parse", unparsedColorTheme: unparsedColorTheme });
  };
  const handlePrevUI = () => setWizard((wizard) => wizardPrevStep(wizard));

  const handleLoadExample = () =>
    setUnparsedColorTheme({
      classnames: example.utilityClassnames().join("\n"),
      colors: example.colors().join("\n"),
    });

  const handleResetData = () => {
    setUnparsedColorTheme({ classnames: "", colors: "" });
    dispatch({ kind: "reset" });
  };

  const colorListItems = state.colorList
    .flatMap((item) => {
      const color = state.colorDict.get(item.colorId);
      return color ? [{ item: item, color: color }] : [];
    })
    .map(({ item, color }) => (
      <ColorSquare
        className="mr-1 mb-1 p-1"
        key={getColorId(color)}
        color={color}
        item={item}
        handleSelection={(item) =>
          dispatch({
            kind: "toggleStatus",
            colorListItem: item,
          })
        }
      />
    ));

  const isDisabledGroupButton = !someSelected(state.colorList);
  const colorGroupsButtonRow = allGrouped(state.colorList) ? (
    <p className="text-2xl text-center bg-yellow-200 py-2">
      Great! You've completed grouping all the colors.
    </p>
  ) : (
    Array.from(state.colorGroupDict.keys())
      .flatMap((groupId) => {
        const colorGroup = state.colorGroupDict.get(groupId);
        return colorGroup ? [{ groupId, colorGroup }] : [];
      })
      .map(({ groupId, colorGroup }) => (
        <ColorGroupButton
          key={groupId}
          className={`mr-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300`}
          groupName={colorGroup.name}
          disabled={isDisabledGroupButton}
          handleClick={(_event) =>
            dispatch({ kind: "addToGroup", groupName: colorGroup.name })
          }
        />
      ))
  );

  const colorThemeInputUI = (
    <>
      <div className="mb-4">
        <button
          onClick={(_e) => handleNextUI()}
          className="mr-4 py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
          disabled={isUnparsedColorThemeEmpty(unparsedColorTheme)}
        >
          Next
        </button>
        {isUnparsedColorThemeEmpty(unparsedColorTheme) ? (
          <button
            onClick={(_e) => handleLoadExample()}
            className="text-blue-500 hover:text-blue-700 text-xl"
          >
            Load Example
          </button>
        ) : (
          <button
            onClick={(_e) => handleResetData()}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            Reset All Values
          </button>
        )}
      </div>
      <ColorThemeInput unparsedColorTheme={unparsedColorTheme} />
    </>
  );
  const colorThemeConfigUI = (
    <>
      <div className="mb-4">
        <button
          onClick={(_e) => handlePrevUI()}
          className="py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700"
        >
          Go Back
        </button>
        <CopyButton
          label="Copy To Clipboard"
          content={serializeConfig(state)}
          expiryInMs={2000}
          className=" text-blue-500 hover:text-blue-800 text-xl py-1 px-4"
          flashClassName="text-green-800 text-xl py-1 px-4"
        />
      </div>
      <div className="grid grid-cols-2 mb-4">
        <TreeEditor
          state={state}
          handleRenameColor={(colorId, newName) =>
            dispatch({
              kind: "renameColor",
              colorId: colorId,
              newName: newName,
            })
          }
          handleRemoveFromGroup={(colorId, groupName) =>
            dispatch({
              kind: "removeFromGroup",
              groupName: groupName,
              colorId: colorId,
            })
          }
        />
        <div>
          <div className="flex flex-wrap mb-4">{colorListItems}</div>
          <div className={"pl-2"}>{colorGroupsButtonRow}</div>
        </div>
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
