import { useState, useEffect } from "react";
import { Race } from "@models/Race";
import GenericModal from "@atoms/GenericModal";
import { Input } from "@nextui-org/input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: {
    name: string;
  }) => void;
  race: Race;
};

export default function EditRaceModal({
  isOpen,
  onClose,
  onUpdate,
  race,
}: Props) {
  const [data, setData] = useState({
    name: race.name || "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setData({
        name: race.name || "",
      });
      setFormError(null);
    }
  }, [isOpen, race]);

  const inputChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    const { name } = data;
    if (!name.trim()) {
      setFormError(
        "All fields must be filled out."
      );
      return;
    }

    onUpdate({
      name,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <GenericModal
      isOpen={isOpen}
      title="Edit Name"
      closeText="Cancel"
      submitText="Change"
      onClose={onClose}
      onSubmit={submit}
    >
      <Input
        label="Name"
        placeholder="Enter Race Name"
        value={data.name}
        onChange={(e) => inputChange("name", e.target.value)}
        isRequired
      />
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
    </GenericModal>
  );
}
