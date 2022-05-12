import React, { useEffect, useReducer, useState } from "react";
import * as example from "./utils/example";

import { CopyButton } from "./clipboard";
import {
  ColorThemeInput,
  isUnparsedColorThemeEmpty,
  UnparsedColorTheme,
} from "./input";
import { TreeEditor } from "./editor";
import {
  serializeConfig,
  reducer,
  getInitialState,
  State,
  SerializedState,
} from "./state";
import { Wizard, wizardNextStep, wizardPrevStep, makeWizard } from "./wizard";
import { GroupColors } from "./grouping/GroupColors";

interface List<T> {
  value: T;
  prev: List<T> | undefined;
  next: List<T> | undefined;
}

interface FormEntryUI {
  kind: "formEntry";
  state: UnparsedColorTheme;
}

interface MainUI {
  kind: "main";
  state: State;
}

interface MainUISerialized {
  kind: "main";
  state: SerializedState;
}

type WizUI = FormEntryUI | MainUI;
type WizUISerialized = FormEntryUI | MainUISerialized;

interface Wiz {
  start: List<WizUI>;
  current: List<WizUI>;
}

function createFormEntryUI(state: UnparsedColorTheme): FormEntryUI {
  return {
    kind: "formEntry",
    state: state,
  };
}

function createMainUI(state: State): MainUI {
  return {
    kind: "main",
    state: state,
  };
}

function createListEntry<T>(value: T): List<T> {
  return {
    value: value,
    prev: undefined,
    next: undefined,
  };
}

function createWiz(unparsedColorTheme: UnparsedColorTheme, state: State) {
  const firstUI: List<WizUI> = createListEntry(
    createFormEntryUI(unparsedColorTheme)
  );
  const secondUI: List<WizUI> = createListEntry(createMainUI(state));

  firstUI.next = secondUI;
  secondUI.prev = firstUI;

  return {
    start: firstUI,
    current: firstUI,
  };
}

function nextWizUI(wiz: Wiz): Wiz {
  return wiz.current && wiz.current.next
    ? { ...wiz, current: wiz.current.next }
    : wiz;
}

function prevWizUI(wiz: Wiz): Wiz {
  return wiz.current && wiz.current.prev
    ? { ...wiz, current: wiz.current.prev }
    : wiz;
}

function serializeList<T>(entry: List<T>, serializerFn: (value: T) => any) {
  const items = [];
  let item: List<T> | undefined = entry;
  while (item) {
    items.push(serializerFn(item.value));
    item = item.next;
  }
  return items;
}

function deserializeList<T>(
  entries: any[],
  deserializerFn: (value: any) => T
): List<T> | undefined {
  if (entries.length === 0) return;

  const items = entries.map((x) => createListEntry(deserializerFn(x)));
  for (let i = 1; i < items.length; ++i) {
    items[i - 1].next = items[i];
    items[i].prev = items[i - 1];
  }
  return items[0];
}

function serializeState(state: State): SerializedState {
  return {
    colorDict: Array.from(state.colorDict),
    colorGroupDict: Array.from(state.colorGroupDict),
    colorList: state.colorList,
  };
}

function deserializeState(state: SerializedState): State {
  return {
    ...state,
    colorDict: new Map(state.colorDict),
    colorGroupDict: new Map(state.colorGroupDict),
  };
}

function serializeMainUI(ui: MainUI): {
  state: SerializedState;
  kind: "main";
} {
  return { ...ui, state: serializeState(ui.state) };
}

function deserializeMainUI(ui: {
  kind: "main";
  state: SerializedState;
}): MainUI {
  return {
    ...ui,
    state: deserializeState(ui.state),
  };
}

function serializeWizUI(ui: FormEntryUI | MainUI) {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return serializeMainUI(ui);
  }
}

function deserializeWizUI(ui: WizUISerialized): WizUI {
  switch (ui.kind) {
    case "formEntry":
      return ui;
    case "main":
      return deserializeMainUI(ui);
  }
}

function serializeWiz(wiz: Wiz) {
  const start = serializeList(wiz.start, serializeWizUI);
  const current = wiz.current.value.kind;

  return { start, current };
}

function deserializeWiz(obj: {
  start: any[];
  current: "main" | "formEntry";
}): Wiz | undefined {
  const start = deserializeList(obj.start, deserializeWizUI);
  if (!start) return undefined;

  let current: List<WizUI> | undefined = start;
  while (current) {
    if (current.value.kind === obj.current)
      return {
        start: start,
        current: current,
      };
    current = current.next;
  }
}

