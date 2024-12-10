import { useState, useEffect } from "react";

import EditableList from "@atoms/EditableList";
import GenericModal from "@atoms/GenericModal";
import { Input } from "@nextui-org/input";
import PlusButton from "@atoms/icon-buttons/PlusButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    registrationId: string;
    name: string;
    participantNames: string[];
  }) => void;
  existingParticipants?: string[];
  existingRegistrationIds?: string[];
};

export default function CreateBoatModal({
  isOpen,
  onClose,
  onSubmit,
  existingParticipants = [],
  existingRegistrationIds = [],
}: Props) {
  const [data, setData] = useState({
    registrationId: "",
    name: "",
    participantNames: "",
  });
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setData({
        registrationId: "",
        name: "",
        participantNames: "",
      });
      setParticipants([]);
      setParticipantError(null);
      setRegistrationError(null);
      setFormError(null);
    }
  }, [isOpen]);

  const inputChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const addParticipant = () => {
    const newParticipant = data.participantNames.trim();
    if (!newParticipant) {
      setParticipantError("Participant name cannot be empty.");
      return;
    }
    if (
      participants.includes(newParticipant) ||
      existingParticipants.includes(newParticipant)
    ) {
      setParticipantError(
        `Participant "${newParticipant}" was already assigned to a boat.`
      );
      return;
    }
    setParticipants((prev) => [...prev, newParticipant]);
    setData((prev) => ({ ...prev, participantNames: "" }));
    setParticipantError(null);
  };

  const deleteParticipant = (participant: string) => {
    setParticipants((prev) => prev.filter((p) => p !== participant));
  };

  const submit = () => {
    const { registrationId, name } = data;
    if (!registrationId.trim() || !name.trim() || participants.length === 0) {
      setFormError(
        "All fields must be filled out, and at least one participant must be added."
      );
      return;
    }

    if (existingRegistrationIds.includes(registrationId)) {
      setRegistrationError(
        `Registration ID "${registrationId}" was already used.`
      );
      return;
    }

    onSubmit({ registrationId, name, participantNames: participants });
    setData({ registrationId: "", name: "", participantNames: "" });
    setParticipants([]);
    setParticipantError(null);
    setRegistrationError(null);
    setFormError(null);
  };

  if (!isOpen) return null;

  return (
    <GenericModal
      isOpen={isOpen}
      title="Create Boat"
      closeText="Cancel"
      submitText="Submit"
      onClose={onClose}
      onSubmit={submit}
    >
      <Input
        label="Registration ID"
        placeholder="Enter Registration ID"
        value={data.registrationId}
        onChange={(e) => inputChange("registrationId", e.target.value)}
        isRequired
      />
      {registrationError && (
        <p className="text-red-500 text-sm">{registrationError}</p>
      )}
      <Input
        label="Name"
        placeholder="Enter Boat Name"
        value={data.name}
        onChange={(e) => inputChange("name", e.target.value)}
        isRequired
      />
      <div className="mt-4">
        <h2>Participants</h2>
        <div>
          <div className="flex flex-row gap-3 items-center">
            <Input
              label="Participant Name"
              placeholder="Enter Participant Name"
              value={data.participantNames}
              onChange={(e) => inputChange("participantNames", e.target.value)}
              isRequired
            />
            <PlusButton
              ariaLabel="Add participant"
              onClick={addParticipant}
              isDisabled={!data.participantNames.trim()}
            />
          </div>
          {participantError && (
            <p className="text-red-500 text-sm">{participantError}</p>
          )}
        </div>
        <EditableList
          items={participants}
          onDelete={deleteParticipant}
          emptyMessage="No participants yet!"
        />
      </div>
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
    </GenericModal>
  );
}
