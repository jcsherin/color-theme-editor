import React, { useState } from "react";
import "./App.css";
import { tailwindColors } from "./tailwindAllColors";

type ClassNameProp = { className: string };
type ColorProps = { color: string };

function ColorListItem({ color, className }: ColorProps & ClassNameProp) {
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

type ColorListProps = {
  uncategorized: string[];
  showAllUncategorized: boolean;
  setShowAllUncategorized: React.Dispatch<React.SetStateAction<boolean>>;
};

function ColorList({
  uncategorized,
  showAllUncategorized,
  setShowAllUncategorized,
}: ColorListProps) {
  const toListItems = (colors: string[]) =>
    colors.map((color) => (
      <ColorListItem
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
    : `(Showing only ${listItems.length} colors)`;

  return (
    <>
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
    </>
  );
}

type StatsBarProps = {
  countCategorized: number;
  countUncategorized: number;
  countGroups: number;
};

function StatsBar({
  countCategorized,
  countUncategorized,
  countGroups,
  className,
}: StatsBarProps & ClassNameProp) {
  return (
    <p className={className}>
      <span className="mr-4">Uncategorized: {countUncategorized}</span>
      <span className="mr-4">Categorized: {countCategorized}</span>
      <span>Groups: {countGroups}</span>
    </p>
  );
}

function App() {
  const [uncategorized, setUncategorized] = useState(tailwindColors);
  const [showAllUncategorized, setShowAllUncategorized] = useState(false);

  return (
    <div className="m-4">
      <StatsBar
        countUncategorized={uncategorized.length}
        countCategorized={0}
        countGroups={0}
        className="mb-4"
      />
      <ColorList
        uncategorized={uncategorized}
        showAllUncategorized={showAllUncategorized}
        setShowAllUncategorized={setShowAllUncategorized}
      />
    </div>
  );
}

export default App;
