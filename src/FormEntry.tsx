import React from "react";
import {
  ColorThemeInput,
  isUnparsedColorThemeEmpty,
  UnparsedColorTheme,
} from "./input";

export function FormEntry({
  state: unparsedColorTheme,
  handleNextUI,
  handleLoadExample,
  handleResetForm,
}: {
  state: UnparsedColorTheme;
  handleNextUI: (_event: React.MouseEvent) => void;
  handleLoadExample: (_event: React.MouseEvent) => void;
  handleResetForm: (_event: React.MouseEvent) => void;
}) {
  return (
    <>
      <div className="mb-4">
        <button
          onClick={handleNextUI}
          className="mr-4 py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
          disabled={isUnparsedColorThemeEmpty(unparsedColorTheme)}
        >
          Next
        </button>
        {isUnparsedColorThemeEmpty(unparsedColorTheme) ? (
          <button
            onClick={handleLoadExample}
            className="text-blue-500 hover:text-blue-700 text-xl"
          >
            Load Example
          </button>
        ) : (
          <button
            onClick={handleResetForm}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            Reset All Values
          </button>
        )}
      </div>
      <ColorThemeInput unparsedColorTheme={unparsedColorTheme} />
    </>
  );
}
