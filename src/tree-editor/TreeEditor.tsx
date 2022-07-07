import { nameComparator, NamedCSSColor } from "../color";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { notGrouped } from "../theme-editor";
import { ThemeEditorState } from "../theme-editor";
import {
  TreeNode,
  TreeLeafView,
  TreeLeafEdit,
  editorViewMode,
  reducer,
} from "./index";

const treeLeafView = (
  color: NamedCSSColor,
  handleFocus: (colorId: string) => void
) => (
  <TreeLeafView
    colorId={color.id}
    key={color.cssValue}
    handleFocus={(_event) => handleFocus(color.id)}
  >
    <span className="mr-4">"{color.name ? color.name : color.cssValue}"</span>
    <span className="mr-4">:</span>
    <span
      className="w-4 h-4 inline-block mr-2 rounded-sm"
      style={{ backgroundColor: color.cssValue }}
    ></span>
    <span>{color.cssValue},</span>
  </TreeLeafView>
);

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

  const handleInputFocus = (colorId: string) =>
    dispatchEditor({ kind: "focus", colorId: colorId });

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
    {
      colorId,
      prevColorId,
      nextColorId,
      color,
    }: {
      colorId: string;
      prevColorId: string;
      nextColorId: string;
      color: NamedCSSColor;
    },
    focusRenameInput: boolean,
    handleFocus: (colorId: string) => void,
    handleRenameColor: (colorId: string, name: string) => void,
    handleKeyboardNavigate: (key: string, target: string) => void,
    children?: React.ReactNode
  ) => {
    switch (editorMode.kind) {
      case "view":
        return treeLeafView(color, handleFocus);
      case "edit":
        return editorMode.colorId === colorId ? (
          <TreeLeafEdit
            key={color.cssValue}
            color={color}
            focus={focusRenameInput}
            handleRenameColor={handleRenameColor}
            handleKeyboardNavigate={handleKeyboardNavigate}
            prev={prevColorId}
            next={nextColorId}
          >
            {children}
          </TreeLeafEdit>
        ) : (
          treeLeafView(color, handleFocus)
        );
    }
  };

  const configOrderedColorIds = Object.values(state.groupDictionary)
    .flat()
    .concat(state.selectables.filter(notGrouped).map((item) => item.colorId));

  const getNodeIdx = (colorId: string) =>
    configOrderedColorIds.findIndex((id) => id === colorId);

  const prevColorId = (colorId: string) => {
    const idx = getNodeIdx(colorId);
    const prevIdx =
      (idx - 1 + configOrderedColorIds.length) % configOrderedColorIds.length;
    return configOrderedColorIds[prevIdx];
  };

  const nextColorId = (colorId: string) => {
    const idx = getNodeIdx(colorId);
    const nextIdx = (idx + 1) % configOrderedColorIds.length;
    return configOrderedColorIds[nextIdx];
  };

  const colorGroupNodes = Object.entries(state.groupDictionary).map(
    ([groupName, colorIds]) => {
      const children = colorIds
        .sort(nameComparator(state.colorDictionary))
        .flatMap((colorId) => {
          const color = state.colorDictionary[colorId];
          return color
            ? [
                {
                  colorId,
                  prevColorId: prevColorId(colorId),
                  nextColorId: nextColorId(colorId),
                  color,
                },
              ]
            : [];
        })
        .map((args) => {
          let removeButton = (
            <button
              className="py-1 px-4 text-red-100 hover:text-red-300 bg-red-600 hover:bg-red-800 font-sans rounded-sm"
              onClick={(_e) => handleRemoveFromGroup(args.colorId, groupName)}
            >
              Remove
            </button>
          );

          return colorNode(
            args,
            focusRenameInput,
            handleInputFocus,
            handleRenameColor,
            handleKeyboardNavigate,
            removeButton
          );
        });

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

  const singleColorNodes = state.selectables
    .filter(notGrouped)
    .map((item) => item.colorId)
    .flatMap((colorId) => {
      const color = state.colorDictionary[colorId];
      return color
        ? [
            {
              colorId,
              prevColorId: prevColorId(colorId),
              nextColorId: nextColorId(colorId),
              color,
            },
          ]
        : [];
    })
    .map((args) =>
      colorNode(
        args,
        focusRenameInput,
        handleInputFocus,
        handleRenameColor,
        handleKeyboardNavigate
      )
    );

  const childNodes = [colorGroupNodes, ...singleColorNodes];

  return (
    <div ref={mouseRef} className={className} style={style}>
      <TreeNode contents="module.exports =" openMarker="{" closeMarker="}">
        <TreeNode contents="theme:" openMarker="{" closeMarker="}">
          <TreeNode contents="colors:" openMarker="{" closeMarker="}">
            {childNodes}
          </TreeNode>
        </TreeNode>
      </TreeNode>
    </div>
  );
}
