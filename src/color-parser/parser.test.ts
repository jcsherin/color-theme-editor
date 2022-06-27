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

  it("parses hex values corresponding to every named color keyword", () => {
    const expected = Object.values(keywords)
      .map((k: KeywordSpec) => k.hex)
      .map(parse)
      .map((parsed) => JSON.stringify(parsed))
      .join("\n");

    expect(expected).toMatchSnapshot();
  });

  it("returns a parser error for non-existent color keywords", () => {
    const expected = parse("notarealcolorkeyword");

    expect(expected).toMatchSnapshot();
  });

  it("parses hex values of size 8, 6, 4 & 3", () => {
    expect(parse("#4682B4FF")).toMatchSnapshot();
    expect(parse("#4682B4")).toMatchSnapshot();
    expect(parse("#4682")).toMatchSnapshot();
    expect(parse("#468")).toMatchSnapshot();
  });

  it("returns a parse error for invalid hex values", () => {
    expect(parse("#46")).toMatchSnapshot();
    expect(parse("#4682B4FF00")).toMatchSnapshot();
    expect(parse("#xyz")).toMatchSnapshot();
  });

  it("parses rgba values", () => {
    expect(parse("rgb(0, 255, 0)")).toMatchSnapshot();
    expect(parse("rgba(0, 255, 0)")).toMatchSnapshot();
    expect(parse("rgb(0%, 100%, 0%)")).toMatchSnapshot();
    expect(parse("rgba(0, 255, 0, 1)")).toMatchSnapshot();
    expect(parse("rgba(0, 255, 0, 100%)")).toMatchSnapshot();
    expect(parse("rgba(0%, 100%, 0%, 1)")).toMatchSnapshot();
    expect(parse("rgba(0%, 100%, 0%, 100%)")).toMatchSnapshot();
    expect(parse("rgb(0%, 100%, 0%, 50%)")).toMatchSnapshot();
    expect(parse("rgba(0, 255, 0, 0.5)")).toMatchSnapshot();
  });
});
