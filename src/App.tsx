import React, { useEffect, useReducer } from "react";

import {
  createWizard,
  deserializeWizard,
  serializeWizard,
  Wizard,
  wizardReducer,
} from "./wizard";
import { createFormEntryUI, FormData, FormEntry, initFormData } from "./form";
import {
  ThemeEditor,
  ThemeEditorState,
  initThemeEditorState,
  createEditUI,
} from "./theme-editor";

function init({
  cacheKey,
  formData,
  themeEditorState,
}: {
  cacheKey: string;
  formData: FormData;
  themeEditorState: ThemeEditorState;
}) {
  const cached = localStorage.getItem(cacheKey);

  const formEntryUI = createFormEntryUI(formData);
  const editUI = createEditUI(themeEditorState);
  const steps = [formEntryUI, editUI];

  return cached ? deserializeWizard(JSON.parse(cached)) : createWizard(steps);
}

const cacheKey = "wizard";

export default function App({ sampleFormData }: { sampleFormData: FormData }) {
  const [wizard, dispatch] = useReducer(
    wizardReducer,
    {
      cacheKey: cacheKey,
      formData: initFormData(),
      themeEditorState: initThemeEditorState(),
    },
    init
  );

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(serializeWizard(wizard)));
  }, [wizard]);

  const handleNextUI = (wizard: Wizard) => () => {
    dispatch({
      kind: "batchOrdered",
      actions: [
        { kind: "next" },
        {
          kind: "parse",
          form: wizard.steps[wizard.currentIdx].state as FormData,
        },
      ],
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
            handleLoadExample={() =>
              dispatch({
                kind: "loadExample",
                classnames: sampleFormData.classnames,
                colors: sampleFormData.colors,
              })
            }
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
