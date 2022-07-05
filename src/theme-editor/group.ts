import { NamedCSSColor } from "../color";

export interface GroupDictionary {
  [name: string]: string[];
}

export function removeMultiFromGroupDictionary(
  dictionary: GroupDictionary,
  colors: NamedCSSColor[]
): GroupDictionary {
  const removedIds = colors.map((color) => color.id);
  const updated = Object.entries(dictionary).map(
    ([groupName, colorIds]: [string, string[]]): [string, string[]] => [
      groupName,
      colorIds.filter((id) => !removedIds.includes(id)),
    ]
  );
  return Object.fromEntries(updated);
}

export function emptyGroupDictionary(): GroupDictionary {
  return {};
}
