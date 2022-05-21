import React from "react";
import App from "./App";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

let sampleFormData = { classnames: "", colors: "" };
const sampleClassnames = ["green", "blue"].join("\n");
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
  it("renders the default state of the first step in the wizard", () => {
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
    expect(
      screen.queryByRole("button", {
        name: "Load Example",
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset All Values" })
    ).toBeInTheDocument();
  });

  it("navigates to the color theme editor", async () => {
    const tree = render(<App sampleFormData={sampleFormData} />);
    const user = userEvent.setup();

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);
    await user.click(nextButton);

    expect(tree.container.firstChild).toMatchSnapshot();
  });

  it("navigate back and forth between the form and theme editor", async () => {
    const { user } = setup(<App sampleFormData={sampleFormData} />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);
    await user.click(nextButton);

    const prevButton = screen.getByRole("button", { name: "Go Back" });
    await user.click(prevButton);

    expect(screen.queryByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset All Values" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/^One name per line$/)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/^One color value per line$/)
    ).toBeInTheDocument();
  });

  it("resets all the form values", async () => {
    const { user } = setup(<App sampleFormData={sampleFormData} />);

    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });
    await user.click(loadExampleButton);

    const resetButton = screen.getByRole("button", {
      name: "Reset All Values",
    });
    await user.click(resetButton);

    const groupNamesInput = screen.getByPlaceholderText(/^One name per line$/);
    const colorValuesInput = screen.getByPlaceholderText(
      /^One color value per line$/
    );
    expect(groupNamesInput).toHaveValue("");
    expect(colorValuesInput).toHaveValue("");
    expect(
      screen.queryByRole("button", {
        name: "Load Example",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset All Values" })
    ).not.toBeInTheDocument();
  });

  it("renders the theme editor", async () => {
    const { user, container } = setup(<App sampleFormData={sampleFormData} />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);
    await user.click(nextButton);

    expect(container).toMatchSnapshot();
  });

  it("use the theme editor to group colors", async () => {
    const { user, container } = setup(<App sampleFormData={sampleFormData} />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);
    await user.click(nextButton);

    const green100 = screen.getByRole("button", { name: "#a5d6a7" });
    const green200 = screen.getByRole("button", { name: "#64ffda" });
    const greenGroup = screen.getByRole("button", { name: "green" });

    await user.click(green100);
    await user.click(green200);
    await user.click(greenGroup);

    const blue100 = screen.getByRole("button", { name: "#90caf9" });
    const blue200 = screen.getByRole("button", { name: "#039be5" });
    const blueGroup = screen.getByRole("button", { name: "blue" });

    await user.click(blue100);
    await user.click(blue200);
    await user.click(blueGroup);

    expect(container).toMatchSnapshot();
  });

  it("click on a color in tree to edit it", async () => {
    const { user } = setup(<App sampleFormData={sampleFormData} />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    const loadExampleButton = screen.getByRole("button", {
      name: "Load Example",
    });

    await user.click(loadExampleButton);
    await user.click(nextButton);

    const green100 = screen.getByRole("button", { name: "#a5d6a7" });
    const green200 = screen.getByRole("button", { name: "#64ffda" });
    const greenGroup = screen.getByRole("button", { name: "green" });

    await user.click(green100);
    await user.click(green200);
    await user.click(greenGroup);

    const blue100 = screen.getByRole("button", { name: "#90caf9" });
    const blue200 = screen.getByRole("button", { name: "#039be5" });
    const blueGroup = screen.getByRole("button", { name: "blue" });

    await user.click(blue100);
    await user.click(blue200);
    await user.click(blueGroup);

    const editGreen200Button = screen.getByRole("button", {
      name: /^"#64ffda" : #64ffda,$/,
    });
    await user.click(editGreen200Button);

    const textInput = screen.getByDisplayValue(/#64ffda/);

    expect(textInput).toBeInTheDocument();
    await waitFor(() => expect(textInput).toHaveFocus(), { timeout: 100 });
  });
});
