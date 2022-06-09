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
  addColorsToColorMap,
  removeColorsFromColorMap,
  getColorId,
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

      ## Add Colors
      1. Add _new_ colors to `colorMap`
      2. Add _new_ colors to `selectables`

      ## Delete Colors
      3. Remove _deleted_ colors from `colorMap`
      4. Remove _deleted_ colors from `groupMap`
      5. Remove _deleted_ colors from `selectables`

      ## Add Groups
      6. Add _new_ groups to `groupMap`

      ## Delete Groups
      7. Ungroup colors in _deleted_ groups in `selectables`
      8. Remove _deleted_ group from `groupMap`

      ## Rewrite Form Data
      9. Rewrite `formData` field with `action.formData`
      */
    case "mergeState": {
      if (action.formData === state.formData) {
        return state;
      }

      let merged = state;
      const prevColors = parseColors(state.formData.colors).map((color) =>
        JSON.stringify(color)
      );
      const currColors = parseColors(action.formData.colors).map((color) =>
        JSON.stringify(color)
      );

      // Add Colors
      const addedColors: HexColor[] = currColors
        .filter((color) => !prevColors.includes(color))
        .map((serialized) => JSON.parse(serialized));
      merged = {
        ...merged,
        colorMap: addColorsToColorMap(merged.colorMap, addedColors),
        selectables: [
          ...merged.selectables,
          ...addedColors.map(getColorId).map(makeSelectable),
        ],
      };

      // Delete Colors
      const deletedColors: HexColor[] = prevColors
        .filter((color) => !currColors.includes(color))
        .map((serialized) => JSON.parse(serialized));
      const deletedColorIds = deletedColors.map(getColorId);
      merged = {
        ...merged,
        colorMap: removeColorsFromColorMap(merged.colorMap, deletedColors),
        groupMap: removeColorsFromGroupMap(merged.groupMap, deletedColors),
        selectables: merged.selectables.filter(
          (selectable) => !deletedColorIds.includes(selectable.colorId)
        ),
      };

      const prevGroups = parseColorGroups(state.formData.classnames).map(
        (group) => JSON.stringify(group)
      );
      const currGroups = parseColorGroups(action.formData.classnames).map(
        (group) => JSON.stringify(group)
      );

      // Add Groups
      const addedGroups: Group[] = currGroups
        .filter((group) => !prevGroups.includes(group))
        .map((serialized) => JSON.parse(serialized));
      merged = {
        ...merged,
        groupMap: addGroupsToGroupMap(merged.groupMap, addedGroups),
      };

      // Delete Groups
      const deletedGroups: Group[] = prevGroups
        .filter((group) => !currGroups.includes(group))
        .map((serialized) => JSON.parse(serialized));
      const deletedGroupNames = deletedGroups.map((group) => group.name);
      const colorIdsForUngrouping = Array.from(
        merged.groupMap,
        ([_key, group]) =>
          deletedGroupNames.includes(group.name) ? group.colorIds : []
      ).flat();
      merged = {
        ...merged,
        groupMap: removeGroupsFromGroupMap(merged.groupMap, deletedGroups),
        selectables: merged.selectables.map((selectable) =>
          colorIdsForUngrouping.includes(selectable.colorId)
            ? ungroup(selectable.colorId)(selectable)
            : selectable
        ),
      };

      // Rewrite Form Data
      merged = {
        ...merged,
        formData: action.formData,
      };

      return merged;
    }
  }
};
