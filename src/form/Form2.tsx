import React, { FormEvent, useState } from "react";
import { stagedColorTheme } from "../utils/example";
import { FormData, FormHelper } from "./index";

export function Form2({
  formData,
  handleUpdateForm,
}: {
  formData: FormData;
  handleUpdateForm: (form: FormData) => void;
}) {
  const [state, setState] = useState<FormData>(formData);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleUpdateForm(state);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="h-12 flex items-center">
        <FormHelper
          className="justify-self-end ml-auto py-1 px-4 rounded-sm border border-pink-700 hover:border-pink-400 text-pink-700"
          formData={state}
          handleLoadExample={() =>
            setState(() => {
              return {
                groupNames: stagedColorTheme.groupNames,
                colors: stagedColorTheme.colors,
              };
            })
          }
          handleResetForm={() =>
            setState(() => {
              return { groupNames: "", colors: "" };
            })
          }
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
            onChange={(event) => {
              setState(() => {
                return { ...state, groupNames: event.target.value };
              });
            }}
          />
          <textarea
            className="grow w-full bg-slate-900 text-slate-200 font-mono h-80 py-2 px-4"
            placeholder="Enter one color value per line"
            value={state.colors}
            onChange={(event) => {
              setState(() => {
                return { ...state, colors: event.target.value };
              });
            }}
          />
        </div>
      </div>
    </form>
  );
}
