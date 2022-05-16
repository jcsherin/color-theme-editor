import React from "react";

import { FormAction, FormData, FormEntry } from "../form";
import { ThemeEditor } from "../grouping";
import type { Action, State } from "../state";
import type { WizardAction } from "./reducer";
import type { Wizard } from "./index";

export function WizardUI({
  wizard,
  dispatch,
}: {
  wizard: Wizard;
  dispatch: React.Dispatch<WizardAction | FormAction | Action>;
}) {
  // FIXME: batch reduce
  const handleNextUI = () => {
    dispatch({ kind: "next" });
    dispatch({
      kind: "parse",
      form: wizard.steps[wizard.currentIdx].state as FormData,
    });
  };

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
}
