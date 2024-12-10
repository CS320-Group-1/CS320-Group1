import { useState, useEffect } from "react";

import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import EditableList from "@atoms/EditableList";
import GenericModal from "@atoms/GenericModal";
import { Input } from "@nextui-org/input";
import PlusButton from "@atoms/icon-buttons/PlusButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; addedBoats: string[] }) => void;
  existingRaces?: string[];
  existingBoats: string[];
  unavailableBoats: string[];
};

export default function CreateRaceModal({
  isOpen,
  onClose,
  onSubmit,
  existingRaces = [],
  existingBoats = [],
  unavailableBoats = [],
}: Props) {
  const [data, setData] = useState({
    name: "",
    addedBoats: "",
  });
  const [nameError, setNameError] = useState<string | null>(null);
  const [boats, setBoats] = useState<string[]>([]);
  const [boatDuplicateError, setBoatDuplicateError] = useState<string | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setData({
        name: "",
        addedBoats: "",
      });
      setBoats([]);
      setNameError(null);
      setBoatDuplicateError(null);
      setFormError(null);
    }
  }, [isOpen]);

  const inputChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectionChange = (key: React.Key | null) => {
    setData((prev) => ({ ...prev, addedBoats: key!.toString() }));
  };

  const addOneBoat = (boat: string) => {
    if (!boat) return;

    if (boats.includes(boat)) {
      setBoatDuplicateError(
        `Boat "${boat}" is already participating in this race.`
      );
      return;
    }

    setBoats((prev) => [...prev, boat]);
    setBoatDuplicateError(null);
    setData((prev) => ({ ...prev, addedBoats: "" }));
  };

  const deleteBoat = (boat: string) => {
    setBoats((prev) => prev.filter((p) => p !== boat));
  };

  const submit = () => {
    const { name } = data;
    if (!name.trim() || boats.length === 0) {
      setFormError(
        "Race name is required, and at least one boat must be added."
      );
      return;
    }

    if (existingRaces.includes(name)) {
      setNameError(`Race name "${name}" already exists.`);
      return;
    }

    onSubmit({ name, addedBoats: boats });
  };

  if (!isOpen) return null;

  const availableBoats = existingBoats.filter(
    (boat) => !unavailableBoats.includes(boat)
  );

  return (
    <GenericModal
      isOpen={isOpen}
      title="Create Race"
      closeText="Cancel"
      submitText="Submit"
      onClose={onClose}
      onSubmit={submit}
    >
      <Input
        label="Race Name"
        placeholder="Enter Race Name."
        value={data.name}
        onChange={(e) => inputChange("name", e.target.value)}
        isRequired
      />
      {nameError && <p className="text-red-500 text-sm">{nameError}</p>}

      <div className="mt-4">
        <h2>Boats</h2>
        <div>
          <div className="flex flex-row gap-3 items-center">
            <Autocomplete
              label="Add boats"
              selectedKey={data.addedBoats}
              onSelectionChange={handleSelectionChange}
            >
              {availableBoats.map((boat) => (
                <AutocompleteItem key={boat}>{boat}</AutocompleteItem>
              ))}
            </Autocomplete>
            <PlusButton
              onClick={() => addOneBoat(data.addedBoats)}
              isDisabled={!data.addedBoats}
              ariaLabel="Add Boat"
            />
          </div>
          {boatDuplicateError && (
            <p className="text-red-500 text-sm">{boatDuplicateError}</p>
          )}
        </div>
        <EditableList
          items={boats}
          onDelete={deleteBoat}
          emptyMessage="No boats yet!"
        />
      </div>

      {formError && <p className="text-red-500 text-sm">{formError}</p>}
    </GenericModal>
  );
}
