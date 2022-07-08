interface ViewMode {
  kind: "view";
}
interface EditMode {
  kind: "edit";
  colorId: string;
}

export type EditorMode = ViewMode | EditMode;

interface Focus {
  kind: "focus";
  colorId: string;
}

interface MoveUp {
  kind: "moveup";
  target: string;
}

interface MoveDown {
  kind: "movedown";
  target: string;
}

interface Escape {
  kind: "escape";
}

type EditorAction = Focus | MoveUp | MoveDown | Escape;

export const editorViewMode: EditorMode = { kind: "view" };

export function reducer(state: EditorMode, action: EditorAction): EditorMode {
  switch (state.kind) {
    case "view":
      switch (action.kind) {
        case "focus":
          return { kind: "edit", colorId: action.colorId };
        case "movedown":
        case "moveup":
          return { kind: "edit", colorId: action.target };
        case "escape":
          return state;
      }
    case "edit":
      switch (action.kind) {
        case "focus":
          return { ...state, colorId: action.colorId };
        case "movedown":
        case "moveup":
          return { ...state, colorId: action.target };
        case "escape":
          return { kind: "view" };
      }
  }
}
