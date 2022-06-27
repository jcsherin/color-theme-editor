import { Triple } from "./index";
export interface KeywordSpec {
  hex: string;
  rgb: Triple<number>;
}

export interface Keywords {
  aliceblue: KeywordSpec;
  antiquewhite: KeywordSpec;
  aqua: KeywordSpec;
  aquamarine: KeywordSpec;
  azure: KeywordSpec;
  beige: KeywordSpec;
  bisque: KeywordSpec;
  black: KeywordSpec;
  blanchedalmond: KeywordSpec;
  blue: KeywordSpec;
  blueviolet: KeywordSpec;
  brown: KeywordSpec;
  burlywood: KeywordSpec;
  cadetblue: KeywordSpec;
  chartreuse: KeywordSpec;
  chocolate: KeywordSpec;
  coral: KeywordSpec;
  cornflowerblue: KeywordSpec;
  cornsilk: KeywordSpec;
  crimson: KeywordSpec;
  cyan: KeywordSpec;
  darkblue: KeywordSpec;
  darkcyan: KeywordSpec;
  darkgoldenrod: KeywordSpec;
  darkgray: KeywordSpec;
  darkgreen: KeywordSpec;
  darkgrey: KeywordSpec;
  darkkhaki: KeywordSpec;
  darkmagenta: KeywordSpec;
  darkolivegreen: KeywordSpec;
  darkorange: KeywordSpec;
  darkorchid: KeywordSpec;
  darkred: KeywordSpec;
  darksalmon: KeywordSpec;
  darkseagreen: KeywordSpec;
  darkslateblue: KeywordSpec;
  darkslategray: KeywordSpec;
  darkslategrey: KeywordSpec;
  darkturquoise: KeywordSpec;
  darkviolet: KeywordSpec;
  deeppink: KeywordSpec;
  deepskyblue: KeywordSpec;
  dimgray: KeywordSpec;
  dimgrey: KeywordSpec;
  dodgerblue: KeywordSpec;
  firebrick: KeywordSpec;
  floralwhite: KeywordSpec;
  forestgreen: KeywordSpec;
  fuchsia: KeywordSpec;
  gainsboro: KeywordSpec;
  ghostwhite: KeywordSpec;
  gold: KeywordSpec;
  goldenrod: KeywordSpec;
  gray: KeywordSpec;
  green: KeywordSpec;
  greenyellow: KeywordSpec;
  grey: KeywordSpec;
  honeydew: KeywordSpec;
  hotpink: KeywordSpec;
  indianred: KeywordSpec;
  indigo: KeywordSpec;
  ivory: KeywordSpec;
  khaki: KeywordSpec;
  lavender: KeywordSpec;
  lavenderblush: KeywordSpec;
  lawngreen: KeywordSpec;
  lemonchiffon: KeywordSpec;
  lightblue: KeywordSpec;
  lightcoral: KeywordSpec;
  lightcyan: KeywordSpec;
  lightgoldenrodyellow: KeywordSpec;
  lightgray: KeywordSpec;
  lightgreen: KeywordSpec;
  lightgrey: KeywordSpec;
  lightpink: KeywordSpec;
  lightsalmon: KeywordSpec;
  lightseagreen: KeywordSpec;
  lightskyblue: KeywordSpec;
  lightslategray: KeywordSpec;
  lightslategrey: KeywordSpec;
  lightsteelblue: KeywordSpec;
  lightyellow: KeywordSpec;
  lime: KeywordSpec;
  limegreen: KeywordSpec;
  linen: KeywordSpec;
  magenta: KeywordSpec;
  maroon: KeywordSpec;
  mediumaquamarine: KeywordSpec;
  mediumblue: KeywordSpec;
  mediumorchid: KeywordSpec;
  mediumpurple: KeywordSpec;
  mediumseagreen: KeywordSpec;
  mediumslateblue: KeywordSpec;
  mediumspringgreen: KeywordSpec;
  mediumturquoise: KeywordSpec;
  mediumvioletred: KeywordSpec;
  midnightblue: KeywordSpec;
  mintcream: KeywordSpec;
  mistyrose: KeywordSpec;
  moccasin: KeywordSpec;
  navajowhite: KeywordSpec;
  navy: KeywordSpec;
  oldlace: KeywordSpec;
  olive: KeywordSpec;
  olivedrab: KeywordSpec;
  orange: KeywordSpec;
  orangered: KeywordSpec;
  orchid: KeywordSpec;
  palegoldenrod: KeywordSpec;
  palegreen: KeywordSpec;
  paleturquoise: KeywordSpec;
  palevioletred: KeywordSpec;
  papayawhip: KeywordSpec;
  peachpuff: KeywordSpec;
  peru: KeywordSpec;
  pink: KeywordSpec;
  plum: KeywordSpec;
  powderblue: KeywordSpec;
  purple: KeywordSpec;
  rebeccapurple: KeywordSpec;
  red: KeywordSpec;
  rosybrown: KeywordSpec;
  royalblue: KeywordSpec;
  saddlebrown: KeywordSpec;
  salmon: KeywordSpec;
  sandybrown: KeywordSpec;
  seagreen: KeywordSpec;
  seashell: KeywordSpec;
  sienna: KeywordSpec;
  silver: KeywordSpec;
  skyblue: KeywordSpec;
  slateblue: KeywordSpec;
  slategray: KeywordSpec;
  slategrey: KeywordSpec;
  snow: KeywordSpec;
  springgreen: KeywordSpec;
  steelblue: KeywordSpec;
  tan: KeywordSpec;
  teal: KeywordSpec;
  thistle: KeywordSpec;
  tomato: KeywordSpec;
  turquoise: KeywordSpec;
  violet: KeywordSpec;
  wheat: KeywordSpec;
  white: KeywordSpec;
  whitesmoke: KeywordSpec;
  yellow: KeywordSpec;
  yellowgreen: KeywordSpec;
}

