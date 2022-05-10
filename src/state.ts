import {
  ColorGroup,
  ColorListItem,
  compareColorId,
  notGrouped,
} from "./grouping";
import { getColorName, getColorValue, HexColor } from "./hexColor";

export interface State {
  colorDict: Map<string, HexColor>;
  colorGroupDict: Map<string, ColorGroup>;
  colorList: ColorListItem[];
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
