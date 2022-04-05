import { useState } from "react";
import { BatchInput } from "./BatchInput";
import { Button } from "./Button";
import {
  ColorTheme,
  ColorThemeInputFormat,
  parseColors,
  parseGroups,
} from "./ColorTheme";
import { exampleColorGroups, exampleColorValues } from "./example";

function App() {
  const [colorThemeInput, setColorThemeInput] = useState<ColorThemeInputFormat>(
    {
      groupsTextValue: "",
      colorsTextValue: "",
    }
  );
  const [colorTheme, setColorTheme] = useState<ColorTheme>({
    groups: new Set(),
    colors: new Set(),
  });

  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

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
      groups: parseGroups(groupsTextValue),
      colors: parseColors(colorsTextValue),
    });
  };

  const isColorThemeInputEmpty =
    colorThemeInput.groupsTextValue.length === 0 &&
    colorThemeInput.colorsTextValue.length === 0;
  const reloadButtonClassName = isColorThemeInputEmpty
    ? "text-gray-400 hover:text-gray-600 bg-slate-200 hover:bg-slate-400 cursor-not-allowed"
    : "text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400";

  const handleColorSelection = (color: string) =>
    setSelectedColors((prevState) => {
      return prevState.has(color)
        ? new Set(Array.from(prevState).filter((value) => value !== color))
        : new Set(Array.from(prevState).concat([color]));
    });

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
            handleClick={() => {}}
            className="mr-2 mb-2 px-4 py-2 font-bold text-green-600 hover:text-green-800 bg-green-200 hover:bg-green-400"
            label={group}
          />
        ))}
      </div>
      <div className="flex flex-wrap">
        {Array.from(colorTheme.colors.entries()).map(([color, _]) =>
          selectedColors.has(color) ? (
            <Button
              key={color}
              handleClick={() => handleColorSelection(color)}
              className="mr-2 mb-2 font-xs text-green-200 bg-green-600 w-20 h-20 truncate"
              label={color}
            />
          ) : (
            <Button
              key={color}
              handleClick={() => handleColorSelection(color)}
              className="mr-2 mb-2 font-xs text-green-600 hover:text-green-800 bg-green-200 hover:bg-green-400 w-20 h-20 truncate"
              label={color}
            />
          )
        )}
      </div>
    </div>
  );
}
export default App;
