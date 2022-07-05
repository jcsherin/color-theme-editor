import React from "react";
import { ThemeEditorState } from "./reducer";
import {
  GroupButton,
  Selectable,
  SelectableItem,
  allGrouped,
  someSelected,
} from "./index";

import type { NamedCSSColorDictionary } from "../color";

interface NotificationBoxProps {
  message: string;
}

function NotificationBox({ message }: NotificationBoxProps) {
  return (
    <p className="text-center py-6 border-double border-4 rounded-sm border-pink-400 text-pink-700">
      {message}
    </p>
  );
}

interface GroupButtonsProps {
  groupNames: string[];
  disabled: boolean;
  handleAddToGroup: (groupName: string) => void;
}

function GroupButtons({
  groupNames,
  disabled,
  handleAddToGroup,
}: GroupButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {groupNames.map((name) => (
        <GroupButton
          key={name}
          className={`py-1 px-4 rounded-sm border border-pink-700 hover:border-pink-400 text-pink-700 disabled:cursor-not-allowed disabled:border-slate-500 disabled:text-slate-700 disabled:bg-slate-300`}
          groupName={name}
          disabled={disabled}
          handleClick={handleAddToGroup}
        />
      ))}
    </div>
  );
}

interface SelectableButtonsProps {
  selectables: SelectableItem[];
  colorMap: NamedCSSColorDictionary;
  handleSelection: (selectableItem: SelectableItem) => void;
}

function SelectableButtons({
  selectables,
  colorMap,
  handleSelection,
}: SelectableButtonsProps) {
  const buttons = selectables
    .flatMap((selectableItem) => {
      const color = colorMap[selectableItem.colorId];
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
  const groupsCount = Object.keys(state.groupMap).length;
  const groupingWorkCompleted =
    state.colorMap &&
    Object.keys(state.colorMap).length > 0 &&
    allGrouped(state.selectables);

  return (
    <div>
      {state.colorMap && Object.keys(state.colorMap).length === 0 && (
        <div className="mb-8">
          <NotificationBox message={`Click "Edit" to add color values.`} />
        </div>
      )}
      <SelectableButtons
        selectables={state.selectables}
        colorMap={state.colorMap}
        handleSelection={handleSelection}
      />
      {groupsCount === 0 && (
        <NotificationBox
          message={`Click "Edit" to add one or more group names`}
        />
      )}
      {groupingWorkCompleted && (
        <NotificationBox message={`All colors have been grouped.`} />
      )}
      {groupsCount > 0 && !groupingWorkCompleted && (
        <GroupButtons
          groupNames={Object.keys(state.groupMap)}
          disabled={!someSelected(state.selectables)}
          handleAddToGroup={handleAddToGroup}
        />
      )}
    </div>
  );
}
