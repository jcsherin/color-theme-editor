import { formReducer } from "../form";
import { reducer } from "../theme-editor";

import type { Wizard } from "./index";
import type { FormAction, FormData } from "../form";
import type { ThemeEditorState, ThemeEditorAction } from "../theme-editor";

interface NextWizardUI {
  kind: "next";
}

interface PrevWizardUI {
  kind: "prev";
}

export type WizardAction = NextWizardUI | PrevWizardUI;

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
