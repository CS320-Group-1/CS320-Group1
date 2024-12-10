import { Button } from "@nextui-org/react";
import {renderTime, addTime, linkTime, unLinkTime, deleteTime} from "./timeListUtils.tsx";
import {DNF_CODE, DNS_CODE, UNLINKED_CODE} from "./RaceTimer.tsx";
import {getCounterStr} from "./timeListUtils.tsx";
import { useState } from "react";


export function TimeLinker({boatIds, times, setTimes, linkingIndex, setLinkingIndex, boatDBIds}){
    if(linkingIndex === -1)
        return <></>
    
    const [query, setQuery] = useState("");
    return <>
        <div className="bg-slate-400/50 w-screen h-screen fixed flex items-center justify-center">
            <div className = "p-8 w-[50%] rounded-md bg-white flex flex-col max-h-[80%]">
                <div className = "flex flex-row flex-wrap justify-between">
                    <h1 className="text-2xl">Link Entry</h1>
                    <Button
                        color="danger"
                        size="lg"
                        radius="sm"
                        onPress={() => {
                            setLinkingIndex(-1);
                            }
                        }
                        className="self-end w-32"
                        >Cancel</Button>
                </div> 
                <h1 className="text-1xl m-3"> Time: {getCounterStr(times[linkingIndex][0])}</h1>
                <div className="grow my-5 justify-between p-5 bg-slate-100" > 
                    <input 
                        className={"grow border-none focus:outline-none py-4 pl-6 m-5"}
                        placeholder="Search For Boat ID"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}>
                    </input>
                    <ul className="overflow-y-scroll"> {boatIds.filter((id) => filterBoats(id, query, times)).map(boatId => renderBoat(boatId, setTimes, linkingIndex, setLinkingIndex, boatIds, boatDBIds))} </ul>
                </div>
            </div> 
        </div>
    </>

}

function filterBoats(boatId, query, times){
    if(times.map(time => time[1]).includes(boatId)) return false; 
    if(query.replaceAll(' ', '') == '') return true;
    return boatId.includes(query); 
}

function renderBoat(boatId, setTimes, linkingIndex, setLinkingIndex, boatIds, boatDBIds){
    return <li className="flex flex-row items-center" key = {boatId}>
        <Button
                color="warning"
                size="lg"
                radius="sm"
                onPress={() => {
                    linkTime(linkingIndex, boatId, setTimes, boatIds, boatDBIds);
                    setLinkingIndex(-1);
                    }
                }
                className="self-end w-32 m-6"
                >Select Boat</Button>

        <p>Boat ID: {boatId}</p> 
         

    </li>

}
