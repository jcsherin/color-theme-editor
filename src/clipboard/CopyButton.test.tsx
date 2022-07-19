import React from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./index";

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
    const { container } = setup(
      <CopyButton
        label={props.label}
        content={props.content}
        expiryInMs={props.expiryInMs}
      />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  <button>
    Copy to clipboard
  </button>
</div>
`);
  });

  it("when the user clicks the button a flash message replaces it", async () => {
    const { user } = setup(
      <CopyButton
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
      await screen.findByText(/^Copied to clipboard!$/, { exact: true })
    ).toBeInTheDocument();
  });

  it("the flash message expires and the copy to clipboard button reppears", async () => {
    const { user } = setup(
      <CopyButton
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

    const flash = await screen.findByText(/^Copied to clipboard!$/, {
      exact: true,
    });
    await waitForElementToBeRemoved(flash, { timeout: props.expiryInMs });
    const newButton = await screen.findByRole("button", {
      name: props.label,
    });

    expect(flash).not.toBeInTheDocument();
    expect(newButton).toBeInTheDocument();
  });

  it("copies the content to clipboard when clicked", async () => {
    const { user } = setup(
      <CopyButton
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

  it("warn when the browser lacks Clipboard API support", () => {
    Object.defineProperty(window.navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    render(
      <CopyButton
        label={props.label}
        content={props.content}
        expiryInMs={props.expiryInMs}
      />
    );

    const button = screen.queryByRole("button", {
      name: props.label,
    });
    const warn = screen.getByText(
      /^Copying to clipboard is not supported in this browser!$/
    );

    expect(button).toBeNull();
    expect(warn).toMatchInlineSnapshot(`
<span
  class="py-1 px-4 text-xl text-red-600"
>
  Copying to clipboard is not supported in this browser!
</span>
`);
  });
});
