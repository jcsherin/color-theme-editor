import React, { useEffect, useReducer } from "react";

import {
  ThemeEditor,
  ThemeEditorState,
  initThemeEditorState,
  reducer,
} from "./theme-editor";

function init({
  cacheKey,
  initialState,
}: {
  cacheKey: string;
  initialState: ThemeEditorState;
}) {
  const cached = localStorage.getItem(cacheKey);
  return cached ? JSON.parse(cached) : initialState;
}

const cacheKey = "themeEditorState";

export default function App() {
  const [state, dispatch] = useReducer(
    reducer,
    {
      cacheKey: cacheKey,
      initialState: initThemeEditorState(),
    },
    init
  );

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(state));
  }, [state]);

  return (
    <div className="h-screen bg-neutral-200">
      <ThemeEditor
        state={state}
        handleRenameColor={(colorId, newName) =>
          dispatch({
            kind: "renameColor",
            colorId: colorId,
            newName: newName,
          })
        }
        handleRemoveFromGroup={(colorId, groupName) =>
          dispatch({
            kind: "removeFromGroup",
            groupName: groupName,
            colorId: colorId,
          })
        }
        handleAddToGroup={(groupName) =>
          dispatch({ kind: "addToGroup", groupName: groupName })
        }
        handleToggleStatus={(selectableItem) =>
          dispatch({
            kind: "toggleStatus",
            selectableItem: selectableItem,
          })
        }
        handleMergeState={(formData) =>
          dispatch({ kind: "mergeState", formData: formData })
        }
      />
    </div>
  );
}
