import React, { useReducer, useRef } from "react";

import type { NamedCSSColor, NamedCSSColorDictionary } from "../color";
import type {
  GroupDictionary,
  SelectableItem,
  ThemeEditorState,
} from "../theme-editor";
import type { ColorIterator } from "./colorIterator";

import { ColorSelector } from "./ColorSelector";
import { TreeNode } from "./TreeNode";
import { TreeLeafEdit } from "./TreeLeafEdit";
import { UngroupButton } from "./UngroupButton";
import { EditorMode, editorViewMode, reducer } from "./reducer";
import { createColorIterator } from "./colorIterator";
import {
  sortGroupColorsByName,
  sortUngroupedColorsByName,
} from "../theme-editor/reducer";
import { useFocusTextInput } from "./useFocusTextInput";

interface SortedColorsProps {
  colorDictionary: NamedCSSColorDictionary;
  colorIterator: ColorIterator;
  editorMode: EditorMode;
  isFocusTextInput: boolean;
  handleInputFocus: (color: NamedCSSColor) => void;
  handleRenameColor: (colorId: string, newName: string) => void;
  handleKeyboardNavigate: (key: string, target: string) => void;
}

interface SortedGroupedColorsProps extends SortedColorsProps {
  groupDictionary: GroupDictionary;
  handleRemoveFromGroup: (colorId: string, gorupName: string) => void;
}

interface SortedUngroupedColorsProps extends SortedColorsProps {
  selectables: SelectableItem[];
}

const colorNode = (
  color: NamedCSSColor,
  colorIterator: ColorIterator,
  editorMode: EditorMode,
  isFocusTextInput: boolean,
  handleFocus: (color: NamedCSSColor) => void,
  handleRenameColor: (colorId: string, name: string) => void,
  handleKeyboardNavigate: (key: string, target: string) => void,
  children?: React.ReactNode
) => {
  switch (editorMode.kind) {
    case "view":
      return (
        <ColorSelector key={color.id} color={color} handleFocus={handleFocus} />
      );
    case "edit":
      return editorMode.colorId === color.id ? (
        <TreeLeafEdit
          key={color.id}
          color={color}
          colorIterator={colorIterator}
          focus={isFocusTextInput}
          handleRenameColor={handleRenameColor}
          handleKeyboardNavigate={handleKeyboardNavigate}
        >
          {children}
        </TreeLeafEdit>
      ) : (
        <ColorSelector key={color.id} color={color} handleFocus={handleFocus} />
      );
  }
};

const groupNameToKey = (groupName: string): string => `"${groupName}" :`;

function SortedGroupedColors({
  colorDictionary,
  groupDictionary,
  colorIterator,
  editorMode,
  isFocusTextInput,
  handleInputFocus,
  handleRenameColor,
  handleRemoveFromGroup,
  handleKeyboardNavigate,
}: SortedGroupedColorsProps) {
  return (
    <>
      {sortGroupColorsByName(colorDictionary, groupDictionary).map(
        ([groupName, colors]) =>
          colors.length === 0 ? (
            <TreeNode
              key={groupName}
              contents={groupNameToKey(groupName)}
              openMarker="{"
              closeMarker="},"
            />
          ) : (
            <TreeNode
              key={groupName}
              contents={groupNameToKey(groupName)}
              openMarker="{"
              closeMarker="},"
            >
              {colors.map((color) =>
                colorNode(
                  color,
                  colorIterator,
                  editorMode,
                  isFocusTextInput,
                  handleInputFocus,
                  handleRenameColor,
                  handleKeyboardNavigate,
                  <UngroupButton
                    groupName={groupName}
                    color={color}
                    handleRemoveFromGroup={handleRemoveFromGroup}
                  />
                )
              )}
            </TreeNode>
          )
      )}
    </>
  );
}

function SortedUngroupedColors({
  colorDictionary,
  selectables,
  colorIterator,
  editorMode,
  isFocusTextInput,
  handleInputFocus,
  handleRenameColor,
  handleKeyboardNavigate,
}: SortedUngroupedColorsProps) {
  return (
    <>
      {sortUngroupedColorsByName(colorDictionary, selectables).map((color) =>
        colorNode(
          color,
          colorIterator,
          editorMode,
          isFocusTextInput,
          handleInputFocus,
          handleRenameColor,
          handleKeyboardNavigate
        )
      )}
    </>
  );
}

export function TreeEditor({
  state,
  handleRenameColor,
  handleRemoveFromGroup,
  className,
  style,
}: {
  state: ThemeEditorState;
  handleRenameColor: (colorId: string, newName: string) => void;
  handleRemoveFromGroup: (colorId: string, gorupName: string) => void;
  className: string;
  style: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFocusTextInput = useFocusTextInput(containerRef);
  const [editorMode, dispatchEditor] = useReducer(reducer, editorViewMode);

  const handleInputFocus = (color: NamedCSSColor) =>
    dispatchEditor({ kind: "focus", colorId: color.id });

  const handleKeyboardNavigate = (key: string, target: string) => {
    switch (key) {
      case "Enter":
      case "ArrowDown":
        return dispatchEditor({ kind: "movedown", target: target });
      case "ArrowUp":
        return dispatchEditor({ kind: "moveup", target: target });
      case "Escape":
        return dispatchEditor({ kind: "escape" });
    }
  };

  const colorIterator = createColorIterator(state);

  return (
    <div ref={containerRef} className={className} style={style}>
      <TreeNode contents="module.exports =" openMarker="{" closeMarker="}">
        <TreeNode contents="theme:" openMarker="{" closeMarker="}">
          <TreeNode contents="colors:" openMarker="{" closeMarker="}">
            <SortedGroupedColors
              colorDictionary={state.colorDictionary}
              groupDictionary={state.groupDictionary}
              colorIterator={colorIterator}
              editorMode={editorMode}
              isFocusTextInput={isFocusTextInput}
              handleInputFocus={handleInputFocus}
              handleRenameColor={handleRenameColor}
              handleRemoveFromGroup={handleRemoveFromGroup}
              handleKeyboardNavigate={handleKeyboardNavigate}
            />
            <SortedUngroupedColors
              colorDictionary={state.colorDictionary}
              selectables={state.selectables}
              colorIterator={colorIterator}
              editorMode={editorMode}
              isFocusTextInput={isFocusTextInput}
              handleInputFocus={handleInputFocus}
              handleRenameColor={handleRenameColor}
              handleKeyboardNavigate={handleKeyboardNavigate}
            />
          </TreeNode>
        </TreeNode>
      </TreeNode>
    </div>
  );
}
