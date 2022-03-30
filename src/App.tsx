import React, { useEffect, useState } from "react";
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
  ungrouped: string[];
};

function ColorList({ ungrouped, className }: ColorListProps & ClassNameProp) {
  // FIXME: `ungrouped` could be empty, so `ungrouped[0]` becomes undefined
  const [currentSelection, setcurrentSelection] = useState(ungrouped[0]);
  useEffect(() => {
    if (ungrouped.length > 0) {
      setcurrentSelection(ungrouped[0]);
    }
  }, [ungrouped]);

  const toListItems = (colors: string[]) =>
    colors.map((color) => {
      const selectedItemBorder = "border-2 border-indigo-600 border-dotted";
      const style = "flex-column items-center mr-4 py-2 px-4";
      const className =
        color === currentSelection ? `${style} ${selectedItemBorder}` : style;
      return <ColorListItem key={color} color={color} className={className} />;
    });

  return (
    <div className={className}>
      <div className="flex flex-wrap">{toListItems(ungrouped)}</div>
      <p className="font-bold">Current Selection: {currentSelection}</p>
    </div>
  );
}

type AddColorGroupFormProps = {
  handleSubmit: (text: string) => void;
};

function AddColorGroupForm({
  handleSubmit,
  className,
}: AddColorGroupFormProps & ClassNameProp) {
  const [text, setText] = useState("");

  return (
    <form
      className={className}
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

type SelectableProps = { text: string };
function Selectable({ text }: SelectableProps) {
  return <button>{text}</button>;
}

type SelectableGroupProps = { texts: string[] };
function SelectableGroup({ texts }: SelectableGroupProps) {
  const items = texts.map((text) => <Selectable text={text} />);
  return <>{items}</>;
}

type EmptyStateProps = { message: string };
function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="h-16 w-full border-2 border-dotted mb-4 flex items-center justify-center text-red-400 font-semibold">
      <p>{message}</p>
    </div>
  );
}

function App() {
  const [ungrouped, setUngrouped] = useState(tailwindColors);

  const emptyGroup: string[] = [];
  const [groupNames, setGroupNames] = useState(emptyGroup);

  // const groupItems = groupNames.map((name, i) => <li key={i}>{name}</li>);
  const groupItems =
    groupNames.length === 0 ? (
      <EmptyState message="Create 1 or more color groups to begin grouping colors." />
    ) : (
      <SelectableGroup texts={groupNames} />
    );

  return (
    <div className="m-4">
      {groupItems}
      <AddColorGroupForm
        className="mb-4"
        handleSubmit={(name: string) =>
          setGroupNames(groupNames.concat([name]))
        }
      />

      <ColorList ungrouped={ungrouped} className="mb-4" />
    </div>
  );
}

export default App;
