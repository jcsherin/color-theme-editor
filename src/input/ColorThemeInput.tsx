import React from "react";

export interface UnparsedColorTheme {
  classnames: string;
  colors: string;
}

interface ColorThemeInputProps {
  unparsedColorTheme: UnparsedColorTheme;
}
export function isUnparsedColorThemeEmpty(
  unparsedColorTheme: UnparsedColorTheme
): boolean {
  return (
    unparsedColorTheme.classnames.trim().length === 0 &&
    unparsedColorTheme.colors.trim().length === 0
  );
}

export function ColorThemeInput({ unparsedColorTheme }: ColorThemeInputProps) {
  return (
    <div className="grid grid-cols-2">
      <div className="mr-4">
        <p className="text-xl mb-1">Utility Classnames</p>
        <textarea
          className="w-full bg-slate-100 h-60 py-2 px-4"
          placeholder="One name per line"
          value={unparsedColorTheme.classnames}
          onChange={(_e) => {}}
        />
      </div>
      <div>
        <p className="text-xl mb-1">Color Values:</p>
        <textarea
          className="w-full bg-slate-100 h-60 py-2 px-4"
          placeholder="One color value per line"
          value={unparsedColorTheme.colors}
          onChange={(_e) => {}}
        />
      </div>
    </div>
  );
}
