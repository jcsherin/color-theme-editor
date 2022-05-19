import React from "react";
import App from "./App";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("App", () => {
  it("renders the default state of the first in the wizard", () => {
    const tree = render(<App />);

    const groupNamesInput = screen.getByPlaceholderText(/^One name per line$/);
    const colorValuesInput = screen.getByPlaceholderText(
      /^One color value per line$/
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    expect(tree.container).toMatchSnapshot();

    expect(groupNamesInput).toHaveValue("");
    expect(colorValuesInput).toHaveValue("");

    expect(nextButton).toBeDisabled();
    expect(loadExampleButton).toBeInTheDocument();
  });
});
