import React from "react";
import { CopyButton } from "./clipboard";
import { TreeEditor } from "./editor";
import { SelectableItem } from "./grouping";
import { GroupColors } from "./grouping/GroupColors";
import { serializeConfig, State } from "./state";

export function ThemeConfig({
  state,
  handlePrevUI,
  handleRenameColor,
  handleRemoveFromGroup,
  handleAddToGroup,
  handleToggleStatus,
}: {
  state: State;
  handlePrevUI: (_event: React.MouseEvent) => void;
  handleRenameColor: (colorId: string, groupName: string) => void;
  handleRemoveFromGroup: (colorId: string, groupName: string) => void;
  handleAddToGroup: (groupName: string) => void;
  handleToggleStatus: (selectableItem: SelectableItem) => void;
}) {
  return (
    <>
      <div className="mb-4">
        <button
          onClick={handlePrevUI}
          className="py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700"
        >
          Go Back
        </button>
        <CopyButton
          label="Copy To Clipboard"
          content={serializeConfig(state)}
          expiryInMs={2000}
          className=" text-blue-500 hover:text-blue-800 text-xl py-1 px-4"
          flashClassName="text-green-800 text-xl py-1 px-4"
        />
      </div>
      <div className="grid grid-cols-2 mb-4">
        <TreeEditor
          state={state}
          handleRenameColor={handleRenameColor}
          handleRemoveFromGroup={handleRemoveFromGroup}
        />
        <GroupColors
          state={state}
          handleSelection={handleToggleStatus}
          handleAddToGroup={handleAddToGroup}
        />
      </div>
    </>
  );
}
