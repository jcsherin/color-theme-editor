import type { RawTheme } from "./rawTheme";

import React, { FormEvent, useState } from "react";
import {
  createRawTheme,
  emptyRawTheme,
  isEmptySource,
  updateColors,
  updateGroupNames,
} from "./rawTheme";
import { stagedColorTheme } from "../utils/example";

interface ThemeInputProps {
  init: RawTheme;
  handleUpdate: (form: RawTheme) => void;
}

export function ThemeInput({
  init,
  handleUpdate: handleUpdate,
}: ThemeInputProps) {
  const [state, setState] = useState<RawTheme>(init);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleUpdate(state);
  };

  const handleLoadExample = (groupNames: string, colors: string) =>
    setState(() => {
      return createRawTheme(groupNames, colors);
    });

  const handleResetForm = () => setState(emptyRawTheme);

  const handleUpdateGroupNames = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => setState(() => updateGroupNames(state, event.target.value));

  const handleUpdateColors = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    setState(() => updateColors(state, event.target.value));

  const secondaryActionClassName =
    "justify-self-end ml-auto py-1 px-4 rounded-sm border border-pink-700 hover:border-pink-400 text-pink-700";

  return (
    <form onSubmit={handleSubmit}>
      <div className="h-12 flex items-center">
        {isEmptySource(state) ? (
          <button
            onClick={(event) => {
              event.preventDefault();
              handleLoadExample(
                stagedColorTheme.groupNames,
                stagedColorTheme.colors
              );
            }}
            className={`mr-4 ${secondaryActionClassName}`}
          >
            Load Example
          </button>
        ) : (
          <button
            onClick={(event) => {
              event.preventDefault();
              handleResetForm();
            }}
            className={`text-red-500 hover:text-red-700 mr-4 ${secondaryActionClassName}`}
          >
            Reset Form
          </button>
        )}
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
