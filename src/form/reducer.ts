import * as example from "../utils/example";
import type { FormData } from "./FormEntry";

interface FormLoadExample {
  kind: "loadExample";
}

interface FormReset {
  kind: "resetForm";
}

export type FormAction = FormLoadExample | FormReset;

export function formReducer(_form: FormData, action: FormAction): FormData {
  switch (action.kind) {
    case "loadExample":
      return {
        classnames: example.groupNames().join("\n"),
        colors: example.colors().join("\n"),
      };
    case "resetForm":
      return { classnames: "", colors: "" };
  }
}
