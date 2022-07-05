import type { GroupDictionary, SelectableItem } from "./index";
import type { FormData } from "../form";
import type { NamedCSSColor, NamedCSSColorDictionary } from "../color";
import type { ParsedColor } from "../color-parser";

import {
  notGrouped,
  makeSelectable,
  toggleStatus,
  ungroup,
  groupSelected,
  isSelected,
} from "./index";
import { initFormData } from "../form";
import {
  createNamedCSSColor,
  createNamedCSSColorDictionary,
  updateNamedCSSColorName,
} from "../color";
import { parse as parseColor } from "../color-parser";
import { emptyGroupDictionary } from "./group";

export interface ThemeEditorState {
  formData: FormData;
  colorDictionary: NamedCSSColorDictionary;
  groupDictionary: GroupDictionary;
  selectables: SelectableItem[];
}

export function initThemeEditorState(): ThemeEditorState {
  return {
    formData: initFormData(),
    colorDictionary: createNamedCSSColorDictionary([]),
    groupDictionary: emptyGroupDictionary(),
    selectables: [],
  };
}

export function serializeForTailwind({
  colorDictionary,
  groupDictionary,
  selectables,
}: ThemeEditorState) {
  //  { [groupName: string]: { [colorName: string]: string } }
  const groupedColors: {
    [groupName: string]: { [colorName: string]: string };
  } = Object.entries(groupDictionary)
    .map(([groupName, colorIds]): [string, NamedCSSColor[]] => [
      groupName,
      colorIds.map((id) => colorDictionary[id]),
    ])
    .reduce((outer, [groupName, colors]) => {
      return {
        ...outer,
        [groupName]: colors.reduce((acc, color) => {
          return { ...acc, [color.name || color.cssValue]: color.cssValue };
        }, {}),
      };
    }, {});

  const ungroupedColors: { [colorName: string]: string } = selectables
    .filter(notGrouped)
    .map((selectable) => selectable.colorId)
    .map((id) => colorDictionary[id])
    .reduce((acc, color) => {
      return { ...acc, [color.name || color.cssValue]: color.cssValue };
    }, {});

  const serialized = { ...groupedColors, ...ungroupedColors };
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

function getParsedGroupNames(formData: FormData): string[] {
  return formData.groupNames
    .split("\n")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => value.replace(/\s+/g, "-"));
}

export function parse(formData: FormData): ThemeEditorState {
  const parsedColors = getParsedColors(formData).map((parsed) =>
    createNamedCSSColor(parsed)
  );
  const colorMap = createNamedCSSColorDictionary(parsedColors);
  const groupMap = getParsedGroupNames(formData).reduce((acc, groupName) => {
    return { ...acc, [groupName]: [] };
  }, emptyGroupDictionary());
  const selectables = Array.from(Object.keys(colorMap)).map(makeSelectable);
  return {
    formData,
    colorDictionary: colorMap,
    groupDictionary: groupMap,
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
      colorDictionary: {},
      groupDictionary: {},
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
  const colorDictionary: NamedCSSColorDictionary = state.colorDictionary;
  const groupDictionary: GroupDictionary = state.groupDictionary;
  const selectables: SelectableItem[] = state.slectables;
  return {
    formData,
    colorDictionary,
    groupDictionary,
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
      const groupedColorIds = state.groupDictionary[action.groupName];
      const selectedColorIds = state.selectables
        .filter(isSelected)
        .map((item) => item.colorId);
      const dedupedColorIds: string[] = Array.from(
        new Set(groupedColorIds.concat(selectedColorIds))
      );

      return {
        ...state,
        groupDictionary: {
          ...state.groupDictionary,
          [action.groupName]: dedupedColorIds,
        },
        selectables: groupSelected(state.selectables),
      };
    }

    case "removeFromGroup": {
      return {
        ...state,
        groupDictionary: {
          ...state.groupDictionary,
          [action.groupName]: state.groupDictionary[action.groupName].filter(
            (id) => id !== action.colorId
          ),
        },
        selectables: state.selectables.map(ungroup(action.colorId)),
      };
    }

    case "renameColor": {
      const color = state.colorDictionary[action.colorId];
      if (!color) return state;

      const renamed = {
        [action.colorId]: updateNamedCSSColorName(color, action.newName),
      };
      return {
        ...state,
        colorDictionary: { ...state.colorDictionary, ...renamed },
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

    case "mergeState": {
      return state;
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
    // case "mergeState": {
    // FIXME: Rewrite merge using a simpler reconciliation algorithm
    // return state;
    // if (
    //   action.formData.groupNames === state.formData.groupNames &&
    //   action.formData.colors === state.formData.colors
    // ) {
    //   return state;
    // }

    // let merged = state;
    // const prevColors = getParsedColors(state.formData);
    // const currColors = getParsedColors(action.formData);

    // // Add Colors
    // const addedColors = currColors.filter(
    //   (color) => !prevColors.includes(color)
    // );
    // merged = {
    //   ...merged,
    //   colorMap: addMultiToDictionary(merged.colorMap, addedColors),
    //   selectables: [
    //     ...merged.selectables,
    //     ...addedColors.map((color) => makeSelectable(color.id)),
    //   ],
    // };

    // // Delete Colors
    // const deletedColors = prevColors.filter(
    //   (color) => !currColors.includes(color)
    // );
    // const deletedColorIds = deletedColors.map((color) => color.id);
    // merged = {
    //   ...merged,
    //   colorMap: removeMultiFromDictionary(merged.colorMap, deletedColors),
    //   groupMap: removeColorsFromGroupMap(merged.groupMap, deletedColors),
    //   selectables: merged.selectables.filter(
    //     (selectable) => !deletedColorIds.includes(selectable.colorId)
    //   ),
    // };

    // const prevGroups = parseColorGroups(state.formData.groupNames).map(
    //   (group) => JSON.stringify(group)
    // );
    // const currGroups = parseColorGroups(action.formData.groupNames).map(
    //   (group) => JSON.stringify(group)
    // );

    // // Add Groups
    // const addedGroups: Group[] = currGroups
    //   .filter((group) => !prevGroups.includes(group))
    //   .map((serialized) => JSON.parse(serialized));
    // merged = {
    //   ...merged,
    //   groupMap: addGroupsToGroupMap(merged.groupMap, addedGroups),
    // };

    // // Delete Groups
    // const deletedGroups: Group[] = prevGroups
    //   .filter((group) => !currGroups.includes(group))
    //   .map((serialized) => JSON.parse(serialized));
    // const deletedGroupNames = deletedGroups.map((group) => group.name);
    // const colorIdsForUngrouping = Array.from(
    //   merged.groupMap,
    //   ([_key, group]) =>
    //     deletedGroupNames.includes(group.name) ? group.colorIds : []
    // ).flat();
    // merged = {
    //   ...merged,
    //   groupMap: removeGroupsFromGroupMap(merged.groupMap, deletedGroups),
    //   selectables: merged.selectables.map((selectable) =>
    //     colorIdsForUngrouping.includes(selectable.colorId)
    //       ? ungroup(selectable.colorId)(selectable)
    //       : selectable
    //   ),
    // };

    // // Rewrite Form Data
    // merged = {
    //   ...merged,
    //   formData: action.formData,
    // };

    // return merged;
    // }
  }
};
