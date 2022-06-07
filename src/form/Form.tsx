import React from "react";
import { FormData } from "./index";

export function Form({
  form,
  handleUpdateForm,
}: {
  form: FormData;
  handleUpdateForm: (form: FormData) => void;
}) {
  return (
    <div className="grid grid-cols-2" style={{ height: `calc(100% - 56px)` }}>
      <div className="mr-2 flex flex-col">
        <p className="mb-1">Enter Group Names</p>
        <textarea
          className="grow w-full bg-slate-800 text-slate-200 font-mono h-80 py-2 px-4"
          placeholder="One name per line"
          value={form.classnames}
          onChange={(event) => {
            handleUpdateForm({
              ...form,
              classnames: event.currentTarget.value,
            });
          }}
        />
      </div>
      <div className="flex flex-col">
        <p className="mb-1">Enter Color Values</p>
        <textarea
          className="grow w-full bg-slate-800 text-slate-200 font-mono h-80 py-2 px-4"
          placeholder="One color value per line"
          value={form.colors}
          onChange={(event) => {
            handleUpdateForm({ ...form, colors: event.currentTarget.value });
          }}
        />
      </div>
    </div>
  );
}
