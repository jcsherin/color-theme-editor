import { useState } from "react";
import React, { useState } from "react";
import "./App.css";
import { shuffle } from "./random";
import { tailwindColors } from "./tailwindAllColors";

type ClassNameProp = { className: string };

type ColorItem = { hexcode: string; selected: boolean; grouped: boolean };
type ColorGroup = { name: string; selected: boolean; colors: ColorItem[] };

type ColorProps = { color: ColorItem; handleClick: () => void };

function ColorListItem({ color, handleClick }: ColorProps) {
  const style = {
    backgroundColor: color.hexcode,
  };
  const className = "flex items-center justify-center w-20 h-20 cursor-pointer";
  const highlight = color.selected ? "border-2 border-green-600" : "";
  const visible = color.grouped ? "invisible" : "";
  return (
    <div
      className={`${className} ${highlight} ${visible}`}
      onClick={() => handleClick()}
    >
      <div
        className="w-16 h-16 text border-2 flex items-center justify-center"
        style={style}
      >
        <p className="text-sm">{color.hexcode.slice(1)}</p>
      </div>
    </div>
  );
interface BatchInputProps {
  formData: BatchInputFormat;
  handleFormUpdate: React.Dispatch<React.SetStateAction<BatchInputFormat>>;
  handlePopulateExampleData: () => void;
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
interface TextInputProps {
  label: string;
  text: string;
  handleChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

type AddColorGroupFormProps = {
  handleSubmit: (text: string) => void;
};

function AddColorGroupForm({
  handleSubmit,
function TextAreaInput({
  label,
  text,
  handleChange,
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
}: TextInputProps & { className: string }) {
  return (
    <div className="h-16 w-full border-2 border-dotted mb-4 flex items-center justify-center text-red-400 font-semibold">
      <p>{message}</p>
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

type ColorGroupProps = {
  group: ColorGroup;
  handleDelete: (colorGroup: ColorGroup) => void;
};
function ColorGroupView({ group, handleDelete }: ColorGroupProps) {
  return (
    <section className="mb-4">
      <div className="flex">
        <h2 className="mr-4">{group.name}</h2>
        <button
          onClick={() => handleDelete(group)}
          className="text-red-600 underline capitalize text-sm"
        >
          Delete!
        </button>
      </div>
      <ColorList items={group.colors} handleSelection={() => {}} />
    </section>
  );
}

type TailwindColorMap = {
  [key: string]: string;
};

type TailwindConfig = {
  theme: {
    colors: {
      [key: string]: string | TailwindColorMap;
    };
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
};

function tailwindConfigJSON(groups: ColorGroup[], ungrouped: ColorItem[]) {
  const config: TailwindConfig = { theme: { colors: {} } };
  groups.forEach((group) => {
    const tmp: TailwindColorMap = {};
    group.colors.forEach((color) => {
      tmp[color.hexcode] = color.hexcode;
    });
    config.theme.colors[group.name] = tmp;
  });
  ungrouped.forEach((color) => {
    config.theme.colors[color.hexcode] = color.hexcode;
  });
  return JSON.stringify(config, null, 2);
}

type ClipboardCopyProps = {
  copyText: string;
};
function ClipboardCopy({ copyText }: ClipboardCopyProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyTextToClipboard(text: string) {
    return await navigator.clipboard.writeText(text);
  }

  const handleCopyClick = () => {
    copyTextToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  const handleUpdateColors = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newColors = event.currentTarget.value;
    handleFormUpdate((prev) => ({
      ...prev,
      colors: newColors,
    }));
  };

  const copyAction = isCopied ? (
    <p className="text-green-500">Copied!</p>
  ) : (
    <button
      onClick={handleCopyClick}
      className="bg-blue-500 text-slate-200 px-8"
    >
      Copy
    </button>
  );

  return (
    <div>
      {copyAction}
      <pre>{copyText}</pre>
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

shuffle(tailwindColors);
const exampleColorValues = tailwindColors.slice(0, 40);

// [0..n)
function uniformRandom(n: number) {
  return Math.trunc(Math.random() * n);
}

// randomly shuffle array
function shuffle(arr: string[]) {
  const size = arr.length;
  for (let i = 0; i < size; i++) {
    const random = i + uniformRandom(size - i);
    let tmp = arr[i];
    arr[i] = arr[random];
    arr[random] = tmp;
  }
// const exampleColorValues = shuffle(tailwindColors).slice(0, 40);
const exampleColorValues = shuffle(tailwindColors).slice(0, 40);
interface BatchInputFormat {
  groups: string;
  colors: string;
}

function App() {
  const [colorItems, setColorItems] = useState(() =>
    tailwindColors.slice(0, 40).map(
      (hexcode): ColorItem => ({
        hexcode: hexcode,
        selected: false,
        grouped: false,
      })
    )
  );

  const emptyColorGroup: ColorGroup[] = [
    { name: "primary", selected: false, colors: [] },
    { name: "secondary", selected: false, colors: [] },
    { name: "notify", selected: false, colors: [] },
    { name: "background", selected: false, colors: [] },
  ];
  const [colorGroups, setColorGroups] = useState(emptyColorGroup);

  const handleAddColorGroupFormSubmit = (name: string) =>
    setColorGroups((groups) =>
      groups.concat([{ name: name, selected: false, colors: [] }])
    );

  const handleMoveColorsToGroup = (target: ColorGroup) => {
    let colorsToMove = colorItems
      .filter((item) => item.selected)
      .map((item) => ({ ...item, selected: false }));
    if (colorsToMove.length === 0) {
      setColorGroups((groups) =>
        groups.map((group) =>
          group.name === target.name ? { ...group, selected: false } : group
        )
      );
      return;
    }
    setColorItems((colors) =>
      colors.map((item) =>
        item.selected ? { ...item, selected: false, grouped: true } : item
      )
    );
    setColorGroups((groups) =>
      groups.map((group) =>
        group.name === target.name
          ? {
              ...group,
              selected: false,
              colors: group.colors.concat(colorsToMove),
            }
          : group
      )
    );
  };

  const handleColorItemSelection = (colorItem: ColorItem) =>
    setColorItems((items) =>
      items.map((item) =>
        item.hexcode === colorItem.hexcode
          ? { ...item, selected: !item.selected }
          : item
      )
    );

  const handleDeleteColorGroup = (group: ColorGroup) => {
    setColorItems((colors) =>
      colors.map((color) =>
        group.colors.findIndex((item) => item.hexcode === color.hexcode) > -1
          ? { ...color, grouped: false }
          : color
      )
    );
    setColorGroups((groups) =>
      groups.filter((item) => item.name !== group.name)
    );
  };

  const groupedColors = colorGroups
    .filter((group) => group.colors.length > 0)
    .map((group, i) => (
      <ColorGroupView
        handleDelete={() => handleDeleteColorGroup(group)}
        key={i}
        group={group}
      />
    ));

  const tailwindConfig = tailwindConfigJSON(
    colorGroups,
    colorItems.filter((item) => !item.grouped)
  );
  const [batch, setBatch] = useState<BatchInputFormat>({
    groups: "",
    colors: "",
  });

  return (
    <div className="m-4">
      <div className="border-2 border-blue-300 border-dashed p-2">
        <textarea
          className="bg-slate-100 w-full md:w-1/2 h-60 p-4 border-2 resize-none"
          placeholder="Enter color values exported from design here. One value per line."
          value={exampleColorValues.join("\n")}
        ></textarea>
        <textarea
          className="bg-slate-100 w-full md:w-1/2 h-60 p-4 border-2 resize-none"
          placeholder="Enter color group names. One value per line."
          value={exampleColorGroups.join("\n")}
        ></textarea>
        <p>
          <span className="mr-2">Groups: {exampleColorGroups.length}</span>
          <span>Colors: {exampleColorValues.length}</span>
        </p>
      </div>
      {/* <AddColorGroupForm
        className="mb-4"
        handleSubmit={handleAddColorGroupFormSubmit}
      /> */}

      {/* {colorGroups.length === 0 ? (
        <EmptyState message="Create 1 or more color groups to begin grouping colors." />
      ) : (
        <>
          <h2 className="mb-2">Color Groups</h2>
          <SelectableGroup
            groups={colorGroups}
            handleSelection={handleMoveColorsToGroup}
          />
        </>
      )}

      <p>Ungrouped</p>
      <ColorList
        items={colorItems.filter((item) => !item.grouped)}
        handleSelection={handleColorItemSelection}
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

      {groupedColors}

      <ClipboardCopy copyText={tailwindConfig} /> */}
    </div>
  );
}
export default App;
