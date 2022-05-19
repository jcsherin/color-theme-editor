import React from "react";
import App from "./App";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

let sampleFormData = { classnames: "", colors: "" };
const sampleClassnames = ["green", "secondary"].join("\n");
const sampleColors = [
  "#00695c",
  "#388e3c",
  "#64ffda",
  "#a5d6a7",
  "#039be5",
  "#1e88e5",
  "#536dfe",
  "#90caf9",
].join("\n");

beforeEach(() => {
  sampleFormData = {
    classnames: sampleClassnames,
    colors: sampleColors,
  };
});

afterEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the default state of the first in the wizard", () => {
    const tree = render(<App sampleFormData={sampleFormData} />);

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
    const { user } = setup(<App sampleFormData={sampleFormData} />);

    const groupNamesInput = screen.getByPlaceholderText(/^One name per line$/);
    const colorValuesInput = screen.getByPlaceholderText(
      /^One color value per line$/
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);

    expect(groupNamesInput).toHaveValue(sampleClassnames);
    expect(colorValuesInput).toHaveValue(sampleColors);
    expect(nextButton).not.toBeDisabled();
  });
});
