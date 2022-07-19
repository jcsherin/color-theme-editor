export interface FormData {
  groupNames: string;
  colors: string;
}

export function initFormData(): FormData {
  return { groupNames: "", colors: "" };
}

export function createFormData(groupNames: string, colors: string): FormData {
  return { groupNames, colors };
}
