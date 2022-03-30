import { group } from "console";
import React, { useState } from "react";
import "./App.css";
import { tailwindColors } from "./tailwindAllColors";

type ClassNameProp = { className: string };

type ColorItem = { hexcode: string; selected: boolean };
type ColorGroup = { name: string; selected: boolean };

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

type SelectableProps = { group: ColorGroup; handleClick: () => void };
function Selectable({ group, handleClick }: SelectableProps) {
  const bgColor = group.selected ? `bg-green-600 text-white` : `bg-blue-200`;
  const className = `text-xl py-1 px-4 mr-4 mb-2 ${bgColor}`;
  return (
    <button onClick={() => handleClick()} className={className}>
      {group.name}
    </button>
  );
}

type SelectableGroupProps = {
  groups: ColorGroup[];
  handleSelection: (colorGroup: ColorGroup) => void;
};
function SelectableGroup({ groups, handleSelection }: SelectableGroupProps) {
  const items = groups.map((group, i) => (
    <Selectable
      key={i}
      group={group}
      handleClick={() => handleSelection(group)}
    />
  ));
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

  const emptyColorGroup: ColorGroup[] = [];
  const [colorGroups, setColorGroups] = useState(emptyColorGroup);

  const handleAddColorGroupFormSubmit = (name: string) =>
    setColorGroups((groups) =>
      groups.concat([{ name: name, selected: false }])
    );

  const handleColorGroupSelection = (colorGroup: ColorGroup) =>
    setColorGroups((groups) => {
      let selectedIdx = groups.findIndex(
        (group) => group.name === colorGroup.name
      );
      if (groups[selectedIdx].selected) {
        // selected earlier, therefore turn off the selection
        return groups.map((group) =>
          group.name === colorGroup.name ? { ...group, selected: false } : group
        );
      }

      return groups.map((group) =>
        group.name === colorGroup.name
          ? { ...group, selected: true }
          : { ...group, selected: false }
      );
    });

  const handleColorItemSelection = (colorItem: ColorItem) =>
    setColorItems((items) =>
      items.map((item) =>
        item.hexcode === colorItem.hexcode
          ? { ...item, selected: !item.selected }
          : item
      )
    );

  const moveDisabled =
    colorItems.findIndex((item) => item.selected) === -1 ||
    colorGroups.findIndex((item) => item.selected) === -1;

  const moveBg = moveDisabled ? "bg-slate-600" : "bg-blue-600";
  const moveClassName = `mb-4 text-lg font-semibold text-slate-200 px-16 py-2 capitalize ${moveBg}`;

  return (
    <div className="m-4">
      <AddColorGroupForm
        className="mb-4"
        handleSubmit={handleAddColorGroupFormSubmit}
      />

      {colorGroups.length === 0 ? (
        <EmptyState message="Create 1 or more color groups to begin grouping colors." />
      ) : (
        <SelectableGroup
          groups={colorGroups}
          handleSelection={handleColorGroupSelection}
        />
      )}

      <button
        disabled={moveDisabled}
        onClick={() => {
          console.log("Move!!!");
        }}
        className={moveClassName}
      >
        Move colors to groups
      </button>

      <ColorList
        items={colorItems}
        handleSelection={handleColorItemSelection}
      />
    </div>
  );
}

export default App;
