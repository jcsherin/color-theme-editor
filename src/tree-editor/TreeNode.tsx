import React from "react";

export function TreeNode({
  contents,
  children,
}: {
  contents: string;
  children?: React.ReactNode;
}) {
  return children ? (
    <div className="my-2">
      <p className="mb-1">{`${contents} {`}</p>
      <div className="ml-4">{children}</div>
      <p>{"}"}</p>
    </div>
  ) : (
    <p className="my-2 h-10">{`${contents} {}`}</p>
  );
}
