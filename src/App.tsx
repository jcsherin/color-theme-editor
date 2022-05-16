import React, { useEffect, useReducer } from "react";

import {
  createWizard,
  deserializeWizard,
  serializeWizard,
  wizardReducer,
  WizardUI,
} from "./wizard";

function init({ cacheKey }: { cacheKey: string }) {
  const cached = localStorage.getItem(cacheKey);
  return cached
    ? deserializeWizard(JSON.parse(cached))
    : createWizard(
        {
          classnames: "",
          colors: "",
        },
        {
          colorDict: new Map(),
          colorGroupDict: new Map(),
          colorList: [],
        }
      );
}

const cacheKey = "wizard";

export default function App() {
  const [wizard, dispatch] = useReducer(
    wizardReducer,
    { cacheKey: cacheKey },
    init
  );

  useEffect(() => {
    localStorage.setItem(cacheKey, JSON.stringify(serializeWizard(wizard)));
  }, [wizard]);

  return (
    <div className="mx-2 my-8">
      <WizardUI wizard={wizard} dispatch={dispatch} />
    </div>
  );
}
