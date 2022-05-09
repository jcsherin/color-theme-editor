import React from "react";
import renderer from "react-test-renderer";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { ClipboardButton } from "./index";

const props = {
  label: "Copy to clipboard",
  content: "Copy this text",
  expiryInMs: 2000,
};

describe("ClipboardButton component", () => {
  it("renders a button for copying content to clipboard", () => {
    let tree = renderer
      .create(
        <ClipboardButton
          label={props.label}
          content={props.content}
          expiryInMs={props.expiryInMs}
        />
      )
      .toJSON();

    expect(tree).toMatchInlineSnapshot(`
<button
  onClick={[Function]}
>
  Copy to clipboard
</button>
`);
  });

  it("when the user clicks the button a flash message replaces it", async () => {
    const user = userEvent.setup();
    render(
      <ClipboardButton
        label={props.label}
        content={props.content}
        expiryInMs={props.expiryInMs}
      />
    );

    const button = screen.getByRole("button", {
      name: props.label,
    });
    user.click(button);
    await waitForElementToBeRemoved(button);

    expect(button).not.toBeInTheDocument();
    expect(
      await screen.findByText(/^Copied!$/, { exact: true })
    ).toBeInTheDocument();
  });
});
