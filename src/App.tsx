import React, { useEffect, useReducer } from "react";

import type { FormAction, FormData } from "./form";
import {
  createWizard,
  deserializeWiz,
  nextWizardUI,
  prevWizardUI,
  serializeWizard,
  Wizard,
} from "./wizard";

import { FormEntry, formReducer } from "./form";
import { ThemeEditor } from "./grouping";
import { reducer, State, Action } from "./state";

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

  // FIXME: batch reduce
  const handleNextUI = () => {
    dispatch({ kind: "next" });
    dispatch({
      kind: "parse",
      form: wizard.steps[wizard.currentIdx].state as FormData,
    });
  };

  const renderWizardUI = (wizard: Wizard) => {
    switch (wizard.steps[wizard.currentIdx].kind) {
      case "formEntry": {
        const state = wizard.steps[wizard.currentIdx].state as FormData;

        return (
          <FormEntry
            state={state}
            handleNextUI={handleNextUI}
            handleLoadExample={() => dispatch({ kind: "loadExample" })}
            handleResetForm={() => dispatch({ kind: "resetForm" })}
          />
        );
      }

      case "main": {
        const state = wizard.steps[wizard.currentIdx].state as State;

        return (
          <ThemeEditor
            state={state}
            handlePrevUI={() => dispatch({ kind: "prev" })}
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
