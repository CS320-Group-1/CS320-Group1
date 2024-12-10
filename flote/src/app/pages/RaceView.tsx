import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Breadcrumb } from "@src/models/Breadcrumb";
import { Boat } from "@models/Boat";
import { EventResponse } from "@src/models/EventResponse";
import { Race } from "@src/models/Race";
import { Regatta } from "@src/models/Regatta";
import { socket } from "@src/socket";
import { useAuth0 } from "@auth0/auth0-react";
import AppLayout from "@templates/AppLayout";
import List from "@atoms/List";
import ResponsiveCard from "@molecules/ResponsiveCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@nextui-org/button";
import ConfirmationModal from "@molecules/modals/ConfirmationModal";
import EditRaceModal from "@molecules/modals/EditRaceModal";
import {getCounterStr} from "./RaceTimer/timeListUtils.tsx"; 

export default function RaceView() {
  const { regattaId, raceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth0();
  const [regatta, setRegatta] = useState<Regatta>();
  const [race, setRace] = useState<Race | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [isLoading, setIsLoading] = useState({ regatta: true, race: true });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    socket.emit("getRegattaById", regattaId, (res) => {
      if (res.error) {
        console.error("Failed to fetch regatta:", res.error);
      } else {
        setRegatta(res.data.regatta);
        setRaces(res.data.races);
        setIsLoading((prev) => ({ ...prev, regatta: false }));
      }
    });

    if (location.state?.race) {
      setRace(location.state.race);
      setIsLoading((prev) => ({ ...prev, race: false }));
    } else if (raceId && regattaId) {
      socket.emit("getRaceById", raceId, (res: EventResponse) => {
        if (res.error) {
          console.error("Failed to fetch race details:", res.error);
        } else {
          const { race, boats: fetchedBoats } = res.data;
          setRace(race || null);
          setIsLoading((prev) => ({ ...prev, race: false }));

          fetchedBoats.sort((a: Boat, b: Boat) => {
            if (!a.finishTime) return 1;
            if (!b.finishTime) return -1;
            return (
              new Date(a.finishTime).getTime() -
              new Date(b.finishTime).getTime()
            );
          });
          setBoats(fetchedBoats);
        }
      });
    }
  }, [raceId, regattaId, location.state]);
  
  const participants = boats.flatMap((boat) => boat.participantNames || []);

  const formatTime = (time?: Date | string, boat: boolean) => {
    if (!time) return "No Time Available";
    if(boat){
        time = new Date(time);
        return getCounterStr(time.getTime());
    }

    return new Date(time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const raceStart = formatTime(race?.startTime, false);

  const boatsWithFinishTimes = boats.map((boat) => ({
    ...boat,
    displayName: `${boat.name || "Unnamed Boat"} (${formatTime(boat.finishTime, true)})`,
    }));

  const boatTitles = boatsWithFinishTimes.map(
    (eachBoat) => eachBoat.displayName
  );

  const updateRace = (data: { name: string }) => {
    const updatedRace = {
      raceId: raceId,
      name: data.name,
    };
  
    socket.emit("updateRace", updatedRace, (res) => {
      if (res.error) {
        console.error("Failed to update race:", res.error);
      } else {
        console.log("Race updated successfully", res.data);
        setRace(res.data);
      }
    });
  };

  const deleteRace = () => {
    socket.emit("deleteRace", raceId, (res: EventResponse) => {
      if (res.error) {
        console.error("Failed to delete race:", res.error);
      } else {
        console.log("Race deleted successfully");
        navigate(`/regatta/${regatta?._id}`);
      }
    });
  };

  const isRegattaAdmin = user?.sub === regatta?.adminId;
  const isRegattaTimekeeper =
      Array.isArray(regatta?.timekeeperIds) &&
      user?.sub &&
      regatta.timekeeperIds.includes(user.sub);

      const getStartRaceButton = (rId: string, r: Race | null) => {      
        const canStart = isRegattaAdmin || isRegattaTimekeeper;
      
        if (!canStart) return null;
      
        return (
          <Button
            color="warning"
            onClick={() => navigate(`/RaceTimer/${rId}`)}
          >
            Start Race
          </Button>
        );
      };
    
  const breadcrumbs: Breadcrumb[] = [
    { name: "Home", href: "/home" },
    { name: regatta?.name ?? "regatta", href: `/regatta/${regatta?._id}` },
    { name: race?.name ?? "race" },
  ];

  return (
    <AppLayout
      isLoading={isLoading.regatta || isLoading.race}
      title={race?.name}
      subtitle="race"
      breadcrumbs={breadcrumbs}
    >
      <div className="grow flex flex-col lg:flex-row gap-3">
        <ResponsiveCard title="Race Start Time">
          <p>{raceStart}</p>
        </ResponsiveCard>
        <ResponsiveCard title="Boats in Race">
          <List ariaLabel="List of boats" itemType="race" items={boatTitles} />
        </ResponsiveCard>
        <ResponsiveCard title="Participants in Race">
          <List
            ariaLabel="List of Participants"
            itemType="race"
            items={participants}
          />
        </ResponsiveCard>
      </div>
        {isRegattaAdmin && (
          <div className="self-end flex items-center gap-2">
          {getStartRaceButton(raceId!, race)}
          <Button color="danger" onClick={() => setDeleteModalOpen(true)}>
            Delete Race
          </Button>
          <Button color="primary" onClick={() => setEditModalOpen(true)}>
            Edit Race
          </Button>
          </div>
        )}

      <EditRaceModal
        isOpen={editModalOpen}
        onUpdate={updateRace}
        onClose={() => setEditModalOpen(false)}
        race={race!}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        message="Are you sure you want to delete this race?"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteRace}
      />
    </AppLayout>
    
  );
}


