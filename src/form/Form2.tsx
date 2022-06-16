import React, { FormEvent, useState } from "react";
import { FormData } from "./index";

export function Form2({
  className,
  style,
  formData,
  handleUpdateForm,
}: {
  className?: string;
  style?: React.CSSProperties;
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
      <div className="h-10 mb-4 flex items-center">
        <button
          type="submit"
          className="justify-self-end ml-auto py-1 px-4 rounded-sm bg-sky-900 hover:bg-sky-700 text-sky-50"
        >
          Submit
        </button>
      </div>
      <div className={className} style={style}>
        <div className="mr-2 flex flex-col">
          <p className="mb-1">Enter Group Names</p>
          <textarea
            className="grow w-full bg-slate-800 text-slate-200 font-mono h-80 py-2 px-4"
            placeholder="One name per line"
            value={state.classnames}
            onChange={(event) => {
              setState(() => {
                return { ...state, classnames: event.target.value };
              });
            }}
          />
        </div>
        <div className="flex flex-col">
          <p className="mb-1">Enter Color Values</p>
          <textarea
            className="grow w-full bg-slate-800 text-slate-200 font-mono h-80 py-2 px-4"
            placeholder="One color value per line"
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