const wiz = createWiz({ classnames: "", colors: "" }, getInitialState());
const wiz2 = nextWizUI(wiz);
const wiz3 = prevWizUI(wiz);

console.log(wiz);
console.log(serializeWiz(wiz));
console.log(serializeWiz(wiz2));
console.log(serializeWiz(nextWizUI(wiz2)));
console.log(serializeWiz(wiz3));
console.log(serializeWiz(prevWizUI(wiz3)));
console.log(deserializeWiz(serializeWiz(wiz2)));

export default function App() {
  const [wizard, setWizard] = useState<Wizard>(() => {
    const cached = localStorage.getItem("wizard");
    return cached ? JSON.parse(cached) : makeWizard();
  });
  const [unparsedColorTheme, setUnparsedColorTheme] =
    useState<UnparsedColorTheme>(() => {
      const cached = localStorage.getItem("unparsedColorTheme");
      return cached
        ? JSON.parse(cached)
        : {
            classnames: "",
            colors: "",
          };
    });
  const [state, dispatch] = useReducer(reducer, getInitialState());

  useEffect(() => {
    localStorage.setItem("wizard", JSON.stringify(wizard));
    localStorage.setItem(
      "unparsedColorTheme",
      JSON.stringify(unparsedColorTheme)
    );
    localStorage.setItem(
      "state",
      JSON.stringify({
        colorDict: Array.from(state.colorDict),
        colorGroupDict: Array.from(state.colorGroupDict),
        colorList: state.colorList,
      })
    );
  }, [wizard, unparsedColorTheme, state]);

  const handleNextUI = () => {
    setWizard((wizard) => wizardNextStep(wizard));

    dispatch({ kind: "parse", unparsedColorTheme: unparsedColorTheme });
  };
  const handlePrevUI = () => setWizard((wizard) => wizardPrevStep(wizard));

  const handleLoadExample = () =>
    setUnparsedColorTheme({
      classnames: example.groupNames().join("\n"),
      colors: example.colors().join("\n"),
    });

  const handleResetData = () => {
    setUnparsedColorTheme({ classnames: "", colors: "" });
    dispatch({ kind: "reset" });
  };

  const colorThemeInputUI = (
    <>
      <div className="mb-4">
        <button
          onClick={(_e) => handleNextUI()}
          className="mr-4 py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
          disabled={isUnparsedColorThemeEmpty(unparsedColorTheme)}
        >
          Next
        </button>
        {isUnparsedColorThemeEmpty(unparsedColorTheme) ? (
          <button
            onClick={(_e) => handleLoadExample()}
            className="text-blue-500 hover:text-blue-700 text-xl"
          >
            Load Example
          </button>
        ) : (
          <button
            onClick={(_e) => handleResetData()}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            Reset All Values
          </button>
        )}
      </div>
      <ColorThemeInput unparsedColorTheme={unparsedColorTheme} />
    </>
  );
  const colorThemeConfigUI = (
    <>
      <div className="mb-4">
        <button
          onClick={(_e) => handlePrevUI()}
          className="py-1 px-4 text-xl rounded-sm bg-blue-100 hover:bg-blue-300 text-blue-500 hover:text-blue-700"
        >
          Go Back
        </button>
        <CopyButton
          label="Copy To Clipboard"
          content={serializeConfig(state)}
          expiryInMs={2000}
          className=" text-blue-500 hover:text-blue-800 text-xl py-1 px-4"
          flashClassName="text-green-800 text-xl py-1 px-4"
        />
      </div>
      <div className="grid grid-cols-2 mb-4">
        <TreeEditor
          state={state}
          handleRenameColor={(colorId, newName) =>
            dispatch({
              kind: "renameColor",
              colorId: colorId,
              newName: newName,
            })
          }
          handleRemoveFromGroup={(colorId, groupName) =>
            dispatch({
              kind: "removeFromGroup",
              groupName: groupName,
              colorId: colorId,
            })
          }
        />
        <GroupColors
          state={state}
          handleSelection={(selectableItem) =>
            dispatch({
              kind: "toggleStatus",
              selectableItem: selectableItem,
            })
          }
          handleAddToGroup={(groupName) =>
            dispatch({ kind: "addToGroup", groupName: groupName })
          }
        />
      </div>
    </>
  );

  const showUI = (wizard: Wizard) => {
    switch (wizard.steps[wizard.currStep].kind) {
      case "colorThemeInput":
        return colorThemeInputUI;
      case "colorThemeConfig":
        return colorThemeConfigUI;
    }
  };

  return <div className="mx-2 my-8">{showUI(wizard)}</div>;
}
