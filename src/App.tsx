import React, { useState } from "react";
import "./App.css";
import { exampleColorGroups, exampleColorValues } from "./example";

interface TextAreaInputProps {
  label: string;
  text: string;
  handleChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

function TextAreaInput({
  label,
  text,
  handleChange,
  className,
}: TextAreaInputProps & { className: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-bold">{label}</p>
      <textarea
        className="w-full bg-slate-100 h-60 p-4 border-2 resize-none"
        placeholder="Enter color group names. One value per line."
        value={text}
        onChange={handleChange}
      ></textarea>
    </div>
  );
}

interface BatchInputProps {
  batch: ColorThemeInputFormat;
  handleBatchUpdate: React.Dispatch<
    React.SetStateAction<ColorThemeInputFormat>
  >;
  children: React.ReactNode;
}

function BatchInput({ batch, handleBatchUpdate, children }: BatchInputProps) {
  const handleUpdateGroups = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newGroups = event.currentTarget.value;
    handleBatchUpdate((prev) => ({
      ...prev,
      groupsTextValue: newGroups,
    }));
  };
  const handleUpdateColors = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newColors = event.currentTarget.value;
    handleBatchUpdate((prev) => ({
      ...prev,
      colorsTextValue: newColors,
    }));
  };

  return (
    <div>
      <div className="block sm:flex">
        <TextAreaInput
          className="w-full mr-1 mb-2"
          label="Color Groups"
          text={batch.groupsTextValue}
          handleChange={handleUpdateGroups}
        />
        <TextAreaInput
          className="w-full mb-2"
          label="Color values"
          text={batch.colorsTextValue}
          handleChange={handleUpdateColors}
        />
      </div>
      {children}
    </div>
  );
}

interface ColorThemeInputFormat {
  groupsTextValue: string;
  colorsTextValue: string;
}

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
