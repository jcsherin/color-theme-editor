import type { KeywordSpec } from "./index";
import { keywords, parse } from "./index";

describe("Color Parser", () => {
  it("parses every named color keyword", () => {
    const expected = Object.keys(keywords)
      .map(parse)
      .map((parsed) => JSON.stringify(parsed))
      .join("\n");

    expect(expected).toMatchSnapshot();
  });

  it("parses hexadecimal corresponding to every named color keyword", () => {
    const expected = Object.values(keywords)
      .map((k: KeywordSpec) => k.hex)
      .map(parse)
      .map((parsed) => JSON.stringify(parsed))
      .join("\n");

    expect(expected).toMatchSnapshot();
  });
});
