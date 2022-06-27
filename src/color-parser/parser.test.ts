import { keywords } from "./keywords";
import { parse } from "./parser";

describe("Color Parser", () => {
  it("parses named color keywords", () => {
    const expected = Object.keys(keywords)
      .map(parse)
      .map((parsed) => JSON.stringify(parsed))
      .join("\n");

    expect(expected).toMatchSnapshot();
  });
});
