export interface ColorThemeInputFormat {
  groupsTextValue: string;
  colorsTextValue: string;
}

export interface ColorTheme {
  groups: Map<string, Set<Color>>;
  colors: Set<ColorState>;
}

export interface ColorState {
  color: Color;
  selected: boolean;
}

export interface Color {
  name: string;
  value: string;
}

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
      tmp[color.name] = color.value;
    });
    config.theme.colors[group] = tmp;
  });
  theme.colors.forEach((colorState) => {
    config.theme.colors[colorState.color.name] = colorState.color.value;
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
  return { color: { name: color, value: color }, selected: false };
}

export function toColorList(colorTheme: ColorTheme) {
  let grouped: Color[] = [];
  colorTheme.groups.forEach((set) => {
    grouped = [...grouped, ...Array.from(set.values())];
  });
  let ungrouped = Array.from(colorTheme.colors.values()).map((x) => x.color);
  return [...grouped, ...ungrouped];
}

export function isColorThemeEmpty(colorTheme: ColorTheme) {
  return toColorList(colorTheme).length === 0;
}
