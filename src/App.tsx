import React, { useEffect, useReducer, useState } from "react";
import * as example from "./utils/example";

import { CopyButton } from "./clipboard";
import {
  ColorThemeInput,
  isUnparsedColorThemeEmpty,
  UnparsedColorTheme,
} from "./input";
import { TreeEditor } from "./editor";
import { serializeConfig, reducer, getInitialState, State } from "./state";
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

type WizUI = FormEntryUI | MainUI;

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

function serializeUnparsedColorTheme(unparsedColorTheme: UnparsedColorTheme) {
  return unparsedColorTheme;
}

function serializeState(state: State) {
  return {
    colorDict: Array.from(state.colorDict),
    colorGroupDict: Array.from(state.colorGroupDict),
    colorList: state.colorList,
  };
}

function serializeFormEntryUI(ui: FormEntryUI) {
  return {
    ...ui,
    state: serializeUnparsedColorTheme(ui.state),
  };
}

function serializeMainUI(ui: MainUI) {
  return { ...ui, state: serializeState(ui.state) };
}

function serializeWizUI(ui: FormEntryUI | MainUI) {
  switch (ui.kind) {
    case "formEntry":
      return serializeFormEntryUI(ui);
    case "main":
      return serializeMainUI(ui);
  }
}

function serializeWiz(wiz: Wiz) {
  const start = serializeList(wiz.start, serializeWizUI);
  const current = wiz.current.value.kind;

  return { start, current };
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
