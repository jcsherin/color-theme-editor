import React from "react";

export function TreeNode({
  contents,
  children,
}: {
  contents: string;
  children?: React.ReactNode;
}) {
  return children ? (
    <div>
      <p>{`${contents} {`}</p>
      <div className="ml-4">{children}</div>
      <p>{"}"}</p>
    </div>
  ) : (
    <p>{`${contents} {}`}</p>
  );
}
