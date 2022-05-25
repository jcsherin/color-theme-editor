import type { FormData } from "./index";

interface FormLoadExample {
  kind: "loadExample";
  classnames: string;
  colors: string;
}

interface FormReset {
  kind: "resetForm";
}

interface FormUpdate {
  kind: "updateForm";
  formData: FormData;
}

export type FormAction = FormLoadExample | FormReset | FormUpdate;

export function formReducer(_form: FormData, action: FormAction): FormData {
  switch (action.kind) {
    case "loadExample":
      return {
        classnames: action.classnames,
        colors: action.colors,
      };
    case "resetForm":
      return { classnames: "", colors: "" };
    case "updateForm":
      return action.formData;
  }
}
