import React from "react";
import { CopyButton } from "../clipboard";
import { TreeEditor } from "../tree-editor";
import { SelectableItem, GroupColors } from "./index";
import {
  deserializeThemeEditorState,
  serializeForTailwind,
  serializeThemeEditorState,
} from "./reducer";

import type { ThemeEditorState, SerializedThemeEditorState } from "./reducer";

export interface EditUI {
  kind: "main";
  state: ThemeEditorState;
}

export interface EditUISerialized {
  kind: "main";
  state: SerializedThemeEditorState;
}

export function createEditUI(state: ThemeEditorState): EditUI {
  return {
    kind: "main",
    state: state,
  };
}

export function serializeEditUI(ui: EditUI): {
  state: SerializedThemeEditorState;
  kind: "main";
} {
  return { ...ui, state: serializeThemeEditorState(ui.state) };
}

export function deserializeEditUI(ui: {
  kind: "main";
  state: SerializedThemeEditorState;
}): EditUI {
  return {
    ...ui,
    state: deserializeThemeEditorState(ui.state),
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
  state: ThemeEditorState;
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
          content={serializeForTailwind(state)}
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
