import React from "react";

export function TreeNode({
  contents,
  openMarker,
  closeMarker,
  children,
}: {
  contents: string;
  openMarker: string;
  closeMarker: string;
  children?: React.ReactNode;
}) {
  return children ? (
    <div>
      <p>{`${contents} ${openMarker}`}</p>
      <div className="ml-4">{children}</div>
      <p>{closeMarker}</p>
    </div>
  ) : (
    <p>{`${contents} ${openMarker}${closeMarker}`}</p>
  );
}
