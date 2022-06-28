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
  value: number;
  stringify: () => string;
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
    percentage.value,
    PercentageRange.Min,
    PercentageRange.Max
  );
  return createPercentage(result);
}

/**
 * Create a {Percentage} value.
 *
 * @param percentage
 * @returns {Percentage}
 */
function createPercentage(percentage: number): Percentage {
  return {
    value: percentage,
    stringify: () => `${percentage}%`,
  };
}

interface Alpha {
  value: number | Percentage;
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

  return { value };
}

interface RGBA {
  tag: "rgba";
  channels: Triple<number> | Triple<Percentage>;
  alpha: Alpha;
}

function createRGBA(
  channels: Triple<number> | Triple<Percentage>,
  alpha: Alpha
): RGBA {
  return {
    tag: "rgba",
    channels: channels,
    alpha: alpha,
  };
}

interface Hue {
  value: number;
}

function createHue(value: number): Hue {
  return { value };
}

interface HSLA {
  tag: "hsla";
  hue: Hue;
  saturation: Percentage;
  lightness: Percentage;
  alpha: Alpha;
}

function createHSLA(
  hue: number,
  saturation: Percentage,
  lightness: Percentage,
  alpha: Alpha
): HSLA {
  return {
    tag: "hsla",
    hue: createHue(hue),
    saturation,
    lightness,
    alpha: alpha,
  };
}

interface HexColor {
  tag: "hex-color";
  value: string;
}

function createHexColor(value: string): HexColor {
  return { tag: "hex-color", value };
}

interface NamedColor {
  tag: "named-color";
  value: keyof Keywords;
}

function createNamedColor(value: string): NamedColor {
  return { tag: "named-color", value: value as keyof Keywords };
}

type ParsedColor = HexColor | NamedColor | RGBA | HSLA;

interface ParseError {
  value: string;
  message: string;
}

function createParseError(value: string, message: string) {
  return { value, message };
}

const HexPatterns = [
  /^#[0-9A-Fa-f]{8}$/,
  /^#[0-9A-Fa-f]{6}$/,
  /^#[0-9A-Fa-f]{4}$/,
  /^#[0-9A-Fa-f]{3}$/,
];

const RGBAPattern = /^rgba?\((.*)\)$/;
const HSLAPattern = /^hsla?\((.*)\)$/;

function toNumber(str: string): number {
  return Number(str);
}

function toPercentage(str: string): number {
  return str.endsWith("%") ? parseFloat(str) : NaN;
}

function parseChannels(
  parts: Triple<string>
): Triple<number> | Triple<Percentage> | undefined {
  const percentages: Triple<number> = parts.map(toPercentage) as Triple<number>;

  if (percentages.every((n) => !Number.isNaN(n))) {
    return percentages.map(createPercentage) as Triple<Percentage>;
  }

  const nums = parts.map(toNumber);
  if (nums.every((n) => !Number.isNaN(n))) {
    return nums as Triple<number>;
  }

  return;
}

function parseAlpha(alpha: string): Alpha | undefined {
  const percentAlpha = toPercentage(alpha);
  if (!Number.isNaN(percentAlpha)) {
    return createAlpha(createPercentage(percentAlpha));
  }

  const numAlpha = toNumber(alpha);
  if (!Number.isNaN(numAlpha)) {
    return createAlpha(numAlpha);
  }

  return;
}

function parseHue(hue: string): number | undefined {
  const parsed = toNumber(hue);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseSaturation(saturation: string): Percentage | undefined {
  const parsed = toPercentage(saturation);
  return Number.isNaN(parsed)
    ? undefined
    : clampPercentage(createPercentage(parsed));
}

function parseLightness(lightness: string): Percentage | undefined {
  const parsed = toPercentage(lightness);
  return Number.isNaN(parsed)
    ? undefined
    : clampPercentage(createPercentage(parsed));
}

export function parse(color: string): ParsedColor | ParseError {
  const value = color.trim();

  // <named-color>
  if (keywords[value as keyof Keywords]) {
    return createNamedColor(value);
  }

  // <hex-color>
  if (HexPatterns.some((regexp) => regexp.test(value))) {
    return createHexColor(value);
  }

  // <rgb()> | <rgba()>
  if (RGBAPattern.test(value)) {
    const match = value.match(RGBAPattern);
    if (!match || !match[1]) {
      return createParseError(
        value,
        `${value} seems to be a malformed rgba() value`
      );
    }

    const parts = match[1].split(",");
    if (parts.length < 3 || parts.length > 4) {
      const message =
        value +
        " seems to be an rgba() value. It should have exactly three arguments" +
        " to specify the red, green & blue channels of the color respectively." +
        " A final optional argument specifies the alpha of the color.";
      return createParseError(value, message);
    }

    const channels = parseChannels(parts.slice(0, 3) as Triple<string>);
    if (!channels) {
      const message =
        "The red, green & blue channels of the color should be either all " +
        " numbers or all percentages.";
      return createParseError(value, message);
    }

    if (parts.length === 3) {
      return createRGBA(channels, createAlpha(1));
    }

    const alpha = parseAlpha(parts[3]);
    if (!alpha) {
      const message =
        "The alpha value(fourth argument) in rgba() should be either a " +
        " number or a percentage";
      return createParseError(value, message);
    }

    return createRGBA(channels, alpha);
  }

  // <hsl()> | <hsla()>
  if (HSLAPattern.test(value)) {
    const match = value.match(HSLAPattern);
    if (!match || !match[1]) {
      return createParseError(
        value,
        `${value} seems to be a malformed hsla() value`
      );
    }

    const parts = match[1].split(",");
    if (parts.length < 3 || parts.length > 4) {
      const message =
        value +
        " seems to be an hsla() value. It should have exactly three arguments" +
        " to specify the hue, saturation & lightness of the color respectively." +
        " A final optional argument specifies the alpha of the color.";
      return createParseError(value, message);
    }

    const hue = parseHue(parts[0]);
    if (hue === undefined) {
      const message = "In hsla() the hue (first argument) should be a number";
      return createParseError(value, message);
    }

    const saturation = parseSaturation(parts[1]);
    if (!saturation) {
      const message =
        "In hsla() the saturation (second argument) should always be" +
        " a percentage";
      return createParseError(value, message);
    }

    const lightness = parseLightness(parts[2]);
    if (!lightness) {
      const message =
        "In hsla() the ligthness (third argument) should always be" +
        " a percentage";
      return createParseError(value, message);
    }

    if (parts.length === 3) {
      return createHSLA(hue, saturation, lightness, createAlpha(1));
    }

    const alpha = parseAlpha(parts[3]);
    if (!alpha) {
      const message =
        "The alpha value(fourth argument) in hsla() should be either a " +
        " number or a percentage";
      return createParseError(value, message);
    }

    return createHSLA(hue, saturation, lightness, alpha);
  }

  const message =
    `${value}: ` +
    " is not a supported color format.\nThe supported formats are: hex, named " +
    " color keywords, rgb(), rgba(), hsl() and hsla().";
  return createParseError(value, message);
}
