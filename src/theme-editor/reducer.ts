import {
  Group,
  SelectableItem,
  notGrouped,
  parseColorGroups,
  makeSelectable,
  toggleStatus,
  ungroup,
  groupSelected,
  isSelected,
  GroupDict,
} from "./index";
import {
  ColorMap,
  colorComparator,
  getColorName,
  getColorValue,
  HexColor,
  parseColors,
  updateColorName,
} from "../color";
import { FormData } from "../form";

export interface ThemeEditorState {
  colorMap: ColorMap;
  groupMap: Map<string, Group>;
  selectables: SelectableItem[];
}

export interface SerializedThemeEditorState {
  colorMap: [string, HexColor][];
  groupMap: [string, Group][];
  selectables: SelectableItem[];
}

export function initThemeEditorState(): ThemeEditorState {
  return { colorMap: new Map(), groupMap: new Map(), selectables: [] };
}

export function serializeThemeEditorState(
  themeEditor: ThemeEditorState
): SerializedThemeEditorState {
  return {
    colorMap: Array.from(themeEditor.colorMap),
    groupMap: Array.from(themeEditor.groupMap),
    selectables: themeEditor.selectables,
  };
}

export function deserializeThemeEditorState(
  state: SerializedThemeEditorState
): ThemeEditorState {
  return {
    ...state,
    colorMap: new Map(state.colorMap),
    groupMap: new Map(state.groupMap),
  };
}

export function serializeForTailwind({
  colorMap,
  groupMap,
  selectables,
}: ThemeEditorState) {
  const serialized: { [name: string]: string | { [name: string]: string } } =
    {};
  Array.from(groupMap.values()).forEach((colorGroup) => {
    const inner: { [name: string]: string } = {};
    Array.from(colorGroup.colorIds)
      .sort(colorComparator(colorMap))
      .forEach((colorId) => {
        const color = colorMap.get(colorId);
        if (color) {
          const key = getColorName(color);
          const value = getColorValue(color);
          inner[key] = value;
        }
      });
    serialized[colorGroup.name] = inner;
  });
  selectables
    .filter(notGrouped)
    .map((item) => item.colorId)
    .sort(colorComparator(colorMap))
    .forEach((colorId) => {
      const color = colorMap.get(colorId);
      if (color) {
        const key = getColorName(color);
        const value = getColorValue(color);
        serialized[key] = value;
      }
    });
  const wrapper = { theme: { colors: serialized } };
  const template = `module.exports = ${JSON.stringify(wrapper, null, 2)}`;
  return template;
}

export function parse(form: FormData): ThemeEditorState {
  const colorDict = parseColors(form.colors);
  const colorGroupDict = parseColorGroups(form.classnames);
  const colorList = Array.from(colorDict.keys()).map(makeSelectable);
  return {
    colorMap: colorDict,
    groupMap: colorGroupDict,
    selectables: colorList,
  };
}

interface ThemeEditorActionParse {
  kind: "parse";
  form: FormData;
}

interface ThemeEditorActionAddToGroup {
  kind: "addToGroup";
  groupName: string;
}

interface ThemeEditorActionRemoveFromGroup {
  kind: "removeFromGroup";
  groupName: string;
  colorId: string;
}

interface ThemeEditorActionRenameColor {
  kind: "renameColor";
  colorId: string;
  newName: string;
}

interface ThemeEditorActionToggleStatus {
  kind: "toggleStatus";
  selectableItem: SelectableItem;
}

interface ThemeEditorActionReset {
  kind: "reset";
}

export type ThemeEditorAction =
  | ThemeEditorActionParse
  | ThemeEditorActionAddToGroup
  | ThemeEditorActionRemoveFromGroup
  | ThemeEditorActionRenameColor
  | ThemeEditorActionToggleStatus
  | ThemeEditorActionReset;

export const getInitialThemeEditorState = (
  reset: boolean = false
): ThemeEditorState => {
  const key = "state";

  if (reset) {
    const emptyJSON = JSON.stringify({
      colorMap: [],
      groupMap: [],
      selectables: [],
    });
    localStorage.setItem(key, emptyJSON);
  }

  const cached = localStorage.getItem(key);
  if (!cached) {
    return {
      colorMap: new Map(),
      groupMap: new Map(),
      selectables: [],
    };
  }

  const state = JSON.parse(cached);
  const colorMap: ColorMap = new Map(state.colorDict);
  const groupMap: GroupDict = new Map(state.colorGroupDict);
  const selectables: SelectableItem[] = state.colorList;
  return {
    colorMap,
    groupMap,
    selectables,
  };
};

export const reducer = (
  state: ThemeEditorState,
  action: ThemeEditorAction
): ThemeEditorState => {
  switch (action.kind) {
    case "parse": {
      // Don't reparse user input!
      if (state.colorMap.size > 0 && state.groupMap.size > 0) return state;

      return parse(action.form);
    }

    case "addToGroup": {
      const group = state.groupMap.get(action.groupName);
      if (!group) return state;

      const selected = state.selectables
        .filter(isSelected)
        .map((item) => item.colorId);

      const deduped = new Set([...group.colorIds, ...selected]);
      const newGroup = { ...group, colorIds: Array.from(deduped) };
      state.groupMap.set(group.name, newGroup);

      return {
        ...state,
        groupMap: new Map(Array.from(state.groupMap)),
        selectables: groupSelected(state.selectables),
      };
    }

    case "removeFromGroup": {
      const group = state.groupMap.get(action.groupName);
      if (!group) return state;

      const colorIds = group.colorIds.filter(
        (colorId) => colorId !== action.colorId
      );
      const newGroup = { ...group, colorIds: colorIds };
      state.groupMap.set(group.name, newGroup);

      return {
        ...state,
        groupMap: new Map(Array.from(state.groupMap)),
        selectables: state.selectables.map(ungroup(action.colorId)),
      };
    }

    case "renameColor": {
      const color = state.colorMap.get(action.colorId);
      if (!color) return state;

      state.colorMap.set(
        action.colorId,
        updateColorName(color, action.newName)
      );

      return {
        ...state,
        colorMap: new Map(Array.from(state.colorMap)),
      };
    }

    case "toggleStatus": {
      return {
        ...state,
        selectables: state.selectables.map(
          toggleStatus(action.selectableItem.colorId)
        ),
      };
    }

    case "reset": {
      return getInitialThemeEditorState(true);
    }
  }
};
