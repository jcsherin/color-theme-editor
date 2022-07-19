export interface RawData {
  groupNames: string;
  colors: string;
}

export function emptyRawData(): RawData {
  return { groupNames: "", colors: "" };
}

export function createRawData(groupNames: string, colors: string): RawData {
  return { groupNames, colors };
}

export function updateGroupNames(
  formData: RawData,
  groupNames: string
): RawData {
  return { ...formData, groupNames };
}

export function updateColors(formData: RawData, colors: string): RawData {
  return { ...formData, colors };
}

export function isEmpty(form: RawData): boolean {
  return form.groupNames.length === 0 && form.colors.length === 0;
}
