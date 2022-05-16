import React from "react";

interface GroupButtonProps {
  groupName: string;
  disabled: boolean;
  handleClick: (groupName: string) => void;
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
    <button
      disabled={disabled}
      className={className}
      onClick={(_event) => handleClick(groupName)}
    >
      {groupName}
    </button>
  );
}
