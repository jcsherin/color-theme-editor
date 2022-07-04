import { NamedCSSColor } from "../color";

export interface Group {
  name: string;
  colorIds: string[];
}

export type GroupMap = Map<string, Group>;

export function removeColorsFromGroupMap(
  groupMap: GroupMap,
  removedColors: NamedCSSColor[]
): GroupMap {
  const removedColorIds = removedColors.map((color) => color.id);
  const filtered = Array.from(groupMap, ([key, group]): [string, Group] => {
    return [
      key,
      {
        ...group,
        colorIds: group.colorIds.filter(
          (colorId) => !removedColorIds.includes(colorId)
        ),
      },
    ];
  });
  return new Map(filtered);
}

export function makeColorGroup(name: string): Group {
  return { name: name, colorIds: [] };
}

function parseColorGroup(value: string): Group | undefined {
  const name = value.trim().replace(/\s+/g, "-");
  if (name.length > 0) {
    return makeColorGroup(name);
  }
}

export function makeGroupMap(colorGroups: Group[]): GroupMap {
  const map = new Map();
  colorGroups.forEach((group) => {
    map.set(group.name, group);
  });
  return map;
}

export function addGroupsToGroupMap(
  groupMap: GroupMap,
  groups: Group[]
): GroupMap {
  groups.forEach((group) => groupMap.set(group.name, group));
  return new Map(Array.from(groupMap));
}

export function removeGroupsFromGroupMap(
  groupMap: GroupMap,
  groups: Group[]
): GroupMap {
  groups.forEach((group) => groupMap.delete(group.name));
  return new Map(Array.from(groupMap));
}

export function parseColorGroups(groupNames: string): Group[] {
  const deduped = new Set(groupNames.split("\n"));
  return Array.from(deduped, parseColorGroup).flatMap((classname) =>
    classname ? [classname] : []
  );
}
