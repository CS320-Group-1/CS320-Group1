import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Boat } from "@models/Boat";
import { EventResponse } from "@models/EventResponse";
import { Regatta } from "@models/Regatta";
import { socket } from "@src/socket";

import AppLayout from "@templates/AppLayout";
import Background from "@atoms/Background";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import List from "@atoms/List";
import ResponsiveCard from "@molecules/ResponsiveCard";

export default function RegattaCreate() {
  const [timekeepers, setTimekeepers] = useState<Regatta[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [regattaName, setRegattaName] = useState<string>("");
  const [regattaId, setRegattaId] = useState<string | null>(null);

  const { user } = useAuth0();
  const navigate = useNavigate();

  const MockBoat = (): Boat => ({
    registrationId: "12345",
    name: `Sailboat ${boats.length + 1}`,
    participantNames: ["Avery", "Ryan"],
    regattaId: regattaId || "",
  });

  const regattaCreationHandler = () => {
    if (!regattaName.trim()) return;

    socket.emit(
      "createRegatta",
      { name: regattaName, adminId: user?.sub },
      (res: EventResponse) => {
        if (res.error) {
          console.error("Regatta creation failed:", res.error);
        } else {
          console.log("New regatta created:", res.data);
          const createdRegattaId = res.data.id;
          setRegattaId(createdRegattaId);

          boats.forEach((boat) => {
            boat.regattaId = createdRegattaId;
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
            state: { regatta: res.data, boats: boats },
          });
        }
      }
    );
  };

  const addBoat = () => {
    const newBoat = MockBoat();
    newBoat.regattaId = regattaId;

    setBoats((prevBoats) => {
      const updatedBoats = [...prevBoats, newBoat];
      console.log("Boat added:", newBoat);
      return updatedBoats;
    });
  };

  return (
    <Background className="flex flex-col items-center justify-between min-h-screen overflow-hidden">
      <AppLayout title="new regatta" className="flex flex-col gap-3 flex-grow">
        <div className="mx-2 sm:mx-0">
          <Input
            aria-label="Enter Regatta name"
            value={regattaName}
            onChange={(x) => setRegattaName(x.target.value)}
            label="regatta name"
            isRequired
          />
        </div>
        <div className="grow flex flex-col md:flex-row gap-3">
          <ResponsiveCard title="Timekeepers">
            <List
              ariaLabel="List of timekeepers"
              itemType="timekeeper"
              items={timekeepers}
              emptyContent="Add timekeepers"
            />
          </ResponsiveCard>
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
            onClick={regattaCreationHandler}
            className="h-full"
          >
            create regatta
          </Button>
        </div>
      </AppLayout>
    </Background>
  );
}
