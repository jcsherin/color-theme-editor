import React from "react";
import { Form } from "./index";
import { FormData } from "./index";

export interface FormEntryUI {
  kind: "formEntry";
  state: FormData;
}

export type FormEntryUISerialized = FormEntryUI;

type FillState = "empty" | "partiallyFilled" | "filled";

function toFillState(form: FormData): FillState {
  if (form.groupNames.length === 0 && form.colors.length === 0) return "empty";
  if (form.groupNames.length === 0 || form.colors.length === 0)
    return "partiallyFilled";
  return "filled";
}

export function createFormEntryUI(state: FormData): FormEntryUI {
  return {
    kind: "formEntry",
    state: state,
  };
}

function isEmptyForm(form: FormData): boolean {
  return form.groupNames.trim().length === 0 || form.colors.trim().length === 0;
}

function HelperAction({
  form,
  handleLoadExample,
  handleResetForm,
}: {
  form: FormData;
  handleLoadExample: () => void;
  handleResetForm: () => void;
}) {
  switch (toFillState(form)) {
    case "empty": {
      return (
        <button
          onClick={(_event) => handleLoadExample()}
          className="text-blue-500 hover:text-blue-700"
        >
          Load Example
        </button>
      );
    }
    case "partiallyFilled":
    case "filled": {
      return (
        <button
          onClick={(_event) => handleResetForm()}
          className="text-red-500 hover:text-red-700"
        >
          Reset Form
        </button>
      );
    }
  }
}

function ActionBar({
  form,
  handleNextUI,
  handleLoadExample,
  handleResetForm,
}: {
  form: FormData;
  handleNextUI: () => void;
  handleLoadExample: () => void;
  handleResetForm: () => void;
}) {
  return (
    <div className="h-10 mb-4 flex items-center">
      <button
        onClick={(_event) => handleNextUI()}
        className="mr-4 py-1 px-4 rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
        disabled={isEmptyForm(form)}
      >
        Group Colors
      </button>
      <HelperAction
        form={form}
        handleLoadExample={handleLoadExample}
        handleResetForm={handleResetForm}
      />
    </div>
  );
}

export function FormEntry({
  state: form,
  handleNextUI,
  handleLoadExample,
  handleResetForm,
  handleUpdateForm,
}: {
  state: FormData;
  handleNextUI: () => void;
  handleLoadExample: () => void;
  handleResetForm: () => void;
  handleUpdateForm: (form: FormData) => void;
}) {
  return (
    <>
      <ActionBar
        form={form}
        handleNextUI={handleNextUI}
        handleLoadExample={handleLoadExample}
        handleResetForm={handleResetForm}
      />
      <Form
        className="grid grid-cols-2"
        style={{ height: `calc(100% - 56px)` }}
        form={form}
        handleUpdateForm={handleUpdateForm}
      />
    </>
  );
}
