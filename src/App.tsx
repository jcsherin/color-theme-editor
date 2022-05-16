import React, { useEffect, useReducer } from "react";
import * as example from "./utils/example";

import type { FormData, FormEntryUI, FormEntryUISerialized } from "./form";
import { FormEntry } from "./form";
import { reducer, State, SerializedState, Action } from "./state";

import { ThemeConfig } from "./ThemeConfig";

interface MainUI {
  kind: "main";
  state: State;
}

type WizardUI = FormEntryUI | MainUI;

interface MainUISerialized {
  kind: "main";
  state: SerializedState;
}

type SerializedWizardUI = FormEntryUISerialized | MainUISerialized;

interface Wizard {
  steps: WizardUI[];
  currentIdx: number;
}

interface SerializedWizard {
  steps: SerializedWizardUI[];
  currentIdx: number;
}

function createFormEntryUI(state: FormData): FormEntryUI {
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

function createWizard(formData: FormData, state: State): Wizard {
  const formEntryUI = createFormEntryUI(formData);
  const mainUI = createMainUI(state);

  return {
    steps: [formEntryUI, mainUI],
    currentIdx: 0,
  };
}

function nextWizardUI(wizard: Wizard): Wizard {
  return wizard.currentIdx === wizard.steps.length - 1
    ? wizard
    : { ...wizard, currentIdx: wizard.currentIdx + 1 };
}

function prevWizardUI(wizard: Wizard): Wizard {
  return wizard.currentIdx === 0
    ? wizard
    : { ...wizard, currentIdx: wizard.currentIdx - 1 };
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

function serializeWizardUI(ui: FormEntryUI | MainUI): SerializedWizardUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return serializeMainUI(ui);
  }
}

function deserializeWizardUI(ui: SerializedWizardUI): WizardUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return deserializeMainUI(ui);
  }
}

function serializeWizard(wizard: Wizard): SerializedWizard {
  return {
    ...wizard,
    steps: wizard.steps.map(serializeWizardUI),
  };
}

function deserializeWiz(serialized: SerializedWizard): Wizard {
  return {
    ...serialized,
    steps: serialized.steps.map(deserializeWizardUI),
  };
}

interface NextWizardUI {
  kind: "next";
}

interface PrevWizardUI {
  kind: "prev";
}

interface FormLoadExample {
  kind: "loadExample";
}

interface FormReset {
  kind: "resetForm";
}

type WizardAction = NextWizardUI | PrevWizardUI;
type FormAction = FormLoadExample | FormReset;

function topLevelReducer(
  wizard: Wizard,
  action: WizardAction | FormAction | Action
): Wizard {
  switch (action.kind) {
    case "next":
      return nextWizardUI(wizard);
    case "prev":
      return prevWizardUI(wizard);
    case "loadExample":
    case "resetForm":
      switch (wizard.steps[wizard.currentIdx].kind) {
        case "formEntry": {
          const state = formReducer(
            wizard.steps[wizard.currentIdx].state as FormData,
            action
          );
          return {
            ...wizard,
            steps: wizard.steps.map((ui, idx) =>
              ui.kind === "formEntry" && idx === wizard.currentIdx
                ? { ...ui, state: state }
                : ui
            ),
          };
        }
        case "main":
          return wizard;
      }
    case "parse":
    case "addToGroup":
    case "removeFromGroup":
    case "renameColor":
    case "toggleStatus":
    case "reset":
      switch (wizard.steps[wizard.currentIdx].kind) {
        case "formEntry":
          return wizard;
        case "main": {
          const state = reducer(
            wizard.steps[wizard.currentIdx].state as State,
            action
          );
          return {
            ...wizard,
            steps: wizard.steps.map((ui, idx) =>
              ui.kind === "main" && idx === wizard.currentIdx
                ? { ...ui, state: state }
                : ui
            ),
          };
        }
      }
  }
}

function formReducer(_form: FormData, action: FormAction): FormData {
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
    : createWizard(
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
    localStorage.setItem(cacheKey, JSON.stringify(serializeWizard(wizard)));
  }, [wizard]);
  const handleNextUI = () => {
    dispatch({ kind: "next" });
    dispatch({
      kind: "parse",
      form: wizard.steps[wizard.currentIdx].state as FormData,
    });
  };
  const handlePrevUI = () => dispatch({ kind: "prev" });
  const handleLoadExample = () => dispatch({ kind: "loadExample" });
  const handleResetData = () => dispatch({ kind: "resetForm" });

  const renderWizardUI = (wizard: Wizard) => {
    switch (wizard.steps[wizard.currentIdx].kind) {
      case "formEntry": {
        const state = wizard.steps[wizard.currentIdx].state as FormData;

        return (
          <FormEntry
            state={state}
            handleNextUI={handleNextUI}
            handleLoadExample={handleLoadExample}
            handleResetForm={handleResetData}
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
