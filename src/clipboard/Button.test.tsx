import React from "react";
import renderer from "react-test-renderer";
import { render, screen } from "@testing-library/react";
import { ClipboardButton } from "./index";

describe("ClipboardButton component", () => {
  it("renders a button for copying content to clipboard", () => {
    let tree = renderer
      .create(
        <ClipboardButton
          label="Copy to clipboard"
          content="copy this text"
          expiryInMs={2000}
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

  it.skip("renders component", () => {
    render(
      <ClipboardButton
        label="Copy to clipboard"
        content="copy this text"
        expiryInMs={2000}
      />
    );

    screen.debug();
  });
});
