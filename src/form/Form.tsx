import type { FormData } from "./FormData";

import React, { FormEvent, useState } from "react";
import { stagedColorTheme } from "../utils/example";
import { ContextAction } from "./ContextAction";

interface FormProps {
  formData: FormData;
  handleUpdateForm: (form: FormData) => void;
}

export function Form({ formData, handleUpdateForm }: FormProps) {
  const [state, setState] = useState<FormData>(formData);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleUpdateForm(state);
  };

  const handleLoadExample = () =>
    setState(() => {
      return {
        groupNames: stagedColorTheme.groupNames,
        colors: stagedColorTheme.colors,
      };
    });

  const handleResetForm = () =>
    setState(() => {
      return { groupNames: "", colors: "" };
    });

  const handleUpdateGroupNames = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) =>
    setState(() => {
      return { ...state, groupNames: event.target.value };
    });

  const handleUpdateColors = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setState(() => {
      return { ...state, colors: event.target.value };
    });

  return (
    <form onSubmit={handleSubmit}>
      <div className="h-12 flex items-center">
        <ContextAction
          className="justify-self-end ml-auto py-1 px-4 rounded-sm border border-pink-700 hover:border-pink-400 text-pink-700"
          formData={state}
          handleLoadExample={handleLoadExample}
          handleResetForm={handleResetForm}
        />
        <button
          type="submit"
          className="py-1 px-4 rounded-sm bg-sky-900 hover:bg-sky-700 text-sky-50"
        >
          Submit
        </button>
      </div>
      <div>
        <div className="flex flex-col" style={{ height: `calc(100vh - 4rem)` }}>
          <textarea
            className="grow w-full bg-slate-900 text-slate-200 font-mono h-80 py-2 px-4 mb-2"
            placeholder="Enter one group name per line"
            value={state.groupNames}
            onChange={handleUpdateGroupNames}
          />
          <textarea
            className="grow w-full bg-slate-900 text-slate-200 font-mono h-80 py-2 px-4"
            placeholder="Enter one color value per line"
            value={state.colors}
            onChange={handleUpdateColors}
          />
        </div>
      </div>
    </form>
  );
}
