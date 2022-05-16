import React, { useEffect, useReducer } from "react";

import type { FormData } from "./form";
import type { State } from "./state";
import type { Wizard } from "./wizard";

import { FormEntry } from "./form";
import { ThemeEditor } from "./grouping";
import {
  createWizard,
  deserializeWizard,
  serializeWizard,
  wizardReducer,
} from "./wizard";

function init({ cacheKey }: { cacheKey: string }) {
  const cached = localStorage.getItem(cacheKey);
  return cached
    ? deserializeWizard(JSON.parse(cached))
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
    wizardReducer,
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
