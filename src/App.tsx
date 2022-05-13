import React, { useEffect, useReducer } from "react";
import * as example from "./utils/example";

import { CopyButton } from "./clipboard";
import { UnparsedColorTheme } from "./input";
import { TreeEditor } from "./editor";
import {
  serializeConfig,
  reducer,
  State,
  SerializedState,
  Action,
} from "./state";
import { GroupColors } from "./grouping/GroupColors";
import { FormEntry } from "./FormEntry";

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
    : { ...wiz, currentIdx: wiz.currentIdx + 1 };
}

function prevWizUI(wiz: Wiz): Wiz {
  return wiz.currentIdx === 0
    ? wiz
    : { ...wiz, currentIdx: wiz.currentIdx - 1 };
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
    ...serialized,
    steps: serialized.steps.map(deserializeWizUI),
  };
}

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

function init({ cacheKey }: { cacheKey: string }) {
  const cached = localStorage.getItem(cacheKey);
  return cached
    ? deserializeWiz(JSON.parse(cached))
    : createWiz(
        {
          classnames: "",
          colors: "",
        },
        {
          colorDict: new Map(),
          colorGroupDict: new Map(),
          colorList: [],
        }
      );
}

const cacheKey = "wiz";

export default function App() {
  const [_topLevel, _dispatchTopLevel] = useReducer(
    _topLevelReducer,
    { cacheKey: cacheKey },
    init
  );

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(serializeWiz(_topLevel)));
  }, [_topLevel]);
  const handleNextUI = () => {
    _dispatchTopLevel({ kind: "next" });
    _dispatchTopLevel({
      kind: "parse",
      unparsedColorTheme: _topLevel.steps[_topLevel.currentIdx]
        .state as UnparsedColorTheme,
    });
  };
  const handlePrevUI = () => _dispatchTopLevel({ kind: "prev" });
  const handleLoadExample = () => _dispatchTopLevel({ kind: "loadExample" });
  const handleResetData = () => _dispatchTopLevel({ kind: "resetForm" });

  const colorThemeConfigUI = ({ state }: { state: State }) => (
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
            _dispatchTopLevel({
              kind: "renameColor",
              colorId: colorId,
              newName: newName,
            })
          }
          handleRemoveFromGroup={(colorId, groupName) =>
            _dispatchTopLevel({
              kind: "removeFromGroup",
              groupName: groupName,
              colorId: colorId,
            })
          }
        />
        <GroupColors
          state={state}
          handleSelection={(selectableItem) =>
            _dispatchTopLevel({
              kind: "toggleStatus",
              selectableItem: selectableItem,
            })
          }
          handleAddToGroup={(groupName) =>
            _dispatchTopLevel({ kind: "addToGroup", groupName: groupName })
          }
        />
      </div>
    </>
  );

  const showUI = (wizard: Wiz) => {
    switch (wizard.steps[wizard.currentIdx].kind) {
      case "formEntry": {
        const state = wizard.steps[wizard.currentIdx]
          .state as UnparsedColorTheme;

        return (
          <FormEntry
            state={state}
            handleNextUI={(_e) => handleNextUI()}
            handleLoadExample={(_e) => handleLoadExample()}
            handleResetForm={(_e) => handleResetData()}
          />
        );
      }

      case "main":
        return colorThemeConfigUI({
          state: wizard.steps[wizard.currentIdx].state as State,
        });
    }
  };

  return <div className="mx-2 my-8">{showUI(_topLevel)}</div>;
}
