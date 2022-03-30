import React, { useState } from "react";
import "./App.css";
import { tailwindColors } from "./tailwindAllColors";

type ClassNameProp = { className: string };

type ColorItem = { hexcode: string; selected: boolean };
type ColorProps = { color: ColorItem; handleClick: () => void };

function ColorListItem({ color, handleClick }: ColorProps) {
  const style = {
    backgroundColor: color.hexcode,
  };
  const className = "flex items-center justify-center w-20 h-20 cursor-pointer";
  const highlight = color.selected ? "border-2 border-green-600" : "";
  return (
    <div className={`${className} ${highlight}`} onClick={() => handleClick()}>
      <div
        className="w-16 h-16 text border-2 flex items-center justify-center"
        style={style}
      >
        <p className="text-sm">{color.hexcode.slice(1)}</p>
      </div>
    </div>
  );
}

type ColorListProps = {
  items: ColorItem[];
  handleSelection: (colorItem: ColorItem) => void;
};

function ColorList({ items, handleSelection }: ColorListProps) {
  const toListItems = (colors: ColorItem[]) =>
    colors.map((color, i) => (
      <ColorListItem
        key={i}
        color={color}
        handleClick={() => handleSelection(color)}
      />
    ));

  return (
    <div className="mb-4">
      <div className="flex flex-wrap">{toListItems(items)}</div>
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
  return (
    <button className="text-xl bg-blue-200 py-1 px-4 mr-4 mb-2">{text}</button>
  );
}

type SelectableGroupProps = { texts: string[] };
function SelectableGroup({ texts }: SelectableGroupProps) {
  const items = texts.map((text, i) => <Selectable key={i} text={text} />);
  return <div className="mb-4">{items}</div>;
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
  const [colorItems, setColorItems] = useState(() =>
    tailwindColors.map(
      (hexcode): ColorItem => ({ hexcode: hexcode, selected: false })
    )
  );

  const emptyGroup: string[] = [];
  const [groupNames, setGroupNames] = useState(emptyGroup);

  const groupItems =
    groupNames.length === 0 ? (
      <EmptyState message="Create 1 or more color groups to begin grouping colors." />
    ) : (
      <SelectableGroup texts={groupNames} />
    );

  const handleColorItemSelection = (colorItem: ColorItem) => {
    setColorItems((items) =>
      items.map((item) =>
        item.hexcode === colorItem.hexcode
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  return (
    <div className="m-4">
      <AddColorGroupForm
        className="mb-4"
        handleSubmit={(name: string) =>
          setGroupNames(groupNames.concat([name]))
        }
      />
      {groupItems}
      <ColorList
        items={colorItems}
        handleSelection={handleColorItemSelection}
      />
    </div>
  );
}

export default App;
