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
import { makeGroupMap, removeColorsFromGroupMap } from "./group";

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

      ## Form Data
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

      const addedColors: HexColor[] = currColors
        .filter((color) => !prevColors.includes(color))
        .map((serialized) => JSON.parse(serialized));
      console.log(`added colors: ${JSON.stringify(addedColors, null, 2)}`);
      merged = {
        ...merged,
        colorMap: addColorsToColorMap(merged.colorMap, addedColors),
        selectables: [
          ...merged.selectables,
          ...addedColors.map(getColorId).map(makeSelectable),
        ],
      };

      const deletedColors: HexColor[] = prevColors
        .filter((color) => !currColors.includes(color))
        .map((serialized) => JSON.parse(serialized));
      const deletedColorIds = deletedColors.map(getColorId);
      console.log(`deleted colors: ${JSON.stringify(deletedColors, null, 2)}`);
      merged = {
        ...merged,
        colorMap: removeColorsFromColorMap(merged.colorMap, deletedColors),
        groupMap: removeColorsFromGroupMap(merged.groupMap, deletedColors),
        selectables: merged.selectables.filter(
          (selectable) => !deletedColorIds.includes(selectable.colorId)
        ),
      };

      // ungroup from selectables after removing colors from group map
      merged = {
        ...merged,
        formData: action.formData,
      };
      // get deleted & new colors
      // const prevColors = parseColors(state.formData.colors);
      // const currColors = parseColors(action.formData.colors);

      // Set stores object references, therefore `set.has(item)`
      // always returns `false` if the object is treated as an
      // immutable value. This is what was happening in the code
      // below when computing `deletedColors`.

      // const deletedColors = new Set(
      //   Array.from(prevColors).filter((color) => !currColors.has(color))
      // );
      // console.log(`prev: ${JSON.stringify(Array.from(prevColors), null, 2)}`);
      // console.log(`curr: ${JSON.stringify(Array.from(currColors), null, 2)}`);
      // console.log(
      //   `Deleted colors: ${JSON.stringify(Array.from(deletedColors), null, 2)}`
      // );

      // const existingColors = parseColors(state.formData.colors);
      // const incomingColors = parseColors(action.formData.colors);

      // const removedColors = new Set(
      //   Array.from(existingColors).filter((color) => !incomingColors.has(color))
      // );
      // newState = {
      //   ...newState,
      //   groupMap: removeColorsFromGroupMap(newState.groupMap, removedColors),
      // };
      // newState = {
      //   ...newState,
      //   colorMap: removeColorsFromColorMap(newState.colorMap, removedColors),
      // };

      // const addedColors = new Set(
      //   Array.from(incomingColors).filter((color) => !existingColors.has(color))
      // );
      // newState = {
      //   ...newState,
      //   colorMap: addColorsToColorMap(newState.colorMap, addedColors),
      // };

      // const existingGroups = new Set(Array.from(state.groupMap.values()));
      // console.log(
      //   `Existing Groups: ${JSON.stringify(
      //     Array.from(existingGroups),
      //     null,
      //     2
      //   )}`
      // );
      // const incomingGroups = parseColorGroups(action.formData.classnames);
      // console.log(
      //   `Incoming Groups: ${JSON.stringify(
      //     Array.from(incomingGroups),
      //     null,
      //     2
      //   )}`
      // );

      // const addedGroups = new Set(
      //   Array.from(incomingGroups).filter((group) => !existingGroups.has(group))
      // );
      // console.log(
      //   `Added Groups: ${JSON.stringify(Array.from(addedGroups), null, 2)}`
      // );
      // // newState = {
      // //   ...newState,
      // //   groupMap: addGroupsToGroupMap(newState.groupMap, addedGroups),
      // // };

      // const removedGroups = new Set(
      //   Array.from(existingGroups).filter((group) => !incomingGroups.has(group))
      // );
      // console.log(`Removed Groups: ${JSON.stringify(removedGroups, null, 2)}`);
      // // newState = {
      // //   ...newState,
      // //   groupMap: removeGroupsFromGroupMap(newState.groupMap, removedGroups),
      // // };

      // newState = {
      //   ...newState,
      //   formData: action.formData,
      //   selectables: Array.from(newState.colorMap.keys(), makeSelectable),
      // };

      return merged;
    }
  }
};
