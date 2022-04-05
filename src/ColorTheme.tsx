export interface ColorThemeInputFormat {
  groupsTextValue: string;
  colorsTextValue: string;
}

export interface ColorTheme {
  groups: Map<string, Set<string>>;
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

export type ColorState = { value: string; selected: boolean };

export function createColorState(color: string): ColorState {
  return { value: color, selected: false };
}
