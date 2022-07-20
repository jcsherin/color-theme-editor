export interface RawTheme {
  groupNames: string;
  colors: string;
}

export function emptyRawTheme(): RawTheme {
  return { groupNames: "", colors: "" };
}

export function createRawTheme(groupNames: string, colors: string): RawTheme {
  return { groupNames, colors };
}

export function updateGroupNames(
  rawTheme: RawTheme,
  groupNames: string
): RawTheme {
  return { ...rawTheme, groupNames };
}

export function updateColors(rawTheme: RawTheme, colors: string): RawTheme {
  return { ...rawTheme, colors };
}

export function isEmptySource(rawTheme: RawTheme): boolean {
  return rawTheme.groupNames.length === 0 && rawTheme.colors.length === 0;
}
