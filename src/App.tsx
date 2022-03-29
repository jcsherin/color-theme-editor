import React, { useState } from "react";
import "./App.css";
import { tailwindColors } from "./tailwindAllColors";

type ClassNameProp = { className: string };
type ColorProps = { color: string } & ClassNameProp;

function ColorSquare({ color, className }: ColorProps) {
  const style = {
    backgroundColor: color,
  };
  return (
    <div className={className}>
      <div className="w-12 h-12 border-2 mx-auto" style={style}></div>
      <p>{color}</p>
    </div>
  );
}

function App() {
  const [uncategorized, setUncategorized] = useState(tailwindColors);
  const [showAllUncategorized, setShowAllUncategorized] = useState(false);

  const toListItems = (colors: string[]) =>
    colors.map((color) => (
      <ColorSquare
        key={color}
        color={color}
        className="flex-column items-center mr-4"
      />
    ));

  const limit = 16;
  const listItems = showAllUncategorized
    ? toListItems(uncategorized)
    : toListItems(uncategorized.slice(0, limit));

  const showAllButtonText = showAllUncategorized ? "Show Less" : "Show All";
  const showAllDetailedText = showAllUncategorized
    ? ""
    : `Showing only ${listItems.length} of ${uncategorized.length} remaining uncategorized colors.`;
  return (
    <div className="m-4">
      <p className="mb-2">
        <button
          onClick={() => setShowAllUncategorized(!showAllUncategorized)}
          className="underline mr-4 text-blue-600"
        >
          {showAllButtonText}
        </button>
        {showAllDetailedText}
      </p>
      <div className="flex flex-wrap">{listItems}</div>
    </div>
  );
}

export default App;
