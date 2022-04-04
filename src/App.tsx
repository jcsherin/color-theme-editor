import React, { useState } from "react";
import "./App.css";
import { shuffle } from "./random";
import { tailwindColors } from "./tailwindAllColors";

interface BatchInputProps {
  formData: BatchInputFormat;
  handleFormUpdate: React.Dispatch<React.SetStateAction<BatchInputFormat>>;
  handlePopulateExampleData: () => void;
}

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

function BatchInput({
  formData,
  handleFormUpdate,
  handlePopulateExampleData,
}: BatchInputProps) {
  const secondaryActionButton =
    formData.groups.length === 0 && formData.colors.length === 0 ? (
      <button
        onClick={handlePopulateExampleData}
        className="text-blue-600 underline"
      >
        Populate Example Data
      </button>
    ) : (
      <button
        onClick={() => handleFormUpdate({ groups: "", colors: "" })}
        className="text-blue-600 underline"
      >
        Clear Form Data
      </button>
    );
  const handleUpdateGroups = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newGroups = event.currentTarget.value;
    handleFormUpdate((prev) => ({
      ...prev,
      groups: newGroups,
    }));
  };
  const handleUpdateColors = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newColors = event.currentTarget.value;
    handleFormUpdate((prev) => ({
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
          text={formData.groups}
          handleChange={handleUpdateGroups}
        />
        <TextAreaInput
          className="w-full mb-2"
          label="Color values"
          text={formData.colors}
          handleChange={handleUpdateColors}
        />
      </div>
      <button className="mr-4 px-12 py-2 font-bold text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400">
        Reload Color Values & Groups
      </button>
      {secondaryActionButton}
    </div>
  );
}

const exampleColorGroups = [
  "primary",
  "secondary",
  "notification",
  "background",
];

// const exampleColorValues = shuffle(tailwindColors).slice(0, 40);
const exampleColorValues = shuffle(tailwindColors).slice(0, 40);
interface BatchInputFormat {
  groups: string;
  colors: string;
}

function App() {
  const [batch, setBatch] = useState<BatchInputFormat>({
    groups: "",
    colors: "",
  });

  return (
    <div className="m-4">
      <BatchInput
        formData={batch}
        handleFormUpdate={setBatch}
        handlePopulateExampleData={() =>
          setBatch({
            groups: exampleColorGroups.join("\n"),
            colors: exampleColorValues.join("\n"),
          })
        }
      />
    </div>
  );
}
export default App;
