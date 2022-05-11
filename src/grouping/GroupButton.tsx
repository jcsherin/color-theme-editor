import React from "react";

interface GroupButtonProps {
  groupName: string;
  disabled: boolean;
  handleClick: (_event: React.MouseEvent) => void;
}

interface ClassNameProps {
  className: string;
}

export function GroupButton({
  groupName,
  disabled,
  className,
  handleClick,
}: GroupButtonProps & ClassNameProps) {
  return (
    <button disabled={disabled} className={className} onClick={handleClick}>
      {groupName}
    </button>
  );
}
