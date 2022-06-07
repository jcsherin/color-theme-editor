export interface FormData {
  classnames: string;
  colors: string;
}

export function initFormData(): FormData {
  return { classnames: "", colors: "" };
}
