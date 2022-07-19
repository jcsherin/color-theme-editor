import type { KeywordSpec } from "./keywords";
import type { ParsedColor } from "./index";

import { keywords } from "./keywords";
import { parseColor } from "./index";

describe("Color Parser", () => {
  describe("Named color keywords", () => {
    it("parses every named color keyword", () => {
      const expected = Object.keys(keywords)
        .map(parseColor)
        .map((parsed) => JSON.stringify(parsed))
        .join("\n");

      expect(expected).toMatchSnapshot();
    });

    it("produces a parse error for non-existent color keywords", () => {
      const expected = parseColor("notarealcolorkeyword");

      expect(expected).toMatchSnapshot();
    });
  });

  describe("Hex colors", () => {
    it("parses hex values corresponding to every named color keyword", () => {
      const expected = Object.values(keywords)
        .map((k: KeywordSpec) => k.hex)
        .map(parseColor)
        .map((parsed) => JSON.stringify(parsed))
        .join("\n");

      expect(expected).toMatchSnapshot();
    });

    it("parses hex values of size 8, 6, 4 & 3", () => {
      expect(parseColor("#4682B4FF")).toMatchSnapshot();
      expect(parseColor("#4682B4")).toMatchSnapshot();
      expect(parseColor("#4682")).toMatchSnapshot();
      expect(parseColor("#468")).toMatchSnapshot();
    });

    it("produces a parse error for invalid hex values", () => {
      expect(parseColor("#46")).toMatchSnapshot();
      expect(parseColor("#4682B4FF00")).toMatchSnapshot();
      expect(parseColor("#xyz")).toMatchSnapshot();
    });
  });

  describe("RGBA", () => {
    it("parses rgba values without an alpha value", () => {
      expect(parseColor("rgb(0, 255, 0)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 255, 0)")).toMatchSnapshot();
      expect(parseColor("rgb(0%, 100%, 0%)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100%, 0%)")).toMatchSnapshot();
    });

    it("parses rgba values with an alpha value", () => {
      expect(parseColor("rgba(0, 255, 0, 1)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 255, 0, 100%)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100%, 0%, 1)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100%, 0%, 100%)")).toMatchSnapshot();
      expect(parseColor("rgb(0%, 100%, 0%, 50%)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 255, 0, 0.5)")).toMatchSnapshot();
    });

    it("produces parse errors for missing rgba channel values", () => {
      expect(parseColor("rgba()")).toMatchSnapshot();
    });

    it("produces parse errors for wrongly typed rgba channel values", () => {
      expect(parseColor("rgba(0, 255%, 0)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100, 0%)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 255%, 0, 100%)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100, 0%, 100%)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 255%, 0, abc)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100, 0%, abc)")).toMatchSnapshot();
    });

    it("produces parse errors for wrongly typed rgba alpha value", () => {
      expect(parseColor("rgba(0%, 100%, 0%, abc)")).toMatchSnapshot();
      expect(parseColor("rgba(0%, 100%, 0%, abc)")).toMatchSnapshot();
    });

    it("produces parse errors for rgba with incorrect number of arguments", () => {
      expect(parseColor("rgba(0%, 100, 0%, 100%, 1)")).toMatchSnapshot();
      expect(parseColor("rgba(100%, 1)")).toMatchSnapshot();
    });

    it("parses rgba alpha values are clamped between 0 and 1", () => {
      expect(parseColor("rgba(0, 0, 0, -.1)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 0, 0, 1.01)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 0, 0, -0.1%)")).toMatchSnapshot();
      expect(parseColor("rgba(0, 0, 0, 100.01%)")).toMatchSnapshot();
    });

    it("parsed rgba channel values are clamped between 0 and 255", () => {
      expect(parseColor("rgb(-.1, -.1, -.1)")).toMatchSnapshot();
      expect(parseColor("rgb(255.01, 255.01, 255.01)")).toMatchSnapshot();
      expect(parseColor("rgb(-.1%, -.1%, -.1%)")).toMatchSnapshot();
      expect(parseColor("rgb(100.1%, 100.1%, 100.1%)")).toMatchSnapshot();
    });

    it("treats rgb & rgba as synonyms", () => {
      const rgb = parseColor("rgb(0, 255, 0)") as ParsedColor;
      const rgba = parseColor("rgba(0, 255, 0)") as ParsedColor;

      expect(JSON.stringify(rgb.parsed)).toBe(JSON.stringify(rgba.parsed));
    });
  });

  describe("HSLA", () => {
    it("parses hsla values without an alpha value", () => {
      expect(parseColor("hsl(0, 0%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsl(90, 0%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsla(0, 0%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 0%, 100%)")).toMatchSnapshot();
    });

    it("parses hsla values without an alpha value", () => {
      expect(parseColor("hsla(0, 0%, 100%, 1)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 0%, 100%, 1)")).toMatchSnapshot();
      expect(parseColor("hsla(0, 0%, 100%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 0%, 100%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 0%, 100%, 0.5)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 0%, 100%, 50%)")).toMatchSnapshot();
    });

    it("produces parse errors for missing hue, saturation & ligthness values", () => {
      expect(parseColor("hsla()")).toMatchSnapshot();
    });

    it("produces parse errors when hue value is not a number", () => {
      expect(parseColor("hsla(0%, 0%, 100%, 100%)")).toMatchSnapshot();
    });

    it("produces parse errors when saturation is not a percentage", () => {
      expect(parseColor("hsla(90, 0, 100%, 100%)")).toMatchSnapshot();
    });

    it("produces parse errors when lightness is not a percentage", () => {
      expect(parseColor("hsla(90, 0%, 100, 100%)")).toMatchSnapshot();
    });

    it("produces parse errors when alpha is neither a number nor percentage", () => {
      expect(parseColor("hsla(90, 0%, 100%, hex)")).toMatchSnapshot();
    });

    it("clamps saturation between 0% and 100%", () => {
      expect(parseColor("hsla(90, -.1%, 100%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 100.1%, 100%, 100%)")).toMatchSnapshot();
    });

    it("clamps lightness between 0% and 100%", () => {
      expect(parseColor("hsla(90, 100%, -.1%, 100%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 100%, 100.1%, 100%)")).toMatchSnapshot();
    });

    it("clamps alpha values between either 0 and 1 or 0% and 100%", () => {
      expect(parseColor("hsla(90, 100%, 0%, -.1%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 100%, 0%, 100.1%)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 100%, 0%, -.1)")).toMatchSnapshot();
      expect(parseColor("hsla(90, 100%, 0%, 1.01)")).toMatchSnapshot();
    });

    it("treats hsl and hsla as synonyms", () => {
      const fst = parseColor("hsl(0, 0%, 100%)") as ParsedColor;
      const snd = parseColor("hsla(0, 0%, 100%)") as ParsedColor;

      expect(JSON.stringify(fst.parsed)).toBe(JSON.stringify(snd.parsed));

      const fstWithAlpha = parseColor("hsl(0, 0%, 100%, 1)") as ParsedColor;
      const sndWithAlpha = parseColor("hsla(0, 0%, 100%, 1)") as ParsedColor;

      expect(JSON.stringify(fstWithAlpha.parsed)).toBe(
        JSON.stringify(sndWithAlpha.parsed)
      );
    });
  });
});
