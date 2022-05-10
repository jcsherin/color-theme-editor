interface ViewMode {
  kind: "view";
}
interface EditMode {
  kind: "edit";
  colorId: string;
}

type InputMode = ViewMode | EditMode;

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

type InputAction = Focus | MoveUp | MoveDown | Escape;

export const initialInputMode: InputMode = { kind: "view" };

export function reducerInputAction(
  state: InputMode,
  action: InputAction
): InputMode {
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
          return { ...state, kind: "view" };
      }
  }
}
