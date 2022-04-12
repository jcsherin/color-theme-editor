import React, { useEffect, useRef, useState } from "react";
import { BatchInput } from "./BatchInput";
import { Button } from "./Button";
import { ClipboardCopy } from "./ClipboardCopy";
import {
  Color,
  ColorState,
  ColorTheme,
  createColorState,
  isColorThemeEmpty,
  parseColors,
  parseGroups,
  tailwindJSON,
  toColorList,
} from "./ColorTheme";
import { exampleColorGroups, exampleColorValues } from "./example";

import { isUnparsedEmpty, makeUnparsedColorPalette } from "./unparsed";
import type { UnparsedColorPalette } from "./unparsed";

interface IndentProps {
  children: React.ReactNode;
}
function Indent({ children, className }: IndentProps & { className?: string }) {
  return <div className={`mx-5 ${className}`}>{children}</div>;
}
interface CurlyBraceProps {
  value?: string;
  trailingComma?: boolean;
  children?: React.ReactNode;
}

const CURLY_OPEN = String.fromCharCode(123);
const CURLY_CLOSE = String.fromCharCode(125);

function CurlyBrace({
  value,
  trailingComma = false,
  children,
}: CurlyBraceProps) {
  return (
    <Indent>
      {value} <span>{CURLY_OPEN}</span>
      {children}
      <span>{CURLY_CLOSE}</span>
      {trailingComma ? "," : ""}
    </Indent>
  );
}

interface ColorLineItemprops {
  color: Color;
  editable?: boolean;
  focus?: boolean;
  handleRename?: (color: Color, name: string) => void;
}
function ColorLineItem({
  color,
  editable = false,
  focus = false,
  handleRename,
}: ColorLineItemprops) {
  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    if (event.key === "Enter") {
      handleRename!(color, newValue);
    }
  };
  const renameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus && renameInput && renameInput.current)
      renameInput.current!.focus();
  }, [focus]);

  const nameView = editable ? (
    <>
      <input
        className="py-1 px-4 text-gray-900"
        type="text"
        placeholder="color name"
        onKeyUp={handleKeyUp}
        ref={renameInput}
      />
      &nbsp;:&nbsp;
    </>
  ) : (
    <span>"{color.name}":&nbsp;</span>
  );

  return (
    <Indent className="flex items-center">
      {nameView}
      <span style={{ backgroundColor: color.value }} className="w-3 h-3" />
      <span>&nbsp;"{color.value}",</span>
    </Indent>
  );
}

interface ColorsProps {
  colors: Color[];
  handleRenameColor: (color: Color, name: string) => void;
  edit?: Color | undefined;
  focus: boolean;
}
function Colors({ colors, handleRenameColor, edit, focus }: ColorsProps) {
  return (
    <>
      {colors.map((color) =>
        color === edit ? (
          <ColorLineItem
            color={color}
            key={color.value}
            editable={true}
            handleRename={handleRenameColor}
            focus={focus}
          />
        ) : (
          <ColorLineItem key={color.value} color={color} />
        )
      )}
    </>
  );
}

interface GroupProps {
  group: string;
  colors: Color[];
  handleRenameColorInGroup: (group: string, color: Color, name: string) => void;
  edit?: Color;
  focus: boolean;
}
function Group({
  group,
  colors,
  handleRenameColorInGroup,
  edit,
  focus,
}: GroupProps) {
  return colors.length === 0 ? (
    <CurlyBrace value={`"${group}"`} trailingComma={true} />
  ) : (
    <CurlyBrace value={`"${group}"`} trailingComma={true}>
      <Colors
        colors={colors}
        handleRenameColor={(color, name) =>
          handleRenameColorInGroup(group, color, name)
        }
        edit={edit}
        focus={focus}
      />
    </CurlyBrace>
  );
}

interface Editable {
  idx: number;
  color: Color;
}

