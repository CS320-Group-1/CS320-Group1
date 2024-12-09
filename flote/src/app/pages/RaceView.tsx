import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import AppLayout from "@templates/AppLayout";
import List from "@atoms/List";
import ResponsiveCard from "@molecules/ResponsiveCard";
// import StaticCard from "@atoms/cards/StaticCard";

import { Boat } from "@models/Boat";

import { socket } from "@src/socket";
import { EventResponse } from "@src/models/EventResponse";
// import { format } from "date-fns";

export default function RaceView() {
  const { raceId } = useParams();
  const location = useLocation();

  const [raceName, setRaceName] = useState<string>("");
  const [boats, setBoats] = useState<Boat[]>([]);
  const [startTime, setStartTime] = useState<string>("");

  useEffect(() => {
    if (location.state?.race?.name) {
      setRaceName(location.state.race.name);
    } else if (raceId) {
      socket.emit("getRaceById", raceId, (res: EventResponse) => {
        if (res.error) {
          console.error("Failed to fetch race details:", res.error);
        } else {
          console.log("Received response:", res);

          const { race, boats: fetchedBoats } = res.data;
          fetchedBoats.sort((a: Boat, b: Boat) => {
            if (!a.finishTime) return 1;
            if (!b.finishTime) return -1;
            return new Date(a.finishTime).getTime() - new Date(b.finishTime).getTime();
          });

          setRaceName(race.name);
          setBoats(fetchedBoats);
          if (res.data.race.startTime) {
            setStartTime(res.data.race.startTime);
          }
        }
      });
    }
  }, [raceId, location.state]);

  console.log("Current boats:", boats)
  const participants = boats.flatMap((boat) => boat.participantNames || []);

  const formatTime = (time?: Date | string) => {
    if (!time) return "No finish time";
    return new Date(time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const raceStart = formatTime(startTime);

  const boatsWithFinishTimes = boats.map((boat) => ({
    ...boat,
    displayName: `${boat.name || "Unnamed Boat"} (${formatTime(boat.finishTime)})`,
  }));

  console.log("Boats with times: ", boatsWithFinishTimes);

  const boatTitles = boatsWithFinishTimes.map((eachBoat) => eachBoat.displayName);

  return (
    <AppLayout title={raceName} subtitle="race" className="flex">
      <div className="grow flex flex-col lg:flex-row gap-3">
        <ResponsiveCard title="Race Start Time">
          <p>{raceStart}</p>
        </ResponsiveCard>
        <ResponsiveCard title="Boats in Race">
          <List
            ariaLabel="List of boats"
            itemType="race"
            // items={boats}
            items={boatTitles}
          />
        </ResponsiveCard>
        <ResponsiveCard title="Participants in Race">
          <List
            ariaLabel="List of Participants"
            itemType="race"
            items={participants}
          />
        </ResponsiveCard>
      </div>
    </AppLayout>
  );
}