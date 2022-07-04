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
import { FormData, initFormData } from "../form";
import {
  addGroupsToGroupMap,
  makeGroupMap,
  removeColorsFromGroupMap,
  removeGroupsFromGroupMap,
} from "./group";
import {
  addMultiToDictionary,
  createNamedCSSColor,
  createNamedCSSColorDictionary,
  NamedCSSColor,
  NamedCSSColorDictionary,
  removeMultiFromDictionary,
  sortComparator,
  updateNamedCSSColorName,
} from "../color";
import { parse as parseColor, ParsedColor } from "../color-parser";

export interface ThemeEditorState {
  formData: FormData;
  colorMap: NamedCSSColorDictionary;
  groupMap: GroupMap;
  selectables: SelectableItem[];
}

type SerializedGroupMap = [string, Group][];
export interface SerializedThemeEditorState {
  formData: FormData;
  colorMap: NamedCSSColorDictionary;
  groupMap: SerializedGroupMap;
  selectables: SelectableItem[];
}

export function initThemeEditorState(): ThemeEditorState {
  return {
    formData: initFormData(),
    colorMap: createNamedCSSColorDictionary([]),
    groupMap: new Map(),
    selectables: [],
  };
}

export function serializeThemeEditorState(
  themeEditor: ThemeEditorState
): SerializedThemeEditorState {
  return {
    formData: themeEditor.formData,
    colorMap: themeEditor.colorMap,
    groupMap: Array.from(themeEditor.groupMap),
    selectables: themeEditor.selectables,
  };
}

export function deserializeThemeEditorState(
  state: SerializedThemeEditorState
): ThemeEditorState {
  return {
    formData: state.formData,
    colorMap: state.colorMap,
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
      .sort(sortComparator)
      .forEach((colorId) => {
        const color = colorMap[colorId];
        if (color) {
          const name = color.name ? color.name : color.cssValue;
          inner[name] = color.cssValue;
        }
      });
    serialized[colorGroup.name] = inner;
  });
  selectables
    .filter(notGrouped)
    .map((item) => item.colorId)
    .sort(sortComparator)
    .forEach((colorId) => {
      const color = colorMap[colorId];
      if (color) {
        const name = color.name ? color.name : color.cssValue;
        serialized[name] = color.cssValue;
      }
    });
  const wrapper = { theme: { colors: serialized } };
  const template = `module.exports = ${JSON.stringify(wrapper, null, 2)}`;
  return template;
}

// FIXME: Handle `ParseError` values
function getParsedColors(formData: FormData): NamedCSSColor[] {
  const parseResult = formData.colors
    .split("\n")
    .map(parseColor) as ParsedColor[];
  const parsedColors = parseResult.map((parsed) => createNamedCSSColor(parsed));
  return parsedColors;
}

export function parse(formData: FormData): ThemeEditorState {
  const parsedColors = getParsedColors(formData).map((parsed) =>
    createNamedCSSColor(parsed)
  );
  const colorMap = createNamedCSSColorDictionary(parsedColors);
  const groupMap = makeGroupMap(parseColorGroups(formData.groupNames));
  const selectables = Array.from(Object.keys(colorMap)).map(makeSelectable);
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
  const colorMap: NamedCSSColorDictionary = state.colorMap;
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
      const color = state.colorMap[action.colorId];
      if (!color) return state;

      const renamed = {
        [action.colorId]: updateNamedCSSColorName(color, action.newName),
      };
      return {
        ...state,
        colorMap: { ...state.colorMap, ...renamed },
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
      if (
        action.formData.groupNames === state.formData.groupNames &&
        action.formData.colors === state.formData.colors
      ) {
        return state;
      }

      let merged = state;
      const prevColors = getParsedColors(state.formData);
      const currColors = getParsedColors(action.formData);

      // Add Colors
      const addedColors = currColors.filter(
        (color) => !prevColors.includes(color)
      );
      merged = {
        ...merged,
        colorMap: addMultiToDictionary(merged.colorMap, addedColors),
        selectables: [
          ...merged.selectables,
          ...addedColors.map((color) => makeSelectable(color.id)),
        ],
      };

      // Delete Colors
      const deletedColors = prevColors.filter(
        (color) => !currColors.includes(color)
      );
      const deletedColorIds = deletedColors.map((color) => color.id);
      merged = {
        ...merged,
        colorMap: removeMultiFromDictionary(merged.colorMap, deletedColors),
        groupMap: removeColorsFromGroupMap(merged.groupMap, deletedColors),
        selectables: merged.selectables.filter(
          (selectable) => !deletedColorIds.includes(selectable.colorId)
        ),
      };

      const prevGroups = parseColorGroups(state.formData.groupNames).map(
        (group) => JSON.stringify(group)
      );
      const currGroups = parseColorGroups(action.formData.groupNames).map(
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
