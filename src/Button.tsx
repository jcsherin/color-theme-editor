interface ButtonProps {
  label: string;
  handleClick: () => void;
  disabled?: boolean;
}

export function Button({
  label,
  handleClick,
  disabled,
  className,
}: ButtonProps & { className: string }) {
  return (
    <button disabled={disabled} className={className} onClick={handleClick}>
      {label}
    </button>
  );
}
