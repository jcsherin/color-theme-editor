import React, { useEffect, useReducer } from "react";
import * as example from "./utils/example";

import { UnparsedColorTheme } from "./input";
import { reducer, State, SerializedState, Action } from "./state";
import { FormEntry } from "./FormEntry";
import { ThemeConfig } from "./ThemeConfig";

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

function topLevelReducer(
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

const cacheKey = "wizard";

export default function App() {
  const [wizard, dispatch] = useReducer(
    topLevelReducer,
    { cacheKey: cacheKey },
    init
  );

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(serializeWiz(wizard)));
  }, [wizard]);
  const handleNextUI = () => {
    dispatch({ kind: "next" });
    dispatch({
      kind: "parse",
      unparsedColorTheme: wizard.steps[wizard.currentIdx]
        .state as UnparsedColorTheme,
    });
  };
  const handlePrevUI = () => dispatch({ kind: "prev" });
  const handleLoadExample = () => dispatch({ kind: "loadExample" });
  const handleResetData = () => dispatch({ kind: "resetForm" });

  const renderWizardUI = (wizard: Wiz) => {
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

      case "main": {
        const state = wizard.steps[wizard.currentIdx].state as State;

        return (
          <ThemeConfig
            state={state}
            handlePrevUI={(_e) => handlePrevUI()}
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
            handleAddToGroup={(groupName) =>
              dispatch({ kind: "addToGroup", groupName: groupName })
            }
            handleToggleStatus={(selectableItem) =>
              dispatch({
                kind: "toggleStatus",
                selectableItem: selectableItem,
              })
            }
          />
        );
      }
    }
  };

  return <div className="mx-2 my-8">{renderWizardUI(wizard)}</div>;
}
