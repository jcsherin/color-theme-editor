import React, { useState } from "react";
import "./App.css";
import { tailwindColors } from "./tailwindAllColors";

type ClassNameProp = { className: string };
type ColorProps = { color: string } & ClassNameProp;

function ColorSquare({ color, className }: ColorProps) {
  const style = {
    backgroundColor: color,
  };
  return (
    <div className={className}>
      <div className="w-12 h-12 border-2 mx-auto" style={style}></div>
      <p>{color}</p>
    </div>
  );
}

function App() {
  const limit = 16;
  const listItems = tailwindColors
    .slice(0, limit)
    .map((color) => (
      <ColorSquare
        key={color}
        color={color}
        className="flex-column items-center mr-4"
      />
    ));

  return (
    <div className="m-4">
      <p className="mb-2">
        Showing {listItems.length} of {tailwindColors.length} colors
        remaining...
      </p>
      <div className="flex flex-wrap">{listItems}</div>
    </div>
  );
}

export default App;
