export interface ColorThemeInputFormat {
  groupsTextValue: string;
  colorsTextValue: string;
}

export interface ColorTheme {
  groups: Set<string>;
  colors: Set<string>;
}

export function parseColors(text: string) {
  return text
    .split("\n")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .reduce((acc, current) => acc.add(current), new Set<string>());
}

export function parseGroups(text: string) {
  return text
    .split("\n")
    .map((value) => value.trim().replace(/\s+/, "-"))
    .filter((value) => value.length > 0)
    .reduce((acc, current) => acc.add(current), new Set<string>());
}
