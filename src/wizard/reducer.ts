import { formReducer } from "../form";
import { reducer } from "../theme-editor";

import { nextWizard, prevWizard, Wizard } from "./index";
import type { FormAction, FormData } from "../form";
import type { ThemeEditorState, ThemeEditorAction } from "../theme-editor";

interface NextWizardUI {
  kind: "next";
}

interface PrevWizardUI {
  kind: "prev";
}

type WizardAction = NextWizardUI | PrevWizardUI;
type Action = WizardAction | FormAction | ThemeEditorAction;

interface BatchOrdered<T> {
  kind: "batchOrdered";
  actions: T[];
}

export function wizardReducer(
  wizard: Wizard,
  action: Action | BatchOrdered<Action>
): Wizard {
  switch (action.kind) {
    case "batchOrdered":
      return action.actions.reduce(
        (prevState, currAction) => wizardReducer(prevState, currAction),
        wizard
      );
    case "next":
      return nextWizard(wizard);
    case "prev":
      return prevWizard(wizard);
    case "loadExample":
    case "resetForm":
    case "updateForm":
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
    case "updateFormData":
      switch (wizard.steps[wizard.currentIdx].kind) {
        case "formEntry":
          return wizard;
        case "main": {
          const state = reducer(
            wizard.steps[wizard.currentIdx].state as ThemeEditorState,
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
