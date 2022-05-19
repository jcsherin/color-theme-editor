import React from "react";
import App from "./App";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { notGrouped } from "./theme-editor";

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

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

  it("preloads example values into the form", async () => {
    const { user } = setup(<App />);

    const groupNamesInput = screen.getByPlaceholderText(/^One name per line$/);
    const colorValuesInput = screen.getByPlaceholderText(
      /^One color value per line$/
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);

    expect(groupNamesInput).not.toHaveValue("");
    expect(colorValuesInput).not.toHaveValue("");
    expect(nextButton).not.toBeDisabled();
  });
});