export const keywords: Keywords = {
  aliceblue: { hex: "#F0F8FF", rgb: [240, 248, 255] },
  antiquewhite: { hex: "#FAEBD7", rgb: [250, 235, 215] },
  aqua: { hex: "#00FFFF", rgb: [0, 255, 255] },
  aquamarine: { hex: "#7FFFD4", rgb: [127, 255, 212] },
  azure: { hex: "#F0FFFF", rgb: [240, 255, 255] },
  beige: { hex: "#F5F5DC", rgb: [245, 245, 220] },
  bisque: { hex: "#FFE4C4", rgb: [255, 228, 196] },
  black: { hex: "#000000", rgb: [0, 0, 0] },
  blanchedalmond: { hex: "#FFEBCD", rgb: [255, 235, 205] },
  blue: { hex: "#0000FF", rgb: [0, 0, 255] },
  blueviolet: { hex: "#8A2BE2", rgb: [138, 43, 226] },
  brown: { hex: "#A52A2A", rgb: [165, 42, 42] },
  burlywood: { hex: "#DEB887", rgb: [222, 184, 135] },
  cadetblue: { hex: "#5F9EA0", rgb: [95, 158, 160] },
  chartreuse: { hex: "#7FFF00", rgb: [127, 255, 0] },
  chocolate: { hex: "#D2691E", rgb: [210, 105, 30] },
  coral: { hex: "#FF7F50", rgb: [255, 127, 80] },
  cornflowerblue: { hex: "#6495ED", rgb: [100, 149, 237] },
  cornsilk: { hex: "#FFF8DC", rgb: [255, 248, 220] },
  crimson: { hex: "#DC143C", rgb: [220, 20, 60] },
  cyan: { hex: "#00FFFF", rgb: [0, 255, 255] },
  darkblue: { hex: "#00008B", rgb: [0, 0, 139] },
  darkcyan: { hex: "#008B8B", rgb: [0, 139, 139] },
  darkgoldenrod: { hex: "#B8860B", rgb: [184, 134, 11] },
  darkgray: { hex: "#A9A9A9", rgb: [169, 169, 169] },
  darkgreen: { hex: "#006400", rgb: [0, 100, 0] },
  darkgrey: { hex: "#A9A9A9", rgb: [169, 169, 169] },
  darkkhaki: { hex: "#BDB76B", rgb: [189, 183, 107] },
  darkmagenta: { hex: "#8B008B", rgb: [139, 0, 139] },
  darkolivegreen: { hex: "#556B2F", rgb: [85, 107, 47] },
  darkorange: { hex: "#FF8C00", rgb: [255, 140, 0] },
  darkorchid: { hex: "#9932CC", rgb: [153, 50, 204] },
  darkred: { hex: "#8B0000", rgb: [139, 0, 0] },
  darksalmon: { hex: "#E9967A", rgb: [233, 150, 122] },
  darkseagreen: { hex: "#8FBC8F", rgb: [143, 188, 143] },
  darkslateblue: { hex: "#483D8B", rgb: [72, 61, 139] },
  darkslategray: { hex: "#2F4F4F", rgb: [47, 79, 79] },
  darkslategrey: { hex: "#2F4F4F", rgb: [47, 79, 79] },
  darkturquoise: { hex: "#00CED1", rgb: [0, 206, 209] },
  darkviolet: { hex: "#9400D3", rgb: [148, 0, 211] },
  deeppink: { hex: "#FF1493", rgb: [255, 20, 147] },
  deepskyblue: { hex: "#00BFFF", rgb: [0, 191, 255] },
  dimgray: { hex: "#696969", rgb: [105, 105, 105] },
  dimgrey: { hex: "#696969", rgb: [105, 105, 105] },
  dodgerblue: { hex: "#1E90FF", rgb: [30, 144, 255] },
  firebrick: { hex: "#B22222", rgb: [178, 34, 34] },
  floralwhite: { hex: "#FFFAF0", rgb: [255, 250, 240] },
  forestgreen: { hex: "#228B22", rgb: [34, 139, 34] },
  fuchsia: { hex: "#FF00FF", rgb: [255, 0, 255] },
  gainsboro: { hex: "#DCDCDC", rgb: [220, 220, 220] },
  ghostwhite: { hex: "#F8F8FF", rgb: [248, 248, 255] },
  gold: { hex: "#FFD700", rgb: [255, 215, 0] },
  goldenrod: { hex: "#DAA520", rgb: [218, 165, 32] },
  gray: { hex: "#808080", rgb: [128, 128, 128] },
  green: { hex: "#008000", rgb: [0, 128, 0] },
  greenyellow: { hex: "#ADFF2F", rgb: [173, 255, 47] },
  grey: { hex: "#808080", rgb: [128, 128, 128] },
  honeydew: { hex: "#F0FFF0", rgb: [240, 255, 240] },
  hotpink: { hex: "#FF69B4", rgb: [255, 105, 180] },
  indianred: { hex: "#CD5C5C", rgb: [205, 92, 92] },
  indigo: { hex: "#4B0082", rgb: [75, 0, 130] },
  ivory: { hex: "#FFFFF0", rgb: [255, 255, 240] },
  khaki: { hex: "#F0E68C", rgb: [240, 230, 140] },
  lavender: { hex: "#E6E6FA", rgb: [230, 230, 250] },
  lavenderblush: { hex: "#FFF0F5", rgb: [255, 240, 245] },
  lawngreen: { hex: "#7CFC00", rgb: [124, 252, 0] },
  lemonchiffon: { hex: "#FFFACD", rgb: [255, 250, 205] },
  lightblue: { hex: "#ADD8E6", rgb: [173, 216, 230] },
  lightcoral: { hex: "#F08080", rgb: [240, 128, 128] },
  lightcyan: { hex: "#E0FFFF", rgb: [224, 255, 255] },
  lightgoldenrodyellow: { hex: "#FAFAD2", rgb: [250, 250, 210] },
  lightgray: { hex: "#D3D3D3", rgb: [211, 211, 211] },
  lightgreen: { hex: "#90EE90", rgb: [144, 238, 144] },
  lightgrey: { hex: "#D3D3D3", rgb: [211, 211, 211] },
  lightpink: { hex: "#FFB6C1", rgb: [255, 182, 193] },
  lightsalmon: { hex: "#FFA07A", rgb: [255, 160, 122] },
  lightseagreen: { hex: "#20B2AA", rgb: [32, 178, 170] },
  lightskyblue: { hex: "#87CEFA", rgb: [135, 206, 250] },
  lightslategray: { hex: "#778899", rgb: [119, 136, 153] },
  lightslategrey: { hex: "#778899", rgb: [119, 136, 153] },
  lightsteelblue: { hex: "#B0C4DE", rgb: [176, 196, 222] },
  lightyellow: { hex: "#FFFFE0", rgb: [255, 255, 224] },
  lime: { hex: "#00FF00", rgb: [0, 255, 0] },
  limegreen: { hex: "#32CD32", rgb: [50, 205, 50] },
  linen: { hex: "#FAF0E6", rgb: [250, 240, 230] },
  magenta: { hex: "#FF00FF", rgb: [255, 0, 255] },
  maroon: { hex: "#800000", rgb: [128, 0, 0] },
  mediumaquamarine: { hex: "#66CDAA", rgb: [102, 205, 170] },
  mediumblue: { hex: "#0000CD", rgb: [0, 0, 205] },
  mediumorchid: { hex: "#BA55D3", rgb: [186, 85, 211] },
  mediumpurple: { hex: "#9370DB", rgb: [147, 112, 219] },
  mediumseagreen: { hex: "#3CB371", rgb: [60, 179, 113] },
  mediumslateblue: { hex: "#7B68EE", rgb: [123, 104, 238] },
  mediumspringgreen: { hex: "#00FA9A", rgb: [0, 250, 154] },
  mediumturquoise: { hex: "#48D1CC", rgb: [72, 209, 204] },
  mediumvioletred: { hex: "#C71585", rgb: [199, 21, 133] },
  midnightblue: { hex: "#191970", rgb: [25, 25, 112] },
  mintcream: { hex: "#F5FFFA", rgb: [245, 255, 250] },
  mistyrose: { hex: "#FFE4E1", rgb: [255, 228, 225] },
  moccasin: { hex: "#FFE4B5", rgb: [255, 228, 181] },
  navajowhite: { hex: "#FFDEAD", rgb: [255, 222, 173] },
  navy: { hex: "#000080", rgb: [0, 0, 128] },
  oldlace: { hex: "#FDF5E6", rgb: [253, 245, 230] },
  olive: { hex: "#808000", rgb: [128, 128, 0] },
  olivedrab: { hex: "#6B8E23", rgb: [107, 142, 35] },
  orange: { hex: "#FFA500", rgb: [255, 165, 0] },
  orangered: { hex: "#FF4500", rgb: [255, 69, 0] },
  orchid: { hex: "#DA70D6", rgb: [218, 112, 214] },
  palegoldenrod: { hex: "#EEE8AA", rgb: [238, 232, 170] },
  palegreen: { hex: "#98FB98", rgb: [152, 251, 152] },
  paleturquoise: { hex: "#AFEEEE", rgb: [175, 238, 238] },
  palevioletred: { hex: "#DB7093", rgb: [219, 112, 147] },
  papayawhip: { hex: "#FFEFD5", rgb: [255, 239, 213] },
  peachpuff: { hex: "#FFDAB9", rgb: [255, 218, 185] },
  peru: { hex: "#CD853F", rgb: [205, 133, 63] },
  pink: { hex: "#FFC0CB", rgb: [255, 192, 203] },
  plum: { hex: "#DDA0DD", rgb: [221, 160, 221] },
  powderblue: { hex: "#B0E0E6", rgb: [176, 224, 230] },
  purple: { hex: "#800080", rgb: [128, 0, 128] },
  rebeccapurple: { hex: "#663399", rgb: [102, 51, 153] },
  red: { hex: "#FF0000", rgb: [255, 0, 0] },
  rosybrown: { hex: "#BC8F8F", rgb: [188, 143, 143] },
  royalblue: { hex: "#4169E1", rgb: [65, 105, 225] },
  saddlebrown: { hex: "#8B4513", rgb: [139, 69, 19] },
  salmon: { hex: "#FA8072", rgb: [250, 128, 114] },
  sandybrown: { hex: "#F4A460", rgb: [244, 164, 96] },
  seagreen: { hex: "#2E8B57", rgb: [46, 139, 87] },
  seashell: { hex: "#FFF5EE", rgb: [255, 245, 238] },
  sienna: { hex: "#A0522D", rgb: [160, 82, 45] },
  silver: { hex: "#C0C0C0", rgb: [192, 192, 192] },
  skyblue: { hex: "#87CEEB", rgb: [135, 206, 235] },
  slateblue: { hex: "#6A5ACD", rgb: [106, 90, 205] },
  slategray: { hex: "#708090", rgb: [112, 128, 144] },
  slategrey: { hex: "#708090", rgb: [112, 128, 144] },
  snow: { hex: "#FFFAFA", rgb: [255, 250, 250] },
  springgreen: { hex: "#00FF7F", rgb: [0, 255, 127] },
  steelblue: { hex: "#4682B4", rgb: [70, 130, 180] },
  tan: { hex: "#D2B48C", rgb: [210, 180, 140] },
  teal: { hex: "#008080", rgb: [0, 128, 128] },
  thistle: { hex: "#D8BFD8", rgb: [216, 191, 216] },
  tomato: { hex: "#FF6347", rgb: [255, 99, 71] },
  turquoise: { hex: "#40E0D0", rgb: [64, 224, 208] },
  violet: { hex: "#EE82EE", rgb: [238, 130, 238] },
  wheat: { hex: "#F5DEB3", rgb: [245, 222, 179] },
  white: { hex: "#FFFFFF", rgb: [255, 255, 255] },
  whitesmoke: { hex: "#F5F5F5", rgb: [245, 245, 245] },
  yellow: { hex: "#FFFF00", rgb: [255, 255, 0] },
  yellowgreen: { hex: "#9ACD32", rgb: [154, 205, 50] },
};
