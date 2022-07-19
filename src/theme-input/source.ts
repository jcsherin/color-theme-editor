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

export function updateGroupNames(formData: Source, groupNames: string): Source {
  return { ...formData, groupNames };
}

export function updateColors(formData: Source, colors: string): Source {
  return { ...formData, colors };
}

export function isEmptySource(form: Source): boolean {
  return form.groupNames.length === 0 && form.colors.length === 0;
}
