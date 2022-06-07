import React, { useState } from "react";
import { CopyButton } from "../clipboard";
import { TreeEditor } from "../tree-editor";
import { SelectableItem, GroupColors } from "./index";
import {
  deserializeThemeEditorState,
  serializeForTailwind,
  serializeThemeEditorState,
} from "./reducer";

import type { ThemeEditorState, SerializedThemeEditorState } from "./reducer";
import { Form } from "../form";

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

type GroupingMode = "groupAndRename" | "updateFormData";

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
  const [groupingMode, setGroupingMode] =
    useState<GroupingMode>("groupAndRename");

  const relatedAction = (groupingMode: GroupingMode) => {
    switch (groupingMode) {
      case "groupAndRename": {
        return (
          <button
            onClick={(_event) => setGroupingMode("updateFormData")}
            className="mr-4 py-1 px-4 rounded-sm bg-sky-900 hover:bg-sky-700 text-sky-50"
          >
            Update groups or colors
          </button>
        );
      }
      case "updateFormData": {
        return (
          <button
            onClick={(_event) => setGroupingMode("groupAndRename")}
            className="mr-4 py-1 px-4 rounded-sm bg-sky-900 hover:bg-sky-700 text-sky-50"
          >
            Group and rename colors
          </button>
        );
      }
    }
  };

  const groupingView = (groupingMode: GroupingMode) => {
    switch (groupingMode) {
      case "groupAndRename":
        return (
          <GroupColors
            state={state}
            handleSelection={handleToggleStatus}
            handleAddToGroup={handleAddToGroup}
          />
        );
      case "updateFormData":
        return <Form form={state.formData} handleUpdateForm={(_form) => {}} />;
    }
  };

  return (
    <>
      <div className="h-10 mb-4 flex items-center">
        <button
          onClick={(_event) => handlePrevUI()}
          className="mr-4 py-1 px-4 rounded-sm bg-green-100 hover:bg-green-300 text-green-500 hover:text-green-700"
        >
          Create New
        </button>
        {relatedAction(groupingMode)}
        <CopyButton
          label="Copy theme to clipboard"
          content={serializeForTailwind(state)}
          expiryInMs={2000}
          className=" text-blue-500 hover:text-blue-800"
          flashClassName="text-green-800"
        />
      </div>
      <div className="grid grid-cols-2" style={{ height: `calc(100% - 56px)` }}>
        <TreeEditor
          state={state}
          handleRenameColor={handleRenameColor}
          handleRemoveFromGroup={handleRemoveFromGroup}
        />
        {groupingView(groupingMode)}
      </div>
    </>
  );
}
