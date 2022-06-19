import React from "react";
import { ThemeEditorState } from "./reducer";
import {
  GroupButton,
  Selectable,
  SelectableItem,
  allGrouped,
  someSelected,
  Group,
} from "./index";
import { ColorMap } from "../color";

interface NotificationBoxProps {
  message: string;
}

function NotificationBox({ message }: NotificationBoxProps) {
  return (
    <p className="text-center py-6 border-dashed border-2 rounded-sm border-pink-400 text-pink-700">
      {message}
    </p>
  );
}

interface GroupButtonsProps {
  groups: Array<Group>;
  workCompleted: boolean;
  disabled: boolean;
  handleAddToGroup: (groupName: string) => void;
}

function GroupButtons({
  groups,
  workCompleted,
  disabled,
  handleAddToGroup,
}: GroupButtonsProps) {
  if (groups.length === 0)
    return (
      <NotificationBox
        message={`Click "Edit" to add one or more group names`}
      />
    );

  if (workCompleted)
    return <NotificationBox message={`All colors have been grouped.`} />;

  return (
    <div className="grid grid-cols-3 gap-2">
      {groups.map((group) => (
        <GroupButton
          key={group.name}
          className={`py-1 px-4 rounded-sm border border-pink-700 hover:border-pink-400 text-pink-700 disabled:cursor-not-allowed disabled:border-slate-500 disabled:text-slate-700`}
          groupName={group.name}
          disabled={disabled}
          handleClick={handleAddToGroup}
        />
      ))}
    </div>
  );
}

interface SelectableButtonsProps {
  selectables: SelectableItem[];
  colorMap: ColorMap;
  handleSelection: (selectableItem: SelectableItem) => void;
}

function SelectableButtons({
  selectables,
  colorMap,
  handleSelection,
}: SelectableButtonsProps) {
  if (colorMap.size === 0)
    return (
      <div className="mb-8">
        <NotificationBox message={`Click "Edit" to add color values.`} />
      </div>
    );

  const buttons = selectables
    .flatMap((selectableItem) => {
      const color = colorMap.get(selectableItem.colorId);
      return color ? [{ selectableItem: selectableItem, color: color }] : [];
    })
    .map(({ selectableItem, color }) => (
      <Selectable
        className="mr-1 mb-1 p-1"
        key={selectableItem.colorId}
        color={color}
        selectableItem={selectableItem}
        handleSelection={handleSelection}
      />
    ));

  return <div className="flex flex-wrap mb-8">{buttons}</div>;
}

interface GroupColorsProps {
  state: ThemeEditorState;
  handleSelection: (selectableItem: SelectableItem) => void;
  handleAddToGroup: (groupName: string) => void;
}

export function GroupColors({
  state,
  handleSelection,
  handleAddToGroup,
}: GroupColorsProps) {
  const workCompleted =
    state.colorMap.size !== 0 && allGrouped(state.selectables);

  return (
    <div>
      <SelectableButtons
        selectables={state.selectables}
        colorMap={state.colorMap}
        handleSelection={handleSelection}
      />
      <hr className="h-1 border border-t-red-500 border-dashed mb-8" />
      <GroupButtons
        groups={Array.from(state.groupMap.values())}
        workCompleted={workCompleted}
        disabled={!someSelected(state.selectables)}
        handleAddToGroup={handleAddToGroup}
      />
    </div>
  );
}
