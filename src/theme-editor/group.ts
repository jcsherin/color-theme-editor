import { getColorId, HexColor } from "../color";

export interface Group {
  name: string;
  colorIds: string[];
}

export type GroupMap = Map<string, Group>;

export function removeColorsFromGroupMap(
  groupMap: GroupMap,
  removedColors: Set<HexColor>
): GroupMap {
  const removedColorIds = new Set(Array.from(removedColors, getColorId));
  return new Map(
    Array.from(groupMap, ([key, group]) => [
      key,
      {
        ...group,
        colorIds: group.colorIds.filter((id) => !removedColorIds.has(id)),
      },
    ])
  );
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

export function makeGroupMap(colorGroups: Set<Group>): GroupMap {
  const map = new Map();
  colorGroups.forEach((group) => {
    map.set(group.name, group);
  });
  return map;
}

export function addGroupsToGroupMap(
  groupMap: GroupMap,
  groups: Set<Group>
): GroupMap {
  groups.forEach((group) => groupMap.set(group.name, group));
  return new Map(Array.from(groupMap));
}

export function removeGroupsFromGroupMap(
  groupMap: GroupMap,
  groups: Set<Group>
): GroupMap {
  groups.forEach((group) => groupMap.delete(group.name));
  return new Map(Array.from(groupMap));
}

export function parseColorGroups(groupNames: string): Set<Group> {
  const deduped = Array.from(new Set(groupNames.split("\n")));
  const parsed = deduped
    .map(parseColorGroup)
    .flatMap((classname) => (classname ? [classname] : []));
  return new Set(parsed);
}
