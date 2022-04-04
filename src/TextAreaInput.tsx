interface TextAreaInputProps {
  label: string;
  text: string;
  handleChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

export function TextAreaInput({
  label,
  text,
  handleChange,
  className,
}: TextAreaInputProps & { className: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-bold">{label}</p>
      <textarea
        className="w-full bg-slate-100 h-60 p-4 border-2 resize-none"
        placeholder="Enter color group names. One value per line."
        value={text}
        onChange={handleChange}
      ></textarea>
    </div>
  );
}
