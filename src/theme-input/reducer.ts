import type { RawData } from "./index";

interface FormLoadExample {
  kind: "loadExample";
  groupNames: string;
  colors: string;
}

interface FormReset {
  kind: "resetForm";
}

interface FormUpdate {
  kind: "updateForm";
  formData: RawData;
}

export type FormAction = FormLoadExample | FormReset | FormUpdate;

export function formReducer(_form: RawData, action: FormAction): RawData {
  switch (action.kind) {
    case "loadExample":
      return {
        groupNames: action.groupNames,
        colors: action.colors,
      };
    case "resetForm":
      return { groupNames: "", colors: "" };
    case "updateForm":
      return action.formData;
  }
}
