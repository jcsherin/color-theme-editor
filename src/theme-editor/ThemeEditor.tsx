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
import { Form2, FormData } from "../form";

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

type ViewMode = "viewGroupingUI" | "viewFormUI";

export function ThemeEditor({
  state,
  handleRenameColor,
  handleRemoveFromGroup,
  handleAddToGroup,
  handleToggleStatus,
  handleMergeState,
}: {
  state: ThemeEditorState;
  handleRenameColor: (colorId: string, groupName: string) => void;
  handleRemoveFromGroup: (colorId: string, groupName: string) => void;
  handleAddToGroup: (groupName: string) => void;
  handleToggleStatus: (selectableItem: SelectableItem) => void;
  handleMergeState: (formData: FormData) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("viewGroupingUI");

  const selectView = (viewMode: ViewMode) => {
    switch (viewMode) {
      case "viewGroupingUI":
        return (
          <div>
            <div className="h-10 mb-4 flex items-center">
              <button
                onClick={(_event) => setViewMode("viewFormUI")}
                className="justify-self-end ml-auto py-1 px-4 rounded-sm bg-sky-900 hover:bg-sky-700 text-sky-50"
              >
                Edit
              </button>
            </div>
            <GroupColors
              state={state}
              handleSelection={handleToggleStatus}
              handleAddToGroup={handleAddToGroup}
            />
          </div>
        );
      case "viewFormUI":
        return (
          <Form2
            formData={state.formData}
            handleUpdateForm={(formData) => {
              setViewMode("viewGroupingUI");
              handleMergeState(formData);
            }}
          />
        );
    }
  };

  return (
    <>
      <div className="grid grid-cols-2">
        <div>
          <div className="h-10 mb-4 flex items-center">
            <CopyButton
              label="Copy theme to clipboard"
              content={serializeForTailwind(state)}
              expiryInMs={2000}
              className="mr-4 text-blue-500 hover:text-blue-800"
              flashClassName="text-green-800"
            />
          </div>
          <TreeEditor
            state={state}
            handleRenameColor={handleRenameColor}
            handleRemoveFromGroup={handleRemoveFromGroup}
          />
        </div>
        {selectView(viewMode)}
      </div>
    </>
  );
}
