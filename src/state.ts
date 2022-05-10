import { ColorGroup, ColorListItem } from "./grouping";
import { HexColor } from "./hexColor";

export interface State {
  colorDict: Map<string, HexColor>;
  colorGroupDict: Map<string, ColorGroup>;
  colorList: ColorListItem[];
}
