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

export function updateColorName(color: HexColor, name: string): HexColor {
  return { ...color, name: name };
}
