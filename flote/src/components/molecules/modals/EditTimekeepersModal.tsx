import { useState, useEffect } from "react";

import { EventResponse } from "@models/EventResponse";
import { socket } from "@src/socket";

import EditableList from "@atoms/EditableList";
import GenericModal from "@atoms/GenericModal";
import { Input } from "@nextui-org/input";
import PlusButton from "@atoms/icon-buttons/PlusButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { timekeeperIds: string[] }) => void;
  regattaId?: string;
};

export default function EditTimekeepersModal({
  isOpen,
  onClose,
  onSubmit,
  regattaId,
}: Props) {
  const [data, setData] = useState({ email: "" });
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      socket.emit("getRegattaById", regattaId, (res: EventResponse) => {
        if (res.error) {
          console.error("Failed to fetch regatta:", res.error);
        } else {
          setEmails(res.data.regatta.timekeeperIds);
        }
      });
      setData({ email: "" });
      setError("");
    }
  }, [isOpen, regattaId]);

  const inputChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const addTimekeeper = () => {
    const email = data.email.trim();

    if (!email) setError("Timekeeper email cannot be empty");

    if (emails.includes(email)) {
      setError("Timekeeper is already registered for this regatta");
      return;
    }
    setEmails((prev) => [...prev, email]);
    setData((prev) => ({ ...prev, email: "" }));
    setError("");
  };

  const deleteTimekeeper = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleFormSubmit = () => {
    if (error) return;
    onSubmit({ timekeeperIds: emails });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <GenericModal
      isOpen={isOpen}
      title="Edit Timekeepers"
      closeText="Cancel"
      submitText="Update"
      onClose={onClose}
      onSubmit={handleFormSubmit}
    >
      <div>
        <div className="flex flex-row gap-3 items-center">
          <Input
            label="Email"
            placeholder="Enter your timekeeper's email"
            value={data.email}
            onChange={(e) => inputChange("email", e.target.value)}
            isRequired
          />
          <PlusButton
            ariaLabel="Add timekeeper"
            onClick={addTimekeeper}
            isDisabled={!data.email.trim()}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <EditableList
        items={emails}
        onDelete={deleteTimekeeper}
        emptyMessage="No timekeepers yet!"
      />
    </GenericModal>
  );
}
