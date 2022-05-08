import React from "react";
import renderer from "react-test-renderer";
import { ClipboardButton } from "./index";

it("renders a button for copying from clipboard", () => {
  const tree = renderer
    .create(
      <ClipboardButton
        label="Copy to clipboard"
        content="copy this text"
        timeoutInMs={2000}
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
