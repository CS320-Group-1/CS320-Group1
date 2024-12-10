import { Button } from "@nextui-org/react";
import {renderTime, addTime, linkTime, unLinkTime, deleteTime} from "./timeListUtils.tsx";
import {DNF_CODE, DNS_CODE, UNLAPPED_CODE} from "./RaceTimer.tsx";
import {startRace, updateEndTime} from "./DBUtils.tsx"; 
export function TimerControls ({setTimes, counter, start, isStopped, pause, resume, reset, boatIds, boatDBIds, raceOver, setRaceOver, raceId }){
    if(raceOver){
        return;
    }
    if(isStopped){
        return(
                <div>
                <Button
                color="primary"
                size="lg"
                radius="sm"
                onPress={() => {start(); startRace(raceId, boatDBIds)}}
                className="self-end w-32 m-6"
                >Start </Button>
                </div>
              )
    }
    return (
            <div>
            <Button
            color="primary"
            size="lg"
            radius="sm"
            onPress={() => {
                pause(); 
                updateEndTime(raceId); 
                setRaceOver((rO)=>true);
            }}
            className="self-end w-32 m-6"
            >End Race </Button>

            <Button
            color="primary"
            size="lg"
            radius="sm"
            onPress={() => addTime(counter, setTimes)}
            className="self-end w-32 m-6"
            >Lap </Button>

            <Button
            color="primary"
            size="lg"
            radius="sm"
            onPress={() => addTime(UNLAPPED_CODE, setTimes)}
            className="self-end w-32 m-6"
            >Lap No Time</Button>

            <Button
            color="primary"
            size="lg"
            radius="sm"
            onPress={() => addTime(DNF_CODE, setTimes)}
            className="self-end w-32 m-6"
            >Mark DNF</Button>


            <Button
            color="primary"
            size="lg"
            radius="sm"
            onPress={() => addTime(DNS_CODE, setTimes)}
            className="self-end w-32 m-6"
            >Mark DNS</Button>

            </div>


            )
}
