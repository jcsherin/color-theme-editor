import { useState } from "react";
import "./App.css";
import { BatchInput } from "./BatchInput";
import { ColorThemeInputFormat } from "./ColorThemeInputFormat";
import { exampleColorGroups, exampleColorValues } from "./example";

function App() {
  const [colorTheme, setColorTheme] = useState<ColorThemeInputFormat>({
    groupsTextValue: "",
    colorsTextValue: "",
  });

  const clearColorTheme = () =>
    setColorTheme({ groupsTextValue: "", colorsTextValue: "" });

  const batchActions = (
    <>
      <button className="mr-4 px-12 py-2 font-bold text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400">
        Reload Color Values & Groups
      </button>
      {colorTheme.groupsTextValue.length === 0 &&
      colorTheme.colorsTextValue.length === 0 ? (
        <button
          onClick={() =>
            setColorTheme({
              groupsTextValue: exampleColorGroups.join("\n"),
              colorsTextValue: exampleColorValues.join("\n"),
            })
          }
          className="text-blue-600 underline"
        >
          Populate Example Color Groups & Values
        </button>
      ) : (
        <button onClick={clearColorTheme} className="text-blue-600 underline">
          Clear Color Groups & Values
        </button>
      )}
    </>
  );

  return (
    <div className="m-4">
      <BatchInput batch={colorTheme} handleBatchUpdate={setColorTheme}>
        {batchActions}
      </BatchInput>
    </div>
  );
}
export default App;
