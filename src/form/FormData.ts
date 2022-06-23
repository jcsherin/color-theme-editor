export interface FormData {
  groupNames: string;
  colors: string;
}

export function initFormData(): FormData {
  return { groupNames: "", colors: "" };
}
