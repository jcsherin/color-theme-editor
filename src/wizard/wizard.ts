import type { State } from "../state";
import type { FormData } from "../form";

import { createFormEntryUI, FormEntryUI, FormEntryUISerialized } from "../form";
import {
  createEditUI,
  deserializeEditUI,
  EditUI,
  EditUISerialized,
  serializeEditUI,
} from "../grouping";

type WizardUI = FormEntryUI | EditUI;

type SerializedWizardUI = FormEntryUISerialized | EditUISerialized;

export interface Wizard {
  steps: WizardUI[];
  currentIdx: number;
}

interface SerializedWizard {
  steps: SerializedWizardUI[];
  currentIdx: number;
}

export function createWizard(formData: FormData, state: State): Wizard {
  const formEntryUI = createFormEntryUI(formData);
  const editUI = createEditUI(state);

  return {
    steps: [formEntryUI, editUI],
    currentIdx: 0,
  };
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

export function serializeWizard(wizard: Wizard): SerializedWizard {
  return {
    ...wizard,
    steps: wizard.steps.map(serializeWizardUI),
  };
}

export function deserializeWizard(serialized: SerializedWizard): Wizard {
  return {
    ...serialized,
    steps: serialized.steps.map(deserializeWizardUI),
  };
}
