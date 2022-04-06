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
  style,
}: ButtonProps & { className: string; style?: React.CSSProperties }) {
  return (
    <button
      disabled={disabled}
      className={className}
      onClick={handleClick}
      style={style}
    >
      {label}
    </button>
  );
}
