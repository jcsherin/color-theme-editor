import React, { useEffect, useReducer, useState } from "react";
import { ColorDict, parseColors, updateColorName } from "./color";
import * as example from "./utils/example";

import { CopyButton } from "./clipboard";
import {
  Selectable,
  allGrouped,
  SelectableItem,
  groupSelected,
  isSelected,
  makeSelectable,
  someSelected,
  toggleStatus,
  ungroup,
  ColorGroupButton,
  ColorGroupDict,
  parseColorGroups,
} from "./grouping";
import {
  ColorThemeInput,
  isUnparsedColorThemeEmpty,
  UnparsedColorTheme,
} from "./input";
import { TreeEditor } from "./editor";
import { serializeConfig, State } from "./state";
import { Wizard, wizardNextStep, wizardPrevStep, makeWizard } from "./wizard";

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
  colorListItem: SelectableItem;
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
  const colorList: SelectableItem[] = state.colorList;
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
      const colorList = Array.from(colorDict.keys()).map(makeSelectable);

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
    .flatMap((colorListItem) => {
      const color = state.colorDict.get(colorListItem.colorId);
      return color ? [{ colorListItem, color: color }] : [];
    })
    .map(({ colorListItem, color }) => (
      <Selectable
        className="mr-1 mb-1 p-1"
        key={colorListItem.colorId}
        color={color}
        selectableItem={colorListItem}
        handleSelection={(item) =>
          dispatch({
            kind: "toggleStatus",
            colorListItem: item,
          })
        }
      />
    ));

  console.log(Array.from(state.colorGroupDict.values()));

  const isDisabledGroupButton = !someSelected(state.colorList);
  const colorGroupsButtonRow = allGrouped(state.colorList) ? (
    <p className="text-2xl text-center bg-yellow-200 py-2">
      Great! You've completed grouping all the colors.
    </p>
  ) : (
    Array.from(state.colorGroupDict.keys())
      .flatMap((groupId) => {
        const colorGroup = state.colorGroupDict.get(groupId);
        return colorGroup ? [colorGroup] : [];
      })
      .map((colorGroup) => (
        <ColorGroupButton
          key={colorGroup.name}
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
