import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "@src/socket";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import { Boat } from "@models/Boat";
import { Breadcrumb } from "@models/Breadcrumb";
import { Race } from "@models/Race";
import { Regatta } from "@models/Regatta";
import { EventResponse } from "@src/models/EventResponse";

import AppLayout from "@templates/AppLayout";
import { Button } from "@nextui-org/button";
import List from "@atoms/List";
import ResponsiveCard from "@molecules/ResponsiveCard";
import CreateBoatModal from "@molecules/modals/CreateBoatModal";
import CreateRaceModal from "@molecules/modals/CreateRaceModal";
import EditTimekeepersModal from "@molecules/modals/EditTimekeepersModal";
import EditRegattaModal from "@molecules/modals/EditRegattaModal";
import ConfirmationModal from "@molecules/modals/ConfirmationModal";

export default function RegattaView() {
  const { regattaId } = useParams();
  const location = useLocation();
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [regattaName, setRegattaName] = useState<string>("");
  const [races, setRaces] = useState<Race[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [timekeepers, setTimekeepers] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState({
    boats: false,
    races: false,
    timekeepers: false,
  });
  const [regatta, setRegatta] = useState<Regatta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.regatta?.name) {
      setRegattaName(location.state.regatta.name);
      setIsLoading(false);
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
          setIsLoading(false);
        }
      });
    }
  }, [regattaId, location.state]);

  const isRegattaAdmin = user?.sub === regatta?.adminId;
  const isRegattaTimekeeper =
    Array.isArray(regatta?.timekeeperIds) &&
    user?.sub &&
    regatta.timekeeperIds.includes(user.sub);

  const handleCreateBoat = (data: {
    registrationId: string;
    name: string;
    participantNames: string[];
  }) => {
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
        setIsModalOpen((m) => ({ ...m, boats: false }));
      }
    });
  };

  const handleCreateRace = (data: { name: string; addedBoats: string[] }) => {
    const selectedBoatIds = data.addedBoats
      .map((boatName) => boats.find((boat) => boat.name === boatName)?._id)
      .filter((id): id is string => id !== undefined);

    const newRace: Race = {
      name: data.name,
      boatIds: selectedBoatIds,
      regattaId: regattaId || "",
    };

    socket.emit("createRace", newRace, (res: EventResponse) => {
      if (res.error) {
        console.error("Race creation failed:", res.error);
      } else {
        const addedRace: Race = { ...newRace, _id: res.data.raceId };
        setRaces((prevRaces) => [...prevRaces, addedRace]);
        setIsModalOpen((m) => ({ ...m, races: false }));
      }
    });
  };

  const deleteRegatta = () => {
    socket.emit("deleteRegatta", regattaId, (res: EventResponse) => {
      if (res.error) {
        console.error("Failed to delete regatta:", res.error);
      } else {
        console.log("Regatta deleted successfully");
        navigate(`/home`);
      }
    });
  };

  const handleUpdateTimekeepers = (data: { timekeeperIds: string[] }) => {
    const regattaId = regatta?._id;
    const timekeeperIds = data.timekeeperIds;

    socket.emit(
      "updateTimekeepers",
      { regattaId, timekeeperIds },
      (res: EventResponse) => {
        if (res.error) {
          console.error("updateTimekeepers failed:", res.error);
        } else {
          setTimekeepers(timekeeperIds);
          setIsModalOpen((m) => ({ ...m, timekeepers: false }));
        }
      }
    );
  };

  const updateRegatta = (data: {
    name: string;
  }) => {
    const updatedBoat = {
      regattaId: regattaId,
      name: data.name,
    };

    socket.emit("updateRegatta", updatedBoat, (res) => {
      if (res.error) {
        console.error("Failed to update regatta:", res.error);
      } else {
        console.log("Regatta updated successfully", res.data);
        setRegatta(res.data);
      }
    });
  };

  const breadcrumbs: Breadcrumb[] = [
    { name: "Home", href: "/home" },
    { name: regatta?.name ?? "regatta" },
  ];

  return (
    <AppLayout
      isLoading={isLoading}
      title={regattaName}
      subtitle="regatta"
      breadcrumbs={breadcrumbs}
    >
      <div className="grow flex flex-col lg:flex-row gap-3">
        <ResponsiveCard
          title="Boats"
          action="add"
          onAction={
            isRegattaAdmin
              ? () => setIsModalOpen((m) => ({ ...m, boats: true }))
              : undefined
          }
        >
          <List ariaLabel="List of boats" itemType="boat" items={boats} />
        </ResponsiveCard>
        <ResponsiveCard
          title="Races"
          action="add"
          onAction={
            isRegattaAdmin || isRegattaTimekeeper
              ? () => setIsModalOpen((m) => ({ ...m, races: true }))
              : undefined
          }
        >
          <List ariaLabel="List of races" itemType="race" items={races} />
        </ResponsiveCard>
        <ResponsiveCard
          title="Timekeepers"
          action="edit"
          onAction={
            isRegattaAdmin
              ? () => setIsModalOpen((m) => ({ ...m, timekeepers: true }))
              : undefined
          }
        >
          <List
            ariaLabel="Timekeepers"
            itemType="timekeeper"
            items={timekeepers}
          />
        </ResponsiveCard>
      </div>
      <div className="mt-3 text-end">
        {isRegattaAdmin && (
          <div>
          <Button color="danger" onClick={() => setDeleteModalOpen(true)}>
            Delete Regatta
          </Button>
          <Button color="primary" onClick={() => setEditModalOpen(true)}>
            Edit Name
          </Button>
          </div>
        )}
      </div>

      <CreateBoatModal
        isOpen={isModalOpen.boats}
        onClose={() => setIsModalOpen((m) => ({ ...m, boats: false }))}
        onSubmit={handleCreateBoat}
        existingParticipants={boats.flatMap((boat) => boat.participantNames)}
        existingRegistrationIds={boats.map((boat) => boat.registrationId)}
      />
      <CreateRaceModal
        isOpen={isModalOpen.races}
        onClose={() => setIsModalOpen((m) => ({ ...m, races: false }))}
        onSubmit={handleCreateRace}
        existingBoats={boats.filter((x) => x.raceId === undefined)
          .map((boat) => boat.name)
          .filter((name): name is string => !!name)}
        existingRaces={races.map((race) => race.name)}
        unavailableBoats={races.flatMap((race) => race.boatIds)}
      />
      <EditTimekeepersModal
        isOpen={isModalOpen.timekeepers}
        onClose={() => setIsModalOpen((m) => ({ ...m, timekeepers: false }))}
        onSubmit={handleUpdateTimekeepers}
        regattaId={regatta?._id}
      />
      <EditRegattaModal
        isOpen={editModalOpen}
        onUpdate={updateRegatta}
        onClose={() => setEditModalOpen(false)}
        regatta={regatta!}
      />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        message="Are you sure you want to delete this regatta?"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteRegatta}
      />
    </AppLayout>
  );
}
