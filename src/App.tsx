import React, { useState } from "react";
import { BatchInput } from "./BatchInput";
import { Button } from "./Button";
import { ClipboardCopy } from "./ClipboardCopy";
import {
  ColorState,
  ColorTheme,
  ColorThemeInputFormat,
  createColorState,
  parseColors,
  parseGroups,
  tailwindJSON,
} from "./ColorTheme";
import { exampleColorGroups, exampleColorValues } from "./example";

interface TailwindViewerProps {
  colorTheme: ColorTheme;
}

function TailwindViewer({ colorTheme }: TailwindViewerProps) {
  const CURLY_OPEN = String.fromCharCode(123);
  const CURLY_CLOSE = String.fromCharCode(125);
  return (
    <div className="bg-slate-800 text-blue-300 p-8 mb-8 font-mono">
      <span>{CURLY_OPEN}</span>
      <div className="mx-6">
        "theme": <span>{CURLY_OPEN}</span>
        <div className="mx-6">
          "colors": <span>{CURLY_OPEN}</span>
          <span>{CURLY_CLOSE}</span>
        </div>
        <span>{CURLY_CLOSE}</span>
      </div>
      <span>{CURLY_CLOSE}</span>
    </div>
  );
}

function App() {
  const [colorThemeInput, setColorThemeInput] = useState<ColorThemeInputFormat>(
    {
      groupsTextValue: "",
      colorsTextValue: "",
    }
  );
  const [colorTheme, setColorTheme] = useState<ColorTheme>({
    groups: new Map<string, Set<string>>(),
    colors: new Set<ColorState>(),
  });

  const handleClearColorThemeInput = () =>
    setColorThemeInput({ groupsTextValue: "", colorsTextValue: "" });

  const handlePopulateFromExample = () =>
    setColorThemeInput({
      groupsTextValue: exampleColorGroups.join("\n"),
      colorsTextValue: exampleColorValues.join("\n"),
    });

  const handleUpdateColorTheme = () => {
    const { groupsTextValue, colorsTextValue } = colorThemeInput;
    setColorTheme({
      groups: new Map(
        parseGroups(groupsTextValue).map((group) => [group, new Set()])
      ),
      colors: new Set(parseColors(colorsTextValue).map(createColorState)),
    });
  };

  const isColorThemeInputEmpty =
    colorThemeInput.groupsTextValue.length === 0 &&
    colorThemeInput.colorsTextValue.length === 0;
  const reloadButtonClassName = isColorThemeInputEmpty
    ? "text-gray-400 hover:text-gray-600 bg-slate-200 hover:bg-slate-400 cursor-not-allowed"
    : "text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400";

  const handleColorSelection = (color: ColorState) => {
    setColorTheme((prevState) => {
      const newColors = Array.from(prevState.colors).map((item) => {
        if (item.value === color.value) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
      return { ...prevState, colors: new Set(newColors) };
    });
  };

  const handleGrouping = (group: string) => {
    console.log(`Grouping ${group}`);
    setColorTheme((prevState) => {
      const selectedColorValues = Array.from(prevState.colors)
        .filter((color) => color.selected)
        .map((color) => color.value);
      if (selectedColorValues.length === 0) {
        return prevState;
      }
      const colorValuesInGroup = Array.from(prevState.groups.get(group)!);
      const newGroups = new Map(
        prevState.groups.set(
          group,
          new Set([...colorValuesInGroup, ...selectedColorValues])
        )
      );
      const newColors = new Set(
        Array.from(prevState.colors).filter((color) => !color.selected)
      );
      return { groups: newGroups, colors: newColors };
    });
  };

  return (
    <div className="m-4">
      <BatchInput
        batch={colorThemeInput}
        handleBatchUpdate={setColorThemeInput}
      >
        <Button
          disabled={isColorThemeInputEmpty}
          className={`mr-4 px-12 py-2 font-bold ${reloadButtonClassName}`}
          handleClick={handleUpdateColorTheme}
          label="Use Color Groups & Values"
        />
        {isColorThemeInputEmpty ? (
          <Button
            handleClick={handlePopulateFromExample}
            className="text-blue-600 underline"
            label="Populate Example Color Groups & Values"
          />
        ) : (
          <Button
            handleClick={handleClearColorThemeInput}
            className="text-blue-600 underline"
            label="Clear Color Groups & Values"
          />
        )}
      </BatchInput>
      <hr className="mb-8" />
      <div className="flex flex-wrap mb-4">
        {Array.from(colorTheme.groups.entries()).map(([group, _]) => (
          <Button
            key={group}
            handleClick={() => handleGrouping(group)}
            className="mr-2 mb-2 px-4 py-2 font-bold text-green-600 hover:text-green-800 bg-green-200 hover:bg-green-400"
            label={group}
          />
        ))}
      </div>
      <div className="flex flex-wrap mb-8">
        {Array.from(colorTheme.colors.entries()).map(([color, _]) => {
          const style: React.CSSProperties = { backgroundColor: color.value };
          return color.selected ? (
            <Button
              key={color.value}
              handleClick={() => handleColorSelection(color)}
              className="mr-2 mb-2 font-xs border-2 border-indigo-600 w-20 h-20 truncate"
              label={color.value}
              style={style}
            />
          ) : (
            <Button
              key={color.value}
              handleClick={() => handleColorSelection(color)}
              className="mr-2 mb-2 font-xs w-20 h-20 truncate"
              label={color.value}
              style={style}
            />
          );
        })}
      </div>
      <hr className="mb-8" />
      <TailwindViewer colorTheme={colorTheme} />
      <ClipboardCopy text={tailwindJSON(colorTheme)} />
      <pre className="bg-slate-800 text-blue-300 p-8">
        {tailwindJSON(colorTheme)}
      </pre>
    </div>
  );
}
export default App;

/**
 * TODO
 * - Inline editor for naming color values
 * - Show colors along side color values in config view
 * - Disable `Use Colors Groups & Values` button after first use
 * - Enable button only when data in input changes
 * - The use button destroys existing work in the bottom half (warn user)
 * - Add usage/help inline in app
 * - Parse color values
 * - Show invalid color values highlighted inline in textarea (better ux?)
 *    (May have to make it a content editable div)
 * - Unit tests
 * - Browser tests
 * - Keyboard navigation for color selection & grouping
 */
