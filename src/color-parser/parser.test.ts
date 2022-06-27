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

  it("produces a parse error for non-existent color keywords", () => {
    const expected = parse("notarealcolorkeyword");

    expect(expected).toMatchSnapshot();
  });

  it("parses hex values of size 8, 6, 4 & 3", () => {
    expect(parse("#4682B4FF")).toMatchSnapshot();
    expect(parse("#4682B4")).toMatchSnapshot();
    expect(parse("#4682")).toMatchSnapshot();
    expect(parse("#468")).toMatchSnapshot();
  });

  it("produces a parse error for invalid hex values", () => {
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

  it("produces parse errors for missing rgba channel values", () => {
    expect(parse("rgba()")).toMatchSnapshot();
  });

  it("produces parse errors for wrongly typed rgba channel values", () => {
    expect(parse("rgba(0, 255%, 0)")).toMatchSnapshot();
    expect(parse("rgba(0%, 100, 0%)")).toMatchSnapshot();
    expect(parse("rgba(0, 255%, 0, 100%)")).toMatchSnapshot();
    expect(parse("rgba(0%, 100, 0%, 100%)")).toMatchSnapshot();
    expect(parse("rgba(0, 255%, 0, abc)")).toMatchSnapshot();
    expect(parse("rgba(0%, 100, 0%, abc)")).toMatchSnapshot();
  });

  it("produces parse errors for wrongly typed rgba alpha value", () => {
    expect(parse("rgba(0%, 100%, 0%, abc)")).toMatchSnapshot();
    expect(parse("rgba(0%, 100%, 0%, abc)")).toMatchSnapshot();
  });

  it("produces parse errors for rgba with incorrect number of arguments", () => {
    expect(parse("rgba(0%, 100, 0%, 100%, 1)")).toMatchSnapshot();
    expect(parse("rgba(100%, 1)")).toMatchSnapshot();
  });

  it("parses rgba alpha values are clamped between 0 and 1", () => {
    expect(parse("rgba(0, 0, 0, -.1)")).toMatchSnapshot();
    expect(parse("rgba(0, 0, 0, 1.01)")).toMatchSnapshot();
    expect(parse("rgba(0, 0, 0, -0.1%)")).toMatchSnapshot();
    expect(parse("rgba(0, 0, 0, 100.01%)")).toMatchSnapshot();
  });

  it.skip("parsed rgba channel values are clamped between 0 and 255", () => {});

  it("treats rgb & rgba as synonyms", () => {
    const rgb = parse("rgb(0, 255, 0)");
    const rgba = parse("rgba(0, 255, 0)");

    expect(JSON.stringify(rgb)).toBe(JSON.stringify(rgba));
  });
});

/*
__debug("rgb(0, 255, 0)");
__debug("rgb(0%, 100%, 0%)");
__debug("rgba(0, 255, 0)");
__debug("rgba(0%, 100%, 0%)");
__debug("rgba(0, 255, 0, 1)");
__debug("rgba(0, 255, 0, 100%)");
__debug("rgba(0%, 100%, 0%, 1)");
__debug("rgba(0%, 100%, 0%, 100%)");


__debug("rgba()");
__debug("rgba(0, 255%, 0, 100%)");
__debug("rgba(0%, 100, 0%, 100%)");
__debug("rgba(0, 255%, 0, abc)");
__debug("rgba(0%, 100, 0%, abc)");
__debug("rgba(0%, 100%, 0%, abc)");
__debug("rgba(0%, 100%, 0%, abc)");
__debug("rgba(0%, 100, 0%, 100%, 1)");
__debug("rgba(100%, 1)");

*/
