import type { KeywordSpec } from "./keywords";
import type { ParsedColor } from "./index";

import { keywords } from "./keywords";
import { parse } from "./index";

describe("Color Parser", () => {
  describe("Named color keywords", () => {
    it("parses every named color keyword", () => {
      const expected = Object.keys(keywords)
        .map(parse)
        .map((parsed) => JSON.stringify(parsed))
        .join("\n");

      expect(expected).toMatchSnapshot();
    });

    it("produces a parse error for non-existent color keywords", () => {
      const expected = parse("notarealcolorkeyword");

      expect(expected).toMatchSnapshot();
    });
  });

  describe("Hex colors", () => {
    it("parses hex values corresponding to every named color keyword", () => {
      const expected = Object.values(keywords)
        .map((k: KeywordSpec) => k.hex)
        .map(parse)
        .map((parsed) => JSON.stringify(parsed))
        .join("\n");

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
  });

  describe("RGBA", () => {
    it("parses rgba values without an alpha value", () => {
      expect(parse("rgb(0, 255, 0)")).toMatchSnapshot();
      expect(parse("rgba(0, 255, 0)")).toMatchSnapshot();
      expect(parse("rgb(0%, 100%, 0%)")).toMatchSnapshot();
      expect(parse("rgba(0%, 100%, 0%)")).toMatchSnapshot();
    });

    it("parses rgba values with an alpha value", () => {
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

    it("parsed rgba channel values are clamped between 0 and 255", () => {
      expect(parse("rgb(-.1, -.1, -.1)")).toMatchSnapshot();
      expect(parse("rgb(255.01, 255.01, 255.01)")).toMatchSnapshot();
      expect(parse("rgb(-.1%, -.1%, -.1%)")).toMatchSnapshot();
      expect(parse("rgb(100.1%, 100.1%, 100.1%)")).toMatchSnapshot();
    });

    it("treats rgb & rgba as synonyms", () => {
      const rgb = parse("rgb(0, 255, 0)") as ParsedColor;
      const rgba = parse("rgba(0, 255, 0)") as ParsedColor;

      expect(JSON.stringify(rgb.parsed)).toBe(JSON.stringify(rgba.parsed));
    });
  });

  describe("HSLA", () => {
    it("parses hsla values without an alpha value", () => {
      expect(parse("hsl(0, 0%, 100%)")).toMatchSnapshot();
      expect(parse("hsl(90, 0%, 100%)")).toMatchSnapshot();
      expect(parse("hsla(0, 0%, 100%)")).toMatchSnapshot();
      expect(parse("hsla(90, 0%, 100%)")).toMatchSnapshot();
    });

    it("parses hsla values without an alpha value", () => {
      expect(parse("hsla(0, 0%, 100%, 1)")).toMatchSnapshot();
      expect(parse("hsla(90, 0%, 100%, 1)")).toMatchSnapshot();
      expect(parse("hsla(0, 0%, 100%, 100%)")).toMatchSnapshot();
      expect(parse("hsla(90, 0%, 100%, 100%)")).toMatchSnapshot();
      expect(parse("hsla(90, 0%, 100%, 0.5)")).toMatchSnapshot();
      expect(parse("hsla(90, 0%, 100%, 50%)")).toMatchSnapshot();
    });

    it("produces parse errors for missing hue, saturation & ligthness values", () => {
      expect(parse("hsla()")).toMatchSnapshot();
    });

    it("produces parse errors when hue value is not a number", () => {
      expect(parse("hsla(0%, 0%, 100%, 100%)")).toMatchSnapshot();
    });

    it("produces parse errors when saturation is not a percentage", () => {
      expect(parse("hsla(90, 0, 100%, 100%)")).toMatchSnapshot();
    });

    it("produces parse errors when lightness is not a percentage", () => {
      expect(parse("hsla(90, 0%, 100, 100%)")).toMatchSnapshot();
    });

    it("produces parse errors when alpha is neither a number nor percentage", () => {
      expect(parse("hsla(90, 0%, 100%, hex)")).toMatchSnapshot();
    });

    it("clamps saturation between 0% and 100%", () => {
      expect(parse("hsla(90, -.1%, 100%, 100%)")).toMatchSnapshot();
      expect(parse("hsla(90, 100.1%, 100%, 100%)")).toMatchSnapshot();
    });

    it("clamps lightness between 0% and 100%", () => {
      expect(parse("hsla(90, 100%, -.1%, 100%)")).toMatchSnapshot();
      expect(parse("hsla(90, 100%, 100.1%, 100%)")).toMatchSnapshot();
    });

    it("clamps alpha values between either 0 and 1 or 0% and 100%", () => {
      expect(parse("hsla(90, 100%, 0%, -.1%)")).toMatchSnapshot();
      expect(parse("hsla(90, 100%, 0%, 100.1%)")).toMatchSnapshot();
      expect(parse("hsla(90, 100%, 0%, -.1)")).toMatchSnapshot();
      expect(parse("hsla(90, 100%, 0%, 1.01)")).toMatchSnapshot();
    });

    it("treats hsl and hsla as synonyms", () => {
      const fst = parse("hsl(0, 0%, 100%)") as ParsedColor;
      const snd = parse("hsla(0, 0%, 100%)") as ParsedColor;

      expect(JSON.stringify(fst.parsed)).toBe(JSON.stringify(snd.parsed));

      const fstWithAlpha = parse("hsl(0, 0%, 100%, 1)") as ParsedColor;
      const sndWithAlpha = parse("hsla(0, 0%, 100%, 1)") as ParsedColor;

      expect(JSON.stringify(fstWithAlpha.parsed)).toBe(
        JSON.stringify(sndWithAlpha.parsed)
      );
    });
  });
});
