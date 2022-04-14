interface HexColor {
  kind: "hex";
  name: string;
  hexcode: string;
}

export type Color = HexColor;

export function makeHexColor(name: string, value: string): Color {
  return {
    kind: "hex",
    name: name,
    hexcode: value,
  };
}

export function getColorValue(color: Color) {
  switch (color.kind) {
    case "hex":
      return color.hexcode;
  }
}

export function parseColor(v: string) {
  const hexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  const value = v.trim();
  if (hexColor.test(value)) {
    return makeHexColor(value, value);
  }
}
