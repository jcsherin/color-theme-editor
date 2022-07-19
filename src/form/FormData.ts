export interface FormData {
  groupNames: string;
  colors: string;
}

export function emptyFormData(): FormData {
  return { groupNames: "", colors: "" };
}

export function createFormData(groupNames: string, colors: string): FormData {
  return { groupNames, colors };
}

export function updateGroupNames(
  formData: FormData,
  groupNames: string
): FormData {
  return { ...formData, groupNames };
}

export function updateColors(formData: FormData, colors: string): FormData {
  return { ...formData, colors };
}

export function isEmpty(form: FormData): boolean {
  return form.groupNames.length === 0 && form.colors.length === 0;
}
