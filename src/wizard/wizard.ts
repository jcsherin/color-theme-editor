interface WizardStep {
  kind: "colorThemeInput" | "colorThemeConfig";
}
export interface Wizard {
  steps: WizardStep[];
  currStep: number;
}

export function makeWizard(): Wizard {
  return {
    steps: [{ kind: "colorThemeInput" }, { kind: "colorThemeConfig" }],
    currStep: 0,
  };
}

export function wizardNextStep(wizard: Wizard): Wizard {
  return wizard.currStep < wizard.steps.length - 1
    ? { ...wizard, currStep: wizard.currStep + 1 }
    : wizard;
}

export function wizardPrevStep(wizard: Wizard): Wizard {
  return wizard.currStep > 0
    ? { ...wizard, currStep: wizard.currStep - 1 }
    : wizard;
}
