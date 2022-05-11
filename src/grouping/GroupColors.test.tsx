import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { parse } from "../state";
import { testColors } from "../utils/example";
import { GroupColors } from "./GroupColors";

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

describe("Component for adding selected colors to a group", () => {
  it("renders a list of selectable colors and buttons with group names", () => {
    const state = parse({
      classnames: ["primary", "secondary"].join("\n"),
      colors: testColors(6).join("\n"),
    });

    const tree = render(
      <GroupColors
        state={state}
        handleSelection={(_) => {}}
        handleAddToGroup={(_) => {}}
      />
    );

    expect(tree.container.firstChild).toMatchSnapshot();
  });

  it("adding colors to any group is disabled when no colors are selected", async () => {
    const groupNames = ["primary", "secondary"];
    const state = parse({
      classnames: groupNames.join("\n"),
      colors: testColors(6).join("\n"),
    });

    const { user } = setup(
      <GroupColors
        state={state}
        handleSelection={(_) => {}}
        handleAddToGroup={(_) => {}}
      />
    );

    const primary = screen.getByRole("button", { name: "primary" });
    const mockPrimaryOnClick = jest.fn();
    primary.addEventListener("click", mockPrimaryOnClick);

    const secondary = screen.getByRole("button", { name: "secondary" });
    const mockSecondaryOnClick = jest.fn();
    secondary.addEventListener("click", mockSecondaryOnClick);

    await user.click(primary);
    expect(mockPrimaryOnClick).not.toBeCalled();

    await user.click(secondary);
    expect(mockPrimaryOnClick).not.toBeCalled();
  });
});
