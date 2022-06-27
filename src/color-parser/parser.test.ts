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

    expect(expected).toMatchInlineSnapshot(`
Object {
  "message": "notarealcolorkeyword:  is not a supported color format.
The supported formats are: hex, named  color keywords, rgb(), rgba(), hsl() and hsla().",
  "value": "notarealcolorkeyword",
}
`);
  });

  it("parses hex values of size 8, 6, 4 & 3", () => {
    expect(parse("#4682B4FF")).toMatchInlineSnapshot(`
Object {
  "tag": "hex-color",
  "value": "#4682B4FF",
}
`);
    expect(parse("#4682B4")).toMatchInlineSnapshot(`
Object {
  "tag": "hex-color",
  "value": "#4682B4",
}
`);
    expect(parse("#4682")).toMatchInlineSnapshot(`
Object {
  "tag": "hex-color",
  "value": "#4682",
}
`);
    expect(parse("#468")).toMatchInlineSnapshot(`
Object {
  "tag": "hex-color",
  "value": "#468",
}
`);
  });

  it("returns a parse error for invalid hex values", () => {
    expect(parse("#46")).toMatchInlineSnapshot(`
Object {
  "message": "#46:  is not a supported color format.
The supported formats are: hex, named  color keywords, rgb(), rgba(), hsl() and hsla().",
  "value": "#46",
}
`);
    expect(parse("#4682B4FF00")).toMatchInlineSnapshot(`
Object {
  "message": "#4682B4FF00:  is not a supported color format.
The supported formats are: hex, named  color keywords, rgb(), rgba(), hsl() and hsla().",
  "value": "#4682B4FF00",
}
`);
    expect(parse("#xyz")).toMatchInlineSnapshot(`
Object {
  "message": "#xyz:  is not a supported color format.
The supported formats are: hex, named  color keywords, rgb(), rgba(), hsl() and hsla().",
  "value": "#xyz",
}
`);
  });
});
