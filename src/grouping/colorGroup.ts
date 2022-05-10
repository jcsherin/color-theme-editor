export interface ColorGroup {
  name: string;
  colorIds: string[];
}

export type ColorGroupDict = Map<string, ColorGroup>;

export function makeColorGroup(name: string): ColorGroup {
  return { name: name, colorIds: [] };
}

export function parseColorGroup(value: string): ColorGroup | undefined {
  const name = value.trim().replace(/\s+/g, "-");
  if (name.length > 0) {
    return makeColorGroup(name);
  }
}

export function makeColorGroupDict(colorGroups: ColorGroup[]): ColorGroupDict {
  const map = new Map();
  colorGroups.forEach((group) => {
    map.set(group.name, group);
  });
  return map;
}
