export interface HexColor {
  kind: "hex";
  name: string;
  hexcode: string;
}

export function makeHexColor(name: string, value: string): HexColor {
  return {
    kind: "hex",
    name: name,
    hexcode: value,
  };
}

export function getColorId(color: HexColor) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function getColorValue(color: HexColor) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function getColorName(color: HexColor) {
  switch (color.kind) {
    case "hex":
      return color.name;
  }
}

export function updateColorName(color: HexColor, name: string): HexColor {
  return { ...color, name: name };
}

export type ColorMap = Map<string, HexColor>;

export function removeColorsFromColorMap(
  colorMap: ColorMap,
  removedColors: Set<HexColor>
): ColorMap {
  Array.from(removedColors, getColorId).forEach((colorId) =>
    colorMap.delete(colorId)
  );
  return new Map(Array.from(colorMap));
}

export function addColorsToColorMap(
  colorMap: ColorMap,
  colors: Set<HexColor>
): ColorMap {
  colors.forEach((color) => {
    const key = getColorId(color);
    colorMap.set(key, color);
  });
  return new Map(Array.from(colorMap));
}

export function makeColorMap(colors: Set<HexColor>): ColorMap {
  const map = new Map();
  colors.forEach((color) => {
    const key = getColorId(color);
    map.set(key, color);
  });
  return map;
}

export function colorComparator(map: ColorMap) {
  return (x: string, y: string) => {
    const xname = getColorName(map.get(x)!);
    const yname = getColorName(map.get(y)!);
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

export function parseColors(colors: string): Set<HexColor> {
  const deduped = Array.from(new Set(colors.split("\n")));
  const parsed = deduped
    .map(parseColor)
    .flatMap((color) => (color ? [color] : []));
  return new Set(parsed);
}
