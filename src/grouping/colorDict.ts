import { getColorId, getColorName, HexColor, makeHexColor } from "../hexColor";

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

function parseColor(v: string): HexColor | undefined {
  const hexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  const value = v.trim();
  if (hexColor.test(value)) {
    return makeHexColor(value, value);
  }
}

export function parseColors(colors: string): ColorDict {
  const deduped = new Set(colors.split("\n"));
  const parsed = Array.from(deduped)
    .map(parseColor)
    .flatMap((color) => (color ? [color] : []));
  return makeColorDict(parsed);
}
