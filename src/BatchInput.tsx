import { TextAreaInput } from "./TextAreaInput";
import { UnparsedColorPalette } from "./unparsed";

interface BatchInputProps {
  batch: UnparsedColorPalette;
  handleBatchUpdate: React.Dispatch<React.SetStateAction<UnparsedColorPalette>>;
  children: React.ReactNode;
}

export function BatchInput({
  batch,
  handleBatchUpdate,
  children,
}: BatchInputProps) {
  const handleUpdateGroups = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newGroups = event.currentTarget.value;
    handleBatchUpdate((prev) => ({
      ...prev,
      groupsTextValue: newGroups,
    }));
  };
  const handleUpdateColors = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const newColors = event.currentTarget.value;
    handleBatchUpdate((prev) => ({
      ...prev,
      colorsTextValue: newColors,
    }));
  };

  return (
    <div className="mb-8">
      <div className="block sm:flex">
        <TextAreaInput
          className="w-full mr-1 mb-2"
          label="Color Groups"
          text={batch.classNames}
          handleChange={handleUpdateGroups}
        />
        <TextAreaInput
          className="w-full mb-2"
          label="Color values"
          text={batch.colors}
          handleChange={handleUpdateColors}
        />
      </div>
      <div className="flex">{children}</div>
    </div>
  );
}
