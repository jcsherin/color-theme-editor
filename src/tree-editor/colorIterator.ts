import type { NamedCSSColor } from "../color";
import { isGrouped, ThemeEditorState } from "../theme-editor";

import { nameComparator } from "../color";

export interface ColorIterator {
  next: (color: NamedCSSColor) => NamedCSSColor;
  prev: (color: NamedCSSColor) => NamedCSSColor;
}

export function createColorIterator(state: ThemeEditorState): ColorIterator {
  const orderedGroupColors = Object.values(state.groupDictionary)
    .map((ids) => ids.slice().sort(nameComparator(state.colorDictionary)))
    .flat()
    .map((id) => state.colorDictionary[id]);
  const orderedUngroupedColors = state.selectables
    .filter((item) => !isGrouped(item))
    .map((item) => item.colorId)
    .sort(nameComparator(state.colorDictionary))
    .map((id) => state.colorDictionary[id]);
  const orderedColors = [...orderedGroupColors, ...orderedUngroupedColors];

  const findIndex = (color: NamedCSSColor) =>
    orderedColors.findIndex((c) => c.id === color.id);

  orderedColors.forEach((color, idx) =>
    console.log(idx, JSON.stringify(color))
  );

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
