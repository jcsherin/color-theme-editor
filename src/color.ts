import { colors } from "./example";

export interface HexColor {
  kind: "hex";
  name: string;
  hexcode: string;
}

export function makeHexColor(name: string, value: string): HexColor {
  return {
    kind: "hex",
    name: name,
    hexcode: value,
  };
}

export function getColorId(color: HexColor) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function getColorValue(color: HexColor) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function getColorName(color: HexColor) {
  switch (color.kind) {
    case "hex":
      return color.name;
  }
}

export function parseColor(v: string) {
  const hexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  const value = v.trim();
  if (hexColor.test(value)) {
    return makeHexColor(value, value);
  }
}
