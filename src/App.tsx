import React, { useEffect, useReducer, useState } from "react";
import * as example from "./utils/example";

import { CopyButton } from "./clipboard";
import {
  ColorThemeInput,
  isUnparsedColorThemeEmpty,
  UnparsedColorTheme,
} from "./input";
import { TreeEditor } from "./editor";
import {
  serializeConfig,
  reducer,
  getInitialState,
  State,
  SerializedState,
  Action,
} from "./state";
import { Wizard, wizardNextStep, wizardPrevStep, makeWizard } from "./wizard";
import { GroupColors } from "./grouping/GroupColors";

interface FormEntryUI {
  kind: "formEntry";
  state: UnparsedColorTheme;
}

interface MainUI {
  kind: "main";
  state: State;
}

type WizUI = FormEntryUI | MainUI;

interface MainUISerialized {
  kind: "main";
  state: SerializedState;
}

type FormEntryUISerialized = FormEntryUI;
type SerializedWizUI = FormEntryUISerialized | MainUISerialized;

interface Wiz {
  steps: WizUI[];
  currentIdx: number;
}

interface SerializedWiz {
  steps: SerializedWizUI[];
  currentIdx: number;
}

function createFormEntryUI(state: UnparsedColorTheme): FormEntryUI {
  return {
    kind: "formEntry",
    state: state,
  };
}

function createMainUI(state: State): MainUI {
  return {
    kind: "main",
    state: state,
  };
}

function createWiz(unparsedColorTheme: UnparsedColorTheme, state: State): Wiz {
  const formEntryUI = createFormEntryUI(unparsedColorTheme);
  const mainUI = createMainUI(state);

  return {
    steps: [formEntryUI, mainUI],
    currentIdx: 0,
  };
}

function nextWizUI(wiz: Wiz): Wiz {
  return wiz.currentIdx === wiz.steps.length - 1
    ? wiz
    : { ...wiz, currentIdx: wiz.currentIdx++ };
}

function prevWizUI(wiz: Wiz): Wiz {
  return wiz.currentIdx === 0 ? wiz : { ...wiz, currentIdx: wiz.currentIdx-- };
}

function serializeState(state: State): SerializedState {
  return {
    colorDict: Array.from(state.colorDict),
    colorGroupDict: Array.from(state.colorGroupDict),
    colorList: state.colorList,
  };
}

function deserializeState(state: SerializedState): State {
  return {
    ...state,
    colorDict: new Map(state.colorDict),
    colorGroupDict: new Map(state.colorGroupDict),
  };
}

function serializeMainUI(ui: MainUI): {
  state: SerializedState;
  kind: "main";
} {
  return { ...ui, state: serializeState(ui.state) };
}

function deserializeMainUI(ui: {
  kind: "main";
  state: SerializedState;
}): MainUI {
  return {
    ...ui,
    state: deserializeState(ui.state),
  };
}

function serializeWizUI(ui: FormEntryUI | MainUI): SerializedWizUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return serializeMainUI(ui);
  }
}

function deserializeWizUI(ui: SerializedWizUI): WizUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return deserializeMainUI(ui);
  }
}

function serializeWiz(wiz: Wiz): SerializedWiz {
  return {
    ...wiz,
    steps: wiz.steps.map(serializeWizUI),
  };
}

function deserializeWiz(serialized: SerializedWiz): Wiz {
  return {
    ...wiz,
    steps: serialized.steps.map(deserializeWizUI),
  };
}

const wiz = createWiz({ classnames: "", colors: "" }, getInitialState());
const wiz2 = nextWizUI(wiz);
const wiz3 = prevWizUI(wiz);

console.log(wiz);
console.log(serializeWiz(wiz));
console.log(serializeWiz(wiz2));
console.log(serializeWiz(nextWizUI(wiz2)));
console.log(serializeWiz(wiz3));
console.log(serializeWiz(prevWizUI(wiz3)));
console.log(deserializeWiz(serializeWiz(wiz2)));

interface NextWizUI {
  kind: "next";
}

interface PrevWizUI {
  kind: "prev";
}

interface FormLoadExample {
  kind: "loadExample";
}

interface FormReset {
  kind: "resetForm";
}

type WizAction = NextWizUI | PrevWizUI;
type FormAction = FormLoadExample | FormReset;

function _topLevelReducer(
  wiz: Wiz,
  action: WizAction | FormAction | Action
): Wiz {
  switch (action.kind) {
    case "next":
      return nextWizUI(wiz);
    case "prev":
      return prevWizUI(wiz);
    case "loadExample":
    case "resetForm":
      switch (wiz.steps[wiz.currentIdx].kind) {
        case "formEntry": {
          const state = formReducer(
            wiz.steps[wiz.currentIdx].state as UnparsedColorTheme,
            action
          );
          return {
            ...wiz,
            steps: wiz.steps.map((ui, idx) =>
              ui.kind === "formEntry" && idx === wiz.currentIdx
                ? { ...ui, state: state }
                : ui
            ),
          };
        }
        case "main":
          return wiz;
      }
    case "parse":
    case "addToGroup":
    case "removeFromGroup":
    case "renameColor":
    case "toggleStatus":
    case "reset":
      switch (wiz.steps[wiz.currentIdx].kind) {
        case "formEntry":
          return wiz;
        case "main": {
          const state = reducer(
            wiz.steps[wiz.currentIdx].state as State,
            action
          );
          return {
            ...wiz,
            steps: wiz.steps.map((ui, idx) =>
              ui.kind === "main" && idx === wiz.currentIdx
                ? { ...ui, state: state }
                : ui
            ),
          };
        }
      }
  }
}

function formReducer(
  _form: UnparsedColorTheme,
  action: FormAction
): UnparsedColorTheme {
  switch (action.kind) {
    case "loadExample":
      return {
        classnames: example.groupNames().join("\n"),
        colors: example.colors().join("\n"),
      };
    case "resetForm":
      return { classnames: "", colors: "" };
  }
}

export default function App() {
  const [_topLevel, _dispatchTopLevel] = useReducer(
    _topLevelReducer,
    createWiz(
      {
        classnames: "",
        colors: "",
      },
      getInitialState(true)
    )
  );
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
      classnames: example.groupNames().join("\n"),
      colors: example.colors().join("\n"),
    });

  const handleResetData = () => {
    setUnparsedColorTheme({ classnames: "", colors: "" });
    dispatch({ kind: "reset" });
  };

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
        <GroupColors
          state={state}
          handleSelection={(selectableItem) =>
            dispatch({
              kind: "toggleStatus",
              selectableItem: selectableItem,
            })
          }
          handleAddToGroup={(groupName) =>
            dispatch({ kind: "addToGroup", groupName: groupName })
          }
        />
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
