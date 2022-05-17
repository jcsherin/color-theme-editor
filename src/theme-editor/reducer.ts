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
  ColorDict,
  compareColorId,
  getColorName,
  getColorValue,
  HexColor,
  parseColors,
  updateColorName,
} from "../color";
import { FormData } from "../form";

export interface ThemeEditorState {
  colorDict: Map<string, HexColor>;
  colorGroupDict: Map<string, Group>;
  colorList: SelectableItem[];
}

export interface SerializedThemeEditorState {
  colorDict: [string, HexColor][];
  colorGroupDict: [string, Group][];
  colorList: SelectableItem[];
}

export function serializeThemeEditorState(
  themeEditor: ThemeEditorState
): SerializedThemeEditorState {
  return {
    colorDict: Array.from(themeEditor.colorDict),
    colorGroupDict: Array.from(themeEditor.colorGroupDict),
    colorList: themeEditor.colorList,
  };
}

export function deserializeThemeEditorState(
  state: SerializedThemeEditorState
): ThemeEditorState {
  return {
    ...state,
    colorDict: new Map(state.colorDict),
    colorGroupDict: new Map(state.colorGroupDict),
  };
}

export function serializeForTailwind({
  colorDict,
  colorGroupDict,
  colorList,
}: ThemeEditorState) {
  const serialized: { [name: string]: string | { [name: string]: string } } =
    {};
  Array.from(colorGroupDict.values()).forEach((colorGroup) => {
    const inner: { [name: string]: string } = {};
    Array.from(colorGroup.colorIds)
      .sort(compareColorId(colorDict))
      .forEach((colorId) => {
        const color = colorDict.get(colorId);
        if (color) {
          const key = getColorName(color);
          const value = getColorValue(color);
          inner[key] = value;
        }
      });
    serialized[colorGroup.name] = inner;
  });
  colorList
    .filter(notGrouped)
    .map((item) => item.colorId)
    .sort(compareColorId(colorDict))
    .forEach((colorId) => {
      const color = colorDict.get(colorId);
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
    colorDict: colorDict,
    colorGroupDict: colorGroupDict,
    colorList: colorList,
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

export const getInitialThemeEditorState = (reset: boolean = false) => {
  const key = "state";

  if (reset) {
    const emptyJSON = JSON.stringify({
      colorDict: [],
      colorGroupDict: [],
      colorList: [],
    });
    localStorage.setItem(key, emptyJSON);
  }

  const cached = localStorage.getItem(key);
  if (!cached) {
    return {
      colorDict: new Map(),
      colorGroupDict: new Map(),
      colorList: [],
    };
  }

  const state = JSON.parse(cached);
  const colorDict: ColorDict = new Map(state.colorDict);
  const colorGroupDict: GroupDict = new Map(state.colorGroupDict);
  const colorList: SelectableItem[] = state.colorList;
  return {
    colorDict: colorDict,
    colorGroupDict: colorGroupDict,
    colorList: colorList,
  };
};

export const reducer = (
  state: ThemeEditorState,
  action: ThemeEditorAction
): ThemeEditorState => {
  switch (action.kind) {
    case "parse": {
      // Don't reparse user input!
      if (state.colorDict.size > 0 && state.colorGroupDict.size > 0)
        return state;

      return parse(action.form);
    }

    case "addToGroup": {
      const group = state.colorGroupDict.get(action.groupName);
      if (!group) return state;

      const selected = state.colorList
        .filter(isSelected)
        .map((item) => item.colorId);

      const deduped = new Set([...group.colorIds, ...selected]);
      const newGroup = { ...group, colorIds: Array.from(deduped) };
      state.colorGroupDict.set(group.name, newGroup);

      return {
        ...state,
        colorGroupDict: new Map(Array.from(state.colorGroupDict)),
        colorList: groupSelected(state.colorList),
      };
    }

    case "removeFromGroup": {
      const group = state.colorGroupDict.get(action.groupName);
      if (!group) return state;

      const colorIds = group.colorIds.filter(
        (colorId) => colorId !== action.colorId
      );
      const newGroup = { ...group, colorIds: colorIds };
      state.colorGroupDict.set(group.name, newGroup);

      return {
        ...state,
        colorGroupDict: new Map(Array.from(state.colorGroupDict)),
        colorList: state.colorList.map(ungroup(action.colorId)),
      };
    }

    case "renameColor": {
      const color = state.colorDict.get(action.colorId);
      if (!color) return state;

      state.colorDict.set(
        action.colorId,
        updateColorName(color, action.newName)
      );

      return {
        ...state,
        colorDict: new Map(Array.from(state.colorDict)),
      };
    }

    case "toggleStatus": {
      return {
        ...state,
        colorList: state.colorList.map(
          toggleStatus(action.selectableItem.colorId)
        ),
      };
    }

    case "reset": {
      return getInitialThemeEditorState(true);
    }
  }
};
