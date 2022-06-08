export interface Group {
  name: string;
  colorIds: string[];
}

export type GroupDict = Map<string, Group>;

export function makeColorGroup(name: string): Group {
  return { name: name, colorIds: [] };
}

function parseColorGroup(value: string): Group | undefined {
  const name = value.trim().replace(/\s+/g, "-");
  if (name.length > 0) {
    return makeColorGroup(name);
  }
}

export function makeGroupMap(colorGroups: Set<Group>): GroupDict {
  const map = new Map();
  colorGroups.forEach((group) => {
    map.set(group.name, group);
  });
  return map;
}

export function parseColorGroups(groupNames: string): Set<Group> {
  const deduped = Array.from(new Set(groupNames.split("\n")));
  const parsed = deduped
    .map(parseColorGroup)
    .flatMap((classname) => (classname ? [classname] : []));
  return new Set(parsed);
}
