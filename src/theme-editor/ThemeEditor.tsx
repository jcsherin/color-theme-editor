import React, { useState } from "react";
import { CopyButton } from "../clipboard";
import { TreeEditor } from "../tree-editor";
import { SelectableItem, GroupColors } from "./index";
import { serializedTailwindExport } from "./reducer";

import type { ThemeEditorState } from "./reducer";
import { Form2, FormData } from "../form";

export interface EditUI {
  kind: "main";
  state: ThemeEditorState;
}

export function createEditUI(state: ThemeEditorState): EditUI {
  return {
    kind: "main",
    state: state,
  };
}

type Mode = "showGrouping" | "showForm";

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
  const [viewMode, setViewMode] = useState<Mode>("showGrouping");

  const selectView = (viewMode: Mode) => {
    switch (viewMode) {
      case "showGrouping":
        return (
          <div>
            <div className="h-12 flex items-center">
              <button
                onClick={(_event) => setViewMode("showForm")}
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
      case "showForm":
        return (
          <Form2
            formData={state.formData}
            handleUpdateForm={(formData) => {
              setViewMode("showGrouping");
              handleMergeState(formData);
            }}
          />
        );
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 h-full">
        <div className="ml-4">
          <div className="h-12 flex items-center">
            <CopyButton
              label="Copy Tailwind Config"
              content={serializedTailwindExport(state)}
              expiryInMs={2000}
              className="py-1 px-4 rounded-sm bg-sky-900 hover:bg-sky-700 text-sky-50"
              flashClassName="py-1 px-4 rounded-sm text-green-50 bg-green-700"
            />
          </div>
          <TreeEditor
            state={state}
            handleRenameColor={handleRenameColor}
            handleRemoveFromGroup={handleRemoveFromGroup}
            className="bg-slate-900 text-slate-200 font-mono px-4 py-4 mr-2 mb-4 overflow-y-scroll"
            style={{ height: `calc(100vh - 4rem)` }}
          />
        </div>
        <div className="mr-4">{selectView(viewMode)}</div>
      </div>
    </>
  );
}
