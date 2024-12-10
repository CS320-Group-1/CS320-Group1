import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { socket } from "@src/socket";

import { Boat } from "@models/Boat";
import { Breadcrumb } from "@src/models/Breadcrumb";
import { EventResponse } from "@models/EventResponse";
import { Regatta } from "@models/Regatta";

import AppLayout from "@templates/AppLayout";
import { Button } from "@nextui-org/button";
import PageSpinner from "@src/components/atoms/PageSpinner";
import StaticCard from "@atoms/cards/StaticCard";

import EditBoatModal from "@molecules/modals/EditBoatModal";
import ConfirmationModal from "@molecules/modals/ConfirmationModal";

export default function BoatView() {
  const { regattaId, boatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [boat, setBoat] = useState<Boat | null>(null);
  const [regatta, setRegatta] = useState<Regatta | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({ regatta: true, boat: true });
  const { user } = useAuth0();

  useEffect(() => {
    socket.emit("getRegattaById", regattaId, (res) => {
      if (res.error) {
        console.error("Failed to fetch regatta:", res.error);
      } else {
        setRegatta(res.data.regatta);
        setIsLoading((prev) => ({ ...prev, regatta: false }));
      }
    });

    if (location.state?.boat) {
      setBoat(location.state.boat);
      setIsLoading((prev) => ({ ...prev, boat: false }));
    } else if (boatId && regattaId) {
      socket.emit("getBoatById", boatId, (res) => {
        if (res.error) {
          console.error("Failed to fetch boat:", res.error);
        } else {
          setBoat(res.data.boat || null);
          setIsLoading((prev) => ({ ...prev, boat: false }));
        }
      });
    }
  }, [boatId, regattaId, location.state]);

  const updateBoat = (data: {
    name: string;
    registrationId: string;
    participantNames: string[];
  }) => {
    const updatedBoat = {
      boatId: boatId,
      name: data.name,
      registrationId: data.registrationId,
      participantNames: data.participantNames,
    };

    socket.emit("updateBoat", updatedBoat, (res) => {
      if (res.error) {
        console.error("Failed to update boat:", res.error);
      } else {
        console.log("Boat updated successfully", res.data);
        setBoat(res.data);
      }
    });
  };

  const deleteBoat = () => {
    socket.emit("deleteBoat", boatId, (res: EventResponse) => {
      if (res.error) {
        console.error("Failed to delete boat:", res.error);
      } else {
        console.log("Boat deleted successfully");
        navigate(`/regatta/${regattaId}`);
      }
    });
  };

  if (!boat || !regatta) return <PageSpinner />;

  const data = [
    { key: "Regatta", value: regatta.name },
    { key: "Name", value: boat.name },
    { key: "Participants", value: boat.participantNames.join(", ") },
    { key: "Registration ID", value: boat.registrationId },
  ];

  const breadcrumbs: Breadcrumb[] = [
    { name: "Home", href: "/home" },
    { name: regatta.name, href: `/regatta/${regattaId}` },
    { name: boat.name! },
  ];

  const isRegattaAdmin = user?.sub === regatta.adminId;

  return (
    <AppLayout
      isLoading={isLoading.regatta || isLoading.boat}
      title={boat.name}
      subtitle="boat"
      breadcrumbs={breadcrumbs}
    >
      <StaticCard title="details" className="flex flex-col">
        <ul className="grow">
          {data.map((e, i) => (
            <li key={i}>
              <span className="font-bold">{e.key}: </span>
              {e.value}
            </li>
          ))}
        </ul>
      </StaticCard>
      {isRegattaAdmin && (
        <div className="self-end flex items-center gap-2">
          <Button color="danger" onClick={() => setDeleteModalOpen(true)}>
            Delete Boat
          </Button>
          <Button color="primary" onClick={() => setEditModalOpen(true)}>
            Edit Boat
          </Button>
        </div>
      )}

      <EditBoatModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={updateBoat}
        boat={boat}
        existingParticipants={boat.participantNames}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        message="Are you sure you want to delete this boat?"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteBoat}
      />
    </AppLayout>
  );
}
