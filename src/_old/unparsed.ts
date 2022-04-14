export interface UnparsedColorPalette {
  classNames: string;
  colors: string;
}

export function makeUnparsedColorPalette(
  classNames: string[] = [],
  colors: string[] = []
): UnparsedColorPalette {
  return { classNames: classNames.join("\n"), colors: colors.join("\n") };
}

export function isUnparsedEmpty(unparsed: UnparsedColorPalette) {
  const { classNames, colors } = unparsed;
  return classNames.trim().length === 0 && colors.trim().length === 0;
}
