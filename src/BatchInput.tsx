import { ColorThemeInputFormat } from "./ColorThemeInputFormat";
import { TextAreaInput } from "./TextAreaInput";

interface BatchInputProps {
  batch: ColorThemeInputFormat;
  handleBatchUpdate: React.Dispatch<
    React.SetStateAction<ColorThemeInputFormat>
  >;
  children: React.ReactNode;
}

export function BatchInput({ batch, handleBatchUpdate, children }: BatchInputProps) {
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
    <div>
      <div className="block sm:flex">
        <TextAreaInput
          className="w-full mr-1 mb-2"
          label="Color Groups"
          text={batch.groupsTextValue}
          handleChange={handleUpdateGroups}
        />
        <TextAreaInput
          className="w-full mb-2"
          label="Color values"
          text={batch.colorsTextValue}
          handleChange={handleUpdateColors}
        />
      </div>
      {children}
    </div>
  );
}
