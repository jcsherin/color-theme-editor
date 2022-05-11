// TreeEditor Helpers

import React, { useEffect, useReducer, useRef, useState } from "react";
import { notGrouped } from "../grouping";
import {
  compareColorId,
  getColorName,
  getColorValue,
  HexColor,
} from "../color";
import { State } from "../state";
import { initialInputMode, reducerInputAction } from "./editor";
import { TreeLeafEdit } from "./TreeLeafEdit";
import { TreeLeafView } from "./TreeLeafView";
import { TreeNode } from "./TreeNode";

const treeLeafView = (
  color: HexColor,
  colorId: string,
  handleFocus: (colorId: string) => void
) => (
  <TreeLeafView
    colorId={colorId}
    key={getColorValue(color)}
    handleFocus={(_event) => handleFocus(colorId)}
  >
    <span className="mr-4">"{getColorName(color)}"</span>
    <span className="mr-4">:</span>
    <span
      className="w-4 h-4 inline-block mr-2 rounded-sm"
      style={{ backgroundColor: getColorValue(color) }}
    ></span>
    <span>{getColorValue(color)},</span>
  </TreeLeafView>
);

export function TreeEditor({
  state,
  handleRenameColor,
  handleRemoveFromGroup,
}: {
  state: State;
  handleRenameColor: (colorId: string, newName: string) => void;
  handleRemoveFromGroup: (colorId: string, gorupName: string) => void;
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

  const [inputMode, inputActionDispatch] = useReducer(
    reducerInputAction,
    initialInputMode
  );

  const handleInputFocus = (colorId: string) =>
    inputActionDispatch({ kind: "focus", colorId: colorId });

  const handleKeyboardNavigate = (key: string, target: string) => {
    switch (key) {
      case "Enter":
      case "ArrowDown":
        return inputActionDispatch({ kind: "movedown", target: target });
      case "ArrowUp":
        return inputActionDispatch({ kind: "moveup", target: target });
      case "Escape":
        return inputActionDispatch({ kind: "escape" });
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
      color: HexColor;
    },
    focusRenameInput: boolean,
    handleFocus: (colorId: string) => void,
    handleRenameColor: (colorId: string, name: string) => void,
    handleKeyboardNavigate: (key: string, target: string) => void,
    children?: React.ReactNode
  ) => {
    switch (inputMode.kind) {
      case "view":
        return treeLeafView(color, colorId, handleFocus);
      case "edit":
        return inputMode.colorId === colorId ? (
          <TreeLeafEdit
            key={getColorValue(color)}
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
          treeLeafView(color, colorId, handleFocus)
        );
    }
  };

  const configOrderedColorIds = Array.from(state.colorGroupDict.values())
    .flatMap((colorGroup) =>
      Array.from(colorGroup.colorIds).sort(compareColorId(state.colorDict))
    )
    .concat(
      state.colorList
        .filter(notGrouped)
        .map((item) => item.colorId)
        .sort(compareColorId(state.colorDict))
    );

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

  const colorGroupNodes = Array.from(state.colorGroupDict.values()).map(
    (colorGroup) => {
      const children = Array.from(colorGroup.colorIds)
        .sort(compareColorId(state.colorDict))
        .flatMap((colorId) => {
          const color = state.colorDict.get(colorId);
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
              onClick={(_e) =>
                handleRemoveFromGroup(args.colorId, colorGroup.name)
              }
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

      const contents = `"${colorGroup.name}" :`;
      return children.length === 0 ? (
        <TreeNode key={colorGroup.name} contents={contents} />
      ) : (
        <TreeNode key={colorGroup.name} contents={contents}>
          {children}
        </TreeNode>
      );
    }
  );

  const singleColorNodes = state.colorList
    .filter(notGrouped)
    .map((item) => item.colorId)
    .sort(compareColorId(state.colorDict))
    .flatMap((colorId) => {
      const color = state.colorDict.get(colorId);
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
    <div
      ref={mouseRef}
      className="bg-slate-900 text-slate-200 font-mono px-4 py-2 mr-2"
    >
      <TreeNode contents="module.exports =">
        <TreeNode contents="theme:">
          <TreeNode contents="colors:">{childNodes}</TreeNode>
        </TreeNode>
      </TreeNode>
    </div>
  );
}
