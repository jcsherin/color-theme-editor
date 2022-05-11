import {
  ColorGroup,
  SelectableItem,
  notGrouped,
  parseColorGroups,
  makeSelectable,
} from "./grouping";
import {
  compareColorId,
  getColorName,
  getColorValue,
  HexColor,
  parseColors,
} from "./color";
import { UnparsedColorTheme } from "./input";

export interface State {
  colorDict: Map<string, HexColor>;
  colorGroupDict: Map<string, ColorGroup>;
  colorList: SelectableItem[];
}

export function serializeConfig({
  colorDict,
  colorGroupDict,
  colorList,
}: State) {
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

export function parse(unparsedColorTheme: UnparsedColorTheme): State {
  const colorDict = parseColors(unparsedColorTheme.colors);
  const colorGroupDict = parseColorGroups(unparsedColorTheme.classnames);
  const colorList = Array.from(colorDict.keys()).map(makeSelectable);
  return {
    colorDict: colorDict,
    colorGroupDict: colorGroupDict,
    colorList: colorList,
  };
}
