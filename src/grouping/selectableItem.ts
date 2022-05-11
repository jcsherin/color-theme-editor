export interface SelectableItem {
  colorId: string;
  status: "default" | "selected" | "grouped";
}

export function makeSelectable(colorId: string): SelectableItem {
  return { colorId: colorId, status: "default" };
}

export function toggleStatus(colorId: string) {
  return (item: SelectableItem): SelectableItem => {
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

export function isSelected(item: SelectableItem): boolean {
  return item.status === "selected";
}

export function notGrouped(item: SelectableItem): boolean {
  return item.status !== "grouped";
}

export function groupSelected(items: SelectableItem[]): SelectableItem[] {
  return items.map((x) =>
    x.status === "selected" ? { ...x, status: "grouped" } : x
  );
}

export function someSelected(items: SelectableItem[]): boolean {
  return items.some((x) => x.status === "selected");
}

export function allGrouped(items: SelectableItem[]): boolean {
  return items.every((x) => x.status === "grouped");
}

export function ungroup(colorId: string) {
  return (item: SelectableItem): SelectableItem =>
    item.colorId === colorId ? { ...item, status: "default" } : item;
}
