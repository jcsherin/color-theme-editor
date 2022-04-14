import React from "react";
import * as example from "./example";

function Button({
  className: overrideClassName,
  text,
  disabled,
  handleClick,
}: {
  className: string;
  text: string;
  disabled: boolean;
  handleClick: (text: string) => void;
}) {
  const computedClassName = disabled
    ? "cursor-not-allowed disabled:bg-gray-200 disabled:text-slate-400"
    : "";

  return (
    <button
      onClick={(_event) => handleClick(text)}
      className={`${overrideClassName} ${computedClassName}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

function ButtonGroup({
  names,
  disabled,
  handleClick,
}: {
  names: string[];
  disabled: boolean;
  handleClick: (name: string) => void;
}) {
  return (
    <div>
      {names.map((value) => {
        const className =
          "mr-4 px-6 py-1 bg-red-200 hover:bg-red-400 text-rose-600 hover:text-rose-900";

        return (
          <Button
            disabled={disabled}
            key={value}
            className={className}
            text={value}
            handleClick={handleClick}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  return (
    <div className="m-2">
      <ButtonGroup
        names={example.utilityClassnames}
        handleClick={(className) => {
          console.log(`Clicked on -> ${className}.`);
        }}
        disabled={false}
      />
    </div>
  );
}
