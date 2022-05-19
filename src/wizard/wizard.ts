import { FormEntryUI, FormEntryUISerialized } from "../form";
import {
  deserializeEditUI,
  EditUI,
  EditUISerialized,
  serializeEditUI,
} from "../theme-editor";

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

export function createWizard(steps: WizardUI[]): Wizard {
  return {
    steps: steps,
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

export function nextWizard(wizard: Wizard): Wizard {
  return wizard.currentIdx === wizard.steps.length - 1
    ? wizard
    : { ...wizard, currentIdx: wizard.currentIdx + 1 };
}

export function prevWizard(wizard: Wizard): Wizard {
  return wizard.currentIdx === 0
    ? wizard
    : { ...wizard, currentIdx: wizard.currentIdx - 1 };
}
