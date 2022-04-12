import { Button } from "./Button";
import { exampleColors, exampleUtilityClassnames } from "./example";
import {
  isUnparsedEmpty,
  makeUnparsedColorPalette,
  UnparsedColorPalette,
} from "./unparsed";

interface TextAreaInputProps {
  label: string;
  text: string;
  handleChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

function TextAreaInput({
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

interface PaletteActionsProps {
  unparsed: UnparsedColorPalette;
  handleUnparsed: React.Dispatch<React.SetStateAction<UnparsedColorPalette>>;
}
function PaletteActions({
  unparsed,
  handleUnparsed: handleInput,
}: PaletteActionsProps) {
  const reloadButtonClassName = isUnparsedEmpty(unparsed)
    ? "text-gray-400 hover:text-gray-600 bg-slate-200 hover:bg-slate-400 cursor-not-allowed"
    : "text-red-600 hover:text-red-800 bg-red-200 hover:bg-red-400";

  const handleClearPaletteInput = () => handleInput(makeUnparsedColorPalette());

  const handleUseExample = () =>
    handleInput(
      makeUnparsedColorPalette(exampleUtilityClassnames, exampleColors)
    );

  return (
    <>
      <Button
        disabled={isUnparsedEmpty(unparsed)}
        className={`mr-4 px-12 py-2 font-bold ${reloadButtonClassName}`}
        handleClick={() => {}}
        label="Load"
      />
      {isUnparsedEmpty(unparsed) ? (
        <Button
          handleClick={handleUseExample}
          className="text-blue-600 underline"
          label="Load Example"
        />
      ) : (
        <Button
          handleClick={handleClearPaletteInput}
          className="text-blue-600 underline"
          label="Clear"
        />
      )}
    </>
  );
}

interface PaletteInputProps {
  unparsed: UnparsedColorPalette;
  handleUnparsed: React.Dispatch<React.SetStateAction<UnparsedColorPalette>>;
}

export function PaletteInput({ unparsed, handleUnparsed }: PaletteInputProps) {
  const handleClassnames = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newClassnames = event.currentTarget.value;
    handleUnparsed((unparsed) => ({
      ...unparsed,
      classNames: newClassnames,
    }));
  };
  const handleColors = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newColors = event.currentTarget.value;
    handleUnparsed((unparsed) => ({
      ...unparsed,
      colors: newColors,
    }));
  };

  return (
    <div className="mb-8">
      <div className="block sm:flex">
        <TextAreaInput
          className="w-full mr-1 mb-2"
          label="Utility Classes"
          text={unparsed.classNames}
          handleChange={handleClassnames}
        />
        <TextAreaInput
          className="w-full mb-2"
          label="Colors"
          text={unparsed.colors}
          handleChange={handleColors}
        />
      </div>
      <div className="flex">
        <PaletteActions unparsed={unparsed} handleUnparsed={handleUnparsed} />
      </div>
    </div>
  );
}
