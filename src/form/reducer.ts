import type { FormData } from "./index";

interface FormLoadExample {
  kind: "loadExample";
  classnames: string;
  colors: string;
}

interface FormReset {
  kind: "resetForm";
}

export type FormAction = FormLoadExample | FormReset;

export function formReducer(_form: FormData, action: FormAction): FormData {
  switch (action.kind) {
    case "loadExample":
      return {
        classnames: action.classnames,
        colors: action.colors,
      };
    case "resetForm":
      return { classnames: "", colors: "" };
  }
}
