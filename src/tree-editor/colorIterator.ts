import type { NamedCSSColor } from "../color";
import { ThemeEditorState } from "../theme-editor";

import {
  sortGroupColorsByName,
  sortUngroupedColorsByName,
} from "../theme-editor/reducer";

export interface ColorIterator {
  next: (color: NamedCSSColor) => NamedCSSColor;
  prev: (color: NamedCSSColor) => NamedCSSColor;
}

export function createColorIterator(state: ThemeEditorState): ColorIterator {
  const sortedGrouped = sortGroupColorsByName(
    state.colorDictionary,
    state.groupDictionary
  ).flatMap(([_, colors]) => colors);
  const sortedUngrouped = sortUngroupedColorsByName(
    state.colorDictionary,
    state.selectables
  );
  const orderedColors = [...sortedGrouped, ...sortedUngrouped];

  const findIndex = (color: NamedCSSColor) =>
    orderedColors.findIndex((c) => c.id === color.id);

  return {
    next: (color) => {
      const currIdx = findIndex(color);
      const nextIdx =
        (currIdx + 1 + orderedColors.length) % orderedColors.length;

      return orderedColors[nextIdx];
    },
    prev: (color) => {
      const currIdx = findIndex(color);
      const prevIdx =
        (currIdx - 1 + orderedColors.length) % orderedColors.length;

      return orderedColors[prevIdx];
    },
  };
}
