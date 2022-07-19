import { GroupDictionary, isGrouped, SelectableItem } from "./index";
import type { RawData } from "../form";
import {
  nameComparator,
  NamedCSSColor,
  NamedCSSColorDictionary,
} from "../color";

import {
  makeSelectable,
  toggleStatus,
  ungroup,
  groupSelected,
  isSelected,
} from "./index";
import { emptyRawData } from "../form";
import {
  createNamedCSSColor,
  createNamedCSSColorDictionary,
  updateNamedCSSColorName,
} from "../color";
import { parseColor, isParseError, ParsedColor } from "../parse-color";
import { emptyGroupDictionary } from "./group";

export interface ThemeEditorState {
  formData: RawData;
  colorDictionary: NamedCSSColorDictionary;
  groupDictionary: GroupDictionary;
  selectables: SelectableItem[];
}

export function initThemeEditorState(): ThemeEditorState {
  return {
    formData: emptyRawData(),
    colorDictionary: createNamedCSSColorDictionary([]),
    groupDictionary: emptyGroupDictionary(),
    selectables: [],
  };
}

function sortColorIdsByName(colorDictionary: NamedCSSColorDictionary) {
  return ([groupName, colorIds]: [string, string[]]): [string, string[]] => [
    groupName,
    colorIds.sort(nameComparator(colorDictionary)),
  ];
}

function getColorFromId(colorDictionary: NamedCSSColorDictionary) {
  return ([groupName, colorIds]: [string, string[]]): [
    string,
    NamedCSSColor[]
  ] => [
    groupName,
    colorIds.flatMap((id) =>
      colorDictionary[id] ? [colorDictionary[id]] : []
    ),
  ];
}

export function sortGroupColorsByName(
  colorDictionary: NamedCSSColorDictionary,
  groupDictionary: GroupDictionary
): [groupName: string, colors: NamedCSSColor[]][] {
  return Object.entries(groupDictionary)
    .map(sortColorIdsByName(colorDictionary))
    .map(getColorFromId(colorDictionary));
}

export function sortUngroupedColorsByName(
  colorDictionary: NamedCSSColorDictionary,
  selectables: SelectableItem[]
): NamedCSSColor[] {
  return selectables
    .filter((item) => !isGrouped(item))
    .map((item) => item.colorId)
    .sort(nameComparator(colorDictionary))
    .flatMap((colorId) =>
      colorDictionary[colorId] ? [colorDictionary[colorId]] : []
    );
}

type SerializedColors = {
  [colorName: string]: [colorCssValue: string];
};
type SerializedGroupDictionary = {
  [groupName: string]: SerializedColors;
};

function serializeColors(colors: NamedCSSColor[]): SerializedColors {
  return colors.reduce((acc, color) => {
    return { ...acc, [color.name || color.cssValue]: color.cssValue };
  }, {});
}

function serializeGroup(
  groupName: string,
  colors: NamedCSSColor[]
): SerializedGroupDictionary {
  return {
    [groupName]: serializeColors(colors),
  };
}

export function exportAsTailwind({
  colorDictionary,
  groupDictionary,
  selectables,
}: ThemeEditorState) {
  const sortedGrouped = sortGroupColorsByName(colorDictionary, groupDictionary);
  const serializeGroups: SerializedGroupDictionary = sortedGrouped.reduce(
    (acc, [groupName, colors]) => {
      const serialized = serializeGroup(groupName, colors);
      return { ...acc, ...serialized };
    },
    {}
  );

  const sortedUngrouped = sortUngroupedColorsByName(
    colorDictionary,
    selectables
  );
  const serializedUngrouped: SerializedColors =
    serializeColors(sortedUngrouped);

  const serialized = {
    theme: { colors: { ...serializeGroups, ...serializedUngrouped } },
  };
  const template = `module.exports = ${JSON.stringify(serialized, null, 2)}`;
  return template;
}

// FIXME: Handle `ParseError` values
function getParsedColors(formData: RawData): NamedCSSColor[] {
  const result = formData.colors
    .split("\n")
    .map(parseColor)
    .filter((parsed) => !isParseError(parsed)) as ParsedColor[];

  return result.map((parsed) => createNamedCSSColor(parsed));
}

function getParsedGroupNames(formData: RawData): string[] {
  return formData.groupNames
    .split("\n")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => value.replace(/\s+/g, "-"));
}

export function parse(formData: RawData): ThemeEditorState {
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
  form: RawData;
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
  formData: RawData;
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
  const formData: RawData = state.formData;
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
      const colorDictionary = createNamedCSSColorDictionary(
        getParsedColors(action.formData).map((parsedColor) =>
          state.colorDictionary[parsedColor.id]
            ? state.colorDictionary[parsedColor.id]
            : parsedColor
        )
      );

      const tmpGroupDictionary = getParsedGroupNames(action.formData).reduce(
        (acc, groupName) => {
          return { ...acc, [groupName]: [] };
        },
        emptyGroupDictionary()
      );
      const groupDictionary = Object.keys(state.groupDictionary).reduce(
        (acc, groupName) => {
          if (!acc[groupName]) return acc;

          const diff = new Set([
            ...Object.keys(colorDictionary).filter((id) =>
              state.groupDictionary[groupName].includes(id)
            ),
          ]);
          return { ...acc, [groupName]: Array.from(diff) };
        },
        tmpGroupDictionary
      );

      const grouped = Object.values(groupDictionary).flat();
      const selectables = Object.keys(colorDictionary)
        .map(makeSelectable)
        .map((selectableItem) =>
          grouped.includes(selectableItem.colorId)
            ? ({ ...selectableItem, status: "grouped" } as SelectableItem)
            : selectableItem
        );

      return {
        colorDictionary,
        groupDictionary,
        selectables,
        formData: action.formData,
      };
    }
  }
};
