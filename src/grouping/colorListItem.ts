export interface ColorListItem {
  colorId: string;
  status: "default" | "selected" | "grouped";
}

export function makeColorListItem(colorId: string): ColorListItem {
  return { colorId: colorId, status: "default" };
}

export function toggleStatus(colorId: string) {
  return (item: ColorListItem): ColorListItem => {
    if (item.colorId !== colorId) return item;

    switch (item.status) {
      case "default":
        return { ...item, status: "selected" };
      case "selected":
        return { ...item, status: "default" };
      case "grouped":
        return item;
    }
  };
}

export function isSelected(item: ColorListItem): boolean {
  return item.status === "selected";
}

export function notGrouped(item: ColorListItem): boolean {
  return item.status !== "grouped";
}

export function groupSelected(items: ColorListItem[]): ColorListItem[] {
  return items.map((x) =>
    x.status === "selected" ? { ...x, status: "grouped" } : x
  );
}

export function someSelected(items: ColorListItem[]): boolean {
  return items.some((x) => x.status === "selected");
}

export function allGrouped(items: ColorListItem[]): boolean {
  return items.every((x) => x.status === "grouped");
}

export function ungroup(colorId: string) {
  return (item: ColorListItem): ColorListItem =>
    item.colorId === colorId ? { ...item, status: "default" } : item;
}
