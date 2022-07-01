/**
Supported representations of color values:
  - color keyword       : lime
  - RGB range 0 - 255   : rgb(0 255 0)
  - RGB range 0% - 100% : rgb(0% 100% 0%)
  - Hex notation        : #00FF00
  - HSL                 : hsl(120deg 100% 50%)


<color> = 
  | <hex-color> 
  | <named-color>
  | <hsl()>
  | <hsla()>
  | <rgb()>
  | <rgba()>

RGB
===

rgb() = rgb( <percentage>{3} , <alpha-value>? ) | rgb( <number>{3}, <alpha-value>? )
- For <percentage> 0% represents min value, and 100% represents max value.
- For <number> 0 represents the min value, and 255 represents the max value.
- RGB & RGBA are synonyms

HSL 
===

Specified as a triplet of hue, saturation, lightness.

hsl() = hsl( <hue> , <percentage> , <percentage>, <alpha-value>? )
- first argument specifies the hue angle
- HSL & HSLA are synonyms

Hue
===

<hue> = <number> | <angle>
- It is not constrainted to the range [0, 360] but is unbounded.

Alpha
=====

<alpha-value> = <number> | <percentage>
- The range of alpha is from 0 to 1.
- The value 0 is fully transparent.
- The value 1 is fully opaque.
- The range of alpha is from 0(fully transparent) to 1(fullyopaque).

Hex notation
============

Digits in `#RRGGBB` are interpreted as a hexadecimal number.

6 digits
--------
- first pair of digits  specifies red channel
- next pair specifies the green channel
- last pair specifies the blue channel
- 00 represents the min value
- ff represents the max value
- alpha channel of color is fully opaque

8 digits
--------
- first 6 digits identical to 6-digit notation
- last pair specifies the alpha channel
  - 00 represents fully transparent color
  - ff represents fully opaque color

3 digits
--------
- shorter variant of the 6-digit notation
- first digit specifies red channel
- next digit specifies green channel
- last digit specifies blue channel
- alpha channel of the color is fully opaque

4 digits
--------
- shorter variant of the 8-digit notation.
- first three digits specifies red, green & blue channel
- last digit specifies the alpha channel

*/

import type { Triple, Keywords } from "./index";
import { keywords } from "./index";

/**
 * Use clamp to restrict a value to range that is defined by the minimum and
 * maximum values.
 *
 * @param value
 * @param min
 * @param max
 * @returns the minimum value if the given value is less than the minimum.
 * Returns the maximum value if the given value is greater than the maximum
 * value. Returns the given value if it is within the minimum and maximum
 * range.
 */
function clamp(value: number, min: number, max: number): number {
  if (Math.floor(value) < min) return min;
  if (Math.ceil(value) > max) return max;
  return value;
}

interface Percentage {
  percentage: number;
}

const enum PercentageRange {
  Min = 0,
  Max = 100,
}

/**
 * Restrict the given percentage value between 0% and 100%.
 *
 * @param percentage
 * @returns a clamped percentage value
 */
function clampPercentage(percentage: Percentage): Percentage {
  const result = clamp(
    percentage.percentage,
    PercentageRange.Min,
    PercentageRange.Max
  );
  return createPercentage(result);
}

/**
 * Create a {Percentage} value.
 *
 * @param value
 * @returns {Percentage}
 */
function createPercentage(value: string | number): Percentage {
  const percentage =
    typeof value === "number" ? value : Number.parseFloat(value);
  return {
    percentage,
  };
}

function stringifyPercentage(value: Percentage): string {
  return `${value.percentage}%`;
}

interface Alpha {
  alpha: number | Percentage;
}

const enum AlphaRange {
  Min = 0,
  Max = 1,
}

/**
 * The range of alpha is from 0 to 1 when a number is provided. The range of
 * alpha is from 0% to 100% when a percentage is provided.
 *
 * @param alpha
 * @returns {Alpha}
 */
function createAlpha(alpha: number | Percentage): Alpha {
  const value =
    typeof alpha === "number"
      ? clamp(alpha, AlphaRange.Min, AlphaRange.Max)
      : clampPercentage(alpha);

  return { alpha: value };
}

