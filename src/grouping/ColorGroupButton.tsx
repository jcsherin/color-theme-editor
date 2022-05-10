import React from "react";

interface ColorGroupButtonProps {
  groupName: string;
  disabled: boolean;
  handleClick: (_event: React.MouseEvent) => void;
}

interface ClassNameProps {
  className: string;
}

export function ColorGroupButton({
  groupName,
  disabled,
  className,
  handleClick,
}: ColorGroupButtonProps & ClassNameProps) {
  return (
    <button disabled={disabled} className={className} onClick={handleClick}>
      {groupName}
    </button>
  );
}
