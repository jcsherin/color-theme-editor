import React from "react";

export interface FormEntryUI {
  kind: "formEntry";
  state: FormData;
}

export type FormEntryUISerialized = FormEntryUI;

export interface FormData {
  classnames: string;
  colors: string;
}

export function initFormData(): FormData {
  return { classnames: "", colors: "" };
}

export function createFormEntryUI(state: FormData): FormEntryUI {
  return {
    kind: "formEntry",
    state: state,
  };
}

function isEmptyForm(form: FormData): boolean {
  return form.classnames.trim().length === 0 && form.colors.trim().length === 0;
}

function Form({ form }: { form: FormData }) {
  return (
    <div className="grid grid-cols-2">
      <div className="mr-4">
        <p className="text-xl mb-1">Group Names</p>
        <textarea
          className="w-full bg-slate-100 h-60 py-2 px-4"
          placeholder="One name per line"
          value={form.classnames}
          onChange={(_e) => {}}
        />
      </div>
      <div>
        <p className="text-xl mb-1">Color Values</p>
        <textarea
          className="w-full bg-slate-100 h-60 py-2 px-4"
          placeholder="One color value per line"
          value={form.colors}
          onChange={(_e) => {}}
        />
      </div>
    </div>
  );
}

function ActionBar({
  isEmptyForm,
  handleNextUI,
  handleLoadExample,
  handleResetForm,
}: {
  isEmptyForm: boolean;
  handleNextUI: () => void;
  handleLoadExample: () => void;
  handleResetForm: () => void;
}) {
  return (
    <div className="mb-4">
      <button
        onClick={(_event) => handleNextUI()}
        className="mr-4 py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
        disabled={isEmptyForm}
      >
        Next
      </button>
      {isEmptyForm ? (
        <button
          onClick={(_event) => handleLoadExample()}
          className="text-blue-500 hover:text-blue-700 text-xl"
        >
          Load Example
        </button>
      ) : (
        <button
          onClick={(_event) => handleResetForm()}
          className="text-red-500 hover:text-red-700 text-xl"
        >
          Reset All Values
        </button>
      )}
    </div>
  );
}

export function FormEntry({
  state: form,
  handleNextUI,
  handleLoadExample,
  handleResetForm,
}: {
  state: FormData;
  handleNextUI: () => void;
  handleLoadExample: () => void;
  handleResetForm: () => void;
}) {
  return (
    <>
      <ActionBar
        isEmptyForm={isEmptyForm(form)}
        handleNextUI={handleNextUI}
        handleLoadExample={handleLoadExample}
        handleResetForm={handleResetForm}
      />
      <Form form={form} />
    </>
  );
}
