import React, { useEffect, useReducer, useRef, useState } from "react";

import type { NamedCSSColor } from "../color";
import type { ThemeEditorState } from "../theme-editor";
import type { ColorIterator } from "./colorIterator";

import { nameComparator } from "../color";
import { isGrouped } from "../theme-editor";
import { ColorSelector } from "./ColorSelector";
import { TreeNode } from "./TreeNode";
import { TreeLeafEdit } from "./TreeLeafEdit";
import { UngroupButton } from "./UngroupButton";
import { editorViewMode, reducer } from "./reducer";
import { createColorIterator } from "./colorIterator";

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
  const [focusRenameInput, setFocusRenameInput] = useState(false);
  const mouseRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleRenameInputFocus(event: MouseEvent) {
      if (
        mouseRef &&
        mouseRef.current &&
        mouseRef.current.contains(event.target as Node)
      ) {
        setFocusRenameInput(true);
      } else {
        setFocusRenameInput(false);
      }
    }

    document.addEventListener("mousedown", handleRenameInputFocus);
    return () =>
      document.removeEventListener("mousedown", handleRenameInputFocus);
  }, []);

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

  const colorNode = (
    color: NamedCSSColor,
    colorIterator: ColorIterator,
    focusRenameInput: boolean,
    handleFocus: (color: NamedCSSColor) => void,
    handleRenameColor: (colorId: string, name: string) => void,
    handleKeyboardNavigate: (key: string, target: string) => void,
    children?: React.ReactNode
  ) => {
    switch (editorMode.kind) {
      case "view":
        return <ColorSelector color={color} handleFocus={handleFocus} />;
      case "edit":
        return editorMode.colorId === color.id ? (
          <TreeLeafEdit
            key={color.cssValue}
            color={color}
            colorIterator={colorIterator}
            focus={focusRenameInput}
            handleRenameColor={handleRenameColor}
            handleKeyboardNavigate={handleKeyboardNavigate}
          >
            {children}
          </TreeLeafEdit>
        ) : (
          <ColorSelector color={color} handleFocus={handleFocus} />
        );
    }
  };

  const colorIterator = createColorIterator(state);

  const groupedColors = Object.entries(state.groupDictionary).map(
    ([groupName, colorIds]) => {
      const children = colorIds
        .sort(nameComparator(state.colorDictionary))
        .flatMap((colorId) =>
          state.colorDictionary[colorId] ? [state.colorDictionary[colorId]] : []
        )
        .map((color) =>
          colorNode(
            color,
            colorIterator,
            focusRenameInput,
            handleInputFocus,
            handleRenameColor,
            handleKeyboardNavigate,
            <UngroupButton
              groupName={groupName}
              color={color}
              handleRemoveFromGroup={handleRemoveFromGroup}
            />
          )
        );

      const contents = `"${groupName}" :`;
      return children.length === 0 ? (
        <TreeNode
          key={groupName}
          contents={contents}
          openMarker="{"
          closeMarker="},"
        />
      ) : (
        <TreeNode
          key={groupName}
          contents={contents}
          openMarker="{"
          closeMarker="},"
        >
          {children}
        </TreeNode>
      );
    }
  );

  const ungroupedColors = state.selectables
    .filter((item) => !isGrouped(item))
    .map((item) => item.colorId)
    .flatMap((colorId) =>
      state.colorDictionary[colorId] ? [state.colorDictionary[colorId]] : []
    )
    .map((color) =>
      colorNode(
        color,
        colorIterator,
        focusRenameInput,
        handleInputFocus,
        handleRenameColor,
        handleKeyboardNavigate
      )
    );

  return (
    <div ref={mouseRef} className={className} style={style}>
      <TreeNode contents="module.exports =" openMarker="{" closeMarker="}">
        <TreeNode contents="theme:" openMarker="{" closeMarker="}">
          <TreeNode contents="colors:" openMarker="{" closeMarker="}">
            {groupedColors}
            {ungroupedColors}
          </TreeNode>
        </TreeNode>
      </TreeNode>
    </div>
  );
}
