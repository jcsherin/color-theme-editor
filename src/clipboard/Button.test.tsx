import React from "react";
import renderer from "react-test-renderer";
import {
  fireEvent,
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
  expiryInMs: 4000,
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

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
    const { user } = setup(
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

  it("the flash message expires and the copy to clipboard button reppears", async () => {
    const { user } = setup(
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

    const flash = await screen.findByText(/^Copied!$/, { exact: true });
    await waitForElementToBeRemoved(flash, { timeout: props.expiryInMs });
    expect(flash).not.toBeInTheDocument();

    const newButton = await screen.findByRole("button", {
      name: props.label,
    });
    expect(newButton).toBeInTheDocument();
  });

  it("copies the content to clipboard when clicked", async () => {
    const { user } = setup(
      <ClipboardButton
        label={props.label}
        content={props.content}
        expiryInMs={props.expiryInMs}
      />
    );

    const spy = jest.spyOn(navigator.clipboard, "writeText");

    const button = screen.getByRole("button", {
      name: props.label,
    });
    user.click(button);
    await waitForElementToBeRemoved(button);

    expect(spy).toHaveBeenCalledWith(props.content);
  });
});
