import { useState } from "react";
import "./App.css";
import { BatchInput } from "./BatchInput";
import { Button } from "./Button";
import { ColorTheme, ColorThemeInputFormat } from "./ColorTheme";
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

  const clearColorThemeInput = () =>
    setColorThemeInput({ groupsTextValue: "", colorsTextValue: "" });

  const populateFromExample = () =>
    setColorThemeInput({
      groupsTextValue: exampleColorGroups.join("\n"),
      colorsTextValue: exampleColorValues.join("\n"),
    });

  const handleUpdateColorTheme = () => {
    const { groupsTextValue, colorsTextValue } = colorThemeInput;

    const groups = new Set<string>();
    groupsTextValue
      .split("\n")
      .map((value) => value.trim().replace(/\s+/, "-"))
      .filter((value) => value.length > 0)
      .forEach((value) => groups.add(value));

    const colors = new Set<string>();
    colorsTextValue
      .split("\n")
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .forEach((value) => colors.add(value));

    setColorTheme({ groups: groups, colors: colors });
  };

  const isColorThemeInputEmpty =
    colorThemeInput.groupsTextValue.length === 0 &&
    colorThemeInput.colorsTextValue.length === 0;
  const reloadButtonClassName = isColorThemeInputEmpty
    ? "text-gray-400 hover:text-gray-600 bg-slate-200 hover:bg-slate-400 cursor-not-allowed"
    : "text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400";

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
            handleClick={populateFromExample}
            className="text-blue-600 underline"
            label="Populate Example Color Groups & Values"
          />
        ) : (
          <Button
            handleClick={clearColorThemeInput}
            className="text-blue-600 underline"
            label="Clear Color Groups & Values"
          />
        )}
      </BatchInput>
    </div>
  );
}
export default App;
