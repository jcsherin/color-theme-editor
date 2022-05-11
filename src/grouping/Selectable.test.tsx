import React from "react";
import renderer from "react-test-renderer";

import { getColorId, makeHexColor } from "../color";
import { Selectable } from "./Selectable";
import { groupSelected, makeSelectable, toggleStatus } from "./selectableItem";

describe("Selectable component", () => {
  it("renders the `default` state", () => {
    const red = makeHexColor("red", "#f44336");
    const defaultItem = makeSelectable(getColorId(red));

    const tree = renderer.create(
      <Selectable
        className="mr-1 mb-1 p-1"
        color={red}
        selectableItem={defaultItem}
        handleSelection={(_selectableItem) => {}}
      />
    );

    expect(tree).toMatchInlineSnapshot(`
<button
  className="mr-1 mb-1 p-1 border-4 border-white"
  onClick={[Function]}
>
  <span
    className="w-16 h-12 block border-b"
    style={
      Object {
        "backgroundColor": "#f44336",
      }
    }
  />
  <span
    className="block text-xs text-center truncate bg-black text-white"
  >
    #f44336
  </span>
</button>
`);
  });

  it("renders the `selected` state", () => {
    const red = makeHexColor("red", "#f44336");
    const defaultItem = makeSelectable(getColorId(red));
    const toggleFn = toggleStatus(defaultItem.colorId);
    const selectedItem = toggleFn(defaultItem);

    const tree = renderer.create(
      <Selectable
        className="mr-1 mb-1 p-1"
        color={red}
        selectableItem={selectedItem}
        handleSelection={(_selectableItem) => {}}
      />
    );

    expect(tree).toMatchInlineSnapshot(`
<button
  className="mr-1 mb-1 p-1 border-4 border-indigo-500"
  onClick={[Function]}
>
  <span
    className="w-16 h-12 block border-b"
    style={
      Object {
        "backgroundColor": "#f44336",
      }
    }
  />
  <span
    className="block text-xs text-center truncate bg-black text-white"
  >
    #f44336
  </span>
</button>
`);
  });

  it("renders the `grouped` state", () => {
    const red = makeHexColor("red", "#f44336");
    const defaultItem = makeSelectable(getColorId(red));
    const toggleFn = toggleStatus(defaultItem.colorId);
    const selectedItem = toggleFn(defaultItem);
    const groupedItem = groupSelected([selectedItem])[0];

    const tree = renderer.create(
      <Selectable
        className="mr-1 mb-1 p-1"
        color={red}
        selectableItem={groupedItem}
        handleSelection={(_selectableItem) => {}}
      />
    );

    expect(tree).toMatchInlineSnapshot(`
<button
  className="mr-1 mb-1 p-1 hidden"
  onClick={[Function]}
>
  <span
    className="w-16 h-12 block border-b"
    style={
      Object {
        "backgroundColor": "#f44336",
      }
    }
  />
  <span
    className="block text-xs text-center truncate bg-black text-white"
  >
    #f44336
  </span>
</button>
`);
  });
});
