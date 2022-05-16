import React from "react";
import { CopyButton } from "../clipboard";
import { TreeEditor } from "../tree-editor";
import { SelectableItem, GroupColors } from "./index";
import { deserializeState, serializeConfig, serializeState } from "../state";

import type { State, SerializedState } from "../state";

export interface EditUI {
  kind: "main";
  state: State;
}

export interface EditUISerialized {
  kind: "main";
  state: SerializedState;
}

export function createEditUI(state: State): EditUI {
  return {
    kind: "main",
    state: state,
  };
}

export function serializeEditUI(ui: EditUI): {
  state: SerializedState;
  kind: "main";
} {
  return { ...ui, state: serializeState(ui.state) };
}

export function deserializeEditUI(ui: {
  kind: "main";
  state: SerializedState;
}): EditUI {
  return {
    ...ui,
    state: deserializeState(ui.state),
  };
}

export function ThemeEditor({
  state,
  handlePrevUI,
  handleRenameColor,
  handleRemoveFromGroup,
  handleAddToGroup,
  handleToggleStatus,
}: {
  state: State;
  handlePrevUI: () => void;
  handleRenameColor: (colorId: string, groupName: string) => void;
  handleRemoveFromGroup: (colorId: string, groupName: string) => void;
  handleAddToGroup: (groupName: string) => void;
  handleToggleStatus: (selectableItem: SelectableItem) => void;
}) {
  return (
    <>
      <div className="mb-4">
        <button
          onClick={(_event) => handlePrevUI()}
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