function stringifyAlpha(value: Alpha): string {
  return typeof value.alpha === "number"
    ? `${value.alpha}`
    : stringifyPercentage(value.alpha);
}

interface RGBAColor {
  tag: "rgba";
  channels: Triple<number> | Triple<Percentage>;
  alpha: Alpha;
}

function createRGBA(
  channels: Triple<number> | Triple<Percentage>,
  alpha: Alpha
): RGBAColor {
  return {
    tag: "rgba",
    channels: channels,
    alpha: alpha,
  };
}

function stringifyRGBA(color: RGBAColor): string {
  const channels =
    typeof color.channels[0] === "number" &&
    typeof color.channels[1] === "number" &&
    typeof color.channels[2] === "number"
      ? [`${color.channels[0]}`, `${color.channels[1]}`, `${color.channels[2]}`]
      : [
          stringifyPercentage(color.channels[0] as Percentage),
          stringifyPercentage(color.channels[1] as Percentage),
          stringifyPercentage(color.channels[2] as Percentage),
        ];

  return `rgba(${channels.join(",")}, ${stringifyAlpha(color.alpha)})`;
}

interface HSLAColor {
  tag: "hsla";
  hue: number;
  saturation: Percentage;
  lightness: Percentage;
  alpha: Alpha;
}

function createHSLA(
  hue: number,
  saturation: Percentage,
  lightness: Percentage,
  alpha: Alpha
): HSLAColor {
  return {
    tag: "hsla",
    hue: hue,
    saturation,
    lightness,
    alpha: alpha,
  };
}

function stringifyHSLA(color: HSLAColor): string {
  return `hsla(${color.hue}, ${stringifyPercentage(
    color.saturation
  )}, ${stringifyPercentage(color.lightness)}), ${stringifyAlpha(color.alpha)}`;
}

interface HexColor {
  tag: "hex-color";
  hex: string;
}

function createHexColor(hex: string): HexColor {
  return { tag: "hex-color", hex: hex };
}

interface KeywordColor {
  tag: "keyword-color";
  keyword: keyof Keywords;
}

function createKeywordColor(value: string): KeywordColor {
  return { tag: "keyword-color", keyword: value as keyof Keywords };
}

export interface ParsedColor {
  token: string;
  parsed: HexColor | KeywordColor | RGBAColor | HSLAColor;
}

function createParsedColor(
  token: string,
  parsed: HexColor | KeywordColor | RGBAColor | HSLAColor
): ParsedColor {
  return { token, parsed };
}

function stringifyColor(
  color: HexColor | KeywordColor | RGBAColor | HSLAColor
): string {
  switch (color.tag) {
    case "hex-color":
      return color.hex;
    case "keyword-color":
      return color.keyword;
    case "rgba":
      return stringifyRGBA(color);
    case "hsla":
      return stringifyHSLA(color);
  }
}

interface ParseError {
  token: string;
  message: string;
}

function createParseError(token: string, message: string) {
  return { token, message };
}

const HexPatterns = [
  /^#[0-9A-Fa-f]{8}$/,
  /^#[0-9A-Fa-f]{6}$/,
  /^#[0-9A-Fa-f]{4}$/,
  /^#[0-9A-Fa-f]{3}$/,
];

const RGBAPattern = /^rgba?\((.*)\)$/;
const HSLAPattern = /^hsla?\((.*)\)$/;

function isNumber(str: string): boolean {
  return !Number.isNaN(Number(str));
}

function isPercentage(str: string): boolean {
  return str.endsWith("%") && !Number.isNaN(Number.parseFloat(str));
}

const enum ChannelNumberRange {
  Min = 0,
  Max = 255,
}

/**
 * Restrict the given channel value between 0 and 255.
 *
 * @param num
 * @returns a clamped channel value
 */
function clampChannelNumber(num: number): number {
  return clamp(num, ChannelNumberRange.Min, ChannelNumberRange.Max);
}

function parseChannels(
  parts: Triple<string>
): Triple<number> | Triple<Percentage> | undefined {
  if (parts.every(isPercentage)) {
    return parts
      .map(createPercentage)
      .map(clampPercentage) as Triple<Percentage>;
  }

  if (parts.every(isNumber)) {
    return parts
      .map((str) => Number.parseFloat(str))
      .map(clampChannelNumber) as Triple<number>;
  }

  return;
}

