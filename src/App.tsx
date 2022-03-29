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
  className,
}: ColorListProps & ClassNameProp) {
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

  const showAllButtonText = showAllUncategorized
    ? "Show Less"
    : "Show All Uncategorized";
  const showAllDetailedText = showAllUncategorized
    ? ""
    : `(Showing ${listItems.length} colors only)`;

  return (
    <div className={className}>
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

type AddColorGroupFormProps = {
  handleSubmit: (text: string) => void;
};

function AddColorGroupForm({ handleSubmit }: AddColorGroupFormProps) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(text);
        setText("");
      }}
    >
      <label>
        Color Group Name:
        <input
          type="text"
          placeholder="Add a new color group"
          value={text}
          onChange={(event) => {
            let currentTarget = event.currentTarget as HTMLInputElement;
            let lastChar = currentTarget.value.charAt(
              currentTarget.value.length - 1
            );
            if (lastChar === " ") {
              setText(text + "-");
            } else {
              setText(currentTarget.value);
            }
          }}
          className="ml-4 border-gray-300 border-2 rounded focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1"
        />
      </label>
    </form>
  );
}

function App() {
  const [uncategorized, setUncategorized] = useState(tailwindColors);
  const [showAllUncategorized, setShowAllUncategorized] = useState(false);

  const emptyGroup: string[] = [];
  const [groupNames, setGroupNames] = useState(emptyGroup);

  const groupItems = groupNames.map((name, i) => <li key={i}>{name}</li>);

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
        className="mb-4"
      />
      <AddColorGroupForm
        handleSubmit={(name: string) =>
          setGroupNames(groupNames.concat([name]))
        }
      />
      <ol className="list-decimal ml-4">{groupItems}</ol>
    </div>
  );
}

/**
 * TODO:
 * 1. Delete group name (tricky!)
 * 2. Map currently selected color to a single group
 * 3. Map currently selected color to multiple groups
 * 4. Undo last grouping action
 * 5. Navigate to color group
 * 6. Fast keyboard naming for colors in group
 */

export default App;
