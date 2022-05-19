import React, { useEffect, useReducer } from "react";

import {
  createWizard,
  deserializeWizard,
  serializeWizard,
  Wizard,
  wizardReducer,
} from "./wizard";

import { FormData, FormEntry } from "./form";
import { ThemeEditor, ThemeEditorState } from "./theme-editor";
import { initFormData } from "./form/FormEntry";
import { initThemeEditorState } from "./theme-editor/reducer";

function init({ cacheKey }: { cacheKey: string }) {
  const cached = localStorage.getItem(cacheKey);
  return cached
    ? deserializeWizard(JSON.parse(cached))
    : createWizard(initFormData(), initThemeEditorState());
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

  const handleNextUI = (wizard: Wizard) => () => {
    dispatch({ kind: "next" });
    dispatch({
      kind: "parse",
      form: wizard.steps[wizard.currentIdx].state as FormData,
    });
  };

  const renderWizard = (wizard: Wizard) => {
    switch (wizard.steps[wizard.currentIdx].kind) {
      case "formEntry": {
        const state = wizard.steps[wizard.currentIdx].state as FormData;

        return (
          <FormEntry
            state={state}
            handleNextUI={handleNextUI(wizard)}
            handleLoadExample={() => dispatch({ kind: "loadExample" })}
            handleResetForm={() => dispatch({ kind: "resetForm" })}
          />
        );
      }

      case "main": {
        const state = wizard.steps[wizard.currentIdx].state as ThemeEditorState;

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

  return <div className="mx-2 my-8">{renderWizard(wizard)}</div>;
}
