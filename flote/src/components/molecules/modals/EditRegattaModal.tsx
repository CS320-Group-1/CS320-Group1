import { useState, useEffect } from "react";
import { Regatta } from "@models/Regatta";

import GenericModal from "@atoms/GenericModal";
import { Input } from "@nextui-org/input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: {
    name: string;
  }) => void;
  regatta: Regatta;
};

export default function EditBoatModal({
  isOpen,
  onClose,
  onUpdate,
  regatta,
}: Props) {
  const [data, setData] = useState({
    name: regatta.name || "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setData({
        name: regatta.name || "",
      });
      setFormError(null);
    }
  }, [isOpen, regatta]);

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
      title="Edit Boat"
      closeText="Cancel"
      submitText="Update"
      onClose={onClose}
      onSubmit={submit}
    >
      <Input
        label="Name"
        placeholder="Enter New Regatta Name"
        value={data.name}
        onChange={(e) => inputChange("name", e.target.value)}
        isRequired
      />
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
    </GenericModal>
  );
}
