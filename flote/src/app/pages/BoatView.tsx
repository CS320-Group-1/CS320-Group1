import { useParams, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "@src/socket";
import { Boat } from "@models/Boat";
import { Regatta } from "@models/Regatta";

import AppLayout from "@templates/AppLayout";
import StaticCard from "@atoms/cards/StaticCard";
import PageSpinner from "@src/components/atoms/PageSpinner";
// import List from "@atoms/List";
// import ResponsiveCard from "@molecules/ResponsiveCard";

import { Button } from "@nextui-org/button";
import { useAuth0 } from "@auth0/auth0-react";
import { EventResponse } from "@models/EventResponse";
import { useNavigate } from "react-router-dom";

import EditModal from "@atoms/cards/EditModal";
import ConfirmationModal from "@atoms/cards/ConfirmationModal";

export default function BoatView() {
  const { regattaId, boatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [boat, setBoat] = useState<Boat | null>(null);
  const [regatta, setRegatta] = useState<Regatta | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { user } = useAuth0();

  useEffect(() => {
    socket.emit("getRegattaById", regattaId, (res) => {
      if (res.error) {
        console.error("Failed to fetch regatta:", res.error);
      } else {
        setRegatta(res.data.regatta);
      }
    });

    if (location.state?.boat) {
      setBoat(location.state.boat);
    } else if (boatId && regattaId) {
      socket.emit("getBoatById", boatId, (res) => {
        if (res.error) {
          console.error("Failed to fetch boat:", res.error);
        } else {
          setBoat(res.data.boat || null);
        }
      });
    }
  }, [boatId]);

  const updateBoat = (data: { name: string; registrationId: string; participantNames: string[] }) => {
    const updatedBoat = {
      boatId: boatId,
      name: data.name,
      registrationId: data.registrationId,
      participantNames: data.participantNames
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

  if (!boat || !regatta) return {PageSpinner};

  const data = [
    {
      key: "Regatta",
      value: (
        <Link to={`/regatta/${regattaId}`} className="text-primary-500 underline">
          {regatta.name}
        </Link>
      ),
    },
    { key: "Name", value: boat.name },
    { key: "Participants", value: boat.participantNames.join(", ") },
    { key: "Registration ID", value: boat.registrationId },
  ];

  const isRegattaAdmin = user?.sub === regatta.adminId;

  return (
    <AppLayout title={boat.name} subtitle="boat">
      <StaticCard title="details">
        <ul>
          {data.map((e, i) => (
            <li key={i}>
              <span className="font-bold">{e.key}: </span>
              {e.value}
            </li>
          ))}
        </ul>
        <ul>
          {isRegattaAdmin && (
          <>
          <center>
            <Button color="primary" onClick={() => setEditModalOpen(true)}>
              Edit Boat
            </Button>
            <h1></h1>
            <Button color="danger" onClick={() => setDeleteModalOpen(true)} className="mt-2">
              Delete Boat
            </Button>
          </center>
          </>
        )}

        </ul>
      </StaticCard>

      <EditModal
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