interface TailwindViewerProps {
  colorTheme: ColorTheme;
  handleRenameColor: (color: Color, name: string) => void;
  handleRenameColorInGroup: (group: string, Color: Color, name: string) => void;
  hasFocus: boolean;
}
function TailwindViewer({
  colorTheme,
  handleRenameColor,
  handleRenameColorInGroup,
  hasFocus,
}: TailwindViewerProps) {
  const [editable, setEditable] = useState<Editable>({
    idx: 0,
    color: toColorList(colorTheme)[0],
  });
  const [moveEditable, setMoveEditable] = useState(false);

  useEffect(() => {
    if (moveEditable) {
      setMoveEditable(false);
      setEditable((prevState) => {
        const colors = toColorList(colorTheme);
        const nextIdx =
          colors[prevState.idx].name === colors[prevState.idx].value &&
          prevState.color !== colors[prevState.idx]
            ? prevState.idx
            : (prevState.idx + 1) % colors.length;
        return { idx: nextIdx, color: colors[nextIdx] };
      });
    }
  }, [colorTheme, moveEditable]);

  const handleRenameColorLocal = (color: Color, name: string) => {
    setMoveEditable(true);
    // continuation call
    if (name.trim().length > 0) handleRenameColor(color, name);
  };

  const handleRenameColorInGroupLocal = (
    group: string,
    color: Color,
    name: string
  ) => {
    setMoveEditable(true);
    // continuation call
    if (name.trim().length > 0) handleRenameColorInGroup(group, color, name);
  };

  const groupItems = (
    <>
      {Array.from(colorTheme.groups.keys()).map((name, i) => (
        <Group
          key={i}
          group={name}
          colors={Array.from(colorTheme.groups.get(name)!)}
          handleRenameColorInGroup={handleRenameColorInGroupLocal}
          edit={editable.color}
          focus={hasFocus}
        />
      ))}
    </>
  );

  return (
    <div className="bg-slate-800 text-blue-300 p-4 mb-8 font-mono">
      <CurlyBrace>
        <CurlyBrace value='"theme:"'>
          <CurlyBrace value='"colors:"'>
            {groupItems}
            <Colors
              colors={Array.from(colorTheme.colors).map((item) => item.color)}
              handleRenameColor={handleRenameColorLocal}
              edit={editable.color}
              focus={hasFocus}
            />
          </CurlyBrace>
        </CurlyBrace>
      </CurlyBrace>
    </div>
  );
}