function parseAlpha(alpha: string): Alpha | undefined {
  if (isPercentage(alpha)) {
    return createAlpha(createPercentage(alpha));
  }

  if (isNumber(alpha)) {
    return createAlpha(Number.parseFloat(alpha));
  }

  return;
}

function parseHue(hue: string): number | undefined {
  if (isNumber(hue)) return Number.parseFloat(hue);
}

function parseSaturation(saturation: string): Percentage | undefined {
  if (isPercentage(saturation))
    return clampPercentage(createPercentage(saturation));
}

function parseLightness(lightness: string): Percentage | undefined {
  if (isPercentage(lightness))
    return clampPercentage(createPercentage(lightness));
}

export function parse(color: string): ParsedColor | ParseError {
  const token = color.trim();

  // <named-color>
  if (keywords[token as keyof Keywords]) {
    return createParsedColor(token, createKeywordColor(token));
  }

  // <hex-color>
  if (HexPatterns.some((regexp) => regexp.test(token))) {
    return createParsedColor(token, createHexColor(token));
  }

  // <rgb()> | <rgba()>
  if (RGBAPattern.test(token)) {
    const match = token.match(RGBAPattern);
    if (!match || !match[1]) {
      return createParseError(
        token,
        `${token} seems to be a malformed rgba() value`
      );
    }

    const parts = match[1].split(",");
    if (parts.length < 3 || parts.length > 4) {
      const message =
        token +
        " seems to be an rgba() value. It should have exactly three arguments" +
        " to specify the red, green & blue channels of the color respectively." +
        " A final optional argument specifies the alpha of the color.";
      return createParseError(token, message);
    }

    const channels = parseChannels(parts.slice(0, 3) as Triple<string>);
    if (!channels) {
      const message =
        "The red, green & blue channels of the color should be either all " +
        " numbers or all percentages.";
      return createParseError(token, message);
    }

    if (parts.length === 3) {
      return createParsedColor(token, createRGBA(channels, createAlpha(1)));
    }

    const alpha = parseAlpha(parts[3]);
    if (!alpha) {
      const message =
        "The alpha value(fourth argument) in rgba() should be either a " +
        " number or a percentage";
      return createParseError(token, message);
    }

    return createParsedColor(token, createRGBA(channels, alpha));
  }

  // <hsl()> | <hsla()>
  if (HSLAPattern.test(token)) {
    const match = token.match(HSLAPattern);
    if (!match || !match[1]) {
      return createParseError(
        token,
        `${token} seems to be a malformed hsla() value`
      );
    }

    const parts = match[1].split(",");
    if (parts.length < 3 || parts.length > 4) {
      const message =
        token +
        " seems to be an hsla() value. It should have exactly three arguments" +
        " to specify the hue, saturation & lightness of the color respectively." +
        " A final optional argument specifies the alpha of the color.";
      return createParseError(token, message);
    }

    const hue = parseHue(parts[0]);
    if (hue === undefined) {
      const message = "In hsla() the hue (first argument) should be a number";
      return createParseError(token, message);
    }

    const saturation = parseSaturation(parts[1]);
    if (!saturation) {
      const message =
        "In hsla() the saturation (second argument) should always be" +
        " a percentage";
      return createParseError(token, message);
    }

    const lightness = parseLightness(parts[2]);
    if (!lightness) {
      const message =
        "In hsla() the ligthness (third argument) should always be" +
        " a percentage";
      return createParseError(token, message);
    }

    if (parts.length === 3) {
      return createParsedColor(
        token,
        createHSLA(hue, saturation, lightness, createAlpha(1))
      );
    }

    const alpha = parseAlpha(parts[3]);
    if (!alpha) {
      const message =
        "The alpha value(fourth argument) in hsla() should be either a " +
        " number or a percentage";
      return createParseError(token, message);
    }

    return createParsedColor(
      token,
      createHSLA(hue, saturation, lightness, alpha)
    );
  }

  const message =
    `${token}: ` +
    " is not a supported color format.\nThe supported formats are: hex, named " +
    " color keywords, rgb(), rgba(), hsl() and hsla().";
  return createParseError(token, message);
}
