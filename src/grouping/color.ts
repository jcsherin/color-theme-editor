import { getColorId, getColorName, HexColor } from "../hexColor";

export type ColorDict = Map<string, HexColor>;

export function makeColorDict(colors: HexColor[]): ColorDict {
  const map = new Map();
  colors.forEach((color) => {
    const key = getColorId(color);
    map.set(key, color);
  });
  return map;
}

export function compareColorId(colorDict: ColorDict) {
  return (x: string, y: string) => {
    const xname = getColorName(colorDict.get(x)!);
    const yname = getColorName(colorDict.get(y)!);
    if (xname < yname) return -1;
    if (xname > yname) return 1;
    return 0;
  };
}
