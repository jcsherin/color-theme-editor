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

export function nameComparator(colorDictionary: NamedCSSColorDictionary) {
  const colorNameForComparator = (color: NamedCSSColor): string => {
    return color.name ? color.name : "";
  };

  return function (colorId1: string, colorId2: string): 0 | 1 | -1 {
    const name1 = colorNameForComparator(colorDictionary[colorId1]);
    const name2 = colorNameForComparator(colorDictionary[colorId2]);

    if (name1 < name2) return -1;
    if (name1 > name2) return 1;
    return 0;
  };
}
