export interface ColorThemeInputFormat {
  groupsTextValue: string;
  colorsTextValue: string;
}

export interface ColorTheme {
  groups: Set<string>;
  colors: Set<ColorState>;
}

export function parseColors(text: string) {
  return text
    .split("\n")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .reduce((acc, current) => [...acc, current], new Array<string>());
}

export function parseGroups(text: string) {
  return text
    .split("\n")
    .map((value) => value.trim().replace(/\s+/, "-"))
    .filter((value) => value.length > 0)
    .reduce((acc, current) => [...acc, current], new Array<string>());
}

type ColorWithoutGroup = { state: "color-without-group"; value: string };
type ColorSelected = { state: "color-selected"; value: string };
type ColorGrouped = { state: "color-grouped"; value: string; group: string };
export type ColorState = ColorWithoutGroup | ColorSelected | ColorGrouped;

export function createColorState(color: string): ColorState {
  return { state: "color-without-group", value: color };
}
