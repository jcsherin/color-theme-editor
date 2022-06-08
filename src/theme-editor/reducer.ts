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
  GroupMap,
} from "./index";
import {
  ColorMap,
  colorComparator,
  getColorName,
  getColorValue,
  HexColor,
  parseColors,
  updateColorName,
  makeColorMap,
  removeColorsFromColorMap,
  addColorsToColorMap,
} from "../color";
import { FormData, initFormData } from "../form";
import {
  addGroupsToGroupMap,
  makeGroupMap,
  removeColorsFromGroupMap,
  removeGroupsFromGroupMap,
} from "./group";

export interface ThemeEditorState {
  formData: FormData;
  colorMap: ColorMap;
  groupMap: GroupMap;
  selectables: SelectableItem[];
}

type SerializedColorMap = [string, HexColor][];
type SerializedGroupMap = [string, Group][];
export interface SerializedThemeEditorState {
  formData: FormData;
  colorMap: SerializedColorMap;
  groupMap: SerializedGroupMap;
  selectables: SelectableItem[];
}

export function initThemeEditorState(): ThemeEditorState {
  return {
    formData: initFormData(),
    colorMap: new Map(),
    groupMap: new Map(),
    selectables: [],
  };
}

export function serializeThemeEditorState(
  themeEditor: ThemeEditorState
): SerializedThemeEditorState {
  return {
    formData: themeEditor.formData,
    colorMap: Array.from(themeEditor.colorMap),
    groupMap: Array.from(themeEditor.groupMap),
    selectables: themeEditor.selectables,
  };
}

export function deserializeThemeEditorState(
  state: SerializedThemeEditorState
): ThemeEditorState {
  return {
    formData: state.formData,
    colorMap: new Map(state.colorMap),
    groupMap: new Map(state.groupMap),
    selectables: state.selectables,
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

export function parse(formData: FormData): ThemeEditorState {
  const colorMap = makeColorMap(parseColors(formData.colors));
  const groupMap = makeGroupMap(parseColorGroups(formData.classnames));
  const selectables = Array.from(colorMap.keys()).map(makeSelectable);
  return {
    formData,
    colorMap,
    groupMap,
    selectables,
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

interface ThemeEditorActionMergeState {
  kind: "mergeState";
  formData: FormData;
}

export type ThemeEditorAction =
  | ThemeEditorActionParse
  | ThemeEditorActionAddToGroup
  | ThemeEditorActionRemoveFromGroup
  | ThemeEditorActionRenameColor
  | ThemeEditorActionToggleStatus
  | ThemeEditorActionReset
  | ThemeEditorActionMergeState;

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
    return initThemeEditorState();
  }

  const state = JSON.parse(cached);
  const formData: FormData = state.formData;
  const colorMap: ColorMap = new Map(state.colorMap);
  const groupMap: GroupMap = new Map(state.groupMap);
  const selectables: SelectableItem[] = state.slectables;
  return {
    formData,
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

    /*
      State Reconciliation algorithm
      ==============================

      ## Colors
      1. Remove `removedColors` from groups in `groupMap`
      2. Remove `removedColors` from `colorMap`
      3. Add `addedColors` to `colorMap`

      ## Groups
      4. Add `addedGroups` to `groupMap`
      5. Remove `removedGroups` from `groupMap`

      ## Selectables
      6. Create new `selectables` from `colorMap`

      ## Form Data
      8. Update `formData` field
      */
    case "mergeState": {
      if (action.formData === state.formData) return state;

      let newState = state;

      const existingColors = parseColors(state.formData.colors);
      const incomingColors = parseColors(action.formData.colors);

      const removedColors = new Set(
        Array.from(existingColors).filter((color) => !incomingColors.has(color))
      );
      newState = {
        ...newState,
        groupMap: removeColorsFromGroupMap(newState.groupMap, removedColors),
      };
      newState = {
        ...newState,
        colorMap: removeColorsFromColorMap(newState.colorMap, removedColors),
      };

      const addedColors = new Set(
        Array.from(incomingColors).filter((color) => !existingColors.has(color))
      );
      newState = {
        ...newState,
        colorMap: addColorsToColorMap(newState.colorMap, addedColors),
      };

      const existingGroups = parseColorGroups(state.formData.classnames);
      const incomingGroups = parseColorGroups(action.formData.classnames);

      const addedGroups = new Set(
        Array.from(incomingGroups).filter((group) => !existingGroups.has(group))
      );
      newState = {
        ...newState,
        groupMap: addGroupsToGroupMap(newState.groupMap, addedGroups),
      };

      const removedGroups = new Set(
        Array.from(existingGroups).filter((group) => !incomingGroups.has(group))
      );
      newState = {
        ...newState,
        groupMap: removeGroupsFromGroupMap(newState.groupMap, removedGroups),
      };

      return newState;
    }
  }
};