function App() {
  const [unparsed, setUnparsed] = useState<UnparsedColorPalette>(
    makeUnparsedColorPalette()
  );

  const [colorTheme, setColorTheme] = useState<ColorTheme>({
    groups: new Map<string, Set<Color>>(),
    colors: new Set<ColorState>(),
  });

  const [focusEditor, setFocusEditor] = useState(true);

  const clickRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        clickRef &&
        clickRef.current &&
        !clickRef.current.contains(event.target as Node)
      ) {
        setFocusEditor(false);
      } else {
        setFocusEditor(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  const handleClearColorThemeInput = () =>
    setUnparsed(makeUnparsedColorPalette());
  // setColorThemeInput({ groupsTextValue: "", colorsTextValue: "" });

  const handlePopulateFromExample = () =>
    setUnparsed(
      makeUnparsedColorPalette(exampleColorGroups, exampleColorValues)
    );

  const handleUpdateColorTheme = (unparsed: UnparsedColorPalette) => {
    const { classNames: groupsTextValue, colors: colorsTextValue } = unparsed;
    setColorTheme({
      groups: new Map(
        parseGroups(groupsTextValue).map((group) => [group, new Set()])
      ),
      colors: new Set(parseColors(colorsTextValue).map(createColorState)),
    });
  };

  const reloadButtonClassName = isUnparsedEmpty(unparsed)
    ? "text-gray-400 hover:text-gray-600 bg-slate-200 hover:bg-slate-400 cursor-not-allowed"
    : "text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400";

  const handleColorSelection = (color: ColorState) => {
    setColorTheme((prevState) => {
      const newColors = Array.from(prevState.colors).map((item) => {
        if (item.color.value === color.color.value) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
      return { ...prevState, colors: new Set(newColors) };
    });
  };

  const handleGrouping = (group: string) => {
    setColorTheme((prevState) => {
      const selectedColorValues = Array.from(prevState.colors)
        .filter((color) => color.selected)
        .map((color) => color.color);
      if (selectedColorValues.length === 0) {
        return prevState;
      }
      const colorValuesInGroup = Array.from(prevState.groups.get(group)!);
      const newGroups = new Map(
        prevState.groups.set(
          group,
          new Set([...colorValuesInGroup, ...selectedColorValues])
        )
      );
      const newColors = new Set(
        Array.from(prevState.colors).filter((color) => !color.selected)
      );
      return { groups: newGroups, colors: newColors };
    });
  };

  const handleRenameColor = (color: Color, name: string) => {
    setColorTheme((prevState) => {
      const newColors = new Set(
        Array.from(prevState.colors)
          .map((colorState) => {
            if (colorState.color === color) {
              return {
                ...colorState,
                color: { ...colorState.color, name: name },
              };
            } else {
              return colorState;
            }
          })
          .sort((a, b) => {
            if (a.color.name < b.color.name) {
              return -1;
            }
            if (a.color.name > b.color.name) {
              return 1;
            }
            return 0;
          })
      );
      return { ...prevState, colors: newColors };
    });
  };
  const handleRenameColorInGroup = (
    group: string,
    color: Color,
    name: string
  ) => {
    setColorTheme((prevState) => {
      if (!prevState.groups.has(group)) {
        return prevState;
      }
      const newColors = new Set(
        Array.from(prevState.groups.get(group)!)
          .map((item) => {
            if (item === color) {
              return { ...item, name: name };
            } else {
              return item;
            }
          })
          .sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })
      );
      const newGroups = prevState.groups.set(group, newColors);
      return { ...prevState, groups: newGroups };
    });
  };

  return (
    <div className="m-4">
      <BatchInput batch={unparsed} handleBatchUpdate={setUnparsed}>
        <Button
          disabled={isUnparsedEmpty(unparsed)}
          className={`mr-4 px-12 py-2 font-bold ${reloadButtonClassName}`}
          handleClick={() => handleUpdateColorTheme(unparsed)}
          label="Use Color Groups & Values"
        />
        {isUnparsedEmpty(unparsed) ? (
          <Button
            handleClick={handlePopulateFromExample}
            className="text-blue-600 underline"
            label="Populate Example Color Groups & Values"
          />
        ) : (
          <Button
            handleClick={handleClearColorThemeInput}
            className="text-blue-600 underline"
            label="Clear Color Groups & Values"
          />
        )}
      </BatchInput>
      <div className="flex">
        {isColorThemeEmpty(colorTheme) ? (
          <></>
        ) : (
          <div className="w-1/2 pr-8" ref={clickRef}>
            <ClipboardCopy text={tailwindJSON(colorTheme)} />
            <TailwindViewer
              colorTheme={colorTheme}
              handleRenameColor={handleRenameColor}
              handleRenameColorInGroup={handleRenameColorInGroup}
              hasFocus={focusEditor}
            />
          </div>
        )}
        <div className="w-1/2">
          <div className="flex flex-wrap mb-4">
            {Array.from(colorTheme.groups.entries()).map(([group, _]) => (
              <Button
                key={group}
                handleClick={() => handleGrouping(group)}
                className="mr-2 mb-2 px-4 py-2 font-bold text-green-600 hover:text-green-800 bg-green-200 hover:bg-green-400"
                label={group}
              />
            ))}
          </div>
          <div className="flex flex-wrap mb-8">
            {Array.from(colorTheme.colors.entries()).map(([color, _]) => {
              const style: React.CSSProperties = {
                backgroundColor: color.color.value,
              };
              return color.selected ? (
                <div className="w-32 h-32 p-1 mr-2 mb-2 font-xs border-4 border-indigo-600">
                  <Button
                    key={color.color.value}
                    handleClick={() => handleColorSelection(color)}
                    className="h-full w-full truncate opacity-60"
                    label={color.color.value}
                    style={style}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 p-1 mr-2 mb-2 font-xs">
                  <Button
                    key={color.color.value}
                    handleClick={() => handleColorSelection(color)}
                    className="h-full w-full truncate"
                    label={color.color.value}
                    style={style}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;

/**
 * TODO
 * - Update UI to as a 2 step wizard
 *   1. Load Color Group & Values
 *   2. 2-column layout: Editor | Grouping
 * - Parse input color values
 * - Be able to move input up/down using arrow keys
 * - README
 * - Tests
 * - Move cursor up/down using arrow keys
 * - Reproduce bug (faulty cursor jump after renaming first color):
 *    Add first color to `background` group
 *    Add any other colors to otehr groups
 *    Rename first color (default cursor position)
 *    Cursor jumps to first color in first group
 *  - Remove `create-react-app`
 */
