import type { ParsedColor } from "./color-parser";
import { stringifyColor } from "./color-parser";

export interface NamedCSSColor extends ParsedColor {
  id: string;
  name?: string;
  cssValue: string;
}

export function createNamedCSSColor(
  color: ParsedColor,
  name?: string
): NamedCSSColor {
  const str = stringifyColor(color.parsed);
  return { id: str, name, cssValue: str, ...color };
}

export function updateNamedCSSColorName(
  color: NamedCSSColor,
  name: string
): NamedCSSColor {
  if (name.trim().length === 0) return color;
  if (name === color.name) return color;
  return { ...color, name };
}

export interface NamedCSSColorDictionary {
  [index: string]: NamedCSSColor;
}

export function createNamedCSSColorDictionary(
  colors: NamedCSSColor[]
): NamedCSSColorDictionary {
  return colors.reduce((dictionary, namedCssColor) => {
    dictionary[namedCssColor.id] = namedCssColor;
    return dictionary;
  }, {} as NamedCSSColorDictionary);
}

export function removeMultiFromDictionary(
  dictionary: NamedCSSColorDictionary,
  colors: NamedCSSColor[]
): NamedCSSColorDictionary {
  colors.forEach((namedCssColor) => delete dictionary[namedCssColor.id]);
  return { ...dictionary };
}

export function addMultiToDictionary(
  dictionary: NamedCSSColorDictionary,
  colors: NamedCSSColor[]
): NamedCSSColorDictionary {
  colors.forEach(
    (namedCssColor) => (dictionary[namedCssColor.id] = namedCssColor)
  );
  return { ...dictionary };
}

export function sortComparator(id1: string, id2: string): 0 | 1 | -1 {
  if (id1 < id2) return -1;
  if (id1 > id2) return 1;
  return 0;
}
