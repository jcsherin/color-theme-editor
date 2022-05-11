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
      classnames: "primary\nsecondary\n",
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
});
