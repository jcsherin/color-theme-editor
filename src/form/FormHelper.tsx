import React from "react";
import { FormData } from "./index";

type FillState = "empty" | "partiallyFilled" | "filled";

function toFillState(form: FormData): FillState {
  if (form.classnames.length === 0 && form.colors.length === 0) return "empty";
  if (form.classnames.length === 0 || form.colors.length === 0)
    return "partiallyFilled";
  return "filled";
}

export function FormHelper({
  formData,
  className,
  handleLoadExample,
  handleResetForm,
}: {
  formData: FormData;
  className?: string;
  handleLoadExample: () => void;
  handleResetForm: () => void;
}) {
  switch (toFillState(formData)) {
    case "empty": {
      return (
        <button
          onClick={(event) => {
            event.preventDefault();
            handleLoadExample();
          }}
          className={`mr-4 ${className}`}
        >
          Load Example
        </button>
      );
    }
    case "partiallyFilled":
    case "filled": {
      return (
        <button
          onClick={(event) => {
            event.preventDefault();
            handleResetForm();
          }}
          className={`text-red-500 hover:text-red-700 mr-4 ${className}`}
        >
          Reset Form
        </button>
      );
    }
  }
}
