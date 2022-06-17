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

interface NotificationBoxProps {
  message: string;
}

function NotificationBox({ message }: NotificationBoxProps) {
  return (
    <p className="text-center py-6 border-dashed border-2 border-neutral-500">
      {message}
    </p>
  );
}

interface GroupButtonsProps {
  groups: Array<Group>;
  allSelectablesGrouped: boolean;
  disabled: boolean;
  handleAddToGroup: (groupName: string) => void;
}

function GroupButtons({
  groups,
  allSelectablesGrouped,
  disabled,
  handleAddToGroup,
}: GroupButtonsProps) {
  if (groups.length === 0)
    return (
      <NotificationBox
        message={`Click "Edit" to add one or more group names`}
      />
    );

  if (allSelectablesGrouped)
    return <NotificationBox message={`All colors have been grouped.`} />;

  return (
    <>
      {groups.map((group) => (
        <GroupButton
          key={group.name}
          className={`mr-4 mb-4 px-6 py-1 bg-blue-200 hover:bg-blue-400 text-sky-900 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300`}
          groupName={group.name}
          disabled={disabled}
          handleClick={handleAddToGroup}
        />
      ))}
    </>
  );
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
  const colorListItems = state.selectables
    .flatMap((colorListItem) => {
      const color = state.colorMap.get(colorListItem.colorId);
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

  return (
    <div>
      <div className="flex flex-wrap mb-8">{colorListItems}</div>
      <div className={"pl-2"}>
        <GroupButtons
          groups={Array.from(state.groupMap.values())}
          allSelectablesGrouped={allGrouped(state.selectables)}
          disabled={!someSelected(state.selectables)}
          handleAddToGroup={handleAddToGroup}
        />
      </div>
    </div>
  );
}
