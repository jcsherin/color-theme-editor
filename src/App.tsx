import React, { useEffect, useReducer } from "react";

import type {
  FormAction,
  FormData,
  FormEntryUI,
  FormEntryUISerialized,
} from "./form";
import type { EditUI, EditUISerialized } from "./grouping";

import { FormEntry, createFormEntryUI, formReducer } from "./form";
import {
  ThemeEditor,
  createEditUI,
  serializeEditUI,
  deserializeEditUI,
} from "./grouping";
import { reducer, State, Action } from "./state";

type WizardUI = FormEntryUI | EditUI;

type SerializedWizardUI = FormEntryUISerialized | EditUISerialized;

interface Wizard {
  steps: WizardUI[];
  currentIdx: number;
}

interface SerializedWizard {
  steps: SerializedWizardUI[];
  currentIdx: number;
}

function createWizard(formData: FormData, state: State): Wizard {
  const formEntryUI = createFormEntryUI(formData);
  const editUI = createEditUI(state);

  return {
    steps: [formEntryUI, editUI],
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

function serializeWizardUI(ui: FormEntryUI | EditUI): SerializedWizardUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return serializeEditUI(ui);
  }
}

function deserializeWizardUI(ui: SerializedWizardUI): WizardUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return deserializeEditUI(ui);
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

type WizardAction = NextWizardUI | PrevWizardUI;

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
          <ThemeEditor
            state={state}
            handlePrevUI={handlePrevUI}
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
