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

import type { Keywords } from "./keywords";
import { keywords } from "./keywords";

export type ColorFormat = "hex" | "named" | "rgb" | "rgba" | "hsl" | "hsla";
export interface BaseColor {
  kind: ColorFormat;
  value: string;
}

function makeColor(kind: ColorFormat, value: string): BaseColor {
  return { kind, value };
}

const PATTERN_hex8 = /^#[0-9A-Fa-f]{8}$/;
const PATTERN_hex6 = /^#[0-9A-Fa-f]{6}$/;
const PATTERN_hex4 = /^#[0-9A-Fa-f]{4}$/;
const PATTERN_hex3 = /^#[0-9A-Fa-f]{3}$/;
const PATTERN_rgba = /^rgba?\((.*)\)$/;
const PATTERN_hsla = /^hsla?\((.*)\)$/;

function parseNumber(str: string): number {
  return Number(str);
}
function containsOnlyNumbers(parts: string[]): boolean {
  return parts.map(parseNumber).every((num) => !Number.isNaN(num));
}

function parsePercentage(str: string): number {
  return str.endsWith("%") ? parseFloat(str) : NaN;
}

function containsOnlyPercentages(parts: string[]): boolean {
  return parts.map(parsePercentage).every((num) => !Number.isNaN(num));
}

export function parse(color: string): BaseColor | undefined {
  const value = color.trim();

  if (keywords[value as keyof Keywords]) {
    return makeColor("named", value);
  } else if (
    PATTERN_hex8.test(value) ||
    PATTERN_hex6.test(value) ||
    PATTERN_hex4.test(value) ||
    PATTERN_hex3.test(value)
  ) {
    return makeColor("hex", value);
  } else if (PATTERN_rgba.test(value)) {
    const match = color.match(PATTERN_rgba);
    if (!match) return;
    if (!match[1]) return;

    const parts = match[1].split(",");
    if (parts.length < 3 || parts.length > 4) return;

    const rgb = parts.slice(0, 3);
    if (!(containsOnlyNumbers(rgb) || containsOnlyPercentages(rgb))) return;

    if (parts.length === 3) {
      return makeColor("rgb", value);
    }

    const alpha = parts[3];
    if (
      Number.isNaN(parseNumber(alpha)) ||
      Number.isNaN(parsePercentage(alpha))
    ) {
      return;
    }

    return makeColor("rgba", value);
  } else if (PATTERN_hsla.test(value)) {
    const match = value.match(PATTERN_hsla);
    if (!match) return;
    if (!match[1]) return;

    const parts = match[1].split(",");
    if (parts.length < 3 || parts.length > 4) return;

    const hue = parts[0];
    if (Number.isNaN(parseNumber(hue))) return;

    // saturation, lightness
    if (!containsOnlyPercentages(parts.slice(1, 3))) return;

    if (parts.length === 3) {
      return makeColor("hsl", value);
    }

    const alpha = parts[3];
    if (
      Number.isNaN(parseNumber(alpha)) ||
      Number.isNaN(parsePercentage(alpha))
    ) {
      return;
    }

    return makeColor("hsla", value);
  }
  return;
}

function __debug(color: string) {
  const parsed = parse(color);
  const serialized = JSON.stringify(parsed, null, 2);
  console.log(`Parsing "${color}":`);
  console.log(serialized);
}

__debug("steelblue");
__debug("notacolor");
__debug("#4682B4FF");
__debug("#4682B4");
__debug("#4682");
__debug("#468");
__debug("#46");
__debug("rgb(0, 255, 0)");
__debug("rgb(0%, 100%, 0%)");
__debug("rgba(0, 255, 0)");
__debug("rgba(0%, 100%, 0%)");
__debug("rgba(0, 255, 0, 1)");
__debug("rgba(0%, 100%, 0%, 1)");
__debug("rgba(0, 255, 0, 100%)");
__debug("rgba(0%, 100%, 0%, 100%)");
__debug("rgba(0, 255%, 0, 100%)");
__debug("rgba(0%, 100, 0%, 100%)");
__debug("rgba(0, 255%, 0, abc)");
__debug("rgba(0%, 100, 0%, abc)");
__debug("rgba(0%, 100, 0%, 100%, 1)");
__debug("rgba(100%, 1)");
