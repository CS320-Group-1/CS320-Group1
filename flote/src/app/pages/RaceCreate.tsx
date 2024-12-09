// import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Boat } from "@models/Boat";
import { EventResponse } from "@models/EventResponse";
import { Race } from "@models/Race";
import { socket } from "@src/socket";

import AppLayout from "@templates/AppLayout";
import Background from "@atoms/Background";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import List from "@atoms/List";
import ResponsiveCard from "@molecules/ResponsiveCard";

export default function RaceCreate() {
  const { regattaId } = useParams();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [raceName, setRaceName] = useState<string>("");
  const [raceId, setRaceId] = useState<string | null>(null);
  // const [regattaId, setRegattaId] = useState<string | null>(null);

  // const { user } = useAuth0();
  const navigate = useNavigate();

  const MockBoat = (): Boat => ({
    registrationId: "12345",
    name: `Sailboat ${boats.length + 1}`,
    participantNames: ["Avery", "Ryan"],
    raceId: raceId || "",
    regattaId: regattaId || "",
  });

  const raceCreationHandler = () => {
    if (!raceName.trim()) return;

    socket.emit(
      "createRace",
      { name: raceName },
      (res: EventResponse) => {
        if (res.error) {
          console.error("Race creation failed:", res.error);
        } else {
          console.log("New race created:", res.data);
          const createdRaceId = res.data.id;
          // const createdRegattaId = res.data.regattaId;
          setRaceId(createdRaceId);
          // setRegattaId(createdRegattaId);

          console.log("Created Race ID:", createdRaceId, "Regatta ID:", createdRegattaId); //

          boats.forEach((boat) => {
            boat.raceId = createdRaceId;
            // boat.regattaId = createdRegattaId;
            boat.regattaId = regattaId;
          });

          boats.forEach((boat) => {
            socket.emit("addBoats", boat, (x: EventResponse) => {
              if (x.error) {
                console.error("Boat addition failed:", x.error);
              } else {
                console.log("Boat successfully added:", x.data);
              }
            });
          });

          navigate(`/regatta/${createdRegattaId}`, {
          // navigate(`/race/${createdRaceId}`, {
          // navigate(`/regatta/${createdRegattaId}/race/${createdRaceId}`, {
            state: { race: res.data, boats: boats },
          });
        }
      }
    );
  };

  const addBoat = () => {
    const newBoat = MockBoat();
    newBoat.raceId = raceId;

    setBoats((prevBoats) => {
      const updatedBoats = [...prevBoats, newBoat];
      console.log("Boat added:", newBoat);
      return updatedBoats;
    });
  };

  return (
    <Background className="flex flex-col items-center justify-between min-h-screen overflow-hidden">
      <AppLayout title="new race" className="flex flex-col gap-3 flex-grow">
        <div className="mx-2 sm:mx-0">
          <Input
            aria-label="Enter Race name"
            value={raceName}
            onChange={(x) => setRaceName(x.target.value)}
            label="race name"
            isRequired
          />
        </div>
        <div className="grow flex flex-col md:flex-row gap-3">
          <ResponsiveCard title="Boats" onAdd={addBoat}>
            <List
              ariaLabel="List of boats"
              itemType="boat"
              items={boats}
              emptyContent="Add boats"
            />
          </ResponsiveCard>
        </div>
        <div className="h-14 mx-2 sm:mx-0">
          <Button
            color="secondary"
            fullWidth
            onClick={raceCreationHandler}
            className="h-full"
          >
            create race
          </Button>
        </div>
      </AppLayout>
    </Background>
  );
}
