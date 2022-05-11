import React from "react";
import { State } from "../state";
import { GroupButton } from "./GroupButton";
import { Selectable } from "./Selectable";
import { allGrouped, SelectableItem, someSelected } from "./selectableItem";

interface GroupColorsProps {
  state: State;
  handleSelection: (selectableItem: SelectableItem) => void;
  handleAddToGroup: (groupName: string) => void;
}

export function GroupColors({
  state,
  handleSelection,
  handleAddToGroup,
}: GroupColorsProps) {
  const colorListItems = state.colorList
    .flatMap((colorListItem) => {
      const color = state.colorDict.get(colorListItem.colorId);
      return color ? [{ colorListItem, color: color }] : [];
    })
    .map(({ colorListItem, color }) => (
      <Selectable
        className="mr-1 mb-1 p-1"
        key={colorListItem.colorId}
        color={color}
        selectableItem={colorListItem}
        handleSelection={handleSelection}
      />
    ));

  const isDisabledGroupButton = !someSelected(state.colorList);
  const colorGroupsButtonRow = allGrouped(state.colorList) ? (
    <p className="text-2xl text-center bg-yellow-200 py-2">
      Great! You've completed grouping all the colors.
    </p>
  ) : (
    Array.from(state.colorGroupDict.keys())
      .flatMap((groupId) => {
        const colorGroup = state.colorGroupDict.get(groupId);
        return colorGroup ? [colorGroup] : [];
      })
      .map((colorGroup) => (
        <GroupButton
          key={colorGroup.name}
          className={`mr-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300`}
          groupName={colorGroup.name}
          disabled={isDisabledGroupButton}
          handleClick={handleAddToGroup}
        />
      ))
  );

  return (
    <div>
      <div className="flex flex-wrap mb-4">{colorListItems}</div>
      <div className={"pl-2"}>{colorGroupsButtonRow}</div>
    </div>
  );
}
