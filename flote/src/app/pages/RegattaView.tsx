import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "@src/socket";
import { useAuth0 } from "@auth0/auth0-react";

import { Boat } from "@models/Boat";
import { Race } from "@models/Race";
import { Regatta } from "@models/Regatta";
import { EventResponse } from "@src/models/EventResponse";

import AppLayout from "@templates/AppLayout";
import List from "@atoms/List";
import { useNavigate } from "react-router-dom";
import ResponsiveCard from "@molecules/ResponsiveCard";
import CreateModal from "@atoms/cards/CreateModal";
//for later - import ConfirmationModal from "@atoms/cards/ConfirmationModal";

export default function RegattaView() {
  const { regattaId } = useParams();
  const location = useLocation();
  const { user } = useAuth0();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [regattaName, setRegattaName] = useState<string>("");
  const [races, setRaces] = useState<Race[]>([]);
  const [timekeepers, setTimekeepers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regatta, setRegatta] = useState<Regatta | null>(null);


  const navigate = useNavigate();
  const handleAddRace = () => {
    navigate("/race/create");
  };

  useEffect(() => {
    if (location.state?.regatta?.name) {
      setRegattaName(location.state.regatta.name);
    } else if (regattaId) {
      socket.emit("getRegattaById", regattaId, (res: EventResponse) => {
        if (res.error) {
          console.error("Failed to fetch regatta details:", res.error);
        } else {
          setRegatta(res.data.regatta);
          setRegattaName(res.data.regatta.name);
          setRaces(res.data.races);
          setBoats(res.data.boats);
          setTimekeepers(res.data.regatta.timekeeperIds);
        }
      });
    }
  }, [regattaId, location.state]);

  const isRegattaAdmin = user?.sub === regatta?.adminId;

  const handleCreateBoat = (data: { registrationId: string; name: string; participantNames: string[] }) => {
    const newBoat: Boat = {
      registrationId: data.registrationId,
      name: data.name,
      participantNames: data.participantNames,
      regattaId: regattaId || "",
    };

    socket.emit("addBoats", newBoat, (res: EventResponse) => {
      if (res.error) {
        console.error("Boat addition failed:", res.error);
      } else {
        const addedBoat: Boat = { ...newBoat, _id: res.data.boatId };
        setBoats((prevBoats) => [...prevBoats, addedBoat]);
        setIsModalOpen(false);
      }
    });
  };

  return (
    <AppLayout title={regattaName} subtitle="regatta" className="flex">
      <div className="grow flex flex-col lg:flex-row gap-3">
        <ResponsiveCard title="Boats" onAdd={isRegattaAdmin ? () => setIsModalOpen(true) : undefined}>
          <List ariaLabel="List of boats" itemType="boat" items={boats} />
        </ResponsiveCard>
        <ResponsiveCard title="Races"  onAdd={handleAddRace}>
          <List ariaLabel="List of races" itemType="race" items={races} onAdd={handleAddRace} />
        </ResponsiveCard>
        <ResponsiveCard title="Timekeepers">
          <List ariaLabel="Timekeepers" itemType="timekeeper" items={timekeepers} />
        </ResponsiveCard>
      </div>

      <CreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateBoat}
        existingParticipants={boats.flatMap((boat) => boat.participantNames)}
        existingRegistrationIds={boats.map((boat) => boat.registrationId)}
      />
    </AppLayout>
  );
}