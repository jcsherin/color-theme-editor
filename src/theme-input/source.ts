export interface Source {
  groupNames: string;
  colors: string;
}

export function emptySource(): Source {
  return { groupNames: "", colors: "" };
}

export function createSource(groupNames: string, colors: string): Source {
  return { groupNames, colors };
}

export function updateGroupNames(src: Source, groupNames: string): Source {
  return { ...src, groupNames };
}

export function updateColors(src: Source, colors: string): Source {
  return { ...src, colors };
}

export function isEmptySource(src: Source): boolean {
  return src.groupNames.length === 0 && src.colors.length === 0;
}
