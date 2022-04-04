import React, { useState } from "react";
import "./App.css";
import { exampleColorGroups, exampleColorValues } from "./example";

interface TextInputProps {
  label: string;
  text: string;
  handleChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

function TextAreaInput({
  label,
  text,
  handleChange,
  className,
}: TextInputProps & { className: string }) {
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
      groups: newGroups,
    }));
  };
  const handleUpdateColors = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newColors = event.currentTarget.value;
    handleBatchUpdate((prev) => ({
      ...prev,
      colors: newColors,
    }));
  };

  return (
    <div>
      <div className="block sm:flex">
        <TextAreaInput
          className="w-full mr-1 mb-2"
          label="Color Groups"
          text={batch.groups}
          handleChange={handleUpdateGroups}
        />
        <TextAreaInput
          className="w-full mb-2"
          label="Color values"
          text={batch.colors}
          handleChange={handleUpdateColors}
        />
      </div>
      {children}
    </div>
  );
}

interface ColorThemeInputFormat {
  groups: string;
  colors: string;
}

function App() {
  const [theme, setTheme] = useState<ColorThemeInputFormat>({
    groups: "",
    colors: "",
  });

  const batchActions = (
    <>
      <button className="mr-4 px-12 py-2 font-bold text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400">
        Reload Color Values & Groups
      </button>
      {theme.groups.length === 0 && theme.colors.length === 0 ? (
        <button
          onClick={() =>
            setTheme({
              groups: exampleColorGroups.join("\n"),
              colors: exampleColorValues.join("\n"),
            })
          }
          className="text-blue-600 underline"
        >
          Populate Example Data
        </button>
      ) : (
        <button
          onClick={() => setTheme({ groups: "", colors: "" })}
          className="text-blue-600 underline"
        >
          Clear Form Data
        </button>
      )}
    </>
  );

  return (
    <div className="m-4">
      <BatchInput batch={theme} handleBatchUpdate={setTheme}>
        {batchActions}
      </BatchInput>
    </div>
  );
}
export default App;
