export interface ColorThemeInputFormat {
  groupsTextValue: string;
  colorsTextValue: string;
}

export interface ColorTheme {
  groups: Map<string, Set<string>>;
  colors: Set<ColorState>;
}

export type ColorState = { value: string; selected: boolean };

interface TailwindColorMap {
  [key: string]: string;
}

interface TailwindConfig {
  theme: {
    colors: {
      [key: string]: string | TailwindColorMap;
    };
  };
}

function createEmptyTailwindConfig(): TailwindConfig {
  return { theme: { colors: {} } };
}

export function tailwindJSON(theme: ColorTheme) {
  const config = createEmptyTailwindConfig();
  theme.groups.forEach((colors, group) => {
    const tmp: TailwindColorMap = {};
    colors.forEach((color) => {
      tmp[color] = color;
    });
    config.theme.colors[group] = tmp;
  });
  theme.colors.forEach((colorState) => {
    config.theme.colors[colorState.value] = colorState.value;
  });
  return JSON.stringify(config, null, 2);
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

export function createColorState(color: string): ColorState {
  return { value: color, selected: false };
}
