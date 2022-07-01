import type { ParsedColor } from "./color-parser";
import { stringifyColor } from "./color-parser";

interface NamedCSSColor extends ParsedColor {
  id: string;
  name?: string;
}

function makeNamedCSSColor(color: ParsedColor): NamedCSSColor {
  return { id: stringifyColor(color.parsed), ...color };
}

export interface Deprecated__HexColor {
  kind: "hex";
  name: string;
  hexcode: string;
}

export function makeHexColor(
  name: string,
  value: string
): Deprecated__HexColor {
  return {
    kind: "hex",
    name: name,
    hexcode: value,
  };
}

export function getColorId(color: Deprecated__HexColor) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function getColorValue(color: Deprecated__HexColor) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function getColorName(color: Deprecated__HexColor) {
  switch (color.kind) {
    case "hex":
      return color.name;
  }
}

export function updateColorName(
  color: Deprecated__HexColor,
  name: string
): Deprecated__HexColor {
  return { ...color, name: name };
}

export type ColorMap = Map<string, Deprecated__HexColor>;

export function removeColorsFromColorMap(
  colors: ColorMap,
  deleted: Deprecated__HexColor[]
): ColorMap {
  deleted.map(getColorId).forEach((colorId) => colors.delete(colorId));
  return new Map(Array.from(colors));
}

export function addColorsToColorMap(
  colorMap: ColorMap,
  colors: Deprecated__HexColor[]
): ColorMap {
  colors.forEach((color) => {
    const key = getColorId(color);
    colorMap.set(key, color);
  });
  return new Map(Array.from(colorMap));
}

export function makeColorMap(colors: Deprecated__HexColor[]): ColorMap {
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

function parseColor(v: string): Deprecated__HexColor | undefined {
  const hexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  const value = v.trim();
  if (hexColor.test(value)) {
    return makeHexColor(value, value);
  }
}

export function parseColors(colors: string): Deprecated__HexColor[] {
  const deduped = Array.from(new Set(colors.split("\n")));
  return deduped.map(parseColor).flatMap((color) => (color ? [color] : []));
}
